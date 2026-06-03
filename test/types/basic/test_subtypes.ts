import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import { initMeos } from '../../../core/runtime/meos.js';
import { TInterpolation } from '../../../core/types/temporal/Temporal.js';
import { TBool } from '../../../core/types/basic/tbool/TBool.js';
import { TBoolInst } from '../../../core/types/basic/tbool/TBoolInst.js';
import { TBoolSeq } from '../../../core/types/basic/tbool/TBoolSeq.js';
import { TBoolSeqSet } from '../../../core/types/basic/tbool/TBoolSeqSet.js';
import { TIntInst } from '../../../core/types/basic/tint/TIntInst.js';
import { TIntSeq } from '../../../core/types/basic/tint/TIntSeq.js';
import { TIntSeqSet } from '../../../core/types/basic/tint/TIntSeqSet.js';
import { TFloatInst } from '../../../core/types/basic/tfloat/TFloatInst.js';
import { TFloatSeq } from '../../../core/types/basic/tfloat/TFloatSeq.js';
import { TFloatSeqSet } from '../../../core/types/basic/tfloat/TFloatSeqSet.js';
import { createTBool, createTInt, createTFloat } from '../../../core/types/temporal/TemporalFactory.js';

// µs offsets from 2000-01-01 UTC
const T1 = 60_000_000;   // +1 min
const T2 = 120_000_000;  // +2 min
const T3 = 180_000_000;  // +3 min
const T4 = 240_000_000;  // +4 min

before(async () => { await initMeos(); });

// ─── TBoolInst ──────────────────────────────────────────────────────────────

describe('TBoolInst - fromValue', () => {
	it('creates a non-zero pointer', () => {
		const i = TBoolInst.fromValue(true, T1);
		assert.ok(i.inner !== 0);
		i.free();
	});

	it('is an instance of TBoolInst and TBool', () => {
		const i = TBoolInst.fromValue(false, T1);
		assert.ok(i instanceof TBoolInst);
		assert.ok(i instanceof TBool);
		i.free();
	});

	it('startValue matches the given value', () => {
		const i = TBoolInst.fromValue(true, T1);
		assert.equal(i.startValue(), true);
		i.free();
	});
});

// ─── TBoolSeq ───────────────────────────────────────────────────────────────

describe('TBoolSeq - fromInstants', () => {
	it('builds a sequence from two instants', () => {
		const i1 = TBoolInst.fromValue(true,  T1);
		const i2 = TBoolInst.fromValue(false, T2);
		const seq = TBoolSeq.fromInstants([i1, i2]);
		assert.ok(seq.inner !== 0);
		assert.equal(seq.numInstants(), 2);
		assert.equal(seq.interpolation(), TInterpolation.Stepwise);
		i1.free(); i2.free(); seq.free();
	});

	it('respects lowerInc / upperInc bounds', () => {
		const i1 = TBoolInst.fromValue(true,  T1);
		const i2 = TBoolInst.fromValue(false, T2);
		// Step sequences require upperInc=true; test open lower bound instead
		const seq = TBoolSeq.fromInstants([i1, i2], false, true);
		assert.ok(seq.inner !== 0);
		i1.free(); i2.free(); seq.free();
	});

	it('startValue / endValue match first/last instants', () => {
		const i1 = TBoolInst.fromValue(true,  T1);
		const i2 = TBoolInst.fromValue(false, T2);
		const seq = TBoolSeq.fromInstants([i1, i2]);
		assert.equal(seq.startValue(), true);
		assert.equal(seq.endValue(), false);
		i1.free(); i2.free(); seq.free();
	});
});

// ─── TBoolSeqSet ────────────────────────────────────────────────────────────

describe('TBoolSeqSet - fromSequences', () => {
	it('builds a sequence set from two sequences', () => {
		const i1 = TBoolInst.fromValue(true,  T1);
		const i2 = TBoolInst.fromValue(false, T2);
		const i3 = TBoolInst.fromValue(true,  T3);
		const i4 = TBoolInst.fromValue(false, T4);
		const s1 = TBoolSeq.fromInstants([i1, i2], true, true);
		const s2 = TBoolSeq.fromInstants([i3, i4], true, true);
		const ss = TBoolSeqSet.fromSequences([s1, s2]);
		assert.ok(ss.inner !== 0);
		assert.equal(ss.numInstants(), 4);
		i1.free(); i2.free(); i3.free(); i4.free();
		s1.free(); s2.free(); ss.free();
	});
});

// ─── TIntInst ───────────────────────────────────────────────────────────────

describe('TIntInst - fromValue', () => {
	it('creates a non-zero pointer with correct value', () => {
		const i = TIntInst.fromValue(42, T1);
		assert.ok(i.inner !== 0);
		assert.equal(i.startValue(), 42);
		i.free();
	});
});

// ─── TIntSeq ────────────────────────────────────────────────────────────────

describe('TIntSeq - fromInstants', () => {
	it('builds a stepwise sequence from three instants', () => {
		const i1 = TIntInst.fromValue(1, T1);
		const i2 = TIntInst.fromValue(3, T2);
		const i3 = TIntInst.fromValue(6, T3);
		const seq = TIntSeq.fromInstants([i1, i2, i3]);
		assert.ok(seq.inner !== 0);
		assert.equal(seq.numInstants(), 3);
		assert.equal(seq.startValue(), 1);
		assert.equal(seq.endValue(), 6);
		assert.equal(seq.interpolation(), TInterpolation.Stepwise);
		i1.free(); i2.free(); i3.free(); seq.free();
	});
});

// ─── TIntSeqSet ─────────────────────────────────────────────────────────────

describe('TIntSeqSet - fromSequences', () => {
	it('builds a sequence set from two sequences', () => {
		const i1 = TIntInst.fromValue(1, T1);
		const i2 = TIntInst.fromValue(2, T2);
		const i3 = TIntInst.fromValue(5, T3);
		const i4 = TIntInst.fromValue(9, T4);
		const s1 = TIntSeq.fromInstants([i1, i2], true, true);
		const s2 = TIntSeq.fromInstants([i3, i4], true, true);
		const ss = TIntSeqSet.fromSequences([s1, s2]);
		assert.ok(ss.inner !== 0);
		assert.equal(ss.numInstants(), 4);
		i1.free(); i2.free(); i3.free(); i4.free();
		s1.free(); s2.free(); ss.free();
	});
});

// ─── TFloatInst ─────────────────────────────────────────────────────────────

describe('TFloatInst - fromValue', () => {
	it('creates a non-zero pointer with correct value', () => {
		const i = TFloatInst.fromValue(3.14, T1);
		assert.ok(i.inner !== 0);
		assert.ok(Math.abs(i.startValue() - 3.14) < 1e-9);
		i.free();
	});
});

// ─── TFloatSeq ──────────────────────────────────────────────────────────────

describe('TFloatSeq - fromInstants (Linear)', () => {
	it('builds a linear sequence from two instants', () => {
		const i1 = TFloatInst.fromValue(1.0, T1);
		const i2 = TFloatInst.fromValue(5.0, T2);
		const seq = TFloatSeq.fromInstants([i1, i2]);
		assert.ok(seq.inner !== 0);
		assert.equal(seq.numInstants(), 2);
		assert.equal(seq.interpolation(), TInterpolation.Linear);
		assert.ok(Math.abs(seq.startValue() - 1.0) < 1e-9);
		assert.ok(Math.abs(seq.endValue()   - 5.0) < 1e-9);
		i1.free(); i2.free(); seq.free();
	});
});

describe('TFloatSeq - fromInstants (Stepwise)', () => {
	it('builds a stepwise sequence from two instants', () => {
		const i1 = TFloatInst.fromValue(1.0, T1);
		const i2 = TFloatInst.fromValue(5.0, T2);
		const seq = TFloatSeq.fromInstants([i1, i2], TInterpolation.Stepwise);
		assert.ok(seq.inner !== 0);
		assert.equal(seq.interpolation(), TInterpolation.Stepwise);
		i1.free(); i2.free(); seq.free();
	});
});

// ─── TFloatSeqSet ───────────────────────────────────────────────────────────

describe('TFloatSeqSet - fromSequences', () => {
	it('builds a sequence set from two linear sequences', () => {
		const i1 = TFloatInst.fromValue(1.0, T1);
		const i2 = TFloatInst.fromValue(2.0, T2);
		const i3 = TFloatInst.fromValue(5.0, T3);
		const i4 = TFloatInst.fromValue(9.0, T4);
		const s1 = TFloatSeq.fromInstants([i1, i2], TInterpolation.Linear, true, false);
		const s2 = TFloatSeq.fromInstants([i3, i4], TInterpolation.Linear, true, true);
		const ss = TFloatSeqSet.fromSequences([s1, s2]);
		assert.ok(ss.inner !== 0);
		assert.equal(ss.numInstants(), 4);
		i1.free(); i2.free(); i3.free(); i4.free();
		s1.free(); s2.free(); ss.free();
	});
});

// ─── TemporalFactory ────────────────────────────────────────────────────────

describe('TemporalFactory - createTBool', () => {
	it('routes an Instant pointer to TBoolInst', () => {
		const src = TBoolInst.fromValue(true, T1);
		const routed = createTBool(src.inner);
		assert.ok(routed instanceof TBoolInst);
		src.free();
	});

	it('routes a Sequence pointer to TBoolSeq', () => {
		const i1 = TBoolInst.fromValue(true,  T1);
		const i2 = TBoolInst.fromValue(false, T2);
		const seq = TBoolSeq.fromInstants([i1, i2]);
		const routed = createTBool(seq.inner);
		assert.ok(routed instanceof TBoolSeq);
		i1.free(); i2.free(); seq.free();
	});

	it('routes a SequenceSet pointer to TBoolSeqSet', () => {
		const i1 = TBoolInst.fromValue(true,  T1);
		const i2 = TBoolInst.fromValue(false, T2);
		const i3 = TBoolInst.fromValue(true,  T3);
		const i4 = TBoolInst.fromValue(false, T4);
		const s1 = TBoolSeq.fromInstants([i1, i2], true, true);
		const s2 = TBoolSeq.fromInstants([i3, i4], true, true);
		const ss = TBoolSeqSet.fromSequences([s1, s2]);
		const routed = createTBool(ss.inner);
		assert.ok(routed instanceof TBoolSeqSet);
		i1.free(); i2.free(); i3.free(); i4.free();
		s1.free(); s2.free(); ss.free();
	});
});

describe('TemporalFactory - createTInt', () => {
	it('routes an Instant to TIntInst', () => {
		const i = TIntInst.fromValue(7, T1);
		assert.ok(createTInt(i.inner) instanceof TIntInst);
		i.free();
	});

	it('routes a Sequence to TIntSeq', () => {
		const i1 = TIntInst.fromValue(1, T1);
		const i2 = TIntInst.fromValue(2, T2);
		const seq = TIntSeq.fromInstants([i1, i2]);
		assert.ok(createTInt(seq.inner) instanceof TIntSeq);
		i1.free(); i2.free(); seq.free();
	});
});

describe('TemporalFactory - createTFloat', () => {
	it('routes an Instant to TFloatInst', () => {
		const i = TFloatInst.fromValue(1.5, T1);
		assert.ok(createTFloat(i.inner) instanceof TFloatInst);
		i.free();
	});

	it('routes a Sequence to TFloatSeq', () => {
		const i1 = TFloatInst.fromValue(1.0, T1);
		const i2 = TFloatInst.fromValue(2.0, T2);
		const seq = TFloatSeq.fromInstants([i1, i2]);
		assert.ok(createTFloat(seq.inner) instanceof TFloatSeq);
		i1.free(); i2.free(); seq.free();
	});
});
