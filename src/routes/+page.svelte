<script lang="ts">
	import { onMount } from 'svelte';
	import Navigation from '$lib/components/Navigation.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Input from '$lib/components/ui/Input.svelte';

	let email = $state('');
	let isSubmitting = $state(false);
	let submitMessage = $state('');

	// Parallax effect
	let scrollY = $state(0);

	onMount(() => {
		const handleScroll = () => {
			scrollY = window.scrollY;
		};

		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	});

	async function handleWaitlistSubmit(e: Event) {
		e.preventDefault();
		isSubmitting = true;

		// Simulate API call
		await new Promise((resolve) => setTimeout(resolve, 1000));

		submitMessage = 'Thanks for joining! Check your email for early access.';
		email = '';
		isSubmitting = false;

		setTimeout(() => {
			submitMessage = '';
		}, 5000);
	}

	const features = [
		{
			icon: '🧠',
			title: 'Adaptive AI',
			description: 'AI that learns your play style and adapts in real-time for the perfect challenge'
		},
		{
			icon: '🎮',
			title: 'Multi-Game Platform',
			description: 'Chess, Mahjong, and Go - all with intelligent AI opponents in one platform'
		},
		{
			icon: '📊',
			title: 'Advanced Analytics',
			description: 'Detailed performance tracking and personalized improvement recommendations'
		},
		{
			icon: '🎓',
			title: 'AI Coaching',
			description: 'Real-time hints, strategy explanations, and personalized training'
		},
		{
			icon: '🏆',
			title: 'Competitive Play',
			description: 'Tournaments, leaderboards, and ranked matches with fair matchmaking'
		},
		{
			icon: '🌐',
			title: 'Cross-Platform',
			description: 'Play seamlessly across web, mobile, and desktop with cloud sync'
		}
	];

	const howItWorks = [
		{
			step: '1',
			title: 'Choose Your Game',
			description: 'Select from Chess, Mahjong, or Go - each with intelligent AI opponents',
			icon: '🎯'
		},
		{
			step: '2',
			title: 'AI Adapts to You',
			description: 'Our AI analyzes your skill level and adjusts difficulty in real-time',
			icon: '🤖'
		},
		{
			step: '3',
			title: 'Improve & Compete',
			description: 'Track progress, learn strategies, and compete in tournaments',
			icon: '📈'
		}
	];

	const pricingTiers = [
		{
			name: 'Free',
			price: '$0',
			period: 'forever',
			description: 'Perfect for casual players',
			features: [
				'10 games per day',
				'Basic AI opponents',
				'Simple analytics',
				'Community access',
				'Standard board themes'
			],
			cta: 'Start Free',
			popular: false
		},
		{
			name: 'Pro',
			price: '$9.99',
			period: 'per month',
			description: 'For serious players',
			features: [
				'Unlimited games',
				'Adaptive AI',
				'Advanced analytics',
				'AI coaching mode',
				'Premium themes',
				'Priority support'
			],
			cta: 'Start Pro',
			popular: true,
			discount: '50% off first year - $4.99/mo'
		},
		{
			name: 'Master Class',
			price: '$19.99',
			period: 'per month',
			description: 'For competitive players',
			features: [
				'Everything in Pro',
				'Grandmaster AI',
				'Personal AI coach',
				'Tournament access',
				'Video analysis',
				'Custom training',
				'1-on-1 support'
			],
			cta: 'Go Master',
			popular: false,
			discount: '50% off 6 months - $9.99/mo'
		}
	];

	const stats = [
		{ value: '10K+', label: 'Active Players' },
		{ value: '1M+', label: 'Games Played' },
		{ value: '95%', label: 'Satisfaction' },
		{ value: '4.9/5', label: 'User Rating' }
	];
</script>

<svelte:head>
	<title>GameMind - AI-Powered Intelligent Gaming Platform</title>
	<meta
		name="description"
		content="Experience chess, mahjong, and Go with adaptive AI that learns your play style. The world's most intelligent gaming platform."
	/>
</svelte:head>

<Navigation />

<!-- Hero Section with Parallax -->
<section class="relative min-h-screen flex items-center justify-center overflow-hidden">
	<!-- Parallax Background -->
	<div
		class="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
		style="transform: translateY({scrollY * 0.5}px)"
	></div>

	<!-- Animated Grid Background -->
	<div class="absolute inset-0 opacity-20">
		<div
			class="absolute inset-0"
			style="background-image: linear-gradient(rgba(239, 68, 68, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(239, 68, 68, 0.1) 1px, transparent 1px); background-size: 50px 50px;"
		></div>
	</div>

	<div class="container relative z-10 px-4 py-20 text-center">
		<div class="animate-fade-in">
			<h1 class="text-5xl md:text-7xl font-bold mb-6 leading-tight">
				The World's Most<br />
				<span class="gradient-text">Intelligent Gaming Platform</span>
			</h1>
			<p class="text-xl md:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto">
				Experience chess, mahjong, and Go with adaptive AI that learns your play style and provides
				the perfect challenge every time.
			</p>

			<div class="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
				<Button variant="primary" size="lg">
					<a href="/play" class="flex items-center gap-2">
						<span>Start Playing Free</span>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M13 7l5 5m0 0l-5 5m5-5H6"
							/>
						</svg>
					</a>
				</Button>
				<Button variant="outline" size="lg">
					<a href="/pitch">View Pitch Deck</a>
				</Button>
			</div>

			<!-- Stats -->
			<div class="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
				{#each stats as stat}
					<div class="text-center">
						<div class="text-3xl md:text-4xl font-bold text-primary-500 mb-2">{stat.value}</div>
						<div class="text-slate-400 text-sm">{stat.label}</div>
					</div>
				{/each}
			</div>
		</div>
	</div>

	<!-- Scroll Indicator -->
	<div class="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
		<svg class="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M19 14l-7 7m0 0l-7-7m7 7V3"
			/>
		</svg>
	</div>
</section>

<!-- Why Us Section -->
<section id="why-us" class="section bg-slate-900/30">
	<div class="container px-4">
		<div class="text-center mb-16">
			<h2 class="text-4xl md:text-5xl font-bold mb-4">Why Choose GameMind?</h2>
			<p class="text-xl text-slate-300 max-w-2xl mx-auto">
				We're revolutionizing intelligent gaming with AI that truly understands and adapts to you
			</p>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
			{#each features as feature}
				<Card hover={true} glass={true}>
					<div class="text-5xl mb-4">{feature.icon}</div>
					<h3 class="text-xl font-bold mb-3 text-white">{feature.title}</h3>
					<p class="text-slate-300">{feature.description}</p>
				</Card>
			{/each}
		</div>
	</div>
</section>

<!-- How It Works Section -->
<section id="how-it-works" class="section">
	<div class="container px-4">
		<div class="text-center mb-16">
			<h2 class="text-4xl md:text-5xl font-bold mb-4">How It Works</h2>
			<p class="text-xl text-slate-300 max-w-2xl mx-auto">
				Get started in three simple steps and experience intelligent gaming
			</p>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto">
			{#each howItWorks as step}
				<div class="text-center">
					<div
						class="w-20 h-20 mx-auto mb-6 rounded-full bg-primary-500/20 flex items-center justify-center text-4xl"
					>
						{step.icon}
					</div>
					<div class="text-primary-500 font-bold text-lg mb-3">Step {step.step}</div>
					<h3 class="text-2xl font-bold mb-3 text-white">{step.title}</h3>
					<p class="text-slate-300">{step.description}</p>
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- Pricing Section -->
<section id="pricing" class="section bg-slate-900/30">
	<div class="container px-4">
		<div class="text-center mb-16">
			<h2 class="text-4xl md:text-5xl font-bold mb-4">Choose Your Plan</h2>
			<p class="text-xl text-slate-300 max-w-2xl mx-auto">
				Start free and upgrade as you grow. Special launch pricing for early adopters!
			</p>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
			{#each pricingTiers as tier}
				<Card
					hover={true}
					glass={true}
					class="relative {tier.popular ? 'border-2 border-primary-500' : ''}"
				>
					{#if tier.popular}
						<div
							class="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-primary-500 text-white px-4 py-1 rounded-full text-sm font-bold"
						>
							Most Popular
						</div>
					{/if}

					<div class="text-center mb-6">
						<h3 class="text-2xl font-bold text-white mb-2">{tier.name}</h3>
						<p class="text-slate-400 text-sm mb-4">{tier.description}</p>
						<div class="mb-2">
							<span class="text-4xl font-bold text-white">{tier.price}</span>
							<span class="text-slate-400">/{tier.period}</span>
						</div>
						{#if tier.discount}
							<div class="text-primary-400 text-sm font-semibold">{tier.discount}</div>
						{/if}
					</div>

					<ul class="space-y-3 mb-8">
						{#each tier.features as feature}
							<li class="flex items-start gap-2 text-slate-300">
								<svg
									class="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M5 13l4 4L19 7"
									/>
								</svg>
								<span>{feature}</span>
							</li>
						{/each}
					</ul>

					<Button
						variant={tier.popular ? 'primary' : 'outline'}
						size="md"
						class="w-full"
					>
						{tier.cta}
					</Button>
				</Card>
			{/each}
		</div>
	</div>
</section>

<!-- Mission & Vision Section -->
<section id="mission" class="section">
	<div class="container px-4">
		<div class="max-w-4xl mx-auto">
			<Card glass={true} class="p-12">
				<div class="text-center mb-12">
					<h2 class="text-4xl md:text-5xl font-bold mb-6">Our Mission & Vision</h2>
				</div>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-12">
					<div>
						<div class="text-4xl mb-4">🎯</div>
						<h3 class="text-2xl font-bold mb-4 text-white">Mission</h3>
						<p class="text-slate-300 leading-relaxed">
							To revolutionize intelligent gaming by creating AI opponents that truly understand and
							adapt to each player, making strategy games accessible, challenging, and enjoyable for
							everyone from beginners to grandmasters.
						</p>
					</div>

					<div>
						<div class="text-4xl mb-4">🔮</div>
						<h3 class="text-2xl font-bold mb-4 text-white">Vision</h3>
						<p class="text-slate-300 leading-relaxed">
							To become the world's leading intelligent gaming platform, where millions of players
							improve their strategic thinking through personalized AI coaching, creating a global
							community of passionate strategy game enthusiasts.
						</p>
					</div>
				</div>

				<div class="mt-12 pt-12 border-t border-slate-700">
					<h3 class="text-2xl font-bold mb-6 text-center text-white">Our Impact Goals</h3>
					<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
						<div class="text-center">
							<div class="text-3xl font-bold text-primary-500 mb-2">1M+</div>
							<div class="text-slate-400">Players by 2025</div>
						</div>
						<div class="text-center">
							<div class="text-3xl font-bold text-primary-500 mb-2">100K+</div>
							<div class="text-slate-400">Students Learning</div>
						</div>
						<div class="text-center">
							<div class="text-3xl font-bold text-primary-500 mb-2">50+</div>
							<div class="text-slate-400">Countries Reached</div>
						</div>
					</div>
				</div>
			</Card>
		</div>
	</div>
</section>

<!-- Waitlist Section -->
<section id="waitlist" class="section bg-slate-900/30">
	<div class="container px-4">
		<div class="max-w-2xl mx-auto text-center">
			<h2 class="text-4xl md:text-5xl font-bold mb-6">Join the Waitlist</h2>
			<p class="text-xl text-slate-300 mb-8">
				Be among the first to experience the future of intelligent gaming. Get early access and
				exclusive launch pricing!
			</p>

			<form onsubmit={handleWaitlistSubmit} class="flex flex-col sm:flex-row gap-4">
				<Input
					type="email"
					placeholder="Enter your email"
					bind:value={email}
					required={true}
					class="flex-1"
				/>
				<Button type="submit" variant="primary" size="md" disabled={isSubmitting}>
					{isSubmitting ? 'Joining...' : 'Join Waitlist'}
				</Button>
			</form>

			{#if submitMessage}
				<div class="mt-4 p-4 bg-primary-500/20 border border-primary-500 rounded-lg text-white">
					{submitMessage}
				</div>
			{/if}

			<p class="text-slate-400 text-sm mt-4">
				Join 10,000+ players already on the waitlist. No spam, unsubscribe anytime.
			</p>
		</div>
	</div>
</section>

<Footer />

