import type { Ptr } from '../../../functions/functions.generated';
import {
	floatspanset_in,
	floatspanset_out,
	spanset_from_hexwkb,
	span_to_spanset,
	floatspanset_lower,
	floatspanset_upper,
	floatspanset_width,
	distance_floatspanset_floatspan,
	distance_floatspanset_floatspanset,
	floatspanset_to_intspanset,
	floatspanset_ceil,
	floatspanset_floor,
	floatspanset_degrees,
	floatspanset_radians,
	floatspanset_round,
	floatspanset_shift_scale,
} from '../../../functions/functions.generated';
import { SpanSet } from '../base/SpanSet';
import { FloatSpan } from './FloatSpan';

/**
 * An ordered set of disjoint {@link FloatSpan} values.
 *
 * @example
 * ```ts
 * const ss = FloatSpanSet.fromString('{[1.5, 5.5), [8.0, 12.0)}');
 * console.log(ss.numSpans()); // 2
 * console.log(ss.lower());    // 1.5
 * console.log(ss.upper());    // 12.0
 * ss.free();
 * ```
 */
export class FloatSpanSet extends SpanSet<FloatSpan> {
	protected _makeSpanSet(ptr: Ptr): this {
		return new FloatSpanSet(ptr) as this;
	}

	protected _makeSpan(ptr: Ptr): FloatSpan {
		return new FloatSpan(ptr);
	}

	// -------------------------------------------------------------------------
	// CONSTRUCTORS
	// -------------------------------------------------------------------------

	/**
	 * Parses a `FloatSpanSet` from its WKT string representation.
	 * @param str WKT string, e.g. `"{[1.5, 5.5), [8.0, 12.0)}"`.
	 */
	static fromString(str: string): FloatSpanSet {
		return new FloatSpanSet(floatspanset_in(str));
	}

	/**
	 * Deserialises a `FloatSpanSet` from a hex-encoded WKB string produced by {@link asHexWKB}.
	 * @param hexwkb Hex-encoded WKB string.
	 */
	static fromHexWKB(hexwkb: string): FloatSpanSet {
		return new FloatSpanSet(spanset_from_hexwkb(hexwkb));
	}

	/**
	 * Wraps a single {@link FloatSpan} into a one-element `FloatSpanSet`.
	 * @param span The span to wrap.
	 */
	static fromSpan(span: FloatSpan): FloatSpanSet {
		return new FloatSpanSet(span_to_spanset(span.inner));
	}

	// -------------------------------------------------------------------------
	// OUTPUT
	// -------------------------------------------------------------------------

	/**
	 * Returns the WKT string representation (e.g. `{[1.5, 5.5), [8.0, 12.0)}`).
	 * @param maxdd Maximum decimal digits of precision (default `15`).
	 */
	toString(maxdd = 15): string {
		return floatspanset_out(this._inner, maxdd);
	}

	// -------------------------------------------------------------------------
	// ACCESSORS
	// -------------------------------------------------------------------------

	/** Returns the lower bound of the first span. */
	lower(): number {
		return floatspanset_lower(this._inner);
	}

	/** Returns the upper bound of the last span. */
	upper(): number {
		return floatspanset_upper(this._inner);
	}

	/**
	 * Returns the total width of this span set.
	 * @param boundSpan
	 *   - `false` (default): sum of all individual span widths.
	 *   - `true`: width of the bounding span (from first lower to last upper).
	 */
	width(boundSpan = false): number {
		return floatspanset_width(this._inner, boundSpan);
	}

	// -------------------------------------------------------------------------
	// DISTANCE
	// -------------------------------------------------------------------------

	/**
	 * Returns the distance (gap) between `this` and `other`.
	 * Returns `0` if they overlap. Accepts either a {@link FloatSpan} or a `FloatSpanSet`.
	 */
	distance(other: FloatSpan | FloatSpanSet): number {
		if (other instanceof FloatSpan)
			return distance_floatspanset_floatspan(this._inner, other.inner);
		return distance_floatspanset_floatspanset(this._inner, other.inner);
	}

	// -------------------------------------------------------------------------
	// CONVERSIONS & MATH
	// -------------------------------------------------------------------------

	/**
	 * Converts this set to an {@link IntSpanSet} by truncating each span's bounds and returns the raw WASM pointer.
	 * Use `new IntSpanSet(ptr)` to obtain a typed object.
	 */
	toIntSpanSet(): Ptr {
		return floatspanset_to_intspanset(this._inner);
	}

	/** Returns a new span set with all bounds rounded up to the nearest integer. */
	ceil(): FloatSpanSet {
		return new FloatSpanSet(floatspanset_ceil(this._inner));
	}

	/** Returns a new span set with all bounds rounded down to the nearest integer. */
	floor(): FloatSpanSet {
		return new FloatSpanSet(floatspanset_floor(this._inner));
	}

	/**
	 * Converts all bounds from radians to degrees.
	 * @param normalize If `true`, normalises the result to `[0, 360)` (default `false`).
	 */
	degrees(normalize = false): FloatSpanSet {
		return new FloatSpanSet(floatspanset_degrees(this._inner, normalize));
	}

	/** Converts all bounds from degrees to radians. */
	radians(): FloatSpanSet {
		return new FloatSpanSet(floatspanset_radians(this._inner));
	}

	/**
	 * Returns a new span set with all bounds rounded to `maxdd` decimal places.
	 * @param maxdd Number of decimal digits to keep.
	 */
	round(maxdd: number): FloatSpanSet {
		return new FloatSpanSet(floatspanset_round(this._inner, maxdd));
	}

	/**
	 * Returns a new span set shifted and/or scaled along the float axis.
	 * @param shift Amount to add to every bound (ignored when `hasShift` is `false`).
	 * @param width New total width (ignored when `hasWidth` is `false`).
	 * @param hasShift Set to `false` to skip shifting (default `true`).
	 * @param hasWidth Set to `false` to skip scaling (default `true`).
	 */
	shiftScale(
		shift: number,
		width: number,
		hasShift = true,
		hasWidth = true
	): FloatSpanSet {
		return new FloatSpanSet(
			floatspanset_shift_scale(this._inner, shift, width, hasShift, hasWidth)
		);
	}
}
