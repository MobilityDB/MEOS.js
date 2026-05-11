import type { Ptr } from '../../functions/functions.generated';
import { tsequence_make } from '../../functions/functions.generated';
import { withPtrArray } from '../../functions/ptr_array';
import { TInt } from './TInt';

/**
 * Temporal integer — Sequence subtype.
 *
 * A stepwise-interpolated sequence of (value, timestamp) pairs.
 * Wraps a MEOS TIntSeq pointer.
 *
 * @example
 * ```ts
 * const i1 = TIntInst.fromValue(1, 60_000_000);
 * const i2 = TIntInst.fromValue(5, 120_000_000);
 * const seq = TIntSeq.fromInstants([i1, i2]);
 * ```
 */
export class TIntSeq extends TInt {
	protected _fromInner(inner: Ptr): this {
		return new TIntSeq(inner) as this;
	}

	/**
	 * Builds a TIntSeq from an array of temporal integers (typically instants).
	 *
	 * @param instants   Ordered array of TInt values.
	 * @param lowerInc   Whether the lower bound is inclusive (default `true`).
	 * @param upperInc   Whether the upper bound is inclusive (default `true`).
	 * @param normalize  Merge redundant instants (default `true`).
	 * MEOS: tsequence_make (Stepwise interpolation)
	 */
	static fromInstants(
		instants: TInt[],
		lowerInc = true,
		upperInc = true,
		normalize = true,
	): TIntSeq {
		const ptr = withPtrArray(
			instants.map(i => i.inner),
			(arr, count) => tsequence_make(arr, count, lowerInc, upperInc, 2 /* Stepwise */, normalize),
		);
		return new TIntSeq(ptr);
	}
}
