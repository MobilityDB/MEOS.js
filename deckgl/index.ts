/**
 * Public surface for the optional `meos.js/deckgl` adapter.
 *
 * Framework-free: converts MEOS.js temporal points into DeckGL TripsLayer data.
 * `deck.gl` / `react` are not dependencies of this module.
 */

export type { MfjsonSource, Trip, ToTripsOptions, TripCollection } from './adapter';
export { tgeompointToTrips, tgeompointsToTrips, mfjsonDatetimeToMs } from './adapter';
