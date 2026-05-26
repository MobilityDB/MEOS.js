import type { Ptr } from '../../../functions/functions.generated';
import { tsequence_make } from '../../../functions/functions.generated';
import { withPtrArray } from '../../../functions/ptr_array';
import { TText } from './TText';

/**
 * Temporal text — Sequence subtype.
 *
 * A sequence of (value, timestamp) pairs with stepwise interpolation.
 * Wraps a MEOS TTextSeq pointer.
 *
 * Note: TText always uses stepwise interpolation — text values cannot be
 * linearly interpolated.
 *
 * @example
 * ```ts
 * const i1 = TTextInst.fromValue('hello', 60_000_000);
 * const i2 = TTextInst.fromValue('world', 120_000_000);
 * const seq = TTextSeq.fromInstants([i1, i2]);
 * ```
 */
export class TTextSeq extends TText {
	protected _fromInner(inner: Ptr): this {
		return new TTextSeq(inner) as this;
	}

	/**
	 * Builds a TTextSeq from an array of temporal texts (typically instants).
	 *
	 * @param instants   Ordered array of TText values.
	 * @param lowerInc   Whether the lower bound is inclusive (default `true`).
	 * @param upperInc   Whether the upper bound is inclusive (default `true`).
	 * @param normalize  Merge redundant instants (default `true`).
	 * MEOS: tsequence_make (Stepwise = 2)
	 */
	static fromInstants(
		instants: TText[],
		lowerInc = true,
		upperInc = true,
		normalize = true,
	): TTextSeq {
		const ptr = withPtrArray(
			instants.map(i => i.inner),
			(arr, count) => tsequence_make(arr, count, lowerInc, upperInc, 2, normalize),
		);
		return new TTextSeq(ptr);
	}
}
