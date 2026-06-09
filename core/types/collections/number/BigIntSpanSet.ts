import type { Ptr } from '../../../functions/functions.generated.js';
import {
	bigintspanset_in,
	bigintspanset_out,
	spanset_from_hexwkb,
	span_to_spanset,
	bigintspanset_lower,
	bigintspanset_upper,
	bigintspanset_width,
	distance_bigintspanset_bigintspan,
	distance_bigintspanset_bigintspanset,
	bigintspanset_shift_scale,
} from '../../../functions/functions.generated.js';
import { SpanSet } from '../base/SpanSet.js';
import { BigIntSpan } from './BigIntSpan.js';

/**
 * An ordered set of disjoint {@link BigIntSpan} values.
 *
 * @example
 * ```ts
 * const ss = BigIntSpanSet.fromString('{[1, 5), [8, 12)}');
 * console.log(ss.numSpans()); // 2
 * console.log(ss.lower());    // 1
 * console.log(ss.upper());    // 12
 * ss.free();
 * ```
 */
export class BigIntSpanSet extends SpanSet<BigIntSpan> {
	protected _makeSpanSet(ptr: Ptr): this {
		return new BigIntSpanSet(ptr) as this;
	}

	protected _makeSpan(ptr: Ptr): BigIntSpan {
		return new BigIntSpan(ptr);
	}

	// -------------------------------------------------------------------------
	// CONSTRUCTORS
	// -------------------------------------------------------------------------

	/**
	 * Parses a `BigIntSpanSet` from its WKT string representation.
	 * @param str WKT string, e.g. `"{[1, 5), [8, 12)}"`.
	 */
	static fromString(str: string): BigIntSpanSet {
		return new BigIntSpanSet(bigintspanset_in(str));
	}

	/**
	 * Deserialises a `BigIntSpanSet` from a hex-encoded WKB string produced by {@link asHexWKB}.
	 * @param hexwkb Hex-encoded WKB string.
	 */
	static fromHexWKB(hexwkb: string): BigIntSpanSet {
		return new BigIntSpanSet(spanset_from_hexwkb(hexwkb));
	}

	/**
	 * Wraps a single {@link BigIntSpan} into a one-element `BigIntSpanSet`.
	 * @param span The span to wrap.
	 */
	static fromSpan(span: BigIntSpan): BigIntSpanSet {
		return new BigIntSpanSet(span_to_spanset(span.inner));
	}

	// -------------------------------------------------------------------------
	// OUTPUT
	// -------------------------------------------------------------------------

	/** Returns the WKT string representation (e.g. `{[1, 5), [8, 12)}`). */
	toString(): string {
		return bigintspanset_out(this._inner);
	}

	// -------------------------------------------------------------------------
	// ACCESSORS
	// -------------------------------------------------------------------------

	/** Returns the inclusive lower bound of the first span. */
	lower(): number {
		return bigintspanset_lower(this._inner);
	}

	/** Returns the exclusive upper bound of the last span (stored half-open). */
	upper(): number {
		return bigintspanset_upper(this._inner);
	}

	/**
	 * Returns the total width of this span set.
	 * @param boundSpan
	 *   - `false` (default): sum of all individual span widths.
	 *   - `true`: width of the bounding span (from first lower to last upper).
	 */
	width(boundSpan = false): number {
		return bigintspanset_width(this._inner, boundSpan);
	}

	// -------------------------------------------------------------------------
	// DISTANCE
	// -------------------------------------------------------------------------

	/**
	 * Returns the distance (gap) between `this` and `other` in integers.
	 * Returns `0` if they overlap. Accepts either a {@link BigIntSpan} or a `BigIntSpanSet`.
	 */
	distance(other: BigIntSpan | BigIntSpanSet): number {
		if (other instanceof BigIntSpan)
			return distance_bigintspanset_bigintspan(this._inner, other.inner);
		return distance_bigintspanset_bigintspanset(this._inner, other.inner);
	}

	// -------------------------------------------------------------------------
	// TRANSFORMATIONS
	// -------------------------------------------------------------------------

	/**
	 * Returns a new span set shifted and/or scaled along the integer axis.
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
	): BigIntSpanSet {
		return new BigIntSpanSet(
			bigintspanset_shift_scale(this._inner, shift, width, hasShift, hasWidth)
		);
	}
}
