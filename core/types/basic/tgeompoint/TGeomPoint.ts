import { Temporal } from '../../temporal/Temporal.js';
import type { Ptr, TimestampTz } from '../../../functions/functions.generated.js';
import {
	tgeompoint_in,
	tgeompoint_from_mfjson,
	temporal_round,
	tspatial_as_text,
	tspatial_as_ewkt,
	tspatial_to_stbox,
	tspatial_srid,
	tspatial_set_srid,
	tspatial_transform,
	tspatial_transform_pipeline,
	geo_from_text,
	geo_as_text,
	meos_free,
	tgeo_start_value,
	tgeo_end_value,
	tgeo_value_n,
	tgeo_at_geom,
	tgeo_minus_geom,
	tpoint_at_geom,
	tpoint_minus_geom,
	tpoint_trajectory,
	tpoint_length,
	tpoint_speed,
	tpoint_azimuth,
	tpoint_direction,
	tpoint_cumulative_length,
	tpoint_angular_difference,
	tpoint_get_x,
	tpoint_get_y,
	tpoint_get_z,
	tpoint_is_simple,
	stbox_hasz,
	tpointinst_make,
	tpoint_from_base_temp,
	tpointseq_from_base_tstzset,
	tpointseq_from_base_tstzspan,
	tpointseqset_from_base_tstzspanset,
	tgeompoint_to_tgeometry,
	tgeometry_to_tgeompoint,
	ever_eq_tgeo_geo,
	ever_ne_tgeo_geo,
	ever_eq_tgeo_tgeo,
	ever_ne_tgeo_tgeo,
	always_eq_tgeo_geo,
	always_ne_tgeo_geo,
	always_eq_tgeo_tgeo,
	always_ne_tgeo_tgeo,
	teq_tgeo_geo,
	tne_tgeo_geo,
	edisjoint_tgeo_geo,
	edisjoint_tgeo_tgeo,
	eintersects_tgeo_geo,
	eintersects_tgeo_tgeo,
	edwithin_tgeo_geo,
	edwithin_tgeo_tgeo,
	tdisjoint_tgeo_geo,
	tdisjoint_tgeo_tgeo,
	tintersects_tgeo_geo,
	tintersects_tgeo_tgeo,
	tcontains_geo_tgeo,
	tcontains_tgeo_geo,
	tcontains_tgeo_tgeo,
	tdwithin_tgeo_geo,
	tdwithin_tgeo_tgeo,
	tdistance_tgeo_geo,
	tdistance_tgeo_tgeo,
	nad_tgeo_geo,
	nad_tgeo_stbox,
	nad_tgeo_tgeo,
	nai_tgeo_geo,
	nai_tgeo_tgeo,
	temporal_at_timestamptz,
	bearing_tpoint_point,
	bearing_tpoint_tpoint,
} from '../../../functions/functions.generated.js';
import type { TFloat } from '../tfloat/TFloat.js';
import type { TBool } from '../tbool/TBool.js';

/**
 * Temporal geometry point type.
 *
 * Wraps a MEOS TGeomPoint pointer. Geometry values are exchanged as WKT strings
 * at the JS boundary; GSERIALIZED pointers never leak out of this class.
 *
 * Supports all three subtypes (Instant, Sequence, SequenceSet). Linear
 * interpolation is the default for sequences.
 *
 * @example
 * ```ts
 * await initMeos();
 * const t = TGeomPoint.fromString('[POINT(1 1)@2001-01-01, POINT(2 2)@2001-01-02]');
 * console.log(t.startValue()); // POINT(1 1)
 * console.log(t.length());     // ~157249.59...
 * t.free();
 * ```
 */
export class TGeomPoint extends Temporal<string> {
	constructor(inner: Ptr) {
		super(inner);
	}

	// -------------------------------------------------------------------------
	// CONSTRUCTORS
	// -------------------------------------------------------------------------

	/**
	 * Parse a TGeomPoint from a WKT/EWKT string.
	 * MEOS: tgeompoint_in
	 */
	static fromString(wkt: string): TGeomPoint {
		return new TGeomPoint(tgeompoint_in(wkt));
	}

	/**
	 * Parse a TGeomPoint from a MF-JSON string.
	 * MEOS: tgeompoint_from_mfjson
	 */
	static fromMFJSON(mfjson: string): TGeomPoint {
		return new TGeomPoint(tgeompoint_from_mfjson(mfjson));
	}

	/**
	 * Create a TGeomPointInst from a WKT point string and a timestamp.
	 *
	 * @param wkt       WKT geometry string (e.g. `"POINT(1 2)"`).
	 * @param timestamp Microseconds since 2000-01-01 UTC.
	 * MEOS: tpointinst_make
	 */
	static fromInstant(wkt: string, timestamp: TimestampTz): TGeomPoint {
		const gs = geo_from_text(wkt, 0);
		const inst = tpointinst_make(gs, timestamp);
		meos_free(gs);
		return new TGeomPoint(inst);
	}

	/**
	 * Create a TGeomPoint with constant geometry `wkt` spanning the same domain as `domain`.
	 * MEOS: tpoint_from_base_temp
	 */
	static fromBaseTemporal(wkt: string, domain: TGeomPoint): TGeomPoint {
		const gs = geo_from_text(wkt, 0);
		const r = tpoint_from_base_temp(gs, domain.inner);
		meos_free(gs);
		return new TGeomPoint(r);
	}

	/**
	 * Create a TGeomPoint with constant geometry `wkt` over a time object.
	 * MEOS: tpointseq_from_base_tstzset / tstzspan / tpointseqset_from_base_tstzspanset
	 */
	static fromBaseTime(
		wkt: string,
		time: Ptr,
		type: 'tstzset' | 'tstzspan' | 'tstzspanset',
		interp = 3
	): TGeomPoint {
		const gs = geo_from_text(wkt, 0);
		let r: Ptr;
		switch (type) {
			case 'tstzset':
				r = tpointseq_from_base_tstzset(gs, time);
				break;
			case 'tstzspan':
				r = tpointseq_from_base_tstzspan(gs, time, interp);
				break;
			case 'tstzspanset':
				r = tpointseqset_from_base_tstzspanset(gs, time, interp);
				break;
		}
		meos_free(gs);
		return new TGeomPoint(r!);
	}

	// -------------------------------------------------------------------------
	// ABSTRACT IMPLEMENTATION
	// -------------------------------------------------------------------------

	protected _fromInner(inner: Ptr): this {
		return new TGeomPoint(inner) as this;
	}

	/**
	 * WKT string representation.
	 * @param maxdd Maximum decimal digits for coordinates (default 15).
	 */
	toString(maxdd = 15): string {
		return tspatial_as_text(this._inner, maxdd);
	}

	/**
	 * Returns the starting geometry as a WKT string.
	 * MEOS: tgeo_start_value + geo_as_text
	 */
	startValue(): string {
		const gs = tgeo_start_value(this._inner);
		const wkt = geo_as_text(gs, 15);
		meos_free(gs);
		return wkt;
	}

	/**
	 * Returns the ending geometry as a WKT string.
	 * MEOS: tgeo_end_value + geo_as_text
	 */
	endValue(): string {
		const gs = tgeo_end_value(this._inner);
		const wkt = geo_as_text(gs, 15);
		meos_free(gs);
		return wkt;
	}

	// -------------------------------------------------------------------------
	// OUTPUT
	// -------------------------------------------------------------------------

	/**
	 * WKT string with coordinate precision.
	 * MEOS: tspatial_as_text
	 */
	asText(maxdd = 15): string {
		return tspatial_as_text(this._inner, maxdd);
	}

	/**
	 * EWKT string (includes SRID prefix).
	 * MEOS: tspatial_as_ewkt
	 */
	asEWKT(maxdd = 15): string {
		return tspatial_as_ewkt(this._inner, maxdd);
	}

	// -------------------------------------------------------------------------
	// ACCESSORS
	// -------------------------------------------------------------------------

	/**
	 * Returns the n-th distinct geometry value (0-based) as a WKT string.
	 * MEOS: tgeo_value_n + geo_as_text
	 */
	valueN(n: number): string | null {
		const gs = tgeo_value_n(this._inner, n + 1);
		if (gs === 0) return null;
		const wkt = geo_as_text(gs, 15);
		meos_free(gs);
		return wkt;
	}

	/**
	 * Evaluates the temporal geometry at a specific timestamp.
	 * Returns the WKT string or `null` if outside the domain.
	 * MEOS: temporal_at_timestamptz + tgeo_start_value + geo_as_text
	 */
	valueAtTimestamp(t: TimestampTz): string | null {
		const restricted = temporal_at_timestamptz(this._inner, t);
		if (restricted === 0) return null;
		const gs = tgeo_start_value(restricted);
		const wkt = geo_as_text(gs, 15);
		meos_free(gs);
		meos_free(restricted);
		return wkt;
	}

	/**
	 * Returns the SRID of the spatial reference system.
	 * MEOS: tspatial_srid
	 */
	srid(): number {
		return tspatial_srid(this._inner);
	}

	/**
	 * Returns a new TGeomPoint with the SRID set to `srid`.
	 * MEOS: tspatial_set_srid
	 */
	setSrid(srid: number): TGeomPoint {
		return new TGeomPoint(tspatial_set_srid(this._inner, srid));
	}

	/**
	 * Returns the bounding STBox as a raw Ptr.
	 * MEOS: tspatial_to_stbox
	 */
	toSTBox(): Ptr {
		return tspatial_to_stbox(this._inner);
	}

	// -------------------------------------------------------------------------
	// SPATIAL TRANSFORMATIONS
	// -------------------------------------------------------------------------

	/**
	 * Reprojects to the given SRID.
	 * MEOS: tspatial_transform
	 */
	transform(srid: number): TGeomPoint {
		return new TGeomPoint(tspatial_transform(this._inner, srid));
	}

	/**
	 * Reprojects using a PROJ pipeline string.
	 * MEOS: tspatial_transform_pipeline
	 */
	transformPipeline(pipelinestr: string, srid: number, isForward = true): TGeomPoint {
		return new TGeomPoint(
			tspatial_transform_pipeline(this._inner, pipelinestr, srid, isForward)
		);
	}

	/**
	 * Converts to a tgeometry (removes point constraint, keeps geometry).
	 * MEOS: tgeompoint_to_tgeometry
	 */
	toTGeometry(): TGeomPoint {
		return new TGeomPoint(tgeompoint_to_tgeometry(this._inner));
	}

	/**
	 * Converts from tgeometry to TGeomPoint (requires point geometry).
	 * MEOS: tgeometry_to_tgeompoint
	 */
	static fromTGeometry(temp: Ptr): TGeomPoint {
		return new TGeomPoint(tgeometry_to_tgeompoint(temp));
	}

	// -------------------------------------------------------------------------
	// MOVEMENT ANALYSIS
	// -------------------------------------------------------------------------

	/**
	 * Returns the trajectory as a WKT geometry string.
	 * For a sequence this is typically a LineString; for an instant it is a Point.
	 * MEOS: tpoint_trajectory + geo_as_text
	 */
	trajectory(unaryUnion = false): string {
		const gs = tpoint_trajectory(this._inner, unaryUnion);
		const wkt = geo_as_text(gs, 15);
		meos_free(gs);
		return wkt;
	}

	/**
	 * Returns the total length of the trajectory in the units of the CRS.
	 * MEOS: tpoint_length
	 */
	length(): number {
		return tpoint_length(this._inner);
	}

	/**
	 * Returns the instantaneous speed as a TFloat (Ptr).
	 * MEOS: tpoint_speed
	 */
	speed(): Ptr {
		return tpoint_speed(this._inner);
	}

	/**
	 * Returns the direction (azimuth from start to end) in radians.
	 * MEOS: tpoint_direction
	 */
	direction(): number {
		return tpoint_direction(this._inner);
	}

	/**
	 * Returns the azimuth at each instant as a TFloat (Ptr).
	 * MEOS: tpoint_azimuth
	 */
	azimuth(): Ptr {
		return tpoint_azimuth(this._inner);
	}

	/**
	 * Returns the bearing from each instant toward a fixed point as a TFloat (Ptr).
	 * @param wkt   WKT string of the reference point.
	 * @param invert If true, returns the bearing from the point toward the trajectory.
	 * MEOS: bearing_tpoint_point
	 */
	bearingToPoint(wkt: string, invert = false): Ptr {
		const gs = geo_from_text(wkt, 0);
		const r = bearing_tpoint_point(this._inner, gs, invert);
		meos_free(gs);
		return r;
	}

	/**
	 * Returns the bearing between this and another TGeomPoint as a TFloat (Ptr).
	 * MEOS: bearing_tpoint_tpoint
	 */
	bearingToTemporal(other: TGeomPoint): Ptr {
		return bearing_tpoint_tpoint(this._inner, other.inner);
	}

	/**
	 * Returns the cumulative length at each instant as a TFloat (Ptr).
	 * MEOS: tpoint_cumulative_length
	 */
	cumulativeLength(): Ptr {
		return tpoint_cumulative_length(this._inner);
	}

	/**
	 * Returns the angular difference at each instant as a TFloat (Ptr).
	 * MEOS: tpoint_angular_difference
	 */
	angularDifference(): Ptr {
		return tpoint_angular_difference(this._inner);
	}

	/**
	 * Returns the X coordinate sequence as a TFloat (Ptr).
	 * MEOS: tpoint_get_x
	 */
	getX(): Ptr {
		return tpoint_get_x(this._inner);
	}

	/**
	 * Returns the Y coordinate sequence as a TFloat (Ptr).
	 * MEOS: tpoint_get_y
	 */
	getY(): Ptr {
		return tpoint_get_y(this._inner);
	}

	/**
	 * Returns the Z coordinate sequence as a TFloat (Ptr), or 0 if no Z.
	 * MEOS: tpoint_get_z
	 */
	getZ(): Ptr {
		return tpoint_get_z(this._inner);
	}

	/**
	 * Returns true if the trajectory never self-intersects.
	 * MEOS: tpoint_is_simple
	 */
	isSimple(): boolean {
		return tpoint_is_simple(this._inner);
	}

	/**
	 * Returns a new TGeomPoint with coordinates rounded to `maxdd` decimal digits.
	 * MEOS: temporal_round
	 */
	round(maxdd: number): TGeomPoint {
		return new TGeomPoint(temporal_round(this._inner, maxdd));
	}

	/**
	 * Returns true if the points have a Z coordinate.
	 * MEOS: tspatial_to_stbox + stbox_hasz
	 */
	hasZ(): boolean {
		const box = tspatial_to_stbox(this._inner);
		const result = stbox_hasz(box);
		meos_free(box);
		return result;
	}

	// -------------------------------------------------------------------------
	// RESTRICTIONS
	// -------------------------------------------------------------------------

	/**
	 * Restrict to instants inside geometry `wkt`.
	 *
	 * `srid` defaults to this temporal's own SRID so the geometry and the
	 * trajectory share a coordinate system (MEOS rejects mixed-SRID operands).
	 * MEOS: tpoint_at_geom
	 */
	atGeom(wkt: string, srid: number = this.srid()): TGeomPoint | null {
		const gs = geo_from_text(wkt, srid);
		const r = tpoint_at_geom(this._inner, gs);
		meos_free(gs);
		return r === 0 ? null : new TGeomPoint(r);
	}

	/**
	 * Restrict to instants outside geometry `wkt`.
	 *
	 * `srid` defaults to this temporal's own SRID (see {@link atGeom}).
	 * MEOS: tpoint_minus_geom
	 */
	minusGeom(wkt: string, srid: number = this.srid()): TGeomPoint | null {
		const gs = geo_from_text(wkt, srid);
		const r = tpoint_minus_geom(this._inner, gs);
		meos_free(gs);
		return r === 0 ? null : new TGeomPoint(r);
	}

	/**
	 * Restrict to instants where the geometry equals `wkt`.
	 *
	 * `srid` defaults to this temporal's own SRID (see {@link atGeom}).
	 * MEOS: tgeo_at_geom
	 */
	atGeo(wkt: string, srid: number = this.srid()): TGeomPoint | null {
		const gs = geo_from_text(wkt, srid);
		const r = tgeo_at_geom(this._inner, gs);
		meos_free(gs);
		return r === 0 ? null : new TGeomPoint(r);
	}

	/**
	 * Restrict to instants where the geometry differs from `wkt`.
	 *
	 * `srid` defaults to this temporal's own SRID (see {@link atGeom}).
	 * MEOS: tgeo_minus_geom
	 */
	minusGeo(wkt: string, srid: number = this.srid()): TGeomPoint | null {
		const gs = geo_from_text(wkt, srid);
		const r = tgeo_minus_geom(this._inner, gs);
		meos_free(gs);
		return r === 0 ? null : new TGeomPoint(r);
	}

	// -------------------------------------------------------------------------
	// EVER / ALWAYS COMPARISONS
	// -------------------------------------------------------------------------

	/** Returns true if the point ever equals geometry `wkt`. MEOS: ever_eq_tgeo_geo */
	everEq(wkt: string): boolean {
		const gs = geo_from_text(wkt, 0);
		const r = ever_eq_tgeo_geo(this._inner, gs) > 0;
		meos_free(gs);
		return r;
	}

	/** Returns true if the point is never equal to geometry `wkt`. MEOS: ever_ne_tgeo_geo */
	everNe(wkt: string): boolean {
		const gs = geo_from_text(wkt, 0);
		const r = ever_ne_tgeo_geo(this._inner, gs) > 0;
		meos_free(gs);
		return r;
	}

	/** Returns true if the point always equals geometry `wkt`. MEOS: always_eq_tgeo_geo */
	alwaysEq(wkt: string): boolean {
		const gs = geo_from_text(wkt, 0);
		const r = always_eq_tgeo_geo(this._inner, gs) > 0;
		meos_free(gs);
		return r;
	}

	/** Returns true if the point never equals geometry `wkt`. MEOS: always_ne_tgeo_geo */
	alwaysNe(wkt: string): boolean {
		const gs = geo_from_text(wkt, 0);
		const r = always_ne_tgeo_geo(this._inner, gs) > 0;
		meos_free(gs);
		return r;
	}

	/** Returns true if this ever equals other TGeomPoint. MEOS: ever_eq_tgeo_tgeo */
	everEqTemporal(other: TGeomPoint): boolean {
		return ever_eq_tgeo_tgeo(this._inner, other.inner) > 0;
	}

	/** Returns true if this ever differs from other TGeomPoint. MEOS: ever_ne_tgeo_tgeo */
	everNeTemporal(other: TGeomPoint): boolean {
		return ever_ne_tgeo_tgeo(this._inner, other.inner) > 0;
	}

	/** Returns true if this always equals other TGeomPoint. MEOS: always_eq_tgeo_tgeo */
	alwaysEqTemporal(other: TGeomPoint): boolean {
		return always_eq_tgeo_tgeo(this._inner, other.inner) > 0;
	}

	/** Returns true if this never differs from other TGeomPoint. MEOS: always_ne_tgeo_tgeo */
	alwaysNeTemporal(other: TGeomPoint): boolean {
		return always_ne_tgeo_tgeo(this._inner, other.inner) > 0;
	}

	// -------------------------------------------------------------------------
	// TEMPORAL COMPARISONS
	// -------------------------------------------------------------------------

	/** Returns a TBool (Ptr) that is true where this == wkt. MEOS: teq_tgeo_geo */
	temporalEq(wkt: string): Ptr {
		const gs = geo_from_text(wkt, 0);
		const r = teq_tgeo_geo(this._inner, gs);
		meos_free(gs);
		return r;
	}

	/** Returns a TBool (Ptr) that is true where this != wkt. MEOS: tne_tgeo_geo */
	temporalNe(wkt: string): Ptr {
		const gs = geo_from_text(wkt, 0);
		const r = tne_tgeo_geo(this._inner, gs);
		meos_free(gs);
		return r;
	}

	// -------------------------------------------------------------------------
	// EVER SPATIAL PREDICATES
	// -------------------------------------------------------------------------

	/** Returns true if this is ever disjoint from geometry `wkt`. MEOS: edisjoint_tgeo_geo */
	everDisjoint(wkt: string): boolean {
		const gs = geo_from_text(wkt, 0);
		const r = edisjoint_tgeo_geo(this._inner, gs) > 0;
		meos_free(gs);
		return r;
	}

	/** Returns true if this ever intersects geometry `wkt`. MEOS: eintersects_tgeo_geo */
	everIntersects(wkt: string): boolean {
		const gs = geo_from_text(wkt, 0);
		const r = eintersects_tgeo_geo(this._inner, gs) > 0;
		meos_free(gs);
		return r;
	}

	/** Returns true if this is ever within `dist` of geometry `wkt`. MEOS: edwithin_tgeo_geo */
	everDWithin(wkt: string, dist: number): boolean {
		const gs = geo_from_text(wkt, 0);
		const r = edwithin_tgeo_geo(this._inner, gs, dist) > 0;
		meos_free(gs);
		return r;
	}

	/** Returns true if this is ever disjoint from other TGeomPoint. MEOS: edisjoint_tgeo_tgeo */
	everDisjointTemporal(other: TGeomPoint): boolean {
		return edisjoint_tgeo_tgeo(this._inner, other.inner) > 0;
	}

	/** Returns true if this ever intersects other TGeomPoint. MEOS: eintersects_tgeo_tgeo */
	everIntersectsTemporal(other: TGeomPoint): boolean {
		return eintersects_tgeo_tgeo(this._inner, other.inner) > 0;
	}

	/** Returns true if this is ever within `dist` of other TGeomPoint. MEOS: edwithin_tgeo_tgeo */
	everDWithinTemporal(other: TGeomPoint, dist: number): boolean {
		return edwithin_tgeo_tgeo(this._inner, other.inner, dist) > 0;
	}

	// -------------------------------------------------------------------------
	// TEMPORAL SPATIAL PREDICATES
	// -------------------------------------------------------------------------

	/** Returns a TBool (Ptr) that is true at instants where this is disjoint from `wkt`. MEOS: tdisjoint_tgeo_geo */
	temporalDisjoint(wkt: string): Ptr {
		const gs = geo_from_text(wkt, 0);
		const r = tdisjoint_tgeo_geo(this._inner, gs);
		meos_free(gs);
		return r;
	}

	/** Returns a TBool (Ptr) that is true at instants where this intersects `wkt`. MEOS: tintersects_tgeo_geo */
	temporalIntersects(wkt: string): Ptr {
		const gs = geo_from_text(wkt, 0);
		const r = tintersects_tgeo_geo(this._inner, gs);
		meos_free(gs);
		return r;
	}

	/** Returns a TBool (Ptr) that is true at instants where `wkt` contains this. MEOS: tcontains_geo_tgeo */
	temporalContainedIn(wkt: string): Ptr {
		const gs = geo_from_text(wkt, 0);
		const r = tcontains_geo_tgeo(gs, this._inner);
		meos_free(gs);
		return r;
	}

	/** Returns a TBool (Ptr) that is true at instants where this contains `wkt`. MEOS: tcontains_tgeo_geo */
	temporalContains(wkt: string): Ptr {
		const gs = geo_from_text(wkt, 0);
		const r = tcontains_tgeo_geo(this._inner, gs);
		meos_free(gs);
		return r;
	}

	/** Returns a TBool (Ptr) that is true at instants where this is within `dist` of `wkt`. MEOS: tdwithin_tgeo_geo */
	temporalDWithin(wkt: string, dist: number): Ptr {
		const gs = geo_from_text(wkt, 0);
		const r = tdwithin_tgeo_geo(this._inner, gs, dist);
		meos_free(gs);
		return r;
	}

	/** Returns a TBool (Ptr) for temporal disjoint with other TGeomPoint. MEOS: tdisjoint_tgeo_tgeo */
	temporalDisjointTemporal(other: TGeomPoint): Ptr {
		return tdisjoint_tgeo_tgeo(this._inner, other.inner);
	}

	/** Returns a TBool (Ptr) for temporal intersection with other TGeomPoint. MEOS: tintersects_tgeo_tgeo */
	temporalIntersectsTemporal(other: TGeomPoint): Ptr {
		return tintersects_tgeo_tgeo(this._inner, other.inner);
	}

	/** Returns a TBool (Ptr) for temporal containment between two TGeomPoints. MEOS: tcontains_tgeo_tgeo */
	temporalContainsTemporal(other: TGeomPoint): Ptr {
		return tcontains_tgeo_tgeo(this._inner, other.inner);
	}

	/** Returns a TBool (Ptr) for temporal dwithin with other TGeomPoint. MEOS: tdwithin_tgeo_tgeo */
	temporalDWithinTemporal(other: TGeomPoint, dist: number): Ptr {
		return tdwithin_tgeo_tgeo(this._inner, other.inner, dist);
	}

	// -------------------------------------------------------------------------
	// DISTANCE
	// -------------------------------------------------------------------------

	/**
	 * Returns a TFloat (Ptr) of the distance from this to geometry `wkt` at each instant.
	 * MEOS: tdistance_tgeo_geo
	 */
	temporalDistance(wkt: string): Ptr {
		const gs = geo_from_text(wkt, 0);
		const r = tdistance_tgeo_geo(this._inner, gs);
		meos_free(gs);
		return r;
	}

	/**
	 * Returns a TFloat (Ptr) of the distance from this to other TGeomPoint at each instant.
	 * MEOS: tdistance_tgeo_tgeo
	 */
	temporalDistanceTemporal(other: TGeomPoint): Ptr {
		return tdistance_tgeo_tgeo(this._inner, other.inner);
	}

	/**
	 * Returns the nearest approach distance (NAD) to geometry `wkt`.
	 * MEOS: nad_tgeo_geo
	 */
	nad(wkt: string): number {
		const gs = geo_from_text(wkt, 0);
		const r = nad_tgeo_geo(this._inner, gs);
		meos_free(gs);
		return r;
	}

	/**
	 * Returns the nearest approach distance to an STBox (raw Ptr).
	 * MEOS: nad_tgeo_stbox
	 */
	nadSTBox(box: Ptr): number {
		return nad_tgeo_stbox(this._inner, box);
	}

	/**
	 * Returns the nearest approach distance to another TGeomPoint.
	 * MEOS: nad_tgeo_tgeo
	 */
	nadTemporal(other: TGeomPoint): number {
		return nad_tgeo_tgeo(this._inner, other.inner);
	}

	/**
	 * Returns the nearest approach instant to geometry `wkt` as a TGeomPoint (Ptr).
	 * MEOS: nai_tgeo_geo
	 */
	nai(wkt: string): Ptr {
		const gs = geo_from_text(wkt, 0);
		const r = nai_tgeo_geo(this._inner, gs);
		meos_free(gs);
		return r;
	}

	/**
	 * Returns the nearest approach instant to another TGeomPoint as a TGeomPoint (Ptr).
	 * MEOS: nai_tgeo_tgeo
	 */
	naiTemporal(other: TGeomPoint): Ptr {
		return nai_tgeo_tgeo(this._inner, other.inner);
	}
}
