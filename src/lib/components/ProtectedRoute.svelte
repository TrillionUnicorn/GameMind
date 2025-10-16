<!--
  Protected Route Component
  Ensures user is authenticated before showing content
-->
<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { authStore, isAuthenticated, isLoading } from '$lib/stores/auth';

  export let requireTier: 'free' | 'pro' | 'master' | null = null;
  export let requireRole: 'user' | 'admin' | 'moderator' | null = null;
  export let redirectTo = '/login';

  let mounted = false;
  let authorized = false;

  onMount(async () => {
    // Initialize auth if not already done
    await authStore.init();
    mounted = true;
  });

  $: if (mounted && !$isLoading) {
    // Check authentication
    if (!$isAuthenticated) {
      const returnUrl = $page.url.pathname + $page.url.search;
      goto(`${redirectTo}?returnUrl=${encodeURIComponent(returnUrl)}`);
      return;
    }

    // Check tier requirement
    if (requireTier) {
      const tierLevels = { free: 0, pro: 1, master: 2 };
      const userTierLevel = tierLevels[$authStore.user?.tier as keyof typeof tierLevels] || 0;
      const requiredTierLevel = tierLevels[requireTier];

      if (userTierLevel < requiredTierLevel) {
        goto('/pricing');
        return;
      }
    }

    // Check role requirement
    if (requireRole && $authStore.user?.role !== requireRole) {
      goto('/');
      return;
    }

    authorized = true;
  }
</script>

{#if $isLoading}
  <div class="min-h-screen flex items-center justify-center bg-gray-900">
    <div class="text-center">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      <p class="text-white mt-4">Loading...</p>
    </div>
  </div>
{:else if authorized}
  <slot />
{/if}

