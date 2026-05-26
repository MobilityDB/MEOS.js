import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import { initMeos } from '../../../../core/runtime/meos';
import { IntSpan } from '../../../../core/types/collections/number/IntSpan';
import { IntSpanSet } from '../../../../core/types/collections/number/IntSpanSet';

before(async () => {
	await initMeos();
});

// Two disjoint spans: [1, 5) and [8, 12)
const WKT_AB = '{[1, 5), [8, 12)}';

// -------------------------------------------------------------------------
// CONSTRUCTION & OUTPUT
// -------------------------------------------------------------------------

describe('IntSpanSet - Construction', () => {
	it('fromString returns a non-zero pointer', () => {
		const ss = IntSpanSet.fromString(WKT_AB);
		assert.ok(ss.inner !== 0);
		ss.free();
	});

	it('toString round-trips WKT', () => {
		const ss = IntSpanSet.fromString(WKT_AB);
		assert.equal(ss.toString(), WKT_AB);
		ss.free();
	});

	it('fromHexWKB round-trips through asHexWKB', () => {
		const ss1 = IntSpanSet.fromString(WKT_AB);
		const hex = ss1.asHexWKB();
		assert.ok(typeof hex === 'string' && hex.length > 0);
		const ss2 = IntSpanSet.fromHexWKB(hex);
		assert.equal(ss2.toString(), ss1.toString());
		ss1.free();
		ss2.free();
	});

	it('fromSpan wraps a single IntSpan', () => {
		const s = IntSpan.fromBounds(1, 8);
		const ss = IntSpanSet.fromSpan(s);
		assert.equal(ss.numSpans(), 1);
		assert.equal(ss.lower(), 1);
		assert.equal(ss.upper(), 8);
		s.free();
		ss.free();
	});

	it('copy produces a distinct pointer with identical WKT', () => {
		const ss = IntSpanSet.fromString(WKT_AB);
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

describe('IntSpanSet - Accessors', () => {
	let ss: IntSpanSet; // {[1,5), [8,12)}

	before(() => {
		ss = IntSpanSet.fromString(WKT_AB);
	});

	it('numSpans() = 2', () => {
		assert.equal(ss.numSpans(), 2);
	});

	it('lower() = 1', () => {
		assert.equal(ss.lower(), 1);
	});

	it('upper() = 12', () => {
		assert.equal(ss.upper(), 12);
	});

	it('lower() < upper()', () => {
		assert.ok(ss.lower() < ss.upper());
	});

	it('lowerInc() = true for [ lower bound', () => {
		assert.equal(ss.lowerInc(), true);
	});

	it('upperInc() = false for ) upper bound', () => {
		assert.equal(ss.upperInc(), false);
	});

	it('width(false) = sum of span widths (4 + 4 = 8)', () => {
		assert.equal(ss.width(false), 8);
	});

	it('width(true) = bounding span width (12 - 1 = 11)', () => {
		assert.equal(ss.width(true), 11);
	});

	it('startSpan() matches first span WKT', () => {
		const sp = ss.startSpan();
		assert.equal(sp.toString(), '[1, 5)');
		sp.free();
	});

	it('endSpan() matches last span WKT', () => {
		const sp = ss.endSpan();
		assert.equal(sp.toString(), '[8, 12)');
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

	it('boundingSpan() covers [1, 12)', () => {
		const bounding = ss.boundingSpan();
		assert.equal(bounding.lower(), 1);
		assert.equal(bounding.upper(), 12);
		bounding.free();
	});

	it('hash() returns a number', () => {
		assert.equal(typeof ss.hash(), 'number');
	});
});

// -------------------------------------------------------------------------
// TOPOLOGICAL PREDICATES
// -------------------------------------------------------------------------

describe('IntSpanSet - Topological predicates', () => {
	let ss1: IntSpanSet; // {[1,5), [8,12)}
	let ss2: IntSpanSet; // {[12,16)}
	let ss_big: IntSpanSet; // {[1,16)}
	let s_overlap: IntSpan; // [1,8)

	before(() => {
		ss1 = IntSpanSet.fromString(WKT_AB);
		ss2 = IntSpanSet.fromString('{[12, 16)}');
		ss_big = IntSpanSet.fromString('{[1, 16)}');
		s_overlap = IntSpan.fromBounds(1, 8);
	});

	it('isAdjacent(IntSpanSet): {[1,5),[8,12)} adj {[12,16)} = true', () => {
		assert.equal(ss1.isAdjacent(ss2), true);
	});

	it('isAdjacent(IntSpan): {[1,5),[8,12)} adj [12,16) = true', () => {
		const s = IntSpan.fromBounds(12, 16);
		assert.equal(ss1.isAdjacent(s), true);
		s.free();
	});

	it('isContainedIn(IntSpanSet): ss1 in ss_big = true', () => {
		assert.equal(ss1.isContainedIn(ss_big), true);
	});

	it('isContainedIn(IntSpan): ss1 in [1,16) = true', () => {
		const s = IntSpan.fromBounds(1, 16);
		assert.equal(ss1.isContainedIn(s), true);
		s.free();
	});

	it('contains(IntSpanSet): ss_big contains ss1 = true', () => {
		assert.equal(ss_big.contains(ss1), true);
	});

	it('contains(IntSpan): ss_big contains [5,8) = true', () => {
		const s = IntSpan.fromBounds(5, 8);
		assert.equal(ss_big.contains(s), true);
		s.free();
	});

	it('overlaps(IntSpanSet): ss1 overlaps ss_big = true', () => {
		assert.equal(ss1.overlaps(ss_big), true);
	});

	it('overlaps(IntSpan): ss1 overlaps [1,8) = true', () => {
		assert.equal(ss1.overlaps(s_overlap), true);
	});

	it('overlaps: ss1 does not overlap ss2', () => {
		assert.equal(ss1.overlaps(ss2), false);
	});
});

// -------------------------------------------------------------------------
// POSITION PREDICATES
// -------------------------------------------------------------------------

describe('IntSpanSet - Position predicates', () => {
	let ss1: IntSpanSet; // {[1,5)}
	let ss2: IntSpanSet; // {[8,12)}

	before(() => {
		ss1 = IntSpanSet.fromString('{[1, 5)}');
		ss2 = IntSpanSet.fromString('{[8, 12)}');
	});

	it('isBefore(IntSpanSet): ss1 before ss2 = true', () => {
		assert.equal(ss1.isBefore(ss2), true);
	});

	it('isBefore(IntSpan): ss1 before [8,12) = true', () => {
		const s = IntSpan.fromBounds(8, 12);
		assert.equal(ss1.isBefore(s), true);
		s.free();
	});

	it('isAfter(IntSpanSet): ss2 after ss1 = true', () => {
		assert.equal(ss2.isAfter(ss1), true);
	});

	it('isAfter(IntSpan): ss2 after [1,5) = true', () => {
		const s = IntSpan.fromBounds(1, 5);
		assert.equal(ss2.isAfter(s), true);
		s.free();
	});

	it('isOverOrBefore(IntSpanSet)', () => {
		assert.equal(ss1.isOverOrBefore(ss2), true);
	});

	it('isOverOrAfter(IntSpanSet)', () => {
		assert.equal(ss2.isOverOrAfter(ss1), true);
	});
});

// -------------------------------------------------------------------------
// DISTANCE
// -------------------------------------------------------------------------

describe('IntSpanSet - Distance', () => {
	it('distance(IntSpanSet): overlapping = 0', () => {
		const ss1 = IntSpanSet.fromString('{[1, 8)}');
		const ss2 = IntSpanSet.fromString('{[4, 12)}');
		assert.equal(ss1.distance(ss2), 0);
		ss1.free();
		ss2.free();
	});

	it('distance(IntSpanSet): disjoint = gap between spans', () => {
		// [1,5) ends at 4 inclusive; [8,12) starts at 8 → gap = 8-4=4
		const ss1 = IntSpanSet.fromString('{[1, 5)}');
		const ss2 = IntSpanSet.fromString('{[8, 12)}');
		assert.equal(ss1.distance(ss2), 4);
		ss1.free();
		ss2.free();
	});

	it('distance(IntSpan): overlapping = 0', () => {
		const ss = IntSpanSet.fromString('{[1, 8)}');
		const s = IntSpan.fromBounds(4, 12);
		assert.equal(ss.distance(s), 0);
		ss.free();
		s.free();
	});

	it('distance(IntSpan): disjoint > 0', () => {
		const ss = IntSpanSet.fromString('{[1, 5)}');
		const s = IntSpan.fromBounds(8, 12);
		assert.ok(ss.distance(s) > 0);
		ss.free();
		s.free();
	});
});

// -------------------------------------------------------------------------
// SET OPERATIONS
// -------------------------------------------------------------------------

describe('IntSpanSet - Set operations', () => {
	it('intersection(IntSpanSet): overlapping = non-null with correct bounds', () => {
		const ss1 = IntSpanSet.fromString('{[1, 8)}');
		const ss2 = IntSpanSet.fromString('{[4, 12)}');
		const inter = ss1.intersection(ss2);
		assert.ok(inter !== null);
		assert.equal(inter!.lower(), 4);
		assert.equal(inter!.upper(), 8);
		inter!.free();
		ss1.free();
		ss2.free();
	});

	it('intersection(IntSpanSet): disjoint = null', () => {
		const ss1 = IntSpanSet.fromString('{[1, 5)}');
		const ss2 = IntSpanSet.fromString('{[8, 12)}');
		const inter = ss1.intersection(ss2);
		assert.equal(inter, null);
		ss1.free();
		ss2.free();
	});

	it('intersection(IntSpan): overlapping = non-null with correct bounds', () => {
		const ss = IntSpanSet.fromString('{[1, 8)}');
		const s = IntSpan.fromBounds(4, 12);
		const inter = ss.intersection(s);
		assert.ok(inter !== null);
		assert.equal(inter!.lower(), 4);
		assert.equal(inter!.upper(), 8);
		inter!.free();
		ss.free();
		s.free();
	});

	it('minus(IntSpanSet): returns non-null when result is non-empty', () => {
		const ss1 = IntSpanSet.fromString(WKT_AB); // {[1,5),[8,12)}
		const ss2 = IntSpanSet.fromString('{[1, 5)}');
		const diff = ss1.minus(ss2);
		assert.ok(diff !== null);
		assert.equal(diff!.numSpans(), 1);
		assert.equal(diff!.lower(), 8);
		diff!.free();
		ss1.free();
		ss2.free();
	});

	it('minus(IntSpanSet): returns null when result is empty', () => {
		const ss1 = IntSpanSet.fromString('{[1, 5)}');
		const ss2 = IntSpanSet.fromString('{[0, 6)}');
		const diff = ss1.minus(ss2);
		assert.equal(diff, null);
		ss1.free();
		ss2.free();
	});

	it('minus(IntSpan): removes overlapping part', () => {
		const ss = IntSpanSet.fromString(WKT_AB);
		const s = IntSpan.fromBounds(1, 5);
		const diff = ss.minus(s);
		assert.ok(diff !== null);
		assert.equal(diff!.numSpans(), 1);
		assert.equal(diff!.lower(), 8);
		diff!.free();
		ss.free();
		s.free();
	});

	it('union(IntSpanSet): merges disjoint spansets', () => {
		const ss1 = IntSpanSet.fromString('{[1, 5)}');
		const ss2 = IntSpanSet.fromString('{[8, 12)}');
		const u = ss1.union(ss2);
		assert.equal(u.toString(), WKT_AB);
		u.free();
		ss1.free();
		ss2.free();
	});

	it('union(IntSpan): merges span into spanset', () => {
		const ss = IntSpanSet.fromString('{[1, 5)}');
		const s = IntSpan.fromBounds(8, 12);
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

describe('IntSpanSet - Comparisons', () => {
	let ss1: IntSpanSet;
	let ss1b: IntSpanSet;
	let ss2: IntSpanSet;

	before(() => {
		ss1 = IntSpanSet.fromString('{[1, 5)}');
		ss1b = IntSpanSet.fromString('{[1, 5)}');
		ss2 = IntSpanSet.fromString('{[8, 12)}');
	});

	it('eq: same spanset = true', () => assert.equal(ss1.eq(ss1b), true));
	it('ne: different spansets = true', () => assert.equal(ss1.ne(ss2), true));
	it('lt: {[1,5)} < {[8,12)} = true', () => assert.equal(ss1.lt(ss2), true));
	it('le: equal spansets = true', () => assert.equal(ss1.le(ss1b), true));
	it('gt: {[8,12)} > {[1,5)} = true', () => assert.equal(ss2.gt(ss1), true));
	it('ge: equal spansets = true', () => assert.equal(ss1.ge(ss1b), true));
});

// -------------------------------------------------------------------------
// MATH METHODS
// -------------------------------------------------------------------------

describe('IntSpanSet - Math methods', () => {
	it('shiftScale shifts spanset forward', () => {
		const ss = IntSpanSet.fromString('{[1, 5)}');
		const shifted = ss.shiftScale(2, 0, true, false);
		assert.equal(shifted.lower(), 3);
		assert.equal(shifted.upper(), 7);
		ss.free();
		shifted.free();
	});

	it('toFloatSpanSet returns a non-zero pointer', () => {
		const ss = IntSpanSet.fromString(WKT_AB);
		assert.ok(ss.toFloatSpanSet() !== 0);
		ss.free();
	});
});
