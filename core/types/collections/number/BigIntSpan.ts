import type { Ptr } from '../../../functions/functions.generated.js';
import {
	bigintspan_in,
	bigintspan_out,
	bigintspan_make,
	bigintspan_lower,
	bigintspan_upper,
	bigintspan_width,
	span_from_hexwkb,
	adjacent_span_span,
	distance_bigintspan_bigintspan,
	bigintspan_expand,
	bigintspan_shift_scale,
} from '../../../functions/functions.generated.js';
import { Span } from '../base/Span.js';

/**
 * A contiguous range of 64-bit integers, stored internally as a half-open interval `[lower, upper)`.
 *
 * @example
 * ```ts
 * const s = BigIntSpan.fromBounds(1, 100); // [1, 100)
 * console.log(s.lower()); // 1
 * console.log(s.upper()); // 100
 * s.free();
 * ```
 */
export class BigIntSpan extends Span {
	protected _make(ptr: Ptr): this {
		return new BigIntSpan(ptr) as this;
	}

	// -------------------------------------------------------------------------
	// CONSTRUCTORS
	// -------------------------------------------------------------------------

	/**
	 * Parses a `BigIntSpan` from its WKT string representation.
	 * @param str WKT string, e.g. `"[1, 100)"`.
	 */
	static fromString(str: string): BigIntSpan {
		return new BigIntSpan(bigintspan_in(str));
	}

	/**
	 * Creates a `BigIntSpan` from explicit integer bounds.
	 * MEOS normalises integer spans to half-open form internally,
	 * so `fromBounds(1, 10, true, true)` is stored as `[1, 11)`.
	 *
	 * @param lower Lower bound value.
	 * @param upper Upper bound value.
	 * @param lowerInc `true` for inclusive lower bound `[` (default).
	 * @param upperInc `true` for inclusive upper bound `]` (default `false`).
	 */
	static fromBounds(
		lower: number,
		upper: number,
		lowerInc = true,
		upperInc = false
	): BigIntSpan {
		return new BigIntSpan(bigintspan_make(lower, upper, lowerInc, upperInc));
	}

	/**
	 * Deserialises a `BigIntSpan` from a hex-encoded WKB string produced by {@link asHexWKB}.
	 * @param hexwkb Hex-encoded WKB string.
	 */
	static fromHexWKB(hexwkb: string): BigIntSpan {
		return new BigIntSpan(span_from_hexwkb(hexwkb));
	}

	// -------------------------------------------------------------------------
	// ACCESSORS
	// -------------------------------------------------------------------------

	/** Returns the WKT string representation (e.g. `[1, 100)`). */
	toString(): string {
		return bigintspan_out(this._inner);
	}

	/** Returns the inclusive lower bound. */
	lower(): number {
		return bigintspan_lower(this._inner);
	}

	/** Returns the exclusive upper bound (stored half-open). */
	upper(): number {
		return bigintspan_upper(this._inner);
	}

	/** Returns the number of integers in this span (`upper - lower`). */
	width(): number {
		return bigintspan_width(this._inner);
	}

	// -------------------------------------------------------------------------
	// TOPOLOGICAL PREDICATES
	// -------------------------------------------------------------------------

	/**
	 * `true` if `this` and `other` touch at exactly one boundary point without overlapping.
	 */
	isAdjacent(other: this): boolean {
		return adjacent_span_span(this._inner, other.inner);
	}

	// -------------------------------------------------------------------------
	// DISTANCE
	// -------------------------------------------------------------------------

	/**
	 * Returns the distance (gap) between `this` and `other` in integers.
	 * Returns `0` if they overlap or are adjacent.
	 */
	distance(other: this): number {
		return distance_bigintspan_bigintspan(this._inner, other.inner);
	}

	// -------------------------------------------------------------------------
	// TRANSFORMATIONS
	// -------------------------------------------------------------------------

	/**
	 * Returns a new span expanded by `value` on each side.
	 * @param value Number of integers to add to each end.
	 */
	expand(value: number): BigIntSpan {
		return new BigIntSpan(bigintspan_expand(this._inner, value));
	}

	/**
	 * Returns a new span shifted and/or scaled along the integer axis.
	 * @param shift Amount to add to every bound (ignored when `hasShift` is `false`).
	 * @param width New total width (ignored when `hasWidth` is `false`).
	 * @param hasShift Set to `false` to skip shifting (default `true`).
	 * @param hasWidth Set to `false` to skip scaling (default `true`).
	 */
	shiftScale(shift: number, width: number, hasShift = true, hasWidth = true): BigIntSpan {
		return new BigIntSpan(
			bigintspan_shift_scale(this._inner, shift, width, hasShift, hasWidth)
		);
	}
}
