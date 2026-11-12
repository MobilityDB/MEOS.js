import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import { initMeos } from '../../core/runtime/meos.js';
import { Geo, Jsonb, Raster, SpanSet, STBox, TFloat, TGeomPoint, TInt } from '../../core/objects/objects.generated.js';

// The values MEOS writes through a method's out-parameters, read by the object
// layer (codegen/ObjectGenerator.ts) as MEOS.NET's tools/objectgen.py reads them:
// the arrays MEOS fills beside the one it answers, a scalar beside an answer of
// its own, and a MEOS value whose address MEOS writes.

before(async () => {
	await initMeos();
});

// MobilityDB's meos/test/raster_test.c raster_values: a 3x3 raster in SRID 4326
// whose band 1 holds eight distinct values and one nodata pixel.
const RASTER_VALUES =
	'0100000100000000000000f03f000000000000f0bf0000000000000000000000000000'
	+ '084000000000000000000000000000000000e6100000030003004a003c1cc600002041'
	+ '003c1cc60000f04100002042000048420000704200008c420000a0420000b442';

describe('generated object layer: arrays MEOS fills beside the one it answers', () => {
	it('unnests a temporal integer into each value and the time it takes it', () => {
		using t = TInt.fromText('[1@2000-01-01, 2@2000-01-02, 1@2000-01-03]');
		const [times, values] = t.unnest();
		// One time per value, read with the count MEOS writes for both arrays.
		assert.equal(times.length, values.length);
		assert.deepEqual([...values].sort(), [1, 2]);
		for (const s of times) assert.ok(s instanceof SpanSet);
		times.forEach(s => s.free());
	});

	it('splits a temporal float into bins, each with the value it starts at', () => {
		using t = TFloat.fromText('[1@2000-01-01, 5@2000-01-05]');
		const [pieces, starts] = t.valueSplit(2);
		assert.equal(pieces.length, starts.length);
		// Bins of size 2 from the origin 0 cover 1 to 5: [0, 2), [2, 4) and [4, 6).
		assert.deepEqual(starts, [0, 2, 4]);
		pieces.forEach(p => p.free());
	});

	it('answers the keys of a JSON object with the value of each', () => {
		using jb = Jsonb.fromText('{"a": 1, "b": [2, 3]}', false);
		const [keys, values] = jb.each();
		assert.equal(keys.length, 2);
		assert.equal(values.length, 2);
		assert.deepEqual(values.map(v => v.toString()), ['1', '[2, 3]']);
		values.forEach(v => v.free());
	});

	it('dumps the values of a band with whether each is nodata', () => {
		using raster = Raster.fromHexWKB(RASTER_VALUES)!;
		// raster_dump_values answers every pixel and flags the nodata ones, as
		// MobilityDB's meos/test/raster_test.c asserts of its own raster.
		const [values, nodata] = raster.dumpValues(1, true);
		assert.equal(values.length, 9);
		assert.equal(nodata.length, 9);
		assert.equal(nodata.filter(n => n).length, 1);
		assert.equal(values.filter((_v, i) => !nodata[i]).reduce((s, v) => s + v, 0),
			10 + 30 + 40 + 50 + 60 + 70 + 80 + 90);
	});
});

describe('generated object layer: a value MEOS answers beside the arrays it fills', () => {
	it('answers the tile geometry of a temporal point with the time of each vertex', () => {
		// MobilityDB's 076_tpoint_analytics regression: three vertices in the tile
		// of the box (0,0),(1000,1000), snapped to integers as ST_AsMVTGeom snaps
		// them, times in seconds from the Unix epoch.
		using t = TGeomPoint.fromText('[Point(0 0)@2001-01-01 00:00:00+00, '
			+ 'Point(100 100)@2001-01-02 00:00:00+00, Point(200 50)@2001-01-03 00:00:00+00]');
		using bounds = STBox.fromText('STBOX X((0,0),(1000,1000))');
		const answer = t.asMVTGeom(bounds);
		assert.ok(answer);
		const [geom, times] = answer;
		assert.ok(geom instanceof Geo);
		assert.equal(geom.asText(6), 'LINESTRING(0 4096,410 3686,819 3891)');
		assert.deepEqual(times, [978307200, 978393600, 978480000]);
		geom.free();
	});

	it('answers null for a temporal point with no representation in the tile', () => {
		using t = TGeomPoint.fromText('Point(5000 5000)@2001-01-01 00:00:00+00');
		using bounds = STBox.fromText('STBOX X((0,0),(1000,1000))');
		assert.equal(t.asMVTGeom(bounds), null);
	});
});
