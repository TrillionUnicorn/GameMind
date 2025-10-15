<!--
  Login Page
  Production-ready login with backend integration
-->
<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { authStore, isAuthenticated } from '$lib/stores/auth';

  let email = '';
  let password = '';
  let error = '';
  let loading = false;
  let returnUrl = '/dashboard';

  onMount(async () => {
    // Initialize auth
    await authStore.init();

    // If already authenticated, redirect
    if ($isAuthenticated) {
      goto(returnUrl);
      return;
    }

    // Get return URL from query params
    const urlReturnUrl = $page.url.searchParams.get('returnUrl');
    if (urlReturnUrl) {
      returnUrl = urlReturnUrl;
    }
  });

  async function handleLogin() {
    if (!email || !password) {
      error = 'Please fill in all fields';
      return;
    }

    loading = true;
    error = '';

    const result = await authStore.login(email, password);

    if (result.success) {
      goto(returnUrl);
    } else {
      error = result.error || 'Login failed';
      loading = false;
    }
  }

  function handleKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      handleLogin();
    }
  }
</script>

<svelte:head>
  <title>Login - GameMind</title>
  <meta name="description" content="Login to your GameMind account" />
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-gray-900 px-4">
  <div class="bg-white/10 p-8 rounded-lg backdrop-blur-lg border border-white/20 w-full max-w-md">
    <!-- Logo -->
    <div class="text-center mb-8">
      <h1 class="text-4xl font-bold text-white mb-2">GameMind</h1>
      <p class="text-white/60">Welcome back</p>
    </div>

    <!-- Error Message -->
    {#if error}
      <div class="bg-red-500/20 border border-red-500 text-red-200 p-3 rounded mb-4 flex items-start">
        <svg class="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
        </svg>
        <span>{error}</span>
      </div>
    {/if}

    <!-- Login Form -->
    <form on:submit|preventDefault={handleLogin}>
      <!-- Email -->
      <div class="mb-4">
        <label for="email" class="block text-white mb-2 font-medium">
          Email
        </label>
        <input
          id="email"
          type="email"
          bind:value={email}
          on:keypress={handleKeyPress}
          required
          autocomplete="email"
          placeholder="you@example.com"
          class="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
          disabled={loading}
        />
      </div>

      <!-- Password -->
      <div class="mb-6">
        <div class="flex justify-between items-center mb-2">
          <label for="password" class="block text-white font-medium">
            Password
          </label>
          <a href="/forgot-password" class="text-sm text-red-500 hover:text-red-400 transition-colors">
            Forgot password?
          </a>
        </div>
        <input
          id="password"
          type="password"
          bind:value={password}
          on:keypress={handleKeyPress}
          required
          autocomplete="current-password"
          placeholder="••••••••"
          class="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
          disabled={loading}
        />
      </div>

      <!-- Submit Button -->
      <button
        type="submit"
        disabled={loading}
        class="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
      >
        {#if loading}
          <span class="flex items-center justify-center">
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Logging in...
          </span>
        {:else}
          Login
        {/if}
      </button>
    </form>

    <!-- Divider -->
    <div class="relative my-6">
      <div class="absolute inset-0 flex items-center">
        <div class="w-full border-t border-white/20"></div>
      </div>
      <div class="relative flex justify-center text-sm">
        <span class="px-2 bg-gray-900 text-white/60">or</span>
      </div>
    </div>

    <!-- Register Link -->
    <p class="text-white/60 text-center">
      Don't have an account?
      <a href="/register" class="text-red-500 hover:text-red-400 font-medium transition-colors">
        Create one
      </a>
    </p>

    <!-- Back to Home -->
    <div class="mt-6 text-center">
      <a href="/" class="text-white/40 hover:text-white/60 text-sm transition-colors">
        ← Back to home
      </a>
    </div>
  </div>
</div>

<style>
  /* Custom focus styles */
  input:focus {
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
  }
</style>

