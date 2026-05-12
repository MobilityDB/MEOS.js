import type { Ptr } from '../../../functions/functions.generated';
import { tsequenceset_make } from '../../../functions/functions.generated';
import { withPtrArray } from '../../../functions/ptr_array';
import { TText } from './TText';

/**
 * Temporal text — SequenceSet subtype.
 *
 * A set of disjoint text sequences. Wraps a MEOS TTextSeqSet pointer.
 *
 * @example
 * ```ts
 * const s1 = TTextSeq.fromInstants([i1, i2]);
 * const s2 = TTextSeq.fromInstants([i3, i4]);
 * const ss = TTextSeqSet.fromSequences([s1, s2]);
 * ```
 */
export class TTextSeqSet extends TText {
	protected _fromInner(inner: Ptr): this {
		return new TTextSeqSet(inner) as this;
	}

	/**
	 * Builds a TTextSeqSet from an array of sequences.
	 *
	 * @param sequences  Ordered, disjoint array of TText sequences.
	 * @param normalize  Merge adjacent sequences with equal end/start values (default `true`).
	 * MEOS: tsequenceset_make
	 */
	static fromSequences(sequences: TText[], normalize = true): TTextSeqSet {
		const ptr = withPtrArray(
			sequences.map(s => s.inner),
			(arr, count) => tsequenceset_make(arr, count, normalize),
		);
		return new TTextSeqSet(ptr);
	}
}
