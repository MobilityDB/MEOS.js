import type { Ptr, TimestampTz } from '../../functions/functions.generated';
import { tfloatinst_make } from '../../functions/functions.generated';
import { TFloat } from './TFloat';

/**
 * Temporal float — Instant subtype.
 *
 * A single (value, timestamp) pair. Wraps a MEOS TFloatInst pointer.
 *
 * @example
 * ```ts
 * const inst = TFloatInst.fromValue(3.14, 60_000_000); // 3.14@2000-01-01 00:01:00+00
 * ```
 */
export class TFloatInst extends TFloat {
	protected _fromInner(inner: Ptr): this {
		return new TFloatInst(inner) as this;
	}

	/**
	 * Constructs a TFloatInst from a float value and a timestamp.
	 * @param value     Float value.
	 * @param timestamp Microseconds since 2000-01-01 UTC.
	 * MEOS: tfloatinst_make
	 */
	static fromValue(value: number, timestamp: TimestampTz): TFloatInst {
		return new TFloatInst(tfloatinst_make(value, timestamp));
	}
}
