import type { Ptr } from '../../functions/functions.generated';
import { temporal_subtype } from '../../functions/functions.generated';
import { TBoolInst } from '../base/TBoolInst';
import { TBoolSeq } from '../base/TBoolSeq';
import { TBoolSeqSet } from '../base/TBoolSeqSet';
import { TIntInst } from '../base/TIntInst';
import { TIntSeq } from '../base/TIntSeq';
import { TIntSeqSet } from '../base/TIntSeqSet';
import { TFloatInst } from '../base/TFloatInst';
import { TFloatSeq } from '../base/TFloatSeq';
import { TFloatSeqSet } from '../base/TFloatSeqSet';

export type TBoolSubtype = TBoolInst | TBoolSeq | TBoolSeqSet;
export type TIntSubtype  = TIntInst  | TIntSeq  | TIntSeqSet;
export type TFloatSubtype = TFloatInst | TFloatSeq | TFloatSeqSet;

function sub(ptr: Ptr): string {
	return temporal_subtype(ptr);
}

/** Routes a raw TBool pointer to TBoolInst | TBoolSeq | TBoolSeqSet. */
export function createTBool(ptr: Ptr): TBoolSubtype {
	const s = sub(ptr);
	if (s === 'Instant')  return new TBoolInst(ptr);
	if (s === 'Sequence') return new TBoolSeq(ptr);
	return new TBoolSeqSet(ptr);
}

/** Routes a raw TInt pointer to TIntInst | TIntSeq | TIntSeqSet. */
export function createTInt(ptr: Ptr): TIntSubtype {
	const s = sub(ptr);
	if (s === 'Instant')  return new TIntInst(ptr);
	if (s === 'Sequence') return new TIntSeq(ptr);
	return new TIntSeqSet(ptr);
}

/** Routes a raw TFloat pointer to TFloatInst | TFloatSeq | TFloatSeqSet. */
export function createTFloat(ptr: Ptr): TFloatSubtype {
	const s = sub(ptr);
	if (s === 'Instant')  return new TFloatInst(ptr);
	if (s === 'Sequence') return new TFloatSeq(ptr);
	return new TFloatSeqSet(ptr);
}
