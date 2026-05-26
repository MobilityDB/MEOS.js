import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import { initMeos } from '../../../../core/runtime/meos';
import { TGeogPoint } from '../../../../core/types/basic/tgeogpoint/TGeogPoint';
import { TGeogPointInst } from '../../../../core/types/basic/tgeogpoint/TGeogPointInst';
import { TGeogPointSeq } from '../../../../core/types/basic/tgeogpoint/TGeogPointSeq';
import { TGeogPointSeqSet } from '../../../../core/types/basic/tgeogpoint/TGeogPointSeqSet';
import { TInterpolation } from '../../../../core/types/temporal/Temporal';
import { meos_free } from '../../../../core/functions/functions.generated';

const T0 = '2001-01-01 00:00:00+00';
const T1 = '2001-01-02 00:00:00+00';
const T2 = '2001-01-03 00:00:00+00';
const T3 = '2001-01-04 00:00:00+00';

// Paris and Berlin approximate coordinates (lon/lat, SRID 4326)
const PARIS = 'POINT(2.35 48.85)';
const BERLIN = 'POINT(13.40 52.52)';

const INST_WKT = `${PARIS}@${T0}`;
const SEQ_WKT = `[${PARIS}@${T0}, ${BERLIN}@${T1}]`;
const SS_WKT = `{[${PARIS}@${T0}, ${BERLIN}@${T1}],[POINT(0 0)@${T2}, POINT(1 1)@${T3}]}`;

before(async () => {
	await initMeos();
});

describe('TGeogPoint - Construction', () => {
	it('fromString instant round-trips', () => {
		const t = TGeogPoint.fromString(INST_WKT);
		assert.ok(t.inner !== 0);
		assert.ok(t.toString().includes('POINT'));
		t.free();
	});

	it('fromString sequence round-trips', () => {
		const t = TGeogPoint.fromString(SEQ_WKT);
		assert.ok(t.inner !== 0);
		t.free();
	});

	it('fromString sequence set round-trips', () => {
		const t = TGeogPoint.fromString(SS_WKT);
		assert.ok(t.inner !== 0);
		t.free();
	});

	it('fromInstant creates a non-zero pointer', () => {
		const t = TGeogPoint.fromInstant(PARIS, 60_000_000);
		assert.ok(t.inner !== 0);
		t.free();
	});

	it('copy produces a distinct object', () => {
		const t = TGeogPoint.fromString(SEQ_WKT);
		const c = t.copy();
		assert.notEqual(t.inner, c.inner);
		assert.ok(c.inner !== 0);
		t.free();
		c.free();
	});
});

describe('TGeogPoint - Subtypes', () => {
	it('TGeogPointInst.fromValue creates instant', () => {
		const inst = TGeogPointInst.fromValue(PARIS, 0);
		assert.ok(inst.inner !== 0);
		assert.ok(inst.startValue().startsWith('POINT'));
		inst.free();
	});

	it('TGeogPointSeq.fromInstants creates sequence', () => {
		const i1 = TGeogPointInst.fromValue(PARIS, 0);
		const i2 = TGeogPointInst.fromValue(BERLIN, 86_400_000_000);
		const seq = TGeogPointSeq.fromInstants([i1, i2]);
		assert.ok(seq.inner !== 0);
		assert.equal(seq.numInstants(), 2);
		i1.free();
		i2.free();
		seq.free();
	});

	it('TGeogPointSeqSet.fromSequences creates sequence set', () => {
		const s1 = TGeogPoint.fromString(`[${PARIS}@${T0}, ${BERLIN}@${T1}]`);
		const s2 = TGeogPoint.fromString(`[POINT(0 0)@${T2}, POINT(1 1)@${T3}]`);
		const ss = TGeogPointSeqSet.fromSequences([s1, s2]);
		assert.ok(ss.inner !== 0);
		s1.free();
		s2.free();
		ss.free();
	});
});

describe('TGeogPoint - Accessors', () => {
	it('startValue / endValue return WKT strings', () => {
		const t = TGeogPoint.fromString(SEQ_WKT);
		assert.ok(t.startValue().startsWith('POINT'));
		assert.ok(t.endValue().startsWith('POINT'));
		t.free();
	});

	it('interpolation is Linear for sequences', () => {
		const t = TGeogPoint.fromString(SEQ_WKT);
		assert.equal(t.interpolation(), TInterpolation.Linear);
		t.free();
	});

	it('numInstants returns 2', () => {
		const t = TGeogPoint.fromString(SEQ_WKT);
		assert.equal(t.numInstants(), 2);
		t.free();
	});

	it('valueN returns a WKT string for index 0', () => {
		const t = TGeogPoint.fromString(INST_WKT);
		const v = t.valueN(0);
		assert.ok(v !== null);
		assert.ok(v!.startsWith('POINT'));
		t.free();
	});

	it('valueN returns null for out-of-range index', () => {
		const t = TGeogPoint.fromString(INST_WKT);
		assert.equal(t.valueN(99), null);
		t.free();
	});
});

describe('TGeogPoint - Output', () => {
	it('asText returns WKT string', () => {
		const t = TGeogPoint.fromString(INST_WKT);
		assert.ok(t.asText().includes('POINT'));
		t.free();
	});

	it('asHexWKB returns non-empty string', () => {
		const t = TGeogPoint.fromString(INST_WKT);
		const hex = t.asHexWKB();
		assert.ok(hex.length > 0);
		t.free();
	});
});

describe('TGeogPoint - Spatial transformations', () => {
	it('toSTBox returns non-zero Ptr', () => {
		const t = TGeogPoint.fromString(SEQ_WKT);
		const box = t.toSTBox();
		assert.ok(box !== 0);
		meos_free(box);
		t.free();
	});
});

describe('TGeogPoint - Movement analysis', () => {
	it('trajectory returns a WKT string', () => {
		const t = TGeogPoint.fromString(SEQ_WKT);
		const traj = t.trajectory();
		assert.ok(traj.startsWith('LINESTRING') || traj.startsWith('POINT'));
		t.free();
	});

	it('length is positive (geodetic metres)', () => {
		const t = TGeogPoint.fromString(SEQ_WKT);
		const l = t.length();
		assert.ok(l > 0, `Expected positive length, got ${l}`);
		t.free();
	});

	it('getX / getY return non-zero Ptrs', () => {
		const t = TGeogPoint.fromString(SEQ_WKT);
		const x = t.getX();
		const y = t.getY();
		assert.ok(x !== 0);
		assert.ok(y !== 0);
		meos_free(x);
		meos_free(y);
		t.free();
	});

	it('isSimple returns true for non-self-intersecting sequence', () => {
		const t = TGeogPoint.fromString(SEQ_WKT);
		assert.equal(t.isSimple(), true);
		t.free();
	});
});

describe('TGeogPoint - Distance', () => {
	it('nad returns a positive distance between Paris and Berlin', () => {
		const t = TGeogPoint.fromString(INST_WKT);
		const d = t.nad(BERLIN);
		assert.ok(d > 0, `Expected positive NAD, got ${d}`);
		t.free();
	});

	it('nad is 0 when point coincides', () => {
		const t = TGeogPoint.fromString(INST_WKT);
		assert.equal(t.nad(PARIS), 0);
		t.free();
	});

	it('temporalDistance returns non-zero Ptr', () => {
		const t = TGeogPoint.fromString(SEQ_WKT);
		const d = t.temporalDistance(BERLIN);
		assert.ok(d !== 0);
		meos_free(d);
		t.free();
	});
});

describe('TGeogPoint - round / hasZ', () => {
	it('round returns a TGeogPoint with rounded coordinates', () => {
		const t = TGeogPoint.fromString(
			'[POINT(2.123456 48.123456)@2001-01-01, POINT(13.123456 52.123456)@2001-01-02]'
		);
		const r = t.round(2);
		assert.ok(r.inner !== 0);
		assert.ok(r.toString().includes('2.12'));
		t.free();
		r.free();
	});

	it('hasZ returns false for 2D points', () => {
		const t = TGeogPoint.fromString('POINT(2.35 48.85)@2001-01-01');
		assert.equal(t.hasZ(), false);
		t.free();
	});

	it('hasZ returns true for 3D points', () => {
		const t = TGeogPoint.fromString('POINT Z(2.35 48.85 100)@2001-01-01');
		assert.equal(t.hasZ(), true);
		t.free();
	});
});

describe('TGeogPoint - speed / cumulativeLength / angularDifference', () => {
	it('speed returns non-zero TFloat Ptr for a sequence', () => {
		const t = TGeogPoint.fromString(
			'[POINT(2.35 48.85)@2001-01-01, POINT(13.40 52.52)@2001-01-02]'
		);
		const s = t.speed();
		assert.ok(s !== 0);
		meos_free(s);
		t.free();
	});

	it('cumulativeLength returns non-zero TFloat Ptr', () => {
		const t = TGeogPoint.fromString(
			'[POINT(2.35 48.85)@2001-01-01, POINT(13.40 52.52)@2001-01-02, POINT(2.35 48.85)@2001-01-03]'
		);
		const cl = t.cumulativeLength();
		assert.ok(cl !== 0);
		meos_free(cl);
		t.free();
	});

	it('angularDifference returns non-zero TFloat Ptr', () => {
		const t = TGeogPoint.fromString(
			'[POINT(2.35 48.85)@2001-01-01, POINT(13.40 52.52)@2001-01-02, POINT(2.35 48.85)@2001-01-03]'
		);
		const ad = t.angularDifference();
		assert.ok(ad !== 0);
		meos_free(ad);
		t.free();
	});
});
