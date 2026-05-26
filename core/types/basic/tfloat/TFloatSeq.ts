import type { Ptr } from '../../../functions/functions.generated';
import { tsequence_make } from '../../../functions/functions.generated';
import { TInterpolation } from '../../temporal/Temporal';
import { withPtrArray } from '../../../functions/ptr_array';
import { TFloat } from './TFloat';

/**
 * Temporal float — Sequence subtype.
 *
 * A sequence of (value, timestamp) pairs with linear or stepwise interpolation.
 * Wraps a MEOS TFloatSeq pointer.
 *
 * @example
 * ```ts
 * const i1 = TFloatInst.fromValue(1.0, 60_000_000);
 * const i2 = TFloatInst.fromValue(5.0, 120_000_000);
 * const seq = TFloatSeq.fromInstants([i1, i2]); // linear by default
 * ```
 */
export class TFloatSeq extends TFloat {
	protected _fromInner(inner: Ptr): this {
		return new TFloatSeq(inner) as this;
	}

	/**
	 * Builds a TFloatSeq from an array of temporal floats (typically instants).
	 *
	 * @param instants   Ordered array of TFloat values.
	 * @param interp     Interpolation mode (default `Linear`).
	 * @param lowerInc   Whether the lower bound is inclusive (default `true`).
	 * @param upperInc   Whether the upper bound is inclusive (default `true`).
	 * @param normalize  Merge redundant instants (default `true`).
	 * MEOS: tsequence_make
	 */
	static fromInstants(
		instants: TFloat[],
		interp: TInterpolation.Linear | TInterpolation.Stepwise = TInterpolation.Linear,
		lowerInc = true,
		upperInc = true,
		normalize = true,
	): TFloatSeq {
		const interpVal = interp === TInterpolation.Linear ? 3 : 2;
		const ptr = withPtrArray(
			instants.map(i => i.inner),
			(arr, count) => tsequence_make(arr, count, lowerInc, upperInc, interpVal, normalize),
		);
		return new TFloatSeq(ptr);
	}
}
