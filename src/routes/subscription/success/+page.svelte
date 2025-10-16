<!--
  Subscription Success Page
  Shown after successful Stripe checkout
-->
<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { authStore } from '$lib/stores/auth';

  let sessionId = '';
  let countdown = 5;

  onMount(() => {
    // Get session ID from URL
    sessionId = $page.url.searchParams.get('session_id') || '';

    // Refresh user data to get updated tier
    authStore.init();

    // Countdown redirect
    const interval = setInterval(() => {
      countdown--;
      if (countdown === 0) {
        clearInterval(interval);
        goto('/dashboard');
      }
    }, 1000);

    return () => clearInterval(interval);
  });
</script>

<svelte:head>
  <title>Subscription Successful - GameMind</title>
</svelte:head>

<div class="min-h-screen bg-gray-900 flex items-center justify-center px-4">
  <div class="max-w-md w-full">
    <div class="bg-white/10 p-8 rounded-lg border border-white/20 backdrop-blur-lg text-center">
      <!-- Success Icon -->
      <div class="mb-6">
        <div class="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto">
          <svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>

      <!-- Success Message -->
      <h1 class="text-3xl font-bold text-white mb-4">
        Welcome to Premium!
      </h1>
      <p class="text-white/60 mb-8">
        Your subscription has been activated successfully. You now have access to all premium features.
      </p>

      <!-- Features Unlocked -->
      <div class="bg-white/5 p-6 rounded-lg border border-white/10 mb-8">
        <h2 class="text-lg font-bold text-white mb-4">Features Unlocked:</h2>
        <div class="space-y-2 text-left">
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <span class="text-white/80 text-sm">All AI difficulty levels</span>
          </div>
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <span class="text-white/80 text-sm">Unlimited game history</span>
          </div>
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <span class="text-white/80 text-sm">Game analysis & insights</span>
          </div>
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <span class="text-white/80 text-sm">Priority support</span>
          </div>
        </div>
      </div>

      <!-- Redirect Notice -->
      <p class="text-white/40 text-sm mb-6">
        Redirecting to dashboard in {countdown} seconds...
      </p>

      <!-- Action Buttons -->
      <div class="flex flex-col gap-3">
        <a
          href="/dashboard"
          class="bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-medium transition-all"
        >
          Go to Dashboard
        </a>
        <a
          href="/play"
          class="bg-white/10 hover:bg-white/20 text-white py-3 rounded-lg font-medium border border-white/20 transition-all"
        >
          Start Playing
        </a>
      </div>

      <!-- Session ID (for debugging) -->
      {#if sessionId}
        <p class="text-white/20 text-xs mt-6 font-mono">
          Session: {sessionId.substring(0, 20)}...
        </p>
      {/if}
    </div>
  </div>
</div>

