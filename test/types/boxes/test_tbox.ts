import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import { initMeos } from '../../../core/runtime/meos';
import { pg_timestamptz_in, interval_make, meos_free } from '../../../core/functions/functions.generated';
import { TBox } from '../../../core/types/boxes/TBox';
import { IntSpan } from '../../../core/types/collections/number/IntSpan';
import { FloatSpan } from '../../../core/types/collections/number/FloatSpan';
import { TsTzSpan } from '../../../core/types/collections/time/TsTzSpan';
import { IntSet } from '../../../core/types/collections/number/IntSet';
import { IntSpanSet } from '../../../core/types/collections/number/IntSpanSet';

before(async () => {
	await initMeos();
});

const T0 = '2000-01-01 00:00:00+00';
const T1 = '2000-01-02 00:00:00+00';
const T2 = '2000-01-03 00:00:00+00';
const T3 = '2000-01-04 00:00:00+00';

const WKT_X = 'TBOXFLOAT X([1.5, 10.5])';
const WKT_T = `TBOX T([${T0}, ${T1}])`;
const WKT_XT = `TBOXFLOAT XT([1.5, 10.5],[${T0}, ${T1}])`;

// -------------------------------------------------------------------------
// CONSTRUCTION & OUTPUT
// -------------------------------------------------------------------------

describe('TBox - Construction', () => {
	it('fromString (X only) returns a non-zero pointer', () => {
		const b = TBox.fromString(WKT_X);
		assert.ok(b.inner !== 0);
		b.free();
	});

	it('fromString (T only) returns a non-zero pointer', () => {
		const b = TBox.fromString(WKT_T);
		assert.ok(b.inner !== 0);
		b.free();
	});

	it('fromString (XT) returns a non-zero pointer', () => {
		const b = TBox.fromString(WKT_XT);
		assert.ok(b.inner !== 0);
		b.free();
	});

	it('toString round-trips WKT_X', () => {
		const b = TBox.fromString(WKT_X);
		assert.equal(b.toString(), WKT_X);
		b.free();
	});

	it('toString round-trips WKT_XT', () => {
		const b = TBox.fromString(WKT_XT);
		assert.equal(b.toString(), WKT_XT);
		b.free();
	});

	it('fromHexWKB round-trips through asHexWKB', () => {
		const b1 = TBox.fromString(WKT_XT);
		const hex = b1.asHexWKB();
		assert.ok(typeof hex === 'string' && hex.length > 0);
		const b2 = TBox.fromHexWKB(hex);
		assert.equal(b2.toString(), b1.toString());
		b1.free();
		b2.free();
	});

	it('fromInt creates X-only box at integer value', () => {
		const b = TBox.fromInt(5);
		assert.equal(b.hasX(), true);
		assert.equal(b.hasT(), false);
		assert.equal(b.xmin(), 5);
		assert.equal(b.xmax(), 5);
		b.free();
	});

	it('fromFloat creates X-only box at float value', () => {
		const b = TBox.fromFloat(3.14);
		assert.equal(b.hasX(), true);
		assert.equal(b.hasT(), false);
		assert.ok(Math.abs(b.xmin() - 3.14) < 1e-9);
		b.free();
	});

	it('fromSpan creates X-only box from IntSpan', () => {
		const s = IntSpan.fromBounds(1, 10);
		const b = TBox.fromSpan(s.inner);
		assert.equal(b.hasX(), true);
		assert.equal(b.hasT(), false);
		assert.equal(b.xmin(), 1);
		assert.equal(b.xmax(), 9);
		s.free();
		b.free();
	});

	it('fromSpan creates X-only box from FloatSpan', () => {
		const s = FloatSpan.fromBounds(1.5, 10.5);
		const b = TBox.fromSpan(s.inner);
		assert.equal(b.hasX(), true);
		assert.ok(Math.abs(b.xmin() - 1.5) < 1e-9);
		assert.ok(Math.abs(b.xmax() - 10.5) < 1e-9);
		s.free();
		b.free();
	});

	it('make with X and T spans produces XT box', () => {
		const xs = FloatSpan.fromBounds(1.5, 10.5);
		const ts = TsTzSpan.fromString(`[${T0}, ${T1})`);
		const b = TBox.make(xs.inner, ts.inner);
		assert.equal(b.hasX(), true);
		assert.equal(b.hasT(), true);
		xs.free();
		ts.free();
		b.free();
	});

	it('make with only T span produces T-only box', () => {
		const ts = TsTzSpan.fromString(`[${T0}, ${T1})`);
		const b = TBox.make(0, ts.inner);
		assert.equal(b.hasX(), false);
		assert.equal(b.hasT(), true);
		ts.free();
		b.free();
	});

	it('make with only X span produces X-only box', () => {
		const xs = IntSpan.fromBounds(1, 10);
		const b = TBox.make(xs.inner, 0);
		assert.equal(b.hasX(), true);
		assert.equal(b.hasT(), false);
		xs.free();
		b.free();
	});

	it('copy produces a distinct pointer with identical WKT', () => {
		const b = TBox.fromString(WKT_XT);
		const c = b.copy();
		assert.ok(c.inner !== 0);
		assert.notEqual(c.inner, b.inner);
		assert.equal(c.toString(), b.toString());
		b.free();
		c.free();
	});
});

// -------------------------------------------------------------------------
// CONSTRUCTION (new constructors)
// -------------------------------------------------------------------------

describe('TBox - New constructors', () => {
	it('fromTimestamp creates T-only box at a single timestamp', () => {
		const t = pg_timestamptz_in(T0, -1);
		const b = TBox.fromTimestamp(t);
		assert.equal(b.hasX(), false);
		assert.equal(b.hasT(), true);
		b.free();
	});

	it('fromIntTimestamp creates XT box with int X and single timestamp', () => {
		const t = pg_timestamptz_in(T0, -1);
		const b = TBox.fromIntTimestamp(5, t);
		assert.equal(b.hasX(), true);
		assert.equal(b.hasT(), true);
		assert.equal(b.xmin(), 5);
		assert.equal(b.xmax(), 5);
		b.free();
	});

	it('fromFloatTimestamp creates XT box with float X and single timestamp', () => {
		const t = pg_timestamptz_in(T0, -1);
		const b = TBox.fromFloatTimestamp(3.14, t);
		assert.equal(b.hasX(), true);
		assert.equal(b.hasT(), true);
		assert.ok(Math.abs(b.xmin() - 3.14) < 1e-9);
		b.free();
	});

	it('fromIntTsTzSpan creates XT box with int X and tstzspan T', () => {
		const ts = TsTzSpan.fromString(`[${T0}, ${T1})`);
		const b = TBox.fromIntTsTzSpan(7, ts.inner);
		assert.equal(b.hasX(), true);
		assert.equal(b.hasT(), true);
		assert.equal(b.xmin(), 7);
		ts.free();
		b.free();
	});

	it('fromFloatTsTzSpan creates XT box with float X and tstzspan T', () => {
		const ts = TsTzSpan.fromString(`[${T0}, ${T1})`);
		const b = TBox.fromFloatTsTzSpan(2.5, ts.inner);
		assert.equal(b.hasX(), true);
		assert.equal(b.hasT(), true);
		assert.ok(Math.abs(b.xmin() - 2.5) < 1e-9);
		ts.free();
		b.free();
	});

	it('fromNumSpanTsTzSpan creates XT box from numspan and tstzspan', () => {
		const xs = FloatSpan.fromBounds(1.0, 9.0);
		const ts = TsTzSpan.fromString(`[${T0}, ${T1})`);
		const b = TBox.fromNumSpanTsTzSpan(xs.inner, ts.inner);
		assert.equal(b.hasX(), true);
		assert.equal(b.hasT(), true);
		assert.ok(Math.abs(b.xmin() - 1.0) < 1e-9);
		assert.ok(Math.abs(b.xmax() - 9.0) < 1e-9);
		xs.free();
		ts.free();
		b.free();
	});

	it('fromNumSpanTimestamp creates XT box from numspan and single timestamp', () => {
		const xs = FloatSpan.fromBounds(1.0, 9.0);
		const t = pg_timestamptz_in(T0, -1);
		const b = TBox.fromNumSpanTimestamp(xs.inner, t);
		assert.equal(b.hasX(), true);
		assert.equal(b.hasT(), true);
		xs.free();
		b.free();
	});

	it('fromSet creates X-only box from IntSet', () => {
		const s = IntSet.fromString('{2, 5, 8}');
		const b = TBox.fromSet(s.inner);
		assert.equal(b.hasX(), true);
		assert.equal(b.hasT(), false);
		assert.equal(b.xmin(), 2);
		assert.equal(b.xmax(), 8);
		s.free();
		b.free();
	});

	it('fromSpanSet creates X-only box from IntSpanSet', () => {
		const ss = IntSpanSet.fromString('{[1, 5), [8, 12)}');
		const b = TBox.fromSpanSet(ss.inner);
		assert.equal(b.hasX(), true);
		assert.equal(b.hasT(), false);
		assert.equal(b.xmin(), 1);
		assert.equal(b.xmax(), 11);
		ss.free();
		b.free();
	});
});

// -------------------------------------------------------------------------
// ACCESSORS
// -------------------------------------------------------------------------

describe('TBox - Accessors', () => {
	it('hasX / hasT on X-only box', () => {
		const b = TBox.fromString(WKT_X);
		assert.equal(b.hasX(), true);
		assert.equal(b.hasT(), false);
		b.free();
	});

	it('hasX / hasT on T-only box', () => {
		const b = TBox.fromString(WKT_T);
		assert.equal(b.hasX(), false);
		assert.equal(b.hasT(), true);
		b.free();
	});

	it('hasX / hasT on XT box', () => {
		const b = TBox.fromString(WKT_XT);
		assert.equal(b.hasX(), true);
		assert.equal(b.hasT(), true);
		b.free();
	});

	it('xmin / xmax return correct float bounds', () => {
		const b = TBox.fromString(WKT_X);
		assert.ok(Math.abs(b.xmin() - 1.5) < 1e-9);
		assert.ok(Math.abs(b.xmax() - 10.5) < 1e-9);
		b.free();
	});

	it('xminInc / xmaxInc are true for [] bounds', () => {
		const b = TBox.fromString(WKT_X);
		assert.equal(b.xminInc(), true);
		assert.equal(b.xmaxInc(), true);
		b.free();
	});

	it('tmin returns 0n for MEOS epoch (2000-01-01)', () => {
		const b = TBox.fromString(WKT_T);
		assert.equal(b.tmin(), 0n);
		b.free();
	});

	it('tmax > tmin for non-degenerate T box', () => {
		const b = TBox.fromString(WKT_T);
		assert.ok(b.tmax() > b.tmin());
		b.free();
	});

	it('tminInc is true for [ lower bound', () => {
		const b = TBox.fromString(WKT_T);
		assert.equal(b.tminInc(), true);
		b.free();
	});

	it('hash returns a number', () => {
		const b = TBox.fromString(WKT_XT);
		assert.equal(typeof b.hash(), 'number');
		b.free();
	});
});

// -------------------------------------------------------------------------
// TOPOLOGICAL PREDICATES
// -------------------------------------------------------------------------

describe('TBox - Topological predicates', () => {
	it('isAdjacent: [1,5) adj [5,10] on X axis = true', () => {
		const b1 = TBox.fromString('TBOX X([1, 5))');
		const b2 = TBox.fromString('TBOX X([5, 10])');
		assert.equal(b1.isAdjacent(b2), true);
		b1.free();
		b2.free();
	});

	it('isAdjacent: [1,5] adj [6,10] = false (gap)', () => {
		const b1 = TBox.fromString('TBOX X([1, 5])');
		const b2 = TBox.fromString('TBOX X([6, 10])');
		assert.equal(b1.isAdjacent(b2), false);
		b1.free();
		b2.free();
	});

	it('isContainedIn: [2,8] is contained in [1,10]', () => {
		const small = TBox.fromString('TBOX X([2, 8])');
		const big = TBox.fromString('TBOX X([1, 10])');
		assert.equal(small.isContainedIn(big), true);
		small.free();
		big.free();
	});

	it('contains: [1,10] contains [2,8]', () => {
		const big = TBox.fromString('TBOX X([1, 10])');
		const small = TBox.fromString('TBOX X([2, 8])');
		assert.equal(big.contains(small), true);
		big.free();
		small.free();
	});

	it('overlaps: [1,6] and [4,10] overlap', () => {
		const b1 = TBox.fromString('TBOX X([1, 6])');
		const b2 = TBox.fromString('TBOX X([4, 10])');
		assert.equal(b1.overlaps(b2), true);
		b1.free();
		b2.free();
	});

	it('overlaps: [1,4] and [6,10] do not overlap', () => {
		const b1 = TBox.fromString('TBOX X([1, 4])');
		const b2 = TBox.fromString('TBOX X([6, 10])');
		assert.equal(b1.overlaps(b2), false);
		b1.free();
		b2.free();
	});

	it('isSame: identical boxes are same', () => {
		const b1 = TBox.fromString(WKT_X);
		const b2 = TBox.fromString(WKT_X);
		assert.equal(b1.isSame(b2), true);
		b1.free();
		b2.free();
	});

	it('isSame: different boxes are not same', () => {
		const b1 = TBox.fromString('TBOX X([1, 5])');
		const b2 = TBox.fromString('TBOX X([1, 6])');
		assert.equal(b1.isSame(b2), false);
		b1.free();
		b2.free();
	});
});

// -------------------------------------------------------------------------
// POSITION ON X AXIS
// -------------------------------------------------------------------------

describe('TBox - Position on X axis', () => {
	// b1 = [1,4], b2 = [6,10]
	let b1: TBox;
	let b2: TBox;

	before(() => {
		b1 = TBox.fromString('TBOX X([1, 4])');
		b2 = TBox.fromString('TBOX X([6, 10])');
	});

	it('isLeft: [1,4] is left of [6,10]', () => {
		assert.equal(b1.isLeft(b2), true);
	});

	it('isLeft: [6,10] is not left of [1,4]', () => {
		assert.equal(b2.isLeft(b1), false);
	});

	it('isOverOrLeft: [1,4] overleft [6,10] = true', () => {
		assert.equal(b1.isOverOrLeft(b2), true);
	});

	it('isRight: [6,10] is right of [1,4]', () => {
		assert.equal(b2.isRight(b1), true);
	});

	it('isOverOrRight: [6,10] overright [1,4] = true', () => {
		assert.equal(b2.isOverOrRight(b1), true);
	});
});

// -------------------------------------------------------------------------
// POSITION ON T AXIS
// -------------------------------------------------------------------------

describe('TBox - Position on T axis', () => {
	let b1: TBox; // T=[T0,T1]
	let b2: TBox; // T=[T2,T3]

	before(() => {
		b1 = TBox.fromString(`TBOX T([${T0}, ${T1}])`);
		b2 = TBox.fromString(`TBOX T([${T2}, ${T3}])`);
	});

	it('isBefore: [T0,T1] is before [T2,T3]', () => {
		assert.equal(b1.isBefore(b2), true);
	});

	it('isBefore: [T2,T3] is not before [T0,T1]', () => {
		assert.equal(b2.isBefore(b1), false);
	});

	it('isOverOrBefore: [T0,T1] overbefore [T2,T3] = true', () => {
		assert.equal(b1.isOverOrBefore(b2), true);
	});

	it('isAfter: [T2,T3] is after [T0,T1]', () => {
		assert.equal(b2.isAfter(b1), true);
	});

	it('isOverOrAfter: [T2,T3] overafter [T0,T1] = true', () => {
		assert.equal(b2.isOverOrAfter(b1), true);
	});
});

// -------------------------------------------------------------------------
// SET OPERATIONS
// -------------------------------------------------------------------------

describe('TBox - Set operations', () => {
	it('intersection of overlapping X boxes returns non-null', () => {
		const b1 = TBox.fromString('TBOX X([1, 7])');
		const b2 = TBox.fromString('TBOX X([4, 10])');
		const r = b1.intersection(b2);
		assert.ok(r !== null);
		assert.ok(Math.abs(r!.xmin() - 4) < 1e-9);
		assert.ok(Math.abs(r!.xmax() - 7) < 1e-9);
		r!.free();
		b1.free();
		b2.free();
	});

	it('intersection of disjoint X boxes returns null', () => {
		const b1 = TBox.fromString('TBOX X([1, 4])');
		const b2 = TBox.fromString('TBOX X([6, 10])');
		const r = b1.intersection(b2);
		assert.equal(r, null);
		b1.free();
		b2.free();
	});

	it('union of adjacent X boxes merges them', () => {
		const b1 = TBox.fromString('TBOX X([1, 5])');
		const b2 = TBox.fromString('TBOX X([5, 10])');
		const u = b1.union(b2);
		assert.ok(Math.abs(u.xmin() - 1) < 1e-9);
		assert.ok(Math.abs(u.xmax() - 10) < 1e-9);
		u.free();
		b1.free();
		b2.free();
	});

	it('union of overlapping XT boxes merges both dimensions', () => {
		const b1 = TBox.fromString(`TBOX XT([1, 5],[${T0}, ${T1}])`);
		const b2 = TBox.fromString(`TBOX XT([3, 8],[${T1}, ${T2}])`);
		const u = b1.union(b2);
		assert.ok(Math.abs(u.xmin() - 1) < 1e-9);
		assert.ok(Math.abs(u.xmax() - 8) < 1e-9);
		u.free();
		b1.free();
		b2.free();
	});
});

// -------------------------------------------------------------------------
// CONVERSIONS
// -------------------------------------------------------------------------

describe('TBox - Conversions', () => {
	it('toIntSpan returns a non-zero pointer', () => {
		const b = TBox.fromString('TBOX X([1, 10])');
		assert.ok(b.toIntSpan() !== 0);
		b.free();
	});

	it('toFloatSpan returns a non-zero pointer', () => {
		const b = TBox.fromString(WKT_X);
		assert.ok(b.toFloatSpan() !== 0);
		b.free();
	});

	it('toTsTzSpan returns a non-zero pointer', () => {
		const b = TBox.fromString(WKT_T);
		assert.ok(b.toTsTzSpan() !== 0);
		b.free();
	});

	it('toTsTzSpan bounds match original T dimension', () => {
		const b = TBox.fromString(WKT_T);
		const span = new TsTzSpan(b.toTsTzSpan());
		assert.equal(span.lower(), 0);
		assert.ok(span.upper() > 0);
		b.free();
	});
});

// -------------------------------------------------------------------------
// COMPARISONS
// -------------------------------------------------------------------------

describe('TBox - Comparisons', () => {
	let b1: TBox;
	let b1b: TBox;
	let b2: TBox;

	before(() => {
		b1 = TBox.fromString('TBOX X([1, 5])');
		b1b = TBox.fromString('TBOX X([1, 5])');
		b2 = TBox.fromString('TBOX X([6, 10])');
	});

	it('eq: identical boxes = true', () => assert.equal(b1.eq(b1b), true));
	it('ne: different boxes = true', () => assert.equal(b1.ne(b2), true));
	it('lt: [1,5] < [6,10] = true', () => assert.equal(b1.lt(b2), true));
	it('le: equal boxes = true', () => assert.equal(b1.le(b1b), true));
	it('gt: [6,10] > [1,5] = true', () => assert.equal(b2.gt(b1), true));
	it('ge: equal boxes = true', () => assert.equal(b1.ge(b1b), true));
	it('cmp: equal boxes = 0', () => assert.equal(b1.cmp(b1b), 0));
	it('cmp: b1 < b2 → negative', () => assert.ok(b1.cmp(b2) < 0));
	it('cmp: b2 > b1 → positive', () => assert.ok(b2.cmp(b1) > 0));
});

// -------------------------------------------------------------------------
// MATH
// -------------------------------------------------------------------------

describe('TBox - Math', () => {
	it('expandInt grows integer X bounds symmetrically', () => {
		const xs = IntSpan.fromBounds(4, 8);
		const b = TBox.make(xs.inner, 0);
		const e = b.expandInt(2);
		assert.equal(e.xmin(), 2);
		assert.equal(e.xmax(), 9);
		xs.free();
		b.free();
		e.free();
	});

	it('expandFloat grows float X bounds symmetrically', () => {
		const b = TBox.fromString('TBOX X([4.0, 8.0])');
		const e = b.expandFloat(1.5);
		assert.ok(Math.abs(e.xmin() - 2.5) < 1e-9);
		assert.ok(Math.abs(e.xmax() - 9.5) < 1e-9);
		b.free();
		e.free();
	});

	it('round clamps float bounds to given decimal digits', () => {
		const b = TBox.fromString('TBOX X([1.234567, 9.876543])');
		const r = b.round(2);
		assert.ok(Math.abs(r.xmin() - 1.23) < 1e-9);
		assert.ok(Math.abs(r.xmax() - 9.88) < 1e-9);
		b.free();
		r.free();
	});

	it('shiftScaleInt shifts integer X bounds forward', () => {
		const xs = IntSpan.fromBounds(1, 5);
		const b = TBox.make(xs.inner, 0);
		const s = b.shiftScaleInt(3, 0, true, false);
		assert.equal(s.xmin(), 4);
		assert.equal(s.xmax(), 7);
		xs.free();
		b.free();
		s.free();
	});

	it('shiftScaleFloat shifts float X bounds forward', () => {
		const b = TBox.fromString('TBOX X([1.0, 5.0])');
		const s = b.shiftScaleFloat(2.0, 0, true, false);
		assert.ok(Math.abs(s.xmin() - 3.0) < 1e-9);
		assert.ok(Math.abs(s.xmax() - 7.0) < 1e-9);
		b.free();
		s.free();
	});
});

describe('TBox - expandTime', () => {
	it('expands the T dimension on each side', () => {
		const b = TBox.fromString(`TBOX T([${T0}, ${T1}])`);
		const interv = interval_make(0, 0, 0, 1, 0, 0, 0); // 1 day
		const r = b.expandTime(interv);
		assert.ok(r.tmin() < b.tmin());
		assert.ok(r.tmax() > b.tmax());
		b.free();
		r.free();
		meos_free(interv);
	});
});

describe('TBox - shiftScaleTime', () => {
	it('shifts T dimension forward by 1 day', () => {
		const b = TBox.fromString(`TBOX T([${T0}, ${T1}])`);
		const shift = interval_make(0, 0, 0, 1, 0, 0, 0); // 1 day
		const r = b.shiftScaleTime(shift, 0);
		assert.ok(r.tmin() > b.tmin());
		b.free();
		r.free();
		meos_free(shift);
	});

	it('scales T dimension to 2 days', () => {
		const b = TBox.fromString(`TBOX T([${T0}, ${T1}])`);
		const dur = interval_make(0, 0, 0, 2, 0, 0, 0); // 2 days
		const r = b.shiftScaleTime(0, dur);
		assert.ok(r.tmax() > b.tmax());
		b.free();
		r.free();
		meos_free(dur);
	});
});
