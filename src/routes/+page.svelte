<script lang="ts">
	import { SceneManager } from '#lib/three/SceneManager';

	let container: HTMLDivElement;

	$effect(() => {
		const manager = new SceneManager(container);
		manager.initModel('/models/coffee_cup.glb');

		return () => manager.dispose();
	});
</script>

<div class="viewport" bind:this={container}></div>

<style lang="scss">
	.viewport {
		width: 100vw;
		height: 100dvh;
		overflow: hidden;
		background: radial-gradient(circle at center, #f5efe6 0%, #e6d5c3 100%);
	}
</style>
