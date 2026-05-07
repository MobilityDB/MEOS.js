import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import { initMeos } from '../../../core/runtime/meos';
import { DateSpan } from '../../../core/types/time/DateSpan';
import { DateSpanSet } from '../../../core/types/time/DateSpanSet';

before(async () => {
	await initMeos();
});

// D0=0 (2000-01-01), D10=10 (2000-01-11), D20=20 (2000-01-21), D30=30 (2000-01-31)
const WKT_AB = '{[2000-01-01, 2000-01-11), [2000-01-21, 2000-01-31)}';
const WKT_SINGLE = '{[2000-01-01, 2000-01-21)}';

// -------------------------------------------------------------------------
// CONSTRUCTION & OUTPUT
// -------------------------------------------------------------------------

describe('DateSpanSet - Construction', () => {
	it('fromString returns a non-zero pointer', () => {
		const ss = DateSpanSet.fromString(WKT_AB);
		assert.ok(ss.inner !== 0);
		ss.free();
	});

	it('toString round-trips WKT', () => {
		const ss = DateSpanSet.fromString(WKT_AB);
		assert.equal(ss.toString(), WKT_AB);
		ss.free();
	});

	it('fromHexWKB round-trips through asHexWKB', () => {
		const ss1 = DateSpanSet.fromString(WKT_AB);
		const hex = ss1.asHexWKB();
		assert.ok(typeof hex === 'string' && hex.length > 0);
		const ss2 = DateSpanSet.fromHexWKB(hex);
		assert.equal(ss2.toString(), ss1.toString());
		ss1.free();
		ss2.free();
	});

	it('fromSpan wraps a single DateSpan', () => {
		const s = DateSpan.fromString('[2000-01-01, 2000-01-21)');
		const ss = DateSpanSet.fromSpan(s);
		assert.equal(ss.numSpans(), 1);
		assert.equal(ss.toString(), WKT_SINGLE);
		s.free();
		ss.free();
	});

	it('copy produces a distinct pointer with identical WKT', () => {
		const ss = DateSpanSet.fromString(WKT_AB);
		const c = ss.copy();
		assert.ok(c.inner !== 0);
		assert.notEqual(c.inner, ss.inner);
		assert.equal(c.toString(), ss.toString());
		ss.free();
		c.free();
	});
});

// -------------------------------------------------------------------------
// ACCESSORS
// -------------------------------------------------------------------------

describe('DateSpanSet - Accessors', () => {
	let ss: DateSpanSet; // {[D0,D10), [D20,D30)}

	before(() => {
		ss = DateSpanSet.fromString(WKT_AB);
	});

	it('numSpans() = 2', () => {
		assert.equal(ss.numSpans(), 2);
	});

	it('numDates() > 0', () => {
		assert.ok(ss.numDates() > 0);
	});

	it('lower() < upper()', () => {
		assert.ok(ss.upper() > ss.lower());
	});

	it('lowerInc() = true for [ lower bound', () => {
		assert.equal(ss.lowerInc(), true);
	});

	it('upperInc() = false for ) upper bound', () => {
		assert.equal(ss.upperInc(), false);
	});

	it('startDate() equals lower()', () => {
		assert.equal(ss.startDate(), ss.lower());
	});

	it('endDate() equals upper()', () => {
		assert.equal(ss.endDate(), ss.upper());
	});

	it('dateN(0) equals startDate()', () => {
		assert.equal(ss.dateN(0), ss.startDate());
	});

	it('startSpan() matches first span WKT', () => {
		const sp = ss.startSpan();
		assert.equal(sp.toString(), '[2000-01-01, 2000-01-11)');
		sp.free();
	});

	it('endSpan() matches last span WKT', () => {
		const sp = ss.endSpan();
		assert.equal(sp.toString(), '[2000-01-21, 2000-01-31)');
		sp.free();
	});

	it('spanN(0) matches startSpan()', () => {
		const sp0 = ss.spanN(0);
		const start = ss.startSpan();
		assert.equal(sp0.toString(), start.toString());
		sp0.free();
		start.free();
	});

	it('spanN(1) matches endSpan()', () => {
		const sp1 = ss.spanN(1);
		const end = ss.endSpan();
		assert.equal(sp1.toString(), end.toString());
		sp1.free();
		end.free();
	});

	it('boundingSpan() covers all spans', () => {
		const bounding = ss.boundingSpan();
		assert.equal(bounding.toString(), '[2000-01-01, 2000-01-31)');
		bounding.free();
	});

	it('hash() returns a number', () => {
		assert.equal(typeof ss.hash(), 'number');
	});
});

// -------------------------------------------------------------------------
// TOPOLOGICAL PREDICATES
// -------------------------------------------------------------------------

describe('DateSpanSet - Topological predicates', () => {
	let ss1: DateSpanSet; // {[D0,D10), [D20,D30)}
	let ss2: DateSpanSet; // {[D30,D40)}
	let ss_big: DateSpanSet; // {[D0,D40)}
	let s_overlap: DateSpan; // [D0,D20)

	before(() => {
		ss1 = DateSpanSet.fromString(WKT_AB);
		ss2 = DateSpanSet.fromString('{[2000-01-31, 2000-02-10)}');
		ss_big = DateSpanSet.fromString('{[2000-01-01, 2000-02-10)}');
		s_overlap = DateSpan.fromString('[2000-01-01, 2000-01-21)');
	});

	it('isAdjacent(DateSpanSet): {[D0,D10),[D20,D30)} adj {[D30,...)} = true', () => {
		assert.equal(ss1.isAdjacent(ss2), true);
	});

	it('isAdjacent(DateSpan): {[D0,D10),[D20,D30)} adj [D30,...) = true', () => {
		const s = DateSpan.fromString('[2000-01-31, 2000-02-10)');
		assert.equal(ss1.isAdjacent(s), true);
		s.free();
	});

	it('isContainedIn(DateSpanSet): ss1 in ss_big = true', () => {
		assert.equal(ss1.isContainedIn(ss_big), true);
	});

	it('isContainedIn(DateSpan): ss1 in [D0,D40) = true', () => {
		const s = DateSpan.fromString('[2000-01-01, 2000-02-10)');
		assert.equal(ss1.isContainedIn(s), true);
		s.free();
	});

	it('contains(DateSpanSet): ss_big contains ss1 = true', () => {
		assert.equal(ss_big.contains(ss1), true);
	});

	it('contains(DateSpan): ss_big contains [D10,D20) = true', () => {
		const s = DateSpan.fromString('[2000-01-11, 2000-01-21)');
		assert.equal(ss_big.contains(s), true);
		s.free();
	});

	it('overlaps(DateSpanSet): ss1 overlaps ss_big = true', () => {
		assert.equal(ss1.overlaps(ss_big), true);
	});

	it('overlaps(DateSpan): ss1 overlaps [D0,D20) = true', () => {
		assert.equal(ss1.overlaps(s_overlap), true);
	});

	it('overlaps: ss1 does not overlap ss2', () => {
		assert.equal(ss1.overlaps(ss2), false);
	});
});

// -------------------------------------------------------------------------
// POSITION PREDICATES
// -------------------------------------------------------------------------

describe('DateSpanSet - Position predicates', () => {
	let ss1: DateSpanSet; // {[D0,D10)}
	let ss2: DateSpanSet; // {[D20,D30)}

	before(() => {
		ss1 = DateSpanSet.fromString('{[2000-01-01, 2000-01-11)}');
		ss2 = DateSpanSet.fromString('{[2000-01-21, 2000-01-31)}');
	});

	it('isBefore(DateSpanSet): ss1 before ss2 = true', () => {
		assert.equal(ss1.isBefore(ss2), true);
	});

	it('isBefore(DateSpan): ss1 before [D20,D30) = true', () => {
		const s = DateSpan.fromString('[2000-01-21, 2000-01-31)');
		assert.equal(ss1.isBefore(s), true);
		s.free();
	});

	it('isAfter(DateSpanSet): ss2 after ss1 = true', () => {
		assert.equal(ss2.isAfter(ss1), true);
	});

	it('isAfter(DateSpan): ss2 after [D0,D10) = true', () => {
		const s = DateSpan.fromString('[2000-01-01, 2000-01-11)');
		assert.equal(ss2.isAfter(s), true);
		s.free();
	});

	it('isOverOrBefore(DateSpanSet)', () => {
		assert.equal(ss1.isOverOrBefore(ss2), true);
	});

	it('isOverOrAfter(DateSpanSet)', () => {
		assert.equal(ss2.isOverOrAfter(ss1), true);
	});
});

// -------------------------------------------------------------------------
// DISTANCE
// -------------------------------------------------------------------------

describe('DateSpanSet - Distance', () => {
	it('distance(DateSpanSet): overlapping = 0', () => {
		const ss1 = DateSpanSet.fromString('{[2000-01-01, 2000-01-21)}');
		const ss2 = DateSpanSet.fromString('{[2000-01-11, 2000-01-31)}');
		assert.equal(ss1.distance(ss2), 0);
		ss1.free();
		ss2.free();
	});

	it('distance(DateSpanSet): disjoint > 0', () => {
		const ss1 = DateSpanSet.fromString('{[2000-01-01, 2000-01-11)}');
		const ss2 = DateSpanSet.fromString('{[2000-01-21, 2000-01-31)}');
		assert.ok(ss1.distance(ss2) > 0);
		ss1.free();
		ss2.free();
	});

	it('distance(DateSpan): overlapping = 0', () => {
		const ss = DateSpanSet.fromString('{[2000-01-01, 2000-01-21)}');
		const s = DateSpan.fromString('[2000-01-11, 2000-01-31)');
		assert.equal(ss.distance(s), 0);
		ss.free();
		s.free();
	});

	it('distance(DateSpan): disjoint > 0', () => {
		const ss = DateSpanSet.fromString('{[2000-01-01, 2000-01-11)}');
		const s = DateSpan.fromString('[2000-01-21, 2000-01-31)');
		assert.ok(ss.distance(s) > 0);
		ss.free();
		s.free();
	});
});

// -------------------------------------------------------------------------
// SET OPERATIONS
// -------------------------------------------------------------------------

describe('DateSpanSet - Set operations', () => {
	it('intersection(DateSpanSet): overlapping = non-null', () => {
		const ss1 = DateSpanSet.fromString('{[2000-01-01, 2000-01-21)}');
		const ss2 = DateSpanSet.fromString('{[2000-01-11, 2000-01-31)}');
		const inter = ss1.intersection(ss2);
		assert.ok(inter !== null);
		assert.equal(inter!.toString(), '{[2000-01-11, 2000-01-21)}');
		inter!.free();
		ss1.free();
		ss2.free();
	});

	it('intersection(DateSpanSet): disjoint = null', () => {
		const ss1 = DateSpanSet.fromString('{[2000-01-01, 2000-01-11)}');
		const ss2 = DateSpanSet.fromString('{[2000-01-21, 2000-01-31)}');
		const inter = ss1.intersection(ss2);
		assert.equal(inter, null);
		ss1.free();
		ss2.free();
	});

	it('intersection(DateSpan): overlapping = non-null', () => {
		const ss = DateSpanSet.fromString('{[2000-01-01, 2000-01-21)}');
		const s = DateSpan.fromString('[2000-01-11, 2000-01-31)');
		const inter = ss.intersection(s);
		assert.ok(inter !== null);
		assert.equal(inter!.toString(), '{[2000-01-11, 2000-01-21)}');
		inter!.free();
		ss.free();
		s.free();
	});

	it('minus(DateSpanSet): returns non-null when result is non-empty', () => {
		const ss1 = DateSpanSet.fromString(WKT_AB); // {[D0,D10),[D20,D30)}
		const ss2 = DateSpanSet.fromString('{[2000-01-01, 2000-01-11)}');
		const diff = ss1.minus(ss2);
		assert.ok(diff !== null);
		assert.equal(diff!.toString(), '{[2000-01-21, 2000-01-31)}');
		diff!.free();
		ss1.free();
		ss2.free();
	});

	it('minus(DateSpanSet): returns null when result is empty', () => {
		const ss1 = DateSpanSet.fromString('{[2000-01-01, 2000-01-11)}');
		const ss2 = DateSpanSet.fromString('{[2000-01-01, 2000-01-21)}');
		const diff = ss1.minus(ss2);
		assert.equal(diff, null);
		ss1.free();
		ss2.free();
	});

	it('minus(DateSpan): removes overlapping part', () => {
		const ss = DateSpanSet.fromString(WKT_AB);
		const s = DateSpan.fromString('[2000-01-01, 2000-01-11)');
		const diff = ss.minus(s);
		assert.ok(diff !== null);
		assert.equal(diff!.toString(), '{[2000-01-21, 2000-01-31)}');
		diff!.free();
		ss.free();
		s.free();
	});

	it('union(DateSpanSet): merges disjoint spansets', () => {
		const ss1 = DateSpanSet.fromString('{[2000-01-01, 2000-01-11)}');
		const ss2 = DateSpanSet.fromString('{[2000-01-21, 2000-01-31)}');
		const u = ss1.union(ss2);
		assert.equal(u.toString(), WKT_AB);
		u.free();
		ss1.free();
		ss2.free();
	});

	it('union(DateSpan): merges span into spanset', () => {
		const ss = DateSpanSet.fromString('{[2000-01-01, 2000-01-11)}');
		const s = DateSpan.fromString('[2000-01-21, 2000-01-31)');
		const u = ss.union(s);
		assert.equal(u.toString(), WKT_AB);
		u.free();
		ss.free();
		s.free();
	});
});

// -------------------------------------------------------------------------
// COMPARISONS
// -------------------------------------------------------------------------

describe('DateSpanSet - Comparisons', () => {
	let ss1: DateSpanSet;
	let ss1b: DateSpanSet;
	let ss2: DateSpanSet;

	before(() => {
		ss1 = DateSpanSet.fromString('{[2000-01-01, 2000-01-11)}');
		ss1b = DateSpanSet.fromString('{[2000-01-01, 2000-01-11)}');
		ss2 = DateSpanSet.fromString('{[2000-01-11, 2000-01-21)}');
	});

	it('eq: same spanset = true', () => assert.equal(ss1.eq(ss1b), true));
	it('ne: different spansets = true', () => assert.equal(ss1.ne(ss2), true));
	it('lt: {[D0,D10)} < {[D10,D20)} = true', () => assert.equal(ss1.lt(ss2), true));
	it('le: equal spansets = true', () => assert.equal(ss1.le(ss1b), true));
	it('gt: {[D10,D20)} > {[D0,D10)} = true', () => assert.equal(ss2.gt(ss1), true));
	it('ge: equal spansets = true', () => assert.equal(ss1.ge(ss1b), true));
});

// -------------------------------------------------------------------------
// CONVERSIONS & MATH
// -------------------------------------------------------------------------

describe('DateSpanSet - Conversions', () => {
	it('toTsTzSpanSet returns a non-zero pointer', () => {
		const ss = DateSpanSet.fromString(WKT_AB);
		assert.ok(ss.toTsTzSpanSet() !== 0);
		ss.free();
	});
});

describe('DateSpanSet - shiftScale', () => {
	it('shift by 10 days moves spanset forward', () => {
		const ss = DateSpanSet.fromString('{[2000-01-01, 2000-01-11)}');
		const shifted = ss.shiftScale(10, 0, true, false);
		assert.equal(shifted.toString(), '{[2000-01-11, 2000-01-21)}');
		ss.free();
		shifted.free();
	});
});
