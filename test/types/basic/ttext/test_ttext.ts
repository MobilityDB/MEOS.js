import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import { initMeos } from '../../../../core/runtime/meos';
import { TText } from '../../../../core/types/basic/ttext/TText';
import { TTextInst } from '../../../../core/types/basic/ttext/TTextInst';
import { TTextSeq } from '../../../../core/types/basic/ttext/TTextSeq';
import { TTextSeqSet } from '../../../../core/types/basic/ttext/TTextSeqSet';
import { TInterpolation } from '../../../../core/types/temporal/Temporal';
import { TsTzSpan } from '../../../../core/types/collections/time/TsTzSpan';
import { TsTzSet } from '../../../../core/types/collections/time/TsTzSet';
import { TsTzSpanSet } from '../../../../core/types/collections/time/TsTzSpanSet';
import { createTText } from '../../../../core/types/temporal/TemporalFactory';

// µs offsets from 2000-01-01 UTC
const T1 = 60_000_000;   // +1 min
const T2 = 120_000_000;  // +2 min
const T3 = 180_000_000;  // +3 min
const T4 = 240_000_000;  // +4 min

// ISO timestamps for WKT strings
const TS1 = '2000-01-01 00:01:00+00';
const TS2 = '2000-01-01 00:02:00+00';
const TS3 = '2000-01-01 00:03:00+00';
const TS4 = '2000-01-01 00:04:00+00';

before(async () => { await initMeos(); });

// ─── TText - Instant ─────────────────────────────────────────────────────────

describe('TText - Instant', () => {
	it('fromString returns a non-zero inner pointer', () => {
		const t = TText.fromString(`hello@${TS1}`);
		assert.ok(t.inner !== 0);
		t.free();
	});

	it('toString round-trips WKT', () => {
		const t = TText.fromString(`hello@${TS1}`);
		assert.ok(t.toString().includes('hello'));
		t.free();
	});

	it('startValue / endValue on instant', () => {
		const t = TText.fromString(`hello@${TS1}`);
		assert.equal(t.startValue(), 'hello');
		assert.equal(t.endValue(), 'hello');
		t.free();
	});

	it('interpolation of an instant is None', () => {
		const t = TText.fromString(`hello@${TS1}`);
		assert.equal(t.interpolation(), TInterpolation.None);
		t.free();
	});
});

// ─── TText - Sequence ────────────────────────────────────────────────────────

describe('TText - Sequence', () => {
	it('fromString parses a step sequence', () => {
		const t = TText.fromString(`[hello@${TS1}, world@${TS2}]`);
		assert.ok(t.inner !== 0);
		assert.equal(t.startValue(), 'hello');
		assert.equal(t.endValue(), 'world');
		t.free();
	});

	it('numInstants = 2', () => {
		const t = TText.fromString(`[hello@${TS1}, world@${TS2}]`);
		assert.equal(t.numInstants(), 2);
		t.free();
	});

	it('interpolation is Stepwise', () => {
		const t = TText.fromString(`[hello@${TS1}, world@${TS2}]`);
		assert.equal(t.interpolation(), TInterpolation.Stepwise);
		t.free();
	});

	it('minValue / maxValue (lexicographic)', () => {
		const t = TText.fromString(`[apple@${TS1}, zebra@${TS2}]`);
		assert.equal(t.minValue(), 'apple');
		assert.equal(t.maxValue(), 'zebra');
		t.free();
	});
});

// ─── TText - SequenceSet ─────────────────────────────────────────────────────

describe('TText - SequenceSet', () => {
	it('fromString parses a sequence set', () => {
		const t = TText.fromString(`{[hello@${TS1}, world@${TS2}], [foo@${TS3}, bar@${TS4}]}`);
		assert.ok(t.inner !== 0);
		assert.equal(t.numInstants(), 4);
		t.free();
	});
});

// ─── Text operations ─────────────────────────────────────────────────────────

describe('TText - text operations', () => {
	it('upper() uppercases all values', () => {
		const t = TText.fromString(`[hello@${TS1}, world@${TS2}]`);
		const up = t.upper();
		assert.equal(up.startValue(), 'HELLO');
		assert.equal(up.endValue(), 'WORLD');
		t.free(); up.free();
	});

	it('lower() lowercases all values', () => {
		const t = TText.fromString(`[HELLO@${TS1}, WORLD@${TS2}]`);
		const lo = t.lower();
		assert.equal(lo.startValue(), 'hello');
		assert.equal(lo.endValue(), 'world');
		t.free(); lo.free();
	});

	it('initcap() capitalizes first letter of each word', () => {
		const t = TText.fromString(`hello world@${TS1}`);
		const ic = t.initcap();
		assert.equal(ic.startValue(), 'Hello World');
		t.free(); ic.free();
	});

	it('concat(string) appends a suffix', () => {
		const t = TText.fromString(`hello@${TS1}`);
		const r = t.concat('!');
		assert.equal(r.startValue(), 'hello!');
		t.free(); r.free();
	});

	it('concat(TText) concatenates two temporals', () => {
		const a = TText.fromString(`foo@${TS1}`);
		const b = TText.fromString(`bar@${TS1}`);
		const r = a.concat(b);
		assert.equal(r.startValue(), 'foobar');
		a.free(); b.free(); r.free();
	});

	it('prepend(string) prepends a prefix', () => {
		const t = TText.fromString(`world@${TS1}`);
		const r = t.prepend('hello ');
		assert.equal(r.startValue(), 'hello world');
		t.free(); r.free();
	});
});

// ─── Restrictions ────────────────────────────────────────────────────────────

describe('TText - restrictions', () => {
	it('at(value) restricts to matching instants', () => {
		const t = TText.fromString(`[hello@${TS1}, world@${TS2}]`);
		const r = t.at('hello');
		assert.ok(r !== null);
		assert.equal(r!.startValue(), 'hello');
		t.free(); r!.free();
	});

	it('at(value) returns null when value not present', () => {
		const t = TText.fromString(`hello@${TS1}`);
		const r = t.at('missing');
		assert.equal(r, null);
		t.free();
	});

	it('minus(value) excludes matching instants', () => {
		const t = TText.fromString(`[hello@${TS1}, world@${TS2}]`);
		const r = t.minus('hello');
		assert.ok(r !== null);
		assert.equal(r!.startValue(), 'world');
		t.free(); r!.free();
	});
});

// ─── Ever / Always comparisons ───────────────────────────────────────────────

describe('TText - ever/always comparisons', () => {
	it('everEq returns true when value exists', () => {
		const t = TText.fromString(`[hello@${TS1}, world@${TS2}]`);
		assert.ok(t.everEq('hello'));
		assert.ok(!t.everEq('missing'));
		t.free();
	});

	it('alwaysEq returns true only when all values match', () => {
		const t = TText.fromString(`hello@${TS1}`);
		assert.ok(t.alwaysEq('hello'));
		assert.ok(!t.alwaysEq('world'));
		t.free();
	});

	it('neverEq is complement of everEq', () => {
		const t = TText.fromString(`hello@${TS1}`);
		assert.ok(t.neverEq('world'));
		assert.ok(!t.neverEq('hello'));
		t.free();
	});

	it('everLt / alwaysLt (lexicographic)', () => {
		const t = TText.fromString(`apple@${TS1}`);
		assert.ok(t.everLt('zebra'));
		assert.ok(t.alwaysLt('zebra'));
		assert.ok(!t.everLt('aaa'));
		t.free();
	});
});

// ─── valueAtTimestamp ────────────────────────────────────────────────────────

describe('TText - valueAtTimestamp', () => {
	it('returns the correct value at a matching timestamp', () => {
		const t = TText.fromString(`hello@${TS1}`);
		assert.equal(t.valueAtTimestamp(T1), 'hello');
		t.free();
	});

	it('returns null when outside the temporal domain', () => {
		const t = TText.fromString(`hello@${TS1}`);
		assert.equal(t.valueAtTimestamp(T2), null);
		t.free();
	});
});

// ─── fromBaseTemporal / fromBaseTime ─────────────────────────────────────────

describe('TText - fromBaseTemporal', () => {
	it('creates a TText with constant value over the same domain', () => {
		const domain = TText.fromString(`[hello@${TS1}, world@${TS2}]`);
		const t = TText.fromBaseTemporal('foo', domain);
		assert.ok(t.inner !== 0);
		assert.equal(t.startValue(), 'foo');
		assert.equal(t.endValue(), 'foo');
		domain.free(); t.free();
	});
});

describe('TText - fromBaseTime', () => {
	it('fromBaseTime with TsTzSpan creates a sequence', () => {
		const span = TsTzSpan.fromString(`[${TS1}, ${TS2}]`);
		const t = TText.fromBaseTime('hello', span.inner, 'tstzspan');
		assert.ok(t.inner !== 0);
		assert.equal(t.startValue(), 'hello');
		span.free(); t.free();
	});

	it('fromBaseTime with TsTzSet creates a discrete sequence', () => {
		const set = TsTzSet.fromString(`{${TS1}, ${TS2}}`);
		const t = TText.fromBaseTime('hello', set.inner, 'tstzset');
		assert.ok(t.inner !== 0);
		set.free(); t.free();
	});

	it('fromBaseTime with TsTzSpanSet creates a sequence set', () => {
		const ss = TsTzSpanSet.fromString(`{[${TS1}, ${TS2}], [${TS3}, ${TS4}]}`);
		const t = TText.fromBaseTime('hello', ss.inner, 'tstzspanset');
		assert.ok(t.inner !== 0);
		ss.free(); t.free();
	});
});

// ─── TTextInst ───────────────────────────────────────────────────────────────

describe('TTextInst - fromValue', () => {
	it('creates a non-zero pointer with correct value', () => {
		const i = TTextInst.fromValue('hello', T1);
		assert.ok(i.inner !== 0);
		assert.equal(i.startValue(), 'hello');
		i.free();
	});

	it('is an instance of TTextInst and TText', () => {
		const i = TTextInst.fromValue('hello', T1);
		assert.ok(i instanceof TTextInst);
		assert.ok(i instanceof TText);
		i.free();
	});
});

// ─── TTextSeq ────────────────────────────────────────────────────────────────

describe('TTextSeq - fromInstants', () => {
	it('builds a stepwise sequence from two instants', () => {
		const i1 = TTextInst.fromValue('hello', T1);
		const i2 = TTextInst.fromValue('world', T2);
		const seq = TTextSeq.fromInstants([i1, i2]);
		assert.ok(seq.inner !== 0);
		assert.equal(seq.numInstants(), 2);
		assert.equal(seq.interpolation(), TInterpolation.Stepwise);
		assert.equal(seq.startValue(), 'hello');
		assert.equal(seq.endValue(), 'world');
		i1.free(); i2.free(); seq.free();
	});
});

// ─── TTextSeqSet ─────────────────────────────────────────────────────────────

describe('TTextSeqSet - fromSequences', () => {
	it('builds a sequence set from two sequences', () => {
		const i1 = TTextInst.fromValue('hello', T1);
		const i2 = TTextInst.fromValue('world', T2);
		const i3 = TTextInst.fromValue('foo',   T3);
		const i4 = TTextInst.fromValue('bar',   T4);
		const s1 = TTextSeq.fromInstants([i1, i2], true, true);
		const s2 = TTextSeq.fromInstants([i3, i4], true, true);
		const ss = TTextSeqSet.fromSequences([s1, s2]);
		assert.ok(ss.inner !== 0);
		assert.equal(ss.numInstants(), 4);
		i1.free(); i2.free(); i3.free(); i4.free();
		s1.free(); s2.free(); ss.free();
	});
});

// ─── TemporalFactory ─────────────────────────────────────────────────────────

describe('TemporalFactory - createTText', () => {
	it('routes an Instant pointer to TTextInst', () => {
		const i = TTextInst.fromValue('hello', T1);
		const r = createTText(i.inner);
		assert.ok(r instanceof TTextInst);
		i.free();
	});

	it('routes a Sequence pointer to TTextSeq', () => {
		const i1 = TTextInst.fromValue('hello', T1);
		const i2 = TTextInst.fromValue('world', T2);
		const seq = TTextSeq.fromInstants([i1, i2]);
		const r = createTText(seq.inner);
		assert.ok(r instanceof TTextSeq);
		i1.free(); i2.free(); seq.free();
	});

	it('routes a SequenceSet pointer to TTextSeqSet', () => {
		const i1 = TTextInst.fromValue('hello', T1);
		const i2 = TTextInst.fromValue('world', T2);
		const i3 = TTextInst.fromValue('foo',   T3);
		const i4 = TTextInst.fromValue('bar',   T4);
		const s1 = TTextSeq.fromInstants([i1, i2], true, true);
		const s2 = TTextSeq.fromInstants([i3, i4], true, true);
		const ss = TTextSeqSet.fromSequences([s1, s2]);
		const r = createTText(ss.inner);
		assert.ok(r instanceof TTextSeqSet);
		i1.free(); i2.free(); i3.free(); i4.free();
		s1.free(); s2.free(); ss.free();
	});
});
