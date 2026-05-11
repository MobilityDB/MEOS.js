import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import { initMeos } from '../../../core/runtime/meos';
import { IntSpan } from '../../../core/types/number/IntSpan';

before(async () => {
	await initMeos();
});

describe('IntSpan - Construction', () => {
	it('fromString returns a non-zero pointer', () => {
		const s = IntSpan.fromString('[1, 10)');
		assert.ok(s.inner !== 0);
		s.free();
	});

	it('toString round-trips WKT', () => {
		const s = IntSpan.fromString('[1, 10)');
		assert.equal(s.toString(), '[1, 10)');
		s.free();
	});

	it('fromBounds constructs a valid span', () => {
		const s = IntSpan.fromBounds(1, 10);
		assert.equal(s.toString(), '[1, 10)');
		s.free();
	});

	it('fromBounds with inclusive upper', () => {
		const s = IntSpan.fromBounds(1, 10, true, true);
		assert.equal(s.toString(), '[1, 11)'); // MEOS normalises to half-open for integers
		s.free();
	});

	it('fromHexWKB round-trips through asHexWKB', () => {
		const s1 = IntSpan.fromString('[1, 10)');
		const hex = s1.asHexWKB();
		assert.ok(typeof hex === 'string' && hex.length > 0);
		const s2 = IntSpan.fromHexWKB(hex);
		assert.equal(s2.toString(), s1.toString());
		s1.free();
		s2.free();
	});

	it('copy produces a distinct pointer with identical WKT', () => {
		const s = IntSpan.fromString('[1, 10)');
		const c = s.copy();
		assert.notEqual(s.inner, c.inner);
		assert.equal(c.toString(), s.toString());
		s.free();
		c.free();
	});
});

describe('IntSpan - Accessors', () => {
	it('lower and upper return integer bounds', () => {
		const s = IntSpan.fromString('[1, 10)');
		assert.equal(s.lower(), 1);
		assert.equal(s.upper(), 10);
		s.free();
	});

	it('lowerInc / upperInc match WKT brackets', () => {
		const s = IntSpan.fromString('[1, 10)');
		assert.equal(s.lowerInc(), true);
		assert.equal(s.upperInc(), false);
		s.free();
	});

	it('width returns upper - lower', () => {
		const s = IntSpan.fromString('[1, 10)');
		assert.equal(s.width(), 9);
		s.free();
	});

	it('hash returns a number', () => {
		const s = IntSpan.fromString('[1, 10)');
		assert.equal(typeof s.hash(), 'number');
		s.free();
	});
});

describe('IntSpan - Conversions', () => {
	it('toFloatSpan returns a non-zero pointer', () => {
		const s = IntSpan.fromString('[1, 10)');
		const ptr = s.toFloatSpan();
		assert.ok(ptr !== 0);
		s.free();
	});

	it('toSpanSet returns a non-zero pointer', () => {
		const s = IntSpan.fromString('[1, 10)');
		const ptr = s.toSpanSet();
		assert.ok(ptr !== 0);
		s.free();
	});

	it('expand grows the span', () => {
		const s = IntSpan.fromString('[5, 10)');
		const e = s.expand(3);
		assert.equal(e.lower(), 2);
		assert.equal(e.upper(), 13);
		s.free();
		e.free();
	});
});

describe('IntSpan - Topological predicates', () => {
	it('isAdjacent: [1,5) and [5,10) are adjacent', () => {
		const a = IntSpan.fromString('[1, 5)');
		const b = IntSpan.fromString('[5, 10)');
		assert.equal(a.isAdjacent(b), true);
		a.free();
		b.free();
	});

	it('isAdjacent: [1,5) and [6,10) are not adjacent', () => {
		const a = IntSpan.fromString('[1, 5)');
		const b = IntSpan.fromString('[6, 10)');
		assert.equal(a.isAdjacent(b), false);
		a.free();
		b.free();
	});

	it('isContainedIn: [2,5) is contained in [1,10)', () => {
		const a = IntSpan.fromString('[2, 5)');
		const b = IntSpan.fromString('[1, 10)');
		assert.equal(a.isContainedIn(b), true);
		a.free();
		b.free();
	});

	it('contains: [1,10) contains [2,5)', () => {
		const a = IntSpan.fromString('[1, 10)');
		const b = IntSpan.fromString('[2, 5)');
		assert.equal(a.contains(b), true);
		a.free();
		b.free();
	});

	it('overlaps: [1,5) and [3,8) overlap', () => {
		const a = IntSpan.fromString('[1, 5)');
		const b = IntSpan.fromString('[3, 8)');
		assert.equal(a.overlaps(b), true);
		a.free();
		b.free();
	});

	it('overlaps: [1,5) and [7,10) do not overlap', () => {
		const a = IntSpan.fromString('[1, 5)');
		const b = IntSpan.fromString('[7, 10)');
		assert.equal(a.overlaps(b), false);
		a.free();
		b.free();
	});
});

describe('IntSpan - Position predicates', () => {
	it('isBefore: [1,5) is before [6,10)', () => {
		const a = IntSpan.fromString('[1, 5)');
		const b = IntSpan.fromString('[6, 10)');
		assert.equal(a.isBefore(b), true);
		a.free();
		b.free();
	});

	it('isAfter: [6,10) is after [1,5)', () => {
		const a = IntSpan.fromString('[6, 10)');
		const b = IntSpan.fromString('[1, 5)');
		assert.equal(a.isAfter(b), true);
		a.free();
		b.free();
	});

	it('isOverOrBefore: [1,5) overleft [3,8)', () => {
		const a = IntSpan.fromString('[1, 5)');
		const b = IntSpan.fromString('[3, 8)');
		assert.equal(a.isOverOrBefore(b), true);
		a.free();
		b.free();
	});

	it('isOverOrAfter: [5,10) overright [1,6)', () => {
		const a = IntSpan.fromString('[5, 10)');
		const b = IntSpan.fromString('[1, 6)');
		assert.equal(a.isOverOrAfter(b), true);
		a.free();
		b.free();
	});
});

describe('IntSpan - Distance', () => {
	it('distance is 0 for overlapping spans', () => {
		const a = IntSpan.fromString('[1, 5)');
		const b = IntSpan.fromString('[3, 8)');
		assert.equal(a.distance(b), 0);
		a.free();
		b.free();
	});

	it('distance between disjoint spans', () => {
		const a = IntSpan.fromString('[1, 5)');
		const b = IntSpan.fromString('[8, 12)');
		assert.equal(a.distance(b), 4); // [1,5)→[1,4] inclusive; gap to [8,12)→[8,11] = 8-4=4
		a.free();
		b.free();
	});
});

describe('IntSpan - Set operations', () => {
	it('intersection returns overlapping region', () => {
		const a = IntSpan.fromString('[1, 8)');
		const b = IntSpan.fromString('[4, 12)');
		const r = a.intersection(b);
		assert.ok(r !== null);
		assert.equal(r.lower(), 4);
		assert.equal(r.upper(), 8);
		a.free();
		b.free();
		r!.free();
	});

	it('intersection returns null for disjoint spans', () => {
		const a = IntSpan.fromString('[1, 5)');
		const b = IntSpan.fromString('[8, 12)');
		assert.equal(a.intersection(b), null);
		a.free();
		b.free();
	});

	it('minus returns non-zero ptr', () => {
		const a = IntSpan.fromString('[1, 10)');
		const b = IntSpan.fromString('[4, 7)');
		const ptr = a.minus(b);
		assert.ok(ptr !== 0);
		a.free();
		b.free();
	});

	it('union returns non-zero ptr', () => {
		const a = IntSpan.fromString('[1, 5)');
		const b = IntSpan.fromString('[3, 8)');
		const ptr = a.union(b);
		assert.ok(ptr !== 0);
		a.free();
		b.free();
	});
});

describe('IntSpan - Comparisons', () => {
	it('eq: same span is equal', () => {
		const a = IntSpan.fromString('[1, 10)');
		const b = IntSpan.fromString('[1, 10)');
		assert.equal(a.eq(b), true);
		a.free();
		b.free();
	});

	it('ne: different spans', () => {
		const a = IntSpan.fromString('[1, 10)');
		const b = IntSpan.fromString('[2, 10)');
		assert.equal(a.ne(b), true);
		a.free();
		b.free();
	});

	it('lt / gt order', () => {
		const a = IntSpan.fromString('[1, 5)');
		const b = IntSpan.fromString('[3, 8)');
		assert.equal(a.lt(b), true);
		assert.equal(b.gt(a), true);
		a.free();
		b.free();
	});

	it('le / ge', () => {
		const a = IntSpan.fromString('[1, 5)');
		const b = IntSpan.fromString('[1, 5)');
		assert.equal(a.le(b), true);
		assert.equal(a.ge(b), true);
		a.free();
		b.free();
	});
});

describe('IntSpan - shiftScale', () => {
	it('shift only: lower moves by shift amount', () => {
		const s = IntSpan.fromString('[1, 5)');
		const r = s.shiftScale(10, 0, true, false);
		assert.equal(r.lower(), 11);
		assert.equal(r.upper(), 15);
		s.free();
		r.free();
	});

	it('scale only: width is adjusted', () => {
		const s = IntSpan.fromString('[1, 5)');
		const r = s.shiftScale(0, 8, false, true);
		assert.equal(r.lower(), 1);
		assert.equal(r.width(), 9);
		s.free();
		r.free();
	});

	it('shift and scale together', () => {
		const s = IntSpan.fromString('[1, 5)');
		const r = s.shiftScale(10, 8, true, true);
		assert.equal(r.lower(), 11);
		assert.equal(r.width(), 9);
		s.free();
		r.free();
	});
});
