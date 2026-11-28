/**
 * What every viewer of the MobilityDB ecosystem shares, whatever it draws with
 * (deck.gl, OpenLayers, Leaflet): reading its moving objects as temporal points
 * and asking MEOS where each one is at the time of the clock. It depends on no
 * map library.
 */

import type { TimestampTz } from '../core/functions/functions.generated.js';
import { TGeomPoint as GeneratedTGeomPoint } from '../core/objects/objects.generated.js';
import { TInterpolation } from '../core/types/temporal/Temporal.js';
import { TGeomPoint } from '../core/types/basic/tgeompoint/TGeomPoint.js';

/** The temporal points of a text holding one hex WKB per line */
export function tgeompointsFromHexWKB(text: string): TGeomPoint[] {
	return text.split('\n').map(line => line.trim()).filter(line => line.length > 0)
		.map(hex => TGeomPoint.fromHexWKB(hex));
}

/** The media type of a value in the binary format MEOS gives every type */
const binaryMedia = 'application/octet-stream';

/**
 * A function answering the document at a URL: its bytes when the request
 * accepts the binary format and the server answers in it, else its JSON
 */
export type JsonGetter = (url: string, accept?: string) => Promise<unknown>;

const fetchJson: JsonGetter = async (url, accept) => {
	const res = await fetch(url, accept ? { headers: { Accept: accept } } : undefined);
	if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
	if (res.headers.get('Content-Type') === binaryMedia) return new Uint8Array(await res.arrayBuffer());
	return res.json();
};

/** The member sequences of a temporal point read from its binary format, or the point whole when it has none */
function members(bytes: Uint8Array): TGeomPoint[] {
	const whole = TGeomPoint.fromBinary(bytes);
	const interp = whole.interpolation();
	if (interp === TInterpolation.None || interp === TInterpolation.Discrete) return [whole];
	try {
		return new GeneratedTGeomPoint(whole.inner).sequences().map(seq => new TGeomPoint(seq.ptr));
	} finally {
		whole.free();
	}
}

interface Items { features: { id: string | number }[] }
interface TemporalGeometrySequence { geometrySequence: unknown[] }

/**
 * The temporal geometries of the moving features of a collection of an OGC
 * API Moving Features server such as MobilityAPI: every member of the
 * TemporalGeometrySequence of every feature (OGC API Moving Features, Part 1),
 * read from the binary format when the server answers in it, as MobilityAPI
 * does, and from the MF-JSON of each member otherwise.
 * @param origin The origin of the server, empty for the page's own
 * @param cid The identifier of the collection
 * @param get The function answering a JSON document, `fetch` by default
 */
export async function tgeompointsFromCollection(origin: string, cid: string,
	get: JsonGetter = fetchJson): Promise<TGeomPoint[]> {
	const base = `${origin}/collections/${encodeURIComponent(cid)}`;
	const items = await get(`${base}/items`) as Items;
	const result: TGeomPoint[] = [];
	for (const feature of items.features) {
		const fid = encodeURIComponent(String(feature.id));
		const body = await get(`${base}/items/${fid}/tgsequence`, `${binaryMedia}, application/json`);
		if (body instanceof Uint8Array) {
			result.push(...members(body));
			continue;
		}
		const seq = body as TemporalGeometrySequence;
		for (const member of seq.geometrySequence)
			result.push(TGeomPoint.fromMFJSON(JSON.stringify(member)));
	}
	return result;
}

/**
 * The x and y coordinates MEOS answers for a temporal point at a timestamp,
 * or null when the point is not defined at it
 * @param t Temporal point
 * @param ts Timestamp, as the timestamps of MEOS.js count it
 */
export function positionAt(t: TGeomPoint, ts: TimestampTz): [number, number] | null {
	const wkt = t.valueAtTimestamp(ts);
	if (wkt === null) return null;
	const m = /\(\s*([-+\d.eE]+)\s+([-+\d.eE]+)/.exec(wkt);
	return m ? [Number(m[1]), Number(m[2])] : null;
}
