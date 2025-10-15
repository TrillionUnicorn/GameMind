<!--
  Pricing Page
  Subscription tiers with Stripe checkout integration
-->
<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { isAuthenticated, userTier } from '$lib/stores/auth';
  import { api } from '$lib/api/client';

  let loading = false;
  let error = '';

  const tiers = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for casual players',
      features: [
        'Play against AI (Easy & Medium)',
        'Basic game history (last 10 games)',
        'Standard chess board',
        'Community support',
      ],
      limitations: [
        'No hard difficulty AI',
        'Limited game history',
        'No multiplayer',
        'No tournaments',
      ],
      cta: 'Current Plan',
      tier: 'free',
      highlighted: false,
    },
    {
      name: 'Pro',
      price: '$9.99',
      period: 'per month',
      description: 'For serious players',
      features: [
        'Everything in Free',
        'Play against AI (All difficulties)',
        'Unlimited game history',
        'Game analysis & insights',
        'Custom board themes',
        'Priority support',
        'Ad-free experience',
      ],
      limitations: [],
      cta: 'Upgrade to Pro',
      tier: 'pro',
      highlighted: true,
    },
    {
      name: 'Master',
      price: '$19.99',
      period: 'per month',
      description: 'For competitive players',
      features: [
        'Everything in Pro',
        'Real-time multiplayer',
        'Tournament participation',
        'Advanced AI training',
        'Detailed statistics & analytics',
        'Custom avatars',
        'Exclusive badges',
        'Premium support',
      ],
      limitations: [],
      cta: 'Upgrade to Master',
      tier: 'master',
      highlighted: false,
    },
  ];

  async function handleSubscribe(tier: 'pro' | 'master') {
    if (!$isAuthenticated) {
      goto(`/login?returnUrl=${encodeURIComponent('/pricing')}`);
      return;
    }

    loading = true;
    error = '';

    try {
      const { url } = await api.createCheckoutSession(
        tier,
        `${window.location.origin}/subscription/success`,
        `${window.location.origin}/pricing`
      );

      // Redirect to Stripe checkout
      window.location.href = url;
    } catch (err: any) {
      error = err.message;
      loading = false;
    }
  }

  function isCurrentTier(tier: string) {
    return $userTier === tier;
  }

  function canUpgrade(tier: string) {
    const tierLevels = { free: 0, pro: 1, master: 2 };
    const currentLevel = tierLevels[$userTier as keyof typeof tierLevels] || 0;
    const targetLevel = tierLevels[tier as keyof typeof tierLevels] || 0;
    return targetLevel > currentLevel;
  }
</script>

<svelte:head>
  <title>Pricing - GameMind</title>
  <meta name="description" content="Choose the perfect plan for your gaming needs" />
</svelte:head>

<div class="min-h-screen bg-gray-900">
  <!-- Header -->
  <div class="bg-white/5 border-b border-white/10">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
      <h1 class="text-4xl md:text-5xl font-bold text-white mb-4">
        Choose Your Plan
      </h1>
      <p class="text-xl text-white/60 max-w-2xl mx-auto">
        Unlock your full potential with our premium features
      </p>
    </div>
  </div>

  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <!-- Error Message -->
    {#if error}
      <div class="mb-8 bg-red-500/20 border border-red-500 text-red-200 p-4 rounded-lg max-w-2xl mx-auto">
        <p class="font-medium">Payment Error</p>
        <p class="text-sm mt-1">{error}</p>
      </div>
    {/if}

    <!-- Pricing Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      {#each tiers as tier}
        <div class="bg-white/10 rounded-lg border {tier.highlighted ? 'border-red-500 shadow-lg shadow-red-500/20 scale-105' : 'border-white/20'} backdrop-blur-lg overflow-hidden">
          <!-- Highlighted Badge -->
          {#if tier.highlighted}
            <div class="bg-red-500 text-white text-center py-2 text-sm font-bold">
              MOST POPULAR
            </div>
          {/if}

          <div class="p-8">
            <!-- Tier Name & Price -->
            <div class="text-center mb-6">
              <h3 class="text-2xl font-bold text-white mb-2">{tier.name}</h3>
              <div class="mb-2">
                <span class="text-4xl font-bold text-white">{tier.price}</span>
                <span class="text-white/60 text-sm">/{tier.period}</span>
              </div>
              <p class="text-white/60 text-sm">{tier.description}</p>
            </div>

            <!-- Features -->
            <div class="space-y-3 mb-8">
              {#each tier.features as feature}
                <div class="flex items-start gap-2">
                  <svg class="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                  <span class="text-white/80 text-sm">{feature}</span>
                </div>
              {/each}

              {#each tier.limitations as limitation}
                <div class="flex items-start gap-2">
                  <svg class="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                  </svg>
                  <span class="text-white/40 text-sm line-through">{limitation}</span>
                </div>
              {/each}
            </div>

            <!-- CTA Button -->
            {#if isCurrentTier(tier.tier)}
              <button
                disabled
                class="w-full bg-white/10 text-white py-3 rounded-lg font-medium border border-white/20 cursor-not-allowed"
              >
                Current Plan
              </button>
            {:else if tier.tier === 'free'}
              <a
                href="/register"
                class="block w-full bg-white/10 hover:bg-white/20 text-white py-3 rounded-lg font-medium text-center border border-white/20 transition-all"
              >
                Get Started
              </a>
            {:else if canUpgrade(tier.tier)}
              <button
                onclick={() => handleSubscribe(tier.tier as 'pro' | 'master')}
                disabled={loading}
                class="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-medium disabled:opacity-50 transition-all transform hover:scale-105"
              >
                {loading ? 'Processing...' : tier.cta}
              </button>
            {:else}
              <button
                disabled
                class="w-full bg-white/10 text-white py-3 rounded-lg font-medium border border-white/20 cursor-not-allowed"
              >
                Lower Tier
              </button>
            {/if}
          </div>
        </div>
      {/each}
    </div>

    <!-- FAQ Section -->
    <div class="mt-16 max-w-3xl mx-auto">
      <h2 class="text-3xl font-bold text-white text-center mb-8">
        Frequently Asked Questions
      </h2>

      <div class="space-y-4">
        <details class="bg-white/10 p-6 rounded-lg border border-white/20">
          <summary class="text-white font-medium cursor-pointer">
            Can I cancel my subscription anytime?
          </summary>
          <p class="text-white/60 mt-3 text-sm">
            Yes! You can cancel your subscription at any time. You'll continue to have access to premium features until the end of your billing period.
          </p>
        </details>

        <details class="bg-white/10 p-6 rounded-lg border border-white/20">
          <summary class="text-white font-medium cursor-pointer">
            What payment methods do you accept?
          </summary>
          <p class="text-white/60 mt-3 text-sm">
            We accept all major credit cards (Visa, Mastercard, American Express) through our secure payment processor, Stripe.
          </p>
        </details>

        <details class="bg-white/10 p-6 rounded-lg border border-white/20">
          <summary class="text-white font-medium cursor-pointer">
            Can I upgrade or downgrade my plan?
          </summary>
          <p class="text-white/60 mt-3 text-sm">
            Yes! You can upgrade or downgrade your plan at any time. Changes will be prorated and reflected in your next billing cycle.
          </p>
        </details>

        <details class="bg-white/10 p-6 rounded-lg border border-white/20">
          <summary class="text-white font-medium cursor-pointer">
            Is there a free trial?
          </summary>
          <p class="text-white/60 mt-3 text-sm">
            Our Free tier is available forever with no credit card required. You can upgrade to a paid plan anytime to unlock premium features.
          </p>
        </details>
      </div>
    </div>

    <!-- Back to Home -->
    <div class="mt-12 text-center">
      <a href="/" class="text-white/60 hover:text-white transition-colors">
        ← Back to home
      </a>
    </div>
  </div>
</div>

