import type { Ptr, TimestampTz } from '../../../functions/functions.generated.js';
import {
	geo_from_text,
	tpointinst_make,
	meos_free,
} from '../../../functions/functions.generated.js';
import { TGeomPoint } from './TGeomPoint.js';

/**
 * Temporal geometry point - Instant subtype.
 *
 * A single (geometry, timestamp) pair.
 *
 * @example
 * ```ts
 * const inst = TGeomPointInst.fromValue('POINT(1 2)', 60_000_000);
 * console.log(inst.startValue()); // POINT(1 2)
 * ```
 */
export class TGeomPointInst extends TGeomPoint {
	protected _fromInner(inner: Ptr): this {
		return new TGeomPointInst(inner) as this;
	}

	/**
	 * Constructs a TGeomPointInst from a WKT point string and a timestamp.
	 * @param wkt       WKT geometry string (e.g. `"POINT(1 2)"`).
	 * @param timestamp Microseconds since 2000-01-01 UTC.
	 * MEOS: tpointinst_make
	 */
	static fromValue(wkt: string, timestamp: TimestampTz): TGeomPointInst {
		const gs = geo_from_text(wkt, 0);
		const inst = tpointinst_make(gs, timestamp);
		meos_free(gs);
		return new TGeomPointInst(inst);
	}
}
