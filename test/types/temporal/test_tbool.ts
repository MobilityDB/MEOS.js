import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import { initMeos } from '../../../core/runtime/meos';
import { TBool } from '../../../core/types/base/TBool';
import { TInterpolation } from '../../../core/types/temporal/Temporal';

const T0 = '2000-01-01 00:00:00+00';
const T1 = '2000-01-01 00:01:00+00'; // +1 min
const T2 = '2000-01-01 00:02:00+00'; // +2 min
const T3 = '2000-01-01 00:03:00+00'; // +3 min

before(async () => {
	await initMeos();
});

describe('TBool - Instant', () => {
	it('fromString returns a non-zero inner pointer', () => {
		const t = TBool.fromString(`t@${T0}`);
		assert.ok(t.inner !== 0);
		t.free();
	});

	it('toString round-trips WKT', () => {
		const t = TBool.fromString(`t@${T0}`);
		assert.equal(t.toString(), `t@${T0}`);
		t.free();
	});

	it('startValue / endValue on true instant', () => {
		const t = TBool.fromString(`t@${T0}`);
		assert.equal(t.startValue(), true);
		assert.equal(t.endValue(), true);
		t.free();
	});

	it('startValue / endValue on false instant', () => {
		const f = TBool.fromString(`f@${T0}`);
		assert.equal(f.startValue(), false);
		assert.equal(f.endValue(), false);
		f.free();
	});

	it('fromInstant constructs a TBool instant', () => {
		const t = TBool.fromInstant(true, 60_000_000);
		assert.ok(t.inner !== 0);
		assert.match(t.toString(), /^t@/);
		t.free();
	});
});

describe('TBool - Sequence', () => {
	let seq: TBool;

	before(() => {
		seq = TBool.fromString(`[t@${T1}, f@${T2}, t@${T3}]`);
	});

	it('toString round-trips WKT', () => {
		assert.equal(seq.toString(), `[t@${T1}, f@${T2}, t@${T3}]`);
	});

	it('startValue = true, endValue = true', () => {
		assert.equal(seq.startValue(), true);
		assert.equal(seq.endValue(), true);
	});

	it('numInstants = 3', () => {
		assert.equal(seq.numInstants(), 3);
	});

	it('numTimestamps = 3', () => {
		assert.equal(seq.numTimestamps(), 3);
	});

	it('interpolation = Stepwise', () => {
		assert.equal(seq.interpolation(), TInterpolation.Stepwise);
	});

	it('startInstant WKT starts with "t@"', () => {
		const si = seq.startInstant();
		assert.match(si.toString(), /^t@/);
	});

	it('endInstant WKT starts with "t@"', () => {
		const ei = seq.endInstant();
		assert.match(ei.toString(), /^t@/);
	});
});

describe('TBool - Discrete sequence', () => {
	it('round-trips WKT and interpolation = Discrete', () => {
		const wkt = `{t@${T1}, f@${T2}, t@${T3}}`;
		const t = TBool.fromString(wkt);
		assert.equal(t.toString(), wkt);
		assert.equal(t.interpolation(), TInterpolation.Discrete);
		t.free();
	});
});

describe('TBool - Logical operations', () => {
	let t: TBool;
	let f: TBool;

	before(() => {
		t = TBool.fromString(`[t@${T1}, f@${T3}]`);
		f = TBool.fromString(`[f@${T1}, t@${T3}]`);
	});

	it('not() returns a TBool starting with "["', () => {
		const nt = t.not();
		assert.ok(nt.inner !== 0);
		assert.match(nt.toString(), /^\[/);
		nt.free();
	});

	it('and(TBool) returns non-zero', () => {
		const r = t.and(f);
		assert.ok(r.inner !== 0);
		r.free();
	});

	it('and(true) returns non-zero', () => {
		const r = t.and(true);
		assert.ok(r.inner !== 0);
		r.free();
	});

	it('or(TBool) returns non-zero', () => {
		const r = t.or(f);
		assert.ok(r.inner !== 0);
		r.free();
	});

	it('or(false) returns non-zero', () => {
		const r = t.or(false);
		assert.ok(r.inner !== 0);
		r.free();
	});
});

describe('TBool - Ever / always', () => {
	let t: TBool;

	before(() => {
		t = TBool.fromString(`{t@${T1}, f@${T2}}`);
	});

	it('everEq(true)  = true', () => assert.equal(t.everEq(true), true));
	it('everEq(false) = true', () => assert.equal(t.everEq(false), true));
	it('alwaysEq(true)  = false', () => assert.equal(t.alwaysEq(true), false));
	it('alwaysEq(false) = false', () => assert.equal(t.alwaysEq(false), false));
	it('neverEq(true)  = false', () => assert.equal(t.neverEq(true), false));
	it('neverEq(false) = false', () => assert.equal(t.neverEq(false), false));
});

describe('TBool - Temporal comparisons', () => {
	let t: TBool;

	before(() => {
		t = TBool.fromString(`[t@${T1}, f@${T2}]`);
	});

	it('temporalEq(true) returns a TBool with non-zero pointer', () => {
		const r = t.temporalEq(true);
		assert.ok(r.inner !== 0);
		r.free();
	});

	it('temporalNe(true) returns a TBool with non-zero pointer', () => {
		const r = t.temporalNe(true);
		assert.ok(r.inner !== 0);
		r.free();
	});
});

describe('TBool - Restrictions', () => {
	let t: TBool;

	before(() => {
		t = TBool.fromString(`{t@${T1}, f@${T2}, t@${T3}}`);
	});

	it('at(true) keeps only true instants', () => {
		const r = t.at(true);
		assert.equal(r.toString(), `{t@${T1}, t@${T3}}`);
		r.free();
	});

	it('at(false) keeps only false instants', () => {
		const r = t.at(false);
		assert.equal(r.toString(), `{f@${T2}}`);
		r.free();
	});

	it('minus(true) = complement of at(true)', () => {
		const r = t.minus(true);
		assert.equal(r.toString(), `{f@${T2}}`);
		r.free();
	});
});

describe('TBool - Copy', () => {
	it('copy() produces a distinct pointer with identical WKT', () => {
		const t = TBool.fromString(`t@${T0}`);
		const cpy = t.copy();
		assert.ok(cpy.inner !== 0);
		assert.notEqual(cpy.inner, t.inner);
		assert.equal(cpy.toString(), t.toString());
		t.free();
		cpy.free();
	});
});

describe('TBool - Timestamps & duration', () => {
	let t: TBool;

	before(() => {
		t = TBool.fromString(`[t@${T1}, f@${T2}, t@${T3}]`);
	});

	it('startTimestamp < endTimestamp', () => {
		const ts0 = t.startTimestamp();
		const ts1 = t.endTimestamp();
		assert.ok(ts1 > ts0, `expected end (${ts1}) > start (${ts0})`);
	});

	it('durationMs returns a number', () => {
		assert.equal(typeof t.durationMs(), 'number');
	});
});
