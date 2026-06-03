import type { Ptr, TimestampTz } from '../../../functions/functions.generated.js';
import {
	geog_in,
	tpointinst_make,
	meos_free,
} from '../../../functions/functions.generated.js';
import { TGeogPoint } from './TGeogPoint.js';

/**
 * Temporal geography point - Instant subtype.
 *
 * A single (geography, timestamp) pair.
 *
 * @example
 * ```ts
 * const inst = TGeogPointInst.fromValue('POINT(2.35 48.85)', 60_000_000);
 * console.log(inst.startValue()); // POINT(2.35 48.85)
 * ```
 */
export class TGeogPointInst extends TGeogPoint {
	protected _fromInner(inner: Ptr): this {
		return new TGeogPointInst(inner) as this;
	}

	/**
	 * Constructs a TGeogPointInst from a WKT point string and a timestamp.
	 * @param wkt       WKT geography string (e.g. `"POINT(2.35 48.85)"`).
	 * @param timestamp Microseconds since 2000-01-01 UTC.
	 * MEOS: tpointinst_make
	 */
	static fromValue(wkt: string, timestamp: TimestampTz): TGeogPointInst {
		const gs = geog_in(wkt, -1);
		const inst = tpointinst_make(gs, timestamp);
		meos_free(gs);
		return new TGeogPointInst(inst);
	}
}
