<script lang="ts">
	import Navigation from '$lib/components/Navigation.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Textarea from '$lib/components/ui/Textarea.svelte';

	let formData = $state({
		name: '',
		email: '',
		subject: '',
		message: ''
	});

	let isSubmitting = $state(false);
	let submitMessage = $state('');
	let submitError = $state('');

	async function handleSubmit(e: Event) {
		e.preventDefault();
		isSubmitting = true;
		submitError = '';

		try {
			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 1500));

			submitMessage = 'Thank you for your message! We will get back to you within 24 hours.';
			formData = { name: '', email: '', subject: '', message: '' };

			setTimeout(() => {
				submitMessage = '';
			}, 5000);
		} catch (error) {
			submitError = 'Failed to send message. Please try again or email us directly.';
		} finally {
			isSubmitting = false;
		}
	}

	const contactInfo = [
		{
			icon: '📧',
			title: 'Email',
			value: 'hello@gamemind.com',
			link: 'mailto:hello@gamemind.com'
		},
		{
			icon: '💼',
			title: 'Business Inquiries',
			value: 'business@gamemind.com',
			link: 'mailto:business@gamemind.com'
		},
		{
			icon: '🎮',
			title: 'Support',
			value: 'support@gamemind.com',
			link: 'mailto:support@gamemind.com'
		},
		{
			icon: '💬',
			title: 'Discord',
			value: 'Join our community',
			link: 'https://discord.gg/gamemind'
		}
	];

	const socialLinks = [
		{
			name: 'GitHub',
			url: 'https://github.com/TrillionUnicorn/GameMind',
			icon: '🔗'
		},
		{
			name: 'LinkedIn',
			url: 'https://linkedin.com/company/gamemind',
			icon: '💼'
		},
		{
			name: 'Twitter',
			url: 'https://twitter.com/gamemind',
			icon: '🐦'
		},
		{
			name: 'Discord',
			url: 'https://discord.gg/gamemind',
			icon: '💬'
		}
	];
</script>

<svelte:head>
	<title>Contact Us - GameMind</title>
	<meta
		name="description"
		content="Get in touch with GameMind. We're here to help with any questions about our intelligent gaming platform."
	/>
</svelte:head>

<Navigation />

<div class="min-h-screen py-12">
	<div class="container px-4 max-w-6xl mx-auto">
		<!-- Header -->
		<div class="text-center mb-12">
			<h1 class="text-4xl md:text-5xl font-bold mb-4">
				<span class="gradient-text">Get in Touch</span>
			</h1>
			<p class="text-xl text-slate-300 max-w-2xl mx-auto">
				Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as
				possible.
			</p>
		</div>

		<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
			<!-- Contact Form -->
			<div class="lg:col-span-2">
				<Card glass={true} class="p-8">
					<h2 class="text-2xl font-bold mb-6">Send us a Message</h2>

					<form onsubmit={handleSubmit} class="space-y-6">
						<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div>
								<label for="name" class="block text-sm font-medium mb-2">Name *</label>
								<Input
									id="name"
									type="text"
									placeholder="Your name"
									bind:value={formData.name}
									required={true}
								/>
							</div>

							<div>
								<label for="email" class="block text-sm font-medium mb-2">Email *</label>
								<Input
									id="email"
									type="email"
									placeholder="your@email.com"
									bind:value={formData.email}
									required={true}
								/>
							</div>
						</div>

						<div>
							<label for="subject" class="block text-sm font-medium mb-2">Subject *</label>
							<Input
								id="subject"
								type="text"
								placeholder="What is this about?"
								bind:value={formData.subject}
								required={true}
							/>
						</div>

						<div>
							<label for="message" class="block text-sm font-medium mb-2">Message *</label>
							<Textarea
								id="message"
								placeholder="Tell us more..."
								bind:value={formData.message}
								rows={6}
								required={true}
							/>
						</div>

						{#if submitMessage}
							<div class="p-4 bg-green-500/20 border border-green-500 rounded-lg text-white">
								{submitMessage}
							</div>
						{/if}

						{#if submitError}
							<div class="p-4 bg-red-500/20 border border-red-500 rounded-lg text-white">
								{submitError}
							</div>
						{/if}

						<Button type="submit" variant="primary" size="lg" disabled={isSubmitting} class="w-full">
							{isSubmitting ? 'Sending...' : 'Send Message'}
						</Button>

						<p class="text-sm text-slate-400 text-center">
							We typically respond within 24 hours during business days.
						</p>
					</form>
				</Card>
			</div>

			<!-- Contact Information -->
			<div class="space-y-6">
				<!-- Contact Details -->
				<Card glass={true} class="p-6">
					<h3 class="text-xl font-bold mb-6">Contact Information</h3>
					<div class="space-y-4">
						{#each contactInfo as info}
							<a
								href={info.link}
								target={info.link.startsWith('http') ? '_blank' : undefined}
								rel={info.link.startsWith('http') ? 'noopener noreferrer' : undefined}
								class="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-800/50 transition-colors"
							>
								<span class="text-2xl">{info.icon}</span>
								<div>
									<div class="font-semibold text-sm text-slate-400">{info.title}</div>
									<div class="text-white">{info.value}</div>
								</div>
							</a>
						{/each}
					</div>
				</Card>

				<!-- Social Links -->
				<Card glass={true} class="p-6">
					<h3 class="text-xl font-bold mb-6">Follow Us</h3>
					<div class="grid grid-cols-2 gap-4">
						{#each socialLinks as social}
							<a
								href={social.url}
								target="_blank"
								rel="noopener noreferrer"
								class="flex items-center gap-2 p-3 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-colors"
							>
								<span class="text-xl">{social.icon}</span>
								<span class="text-sm font-medium">{social.name}</span>
							</a>
						{/each}
					</div>
				</Card>

				<!-- Response Time -->
				<Card glass={true} class="p-6">
					<h3 class="text-xl font-bold mb-4">Response Time</h3>
					<div class="space-y-3 text-sm text-slate-300">
						<div class="flex items-start gap-2">
							<span class="text-primary-500">•</span>
							<span><strong>General Inquiries:</strong> Within 24 hours</span>
						</div>
						<div class="flex items-start gap-2">
							<span class="text-primary-500">•</span>
							<span><strong>Business/Investment:</strong> Within 12 hours</span>
						</div>
						<div class="flex items-start gap-2">
							<span class="text-primary-500">•</span>
							<span><strong>Support:</strong> Within 48 hours</span>
						</div>
						<div class="flex items-start gap-2">
							<span class="text-primary-500">•</span>
							<span><strong>Urgent Matters:</strong> Call or Discord</span>
						</div>
					</div>
				</Card>

				<!-- Office Hours -->
				<Card glass={true} class="p-6">
					<h3 class="text-xl font-bold mb-4">Office Hours</h3>
					<div class="space-y-2 text-sm text-slate-300">
						<div class="flex justify-between">
							<span>Monday - Friday</span>
							<span class="text-primary-500">9:00 AM - 6:00 PM</span>
						</div>
						<div class="flex justify-between">
							<span>Saturday</span>
							<span class="text-primary-500">10:00 AM - 4:00 PM</span>
						</div>
						<div class="flex justify-between">
							<span>Sunday</span>
							<span class="text-slate-500">Closed</span>
						</div>
						<p class="text-xs text-slate-400 mt-4">* Times are in PST (UTC-8)</p>
					</div>
				</Card>
			</div>
		</div>
	</div>
</div>

<Footer />

