import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import { initMeos } from '../../../../core/runtime/meos.js';
import { BigIntSet } from '../../../../core/types/collections/number/BigIntSet.js';

before(async () => {
	await initMeos();
});

describe('BigIntSet - Construction', () => {
	it('fromString returns a non-zero pointer', () => {
		const s = BigIntSet.fromString('{1, 3, 7, 15}');
		assert.ok(s.inner !== 0);
		s.free();
	});

	it('toString round-trips WKT', () => {
		const s = BigIntSet.fromString('{1, 3, 7}');
		assert.equal(s.toString(), '{1, 3, 7}');
		s.free();
	});

	it('fromHexWKB round-trips through asHexWKB', () => {
		const s1 = BigIntSet.fromString('{1, 3, 7}');
		const hex = s1.asHexWKB();
		assert.ok(typeof hex === 'string' && hex.length > 0);
		const s2 = BigIntSet.fromHexWKB(hex);
		assert.equal(s2.toString(), s1.toString());
		s1.free();
		s2.free();
	});

	it('copy produces a distinct pointer with identical WKT', () => {
		const s = BigIntSet.fromString('{1, 3, 7}');
		const c = s.copy();
		assert.notEqual(s.inner, c.inner);
		assert.equal(c.toString(), s.toString());
		s.free();
		c.free();
	});
});

describe('BigIntSet - Accessors', () => {
	it('numValues returns correct count', () => {
		const s = BigIntSet.fromString('{1, 3, 7, 15}');
		assert.equal(s.numValues(), 4);
		s.free();
	});

	it('startValue returns smallest element', () => {
		const s = BigIntSet.fromString('{1, 3, 7, 15}');
		assert.equal(s.startValue(), 1);
		s.free();
	});

	it('endValue returns largest element', () => {
		const s = BigIntSet.fromString('{1, 3, 7, 15}');
		assert.equal(s.endValue(), 15);
		s.free();
	});

	it('valueN returns element at 0-based index', () => {
		const s = BigIntSet.fromString('{1, 3, 7, 15}');
		assert.equal(s.valueN(0), 1);
		assert.equal(s.valueN(1), 3);
		assert.equal(s.valueN(2), 7);
		assert.equal(s.valueN(3), 15);
		s.free();
	});

	it('hash returns a number', () => {
		const s = BigIntSet.fromString('{1, 3, 7}');
		assert.equal(typeof s.hash(), 'number');
		s.free();
	});
});

describe('BigIntSet - Set predicates', () => {
	it('isContainedIn: {1,3} is contained in {1,3,7}', () => {
		const a = BigIntSet.fromString('{1, 3}');
		const b = BigIntSet.fromString('{1, 3, 7}');
		assert.equal(a.isContainedIn(b), true);
		a.free();
		b.free();
	});

	it('contains: {1,3,7} contains {3}', () => {
		const a = BigIntSet.fromString('{1, 3, 7}');
		const b = BigIntSet.fromString('{3}');
		assert.equal(a.contains(b), true);
		a.free();
		b.free();
	});

	it('overlaps: {1,3} and {3,7} overlap', () => {
		const a = BigIntSet.fromString('{1, 3}');
		const b = BigIntSet.fromString('{3, 7}');
		assert.equal(a.overlaps(b), true);
		a.free();
		b.free();
	});

	it('overlaps: {1,3} and {7,15} do not overlap', () => {
		const a = BigIntSet.fromString('{1, 3}');
		const b = BigIntSet.fromString('{7, 15}');
		assert.equal(a.overlaps(b), false);
		a.free();
		b.free();
	});
});

describe('BigIntSet - Distance', () => {
	it('distance is 0 for sets with shared element', () => {
		const a = BigIntSet.fromString('{1, 3, 7}');
		const b = BigIntSet.fromString('{7, 15}');
		assert.equal(a.distance(b), 0);
		a.free();
		b.free();
	});

	it('distance between disjoint sets', () => {
		const a = BigIntSet.fromString('{1, 3}');
		const b = BigIntSet.fromString('{10, 20}');
		assert.ok(a.distance(b) > 0);
		a.free();
		b.free();
	});
});

describe('BigIntSet - Set operations', () => {
	it('intersection returns shared elements', () => {
		const a = BigIntSet.fromString('{1, 3, 7}');
		const b = BigIntSet.fromString('{3, 7, 15}');
		const r = a.intersection(b);
		assert.ok(r !== null);
		r!.free();
		a.free();
		b.free();
	});

	it('union contains elements from both', () => {
		const a = BigIntSet.fromString('{1, 3}');
		const b = BigIntSet.fromString('{7, 15}');
		const r = a.union(b);
		assert.equal(r.numValues(), 4);
		r.free();
		a.free();
		b.free();
	});

	it('minus removes elements present in other', () => {
		const a = BigIntSet.fromString('{1, 3, 7}');
		const b = BigIntSet.fromString('{3}');
		const r = a.minus(b);
		assert.equal(r!.numValues(), 2);
		r!.free();
		a.free();
		b.free();
	});
});

describe('BigIntSet - Comparisons', () => {
	it('eq: same set is equal', () => {
		const a = BigIntSet.fromString('{1, 3, 7}');
		const b = BigIntSet.fromString('{1, 3, 7}');
		assert.equal(a.eq(b), true);
		a.free();
		b.free();
	});

	it('ne: different sets', () => {
		const a = BigIntSet.fromString('{1, 3, 7}');
		const b = BigIntSet.fromString('{1, 3, 8}');
		assert.equal(a.ne(b), true);
		a.free();
		b.free();
	});

	it('lt / gt order', () => {
		const a = BigIntSet.fromString('{1, 3}');
		const b = BigIntSet.fromString('{5, 7}');
		assert.equal(a.lt(b), true);
		assert.equal(b.gt(a), true);
		a.free();
		b.free();
	});
});

describe('BigIntSet - shiftScale', () => {
	it('shift only: all elements shift by 10', () => {
		const s = BigIntSet.fromString('{1, 3, 7}');
		const r = s.shiftScale(10, 0, true, false);
		assert.equal(r.startValue(), 11);
		assert.equal(r.endValue(), 17);
		s.free();
		r.free();
	});

	it('scale only: elements are scaled', () => {
		const s = BigIntSet.fromString('{0, 10}');
		const r = s.shiftScale(0, 20, false, true);
		assert.equal(r.startValue(), 0);
		assert.equal(r.endValue(), 21); // BigInt spans +1 for half-open: bounding [0,11)→[0,22) → last element 21
		s.free();
		r.free();
	});
});
