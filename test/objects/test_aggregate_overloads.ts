import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import { initMeos } from '../../core/runtime/meos.js';
import { TFloat, TInt } from '../../core/objects/objects.generated.js';

// An aggregate several transitions serve under one name, one per type of its
// values (tsum is tint_tsum_transfn over tint and tfloat_tsum_transfn over
// tfloat), is a static method of each value's class: the catalog names that
// class by the SQL type of the aggregate's values, the prefix of its leaf of the
// lattice. Each answer is the one MobilityDB's 040_temporal_aggfuncs test states
// for the same values, as test_aggregates.ts states the raster aggregates'.

before(async () => {
	await initMeos();
});

describe('generated object layer: an aggregate a transition per type serves', () => {
	it('sums two temporal floats where they overlap', () => {
		const values = [
			TFloat.fromText('[1@2001-01-01, 2@2001-01-03, 1@2001-01-05, 2@2001-01-07]'),
			TFloat.fromText('[3@2001-01-02, 4@2001-01-06]'),
		];
		using sum = TFloat.tSum(values)!;
		using expected = TFloat.fromText('{[1@2001-01-01, 1.5@2001-01-02), '
			+ '[4.5@2001-01-02, 5.25@2001-01-03, 4.75@2001-01-05, 5.5@2001-01-06], '
			+ '(1.5@2001-01-06, 2@2001-01-07]}');
		assert.equal(sum.asText(), expected.asText());
		values.forEach(v => v[Symbol.dispose]());
	});

	it('takes the minimum of one temporal integer as that value', () => {
		const values = [TInt.fromText('1@2001-01-01')];
		using min = TInt.tMinAgg(values)!;
		using expected = TInt.fromText('{1@2001-01-01}');
		assert.equal(min.asText(), expected.asText());
		values.forEach(v => v[Symbol.dispose]());
	});

	it('answers NULL over no values', () => {
		assert.equal(TInt.tMinAgg([]), null);
		assert.equal(TFloat.tSum([]), null);
	});
});
