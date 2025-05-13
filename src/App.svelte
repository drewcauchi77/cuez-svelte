<script lang="ts">
	import { onMount } from "svelte";
	import episodeData from "../data/episode.json";
	import timingsData from "../data/timings.json";
	import type { EpisodeData, TimingsData } from "./helpers/helpers";
	import { computeTimings } from "./helpers/helpers";

	let result: TimingsData | null = null;
	let error: string | null = null;

	onMount(() => {
		try {
			// Clone so imports (which may be readonly) aren’t mutated
			const episode: EpisodeData = JSON.parse(
				JSON.stringify(episodeData)
			);
			const timings: TimingsData = JSON.parse(
				JSON.stringify(timingsData)
			);

			result = computeTimings(episode, timings);
		} catch (e: any) {
			error = e.message || "Unknown error";
		}
	});
</script>

<main class="p-4">
	<h1 class="text-2xl mb-4">Episode Timings</h1>

	{#if error}
		<p class="text-red-600">Error: {error}</p>
	{:else if !result}
		<p>Calculating…</p>
	{:else}
		<section class="mb-6">
			<h2 class="text-xl">On-Air Time</h2>
			<p>{episodeData.episode.on_air_time} s</p>
		</section>

		<section class="mb-6">
			<h2 class="text-xl">Parts</h2>
			{#each episodeData.episode.parts as partId}
				<div class="border rounded p-2 mb-2">
					<strong>Part {partId}</strong><br />
					Front: {result.part[partId].front_time}s | Back: {result
						.part[partId].back_time}s | End: {result.part[partId]
						.end_time}s
				</div>
			{/each}
		</section>

		<section>
			<h2 class="text-xl">Items</h2>
			{#each Object.keys(result.item) as itemId}
				<div class="border rounded p-2 mb-2">
					<strong>Item {itemId}</strong><br />
					Front: {result.item[itemId].front_time}s | Back: {result
						.item[itemId].back_time}s | End: {result.item[itemId]
						.end_time}s
				</div>
			{/each}
		</section>
	{/if}
</main>
