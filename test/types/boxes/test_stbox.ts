import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import { initMeos } from '../../../core/runtime/meos';
import { STBox } from '../../../core/types/boxes/STBox';
import { TsTzSpan } from '../../../core/types/collections/time/TsTzSpan';

before(async () => {
	await initMeos();
});

// Five canonical WKT variants from STBoxTest.java
const WKT_X = 'STBOX X((1,1),(2,2))';
const WKT_Z = 'STBOX Z((1,1,1),(2,2,2))';
const WKT_T = 'STBOX T([2019-09-01,2019-09-02])';
const WKT_XT = 'STBOX XT(((1,1),(2,2)),[2019-09-01,2019-09-02])';
const WKT_ZT = 'STBOX ZT(((1,1,1),(2,2,2)),[2019-09-01,2019-09-02])';
const WKT_GEO = 'GEODSTBOX X((1,1),(2,2))';

describe('STBox - Construction', () => {
	it('fromString X round-trips WKT', () => {
		const b = STBox.fromString(WKT_X);
		assert.equal(b.toString(), WKT_X);
		b.free();
	});

	it('fromString Z round-trips WKT', () => {
		const b = STBox.fromString(WKT_Z);
		assert.equal(b.toString(), WKT_Z);
		b.free();
	});

	it('fromString T round-trips WKT', () => {
		const b = STBox.fromString(WKT_T);
		assert.ok(b.toString().includes('2019-09-01'));
		b.free();
	});

	it('fromString XT round-trips WKT', () => {
		const b = STBox.fromString(WKT_XT);
		assert.ok(b.toString().startsWith('STBOX XT'));
		b.free();
	});

	it('fromString ZT round-trips WKT', () => {
		const b = STBox.fromString(WKT_ZT);
		assert.ok(b.toString().startsWith('STBOX ZT'));
		b.free();
	});

	it('fromHexWKB round-trips through asHexWKB', () => {
		const b1 = STBox.fromString(WKT_XT);
		const hex = b1.asHexWKB();
		const b2 = STBox.fromHexWKB(hex);
		assert.equal(b1.eq(b2), true);
		b1.free();
		b2.free();
	});

	it('copy produces equal but distinct object', () => {
		const b = STBox.fromString(WKT_XT);
		const c = b.copy();
		assert.equal(b.eq(c), true);
		assert.notEqual(b.inner, c.inner);
		b.free();
		c.free();
	});

	it('fromTsTzSpan creates T-only box', () => {
		const sp = TsTzSpan.fromString('[2020-01-01, 2020-12-31]');
		const b = STBox.fromTsTzSpan(sp.inner);
		assert.equal(b.hasX(), false);
		assert.equal(b.hasT(), true);
		sp.free();
		b.free();
	});

	it('make builds XT box from explicit bounds', () => {
		const sp = TsTzSpan.fromString('[2020-01-01, 2020-06-01]');
		const b = STBox.make(true, false, false, 0, 1, 2, 1, 2, 0, 0, sp.inner);
		assert.equal(b.hasX(), true);
		assert.equal(b.hasT(), true);
		assert.equal(b.hasZ(), false);
		sp.free();
		b.free();
	});
});

describe('STBox - Accessors', () => {
	it('hasX: X=true, Z=false, T=false', () => {
		const bx = STBox.fromString(WKT_X);
		const bz = STBox.fromString(WKT_Z);
		const bt = STBox.fromString(WKT_T);
		assert.equal(bx.hasX(), true);
		assert.equal(bz.hasX(), true); // Z implies X in MEOS
		assert.equal(bt.hasX(), false);
		bx.free();
		bz.free();
		bt.free();
	});

	it('hasZ: only Z and ZT boxes have Z', () => {
		const bx = STBox.fromString(WKT_X);
		const bz = STBox.fromString(WKT_Z);
		const bxt = STBox.fromString(WKT_XT);
		const bzt = STBox.fromString(WKT_ZT);
		assert.equal(bx.hasZ(), false);
		assert.equal(bz.hasZ(), true);
		assert.equal(bxt.hasZ(), false);
		assert.equal(bzt.hasZ(), true);
		bx.free();
		bz.free();
		bxt.free();
		bzt.free();
	});

	it('hasT: only T, XT, ZT have T', () => {
		const bx = STBox.fromString(WKT_X);
		const bt = STBox.fromString(WKT_T);
		const bxt = STBox.fromString(WKT_XT);
		assert.equal(bx.hasT(), false);
		assert.equal(bt.hasT(), true);
		assert.equal(bxt.hasT(), true);
		bx.free();
		bt.free();
		bxt.free();
	});

	it('isGeodetic: false for STBOX, true for GEODSTBOX', () => {
		const b = STBox.fromString(WKT_X);
		const bg = STBox.fromString(WKT_GEO);
		assert.equal(b.isGeodetic(), false);
		assert.equal(bg.isGeodetic(), true);
		b.free();
		bg.free();
	});

	it('xmin/xmax/ymin/ymax on X box', () => {
		const b = STBox.fromString(WKT_X);
		assert.equal(b.xmin(), 1);
		assert.equal(b.xmax(), 2);
		assert.equal(b.ymin(), 1);
		assert.equal(b.ymax(), 2);
		b.free();
	});

	it('zmin/zmax on Z box', () => {
		const b = STBox.fromString(WKT_Z);
		assert.equal(b.zmin(), 1);
		assert.equal(b.zmax(), 2);
		b.free();
	});

	it('tmin/tmax are non-zero for T boxes', () => {
		const b = STBox.fromString(WKT_T);
		assert.ok(b.tmin() !== 0);
		assert.ok(b.tmax() !== 0);
		assert.ok(b.tmax() > b.tmin());
		b.free();
	});

	it('tminInc/tmaxInc are true by default', () => {
		const b = STBox.fromString(WKT_T);
		assert.equal(b.tminInc(), true);
		assert.equal(b.tmaxInc(), true);
		b.free();
	});

	it('srid: 0 for plain STBOX, 4326 for GEODSTBOX', () => {
		const b = STBox.fromString(WKT_X);
		const bg = STBox.fromString(WKT_GEO);
		assert.equal(b.srid(), 0);
		assert.equal(bg.srid(), 4326);
		b.free();
		bg.free();
	});
});

describe('STBox - Spatial Reference System', () => {
	it('setSrid returns new box with updated SRID', () => {
		const b = STBox.fromString(WKT_X);
		const r = b.setSrid(5676);
		assert.equal(r.srid(), 5676);
		b.free();
		r.free();
	});
});

describe('STBox - Conversions', () => {
	it('toTsTzSpan returns non-zero ptr for T boxes', () => {
		const b = STBox.fromString(WKT_T);
		const ptr = b.toTsTzSpan();
		assert.ok(ptr !== 0);
		b.free();
	});

	it('toGeoPtr returns non-zero ptr for X boxes', () => {
		const b = STBox.fromString(WKT_X);
		const ptr = b.toGeoPtr();
		assert.ok(ptr !== 0);
		b.free();
	});
});

describe('STBox - Transformations', () => {
	it('getSpace strips temporal dimension', () => {
		const b = STBox.fromString(WKT_XT);
		const s = b.getSpace();
		assert.equal(s.hasX(), true);
		assert.equal(s.hasT(), false);
		b.free();
		s.free();
	});

	it('expandSpace grows spatial bounds', () => {
		const b = STBox.fromString(WKT_X); // X((1,1),(2,2))
		const r = b.expandSpace(1);
		assert.equal(r.xmin(), 0);
		assert.equal(r.xmax(), 3);
		b.free();
		r.free();
	});

	it('round rounds coordinates to given decimal digits', () => {
		const b = STBox.fromString('STBOX X((1.1234,1.1234),(2.5678,2.5678))');
		const r = b.round(2);
		assert.ok(r.toString().includes('1.12'));
		b.free();
		r.free();
	});
});

describe('STBox - Topological predicates', () => {
	it('isAdjacent: touching boxes are adjacent', () => {
		const a = STBox.fromString('STBOX X((1,1),(2,2))');
		const b = STBox.fromString('STBOX X((2,2),(3,3))');
		assert.equal(a.isAdjacent(b), true);
		a.free();
		b.free();
	});

	it('isAdjacent: overlapping boxes are not adjacent', () => {
		const a = STBox.fromString('STBOX X((1,1),(2,2))');
		const b = STBox.fromString('STBOX X((1,1),(3,3))');
		assert.equal(a.isAdjacent(b), false);
		a.free();
		b.free();
	});

	it('isContainedIn: smaller box contained in larger', () => {
		const a = STBox.fromString('STBOX X((1,1),(2,2))');
		const b = STBox.fromString('STBOX X((0,0),(3,3))');
		assert.equal(a.isContainedIn(b), true);
		a.free();
		b.free();
	});

	it('contains: larger box contains smaller', () => {
		const a = STBox.fromString('STBOX X((0,0),(3,3))');
		const b = STBox.fromString('STBOX X((1,1),(2,2))');
		assert.equal(a.contains(b), true);
		a.free();
		b.free();
	});

	it('overlaps: intersecting boxes overlap', () => {
		const a = STBox.fromString('STBOX X((1,1),(3,3))');
		const b = STBox.fromString('STBOX X((2,2),(4,4))');
		assert.equal(a.overlaps(b), true);
		a.free();
		b.free();
	});

	it('isSame: identical boxes are same', () => {
		const a = STBox.fromString(WKT_X);
		const b = STBox.fromString(WKT_X);
		assert.equal(a.isSame(b), true);
		a.free();
		b.free();
	});
});

describe('STBox - Position predicates', () => {
	it('isLeft / isRight on X axis', () => {
		const a = STBox.fromString('STBOX X((1,1),(2,2))');
		const b = STBox.fromString('STBOX X((3,1),(4,2))');
		assert.equal(a.isLeft(b), true);
		assert.equal(b.isRight(a), true);
		a.free();
		b.free();
	});

	it('isBelow / isAbove on Y axis', () => {
		const a = STBox.fromString('STBOX X((1,1),(2,2))');
		const b = STBox.fromString('STBOX X((1,3),(2,4))');
		assert.equal(a.isBelow(b), true);
		assert.equal(b.isAbove(a), true);
		a.free();
		b.free();
	});

	it('isBefore / isAfter on T axis', () => {
		const a = STBox.fromString('STBOX T([2019-09-01,2019-09-02])');
		const b = STBox.fromString('STBOX T([2019-09-03,2019-09-04])');
		assert.equal(a.isBefore(b), true);
		assert.equal(b.isAfter(a), true);
		a.free();
		b.free();
	});

	it('isFront / isBehind on Z axis', () => {
		const a = STBox.fromString('STBOX Z((1,1,1),(2,2,2))');
		const b = STBox.fromString('STBOX Z((1,1,3),(2,2,4))');
		assert.equal(a.isFront(b), true);
		assert.equal(b.isBehind(a), true);
		a.free();
		b.free();
	});
});

describe('STBox - Distance', () => {
	it('distance is 0 for overlapping boxes', () => {
		const a = STBox.fromString('STBOX X((1,1),(3,3))');
		const b = STBox.fromString('STBOX X((2,2),(4,4))');
		assert.equal(a.distance(b), 0);
		a.free();
		b.free();
	});

	it('distance is positive for disjoint boxes', () => {
		const a = STBox.fromString('STBOX X((1,1),(2,2))');
		const b = STBox.fromString('STBOX X((5,5),(6,6))');
		assert.ok(a.distance(b) > 0);
		a.free();
		b.free();
	});
});

describe('STBox - Set operations', () => {
	it('intersection of overlapping boxes is non-null', () => {
		const a = STBox.fromString('STBOX X((1,1),(3,3))');
		const b = STBox.fromString('STBOX X((2,2),(4,4))');
		const r = a.intersection(b);
		assert.ok(r !== null);
		r!.free();
		a.free();
		b.free();
	});

	it('intersection of disjoint boxes is null', () => {
		const a = STBox.fromString('STBOX X((1,1),(2,2))');
		const b = STBox.fromString('STBOX X((5,5),(6,6))');
		assert.equal(a.intersection(b), null);
		a.free();
		b.free();
	});

	it('union of adjacent boxes covers both', () => {
		const a = STBox.fromString('STBOX X((1,1),(2,2))');
		const b = STBox.fromString('STBOX X((2,2),(3,3))');
		const r = a.union(b);
		assert.equal(r.xmin(), 1);
		assert.equal(r.xmax(), 3);
		r.free();
		a.free();
		b.free();
	});
});

describe('STBox - Comparisons', () => {
	it('eq: same box is equal', () => {
		const a = STBox.fromString(WKT_X);
		const b = STBox.fromString(WKT_X);
		assert.equal(a.eq(b), true);
		assert.equal(a.ne(b), false);
		a.free();
		b.free();
	});

	it('lt / gt ordering', () => {
		const a = STBox.fromString('STBOX X((1,1),(2,2))');
		const b = STBox.fromString('STBOX X((3,3),(4,4))');
		assert.equal(a.lt(b), true);
		assert.equal(b.gt(a), true);
		a.free();
		b.free();
	});

	it('cmp returns -1 / 0 / 1', () => {
		const a = STBox.fromString('STBOX X((1,1),(2,2))');
		const b = STBox.fromString('STBOX X((3,3),(4,4))');
		const c = STBox.fromString('STBOX X((1,1),(2,2))');
		assert.equal(a.cmp(b), -1);
		assert.equal(b.cmp(a), 1);
		assert.equal(a.cmp(c), 0);
		a.free();
		b.free();
		c.free();
	});
});
