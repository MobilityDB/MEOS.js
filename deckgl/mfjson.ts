/**
 * Internal MF-JSON parsing shared by the adapter and the helpers.
 *
 * Not part of the public surface (except `mfjsonDatetimeToMs`, re-exported by
 * the adapter): handles the two structural shapes MEOS emits — top-level
 * `coordinates`/`values` vs nested `sequences[]` — and the `+00` offset quirk.
 */

// One parsed MF-JSON segment. Points carry `coordinates`, floats carry `values`.
export interface RawSegment {
	datetimes: string[];
	coordinates?: number[][];
	values?: number[];
}

interface Mfjson {
	type: string;
	coordinates?: number[][] | number[];
	values?: number[] | number;
	datetimes?: string[] | string;
	sequences?: RawSegment[];
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
		s = s.replace(
			/([+-])(\d{2})(?::?(\d{2}))?$/,
			(_m, sign, hh, mm) => `${sign}${hh}:${mm ?? '00'}`
		);
	}
	const ms = Date.parse(s);
	if (Number.isNaN(ms)) throw new Error(`Cannot parse MF-JSON datetime: ${iso}`);
	return ms;
}

/**
 * Normalize an MF-JSON string into a flat list of segments.
 *
 * - SequenceSet -> one segment per sub-sequence (gaps become separate segments).
 * - Sequence    -> a single segment.
 * - Instant     -> a single one-element segment.
 *
 * Works for both MovingPoint (`coordinates`) and MovingFloat (`values`).
 */
export function extractSegments(json: string): RawSegment[] {
	const mf = JSON.parse(json) as Mfjson;
	if (Array.isArray(mf.sequences)) return mf.sequences;

	const dt = mf.datetimes;
	if (dt == null) return [];

	if (mf.coordinates != null) {
		const isInstant = typeof mf.coordinates[0] === 'number' || typeof dt === 'string';
		return isInstant
			? [{ coordinates: [mf.coordinates as number[]], datetimes: [dt as string] }]
			: [{ coordinates: mf.coordinates as number[][], datetimes: dt as string[] }];
	}
	if (mf.values != null) {
		const isInstant = typeof mf.values === 'number' || typeof dt === 'string';
		return isInstant
			? [{ values: [mf.values as number], datetimes: [dt as string] }]
			: [{ values: mf.values as number[], datetimes: dt as string[] }];
	}
	return [];
}

// Earliest instant across all segments, in epoch ms (0 when there are none).
export function minTimestampMs(segments: RawSegment[]): number {
	let min = Infinity;
	for (const seg of segments) {
		for (const d of seg.datetimes) {
			const ms = mfjsonDatetimeToMs(d);
			if (ms < min) min = ms;
		}
	}
	return Number.isFinite(min) ? min : 0;
}

// Divisor mapping epoch-ms deltas to the requested output unit.
export function divisorFor(timeUnit: 'seconds' | 'milliseconds' | undefined): number {
	return timeUnit === 'milliseconds' ? 1 : 1000;
}

// Map datetimes to numbers relative to `origin`, in the unit implied by `divisor`.
export function relativeTimestamps(
	datetimes: string[],
	origin: number,
	divisor: number
): number[] {
	return datetimes.map(d => (mfjsonDatetimeToMs(d) - origin) / divisor);
}
