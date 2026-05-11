import type { Ptr } from '../../functions/functions.generated';
import { tsequenceset_make } from '../../functions/functions.generated';
import { withPtrArray } from '../../functions/ptr_array';
import { TBool } from './TBool';

/**
 * Temporal boolean — SequenceSet subtype.
 *
 * A set of disjoint stepwise sequences. Wraps a MEOS TBoolSeqSet pointer.
 *
 * @example
 * ```ts
 * const s1 = TBoolSeq.fromInstants([i1, i2]);
 * const s2 = TBoolSeq.fromInstants([i3, i4]);
 * const ss = TBoolSeqSet.fromSequences([s1, s2]);
 * ```
 */
export class TBoolSeqSet extends TBool {
	protected _fromInner(inner: Ptr): this {
		return new TBoolSeqSet(inner) as this;
	}

	/**
	 * Builds a TBoolSeqSet from an array of sequences.
	 *
	 * @param sequences  Ordered, disjoint array of TBool sequences.
	 * @param normalize  Merge adjacent sequences with equal values (default `true`).
	 * MEOS: tsequenceset_make
	 */
	static fromSequences(sequences: TBool[], normalize = true): TBoolSeqSet {
		const ptr = withPtrArray(
			sequences.map(s => s.inner),
			(arr, count) => tsequenceset_make(arr, count, normalize),
		);
		return new TBoolSeqSet(ptr);
	}
}
