import type { Ptr } from '../../../functions/functions.generated';
import {
	intspanset_in,
	intspanset_out,
	spanset_from_hexwkb,
	span_to_spanset,
	intspanset_lower,
	intspanset_upper,
	intspanset_width,
	distance_intspanset_intspan,
	distance_intspanset_intspanset,
	intspanset_to_floatspanset,
	intspanset_shift_scale,
} from '../../../functions/functions.generated';
import { SpanSet } from '../base/SpanSet';
import { IntSpan } from './IntSpan';

/**
 * An ordered set of disjoint {@link IntSpan} values.
 *
 * @example
 * ```ts
 * const ss = IntSpanSet.fromString('{[1, 5), [8, 12)}');
 * console.log(ss.numSpans()); // 2
 * console.log(ss.lower());    // 1
 * console.log(ss.upper());    // 12
 * ss.free();
 * ```
 */
export class IntSpanSet extends SpanSet<IntSpan> {
	protected _makeSpanSet(ptr: Ptr): this {
		return new IntSpanSet(ptr) as this;
	}

	protected _makeSpan(ptr: Ptr): IntSpan {
		return new IntSpan(ptr);
	}

	// -------------------------------------------------------------------------
	// CONSTRUCTORS
	// -------------------------------------------------------------------------

	/**
	 * Parses an `IntSpanSet` from its WKT string representation.
	 * @param str WKT string, e.g. `"{[1, 5), [8, 12)}"`.
	 */
	static fromString(str: string): IntSpanSet {
		return new IntSpanSet(intspanset_in(str));
	}

	/**
	 * Deserialises an `IntSpanSet` from a hex-encoded WKB string produced by {@link asHexWKB}.
	 * @param hexwkb Hex-encoded WKB string.
	 */
	static fromHexWKB(hexwkb: string): IntSpanSet {
		return new IntSpanSet(spanset_from_hexwkb(hexwkb));
	}

	/**
	 * Wraps a single {@link IntSpan} into a one-element `IntSpanSet`.
	 * @param span The span to wrap.
	 */
	static fromSpan(span: IntSpan): IntSpanSet {
		return new IntSpanSet(span_to_spanset(span.inner));
	}

	// -------------------------------------------------------------------------
	// OUTPUT
	// -------------------------------------------------------------------------

	/** Returns the WKT string representation (e.g. `{[1, 5), [8, 12)}`). */
	toString(): string {
		return intspanset_out(this._inner);
	}

	// -------------------------------------------------------------------------
	// ACCESSORS
	// -------------------------------------------------------------------------

	/** Returns the inclusive lower bound of the first span. */
	lower(): number {
		return intspanset_lower(this._inner);
	}

	/** Returns the exclusive upper bound of the last span (stored half-open). */
	upper(): number {
		return intspanset_upper(this._inner);
	}

	/**
	 * Returns the total width of this span set.
	 * @param boundSpan
	 *   - `false` (default): sum of all individual span widths.
	 *   - `true`: width of the bounding span (from first lower to last upper).
	 */
	width(boundSpan = false): number {
		return intspanset_width(this._inner, boundSpan);
	}

	// -------------------------------------------------------------------------
	// DISTANCE
	// -------------------------------------------------------------------------

	/**
	 * Returns the distance (gap) between `this` and `other` in integers.
	 * Returns `0` if they overlap. Accepts either an {@link IntSpan} or an `IntSpanSet`.
	 */
	distance(other: IntSpan | IntSpanSet): number {
		if (other instanceof IntSpan)
			return distance_intspanset_intspan(this._inner, other.inner);
		return distance_intspanset_intspanset(this._inner, other.inner);
	}

	// -------------------------------------------------------------------------
	// CONVERSIONS & MATH
	// -------------------------------------------------------------------------

	/**
	 * Converts this set to a {@link FloatSpanSet} and returns the raw WASM pointer.
	 * Use `new FloatSpanSet(ptr)` to obtain a typed object.
	 */
	toFloatSpanSet(): Ptr {
		return intspanset_to_floatspanset(this._inner);
	}

	/**
	 * Returns a new span set shifted and/or scaled along the integer axis.
	 * @param shift Amount to add to every bound (ignored when `hasShift` is `false`).
	 * @param width New total width (ignored when `hasWidth` is `false`).
	 * @param hasShift Set to `false` to skip shifting (default `true`).
	 * @param hasWidth Set to `false` to skip scaling (default `true`).
	 */
	shiftScale(shift: number, width: number, hasShift = true, hasWidth = true): IntSpanSet {
		return new IntSpanSet(
			intspanset_shift_scale(this._inner, shift, width, hasShift, hasWidth)
		);
	}
}
