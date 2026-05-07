import { Temporal } from '../temporal/Temporal';
import type { Ptr, TimestampTz } from '../../functions/functions.generated';
import {
	tint_in,
	tint_out,
	tintinst_make,
	tint_from_mfjson,
	tint_start_value,
	tint_end_value,
	tint_min_value,
	tint_max_value,
	tint_to_tfloat,
	add_tint_int,
	sub_tint_int,
	mult_tint_int,
	div_tint_int,
	tint_at_value,
	tint_minus_value,
	ever_eq_tint_int,
	ever_ne_tint_int,
	ever_lt_tint_int,
	ever_le_tint_int,
	ever_gt_tint_int,
	ever_ge_tint_int,
	always_eq_tint_int,
	always_ne_tint_int,
	always_lt_tint_int,
	always_le_tint_int,
	always_gt_tint_int,
	always_ge_tint_int,
	teq_tint_int,
	tne_tint_int,
	tlt_tint_int,
	tle_tint_int,
	tgt_tint_int,
	tge_tint_int,
} from '../../functions/functions.generated';
import { TBool } from './TBool';

/**
 * Temporal integer type.
 *
 * Wraps a MEOS TInt pointer and exposes integer-specific operations
 * on top of the generic Temporal API defined in Temporal.ts.
 *
 * TInt supports Discrete and Stepwise interpolation only - values are always
 * constant between instants (no linear interpolation).
 *
 * Supports all three subtypes (Instant, Sequence, SequenceSet) through
 * the same class - the subtype is determined by the WKT string at parse time.
 *
 * @example
 * ```ts
 * await initMeos();
 * const t = TInt.fromString('{1@2000-01-01 00:01:00+00, 2@2000-01-01 00:02:00+00}');
 * console.log(t.startValue()); // 1
 * console.log(t.toString());
 * t.free();
 * ```
 */
export class TInt extends Temporal<number> {
	// -------------------------------------------------------------------------
	// CONSTRUCTORS
	// -------------------------------------------------------------------------

	constructor(inner: Ptr) {
		super(inner);
	}

	/**
	 * Parse a TInt from a WKT string.
	 * MEOS: tint_in
	 */
	static fromString(wkt: string): TInt {
		return new TInt(tint_in(wkt));
	}

	/**
	 * Parse a TInt from a MF-JSON string.
	 * MEOS: tint_from_mfjson
	 */
	static fromMFJSON(mfjson: string): TInt {
		return new TInt(tint_from_mfjson(mfjson));
	}

	/**
	 * Create a TIntInst from an integer value and a timestamp.
	 *
	 * @param value     The integer value.
	 * @param timestamp Microseconds since 2000-01-01 UTC (TimestampTz).
	 *
	 * MEOS: tintinst_make
	 */
	static fromInstant(value: number, timestamp: TimestampTz): TInt {
		return new TInt(tintinst_make(value, timestamp));
	}

	// -------------------------------------------------------------------------
	// ABSTRACT IMPLEMENTATION
	// -------------------------------------------------------------------------

	protected _fromInner(inner: Ptr): this {
		return new TInt(inner) as this;
	}

	/**
	 * WKT string representation.
	 * MEOS: tint_out
	 */
	toString(): string {
		return tint_out(this._inner);
	}

	/**
	 * Starting value of the temporal.
	 * MEOS: tint_start_value
	 */
	startValue(): number {
		return tint_start_value(this._inner);
	}

	/**
	 * Ending value of the temporal.
	 * MEOS: tint_end_value
	 */
	endValue(): number {
		return tint_end_value(this._inner);
	}

	/**
	 * Minimum value over the entire temporal.
	 * MEOS: tint_min_value
	 */
	minValue(): number {
		return tint_min_value(this._inner);
	}

	/**
	 * Maximum value over the entire temporal.
	 * MEOS: tint_max_value
	 */
	maxValue(): number {
		return tint_max_value(this._inner);
	}

	/**
	 * Convert to a TFloat (step interpolation preserved).
	 *
	 * Returns Ptr rather than TFloat to avoid a circular import between TInt
	 * and TFloat.  Wrap the result manually: `new TFloat(t.toTFloat())`.
	 *
	 * MEOS: tint_to_tfloat
	 */
	toTFloat(): Ptr {
		return tint_to_tfloat(this._inner);
	}

	// -------------------------------------------------------------------------
	// ARITHMETIC
	// -------------------------------------------------------------------------

	/**
	 * Add a constant integer to every instant.
	 * MEOS: add_tint_int
	 */
	add(i: number): TInt {
		return new TInt(add_tint_int(this._inner, i));
	}

	/**
	 * Subtract a constant integer from every instant.
	 * MEOS: sub_tint_int
	 */
	sub(i: number): TInt {
		return new TInt(sub_tint_int(this._inner, i));
	}

	/**
	 * Multiply every instant by a constant integer.
	 * MEOS: mult_tint_int
	 */
	mult(i: number): TInt {
		return new TInt(mult_tint_int(this._inner, i));
	}

	/**
	 * Divide every instant by a constant integer.
	 * MEOS: div_tint_int
	 */
	div(i: number): TInt {
		return new TInt(div_tint_int(this._inner, i));
	}

	// -------------------------------------------------------------------------
	// RESTRICTIONS
	// -------------------------------------------------------------------------

	/**
	 * Restrict to instants where the value equals i.
	 * MEOS: tint_at_value
	 */
	at(i: number): TInt {
		return new TInt(tint_at_value(this._inner, i));
	}

	/**
	 * Restrict to instants where the value differs from i.
	 * MEOS: tint_minus_value
	 */
	minus(i: number): TInt {
		return new TInt(tint_minus_value(this._inner, i));
	}

	// -------------------------------------------------------------------------
	// EVER / ALWAYS COMPARISONS
	// -------------------------------------------------------------------------

	/** Returns true if the value is ever equal to i.       MEOS: ever_eq_tint_int */
	everEq(i: number): boolean {
		return ever_eq_tint_int(this._inner, i) > 0;
	}
	/** Returns true if the value is ever not equal to i.   MEOS: ever_ne_tint_int */
	everNe(i: number): boolean {
		return ever_ne_tint_int(this._inner, i) > 0;
	}
	/** Returns true if the value is ever less than i.      MEOS: ever_lt_tint_int */
	everLt(i: number): boolean {
		return ever_lt_tint_int(this._inner, i) > 0;
	}
	/** Returns true if the value is ever <= i.             MEOS: ever_le_tint_int */
	everLe(i: number): boolean {
		return ever_le_tint_int(this._inner, i) > 0;
	}
	/** Returns true if the value is ever greater than i.   MEOS: ever_gt_tint_int */
	everGt(i: number): boolean {
		return ever_gt_tint_int(this._inner, i) > 0;
	}
	/** Returns true if the value is ever >= i.             MEOS: ever_ge_tint_int */
	everGe(i: number): boolean {
		return ever_ge_tint_int(this._inner, i) > 0;
	}

	/** Returns true if the value is always equal to i.     MEOS: always_eq_tint_int */
	alwaysEq(i: number): boolean {
		return always_eq_tint_int(this._inner, i) > 0;
	}
	/** Returns true if the value is always not equal to i. MEOS: always_ne_tint_int */
	alwaysNe(i: number): boolean {
		return always_ne_tint_int(this._inner, i) > 0;
	}
	/** Returns true if the value is always less than i.    MEOS: always_lt_tint_int */
	alwaysLt(i: number): boolean {
		return always_lt_tint_int(this._inner, i) > 0;
	}
	/** Returns true if the value is always <= i.           MEOS: always_le_tint_int */
	alwaysLe(i: number): boolean {
		return always_le_tint_int(this._inner, i) > 0;
	}
	/** Returns true if the value is always greater than i. MEOS: always_gt_tint_int */
	alwaysGt(i: number): boolean {
		return always_gt_tint_int(this._inner, i) > 0;
	}
	/** Returns true if the value is always >= i.           MEOS: always_ge_tint_int */
	alwaysGe(i: number): boolean {
		return always_ge_tint_int(this._inner, i) > 0;
	}

	// -------------------------------------------------------------------------
	// TEMPORAL COMPARISONS
	// -------------------------------------------------------------------------

	/** Returns a TBool that is true at each instant where this == i. MEOS: teq_tint_int */
	temporalEq(i: number): TBool {
		return new TBool(teq_tint_int(this._inner, i));
	}
	/** Returns a TBool that is true at each instant where this != i. MEOS: tne_tint_int */
	temporalNe(i: number): TBool {
		return new TBool(tne_tint_int(this._inner, i));
	}
	/** Returns a TBool that is true at each instant where this < i.  MEOS: tlt_tint_int */
	temporalLt(i: number): TBool {
		return new TBool(tlt_tint_int(this._inner, i));
	}
	/** Returns a TBool that is true at each instant where this <= i. MEOS: tle_tint_int */
	temporalLe(i: number): TBool {
		return new TBool(tle_tint_int(this._inner, i));
	}
	/** Returns a TBool that is true at each instant where this > i.  MEOS: tgt_tint_int */
	temporalGt(i: number): TBool {
		return new TBool(tgt_tint_int(this._inner, i));
	}
	/** Returns a TBool that is true at each instant where this >= i. MEOS: tge_tint_int */
	temporalGe(i: number): TBool {
		return new TBool(tge_tint_int(this._inner, i));
	}
}
