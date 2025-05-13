// src/helpers/helpers.ts

export interface EpisodeData {
  episode: {
    on_air_time: number;    // seconds
    parts: string[];        // array of part IDs
  };
  part: Record<string, {
    estimated_duration: number; // milliseconds
    items: string[];            // array of item IDs
  }>;
  item: Record<string, {
    estimated_duration: number; // milliseconds
  }>;
}

export interface TimingsData {
  episode: {
    on_air_time: number;    // seconds
  };
  part: Record<string, {
    estimated_duration: number; // ms
    front_time?: number;    // seconds
    back_time?: number;     // seconds
    end_time?: number;      // seconds
  }>;
  item: Record<string, {
    estimated_duration: number; // ms
    front_time?: number;   // seconds
    back_time?: number;    // seconds
    end_time?: number;     // seconds
  }>;
}

/** add ms → s offset to a start time (in seconds) */
export function calculateTime(startSec: number, durationMs: number): number {
  return startSec + durationMs / 1000;
}

/** 
 * Fill in front_time, back_time, end_time for one item.
 * Returns the updated item timings object (mutation-in-place).
 */
export function calculateItemTiming(
  itemTimings: TimingsData['item'][string],
  prevFront: number,
  prevBack: number
): void {
  itemTimings.front_time = prevFront;
  itemTimings.back_time  = prevBack;
  itemTimings.end_time   = calculateTime(prevFront, itemTimings.estimated_duration);
}

/**
 * Fill in front_time, back_time, end_time for one part,
 * then for each of its items in sequence.
 */
export function calculatePartTiming(
  episodeData: EpisodeData,
  timings: TimingsData,
  partId: string,
  prevFront: number,
  prevBack: number
): void {
  const partTim = timings.part[partId];
  partTim.front_time = prevFront;
  partTim.back_time  = prevBack;
  partTim.end_time   = calculateTime(prevFront, partTim.estimated_duration);

  let itemFront = prevFront;
  let itemBack  = prevFront;

  for (const itemId of episodeData.part[partId].items) {
    const itemTim = timings.item[itemId];
    // set that item’s times
    calculateItemTiming(itemTim, itemFront, itemBack);

    // advance both cursors by that item’s duration
    const delta = itemTim.estimated_duration / 1000;
    itemFront += delta;
    itemBack  += delta;
  }
}

/**
 * Orchestrator: walks through all parts in order
 * and returns a fully-populated timings structure.
 */
export function computeTimings(
  episodeData: EpisodeData,
  timingsData: TimingsData
): TimingsData {
  const parts = episodeData.episode.parts;
  if (!parts?.length) {
    throw new Error('Episode has no parts defined!');
  }

  let partFront = timingsData.episode.on_air_time;
  let partBack  = timingsData.episode.on_air_time;

  for (const partId of parts) {
    calculatePartTiming(episodeData, timingsData, partId, partFront, partBack);

    // advance the part cursors
    const delta = timingsData.part[partId].estimated_duration / 1000;
    partFront += delta;
    partBack  += delta;
  }

  return timingsData;
}
