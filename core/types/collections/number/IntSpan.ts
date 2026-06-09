import type { Ptr } from '../../../functions/functions.generated.js';
import {
	intspan_in,
	intspan_out,
	intspan_make,
	intspan_lower,
	intspan_upper,
	intspan_width,
	span_from_hexwkb,
	distance_intspan_intspan,
	intspan_to_floatspan,
	intspan_expand,
	intspan_shift_scale,
} from '../../../functions/functions.generated.js';
import { Span } from '../base/Span.js';

/**
 * A contiguous range of integers, stored internally as a half-open interval `[lower, upper)`.
 *
 * @example
 * ```ts
 * const s = IntSpan.fromBounds(1, 10); // [1, 10)
 * console.log(s.lower()); // 1
 * console.log(s.upper()); // 10
 * s.free();
 * ```
 */
export class IntSpan extends Span {
	protected _make(ptr: Ptr): this {
		return new IntSpan(ptr) as this;
	}

	// -------------------------------------------------------------------------
	// CONSTRUCTORS
	// -------------------------------------------------------------------------

	/**
	 * Parses an `IntSpan` from its WKT string representation.
	 * @param str WKT string, e.g. `"[1, 10)"`.
	 */
	static fromString(str: string): IntSpan {
		return new IntSpan(intspan_in(str));
	}

	/**
	 * Creates an `IntSpan` from explicit integer bounds.
	 * MEOS normalises all integer spans to half-open form internally,
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
	): IntSpan {
		return new IntSpan(intspan_make(lower, upper, lowerInc, upperInc));
	}

	/**
	 * Deserialises an `IntSpan` from a hex-encoded WKB string produced by {@link asHexWKB}.
	 * @param hexwkb Hex-encoded WKB string.
	 */
	static fromHexWKB(hexwkb: string): IntSpan {
		return new IntSpan(span_from_hexwkb(hexwkb));
	}

	// -------------------------------------------------------------------------
	// ACCESSORS
	// -------------------------------------------------------------------------

	/** Returns the WKT string representation (e.g. `[1, 10)`). */
	toString(): string {
		return intspan_out(this._inner);
	}

	/** Returns the inclusive lower bound as an integer. */
	lower(): number {
		return intspan_lower(this._inner);
	}

	/** Returns the exclusive upper bound as an integer (stored half-open). */
	upper(): number {
		return intspan_upper(this._inner);
	}

	/** Returns the number of integers in this span (`upper - lower`). */
	width(): number {
		return intspan_width(this._inner);
	}

	// -------------------------------------------------------------------------
	// TOPOLOGICAL PREDICATES
	// -------------------------------------------------------------------------

	/**
	 * `true` if `this` and `other` touch at exactly one boundary point without overlapping.
	 * For example, `[1, 5)` is adjacent to `[5, 10)`.
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
	 * Returns the distance (gap) between `this` and `other` in integers.
	 * Returns `0` if they overlap or are adjacent.
	 */
	distance(other: this): number {
		return distance_intspan_intspan(this._inner, other.inner);
	}

	// -------------------------------------------------------------------------
	// CONVERSIONS
	// -------------------------------------------------------------------------

	/**
	 * Converts this span to a {@link FloatSpan} and returns the raw WASM pointer.
	 * Use `new FloatSpan(ptr)` to obtain a typed object.
	 */
	toFloatSpan(): Ptr {
		return intspan_to_floatspan(this._inner);
	}

	/**
	 * Returns a new span expanded by `value` on each side.
	 * @param value Number of integers to add to each end.
	 */
	expand(value: number): IntSpan {
		return new IntSpan(intspan_expand(this._inner, value));
	}

	/**
	 * Returns a new span shifted and/or scaled along the integer axis.
	 * @param shift Amount to add to every bound (ignored when `hasShift` is `false`).
	 * @param width New total width (ignored when `hasWidth` is `false`).
	 * @param hasShift Set to `false` to skip shifting (default `true`).
	 * @param hasWidth Set to `false` to skip scaling (default `true`).
	 */
	shiftScale(shift: number, width: number, hasShift = true, hasWidth = true): IntSpan {
		return new IntSpan(intspan_shift_scale(this._inner, shift, width, hasShift, hasWidth));
	}
}
