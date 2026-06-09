import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import { initMeos } from '../../../../core/runtime/meos.js';
import { interval_make, meos_free } from '../../../../core/functions/functions.generated.js';
import { TsTzSpan } from '../../../../core/types/collections/time/TsTzSpan.js';

const T0 = '2000-01-01 00:00:00+00';
const T1 = '2000-01-01 01:00:00+00'; // +1 h
const T2 = '2000-01-01 02:00:00+00'; // +2 h
const T3 = '2000-01-01 03:00:00+00'; // +3 h
const T4 = '2000-01-01 04:00:00+00'; // +4 h

before(async () => {
	await initMeos();
});

// -------------------------------------------------------------------------
// CONSTRUCTION & OUTPUT
// -------------------------------------------------------------------------

describe('TsTzSpan - Construction', () => {
	it('fromString returns a non-zero pointer', () => {
		const s = TsTzSpan.fromString(`[${T0}, ${T1})`);
		assert.ok(s.inner !== 0);
		s.free();
	});

	it('toString round-trips WKT', () => {
		const wkt = `[${T0}, ${T1})`;
		const s = TsTzSpan.fromString(wkt);
		assert.equal(s.toString(), wkt);
		s.free();
	});

	it('fromString with inclusive upper bound round-trips', () => {
		const wkt = `[${T0}, ${T1}]`;
		const s = TsTzSpan.fromString(wkt);
		assert.equal(s.toString(), wkt);
		s.free();
	});

	it('fromTimestamps constructs a valid span', () => {
		// 1 hour = 3_600_000_000 microseconds
		const s = TsTzSpan.fromTimestamps(0, 3_600_000_000);
		assert.ok(s.inner !== 0);
		s.free();
	});

	it('fromHexWKB round-trips through asHexWKB', () => {
		const s1 = TsTzSpan.fromString(`[${T0}, ${T1})`);
		const hex = s1.asHexWKB();
		assert.ok(typeof hex === 'string' && hex.length > 0);
		const s2 = TsTzSpan.fromHexWKB(hex);
		assert.equal(s2.toString(), s1.toString());
		s1.free();
		s2.free();
	});

	it('copy() produces a distinct pointer with identical WKT', () => {
		const s = TsTzSpan.fromString(`[${T0}, ${T1})`);
		const c = s.copy();
		assert.ok(c.inner !== 0);
		assert.notEqual(c.inner, s.inner);
		assert.equal(c.toString(), s.toString());
		s.free();
		c.free();
	});
});

// -------------------------------------------------------------------------
// ACCESSORS
// -------------------------------------------------------------------------

describe('TsTzSpan - Accessors', () => {
	let s: TsTzSpan;

	before(() => {
		s = TsTzSpan.fromString(`[${T0}, ${T2})`);
	});

	it('lower() < upper()', () => {
		assert.ok(
			s.upper() > s.lower(),
			`expected upper (${s.upper()}) > lower (${s.lower()})`
		);
	});

	it('lowerInc() = true for [ bound', () => {
		assert.equal(s.lowerInc(), true);
	});

	it('upperInc() = false for ) bound', () => {
		assert.equal(s.upperInc(), false);
	});

	it('lowerInc() = false for ( bound', () => {
		const open = TsTzSpan.fromString(`(${T0}, ${T2})`);
		assert.equal(open.lowerInc(), false);
		open.free();
	});

	it('upperInc() = true for ] bound', () => {
		const closed = TsTzSpan.fromString(`[${T0}, ${T2}]`);
		assert.equal(closed.upperInc(), true);
		closed.free();
	});

	it('durationMs() = 2 * 3_600_000 for a 2-hour span', () => {
		assert.equal(s.durationMs(), 2 * 3_600_000);
	});

	it('hash() returns a number', () => {
		assert.equal(typeof s.hash(), 'number');
	});
});

// -------------------------------------------------------------------------
// CONVERSIONS
// -------------------------------------------------------------------------

describe('TsTzSpan - Conversions', () => {
	it('toSpanSet() returns a non-zero pointer', () => {
		const s = TsTzSpan.fromString(`[${T0}, ${T1})`);
		const ss = s.toSpanSet();
		assert.ok(ss !== 0);
		s.free();
	});
});

// -------------------------------------------------------------------------
// TOPOLOGICAL PREDICATES
// -------------------------------------------------------------------------

describe('TsTzSpan - Topological predicates', () => {
	// s1 = [T0, T1)   s2 = [T1, T2)   s3 = [T0, T2)   s4 = [T2, T3)
	let s1: TsTzSpan;
	let s2: TsTzSpan;
	let s3: TsTzSpan;
	let s4: TsTzSpan;

	before(() => {
		s1 = TsTzSpan.fromString(`[${T0}, ${T1})`);
		s2 = TsTzSpan.fromString(`[${T1}, ${T2})`);
		s3 = TsTzSpan.fromString(`[${T0}, ${T2})`);
		s4 = TsTzSpan.fromString(`[${T2}, ${T3})`);
	});

	it('isAdjacent: [T0,T1) adj [T1,T2) = true', () => {
		assert.equal(s1.isAdjacent(s2), true);
	});

	it('isAdjacent: [T0,T1) adj [T2,T3) = false (gap)', () => {
		assert.equal(s1.isAdjacent(s4), false);
	});

	it('isContainedIn: [T0,T1) contained in [T0,T2) = true', () => {
		assert.equal(s1.isContainedIn(s3), true);
	});

	it('isContainedIn: [T0,T2) contained in [T0,T1) = false', () => {
		assert.equal(s3.isContainedIn(s1), false);
	});

	it('contains: [T0,T2) contains [T0,T1) = true', () => {
		assert.equal(s3.contains(s1), true);
	});

	it('contains: [T0,T1) contains [T0,T2) = false', () => {
		assert.equal(s1.contains(s3), false);
	});

	it('overlaps: [T0,T1) overlaps [T0,T2) = true', () => {
		assert.equal(s1.overlaps(s3), true);
	});

	it('overlaps: [T0,T1) overlaps [T2,T3) = false', () => {
		assert.equal(s1.overlaps(s4), false);
	});
});

// -------------------------------------------------------------------------
// POSITION PREDICATES
// -------------------------------------------------------------------------

describe('TsTzSpan - Position predicates', () => {
	// s1=[T0,T1)  s2=[T1,T2)  s3=[T2,T3)  s4=[T0,T4)
	let s1: TsTzSpan;
	let s2: TsTzSpan;
	let s3: TsTzSpan;
	let s4: TsTzSpan;

	before(() => {
		s1 = TsTzSpan.fromString(`[${T0}, ${T1})`);
		s2 = TsTzSpan.fromString(`[${T1}, ${T2})`);
		s3 = TsTzSpan.fromString(`[${T2}, ${T3})`);
		s4 = TsTzSpan.fromString(`[${T0}, ${T4})`);
	});

	it('isBefore: [T0,T1) before [T2,T3) = true', () => {
		assert.equal(s1.isBefore(s3), true);
	});

	it('isBefore: [T0,T1) before [T1,T2) = true (T1 excluded from first span)', () => {
		assert.equal(s1.isBefore(s2), true);
	});

	it('isAfter: [T2,T3) after [T0,T1) = true', () => {
		assert.equal(s3.isAfter(s1), true);
	});

	it('isAfter: [T1,T2) after [T0,T1) = true (T1 not in first span)', () => {
		assert.equal(s2.isAfter(s1), true);
	});

	it('isOverOrBefore: [T0,T1) over-or-before [T1,T2) = true', () => {
		assert.equal(s1.isOverOrBefore(s2), true);
	});

	it('isOverOrBefore: [T0,T4) over-or-before [T1,T2) = false (extends past it)', () => {
		assert.equal(s4.isOverOrBefore(s2), false);
	});

	it('isOverOrAfter: [T1,T2) over-or-after [T0,T1) = true', () => {
		assert.equal(s2.isOverOrAfter(s1), true);
	});
});

// -------------------------------------------------------------------------
// DISTANCE
// -------------------------------------------------------------------------

describe('TsTzSpan - Distance', () => {
	it('distance between overlapping spans = 0', () => {
		const s1 = TsTzSpan.fromString(`[${T0}, ${T2})`);
		const s2 = TsTzSpan.fromString(`[${T1}, ${T3})`);
		assert.equal(s1.distance(s2), 0);
		s1.free();
		s2.free();
	});

	it('distance between disjoint spans > 0', () => {
		const s1 = TsTzSpan.fromString(`[${T0}, ${T1})`);
		const s2 = TsTzSpan.fromString(`[${T2}, ${T3})`);
		assert.ok(s1.distance(s2) > 0, `expected distance > 0, got ${s1.distance(s2)}`);
		s1.free();
		s2.free();
	});

	it('distance between adjacent spans = 0 (they share an endpoint)', () => {
		const s1 = TsTzSpan.fromString(`[${T0}, ${T1}]`);
		const s2 = TsTzSpan.fromString(`[${T1}, ${T2}]`);
		assert.equal(s1.distance(s2), 0);
		s1.free();
		s2.free();
	});
});

// -------------------------------------------------------------------------
// SET OPERATIONS
// -------------------------------------------------------------------------

describe('TsTzSpan - Set operations', () => {
	it('intersection of overlapping spans returns a non-null TsTzSpan', () => {
		const s1 = TsTzSpan.fromString(`[${T0}, ${T2})`);
		const s2 = TsTzSpan.fromString(`[${T1}, ${T3})`);
		const inter = s1.intersection(s2);
		assert.ok(inter !== null, 'expected non-null intersection');
		assert.ok(inter!.inner !== 0);
		inter!.free();
		s1.free();
		s2.free();
	});

	it('intersection of overlapping spans = [T1, T2)', () => {
		const s1 = TsTzSpan.fromString(`[${T0}, ${T2})`);
		const s2 = TsTzSpan.fromString(`[${T1}, ${T3})`);
		const inter = s1.intersection(s2);
		assert.equal(inter!.toString(), `[${T1}, ${T2})`);
		inter!.free();
		s1.free();
		s2.free();
	});

	it('intersection of disjoint spans returns null', () => {
		const s1 = TsTzSpan.fromString(`[${T0}, ${T1})`);
		const s2 = TsTzSpan.fromString(`[${T2}, ${T3})`);
		const inter = s1.intersection(s2);
		assert.equal(inter, null);
		s1.free();
		s2.free();
	});

	it('minus() returns a non-zero Ptr', () => {
		const s1 = TsTzSpan.fromString(`[${T0}, ${T3})`);
		const s2 = TsTzSpan.fromString(`[${T1}, ${T2})`);
		const diff = s1.minus(s2);
		assert.ok(diff !== 0);
		s1.free();
		s2.free();
	});

	it('union() returns a non-zero Ptr', () => {
		const s1 = TsTzSpan.fromString(`[${T0}, ${T1})`);
		const s2 = TsTzSpan.fromString(`[${T1}, ${T2})`);
		const u = s1.union(s2);
		assert.ok(u !== 0);
		s1.free();
		s2.free();
	});
});

// -------------------------------------------------------------------------
// COMPARISONS
// -------------------------------------------------------------------------

describe('TsTzSpan - Comparisons', () => {
	let s1: TsTzSpan;
	let s2: TsTzSpan;
	let s1b: TsTzSpan;

	before(() => {
		s1 = TsTzSpan.fromString(`[${T0}, ${T1})`);
		s1b = TsTzSpan.fromString(`[${T0}, ${T1})`); // same WKT as s1
		s2 = TsTzSpan.fromString(`[${T1}, ${T2})`);
	});

	it('eq: same span = true', () => assert.equal(s1.eq(s1b), true));
	it('ne: different spans = true', () => assert.equal(s1.ne(s2), true));
	it('lt: [T0,T1) < [T1,T2) = true', () => assert.equal(s1.lt(s2), true));
	it('le: [T0,T1) <= [T0,T1) = true', () => assert.equal(s1.le(s1b), true));
	it('gt: [T1,T2) > [T0,T1) = true', () => assert.equal(s2.gt(s1), true));
	it('ge: [T0,T1) >= [T0,T1) = true', () => assert.equal(s1.ge(s1b), true));
});

// -------------------------------------------------------------------------
// TRANSFORMATIONS (shiftScale, expand, tprecision)
// -------------------------------------------------------------------------

describe('TsTzSpan - shiftScale', () => {
	it('shift by 1 hour: [T0,T1) becomes [T1,T2)', () => {
		const s = TsTzSpan.fromString(`[${T0}, ${T1})`);
		const interv = interval_make(0, 0, 0, 0, 1, 0, 0); // 1 hour
		const r = s.shiftScale(interv, 0);
		assert.equal(r.toString(), `[${T1}, ${T2})`);
		s.free();
		r.free();
		meos_free(interv);
	});

	it('scale to 2h: width doubles', () => {
		const s = TsTzSpan.fromString(`[${T0}, ${T1}]`); // 1h
		const dur = interval_make(0, 0, 0, 0, 2, 0, 0);  // 2 hours
		const r = s.shiftScale(0, dur);
		// lower stays, upper moves to lower + 2h
		assert.equal(r.lower(), s.lower());
		assert.ok(r.upper() > s.upper());
		s.free();
		r.free();
		meos_free(dur);
	});
});

describe('TsTzSpan - expand', () => {
	it('expands span by 1 hour on each side', () => {
		const s = TsTzSpan.fromString(`[${T1}, ${T2})`); // [+1h, +2h)
		const interv = interval_make(0, 0, 0, 0, 1, 0, 0); // 1 hour
		const r = s.expand(interv);
		// lower shrinks by 1h, upper grows by 1h
		assert.ok(r.lower() < s.lower());
		assert.ok(r.upper() > s.upper());
		s.free();
		r.free();
		meos_free(interv);
	});
});

describe('TsTzSpan - tprecision', () => {
	it('returns a non-zero pointer', () => {
		const s = TsTzSpan.fromString(`[${T0}, ${T3}]`);
		const dur = interval_make(0, 0, 0, 0, 1, 0, 0); // 1-hour bucket
		const r = s.tprecision(dur, s.lower());
		assert.ok(r.inner !== 0);
		s.free();
		r.free();
		meos_free(dur);
	});
});

describe('TsTzSpan - toDateSpan', () => {
	it('returns a non-zero pointer', () => {
		const s = TsTzSpan.fromString(`[${T0}, ${T1}]`);
		const ptr = s.toDateSpan();
		assert.ok(ptr !== 0);
		meos_free(ptr);
		s.free();
	});
});
