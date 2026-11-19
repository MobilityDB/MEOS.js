import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import { initMeos } from '../../core/runtime/meos.js';
import { Raster } from '../../core/objects/objects.generated.js';

// An aggregate of the catalog's `aggregates`, read by the object layer
// (codegen/ObjectGenerator.ts) as a static method of the class of its values:
// the transition threaded over the values from a NULL state, then the final
// function. Each answer is the one MobilityDB's 500_raster test states for the
// same tiles.

before(async () => {
	await initMeos();
});

// The example of the manual: two 2x2 tiles of one 32BF band, the second one
// pixel east and one south of the first, holding 1 and 3.
const tiles = () => [
	Raster.makeEmpty(2, 2, 0, 2, 1, -1, 0, 0, 3857)!.addBand(1, '32BF', 1, -9999, true)!,
	Raster.makeEmpty(2, 2, 1, 1, 1, -1, 0, 0, 3857)!.addBand(1, '32BF', 3, -9999, true)!,
];

describe('generated object layer: an aggregate over the values of a class', () => {
	it('unions the tiles, the mean where they overlap', () => {
		const rs = tiles();
		using union = Raster.rasterUnion(rs, 1, 'MEAN')!;
		// {{1,1,NULL},{1,2,3},{NULL,3,3}}
		const [values, nodata] = union.dumpValues(1, true);
		assert.deepEqual(nodata, [false, false, true, false, false, false, true, false, false]);
		assert.deepEqual(values.filter((_v, i) => !nodata[i]), [1, 1, 1, 2, 3, 3, 3]);
		rs.forEach(r => r[Symbol.dispose]());
	});

	it('states the statistics of a band over the tiles', () => {
		const rs = tiles();
		using stats = Raster.summaryStatsAgg(rs, 1, true)!;
		assert.equal(stats.count(), 8n);
		assert.equal(stats.sum(), 16);
		assert.equal(stats.mean(), 2);
		assert.equal(stats.stddev(), 1);
		assert.equal(stats.min(), 1);
		assert.equal(stats.max(), 3);
		rs.forEach(r => r[Symbol.dispose]());
	});

	it('answers NULL over no values', () => {
		assert.equal(Raster.rasterUnion([], 1, 'MEAN'), null);
		assert.equal(Raster.summaryStatsAgg([], 1, true), null);
	});
});
