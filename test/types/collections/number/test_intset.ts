import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import { initMeos } from '../../../../core/runtime/meos.js';
import { IntSet } from '../../../../core/types/collections/number/IntSet.js';

before(async () => {
	await initMeos();
});

const V1 = 2;
const V2 = 4;
const V3 = 7;
const V4 = 12;

// -------------------------------------------------------------------------
// CONSTRUCTION & OUTPUT
// -------------------------------------------------------------------------

describe('IntSet - Construction', () => {
	it('fromString returns a non-zero pointer', () => {
		const s = IntSet.fromString(`{${V1}, ${V2}, ${V3}}`);
		assert.ok(s.inner !== 0);
		s.free();
	});

	it('toString contains the input values', () => {
		const s = IntSet.fromString(`{${V1}, ${V2}}`);
		const out = s.toString();
		assert.ok(out.includes('2'));
		assert.ok(out.includes('4'));
		s.free();
	});

	it('fromHexWKB round-trips through asHexWKB', () => {
		const s1 = IntSet.fromString(`{${V1}, ${V2}, ${V3}}`);
		const hex = s1.asHexWKB();
		assert.ok(typeof hex === 'string' && hex.length > 0);
		const s2 = IntSet.fromHexWKB(hex);
		assert.equal(s2.toString(), s1.toString());
		s1.free();
		s2.free();
	});

	it('copy produces a distinct pointer with same content', () => {
		const s = IntSet.fromString(`{${V1}, ${V2}}`);
		const c = s.copy();
		assert.notEqual(s.inner, c.inner);
		assert.equal(c.toString(), s.toString());
		s.free();
		c.free();
	});
});

// -------------------------------------------------------------------------
// ACCESSORS
// -------------------------------------------------------------------------

describe('IntSet - Accessors', () => {
	it('numValues returns correct count', () => {
		const s = IntSet.fromString(`{${V1}, ${V2}, ${V3}}`);
		assert.equal(s.numValues(), 3);
		s.free();
	});

	it('startValue equals V1', () => {
		const s = IntSet.fromString(`{${V1}, ${V2}, ${V3}}`);
		assert.equal(s.startValue(), V1);
		s.free();
	});

	it('endValue equals V3', () => {
		const s = IntSet.fromString(`{${V1}, ${V2}, ${V3}}`);
		assert.equal(s.endValue(), V3);
		s.free();
	});

	it('valueN(0) equals startValue', () => {
		const s = IntSet.fromString(`{${V1}, ${V2}, ${V3}}`);
		assert.equal(s.valueN(0), s.startValue());
		s.free();
	});

	it('valueN(n-1) equals endValue', () => {
		const s = IntSet.fromString(`{${V1}, ${V2}, ${V3}}`);
		assert.equal(s.valueN(2), s.endValue());
		s.free();
	});

	it('hash returns a number', () => {
		const s = IntSet.fromString(`{${V1}, ${V2}}`);
		assert.equal(typeof s.hash(), 'number');
		s.free();
	});
});

// -------------------------------------------------------------------------
// CONVERSIONS
// -------------------------------------------------------------------------

describe('IntSet - Conversions', () => {
	it('toSpan returns a non-zero pointer', () => {
		const s = IntSet.fromString(`{${V1}, ${V2}, ${V3}}`);
		assert.ok(s.toSpan() !== 0);
		s.free();
	});

	it('toSpanSet returns a non-zero pointer', () => {
		const s = IntSet.fromString(`{${V1}, ${V2}, ${V3}}`);
		assert.ok(s.toSpanSet() !== 0);
		s.free();
	});

	it('toFloatSet returns a non-zero pointer', () => {
		const s = IntSet.fromString(`{${V1}, ${V2}}`);
		assert.ok(s.toFloatSet() !== 0);
		s.free();
	});
});

// -------------------------------------------------------------------------
// TOPOLOGICAL PREDICATES
// -------------------------------------------------------------------------

describe('IntSet - Topological predicates', () => {
	it('isContainedIn: {V1,V2} is contained in {V1,V2,V3}', () => {
		const a = IntSet.fromString(`{${V1}, ${V2}}`);
		const b = IntSet.fromString(`{${V1}, ${V2}, ${V3}}`);
		assert.equal(a.isContainedIn(b), true);
		a.free();
		b.free();
	});

	it('contains: {V1,V2,V3} contains {V1,V2}', () => {
		const a = IntSet.fromString(`{${V1}, ${V2}, ${V3}}`);
		const b = IntSet.fromString(`{${V1}, ${V2}}`);
		assert.equal(a.contains(b), true);
		a.free();
		b.free();
	});

	it('overlaps: {V1,V2} and {V2,V3} share V2', () => {
		const a = IntSet.fromString(`{${V1}, ${V2}}`);
		const b = IntSet.fromString(`{${V2}, ${V3}}`);
		assert.equal(a.overlaps(b), true);
		a.free();
		b.free();
	});

	it('overlaps: {V1} and {V3} do not overlap', () => {
		const a = IntSet.fromString(`{${V1}}`);
		const b = IntSet.fromString(`{${V3}}`);
		assert.equal(a.overlaps(b), false);
		a.free();
		b.free();
	});
});

// -------------------------------------------------------------------------
// POSITION PREDICATES
// -------------------------------------------------------------------------

describe('IntSet - Position predicates', () => {
	it('isBefore: {V1,V2} is before {V3,V4}', () => {
		const a = IntSet.fromString(`{${V1}, ${V2}}`);
		const b = IntSet.fromString(`{${V3}, ${V4}}`);
		assert.equal(a.isBefore(b), true);
		a.free();
		b.free();
	});

	it('isAfter: {V3,V4} is after {V1,V2}', () => {
		const a = IntSet.fromString(`{${V3}, ${V4}}`);
		const b = IntSet.fromString(`{${V1}, ${V2}}`);
		assert.equal(a.isAfter(b), true);
		a.free();
		b.free();
	});

	it('isOverOrBefore: max({V1,V3}) <= max({V2,V4})', () => {
		const a = IntSet.fromString(`{${V1}, ${V3}}`);
		const b = IntSet.fromString(`{${V2}, ${V4}}`);
		assert.equal(a.isOverOrBefore(b), true);
		a.free();
		b.free();
	});

	it('isOverOrAfter: min({V3,V4}) >= min({V1,V2})', () => {
		const a = IntSet.fromString(`{${V3}, ${V4}}`);
		const b = IntSet.fromString(`{${V1}, ${V2}}`);
		assert.equal(a.isOverOrAfter(b), true);
		a.free();
		b.free();
	});
});

// -------------------------------------------------------------------------
// DISTANCE
// -------------------------------------------------------------------------

describe('IntSet - Distance', () => {
	it('distance is 0 for sets sharing a value', () => {
		const a = IntSet.fromString(`{${V1}, ${V2}}`);
		const b = IntSet.fromString(`{${V2}, ${V3}}`);
		assert.equal(a.distance(b), 0);
		a.free();
		b.free();
	});

	it('distance > 0 for disjoint sets', () => {
		const a = IntSet.fromString(`{${V1}}`);
		const b = IntSet.fromString(`{${V3}}`);
		assert.ok(a.distance(b) > 0);
		a.free();
		b.free();
	});
});

// -------------------------------------------------------------------------
// SET OPERATIONS
// -------------------------------------------------------------------------

describe('IntSet - Set operations', () => {
	it('union produces a set containing all values', () => {
		const a = IntSet.fromString(`{${V1}, ${V2}}`);
		const b = IntSet.fromString(`{${V3}, ${V4}}`);
		const u = a.union(b);
		assert.equal(u.numValues(), 4);
		a.free();
		b.free();
		u.free();
	});

	it('intersection returns shared values', () => {
		const a = IntSet.fromString(`{${V1}, ${V2}, ${V3}}`);
		const b = IntSet.fromString(`{${V2}, ${V3}, ${V4}}`);
		const r = a.intersection(b);
		assert.ok(r !== null);
		assert.equal(r!.numValues(), 2);
		a.free();
		b.free();
		r!.free();
	});

	it('intersection returns null for disjoint sets', () => {
		const a = IntSet.fromString(`{${V1}, ${V2}}`);
		const b = IntSet.fromString(`{${V3}, ${V4}}`);
		assert.equal(a.intersection(b), null);
		a.free();
		b.free();
	});

	it('minus removes values present in other', () => {
		const a = IntSet.fromString(`{${V1}, ${V2}, ${V3}}`);
		const b = IntSet.fromString(`{${V2}}`);
		const r = a.minus(b);
		assert.ok(r !== null);
		assert.equal(r!.numValues(), 2);
		a.free();
		b.free();
		r!.free();
	});
});

// -------------------------------------------------------------------------
// COMPARISONS
// -------------------------------------------------------------------------

describe('IntSet - Comparisons', () => {
	it('eq: same set', () => {
		const a = IntSet.fromString(`{${V1}, ${V2}}`);
		const b = IntSet.fromString(`{${V1}, ${V2}}`);
		assert.equal(a.eq(b), true);
		a.free();
		b.free();
	});

	it('ne: different sets', () => {
		const a = IntSet.fromString(`{${V1}, ${V2}}`);
		const b = IntSet.fromString(`{${V1}, ${V3}}`);
		assert.equal(a.ne(b), true);
		a.free();
		b.free();
	});

	it('lt / gt order', () => {
		const a = IntSet.fromString(`{${V1}}`);
		const b = IntSet.fromString(`{${V3}}`);
		assert.equal(a.lt(b), true);
		assert.equal(b.gt(a), true);
		a.free();
		b.free();
	});

	it('le / ge for equal sets', () => {
		const a = IntSet.fromString(`{${V1}, ${V2}}`);
		const b = IntSet.fromString(`{${V1}, ${V2}}`);
		assert.equal(a.le(b), true);
		assert.equal(a.ge(b), true);
		a.free();
		b.free();
	});
});

// -------------------------------------------------------------------------
// MATH METHODS
// -------------------------------------------------------------------------

describe('IntSet - shiftScale', () => {
	it('shift by 2 moves values forward', () => {
		const s = IntSet.fromString(`{${V1}}`); // {2}
		const shifted = s.shiftScale(2, 0, true, false);
		assert.equal(shifted.startValue(), V1 + 2); // {4}
		s.free();
		shifted.free();
	});

	it('toFloatSet returns a non-zero pointer', () => {
		const s = IntSet.fromString(`{${V1}, ${V2}}`);
		assert.ok(s.toFloatSet() !== 0);
		s.free();
	});
});
