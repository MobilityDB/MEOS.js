import type { Ptr } from '../../../functions/functions.generated';
import { tsequenceset_make } from '../../../functions/functions.generated';
import { withPtrArray } from '../../../functions/ptr_array';
import { TGeomPoint } from './TGeomPoint';

/**
 * Temporal geometry point - SequenceSet subtype.
 *
 * A set of disjoint TGeomPointSeq sequences.
 *
 * @example
 * ```ts
 * const s1 = TGeomPointSeq.fromInstants([i1, i2]);
 * const s2 = TGeomPointSeq.fromInstants([i3, i4]);
 * const ss = TGeomPointSeqSet.fromSequences([s1, s2]);
 * ```
 */
export class TGeomPointSeqSet extends TGeomPoint {
	protected _fromInner(inner: Ptr): this {
		return new TGeomPointSeqSet(inner) as this;
	}

	/**
	 * Builds a TGeomPointSeqSet from an array of TGeomPoint sequences.
	 *
	 * @param sequences  Ordered, disjoint array of TGeomPoint sequences.
	 * @param normalize  Merge adjacent sequences if possible (default `true`).
	 * MEOS: tsequenceset_make
	 */
	static fromSequences(sequences: TGeomPoint[], normalize = true): TGeomPointSeqSet {
		const ptr = withPtrArray(
			sequences.map(s => s.inner),
			(arr, count) => tsequenceset_make(arr, count, normalize)
		);
		return new TGeomPointSeqSet(ptr);
	}
}
