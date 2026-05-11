import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import { initMeos } from '../../../core/runtime/meos';
import { TFloat } from '../../../core/types/base/TFloat';
import { TBool } from '../../../core/types/base/TBool';
import { TInt } from '../../../core/types/base/TInt';
import { TInterpolation } from '../../../core/types/temporal/Temporal';
import { TsTzSpan } from '../../../core/types/time/TsTzSpan';
import { TsTzSet } from '../../../core/types/time/TsTzSet';
import { TsTzSpanSet } from '../../../core/types/time/TsTzSpanSet';

const T0 = '2000-01-01 00:00:00+00';
const T1 = '2000-01-01 00:01:00+00'; // +1 min
const T2 = '2000-01-01 00:02:00+00'; // +2 min
const T3 = '2000-01-01 00:03:00+00'; // +3 min

before(async () => {
	await initMeos();
});

describe('TFloat - Instant', () => {
	it('fromString returns a non-zero inner pointer', () => {
		const t = TFloat.fromString(`1.5@${T0}`);
		assert.ok(t.inner !== 0);
		t.free();
	});

	it('toString round-trips WKT', () => {
		const t = TFloat.fromString(`1.5@${T0}`);
		assert.equal(t.toString(), `1.5@${T0}`);
		t.free();
	});

	it('startValue / endValue', () => {
		const t = TFloat.fromString(`2.5@${T0}`);
		assert.equal(t.startValue(), 2.5);
		assert.equal(t.endValue(), 2.5);
		t.free();
	});

	it('interpolation = None', () => {
		const t = TFloat.fromString(`1.5@${T0}`);
		assert.equal(t.interpolation(), TInterpolation.None);
		t.free();
	});

	it('fromInstant returns a non-zero pointer', () => {
		const t = TFloat.fromInstant(1.5, 60_000_000);
		assert.ok(t.inner !== 0);
		t.free();
	});
});

describe('TFloat - Linear sequence', () => {
	let seq: TFloat;

	before(() => {
		seq = TFloat.fromString(`[1.5@${T1}, 4.0@${T2}, 3.5@${T3}]`);
	});

	it('inner pointer is non-zero', () => {
		assert.ok(seq.inner !== 0);
	});

	it('interpolation = Linear', () => {
		assert.equal(seq.interpolation(), TInterpolation.Linear);
	});

	it('numInstants = 3', () => {
		assert.equal(seq.numInstants(), 3);
	});

	it('numTimestamps = 3', () => {
		assert.equal(seq.numTimestamps(), 3);
	});

	it('startValue = 1.5', () => {
		assert.equal(seq.startValue(), 1.5);
	});

	it('endValue = 3.5', () => {
		assert.equal(seq.endValue(), 3.5);
	});

	it('minValue = 1.5', () => {
		assert.equal(seq.minValue(), 1.5);
	});

	it('maxValue = 4.0', () => {
		assert.equal(seq.maxValue(), 4.0);
	});

	it('toString round-trips WKT', () => {
		assert.equal(seq.toString(), `[1.5@${T1}, 4@${T2}, 3.5@${T3}]`);
	});

	it('startInstant returns non-zero pointer', () => {
		assert.ok(seq.startInstant().inner !== 0);
	});

	it('endInstant returns non-zero pointer', () => {
		assert.ok(seq.endInstant().inner !== 0);
	});
});

describe('TFloat - Discrete sequence', () => {
	it('interpolation = Discrete', () => {
		const t = TFloat.fromString(`{1.5@${T1}, 2.5@${T2}}`);
		assert.equal(t.interpolation(), TInterpolation.Discrete);
		assert.equal(t.numInstants(), 2);
		assert.equal(t.startValue(), 1.5);
		assert.equal(t.endValue(), 2.5);
		t.free();
	});
});

describe('TFloat - Step sequence', () => {
	it('interpolation = Stepwise', () => {
		const t = TFloat.fromString(`Interp=Step;[1.5@${T1}, 2.5@${T2}]`);
		assert.equal(t.interpolation(), TInterpolation.Stepwise);
		assert.equal(t.numInstants(), 2);
		t.free();
	});
});

describe('TFloat - Arithmetic', () => {
	let t: TFloat;

	before(() => {
		t = TFloat.fromString(`{1.5@${T1}, 2.5@${T2}, 3.5@${T3}}`);
	});

	it('add(10.0) shifts all values by 10', () => {
		const r = t.add(10.0);
		assert.equal(r.startValue(), 11.5);
		assert.equal(r.endValue(), 13.5);
		r.free();
	});

	it('sub(1.0) shifts all values by -1', () => {
		const r = t.sub(1.0);
		assert.equal(r.startValue(), 0.5);
		assert.equal(r.endValue(), 2.5);
		r.free();
	});

	it('mult(2.0) multiplies all values', () => {
		const r = t.mult(2.0);
		assert.equal(r.startValue(), 3.0);
		assert.equal(r.endValue(), 7.0);
		r.free();
	});

	it('div(2.0) divides all values', () => {
		const r = t.div(2.0);
		assert.equal(r.startValue(), 0.75);
		assert.equal(r.endValue(), 1.75);
		r.free();
	});
});

describe('TFloat - Restrictions', () => {
	let t: TFloat;

	before(() => {
		t = TFloat.fromString(`{1.5@${T1}, 2.5@${T2}, 1.5@${T3}}`);
	});

	it('at(1.5) keeps only instants with value 1.5', () => {
		const r = t.at(1.5);
		assert.equal(r.toString(), `{1.5@${T1}, 1.5@${T3}}`);
		r.free();
	});

	it('minus(1.5) keeps only instants with value != 1.5', () => {
		const r = t.minus(1.5);
		assert.equal(r.toString(), `{2.5@${T2}}`);
		r.free();
	});
});

describe('TFloat - Ever / always', () => {
	let t: TFloat;

	before(() => {
		t = TFloat.fromString(`{1.5@${T1}, 2.5@${T2}, 3.5@${T3}}`);
	});

	it('everEq(2.5) = true', () => assert.equal(t.everEq(2.5), true));
	it('everEq(9.0) = false', () => assert.equal(t.everEq(9.0), false));
	it('alwaysEq(2.5) = false', () => assert.equal(t.alwaysEq(2.5), false));
	it('everLt(3.5) = true', () => assert.equal(t.everLt(3.5), true));
	it('everGt(1.5) = true', () => assert.equal(t.everGt(1.5), true));
	it('alwaysLt(4.0) = true', () => assert.equal(t.alwaysLt(4.0), true));
	it('alwaysGe(1.5) = true', () => assert.equal(t.alwaysGe(1.5), true));
	it('everNe(5.0) = true', () => assert.equal(t.everNe(5.0), true));
	it('alwaysNe(9.0) = true', () => assert.equal(t.alwaysNe(9.0), true));
});

describe('TFloat - Temporal comparisons', () => {
	let t: TFloat;

	before(() => {
		t = TFloat.fromString(`{1.5@${T1}, 2.5@${T2}, 3.5@${T3}}`);
	});

	it('temporalEq(2.5) returns a TBool', () => {
		const r = t.temporalEq(2.5);
		assert.ok(r instanceof TBool);
		assert.ok(r.inner !== 0);
		assert.equal(r.startValue(), false);
		r.free();
	});

	it('temporalLt(3.5) returns a TBool (T1 and T2 are < 3.5)', () => {
		const r = t.temporalLt(3.5);
		assert.ok(r.inner !== 0);
		assert.equal(r.startValue(), true);
		r.free();
	});

	it('temporalGe(2.5) returns a TBool', () => {
		const r = t.temporalGe(2.5);
		assert.ok(r.inner !== 0);
		assert.equal(r.endValue(), true);
		r.free();
	});
});

describe('TFloat - toTInt', () => {
	it('toTInt truncates each value to integer', () => {
		const t = TFloat.fromString(`{1.5@${T1}, 2.9@${T2}}`);
		const ti = t.toTInt();
		assert.ok(ti instanceof TInt);
		assert.equal(ti.startValue(), 1);
		assert.equal(ti.endValue(), 2);
		t.free();
		ti.free();
	});
});

describe('TFloat - Copy', () => {
	it('copy() produces a distinct pointer with identical WKT', () => {
		const t = TFloat.fromString(`1.5@${T0}`);
		const cpy = t.copy();
		assert.ok(cpy.inner !== 0);
		assert.notEqual(cpy.inner, t.inner);
		assert.equal(cpy.toString(), t.toString());
		t.free();
		cpy.free();
	});
});

describe('TFloat - Timestamps & duration', () => {
	let t: TFloat;

	before(() => {
		t = TFloat.fromString(`[1.5@${T1}, 3.5@${T3}]`);
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

describe('TFloat - valueN', () => {
	it('valueN(0) returns value at first instant', () => {
		const t = TFloat.fromString(`{1.5@${T1}, 2.5@${T2}, 3.5@${T3}}`);
		assert.equal(t.valueN(0), 1.5);
		t.free();
	});

	it('valueN(2) returns value at third instant', () => {
		const t = TFloat.fromString(`{1.5@${T1}, 2.5@${T2}, 3.5@${T3}}`);
		assert.equal(t.valueN(2), 3.5);
		t.free();
	});
});

describe('TFloat - valueAtTimestamp', () => {
	it('returns value at an exact instant timestamp', () => {
		// T1 = 2000-01-01 00:01:00+00 = 60_000_000 µs
		const t = TFloat.fromString(`{3.14@${T1}}`);
		const v = t.valueAtTimestamp(60_000_000);
		assert.ok(v !== null && Math.abs(v - 3.14) < 1e-9);
		t.free();
	});

	it('returns null for a timestamp outside the temporal domain', () => {
		const t = TFloat.fromString(`{1.5@${T1}}`);
		const v = t.valueAtTimestamp(0); // before T1
		assert.equal(v, null);
		t.free();
	});
});

describe('TFloat - Math functions', () => {
	it('ceil() rounds each value up', () => {
		const t = TFloat.fromString(`{1.2@${T1}, 2.9@${T2}}`);
		const r = t.ceil();
		assert.equal(r.startValue(), 2.0);
		assert.equal(r.endValue(), 3.0);
		t.free();
		r.free();
	});

	it('floor() rounds each value down', () => {
		const t = TFloat.fromString(`{1.7@${T1}, 2.1@${T2}}`);
		const r = t.floor();
		assert.equal(r.startValue(), 1.0);
		assert.equal(r.endValue(), 2.0);
		t.free();
		r.free();
	});

	it('exp() applies e^x to each value: e^0 = 1', () => {
		const t = TFloat.fromString(`{0.0@${T1}}`);
		const r = t.exp();
		assert.ok(Math.abs(r.startValue() - 1.0) < 1e-9);
		t.free();
		r.free();
	});

	it('ln() applies ln(x) to each value: ln(1) = 0', () => {
		const t = TFloat.fromString(`{1.0@${T1}}`);
		const r = t.ln();
		assert.ok(Math.abs(r.startValue() - 0.0) < 1e-9);
		t.free();
		r.free();
	});

	it('log10() applies log10(x): log10(10) = 1', () => {
		const t = TFloat.fromString(`{10.0@${T1}}`);
		const r = t.log10();
		assert.ok(Math.abs(r.startValue() - 1.0) < 1e-9);
		t.free();
		r.free();
	});

	it('degrees() converts radians to degrees: π → 180', () => {
		const t = TFloat.fromString(`{${Math.PI}@${T1}}`);
		const r = t.degrees();
		assert.ok(Math.abs(r.startValue() - 180.0) < 1e-6);
		t.free();
		r.free();
	});

	it('radians() converts degrees to radians: 180 → π', () => {
		const t = TFloat.fromString(`{180.0@${T1}}`);
		const r = t.radians();
		assert.ok(Math.abs(r.startValue() - Math.PI) < 1e-9);
		t.free();
		r.free();
	});
});

describe('TFloat - shiftValue / scaleValue / shiftScaleValue', () => {
	it('shiftValue(10.0) adds 10 to every value', () => {
		const t = TFloat.fromString(`{1.5@${T1}, 2.5@${T2}}`);
		const r = t.shiftValue(10.0);
		assert.ok(Math.abs(r.startValue() - 11.5) < 1e-9);
		assert.ok(Math.abs(r.endValue() - 12.5) < 1e-9);
		t.free();
		r.free();
	});

	it('scaleValue(4.0): scales the value range to width 4', () => {
		const t = TFloat.fromString(`{0.0@${T1}, 2.0@${T2}, 4.0@${T3}}`);
		const r = t.scaleValue(4.0);
		assert.ok(Math.abs(r.minValue() - 0.0) < 1e-9);
		assert.ok(Math.abs(r.maxValue() - 4.0) < 1e-9);
		t.free();
		r.free();
	});

	it('shiftScaleValue(10.0, 6.0): shifts by 10 and scales to width 6', () => {
		const t = TFloat.fromString(`{0.0@${T1}, 2.0@${T2}, 4.0@${T3}}`);
		const r = t.shiftScaleValue(10.0, 6.0);
		assert.ok(Math.abs(r.minValue() - 10.0) < 1e-9);
		assert.ok(Math.abs(r.maxValue() - 16.0) < 1e-9);
		t.free();
		r.free();
	});
});

// ─── TNumber methods (TFloat-specific hooks) ────────────────────────────────

describe('TNumber on TFloat - radd / rsub / rmul / rdiv', () => {
	it('radd(10.0): 10 + t', () => {
		const t = TFloat.fromString(`{2.0@${T1}, 3.0@${T2}}`);
		const r = t.radd(10.0);
		assert.ok(Math.abs(r.startValue() - 12.0) < 1e-9);
		t.free(); r.free();
	});

	it('rsub(10.0): 10 - t', () => {
		const t = TFloat.fromString(`{2.0@${T1}, 3.0@${T2}}`);
		const r = t.rsub(10.0);
		assert.ok(Math.abs(r.startValue() - 8.0) < 1e-9);
		t.free(); r.free();
	});

	it('rmul(3.0): 3 * t', () => {
		const t = TFloat.fromString(`{2.0@${T1}, 4.0@${T2}}`);
		const r = t.rmul(3.0);
		assert.ok(Math.abs(r.startValue() - 6.0) < 1e-9);
		t.free(); r.free();
	});

	it('rdiv(12.0): 12 / t', () => {
		const t = TFloat.fromString(`{3.0@${T1}, 4.0@${T2}}`);
		const r = t.rdiv(12.0);
		assert.ok(Math.abs(r.startValue() - 4.0) < 1e-9);
		t.free(); r.free();
	});
});

describe('TNumber on TFloat - abs / deltaValue / integral / avgValue', () => {
	it('abs of negative values', () => {
		const t = TFloat.fromString(`{-2.5@${T1}, 3.5@${T2}}`);
		const r = t.abs();
		assert.ok(Math.abs(r.startValue() - 2.5) < 1e-9);
		t.free(); r.free();
	});

	it('deltaValue returns non-zero pointer', () => {
		const t = TFloat.fromString(`{1.0@${T1}, 4.0@${T2}, 9.0@${T3}}`);
		const r = t.deltaValue();
		assert.ok(r.inner !== 0);
		t.free(); r.free();
	});

	it('integral returns a number', () => {
		const t = TFloat.fromString(`[1.0@${T1}, 3.0@${T3}]`);
		assert.equal(typeof t.integral(), 'number');
		t.free();
	});

	it('avgValue returns a number', () => {
		const t = TFloat.fromString(`{1.0@${T1}, 3.0@${T2}}`);
		assert.equal(typeof t.avgValue(), 'number');
		t.free();
	});
});

describe('TNumber on TFloat - distanceScalar / nad', () => {
	it('distanceScalar returns non-zero pointer', () => {
		const t = TFloat.fromString(`{1.0@${T1}, 5.0@${T2}}`);
		const r = t.distanceScalar(3.0);
		assert.ok(r.inner !== 0);
		t.free(); r.free();
	});

	it('nad to scalar returns a number', () => {
		const t = TFloat.fromString(`{1.0@${T1}, 5.0@${T2}}`);
		assert.equal(typeof t.nad(10.0), 'number');
		t.free();
	});
});

describe('TFloat - fromBaseTemporal / fromBaseTime', () => {
	it('fromBaseTemporal creates TFloat with same domain', () => {
		const domain = TFloat.fromString(`{1.0@${T1}, 2.0@${T2}}`);
		const r = TFloat.fromBaseTemporal(3.14, domain);
		assert.ok(r.inner !== 0);
		assert.equal(r.numInstants(), 2);
		domain.free(); r.free();
	});

	it('fromBaseTime with tstzspan (linear) creates a sequence', () => {
		const span = TsTzSpan.fromString(`[${T1}, ${T3}]`);
		const r = TFloat.fromBaseTime(2.5, span.inner, 'tstzspan');
		assert.ok(r.inner !== 0);
		span.free(); r.free();
	});

	it('fromBaseTime with tstzset creates a discrete sequence', () => {
		const set = TsTzSet.fromString(`{${T1}, ${T2}, ${T3}}`);
		const r = TFloat.fromBaseTime(3.14, set.inner, 'tstzset');
		assert.ok(r.inner !== 0);
		assert.equal(r.numInstants(), 3);
		set.free(); r.free();
	});

	it('fromBaseTime with tstzspanset creates a sequence set', () => {
		const ss = TsTzSpanSet.fromString(`{[${T1}, ${T2}], [${T3}, ${T3}]}`);
		const r = TFloat.fromBaseTime(2.5, ss.inner, 'tstzspanset');
		assert.ok(r.inner !== 0);
		ss.free(); r.free();
	});
});
