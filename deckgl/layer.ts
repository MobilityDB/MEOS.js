/**
 * Ready-to-use DeckGL layer for MobilityDB trajectories.
 *
 * Thin factory over {@link './adapter'}: it produces a configured `TripsLayer`,
 * wiring `data`/`getPath`/`getTimestamps` from the adapter's `Trip` shape. It is
 * a *factory*, not a subclass — robust across deck.gl versions and decoupled
 * from the layer lifecycle. `@deck.gl/*` are peerDependencies.
 *
 * The layer renders identically on a standalone Deck or interleaved over a
 * MapLibre basemap, so it can sit on top of an existing MapLibre map.
 */

import { TripsLayer, type TripsLayerProps } from '@deck.gl/geo-layers';
import {
	tgeompointsToTrips,
	type Trip,
	type TripCollection,
	type ToTripsOptions,
	type MfjsonSource,
} from './adapter';

/** TripsLayer props except `data`, which the factory derives from the trips. */
export type MobilityTripsLayerProps = Partial<Omit<TripsLayerProps<Trip>, 'data'>>;

/**
 * Build a configured `TripsLayer` from already-converted trips (or a
 * `TripCollection`). Pure — no MEOS dependency.
 *
 * `getPath`/`getTimestamps` default to the `Trip` shape but can be overridden
 * via `props`; `data` is always taken from `source`.
 */
export function tripsLayer(
	source: Trip[] | TripCollection,
	props: MobilityTripsLayerProps = {}
): TripsLayer<Trip> {
	const data = Array.isArray(source) ? source : source.trips;
	const { id = 'mobility-trips', getPath, getTimestamps, ...rest } = props;
	return new TripsLayer<Trip>({
		id,
		getPath: getPath ?? ((d: Trip) => d.path),
		getTimestamps: getTimestamps ?? ((d: Trip) => d.timestamps),
		...rest,
		data,
	});
}

/**
 * Convenience: convert temporal points and build the layer in one call.
 *
 * If you need the shared `timeRange`/`timeOrigin` to drive the animation clock
 * (e.g. a time slider), call {@link tgeompointsToTrips} then {@link tripsLayer}
 * directly — this convenience discards that metadata.
 */
export function tripsLayerFromTGeompoints(
	tgeompoints: MfjsonSource[],
	props: MobilityTripsLayerProps = {},
	options: ToTripsOptions = {}
): TripsLayer<Trip> {
	return tripsLayer(tgeompointsToTrips(tgeompoints, options), props);
}
