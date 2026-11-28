/**
 * MEOS.js → DeckGL adapter (core, framework-free).
 *
 * Converts a temporal point (TGeomPoint / TGeogPoint) into the
 * `{ path, timestamps }` structure consumed by DeckGL's TripsLayer.
 *
 * This module intentionally depends on neither `deck.gl` nor `react`, nor even
 * on MEOS.js core types: it only needs a value answering the coordinates and
 * timestamps of its instants (see {@link CoordsSource}), as a MEOS.js
 * `TGeomPoint` does, or one exposing `asMFJSON()` (see {@link MfjsonSource}).
 * The bridge to MEOS is the MobilityDB data model.
 */

import { extractSegments, divisorFor, mfjsonDatetimeToMs } from './mfjson.js';

export { mfjsonDatetimeToMs } from './mfjson.js';

// Anything that can serialize itself to MF-JSON — i.e. a MEOS.js `Temporal`.
export interface MfjsonSource {
	asMFJSON(
		withBbox?: boolean,
		flags?: number,
		precision?: number,
		srs?: string | null
	): string;
}

// A temporal point answering the x and y coordinates and the Unix-millisecond
// timestamps of the instants of each of its sequences: a MEOS.js `TGeomPoint`.
export interface CoordsSource {
	sequenceCoords(): { x: number[]; y: number[]; ms: number[] }[];
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
	// Coordinate decimal precision requested from MEOS for a value read from
	// its MF-JSON. Default `6`; the coordinates of a `CoordsSource` are exact.
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

// One segment of a trip, its timestamps in Unix milliseconds.
interface Segment {
	path: [number, number][];
	ms: number[];
}

// The segments of a temporal point: read from the coordinates of its instants
// when it answers them, else parsed from its MF-JSON.
function segmentsOf(t: CoordsSource | MfjsonSource, precision: number): Segment[] {
	if ('sequenceCoords' in t)
		return t.sequenceCoords().map(c => ({
			path: c.x.map((x, i) => [x, c.y[i]] as [number, number]),
			ms: c.ms,
		}));
	return extractSegments(t.asMFJSON(false, 3, precision, null)).map(seg => ({
		path: (seg.coordinates ?? []).map(c => [c[0], c[1]] as [number, number]),
		ms: seg.datetimes.map(mfjsonDatetimeToMs),
	}));
}

// Earliest instant across all segments, in Unix milliseconds (0 when there are none).
function minMs(segments: Segment[]): number {
	let min = Infinity;
	for (const seg of segments) for (const ms of seg.ms) if (ms < min) min = ms;
	return Number.isFinite(min) ? min : 0;
}

function segmentToTrip(seg: Segment, origin: number, divisor: number): Trip {
	return { path: seg.path, timestamps: seg.ms.map(ms => (ms - origin) / divisor) };
}

/**
 * Convert a single temporal point to its renderable segments.
 *
 * Returns an array because a sequence-set (a trip with temporal gaps) maps to
 * several disjoint paths; an instant or a single sequence yields one entry.
 */
export function tgeompointToTrips(t: CoordsSource | MfjsonSource, opts: ToTripsOptions = {}): Trip[] {
	const segments = segmentsOf(t, opts.precision ?? 6);
	const origin = opts.timeOrigin ?? minMs(segments);
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
	ts: (CoordsSource | MfjsonSource)[],
	opts: ToTripsOptions = {}
): TripCollection {
	const precision = opts.precision ?? 6;
	const allSegments = ts.flatMap(t => segmentsOf(t, precision));
	const origin = opts.timeOrigin ?? minMs(allSegments);
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
