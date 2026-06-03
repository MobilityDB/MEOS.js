import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import { initMeos } from '../../../../core/runtime/meos.js';
import { TGeomPoint } from '../../../../core/types/basic/tgeompoint/TGeomPoint.js';
import { TGeomPointInst } from '../../../../core/types/basic/tgeompoint/TGeomPointInst.js';
import { TGeomPointSeq } from '../../../../core/types/basic/tgeompoint/TGeomPointSeq.js';
import { TGeomPointSeqSet } from '../../../../core/types/basic/tgeompoint/TGeomPointSeqSet.js';
import { TInterpolation } from '../../../../core/types/temporal/Temporal.js';
import { meos_free } from '../../../../core/functions/functions.generated.js';

const T0 = '2001-01-01 00:00:00+00';
const T1 = '2001-01-02 00:00:00+00';
const T2 = '2001-01-03 00:00:00+00';
const T3 = '2001-01-04 00:00:00+00';

const INST_WKT = `POINT(1 1)@${T0}`;
const SEQ_WKT = `[POINT(0 0)@${T0}, POINT(1 1)@${T1}]`;
const SS_WKT = `{[POINT(0 0)@${T0}, POINT(1 1)@${T1}],[POINT(2 2)@${T2}, POINT(3 3)@${T3}]}`;

before(async () => {
	await initMeos();
});

describe('TGeomPoint - Construction', () => {
	it('fromString instant round-trips', () => {
		const t = TGeomPoint.fromString(INST_WKT);
		assert.ok(t.inner !== 0);
		assert.ok(t.toString().includes('POINT(1 1)'));
		t.free();
	});

	it('fromString sequence round-trips', () => {
		const t = TGeomPoint.fromString(SEQ_WKT);
		assert.ok(t.inner !== 0);
		assert.ok(t.toString().includes('POINT(0 0)'));
		t.free();
	});

	it('fromString sequence set round-trips', () => {
		const t = TGeomPoint.fromString(SS_WKT);
		assert.ok(t.inner !== 0);
		t.free();
	});

	it('fromInstant creates a non-zero pointer', () => {
		const t = TGeomPoint.fromInstant('POINT(1 2)', 60_000_000);
		assert.ok(t.inner !== 0);
		t.free();
	});

	it('copy produces equal but distinct object', () => {
		const t = TGeomPoint.fromString(SEQ_WKT);
		const c = t.copy();
		assert.notEqual(t.inner, c.inner);
		assert.ok(c.inner !== 0);
		t.free();
		c.free();
	});
});

describe('TGeomPoint - Subtypes', () => {
	it('TGeomPointInst.fromValue creates instant', () => {
		const inst = TGeomPointInst.fromValue('POINT(5 5)', 0);
		assert.ok(inst.inner !== 0);
		assert.ok(inst.startValue().includes('POINT'));
		inst.free();
	});

	it('TGeomPointSeq.fromInstants creates sequence', () => {
		const i1 = TGeomPointInst.fromValue('POINT(0 0)', 0);
		const i2 = TGeomPointInst.fromValue('POINT(1 1)', 86_400_000_000);
		const seq = TGeomPointSeq.fromInstants([i1, i2]);
		assert.ok(seq.inner !== 0);
		assert.equal(seq.numInstants(), 2);
		i1.free();
		i2.free();
		seq.free();
	});

	it('TGeomPointSeqSet.fromSequences creates sequence set', () => {
		const s1 = TGeomPoint.fromString(`[POINT(0 0)@${T0}, POINT(1 1)@${T1}]`);
		const s2 = TGeomPoint.fromString(`[POINT(2 2)@${T2}, POINT(3 3)@${T3}]`);
		const ss = TGeomPointSeqSet.fromSequences([s1, s2]);
		assert.ok(ss.inner !== 0);
		s1.free();
		s2.free();
		ss.free();
	});
});

describe('TGeomPoint - Accessors', () => {
	it('startValue / endValue return WKT strings', () => {
		const t = TGeomPoint.fromString(SEQ_WKT);
		assert.ok(t.startValue().startsWith('POINT'));
		assert.ok(t.endValue().startsWith('POINT'));
		t.free();
	});

	it('interpolation is Linear for sequences', () => {
		const t = TGeomPoint.fromString(SEQ_WKT);
		assert.equal(t.interpolation(), TInterpolation.Linear);
		t.free();
	});

	it('numInstants returns 2 for two-instant sequence', () => {
		const t = TGeomPoint.fromString(SEQ_WKT);
		assert.equal(t.numInstants(), 2);
		t.free();
	});

	it('valueN returns a WKT string for index 0', () => {
		const t = TGeomPoint.fromString(INST_WKT);
		const v = t.valueN(0);
		assert.ok(v !== null);
		assert.ok(v!.startsWith('POINT'));
		t.free();
	});

	it('valueN returns null for out-of-range index', () => {
		const t = TGeomPoint.fromString(INST_WKT);
		assert.equal(t.valueN(99), null);
		t.free();
	});

	it('srid returns 0 for plain geometry', () => {
		const t = TGeomPoint.fromString(INST_WKT);
		assert.equal(t.srid(), 0);
		t.free();
	});
});

describe('TGeomPoint - Output', () => {
	it('asText returns WKT string', () => {
		const t = TGeomPoint.fromString(INST_WKT);
		assert.ok(t.asText().includes('POINT'));
		t.free();
	});

	it('asHexWKB returns non-empty string', () => {
		const t = TGeomPoint.fromString(INST_WKT);
		const hex = t.asHexWKB();
		assert.ok(hex.length > 0);
		t.free();
	});

	it('asMFJSON returns JSON-like string', () => {
		const t = TGeomPoint.fromString(INST_WKT);
		const json = t.asMFJSON();
		assert.ok(json.includes('{'));
		t.free();
	});
});

describe('TGeomPoint - Spatial transformations', () => {
	it('setSrid updates the SRID', () => {
		const t = TGeomPoint.fromString(INST_WKT);
		const t2 = t.setSrid(4326);
		assert.equal(t2.srid(), 4326);
		t.free();
		t2.free();
	});

	it('toSTBox returns non-zero Ptr', () => {
		const t = TGeomPoint.fromString(SEQ_WKT);
		const box = t.toSTBox();
		assert.ok(box !== 0);
		meos_free(box);
		t.free();
	});
});

describe('TGeomPoint - Movement analysis', () => {
	it('trajectory returns a WKT string', () => {
		const t = TGeomPoint.fromString(SEQ_WKT);
		const traj = t.trajectory();
		assert.ok(traj.startsWith('LINESTRING') || traj.startsWith('POINT'));
		t.free();
	});

	it('length is positive for a sequence with two different points', () => {
		const t = TGeomPoint.fromString(SEQ_WKT);
		assert.ok(t.length() > 0);
		t.free();
	});

	it('direction returns a finite number', () => {
		const t = TGeomPoint.fromString(SEQ_WKT);
		const d = t.direction();
		assert.ok(isFinite(d));
		t.free();
	});

	it('getX / getY return non-zero TFloat Ptrs', () => {
		const t = TGeomPoint.fromString(SEQ_WKT);
		const x = t.getX();
		const y = t.getY();
		assert.ok(x !== 0);
		assert.ok(y !== 0);
		meos_free(x);
		meos_free(y);
		t.free();
	});

	it('isSimple returns true for non-self-intersecting sequence', () => {
		const t = TGeomPoint.fromString(SEQ_WKT);
		assert.equal(t.isSimple(), true);
		t.free();
	});
});

describe('TGeomPoint - Restrictions', () => {
	it('atGeom restricts to instants inside geometry', () => {
		const t = TGeomPoint.fromString(SEQ_WKT);
		const r = t.atGeom('POLYGON((-1 -1, 2 -1, 2 2, -1 2, -1 -1))');
		assert.ok(r !== null);
		r!.free();
		t.free();
	});

	it('atGeom returns null when outside geometry', () => {
		const t = TGeomPoint.fromString(INST_WKT); // POINT(1 1)
		const r = t.atGeom('POLYGON((10 10, 20 10, 20 20, 10 20, 10 10))');
		assert.equal(r, null);
		t.free();
	});
});

describe('TGeomPoint - Ever/Always comparisons', () => {
	it('everEq returns true for matching point', () => {
		const t = TGeomPoint.fromString(INST_WKT);
		assert.equal(t.everEq('POINT(1 1)'), true);
		t.free();
	});

	it('everEq returns false for non-matching point', () => {
		const t = TGeomPoint.fromString(INST_WKT);
		assert.equal(t.everEq('POINT(9 9)'), false);
		t.free();
	});

	it('everIntersects returns true for overlapping geometry', () => {
		const t = TGeomPoint.fromString(INST_WKT);
		assert.equal(t.everIntersects('POINT(1 1)'), true);
		t.free();
	});
});

describe('TGeomPoint - Distance', () => {
	it('temporalDistance returns non-zero Ptr', () => {
		const t = TGeomPoint.fromString(SEQ_WKT);
		const d = t.temporalDistance('POINT(5 5)');
		assert.ok(d !== 0);
		meos_free(d);
		t.free();
	});

	it('nad returns a non-negative distance', () => {
		const t = TGeomPoint.fromString(INST_WKT);
		const d = t.nad('POINT(4 5)');
		assert.ok(d >= 0);
		t.free();
	});

	it('nad is 0 when point coincides', () => {
		const t = TGeomPoint.fromString(INST_WKT);
		assert.equal(t.nad('POINT(1 1)'), 0);
		t.free();
	});
});

describe('TGeomPoint - round / hasZ', () => {
	it('round returns a TGeomPoint with rounded coordinates', () => {
		const t = TGeomPoint.fromString(
			'[POINT(1.23456 4.56789)@2001-01-01, POINT(2.34567 5.67891)@2001-01-02]'
		);
		const r = t.round(2);
		assert.ok(r.inner !== 0);
		assert.ok(r.toString().includes('1.23'));
		t.free();
		r.free();
	});

	it('hasZ returns false for 2D points', () => {
		const t = TGeomPoint.fromString('POINT(1 2)@2001-01-01');
		assert.equal(t.hasZ(), false);
		t.free();
	});

	it('hasZ returns true for 3D points', () => {
		const t = TGeomPoint.fromString('POINT Z(1 2 3)@2001-01-01');
		assert.equal(t.hasZ(), true);
		t.free();
	});
});

describe('TGeomPoint - speed / cumulativeLength / angularDifference', () => {
	it('speed returns non-zero TFloat Ptr for a sequence', () => {
		const t = TGeomPoint.fromString('[POINT(0 0)@2001-01-01, POINT(1 1)@2001-01-02]');
		const s = t.speed();
		assert.ok(s !== 0);
		meos_free(s);
		t.free();
	});

	it('cumulativeLength returns non-zero TFloat Ptr', () => {
		const t = TGeomPoint.fromString(
			'[POINT(0 0)@2001-01-01, POINT(1 1)@2001-01-02, POINT(2 0)@2001-01-03]'
		);
		const cl = t.cumulativeLength();
		assert.ok(cl !== 0);
		meos_free(cl);
		t.free();
	});

	it('angularDifference returns non-zero TFloat Ptr', () => {
		const t = TGeomPoint.fromString(
			'[POINT(0 0)@2001-01-01, POINT(1 0)@2001-01-02, POINT(1 1)@2001-01-03]'
		);
		const ad = t.angularDifference();
		assert.ok(ad !== 0);
		meos_free(ad);
		t.free();
	});
});
