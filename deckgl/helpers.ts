/**
 * MEOS.js → DeckGL helpers: run MobilityDB temporal logic in the browser,
 * then hand the result to the adapter.
 *
 * Unlike {@link './adapter'}, these are MEOS-specific (they import core types
 * to call restriction/derivation operators) — but still free of `deck.gl` and
 * `react`. They own the WASM lifecycle of every intermediate value they create.
 */

import { TGeomPoint } from '../core/types/basic/tgeompoint/TGeomPoint';
import { TFloat } from '../core/types/basic/tfloat/TFloat';
import { TsTzSpan } from '../core/types/collections/time/TsTzSpan';
import type { Trip, ToTripsOptions } from './adapter';
import { tgeompointToTrips } from './adapter';
import {
	extractSegments,
	minTimestampMs,
	divisorFor,
	relativeTimestamps,
} from './mfjson';

/**
 * Restrict a trajectory to a geometry (a zone) and return the renderable trips.
 *
 * Empty intersection yields `[]`. The intermediate restricted value is freed.
 * The zone WKT is interpreted in the trajectory's own SRID (see
 * {@link TGeomPoint.atGeom}), so plain lon/lat WKT works against 4326 data.
 */
export function atGeometry(
	t: TGeomPoint,
	wkt: string,
	opts: ToTripsOptions = {}
): Trip[] {
	const restricted = t.atGeom(wkt);
	if (restricted === null) return [];
	try {
		return tgeompointToTrips(restricted, opts);
	} finally {
		restricted.free();
	}
}

/**
 * Restrict a trajectory to a time span and return the renderable trips.
 *
 * `period` may be a TsTzSpan or its textual form (e.g.
 * `'[2024-01-15 09:00+00, 2024-01-15 09:10+00]'`). A span passed as a string is
 * created and freed internally; a TsTzSpan instance is left to the caller.
 * Empty intersection yields `[]`.
 */
export function atTime(
	t: TGeomPoint,
	period: string | TsTzSpan,
	opts: ToTripsOptions = {}
): Trip[] {
	const ownsSpan = typeof period === 'string';
	const span = ownsSpan ? TsTzSpan.fromString(period) : period;
	try {
		const restricted = t.atTsTzSpan(span.inner);
		if (restricted.inner === 0) return []; // no temporal overlap
		try {
			return tgeompointToTrips(restricted, opts);
		} finally {
			restricted.free();
		}
	} finally {
		if (ownsSpan) span.free();
	}
}

/** A per-segment scalar series aligned in time with a trajectory's vertices. */
export interface SpeedSegment {
	// Instantaneous speed values (CRS units per second).
	values: number[];
	// Timestamps aligned with `values`, relative to the origin (see options).
	timestamps: number[];
}

/**
 * Compute instantaneous speed as a per-segment scalar series.
 *
 * Wraps the raw `TFloat` pointer returned by MEOS `tpoint_speed` and frees it.
 * Segments align one-to-one with those of {@link tgeompointToTrips} on the same
 * trajectory. An input with no movement (e.g. an instant) yields `[]`.
 */
export function speedSeries(t: TGeomPoint, opts: ToTripsOptions = {}): SpeedSegment[] {
	const ptr = t.speed();
	if (ptr === 0) return [];
	const speed = new TFloat(ptr);
	try {
		const segments = extractSegments(speed.asMFJSON(false, 3, opts.precision ?? 6, null));
		const origin = opts.timeOrigin ?? minTimestampMs(segments);
		const divisor = divisorFor(opts.timeUnit);
		return segments.map(seg => ({
			values: (seg.values ?? []).slice(),
			timestamps: relativeTimestamps(seg.datetimes, origin, divisor),
		}));
	} finally {
		speed.free();
	}
}

// A trip whose vertices carry an instantaneous speed, ready for color mapping.
export type SpeedTrip = Trip & { speeds: number[] };

/**
 * Convert a trajectory to trips enriched with a per-vertex speed channel.
 *
 * Trips and speeds are computed on the same shared clock and zipped by segment
 * and vertex; a structural mismatch throws rather than silently misaligning.
 */
export function tripsWithSpeed(t: TGeomPoint, opts: ToTripsOptions = {}): SpeedTrip[] {
	const trips = tgeompointToTrips(t, opts);
	const speeds = speedSeries(t, opts);
	if (trips.length !== speeds.length) {
		throw new Error(
			`speed/trip segment count mismatch: ${trips.length} vs ${speeds.length}`
		);
	}
	return trips.map((trip, i) => {
		const seg = speeds[i];
		if (seg.values.length !== trip.path.length) {
			throw new Error(
				`speed/vertex length mismatch in segment ${i}: ${seg.values.length} vs ${trip.path.length}`
			);
		}
		return { ...trip, speeds: seg.values };
	});
}
