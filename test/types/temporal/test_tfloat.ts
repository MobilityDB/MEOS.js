import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import { initMeos } from '../../../core/runtime/meos';
import { TFloat } from '../../../core/types/base/TFloat';
import { TBool } from '../../../core/types/base/TBool';
import { TInt } from '../../../core/types/base/TInt';
import { TInterpolation } from '../../../core/types/temporal/Temporal';

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
