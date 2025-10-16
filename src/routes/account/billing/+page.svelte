<!--
  Billing History Page
  View subscription and payment history
-->
<script lang="ts">
  import { onMount } from 'svelte';
  import ProtectedRoute from '$lib/components/ProtectedRoute.svelte';
  import { api, type Subscription } from '$lib/api/client';

  let subscription: Subscription | null = null;
  let loading = true;
  let error = '';
  let managingSubscription = false;

  onMount(async () => {
    await loadSubscription();
  });

  async function loadSubscription() {
    loading = true;
    error = '';

    try {
      const { subscription: sub } = await api.getSubscription();
      subscription = sub;
    } catch (err: any) {
      error = err.message;
    } finally {
      loading = false;
    }
  }

  async function manageSubscription() {
    managingSubscription = true;
    error = '';

    try {
      const { url } = await api.createPortalSession();
      window.location.href = url;
    } catch (err: any) {
      error = err.message;
      managingSubscription = false;
    }
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'canceled': return 'bg-red-500';
      case 'past_due': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  }

  function getTierBadge(tier: string) {
    switch (tier) {
      case 'pro': return '⭐ Pro';
      case 'master': return '👑 Master';
      default: return 'Free';
    }
  }
</script>

<svelte:head>
  <title>Billing - GameMind</title>
</svelte:head>

<ProtectedRoute>
  <div class="min-h-screen bg-gray-900">
    <!-- Header -->
    <div class="bg-white/5 border-b border-white/10">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-3xl font-bold text-white">Billing & Subscription</h1>
            <p class="text-white/60 mt-1">Manage your subscription and view payment history</p>
          </div>
          <a
            href="/account"
            class="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-lg font-medium border border-white/20"
          >
            ← Back to Settings
          </a>
        </div>
      </div>
    </div>

    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {#if loading}
        <!-- Loading State -->
        <div class="flex items-center justify-center py-12">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
        </div>
      {:else if error}
        <!-- Error State -->
        <div class="bg-red-500/20 border border-red-500 text-red-200 p-4 rounded-lg">
          <p class="font-medium">Failed to load billing information</p>
          <p class="text-sm mt-1">{error}</p>
        </div>
      {:else}
        <!-- Current Subscription -->
        <div class="bg-white/10 p-6 rounded-lg border border-white/20 backdrop-blur-lg mb-6">
          <h2 class="text-xl font-bold text-white mb-4">Current Subscription</h2>
          
          {#if subscription}
            <div class="space-y-4">
              <!-- Tier Badge -->
              <div class="flex items-center gap-3">
                <span class="text-3xl font-bold text-white">
                  {getTierBadge(subscription.tier)}
                </span>
                <span class="px-3 py-1 rounded text-sm font-bold {getStatusColor(subscription.status)} text-white uppercase">
                  {subscription.status}
                </span>
              </div>

              <!-- Subscription Details -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p class="text-white/60">Current Period</p>
                  <p class="text-white font-medium">
                    {formatDate(subscription.currentPeriodStart)} - {formatDate(subscription.currentPeriodEnd)}
                  </p>
                </div>

                {#if subscription.cancelAtPeriodEnd}
                  <div>
                    <p class="text-white/60">Cancellation</p>
                    <p class="text-yellow-500 font-medium">
                      Will cancel on {formatDate(subscription.currentPeriodEnd)}
                    </p>
                  </div>
                {/if}

                {#if subscription.canceledAt}
                  <div>
                    <p class="text-white/60">Canceled On</p>
                    <p class="text-red-500 font-medium">
                      {formatDate(subscription.canceledAt)}
                    </p>
                  </div>
                {/if}
              </div>

              <!-- Manage Subscription Button -->
              <div class="pt-4 border-t border-white/10">
                <button
                  onclick={manageSubscription}
                  disabled={managingSubscription}
                  class="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50"
                >
                  {managingSubscription ? 'Opening...' : 'Manage Subscription'}
                </button>
                <p class="text-white/40 text-xs mt-2">
                  Update payment method, cancel subscription, or view invoices
                </p>
              </div>
            </div>
          {:else}
            <!-- No Subscription -->
            <div class="text-center py-8">
              <div class="text-6xl mb-4">💳</div>
              <h3 class="text-2xl font-bold text-white mb-2">No Active Subscription</h3>
              <p class="text-white/60 mb-6">You're currently on the Free tier</p>
              <a
                href="/pricing"
                class="inline-block bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium"
              >
                Upgrade to Premium
              </a>
            </div>
          {/if}
        </div>

        <!-- Features by Tier -->
        <div class="bg-white/10 p-6 rounded-lg border border-white/20 backdrop-blur-lg mb-6">
          <h2 class="text-xl font-bold text-white mb-4">Your Features</h2>
          
          <div class="space-y-3">
            {#if subscription?.tier === 'master'}
              <div class="flex items-center gap-2">
                <svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                <span class="text-white/80">Real-time multiplayer</span>
              </div>
              <div class="flex items-center gap-2">
                <svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                <span class="text-white/80">Tournament participation</span>
              </div>
              <div class="flex items-center gap-2">
                <svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                <span class="text-white/80">Advanced AI training</span>
              </div>
            {/if}

            {#if subscription?.tier === 'pro' || subscription?.tier === 'master'}
              <div class="flex items-center gap-2">
                <svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                <span class="text-white/80">All AI difficulty levels</span>
              </div>
              <div class="flex items-center gap-2">
                <svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                <span class="text-white/80">Unlimited game history</span>
              </div>
              <div class="flex items-center gap-2">
                <svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                <span class="text-white/80">Game analysis & insights</span>
              </div>
            {:else}
              <div class="flex items-center gap-2">
                <svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                <span class="text-white/80">Play against AI (Easy & Medium)</span>
              </div>
              <div class="flex items-center gap-2">
                <svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                <span class="text-white/80">Basic game history (last 10 games)</span>
              </div>
            {/if}
          </div>

          {#if !subscription}
            <div class="mt-6 pt-6 border-t border-white/10">
              <a
                href="/pricing"
                class="text-red-500 hover:text-red-400 font-medium"
              >
                View all premium features →
              </a>
            </div>
          {/if}
        </div>

        <!-- Help Section -->
        <div class="bg-blue-500/10 p-6 rounded-lg border border-blue-500/50">
          <h3 class="text-lg font-bold text-white mb-2">Need Help?</h3>
          <p class="text-white/80 text-sm mb-4">
            If you have questions about billing or need to make changes to your subscription, we're here to help.
          </p>
          <a
            href="/contact"
            class="text-blue-500 hover:text-blue-400 font-medium text-sm"
          >
            Contact Support →
          </a>
        </div>
      {/if}
    </div>
  </div>
</ProtectedRoute>

