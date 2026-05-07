import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import { initMeos } from '../../../core/runtime/meos';
import { FloatSpan } from '../../../core/types/number/FloatSpan';

before(async () => {
	await initMeos();
});

describe('FloatSpan - Construction', () => {
	it('fromString returns a non-zero pointer', () => {
		const s = FloatSpan.fromString('[1.5, 10.5)');
		assert.ok(s.inner !== 0);
		s.free();
	});

	it('toString round-trips WKT', () => {
		const s = FloatSpan.fromString('[1.5, 10.5)');
		assert.equal(s.toString(), '[1.5, 10.5)');
		s.free();
	});

	it('fromBounds constructs a valid span', () => {
		const s = FloatSpan.fromBounds(1.5, 10.5);
		assert.equal(s.lower(), 1.5);
		assert.equal(s.upper(), 10.5);
		s.free();
	});

	it('fromHexWKB round-trips through asHexWKB', () => {
		const s1 = FloatSpan.fromString('[1.5, 10.5)');
		const hex = s1.asHexWKB();
		assert.ok(typeof hex === 'string' && hex.length > 0);
		const s2 = FloatSpan.fromHexWKB(hex);
		assert.equal(s2.toString(), s1.toString());
		s1.free();
		s2.free();
	});

	it('copy produces a distinct pointer with identical bounds', () => {
		const s = FloatSpan.fromString('[1.5, 10.5)');
		const c = s.copy();
		assert.notEqual(s.inner, c.inner);
		assert.equal(c.lower(), s.lower());
		assert.equal(c.upper(), s.upper());
		s.free();
		c.free();
	});
});

describe('FloatSpan - Accessors', () => {
	it('lower and upper return float bounds', () => {
		const s = FloatSpan.fromString('[1.5, 10.5)');
		assert.equal(s.lower(), 1.5);
		assert.equal(s.upper(), 10.5);
		s.free();
	});

	it('lowerInc / upperInc match WKT brackets', () => {
		const s = FloatSpan.fromString('[1.5, 10.5)');
		assert.equal(s.lowerInc(), true);
		assert.equal(s.upperInc(), false);
		s.free();
	});

	it('width returns upper - lower', () => {
		const s = FloatSpan.fromString('[1.5, 10.5)');
		assert.ok(Math.abs(s.width() - 9.0) < 1e-9);
		s.free();
	});

	it('hash returns a number', () => {
		const s = FloatSpan.fromString('[1.5, 10.5)');
		assert.equal(typeof s.hash(), 'number');
		s.free();
	});
});

describe('FloatSpan - Math methods', () => {
	it('ceil rounds bounds up', () => {
		const s = FloatSpan.fromString('[1.2, 9.8)');
		const c = s.ceil();
		assert.equal(c.lower(), 2.0);
		assert.equal(c.upper(), 10.0);
		s.free();
		c.free();
	});

	it('floor rounds bounds down', () => {
		const s = FloatSpan.fromString('[1.2, 9.8)');
		const f = s.floor();
		assert.equal(f.lower(), 1.0);
		assert.equal(f.upper(), 9.0);
		s.free();
		f.free();
	});

	it('round rounds to given decimal places', () => {
		const s = FloatSpan.fromString('[1.234, 9.876)');
		const r = s.round(2);
		assert.ok(Math.abs(r.lower() - 1.23) < 1e-9);
		assert.ok(Math.abs(r.upper() - 9.88) < 1e-9);
		s.free();
		r.free();
	});

	it('radians and degrees are inverse', () => {
		const s = FloatSpan.fromString('[1.0, 2.0)');
		const rad = s.radians();
		const back = rad.degrees();
		assert.ok(Math.abs(back.lower() - 1.0) < 1e-9);
		s.free();
		rad.free();
		back.free();
	});
});

describe('FloatSpan - Conversions', () => {
	it('toIntSpan returns a non-zero pointer', () => {
		const s = FloatSpan.fromString('[1.5, 10.5)');
		const ptr = s.toIntSpan();
		assert.ok(ptr !== 0);
		s.free();
	});
});

describe('FloatSpan - Topological predicates', () => {
	it('isAdjacent: [1.0, 5.0) and [5.0, 10.0) are adjacent', () => {
		const a = FloatSpan.fromString('[1.0, 5.0)');
		const b = FloatSpan.fromString('[5.0, 10.0)');
		assert.equal(a.isAdjacent(b), true);
		a.free();
		b.free();
	});

	it('isAdjacent: [1.0, 5.0) and [6.0, 10.0) are not adjacent', () => {
		const a = FloatSpan.fromString('[1.0, 5.0)');
		const b = FloatSpan.fromString('[6.0, 10.0)');
		assert.equal(a.isAdjacent(b), false);
		a.free();
		b.free();
	});

	it('isContainedIn: [2.0, 5.0) is contained in [1.0, 10.0)', () => {
		const a = FloatSpan.fromString('[2.0, 5.0)');
		const b = FloatSpan.fromString('[1.0, 10.0)');
		assert.equal(a.isContainedIn(b), true);
		a.free();
		b.free();
	});

	it('overlaps: [1.0, 5.0) and [3.0, 8.0) overlap', () => {
		const a = FloatSpan.fromString('[1.0, 5.0)');
		const b = FloatSpan.fromString('[3.0, 8.0)');
		assert.equal(a.overlaps(b), true);
		a.free();
		b.free();
	});
});

describe('FloatSpan - Distance', () => {
	it('distance is 0 for overlapping spans', () => {
		const a = FloatSpan.fromString('[1.0, 5.0)');
		const b = FloatSpan.fromString('[3.0, 8.0)');
		assert.equal(a.distance(b), 0);
		a.free();
		b.free();
	});

	it('distance between disjoint spans', () => {
		const a = FloatSpan.fromString('[1.0, 5.0)');
		const b = FloatSpan.fromString('[8.0, 12.0)');
		assert.ok(Math.abs(a.distance(b) - 3.0) < 1e-9);
		a.free();
		b.free();
	});
});

describe('FloatSpan - Set operations', () => {
	it('intersection returns overlapping region', () => {
		const a = FloatSpan.fromString('[1.0, 8.0)');
		const b = FloatSpan.fromString('[4.0, 12.0)');
		const r = a.intersection(b);
		assert.ok(r !== null);
		assert.ok(Math.abs(r!.lower() - 4.0) < 1e-9);
		assert.ok(Math.abs(r!.upper() - 8.0) < 1e-9);
		a.free();
		b.free();
		r!.free();
	});

	it('intersection returns null for disjoint spans', () => {
		const a = FloatSpan.fromString('[1.0, 5.0)');
		const b = FloatSpan.fromString('[8.0, 12.0)');
		assert.equal(a.intersection(b), null);
		a.free();
		b.free();
	});
});

describe('FloatSpan - Comparisons', () => {
	it('eq: same span is equal', () => {
		const a = FloatSpan.fromString('[1.5, 10.5)');
		const b = FloatSpan.fromString('[1.5, 10.5)');
		assert.equal(a.eq(b), true);
		a.free();
		b.free();
	});

	it('ne: different spans', () => {
		const a = FloatSpan.fromString('[1.5, 10.5)');
		const b = FloatSpan.fromString('[2.5, 10.5)');
		assert.equal(a.ne(b), true);
		a.free();
		b.free();
	});

	it('lt / gt order', () => {
		const a = FloatSpan.fromString('[1.0, 5.0)');
		const b = FloatSpan.fromString('[3.0, 8.0)');
		assert.equal(a.lt(b), true);
		assert.equal(b.gt(a), true);
		a.free();
		b.free();
	});
});
