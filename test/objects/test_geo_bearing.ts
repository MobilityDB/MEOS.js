import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import { initMeos } from '../../core/runtime/meos.js';
import { Geometry, TFloat, TGeomPoint } from '../../core/objects/objects.generated.js';

// The bearing from a point, as SQL answers bearing(geometry, geometry) and
// bearing(geometry, tgeompoint): one member of Geo, which the object layer
// (codegen/ObjectGenerator.ts) dispatches on the type of its argument.

before(async () => {
	await initMeos();
});

describe('generated object layer: the bearing from a point', () => {
	it('answers the bearing from a point to another point as a number', () => {
		using origin = Geometry.in('Point(0 0)', -1);
		using north = Geometry.in('Point(0 1)', -1);
		using east = Geometry.in('Point(1 0)', -1);
		assert.equal(origin.bearing(north), 0);
		assert.equal(origin.bearing(east), Math.PI / 2);
	});

	it('answers the bearing from a point to a temporal point as a temporal float', () => {
		using origin = Geometry.in('Point(0 0)', -1);
		using t = TGeomPoint.in('{Point(0 1)@2001-01-01 00:00:00+00, Point(1 0)@2001-01-02 00:00:00+00}');
		const answer = origin.bearing(t);
		assert.ok(answer instanceof TFloat);
		using bearing = answer as TFloat;
		// MEOS writes a float with 15 decimal digits: pi / 2 is 1.570796326794897.
		assert.equal(bearing.toString(),
			'{0@2001-01-01 00:00:00+00, 1.570796326794897@2001-01-02 00:00:00+00}');
	});
});
