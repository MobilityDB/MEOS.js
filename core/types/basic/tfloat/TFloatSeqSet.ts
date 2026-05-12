import type { Ptr } from '../../../functions/functions.generated';
import { tsequenceset_make } from '../../../functions/functions.generated';
import { withPtrArray } from '../../../functions/ptr_array';
import { TFloat } from './TFloat';

/**
 * Temporal float — SequenceSet subtype.
 *
 * A set of disjoint float sequences. Wraps a MEOS TFloatSeqSet pointer.
 *
 * @example
 * ```ts
 * const s1 = TFloatSeq.fromInstants([i1, i2]);
 * const s2 = TFloatSeq.fromInstants([i3, i4]);
 * const ss = TFloatSeqSet.fromSequences([s1, s2]);
 * ```
 */
export class TFloatSeqSet extends TFloat {
	protected _fromInner(inner: Ptr): this {
		return new TFloatSeqSet(inner) as this;
	}

	/**
	 * Builds a TFloatSeqSet from an array of sequences.
	 *
	 * @param sequences  Ordered, disjoint array of TFloat sequences.
	 * @param normalize  Merge adjacent sequences with equal end/start values (default `true`).
	 * MEOS: tsequenceset_make
	 */
	static fromSequences(sequences: TFloat[], normalize = true): TFloatSeqSet {
		const ptr = withPtrArray(
			sequences.map(s => s.inner),
			(arr, count) => tsequenceset_make(arr, count, normalize),
		);
		return new TFloatSeqSet(ptr);
	}
}
