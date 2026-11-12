import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import { initMeos } from '../../core/runtime/meos.js';
import { MeosInvalidArgValueError } from '../../core/functions/errors.js';
import { Pcschema, Raster, STBox } from '../../core/objects/objects.generated.js';
import type { PCDimensionSpec } from '../../core/objects/objects.generated.js';

// The structs the object layer reads and writes as values (codegen/ObjectGenerator.ts):
// an answered array of structs holding MEOS values, an array of structs of scalars
// and strings a function reads in place, and a struct of scalars alone. The cases
// are MEOS.NET's HeldStructArrayTests and WrittenStructArrayTests, on the same data.

before(async () => {
	await initMeos();
});

// MobilityDB's meos/test/raster_test.c raster_values: a 3x3 raster in SRID 4326
// whose band 1 holds eight distinct values and one nodata pixel.
const RASTER_VALUES =
	'0100000100000000000000f03f000000000000f0bf0000000000000000000000000000'
	+ '084000000000000000000000000000000000e6100000030003004a003c1cc600002041'
	+ '003c1cc60000f04100002042000048420000704200008c420000a0420000b442';
const VALUE_SUM = 10 + 30 + 40 + 50 + 60 + 70 + 80 + 90;

describe('generated object layer: an answered array of structs holding MEOS values', () => {
	it('dumps a band as one polygon per value, each a geometry that outlives the array', () => {
		using raster = Raster.fromHexWKB(RASTER_VALUES)!;
		const polygons = raster.dumpAsPolygons(1, true);
		// No two neighbouring pixels share a value, so every pixel is a region of
		// its own: eight polygons with the nodata pixel excluded.
		assert.equal(polygons.length, 8);
		assert.equal(polygons.reduce((s, p) => s + p.val, 0), VALUE_SUM);
		// geomval_arr_free has released the array and the geometries in it, so
		// each geometry read here is the copy the struct holds.
		for (const p of polygons) {
			assert.ok(p.geom);
			// A pixel of one degree by one degree covers an area of 1.
			assert.ok(Math.abs(p.geom.area(false) - 1) < 0.001);
			assert.equal(p.geom.SRID(), 4326);
			assert.match(p.geom.toString(), /^POLYGON/);
			p.geom.free();
		}
	});

	it('answers each pixel with its position, value and point', () => {
		using raster = Raster.fromHexWKB(RASTER_VALUES)!;
		const pixels = raster.pixelAsPoints(1, true);
		assert.equal(pixels.length, 8);
		assert.equal(pixels.reduce((s, p) => s + p.value, 0), VALUE_SUM);
		for (const p of pixels) {
			assert.equal(p.nodata, false);
			assert.ok(p.x >= 1 && p.x <= 3 && p.y >= 1 && p.y <= 3);
			assert.equal(p.geom!.SRID(), 4326);
			assert.match(p.geom!.toString(), /^POINT/);
			p.geom!.free();
		}
	});
});

// The dimensions MobilityDB's meos/test/decimal_digits_test.c registers.
const dims = (): PCDimensionSpec[] => [
	{ name: 'X', description: 'X coordinate', position: 1, interpretation: 'int32_t', scale: 0.01, offset: 0, active: true },
	{ name: 'Y', description: 'Y coordinate', position: 2, interpretation: 'int32_t', scale: 0.01, offset: 0, active: true },
	{ name: 'Z', description: 'Z coordinate', position: 3, interpretation: 'int32_t', scale: 0.01, offset: 0, active: true },
];

describe('generated object layer: an array of structs of scalars and strings passed in', () => {
	it('registers a schema from its dimensions, which states them', () => {
		const pcid = 9101;
		assert.equal(Pcschema.registerDims(pcid, 4326, 'none', dims()), true);
		assert.equal(Pcschema.ndims(pcid), 3);
		assert.equal(Pcschema.SRID(pcid), 4326);
		assert.equal(Pcschema.compression(pcid), 'none');
		// The names and interpretations are the copies MEOS keeps, read back after
		// the strings the call passed are freed; each field lands at the offset
		// MEOS reads it at.
		const xml = Pcschema.xml(pcid);
		assert.ok(xml.includes('<pc:position>3</pc:position>'));
		assert.ok(xml.includes('<pc:name>Z</pc:name>'));
		assert.ok(xml.includes('<pc:interpretation>int32_t</pc:interpretation>'));
		assert.ok(xml.includes('<pc:scale>0.01</pc:scale>'));
		assert.ok(xml.includes('<pc:active>1</pc:active>'));
	});

	it('builds a schema from its dimensions', () => {
		using schema = Pcschema.fromDims(9102, 0, 'none', dims());
		assert.ok(schema);
	});

	it('refuses a dimension of an unknown interpretation', () => {
		// pc_interpretation_number reads no such type, so MEOS refuses the schema
		// rather than store a dimension it cannot read.
		const bad: PCDimensionSpec[] = [
			{ name: 'X', description: 'X coordinate', position: 1, interpretation: 'nonsense', scale: 1, offset: 0, active: true },
		];
		assert.throws(() => Pcschema.fromDims(9103, 0, 'none', bad), MeosInvalidArgValueError);
	});
});

describe('generated object layer: a struct of scalars carried as a value', () => {
	it('reads a box as a GBOX value and builds the box back from it', () => {
		using box = STBox.fromText('STBOX X((1,2),(3,4))');
		const gbox = box.toGbox();
		assert.deepEqual([gbox.xmin, gbox.xmax, gbox.ymin, gbox.ymax], [1, 3, 2, 4]);
		using back = STBox.fromGbox(gbox);
		assert.equal(back.toString(), box.toString());
	});
});
