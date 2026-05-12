import type { Ptr } from '../../../functions/functions.generated';
import { tsequenceset_make } from '../../../functions/functions.generated';
import { withPtrArray } from '../../../functions/ptr_array';
import { TInt } from './TInt';

/**
 * Temporal integer — SequenceSet subtype.
 *
 * A set of disjoint stepwise sequences. Wraps a MEOS TIntSeqSet pointer.
 *
 * @example
 * ```ts
 * const s1 = TIntSeq.fromInstants([i1, i2]);
 * const s2 = TIntSeq.fromInstants([i3, i4]);
 * const ss = TIntSeqSet.fromSequences([s1, s2]);
 * ```
 */
export class TIntSeqSet extends TInt {
	protected _fromInner(inner: Ptr): this {
		return new TIntSeqSet(inner) as this;
	}

	/**
	 * Builds a TIntSeqSet from an array of sequences.
	 *
	 * @param sequences  Ordered, disjoint array of TInt sequences.
	 * @param normalize  Merge adjacent sequences with equal values (default `true`).
	 * MEOS: tsequenceset_make
	 */
	static fromSequences(sequences: TInt[], normalize = true): TIntSeqSet {
		const ptr = withPtrArray(
			sequences.map(s => s.inner),
			(arr, count) => tsequenceset_make(arr, count, normalize),
		);
		return new TIntSeqSet(ptr);
	}
}
