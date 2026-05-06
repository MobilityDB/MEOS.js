import type { Ptr } from '../../core/functions';
import {
	floatset_in,
	floatset_out,
	set_from_hexwkb,
	floatset_start_value,
	floatset_end_value,
	floatset_value_n,
	distance_floatset_floatset,
	floatset_to_intset,
	floatset_ceil,
	floatset_floor,
	floatset_degrees,
	floatset_radians,
	floatset_shift_scale,
} from '../../core/functions';
import { MeoSet } from '../base/MeoSet';

/**
 * An ordered set of distinct IEEE 754 double-precision floats.
 *
 * @example
 * ```ts
 * const s = FloatSet.fromString('{1.5, 3.0, 7.25}');
 * console.log(s.numValues());  // 3
 * console.log(s.startValue()); // 1.5
 * console.log(s.endValue());   // 7.25
 * s.free();
 * ```
 */
export class FloatSet extends MeoSet<number> {
	protected _make(ptr: Ptr): this {
		return new FloatSet(ptr) as this;
	}

	// -------------------------------------------------------------------------
	// CONSTRUCTORS
	// -------------------------------------------------------------------------

	/**
	 * Parses a `FloatSet` from its WKT string representation.
	 * @param str WKT string, e.g. `"{1.5, 3.0, 7.25}"`.
	 */
	static fromString(str: string): FloatSet {
		return new FloatSet(floatset_in(str));
	}

	/**
	 * Deserialises a `FloatSet` from a hex-encoded WKB string produced by {@link asHexWKB}.
	 * @param hexwkb Hex-encoded WKB string.
	 */
	static fromHexWKB(hexwkb: string): FloatSet {
		return new FloatSet(set_from_hexwkb(hexwkb));
	}

	// -------------------------------------------------------------------------
	// OUTPUT
	// -------------------------------------------------------------------------

	/**
	 * Returns the WKT string representation (e.g. `{1.5, 3.0, 7.25}`).
	 * @param maxdd Maximum decimal digits of precision (default `15`).
	 */
	toString(maxdd = 15): string {
		return floatset_out(this._inner, maxdd);
	}

	// -------------------------------------------------------------------------
	// ACCESSORS
	// -------------------------------------------------------------------------

	/** Returns the smallest (first) float in this set. */
	startValue(): number {
		return floatset_start_value(this._inner);
	}

	/** Returns the largest (last) float in this set. */
	endValue(): number {
		return floatset_end_value(this._inner);
	}

	/**
	 * Returns the n-th float (0-based index).
	 * @param n 0-based index (MEOS internally uses 1-based indexing).
	 */
	valueN(n: number): number {
		return floatset_value_n(this._inner, n + 1);
	}

	// -------------------------------------------------------------------------
	// DISTANCE
	// -------------------------------------------------------------------------

	/**
	 * Returns the distance (gap) between `this` and `other`.
	 * Returns `0` if they share at least one element.
	 */
	distance(other: FloatSet): number {
		return distance_floatset_floatset(this._inner, other.inner);
	}

	// -------------------------------------------------------------------------
	// CONVERSIONS & MATH
	// -------------------------------------------------------------------------

	/**
	 * Truncates each float in this set to an integer and returns the raw WASM pointer.
	 * Use `new IntSet(ptr)` to obtain a typed object.
	 */
	toIntSet(): Ptr {
		return floatset_to_intset(this._inner);
	}

	/** Returns a new set with each value rounded up to the nearest integer. */
	ceil(): FloatSet {
		return new FloatSet(floatset_ceil(this._inner));
	}

	/** Returns a new set with each value rounded down to the nearest integer. */
	floor(): FloatSet {
		return new FloatSet(floatset_floor(this._inner));
	}

	/**
	 * Converts each value from radians to degrees.
	 * @param normalize If `true`, normalises the result to `[0, 360)` (default `false`).
	 */
	degrees(normalize = false): FloatSet {
		return new FloatSet(floatset_degrees(this._inner, normalize));
	}

	/** Converts each value from degrees to radians. */
	radians(): FloatSet {
		return new FloatSet(floatset_radians(this._inner));
	}

	/**
	 * Returns a new set shifted and/or scaled along the float axis.
	 * @param shift Amount to add to every element (ignored when `hasShift` is `false`).
	 * @param width New total width (ignored when `hasWidth` is `false`).
	 * @param hasShift Set to `false` to skip shifting (default `true`).
	 * @param hasWidth Set to `false` to skip scaling (default `true`).
	 */
	shiftScale(shift: number, width: number, hasShift = true, hasWidth = true): FloatSet {
		return new FloatSet(
			floatset_shift_scale(this._inner, shift, width, hasShift, hasWidth)
		);
	}
}
