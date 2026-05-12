import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import { initMeos } from '../../../../core/runtime/meos';
import { BigIntSpan } from '../../../../core/types/collections/number/BigIntSpan';
import { BigIntSpanSet } from '../../../../core/types/collections/number/BigIntSpanSet';

before(async () => {
	await initMeos();
});

const WKT_AB = '{[1, 5), [8, 12)}';

describe('BigIntSpanSet - Construction', () => {
	it('fromString returns a non-zero pointer', () => {
		const ss = BigIntSpanSet.fromString(WKT_AB);
		assert.ok(ss.inner !== 0);
		ss.free();
	});

	it('toString round-trips WKT', () => {
		const ss = BigIntSpanSet.fromString(WKT_AB);
		assert.equal(ss.toString(), WKT_AB);
		ss.free();
	});

	it('fromHexWKB round-trips through asHexWKB', () => {
		const ss1 = BigIntSpanSet.fromString(WKT_AB);
		const hex = ss1.asHexWKB();
		assert.ok(typeof hex === 'string' && hex.length > 0);
		const ss2 = BigIntSpanSet.fromHexWKB(hex);
		assert.equal(ss2.toString(), ss1.toString());
		ss1.free();
		ss2.free();
	});

	it('fromSpan wraps a single BigIntSpan', () => {
		const s = BigIntSpan.fromBounds(1, 8);
		const ss = BigIntSpanSet.fromSpan(s);
		assert.equal(ss.numSpans(), 1);
		assert.equal(ss.lower(), 1);
		assert.equal(ss.upper(), 8);
		s.free();
		ss.free();
	});

	it('copy produces a distinct pointer with identical WKT', () => {
		const ss = BigIntSpanSet.fromString(WKT_AB);
		const c = ss.copy();
		assert.ok(c.inner !== 0);
		assert.notEqual(c.inner, ss.inner);
		assert.equal(c.toString(), ss.toString());
		ss.free();
		c.free();
	});
});

describe('BigIntSpanSet - Accessors', () => {
	it('numSpans returns 2', () => {
		const ss = BigIntSpanSet.fromString(WKT_AB);
		assert.equal(ss.numSpans(), 2);
		ss.free();
	});

	it('lower and upper return outer bounds', () => {
		const ss = BigIntSpanSet.fromString(WKT_AB);
		assert.equal(ss.lower(), 1);
		assert.equal(ss.upper(), 12);
		ss.free();
	});

	it('width (sum of spans)', () => {
		const ss = BigIntSpanSet.fromString(WKT_AB);
		// [1,5) = 4 wide, [8,12) = 4 wide → total = 8
		assert.equal(ss.width(), 8);
		ss.free();
	});

	it('width (bounding span)', () => {
		const ss = BigIntSpanSet.fromString(WKT_AB);
		// bounding [1,12) = 11 wide
		assert.equal(ss.width(true), 11);
		ss.free();
	});

	it('spanN returns correct span', () => {
		const ss = BigIntSpanSet.fromString(WKT_AB);
		const s = ss.spanN(0);
		assert.ok(s.inner !== 0);
		assert.equal(s.lower(), 1);
		assert.equal(s.upper(), 5);
		ss.free();
		s.free();
	});
});

describe('BigIntSpanSet - Distance', () => {
	it('distance to BigIntSpan returns 0 when overlapping', () => {
		const ss = BigIntSpanSet.fromString(WKT_AB);
		const s = BigIntSpan.fromString('[3, 6)');
		assert.equal(ss.distance(s), 0);
		ss.free();
		s.free();
	});

	it('distance to BigIntSpan returns gap', () => {
		const ss = BigIntSpanSet.fromString('{[1, 3), [10, 15)}');
		const s = BigIntSpan.fromString('[20, 30)'); // outside bounding span [1, 15)
		assert.ok(ss.distance(s) > 0);
		ss.free();
		s.free();
	});

	it('distance to BigIntSpanSet returns 0 when overlapping', () => {
		const ss1 = BigIntSpanSet.fromString(WKT_AB);
		const ss2 = BigIntSpanSet.fromString('{[3, 6)}');
		assert.equal(ss1.distance(ss2), 0);
		ss1.free();
		ss2.free();
	});
});

describe('BigIntSpanSet - Set operations', () => {
	it('intersection returns overlapping region', () => {
		const ss = BigIntSpanSet.fromString(WKT_AB);
		const s = BigIntSpan.fromString('[3, 6)');
		const r = ss.intersection(s);
		assert.ok(r !== null);
		ss.free(); s.free(); r!.free();
	});

	it('union returns non-zero ptr', () => {
		const ss = BigIntSpanSet.fromString(WKT_AB);
		const s = BigIntSpan.fromString('[20, 25)');
		const ptr = ss.union(s);
		assert.ok(ptr !== 0);
		ss.free();
		s.free();
	});
});

describe('BigIntSpanSet - Comparisons', () => {
	it('eq: same span set is equal', () => {
		const a = BigIntSpanSet.fromString(WKT_AB);
		const b = BigIntSpanSet.fromString(WKT_AB);
		assert.equal(a.eq(b), true);
		a.free();
		b.free();
	});

	it('ne: different span sets', () => {
		const a = BigIntSpanSet.fromString(WKT_AB);
		const b = BigIntSpanSet.fromString('{[2, 5), [8, 12)}');
		assert.equal(a.ne(b), true);
		a.free();
		b.free();
	});
});

describe('BigIntSpanSet - shiftScale', () => {
	it('shift only', () => {
		const ss = BigIntSpanSet.fromString('{[1, 5), [8, 12)}');
		const r = ss.shiftScale(10, 0, true, false);
		assert.equal(r.lower(), 11);
		ss.free();
		r.free();
	});

	it('scale only: width adjusts', () => {
		const ss = BigIntSpanSet.fromString('{[0, 10)}');
		const r = ss.shiftScale(0, 20, false, true);
		assert.equal(r.lower(), 0);
		assert.equal(r.width(), 21); // BigInt half-open: width 20 → span [0, 21)
		ss.free();
		r.free();
	});
});
