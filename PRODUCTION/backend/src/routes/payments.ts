/**
 * Payment Routes
 * Stripe integration for subscriptions and payments
 */

import { Hono } from 'hono';
import { z } from 'zod';
import Stripe from 'stripe';
import { db } from '../db';
import { users, subscriptions, payments } from '../db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth } from '../middleware/auth';
import { getEnv } from '../config/env';
import { BadRequestError, NotFoundError } from '../middleware/error-handler';

const env = getEnv();
const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia',
});

const paymentRoutes = new Hono();

// Validation schemas
const createCheckoutSchema = z.object({
  tier: z.enum(['pro', 'master']),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
});

/**
 * POST /api/payments/create-checkout-session
 * Create Stripe checkout session for subscription
 */
paymentRoutes.post('/create-checkout-session', requireAuth(), async (c) => {
  const currentUser = c.get('user');
  const body = await c.req.json();
  const data = createCheckoutSchema.parse(body);

  // Get user
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, currentUser.id))
    .limit(1);

  if (!user) {
    throw new NotFoundError('User not found');
  }

  // Check if user already has active subscription
  const [existingSub] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, user.id))
    .limit(1);

  if (existingSub && existingSub.status === 'active') {
    throw new BadRequestError('You already have an active subscription');
  }

  // Get price ID based on tier
  const priceId = data.tier === 'pro' ? 
    env.STRIPE_PRICE_PRO : 
    env.STRIPE_PRICE_MASTER;

  // Create or get Stripe customer
  let customerId = existingSub?.stripeCustomerId;
  
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name,
      metadata: {
        userId: user.id.toString(),
        userUuid: user.uuid,
      },
    });
    customerId = customer.id;
  }

  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: data.successUrl || `${env.FRONTEND_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: data.cancelUrl || `${env.FRONTEND_URL}/pricing`,
    metadata: {
      userId: user.id.toString(),
      tier: data.tier,
    },
  });

  return c.json({
    sessionId: session.id,
    url: session.url,
  });
});

/**
 * POST /api/payments/create-portal-session
 * Create Stripe customer portal session
 */
paymentRoutes.post('/create-portal-session', requireAuth(), async (c) => {
  const currentUser = c.get('user');

  const [subscription] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, currentUser.id))
    .limit(1);

  if (!subscription) {
    throw new NotFoundError('No subscription found');
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: subscription.stripeCustomerId,
    return_url: `${env.FRONTEND_URL}/account/subscription`,
  });

  return c.json({
    url: session.url,
  });
});

/**
 * GET /api/payments/subscription
 * Get current user's subscription
 */
paymentRoutes.get('/subscription', requireAuth(), async (c) => {
  const currentUser = c.get('user');

  const [subscription] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, currentUser.id))
    .limit(1);

  if (!subscription) {
    return c.json({
      subscription: null,
    });
  }

  return c.json({
    subscription: {
      tier: subscription.tier,
      status: subscription.status,
      currentPeriodStart: subscription.currentPeriodStart,
      currentPeriodEnd: subscription.currentPeriodEnd,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      canceledAt: subscription.canceledAt,
    },
  });
});

/**
 * POST /api/payments/webhook
 * Handle Stripe webhooks
 */
paymentRoutes.post('/webhook', async (c) => {
  const signature = c.req.header('stripe-signature');
  
  if (!signature) {
    throw new BadRequestError('Missing stripe-signature header');
  }

  const body = await c.req.text();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err: any) {
    throw new BadRequestError(`Webhook signature verification failed: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
      break;

    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
      break;

    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
      break;

    case 'invoice.payment_succeeded':
      await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
      break;

    case 'invoice.payment_failed':
      await handlePaymentFailed(event.data.object as Stripe.Invoice);
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return c.json({ received: true });
});

/**
 * Handle checkout session completed
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = parseInt(session.metadata?.userId || '0');
  const tier = session.metadata?.tier as 'pro' | 'master';

  if (!userId || !tier) {
    console.error('Missing metadata in checkout session');
    return;
  }

  // Get subscription from Stripe
  const stripeSubscription = await stripe.subscriptions.retrieve(
    session.subscription as string
  );

  // Create or update subscription in database
  await db
    .insert(subscriptions)
    .values({
      userId,
      tier,
      status: stripeSubscription.status,
      stripeCustomerId: session.customer as string,
      stripeSubscriptionId: stripeSubscription.id,
      stripePriceId: stripeSubscription.items.data[0].price.id,
      currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
      currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
      cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
    })
    .onConflictDoUpdate({
      target: subscriptions.userId,
      set: {
        tier,
        status: stripeSubscription.status,
        stripeSubscriptionId: stripeSubscription.id,
        stripePriceId: stripeSubscription.items.data[0].price.id,
        currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
        currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
        cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
        updatedAt: new Date(),
      },
    });

  // Update user tier
  await db
    .update(users)
    .set({ tier, updatedAt: new Date() })
    .where(eq(users.id, userId));
}

/**
 * Handle subscription updated
 */
async function handleSubscriptionUpdated(stripeSubscription: Stripe.Subscription) {
  const [subscription] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.stripeSubscriptionId, stripeSubscription.id))
    .limit(1);

  if (!subscription) {
    console.error('Subscription not found:', stripeSubscription.id);
    return;
  }

  await db
    .update(subscriptions)
    .set({
      status: stripeSubscription.status,
      currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
      currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
      cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
      canceledAt: stripeSubscription.canceled_at ? 
        new Date(stripeSubscription.canceled_at * 1000) : null,
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.id, subscription.id));
}

/**
 * Handle subscription deleted
 */
async function handleSubscriptionDeleted(stripeSubscription: Stripe.Subscription) {
  const [subscription] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.stripeSubscriptionId, stripeSubscription.id))
    .limit(1);

  if (!subscription) {
    console.error('Subscription not found:', stripeSubscription.id);
    return;
  }

  // Update subscription status
  await db
    .update(subscriptions)
    .set({
      status: 'canceled',
      canceledAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.id, subscription.id));

  // Downgrade user to free tier
  await db
    .update(users)
    .set({ tier: 'free', updatedAt: new Date() })
    .where(eq(users.id, subscription.userId));
}

/**
 * Handle payment succeeded
 */
async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription as string;

  const [subscription] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.stripeSubscriptionId, subscriptionId))
    .limit(1);

  if (!subscription) {
    console.error('Subscription not found:', subscriptionId);
    return;
  }

  // Record payment
  await db.insert(payments).values({
    userId: subscription.userId,
    subscriptionId: subscription.id,
    stripePaymentIntentId: invoice.payment_intent as string,
    amount: (invoice.amount_paid / 100).toString(),
    currency: invoice.currency,
    status: 'succeeded',
    description: invoice.description || 'Subscription payment',
    receiptUrl: invoice.hosted_invoice_url,
  });
}

/**
 * Handle payment failed
 */
async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription as string;

  const [subscription] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.stripeSubscriptionId, subscriptionId))
    .limit(1);

  if (!subscription) {
    console.error('Subscription not found:', subscriptionId);
    return;
  }

  // Update subscription status
  await db
    .update(subscriptions)
    .set({
      status: 'past_due',
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.id, subscription.id));

  // TODO: Send email notification to user
}

export default paymentRoutes;

