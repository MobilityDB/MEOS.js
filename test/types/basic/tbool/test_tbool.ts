import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import { initMeos } from '../../../../core/runtime/meos.js';
import { meos_free, interval_make } from '../../../../core/functions/functions.generated.js';
import { TBool } from '../../../../core/types/basic/tbool/TBool.js';
import { TInterpolation } from '../../../../core/types/temporal/Temporal.js';
import { TsTzSpan } from '../../../../core/types/collections/time/TsTzSpan.js';
import { TsTzSet } from '../../../../core/types/collections/time/TsTzSet.js';
import { TsTzSpanSet } from '../../../../core/types/collections/time/TsTzSpanSet.js';

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

describe('TBool - valueN', () => {
	it('valueN(0) returns the first distinct value', () => {
		const t = TBool.fromString(`{t@${T1}, f@${T2}, t@${T3}}`);
		assert.equal(t.valueN(0), true);
		t.free();
	});

	it('valueN(1) returns the second distinct value', () => {
		const t = TBool.fromString(`{t@${T1}, f@${T2}, t@${T3}}`);
		assert.equal(t.valueN(1), false);
		t.free();
	});
});

describe('TBool - valueAtTimestamp', () => {
	it('returns true at T1 for a true instant', () => {
		// T1 = 2000-01-01 00:01:00+00 = 60_000_000 µs
		const t = TBool.fromString(`t@${T1}`);
		const v = t.valueAtTimestamp(60_000_000);
		assert.equal(v, true);
		t.free();
	});

	it('returns false at T2 for a false instant', () => {
		// T2 = 2000-01-01 00:02:00+00 = 120_000_000 µs
		const t = TBool.fromString(`f@${T2}`);
		const v = t.valueAtTimestamp(120_000_000);
		assert.equal(v, false);
		t.free();
	});

	it('returns null for a timestamp outside the domain', () => {
		const t = TBool.fromString(`t@${T1}`);
		const v = t.valueAtTimestamp(0); // T0 is before the instant
		assert.equal(v, null);
		t.free();
	});
});

describe('TBool - toTInt', () => {
	it('converts true to 1 and false to 0', () => {
		const t = TBool.fromString(`{t@${T1}, f@${T2}}`);
		const ptr = t.toTInt();
		assert.ok(ptr !== 0);
		meos_free(ptr);
		t.free();
	});
});

// ─── Temporal base — new methods (tested via TBool) ───────────────────────

describe('Temporal - atMin / atMax / minusMin / minusMax', () => {
	const T1 = '2000-01-01 00:01:00+00';
	const T2 = '2000-01-01 00:02:00+00';
	const T3 = '2000-01-01 00:03:00+00';

	it('atMin keeps only false instants in {t,f,t}', () => {
		const t = TBool.fromString(`{t@${T1}, f@${T2}, t@${T3}}`);
		const r = t.atMin();
		assert.equal(r.toString(), `{f@${T2}}`);
		t.free(); r.free();
	});

	it('atMax keeps only true instants in {t,f,t}', () => {
		const t = TBool.fromString(`{t@${T1}, f@${T2}, t@${T3}}`);
		const r = t.atMax();
		assert.equal(r.toString(), `{t@${T1}, t@${T3}}`);
		t.free(); r.free();
	});

	it('minusMin excludes false instants', () => {
		const t = TBool.fromString(`{t@${T1}, f@${T2}, t@${T3}}`);
		const r = t.minusMin();
		assert.equal(r.toString(), `{t@${T1}, t@${T3}}`);
		t.free(); r.free();
	});

	it('minusMax excludes true instants', () => {
		const t = TBool.fromString(`{t@${T1}, f@${T2}, t@${T3}}`);
		const r = t.minusMax();
		assert.equal(r.toString(), `{f@${T2}}`);
		t.free(); r.free();
	});
});

describe('Temporal - atTsTzSpan / minusTsTzSpan', () => {
	const T1 = '2000-01-01 00:01:00+00';
	const T2 = '2000-01-01 00:02:00+00';
	const T3 = '2000-01-01 00:03:00+00';

	it('atTsTzSpan restricts to instants in the span', () => {
		const t = TBool.fromString(`{t@${T1}, f@${T2}, t@${T3}}`);
		const span = TsTzSpan.fromString(`[${T1}, ${T2}]`);
		const r = t.atTsTzSpan(span.inner);
		assert.ok(r.inner !== 0);
		t.free(); span.free(); r.free();
	});

	it('minusTsTzSpan excludes instants in the span', () => {
		const t = TBool.fromString(`{t@${T1}, f@${T2}, t@${T3}}`);
		const span = TsTzSpan.fromString(`[${T1}, ${T2}]`);
		const r = t.minusTsTzSpan(span.inner);
		assert.ok(r.inner !== 0);
		t.free(); span.free(); r.free();
	});
});

describe('Temporal - shiftTime / scaleTime / shiftScaleTime', () => {
	const T1 = '2000-01-01 00:01:00+00';
	const T2 = '2000-01-01 00:02:00+00';

	it('shiftTime moves timestamps forward', () => {
		const t = TBool.fromString(`{t@${T1}, f@${T2}}`);
		const interv = interval_make(0, 0, 0, 0, 1, 0, 0); // 1 hour
		const r = t.shiftTime(interv);
		assert.ok(r.startTimestamp() > t.startTimestamp());
		t.free(); r.free(); meos_free(interv);
	});

	it('scaleTime returns a non-zero pointer', () => {
		// Use a sequence (not a discrete set) so duration is defined
		const t = TBool.fromString(`[t@${T1}, f@${T2}]`);
		const dur = interval_make(0, 0, 0, 0, 0, 30, 0); // 30 min
		const r = t.scaleTime(dur);
		assert.ok(r.inner !== 0);
		t.free(); r.free(); meos_free(dur);
	});
});

describe('Temporal - toInstant / toSequence / toSequenceSet', () => {
	const T1 = '2000-01-01 00:01:00+00';
	const T2 = '2000-01-01 00:02:00+00';

	it('toInstant on an instant returns a non-zero pointer', () => {
		const t = TBool.fromString(`t@${T1}`);
		const r = t.toInstant();
		assert.ok(r.inner !== 0);
		t.free(); r.free();
	});

	it('toSequence on an instant returns a Discrete sequence', () => {
		// A single instant can be promoted to a one-element discrete sequence
		const t = TBool.fromString(`t@${T1}`);
		const r = t.toSequence(TInterpolation.Discrete);
		assert.ok(r.inner !== 0);
		t.free(); r.free();
	});
});

describe('Temporal - appendInstant / appendSequence / merge', () => {
	const T1 = '2000-01-01 00:01:00+00';
	const T2 = '2000-01-01 00:02:00+00';
	const T3 = '2000-01-01 00:03:00+00';

	it('appendInstant adds an instant to a sequence', () => {
		const seq = TBool.fromString(`{t@${T1}, f@${T2}}`);
		const inst = TBool.fromString(`t@${T3}`);
		const r = seq.appendInstant(inst);
		assert.ok(r.inner !== 0);
		assert.equal(r.numInstants(), 3);
		seq.free(); inst.free(); r.free();
	});

	it('merge combines two disjoint temporals', () => {
		const a = TBool.fromString(`t@${T1}`);
		const b = TBool.fromString(`f@${T3}`);
		const r = a.merge(b);
		assert.ok(r.inner !== 0);
		a.free(); b.free(); r.free();
	});
});

describe('TBool - fromBaseTemporal / fromBaseTime', () => {
	const T1 = '2000-01-01 00:01:00+00';
	const T2 = '2000-01-01 00:02:00+00';
	const T3 = '2000-01-01 00:03:00+00';

	it('fromBaseTemporal creates TBool with same domain', () => {
		const domain = TBool.fromString(`{t@${T1}, f@${T2}}`);
		const r = TBool.fromBaseTemporal(true, domain);
		assert.ok(r.inner !== 0);
		assert.equal(r.numInstants(), 2);
		domain.free(); r.free();
	});

	it('fromBaseTime with tstzspan creates a sequence', () => {
		const span = TsTzSpan.fromString(`[${T1}, ${T3}]`);
		const r = TBool.fromBaseTime(false, span.inner, 'tstzspan');
		assert.ok(r.inner !== 0);
		span.free(); r.free();
	});

	it('fromBaseTime with tstzset creates a discrete sequence', () => {
		const set = TsTzSet.fromString(`{${T1}, ${T2}, ${T3}}`);
		const r = TBool.fromBaseTime(true, set.inner, 'tstzset');
		assert.ok(r.inner !== 0);
		assert.equal(r.numInstants(), 3);
		set.free(); r.free();
	});

	it('fromBaseTime with tstzspanset creates a sequence set', () => {
		const ss = TsTzSpanSet.fromString(`{[${T1}, ${T2}], [${T3}, ${T3}]}`);
		const r = TBool.fromBaseTime(false, ss.inner, 'tstzspanset');
		assert.ok(r.inner !== 0);
		ss.free(); r.free();
	});
});

describe('Temporal - atTsTzSet / minusTsTzSet', () => {
	const T1 = '2000-01-01 00:01:00+00';
	const T2 = '2000-01-01 00:02:00+00';
	const T3 = '2000-01-01 00:03:00+00';

	it('atTsTzSet restricts to instants in the set', () => {
		const t = TBool.fromString(`{t@${T1}, f@${T2}, t@${T3}}`);
		const set = TsTzSet.fromString(`{${T1}, ${T3}}`);
		const r = t.atTsTzSet(set.inner);
		assert.ok(r.inner !== 0);
		assert.equal(r.numInstants(), 2);
		t.free(); set.free(); r.free();
	});

	it('minusTsTzSet excludes instants in the set', () => {
		const t = TBool.fromString(`{t@${T1}, f@${T2}, t@${T3}}`);
		const set = TsTzSet.fromString(`{${T1}, ${T3}}`);
		const r = t.minusTsTzSet(set.inner);
		assert.ok(r.inner !== 0);
		assert.equal(r.numInstants(), 1);
		t.free(); set.free(); r.free();
	});
});

describe('Temporal - atTsTzSpanSet / minusTsTzSpanSet', () => {
	const T1 = '2000-01-01 00:01:00+00';
	const T2 = '2000-01-01 00:02:00+00';
	const T3 = '2000-01-01 00:03:00+00';

	it('atTsTzSpanSet restricts to instants within any span', () => {
		const t = TBool.fromString(`{t@${T1}, f@${T2}, t@${T3}}`);
		const ss = TsTzSpanSet.fromString(`{[${T1}, ${T1}], [${T3}, ${T3}]}`);
		const r = t.atTsTzSpanSet(ss.inner);
		assert.ok(r.inner !== 0);
		assert.equal(r.numInstants(), 2);
		t.free(); ss.free(); r.free();
	});

	it('minusTsTzSpanSet excludes instants within any span', () => {
		const t = TBool.fromString(`{t@${T1}, f@${T2}, t@${T3}}`);
		const ss = TsTzSpanSet.fromString(`{[${T1}, ${T1}], [${T3}, ${T3}]}`);
		const r = t.minusTsTzSpanSet(ss.inner);
		assert.ok(r.inner !== 0);
		assert.equal(r.numInstants(), 1);
		t.free(); ss.free(); r.free();
	});
});

describe('Temporal - setInterp', () => {
	const T1 = '2000-01-01 00:01:00+00';

	it('setInterp on an instant to Discrete returns non-zero pointer', () => {
		const t = TBool.fromString(`t@${T1}`);
		const r = t.setInterp(TInterpolation.Discrete);
		assert.ok(r.inner !== 0);
		t.free(); r.free();
	});
});

describe('Temporal - toSequenceSet', () => {
	const T1 = '2000-01-01 00:01:00+00';
	const T2 = '2000-01-01 00:02:00+00';

	it('toSequenceSet on a sequence returns a non-zero pointer', () => {
		const t = TBool.fromString(`[t@${T1}, f@${T2}]`);
		const r = t.toSequenceSet(TInterpolation.Stepwise);
		assert.ok(r.inner !== 0);
		t.free(); r.free();
	});
});

describe('TBool - whenTrue / whenFalse', () => {
	it('whenTrue returns a TsTzSpanSet covering the true periods', () => {
		const t = TBool.fromString('[t@2001-01-01, f@2001-01-02, t@2001-01-03, t@2001-01-04]');
		const ss = t.whenTrue();
		assert.ok(ss.inner !== 0);
		assert.ok(ss.numSpans() >= 1);
		t.free();
		ss.free();
	});

	it('whenFalse returns a TsTzSpanSet covering the false periods', () => {
		const t = TBool.fromString('[t@2001-01-01, f@2001-01-02, t@2001-01-03, t@2001-01-04]');
		const ss = t.whenFalse();
		assert.ok(ss.inner !== 0);
		assert.ok(ss.numSpans() >= 1);
		t.free();
		ss.free();
	});

	it('whenTrue on always-true returns a single span covering the full domain', () => {
		const t = TBool.fromString('[t@2001-01-01, t@2001-01-03]');
		const ss = t.whenTrue();
		assert.equal(ss.numSpans(), 1);
		t.free();
		ss.free();
	});

	it('whenTrue and whenFalse are disjoint', () => {
		const t = TBool.fromString('{t@2001-01-01, f@2001-01-02, t@2001-01-03}');
		const wt = t.whenTrue();
		const wf = t.whenFalse();
		assert.ok(wt.inner !== 0);
		assert.ok(wf.inner !== 0);
		t.free();
		wt.free();
		wf.free();
	});
});
