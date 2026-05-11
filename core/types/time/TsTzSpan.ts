import type { Ptr, TimestampTz } from '../../functions/functions.generated';
import {
	tstzspan_in,
	tstzspan_out,
	tstzspan_make,
	tstzspan_lower,
	tstzspan_upper,
	span_from_hexwkb,
	adjacent_span_span,
	distance_tstzspan_tstzspan,
	tstzspan_shift_scale,
	tstzspan_expand,
	tstzspan_tprecision,
	tstzspan_to_datespan,
} from '../../functions/functions.generated';
import { Span } from '../base/Span';

/**
 * A contiguous range of timestamps with timezone.
 *
 * Timestamps are represented as `TimestampTz` integers (microseconds since 2000-01-01 UTC).
 *
 * @example
 * ```ts
 * const s = TsTzSpan.fromString('[2020-01-01, 2020-12-31]');
 * console.log(s.lower()); // microseconds since 2000-01-01 UTC
 * console.log(s.durationMs()); // duration in milliseconds
 * s.free();
 * ```
 */
export class TsTzSpan extends Span {
	protected _make(ptr: Ptr): this {
		return new TsTzSpan(ptr) as this;
	}

	// -------------------------------------------------------------------------
	// CONSTRUCTORS
	// -------------------------------------------------------------------------

	/**
	 * Parses a `TsTzSpan` from its WKT string representation.
	 * @param str WKT string, e.g. `"[2020-01-01, 2020-12-31]"`.
	 */
	static fromString(str: string): TsTzSpan {
		return new TsTzSpan(tstzspan_in(str));
	}

	/**
	 * Creates a `TsTzSpan` from explicit timestamp bounds.
	 * @param lower Lower bound as microseconds since 2000-01-01 UTC.
	 * @param upper Upper bound as microseconds since 2000-01-01 UTC.
	 * @param lowerInc `true` for inclusive lower bound `[` (default).
	 * @param upperInc `true` for inclusive upper bound `]` (default `false`).
	 */
	static fromTimestamps(
		lower: TimestampTz,
		upper: TimestampTz,
		lowerInc = true,
		upperInc = false
	): TsTzSpan {
		return new TsTzSpan(tstzspan_make(lower, upper, lowerInc, upperInc));
	}

	/**
	 * Deserialises a `TsTzSpan` from a hex-encoded WKB string produced by {@link asHexWKB}.
	 * @param hexwkb Hex-encoded WKB string.
	 */
	static fromHexWKB(hexwkb: string): TsTzSpan {
		return new TsTzSpan(span_from_hexwkb(hexwkb));
	}

	// -------------------------------------------------------------------------
	// ACCESSORS
	// -------------------------------------------------------------------------

	/** Returns the WKT string representation (e.g. `[2020-01-01 00:00:00+00, 2020-12-31 00:00:00+00]`). */
	toString(): string {
		return tstzspan_out(this._inner);
	}

	/** Returns the lower bound as microseconds since 2000-01-01 UTC. */
	lower(): TimestampTz {
		return tstzspan_lower(this._inner);
	}

	/** Returns the upper bound as microseconds since 2000-01-01 UTC. */
	upper(): TimestampTz {
		return tstzspan_upper(this._inner);
	}

	/** Returns the duration of this span in milliseconds (`(upper - lower) / 1000`). */
	durationMs(): number {
		return (this.upper() - this.lower()) / 1000;
	}

	// -------------------------------------------------------------------------
	// TOPOLOGICAL PREDICATES
	// -------------------------------------------------------------------------

	/**
	 * `true` if `this` and `other` share exactly one boundary timestamp without overlapping.
	 * Uses the MEOS C-level adjacency check which handles half-open bound semantics correctly.
	 */
	isAdjacent(other: this): boolean {
		return adjacent_span_span(this._inner, other.inner);
	}

	// -------------------------------------------------------------------------
	// DISTANCE
	// -------------------------------------------------------------------------

	/**
	 * Returns the distance (gap) between `this` and `other` in microseconds.
	 * Returns `0` if they overlap or are adjacent.
	 */
	distance(other: this): number {
		return distance_tstzspan_tstzspan(this._inner, other.inner);
	}

	// -------------------------------------------------------------------------
	// TRANSFORMATIONS
	// -------------------------------------------------------------------------

	/**
	 * Returns a new span shifted and/or scaled along the time axis.
	 * @param shift Raw WASM pointer to a MEOS interval for the shift amount (`0` to skip).
	 * @param duration Raw WASM pointer to a MEOS interval for the new duration (`0` to skip).
	 */
	shiftScale(shift: Ptr, duration: Ptr): TsTzSpan {
		return new TsTzSpan(tstzspan_shift_scale(this._inner, shift, duration));
	}

	/**
	 * Returns a new span expanded by the given interval on each side.
	 * @param interval Raw WASM pointer to a MEOS interval.
	 */
	expand(interval: Ptr): TsTzSpan {
		return new TsTzSpan(tstzspan_expand(this._inner, interval));
	}

	/**
	 * Returns a new span snapped to the nearest multiple of `duration` starting from `origin`.
	 * @param duration Raw WASM pointer to a MEOS interval defining the bucket size.
	 * @param origin  Reference timestamp in microseconds since 2000-01-01 UTC.
	 */
	tprecision(duration: Ptr, origin: TimestampTz): TsTzSpan {
		return new TsTzSpan(tstzspan_tprecision(this._inner, duration, origin));
	}

	// -------------------------------------------------------------------------
	// CONVERSIONS
	// -------------------------------------------------------------------------

	/**
	 * Converts this span to a {@link DateSpan} (timestamps truncated to midnight UTC)
	 * and returns the raw WASM pointer. Use `new DateSpan(ptr)` to obtain a typed object.
	 */
	toDateSpan(): Ptr {
		return tstzspan_to_datespan(this._inner);
	}
}
