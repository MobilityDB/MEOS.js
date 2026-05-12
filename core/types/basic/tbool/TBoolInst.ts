import type { Ptr, TimestampTz } from '../../../functions/functions.generated';
import { tboolinst_make } from '../../../functions/functions.generated';
import { TBool } from './TBool';

/**
 * Temporal boolean — Instant subtype.
 *
 * A single (value, timestamp) pair. Wraps a MEOS TBoolInst pointer.
 *
 * @example
 * ```ts
 * const inst = TBoolInst.fromValue(true, 60_000_000); // true@2000-01-01 00:01:00+00
 * ```
 */
export class TBoolInst extends TBool {
	protected _fromInner(inner: Ptr): this {
		return new TBoolInst(inner) as this;
	}

	/**
	 * Constructs a TBoolInst from a boolean value and a timestamp.
	 * @param value     Boolean value.
	 * @param timestamp Microseconds since 2000-01-01 UTC.
	 * MEOS: tboolinst_make
	 */
	static fromValue(value: boolean, timestamp: TimestampTz): TBoolInst {
		return new TBoolInst(tboolinst_make(value, timestamp));
	}
}
