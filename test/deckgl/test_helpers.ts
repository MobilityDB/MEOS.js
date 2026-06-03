import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import { initMeos } from '../../core/runtime/meos';
import { TGeomPoint } from '../../core/types/basic/tgeompoint/TGeomPoint';
import { TsTzSpan } from '../../core/types/collections/time/TsTzSpan';
import { atGeometry, atTime, speedSeries, tripsWithSpeed } from '../../deckgl/helpers';

const T0 = '2024-01-15 09:00:00+00';
const T1 = '2024-01-15 09:05:00+00';
const T2 = '2024-01-15 09:10:00+00';

// A trajectory whose first two points sit inside a small Brussels box and the
// third clearly outside it.
const TRAJ = `SRID=4326;[POINT(4.35 50.85)@${T0}, POINT(4.36 50.86)@${T1}, POINT(4.50 50.95)@${T2}]`;
const ZONE = 'POLYGON((4.34 50.84, 4.37 50.84, 4.37 50.87, 4.34 50.87, 4.34 50.84))';

before(async () => {
	await initMeos();
});

describe('atGeometry (zone restriction on 4326)', () => {
	it('clips a trajectory to a plain-WKT zone using the trajectory SRID', () => {
		using t = TGeomPoint.fromString(TRAJ);
		const trips = atGeometry(t, ZONE);
		assert.equal(trips.length, 1);
		// Keeps the inside portion; the third (outside) point is dropped.
		assert.ok(trips[0].path.length >= 2);
		assert.deepEqual(trips[0].path[0], [4.35, 50.85]);
		assert.ok(trips[0].path.every(([lng, lat]) => lng <= 4.37 && lat <= 50.87));
	});

	it('returns [] when the zone does not intersect', () => {
		using t = TGeomPoint.fromString(TRAJ);
		const trips = atGeometry(t, 'POLYGON((0 0, 1 0, 1 1, 0 1, 0 0))');
		assert.deepEqual(trips, []);
	});
});

describe('atTime (temporal restriction)', () => {
	it('restricts to a period given as a string', () => {
		using t = TGeomPoint.fromString(TRAJ);
		const trips = atTime(t, `[${T0}, ${T1}]`);
		assert.equal(trips.length, 1);
		assert.equal(trips[0].timestamps[0], 0);
		assert.equal(trips[0].timestamps.at(-1), 300); // up to 09:05
	});

	it('accepts a TsTzSpan instance and leaves it to the caller', () => {
		using t = TGeomPoint.fromString(TRAJ);
		using span = TsTzSpan.fromString(`[${T0}, ${T1}]`);
		const trips = atTime(t, span);
		assert.equal(trips.length, 1);
		// span still usable afterwards (not freed by the helper)
		assert.ok(span.inner !== 0);
	});

	it('returns [] when the period does not overlap', () => {
		using t = TGeomPoint.fromString(TRAJ);
		const trips = atTime(t, '[2030-01-01 00:00:00+00, 2030-01-02 00:00:00+00]');
		assert.deepEqual(trips, []);
	});
});

describe('speedSeries', () => {
	it('returns one value per vertex, aligned with the trajectory', () => {
		using t = TGeomPoint.fromString(TRAJ);
		const series = speedSeries(t);
		assert.equal(series.length, 1);
		assert.equal(series[0].values.length, 3);
		assert.equal(series[0].timestamps.length, 3);
		assert.equal(series[0].timestamps[0], 0);
		assert.ok(series[0].values.every(v => v >= 0));
	});
});

describe('tripsWithSpeed', () => {
	it('zips a per-vertex speed channel onto each trip', () => {
		using t = TGeomPoint.fromString(TRAJ);
		const trips = tripsWithSpeed(t);
		assert.equal(trips.length, 1);
		assert.equal(trips[0].speeds.length, trips[0].path.length);
		assert.equal(trips[0].speeds.length, 3);
	});
});
