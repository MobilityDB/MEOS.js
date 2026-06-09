import type { Ptr } from '../../functions/functions.generated.js';
import { temporal_subtype } from '../../functions/functions.generated.js';
import { TBoolInst } from '../basic/tbool/TBoolInst.js';
import { TBoolSeq } from '../basic/tbool/TBoolSeq.js';
import { TBoolSeqSet } from '../basic/tbool/TBoolSeqSet.js';
import { TIntInst } from '../basic/tint/TIntInst.js';
import { TIntSeq } from '../basic/tint/TIntSeq.js';
import { TIntSeqSet } from '../basic/tint/TIntSeqSet.js';
import { TFloatInst } from '../basic/tfloat/TFloatInst.js';
import { TFloatSeq } from '../basic/tfloat/TFloatSeq.js';
import { TFloatSeqSet } from '../basic/tfloat/TFloatSeqSet.js';
import { TTextInst } from '../basic/ttext/TTextInst.js';
import { TTextSeq } from '../basic/ttext/TTextSeq.js';
import { TTextSeqSet } from '../basic/ttext/TTextSeqSet.js';
import { TGeomPointInst } from '../basic/tgeompoint/TGeomPointInst.js';
import { TGeomPointSeq } from '../basic/tgeompoint/TGeomPointSeq.js';
import { TGeomPointSeqSet } from '../basic/tgeompoint/TGeomPointSeqSet.js';
import { TGeogPointInst } from '../basic/tgeogpoint/TGeogPointInst.js';
import { TGeogPointSeq } from '../basic/tgeogpoint/TGeogPointSeq.js';
import { TGeogPointSeqSet } from '../basic/tgeogpoint/TGeogPointSeqSet.js';

export type TBoolSubtype = TBoolInst | TBoolSeq | TBoolSeqSet;
export type TIntSubtype = TIntInst | TIntSeq | TIntSeqSet;
export type TFloatSubtype = TFloatInst | TFloatSeq | TFloatSeqSet;
export type TTextSubtype = TTextInst | TTextSeq | TTextSeqSet;
export type TGeomPointSubtype = TGeomPointInst | TGeomPointSeq | TGeomPointSeqSet;
export type TGeogPointSubtype = TGeogPointInst | TGeogPointSeq | TGeogPointSeqSet;

function sub(ptr: Ptr): string {
	return temporal_subtype(ptr);
}

/** Routes a raw TBool pointer to TBoolInst | TBoolSeq | TBoolSeqSet. */
export function createTBool(ptr: Ptr): TBoolSubtype {
	const s = sub(ptr);
	if (s === 'Instant') return new TBoolInst(ptr);
	if (s === 'Sequence') return new TBoolSeq(ptr);
	return new TBoolSeqSet(ptr);
}

/** Routes a raw TInt pointer to TIntInst | TIntSeq | TIntSeqSet. */
export function createTInt(ptr: Ptr): TIntSubtype {
	const s = sub(ptr);
	if (s === 'Instant') return new TIntInst(ptr);
	if (s === 'Sequence') return new TIntSeq(ptr);
	return new TIntSeqSet(ptr);
}

/** Routes a raw TFloat pointer to TFloatInst | TFloatSeq | TFloatSeqSet. */
export function createTFloat(ptr: Ptr): TFloatSubtype {
	const s = sub(ptr);
	if (s === 'Instant') return new TFloatInst(ptr);
	if (s === 'Sequence') return new TFloatSeq(ptr);
	return new TFloatSeqSet(ptr);
}

/** Routes a raw TText pointer to TTextInst | TTextSeq | TTextSeqSet. */
export function createTText(ptr: Ptr): TTextSubtype {
	const s = sub(ptr);
	if (s === 'Instant') return new TTextInst(ptr);
	if (s === 'Sequence') return new TTextSeq(ptr);
	return new TTextSeqSet(ptr);
}

/** Routes a raw TGeomPoint pointer to TGeomPointInst | TGeomPointSeq | TGeomPointSeqSet. */
export function createTGeomPoint(ptr: Ptr): TGeomPointSubtype {
	const s = sub(ptr);
	if (s === 'Instant') return new TGeomPointInst(ptr);
	if (s === 'Sequence') return new TGeomPointSeq(ptr);
	return new TGeomPointSeqSet(ptr);
}

/** Routes a raw TGeogPoint pointer to TGeogPointInst | TGeogPointSeq | TGeogPointSeqSet. */
export function createTGeogPoint(ptr: Ptr): TGeogPointSubtype {
	const s = sub(ptr);
	if (s === 'Instant') return new TGeogPointInst(ptr);
	if (s === 'Sequence') return new TGeogPointSeq(ptr);
	return new TGeogPointSeqSet(ptr);
}
