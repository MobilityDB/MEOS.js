import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import { initMeos } from '../../../../core/runtime/meos';
import { DateSpan } from '../../../../core/types/collections/time/DateSpan';

before(async () => {
	await initMeos();
});

const D0 = 0; // 2000-01-01
const D10 = 10; // 2000-01-11
const D20 = 20; // 2000-01-21
const D30 = 30; // 2000-01-31

describe('DateSpan - Construction', () => {
	it('fromString returns a non-zero pointer', () => {
		const s = DateSpan.fromString('[2000-01-01, 2000-01-11)');
		assert.ok(s.inner !== 0);
		s.free();
	});

	it('toString round-trips WKT', () => {
		const s = DateSpan.fromString('[2000-01-01, 2000-01-11)');
		assert.equal(s.toString(), '[2000-01-01, 2000-01-11)');
		s.free();
	});

	it('fromBounds constructs valid span', () => {
		const s = DateSpan.fromBounds(D0, D10);
		assert.equal(s.lower(), D0);
		assert.equal(s.upper(), D10);
		s.free();
	});

	it('fromHexWKB round-trips through asHexWKB', () => {
		const s1 = DateSpan.fromString('[2000-01-01, 2000-01-11)');
		const hex = s1.asHexWKB();
		assert.ok(typeof hex === 'string' && hex.length > 0);
		const s2 = DateSpan.fromHexWKB(hex);
		assert.equal(s2.toString(), s1.toString());
		s1.free();
		s2.free();
	});

	it('copy produces a distinct pointer with same bounds', () => {
		const s = DateSpan.fromString('[2000-01-01, 2000-01-11)');
		const c = s.copy();
		assert.notEqual(s.inner, c.inner);
		assert.equal(c.lower(), s.lower());
		s.free();
		c.free();
	});
});

describe('DateSpan - Accessors', () => {
	it('lower and upper return DateADT values', () => {
		const s = DateSpan.fromBounds(D0, D10);
		assert.equal(s.lower(), D0);
		assert.equal(s.upper(), D10);
		s.free();
	});

	it('lowerInc / upperInc match brackets', () => {
		const s = DateSpan.fromString('[2000-01-01, 2000-01-11)');
		assert.equal(s.lowerInc(), true);
		assert.equal(s.upperInc(), false);
		s.free();
	});

	it('durationDays returns correct day count', () => {
		const s = DateSpan.fromBounds(D0, D10);
		assert.equal(s.durationDays(), 10);
		s.free();
	});

	it('hash returns a number', () => {
		const s = DateSpan.fromString('[2000-01-01, 2000-01-11)');
		assert.equal(typeof s.hash(), 'number');
		s.free();
	});
});

describe('DateSpan - Conversions', () => {
	it('toTsTzSpan returns a non-zero pointer', () => {
		const s = DateSpan.fromString('[2000-01-01, 2000-01-11)');
		const ptr = s.toTsTzSpan();
		assert.ok(ptr !== 0);
		s.free();
	});

	it('toSpanSet returns a non-zero pointer', () => {
		const s = DateSpan.fromString('[2000-01-01, 2000-01-11)');
		const ptr = s.toSpanSet();
		assert.ok(ptr !== 0);
		s.free();
	});
});

describe('DateSpan - Topological predicates', () => {
	it('isAdjacent: adjacent date spans', () => {
		const a = DateSpan.fromBounds(D0, D10);
		const b = DateSpan.fromBounds(D10, D20);
		assert.equal(a.isAdjacent(b), true);
		a.free();
		b.free();
	});

	it('isAdjacent: non-adjacent date spans', () => {
		const a = DateSpan.fromBounds(D0, D10);
		const b = DateSpan.fromBounds(D20, D30);
		assert.equal(a.isAdjacent(b), false);
		a.free();
		b.free();
	});

	it('isContainedIn', () => {
		const a = DateSpan.fromBounds(D10, D20);
		const b = DateSpan.fromBounds(D0, D30);
		assert.equal(a.isContainedIn(b), true);
		a.free();
		b.free();
	});

	it('contains', () => {
		const a = DateSpan.fromBounds(D0, D30);
		const b = DateSpan.fromBounds(D10, D20);
		assert.equal(a.contains(b), true);
		a.free();
		b.free();
	});

	it('overlaps: overlapping date spans', () => {
		const a = DateSpan.fromBounds(D0, D20);
		const b = DateSpan.fromBounds(D10, D30);
		assert.equal(a.overlaps(b), true);
		a.free();
		b.free();
	});

	it('overlaps: disjoint date spans', () => {
		const a = DateSpan.fromBounds(D0, D10);
		const b = DateSpan.fromBounds(D20, D30);
		assert.equal(a.overlaps(b), false);
		a.free();
		b.free();
	});
});

describe('DateSpan - Position predicates', () => {
	it('isBefore', () => {
		const a = DateSpan.fromBounds(D0, D10);
		const b = DateSpan.fromBounds(D20, D30);
		assert.equal(a.isBefore(b), true);
		a.free();
		b.free();
	});

	it('isAfter', () => {
		const a = DateSpan.fromBounds(D20, D30);
		const b = DateSpan.fromBounds(D0, D10);
		assert.equal(a.isAfter(b), true);
		a.free();
		b.free();
	});
});

describe('DateSpan - Distance', () => {
	it('distance is 0 for overlapping spans', () => {
		const a = DateSpan.fromBounds(D0, D20);
		const b = DateSpan.fromBounds(D10, D30);
		assert.equal(a.distance(b), 0);
		a.free();
		b.free();
	});

	it('distance between disjoint spans', () => {
		const a = DateSpan.fromBounds(D0, D10);
		const b = DateSpan.fromBounds(D20, D30);
		assert.equal(a.distance(b), 11); // [0,10)→[0,9] inclusive; gap to [20,30)→[20,29] = 20-9=11
		a.free();
		b.free();
	});
});

describe('DateSpan - Set operations', () => {
	it('intersection returns overlapping region', () => {
		const a = DateSpan.fromBounds(D0, D20);
		const b = DateSpan.fromBounds(D10, D30);
		const r = a.intersection(b);
		assert.ok(r !== null);
		assert.equal(r!.lower(), D10);
		assert.equal(r!.upper(), D20);
		a.free();
		b.free();
		r!.free();
	});

	it('intersection returns null for disjoint spans', () => {
		const a = DateSpan.fromBounds(D0, D10);
		const b = DateSpan.fromBounds(D20, D30);
		assert.equal(a.intersection(b), null);
		a.free();
		b.free();
	});
});

describe('DateSpan - Comparisons', () => {
	it('eq: same span', () => {
		const a = DateSpan.fromBounds(D0, D10);
		const b = DateSpan.fromBounds(D0, D10);
		assert.equal(a.eq(b), true);
		a.free();
		b.free();
	});

	it('ne: different spans', () => {
		const a = DateSpan.fromBounds(D0, D10);
		const b = DateSpan.fromBounds(D10, D20);
		assert.equal(a.ne(b), true);
		a.free();
		b.free();
	});

	it('lt / gt order', () => {
		const a = DateSpan.fromBounds(D0, D10);
		const b = DateSpan.fromBounds(D10, D20);
		assert.equal(a.lt(b), true);
		assert.equal(b.gt(a), true);
		a.free();
		b.free();
	});
});

describe('DateSpan - shiftScale', () => {
	it('shift only: lower moves by shift days', () => {
		const s = DateSpan.fromBounds(D0, D10);  // [2000-01-01, 2000-01-11)
		const r = s.shiftScale(10, 0, true, false);
		assert.equal(r.lower(), 10);  // D10
		assert.equal(r.upper(), 20);  // D20
		s.free();
		r.free();
	});

	it('scale only: width is adjusted', () => {
		const s = DateSpan.fromBounds(D0, D10);
		const r = s.shiftScale(0, 20, false, true);
		assert.equal(r.lower(), D0);
		assert.equal(r.upper(), 21);
		s.free();
		r.free();
	});

	it('shift and scale together', () => {
		const s = DateSpan.fromBounds(D0, D10);
		const r = s.shiftScale(10, 20, true, true);
		assert.equal(r.lower(), 10);
		assert.equal(r.upper(), 31);
		s.free();
		r.free();
	});
});
