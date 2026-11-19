import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import { initMeos } from '../../core/runtime/meos.js';
import { Raster } from '../../core/objects/objects.generated.js';

// A block of rows a signature's layout states (`sqlSignatures[].inputShape`), read
// by the object layer (codegen/ObjectGenerator.ts) as #dumpValues of
// test_out_parameters.ts reads the values MEOS answers: Raster.setValues takes its
// values and its flags each as a list of rows, and MEOS the elements row by row,
// their rows, columns and count, and the NULL values as nodata. Each answer is
// the one MobilityDB's 500_raster test states for the same call.

before(async () => {
	await initMeos();
});

const band = (w: number, h: number, init: number, nodata: number) =>
	Raster.makeEmpty(w, h, 0, h, 1, -1, 0, 0, 3857)!.addBand(1, '16BSI', init, nodata, true)!;

describe('generated object layer: a block of pixels set', () => {
	it('places the block at its column and row, a NULL value nodata', () => {
		using r = band(3, 2, 0, -1);
		using set = r.setValues(1, 2, 1, [[1, 2], [null, 4]], null, false)!;
		const [values, nodata] = set.dumpValues(1, true);
		assert.deepEqual(nodata, [false, false, false, false, true, false]);
		assert.deepEqual(values.filter((_v, i) => !nodata[i]), [0, 1, 2, 0, 4]);
	});

	it('reads the flags over the block of the values, a NULL flag setting its value', () => {
		using r = band(3, 3, 5, -1);
		using set = r.setValues(1, 1, 1, [[1, 2], [3, 4]], [[null, true], [false, null]], false)!;
		const [values] = set.dumpValues(1, false);
		assert.deepEqual(values, [1, 5, 5, 3, 4, 5, 5, 5, 5]);
	});

	it('refuses rows of different lengths and an empty block', () => {
		using r = band(2, 2, 0, -1);
		assert.throws(() => r.setValues(1, 1, 1, [[1, 2], [3]], null, false),
			/matching dimensions/);
		assert.throws(() => r.setValues(1, 1, 1, [], null, false), /not 0/);
	});
});
