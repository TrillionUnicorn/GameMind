<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import Button from './ui/Button.svelte';
	import { isAuthenticated, user, authStore } from '$lib/stores/auth';

	let mobileMenuOpen = $state(false);
	let userMenuOpen = $state(false);

	const navLinks = [
		{ href: '/', label: 'Home' },
		{ href: '/play', label: 'Play Now' },
		{ href: '/pitch', label: 'Pitch Deck' },
		{ href: '/contact', label: 'Contact' }
	];

	onMount(() => {
		authStore.init();
	});

	function toggleMobileMenu() {
		mobileMenuOpen = !mobileMenuOpen;
	}

	function closeMobileMenu() {
		mobileMenuOpen = false;
	}

	function toggleUserMenu() {
		userMenuOpen = !userMenuOpen;
	}

	function closeUserMenu() {
		userMenuOpen = false;
	}

	async function handleLogout() {
		await authStore.logout();
		closeUserMenu();
	}
</script>

<nav class="fixed top-0 left-0 right-0 z-50 glass border-b border-slate-700/50">
	<div class="container mx-auto px-4">
		<div class="flex items-center justify-between h-16">
			<!-- Logo -->
			<a href="/" class="flex items-center space-x-2 text-xl font-bold">
				<span class="text-3xl">🎮</span>
				<span class="gradient-text">GameMind</span>
			</a>

			<!-- Desktop Navigation -->
			<div class="hidden md:flex items-center space-x-8">
				{#each navLinks as link}
					<a
						href={link.href}
						class="text-slate-300 hover:text-white transition-colors duration-200 font-medium {$page
							.url.pathname === link.href
							? 'text-primary-500'
							: ''}"
					>
						{link.label}
					</a>
				{/each}

				{#if $isAuthenticated}
					<!-- User Menu -->
					<div class="relative">
						<button
							onclick={toggleUserMenu}
							class="flex items-center gap-2 text-white hover:text-primary-500 transition-colors"
						>
							<div class="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center font-bold">
								{$user?.name?.charAt(0).toUpperCase() || 'U'}
							</div>
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
							</svg>
						</button>

						{#if userMenuOpen}
							<div class="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg border border-white/20 py-2">
								<div class="px-4 py-2 border-b border-white/10">
									<p class="text-white font-medium">{$user?.name}</p>
									<p class="text-white/60 text-xs">{$user?.email}</p>
								</div>
								<a href="/dashboard" onclick={closeUserMenu} class="block px-4 py-2 text-white hover:bg-white/10">
									Dashboard
								</a>
								<a href="/history" onclick={closeUserMenu} class="block px-4 py-2 text-white hover:bg-white/10">
									Game History
								</a>
								<a href="/account" onclick={closeUserMenu} class="block px-4 py-2 text-white hover:bg-white/10">
									Settings
								</a>
								<a href="/pricing" onclick={closeUserMenu} class="block px-4 py-2 text-white hover:bg-white/10">
									Upgrade
								</a>
								<hr class="my-2 border-white/10" />
								<button onclick={handleLogout} class="block w-full text-left px-4 py-2 text-red-500 hover:bg-white/10">
									Logout
								</button>
							</div>
						{/if}
					</div>
				{:else}
					<a href="/login" class="text-slate-300 hover:text-white transition-colors font-medium">
						Login
					</a>
					<Button variant="primary" size="sm">
						<a href="/register">Sign Up</a>
					</Button>
				{/if}
			</div>

			<!-- Mobile Menu Button -->
			<button
				class="md:hidden text-white p-2"
				onclick={toggleMobileMenu}
				aria-label="Toggle menu"
			>
				{#if mobileMenuOpen}
					<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				{:else}
					<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M4 6h16M4 12h16M4 18h16"
						/>
					</svg>
				{/if}
			</button>
		</div>

		<!-- Mobile Menu -->
		{#if mobileMenuOpen}
			<div class="md:hidden py-4 border-t border-slate-700/50 animate-slide-down">
				{#each navLinks as link}
					<a
						href={link.href}
						class="block py-3 text-slate-300 hover:text-white transition-colors duration-200 {$page
							.url.pathname === link.href
							? 'text-primary-500'
							: ''}"
						onclick={closeMobileMenu}
					>
						{link.label}
					</a>
				{/each}

				{#if $isAuthenticated}
					<div class="pt-4 border-t border-white/10 mt-4">
						<div class="px-4 py-2 mb-2">
							<p class="text-white font-medium">{$user?.name}</p>
							<p class="text-white/60 text-xs">{$user?.email}</p>
						</div>
						<a href="/dashboard" onclick={closeMobileMenu} class="block py-3 text-slate-300 hover:text-white">
							Dashboard
						</a>
						<a href="/history" onclick={closeMobileMenu} class="block py-3 text-slate-300 hover:text-white">
							Game History
						</a>
						<a href="/account" onclick={closeMobileMenu} class="block py-3 text-slate-300 hover:text-white">
							Settings
						</a>
						<a href="/pricing" onclick={closeMobileMenu} class="block py-3 text-slate-300 hover:text-white">
							Upgrade
						</a>
						<button onclick={handleLogout} class="block w-full text-left py-3 text-red-500">
							Logout
						</button>
					</div>
				{:else}
					<div class="pt-4 space-y-2">
						<a href="/login" onclick={closeMobileMenu} class="block py-3 text-slate-300 hover:text-white text-center">
							Login
						</a>
						<Button variant="primary" size="md" class="w-full">
							<a href="/register">Sign Up</a>
						</Button>
					</div>
				{/if}
			</div>
		{/if}
	</div>
</nav>

<!-- Spacer to prevent content from going under fixed nav -->
<div class="h-16"></div>

