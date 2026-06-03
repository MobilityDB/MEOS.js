import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import { initMeos } from '../../core/runtime/meos.js';
import { TGeomPoint } from '../../core/types/basic/tgeompoint/TGeomPoint.js';
import {
	tgeompointToTrips,
	tgeompointsToTrips,
	mfjsonDatetimeToMs,
} from '../../deckgl/adapter.js';

const T0 = '2024-01-15 09:00:00+00';
const T1 = '2024-01-15 09:05:00+00';
const T2 = '2024-01-15 09:10:00+00';

const INST = `SRID=4326;POINT(4.35 50.85)@${T0}`;
const SEQ = `SRID=4326;[POINT(4.35 50.85)@${T0}, POINT(4.36 50.86)@${T1}, POINT(4.37 50.85)@${T2}]`;
// Sequence set: two sub-sequences separated by a temporal gap.
const SEQSET =
	`SRID=4326;{[POINT(4.35 50.85)@${T0}, POINT(4.36 50.86)@${T1}],` +
	`[POINT(4.40 50.88)@2024-01-15 09:20:00+00, POINT(4.41 50.89)@2024-01-15 09:25:00+00]}`;

before(async () => {
	await initMeos();
});

describe('mfjsonDatetimeToMs', () => {
	it('parses the "+00" offset MEOS emits (Date.parse alone returns NaN)', () => {
		const ms = mfjsonDatetimeToMs('2024-01-15T09:00:00+00');
		assert.equal(ms, Date.parse('2024-01-15T09:00:00Z'));
	});

	it('parses "Z" and fractional/offset variants', () => {
		assert.equal(
			mfjsonDatetimeToMs('2024-01-15T09:00:00Z'),
			Date.parse('2024-01-15T09:00:00Z')
		);
		assert.equal(
			mfjsonDatetimeToMs('2024-01-15T09:00:00+00:00'),
			Date.parse('2024-01-15T09:00:00Z')
		);
	});

	it('throws on unparseable input rather than returning NaN', () => {
		assert.throws(() => mfjsonDatetimeToMs('not-a-date'));
	});
});

describe('tgeompointToTrips - sequence', () => {
	it('produces one trip with aligned path/timestamps', () => {
		using t = TGeomPoint.fromString(SEQ);
		const trips = tgeompointToTrips(t);
		assert.equal(trips.length, 1);
		assert.equal(trips[0].path.length, 3);
		assert.equal(trips[0].timestamps.length, 3);
		assert.deepEqual(trips[0].path[0], [4.35, 50.85]);
	});

	it('starts timestamps at 0 (origin = first instant) in seconds', () => {
		using t = TGeomPoint.fromString(SEQ);
		const [trip] = tgeompointToTrips(t);
		assert.equal(trip.timestamps[0], 0);
		assert.equal(trip.timestamps[1], 300); // +5 min
		assert.equal(trip.timestamps[2], 600); // +10 min
	});

	it('honours timeUnit: milliseconds', () => {
		using t = TGeomPoint.fromString(SEQ);
		const [trip] = tgeompointToTrips(t, { timeUnit: 'milliseconds' });
		assert.equal(trip.timestamps[1], 300_000);
	});
});

describe('tgeompointToTrips - sequence set (the gap case)', () => {
	it('splits a gapped trajectory into one trip per sub-sequence', () => {
		using t = TGeomPoint.fromString(SEQSET);
		const trips = tgeompointToTrips(t);
		assert.equal(trips.length, 2);
		assert.equal(trips[0].path.length, 2);
		assert.equal(trips[1].path.length, 2);
		// Both segments share the same origin (the global first instant).
		assert.equal(trips[0].timestamps[0], 0);
		assert.equal(trips[1].timestamps[0], 20 * 60); // 09:20 - 09:00 = 1200s
	});
});

describe('tgeompointToTrips - instant', () => {
	it('produces a single one-point trip', () => {
		using t = TGeomPoint.fromString(INST);
		const trips = tgeompointToTrips(t);
		assert.equal(trips.length, 1);
		assert.equal(trips[0].path.length, 1);
		assert.deepEqual(trips[0].path[0], [4.35, 50.85]);
		assert.equal(trips[0].timestamps[0], 0);
	});
});

describe('tgeompointsToTrips - shared clock', () => {
	it('aligns multiple trips on one origin and reports the range', () => {
		using a = TGeomPoint.fromString(SEQ); // 09:00 → 09:10
		using b = TGeomPoint.fromString(
			`SRID=4326;[POINT(4.30 50.80)@2024-01-15 09:03:00+00, POINT(4.31 50.81)@2024-01-15 09:30:00+00]`
		);
		const { trips, timeOrigin, timeRange } = tgeompointsToTrips([a, b]);
		assert.equal(trips.length, 2);
		assert.equal(timeOrigin, mfjsonDatetimeToMs('2024-01-15T09:00:00+00'));
		// b starts 3 min after the shared origin, not at 0.
		assert.equal(trips[1].timestamps[0], 180);
		// Range spans to the latest instant (09:30 = 1800s).
		assert.deepEqual(timeRange, [0, 1800]);
	});
});
