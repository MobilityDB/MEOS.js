import type { Ptr } from '../../../functions/functions.generated';
import { tsequence_make } from '../../../functions/functions.generated';
import { withPtrArray } from '../../../functions/ptr_array';
import { TGeomPoint } from './TGeomPoint';

/**
 * Temporal geometry point - Sequence subtype.
 *
 * An ordered list of (geometry, timestamp) pairs with linear interpolation
 * (the position is interpolated between instants).
 *
 * @example
 * ```ts
 * const i1 = TGeomPointInst.fromValue('POINT(0 0)', 0);
 * const i2 = TGeomPointInst.fromValue('POINT(1 1)', 60_000_000);
 * const seq = TGeomPointSeq.fromInstants([i1, i2]);
 * console.log(seq.length()); // ~157249.59...
 * ```
 */
export class TGeomPointSeq extends TGeomPoint {
	protected _fromInner(inner: Ptr): this {
		return new TGeomPointSeq(inner) as this;
	}

	/**
	 * Builds a TGeomPointSeq from an array of TGeomPoint instants.
	 *
	 * @param instants   Ordered array of TGeomPoint values (must be instants).
	 * @param lowerInc   Whether the lower bound is inclusive (default `true`).
	 * @param upperInc   Whether the upper bound is inclusive (default `true`).
	 * @param interp     Interpolation: 2=Stepwise, 3=Linear (default `3`).
	 * @param normalize  Merge redundant instants (default `true`).
	 * MEOS: tsequence_make
	 */
	static fromInstants(
		instants: TGeomPoint[],
		lowerInc = true,
		upperInc = true,
		interp = 3,
		normalize = true
	): TGeomPointSeq {
		const ptr = withPtrArray(
			instants.map(i => i.inner),
			(arr, count) => tsequence_make(arr, count, lowerInc, upperInc, interp, normalize)
		);
		return new TGeomPointSeq(ptr);
	}
}
