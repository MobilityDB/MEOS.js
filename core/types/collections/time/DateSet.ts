import type { Ptr, DateADT } from '../../../functions/functions.generated.js';
import {
	dateset_in,
	dateset_out,
	set_from_hexwkb,
	dateset_start_value,
	dateset_end_value,
	dateset_value_n,
	distance_dateset_dateset,
	dateset_to_tstzset,
	dateset_shift_scale,
} from '../../../functions/functions.generated.js';
import { MeosSet } from '../base/MeosSet.js';

/**
 * An ordered set of distinct calendar dates.
 *
 * Dates are represented as `DateADT` integers (days since 2000-01-01).
 *
 * @example
 * ```ts
 * const s = DateSet.fromString('{2020-01-01, 2020-06-15, 2020-12-31}');
 * console.log(s.numValues());  // 3
 * console.log(s.startValue()); // days since 2000-01-01
 * s.free();
 * ```
 */
export class DateSet extends MeosSet<DateADT> {
	protected _make(ptr: Ptr): this {
		return new DateSet(ptr) as this;
	}

	// -------------------------------------------------------------------------
	// CONSTRUCTORS
	// -------------------------------------------------------------------------

	/**
	 * Parses a `DateSet` from its WKT string representation.
	 * @param str WKT string, e.g. `"{2020-01-01, 2020-06-15, 2020-12-31}"`.
	 */
	static fromString(str: string): DateSet {
		return new DateSet(dateset_in(str));
	}

	/**
	 * Deserialises a `DateSet` from a hex-encoded WKB string produced by {@link asHexWKB}.
	 * @param hexwkb Hex-encoded WKB string.
	 */
	static fromHexWKB(hexwkb: string): DateSet {
		return new DateSet(set_from_hexwkb(hexwkb));
	}

	// -------------------------------------------------------------------------
	// OUTPUT
	// -------------------------------------------------------------------------

	/** Returns the WKT string representation (e.g. `{2020-01-01, 2020-06-15}`). */
	toString(): string {
		return dateset_out(this._inner);
	}

	// -------------------------------------------------------------------------
	// ACCESSORS
	// -------------------------------------------------------------------------

	/** Returns the earliest date in this set as days since 2000-01-01. */
	startValue(): DateADT {
		return dateset_start_value(this._inner);
	}

	/** Returns the latest date in this set as days since 2000-01-01. */
	endValue(): DateADT {
		return dateset_end_value(this._inner);
	}

	/**
	 * Returns the n-th date (0-based index) as days since 2000-01-01.
	 * @param n 0-based index (MEOS internally uses 1-based indexing).
	 */
	valueN(n: number): DateADT {
		return dateset_value_n(this._inner, n + 1);
	}

	// -------------------------------------------------------------------------
	// DISTANCE
	// -------------------------------------------------------------------------

	/**
	 * Returns the distance (gap) between `this` and `other` in days.
	 * Returns `0` if they share at least one date.
	 */
	distance(other: DateSet): number {
		return distance_dateset_dateset(this._inner, other.inner);
	}

	// -------------------------------------------------------------------------
	// CONVERSIONS & MATH
	// -------------------------------------------------------------------------

	/**
	 * Converts each date to a timestamp at midnight UTC and returns the raw WASM pointer.
	 * Use `new TsTzSet(ptr)` to obtain a typed object.
	 */
	toTsTzSet(): Ptr {
		return dateset_to_tstzset(this._inner);
	}

	/**
	 * Returns a new set shifted and/or scaled along the date axis.
	 * @param shift Number of days to shift (ignored when `hasShift` is `false`).
	 * @param width New total width in days (ignored when `hasWidth` is `false`).
	 * @param hasShift Set to `false` to skip shifting (default `true`).
	 * @param hasWidth Set to `false` to skip scaling (default `true`).
	 */
	shiftScale(shift: number, width: number, hasShift = true, hasWidth = true): DateSet {
		return new DateSet(
			dateset_shift_scale(this._inner, shift, width, hasShift, hasWidth)
		);
	}
}
