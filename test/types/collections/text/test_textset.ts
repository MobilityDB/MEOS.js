import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import { initMeos } from '../../../../core/runtime/meos.js';
import { TextSet } from '../../../../core/objects/objects.generated.js';

before(async () => {
	await initMeos();
});

describe('TextSet - Construction', () => {
	it('fromString returns a non-zero pointer', () => {
		const s = TextSet.in('{"apple", "banana", "cherry"}');
		assert.ok(s.ptr !== 0);
		s.free();
	});

	it('toString round-trips WKT', () => {
		const s = TextSet.in('{"apple", "banana", "cherry"}');
		const wkt = s.toString();
		assert.ok(wkt.includes('apple'));
		assert.ok(wkt.includes('banana'));
		s.free();
	});

	it('fromHexWKB round-trips through asHexWKB', () => {
		const s1 = TextSet.in('{"apple", "banana"}');
		const hex = s1.asHexWKB();
		assert.ok(typeof hex === 'string' && hex.length > 0);
		const s2 = TextSet.fromHexWKB(hex);
		assert.equal(s2.toString(), s1.toString());
		s1.free();
		s2.free();
	});

	it('fromBinary round-trips through asBinary', () => {
		const s1 = TextSet.in('{"apple", "banana"}');
		const wkb = s1.asWKB();
		assert.equal(Buffer.from(wkb).toString('hex').toUpperCase(), s1.asHexWKB());
		assert.ok(wkb instanceof Uint8Array && wkb.length > 0);
		const s2 = TextSet.fromWKB(wkb);
		assert.equal(s2.toString(), s1.toString());
		s1.free();
		s2.free();
	});

	it('copy produces a distinct pointer with identical WKT', () => {
		const s = TextSet.in('{"apple", "banana"}');
		const c = s.copy();
		assert.notEqual(s.ptr, c.ptr);
		assert.equal(c.toString(), s.toString());
		s.free();
		c.free();
	});
});

describe('TextSet - Accessors', () => {
	it('numValues returns correct count', () => {
		const s = TextSet.in('{"apple", "banana", "cherry"}');
		assert.equal(s.numValues(), 3);
		s.free();
	});

	it('startValue returns lexicographically smallest string', () => {
		const s = TextSet.in('{"apple", "banana", "cherry"}');
		assert.equal(s.startValue(), 'apple');
		s.free();
	});

	it('endValue returns lexicographically largest string', () => {
		const s = TextSet.in('{"apple", "banana", "cherry"}');
		assert.equal(s.endValue(), 'cherry');
		s.free();
	});

	it('valueN returns the element at a 1-based index, as MEOS counts', () => {
		const s = TextSet.in('{"apple", "banana", "cherry"}');
		assert.equal(s.valueN(1), 'apple');
		assert.equal(s.valueN(2), 'banana');
		assert.equal(s.valueN(3), 'cherry');
		s.free();
	});

	it('valueN returns null for out-of-range index', () => {
		const s = TextSet.in('{"apple", "banana"}');
		assert.equal(s.valueN(6), null);
		s.free();
	});

	it('hash returns a number', () => {
		const s = TextSet.in('{"apple", "banana"}');
		assert.equal(typeof s.hash(), 'number');
		s.free();
	});
});

describe('TextSet - Set predicates', () => {
	it('isContainedIn: {"apple"} is contained in {"apple", "banana"}', () => {
		const a = TextSet.in('{"apple"}');
		const b = TextSet.in('{"apple", "banana"}');
		assert.equal(a.contained(b), true);
		a.free();
		b.free();
	});

	it('contains: {"apple", "banana"} contains {"banana"}', () => {
		const a = TextSet.in('{"apple", "banana"}');
		const b = TextSet.in('{"banana"}');
		assert.equal(a.contains(b), true);
		a.free();
		b.free();
	});

	it('overlaps: {"apple", "banana"} and {"banana", "cherry"} overlap', () => {
		const a = TextSet.in('{"apple", "banana"}');
		const b = TextSet.in('{"banana", "cherry"}');
		assert.equal(a.overlaps(b), true);
		a.free();
		b.free();
	});

	it('overlaps: {"apple"} and {"cherry"} do not overlap', () => {
		const a = TextSet.in('{"apple"}');
		const b = TextSet.in('{"cherry"}');
		assert.equal(a.overlaps(b), false);
		a.free();
		b.free();
	});
});

describe('TextSet - Set operations', () => {
	it('intersection returns shared elements', () => {
		const a = TextSet.in('{"apple", "banana", "cherry"}');
		const b = TextSet.in('{"banana", "cherry", "date"}');
		const r = a.intersection(b);
		assert.ok(r !== null);
		const wkt = r!.toString();
		assert.ok(wkt.includes('banana'));
		assert.ok(wkt.includes('cherry'));
		a.free();
		b.free();
		r!.free();
	});

	it('intersection returns null for disjoint sets', () => {
		const a = TextSet.in('{"apple"}');
		const b = TextSet.in('{"cherry"}');
		assert.equal(a.intersection(b), null);
		a.free();
		b.free();
	});

	it('union contains elements from both', () => {
		const a = TextSet.in('{"apple"}');
		const b = TextSet.in('{"cherry"}');
		const r = a.union(b);
		assert.equal(r!.numValues(), 2);
		r!.free();
		a.free();
		b.free();
	});

	it('minus removes elements present in other', () => {
		const a = TextSet.in('{"apple", "banana", "cherry"}');
		const b = TextSet.in('{"banana"}');
		const r = a.minus(b);
		assert.equal(r!.numValues(), 2);
		r!.free();
		a.free();
		b.free();
	});
});

describe('TextSet - Comparisons', () => {
	it('eq: same set is equal', () => {
		const a = TextSet.in('{"apple", "banana"}');
		const b = TextSet.in('{"apple", "banana"}');
		assert.equal(a.eq(b), true);
		a.free();
		b.free();
	});

	it('ne: different sets', () => {
		const a = TextSet.in('{"apple"}');
		const b = TextSet.in('{"banana"}');
		assert.equal(a.ne(b), true);
		a.free();
		b.free();
	});

	it('lt / gt order', () => {
		const a = TextSet.in('{"apple"}');
		const b = TextSet.in('{"banana"}');
		assert.equal(a.lt(b), true);
		assert.equal(b.gt(a), true);
		a.free();
		b.free();
	});

	it('le / ge', () => {
		const a = TextSet.in('{"apple"}');
		const b = TextSet.in('{"apple"}');
		assert.equal(a.le(b), true);
		assert.equal(a.ge(b), true);
		a.free();
		b.free();
	});
});

describe('TextSet - Text operations', () => {
	it('lower() lowercases all strings', () => {
		const s = TextSet.in('{"Apple", "BANANA"}');
		const lo = s.lower();
		const wkt = lo.toString();
		assert.ok(wkt.includes('apple'));
		assert.ok(wkt.includes('banana'));
		s.free();
		lo.free();
	});

	it('upper() uppercases all strings', () => {
		const s = TextSet.in('{"apple", "banana"}');
		const up = s.upper();
		const wkt = up.toString();
		assert.ok(wkt.includes('APPLE'));
		assert.ok(wkt.includes('BANANA'));
		s.free();
		up.free();
	});

	it('initcap() capitalizes first letter of each word', () => {
		const s = TextSet.in('{"hello world", "foo bar"}');
		const ic = s.initcap();
		const wkt = ic.toString();
		assert.ok(wkt.includes('Hello World'));
		assert.ok(wkt.includes('Foo Bar'));
		s.free();
		ic.free();
	});

	it('lower() returns a new TextSet, original unchanged', () => {
		const s = TextSet.in('{"Apple"}');
		const lo = s.lower();
		assert.ok(s.toString().includes('Apple'));
		assert.ok(lo.toString().includes('apple'));
		s.free();
		lo.free();
	});
});
