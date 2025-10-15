<script lang="ts">
	interface Props {
		hover?: boolean;
		glass?: boolean;
		class?: string;
		children?: any;
	}

	let { hover = false, glass = false, class: className = '', children }: Props = $props();

	const baseClasses = 'rounded-xl p-6 transition-all duration-300';
	const hoverClasses = hover ? 'card-hover cursor-pointer' : '';
	const glassClasses = glass ? 'glass' : 'bg-slate-800/50 border border-slate-700';

	const classes = `${baseClasses} ${hoverClasses} ${glassClasses} ${className}`;
</script>

<div class={classes}>
	{@render children?.()}
</div>

