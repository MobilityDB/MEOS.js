import type { Ptr } from '../../../functions/functions.generated.js';
import {
	intset_in,
	intset_out,
	set_from_hexwkb,
	intset_start_value,
	intset_end_value,
	intset_value_n,
	distance_intset_intset,
	intset_to_floatset,
	intset_shift_scale,
} from '../../../functions/functions.generated.js';
import { MeosSet } from '../base/MeosSet.js';

/**
 * An ordered set of distinct integers.
 *
 * @example
 * ```ts
 * const s = IntSet.fromString('{1, 3, 7, 15}');
 * console.log(s.numValues()); // 4
 * console.log(s.startValue()); // 1
 * console.log(s.endValue());   // 15
 * s.free();
 * ```
 */
export class IntSet extends MeosSet<number> {
	protected _make(ptr: Ptr): this {
		return new IntSet(ptr) as this;
	}

	// -------------------------------------------------------------------------
	// CONSTRUCTORS
	// -------------------------------------------------------------------------

	/**
	 * Parses an `IntSet` from its WKT string representation.
	 * @param str WKT string, e.g. `"{1, 3, 7}"`.
	 */
	static fromString(str: string): IntSet {
		return new IntSet(intset_in(str));
	}

	/**
	 * Deserialises an `IntSet` from a hex-encoded WKB string produced by {@link asHexWKB}.
	 * @param hexwkb Hex-encoded WKB string.
	 */
	static fromHexWKB(hexwkb: string): IntSet {
		return new IntSet(set_from_hexwkb(hexwkb));
	}

	// -------------------------------------------------------------------------
	// OUTPUT
	// -------------------------------------------------------------------------

	/** Returns the WKT string representation (e.g. `{1, 3, 7}`). */
	toString(): string {
		return intset_out(this._inner);
	}

	// -------------------------------------------------------------------------
	// ACCESSORS
	// -------------------------------------------------------------------------

	/** Returns the smallest (first) integer in this set. */
	startValue(): number {
		return intset_start_value(this._inner);
	}

	/** Returns the largest (last) integer in this set. */
	endValue(): number {
		return intset_end_value(this._inner);
	}

	/**
	 * Returns the n-th integer (0-based index).
	 * @param n 0-based index (MEOS internally uses 1-based indexing).
	 */
	valueN(n: number): number {
		return intset_value_n(this._inner, n + 1);
	}

	// -------------------------------------------------------------------------
	// DISTANCE
	// -------------------------------------------------------------------------

	/**
	 * Returns the distance (gap) between `this` and `other` in integers.
	 * Returns `0` if they share at least one element.
	 */
	distance(other: IntSet): number {
		return distance_intset_intset(this._inner, other.inner);
	}

	// -------------------------------------------------------------------------
	// CONVERSIONS & MATH
	// -------------------------------------------------------------------------

	/**
	 * Converts each integer in this set to a float and returns the raw WASM pointer.
	 * Use `new FloatSet(ptr)` to obtain a typed object.
	 */
	toFloatSet(): Ptr {
		return intset_to_floatset(this._inner);
	}

	/**
	 * Returns a new set shifted and/or scaled along the integer axis.
	 * @param shift Amount to add to every element (ignored when `hasShift` is `false`).
	 * @param width New total width (ignored when `hasWidth` is `false`).
	 * @param hasShift Set to `false` to skip shifting (default `true`).
	 * @param hasWidth Set to `false` to skip scaling (default `true`).
	 */
	shiftScale(shift: number, width: number, hasShift = true, hasWidth = true): IntSet {
		return new IntSet(intset_shift_scale(this._inner, shift, width, hasShift, hasWidth));
	}
}
