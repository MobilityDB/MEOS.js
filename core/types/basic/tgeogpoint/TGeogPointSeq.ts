import type { Ptr } from '../../../functions/functions.generated';
import { tsequence_make } from '../../../functions/functions.generated';
import { withPtrArray } from '../../../functions/ptr_array';
import { TGeogPoint } from './TGeogPoint';

/**
 * Temporal geography point - Sequence subtype.
 *
 * An ordered list of (geography, timestamp) pairs with linear interpolation.
 * Distances are computed geodetically (on the spheroid).
 *
 * @example
 * ```ts
 * const i1 = TGeogPointInst.fromValue('POINT(2.35 48.85)', 0);
 * const i2 = TGeogPointInst.fromValue('POINT(2.29 48.86)', 60_000_000);
 * const seq = TGeogPointSeq.fromInstants([i1, i2]);
 * console.log(seq.length()); // geodetic distance in metres
 * ```
 */
export class TGeogPointSeq extends TGeogPoint {
	protected _fromInner(inner: Ptr): this {
		return new TGeogPointSeq(inner) as this;
	}

	/**
	 * Builds a TGeogPointSeq from an array of TGeogPoint instants.
	 *
	 * @param instants   Ordered array of TGeogPoint values (must be instants).
	 * @param lowerInc   Whether the lower bound is inclusive (default `true`).
	 * @param upperInc   Whether the upper bound is inclusive (default `true`).
	 * @param interp     Interpolation: 2=Stepwise, 3=Linear (default `3`).
	 * @param normalize  Merge redundant instants (default `true`).
	 * MEOS: tsequence_make
	 */
	static fromInstants(
		instants: TGeogPoint[],
		lowerInc = true,
		upperInc = true,
		interp = 3,
		normalize = true
	): TGeogPointSeq {
		const ptr = withPtrArray(
			instants.map(i => i.inner),
			(arr, count) => tsequence_make(arr, count, lowerInc, upperInc, interp, normalize)
		);
		return new TGeogPointSeq(ptr);
	}
}
