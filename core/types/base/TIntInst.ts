import type { Ptr, TimestampTz } from '../../functions/functions.generated';
import { tintinst_make } from '../../functions/functions.generated';
import { TInt } from './TInt';

/**
 * Temporal integer — Instant subtype.
 *
 * A single (value, timestamp) pair. Wraps a MEOS TIntInst pointer.
 *
 * @example
 * ```ts
 * const inst = TIntInst.fromValue(42, 60_000_000); // 42@2000-01-01 00:01:00+00
 * ```
 */
export class TIntInst extends TInt {
	protected _fromInner(inner: Ptr): this {
		return new TIntInst(inner) as this;
	}

	/**
	 * Constructs a TIntInst from an integer value and a timestamp.
	 * @param value     Integer value.
	 * @param timestamp Microseconds since 2000-01-01 UTC.
	 * MEOS: tintinst_make
	 */
	static fromValue(value: number, timestamp: TimestampTz): TIntInst {
		return new TIntInst(tintinst_make(value, timestamp));
	}
}
