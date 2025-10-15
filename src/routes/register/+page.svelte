<!--
  Registration Page
  Production-ready registration with backend integration
-->
<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { authStore, isAuthenticated } from '$lib/stores/auth';

  let email = '';
  let password = '';
  let confirmPassword = '';
  let name = '';
  let username = '';
  let error = '';
  let success = false;
  let loading = false;

  // Password strength
  let passwordStrength = 0;
  $: {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    passwordStrength = strength;
  }

  onMount(async () => {
    // Initialize auth
    await authStore.init();

    // If already authenticated, redirect
    if ($isAuthenticated) {
      goto('/dashboard');
    }
  });

  async function handleRegister() {
    // Validation
    if (!email || !password || !name) {
      error = 'Please fill in all required fields';
      return;
    }

    if (password.length < 8) {
      error = 'Password must be at least 8 characters';
      return;
    }

    if (password !== confirmPassword) {
      error = 'Passwords do not match';
      return;
    }

    if (username && !/^[a-zA-Z0-9_]+$/.test(username)) {
      error = 'Username can only contain letters, numbers, and underscores';
      return;
    }

    loading = true;
    error = '';

    const result = await authStore.register(email, password, name, username || undefined);

    if (result.success) {
      success = true;
      // Redirect to login after 3 seconds
      setTimeout(() => {
        goto('/login');
      }, 3000);
    } else {
      error = result.error || 'Registration failed';
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>Register - GameMind</title>
  <meta name="description" content="Create your GameMind account" />
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-gray-900 px-4 py-12">
  <div class="bg-white/10 p-8 rounded-lg backdrop-blur-lg border border-white/20 w-full max-w-md">
    <!-- Logo -->
    <div class="text-center mb-8">
      <h1 class="text-4xl font-bold text-white mb-2">GameMind</h1>
      <p class="text-white/60">Create your account</p>
    </div>

    {#if success}
      <!-- Success Message -->
      <div class="bg-green-500/20 border border-green-500 text-green-200 p-4 rounded-lg mb-4">
        <div class="flex items-start">
          <svg class="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
          <div>
            <p class="font-medium">Registration successful!</p>
            <p class="text-sm mt-1">Please check your email to verify your account. Redirecting to login...</p>
          </div>
        </div>
      </div>
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

      <!-- Registration Form -->
      <form on:submit|preventDefault={handleRegister}>
        <!-- Name -->
        <div class="mb-4">
          <label for="name" class="block text-white mb-2 font-medium">
            Full Name <span class="text-red-500">*</span>
          </label>
          <input
            id="name"
            type="text"
            bind:value={name}
            required
            autocomplete="name"
            placeholder="John Doe"
            class="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
            disabled={loading}
          />
        </div>

        <!-- Email -->
        <div class="mb-4">
          <label for="email" class="block text-white mb-2 font-medium">
            Email <span class="text-red-500">*</span>
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
        </div>

        <!-- Username (Optional) -->
        <div class="mb-4">
          <label for="username" class="block text-white mb-2 font-medium">
            Username <span class="text-white/40 text-sm">(optional)</span>
          </label>
          <input
            id="username"
            type="text"
            bind:value={username}
            autocomplete="username"
            placeholder="johndoe"
            pattern="[a-zA-Z0-9_]+"
            class="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
            disabled={loading}
          />
          <p class="text-white/40 text-xs mt-1">Letters, numbers, and underscores only</p>
        </div>

        <!-- Password -->
        <div class="mb-4">
          <label for="password" class="block text-white mb-2 font-medium">
            Password <span class="text-red-500">*</span>
          </label>
          <input
            id="password"
            type="password"
            bind:value={password}
            required
            autocomplete="new-password"
            placeholder="••••••••"
            minlength="8"
            class="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
            disabled={loading}
          />
          
          <!-- Password Strength Indicator -->
          {#if password}
            <div class="mt-2">
              <div class="flex gap-1">
                {#each Array(5) as _, i}
                  <div class="h-1 flex-1 rounded-full {i < passwordStrength ? (passwordStrength <= 2 ? 'bg-red-500' : passwordStrength <= 3 ? 'bg-yellow-500' : 'bg-green-500') : 'bg-white/20'}"></div>
                {/each}
              </div>
              <p class="text-xs mt-1 {passwordStrength <= 2 ? 'text-red-400' : passwordStrength <= 3 ? 'text-yellow-400' : 'text-green-400'}">
                {passwordStrength <= 2 ? 'Weak' : passwordStrength <= 3 ? 'Medium' : 'Strong'} password
              </p>
            </div>
          {/if}
        </div>

        <!-- Confirm Password -->
        <div class="mb-6">
          <label for="confirmPassword" class="block text-white mb-2 font-medium">
            Confirm Password <span class="text-red-500">*</span>
          </label>
          <input
            id="confirmPassword"
            type="password"
            bind:value={confirmPassword}
            required
            autocomplete="new-password"
            placeholder="••••••••"
            class="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
            disabled={loading}
          />
          {#if confirmPassword && password !== confirmPassword}
            <p class="text-red-400 text-xs mt-1">Passwords do not match</p>
          {/if}
        </div>

        <!-- Terms -->
        <p class="text-white/60 text-xs mb-6">
          By creating an account, you agree to our
          <a href="/terms" class="text-red-500 hover:text-red-400">Terms of Service</a>
          and
          <a href="/privacy" class="text-red-500 hover:text-red-400">Privacy Policy</a>
        </p>

        <!-- Submit Button -->
        <button
          type="submit"
          disabled={loading || (password && confirmPassword && password !== confirmPassword)}
          class="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
        >
          {#if loading}
            <span class="flex items-center justify-center">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating account...
            </span>
          {:else}
            Create Account
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

      <!-- Login Link -->
      <p class="text-white/60 text-center">
        Already have an account?
        <a href="/login" class="text-red-500 hover:text-red-400 font-medium transition-colors">
          Login
        </a>
      </p>
    {/if}

    <!-- Back to Home -->
    <div class="mt-6 text-center">
      <a href="/" class="text-white/40 hover:text-white/60 text-sm transition-colors">
        ← Back to home
      </a>
    </div>
  </div>
</div>

