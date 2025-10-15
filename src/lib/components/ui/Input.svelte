<script lang="ts">
	interface Props {
		type?: string;
		placeholder?: string;
		value?: string;
		required?: boolean;
		disabled?: boolean;
		class?: string;
		name?: string;
		id?: string;
	}

	let {
		type = 'text',
		placeholder = '',
		value = $bindable(''),
		required = false,
		disabled = false,
		class: className = '',
		name,
		id
	}: Props = $props();

	const classes = `w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 ${className}`;
</script>

<input
	{type}
	{placeholder}
	bind:value
	{required}
	{disabled}
	{name}
	{id}
	class={classes}
/>

