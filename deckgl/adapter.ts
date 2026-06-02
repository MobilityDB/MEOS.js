/**
 * MEOS.js → DeckGL adapter (core, framework-free).
 *
 * Converts a temporal point (TGeomPoint / TGeogPoint) into the
 * `{ path, timestamps }` structure consumed by DeckGL's TripsLayer.
 *
 * This module intentionally depends on neither `deck.gl` nor `react`: it only
 * needs a value exposing `asMFJSON()` (see {@link MfjsonSource}). The bridge to
 * MEOS is the MobilityDB data model, via MF-JSON.
 */

/** Anything that can serialize itself to MF-JSON — i.e. a MEOS.js `Temporal`. */
export interface MfjsonSource {
	asMFJSON(withBbox?: boolean, flags?: number, precision?: number, srs?: string | null): string;
}

/** One renderable trip segment, in the shape DeckGL's TripsLayer expects. */
export interface Trip {
	/** Ordered `[lng, lat]` positions. */
	path: [number, number][];
	/** Timestamps aligned with `path`, relative to a shared origin (see options). */
	timestamps: number[];
}

export interface ToTripsOptions {
	/**
	 * Epoch milliseconds used as `t = 0` for the produced timestamps.
	 * Defaults to the earliest instant of the input(s). Passing a shared value
	 * keeps several trips on the same animation clock.
	 */
	timeOrigin?: number;
	/** Output unit for `timestamps`. Default `'seconds'`. */
	timeUnit?: 'seconds' | 'milliseconds';
	/** Coordinate decimal precision requested from MEOS. Default `6`. */
	precision?: number;
}

/** Many trips sharing a single animation clock. */
export interface TripCollection {
	trips: Trip[];
	/** Epoch milliseconds corresponding to `t = 0`. */
	timeOrigin: number;
	/** `[0, max]` extent of the timestamps, in the chosen `timeUnit`. */
	timeRange: [number, number];
}

// --- internal MF-JSON shape (only the fields we read) ----------------------

interface MfjsonSegment {
	coordinates: number[][];
	datetimes: string[];
}

interface Mfjson {
	type: string;
	// Instant / Sequence: top-level.
	coordinates?: number[][] | number[];
	datetimes?: string[] | string;
	// SequenceSet: nested.
	sequences?: MfjsonSegment[];
}

/**
 * Parse an MF-JSON datetime to epoch milliseconds.
 *
 * MEOS emits zone offsets as `+00` / `-05`, which `Date.parse` rejects (it
 * needs `+00:00`, `Z`, or `+0000`). We normalize the trailing offset before
 * parsing so timestamps never silently become `NaN`.
 */
export function mfjsonDatetimeToMs(iso: string): number {
	let s = iso;
	if (s.includes('T') && !s.endsWith('Z')) {
		s = s.replace(/([+-])(\d{2})(?::?(\d{2}))?$/, (_m, sign, hh, mm) => `${sign}${hh}:${mm ?? '00'}`);
	}
	const ms = Date.parse(s);
	if (Number.isNaN(ms)) throw new Error(`Cannot parse MF-JSON datetime: ${iso}`);
	return ms;
}

/**
 * Normalize MF-JSON into a flat list of segments.
 *
 * - SequenceSet → one segment per sub-sequence (gaps become separate trips).
 * - Sequence    → a single segment.
 * - Instant     → a single one-point segment.
 */
function extractSegments(mf: Mfjson): MfjsonSegment[] {
	if (Array.isArray(mf.sequences)) return mf.sequences;
	if (mf.coordinates == null || mf.datetimes == null) return [];

	// Instant: `coordinates` is a single `[x, y]`, `datetimes` a single string.
	const isInstant = typeof mf.coordinates[0] === 'number' || typeof mf.datetimes === 'string';
	if (isInstant) {
		return [{
			coordinates: [mf.coordinates as number[]],
			datetimes: [mf.datetimes as string],
		}];
	}
	return [{ coordinates: mf.coordinates as number[][], datetimes: mf.datetimes as string[] }];
}

function parseSegments(t: MfjsonSource, precision: number): MfjsonSegment[] {
	return extractSegments(JSON.parse(t.asMFJSON(false, 3, precision, null)) as Mfjson);
}

function minTimestampMs(segments: MfjsonSegment[]): number {
	let min = Infinity;
	for (const seg of segments) {
		for (const d of seg.datetimes) {
			const ms = mfjsonDatetimeToMs(d);
			if (ms < min) min = ms;
		}
	}
	return Number.isFinite(min) ? min : 0;
}

function segmentToTrip(seg: MfjsonSegment, origin: number, divisor: number): Trip {
	return {
		path: seg.coordinates.map((c) => [c[0], c[1]] as [number, number]),
		timestamps: seg.datetimes.map((d) => (mfjsonDatetimeToMs(d) - origin) / divisor),
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
	const divisor = opts.timeUnit === 'milliseconds' ? 1 : 1000;
	return segments.map((seg) => segmentToTrip(seg, origin, divisor));
}

/**
 * Convert many temporal points onto a single shared animation clock.
 *
 * The time origin defaults to the earliest instant across *all* inputs, so the
 * resulting trips stay synchronized — the manual step MobilityDeck did by hand.
 */
export function tgeompointsToTrips(ts: MfjsonSource[], opts: ToTripsOptions = {}): TripCollection {
	const precision = opts.precision ?? 6;
	const perInput = ts.map((t) => parseSegments(t, precision));
	const allSegments = perInput.flat();
	const origin = opts.timeOrigin ?? minTimestampMs(allSegments);
	const divisor = opts.timeUnit === 'milliseconds' ? 1 : 1000;

	let maxRel = 0;
	const trips: Trip[] = [];
	for (const seg of allSegments) {
		const trip = segmentToTrip(seg, origin, divisor);
		for (const t of trip.timestamps) if (t > maxRel) maxRel = t;
		trips.push(trip);
	}
	return { trips, timeOrigin: origin, timeRange: [0, maxRel] };
}
