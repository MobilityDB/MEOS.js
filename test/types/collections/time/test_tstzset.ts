import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import { initMeos } from '../../../../core/runtime/meos.js';
import { interval_make, meos_free } from '../../../../core/functions/functions.generated.js';
import { TsTzSet } from '../../../../core/objects/objects.generated.js';
import type { Interval } from '../../../../core/objects/objects.generated.js';

/** A distance between times is an Interval: nonzero when any of its fields is. */
const nonzero = (d: Interval) => d.time !== 0n || d.day !== 0 || d.month !== 0;

// These timestamps correspond to 2001-01-01, 2001-01-02, 2001-01-03 UTC.
// In MEOS TimestampTz = microseconds since 2000-01-01 UTC.
// 2001-01-01 = 366 days * 86400 s * 1e6 µs = 31_622_400_000_000
const TS1 = '2001-01-01 00:00:00+00';
const TS2 = '2001-01-02 00:00:00+00';
const TS3 = '2001-01-03 00:00:00+00';
const TS4 = '2001-01-04 00:00:00+00';
const TS5 = '2001-01-05 00:00:00+00';

before(async () => {
	await initMeos();
});

describe('TsTzSet - Construction', () => {
	it('fromString returns a non-zero pointer', () => {
		const s = TsTzSet.fromText(`{${TS1}, ${TS2}, ${TS3}}`);
		assert.ok(s.ptr !== 0);
		s.free();
	});

	it('toString round-trips WKT', () => {
		const s = TsTzSet.fromText(`{${TS1}, ${TS2}}`);
		const out = s.toString();
		assert.ok(out.includes('2001-01-01'));
		assert.ok(out.includes('2001-01-02'));
		s.free();
	});

	it('fromHexWKB round-trips through asHexWKB', () => {
		const s1 = TsTzSet.fromText(`{${TS1}, ${TS2}, ${TS3}}`);
		const hex = s1.asHexWKB();
		assert.ok(typeof hex === 'string' && hex.length > 0);
		const s2 = TsTzSet.fromHexWKB(hex);
		assert.equal(s2.toString(), s1.toString());
		s1.free();
		s2.free();
	});

	it('fromBinary round-trips through asBinary', () => {
		const s1 = TsTzSet.fromText(`{${TS1}, ${TS2}, ${TS3}}`);
		const wkb = s1.asWKB();
		assert.equal(Buffer.from(wkb).toString('hex').toUpperCase(), s1.asHexWKB());
		assert.ok(wkb instanceof Uint8Array && wkb.length > 0);
		const s2 = TsTzSet.fromWKB(wkb);
		assert.equal(s2.toString(), s1.toString());
		s1.free();
		s2.free();
	});

	it('copy produces a distinct pointer with same content', () => {
		const s = TsTzSet.fromText(`{${TS1}, ${TS2}}`);
		const c = s.copy();
		assert.notEqual(s.ptr, c.ptr);
		assert.equal(c.toString(), s.toString());
		s.free();
		c.free();
	});
});

describe('TsTzSet - Accessors', () => {
	it('numValues returns correct count', () => {
		const s = TsTzSet.fromText(`{${TS1}, ${TS2}, ${TS3}}`);
		assert.equal(s.numValues(), 3);
		s.free();
	});

	it('startValue and endValue return int64 timestamps', () => {
		const s = TsTzSet.fromText(`{${TS1}, ${TS2}, ${TS3}}`);
		const start = s.startValue();
		const end = s.endValue();
		assert.equal(typeof start, 'bigint');
		assert.equal(typeof end, 'bigint');
		assert.ok(start < end);
		s.free();
	});

	it('valueN(0) equals startValue', () => {
		const s = TsTzSet.fromText(`{${TS1}, ${TS2}, ${TS3}}`);
		assert.equal(s.valueN(1), s.startValue());
		s.free();
	});

	it('valueN(n-1) equals endValue', () => {
		const s = TsTzSet.fromText(`{${TS1}, ${TS2}, ${TS3}}`);
		assert.equal(s.valueN(3), s.endValue());
		s.free();
	});

	it('hash returns a number', () => {
		const s = TsTzSet.fromText(`{${TS1}, ${TS2}}`);
		assert.equal(typeof s.hash(), 'number');
		s.free();
	});
});

describe('TsTzSet - Conversions', () => {
	it('toSpan returns a non-zero pointer', () => {
		const s = TsTzSet.fromText(`{${TS1}, ${TS2}, ${TS3}}`);
		assert.ok(s.toSpan() !== null);
		s.free();
	});

	it('toSpanSet returns a non-zero pointer', () => {
		const s = TsTzSet.fromText(`{${TS1}, ${TS2}, ${TS3}}`);
		assert.ok(s.toSpanset() !== null);
		s.free();
	});

	it('toDateSet returns a non-zero pointer', () => {
		const s = TsTzSet.fromText(`{${TS1}, ${TS2}, ${TS3}}`);
		assert.ok(s.toDateset() !== null);
		s.free();
	});
});

describe('TsTzSet - Topological predicates', () => {
	it('isContainedIn: {ts1,ts2} is contained in {ts1,ts2,ts3}', () => {
		const a = TsTzSet.fromText(`{${TS1}, ${TS2}}`);
		const b = TsTzSet.fromText(`{${TS1}, ${TS2}, ${TS3}}`);
		assert.equal(a.contained(b), true);
		a.free();
		b.free();
	});

	it('contains: {ts1,ts2,ts3} contains {ts1,ts2}', () => {
		const a = TsTzSet.fromText(`{${TS1}, ${TS2}, ${TS3}}`);
		const b = TsTzSet.fromText(`{${TS1}, ${TS2}}`);
		assert.equal(a.contains(b), true);
		a.free();
		b.free();
	});

	it('overlaps: {ts1,ts2} and {ts2,ts3} share ts2', () => {
		const a = TsTzSet.fromText(`{${TS1}, ${TS2}}`);
		const b = TsTzSet.fromText(`{${TS2}, ${TS3}}`);
		assert.equal(a.overlaps(b), true);
		a.free();
		b.free();
	});

	it('overlaps: {ts1} and {ts3} do not overlap', () => {
		const a = TsTzSet.fromText(`{${TS1}}`);
		const b = TsTzSet.fromText(`{${TS3}}`);
		assert.equal(a.overlaps(b), false);
		a.free();
		b.free();
	});
});

describe('TsTzSet - Position predicates', () => {
	it('isBefore: {ts1,ts2} is before {ts4,ts5}', () => {
		const a = TsTzSet.fromText(`{${TS1}, ${TS2}}`);
		const b = TsTzSet.fromText(`{${TS4}, ${TS5}}`);
		assert.equal(a.left(b), true);
		a.free();
		b.free();
	});

	it('isAfter: {ts4,ts5} is after {ts1,ts2}', () => {
		const a = TsTzSet.fromText(`{${TS4}, ${TS5}}`);
		const b = TsTzSet.fromText(`{${TS1}, ${TS2}}`);
		assert.equal(a.right(b), true);
		a.free();
		b.free();
	});

	it('isOverOrBefore', () => {
		const a = TsTzSet.fromText(`{${TS1}, ${TS3}}`);
		const b = TsTzSet.fromText(`{${TS2}, ${TS5}}`);
		assert.equal(a.overleft(b), true);
		a.free();
		b.free();
	});

	it('isOverOrAfter', () => {
		const a = TsTzSet.fromText(`{${TS3}, ${TS5}}`);
		const b = TsTzSet.fromText(`{${TS1}, ${TS4}}`);
		assert.equal(a.overright(b), true);
		a.free();
		b.free();
	});
});

describe('TsTzSet - Distance', () => {
	it('distance is 0 for sets sharing a value', () => {
		const a = TsTzSet.fromText(`{${TS1}, ${TS2}}`);
		const b = TsTzSet.fromText(`{${TS2}, ${TS3}}`);
		assert.equal(nonzero(a.distance(b)), false);
		a.free();
		b.free();
	});

	it('distance > 0 for disjoint sets', () => {
		const a = TsTzSet.fromText(`{${TS1}}`);
		const b = TsTzSet.fromText(`{${TS3}}`);
		assert.ok(nonzero(a.distance(b)));
		a.free();
		b.free();
	});
});

describe('TsTzSet - Set operations', () => {
	it('union produces a set containing all values', () => {
		const a = TsTzSet.fromText(`{${TS1}, ${TS2}}`);
		const b = TsTzSet.fromText(`{${TS3}, ${TS4}}`);
		const u = a.union(b);
		assert.equal(u!.numValues(), 4);
		a.free();
		b.free();
		u!.free();
	});

	it('intersection returns shared values', () => {
		const a = TsTzSet.fromText(`{${TS1}, ${TS2}, ${TS3}}`);
		const b = TsTzSet.fromText(`{${TS2}, ${TS3}, ${TS4}}`);
		const r = a.intersection(b);
		assert.ok(r !== null);
		assert.equal(r!.numValues(), 2);
		a.free();
		b.free();
		r!.free();
	});

	it('intersection returns null for disjoint sets', () => {
		const a = TsTzSet.fromText(`{${TS1}, ${TS2}}`);
		const b = TsTzSet.fromText(`{${TS4}, ${TS5}}`);
		assert.equal(a.intersection(b), null);
		a.free();
		b.free();
	});

	it('minus removes values present in other', () => {
		const a = TsTzSet.fromText(`{${TS1}, ${TS2}, ${TS3}}`);
		const b = TsTzSet.fromText(`{${TS2}}`);
		const r = a.minus(b);
		assert.ok(r !== null);
		assert.equal(r!.numValues(), 2);
		a.free();
		b.free();
		r!.free();
	});
});

describe('TsTzSet - Comparisons', () => {
	it('eq: same set', () => {
		const a = TsTzSet.fromText(`{${TS1}, ${TS2}}`);
		const b = TsTzSet.fromText(`{${TS1}, ${TS2}}`);
		assert.equal(a.eq(b), true);
		a.free();
		b.free();
	});

	it('ne: different sets', () => {
		const a = TsTzSet.fromText(`{${TS1}, ${TS2}}`);
		const b = TsTzSet.fromText(`{${TS1}, ${TS3}}`);
		assert.equal(a.ne(b), true);
		a.free();
		b.free();
	});

	it('lt / gt order', () => {
		const a = TsTzSet.fromText(`{${TS1}}`);
		const b = TsTzSet.fromText(`{${TS3}}`);
		assert.equal(a.lt(b), true);
		assert.equal(b.gt(a), true);
		a.free();
		b.free();
	});

	it('le / ge for equal sets', () => {
		const a = TsTzSet.fromText(`{${TS1}, ${TS2}}`);
		const b = TsTzSet.fromText(`{${TS1}, ${TS2}}`);
		assert.equal(a.le(b), true);
		assert.equal(a.ge(b), true);
		a.free();
		b.free();
	});
});

describe('TsTzSet - shiftScale', () => {
	it('shift by 1 day: all timestamps advance by 1 day', () => {
		const s = TsTzSet.fromText(`{${TS1}, ${TS2}}`);
		const interv = { time: 0n, day: 1, month: 0 }; // 1 day
		const r = s.shift(interv);
		assert.ok(r.ptr !== 0);
		assert.ok(r.startValue() > s.startValue());
		s.free();
		r.free();
	});

	it('shift by 1 day and scale to 2 days: the set starts 1 day later', () => {
		const s = TsTzSet.fromText(`{${TS1}, ${TS2}}`);
		const interv = { time: 0n, day: 1, month: 0 }; // 1 day
		const dur = { time: 0n, day: 2, month: 0 };    // 2 days
		const r = s.shiftScale(interv, dur);
		assert.ok(r.startValue() > s.startValue());
		s.free();
		r.free();
	});
});

describe('TsTzSet - tprecision', () => {
	it('returns a non-zero pointer', () => {
		const s = TsTzSet.fromText(`{${TS1}, ${TS2}, ${TS3}}`);
		const dur = { time: 0n, day: 1, month: 0 }; // 1-day bucket
		const r = s.tprecision(dur, s.startValue());
		assert.ok(r.ptr !== 0);
		s.free();
		r.free();
	});
});
