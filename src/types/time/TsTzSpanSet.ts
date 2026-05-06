import type { Ptr, TimestampTz } from '../../core/functions';
import {
	tstzspanset_in,
	tstzspanset_out,
	spanset_from_hexwkb,
	span_to_spanset,
	tstzspanset_num_timestamps,
	tstzspanset_lower,
	tstzspanset_upper,
	tstzspanset_duration_us,
	tstzspanset_timestamptz_n,
	distance_tstzspanset_tstzspan,
	distance_tstzspanset_tstzspanset,
} from '../../core/functions';
import { SpanSet } from '../base/SpanSet';
import { TsTzSpan } from './TsTzSpan';

/**
 * An ordered set of disjoint {@link TsTzSpan} values.
 *
 * Timestamps are represented as `TimestampTz` integers (microseconds since 2000-01-01 UTC).
 *
 * @example
 * ```ts
 * const ss = TsTzSpanSet.fromString('{[2020-01-01, 2020-06-01), [2020-09-01, 2020-12-31]}');
 * console.log(ss.numSpans());      // 2
 * console.log(ss.numTimestamps()); // total timestamps across all spans
 * ss.free();
 * ```
 */
export class TsTzSpanSet extends SpanSet<TsTzSpan> {
	protected _makeSpanSet(ptr: Ptr): this {
		return new TsTzSpanSet(ptr) as this;
	}

	protected _makeSpan(ptr: Ptr): TsTzSpan {
		return new TsTzSpan(ptr);
	}

	// -------------------------------------------------------------------------
	// CONSTRUCTORS
	// -------------------------------------------------------------------------

	/**
	 * Parses a `TsTzSpanSet` from its WKT string representation.
	 * @param str WKT string, e.g. `"{[2020-01-01, 2020-06-01), [2020-09-01, 2020-12-31]}"`.
	 */
	static fromString(str: string): TsTzSpanSet {
		return new TsTzSpanSet(tstzspanset_in(str));
	}

	/**
	 * Deserialises a `TsTzSpanSet` from a hex-encoded WKB string produced by {@link asHexWKB}.
	 * @param hexwkb Hex-encoded WKB string.
	 */
	static fromHexWKB(hexwkb: string): TsTzSpanSet {
		return new TsTzSpanSet(spanset_from_hexwkb(hexwkb));
	}

	/**
	 * Wraps a single {@link TsTzSpan} into a one-element `TsTzSpanSet`.
	 * @param span The span to wrap.
	 */
	static fromSpan(span: TsTzSpan): TsTzSpanSet {
		return new TsTzSpanSet(span_to_spanset(span.inner));
	}

	// -------------------------------------------------------------------------
	// OUTPUT
	// -------------------------------------------------------------------------

	/** Returns the WKT string representation. */
	toString(): string {
		return tstzspanset_out(this._inner);
	}

	// -------------------------------------------------------------------------
	// ACCESSORS
	// -------------------------------------------------------------------------

	/** Returns the lower bound of the first span as microseconds since 2000-01-01 UTC. */
	lower(): TimestampTz {
		return tstzspanset_lower(this._inner);
	}

	/** Returns the upper bound of the last span as microseconds since 2000-01-01 UTC. */
	upper(): TimestampTz {
		return tstzspanset_upper(this._inner);
	}

	/** Returns the total number of distinct timestamps across all spans. */
	numTimestamps(): number {
		return tstzspanset_num_timestamps(this._inner);
	}

	/** Returns the timestamp of the first span's lower bound as microseconds since 2000-01-01 UTC. */
	startTimestamp(): TimestampTz {
		return tstzspanset_lower(this._inner);
	}

	/** Returns the timestamp of the last span's upper bound as microseconds since 2000-01-01 UTC. */
	endTimestamp(): TimestampTz {
		return tstzspanset_upper(this._inner);
	}

	/**
	 * Returns the n-th timestamp (0-based index) as microseconds since 2000-01-01 UTC.
	 * @param n 0-based index (MEOS internally uses 1-based indexing).
	 */
	timestampN(n: number): TimestampTz {
		return tstzspanset_timestamptz_n(this._inner, n + 1);
	}

	/**
	 * Returns the total duration of this span set in milliseconds.
	 * @param boundSpan
	 *   - `false` (default): sum of all individual span durations.
	 *   - `true`: duration of the bounding span (from first lower to last upper).
	 */
	durationMs(boundSpan = false): number {
		return tstzspanset_duration_us(this._inner, boundSpan) / 1000;
	}

	// -------------------------------------------------------------------------
	// DISTANCE
	// -------------------------------------------------------------------------

	/**
	 * Returns the distance (gap) between `this` and `other` in microseconds.
	 * Returns `0` if they overlap. Accepts either a {@link TsTzSpan} or a `TsTzSpanSet`.
	 */
	distance(other: TsTzSpan | TsTzSpanSet): number {
		if (other instanceof TsTzSpan)
			return distance_tstzspanset_tstzspan(this._inner, other.inner);
		return distance_tstzspanset_tstzspanset(this._inner, other.inner);
	}
}
