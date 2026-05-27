import { Temporal } from '../../temporal/Temporal';
import type { Ptr } from '../../../functions/functions.generated';
import {
	tnumber_integral,
	tnumber_avg_value,
	tnumber_twavg,
	tnumber_abs,
	tnumber_delta_value,
	tnumber_trend,
	tnumber_to_span,
	tnumber_to_tbox,
	tnumber_at_span,
	tnumber_at_spanset,
	tnumber_at_tbox,
	tnumber_minus_span,
	tnumber_minus_spanset,
	tnumber_minus_tbox,
	add_tnumber_tnumber,
	sub_tnumber_tnumber,
	mul_tnumber_tnumber,
	div_tnumber_tnumber,
	tdistance_tnumber_tnumber,
} from '../../../functions/functions.generated';

/**
 * Abstract base class for temporal numeric types (TInt, TFloat).
 *
 * Exposes all MEOS `tnumber_*` functions and cross-temporal arithmetic on
 * top of the generic `Temporal<number>` API.  Type-specific operations
 * (arithmetic with a scalar, distance to a scalar, NAD) are delegated to
 * abstract hooks so that TInt and TFloat can dispatch to the correct
 * MEOS function (`tint_*` vs `tfloat_*`).
 */
export abstract class TNumber extends Temporal<number> {

	// -------------------------------------------------------------------------
	// ABSTRACT HOOKS — implemented by TInt and TFloat
	// -------------------------------------------------------------------------

	/** Calls add_int_tint or add_float_tfloat. */
	protected abstract _raddScalar(scalar: number): Ptr;
	/** Calls sub_int_tint or sub_float_tfloat. */
	protected abstract _rsubScalar(scalar: number): Ptr;
	/** Calls mul_int_tint or mul_float_tfloat. */
	protected abstract _rmulScalar(scalar: number): Ptr;
	/** Calls div_int_tint or div_float_tfloat. */
	protected abstract _rdivScalar(scalar: number): Ptr;
	/** Calls tdistance_tint_int or tdistance_tfloat_float. */
	protected abstract _distanceScalar(scalar: number): Ptr;
	/** Calls nad_tint_int or nad_tfloat_float. */
	protected abstract _nadScalar(scalar: number): number;
	/** Calls nad_tint_tint or nad_tfloat_tfloat. */
	protected abstract _nadTemporal(other: TNumber): number;
	/** Calls nad_tint_tbox or nad_tfloat_tbox. */
	protected abstract _nadTBox(box: Ptr): number;

	// -------------------------------------------------------------------------
	// AGGREGATE-STYLE ACCESSORS
	// -------------------------------------------------------------------------

	/** Returns the temporal integral (area under the curve). MEOS: tnumber_integral */
	integral(): number { return tnumber_integral(this._inner); }

	/** Returns the time-weighted average. MEOS: tnumber_twavg */
	timeWeightedAverage(): number { return tnumber_twavg(this._inner); }

	/** Returns the plain average of all instant values. MEOS: tnumber_avg_value */
	avgValue(): number { return tnumber_avg_value(this._inner); }

	// -------------------------------------------------------------------------
	// VALUE TRANSFORMATIONS
	// -------------------------------------------------------------------------

	/** Returns a new temporal with each value replaced by its absolute value. MEOS: tnumber_abs */
	abs(): this { return this._fromInner(tnumber_abs(this._inner)); }

	/**
	 * Returns a new temporal where each value is the difference from the
	 * previous instant's value (first instant gets 0). MEOS: tnumber_delta_value
	 */
	deltaValue(): this { return this._fromInner(tnumber_delta_value(this._inner)); }

	/**
	 * Returns +1 / 0 / -1 at each instant indicating whether the value is
	 * increasing, constant, or decreasing. MEOS: tnumber_trend
	 */
	trend(): this { return this._fromInner(tnumber_trend(this._inner)); }

	// -------------------------------------------------------------------------
	// CONVERSIONS
	// -------------------------------------------------------------------------

	/**
	 * Returns the value span (range) of this temporal as a raw pointer.
	 * MEOS: tnumber_to_span
	 */
	toValueSpan(): Ptr { return tnumber_to_span(this._inner); }

	/**
	 * Returns the temporal bounding box as a raw TBox pointer.
	 * MEOS: tnumber_to_tbox
	 */
	toTBox(): Ptr { return tnumber_to_tbox(this._inner); }

	// -------------------------------------------------------------------------
	// RESTRICTIONS — value spans / tbox
	// -------------------------------------------------------------------------

	/** Restricts to instants whose value falls in `span`. MEOS: tnumber_at_span */
	atSpan(span: Ptr): this { return this._fromInner(tnumber_at_span(this._inner, span)); }

	/** Restricts to instants whose value falls in `ss`. MEOS: tnumber_at_spanset */
	atSpanSet(ss: Ptr): this { return this._fromInner(tnumber_at_spanset(this._inner, ss)); }

	/** Restricts to the value-time region defined by `box`. MEOS: tnumber_at_tbox */
	atTBox(box: Ptr): this { return this._fromInner(tnumber_at_tbox(this._inner, box)); }

	/** Excludes instants whose value falls in `span`. MEOS: tnumber_minus_span */
	minusSpan(span: Ptr): this { return this._fromInner(tnumber_minus_span(this._inner, span)); }

	/** Excludes instants whose value falls in `ss`. MEOS: tnumber_minus_spanset */
	minusSpanSet(ss: Ptr): this { return this._fromInner(tnumber_minus_spanset(this._inner, ss)); }

	/** Excludes the value-time region defined by `box`. MEOS: tnumber_minus_tbox */
	minusTBox(box: Ptr): this { return this._fromInner(tnumber_minus_tbox(this._inner, box)); }

	// -------------------------------------------------------------------------
	// CROSS-TEMPORAL ARITHMETIC  (temporal × temporal)
	// -------------------------------------------------------------------------

	/** Adds another TNumber to this one instant-by-instant. MEOS: add_tnumber_tnumber */
	addTemporal(other: TNumber): this {
		return this._fromInner(add_tnumber_tnumber(this._inner, other._inner));
	}

	/** Subtracts another TNumber from this one. MEOS: sub_tnumber_tnumber */
	subTemporal(other: TNumber): this {
		return this._fromInner(sub_tnumber_tnumber(this._inner, other._inner));
	}

	/** Multiplies this by another TNumber. MEOS: mul_tnumber_tnumber */
	multTemporal(other: TNumber): this {
		return this._fromInner(mul_tnumber_tnumber(this._inner, other._inner));
	}

	/** Divides this by another TNumber. MEOS: div_tnumber_tnumber */
	divTemporal(other: TNumber): this {
		return this._fromInner(div_tnumber_tnumber(this._inner, other._inner));
	}

	// -------------------------------------------------------------------------
	// COMMUTED SCALAR ARITHMETIC  (scalar ○ temporal)
	// -------------------------------------------------------------------------

	/** Returns `scalar + this` instant-by-instant. MEOS: add_int_tint / add_float_tfloat */
	radd(scalar: number): this { return this._fromInner(this._raddScalar(scalar)); }

	/** Returns `scalar - this` instant-by-instant. MEOS: sub_int_tint / sub_float_tfloat */
	rsub(scalar: number): this { return this._fromInner(this._rsubScalar(scalar)); }

	/** Returns `scalar * this` instant-by-instant. MEOS: mul_int_tint / mul_float_tfloat */
	rmul(scalar: number): this { return this._fromInner(this._rmulScalar(scalar)); }

	/** Returns `scalar / this` instant-by-instant. MEOS: div_int_tint / div_float_tfloat */
	rdiv(scalar: number): this { return this._fromInner(this._rdivScalar(scalar)); }

	// -------------------------------------------------------------------------
	// DISTANCE
	// -------------------------------------------------------------------------

	/**
	 * Returns the temporal distance between this and a scalar value.
	 * Result is a TFloat with the instantaneous distance at each timestamp.
	 * MEOS: tdistance_tint_int / tdistance_tfloat_float
	 */
	distanceScalar(scalar: number): this {
		return this._fromInner(this._distanceScalar(scalar));
	}

	/**
	 * Returns the temporal distance between this and another TNumber.
	 * MEOS: tdistance_tnumber_tnumber
	 */
	distanceTemporal(other: TNumber): this {
		return this._fromInner(tdistance_tnumber_tnumber(this._inner, other._inner));
	}

	// -------------------------------------------------------------------------
	// NEAREST APPROACH DISTANCE (NAD)
	// -------------------------------------------------------------------------

	/** Nearest approach distance to a scalar value. MEOS: nad_tint_int / nad_tfloat_float */
	nad(scalar: number): number { return this._nadScalar(scalar); }

	/** Nearest approach distance to another TNumber. MEOS: nad_tint_tint / nad_tfloat_tfloat */
	nadTemporal(other: TNumber): number { return this._nadTemporal(other); }

	/** Nearest approach distance to a TBox. MEOS: nad_tint_tbox / nad_tfloat_tbox */
	nadTBox(box: Ptr): number { return this._nadTBox(box); }
}
