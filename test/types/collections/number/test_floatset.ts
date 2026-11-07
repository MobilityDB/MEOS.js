import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import { initMeos } from '../../../../core/runtime/meos.js';
import { FloatSet } from '../../../../core/objects/objects.generated.js';

before(async () => {
	await initMeos();
});

const V1 = 1.5;
const V2 = 4.5;
const V3 = 7.5;
const V4 = 10.5;

// -------------------------------------------------------------------------
// CONSTRUCTION & OUTPUT
// -------------------------------------------------------------------------

describe('FloatSet - Construction', () => {
	it('fromString returns a non-zero pointer', () => {
		const s = FloatSet.in(`{${V1}, ${V2}, ${V3}}`);
		assert.ok(s.ptr !== 0);
		s.free();
	});

	it('toString contains the input values', () => {
		const s = FloatSet.in(`{${V1}, ${V2}}`);
		const out = s.toString();
		assert.ok(out.includes('1.5'));
		assert.ok(out.includes('4.5'));
		s.free();
	});

	it('fromHexWKB round-trips through asHexWKB', () => {
		const s1 = FloatSet.in(`{${V1}, ${V2}, ${V3}}`);
		const hex = s1.asHexWKB();
		assert.ok(typeof hex === 'string' && hex.length > 0);
		const s2 = FloatSet.fromHexWKB(hex);
		assert.equal(s2.toString(), s1.toString());
		s1.free();
		s2.free();
	});

	it('fromBinary round-trips through asBinary', () => {
		const s1 = FloatSet.in(`{${V1}, ${V2}, ${V3}}`);
		const wkb = s1.asWKB();
		assert.equal(Buffer.from(wkb).toString('hex').toUpperCase(), s1.asHexWKB());
		assert.ok(wkb instanceof Uint8Array && wkb.length > 0);
		const s2 = FloatSet.fromWKB(wkb);
		assert.equal(s2.toString(), s1.toString());
		s1.free();
		s2.free();
	});

	it('copy produces a distinct pointer with same content', () => {
		const s = FloatSet.in(`{${V1}, ${V2}}`);
		const c = s.copy();
		assert.notEqual(s.ptr, c.ptr);
		assert.equal(c.toString(), s.toString());
		s.free();
		c.free();
	});
});

// -------------------------------------------------------------------------
// ACCESSORS
// -------------------------------------------------------------------------

describe('FloatSet - Accessors', () => {
	it('numValues returns correct count', () => {
		const s = FloatSet.in(`{${V1}, ${V2}, ${V3}}`);
		assert.equal(s.numValues(), 3);
		s.free();
	});

	it('startValue equals V1', () => {
		const s = FloatSet.in(`{${V1}, ${V2}, ${V3}}`);
		assert.ok(Math.abs(s.startValue() - V1) < 1e-9);
		s.free();
	});

	it('endValue equals V3', () => {
		const s = FloatSet.in(`{${V1}, ${V2}, ${V3}}`);
		assert.ok(Math.abs(s.endValue() - V3) < 1e-9);
		s.free();
	});

	it('valueN(0) equals startValue', () => {
		const s = FloatSet.in(`{${V1}, ${V2}, ${V3}}`);
		assert.ok(Math.abs(s.valueN(1) - s.startValue()) < 1e-9);
		s.free();
	});

	it('valueN(n-1) equals endValue', () => {
		const s = FloatSet.in(`{${V1}, ${V2}, ${V3}}`);
		assert.ok(Math.abs(s.valueN(3) - s.endValue()) < 1e-9);
		s.free();
	});

	it('hash returns a number', () => {
		const s = FloatSet.in(`{${V1}, ${V2}}`);
		assert.equal(typeof s.hash(), 'number');
		s.free();
	});
});

// -------------------------------------------------------------------------
// CONVERSIONS
// -------------------------------------------------------------------------

describe('FloatSet - Conversions', () => {
	it('toSpan returns a non-zero pointer', () => {
		const s = FloatSet.in(`{${V1}, ${V2}, ${V3}}`);
		assert.ok(s.toSpan() !== null);
		s.free();
	});

	it('toSpanSet returns a non-zero pointer', () => {
		const s = FloatSet.in(`{${V1}, ${V2}, ${V3}}`);
		assert.ok(s.toSpanset() !== null);
		s.free();
	});

	it('toIntSet returns a non-zero pointer', () => {
		const s = FloatSet.in(`{${V1}, ${V2}}`);
		assert.ok(s.toIntset() !== null);
		s.free();
	});
});

// -------------------------------------------------------------------------
// TOPOLOGICAL PREDICATES
// -------------------------------------------------------------------------

describe('FloatSet - Topological predicates', () => {
	it('isContainedIn: {V1,V2} is contained in {V1,V2,V3}', () => {
		const a = FloatSet.in(`{${V1}, ${V2}}`);
		const b = FloatSet.in(`{${V1}, ${V2}, ${V3}}`);
		assert.equal(a.contained(b), true);
		a.free();
		b.free();
	});

	it('contains: {V1,V2,V3} contains {V1,V2}', () => {
		const a = FloatSet.in(`{${V1}, ${V2}, ${V3}}`);
		const b = FloatSet.in(`{${V1}, ${V2}}`);
		assert.equal(a.contains(b), true);
		a.free();
		b.free();
	});

	it('overlaps: {V1,V2} and {V2,V3} share V2', () => {
		const a = FloatSet.in(`{${V1}, ${V2}}`);
		const b = FloatSet.in(`{${V2}, ${V3}}`);
		assert.equal(a.overlaps(b), true);
		a.free();
		b.free();
	});

	it('overlaps: {V1} and {V3} do not overlap', () => {
		const a = FloatSet.in(`{${V1}}`);
		const b = FloatSet.in(`{${V3}}`);
		assert.equal(a.overlaps(b), false);
		a.free();
		b.free();
	});
});

// -------------------------------------------------------------------------
// POSITION PREDICATES
// -------------------------------------------------------------------------

describe('FloatSet - Position predicates', () => {
	it('isBefore: {V1,V2} is before {V3,V4}', () => {
		const a = FloatSet.in(`{${V1}, ${V2}}`);
		const b = FloatSet.in(`{${V3}, ${V4}}`);
		assert.equal(a.left(b), true);
		a.free();
		b.free();
	});

	it('isAfter: {V3,V4} is after {V1,V2}', () => {
		const a = FloatSet.in(`{${V3}, ${V4}}`);
		const b = FloatSet.in(`{${V1}, ${V2}}`);
		assert.equal(a.right(b), true);
		a.free();
		b.free();
	});

	it('isOverOrBefore: max({V1,V3}) <= max({V2,V4})', () => {
		const a = FloatSet.in(`{${V1}, ${V3}}`);
		const b = FloatSet.in(`{${V2}, ${V4}}`);
		assert.equal(a.overleft(b), true);
		a.free();
		b.free();
	});

	it('isOverOrAfter: min({V3,V4}) >= min({V1,V2})', () => {
		const a = FloatSet.in(`{${V3}, ${V4}}`);
		const b = FloatSet.in(`{${V1}, ${V2}}`);
		assert.equal(a.overright(b), true);
		a.free();
		b.free();
	});
});

// -------------------------------------------------------------------------
// DISTANCE
// -------------------------------------------------------------------------

describe('FloatSet - Distance', () => {
	it('distance is 0 for sets sharing a value', () => {
		const a = FloatSet.in(`{${V1}, ${V2}}`);
		const b = FloatSet.in(`{${V2}, ${V3}}`);
		assert.equal(a.distance(b), 0);
		a.free();
		b.free();
	});

	it('distance > 0 for disjoint sets', () => {
		const a = FloatSet.in(`{${V1}}`);
		const b = FloatSet.in(`{${V3}}`);
		assert.ok(a.distance(b) > 0);
		a.free();
		b.free();
	});
});

// -------------------------------------------------------------------------
// SET OPERATIONS
// -------------------------------------------------------------------------

describe('FloatSet - Set operations', () => {
	it('union produces a set containing all values', () => {
		const a = FloatSet.in(`{${V1}, ${V2}}`);
		const b = FloatSet.in(`{${V3}, ${V4}}`);
		const u = a.union(b);
		assert.equal(u!.numValues(), 4);
		a.free();
		b.free();
		u!.free();
	});

	it('intersection returns shared values', () => {
		const a = FloatSet.in(`{${V1}, ${V2}, ${V3}}`);
		const b = FloatSet.in(`{${V2}, ${V3}, ${V4}}`);
		const r = a.intersection(b);
		assert.ok(r !== null);
		assert.equal(r!.numValues(), 2);
		a.free();
		b.free();
		r!.free();
	});

	it('intersection returns null for disjoint sets', () => {
		const a = FloatSet.in(`{${V1}, ${V2}}`);
		const b = FloatSet.in(`{${V3}, ${V4}}`);
		assert.equal(a.intersection(b), null);
		a.free();
		b.free();
	});

	it('minus removes values present in other', () => {
		const a = FloatSet.in(`{${V1}, ${V2}, ${V3}}`);
		const b = FloatSet.in(`{${V2}}`);
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

describe('FloatSet - Comparisons', () => {
	it('eq: same set', () => {
		const a = FloatSet.in(`{${V1}, ${V2}}`);
		const b = FloatSet.in(`{${V1}, ${V2}}`);
		assert.equal(a.eq(b), true);
		a.free();
		b.free();
	});

	it('ne: different sets', () => {
		const a = FloatSet.in(`{${V1}, ${V2}}`);
		const b = FloatSet.in(`{${V1}, ${V3}}`);
		assert.equal(a.ne(b), true);
		a.free();
		b.free();
	});

	it('lt / gt order', () => {
		const a = FloatSet.in(`{${V1}}`);
		const b = FloatSet.in(`{${V3}}`);
		assert.equal(a.lt(b), true);
		assert.equal(b.gt(a), true);
		a.free();
		b.free();
	});

	it('le / ge for equal sets', () => {
		const a = FloatSet.in(`{${V1}, ${V2}}`);
		const b = FloatSet.in(`{${V1}, ${V2}}`);
		assert.equal(a.le(b), true);
		assert.equal(a.ge(b), true);
		a.free();
		b.free();
	});
});

// -------------------------------------------------------------------------
// MATH METHODS
// -------------------------------------------------------------------------

describe('FloatSet - Math methods', () => {
	it('ceil rounds values up', () => {
		const s = FloatSet.in('{1.2, 4.7}');
		const c = s.ceil();
		assert.ok(Math.abs(c.startValue() - 2.0) < 1e-9);
		assert.ok(Math.abs(c.endValue() - 5.0) < 1e-9);
		s.free();
		c.free();
	});

	it('floor rounds values down', () => {
		const s = FloatSet.in('{1.7, 4.2}');
		const f = s.floor();
		assert.ok(Math.abs(f.startValue() - 1.0) < 1e-9);
		assert.ok(Math.abs(f.endValue() - 4.0) < 1e-9);
		s.free();
		f.free();
	});

	it('radians and degrees are inverse', () => {
		const s = FloatSet.in(`{${V1}, ${V2}}`);
		const rad = s.radians();
		const back = rad.degrees();
		assert.ok(Math.abs(back.startValue() - V1) < 1e-9);
		assert.ok(Math.abs(back.endValue() - V2) < 1e-9);
		s.free();
		rad.free();
		back.free();
	});

	it('shiftScale shifts values forward', () => {
		const s = FloatSet.in(`{${V1}}`);
		const shifted = s.shiftScale(1.0, 0, true, false);
		assert.ok(Math.abs(shifted.startValue() - (V1 + 1.0)) < 1e-9);
		s.free();
		shifted.free();
	});
});
