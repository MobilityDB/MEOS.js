/**
 * Public surface for the optional `meos.js/deckgl` adapter.
 *
 * Framework-free: converts MEOS.js temporal points into DeckGL TripsLayer data
 * and runs MobilityDB temporal logic (zone/time restriction, speed) in the
 * browser. `deck.gl` / `react` are not dependencies of this module.
 */

// Adapter (pure data-shape transform).
export type { MfjsonSource, Trip, ToTripsOptions, TripCollection } from './adapter';
export { tgeompointToTrips, tgeompointsToTrips, mfjsonDatetimeToMs } from './adapter';

// Helpers (MEOS temporal logic -> trips).
export type { SpeedSegment, SpeedTrip } from './helpers';
export { atGeometry, atTime, speedSeries, tripsWithSpeed } from './helpers';
