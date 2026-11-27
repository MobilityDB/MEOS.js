import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import { initMeos } from '../../core/runtime/meos.js';
import { TGeomPoint } from '../../core/types/basic/tgeompoint/TGeomPoint.js';
import {
	positionAt,
	tgeompointsFromCollection,
	tgeompointsFromHexWKB,
} from '../../viewer/index.js';

const T0 = '2024-01-15 09:00:00+00';
const T1 = '2024-01-15 09:05:00+00';
const T2 = '2024-01-15 09:10:00+00';

const SEQ = `SRID=4326;[POINT(4.35 50.85)@${T0}, POINT(4.36 50.86)@${T1}, POINT(4.37 50.85)@${T2}]`;
const SEQSET =
	`SRID=4326;{[POINT(4.35 50.85)@${T0}, POINT(4.36 50.86)@${T1}],` +
	`[POINT(4.40 50.88)@2024-01-15 09:20:00+00, POINT(4.41 50.89)@2024-01-15 09:25:00+00]}`;
// The middle instant lies 5e-7 degrees off the line through its neighbours:
// redundant within a band of 1e-6, kept by an exact collinearity test
const NEARLY_COLLINEAR =
	`SRID=4326;[POINT(4.0 50.0)@${T0}, POINT(4.0000005 50.0005)@${T1}, POINT(4.0 50.001)@${T2}]`;

/** The documents an OGC API Moving Features server answers for these points */
function collection(points: TGeomPoint[]): (url: string) => Promise<unknown> {
	const docs = new Map<string, unknown>();
	docs.set('/collections/c/items', { features: points.map((_, i) => ({ id: i + 1 })) });
	points.forEach((p, i) => {
		const mf = JSON.parse(p.asMFJSON(false, 0, 15, null));
		const members = (mf.sequences ?? [mf]).map((s: object, k: number) =>
			({ ...mf, sequences: undefined, ...s, type: 'MovingPoint', id: k + 1 }));
		docs.set(`/collections/c/items/${i + 1}/tgsequence`,
			{ type: 'TemporalGeometrySequence', geometrySequence: members });
	});
	return async url => {
		if (!docs.has(url)) throw new Error(`no document for ${url}`);
		return docs.get(url);
	};
}

before(async () => {
	await initMeos();
});

describe('tgeompointsFromHexWKB', () => {
	it('reads one temporal point per line, blank lines aside', () => {
		using a = TGeomPoint.fromString(SEQ);
		using b = TGeomPoint.fromString(SEQSET);
		const points = tgeompointsFromHexWKB(`${a.asHexWKB()}\n\n${b.asHexWKB()}\n`);
		assert.equal(points.length, 2);
		assert.equal(points[0].asText(), a.asText());
		assert.equal(points[1].asText(), b.asText());
	});
});

describe('tgeompointsFromCollection', () => {
	it('reads every sequence of every feature of a collection', async () => {
		using a = TGeomPoint.fromString(SEQ);
		using b = TGeomPoint.fromString(SEQSET);
		const points = await tgeompointsFromCollection('', 'c', collection([a, b]));
		assert.deepEqual(points.map(p => p.numInstants()), [3, 2, 2]);
		assert.equal(points[0].asText(), a.asText());
	});

	it('keeps an instant a band of 1e-6 degrees would drop', async () => {
		using a = TGeomPoint.fromString(NEARLY_COLLINEAR);
		assert.equal(a.numInstants(), 3);
		const [read] = await tgeompointsFromCollection('', 'c', collection([a]));
		assert.equal(read.numInstants(), 3);
		assert.equal(read.asText(), a.asText());
	});

	it('names the URL a server fails on', async () => {
		await assert.rejects(tgeompointsFromCollection('', 'none', collection([])),
			/\/collections\/none\/items/);
	});
});

describe('positionAt', () => {
	it('answers the instants of a sequence and its interpolation between them', () => {
		using t = TGeomPoint.fromString(SEQ);
		assert.deepEqual(positionAt(t, t.startTimestamp()), [4.35, 50.85]);
		assert.deepEqual(positionAt(t, t.endTimestamp()), [4.37, 50.85]);
		const mid = (t.startTimestamp() + t.endTimestamp()) / 2n;
		assert.deepEqual(positionAt(t, mid), [4.36, 50.86]);
	});

	it('answers null outside the time of the point and in a gap', () => {
		using t = TGeomPoint.fromString(SEQSET);
		assert.equal(positionAt(t, t.startTimestamp() - 1n), null);
		assert.equal(positionAt(t, t.endTimestamp() + 1n), null);
		using gap = TGeomPoint.fromString(`SRID=4326;POINT(0 0)@2024-01-15 09:15:00+00`);
		assert.equal(positionAt(t, gap.startTimestamp()), null);
	});
});
