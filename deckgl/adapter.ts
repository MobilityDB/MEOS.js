/**
 * MEOS.js → DeckGL adapter (core, framework-free).
 *
 * Converts a temporal point (TGeomPoint / TGeogPoint) into the
 * `{ path, timestamps }` structure consumed by DeckGL's TripsLayer.
 *
 * This module intentionally depends on neither `deck.gl` nor `react`, nor even
 * on MEOS.js core types: it only needs a value exposing `asMFJSON()` (see
 * {@link MfjsonSource}). The bridge to MEOS is the MobilityDB data model.
 */

import {
	extractSegments,
	minTimestampMs,
	divisorFor,
	relativeTimestamps,
	type RawSegment,
} from './mfjson';

export { mfjsonDatetimeToMs } from './mfjson';

// Anything that can serialize itself to MF-JSON — i.e. a MEOS.js `Temporal`.
export interface MfjsonSource {
	asMFJSON(
		withBbox?: boolean,
		flags?: number,
		precision?: number,
		srs?: string | null
	): string;
}

// One renderable trip segment, in the shape DeckGL's TripsLayer expects.
export interface Trip {
	// Ordered `[lng, lat]` positions.
	path: [number, number][];
	// Timestamps aligned with `path`, relative to a shared origin (see options).
	timestamps: number[];
}

export interface ToTripsOptions {
	/**
	 * Epoch milliseconds used as `t = 0` for the produced timestamps.
	 * Defaults to the earliest instant of the input(s). Passing a shared value
	 * keeps several trips on the same animation clock.
	 */
	timeOrigin?: number;
	// Output unit for `timestamps`. Default `'seconds'`.
	timeUnit?: 'seconds' | 'milliseconds';
	// Coordinate decimal precision requested from MEOS. Default `6`.
	precision?: number;
}

// Many trips sharing a single animation clock.
export interface TripCollection {
	trips: Trip[];
	// Epoch milliseconds corresponding to `t = 0`.
	timeOrigin: number;
	// `[0, max]` extent of the timestamps, in the chosen `timeUnit`.
	timeRange: [number, number];
}

function parseSegments(t: MfjsonSource, precision: number): RawSegment[] {
	return extractSegments(t.asMFJSON(false, 3, precision, null));
}

function segmentToTrip(seg: RawSegment, origin: number, divisor: number): Trip {
	return {
		path: (seg.coordinates ?? []).map(c => [c[0], c[1]] as [number, number]),
		timestamps: relativeTimestamps(seg.datetimes, origin, divisor),
	};
}

/**
 * Convert a single temporal point to its renderable segments.
 *
 * Returns an array because a sequence-set (a trip with temporal gaps) maps to
 * several disjoint paths; an instant or a single sequence yields one entry.
 */
export function tgeompointToTrips(t: MfjsonSource, opts: ToTripsOptions = {}): Trip[] {
	const segments = parseSegments(t, opts.precision ?? 6);
	const origin = opts.timeOrigin ?? minTimestampMs(segments);
	const divisor = divisorFor(opts.timeUnit);
	return segments.map(seg => segmentToTrip(seg, origin, divisor));
}

/**
 * Convert many temporal points onto a single shared animation clock.
 *
 * The time origin defaults to the earliest instant across *all* inputs, so the
 * resulting trips stay synchronized — the manual step MobilityDeck did by hand.
 */
export function tgeompointsToTrips(
	ts: MfjsonSource[],
	opts: ToTripsOptions = {}
): TripCollection {
	const precision = opts.precision ?? 6;
	const allSegments = ts.flatMap(t => parseSegments(t, precision));
	const origin = opts.timeOrigin ?? minTimestampMs(allSegments);
	const divisor = divisorFor(opts.timeUnit);

	let maxRel = 0;
	const trips: Trip[] = [];
	for (const seg of allSegments) {
		const trip = segmentToTrip(seg, origin, divisor);
		for (const t of trip.timestamps) if (t > maxRel) maxRel = t;
		trips.push(trip);
	}
	return { trips, timeOrigin: origin, timeRange: [0, maxRel] };
}
