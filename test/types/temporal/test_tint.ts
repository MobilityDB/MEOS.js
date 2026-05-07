import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import { initMeos } from '../../../core/runtime/meos';
import { TInt } from '../../../core/types/base/TInt';
import { TBool } from '../../../core/types/base/TBool';
import { TInterpolation } from '../../../core/types/temporal/Temporal';

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
