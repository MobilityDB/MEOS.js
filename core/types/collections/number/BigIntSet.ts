import type { Ptr } from '../../../functions/functions.generated.js';
import {
	bigintset_in,
	bigintset_out,
	set_from_hexwkb,
	bigintset_start_value,
	bigintset_end_value,
	bigintset_value_n,
	distance_bigintset_bigintset,
	bigintset_shift_scale,
} from '../../../functions/functions.generated.js';
import { MeosSet } from '../base/MeosSet.js';

/**
 * An ordered set of distinct 64-bit integers.
 *
 * @example
 * ```ts
 * const s = BigIntSet.fromString('{1, 3, 7, 15}');
 * console.log(s.numValues()); // 4
 * console.log(s.startValue()); // 1
 * console.log(s.endValue());   // 15
 * s.free();
 * ```
 */
export class BigIntSet extends MeosSet<number> {
	protected _make(ptr: Ptr): this {
		return new BigIntSet(ptr) as this;
	}

	// -------------------------------------------------------------------------
	// CONSTRUCTORS
	// -------------------------------------------------------------------------

	/**
	 * Parses a `BigIntSet` from its WKT string representation.
	 * @param str WKT string, e.g. `"{1, 3, 7}"`.
	 */
	static fromString(str: string): BigIntSet {
		return new BigIntSet(bigintset_in(str));
	}

	/**
	 * Deserialises a `BigIntSet` from a hex-encoded WKB string produced by {@link asHexWKB}.
	 * @param hexwkb Hex-encoded WKB string.
	 */
	static fromHexWKB(hexwkb: string): BigIntSet {
		return new BigIntSet(set_from_hexwkb(hexwkb));
	}

	// -------------------------------------------------------------------------
	// OUTPUT
	// -------------------------------------------------------------------------

	/** Returns the WKT string representation (e.g. `{1, 3, 7}`). */
	toString(): string {
		return bigintset_out(this._inner);
	}

	// -------------------------------------------------------------------------
	// ACCESSORS
	// -------------------------------------------------------------------------

	/** Returns the smallest (first) integer in this set. */
	startValue(): number {
		return bigintset_start_value(this._inner);
	}

	/** Returns the largest (last) integer in this set. */
	endValue(): number {
		return bigintset_end_value(this._inner);
	}

	/**
	 * Returns the n-th integer (0-based index).
	 * @param n 0-based index (MEOS internally uses 1-based indexing).
	 */
	valueN(n: number): number {
		return bigintset_value_n(this._inner, n + 1);
	}

	// -------------------------------------------------------------------------
	// DISTANCE
	// -------------------------------------------------------------------------

	/**
	 * Returns the distance (gap) between `this` and `other` in integers.
	 * Returns `0` if they share at least one element.
	 */
	distance(other: BigIntSet): number {
		return distance_bigintset_bigintset(this._inner, other.inner);
	}

	// -------------------------------------------------------------------------
	// TRANSFORMATIONS
	// -------------------------------------------------------------------------

	/**
	 * Returns a new set shifted and/or scaled along the integer axis.
	 * @param shift Amount to add to every element (ignored when `hasShift` is `false`).
	 * @param width New total width (ignored when `hasWidth` is `false`).
	 * @param hasShift Set to `false` to skip shifting (default `true`).
	 * @param hasWidth Set to `false` to skip scaling (default `true`).
	 */
	shiftScale(shift: number, width: number, hasShift = true, hasWidth = true): BigIntSet {
		return new BigIntSet(
			bigintset_shift_scale(this._inner, shift, width, hasShift, hasWidth)
		);
	}
}
