<script lang="ts">
	import { onMount } from "svelte";
	import episodeData from "../data/episode.json";
	import timingsData from "../data/timings.json";
	import type { EpisodeData, TimingsData } from "./helpers/helpers";
	import { computeTimings } from "./helpers/helpers";

	let result: TimingsData | null = null;
	let error: string | null = null;
	let currentTime = "13:00:00";
	let endTime = "13:45:00";
	let duration = "00:45:00";
	let isMobileMenuOpen = false;
	
	// Format seconds to time display (HH:MM:SS)
	function formatTime(seconds: number): string {
		const date = new Date(seconds * 1000);
		return date.toTimeString().substring(0, 8);
	}
	
	// Format milliseconds to minutes:seconds display (MM:SS)
	function formatDuration(ms: number): string {
		const seconds = Math.floor(ms / 1000);
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;
		return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
	}
	
	// Get all items with their part information
	function getAllItems() {
		if (!result) return [];
		
		const allItems = [];
		let itemNumber = 1;
		
		for (let partIndex = 0; partIndex < episodeData.episode.parts.length; partIndex++) {
			const partId = episodeData.episode.parts[partIndex];
			const partInfo = episodeData.part[partId];
			const partTimings = result.part[partId];
			
			// Add part row
			allItems.push({
				type: 'part',
				number: null,
				id: partId,
				title: partInfo.title,
				duration: formatDuration(partTimings.estimated_duration),
				frontTime: formatTime(partTimings.front_time),
				endTime: formatTime(partTimings.end_time),
				backTime: formatTime(partTimings.back_time)
			});
			
			// Add item rows for this part
			for (const itemId of partInfo.items) {
				const itemInfo = episodeData.item[itemId];
				const itemTimings = result.item[itemId];
				
				allItems.push({
					type: 'item',
					number: itemNumber++,
					id: itemId,
					title: itemInfo.title,
					duration: formatDuration(itemTimings.estimated_duration),
					frontTime: formatTime(itemTimings.front_time),
					endTime: formatTime(itemTimings.end_time),
					backTime: formatTime(itemTimings.back_time)
				});
			}
		}
		
		return allItems;
	}
	
	function toggleMobileMenu() {
		isMobileMenuOpen = !isMobileMenuOpen;
	}

	onMount(() => {
		try {
			// Clone so imports (which may be readonly) aren't mutated
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

<main class="bg-gray-100 min-h-screen">
	<!-- Mobile-friendly header -->
	<header class="flex flex-wrap items-center p-2 bg-white border-b">
		<div class="flex items-center">
			<button class="p-2 mr-2">
				<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
					<path fill-rule="evenodd" d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z" clip-rule="evenodd" />
				</svg>
			</button>
			<div class="flex items-center">
				<span class="mr-2">Live</span>
				<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
					<path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
				</svg>
			</div>
		</div>
		
		<!-- Mobile menu button -->
		<button class="md:hidden ml-auto p-2" on:click={toggleMobileMenu}>
			<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
			</svg>
		</button>
		
		<!-- Desktop navigation -->
		<div class="hidden md:flex md:items-center md:mx-4">
			<div class="flex items-center px-2 md:px-4">
				<span class="text-green-600 font-medium">{currentTime}</span>
			</div>
			<div class="flex items-center px-2 md:px-4">
				<span class="text-red-600 font-medium">{endTime}</span>
			</div>
			<div class="flex items-center px-2 md:px-4">
				<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
					<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
				</svg>
				<span>{duration}</span>
			</div>
		</div>
		
		<div class="hidden md:block md:ml-auto">
			<div class="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-blue-500"></div>
		</div>
	</header>
	
	<!-- Mobile menu (collapsible) -->
	{#if isMobileMenuOpen}
	<div class="md:hidden bg-white border-b p-2">
		<div class="flex justify-between items-center py-2">
			<span class="text-sm">Current Time:</span>
			<span class="text-green-600 font-medium">{currentTime}</span>
		</div>
		<div class="flex justify-between items-center py-2">
			<span class="text-sm">End Time:</span>
			<span class="text-red-600 font-medium">{endTime}</span>
		</div>
		<div class="flex justify-between items-center py-2">
			<span class="text-sm">Duration:</span>
			<div class="flex items-center">
				<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
					<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
				</svg>
				<span>{duration}</span>
			</div>
		</div>
		<div class="flex justify-end py-2">
			<div class="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-blue-500"></div>
		</div>
	</div>
	{/if}

	{#if error}
		<p class="text-red-600 p-4">Error: {error}</p>
	{:else if !result}
		<p class="p-4">Calculating…</p>
	{:else}
		<div class="rundown-table overflow-x-auto">
			<!-- Table Header -->
			<div class="grid grid-cols-2 md:grid-cols-6 bg-white border-b">
				<div class="p-4 flex items-center col-span-2 md:col-span-1">
					<button class="mr-2">
						<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
							<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" />
						</svg>
					</button>
					<span class="font-medium">Rundown</span>
				</div>
				<div class="hidden md:block p-4 font-medium text-center">Est. duration</div>
				<div class="hidden md:block p-4 font-medium text-center">Front time</div>
				<div class="hidden md:block p-4 font-medium text-center">End time</div>
				<div class="hidden md:block p-4 font-medium text-center">Back time</div>
				<div class="p-4 text-right">
					<button class="bg-white p-2 rounded">
						<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
							<path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
						</svg>
					</button>
				</div>
			</div>

			<!-- Rundown Items -->
			{#each getAllItems() as item}
				{#if item.type === 'part'}
					<!-- Part row -->
					<div class="part-row grid grid-cols-2 md:grid-cols-6 bg-gray-100 border-b">
						<div class="p-4 flex items-center col-span-2 md:col-span-1">
							<button class="mr-2">
								<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
									<path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
								</svg>
							</button>
							<span class="font-medium text-gray-700">PART</span>
							<span class="ml-4 md:ml-20 text-gray-700 truncate">{item.title}</span>
						</div>
						<div class="hidden md:block p-4 text-center font-bold">{item.duration}</div>
						<div class="hidden md:block p-4 text-center text-gray-600">{item.frontTime}</div>
						<div class="hidden md:block p-4 text-center text-gray-600">{item.endTime}</div>
						<div class="hidden md:block p-4 text-center text-gray-600">{item.backTime}</div>
						<div class="p-4 flex justify-end md:justify-start">
							<!-- Mobile duration -->
							<span class="md:hidden font-bold">{item.duration}</span>
						</div>
					</div>
				{:else}
					<!-- Item row -->
					<div class="item-row grid grid-cols-2 md:grid-cols-6 bg-white border-b">
						<div class="p-4 flex items-center col-span-2 md:col-span-1 overflow-hidden">
							<span class="mr-2 text-gray-500">{item.number}</span>
							<button class="mr-2 flex-shrink-0">
								<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
									<path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
								</svg>
							</button>
							<span class="bg-gray-400 text-white px-2 py-1 rounded mr-2 text-sm flex-shrink-0">ITEM {item.number}</span>
							<span class="truncate">{item.title}</span>
						</div>
						<div class="hidden md:block p-4 text-center font-bold">{item.duration}</div>
						<div class="hidden md:block p-4 text-center">{item.frontTime}</div>
						<div class="hidden md:block p-4 text-center">{item.endTime}</div>
						<div class="hidden md:block p-4 text-center">{item.backTime}</div>
						<div class="p-4 flex justify-end md:justify-start">
							<!-- Mobile duration -->
							<span class="md:hidden font-bold">{item.duration}</span>
						</div>
					</div>
				{/if}
			{/each}
			
			<!-- Footer with End Time -->
			<div class="grid grid-cols-2 md:grid-cols-6 bg-white border-b">
				<div class="col-span-1 md:col-span-5"></div>
				<div class="p-4 flex justify-end items-center">
					<span class="text-red-600 mr-2">
						<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
							<path fill-rule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clip-rule="evenodd" />
						</svg>
					</span>
					<span class="text-xl font-medium">{endTime}</span>
				</div>
			</div>
		</div>
	{/if}
</main>

<style>
	:global(body) {
		margin: 0;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
	}
	
	@media (max-width: 768px) {
		.rundown-table {
			font-size: 0.9rem;
		}
	}
</style>
