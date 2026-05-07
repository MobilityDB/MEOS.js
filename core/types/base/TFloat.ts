import { Temporal } from '../temporal/Temporal';
import type { Ptr, TimestampTz } from '../../functions/functions.generated';
import {
	tfloat_in,
	tfloat_out,
	tfloatinst_make,
	tfloat_from_mfjson,
	tfloat_start_value,
	tfloat_end_value,
	tfloat_min_value,
	tfloat_max_value,
	tfloat_to_tint,
	add_tfloat_float,
	sub_tfloat_float,
	mult_tfloat_float,
	div_tfloat_float,
	tfloat_at_value,
	tfloat_minus_value,
	ever_eq_tfloat_float,
	ever_ne_tfloat_float,
	ever_lt_tfloat_float,
	ever_le_tfloat_float,
	ever_gt_tfloat_float,
	ever_ge_tfloat_float,
	always_eq_tfloat_float,
	always_ne_tfloat_float,
	always_lt_tfloat_float,
	always_le_tfloat_float,
	always_gt_tfloat_float,
	always_ge_tfloat_float,
	teq_tfloat_float,
	tne_tfloat_float,
	tlt_tfloat_float,
	tle_tfloat_float,
	tgt_tfloat_float,
	tge_tfloat_float,
} from '../../functions/functions.generated';
import { TInt } from './TInt';
import { TBool } from './TBool';

/**
 * Temporal float type.
 *
 * Wraps a MEOS TFloat pointer and exposes float-specific operations
 * on top of the generic Temporal API.
 *
 * Unlike TBool and TInt (which only support Discrete and Stepwise interpolation),
 * TFloat also supports **Linear** interpolation: values between two instants
 * are linearly interpolated. A sequence written as `[1.0@T1, 3.0@T2]` means the
 * value grows continuously from 1.0 to 3.0 between T1 and T2.
 *
 * @example
 * ```ts
 * await initMeos();
 * const t = TFloat.fromString('[1.5@2000-01-01 00:01:00+00, 3.5@2000-01-01 00:02:00+00]');
 * console.log(t.startValue()); // 1.5
 * console.log(t.interpolation()); // TInterpolation.Linear
 * t.free();
 * ```
 */
export class TFloat extends Temporal<number> {
	// -------------------------------------------------------------------------
	// CONSTRUCTORS
	// -------------------------------------------------------------------------

	constructor(inner: Ptr) {
		super(inner);
	}

	/**
	 * Parse a TFloat from a WKT string.
	 *
	 * Accepts all subtypes and interpolations:
	 * - Instant:          `"1.5@2000-01-01 00:01:00+00"`
	 * - Linear sequence:  `"[1.5@2000-01-01, 3.5@2000-01-02]"`
	 * - Step sequence:    `"Interp=Stepwise;[1.5@2000-01-01, 3.5@2000-01-02]"`
	 * - Discrete:         `"{1.5@2000-01-01, 3.5@2000-01-02}"`
	 *
	 * MEOS: tfloat_in
	 */
	static fromString(wkt: string): TFloat {
		return new TFloat(tfloat_in(wkt));
	}

	/**
	 * Parse a TFloat from a MF-JSON string.
	 * MEOS: tfloat_from_mfjson
	 */
	static fromMFJSON(mfjson: string): TFloat {
		return new TFloat(tfloat_from_mfjson(mfjson));
	}

	/**
	 * Create a TFloatInst from a float value and a timestamp.
	 *
	 * @param value     The float value.
	 * @param timestamp Microseconds since 2000-01-01 UTC (TimestampTz).
	 *
	 * MEOS: tfloatinst_make
	 */
	static fromInstant(value: number, timestamp: TimestampTz): TFloat {
		return new TFloat(tfloatinst_make(value, timestamp));
	}

	// -------------------------------------------------------------------------
	// ABSTRACT IMPLEMENTATION
	// -------------------------------------------------------------------------

	protected _fromInner(inner: Ptr): this {
		return new TFloat(inner) as this;
	}

	/**
	 * WKT string representation.
	 *
	 * @param maxdd Maximum number of decimal digits for float values (default 15).
	 * MEOS: tfloat_out
	 */
	toString(maxdd = 15): string {
		return tfloat_out(this._inner, maxdd);
	}

	/**
	 * Starting value of the temporal.
	 * MEOS: tfloat_start_value
	 */
	startValue(): number {
		return tfloat_start_value(this._inner);
	}

	/**
	 * Ending value of the temporal.
	 * MEOS: tfloat_end_value
	 */
	endValue(): number {
		return tfloat_end_value(this._inner);
	}

	/**
	 * Minimum value over the entire temporal.
	 * MEOS: tfloat_min_value
	 */
	minValue(): number {
		return tfloat_min_value(this._inner);
	}

	/**
	 * Maximum value over the entire temporal.
	 * MEOS: tfloat_max_value
	 */
	maxValue(): number {
		return tfloat_max_value(this._inner);
	}

	/**
	 * Convert to a TInt by truncating each float value to an integer.
	 *
	 * Step interpolation is preserved. Linear sequences become stepwise after
	 * conversion because integer values cannot interpolate continuously.
	 *
	 * MEOS: tfloat_to_tint
	 */
	toTInt(): TInt {
		return new TInt(tfloat_to_tint(this._inner));
	}

	// -------------------------------------------------------------------------
	// ARITHMETIC
	// -------------------------------------------------------------------------

	/**
	 * Add a constant float to every instant.
	 * MEOS: add_tfloat_float
	 */
	add(d: number): TFloat {
		return new TFloat(add_tfloat_float(this._inner, d));
	}

	/**
	 * Subtract a constant float from every instant.
	 * MEOS: sub_tfloat_float
	 */
	sub(d: number): TFloat {
		return new TFloat(sub_tfloat_float(this._inner, d));
	}

	/**
	 * Multiply every instant by a constant float.
	 * MEOS: mult_tfloat_float
	 */
	mult(d: number): TFloat {
		return new TFloat(mult_tfloat_float(this._inner, d));
	}

	/**
	 * Divide every instant by a constant float.
	 * MEOS: div_tfloat_float
	 */
	div(d: number): TFloat {
		return new TFloat(div_tfloat_float(this._inner, d));
	}

	// -------------------------------------------------------------------------
	// RESTRICTIONS
	// -------------------------------------------------------------------------

	/**
	 * Restrict to instants where the value equals d.
	 * MEOS: tfloat_at_value
	 */
	at(d: number): TFloat {
		return new TFloat(tfloat_at_value(this._inner, d));
	}

	/**
	 * Restrict to instants where the value differs from d.
	 * MEOS: tfloat_minus_value
	 */
	minus(d: number): TFloat {
		return new TFloat(tfloat_minus_value(this._inner, d));
	}

	// -------------------------------------------------------------------------
	// EVER / ALWAYS COMPARISONS
	// -------------------------------------------------------------------------

	/** Returns true if the value is ever equal to d.       MEOS: ever_eq_tfloat_float */
	everEq(d: number): boolean {
		return ever_eq_tfloat_float(this._inner, d) > 0;
	}
	/** Returns true if the value is ever not equal to d.   MEOS: ever_ne_tfloat_float */
	everNe(d: number): boolean {
		return ever_ne_tfloat_float(this._inner, d) > 0;
	}
	/** Returns true if the value is ever less than d.      MEOS: ever_lt_tfloat_float */
	everLt(d: number): boolean {
		return ever_lt_tfloat_float(this._inner, d) > 0;
	}
	/** Returns true if the value is ever <= d.             MEOS: ever_le_tfloat_float */
	everLe(d: number): boolean {
		return ever_le_tfloat_float(this._inner, d) > 0;
	}
	/** Returns true if the value is ever greater than d.   MEOS: ever_gt_tfloat_float */
	everGt(d: number): boolean {
		return ever_gt_tfloat_float(this._inner, d) > 0;
	}
	/** Returns true if the value is ever >= d.             MEOS: ever_ge_tfloat_float */
	everGe(d: number): boolean {
		return ever_ge_tfloat_float(this._inner, d) > 0;
	}

	/** Returns true if the value is always equal to d.     MEOS: always_eq_tfloat_float */
	alwaysEq(d: number): boolean {
		return always_eq_tfloat_float(this._inner, d) > 0;
	}
	/** Returns true if the value is always not equal to d. MEOS: always_ne_tfloat_float */
	alwaysNe(d: number): boolean {
		return always_ne_tfloat_float(this._inner, d) > 0;
	}
	/** Returns true if the value is always less than d.    MEOS: always_lt_tfloat_float */
	alwaysLt(d: number): boolean {
		return always_lt_tfloat_float(this._inner, d) > 0;
	}
	/** Returns true if the value is always <= d.           MEOS: always_le_tfloat_float */
	alwaysLe(d: number): boolean {
		return always_le_tfloat_float(this._inner, d) > 0;
	}
	/** Returns true if the value is always greater than d. MEOS: always_gt_tfloat_float */
	alwaysGt(d: number): boolean {
		return always_gt_tfloat_float(this._inner, d) > 0;
	}
	/** Returns true if the value is always >= d.           MEOS: always_ge_tfloat_float */
	alwaysGe(d: number): boolean {
		return always_ge_tfloat_float(this._inner, d) > 0;
	}

	// -------------------------------------------------------------------------
	// TEMPORAL COMPARISONS
	// -------------------------------------------------------------------------

	/** Returns a TBool that is true at each instant where this == d. MEOS: teq_tfloat_float */
	temporalEq(d: number): TBool {
		return new TBool(teq_tfloat_float(this._inner, d));
	}
	/** Returns a TBool that is true at each instant where this != d. MEOS: tne_tfloat_float */
	temporalNe(d: number): TBool {
		return new TBool(tne_tfloat_float(this._inner, d));
	}
	/** Returns a TBool that is true at each instant where this < d.  MEOS: tlt_tfloat_float */
	temporalLt(d: number): TBool {
		return new TBool(tlt_tfloat_float(this._inner, d));
	}
	/** Returns a TBool that is true at each instant where this <= d. MEOS: tle_tfloat_float */
	temporalLe(d: number): TBool {
		return new TBool(tle_tfloat_float(this._inner, d));
	}
	/** Returns a TBool that is true at each instant where this > d.  MEOS: tgt_tfloat_float */
	temporalGt(d: number): TBool {
		return new TBool(tgt_tfloat_float(this._inner, d));
	}
	/** Returns a TBool that is true at each instant where this >= d. MEOS: tge_tfloat_float */
	temporalGe(d: number): TBool {
		return new TBool(tge_tfloat_float(this._inner, d));
	}
}
