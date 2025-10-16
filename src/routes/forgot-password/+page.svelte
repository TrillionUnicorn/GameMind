<!--
  Forgot Password Page
  Request password reset email
-->
<script lang="ts">
  import { api } from '$lib/api/client';

  let email = '';
  let loading = false;
  let error = '';
  let success = false;

  async function handleSubmit() {
    if (!email) {
      error = 'Please enter your email address';
      return;
    }

    loading = true;
    error = '';

    try {
      await api.resetPassword(email);
      success = true;
    } catch (err: any) {
      error = err.message;
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>Forgot Password - GameMind</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-gray-900 px-4">
  <div class="bg-white/10 p-8 rounded-lg backdrop-blur-lg border border-white/20 w-full max-w-md">
    <!-- Logo -->
    <div class="text-center mb-8">
      <h1 class="text-4xl font-bold text-white mb-2">GameMind</h1>
      <p class="text-white/60">Reset your password</p>
    </div>

    {#if success}
      <!-- Success Message -->
      <div class="bg-green-500/20 border border-green-500 text-green-200 p-4 rounded-lg mb-6">
        <div class="flex items-start">
          <svg class="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
          <div>
            <p class="font-medium">Check your email</p>
            <p class="text-sm mt-1">
              If an account exists with this email, you will receive a password reset link.
            </p>
          </div>
        </div>
      </div>

      <a
        href="/login"
        class="block text-center bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-medium transition-all"
      >
        Back to Login
      </a>
    {:else}
      <!-- Error Message -->
      {#if error}
        <div class="bg-red-500/20 border border-red-500 text-red-200 p-3 rounded mb-4 flex items-start">
          <svg class="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
          <span>{error}</span>
        </div>
      {/if}

      <!-- Form -->
      <form on:submit|preventDefault={handleSubmit}>
        <div class="mb-6">
          <label for="email" class="block text-white mb-2 font-medium">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            bind:value={email}
            required
            autocomplete="email"
            placeholder="you@example.com"
            class="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
            disabled={loading}
          />
          <p class="text-white/40 text-xs mt-2">
            We'll send you a link to reset your password
          </p>
        </div>

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
              Sending...
            </span>
          {:else}
            Send Reset Link
          {/if}
        </button>
      </form>

      <!-- Back to Login -->
      <div class="mt-6 text-center">
        <a href="/login" class="text-white/60 hover:text-white text-sm transition-colors">
          ← Back to login
        </a>
      </div>
    {/if}
  </div>
</div>

