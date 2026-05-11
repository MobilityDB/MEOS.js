import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import { initMeos } from '../../../core/runtime/meos';
import { TInt } from '../../../core/types/base/TInt';
import { TBool } from '../../../core/types/base/TBool';
import { TInterpolation } from '../../../core/types/temporal/Temporal';
import { TFloat } from '../../../core/types/base/TFloat';
import { TsTzSpan } from '../../../core/types/time/TsTzSpan';
import { TsTzSet } from '../../../core/types/time/TsTzSet';
import { TsTzSpanSet } from '../../../core/types/time/TsTzSpanSet';
import { IntSpan } from '../../../core/types/number/IntSpan';
import { IntSpanSet } from '../../../core/types/number/IntSpanSet';
import { TBox } from '../../../core/types/boxes/TBox';

const T0 = '2000-01-01 00:00:00+00';
const T1 = '2000-01-01 00:01:00+00'; // +1 min
const T2 = '2000-01-01 00:02:00+00'; // +2 min
const T3 = '2000-01-01 00:03:00+00'; // +3 min

before(async () => {
	await initMeos();
});

describe('TInt - Instant', () => {
	it('fromString returns a non-zero inner pointer', () => {
		const t = TInt.fromString(`1@${T0}`);
		assert.ok(t.inner !== 0);
		t.free();
	});

	it('toString round-trips WKT', () => {
		const t = TInt.fromString(`42@${T0}`);
		assert.equal(t.toString(), `42@${T0}`);
		t.free();
	});

	it('startValue / endValue', () => {
		const t = TInt.fromString(`7@${T0}`);
		assert.equal(t.startValue(), 7);
		assert.equal(t.endValue(), 7);
		t.free();
	});

	it('fromInstant constructs a TInt instant', () => {
		// T1 = +1 min = 60 000 000 µs
		const t = TInt.fromInstant(99, 60_000_000);
		assert.ok(t.inner !== 0);
		assert.match(t.toString(), /^99@/);
		t.free();
	});
});

describe('TInt - Discrete sequence', () => {
	let seq: TInt;

	before(() => {
		seq = TInt.fromString(`{1@${T1}, 2@${T2}, 3@${T3}}`);
	});

	it('toString round-trips WKT', () => {
		assert.equal(seq.toString(), `{1@${T1}, 2@${T2}, 3@${T3}}`);
	});

	it('startValue = 1, endValue = 3', () => {
		assert.equal(seq.startValue(), 1);
		assert.equal(seq.endValue(), 3);
	});

	it('minValue = 1, maxValue = 3', () => {
		assert.equal(seq.minValue(), 1);
		assert.equal(seq.maxValue(), 3);
	});

	it('numInstants = 3', () => {
		assert.equal(seq.numInstants(), 3);
	});

	it('numTimestamps = 3', () => {
		assert.equal(seq.numTimestamps(), 3);
	});

	it('interpolation = Discrete', () => {
		assert.equal(seq.interpolation(), TInterpolation.Discrete);
	});

	it('startInstant WKT starts with "1@"', () => {
		assert.match(seq.startInstant().toString(), /^1@/);
	});

	it('endInstant WKT starts with "3@"', () => {
		assert.match(seq.endInstant().toString(), /^3@/);
	});
});

describe('TInt - Step sequence', () => {
	it('round-trips WKT and interpolation = Stepwise', () => {
		const wkt = `[1@${T1}, 2@${T2}, 3@${T3}]`;
		const t = TInt.fromString(wkt);
		assert.equal(t.toString(), wkt);
		assert.equal(t.interpolation(), TInterpolation.Stepwise);
		t.free();
	});
});

describe('TInt - Arithmetic', () => {
	let t: TInt;

	before(() => {
		t = TInt.fromString(`{1@${T1}, 2@${T2}, 3@${T3}}`);
	});

	it('add(10) shifts all values by 10', () => {
		const r = t.add(10);
		assert.equal(r.startValue(), 11);
		assert.equal(r.endValue(), 13);
		r.free();
	});

	it('sub(1) shifts all values by -1', () => {
		const r = t.sub(1);
		assert.equal(r.startValue(), 0);
		assert.equal(r.endValue(), 2);
		r.free();
	});

	it('mult(3) multiplies all values', () => {
		const r = t.mult(3);
		assert.equal(r.startValue(), 3);
		assert.equal(r.endValue(), 9);
		r.free();
	});

	it('div(2) integer-divides all values (1÷2=0, 2÷2=1, 3÷2=1)', () => {
		const r = t.div(2);
		assert.equal(r.startValue(), 0);
		assert.equal(r.endValue(), 1);
		r.free();
	});
});

describe('TInt - Restrictions', () => {
	let t: TInt;

	before(() => {
		t = TInt.fromString(`{1@${T1}, 2@${T2}, 1@${T3}}`);
	});

	it('at(1) keeps only instants with value 1', () => {
		const r = t.at(1);
		assert.equal(r.toString(), `{1@${T1}, 1@${T3}}`);
		r.free();
	});

	it('minus(1) keeps only instants with value != 1', () => {
		const r = t.minus(1);
		assert.equal(r.toString(), `{2@${T2}}`);
		r.free();
	});
});

describe('TInt - Ever / always', () => {
	let t: TInt;

	before(() => {
		t = TInt.fromString(`{1@${T1}, 2@${T2}, 3@${T3}}`);
	});

	it('everEq(2) = true', () => assert.equal(t.everEq(2), true));
	it('everEq(9) = false', () => assert.equal(t.everEq(9), false));
	it('alwaysEq(2) = false', () => assert.equal(t.alwaysEq(2), false));
	it('everLt(3) = true', () => assert.equal(t.everLt(3), true));
	it('everGt(1) = true', () => assert.equal(t.everGt(1), true));
	it('alwaysLt(4) = true', () => assert.equal(t.alwaysLt(4), true));
	it('alwaysGe(1) = true', () => assert.equal(t.alwaysGe(1), true));
	it('everNe(5) = true', () => assert.equal(t.everNe(5), true));
	it('alwaysNe(9) = true', () => assert.equal(t.alwaysNe(9), true));
});

describe('TInt - Temporal comparisons', () => {
	let t: TInt;

	before(() => {
		t = TInt.fromString(`{1@${T1}, 2@${T2}, 3@${T3}}`);
	});

	it('temporalEq(2) returns a TBool', () => {
		const r = t.temporalEq(2);
		assert.ok(r instanceof TBool);
		assert.ok(r.inner !== 0);
		assert.equal(r.startValue(), false);
		r.free();
	});

	it('temporalLt(3) returns a TBool (T1 and T2 are < 3)', () => {
		const r = t.temporalLt(3);
		assert.ok(r.inner !== 0);
		assert.equal(r.startValue(), true);
		r.free();
	});

	it('temporalGe(2) returns a TBool (T2 and T3 are >= 2)', () => {
		const r = t.temporalGe(2);
		assert.ok(r.inner !== 0);
		assert.equal(r.endValue(), true);
		r.free();
	});
});

describe('TInt - Copy', () => {
	it('copy() produces a distinct pointer with identical WKT', () => {
		const t = TInt.fromString(`5@${T0}`);
		const cpy = t.copy();
		assert.ok(cpy.inner !== 0);
		assert.notEqual(cpy.inner, t.inner);
		assert.equal(cpy.toString(), t.toString());
		t.free();
		cpy.free();
	});
});

describe('TInt - Timestamps & duration', () => {
	let t: TInt;

	before(() => {
		t = TInt.fromString(`[1@${T1}, 2@${T2}, 3@${T3}]`);
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

describe('TInt - valueN', () => {
	it('valueN(0) returns value at first instant', () => {
		const t = TInt.fromString(`{1@${T1}, 2@${T2}, 3@${T3}}`);
		assert.equal(t.valueN(0), 1);
		t.free();
	});

	it('valueN(2) returns value at third instant', () => {
		const t = TInt.fromString(`{1@${T1}, 2@${T2}, 3@${T3}}`);
		assert.equal(t.valueN(2), 3);
		t.free();
	});
});

describe('TInt - valueAtTimestamp', () => {
	it('returns value at an exact instant timestamp', () => {
		// T1 = 2000-01-01 00:01:00+00 = 60_000_000 µs
		const t = TInt.fromString(`{42@${T1}}`);
		const v = t.valueAtTimestamp(60_000_000);
		assert.equal(v, 42);
		t.free();
	});

	it('returns null for a timestamp before the temporal starts', () => {
		const t = TInt.fromString(`{5@${T1}}`);
		const v = t.valueAtTimestamp(0); // T0 is before T1
		assert.equal(v, null);
		t.free();
	});
});

describe('TInt - shiftValue / scaleValue / shiftScaleValue', () => {
	it('shiftValue(10) adds 10 to every value', () => {
		const t = TInt.fromString(`{1@${T1}, 2@${T2}, 3@${T3}}`);
		const r = t.shiftValue(10);
		assert.equal(r.startValue(), 11);
		assert.equal(r.endValue(), 13);
		t.free();
		r.free();
	});

	it('scaleValue(4): value range is scaled to width 4', () => {
		const t = TInt.fromString(`{0@${T1}, 2@${T2}, 4@${T3}}`);
		const r = t.scaleValue(4);
		assert.equal(r.minValue(), 0);
		assert.equal(r.maxValue(), 4);
		t.free();
		r.free();
	});

	it('shiftScaleValue(10, 6): shifts by 10 and scales to width 6', () => {
		const t = TInt.fromString(`{0@${T1}, 2@${T2}, 4@${T3}}`);
		const r = t.shiftScaleValue(10, 6);
		assert.equal(r.minValue(), 10);
		assert.equal(r.maxValue(), 16);
		t.free();
		r.free();
	});
});

// ─── TNumber methods (tested via TInt) ─────────────────────────────────────

describe('TNumber - integral / avgValue / timeWeightedAverage', () => {
	it('integral returns a number', () => {
		const t = TInt.fromString(`[1@${T1}, 3@${T3}]`);
		assert.equal(typeof t.integral(), 'number');
		t.free();
	});

	it('avgValue returns a number', () => {
		const t = TInt.fromString(`{1@${T1}, 3@${T2}, 5@${T3}}`);
		assert.equal(typeof t.avgValue(), 'number');
		t.free();
	});

	it('timeWeightedAverage returns a number', () => {
		const t = TInt.fromString(`[1@${T1}, 3@${T3}]`);
		assert.equal(typeof t.timeWeightedAverage(), 'number');
		t.free();
	});
});

describe('TNumber - abs / deltaValue / trend', () => {
	it('abs of negative values returns positive', () => {
		const t = TInt.fromString(`{-2@${T1}, 3@${T2}}`);
		const r = t.abs();
		assert.equal(r.startValue(), 2);
		t.free(); r.free();
	});

	it('deltaValue returns non-zero pointer', () => {
		const t = TInt.fromString(`{1@${T1}, 3@${T2}, 6@${T3}}`);
		const r = t.deltaValue();
		assert.ok(r.inner !== 0);
		t.free(); r.free();
	});

	it('trend on a linear TFloat returns non-zero pointer', () => {
		const t = TFloat.fromString(`[1.0@${T1}, 3.0@${T2}, 6.0@${T3}]`);
		const r = t.trend();
		assert.ok(r.inner !== 0);
		t.free(); r.free();
	});
});

describe('TNumber - toValueSpan / toTBox', () => {
	it('toValueSpan returns a non-zero pointer', () => {
		const t = TInt.fromString(`{1@${T1}, 5@${T2}}`);
		assert.ok(t.toValueSpan() !== 0);
		t.free();
	});

	it('toTBox returns a non-zero pointer', () => {
		const t = TInt.fromString(`{1@${T1}, 5@${T2}}`);
		assert.ok(t.toTBox() !== 0);
		t.free();
	});
});

describe('TNumber - atSpan / minusSpan', () => {
	it('atSpan restricts to the value range', () => {
		const t = TInt.fromString(`{1@${T1}, 3@${T2}, 5@${T3}}`);
		const span = IntSpan.fromString('[1, 3]');
		const r = t.atSpan(span.inner);
		assert.ok(r.inner !== 0);
		t.free(); r.free(); span.free();
	});

	it('minusSpan excludes the value range', () => {
		const t = TInt.fromString(`{1@${T1}, 3@${T2}, 5@${T3}}`);
		const span = IntSpan.fromString('[1, 3]');
		const r = t.minusSpan(span.inner);
		assert.ok(r.inner !== 0);
		t.free(); r.free(); span.free();
	});
});

describe('TNumber - addTemporal / subTemporal / multTemporal / divTemporal', () => {
	it('addTemporal returns non-zero pointer', () => {
		const a = TInt.fromString(`{1@${T1}, 2@${T2}}`);
		const b = TInt.fromString(`{3@${T1}, 4@${T2}}`);
		const r = a.addTemporal(b);
		assert.ok(r.inner !== 0);
		a.free(); b.free(); r.free();
	});

	it('subTemporal returns non-zero pointer', () => {
		const a = TInt.fromString(`{5@${T1}, 6@${T2}}`);
		const b = TInt.fromString(`{1@${T1}, 2@${T2}}`);
		const r = a.subTemporal(b);
		assert.ok(r.inner !== 0);
		a.free(); b.free(); r.free();
	});

	it('multTemporal returns non-zero pointer', () => {
		const a = TInt.fromString(`{2@${T1}, 3@${T2}}`);
		const b = TInt.fromString(`{4@${T1}, 5@${T2}}`);
		const r = a.multTemporal(b);
		assert.ok(r.inner !== 0);
		a.free(); b.free(); r.free();
	});

	it('divTemporal returns non-zero pointer', () => {
		const a = TInt.fromString(`{10@${T1}, 20@${T2}}`);
		const b = TInt.fromString(`{2@${T1}, 4@${T2}}`);
		const r = a.divTemporal(b);
		assert.ok(r.inner !== 0);
		a.free(); b.free(); r.free();
	});
});

describe('TNumber - radd / rsub / rmul / rdiv (commuted scalar ops)', () => {
	it('radd(10): 10 + t', () => {
		const t = TInt.fromString(`{2@${T1}, 3@${T2}}`);
		const r = t.radd(10);
		assert.equal(r.startValue(), 12);
		t.free(); r.free();
	});

	it('rsub(10): 10 - t', () => {
		const t = TInt.fromString(`{2@${T1}, 3@${T2}}`);
		const r = t.rsub(10);
		assert.equal(r.startValue(), 8);
		t.free(); r.free();
	});

	it('rmul(3): 3 * t', () => {
		const t = TInt.fromString(`{2@${T1}, 4@${T2}}`);
		const r = t.rmul(3);
		assert.equal(r.startValue(), 6);
		t.free(); r.free();
	});

	it('rdiv(12): 12 / t', () => {
		const t = TInt.fromString(`{3@${T1}, 4@${T2}}`);
		const r = t.rdiv(12);
		assert.equal(r.startValue(), 4);
		t.free(); r.free();
	});
});

describe('TNumber - distanceScalar / distanceTemporal / nad', () => {
	it('distanceScalar returns non-zero pointer', () => {
		const t = TInt.fromString(`{1@${T1}, 5@${T2}}`);
		const r = t.distanceScalar(3);
		assert.ok(r.inner !== 0);
		t.free(); r.free();
	});

	it('distanceTemporal returns non-zero pointer', () => {
		const a = TInt.fromString(`{1@${T1}, 5@${T2}}`);
		const b = TInt.fromString(`{3@${T1}, 7@${T2}}`);
		const r = a.distanceTemporal(b);
		assert.ok(r.inner !== 0);
		a.free(); b.free(); r.free();
	});

	it('nad to scalar returns a number', () => {
		const t = TInt.fromString(`{1@${T1}, 5@${T2}}`);
		assert.equal(typeof t.nad(10), 'number');
		t.free();
	});

	it('nadTemporal returns a number', () => {
		const a = TInt.fromString(`{1@${T1}, 5@${T2}}`);
		const b = TInt.fromString(`{3@${T1}, 7@${T2}}`);
		assert.equal(typeof a.nadTemporal(b), 'number');
		a.free(); b.free();
	});
});

describe('TInt - fromBaseTemporal / fromBaseTime', () => {
	it('fromBaseTemporal creates TInt with same domain', () => {
		const domain = TInt.fromString(`{1@${T1}, 2@${T2}}`);
		const r = TInt.fromBaseTemporal(42, domain);
		assert.ok(r.inner !== 0);
		assert.equal(r.numInstants(), 2);
		domain.free(); r.free();
	});

	it('fromBaseTime with tstzspan creates a sequence', () => {
		const span = TsTzSpan.fromString(`[${T1}, ${T3}]`);
		const r = TInt.fromBaseTime(7, span.inner, 'tstzspan');
		assert.ok(r.inner !== 0);
		span.free(); r.free();
	});

	it('fromBaseTime with tstzset creates a discrete sequence', () => {
		const set = TsTzSet.fromString(`{${T1}, ${T2}, ${T3}}`);
		const r = TInt.fromBaseTime(42, set.inner, 'tstzset');
		assert.ok(r.inner !== 0);
		assert.equal(r.numInstants(), 3);
		set.free(); r.free();
	});

	it('fromBaseTime with tstzspanset creates a sequence set', () => {
		const ss = TsTzSpanSet.fromString(`{[${T1}, ${T2}], [${T3}, ${T3}]}`);
		const r = TInt.fromBaseTime(7, ss.inner, 'tstzspanset');
		assert.ok(r.inner !== 0);
		ss.free(); r.free();
	});
});

describe('TNumber - atSpanSet / minusSpanSet', () => {
	it('atSpanSet restricts to instants whose value falls in any span', () => {
		const t = TInt.fromString(`{1@${T1}, 3@${T2}, 5@${T3}}`);
		const ss = IntSpanSet.fromString('{[1, 2], [4, 6]}');
		const r = t.atSpanSet(ss.inner);
		assert.ok(r.inner !== 0);
		t.free(); ss.free(); r.free();
	});

	it('minusSpanSet excludes instants whose value falls in any span', () => {
		const t = TInt.fromString(`{1@${T1}, 3@${T2}, 5@${T3}}`);
		const ss = IntSpanSet.fromString('{[1, 2], [4, 6]}');
		const r = t.minusSpanSet(ss.inner);
		assert.ok(r.inner !== 0);
		assert.equal(r.numInstants(), 1);
		t.free(); ss.free(); r.free();
	});
});

describe('TNumber - atTBox / minusTBox', () => {
	it('atTBox restricts to instants within the box', () => {
		const t = TInt.fromString(`{1@${T1}, 3@${T2}, 5@${T3}}`);
		const box = TBox.fromInt(3);
		const r = t.atTBox(box.inner);
		assert.ok(r.inner !== 0);
		t.free(); box.free(); r.free();
	});

	it('minusTBox excludes instants within the box', () => {
		const t = TInt.fromString(`{1@${T1}, 3@${T2}, 5@${T3}}`);
		const box = TBox.fromInt(3);
		const r = t.minusTBox(box.inner);
		assert.ok(r.inner !== 0);
		assert.equal(r.numInstants(), 2);
		t.free(); box.free(); r.free();
	});
});

describe('TNumber - nadTBox', () => {
	it('nadTBox returns a number', () => {
		const t = TInt.fromString(`{1@${T1}, 5@${T2}}`);
		const box = TBox.fromInt(10);
		assert.equal(typeof t.nadTBox(box.inner), 'number');
		t.free(); box.free();
	});
});
