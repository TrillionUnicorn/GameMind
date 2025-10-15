<script lang="ts">
	const currentYear = new Date().getFullYear();

	const footerLinks = {
		product: [
			{ label: 'Play Chess', href: '/play?game=chess' },
			{ label: 'Play Mahjong', href: '/play?game=mahjong' },
			{ label: 'Play Go', href: '/play?game=go' },
			{ label: 'Pricing', href: '/#pricing' }
		],
		company: [
			{ label: 'About Us', href: '/#about' },
			{ label: 'Pitch Deck', href: '/pitch' },
			{ label: 'Roadmap', href: '/#roadmap' },
			{ label: 'Contact', href: '/contact' }
		],
		resources: [
			{ label: 'Documentation', href: '/docs' },
			{ label: 'API', href: '/api' },
			{ label: 'Community', href: '/community' },
			{ label: 'Blog', href: '/blog' }
		],
		legal: [
			{ label: 'Privacy Policy', href: '/privacy' },
			{ label: 'Terms of Service', href: '/terms' },
			{ label: 'Cookie Policy', href: '/cookies' },
			{ label: 'Fair Play', href: '/fair-play' }
		]
	};

	const socialLinks = [
		{
			name: 'GitHub',
			href: 'https://github.com/TrillionUnicorn/GameMind',
			icon: 'M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z'
		},
		{
			name: 'Twitter',
			href: 'https://twitter.com/gamemind',
			icon: 'M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z'
		},
		{
			name: 'Discord',
			href: 'https://discord.gg/gamemind',
			icon: 'M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z'
		},
		{
			name: 'LinkedIn',
			href: 'https://linkedin.com/company/gamemind',
			icon: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z'
		}
	];
</script>

<footer class="bg-slate-900/50 border-t border-slate-800 mt-20">
	<div class="container mx-auto px-4 py-12">
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
			<!-- Brand Section -->
			<div class="lg:col-span-1">
				<a href="/" class="flex items-center space-x-2 text-xl font-bold mb-4">
					<span class="text-3xl">🎮</span>
					<span class="gradient-text">GameMind</span>
				</a>
				<p class="text-slate-400 text-sm mb-4">
					The world's most intelligent gaming platform. Where human creativity meets artificial
					intelligence.
				</p>
				<div class="flex space-x-4">
					{#each socialLinks as social}
						<a
							href={social.href}
							target="_blank"
							rel="noopener noreferrer"
							class="text-slate-400 hover:text-primary-500 transition-colors duration-200"
							aria-label={social.name}
						>
							<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
								<path d={social.icon} />
							</svg>
						</a>
					{/each}
				</div>
			</div>

			<!-- Product Links -->
			<div>
				<h3 class="text-white font-semibold mb-4">Product</h3>
				<ul class="space-y-2">
					{#each footerLinks.product as link}
						<li>
							<a
								href={link.href}
								class="text-slate-400 hover:text-white transition-colors duration-200 text-sm"
							>
								{link.label}
							</a>
						</li>
					{/each}
				</ul>
			</div>

			<!-- Company Links -->
			<div>
				<h3 class="text-white font-semibold mb-4">Company</h3>
				<ul class="space-y-2">
					{#each footerLinks.company as link}
						<li>
							<a
								href={link.href}
								class="text-slate-400 hover:text-white transition-colors duration-200 text-sm"
							>
								{link.label}
							</a>
						</li>
					{/each}
				</ul>
			</div>

			<!-- Resources Links -->
			<div>
				<h3 class="text-white font-semibold mb-4">Resources</h3>
				<ul class="space-y-2">
					{#each footerLinks.resources as link}
						<li>
							<a
								href={link.href}
								class="text-slate-400 hover:text-white transition-colors duration-200 text-sm"
							>
								{link.label}
							</a>
						</li>
					{/each}
				</ul>
			</div>

			<!-- Legal Links -->
			<div>
				<h3 class="text-white font-semibold mb-4">Legal</h3>
				<ul class="space-y-2">
					{#each footerLinks.legal as link}
						<li>
							<a
								href={link.href}
								class="text-slate-400 hover:text-white transition-colors duration-200 text-sm"
							>
								{link.label}
							</a>
						</li>
					{/each}
				</ul>
			</div>
		</div>

		<!-- Bottom Bar -->
		<div class="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
			<p class="text-slate-400 text-sm">
				© {currentYear} GameMind. All rights reserved. Built with ❤️ by gamers, for gamers.
			</p>
			<div class="flex items-center space-x-4 mt-4 md:mt-0">
				<span class="text-slate-400 text-sm">Powered by</span>
				<div class="flex items-center space-x-2">
					<span class="text-xs text-slate-500">Svelte 5</span>
					<span class="text-slate-600">•</span>
					<span class="text-xs text-slate-500">SvelteKit 2</span>
					<span class="text-slate-600">•</span>
					<span class="text-xs text-slate-500">Tailwind CSS v4</span>
				</div>
			</div>
		</div>
	</div>
</footer>

