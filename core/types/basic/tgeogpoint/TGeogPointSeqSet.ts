import type { Ptr } from '../../../functions/functions.generated';
import { tsequenceset_make } from '../../../functions/functions.generated';
import { withPtrArray } from '../../../functions/ptr_array';
import { TGeogPoint } from './TGeogPoint';

/**
 * Temporal geography point - SequenceSet subtype.
 *
 * A set of disjoint TGeogPointSeq sequences.
 *
 * @example
 * ```ts
 * const s1 = TGeogPointSeq.fromInstants([i1, i2]);
 * const s2 = TGeogPointSeq.fromInstants([i3, i4]);
 * const ss = TGeogPointSeqSet.fromSequences([s1, s2]);
 * ```
 */
export class TGeogPointSeqSet extends TGeogPoint {
	protected _fromInner(inner: Ptr): this {
		return new TGeogPointSeqSet(inner) as this;
	}

	/**
	 * Builds a TGeogPointSeqSet from an array of TGeogPoint sequences.
	 *
	 * @param sequences  Ordered, disjoint array of TGeogPoint sequences.
	 * @param normalize  Merge adjacent sequences if possible (default `true`).
	 * MEOS: tsequenceset_make
	 */
	static fromSequences(sequences: TGeogPoint[], normalize = true): TGeogPointSeqSet {
		const ptr = withPtrArray(
			sequences.map(s => s.inner),
			(arr, count) => tsequenceset_make(arr, count, normalize)
		);
		return new TGeogPointSeqSet(ptr);
	}
}
