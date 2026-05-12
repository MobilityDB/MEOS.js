import { TNumber } from '../tnumber/TNumber';
import type { Ptr, TimestampTz } from '../../../functions/functions.generated';
import {
	tint_in,
	tint_out,
	tintinst_make,
	tint_from_base_temp,
	tintseq_from_base_tstzset,
	tintseq_from_base_tstzspan,
	tintseqset_from_base_tstzspanset,
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
	add_int_tint,
	sub_int_tint,
	mult_int_tint,
	div_int_tint,
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
	tint_value_n,
	temporal_at_timestamptz,
	meos_free,
	tint_shift_value,
	tint_scale_value,
	tint_shift_scale_value,
	tdistance_tint_int,
	nad_tint_int,
	nad_tint_tint,
	nad_tint_tbox,
} from '../../../functions/functions.generated';
import { TBool } from '../tbool/TBool';

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
export class TInt extends TNumber {
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
	 * Create a TInt with constant value `i` spanning the same domain as `domain`.
	 * MEOS: tint_from_base_temp
	 */
	static fromBaseTemporal(i: number, domain: TInt): TInt {
		return new TInt(tint_from_base_temp(i, domain.inner));
	}

	/**
	 * Create a TInt with constant value `i` over a time object.
	 * Accepts a raw Ptr to a TsTzSet, TsTzSpan, or TsTzSpanSet.
	 * MEOS: tintseq_from_base_tstzset / tstzspan / tintseqset_from_base_tstzspanset
	 */
	static fromBaseTime(i: number, time: Ptr, type: 'tstzset' | 'tstzspan' | 'tstzspanset'): TInt {
		switch (type) {
			case 'tstzset':    return new TInt(tintseq_from_base_tstzset(i, time));
			case 'tstzspan':   return new TInt(tintseq_from_base_tstzspan(i, time));
			case 'tstzspanset': return new TInt(tintseqset_from_base_tstzspanset(i, time));
		}
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

	// -------------------------------------------------------------------------
	// VALUE ACCESS
	// -------------------------------------------------------------------------

	/**
	 * Returns the n-th distinct integer value (0-based index) across all instants.
	 * @param n 0-based index (MEOS internally uses 1-based indexing).
	 * MEOS: tint_value_n
	 */
	valueN(n: number): number {
		return tint_value_n(this._inner, n + 1);
	}

	/**
	 * Evaluates the temporal at a specific timestamp.
	 * Returns `null` when the timestamp is outside the temporal's domain.
	 *
	 * @param t      Timestamp in microseconds since 2000-01-01 UTC.
	 * @param strict `true`: timestamp must be within a period (default `false`).
	 *
	 * MEOS: tint_value_at_timestamptz
	 */
	valueAtTimestamp(t: TimestampTz): number | null {
		const restricted = temporal_at_timestamptz(this._inner, t);
		if (restricted === 0) return null;
		const value = tint_start_value(restricted);
		meos_free(restricted);
		return value;
	}

	// -------------------------------------------------------------------------
	// VALUE SHIFT / SCALE
	// -------------------------------------------------------------------------

	/**
	 * Returns a new temporal with every value shifted by `shift`.
	 * MEOS: tint_shift_value
	 */
	shiftValue(shift: number): TInt {
		return new TInt(tint_shift_value(this._inner, shift));
	}

	/**
	 * Returns a new temporal with the value range scaled to `width`.
	 * MEOS: tint_scale_value
	 */
	scaleValue(width: number): TInt {
		return new TInt(tint_scale_value(this._inner, width));
	}

	/**
	 * Returns a new temporal with the value range shifted by `shift` and scaled to `width`.
	 * MEOS: tint_shift_scale_value
	 */
	shiftScaleValue(shift: number, width: number): TInt {
		return new TInt(tint_shift_scale_value(this._inner, shift, width));
	}

	// -------------------------------------------------------------------------
	// TNUMBER ABSTRACT HOOK IMPLEMENTATIONS
	// -------------------------------------------------------------------------

	protected _raddScalar(i: number): Ptr  { return add_int_tint(i, this._inner); }
	protected _rsubScalar(i: number): Ptr  { return sub_int_tint(i, this._inner); }
	protected _rmulScalar(i: number): Ptr  { return mult_int_tint(i, this._inner); }
	protected _rdivScalar(i: number): Ptr  { return div_int_tint(i, this._inner); }
	protected _distanceScalar(i: number): Ptr        { return tdistance_tint_int(this._inner, i); }
	protected _nadScalar(i: number): number          { return nad_tint_int(this._inner, i); }
	protected _nadTemporal(other: TNumber): number   { return nad_tint_tint(this._inner, other.inner); }
	protected _nadTBox(box: Ptr): number             { return nad_tint_tbox(this._inner, box); }
}
