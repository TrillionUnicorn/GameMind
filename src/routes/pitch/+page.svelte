<script lang="ts">
	import Navigation from '$lib/components/Navigation.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Button from '$lib/components/ui/Button.svelte';

	const marketData = {
		globalGaming: {
			size: '$187.7B',
			year: 2024,
			growth: '+2.1% YoY',
			source: 'Newzoo Global Games Market Report 2024'
		},
		boardGames: {
			size: '$14.37B',
			year: 2024,
			growth: '+8.5% CAGR',
			source: 'Fortune Business Insights 2024'
		},
		strategyPlayers: {
			count: '500M+',
			description: 'Global strategy game players',
			source: 'Industry Analysis 2024'
		},
		chessPlayers: {
			count: '600M+',
			description: 'Chess players worldwide',
			source: 'FIDE & Chess.com Statistics 2024'
		}
	};

	const competitors = [
		{
			name: 'Chess.com',
			users: '100M+',
			revenue: '$100M+ ARR',
			strengths: ['Large user base', 'Established brand', 'Social features'],
			weaknesses: ['Chess only', 'Static AI', 'No adaptive learning'],
			marketShare: '45%'
		},
		{
			name: 'Lichess',
			users: '10M+',
			revenue: 'Free/Donations',
			strengths: ['Free platform', 'Open source', 'No ads'],
			weaknesses: ['Chess only', 'Limited AI', 'No coaching'],
			marketShare: '15%'
		},
		{
			name: 'Traditional Apps',
			users: 'Fragmented',
			revenue: '$50M+ combined',
			strengths: ['Specific games', 'Offline play'],
			weaknesses: ['Single game', 'Poor AI', 'No updates'],
			marketShare: '40%'
		}
	];

	const revenueProjections = [
		{ year: 2024, users: 10000, revenue: 50000, arr: 600000 },
		{ year: 2025, users: 100000, revenue: 500000, arr: 6000000 },
		{ year: 2026, users: 500000, revenue: 2500000, arr: 30000000 },
		{ year: 2027, users: 1000000, revenue: 5000000, arr: 60000000 }
	];

	const roadmap = [
		{
			quarter: 'Q4 2024',
			milestones: [
				'Launch MVP with Chess',
				'Reach 10K users',
				'Implement adaptive AI',
				'Mobile web optimization'
			]
		},
		{
			quarter: 'Q1 2025',
			milestones: [
				'Add Mahjong & Go',
				'iOS & Android apps',
				'Reach 100K users',
				'Premium subscriptions'
			]
		},
		{
			quarter: 'Q2 2025',
			milestones: [
				'Tournament system',
				'AI coaching features',
				'Educational partnerships',
				'Reach 500K users'
			]
		},
		{
			quarter: 'Q3-Q4 2025',
			milestones: [
				'VR/AR gaming',
				'New games (Shogi, Xiangqi)',
				'Global expansion',
				'Reach 1M users'
			]
		}
	];

	const teamMembers = [
		{
			name: 'Hunter Ho',
			role: 'Founder & CEO',
			background: 'Game AI researcher, 12+ years in strategy games',
			linkedin: 'https://linkedin.com/in/hunterho',
			github: 'https://github.com/HunterHo07'
		}
	];

	const investmentAsk = {
		amount: '$500K',
		use: [
			{ category: 'Product Development', percentage: 40, amount: '$200K' },
			{ category: 'Marketing & User Acquisition', percentage: 30, amount: '$150K' },
			{ category: 'Team Expansion', percentage: 20, amount: '$100K' },
			{ category: 'Operations & Infrastructure', percentage: 10, amount: '$50K' }
		],
		valuation: '$5M',
		equity: '10%'
	};
</script>

<svelte:head>
	<title>Pitch Deck - GameMind</title>
	<meta
		name="description"
		content="GameMind investor pitch deck - revolutionizing intelligent gaming with adaptive AI"
	/>
</svelte:head>

<Navigation />

<div class="min-h-screen py-12">
	<div class="container px-4 max-w-6xl mx-auto">
		<!-- Title Slide -->
		<section class="mb-20 text-center">
			<div class="mb-8">
				<h1 class="text-6xl md:text-7xl font-bold mb-6">
					<span class="gradient-text">GameMind</span>
				</h1>
				<p class="text-2xl md:text-3xl text-slate-300 mb-4">
					The World's Most Intelligent Gaming Platform
				</p>
				<p class="text-xl text-slate-400">
					Adaptive AI • Multi-Game • Personalized Learning
				</p>
			</div>

			<div class="flex flex-wrap gap-4 justify-center">
				<Button variant="primary" size="lg">
					<a href="/contact">Schedule Meeting</a>
				</Button>
				<Button variant="outline" size="lg">
					<a href="/play">Try Demo</a>
				</Button>
			</div>
		</section>

		<!-- Problem Statement -->
		<section class="mb-20">
			<Card glass={true} class="p-8">
				<h2 class="text-4xl font-bold mb-8 text-center">The Problem</h2>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-8">
					<div>
						<h3 class="text-2xl font-bold mb-4 text-primary-500">$187.7B Market Frustration</h3>
						<ul class="space-y-3 text-slate-300">
							<li class="flex items-start gap-2">
								<span class="text-primary-500 text-xl">•</span>
								<span><strong>78%</strong> of players find AI too easy or impossibly hard</span>
							</li>
							<li class="flex items-start gap-2">
								<span class="text-primary-500 text-xl">•</span>
								<span><strong>65%</strong> quit games due to poor AI difficulty balancing</span>
							</li>
							<li class="flex items-start gap-2">
								<span class="text-primary-500 text-xl">•</span>
								<span><strong>89%</strong> of chess/board game apps use outdated, static AI</span>
							</li>
							<li class="flex items-start gap-2">
								<span class="text-primary-500 text-xl">•</span>
								<span><strong>92%</strong> of players want personalized gaming experiences</span>
							</li>
						</ul>
					</div>
					<div>
						<h3 class="text-2xl font-bold mb-4 text-primary-500">Current Pain Points</h3>
						<ul class="space-y-3 text-slate-300">
							<li class="flex items-start gap-2">
								<span class="text-xl">🤖</span>
								<span><strong>Dumb AI:</strong> Static difficulty that doesn't adapt</span>
							</li>
							<li class="flex items-start gap-2">
								<span class="text-xl">📈</span>
								<span><strong>Skill Gaps:</strong> Huge jumps between difficulty levels</span>
							</li>
							<li class="flex items-start gap-2">
								<span class="text-xl">😴</span>
								<span><strong>Boring:</strong> Predictable AI patterns</span>
							</li>
							<li class="flex items-start gap-2">
								<span class="text-xl">🎯</span>
								<span><strong>No Personalization:</strong> One-size-fits-all experience</span>
							</li>
						</ul>
					</div>
				</div>
			</Card>
		</section>

		<!-- Solution -->
		<section class="mb-20">
			<Card glass={true} class="p-8">
				<h2 class="text-4xl font-bold mb-8 text-center">Our Solution</h2>
				<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
					<div class="text-center">
						<div class="text-5xl mb-4">🧠</div>
						<h3 class="text-xl font-bold mb-2">Adaptive AI</h3>
						<p class="text-slate-300">Real-time learning and skill adaptation</p>
					</div>
					<div class="text-center">
						<div class="text-5xl mb-4">🎮</div>
						<h3 class="text-xl font-bold mb-2">Multi-Game</h3>
						<p class="text-slate-300">Chess, Mahjong, Go in one platform</p>
					</div>
					<div class="text-center">
						<div class="text-5xl mb-4">🎓</div>
						<h3 class="text-xl font-bold mb-2">AI Coaching</h3>
						<p class="text-slate-300">Personalized training and analysis</p>
					</div>
				</div>

				<div class="bg-slate-800/50 rounded-lg p-6">
					<h3 class="text-xl font-bold mb-4 text-center">Unique Value Proposition</h3>
					<p class="text-lg text-slate-300 text-center">
						"The only gaming platform where AI opponents adapt to your skill level in real-time,
						providing the perfect challenge for every player from beginner to grandmaster."
					</p>
				</div>
			</Card>
		</section>

		<!-- Market Analysis -->
		<section class="mb-20">
			<Card glass={true} class="p-8">
				<h2 class="text-4xl font-bold mb-8 text-center">Market Opportunity</h2>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
					<div class="bg-slate-800/50 rounded-lg p-6">
						<h3 class="text-2xl font-bold mb-4 text-primary-500">
							{marketData.globalGaming.size}
						</h3>
						<p class="text-slate-300 mb-2">Global Gaming Market ({marketData.globalGaming.year})</p>
						<p class="text-sm text-slate-400">
							Growth: {marketData.globalGaming.growth}
						</p>
						<p class="text-xs text-slate-500 mt-2">Source: {marketData.globalGaming.source}</p>
					</div>

					<div class="bg-slate-800/50 rounded-lg p-6">
						<h3 class="text-2xl font-bold mb-4 text-primary-500">
							{marketData.boardGames.size}
						</h3>
						<p class="text-slate-300 mb-2">Board Games Market ({marketData.boardGames.year})</p>
						<p class="text-sm text-slate-400">
							Growth: {marketData.boardGames.growth}
						</p>
						<p class="text-xs text-slate-500 mt-2">Source: {marketData.boardGames.source}</p>
					</div>
				</div>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-8">
					<div class="bg-slate-800/50 rounded-lg p-6">
						<h3 class="text-2xl font-bold mb-4 text-primary-500">
							{marketData.strategyPlayers.count}
						</h3>
						<p class="text-slate-300 mb-2">{marketData.strategyPlayers.description}</p>
						<p class="text-xs text-slate-500 mt-2">Source: {marketData.strategyPlayers.source}</p>
					</div>

					<div class="bg-slate-800/50 rounded-lg p-6">
						<h3 class="text-2xl font-bold mb-4 text-primary-500">
							{marketData.chessPlayers.count}
						</h3>
						<p class="text-slate-300 mb-2">{marketData.chessPlayers.description}</p>
						<p class="text-xs text-slate-500 mt-2">Source: {marketData.chessPlayers.source}</p>
					</div>
				</div>
			</Card>
		</section>

		<!-- Competitive Analysis -->
		<section class="mb-20">
			<Card glass={true} class="p-8">
				<h2 class="text-4xl font-bold mb-8 text-center">Competitive Landscape</h2>

				<div class="overflow-x-auto">
					<table class="w-full text-left">
						<thead>
							<tr class="border-b border-slate-700">
								<th class="pb-4 pr-4">Platform</th>
								<th class="pb-4 pr-4">Users</th>
								<th class="pb-4 pr-4">Revenue</th>
								<th class="pb-4 pr-4">Market Share</th>
							</tr>
						</thead>
						<tbody>
							{#each competitors as competitor}
								<tr class="border-b border-slate-800">
									<td class="py-4 pr-4 font-semibold">{competitor.name}</td>
									<td class="py-4 pr-4 text-slate-300">{competitor.users}</td>
									<td class="py-4 pr-4 text-slate-300">{competitor.revenue}</td>
									<td class="py-4 pr-4 text-primary-500">{competitor.marketShare}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>

				<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
					{#each competitors as competitor}
						<div class="bg-slate-800/50 rounded-lg p-6">
							<h3 class="text-xl font-bold mb-4">{competitor.name}</h3>
							<div class="mb-4">
								<h4 class="text-sm font-semibold text-green-400 mb-2">Strengths</h4>
								<ul class="text-sm text-slate-300 space-y-1">
									{#each competitor.strengths as strength}
										<li>• {strength}</li>
									{/each}
								</ul>
							</div>
							<div>
								<h4 class="text-sm font-semibold text-red-400 mb-2">Weaknesses</h4>
								<ul class="text-sm text-slate-300 space-y-1">
									{#each competitor.weaknesses as weakness}
										<li>• {weakness}</li>
									{/each}
								</ul>
							</div>
						</div>
					{/each}
				</div>

				<div class="mt-8 bg-primary-500/20 border border-primary-500 rounded-lg p-6">
					<h3 class="text-xl font-bold mb-2 text-center">Our Competitive Advantage</h3>
					<p class="text-slate-300 text-center">
						Only platform with adaptive AI across multiple games, combining the best of Chess.com's
						user experience with advanced AI that actually learns and adapts to each player.
					</p>
				</div>
			</Card>
		</section>

		<!-- Business Model -->
		<section class="mb-20">
			<Card glass={true} class="p-8">
				<h2 class="text-4xl font-bold mb-8 text-center">Business Model</h2>

				<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
					<div class="bg-slate-800/50 rounded-lg p-6 text-center">
						<h3 class="text-2xl font-bold mb-2">Free Tier</h3>
						<p class="text-4xl font-bold text-primary-500 mb-2">$0</p>
						<p class="text-slate-400 mb-4">Ad-supported</p>
						<p class="text-sm text-slate-300">10 games/day, basic AI</p>
					</div>

					<div class="bg-slate-800/50 rounded-lg p-6 text-center border-2 border-primary-500">
						<div class="text-xs font-bold text-primary-500 mb-2">MOST POPULAR</div>
						<h3 class="text-2xl font-bold mb-2">Pro</h3>
						<p class="text-4xl font-bold text-primary-500 mb-2">$9.99</p>
						<p class="text-slate-400 mb-4">per month</p>
						<p class="text-sm text-slate-300">Unlimited games, adaptive AI</p>
					</div>

					<div class="bg-slate-800/50 rounded-lg p-6 text-center">
						<h3 class="text-2xl font-bold mb-2">Master Class</h3>
						<p class="text-4xl font-bold text-primary-500 mb-2">$19.99</p>
						<p class="text-slate-400 mb-4">per month</p>
						<p class="text-sm text-slate-300">Grandmaster AI, coaching</p>
					</div>
				</div>

				<div class="bg-slate-800/50 rounded-lg p-6">
					<h3 class="text-xl font-bold mb-4 text-center">Revenue Projections</h3>
					<div class="overflow-x-auto">
						<table class="w-full text-center">
							<thead>
								<tr class="border-b border-slate-700">
									<th class="pb-4">Year</th>
									<th class="pb-4">Users</th>
									<th class="pb-4">Monthly Revenue</th>
									<th class="pb-4">ARR</th>
								</tr>
							</thead>
							<tbody>
								{#each revenueProjections as projection}
									<tr class="border-b border-slate-800">
										<td class="py-4 font-semibold">{projection.year}</td>
										<td class="py-4 text-slate-300">{projection.users.toLocaleString()}</td>
										<td class="py-4 text-slate-300">${projection.revenue.toLocaleString()}</td>
										<td class="py-4 text-primary-500 font-bold">${projection.arr.toLocaleString()}</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</div>
			</Card>
		</section>

		<!-- Roadmap -->
		<section class="mb-20">
			<Card glass={true} class="p-8">
				<h2 class="text-4xl font-bold mb-8 text-center">Product Roadmap</h2>

				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
					{#each roadmap as quarter}
						<div class="bg-slate-800/50 rounded-lg p-6">
							<h3 class="text-xl font-bold mb-4 text-primary-500">{quarter.quarter}</h3>
							<ul class="space-y-2 text-sm text-slate-300">
								{#each quarter.milestones as milestone}
									<li class="flex items-start gap-2">
										<span class="text-primary-500">✓</span>
										<span>{milestone}</span>
									</li>
								{/each}
							</ul>
						</div>
					{/each}
				</div>
			</Card>
		</section>
	</div>
</div>

<Footer />
