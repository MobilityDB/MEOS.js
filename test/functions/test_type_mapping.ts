import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import { initMeos } from '../../core/runtime/meos.js';
import {
	h3index_in,
	h3index_out,
	h3index_eq,
	h3index_get_resolution,
	quadbin_in,
	quadbin_out,
	s2cell_in,
	s2cell_out,
	timestamptz_in,
	time_in,
	time_out,
	numeric_in,
	numeric_out,
	intset_in,
	set_hash,
	meos_free,
	meos_initialize_interrupt_handler,
} from '../../core/functions/functions.generated.js';

before(async () => {
	await initMeos();
});

// Every wrapper below crosses the ccall boundary with the type the catalog
// states for its slot: a cell id is a 64-bit unsigned bigint, a TimestampTz or
// a TimeADT is a 64-bit integer, a Numeric and a callback are pointers and a
// hash is an unsigned 32-bit integer.

describe('cell ids keep all 64 bits', () => {
	it('an H3Index above 2^53 round-trips exactly', () => {
		const cell = h3index_in('8a2a1072b59ffff');
		assert.equal(typeof cell, 'bigint');
		assert.equal(cell, 0x8a2a1072b59ffffn);
		assert.equal(h3index_out(cell), '8a2a1072b59ffff');
		assert.equal(h3index_eq(cell, 0x8a2a1072b59ffffn), true);
		assert.equal(h3index_eq(cell, 0x8a2a1072b59fffen), false);
		assert.equal(h3index_get_resolution(cell), 10);
	});

	it('a Quadbin above 2^53 round-trips exactly', () => {
		const cell = quadbin_in('480fffffffffffff');
		assert.equal(cell, 0x480fffffffffffffn);
		assert.equal(quadbin_out(cell), '480fffffffffffff');
	});

	it('an S2CellId above 2^53 round-trips exactly', () => {
		const cell = s2cell_in('47c3c3');
		assert.equal(cell, 0x47c3c30000000000n);
		assert.equal(s2cell_out(cell), '47c3c3');
	});
});

describe('64-bit times cross as BigInt', () => {
	it('a TimestampTz result is the number of microseconds', () => {
		assert.equal(timestamptz_in('2000-01-01 00:00:01+00', -1), 1000000);
	});

	it('a TimeADT result and argument round-trip', () => {
		const t = time_in('12:34:56', -1);
		assert.equal(t, (12 * 3600 + 34 * 60 + 56) * 1000000);
		assert.equal(time_out(t), '12:34:56');
	});
});

describe('a Numeric is a pointer', () => {
	it('numeric_in and numeric_out round-trip through a Ptr', () => {
		const n = numeric_in('12345.678', -1);
		assert.equal(numeric_out(n), '12345.678');
		meos_free(n);
	});
});

describe('a callback is a pointer', () => {
	it('the interrupt handler setter takes a function pointer, NULL clearing it', () => {
		meos_initialize_interrupt_handler(0);
		assert.equal(time_out(time_in('01:02:03', -1)), '01:02:03');
	});
});

describe('a 32-bit unsigned hash is read as unsigned', () => {
	it('every hash lies in [0, 2^32)', () => {
		for (let i = 0; i < 64; i++) {
			const s = intset_in(`{${i}, ${i * 7 + 1}, ${i * 131 + 5}}`);
			const h = set_hash(s);
			meos_free(s);
			assert.ok(Number.isInteger(h) && h >= 0 && h < 2 ** 32, `hash ${h} of set ${i}`);
		}
	});
});
