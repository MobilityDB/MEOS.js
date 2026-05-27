import { TNumber } from '../tnumber/TNumber';
import type { Ptr, TimestampTz } from '../../../functions/functions.generated';
import {
	tfloat_in,
	tfloat_out,
	tfloatinst_make,
	tfloat_from_base_temp,
	tfloatseq_from_base_tstzset,
	tfloatseq_from_base_tstzspan,
	tfloatseqset_from_base_tstzspanset,
	tfloat_from_mfjson,
	tfloat_end_value,
	tfloat_min_value,
	tfloat_max_value,
	tfloat_to_tint,
	add_tfloat_float,
	sub_tfloat_float,
	mul_tfloat_float,
	div_tfloat_float,
	add_float_tfloat,
	sub_float_tfloat,
	mul_float_tfloat,
	div_float_tfloat,
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
	tfloat_value_n,
	tfloat_start_value,
	temporal_at_timestamptz,
	meos_free,
	tfloat_ceil,
	tfloat_floor,
	tfloat_degrees,
	tfloat_radians,
	tfloat_exp,
	tfloat_ln,
	tfloat_log10,
	tfloat_shift_value,
	tfloat_scale_value,
	tfloat_shift_scale_value,
	tdistance_tfloat_float,
	nad_tfloat_float,
	nad_tfloat_tfloat,
	nad_tfloat_tbox,
} from '../../../functions/functions.generated';
import { TInt } from '../tint/TInt';
import { TBool } from '../tbool/TBool';

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
export class TFloat extends TNumber {
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
	 * Create a TFloat with constant value `d` spanning the same domain as `domain`.
	 * MEOS: tfloat_from_base_temp
	 */
	static fromBaseTemporal(d: number, domain: TFloat): TFloat {
		return new TFloat(tfloat_from_base_temp(d, domain.inner));
	}

	/**
	 * Create a TFloat with constant value `d` over a time object.
	 * Accepts a raw Ptr to a TsTzSet, TsTzSpan, or TsTzSpanSet.
	 * For TsTzSpan and TsTzSpanSet, `interp` selects the interpolation
	 * (1=Stepwise, 3=Linear, default Linear).
	 * MEOS: tfloatseq_from_base_tstzset / tstzspan / tfloatseqset_from_base_tstzspanset
	 */
	static fromBaseTime(d: number, time: Ptr, type: 'tstzset' | 'tstzspan' | 'tstzspanset', interp = 3): TFloat {
		switch (type) {
			case 'tstzset':     return new TFloat(tfloatseq_from_base_tstzset(d, time));
			case 'tstzspan':    return new TFloat(tfloatseq_from_base_tstzspan(d, time, interp));
			case 'tstzspanset': return new TFloat(tfloatseqset_from_base_tstzspanset(d, time, interp));
		}
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
	 * MEOS: mul_tfloat_float
	 */
	mult(d: number): TFloat {
		return new TFloat(mul_tfloat_float(this._inner, d));
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

	// -------------------------------------------------------------------------
	// VALUE ACCESS
	// -------------------------------------------------------------------------

	/**
	 * Returns the n-th distinct float value (0-based index) across all instants.
	 * @param n 0-based index (MEOS internally uses 1-based indexing).
	 * MEOS: tfloat_value_n
	 */
	valueN(n: number): number {
		return tfloat_value_n(this._inner, n + 1);
	}

	/**
	 * Evaluates the temporal at a specific timestamp.
	 * Returns `null` when the timestamp is outside the temporal's domain.
	 *
	 * @param t      Timestamp in microseconds since 2000-01-01 UTC.
	 * @param strict `true`: timestamp must be within a period (default `false`).
	 *
	 * MEOS: tfloat_value_at_timestamptz
	 */
	valueAtTimestamp(t: TimestampTz): number | null {
		const restricted = temporal_at_timestamptz(this._inner, t);
		if (restricted === 0) return null;
		const value = tfloat_start_value(restricted);
		meos_free(restricted);
		return value;
	}

	// -------------------------------------------------------------------------
	// MATH
	// -------------------------------------------------------------------------

	/** Returns a new temporal with each value rounded up to the nearest integer. MEOS: tfloat_ceil */
	ceil(): TFloat {
		return new TFloat(tfloat_ceil(this._inner));
	}

	/** Returns a new temporal with each value rounded down to the nearest integer. MEOS: tfloat_floor */
	floor(): TFloat {
		return new TFloat(tfloat_floor(this._inner));
	}

	/**
	 * Converts each value from radians to degrees.
	 * @param normalize If `true`, normalises the result to `[0, 360)` (default `false`).
	 * MEOS: tfloat_degrees
	 */
	degrees(normalize = false): TFloat {
		return new TFloat(tfloat_degrees(this._inner, normalize));
	}

	/** Converts each value from degrees to radians. MEOS: tfloat_radians */
	radians(): TFloat {
		return new TFloat(tfloat_radians(this._inner));
	}

	/** Applies e^x to each value. MEOS: tfloat_exp */
	exp(): TFloat {
		return new TFloat(tfloat_exp(this._inner));
	}

	/** Applies the natural logarithm ln(x) to each value. MEOS: tfloat_ln */
	ln(): TFloat {
		return new TFloat(tfloat_ln(this._inner));
	}

	/** Applies the base-10 logarithm log10(x) to each value. MEOS: tfloat_log10 */
	log10(): TFloat {
		return new TFloat(tfloat_log10(this._inner));
	}

	// -------------------------------------------------------------------------
	// VALUE SHIFT / SCALE
	// -------------------------------------------------------------------------

	/**
	 * Returns a new temporal with every value shifted by `shift`.
	 * MEOS: tfloat_shift_value
	 */
	shiftValue(shift: number): TFloat {
		return new TFloat(tfloat_shift_value(this._inner, shift));
	}

	/**
	 * Returns a new temporal with the value range scaled to `width`.
	 * MEOS: tfloat_scale_value
	 */
	scaleValue(width: number): TFloat {
		return new TFloat(tfloat_scale_value(this._inner, width));
	}

	/**
	 * Returns a new temporal with the value range shifted by `shift` and scaled to `width`.
	 * MEOS: tfloat_shift_scale_value
	 */
	shiftScaleValue(shift: number, width: number): TFloat {
		return new TFloat(tfloat_shift_scale_value(this._inner, shift, width));
	}

	// -------------------------------------------------------------------------
	// TNUMBER ABSTRACT HOOK IMPLEMENTATIONS
	// -------------------------------------------------------------------------

	protected _raddScalar(d: number): Ptr  { return add_float_tfloat(d, this._inner); }
	protected _rsubScalar(d: number): Ptr  { return sub_float_tfloat(d, this._inner); }
	protected _rmulScalar(d: number): Ptr  { return mul_float_tfloat(d, this._inner); }
	protected _rdivScalar(d: number): Ptr  { return div_float_tfloat(d, this._inner); }
	protected _distanceScalar(d: number): Ptr        { return tdistance_tfloat_float(this._inner, d); }
	protected _nadScalar(d: number): number          { return nad_tfloat_float(this._inner, d); }
	protected _nadTemporal(other: TNumber): number   { return nad_tfloat_tfloat(this._inner, other.inner); }
	protected _nadTBox(box: Ptr): number             { return nad_tfloat_tbox(this._inner, box); }
}
