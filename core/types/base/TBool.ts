import { Temporal } from '../temporal/Temporal';
import type { Ptr, TimestampTz } from '../../functions/functions.generated';
import {
	tbool_in,
	tbool_out,
	tboolinst_make,
	tbool_start_value,
	tbool_end_value,
	tbool_from_mfjson,
	tnot_tbool,
	tand_tbool_tbool,
	tand_tbool_bool,
	tor_tbool_tbool,
	tor_tbool_bool,
	tbool_at_value,
	tbool_minus_value,
	ever_eq_tbool_bool,
	always_eq_tbool_bool,
	teq_tbool_bool,
	tne_tbool_bool,
	tbool_when_true,
} from '../../functions/functions.generated';

/**
 * Temporal boolean type.
 *
 * Wraps a MEOS TBool pointer and exposes boolean-specific operations
 * on top of the generic Temporal API defined in Temporal.ts.
 *
 * Supports all three subtypes (Instant, Sequence, SequenceSet) through
 * the same class - the subtype is determined by the WKT string at parse time.
 *
 * @example
 * ```ts
 * await initMeos();
 * const t = TBool.fromString('{true@2001-01-01, false@2001-01-02}');
 * console.log(t.startValue()); // true
 * console.log(t.toString());   // {t@2001-01-01 00:00:00+00, f@2001-01-02 00:00:00+00}
 * t.free();
 * ```
 */

export class TBool extends Temporal<boolean> {
	// -------------------------------------------------------------------------
	// CONSTRUCTORS
	// -------------------------------------------------------------------------

	/**
	 * Wrap a raw WASM pointer.
	 * The caller must ensure the pointer is a valid MEOS TBool*.
	 */
	constructor(inner: Ptr) {
		super(inner);
	}

	/**
	 * Parse a TBool from a WKT string.
	 *
	 * Accepts all subtypes:
	 *   Instant:     `"true@2001-01-01"`
	 *   Sequence:    `"[true@2001-01-01, false@2001-01-02]"`
	 *   SequenceSet: `"{[true@2001-01-01, false@2001-01-02], [true@2001-01-03]}"`
	 *
	 * MEOS: tbool_in
	 */
	static fromString(wkt: string): TBool {
		return new TBool(tbool_in(wkt));
	}

	/**
	 * Parse a TBool from a MF-JSON string.
	 * MEOS: tbool_from_mfjson
	 */
	static fromMFJSON(mfjson: string): TBool {
		return new TBool(tbool_from_mfjson(mfjson));
	}

	/**
	 * Create a TBoolInst from a boolean value and a timestamp.
	 *
	 * @param value     The boolean value.
	 * @param timestamp Microseconds since 2000-01-01 UTC (TimestampTz).
	 *
	 * MEOS: tboolinst_make
	 */
	static fromInstant(value: boolean, timestamp: TimestampTz): TBool {
		return new TBool(tboolinst_make(value, timestamp));
	}

	// -------------------------------------------------------------------------
	// ABSTRACT IMPLEMENTATION
	// -------------------------------------------------------------------------

	protected _fromInner(inner: Ptr): this {
		return new TBool(inner) as this;
	}

	/**
	 * WKT string representation.
	 * MEOS: tbool_out
	 */
	toString(): string {
		return tbool_out(this._inner);
	}

	/**
	 * Starting value of the temporal.
	 * MEOS: tbool_start_value
	 */
	startValue(): boolean {
		return tbool_start_value(this._inner);
	}

	/**
	 * Ending value of the temporal.
	 * MEOS: tbool_end_value
	 */
	endValue(): boolean {
		return tbool_end_value(this._inner);
	}

	// -------------------------------------------------------------------------
	// LOGICAL OPERATIONS
	// -------------------------------------------------------------------------

	/**
	 * Temporal negation: returns a new TBool with all values flipped.
	 * MEOS: tnot_tbool
	 */
	not(): TBool {
		return new TBool(tnot_tbool(this._inner));
	}

	/**
	 * Temporal conjunction with another TBool or a constant boolean.
	 * MEOS: tand_tbool_tbool / tand_tbool_bool
	 */
	and(other: TBool | boolean): TBool {
		if (other instanceof TBool)
			return new TBool(tand_tbool_tbool(this._inner, other._inner));
		return new TBool(tand_tbool_bool(this._inner, other));
	}

	/**
	 * Temporal disjunction with another TBool or a constant boolean.
	 * MEOS: tor_tbool_tbool / tor_tbool_bool
	 */
	or(other: TBool | boolean): TBool {
		if (other instanceof TBool)
			return new TBool(tor_tbool_tbool(this._inner, other._inner));
		return new TBool(tor_tbool_bool(this._inner, other));
	}

	// -------------------------------------------------------------------------
	// RESTRICTIONS
	// -------------------------------------------------------------------------

	/**
	 * Restrict to instants where the value equals b.
	 * MEOS: tbool_at_value
	 */
	at(b: boolean): TBool {
		return new TBool(tbool_at_value(this._inner, b));
	}

	/**
	 * Restrict to instants where the value differs from b.
	 * MEOS: tbool_minus_value
	 */
	minus(b: boolean): TBool {
		return new TBool(tbool_minus_value(this._inner, b));
	}

	// -------------------------------------------------------------------------
	// EVER / ALWAYS COMPARISONS
	// -------------------------------------------------------------------------

	/**
	 * Returns true if the value is ever equal to b.
	 *
	 * MEOS ever/always functions return int (-1 on error, 0 for false, 1 for true).
	 * The > 0 conversion maps this to a boolean, treating errors as false.
	 *
	 * MEOS: ever_eq_tbool_bool
	 */
	everEq(b: boolean): boolean {
		return ever_eq_tbool_bool(this._inner, b) > 0;
	}

	/**
	 * Returns true if the value is always equal to b.
	 *
	 * See everEq for the > 0 conversion rationale.
	 *
	 * MEOS: always_eq_tbool_bool
	 */
	alwaysEq(b: boolean): boolean {
		return always_eq_tbool_bool(this._inner, b) > 0;
	}

	/**
	 * Returns true if the value is never equal to b.
	 * Implemented as the logical complement of everEq.
	 */
	neverEq(b: boolean): boolean {
		return !this.everEq(b);
	}

	// -------------------------------------------------------------------------
	// TEMPORAL COMPARISONS
	// -------------------------------------------------------------------------

	/**
	 * Returns a TBool that is true at each instant where this equals b.
	 * MEOS: teq_tbool_bool
	 */
	temporalEq(b: boolean): TBool {
		return new TBool(teq_tbool_bool(this._inner, b));
	}

	/**
	 * Returns a TBool that is true at each instant where this differs from b.
	 * MEOS: tne_tbool_bool
	 */
	temporalNe(b: boolean): TBool {
		return new TBool(tne_tbool_bool(this._inner, b));
	}

	// -------------------------------------------------------------------------
	// SPAN QUERIES
	// -------------------------------------------------------------------------

	/**
	 * Returns a raw pointer to the TsTzSpanSet of time periods where this is true.
	 *
	 * Returns Ptr rather than a TsTzSpanSet object because that type is not yet
	 * implemented. Cast the pointer manually once TsTzSpanSet is available.
	 *
	 * MEOS: tbool_when_true
	 */
	whenTrue(): Ptr {
		return tbool_when_true(this._inner);
	}

	/**
	 * Returns a raw pointer to the TsTzSpanSet of time periods where this is false.
	 *
	 * Implemented as whenTrue() applied to the logical negation of this temporal.
	 * Note: tnot_tbool allocates a new MEOS object that is not freed here - the
	 * caller is responsible for freeing the returned Ptr.
	 *
	 * MEOS: tnot_tbool + tbool_when_true
	 */
	whenFalse(): Ptr {
		return tbool_when_true(tnot_tbool(this._inner));
	}
}
