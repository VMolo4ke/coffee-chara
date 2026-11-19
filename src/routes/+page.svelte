<script lang="ts">
	import { SceneManager, type CameraView } from '#lib/three/SceneManager';

	let container: HTMLDivElement;
	let manager: SceneManager | null = null;

	let activeLid = $state('#e5e5e5');
	let activeCup = $state<string | null>(null);
	let activeView = $state<CameraView>('default');

    let lightAngle = $state(45);

	const lidColors = [
		{ name: 'Белая', value: '#e5e5e5' },
		{ name: 'Чёрная', value: '#222222' },
		{ name: 'Карамель', value: '#c68b59' },
		{ name: 'Мята', value: '#7fb09b' }
	];

	const cupColors = [
		{ name: 'Крафт', value: null, preview: '#5c3a21' },
		{ name: 'Сливочный', value: '#f4ece1', preview: '#f4ece1' },
		{ name: 'Терракота', value: '#c85a32', preview: '#c85a32' },
		{ name: 'Графит', value: '#33373d', preview: '#33373d' },
		{ name: 'Матча', value: '#8ca87c', preview: '#8ca87c' }
	];

	$effect(() => {
		const instance = new SceneManager(container);
		instance.initModel('/models/coffee_cup.glb');
		manager = instance;

		return () => {
			instance.dispose();
			manager = null;
		};
	});

	function selectLid(hex: string) {
		activeLid = hex;
		manager?.setLidColor(hex);
	}

	function selectCup(hex: string | null) {
		activeCup = hex;
		manager?.setCupColor(hex);
	}

	function selectView(view: CameraView) {
		activeView = view;
		manager?.setView(view);
	}

    function handleLightChange(e: Event) {
        const value = Number((e.target as HTMLInputElement).value);
        lightAngle = value;
        manager?.setLightAngle(value);
    }
</script>

<main class="app">
	<div class="viewport" bind:this={container}></div>

	<div class="hud">
		<header class="hud__header">
			<div class="panel">
				<h1>Coffee Chara</h1>
				<p>3D-конфигуратор стаканчика</p>
			</div>

            <section class="panel">
                <div class="slider-header">
                    <h2>Освещение</h2>
                    <span>{lightAngle}°</span>
                </div>
                <input
                    type="range"
                    min="0"
                    max="360"
                    value={lightAngle}
                    oninput={handleLightChange}
                    class="slider"
                />
            </section>

			<div class="panel views">
				<button class:active={activeView === 'default'} onclick={() => selectView('default')}>
					Общий вид
				</button>
				<button class:active={activeView === 'top'} onclick={() => selectView('top')}>
					Сверху
				</button>
				<button class:active={activeView === 'detail'} onclick={() => selectView('detail')}>
					Детали
				</button>
			</div>
		</header>

		<aside class="hud__controls">
			<section class="panel">
				<h2>Цвет крышки</h2>
				<div class="swatches">
					{#each lidColors as color}
						<button
							class="swatch"
							class:active={activeLid === color.value}
							style:--swatch-color={color.value}
							title={color.name}
							aria-label={color.name}
							onclick={() => selectLid(color.value)}
						></button>
					{/each}
				</div>
			</section>

			<section class="panel">
				<h2>Стаканчик</h2>
				<div class="swatches">
					{#each cupColors as color}
						<button
							class="swatch"
							class:active={activeCup === color.value}
							style:--swatch-color={color.preview}
							title={color.name}
							aria-label={color.name}
							onclick={() => selectCup(color.value)}
						></button>
					{/each}
				</div>
			</section>
		</aside>
	</div>
</main>

<style lang="scss">
	.app {
		position: relative;
		width: 100vw;
		height: 100dvh;
		overflow: hidden;
		font-family: system-ui, -apple-system, sans-serif;
	}

	.viewport {
		width: 100%;
		height: 100%;
		background: radial-gradient(circle at center, #f7f1e8 0%, #e4d2be 100%);
	}

	.hud {
		position: fixed;
		inset: 0;
		padding: 1.25rem;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		pointer-events: none;

	    &__header {
			display: flex;
			justify-content: space-between;
			align-items: flex-start;
			gap: 1rem;
			flex-wrap: wrap;
		}

		&__controls {
			align-self: flex-end;
			display: flex;
			flex-direction: column;
			gap: 0.75rem;
			width: 260px;
		}
	}

	.panel {
		pointer-events: auto;
		background: rgba(255, 255, 255, 0.78);
		backdrop-filter: blur(12px);
		border: 1px solid rgba(255, 255, 255, 0.6);
		border-radius: 16px;
		padding: 1rem 1.15rem;
		box-shadow: 0 8px 24px rgba(45, 30, 15, 0.08);

		h1 {
			margin: 0;
			font-size: 1.1rem;
			color: #2b1d12;
		}

		p {
			margin: 0.2rem 0 0;
			font-size: 0.85rem;
			color: #6e5846;
		}

		h2 {
			margin: 0 0 0.65rem;
			font-size: 0.85rem;
			font-weight: 600;
			text-transform: uppercase;
			letter-spacing: 0.04em;
			color: #5c4636;
		}
	}

	.views {
		display: flex;
		gap: 0.4rem;
		padding: 0.4rem;

		button {
			border: none;
			background: transparent;
			padding: 0.5rem 0.85rem;
			border-radius: 10px;
			font-size: 0.85rem;
			font-weight: 500;
			color: #4a3728;
			cursor: pointer;
			transition: 0.2s;

			&:hover {
				background: rgba(92, 70, 54, 0.08);
			}

			&.active {
				background: #3d2817;
				color: #fff;
			}
		}
	}

	.swatches {
		display: flex;
		gap: 0.6rem;
		flex-wrap: wrap;
	}

	.swatch {
		width: 34px;
		height: 34px;
		border-radius: 50%;
		border: 2px solid rgba(0, 0, 0, 0.12);
		background-color: var(--swatch-color);
		cursor: pointer;
		transition: transform 0.15s, box-shadow 0.15s;

		&:hover {
			transform: scale(1.1);
		}

		&.active {
			transform: scale(1.12);
			box-shadow: 0 0 0 2px #fff, 0 0 0 4px #3d2817;
		}
	}

	@media (max-width: 768px) {
		.hud {
			padding: 0.85rem;

			&__controls {
				align-self: stretch;
				width: 100%;
				flex-direction: row;

				.panel {
					flex: 1;
				}
			}
		}
	}
</style>
