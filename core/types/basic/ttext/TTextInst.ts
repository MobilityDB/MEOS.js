import type { Ptr, TimestampTz } from '../../../functions/functions.generated';
import { ttextinst_make } from '../../../functions/functions.generated';
import { TText } from './TText';

/**
 * Temporal text — Instant subtype.
 *
 * A single (value, timestamp) pair. Wraps a MEOS TTextInst pointer.
 *
 * @example
 * ```ts
 * const inst = TTextInst.fromValue('hello', 60_000_000);
 * ```
 */
export class TTextInst extends TText {
	protected _fromInner(inner: Ptr): this {
		return new TTextInst(inner) as this;
	}

	/**
	 * Constructs a TTextInst from a string value and a timestamp.
	 * @param value     String value.
	 * @param timestamp Microseconds since 2000-01-01 UTC.
	 * MEOS: ttextinst_make
	 */
	static fromValue(value: string, timestamp: TimestampTz): TTextInst {
		return new TTextInst(ttextinst_make(value, timestamp));
	}
}
