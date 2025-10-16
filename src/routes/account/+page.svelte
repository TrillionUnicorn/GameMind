<!--
  Account Settings Page
  User profile management, preferences, and account actions
-->
<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import ProtectedRoute from '$lib/components/ProtectedRoute.svelte';
  import { user, authStore } from '$lib/stores/auth';
  import { api } from '$lib/api/client';

  let loading = true;
  let saving = false;
  let error = '';
  let success = '';

  // Profile data
  let name = '';
  let username = '';
  let email = '';
  let bio = '';
  let country = '';

  // Password change
  let showPasswordChange = false;
  let currentPassword = '';
  let newPassword = '';
  let confirmPassword = '';

  // Preferences
  let emailNotifications = true;
  let pushNotifications = true;
  let publicProfile = true;
  let theme = 'dark';

  // Account deletion
  let showDeleteConfirm = false;
  let deleteConfirmText = '';

  onMount(async () => {
    try {
      const { user: userData, profile } = await api.getUserProfile();
      
      name = userData.name;
      username = userData.username || '';
      email = userData.email;
      bio = profile.bio || '';
      country = profile.country || '';
      
      emailNotifications = profile.emailNotifications ?? true;
      pushNotifications = profile.pushNotifications ?? true;
      publicProfile = profile.publicProfile ?? true;
      theme = profile.theme || 'dark';
    } catch (err: any) {
      error = err.message;
    } finally {
      loading = false;
    }
  });

  async function saveProfile() {
    saving = true;
    error = '';
    success = '';

    try {
      await api.updateProfile({
        name,
        username: username || undefined,
      });

      // Update auth store
      if ($user) {
        authStore.setUser({ ...$user, name, username });
      }

      success = 'Profile updated successfully';
    } catch (err: any) {
      error = err.message;
    } finally {
      saving = false;
    }
  }

  async function savePreferences() {
    saving = true;
    error = '';
    success = '';

    try {
      await api.updatePreferences({
        emailNotifications,
        pushNotifications,
        publicProfile,
      });

      success = 'Preferences updated successfully';
    } catch (err: any) {
      error = err.message;
    } finally {
      saving = false;
    }
  }

  async function changePassword() {
    if (newPassword !== confirmPassword) {
      error = 'Passwords do not match';
      return;
    }

    if (newPassword.length < 8) {
      error = 'Password must be at least 8 characters';
      return;
    }

    saving = true;
    error = '';
    success = '';

    try {
      await api.updatePassword(newPassword);
      
      success = 'Password changed successfully';
      showPasswordChange = false;
      currentPassword = '';
      newPassword = '';
      confirmPassword = '';
    } catch (err: any) {
      error = err.message;
    } finally {
      saving = false;
    }
  }

  async function deleteAccount() {
    if (deleteConfirmText !== 'DELETE') {
      error = 'Please type DELETE to confirm';
      return;
    }

    saving = true;
    error = '';

    try {
      await api.deleteAccount();
      await authStore.logout();
      goto('/');
    } catch (err: any) {
      error = err.message;
      saving = false;
    }
  }
</script>

<svelte:head>
  <title>Account Settings - GameMind</title>
</svelte:head>

<ProtectedRoute>
  <div class="min-h-screen bg-gray-900">
    <!-- Header -->
    <div class="bg-white/5 border-b border-white/10">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 class="text-3xl font-bold text-white">Account Settings</h1>
        <p class="text-white/60 mt-1">Manage your profile and preferences</p>
      </div>
    </div>

    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {#if loading}
        <div class="flex items-center justify-center py-12">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
        </div>
      {:else}
        <!-- Success/Error Messages -->
        {#if success}
          <div class="mb-6 bg-green-500/20 border border-green-500 text-green-200 p-4 rounded-lg">
            {success}
          </div>
        {/if}

        {#if error}
          <div class="mb-6 bg-red-500/20 border border-red-500 text-red-200 p-4 rounded-lg">
            {error}
          </div>
        {/if}

        <!-- Profile Section -->
        <div class="bg-white/10 p-6 rounded-lg border border-white/20 backdrop-blur-lg mb-6">
          <h2 class="text-xl font-bold text-white mb-4">Profile Information</h2>
          
          <div class="space-y-4">
            <div>
              <label class="block text-white mb-2 font-medium">Name</label>
              <input
                type="text"
                bind:value={name}
                class="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white"
                disabled={saving}
              />
            </div>

            <div>
              <label class="block text-white mb-2 font-medium">Username</label>
              <input
                type="text"
                bind:value={username}
                placeholder="Optional"
                class="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white"
                disabled={saving}
              />
            </div>

            <div>
              <label class="block text-white mb-2 font-medium">Email</label>
              <input
                type="email"
                value={email}
                disabled
                class="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white/60 cursor-not-allowed"
              />
              <p class="text-white/40 text-xs mt-1">Email cannot be changed</p>
            </div>

            <button
              onclick={saveProfile}
              disabled={saving}
              class="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </div>

        <!-- Password Section -->
        <div class="bg-white/10 p-6 rounded-lg border border-white/20 backdrop-blur-lg mb-6">
          <h2 class="text-xl font-bold text-white mb-4">Password</h2>
          
          {#if !showPasswordChange}
            <button
              onclick={() => showPasswordChange = true}
              class="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-lg font-medium border border-white/20"
            >
              Change Password
            </button>
          {:else}
            <div class="space-y-4">
              <div>
                <label class="block text-white mb-2 font-medium">New Password</label>
                <input
                  type="password"
                  bind:value={newPassword}
                  class="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white"
                  disabled={saving}
                />
              </div>

              <div>
                <label class="block text-white mb-2 font-medium">Confirm Password</label>
                <input
                  type="password"
                  bind:value={confirmPassword}
                  class="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white"
                  disabled={saving}
                />
              </div>

              <div class="flex gap-3">
                <button
                  onclick={changePassword}
                  disabled={saving}
                  class="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50"
                >
                  {saving ? 'Changing...' : 'Change Password'}
                </button>
                <button
                  onclick={() => showPasswordChange = false}
                  disabled={saving}
                  class="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-lg font-medium border border-white/20"
                >
                  Cancel
                </button>
              </div>
            </div>
          {/if}
        </div>

        <!-- Preferences Section -->
        <div class="bg-white/10 p-6 rounded-lg border border-white/20 backdrop-blur-lg mb-6">
          <h2 class="text-xl font-bold text-white mb-4">Preferences</h2>
          
          <div class="space-y-4">
            <label class="flex items-center justify-between">
              <span class="text-white">Email Notifications</span>
              <input
                type="checkbox"
                bind:checked={emailNotifications}
                class="w-5 h-5"
                disabled={saving}
              />
            </label>

            <label class="flex items-center justify-between">
              <span class="text-white">Push Notifications</span>
              <input
                type="checkbox"
                bind:checked={pushNotifications}
                class="w-5 h-5"
                disabled={saving}
              />
            </label>

            <label class="flex items-center justify-between">
              <span class="text-white">Public Profile</span>
              <input
                type="checkbox"
                bind:checked={publicProfile}
                class="w-5 h-5"
                disabled={saving}
              />
            </label>

            <button
              onclick={savePreferences}
              disabled={saving}
              class="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        </div>

        <!-- Danger Zone -->
        <div class="bg-red-500/10 p-6 rounded-lg border border-red-500/50 backdrop-blur-lg">
          <h2 class="text-xl font-bold text-red-500 mb-4">Danger Zone</h2>
          
          {#if !showDeleteConfirm}
            <button
              onclick={() => showDeleteConfirm = true}
              class="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-medium"
            >
              Delete Account
            </button>
          {:else}
            <div class="space-y-4">
              <p class="text-white">
                This action cannot be undone. This will permanently delete your account and all associated data.
              </p>
              
              <div>
                <label class="block text-white mb-2 font-medium">
                  Type <span class="font-mono bg-white/10 px-2 py-1 rounded">DELETE</span> to confirm
                </label>
                <input
                  type="text"
                  bind:value={deleteConfirmText}
                  class="w-full px-4 py-3 bg-white/5 border border-red-500 rounded-lg text-white"
                  disabled={saving}
                />
              </div>

              <div class="flex gap-3">
                <button
                  onclick={deleteAccount}
                  disabled={saving || deleteConfirmText !== 'DELETE'}
                  class="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50"
                >
                  {saving ? 'Deleting...' : 'Delete Account'}
                </button>
                <button
                  onclick={() => { showDeleteConfirm = false; deleteConfirmText = ''; }}
                  disabled={saving}
                  class="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-lg font-medium border border-white/20"
                >
                  Cancel
                </button>
              </div>
            </div>
          {/if}
        </div>
      {/if}
    </div>
  </div>
</ProtectedRoute>

