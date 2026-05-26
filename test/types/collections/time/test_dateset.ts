import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import { initMeos } from '../../../../core/runtime/meos';
import { DateSet } from '../../../../core/types/collections/time/DateSet';

before(async () => {
	await initMeos();
});

const D_A = '2000-01-01';
const D_B = '2000-01-11';
const D_C = '2000-01-21';
const D_D = '2000-01-31';

// -------------------------------------------------------------------------
// CONSTRUCTION & OUTPUT
// -------------------------------------------------------------------------

describe('DateSet - Construction', () => {
	it('fromString returns a non-zero pointer', () => {
		const s = DateSet.fromString(`{${D_A}, ${D_B}, ${D_C}}`);
		assert.ok(s.inner !== 0);
		s.free();
	});

	it('toString round-trips WKT', () => {
		const s = DateSet.fromString(`{${D_A}, ${D_B}}`);
		const out = s.toString();
		assert.ok(out.includes('2000-01-01'));
		assert.ok(out.includes('2000-01-11'));
		s.free();
	});

	it('fromHexWKB round-trips through asHexWKB', () => {
		const s1 = DateSet.fromString(`{${D_A}, ${D_B}, ${D_C}}`);
		const hex = s1.asHexWKB();
		assert.ok(typeof hex === 'string' && hex.length > 0);
		const s2 = DateSet.fromHexWKB(hex);
		assert.equal(s2.toString(), s1.toString());
		s1.free();
		s2.free();
	});

	it('copy produces a distinct pointer with same content', () => {
		const s = DateSet.fromString(`{${D_A}, ${D_B}}`);
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

describe('DateSet - Accessors', () => {
	it('numValues returns correct count', () => {
		const s = DateSet.fromString(`{${D_A}, ${D_B}, ${D_C}}`);
		assert.equal(s.numValues(), 3);
		s.free();
	});

	it('startValue equals first date (day 0)', () => {
		const s = DateSet.fromString(`{${D_A}, ${D_B}, ${D_C}}`);
		assert.equal(s.startValue(), 0);
		s.free();
	});

	it('endValue equals last date (day 20)', () => {
		const s = DateSet.fromString(`{${D_A}, ${D_B}, ${D_C}}`);
		assert.equal(s.endValue(), 20);
		s.free();
	});

	it('valueN(0) equals startValue', () => {
		const s = DateSet.fromString(`{${D_A}, ${D_B}, ${D_C}}`);
		assert.equal(s.valueN(0), s.startValue());
		s.free();
	});

	it('valueN(n-1) equals endValue', () => {
		const s = DateSet.fromString(`{${D_A}, ${D_B}, ${D_C}}`);
		assert.equal(s.valueN(2), s.endValue());
		s.free();
	});

	it('hash returns a number', () => {
		const s = DateSet.fromString(`{${D_A}, ${D_B}}`);
		assert.equal(typeof s.hash(), 'number');
		s.free();
	});
});

// -------------------------------------------------------------------------
// CONVERSIONS & MATH
// -------------------------------------------------------------------------

describe('DateSet - Conversions', () => {
	it('toSpan returns a non-zero pointer', () => {
		const s = DateSet.fromString(`{${D_A}, ${D_B}, ${D_C}}`);
		assert.ok(s.toSpan() !== 0);
		s.free();
	});

	it('toSpanSet returns a non-zero pointer', () => {
		const s = DateSet.fromString(`{${D_A}, ${D_B}, ${D_C}}`);
		assert.ok(s.toSpanSet() !== 0);
		s.free();
	});

	it('toTsTzSet returns a non-zero pointer', () => {
		const s = DateSet.fromString(`{${D_A}, ${D_B}}`);
		assert.ok(s.toTsTzSet() !== 0);
		s.free();
	});
});

// -------------------------------------------------------------------------
// TOPOLOGICAL PREDICATES
// -------------------------------------------------------------------------

describe('DateSet - Topological predicates', () => {
	it('isContainedIn: {D_A,D_B} is contained in {D_A,D_B,D_C}', () => {
		const a = DateSet.fromString(`{${D_A}, ${D_B}}`);
		const b = DateSet.fromString(`{${D_A}, ${D_B}, ${D_C}}`);
		assert.equal(a.isContainedIn(b), true);
		a.free();
		b.free();
	});

	it('contains: {D_A,D_B,D_C} contains {D_A,D_B}', () => {
		const a = DateSet.fromString(`{${D_A}, ${D_B}, ${D_C}}`);
		const b = DateSet.fromString(`{${D_A}, ${D_B}}`);
		assert.equal(a.contains(b), true);
		a.free();
		b.free();
	});

	it('overlaps: {D_A,D_B} and {D_B,D_C} share D_B', () => {
		const a = DateSet.fromString(`{${D_A}, ${D_B}}`);
		const b = DateSet.fromString(`{${D_B}, ${D_C}}`);
		assert.equal(a.overlaps(b), true);
		a.free();
		b.free();
	});

	it('overlaps: {D_A} and {D_C} do not overlap', () => {
		const a = DateSet.fromString(`{${D_A}}`);
		const b = DateSet.fromString(`{${D_C}}`);
		assert.equal(a.overlaps(b), false);
		a.free();
		b.free();
	});
});

// -------------------------------------------------------------------------
// POSITION PREDICATES
// -------------------------------------------------------------------------

describe('DateSet - Position predicates', () => {
	it('isBefore: {D_A,D_B} is before {D_C,D_D}', () => {
		const a = DateSet.fromString(`{${D_A}, ${D_B}}`);
		const b = DateSet.fromString(`{${D_C}, ${D_D}}`);
		assert.equal(a.isBefore(b), true);
		a.free();
		b.free();
	});

	it('isAfter: {D_C,D_D} is after {D_A,D_B}', () => {
		const a = DateSet.fromString(`{${D_C}, ${D_D}}`);
		const b = DateSet.fromString(`{${D_A}, ${D_B}}`);
		assert.equal(a.isAfter(b), true);
		a.free();
		b.free();
	});

	it('isOverOrBefore: max({D_A,D_C}) <= max({D_B,D_D})', () => {
		const a = DateSet.fromString(`{${D_A}, ${D_C}}`);
		const b = DateSet.fromString(`{${D_B}, ${D_D}}`);
		assert.equal(a.isOverOrBefore(b), true);
		a.free();
		b.free();
	});

	it('isOverOrAfter: min({D_C,D_D}) >= min({D_A,D_B})', () => {
		const a = DateSet.fromString(`{${D_C}, ${D_D}}`);
		const b = DateSet.fromString(`{${D_A}, ${D_B}}`);
		assert.equal(a.isOverOrAfter(b), true);
		a.free();
		b.free();
	});
});

// -------------------------------------------------------------------------
// DISTANCE
// -------------------------------------------------------------------------

describe('DateSet - Distance', () => {
	it('distance is 0 for sets sharing a date', () => {
		const a = DateSet.fromString(`{${D_A}, ${D_B}}`);
		const b = DateSet.fromString(`{${D_B}, ${D_C}}`);
		assert.equal(a.distance(b), 0);
		a.free();
		b.free();
	});

	it('distance > 0 for disjoint sets', () => {
		const a = DateSet.fromString(`{${D_A}}`);
		const b = DateSet.fromString(`{${D_C}}`);
		assert.ok(a.distance(b) > 0);
		a.free();
		b.free();
	});
});

// -------------------------------------------------------------------------
// SET OPERATIONS
// -------------------------------------------------------------------------

describe('DateSet - Set operations', () => {
	it('union produces a set containing all dates', () => {
		const a = DateSet.fromString(`{${D_A}, ${D_B}}`);
		const b = DateSet.fromString(`{${D_C}, ${D_D}}`);
		const u = a.union(b);
		assert.equal(u.numValues(), 4);
		a.free();
		b.free();
		u.free();
	});

	it('intersection returns shared dates', () => {
		const a = DateSet.fromString(`{${D_A}, ${D_B}, ${D_C}}`);
		const b = DateSet.fromString(`{${D_B}, ${D_C}, ${D_D}}`);
		const r = a.intersection(b);
		assert.ok(r !== null);
		assert.equal(r!.numValues(), 2);
		a.free();
		b.free();
		r!.free();
	});

	it('intersection returns null for disjoint sets', () => {
		const a = DateSet.fromString(`{${D_A}, ${D_B}}`);
		const b = DateSet.fromString(`{${D_C}, ${D_D}}`);
		assert.equal(a.intersection(b), null);
		a.free();
		b.free();
	});

	it('minus removes dates present in other', () => {
		const a = DateSet.fromString(`{${D_A}, ${D_B}, ${D_C}}`);
		const b = DateSet.fromString(`{${D_B}}`);
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

describe('DateSet - Comparisons', () => {
	it('eq: same set', () => {
		const a = DateSet.fromString(`{${D_A}, ${D_B}}`);
		const b = DateSet.fromString(`{${D_A}, ${D_B}}`);
		assert.equal(a.eq(b), true);
		a.free();
		b.free();
	});

	it('ne: different sets', () => {
		const a = DateSet.fromString(`{${D_A}, ${D_B}}`);
		const b = DateSet.fromString(`{${D_A}, ${D_C}}`);
		assert.equal(a.ne(b), true);
		a.free();
		b.free();
	});

	it('lt / gt order', () => {
		const a = DateSet.fromString(`{${D_A}}`);
		const b = DateSet.fromString(`{${D_C}}`);
		assert.equal(a.lt(b), true);
		assert.equal(b.gt(a), true);
		a.free();
		b.free();
	});

	it('le / ge for equal sets', () => {
		const a = DateSet.fromString(`{${D_A}, ${D_B}}`);
		const b = DateSet.fromString(`{${D_A}, ${D_B}}`);
		assert.equal(a.le(b), true);
		assert.equal(a.ge(b), true);
		a.free();
		b.free();
	});
});

// -------------------------------------------------------------------------
// SHIFT & SCALE
// -------------------------------------------------------------------------

describe('DateSet - shiftScale', () => {
	it('shift by 10 days moves dates forward', () => {
		const s = DateSet.fromString(`{${D_A}}`); // day 0
		const shifted = s.shiftScale(10, 0, true, false);
		assert.equal(shifted.startValue(), 10); // now day 10
		s.free();
		shifted.free();
	});
});
