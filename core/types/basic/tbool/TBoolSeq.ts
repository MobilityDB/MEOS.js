import type { Ptr } from '../../../functions/functions.generated.js';
import { tsequence_make } from '../../../functions/functions.generated.js';
import { withPtrArray } from '../../../functions/ptr_array.js';
import { TBool } from './TBool.js';

/**
 * Temporal boolean — Sequence subtype.
 *
 * A stepwise-interpolated sequence of (value, timestamp) pairs with inclusive/
 * exclusive bounds. Wraps a MEOS TBoolSeq pointer.
 *
 * @example
 * ```ts
 * const i1 = TBoolInst.fromValue(true,  60_000_000);
 * const i2 = TBoolInst.fromValue(false, 120_000_000);
 * const seq = TBoolSeq.fromInstants([i1, i2]);
 * console.log(seq.toString()); // [t@2000-01-01 00:01:00+00, f@2000-01-01 00:02:00+00]
 * ```
 */
export class TBoolSeq extends TBool {
	protected _fromInner(inner: Ptr): this {
		return new TBoolSeq(inner) as this;
	}

	/**
	 * Builds a TBoolSeq from an array of temporal booleans (typically instants).
	 *
	 * @param instants   Ordered array of TBool values (must be instants).
	 * @param lowerInc   Whether the lower bound is inclusive (default `true`).
	 * @param upperInc   Whether the upper bound is inclusive (default `true`).
	 * @param normalize  Merge redundant instants (default `true`).
	 * MEOS: tsequence_make (Stepwise interpolation)
	 */
	static fromInstants(
		instants: TBool[],
		lowerInc = true,
		upperInc = true,
		normalize = true,
	): TBoolSeq {
		const ptr = withPtrArray(
			instants.map(i => i.inner),
			(arr, count) => tsequence_make(arr, count, lowerInc, upperInc, 2 /* Stepwise */, normalize),
		);
		return new TBoolSeq(ptr);
	}
}
