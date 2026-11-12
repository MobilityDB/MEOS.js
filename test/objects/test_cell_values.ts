import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import { initMeos } from '../../core/runtime/meos.js';
import { H3Index, H3IndexSet, Quadbin, QuadbinSet, S2Cell } from '../../core/objects/objects.generated.js';

// A grid cell is a class MEOS passes by value (`byValue` in the catalog's object
// model): the instance holds the 64-bit value as a bigint, each method hands it
// to MEOS at the call, and every slot of the cell's C type, an element of an
// array included, is that class. The expected texts and WKB are MobilityDB's
// regression outputs for the same cells.

before(async () => {
	await initMeos();
});

describe('generated object layer: grid cells held by value', () => {
	it('reads and writes a Quadbin as text, WKB and hex WKB', () => {
		const q = Quadbin.fromText('48427fffffffffff');
		assert.equal(typeof q.value, 'bigint');
		assert.equal(q.value, 0x48427fffffffffffn);
		assert.equal(q.toString(), '48427fffffffffff');
		assert.equal(q.asText(), '48427fffffffffff');
		assert.equal(q.asHexWKB(), '01470000FFFFFFFFFF7F4248');
		assert.equal(Quadbin.fromHexWKB('01470000FFFFFFFFFF7F4248').eq(q), true);
		assert.equal(Quadbin.fromWKB(q.asWKB()).eq(q), true);
	});

	it('reads and writes an S2Cell as text, WKB and hex WKB', () => {
		const c = S2Cell.fromText('47c3c444c');
		assert.equal(c.toString(), '47c3c444c');
		assert.equal(c.asText(), '47c3c444c');
		assert.equal(c.asHexWKB(), '01550000000000C044C4C347');
		assert.equal(S2Cell.fromHexWKB('01550000000000C044C4C347').eq(c), true);
		assert.equal(S2Cell.fromWKB(c.asWKB()).eq(c), true);
	});

	it('reads and writes an H3Index as text, WKB and hex WKB', () => {
		const h = H3Index.fromText('8a2a1072b59ffff');
		assert.equal(h.value, 0x8a2a1072b59ffffn);
		assert.equal(h.toString(), '8a2a1072b59ffff');
		assert.equal(h.asText(), '8a2a1072b59ffff');
		assert.equal(H3Index.fromHexWKB(h.asHexWKB()).eq(h), true);
		assert.equal(H3Index.fromWKB(h.asWKB()).eq(h), true);
		assert.equal(h.getResolution(), 10);
		assert.equal(h.cellToParent(9).getResolution(), 9);
	});

	it('passes and answers cells in arrays and sets as the class', () => {
		const q = Quadbin.fromText('48427fffffffffff');
		const children = q.cellToChildren(5);
		assert.equal(children.length, 4);
		assert.ok(children.every(c => c instanceof Quadbin && c.cellToParent(4).eq(q)));
		using s = QuadbinSet.make(children);
		assert.ok(s.startValue() instanceof Quadbin);
		assert.equal(s.values().map(String).join(','), children.map(String).sort().join(','));
		const h = H3Index.fromText('8a2a1072b59ffff');
		using hs = H3IndexSet.make([h]);
		assert.equal(hs.valueN(1).eq(h), true);
		assert.equal(hs.contains(h), true);
	});
});
