import type { Ptr } from '../../../functions/functions.generated.js';
import {
	floatspan_in,
	floatspan_out,
	floatspan_make,
	floatspan_lower,
	floatspan_upper,
	floatspan_width,
	span_from_hexwkb,
	distance_floatspan_floatspan,
	floatspan_to_intspan,
	floatspan_expand,
	floatspan_ceil,
	floatspan_floor,
	floatspan_round,
	floatspan_degrees,
	floatspan_radians,
} from '../../../functions/functions.generated.js';
import { Span } from '../base/Span.js';

/**
 * A contiguous range of IEEE 754 double-precision floats.
 *
 * @example
 * ```ts
 * const s = FloatSpan.fromBounds(1.5, 10.5); // [1.5, 10.5)
 * console.log(s.lower()); // 1.5
 * console.log(s.width()); // 9.0
 * s.free();
 * ```
 */
export class FloatSpan extends Span {
	protected _make(ptr: Ptr): this {
		return new FloatSpan(ptr) as this;
	}

	// -------------------------------------------------------------------------
	// CONSTRUCTORS
	// -------------------------------------------------------------------------

	/**
	 * Parses a `FloatSpan` from its WKT string representation.
	 * @param str WKT string, e.g. `"[1.5, 10.5)"`.
	 */
	static fromString(str: string): FloatSpan {
		return new FloatSpan(floatspan_in(str));
	}

	/**
	 * Creates a `FloatSpan` from explicit float bounds.
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
	): FloatSpan {
		return new FloatSpan(floatspan_make(lower, upper, lowerInc, upperInc));
	}

	/**
	 * Deserialises a `FloatSpan` from a hex-encoded WKB string produced by {@link asHexWKB}.
	 * @param hexwkb Hex-encoded WKB string.
	 */
	static fromHexWKB(hexwkb: string): FloatSpan {
		return new FloatSpan(span_from_hexwkb(hexwkb));
	}

	// -------------------------------------------------------------------------
	// ACCESSORS
	// -------------------------------------------------------------------------

	/**
	 * Returns the WKT string representation.
	 * @param maxdd Maximum decimal digits of precision (default `15`).
	 */
	toString(maxdd = 15): string {
		return floatspan_out(this._inner, maxdd);
	}

	/** Returns the lower bound as a float. */
	lower(): number {
		return floatspan_lower(this._inner);
	}

	/** Returns the upper bound as a float. */
	upper(): number {
		return floatspan_upper(this._inner);
	}

	/** Returns the length of this span (`upper - lower`). */
	width(): number {
		return floatspan_width(this._inner);
	}

	// -------------------------------------------------------------------------
	// TOPOLOGICAL PREDICATES
	// -------------------------------------------------------------------------

	/**
	 * `true` if `this` and `other` touch at exactly one boundary point without overlapping.
	 * For example, `[1.0, 5.0)` is adjacent to `[5.0, 10.0]`.
	 */
	isAdjacent(other: this): boolean {
		return (
			(this.upper() === other.lower() && this.upperInc() !== other.lowerInc()) ||
			(other.upper() === this.lower() && other.upperInc() !== this.lowerInc())
		);
	}

	// -------------------------------------------------------------------------
	// DISTANCE
	// -------------------------------------------------------------------------

	/**
	 * Returns the distance (gap) between `this` and `other`.
	 * Returns `0` if they overlap or are adjacent.
	 */
	distance(other: this): number {
		return distance_floatspan_floatspan(this._inner, other.inner);
	}

	// -------------------------------------------------------------------------
	// CONVERSIONS & MATH
	// -------------------------------------------------------------------------

	/**
	 * Converts this span to an {@link IntSpan} by truncating bounds and returns the raw WASM pointer.
	 * Use `new IntSpan(ptr)` to obtain a typed object.
	 */
	toIntSpan(): Ptr {
		return floatspan_to_intspan(this._inner);
	}

	/**
	 * Returns a new span expanded by `value` on each side.
	 * @param value Amount to add to each end.
	 */
	expand(value: number): FloatSpan {
		return new FloatSpan(floatspan_expand(this._inner, value));
	}

	/** Returns a new span with both bounds rounded up to the nearest integer. */
	ceil(): FloatSpan {
		return new FloatSpan(floatspan_ceil(this._inner));
	}

	/** Returns a new span with both bounds rounded down to the nearest integer. */
	floor(): FloatSpan {
		return new FloatSpan(floatspan_floor(this._inner));
	}

	/**
	 * Returns a new span with bounds rounded to `maxdd` decimal places.
	 * @param maxdd Number of decimal digits to keep.
	 */
	round(maxdd: number): FloatSpan {
		return new FloatSpan(floatspan_round(this._inner, maxdd));
	}

	/**
	 * Converts bounds from radians to degrees.
	 * @param normalize If `true`, normalises the result to `[0, 360)` (default `false`).
	 */
	degrees(normalize = false): FloatSpan {
		return new FloatSpan(floatspan_degrees(this._inner, normalize));
	}

	/** Converts bounds from degrees to radians. */
	radians(): FloatSpan {
		return new FloatSpan(floatspan_radians(this._inner));
	}
}
