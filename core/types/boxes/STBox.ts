import type { Ptr, TimestampTz } from '../../functions/functions.generated.js';
import { getModule } from '../../runtime/meos.js';
import {
	stbox_in,
	stbox_out,
	stbox_from_hexwkb,
	stbox_as_hexwkb,
	stbox_make,
	stbox_copy,
	stbox_hash,
	stbox_hasx,
	stbox_hasz,
	stbox_hast,
	stbox_isgeodetic,
	stbox_xmin,
	stbox_xmax,
	stbox_ymin,
	stbox_ymax,
	stbox_zmin,
	stbox_zmax,
	stbox_tmin,
	stbox_tmax,
	stbox_tmin_inc,
	stbox_tmax_inc,
	stbox_srid,
	stbox_set_srid,
	stbox_to_tstzspan,
	stbox_to_geo,
	stbox_get_space,
	stbox_expand_space,
	stbox_expand_time,
	stbox_shift_scale_time,
	stbox_round,
	adjacent_stbox_stbox,
	contained_stbox_stbox,
	contains_stbox_stbox,
	overlaps_stbox_stbox,
	same_stbox_stbox,
	left_stbox_stbox,
	overleft_stbox_stbox,
	right_stbox_stbox,
	overright_stbox_stbox,
	below_stbox_stbox,
	overbelow_stbox_stbox,
	above_stbox_stbox,
	overabove_stbox_stbox,
	front_stbox_stbox,
	overfront_stbox_stbox,
	back_stbox_stbox,
	overback_stbox_stbox,
	before_stbox_stbox,
	overbefore_stbox_stbox,
	after_stbox_stbox,
	overafter_stbox_stbox,
	intersection_stbox_stbox,
	union_stbox_stbox,
	nad_stbox_stbox,
	stbox_eq,
	stbox_ne,
	stbox_lt,
	stbox_le,
	stbox_gt,
	stbox_ge,
	stbox_cmp,
	timestamptz_to_stbox,
	tstzset_to_stbox,
	tstzspan_to_stbox,
	tstzspanset_to_stbox,
	meos_free,
} from '../../functions/functions.generated.js';

/**
 * A spatio-temporal bounding box with an optional spatial (XYZ) dimension and an optional temporal (T) dimension.
 *
 * Five WKT variants:
 * - `STBOX X((x1,y1),(x2,y2))` 2D spatial only
 * - `STBOX Z((x1,y1,z1),(x2,y2,z2))` 3D spatial only
 * - `STBOX T([t1, t2])` temporal only
 * - `STBOX XT(((x1,y1),(x2,y2)),[t1,t2])` 2D spatial + temporal
 * - `STBOX ZT(((x1,y1,z1),(x2,y2,z2)),[t1,t2])` 3D spatial + temporal
 *
 * Geodetic variants use the `GEODSTBOX` prefix (SRID 4326 by default).
 *
 * @example
 * ```ts
 * const b = STBox.fromString('STBOX XT(((1,1),(2,2)),[2020-01-01,2020-12-31])');
 * console.log(b.hasX());  // true
 * console.log(b.hasT());  // true
 * console.log(b.xmin());  // 1
 * b.free();
 * ```
 */
export class STBox {
	protected readonly _inner: Ptr;

	constructor(inner: Ptr) {
		this._inner = inner;
	}

	// -------------------------------------------------------------------------
	// LIFECYCLE
	// -------------------------------------------------------------------------

	/** Raw WASM heap pointer. Do not free directly; use {@link free}. */
	get inner(): Ptr {
		return this._inner;
	}

	/** Releases the WASM-allocated memory. Must be called when the object is no longer needed. */
	free(): void {
		meos_free(this._inner);
	}

	/** Implements the `using` resource-management protocol calls {@link free} automatically. */
	[Symbol.dispose](): void {
		this.free();
	}

	/** Returns a deep copy of this box. The caller is responsible for calling {@link free} on the result. */
	copy(): STBox {
		return new STBox(stbox_copy(this._inner));
	}

	// -------------------------------------------------------------------------
	// CONSTRUCTORS
	// -------------------------------------------------------------------------

	/**
	 * Parses an `STBox` from its WKT string representation.
	 * @param str WKT string, e.g. `"STBOX XT(((1,1),(2,2)),[2020-01-01,2020-12-31])"`.
	 */
	static fromString(str: string): STBox {
		return new STBox(stbox_in(str));
	}

	/**
	 * Deserialises an `STBox` from a hex-encoded WKB string produced by {@link asHexWKB}.
	 * @param hexwkb Hex-encoded WKB string.
	 */
	static fromHexWKB(hexwkb: string): STBox {
		return new STBox(stbox_from_hexwkb(hexwkb));
	}

	/**
	 * Creates a T-only `STBox` from a single timestamp.
	 * @param t Timestamp as microseconds since 2000-01-01 UTC.
	 */
	static fromTimestamp(t: TimestampTz): STBox {
		return new STBox(timestamptz_to_stbox(t));
	}

	/**
	 * Creates a T-only `STBox` from a `TsTzSet` WASM pointer.
	 * @param tstzSetPtr Raw WASM pointer to a `TsTzSet`.
	 */
	static fromTsTzSet(tstzSetPtr: Ptr): STBox {
		return new STBox(tstzset_to_stbox(tstzSetPtr));
	}

	/**
	 * Creates a T-only `STBox` from a `TsTzSpan` WASM pointer.
	 * @param tstzSpanPtr Raw WASM pointer to a `TsTzSpan`.
	 */
	static fromTsTzSpan(tstzSpanPtr: Ptr): STBox {
		return new STBox(tstzspan_to_stbox(tstzSpanPtr));
	}

	/**
	 * Creates a T-only `STBox` from a `TsTzSpanSet` WASM pointer.
	 * @param tstzSpanSetPtr Raw WASM pointer to a `TsTzSpanSet`.
	 */
	static fromTsTzSpanSet(tstzSpanSetPtr: Ptr): STBox {
		return new STBox(tstzspanset_to_stbox(tstzSpanSetPtr));
	}

	/**
	 * Builds an `STBox` from explicit coordinate bounds.
	 *
	 * At least the 2D spatial dimension (`hasx = true`) or the temporal dimension
	 * (`tstzSpanPtr !== 0`) must be provided.
	 *
	 * @param hasx      `true` to include the XY spatial dimension.
	 * @param hasz      `true` to also include the Z spatial dimension.
	 * @param geodetic  `true` for a geodetic (WGS-84) box.
	 * @param srid      Spatial reference system identifier (e.g. `4326`).
	 * @param xmin      Minimum X coordinate (ignored when `hasx` is `false`).
	 * @param xmax      Maximum X coordinate (ignored when `hasx` is `false`).
	 * @param ymin      Minimum Y coordinate (ignored when `hasx` is `false`).
	 * @param ymax      Maximum Y coordinate (ignored when `hasx` is `false`).
	 * @param zmin      Minimum Z coordinate (ignored when `hasz` is `false`).
	 * @param zmax      Maximum Z coordinate (ignored when `hasz` is `false`).
	 * @param tstzSpanPtr Raw WASM pointer to a `TsTzSpan` for the T dimension (`0` = no T dimension).
	 */
	static make(
		hasx: boolean,
		hasz: boolean,
		geodetic: boolean,
		srid: number,
		xmin: number,
		xmax: number,
		ymin: number,
		ymax: number,
		zmin: number,
		zmax: number,
		tstzSpanPtr: Ptr
	): STBox {
		return new STBox(
			stbox_make(
				hasx,
				hasz,
				geodetic,
				srid,
				xmin,
				xmax,
				ymin,
				ymax,
				zmin,
				zmax,
				tstzSpanPtr
			)
		);
	}

	// -------------------------------------------------------------------------
	// OUTPUT
	// -------------------------------------------------------------------------

	/**
	 * Returns the WKT string representation.
	 * @param maxdd Maximum decimal digits for coordinate values (default `15`).
	 */
	toString(maxdd = 15): string {
		return stbox_out(this._inner, maxdd);
	}

	/**
	 * Serialises this box to a hex-encoded WKB string.
	 * @param variant WKB encoding variant (default `4` = Extended WKB).
	 */
	asHexWKB(variant = 4): string {
		const sizePtr = (
			getModule() as unknown as { allocate(slab: Uint8Array, allocator: number): number }
		).allocate(new Uint8Array(8), 0) as Ptr;
		return stbox_as_hexwkb(this._inner, variant, sizePtr);
	}

	// -------------------------------------------------------------------------
	// ACCESSORS
	// -------------------------------------------------------------------------

	/** Returns a 32-bit integer hash of this box. */
	hash(): number {
		return stbox_hash(this._inner);
	}

	/** `true` if this box has a spatial (XY) dimension. */
	hasX(): boolean {
		return stbox_hasx(this._inner);
	}

	/** `true` if this box has a Z (third spatial) dimension. */
	hasZ(): boolean {
		return stbox_hasz(this._inner);
	}

	/** `true` if this box has a temporal (T) dimension. */
	hasT(): boolean {
		return stbox_hast(this._inner);
	}

	/** `true` if this box uses geodetic (WGS-84) coordinates. */
	isGeodetic(): boolean {
		return stbox_isgeodetic(this._inner);
	}

	/** Returns the minimum X coordinate. Returns `0` if the box has no X dimension. */
	xmin(): number {
		return stbox_xmin(this._inner);
	}

	/** Returns the maximum X coordinate. Returns `0` if the box has no X dimension. */
	xmax(): number {
		return stbox_xmax(this._inner);
	}

	/** Returns the minimum Y coordinate. Returns `0` if the box has no X dimension. */
	ymin(): number {
		return stbox_ymin(this._inner);
	}

	/** Returns the maximum Y coordinate. Returns `0` if the box has no X dimension. */
	ymax(): number {
		return stbox_ymax(this._inner);
	}

	/** Returns the minimum Z coordinate. Returns `0` if the box has no Z dimension. */
	zmin(): number {
		return stbox_zmin(this._inner);
	}

	/** Returns the maximum Z coordinate. Returns `0` if the box has no Z dimension. */
	zmax(): number {
		return stbox_zmax(this._inner);
	}

	/** Returns the lower temporal bound as microseconds since 2000-01-01 UTC. Returns `0` if the box has no T dimension. */
	tmin(): TimestampTz {
		return stbox_tmin(this._inner);
	}

	/** Returns the upper temporal bound as microseconds since 2000-01-01 UTC. Returns `0` if the box has no T dimension. */
	tmax(): TimestampTz {
		return stbox_tmax(this._inner);
	}

	/** `true` if the lower temporal bound is inclusive (`[`). */
	tminInc(): boolean {
		return stbox_tmin_inc(this._inner);
	}

	/** `true` if the upper temporal bound is inclusive (`]`). */
	tmaxInc(): boolean {
		return stbox_tmax_inc(this._inner);
	}

	// -------------------------------------------------------------------------
	// SPATIAL REFERENCE SYSTEM
	// -------------------------------------------------------------------------

	/** Returns the SRID of this box (`0` = no SRID set). */
	srid(): number {
		return stbox_srid(this._inner);
	}

	/**
	 * Returns a new `STBox` with the SRID set to `value`.
	 * @param value The new SRID.
	 */
	setSrid(value: number): STBox {
		return new STBox(stbox_set_srid(this._inner, value));
	}

	// -------------------------------------------------------------------------
	// CONVERSIONS
	// -------------------------------------------------------------------------

	/**
	 * Extracts the temporal dimension as a `TsTzSpan` and returns the raw WASM pointer.
	 * Use `new TsTzSpan(ptr)` to obtain a typed object.
	 */
	toTsTzSpan(): Ptr {
		return stbox_to_tstzspan(this._inner);
	}

	/**
	 * Extracts the spatial dimension as a GSERIALIZED geometry and returns the raw WASM pointer.
	 * Will be typed once `TGeomPoint` is implemented.
	 */
	toGeoPtr(): Ptr {
		return stbox_to_geo(this._inner);
	}

	// -------------------------------------------------------------------------
	// TRANSFORMATIONS
	// -------------------------------------------------------------------------

	/** Returns a new `STBox` containing only the spatial dimension (temporal dimension stripped). */
	getSpace(): STBox {
		return new STBox(stbox_get_space(this._inner));
	}

	/**
	 * Returns a new `STBox` with the spatial dimension expanded by `d` on all sides.
	 * @param d Distance to expand on each side.
	 */
	expandSpace(d: number): STBox {
		return new STBox(stbox_expand_space(this._inner, d));
	}

	/**
	 * Returns a new `STBox` with the temporal dimension expanded by the given interval on both sides.
	 * @param interval Raw WASM pointer to a MEOS interval.
	 */
	expandTime(interval: Ptr): STBox {
		return new STBox(stbox_expand_time(this._inner, interval));
	}

	/**
	 * Returns a new `STBox` with the temporal dimension shifted and/or scaled.
	 * @param shift    Raw WASM pointer to a MEOS interval for the shift amount (`0` to skip).
	 * @param duration Raw WASM pointer to a MEOS interval for the new duration (`0` to skip).
	 */
	shiftScaleTime(shift: Ptr, duration: Ptr): STBox {
		return new STBox(stbox_shift_scale_time(this._inner, shift, duration));
	}

	/**
	 * Returns a new `STBox` with spatial coordinates rounded to `maxdd` decimal places.
	 * @param maxdd Number of decimal digits to keep.
	 */
	round(maxdd: number): STBox {
		return new STBox(stbox_round(this._inner, maxdd));
	}

	// -------------------------------------------------------------------------
	// TOPOLOGICAL PREDICATES
	// -------------------------------------------------------------------------

	/** `true` if `this` and `other` share exactly one boundary point without overlapping. */
	isAdjacent(other: STBox): boolean {
		return adjacent_stbox_stbox(this._inner, other.inner);
	}

	/** `true` if `this` is entirely contained within `other`. */
	isContainedIn(other: STBox): boolean {
		return contained_stbox_stbox(this._inner, other.inner);
	}

	/** `true` if `this` entirely contains `other`. */
	contains(other: STBox): boolean {
		return contains_stbox_stbox(this._inner, other.inner);
	}

	/** `true` if `this` and `other` share at least one point. */
	overlaps(other: STBox): boolean {
		return overlaps_stbox_stbox(this._inner, other.inner);
	}

	/** `true` if `this` and `other` cover the exact same region (same bounds and inclusivity). */
	isSame(other: STBox): boolean {
		return same_stbox_stbox(this._inner, other.inner);
	}

	// -------------------------------------------------------------------------
	// POSITION ON X AXIS
	// -------------------------------------------------------------------------

	/** `true` if `this` is strictly to the left of `other` on the X axis. */
	isLeft(other: STBox): boolean {
		return left_stbox_stbox(this._inner, other.inner);
	}

	/** `true` if `this` does not extend to the right of `other` on the X axis. */
	isOverOrLeft(other: STBox): boolean {
		return overleft_stbox_stbox(this._inner, other.inner);
	}

	/** `true` if `this` is strictly to the right of `other` on the X axis. */
	isRight(other: STBox): boolean {
		return right_stbox_stbox(this._inner, other.inner);
	}

	/** `true` if `this` does not extend to the left of `other` on the X axis. */
	isOverOrRight(other: STBox): boolean {
		return overright_stbox_stbox(this._inner, other.inner);
	}

	// -------------------------------------------------------------------------
	// POSITION ON Y AXIS
	// -------------------------------------------------------------------------

	/** `true` if `this` is strictly below `other` on the Y axis. */
	isBelow(other: STBox): boolean {
		return below_stbox_stbox(this._inner, other.inner);
	}

	/** `true` if `this` does not extend above `other` on the Y axis. */
	isOverOrBelow(other: STBox): boolean {
		return overbelow_stbox_stbox(this._inner, other.inner);
	}

	/** `true` if `this` is strictly above `other` on the Y axis. */
	isAbove(other: STBox): boolean {
		return above_stbox_stbox(this._inner, other.inner);
	}

	/** `true` if `this` does not extend below `other` on the Y axis. */
	isOverOrAbove(other: STBox): boolean {
		return overabove_stbox_stbox(this._inner, other.inner);
	}

	// -------------------------------------------------------------------------
	// POSITION ON Z AXIS
	// -------------------------------------------------------------------------

	/** `true` if `this` is strictly in front of `other` on the Z axis. */
	isFront(other: STBox): boolean {
		return front_stbox_stbox(this._inner, other.inner);
	}

	/** `true` if `this` does not extend behind `other` on the Z axis. */
	isOverOrFront(other: STBox): boolean {
		return overfront_stbox_stbox(this._inner, other.inner);
	}

	/** `true` if `this` is strictly behind `other` on the Z axis. */
	isBehind(other: STBox): boolean {
		return back_stbox_stbox(this._inner, other.inner);
	}

	/** `true` if `this` does not extend in front of `other` on the Z axis. */
	isOverOrBehind(other: STBox): boolean {
		return overback_stbox_stbox(this._inner, other.inner);
	}

	// -------------------------------------------------------------------------
	// POSITION ON T AXIS
	// -------------------------------------------------------------------------

	/** `true` if `this` is entirely before `other` on the temporal axis. */
	isBefore(other: STBox): boolean {
		return before_stbox_stbox(this._inner, other.inner);
	}

	/** `true` if `this` does not extend after `other` on the temporal axis. */
	isOverOrBefore(other: STBox): boolean {
		return overbefore_stbox_stbox(this._inner, other.inner);
	}

	/** `true` if `this` is entirely after `other` on the temporal axis. */
	isAfter(other: STBox): boolean {
		return after_stbox_stbox(this._inner, other.inner);
	}

	/** `true` if `this` does not extend before `other` on the temporal axis. */
	isOverOrAfter(other: STBox): boolean {
		return overafter_stbox_stbox(this._inner, other.inner);
	}

	// -------------------------------------------------------------------------
	// DISTANCE
	// -------------------------------------------------------------------------

	/**
	 * Returns the nearest-approach distance (in spatial units) between `this` and `other`.
	 * Returns `0` if the boxes overlap.
	 */
	distance(other: STBox): number {
		return nad_stbox_stbox(this._inner, other.inner);
	}

	// -------------------------------------------------------------------------
	// SET OPERATIONS
	// -------------------------------------------------------------------------

	/**
	 * Returns the intersection of `this` and `other`, or `null` if they are disjoint.
	 * The caller is responsible for calling {@link free} on the result.
	 */
	intersection(other: STBox): STBox | null {
		const ptr = intersection_stbox_stbox(this._inner, other.inner);
		return ptr === 0 ? null : new STBox(ptr);
	}

	/**
	 * Returns the union of `this` and `other`.
	 * The caller is responsible for calling {@link free} on the result.
	 * @param strict If `true`, throws when the boxes are not contiguous (default `false`).
	 */
	union(other: STBox, strict = false): STBox {
		return new STBox(union_stbox_stbox(this._inner, other.inner, strict));
	}

	// -------------------------------------------------------------------------
	// COMPARISONS
	// -------------------------------------------------------------------------

	/** `true` if `this` and `other` are identical in all dimensions. */
	eq(other: STBox): boolean {
		return stbox_eq(this._inner, other.inner);
	}

	/** `true` if `this` and `other` differ in at least one dimension. */
	ne(other: STBox): boolean {
		return stbox_ne(this._inner, other.inner);
	}

	/** `true` if `this` is strictly less than `other` in MEOS total ordering. */
	lt(other: STBox): boolean {
		return stbox_lt(this._inner, other.inner);
	}

	/** `true` if `this` is less than or equal to `other` in MEOS total ordering. */
	le(other: STBox): boolean {
		return stbox_le(this._inner, other.inner);
	}

	/** `true` if `this` is strictly greater than `other` in MEOS total ordering. */
	gt(other: STBox): boolean {
		return stbox_gt(this._inner, other.inner);
	}

	/** `true` if `this` is greater than or equal to `other` in MEOS total ordering. */
	ge(other: STBox): boolean {
		return stbox_ge(this._inner, other.inner);
	}

	/**
	 * Returns the MEOS total ordering comparison result.
	 * @returns `-1` if `this < other`, `0` if equal, `1` if `this > other`.
	 */
	cmp(other: STBox): number {
		return stbox_cmp(this._inner, other.inner);
	}
}
