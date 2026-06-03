import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import { initMeos } from '../../../../core/runtime/meos.js';
import { FloatSpan } from '../../../../core/types/collections/number/FloatSpan.js';
import { FloatSpanSet } from '../../../../core/types/collections/number/FloatSpanSet.js';

before(async () => {
	await initMeos();
});

// Two disjoint spans: [1, 4) and [7, 10)
const WKT_AB = '{[1, 4), [7, 10)}';

// Helper: return lower bound of the first span
function lower(ss: FloatSpanSet): number {
	const sp = ss.startSpan();
	const v = sp.lower();
	sp.free();
	return v;
}

// Helper: return upper bound of the last span
function upper(ss: FloatSpanSet): number {
	const sp = ss.endSpan();
	const v = sp.upper();
	sp.free();
	return v;
}

// -------------------------------------------------------------------------
// CONSTRUCTION & OUTPUT
// -------------------------------------------------------------------------

describe('FloatSpanSet - Construction', () => {
	it('fromString returns a non-zero pointer', () => {
		const ss = FloatSpanSet.fromString(WKT_AB);
		assert.ok(ss.inner !== 0);
		ss.free();
	});

	it('toString round-trips WKT', () => {
		const ss = FloatSpanSet.fromString(WKT_AB);
		const str = ss.toString();
		const ss2 = FloatSpanSet.fromString(str);
		assert.equal(ss2.toString(), str);
		ss.free();
		ss2.free();
	});

	it('fromHexWKB round-trips through asHexWKB', () => {
		const ss1 = FloatSpanSet.fromString(WKT_AB);
		const hex = ss1.asHexWKB();
		assert.ok(typeof hex === 'string' && hex.length > 0);
		const ss2 = FloatSpanSet.fromHexWKB(hex);
		assert.equal(ss2.toString(), ss1.toString());
		ss1.free();
		ss2.free();
	});

	it('fromSpan wraps a single FloatSpan', () => {
		const s = FloatSpan.fromBounds(1.0, 7.0);
		const ss = FloatSpanSet.fromSpan(s);
		assert.equal(ss.numSpans(), 1);
		assert.ok(Math.abs(lower(ss) - 1.0) < 1e-9);
		assert.ok(Math.abs(upper(ss) - 7.0) < 1e-9);
		s.free();
		ss.free();
	});

	it('copy produces a distinct pointer with identical WKT', () => {
		const ss = FloatSpanSet.fromString(WKT_AB);
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

describe('FloatSpanSet - Accessors', () => {
	let ss: FloatSpanSet; // {[1,4), [7,10)}

	before(() => {
		ss = FloatSpanSet.fromString(WKT_AB);
	});

	it('numSpans() = 2', () => {
		assert.equal(ss.numSpans(), 2);
	});

	it('startSpan().lower() = 1.0', () => {
		assert.ok(Math.abs(lower(ss) - 1.0) < 1e-9);
	});

	it('endSpan().upper() = 10.0', () => {
		assert.ok(Math.abs(upper(ss) - 10.0) < 1e-9);
	});

	it('lower() < upper() (ordering holds)', () => {
		assert.ok(ss.upper() > ss.lower());
	});

	it('lowerInc() = true for [ lower bound', () => {
		assert.equal(ss.lowerInc(), true);
	});

	it('upperInc() = false for ) upper bound', () => {
		assert.equal(ss.upperInc(), false);
	});

	it('width(false) = sum of span widths (3 + 3 = 6)', () => {
		assert.ok(Math.abs(ss.width(false) - 6.0) < 1e-9);
	});

	it('width(true) = bounding span width (10 - 1 = 9)', () => {
		assert.ok(Math.abs(ss.width(true) - 9.0) < 1e-9);
	});

	it('startSpan() lower = 1.0', () => {
		const sp = ss.startSpan();
		assert.ok(Math.abs(sp.lower() - 1.0) < 1e-9);
		sp.free();
	});

	it('endSpan() upper = 10.0', () => {
		const sp = ss.endSpan();
		assert.ok(Math.abs(sp.upper() - 10.0) < 1e-9);
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

	it('boundingSpan() covers [1.0, 10.0)', () => {
		const bounding = ss.boundingSpan();
		assert.ok(Math.abs(bounding.lower() - 1.0) < 1e-9);
		assert.ok(Math.abs(bounding.upper() - 10.0) < 1e-9);
		bounding.free();
	});

	it('hash() returns a number', () => {
		assert.equal(typeof ss.hash(), 'number');
	});
});

// -------------------------------------------------------------------------
// TOPOLOGICAL PREDICATES
// -------------------------------------------------------------------------

describe('FloatSpanSet - Topological predicates', () => {
	let ss1: FloatSpanSet; // {[1,4), [7,10)}
	let ss2: FloatSpanSet; // {[10,14)}
	let ss_big: FloatSpanSet; // {[1,14)}
	let s_overlap: FloatSpan; // [1,7)

	before(() => {
		ss1 = FloatSpanSet.fromString(WKT_AB);
		ss2 = FloatSpanSet.fromString('{[10, 14)}');
		ss_big = FloatSpanSet.fromString('{[1, 14)}');
		s_overlap = FloatSpan.fromBounds(1.0, 7.0);
	});

	it('isAdjacent(FloatSpanSet): {[1,4),[7,10)} adj {[10,14)} = true', () => {
		assert.equal(ss1.isAdjacent(ss2), true);
	});

	it('isAdjacent(FloatSpan): {[1,4),[7,10)} adj [10,14) = true', () => {
		const s = FloatSpan.fromBounds(10.0, 14.0);
		assert.equal(ss1.isAdjacent(s), true);
		s.free();
	});

	it('isContainedIn(FloatSpanSet): ss1 in ss_big = true', () => {
		assert.equal(ss1.isContainedIn(ss_big), true);
	});

	it('isContainedIn(FloatSpan): ss1 in [1,14) = true', () => {
		const s = FloatSpan.fromBounds(1.0, 14.0);
		assert.equal(ss1.isContainedIn(s), true);
		s.free();
	});

	it('contains(FloatSpanSet): ss_big contains ss1 = true', () => {
		assert.equal(ss_big.contains(ss1), true);
	});

	it('contains(FloatSpan): ss_big contains [4,7) = true', () => {
		const s = FloatSpan.fromBounds(4.0, 7.0);
		assert.equal(ss_big.contains(s), true);
		s.free();
	});

	it('overlaps(FloatSpanSet): ss1 overlaps ss_big = true', () => {
		assert.equal(ss1.overlaps(ss_big), true);
	});

	it('overlaps(FloatSpan): ss1 overlaps [1,7) = true', () => {
		assert.equal(ss1.overlaps(s_overlap), true);
	});

	it('overlaps: ss1 does not overlap ss2', () => {
		assert.equal(ss1.overlaps(ss2), false);
	});
});

// -------------------------------------------------------------------------
// POSITION PREDICATES
// -------------------------------------------------------------------------

describe('FloatSpanSet - Position predicates', () => {
	let ss1: FloatSpanSet; // {[1,4)}
	let ss2: FloatSpanSet; // {[7,10)}

	before(() => {
		ss1 = FloatSpanSet.fromString('{[1, 4)}');
		ss2 = FloatSpanSet.fromString('{[7, 10)}');
	});

	it('isBefore(FloatSpanSet): ss1 before ss2 = true', () => {
		assert.equal(ss1.isBefore(ss2), true);
	});

	it('isBefore(FloatSpan): ss1 before [7,10) = true', () => {
		const s = FloatSpan.fromBounds(7.0, 10.0);
		assert.equal(ss1.isBefore(s), true);
		s.free();
	});

	it('isAfter(FloatSpanSet): ss2 after ss1 = true', () => {
		assert.equal(ss2.isAfter(ss1), true);
	});

	it('isAfter(FloatSpan): ss2 after [1,4) = true', () => {
		const s = FloatSpan.fromBounds(1.0, 4.0);
		assert.equal(ss2.isAfter(s), true);
		s.free();
	});

	it('isOverOrBefore(FloatSpanSet)', () => {
		assert.equal(ss1.isOverOrBefore(ss2), true);
	});

	it('isOverOrAfter(FloatSpanSet)', () => {
		assert.equal(ss2.isOverOrAfter(ss1), true);
	});
});

// -------------------------------------------------------------------------
// DISTANCE
// -------------------------------------------------------------------------

describe('FloatSpanSet - Distance', () => {
	it('distance(FloatSpanSet): overlapping = 0', () => {
		const ss1 = FloatSpanSet.fromString('{[1, 7)}');
		const ss2 = FloatSpanSet.fromString('{[4, 10)}');
		assert.equal(ss1.distance(ss2), 0);
		ss1.free();
		ss2.free();
	});

	it('distance(FloatSpanSet): disjoint > 0', () => {
		const ss1 = FloatSpanSet.fromString('{[1, 4)}');
		const ss2 = FloatSpanSet.fromString('{[7, 10)}');
		assert.ok(ss1.distance(ss2) > 0);
		ss1.free();
		ss2.free();
	});

	it('distance(FloatSpan): overlapping = 0', () => {
		const ss = FloatSpanSet.fromString('{[1, 7)}');
		const s = FloatSpan.fromBounds(4.0, 10.0);
		assert.equal(ss.distance(s), 0);
		ss.free();
		s.free();
	});

	it('distance(FloatSpan): disjoint > 0', () => {
		const ss = FloatSpanSet.fromString('{[1, 4)}');
		const s = FloatSpan.fromBounds(7.0, 10.0);
		assert.ok(ss.distance(s) > 0);
		ss.free();
		s.free();
	});
});

// -------------------------------------------------------------------------
// SET OPERATIONS
// -------------------------------------------------------------------------

describe('FloatSpanSet - Set operations', () => {
	it('intersection(FloatSpanSet): overlapping = non-null with correct bounds', () => {
		const ss1 = FloatSpanSet.fromString('{[1, 7)}');
		const ss2 = FloatSpanSet.fromString('{[4, 10)}');
		const inter = ss1.intersection(ss2);
		assert.ok(inter !== null);
		assert.ok(Math.abs(lower(inter!) - 4.0) < 1e-9);
		assert.ok(Math.abs(upper(inter!) - 7.0) < 1e-9);
		inter!.free();
		ss1.free();
		ss2.free();
	});

	it('intersection(FloatSpanSet): disjoint = null', () => {
		const ss1 = FloatSpanSet.fromString('{[1, 4)}');
		const ss2 = FloatSpanSet.fromString('{[7, 10)}');
		const inter = ss1.intersection(ss2);
		assert.equal(inter, null);
		ss1.free();
		ss2.free();
	});

	it('intersection(FloatSpan): overlapping = non-null with correct bounds', () => {
		const ss = FloatSpanSet.fromString('{[1, 7)}');
		const s = FloatSpan.fromBounds(4.0, 10.0);
		const inter = ss.intersection(s);
		assert.ok(inter !== null);
		assert.ok(Math.abs(lower(inter!) - 4.0) < 1e-9);
		assert.ok(Math.abs(upper(inter!) - 7.0) < 1e-9);
		inter!.free();
		ss.free();
		s.free();
	});

	it('minus(FloatSpanSet): returns non-null when result is non-empty', () => {
		const ss1 = FloatSpanSet.fromString(WKT_AB); // {[1,4),[7,10)}
		const ss2 = FloatSpanSet.fromString('{[1, 4)}');
		const diff = ss1.minus(ss2);
		assert.ok(diff !== null);
		assert.equal(diff!.numSpans(), 1);
		assert.ok(Math.abs(lower(diff!) - 7.0) < 1e-9);
		diff!.free();
		ss1.free();
		ss2.free();
	});

	it('minus(FloatSpanSet): returns null when result is empty', () => {
		const ss1 = FloatSpanSet.fromString('{[1, 4)}');
		const ss2 = FloatSpanSet.fromString('{[0, 5)}');
		const diff = ss1.minus(ss2);
		assert.equal(diff, null);
		ss1.free();
		ss2.free();
	});

	it('minus(FloatSpan): removes overlapping part', () => {
		const ss = FloatSpanSet.fromString(WKT_AB);
		const s = FloatSpan.fromBounds(1.0, 4.0);
		const diff = ss.minus(s);
		assert.ok(diff !== null);
		assert.equal(diff!.numSpans(), 1);
		assert.ok(Math.abs(lower(diff!) - 7.0) < 1e-9);
		diff!.free();
		ss.free();
		s.free();
	});

	it('union(FloatSpanSet): merges disjoint spansets', () => {
		const ss1 = FloatSpanSet.fromString('{[1, 4)}');
		const ss2 = FloatSpanSet.fromString('{[7, 10)}');
		const u = ss1.union(ss2);
		assert.equal(u.numSpans(), 2);
		assert.ok(Math.abs(lower(u) - 1.0) < 1e-9);
		assert.ok(Math.abs(upper(u) - 10.0) < 1e-9);
		u.free();
		ss1.free();
		ss2.free();
	});

	it('union(FloatSpan): merges span into spanset', () => {
		const ss = FloatSpanSet.fromString('{[1, 4)}');
		const s = FloatSpan.fromBounds(7.0, 10.0);
		const u = ss.union(s);
		assert.equal(u.numSpans(), 2);
		assert.ok(Math.abs(lower(u) - 1.0) < 1e-9);
		assert.ok(Math.abs(upper(u) - 10.0) < 1e-9);
		u.free();
		ss.free();
		s.free();
	});
});

// -------------------------------------------------------------------------
// COMPARISONS
// -------------------------------------------------------------------------

describe('FloatSpanSet - Comparisons', () => {
	let ss1: FloatSpanSet;
	let ss1b: FloatSpanSet;
	let ss2: FloatSpanSet;

	before(() => {
		ss1 = FloatSpanSet.fromString('{[1, 4)}');
		ss1b = FloatSpanSet.fromString('{[1, 4)}');
		ss2 = FloatSpanSet.fromString('{[7, 10)}');
	});

	it('eq: same spanset = true', () => assert.equal(ss1.eq(ss1b), true));
	it('ne: different spansets = true', () => assert.equal(ss1.ne(ss2), true));
	it('lt: {[1,4)} < {[7,10)} = true', () => assert.equal(ss1.lt(ss2), true));
	it('le: equal spansets = true', () => assert.equal(ss1.le(ss1b), true));
	it('gt: {[7,10)} > {[1,4)} = true', () => assert.equal(ss2.gt(ss1), true));
	it('ge: equal spansets = true', () => assert.equal(ss1.ge(ss1b), true));
});

// -------------------------------------------------------------------------
// MATH METHODS
// -------------------------------------------------------------------------

describe('FloatSpanSet - Math methods', () => {
	it('ceil rounds span bounds up', () => {
		const ss = FloatSpanSet.fromString('{[1.2, 4.7), [7.1, 9.8)}');
		const c = ss.ceil();
		assert.ok(Math.abs(lower(c) - 2.0) < 1e-9);
		assert.ok(Math.abs(upper(c) - 10.0) < 1e-9);
		ss.free();
		c.free();
	});

	it('floor rounds span bounds down', () => {
		const ss = FloatSpanSet.fromString('{[1.7, 4.2), [7.8, 9.3)}');
		const f = ss.floor();
		assert.ok(Math.abs(lower(f) - 1.0) < 1e-9);
		assert.ok(Math.abs(upper(f) - 9.0) < 1e-9);
		ss.free();
		f.free();
	});

	it('round rounds to given decimal places', () => {
		const ss = FloatSpanSet.fromString('{[1.234, 4.567)}');
		const r = ss.round(2);
		assert.ok(Math.abs(lower(r) - 1.23) < 1e-9);
		assert.ok(Math.abs(upper(r) - 4.57) < 1e-9);
		ss.free();
		r.free();
	});

	it('radians and degrees are inverse', () => {
		const ss = FloatSpanSet.fromString('{[1, 4)}');
		const rad = ss.radians();
		const back = rad.degrees();
		assert.ok(Math.abs(lower(back) - 1.0) < 1e-9);
		assert.ok(Math.abs(upper(back) - 4.0) < 1e-9);
		ss.free();
		rad.free();
		back.free();
	});

	it('shiftScale shifts spanset forward', () => {
		const ss = FloatSpanSet.fromString('{[1, 4)}');
		const shifted = ss.shiftScale(1.0, 0, true, false);
		assert.ok(Math.abs(lower(shifted) - 2.0) < 1e-9);
		assert.ok(Math.abs(upper(shifted) - 5.0) < 1e-9);
		ss.free();
		shifted.free();
	});

	it('toIntSpanSet returns a non-zero pointer', () => {
		const ss = FloatSpanSet.fromString(WKT_AB);
		assert.ok(ss.toIntSpanSet() !== 0);
		ss.free();
	});
});
