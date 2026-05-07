import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import { initMeos } from '../../../core/runtime/meos';
import { TsTzSpan } from '../../../core/types/time/TsTzSpan';
import { TsTzSpanSet } from '../../../core/types/time/TsTzSpanSet';

const T0 = '2000-01-01 00:00:00+00';
const T1 = '2000-01-01 01:00:00+00'; // +1 h
const T2 = '2000-01-01 02:00:00+00'; // +2 h
const T3 = '2000-01-01 03:00:00+00'; // +3 h
const T4 = '2000-01-01 04:00:00+00'; // +4 h

// Helper: "{[T0,T1), [T2,T3)}"
const WKT_AB = `{[${T0}, ${T1}), [${T2}, ${T3})}`;
// Single-span spanset
const WKT_SINGLE = `{[${T0}, ${T2})}`;

before(async () => {
	await initMeos();
});

// -------------------------------------------------------------------------
// CONSTRUCTION & OUTPUT
// -------------------------------------------------------------------------

describe('TsTzSpanSet - Construction', () => {
	it('fromString returns a non-zero pointer', () => {
		const ss = TsTzSpanSet.fromString(WKT_AB);
		assert.ok(ss.inner !== 0);
		ss.free();
	});

	it('toString round-trips WKT', () => {
		const ss = TsTzSpanSet.fromString(WKT_AB);
		assert.equal(ss.toString(), WKT_AB);
		ss.free();
	});

	it('fromHexWKB round-trips through asHexWKB', () => {
		const ss1 = TsTzSpanSet.fromString(WKT_AB);
		const hex = ss1.asHexWKB();
		assert.ok(typeof hex === 'string' && hex.length > 0);
		const ss2 = TsTzSpanSet.fromHexWKB(hex);
		assert.equal(ss2.toString(), ss1.toString());
		ss1.free();
		ss2.free();
	});

	it('fromSpan wraps a single TsTzSpan', () => {
		const s = TsTzSpan.fromString(`[${T0}, ${T2})`);
		const ss = TsTzSpanSet.fromSpan(s);
		assert.equal(ss.numSpans(), 1);
		assert.equal(ss.toString(), WKT_SINGLE);
		s.free();
		ss.free();
	});

	it('copy() produces a distinct pointer with identical WKT', () => {
		const ss = TsTzSpanSet.fromString(WKT_AB);
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

describe('TsTzSpanSet - Accessors', () => {
	let ss: TsTzSpanSet; // {[T0,T1), [T2,T3)}

	before(() => {
		ss = TsTzSpanSet.fromString(WKT_AB);
	});

	it('numSpans() = 2', () => {
		assert.equal(ss.numSpans(), 2);
	});

	it('numTimestamps() = 4 (2 per span)', () => {
		assert.equal(ss.numTimestamps(), 4);
	});

	it('lower() < upper()', () => {
		assert.ok(ss.upper() > ss.lower(), `upper (${ss.upper()}) > lower (${ss.lower()})`);
	});

	it('lowerInc() = true for [ lower bound', () => {
		assert.equal(ss.lowerInc(), true);
	});

	it('upperInc() = false for ) upper bound', () => {
		assert.equal(ss.upperInc(), false);
	});

	it('startTimestamp() equals lower()', () => {
		assert.equal(ss.startTimestamp(), ss.lower());
	});

	it('endTimestamp() equals upper()', () => {
		assert.equal(ss.endTimestamp(), ss.upper());
	});

	it('timestampN(0) = startTimestamp()', () => {
		assert.equal(ss.timestampN(0), ss.startTimestamp());
	});

	it('timestampN(numTimestamps()-1) = endTimestamp()', () => {
		const n = ss.numTimestamps();
		assert.equal(ss.timestampN(n - 1), ss.endTimestamp());
	});

	it('startSpan() matches first span WKT', () => {
		const sp = ss.startSpan();
		assert.equal(sp.toString(), `[${T0}, ${T1})`);
		sp.free();
	});

	it('endSpan() matches last span WKT', () => {
		const sp = ss.endSpan();
		assert.equal(sp.toString(), `[${T2}, ${T3})`);
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
		// Bounding span of {[T0,T1),[T2,T3)} should be [T0,T3)
		assert.equal(bounding.toString(), `[${T0}, ${T3})`);
		bounding.free();
	});

	it('durationMs(false) = sum of individual span durations (2 * 1h = 7200000 ms)', () => {
		assert.equal(ss.durationMs(false), 2 * 3_600_000);
	});

	it('durationMs(true) = bounding span duration (3h = 10800000 ms)', () => {
		assert.equal(ss.durationMs(true), 3 * 3_600_000);
	});

	it('hash() returns a number', () => {
		assert.equal(typeof ss.hash(), 'number');
	});
});

// -------------------------------------------------------------------------
// TOPOLOGICAL PREDICATES
// -------------------------------------------------------------------------

describe('TsTzSpanSet - Topological predicates', () => {
	// ss1 = {[T0,T1), [T2,T3)}   ss2 = {[T3,T4)}   s_adj = [T3,T4)
	let ss1: TsTzSpanSet;
	let ss2: TsTzSpanSet;
	let ss_big: TsTzSpanSet; // {[T0,T4)} - contains ss1
	let s_overlap: TsTzSpan; // [T0,T2) - overlaps first span

	before(() => {
		ss1 = TsTzSpanSet.fromString(WKT_AB);
		ss2 = TsTzSpanSet.fromString(`{[${T3}, ${T4})}`);
		ss_big = TsTzSpanSet.fromString(`{[${T0}, ${T4})}`);
		s_overlap = TsTzSpan.fromString(`[${T0}, ${T2})`);
	});

	it('isAdjacent(TsTzSpanSet): {[T0,T1),[T2,T3)} adj {[T3,T4)} = true', () => {
		assert.equal(ss1.isAdjacent(ss2), true);
	});

	it('isAdjacent(TsTzSpan): {[T0,T1),[T2,T3)} adj [T3,T4) = true', () => {
		const s = TsTzSpan.fromString(`[${T3}, ${T4})`);
		assert.equal(ss1.isAdjacent(s), true);
		s.free();
	});

	it('isContainedIn(TsTzSpanSet): {[T0,T1),[T2,T3)} in {[T0,T4)} = true', () => {
		assert.equal(ss1.isContainedIn(ss_big), true);
	});

	it('isContainedIn(TsTzSpan): {[T0,T1),[T2,T3)} in [T0,T4) = true', () => {
		const s = TsTzSpan.fromString(`[${T0}, ${T4})`);
		assert.equal(ss1.isContainedIn(s), true);
		s.free();
	});

	it('contains(TsTzSpanSet): {[T0,T4)} contains {[T0,T1),[T2,T3)} = true', () => {
		assert.equal(ss_big.contains(ss1), true);
	});

	it('contains(TsTzSpan): {[T0,T4)} contains [T1,T2) = true', () => {
		const s = TsTzSpan.fromString(`[${T1}, ${T2})`);
		assert.equal(ss_big.contains(s), true);
		s.free();
	});

	it('overlaps(TsTzSpanSet): {[T0,T1),[T2,T3)} overlaps {[T0,T4)} = true', () => {
		assert.equal(ss1.overlaps(ss_big), true);
	});

	it('overlaps(TsTzSpan): {[T0,T1),[T2,T3)} overlaps [T0,T2) = true', () => {
		assert.equal(ss1.overlaps(s_overlap), true);
	});

	it('overlaps: {[T0,T1),[T2,T3)} overlaps {[T3,T4)} = false', () => {
		assert.equal(ss1.overlaps(ss2), false);
	});
});

// -------------------------------------------------------------------------
// POSITION PREDICATES
// -------------------------------------------------------------------------

describe('TsTzSpanSet - Position predicates', () => {
	// ss1 = {[T0,T1)}   ss2 = {[T2,T3)}
	let ss1: TsTzSpanSet;
	let ss2: TsTzSpanSet;

	before(() => {
		ss1 = TsTzSpanSet.fromString(`{[${T0}, ${T1})}`);
		ss2 = TsTzSpanSet.fromString(`{[${T2}, ${T3})}`);
	});

	it('isBefore(TsTzSpanSet): {[T0,T1)} before {[T2,T3)} = true', () => {
		assert.equal(ss1.isBefore(ss2), true);
	});

	it('isBefore(TsTzSpan): {[T0,T1)} before [T2,T3) = true', () => {
		const s = TsTzSpan.fromString(`[${T2}, ${T3})`);
		assert.equal(ss1.isBefore(s), true);
		s.free();
	});

	it('isAfter(TsTzSpanSet): {[T2,T3)} after {[T0,T1)} = true', () => {
		assert.equal(ss2.isAfter(ss1), true);
	});

	it('isAfter(TsTzSpan): {[T2,T3)} after [T0,T1) = true', () => {
		const s = TsTzSpan.fromString(`[${T0}, ${T1})`);
		assert.equal(ss2.isAfter(s), true);
		s.free();
	});

	it('isOverOrBefore(TsTzSpanSet): {[T0,T1)} over-or-before {[T2,T3)} = true', () => {
		assert.equal(ss1.isOverOrBefore(ss2), true);
	});

	it('isOverOrAfter(TsTzSpanSet): {[T2,T3)} over-or-after {[T0,T1)} = true', () => {
		assert.equal(ss2.isOverOrAfter(ss1), true);
	});
});

// -------------------------------------------------------------------------
// DISTANCE
// -------------------------------------------------------------------------

describe('TsTzSpanSet - Distance', () => {
	it('distance to overlapping spanset = 0', () => {
		const ss1 = TsTzSpanSet.fromString(`{[${T0}, ${T2})}`);
		const ss2 = TsTzSpanSet.fromString(`{[${T1}, ${T3})}`);
		assert.equal(ss1.distance(ss2), 0);
		ss1.free();
		ss2.free();
	});

	it('distance to disjoint spanset > 0', () => {
		const ss1 = TsTzSpanSet.fromString(`{[${T0}, ${T1})}`);
		const ss2 = TsTzSpanSet.fromString(`{[${T2}, ${T3})}`);
		assert.ok(ss1.distance(ss2) > 0);
		ss1.free();
		ss2.free();
	});

	it('distance to overlapping TsTzSpan = 0', () => {
		const ss = TsTzSpanSet.fromString(`{[${T0}, ${T2})}`);
		const s = TsTzSpan.fromString(`[${T1}, ${T3})`);
		assert.equal(ss.distance(s), 0);
		ss.free();
		s.free();
	});

	it('distance to disjoint TsTzSpan > 0', () => {
		const ss = TsTzSpanSet.fromString(`{[${T0}, ${T1})}`);
		const s = TsTzSpan.fromString(`[${T2}, ${T3})`);
		assert.ok(ss.distance(s) > 0);
		ss.free();
		s.free();
	});
});

// -------------------------------------------------------------------------
// SET OPERATIONS
// -------------------------------------------------------------------------

describe('TsTzSpanSet - Set operations', () => {
	it('intersection(TsTzSpanSet): overlapping = non-null', () => {
		const ss1 = TsTzSpanSet.fromString(`{[${T0}, ${T2})}`);
		const ss2 = TsTzSpanSet.fromString(`{[${T1}, ${T3})}`);
		const inter = ss1.intersection(ss2);
		assert.ok(inter !== null);
		assert.equal(inter!.toString(), `{[${T1}, ${T2})}`);
		inter!.free();
		ss1.free();
		ss2.free();
	});

	it('intersection(TsTzSpanSet): disjoint = null', () => {
		const ss1 = TsTzSpanSet.fromString(`{[${T0}, ${T1})}`);
		const ss2 = TsTzSpanSet.fromString(`{[${T2}, ${T3})}`);
		const inter = ss1.intersection(ss2);
		assert.equal(inter, null);
		ss1.free();
		ss2.free();
	});

	it('intersection(TsTzSpan): overlapping = non-null', () => {
		const ss = TsTzSpanSet.fromString(`{[${T0}, ${T2})}`);
		const s = TsTzSpan.fromString(`[${T1}, ${T3})`);
		const inter = ss.intersection(s);
		assert.ok(inter !== null);
		assert.equal(inter!.toString(), `{[${T1}, ${T2})}`);
		inter!.free();
		ss.free();
		s.free();
	});

	it('minus(TsTzSpanSet): returns non-null when result is non-empty', () => {
		const ss1 = TsTzSpanSet.fromString(WKT_AB); // {[T0,T1),[T2,T3)}
		const ss2 = TsTzSpanSet.fromString(`{[${T0}, ${T1})}`);
		const diff = ss1.minus(ss2);
		assert.ok(diff !== null);
		// result should be {[T2,T3)}
		assert.equal(diff!.toString(), `{[${T2}, ${T3})}`);
		diff!.free();
		ss1.free();
		ss2.free();
	});

	it('minus(TsTzSpanSet): returns null when result is empty', () => {
		const ss1 = TsTzSpanSet.fromString(`{[${T0}, ${T1})}`);
		const ss2 = TsTzSpanSet.fromString(`{[${T0}, ${T2})}`);
		const diff = ss1.minus(ss2);
		assert.equal(diff, null);
		ss1.free();
		ss2.free();
	});

	it('minus(TsTzSpan): removes overlapping part', () => {
		const ss = TsTzSpanSet.fromString(WKT_AB); // {[T0,T1),[T2,T3)}
		const s = TsTzSpan.fromString(`[${T0}, ${T1})`);
		const diff = ss.minus(s);
		assert.ok(diff !== null);
		assert.equal(diff!.toString(), `{[${T2}, ${T3})}`);
		diff!.free();
		ss.free();
		s.free();
	});

	it('union(TsTzSpanSet): merges disjoint spansets', () => {
		const ss1 = TsTzSpanSet.fromString(`{[${T0}, ${T1})}`);
		const ss2 = TsTzSpanSet.fromString(`{[${T2}, ${T3})}`);
		const u = ss1.union(ss2);
		assert.equal(u.toString(), WKT_AB);
		u.free();
		ss1.free();
		ss2.free();
	});

	it('union(TsTzSpan): merges span into spanset', () => {
		const ss = TsTzSpanSet.fromString(`{[${T0}, ${T1})}`);
		const s = TsTzSpan.fromString(`[${T2}, ${T3})`);
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

describe('TsTzSpanSet - Comparisons', () => {
	let ss1: TsTzSpanSet;
	let ss1b: TsTzSpanSet;
	let ss2: TsTzSpanSet;

	before(() => {
		ss1 = TsTzSpanSet.fromString(`{[${T0}, ${T1})}`);
		ss1b = TsTzSpanSet.fromString(`{[${T0}, ${T1})}`); // same
		ss2 = TsTzSpanSet.fromString(`{[${T1}, ${T2})}`);
	});

	it('eq: same spanset = true', () => assert.equal(ss1.eq(ss1b), true));
	it('ne: different spansets = true', () => assert.equal(ss1.ne(ss2), true));
	it('lt: {[T0,T1)} < {[T1,T2)} = true', () => assert.equal(ss1.lt(ss2), true));
	it('le: equal spansets = true', () => assert.equal(ss1.le(ss1b), true));
	it('gt: {[T1,T2)} > {[T0,T1)} = true', () => assert.equal(ss2.gt(ss1), true));
	it('ge: equal spansets = true', () => assert.equal(ss1.ge(ss1b), true));
});
