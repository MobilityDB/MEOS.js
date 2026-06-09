import type { Ptr, TimestampTz } from '../../functions/functions.generated.js';
import { getModule } from '../../runtime/meos.js';
import {
	tbox_in,
	tbox_out,
	tbox_from_hexwkb,
	tbox_as_hexwkb,
	tbox_make,
	tbox_copy,
	tbox_hash,
	tbox_hast,
	tbox_hasx,
	tbox_xmin,
	tbox_xmax,
	tbox_xmin_inc,
	tbox_xmax_inc,
	tbox_tmin,
	tbox_tmax,
	tbox_tmin_inc,
	tbox_tmax_inc,
	tbox_to_intspan,
	tbox_to_floatspan,
	tbox_to_tstzspan,
	int_to_tbox,
	float_to_tbox,
	span_to_tbox,
	timestamptz_to_tbox,
	int_timestamptz_to_tbox,
	float_timestamptz_to_tbox,
	int_tstzspan_to_tbox,
	float_tstzspan_to_tbox,
	numspan_tstzspan_to_tbox,
	numspan_timestamptz_to_tbox,
	set_to_tbox,
	spanset_to_tbox,
	tintbox_expand,
	tfloatbox_expand,
	tbox_expand_time,
	tbox_round,
	tintbox_shift_scale,
	tfloatbox_shift_scale,
	tbox_shift_scale_time,
	adjacent_tbox_tbox,
	contained_tbox_tbox,
	contains_tbox_tbox,
	overlaps_tbox_tbox,
	same_tbox_tbox,
	left_tbox_tbox,
	overleft_tbox_tbox,
	right_tbox_tbox,
	overright_tbox_tbox,
	before_tbox_tbox,
	overbefore_tbox_tbox,
	after_tbox_tbox,
	overafter_tbox_tbox,
	intersection_tbox_tbox,
	union_tbox_tbox,
	tbox_eq,
	tbox_ne,
	tbox_lt,
	tbox_le,
	tbox_gt,
	tbox_ge,
	tbox_cmp,
	meos_free,
} from '../../functions/functions.generated.js';

/**
 * A temporal bounding box with an optional numeric (X) dimension and an optional temporal (T) dimension.
 *
 * A `TBox` may have either or both dimensions:
 * - X-only: numeric range (integer or float span).
 * - T-only: timestamp range.
 * - XT: both numeric and temporal ranges.
 *
 * MEOS outputs `TBOXFLOAT X(...)` for float-typed X dimensions and `TBOX X(...)` for integer ones.
 *
 * @example
 * ```ts
 * const b = TBox.fromString('TBOXFLOAT XT([1.5, 10.5],[2020-01-01, 2020-12-31])');
 * console.log(b.hasX()); // true
 * console.log(b.hasT()); // true
 * console.log(b.xmin()); // 1.5
 * b.free();
 * ```
 */
export class TBox {
	protected readonly _inner: Ptr;

	constructor(inner: Ptr) {
		this._inner = inner;
	}

	// -------------------------------------------------------------------------
	// LIFECYCLE
	// -------------------------------------------------------------------------

	/** Raw WASM heap pointer. Do not free this value directly; use {@link free}. */
	get inner(): Ptr {
		return this._inner;
	}

	/** Releases the WASM-allocated memory. Must be called when the object is no longer needed. */
	free(): void {
		meos_free(this._inner);
	}

	/** Implements the `using` resource-management protocol — calls {@link free} automatically. */
	[Symbol.dispose](): void {
		this.free();
	}

	/**
	 * Returns a deep copy of this box.
	 * The caller is responsible for calling {@link free} on the returned copy.
	 */
	copy(): TBox {
		return new TBox(tbox_copy(this._inner));
	}

	// -------------------------------------------------------------------------
	// CONSTRUCTORS
	// -------------------------------------------------------------------------

	/**
	 * Parses a `TBox` from its WKT string representation.
	 * @param str WKT string, e.g. `"TBOXFLOAT XT([1.5, 10.5],[2020-01-01, 2020-12-31])"`.
	 */
	static fromString(str: string): TBox {
		return new TBox(tbox_in(str));
	}

	/**
	 * Deserialises a `TBox` from a hex-encoded WKB string produced by {@link asHexWKB}.
	 * @param hexwkb Hex-encoded WKB string.
	 */
	static fromHexWKB(hexwkb: string): TBox {
		return new TBox(tbox_from_hexwkb(hexwkb));
	}

	/**
	 * Creates a T-only `TBox` from a single integer value (X dimension is a degenerate point span).
	 * @param i Integer value.
	 */
	static fromInt(i: number): TBox {
		return new TBox(int_to_tbox(i));
	}

	/**
	 * Creates a T-only `TBox` from a single float value (X dimension is a degenerate point span).
	 * @param d Float value.
	 */
	static fromFloat(d: number): TBox {
		return new TBox(float_to_tbox(d));
	}

	/**
	 * Creates an X-only `TBox` from a numeric span (IntSpan or FloatSpan).
	 * @param spanPtr Raw WASM pointer to an IntSpan or FloatSpan.
	 */
	static fromSpan(spanPtr: Ptr): TBox {
		return new TBox(span_to_tbox(spanPtr));
	}

	/**
	 * Creates a T-only `TBox` from a single timestamp.
	 * @param t Timestamp as microseconds since 2000-01-01 UTC.
	 */
	static fromTimestamp(t: TimestampTz): TBox {
		return new TBox(timestamptz_to_tbox(t));
	}

	/**
	 * Creates an XT `TBox` from a single integer and a single timestamp.
	 * @param i Integer value for the X dimension.
	 * @param t Timestamp as microseconds since 2000-01-01 UTC for the T dimension.
	 */
	static fromIntTimestamp(i: number, t: TimestampTz): TBox {
		return new TBox(int_timestamptz_to_tbox(i, t));
	}

	/**
	 * Creates an XT `TBox` from a single float and a single timestamp.
	 * @param d Float value for the X dimension.
	 * @param t Timestamp as microseconds since 2000-01-01 UTC for the T dimension.
	 */
	static fromFloatTimestamp(d: number, t: TimestampTz): TBox {
		return new TBox(float_timestamptz_to_tbox(d, t));
	}

	/**
	 * Creates an XT `TBox` from a single integer and a timestamp span.
	 * @param i Integer value for the X dimension.
	 * @param tstzSpanPtr Raw WASM pointer to a TsTzSpan for the T dimension.
	 */
	static fromIntTsTzSpan(i: number, tstzSpanPtr: Ptr): TBox {
		return new TBox(int_tstzspan_to_tbox(i, tstzSpanPtr));
	}

	/**
	 * Creates an XT `TBox` from a single float and a timestamp span.
	 * @param d Float value for the X dimension.
	 * @param tstzSpanPtr Raw WASM pointer to a TsTzSpan for the T dimension.
	 */
	static fromFloatTsTzSpan(d: number, tstzSpanPtr: Ptr): TBox {
		return new TBox(float_tstzspan_to_tbox(d, tstzSpanPtr));
	}

	/**
	 * Creates an XT `TBox` from a numeric span and a timestamp span.
	 * @param numSpanPtr Raw WASM pointer to an IntSpan or FloatSpan for the X dimension.
	 * @param tstzSpanPtr Raw WASM pointer to a TsTzSpan for the T dimension.
	 */
	static fromNumSpanTsTzSpan(numSpanPtr: Ptr, tstzSpanPtr: Ptr): TBox {
		return new TBox(numspan_tstzspan_to_tbox(numSpanPtr, tstzSpanPtr));
	}

	/**
	 * Creates an XT `TBox` from a numeric span and a single timestamp.
	 * @param numSpanPtr Raw WASM pointer to an IntSpan or FloatSpan for the X dimension.
	 * @param t Timestamp as microseconds since 2000-01-01 UTC for the T dimension.
	 */
	static fromNumSpanTimestamp(numSpanPtr: Ptr, t: TimestampTz): TBox {
		return new TBox(numspan_timestamptz_to_tbox(numSpanPtr, t));
	}

	/**
	 * Creates a `TBox` from a MEOS set (IntSet or FloatSet).
	 * @param setPtr Raw WASM pointer to a set.
	 */
	static fromSet(setPtr: Ptr): TBox {
		return new TBox(set_to_tbox(setPtr));
	}

	/**
	 * Creates a `TBox` from a MEOS span set (IntSpanSet, FloatSpanSet, or TsTzSpanSet).
	 * @param spanSetPtr Raw WASM pointer to a span set.
	 */
	static fromSpanSet(spanSetPtr: Ptr): TBox {
		return new TBox(spanset_to_tbox(spanSetPtr));
	}

	/**
	 * Builds a `TBox` from a numeric span and/or a temporal span.
	 * Pass `0` for either argument to omit that dimension.
	 *
	 * @param xSpanPtr Raw WASM pointer to an IntSpan or FloatSpan (`0` = no X dimension).
	 * @param tSpanPtr Raw WASM pointer to a TsTzSpan (`0` = no T dimension).
	 */
	static make(xSpanPtr: Ptr, tSpanPtr: Ptr): TBox {
		return new TBox(tbox_make(xSpanPtr, tSpanPtr));
	}

	// -------------------------------------------------------------------------
	// OUTPUT
	// -------------------------------------------------------------------------

	/**
	 * Returns the WKT string representation.
	 * @param maxdd Maximum decimal digits for float values (default `15`).
	 */
	toString(maxdd = 15): string {
		return tbox_out(this._inner, maxdd);
	}

	/**
	 * Serialises this box to a hex-encoded WKB string.
	 * @param variant WKB encoding variant (default `4` = Extended WKB).
	 */
	asHexWKB(variant = 4): string {
		// tbox_as_hexwkb_w requires a valid size_t* output parameter (not NULL).
		// Allocate 8 bytes on the WASM heap as a sink; the value is discarded.
		const sizePtr = (
			getModule() as unknown as { allocate(slab: Uint8Array, allocator: number): number }
		).allocate(new Uint8Array(8), 0) as Ptr;
		return tbox_as_hexwkb(this._inner, variant, sizePtr);
	}

	// -------------------------------------------------------------------------
	// ACCESSORS
	// -------------------------------------------------------------------------

	/** Returns a 32-bit integer hash of this box. */
	hash(): number {
		return tbox_hash(this._inner);
	}

	/** `true` if this box has a numeric (X) dimension. */
	hasX(): boolean {
		return tbox_hasx(this._inner);
	}

	/** `true` if this box has a temporal (T) dimension. */
	hasT(): boolean {
		return tbox_hast(this._inner);
	}

	/** Returns the lower numeric bound. For integer X dimensions, returns the inclusive lower value. */
	xmin(): number {
		return tbox_xmin(this._inner);
	}

	/**
	 * Returns the upper numeric bound.
	 * For integer X dimensions, returns the inclusive upper value (half-open span upper minus 1).
	 */
	xmax(): number {
		return tbox_xmax(this._inner);
	}

	/** `true` if the lower numeric bound is inclusive (`[`). */
	xminInc(): boolean {
		return tbox_xmin_inc(this._inner);
	}

	/** `true` if the upper numeric bound is inclusive (`]`). */
	xmaxInc(): boolean {
		return tbox_xmax_inc(this._inner);
	}

	/** Returns the lower temporal bound as microseconds since 2000-01-01 UTC. */
	tmin(): TimestampTz {
		return tbox_tmin(this._inner);
	}

	/** Returns the upper temporal bound as microseconds since 2000-01-01 UTC. */
	tmax(): TimestampTz {
		return tbox_tmax(this._inner);
	}

	/** `true` if the lower temporal bound is inclusive (`[`). */
	tminInc(): boolean {
		return tbox_tmin_inc(this._inner);
	}

	/** `true` if the upper temporal bound is inclusive (`]`). */
	tmaxInc(): boolean {
		return tbox_tmax_inc(this._inner);
	}

	// -------------------------------------------------------------------------
	// TOPOLOGICAL PREDICATES
	// -------------------------------------------------------------------------

	/** `true` if `this` and `other` share exactly one boundary point without overlapping. */
	isAdjacent(other: TBox): boolean {
		return adjacent_tbox_tbox(this._inner, other.inner);
	}

	/** `true` if `this` is entirely contained within `other`. */
	isContainedIn(other: TBox): boolean {
		return contained_tbox_tbox(this._inner, other.inner);
	}

	/** `true` if `this` entirely contains `other`. */
	contains(other: TBox): boolean {
		return contains_tbox_tbox(this._inner, other.inner);
	}

	/** `true` if `this` and `other` share at least one point. */
	overlaps(other: TBox): boolean {
		return overlaps_tbox_tbox(this._inner, other.inner);
	}

	/** `true` if `this` and `other` cover the same space (same bounds and inclusivity). */
	isSame(other: TBox): boolean {
		return same_tbox_tbox(this._inner, other.inner);
	}

	// -------------------------------------------------------------------------
	// POSITION ON X AXIS
	// -------------------------------------------------------------------------

	/** `true` if `this` is entirely to the left of `other` on the numeric axis. */
	isLeft(other: TBox): boolean {
		return left_tbox_tbox(this._inner, other.inner);
	}

	/** `true` if `this` does not extend to the right of `other` on the numeric axis. */
	isOverOrLeft(other: TBox): boolean {
		return overleft_tbox_tbox(this._inner, other.inner);
	}

	/** `true` if `this` is entirely to the right of `other` on the numeric axis. */
	isRight(other: TBox): boolean {
		return right_tbox_tbox(this._inner, other.inner);
	}

	/** `true` if `this` does not extend to the left of `other` on the numeric axis. */
	isOverOrRight(other: TBox): boolean {
		return overright_tbox_tbox(this._inner, other.inner);
	}

	// -------------------------------------------------------------------------
	// POSITION ON T AXIS
	// -------------------------------------------------------------------------

	/** `true` if `this` is entirely before `other` on the temporal axis. */
	isBefore(other: TBox): boolean {
		return before_tbox_tbox(this._inner, other.inner);
	}

	/** `true` if `this` does not extend after `other` on the temporal axis. */
	isOverOrBefore(other: TBox): boolean {
		return overbefore_tbox_tbox(this._inner, other.inner);
	}

	/** `true` if `this` is entirely after `other` on the temporal axis. */
	isAfter(other: TBox): boolean {
		return after_tbox_tbox(this._inner, other.inner);
	}

	/** `true` if `this` does not extend before `other` on the temporal axis. */
	isOverOrAfter(other: TBox): boolean {
		return overafter_tbox_tbox(this._inner, other.inner);
	}

	// -------------------------------------------------------------------------
	// SET OPERATIONS
	// -------------------------------------------------------------------------

	/**
	 * Returns the intersection of `this` and `other`, or `null` if they are disjoint.
	 * The caller is responsible for calling {@link free} on the result.
	 */
	intersection(other: TBox): TBox | null {
		const ptr = intersection_tbox_tbox(this._inner, other.inner);
		return ptr === 0 ? null : new TBox(ptr);
	}

	/**
	 * Returns the union of `this` and `other`.
	 * The caller is responsible for calling {@link free} on the result.
	 * @param strict If `true`, throws when the boxes do not overlap or touch (default `false`).
	 */
	union(other: TBox, strict = false): TBox {
		return new TBox(union_tbox_tbox(this._inner, other.inner, strict));
	}

	// -------------------------------------------------------------------------
	// CONVERSIONS
	// -------------------------------------------------------------------------

	/**
	 * Extracts the X dimension as an IntSpan and returns the raw WASM pointer.
	 * Use `new IntSpan(ptr)` to obtain a typed object.
	 */
	toIntSpan(): Ptr {
		return tbox_to_intspan(this._inner);
	}

	/**
	 * Extracts the X dimension as a FloatSpan and returns the raw WASM pointer.
	 * Use `new FloatSpan(ptr)` to obtain a typed object.
	 */
	toFloatSpan(): Ptr {
		return tbox_to_floatspan(this._inner);
	}

	/**
	 * Extracts the T dimension as a TsTzSpan and returns the raw WASM pointer.
	 * Use `new TsTzSpan(ptr)` to obtain a typed object.
	 */
	toTsTzSpan(): Ptr {
		return tbox_to_tstzspan(this._inner);
	}

	// -------------------------------------------------------------------------
	// MATH
	// -------------------------------------------------------------------------

	/**
	 * Returns a new box with the integer X dimension expanded by `i` on each side.
	 * Requires an integer-typed TBox (built from an IntSpan); throws for float boxes.
	 * @param i Number of integers to add to each end.
	 */
	expandInt(i: number): TBox {
		return new TBox(tintbox_expand(this._inner, i));
	}

	/**
	 * Returns a new box with the float X dimension expanded by `d` on each side.
	 * @param d Amount to add to each end.
	 */
	expandFloat(d: number): TBox {
		return new TBox(tfloatbox_expand(this._inner, d));
	}

	/**
	 * Returns a new box with the float X bounds rounded to `maxdd` decimal places.
	 * @param maxdd Number of decimal digits to keep.
	 */
	round(maxdd: number): TBox {
		return new TBox(tbox_round(this._inner, maxdd));
	}

	/**
	 * Returns a new box with the integer X dimension shifted and/or scaled.
	 * Requires an integer-typed TBox (built from an IntSpan); throws for float boxes.
	 * @param shift Amount to add to every integer bound (ignored when `hasShift` is `false`).
	 * @param width New integer width (ignored when `hasWidth` is `false`).
	 * @param hasShift Set to `false` to skip shifting (default `true`).
	 * @param hasWidth Set to `false` to skip scaling (default `true`).
	 */
	shiftScaleInt(shift: number, width: number, hasShift = true, hasWidth = true): TBox {
		return new TBox(tintbox_shift_scale(this._inner, shift, width, hasShift, hasWidth));
	}

	/**
	 * Returns a new box with the float X dimension shifted and/or scaled.
	 * @param shift Amount to add to every float bound (ignored when `hasShift` is `false`).
	 * @param width New float width (ignored when `hasWidth` is `false`).
	 * @param hasShift Set to `false` to skip shifting (default `true`).
	 * @param hasWidth Set to `false` to skip scaling (default `true`).
	 */
	shiftScaleFloat(shift: number, width: number, hasShift = true, hasWidth = true): TBox {
		return new TBox(tfloatbox_shift_scale(this._inner, shift, width, hasShift, hasWidth));
	}

	/**
	 * Returns a new box with the T dimension expanded by the given interval on each side.
	 * @param interval Raw WASM pointer to a MEOS interval.
	 */
	expandTime(interval: Ptr): TBox {
		return new TBox(tbox_expand_time(this._inner, interval));
	}

	/**
	 * Returns a new box with the T dimension shifted and/or scaled.
	 * @param shift    Raw WASM pointer to a MEOS interval for the shift amount (`0` to skip).
	 * @param duration Raw WASM pointer to a MEOS interval for the new duration (`0` to skip).
	 */
	shiftScaleTime(shift: Ptr, duration: Ptr): TBox {
		return new TBox(tbox_shift_scale_time(this._inner, shift, duration));
	}

	// -------------------------------------------------------------------------
	// COMPARISONS
	// -------------------------------------------------------------------------

	/** `true` if `this` and `other` are identical in both dimensions. */
	eq(other: TBox): boolean {
		return tbox_eq(this._inner, other.inner);
	}

	/** `true` if `this` and `other` differ in at least one dimension. */
	ne(other: TBox): boolean {
		return tbox_ne(this._inner, other.inner);
	}

	/** `true` if `this` is strictly less than `other` in MEOS total ordering. */
	lt(other: TBox): boolean {
		return tbox_lt(this._inner, other.inner);
	}

	/** `true` if `this` is less than or equal to `other` in MEOS total ordering. */
	le(other: TBox): boolean {
		return tbox_le(this._inner, other.inner);
	}

	/** `true` if `this` is strictly greater than `other` in MEOS total ordering. */
	gt(other: TBox): boolean {
		return tbox_gt(this._inner, other.inner);
	}

	/** `true` if `this` is greater than or equal to `other` in MEOS total ordering. */
	ge(other: TBox): boolean {
		return tbox_ge(this._inner, other.inner);
	}

	/**
	 * Returns the MEOS total ordering comparison result.
	 * @returns `-1` if `this < other`, `0` if equal, `1` if `this > other`.
	 */
	cmp(other: TBox): number {
		return tbox_cmp(this._inner, other.inner);
	}
}
