/* AUTO-GENERATED - DO NOT EDIT. Run: npm run generate */
import { getModule } from '../runtime/meos.js';
import * as F from '../functions/functions.generated.js';
import type { Ptr, TimestampTz, DateADT, H3Index, Quadbin, S2CellId } from '../functions/functions.generated.js';
import { readWkb } from '../functions/wkb.js';

export type { Ptr, TimestampTz, DateADT, H3Index, Quadbin, S2CellId };

/** A view of `size` bytes of the WASM heap at `ptr`, taken after any growth. */
function _view(ptr: Ptr, size: number): DataView {
	const heap = getModule().HEAPU8;
	return new DataView(heap.buffer, heap.byteOffset + ptr, size);
}

/** The byte at `ptr + offset`. */
function _byte(ptr: Ptr, offset: number): number {
	return getModule().HEAPU8[ptr + offset];
}

/** `size` zeroed bytes of the WASM heap, freed with _free. */
function _alloc(size: number): Ptr {
	const mod = getModule();
	return mod.allocate(new Uint8Array(size), mod.ALLOC_NORMAL) as Ptr;
}

/** Frees memory MEOS or _alloc allocated. */
function _free(ptr: Ptr): void {
	F.meos_free(ptr);
}

/** A C array of the given pointers (8 bytes each in wasm64), as withPtrArray builds one; freed with _free. */
function _ptrArray(ptrs: Ptr[]): Ptr {
	const bytes = new Uint8Array(Math.max(ptrs.length, 1) * 8);
	const view = new DataView(bytes.buffer);
	ptrs.forEach((p, i) => view.setBigUint64(i * 8, BigInt(p), true));
	const mod = getModule();
	return mod.allocate(bytes, mod.ALLOC_NORMAL) as Ptr;
}

/** The caller's bytes copied into the heap, freed with _free. */
function _bytes(bytes: Uint8Array): Ptr {
	const out = _alloc(Math.max(bytes.length, 1));
	getModule().HEAPU8.set(bytes, out);
	return out;
}

/** A copy of `size` bytes at `ptr` in a buffer of its own, freed with _free. */
function _copy(ptr: Ptr, size: number): Ptr {
	const out = _alloc(size);
	const heap = getModule().HEAPU8;
	heap.copyWithin(out, ptr, ptr + size);
	return out;
}

/** One buffer holding each struct of `size` bytes at `ptrs`, in order; freed with _free. */
function _structArray(ptrs: Ptr[], size: number): Ptr {
	const out = _alloc(Math.max(ptrs.length, 1) * size);
	const heap = getModule().HEAPU8;
	ptrs.forEach((p, i) => heap.copyWithin(out + i * size, p, p + size));
	return out;
}

/**
 * A handle on a value MEOS allocated. The pointer is what every generated
 * method forwards to the C API; `free()` (or `using`) releases it.
 */
export abstract class MeosObject {
	/** Holds the pointer, as MEOSObject of MEOS.NET does. */
	constructor(readonly ptr: Ptr) {}

	/** Releases the MEOS value; the object must not be used afterwards. */
	free(): void {
		F.meos_free(this.ptr);
	}

	[Symbol.dispose](): void {
		this.free();
	}
}

/** The MEOS BandStats struct, carried as a value. */
export interface BandStats {
	count: number;
	sum: number;
	mean: number;
	stddev: number;
	min: number;
	max: number;
}

function _readBandStats(ptr: Ptr): BandStats {
	const _v = _view(ptr, 48);
	return {
		count: _v.getUint32(0, true),
		sum: _v.getFloat64(8, true),
		mean: _v.getFloat64(16, true),
		stddev: _v.getFloat64(24, true),
		min: _v.getFloat64(32, true),
		max: _v.getFloat64(40, true),
	};
}

function _putBandStats(value: BandStats): Ptr {
	const ptr = _alloc(48);
	const _v = _view(ptr, 48);
	_v.setUint32(0, value.count, true);
	_v.setFloat64(8, value.sum, true);
	_v.setFloat64(16, value.mean, true);
	_v.setFloat64(24, value.stddev, true);
	_v.setFloat64(32, value.min, true);
	_v.setFloat64(40, value.max, true);
	return ptr;
}

function _takeBandStats(ptr: Ptr): BandStats | null {
	if (!ptr) return null;
	try {
		return _readBandStats(ptr);
	} finally {
		_free(ptr);
	}
}

/** The MEOS BOX3D struct, carried as a value. */
export interface BOX3D {
	xmin: number;
	ymin: number;
	zmin: number;
	xmax: number;
	ymax: number;
	zmax: number;
	srid: number;
}

function _readBOX3D(ptr: Ptr): BOX3D {
	const _v = _view(ptr, 56);
	return {
		xmin: _v.getFloat64(0, true),
		ymin: _v.getFloat64(8, true),
		zmin: _v.getFloat64(16, true),
		xmax: _v.getFloat64(24, true),
		ymax: _v.getFloat64(32, true),
		zmax: _v.getFloat64(40, true),
		srid: _v.getInt32(48, true),
	};
}

function _putBOX3D(value: BOX3D): Ptr {
	const ptr = _alloc(56);
	const _v = _view(ptr, 56);
	_v.setFloat64(0, value.xmin, true);
	_v.setFloat64(8, value.ymin, true);
	_v.setFloat64(16, value.zmin, true);
	_v.setFloat64(24, value.xmax, true);
	_v.setFloat64(32, value.ymax, true);
	_v.setFloat64(40, value.zmax, true);
	_v.setInt32(48, value.srid, true);
	return ptr;
}

function _takeBOX3D(ptr: Ptr): BOX3D | null {
	if (!ptr) return null;
	try {
		return _readBOX3D(ptr);
	} finally {
		_free(ptr);
	}
}

/** The MEOS Interval struct, carried as a value. */
export interface Interval {
	time: number;
	day: number;
	month: number;
}

function _readInterval(ptr: Ptr): Interval {
	const _v = _view(ptr, 16);
	return {
		time: Number(_v.getBigInt64(0, true)),
		day: _v.getInt32(8, true),
		month: _v.getInt32(12, true),
	};
}

function _putInterval(value: Interval): Ptr {
	const ptr = _alloc(16);
	const _v = _view(ptr, 16);
	_v.setBigInt64(0, BigInt(value.time), true);
	_v.setInt32(8, value.day, true);
	_v.setInt32(12, value.month, true);
	return ptr;
}

function _takeInterval(ptr: Ptr): Interval | null {
	if (!ptr) return null;
	try {
		return _readInterval(ptr);
	} finally {
		_free(ptr);
	}
}

/** The MEOS Match struct, carried as a value. */
export interface Match {
	i: number;
	j: number;
}

function _readMatch(ptr: Ptr): Match {
	const _v = _view(ptr, 8);
	return {
		i: _v.getInt32(0, true),
		j: _v.getInt32(4, true),
	};
}

function _putMatch(value: Match): Ptr {
	const ptr = _alloc(8);
	const _v = _view(ptr, 8);
	_v.setInt32(0, value.i, true);
	_v.setInt32(4, value.j, true);
	return ptr;
}

function _takeMatch(ptr: Ptr): Match | null {
	if (!ptr) return null;
	try {
		return _readMatch(ptr);
	} finally {
		_free(ptr);
	}
}

/** The MEOS ValueCount struct, carried as a value. */
export interface ValueCount {
	value: number;
	count: number;
	percent: number;
}

function _readValueCount(ptr: Ptr): ValueCount {
	const _v = _view(ptr, 24);
	return {
		value: _v.getFloat64(0, true),
		count: _v.getUint32(8, true),
		percent: _v.getFloat64(16, true),
	};
}

function _putValueCount(value: ValueCount): Ptr {
	const ptr = _alloc(24);
	const _v = _view(ptr, 24);
	_v.setFloat64(0, value.value, true);
	_v.setUint32(8, value.count, true);
	_v.setFloat64(16, value.percent, true);
	return ptr;
}

function _takeValueCount(ptr: Ptr): ValueCount | null {
	if (!ptr) return null;
	try {
		return _readValueCount(ptr);
	} finally {
		_free(ptr);
	}
}

/**
 * The Collection class of the MEOS object model.
 */
export class Collection extends MeosObject {
}

/**
 * Unordered set of base values.
 */
export class Set extends Collection {

	/** MEOS: set_as_wkb */
	asWKB(variant: number): Uint8Array {
		return readWkb(_sizeOut => F.set_as_wkb(this.ptr, variant, _sizeOut));
	}

	/** MEOS: set_cmp */
	cmp(s2: Set): number {
		return F.set_cmp(this.ptr, s2.ptr);
	}

	/** MEOS: contained_set_set */
	contained(s2: Set): boolean {
		return F.contained_set_set(this.ptr, s2.ptr);
	}

	/** MEOS: contains_set_set */
	contains(s2: Set): boolean {
		return F.contains_set_set(this.ptr, s2.ptr);
	}

	/** MEOS: set_copy */
	copy(): Set {
		return wrapSet(F.set_copy(this.ptr)) as Set;
	}

	/** MEOS: set_eq */
	eq(s2: Set): boolean {
		return F.set_eq(this.ptr, s2.ptr);
	}

	/** MEOS: set_ge */
	ge(s2: Set): boolean {
		return F.set_ge(this.ptr, s2.ptr);
	}

	/** MEOS: set_gt */
	gt(s2: Set): boolean {
		return F.set_gt(this.ptr, s2.ptr);
	}

	/** MEOS: set_hash */
	hash(): number {
		return F.set_hash(this.ptr);
	}

	/** MEOS: set_hash_extended */
	hashExtended(seed: number): number {
		return F.set_hash_extended(this.ptr, seed);
	}

	/** MEOS: intersection_set_set */
	intersection(s2: Set): Set | null {
		return wrapSetOrNull(F.intersection_set_set(this.ptr, s2.ptr)) as Set | null;
	}

	/** MEOS: set_le */
	le(s2: Set): boolean {
		return F.set_le(this.ptr, s2.ptr);
	}

	/** MEOS: left_set_set */
	left(s2: Set): boolean {
		return F.left_set_set(this.ptr, s2.ptr);
	}

	/** MEOS: set_lt */
	lt(s2: Set): boolean {
		return F.set_lt(this.ptr, s2.ptr);
	}

	/** MEOS: set_mem_size */
	memSize(): number {
		return F.set_mem_size(this.ptr);
	}

	/** MEOS: minus_set_set */
	minus(s2: Set): Set | null {
		return wrapSetOrNull(F.minus_set_set(this.ptr, s2.ptr)) as Set | null;
	}

	/** MEOS: set_ne */
	ne(s2: Set): boolean {
		return F.set_ne(this.ptr, s2.ptr);
	}

	/** MEOS: set_num_values */
	numValues(): number {
		return F.set_num_values(this.ptr);
	}

	/** MEOS: overlaps_set_set */
	overlaps(s2: Set): boolean {
		return F.overlaps_set_set(this.ptr, s2.ptr);
	}

	/** MEOS: overleft_set_set */
	overleft(s2: Set): boolean {
		return F.overleft_set_set(this.ptr, s2.ptr);
	}

	/** MEOS: overright_set_set */
	overright(s2: Set): boolean {
		return F.overright_set_set(this.ptr, s2.ptr);
	}

	/** MEOS: right_set_set */
	right(s2: Set): boolean {
		return F.right_set_set(this.ptr, s2.ptr);
	}

	/** MEOS: set_round */
	round(maxdd: number): Set {
		return wrapSet(F.set_round(this.ptr, maxdd)) as Set;
	}

	/** MEOS: set_sortkey */
	sortkey(): Uint8Array {
		return readWkb(_sizeOut => F.set_sortkey(this.ptr, _sizeOut));
	}

	/** MEOS: set_spans */
	spans(): Span[] {
		const _count = _alloc(4);
		try {
			const _arr = F.set_spans(this.ptr, _count);
			if (!_arr) return [];
			try {
				const _n = _view(_count, 4).getInt32(0, true);
				const _v = _view(_arr, _n * 24);
				const _out: Span[] = [];
				for (let _i = 0; _i < _n; _i++) _out.push(wrapSpan(_copy(_arr + _i * 24, 24)) as Span);
				return _out;
			} finally {
				_free(_arr);
			}
		} finally {
			_free(_count);
		}
	}

	/** MEOS: set_split_each_n_spans */
	splitEachNSpans(elems_per_span: number): Span[] {
		const _count = _alloc(4);
		try {
			const _arr = F.set_split_each_n_spans(this.ptr, elems_per_span, _count);
			if (!_arr) return [];
			try {
				const _n = _view(_count, 4).getInt32(0, true);
				const _v = _view(_arr, _n * 24);
				const _out: Span[] = [];
				for (let _i = 0; _i < _n; _i++) _out.push(wrapSpan(_copy(_arr + _i * 24, 24)) as Span);
				return _out;
			} finally {
				_free(_arr);
			}
		} finally {
			_free(_count);
		}
	}

	/** MEOS: set_split_n_spans */
	splitNSpans(span_count: number): Span[] {
		const _count = _alloc(4);
		try {
			const _arr = F.set_split_n_spans(this.ptr, span_count, _count);
			if (!_arr) return [];
			try {
				const _n = _view(_count, 4).getInt32(0, true);
				const _v = _view(_arr, _n * 24);
				const _out: Span[] = [];
				for (let _i = 0; _i < _n; _i++) _out.push(wrapSpan(_copy(_arr + _i * 24, 24)) as Span);
				return _out;
			} finally {
				_free(_arr);
			}
		} finally {
			_free(_count);
		}
	}

	/** MEOS: set_to_span */
	toSpan(): Span {
		return wrapSpan(F.set_to_span(this.ptr)) as Span;
	}

	/** MEOS: set_to_spanset */
	toSpanset(): SpanSet {
		return wrapSpanSet(F.set_to_spanset(this.ptr)) as SpanSet;
	}

	/** MEOS: set_to_tbox */
	toTbox(): TBox {
		return wrapTBox(F.set_to_tbox(this.ptr)) as TBox;
	}

	/** MEOS: union_set_set */
	union(s2: Set): Set | null {
		return wrapSetOrNull(F.union_set_set(this.ptr, s2.ptr)) as Set | null;
	}

	/** MEOS: set_from_hexwkb */
	static fromHexWKB(hexwkb: string): Set {
		return wrapSet(F.set_from_hexwkb(hexwkb)) as Set;
	}

	/** MEOS: set_from_wkb */
	static fromWKB(wkb: Uint8Array): Set {
		const _wkb = _bytes(wkb);
		try {
			return wrapSet(F.set_from_wkb(_wkb, wkb.length)) as Set;
		} finally {
			_free(_wkb);
		}
	}
}

/**
 * The BigIntSet class of the MEOS object model.
 */
export class BigIntSet extends Set {

	/** The text MEOS writes this value as (MEOS: bigintset_out). */
	override toString(): string {
		return this.out();
	}

	/** MEOS: contains_set_bigint */
	private _contains_set_bigint(i: number): boolean {
		return F.contains_set_bigint(this.ptr, i);
	}

	/** MEOS: distance_bigintset_bigintset */
	private _distance_bigintset_bigintset(s2: BigIntSet): number {
		return F.distance_bigintset_bigintset(this.ptr, s2.ptr);
	}

	/** MEOS: distance_set_bigint */
	private _distance_set_bigint(i: number): number {
		return F.distance_set_bigint(this.ptr, i);
	}

	/** MEOS: intersection_set_bigint */
	private _intersection_set_bigint(i: number): Set | null {
		return wrapSetOrNull(F.intersection_set_bigint(this.ptr, i)) as Set | null;
	}

	/** MEOS: left_set_bigint */
	private _left_set_bigint(i: number): boolean {
		return F.left_set_bigint(this.ptr, i);
	}

	/** MEOS: minus_set_bigint */
	private _minus_set_bigint(i: number): Set | null {
		return wrapSetOrNull(F.minus_set_bigint(this.ptr, i)) as Set | null;
	}

	/** MEOS: overleft_set_bigint */
	private _overleft_set_bigint(i: number): boolean {
		return F.overleft_set_bigint(this.ptr, i);
	}

	/** MEOS: overright_set_bigint */
	private _overright_set_bigint(i: number): boolean {
		return F.overright_set_bigint(this.ptr, i);
	}

	/** MEOS: right_set_bigint */
	private _right_set_bigint(i: number): boolean {
		return F.right_set_bigint(this.ptr, i);
	}

	/** MEOS: union_set_bigint */
	private _union_set_bigint(i: number): Set | null {
		return wrapSetOrNull(F.union_set_bigint(this.ptr, i)) as Set | null;
	}

	/** MEOS: bigintset_out */
	asText(): string {
		return this.out();
	}

	/** MEOS: contained_rid_bigintset_tnpoint */
	containedRid(temp: TNpoint): boolean {
		return F.contained_rid_bigintset_tnpoint(this.ptr, temp.ptr);
	}

	/** MEOS: contains_set_bigint, chosen by the arguments' types */
	override contains(i: number | Set): boolean {
		if (typeof i === 'number') return this._contains_set_bigint(i as number);
		return super.contains(i as Set);
	}

	/** MEOS: contains_rid_bigintset_tnpoint */
	containsRid(temp: TNpoint): boolean {
		return F.contains_rid_bigintset_tnpoint(this.ptr, temp.ptr);
	}

	/** MEOS: distance_bigintset_bigintset, distance_set_bigint, chosen by the arguments' types */
	distance(s2: BigIntSet | number): number {
		if (s2 instanceof BigIntSet) return this._distance_bigintset_bigintset(s2 as BigIntSet);
		if (typeof s2 === 'number') return this._distance_set_bigint(s2 as number);
		throw new TypeError(`BigIntSet.distance: no overload takes these arguments`);
	}

	/** MEOS: bigintset_end_value */
	endValue(): number {
		return F.bigintset_end_value(this.ptr);
	}

	/** MEOS: intersection_set_bigint, chosen by the arguments' types */
	override intersection(i: number | Set): Set | null {
		if (typeof i === 'number') return this._intersection_set_bigint(i as number);
		return super.intersection(i as Set);
	}

	/** MEOS: left_set_bigint, chosen by the arguments' types */
	override left(i: number | Set): boolean {
		if (typeof i === 'number') return this._left_set_bigint(i as number);
		return super.left(i as Set);
	}

	/** MEOS: minus_set_bigint, chosen by the arguments' types */
	override minus(i: number | Set): Set | null {
		if (typeof i === 'number') return this._minus_set_bigint(i as number);
		return super.minus(i as Set);
	}

	/** MEOS: bigintset_out */
	out(): string {
		return F.bigintset_out(this.ptr);
	}

	/** MEOS: overlaps_rid_bigintset_tnpoint */
	overlapsRid(temp: TNpoint): boolean {
		return F.overlaps_rid_bigintset_tnpoint(this.ptr, temp.ptr);
	}

	/** MEOS: overleft_set_bigint, chosen by the arguments' types */
	override overleft(i: number | Set): boolean {
		if (typeof i === 'number') return this._overleft_set_bigint(i as number);
		return super.overleft(i as Set);
	}

	/** MEOS: overright_set_bigint, chosen by the arguments' types */
	override overright(i: number | Set): boolean {
		if (typeof i === 'number') return this._overright_set_bigint(i as number);
		return super.overright(i as Set);
	}

	/** MEOS: contained_bigint_set */
	rcontained(i: number): boolean {
		return F.contained_bigint_set(i, this.ptr);
	}

	/** MEOS: right_set_bigint, chosen by the arguments' types */
	override right(i: number | Set): boolean {
		if (typeof i === 'number') return this._right_set_bigint(i as number);
		return super.right(i as Set);
	}

	/** MEOS: intersection_bigint_set */
	rintersection(i: number): Set | null {
		return wrapSetOrNull(F.intersection_bigint_set(i, this.ptr)) as Set | null;
	}

	/** MEOS: left_bigint_set */
	rleft(i: number): boolean {
		return F.left_bigint_set(i, this.ptr);
	}

	/** MEOS: minus_bigint_set */
	rminus(i: number): Set | null {
		return wrapSetOrNull(F.minus_bigint_set(i, this.ptr)) as Set | null;
	}

	/** MEOS: overleft_bigint_set */
	roverleft(i: number): boolean {
		return F.overleft_bigint_set(i, this.ptr);
	}

	/** MEOS: overright_bigint_set */
	roverright(i: number): boolean {
		return F.overright_bigint_set(i, this.ptr);
	}

	/** MEOS: right_bigint_set */
	rright(i: number): boolean {
		return F.right_bigint_set(i, this.ptr);
	}

	/** MEOS: union_bigint_set */
	runion(i: number): Set | null {
		return wrapSetOrNull(F.union_bigint_set(i, this.ptr)) as Set | null;
	}

	/** MEOS: same_rid_bigintset_tnpoint */
	sameRid(temp: TNpoint): boolean {
		return F.same_rid_bigintset_tnpoint(this.ptr, temp.ptr);
	}

	/** MEOS: bigintset_shift_scale */
	shiftScale(shift: number, width: number, hasshift: boolean, haswidth: boolean): Set {
		return wrapSet(F.bigintset_shift_scale(this.ptr, shift, width, hasshift, haswidth)) as Set;
	}

	/** MEOS: bigintset_start_value */
	startValue(): number {
		return F.bigintset_start_value(this.ptr);
	}

	/** MEOS: union_set_bigint, chosen by the arguments' types */
	override union(i: number | Set): Set | null {
		if (typeof i === 'number') return this._union_set_bigint(i as number);
		return super.union(i as Set);
	}

	/** MEOS: bigintset_value_n */
	valueN(n: number): number {
		return F.bigintset_value_n(this.ptr, n);
	}

	/** MEOS: bigintset_values */
	values(): number[] {
		const _count = _alloc(4);
		try {
			const _arr = F.bigintset_values(this.ptr, _count);
			if (!_arr) return [];
			try {
				const _n = _view(_count, 4).getInt32(0, true);
				const _v = _view(_arr, _n * 8);
				const _out: number[] = [];
				for (let _i = 0; _i < _n; _i++) _out.push(Number(_v.getBigInt64(_i * 8, true)));
				return _out;
			} finally {
				_free(_arr);
			}
		} finally {
			_free(_count);
		}
	}

	/** MEOS: bigintset_in */
	static fromText(str: string): BigIntSet {
		return BigIntSet.in(str);
	}

	/** MEOS: bigintset_in */
	static in(str: string): BigIntSet {
		return wrapSet(F.bigintset_in(str)) as BigIntSet;
	}

	/** MEOS: bigintset_make */
	static make(values: number[]): BigIntSet {
		const _values = _alloc(Math.max(values.length, 1) * 8);
		{ const _v = _view(_values, Math.max(values.length, 1) * 8); values.forEach((_x, _i) => _v.setBigInt64(_i * 8, BigInt(_x), true)); }
		try {
			return wrapSet(F.bigintset_make(_values, values.length)) as BigIntSet;
		} finally {
			_free(_values);
		}
	}
}

/**
 * Contiguous range over an ordered base type.
 */
export class Span extends Collection {

	/** MEOS: contained_span_span */
	private _contained_span_span(s2: Span): boolean {
		return F.contained_span_span(this.ptr, s2.ptr);
	}

	/** MEOS: contained_span_spanset */
	private _contained_span_spanset(ss: SpanSet): boolean {
		return F.contained_span_spanset(this.ptr, ss.ptr);
	}

	/** MEOS: contains_span_span */
	private _contains_span_span(s2: Span): boolean {
		return F.contains_span_span(this.ptr, s2.ptr);
	}

	/** MEOS: contains_span_spanset */
	private _contains_span_spanset(ss: SpanSet): boolean {
		return F.contains_span_spanset(this.ptr, ss.ptr);
	}

	/** MEOS: intersection_span_span */
	private _intersection_span_span(s2: Span): Span | null {
		return wrapSpanOrNull(F.intersection_span_span(this.ptr, s2.ptr)) as Span | null;
	}

	/** MEOS: intersection_span_spanset */
	private _intersection_span_spanset(ss: SpanSet): SpanSet | null {
		return wrapSpanSetOrNull(F.intersection_span_spanset(this.ptr, ss.ptr)) as SpanSet | null;
	}

	/** MEOS: left_span_span */
	private _left_span_span(s2: Span): boolean {
		return F.left_span_span(this.ptr, s2.ptr);
	}

	/** MEOS: left_span_spanset */
	private _left_span_spanset(ss: SpanSet): boolean {
		return F.left_span_spanset(this.ptr, ss.ptr);
	}

	/** MEOS: minus_span_span */
	private _minus_span_span(s2: Span): SpanSet | null {
		return wrapSpanSetOrNull(F.minus_span_span(this.ptr, s2.ptr)) as SpanSet | null;
	}

	/** MEOS: minus_span_spanset */
	private _minus_span_spanset(ss: SpanSet): SpanSet | null {
		return wrapSpanSetOrNull(F.minus_span_spanset(this.ptr, ss.ptr)) as SpanSet | null;
	}

	/** MEOS: overlaps_span_span */
	private _overlaps_span_span(s2: Span): boolean {
		return F.overlaps_span_span(this.ptr, s2.ptr);
	}

	/** MEOS: overlaps_span_spanset */
	private _overlaps_span_spanset(ss: SpanSet): boolean {
		return F.overlaps_span_spanset(this.ptr, ss.ptr);
	}

	/** MEOS: overleft_span_span */
	private _overleft_span_span(s2: Span): boolean {
		return F.overleft_span_span(this.ptr, s2.ptr);
	}

	/** MEOS: overleft_span_spanset */
	private _overleft_span_spanset(ss: SpanSet): boolean {
		return F.overleft_span_spanset(this.ptr, ss.ptr);
	}

	/** MEOS: overright_span_span */
	private _overright_span_span(s2: Span): boolean {
		return F.overright_span_span(this.ptr, s2.ptr);
	}

	/** MEOS: overright_span_spanset */
	private _overright_span_spanset(ss: SpanSet): boolean {
		return F.overright_span_spanset(this.ptr, ss.ptr);
	}

	/** MEOS: right_span_span */
	private _right_span_span(s2: Span): boolean {
		return F.right_span_span(this.ptr, s2.ptr);
	}

	/** MEOS: right_span_spanset */
	private _right_span_spanset(ss: SpanSet): boolean {
		return F.right_span_spanset(this.ptr, ss.ptr);
	}

	/** MEOS: union_span_span */
	private _union_span_span(s2: Span): SpanSet {
		return wrapSpanSet(F.union_span_span(this.ptr, s2.ptr)) as SpanSet;
	}

	/** MEOS: union_span_spanset */
	private _union_span_spanset(ss: SpanSet): SpanSet | null {
		return wrapSpanSetOrNull(F.union_span_spanset(this.ptr, ss.ptr)) as SpanSet | null;
	}

	/** MEOS: adjacent_span_spanset */
	adjacent(ss: SpanSet): boolean {
		return F.adjacent_span_spanset(this.ptr, ss.ptr);
	}

	/** MEOS: span_as_wkb */
	asWKB(variant: number): Uint8Array {
		return readWkb(_sizeOut => F.span_as_wkb(this.ptr, variant, _sizeOut));
	}

	/** MEOS: span_cmp */
	cmp(s2: Span): number {
		return F.span_cmp(this.ptr, s2.ptr);
	}

	/** MEOS: contained_span_span, contained_span_spanset, chosen by the arguments' types */
	contained(s2: Span | SpanSet): boolean {
		if (s2 instanceof Span) return this._contained_span_span(s2 as Span);
		if (s2 instanceof SpanSet) return this._contained_span_spanset(s2 as SpanSet);
		throw new TypeError(`Span.contained: no overload takes these arguments`);
	}

	/** MEOS: contains_span_span, contains_span_spanset, chosen by the arguments' types */
	contains(s2: Span | SpanSet): boolean {
		if (s2 instanceof Span) return this._contains_span_span(s2 as Span);
		if (s2 instanceof SpanSet) return this._contains_span_spanset(s2 as SpanSet);
		throw new TypeError(`Span.contains: no overload takes these arguments`);
	}

	/** MEOS: span_copy */
	copy(): Span {
		return wrapSpan(F.span_copy(this.ptr)) as Span;
	}

	/** MEOS: span_ge */
	ge(s2: Span): boolean {
		return F.span_ge(this.ptr, s2.ptr);
	}

	/** MEOS: span_gt */
	gt(s2: Span): boolean {
		return F.span_gt(this.ptr, s2.ptr);
	}

	/** MEOS: span_hash */
	hash(): number {
		return F.span_hash(this.ptr);
	}

	/** MEOS: span_hash_extended */
	hashExtended(seed: number): number {
		return F.span_hash_extended(this.ptr, seed);
	}

	/** MEOS: intersection_span_span, intersection_span_spanset, chosen by the arguments' types */
	intersection(s2: Span | SpanSet): Span | null | SpanSet {
		if (s2 instanceof Span) return this._intersection_span_span(s2 as Span);
		if (s2 instanceof SpanSet) return this._intersection_span_spanset(s2 as SpanSet);
		throw new TypeError(`Span.intersection: no overload takes these arguments`);
	}

	/** MEOS: span_le */
	le(s2: Span): boolean {
		return F.span_le(this.ptr, s2.ptr);
	}

	/** MEOS: left_span_span, left_span_spanset, chosen by the arguments' types */
	left(s2: Span | SpanSet): boolean {
		if (s2 instanceof Span) return this._left_span_span(s2 as Span);
		if (s2 instanceof SpanSet) return this._left_span_spanset(s2 as SpanSet);
		throw new TypeError(`Span.left: no overload takes these arguments`);
	}

	/** MEOS: span_lower_inc */
	lowerInc(): boolean {
		return F.span_lower_inc(this.ptr);
	}

	/** MEOS: span_lt */
	lt(s2: Span): boolean {
		return F.span_lt(this.ptr, s2.ptr);
	}

	/** MEOS: minus_span_span, minus_span_spanset, chosen by the arguments' types */
	minus(s2: Span | SpanSet): SpanSet | null {
		if (s2 instanceof Span) return this._minus_span_span(s2 as Span);
		if (s2 instanceof SpanSet) return this._minus_span_spanset(s2 as SpanSet);
		throw new TypeError(`Span.minus: no overload takes these arguments`);
	}

	/** MEOS: overlaps_span_span, overlaps_span_spanset, chosen by the arguments' types */
	overlaps(s2: Span | SpanSet): boolean {
		if (s2 instanceof Span) return this._overlaps_span_span(s2 as Span);
		if (s2 instanceof SpanSet) return this._overlaps_span_spanset(s2 as SpanSet);
		throw new TypeError(`Span.overlaps: no overload takes these arguments`);
	}

	/** MEOS: overleft_span_span, overleft_span_spanset, chosen by the arguments' types */
	overleft(s2: Span | SpanSet): boolean {
		if (s2 instanceof Span) return this._overleft_span_span(s2 as Span);
		if (s2 instanceof SpanSet) return this._overleft_span_spanset(s2 as SpanSet);
		throw new TypeError(`Span.overleft: no overload takes these arguments`);
	}

	/** MEOS: overright_span_span, overright_span_spanset, chosen by the arguments' types */
	overright(s2: Span | SpanSet): boolean {
		if (s2 instanceof Span) return this._overright_span_span(s2 as Span);
		if (s2 instanceof SpanSet) return this._overright_span_spanset(s2 as SpanSet);
		throw new TypeError(`Span.overright: no overload takes these arguments`);
	}

	/** MEOS: right_span_span, right_span_spanset, chosen by the arguments' types */
	right(s2: Span | SpanSet): boolean {
		if (s2 instanceof Span) return this._right_span_span(s2 as Span);
		if (s2 instanceof SpanSet) return this._right_span_spanset(s2 as SpanSet);
		throw new TypeError(`Span.right: no overload takes these arguments`);
	}

	/** MEOS: same_span_span */
	same(s2: Span): boolean {
		return F.same_span_span(this.ptr, s2.ptr);
	}

	/** MEOS: span_sortkey */
	sortkey(): Uint8Array {
		return readWkb(_sizeOut => F.span_sortkey(this.ptr, _sizeOut));
	}

	/** MEOS: span_to_spanset */
	toSpanset(): SpanSet {
		return wrapSpanSet(F.span_to_spanset(this.ptr)) as SpanSet;
	}

	/** MEOS: span_to_tbox */
	toTbox(): TBox {
		return wrapTBox(F.span_to_tbox(this.ptr)) as TBox;
	}

	/** MEOS: union_span_span, union_span_spanset, chosen by the arguments' types */
	union(s2: Span | SpanSet): SpanSet | null {
		if (s2 instanceof Span) return this._union_span_span(s2 as Span);
		if (s2 instanceof SpanSet) return this._union_span_spanset(s2 as SpanSet);
		throw new TypeError(`Span.union: no overload takes these arguments`);
	}

	/** MEOS: span_upper_inc */
	upperInc(): boolean {
		return F.span_upper_inc(this.ptr);
	}

	/** MEOS: span_from_hexwkb */
	static fromHexWKB(hexwkb: string): Span {
		return wrapSpan(F.span_from_hexwkb(hexwkb)) as Span;
	}

	/** MEOS: span_from_wkb */
	static fromWKB(wkb: Uint8Array): Span {
		const _wkb = _bytes(wkb);
		try {
			return wrapSpan(F.span_from_wkb(_wkb, wkb.length)) as Span;
		} finally {
			_free(_wkb);
		}
	}
}

/**
 * The BigIntSpan class of the MEOS object model.
 */
export class BigIntSpan extends Span {

	/** The text MEOS writes this value as (MEOS: bigintspan_out). */
	override toString(): string {
		return this.out();
	}

	/** MEOS: adjacent_span_bigint */
	private _adjacent_span_bigint(i: number): boolean {
		return F.adjacent_span_bigint(this.ptr, i);
	}

	/** MEOS: contains_span_bigint */
	private _contains_span_bigint(i: number): boolean {
		return F.contains_span_bigint(this.ptr, i);
	}

	/** MEOS: distance_bigintspan_bigintspan */
	private _distance_bigintspan_bigintspan(s2: BigIntSpan): number {
		return F.distance_bigintspan_bigintspan(this.ptr, s2.ptr);
	}

	/** MEOS: distance_span_bigint */
	private _distance_span_bigint(i: number): number {
		return F.distance_span_bigint(this.ptr, i);
	}

	/** MEOS: intersection_span_bigint */
	private _intersection_span_bigint(i: number): Span | null {
		return wrapSpanOrNull(F.intersection_span_bigint(this.ptr, i)) as Span | null;
	}

	/** MEOS: left_span_bigint */
	private _left_span_bigint(i: number): boolean {
		return F.left_span_bigint(this.ptr, i);
	}

	/** MEOS: minus_span_bigint */
	private _minus_span_bigint(i: number): SpanSet | null {
		return wrapSpanSetOrNull(F.minus_span_bigint(this.ptr, i)) as SpanSet | null;
	}

	/** MEOS: overleft_span_bigint */
	private _overleft_span_bigint(i: number): boolean {
		return F.overleft_span_bigint(this.ptr, i);
	}

	/** MEOS: overright_span_bigint */
	private _overright_span_bigint(i: number): boolean {
		return F.overright_span_bigint(this.ptr, i);
	}

	/** MEOS: right_span_bigint */
	private _right_span_bigint(i: number): boolean {
		return F.right_span_bigint(this.ptr, i);
	}

	/** MEOS: union_span_bigint */
	private _union_span_bigint(i: number): SpanSet {
		return wrapSpanSet(F.union_span_bigint(this.ptr, i)) as SpanSet;
	}

	/** MEOS: adjacent_span_bigint, chosen by the arguments' types */
	override adjacent(i: number | SpanSet): boolean {
		if (typeof i === 'number') return this._adjacent_span_bigint(i as number);
		return super.adjacent(i as SpanSet);
	}

	/** MEOS: bigintspan_out */
	asText(): string {
		return this.out();
	}

	/** MEOS: bigintspan_bins */
	bins(vsize: number, vorigin: number, border_inc: boolean): Span[] {
		const _count = _alloc(4);
		try {
			const _arr = F.bigintspan_bins(this.ptr, vsize, vorigin, border_inc, _count);
			if (!_arr) return [];
			try {
				const _n = _view(_count, 4).getInt32(0, true);
				const _v = _view(_arr, _n * 24);
				const _out: Span[] = [];
				for (let _i = 0; _i < _n; _i++) _out.push(wrapSpan(_copy(_arr + _i * 24, 24)) as Span);
				return _out;
			} finally {
				_free(_arr);
			}
		} finally {
			_free(_count);
		}
	}

	/** MEOS: contains_span_bigint, chosen by the arguments' types */
	override contains(i: number | Span | SpanSet): boolean {
		if (typeof i === 'number') return this._contains_span_bigint(i as number);
		return super.contains(i as Span | SpanSet);
	}

	/** MEOS: distance_bigintspan_bigintspan, distance_span_bigint, chosen by the arguments' types */
	distance(s2: BigIntSpan | number): number {
		if (s2 instanceof BigIntSpan) return this._distance_bigintspan_bigintspan(s2 as BigIntSpan);
		if (typeof s2 === 'number') return this._distance_span_bigint(s2 as number);
		throw new TypeError(`BigIntSpan.distance: no overload takes these arguments`);
	}

	/** MEOS: bigintspan_expand */
	expand(value: number): Span | null {
		return wrapSpanOrNull(F.bigintspan_expand(this.ptr, value)) as Span | null;
	}

	/** MEOS: intersection_span_bigint, chosen by the arguments' types */
	override intersection(i: number | Span | SpanSet): Span | null | SpanSet {
		if (typeof i === 'number') return this._intersection_span_bigint(i as number);
		return super.intersection(i as Span | SpanSet);
	}

	/** MEOS: left_span_bigint, chosen by the arguments' types */
	override left(i: number | Span | SpanSet): boolean {
		if (typeof i === 'number') return this._left_span_bigint(i as number);
		return super.left(i as Span | SpanSet);
	}

	/** MEOS: bigintspan_lower */
	lower(): number {
		return F.bigintspan_lower(this.ptr);
	}

	/** MEOS: minus_span_bigint, chosen by the arguments' types */
	override minus(i: number | Span | SpanSet): SpanSet | null {
		if (typeof i === 'number') return this._minus_span_bigint(i as number);
		return super.minus(i as Span | SpanSet);
	}

	/** MEOS: nad_bigintspan_tbox */
	nad(box: TBox): number {
		return F.nad_bigintspan_tbox(this.ptr, box.ptr);
	}

	/** MEOS: bigintspan_out */
	out(): string {
		return F.bigintspan_out(this.ptr);
	}

	/** MEOS: overleft_span_bigint, chosen by the arguments' types */
	override overleft(i: number | Span | SpanSet): boolean {
		if (typeof i === 'number') return this._overleft_span_bigint(i as number);
		return super.overleft(i as Span | SpanSet);
	}

	/** MEOS: overright_span_bigint, chosen by the arguments' types */
	override overright(i: number | Span | SpanSet): boolean {
		if (typeof i === 'number') return this._overright_span_bigint(i as number);
		return super.overright(i as Span | SpanSet);
	}

	/** MEOS: adjacent_bigint_span */
	radjacent(i: number): boolean {
		return F.adjacent_bigint_span(i, this.ptr);
	}

	/** MEOS: contained_bigint_span */
	rcontained(i: number): boolean {
		return F.contained_bigint_span(i, this.ptr);
	}

	/** MEOS: right_span_bigint, chosen by the arguments' types */
	override right(i: number | Span | SpanSet): boolean {
		if (typeof i === 'number') return this._right_span_bigint(i as number);
		return super.right(i as Span | SpanSet);
	}

	/** MEOS: intersection_bigint_span */
	rintersection(i: number): Span | null {
		return wrapSpanOrNull(F.intersection_bigint_span(i, this.ptr)) as Span | null;
	}

	/** MEOS: left_bigint_span */
	rleft(i: number): boolean {
		return F.left_bigint_span(i, this.ptr);
	}

	/** MEOS: minus_bigint_span */
	rminus(i: number): SpanSet | null {
		return wrapSpanSetOrNull(F.minus_bigint_span(i, this.ptr)) as SpanSet | null;
	}

	/** MEOS: overleft_bigint_span */
	roverleft(i: number): boolean {
		return F.overleft_bigint_span(i, this.ptr);
	}

	/** MEOS: overright_bigint_span */
	roverright(i: number): boolean {
		return F.overright_bigint_span(i, this.ptr);
	}

	/** MEOS: right_bigint_span */
	rright(i: number): boolean {
		return F.right_bigint_span(i, this.ptr);
	}

	/** MEOS: union_bigint_span */
	runion(i: number): SpanSet {
		return wrapSpanSet(F.union_bigint_span(i, this.ptr)) as SpanSet;
	}

	/** MEOS: bigintspan_shift_scale */
	shiftScale(shift: number, width: number, hasshift: boolean, haswidth: boolean): Span {
		return wrapSpan(F.bigintspan_shift_scale(this.ptr, shift, width, hasshift, haswidth)) as Span;
	}

	/** MEOS: bigintspan_to_floatspan */
	toFloatspan(): Span {
		return wrapSpan(F.bigintspan_to_floatspan(this.ptr)) as Span;
	}

	/** MEOS: bigintspan_to_intspan */
	toIntspan(): Span {
		return wrapSpan(F.bigintspan_to_intspan(this.ptr)) as Span;
	}

	/** MEOS: union_span_bigint, chosen by the arguments' types */
	override union(i: number | Span | SpanSet): SpanSet | null {
		if (typeof i === 'number') return this._union_span_bigint(i as number);
		return super.union(i as Span | SpanSet);
	}

	/** MEOS: bigintspan_upper */
	upper(): number {
		return F.bigintspan_upper(this.ptr);
	}

	/** MEOS: bigintspan_width */
	width(): number {
		return F.bigintspan_width(this.ptr);
	}

	/** MEOS: bigintspan_in */
	static fromText(str: string): BigIntSpan {
		return BigIntSpan.in(str);
	}

	/** MEOS: bigintspan_get_bin */
	static getBin(value: number, vsize: number, vorigin: number): Span {
		return wrapSpan(F.bigintspan_get_bin(value, vsize, vorigin)) as Span;
	}

	/** MEOS: bigintspan_in */
	static in(str: string): BigIntSpan {
		return wrapSpan(F.bigintspan_in(str)) as BigIntSpan;
	}

	/** MEOS: bigintspan_make */
	static make(lower: number, upper: number, lower_inc: boolean, upper_inc: boolean): BigIntSpan {
		return wrapSpan(F.bigintspan_make(lower, upper, lower_inc, upper_inc)) as BigIntSpan;
	}
}

/**
 * Set of disjoint spans.
 */
export class SpanSet extends Collection {

	/** MEOS: adjacent_spanset_span */
	private _adjacent_spanset_span(s: Span): boolean {
		return F.adjacent_spanset_span(this.ptr, s.ptr);
	}

	/** MEOS: adjacent_spanset_spanset */
	private _adjacent_spanset_spanset(ss2: SpanSet): boolean {
		return F.adjacent_spanset_spanset(this.ptr, ss2.ptr);
	}

	/** MEOS: contained_spanset_span */
	private _contained_spanset_span(s: Span): boolean {
		return F.contained_spanset_span(this.ptr, s.ptr);
	}

	/** MEOS: contained_spanset_spanset */
	private _contained_spanset_spanset(ss2: SpanSet): boolean {
		return F.contained_spanset_spanset(this.ptr, ss2.ptr);
	}

	/** MEOS: contains_spanset_span */
	private _contains_spanset_span(s: Span): boolean {
		return F.contains_spanset_span(this.ptr, s.ptr);
	}

	/** MEOS: contains_spanset_spanset */
	private _contains_spanset_spanset(ss2: SpanSet): boolean {
		return F.contains_spanset_spanset(this.ptr, ss2.ptr);
	}

	/** MEOS: intersection_spanset_span */
	private _intersection_spanset_span(s: Span): SpanSet | null {
		return wrapSpanSetOrNull(F.intersection_spanset_span(this.ptr, s.ptr)) as SpanSet | null;
	}

	/** MEOS: intersection_spanset_spanset */
	private _intersection_spanset_spanset(ss2: SpanSet): SpanSet | null {
		return wrapSpanSetOrNull(F.intersection_spanset_spanset(this.ptr, ss2.ptr)) as SpanSet | null;
	}

	/** MEOS: left_spanset_span */
	private _left_spanset_span(s: Span): boolean {
		return F.left_spanset_span(this.ptr, s.ptr);
	}

	/** MEOS: left_spanset_spanset */
	private _left_spanset_spanset(ss2: SpanSet): boolean {
		return F.left_spanset_spanset(this.ptr, ss2.ptr);
	}

	/** MEOS: minus_spanset_span */
	private _minus_spanset_span(s: Span): SpanSet | null {
		return wrapSpanSetOrNull(F.minus_spanset_span(this.ptr, s.ptr)) as SpanSet | null;
	}

	/** MEOS: minus_spanset_spanset */
	private _minus_spanset_spanset(ss2: SpanSet): SpanSet | null {
		return wrapSpanSetOrNull(F.minus_spanset_spanset(this.ptr, ss2.ptr)) as SpanSet | null;
	}

	/** MEOS: overlaps_spanset_span */
	private _overlaps_spanset_span(s: Span): boolean {
		return F.overlaps_spanset_span(this.ptr, s.ptr);
	}

	/** MEOS: overlaps_spanset_spanset */
	private _overlaps_spanset_spanset(ss2: SpanSet): boolean {
		return F.overlaps_spanset_spanset(this.ptr, ss2.ptr);
	}

	/** MEOS: overleft_spanset_span */
	private _overleft_spanset_span(s: Span): boolean {
		return F.overleft_spanset_span(this.ptr, s.ptr);
	}

	/** MEOS: overleft_spanset_spanset */
	private _overleft_spanset_spanset(ss2: SpanSet): boolean {
		return F.overleft_spanset_spanset(this.ptr, ss2.ptr);
	}

	/** MEOS: overright_spanset_span */
	private _overright_spanset_span(s: Span): boolean {
		return F.overright_spanset_span(this.ptr, s.ptr);
	}

	/** MEOS: overright_spanset_spanset */
	private _overright_spanset_spanset(ss2: SpanSet): boolean {
		return F.overright_spanset_spanset(this.ptr, ss2.ptr);
	}

	/** MEOS: right_spanset_span */
	private _right_spanset_span(s: Span): boolean {
		return F.right_spanset_span(this.ptr, s.ptr);
	}

	/** MEOS: right_spanset_spanset */
	private _right_spanset_spanset(ss2: SpanSet): boolean {
		return F.right_spanset_spanset(this.ptr, ss2.ptr);
	}

	/** MEOS: union_spanset_span */
	private _union_spanset_span(s: Span): SpanSet | null {
		return wrapSpanSetOrNull(F.union_spanset_span(this.ptr, s.ptr)) as SpanSet | null;
	}

	/** MEOS: union_spanset_spanset */
	private _union_spanset_spanset(ss2: SpanSet): SpanSet | null {
		return wrapSpanSetOrNull(F.union_spanset_spanset(this.ptr, ss2.ptr)) as SpanSet | null;
	}

	/** MEOS: adjacent_spanset_span, adjacent_spanset_spanset, chosen by the arguments' types */
	adjacent(s: Span | SpanSet): boolean {
		if (s instanceof Span) return this._adjacent_spanset_span(s as Span);
		if (s instanceof SpanSet) return this._adjacent_spanset_spanset(s as SpanSet);
		throw new TypeError(`SpanSet.adjacent: no overload takes these arguments`);
	}

	/** MEOS: spanset_as_wkb */
	asWKB(variant: number): Uint8Array {
		return readWkb(_sizeOut => F.spanset_as_wkb(this.ptr, variant, _sizeOut));
	}

	/** MEOS: spanset_cmp */
	cmp(ss2: SpanSet): number {
		return F.spanset_cmp(this.ptr, ss2.ptr);
	}

	/** MEOS: contained_spanset_span, contained_spanset_spanset, chosen by the arguments' types */
	contained(s: Span | SpanSet): boolean {
		if (s instanceof Span) return this._contained_spanset_span(s as Span);
		if (s instanceof SpanSet) return this._contained_spanset_spanset(s as SpanSet);
		throw new TypeError(`SpanSet.contained: no overload takes these arguments`);
	}

	/** MEOS: contains_spanset_span, contains_spanset_spanset, chosen by the arguments' types */
	contains(s: Span | SpanSet): boolean {
		if (s instanceof Span) return this._contains_spanset_span(s as Span);
		if (s instanceof SpanSet) return this._contains_spanset_spanset(s as SpanSet);
		throw new TypeError(`SpanSet.contains: no overload takes these arguments`);
	}

	/** MEOS: spanset_copy */
	copy(): SpanSet {
		return wrapSpanSet(F.spanset_copy(this.ptr)) as SpanSet;
	}

	/** MEOS: spanset_end_span */
	endSpan(): Span {
		return wrapSpan(F.spanset_end_span(this.ptr)) as Span;
	}

	/** MEOS: spanset_eq */
	eq(ss2: SpanSet): boolean {
		return F.spanset_eq(this.ptr, ss2.ptr);
	}

	/** MEOS: spanset_ge */
	ge(ss2: SpanSet): boolean {
		return F.spanset_ge(this.ptr, ss2.ptr);
	}

	/** MEOS: spanset_gt */
	gt(ss2: SpanSet): boolean {
		return F.spanset_gt(this.ptr, ss2.ptr);
	}

	/** MEOS: spanset_hash */
	hash(): number {
		return F.spanset_hash(this.ptr);
	}

	/** MEOS: spanset_hash_extended */
	hashExtended(seed: number): number {
		return F.spanset_hash_extended(this.ptr, seed);
	}

	/** MEOS: intersection_spanset_span, intersection_spanset_spanset, chosen by the arguments' types */
	intersection(s: Span | SpanSet): SpanSet | null {
		if (s instanceof Span) return this._intersection_spanset_span(s as Span);
		if (s instanceof SpanSet) return this._intersection_spanset_spanset(s as SpanSet);
		throw new TypeError(`SpanSet.intersection: no overload takes these arguments`);
	}

	/** MEOS: spanset_le */
	le(ss2: SpanSet): boolean {
		return F.spanset_le(this.ptr, ss2.ptr);
	}

	/** MEOS: left_spanset_span, left_spanset_spanset, chosen by the arguments' types */
	left(s: Span | SpanSet): boolean {
		if (s instanceof Span) return this._left_spanset_span(s as Span);
		if (s instanceof SpanSet) return this._left_spanset_spanset(s as SpanSet);
		throw new TypeError(`SpanSet.left: no overload takes these arguments`);
	}

	/** MEOS: spanset_lower_inc */
	lowerInc(): boolean {
		return F.spanset_lower_inc(this.ptr);
	}

	/** MEOS: spanset_lt */
	lt(ss2: SpanSet): boolean {
		return F.spanset_lt(this.ptr, ss2.ptr);
	}

	/** MEOS: spanset_mem_size */
	memSize(): number {
		return F.spanset_mem_size(this.ptr);
	}

	/** MEOS: minus_spanset_span, minus_spanset_spanset, chosen by the arguments' types */
	minus(s: Span | SpanSet): SpanSet | null {
		if (s instanceof Span) return this._minus_spanset_span(s as Span);
		if (s instanceof SpanSet) return this._minus_spanset_spanset(s as SpanSet);
		throw new TypeError(`SpanSet.minus: no overload takes these arguments`);
	}

	/** MEOS: spanset_ne */
	ne(ss2: SpanSet): boolean {
		return F.spanset_ne(this.ptr, ss2.ptr);
	}

	/** MEOS: spanset_num_spans */
	numSpans(): number {
		return F.spanset_num_spans(this.ptr);
	}

	/** MEOS: overlaps_spanset_span, overlaps_spanset_spanset, chosen by the arguments' types */
	overlaps(s: Span | SpanSet): boolean {
		if (s instanceof Span) return this._overlaps_spanset_span(s as Span);
		if (s instanceof SpanSet) return this._overlaps_spanset_spanset(s as SpanSet);
		throw new TypeError(`SpanSet.overlaps: no overload takes these arguments`);
	}

	/** MEOS: overleft_spanset_span, overleft_spanset_spanset, chosen by the arguments' types */
	overleft(s: Span | SpanSet): boolean {
		if (s instanceof Span) return this._overleft_spanset_span(s as Span);
		if (s instanceof SpanSet) return this._overleft_spanset_spanset(s as SpanSet);
		throw new TypeError(`SpanSet.overleft: no overload takes these arguments`);
	}

	/** MEOS: overright_spanset_span, overright_spanset_spanset, chosen by the arguments' types */
	overright(s: Span | SpanSet): boolean {
		if (s instanceof Span) return this._overright_spanset_span(s as Span);
		if (s instanceof SpanSet) return this._overright_spanset_spanset(s as SpanSet);
		throw new TypeError(`SpanSet.overright: no overload takes these arguments`);
	}

	/** MEOS: right_spanset_span, right_spanset_spanset, chosen by the arguments' types */
	right(s: Span | SpanSet): boolean {
		if (s instanceof Span) return this._right_spanset_span(s as Span);
		if (s instanceof SpanSet) return this._right_spanset_spanset(s as SpanSet);
		throw new TypeError(`SpanSet.right: no overload takes these arguments`);
	}

	/** MEOS: spanset_sortkey */
	sortkey(): Uint8Array {
		return readWkb(_sizeOut => F.spanset_sortkey(this.ptr, _sizeOut));
	}

	/** MEOS: spanset_span */
	span(): Span {
		return wrapSpan(F.spanset_span(this.ptr)) as Span;
	}

	/** MEOS: spanset_spanarr */
	spanarr(): Span[] {
		const _count = _alloc(4);
		try {
			const _arr = F.spanset_spanarr(this.ptr, _count);
			if (!_arr) return [];
			try {
				const _n = _view(_count, 4).getInt32(0, true);
				const _v = _view(_arr, _n * 8);
				const _out: Span[] = [];
				for (let _i = 0; _i < _n; _i++) _out.push(wrapSpan(Number(_v.getBigUint64(_i * 8, true))) as Span);
				return _out;
			} finally {
				_free(_arr);
			}
		} finally {
			_free(_count);
		}
	}

	/** MEOS: spanset_span_n */
	spanN(i: number): Span | null {
		return wrapSpanOrNull(F.spanset_span_n(this.ptr, i)) as Span | null;
	}

	/** MEOS: spanset_spans */
	spans(): Span[] {
		const _count = _alloc(4);
		try {
			const _arr = F.spanset_spans(this.ptr, _count);
			if (!_arr) return [];
			try {
				const _n = _view(_count, 4).getInt32(0, true);
				const _v = _view(_arr, _n * 24);
				const _out: Span[] = [];
				for (let _i = 0; _i < _n; _i++) _out.push(wrapSpan(_copy(_arr + _i * 24, 24)) as Span);
				return _out;
			} finally {
				_free(_arr);
			}
		} finally {
			_free(_count);
		}
	}

	/** MEOS: spanset_split_each_n_spans */
	splitEachNSpans(elems_per_span: number): Span[] {
		const _count = _alloc(4);
		try {
			const _arr = F.spanset_split_each_n_spans(this.ptr, elems_per_span, _count);
			if (!_arr) return [];
			try {
				const _n = _view(_count, 4).getInt32(0, true);
				const _v = _view(_arr, _n * 24);
				const _out: Span[] = [];
				for (let _i = 0; _i < _n; _i++) _out.push(wrapSpan(_copy(_arr + _i * 24, 24)) as Span);
				return _out;
			} finally {
				_free(_arr);
			}
		} finally {
			_free(_count);
		}
	}

	/** MEOS: spanset_split_n_spans */
	splitNSpans(span_count: number): Span[] {
		const _count = _alloc(4);
		try {
			const _arr = F.spanset_split_n_spans(this.ptr, span_count, _count);
			if (!_arr) return [];
			try {
				const _n = _view(_count, 4).getInt32(0, true);
				const _v = _view(_arr, _n * 24);
				const _out: Span[] = [];
				for (let _i = 0; _i < _n; _i++) _out.push(wrapSpan(_copy(_arr + _i * 24, 24)) as Span);
				return _out;
			} finally {
				_free(_arr);
			}
		} finally {
			_free(_count);
		}
	}

	/** MEOS: spanset_start_span */
	startSpan(): Span {
		return wrapSpan(F.spanset_start_span(this.ptr)) as Span;
	}

	/** MEOS: spanset_to_tbox */
	toTbox(): TBox {
		return wrapTBox(F.spanset_to_tbox(this.ptr)) as TBox;
	}

	/** MEOS: union_spanset_span, union_spanset_spanset, chosen by the arguments' types */
	union(s: Span | SpanSet): SpanSet | null {
		if (s instanceof Span) return this._union_spanset_span(s as Span);
		if (s instanceof SpanSet) return this._union_spanset_spanset(s as SpanSet);
		throw new TypeError(`SpanSet.union: no overload takes these arguments`);
	}

	/** MEOS: spanset_upper_inc */
	upperInc(): boolean {
		return F.spanset_upper_inc(this.ptr);
	}

	/** MEOS: spanset_from_hexwkb */
	static fromHexWKB(hexwkb: string): SpanSet {
		return wrapSpanSet(F.spanset_from_hexwkb(hexwkb)) as SpanSet;
	}

	/** MEOS: spanset_from_wkb */
	static fromWKB(wkb: Uint8Array): SpanSet {
		const _wkb = _bytes(wkb);
		try {
			return wrapSpanSet(F.spanset_from_wkb(_wkb, wkb.length)) as SpanSet;
		} finally {
			_free(_wkb);
		}
	}

	/** MEOS: spanset_make */
	static make(spans: Span[]): SpanSet {
		const _spans = _structArray(spans.map(x => x.ptr), 24);
		try {
			return wrapSpanSet(F.spanset_make(_spans, spans.length)) as SpanSet;
		} finally {
			_free(_spans);
		}
	}
}

/**
 * The BigIntSpanSet class of the MEOS object model.
 */
export class BigIntSpanSet extends SpanSet {

	/** The text MEOS writes this value as (MEOS: bigintspanset_out). */
	override toString(): string {
		return this.out();
	}

	/** MEOS: adjacent_spanset_bigint */
	private _adjacent_spanset_bigint(i: number): boolean {
		return F.adjacent_spanset_bigint(this.ptr, i);
	}

	/** MEOS: contains_spanset_bigint */
	private _contains_spanset_bigint(i: number): boolean {
		return F.contains_spanset_bigint(this.ptr, i);
	}

	/** MEOS: distance_bigintspanset_bigintspan */
	private _distance_bigintspanset_bigintspan(s: BigIntSpan): number {
		return F.distance_bigintspanset_bigintspan(this.ptr, s.ptr);
	}

	/** MEOS: distance_bigintspanset_bigintspanset */
	private _distance_bigintspanset_bigintspanset(ss2: BigIntSpanSet): number {
		return F.distance_bigintspanset_bigintspanset(this.ptr, ss2.ptr);
	}

	/** MEOS: distance_spanset_bigint */
	private _distance_spanset_bigint(i: number): number {
		return F.distance_spanset_bigint(this.ptr, i);
	}

	/** MEOS: intersection_spanset_bigint */
	private _intersection_spanset_bigint(i: number): SpanSet | null {
		return wrapSpanSetOrNull(F.intersection_spanset_bigint(this.ptr, i)) as SpanSet | null;
	}

	/** MEOS: left_spanset_bigint */
	private _left_spanset_bigint(i: number): boolean {
		return F.left_spanset_bigint(this.ptr, i);
	}

	/** MEOS: minus_spanset_bigint */
	private _minus_spanset_bigint(i: number): SpanSet | null {
		return wrapSpanSetOrNull(F.minus_spanset_bigint(this.ptr, i)) as SpanSet | null;
	}

	/** MEOS: overleft_spanset_bigint */
	private _overleft_spanset_bigint(i: number): boolean {
		return F.overleft_spanset_bigint(this.ptr, i);
	}

	/** MEOS: overright_spanset_bigint */
	private _overright_spanset_bigint(i: number): boolean {
		return F.overright_spanset_bigint(this.ptr, i);
	}

	/** MEOS: right_spanset_bigint */
	private _right_spanset_bigint(i: number): boolean {
		return F.right_spanset_bigint(this.ptr, i);
	}

	/** MEOS: union_spanset_bigint */
	private _union_spanset_bigint(i: number): SpanSet | null {
		return wrapSpanSetOrNull(F.union_spanset_bigint(this.ptr, i)) as SpanSet | null;
	}

	/** MEOS: adjacent_spanset_bigint, chosen by the arguments' types */
	override adjacent(i: number | Span | SpanSet): boolean {
		if (typeof i === 'number') return this._adjacent_spanset_bigint(i as number);
		return super.adjacent(i as Span | SpanSet);
	}

	/** MEOS: bigintspanset_out */
	asText(): string {
		return this.out();
	}

	/** MEOS: bigintspanset_bins */
	bins(vsize: number, vorigin: number, border_inc: boolean): Span[] {
		const _count = _alloc(4);
		try {
			const _arr = F.bigintspanset_bins(this.ptr, vsize, vorigin, border_inc, _count);
			if (!_arr) return [];
			try {
				const _n = _view(_count, 4).getInt32(0, true);
				const _v = _view(_arr, _n * 24);
				const _out: Span[] = [];
				for (let _i = 0; _i < _n; _i++) _out.push(wrapSpan(_copy(_arr + _i * 24, 24)) as Span);
				return _out;
			} finally {
				_free(_arr);
			}
		} finally {
			_free(_count);
		}
	}

	/** MEOS: contains_spanset_bigint, chosen by the arguments' types */
	override contains(i: number | Span | SpanSet): boolean {
		if (typeof i === 'number') return this._contains_spanset_bigint(i as number);
		return super.contains(i as Span | SpanSet);
	}

	/** MEOS: distance_bigintspanset_bigintspan, distance_bigintspanset_bigintspanset, distance_spanset_bigint, chosen by the arguments' types */
	distance(s: BigIntSpan | BigIntSpanSet | number): number {
		if (s instanceof BigIntSpan) return this._distance_bigintspanset_bigintspan(s as BigIntSpan);
		if (s instanceof BigIntSpanSet) return this._distance_bigintspanset_bigintspanset(s as BigIntSpanSet);
		if (typeof s === 'number') return this._distance_spanset_bigint(s as number);
		throw new TypeError(`BigIntSpanSet.distance: no overload takes these arguments`);
	}

	/** MEOS: intersection_spanset_bigint, chosen by the arguments' types */
	override intersection(i: number | Span | SpanSet): SpanSet | null {
		if (typeof i === 'number') return this._intersection_spanset_bigint(i as number);
		return super.intersection(i as Span | SpanSet);
	}

	/** MEOS: left_spanset_bigint, chosen by the arguments' types */
	override left(i: number | Span | SpanSet): boolean {
		if (typeof i === 'number') return this._left_spanset_bigint(i as number);
		return super.left(i as Span | SpanSet);
	}

	/** MEOS: bigintspanset_lower */
	lower(): number {
		return F.bigintspanset_lower(this.ptr);
	}

	/** MEOS: minus_spanset_bigint, chosen by the arguments' types */
	override minus(i: number | Span | SpanSet): SpanSet | null {
		if (typeof i === 'number') return this._minus_spanset_bigint(i as number);
		return super.minus(i as Span | SpanSet);
	}

	/** MEOS: bigintspanset_out */
	out(): string {
		return F.bigintspanset_out(this.ptr);
	}

	/** MEOS: overleft_spanset_bigint, chosen by the arguments' types */
	override overleft(i: number | Span | SpanSet): boolean {
		if (typeof i === 'number') return this._overleft_spanset_bigint(i as number);
		return super.overleft(i as Span | SpanSet);
	}

	/** MEOS: overright_spanset_bigint, chosen by the arguments' types */
	override overright(i: number | Span | SpanSet): boolean {
		if (typeof i === 'number') return this._overright_spanset_bigint(i as number);
		return super.overright(i as Span | SpanSet);
	}

	/** MEOS: adjacent_bigint_spanset */
	radjacent(i: number): boolean {
		return F.adjacent_bigint_spanset(i, this.ptr);
	}

	/** MEOS: contained_bigint_spanset */
	rcontained(i: number): boolean {
		return F.contained_bigint_spanset(i, this.ptr);
	}

	/** MEOS: right_spanset_bigint, chosen by the arguments' types */
	override right(i: number | Span | SpanSet): boolean {
		if (typeof i === 'number') return this._right_spanset_bigint(i as number);
		return super.right(i as Span | SpanSet);
	}

	/** MEOS: intersection_bigint_spanset */
	rintersection(i: number): SpanSet | null {
		return wrapSpanSetOrNull(F.intersection_bigint_spanset(i, this.ptr)) as SpanSet | null;
	}

	/** MEOS: left_bigint_spanset */
	rleft(i: number): boolean {
		return F.left_bigint_spanset(i, this.ptr);
	}

	/** MEOS: minus_bigint_spanset */
	rminus(i: number): SpanSet | null {
		return wrapSpanSetOrNull(F.minus_bigint_spanset(i, this.ptr)) as SpanSet | null;
	}

	/** MEOS: overleft_bigint_spanset */
	roverleft(i: number): boolean {
		return F.overleft_bigint_spanset(i, this.ptr);
	}

	/** MEOS: overright_bigint_spanset */
	roverright(i: number): boolean {
		return F.overright_bigint_spanset(i, this.ptr);
	}

	/** MEOS: right_bigint_spanset */
	rright(i: number): boolean {
		return F.right_bigint_spanset(i, this.ptr);
	}

	/** MEOS: union_bigint_spanset */
	runion(i: number): SpanSet | null {
		return wrapSpanSetOrNull(F.union_bigint_spanset(i, this.ptr)) as SpanSet | null;
	}

	/** MEOS: bigintspanset_shift_scale */
	shiftScale(shift: number, width: number, hasshift: boolean, haswidth: boolean): SpanSet {
		return wrapSpanSet(F.bigintspanset_shift_scale(this.ptr, shift, width, hasshift, haswidth)) as SpanSet;
	}

	/** MEOS: union_spanset_bigint, chosen by the arguments' types */
	override union(i: number | Span | SpanSet): SpanSet | null {
		if (typeof i === 'number') return this._union_spanset_bigint(i as number);
		return super.union(i as Span | SpanSet);
	}

	/** MEOS: bigintspanset_upper */
	upper(): number {
		return F.bigintspanset_upper(this.ptr);
	}

	/** MEOS: bigintspanset_width */
	width(boundspan: boolean): number {
		return F.bigintspanset_width(this.ptr, boundspan);
	}

	/** MEOS: bigintspanset_in */
	static fromText(str: string): BigIntSpanSet {
		return BigIntSpanSet.in(str);
	}

	/** MEOS: bigintspanset_in */
	static in(str: string): BigIntSpanSet {
		return wrapSpanSet(F.bigintspanset_in(str)) as BigIntSpanSet;
	}
}

/**
 * Bounding-box family.
 */
export class Box extends MeosObject {
}

/**
 * Base values MEOS passes by reference.
 */
export class Value extends MeosObject {
}

/**
 * The Cbuffer class of the MEOS object model.
 */
export class Cbuffer extends Value {

	/** The text MEOS writes this value as (MEOS: cbuffer_as_text). */
	override toString(): string {
		return this.asText(15);
	}

	/** MEOS: distance_cbuffer_cbuffer */
	private _distance_cbuffer_cbuffer(cb2: Cbuffer): number {
		return F.distance_cbuffer_cbuffer(this.ptr, cb2.ptr);
	}

	/** MEOS: distance_cbuffer_geo */
	private _distance_cbuffer_geo(gs: Geometry): number {
		return F.distance_cbuffer_geo(this.ptr, gs.ptr);
	}

	/** MEOS: distance_cbuffer_stbox */
	private _distance_cbuffer_stbox(box: STBox): number {
		return F.distance_cbuffer_stbox(this.ptr, box.ptr);
	}

	/** MEOS: acontains_cbuffer_tcbuffer */
	acontains(temp: TCbuffer): number {
		return F.acontains_cbuffer_tcbuffer(this.ptr, temp.ptr);
	}

	/** MEOS: acovers_cbuffer_tcbuffer */
	acovers(temp: TCbuffer): number {
		return F.acovers_cbuffer_tcbuffer(this.ptr, temp.ptr);
	}

	/** MEOS: adisjoint_cbuffer_tcbuffer */
	adisjoint(temp: TCbuffer): number {
		return F.adisjoint_cbuffer_tcbuffer(this.ptr, temp.ptr);
	}

	/** MEOS: adwithin_cbuffer_tcbuffer */
	adwithin(temp: TCbuffer, dist: number): number {
		return F.adwithin_cbuffer_tcbuffer(this.ptr, temp.ptr, dist);
	}

	/** MEOS: aintersects_cbuffer_tcbuffer */
	aintersects(temp: TCbuffer): number {
		return F.aintersects_cbuffer_tcbuffer(this.ptr, temp.ptr);
	}

	/** MEOS: always_eq_cbuffer_tcbuffer */
	alwaysEq(temp: TCbuffer): number {
		return F.always_eq_cbuffer_tcbuffer(this.ptr, temp.ptr);
	}

	/** MEOS: always_ne_cbuffer_tcbuffer */
	alwaysNe(temp: TCbuffer): number {
		return F.always_ne_cbuffer_tcbuffer(this.ptr, temp.ptr);
	}

	/** MEOS: cbuffer_as_ewkb */
	asEWKB(variant: number): Uint8Array {
		return readWkb(_sizeOut => F.cbuffer_as_ewkb(this.ptr, variant, _sizeOut));
	}

	/** MEOS: cbuffer_as_ewkt */
	asEWKT(maxdd: number): string {
		return F.cbuffer_as_ewkt(this.ptr, maxdd);
	}

	/** MEOS: cbuffer_as_hexewkb */
	asHexEWKB(variant: number): string {
		return F.cbuffer_as_hexewkb(this.ptr, variant);
	}

	/** MEOS: cbuffer_as_hexwkb */
	asHexWKB(variant: number): string {
		return F.cbuffer_as_hexwkb(this.ptr, variant);
	}

	/** MEOS: cbuffer_as_text */
	asText(maxdd: number): string {
		return F.cbuffer_as_text(this.ptr, maxdd);
	}

	/** MEOS: cbuffer_as_wkb */
	asWKB(variant: number): Uint8Array {
		return readWkb(_sizeOut => F.cbuffer_as_wkb(this.ptr, variant, _sizeOut));
	}

	/** MEOS: atouches_cbuffer_tcbuffer */
	atouches(temp: TCbuffer): number {
		return F.atouches_cbuffer_tcbuffer(this.ptr, temp.ptr);
	}

	/** MEOS: cbuffer_cmp */
	cmp(cb2: Cbuffer): number {
		return F.cbuffer_cmp(this.ptr, cb2.ptr);
	}

	/** MEOS: contained_cbuffer_set */
	contained(s: CbufferSet): boolean {
		return F.contained_cbuffer_set(this.ptr, s.ptr);
	}

	/** MEOS: contains_cbuffer_cbuffer */
	contains(cb2: Cbuffer): number {
		return F.contains_cbuffer_cbuffer(this.ptr, cb2.ptr);
	}

	/** MEOS: cbuffer_copy */
	copy(): Cbuffer {
		return wrapCbuffer(F.cbuffer_copy(this.ptr)) as Cbuffer;
	}

	/** MEOS: covers_cbuffer_cbuffer */
	covers(cb2: Cbuffer): number {
		return F.covers_cbuffer_cbuffer(this.ptr, cb2.ptr);
	}

	/** MEOS: disjoint_cbuffer_cbuffer */
	disjoint(cb2: Cbuffer): number {
		return F.disjoint_cbuffer_cbuffer(this.ptr, cb2.ptr);
	}

	/** MEOS: distance_cbuffer_cbuffer, distance_cbuffer_geo, distance_cbuffer_stbox, chosen by the arguments' types */
	distance(cb2: Cbuffer | Geometry | STBox): number {
		if (cb2 instanceof Geometry) return this._distance_cbuffer_geo(cb2 as Geometry);
		if (cb2 instanceof Cbuffer) return this._distance_cbuffer_cbuffer(cb2 as Cbuffer);
		if (cb2 instanceof STBox) return this._distance_cbuffer_stbox(cb2 as STBox);
		throw new TypeError(`Cbuffer.distance: no overload takes these arguments`);
	}

	/** MEOS: dwithin_cbuffer_cbuffer */
	dwithin(cb2: Cbuffer, dist: number): number {
		return F.dwithin_cbuffer_cbuffer(this.ptr, cb2.ptr, dist);
	}

	/** MEOS: econtains_cbuffer_tcbuffer */
	econtains(temp: TCbuffer): number {
		return F.econtains_cbuffer_tcbuffer(this.ptr, temp.ptr);
	}

	/** MEOS: ecovers_cbuffer_tcbuffer */
	ecovers(temp: TCbuffer): number {
		return F.ecovers_cbuffer_tcbuffer(this.ptr, temp.ptr);
	}

	/** MEOS: edisjoint_cbuffer_tcbuffer */
	edisjoint(temp: TCbuffer): number {
		return F.edisjoint_cbuffer_tcbuffer(this.ptr, temp.ptr);
	}

	/** MEOS: edwithin_cbuffer_tcbuffer */
	edwithin(temp: TCbuffer, dist: number): number {
		return F.edwithin_cbuffer_tcbuffer(this.ptr, temp.ptr, dist);
	}

	/** MEOS: eintersects_cbuffer_tcbuffer */
	eintersects(temp: TCbuffer): number {
		return F.eintersects_cbuffer_tcbuffer(this.ptr, temp.ptr);
	}

	/** MEOS: cbuffer_eq */
	eq(cb2: Cbuffer): boolean {
		return F.cbuffer_eq(this.ptr, cb2.ptr);
	}

	/** MEOS: etouches_cbuffer_tcbuffer */
	etouches(temp: TCbuffer): number {
		return F.etouches_cbuffer_tcbuffer(this.ptr, temp.ptr);
	}

	/** MEOS: ever_eq_cbuffer_tcbuffer */
	everEq(temp: TCbuffer): number {
		return F.ever_eq_cbuffer_tcbuffer(this.ptr, temp.ptr);
	}

	/** MEOS: ever_ne_cbuffer_tcbuffer */
	everNe(temp: TCbuffer): number {
		return F.ever_ne_cbuffer_tcbuffer(this.ptr, temp.ptr);
	}

	/** MEOS: cbuffer_ge */
	ge(cb2: Cbuffer): boolean {
		return F.cbuffer_ge(this.ptr, cb2.ptr);
	}

	/** MEOS: cbuffer_gt */
	gt(cb2: Cbuffer): boolean {
		return F.cbuffer_gt(this.ptr, cb2.ptr);
	}

	/** MEOS: cbuffer_hash */
	hash(): number {
		return F.cbuffer_hash(this.ptr);
	}

	/** MEOS: cbuffer_hash_extended */
	hashExtended(seed: number): number {
		return F.cbuffer_hash_extended(this.ptr, seed);
	}

	/** MEOS: intersection_cbuffer_set */
	intersection(s: CbufferSet): Set | null {
		return wrapSetOrNull(F.intersection_cbuffer_set(this.ptr, s.ptr)) as Set | null;
	}

	/** MEOS: intersects_cbuffer_cbuffer */
	intersects(cb2: Cbuffer): number {
		return F.intersects_cbuffer_cbuffer(this.ptr, cb2.ptr);
	}

	/** MEOS: cbuffer_le */
	le(cb2: Cbuffer): boolean {
		return F.cbuffer_le(this.ptr, cb2.ptr);
	}

	/** MEOS: cbuffer_lt */
	lt(cb2: Cbuffer): boolean {
		return F.cbuffer_lt(this.ptr, cb2.ptr);
	}

	/** MEOS: cbuffer_mem_size */
	memSize(): number {
		return F.cbuffer_mem_size(this.ptr);
	}

	/** MEOS: minus_cbuffer_set */
	minus(s: CbufferSet): Set | null {
		return wrapSetOrNull(F.minus_cbuffer_set(this.ptr, s.ptr)) as Set | null;
	}

	/** MEOS: nad_cbuffer_stbox */
	nad(box: STBox): number {
		return F.nad_cbuffer_stbox(this.ptr, box.ptr);
	}

	/** MEOS: cbuffer_ne */
	ne(cb2: Cbuffer): boolean {
		return F.cbuffer_ne(this.ptr, cb2.ptr);
	}

	/** MEOS: cbuffer_out */
	out(maxdd: number): string {
		return F.cbuffer_out(this.ptr, maxdd);
	}

	/** MEOS: cbuffer_point */
	point(): Geo {
		return wrapGeo(F.cbuffer_point(this.ptr)) as Geo;
	}

	/** MEOS: cbuffer_radius */
	radius(): number {
		return F.cbuffer_radius(this.ptr);
	}

	/** MEOS: cbuffer_round */
	round(maxdd: number): Cbuffer {
		return wrapCbuffer(F.cbuffer_round(this.ptr, maxdd)) as Cbuffer;
	}

	/** MEOS: cbuffer_set_srid */
	setSRID(srid: number): Cbuffer {
		return wrapCbuffer(F.cbuffer_set_srid(this.ptr, srid)) as Cbuffer;
	}

	/** MEOS: cbuffer_srid */
	SRID(): number {
		return F.cbuffer_srid(this.ptr);
	}

	/** MEOS: tcontains_cbuffer_tcbuffer */
	tcontains(temp: TCbuffer): Temporal | null {
		return wrapTemporalOrNull(F.tcontains_cbuffer_tcbuffer(this.ptr, temp.ptr)) as Temporal | null;
	}

	/** MEOS: tcovers_cbuffer_tcbuffer */
	tcovers(temp: TCbuffer): Temporal | null {
		return wrapTemporalOrNull(F.tcovers_cbuffer_tcbuffer(this.ptr, temp.ptr)) as Temporal | null;
	}

	/** MEOS: tdisjoint_cbuffer_tcbuffer */
	tdisjoint(temp: TCbuffer): Temporal | null {
		return wrapTemporalOrNull(F.tdisjoint_cbuffer_tcbuffer(this.ptr, temp.ptr)) as Temporal | null;
	}

	/** MEOS: tdwithin_cbuffer_tcbuffer */
	tdwithin(temp: TCbuffer, dist: number): Temporal | null {
		return wrapTemporalOrNull(F.tdwithin_cbuffer_tcbuffer(this.ptr, temp.ptr, dist)) as Temporal | null;
	}

	/** MEOS: teq_cbuffer_tcbuffer */
	teq(temp: TCbuffer): Temporal | null {
		return wrapTemporalOrNull(F.teq_cbuffer_tcbuffer(this.ptr, temp.ptr)) as Temporal | null;
	}

	/** MEOS: cbuffer_timestamptz_to_stbox */
	timestamptzToStbox(t: TimestampTz): STBox {
		return wrapSTBox(F.cbuffer_timestamptz_to_stbox(this.ptr, t)) as STBox;
	}

	/** MEOS: tintersects_cbuffer_tcbuffer */
	tintersects(temp: TCbuffer): Temporal | null {
		return wrapTemporalOrNull(F.tintersects_cbuffer_tcbuffer(this.ptr, temp.ptr)) as Temporal | null;
	}

	/** MEOS: tne_cbuffer_tcbuffer */
	tne(temp: TCbuffer): Temporal | null {
		return wrapTemporalOrNull(F.tne_cbuffer_tcbuffer(this.ptr, temp.ptr)) as Temporal | null;
	}

	/** MEOS: cbuffer_to_geom */
	toGeom(): Geo {
		return wrapGeo(F.cbuffer_to_geom(this.ptr)) as Geo;
	}

	/** MEOS: cbuffer_to_set */
	toSet(): Set {
		return wrapSet(F.cbuffer_to_set(this.ptr)) as Set;
	}

	/** MEOS: cbuffer_to_stbox */
	toStbox(): STBox {
		return wrapSTBox(F.cbuffer_to_stbox(this.ptr)) as STBox;
	}

	/** MEOS: touches_cbuffer_cbuffer */
	touches(cb2: Cbuffer): number {
		return F.touches_cbuffer_cbuffer(this.ptr, cb2.ptr);
	}

	/** MEOS: cbuffer_transform */
	transform(srid: number): Cbuffer {
		return wrapCbuffer(F.cbuffer_transform(this.ptr, srid)) as Cbuffer;
	}

	/** MEOS: cbuffer_transform_pipeline */
	transformPipeline(pipelinestr: string, srid: number, is_forward: boolean): Cbuffer {
		return wrapCbuffer(F.cbuffer_transform_pipeline(this.ptr, pipelinestr, srid, is_forward)) as Cbuffer;
	}

	/** MEOS: cbuffer_tstzspan_to_stbox */
	tstzspanToStbox(s: Span): STBox {
		return wrapSTBox(F.cbuffer_tstzspan_to_stbox(this.ptr, s.ptr)) as STBox;
	}

	/** MEOS: ttouches_cbuffer_tcbuffer */
	ttouches(temp: TCbuffer): Temporal | null {
		return wrapTemporalOrNull(F.ttouches_cbuffer_tcbuffer(this.ptr, temp.ptr)) as Temporal | null;
	}

	/** MEOS: union_cbuffer_set */
	union(s: CbufferSet): Set | null {
		return wrapSetOrNull(F.union_cbuffer_set(this.ptr, s.ptr)) as Set | null;
	}

	/** MEOS: cbuffer_from_wkb */
	static fromEWKB(wkb: Uint8Array): Cbuffer {
		return Cbuffer.fromWKB(wkb);
	}

	/** MEOS: cbuffer_in */
	static fromEWKT(str: string): Cbuffer {
		return Cbuffer.in(str);
	}

	/** MEOS: cbuffer_from_hexwkb */
	static fromHexEWKB(hexwkb: string): Cbuffer {
		return Cbuffer.fromHexWKB(hexwkb);
	}

	/** MEOS: cbuffer_from_hexwkb */
	static fromHexWKB(hexwkb: string): Cbuffer {
		return wrapCbuffer(F.cbuffer_from_hexwkb(hexwkb)) as Cbuffer;
	}

	/** MEOS: cbuffer_in */
	static fromText(str: string): Cbuffer {
		return Cbuffer.in(str);
	}

	/** MEOS: cbuffer_from_wkb */
	static fromWKB(wkb: Uint8Array): Cbuffer {
		const _wkb = _bytes(wkb);
		try {
			return wrapCbuffer(F.cbuffer_from_wkb(_wkb, wkb.length)) as Cbuffer;
		} finally {
			_free(_wkb);
		}
	}

	/** MEOS: cbuffer_in */
	static in(str: string): Cbuffer {
		return wrapCbuffer(F.cbuffer_in(str)) as Cbuffer;
	}

	/** MEOS: cbuffer_make */
	static make(point: Geo, radius: number): Cbuffer {
		return wrapCbuffer(F.cbuffer_make(point.ptr, radius)) as Cbuffer;
	}
}

/**
 * Set of spatial values, the types MEOS's spatialset_type admits: its SRID, its bounding box and its spatial text and binary forms.
 */
export class SpatialSet extends Set {

	/** MEOS: spatialset_as_ewkb */
	asEWKB(variant: number): Uint8Array {
		return readWkb(_sizeOut => F.spatialset_as_ewkb(this.ptr, variant, _sizeOut));
	}

	/** MEOS: spatialset_as_ewkt */
	asEWKT(maxdd: number): string {
		return F.spatialset_as_ewkt(this.ptr, maxdd);
	}

	/** MEOS: spatialset_as_hexewkb */
	asHexEWKB(variant: number): string {
		return F.spatialset_as_hexewkb(this.ptr, variant);
	}

	/** MEOS: spatialset_as_text */
	asText(maxdd: number): string {
		return F.spatialset_as_text(this.ptr, maxdd);
	}

	/** MEOS: spatialset_out */
	out(maxdd: number): string {
		return F.spatialset_out(this.ptr, maxdd);
	}

	/** MEOS: spatialset_set_srid */
	setSRID(srid: number): Set {
		return wrapSet(F.spatialset_set_srid(this.ptr, srid)) as Set;
	}

	/** MEOS: spatialset_srid */
	SRID(): number {
		return F.spatialset_srid(this.ptr);
	}

	/** MEOS: spatialset_to_stbox */
	toStbox(): STBox {
		return wrapSTBox(F.spatialset_to_stbox(this.ptr)) as STBox;
	}

	/** MEOS: spatialset_transform */
	transform(srid: number): Set | null {
		return wrapSetOrNull(F.spatialset_transform(this.ptr, srid)) as Set | null;
	}

	/** MEOS: spatialset_transform_pipeline */
	transformPipeline(pipelinestr: string, srid: number, is_forward: boolean): Set | null {
		return wrapSetOrNull(F.spatialset_transform_pipeline(this.ptr, pipelinestr, srid, is_forward)) as Set | null;
	}
}

/**
 * The CbufferSet class of the MEOS object model.
 */
export class CbufferSet extends SpatialSet {

	/** The text MEOS writes this value as (MEOS: spatialset_as_text). */
	override toString(): string {
		return this.asText(15);
	}

	/** MEOS: contains_set_cbuffer */
	private _contains_set_cbuffer(cb: Cbuffer): boolean {
		return F.contains_set_cbuffer(this.ptr, cb.ptr);
	}

	/** MEOS: intersection_set_cbuffer */
	private _intersection_set_cbuffer(cb: Cbuffer): Set | null {
		return wrapSetOrNull(F.intersection_set_cbuffer(this.ptr, cb.ptr)) as Set | null;
	}

	/** MEOS: minus_set_cbuffer */
	private _minus_set_cbuffer(cb: Cbuffer): Set | null {
		return wrapSetOrNull(F.minus_set_cbuffer(this.ptr, cb.ptr)) as Set | null;
	}

	/** MEOS: union_set_cbuffer */
	private _union_set_cbuffer(cb: Cbuffer): Set | null {
		return wrapSetOrNull(F.union_set_cbuffer(this.ptr, cb.ptr)) as Set | null;
	}

	/** MEOS: contains_set_cbuffer, chosen by the arguments' types */
	override contains(cb: Cbuffer | Set): boolean {
		if (cb instanceof Cbuffer) return this._contains_set_cbuffer(cb as Cbuffer);
		return super.contains(cb as Set);
	}

	/** MEOS: distance_cbufferset_cbufferset */
	distance(s2: CbufferSet): number {
		return F.distance_cbufferset_cbufferset(this.ptr, s2.ptr);
	}

	/** MEOS: cbufferset_end_value */
	endValue(): Cbuffer {
		return wrapCbuffer(F.cbufferset_end_value(this.ptr)) as Cbuffer;
	}

	/** MEOS: intersection_set_cbuffer, chosen by the arguments' types */
	override intersection(cb: Cbuffer | Set): Set | null {
		if (cb instanceof Cbuffer) return this._intersection_set_cbuffer(cb as Cbuffer);
		return super.intersection(cb as Set);
	}

	/** MEOS: minus_set_cbuffer, chosen by the arguments' types */
	override minus(cb: Cbuffer | Set): Set | null {
		if (cb instanceof Cbuffer) return this._minus_set_cbuffer(cb as Cbuffer);
		return super.minus(cb as Set);
	}

	/** MEOS: cbufferset_out */
	override out(maxdd: number): string {
		return F.cbufferset_out(this.ptr, maxdd);
	}

	/** MEOS: cbufferset_start_value */
	startValue(): Cbuffer {
		return wrapCbuffer(F.cbufferset_start_value(this.ptr)) as Cbuffer;
	}

	/** MEOS: union_set_cbuffer, chosen by the arguments' types */
	override union(cb: Cbuffer | Set): Set | null {
		if (cb instanceof Cbuffer) return this._union_set_cbuffer(cb as Cbuffer);
		return super.union(cb as Set);
	}

	/** MEOS: cbufferset_value_n */
	valueN(n: number): Cbuffer | null {
		return wrapCbufferOrNull(F.cbufferset_value_n(this.ptr, n)) as Cbuffer | null;
	}

	/** MEOS: cbufferset_values */
	values(): Cbuffer[] {
		const _count = _alloc(4);
		try {
			const _arr = F.cbufferset_values(this.ptr, _count);
			if (!_arr) return [];
			try {
				const _n = _view(_count, 4).getInt32(0, true);
				const _v = _view(_arr, _n * 8);
				const _out: Cbuffer[] = [];
				for (let _i = 0; _i < _n; _i++) _out.push(wrapCbuffer(Number(_v.getBigUint64(_i * 8, true))) as Cbuffer);
				return _out;
			} finally {
				_free(_arr);
			}
		} finally {
			_free(_count);
		}
	}

	/** MEOS: set_from_wkb */
	static fromEWKB(wkb: Uint8Array): Set {
		return Set.fromWKB(wkb);
	}

	/** MEOS: cbufferset_in */
	static fromEWKT(str: string): CbufferSet {
		return CbufferSet.in(str);
	}

	/** MEOS: set_from_hexwkb */
	static fromHexEWKB(hexwkb: string): Set {
		return Set.fromHexWKB(hexwkb);
	}

	/** MEOS: cbufferset_in */
	static fromText(str: string): CbufferSet {
		return CbufferSet.in(str);
	}

	/** MEOS: cbufferset_in */
	static in(str: string): CbufferSet {
		return wrapSet(F.cbufferset_in(str)) as CbufferSet;
	}
}

/**
 * The DateSet class of the MEOS object model.
 */
export class DateSet extends Set {

	/** The text MEOS writes this value as (MEOS: dateset_out). */
	override toString(): string {
		return this.out();
	}

	/** MEOS: contains_set_date */
	private _contains_set_date(d: DateADT): boolean {
		return F.contains_set_date(this.ptr, d);
	}

	/** MEOS: distance_dateset_dateset */
	private _distance_dateset_dateset(s2: DateSet): number {
		return F.distance_dateset_dateset(this.ptr, s2.ptr);
	}

	/** MEOS: distance_set_date */
	private _distance_set_date(d: DateADT): number {
		return F.distance_set_date(this.ptr, d);
	}

	/** MEOS: intersection_set_date */
	private _intersection_set_date(d: DateADT): Set | null {
		return wrapSetOrNull(F.intersection_set_date(this.ptr, d)) as Set | null;
	}

	/** MEOS: minus_set_date */
	private _minus_set_date(d: DateADT): Set | null {
		return wrapSetOrNull(F.minus_set_date(this.ptr, d)) as Set | null;
	}

	/** MEOS: union_set_date */
	private _union_set_date(d: DateADT): Set | null {
		return wrapSetOrNull(F.union_set_date(this.ptr, d)) as Set | null;
	}

	/** MEOS: after_set_date */
	after(d: DateADT): boolean {
		return F.after_set_date(this.ptr, d);
	}

	/** MEOS: dateset_out */
	asText(): string {
		return this.out();
	}

	/** MEOS: before_set_date */
	before(d: DateADT): boolean {
		return F.before_set_date(this.ptr, d);
	}

	/** MEOS: contains_set_date, chosen by the arguments' types */
	override contains(d: DateADT | Set): boolean {
		if (typeof d === 'number') return this._contains_set_date(d as DateADT);
		return super.contains(d as Set);
	}

	/** MEOS: distance_dateset_dateset, distance_set_date, chosen by the arguments' types */
	distance(s2: DateSet | DateADT): number {
		if (s2 instanceof DateSet) return this._distance_dateset_dateset(s2 as DateSet);
		if (typeof s2 === 'number') return this._distance_set_date(s2 as DateADT);
		throw new TypeError(`DateSet.distance: no overload takes these arguments`);
	}

	/** MEOS: dateset_end_value */
	endValue(): DateADT {
		return F.dateset_end_value(this.ptr);
	}

	/** MEOS: intersection_set_date, chosen by the arguments' types */
	override intersection(d: DateADT | Set): Set | null {
		if (typeof d === 'number') return this._intersection_set_date(d as DateADT);
		return super.intersection(d as Set);
	}

	/** MEOS: minus_set_date, chosen by the arguments' types */
	override minus(d: DateADT | Set): Set | null {
		if (typeof d === 'number') return this._minus_set_date(d as DateADT);
		return super.minus(d as Set);
	}

	/** MEOS: dateset_out */
	out(): string {
		return F.dateset_out(this.ptr);
	}

	/** MEOS: overafter_set_date */
	overafter(d: DateADT): boolean {
		return F.overafter_set_date(this.ptr, d);
	}

	/** MEOS: overbefore_set_date */
	overbefore(d: DateADT): boolean {
		return F.overbefore_set_date(this.ptr, d);
	}

	/** MEOS: after_date_set */
	rafter(d: DateADT): boolean {
		return F.after_date_set(d, this.ptr);
	}

	/** MEOS: before_date_set */
	rbefore(d: DateADT): boolean {
		return F.before_date_set(d, this.ptr);
	}

	/** MEOS: contained_date_set */
	rcontained(d: DateADT): boolean {
		return F.contained_date_set(d, this.ptr);
	}

	/** MEOS: intersection_date_set */
	rintersection(d: DateADT): Set | null {
		return wrapSetOrNull(F.intersection_date_set(d, this.ptr)) as Set | null;
	}

	/** MEOS: minus_date_set */
	rminus(d: DateADT): Set | null {
		return wrapSetOrNull(F.minus_date_set(d, this.ptr)) as Set | null;
	}

	/** MEOS: overafter_date_set */
	roverafter(d: DateADT): boolean {
		return F.overafter_date_set(d, this.ptr);
	}

	/** MEOS: overbefore_date_set */
	roverbefore(d: DateADT): boolean {
		return F.overbefore_date_set(d, this.ptr);
	}

	/** MEOS: union_date_set */
	runion(d: DateADT): Set | null {
		return wrapSetOrNull(F.union_date_set(d, this.ptr)) as Set | null;
	}

	/** MEOS: dateset_shift_scale */
	shiftScale(shift: number, width: number, hasshift: boolean, haswidth: boolean): Set {
		return wrapSet(F.dateset_shift_scale(this.ptr, shift, width, hasshift, haswidth)) as Set;
	}

	/** MEOS: dateset_start_value */
	startValue(): DateADT {
		return F.dateset_start_value(this.ptr);
	}

	/** MEOS: dateset_to_tstzset */
	toTstzset(): Set {
		return wrapSet(F.dateset_to_tstzset(this.ptr)) as Set;
	}

	/** MEOS: union_set_date, chosen by the arguments' types */
	override union(d: DateADT | Set): Set | null {
		if (typeof d === 'number') return this._union_set_date(d as DateADT);
		return super.union(d as Set);
	}

	/** MEOS: dateset_value_n */
	valueN(n: number): DateADT {
		return F.dateset_value_n(this.ptr, n);
	}

	/** MEOS: dateset_values */
	values(): DateADT[] {
		const _count = _alloc(4);
		try {
			const _arr = F.dateset_values(this.ptr, _count);
			if (!_arr) return [];
			try {
				const _n = _view(_count, 4).getInt32(0, true);
				const _v = _view(_arr, _n * 4);
				const _out: DateADT[] = [];
				for (let _i = 0; _i < _n; _i++) _out.push(_v.getInt32(_i * 4, true));
				return _out;
			} finally {
				_free(_arr);
			}
		} finally {
			_free(_count);
		}
	}

	/** MEOS: dateset_in */
	static fromText(str: string): DateSet {
		return DateSet.in(str);
	}

	/** MEOS: dateset_in */
	static in(str: string): DateSet {
		return wrapSet(F.dateset_in(str)) as DateSet;
	}

	/** MEOS: dateset_make */
	static make(values: number[]): DateSet {
		const _values = _alloc(Math.max(values.length, 1) * 4);
		{ const _v = _view(_values, Math.max(values.length, 1) * 4); values.forEach((_x, _i) => _v.setInt32(_i * 4, _x, true)); }
		try {
			return wrapSet(F.dateset_make(_values, values.length)) as DateSet;
		} finally {
			_free(_values);
		}
	}
}

/**
 * The DateSpan class of the MEOS object model.
 */
export class DateSpan extends Span {

	/** The text MEOS writes this value as (MEOS: datespan_out). */
	override toString(): string {
		return this.out();
	}

	/** MEOS: adjacent_span_date */
	private _adjacent_span_date(d: DateADT): boolean {
		return F.adjacent_span_date(this.ptr, d);
	}

	/** MEOS: contains_span_date */
	private _contains_span_date(d: DateADT): boolean {
		return F.contains_span_date(this.ptr, d);
	}

	/** MEOS: distance_datespan_datespan */
	private _distance_datespan_datespan(s2: DateSpan): number {
		return F.distance_datespan_datespan(this.ptr, s2.ptr);
	}

	/** MEOS: distance_span_date */
	private _distance_span_date(d: DateADT): number {
		return F.distance_span_date(this.ptr, d);
	}

	/** MEOS: intersection_span_date */
	private _intersection_span_date(d: DateADT): Span | null {
		return wrapSpanOrNull(F.intersection_span_date(this.ptr, d)) as Span | null;
	}

	/** MEOS: minus_span_date */
	private _minus_span_date(d: DateADT): SpanSet | null {
		return wrapSpanSetOrNull(F.minus_span_date(this.ptr, d)) as SpanSet | null;
	}

	/** MEOS: union_span_date */
	private _union_span_date(d: DateADT): SpanSet {
		return wrapSpanSet(F.union_span_date(this.ptr, d)) as SpanSet;
	}

	/** MEOS: adjacent_span_date, chosen by the arguments' types */
	override adjacent(d: DateADT | SpanSet): boolean {
		if (typeof d === 'number') return this._adjacent_span_date(d as DateADT);
		return super.adjacent(d as SpanSet);
	}

	/** MEOS: after_span_date */
	after(d: DateADT): boolean {
		return F.after_span_date(this.ptr, d);
	}

	/** MEOS: datespan_out */
	asText(): string {
		return this.out();
	}

	/** MEOS: before_span_date */
	before(d: DateADT): boolean {
		return F.before_span_date(this.ptr, d);
	}

	/** MEOS: datespan_bins */
	bins(duration: Interval, torigin: DateADT, border_inc: boolean): Span[] {
		const _duration = _putInterval(duration);
		const _count = _alloc(4);
		try {
			const _arr = F.datespan_bins(this.ptr, _duration, torigin, border_inc, _count);
			if (!_arr) return [];
			try {
				const _n = _view(_count, 4).getInt32(0, true);
				const _v = _view(_arr, _n * 24);
				const _out: Span[] = [];
				for (let _i = 0; _i < _n; _i++) _out.push(wrapSpan(_copy(_arr + _i * 24, 24)) as Span);
				return _out;
			} finally {
				_free(_arr);
			}
		} finally {
			_free(_duration);
			_free(_count);
		}
	}

	/** MEOS: contains_span_date, chosen by the arguments' types */
	override contains(d: DateADT | Span | SpanSet): boolean {
		if (typeof d === 'number') return this._contains_span_date(d as DateADT);
		return super.contains(d as Span | SpanSet);
	}

	/** MEOS: distance_datespan_datespan, distance_span_date, chosen by the arguments' types */
	distance(s2: DateSpan | DateADT): number {
		if (s2 instanceof DateSpan) return this._distance_datespan_datespan(s2 as DateSpan);
		if (typeof s2 === 'number') return this._distance_span_date(s2 as DateADT);
		throw new TypeError(`DateSpan.distance: no overload takes these arguments`);
	}

	/** MEOS: datespan_duration */
	duration(): Interval {
		return _takeInterval(F.datespan_duration(this.ptr))!;
	}

	/** MEOS: intersection_span_date, chosen by the arguments' types */
	override intersection(d: DateADT | Span | SpanSet): Span | null | SpanSet {
		if (typeof d === 'number') return this._intersection_span_date(d as DateADT);
		return super.intersection(d as Span | SpanSet);
	}

	/** MEOS: datespan_lower */
	lower(): DateADT {
		return F.datespan_lower(this.ptr);
	}

	/** MEOS: minus_span_date, chosen by the arguments' types */
	override minus(d: DateADT | Span | SpanSet): SpanSet | null {
		if (typeof d === 'number') return this._minus_span_date(d as DateADT);
		return super.minus(d as Span | SpanSet);
	}

	/** MEOS: datespan_out */
	out(): string {
		return F.datespan_out(this.ptr);
	}

	/** MEOS: overafter_span_date */
	overafter(d: DateADT): boolean {
		return F.overafter_span_date(this.ptr, d);
	}

	/** MEOS: overbefore_span_date */
	overbefore(d: DateADT): boolean {
		return F.overbefore_span_date(this.ptr, d);
	}

	/** MEOS: adjacent_date_span */
	radjacent(d: DateADT): boolean {
		return F.adjacent_date_span(d, this.ptr);
	}

	/** MEOS: after_date_span */
	rafter(d: DateADT): boolean {
		return F.after_date_span(d, this.ptr);
	}

	/** MEOS: before_date_span */
	rbefore(d: DateADT): boolean {
		return F.before_date_span(d, this.ptr);
	}

	/** MEOS: contained_date_span */
	rcontained(d: DateADT): boolean {
		return F.contained_date_span(d, this.ptr);
	}

	/** MEOS: intersection_date_span */
	rintersection(d: DateADT): Span | null {
		return wrapSpanOrNull(F.intersection_date_span(d, this.ptr)) as Span | null;
	}

	/** MEOS: minus_date_span */
	rminus(d: DateADT): SpanSet | null {
		return wrapSpanSetOrNull(F.minus_date_span(d, this.ptr)) as SpanSet | null;
	}

	/** MEOS: overafter_date_span */
	roverafter(d: DateADT): boolean {
		return F.overafter_date_span(d, this.ptr);
	}

	/** MEOS: overbefore_date_span */
	roverbefore(d: DateADT): boolean {
		return F.overbefore_date_span(d, this.ptr);
	}

	/** MEOS: union_date_span */
	runion(d: DateADT): SpanSet {
		return wrapSpanSet(F.union_date_span(d, this.ptr)) as SpanSet;
	}

	/** MEOS: datespan_shift_scale */
	shiftScale(shift: number, width: number, hasshift: boolean, haswidth: boolean): Span {
		return wrapSpan(F.datespan_shift_scale(this.ptr, shift, width, hasshift, haswidth)) as Span;
	}

	/** MEOS: datespan_to_tstzspan */
	toTstzspan(): Span {
		return wrapSpan(F.datespan_to_tstzspan(this.ptr)) as Span;
	}

	/** MEOS: union_span_date, chosen by the arguments' types */
	override union(d: DateADT | Span | SpanSet): SpanSet | null {
		if (typeof d === 'number') return this._union_span_date(d as DateADT);
		return super.union(d as Span | SpanSet);
	}

	/** MEOS: datespan_upper */
	upper(): DateADT {
		return F.datespan_upper(this.ptr);
	}

	/** MEOS: datespan_in */
	static fromText(str: string): DateSpan {
		return DateSpan.in(str);
	}

	/** MEOS: datespan_get_bin */
	static getBin(d: DateADT, duration: Interval, torigin: DateADT): Span {
		const _duration = _putInterval(duration);
		try {
			return wrapSpan(F.datespan_get_bin(d, _duration, torigin)) as Span;
		} finally {
			_free(_duration);
		}
	}

	/** MEOS: datespan_in */
	static in(str: string): DateSpan {
		return wrapSpan(F.datespan_in(str)) as DateSpan;
	}

	/** MEOS: datespan_make */
	static make(lower: DateADT, upper: DateADT, lower_inc: boolean, upper_inc: boolean): DateSpan {
		return wrapSpan(F.datespan_make(lower, upper, lower_inc, upper_inc)) as DateSpan;
	}
}

/**
 * The DateSpanSet class of the MEOS object model.
 */
export class DateSpanSet extends SpanSet {

	/** The text MEOS writes this value as (MEOS: datespanset_out). */
	override toString(): string {
		return this.out();
	}

	/** MEOS: adjacent_spanset_date */
	private _adjacent_spanset_date(d: DateADT): boolean {
		return F.adjacent_spanset_date(this.ptr, d);
	}

	/** MEOS: contains_spanset_date */
	private _contains_spanset_date(d: DateADT): boolean {
		return F.contains_spanset_date(this.ptr, d);
	}

	/** MEOS: distance_datespanset_datespan */
	private _distance_datespanset_datespan(s: DateSpan): number {
		return F.distance_datespanset_datespan(this.ptr, s.ptr);
	}

	/** MEOS: distance_datespanset_datespanset */
	private _distance_datespanset_datespanset(ss2: DateSpanSet): number {
		return F.distance_datespanset_datespanset(this.ptr, ss2.ptr);
	}

	/** MEOS: distance_spanset_date */
	private _distance_spanset_date(d: DateADT): number {
		return F.distance_spanset_date(this.ptr, d);
	}

	/** MEOS: intersection_spanset_date */
	private _intersection_spanset_date(d: DateADT): SpanSet | null {
		return wrapSpanSetOrNull(F.intersection_spanset_date(this.ptr, d)) as SpanSet | null;
	}

	/** MEOS: minus_spanset_date */
	private _minus_spanset_date(d: DateADT): SpanSet | null {
		return wrapSpanSetOrNull(F.minus_spanset_date(this.ptr, d)) as SpanSet | null;
	}

	/** MEOS: union_spanset_date */
	private _union_spanset_date(d: DateADT): SpanSet | null {
		return wrapSpanSetOrNull(F.union_spanset_date(this.ptr, d)) as SpanSet | null;
	}

	/** MEOS: adjacent_spanset_date, chosen by the arguments' types */
	override adjacent(d: DateADT | Span | SpanSet): boolean {
		if (typeof d === 'number') return this._adjacent_spanset_date(d as DateADT);
		return super.adjacent(d as Span | SpanSet);
	}

	/** MEOS: after_spanset_date */
	after(d: DateADT): boolean {
		return F.after_spanset_date(this.ptr, d);
	}

	/** MEOS: datespanset_out */
	asText(): string {
		return this.out();
	}

	/** MEOS: before_spanset_date */
	before(d: DateADT): boolean {
		return F.before_spanset_date(this.ptr, d);
	}

	/** MEOS: datespanset_bins */
	bins(duration: Interval, torigin: DateADT, border_inc: boolean): Span[] {
		const _duration = _putInterval(duration);
		const _count = _alloc(4);
		try {
			const _arr = F.datespanset_bins(this.ptr, _duration, torigin, border_inc, _count);
			if (!_arr) return [];
			try {
				const _n = _view(_count, 4).getInt32(0, true);
				const _v = _view(_arr, _n * 24);
				const _out: Span[] = [];
				for (let _i = 0; _i < _n; _i++) _out.push(wrapSpan(_copy(_arr + _i * 24, 24)) as Span);
				return _out;
			} finally {
				_free(_arr);
			}
		} finally {
			_free(_duration);
			_free(_count);
		}
	}

	/** MEOS: contains_spanset_date, chosen by the arguments' types */
	override contains(d: DateADT | Span | SpanSet): boolean {
		if (typeof d === 'number') return this._contains_spanset_date(d as DateADT);
		return super.contains(d as Span | SpanSet);
	}

	/** MEOS: datespanset_date_n */
	dateN(n: number): DateADT {
		return F.datespanset_date_n(this.ptr, n);
	}

	/** MEOS: datespanset_dates */
	dates(): Set {
		return wrapSet(F.datespanset_dates(this.ptr)) as Set;
	}

	/** MEOS: distance_datespanset_datespan, distance_datespanset_datespanset, distance_spanset_date, chosen by the arguments' types */
	distance(s: DateSpan | DateSpanSet | DateADT): number {
		if (s instanceof DateSpan) return this._distance_datespanset_datespan(s as DateSpan);
		if (s instanceof DateSpanSet) return this._distance_datespanset_datespanset(s as DateSpanSet);
		if (typeof s === 'number') return this._distance_spanset_date(s as DateADT);
		throw new TypeError(`DateSpanSet.distance: no overload takes these arguments`);
	}

	/** MEOS: datespanset_duration */
	duration(boundspan: boolean): Interval {
		return _takeInterval(F.datespanset_duration(this.ptr, boundspan))!;
	}

	/** MEOS: datespanset_end_date */
	endDate(): DateADT {
		return F.datespanset_end_date(this.ptr);
	}

	/** MEOS: intersection_spanset_date, chosen by the arguments' types */
	override intersection(d: DateADT | Span | SpanSet): SpanSet | null {
		if (typeof d === 'number') return this._intersection_spanset_date(d as DateADT);
		return super.intersection(d as Span | SpanSet);
	}

	/** MEOS: datespanset_lower */
	lower(): DateADT {
		return F.datespanset_lower(this.ptr);
	}

	/** MEOS: minus_spanset_date, chosen by the arguments' types */
	override minus(d: DateADT | Span | SpanSet): SpanSet | null {
		if (typeof d === 'number') return this._minus_spanset_date(d as DateADT);
		return super.minus(d as Span | SpanSet);
	}

	/** MEOS: datespanset_num_dates */
	numDates(): number {
		return F.datespanset_num_dates(this.ptr);
	}

	/** MEOS: datespanset_out */
	out(): string {
		return F.datespanset_out(this.ptr);
	}

	/** MEOS: overafter_spanset_date */
	overafter(d: DateADT): boolean {
		return F.overafter_spanset_date(this.ptr, d);
	}

	/** MEOS: overbefore_spanset_date */
	overbefore(d: DateADT): boolean {
		return F.overbefore_spanset_date(this.ptr, d);
	}

	/** MEOS: adjacent_date_spanset */
	radjacent(d: DateADT): boolean {
		return F.adjacent_date_spanset(d, this.ptr);
	}

	/** MEOS: after_date_spanset */
	rafter(d: DateADT): boolean {
		return F.after_date_spanset(d, this.ptr);
	}

	/** MEOS: before_date_spanset */
	rbefore(d: DateADT): boolean {
		return F.before_date_spanset(d, this.ptr);
	}

	/** MEOS: contained_date_spanset */
	rcontained(d: DateADT): boolean {
		return F.contained_date_spanset(d, this.ptr);
	}

	/** MEOS: intersection_date_spanset */
	rintersection(d: DateADT): SpanSet | null {
		return wrapSpanSetOrNull(F.intersection_date_spanset(d, this.ptr)) as SpanSet | null;
	}

	/** MEOS: minus_date_spanset */
	rminus(d: DateADT): SpanSet | null {
		return wrapSpanSetOrNull(F.minus_date_spanset(d, this.ptr)) as SpanSet | null;
	}

	/** MEOS: overafter_date_spanset */
	roverafter(d: DateADT): boolean {
		return F.overafter_date_spanset(d, this.ptr);
	}

	/** MEOS: overbefore_date_spanset */
	roverbefore(d: DateADT): boolean {
		return F.overbefore_date_spanset(d, this.ptr);
	}

	/** MEOS: union_date_spanset */
	runion(d: DateADT): SpanSet | null {
		return wrapSpanSetOrNull(F.union_date_spanset(d, this.ptr)) as SpanSet | null;
	}

	/** MEOS: datespanset_shift_scale */
	shiftScale(shift: number, width: number, hasshift: boolean, haswidth: boolean): SpanSet {
		return wrapSpanSet(F.datespanset_shift_scale(this.ptr, shift, width, hasshift, haswidth)) as SpanSet;
	}

	/** MEOS: datespanset_start_date */
	startDate(): DateADT {
		return F.datespanset_start_date(this.ptr);
	}

	/** MEOS: datespanset_to_tstzspanset */
	toTstzspanset(): SpanSet {
		return wrapSpanSet(F.datespanset_to_tstzspanset(this.ptr)) as SpanSet;
	}

	/** MEOS: union_spanset_date, chosen by the arguments' types */
	override union(d: DateADT | Span | SpanSet): SpanSet | null {
		if (typeof d === 'number') return this._union_spanset_date(d as DateADT);
		return super.union(d as Span | SpanSet);
	}

	/** MEOS: datespanset_upper */
	upper(): DateADT {
		return F.datespanset_upper(this.ptr);
	}

	/** MEOS: datespanset_in */
	static fromText(str: string): DateSpanSet {
		return DateSpanSet.in(str);
	}

	/** MEOS: datespanset_in */
	static in(str: string): DateSpanSet {
		return wrapSpanSet(F.datespanset_in(str)) as DateSpanSet;
	}
}

/**
 * The FloatSet class of the MEOS object model.
 */
export class FloatSet extends Set {

	/** The text MEOS writes this value as (MEOS: floatset_out). */
	override toString(): string {
		return this.out(15);
	}

	/** MEOS: contains_set_float */
	private _contains_set_float(d: number): boolean {
		return F.contains_set_float(this.ptr, d);
	}

	/** MEOS: distance_floatset_floatset */
	private _distance_floatset_floatset(s2: FloatSet): number {
		return F.distance_floatset_floatset(this.ptr, s2.ptr);
	}

	/** MEOS: distance_set_float */
	private _distance_set_float(d: number): number {
		return F.distance_set_float(this.ptr, d);
	}

	/** MEOS: intersection_set_float */
	private _intersection_set_float(d: number): Set | null {
		return wrapSetOrNull(F.intersection_set_float(this.ptr, d)) as Set | null;
	}

	/** MEOS: left_set_float */
	private _left_set_float(d: number): boolean {
		return F.left_set_float(this.ptr, d);
	}

	/** MEOS: minus_set_float */
	private _minus_set_float(d: number): Set | null {
		return wrapSetOrNull(F.minus_set_float(this.ptr, d)) as Set | null;
	}

	/** MEOS: overleft_set_float */
	private _overleft_set_float(d: number): boolean {
		return F.overleft_set_float(this.ptr, d);
	}

	/** MEOS: overright_set_float */
	private _overright_set_float(d: number): boolean {
		return F.overright_set_float(this.ptr, d);
	}

	/** MEOS: right_set_float */
	private _right_set_float(d: number): boolean {
		return F.right_set_float(this.ptr, d);
	}

	/** MEOS: union_set_float */
	private _union_set_float(d: number): Set | null {
		return wrapSetOrNull(F.union_set_float(this.ptr, d)) as Set | null;
	}

	/** MEOS: floatset_out */
	asText(maxdd: number): string {
		return this.out(maxdd);
	}

	/** MEOS: floatset_ceil */
	ceil(): Set {
		return wrapSet(F.floatset_ceil(this.ptr)) as Set;
	}

	/** MEOS: contains_set_float, chosen by the arguments' types */
	override contains(d: number | Set): boolean {
		if (typeof d === 'number') return this._contains_set_float(d as number);
		return super.contains(d as Set);
	}

	/** MEOS: floatset_degrees */
	degrees(normalize: boolean): Set {
		return wrapSet(F.floatset_degrees(this.ptr, normalize)) as Set;
	}

	/** MEOS: distance_floatset_floatset, distance_set_float, chosen by the arguments' types */
	distance(s2: FloatSet | number): number {
		if (s2 instanceof FloatSet) return this._distance_floatset_floatset(s2 as FloatSet);
		if (typeof s2 === 'number') return this._distance_set_float(s2 as number);
		throw new TypeError(`FloatSet.distance: no overload takes these arguments`);
	}

	/** MEOS: floatset_end_value */
	endValue(): number {
		return F.floatset_end_value(this.ptr);
	}

	/** MEOS: floatset_floor */
	floor(): Set {
		return wrapSet(F.floatset_floor(this.ptr)) as Set;
	}

	/** MEOS: intersection_set_float, chosen by the arguments' types */
	override intersection(d: number | Set): Set | null {
		if (typeof d === 'number') return this._intersection_set_float(d as number);
		return super.intersection(d as Set);
	}

	/** MEOS: left_set_float, chosen by the arguments' types */
	override left(d: number | Set): boolean {
		if (typeof d === 'number') return this._left_set_float(d as number);
		return super.left(d as Set);
	}

	/** MEOS: minus_set_float, chosen by the arguments' types */
	override minus(d: number | Set): Set | null {
		if (typeof d === 'number') return this._minus_set_float(d as number);
		return super.minus(d as Set);
	}

	/** MEOS: floatset_out */
	out(maxdd: number): string {
		return F.floatset_out(this.ptr, maxdd);
	}

	/** MEOS: overleft_set_float, chosen by the arguments' types */
	override overleft(d: number | Set): boolean {
		if (typeof d === 'number') return this._overleft_set_float(d as number);
		return super.overleft(d as Set);
	}

	/** MEOS: overright_set_float, chosen by the arguments' types */
	override overright(d: number | Set): boolean {
		if (typeof d === 'number') return this._overright_set_float(d as number);
		return super.overright(d as Set);
	}

	/** MEOS: floatset_radians */
	radians(): Set {
		return wrapSet(F.floatset_radians(this.ptr)) as Set;
	}

	/** MEOS: contained_float_set */
	rcontained(d: number): boolean {
		return F.contained_float_set(d, this.ptr);
	}

	/** MEOS: right_set_float, chosen by the arguments' types */
	override right(d: number | Set): boolean {
		if (typeof d === 'number') return this._right_set_float(d as number);
		return super.right(d as Set);
	}

	/** MEOS: intersection_float_set */
	rintersection(d: number): Set | null {
		return wrapSetOrNull(F.intersection_float_set(d, this.ptr)) as Set | null;
	}

	/** MEOS: left_float_set */
	rleft(d: number): boolean {
		return F.left_float_set(d, this.ptr);
	}

	/** MEOS: minus_float_set */
	rminus(d: number): Set | null {
		return wrapSetOrNull(F.minus_float_set(d, this.ptr)) as Set | null;
	}

	/** MEOS: overleft_float_set */
	roverleft(d: number): boolean {
		return F.overleft_float_set(d, this.ptr);
	}

	/** MEOS: overright_float_set */
	roverright(d: number): boolean {
		return F.overright_float_set(d, this.ptr);
	}

	/** MEOS: right_float_set */
	rright(d: number): boolean {
		return F.right_float_set(d, this.ptr);
	}

	/** MEOS: union_float_set */
	runion(d: number): Set | null {
		return wrapSetOrNull(F.union_float_set(d, this.ptr)) as Set | null;
	}

	/** MEOS: floatset_shift_scale */
	shiftScale(shift: number, width: number, hasshift: boolean, haswidth: boolean): Set {
		return wrapSet(F.floatset_shift_scale(this.ptr, shift, width, hasshift, haswidth)) as Set;
	}

	/** MEOS: floatset_start_value */
	startValue(): number {
		return F.floatset_start_value(this.ptr);
	}

	/** MEOS: floatset_to_intset */
	toIntset(): Set {
		return wrapSet(F.floatset_to_intset(this.ptr)) as Set;
	}

	/** MEOS: union_set_float, chosen by the arguments' types */
	override union(d: number | Set): Set | null {
		if (typeof d === 'number') return this._union_set_float(d as number);
		return super.union(d as Set);
	}

	/** MEOS: floatset_value_n */
	valueN(n: number): number {
		return F.floatset_value_n(this.ptr, n);
	}

	/** MEOS: floatset_values */
	values(): number[] {
		const _count = _alloc(4);
		try {
			const _arr = F.floatset_values(this.ptr, _count);
			if (!_arr) return [];
			try {
				const _n = _view(_count, 4).getInt32(0, true);
				const _v = _view(_arr, _n * 8);
				const _out: number[] = [];
				for (let _i = 0; _i < _n; _i++) _out.push(_v.getFloat64(_i * 8, true));
				return _out;
			} finally {
				_free(_arr);
			}
		} finally {
			_free(_count);
		}
	}

	/** MEOS: floatset_in */
	static fromText(str: string): FloatSet {
		return FloatSet.in(str);
	}

	/** MEOS: floatset_in */
	static in(str: string): FloatSet {
		return wrapSet(F.floatset_in(str)) as FloatSet;
	}

	/** MEOS: floatset_make */
	static make(values: number[]): FloatSet {
		const _values = _alloc(Math.max(values.length, 1) * 8);
		{ const _v = _view(_values, Math.max(values.length, 1) * 8); values.forEach((_x, _i) => _v.setFloat64(_i * 8, _x, true)); }
		try {
			return wrapSet(F.floatset_make(_values, values.length)) as FloatSet;
		} finally {
			_free(_values);
		}
	}
}

/**
 * The FloatSpan class of the MEOS object model.
 */
export class FloatSpan extends Span {

	/** The text MEOS writes this value as (MEOS: floatspan_out). */
	override toString(): string {
		return this.out(15);
	}

	/** MEOS: adjacent_span_float */
	private _adjacent_span_float(d: number): boolean {
		return F.adjacent_span_float(this.ptr, d);
	}

	/** MEOS: contains_span_float */
	private _contains_span_float(d: number): boolean {
		return F.contains_span_float(this.ptr, d);
	}

	/** MEOS: distance_floatspan_floatspan */
	private _distance_floatspan_floatspan(s2: FloatSpan): number {
		return F.distance_floatspan_floatspan(this.ptr, s2.ptr);
	}

	/** MEOS: distance_span_float */
	private _distance_span_float(d: number): number {
		return F.distance_span_float(this.ptr, d);
	}

	/** MEOS: intersection_span_float */
	private _intersection_span_float(d: number): Span | null {
		return wrapSpanOrNull(F.intersection_span_float(this.ptr, d)) as Span | null;
	}

	/** MEOS: left_span_float */
	private _left_span_float(d: number): boolean {
		return F.left_span_float(this.ptr, d);
	}

	/** MEOS: minus_span_float */
	private _minus_span_float(d: number): SpanSet | null {
		return wrapSpanSetOrNull(F.minus_span_float(this.ptr, d)) as SpanSet | null;
	}

	/** MEOS: overleft_span_float */
	private _overleft_span_float(d: number): boolean {
		return F.overleft_span_float(this.ptr, d);
	}

	/** MEOS: overright_span_float */
	private _overright_span_float(d: number): boolean {
		return F.overright_span_float(this.ptr, d);
	}

	/** MEOS: right_span_float */
	private _right_span_float(d: number): boolean {
		return F.right_span_float(this.ptr, d);
	}

	/** MEOS: union_span_float */
	private _union_span_float(d: number): SpanSet {
		return wrapSpanSet(F.union_span_float(this.ptr, d)) as SpanSet;
	}

	/** MEOS: adjacent_span_float, chosen by the arguments' types */
	override adjacent(d: number | SpanSet): boolean {
		if (typeof d === 'number') return this._adjacent_span_float(d as number);
		return super.adjacent(d as SpanSet);
	}

	/** MEOS: floatspan_out */
	asText(maxdd: number): string {
		return this.out(maxdd);
	}

	/** MEOS: floatspan_bins */
	bins(vsize: number, vorigin: number, border_inc: boolean): Span[] {
		const _count = _alloc(4);
		try {
			const _arr = F.floatspan_bins(this.ptr, vsize, vorigin, border_inc, _count);
			if (!_arr) return [];
			try {
				const _n = _view(_count, 4).getInt32(0, true);
				const _v = _view(_arr, _n * 24);
				const _out: Span[] = [];
				for (let _i = 0; _i < _n; _i++) _out.push(wrapSpan(_copy(_arr + _i * 24, 24)) as Span);
				return _out;
			} finally {
				_free(_arr);
			}
		} finally {
			_free(_count);
		}
	}

	/** MEOS: floatspan_ceil */
	ceil(): Span {
		return wrapSpan(F.floatspan_ceil(this.ptr)) as Span;
	}

	/** MEOS: contains_span_float, chosen by the arguments' types */
	override contains(d: number | Span | SpanSet): boolean {
		if (typeof d === 'number') return this._contains_span_float(d as number);
		return super.contains(d as Span | SpanSet);
	}

	/** MEOS: floatspan_degrees */
	degrees(normalize: boolean): Span {
		return wrapSpan(F.floatspan_degrees(this.ptr, normalize)) as Span;
	}

	/** MEOS: distance_floatspan_floatspan, distance_span_float, chosen by the arguments' types */
	distance(s2: FloatSpan | number): number {
		if (s2 instanceof FloatSpan) return this._distance_floatspan_floatspan(s2 as FloatSpan);
		if (typeof s2 === 'number') return this._distance_span_float(s2 as number);
		throw new TypeError(`FloatSpan.distance: no overload takes these arguments`);
	}

	/** MEOS: floatspan_expand */
	expand(value: number): Span | null {
		return wrapSpanOrNull(F.floatspan_expand(this.ptr, value)) as Span | null;
	}

	/** MEOS: floatspan_floor */
	floor(): Span {
		return wrapSpan(F.floatspan_floor(this.ptr)) as Span;
	}

	/** MEOS: intersection_span_float, chosen by the arguments' types */
	override intersection(d: number | Span | SpanSet): Span | null | SpanSet {
		if (typeof d === 'number') return this._intersection_span_float(d as number);
		return super.intersection(d as Span | SpanSet);
	}

	/** MEOS: left_span_float, chosen by the arguments' types */
	override left(d: number | Span | SpanSet): boolean {
		if (typeof d === 'number') return this._left_span_float(d as number);
		return super.left(d as Span | SpanSet);
	}

	/** MEOS: floatspan_lower */
	lower(): number {
		return F.floatspan_lower(this.ptr);
	}

	/** MEOS: minus_span_float, chosen by the arguments' types */
	override minus(d: number | Span | SpanSet): SpanSet | null {
		if (typeof d === 'number') return this._minus_span_float(d as number);
		return super.minus(d as Span | SpanSet);
	}

	/** MEOS: nad_floatspan_tbox */
	nad(box: TBox): number {
		return F.nad_floatspan_tbox(this.ptr, box.ptr);
	}

	/** MEOS: floatspan_out */
	out(maxdd: number): string {
		return F.floatspan_out(this.ptr, maxdd);
	}

	/** MEOS: overleft_span_float, chosen by the arguments' types */
	override overleft(d: number | Span | SpanSet): boolean {
		if (typeof d === 'number') return this._overleft_span_float(d as number);
		return super.overleft(d as Span | SpanSet);
	}

	/** MEOS: overright_span_float, chosen by the arguments' types */
	override overright(d: number | Span | SpanSet): boolean {
		if (typeof d === 'number') return this._overright_span_float(d as number);
		return super.overright(d as Span | SpanSet);
	}

	/** MEOS: floatspan_radians */
	radians(): Span {
		return wrapSpan(F.floatspan_radians(this.ptr)) as Span;
	}

	/** MEOS: adjacent_float_span */
	radjacent(d: number): boolean {
		return F.adjacent_float_span(d, this.ptr);
	}

	/** MEOS: contained_float_span */
	rcontained(d: number): boolean {
		return F.contained_float_span(d, this.ptr);
	}

	/** MEOS: right_span_float, chosen by the arguments' types */
	override right(d: number | Span | SpanSet): boolean {
		if (typeof d === 'number') return this._right_span_float(d as number);
		return super.right(d as Span | SpanSet);
	}

	/** MEOS: intersection_float_span */
	rintersection(d: number): Span | null {
		return wrapSpanOrNull(F.intersection_float_span(d, this.ptr)) as Span | null;
	}

	/** MEOS: left_float_span */
	rleft(d: number): boolean {
		return F.left_float_span(d, this.ptr);
	}

	/** MEOS: minus_float_span */
	rminus(d: number): SpanSet | null {
		return wrapSpanSetOrNull(F.minus_float_span(d, this.ptr)) as SpanSet | null;
	}

	/** MEOS: floatspan_round */
	round(maxdd: number): Span {
		return wrapSpan(F.floatspan_round(this.ptr, maxdd)) as Span;
	}

	/** MEOS: overleft_float_span */
	roverleft(d: number): boolean {
		return F.overleft_float_span(d, this.ptr);
	}

	/** MEOS: overright_float_span */
	roverright(d: number): boolean {
		return F.overright_float_span(d, this.ptr);
	}

	/** MEOS: right_float_span */
	rright(d: number): boolean {
		return F.right_float_span(d, this.ptr);
	}

	/** MEOS: union_float_span */
	runion(d: number): SpanSet {
		return wrapSpanSet(F.union_float_span(d, this.ptr)) as SpanSet;
	}

	/** MEOS: floatspan_shift_scale */
	shiftScale(shift: number, width: number, hasshift: boolean, haswidth: boolean): Span {
		return wrapSpan(F.floatspan_shift_scale(this.ptr, shift, width, hasshift, haswidth)) as Span;
	}

	/** MEOS: floatspan_to_bigintspan */
	toBigintspan(): Span {
		return wrapSpan(F.floatspan_to_bigintspan(this.ptr)) as Span;
	}

	/** MEOS: floatspan_to_intspan */
	toIntspan(): Span {
		return wrapSpan(F.floatspan_to_intspan(this.ptr)) as Span;
	}

	/** MEOS: union_span_float, chosen by the arguments' types */
	override union(d: number | Span | SpanSet): SpanSet | null {
		if (typeof d === 'number') return this._union_span_float(d as number);
		return super.union(d as Span | SpanSet);
	}

	/** MEOS: floatspan_upper */
	upper(): number {
		return F.floatspan_upper(this.ptr);
	}

	/** MEOS: floatspan_width */
	width(): number {
		return F.floatspan_width(this.ptr);
	}

	/** MEOS: floatspan_in */
	static fromText(str: string): FloatSpan {
		return FloatSpan.in(str);
	}

	/** MEOS: floatspan_get_bin */
	static getBin(value: number, vsize: number, vorigin: number): Span {
		return wrapSpan(F.floatspan_get_bin(value, vsize, vorigin)) as Span;
	}

	/** MEOS: floatspan_in */
	static in(str: string): FloatSpan {
		return wrapSpan(F.floatspan_in(str)) as FloatSpan;
	}

	/** MEOS: floatspan_make */
	static make(lower: number, upper: number, lower_inc: boolean, upper_inc: boolean): FloatSpan {
		return wrapSpan(F.floatspan_make(lower, upper, lower_inc, upper_inc)) as FloatSpan;
	}
}

/**
 * The FloatSpanSet class of the MEOS object model.
 */
export class FloatSpanSet extends SpanSet {

	/** The text MEOS writes this value as (MEOS: floatspanset_out). */
	override toString(): string {
		return this.out(15);
	}

	/** MEOS: adjacent_spanset_float */
	private _adjacent_spanset_float(d: number): boolean {
		return F.adjacent_spanset_float(this.ptr, d);
	}

	/** MEOS: contains_spanset_float */
	private _contains_spanset_float(d: number): boolean {
		return F.contains_spanset_float(this.ptr, d);
	}

	/** MEOS: distance_floatspanset_floatspan */
	private _distance_floatspanset_floatspan(s: FloatSpan): number {
		return F.distance_floatspanset_floatspan(this.ptr, s.ptr);
	}

	/** MEOS: distance_floatspanset_floatspanset */
	private _distance_floatspanset_floatspanset(ss2: FloatSpanSet): number {
		return F.distance_floatspanset_floatspanset(this.ptr, ss2.ptr);
	}

	/** MEOS: distance_spanset_float */
	private _distance_spanset_float(d: number): number {
		return F.distance_spanset_float(this.ptr, d);
	}

	/** MEOS: intersection_spanset_float */
	private _intersection_spanset_float(d: number): SpanSet | null {
		return wrapSpanSetOrNull(F.intersection_spanset_float(this.ptr, d)) as SpanSet | null;
	}

	/** MEOS: left_spanset_float */
	private _left_spanset_float(d: number): boolean {
		return F.left_spanset_float(this.ptr, d);
	}

	/** MEOS: minus_spanset_float */
	private _minus_spanset_float(d: number): SpanSet | null {
		return wrapSpanSetOrNull(F.minus_spanset_float(this.ptr, d)) as SpanSet | null;
	}

	/** MEOS: overleft_spanset_float */
	private _overleft_spanset_float(d: number): boolean {
		return F.overleft_spanset_float(this.ptr, d);
	}

	/** MEOS: overright_spanset_float */
	private _overright_spanset_float(d: number): boolean {
		return F.overright_spanset_float(this.ptr, d);
	}

	/** MEOS: right_spanset_float */
	private _right_spanset_float(d: number): boolean {
		return F.right_spanset_float(this.ptr, d);
	}

	/** MEOS: union_spanset_float */
	private _union_spanset_float(d: number): SpanSet | null {
		return wrapSpanSetOrNull(F.union_spanset_float(this.ptr, d)) as SpanSet | null;
	}

	/** MEOS: adjacent_spanset_float, chosen by the arguments' types */
	override adjacent(d: number | Span | SpanSet): boolean {
		if (typeof d === 'number') return this._adjacent_spanset_float(d as number);
		return super.adjacent(d as Span | SpanSet);
	}

	/** MEOS: floatspanset_out */
	asText(maxdd: number): string {
		return this.out(maxdd);
	}

	/** MEOS: floatspanset_bins */
	bins(vsize: number, vorigin: number, border_inc: boolean): Span[] {
		const _count = _alloc(4);
		try {
			const _arr = F.floatspanset_bins(this.ptr, vsize, vorigin, border_inc, _count);
			if (!_arr) return [];
			try {
				const _n = _view(_count, 4).getInt32(0, true);
				const _v = _view(_arr, _n * 24);
				const _out: Span[] = [];
				for (let _i = 0; _i < _n; _i++) _out.push(wrapSpan(_copy(_arr + _i * 24, 24)) as Span);
				return _out;
			} finally {
				_free(_arr);
			}
		} finally {
			_free(_count);
		}
	}

	/** MEOS: floatspanset_ceil */
	ceil(): SpanSet {
		return wrapSpanSet(F.floatspanset_ceil(this.ptr)) as SpanSet;
	}

	/** MEOS: contains_spanset_float, chosen by the arguments' types */
	override contains(d: number | Span | SpanSet): boolean {
		if (typeof d === 'number') return this._contains_spanset_float(d as number);
		return super.contains(d as Span | SpanSet);
	}

	/** MEOS: floatspanset_degrees */
	degrees(normalize: boolean): SpanSet {
		return wrapSpanSet(F.floatspanset_degrees(this.ptr, normalize)) as SpanSet;
	}

	/** MEOS: distance_floatspanset_floatspan, distance_floatspanset_floatspanset, distance_spanset_float, chosen by the arguments' types */
	distance(s: FloatSpan | FloatSpanSet | number): number {
		if (s instanceof FloatSpan) return this._distance_floatspanset_floatspan(s as FloatSpan);
		if (s instanceof FloatSpanSet) return this._distance_floatspanset_floatspanset(s as FloatSpanSet);
		if (typeof s === 'number') return this._distance_spanset_float(s as number);
		throw new TypeError(`FloatSpanSet.distance: no overload takes these arguments`);
	}

	/** MEOS: floatspanset_floor */
	floor(): SpanSet {
		return wrapSpanSet(F.floatspanset_floor(this.ptr)) as SpanSet;
	}

	/** MEOS: intersection_spanset_float, chosen by the arguments' types */
	override intersection(d: number | Span | SpanSet): SpanSet | null {
		if (typeof d === 'number') return this._intersection_spanset_float(d as number);
		return super.intersection(d as Span | SpanSet);
	}

	/** MEOS: left_spanset_float, chosen by the arguments' types */
	override left(d: number | Span | SpanSet): boolean {
		if (typeof d === 'number') return this._left_spanset_float(d as number);
		return super.left(d as Span | SpanSet);
	}

	/** MEOS: floatspanset_lower */
	lower(): number {
		return F.floatspanset_lower(this.ptr);
	}

	/** MEOS: minus_spanset_float, chosen by the arguments' types */
	override minus(d: number | Span | SpanSet): SpanSet | null {
		if (typeof d === 'number') return this._minus_spanset_float(d as number);
		return super.minus(d as Span | SpanSet);
	}

	/** MEOS: floatspanset_out */
	out(maxdd: number): string {
		return F.floatspanset_out(this.ptr, maxdd);
	}

	/** MEOS: overleft_spanset_float, chosen by the arguments' types */
	override overleft(d: number | Span | SpanSet): boolean {
		if (typeof d === 'number') return this._overleft_spanset_float(d as number);
		return super.overleft(d as Span | SpanSet);
	}

	/** MEOS: overright_spanset_float, chosen by the arguments' types */
	override overright(d: number | Span | SpanSet): boolean {
		if (typeof d === 'number') return this._overright_spanset_float(d as number);
		return super.overright(d as Span | SpanSet);
	}

	/** MEOS: floatspanset_radians */
	radians(): SpanSet {
		return wrapSpanSet(F.floatspanset_radians(this.ptr)) as SpanSet;
	}

	/** MEOS: adjacent_float_spanset */
	radjacent(d: number): boolean {
		return F.adjacent_float_spanset(d, this.ptr);
	}

	/** MEOS: contained_float_spanset */
	rcontained(d: number): boolean {
		return F.contained_float_spanset(d, this.ptr);
	}

	/** MEOS: right_spanset_float, chosen by the arguments' types */
	override right(d: number | Span | SpanSet): boolean {
		if (typeof d === 'number') return this._right_spanset_float(d as number);
		return super.right(d as Span | SpanSet);
	}

	/** MEOS: intersection_float_spanset */
	rintersection(d: number): SpanSet | null {
		return wrapSpanSetOrNull(F.intersection_float_spanset(d, this.ptr)) as SpanSet | null;
	}

	/** MEOS: left_float_spanset */
	rleft(d: number): boolean {
		return F.left_float_spanset(d, this.ptr);
	}

	/** MEOS: minus_float_spanset */
	rminus(d: number): SpanSet | null {
		return wrapSpanSetOrNull(F.minus_float_spanset(d, this.ptr)) as SpanSet | null;
	}

	/** MEOS: floatspanset_round */
	round(maxdd: number): SpanSet {
		return wrapSpanSet(F.floatspanset_round(this.ptr, maxdd)) as SpanSet;
	}

	/** MEOS: overleft_float_spanset */
	roverleft(d: number): boolean {
		return F.overleft_float_spanset(d, this.ptr);
	}

	/** MEOS: overright_float_spanset */
	roverright(d: number): boolean {
		return F.overright_float_spanset(d, this.ptr);
	}

	/** MEOS: right_float_spanset */
	rright(d: number): boolean {
		return F.right_float_spanset(d, this.ptr);
	}

	/** MEOS: union_float_spanset */
	runion(d: number): SpanSet | null {
		return wrapSpanSetOrNull(F.union_float_spanset(d, this.ptr)) as SpanSet | null;
	}

	/** MEOS: floatspanset_shift_scale */
	shiftScale(shift: number, width: number, hasshift: boolean, haswidth: boolean): SpanSet {
		return wrapSpanSet(F.floatspanset_shift_scale(this.ptr, shift, width, hasshift, haswidth)) as SpanSet;
	}

	/** MEOS: floatspanset_to_intspanset */
	toIntspanset(): SpanSet {
		return wrapSpanSet(F.floatspanset_to_intspanset(this.ptr)) as SpanSet;
	}

	/** MEOS: union_spanset_float, chosen by the arguments' types */
	override union(d: number | Span | SpanSet): SpanSet | null {
		if (typeof d === 'number') return this._union_spanset_float(d as number);
		return super.union(d as Span | SpanSet);
	}

	/** MEOS: floatspanset_upper */
	upper(): number {
		return F.floatspanset_upper(this.ptr);
	}

	/** MEOS: floatspanset_width */
	width(boundspan: boolean): number {
		return F.floatspanset_width(this.ptr, boundspan);
	}

	/** MEOS: floatspanset_in */
	static fromText(str: string): FloatSpanSet {
		return FloatSpanSet.in(str);
	}

	/** MEOS: floatspanset_in */
	static in(str: string): FloatSpanSet {
		return wrapSpanSet(F.floatspanset_in(str)) as FloatSpanSet;
	}
}

/**
 * PostGIS-derived values, both of them a GSERIALIZED. Parent of Geometry and Geography exactly as TGeo parents TGeometry and TGeography, so a signature naming the C type alone is typed by the parent and the two spellings stay distinct classes.
 */
export class Geo extends Value {

	/** The text MEOS writes this value as (MEOS: geo_as_text). */
	override toString(): string {
		return this.asText(15);
	}

	/** MEOS: adisjoint_geo_tgeo */
	adisjoint(temp: TGeo): number {
		return F.adisjoint_geo_tgeo(this.ptr, temp.ptr);
	}

	/** MEOS: geo_affine */
	affine(a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, xoff: number, yoff: number, zoff: number): Geo {
		return wrapGeo(F.geo_affine(this.ptr, a, b, c, d, e, f, g, h, i, xoff, yoff, zoff)) as Geo;
	}

	/** MEOS: aintersects_geo_tgeo */
	aintersects(temp: TGeo): number {
		return F.aintersects_geo_tgeo(this.ptr, temp.ptr);
	}

	/** MEOS: always_eq_geo_tgeo */
	alwaysEq(temp: TGeo): number {
		return F.always_eq_geo_tgeo(this.ptr, temp.ptr);
	}

	/** MEOS: always_ne_geo_tgeo */
	alwaysNe(temp: TGeo): number {
		return F.always_ne_geo_tgeo(this.ptr, temp.ptr);
	}

	/** MEOS: geo_area */
	area(spheroid: boolean): number {
		return F.geo_area(this.ptr, spheroid);
	}

	/** MEOS: geo_as_ewkb */
	asEWKB(endian: string): Uint8Array {
		return readWkb(_sizeOut => F.geo_as_ewkb(this.ptr, endian, _sizeOut));
	}

	/** MEOS: geo_as_ewkt */
	asEWKT(precision: number): string {
		return F.geo_as_ewkt(this.ptr, precision);
	}

	/** MEOS: geo_as_geojson */
	asGeoJSON(option: number, precision: number, srs: string): string {
		return F.geo_as_geojson(this.ptr, option, precision, srs);
	}

	/** MEOS: geo_as_hexewkb */
	asHexEWKB(endian: string): string {
		return F.geo_as_hexewkb(this.ptr, endian);
	}

	/** MEOS: geo_as_text */
	asText(precision: number): string {
		return F.geo_as_text(this.ptr, precision);
	}

	/** MEOS: geo_centroid */
	centroid(spheroid: boolean): Geo | null {
		return wrapGeoOrNull(F.geo_centroid(this.ptr, spheroid)) as Geo | null;
	}

	/** MEOS: contained_geo_set */
	contained(s: GeoSet): boolean {
		return F.contained_geo_set(this.ptr, s.ptr);
	}

	/** MEOS: geo_copy */
	copy(): Geo {
		return wrapGeo(F.geo_copy(this.ptr)) as Geo;
	}

	/** MEOS: geo_distance */
	distance(gs2: Geo, spheroid: boolean): number {
		return F.geo_distance(this.ptr, gs2.ptr, spheroid);
	}

	/** MEOS: edisjoint_geo_tgeo */
	edisjoint(temp: TGeo): number {
		return F.edisjoint_geo_tgeo(this.ptr, temp.ptr);
	}

	/** MEOS: edwithin_geo_tgeo */
	edwithin(temp: TSpatial, dist: number, spheroid: boolean): number {
		return F.edwithin_geo_tgeo(this.ptr, temp.ptr, dist, spheroid);
	}

	/** MEOS: eintersects_geo_tgeo */
	eintersects(temp: TSpatial): number {
		return F.eintersects_geo_tgeo(this.ptr, temp.ptr);
	}

	/** MEOS: geo_equals */
	equals(gs2: Geo): number {
		return F.geo_equals(this.ptr, gs2.ptr);
	}

	/** MEOS: ever_eq_geo_tgeo */
	everEq(temp: TGeo): number {
		return F.ever_eq_geo_tgeo(this.ptr, temp.ptr);
	}

	/** MEOS: ever_ne_geo_tgeo */
	everNe(temp: TGeo): number {
		return F.ever_ne_geo_tgeo(this.ptr, temp.ptr);
	}

	/** MEOS: geo_geo_n */
	geoN(n: number): Geo | null {
		return wrapGeoOrNull(F.geo_geo_n(this.ptr, n)) as Geo | null;
	}

	/** MEOS: intersection_geo_set */
	intersection(s: GeoSet): Set | null {
		return wrapSetOrNull(F.intersection_geo_set(this.ptr, s.ptr)) as Set | null;
	}

	/** MEOS: geo_is_empty */
	isEmpty(): boolean {
		return F.geo_is_empty(this.ptr);
	}

	/** MEOS: geo_is_unitary */
	isUnitary(): boolean {
		return F.geo_is_unitary(this.ptr);
	}

	/** MEOS: geo_length */
	length(spheroid: boolean): number {
		return F.geo_length(this.ptr, spheroid);
	}

	/** MEOS: geo_mem_size */
	memSize(): number {
		return F.geo_mem_size(this.ptr);
	}

	/** MEOS: minus_geo_set */
	minus(s: GeoSet): Set | null {
		return wrapSetOrNull(F.minus_geo_set(this.ptr, s.ptr)) as Set | null;
	}

	/** MEOS: geo_num_geos */
	numGeos(): number {
		return F.geo_num_geos(this.ptr);
	}

	/** MEOS: geo_num_points */
	numPoints(): number {
		return F.geo_num_points(this.ptr);
	}

	/** MEOS: geo_out */
	out(): string {
		return F.geo_out(this.ptr);
	}

	/** MEOS: geo_perimeter */
	perimeter(spheroid: boolean): number {
		return F.geo_perimeter(this.ptr, spheroid);
	}

	/** MEOS: geo_pointarr */
	pointarr(): Geo[] {
		const _count = _alloc(4);
		try {
			const _arr = F.geo_pointarr(this.ptr, _count);
			if (!_arr) return [];
			try {
				const _n = _view(_count, 4).getInt32(0, true);
				const _v = _view(_arr, _n * 8);
				const _out: Geo[] = [];
				for (let _i = 0; _i < _n; _i++) _out.push(wrapGeo(Number(_v.getBigUint64(_i * 8, true))) as Geo);
				return _out;
			} finally {
				_free(_arr);
			}
		} finally {
			_free(_count);
		}
	}

	/** MEOS: geo_points */
	points(): Geo {
		return wrapGeo(F.geo_points(this.ptr)) as Geo;
	}

	/** MEOS: geo_reverse */
	reverse(): Geo | null {
		return wrapGeoOrNull(F.geo_reverse(this.ptr)) as Geo | null;
	}

	/** MEOS: geo_rotate */
	rotate(angle: number, x0: number, y0: number): Geo {
		return wrapGeo(F.geo_rotate(this.ptr, angle, x0, y0)) as Geo;
	}

	/** MEOS: geo_rotate_geo */
	rotateGeo(angle: number, origin: Geo): Geo {
		return wrapGeo(F.geo_rotate_geo(this.ptr, angle, origin.ptr)) as Geo;
	}

	/** MEOS: geo_rotate_x */
	rotateX(angle: number): Geo {
		return wrapGeo(F.geo_rotate_x(this.ptr, angle)) as Geo;
	}

	/** MEOS: geo_rotate_y */
	rotateY(angle: number): Geo {
		return wrapGeo(F.geo_rotate_y(this.ptr, angle)) as Geo;
	}

	/** MEOS: geo_rotate_z */
	rotateZ(angle: number): Geo {
		return wrapGeo(F.geo_rotate_z(this.ptr, angle)) as Geo;
	}

	/** MEOS: geo_round */
	round(maxdd: number): Geo {
		return wrapGeo(F.geo_round(this.ptr, maxdd)) as Geo;
	}

	/** MEOS: geo_same */
	same(gs2: Geo): boolean {
		return F.geo_same(this.ptr, gs2.ptr);
	}

	/** MEOS: geo_scale */
	scale(xfactor: number, yfactor: number, zfactor: number): Geo {
		return wrapGeo(F.geo_scale(this.ptr, xfactor, yfactor, zfactor)) as Geo;
	}

	/** MEOS: geo_scale_geo */
	scaleGeo(scale: Geo): Geo | null {
		return wrapGeoOrNull(F.geo_scale_geo(this.ptr, scale.ptr)) as Geo | null;
	}

	/** MEOS: geo_scale_geo_origin */
	scaleGeoOrigin(scale: Geo, sorigin: Geo): Geo | null {
		return wrapGeoOrNull(F.geo_scale_geo_origin(this.ptr, scale.ptr, sorigin.ptr)) as Geo | null;
	}

	/** MEOS: geo_segmentize */
	segmentize(max_seg_length: number): Geo | null {
		return wrapGeoOrNull(F.geo_segmentize(this.ptr, max_seg_length)) as Geo | null;
	}

	/** MEOS: geo_set_srid */
	setSRID(srid: number): Geo {
		return wrapGeo(F.geo_set_srid(this.ptr, srid)) as Geo;
	}

	/** MEOS: geo_shortestline */
	shortestline(gs2: Geo, spheroid: boolean): Geo | null {
		return wrapGeoOrNull(F.geo_shortestline(this.ptr, gs2.ptr, spheroid)) as Geo | null;
	}

	/** MEOS: geo_split_each_n_stboxes */
	splitEachNStboxes(elem_count: number): STBox[] {
		const _count = _alloc(4);
		try {
			const _arr = F.geo_split_each_n_stboxes(this.ptr, elem_count, _count);
			if (!_arr) return [];
			try {
				const _n = _view(_count, 4).getInt32(0, true);
				const _v = _view(_arr, _n * 80);
				const _out: STBox[] = [];
				for (let _i = 0; _i < _n; _i++) _out.push(wrapSTBox(_copy(_arr + _i * 80, 80)) as STBox);
				return _out;
			} finally {
				_free(_arr);
			}
		} finally {
			_free(_count);
		}
	}

	/** MEOS: geo_split_n_stboxes */
	splitNStboxes(box_count: number): STBox[] {
		const _count = _alloc(4);
		try {
			const _arr = F.geo_split_n_stboxes(this.ptr, box_count, _count);
			if (!_arr) return [];
			try {
				const _n = _view(_count, 4).getInt32(0, true);
				const _v = _view(_arr, _n * 80);
				const _out: STBox[] = [];
				for (let _i = 0; _i < _n; _i++) _out.push(wrapSTBox(_copy(_arr + _i * 80, 80)) as STBox);
				return _out;
			} finally {
				_free(_arr);
			}
		} finally {
			_free(_count);
		}
	}

	/** MEOS: geo_srid */
	SRID(): number {
		return F.geo_srid(this.ptr);
	}

	/** MEOS: geo_stboxes */
	stboxes(): STBox[] {
		const _count = _alloc(4);
		try {
			const _arr = F.geo_stboxes(this.ptr, _count);
			if (!_arr) return [];
			try {
				const _n = _view(_count, 4).getInt32(0, true);
				const _v = _view(_arr, _n * 80);
				const _out: STBox[] = [];
				for (let _i = 0; _i < _n; _i++) _out.push(wrapSTBox(_copy(_arr + _i * 80, 80)) as STBox);
				return _out;
			} finally {
				_free(_arr);
			}
		} finally {
			_free(_count);
		}
	}

	/** MEOS: tdisjoint_geo_tgeo */
	tdisjoint(temp: TGeo): Temporal | null {
		return wrapTemporalOrNull(F.tdisjoint_geo_tgeo(this.ptr, temp.ptr)) as Temporal | null;
	}

	/** MEOS: tdwithin_geo_tgeo */
	tdwithin(temp: TGeo, dist: number, spheroid: boolean): Temporal | null {
		return wrapTemporalOrNull(F.tdwithin_geo_tgeo(this.ptr, temp.ptr, dist, spheroid)) as Temporal | null;
	}

	/** MEOS: teq_geo_tgeo */
	teq(temp: TGeo): Temporal | null {
		return wrapTemporalOrNull(F.teq_geo_tgeo(this.ptr, temp.ptr)) as Temporal | null;
	}

	/** MEOS: geo_timestamptz_to_stbox */
	timestamptzToStbox(t: TimestampTz): STBox | null {
		return wrapSTBoxOrNull(F.geo_timestamptz_to_stbox(this.ptr, t)) as STBox | null;
	}

	/** MEOS: tintersects_geo_tgeo */
	tintersects(temp: TGeo): Temporal | null {
		return wrapTemporalOrNull(F.tintersects_geo_tgeo(this.ptr, temp.ptr)) as Temporal | null;
	}

	/** MEOS: tne_geo_tgeo */
	tne(temp: TGeo): Temporal | null {
		return wrapTemporalOrNull(F.tne_geo_tgeo(this.ptr, temp.ptr)) as Temporal | null;
	}

	/** MEOS: geo_to_h3index_cell */
	toH3indexCell(resolution: number): H3Index {
		return F.geo_to_h3index_cell(this.ptr, resolution);
	}

	/** MEOS: geo_to_h3index_set */
	toH3indexSet(resolution: number): Set | null {
		return wrapSetOrNull(F.geo_to_h3index_set(this.ptr, resolution)) as Set | null;
	}

	/** MEOS: geo_to_quadbin_cell */
	toQuadbinCell(resolution: number): Quadbin {
		return F.geo_to_quadbin_cell(this.ptr, resolution);
	}

	/** MEOS: geo_to_quadbin_set */
	toQuadbinSet(resolution: number): Set | null {
		return wrapSetOrNull(F.geo_to_quadbin_set(this.ptr, resolution)) as Set | null;
	}

	/** MEOS: geo_to_s2cell_cell */
	toS2cellCell(level: number): S2CellId {
		return F.geo_to_s2cell_cell(this.ptr, level);
	}

	/** MEOS: geo_to_s2cell_set */
	toS2cellSet(level: number): Set | null {
		return wrapSetOrNull(F.geo_to_s2cell_set(this.ptr, level)) as Set | null;
	}

	/** MEOS: geo_to_set */
	toSet(): Set {
		return wrapSet(F.geo_to_set(this.ptr)) as Set;
	}

	/** MEOS: geo_to_stbox */
	toStbox(): STBox | null {
		return wrapSTBoxOrNull(F.geo_to_stbox(this.ptr)) as STBox | null;
	}

	/** MEOS: geo_transform */
	transform(srid_to: number): Geo {
		return wrapGeo(F.geo_transform(this.ptr, srid_to)) as Geo;
	}

	/** MEOS: geo_transform_pipeline */
	transformPipeline(pipelinestr: string, srid: number, is_forward: boolean): Geo {
		return wrapGeo(F.geo_transform_pipeline(this.ptr, pipelinestr, srid, is_forward)) as Geo;
	}

	/** MEOS: geo_translate */
	translate(deltax: number, deltay: number, deltaz: number): Geo {
		return wrapGeo(F.geo_translate(this.ptr, deltax, deltay, deltaz)) as Geo;
	}

	/** MEOS: geo_transscale */
	transscale(deltax: number, deltay: number, xfactor: number, yfactor: number): Geo {
		return wrapGeo(F.geo_transscale(this.ptr, deltax, deltay, xfactor, yfactor)) as Geo;
	}

	/** MEOS: geo_tstzspan_to_stbox */
	tstzspanToStbox(s: Span): STBox | null {
		return wrapSTBoxOrNull(F.geo_tstzspan_to_stbox(this.ptr, s.ptr)) as STBox | null;
	}

	/** MEOS: union_geo_set */
	union(s: GeoSet): Set | null {
		return wrapSetOrNull(F.union_geo_set(this.ptr, s.ptr)) as Set | null;
	}

	/** MEOS: geo_cluster_dbscan */
	static clusterDbscan(geoms: Geo[], tolerance: number, minpoints: number): number[] {
		const _geoms = _ptrArray(geoms.map(x => x.ptr));
		const _count = _alloc(4);
		try {
			const _arr = F.geo_cluster_dbscan(_geoms, geoms.length, tolerance, minpoints, _count);
			if (!_arr) return [];
			try {
				const _n = _view(_count, 4).getInt32(0, true);
				const _v = _view(_arr, _n * 4);
				const _out: number[] = [];
				for (let _i = 0; _i < _n; _i++) _out.push(_v.getUint32(_i * 4, true));
				return _out;
			} finally {
				_free(_arr);
			}
		} finally {
			_free(_geoms);
			_free(_count);
		}
	}

	/** MEOS: geo_cluster_intersecting */
	static clusterIntersecting(geoms: Geo[]): Geo[] {
		const _geoms = _ptrArray(geoms.map(x => x.ptr));
		const _count = _alloc(4);
		try {
			const _arr = F.geo_cluster_intersecting(_geoms, geoms.length, _count);
			if (!_arr) return [];
			try {
				const _n = _view(_count, 4).getInt32(0, true);
				const _v = _view(_arr, _n * 8);
				const _out: Geo[] = [];
				for (let _i = 0; _i < _n; _i++) _out.push(wrapGeo(Number(_v.getBigUint64(_i * 8, true))) as Geo);
				return _out;
			} finally {
				_free(_arr);
			}
		} finally {
			_free(_geoms);
			_free(_count);
		}
	}

	/** MEOS: geo_cluster_kmeans */
	static clusterKmeans(geoms: Geo[], k: number): number[] {
		const _geoms = _ptrArray(geoms.map(x => x.ptr));
		const _count = _alloc(4);
		try {
			const _arr = F.geo_cluster_kmeans(_geoms, geoms.length, k, _count);
			if (!_arr) return [];
			try {
				const _n = _view(_count, 4).getInt32(0, true);
				const _v = _view(_arr, _n * 4);
				const _out: number[] = [];
				for (let _i = 0; _i < _n; _i++) _out.push(_v.getInt32(_i * 4, true));
				return _out;
			} finally {
				_free(_arr);
			}
		} finally {
			_free(_geoms);
			_free(_count);
		}
	}

	/** MEOS: geo_cluster_within */
	static clusterWithin(geoms: Geo[], tolerance: number): Geo[] {
		const _geoms = _ptrArray(geoms.map(x => x.ptr));
		const _count = _alloc(4);
		try {
			const _arr = F.geo_cluster_within(_geoms, geoms.length, tolerance, _count);
			if (!_arr) return [];
			try {
				const _n = _view(_count, 4).getInt32(0, true);
				const _v = _view(_arr, _n * 8);
				const _out: Geo[] = [];
				for (let _i = 0; _i < _n; _i++) _out.push(wrapGeo(Number(_v.getBigUint64(_i * 8, true))) as Geo);
				return _out;
			} finally {
				_free(_arr);
			}
		} finally {
			_free(_geoms);
			_free(_count);
		}
	}

	/** MEOS: geo_collect_garray */
	static collectGarray(gsarr: Geo[]): Geo | null {
		const _gsarr = _ptrArray(gsarr.map(x => x.ptr));
		try {
			return wrapGeoOrNull(F.geo_collect_garray(_gsarr, gsarr.length)) as Geo | null;
		} finally {
			_free(_gsarr);
		}
	}

	/** MEOS: geo_from_ewkb */
	static fromEWKB(wkb: Uint8Array, srid: number): Geo {
		const _wkb = _bytes(wkb);
		try {
			return wrapGeo(F.geo_from_ewkb(_wkb, wkb.length, srid)) as Geo;
		} finally {
			_free(_wkb);
		}
	}

	/** MEOS: geo_from_geojson */
	static fromGeoJSON(geojson: string): Geo {
		return wrapGeo(F.geo_from_geojson(geojson)) as Geo;
	}

	/** MEOS: geo_from_text */
	static fromText(wkt: string, srid: number): Geo {
		return wrapGeo(F.geo_from_text(wkt, srid)) as Geo;
	}

	/** MEOS: geo_makeline_garray */
	static makelineGarray(gsarr: Geo[]): Geo | null {
		const _gsarr = _ptrArray(gsarr.map(x => x.ptr));
		try {
			return wrapGeoOrNull(F.geo_makeline_garray(_gsarr, gsarr.length)) as Geo | null;
		} finally {
			_free(_gsarr);
		}
	}

	/** MEOS: geo_typename */
	static typename(type_: number): string {
		return F.geo_typename(type_);
	}
}

/**
 * Set of geometries or geographies, the types MEOS's geoset_type admits.
 */
export class GeoSet extends SpatialSet {

	/** MEOS: contains_set_geo */
	private _contains_set_geo(gs: Geo): boolean {
		return F.contains_set_geo(this.ptr, gs.ptr);
	}

	/** MEOS: distance_geoset_geoset */
	private _distance_geoset_geoset(s2: GeoSet, spheroid: boolean): number {
		return F.distance_geoset_geoset(this.ptr, s2.ptr, spheroid);
	}

	/** MEOS: distance_set_geo */
	private _distance_set_geo(gs: Geo, spheroid: boolean): number {
		return F.distance_set_geo(this.ptr, gs.ptr, spheroid);
	}

	/** MEOS: intersection_set_geo */
	private _intersection_set_geo(gs: Geo): Set | null {
		return wrapSetOrNull(F.intersection_set_geo(this.ptr, gs.ptr)) as Set | null;
	}

	/** MEOS: minus_set_geo */
	private _minus_set_geo(gs: Geo): Set | null {
		return wrapSetOrNull(F.minus_set_geo(this.ptr, gs.ptr)) as Set | null;
	}

	/** MEOS: union_set_geo */
	private _union_set_geo(gs: Geo): Set | null {
		return wrapSetOrNull(F.union_set_geo(this.ptr, gs.ptr)) as Set | null;
	}

	/** MEOS: contains_set_geo, chosen by the arguments' types */
	override contains(gs: Geo | Set): boolean {
		if (gs instanceof Geo) return this._contains_set_geo(gs as Geo);
		return super.contains(gs as Set);
	}

	/** MEOS: distance_geoset_geoset, distance_set_geo, chosen by the arguments' types */
	distance(s2: GeoSet | Geo, spheroid: boolean): number {
		if (s2 instanceof GeoSet && typeof spheroid === 'boolean') return this._distance_geoset_geoset(s2 as GeoSet, spheroid as boolean);
		if (s2 instanceof Geo && typeof spheroid === 'boolean') return this._distance_set_geo(s2 as Geo, spheroid as boolean);
		throw new TypeError(`GeoSet.distance: no overload takes these arguments`);
	}

	/** MEOS: geoset_end_value */
	endValue(): Geo {
		return wrapGeo(F.geoset_end_value(this.ptr)) as Geo;
	}

	/** MEOS: intersection_set_geo, chosen by the arguments' types */
	override intersection(gs: Geo | Set): Set | null {
		if (gs instanceof Geo) return this._intersection_set_geo(gs as Geo);
		return super.intersection(gs as Set);
	}

	/** MEOS: minus_set_geo, chosen by the arguments' types */
	override minus(gs: Geo | Set): Set | null {
		if (gs instanceof Geo) return this._minus_set_geo(gs as Geo);
		return super.minus(gs as Set);
	}

	/** MEOS: geoset_start_value */
	startValue(): Geo {
		return wrapGeo(F.geoset_start_value(this.ptr)) as Geo;
	}

	/** MEOS: geoset_to_geo */
	toGeo(): Geo {
		return wrapGeo(F.geoset_to_geo(this.ptr)) as Geo;
	}

	/** MEOS: union_set_geo, chosen by the arguments' types */
	override union(gs: Geo | Set): Set | null {
		if (gs instanceof Geo) return this._union_set_geo(gs as Geo);
		return super.union(gs as Set);
	}

	/** MEOS: geoset_value_n */
	valueN(n: number): Geo | null {
		return wrapGeoOrNull(F.geoset_value_n(this.ptr, n)) as Geo | null;
	}

	/** MEOS: geoset_values */
	values(): Geo[] {
		const _count = _alloc(4);
		try {
			const _arr = F.geoset_values(this.ptr, _count);
			if (!_arr) return [];
			try {
				const _n = _view(_count, 4).getInt32(0, true);
				const _v = _view(_arr, _n * 8);
				const _out: Geo[] = [];
				for (let _i = 0; _i < _n; _i++) _out.push(wrapGeo(Number(_v.getBigUint64(_i * 8, true))) as Geo);
				return _out;
			} finally {
				_free(_arr);
			}
		} finally {
			_free(_count);
		}
	}

	/** MEOS: geoset_make */
	static make(values: Geo[]): GeoSet {
		const _values = _ptrArray(values.map(x => x.ptr));
		try {
			return wrapSet(F.geoset_make(_values, values.length)) as GeoSet;
		} finally {
			_free(_values);
		}
	}
}

/**
 * The GeogSet class of the MEOS object model.
 */
export class GeogSet extends GeoSet {

	/** The text MEOS writes this value as (MEOS: spatialset_as_text). */
	override toString(): string {
		return this.asText(15);
	}

	/** MEOS: set_from_wkb */
	static fromEWKB(wkb: Uint8Array): Set {
		return Set.fromWKB(wkb);
	}

	/** MEOS: geogset_in */
	static fromEWKT(str: string): GeogSet {
		return GeogSet.in(str);
	}

	/** MEOS: set_from_hexwkb */
	static fromHexEWKB(hexwkb: string): Set {
		return Set.fromHexWKB(hexwkb);
	}

	/** MEOS: geogset_in */
	static fromText(str: string): GeogSet {
		return GeogSet.in(str);
	}

	/** MEOS: geogset_in */
	static in(str: string): GeogSet {
		return wrapSet(F.geogset_in(str)) as GeogSet;
	}
}

/**
 * The Geography class of the MEOS object model.
 */
export class Geography extends Geo {

	/** MEOS: geog_area */
	override area(use_spheroid: boolean): number {
		return F.geog_area(this.ptr, use_spheroid);
	}

	/** MEOS: geo_as_geojson */
	asMFJSON(option: number, precision: number, srs: string): string {
		return this.asGeoJSON(option, precision, srs);
	}

	/** MEOS: geog_centroid */
	override centroid(use_spheroid: boolean): Geo {
		return wrapGeo(F.geog_centroid(this.ptr, use_spheroid)) as Geo;
	}

	/** MEOS: geog_disjoint */
	disjoint(gs2: Geo, use_spheroid: boolean): boolean {
		return F.geog_disjoint(this.ptr, gs2.ptr, use_spheroid);
	}

	/** MEOS: geog_distance */
	override distance(g2: Geo, use_spheroid: boolean): number {
		return F.geog_distance(this.ptr, g2.ptr, use_spheroid);
	}

	/** MEOS: geog_dwithin */
	dwithin(g2: Geo, tolerance: number, use_spheroid: boolean): boolean {
		return F.geog_dwithin(this.ptr, g2.ptr, tolerance, use_spheroid);
	}

	/** MEOS: geog_intersects */
	intersects(gs2: Geo, use_spheroid: boolean): boolean {
		return F.geog_intersects(this.ptr, gs2.ptr, use_spheroid);
	}

	/** MEOS: geog_length */
	override length(use_spheroid: boolean): number {
		return F.geog_length(this.ptr, use_spheroid);
	}

	/** MEOS: geog_perimeter */
	override perimeter(use_spheroid: boolean): number {
		return F.geog_perimeter(this.ptr, use_spheroid);
	}

	/** MEOS: geog_shortestline */
	override shortestline(gs2: Geo, use_spheroid: boolean): Geo {
		return wrapGeo(F.geog_shortestline(this.ptr, gs2.ptr, use_spheroid)) as Geo;
	}

	/** MEOS: geog_to_geom */
	toGeom(): Geo {
		return wrapGeo(F.geog_to_geom(this.ptr)) as Geo;
	}

	/** MEOS: geog_array_union */
	static arrayUnion(gsarr: Geo[]): Geo {
		const _gsarr = _ptrArray(gsarr.map(x => x.ptr));
		try {
			return wrapGeo(F.geog_array_union(_gsarr, gsarr.length)) as Geo;
		} finally {
			_free(_gsarr);
		}
	}

	/** MEOS: geog_from_hexewkb */
	static fromHexEWKB(hexwkb: string): Geo {
		return wrapGeo(F.geog_from_hexewkb(hexwkb)) as Geo;
	}

	/** MEOS: geo_from_geojson */
	static fromMFJSON(geojson: string): Geo {
		return Geo.fromGeoJSON(geojson);
	}

	/** MEOS: geog_in */
	static in(str: string, typmod: number): Geography {
		return wrapGeo(F.geog_in(str, typmod)) as Geography;
	}
}

/**
 * The GeomSet class of the MEOS object model.
 */
export class GeomSet extends GeoSet {

	/** The text MEOS writes this value as (MEOS: spatialset_as_text). */
	override toString(): string {
		return this.asText(15);
	}

	/** MEOS: set_from_wkb */
	static fromEWKB(wkb: Uint8Array): Set {
		return Set.fromWKB(wkb);
	}

	/** MEOS: geomset_in */
	static fromEWKT(str: string): GeomSet {
		return GeomSet.in(str);
	}

	/** MEOS: set_from_hexwkb */
	static fromHexEWKB(hexwkb: string): Set {
		return Set.fromHexWKB(hexwkb);
	}

	/** MEOS: geomset_in */
	static fromText(str: string): GeomSet {
		return GeomSet.in(str);
	}

	/** MEOS: geomset_in */
	static in(str: string): GeomSet {
		return wrapSet(F.geomset_in(str)) as GeomSet;
	}
}

/**
 * The Geometry class of the MEOS object model.
 */
export class Geometry extends Geo {

	/** MEOS: acontains_geo_tcbuffer */
	private _acontains_geo_tcbuffer(temp: TCbuffer): number {
		return F.acontains_geo_tcbuffer(this.ptr, temp.ptr);
	}

	/** MEOS: acontains_geo_tgeo */
	private _acontains_geo_tgeo(temp: TGeo): number {
		return F.acontains_geo_tgeo(this.ptr, temp.ptr);
	}

	/** MEOS: acontains_geo_trgeometry */
	private _acontains_geo_trgeometry(temp: TRGeometry): number {
		return F.acontains_geo_trgeometry(this.ptr, temp.ptr);
	}

	/** MEOS: acovers_geo_tcbuffer */
	private _acovers_geo_tcbuffer(temp: TCbuffer): number {
		return F.acovers_geo_tcbuffer(this.ptr, temp.ptr);
	}

	/** MEOS: acovers_geo_tgeo */
	private _acovers_geo_tgeo(temp: TGeo): number {
		return F.acovers_geo_tgeo(this.ptr, temp.ptr);
	}

	/** MEOS: acovers_geo_trgeometry */
	private _acovers_geo_trgeometry(temp: TRGeometry): number {
		return F.acovers_geo_trgeometry(this.ptr, temp.ptr);
	}

	/** MEOS: adisjoint_geo_tcbuffer */
	private _adisjoint_geo_tcbuffer(temp: TCbuffer): number {
		return F.adisjoint_geo_tcbuffer(this.ptr, temp.ptr);
	}

	/** MEOS: adwithin_geo_tcbuffer */
	private _adwithin_geo_tcbuffer(temp: TCbuffer, dist: number): number {
		return F.adwithin_geo_tcbuffer(this.ptr, temp.ptr, dist);
	}

	/** MEOS: adwithin_geo_tgeo */
	private _adwithin_geo_tgeo(temp: TGeo, dist: number, spheroid: boolean): number {
		return F.adwithin_geo_tgeo(this.ptr, temp.ptr, dist, spheroid);
	}

	/** MEOS: aintersects_geo_tcbuffer */
	private _aintersects_geo_tcbuffer(temp: TCbuffer): number {
		return F.aintersects_geo_tcbuffer(this.ptr, temp.ptr);
	}

	/** MEOS: always_eq_geo_trgeometry */
	private _always_eq_geo_trgeometry(temp: TRGeometry): number {
		return F.always_eq_geo_trgeometry(this.ptr, temp.ptr);
	}

	/** MEOS: always_ne_geo_trgeometry */
	private _always_ne_geo_trgeometry(temp: TRGeometry): number {
		return F.always_ne_geo_trgeometry(this.ptr, temp.ptr);
	}

	/** MEOS: atouches_geo_tcbuffer */
	private _atouches_geo_tcbuffer(temp: TCbuffer): number {
		return F.atouches_geo_tcbuffer(this.ptr, temp.ptr);
	}

	/** MEOS: atouches_geo_tgeo */
	private _atouches_geo_tgeo(temp: TGeometry): number {
		return F.atouches_geo_tgeo(this.ptr, temp.ptr);
	}

	/** MEOS: atouches_geo_tpoint */
	private _atouches_geo_tpoint(temp: TGeomPoint): number {
		return F.atouches_geo_tpoint(this.ptr, temp.ptr);
	}

	/** MEOS: econtains_geo_tcbuffer */
	private _econtains_geo_tcbuffer(temp: TCbuffer): number {
		return F.econtains_geo_tcbuffer(this.ptr, temp.ptr);
	}

	/** MEOS: econtains_geo_tgeo */
	private _econtains_geo_tgeo(temp: TGeo): number {
		return F.econtains_geo_tgeo(this.ptr, temp.ptr);
	}

	/** MEOS: econtains_geo_trgeometry */
	private _econtains_geo_trgeometry(temp: TRGeometry): number {
		return F.econtains_geo_trgeometry(this.ptr, temp.ptr);
	}

	/** MEOS: ecovers_geo_tcbuffer */
	private _ecovers_geo_tcbuffer(temp: TCbuffer): number {
		return F.ecovers_geo_tcbuffer(this.ptr, temp.ptr);
	}

	/** MEOS: ecovers_geo_tgeo */
	private _ecovers_geo_tgeo(temp: TGeo): number {
		return F.ecovers_geo_tgeo(this.ptr, temp.ptr);
	}

	/** MEOS: ecovers_geo_trgeometry */
	private _ecovers_geo_trgeometry(temp: TRGeometry): number {
		return F.ecovers_geo_trgeometry(this.ptr, temp.ptr);
	}

	/** MEOS: edisjoint_geo_tcbuffer */
	private _edisjoint_geo_tcbuffer(temp: TCbuffer): number {
		return F.edisjoint_geo_tcbuffer(this.ptr, temp.ptr);
	}

	/** MEOS: edwithin_geo_tcbuffer */
	private _edwithin_geo_tcbuffer(temp: TCbuffer, dist: number): number {
		return F.edwithin_geo_tcbuffer(this.ptr, temp.ptr, dist);
	}

	/** MEOS: eintersects_geo_tcbuffer */
	private _eintersects_geo_tcbuffer(temp: TCbuffer): number {
		return F.eintersects_geo_tcbuffer(this.ptr, temp.ptr);
	}

	/** MEOS: etouches_geo_tcbuffer */
	private _etouches_geo_tcbuffer(temp: TCbuffer): number {
		return F.etouches_geo_tcbuffer(this.ptr, temp.ptr);
	}

	/** MEOS: etouches_geo_tgeo */
	private _etouches_geo_tgeo(temp: TGeometry): number {
		return F.etouches_geo_tgeo(this.ptr, temp.ptr);
	}

	/** MEOS: etouches_geo_tpoint */
	private _etouches_geo_tpoint(temp: TGeomPoint): number {
		return F.etouches_geo_tpoint(this.ptr, temp.ptr);
	}

	/** MEOS: ever_eq_geo_trgeometry */
	private _ever_eq_geo_trgeometry(temp: TRGeometry): number {
		return F.ever_eq_geo_trgeometry(this.ptr, temp.ptr);
	}

	/** MEOS: ever_ne_geo_trgeometry */
	private _ever_ne_geo_trgeometry(temp: TRGeometry): number {
		return F.ever_ne_geo_trgeometry(this.ptr, temp.ptr);
	}

	/** MEOS: tcontains_geo_tcbuffer */
	private _tcontains_geo_tcbuffer(temp: TCbuffer): Temporal | null {
		return wrapTemporalOrNull(F.tcontains_geo_tcbuffer(this.ptr, temp.ptr)) as Temporal | null;
	}

	/** MEOS: tcontains_geo_tgeo */
	private _tcontains_geo_tgeo(temp: TGeo): Temporal | null {
		return wrapTemporalOrNull(F.tcontains_geo_tgeo(this.ptr, temp.ptr)) as Temporal | null;
	}

	/** MEOS: tcovers_geo_tcbuffer */
	private _tcovers_geo_tcbuffer(temp: TCbuffer): Temporal | null {
		return wrapTemporalOrNull(F.tcovers_geo_tcbuffer(this.ptr, temp.ptr)) as Temporal | null;
	}

	/** MEOS: tcovers_geo_tgeo */
	private _tcovers_geo_tgeo(temp: TGeo): Temporal | null {
		return wrapTemporalOrNull(F.tcovers_geo_tgeo(this.ptr, temp.ptr)) as Temporal | null;
	}

	/** MEOS: tdisjoint_geo_tcbuffer */
	private _tdisjoint_geo_tcbuffer(temp: TCbuffer): Temporal | null {
		return wrapTemporalOrNull(F.tdisjoint_geo_tcbuffer(this.ptr, temp.ptr)) as Temporal | null;
	}

	/** MEOS: tdwithin_geo_tcbuffer */
	private _tdwithin_geo_tcbuffer(temp: TCbuffer, dist: number): Temporal | null {
		return wrapTemporalOrNull(F.tdwithin_geo_tcbuffer(this.ptr, temp.ptr, dist)) as Temporal | null;
	}

	/** MEOS: tdwithin_geo_trgeometry */
	private _tdwithin_geo_trgeometry(temp: TRGeometry, dist: number): Temporal | null {
		return wrapTemporalOrNull(F.tdwithin_geo_trgeometry(this.ptr, temp.ptr, dist)) as Temporal | null;
	}

	/** MEOS: teq_geo_trgeometry */
	private _teq_geo_trgeometry(temp: TRGeometry): Temporal | null {
		return wrapTemporalOrNull(F.teq_geo_trgeometry(this.ptr, temp.ptr)) as Temporal | null;
	}

	/** MEOS: tintersects_geo_tcbuffer */
	private _tintersects_geo_tcbuffer(temp: TCbuffer): Temporal | null {
		return wrapTemporalOrNull(F.tintersects_geo_tcbuffer(this.ptr, temp.ptr)) as Temporal | null;
	}

	/** MEOS: tne_geo_trgeometry */
	private _tne_geo_trgeometry(temp: TRGeometry): Temporal | null {
		return wrapTemporalOrNull(F.tne_geo_trgeometry(this.ptr, temp.ptr)) as Temporal | null;
	}

	/** MEOS: ttouches_geo_tcbuffer */
	private _ttouches_geo_tcbuffer(temp: TCbuffer): Temporal | null {
		return wrapTemporalOrNull(F.ttouches_geo_tcbuffer(this.ptr, temp.ptr)) as Temporal | null;
	}

	/** MEOS: ttouches_geo_tgeo */
	private _ttouches_geo_tgeo(temp: TGeo): Temporal | null {
		return wrapTemporalOrNull(F.ttouches_geo_tgeo(this.ptr, temp.ptr)) as Temporal | null;
	}

	/** MEOS: acontains_geo_tgeo, acontains_geo_tcbuffer, acontains_geo_trgeometry, chosen by the arguments' types */
	acontains(temp: TGeo | TCbuffer | TRGeometry): number {
		if (temp instanceof TGeo) return this._acontains_geo_tgeo(temp as TGeo);
		if (temp instanceof TCbuffer) return this._acontains_geo_tcbuffer(temp as TCbuffer);
		if (temp instanceof TRGeometry) return this._acontains_geo_trgeometry(temp as TRGeometry);
		throw new TypeError(`Geometry.acontains: no overload takes these arguments`);
	}

	/** MEOS: acovers_geo_tgeo, acovers_geo_tcbuffer, acovers_geo_trgeometry, chosen by the arguments' types */
	acovers(temp: TGeo | TCbuffer | TRGeometry): number {
		if (temp instanceof TGeo) return this._acovers_geo_tgeo(temp as TGeo);
		if (temp instanceof TCbuffer) return this._acovers_geo_tcbuffer(temp as TCbuffer);
		if (temp instanceof TRGeometry) return this._acovers_geo_trgeometry(temp as TRGeometry);
		throw new TypeError(`Geometry.acovers: no overload takes these arguments`);
	}

	/** MEOS: adisjoint_geo_tcbuffer, chosen by the arguments' types */
	override adisjoint(temp: TCbuffer | TGeo): number {
		if (temp instanceof TCbuffer) return this._adisjoint_geo_tcbuffer(temp as TCbuffer);
		return super.adisjoint(temp as TGeo);
	}

	/** MEOS: adwithin_geo_tgeo, adwithin_geo_tcbuffer, chosen by the arguments' types */
	adwithin(temp: TGeo | TCbuffer, dist: number, spheroid?: boolean): number {
		if (temp instanceof TCbuffer && typeof dist === 'number' && spheroid === undefined) return this._adwithin_geo_tcbuffer(temp as TCbuffer, dist as number);
		if (temp instanceof TGeo && typeof dist === 'number' && typeof spheroid === 'boolean') return this._adwithin_geo_tgeo(temp as TGeo, dist as number, spheroid as boolean);
		throw new TypeError(`Geometry.adwithin: no overload takes these arguments`);
	}

	/** MEOS: aintersects_geo_tcbuffer, chosen by the arguments' types */
	override aintersects(temp: TCbuffer | TGeo): number {
		if (temp instanceof TCbuffer) return this._aintersects_geo_tcbuffer(temp as TCbuffer);
		return super.aintersects(temp as TGeo);
	}

	/** MEOS: always_eq_geo_trgeometry, chosen by the arguments' types */
	override alwaysEq(temp: TRGeometry | TGeo): number {
		if (temp instanceof TRGeometry) return this._always_eq_geo_trgeometry(temp as TRGeometry);
		return super.alwaysEq(temp as TGeo);
	}

	/** MEOS: always_ne_geo_trgeometry, chosen by the arguments' types */
	override alwaysNe(temp: TRGeometry | TGeo): number {
		if (temp instanceof TRGeometry) return this._always_ne_geo_trgeometry(temp as TRGeometry);
		return super.alwaysNe(temp as TGeo);
	}

	/** MEOS: geom_area */
	override area(): number {
		return F.geom_area(this.ptr);
	}

	/** MEOS: geo_as_geojson */
	asMFJSON(option: number, precision: number, srs: string): string {
		return this.asGeoJSON(option, precision, srs);
	}

	/** MEOS: atouches_geo_tgeo, atouches_geo_tpoint, atouches_geo_tcbuffer, chosen by the arguments' types */
	atouches(temp: TGeometry | TGeomPoint | TCbuffer): number {
		if (temp instanceof TGeomPoint) return this._atouches_geo_tpoint(temp as TGeomPoint);
		if (temp instanceof TGeometry) return this._atouches_geo_tgeo(temp as TGeometry);
		if (temp instanceof TCbuffer) return this._atouches_geo_tcbuffer(temp as TCbuffer);
		throw new TypeError(`Geometry.atouches: no overload takes these arguments`);
	}

	/** MEOS: geom_azimuth */
	azimuth(gs2: Geo): number {
		return F.geom_azimuth(this.ptr, gs2.ptr);
	}

	/** MEOS: geom_boundary */
	boundary(): Geo | null {
		return wrapGeoOrNull(F.geom_boundary(this.ptr)) as Geo | null;
	}

	/** MEOS: geom_buffer */
	buffer(size: number, params: string): Geo | null {
		return wrapGeoOrNull(F.geom_buffer(this.ptr, size, params)) as Geo | null;
	}

	/** MEOS: geom_centroid */
	override centroid(): Geo {
		return wrapGeo(F.geom_centroid(this.ptr)) as Geo;
	}

	/** MEOS: geom_contains */
	contains(gs2: Geo): boolean {
		return F.geom_contains(this.ptr, gs2.ptr);
	}

	/** MEOS: geom_convex_hull */
	convexHull(): Geo | null {
		return wrapGeoOrNull(F.geom_convex_hull(this.ptr)) as Geo | null;
	}

	/** MEOS: geom_covers */
	covers(gs2: Geo): boolean {
		return F.geom_covers(this.ptr, gs2.ptr);
	}

	/** MEOS: geom_difference2d */
	difference2d(gs2: Geo): Geo | null {
		return wrapGeoOrNull(F.geom_difference2d(this.ptr, gs2.ptr)) as Geo | null;
	}

	/** MEOS: geom_disjoint */
	disjoint(gs2: Geo): boolean {
		return F.geom_disjoint(this.ptr, gs2.ptr);
	}

	/** MEOS: geom_disjoint2d */
	disjoint2d(gs2: Geo): boolean {
		return F.geom_disjoint2d(this.ptr, gs2.ptr);
	}

	/** MEOS: geom_distance */
	override distance(gs2: Geo): number {
		return F.geom_distance(this.ptr, gs2.ptr);
	}

	/** MEOS: geom_distance2d */
	distance2d(gs2: Geo): number {
		return F.geom_distance2d(this.ptr, gs2.ptr);
	}

	/** MEOS: geom_distance3d */
	distance3d(gs2: Geo): number {
		return F.geom_distance3d(this.ptr, gs2.ptr);
	}

	/** MEOS: geom_dwithin */
	dwithin(gs2: Geo, dist: number): boolean {
		return F.geom_dwithin(this.ptr, gs2.ptr, dist);
	}

	/** MEOS: geom_dwithin2d */
	dwithin2d(gs2: Geo, dist: number): boolean {
		return F.geom_dwithin2d(this.ptr, gs2.ptr, dist);
	}

	/** MEOS: geom_dwithin3d */
	dwithin3d(gs2: Geo, dist: number): boolean {
		return F.geom_dwithin3d(this.ptr, gs2.ptr, dist);
	}

	/** MEOS: econtains_geo_tgeo, econtains_geo_tcbuffer, econtains_geo_trgeometry, chosen by the arguments' types */
	econtains(temp: TGeo | TCbuffer | TRGeometry): number {
		if (temp instanceof TGeo) return this._econtains_geo_tgeo(temp as TGeo);
		if (temp instanceof TCbuffer) return this._econtains_geo_tcbuffer(temp as TCbuffer);
		if (temp instanceof TRGeometry) return this._econtains_geo_trgeometry(temp as TRGeometry);
		throw new TypeError(`Geometry.econtains: no overload takes these arguments`);
	}

	/** MEOS: ecovers_geo_tgeo, ecovers_geo_tcbuffer, ecovers_geo_trgeometry, chosen by the arguments' types */
	ecovers(temp: TGeo | TCbuffer | TRGeometry): number {
		if (temp instanceof TGeo) return this._ecovers_geo_tgeo(temp as TGeo);
		if (temp instanceof TCbuffer) return this._ecovers_geo_tcbuffer(temp as TCbuffer);
		if (temp instanceof TRGeometry) return this._ecovers_geo_trgeometry(temp as TRGeometry);
		throw new TypeError(`Geometry.ecovers: no overload takes these arguments`);
	}

	/** MEOS: edisjoint_geo_tcbuffer, chosen by the arguments' types */
	override edisjoint(temp: TCbuffer | TGeo): number {
		if (temp instanceof TCbuffer) return this._edisjoint_geo_tcbuffer(temp as TCbuffer);
		return super.edisjoint(temp as TGeo);
	}

	/** MEOS: edwithin_geo_tcbuffer, chosen by the arguments' types */
	override edwithin(temp: TCbuffer | TSpatial, dist: number, arg2?: boolean): number {
		if (temp instanceof TCbuffer && typeof dist === 'number' && arg2 === undefined) return this._edwithin_geo_tcbuffer(temp as TCbuffer, dist as number);
		return super.edwithin(temp as TSpatial, dist as number, arg2 as boolean);
	}

	/** MEOS: eintersects_geo_tcbuffer, chosen by the arguments' types */
	override eintersects(temp: TCbuffer | TSpatial): number {
		if (temp instanceof TCbuffer) return this._eintersects_geo_tcbuffer(temp as TCbuffer);
		return super.eintersects(temp as TSpatial);
	}

	/** MEOS: etouches_geo_tgeo, etouches_geo_tpoint, etouches_geo_tcbuffer, chosen by the arguments' types */
	etouches(temp: TGeometry | TGeomPoint | TCbuffer): number {
		if (temp instanceof TGeomPoint) return this._etouches_geo_tpoint(temp as TGeomPoint);
		if (temp instanceof TGeometry) return this._etouches_geo_tgeo(temp as TGeometry);
		if (temp instanceof TCbuffer) return this._etouches_geo_tcbuffer(temp as TCbuffer);
		throw new TypeError(`Geometry.etouches: no overload takes these arguments`);
	}

	/** MEOS: ever_eq_geo_trgeometry, chosen by the arguments' types */
	override everEq(temp: TRGeometry | TGeo): number {
		if (temp instanceof TRGeometry) return this._ever_eq_geo_trgeometry(temp as TRGeometry);
		return super.everEq(temp as TGeo);
	}

	/** MEOS: ever_ne_geo_trgeometry, chosen by the arguments' types */
	override everNe(temp: TRGeometry | TGeo): number {
		if (temp instanceof TRGeometry) return this._ever_ne_geo_trgeometry(temp as TRGeometry);
		return super.everNe(temp as TGeo);
	}

	/** MEOS: geom_intersection2d */
	intersection2d(gs2: Geo): Geo | null {
		return wrapGeoOrNull(F.geom_intersection2d(this.ptr, gs2.ptr)) as Geo | null;
	}

	/** MEOS: geom_intersection2d_coll */
	intersection2dColl(gs2: Geo): Geo {
		return wrapGeo(F.geom_intersection2d_coll(this.ptr, gs2.ptr)) as Geo;
	}

	/** MEOS: geom_intersects */
	intersects(gs2: Geo): boolean {
		return F.geom_intersects(this.ptr, gs2.ptr);
	}

	/** MEOS: geom_intersects2d */
	intersects2d(gs2: Geo): boolean {
		return F.geom_intersects2d(this.ptr, gs2.ptr);
	}

	/** MEOS: geom_intersects3d */
	intersects3d(gs2: Geo): boolean {
		return F.geom_intersects3d(this.ptr, gs2.ptr);
	}

	/** MEOS: geom_is_simple */
	isSimple(): boolean {
		return F.geom_is_simple(this.ptr);
	}

	/** MEOS: geom_length */
	override length(): number {
		return F.geom_length(this.ptr);
	}

	/** MEOS: geom_max_distance */
	maxDistance(gs2: Geo): number {
		return F.geom_max_distance(this.ptr, gs2.ptr);
	}

	/** MEOS: geom_max_distance2d */
	maxDistance2d(gs2: Geo): number {
		return F.geom_max_distance2d(this.ptr, gs2.ptr);
	}

	/** MEOS: geom_max_distance3d */
	maxDistance3d(gs2: Geo): number {
		return F.geom_max_distance3d(this.ptr, gs2.ptr);
	}

	/** MEOS: geom_oriented_envelope */
	orientedEnvelope(): Geo | null {
		return wrapGeoOrNull(F.geom_oriented_envelope(this.ptr)) as Geo | null;
	}

	/** MEOS: geom_perimeter */
	override perimeter(): number {
		return F.geom_perimeter(this.ptr);
	}

	/** MEOS: geom_relate */
	relate(gs2: Geo): string {
		return F.geom_relate(this.ptr, gs2.ptr);
	}

	/** MEOS: geom_relate_pattern */
	relatePattern(gs2: Geo, patt: string): boolean {
		return F.geom_relate_pattern(this.ptr, gs2.ptr, patt);
	}

	/** MEOS: geom_shortestline */
	override shortestline(gs2: Geo): Geo {
		return wrapGeo(F.geom_shortestline(this.ptr, gs2.ptr)) as Geo;
	}

	/** MEOS: geom_shortestline2d */
	shortestline2d(gs2: Geo): Geo {
		return wrapGeo(F.geom_shortestline2d(this.ptr, gs2.ptr)) as Geo;
	}

	/** MEOS: geom_shortestline3d */
	shortestline3d(gs2: Geo): Geo {
		return wrapGeo(F.geom_shortestline3d(this.ptr, gs2.ptr)) as Geo;
	}

	/** MEOS: geom_symdifference2d */
	symdifference2d(gs2: Geo): Geo | null {
		return wrapGeoOrNull(F.geom_symdifference2d(this.ptr, gs2.ptr)) as Geo | null;
	}

	/** MEOS: tcontains_geo_tgeo, tcontains_geo_tcbuffer, chosen by the arguments' types */
	tcontains(temp: TGeo | TCbuffer): Temporal | null {
		if (temp instanceof TGeo) return this._tcontains_geo_tgeo(temp as TGeo);
		if (temp instanceof TCbuffer) return this._tcontains_geo_tcbuffer(temp as TCbuffer);
		throw new TypeError(`Geometry.tcontains: no overload takes these arguments`);
	}

	/** MEOS: tcovers_geo_tgeo, tcovers_geo_tcbuffer, chosen by the arguments' types */
	tcovers(temp: TGeo | TCbuffer): Temporal | null {
		if (temp instanceof TGeo) return this._tcovers_geo_tgeo(temp as TGeo);
		if (temp instanceof TCbuffer) return this._tcovers_geo_tcbuffer(temp as TCbuffer);
		throw new TypeError(`Geometry.tcovers: no overload takes these arguments`);
	}

	/** MEOS: tdisjoint_geo_tcbuffer, chosen by the arguments' types */
	override tdisjoint(temp: TCbuffer | TGeo): Temporal | null {
		if (temp instanceof TCbuffer) return this._tdisjoint_geo_tcbuffer(temp as TCbuffer);
		return super.tdisjoint(temp as TGeo);
	}

	/** MEOS: tdwithin_geo_tcbuffer, tdwithin_geo_trgeometry, chosen by the arguments' types */
	override tdwithin(temp: TCbuffer | TRGeometry | TGeo, dist: number, arg2?: boolean): Temporal | null {
		if (temp instanceof TCbuffer && typeof dist === 'number' && arg2 === undefined) return this._tdwithin_geo_tcbuffer(temp as TCbuffer, dist as number);
		if (temp instanceof TRGeometry && typeof dist === 'number' && arg2 === undefined) return this._tdwithin_geo_trgeometry(temp as TRGeometry, dist as number);
		return super.tdwithin(temp as TGeo, dist as number, arg2 as boolean);
	}

	/** MEOS: teq_geo_trgeometry, chosen by the arguments' types */
	override teq(temp: TRGeometry | TGeo): Temporal | null {
		if (temp instanceof TRGeometry) return this._teq_geo_trgeometry(temp as TRGeometry);
		return super.teq(temp as TGeo);
	}

	/** MEOS: tintersects_geo_tcbuffer, chosen by the arguments' types */
	override tintersects(temp: TCbuffer | TGeo): Temporal | null {
		if (temp instanceof TCbuffer) return this._tintersects_geo_tcbuffer(temp as TCbuffer);
		return super.tintersects(temp as TGeo);
	}

	/** MEOS: tne_geo_trgeometry, chosen by the arguments' types */
	override tne(temp: TRGeometry | TGeo): Temporal | null {
		if (temp instanceof TRGeometry) return this._tne_geo_trgeometry(temp as TRGeometry);
		return super.tne(temp as TGeo);
	}

	/** MEOS: geom_to_cbuffer */
	toCbuffer(): Cbuffer | null {
		return wrapCbufferOrNull(F.geom_to_cbuffer(this.ptr)) as Cbuffer | null;
	}

	/** MEOS: geom_to_geog */
	toGeog(): Geo {
		return wrapGeo(F.geom_to_geog(this.ptr)) as Geo;
	}

	/** MEOS: geom_to_nsegment */
	toNsegment(): Nsegment | null {
		return wrapNsegmentOrNull(F.geom_to_nsegment(this.ptr)) as Nsegment | null;
	}

	/** MEOS: geom_touches */
	touches(gs2: Geo): boolean {
		return F.geom_touches(this.ptr, gs2.ptr);
	}

	/** MEOS: geometry_tpose_to_trgeometry */
	tposeToTrgeometry(temp: Temporal): Temporal | null {
		return wrapTemporalOrNull(F.geometry_tpose_to_trgeometry(this.ptr, temp.ptr)) as Temporal | null;
	}

	/** MEOS: ttouches_geo_tgeo, ttouches_geo_tcbuffer, chosen by the arguments' types */
	ttouches(temp: TGeo | TCbuffer): Temporal | null {
		if (temp instanceof TGeo) return this._ttouches_geo_tgeo(temp as TGeo);
		if (temp instanceof TCbuffer) return this._ttouches_geo_tcbuffer(temp as TCbuffer);
		throw new TypeError(`Geometry.ttouches: no overload takes these arguments`);
	}

	/** MEOS: geom_unary_union */
	unaryUnion(): Geo {
		return wrapGeo(F.geom_unary_union(this.ptr)) as Geo;
	}

	/** MEOS: geom_union2d */
	union2d(gs2: Geo): Geo | null {
		return wrapGeoOrNull(F.geom_union2d(this.ptr, gs2.ptr)) as Geo | null;
	}

	/** MEOS: geom_array_union */
	static arrayUnion(gsarr: Geo[]): Geo {
		const _gsarr = _ptrArray(gsarr.map(x => x.ptr));
		try {
			return wrapGeo(F.geom_array_union(_gsarr, gsarr.length)) as Geo;
		} finally {
			_free(_gsarr);
		}
	}

	/** MEOS: geom_from_hexewkb */
	static fromHexEWKB(hexwkb: string): Geo {
		return wrapGeo(F.geom_from_hexewkb(hexwkb)) as Geo;
	}

	/** MEOS: geo_from_geojson */
	static fromMFJSON(geojson: string): Geo {
		return Geo.fromGeoJSON(geojson);
	}

	/** MEOS: geom_in */
	static in(str: string, typmod: number): Geometry {
		return wrapGeo(F.geom_in(str, typmod)) as Geometry;
	}
}

/**
 * The H3IndexSet class of the MEOS object model.
 */
export class H3IndexSet extends SpatialSet {

	/** The text MEOS writes this value as (MEOS: h3indexset_out). */
	override toString(): string {
		return this.out();
	}

	/** MEOS: contains_set_h3index */
	private _contains_set_h3index(cell: H3Index): boolean {
		return F.contains_set_h3index(this.ptr, cell);
	}

	/** MEOS: intersection_set_h3index */
	private _intersection_set_h3index(cell: H3Index): Set | null {
		return wrapSetOrNull(F.intersection_set_h3index(this.ptr, cell)) as Set | null;
	}

	/** MEOS: minus_set_h3index */
	private _minus_set_h3index(cell: H3Index): Set | null {
		return wrapSetOrNull(F.minus_set_h3index(this.ptr, cell)) as Set | null;
	}

	/** MEOS: union_set_h3index */
	private _union_set_h3index(cell: H3Index): Set | null {
		return wrapSetOrNull(F.union_set_h3index(this.ptr, cell)) as Set | null;
	}

	/** MEOS: contains_set_h3index, chosen by the arguments' types */
	override contains(cell: H3Index | Set): boolean {
		if (typeof cell === 'bigint') return this._contains_set_h3index(cell as H3Index);
		return super.contains(cell as Set);
	}

	/** MEOS: h3indexset_cover_cells */
	coverCells(resolution: number): Set | null {
		return wrapSetOrNull(F.h3indexset_cover_cells(this.ptr, resolution)) as Set | null;
	}

	/** MEOS: h3indexset_end_value */
	endValue(): H3Index {
		return F.h3indexset_end_value(this.ptr);
	}

	/** MEOS: ever_eq_h3indexset_th3index */
	everEq(th3idx: TH3Index): number {
		return F.ever_eq_h3indexset_th3index(this.ptr, th3idx.ptr);
	}

	/** MEOS: h3indexset_grid_disk */
	gridDisk(k: number): Set | null {
		return wrapSetOrNull(F.h3indexset_grid_disk(this.ptr, k)) as Set | null;
	}

	/** MEOS: intersection_set_h3index, chosen by the arguments' types */
	override intersection(cell: H3Index | Set): Set | null {
		if (typeof cell === 'bigint') return this._intersection_set_h3index(cell as H3Index);
		return super.intersection(cell as Set);
	}

	/** MEOS: minus_set_h3index, chosen by the arguments' types */
	override minus(cell: H3Index | Set): Set | null {
		if (typeof cell === 'bigint') return this._minus_set_h3index(cell as H3Index);
		return super.minus(cell as Set);
	}

	/** MEOS: h3indexset_out */
	override out(): string {
		return F.h3indexset_out(this.ptr);
	}

	/** MEOS: contained_h3index_set */
	rcontained(cell: H3Index): boolean {
		return F.contained_h3index_set(cell, this.ptr);
	}

	/** MEOS: intersection_h3index_set */
	rintersection(cell: H3Index): Set | null {
		return wrapSetOrNull(F.intersection_h3index_set(cell, this.ptr)) as Set | null;
	}

	/** MEOS: minus_h3index_set */
	rminus(cell: H3Index): Set | null {
		return wrapSetOrNull(F.minus_h3index_set(cell, this.ptr)) as Set | null;
	}

	/** MEOS: union_h3index_set */
	runion(cell: H3Index): Set | null {
		return wrapSetOrNull(F.union_h3index_set(cell, this.ptr)) as Set | null;
	}

	/** MEOS: h3indexset_start_value */
	startValue(): H3Index {
		return F.h3indexset_start_value(this.ptr);
	}

	/** MEOS: union_set_h3index, chosen by the arguments' types */
	override union(cell: H3Index | Set): Set | null {
		if (typeof cell === 'bigint') return this._union_set_h3index(cell as H3Index);
		return super.union(cell as Set);
	}

	/** MEOS: h3indexset_value_n */
	valueN(n: number): H3Index {
		return F.h3indexset_value_n(this.ptr, n);
	}

	/** MEOS: h3indexset_values */
	values(): bigint[] {
		const _count = _alloc(4);
		try {
			const _arr = F.h3indexset_values(this.ptr, _count);
			if (!_arr) return [];
			try {
				const _n = _view(_count, 4).getInt32(0, true);
				const _v = _view(_arr, _n * 8);
				const _out: bigint[] = [];
				for (let _i = 0; _i < _n; _i++) _out.push(_v.getBigUint64(_i * 8, true));
				return _out;
			} finally {
				_free(_arr);
			}
		} finally {
			_free(_count);
		}
	}

	/** MEOS: set_from_wkb */
	static fromEWKB(wkb: Uint8Array): Set {
		return Set.fromWKB(wkb);
	}

	/** MEOS: h3indexset_in */
	static fromEWKT(str: string): H3IndexSet {
		return H3IndexSet.in(str);
	}

	/** MEOS: set_from_hexwkb */
	static fromHexEWKB(hexwkb: string): Set {
		return Set.fromHexWKB(hexwkb);
	}

	/** MEOS: h3indexset_in */
	static fromText(str: string): H3IndexSet {
		return H3IndexSet.in(str);
	}

	/** MEOS: h3indexset_in */
	static in(str: string): H3IndexSet {
		return wrapSet(F.h3indexset_in(str)) as H3IndexSet;
	}

	/** MEOS: h3indexset_make */
	static make(values: bigint[]): H3IndexSet {
		const _values = _alloc(Math.max(values.length, 1) * 8);
		{ const _v = _view(_values, Math.max(values.length, 1) * 8); values.forEach((_x, _i) => _v.setBigUint64(_i * 8, _x, true)); }
		try {
			return wrapSet(F.h3indexset_make(_values, values.length)) as H3IndexSet;
		} finally {
			_free(_values);
		}
	}
}

/**
 * The IntSet class of the MEOS object model.
 */
export class IntSet extends Set {

	/** The text MEOS writes this value as (MEOS: intset_out). */
	override toString(): string {
		return this.out();
	}

	/** MEOS: contains_set_int */
	private _contains_set_int(i: number): boolean {
		return F.contains_set_int(this.ptr, i);
	}

	/** MEOS: distance_intset_intset */
	private _distance_intset_intset(s2: IntSet): number {
		return F.distance_intset_intset(this.ptr, s2.ptr);
	}

	/** MEOS: distance_set_int */
	private _distance_set_int(i: number): number {
		return F.distance_set_int(this.ptr, i);
	}

	/** MEOS: intersection_set_int */
	private _intersection_set_int(i: number): Set | null {
		return wrapSetOrNull(F.intersection_set_int(this.ptr, i)) as Set | null;
	}

	/** MEOS: left_set_int */
	private _left_set_int(i: number): boolean {
		return F.left_set_int(this.ptr, i);
	}

	/** MEOS: minus_set_int */
	private _minus_set_int(i: number): Set | null {
		return wrapSetOrNull(F.minus_set_int(this.ptr, i)) as Set | null;
	}

	/** MEOS: overleft_set_int */
	private _overleft_set_int(i: number): boolean {
		return F.overleft_set_int(this.ptr, i);
	}

	/** MEOS: overright_set_int */
	private _overright_set_int(i: number): boolean {
		return F.overright_set_int(this.ptr, i);
	}

	/** MEOS: right_set_int */
	private _right_set_int(i: number): boolean {
		return F.right_set_int(this.ptr, i);
	}

	/** MEOS: union_set_int */
	private _union_set_int(i: number): Set | null {
		return wrapSetOrNull(F.union_set_int(this.ptr, i)) as Set | null;
	}

	/** MEOS: intset_out */
	asText(): string {
		return this.out();
	}

	/** MEOS: contains_set_int, chosen by the arguments' types */
	override contains(i: number | Set): boolean {
		if (typeof i === 'number') return this._contains_set_int(i as number);
		return super.contains(i as Set);
	}

	/** MEOS: distance_intset_intset, distance_set_int, chosen by the arguments' types */
	distance(s2: IntSet | number): number {
		if (s2 instanceof IntSet) return this._distance_intset_intset(s2 as IntSet);
		if (typeof s2 === 'number') return this._distance_set_int(s2 as number);
		throw new TypeError(`IntSet.distance: no overload takes these arguments`);
	}

	/** MEOS: intset_end_value */
	endValue(): number {
		return F.intset_end_value(this.ptr);
	}

	/** MEOS: intersection_set_int, chosen by the arguments' types */
	override intersection(i: number | Set): Set | null {
		if (typeof i === 'number') return this._intersection_set_int(i as number);
		return super.intersection(i as Set);
	}

	/** MEOS: left_set_int, chosen by the arguments' types */
	override left(i: number | Set): boolean {
		if (typeof i === 'number') return this._left_set_int(i as number);
		return super.left(i as Set);
	}

	/** MEOS: minus_set_int, chosen by the arguments' types */
	override minus(i: number | Set): Set | null {
		if (typeof i === 'number') return this._minus_set_int(i as number);
		return super.minus(i as Set);
	}

	/** MEOS: intset_out */
	out(): string {
		return F.intset_out(this.ptr);
	}

	/** MEOS: overleft_set_int, chosen by the arguments' types */
	override overleft(i: number | Set): boolean {
		if (typeof i === 'number') return this._overleft_set_int(i as number);
		return super.overleft(i as Set);
	}

	/** MEOS: overright_set_int, chosen by the arguments' types */
	override overright(i: number | Set): boolean {
		if (typeof i === 'number') return this._overright_set_int(i as number);
		return super.overright(i as Set);
	}

	/** MEOS: contained_int_set */
	rcontained(i: number): boolean {
		return F.contained_int_set(i, this.ptr);
	}

	/** MEOS: right_set_int, chosen by the arguments' types */
	override right(i: number | Set): boolean {
		if (typeof i === 'number') return this._right_set_int(i as number);
		return super.right(i as Set);
	}

	/** MEOS: intersection_int_set */
	rintersection(i: number): Set | null {
		return wrapSetOrNull(F.intersection_int_set(i, this.ptr)) as Set | null;
	}

	/** MEOS: left_int_set */
	rleft(i: number): boolean {
		return F.left_int_set(i, this.ptr);
	}

	/** MEOS: minus_int_set */
	rminus(i: number): Set | null {
		return wrapSetOrNull(F.minus_int_set(i, this.ptr)) as Set | null;
	}

	/** MEOS: overleft_int_set */
	roverleft(i: number): boolean {
		return F.overleft_int_set(i, this.ptr);
	}

	/** MEOS: overright_int_set */
	roverright(i: number): boolean {
		return F.overright_int_set(i, this.ptr);
	}

	/** MEOS: right_int_set */
	rright(i: number): boolean {
		return F.right_int_set(i, this.ptr);
	}

	/** MEOS: union_int_set */
	runion(i: number): Set | null {
		return wrapSetOrNull(F.union_int_set(i, this.ptr)) as Set | null;
	}

	/** MEOS: intset_shift_scale */
	shiftScale(shift: number, width: number, hasshift: boolean, haswidth: boolean): Set {
		return wrapSet(F.intset_shift_scale(this.ptr, shift, width, hasshift, haswidth)) as Set;
	}

	/** MEOS: intset_start_value */
	startValue(): number {
		return F.intset_start_value(this.ptr);
	}

	/** MEOS: intset_to_floatset */
	toFloatset(): Set {
		return wrapSet(F.intset_to_floatset(this.ptr)) as Set;
	}

	/** MEOS: union_set_int, chosen by the arguments' types */
	override union(i: number | Set): Set | null {
		if (typeof i === 'number') return this._union_set_int(i as number);
		return super.union(i as Set);
	}

	/** MEOS: intset_value_n */
	valueN(n: number): number {
		return F.intset_value_n(this.ptr, n);
	}

	/** MEOS: intset_values */
	values(): number[] {
		const _count = _alloc(4);
		try {
			const _arr = F.intset_values(this.ptr, _count);
			if (!_arr) return [];
			try {
				const _n = _view(_count, 4).getInt32(0, true);
				const _v = _view(_arr, _n * 4);
				const _out: number[] = [];
				for (let _i = 0; _i < _n; _i++) _out.push(_v.getInt32(_i * 4, true));
				return _out;
			} finally {
				_free(_arr);
			}
		} finally {
			_free(_count);
		}
	}

	/** MEOS: intset_in */
	static fromText(str: string): IntSet {
		return IntSet.in(str);
	}

	/** MEOS: intset_in */
	static in(str: string): IntSet {
		return wrapSet(F.intset_in(str)) as IntSet;
	}

	/** MEOS: intset_make */
	static make(values: number[]): IntSet {
		const _values = _alloc(Math.max(values.length, 1) * 4);
		{ const _v = _view(_values, Math.max(values.length, 1) * 4); values.forEach((_x, _i) => _v.setInt32(_i * 4, _x, true)); }
		try {
			return wrapSet(F.intset_make(_values, values.length)) as IntSet;
		} finally {
			_free(_values);
		}
	}
}

/**
 * The IntSpan class of the MEOS object model.
 */
export class IntSpan extends Span {

	/** The text MEOS writes this value as (MEOS: intspan_out). */
	override toString(): string {
		return this.out();
	}

	/** MEOS: adjacent_span_int */
	private _adjacent_span_int(i: number): boolean {
		return F.adjacent_span_int(this.ptr, i);
	}

	/** MEOS: contains_span_int */
	private _contains_span_int(i: number): boolean {
		return F.contains_span_int(this.ptr, i);
	}

	/** MEOS: distance_intspan_intspan */
	private _distance_intspan_intspan(s2: IntSpan): number {
		return F.distance_intspan_intspan(this.ptr, s2.ptr);
	}

	/** MEOS: distance_span_int */
	private _distance_span_int(i: number): number {
		return F.distance_span_int(this.ptr, i);
	}

	/** MEOS: intersection_span_int */
	private _intersection_span_int(i: number): Span | null {
		return wrapSpanOrNull(F.intersection_span_int(this.ptr, i)) as Span | null;
	}

	/** MEOS: left_span_int */
	private _left_span_int(i: number): boolean {
		return F.left_span_int(this.ptr, i);
	}

	/** MEOS: minus_span_int */
	private _minus_span_int(i: number): SpanSet | null {
		return wrapSpanSetOrNull(F.minus_span_int(this.ptr, i)) as SpanSet | null;
	}

	/** MEOS: overleft_span_int */
	private _overleft_span_int(i: number): boolean {
		return F.overleft_span_int(this.ptr, i);
	}

	/** MEOS: overright_span_int */
	private _overright_span_int(i: number): boolean {
		return F.overright_span_int(this.ptr, i);
	}

	/** MEOS: right_span_int */
	private _right_span_int(i: number): boolean {
		return F.right_span_int(this.ptr, i);
	}

	/** MEOS: union_span_int */
	private _union_span_int(i: number): SpanSet {
		return wrapSpanSet(F.union_span_int(this.ptr, i)) as SpanSet;
	}

	/** MEOS: adjacent_span_int, chosen by the arguments' types */
	override adjacent(i: number | SpanSet): boolean {
		if (typeof i === 'number') return this._adjacent_span_int(i as number);
		return super.adjacent(i as SpanSet);
	}

	/** MEOS: intspan_out */
	asText(): string {
		return this.out();
	}

	/** MEOS: intspan_bins */
	bins(vsize: number, vorigin: number, border_inc: boolean): Span[] {
		const _count = _alloc(4);
		try {
			const _arr = F.intspan_bins(this.ptr, vsize, vorigin, border_inc, _count);
			if (!_arr) return [];
			try {
				const _n = _view(_count, 4).getInt32(0, true);
				const _v = _view(_arr, _n * 24);
				const _out: Span[] = [];
				for (let _i = 0; _i < _n; _i++) _out.push(wrapSpan(_copy(_arr + _i * 24, 24)) as Span);
				return _out;
			} finally {
				_free(_arr);
			}
		} finally {
			_free(_count);
		}
	}

	/** MEOS: contains_span_int, chosen by the arguments' types */
	override contains(i: number | Span | SpanSet): boolean {
		if (typeof i === 'number') return this._contains_span_int(i as number);
		return super.contains(i as Span | SpanSet);
	}

	/** MEOS: distance_intspan_intspan, distance_span_int, chosen by the arguments' types */
	distance(s2: IntSpan | number): number {
		if (s2 instanceof IntSpan) return this._distance_intspan_intspan(s2 as IntSpan);
		if (typeof s2 === 'number') return this._distance_span_int(s2 as number);
		throw new TypeError(`IntSpan.distance: no overload takes these arguments`);
	}

	/** MEOS: intspan_expand */
	expand(value: number): Span | null {
		return wrapSpanOrNull(F.intspan_expand(this.ptr, value)) as Span | null;
	}

	/** MEOS: intersection_span_int, chosen by the arguments' types */
	override intersection(i: number | Span | SpanSet): Span | null | SpanSet {
		if (typeof i === 'number') return this._intersection_span_int(i as number);
		return super.intersection(i as Span | SpanSet);
	}

	/** MEOS: left_span_int, chosen by the arguments' types */
	override left(i: number | Span | SpanSet): boolean {
		if (typeof i === 'number') return this._left_span_int(i as number);
		return super.left(i as Span | SpanSet);
	}

	/** MEOS: intspan_lower */
	lower(): number {
		return F.intspan_lower(this.ptr);
	}

	/** MEOS: minus_span_int, chosen by the arguments' types */
	override minus(i: number | Span | SpanSet): SpanSet | null {
		if (typeof i === 'number') return this._minus_span_int(i as number);
		return super.minus(i as Span | SpanSet);
	}

	/** MEOS: nad_intspan_tbox */
	nad(box: TBox): number {
		return F.nad_intspan_tbox(this.ptr, box.ptr);
	}

	/** MEOS: intspan_out */
	out(): string {
		return F.intspan_out(this.ptr);
	}

	/** MEOS: overleft_span_int, chosen by the arguments' types */
	override overleft(i: number | Span | SpanSet): boolean {
		if (typeof i === 'number') return this._overleft_span_int(i as number);
		return super.overleft(i as Span | SpanSet);
	}

	/** MEOS: overright_span_int, chosen by the arguments' types */
	override overright(i: number | Span | SpanSet): boolean {
		if (typeof i === 'number') return this._overright_span_int(i as number);
		return super.overright(i as Span | SpanSet);
	}

	/** MEOS: adjacent_int_span */
	radjacent(i: number): boolean {
		return F.adjacent_int_span(i, this.ptr);
	}

	/** MEOS: contained_int_span */
	rcontained(i: number): boolean {
		return F.contained_int_span(i, this.ptr);
	}

	/** MEOS: right_span_int, chosen by the arguments' types */
	override right(i: number | Span | SpanSet): boolean {
		if (typeof i === 'number') return this._right_span_int(i as number);
		return super.right(i as Span | SpanSet);
	}

	/** MEOS: intersection_int_span */
	rintersection(i: number): Span | null {
		return wrapSpanOrNull(F.intersection_int_span(i, this.ptr)) as Span | null;
	}

	/** MEOS: left_int_span */
	rleft(i: number): boolean {
		return F.left_int_span(i, this.ptr);
	}

	/** MEOS: minus_int_span */
	rminus(i: number): SpanSet | null {
		return wrapSpanSetOrNull(F.minus_int_span(i, this.ptr)) as SpanSet | null;
	}

	/** MEOS: overleft_int_span */
	roverleft(i: number): boolean {
		return F.overleft_int_span(i, this.ptr);
	}

	/** MEOS: overright_int_span */
	roverright(i: number): boolean {
		return F.overright_int_span(i, this.ptr);
	}

	/** MEOS: right_int_span */
	rright(i: number): boolean {
		return F.right_int_span(i, this.ptr);
	}

	/** MEOS: union_int_span */
	runion(i: number): SpanSet {
		return wrapSpanSet(F.union_int_span(i, this.ptr)) as SpanSet;
	}

	/** MEOS: intspan_shift_scale */
	shiftScale(shift: number, width: number, hasshift: boolean, haswidth: boolean): Span {
		return wrapSpan(F.intspan_shift_scale(this.ptr, shift, width, hasshift, haswidth)) as Span;
	}

	/** MEOS: intspan_to_bigintspan */
	toBigintspan(): Span {
		return wrapSpan(F.intspan_to_bigintspan(this.ptr)) as Span;
	}

	/** MEOS: intspan_to_floatspan */
	toFloatspan(): Span {
		return wrapSpan(F.intspan_to_floatspan(this.ptr)) as Span;
	}

	/** MEOS: union_span_int, chosen by the arguments' types */
	override union(i: number | Span | SpanSet): SpanSet | null {
		if (typeof i === 'number') return this._union_span_int(i as number);
		return super.union(i as Span | SpanSet);
	}

	/** MEOS: intspan_upper */
	upper(): number {
		return F.intspan_upper(this.ptr);
	}

	/** MEOS: intspan_width */
	width(): number {
		return F.intspan_width(this.ptr);
	}

	/** MEOS: intspan_in */
	static fromText(str: string): IntSpan {
		return IntSpan.in(str);
	}

	/** MEOS: intspan_get_bin */
	static getBin(value: number, vsize: number, vorigin: number): Span {
		return wrapSpan(F.intspan_get_bin(value, vsize, vorigin)) as Span;
	}

	/** MEOS: intspan_in */
	static in(str: string): IntSpan {
		return wrapSpan(F.intspan_in(str)) as IntSpan;
	}

	/** MEOS: intspan_make */
	static make(lower: number, upper: number, lower_inc: boolean, upper_inc: boolean): IntSpan {
		return wrapSpan(F.intspan_make(lower, upper, lower_inc, upper_inc)) as IntSpan;
	}
}

/**
 * The IntSpanSet class of the MEOS object model.
 */
export class IntSpanSet extends SpanSet {

	/** The text MEOS writes this value as (MEOS: intspanset_out). */
	override toString(): string {
		return this.out();
	}

	/** MEOS: adjacent_spanset_int */
	private _adjacent_spanset_int(i: number): boolean {
		return F.adjacent_spanset_int(this.ptr, i);
	}

	/** MEOS: contains_spanset_int */
	private _contains_spanset_int(i: number): boolean {
		return F.contains_spanset_int(this.ptr, i);
	}

	/** MEOS: distance_intspanset_intspan */
	private _distance_intspanset_intspan(s: IntSpan): number {
		return F.distance_intspanset_intspan(this.ptr, s.ptr);
	}

	/** MEOS: distance_intspanset_intspanset */
	private _distance_intspanset_intspanset(ss2: IntSpanSet): number {
		return F.distance_intspanset_intspanset(this.ptr, ss2.ptr);
	}

	/** MEOS: distance_spanset_int */
	private _distance_spanset_int(i: number): number {
		return F.distance_spanset_int(this.ptr, i);
	}

	/** MEOS: intersection_spanset_int */
	private _intersection_spanset_int(i: number): SpanSet | null {
		return wrapSpanSetOrNull(F.intersection_spanset_int(this.ptr, i)) as SpanSet | null;
	}

	/** MEOS: left_spanset_int */
	private _left_spanset_int(i: number): boolean {
		return F.left_spanset_int(this.ptr, i);
	}

	/** MEOS: minus_spanset_int */
	private _minus_spanset_int(i: number): SpanSet | null {
		return wrapSpanSetOrNull(F.minus_spanset_int(this.ptr, i)) as SpanSet | null;
	}

	/** MEOS: overleft_spanset_int */
	private _overleft_spanset_int(i: number): boolean {
		return F.overleft_spanset_int(this.ptr, i);
	}

	/** MEOS: overright_spanset_int */
	private _overright_spanset_int(i: number): boolean {
		return F.overright_spanset_int(this.ptr, i);
	}

	/** MEOS: right_spanset_int */
	private _right_spanset_int(i: number): boolean {
		return F.right_spanset_int(this.ptr, i);
	}

	/** MEOS: union_spanset_int */
	private _union_spanset_int(i: number): SpanSet | null {
		return wrapSpanSetOrNull(F.union_spanset_int(this.ptr, i)) as SpanSet | null;
	}

	/** MEOS: adjacent_spanset_int, chosen by the arguments' types */
	override adjacent(i: number | Span | SpanSet): boolean {
		if (typeof i === 'number') return this._adjacent_spanset_int(i as number);
		return super.adjacent(i as Span | SpanSet);
	}

	/** MEOS: intspanset_out */
	asText(): string {
		return this.out();
	}

	/** MEOS: intspanset_bins */
	bins(vsize: number, vorigin: number, border_inc: boolean): Span[] {
		const _count = _alloc(4);
		try {
			const _arr = F.intspanset_bins(this.ptr, vsize, vorigin, border_inc, _count);
			if (!_arr) return [];
			try {
				const _n = _view(_count, 4).getInt32(0, true);
				const _v = _view(_arr, _n * 24);
				const _out: Span[] = [];
				for (let _i = 0; _i < _n; _i++) _out.push(wrapSpan(_copy(_arr + _i * 24, 24)) as Span);
				return _out;
			} finally {
				_free(_arr);
			}
		} finally {
			_free(_count);
		}
	}

	/** MEOS: contains_spanset_int, chosen by the arguments' types */
	override contains(i: number | Span | SpanSet): boolean {
		if (typeof i === 'number') return this._contains_spanset_int(i as number);
		return super.contains(i as Span | SpanSet);
	}

	/** MEOS: distance_intspanset_intspan, distance_intspanset_intspanset, distance_spanset_int, chosen by the arguments' types */
	distance(s: IntSpan | IntSpanSet | number): number {
		if (s instanceof IntSpan) return this._distance_intspanset_intspan(s as IntSpan);
		if (s instanceof IntSpanSet) return this._distance_intspanset_intspanset(s as IntSpanSet);
		if (typeof s === 'number') return this._distance_spanset_int(s as number);
		throw new TypeError(`IntSpanSet.distance: no overload takes these arguments`);
	}

	/** MEOS: intersection_spanset_int, chosen by the arguments' types */
	override intersection(i: number | Span | SpanSet): SpanSet | null {
		if (typeof i === 'number') return this._intersection_spanset_int(i as number);
		return super.intersection(i as Span | SpanSet);
	}

	/** MEOS: left_spanset_int, chosen by the arguments' types */
	override left(i: number | Span | SpanSet): boolean {
		if (typeof i === 'number') return this._left_spanset_int(i as number);
		return super.left(i as Span | SpanSet);
	}

	/** MEOS: intspanset_lower */
	lower(): number {
		return F.intspanset_lower(this.ptr);
	}

	/** MEOS: minus_spanset_int, chosen by the arguments' types */
	override minus(i: number | Span | SpanSet): SpanSet | null {
		if (typeof i === 'number') return this._minus_spanset_int(i as number);
		return super.minus(i as Span | SpanSet);
	}

	/** MEOS: intspanset_out */
	out(): string {
		return F.intspanset_out(this.ptr);
	}

	/** MEOS: overleft_spanset_int, chosen by the arguments' types */
	override overleft(i: number | Span | SpanSet): boolean {
		if (typeof i === 'number') return this._overleft_spanset_int(i as number);
		return super.overleft(i as Span | SpanSet);
	}

	/** MEOS: overright_spanset_int, chosen by the arguments' types */
	override overright(i: number | Span | SpanSet): boolean {
		if (typeof i === 'number') return this._overright_spanset_int(i as number);
		return super.overright(i as Span | SpanSet);
	}

	/** MEOS: adjacent_int_spanset */
	radjacent(i: number): boolean {
		return F.adjacent_int_spanset(i, this.ptr);
	}

	/** MEOS: contained_int_spanset */
	rcontained(i: number): boolean {
		return F.contained_int_spanset(i, this.ptr);
	}

	/** MEOS: right_spanset_int, chosen by the arguments' types */
	override right(i: number | Span | SpanSet): boolean {
		if (typeof i === 'number') return this._right_spanset_int(i as number);
		return super.right(i as Span | SpanSet);
	}

	/** MEOS: intersection_int_spanset */
	rintersection(i: number): SpanSet | null {
		return wrapSpanSetOrNull(F.intersection_int_spanset(i, this.ptr)) as SpanSet | null;
	}

	/** MEOS: left_int_spanset */
	rleft(i: number): boolean {
		return F.left_int_spanset(i, this.ptr);
	}

	/** MEOS: minus_int_spanset */
	rminus(i: number): SpanSet | null {
		return wrapSpanSetOrNull(F.minus_int_spanset(i, this.ptr)) as SpanSet | null;
	}

	/** MEOS: overleft_int_spanset */
	roverleft(i: number): boolean {
		return F.overleft_int_spanset(i, this.ptr);
	}

	/** MEOS: overright_int_spanset */
	roverright(i: number): boolean {
		return F.overright_int_spanset(i, this.ptr);
	}

	/** MEOS: right_int_spanset */
	rright(i: number): boolean {
		return F.right_int_spanset(i, this.ptr);
	}

	/** MEOS: union_int_spanset */
	runion(i: number): SpanSet | null {
		return wrapSpanSetOrNull(F.union_int_spanset(i, this.ptr)) as SpanSet | null;
	}

	/** MEOS: intspanset_shift_scale */
	shiftScale(shift: number, width: number, hasshift: boolean, haswidth: boolean): SpanSet {
		return wrapSpanSet(F.intspanset_shift_scale(this.ptr, shift, width, hasshift, haswidth)) as SpanSet;
	}

	/** MEOS: intspanset_to_floatspanset */
	toFloatspanset(): SpanSet {
		return wrapSpanSet(F.intspanset_to_floatspanset(this.ptr)) as SpanSet;
	}

	/** MEOS: union_spanset_int, chosen by the arguments' types */
	override union(i: number | Span | SpanSet): SpanSet | null {
		if (typeof i === 'number') return this._union_spanset_int(i as number);
		return super.union(i as Span | SpanSet);
	}

	/** MEOS: intspanset_upper */
	upper(): number {
		return F.intspanset_upper(this.ptr);
	}

	/** MEOS: intspanset_width */
	width(boundspan: boolean): number {
		return F.intspanset_width(this.ptr, boundspan);
	}

	/** MEOS: intspanset_in */
	static fromText(str: string): IntSpanSet {
		return IntSpanSet.in(str);
	}

	/** MEOS: intspanset_in */
	static in(str: string): IntSpanSet {
		return wrapSpanSet(F.intspanset_in(str)) as IntSpanSet;
	}
}

/**
 * A path into a jsonb value. A MeosType no membership predicate admits, as Nsegment and Raquet are; the nine signatures naming it are what need it.
 */
export class JsonPath extends Value {

	/** The text MEOS writes this value as (MEOS: jsonpath_out). */
	override toString(): string {
		return this.out();
	}

	/** MEOS: jsonpath_out */
	asText(): string {
		return this.out();
	}

	/** MEOS: jsonpath_copy */
	copy(): JsonPath {
		return wrapJsonPath(F.jsonpath_copy(this.ptr)) as JsonPath;
	}

	/** MEOS: jsonpath_mem_size */
	memSize(): number {
		return F.jsonpath_mem_size(this.ptr);
	}

	/** MEOS: jsonpath_out */
	out(): string {
		return F.jsonpath_out(this.ptr);
	}

	/** MEOS: jsonpath_in */
	static fromText(str: string): JsonPath {
		return JsonPath.in(str);
	}

	/** MEOS: jsonpath_in */
	static in(str: string): JsonPath {
		return wrapJsonPath(F.jsonpath_in(str)) as JsonPath;
	}
}

/**
 * PostgreSQL jsonb, the base type of TJsonb and JsonbSet.
 */
export class Jsonb extends Value {

	/** The text MEOS writes this value as (MEOS: jsonb_out). */
	override toString(): string {
		return this.out();
	}

	/** MEOS: always_eq_jsonb_tjsonb */
	alwaysEq(temp: TJsonb): number {
		return F.always_eq_jsonb_tjsonb(this.ptr, temp.ptr);
	}

	/** MEOS: always_ne_jsonb_tjsonb */
	alwaysNe(temp: TJsonb): number {
		return F.always_ne_jsonb_tjsonb(this.ptr, temp.ptr);
	}

	/** MEOS: jsonb_array_element */
	arrayElement(element: number): Jsonb | null {
		return wrapJsonbOrNull(F.jsonb_array_element(this.ptr, element)) as Jsonb | null;
	}

	/** MEOS: jsonb_array_elements */
	arrayElements(): Jsonb[] {
		const _count = _alloc(4);
		try {
			const _arr = F.jsonb_array_elements(this.ptr, _count);
			if (!_arr) return [];
			try {
				const _n = _view(_count, 4).getInt32(0, true);
				const _v = _view(_arr, _n * 8);
				const _out: Jsonb[] = [];
				for (let _i = 0; _i < _n; _i++) _out.push(wrapJsonb(Number(_v.getBigUint64(_i * 8, true))) as Jsonb);
				return _out;
			} finally {
				_free(_arr);
			}
		} finally {
			_free(_count);
		}
	}

	/** MEOS: jsonb_array_elements_text */
	arrayElementsText(): Text[] {
		const _count = _alloc(4);
		try {
			const _arr = F.jsonb_array_elements_text(this.ptr, _count);
			if (!_arr) return [];
			try {
				const _n = _view(_count, 4).getInt32(0, true);
				const _v = _view(_arr, _n * 8);
				const _out: Text[] = [];
				for (let _i = 0; _i < _n; _i++) _out.push(wrapText(Number(_v.getBigUint64(_i * 8, true))) as Text);
				return _out;
			} finally {
				_free(_arr);
			}
		} finally {
			_free(_count);
		}
	}

	/** MEOS: jsonb_array_element_text */
	arrayElementText(element: number): string {
		return F.jsonb_array_element_text(this.ptr, element);
	}

	/** MEOS: jsonb_array_length */
	arrayLength(): number {
		return F.jsonb_array_length(this.ptr);
	}

	/** MEOS: jsonb_out */
	asText(): string {
		return this.out();
	}

	/** MEOS: jsonb_cmp */
	cmp(jb2: Jsonb): number {
		return F.jsonb_cmp(this.ptr, jb2.ptr);
	}

	/** MEOS: jsonb_concat */
	concat(jb2: Jsonb): Jsonb {
		return wrapJsonb(F.jsonb_concat(this.ptr, jb2.ptr)) as Jsonb;
	}

	/** MEOS: jsonb_contained */
	contained(jb2: Jsonb): boolean {
		return F.jsonb_contained(this.ptr, jb2.ptr);
	}

	/** MEOS: jsonb_contains */
	contains(jb2: Jsonb): boolean {
		return F.jsonb_contains(this.ptr, jb2.ptr);
	}

	/** MEOS: jsonb_copy */
	copy(): Jsonb {
		return wrapJsonb(F.jsonb_copy(this.ptr)) as Jsonb;
	}

	/** MEOS: jsonb_delete */
	delete(key: string): Jsonb {
		return wrapJsonb(F.jsonb_delete(this.ptr, key)) as Jsonb;
	}

	/** MEOS: jsonb_delete_array */
	deleteArray(keys_elems: Text[]): Jsonb {
		const _keys_elems = _ptrArray(keys_elems.map(x => x.ptr));
		try {
			return wrapJsonb(F.jsonb_delete_array(this.ptr, _keys_elems, keys_elems.length)) as Jsonb;
		} finally {
			_free(_keys_elems);
		}
	}

	/** MEOS: jsonb_delete_index */
	deleteIndex(idx: number): Jsonb {
		return wrapJsonb(F.jsonb_delete_index(this.ptr, idx)) as Jsonb;
	}

	/** MEOS: jsonb_delete_path */
	deletePath(path_elems: Text[]): Jsonb {
		const _path_elems = _ptrArray(path_elems.map(x => x.ptr));
		try {
			return wrapJsonb(F.jsonb_delete_path(this.ptr, _path_elems, path_elems.length)) as Jsonb;
		} finally {
			_free(_path_elems);
		}
	}

	/** MEOS: jsonb_eq */
	eq(jb2: Jsonb): boolean {
		return F.jsonb_eq(this.ptr, jb2.ptr);
	}

	/** MEOS: ever_eq_jsonb_tjsonb */
	everEq(temp: TJsonb): number {
		return F.ever_eq_jsonb_tjsonb(this.ptr, temp.ptr);
	}

	/** MEOS: ever_ne_jsonb_tjsonb */
	everNe(temp: TJsonb): number {
		return F.ever_ne_jsonb_tjsonb(this.ptr, temp.ptr);
	}

	/** MEOS: jsonb_exists */
	exists(key: string): boolean {
		return F.jsonb_exists(this.ptr, key);
	}

	/** MEOS: jsonb_exists_array */
	existsArray(keys_elems: Text[], any: boolean): boolean {
		const _keys_elems = _ptrArray(keys_elems.map(x => x.ptr));
		try {
			return F.jsonb_exists_array(this.ptr, _keys_elems, keys_elems.length, any);
		} finally {
			_free(_keys_elems);
		}
	}

	/** MEOS: jsonb_extract_path */
	extractPath(path_elems: Text[]): Jsonb | null {
		const _path_elems = _ptrArray(path_elems.map(x => x.ptr));
		try {
			return wrapJsonbOrNull(F.jsonb_extract_path(this.ptr, _path_elems, path_elems.length)) as Jsonb | null;
		} finally {
			_free(_path_elems);
		}
	}

	/** MEOS: jsonb_extract_path_text */
	extractPathText(path_elems: Text[]): string {
		const _path_elems = _ptrArray(path_elems.map(x => x.ptr));
		try {
			return F.jsonb_extract_path_text(this.ptr, _path_elems, path_elems.length);
		} finally {
			_free(_path_elems);
		}
	}

	/** MEOS: jsonb_ge */
	ge(jb2: Jsonb): boolean {
		return F.jsonb_ge(this.ptr, jb2.ptr);
	}

	/** MEOS: jsonb_gt */
	gt(jb2: Jsonb): boolean {
		return F.jsonb_gt(this.ptr, jb2.ptr);
	}

	/** MEOS: jsonb_hash */
	hash(): number {
		return F.jsonb_hash(this.ptr);
	}

	/** MEOS: jsonb_hash_extended */
	hashExtended(seed: number): number {
		return F.jsonb_hash_extended(this.ptr, seed);
	}

	/** MEOS: jsonb_insert */
	insert(path_elems: Text[], newjb: Jsonb, after: boolean): Jsonb {
		const _path_elems = _ptrArray(path_elems.map(x => x.ptr));
		try {
			return wrapJsonb(F.jsonb_insert(this.ptr, _path_elems, path_elems.length, newjb.ptr, after)) as Jsonb;
		} finally {
			_free(_path_elems);
		}
	}

	/** MEOS: intersection_jsonb_set */
	intersection(s: JsonbSet): Set | null {
		return wrapSetOrNull(F.intersection_jsonb_set(this.ptr, s.ptr)) as Set | null;
	}

	/** MEOS: jsonb_le */
	le(jb2: Jsonb): boolean {
		return F.jsonb_le(this.ptr, jb2.ptr);
	}

	/** MEOS: jsonb_lt */
	lt(jb2: Jsonb): boolean {
		return F.jsonb_lt(this.ptr, jb2.ptr);
	}

	/** MEOS: jsonb_mem_size */
	memSize(): number {
		return F.jsonb_mem_size(this.ptr);
	}

	/** MEOS: minus_jsonb_set */
	minus(s: JsonbSet): Set | null {
		return wrapSetOrNull(F.minus_jsonb_set(this.ptr, s.ptr)) as Set | null;
	}

	/** MEOS: jsonb_ne */
	ne(jb2: Jsonb): boolean {
		return F.jsonb_ne(this.ptr, jb2.ptr);
	}

	/** MEOS: jsonb_object_field */
	objectField(key: string): Jsonb | null {
		return wrapJsonbOrNull(F.jsonb_object_field(this.ptr, key)) as Jsonb | null;
	}

	/** MEOS: jsonb_object_field_text */
	objectFieldText(key: string): string {
		return F.jsonb_object_field_text(this.ptr, key);
	}

	/** MEOS: jsonb_object_keys */
	objectKeys(): Text[] {
		const _count = _alloc(4);
		try {
			const _arr = F.jsonb_object_keys(this.ptr, _count);
			if (!_arr) return [];
			try {
				const _n = _view(_count, 4).getInt32(0, true);
				const _v = _view(_arr, _n * 8);
				const _out: Text[] = [];
				for (let _i = 0; _i < _n; _i++) _out.push(wrapText(Number(_v.getBigUint64(_i * 8, true))) as Text);
				return _out;
			} finally {
				_free(_arr);
			}
		} finally {
			_free(_count);
		}
	}

	/** MEOS: jsonb_out */
	out(): string {
		return F.jsonb_out(this.ptr);
	}

	/** MEOS: jsonb_path_exists */
	pathExists(jp: JsonPath, vars: Jsonb, silent: boolean, tz: boolean): number {
		return F.jsonb_path_exists(this.ptr, jp.ptr, vars.ptr, silent, tz);
	}

	/** MEOS: jsonb_path_match */
	pathMatch(jp: JsonPath, vars: Jsonb, silent: boolean, tz: boolean): boolean {
		return F.jsonb_path_match(this.ptr, jp.ptr, vars.ptr, silent, tz);
	}

	/** MEOS: jsonb_path_query_all */
	pathQueryAll(jp: JsonPath, vars: Jsonb, silent: boolean, tz: boolean): Jsonb[] {
		const _count = _alloc(4);
		try {
			const _arr = F.jsonb_path_query_all(this.ptr, jp.ptr, vars.ptr, silent, tz, _count);
			if (!_arr) return [];
			try {
				const _n = _view(_count, 4).getInt32(0, true);
				const _v = _view(_arr, _n * 8);
				const _out: Jsonb[] = [];
				for (let _i = 0; _i < _n; _i++) _out.push(wrapJsonb(Number(_v.getBigUint64(_i * 8, true))) as Jsonb);
				return _out;
			} finally {
				_free(_arr);
			}
		} finally {
			_free(_count);
		}
	}

	/** MEOS: jsonb_path_query_array */
	pathQueryArray(jp: JsonPath, vars: Jsonb, silent: boolean, tz: boolean): Jsonb | null {
		return wrapJsonbOrNull(F.jsonb_path_query_array(this.ptr, jp.ptr, vars.ptr, silent, tz)) as Jsonb | null;
	}

	/** MEOS: jsonb_path_query_first */
	pathQueryFirst(jp: JsonPath, vars: Jsonb, silent: boolean, tz: boolean): Jsonb | null {
		return wrapJsonbOrNull(F.jsonb_path_query_first(this.ptr, jp.ptr, vars.ptr, silent, tz)) as Jsonb | null;
	}

	/** MEOS: jsonb_pretty */
	pretty(): string {
		return F.jsonb_pretty(this.ptr);
	}

	/** MEOS: jsonb_set */
	set(path_elems: Text[], newjb: Jsonb, create: boolean): Jsonb {
		const _path_elems = _ptrArray(path_elems.map(x => x.ptr));
		try {
			return wrapJsonb(F.jsonb_set(this.ptr, _path_elems, path_elems.length, newjb.ptr, create)) as Jsonb;
		} finally {
			_free(_path_elems);
		}
	}

	/** MEOS: jsonb_set_lax */
	setLax(path_elems: Text[], newjb: Jsonb, create: boolean, handle_null: string): Jsonb | null {
		const _path_elems = _ptrArray(path_elems.map(x => x.ptr));
		try {
			return wrapJsonbOrNull(F.jsonb_set_lax(this.ptr, _path_elems, path_elems.length, newjb.ptr, create, handle_null)) as Jsonb | null;
		} finally {
			_free(_path_elems);
		}
	}

	/** MEOS: jsonb_strip_nulls */
	stripNulls(strip_in_arrays: boolean): Jsonb {
		return wrapJsonb(F.jsonb_strip_nulls(this.ptr, strip_in_arrays)) as Jsonb;
	}

	/** MEOS: teq_jsonb_tjsonb */
	teq(temp: TJsonb): Temporal | null {
		return wrapTemporalOrNull(F.teq_jsonb_tjsonb(this.ptr, temp.ptr)) as Temporal | null;
	}

	/** MEOS: tne_jsonb_tjsonb */
	tne(temp: TJsonb): Temporal | null {
		return wrapTemporalOrNull(F.tne_jsonb_tjsonb(this.ptr, temp.ptr)) as Temporal | null;
	}

	/** MEOS: jsonb_to_bool */
	toBool(): boolean {
		return F.jsonb_to_bool(this.ptr);
	}

	/** MEOS: jsonb_to_cstring */
	toCstring(): string {
		return F.jsonb_to_cstring(this.ptr);
	}

	/** MEOS: jsonb_to_float4 */
	toFloat4(): number {
		return F.jsonb_to_float4(this.ptr);
	}

	/** MEOS: jsonb_to_float8 */
	toFloat8(): number {
		return F.jsonb_to_float8(this.ptr);
	}

	/** MEOS: jsonb_to_int16 */
	toInt16(): number {
		return F.jsonb_to_int16(this.ptr);
	}

	/** MEOS: jsonb_to_int32 */
	toInt32(): number {
		return F.jsonb_to_int32(this.ptr);
	}

	/** MEOS: jsonb_to_int64 */
	toInt64(): number {
		return F.jsonb_to_int64(this.ptr);
	}

	/** MEOS: jsonb_to_set */
	toSet(): Set {
		return wrapSet(F.jsonb_to_set(this.ptr)) as Set;
	}

	/** MEOS: jsonb_to_text */
	toText(): string {
		return F.jsonb_to_text(this.ptr);
	}

	/** MEOS: union_jsonb_set */
	union(s: JsonbSet): Set | null {
		return wrapSetOrNull(F.union_jsonb_set(this.ptr, s.ptr)) as Set | null;
	}

	/** MEOS: jsonb_from_text */
	static fromText(txt: string, unique_keys: boolean): Jsonb {
		return wrapJsonb(F.jsonb_from_text(txt, unique_keys)) as Jsonb;
	}

	/** MEOS: jsonb_in */
	static in(str: string): Jsonb {
		return wrapJsonb(F.jsonb_in(str)) as Jsonb;
	}

	/** MEOS: jsonb_make */
	static make(keys_vals: Text[]): Jsonb {
		const _keys_vals = _ptrArray(keys_vals.map(x => x.ptr));
		try {
			return wrapJsonb(F.jsonb_make(_keys_vals, keys_vals.length)) as Jsonb;
		} finally {
			_free(_keys_vals);
		}
	}

	/** MEOS: jsonb_make_two_arg */
	static makeTwoArg(keys: Text[], values: Text[]): Jsonb {
		const _keys = _ptrArray(keys.map(x => x.ptr));
		const _values = _ptrArray(values.map(x => x.ptr));
		try {
			return wrapJsonb(F.jsonb_make_two_arg(_keys, _values, keys.length)) as Jsonb;
		} finally {
			_free(_keys);
			_free(_values);
		}
	}
}

/**
 * The JsonbSet class of the MEOS object model.
 */
export class JsonbSet extends Set {

	/** The text MEOS writes this value as (MEOS: jsonbset_out). */
	override toString(): string {
		return this.out();
	}

	/** MEOS: contains_set_jsonb */
	private _contains_set_jsonb(jb: Jsonb): boolean {
		return F.contains_set_jsonb(this.ptr, jb.ptr);
	}

	/** MEOS: intersection_set_jsonb */
	private _intersection_set_jsonb(jb: Jsonb): Set | null {
		return wrapSetOrNull(F.intersection_set_jsonb(this.ptr, jb.ptr)) as Set | null;
	}

	/** MEOS: minus_set_jsonb */
	private _minus_set_jsonb(jb: Jsonb): Set | null {
		return wrapSetOrNull(F.minus_set_jsonb(this.ptr, jb.ptr)) as Set | null;
	}

	/** MEOS: union_set_jsonb */
	private _union_set_jsonb(jb: Jsonb): Set | null {
		return wrapSetOrNull(F.union_set_jsonb(this.ptr, jb.ptr)) as Set | null;
	}

	/** MEOS: jsonbset_array_element */
	arrayElement(idx: number, null_handle: number): Set | null {
		return wrapSetOrNull(F.jsonbset_array_element(this.ptr, idx, null_handle)) as Set | null;
	}

	/** MEOS: jsonbset_array_element_text */
	arrayElementText(idx: number, null_handle: number): Set | null {
		return wrapSetOrNull(F.jsonbset_array_element_text(this.ptr, idx, null_handle)) as Set | null;
	}

	/** MEOS: jsonbset_array_length */
	arrayLength(): Set | null {
		return wrapSetOrNull(F.jsonbset_array_length(this.ptr)) as Set | null;
	}

	/** MEOS: jsonbset_out */
	asText(): string {
		return this.out();
	}

	/** MEOS: concat_jsonbset_jsonb */
	concat(jb: Jsonb, invert: boolean): Set {
		return wrapSet(F.concat_jsonbset_jsonb(this.ptr, jb.ptr, invert)) as Set;
	}

	/** MEOS: contains_set_jsonb, chosen by the arguments' types */
	override contains(jb: Jsonb | Set): boolean {
		if (jb instanceof Jsonb) return this._contains_set_jsonb(jb as Jsonb);
		return super.contains(jb as Set);
	}

	/** MEOS: jsonbset_delete */
	delete(key: string): Set | null {
		return wrapSetOrNull(F.jsonbset_delete(this.ptr, key)) as Set | null;
	}

	/** MEOS: jsonbset_delete_array */
	deleteArray(keys: Text[]): Set | null {
		const _keys = _ptrArray(keys.map(x => x.ptr));
		try {
			return wrapSetOrNull(F.jsonbset_delete_array(this.ptr, _keys, keys.length)) as Set | null;
		} finally {
			_free(_keys);
		}
	}

	/** MEOS: jsonbset_delete_index */
	deleteIndex(idx: number): Set | null {
		return wrapSetOrNull(F.jsonbset_delete_index(this.ptr, idx)) as Set | null;
	}

	/** MEOS: jsonbset_delete_path */
	deletePath(path_elems: Text[]): Set | null {
		const _path_elems = _ptrArray(path_elems.map(x => x.ptr));
		try {
			return wrapSetOrNull(F.jsonbset_delete_path(this.ptr, _path_elems, path_elems.length)) as Set | null;
		} finally {
			_free(_path_elems);
		}
	}

	/** MEOS: jsonbset_end_value */
	endValue(): Jsonb {
		return wrapJsonb(F.jsonbset_end_value(this.ptr)) as Jsonb;
	}

	/** MEOS: jsonbset_exists */
	exists(key: string): boolean[] {
		const _count = _alloc(4);
		try {
			const _arr = F.jsonbset_exists(this.ptr, key, _count);
			if (!_arr) return [];
			try {
				const _n = _view(_count, 4).getInt32(0, true);
				const _v = _view(_arr, _n * 1);
				const _out: boolean[] = [];
				for (let _i = 0; _i < _n; _i++) _out.push(_v.getUint8(_i * 1) !== 0);
				return _out;
			} finally {
				_free(_arr);
			}
		} finally {
			_free(_count);
		}
	}

	/** MEOS: jsonbset_extract_path */
	extractPath(path_elems: Text[], null_handle: number): Set | null {
		const _path_elems = _ptrArray(path_elems.map(x => x.ptr));
		try {
			return wrapSetOrNull(F.jsonbset_extract_path(this.ptr, _path_elems, path_elems.length, null_handle)) as Set | null;
		} finally {
			_free(_path_elems);
		}
	}

	/** MEOS: jsonbset_extract_path_text */
	extractPathText(path_elems: Text[], null_handle: number): Set | null {
		const _path_elems = _ptrArray(path_elems.map(x => x.ptr));
		try {
			return wrapSetOrNull(F.jsonbset_extract_path_text(this.ptr, _path_elems, path_elems.length, null_handle)) as Set | null;
		} finally {
			_free(_path_elems);
		}
	}

	/** MEOS: jsonbset_insert */
	insert(path_elems: Text[], newjb: Jsonb, after: boolean): Set | null {
		const _path_elems = _ptrArray(path_elems.map(x => x.ptr));
		try {
			return wrapSetOrNull(F.jsonbset_insert(this.ptr, _path_elems, path_elems.length, newjb.ptr, after)) as Set | null;
		} finally {
			_free(_path_elems);
		}
	}

	/** MEOS: intersection_set_jsonb, chosen by the arguments' types */
	override intersection(jb: Jsonb | Set): Set | null {
		if (jb instanceof Jsonb) return this._intersection_set_jsonb(jb as Jsonb);
		return super.intersection(jb as Set);
	}

	/** MEOS: minus_set_jsonb, chosen by the arguments' types */
	override minus(jb: Jsonb | Set): Set | null {
		if (jb instanceof Jsonb) return this._minus_set_jsonb(jb as Jsonb);
		return super.minus(jb as Set);
	}

	/** MEOS: jsonbset_object_field */
	objectField(key: string, null_handle: number): Set | null {
		return wrapSetOrNull(F.jsonbset_object_field(this.ptr, key, null_handle)) as Set | null;
	}

	/** MEOS: jsonbset_object_field_text */
	objectFieldText(key: string, null_handle: number): Set | null {
		return wrapSetOrNull(F.jsonbset_object_field_text(this.ptr, key, null_handle)) as Set | null;
	}

	/** MEOS: jsonbset_out */
	out(): string {
		return F.jsonbset_out(this.ptr);
	}

	/** MEOS: jsonbset_path_exists */
	pathExists(jp: JsonPath, vars: Jsonb, silent: boolean, tz: boolean): boolean[] {
		const _count = _alloc(4);
		try {
			const _arr = F.jsonbset_path_exists(this.ptr, jp.ptr, vars.ptr, silent, tz, _count);
			if (!_arr) return [];
			try {
				const _n = _view(_count, 4).getInt32(0, true);
				const _v = _view(_arr, _n * 1);
				const _out: boolean[] = [];
				for (let _i = 0; _i < _n; _i++) _out.push(_v.getUint8(_i * 1) !== 0);
				return _out;
			} finally {
				_free(_arr);
			}
		} finally {
			_free(_count);
		}
	}

	/** MEOS: jsonbset_path_match */
	pathMatch(jp: JsonPath, vars: Jsonb, silent: boolean, tz: boolean): boolean[] {
		const _count = _alloc(4);
		try {
			const _arr = F.jsonbset_path_match(this.ptr, jp.ptr, vars.ptr, silent, tz, _count);
			if (!_arr) return [];
			try {
				const _n = _view(_count, 4).getInt32(0, true);
				const _v = _view(_arr, _n * 1);
				const _out: boolean[] = [];
				for (let _i = 0; _i < _n; _i++) _out.push(_v.getUint8(_i * 1) !== 0);
				return _out;
			} finally {
				_free(_arr);
			}
		} finally {
			_free(_count);
		}
	}

	/** MEOS: jsonbset_path_query_array */
	pathQueryArray(jp: JsonPath, vars: Jsonb, silent: boolean, tz: boolean): Set | null {
		return wrapSetOrNull(F.jsonbset_path_query_array(this.ptr, jp.ptr, vars.ptr, silent, tz)) as Set | null;
	}

	/** MEOS: jsonbset_path_query_first */
	pathQueryFirst(jp: JsonPath, vars: Jsonb, silent: boolean, tz: boolean): Set | null {
		return wrapSetOrNull(F.jsonbset_path_query_first(this.ptr, jp.ptr, vars.ptr, silent, tz)) as Set | null;
	}

	/** MEOS: jsonbset_pretty */
	pretty(): Set {
		return wrapSet(F.jsonbset_pretty(this.ptr)) as Set;
	}

	/** MEOS: jsonbset_set */
	set(keys: Text[], newjb: Jsonb, create: boolean): Set | null {
		const _keys = _ptrArray(keys.map(x => x.ptr));
		try {
			return wrapSetOrNull(F.jsonbset_set(this.ptr, _keys, keys.length, newjb.ptr, create)) as Set | null;
		} finally {
			_free(_keys);
		}
	}

	/** MEOS: jsonbset_set_lax */
	setLax(keys: Text[], newjb: Jsonb, create: boolean, null_handle: string): Set | null {
		const _keys = _ptrArray(keys.map(x => x.ptr));
		try {
			return wrapSetOrNull(F.jsonbset_set_lax(this.ptr, _keys, keys.length, newjb.ptr, create, null_handle)) as Set | null;
		} finally {
			_free(_keys);
		}
	}

	/** MEOS: jsonbset_start_value */
	startValue(): Jsonb {
		return wrapJsonb(F.jsonbset_start_value(this.ptr)) as Jsonb;
	}

	/** MEOS: jsonbset_strip_nulls */
	stripNulls(strip_in_arrays: boolean): Set {
		return wrapSet(F.jsonbset_strip_nulls(this.ptr, strip_in_arrays)) as Set;
	}

	/** MEOS: jsonbset_to_alphanumset */
	toAlphanumset(key: string, settype: number, null_handle: number): Set {
		return wrapSet(F.jsonbset_to_alphanumset(this.ptr, key, settype, null_handle)) as Set;
	}

	/** MEOS: jsonbset_to_bigintset */
	toBigintset(key: string, null_handle: number): Set | null {
		return wrapSetOrNull(F.jsonbset_to_bigintset(this.ptr, key, null_handle)) as Set | null;
	}

	/** MEOS: jsonbset_to_floatset */
	toFloatset(key: string, null_handle: number): Set | null {
		return wrapSetOrNull(F.jsonbset_to_floatset(this.ptr, key, null_handle)) as Set | null;
	}

	/** MEOS: jsonbset_to_intset */
	toIntset(key: string, null_handle: number): Set | null {
		return wrapSetOrNull(F.jsonbset_to_intset(this.ptr, key, null_handle)) as Set | null;
	}

	/** MEOS: jsonbset_to_textset */
	toTextset(): Set {
		return wrapSet(F.jsonbset_to_textset(this.ptr)) as Set;
	}

	/** MEOS: jsonbset_to_textset_key */
	toTextsetKey(key: string, null_handle: number): Set | null {
		return wrapSetOrNull(F.jsonbset_to_textset_key(this.ptr, key, null_handle)) as Set | null;
	}

	/** MEOS: union_set_jsonb, chosen by the arguments' types */
	override union(jb: Jsonb | Set): Set | null {
		if (jb instanceof Jsonb) return this._union_set_jsonb(jb as Jsonb);
		return super.union(jb as Set);
	}

	/** MEOS: jsonbset_value_n */
	valueN(n: number): Jsonb | null {
		return wrapJsonbOrNull(F.jsonbset_value_n(this.ptr, n)) as Jsonb | null;
	}

	/** MEOS: jsonbset_values */
	values(): Jsonb[] {
		const _count = _alloc(4);
		try {
			const _arr = F.jsonbset_values(this.ptr, _count);
			if (!_arr) return [];
			try {
				const _n = _view(_count, 4).getInt32(0, true);
				const _v = _view(_arr, _n * 8);
				const _out: Jsonb[] = [];
				for (let _i = 0; _i < _n; _i++) _out.push(wrapJsonb(Number(_v.getBigUint64(_i * 8, true))) as Jsonb);
				return _out;
			} finally {
				_free(_arr);
			}
		} finally {
			_free(_count);
		}
	}

	/** MEOS: jsonbset_in */
	static fromText(str: string): JsonbSet {
		return JsonbSet.in(str);
	}

	/** MEOS: jsonbset_in */
	static in(str: string): JsonbSet {
		return wrapSet(F.jsonbset_in(str)) as JsonbSet;
	}

	/** MEOS: jsonbset_make */
	static make(values: Jsonb[]): JsonbSet {
		const _values = _ptrArray(values.map(x => x.ptr));
		try {
			return wrapSet(F.jsonbset_make(_values, values.length)) as JsonbSet;
		} finally {
			_free(_values);
		}
	}
}

/**
 * The growable array MEOS builds its own results in. MEOS registers it in no enum, so it names no temptype.
 */
export class MeosArray extends Value {

	/** MEOS: meos_array_add */
	add(value: Ptr): void {
		F.meos_array_add(this.ptr, value);
	}

	/** MEOS: meos_array_count */
	count(): number {
		return F.meos_array_count(this.ptr);
	}

	/** MEOS: meos_array_destroy */
	destroy(): void {
		F.meos_array_destroy(this.ptr);
	}

	/** MEOS: meos_array_destroy_free */
	destroyFree(): void {
		F.meos_array_destroy_free(this.ptr);
	}

	/** MEOS: meos_array_get */
	get(n: number): Ptr {
		return F.meos_array_get(this.ptr, n);
	}

	/** MEOS: meos_array_reset */
	reset(): void {
		F.meos_array_reset(this.ptr);
	}

	/** MEOS: meos_array_reset_free */
	resetFree(): void {
		F.meos_array_reset_free(this.ptr);
	}

	/** MEOS: meos_array_create */
	static create(elem_size: number): MeosArray {
		return wrapMeosArray(F.meos_array_create(elem_size)) as MeosArray;
	}
}

/**
 * The Npoint class of the MEOS object model.
 */
export class Npoint extends Value {

	/** The text MEOS writes this value as (MEOS: npoint_as_text). */
	override toString(): string {
		return this.asText(15);
	}

	/** MEOS: always_eq_npoint_tnpoint */
	alwaysEq(temp: TNpoint): number {
		return F.always_eq_npoint_tnpoint(this.ptr, temp.ptr);
	}

	/** MEOS: always_ne_npoint_tnpoint */
	alwaysNe(temp: TNpoint): number {
		return F.always_ne_npoint_tnpoint(this.ptr, temp.ptr);
	}

	/** MEOS: npoint_as_ewkb */
	asEWKB(variant: number): Uint8Array {
		return readWkb(_sizeOut => F.npoint_as_ewkb(this.ptr, variant, _sizeOut));
	}

	/** MEOS: npoint_as_ewkt */
	asEWKT(maxdd: number): string {
		return F.npoint_as_ewkt(this.ptr, maxdd);
	}

	/** MEOS: npoint_as_hexewkb */
	asHexEWKB(variant: number): string {
		return F.npoint_as_hexewkb(this.ptr, variant);
	}

	/** MEOS: npoint_as_hexwkb */
	asHexWKB(variant: number): string {
		return F.npoint_as_hexwkb(this.ptr, variant);
	}

	/** MEOS: npoint_as_text */
	asText(maxdd: number): string {
		return F.npoint_as_text(this.ptr, maxdd);
	}

	/** MEOS: npoint_as_wkb */
	asWKB(variant: number): Uint8Array {
		return readWkb(_sizeOut => F.npoint_as_wkb(this.ptr, variant, _sizeOut));
	}

	/** MEOS: npoint_cmp */
	cmp(np2: Npoint): number {
		return F.npoint_cmp(this.ptr, np2.ptr);
	}

	/** MEOS: contained_npoint_set */
	contained(s: NpointSet): boolean {
		return F.contained_npoint_set(this.ptr, s.ptr);
	}

	/** MEOS: contained_rid_npoint_tnpoint */
	containedRid(temp: TNpoint): boolean {
		return F.contained_rid_npoint_tnpoint(this.ptr, temp.ptr);
	}

	/** MEOS: npoint_copy */
	copy(): Npoint {
		return wrapNpoint(F.npoint_copy(this.ptr)) as Npoint;
	}

	/** MEOS: npoint_eq */
	eq(np2: Npoint): boolean {
		return F.npoint_eq(this.ptr, np2.ptr);
	}

	/** MEOS: ever_eq_npoint_tnpoint */
	everEq(temp: TNpoint): number {
		return F.ever_eq_npoint_tnpoint(this.ptr, temp.ptr);
	}

	/** MEOS: ever_ne_npoint_tnpoint */
	everNe(temp: TNpoint): number {
		return F.ever_ne_npoint_tnpoint(this.ptr, temp.ptr);
	}

	/** MEOS: npoint_ge */
	ge(np2: Npoint): boolean {
		return F.npoint_ge(this.ptr, np2.ptr);
	}

	/** MEOS: npoint_gt */
	gt(np2: Npoint): boolean {
		return F.npoint_gt(this.ptr, np2.ptr);
	}

	/** MEOS: npoint_hash */
	hash(): number {
		return F.npoint_hash(this.ptr);
	}

	/** MEOS: npoint_hash_extended */
	hashExtended(seed: number): number {
		return F.npoint_hash_extended(this.ptr, seed);
	}

	/** MEOS: intersection_npoint_set */
	intersection(s: NpointSet): Set | null {
		return wrapSetOrNull(F.intersection_npoint_set(this.ptr, s.ptr)) as Set | null;
	}

	/** MEOS: npoint_le */
	le(np2: Npoint): boolean {
		return F.npoint_le(this.ptr, np2.ptr);
	}

	/** MEOS: npoint_lt */
	lt(np2: Npoint): boolean {
		return F.npoint_lt(this.ptr, np2.ptr);
	}

	/** MEOS: minus_npoint_set */
	minus(s: NpointSet): Set | null {
		return wrapSetOrNull(F.minus_npoint_set(this.ptr, s.ptr)) as Set | null;
	}

	/** MEOS: npoint_ne */
	ne(np2: Npoint): boolean {
		return F.npoint_ne(this.ptr, np2.ptr);
	}

	/** MEOS: npoint_out */
	out(maxdd: number): string {
		return F.npoint_out(this.ptr, maxdd);
	}

	/** MEOS: npoint_position */
	position(): number {
		return F.npoint_position(this.ptr);
	}

	/** MEOS: npoint_round */
	round(maxdd: number): Npoint {
		return wrapNpoint(F.npoint_round(this.ptr, maxdd)) as Npoint;
	}

	/** MEOS: npoint_route */
	route(): number {
		return F.npoint_route(this.ptr);
	}

	/** MEOS: same_rid_npoint_tnpoint */
	sameRid(temp: TNpoint): boolean {
		return F.same_rid_npoint_tnpoint(this.ptr, temp.ptr);
	}

	/** MEOS: npoint_srid */
	SRID(): number {
		return F.npoint_srid(this.ptr);
	}

	/** MEOS: npoint_timestamptz_to_stbox */
	timestamptzToStbox(t: TimestampTz): STBox {
		return wrapSTBox(F.npoint_timestamptz_to_stbox(this.ptr, t)) as STBox;
	}

	/** MEOS: npoint_to_geompoint */
	toGeompoint(): Geo {
		return wrapGeo(F.npoint_to_geompoint(this.ptr)) as Geo;
	}

	/** MEOS: npoint_to_nsegment */
	toNsegment(): Nsegment {
		return wrapNsegment(F.npoint_to_nsegment(this.ptr)) as Nsegment;
	}

	/** MEOS: npoint_to_set */
	toSet(): Set {
		return wrapSet(F.npoint_to_set(this.ptr)) as Set;
	}

	/** MEOS: npoint_to_stbox */
	toStbox(): STBox {
		return wrapSTBox(F.npoint_to_stbox(this.ptr)) as STBox;
	}

	/** MEOS: npoint_tstzspan_to_stbox */
	tstzspanToStbox(s: Span): STBox {
		return wrapSTBox(F.npoint_tstzspan_to_stbox(this.ptr, s.ptr)) as STBox;
	}

	/** MEOS: union_npoint_set */
	union(s: NpointSet): Set | null {
		return wrapSetOrNull(F.union_npoint_set(this.ptr, s.ptr)) as Set | null;
	}

	/** MEOS: npoint_from_wkb */
	static fromEWKB(wkb: Uint8Array): Npoint {
		return Npoint.fromWKB(wkb);
	}

	/** MEOS: npoint_in */
	static fromEWKT(str: string): Npoint {
		return Npoint.in(str);
	}

	/** MEOS: npoint_from_hexwkb */
	static fromHexEWKB(hexwkb: string): Npoint {
		return Npoint.fromHexWKB(hexwkb);
	}

	/** MEOS: npoint_from_hexwkb */
	static fromHexWKB(hexwkb: string): Npoint {
		return wrapNpoint(F.npoint_from_hexwkb(hexwkb)) as Npoint;
	}

	/** MEOS: npoint_in */
	static fromText(str: string): Npoint {
		return Npoint.in(str);
	}

	/** MEOS: npoint_from_wkb */
	static fromWKB(wkb: Uint8Array): Npoint {
		const _wkb = _bytes(wkb);
		try {
			return wrapNpoint(F.npoint_from_wkb(_wkb, wkb.length)) as Npoint;
		} finally {
			_free(_wkb);
		}
	}

	/** MEOS: npoint_in */
	static in(str: string): Npoint {
		return wrapNpoint(F.npoint_in(str)) as Npoint;
	}

	/** MEOS: npoint_make */
	static make(rid: number, pos: number): Npoint {
		return wrapNpoint(F.npoint_make(rid, pos)) as Npoint;
	}
}

/**
 * The NpointSet class of the MEOS object model.
 */
export class NpointSet extends SpatialSet {

	/** The text MEOS writes this value as (MEOS: spatialset_as_text). */
	override toString(): string {
		return this.asText(15);
	}

	/** MEOS: contains_set_npoint */
	private _contains_set_npoint(np: Npoint): boolean {
		return F.contains_set_npoint(this.ptr, np.ptr);
	}

	/** MEOS: intersection_set_npoint */
	private _intersection_set_npoint(np: Npoint): Set | null {
		return wrapSetOrNull(F.intersection_set_npoint(this.ptr, np.ptr)) as Set | null;
	}

	/** MEOS: minus_set_npoint */
	private _minus_set_npoint(np: Npoint): Set | null {
		return wrapSetOrNull(F.minus_set_npoint(this.ptr, np.ptr)) as Set | null;
	}

	/** MEOS: union_set_npoint */
	private _union_set_npoint(np: Npoint): Set | null {
		return wrapSetOrNull(F.union_set_npoint(this.ptr, np.ptr)) as Set | null;
	}

	/** MEOS: contains_set_npoint, chosen by the arguments' types */
	override contains(np: Npoint | Set): boolean {
		if (np instanceof Npoint) return this._contains_set_npoint(np as Npoint);
		return super.contains(np as Set);
	}

	/** MEOS: distance_npointset_npointset */
	distance(s2: NpointSet): number {
		return F.distance_npointset_npointset(this.ptr, s2.ptr);
	}

	/** MEOS: npointset_end_value */
	endValue(): Npoint {
		return wrapNpoint(F.npointset_end_value(this.ptr)) as Npoint;
	}

	/** MEOS: intersection_set_npoint, chosen by the arguments' types */
	override intersection(np: Npoint | Set): Set | null {
		if (np instanceof Npoint) return this._intersection_set_npoint(np as Npoint);
		return super.intersection(np as Set);
	}

	/** MEOS: minus_set_npoint, chosen by the arguments' types */
	override minus(np: Npoint | Set): Set | null {
		if (np instanceof Npoint) return this._minus_set_npoint(np as Npoint);
		return super.minus(np as Set);
	}

	/** MEOS: npointset_out */
	override out(maxdd: number): string {
		return F.npointset_out(this.ptr, maxdd);
	}

	/** MEOS: npointset_routes */
	routes(): Set {
		return wrapSet(F.npointset_routes(this.ptr)) as Set;
	}

	/** MEOS: npointset_start_value */
	startValue(): Npoint {
		return wrapNpoint(F.npointset_start_value(this.ptr)) as Npoint;
	}

	/** MEOS: union_set_npoint, chosen by the arguments' types */
	override union(np: Npoint | Set): Set | null {
		if (np instanceof Npoint) return this._union_set_npoint(np as Npoint);
		return super.union(np as Set);
	}

	/** MEOS: npointset_value_n */
	valueN(n: number): Npoint | null {
		return wrapNpointOrNull(F.npointset_value_n(this.ptr, n)) as Npoint | null;
	}

	/** MEOS: npointset_values */
	values(): Npoint[] {
		const _count = _alloc(4);
		try {
			const _arr = F.npointset_values(this.ptr, _count);
			if (!_arr) return [];
			try {
				const _n = _view(_count, 4).getInt32(0, true);
				const _v = _view(_arr, _n * 8);
				const _out: Npoint[] = [];
				for (let _i = 0; _i < _n; _i++) _out.push(wrapNpoint(Number(_v.getBigUint64(_i * 8, true))) as Npoint);
				return _out;
			} finally {
				_free(_arr);
			}
		} finally {
			_free(_count);
		}
	}

	/** MEOS: set_from_wkb */
	static fromEWKB(wkb: Uint8Array): Set {
		return Set.fromWKB(wkb);
	}

	/** MEOS: npointset_in */
	static fromEWKT(str: string): NpointSet {
		return NpointSet.in(str);
	}

	/** MEOS: set_from_hexwkb */
	static fromHexEWKB(hexwkb: string): Set {
		return Set.fromHexWKB(hexwkb);
	}

	/** MEOS: npointset_in */
	static fromText(str: string): NpointSet {
		return NpointSet.in(str);
	}

	/** MEOS: npointset_in */
	static in(str: string): NpointSet {
		return wrapSet(F.npointset_in(str)) as NpointSet;
	}

	/** MEOS: npointset_make */
	static make(values: Npoint[]): NpointSet {
		const _values = _structArray(values.map(x => x.ptr), 16);
		try {
			return wrapSet(F.npointset_make(_values, values.length)) as NpointSet;
		} finally {
			_free(_values);
		}
	}
}

/**
 * A segment of a network route. A MeosType no membership predicate admits, so the coverage gate does not demand it; the 20 signatures naming it do.
 */
export class Nsegment extends Value {

	/** The text MEOS writes this value as (MEOS: nsegment_as_text). */
	override toString(): string {
		return this.asText(15);
	}

	/** MEOS: nsegment_as_ewkb */
	asEWKB(variant: number): Uint8Array {
		return readWkb(_sizeOut => F.nsegment_as_ewkb(this.ptr, variant, _sizeOut));
	}

	/** MEOS: nsegment_as_ewkt */
	asEWKT(maxdd: number): string {
		return F.nsegment_as_ewkt(this.ptr, maxdd);
	}

	/** MEOS: nsegment_as_hexewkb */
	asHexEWKB(variant: number): string {
		return F.nsegment_as_hexewkb(this.ptr, variant);
	}

	/** MEOS: nsegment_as_hexwkb */
	asHexWKB(variant: number): string {
		return F.nsegment_as_hexwkb(this.ptr, variant);
	}

	/** MEOS: nsegment_as_text */
	asText(maxdd: number): string {
		return F.nsegment_as_text(this.ptr, maxdd);
	}

	/** MEOS: nsegment_as_wkb */
	asWKB(variant: number): Uint8Array {
		return readWkb(_sizeOut => F.nsegment_as_wkb(this.ptr, variant, _sizeOut));
	}

	/** MEOS: nsegment_cmp */
	cmp(ns2: Nsegment): number {
		return F.nsegment_cmp(this.ptr, ns2.ptr);
	}

	/** MEOS: nsegment_copy */
	copy(): Nsegment {
		return wrapNsegment(F.nsegment_copy(this.ptr)) as Nsegment;
	}

	/** MEOS: nsegment_end_position */
	endPosition(): number {
		return F.nsegment_end_position(this.ptr);
	}

	/** MEOS: nsegment_eq */
	eq(ns2: Nsegment): boolean {
		return F.nsegment_eq(this.ptr, ns2.ptr);
	}

	/** MEOS: nsegment_ge */
	ge(ns2: Nsegment): boolean {
		return F.nsegment_ge(this.ptr, ns2.ptr);
	}

	/** MEOS: nsegment_gt */
	gt(ns2: Nsegment): boolean {
		return F.nsegment_gt(this.ptr, ns2.ptr);
	}

	/** MEOS: nsegment_le */
	le(ns2: Nsegment): boolean {
		return F.nsegment_le(this.ptr, ns2.ptr);
	}

	/** MEOS: nsegment_lt */
	lt(ns2: Nsegment): boolean {
		return F.nsegment_lt(this.ptr, ns2.ptr);
	}

	/** MEOS: nsegment_ne */
	ne(ns2: Nsegment): boolean {
		return F.nsegment_ne(this.ptr, ns2.ptr);
	}

	/** MEOS: nsegment_out */
	out(maxdd: number): string {
		return F.nsegment_out(this.ptr, maxdd);
	}

	/** MEOS: nsegment_round */
	round(maxdd: number): Nsegment {
		return wrapNsegment(F.nsegment_round(this.ptr, maxdd)) as Nsegment;
	}

	/** MEOS: nsegment_route */
	route(): number {
		return F.nsegment_route(this.ptr);
	}

	/** MEOS: nsegment_srid */
	SRID(): number {
		return F.nsegment_srid(this.ptr);
	}

	/** MEOS: nsegment_start_position */
	startPosition(): number {
		return F.nsegment_start_position(this.ptr);
	}

	/** MEOS: nsegment_to_geom */
	toGeom(): Geo {
		return wrapGeo(F.nsegment_to_geom(this.ptr)) as Geo;
	}

	/** MEOS: nsegment_to_stbox */
	toStbox(): STBox {
		return wrapSTBox(F.nsegment_to_stbox(this.ptr)) as STBox;
	}

	/** MEOS: nsegment_from_wkb */
	static fromEWKB(wkb: Uint8Array): Nsegment {
		return Nsegment.fromWKB(wkb);
	}

	/** MEOS: nsegment_in */
	static fromEWKT(str: string): Nsegment {
		return Nsegment.in(str);
	}

	/** MEOS: nsegment_from_hexwkb */
	static fromHexEWKB(hexwkb: string): Nsegment {
		return Nsegment.fromHexWKB(hexwkb);
	}

	/** MEOS: nsegment_from_hexwkb */
	static fromHexWKB(hexwkb: string): Nsegment {
		return wrapNsegment(F.nsegment_from_hexwkb(hexwkb)) as Nsegment;
	}

	/** MEOS: nsegment_in */
	static fromText(str: string): Nsegment {
		return Nsegment.in(str);
	}

	/** MEOS: nsegment_from_wkb */
	static fromWKB(wkb: Uint8Array): Nsegment {
		const _wkb = _bytes(wkb);
		try {
			return wrapNsegment(F.nsegment_from_wkb(_wkb, wkb.length)) as Nsegment;
		} finally {
			_free(_wkb);
		}
	}

	/** MEOS: nsegment_in */
	static in(str: string): Nsegment {
		return wrapNsegment(F.nsegment_in(str)) as Nsegment;
	}

	/** MEOS: nsegment_make */
	static make(rid: number, pos1: number, pos2: number): Nsegment {
		return wrapNsegment(F.nsegment_make(rid, pos1, pos2)) as Nsegment;
	}
}

/**
 * The Pcpatch class of the MEOS object model.
 */
export class Pcpatch extends Value {

	/** The text MEOS writes this value as (MEOS: pcpatch_hex_out). */
	override toString(): string {
		return this.hexOut(15);
	}

	/** MEOS: always_eq_pcpatch_tpcpatch */
	alwaysEq(temp: TPcpatch): number {
		return F.always_eq_pcpatch_tpcpatch(this.ptr, temp.ptr);
	}

	/** MEOS: always_ne_pcpatch_tpcpatch */
	alwaysNe(temp: TPcpatch): number {
		return F.always_ne_pcpatch_tpcpatch(this.ptr, temp.ptr);
	}

	/** MEOS: pcpatch_as_hexwkb */
	asHexWKB(): string {
		return F.pcpatch_as_hexwkb(this.ptr);
	}

	/** MEOS: pcpatch_hex_out */
	asText(maxdd: number): string {
		return this.hexOut(maxdd);
	}

	/** MEOS: pcpatch_cmp */
	cmp(pa2: Pcpatch): number {
		return F.pcpatch_cmp(this.ptr, pa2.ptr);
	}

	/** MEOS: contained_pcpatch_set */
	contained(s: PcpatchSet): boolean {
		return F.contained_pcpatch_set(this.ptr, s.ptr);
	}

	/** MEOS: pcpatch_copy */
	copy(): Pcpatch {
		return wrapPcpatch(F.pcpatch_copy(this.ptr)) as Pcpatch;
	}

	/** MEOS: pcpatch_eq */
	eq(pa2: Pcpatch): boolean {
		return F.pcpatch_eq(this.ptr, pa2.ptr);
	}

	/** MEOS: ever_eq_pcpatch_tpcpatch */
	everEq(temp: TPcpatch): number {
		return F.ever_eq_pcpatch_tpcpatch(this.ptr, temp.ptr);
	}

	/** MEOS: ever_ne_pcpatch_tpcpatch */
	everNe(temp: TPcpatch): number {
		return F.ever_ne_pcpatch_tpcpatch(this.ptr, temp.ptr);
	}

	/** MEOS: pcpatch_ge */
	ge(pa2: Pcpatch): boolean {
		return F.pcpatch_ge(this.ptr, pa2.ptr);
	}

	/** MEOS: pcpatch_get_pcid */
	getPcid(): number {
		return F.pcpatch_get_pcid(this.ptr);
	}

	/** MEOS: pcpatch_gt */
	gt(pa2: Pcpatch): boolean {
		return F.pcpatch_gt(this.ptr, pa2.ptr);
	}

	/** MEOS: pcpatch_hash */
	hash(): number {
		return F.pcpatch_hash(this.ptr);
	}

	/** MEOS: pcpatch_hash_extended */
	hashExtended(seed: number): number {
		return F.pcpatch_hash_extended(this.ptr, seed);
	}

	/** MEOS: pcpatch_hex_out */
	hexOut(maxdd: number): string {
		return F.pcpatch_hex_out(this.ptr, maxdd);
	}

	/** MEOS: intersection_pcpatch_set */
	intersection(s: PcpatchSet): Set | null {
		return wrapSetOrNull(F.intersection_pcpatch_set(this.ptr, s.ptr)) as Set | null;
	}

	/** MEOS: pcpatch_le */
	le(pa2: Pcpatch): boolean {
		return F.pcpatch_le(this.ptr, pa2.ptr);
	}

	/** MEOS: pcpatch_lt */
	lt(pa2: Pcpatch): boolean {
		return F.pcpatch_lt(this.ptr, pa2.ptr);
	}

	/** MEOS: pcpatch_mem_size */
	memSize(): number {
		return F.pcpatch_mem_size(this.ptr);
	}

	/** MEOS: minus_pcpatch_set */
	minus(s: PcpatchSet): Set | null {
		return wrapSetOrNull(F.minus_pcpatch_set(this.ptr, s.ptr)) as Set | null;
	}

	/** MEOS: pcpatch_ne */
	ne(pa2: Pcpatch): boolean {
		return F.pcpatch_ne(this.ptr, pa2.ptr);
	}

	/** MEOS: pcpatch_npoints */
	npoints(): number {
		return F.pcpatch_npoints(this.ptr);
	}

	/** MEOS: pcpatch_point_n */
	pointN(n: number): Pcpoint | null {
		return wrapPcpointOrNull(F.pcpatch_point_n(this.ptr, n)) as Pcpoint | null;
	}

	/** MEOS: pcpatch_points */
	points(): Pcpoint[] {
		const _count = _alloc(4);
		try {
			const _arr = F.pcpatch_points(this.ptr, _count);
			if (!_arr) return [];
			try {
				const _n = _view(_count, 4).getInt32(0, true);
				const _v = _view(_arr, _n * 8);
				const _out: Pcpoint[] = [];
				for (let _i = 0; _i < _n; _i++) _out.push(wrapPcpoint(Number(_v.getBigUint64(_i * 8, true))) as Pcpoint);
				return _out;
			} finally {
				_free(_arr);
			}
		} finally {
			_free(_count);
		}
	}

	/** MEOS: teq_pcpatch_tpcpatch */
	teq(temp: TPcpatch): Temporal | null {
		return wrapTemporalOrNull(F.teq_pcpatch_tpcpatch(this.ptr, temp.ptr)) as Temporal | null;
	}

	/** MEOS: tne_pcpatch_tpcpatch */
	tne(temp: TPcpatch): Temporal | null {
		return wrapTemporalOrNull(F.tne_pcpatch_tpcpatch(this.ptr, temp.ptr)) as Temporal | null;
	}

	/** MEOS: pcpatch_to_geom */
	toGeom(): Geo | null {
		return wrapGeoOrNull(F.pcpatch_to_geom(this.ptr)) as Geo | null;
	}

	/** MEOS: pcpatch_to_set */
	toSet(): Set {
		return wrapSet(F.pcpatch_to_set(this.ptr)) as Set;
	}

	/** MEOS: pcpatch_to_tpcbox */
	toTpcbox(): TPCBox {
		return wrapTPCBox(F.pcpatch_to_tpcbox(this.ptr)) as TPCBox;
	}

	/** MEOS: union_pcpatch_set */
	union(s: PcpatchSet): Set | null {
		return wrapSetOrNull(F.union_pcpatch_set(this.ptr, s.ptr)) as Set | null;
	}

	/** MEOS: pcpatch_from_hexwkb */
	static fromHexWKB(hexwkb: string): Pcpatch {
		return wrapPcpatch(F.pcpatch_from_hexwkb(hexwkb)) as Pcpatch;
	}

	/** MEOS: pcpatch_hex_in */
	static fromText(str: string): Pcpatch {
		return Pcpatch.hexIn(str);
	}

	/** MEOS: pcpatch_hex_in */
	static hexIn(str: string): Pcpatch {
		return wrapPcpatch(F.pcpatch_hex_in(str)) as Pcpatch;
	}

	/** MEOS: pcpatch_make */
	static make(points: Pcpoint[]): Pcpatch {
		const _points = _ptrArray(points.map(x => x.ptr));
		try {
			return wrapPcpatch(F.pcpatch_make(_points, points.length)) as Pcpatch;
		} finally {
			_free(_points);
		}
	}

	/** MEOS: pcpatch_make_coords */
	static makeCoords(pcid: number, values: number[]): Pcpatch {
		const _values = _alloc(Math.max(values.length, 1) * 8);
		{ const _v = _view(_values, Math.max(values.length, 1) * 8); values.forEach((_x, _i) => _v.setFloat64(_i * 8, _x, true)); }
		try {
			return wrapPcpatch(F.pcpatch_make_coords(pcid, _values, values.length)) as Pcpatch;
		} finally {
			_free(_values);
		}
	}
}

/**
 * The PcpatchSet class of the MEOS object model.
 */
export class PcpatchSet extends SpatialSet {

	/** The text MEOS writes this value as (MEOS: spatialset_as_text). */
	override toString(): string {
		return this.asText(15);
	}

	/** MEOS: contains_set_pcpatch */
	private _contains_set_pcpatch(pa: Pcpatch): boolean {
		return F.contains_set_pcpatch(this.ptr, pa.ptr);
	}

	/** MEOS: intersection_set_pcpatch */
	private _intersection_set_pcpatch(pa: Pcpatch): Set | null {
		return wrapSetOrNull(F.intersection_set_pcpatch(this.ptr, pa.ptr)) as Set | null;
	}

	/** MEOS: minus_set_pcpatch */
	private _minus_set_pcpatch(pa: Pcpatch): Set | null {
		return wrapSetOrNull(F.minus_set_pcpatch(this.ptr, pa.ptr)) as Set | null;
	}

	/** MEOS: union_set_pcpatch */
	private _union_set_pcpatch(pa: Pcpatch): Set | null {
		return wrapSetOrNull(F.union_set_pcpatch(this.ptr, pa.ptr)) as Set | null;
	}

	/** MEOS: contains_set_pcpatch, chosen by the arguments' types */
	override contains(pa: Pcpatch | Set): boolean {
		if (pa instanceof Pcpatch) return this._contains_set_pcpatch(pa as Pcpatch);
		return super.contains(pa as Set);
	}

	/** MEOS: pcpatchset_end_value */
	endValue(): Pcpatch {
		return wrapPcpatch(F.pcpatchset_end_value(this.ptr)) as Pcpatch;
	}

	/** MEOS: intersection_set_pcpatch, chosen by the arguments' types */
	override intersection(pa: Pcpatch | Set): Set | null {
		if (pa instanceof Pcpatch) return this._intersection_set_pcpatch(pa as Pcpatch);
		return super.intersection(pa as Set);
	}

	/** MEOS: minus_set_pcpatch, chosen by the arguments' types */
	override minus(pa: Pcpatch | Set): Set | null {
		if (pa instanceof Pcpatch) return this._minus_set_pcpatch(pa as Pcpatch);
		return super.minus(pa as Set);
	}

	/** MEOS: pcpatchset_out */
	override out(maxdd: number): string {
		return F.pcpatchset_out(this.ptr, maxdd);
	}

	/** MEOS: pcpatchset_start_value */
	startValue(): Pcpatch {
		return wrapPcpatch(F.pcpatchset_start_value(this.ptr)) as Pcpatch;
	}

	/** MEOS: union_set_pcpatch, chosen by the arguments' types */
	override union(pa: Pcpatch | Set): Set | null {
		if (pa instanceof Pcpatch) return this._union_set_pcpatch(pa as Pcpatch);
		return super.union(pa as Set);
	}

	/** MEOS: pcpatchset_value_n */
	valueN(n: number): Pcpatch | null {
		return wrapPcpatchOrNull(F.pcpatchset_value_n(this.ptr, n)) as Pcpatch | null;
	}

	/** MEOS: pcpatchset_values */
	values(): Pcpatch[] {
		const _count = _alloc(4);
		try {
			const _arr = F.pcpatchset_values(this.ptr, _count);
			if (!_arr) return [];
			try {
				const _n = _view(_count, 4).getInt32(0, true);
				const _v = _view(_arr, _n * 8);
				const _out: Pcpatch[] = [];
				for (let _i = 0; _i < _n; _i++) _out.push(wrapPcpatch(Number(_v.getBigUint64(_i * 8, true))) as Pcpatch);
				return _out;
			} finally {
				_free(_arr);
			}
		} finally {
			_free(_count);
		}
	}

	/** MEOS: set_from_wkb */
	static fromEWKB(wkb: Uint8Array): Set {
		return Set.fromWKB(wkb);
	}

	/** MEOS: pcpatchset_in */
	static fromEWKT(str: string): PcpatchSet {
		return PcpatchSet.in(str);
	}

	/** MEOS: set_from_hexwkb */
	static fromHexEWKB(hexwkb: string): Set {
		return Set.fromHexWKB(hexwkb);
	}

	/** MEOS: pcpatchset_in */
	static fromText(str: string): PcpatchSet {
		return PcpatchSet.in(str);
	}

	/** MEOS: pcpatchset_in */
	static in(str: string): PcpatchSet {
		return wrapSet(F.pcpatchset_in(str)) as PcpatchSet;
	}

	/** MEOS: pcpatchset_make */
	static make(values: Pcpatch[]): PcpatchSet {
		const _values = _ptrArray(values.map(x => x.ptr));
		try {
			return wrapSet(F.pcpatchset_make(_values, values.length)) as PcpatchSet;
		} finally {
			_free(_values);
		}
	}
}

/**
 * The Pcpoint class of the MEOS object model.
 */
export class Pcpoint extends Value {

	/** The text MEOS writes this value as (MEOS: pcpoint_hex_out). */
	override toString(): string {
		return this.hexOut(15);
	}

	/** MEOS: always_eq_pcpoint_tpcpoint */
	alwaysEq(temp: TPcpoint): number {
		return F.always_eq_pcpoint_tpcpoint(this.ptr, temp.ptr);
	}

	/** MEOS: always_ne_pcpoint_tpcpoint */
	alwaysNe(temp: TPcpoint): number {
		return F.always_ne_pcpoint_tpcpoint(this.ptr, temp.ptr);
	}

	/** MEOS: pcpoint_as_hexwkb */
	asHexWKB(): string {
		return F.pcpoint_as_hexwkb(this.ptr);
	}

	/** MEOS: pcpoint_hex_out */
	asText(maxdd: number): string {
		return this.hexOut(maxdd);
	}

	/** MEOS: pcpoint_cmp */
	cmp(pt2: Pcpoint): number {
		return F.pcpoint_cmp(this.ptr, pt2.ptr);
	}

	/** MEOS: contained_pcpoint_set */
	contained(s: PcpointSet): boolean {
		return F.contained_pcpoint_set(this.ptr, s.ptr);
	}

	/** MEOS: pcpoint_copy */
	copy(): Pcpoint {
		return wrapPcpoint(F.pcpoint_copy(this.ptr)) as Pcpoint;
	}

	/** MEOS: pcpoint_eq */
	eq(pt2: Pcpoint): boolean {
		return F.pcpoint_eq(this.ptr, pt2.ptr);
	}

	/** MEOS: ever_eq_pcpoint_tpcpoint */
	everEq(temp: TPcpoint): number {
		return F.ever_eq_pcpoint_tpcpoint(this.ptr, temp.ptr);
	}

	/** MEOS: ever_ne_pcpoint_tpcpoint */
	everNe(temp: TPcpoint): number {
		return F.ever_ne_pcpoint_tpcpoint(this.ptr, temp.ptr);
	}

	/** MEOS: pcpoint_ge */
	ge(pt2: Pcpoint): boolean {
		return F.pcpoint_ge(this.ptr, pt2.ptr);
	}

	/** MEOS: pcpoint_get_dim */
	getDim(name: string): number | null {
		const _out = _alloc(8);
		try {
			if (!F.pcpoint_get_dim(this.ptr, name, _out)) return null;
			return ((_v: DataView) => _v.getFloat64(0, true))(_view(_out, 8));
		} finally {
			_free(_out);
		}
	}

	/** MEOS: pcpoint_get_pcid */
	getPcid(): number {
		return F.pcpoint_get_pcid(this.ptr);
	}

	/** MEOS: pcpoint_get_x */
	getX(): number | null {
		const _out = _alloc(8);
		try {
			if (!F.pcpoint_get_x(this.ptr, _out)) return null;
			return ((_v: DataView) => _v.getFloat64(0, true))(_view(_out, 8));
		} finally {
			_free(_out);
		}
	}

	/** MEOS: pcpoint_get_y */
	getY(): number | null {
		const _out = _alloc(8);
		try {
			if (!F.pcpoint_get_y(this.ptr, _out)) return null;
			return ((_v: DataView) => _v.getFloat64(0, true))(_view(_out, 8));
		} finally {
			_free(_out);
		}
	}

	/** MEOS: pcpoint_get_z */
	getZ(): number | null {
		const _out = _alloc(8);
		try {
			if (!F.pcpoint_get_z(this.ptr, _out)) return null;
			return ((_v: DataView) => _v.getFloat64(0, true))(_view(_out, 8));
		} finally {
			_free(_out);
		}
	}

	/** MEOS: pcpoint_gt */
	gt(pt2: Pcpoint): boolean {
		return F.pcpoint_gt(this.ptr, pt2.ptr);
	}

	/** MEOS: pcpoint_hash */
	hash(): number {
		return F.pcpoint_hash(this.ptr);
	}

	/** MEOS: pcpoint_hash_extended */
	hashExtended(seed: number): number {
		return F.pcpoint_hash_extended(this.ptr, seed);
	}

	/** MEOS: pcpoint_hex_out */
	hexOut(maxdd: number): string {
		return F.pcpoint_hex_out(this.ptr, maxdd);
	}

	/** MEOS: intersection_pcpoint_set */
	intersection(s: PcpointSet): Set | null {
		return wrapSetOrNull(F.intersection_pcpoint_set(this.ptr, s.ptr)) as Set | null;
	}

	/** MEOS: pcpoint_le */
	le(pt2: Pcpoint): boolean {
		return F.pcpoint_le(this.ptr, pt2.ptr);
	}

	/** MEOS: pcpoint_lt */
	lt(pt2: Pcpoint): boolean {
		return F.pcpoint_lt(this.ptr, pt2.ptr);
	}

	/** MEOS: pcpoint_mem_size */
	memSize(): number {
		return F.pcpoint_mem_size(this.ptr);
	}

	/** MEOS: minus_pcpoint_set */
	minus(s: PcpointSet): Set | null {
		return wrapSetOrNull(F.minus_pcpoint_set(this.ptr, s.ptr)) as Set | null;
	}

	/** MEOS: pcpoint_ne */
	ne(pt2: Pcpoint): boolean {
		return F.pcpoint_ne(this.ptr, pt2.ptr);
	}

	/** MEOS: teq_pcpoint_tpcpoint */
	teq(temp: TPcpoint): Temporal | null {
		return wrapTemporalOrNull(F.teq_pcpoint_tpcpoint(this.ptr, temp.ptr)) as Temporal | null;
	}

	/** MEOS: tne_pcpoint_tpcpoint */
	tne(temp: TPcpoint): Temporal | null {
		return wrapTemporalOrNull(F.tne_pcpoint_tpcpoint(this.ptr, temp.ptr)) as Temporal | null;
	}

	/** MEOS: pcpoint_to_set */
	toSet(): Set {
		return wrapSet(F.pcpoint_to_set(this.ptr)) as Set;
	}

	/** MEOS: pcpoint_to_tpcbox */
	toTpcbox(): TPCBox | null {
		return wrapTPCBoxOrNull(F.pcpoint_to_tpcbox(this.ptr)) as TPCBox | null;
	}

	/** MEOS: union_pcpoint_set */
	union(s: PcpointSet): Set | null {
		return wrapSetOrNull(F.union_pcpoint_set(this.ptr, s.ptr)) as Set | null;
	}

	/** MEOS: pcpoint_from_hexwkb */
	static fromHexWKB(hexwkb: string): Pcpoint {
		return wrapPcpoint(F.pcpoint_from_hexwkb(hexwkb)) as Pcpoint;
	}

	/** MEOS: pcpoint_hex_in */
	static fromText(str: string): Pcpoint {
		return Pcpoint.hexIn(str);
	}

	/** MEOS: pcpoint_hex_in */
	static hexIn(str: string): Pcpoint {
		return wrapPcpoint(F.pcpoint_hex_in(str)) as Pcpoint;
	}

	/** MEOS: pcpoint_make */
	static make(pcid: number, values: number[]): Pcpoint {
		const _values = _alloc(Math.max(values.length, 1) * 8);
		{ const _v = _view(_values, Math.max(values.length, 1) * 8); values.forEach((_x, _i) => _v.setFloat64(_i * 8, _x, true)); }
		try {
			return wrapPcpoint(F.pcpoint_make(pcid, _values, values.length)) as Pcpoint;
		} finally {
			_free(_values);
		}
	}
}

/**
 * The PcpointSet class of the MEOS object model.
 */
export class PcpointSet extends SpatialSet {

	/** The text MEOS writes this value as (MEOS: spatialset_as_text). */
	override toString(): string {
		return this.asText(15);
	}

	/** MEOS: contains_set_pcpoint */
	private _contains_set_pcpoint(pt: Pcpoint): boolean {
		return F.contains_set_pcpoint(this.ptr, pt.ptr);
	}

	/** MEOS: intersection_set_pcpoint */
	private _intersection_set_pcpoint(pt: Pcpoint): Set | null {
		return wrapSetOrNull(F.intersection_set_pcpoint(this.ptr, pt.ptr)) as Set | null;
	}

	/** MEOS: minus_set_pcpoint */
	private _minus_set_pcpoint(pt: Pcpoint): Set | null {
		return wrapSetOrNull(F.minus_set_pcpoint(this.ptr, pt.ptr)) as Set | null;
	}

	/** MEOS: union_set_pcpoint */
	private _union_set_pcpoint(pt: Pcpoint): Set | null {
		return wrapSetOrNull(F.union_set_pcpoint(this.ptr, pt.ptr)) as Set | null;
	}

	/** MEOS: contains_set_pcpoint, chosen by the arguments' types */
	override contains(pt: Pcpoint | Set): boolean {
		if (pt instanceof Pcpoint) return this._contains_set_pcpoint(pt as Pcpoint);
		return super.contains(pt as Set);
	}

	/** MEOS: pcpointset_end_value */
	endValue(): Pcpoint {
		return wrapPcpoint(F.pcpointset_end_value(this.ptr)) as Pcpoint;
	}

	/** MEOS: intersection_set_pcpoint, chosen by the arguments' types */
	override intersection(pt: Pcpoint | Set): Set | null {
		if (pt instanceof Pcpoint) return this._intersection_set_pcpoint(pt as Pcpoint);
		return super.intersection(pt as Set);
	}

	/** MEOS: minus_set_pcpoint, chosen by the arguments' types */
	override minus(pt: Pcpoint | Set): Set | null {
		if (pt instanceof Pcpoint) return this._minus_set_pcpoint(pt as Pcpoint);
		return super.minus(pt as Set);
	}

	/** MEOS: pcpointset_out */
	override out(maxdd: number): string {
		return F.pcpointset_out(this.ptr, maxdd);
	}

	/** MEOS: pcpointset_start_value */
	startValue(): Pcpoint {
		return wrapPcpoint(F.pcpointset_start_value(this.ptr)) as Pcpoint;
	}

	/** MEOS: union_set_pcpoint, chosen by the arguments' types */
	override union(pt: Pcpoint | Set): Set | null {
		if (pt instanceof Pcpoint) return this._union_set_pcpoint(pt as Pcpoint);
		return super.union(pt as Set);
	}

	/** MEOS: pcpointset_value_n */
	valueN(n: number): Pcpoint | null {
		return wrapPcpointOrNull(F.pcpointset_value_n(this.ptr, n)) as Pcpoint | null;
	}

	/** MEOS: pcpointset_values */
	values(): Pcpoint[] {
		const _count = _alloc(4);
		try {
			const _arr = F.pcpointset_values(this.ptr, _count);
			if (!_arr) return [];
			try {
				const _n = _view(_count, 4).getInt32(0, true);
				const _v = _view(_arr, _n * 8);
				const _out: Pcpoint[] = [];
				for (let _i = 0; _i < _n; _i++) _out.push(wrapPcpoint(Number(_v.getBigUint64(_i * 8, true))) as Pcpoint);
				return _out;
			} finally {
				_free(_arr);
			}
		} finally {
			_free(_count);
		}
	}

	/** MEOS: set_from_wkb */
	static fromEWKB(wkb: Uint8Array): Set {
		return Set.fromWKB(wkb);
	}

	/** MEOS: pcpointset_in */
	static fromEWKT(str: string): PcpointSet {
		return PcpointSet.in(str);
	}

	/** MEOS: set_from_hexwkb */
	static fromHexEWKB(hexwkb: string): Set {
		return Set.fromHexWKB(hexwkb);
	}

	/** MEOS: pcpointset_in */
	static fromText(str: string): PcpointSet {
		return PcpointSet.in(str);
	}

	/** MEOS: pcpointset_in */
	static in(str: string): PcpointSet {
		return wrapSet(F.pcpointset_in(str)) as PcpointSet;
	}

	/** MEOS: pcpointset_make */
	static make(values: Pcpoint[]): PcpointSet {
		const _values = _ptrArray(values.map(x => x.ptr));
		try {
			return wrapSet(F.pcpointset_make(_values, values.length)) as PcpointSet;
		} finally {
			_free(_values);
		}
	}
}

/**
 * The dimension schema a point cloud value is read through. Every pcpoint and pcpatch accessor takes one, and the process-global cache answers it for a pcid. MEOS registers it in no enum, so it names no temptype.
 */
export class Pcschema extends Value {

	/** MEOS: meos_pc_schema_clear */
	static clear(): void {
		F.meos_pc_schema_clear();
	}

	/** MEOS: meos_pc_schema_compression */
	static compression(pcid: number): string {
		return F.meos_pc_schema_compression(pcid);
	}

	/** MEOS: meos_pc_schema */
	static get(pcid: number): Pcschema {
		return wrapPcschema(F.meos_pc_schema(pcid)) as Pcschema;
	}

	/** MEOS: meos_pc_schema_ndims */
	static ndims(pcid: number): number {
		return F.meos_pc_schema_ndims(pcid);
	}

	/** MEOS: meos_pc_schema_register */
	static register(pcid: number, schema: Pcschema): void {
		F.meos_pc_schema_register(pcid, schema.ptr);
	}

	/** MEOS: meos_pc_schema_register_xml */
	static registerXml(pcid: number, schema: Pcschema, xml_text: string): void {
		F.meos_pc_schema_register_xml(pcid, schema.ptr, xml_text);
	}

	/** MEOS: meos_pc_schema_srid */
	static SRID(pcid: number): number {
		return F.meos_pc_schema_srid(pcid);
	}

	/** MEOS: meos_pc_schema_xml */
	static xml(pcid: number): string {
		return F.meos_pc_schema_xml(pcid);
	}
}

/**
 * The Pose class of the MEOS object model.
 */
export class Pose extends Value {

	/** The text MEOS writes this value as (MEOS: pose_as_text). */
	override toString(): string {
		return this.asText(15);
	}

	/** MEOS: distance_pose_geo */
	private _distance_pose_geo(gs: Geo): number {
		return F.distance_pose_geo(this.ptr, gs.ptr);
	}

	/** MEOS: distance_pose_pose */
	private _distance_pose_pose(pose2: Pose): number {
		return F.distance_pose_pose(this.ptr, pose2.ptr);
	}

	/** MEOS: distance_pose_stbox */
	private _distance_pose_stbox(box: STBox): number {
		return F.distance_pose_stbox(this.ptr, box.ptr);
	}

	/** MEOS: always_eq_pose_tpose */
	alwaysEq(temp: TPose): number {
		return F.always_eq_pose_tpose(this.ptr, temp.ptr);
	}

	/** MEOS: always_ne_pose_tpose */
	alwaysNe(temp: TPose): number {
		return F.always_ne_pose_tpose(this.ptr, temp.ptr);
	}

	/** MEOS: pose_angular_distance */
	angularDistance(pose2: Pose): number {
		return F.pose_angular_distance(this.ptr, pose2.ptr);
	}

	/** MEOS: pose_apply_geo */
	applyGeo(body: Geo): Geo | null {
		return wrapGeoOrNull(F.pose_apply_geo(this.ptr, body.ptr)) as Geo | null;
	}

	/** MEOS: pose_as_ewkb */
	asEWKB(variant: number): Uint8Array {
		return readWkb(_sizeOut => F.pose_as_ewkb(this.ptr, variant, _sizeOut));
	}

	/** MEOS: pose_as_ewkt */
	asEWKT(maxdd: number): string {
		return F.pose_as_ewkt(this.ptr, maxdd);
	}

	/** MEOS: pose_as_geopose */
	asGeopose(conformance: number, precision: number): string {
		return F.pose_as_geopose(this.ptr, conformance, precision);
	}

	/** MEOS: pose_as_hexewkb */
	asHexEWKB(variant: number): string {
		return F.pose_as_hexewkb(this.ptr, variant);
	}

	/** MEOS: pose_as_hexwkb */
	asHexWKB(variant: number): string {
		return F.pose_as_hexwkb(this.ptr, variant);
	}

	/** MEOS: pose_as_text */
	asText(maxdd: number): string {
		return F.pose_as_text(this.ptr, maxdd);
	}

	/** MEOS: pose_as_wkb */
	asWKB(variant: number): Uint8Array {
		return readWkb(_sizeOut => F.pose_as_wkb(this.ptr, variant, _sizeOut));
	}

	/** MEOS: pose_cmp */
	cmp(pose2: Pose): number {
		return F.pose_cmp(this.ptr, pose2.ptr);
	}

	/** MEOS: pose_compose */
	compose(frame: Pose): Pose | null {
		return wrapPoseOrNull(F.pose_compose(this.ptr, frame.ptr)) as Pose | null;
	}

	/** MEOS: pose_compose_tpose */
	composeTpose(frame: Temporal): Temporal | null {
		return wrapTemporalOrNull(F.pose_compose_tpose(this.ptr, frame.ptr)) as Temporal | null;
	}

	/** MEOS: contained_pose_set */
	contained(s: PoseSet): boolean {
		return F.contained_pose_set(this.ptr, s.ptr);
	}

	/** MEOS: pose_copy */
	copy(): Pose {
		return wrapPose(F.pose_copy(this.ptr)) as Pose;
	}

	/** MEOS: distance_pose_geo, distance_pose_pose, distance_pose_stbox, chosen by the arguments' types */
	distance(gs: Geo | Pose | STBox): number {
		if (gs instanceof Geo) return this._distance_pose_geo(gs as Geo);
		if (gs instanceof Pose) return this._distance_pose_pose(gs as Pose);
		if (gs instanceof STBox) return this._distance_pose_stbox(gs as STBox);
		throw new TypeError(`Pose.distance: no overload takes these arguments`);
	}

	/** MEOS: pose_eq */
	eq(pose2: Pose): boolean {
		return F.pose_eq(this.ptr, pose2.ptr);
	}

	/** MEOS: ever_eq_pose_tpose */
	everEq(temp: TPose): number {
		return F.ever_eq_pose_tpose(this.ptr, temp.ptr);
	}

	/** MEOS: ever_ne_pose_tpose */
	everNe(temp: TPose): number {
		return F.ever_ne_pose_tpose(this.ptr, temp.ptr);
	}

	/** MEOS: pose_ge */
	ge(pose2: Pose): boolean {
		return F.pose_ge(this.ptr, pose2.ptr);
	}

	/** MEOS: pose_gt */
	gt(pose2: Pose): boolean {
		return F.pose_gt(this.ptr, pose2.ptr);
	}

	/** MEOS: pose_hash */
	hash(): number {
		return F.pose_hash(this.ptr);
	}

	/** MEOS: pose_hash_extended */
	hashExtended(seed: number): number {
		return F.pose_hash_extended(this.ptr, seed);
	}

	/** MEOS: intersection_pose_set */
	intersection(s: PoseSet): Set | null {
		return wrapSetOrNull(F.intersection_pose_set(this.ptr, s.ptr)) as Set | null;
	}

	/** MEOS: pose_inverse */
	inverse(): Pose | null {
		return wrapPoseOrNull(F.pose_inverse(this.ptr)) as Pose | null;
	}

	/** MEOS: pose_le */
	le(pose2: Pose): boolean {
		return F.pose_le(this.ptr, pose2.ptr);
	}

	/** MEOS: pose_lt */
	lt(pose2: Pose): boolean {
		return F.pose_lt(this.ptr, pose2.ptr);
	}

	/** MEOS: pose_mem_size */
	memSize(): number {
		return F.pose_mem_size(this.ptr);
	}

	/** MEOS: minus_pose_set */
	minus(s: PoseSet): Set | null {
		return wrapSetOrNull(F.minus_pose_set(this.ptr, s.ptr)) as Set | null;
	}

	/** MEOS: pose_ne */
	ne(pose2: Pose): boolean {
		return F.pose_ne(this.ptr, pose2.ptr);
	}

	/** MEOS: pose_normalize */
	normalize(): Pose {
		return wrapPose(F.pose_normalize(this.ptr)) as Pose;
	}

	/** MEOS: pose_out */
	out(maxdd: number): string {
		return F.pose_out(this.ptr, maxdd);
	}

	/** MEOS: pose_pitch */
	pitch(): number {
		return F.pose_pitch(this.ptr);
	}

	/** MEOS: pose_quaternion */
	quaternion(): number[] {
		const _count = _alloc(4);
		try {
			const _arr = F.pose_quaternion(this.ptr, _count);
			if (!_arr) return [];
			try {
				const _n = _view(_count, 4).getInt32(0, true);
				const _v = _view(_arr, _n * 8);
				const _out: number[] = [];
				for (let _i = 0; _i < _n; _i++) _out.push(_v.getFloat64(_i * 8, true));
				return _out;
			} finally {
				_free(_arr);
			}
		} finally {
			_free(_count);
		}
	}

	/** MEOS: pose_roll */
	roll(): number {
		return F.pose_roll(this.ptr);
	}

	/** MEOS: pose_round */
	round(maxdd: number): Pose {
		return wrapPose(F.pose_round(this.ptr, maxdd)) as Pose;
	}

	/** MEOS: pose_set_srid */
	setSRID(srid: number): Pose {
		return wrapPose(F.pose_set_srid(this.ptr, srid)) as Pose;
	}

	/** MEOS: pose_srid */
	SRID(): number {
		return F.pose_srid(this.ptr);
	}

	/** MEOS: teq_pose_tpose */
	teq(temp: TPose): Temporal | null {
		return wrapTemporalOrNull(F.teq_pose_tpose(this.ptr, temp.ptr)) as Temporal | null;
	}

	/** MEOS: pose_timestamptz_to_stbox */
	timestamptzToStbox(t: TimestampTz): STBox {
		return wrapSTBox(F.pose_timestamptz_to_stbox(this.ptr, t)) as STBox;
	}

	/** MEOS: tne_pose_tpose */
	tne(temp: TPose): Temporal | null {
		return wrapTemporalOrNull(F.tne_pose_tpose(this.ptr, temp.ptr)) as Temporal | null;
	}

	/** MEOS: pose_to_geog */
	toGeog(): Geo {
		return wrapGeo(F.pose_to_geog(this.ptr)) as Geo;
	}

	/** MEOS: pose_to_point */
	toPoint(): Geo {
		return wrapGeo(F.pose_to_point(this.ptr)) as Geo;
	}

	/** MEOS: pose_to_posechain */
	toPosechain(): PoseChain {
		return wrapPoseChain(F.pose_to_posechain(this.ptr)) as PoseChain;
	}

	/** MEOS: pose_to_set */
	toSet(): Set {
		return wrapSet(F.pose_to_set(this.ptr)) as Set;
	}

	/** MEOS: pose_to_stbox */
	toStbox(): STBox {
		return wrapSTBox(F.pose_to_stbox(this.ptr)) as STBox;
	}

	/** MEOS: pose_transform */
	transform(srid: number): Pose {
		return wrapPose(F.pose_transform(this.ptr, srid)) as Pose;
	}

	/** MEOS: pose_transform_pipeline */
	transformPipeline(pipelinestr: string, srid: number, is_forward: boolean): Pose {
		return wrapPose(F.pose_transform_pipeline(this.ptr, pipelinestr, srid, is_forward)) as Pose;
	}

	/** MEOS: pose_tstzspan_to_stbox */
	tstzspanToStbox(s: Span): STBox {
		return wrapSTBox(F.pose_tstzspan_to_stbox(this.ptr, s.ptr)) as STBox;
	}

	/** MEOS: union_pose_set */
	union(s: PoseSet): Set | null {
		return wrapSetOrNull(F.union_pose_set(this.ptr, s.ptr)) as Set | null;
	}

	/** MEOS: pose_yaw */
	yaw(): number {
		return F.pose_yaw(this.ptr);
	}

	/** MEOS: pose_ypr */
	ypr(): number[] {
		const _count = _alloc(4);
		try {
			const _arr = F.pose_ypr(this.ptr, _count);
			if (!_arr) return [];
			try {
				const _n = _view(_count, 4).getInt32(0, true);
				const _v = _view(_arr, _n * 8);
				const _out: number[] = [];
				for (let _i = 0; _i < _n; _i++) _out.push(_v.getFloat64(_i * 8, true));
				return _out;
			} finally {
				_free(_arr);
			}
		} finally {
			_free(_count);
		}
	}

	/** MEOS: pose_from_wkb */
	static fromEWKB(wkb: Uint8Array): Pose {
		return Pose.fromWKB(wkb);
	}

	/** MEOS: pose_from_text */
	static fromEWKT(str: string): Pose {
		return Pose.fromText(str);
	}

	/** MEOS: pose_from_geopose */
	static fromGeopose(json: string): Pose | null {
		return wrapPoseOrNull(F.pose_from_geopose(json)) as Pose | null;
	}

	/** MEOS: pose_from_hexwkb */
	static fromHexEWKB(hexwkb: string): Pose {
		return Pose.fromHexWKB(hexwkb);
	}

	/** MEOS: pose_from_hexwkb */
	static fromHexWKB(hexwkb: string): Pose {
		return wrapPose(F.pose_from_hexwkb(hexwkb)) as Pose;
	}

	/** MEOS: pose_from_text */
	static fromText(str: string): Pose {
		return wrapPose(F.pose_from_text(str)) as Pose;
	}

	/** MEOS: pose_from_wkb */
	static fromWKB(wkb: Uint8Array): Pose {
		const _wkb = _bytes(wkb);
		try {
			return wrapPose(F.pose_from_wkb(_wkb, wkb.length)) as Pose;
		} finally {
			_free(_wkb);
		}
	}

	/** MEOS: pose_in */
	static in(str: string): Pose {
		return wrapPose(F.pose_in(str)) as Pose;
	}

	/** MEOS: pose_make_2d */
	static make2d(x: number, y: number, theta: number, geodetic: boolean, srid: number): Pose {
		return wrapPose(F.pose_make_2d(x, y, theta, geodetic, srid)) as Pose;
	}

	/** MEOS: pose_make_3d */
	static make3d(x: number, y: number, z: number, W: number, X: number, Y: number, Z: number, geodetic: boolean, srid: number): Pose {
		return wrapPose(F.pose_make_3d(x, y, z, W, X, Y, Z, geodetic, srid)) as Pose;
	}

	/** MEOS: pose_make_point2d */
	static makePoint2d(gs: Geo, theta: number): Pose {
		return wrapPose(F.pose_make_point2d(gs.ptr, theta)) as Pose;
	}

	/** MEOS: pose_make_point3d */
	static makePoint3d(gs: Geo, W: number, X: number, Y: number, Z: number): Pose {
		return wrapPose(F.pose_make_point3d(gs.ptr, W, X, Y, Z)) as Pose;
	}

	/** MEOS: pose_make_point3d_ypr */
	static makePoint3dYpr(gs: Geo, yaw: number, pitch: number, roll: number): Pose {
		return wrapPose(F.pose_make_point3d_ypr(gs.ptr, yaw, pitch, roll)) as Pose;
	}
}

/**
 * The PoseChain class of the MEOS object model.
 */
export class PoseChain extends Value {

	/** The text MEOS writes this value as (MEOS: posechain_as_text). */
	override toString(): string {
		return this.asText(15);
	}

	/** MEOS: distance_posechain_geo */
	private _distance_posechain_geo(gs: Geo): number {
		return F.distance_posechain_geo(this.ptr, gs.ptr);
	}

	/** MEOS: distance_posechain_posechain */
	private _distance_posechain_posechain(pc2: PoseChain): number {
		return F.distance_posechain_posechain(this.ptr, pc2.ptr);
	}

	/** MEOS: distance_posechain_stbox */
	private _distance_posechain_stbox(box: STBox): number {
		return F.distance_posechain_stbox(this.ptr, box.ptr);
	}

	/** MEOS: always_eq_posechain_tposechain */
	alwaysEq(temp: TPoseChain): number {
		return F.always_eq_posechain_tposechain(this.ptr, temp.ptr);
	}

	/** MEOS: always_ne_posechain_tposechain */
	alwaysNe(temp: TPoseChain): number {
		return F.always_ne_posechain_tposechain(this.ptr, temp.ptr);
	}

	/** MEOS: posechain_append */
	append(pose: Pose): PoseChain {
		return wrapPoseChain(F.posechain_append(this.ptr, pose.ptr)) as PoseChain;
	}

	/** MEOS: posechain_as_ewkb */
	asEWKB(variant: number): Uint8Array {
		return readWkb(_sizeOut => F.posechain_as_ewkb(this.ptr, variant, _sizeOut));
	}

	/** MEOS: posechain_as_ewkt */
	asEWKT(maxdd: number): string {
		return F.posechain_as_ewkt(this.ptr, maxdd);
	}

	/** MEOS: posechain_as_hexewkb */
	asHexEWKB(variant: number): string {
		return F.posechain_as_hexewkb(this.ptr, variant);
	}

	/** MEOS: posechain_as_hexwkb */
	asHexWKB(variant: number): string {
		return F.posechain_as_hexwkb(this.ptr, variant);
	}

	/** MEOS: posechain_as_text */
	asText(maxdd: number): string {
		return F.posechain_as_text(this.ptr, maxdd);
	}

	/** MEOS: posechain_as_wkb */
	asWKB(variant: number): Uint8Array {
		return readWkb(_sizeOut => F.posechain_as_wkb(this.ptr, variant, _sizeOut));
	}

	/** MEOS: posechain_cmp */
	cmp(pc2: PoseChain): number {
		return F.posechain_cmp(this.ptr, pc2.ptr);
	}

	/** MEOS: contained_posechain_set */
	contained(s: PoseChainSet): boolean {
		return F.contained_posechain_set(this.ptr, s.ptr);
	}

	/** MEOS: posechain_copy */
	copy(): PoseChain {
		return wrapPoseChain(F.posechain_copy(this.ptr)) as PoseChain;
	}

	/** MEOS: distance_posechain_geo, distance_posechain_posechain, distance_posechain_stbox, chosen by the arguments' types */
	distance(gs: Geo | PoseChain | STBox): number {
		if (gs instanceof Geo) return this._distance_posechain_geo(gs as Geo);
		if (gs instanceof PoseChain) return this._distance_posechain_posechain(gs as PoseChain);
		if (gs instanceof STBox) return this._distance_posechain_stbox(gs as STBox);
		throw new TypeError(`PoseChain.distance: no overload takes these arguments`);
	}

	/** MEOS: posechain_end_pose */
	endPose(): Pose {
		return wrapPose(F.posechain_end_pose(this.ptr)) as Pose;
	}

	/** MEOS: posechain_eq */
	eq(pc2: PoseChain): boolean {
		return F.posechain_eq(this.ptr, pc2.ptr);
	}

	/** MEOS: ever_eq_posechain_tposechain */
	everEq(temp: TPoseChain): number {
		return F.ever_eq_posechain_tposechain(this.ptr, temp.ptr);
	}

	/** MEOS: ever_ne_posechain_tposechain */
	everNe(temp: TPoseChain): number {
		return F.ever_ne_posechain_tposechain(this.ptr, temp.ptr);
	}

	/** MEOS: posechain_ge */
	ge(pc2: PoseChain): boolean {
		return F.posechain_ge(this.ptr, pc2.ptr);
	}

	/** MEOS: posechain_gt */
	gt(pc2: PoseChain): boolean {
		return F.posechain_gt(this.ptr, pc2.ptr);
	}

	/** MEOS: posechain_hash */
	hash(): number {
		return F.posechain_hash(this.ptr);
	}

	/** MEOS: posechain_hash_extended */
	hashExtended(seed: number): number {
		return F.posechain_hash_extended(this.ptr, seed);
	}

	/** MEOS: intersection_posechain_set */
	intersection(s: PoseChainSet): Set | null {
		return wrapSetOrNull(F.intersection_posechain_set(this.ptr, s.ptr)) as Set | null;
	}

	/** MEOS: posechain_le */
	le(pc2: PoseChain): boolean {
		return F.posechain_le(this.ptr, pc2.ptr);
	}

	/** MEOS: posechain_lt */
	lt(pc2: PoseChain): boolean {
		return F.posechain_lt(this.ptr, pc2.ptr);
	}

	/** MEOS: posechain_mem_size */
	memSize(): number {
		return F.posechain_mem_size(this.ptr);
	}

	/** MEOS: minus_posechain_set */
	minus(s: PoseChainSet): Set | null {
		return wrapSetOrNull(F.minus_posechain_set(this.ptr, s.ptr)) as Set | null;
	}

	/** MEOS: posechain_ne */
	ne(pc2: PoseChain): boolean {
		return F.posechain_ne(this.ptr, pc2.ptr);
	}

	/** MEOS: posechain_num_poses */
	numPoses(): number {
		return F.posechain_num_poses(this.ptr);
	}

	/** MEOS: posechain_out */
	out(maxdd: number): string {
		return F.posechain_out(this.ptr, maxdd);
	}

	/** MEOS: posechain_pose_n */
	poseN(n: number): Pose | null {
		return wrapPoseOrNull(F.posechain_pose_n(this.ptr, n)) as Pose | null;
	}

	/** MEOS: posechain_poses */
	poses(): Pose[] {
		const _count = _alloc(4);
		try {
			const _arr = F.posechain_poses(this.ptr, _count);
			if (!_arr) return [];
			try {
				const _n = _view(_count, 4).getInt32(0, true);
				const _v = _view(_arr, _n * 8);
				const _out: Pose[] = [];
				for (let _i = 0; _i < _n; _i++) _out.push(wrapPose(Number(_v.getBigUint64(_i * 8, true))) as Pose);
				return _out;
			} finally {
				_free(_arr);
			}
		} finally {
			_free(_count);
		}
	}

	/** MEOS: posechain_prefix_pose */
	prefixPose(n: number): Pose | null {
		return wrapPoseOrNull(F.posechain_prefix_pose(this.ptr, n)) as Pose | null;
	}

	/** MEOS: posechain_round */
	round(maxdd: number): PoseChain {
		return wrapPoseChain(F.posechain_round(this.ptr, maxdd)) as PoseChain;
	}

	/** MEOS: posechain_set_srid */
	setSRID(srid: number): PoseChain {
		return wrapPoseChain(F.posechain_set_srid(this.ptr, srid)) as PoseChain;
	}

	/** MEOS: posechain_srid */
	SRID(): number {
		return F.posechain_srid(this.ptr);
	}

	/** MEOS: posechain_start_pose */
	startPose(): Pose {
		return wrapPose(F.posechain_start_pose(this.ptr)) as Pose;
	}

	/** MEOS: teq_posechain_tposechain */
	teq(temp: TPoseChain): Temporal | null {
		return wrapTemporalOrNull(F.teq_posechain_tposechain(this.ptr, temp.ptr)) as Temporal | null;
	}

	/** MEOS: posechain_timestamptz_to_stbox */
	timestamptzToStbox(t: TimestampTz): STBox {
		return wrapSTBox(F.posechain_timestamptz_to_stbox(this.ptr, t)) as STBox;
	}

	/** MEOS: tne_posechain_tposechain */
	tne(temp: TPoseChain): Temporal | null {
		return wrapTemporalOrNull(F.tne_posechain_tposechain(this.ptr, temp.ptr)) as Temporal | null;
	}

	/** MEOS: posechain_to_point */
	toPoint(): Geo {
		return wrapGeo(F.posechain_to_point(this.ptr)) as Geo;
	}

	/** MEOS: posechain_to_pose */
	toPose(): Pose {
		return wrapPose(F.posechain_to_pose(this.ptr)) as Pose;
	}

	/** MEOS: posechain_to_set */
	toSet(): Set {
		return wrapSet(F.posechain_to_set(this.ptr)) as Set;
	}

	/** MEOS: posechain_to_stbox */
	toStbox(): STBox {
		return wrapSTBox(F.posechain_to_stbox(this.ptr)) as STBox;
	}

	/** MEOS: posechain_transform */
	transform(srid_to: number): PoseChain | null {
		return wrapPoseChainOrNull(F.posechain_transform(this.ptr, srid_to)) as PoseChain | null;
	}

	/** MEOS: posechain_transform_pipeline */
	transformPipeline(pipelinestr: string, srid: number, is_forward: boolean): PoseChain | null {
		return wrapPoseChainOrNull(F.posechain_transform_pipeline(this.ptr, pipelinestr, srid, is_forward)) as PoseChain | null;
	}

	/** MEOS: posechain_tstzspan_to_stbox */
	tstzspanToStbox(s: Span): STBox {
		return wrapSTBox(F.posechain_tstzspan_to_stbox(this.ptr, s.ptr)) as STBox;
	}

	/** MEOS: union_posechain_set */
	union(s: PoseChainSet): Set | null {
		return wrapSetOrNull(F.union_posechain_set(this.ptr, s.ptr)) as Set | null;
	}

	/** MEOS: posechain_from_wkb */
	static fromEWKB(wkb: Uint8Array): PoseChain {
		return PoseChain.fromWKB(wkb);
	}

	/** MEOS: posechain_in */
	static fromEWKT(str: string): PoseChain {
		return PoseChain.in(str);
	}

	/** MEOS: posechain_from_hexwkb */
	static fromHexEWKB(hexwkb: string): PoseChain {
		return PoseChain.fromHexWKB(hexwkb);
	}

	/** MEOS: posechain_from_hexwkb */
	static fromHexWKB(hexwkb: string): PoseChain {
		return wrapPoseChain(F.posechain_from_hexwkb(hexwkb)) as PoseChain;
	}

	/** MEOS: posechain_in */
	static fromText(str: string): PoseChain {
		return PoseChain.in(str);
	}

	/** MEOS: posechain_from_wkb */
	static fromWKB(wkb: Uint8Array): PoseChain {
		const _wkb = _bytes(wkb);
		try {
			return wrapPoseChain(F.posechain_from_wkb(_wkb, wkb.length)) as PoseChain;
		} finally {
			_free(_wkb);
		}
	}

	/** MEOS: posechain_in */
	static in(str: string): PoseChain {
		return wrapPoseChain(F.posechain_in(str)) as PoseChain;
	}

	/** MEOS: posechain_make */
	static make(poses: Pose[]): PoseChain {
		const _poses = _ptrArray(poses.map(x => x.ptr));
		try {
			return wrapPoseChain(F.posechain_make(_poses, poses.length)) as PoseChain;
		} finally {
			_free(_poses);
		}
	}
}

/**
 * The PoseChainSet class of the MEOS object model.
 */
export class PoseChainSet extends SpatialSet {

	/** The text MEOS writes this value as (MEOS: spatialset_as_text). */
	override toString(): string {
		return this.asText(15);
	}

	/** MEOS: contains_set_posechain */
	private _contains_set_posechain(pc: PoseChain): boolean {
		return F.contains_set_posechain(this.ptr, pc.ptr);
	}

	/** MEOS: intersection_set_posechain */
	private _intersection_set_posechain(pc: PoseChain): Set | null {
		return wrapSetOrNull(F.intersection_set_posechain(this.ptr, pc.ptr)) as Set | null;
	}

	/** MEOS: minus_set_posechain */
	private _minus_set_posechain(pc: PoseChain): Set | null {
		return wrapSetOrNull(F.minus_set_posechain(this.ptr, pc.ptr)) as Set | null;
	}

	/** MEOS: union_set_posechain */
	private _union_set_posechain(pc: PoseChain): Set | null {
		return wrapSetOrNull(F.union_set_posechain(this.ptr, pc.ptr)) as Set | null;
	}

	/** MEOS: contains_set_posechain, chosen by the arguments' types */
	override contains(pc: PoseChain | Set): boolean {
		if (pc instanceof PoseChain) return this._contains_set_posechain(pc as PoseChain);
		return super.contains(pc as Set);
	}

	/** MEOS: distance_posechainset_posechainset */
	distance(s2: PoseChainSet): number {
		return F.distance_posechainset_posechainset(this.ptr, s2.ptr);
	}

	/** MEOS: posechainset_end_value */
	endValue(): PoseChain {
		return wrapPoseChain(F.posechainset_end_value(this.ptr)) as PoseChain;
	}

	/** MEOS: intersection_set_posechain, chosen by the arguments' types */
	override intersection(pc: PoseChain | Set): Set | null {
		if (pc instanceof PoseChain) return this._intersection_set_posechain(pc as PoseChain);
		return super.intersection(pc as Set);
	}

	/** MEOS: minus_set_posechain, chosen by the arguments' types */
	override minus(pc: PoseChain | Set): Set | null {
		if (pc instanceof PoseChain) return this._minus_set_posechain(pc as PoseChain);
		return super.minus(pc as Set);
	}

	/** MEOS: posechainset_out */
	override out(maxdd: number): string {
		return F.posechainset_out(this.ptr, maxdd);
	}

	/** MEOS: posechainset_start_value */
	startValue(): PoseChain {
		return wrapPoseChain(F.posechainset_start_value(this.ptr)) as PoseChain;
	}

	/** MEOS: union_set_posechain, chosen by the arguments' types */
	override union(pc: PoseChain | Set): Set | null {
		if (pc instanceof PoseChain) return this._union_set_posechain(pc as PoseChain);
		return super.union(pc as Set);
	}

	/** MEOS: posechainset_value_n */
	valueN(n: number): PoseChain | null {
		return wrapPoseChainOrNull(F.posechainset_value_n(this.ptr, n)) as PoseChain | null;
	}

	/** MEOS: posechainset_values */
	values(): PoseChain[] {
		const _count = _alloc(4);
		try {
			const _arr = F.posechainset_values(this.ptr, _count);
			if (!_arr) return [];
			try {
				const _n = _view(_count, 4).getInt32(0, true);
				const _v = _view(_arr, _n * 8);
				const _out: PoseChain[] = [];
				for (let _i = 0; _i < _n; _i++) _out.push(wrapPoseChain(Number(_v.getBigUint64(_i * 8, true))) as PoseChain);
				return _out;
			} finally {
				_free(_arr);
			}
		} finally {
			_free(_count);
		}
	}

	/** MEOS: set_from_wkb */
	static fromEWKB(wkb: Uint8Array): Set {
		return Set.fromWKB(wkb);
	}

	/** MEOS: posechainset_in */
	static fromEWKT(str: string): PoseChainSet {
		return PoseChainSet.in(str);
	}

	/** MEOS: set_from_hexwkb */
	static fromHexEWKB(hexwkb: string): Set {
		return Set.fromHexWKB(hexwkb);
	}

	/** MEOS: posechainset_in */
	static fromText(str: string): PoseChainSet {
		return PoseChainSet.in(str);
	}

	/** MEOS: posechainset_in */
	static in(str: string): PoseChainSet {
		return wrapSet(F.posechainset_in(str)) as PoseChainSet;
	}

	/** MEOS: posechainset_make */
	static make(values: PoseChain[]): PoseChainSet {
		const _values = _ptrArray(values.map(x => x.ptr));
		try {
			return wrapSet(F.posechainset_make(_values, values.length)) as PoseChainSet;
		} finally {
			_free(_values);
		}
	}
}

/**
 * The PoseSet class of the MEOS object model.
 */
export class PoseSet extends SpatialSet {

	/** The text MEOS writes this value as (MEOS: spatialset_as_text). */
	override toString(): string {
		return this.asText(15);
	}

	/** MEOS: contains_set_pose */
	private _contains_set_pose(pose: Pose): boolean {
		return F.contains_set_pose(this.ptr, pose.ptr);
	}

	/** MEOS: intersection_set_pose */
	private _intersection_set_pose(pose: Pose): Set | null {
		return wrapSetOrNull(F.intersection_set_pose(this.ptr, pose.ptr)) as Set | null;
	}

	/** MEOS: minus_set_pose */
	private _minus_set_pose(pose: Pose): Set | null {
		return wrapSetOrNull(F.minus_set_pose(this.ptr, pose.ptr)) as Set | null;
	}

	/** MEOS: union_set_pose */
	private _union_set_pose(pose: Pose): Set | null {
		return wrapSetOrNull(F.union_set_pose(this.ptr, pose.ptr)) as Set | null;
	}

	/** MEOS: contains_set_pose, chosen by the arguments' types */
	override contains(pose: Pose | Set): boolean {
		if (pose instanceof Pose) return this._contains_set_pose(pose as Pose);
		return super.contains(pose as Set);
	}

	/** MEOS: distance_poseset_poseset */
	distance(s2: PoseSet): number {
		return F.distance_poseset_poseset(this.ptr, s2.ptr);
	}

	/** MEOS: poseset_end_value */
	endValue(): Pose {
		return wrapPose(F.poseset_end_value(this.ptr)) as Pose;
	}

	/** MEOS: intersection_set_pose, chosen by the arguments' types */
	override intersection(pose: Pose | Set): Set | null {
		if (pose instanceof Pose) return this._intersection_set_pose(pose as Pose);
		return super.intersection(pose as Set);
	}

	/** MEOS: minus_set_pose, chosen by the arguments' types */
	override minus(pose: Pose | Set): Set | null {
		if (pose instanceof Pose) return this._minus_set_pose(pose as Pose);
		return super.minus(pose as Set);
	}

	/** MEOS: poseset_out */
	override out(maxdd: number): string {
		return F.poseset_out(this.ptr, maxdd);
	}

	/** MEOS: poseset_start_value */
	startValue(): Pose {
		return wrapPose(F.poseset_start_value(this.ptr)) as Pose;
	}

	/** MEOS: union_set_pose, chosen by the arguments' types */
	override union(pose: Pose | Set): Set | null {
		if (pose instanceof Pose) return this._union_set_pose(pose as Pose);
		return super.union(pose as Set);
	}

	/** MEOS: poseset_value_n */
	valueN(n: number): Pose | null {
		return wrapPoseOrNull(F.poseset_value_n(this.ptr, n)) as Pose | null;
	}

	/** MEOS: poseset_values */
	values(): Pose[] {
		const _count = _alloc(4);
		try {
			const _arr = F.poseset_values(this.ptr, _count);
			if (!_arr) return [];
			try {
				const _n = _view(_count, 4).getInt32(0, true);
				const _v = _view(_arr, _n * 8);
				const _out: Pose[] = [];
				for (let _i = 0; _i < _n; _i++) _out.push(wrapPose(Number(_v.getBigUint64(_i * 8, true))) as Pose);
				return _out;
			} finally {
				_free(_arr);
			}
		} finally {
			_free(_count);
		}
	}

	/** MEOS: set_from_wkb */
	static fromEWKB(wkb: Uint8Array): Set {
		return Set.fromWKB(wkb);
	}

	/** MEOS: poseset_in */
	static fromEWKT(str: string): PoseSet {
		return PoseSet.in(str);
	}

	/** MEOS: set_from_hexwkb */
	static fromHexEWKB(hexwkb: string): Set {
		return Set.fromHexWKB(hexwkb);
	}

	/** MEOS: poseset_in */
	static fromText(str: string): PoseSet {
		return PoseSet.in(str);
	}

	/** MEOS: poseset_in */
	static in(str: string): PoseSet {
		return wrapSet(F.poseset_in(str)) as PoseSet;
	}

	/** MEOS: poseset_make */
	static make(values: Pose[]): PoseSet {
		const _values = _ptrArray(values.map(x => x.ptr));
		try {
			return wrapSet(F.poseset_make(_values, values.length)) as PoseSet;
		} finally {
			_free(_values);
		}
	}
}

/**
 * The QuadbinSet class of the MEOS object model.
 */
export class QuadbinSet extends SpatialSet {

	/** The text MEOS writes this value as (MEOS: quadbinset_out). */
	override toString(): string {
		return this.out();
	}

	/** MEOS: contains_set_quadbin */
	private _contains_set_quadbin(cell: Quadbin): boolean {
		return F.contains_set_quadbin(this.ptr, cell);
	}

	/** MEOS: intersection_set_quadbin */
	private _intersection_set_quadbin(cell: Quadbin): Set | null {
		return wrapSetOrNull(F.intersection_set_quadbin(this.ptr, cell)) as Set | null;
	}

	/** MEOS: minus_set_quadbin */
	private _minus_set_quadbin(cell: Quadbin): Set | null {
		return wrapSetOrNull(F.minus_set_quadbin(this.ptr, cell)) as Set | null;
	}

	/** MEOS: union_set_quadbin */
	private _union_set_quadbin(cell: Quadbin): Set | null {
		return wrapSetOrNull(F.union_set_quadbin(this.ptr, cell)) as Set | null;
	}

	/** MEOS: quadbinset_compact_cells */
	compactCells(): Set | null {
		return wrapSetOrNull(F.quadbinset_compact_cells(this.ptr)) as Set | null;
	}

	/** MEOS: contains_set_quadbin, chosen by the arguments' types */
	override contains(cell: Quadbin | Set): boolean {
		if (typeof cell === 'bigint') return this._contains_set_quadbin(cell as Quadbin);
		return super.contains(cell as Set);
	}

	/** MEOS: quadbinset_cover_cells */
	coverCells(resolution: number): Set | null {
		return wrapSetOrNull(F.quadbinset_cover_cells(this.ptr, resolution)) as Set | null;
	}

	/** MEOS: quadbinset_end_value */
	endValue(): Quadbin {
		return F.quadbinset_end_value(this.ptr);
	}

	/** MEOS: ever_eq_quadbinset_tquadbin */
	everEq(tqb: TQuadbin): number {
		return F.ever_eq_quadbinset_tquadbin(this.ptr, tqb.ptr);
	}

	/** MEOS: quadbinset_grid_disk */
	gridDisk(k: number): Set | null {
		return wrapSetOrNull(F.quadbinset_grid_disk(this.ptr, k)) as Set | null;
	}

	/** MEOS: intersection_set_quadbin, chosen by the arguments' types */
	override intersection(cell: Quadbin | Set): Set | null {
		if (typeof cell === 'bigint') return this._intersection_set_quadbin(cell as Quadbin);
		return super.intersection(cell as Set);
	}

	/** MEOS: minus_set_quadbin, chosen by the arguments' types */
	override minus(cell: Quadbin | Set): Set | null {
		if (typeof cell === 'bigint') return this._minus_set_quadbin(cell as Quadbin);
		return super.minus(cell as Set);
	}

	/** MEOS: quadbinset_out */
	override out(): string {
		return F.quadbinset_out(this.ptr);
	}

	/** MEOS: contained_quadbin_set */
	rcontained(cell: Quadbin): boolean {
		return F.contained_quadbin_set(cell, this.ptr);
	}

	/** MEOS: intersection_quadbin_set */
	rintersection(cell: Quadbin): Set | null {
		return wrapSetOrNull(F.intersection_quadbin_set(cell, this.ptr)) as Set | null;
	}

	/** MEOS: minus_quadbin_set */
	rminus(cell: Quadbin): Set | null {
		return wrapSetOrNull(F.minus_quadbin_set(cell, this.ptr)) as Set | null;
	}

	/** MEOS: union_quadbin_set */
	runion(cell: Quadbin): Set | null {
		return wrapSetOrNull(F.union_quadbin_set(cell, this.ptr)) as Set | null;
	}

	/** MEOS: quadbinset_start_value */
	startValue(): Quadbin {
		return F.quadbinset_start_value(this.ptr);
	}

	/** MEOS: quadbinset_uncompact_cells */
	uncompactCells(resolution: number): Set | null {
		return wrapSetOrNull(F.quadbinset_uncompact_cells(this.ptr, resolution)) as Set | null;
	}

	/** MEOS: union_set_quadbin, chosen by the arguments' types */
	override union(cell: Quadbin | Set): Set | null {
		if (typeof cell === 'bigint') return this._union_set_quadbin(cell as Quadbin);
		return super.union(cell as Set);
	}

	/** MEOS: quadbinset_value_n */
	valueN(n: number): Quadbin {
		return F.quadbinset_value_n(this.ptr, n);
	}

	/** MEOS: quadbinset_values */
	values(): bigint[] {
		const _count = _alloc(4);
		try {
			const _arr = F.quadbinset_values(this.ptr, _count);
			if (!_arr) return [];
			try {
				const _n = _view(_count, 4).getInt32(0, true);
				const _v = _view(_arr, _n * 8);
				const _out: bigint[] = [];
				for (let _i = 0; _i < _n; _i++) _out.push(_v.getBigUint64(_i * 8, true));
				return _out;
			} finally {
				_free(_arr);
			}
		} finally {
			_free(_count);
		}
	}

	/** MEOS: set_from_wkb */
	static fromEWKB(wkb: Uint8Array): Set {
		return Set.fromWKB(wkb);
	}

	/** MEOS: quadbinset_in */
	static fromEWKT(str: string): QuadbinSet {
		return QuadbinSet.in(str);
	}

	/** MEOS: set_from_hexwkb */
	static fromHexEWKB(hexwkb: string): Set {
		return Set.fromHexWKB(hexwkb);
	}

	/** MEOS: quadbinset_in */
	static fromText(str: string): QuadbinSet {
		return QuadbinSet.in(str);
	}

	/** MEOS: quadbinset_in */
	static in(str: string): QuadbinSet {
		return wrapSet(F.quadbinset_in(str)) as QuadbinSet;
	}

	/** MEOS: quadbinset_make */
	static make(values: bigint[]): QuadbinSet {
		const _values = _alloc(Math.max(values.length, 1) * 8);
		{ const _v = _view(_values, Math.max(values.length, 1) * 8); values.forEach((_x, _i) => _v.setBigUint64(_i * 8, _x, true)); }
		try {
			return wrapSet(F.quadbinset_make(_values, values.length)) as QuadbinSet;
		} finally {
			_free(_values);
		}
	}
}

/**
 * MEOS's in-memory R-tree over spans, boxes and their kin. MEOS registers it in no enum, so it names no temptype.
 */
export class RTree extends Value {

	/** MEOS: rtree_free */
	free(): void {
		F.rtree_free(this.ptr);
	}

	/** MEOS: rtree_height */
	height(): number {
		return F.rtree_height(this.ptr);
	}

	/** MEOS: rtree_insert */
	insert(box: Ptr, id: number): boolean {
		return F.rtree_insert(this.ptr, box, id);
	}

	/** MEOS: rtree_insert_temporal */
	insertTemporal(temp: Temporal, id: number): boolean {
		return F.rtree_insert_temporal(this.ptr, temp.ptr, id);
	}

	/** MEOS: rtree_insert_temporal_split */
	insertTemporalSplit(temp: Temporal, id: number, maxboxes: number): boolean {
		return F.rtree_insert_temporal_split(this.ptr, temp.ptr, id, maxboxes);
	}

	/** MEOS: rtree_load */
	load(boxes: Ptr, ids: number[]): boolean {
		const _ids = _alloc(Math.max(ids.length, 1) * 8);
		{ const _v = _view(_ids, Math.max(ids.length, 1) * 8); ids.forEach((_x, _i) => _v.setBigInt64(_i * 8, BigInt(_x), true)); }
		try {
			return F.rtree_load(this.ptr, boxes, _ids, ids.length);
		} finally {
			_free(_ids);
		}
	}

	/** MEOS: rtree_mem_size */
	memSize(): number {
		return F.rtree_mem_size(this.ptr);
	}

	/** MEOS: rtree_num_entries */
	numEntries(): number {
		return F.rtree_num_entries(this.ptr);
	}

	/** MEOS: rtree_create_bigintspan */
	static createBigintspan(): RTree {
		return wrapRTree(F.rtree_create_bigintspan()) as RTree;
	}

	/** MEOS: rtree_create_datespan */
	static createDatespan(): RTree {
		return wrapRTree(F.rtree_create_datespan()) as RTree;
	}

	/** MEOS: rtree_create_floatspan */
	static createFloatspan(): RTree {
		return wrapRTree(F.rtree_create_floatspan()) as RTree;
	}

	/** MEOS: rtree_create_intspan */
	static createIntspan(): RTree {
		return wrapRTree(F.rtree_create_intspan()) as RTree;
	}

	/** MEOS: rtree_create_stbox */
	static createStbox(): RTree {
		return wrapRTree(F.rtree_create_stbox()) as RTree;
	}

	/** MEOS: rtree_create_tbox */
	static createTbox(): RTree {
		return wrapRTree(F.rtree_create_tbox()) as RTree;
	}

	/** MEOS: rtree_create_tpcbox */
	static createTpcbox(): RTree {
		return wrapRTree(F.rtree_create_tpcbox()) as RTree;
	}

	/** MEOS: rtree_create_tstzspan */
	static createTstzspan(): RTree {
		return wrapRTree(F.rtree_create_tstzspan()) as RTree;
	}
}

/**
 * A walk over an R-tree's entries in order of distance from a query. MEOS registers it in no enum, so it names no temptype.
 */
export class RTreeNNCursor extends Value {

	/** MEOS: rtree_nn_cursor_close */
	close(): void {
		F.rtree_nn_cursor_close(this.ptr);
	}

	/** MEOS: rtree_nn_cursor_open */
	static open(rtree: RTree, query: Ptr): RTreeNNCursor {
		return wrapRTreeNNCursor(F.rtree_nn_cursor_open(rtree.ptr, query)) as RTreeNNCursor;
	}
}

/**
 * A raster tile. A MeosType no membership predicate admits, as Nsegment is.
 */
export class Raquet extends Value {

	/** The text MEOS writes this value as (MEOS: raquet_out). */
	override toString(): string {
		return this.out();
	}

	/** MEOS: raquet_as_hexwkb */
	asHexWKB(variant: number): string {
		return F.raquet_as_hexwkb(this.ptr, variant);
	}

	/** MEOS: raquet_out */
	asText(): string {
		return this.out();
	}

	/** MEOS: raquet_as_wkb */
	asWKB(variant: number): Uint8Array {
		return readWkb(_sizeOut => F.raquet_as_wkb(this.ptr, variant, _sizeOut));
	}

	/** MEOS: raquet_band_has_nodata_value */
	bandHasNodataValue(): boolean {
		return F.raquet_band_has_nodata_value(this.ptr);
	}

	/** MEOS: raquet_band_nodata_value */
	bandNodataValue(): number {
		return F.raquet_band_nodata_value(this.ptr);
	}

	/** MEOS: raquet_band_pixel_type */
	bandPixelType(): string {
		return F.raquet_band_pixel_type(this.ptr);
	}

	/** MEOS: raquet_cmp */
	cmp(rq2: Raquet): number {
		return F.raquet_cmp(this.ptr, rq2.ptr);
	}

	/** MEOS: raquet_copy */
	copy(): Raquet {
		return wrapRaquet(F.raquet_copy(this.ptr)) as Raquet;
	}

	/** MEOS: raquet_eq */
	eq(rq2: Raquet): boolean {
		return F.raquet_eq(this.ptr, rq2.ptr);
	}

	/** MEOS: raquet_ge */
	ge(rq2: Raquet): boolean {
		return F.raquet_ge(this.ptr, rq2.ptr);
	}

	/** MEOS: raquet_gt */
	gt(rq2: Raquet): boolean {
		return F.raquet_gt(this.ptr, rq2.ptr);
	}

	/** MEOS: raquet_hash */
	hash(): number {
		return F.raquet_hash(this.ptr);
	}

	/** MEOS: raquet_hash_extended */
	hashExtended(seed: number): number {
		return F.raquet_hash_extended(this.ptr, seed);
	}

	/** MEOS: raquet_height */
	height(): number {
		return F.raquet_height(this.ptr);
	}

	/** MEOS: raquet_le */
	le(rq2: Raquet): boolean {
		return F.raquet_le(this.ptr, rq2.ptr);
	}

	/** MEOS: raquet_lt */
	lt(rq2: Raquet): boolean {
		return F.raquet_lt(this.ptr, rq2.ptr);
	}

	/** MEOS: raquet_mem_size */
	memSize(): number {
		return F.raquet_mem_size(this.ptr);
	}

	/** MEOS: raquet_ne */
	ne(rq2: Raquet): boolean {
		return F.raquet_ne(this.ptr, rq2.ptr);
	}

	/** MEOS: raquet_out */
	out(): string {
		return F.raquet_out(this.ptr);
	}

	/** MEOS: raquet_pixels */
	pixels(): Uint8Array {
		return readWkb(_sizeOut => F.raquet_pixels(this.ptr, _sizeOut));
	}

	/** MEOS: raquet_quadbin */
	quadbin(): Quadbin {
		return F.raquet_quadbin(this.ptr);
	}

	/** MEOS: raquet_to_stbox */
	toStbox(): STBox {
		return wrapSTBox(F.raquet_to_stbox(this.ptr)) as STBox;
	}

	/** MEOS: raquet_width */
	width(): number {
		return F.raquet_width(this.ptr);
	}

	/** MEOS: raquet_from_hexwkb */
	static fromHexWKB(hexwkb: string): Raquet {
		return wrapRaquet(F.raquet_from_hexwkb(hexwkb)) as Raquet;
	}

	/** MEOS: raquet_in */
	static fromText(str: string): Raquet {
		return Raquet.in(str);
	}

	/** MEOS: raquet_from_wkb */
	static fromWKB(wkb: Uint8Array): Raquet {
		const _wkb = _bytes(wkb);
		try {
			return wrapRaquet(F.raquet_from_wkb(_wkb, wkb.length)) as Raquet;
		} finally {
			_free(_wkb);
		}
	}

	/** MEOS: raquet_in */
	static in(str: string): Raquet {
		return wrapRaquet(F.raquet_in(str)) as Raquet;
	}

	/** MEOS: raquet_make */
	static make(quadbin: Quadbin, width: number, height: number, pixtype: number, nodata: number, has_nodata: boolean, pixels: Uint8Array): Raquet {
		const _pixels = _bytes(pixels);
		try {
			return wrapRaquet(F.raquet_make(quadbin, width, height, pixtype, nodata, has_nodata, _pixels, pixels.length)) as Raquet;
		} finally {
			_free(_pixels);
		}
	}

	/** MEOS: raquet_pixtype_from_string */
	static pixtypeFromString(str: string): number {
		return F.raquet_pixtype_from_string(str);
	}

	/** MEOS: raquet_pixtype_size */
	static pixtypeSize(pixtype: number): number {
		return F.raquet_pixtype_size(pixtype);
	}

	/** MEOS: raquet_read */
	static read(path: string, quadbin: Quadbin): Raquet | null {
		return wrapRaquetOrNull(F.raquet_read(path, quadbin)) as Raquet | null;
	}

	/** MEOS: raquet_read_bytes */
	static readBytes(data: Uint8Array, quadbin: Quadbin): Raquet | null {
		const _data = _bytes(data);
		try {
			return wrapRaquetOrNull(F.raquet_read_bytes(_data, data.length, quadbin)) as Raquet | null;
		} finally {
			_free(_data);
		}
	}
}

/**
 * A georeferenced raster of one or more bands, the value every raster accessor, clip, warp and polygonization takes. MEOS registers it in no enum, so it names no temptype.
 */
export class Raster extends Value {

	/** MEOS: add_raster_float */
	private _add_raster_float(d: number): Raster | null {
		return wrapRasterOrNull(F.add_raster_float(this.ptr, d)) as Raster | null;
	}

	/** MEOS: add_raster_raster */
	private _add_raster_raster(rast2: Raster): Raster | null {
		return wrapRasterOrNull(F.add_raster_raster(this.ptr, rast2.ptr)) as Raster | null;
	}

	/** MEOS: div_raster_float */
	private _div_raster_float(d: number): Raster | null {
		return wrapRasterOrNull(F.div_raster_float(this.ptr, d)) as Raster | null;
	}

	/** MEOS: div_raster_raster */
	private _div_raster_raster(rast2: Raster): Raster | null {
		return wrapRasterOrNull(F.div_raster_raster(this.ptr, rast2.ptr)) as Raster | null;
	}

	/** MEOS: mul_raster_float */
	private _mul_raster_float(d: number): Raster | null {
		return wrapRasterOrNull(F.mul_raster_float(this.ptr, d)) as Raster | null;
	}

	/** MEOS: mul_raster_raster */
	private _mul_raster_raster(rast2: Raster): Raster | null {
		return wrapRasterOrNull(F.mul_raster_raster(this.ptr, rast2.ptr)) as Raster | null;
	}

	/** MEOS: sub_raster_float */
	private _sub_raster_float(d: number): Raster | null {
		return wrapRasterOrNull(F.sub_raster_float(this.ptr, d)) as Raster | null;
	}

	/** MEOS: sub_raster_raster */
	private _sub_raster_raster(rast2: Raster): Raster | null {
		return wrapRasterOrNull(F.sub_raster_raster(this.ptr, rast2.ptr)) as Raster | null;
	}

	/** MEOS: add_raster_float, add_raster_raster, chosen by the arguments' types */
	add(d: number | Raster): Raster | null {
		if (d instanceof Raster) return this._add_raster_raster(d as Raster);
		if (typeof d === 'number') return this._add_raster_float(d as number);
		throw new TypeError(`Raster.add: no overload takes these arguments`);
	}

	/** MEOS: raster_add_band */
	addBand(index: number, pixeltype: string, initialvalue: number, nodataval: number, has_nodata: boolean): Raster | null {
		return wrapRasterOrNull(F.raster_add_band(this.ptr, index, pixeltype, initialvalue, nodataval, has_nodata)) as Raster | null;
	}

	/** MEOS: raster_add_band_raster */
	addBandRaster(fromrast: Raster, fromband: number, toindex: number): Raster | null {
		return wrapRasterOrNull(F.raster_add_band_raster(this.ptr, fromrast.ptr, fromband, toindex)) as Raster | null;
	}

	/** MEOS: raster_as_hexwkb */
	asHexWKB(variant: number): string {
		return F.raster_as_hexwkb(this.ptr, variant);
	}

	/** MEOS: raster_as_wkb */
	asWKB(variant: number): Uint8Array {
		return readWkb(_sizeOut => F.raster_as_wkb(this.ptr, variant, _sizeOut));
	}

	/** MEOS: raster_band_has_nodata_value */
	bandHasNodataValue(band: number): boolean {
		return F.raster_band_has_nodata_value(this.ptr, band);
	}

	/** MEOS: raster_band_nodata_value */
	bandNodataValue(band: number): number {
		return F.raster_band_nodata_value(this.ptr, band);
	}

	/** MEOS: raster_band_pixels */
	bandPixels(band: number): Uint8Array {
		return readWkb(_sizeOut => F.raster_band_pixels(this.ptr, band, _sizeOut));
	}

	/** MEOS: raster_band_pixel_type */
	bandPixelType(band: number): string {
		return F.raster_band_pixel_type(this.ptr, band);
	}

	/** MEOS: raster_clip */
	clip(bands: number[], gs: Geo, nodata: number[], crop: boolean, touched: boolean): Raster | null {
		const _bands = _alloc(Math.max(bands.length, 1) * 4);
		{ const _v = _view(_bands, Math.max(bands.length, 1) * 4); bands.forEach((_x, _i) => _v.setInt32(_i * 4, _x, true)); }
		const _nodata = _alloc(Math.max(nodata.length, 1) * 8);
		{ const _v = _view(_nodata, Math.max(nodata.length, 1) * 8); nodata.forEach((_x, _i) => _v.setFloat64(_i * 8, _x, true)); }
		try {
			return wrapRasterOrNull(F.raster_clip(this.ptr, _bands, bands.length, gs.ptr, _nodata, nodata.length, crop, touched)) as Raster | null;
		} finally {
			_free(_bands);
			_free(_nodata);
		}
	}

	/** MEOS: raster_copy */
	copy(): Raster {
		return wrapRaster(F.raster_copy(this.ptr)) as Raster;
	}

	/** MEOS: div_raster_float, div_raster_raster, chosen by the arguments' types */
	div(d: number | Raster): Raster | null {
		if (d instanceof Raster) return this._div_raster_raster(d as Raster);
		if (typeof d === 'number') return this._div_raster_float(d as number);
		throw new TypeError(`Raster.div: no overload takes these arguments`);
	}

	/** MEOS: raster_height */
	height(): number {
		return F.raster_height(this.ptr);
	}

	/** MEOS: raster_map_algebra */
	mapAlgebra(band: number, stat: string, pixeltype: string, extenttype: string, customextent: Raster, distancex: number, distancey: number): Raster | null {
		return wrapRasterOrNull(F.raster_map_algebra(this.ptr, band, stat, pixeltype, extenttype, customextent.ptr, distancex, distancey)) as Raster | null;
	}

	/** MEOS: raster_mem_size */
	memSize(): number {
		return F.raster_mem_size(this.ptr);
	}

	/** MEOS: mul_raster_float, mul_raster_raster, chosen by the arguments' types */
	mul(d: number | Raster): Raster | null {
		if (d instanceof Raster) return this._mul_raster_raster(d as Raster);
		if (typeof d === 'number') return this._mul_raster_float(d as number);
		throw new TypeError(`Raster.mul: no overload takes these arguments`);
	}

	/** MEOS: raster_not_same_alignment_reason */
	notSameAlignmentReason(rast2: Raster): string {
		return F.raster_not_same_alignment_reason(this.ptr, rast2.ptr);
	}

	/** MEOS: raster_num_bands */
	numBands(): number {
		return F.raster_num_bands(this.ptr);
	}

	/** MEOS: add_float_raster */
	radd(d: number): Raster | null {
		return wrapRasterOrNull(F.add_float_raster(d, this.ptr)) as Raster | null;
	}

	/** MEOS: div_float_raster */
	rdiv(d: number): Raster | null {
		return wrapRasterOrNull(F.div_float_raster(d, this.ptr)) as Raster | null;
	}

	/** MEOS: raster_reclass */
	reclass(band: number, expr: string, pixeltype: string, has_nodata: boolean, nodataval: number): Raster | null {
		return wrapRasterOrNull(F.raster_reclass(this.ptr, band, expr, pixeltype, has_nodata, nodataval)) as Raster | null;
	}

	/** MEOS: raster_rescale */
	rescale(scale_x: number, scale_y: number, algorithm: string, max_err: number): Raster | null {
		return wrapRasterOrNull(F.raster_rescale(this.ptr, scale_x, scale_y, algorithm, max_err)) as Raster | null;
	}

	/** MEOS: mul_float_raster */
	rmul(d: number): Raster | null {
		return wrapRasterOrNull(F.mul_float_raster(d, this.ptr)) as Raster | null;
	}

	/** MEOS: sub_float_raster */
	rsub(d: number): Raster | null {
		return wrapRasterOrNull(F.sub_float_raster(d, this.ptr)) as Raster | null;
	}

	/** MEOS: raster_same_alignment */
	sameAlignment(rast2: Raster): boolean {
		return F.raster_same_alignment(this.ptr, rast2.ptr);
	}

	/** MEOS: raster_scale_x */
	scaleX(): number {
		return F.raster_scale_x(this.ptr);
	}

	/** MEOS: raster_scale_y */
	scaleY(): number {
		return F.raster_scale_y(this.ptr);
	}

	/** MEOS: raster_set_values */
	setValues(band: number, x: number, y: number, width: number, height: number, values: number[], nodata: boolean[], noset: boolean[], nosetheight: number, count: number, keepnodata: boolean): Raster | null {
		const _values = _alloc(Math.max(values.length, 1) * 8);
		{ const _v = _view(_values, Math.max(values.length, 1) * 8); values.forEach((_x, _i) => _v.setFloat64(_i * 8, _x, true)); }
		const _nodata = _alloc(Math.max(nodata.length, 1) * 1);
		{ const _v = _view(_nodata, Math.max(nodata.length, 1) * 1); nodata.forEach((_x, _i) => _v.setUint8(_i * 1, _x ? 1 : 0)); }
		const _noset = _alloc(Math.max(noset.length, 1) * 1);
		{ const _v = _view(_noset, Math.max(noset.length, 1) * 1); noset.forEach((_x, _i) => _v.setUint8(_i * 1, _x ? 1 : 0)); }
		try {
			return wrapRasterOrNull(F.raster_set_values(this.ptr, band, x, y, width, height, _values, _nodata, _noset, values.length, nosetheight, count, keepnodata)) as Raster | null;
		} finally {
			_free(_values);
			_free(_nodata);
			_free(_noset);
		}
	}

	/** MEOS: raster_skew_x */
	skewX(): number {
		return F.raster_skew_x(this.ptr);
	}

	/** MEOS: raster_skew_y */
	skewY(): number {
		return F.raster_skew_y(this.ptr);
	}

	/** MEOS: raster_slope */
	slope(band: number, customextent: Raster, pixeltype: string, units: string, scale: number, interpolate_nodata: boolean): Raster | null {
		return wrapRasterOrNull(F.raster_slope(this.ptr, band, customextent.ptr, pixeltype, units, scale, interpolate_nodata)) as Raster | null;
	}

	/** MEOS: raster_srid */
	SRID(): number {
		return F.raster_srid(this.ptr);
	}

	/** MEOS: sub_raster_float, sub_raster_raster, chosen by the arguments' types */
	sub(d: number | Raster): Raster | null {
		if (d instanceof Raster) return this._sub_raster_raster(d as Raster);
		if (typeof d === 'number') return this._sub_raster_float(d as number);
		throw new TypeError(`Raster.sub: no overload takes these arguments`);
	}

	/** MEOS: raster_summary_stats */
	summaryStats(band: number, exclude_nodata: boolean): BandStats {
		return _takeBandStats(F.raster_summary_stats(this.ptr, band, exclude_nodata))!;
	}

	/** MEOS: raster_to_stbox */
	toStbox(): STBox {
		return wrapSTBox(F.raster_to_stbox(this.ptr)) as STBox;
	}

	/** MEOS: raster_tpi */
	tpi(band: number, customextent: Raster, pixeltype: string, interpolate_nodata: boolean): Raster | null {
		return wrapRasterOrNull(F.raster_tpi(this.ptr, band, customextent.ptr, pixeltype, interpolate_nodata)) as Raster | null;
	}

	/** MEOS: raster_transform */
	transform(srid: number, algorithm: string, max_err: number, scale_x: number, scale_y: number): Raster | null {
		return wrapRasterOrNull(F.raster_transform(this.ptr, srid, algorithm, max_err, scale_x, scale_y)) as Raster | null;
	}

	/** MEOS: raster_transform_pipeline */
	transformPipeline(pipelinestr: string, srid: number, is_forward: boolean, algorithm: string, max_err: number, scale_x: number, scale_y: number): Raster | null {
		return wrapRasterOrNull(F.raster_transform_pipeline(this.ptr, pipelinestr, srid, is_forward, algorithm, max_err, scale_x, scale_y)) as Raster | null;
	}

	/** MEOS: raster_transform_raster */
	transformRaster(alignto: Raster, algorithm: string, max_err: number): Raster | null {
		return wrapRasterOrNull(F.raster_transform_raster(this.ptr, alignto.ptr, algorithm, max_err)) as Raster | null;
	}

	/** MEOS: raster_tri */
	tri(band: number, customextent: Raster, pixeltype: string, interpolate_nodata: boolean): Raster | null {
		return wrapRasterOrNull(F.raster_tri(this.ptr, band, customextent.ptr, pixeltype, interpolate_nodata)) as Raster | null;
	}

	/** MEOS: raster_upper_left_x */
	upperLeftX(): number {
		return F.raster_upper_left_x(this.ptr);
	}

	/** MEOS: raster_upper_left_y */
	upperLeftY(): number {
		return F.raster_upper_left_y(this.ptr);
	}

	/** MEOS: raster_value_count */
	valueCount(band: number, exclude_nodata: boolean, searchvalues: number[], roundto: number): ValueCount[] {
		const _searchvalues = _alloc(Math.max(searchvalues.length, 1) * 8);
		{ const _v = _view(_searchvalues, Math.max(searchvalues.length, 1) * 8); searchvalues.forEach((_x, _i) => _v.setFloat64(_i * 8, _x, true)); }
		const _count = _alloc(4);
		try {
			const _arr = F.raster_value_count(this.ptr, band, exclude_nodata, _searchvalues, searchvalues.length, roundto, _count);
			if (!_arr) return [];
			try {
				const _n = _view(_count, 4).getInt32(0, true);
				const _v = _view(_arr, _n * 24);
				const _out: ValueCount[] = [];
				for (let _i = 0; _i < _n; _i++) _out.push(_readValueCount(_arr + _i * 24));
				return _out;
			} finally {
				_free(_arr);
			}
		} finally {
			_free(_searchvalues);
			_free(_count);
		}
	}

	/** MEOS: raster_width */
	width(): number {
		return F.raster_width(this.ptr);
	}

	/** MEOS: raster_at_value */
	static atValue(traj: Temporal, rast: Raster, band: number, vspan: Span): Temporal | null {
		return wrapTemporalOrNull(F.raster_at_value(traj.ptr, rast.ptr, band, vspan.ptr)) as Temporal | null;
	}

	/** MEOS: raster_at_value_gdal */
	static atValueGdal(traj: Temporal, path: string, band: number, vspan: Span): Temporal | null {
		return wrapTemporalOrNull(F.raster_at_value_gdal(traj.ptr, path, band, vspan.ptr)) as Temporal | null;
	}

	/** MEOS: raster_from_hexwkb */
	static fromHexWKB(hexwkb: string): Raster | null {
		return wrapRasterOrNull(F.raster_from_hexwkb(hexwkb)) as Raster | null;
	}

	/** MEOS: raster_from_wkb */
	static fromWKB(wkb: Uint8Array): Raster | null {
		const _wkb = _bytes(wkb);
		try {
			return wrapRasterOrNull(F.raster_from_wkb(_wkb, wkb.length)) as Raster | null;
		} finally {
			_free(_wkb);
		}
	}

	/** MEOS: raster_make */
	static make(width: number, height: number, upperleftx: number, upperlefty: number, scalex: number, scaley: number, skewx: number, skewy: number, srid: number, pixeltype: string, nodataval: number, has_nodata: boolean, pixels: Uint8Array): Raster | null {
		const _pixels = _bytes(pixels);
		try {
			return wrapRasterOrNull(F.raster_make(width, height, upperleftx, upperlefty, scalex, scaley, skewx, skewy, srid, pixeltype, nodataval, has_nodata, _pixels, pixels.length)) as Raster | null;
		} finally {
			_free(_pixels);
		}
	}

	/** MEOS: raster_make_empty */
	static makeEmpty(width: number, height: number, upperleftx: number, upperlefty: number, scalex: number, scaley: number, skewx: number, skewy: number, srid: number): Raster | null {
		return wrapRasterOrNull(F.raster_make_empty(width, height, upperleftx, upperlefty, scalex, scaley, skewx, skewy, srid)) as Raster | null;
	}

	/** MEOS: raster_minus_value */
	static minusValue(traj: Temporal, rast: Raster, band: number, vspan: Span): Temporal | null {
		return wrapTemporalOrNull(F.raster_minus_value(traj.ptr, rast.ptr, band, vspan.ptr)) as Temporal | null;
	}

	/** MEOS: raster_minus_value_gdal */
	static minusValueGdal(traj: Temporal, path: string, band: number, vspan: Span): Temporal | null {
		return wrapTemporalOrNull(F.raster_minus_value_gdal(traj.ptr, path, band, vspan.ptr)) as Temporal | null;
	}

	/** MEOS: raster_tile_value */
	static tileValue(traj: Temporal, rq: Raquet): Temporal | null {
		return wrapTemporalOrNull(F.raster_tile_value(traj.ptr, rq.ptr)) as Temporal | null;
	}

	/** MEOS: raster_tile_value_array */
	static tileValueArray(traj: Temporal, rqarr: Raquet[]): Temporal | null {
		const _rqarr = _ptrArray(rqarr.map(x => x.ptr));
		try {
			return wrapTemporalOrNull(F.raster_tile_value_array(traj.ptr, _rqarr, rqarr.length)) as Temporal | null;
		} finally {
			_free(_rqarr);
		}
	}

	/** MEOS: raster_tile_value_quadbin */
	static tileValueQuadbin(traj: Temporal, pixels: Uint8Array, width: number, height: number, quadbin: Quadbin, pixtype: number, nodata: number, has_nodata: boolean): Temporal | null {
		const _pixels = _bytes(pixels);
		try {
			return wrapTemporalOrNull(F.raster_tile_value_quadbin(traj.ptr, _pixels, pixels.length, width, height, quadbin, pixtype, nodata, has_nodata)) as Temporal | null;
		} finally {
			_free(_pixels);
		}
	}

	/** MEOS: raster_value */
	static value(traj: Temporal, rast: Raster, band: number, exclude_nodata: boolean, resample: string): Temporal | null {
		return wrapTemporalOrNull(F.raster_value(traj.ptr, rast.ptr, band, exclude_nodata, resample)) as Temporal | null;
	}

	/** MEOS: raster_value_gdal */
	static valueGdal(traj: Temporal, path: string, band: number): Temporal | null {
		return wrapTemporalOrNull(F.raster_value_gdal(traj.ptr, path, band)) as Temporal | null;
	}
}

/**
 * The S2CellSet class of the MEOS object model.
 */
export class S2CellSet extends SpatialSet {

	/** The text MEOS writes this value as (MEOS: s2cellset_out). */
	override toString(): string {
		return this.out();
	}

	/** MEOS: contains_set_s2cell */
	private _contains_set_s2cell(cell: S2CellId): boolean {
		return F.contains_set_s2cell(this.ptr, cell);
	}

	/** MEOS: intersection_set_s2cell */
	private _intersection_set_s2cell(cell: S2CellId): Set | null {
		return wrapSetOrNull(F.intersection_set_s2cell(this.ptr, cell)) as Set | null;
	}

	/** MEOS: minus_set_s2cell */
	private _minus_set_s2cell(cell: S2CellId): Set | null {
		return wrapSetOrNull(F.minus_set_s2cell(this.ptr, cell)) as Set | null;
	}

	/** MEOS: union_set_s2cell */
	private _union_set_s2cell(cell: S2CellId): Set | null {
		return wrapSetOrNull(F.union_set_s2cell(this.ptr, cell)) as Set | null;
	}

	/** MEOS: s2cellset_compact_cells */
	compactCells(): Set | null {
		return wrapSetOrNull(F.s2cellset_compact_cells(this.ptr)) as Set | null;
	}

	/** MEOS: contains_set_s2cell, chosen by the arguments' types */
	override contains(cell: S2CellId | Set): boolean {
		if (typeof cell === 'bigint') return this._contains_set_s2cell(cell as S2CellId);
		return super.contains(cell as Set);
	}

	/** MEOS: s2cellset_cover_cells */
	coverCells(resolution: number): Set | null {
		return wrapSetOrNull(F.s2cellset_cover_cells(this.ptr, resolution)) as Set | null;
	}

	/** MEOS: s2cellset_end_value */
	endValue(): S2CellId {
		return F.s2cellset_end_value(this.ptr);
	}

	/** MEOS: ever_eq_s2cellset_ts2cell */
	everEq(temp: TS2Cell): number {
		return F.ever_eq_s2cellset_ts2cell(this.ptr, temp.ptr);
	}

	/** MEOS: intersection_set_s2cell, chosen by the arguments' types */
	override intersection(cell: S2CellId | Set): Set | null {
		if (typeof cell === 'bigint') return this._intersection_set_s2cell(cell as S2CellId);
		return super.intersection(cell as Set);
	}

	/** MEOS: minus_set_s2cell, chosen by the arguments' types */
	override minus(cell: S2CellId | Set): Set | null {
		if (typeof cell === 'bigint') return this._minus_set_s2cell(cell as S2CellId);
		return super.minus(cell as Set);
	}

	/** MEOS: s2cellset_out */
	override out(): string {
		return F.s2cellset_out(this.ptr);
	}

	/** MEOS: contained_s2cell_set */
	rcontained(cell: S2CellId): boolean {
		return F.contained_s2cell_set(cell, this.ptr);
	}

	/** MEOS: intersection_s2cell_set */
	rintersection(cell: S2CellId): Set | null {
		return wrapSetOrNull(F.intersection_s2cell_set(cell, this.ptr)) as Set | null;
	}

	/** MEOS: minus_s2cell_set */
	rminus(cell: S2CellId): Set | null {
		return wrapSetOrNull(F.minus_s2cell_set(cell, this.ptr)) as Set | null;
	}

	/** MEOS: union_s2cell_set */
	runion(cell: S2CellId): Set | null {
		return wrapSetOrNull(F.union_s2cell_set(cell, this.ptr)) as Set | null;
	}

	/** MEOS: s2cellset_start_value */
	startValue(): S2CellId {
		return F.s2cellset_start_value(this.ptr);
	}

	/** MEOS: s2cellset_uncompact_cells */
	uncompactCells(resolution: number): Set | null {
		return wrapSetOrNull(F.s2cellset_uncompact_cells(this.ptr, resolution)) as Set | null;
	}

	/** MEOS: union_set_s2cell, chosen by the arguments' types */
	override union(cell: S2CellId | Set): Set | null {
		if (typeof cell === 'bigint') return this._union_set_s2cell(cell as S2CellId);
		return super.union(cell as Set);
	}

	/** MEOS: s2cellset_value_n */
	valueN(n: number): S2CellId {
		return F.s2cellset_value_n(this.ptr, n);
	}

	/** MEOS: s2cellset_values */
	values(): bigint[] {
		const _count = _alloc(4);
		try {
			const _arr = F.s2cellset_values(this.ptr, _count);
			if (!_arr) return [];
			try {
				const _n = _view(_count, 4).getInt32(0, true);
				const _v = _view(_arr, _n * 8);
				const _out: bigint[] = [];
				for (let _i = 0; _i < _n; _i++) _out.push(_v.getBigUint64(_i * 8, true));
				return _out;
			} finally {
				_free(_arr);
			}
		} finally {
			_free(_count);
		}
	}

	/** MEOS: set_from_wkb */
	static fromEWKB(wkb: Uint8Array): Set {
		return Set.fromWKB(wkb);
	}

	/** MEOS: s2cellset_in */
	static fromEWKT(str: string): S2CellSet {
		return S2CellSet.in(str);
	}

	/** MEOS: set_from_hexwkb */
	static fromHexEWKB(hexwkb: string): Set {
		return Set.fromHexWKB(hexwkb);
	}

	/** MEOS: s2cellset_in */
	static fromText(str: string): S2CellSet {
		return S2CellSet.in(str);
	}

	/** MEOS: s2cellset_in */
	static in(str: string): S2CellSet {
		return wrapSet(F.s2cellset_in(str)) as S2CellSet;
	}

	/** MEOS: s2cellset_make */
	static make(values: bigint[]): S2CellSet {
		const _values = _alloc(Math.max(values.length, 1) * 8);
		{ const _v = _view(_values, Math.max(values.length, 1) * 8); values.forEach((_x, _i) => _v.setBigUint64(_i * 8, _x, true)); }
		try {
			return wrapSet(F.s2cellset_make(_values, values.length)) as S2CellSet;
		} finally {
			_free(_values);
		}
	}
}

/**
 * The SP-tree's nearest-neighbour walk, the R-tree cursor's sibling. MEOS registers it in no enum, so it names no temptype.
 */
export class SPNNCursor extends Value {

	/** MEOS: sptree_nn_cursor_close */
	close(): void {
		F.sptree_nn_cursor_close(this.ptr);
	}

	/** MEOS: sptree_nn_cursor_open */
	static open(sptree: SPTree, query: Ptr): SPNNCursor {
		return wrapSPNNCursor(F.sptree_nn_cursor_open(sptree.ptr, query)) as SPNNCursor;
	}
}

/**
 * MEOS's in-memory SP-tree, the R-tree's sibling over the same key types. MEOS registers it in no enum, so it names no temptype.
 */
export class SPTree extends Value {

	/** MEOS: sptree_free */
	free(): void {
		F.sptree_free(this.ptr);
	}

	/** MEOS: sptree_height */
	height(): number {
		return F.sptree_height(this.ptr);
	}

	/** MEOS: sptree_insert */
	insert(box: Ptr, id: number): boolean {
		return F.sptree_insert(this.ptr, box, id);
	}

	/** MEOS: sptree_insert_temporal */
	insertTemporal(temp: Temporal, id: number): boolean {
		return F.sptree_insert_temporal(this.ptr, temp.ptr, id);
	}

	/** MEOS: sptree_insert_temporal_split */
	insertTemporalSplit(temp: Temporal, id: number, maxboxes: number): boolean {
		return F.sptree_insert_temporal_split(this.ptr, temp.ptr, id, maxboxes);
	}

	/** MEOS: sptree_load */
	load(boxes: Ptr, ids: number[]): boolean {
		const _ids = _alloc(Math.max(ids.length, 1) * 8);
		{ const _v = _view(_ids, Math.max(ids.length, 1) * 8); ids.forEach((_x, _i) => _v.setBigInt64(_i * 8, BigInt(_x), true)); }
		try {
			return F.sptree_load(this.ptr, boxes, _ids, ids.length);
		} finally {
			_free(_ids);
		}
	}

	/** MEOS: sptree_mem_size */
	memSize(): number {
		return F.sptree_mem_size(this.ptr);
	}

	/** MEOS: sptree_num_entries */
	numEntries(): number {
		return F.sptree_num_entries(this.ptr);
	}

	/** MEOS: sptree_create_bigintspan */
	static createBigintspan(kind: number): SPTree {
		return wrapSPTree(F.sptree_create_bigintspan(kind)) as SPTree;
	}

	/** MEOS: sptree_create_datespan */
	static createDatespan(kind: number): SPTree {
		return wrapSPTree(F.sptree_create_datespan(kind)) as SPTree;
	}

	/** MEOS: sptree_create_floatspan */
	static createFloatspan(kind: number): SPTree {
		return wrapSPTree(F.sptree_create_floatspan(kind)) as SPTree;
	}

	/** MEOS: sptree_create_intspan */
	static createIntspan(kind: number): SPTree {
		return wrapSPTree(F.sptree_create_intspan(kind)) as SPTree;
	}

	/** MEOS: sptree_create_stbox */
	static createStbox(kind: number): SPTree {
		return wrapSPTree(F.sptree_create_stbox(kind)) as SPTree;
	}

	/** MEOS: sptree_create_tbox */
	static createTbox(kind: number): SPTree {
		return wrapSPTree(F.sptree_create_tbox(kind)) as SPTree;
	}

	/** MEOS: sptree_create_tpcbox */
	static createTpcbox(kind: number): SPTree {
		return wrapSPTree(F.sptree_create_tpcbox(kind)) as SPTree;
	}

	/** MEOS: sptree_create_tstzspan */
	static createTstzspan(kind: number): SPTree {
		return wrapSPTree(F.sptree_create_tstzspan(kind)) as SPTree;
	}
}

/**
 * Space x time box (bbox of TSpatial).
 */
export class STBox extends Box {

	/** The text MEOS writes this value as (MEOS: stbox_out). */
	override toString(): string {
		return this.out(15);
	}

	/** MEOS: above_stbox_stbox */
	private _above_stbox_stbox(box2: STBox): boolean {
		return F.above_stbox_stbox(this.ptr, box2.ptr);
	}

	/** MEOS: above_stbox_tspatial */
	private _above_stbox_tspatial(temp: TSpatial): boolean {
		return F.above_stbox_tspatial(this.ptr, temp.ptr);
	}

	/** MEOS: adjacent_stbox_stbox */
	private _adjacent_stbox_stbox(box2: STBox): boolean {
		return F.adjacent_stbox_stbox(this.ptr, box2.ptr);
	}

	/** MEOS: adjacent_stbox_tspatial */
	private _adjacent_stbox_tspatial(temp: TSpatial): boolean {
		return F.adjacent_stbox_tspatial(this.ptr, temp.ptr);
	}

	/** MEOS: after_stbox_stbox */
	private _after_stbox_stbox(box2: STBox): boolean {
		return F.after_stbox_stbox(this.ptr, box2.ptr);
	}

	/** MEOS: after_stbox_tspatial */
	private _after_stbox_tspatial(temp: TSpatial): boolean {
		return F.after_stbox_tspatial(this.ptr, temp.ptr);
	}

	/** MEOS: back_stbox_stbox */
	private _back_stbox_stbox(box2: STBox): boolean {
		return F.back_stbox_stbox(this.ptr, box2.ptr);
	}

	/** MEOS: back_stbox_tspatial */
	private _back_stbox_tspatial(temp: TSpatial): boolean {
		return F.back_stbox_tspatial(this.ptr, temp.ptr);
	}

	/** MEOS: before_stbox_stbox */
	private _before_stbox_stbox(box2: STBox): boolean {
		return F.before_stbox_stbox(this.ptr, box2.ptr);
	}

	/** MEOS: before_stbox_tspatial */
	private _before_stbox_tspatial(temp: TSpatial): boolean {
		return F.before_stbox_tspatial(this.ptr, temp.ptr);
	}

	/** MEOS: below_stbox_stbox */
	private _below_stbox_stbox(box2: STBox): boolean {
		return F.below_stbox_stbox(this.ptr, box2.ptr);
	}

	/** MEOS: below_stbox_tspatial */
	private _below_stbox_tspatial(temp: TSpatial): boolean {
		return F.below_stbox_tspatial(this.ptr, temp.ptr);
	}

	/** MEOS: contained_stbox_stbox */
	private _contained_stbox_stbox(box2: STBox): boolean {
		return F.contained_stbox_stbox(this.ptr, box2.ptr);
	}

	/** MEOS: contained_stbox_tspatial */
	private _contained_stbox_tspatial(temp: TSpatial): boolean {
		return F.contained_stbox_tspatial(this.ptr, temp.ptr);
	}

	/** MEOS: contains_stbox_stbox */
	private _contains_stbox_stbox(box2: STBox): boolean {
		return F.contains_stbox_stbox(this.ptr, box2.ptr);
	}

	/** MEOS: contains_stbox_tspatial */
	private _contains_stbox_tspatial(temp: TSpatial): boolean {
		return F.contains_stbox_tspatial(this.ptr, temp.ptr);
	}

	/** MEOS: front_stbox_stbox */
	private _front_stbox_stbox(box2: STBox): boolean {
		return F.front_stbox_stbox(this.ptr, box2.ptr);
	}

	/** MEOS: front_stbox_tspatial */
	private _front_stbox_tspatial(temp: TSpatial): boolean {
		return F.front_stbox_tspatial(this.ptr, temp.ptr);
	}

	/** MEOS: left_stbox_stbox */
	private _left_stbox_stbox(box2: STBox): boolean {
		return F.left_stbox_stbox(this.ptr, box2.ptr);
	}

	/** MEOS: left_stbox_tspatial */
	private _left_stbox_tspatial(temp: TSpatial): boolean {
		return F.left_stbox_tspatial(this.ptr, temp.ptr);
	}

	/** MEOS: nad_stbox_geo */
	private _nad_stbox_geo(gs: Geo, spheroid: boolean): number {
		return F.nad_stbox_geo(this.ptr, gs.ptr, spheroid);
	}

	/** MEOS: nad_stbox_stbox */
	private _nad_stbox_stbox(box2: STBox, spheroid: boolean): number {
		return F.nad_stbox_stbox(this.ptr, box2.ptr, spheroid);
	}

	/** MEOS: nad_stbox_trgeometry */
	private _nad_stbox_trgeometry(temp: Temporal): number {
		return F.nad_stbox_trgeometry(this.ptr, temp.ptr);
	}

	/** MEOS: overabove_stbox_stbox */
	private _overabove_stbox_stbox(box2: STBox): boolean {
		return F.overabove_stbox_stbox(this.ptr, box2.ptr);
	}

	/** MEOS: overabove_stbox_tspatial */
	private _overabove_stbox_tspatial(temp: TSpatial): boolean {
		return F.overabove_stbox_tspatial(this.ptr, temp.ptr);
	}

	/** MEOS: overafter_stbox_stbox */
	private _overafter_stbox_stbox(box2: STBox): boolean {
		return F.overafter_stbox_stbox(this.ptr, box2.ptr);
	}

	/** MEOS: overafter_stbox_tspatial */
	private _overafter_stbox_tspatial(temp: TSpatial): boolean {
		return F.overafter_stbox_tspatial(this.ptr, temp.ptr);
	}

	/** MEOS: overback_stbox_stbox */
	private _overback_stbox_stbox(box2: STBox): boolean {
		return F.overback_stbox_stbox(this.ptr, box2.ptr);
	}

	/** MEOS: overback_stbox_tspatial */
	private _overback_stbox_tspatial(temp: TSpatial): boolean {
		return F.overback_stbox_tspatial(this.ptr, temp.ptr);
	}

	/** MEOS: overbefore_stbox_stbox */
	private _overbefore_stbox_stbox(box2: STBox): boolean {
		return F.overbefore_stbox_stbox(this.ptr, box2.ptr);
	}

	/** MEOS: overbefore_stbox_tspatial */
	private _overbefore_stbox_tspatial(temp: TSpatial): boolean {
		return F.overbefore_stbox_tspatial(this.ptr, temp.ptr);
	}

	/** MEOS: overbelow_stbox_stbox */
	private _overbelow_stbox_stbox(box2: STBox): boolean {
		return F.overbelow_stbox_stbox(this.ptr, box2.ptr);
	}

	/** MEOS: overbelow_stbox_tspatial */
	private _overbelow_stbox_tspatial(temp: TSpatial): boolean {
		return F.overbelow_stbox_tspatial(this.ptr, temp.ptr);
	}

	/** MEOS: overfront_stbox_stbox */
	private _overfront_stbox_stbox(box2: STBox): boolean {
		return F.overfront_stbox_stbox(this.ptr, box2.ptr);
	}

	/** MEOS: overfront_stbox_tspatial */
	private _overfront_stbox_tspatial(temp: TSpatial): boolean {
		return F.overfront_stbox_tspatial(this.ptr, temp.ptr);
	}

	/** MEOS: overlaps_stbox_stbox */
	private _overlaps_stbox_stbox(box2: STBox): boolean {
		return F.overlaps_stbox_stbox(this.ptr, box2.ptr);
	}

	/** MEOS: overlaps_stbox_tspatial */
	private _overlaps_stbox_tspatial(temp: TSpatial): boolean {
		return F.overlaps_stbox_tspatial(this.ptr, temp.ptr);
	}

	/** MEOS: overleft_stbox_stbox */
	private _overleft_stbox_stbox(box2: STBox): boolean {
		return F.overleft_stbox_stbox(this.ptr, box2.ptr);
	}

	/** MEOS: overleft_stbox_tspatial */
	private _overleft_stbox_tspatial(temp: TSpatial): boolean {
		return F.overleft_stbox_tspatial(this.ptr, temp.ptr);
	}

	/** MEOS: overright_stbox_stbox */
	private _overright_stbox_stbox(box2: STBox): boolean {
		return F.overright_stbox_stbox(this.ptr, box2.ptr);
	}

	/** MEOS: overright_stbox_tspatial */
	private _overright_stbox_tspatial(temp: TSpatial): boolean {
		return F.overright_stbox_tspatial(this.ptr, temp.ptr);
	}

	/** MEOS: right_stbox_stbox */
	private _right_stbox_stbox(box2: STBox): boolean {
		return F.right_stbox_stbox(this.ptr, box2.ptr);
	}

	/** MEOS: right_stbox_tspatial */
	private _right_stbox_tspatial(temp: TSpatial): boolean {
		return F.right_stbox_tspatial(this.ptr, temp.ptr);
	}

	/** MEOS: same_stbox_stbox */
	private _same_stbox_stbox(box2: STBox): boolean {
		return F.same_stbox_stbox(this.ptr, box2.ptr);
	}

	/** MEOS: same_stbox_tspatial */
	private _same_stbox_tspatial(temp: TSpatial): boolean {
		return F.same_stbox_tspatial(this.ptr, temp.ptr);
	}

	/** MEOS: above_stbox_stbox, above_stbox_tspatial, chosen by the arguments' types */
	above(box2: STBox | TSpatial): boolean {
		if (box2 instanceof STBox) return this._above_stbox_stbox(box2 as STBox);
		if (box2 instanceof TSpatial) return this._above_stbox_tspatial(box2 as TSpatial);
		throw new TypeError(`STBox.above: no overload takes these arguments`);
	}

	/** MEOS: adjacent_stbox_stbox, adjacent_stbox_tspatial, chosen by the arguments' types */
	adjacent(box2: STBox | TSpatial): boolean {
		if (box2 instanceof STBox) return this._adjacent_stbox_stbox(box2 as STBox);
		if (box2 instanceof TSpatial) return this._adjacent_stbox_tspatial(box2 as TSpatial);
		throw new TypeError(`STBox.adjacent: no overload takes these arguments`);
	}

	/** MEOS: after_stbox_stbox, after_stbox_tspatial, chosen by the arguments' types */
	after(box2: STBox | TSpatial): boolean {
		if (box2 instanceof STBox) return this._after_stbox_stbox(box2 as STBox);
		if (box2 instanceof TSpatial) return this._after_stbox_tspatial(box2 as TSpatial);
		throw new TypeError(`STBox.after: no overload takes these arguments`);
	}

	/** MEOS: stbox_area */
	area(spheroid: boolean): number {
		return F.stbox_area(this.ptr, spheroid);
	}

	/** MEOS: stbox_as_ewkb */
	asEWKB(variant: number): Uint8Array {
		return readWkb(_sizeOut => F.stbox_as_ewkb(this.ptr, variant, _sizeOut));
	}

	/** MEOS: stbox_as_hexewkb */
	asHexEWKB(variant: number): string {
		return F.stbox_as_hexewkb(this.ptr, variant);
	}

	/** MEOS: stbox_as_hexwkb */
	asHexWKB(variant: number): string {
		return F.stbox_as_hexwkb(this.ptr, variant);
	}

	/** MEOS: stbox_out */
	asText(maxdd: number): string {
		return this.out(maxdd);
	}

	/** MEOS: stbox_as_wkb */
	asWKB(variant: number): Uint8Array {
		return readWkb(_sizeOut => F.stbox_as_wkb(this.ptr, variant, _sizeOut));
	}

	/** MEOS: back_stbox_stbox, back_stbox_tspatial, chosen by the arguments' types */
	back(box2: STBox | TSpatial): boolean {
		if (box2 instanceof STBox) return this._back_stbox_stbox(box2 as STBox);
		if (box2 instanceof TSpatial) return this._back_stbox_tspatial(box2 as TSpatial);
		throw new TypeError(`STBox.back: no overload takes these arguments`);
	}

	/** MEOS: before_stbox_stbox, before_stbox_tspatial, chosen by the arguments' types */
	before(box2: STBox | TSpatial): boolean {
		if (box2 instanceof STBox) return this._before_stbox_stbox(box2 as STBox);
		if (box2 instanceof TSpatial) return this._before_stbox_tspatial(box2 as TSpatial);
		throw new TypeError(`STBox.before: no overload takes these arguments`);
	}

	/** MEOS: below_stbox_stbox, below_stbox_tspatial, chosen by the arguments' types */
	below(box2: STBox | TSpatial): boolean {
		if (box2 instanceof STBox) return this._below_stbox_stbox(box2 as STBox);
		if (box2 instanceof TSpatial) return this._below_stbox_tspatial(box2 as TSpatial);
		throw new TypeError(`STBox.below: no overload takes these arguments`);
	}

	/** MEOS: stbox_cmp */
	cmp(box2: STBox): number {
		return F.stbox_cmp(this.ptr, box2.ptr);
	}

	/** MEOS: contained_stbox_stbox, contained_stbox_tspatial, chosen by the arguments' types */
	contained(box2: STBox | TSpatial): boolean {
		if (box2 instanceof STBox) return this._contained_stbox_stbox(box2 as STBox);
		if (box2 instanceof TSpatial) return this._contained_stbox_tspatial(box2 as TSpatial);
		throw new TypeError(`STBox.contained: no overload takes these arguments`);
	}

	/** MEOS: contains_stbox_stbox, contains_stbox_tspatial, chosen by the arguments' types */
	contains(box2: STBox | TSpatial): boolean {
		if (box2 instanceof STBox) return this._contains_stbox_stbox(box2 as STBox);
		if (box2 instanceof TSpatial) return this._contains_stbox_tspatial(box2 as TSpatial);
		throw new TypeError(`STBox.contains: no overload takes these arguments`);
	}

	/** MEOS: stbox_copy */
	copy(): STBox {
		return wrapSTBox(F.stbox_copy(this.ptr)) as STBox;
	}

	/** MEOS: stbox_eq */
	eq(box2: STBox): boolean {
		return F.stbox_eq(this.ptr, box2.ptr);
	}

	/** MEOS: stbox_expand_space */
	expandSpace(d: number): STBox | null {
		return wrapSTBoxOrNull(F.stbox_expand_space(this.ptr, d)) as STBox | null;
	}

	/** MEOS: stbox_expand_time */
	expandTime(interv: Interval): STBox | null {
		const _interv = _putInterval(interv);
		try {
			return wrapSTBoxOrNull(F.stbox_expand_time(this.ptr, _interv)) as STBox | null;
		} finally {
			_free(_interv);
		}
	}

	/** MEOS: front_stbox_stbox, front_stbox_tspatial, chosen by the arguments' types */
	front(box2: STBox | TSpatial): boolean {
		if (box2 instanceof STBox) return this._front_stbox_stbox(box2 as STBox);
		if (box2 instanceof TSpatial) return this._front_stbox_tspatial(box2 as TSpatial);
		throw new TypeError(`STBox.front: no overload takes these arguments`);
	}

	/** MEOS: stbox_ge */
	ge(box2: STBox): boolean {
		return F.stbox_ge(this.ptr, box2.ptr);
	}

	/** MEOS: stbox_get_space */
	getSpace(): STBox {
		return wrapSTBox(F.stbox_get_space(this.ptr)) as STBox;
	}

	/** MEOS: stbox_gt */
	gt(box2: STBox): boolean {
		return F.stbox_gt(this.ptr, box2.ptr);
	}

	/** MEOS: stbox_hash */
	hash(): number {
		return F.stbox_hash(this.ptr);
	}

	/** MEOS: stbox_hash_extended */
	hashExtended(seed: number): number {
		return F.stbox_hash_extended(this.ptr, seed);
	}

	/** MEOS: stbox_hast */
	hast(): boolean {
		return F.stbox_hast(this.ptr);
	}

	/** MEOS: stbox_hasx */
	hasx(): boolean {
		return F.stbox_hasx(this.ptr);
	}

	/** MEOS: stbox_hasz */
	hasz(): boolean {
		return F.stbox_hasz(this.ptr);
	}

	/** MEOS: intersection_stbox_stbox */
	intersection(box2: STBox): STBox | null {
		return wrapSTBoxOrNull(F.intersection_stbox_stbox(this.ptr, box2.ptr)) as STBox | null;
	}

	/** MEOS: stbox_isgeodetic */
	isgeodetic(): boolean {
		return F.stbox_isgeodetic(this.ptr);
	}

	/** MEOS: stbox_le */
	le(box2: STBox): boolean {
		return F.stbox_le(this.ptr, box2.ptr);
	}

	/** MEOS: left_stbox_stbox, left_stbox_tspatial, chosen by the arguments' types */
	left(box2: STBox | TSpatial): boolean {
		if (box2 instanceof STBox) return this._left_stbox_stbox(box2 as STBox);
		if (box2 instanceof TSpatial) return this._left_stbox_tspatial(box2 as TSpatial);
		throw new TypeError(`STBox.left: no overload takes these arguments`);
	}

	/** MEOS: stbox_lt */
	lt(box2: STBox): boolean {
		return F.stbox_lt(this.ptr, box2.ptr);
	}

	/** MEOS: nad_stbox_geo, nad_stbox_stbox, nad_stbox_trgeometry, chosen by the arguments' types */
	nad(gs: Geo | STBox | Temporal, spheroid?: boolean): number {
		if (gs instanceof Geo && typeof spheroid === 'boolean') return this._nad_stbox_geo(gs as Geo, spheroid as boolean);
		if (gs instanceof STBox && typeof spheroid === 'boolean') return this._nad_stbox_stbox(gs as STBox, spheroid as boolean);
		if (gs instanceof Temporal && spheroid === undefined) return this._nad_stbox_trgeometry(gs as Temporal);
		throw new TypeError(`STBox.nad: no overload takes these arguments`);
	}

	/** MEOS: stbox_ne */
	ne(box2: STBox): boolean {
		return F.stbox_ne(this.ptr, box2.ptr);
	}

	/** MEOS: stbox_out */
	out(maxdd: number): string {
		return F.stbox_out(this.ptr, maxdd);
	}

	/** MEOS: overabove_stbox_stbox, overabove_stbox_tspatial, chosen by the arguments' types */
	overabove(box2: STBox | TSpatial): boolean {
		if (box2 instanceof STBox) return this._overabove_stbox_stbox(box2 as STBox);
		if (box2 instanceof TSpatial) return this._overabove_stbox_tspatial(box2 as TSpatial);
		throw new TypeError(`STBox.overabove: no overload takes these arguments`);
	}

	/** MEOS: overafter_stbox_stbox, overafter_stbox_tspatial, chosen by the arguments' types */
	overafter(box2: STBox | TSpatial): boolean {
		if (box2 instanceof STBox) return this._overafter_stbox_stbox(box2 as STBox);
		if (box2 instanceof TSpatial) return this._overafter_stbox_tspatial(box2 as TSpatial);
		throw new TypeError(`STBox.overafter: no overload takes these arguments`);
	}

	/** MEOS: overback_stbox_stbox, overback_stbox_tspatial, chosen by the arguments' types */
	overback(box2: STBox | TSpatial): boolean {
		if (box2 instanceof STBox) return this._overback_stbox_stbox(box2 as STBox);
		if (box2 instanceof TSpatial) return this._overback_stbox_tspatial(box2 as TSpatial);
		throw new TypeError(`STBox.overback: no overload takes these arguments`);
	}

	/** MEOS: overbefore_stbox_stbox, overbefore_stbox_tspatial, chosen by the arguments' types */
	overbefore(box2: STBox | TSpatial): boolean {
		if (box2 instanceof STBox) return this._overbefore_stbox_stbox(box2 as STBox);
		if (box2 instanceof TSpatial) return this._overbefore_stbox_tspatial(box2 as TSpatial);
		throw new TypeError(`STBox.overbefore: no overload takes these arguments`);
	}

	/** MEOS: overbelow_stbox_stbox, overbelow_stbox_tspatial, chosen by the arguments' types */
	overbelow(box2: STBox | TSpatial): boolean {
		if (box2 instanceof STBox) return this._overbelow_stbox_stbox(box2 as STBox);
		if (box2 instanceof TSpatial) return this._overbelow_stbox_tspatial(box2 as TSpatial);
		throw new TypeError(`STBox.overbelow: no overload takes these arguments`);
	}

	/** MEOS: overfront_stbox_stbox, overfront_stbox_tspatial, chosen by the arguments' types */
	overfront(box2: STBox | TSpatial): boolean {
		if (box2 instanceof STBox) return this._overfront_stbox_stbox(box2 as STBox);
		if (box2 instanceof TSpatial) return this._overfront_stbox_tspatial(box2 as TSpatial);
		throw new TypeError(`STBox.overfront: no overload takes these arguments`);
	}

	/** MEOS: overlaps_stbox_stbox, overlaps_stbox_tspatial, chosen by the arguments' types */
	overlaps(box2: STBox | TSpatial): boolean {
		if (box2 instanceof STBox) return this._overlaps_stbox_stbox(box2 as STBox);
		if (box2 instanceof TSpatial) return this._overlaps_stbox_tspatial(box2 as TSpatial);
		throw new TypeError(`STBox.overlaps: no overload takes these arguments`);
	}

	/** MEOS: overleft_stbox_stbox, overleft_stbox_tspatial, chosen by the arguments' types */
	overleft(box2: STBox | TSpatial): boolean {
		if (box2 instanceof STBox) return this._overleft_stbox_stbox(box2 as STBox);
		if (box2 instanceof TSpatial) return this._overleft_stbox_tspatial(box2 as TSpatial);
		throw new TypeError(`STBox.overleft: no overload takes these arguments`);
	}

	/** MEOS: overright_stbox_stbox, overright_stbox_tspatial, chosen by the arguments' types */
	overright(box2: STBox | TSpatial): boolean {
		if (box2 instanceof STBox) return this._overright_stbox_stbox(box2 as STBox);
		if (box2 instanceof TSpatial) return this._overright_stbox_tspatial(box2 as TSpatial);
		throw new TypeError(`STBox.overright: no overload takes these arguments`);
	}

	/** MEOS: stbox_perimeter */
	perimeter(spheroid: boolean): number {
		return F.stbox_perimeter(this.ptr, spheroid);
	}

	/** MEOS: stbox_quad_split */
	quadSplit(): STBox[] {
		const _count = _alloc(4);
		try {
			const _arr = F.stbox_quad_split(this.ptr, _count);
			if (!_arr) return [];
			try {
				const _n = _view(_count, 4).getInt32(0, true);
				const _v = _view(_arr, _n * 80);
				const _out: STBox[] = [];
				for (let _i = 0; _i < _n; _i++) _out.push(wrapSTBox(_copy(_arr + _i * 80, 80)) as STBox);
				return _out;
			} finally {
				_free(_arr);
			}
		} finally {
			_free(_count);
		}
	}

	/** MEOS: right_stbox_stbox, right_stbox_tspatial, chosen by the arguments' types */
	right(box2: STBox | TSpatial): boolean {
		if (box2 instanceof STBox) return this._right_stbox_stbox(box2 as STBox);
		if (box2 instanceof TSpatial) return this._right_stbox_tspatial(box2 as TSpatial);
		throw new TypeError(`STBox.right: no overload takes these arguments`);
	}

	/** MEOS: stbox_round */
	round(maxdd: number): STBox {
		return wrapSTBox(F.stbox_round(this.ptr, maxdd)) as STBox;
	}

	/** MEOS: same_stbox_stbox, same_stbox_tspatial, chosen by the arguments' types */
	same(box2: STBox | TSpatial): boolean {
		if (box2 instanceof STBox) return this._same_stbox_stbox(box2 as STBox);
		if (box2 instanceof TSpatial) return this._same_stbox_tspatial(box2 as TSpatial);
		throw new TypeError(`STBox.same: no overload takes these arguments`);
	}

	/** MEOS: stbox_scale_time */
	scaleTime(duration: Interval): STBox {
		const _duration = _putInterval(duration);
		try {
			return wrapSTBox(F.stbox_scale_time(this.ptr, _duration)) as STBox;
		} finally {
			_free(_duration);
		}
	}

	/** MEOS: stbox_set_srid */
	setSRID(srid: number): STBox {
		return wrapSTBox(F.stbox_set_srid(this.ptr, srid)) as STBox;
	}

	/** MEOS: stbox_shift_scale_time */
	shiftScaleTime(shift: Interval, duration: Interval): STBox {
		const _shift = _putInterval(shift);
		const _duration = _putInterval(duration);
		try {
			return wrapSTBox(F.stbox_shift_scale_time(this.ptr, _shift, _duration)) as STBox;
		} finally {
			_free(_shift);
			_free(_duration);
		}
	}

	/** MEOS: stbox_shift_time */
	shiftTime(shift: Interval): STBox {
		const _shift = _putInterval(shift);
		try {
			return wrapSTBox(F.stbox_shift_time(this.ptr, _shift)) as STBox;
		} finally {
			_free(_shift);
		}
	}

	/** MEOS: stbox_sortkey */
	sortkey(): Uint8Array {
		return readWkb(_sizeOut => F.stbox_sortkey(this.ptr, _sizeOut));
	}

	/** MEOS: stbox_space_tiles */
	spaceTiles(xsize: number, ysize: number, zsize: number, sorigin: Geo, border_inc: boolean): STBox[] {
		const _count = _alloc(4);
		try {
			const _arr = F.stbox_space_tiles(this.ptr, xsize, ysize, zsize, sorigin.ptr, border_inc, _count);
			if (!_arr) return [];
			try {
				const _n = _view(_count, 4).getInt32(0, true);
				const _v = _view(_arr, _n * 80);
				const _out: STBox[] = [];
				for (let _i = 0; _i < _n; _i++) _out.push(wrapSTBox(_copy(_arr + _i * 80, 80)) as STBox);
				return _out;
			} finally {
				_free(_arr);
			}
		} finally {
			_free(_count);
		}
	}

	/** MEOS: stbox_space_time_tiles */
	spaceTimeTiles(xsize: number, ysize: number, zsize: number, duration: Interval, sorigin: Geo, torigin: TimestampTz, border_inc: boolean): STBox[] {
		const _duration = _putInterval(duration);
		const _count = _alloc(4);
		try {
			const _arr = F.stbox_space_time_tiles(this.ptr, xsize, ysize, zsize, _duration, sorigin.ptr, torigin, border_inc, _count);
			if (!_arr) return [];
			try {
				const _n = _view(_count, 4).getInt32(0, true);
				const _v = _view(_arr, _n * 80);
				const _out: STBox[] = [];
				for (let _i = 0; _i < _n; _i++) _out.push(wrapSTBox(_copy(_arr + _i * 80, 80)) as STBox);
				return _out;
			} finally {
				_free(_arr);
			}
		} finally {
			_free(_duration);
			_free(_count);
		}
	}

	/** MEOS: stbox_spatial_distance */
	spatialDistance(box2: STBox): number {
		return F.stbox_spatial_distance(this.ptr, box2.ptr);
	}

	/** MEOS: stbox_srid */
	SRID(): number {
		return F.stbox_srid(this.ptr);
	}

	/** MEOS: stbox_time_tiles */
	timeTiles(duration: Interval, torigin: TimestampTz, border_inc: boolean): STBox[] {
		const _duration = _putInterval(duration);
		const _count = _alloc(4);
		try {
			const _arr = F.stbox_time_tiles(this.ptr, _duration, torigin, border_inc, _count);
			if (!_arr) return [];
			try {
				const _n = _view(_count, 4).getInt32(0, true);
				const _v = _view(_arr, _n * 80);
				const _out: STBox[] = [];
				for (let _i = 0; _i < _n; _i++) _out.push(wrapSTBox(_copy(_arr + _i * 80, 80)) as STBox);
				return _out;
			} finally {
				_free(_arr);
			}
		} finally {
			_free(_duration);
			_free(_count);
		}
	}

	/** MEOS: stbox_tmax */
	tmax(): TimestampTz {
		return F.stbox_tmax(this.ptr);
	}

	/** MEOS: stbox_tmax_inc */
	tmaxInc(): boolean {
		return F.stbox_tmax_inc(this.ptr);
	}

	/** MEOS: stbox_tmin */
	tmin(): TimestampTz {
		return F.stbox_tmin(this.ptr);
	}

	/** MEOS: stbox_tmin_inc */
	tminInc(): boolean {
		return F.stbox_tmin_inc(this.ptr);
	}

	/** MEOS: stbox_to_box3d */
	toBox3d(): BOX3D {
		return _takeBOX3D(F.stbox_to_box3d(this.ptr))!;
	}

	/** MEOS: stbox_to_geo */
	toGeo(): Geo {
		return wrapGeo(F.stbox_to_geo(this.ptr)) as Geo;
	}

	/** MEOS: stbox_to_tstzspan */
	toTstzspan(): Span {
		return wrapSpan(F.stbox_to_tstzspan(this.ptr)) as Span;
	}

	/** MEOS: stbox_transform */
	transform(srid: number): STBox | null {
		return wrapSTBoxOrNull(F.stbox_transform(this.ptr, srid)) as STBox | null;
	}

	/** MEOS: stbox_transform_pipeline */
	transformPipeline(pipelinestr: string, srid: number, is_forward: boolean): STBox {
		return wrapSTBox(F.stbox_transform_pipeline(this.ptr, pipelinestr, srid, is_forward)) as STBox;
	}

	/** MEOS: union_stbox_stbox */
	union(box2: STBox, strict: boolean): STBox {
		return wrapSTBox(F.union_stbox_stbox(this.ptr, box2.ptr, strict)) as STBox;
	}

	/** MEOS: stbox_volume */
	volume(): number {
		return F.stbox_volume(this.ptr);
	}

	/** MEOS: stbox_xmax */
	xmax(): number {
		return F.stbox_xmax(this.ptr);
	}

	/** MEOS: stbox_xmin */
	xmin(): number {
		return F.stbox_xmin(this.ptr);
	}

	/** MEOS: stbox_ymax */
	ymax(): number {
		return F.stbox_ymax(this.ptr);
	}

	/** MEOS: stbox_ymin */
	ymin(): number {
		return F.stbox_ymin(this.ptr);
	}

	/** MEOS: stbox_zmax */
	zmax(): number {
		return F.stbox_zmax(this.ptr);
	}

	/** MEOS: stbox_zmin */
	zmin(): number {
		return F.stbox_zmin(this.ptr);
	}

	/** MEOS: stbox_from_wkb */
	static fromEWKB(wkb: Uint8Array): STBox {
		return STBox.fromWKB(wkb);
	}

	/** MEOS: stbox_from_hexwkb */
	static fromHexEWKB(hexwkb: string): STBox {
		return STBox.fromHexWKB(hexwkb);
	}

	/** MEOS: stbox_from_hexwkb */
	static fromHexWKB(hexwkb: string): STBox {
		return wrapSTBox(F.stbox_from_hexwkb(hexwkb)) as STBox;
	}

	/** MEOS: stbox_in */
	static fromText(str: string): STBox {
		return STBox.in(str);
	}

	/** MEOS: stbox_from_wkb */
	static fromWKB(wkb: Uint8Array): STBox {
		const _wkb = _bytes(wkb);
		try {
			return wrapSTBox(F.stbox_from_wkb(_wkb, wkb.length)) as STBox;
		} finally {
			_free(_wkb);
		}
	}

	/** MEOS: stbox_get_space_tile */
	static getSpaceTile(point: Geo, xsize: number, ysize: number, zsize: number, sorigin: Geo): STBox | null {
		return wrapSTBoxOrNull(F.stbox_get_space_tile(point.ptr, xsize, ysize, zsize, sorigin.ptr)) as STBox | null;
	}

	/** MEOS: stbox_get_space_time_tile */
	static getSpaceTimeTile(point: Geo, t: TimestampTz, xsize: number, ysize: number, zsize: number, duration: Interval, sorigin: Geo, torigin: TimestampTz): STBox | null {
		const _duration = _putInterval(duration);
		try {
			return wrapSTBoxOrNull(F.stbox_get_space_time_tile(point.ptr, t, xsize, ysize, zsize, _duration, sorigin.ptr, torigin)) as STBox | null;
		} finally {
			_free(_duration);
		}
	}

	/** MEOS: stbox_get_time_tile */
	static getTimeTile(t: TimestampTz, duration: Interval, torigin: TimestampTz): STBox {
		const _duration = _putInterval(duration);
		try {
			return wrapSTBox(F.stbox_get_time_tile(t, _duration, torigin)) as STBox;
		} finally {
			_free(_duration);
		}
	}

	/** MEOS: stbox_in */
	static in(str: string): STBox {
		return wrapSTBox(F.stbox_in(str)) as STBox;
	}

	/** MEOS: stbox_make */
	static make(hasx: boolean, hasz: boolean, geodetic: boolean, srid: number, xmin: number, xmax: number, ymin: number, ymax: number, zmin: number, zmax: number, s: Span): STBox {
		return wrapSTBox(F.stbox_make(hasx, hasz, geodetic, srid, xmin, xmax, ymin, ymax, zmin, zmax, s.ptr)) as STBox;
	}
}

/**
 * Superclass of every temporal type; temporal_* functions are late-bound over `subtype` and `temptype`.
 */
export class Temporal extends MeosObject {

	/** MEOS: adjacent_temporal_tstzspan */
	adjacent(s: TsTzSpan): boolean {
		return F.adjacent_temporal_tstzspan(this.ptr, s.ptr);
	}

	/** MEOS: after_temporal_tstzspan */
	after(s: TsTzSpan): boolean {
		return F.after_temporal_tstzspan(this.ptr, s.ptr);
	}

	/** MEOS: temporal_after_timestamptz */
	afterTimestamptz(t: TimestampTz, strict: boolean): Temporal | null {
		return wrapTemporalOrNull(F.temporal_after_timestamptz(this.ptr, t, strict)) as Temporal | null;
	}

	/** MEOS: always_eq_temporal_temporal */
	alwaysEq(temp2: Temporal): number {
		return F.always_eq_temporal_temporal(this.ptr, temp2.ptr);
	}

	/** MEOS: always_ge_temporal_temporal */
	alwaysGe(temp2: Temporal): number {
		return F.always_ge_temporal_temporal(this.ptr, temp2.ptr);
	}

	/** MEOS: always_gt_temporal_temporal */
	alwaysGt(temp2: Temporal): number {
		return F.always_gt_temporal_temporal(this.ptr, temp2.ptr);
	}

	/** MEOS: always_le_temporal_temporal */
	alwaysLe(temp2: Temporal): number {
		return F.always_le_temporal_temporal(this.ptr, temp2.ptr);
	}

	/** MEOS: always_lt_temporal_temporal */
	alwaysLt(temp2: Temporal): number {
		return F.always_lt_temporal_temporal(this.ptr, temp2.ptr);
	}

	/** MEOS: always_ne_temporal_temporal */
	alwaysNe(temp2: Temporal): number {
		return F.always_ne_temporal_temporal(this.ptr, temp2.ptr);
	}

	/** MEOS: temporal_append_tinstant */
	appendTinstant(inst: Temporal, interp: number, maxdist: number, maxt: Interval, expand: boolean): Temporal {
		const _maxt = _putInterval(maxt);
		try {
			return wrapTemporal(F.temporal_append_tinstant(this.ptr, inst.ptr, interp, maxdist, _maxt, expand)) as Temporal;
		} finally {
			_free(_maxt);
		}
	}

	/** MEOS: temporal_append_tsequence */
	appendTsequence(seq: Temporal, expand: boolean): Temporal {
		return wrapTemporal(F.temporal_append_tsequence(this.ptr, seq.ptr, expand)) as Temporal;
	}

	/** MEOS: temporal_as_tinstant */
	asTinstant(): Temporal {
		return wrapTemporal(F.temporal_as_tinstant(this.ptr)) as Temporal;
	}

	/** MEOS: temporal_as_tsequence */
	asTsequence(interp: number): Temporal {
		return wrapTemporal(F.temporal_as_tsequence(this.ptr, interp)) as Temporal;
	}

	/** MEOS: temporal_as_tsequenceset */
	asTsequenceset(interp: number): Temporal {
		return wrapTemporal(F.temporal_as_tsequenceset(this.ptr, interp)) as Temporal;
	}

	/** MEOS: temporal_as_wkb */
	asWKB(variant: number): Uint8Array {
		return readWkb(_sizeOut => F.temporal_as_wkb(this.ptr, variant, _sizeOut));
	}

	/** MEOS: temporal_at_max */
	atMax(): Temporal | null {
		return wrapTemporalOrNull(F.temporal_at_max(this.ptr)) as Temporal | null;
	}

	/** MEOS: temporal_at_min */
	atMin(): Temporal | null {
		return wrapTemporalOrNull(F.temporal_at_min(this.ptr)) as Temporal | null;
	}

	/** MEOS: temporal_at_timestamptz */
	atTimestamptz(t: TimestampTz): Temporal | null {
		return wrapTemporalOrNull(F.temporal_at_timestamptz(this.ptr, t)) as Temporal | null;
	}

	/** MEOS: temporal_at_tstzset */
	atTstzset(s: Set): Temporal | null {
		return wrapTemporalOrNull(F.temporal_at_tstzset(this.ptr, s.ptr)) as Temporal | null;
	}

	/** MEOS: temporal_at_tstzspan */
	atTstzspan(s: Span): Temporal | null {
		return wrapTemporalOrNull(F.temporal_at_tstzspan(this.ptr, s.ptr)) as Temporal | null;
	}

	/** MEOS: temporal_at_tstzspanset */
	atTstzspanset(ss: SpanSet): Temporal | null {
		return wrapTemporalOrNull(F.temporal_at_tstzspanset(this.ptr, ss.ptr)) as Temporal | null;
	}

	/** MEOS: temporal_at_values */
	atValues(set: Set): Temporal | null {
		return wrapTemporalOrNull(F.temporal_at_values(this.ptr, set.ptr)) as Temporal | null;
	}

	/** MEOS: temporal_average_hausdorff_distance */
	averageHausdorffDistance(temp2: Temporal, spheroid: boolean): number {
		return F.temporal_average_hausdorff_distance(this.ptr, temp2.ptr, spheroid);
	}

	/** MEOS: temporal_basetype_name */
	basetypeName(): string {
		return F.temporal_basetype_name(this.ptr);
	}

	/** MEOS: before_temporal_tstzspan */
	before(s: TsTzSpan): boolean {
		return F.before_temporal_tstzspan(this.ptr, s.ptr);
	}

	/** MEOS: temporal_before_timestamptz */
	beforeTimestamptz(t: TimestampTz, strict: boolean): Temporal | null {
		return wrapTemporalOrNull(F.temporal_before_timestamptz(this.ptr, t, strict)) as Temporal | null;
	}

	/** MEOS: temporal_cmp */
	cmp(temp2: Temporal): number {
		return F.temporal_cmp(this.ptr, temp2.ptr);
	}

	/** MEOS: contained_temporal_tstzspan */
	contained(s: TsTzSpan): boolean {
		return F.contained_temporal_tstzspan(this.ptr, s.ptr);
	}

	/** MEOS: contains_temporal_tstzspan */
	contains(s: TsTzSpan): boolean {
		return F.contains_temporal_tstzspan(this.ptr, s.ptr);
	}

	/** MEOS: temporal_copy */
	copy(): Temporal {
		return wrapTemporal(F.temporal_copy(this.ptr)) as Temporal;
	}

	/** MEOS: temporal_delete_timestamptz */
	deleteTimestamptz(t: TimestampTz, connect: boolean): Temporal | null {
		return wrapTemporalOrNull(F.temporal_delete_timestamptz(this.ptr, t, connect)) as Temporal | null;
	}

	/** MEOS: temporal_delete_tstzset */
	deleteTstzset(s: Set, connect: boolean): Temporal | null {
		return wrapTemporalOrNull(F.temporal_delete_tstzset(this.ptr, s.ptr, connect)) as Temporal | null;
	}

	/** MEOS: temporal_delete_tstzspan */
	deleteTstzspan(s: Span, connect: boolean): Temporal | null {
		return wrapTemporalOrNull(F.temporal_delete_tstzspan(this.ptr, s.ptr, connect)) as Temporal | null;
	}

	/** MEOS: temporal_delete_tstzspanset */
	deleteTstzspanset(ss: SpanSet, connect: boolean): Temporal | null {
		return wrapTemporalOrNull(F.temporal_delete_tstzspanset(this.ptr, ss.ptr, connect)) as Temporal | null;
	}

	/** MEOS: temporal_derivative */
	derivative(): Temporal | null {
		return wrapTemporalOrNull(F.temporal_derivative(this.ptr)) as Temporal | null;
	}

	/** MEOS: temporal_dyntimewarp_distance */
	dyntimewarpDistance(temp2: Temporal, spheroid: boolean): number {
		return F.temporal_dyntimewarp_distance(this.ptr, temp2.ptr, spheroid);
	}

	/** MEOS: temporal_dyntimewarp_path */
	dyntimewarpPath(temp2: Temporal, spheroid: boolean): Match[] {
		const _count = _alloc(4);
		try {
			const _arr = F.temporal_dyntimewarp_path(this.ptr, temp2.ptr, spheroid, _count);
			if (!_arr) return [];
			try {
				const _n = _view(_count, 4).getInt32(0, true);
				const _v = _view(_arr, _n * 8);
				const _out: Match[] = [];
				for (let _i = 0; _i < _n; _i++) _out.push(_readMatch(_arr + _i * 8));
				return _out;
			} finally {
				_free(_arr);
			}
		} finally {
			_free(_count);
		}
	}

	/** MEOS: temporal_end_instant */
	endInstant(): Temporal {
		return wrapTemporal(F.temporal_end_instant(this.ptr)) as Temporal;
	}

	/** MEOS: temporal_end_sequence */
	endSequence(): Temporal {
		return wrapTemporal(F.temporal_end_sequence(this.ptr)) as Temporal;
	}

	/** MEOS: temporal_end_timestamptz */
	endTimestamptz(): TimestampTz {
		return F.temporal_end_timestamptz(this.ptr);
	}

	/** MEOS: temporal_eq */
	eq(temp2: Temporal): boolean {
		return F.temporal_eq(this.ptr, temp2.ptr);
	}

	/** MEOS: ever_eq_temporal_temporal */
	everEq(temp2: Temporal): number {
		return F.ever_eq_temporal_temporal(this.ptr, temp2.ptr);
	}

	/** MEOS: ever_ge_temporal_temporal */
	everGe(temp2: Temporal): number {
		return F.ever_ge_temporal_temporal(this.ptr, temp2.ptr);
	}

	/** MEOS: ever_gt_temporal_temporal */
	everGt(temp2: Temporal): number {
		return F.ever_gt_temporal_temporal(this.ptr, temp2.ptr);
	}

	/** MEOS: ever_le_temporal_temporal */
	everLe(temp2: Temporal): number {
		return F.ever_le_temporal_temporal(this.ptr, temp2.ptr);
	}

	/** MEOS: ever_lt_temporal_temporal */
	everLt(temp2: Temporal): number {
		return F.ever_lt_temporal_temporal(this.ptr, temp2.ptr);
	}

	/** MEOS: ever_ne_temporal_temporal */
	everNe(temp2: Temporal): number {
		return F.ever_ne_temporal_temporal(this.ptr, temp2.ptr);
	}

	/** MEOS: temporal_ext_kalman_filter */
	extKalmanFilter(gate: number, q: number, variance: number, to_drop: boolean): Temporal {
		return wrapTemporal(F.temporal_ext_kalman_filter(this.ptr, gate, q, variance, to_drop)) as Temporal;
	}

	/** MEOS: temporal_frechet_distance */
	frechetDistance(temp2: Temporal, spheroid: boolean): number {
		return F.temporal_frechet_distance(this.ptr, temp2.ptr, spheroid);
	}

	/** MEOS: temporal_frechet_path */
	frechetPath(temp2: Temporal, spheroid: boolean): Match[] {
		const _count = _alloc(4);
		try {
			const _arr = F.temporal_frechet_path(this.ptr, temp2.ptr, spheroid, _count);
			if (!_arr) return [];
			try {
				const _n = _view(_count, 4).getInt32(0, true);
				const _v = _view(_arr, _n * 8);
				const _out: Match[] = [];
				for (let _i = 0; _i < _n; _i++) _out.push(_readMatch(_arr + _i * 8));
				return _out;
			} finally {
				_free(_arr);
			}
		} finally {
			_free(_count);
		}
	}

	/** MEOS: temporal_ge */
	ge(temp2: Temporal): boolean {
		return F.temporal_ge(this.ptr, temp2.ptr);
	}

	/** MEOS: temporal_gt */
	gt(temp2: Temporal): boolean {
		return F.temporal_gt(this.ptr, temp2.ptr);
	}

	/** MEOS: temporal_hash */
	hash(): number {
		return F.temporal_hash(this.ptr);
	}

	/** MEOS: temporal_hash_extended */
	hashExtended(seed: number): number {
		return F.temporal_hash_extended(this.ptr, seed);
	}

	/** MEOS: temporal_hausdorff_distance */
	hausdorffDistance(temp2: Temporal, spheroid: boolean): number {
		return F.temporal_hausdorff_distance(this.ptr, temp2.ptr, spheroid);
	}

	/** MEOS: temporal_insert */
	insert(temp2: Temporal, connect: boolean): Temporal {
		return wrapTemporal(F.temporal_insert(this.ptr, temp2.ptr, connect)) as Temporal;
	}

	/** MEOS: temporal_instants */
	instants(): Temporal[] {
		const _count = _alloc(4);
		try {
			const _arr = F.temporal_instants(this.ptr, _count);
			if (!_arr) return [];
			try {
				const _n = _view(_count, 4).getInt32(0, true);
				const _v = _view(_arr, _n * 8);
				const _out: Temporal[] = [];
				for (let _i = 0; _i < _n; _i++) _out.push(wrapTemporal(Number(_v.getBigUint64(_i * 8, true))) as Temporal);
				return _out;
			} finally {
				_free(_arr);
			}
		} finally {
			_free(_count);
		}
	}

	/** MEOS: temporal_interp */
	interp(): string {
		return F.temporal_interp(this.ptr);
	}

	/** MEOS: temporal_lcss_distance */
	lcssDistance(temp2: Temporal, epsilon: number, spheroid: boolean): number {
		return F.temporal_lcss_distance(this.ptr, temp2.ptr, epsilon, spheroid);
	}

	/** MEOS: temporal_le */
	le(temp2: Temporal): boolean {
		return F.temporal_le(this.ptr, temp2.ptr);
	}

	/** MEOS: temporal_lower_inc */
	lowerInc(): boolean {
		return F.temporal_lower_inc(this.ptr);
	}

	/** MEOS: temporal_lt */
	lt(temp2: Temporal): boolean {
		return F.temporal_lt(this.ptr, temp2.ptr);
	}

	/** MEOS: temporal_max_instant */
	maxInstant(): Temporal {
		return wrapTemporal(F.temporal_max_instant(this.ptr)) as Temporal;
	}

	/** MEOS: temporal_mem_size */
	memSize(): number {
		return F.temporal_mem_size(this.ptr);
	}

	/** MEOS: temporal_merge */
	merge(temp2: Temporal): Temporal | null {
		return wrapTemporalOrNull(F.temporal_merge(this.ptr, temp2.ptr)) as Temporal | null;
	}

	/** MEOS: temporal_min_instant */
	minInstant(): Temporal {
		return wrapTemporal(F.temporal_min_instant(this.ptr)) as Temporal;
	}

	/** MEOS: temporal_minus_max */
	minusMax(): Temporal | null {
		return wrapTemporalOrNull(F.temporal_minus_max(this.ptr)) as Temporal | null;
	}

	/** MEOS: temporal_minus_min */
	minusMin(): Temporal | null {
		return wrapTemporalOrNull(F.temporal_minus_min(this.ptr)) as Temporal | null;
	}

	/** MEOS: temporal_minus_timestamptz */
	minusTimestamptz(t: TimestampTz): Temporal | null {
		return wrapTemporalOrNull(F.temporal_minus_timestamptz(this.ptr, t)) as Temporal | null;
	}

	/** MEOS: temporal_minus_tstzset */
	minusTstzset(s: Set): Temporal | null {
		return wrapTemporalOrNull(F.temporal_minus_tstzset(this.ptr, s.ptr)) as Temporal | null;
	}

	/** MEOS: temporal_minus_tstzspan */
	minusTstzspan(s: Span): Temporal | null {
		return wrapTemporalOrNull(F.temporal_minus_tstzspan(this.ptr, s.ptr)) as Temporal | null;
	}

	/** MEOS: temporal_minus_tstzspanset */
	minusTstzspanset(ss: SpanSet): Temporal | null {
		return wrapTemporalOrNull(F.temporal_minus_tstzspanset(this.ptr, ss.ptr)) as Temporal | null;
	}

	/** MEOS: temporal_minus_values */
	minusValues(set: Set): Temporal | null {
		return wrapTemporalOrNull(F.temporal_minus_values(this.ptr, set.ptr)) as Temporal | null;
	}

	/** MEOS: temporal_ne */
	ne(temp2: Temporal): boolean {
		return F.temporal_ne(this.ptr, temp2.ptr);
	}

	/** MEOS: temporal_num_instants */
	numInstants(): number {
		return F.temporal_num_instants(this.ptr);
	}

	/** MEOS: temporal_num_sequences */
	numSequences(): number {
		return F.temporal_num_sequences(this.ptr);
	}

	/** MEOS: temporal_num_timestamps */
	numTimestamps(): number {
		return F.temporal_num_timestamps(this.ptr);
	}

	/** MEOS: overafter_temporal_tstzspan */
	overafter(s: TsTzSpan): boolean {
		return F.overafter_temporal_tstzspan(this.ptr, s.ptr);
	}

	/** MEOS: overbefore_temporal_tstzspan */
	overbefore(s: TsTzSpan): boolean {
		return F.overbefore_temporal_tstzspan(this.ptr, s.ptr);
	}

	/** MEOS: overlaps_temporal_tstzspan */
	overlaps(s: TsTzSpan): boolean {
		return F.overlaps_temporal_tstzspan(this.ptr, s.ptr);
	}

	/** MEOS: temporal_round */
	round(maxdd: number): Temporal {
		return wrapTemporal(F.temporal_round(this.ptr, maxdd)) as Temporal;
	}

	/** MEOS: same_temporal_tstzspan */
	same(s: TsTzSpan): boolean {
		return F.same_temporal_tstzspan(this.ptr, s.ptr);
	}

	/** MEOS: temporal_scale_time */
	scaleTime(duration: Interval): Temporal {
		const _duration = _putInterval(duration);
		try {
			return wrapTemporal(F.temporal_scale_time(this.ptr, _duration)) as Temporal;
		} finally {
			_free(_duration);
		}
	}

	/** MEOS: temporal_segm_duration */
	segmDuration(duration: Interval, atleast: boolean, strict: boolean): Temporal | null {
		const _duration = _putInterval(duration);
		try {
			return wrapTemporalOrNull(F.temporal_segm_duration(this.ptr, _duration, atleast, strict)) as Temporal | null;
		} finally {
			_free(_duration);
		}
	}

	/** MEOS: temporal_segments */
	segments(): Temporal[] {
		const _count = _alloc(4);
		try {
			const _arr = F.temporal_segments(this.ptr, _count);
			if (!_arr) return [];
			try {
				const _n = _view(_count, 4).getInt32(0, true);
				const _v = _view(_arr, _n * 8);
				const _out: Temporal[] = [];
				for (let _i = 0; _i < _n; _i++) _out.push(wrapTemporal(Number(_v.getBigUint64(_i * 8, true))) as Temporal);
				return _out;
			} finally {
				_free(_arr);
			}
		} finally {
			_free(_count);
		}
	}

	/** MEOS: temporal_sequence_n */
	sequenceN(i: number): Temporal | null {
		return wrapTemporalOrNull(F.temporal_sequence_n(this.ptr, i)) as Temporal | null;
	}

	/** MEOS: temporal_sequences */
	sequences(): Temporal[] {
		const _count = _alloc(4);
		try {
			const _arr = F.temporal_sequences(this.ptr, _count);
			if (!_arr) return [];
			try {
				const _n = _view(_count, 4).getInt32(0, true);
				const _v = _view(_arr, _n * 8);
				const _out: Temporal[] = [];
				for (let _i = 0; _i < _n; _i++) _out.push(wrapTemporal(Number(_v.getBigUint64(_i * 8, true))) as Temporal);
				return _out;
			} finally {
				_free(_arr);
			}
		} finally {
			_free(_count);
		}
	}

	/** MEOS: temporal_set_interp */
	setInterp(interp: number): Temporal {
		return wrapTemporal(F.temporal_set_interp(this.ptr, interp)) as Temporal;
	}

	/** MEOS: temporal_shift_scale_time */
	shiftScaleTime(shift: Interval, duration: Interval): Temporal {
		const _shift = _putInterval(shift);
		const _duration = _putInterval(duration);
		try {
			return wrapTemporal(F.temporal_shift_scale_time(this.ptr, _shift, _duration)) as Temporal;
		} finally {
			_free(_shift);
			_free(_duration);
		}
	}

	/** MEOS: temporal_shift_time */
	shiftTime(shift: Interval): Temporal {
		const _shift = _putInterval(shift);
		try {
			return wrapTemporal(F.temporal_shift_time(this.ptr, _shift)) as Temporal;
		} finally {
			_free(_shift);
		}
	}

	/** MEOS: temporal_simplify_dp */
	simplifyDp(dist: number, synchronized: boolean): Temporal {
		return wrapTemporal(F.temporal_simplify_dp(this.ptr, dist, synchronized)) as Temporal;
	}

	/** MEOS: temporal_simplify_max_dist */
	simplifyMaxDist(dist: number, synchronized: boolean): Temporal {
		return wrapTemporal(F.temporal_simplify_max_dist(this.ptr, dist, synchronized)) as Temporal;
	}

	/** MEOS: temporal_simplify_min_dist */
	simplifyMinDist(dist: number): Temporal {
		return wrapTemporal(F.temporal_simplify_min_dist(this.ptr, dist)) as Temporal;
	}

	/** MEOS: temporal_simplify_min_tdelta */
	simplifyMinTdelta(mint: Interval): Temporal {
		const _mint = _putInterval(mint);
		try {
			return wrapTemporal(F.temporal_simplify_min_tdelta(this.ptr, _mint)) as Temporal;
		} finally {
			_free(_mint);
		}
	}

	/** MEOS: temporal_sortkey */
	sortkey(): Uint8Array {
		return readWkb(_sizeOut => F.temporal_sortkey(this.ptr, _sizeOut));
	}

	/** MEOS: temporal_spans */
	spans(): Span[] {
		const _count = _alloc(4);
		try {
			const _arr = F.temporal_spans(this.ptr, _count);
			if (!_arr) return [];
			try {
				const _n = _view(_count, 4).getInt32(0, true);
				const _v = _view(_arr, _n * 24);
				const _out: Span[] = [];
				for (let _i = 0; _i < _n; _i++) _out.push(wrapSpan(_copy(_arr + _i * 24, 24)) as Span);
				return _out;
			} finally {
				_free(_arr);
			}
		} finally {
			_free(_count);
		}
	}

	/** MEOS: temporal_split_each_n_spans */
	splitEachNSpans(elem_count: number): Span[] {
		const _count = _alloc(4);
		try {
			const _arr = F.temporal_split_each_n_spans(this.ptr, elem_count, _count);
			if (!_arr) return [];
			try {
				const _n = _view(_count, 4).getInt32(0, true);
				const _v = _view(_arr, _n * 24);
				const _out: Span[] = [];
				for (let _i = 0; _i < _n; _i++) _out.push(wrapSpan(_copy(_arr + _i * 24, 24)) as Span);
				return _out;
			} finally {
				_free(_arr);
			}
		} finally {
			_free(_count);
		}
	}

	/** MEOS: temporal_split_n_spans */
	splitNSpans(span_count: number): Span[] {
		const _count = _alloc(4);
		try {
			const _arr = F.temporal_split_n_spans(this.ptr, span_count, _count);
			if (!_arr) return [];
			try {
				const _n = _view(_count, 4).getInt32(0, true);
				const _v = _view(_arr, _n * 24);
				const _out: Span[] = [];
				for (let _i = 0; _i < _n; _i++) _out.push(wrapSpan(_copy(_arr + _i * 24, 24)) as Span);
				return _out;
			} finally {
				_free(_arr);
			}
		} finally {
			_free(_count);
		}
	}

	/** MEOS: temporal_start_instant */
	startInstant(): Temporal {
		return wrapTemporal(F.temporal_start_instant(this.ptr)) as Temporal;
	}

	/** MEOS: temporal_start_sequence */
	startSequence(): Temporal {
		return wrapTemporal(F.temporal_start_sequence(this.ptr)) as Temporal;
	}

	/** MEOS: temporal_start_timestamptz */
	startTimestamptz(): TimestampTz {
		return F.temporal_start_timestamptz(this.ptr);
	}

	/** MEOS: temporal_stops */
	stops(maxdist: number, minduration: Interval): Temporal | null {
		const _minduration = _putInterval(minduration);
		try {
			return wrapTemporalOrNull(F.temporal_stops(this.ptr, maxdist, _minduration)) as Temporal | null;
		} finally {
			_free(_minduration);
		}
	}

	/** MEOS: temporal_subtype */
	subtype(): string {
		return F.temporal_subtype(this.ptr);
	}

	/** MEOS: teq_temporal_temporal */
	teq(temp2: Temporal): Temporal | null {
		return wrapTemporalOrNull(F.teq_temporal_temporal(this.ptr, temp2.ptr)) as Temporal | null;
	}

	/** MEOS: tge_temporal_temporal */
	tge(temp2: Temporal): Temporal | null {
		return wrapTemporalOrNull(F.tge_temporal_temporal(this.ptr, temp2.ptr)) as Temporal | null;
	}

	/** MEOS: tgt_temporal_temporal */
	tgt(temp2: Temporal): Temporal | null {
		return wrapTemporalOrNull(F.tgt_temporal_temporal(this.ptr, temp2.ptr)) as Temporal | null;
	}

	/** MEOS: temporal_time */
	time(): SpanSet {
		return wrapSpanSet(F.temporal_time(this.ptr)) as SpanSet;
	}

	/** MEOS: temporal_time_bins */
	timeBins(duration: Interval, torigin: TimestampTz, border_inc: boolean): Span[] {
		const _duration = _putInterval(duration);
		const _count = _alloc(4);
		try {
			const _arr = F.temporal_time_bins(this.ptr, _duration, torigin, border_inc, _count);
			if (!_arr) return [];
			try {
				const _n = _view(_count, 4).getInt32(0, true);
				const _v = _view(_arr, _n * 24);
				const _out: Span[] = [];
				for (let _i = 0; _i < _n; _i++) _out.push(wrapSpan(_copy(_arr + _i * 24, 24)) as Span);
				return _out;
			} finally {
				_free(_arr);
			}
		} finally {
			_free(_duration);
			_free(_count);
		}
	}

	/** MEOS: temporal_timestamps */
	timestamps(): TimestampTz[] {
		const _count = _alloc(4);
		try {
			const _arr = F.temporal_timestamps(this.ptr, _count);
			if (!_arr) return [];
			try {
				const _n = _view(_count, 4).getInt32(0, true);
				const _v = _view(_arr, _n * 8);
				const _out: TimestampTz[] = [];
				for (let _i = 0; _i < _n; _i++) _out.push(Number(_v.getBigInt64(_i * 8, true)));
				return _out;
			} finally {
				_free(_arr);
			}
		} finally {
			_free(_count);
		}
	}

	/** MEOS: temporal_timestamptz_n */
	timestamptzN(n: number): TimestampTz {
		return F.temporal_timestamptz_n(this.ptr, n);
	}

	/** MEOS: tle_temporal_temporal */
	tle(temp2: Temporal): Temporal | null {
		return wrapTemporalOrNull(F.tle_temporal_temporal(this.ptr, temp2.ptr)) as Temporal | null;
	}

	/** MEOS: tlt_temporal_temporal */
	tlt(temp2: Temporal): Temporal | null {
		return wrapTemporalOrNull(F.tlt_temporal_temporal(this.ptr, temp2.ptr)) as Temporal | null;
	}

	/** MEOS: tne_temporal_temporal */
	tne(temp2: Temporal): Temporal | null {
		return wrapTemporalOrNull(F.tne_temporal_temporal(this.ptr, temp2.ptr)) as Temporal | null;
	}

	/** MEOS: temporal_to_tstzspan */
	toTstzspan(): Span {
		return wrapSpan(F.temporal_to_tstzspan(this.ptr)) as Span;
	}

	/** MEOS: temporal_tprecision */
	tprecision(duration: Interval, torigin: TimestampTz): Temporal {
		const _duration = _putInterval(duration);
		try {
			return wrapTemporal(F.temporal_tprecision(this.ptr, _duration, torigin)) as Temporal;
		} finally {
			_free(_duration);
		}
	}

	/** MEOS: temporal_tsample */
	tsample(duration: Interval, torigin: TimestampTz, interp: number): Temporal | null {
		const _duration = _putInterval(duration);
		try {
			return wrapTemporalOrNull(F.temporal_tsample(this.ptr, _duration, torigin, interp)) as Temporal | null;
		} finally {
			_free(_duration);
		}
	}

	/** MEOS: temporal_update */
	update(temp2: Temporal, connect: boolean): Temporal {
		return wrapTemporal(F.temporal_update(this.ptr, temp2.ptr, connect)) as Temporal;
	}

	/** MEOS: temporal_upper_inc */
	upperInc(): boolean {
		return F.temporal_upper_inc(this.ptr);
	}

	/** MEOS: temporal_valueset */
	valueset(): Set {
		return wrapSet(F.temporal_valueset(this.ptr)) as Set;
	}

	/** MEOS: temporal_from_hexwkb */
	static fromHexWKB(hexwkb: string): Temporal {
		return wrapTemporal(F.temporal_from_hexwkb(hexwkb)) as Temporal;
	}

	/** MEOS: temporal_from_wkb */
	static fromWKB(wkb: Uint8Array): Temporal {
		const _wkb = _bytes(wkb);
		try {
			return wrapTemporal(F.temporal_from_wkb(_wkb, wkb.length)) as Temporal;
		} finally {
			_free(_wkb);
		}
	}

	/** MEOS: temporal_merge_array */
	static mergeArray(temparr: Temporal[]): Temporal {
		const _temparr = _ptrArray(temparr.map(x => x.ptr));
		try {
			return wrapTemporal(F.temporal_merge_array(_temparr, temparr.length)) as Temporal;
		} finally {
			_free(_temparr);
		}
	}
}

/**
 * Non-numeric, non-spatial temporal types (step/discrete interpolation only). A real MEOS grouping (talpha_type) with no user-facing class name in PyMEOS — see corrections.
 */
export class TAlpha extends Temporal {

	/** MEOS: adjacent_temporal_temporal */
	private _adjacent_temporal_temporal(temp2: TAlpha): boolean {
		return F.adjacent_temporal_temporal(this.ptr, temp2.ptr);
	}

	/** MEOS: after_temporal_temporal */
	private _after_temporal_temporal(temp2: TAlpha): boolean {
		return F.after_temporal_temporal(this.ptr, temp2.ptr);
	}

	/** MEOS: before_temporal_temporal */
	private _before_temporal_temporal(temp2: TAlpha): boolean {
		return F.before_temporal_temporal(this.ptr, temp2.ptr);
	}

	/** MEOS: contained_temporal_temporal */
	private _contained_temporal_temporal(temp2: TAlpha): boolean {
		return F.contained_temporal_temporal(this.ptr, temp2.ptr);
	}

	/** MEOS: contains_temporal_temporal */
	private _contains_temporal_temporal(temp2: TAlpha): boolean {
		return F.contains_temporal_temporal(this.ptr, temp2.ptr);
	}

	/** MEOS: overafter_temporal_temporal */
	private _overafter_temporal_temporal(temp2: TAlpha): boolean {
		return F.overafter_temporal_temporal(this.ptr, temp2.ptr);
	}

	/** MEOS: overbefore_temporal_temporal */
	private _overbefore_temporal_temporal(temp2: TAlpha): boolean {
		return F.overbefore_temporal_temporal(this.ptr, temp2.ptr);
	}

	/** MEOS: overlaps_temporal_temporal */
	private _overlaps_temporal_temporal(temp2: TAlpha): boolean {
		return F.overlaps_temporal_temporal(this.ptr, temp2.ptr);
	}

	/** MEOS: same_temporal_temporal */
	private _same_temporal_temporal(temp2: TAlpha): boolean {
		return F.same_temporal_temporal(this.ptr, temp2.ptr);
	}

	/** MEOS: adjacent_temporal_temporal, chosen by the arguments' types */
	override adjacent(temp2: TAlpha | TsTzSpan): boolean {
		if (temp2 instanceof TAlpha) return this._adjacent_temporal_temporal(temp2 as TAlpha);
		return super.adjacent(temp2 as TsTzSpan);
	}

	/** MEOS: after_temporal_temporal, chosen by the arguments' types */
	override after(temp2: TAlpha | TsTzSpan): boolean {
		if (temp2 instanceof TAlpha) return this._after_temporal_temporal(temp2 as TAlpha);
		return super.after(temp2 as TsTzSpan);
	}

	/** MEOS: before_temporal_temporal, chosen by the arguments' types */
	override before(temp2: TAlpha | TsTzSpan): boolean {
		if (temp2 instanceof TAlpha) return this._before_temporal_temporal(temp2 as TAlpha);
		return super.before(temp2 as TsTzSpan);
	}

	/** MEOS: contained_temporal_temporal, chosen by the arguments' types */
	override contained(temp2: TAlpha | TsTzSpan): boolean {
		if (temp2 instanceof TAlpha) return this._contained_temporal_temporal(temp2 as TAlpha);
		return super.contained(temp2 as TsTzSpan);
	}

	/** MEOS: contains_temporal_temporal, chosen by the arguments' types */
	override contains(temp2: TAlpha | TsTzSpan): boolean {
		if (temp2 instanceof TAlpha) return this._contains_temporal_temporal(temp2 as TAlpha);
		return super.contains(temp2 as TsTzSpan);
	}

	/** MEOS: overafter_temporal_temporal, chosen by the arguments' types */
	override overafter(temp2: TAlpha | TsTzSpan): boolean {
		if (temp2 instanceof TAlpha) return this._overafter_temporal_temporal(temp2 as TAlpha);
		return super.overafter(temp2 as TsTzSpan);
	}

	/** MEOS: overbefore_temporal_temporal, chosen by the arguments' types */
	override overbefore(temp2: TAlpha | TsTzSpan): boolean {
		if (temp2 instanceof TAlpha) return this._overbefore_temporal_temporal(temp2 as TAlpha);
		return super.overbefore(temp2 as TsTzSpan);
	}

	/** MEOS: overlaps_temporal_temporal, chosen by the arguments' types */
	override overlaps(temp2: TAlpha | TsTzSpan): boolean {
		if (temp2 instanceof TAlpha) return this._overlaps_temporal_temporal(temp2 as TAlpha);
		return super.overlaps(temp2 as TsTzSpan);
	}

	/** MEOS: same_temporal_temporal, chosen by the arguments' types */
	override same(temp2: TAlpha | TsTzSpan): boolean {
		if (temp2 instanceof TAlpha) return this._same_temporal_temporal(temp2 as TAlpha);
		return super.same(temp2 as TsTzSpan);
	}
}

/**
 * Temporal numbers; supports linear interpolation.
 */
export class TNumber extends Temporal {

	/** MEOS: adjacent_tnumber_numspan */
	private _adjacent_tnumber_numspan(s: Span): boolean {
		return F.adjacent_tnumber_numspan(this.ptr, s.ptr);
	}

	/** MEOS: adjacent_tnumber_tbox */
	private _adjacent_tnumber_tbox(box: TBox): boolean {
		return F.adjacent_tnumber_tbox(this.ptr, box.ptr);
	}

	/** MEOS: adjacent_tnumber_tnumber */
	private _adjacent_tnumber_tnumber(temp2: TNumber): boolean {
		return F.adjacent_tnumber_tnumber(this.ptr, temp2.ptr);
	}

	/** MEOS: after_tnumber_tbox */
	private _after_tnumber_tbox(box: TBox): boolean {
		return F.after_tnumber_tbox(this.ptr, box.ptr);
	}

	/** MEOS: after_tnumber_tnumber */
	private _after_tnumber_tnumber(temp2: TNumber): boolean {
		return F.after_tnumber_tnumber(this.ptr, temp2.ptr);
	}

	/** MEOS: before_tnumber_tbox */
	private _before_tnumber_tbox(box: TBox): boolean {
		return F.before_tnumber_tbox(this.ptr, box.ptr);
	}

	/** MEOS: before_tnumber_tnumber */
	private _before_tnumber_tnumber(temp2: TNumber): boolean {
		return F.before_tnumber_tnumber(this.ptr, temp2.ptr);
	}

	/** MEOS: contained_tnumber_numspan */
	private _contained_tnumber_numspan(s: Span): boolean {
		return F.contained_tnumber_numspan(this.ptr, s.ptr);
	}

	/** MEOS: contained_tnumber_tbox */
	private _contained_tnumber_tbox(box: TBox): boolean {
		return F.contained_tnumber_tbox(this.ptr, box.ptr);
	}

	/** MEOS: contained_tnumber_tnumber */
	private _contained_tnumber_tnumber(temp2: TNumber): boolean {
		return F.contained_tnumber_tnumber(this.ptr, temp2.ptr);
	}

	/** MEOS: contains_tnumber_numspan */
	private _contains_tnumber_numspan(s: Span): boolean {
		return F.contains_tnumber_numspan(this.ptr, s.ptr);
	}

	/** MEOS: contains_tnumber_tbox */
	private _contains_tnumber_tbox(box: TBox): boolean {
		return F.contains_tnumber_tbox(this.ptr, box.ptr);
	}

	/** MEOS: contains_tnumber_tnumber */
	private _contains_tnumber_tnumber(temp2: TNumber): boolean {
		return F.contains_tnumber_tnumber(this.ptr, temp2.ptr);
	}

	/** MEOS: left_tnumber_numspan */
	private _left_tnumber_numspan(s: Span): boolean {
		return F.left_tnumber_numspan(this.ptr, s.ptr);
	}

	/** MEOS: left_tnumber_tbox */
	private _left_tnumber_tbox(box: TBox): boolean {
		return F.left_tnumber_tbox(this.ptr, box.ptr);
	}

	/** MEOS: left_tnumber_tnumber */
	private _left_tnumber_tnumber(temp2: TNumber): boolean {
		return F.left_tnumber_tnumber(this.ptr, temp2.ptr);
	}

	/** MEOS: overafter_tnumber_tbox */
	private _overafter_tnumber_tbox(box: TBox): boolean {
		return F.overafter_tnumber_tbox(this.ptr, box.ptr);
	}

	/** MEOS: overafter_tnumber_tnumber */
	private _overafter_tnumber_tnumber(temp2: TNumber): boolean {
		return F.overafter_tnumber_tnumber(this.ptr, temp2.ptr);
	}

	/** MEOS: overbefore_tnumber_tbox */
	private _overbefore_tnumber_tbox(box: TBox): boolean {
		return F.overbefore_tnumber_tbox(this.ptr, box.ptr);
	}

	/** MEOS: overbefore_tnumber_tnumber */
	private _overbefore_tnumber_tnumber(temp2: TNumber): boolean {
		return F.overbefore_tnumber_tnumber(this.ptr, temp2.ptr);
	}

	/** MEOS: overlaps_tnumber_numspan */
	private _overlaps_tnumber_numspan(s: Span): boolean {
		return F.overlaps_tnumber_numspan(this.ptr, s.ptr);
	}

	/** MEOS: overlaps_tnumber_tbox */
	private _overlaps_tnumber_tbox(box: TBox): boolean {
		return F.overlaps_tnumber_tbox(this.ptr, box.ptr);
	}

	/** MEOS: overlaps_tnumber_tnumber */
	private _overlaps_tnumber_tnumber(temp2: TNumber): boolean {
		return F.overlaps_tnumber_tnumber(this.ptr, temp2.ptr);
	}

	/** MEOS: overleft_tnumber_numspan */
	private _overleft_tnumber_numspan(s: Span): boolean {
		return F.overleft_tnumber_numspan(this.ptr, s.ptr);
	}

	/** MEOS: overleft_tnumber_tbox */
	private _overleft_tnumber_tbox(box: TBox): boolean {
		return F.overleft_tnumber_tbox(this.ptr, box.ptr);
	}

	/** MEOS: overleft_tnumber_tnumber */
	private _overleft_tnumber_tnumber(temp2: TNumber): boolean {
		return F.overleft_tnumber_tnumber(this.ptr, temp2.ptr);
	}

	/** MEOS: overright_tnumber_numspan */
	private _overright_tnumber_numspan(s: Span): boolean {
		return F.overright_tnumber_numspan(this.ptr, s.ptr);
	}

	/** MEOS: overright_tnumber_tbox */
	private _overright_tnumber_tbox(box: TBox): boolean {
		return F.overright_tnumber_tbox(this.ptr, box.ptr);
	}

	/** MEOS: overright_tnumber_tnumber */
	private _overright_tnumber_tnumber(temp2: TNumber): boolean {
		return F.overright_tnumber_tnumber(this.ptr, temp2.ptr);
	}

	/** MEOS: right_tnumber_numspan */
	private _right_tnumber_numspan(s: Span): boolean {
		return F.right_tnumber_numspan(this.ptr, s.ptr);
	}

	/** MEOS: right_tnumber_tbox */
	private _right_tnumber_tbox(box: TBox): boolean {
		return F.right_tnumber_tbox(this.ptr, box.ptr);
	}

	/** MEOS: right_tnumber_tnumber */
	private _right_tnumber_tnumber(temp2: TNumber): boolean {
		return F.right_tnumber_tnumber(this.ptr, temp2.ptr);
	}

	/** MEOS: same_tnumber_numspan */
	private _same_tnumber_numspan(s: Span): boolean {
		return F.same_tnumber_numspan(this.ptr, s.ptr);
	}

	/** MEOS: same_tnumber_tbox */
	private _same_tnumber_tbox(box: TBox): boolean {
		return F.same_tnumber_tbox(this.ptr, box.ptr);
	}

	/** MEOS: same_tnumber_tnumber */
	private _same_tnumber_tnumber(temp2: TNumber): boolean {
		return F.same_tnumber_tnumber(this.ptr, temp2.ptr);
	}

	/** MEOS: tnumber_abs */
	abs(): Temporal {
		return wrapTemporal(F.tnumber_abs(this.ptr)) as Temporal;
	}

	/** MEOS: add_tnumber_tnumber */
	add(tnumber2: TNumber): Temporal | null {
		return wrapTemporalOrNull(F.add_tnumber_tnumber(this.ptr, tnumber2.ptr)) as Temporal | null;
	}

	/** MEOS: adjacent_tnumber_numspan, adjacent_tnumber_tbox, adjacent_tnumber_tnumber, chosen by the arguments' types */
	override adjacent(s: Span | TBox | TNumber | TsTzSpan): boolean {
		if (s instanceof Span) return this._adjacent_tnumber_numspan(s as Span);
		if (s instanceof TBox) return this._adjacent_tnumber_tbox(s as TBox);
		if (s instanceof TNumber) return this._adjacent_tnumber_tnumber(s as TNumber);
		return super.adjacent(s as TsTzSpan);
	}

	/** MEOS: after_tnumber_tbox, after_tnumber_tnumber, chosen by the arguments' types */
	override after(box: TBox | TNumber | TsTzSpan): boolean {
		if (box instanceof TBox) return this._after_tnumber_tbox(box as TBox);
		if (box instanceof TNumber) return this._after_tnumber_tnumber(box as TNumber);
		return super.after(box as TsTzSpan);
	}

	/** MEOS: tnumber_angular_difference */
	angularDifference(): Temporal {
		return wrapTemporal(F.tnumber_angular_difference(this.ptr)) as Temporal;
	}

	/** MEOS: tnumber_at_span */
	atSpan(span: Span): Temporal | null {
		return wrapTemporalOrNull(F.tnumber_at_span(this.ptr, span.ptr)) as Temporal | null;
	}

	/** MEOS: tnumber_at_spanset */
	atSpanset(ss: SpanSet): Temporal | null {
		return wrapTemporalOrNull(F.tnumber_at_spanset(this.ptr, ss.ptr)) as Temporal | null;
	}

	/** MEOS: tnumber_at_tbox */
	atTbox(box: TBox): Temporal | null {
		return wrapTemporalOrNull(F.tnumber_at_tbox(this.ptr, box.ptr)) as Temporal | null;
	}

	/** MEOS: tnumber_avg_value */
	avgValue(): number {
		return F.tnumber_avg_value(this.ptr);
	}

	/** MEOS: before_tnumber_tbox, before_tnumber_tnumber, chosen by the arguments' types */
	override before(box: TBox | TNumber | TsTzSpan): boolean {
		if (box instanceof TBox) return this._before_tnumber_tbox(box as TBox);
		if (box instanceof TNumber) return this._before_tnumber_tnumber(box as TNumber);
		return super.before(box as TsTzSpan);
	}

	/** MEOS: contained_tnumber_numspan, contained_tnumber_tbox, contained_tnumber_tnumber, chosen by the arguments' types */
	override contained(s: Span | TBox | TNumber | TsTzSpan): boolean {
		if (s instanceof Span) return this._contained_tnumber_numspan(s as Span);
		if (s instanceof TBox) return this._contained_tnumber_tbox(s as TBox);
		if (s instanceof TNumber) return this._contained_tnumber_tnumber(s as TNumber);
		return super.contained(s as TsTzSpan);
	}

	/** MEOS: contains_tnumber_numspan, contains_tnumber_tbox, contains_tnumber_tnumber, chosen by the arguments' types */
	override contains(s: Span | TBox | TNumber | TsTzSpan): boolean {
		if (s instanceof Span) return this._contains_tnumber_numspan(s as Span);
		if (s instanceof TBox) return this._contains_tnumber_tbox(s as TBox);
		if (s instanceof TNumber) return this._contains_tnumber_tnumber(s as TNumber);
		return super.contains(s as TsTzSpan);
	}

	/** MEOS: tnumber_delta_value */
	deltaValue(): Temporal | null {
		return wrapTemporalOrNull(F.tnumber_delta_value(this.ptr)) as Temporal | null;
	}

	/** MEOS: div_tnumber_tnumber */
	div(tnumber2: TNumber): Temporal | null {
		return wrapTemporalOrNull(F.div_tnumber_tnumber(this.ptr, tnumber2.ptr)) as Temporal | null;
	}

	/** MEOS: tnumber_integral */
	integral(): number {
		return F.tnumber_integral(this.ptr);
	}

	/** MEOS: left_tnumber_numspan, left_tnumber_tbox, left_tnumber_tnumber, chosen by the arguments' types */
	left(s: Span | TBox | TNumber): boolean {
		if (s instanceof Span) return this._left_tnumber_numspan(s as Span);
		if (s instanceof TBox) return this._left_tnumber_tbox(s as TBox);
		if (s instanceof TNumber) return this._left_tnumber_tnumber(s as TNumber);
		throw new TypeError(`TNumber.left: no overload takes these arguments`);
	}

	/** MEOS: tnumber_minus_span */
	minusSpan(span: Span): Temporal | null {
		return wrapTemporalOrNull(F.tnumber_minus_span(this.ptr, span.ptr)) as Temporal | null;
	}

	/** MEOS: tnumber_minus_spanset */
	minusSpanset(ss: SpanSet): Temporal | null {
		return wrapTemporalOrNull(F.tnumber_minus_spanset(this.ptr, ss.ptr)) as Temporal | null;
	}

	/** MEOS: tnumber_minus_tbox */
	minusTbox(box: TBox): Temporal | null {
		return wrapTemporalOrNull(F.tnumber_minus_tbox(this.ptr, box.ptr)) as Temporal | null;
	}

	/** MEOS: mul_tnumber_tnumber */
	mul(tnumber2: TNumber): Temporal | null {
		return wrapTemporalOrNull(F.mul_tnumber_tnumber(this.ptr, tnumber2.ptr)) as Temporal | null;
	}

	/** MEOS: overafter_tnumber_tbox, overafter_tnumber_tnumber, chosen by the arguments' types */
	override overafter(box: TBox | TNumber | TsTzSpan): boolean {
		if (box instanceof TBox) return this._overafter_tnumber_tbox(box as TBox);
		if (box instanceof TNumber) return this._overafter_tnumber_tnumber(box as TNumber);
		return super.overafter(box as TsTzSpan);
	}

	/** MEOS: overbefore_tnumber_tbox, overbefore_tnumber_tnumber, chosen by the arguments' types */
	override overbefore(box: TBox | TNumber | TsTzSpan): boolean {
		if (box instanceof TBox) return this._overbefore_tnumber_tbox(box as TBox);
		if (box instanceof TNumber) return this._overbefore_tnumber_tnumber(box as TNumber);
		return super.overbefore(box as TsTzSpan);
	}

	/** MEOS: overlaps_tnumber_numspan, overlaps_tnumber_tbox, overlaps_tnumber_tnumber, chosen by the arguments' types */
	override overlaps(s: Span | TBox | TNumber | TsTzSpan): boolean {
		if (s instanceof Span) return this._overlaps_tnumber_numspan(s as Span);
		if (s instanceof TBox) return this._overlaps_tnumber_tbox(s as TBox);
		if (s instanceof TNumber) return this._overlaps_tnumber_tnumber(s as TNumber);
		return super.overlaps(s as TsTzSpan);
	}

	/** MEOS: overleft_tnumber_numspan, overleft_tnumber_tbox, overleft_tnumber_tnumber, chosen by the arguments' types */
	overleft(s: Span | TBox | TNumber): boolean {
		if (s instanceof Span) return this._overleft_tnumber_numspan(s as Span);
		if (s instanceof TBox) return this._overleft_tnumber_tbox(s as TBox);
		if (s instanceof TNumber) return this._overleft_tnumber_tnumber(s as TNumber);
		throw new TypeError(`TNumber.overleft: no overload takes these arguments`);
	}

	/** MEOS: overright_tnumber_numspan, overright_tnumber_tbox, overright_tnumber_tnumber, chosen by the arguments' types */
	overright(s: Span | TBox | TNumber): boolean {
		if (s instanceof Span) return this._overright_tnumber_numspan(s as Span);
		if (s instanceof TBox) return this._overright_tnumber_tbox(s as TBox);
		if (s instanceof TNumber) return this._overright_tnumber_tnumber(s as TNumber);
		throw new TypeError(`TNumber.overright: no overload takes these arguments`);
	}

	/** MEOS: right_tnumber_numspan, right_tnumber_tbox, right_tnumber_tnumber, chosen by the arguments' types */
	right(s: Span | TBox | TNumber): boolean {
		if (s instanceof Span) return this._right_tnumber_numspan(s as Span);
		if (s instanceof TBox) return this._right_tnumber_tbox(s as TBox);
		if (s instanceof TNumber) return this._right_tnumber_tnumber(s as TNumber);
		throw new TypeError(`TNumber.right: no overload takes these arguments`);
	}

	/** MEOS: same_tnumber_numspan, same_tnumber_tbox, same_tnumber_tnumber, chosen by the arguments' types */
	override same(s: Span | TBox | TNumber | TsTzSpan): boolean {
		if (s instanceof Span) return this._same_tnumber_numspan(s as Span);
		if (s instanceof TBox) return this._same_tnumber_tbox(s as TBox);
		if (s instanceof TNumber) return this._same_tnumber_tnumber(s as TNumber);
		return super.same(s as TsTzSpan);
	}

	/** MEOS: tnumber_split_each_n_tboxes */
	splitEachNTboxes(elem_count: number): TBox[] {
		const _count = _alloc(4);
		try {
			const _arr = F.tnumber_split_each_n_tboxes(this.ptr, elem_count, _count);
			if (!_arr) return [];
			try {
				const _n = _view(_count, 4).getInt32(0, true);
				const _v = _view(_arr, _n * 56);
				const _out: TBox[] = [];
				for (let _i = 0; _i < _n; _i++) _out.push(wrapTBox(_copy(_arr + _i * 56, 56)) as TBox);
				return _out;
			} finally {
				_free(_arr);
			}
		} finally {
			_free(_count);
		}
	}

	/** MEOS: tnumber_split_n_tboxes */
	splitNTboxes(box_count: number): TBox[] {
		const _count = _alloc(4);
		try {
			const _arr = F.tnumber_split_n_tboxes(this.ptr, box_count, _count);
			if (!_arr) return [];
			try {
				const _n = _view(_count, 4).getInt32(0, true);
				const _v = _view(_arr, _n * 56);
				const _out: TBox[] = [];
				for (let _i = 0; _i < _n; _i++) _out.push(wrapTBox(_copy(_arr + _i * 56, 56)) as TBox);
				return _out;
			} finally {
				_free(_arr);
			}
		} finally {
			_free(_count);
		}
	}

	/** MEOS: sub_tnumber_tnumber */
	sub(tnumber2: TNumber): Temporal | null {
		return wrapTemporalOrNull(F.sub_tnumber_tnumber(this.ptr, tnumber2.ptr)) as Temporal | null;
	}

	/** MEOS: tnumber_tboxes */
	tboxes(): TBox[] {
		const _count = _alloc(4);
		try {
			const _arr = F.tnumber_tboxes(this.ptr, _count);
			if (!_arr) return [];
			try {
				const _n = _view(_count, 4).getInt32(0, true);
				const _v = _view(_arr, _n * 56);
				const _out: TBox[] = [];
				for (let _i = 0; _i < _n; _i++) _out.push(wrapTBox(_copy(_arr + _i * 56, 56)) as TBox);
				return _out;
			} finally {
				_free(_arr);
			}
		} finally {
			_free(_count);
		}
	}

	/** MEOS: tdistance_tnumber_tnumber */
	tdistance(temp2: TNumber): Temporal | null {
		return wrapTemporalOrNull(F.tdistance_tnumber_tnumber(this.ptr, temp2.ptr)) as Temporal | null;
	}

	/** MEOS: tnumber_to_span */
	toSpan(): Span {
		return wrapSpan(F.tnumber_to_span(this.ptr)) as Span;
	}

	/** MEOS: tnumber_to_tbox */
	toTbox(): TBox {
		return wrapTBox(F.tnumber_to_tbox(this.ptr)) as TBox;
	}

	/** MEOS: tnumber_trend */
	trend(): Temporal | null {
		return wrapTemporalOrNull(F.tnumber_trend(this.ptr)) as Temporal | null;
	}

	/** MEOS: tnumber_twavg */
	twavg(): number {
		return F.tnumber_twavg(this.ptr);
	}

	/** MEOS: tnumber_valuespans */
	valuespans(): SpanSet {
		return wrapSpanSet(F.tnumber_valuespans(this.ptr)) as SpanSet;
	}
}

/**
 * The TBigint class of the MEOS object model.
 */
export class TBigint extends TNumber {

	/** The text MEOS writes this value as (MEOS: tbigint_out). */
	override toString(): string {
		return this.out();
	}

	/** MEOS: add_tbigint_bigint */
	private _add_tbigint_bigint(i: number): Temporal {
		return wrapTemporal(F.add_tbigint_bigint(this.ptr, i)) as Temporal;
	}

	/** MEOS: always_eq_tbigint_bigint */
	private _always_eq_tbigint_bigint(i: number): number {
		return F.always_eq_tbigint_bigint(this.ptr, i);
	}

	/** MEOS: always_ge_tbigint_bigint */
	private _always_ge_tbigint_bigint(i: number): number {
		return F.always_ge_tbigint_bigint(this.ptr, i);
	}

	/** MEOS: always_gt_tbigint_bigint */
	private _always_gt_tbigint_bigint(i: number): number {
		return F.always_gt_tbigint_bigint(this.ptr, i);
	}

	/** MEOS: always_le_tbigint_bigint */
	private _always_le_tbigint_bigint(i: number): number {
		return F.always_le_tbigint_bigint(this.ptr, i);
	}

	/** MEOS: always_lt_tbigint_bigint */
	private _always_lt_tbigint_bigint(i: number): number {
		return F.always_lt_tbigint_bigint(this.ptr, i);
	}

	/** MEOS: always_ne_tbigint_bigint */
	private _always_ne_tbigint_bigint(i: number): number {
		return F.always_ne_tbigint_bigint(this.ptr, i);
	}

	/** MEOS: div_tbigint_bigint */
	private _div_tbigint_bigint(i: number): Temporal {
		return wrapTemporal(F.div_tbigint_bigint(this.ptr, i)) as Temporal;
	}

	/** MEOS: ever_eq_tbigint_bigint */
	private _ever_eq_tbigint_bigint(i: number): number {
		return F.ever_eq_tbigint_bigint(this.ptr, i);
	}

	/** MEOS: ever_ge_tbigint_bigint */
	private _ever_ge_tbigint_bigint(i: number): number {
		return F.ever_ge_tbigint_bigint(this.ptr, i);
	}

	/** MEOS: ever_gt_tbigint_bigint */
	private _ever_gt_tbigint_bigint(i: number): number {
		return F.ever_gt_tbigint_bigint(this.ptr, i);
	}

	/** MEOS: ever_le_tbigint_bigint */
	private _ever_le_tbigint_bigint(i: number): number {
		return F.ever_le_tbigint_bigint(this.ptr, i);
	}

	/** MEOS: ever_lt_tbigint_bigint */
	private _ever_lt_tbigint_bigint(i: number): number {
		return F.ever_lt_tbigint_bigint(this.ptr, i);
	}

	/** MEOS: ever_ne_tbigint_bigint */
	private _ever_ne_tbigint_bigint(i: number): number {
		return F.ever_ne_tbigint_bigint(this.ptr, i);
	}

	/** MEOS: mul_tbigint_bigint */
	private _mul_tbigint_bigint(i: number): Temporal {
		return wrapTemporal(F.mul_tbigint_bigint(this.ptr, i)) as Temporal;
	}

	/** MEOS: nad_tbigint_bigint */
	private _nad_tbigint_bigint(i: number): number {
		return F.nad_tbigint_bigint(this.ptr, i);
	}

	/** MEOS: nad_tbigint_bigintspan */
	private _nad_tbigint_bigintspan(s: BigIntSpan): number {
		return F.nad_tbigint_bigintspan(this.ptr, s.ptr);
	}

	/** MEOS: nad_tbigint_tbigint */
	private _nad_tbigint_tbigint(temp2: TBigint): number {
		return F.nad_tbigint_tbigint(this.ptr, temp2.ptr);
	}

	/** MEOS: nad_tbigint_tbox */
	private _nad_tbigint_tbox(box: TBox): number {
		return F.nad_tbigint_tbox(this.ptr, box.ptr);
	}

	/** MEOS: sub_tbigint_bigint */
	private _sub_tbigint_bigint(i: number): Temporal {
		return wrapTemporal(F.sub_tbigint_bigint(this.ptr, i)) as Temporal;
	}

	/** MEOS: teq_tbigint_bigint */
	private _teq_tbigint_bigint(i: number): Temporal {
		return wrapTemporal(F.teq_tbigint_bigint(this.ptr, i)) as Temporal;
	}

	/** MEOS: tge_tbigint_bigint */
	private _tge_tbigint_bigint(i: number): Temporal {
		return wrapTemporal(F.tge_tbigint_bigint(this.ptr, i)) as Temporal;
	}

	/** MEOS: tgt_tbigint_bigint */
	private _tgt_tbigint_bigint(i: number): Temporal {
		return wrapTemporal(F.tgt_tbigint_bigint(this.ptr, i)) as Temporal;
	}

	/** MEOS: tle_tbigint_bigint */
	private _tle_tbigint_bigint(i: number): Temporal {
		return wrapTemporal(F.tle_tbigint_bigint(this.ptr, i)) as Temporal;
	}

	/** MEOS: tlt_tbigint_bigint */
	private _tlt_tbigint_bigint(i: number): Temporal {
		return wrapTemporal(F.tlt_tbigint_bigint(this.ptr, i)) as Temporal;
	}

	/** MEOS: tne_tbigint_bigint */
	private _tne_tbigint_bigint(i: number): Temporal {
		return wrapTemporal(F.tne_tbigint_bigint(this.ptr, i)) as Temporal;
	}

	/** MEOS: add_tbigint_bigint, chosen by the arguments' types */
	override add(i: number | TNumber): Temporal | null {
		if (typeof i === 'number') return this._add_tbigint_bigint(i as number);
		return super.add(i as TNumber);
	}

	/** MEOS: always_eq_tbigint_bigint, chosen by the arguments' types */
	override alwaysEq(i: number | Temporal): number {
		if (typeof i === 'number') return this._always_eq_tbigint_bigint(i as number);
		return super.alwaysEq(i as Temporal);
	}

	/** MEOS: always_ge_tbigint_bigint, chosen by the arguments' types */
	override alwaysGe(i: number | Temporal): number {
		if (typeof i === 'number') return this._always_ge_tbigint_bigint(i as number);
		return super.alwaysGe(i as Temporal);
	}

	/** MEOS: always_gt_tbigint_bigint, chosen by the arguments' types */
	override alwaysGt(i: number | Temporal): number {
		if (typeof i === 'number') return this._always_gt_tbigint_bigint(i as number);
		return super.alwaysGt(i as Temporal);
	}

	/** MEOS: always_le_tbigint_bigint, chosen by the arguments' types */
	override alwaysLe(i: number | Temporal): number {
		if (typeof i === 'number') return this._always_le_tbigint_bigint(i as number);
		return super.alwaysLe(i as Temporal);
	}

	/** MEOS: always_lt_tbigint_bigint, chosen by the arguments' types */
	override alwaysLt(i: number | Temporal): number {
		if (typeof i === 'number') return this._always_lt_tbigint_bigint(i as number);
		return super.alwaysLt(i as Temporal);
	}

	/** MEOS: always_ne_tbigint_bigint, chosen by the arguments' types */
	override alwaysNe(i: number | Temporal): number {
		if (typeof i === 'number') return this._always_ne_tbigint_bigint(i as number);
		return super.alwaysNe(i as Temporal);
	}

	/** MEOS: tbigint_out */
	asText(): string {
		return this.out();
	}

	/** MEOS: tbigint_at_value */
	atValue(i: number): Temporal | null {
		return wrapTemporalOrNull(F.tbigint_at_value(this.ptr, i)) as Temporal | null;
	}

	/** MEOS: div_tbigint_bigint, chosen by the arguments' types */
	override div(i: number | TNumber): Temporal | null {
		if (typeof i === 'number') return this._div_tbigint_bigint(i as number);
		return super.div(i as TNumber);
	}

	/** MEOS: tbigint_end_value */
	endValue(): number {
		return F.tbigint_end_value(this.ptr);
	}

	/** MEOS: ever_eq_tbigint_bigint, chosen by the arguments' types */
	override everEq(i: number | Temporal): number {
		if (typeof i === 'number') return this._ever_eq_tbigint_bigint(i as number);
		return super.everEq(i as Temporal);
	}

	/** MEOS: ever_ge_tbigint_bigint, chosen by the arguments' types */
	override everGe(i: number | Temporal): number {
		if (typeof i === 'number') return this._ever_ge_tbigint_bigint(i as number);
		return super.everGe(i as Temporal);
	}

	/** MEOS: ever_gt_tbigint_bigint, chosen by the arguments' types */
	override everGt(i: number | Temporal): number {
		if (typeof i === 'number') return this._ever_gt_tbigint_bigint(i as number);
		return super.everGt(i as Temporal);
	}

	/** MEOS: ever_le_tbigint_bigint, chosen by the arguments' types */
	override everLe(i: number | Temporal): number {
		if (typeof i === 'number') return this._ever_le_tbigint_bigint(i as number);
		return super.everLe(i as Temporal);
	}

	/** MEOS: ever_lt_tbigint_bigint, chosen by the arguments' types */
	override everLt(i: number | Temporal): number {
		if (typeof i === 'number') return this._ever_lt_tbigint_bigint(i as number);
		return super.everLt(i as Temporal);
	}

	/** MEOS: ever_ne_tbigint_bigint, chosen by the arguments' types */
	override everNe(i: number | Temporal): number {
		if (typeof i === 'number') return this._ever_ne_tbigint_bigint(i as number);
		return super.everNe(i as Temporal);
	}

	/** MEOS: tbigint_max_value */
	maxValue(): number {
		return F.tbigint_max_value(this.ptr);
	}

	/** MEOS: tbigint_minus_value */
	minusValue(i: number): Temporal | null {
		return wrapTemporalOrNull(F.tbigint_minus_value(this.ptr, i)) as Temporal | null;
	}

	/** MEOS: tbigint_min_value */
	minValue(): number {
		return F.tbigint_min_value(this.ptr);
	}

	/** MEOS: mul_tbigint_bigint, chosen by the arguments' types */
	override mul(i: number | TNumber): Temporal | null {
		if (typeof i === 'number') return this._mul_tbigint_bigint(i as number);
		return super.mul(i as TNumber);
	}

	/** MEOS: nad_tbigint_bigint, nad_tbigint_bigintspan, nad_tbigint_tbox, nad_tbigint_tbigint, chosen by the arguments' types */
	nad(i: number | BigIntSpan | TBox | TBigint): number {
		if (i instanceof BigIntSpan) return this._nad_tbigint_bigintspan(i as BigIntSpan);
		if (i instanceof TBigint) return this._nad_tbigint_tbigint(i as TBigint);
		if (i instanceof TBox) return this._nad_tbigint_tbox(i as TBox);
		if (typeof i === 'number') return this._nad_tbigint_bigint(i as number);
		throw new TypeError(`TBigint.nad: no overload takes these arguments`);
	}

	/** MEOS: tbigint_out */
	out(): string {
		return F.tbigint_out(this.ptr);
	}

	/** MEOS: add_bigint_tbigint */
	radd(i: number): Temporal {
		return wrapTemporal(F.add_bigint_tbigint(i, this.ptr)) as Temporal;
	}

	/** MEOS: always_eq_bigint_tbigint */
	ralwaysEq(i: number): number {
		return F.always_eq_bigint_tbigint(i, this.ptr);
	}

	/** MEOS: always_ge_bigint_tbigint */
	ralwaysGe(i: number): number {
		return F.always_ge_bigint_tbigint(i, this.ptr);
	}

	/** MEOS: always_gt_bigint_tbigint */
	ralwaysGt(i: number): number {
		return F.always_gt_bigint_tbigint(i, this.ptr);
	}

	/** MEOS: always_le_bigint_tbigint */
	ralwaysLe(i: number): number {
		return F.always_le_bigint_tbigint(i, this.ptr);
	}

	/** MEOS: always_lt_bigint_tbigint */
	ralwaysLt(i: number): number {
		return F.always_lt_bigint_tbigint(i, this.ptr);
	}

	/** MEOS: always_ne_bigint_tbigint */
	ralwaysNe(i: number): number {
		return F.always_ne_bigint_tbigint(i, this.ptr);
	}

	/** MEOS: div_bigint_tbigint */
	rdiv(i: number): Temporal {
		return wrapTemporal(F.div_bigint_tbigint(i, this.ptr)) as Temporal;
	}

	/** MEOS: ever_eq_bigint_tbigint */
	reverEq(i: number): number {
		return F.ever_eq_bigint_tbigint(i, this.ptr);
	}

	/** MEOS: ever_ge_bigint_tbigint */
	reverGe(i: number): number {
		return F.ever_ge_bigint_tbigint(i, this.ptr);
	}

	/** MEOS: ever_gt_bigint_tbigint */
	reverGt(i: number): number {
		return F.ever_gt_bigint_tbigint(i, this.ptr);
	}

	/** MEOS: ever_le_bigint_tbigint */
	reverLe(i: number): number {
		return F.ever_le_bigint_tbigint(i, this.ptr);
	}

	/** MEOS: ever_lt_bigint_tbigint */
	reverLt(i: number): number {
		return F.ever_lt_bigint_tbigint(i, this.ptr);
	}

	/** MEOS: ever_ne_bigint_tbigint */
	reverNe(i: number): number {
		return F.ever_ne_bigint_tbigint(i, this.ptr);
	}

	/** MEOS: mul_bigint_tbigint */
	rmul(i: number): Temporal {
		return wrapTemporal(F.mul_bigint_tbigint(i, this.ptr)) as Temporal;
	}

	/** MEOS: sub_bigint_tbigint */
	rsub(i: number): Temporal {
		return wrapTemporal(F.sub_bigint_tbigint(i, this.ptr)) as Temporal;
	}

	/** MEOS: teq_bigint_tbigint */
	rteq(i: number): Temporal {
		return wrapTemporal(F.teq_bigint_tbigint(i, this.ptr)) as Temporal;
	}

	/** MEOS: tge_bigint_tbigint */
	rtge(i: number): Temporal {
		return wrapTemporal(F.tge_bigint_tbigint(i, this.ptr)) as Temporal;
	}

	/** MEOS: tgt_bigint_tbigint */
	rtgt(i: number): Temporal {
		return wrapTemporal(F.tgt_bigint_tbigint(i, this.ptr)) as Temporal;
	}

	/** MEOS: tle_bigint_tbigint */
	rtle(i: number): Temporal {
		return wrapTemporal(F.tle_bigint_tbigint(i, this.ptr)) as Temporal;
	}

	/** MEOS: tlt_bigint_tbigint */
	rtlt(i: number): Temporal {
		return wrapTemporal(F.tlt_bigint_tbigint(i, this.ptr)) as Temporal;
	}

	/** MEOS: tne_bigint_tbigint */
	rtne(i: number): Temporal {
		return wrapTemporal(F.tne_bigint_tbigint(i, this.ptr)) as Temporal;
	}

	/** MEOS: tbigint_scale_value */
	scaleValue(width: number): Temporal {
		return wrapTemporal(F.tbigint_scale_value(this.ptr, width)) as Temporal;
	}

	/** MEOS: tbigint_shift_scale_value */
	shiftScaleValue(shift: number, width: number): Temporal {
		return wrapTemporal(F.tbigint_shift_scale_value(this.ptr, shift, width)) as Temporal;
	}

	/** MEOS: tbigint_shift_value */
	shiftValue(shift: number): Temporal {
		return wrapTemporal(F.tbigint_shift_value(this.ptr, shift)) as Temporal;
	}

	/** MEOS: tbigint_start_value */
	startValue(): number {
		return F.tbigint_start_value(this.ptr);
	}

	/** MEOS: sub_tbigint_bigint, chosen by the arguments' types */
	override sub(i: number | TNumber): Temporal | null {
		if (typeof i === 'number') return this._sub_tbigint_bigint(i as number);
		return super.sub(i as TNumber);
	}

	/** MEOS: teq_tbigint_bigint, chosen by the arguments' types */
	override teq(i: number | Temporal): Temporal | null {
		if (typeof i === 'number') return this._teq_tbigint_bigint(i as number);
		return super.teq(i as Temporal);
	}

	/** MEOS: tge_tbigint_bigint, chosen by the arguments' types */
	override tge(i: number | Temporal): Temporal | null {
		if (typeof i === 'number') return this._tge_tbigint_bigint(i as number);
		return super.tge(i as Temporal);
	}

	/** MEOS: tgt_tbigint_bigint, chosen by the arguments' types */
	override tgt(i: number | Temporal): Temporal | null {
		if (typeof i === 'number') return this._tgt_tbigint_bigint(i as number);
		return super.tgt(i as Temporal);
	}

	/** MEOS: tbigint_time_boxes */
	timeBoxes(duration: Interval, torigin: TimestampTz, border_inc: boolean): TBox[] {
		const _duration = _putInterval(duration);
		const _count = _alloc(4);
		try {
			const _arr = F.tbigint_time_boxes(this.ptr, _duration, torigin, border_inc, _count);
			if (!_arr) return [];
			try {
				const _n = _view(_count, 4).getInt32(0, true);
				const _v = _view(_arr, _n * 56);
				const _out: TBox[] = [];
				for (let _i = 0; _i < _n; _i++) _out.push(wrapTBox(_copy(_arr + _i * 56, 56)) as TBox);
				return _out;
			} finally {
				_free(_arr);
			}
		} finally {
			_free(_duration);
			_free(_count);
		}
	}

	/** MEOS: tle_tbigint_bigint, chosen by the arguments' types */
	override tle(i: number | Temporal): Temporal | null {
		if (typeof i === 'number') return this._tle_tbigint_bigint(i as number);
		return super.tle(i as Temporal);
	}

	/** MEOS: tlt_tbigint_bigint, chosen by the arguments' types */
	override tlt(i: number | Temporal): Temporal | null {
		if (typeof i === 'number') return this._tlt_tbigint_bigint(i as number);
		return super.tlt(i as Temporal);
	}

	/** MEOS: tne_tbigint_bigint, chosen by the arguments' types */
	override tne(i: number | Temporal): Temporal | null {
		if (typeof i === 'number') return this._tne_tbigint_bigint(i as number);
		return super.tne(i as Temporal);
	}

	/** MEOS: tbigint_to_tfloat */
	toTfloat(): Temporal {
		return wrapTemporal(F.tbigint_to_tfloat(this.ptr)) as Temporal;
	}

	/** MEOS: tbigint_to_th3index */
	toTh3index(): Temporal {
		return wrapTemporal(F.tbigint_to_th3index(this.ptr)) as Temporal;
	}

	/** MEOS: tbigint_to_tint */
	toTint(): Temporal {
		return wrapTemporal(F.tbigint_to_tint(this.ptr)) as Temporal;
	}

	/** MEOS: tbigint_to_tquadbin */
	toTquadbin(): Temporal {
		return wrapTemporal(F.tbigint_to_tquadbin(this.ptr)) as Temporal;
	}

	/** MEOS: tbigint_to_ts2cell */
	toTs2cell(): Temporal {
		return wrapTemporal(F.tbigint_to_ts2cell(this.ptr)) as Temporal;
	}

	/** MEOS: tbigint_value */
	value(): number {
		return F.tbigint_value(this.ptr);
	}

	/** MEOS: tbigint_value_at_timestamptz */
	valueAtTimestamptz(t: TimestampTz, strict: boolean): number | null {
		const _value = _alloc(8);
		try {
			if (!F.tbigint_value_at_timestamptz(this.ptr, t, strict, _value)) return null;
			return ((_v: DataView) => Number(_v.getBigInt64(0, true)))(_view(_value, 8));
		} finally {
			_free(_value);
		}
	}

	/** MEOS: tbigint_value_bins */
	valueBins(vsize: number, vorigin: number, border_inc: boolean): Span[] {
		const _count = _alloc(4);
		try {
			const _arr = F.tbigint_value_bins(this.ptr, vsize, vorigin, border_inc, _count);
			if (!_arr) return [];
			try {
				const _n = _view(_count, 4).getInt32(0, true);
				const _v = _view(_arr, _n * 24);
				const _out: Span[] = [];
				for (let _i = 0; _i < _n; _i++) _out.push(wrapSpan(_copy(_arr + _i * 24, 24)) as Span);
				return _out;
			} finally {
				_free(_arr);
			}
		} finally {
			_free(_count);
		}
	}

	/** MEOS: tbigint_value_boxes */
	valueBoxes(vsize: number, vorigin: number, border_inc: boolean): TBox[] {
		const _count = _alloc(4);
		try {
			const _arr = F.tbigint_value_boxes(this.ptr, vsize, vorigin, border_inc, _count);
			if (!_arr) return [];
			try {
				const _n = _view(_count, 4).getInt32(0, true);
				const _v = _view(_arr, _n * 56);
				const _out: TBox[] = [];
				for (let _i = 0; _i < _n; _i++) _out.push(wrapTBox(_copy(_arr + _i * 56, 56)) as TBox);
				return _out;
			} finally {
				_free(_arr);
			}
		} finally {
			_free(_count);
		}
	}

	/** MEOS: tbigint_value_n */
	valueN(n: number): number {
		return F.tbigint_value_n(this.ptr, n);
	}

	/** MEOS: tbigint_values */
	values(): number[] {
		const _count = _alloc(4);
		try {
			const _arr = F.tbigint_values(this.ptr, _count);
			if (!_arr) return [];
			try {
				const _n = _view(_count, 4).getInt32(0, true);
				const _v = _view(_arr, _n * 8);
				const _out: number[] = [];
				for (let _i = 0; _i < _n; _i++) _out.push(Number(_v.getBigInt64(_i * 8, true)));
				return _out;
			} finally {
				_free(_arr);
			}
		} finally {
			_free(_count);
		}
	}

	/** MEOS: tbigint_value_time_boxes */
	valueTimeBoxes(vsize: number, duration: Interval, vorigin: number, torigin: TimestampTz, border_inc: boolean): TBox[] {
		const _duration = _putInterval(duration);
		const _count = _alloc(4);
		try {
			const _arr = F.tbigint_value_time_boxes(this.ptr, vsize, _duration, vorigin, torigin, border_inc, _count);
			if (!_arr) return [];
			try {
				const _n = _view(_count, 4).getInt32(0, true);
				const _v = _view(_arr, _n * 56);
				const _out: TBox[] = [];
				for (let _i = 0; _i < _n; _i++) _out.push(wrapTBox(_copy(_arr + _i * 56, 56)) as TBox);
				return _out;
			} finally {
				_free(_arr);
			}
		} finally {
			_free(_duration);
			_free(_count);
		}
	}

	/** MEOS: tbigint_from_base_temp */
	static fromBaseTemp(i: number, temp: Temporal): TBigint {
		return wrapTemporal(F.tbigint_from_base_temp(i, temp.ptr)) as TBigint;
	}

	/** MEOS: tbigint_from_mfjson */
	static fromMFJSON(str: string): TBigint {
		return wrapTemporal(F.tbigint_from_mfjson(str)) as TBigint;
	}

	/** MEOS: tbigint_in */
	static fromText(str: string): TBigint {
		return TBigint.in(str);
	}

	/** MEOS: tbigint_in */
	static in(str: string): TBigint {
		return wrapTemporal(F.tbigint_in(str)) as TBigint;
	}
}

/**
 * A TBigint of subtype TInstant.
 */
export class TBigintInst extends TBigint {

	/** MEOS: tbigintinst_make */
	static make(i: number, t: TimestampTz): TBigintInst {
		return wrapTemporal(F.tbigintinst_make(i, t)) as TBigintInst;
	}
}

/**
 * A TBigint of subtype TSequence.
 */
export class TBigintSeq extends TBigint {

	/** MEOS: tbigintseq_from_base_tstzset */
	static fromBaseTstzset(i: number, s: Set): TBigintSeq {
		return wrapTemporal(F.tbigintseq_from_base_tstzset(i, s.ptr)) as TBigintSeq;
	}

	/** MEOS: tbigintseq_from_base_tstzspan */
	static fromBaseTstzspan(i: number, s: Span): TBigintSeq {
		return wrapTemporal(F.tbigintseq_from_base_tstzspan(i, s.ptr)) as TBigintSeq;
	}
}

/**
 * A TBigint of subtype TSequenceSet.
 */
export class TBigintSeqSet extends TBigint {

	/** MEOS: tbigintseqset_from_base_tstzspanset */
	static fromBaseTstzspanset(i: number, ss: SpanSet): TBigintSeqSet {
		return wrapTemporal(F.tbigintseqset_from_base_tstzspanset(i, ss.ptr)) as TBigintSeqSet;
	}
}

/**
 * The TBool class of the MEOS object model.
 */
export class TBool extends TAlpha {

	/** The text MEOS writes this value as (MEOS: tbool_out). */
	override toString(): string {
		return this.out();
	}

	/** MEOS: always_eq_tbool_bool */
	private _always_eq_tbool_bool(b: boolean): number {
		return F.always_eq_tbool_bool(this.ptr, b);
	}

	/** MEOS: always_ne_tbool_bool */
	private _always_ne_tbool_bool(b: boolean): number {
		return F.always_ne_tbool_bool(this.ptr, b);
	}

	/** MEOS: ever_eq_tbool_bool */
	private _ever_eq_tbool_bool(b: boolean): number {
		return F.ever_eq_tbool_bool(this.ptr, b);
	}

	/** MEOS: ever_ne_tbool_bool */
	private _ever_ne_tbool_bool(b: boolean): number {
		return F.ever_ne_tbool_bool(this.ptr, b);
	}

	/** MEOS: tand_tbool_bool */
	private _tand_tbool_bool(b: boolean): Temporal {
		return wrapTemporal(F.tand_tbool_bool(this.ptr, b)) as Temporal;
	}

	/** MEOS: tand_tbool_tbool */
	private _tand_tbool_tbool(temp2: TBool): Temporal | null {
		return wrapTemporalOrNull(F.tand_tbool_tbool(this.ptr, temp2.ptr)) as Temporal | null;
	}

	/** MEOS: teq_tbool_bool */
	private _teq_tbool_bool(b: boolean): Temporal {
		return wrapTemporal(F.teq_tbool_bool(this.ptr, b)) as Temporal;
	}

	/** MEOS: tne_tbool_bool */
	private _tne_tbool_bool(b: boolean): Temporal {
		return wrapTemporal(F.tne_tbool_bool(this.ptr, b)) as Temporal;
	}

	/** MEOS: tor_tbool_bool */
	private _tor_tbool_bool(b: boolean): Temporal {
		return wrapTemporal(F.tor_tbool_bool(this.ptr, b)) as Temporal;
	}

	/** MEOS: tor_tbool_tbool */
	private _tor_tbool_tbool(temp2: TBool): Temporal | null {
		return wrapTemporalOrNull(F.tor_tbool_tbool(this.ptr, temp2.ptr)) as Temporal | null;
	}

	/** MEOS: always_eq_tbool_bool, chosen by the arguments' types */
	override alwaysEq(b: boolean | Temporal): number {
		if (typeof b === 'boolean') return this._always_eq_tbool_bool(b as boolean);
		return super.alwaysEq(b as Temporal);
	}

	/** MEOS: always_ne_tbool_bool, chosen by the arguments' types */
	override alwaysNe(b: boolean | Temporal): number {
		if (typeof b === 'boolean') return this._always_ne_tbool_bool(b as boolean);
		return super.alwaysNe(b as Temporal);
	}

	/** MEOS: tbool_out */
	asText(): string {
		return this.out();
	}

	/** MEOS: tbool_at_value */
	atValue(b: boolean): Temporal | null {
		return wrapTemporalOrNull(F.tbool_at_value(this.ptr, b)) as Temporal | null;
	}

	/** MEOS: tbool_end_value */
	endValue(): boolean {
		return F.tbool_end_value(this.ptr);
	}

	/** MEOS: ever_eq_tbool_bool, chosen by the arguments' types */
	override everEq(b: boolean | Temporal): number {
		if (typeof b === 'boolean') return this._ever_eq_tbool_bool(b as boolean);
		return super.everEq(b as Temporal);
	}

	/** MEOS: ever_ne_tbool_bool, chosen by the arguments' types */
	override everNe(b: boolean | Temporal): number {
		if (typeof b === 'boolean') return this._ever_ne_tbool_bool(b as boolean);
		return super.everNe(b as Temporal);
	}

	/** MEOS: tbool_minus_value */
	minusValue(b: boolean): Temporal | null {
		return wrapTemporalOrNull(F.tbool_minus_value(this.ptr, b)) as Temporal | null;
	}

	/** MEOS: tbool_out */
	out(): string {
		return F.tbool_out(this.ptr);
	}

	/** MEOS: always_eq_bool_tbool */
	ralwaysEq(b: boolean): number {
		return F.always_eq_bool_tbool(b, this.ptr);
	}

	/** MEOS: always_ne_bool_tbool */
	ralwaysNe(b: boolean): number {
		return F.always_ne_bool_tbool(b, this.ptr);
	}

	/** MEOS: ever_eq_bool_tbool */
	reverEq(b: boolean): number {
		return F.ever_eq_bool_tbool(b, this.ptr);
	}

	/** MEOS: ever_ne_bool_tbool */
	reverNe(b: boolean): number {
		return F.ever_ne_bool_tbool(b, this.ptr);
	}

	/** MEOS: tand_bool_tbool */
	rtand(b: boolean): Temporal {
		return wrapTemporal(F.tand_bool_tbool(b, this.ptr)) as Temporal;
	}

	/** MEOS: teq_bool_tbool */
	rteq(b: boolean): Temporal {
		return wrapTemporal(F.teq_bool_tbool(b, this.ptr)) as Temporal;
	}

	/** MEOS: tne_bool_tbool */
	rtne(b: boolean): Temporal {
		return wrapTemporal(F.tne_bool_tbool(b, this.ptr)) as Temporal;
	}

	/** MEOS: tor_bool_tbool */
	rtor(b: boolean): Temporal {
		return wrapTemporal(F.tor_bool_tbool(b, this.ptr)) as Temporal;
	}

	/** MEOS: tbool_start_value */
	startValue(): boolean {
		return F.tbool_start_value(this.ptr);
	}

	/** MEOS: tand_tbool_bool, tand_tbool_tbool, chosen by the arguments' types */
	tand(b: boolean | TBool): Temporal | null {
		if (b instanceof TBool) return this._tand_tbool_tbool(b as TBool);
		if (typeof b === 'boolean') return this._tand_tbool_bool(b as boolean);
		throw new TypeError(`TBool.tand: no overload takes these arguments`);
	}

	/** MEOS: teq_tbool_bool, chosen by the arguments' types */
	override teq(b: boolean | Temporal): Temporal | null {
		if (typeof b === 'boolean') return this._teq_tbool_bool(b as boolean);
		return super.teq(b as Temporal);
	}

	/** MEOS: tne_tbool_bool, chosen by the arguments' types */
	override tne(b: boolean | Temporal): Temporal | null {
		if (typeof b === 'boolean') return this._tne_tbool_bool(b as boolean);
		return super.tne(b as Temporal);
	}

	/** MEOS: tnot_tbool */
	tnot(): Temporal {
		return wrapTemporal(F.tnot_tbool(this.ptr)) as Temporal;
	}

	/** MEOS: tor_tbool_bool, tor_tbool_tbool, chosen by the arguments' types */
	tor(b: boolean | TBool): Temporal | null {
		if (b instanceof TBool) return this._tor_tbool_tbool(b as TBool);
		if (typeof b === 'boolean') return this._tor_tbool_bool(b as boolean);
		throw new TypeError(`TBool.tor: no overload takes these arguments`);
	}

	/** MEOS: tbool_to_tint */
	toTint(): Temporal {
		return wrapTemporal(F.tbool_to_tint(this.ptr)) as Temporal;
	}

	/** MEOS: tbool_value */
	value(): boolean {
		return F.tbool_value(this.ptr);
	}

	/** MEOS: tbool_value_at_timestamptz */
	valueAtTimestamptz(t: TimestampTz, strict: boolean): boolean | null {
		const _value = _alloc(1);
		try {
			if (!F.tbool_value_at_timestamptz(this.ptr, t, strict, _value)) return null;
			return ((_v: DataView) => _v.getUint8(0) !== 0)(_view(_value, 1));
		} finally {
			_free(_value);
		}
	}

	/** MEOS: tbool_value_n */
	valueN(n: number): boolean {
		return F.tbool_value_n(this.ptr, n);
	}

	/** MEOS: tbool_values */
	values(): boolean[] {
		const _count = _alloc(4);
		try {
			const _arr = F.tbool_values(this.ptr, _count);
			if (!_arr) return [];
			try {
				const _n = _view(_count, 4).getInt32(0, true);
				const _v = _view(_arr, _n * 1);
				const _out: boolean[] = [];
				for (let _i = 0; _i < _n; _i++) _out.push(_v.getUint8(_i * 1) !== 0);
				return _out;
			} finally {
				_free(_arr);
			}
		} finally {
			_free(_count);
		}
	}

	/** MEOS: tbool_when_true */
	whenTrue(): SpanSet | null {
		return wrapSpanSetOrNull(F.tbool_when_true(this.ptr)) as SpanSet | null;
	}

	/** MEOS: tbool_from_base_temp */
	static fromBaseTemp(b: boolean, temp: Temporal): TBool {
		return wrapTemporal(F.tbool_from_base_temp(b, temp.ptr)) as TBool;
	}

	/** MEOS: tbool_from_mfjson */
	static fromMFJSON(str: string): TBool {
		return wrapTemporal(F.tbool_from_mfjson(str)) as TBool;
	}

	/** MEOS: tbool_in */
	static fromText(str: string): TBool {
		return TBool.in(str);
	}

	/** MEOS: tbool_in */
	static in(str: string): TBool {
		return wrapTemporal(F.tbool_in(str)) as TBool;
	}
}

/**
 * A TBool of subtype TInstant.
 */
export class TBoolInst extends TBool {

	/** MEOS: tboolinst_make */
	static make(b: boolean, t: TimestampTz): TBoolInst {
		return wrapTemporal(F.tboolinst_make(b, t)) as TBoolInst;
	}
}

/**
 * A TBool of subtype TSequence.
 */
export class TBoolSeq extends TBool {

	/** MEOS: tboolseq_from_base_tstzset */
	static fromBaseTstzset(b: boolean, s: Set): TBoolSeq {
		return wrapTemporal(F.tboolseq_from_base_tstzset(b, s.ptr)) as TBoolSeq;
	}

	/** MEOS: tboolseq_from_base_tstzspan */
	static fromBaseTstzspan(b: boolean, s: Span): TBoolSeq {
		return wrapTemporal(F.tboolseq_from_base_tstzspan(b, s.ptr)) as TBoolSeq;
	}
}

/**
 * A TBool of subtype TSequenceSet.
 */
export class TBoolSeqSet extends TBool {

	/** MEOS: tboolseqset_from_base_tstzspanset */
	static fromBaseTstzspanset(b: boolean, ss: SpanSet): TBoolSeqSet {
		return wrapTemporal(F.tboolseqset_from_base_tstzspanset(b, ss.ptr)) as TBoolSeqSet;
	}
}

/**
 * Numeric x time box (bbox of TNumber).
 */
export class TBox extends Box {

	/** The text MEOS writes this value as (MEOS: tbox_out). */
	override toString(): string {
		return this.out(15);
	}

	/** MEOS: adjacent_tbox_numspan */
	private _adjacent_tbox_numspan(s: Span): boolean {
		return F.adjacent_tbox_numspan(this.ptr, s.ptr);
	}

	/** MEOS: adjacent_tbox_tbox */
	private _adjacent_tbox_tbox(box2: TBox): boolean {
		return F.adjacent_tbox_tbox(this.ptr, box2.ptr);
	}

	/** MEOS: adjacent_tbox_tnumber */
	private _adjacent_tbox_tnumber(temp: TNumber): boolean {
		return F.adjacent_tbox_tnumber(this.ptr, temp.ptr);
	}

	/** MEOS: adjacent_tbox_tstzspan */
	private _adjacent_tbox_tstzspan(s: TsTzSpan): boolean {
		return F.adjacent_tbox_tstzspan(this.ptr, s.ptr);
	}

	/** MEOS: after_tbox_tbox */
	private _after_tbox_tbox(box2: TBox): boolean {
		return F.after_tbox_tbox(this.ptr, box2.ptr);
	}

	/** MEOS: after_tbox_tnumber */
	private _after_tbox_tnumber(temp: TNumber): boolean {
		return F.after_tbox_tnumber(this.ptr, temp.ptr);
	}

	/** MEOS: after_tbox_tstzspan */
	private _after_tbox_tstzspan(s: TsTzSpan): boolean {
		return F.after_tbox_tstzspan(this.ptr, s.ptr);
	}

	/** MEOS: before_tbox_tbox */
	private _before_tbox_tbox(box2: TBox): boolean {
		return F.before_tbox_tbox(this.ptr, box2.ptr);
	}

	/** MEOS: before_tbox_tnumber */
	private _before_tbox_tnumber(temp: TNumber): boolean {
		return F.before_tbox_tnumber(this.ptr, temp.ptr);
	}

	/** MEOS: before_tbox_tstzspan */
	private _before_tbox_tstzspan(s: TsTzSpan): boolean {
		return F.before_tbox_tstzspan(this.ptr, s.ptr);
	}

	/** MEOS: contained_tbox_numspan */
	private _contained_tbox_numspan(s: Span): boolean {
		return F.contained_tbox_numspan(this.ptr, s.ptr);
	}

	/** MEOS: contained_tbox_tbox */
	private _contained_tbox_tbox(box2: TBox): boolean {
		return F.contained_tbox_tbox(this.ptr, box2.ptr);
	}

	/** MEOS: contained_tbox_tnumber */
	private _contained_tbox_tnumber(temp: TNumber): boolean {
		return F.contained_tbox_tnumber(this.ptr, temp.ptr);
	}

	/** MEOS: contained_tbox_tstzspan */
	private _contained_tbox_tstzspan(s: TsTzSpan): boolean {
		return F.contained_tbox_tstzspan(this.ptr, s.ptr);
	}

	/** MEOS: contains_tbox_numspan */
	private _contains_tbox_numspan(s: Span): boolean {
		return F.contains_tbox_numspan(this.ptr, s.ptr);
	}

	/** MEOS: contains_tbox_tbox */
	private _contains_tbox_tbox(box2: TBox): boolean {
		return F.contains_tbox_tbox(this.ptr, box2.ptr);
	}

	/** MEOS: contains_tbox_tnumber */
	private _contains_tbox_tnumber(temp: TNumber): boolean {
		return F.contains_tbox_tnumber(this.ptr, temp.ptr);
	}

	/** MEOS: contains_tbox_tstzspan */
	private _contains_tbox_tstzspan(s: TsTzSpan): boolean {
		return F.contains_tbox_tstzspan(this.ptr, s.ptr);
	}

	/** MEOS: left_tbox_numspan */
	private _left_tbox_numspan(s: Span): boolean {
		return F.left_tbox_numspan(this.ptr, s.ptr);
	}

	/** MEOS: left_tbox_tbox */
	private _left_tbox_tbox(box2: TBox): boolean {
		return F.left_tbox_tbox(this.ptr, box2.ptr);
	}

	/** MEOS: left_tbox_tnumber */
	private _left_tbox_tnumber(temp: TNumber): boolean {
		return F.left_tbox_tnumber(this.ptr, temp.ptr);
	}

	/** MEOS: overafter_tbox_tbox */
	private _overafter_tbox_tbox(box2: TBox): boolean {
		return F.overafter_tbox_tbox(this.ptr, box2.ptr);
	}

	/** MEOS: overafter_tbox_tnumber */
	private _overafter_tbox_tnumber(temp: TNumber): boolean {
		return F.overafter_tbox_tnumber(this.ptr, temp.ptr);
	}

	/** MEOS: overafter_tbox_tstzspan */
	private _overafter_tbox_tstzspan(s: TsTzSpan): boolean {
		return F.overafter_tbox_tstzspan(this.ptr, s.ptr);
	}

	/** MEOS: overbefore_tbox_tbox */
	private _overbefore_tbox_tbox(box2: TBox): boolean {
		return F.overbefore_tbox_tbox(this.ptr, box2.ptr);
	}

	/** MEOS: overbefore_tbox_tnumber */
	private _overbefore_tbox_tnumber(temp: TNumber): boolean {
		return F.overbefore_tbox_tnumber(this.ptr, temp.ptr);
	}

	/** MEOS: overbefore_tbox_tstzspan */
	private _overbefore_tbox_tstzspan(s: TsTzSpan): boolean {
		return F.overbefore_tbox_tstzspan(this.ptr, s.ptr);
	}

	/** MEOS: overlaps_tbox_numspan */
	private _overlaps_tbox_numspan(s: Span): boolean {
		return F.overlaps_tbox_numspan(this.ptr, s.ptr);
	}

	/** MEOS: overlaps_tbox_tbox */
	private _overlaps_tbox_tbox(box2: TBox): boolean {
		return F.overlaps_tbox_tbox(this.ptr, box2.ptr);
	}

	/** MEOS: overlaps_tbox_tnumber */
	private _overlaps_tbox_tnumber(temp: TNumber): boolean {
		return F.overlaps_tbox_tnumber(this.ptr, temp.ptr);
	}

	/** MEOS: overlaps_tbox_tstzspan */
	private _overlaps_tbox_tstzspan(s: TsTzSpan): boolean {
		return F.overlaps_tbox_tstzspan(this.ptr, s.ptr);
	}

	/** MEOS: overleft_tbox_numspan */
	private _overleft_tbox_numspan(s: Span): boolean {
		return F.overleft_tbox_numspan(this.ptr, s.ptr);
	}

	/** MEOS: overleft_tbox_tbox */
	private _overleft_tbox_tbox(box2: TBox): boolean {
		return F.overleft_tbox_tbox(this.ptr, box2.ptr);
	}

	/** MEOS: overleft_tbox_tnumber */
	private _overleft_tbox_tnumber(temp: TNumber): boolean {
		return F.overleft_tbox_tnumber(this.ptr, temp.ptr);
	}

	/** MEOS: overright_tbox_numspan */
	private _overright_tbox_numspan(s: Span): boolean {
		return F.overright_tbox_numspan(this.ptr, s.ptr);
	}

	/** MEOS: overright_tbox_tbox */
	private _overright_tbox_tbox(box2: TBox): boolean {
		return F.overright_tbox_tbox(this.ptr, box2.ptr);
	}

	/** MEOS: overright_tbox_tnumber */
	private _overright_tbox_tnumber(temp: TNumber): boolean {
		return F.overright_tbox_tnumber(this.ptr, temp.ptr);
	}

	/** MEOS: right_tbox_numspan */
	private _right_tbox_numspan(s: Span): boolean {
		return F.right_tbox_numspan(this.ptr, s.ptr);
	}

	/** MEOS: right_tbox_tbox */
	private _right_tbox_tbox(box2: TBox): boolean {
		return F.right_tbox_tbox(this.ptr, box2.ptr);
	}

	/** MEOS: right_tbox_tnumber */
	private _right_tbox_tnumber(temp: TNumber): boolean {
		return F.right_tbox_tnumber(this.ptr, temp.ptr);
	}

	/** MEOS: same_tbox_numspan */
	private _same_tbox_numspan(s: Span): boolean {
		return F.same_tbox_numspan(this.ptr, s.ptr);
	}

	/** MEOS: same_tbox_tbox */
	private _same_tbox_tbox(box2: TBox): boolean {
		return F.same_tbox_tbox(this.ptr, box2.ptr);
	}

	/** MEOS: same_tbox_tnumber */
	private _same_tbox_tnumber(temp: TNumber): boolean {
		return F.same_tbox_tnumber(this.ptr, temp.ptr);
	}

	/** MEOS: same_tbox_tstzspan */
	private _same_tbox_tstzspan(s: TsTzSpan): boolean {
		return F.same_tbox_tstzspan(this.ptr, s.ptr);
	}

	/** MEOS: adjacent_tbox_tbox, adjacent_tbox_numspan, adjacent_tbox_tstzspan, adjacent_tbox_tnumber, chosen by the arguments' types */
	adjacent(box2: TBox | Span | TsTzSpan | TNumber): boolean {
		if (box2 instanceof TsTzSpan) return this._adjacent_tbox_tstzspan(box2 as TsTzSpan);
		if (box2 instanceof TBox) return this._adjacent_tbox_tbox(box2 as TBox);
		if (box2 instanceof Span) return this._adjacent_tbox_numspan(box2 as Span);
		if (box2 instanceof TNumber) return this._adjacent_tbox_tnumber(box2 as TNumber);
		throw new TypeError(`TBox.adjacent: no overload takes these arguments`);
	}

	/** MEOS: after_tbox_tbox, after_tbox_tstzspan, after_tbox_tnumber, chosen by the arguments' types */
	after(box2: TBox | TsTzSpan | TNumber): boolean {
		if (box2 instanceof TsTzSpan) return this._after_tbox_tstzspan(box2 as TsTzSpan);
		if (box2 instanceof TBox) return this._after_tbox_tbox(box2 as TBox);
		if (box2 instanceof TNumber) return this._after_tbox_tnumber(box2 as TNumber);
		throw new TypeError(`TBox.after: no overload takes these arguments`);
	}

	/** MEOS: tbox_as_hexwkb */
	asHexWKB(variant: number): string {
		return F.tbox_as_hexwkb(this.ptr, variant);
	}

	/** MEOS: tbox_out */
	asText(maxdd: number): string {
		return this.out(maxdd);
	}

	/** MEOS: tbox_as_wkb */
	asWKB(variant: number): Uint8Array {
		return readWkb(_sizeOut => F.tbox_as_wkb(this.ptr, variant, _sizeOut));
	}

	/** MEOS: before_tbox_tbox, before_tbox_tstzspan, before_tbox_tnumber, chosen by the arguments' types */
	before(box2: TBox | TsTzSpan | TNumber): boolean {
		if (box2 instanceof TsTzSpan) return this._before_tbox_tstzspan(box2 as TsTzSpan);
		if (box2 instanceof TBox) return this._before_tbox_tbox(box2 as TBox);
		if (box2 instanceof TNumber) return this._before_tbox_tnumber(box2 as TNumber);
		throw new TypeError(`TBox.before: no overload takes these arguments`);
	}

	/** MEOS: tbox_cmp */
	cmp(box2: TBox): number {
		return F.tbox_cmp(this.ptr, box2.ptr);
	}

	/** MEOS: contained_tbox_tbox, contained_tbox_numspan, contained_tbox_tstzspan, contained_tbox_tnumber, chosen by the arguments' types */
	contained(box2: TBox | Span | TsTzSpan | TNumber): boolean {
		if (box2 instanceof TsTzSpan) return this._contained_tbox_tstzspan(box2 as TsTzSpan);
		if (box2 instanceof TBox) return this._contained_tbox_tbox(box2 as TBox);
		if (box2 instanceof Span) return this._contained_tbox_numspan(box2 as Span);
		if (box2 instanceof TNumber) return this._contained_tbox_tnumber(box2 as TNumber);
		throw new TypeError(`TBox.contained: no overload takes these arguments`);
	}

	/** MEOS: contains_tbox_tbox, contains_tbox_numspan, contains_tbox_tstzspan, contains_tbox_tnumber, chosen by the arguments' types */
	contains(box2: TBox | Span | TsTzSpan | TNumber): boolean {
		if (box2 instanceof TsTzSpan) return this._contains_tbox_tstzspan(box2 as TsTzSpan);
		if (box2 instanceof TBox) return this._contains_tbox_tbox(box2 as TBox);
		if (box2 instanceof Span) return this._contains_tbox_numspan(box2 as Span);
		if (box2 instanceof TNumber) return this._contains_tbox_tnumber(box2 as TNumber);
		throw new TypeError(`TBox.contains: no overload takes these arguments`);
	}

	/** MEOS: tbox_copy */
	copy(): TBox {
		return wrapTBox(F.tbox_copy(this.ptr)) as TBox;
	}

	/** MEOS: tbox_eq */
	eq(box2: TBox): boolean {
		return F.tbox_eq(this.ptr, box2.ptr);
	}

	/** MEOS: tbox_expand_time */
	expandTime(interv: Interval): TBox | null {
		const _interv = _putInterval(interv);
		try {
			return wrapTBoxOrNull(F.tbox_expand_time(this.ptr, _interv)) as TBox | null;
		} finally {
			_free(_interv);
		}
	}

	/** MEOS: tbox_ge */
	ge(box2: TBox): boolean {
		return F.tbox_ge(this.ptr, box2.ptr);
	}

	/** MEOS: tbox_gt */
	gt(box2: TBox): boolean {
		return F.tbox_gt(this.ptr, box2.ptr);
	}

	/** MEOS: tbox_hash */
	hash(): number {
		return F.tbox_hash(this.ptr);
	}

	/** MEOS: tbox_hash_extended */
	hashExtended(seed: number): number {
		return F.tbox_hash_extended(this.ptr, seed);
	}

	/** MEOS: tbox_hast */
	hast(): boolean {
		return F.tbox_hast(this.ptr);
	}

	/** MEOS: tbox_hasx */
	hasx(): boolean {
		return F.tbox_hasx(this.ptr);
	}

	/** MEOS: intersection_tbox_tbox */
	intersection(box2: TBox): TBox | null {
		return wrapTBoxOrNull(F.intersection_tbox_tbox(this.ptr, box2.ptr)) as TBox | null;
	}

	/** MEOS: tbox_le */
	le(box2: TBox): boolean {
		return F.tbox_le(this.ptr, box2.ptr);
	}

	/** MEOS: left_tbox_tbox, left_tbox_numspan, left_tbox_tnumber, chosen by the arguments' types */
	left(box2: TBox | Span | TNumber): boolean {
		if (box2 instanceof TBox) return this._left_tbox_tbox(box2 as TBox);
		if (box2 instanceof Span) return this._left_tbox_numspan(box2 as Span);
		if (box2 instanceof TNumber) return this._left_tbox_tnumber(box2 as TNumber);
		throw new TypeError(`TBox.left: no overload takes these arguments`);
	}

	/** MEOS: tbox_lt */
	lt(box2: TBox): boolean {
		return F.tbox_lt(this.ptr, box2.ptr);
	}

	/** MEOS: tbox_ne */
	ne(box2: TBox): boolean {
		return F.tbox_ne(this.ptr, box2.ptr);
	}

	/** MEOS: tbox_out */
	out(maxdd: number): string {
		return F.tbox_out(this.ptr, maxdd);
	}

	/** MEOS: overafter_tbox_tbox, overafter_tbox_tstzspan, overafter_tbox_tnumber, chosen by the arguments' types */
	overafter(box2: TBox | TsTzSpan | TNumber): boolean {
		if (box2 instanceof TsTzSpan) return this._overafter_tbox_tstzspan(box2 as TsTzSpan);
		if (box2 instanceof TBox) return this._overafter_tbox_tbox(box2 as TBox);
		if (box2 instanceof TNumber) return this._overafter_tbox_tnumber(box2 as TNumber);
		throw new TypeError(`TBox.overafter: no overload takes these arguments`);
	}

	/** MEOS: overbefore_tbox_tbox, overbefore_tbox_tstzspan, overbefore_tbox_tnumber, chosen by the arguments' types */
	overbefore(box2: TBox | TsTzSpan | TNumber): boolean {
		if (box2 instanceof TsTzSpan) return this._overbefore_tbox_tstzspan(box2 as TsTzSpan);
		if (box2 instanceof TBox) return this._overbefore_tbox_tbox(box2 as TBox);
		if (box2 instanceof TNumber) return this._overbefore_tbox_tnumber(box2 as TNumber);
		throw new TypeError(`TBox.overbefore: no overload takes these arguments`);
	}

	/** MEOS: overlaps_tbox_tbox, overlaps_tbox_numspan, overlaps_tbox_tstzspan, overlaps_tbox_tnumber, chosen by the arguments' types */
	overlaps(box2: TBox | Span | TsTzSpan | TNumber): boolean {
		if (box2 instanceof TsTzSpan) return this._overlaps_tbox_tstzspan(box2 as TsTzSpan);
		if (box2 instanceof TBox) return this._overlaps_tbox_tbox(box2 as TBox);
		if (box2 instanceof Span) return this._overlaps_tbox_numspan(box2 as Span);
		if (box2 instanceof TNumber) return this._overlaps_tbox_tnumber(box2 as TNumber);
		throw new TypeError(`TBox.overlaps: no overload takes these arguments`);
	}

	/** MEOS: overleft_tbox_tbox, overleft_tbox_numspan, overleft_tbox_tnumber, chosen by the arguments' types */
	overleft(box2: TBox | Span | TNumber): boolean {
		if (box2 instanceof TBox) return this._overleft_tbox_tbox(box2 as TBox);
		if (box2 instanceof Span) return this._overleft_tbox_numspan(box2 as Span);
		if (box2 instanceof TNumber) return this._overleft_tbox_tnumber(box2 as TNumber);
		throw new TypeError(`TBox.overleft: no overload takes these arguments`);
	}

	/** MEOS: overright_tbox_tbox, overright_tbox_numspan, overright_tbox_tnumber, chosen by the arguments' types */
	overright(box2: TBox | Span | TNumber): boolean {
		if (box2 instanceof TBox) return this._overright_tbox_tbox(box2 as TBox);
		if (box2 instanceof Span) return this._overright_tbox_numspan(box2 as Span);
		if (box2 instanceof TNumber) return this._overright_tbox_tnumber(box2 as TNumber);
		throw new TypeError(`TBox.overright: no overload takes these arguments`);
	}

	/** MEOS: right_tbox_tbox, right_tbox_numspan, right_tbox_tnumber, chosen by the arguments' types */
	right(box2: TBox | Span | TNumber): boolean {
		if (box2 instanceof TBox) return this._right_tbox_tbox(box2 as TBox);
		if (box2 instanceof Span) return this._right_tbox_numspan(box2 as Span);
		if (box2 instanceof TNumber) return this._right_tbox_tnumber(box2 as TNumber);
		throw new TypeError(`TBox.right: no overload takes these arguments`);
	}

	/** MEOS: tbox_round */
	round(maxdd: number): TBox {
		return wrapTBox(F.tbox_round(this.ptr, maxdd)) as TBox;
	}

	/** MEOS: same_tbox_tbox, same_tbox_numspan, same_tbox_tstzspan, same_tbox_tnumber, chosen by the arguments' types */
	same(box2: TBox | Span | TsTzSpan | TNumber): boolean {
		if (box2 instanceof TsTzSpan) return this._same_tbox_tstzspan(box2 as TsTzSpan);
		if (box2 instanceof TBox) return this._same_tbox_tbox(box2 as TBox);
		if (box2 instanceof Span) return this._same_tbox_numspan(box2 as Span);
		if (box2 instanceof TNumber) return this._same_tbox_tnumber(box2 as TNumber);
		throw new TypeError(`TBox.same: no overload takes these arguments`);
	}

	/** MEOS: tbox_scale_time */
	scaleTime(duration: Interval): TBox {
		const _duration = _putInterval(duration);
		try {
			return wrapTBox(F.tbox_scale_time(this.ptr, _duration)) as TBox;
		} finally {
			_free(_duration);
		}
	}

	/** MEOS: tbox_shift_scale_time */
	shiftScaleTime(shift: Interval, duration: Interval): TBox {
		const _shift = _putInterval(shift);
		const _duration = _putInterval(duration);
		try {
			return wrapTBox(F.tbox_shift_scale_time(this.ptr, _shift, _duration)) as TBox;
		} finally {
			_free(_shift);
			_free(_duration);
		}
	}

	/** MEOS: tbox_shift_time */
	shiftTime(shift: Interval): TBox {
		const _shift = _putInterval(shift);
		try {
			return wrapTBox(F.tbox_shift_time(this.ptr, _shift)) as TBox;
		} finally {
			_free(_shift);
		}
	}

	/** MEOS: tbox_sortkey */
	sortkey(): Uint8Array {
		return readWkb(_sizeOut => F.tbox_sortkey(this.ptr, _sizeOut));
	}

	/** MEOS: tbox_time_tiles */
	timeTiles(duration: Interval, torigin: TimestampTz, border_inc: boolean): TBox[] {
		const _duration = _putInterval(duration);
		const _count = _alloc(4);
		try {
			const _arr = F.tbox_time_tiles(this.ptr, _duration, torigin, border_inc, _count);
			if (!_arr) return [];
			try {
				const _n = _view(_count, 4).getInt32(0, true);
				const _v = _view(_arr, _n * 56);
				const _out: TBox[] = [];
				for (let _i = 0; _i < _n; _i++) _out.push(wrapTBox(_copy(_arr + _i * 56, 56)) as TBox);
				return _out;
			} finally {
				_free(_arr);
			}
		} finally {
			_free(_duration);
			_free(_count);
		}
	}

	/** MEOS: tbox_tmax */
	tmax(): TimestampTz {
		return F.tbox_tmax(this.ptr);
	}

	/** MEOS: tbox_tmax_inc */
	tmaxInc(): boolean {
		return F.tbox_tmax_inc(this.ptr);
	}

	/** MEOS: tbox_tmin */
	tmin(): TimestampTz {
		return F.tbox_tmin(this.ptr);
	}

	/** MEOS: tbox_tmin_inc */
	tminInc(): boolean {
		return F.tbox_tmin_inc(this.ptr);
	}

	/** MEOS: tbox_to_bigintspan */
	toBigintspan(): Span {
		return wrapSpan(F.tbox_to_bigintspan(this.ptr)) as Span;
	}

	/** MEOS: tbox_to_floatspan */
	toFloatspan(): Span {
		return wrapSpan(F.tbox_to_floatspan(this.ptr)) as Span;
	}

	/** MEOS: tbox_to_intspan */
	toIntspan(): Span {
		return wrapSpan(F.tbox_to_intspan(this.ptr)) as Span;
	}

	/** MEOS: tbox_to_tstzspan */
	toTstzspan(): Span {
		return wrapSpan(F.tbox_to_tstzspan(this.ptr)) as Span;
	}

	/** MEOS: union_tbox_tbox */
	union(box2: TBox, strict: boolean): TBox {
		return wrapTBox(F.union_tbox_tbox(this.ptr, box2.ptr, strict)) as TBox;
	}

	/** MEOS: tbox_xmax */
	xmax(): number {
		return F.tbox_xmax(this.ptr);
	}

	/** MEOS: tbox_xmax_inc */
	xmaxInc(): boolean {
		return F.tbox_xmax_inc(this.ptr);
	}

	/** MEOS: tbox_xmin */
	xmin(): number {
		return F.tbox_xmin(this.ptr);
	}

	/** MEOS: tbox_xmin_inc */
	xminInc(): boolean {
		return F.tbox_xmin_inc(this.ptr);
	}

	/** MEOS: tbox_from_hexwkb */
	static fromHexWKB(hexwkb: string): TBox {
		return wrapTBox(F.tbox_from_hexwkb(hexwkb)) as TBox;
	}

	/** MEOS: tbox_in */
	static fromText(str: string): TBox {
		return TBox.in(str);
	}

	/** MEOS: tbox_from_wkb */
	static fromWKB(wkb: Uint8Array): TBox {
		const _wkb = _bytes(wkb);
		try {
			return wrapTBox(F.tbox_from_wkb(_wkb, wkb.length)) as TBox;
		} finally {
			_free(_wkb);
		}
	}

	/** MEOS: tbox_get_time_tile */
	static getTimeTile(t: TimestampTz, duration: Interval, torigin: TimestampTz): TBox {
		const _duration = _putInterval(duration);
		try {
			return wrapTBox(F.tbox_get_time_tile(t, _duration, torigin)) as TBox;
		} finally {
			_free(_duration);
		}
	}

	/** MEOS: tbox_get_value_tile */
	static getValueTile(value: number, vsize: number, vorigin: number): TBox {
		return wrapTBox(F.tbox_get_value_tile(value, vsize, vorigin)) as TBox;
	}

	/** MEOS: tbox_get_value_time_tile */
	static getValueTimeTile(value: number, t: TimestampTz, vsize: number, duration: Interval, vorigin: number, torigin: TimestampTz): TBox {
		const _duration = _putInterval(duration);
		try {
			return wrapTBox(F.tbox_get_value_time_tile(value, t, vsize, _duration, vorigin, torigin)) as TBox;
		} finally {
			_free(_duration);
		}
	}

	/** MEOS: tbox_in */
	static in(str: string): TBox {
		return wrapTBox(F.tbox_in(str)) as TBox;
	}

	/** MEOS: tbox_make */
	static make(s: Span, p: Span): TBox {
		return wrapTBox(F.tbox_make(s.ptr, p.ptr)) as TBox;
	}
}

/**
 * Temporal types carrying an STBox spatial bounding box.
 */
export class TSpatial extends Temporal {

	/** MEOS: above_tspatial_stbox */
	private _above_tspatial_stbox(box: STBox): boolean {
		return F.above_tspatial_stbox(this.ptr, box.ptr);
	}

	/** MEOS: above_tspatial_tspatial */
	private _above_tspatial_tspatial(temp2: TSpatial): boolean {
		return F.above_tspatial_tspatial(this.ptr, temp2.ptr);
	}

	/** MEOS: adjacent_tspatial_stbox */
	private _adjacent_tspatial_stbox(box: STBox): boolean {
		return F.adjacent_tspatial_stbox(this.ptr, box.ptr);
	}

	/** MEOS: adjacent_tspatial_tspatial */
	private _adjacent_tspatial_tspatial(temp2: TSpatial): boolean {
		return F.adjacent_tspatial_tspatial(this.ptr, temp2.ptr);
	}

	/** MEOS: after_tspatial_stbox */
	private _after_tspatial_stbox(box: STBox): boolean {
		return F.after_tspatial_stbox(this.ptr, box.ptr);
	}

	/** MEOS: after_tspatial_tspatial */
	private _after_tspatial_tspatial(temp2: TSpatial): boolean {
		return F.after_tspatial_tspatial(this.ptr, temp2.ptr);
	}

	/** MEOS: back_tspatial_stbox */
	private _back_tspatial_stbox(box: STBox): boolean {
		return F.back_tspatial_stbox(this.ptr, box.ptr);
	}

	/** MEOS: back_tspatial_tspatial */
	private _back_tspatial_tspatial(temp2: TSpatial): boolean {
		return F.back_tspatial_tspatial(this.ptr, temp2.ptr);
	}

	/** MEOS: before_tspatial_stbox */
	private _before_tspatial_stbox(box: STBox): boolean {
		return F.before_tspatial_stbox(this.ptr, box.ptr);
	}

	/** MEOS: before_tspatial_tspatial */
	private _before_tspatial_tspatial(temp2: TSpatial): boolean {
		return F.before_tspatial_tspatial(this.ptr, temp2.ptr);
	}

	/** MEOS: below_tspatial_stbox */
	private _below_tspatial_stbox(box: STBox): boolean {
		return F.below_tspatial_stbox(this.ptr, box.ptr);
	}

	/** MEOS: below_tspatial_tspatial */
	private _below_tspatial_tspatial(temp2: TSpatial): boolean {
		return F.below_tspatial_tspatial(this.ptr, temp2.ptr);
	}

	/** MEOS: contained_tspatial_stbox */
	private _contained_tspatial_stbox(box: STBox): boolean {
		return F.contained_tspatial_stbox(this.ptr, box.ptr);
	}

	/** MEOS: contained_tspatial_tspatial */
	private _contained_tspatial_tspatial(temp2: TSpatial): boolean {
		return F.contained_tspatial_tspatial(this.ptr, temp2.ptr);
	}

	/** MEOS: contains_tspatial_stbox */
	private _contains_tspatial_stbox(box: STBox): boolean {
		return F.contains_tspatial_stbox(this.ptr, box.ptr);
	}

	/** MEOS: contains_tspatial_tspatial */
	private _contains_tspatial_tspatial(temp2: TSpatial): boolean {
		return F.contains_tspatial_tspatial(this.ptr, temp2.ptr);
	}

	/** MEOS: front_tspatial_stbox */
	private _front_tspatial_stbox(box: STBox): boolean {
		return F.front_tspatial_stbox(this.ptr, box.ptr);
	}

	/** MEOS: front_tspatial_tspatial */
	private _front_tspatial_tspatial(temp2: TSpatial): boolean {
		return F.front_tspatial_tspatial(this.ptr, temp2.ptr);
	}

	/** MEOS: left_tspatial_stbox */
	private _left_tspatial_stbox(box: STBox): boolean {
		return F.left_tspatial_stbox(this.ptr, box.ptr);
	}

	/** MEOS: left_tspatial_tspatial */
	private _left_tspatial_tspatial(temp2: TSpatial): boolean {
		return F.left_tspatial_tspatial(this.ptr, temp2.ptr);
	}

	/** MEOS: overabove_tspatial_stbox */
	private _overabove_tspatial_stbox(box: STBox): boolean {
		return F.overabove_tspatial_stbox(this.ptr, box.ptr);
	}

	/** MEOS: overabove_tspatial_tspatial */
	private _overabove_tspatial_tspatial(temp2: TSpatial): boolean {
		return F.overabove_tspatial_tspatial(this.ptr, temp2.ptr);
	}

	/** MEOS: overafter_tspatial_stbox */
	private _overafter_tspatial_stbox(box: STBox): boolean {
		return F.overafter_tspatial_stbox(this.ptr, box.ptr);
	}

	/** MEOS: overafter_tspatial_tspatial */
	private _overafter_tspatial_tspatial(temp2: TSpatial): boolean {
		return F.overafter_tspatial_tspatial(this.ptr, temp2.ptr);
	}

	/** MEOS: overback_tspatial_stbox */
	private _overback_tspatial_stbox(box: STBox): boolean {
		return F.overback_tspatial_stbox(this.ptr, box.ptr);
	}

	/** MEOS: overback_tspatial_tspatial */
	private _overback_tspatial_tspatial(temp2: TSpatial): boolean {
		return F.overback_tspatial_tspatial(this.ptr, temp2.ptr);
	}

	/** MEOS: overbefore_tspatial_stbox */
	private _overbefore_tspatial_stbox(box: STBox): boolean {
		return F.overbefore_tspatial_stbox(this.ptr, box.ptr);
	}

	/** MEOS: overbefore_tspatial_tspatial */
	private _overbefore_tspatial_tspatial(temp2: TSpatial): boolean {
		return F.overbefore_tspatial_tspatial(this.ptr, temp2.ptr);
	}

	/** MEOS: overbelow_tspatial_stbox */
	private _overbelow_tspatial_stbox(box: STBox): boolean {
		return F.overbelow_tspatial_stbox(this.ptr, box.ptr);
	}

	/** MEOS: overbelow_tspatial_tspatial */
	private _overbelow_tspatial_tspatial(temp2: TSpatial): boolean {
		return F.overbelow_tspatial_tspatial(this.ptr, temp2.ptr);
	}

	/** MEOS: overfront_tspatial_stbox */
	private _overfront_tspatial_stbox(box: STBox): boolean {
		return F.overfront_tspatial_stbox(this.ptr, box.ptr);
	}

	/** MEOS: overfront_tspatial_tspatial */
	private _overfront_tspatial_tspatial(temp2: TSpatial): boolean {
		return F.overfront_tspatial_tspatial(this.ptr, temp2.ptr);
	}

	/** MEOS: overlaps_tspatial_stbox */
	private _overlaps_tspatial_stbox(box: STBox): boolean {
		return F.overlaps_tspatial_stbox(this.ptr, box.ptr);
	}

	/** MEOS: overlaps_tspatial_tspatial */
	private _overlaps_tspatial_tspatial(temp2: TSpatial): boolean {
		return F.overlaps_tspatial_tspatial(this.ptr, temp2.ptr);
	}

	/** MEOS: overleft_tspatial_stbox */
	private _overleft_tspatial_stbox(box: STBox): boolean {
		return F.overleft_tspatial_stbox(this.ptr, box.ptr);
	}

	/** MEOS: overleft_tspatial_tspatial */
	private _overleft_tspatial_tspatial(temp2: TSpatial): boolean {
		return F.overleft_tspatial_tspatial(this.ptr, temp2.ptr);
	}

	/** MEOS: overright_tspatial_stbox */
	private _overright_tspatial_stbox(box: STBox): boolean {
		return F.overright_tspatial_stbox(this.ptr, box.ptr);
	}

	/** MEOS: overright_tspatial_tspatial */
	private _overright_tspatial_tspatial(temp2: TSpatial): boolean {
		return F.overright_tspatial_tspatial(this.ptr, temp2.ptr);
	}

	/** MEOS: right_tspatial_stbox */
	private _right_tspatial_stbox(box: STBox): boolean {
		return F.right_tspatial_stbox(this.ptr, box.ptr);
	}

	/** MEOS: right_tspatial_tspatial */
	private _right_tspatial_tspatial(temp2: TSpatial): boolean {
		return F.right_tspatial_tspatial(this.ptr, temp2.ptr);
	}

	/** MEOS: same_tspatial_stbox */
	private _same_tspatial_stbox(box: STBox): boolean {
		return F.same_tspatial_stbox(this.ptr, box.ptr);
	}

	/** MEOS: same_tspatial_tspatial */
	private _same_tspatial_tspatial(temp2: TSpatial): boolean {
		return F.same_tspatial_tspatial(this.ptr, temp2.ptr);
	}

	/** MEOS: above_tspatial_stbox, above_tspatial_tspatial, chosen by the arguments' types */
	above(box: STBox | TSpatial): boolean {
		if (box instanceof STBox) return this._above_tspatial_stbox(box as STBox);
		if (box instanceof TSpatial) return this._above_tspatial_tspatial(box as TSpatial);
		throw new TypeError(`TSpatial.above: no overload takes these arguments`);
	}

	/** MEOS: adjacent_tspatial_stbox, adjacent_tspatial_tspatial, chosen by the arguments' types */
	override adjacent(box: STBox | TSpatial | TsTzSpan): boolean {
		if (box instanceof STBox) return this._adjacent_tspatial_stbox(box as STBox);
		if (box instanceof TSpatial) return this._adjacent_tspatial_tspatial(box as TSpatial);
		return super.adjacent(box as TsTzSpan);
	}

	/** MEOS: after_tspatial_stbox, after_tspatial_tspatial, chosen by the arguments' types */
	override after(box: STBox | TSpatial | TsTzSpan): boolean {
		if (box instanceof STBox) return this._after_tspatial_stbox(box as STBox);
		if (box instanceof TSpatial) return this._after_tspatial_tspatial(box as TSpatial);
		return super.after(box as TsTzSpan);
	}

	/** MEOS: tspatial_as_ewkb */
	asEWKB(variant: number): Uint8Array {
		return readWkb(_sizeOut => F.tspatial_as_ewkb(this.ptr, variant, _sizeOut));
	}

	/** MEOS: tspatial_as_ewkt */
	asEWKT(maxdd: number): string {
		return F.tspatial_as_ewkt(this.ptr, maxdd);
	}

	/** MEOS: tspatial_as_hexewkb */
	asHexEWKB(variant: number): string {
		return F.tspatial_as_hexewkb(this.ptr, variant);
	}

	/** MEOS: tspatial_as_text */
	asText(maxdd: number): string {
		return F.tspatial_as_text(this.ptr, maxdd);
	}

	/** MEOS: back_tspatial_stbox, back_tspatial_tspatial, chosen by the arguments' types */
	back(box: STBox | TSpatial): boolean {
		if (box instanceof STBox) return this._back_tspatial_stbox(box as STBox);
		if (box instanceof TSpatial) return this._back_tspatial_tspatial(box as TSpatial);
		throw new TypeError(`TSpatial.back: no overload takes these arguments`);
	}

	/** MEOS: before_tspatial_stbox, before_tspatial_tspatial, chosen by the arguments' types */
	override before(box: STBox | TSpatial | TsTzSpan): boolean {
		if (box instanceof STBox) return this._before_tspatial_stbox(box as STBox);
		if (box instanceof TSpatial) return this._before_tspatial_tspatial(box as TSpatial);
		return super.before(box as TsTzSpan);
	}

	/** MEOS: below_tspatial_stbox, below_tspatial_tspatial, chosen by the arguments' types */
	below(box: STBox | TSpatial): boolean {
		if (box instanceof STBox) return this._below_tspatial_stbox(box as STBox);
		if (box instanceof TSpatial) return this._below_tspatial_tspatial(box as TSpatial);
		throw new TypeError(`TSpatial.below: no overload takes these arguments`);
	}

	/** MEOS: contained_tspatial_stbox, contained_tspatial_tspatial, chosen by the arguments' types */
	override contained(box: STBox | TSpatial | TsTzSpan): boolean {
		if (box instanceof STBox) return this._contained_tspatial_stbox(box as STBox);
		if (box instanceof TSpatial) return this._contained_tspatial_tspatial(box as TSpatial);
		return super.contained(box as TsTzSpan);
	}

	/** MEOS: contains_tspatial_stbox, contains_tspatial_tspatial, chosen by the arguments' types */
	override contains(box: STBox | TSpatial | TsTzSpan): boolean {
		if (box instanceof STBox) return this._contains_tspatial_stbox(box as STBox);
		if (box instanceof TSpatial) return this._contains_tspatial_tspatial(box as TSpatial);
		return super.contains(box as TsTzSpan);
	}

	/** MEOS: front_tspatial_stbox, front_tspatial_tspatial, chosen by the arguments' types */
	front(box: STBox | TSpatial): boolean {
		if (box instanceof STBox) return this._front_tspatial_stbox(box as STBox);
		if (box instanceof TSpatial) return this._front_tspatial_tspatial(box as TSpatial);
		throw new TypeError(`TSpatial.front: no overload takes these arguments`);
	}

	/** MEOS: left_tspatial_stbox, left_tspatial_tspatial, chosen by the arguments' types */
	left(box: STBox | TSpatial): boolean {
		if (box instanceof STBox) return this._left_tspatial_stbox(box as STBox);
		if (box instanceof TSpatial) return this._left_tspatial_tspatial(box as TSpatial);
		throw new TypeError(`TSpatial.left: no overload takes these arguments`);
	}

	/** MEOS: tspatial_out */
	out(maxdd: number): string {
		return F.tspatial_out(this.ptr, maxdd);
	}

	/** MEOS: overabove_tspatial_stbox, overabove_tspatial_tspatial, chosen by the arguments' types */
	overabove(box: STBox | TSpatial): boolean {
		if (box instanceof STBox) return this._overabove_tspatial_stbox(box as STBox);
		if (box instanceof TSpatial) return this._overabove_tspatial_tspatial(box as TSpatial);
		throw new TypeError(`TSpatial.overabove: no overload takes these arguments`);
	}

	/** MEOS: overafter_tspatial_stbox, overafter_tspatial_tspatial, chosen by the arguments' types */
	override overafter(box: STBox | TSpatial | TsTzSpan): boolean {
		if (box instanceof STBox) return this._overafter_tspatial_stbox(box as STBox);
		if (box instanceof TSpatial) return this._overafter_tspatial_tspatial(box as TSpatial);
		return super.overafter(box as TsTzSpan);
	}

	/** MEOS: overback_tspatial_stbox, overback_tspatial_tspatial, chosen by the arguments' types */
	overback(box: STBox | TSpatial): boolean {
		if (box instanceof STBox) return this._overback_tspatial_stbox(box as STBox);
		if (box instanceof TSpatial) return this._overback_tspatial_tspatial(box as TSpatial);
		throw new TypeError(`TSpatial.overback: no overload takes these arguments`);
	}

	/** MEOS: overbefore_tspatial_stbox, overbefore_tspatial_tspatial, chosen by the arguments' types */
	override overbefore(box: STBox | TSpatial | TsTzSpan): boolean {
		if (box instanceof STBox) return this._overbefore_tspatial_stbox(box as STBox);
		if (box instanceof TSpatial) return this._overbefore_tspatial_tspatial(box as TSpatial);
		return super.overbefore(box as TsTzSpan);
	}

	/** MEOS: overbelow_tspatial_stbox, overbelow_tspatial_tspatial, chosen by the arguments' types */
	overbelow(box: STBox | TSpatial): boolean {
		if (box instanceof STBox) return this._overbelow_tspatial_stbox(box as STBox);
		if (box instanceof TSpatial) return this._overbelow_tspatial_tspatial(box as TSpatial);
		throw new TypeError(`TSpatial.overbelow: no overload takes these arguments`);
	}

	/** MEOS: overfront_tspatial_stbox, overfront_tspatial_tspatial, chosen by the arguments' types */
	overfront(box: STBox | TSpatial): boolean {
		if (box instanceof STBox) return this._overfront_tspatial_stbox(box as STBox);
		if (box instanceof TSpatial) return this._overfront_tspatial_tspatial(box as TSpatial);
		throw new TypeError(`TSpatial.overfront: no overload takes these arguments`);
	}

	/** MEOS: overlaps_tspatial_stbox, overlaps_tspatial_tspatial, chosen by the arguments' types */
	override overlaps(box: STBox | TSpatial | TsTzSpan): boolean {
		if (box instanceof STBox) return this._overlaps_tspatial_stbox(box as STBox);
		if (box instanceof TSpatial) return this._overlaps_tspatial_tspatial(box as TSpatial);
		return super.overlaps(box as TsTzSpan);
	}

	/** MEOS: overleft_tspatial_stbox, overleft_tspatial_tspatial, chosen by the arguments' types */
	overleft(box: STBox | TSpatial): boolean {
		if (box instanceof STBox) return this._overleft_tspatial_stbox(box as STBox);
		if (box instanceof TSpatial) return this._overleft_tspatial_tspatial(box as TSpatial);
		throw new TypeError(`TSpatial.overleft: no overload takes these arguments`);
	}

	/** MEOS: overright_tspatial_stbox, overright_tspatial_tspatial, chosen by the arguments' types */
	overright(box: STBox | TSpatial): boolean {
		if (box instanceof STBox) return this._overright_tspatial_stbox(box as STBox);
		if (box instanceof TSpatial) return this._overright_tspatial_tspatial(box as TSpatial);
		throw new TypeError(`TSpatial.overright: no overload takes these arguments`);
	}

	/** MEOS: right_tspatial_stbox, right_tspatial_tspatial, chosen by the arguments' types */
	right(box: STBox | TSpatial): boolean {
		if (box instanceof STBox) return this._right_tspatial_stbox(box as STBox);
		if (box instanceof TSpatial) return this._right_tspatial_tspatial(box as TSpatial);
		throw new TypeError(`TSpatial.right: no overload takes these arguments`);
	}

	/** MEOS: same_tspatial_stbox, same_tspatial_tspatial, chosen by the arguments' types */
	override same(box: STBox | TSpatial | TsTzSpan): boolean {
		if (box instanceof STBox) return this._same_tspatial_stbox(box as STBox);
		if (box instanceof TSpatial) return this._same_tspatial_tspatial(box as TSpatial);
		return super.same(box as TsTzSpan);
	}

	/** MEOS: tspatial_set_srid */
	setSRID(srid: number): Temporal {
		return wrapTemporal(F.tspatial_set_srid(this.ptr, srid)) as Temporal;
	}

	/** MEOS: tspatial_srid */
	SRID(): number {
		return F.tspatial_srid(this.ptr);
	}

	/** MEOS: tspatial_to_stbox */
	toStbox(): STBox {
		return wrapSTBox(F.tspatial_to_stbox(this.ptr)) as STBox;
	}

	/** MEOS: tspatial_transform */
	transform(srid: number): Temporal {
		return wrapTemporal(F.tspatial_transform(this.ptr, srid)) as Temporal;
	}

	/** MEOS: tspatial_transform_pipeline */
	transformPipeline(pipelinestr: string, srid: number, is_forward: boolean): Temporal {
		return wrapTemporal(F.tspatial_transform_pipeline(this.ptr, pipelinestr, srid, is_forward)) as Temporal;
	}
}

/**
 * The TCbuffer class of the MEOS object model.
 */
export class TCbuffer extends TSpatial {

	/** The text MEOS writes this value as (MEOS: tspatial_as_text). */
	override toString(): string {
		return this.asText(15);
	}

	/** MEOS: acontains_tcbuffer_cbuffer */
	private _acontains_tcbuffer_cbuffer(cb: Cbuffer): number {
		return F.acontains_tcbuffer_cbuffer(this.ptr, cb.ptr);
	}

	/** MEOS: acontains_tcbuffer_geo */
	private _acontains_tcbuffer_geo(gs: Geometry): number {
		return F.acontains_tcbuffer_geo(this.ptr, gs.ptr);
	}

	/** MEOS: acontains_tcbuffer_tcbuffer */
	private _acontains_tcbuffer_tcbuffer(temp2: TCbuffer): number {
		return F.acontains_tcbuffer_tcbuffer(this.ptr, temp2.ptr);
	}

	/** MEOS: acovers_tcbuffer_cbuffer */
	private _acovers_tcbuffer_cbuffer(cb: Cbuffer): number {
		return F.acovers_tcbuffer_cbuffer(this.ptr, cb.ptr);
	}

	/** MEOS: acovers_tcbuffer_geo */
	private _acovers_tcbuffer_geo(gs: Geometry): number {
		return F.acovers_tcbuffer_geo(this.ptr, gs.ptr);
	}

	/** MEOS: acovers_tcbuffer_tcbuffer */
	private _acovers_tcbuffer_tcbuffer(temp2: TCbuffer): number {
		return F.acovers_tcbuffer_tcbuffer(this.ptr, temp2.ptr);
	}

	/** MEOS: adisjoint_tcbuffer_cbuffer */
	private _adisjoint_tcbuffer_cbuffer(cb: Cbuffer): number {
		return F.adisjoint_tcbuffer_cbuffer(this.ptr, cb.ptr);
	}

	/** MEOS: adisjoint_tcbuffer_geo */
	private _adisjoint_tcbuffer_geo(gs: Geometry): number {
		return F.adisjoint_tcbuffer_geo(this.ptr, gs.ptr);
	}

	/** MEOS: adisjoint_tcbuffer_tcbuffer */
	private _adisjoint_tcbuffer_tcbuffer(temp2: TCbuffer): number {
		return F.adisjoint_tcbuffer_tcbuffer(this.ptr, temp2.ptr);
	}

	/** MEOS: adwithin_tcbuffer_cbuffer */
	private _adwithin_tcbuffer_cbuffer(cb: Cbuffer, dist: number): number {
		return F.adwithin_tcbuffer_cbuffer(this.ptr, cb.ptr, dist);
	}

	/** MEOS: adwithin_tcbuffer_geo */
	private _adwithin_tcbuffer_geo(gs: Geometry, dist: number): number {
		return F.adwithin_tcbuffer_geo(this.ptr, gs.ptr, dist);
	}

	/** MEOS: adwithin_tcbuffer_tcbuffer */
	private _adwithin_tcbuffer_tcbuffer(temp2: TCbuffer, dist: number): number {
		return F.adwithin_tcbuffer_tcbuffer(this.ptr, temp2.ptr, dist);
	}

	/** MEOS: aintersects_tcbuffer_cbuffer */
	private _aintersects_tcbuffer_cbuffer(cb: Cbuffer): number {
		return F.aintersects_tcbuffer_cbuffer(this.ptr, cb.ptr);
	}

	/** MEOS: aintersects_tcbuffer_geo */
	private _aintersects_tcbuffer_geo(gs: Geometry): number {
		return F.aintersects_tcbuffer_geo(this.ptr, gs.ptr);
	}

	/** MEOS: aintersects_tcbuffer_tcbuffer */
	private _aintersects_tcbuffer_tcbuffer(temp2: TCbuffer): number {
		return F.aintersects_tcbuffer_tcbuffer(this.ptr, temp2.ptr);
	}

	/** MEOS: always_eq_tcbuffer_cbuffer */
	private _always_eq_tcbuffer_cbuffer(cb: Cbuffer): number {
		return F.always_eq_tcbuffer_cbuffer(this.ptr, cb.ptr);
	}

	/** MEOS: always_eq_tcbuffer_tcbuffer */
	private _always_eq_tcbuffer_tcbuffer(temp2: TCbuffer): number {
		return F.always_eq_tcbuffer_tcbuffer(this.ptr, temp2.ptr);
	}

	/** MEOS: always_ne_tcbuffer_cbuffer */
	private _always_ne_tcbuffer_cbuffer(cb: Cbuffer): number {
		return F.always_ne_tcbuffer_cbuffer(this.ptr, cb.ptr);
	}

	/** MEOS: always_ne_tcbuffer_tcbuffer */
	private _always_ne_tcbuffer_tcbuffer(temp2: TCbuffer): number {
		return F.always_ne_tcbuffer_tcbuffer(this.ptr, temp2.ptr);
	}

	/** MEOS: atouches_tcbuffer_cbuffer */
	private _atouches_tcbuffer_cbuffer(cb: Cbuffer): number {
		return F.atouches_tcbuffer_cbuffer(this.ptr, cb.ptr);
	}

	/** MEOS: atouches_tcbuffer_geo */
	private _atouches_tcbuffer_geo(gs: Geometry): number {
		return F.atouches_tcbuffer_geo(this.ptr, gs.ptr);
	}

	/** MEOS: atouches_tcbuffer_tcbuffer */
	private _atouches_tcbuffer_tcbuffer(temp2: TCbuffer): number {
		return F.atouches_tcbuffer_tcbuffer(this.ptr, temp2.ptr);
	}

	/** MEOS: econtains_tcbuffer_cbuffer */
	private _econtains_tcbuffer_cbuffer(cb: Cbuffer): number {
		return F.econtains_tcbuffer_cbuffer(this.ptr, cb.ptr);
	}

	/** MEOS: econtains_tcbuffer_geo */
	private _econtains_tcbuffer_geo(gs: Geometry): number {
		return F.econtains_tcbuffer_geo(this.ptr, gs.ptr);
	}

	/** MEOS: econtains_tcbuffer_tcbuffer */
	private _econtains_tcbuffer_tcbuffer(temp2: TCbuffer): number {
		return F.econtains_tcbuffer_tcbuffer(this.ptr, temp2.ptr);
	}

	/** MEOS: ecovers_tcbuffer_cbuffer */
	private _ecovers_tcbuffer_cbuffer(cb: Cbuffer): number {
		return F.ecovers_tcbuffer_cbuffer(this.ptr, cb.ptr);
	}

	/** MEOS: ecovers_tcbuffer_geo */
	private _ecovers_tcbuffer_geo(gs: Geometry): number {
		return F.ecovers_tcbuffer_geo(this.ptr, gs.ptr);
	}

	/** MEOS: ecovers_tcbuffer_tcbuffer */
	private _ecovers_tcbuffer_tcbuffer(temp2: TCbuffer): number {
		return F.ecovers_tcbuffer_tcbuffer(this.ptr, temp2.ptr);
	}

	/** MEOS: edisjoint_tcbuffer_cbuffer */
	private _edisjoint_tcbuffer_cbuffer(cb: Cbuffer): number {
		return F.edisjoint_tcbuffer_cbuffer(this.ptr, cb.ptr);
	}

	/** MEOS: edisjoint_tcbuffer_geo */
	private _edisjoint_tcbuffer_geo(gs: Geometry): number {
		return F.edisjoint_tcbuffer_geo(this.ptr, gs.ptr);
	}

	/** MEOS: edisjoint_tcbuffer_tcbuffer */
	private _edisjoint_tcbuffer_tcbuffer(temp2: TCbuffer): number {
		return F.edisjoint_tcbuffer_tcbuffer(this.ptr, temp2.ptr);
	}

	/** MEOS: edwithin_tcbuffer_cbuffer */
	private _edwithin_tcbuffer_cbuffer(cb: Cbuffer, dist: number): number {
		return F.edwithin_tcbuffer_cbuffer(this.ptr, cb.ptr, dist);
	}

	/** MEOS: edwithin_tcbuffer_geo */
	private _edwithin_tcbuffer_geo(gs: Geometry, dist: number): number {
		return F.edwithin_tcbuffer_geo(this.ptr, gs.ptr, dist);
	}

	/** MEOS: edwithin_tcbuffer_tcbuffer */
	private _edwithin_tcbuffer_tcbuffer(temp2: TCbuffer, dist: number): number {
		return F.edwithin_tcbuffer_tcbuffer(this.ptr, temp2.ptr, dist);
	}

	/** MEOS: eintersects_tcbuffer_cbuffer */
	private _eintersects_tcbuffer_cbuffer(cb: Cbuffer): number {
		return F.eintersects_tcbuffer_cbuffer(this.ptr, cb.ptr);
	}

	/** MEOS: eintersects_tcbuffer_geo */
	private _eintersects_tcbuffer_geo(gs: Geometry): number {
		return F.eintersects_tcbuffer_geo(this.ptr, gs.ptr);
	}

	/** MEOS: eintersects_tcbuffer_tcbuffer */
	private _eintersects_tcbuffer_tcbuffer(temp2: TCbuffer): number {
		return F.eintersects_tcbuffer_tcbuffer(this.ptr, temp2.ptr);
	}

	/** MEOS: etouches_tcbuffer_cbuffer */
	private _etouches_tcbuffer_cbuffer(cb: Cbuffer): number {
		return F.etouches_tcbuffer_cbuffer(this.ptr, cb.ptr);
	}

	/** MEOS: etouches_tcbuffer_geo */
	private _etouches_tcbuffer_geo(gs: Geometry): number {
		return F.etouches_tcbuffer_geo(this.ptr, gs.ptr);
	}

	/** MEOS: etouches_tcbuffer_tcbuffer */
	private _etouches_tcbuffer_tcbuffer(temp2: TCbuffer): number {
		return F.etouches_tcbuffer_tcbuffer(this.ptr, temp2.ptr);
	}

	/** MEOS: ever_eq_tcbuffer_cbuffer */
	private _ever_eq_tcbuffer_cbuffer(cb: Cbuffer): number {
		return F.ever_eq_tcbuffer_cbuffer(this.ptr, cb.ptr);
	}

	/** MEOS: ever_eq_tcbuffer_tcbuffer */
	private _ever_eq_tcbuffer_tcbuffer(temp2: TCbuffer): number {
		return F.ever_eq_tcbuffer_tcbuffer(this.ptr, temp2.ptr);
	}

	/** MEOS: ever_ne_tcbuffer_cbuffer */
	private _ever_ne_tcbuffer_cbuffer(cb: Cbuffer): number {
		return F.ever_ne_tcbuffer_cbuffer(this.ptr, cb.ptr);
	}

	/** MEOS: ever_ne_tcbuffer_tcbuffer */
	private _ever_ne_tcbuffer_tcbuffer(temp2: TCbuffer): number {
		return F.ever_ne_tcbuffer_tcbuffer(this.ptr, temp2.ptr);
	}

	/** MEOS: nad_tcbuffer_cbuffer */
	private _nad_tcbuffer_cbuffer(cb: Cbuffer): number {
		return F.nad_tcbuffer_cbuffer(this.ptr, cb.ptr);
	}

	/** MEOS: nad_tcbuffer_geo */
	private _nad_tcbuffer_geo(gs: Geometry): number {
		return F.nad_tcbuffer_geo(this.ptr, gs.ptr);
	}

	/** MEOS: nad_tcbuffer_stbox */
	private _nad_tcbuffer_stbox(box: STBox): number {
		return F.nad_tcbuffer_stbox(this.ptr, box.ptr);
	}

	/** MEOS: nad_tcbuffer_tcbuffer */
	private _nad_tcbuffer_tcbuffer(temp2: TCbuffer): number {
		return F.nad_tcbuffer_tcbuffer(this.ptr, temp2.ptr);
	}

	/** MEOS: nai_tcbuffer_cbuffer */
	private _nai_tcbuffer_cbuffer(cb: Cbuffer): Temporal | null {
		return wrapTemporalOrNull(F.nai_tcbuffer_cbuffer(this.ptr, cb.ptr)) as Temporal | null;
	}

	/** MEOS: nai_tcbuffer_geo */
	private _nai_tcbuffer_geo(gs: Geometry): Temporal | null {
		return wrapTemporalOrNull(F.nai_tcbuffer_geo(this.ptr, gs.ptr)) as Temporal | null;
	}

	/** MEOS: nai_tcbuffer_tcbuffer */
	private _nai_tcbuffer_tcbuffer(temp2: TCbuffer): Temporal | null {
		return wrapTemporalOrNull(F.nai_tcbuffer_tcbuffer(this.ptr, temp2.ptr)) as Temporal | null;
	}

	/** MEOS: shortestline_tcbuffer_cbuffer */
	private _shortestline_tcbuffer_cbuffer(cb: Cbuffer): Geo | null {
		return wrapGeoOrNull(F.shortestline_tcbuffer_cbuffer(this.ptr, cb.ptr)) as Geo | null;
	}

	/** MEOS: shortestline_tcbuffer_geo */
	private _shortestline_tcbuffer_geo(gs: Geometry): Geo | null {
		return wrapGeoOrNull(F.shortestline_tcbuffer_geo(this.ptr, gs.ptr)) as Geo | null;
	}

	/** MEOS: shortestline_tcbuffer_tcbuffer */
	private _shortestline_tcbuffer_tcbuffer(temp2: TCbuffer): Geo | null {
		return wrapGeoOrNull(F.shortestline_tcbuffer_tcbuffer(this.ptr, temp2.ptr)) as Geo | null;
	}

	/** MEOS: tcontains_tcbuffer_cbuffer */
	private _tcontains_tcbuffer_cbuffer(cb: Cbuffer): Temporal | null {
		return wrapTemporalOrNull(F.tcontains_tcbuffer_cbuffer(this.ptr, cb.ptr)) as Temporal | null;
	}

	/** MEOS: tcontains_tcbuffer_geo */
	private _tcontains_tcbuffer_geo(gs: Geometry): Temporal | null {
		return wrapTemporalOrNull(F.tcontains_tcbuffer_geo(this.ptr, gs.ptr)) as Temporal | null;
	}

	/** MEOS: tcontains_tcbuffer_tcbuffer */
	private _tcontains_tcbuffer_tcbuffer(temp2: TCbuffer): Temporal | null {
		return wrapTemporalOrNull(F.tcontains_tcbuffer_tcbuffer(this.ptr, temp2.ptr)) as Temporal | null;
	}

	/** MEOS: tcovers_tcbuffer_cbuffer */
	private _tcovers_tcbuffer_cbuffer(cb: Cbuffer): Temporal | null {
		return wrapTemporalOrNull(F.tcovers_tcbuffer_cbuffer(this.ptr, cb.ptr)) as Temporal | null;
	}

	/** MEOS: tcovers_tcbuffer_geo */
	private _tcovers_tcbuffer_geo(gs: Geometry): Temporal | null {
		return wrapTemporalOrNull(F.tcovers_tcbuffer_geo(this.ptr, gs.ptr)) as Temporal | null;
	}

	/** MEOS: tcovers_tcbuffer_tcbuffer */
	private _tcovers_tcbuffer_tcbuffer(temp2: TCbuffer): Temporal | null {
		return wrapTemporalOrNull(F.tcovers_tcbuffer_tcbuffer(this.ptr, temp2.ptr)) as Temporal | null;
	}

	/** MEOS: tdisjoint_tcbuffer_cbuffer */
	private _tdisjoint_tcbuffer_cbuffer(cb: Cbuffer): Temporal | null {
		return wrapTemporalOrNull(F.tdisjoint_tcbuffer_cbuffer(this.ptr, cb.ptr)) as Temporal | null;
	}

	/** MEOS: tdisjoint_tcbuffer_geo */
	private _tdisjoint_tcbuffer_geo(gs: Geometry): Temporal | null {
		return wrapTemporalOrNull(F.tdisjoint_tcbuffer_geo(this.ptr, gs.ptr)) as Temporal | null;
	}

	/** MEOS: tdisjoint_tcbuffer_tcbuffer */
	private _tdisjoint_tcbuffer_tcbuffer(temp2: TCbuffer): Temporal | null {
		return wrapTemporalOrNull(F.tdisjoint_tcbuffer_tcbuffer(this.ptr, temp2.ptr)) as Temporal | null;
	}

	/** MEOS: tdistance_tcbuffer_cbuffer */
	private _tdistance_tcbuffer_cbuffer(cb: Cbuffer): Temporal | null {
		return wrapTemporalOrNull(F.tdistance_tcbuffer_cbuffer(this.ptr, cb.ptr)) as Temporal | null;
	}

	/** MEOS: tdistance_tcbuffer_geo */
	private _tdistance_tcbuffer_geo(gs: Geometry): Temporal | null {
		return wrapTemporalOrNull(F.tdistance_tcbuffer_geo(this.ptr, gs.ptr)) as Temporal | null;
	}

	/** MEOS: tdistance_tcbuffer_tcbuffer */
	private _tdistance_tcbuffer_tcbuffer(temp2: TCbuffer): Temporal | null {
		return wrapTemporalOrNull(F.tdistance_tcbuffer_tcbuffer(this.ptr, temp2.ptr)) as Temporal | null;
	}

	/** MEOS: tdwithin_tcbuffer_cbuffer */
	private _tdwithin_tcbuffer_cbuffer(cb: Cbuffer, dist: number): Temporal | null {
		return wrapTemporalOrNull(F.tdwithin_tcbuffer_cbuffer(this.ptr, cb.ptr, dist)) as Temporal | null;
	}

	/** MEOS: tdwithin_tcbuffer_geo */
	private _tdwithin_tcbuffer_geo(gs: Geometry, dist: number): Temporal | null {
		return wrapTemporalOrNull(F.tdwithin_tcbuffer_geo(this.ptr, gs.ptr, dist)) as Temporal | null;
	}

	/** MEOS: tdwithin_tcbuffer_tcbuffer */
	private _tdwithin_tcbuffer_tcbuffer(temp2: TCbuffer, dist: number): Temporal | null {
		return wrapTemporalOrNull(F.tdwithin_tcbuffer_tcbuffer(this.ptr, temp2.ptr, dist)) as Temporal | null;
	}

	/** MEOS: teq_tcbuffer_cbuffer */
	private _teq_tcbuffer_cbuffer(cb: Cbuffer): Temporal | null {
		return wrapTemporalOrNull(F.teq_tcbuffer_cbuffer(this.ptr, cb.ptr)) as Temporal | null;
	}

	/** MEOS: tintersects_tcbuffer_cbuffer */
	private _tintersects_tcbuffer_cbuffer(cb: Cbuffer): Temporal | null {
		return wrapTemporalOrNull(F.tintersects_tcbuffer_cbuffer(this.ptr, cb.ptr)) as Temporal | null;
	}

	/** MEOS: tintersects_tcbuffer_geo */
	private _tintersects_tcbuffer_geo(gs: Geometry): Temporal | null {
		return wrapTemporalOrNull(F.tintersects_tcbuffer_geo(this.ptr, gs.ptr)) as Temporal | null;
	}

	/** MEOS: tintersects_tcbuffer_tcbuffer */
	private _tintersects_tcbuffer_tcbuffer(temp2: TCbuffer): Temporal | null {
		return wrapTemporalOrNull(F.tintersects_tcbuffer_tcbuffer(this.ptr, temp2.ptr)) as Temporal | null;
	}

	/** MEOS: tne_tcbuffer_cbuffer */
	private _tne_tcbuffer_cbuffer(cb: Cbuffer): Temporal | null {
		return wrapTemporalOrNull(F.tne_tcbuffer_cbuffer(this.ptr, cb.ptr)) as Temporal | null;
	}

	/** MEOS: ttouches_tcbuffer_cbuffer */
	private _ttouches_tcbuffer_cbuffer(cb: Cbuffer): Temporal | null {
		return wrapTemporalOrNull(F.ttouches_tcbuffer_cbuffer(this.ptr, cb.ptr)) as Temporal | null;
	}

	/** MEOS: ttouches_tcbuffer_geo */
	private _ttouches_tcbuffer_geo(gs: Geometry): Temporal | null {
		return wrapTemporalOrNull(F.ttouches_tcbuffer_geo(this.ptr, gs.ptr)) as Temporal | null;
	}

	/** MEOS: ttouches_tcbuffer_tcbuffer */
	private _ttouches_tcbuffer_tcbuffer(temp2: TCbuffer): Temporal | null {
		return wrapTemporalOrNull(F.ttouches_tcbuffer_tcbuffer(this.ptr, temp2.ptr)) as Temporal | null;
	}

	/** MEOS: acontains_tcbuffer_cbuffer, acontains_tcbuffer_geo, acontains_tcbuffer_tcbuffer, chosen by the arguments' types */
	acontains(cb: Cbuffer | Geometry | TCbuffer): number {
		if (cb instanceof Geometry) return this._acontains_tcbuffer_geo(cb as Geometry);
		if (cb instanceof TCbuffer) return this._acontains_tcbuffer_tcbuffer(cb as TCbuffer);
		if (cb instanceof Cbuffer) return this._acontains_tcbuffer_cbuffer(cb as Cbuffer);
		throw new TypeError(`TCbuffer.acontains: no overload takes these arguments`);
	}

	/** MEOS: acovers_tcbuffer_cbuffer, acovers_tcbuffer_geo, acovers_tcbuffer_tcbuffer, chosen by the arguments' types */
	acovers(cb: Cbuffer | Geometry | TCbuffer): number {
		if (cb instanceof Geometry) return this._acovers_tcbuffer_geo(cb as Geometry);
		if (cb instanceof TCbuffer) return this._acovers_tcbuffer_tcbuffer(cb as TCbuffer);
		if (cb instanceof Cbuffer) return this._acovers_tcbuffer_cbuffer(cb as Cbuffer);
		throw new TypeError(`TCbuffer.acovers: no overload takes these arguments`);
	}

	/** MEOS: adisjoint_tcbuffer_geo, adisjoint_tcbuffer_cbuffer, adisjoint_tcbuffer_tcbuffer, chosen by the arguments' types */
	adisjoint(gs: Geometry | Cbuffer | TCbuffer): number {
		if (gs instanceof Geometry) return this._adisjoint_tcbuffer_geo(gs as Geometry);
		if (gs instanceof TCbuffer) return this._adisjoint_tcbuffer_tcbuffer(gs as TCbuffer);
		if (gs instanceof Cbuffer) return this._adisjoint_tcbuffer_cbuffer(gs as Cbuffer);
		throw new TypeError(`TCbuffer.adisjoint: no overload takes these arguments`);
	}

	/** MEOS: adwithin_tcbuffer_geo, adwithin_tcbuffer_cbuffer, adwithin_tcbuffer_tcbuffer, chosen by the arguments' types */
	adwithin(gs: Geometry | Cbuffer | TCbuffer, dist: number): number {
		if (gs instanceof Geometry && typeof dist === 'number') return this._adwithin_tcbuffer_geo(gs as Geometry, dist as number);
		if (gs instanceof TCbuffer && typeof dist === 'number') return this._adwithin_tcbuffer_tcbuffer(gs as TCbuffer, dist as number);
		if (gs instanceof Cbuffer && typeof dist === 'number') return this._adwithin_tcbuffer_cbuffer(gs as Cbuffer, dist as number);
		throw new TypeError(`TCbuffer.adwithin: no overload takes these arguments`);
	}

	/** MEOS: aintersects_tcbuffer_geo, aintersects_tcbuffer_cbuffer, aintersects_tcbuffer_tcbuffer, chosen by the arguments' types */
	aintersects(gs: Geometry | Cbuffer | TCbuffer): number {
		if (gs instanceof Geometry) return this._aintersects_tcbuffer_geo(gs as Geometry);
		if (gs instanceof TCbuffer) return this._aintersects_tcbuffer_tcbuffer(gs as TCbuffer);
		if (gs instanceof Cbuffer) return this._aintersects_tcbuffer_cbuffer(gs as Cbuffer);
		throw new TypeError(`TCbuffer.aintersects: no overload takes these arguments`);
	}

	/** MEOS: always_eq_tcbuffer_cbuffer, always_eq_tcbuffer_tcbuffer, chosen by the arguments' types */
	override alwaysEq(cb: Cbuffer | TCbuffer | Temporal): number {
		if (cb instanceof TCbuffer) return this._always_eq_tcbuffer_tcbuffer(cb as TCbuffer);
		if (cb instanceof Cbuffer) return this._always_eq_tcbuffer_cbuffer(cb as Cbuffer);
		return super.alwaysEq(cb as Temporal);
	}

	/** MEOS: always_ne_tcbuffer_cbuffer, always_ne_tcbuffer_tcbuffer, chosen by the arguments' types */
	override alwaysNe(cb: Cbuffer | TCbuffer | Temporal): number {
		if (cb instanceof TCbuffer) return this._always_ne_tcbuffer_tcbuffer(cb as TCbuffer);
		if (cb instanceof Cbuffer) return this._always_ne_tcbuffer_cbuffer(cb as Cbuffer);
		return super.alwaysNe(cb as Temporal);
	}

	/** MEOS: tcbuffer_at_cbuffer */
	atCbuffer(cb: Cbuffer): Temporal | null {
		return wrapTemporalOrNull(F.tcbuffer_at_cbuffer(this.ptr, cb.ptr)) as Temporal | null;
	}

	/** MEOS: tcbuffer_at_geom */
	atGeom(gs: Geo): Temporal | null {
		return wrapTemporalOrNull(F.tcbuffer_at_geom(this.ptr, gs.ptr)) as Temporal | null;
	}

	/** MEOS: atouches_tcbuffer_geo, atouches_tcbuffer_cbuffer, atouches_tcbuffer_tcbuffer, chosen by the arguments' types */
	atouches(gs: Geometry | Cbuffer | TCbuffer): number {
		if (gs instanceof Geometry) return this._atouches_tcbuffer_geo(gs as Geometry);
		if (gs instanceof TCbuffer) return this._atouches_tcbuffer_tcbuffer(gs as TCbuffer);
		if (gs instanceof Cbuffer) return this._atouches_tcbuffer_cbuffer(gs as Cbuffer);
		throw new TypeError(`TCbuffer.atouches: no overload takes these arguments`);
	}

	/** MEOS: tcbuffer_at_stbox */
	atStbox(box: STBox, border_inc: boolean): Temporal | null {
		return wrapTemporalOrNull(F.tcbuffer_at_stbox(this.ptr, box.ptr, border_inc)) as Temporal | null;
	}

	/** MEOS: tcbuffer_convex_hull */
	convexHull(): Geo {
		return wrapGeo(F.tcbuffer_convex_hull(this.ptr)) as Geo;
	}

	/** MEOS: econtains_tcbuffer_cbuffer, econtains_tcbuffer_geo, econtains_tcbuffer_tcbuffer, chosen by the arguments' types */
	econtains(cb: Cbuffer | Geometry | TCbuffer): number {
		if (cb instanceof Geometry) return this._econtains_tcbuffer_geo(cb as Geometry);
		if (cb instanceof TCbuffer) return this._econtains_tcbuffer_tcbuffer(cb as TCbuffer);
		if (cb instanceof Cbuffer) return this._econtains_tcbuffer_cbuffer(cb as Cbuffer);
		throw new TypeError(`TCbuffer.econtains: no overload takes these arguments`);
	}

	/** MEOS: ecovers_tcbuffer_cbuffer, ecovers_tcbuffer_geo, ecovers_tcbuffer_tcbuffer, chosen by the arguments' types */
	ecovers(cb: Cbuffer | Geometry | TCbuffer): number {
		if (cb instanceof Geometry) return this._ecovers_tcbuffer_geo(cb as Geometry);
		if (cb instanceof TCbuffer) return this._ecovers_tcbuffer_tcbuffer(cb as TCbuffer);
		if (cb instanceof Cbuffer) return this._ecovers_tcbuffer_cbuffer(cb as Cbuffer);
		throw new TypeError(`TCbuffer.ecovers: no overload takes these arguments`);
	}

	/** MEOS: edisjoint_tcbuffer_geo, edisjoint_tcbuffer_cbuffer, edisjoint_tcbuffer_tcbuffer, chosen by the arguments' types */
	edisjoint(gs: Geometry | Cbuffer | TCbuffer): number {
		if (gs instanceof Geometry) return this._edisjoint_tcbuffer_geo(gs as Geometry);
		if (gs instanceof TCbuffer) return this._edisjoint_tcbuffer_tcbuffer(gs as TCbuffer);
		if (gs instanceof Cbuffer) return this._edisjoint_tcbuffer_cbuffer(gs as Cbuffer);
		throw new TypeError(`TCbuffer.edisjoint: no overload takes these arguments`);
	}

	/** MEOS: edwithin_tcbuffer_geo, edwithin_tcbuffer_cbuffer, edwithin_tcbuffer_tcbuffer, chosen by the arguments' types */
	edwithin(gs: Geometry | Cbuffer | TCbuffer, dist: number): number {
		if (gs instanceof Geometry && typeof dist === 'number') return this._edwithin_tcbuffer_geo(gs as Geometry, dist as number);
		if (gs instanceof TCbuffer && typeof dist === 'number') return this._edwithin_tcbuffer_tcbuffer(gs as TCbuffer, dist as number);
		if (gs instanceof Cbuffer && typeof dist === 'number') return this._edwithin_tcbuffer_cbuffer(gs as Cbuffer, dist as number);
		throw new TypeError(`TCbuffer.edwithin: no overload takes these arguments`);
	}

	/** MEOS: eintersects_tcbuffer_geo, eintersects_tcbuffer_cbuffer, eintersects_tcbuffer_tcbuffer, chosen by the arguments' types */
	eintersects(gs: Geometry | Cbuffer | TCbuffer): number {
		if (gs instanceof Geometry) return this._eintersects_tcbuffer_geo(gs as Geometry);
		if (gs instanceof TCbuffer) return this._eintersects_tcbuffer_tcbuffer(gs as TCbuffer);
		if (gs instanceof Cbuffer) return this._eintersects_tcbuffer_cbuffer(gs as Cbuffer);
		throw new TypeError(`TCbuffer.eintersects: no overload takes these arguments`);
	}

	/** MEOS: tcbuffer_end_value */
	endValue(): Cbuffer {
		return wrapCbuffer(F.tcbuffer_end_value(this.ptr)) as Cbuffer;
	}

	/** MEOS: etouches_tcbuffer_geo, etouches_tcbuffer_cbuffer, etouches_tcbuffer_tcbuffer, chosen by the arguments' types */
	etouches(gs: Geometry | Cbuffer | TCbuffer): number {
		if (gs instanceof Geometry) return this._etouches_tcbuffer_geo(gs as Geometry);
		if (gs instanceof TCbuffer) return this._etouches_tcbuffer_tcbuffer(gs as TCbuffer);
		if (gs instanceof Cbuffer) return this._etouches_tcbuffer_cbuffer(gs as Cbuffer);
		throw new TypeError(`TCbuffer.etouches: no overload takes these arguments`);
	}

	/** MEOS: ever_eq_tcbuffer_cbuffer, ever_eq_tcbuffer_tcbuffer, chosen by the arguments' types */
	override everEq(cb: Cbuffer | TCbuffer | Temporal): number {
		if (cb instanceof TCbuffer) return this._ever_eq_tcbuffer_tcbuffer(cb as TCbuffer);
		if (cb instanceof Cbuffer) return this._ever_eq_tcbuffer_cbuffer(cb as Cbuffer);
		return super.everEq(cb as Temporal);
	}

	/** MEOS: ever_ne_tcbuffer_cbuffer, ever_ne_tcbuffer_tcbuffer, chosen by the arguments' types */
	override everNe(cb: Cbuffer | TCbuffer | Temporal): number {
		if (cb instanceof TCbuffer) return this._ever_ne_tcbuffer_tcbuffer(cb as TCbuffer);
		if (cb instanceof Cbuffer) return this._ever_ne_tcbuffer_cbuffer(cb as Cbuffer);
		return super.everNe(cb as Temporal);
	}

	/** MEOS: tcbuffer_expand */
	expand(dist: number): Temporal {
		return wrapTemporal(F.tcbuffer_expand(this.ptr, dist)) as Temporal;
	}

	/** MEOS: tcbuffer_make */
	make(tfloat: Temporal): TCbuffer | null {
		return wrapTemporalOrNull(F.tcbuffer_make(this.ptr, tfloat.ptr)) as TCbuffer | null;
	}

	/** MEOS: mindistance_tcbuffer_tcbuffer */
	mindistance(temp2: Temporal, threshold: number): number {
		return F.mindistance_tcbuffer_tcbuffer(this.ptr, temp2.ptr, threshold);
	}

	/** MEOS: tcbuffer_minus_cbuffer */
	minusCbuffer(cb: Cbuffer): Temporal | null {
		return wrapTemporalOrNull(F.tcbuffer_minus_cbuffer(this.ptr, cb.ptr)) as Temporal | null;
	}

	/** MEOS: tcbuffer_minus_geom */
	minusGeom(gs: Geo): Temporal | null {
		return wrapTemporalOrNull(F.tcbuffer_minus_geom(this.ptr, gs.ptr)) as Temporal | null;
	}

	/** MEOS: tcbuffer_minus_stbox */
	minusStbox(box: STBox, border_inc: boolean): Temporal | null {
		return wrapTemporalOrNull(F.tcbuffer_minus_stbox(this.ptr, box.ptr, border_inc)) as Temporal | null;
	}

	/** MEOS: nad_tcbuffer_cbuffer, nad_tcbuffer_geo, nad_tcbuffer_stbox, nad_tcbuffer_tcbuffer, chosen by the arguments' types */
	nad(cb: Cbuffer | Geometry | STBox | TCbuffer): number {
		if (cb instanceof Geometry) return this._nad_tcbuffer_geo(cb as Geometry);
		if (cb instanceof TCbuffer) return this._nad_tcbuffer_tcbuffer(cb as TCbuffer);
		if (cb instanceof Cbuffer) return this._nad_tcbuffer_cbuffer(cb as Cbuffer);
		if (cb instanceof STBox) return this._nad_tcbuffer_stbox(cb as STBox);
		throw new TypeError(`TCbuffer.nad: no overload takes these arguments`);
	}

	/** MEOS: nai_tcbuffer_cbuffer, nai_tcbuffer_geo, nai_tcbuffer_tcbuffer, chosen by the arguments' types */
	nai(cb: Cbuffer | Geometry | TCbuffer): Temporal | null {
		if (cb instanceof Geometry) return this._nai_tcbuffer_geo(cb as Geometry);
		if (cb instanceof TCbuffer) return this._nai_tcbuffer_tcbuffer(cb as TCbuffer);
		if (cb instanceof Cbuffer) return this._nai_tcbuffer_cbuffer(cb as Cbuffer);
		throw new TypeError(`TCbuffer.nai: no overload takes these arguments`);
	}

	/** MEOS: tcbuffer_points */
	points(): Set {
		return wrapSet(F.tcbuffer_points(this.ptr)) as Set;
	}

	/** MEOS: tcbuffer_radius */
	radius(): Set {
		return wrapSet(F.tcbuffer_radius(this.ptr)) as Set;
	}

	/** MEOS: tcbuffer_rotate */
	rotate(angle: number, x0: number, y0: number): Temporal {
		return wrapTemporal(F.tcbuffer_rotate(this.ptr, angle, x0, y0)) as Temporal;
	}

	/** MEOS: tcbuffer_rotate_z */
	rotateZ(angle: number): Temporal {
		return wrapTemporal(F.tcbuffer_rotate_z(this.ptr, angle)) as Temporal;
	}

	/** MEOS: shortestline_tcbuffer_cbuffer, shortestline_tcbuffer_geo, shortestline_tcbuffer_tcbuffer, chosen by the arguments' types */
	shortestline(cb: Cbuffer | Geometry | TCbuffer): Geo | null {
		if (cb instanceof Geometry) return this._shortestline_tcbuffer_geo(cb as Geometry);
		if (cb instanceof TCbuffer) return this._shortestline_tcbuffer_tcbuffer(cb as TCbuffer);
		if (cb instanceof Cbuffer) return this._shortestline_tcbuffer_cbuffer(cb as Cbuffer);
		throw new TypeError(`TCbuffer.shortestline: no overload takes these arguments`);
	}

	/** MEOS: tcbuffer_start_value */
	startValue(): Cbuffer {
		return wrapCbuffer(F.tcbuffer_start_value(this.ptr)) as Cbuffer;
	}

	/** MEOS: tcontains_tcbuffer_geo, tcontains_tcbuffer_cbuffer, tcontains_tcbuffer_tcbuffer, chosen by the arguments' types */
	tcontains(gs: Geometry | Cbuffer | TCbuffer): Temporal | null {
		if (gs instanceof Geometry) return this._tcontains_tcbuffer_geo(gs as Geometry);
		if (gs instanceof TCbuffer) return this._tcontains_tcbuffer_tcbuffer(gs as TCbuffer);
		if (gs instanceof Cbuffer) return this._tcontains_tcbuffer_cbuffer(gs as Cbuffer);
		throw new TypeError(`TCbuffer.tcontains: no overload takes these arguments`);
	}

	/** MEOS: tcovers_tcbuffer_geo, tcovers_tcbuffer_cbuffer, tcovers_tcbuffer_tcbuffer, chosen by the arguments' types */
	tcovers(gs: Geometry | Cbuffer | TCbuffer): Temporal | null {
		if (gs instanceof Geometry) return this._tcovers_tcbuffer_geo(gs as Geometry);
		if (gs instanceof TCbuffer) return this._tcovers_tcbuffer_tcbuffer(gs as TCbuffer);
		if (gs instanceof Cbuffer) return this._tcovers_tcbuffer_cbuffer(gs as Cbuffer);
		throw new TypeError(`TCbuffer.tcovers: no overload takes these arguments`);
	}

	/** MEOS: tdisjoint_tcbuffer_geo, tdisjoint_tcbuffer_cbuffer, tdisjoint_tcbuffer_tcbuffer, chosen by the arguments' types */
	tdisjoint(gs: Geometry | Cbuffer | TCbuffer): Temporal | null {
		if (gs instanceof Geometry) return this._tdisjoint_tcbuffer_geo(gs as Geometry);
		if (gs instanceof TCbuffer) return this._tdisjoint_tcbuffer_tcbuffer(gs as TCbuffer);
		if (gs instanceof Cbuffer) return this._tdisjoint_tcbuffer_cbuffer(gs as Cbuffer);
		throw new TypeError(`TCbuffer.tdisjoint: no overload takes these arguments`);
	}

	/** MEOS: tdistance_tcbuffer_cbuffer, tdistance_tcbuffer_geo, tdistance_tcbuffer_tcbuffer, chosen by the arguments' types */
	tdistance(cb: Cbuffer | Geometry | TCbuffer): Temporal | null {
		if (cb instanceof Geometry) return this._tdistance_tcbuffer_geo(cb as Geometry);
		if (cb instanceof TCbuffer) return this._tdistance_tcbuffer_tcbuffer(cb as TCbuffer);
		if (cb instanceof Cbuffer) return this._tdistance_tcbuffer_cbuffer(cb as Cbuffer);
		throw new TypeError(`TCbuffer.tdistance: no overload takes these arguments`);
	}

	/** MEOS: tdwithin_tcbuffer_geo, tdwithin_tcbuffer_cbuffer, tdwithin_tcbuffer_tcbuffer, chosen by the arguments' types */
	tdwithin(gs: Geometry | Cbuffer | TCbuffer, dist: number): Temporal | null {
		if (gs instanceof Geometry && typeof dist === 'number') return this._tdwithin_tcbuffer_geo(gs as Geometry, dist as number);
		if (gs instanceof TCbuffer && typeof dist === 'number') return this._tdwithin_tcbuffer_tcbuffer(gs as TCbuffer, dist as number);
		if (gs instanceof Cbuffer && typeof dist === 'number') return this._tdwithin_tcbuffer_cbuffer(gs as Cbuffer, dist as number);
		throw new TypeError(`TCbuffer.tdwithin: no overload takes these arguments`);
	}

	/** MEOS: teq_tcbuffer_cbuffer, chosen by the arguments' types */
	override teq(cb: Cbuffer | Temporal): Temporal | null {
		if (cb instanceof Cbuffer) return this._teq_tcbuffer_cbuffer(cb as Cbuffer);
		return super.teq(cb as Temporal);
	}

	/** MEOS: tintersects_tcbuffer_geo, tintersects_tcbuffer_cbuffer, tintersects_tcbuffer_tcbuffer, chosen by the arguments' types */
	tintersects(gs: Geometry | Cbuffer | TCbuffer): Temporal | null {
		if (gs instanceof Geometry) return this._tintersects_tcbuffer_geo(gs as Geometry);
		if (gs instanceof TCbuffer) return this._tintersects_tcbuffer_tcbuffer(gs as TCbuffer);
		if (gs instanceof Cbuffer) return this._tintersects_tcbuffer_cbuffer(gs as Cbuffer);
		throw new TypeError(`TCbuffer.tintersects: no overload takes these arguments`);
	}

	/** MEOS: tne_tcbuffer_cbuffer, chosen by the arguments' types */
	override tne(cb: Cbuffer | Temporal): Temporal | null {
		if (cb instanceof Cbuffer) return this._tne_tcbuffer_cbuffer(cb as Cbuffer);
		return super.tne(cb as Temporal);
	}

	/** MEOS: tcbuffer_to_tfloat */
	toTfloat(): Temporal {
		return wrapTemporal(F.tcbuffer_to_tfloat(this.ptr)) as Temporal;
	}

	/** MEOS: tcbuffer_to_tgeompoint */
	toTgeompoint(): Temporal {
		return wrapTemporal(F.tcbuffer_to_tgeompoint(this.ptr)) as Temporal;
	}

	/** MEOS: tcbuffer_translate */
	translate(deltax: number, deltay: number): Temporal {
		return wrapTemporal(F.tcbuffer_translate(this.ptr, deltax, deltay)) as Temporal;
	}

	/** MEOS: tcbuffer_traversed_area */
	traversedArea(unary_union: boolean): Geo {
		return wrapGeo(F.tcbuffer_traversed_area(this.ptr, unary_union)) as Geo;
	}

	/** MEOS: ttouches_tcbuffer_geo, ttouches_tcbuffer_cbuffer, ttouches_tcbuffer_tcbuffer, chosen by the arguments' types */
	ttouches(gs: Geometry | Cbuffer | TCbuffer): Temporal | null {
		if (gs instanceof Geometry) return this._ttouches_tcbuffer_geo(gs as Geometry);
		if (gs instanceof TCbuffer) return this._ttouches_tcbuffer_tcbuffer(gs as TCbuffer);
		if (gs instanceof Cbuffer) return this._ttouches_tcbuffer_cbuffer(gs as Cbuffer);
		throw new TypeError(`TCbuffer.ttouches: no overload takes these arguments`);
	}

	/** MEOS: tcbuffer_value */
	value(): Cbuffer {
		return wrapCbuffer(F.tcbuffer_value(this.ptr)) as Cbuffer;
	}

	/** MEOS: tcbuffer_value_n */
	valueN(n: number): Cbuffer | null {
		return wrapCbufferOrNull(F.tcbuffer_value_n(this.ptr, n)) as Cbuffer | null;
	}

	/** MEOS: tcbuffer_values */
	values(): Cbuffer[] {
		const _count = _alloc(4);
		try {
			const _arr = F.tcbuffer_values(this.ptr, _count);
			if (!_arr) return [];
			try {
				const _n = _view(_count, 4).getInt32(0, true);
				const _v = _view(_arr, _n * 8);
				const _out: Cbuffer[] = [];
				for (let _i = 0; _i < _n; _i++) _out.push(wrapCbuffer(Number(_v.getBigUint64(_i * 8, true))) as Cbuffer);
				return _out;
			} finally {
				_free(_arr);
			}
		} finally {
			_free(_count);
		}
	}

	/** MEOS: tcbuffer_from_base_temp */
	static fromBaseTemp(cb: Cbuffer, temp: Temporal): TCbuffer {
		return wrapTemporal(F.tcbuffer_from_base_temp(cb.ptr, temp.ptr)) as TCbuffer;
	}

	/** MEOS: temporal_from_wkb */
	static fromEWKB(wkb: Uint8Array): Temporal {
		return Temporal.fromWKB(wkb);
	}

	/** MEOS: tcbuffer_in */
	static fromEWKT(str: string): TCbuffer {
		return TCbuffer.in(str);
	}

	/** MEOS: temporal_from_hexwkb */
	static fromHexEWKB(hexwkb: string): Temporal {
		return Temporal.fromHexWKB(hexwkb);
	}

	/** MEOS: tcbuffer_from_mfjson */
	static fromMFJSON(mfjson: string): TCbuffer {
		return wrapTemporal(F.tcbuffer_from_mfjson(mfjson)) as TCbuffer;
	}

	/** MEOS: tcbuffer_in */
	static fromText(str: string): TCbuffer {
		return TCbuffer.in(str);
	}

	/** MEOS: tcbuffer_in */
	static in(str: string): TCbuffer {
		return wrapTemporal(F.tcbuffer_in(str)) as TCbuffer;
	}
}

/**
 * A TCbuffer of subtype TInstant.
 */
export class TCbufferInst extends TCbuffer {

	/** MEOS: tcbufferinst_make */
	static make(cb: Cbuffer, t: TimestampTz): TCbufferInst {
		return wrapTemporal(F.tcbufferinst_make(cb.ptr, t)) as TCbufferInst;
	}
}

/**
 * A TCbuffer of subtype TSequence.
 */
export class TCbufferSeq extends TCbuffer {

	/** MEOS: tcbufferseq_from_base_tstzset */
	static fromBaseTstzset(cb: Cbuffer, s: Set): TCbufferSeq {
		return wrapTemporal(F.tcbufferseq_from_base_tstzset(cb.ptr, s.ptr)) as TCbufferSeq;
	}

	/** MEOS: tcbufferseq_from_base_tstzspan */
	static fromBaseTstzspan(cb: Cbuffer, s: Span, interp: number): TCbufferSeq {
		return wrapTemporal(F.tcbufferseq_from_base_tstzspan(cb.ptr, s.ptr, interp)) as TCbufferSeq;
	}
}

/**
 * A TCbuffer of subtype TSequenceSet.
 */
export class TCbufferSeqSet extends TCbuffer {

	/** MEOS: tcbufferseqset_from_base_tstzspanset */
	static fromBaseTstzspanset(cb: Cbuffer, ss: SpanSet, interp: number): TCbufferSeqSet {
		return wrapTemporal(F.tcbufferseqset_from_base_tstzspanset(cb.ptr, ss.ptr, interp)) as TCbufferSeqSet;
	}
}

/**
 * Temporal DGGS cell indexes, the types tcellindex_type of meos/src/temporal/tcellindex.c admits (T_TH3INDEX, T_TQUADBIN, T_TS2CELL): the tcellindex_* functions every cell family answers through its DggsCellOps.
 */
export class TCellIndex extends TSpatial {

	/** MEOS: tcellindex_cell_area */
	cellArea(): Temporal {
		return wrapTemporal(F.tcellindex_cell_area(this.ptr)) as Temporal;
	}

	/** MEOS: tcellindex_cell_to_boundary */
	cellToBoundary(): Temporal {
		return wrapTemporal(F.tcellindex_cell_to_boundary(this.ptr)) as Temporal;
	}

	/** MEOS: tcellindex_cell_to_parent */
	cellToParent(resolution: number): Temporal {
		return wrapTemporal(F.tcellindex_cell_to_parent(this.ptr, resolution)) as Temporal;
	}

	/** MEOS: tcellindex_cell_to_point */
	cellToPoint(): Temporal {
		return wrapTemporal(F.tcellindex_cell_to_point(this.ptr)) as Temporal;
	}

	/** MEOS: tcellindex_get_resolution */
	getResolution(): Temporal {
		return wrapTemporal(F.tcellindex_get_resolution(this.ptr)) as Temporal;
	}

	/** MEOS: tcellindex_is_valid_cell */
	isValidCell(): Temporal {
		return wrapTemporal(F.tcellindex_is_valid_cell(this.ptr)) as Temporal;
	}
}

/**
 * The TFloat class of the MEOS object model.
 */
export class TFloat extends TNumber {

	/** The text MEOS writes this value as (MEOS: tfloat_out). */
	override toString(): string {
		return this.out(15);
	}

	/** MEOS: add_tfloat_float */
	private _add_tfloat_float(d: number): Temporal {
		return wrapTemporal(F.add_tfloat_float(this.ptr, d)) as Temporal;
	}

	/** MEOS: always_eq_tfloat_float */
	private _always_eq_tfloat_float(d: number): number {
		return F.always_eq_tfloat_float(this.ptr, d);
	}

	/** MEOS: always_ge_tfloat_float */
	private _always_ge_tfloat_float(d: number): number {
		return F.always_ge_tfloat_float(this.ptr, d);
	}

	/** MEOS: always_gt_tfloat_float */
	private _always_gt_tfloat_float(d: number): number {
		return F.always_gt_tfloat_float(this.ptr, d);
	}

	/** MEOS: always_le_tfloat_float */
	private _always_le_tfloat_float(d: number): number {
		return F.always_le_tfloat_float(this.ptr, d);
	}

	/** MEOS: always_lt_tfloat_float */
	private _always_lt_tfloat_float(d: number): number {
		return F.always_lt_tfloat_float(this.ptr, d);
	}

	/** MEOS: always_ne_tfloat_float */
	private _always_ne_tfloat_float(d: number): number {
		return F.always_ne_tfloat_float(this.ptr, d);
	}

	/** MEOS: div_tfloat_float */
	private _div_tfloat_float(d: number): Temporal {
		return wrapTemporal(F.div_tfloat_float(this.ptr, d)) as Temporal;
	}

	/** MEOS: ever_eq_tfloat_float */
	private _ever_eq_tfloat_float(d: number): number {
		return F.ever_eq_tfloat_float(this.ptr, d);
	}

	/** MEOS: ever_ge_tfloat_float */
	private _ever_ge_tfloat_float(d: number): number {
		return F.ever_ge_tfloat_float(this.ptr, d);
	}

	/** MEOS: ever_gt_tfloat_float */
	private _ever_gt_tfloat_float(d: number): number {
		return F.ever_gt_tfloat_float(this.ptr, d);
	}

	/** MEOS: ever_le_tfloat_float */
	private _ever_le_tfloat_float(d: number): number {
		return F.ever_le_tfloat_float(this.ptr, d);
	}

	/** MEOS: ever_lt_tfloat_float */
	private _ever_lt_tfloat_float(d: number): number {
		return F.ever_lt_tfloat_float(this.ptr, d);
	}

	/** MEOS: ever_ne_tfloat_float */
	private _ever_ne_tfloat_float(d: number): number {
		return F.ever_ne_tfloat_float(this.ptr, d);
	}

	/** MEOS: mul_tfloat_float */
	private _mul_tfloat_float(d: number): Temporal {
		return wrapTemporal(F.mul_tfloat_float(this.ptr, d)) as Temporal;
	}

	/** MEOS: nad_tfloat_float */
	private _nad_tfloat_float(d: number): number {
		return F.nad_tfloat_float(this.ptr, d);
	}

	/** MEOS: nad_tfloat_floatspan */
	private _nad_tfloat_floatspan(s: FloatSpan): number {
		return F.nad_tfloat_floatspan(this.ptr, s.ptr);
	}

	/** MEOS: nad_tfloat_tbox */
	private _nad_tfloat_tbox(box: TBox): number {
		return F.nad_tfloat_tbox(this.ptr, box.ptr);
	}

	/** MEOS: nad_tfloat_tfloat */
	private _nad_tfloat_tfloat(temp2: TFloat): number {
		return F.nad_tfloat_tfloat(this.ptr, temp2.ptr);
	}

	/** MEOS: sub_tfloat_float */
	private _sub_tfloat_float(d: number): Temporal {
		return wrapTemporal(F.sub_tfloat_float(this.ptr, d)) as Temporal;
	}

	/** MEOS: tdistance_tfloat_float */
	private _tdistance_tfloat_float(d: number): Temporal | null {
		return wrapTemporalOrNull(F.tdistance_tfloat_float(this.ptr, d)) as Temporal | null;
	}

	/** MEOS: teq_tfloat_float */
	private _teq_tfloat_float(d: number): Temporal {
		return wrapTemporal(F.teq_tfloat_float(this.ptr, d)) as Temporal;
	}

	/** MEOS: tge_tfloat_float */
	private _tge_tfloat_float(d: number): Temporal {
		return wrapTemporal(F.tge_tfloat_float(this.ptr, d)) as Temporal;
	}

	/** MEOS: tgt_tfloat_float */
	private _tgt_tfloat_float(d: number): Temporal {
		return wrapTemporal(F.tgt_tfloat_float(this.ptr, d)) as Temporal;
	}

	/** MEOS: tle_tfloat_float */
	private _tle_tfloat_float(d: number): Temporal {
		return wrapTemporal(F.tle_tfloat_float(this.ptr, d)) as Temporal;
	}

	/** MEOS: tlt_tfloat_float */
	private _tlt_tfloat_float(d: number): Temporal {
		return wrapTemporal(F.tlt_tfloat_float(this.ptr, d)) as Temporal;
	}

	/** MEOS: tne_tfloat_float */
	private _tne_tfloat_float(d: number): Temporal {
		return wrapTemporal(F.tne_tfloat_float(this.ptr, d)) as Temporal;
	}

	/** MEOS: add_tfloat_float, chosen by the arguments' types */
	override add(d: number | TNumber): Temporal | null {
		if (typeof d === 'number') return this._add_tfloat_float(d as number);
		return super.add(d as TNumber);
	}

	/** MEOS: always_eq_tfloat_float, chosen by the arguments' types */
	override alwaysEq(d: number | Temporal): number {
		if (typeof d === 'number') return this._always_eq_tfloat_float(d as number);
		return super.alwaysEq(d as Temporal);
	}

	/** MEOS: always_ge_tfloat_float, chosen by the arguments' types */
	override alwaysGe(d: number | Temporal): number {
		if (typeof d === 'number') return this._always_ge_tfloat_float(d as number);
		return super.alwaysGe(d as Temporal);
	}

	/** MEOS: always_gt_tfloat_float, chosen by the arguments' types */
	override alwaysGt(d: number | Temporal): number {
		if (typeof d === 'number') return this._always_gt_tfloat_float(d as number);
		return super.alwaysGt(d as Temporal);
	}

	/** MEOS: always_le_tfloat_float, chosen by the arguments' types */
	override alwaysLe(d: number | Temporal): number {
		if (typeof d === 'number') return this._always_le_tfloat_float(d as number);
		return super.alwaysLe(d as Temporal);
	}

	/** MEOS: always_lt_tfloat_float, chosen by the arguments' types */
	override alwaysLt(d: number | Temporal): number {
		if (typeof d === 'number') return this._always_lt_tfloat_float(d as number);
		return super.alwaysLt(d as Temporal);
	}

	/** MEOS: always_ne_tfloat_float, chosen by the arguments' types */
	override alwaysNe(d: number | Temporal): number {
		if (typeof d === 'number') return this._always_ne_tfloat_float(d as number);
		return super.alwaysNe(d as Temporal);
	}

	/** MEOS: tfloat_out */
	asText(maxdd: number): string {
		return this.out(maxdd);
	}

	/** MEOS: tfloat_at_value */
	atValue(d: number): Temporal | null {
		return wrapTemporalOrNull(F.tfloat_at_value(this.ptr, d)) as Temporal | null;
	}

	/** MEOS: tfloat_ceil */
	ceil(): Temporal {
		return wrapTemporal(F.tfloat_ceil(this.ptr)) as Temporal;
	}

	/** MEOS: tfloat_cos */
	cos(): Temporal {
		return wrapTemporal(F.tfloat_cos(this.ptr)) as Temporal;
	}

	/** MEOS: tfloat_degrees */
	degrees(normalize: boolean): Temporal {
		return wrapTemporal(F.tfloat_degrees(this.ptr, normalize)) as Temporal;
	}

	/** MEOS: div_tfloat_float, chosen by the arguments' types */
	override div(d: number | TNumber): Temporal | null {
		if (typeof d === 'number') return this._div_tfloat_float(d as number);
		return super.div(d as TNumber);
	}

	/** MEOS: tfloat_end_value */
	endValue(): number {
		return F.tfloat_end_value(this.ptr);
	}

	/** MEOS: ever_eq_tfloat_float, chosen by the arguments' types */
	override everEq(d: number | Temporal): number {
		if (typeof d === 'number') return this._ever_eq_tfloat_float(d as number);
		return super.everEq(d as Temporal);
	}

	/** MEOS: ever_ge_tfloat_float, chosen by the arguments' types */
	override everGe(d: number | Temporal): number {
		if (typeof d === 'number') return this._ever_ge_tfloat_float(d as number);
		return super.everGe(d as Temporal);
	}

	/** MEOS: ever_gt_tfloat_float, chosen by the arguments' types */
	override everGt(d: number | Temporal): number {
		if (typeof d === 'number') return this._ever_gt_tfloat_float(d as number);
		return super.everGt(d as Temporal);
	}

	/** MEOS: ever_le_tfloat_float, chosen by the arguments' types */
	override everLe(d: number | Temporal): number {
		if (typeof d === 'number') return this._ever_le_tfloat_float(d as number);
		return super.everLe(d as Temporal);
	}

	/** MEOS: ever_lt_tfloat_float, chosen by the arguments' types */
	override everLt(d: number | Temporal): number {
		if (typeof d === 'number') return this._ever_lt_tfloat_float(d as number);
		return super.everLt(d as Temporal);
	}

	/** MEOS: ever_ne_tfloat_float, chosen by the arguments' types */
	override everNe(d: number | Temporal): number {
		if (typeof d === 'number') return this._ever_ne_tfloat_float(d as number);
		return super.everNe(d as Temporal);
	}

	/** MEOS: tfloat_exp */
	exp(): Temporal {
		return wrapTemporal(F.tfloat_exp(this.ptr)) as Temporal;
	}

	/** MEOS: tfloat_floor */
	floor(): Temporal {
		return wrapTemporal(F.tfloat_floor(this.ptr)) as Temporal;
	}

	/** MEOS: tfloat_ln */
	ln(): Temporal {
		return wrapTemporal(F.tfloat_ln(this.ptr)) as Temporal;
	}

	/** MEOS: tfloat_log10 */
	log10(): Temporal {
		return wrapTemporal(F.tfloat_log10(this.ptr)) as Temporal;
	}

	/** MEOS: tfloat_max_value */
	maxValue(): number {
		return F.tfloat_max_value(this.ptr);
	}

	/** MEOS: tfloat_minus_value */
	minusValue(d: number): Temporal | null {
		return wrapTemporalOrNull(F.tfloat_minus_value(this.ptr, d)) as Temporal | null;
	}

	/** MEOS: tfloat_min_value */
	minValue(): number {
		return F.tfloat_min_value(this.ptr);
	}

	/** MEOS: mul_tfloat_float, chosen by the arguments' types */
	override mul(d: number | TNumber): Temporal | null {
		if (typeof d === 'number') return this._mul_tfloat_float(d as number);
		return super.mul(d as TNumber);
	}

	/** MEOS: nad_tfloat_float, nad_tfloat_floatspan, nad_tfloat_tfloat, nad_tfloat_tbox, chosen by the arguments' types */
	nad(d: number | FloatSpan | TFloat | TBox): number {
		if (d instanceof FloatSpan) return this._nad_tfloat_floatspan(d as FloatSpan);
		if (d instanceof TFloat) return this._nad_tfloat_tfloat(d as TFloat);
		if (d instanceof TBox) return this._nad_tfloat_tbox(d as TBox);
		if (typeof d === 'number') return this._nad_tfloat_float(d as number);
		throw new TypeError(`TFloat.nad: no overload takes these arguments`);
	}

	/** MEOS: tfloat_out */
	out(maxdd: number): string {
		return F.tfloat_out(this.ptr, maxdd);
	}

	/** MEOS: add_float_tfloat */
	radd(d: number): Temporal {
		return wrapTemporal(F.add_float_tfloat(d, this.ptr)) as Temporal;
	}

	/** MEOS: tfloat_radians */
	radians(): Temporal {
		return wrapTemporal(F.tfloat_radians(this.ptr)) as Temporal;
	}

	/** MEOS: always_eq_float_tfloat */
	ralwaysEq(d: number): number {
		return F.always_eq_float_tfloat(d, this.ptr);
	}

	/** MEOS: always_ge_float_tfloat */
	ralwaysGe(d: number): number {
		return F.always_ge_float_tfloat(d, this.ptr);
	}

	/** MEOS: always_gt_float_tfloat */
	ralwaysGt(d: number): number {
		return F.always_gt_float_tfloat(d, this.ptr);
	}

	/** MEOS: always_le_float_tfloat */
	ralwaysLe(d: number): number {
		return F.always_le_float_tfloat(d, this.ptr);
	}

	/** MEOS: always_lt_float_tfloat */
	ralwaysLt(d: number): number {
		return F.always_lt_float_tfloat(d, this.ptr);
	}

	/** MEOS: always_ne_float_tfloat */
	ralwaysNe(d: number): number {
		return F.always_ne_float_tfloat(d, this.ptr);
	}

	/** MEOS: div_float_tfloat */
	rdiv(d: number): Temporal {
		return wrapTemporal(F.div_float_tfloat(d, this.ptr)) as Temporal;
	}

	/** MEOS: ever_eq_float_tfloat */
	reverEq(d: number): number {
		return F.ever_eq_float_tfloat(d, this.ptr);
	}

	/** MEOS: ever_ge_float_tfloat */
	reverGe(d: number): number {
		return F.ever_ge_float_tfloat(d, this.ptr);
	}

	/** MEOS: ever_gt_float_tfloat */
	reverGt(d: number): number {
		return F.ever_gt_float_tfloat(d, this.ptr);
	}

	/** MEOS: ever_le_float_tfloat */
	reverLe(d: number): number {
		return F.ever_le_float_tfloat(d, this.ptr);
	}

	/** MEOS: ever_lt_float_tfloat */
	reverLt(d: number): number {
		return F.ever_lt_float_tfloat(d, this.ptr);
	}

	/** MEOS: ever_ne_float_tfloat */
	reverNe(d: number): number {
		return F.ever_ne_float_tfloat(d, this.ptr);
	}

	/** MEOS: mul_float_tfloat */
	rmul(d: number): Temporal {
		return wrapTemporal(F.mul_float_tfloat(d, this.ptr)) as Temporal;
	}

	/** MEOS: sub_float_tfloat */
	rsub(d: number): Temporal {
		return wrapTemporal(F.sub_float_tfloat(d, this.ptr)) as Temporal;
	}

	/** MEOS: teq_float_tfloat */
	rteq(d: number): Temporal {
		return wrapTemporal(F.teq_float_tfloat(d, this.ptr)) as Temporal;
	}

	/** MEOS: tge_float_tfloat */
	rtge(d: number): Temporal {
		return wrapTemporal(F.tge_float_tfloat(d, this.ptr)) as Temporal;
	}

	/** MEOS: tgt_float_tfloat */
	rtgt(d: number): Temporal {
		return wrapTemporal(F.tgt_float_tfloat(d, this.ptr)) as Temporal;
	}

	/** MEOS: tle_float_tfloat */
	rtle(d: number): Temporal {
		return wrapTemporal(F.tle_float_tfloat(d, this.ptr)) as Temporal;
	}

	/** MEOS: tlt_float_tfloat */
	rtlt(d: number): Temporal {
		return wrapTemporal(F.tlt_float_tfloat(d, this.ptr)) as Temporal;
	}

	/** MEOS: tne_float_tfloat */
	rtne(d: number): Temporal {
		return wrapTemporal(F.tne_float_tfloat(d, this.ptr)) as Temporal;
	}

	/** MEOS: tfloat_scale_value */
	scaleValue(width: number): Temporal {
		return wrapTemporal(F.tfloat_scale_value(this.ptr, width)) as Temporal;
	}

	/** MEOS: tfloat_shift_scale_value */
	shiftScaleValue(shift: number, width: number): Temporal {
		return wrapTemporal(F.tfloat_shift_scale_value(this.ptr, shift, width)) as Temporal;
	}

	/** MEOS: tfloat_shift_value */
	shiftValue(shift: number): Temporal {
		return wrapTemporal(F.tfloat_shift_value(this.ptr, shift)) as Temporal;
	}

	/** MEOS: tfloat_sin */
	sin(): Temporal {
		return wrapTemporal(F.tfloat_sin(this.ptr)) as Temporal;
	}

	/** MEOS: tfloat_start_value */
	startValue(): number {
		return F.tfloat_start_value(this.ptr);
	}

	/** MEOS: sub_tfloat_float, chosen by the arguments' types */
	override sub(d: number | TNumber): Temporal | null {
		if (typeof d === 'number') return this._sub_tfloat_float(d as number);
		return super.sub(d as TNumber);
	}

	/** MEOS: tfloat_tan */
	tan(): Temporal {
		return wrapTemporal(F.tfloat_tan(this.ptr)) as Temporal;
	}

	/** MEOS: tdistance_tfloat_float, chosen by the arguments' types */
	override tdistance(d: number | TNumber): Temporal | null {
		if (typeof d === 'number') return this._tdistance_tfloat_float(d as number);
		return super.tdistance(d as TNumber);
	}

	/** MEOS: teq_tfloat_float, chosen by the arguments' types */
	override teq(d: number | Temporal): Temporal | null {
		if (typeof d === 'number') return this._teq_tfloat_float(d as number);
		return super.teq(d as Temporal);
	}

	/** MEOS: tge_tfloat_float, chosen by the arguments' types */
	override tge(d: number | Temporal): Temporal | null {
		if (typeof d === 'number') return this._tge_tfloat_float(d as number);
		return super.tge(d as Temporal);
	}

	/** MEOS: tgt_tfloat_float, chosen by the arguments' types */
	override tgt(d: number | Temporal): Temporal | null {
		if (typeof d === 'number') return this._tgt_tfloat_float(d as number);
		return super.tgt(d as Temporal);
	}

	/** MEOS: tfloat_time_boxes */
	timeBoxes(duration: Interval, torigin: TimestampTz, border_inc: boolean): TBox[] {
		const _duration = _putInterval(duration);
		const _count = _alloc(4);
		try {
			const _arr = F.tfloat_time_boxes(this.ptr, _duration, torigin, border_inc, _count);
			if (!_arr) return [];
			try {
				const _n = _view(_count, 4).getInt32(0, true);
				const _v = _view(_arr, _n * 56);
				const _out: TBox[] = [];
				for (let _i = 0; _i < _n; _i++) _out.push(wrapTBox(_copy(_arr + _i * 56, 56)) as TBox);
				return _out;
			} finally {
				_free(_arr);
			}
		} finally {
			_free(_duration);
			_free(_count);
		}
	}

	/** MEOS: tle_tfloat_float, chosen by the arguments' types */
	override tle(d: number | Temporal): Temporal | null {
		if (typeof d === 'number') return this._tle_tfloat_float(d as number);
		return super.tle(d as Temporal);
	}

	/** MEOS: tlt_tfloat_float, chosen by the arguments' types */
	override tlt(d: number | Temporal): Temporal | null {
		if (typeof d === 'number') return this._tlt_tfloat_float(d as number);
		return super.tlt(d as Temporal);
	}

	/** MEOS: tne_tfloat_float, chosen by the arguments' types */
	override tne(d: number | Temporal): Temporal | null {
		if (typeof d === 'number') return this._tne_tfloat_float(d as number);
		return super.tne(d as Temporal);
	}

	/** MEOS: tfloat_to_tbigint */
	toTbigint(): Temporal {
		return wrapTemporal(F.tfloat_to_tbigint(this.ptr)) as Temporal;
	}

	/** MEOS: tfloat_to_tint */
	toTint(): Temporal {
		return wrapTemporal(F.tfloat_to_tint(this.ptr)) as Temporal;
	}

	/** MEOS: tfloat_value */
	value(): number {
		return F.tfloat_value(this.ptr);
	}

	/** MEOS: tfloat_value_at_timestamptz */
	valueAtTimestamptz(t: TimestampTz, strict: boolean): number | null {
		const _value = _alloc(8);
		try {
			if (!F.tfloat_value_at_timestamptz(this.ptr, t, strict, _value)) return null;
			return ((_v: DataView) => _v.getFloat64(0, true))(_view(_value, 8));
		} finally {
			_free(_value);
		}
	}

	/** MEOS: tfloat_value_bins */
	valueBins(vsize: number, vorigin: number, border_inc: boolean): Span[] {
		const _count = _alloc(4);
		try {
			const _arr = F.tfloat_value_bins(this.ptr, vsize, vorigin, border_inc, _count);
			if (!_arr) return [];
			try {
				const _n = _view(_count, 4).getInt32(0, true);
				const _v = _view(_arr, _n * 24);
				const _out: Span[] = [];
				for (let _i = 0; _i < _n; _i++) _out.push(wrapSpan(_copy(_arr + _i * 24, 24)) as Span);
				return _out;
			} finally {
				_free(_arr);
			}
		} finally {
			_free(_count);
		}
	}

	/** MEOS: tfloat_value_boxes */
	valueBoxes(vsize: number, vorigin: number, border_inc: boolean): TBox[] {
		const _count = _alloc(4);
		try {
			const _arr = F.tfloat_value_boxes(this.ptr, vsize, vorigin, border_inc, _count);
			if (!_arr) return [];
			try {
				const _n = _view(_count, 4).getInt32(0, true);
				const _v = _view(_arr, _n * 56);
				const _out: TBox[] = [];
				for (let _i = 0; _i < _n; _i++) _out.push(wrapTBox(_copy(_arr + _i * 56, 56)) as TBox);
				return _out;
			} finally {
				_free(_arr);
			}
		} finally {
			_free(_count);
		}
	}

	/** MEOS: tfloat_value_n */
	valueN(n: number): number {
		return F.tfloat_value_n(this.ptr, n);
	}

	/** MEOS: tfloat_values */
	values(): number[] {
		const _count = _alloc(4);
		try {
			const _arr = F.tfloat_values(this.ptr, _count);
			if (!_arr) return [];
			try {
				const _n = _view(_count, 4).getInt32(0, true);
				const _v = _view(_arr, _n * 8);
				const _out: number[] = [];
				for (let _i = 0; _i < _n; _i++) _out.push(_v.getFloat64(_i * 8, true));
				return _out;
			} finally {
				_free(_arr);
			}
		} finally {
			_free(_count);
		}
	}

	/** MEOS: tfloat_value_time_boxes */
	valueTimeBoxes(vsize: number, duration: Interval, vorigin: number, torigin: TimestampTz, border_inc: boolean): TBox[] {
		const _duration = _putInterval(duration);
		const _count = _alloc(4);
		try {
			const _arr = F.tfloat_value_time_boxes(this.ptr, vsize, _duration, vorigin, torigin, border_inc, _count);
			if (!_arr) return [];
			try {
				const _n = _view(_count, 4).getInt32(0, true);
				const _v = _view(_arr, _n * 56);
				const _out: TBox[] = [];
				for (let _i = 0; _i < _n; _i++) _out.push(wrapTBox(_copy(_arr + _i * 56, 56)) as TBox);
				return _out;
			} finally {
				_free(_arr);
			}
		} finally {
			_free(_duration);
			_free(_count);
		}
	}

	/** MEOS: tfloat_from_base_temp */
	static fromBaseTemp(d: number, temp: Temporal): TFloat {
		return wrapTemporal(F.tfloat_from_base_temp(d, temp.ptr)) as TFloat;
	}

	/** MEOS: tfloat_from_mfjson */
	static fromMFJSON(str: string): TFloat {
		return wrapTemporal(F.tfloat_from_mfjson(str)) as TFloat;
	}

	/** MEOS: tfloat_in */
	static fromText(str: string): TFloat {
		return TFloat.in(str);
	}

	/** MEOS: tfloat_in */
	static in(str: string): TFloat {
		return wrapTemporal(F.tfloat_in(str)) as TFloat;
	}
}

/**
 * A TFloat of subtype TInstant.
 */
export class TFloatInst extends TFloat {

	/** MEOS: tfloatinst_make */
	static make(d: number, t: TimestampTz): TFloatInst {
		return wrapTemporal(F.tfloatinst_make(d, t)) as TFloatInst;
	}
}

/**
 * A TFloat of subtype TSequence.
 */
export class TFloatSeq extends TFloat {

	/** MEOS: tfloatseq_from_base_tstzset */
	static fromBaseTstzset(d: number, s: Set): TFloatSeq {
		return wrapTemporal(F.tfloatseq_from_base_tstzset(d, s.ptr)) as TFloatSeq;
	}

	/** MEOS: tfloatseq_from_base_tstzspan */
	static fromBaseTstzspan(d: number, s: Span, interp: number): TFloatSeq {
		return wrapTemporal(F.tfloatseq_from_base_tstzspan(d, s.ptr, interp)) as TFloatSeq;
	}
}

/**
 * A TFloat of subtype TSequenceSet.
 */
export class TFloatSeqSet extends TFloat {

	/** MEOS: tfloatseqset_from_base_tstzspanset */
	static fromBaseTstzspanset(d: number, ss: SpanSet, interp: number): TFloatSeqSet {
		return wrapTemporal(F.tfloatseqset_from_base_tstzspanset(d, ss.ptr, interp)) as TFloatSeqSet;
	}
}

/**
 * All PostGIS-derived spatiotemporal types (geometry/geography-based). Authoritative parent per MobilityDB manual Ch.7 Figure 7.1 (= the broad C predicate tgeo_type_all). NOTE: the narrower C predicate tgeo_type() and most tgeo_* functions reject points — class membership (manual) is broader than tgeo_* API applicability; see correction OM-M1.
 */
export class TGeo extends TSpatial {

	/** MEOS: adisjoint_tgeo_geo */
	private _adisjoint_tgeo_geo(gs: Geo): number {
		return F.adisjoint_tgeo_geo(this.ptr, gs.ptr);
	}

	/** MEOS: adisjoint_tgeo_tgeo */
	private _adisjoint_tgeo_tgeo(temp2: TGeo): number {
		return F.adisjoint_tgeo_tgeo(this.ptr, temp2.ptr);
	}

	/** MEOS: adwithin_tgeo_geo */
	private _adwithin_tgeo_geo(gs: Geometry, dist: number, spheroid: boolean): number {
		return F.adwithin_tgeo_geo(this.ptr, gs.ptr, dist, spheroid);
	}

	/** MEOS: adwithin_tgeo_tgeo */
	private _adwithin_tgeo_tgeo(temp2: TGeo, dist: number, spheroid: boolean): number {
		return F.adwithin_tgeo_tgeo(this.ptr, temp2.ptr, dist, spheroid);
	}

	/** MEOS: aintersects_tgeo_geo */
	private _aintersects_tgeo_geo(gs: Geo): number {
		return F.aintersects_tgeo_geo(this.ptr, gs.ptr);
	}

	/** MEOS: aintersects_tgeo_tgeo */
	private _aintersects_tgeo_tgeo(temp2: TGeo): number {
		return F.aintersects_tgeo_tgeo(this.ptr, temp2.ptr);
	}

	/** MEOS: always_eq_tgeo_geo */
	private _always_eq_tgeo_geo(gs: Geo): number {
		return F.always_eq_tgeo_geo(this.ptr, gs.ptr);
	}

	/** MEOS: always_eq_tgeo_tgeo */
	private _always_eq_tgeo_tgeo(temp2: TGeo): number {
		return F.always_eq_tgeo_tgeo(this.ptr, temp2.ptr);
	}

	/** MEOS: always_ne_tgeo_geo */
	private _always_ne_tgeo_geo(gs: Geo): number {
		return F.always_ne_tgeo_geo(this.ptr, gs.ptr);
	}

	/** MEOS: always_ne_tgeo_tgeo */
	private _always_ne_tgeo_tgeo(temp2: TGeo): number {
		return F.always_ne_tgeo_tgeo(this.ptr, temp2.ptr);
	}

	/** MEOS: edisjoint_tgeo_geo */
	private _edisjoint_tgeo_geo(gs: Geo): number {
		return F.edisjoint_tgeo_geo(this.ptr, gs.ptr);
	}

	/** MEOS: edisjoint_tgeo_tgeo */
	private _edisjoint_tgeo_tgeo(temp2: TGeo): number {
		return F.edisjoint_tgeo_tgeo(this.ptr, temp2.ptr);
	}

	/** MEOS: edwithin_tgeo_geo */
	private _edwithin_tgeo_geo(gs: Geo, dist: number, spheroid: boolean): number {
		return F.edwithin_tgeo_geo(this.ptr, gs.ptr, dist, spheroid);
	}

	/** MEOS: edwithin_tgeo_tgeo */
	private _edwithin_tgeo_tgeo(temp2: TSpatial, dist: number, spheroid: boolean): number {
		return F.edwithin_tgeo_tgeo(this.ptr, temp2.ptr, dist, spheroid);
	}

	/** MEOS: eintersects_tgeo_geo */
	private _eintersects_tgeo_geo(gs: Geo): number {
		return F.eintersects_tgeo_geo(this.ptr, gs.ptr);
	}

	/** MEOS: eintersects_tgeo_tgeo */
	private _eintersects_tgeo_tgeo(temp2: TSpatial): number {
		return F.eintersects_tgeo_tgeo(this.ptr, temp2.ptr);
	}

	/** MEOS: ever_eq_tgeo_geo */
	private _ever_eq_tgeo_geo(gs: Geo): number {
		return F.ever_eq_tgeo_geo(this.ptr, gs.ptr);
	}

	/** MEOS: ever_eq_tgeo_tgeo */
	private _ever_eq_tgeo_tgeo(temp2: TGeo): number {
		return F.ever_eq_tgeo_tgeo(this.ptr, temp2.ptr);
	}

	/** MEOS: ever_ne_tgeo_geo */
	private _ever_ne_tgeo_geo(gs: Geo): number {
		return F.ever_ne_tgeo_geo(this.ptr, gs.ptr);
	}

	/** MEOS: ever_ne_tgeo_tgeo */
	private _ever_ne_tgeo_tgeo(temp2: TGeo): number {
		return F.ever_ne_tgeo_tgeo(this.ptr, temp2.ptr);
	}

	/** MEOS: nad_tgeo_geo */
	private _nad_tgeo_geo(gs: Geo, spheroid: boolean): number {
		return F.nad_tgeo_geo(this.ptr, gs.ptr, spheroid);
	}

	/** MEOS: nad_tgeo_stbox */
	private _nad_tgeo_stbox(box: STBox, spheroid: boolean): number {
		return F.nad_tgeo_stbox(this.ptr, box.ptr, spheroid);
	}

	/** MEOS: nad_tgeo_tgeo */
	private _nad_tgeo_tgeo(temp2: TGeo, spheroid: boolean): number {
		return F.nad_tgeo_tgeo(this.ptr, temp2.ptr, spheroid);
	}

	/** MEOS: nai_tgeo_geo */
	private _nai_tgeo_geo(gs: Geo, spheroid: boolean): Temporal | null {
		return wrapTemporalOrNull(F.nai_tgeo_geo(this.ptr, gs.ptr, spheroid)) as Temporal | null;
	}

	/** MEOS: nai_tgeo_tgeo */
	private _nai_tgeo_tgeo(temp2: TGeo, spheroid: boolean): Temporal | null {
		return wrapTemporalOrNull(F.nai_tgeo_tgeo(this.ptr, temp2.ptr, spheroid)) as Temporal | null;
	}

	/** MEOS: shortestline_tgeo_geo */
	private _shortestline_tgeo_geo(gs: Geo, spheroid: boolean): Geo | null {
		return wrapGeoOrNull(F.shortestline_tgeo_geo(this.ptr, gs.ptr, spheroid)) as Geo | null;
	}

	/** MEOS: shortestline_tgeo_tgeo */
	private _shortestline_tgeo_tgeo(temp2: TGeo, spheroid: boolean): Geo | null {
		return wrapGeoOrNull(F.shortestline_tgeo_tgeo(this.ptr, temp2.ptr, spheroid)) as Geo | null;
	}

	/** MEOS: tdisjoint_tgeo_geo */
	private _tdisjoint_tgeo_geo(gs: Geo): Temporal | null {
		return wrapTemporalOrNull(F.tdisjoint_tgeo_geo(this.ptr, gs.ptr)) as Temporal | null;
	}

	/** MEOS: tdisjoint_tgeo_tgeo */
	private _tdisjoint_tgeo_tgeo(temp2: TGeo): Temporal | null {
		return wrapTemporalOrNull(F.tdisjoint_tgeo_tgeo(this.ptr, temp2.ptr)) as Temporal | null;
	}

	/** MEOS: tdistance_tgeo_geo */
	private _tdistance_tgeo_geo(gs: Geo, spheroid: boolean): Temporal | null {
		return wrapTemporalOrNull(F.tdistance_tgeo_geo(this.ptr, gs.ptr, spheroid)) as Temporal | null;
	}

	/** MEOS: tdistance_tgeo_tgeo */
	private _tdistance_tgeo_tgeo(temp2: TGeo, spheroid: boolean): Temporal | null {
		return wrapTemporalOrNull(F.tdistance_tgeo_tgeo(this.ptr, temp2.ptr, spheroid)) as Temporal | null;
	}

	/** MEOS: tdwithin_tgeo_geo */
	private _tdwithin_tgeo_geo(gs: Geo, dist: number, spheroid: boolean): Temporal | null {
		return wrapTemporalOrNull(F.tdwithin_tgeo_geo(this.ptr, gs.ptr, dist, spheroid)) as Temporal | null;
	}

	/** MEOS: tdwithin_tgeo_tgeo */
	private _tdwithin_tgeo_tgeo(temp2: TGeo, dist: number, spheroid: boolean): Temporal | null {
		return wrapTemporalOrNull(F.tdwithin_tgeo_tgeo(this.ptr, temp2.ptr, dist, spheroid)) as Temporal | null;
	}

	/** MEOS: teq_tgeo_geo */
	private _teq_tgeo_geo(gs: Geo): Temporal | null {
		return wrapTemporalOrNull(F.teq_tgeo_geo(this.ptr, gs.ptr)) as Temporal | null;
	}

	/** MEOS: tintersects_tgeo_geo */
	private _tintersects_tgeo_geo(gs: Geo): Temporal | null {
		return wrapTemporalOrNull(F.tintersects_tgeo_geo(this.ptr, gs.ptr)) as Temporal | null;
	}

	/** MEOS: tintersects_tgeo_tgeo */
	private _tintersects_tgeo_tgeo(temp2: TGeo): Temporal | null {
		return wrapTemporalOrNull(F.tintersects_tgeo_tgeo(this.ptr, temp2.ptr)) as Temporal | null;
	}

	/** MEOS: tne_tgeo_geo */
	private _tne_tgeo_geo(gs: Geo): Temporal | null {
		return wrapTemporalOrNull(F.tne_tgeo_geo(this.ptr, gs.ptr)) as Temporal | null;
	}

	/** MEOS: adisjoint_tgeo_geo, adisjoint_tgeo_tgeo, chosen by the arguments' types */
	adisjoint(gs: Geo | TGeo): number {
		if (gs instanceof TGeo) return this._adisjoint_tgeo_tgeo(gs as TGeo);
		if (gs instanceof Geo) return this._adisjoint_tgeo_geo(gs as Geo);
		throw new TypeError(`TGeo.adisjoint: no overload takes these arguments`);
	}

	/** MEOS: adwithin_tgeo_geo, adwithin_tgeo_tgeo, chosen by the arguments' types */
	adwithin(gs: Geometry | TGeo, dist: number, spheroid: boolean): number {
		if (gs instanceof Geometry && typeof dist === 'number' && typeof spheroid === 'boolean') return this._adwithin_tgeo_geo(gs as Geometry, dist as number, spheroid as boolean);
		if (gs instanceof TGeo && typeof dist === 'number' && typeof spheroid === 'boolean') return this._adwithin_tgeo_tgeo(gs as TGeo, dist as number, spheroid as boolean);
		throw new TypeError(`TGeo.adwithin: no overload takes these arguments`);
	}

	/** MEOS: tgeo_affine */
	affine(a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, xoff: number, yoff: number, zoff: number): Temporal {
		return wrapTemporal(F.tgeo_affine(this.ptr, a, b, c, d, e, f, g, h, i, xoff, yoff, zoff)) as Temporal;
	}

	/** MEOS: aintersects_tgeo_geo, aintersects_tgeo_tgeo, chosen by the arguments' types */
	aintersects(gs: Geo | TGeo): number {
		if (gs instanceof TGeo) return this._aintersects_tgeo_tgeo(gs as TGeo);
		if (gs instanceof Geo) return this._aintersects_tgeo_geo(gs as Geo);
		throw new TypeError(`TGeo.aintersects: no overload takes these arguments`);
	}

	/** MEOS: always_eq_tgeo_geo, always_eq_tgeo_tgeo, chosen by the arguments' types */
	override alwaysEq(gs: Geo | TGeo | Temporal): number {
		if (gs instanceof TGeo) return this._always_eq_tgeo_tgeo(gs as TGeo);
		if (gs instanceof Geo) return this._always_eq_tgeo_geo(gs as Geo);
		return super.alwaysEq(gs as Temporal);
	}

	/** MEOS: always_ne_tgeo_geo, always_ne_tgeo_tgeo, chosen by the arguments' types */
	override alwaysNe(gs: Geo | TGeo | Temporal): number {
		if (gs instanceof TGeo) return this._always_ne_tgeo_tgeo(gs as TGeo);
		if (gs instanceof Geo) return this._always_ne_tgeo_geo(gs as Geo);
		return super.alwaysNe(gs as Temporal);
	}

	/** MEOS: tgeo_at_geom */
	atGeom(gs: Geo): Temporal | null {
		return wrapTemporalOrNull(F.tgeo_at_geom(this.ptr, gs.ptr)) as Temporal | null;
	}

	/** MEOS: tgeo_at_stbox */
	atStbox(box: STBox, border_inc: boolean): Temporal | null {
		return wrapTemporalOrNull(F.tgeo_at_stbox(this.ptr, box.ptr, border_inc)) as Temporal | null;
	}

	/** MEOS: tgeo_at_value */
	atValue(gs: Geo): Temporal | null {
		return wrapTemporalOrNull(F.tgeo_at_value(this.ptr, gs.ptr)) as Temporal | null;
	}

	/** MEOS: tgeo_centroid */
	centroid(spheroid: boolean): Temporal {
		return wrapTemporal(F.tgeo_centroid(this.ptr, spheroid)) as Temporal;
	}

	/** MEOS: tgeo_convex_hull */
	convexHull(): Geo {
		return wrapGeo(F.tgeo_convex_hull(this.ptr)) as Geo;
	}

	/** MEOS: edisjoint_tgeo_geo, edisjoint_tgeo_tgeo, chosen by the arguments' types */
	edisjoint(gs: Geo | TGeo): number {
		if (gs instanceof TGeo) return this._edisjoint_tgeo_tgeo(gs as TGeo);
		if (gs instanceof Geo) return this._edisjoint_tgeo_geo(gs as Geo);
		throw new TypeError(`TGeo.edisjoint: no overload takes these arguments`);
	}

	/** MEOS: edwithin_tgeo_geo, edwithin_tgeo_tgeo, chosen by the arguments' types */
	edwithin(gs: Geo | TSpatial, dist: number, spheroid: boolean): number {
		if (gs instanceof Geo && typeof dist === 'number' && typeof spheroid === 'boolean') return this._edwithin_tgeo_geo(gs as Geo, dist as number, spheroid as boolean);
		if (gs instanceof TSpatial && typeof dist === 'number' && typeof spheroid === 'boolean') return this._edwithin_tgeo_tgeo(gs as TSpatial, dist as number, spheroid as boolean);
		throw new TypeError(`TGeo.edwithin: no overload takes these arguments`);
	}

	/** MEOS: eintersects_tgeo_geo, eintersects_tgeo_tgeo, chosen by the arguments' types */
	eintersects(gs: Geo | TSpatial): number {
		if (gs instanceof Geo) return this._eintersects_tgeo_geo(gs as Geo);
		if (gs instanceof TSpatial) return this._eintersects_tgeo_tgeo(gs as TSpatial);
		throw new TypeError(`TGeo.eintersects: no overload takes these arguments`);
	}

	/** MEOS: tgeo_end_value */
	endValue(): Geo {
		return wrapGeo(F.tgeo_end_value(this.ptr)) as Geo;
	}

	/** MEOS: ever_eq_tgeo_geo, ever_eq_tgeo_tgeo, chosen by the arguments' types */
	override everEq(gs: Geo | TGeo | Temporal): number {
		if (gs instanceof TGeo) return this._ever_eq_tgeo_tgeo(gs as TGeo);
		if (gs instanceof Geo) return this._ever_eq_tgeo_geo(gs as Geo);
		return super.everEq(gs as Temporal);
	}

	/** MEOS: ever_ne_tgeo_geo, ever_ne_tgeo_tgeo, chosen by the arguments' types */
	override everNe(gs: Geo | TGeo | Temporal): number {
		if (gs instanceof TGeo) return this._ever_ne_tgeo_tgeo(gs as TGeo);
		if (gs instanceof Geo) return this._ever_ne_tgeo_geo(gs as Geo);
		return super.everNe(gs as Temporal);
	}

	/** MEOS: tgeo_force2d */
	force2d(): Temporal {
		return wrapTemporal(F.tgeo_force2d(this.ptr)) as Temporal;
	}

	/** MEOS: tgeo_force3d */
	force3d(zvalue: number): Temporal {
		return wrapTemporal(F.tgeo_force3d(this.ptr, zvalue)) as Temporal;
	}

	/** MEOS: tgeo_minus_geom */
	minusGeom(gs: Geo): Temporal | null {
		return wrapTemporalOrNull(F.tgeo_minus_geom(this.ptr, gs.ptr)) as Temporal | null;
	}

	/** MEOS: tgeo_minus_stbox */
	minusStbox(box: STBox, border_inc: boolean): Temporal | null {
		return wrapTemporalOrNull(F.tgeo_minus_stbox(this.ptr, box.ptr, border_inc)) as Temporal | null;
	}

	/** MEOS: tgeo_minus_value */
	minusValue(gs: Geo): Temporal | null {
		return wrapTemporalOrNull(F.tgeo_minus_value(this.ptr, gs.ptr)) as Temporal | null;
	}

	/** MEOS: nad_tgeo_geo, nad_tgeo_stbox, nad_tgeo_tgeo, chosen by the arguments' types */
	nad(gs: Geo | STBox | TGeo, spheroid: boolean): number {
		if (gs instanceof TGeo && typeof spheroid === 'boolean') return this._nad_tgeo_tgeo(gs as TGeo, spheroid as boolean);
		if (gs instanceof Geo && typeof spheroid === 'boolean') return this._nad_tgeo_geo(gs as Geo, spheroid as boolean);
		if (gs instanceof STBox && typeof spheroid === 'boolean') return this._nad_tgeo_stbox(gs as STBox, spheroid as boolean);
		throw new TypeError(`TGeo.nad: no overload takes these arguments`);
	}

	/** MEOS: nai_tgeo_geo, nai_tgeo_tgeo, chosen by the arguments' types */
	nai(gs: Geo | TGeo, spheroid: boolean): Temporal | null {
		if (gs instanceof TGeo && typeof spheroid === 'boolean') return this._nai_tgeo_tgeo(gs as TGeo, spheroid as boolean);
		if (gs instanceof Geo && typeof spheroid === 'boolean') return this._nai_tgeo_geo(gs as Geo, spheroid as boolean);
		throw new TypeError(`TGeo.nai: no overload takes these arguments`);
	}

	/** MEOS: tgeo_rotate */
	rotate(angle: number, x0: number, y0: number): Temporal {
		return wrapTemporal(F.tgeo_rotate(this.ptr, angle, x0, y0)) as Temporal;
	}

	/** MEOS: tgeo_rotate_geo */
	rotateGeo(angle: number, origin: Geo): Temporal {
		return wrapTemporal(F.tgeo_rotate_geo(this.ptr, angle, origin.ptr)) as Temporal;
	}

	/** MEOS: tgeo_rotate_x */
	rotateX(angle: number): Temporal {
		return wrapTemporal(F.tgeo_rotate_x(this.ptr, angle)) as Temporal;
	}

	/** MEOS: tgeo_rotate_y */
	rotateY(angle: number): Temporal {
		return wrapTemporal(F.tgeo_rotate_y(this.ptr, angle)) as Temporal;
	}

	/** MEOS: tgeo_rotate_z */
	rotateZ(angle: number): Temporal {
		return wrapTemporal(F.tgeo_rotate_z(this.ptr, angle)) as Temporal;
	}

	/** MEOS: tgeo_scale */
	scale(xfactor: number, yfactor: number, zfactor: number): Temporal {
		return wrapTemporal(F.tgeo_scale(this.ptr, xfactor, yfactor, zfactor)) as Temporal;
	}

	/** MEOS: tgeo_scale_geo */
	scaleGeo(scale: Geo): Temporal | null {
		return wrapTemporalOrNull(F.tgeo_scale_geo(this.ptr, scale.ptr)) as Temporal | null;
	}

	/** MEOS: tgeo_scale_geo_origin */
	scaleGeoOrigin(scale: Geo, sorigin: Geo): Temporal | null {
		return wrapTemporalOrNull(F.tgeo_scale_geo_origin(this.ptr, scale.ptr, sorigin.ptr)) as Temporal | null;
	}

	/** MEOS: shortestline_tgeo_geo, shortestline_tgeo_tgeo, chosen by the arguments' types */
	shortestline(gs: Geo | TGeo, spheroid: boolean): Geo | null {
		if (gs instanceof TGeo && typeof spheroid === 'boolean') return this._shortestline_tgeo_tgeo(gs as TGeo, spheroid as boolean);
		if (gs instanceof Geo && typeof spheroid === 'boolean') return this._shortestline_tgeo_geo(gs as Geo, spheroid as boolean);
		throw new TypeError(`TGeo.shortestline: no overload takes these arguments`);
	}

	/** MEOS: tgeo_space_boxes */
	spaceBoxes(xsize: number, ysize: number, zsize: number, sorigin: Geo, bitmatrix: boolean, border_inc: boolean): STBox[] {
		const _count = _alloc(4);
		try {
			const _arr = F.tgeo_space_boxes(this.ptr, xsize, ysize, zsize, sorigin.ptr, bitmatrix, border_inc, _count);
			if (!_arr) return [];
			try {
				const _n = _view(_count, 4).getInt32(0, true);
				const _v = _view(_arr, _n * 80);
				const _out: STBox[] = [];
				for (let _i = 0; _i < _n; _i++) _out.push(wrapSTBox(_copy(_arr + _i * 80, 80)) as STBox);
				return _out;
			} finally {
				_free(_arr);
			}
		} finally {
			_free(_count);
		}
	}

	/** MEOS: tgeo_space_time_boxes */
	spaceTimeBoxes(xsize: number, ysize: number, zsize: number, duration: Interval, sorigin: Geo, torigin: TimestampTz, bitmatrix: boolean, border_inc: boolean): STBox[] {
		const _duration = _putInterval(duration);
		const _count = _alloc(4);
		try {
			const _arr = F.tgeo_space_time_boxes(this.ptr, xsize, ysize, zsize, _duration, sorigin.ptr, torigin, bitmatrix, border_inc, _count);
			if (!_arr) return [];
			try {
				const _n = _view(_count, 4).getInt32(0, true);
				const _v = _view(_arr, _n * 80);
				const _out: STBox[] = [];
				for (let _i = 0; _i < _n; _i++) _out.push(wrapSTBox(_copy(_arr + _i * 80, 80)) as STBox);
				return _out;
			} finally {
				_free(_arr);
			}
		} finally {
			_free(_duration);
			_free(_count);
		}
	}

	/** MEOS: tgeo_split_each_n_stboxes */
	splitEachNStboxes(elem_count: number): STBox[] {
		const _count = _alloc(4);
		try {
			const _arr = F.tgeo_split_each_n_stboxes(this.ptr, elem_count, _count);
			if (!_arr) return [];
			try {
				const _n = _view(_count, 4).getInt32(0, true);
				const _v = _view(_arr, _n * 80);
				const _out: STBox[] = [];
				for (let _i = 0; _i < _n; _i++) _out.push(wrapSTBox(_copy(_arr + _i * 80, 80)) as STBox);
				return _out;
			} finally {
				_free(_arr);
			}
		} finally {
			_free(_count);
		}
	}

	/** MEOS: tgeo_split_n_stboxes */
	splitNStboxes(box_count: number): STBox[] {
		const _count = _alloc(4);
		try {
			const _arr = F.tgeo_split_n_stboxes(this.ptr, box_count, _count);
			if (!_arr) return [];
			try {
				const _n = _view(_count, 4).getInt32(0, true);
				const _v = _view(_arr, _n * 80);
				const _out: STBox[] = [];
				for (let _i = 0; _i < _n; _i++) _out.push(wrapSTBox(_copy(_arr + _i * 80, 80)) as STBox);
				return _out;
			} finally {
				_free(_arr);
			}
		} finally {
			_free(_count);
		}
	}

	/** MEOS: tgeo_start_value */
	startValue(): Geo {
		return wrapGeo(F.tgeo_start_value(this.ptr)) as Geo;
	}

	/** MEOS: tgeo_stboxes */
	stboxes(): STBox[] {
		const _count = _alloc(4);
		try {
			const _arr = F.tgeo_stboxes(this.ptr, _count);
			if (!_arr) return [];
			try {
				const _n = _view(_count, 4).getInt32(0, true);
				const _v = _view(_arr, _n * 80);
				const _out: STBox[] = [];
				for (let _i = 0; _i < _n; _i++) _out.push(wrapSTBox(_copy(_arr + _i * 80, 80)) as STBox);
				return _out;
			} finally {
				_free(_arr);
			}
		} finally {
			_free(_count);
		}
	}

	/** MEOS: tdisjoint_tgeo_geo, tdisjoint_tgeo_tgeo, chosen by the arguments' types */
	tdisjoint(gs: Geo | TGeo): Temporal | null {
		if (gs instanceof TGeo) return this._tdisjoint_tgeo_tgeo(gs as TGeo);
		if (gs instanceof Geo) return this._tdisjoint_tgeo_geo(gs as Geo);
		throw new TypeError(`TGeo.tdisjoint: no overload takes these arguments`);
	}

	/** MEOS: tdistance_tgeo_geo, tdistance_tgeo_tgeo, chosen by the arguments' types */
	tdistance(gs: Geo | TGeo, spheroid: boolean): Temporal | null {
		if (gs instanceof TGeo && typeof spheroid === 'boolean') return this._tdistance_tgeo_tgeo(gs as TGeo, spheroid as boolean);
		if (gs instanceof Geo && typeof spheroid === 'boolean') return this._tdistance_tgeo_geo(gs as Geo, spheroid as boolean);
		throw new TypeError(`TGeo.tdistance: no overload takes these arguments`);
	}

	/** MEOS: tdwithin_tgeo_geo, tdwithin_tgeo_tgeo, chosen by the arguments' types */
	tdwithin(gs: Geo | TGeo, dist: number, spheroid: boolean): Temporal | null {
		if (gs instanceof TGeo && typeof dist === 'number' && typeof spheroid === 'boolean') return this._tdwithin_tgeo_tgeo(gs as TGeo, dist as number, spheroid as boolean);
		if (gs instanceof Geo && typeof dist === 'number' && typeof spheroid === 'boolean') return this._tdwithin_tgeo_geo(gs as Geo, dist as number, spheroid as boolean);
		throw new TypeError(`TGeo.tdwithin: no overload takes these arguments`);
	}

	/** MEOS: teq_tgeo_geo, chosen by the arguments' types */
	override teq(gs: Geo | Temporal): Temporal | null {
		if (gs instanceof Geo) return this._teq_tgeo_geo(gs as Geo);
		return super.teq(gs as Temporal);
	}

	/** MEOS: tgeo_time_boxes */
	timeBoxes(duration: Interval, torigin: TimestampTz, bitmatrix: boolean, border_inc: boolean): STBox[] {
		const _duration = _putInterval(duration);
		const _count = _alloc(4);
		try {
			const _arr = F.tgeo_time_boxes(this.ptr, _duration, torigin, bitmatrix, border_inc, _count);
			if (!_arr) return [];
			try {
				const _n = _view(_count, 4).getInt32(0, true);
				const _v = _view(_arr, _n * 80);
				const _out: STBox[] = [];
				for (let _i = 0; _i < _n; _i++) _out.push(wrapSTBox(_copy(_arr + _i * 80, 80)) as STBox);
				return _out;
			} finally {
				_free(_arr);
			}
		} finally {
			_free(_duration);
			_free(_count);
		}
	}

	/** MEOS: tintersects_tgeo_geo, tintersects_tgeo_tgeo, chosen by the arguments' types */
	tintersects(gs: Geo | TGeo): Temporal | null {
		if (gs instanceof TGeo) return this._tintersects_tgeo_tgeo(gs as TGeo);
		if (gs instanceof Geo) return this._tintersects_tgeo_geo(gs as Geo);
		throw new TypeError(`TGeo.tintersects: no overload takes these arguments`);
	}

	/** MEOS: tne_tgeo_geo, chosen by the arguments' types */
	override tne(gs: Geo | Temporal): Temporal | null {
		if (gs instanceof Geo) return this._tne_tgeo_geo(gs as Geo);
		return super.tne(gs as Temporal);
	}

	/** MEOS: tgeo_translate */
	translate(deltax: number, deltay: number, deltaz: number): Temporal {
		return wrapTemporal(F.tgeo_translate(this.ptr, deltax, deltay, deltaz)) as Temporal;
	}

	/** MEOS: tgeo_transscale */
	transscale(deltax: number, deltay: number, xfactor: number, yfactor: number): Temporal {
		return wrapTemporal(F.tgeo_transscale(this.ptr, deltax, deltay, xfactor, yfactor)) as Temporal;
	}

	/** MEOS: tgeo_traversed_area */
	traversedArea(unary_union: boolean): Geo {
		return wrapGeo(F.tgeo_traversed_area(this.ptr, unary_union)) as Geo;
	}

	/** MEOS: ttouches_tgeo_geo */
	ttouches(gs: Geometry): Temporal | null {
		return wrapTemporalOrNull(F.ttouches_tgeo_geo(this.ptr, gs.ptr)) as Temporal | null;
	}

	/** MEOS: tgeo_value */
	value(): Geo {
		return wrapGeo(F.tgeo_value(this.ptr)) as Geo;
	}

	/** MEOS: tgeo_value_at_timestamptz */
	valueAtTimestamptz(t: TimestampTz, strict: boolean): Geo | null {
		return wrapGeoOrNull(F.tgeo_value_at_timestamptz(this.ptr, t, strict)) as Geo | null;
	}

	/** MEOS: tgeo_value_n */
	valueN(n: number): Geo | null {
		return wrapGeoOrNull(F.tgeo_value_n(this.ptr, n)) as Geo | null;
	}

	/** MEOS: tgeo_values */
	values(): Geo[] {
		const _count = _alloc(4);
		try {
			const _arr = F.tgeo_values(this.ptr, _count);
			if (!_arr) return [];
			try {
				const _n = _view(_count, 4).getInt32(0, true);
				const _v = _view(_arr, _n * 8);
				const _out: Geo[] = [];
				for (let _i = 0; _i < _n; _i++) _out.push(wrapGeo(Number(_v.getBigUint64(_i * 8, true))) as Geo);
				return _out;
			} finally {
				_free(_arr);
			}
		} finally {
			_free(_count);
		}
	}

	/** MEOS: tgeo_from_base_temp */
	static fromBaseTemp(gs: Geo, temp: Temporal): TGeo {
		return wrapTemporal(F.tgeo_from_base_temp(gs.ptr, temp.ptr)) as TGeo;
	}
}

/**
 * Temporal points. API-level intermediate (C predicate tpoint_type + the tpoint_* method family); NOT drawn in the manual Figure 7.1 (a conceptual diagram) but required so the tpoint_* methods bind to a class — see correction OM-M6.
 */
export class TPoint extends TGeo {

	/** MEOS: tpoint_angular_difference */
	angularDifference(): Temporal | null {
		return wrapTemporalOrNull(F.tpoint_angular_difference(this.ptr)) as Temporal | null;
	}

	/** MEOS: tpoint_at_elevation */
	atElevation(s: Span): Temporal | null {
		return wrapTemporalOrNull(F.tpoint_at_elevation(this.ptr, s.ptr)) as Temporal | null;
	}

	/** MEOS: tpoint_at_geom */
	override atGeom(gs: Geo): Temporal {
		return wrapTemporal(F.tpoint_at_geom(this.ptr, gs.ptr)) as Temporal;
	}

	/** MEOS: tpoint_at_value */
	override atValue(gs: Geo): Temporal {
		return wrapTemporal(F.tpoint_at_value(this.ptr, gs.ptr)) as Temporal;
	}

	/** MEOS: tpoint_azimuth */
	azimuth(): Temporal | null {
		return wrapTemporalOrNull(F.tpoint_azimuth(this.ptr)) as Temporal | null;
	}

	/** MEOS: bearing_tpoint_point */
	bearing(gs: Geo, invert: boolean): Temporal | null {
		return wrapTemporalOrNull(F.bearing_tpoint_point(this.ptr, gs.ptr, invert)) as Temporal | null;
	}

	/** MEOS: tpoint_cumulative_length */
	cumulativeLength(spheroid: boolean): Temporal {
		return wrapTemporal(F.tpoint_cumulative_length(this.ptr, spheroid)) as Temporal;
	}

	/** MEOS: tpoint_direction */
	direction(): number {
		return F.tpoint_direction(this.ptr);
	}

	/** MEOS: tpoint_get_x */
	getX(): Temporal {
		return wrapTemporal(F.tpoint_get_x(this.ptr)) as Temporal;
	}

	/** MEOS: tpoint_get_y */
	getY(): Temporal {
		return wrapTemporal(F.tpoint_get_y(this.ptr)) as Temporal;
	}

	/** MEOS: tpoint_get_z */
	getZ(): Temporal {
		return wrapTemporal(F.tpoint_get_z(this.ptr)) as Temporal;
	}

	/** MEOS: tpoint_is_simple */
	isSimple(): boolean {
		return F.tpoint_is_simple(this.ptr);
	}

	/** MEOS: tpoint_length */
	length(spheroid: boolean): number {
		return F.tpoint_length(this.ptr, spheroid);
	}

	/** MEOS: tpoint_make_simple */
	makeSimple(): Temporal[] {
		const _count = _alloc(4);
		try {
			const _arr = F.tpoint_make_simple(this.ptr, _count);
			if (!_arr) return [];
			try {
				const _n = _view(_count, 4).getInt32(0, true);
				const _v = _view(_arr, _n * 8);
				const _out: Temporal[] = [];
				for (let _i = 0; _i < _n; _i++) _out.push(wrapTemporal(Number(_v.getBigUint64(_i * 8, true))) as Temporal);
				return _out;
			} finally {
				_free(_arr);
			}
		} finally {
			_free(_count);
		}
	}

	/** MEOS: tpoint_minus_elevation */
	minusElevation(s: Span): Temporal | null {
		return wrapTemporalOrNull(F.tpoint_minus_elevation(this.ptr, s.ptr)) as Temporal | null;
	}

	/** MEOS: tpoint_minus_geom */
	override minusGeom(gs: Geo): Temporal {
		return wrapTemporal(F.tpoint_minus_geom(this.ptr, gs.ptr)) as Temporal;
	}

	/** MEOS: tpoint_minus_value */
	override minusValue(gs: Geo): Temporal {
		return wrapTemporal(F.tpoint_minus_value(this.ptr, gs.ptr)) as Temporal;
	}

	/** MEOS: tpoint_speed */
	speed(spheroid: boolean): Temporal | null {
		return wrapTemporalOrNull(F.tpoint_speed(this.ptr, spheroid)) as Temporal | null;
	}

	/** MEOS: tpoint_tfloat_to_geomeas */
	tfloatToGeomeas(measure: Temporal, segmentize: boolean): Geo | null {
		return wrapGeoOrNull(F.tpoint_tfloat_to_geomeas(this.ptr, measure.ptr, segmentize)) as Geo | null;
	}

	/** MEOS: tpoint_to_geomeas */
	toGeomeas(segmentize: boolean): Geo {
		return wrapGeo(F.tpoint_to_geomeas(this.ptr, segmentize)) as Geo;
	}

	/** MEOS: tpoint_trajectory */
	trajectory(unary_union: boolean): Geo {
		return wrapGeo(F.tpoint_trajectory(this.ptr, unary_union)) as Geo;
	}

	/** MEOS: tpoint_twcentroid */
	twcentroid(): Geo {
		return wrapGeo(F.tpoint_twcentroid(this.ptr)) as Geo;
	}

	/** MEOS: tpoint_from_base_temp */
	static fromBaseTemp(gs: Geo, temp: Temporal): TPoint {
		return wrapTemporal(F.tpoint_from_base_temp(gs.ptr, temp.ptr)) as TPoint;
	}
}

/**
 * The TGeogPoint class of the MEOS object model.
 */
export class TGeogPoint extends TPoint {

	/** The text MEOS writes this value as (MEOS: tspatial_as_text). */
	override toString(): string {
		return this.asText(15);
	}

	/** MEOS: tgeogpoint_great_circle_distance */
	greatCircleDistance(b: Temporal): Temporal {
		return wrapTemporal(F.tgeogpoint_great_circle_distance(this.ptr, b.ptr)) as Temporal;
	}

	/** MEOS: tgeogpoint_to_tgeography */
	toTgeography(): Temporal {
		return wrapTemporal(F.tgeogpoint_to_tgeography(this.ptr)) as Temporal;
	}

	/** MEOS: tgeogpoint_to_tgeompoint */
	toTgeompoint(): Temporal {
		return wrapTemporal(F.tgeogpoint_to_tgeompoint(this.ptr)) as Temporal;
	}

	/** MEOS: tgeogpoint_to_th3index */
	toTh3index(resolution: number, border_inc: boolean): Temporal {
		return wrapTemporal(F.tgeogpoint_to_th3index(this.ptr, resolution, border_inc)) as Temporal;
	}

	/** MEOS: tgeogpoint_to_tquadbin */
	toTquadbin(resolution: number, border_inc: boolean): Temporal {
		return wrapTemporal(F.tgeogpoint_to_tquadbin(this.ptr, resolution, border_inc)) as Temporal;
	}

	/** MEOS: tgeogpoint_to_ts2cell */
	toTs2cell(level: number, border_inc: boolean): Temporal {
		return wrapTemporal(F.tgeogpoint_to_ts2cell(this.ptr, level, border_inc)) as Temporal;
	}

	/** MEOS: temporal_from_wkb */
	static fromEWKB(wkb: Uint8Array): Temporal {
		return Temporal.fromWKB(wkb);
	}

	/** MEOS: tgeogpoint_in */
	static fromEWKT(str: string): TGeogPoint {
		return TGeogPoint.in(str);
	}

	/** MEOS: temporal_from_hexwkb */
	static fromHexEWKB(hexwkb: string): Temporal {
		return Temporal.fromHexWKB(hexwkb);
	}

	/** MEOS: tgeogpoint_from_mfjson */
	static fromMFJSON(str: string): TGeogPoint {
		return wrapTemporal(F.tgeogpoint_from_mfjson(str)) as TGeogPoint;
	}

	/** MEOS: tgeogpoint_in */
	static fromText(str: string): TGeogPoint {
		return TGeogPoint.in(str);
	}

	/** MEOS: tgeogpoint_in */
	static in(str: string): TGeogPoint {
		return wrapTemporal(F.tgeogpoint_in(str)) as TGeogPoint;
	}
}

/**
 * A TGeogPoint of subtype TInstant.
 */
export class TGeogPointInst extends TGeogPoint {
}

/**
 * A TGeogPoint of subtype TSequence.
 */
export class TGeogPointSeq extends TGeogPoint {
}

/**
 * A TGeogPoint of subtype TSequenceSet.
 */
export class TGeogPointSeqSet extends TGeogPoint {
}

/**
 * The TGeography class of the MEOS object model.
 */
export class TGeography extends TGeo {

	/** The text MEOS writes this value as (MEOS: tspatial_as_text). */
	override toString(): string {
		return this.asText(15);
	}

	/** MEOS: tgeography_to_tgeogpoint */
	toTgeogpoint(): Temporal {
		return wrapTemporal(F.tgeography_to_tgeogpoint(this.ptr)) as Temporal;
	}

	/** MEOS: tgeography_to_tgeometry */
	toTgeometry(): Temporal {
		return wrapTemporal(F.tgeography_to_tgeometry(this.ptr)) as Temporal;
	}

	/** MEOS: temporal_from_wkb */
	static fromEWKB(wkb: Uint8Array): Temporal {
		return Temporal.fromWKB(wkb);
	}

	/** MEOS: tgeography_in */
	static fromEWKT(str: string): TGeography {
		return TGeography.in(str);
	}

	/** MEOS: temporal_from_hexwkb */
	static fromHexEWKB(hexwkb: string): Temporal {
		return Temporal.fromHexWKB(hexwkb);
	}

	/** MEOS: tgeography_from_mfjson */
	static fromMFJSON(mfjson: string): TGeography {
		return wrapTemporal(F.tgeography_from_mfjson(mfjson)) as TGeography;
	}

	/** MEOS: tgeography_in */
	static fromText(str: string): TGeography {
		return TGeography.in(str);
	}

	/** MEOS: tgeography_in */
	static in(str: string): TGeography {
		return wrapTemporal(F.tgeography_in(str)) as TGeography;
	}
}

/**
 * A TGeography of subtype TInstant.
 */
export class TGeographyInst extends TGeography {
}

/**
 * A TGeography of subtype TSequence.
 */
export class TGeographySeq extends TGeography {
}

/**
 * A TGeography of subtype TSequenceSet.
 */
export class TGeographySeqSet extends TGeography {
}

/**
 * The TGeomPoint class of the MEOS object model.
 */
export class TGeomPoint extends TPoint {

	/** The text MEOS writes this value as (MEOS: tspatial_as_text). */
	override toString(): string {
		return this.asText(15);
	}

	/** MEOS: bearing_tpoint_tpoint */
	private _bearing_tpoint_tpoint(temp2: TGeomPoint): Temporal | null {
		return wrapTemporalOrNull(F.bearing_tpoint_tpoint(this.ptr, temp2.ptr)) as Temporal | null;
	}

	/** MEOS: atouches_tpoint_geo */
	atouches(gs: Geometry): number {
		return F.atouches_tpoint_geo(this.ptr, gs.ptr);
	}

	/** MEOS: bearing_tpoint_tpoint, chosen by the arguments' types */
	override bearing(temp2: TGeomPoint | Geo, arg1?: boolean): Temporal | null {
		if (temp2 instanceof TGeomPoint && arg1 === undefined) return this._bearing_tpoint_tpoint(temp2 as TGeomPoint);
		return super.bearing(temp2 as Geo, arg1 as boolean);
	}

	/** MEOS: etouches_tpoint_geo */
	etouches(gs: Geometry): number {
		return F.etouches_tpoint_geo(this.ptr, gs.ptr);
	}

	/** MEOS: tgeompoint_to_tgeogpoint */
	toTgeogpoint(): Temporal {
		return wrapTemporal(F.tgeompoint_to_tgeogpoint(this.ptr)) as Temporal;
	}

	/** MEOS: tgeompoint_to_tgeometry */
	toTgeometry(): Temporal {
		return wrapTemporal(F.tgeompoint_to_tgeometry(this.ptr)) as Temporal;
	}

	/** MEOS: tgeompoint_to_th3index */
	toTh3index(resolution: number, border_inc: boolean): Temporal {
		return wrapTemporal(F.tgeompoint_to_th3index(this.ptr, resolution, border_inc)) as Temporal;
	}

	/** MEOS: tgeompoint_to_tnpoint */
	toTnpoint(): Temporal | null {
		return wrapTemporalOrNull(F.tgeompoint_to_tnpoint(this.ptr)) as Temporal | null;
	}

	/** MEOS: tgeompoint_to_tquadbin */
	toTquadbin(resolution: number, border_inc: boolean): Temporal {
		return wrapTemporal(F.tgeompoint_to_tquadbin(this.ptr, resolution, border_inc)) as Temporal;
	}

	/** MEOS: tgeompoint_to_ts2cell */
	toTs2cell(level: number, border_inc: boolean): Temporal {
		return wrapTemporal(F.tgeompoint_to_ts2cell(this.ptr, level, border_inc)) as Temporal;
	}

	/** MEOS: temporal_from_wkb */
	static fromEWKB(wkb: Uint8Array): Temporal {
		return Temporal.fromWKB(wkb);
	}

	/** MEOS: tgeompoint_in */
	static fromEWKT(str: string): TGeomPoint {
		return TGeomPoint.in(str);
	}

	/** MEOS: temporal_from_hexwkb */
	static fromHexEWKB(hexwkb: string): Temporal {
		return Temporal.fromHexWKB(hexwkb);
	}

	/** MEOS: tgeompoint_from_mfjson */
	static fromMFJSON(str: string): TGeomPoint {
		return wrapTemporal(F.tgeompoint_from_mfjson(str)) as TGeomPoint;
	}

	/** MEOS: tgeompoint_in */
	static fromText(str: string): TGeomPoint {
		return TGeomPoint.in(str);
	}

	/** MEOS: tgeompoint_in */
	static in(str: string): TGeomPoint {
		return wrapTemporal(F.tgeompoint_in(str)) as TGeomPoint;
	}
}

/**
 * A TGeomPoint of subtype TInstant.
 */
export class TGeomPointInst extends TGeomPoint {
}

/**
 * A TGeomPoint of subtype TSequence.
 */
export class TGeomPointSeq extends TGeomPoint {
}

/**
 * A TGeomPoint of subtype TSequenceSet.
 */
export class TGeomPointSeqSet extends TGeomPoint {
}

/**
 * The TGeometry class of the MEOS object model.
 */
export class TGeometry extends TGeo {

	/** The text MEOS writes this value as (MEOS: tspatial_as_text). */
	override toString(): string {
		return this.asText(15);
	}

	/** MEOS: acontains_tgeo_geo */
	private _acontains_tgeo_geo(gs: Geometry): number {
		return F.acontains_tgeo_geo(this.ptr, gs.ptr);
	}

	/** MEOS: acontains_tgeo_tgeo */
	private _acontains_tgeo_tgeo(temp2: TGeometry): number {
		return F.acontains_tgeo_tgeo(this.ptr, temp2.ptr);
	}

	/** MEOS: acovers_tgeo_geo */
	private _acovers_tgeo_geo(gs: Geometry): number {
		return F.acovers_tgeo_geo(this.ptr, gs.ptr);
	}

	/** MEOS: acovers_tgeo_tgeo */
	private _acovers_tgeo_tgeo(temp2: TGeometry): number {
		return F.acovers_tgeo_tgeo(this.ptr, temp2.ptr);
	}

	/** MEOS: atouches_tgeo_geo */
	private _atouches_tgeo_geo(gs: Geometry): number {
		return F.atouches_tgeo_geo(this.ptr, gs.ptr);
	}

	/** MEOS: atouches_tgeo_tgeo */
	private _atouches_tgeo_tgeo(temp2: TGeometry): number {
		return F.atouches_tgeo_tgeo(this.ptr, temp2.ptr);
	}

	/** MEOS: econtains_tgeo_geo */
	private _econtains_tgeo_geo(gs: Geometry): number {
		return F.econtains_tgeo_geo(this.ptr, gs.ptr);
	}

	/** MEOS: econtains_tgeo_tgeo */
	private _econtains_tgeo_tgeo(temp2: TGeometry): number {
		return F.econtains_tgeo_tgeo(this.ptr, temp2.ptr);
	}

	/** MEOS: ecovers_tgeo_geo */
	private _ecovers_tgeo_geo(gs: Geometry): number {
		return F.ecovers_tgeo_geo(this.ptr, gs.ptr);
	}

	/** MEOS: ecovers_tgeo_tgeo */
	private _ecovers_tgeo_tgeo(temp2: TGeometry): number {
		return F.ecovers_tgeo_tgeo(this.ptr, temp2.ptr);
	}

	/** MEOS: etouches_tgeo_geo */
	private _etouches_tgeo_geo(gs: Geometry): number {
		return F.etouches_tgeo_geo(this.ptr, gs.ptr);
	}

	/** MEOS: etouches_tgeo_tgeo */
	private _etouches_tgeo_tgeo(temp2: TGeometry): number {
		return F.etouches_tgeo_tgeo(this.ptr, temp2.ptr);
	}

	/** MEOS: tcontains_tgeo_geo */
	private _tcontains_tgeo_geo(gs: Geometry): Temporal | null {
		return wrapTemporalOrNull(F.tcontains_tgeo_geo(this.ptr, gs.ptr)) as Temporal | null;
	}

	/** MEOS: tcontains_tgeo_tgeo */
	private _tcontains_tgeo_tgeo(temp2: TGeometry): Temporal | null {
		return wrapTemporalOrNull(F.tcontains_tgeo_tgeo(this.ptr, temp2.ptr)) as Temporal | null;
	}

	/** MEOS: tcovers_tgeo_geo */
	private _tcovers_tgeo_geo(gs: Geometry): Temporal | null {
		return wrapTemporalOrNull(F.tcovers_tgeo_geo(this.ptr, gs.ptr)) as Temporal | null;
	}

	/** MEOS: tcovers_tgeo_tgeo */
	private _tcovers_tgeo_tgeo(temp2: TGeometry): Temporal | null {
		return wrapTemporalOrNull(F.tcovers_tgeo_tgeo(this.ptr, temp2.ptr)) as Temporal | null;
	}

	/** MEOS: ttouches_tgeo_tgeo */
	private _ttouches_tgeo_tgeo(temp2: TGeometry): Temporal | null {
		return wrapTemporalOrNull(F.ttouches_tgeo_tgeo(this.ptr, temp2.ptr)) as Temporal | null;
	}

	/** MEOS: acontains_tgeo_geo, acontains_tgeo_tgeo, chosen by the arguments' types */
	acontains(gs: Geometry | TGeometry): number {
		if (gs instanceof TGeometry) return this._acontains_tgeo_tgeo(gs as TGeometry);
		if (gs instanceof Geometry) return this._acontains_tgeo_geo(gs as Geometry);
		throw new TypeError(`TGeometry.acontains: no overload takes these arguments`);
	}

	/** MEOS: acovers_tgeo_geo, acovers_tgeo_tgeo, chosen by the arguments' types */
	acovers(gs: Geometry | TGeometry): number {
		if (gs instanceof TGeometry) return this._acovers_tgeo_tgeo(gs as TGeometry);
		if (gs instanceof Geometry) return this._acovers_tgeo_geo(gs as Geometry);
		throw new TypeError(`TGeometry.acovers: no overload takes these arguments`);
	}

	/** MEOS: atouches_tgeo_geo, atouches_tgeo_tgeo, chosen by the arguments' types */
	atouches(gs: Geometry | TGeometry): number {
		if (gs instanceof TGeometry) return this._atouches_tgeo_tgeo(gs as TGeometry);
		if (gs instanceof Geometry) return this._atouches_tgeo_geo(gs as Geometry);
		throw new TypeError(`TGeometry.atouches: no overload takes these arguments`);
	}

	/** MEOS: econtains_tgeo_geo, econtains_tgeo_tgeo, chosen by the arguments' types */
	econtains(gs: Geometry | TGeometry): number {
		if (gs instanceof TGeometry) return this._econtains_tgeo_tgeo(gs as TGeometry);
		if (gs instanceof Geometry) return this._econtains_tgeo_geo(gs as Geometry);
		throw new TypeError(`TGeometry.econtains: no overload takes these arguments`);
	}

	/** MEOS: ecovers_tgeo_geo, ecovers_tgeo_tgeo, chosen by the arguments' types */
	ecovers(gs: Geometry | TGeometry): number {
		if (gs instanceof TGeometry) return this._ecovers_tgeo_tgeo(gs as TGeometry);
		if (gs instanceof Geometry) return this._ecovers_tgeo_geo(gs as Geometry);
		throw new TypeError(`TGeometry.ecovers: no overload takes these arguments`);
	}

	/** MEOS: etouches_tgeo_geo, etouches_tgeo_tgeo, chosen by the arguments' types */
	etouches(gs: Geometry | TGeometry): number {
		if (gs instanceof TGeometry) return this._etouches_tgeo_tgeo(gs as TGeometry);
		if (gs instanceof Geometry) return this._etouches_tgeo_geo(gs as Geometry);
		throw new TypeError(`TGeometry.etouches: no overload takes these arguments`);
	}

	/** MEOS: tcontains_tgeo_geo, tcontains_tgeo_tgeo, chosen by the arguments' types */
	tcontains(gs: Geometry | TGeometry): Temporal | null {
		if (gs instanceof TGeometry) return this._tcontains_tgeo_tgeo(gs as TGeometry);
		if (gs instanceof Geometry) return this._tcontains_tgeo_geo(gs as Geometry);
		throw new TypeError(`TGeometry.tcontains: no overload takes these arguments`);
	}

	/** MEOS: tcovers_tgeo_geo, tcovers_tgeo_tgeo, chosen by the arguments' types */
	tcovers(gs: Geometry | TGeometry): Temporal | null {
		if (gs instanceof TGeometry) return this._tcovers_tgeo_tgeo(gs as TGeometry);
		if (gs instanceof Geometry) return this._tcovers_tgeo_geo(gs as Geometry);
		throw new TypeError(`TGeometry.tcovers: no overload takes these arguments`);
	}

	/** MEOS: tgeometry_to_tcbuffer */
	toTcbuffer(): Temporal {
		return wrapTemporal(F.tgeometry_to_tcbuffer(this.ptr)) as Temporal;
	}

	/** MEOS: tgeometry_to_tgeography */
	toTgeography(): Temporal {
		return wrapTemporal(F.tgeometry_to_tgeography(this.ptr)) as Temporal;
	}

	/** MEOS: tgeometry_to_tgeompoint */
	toTgeompoint(): Temporal {
		return wrapTemporal(F.tgeometry_to_tgeompoint(this.ptr)) as Temporal;
	}

	/** MEOS: ttouches_tgeo_tgeo, chosen by the arguments' types */
	override ttouches(temp2: TGeometry | Geometry): Temporal | null {
		if (temp2 instanceof TGeometry) return this._ttouches_tgeo_tgeo(temp2 as TGeometry);
		return super.ttouches(temp2 as Geometry);
	}

	/** MEOS: temporal_from_wkb */
	static fromEWKB(wkb: Uint8Array): Temporal {
		return Temporal.fromWKB(wkb);
	}

	/** MEOS: tgeometry_in */
	static fromEWKT(str: string): TGeometry {
		return TGeometry.in(str);
	}

	/** MEOS: temporal_from_hexwkb */
	static fromHexEWKB(hexwkb: string): Temporal {
		return Temporal.fromHexWKB(hexwkb);
	}

	/** MEOS: tgeometry_from_mfjson */
	static fromMFJSON(str: string): TGeometry {
		return wrapTemporal(F.tgeometry_from_mfjson(str)) as TGeometry;
	}

	/** MEOS: tgeometry_in */
	static fromText(str: string): TGeometry {
		return TGeometry.in(str);
	}

	/** MEOS: tgeometry_in */
	static in(str: string): TGeometry {
		return wrapTemporal(F.tgeometry_in(str)) as TGeometry;
	}
}

/**
 * A TGeometry of subtype TInstant.
 */
export class TGeometryInst extends TGeometry {
}

/**
 * A TGeometry of subtype TSequence.
 */
export class TGeometrySeq extends TGeometry {
}

/**
 * A TGeometry of subtype TSequenceSet.
 */
export class TGeometrySeqSet extends TGeometry {
}

/**
 * The TH3Index class of the MEOS object model.
 */
export class TH3Index extends TCellIndex {

	/** The text MEOS writes this value as (MEOS: th3index_out). */
	override toString(): string {
		return this.out();
	}

	/** MEOS: always_eq_th3index_h3index */
	private _always_eq_th3index_h3index(cell: H3Index): number {
		return F.always_eq_th3index_h3index(this.ptr, cell);
	}

	/** MEOS: always_eq_th3index_th3index */
	private _always_eq_th3index_th3index(temp2: TH3Index): number {
		return F.always_eq_th3index_th3index(this.ptr, temp2.ptr);
	}

	/** MEOS: always_ne_th3index_h3index */
	private _always_ne_th3index_h3index(cell: H3Index): number {
		return F.always_ne_th3index_h3index(this.ptr, cell);
	}

	/** MEOS: always_ne_th3index_th3index */
	private _always_ne_th3index_th3index(temp2: TH3Index): number {
		return F.always_ne_th3index_th3index(this.ptr, temp2.ptr);
	}

	/** MEOS: ever_eq_th3index_h3index */
	private _ever_eq_th3index_h3index(cell: H3Index): number {
		return F.ever_eq_th3index_h3index(this.ptr, cell);
	}

	/** MEOS: ever_eq_th3index_h3indexset */
	private _ever_eq_th3index_h3indexset(cells: H3IndexSet): number {
		return F.ever_eq_th3index_h3indexset(this.ptr, cells.ptr);
	}

	/** MEOS: ever_eq_th3index_th3index */
	private _ever_eq_th3index_th3index(temp2: TH3Index): number {
		return F.ever_eq_th3index_th3index(this.ptr, temp2.ptr);
	}

	/** MEOS: ever_ne_th3index_h3index */
	private _ever_ne_th3index_h3index(cell: H3Index): number {
		return F.ever_ne_th3index_h3index(this.ptr, cell);
	}

	/** MEOS: ever_ne_th3index_th3index */
	private _ever_ne_th3index_th3index(temp2: TH3Index): number {
		return F.ever_ne_th3index_th3index(this.ptr, temp2.ptr);
	}

	/** MEOS: teq_th3index_h3index */
	private _teq_th3index_h3index(cell: H3Index): Temporal {
		return wrapTemporal(F.teq_th3index_h3index(this.ptr, cell)) as Temporal;
	}

	/** MEOS: teq_th3index_th3index */
	private _teq_th3index_th3index(temp2: Temporal): Temporal {
		return wrapTemporal(F.teq_th3index_th3index(this.ptr, temp2.ptr)) as Temporal;
	}

	/** MEOS: tne_th3index_h3index */
	private _tne_th3index_h3index(cell: H3Index): Temporal {
		return wrapTemporal(F.tne_th3index_h3index(this.ptr, cell)) as Temporal;
	}

	/** MEOS: tne_th3index_th3index */
	private _tne_th3index_th3index(temp2: Temporal): Temporal {
		return wrapTemporal(F.tne_th3index_th3index(this.ptr, temp2.ptr)) as Temporal;
	}

	/** MEOS: always_eq_th3index_h3index, always_eq_th3index_th3index, chosen by the arguments' types */
	override alwaysEq(cell: H3Index | TH3Index | Temporal): number {
		if (cell instanceof TH3Index) return this._always_eq_th3index_th3index(cell as TH3Index);
		if (typeof cell === 'bigint') return this._always_eq_th3index_h3index(cell as H3Index);
		return super.alwaysEq(cell as Temporal);
	}

	/** MEOS: always_ne_th3index_h3index, always_ne_th3index_th3index, chosen by the arguments' types */
	override alwaysNe(cell: H3Index | TH3Index | Temporal): number {
		if (cell instanceof TH3Index) return this._always_ne_th3index_th3index(cell as TH3Index);
		if (typeof cell === 'bigint') return this._always_ne_th3index_h3index(cell as H3Index);
		return super.alwaysNe(cell as Temporal);
	}

	/** MEOS: th3index_are_neighbor_cells */
	areNeighborCells(dest: Temporal): Temporal {
		return wrapTemporal(F.th3index_are_neighbor_cells(this.ptr, dest.ptr)) as Temporal;
	}

	/** MEOS: th3index_at_value */
	atValue(cell: H3Index): Temporal | null {
		return wrapTemporalOrNull(F.th3index_at_value(this.ptr, cell)) as Temporal | null;
	}

	/** MEOS: th3index_cells_to_directed_edge */
	cellsToDirectedEdge(dest: Temporal): Temporal {
		return wrapTemporal(F.th3index_cells_to_directed_edge(this.ptr, dest.ptr)) as Temporal;
	}

	/** MEOS: th3index_cell_to_center_child */
	cellToCenterChild(resolution: number): Temporal {
		return wrapTemporal(F.th3index_cell_to_center_child(this.ptr, resolution)) as Temporal;
	}

	/** MEOS: th3index_cell_to_center_child_next */
	cellToCenterChildNext(): Temporal {
		return wrapTemporal(F.th3index_cell_to_center_child_next(this.ptr)) as Temporal;
	}

	/** MEOS: th3index_cell_to_child_pos */
	cellToChildPos(parent_res: number): Temporal {
		return wrapTemporal(F.th3index_cell_to_child_pos(this.ptr, parent_res)) as Temporal;
	}

	/** MEOS: th3index_cell_to_local_ij */
	cellToLocalIj(cell: Temporal): Temporal {
		return wrapTemporal(F.th3index_cell_to_local_ij(this.ptr, cell.ptr)) as Temporal;
	}

	/** MEOS: th3index_cell_to_parent_next */
	cellToParentNext(): Temporal {
		return wrapTemporal(F.th3index_cell_to_parent_next(this.ptr)) as Temporal;
	}

	/** MEOS: th3index_cell_to_vertex */
	cellToVertex(vertex_num: number): Temporal {
		return wrapTemporal(F.th3index_cell_to_vertex(this.ptr, vertex_num)) as Temporal;
	}

	/** MEOS: th3index_child_pos_to_cell */
	childPosToCell(parent: Temporal, child_res: number): Temporal {
		return wrapTemporal(F.th3index_child_pos_to_cell(this.ptr, parent.ptr, child_res)) as Temporal;
	}

	/** MEOS: th3index_directed_edge_to_boundary */
	directedEdgeToBoundary(): Temporal {
		return wrapTemporal(F.th3index_directed_edge_to_boundary(this.ptr)) as Temporal;
	}

	/** MEOS: th3index_edge_length */
	edgeLength(): Temporal {
		return wrapTemporal(F.th3index_edge_length(this.ptr)) as Temporal;
	}

	/** MEOS: th3index_end_value */
	endValue(): H3Index {
		return F.th3index_end_value(this.ptr);
	}

	/** MEOS: ever_eq_th3index_h3index, ever_eq_th3index_th3index, ever_eq_th3index_h3indexset, chosen by the arguments' types */
	override everEq(cell: H3Index | TH3Index | H3IndexSet | Temporal): number {
		if (cell instanceof TH3Index) return this._ever_eq_th3index_th3index(cell as TH3Index);
		if (cell instanceof H3IndexSet) return this._ever_eq_th3index_h3indexset(cell as H3IndexSet);
		if (typeof cell === 'bigint') return this._ever_eq_th3index_h3index(cell as H3Index);
		return super.everEq(cell as Temporal);
	}

	/** MEOS: ever_ne_th3index_h3index, ever_ne_th3index_th3index, chosen by the arguments' types */
	override everNe(cell: H3Index | TH3Index | Temporal): number {
		if (cell instanceof TH3Index) return this._ever_ne_th3index_th3index(cell as TH3Index);
		if (typeof cell === 'bigint') return this._ever_ne_th3index_h3index(cell as H3Index);
		return super.everNe(cell as Temporal);
	}

	/** MEOS: th3index_get_base_cell_number */
	getBaseCellNumber(): Temporal {
		return wrapTemporal(F.th3index_get_base_cell_number(this.ptr)) as Temporal;
	}

	/** MEOS: th3index_get_directed_edge_destination */
	getDirectedEdgeDestination(): Temporal {
		return wrapTemporal(F.th3index_get_directed_edge_destination(this.ptr)) as Temporal;
	}

	/** MEOS: th3index_get_directed_edge_origin */
	getDirectedEdgeOrigin(): Temporal {
		return wrapTemporal(F.th3index_get_directed_edge_origin(this.ptr)) as Temporal;
	}

	/** MEOS: th3index_grid_distance */
	gridDistance(dest: Temporal): Temporal {
		return wrapTemporal(F.th3index_grid_distance(this.ptr, dest.ptr)) as Temporal;
	}

	/** MEOS: th3index_is_pentagon */
	isPentagon(): Temporal {
		return wrapTemporal(F.th3index_is_pentagon(this.ptr)) as Temporal;
	}

	/** MEOS: th3index_is_res_class_iii */
	isResClassIii(): Temporal {
		return wrapTemporal(F.th3index_is_res_class_iii(this.ptr)) as Temporal;
	}

	/** MEOS: th3index_is_valid_directed_edge */
	isValidDirectedEdge(): Temporal {
		return wrapTemporal(F.th3index_is_valid_directed_edge(this.ptr)) as Temporal;
	}

	/** MEOS: th3index_is_valid_vertex */
	isValidVertex(): Temporal {
		return wrapTemporal(F.th3index_is_valid_vertex(this.ptr)) as Temporal;
	}

	/** MEOS: th3index_local_ij_to_cell */
	localIjToCell(coord: Temporal): Temporal {
		return wrapTemporal(F.th3index_local_ij_to_cell(this.ptr, coord.ptr)) as Temporal;
	}

	/** MEOS: th3index_minus_value */
	minusValue(cell: H3Index): Temporal | null {
		return wrapTemporalOrNull(F.th3index_minus_value(this.ptr, cell)) as Temporal | null;
	}

	/** MEOS: th3index_out */
	override out(): string {
		return F.th3index_out(this.ptr);
	}

	/** MEOS: always_eq_h3index_th3index */
	ralwaysEq(cell: H3Index): number {
		return F.always_eq_h3index_th3index(cell, this.ptr);
	}

	/** MEOS: always_ne_h3index_th3index */
	ralwaysNe(cell: H3Index): number {
		return F.always_ne_h3index_th3index(cell, this.ptr);
	}

	/** MEOS: ever_eq_h3index_th3index */
	reverEq(cell: H3Index): number {
		return F.ever_eq_h3index_th3index(cell, this.ptr);
	}

	/** MEOS: ever_ne_h3index_th3index */
	reverNe(cell: H3Index): number {
		return F.ever_ne_h3index_th3index(cell, this.ptr);
	}

	/** MEOS: teq_h3index_th3index */
	rteq(cell: H3Index): Temporal {
		return wrapTemporal(F.teq_h3index_th3index(cell, this.ptr)) as Temporal;
	}

	/** MEOS: tne_h3index_th3index */
	rtne(cell: H3Index): Temporal {
		return wrapTemporal(F.tne_h3index_th3index(cell, this.ptr)) as Temporal;
	}

	/** MEOS: th3index_start_value */
	startValue(): H3Index {
		return F.th3index_start_value(this.ptr);
	}

	/** MEOS: teq_th3index_h3index, teq_th3index_th3index, chosen by the arguments' types */
	override teq(cell: H3Index | Temporal): Temporal | null {
		if (cell instanceof Temporal) return this._teq_th3index_th3index(cell as Temporal);
		if (typeof cell === 'bigint') return this._teq_th3index_h3index(cell as H3Index);
		return super.teq(cell as Temporal);
	}

	/** MEOS: tne_th3index_h3index, tne_th3index_th3index, chosen by the arguments' types */
	override tne(cell: H3Index | Temporal): Temporal | null {
		if (cell instanceof Temporal) return this._tne_th3index_th3index(cell as Temporal);
		if (typeof cell === 'bigint') return this._tne_th3index_h3index(cell as H3Index);
		return super.tne(cell as Temporal);
	}

	/** MEOS: th3index_to_tbigint */
	toTbigint(): Temporal {
		return wrapTemporal(F.th3index_to_tbigint(this.ptr)) as Temporal;
	}

	/** MEOS: th3index_to_tgeogpoint */
	toTgeogpoint(): Temporal {
		return wrapTemporal(F.th3index_to_tgeogpoint(this.ptr)) as Temporal;
	}

	/** MEOS: th3index_to_tgeompoint */
	toTgeompoint(): Temporal {
		return wrapTemporal(F.th3index_to_tgeompoint(this.ptr)) as Temporal;
	}

	/** MEOS: th3index_value */
	value(): H3Index {
		return F.th3index_value(this.ptr);
	}

	/** MEOS: th3index_value_at_timestamptz */
	valueAtTimestamptz(t: TimestampTz, strict: boolean): H3Index {
		return F.th3index_value_at_timestamptz(this.ptr, t, strict);
	}

	/** MEOS: th3index_value_n */
	valueN(n: number): H3Index {
		return F.th3index_value_n(this.ptr, n);
	}

	/** MEOS: th3index_values */
	values(): bigint[] {
		const _count = _alloc(4);
		try {
			const _arr = F.th3index_values(this.ptr, _count);
			if (!_arr) return [];
			try {
				const _n = _view(_count, 4).getInt32(0, true);
				const _v = _view(_arr, _n * 8);
				const _out: bigint[] = [];
				for (let _i = 0; _i < _n; _i++) _out.push(_v.getBigUint64(_i * 8, true));
				return _out;
			} finally {
				_free(_arr);
			}
		} finally {
			_free(_count);
		}
	}

	/** MEOS: th3index_vertex_to_latlng */
	vertexToLatlng(): Temporal {
		return wrapTemporal(F.th3index_vertex_to_latlng(this.ptr)) as Temporal;
	}

	/** MEOS: th3index_from_base_temp */
	static fromBaseTemp(value: H3Index, temp: Temporal): TH3Index {
		return wrapTemporal(F.th3index_from_base_temp(value, temp.ptr)) as TH3Index;
	}

	/** MEOS: temporal_from_wkb */
	static fromEWKB(wkb: Uint8Array): Temporal {
		return Temporal.fromWKB(wkb);
	}

	/** MEOS: th3index_in */
	static fromEWKT(str: string): TH3Index {
		return TH3Index.in(str);
	}

	/** MEOS: temporal_from_hexwkb */
	static fromHexEWKB(hexwkb: string): Temporal {
		return Temporal.fromHexWKB(hexwkb);
	}

	/** MEOS: th3index_from_mfjson */
	static fromMFJSON(mfjson: string): TH3Index {
		return wrapTemporal(F.th3index_from_mfjson(mfjson)) as TH3Index;
	}

	/** MEOS: th3index_in */
	static fromText(str: string): TH3Index {
		return TH3Index.in(str);
	}

	/** MEOS: th3index_in */
	static in(str: string): TH3Index {
		return wrapTemporal(F.th3index_in(str)) as TH3Index;
	}

	/** MEOS: th3index_make */
	static make(value: H3Index, t: TimestampTz): TH3Index {
		return wrapTemporal(F.th3index_make(value, t)) as TH3Index;
	}
}

/**
 * A TH3Index of subtype TInstant.
 */
export class TH3IndexInst extends TH3Index {

	/** MEOS: th3indexinst_make */
	static make(value: H3Index, t: TimestampTz): TH3IndexInst {
		return wrapTemporal(F.th3indexinst_make(value, t)) as TH3IndexInst;
	}
}

/**
 * A TH3Index of subtype TSequence.
 */
export class TH3IndexSeq extends TH3Index {

	/** MEOS: th3indexseq_from_base_tstzset */
	static fromBaseTstzset(value: H3Index, s: Set): TH3IndexSeq {
		return wrapTemporal(F.th3indexseq_from_base_tstzset(value, s.ptr)) as TH3IndexSeq;
	}

	/** MEOS: th3indexseq_from_base_tstzspan */
	static fromBaseTstzspan(value: H3Index, s: Span): TH3IndexSeq {
		return wrapTemporal(F.th3indexseq_from_base_tstzspan(value, s.ptr)) as TH3IndexSeq;
	}
}

/**
 * A TH3Index of subtype TSequenceSet.
 */
export class TH3IndexSeqSet extends TH3Index {

	/** MEOS: th3indexseqset_from_base_tstzspanset */
	static fromBaseTstzspanset(value: H3Index, ss: SpanSet): TH3IndexSeqSet {
		return wrapTemporal(F.th3indexseqset_from_base_tstzspanset(value, ss.ptr)) as TH3IndexSeqSet;
	}
}

/**
 * The TInstant class of the MEOS object model.
 */
export class TInstant extends Temporal {

	/** MEOS: tinstant_timestamptz */
	timestamptz(): TimestampTz {
		return F.tinstant_timestamptz(this.ptr);
	}
}

/**
 * The TInt class of the MEOS object model.
 */
export class TInt extends TNumber {

	/** The text MEOS writes this value as (MEOS: tint_out). */
	override toString(): string {
		return this.out();
	}

	/** MEOS: add_tint_int */
	private _add_tint_int(i: number): Temporal {
		return wrapTemporal(F.add_tint_int(this.ptr, i)) as Temporal;
	}

	/** MEOS: always_eq_tint_int */
	private _always_eq_tint_int(i: number): number {
		return F.always_eq_tint_int(this.ptr, i);
	}

	/** MEOS: always_ge_tint_int */
	private _always_ge_tint_int(i: number): number {
		return F.always_ge_tint_int(this.ptr, i);
	}

	/** MEOS: always_gt_tint_int */
	private _always_gt_tint_int(i: number): number {
		return F.always_gt_tint_int(this.ptr, i);
	}

	/** MEOS: always_le_tint_int */
	private _always_le_tint_int(i: number): number {
		return F.always_le_tint_int(this.ptr, i);
	}

	/** MEOS: always_lt_tint_int */
	private _always_lt_tint_int(i: number): number {
		return F.always_lt_tint_int(this.ptr, i);
	}

	/** MEOS: always_ne_tint_int */
	private _always_ne_tint_int(i: number): number {
		return F.always_ne_tint_int(this.ptr, i);
	}

	/** MEOS: div_tint_int */
	private _div_tint_int(i: number): Temporal {
		return wrapTemporal(F.div_tint_int(this.ptr, i)) as Temporal;
	}

	/** MEOS: ever_eq_tint_int */
	private _ever_eq_tint_int(i: number): number {
		return F.ever_eq_tint_int(this.ptr, i);
	}

	/** MEOS: ever_ge_tint_int */
	private _ever_ge_tint_int(i: number): number {
		return F.ever_ge_tint_int(this.ptr, i);
	}

	/** MEOS: ever_gt_tint_int */
	private _ever_gt_tint_int(i: number): number {
		return F.ever_gt_tint_int(this.ptr, i);
	}

	/** MEOS: ever_le_tint_int */
	private _ever_le_tint_int(i: number): number {
		return F.ever_le_tint_int(this.ptr, i);
	}

	/** MEOS: ever_lt_tint_int */
	private _ever_lt_tint_int(i: number): number {
		return F.ever_lt_tint_int(this.ptr, i);
	}

	/** MEOS: ever_ne_tint_int */
	private _ever_ne_tint_int(i: number): number {
		return F.ever_ne_tint_int(this.ptr, i);
	}

	/** MEOS: mul_tint_int */
	private _mul_tint_int(i: number): Temporal {
		return wrapTemporal(F.mul_tint_int(this.ptr, i)) as Temporal;
	}

	/** MEOS: nad_tint_int */
	private _nad_tint_int(i: number): number {
		return F.nad_tint_int(this.ptr, i);
	}

	/** MEOS: nad_tint_intspan */
	private _nad_tint_intspan(s: IntSpan): number {
		return F.nad_tint_intspan(this.ptr, s.ptr);
	}

	/** MEOS: nad_tint_tbox */
	private _nad_tint_tbox(box: TBox): number {
		return F.nad_tint_tbox(this.ptr, box.ptr);
	}

	/** MEOS: nad_tint_tint */
	private _nad_tint_tint(temp2: TInt): number {
		return F.nad_tint_tint(this.ptr, temp2.ptr);
	}

	/** MEOS: sub_tint_int */
	private _sub_tint_int(i: number): Temporal {
		return wrapTemporal(F.sub_tint_int(this.ptr, i)) as Temporal;
	}

	/** MEOS: tdistance_tint_int */
	private _tdistance_tint_int(i: number): Temporal | null {
		return wrapTemporalOrNull(F.tdistance_tint_int(this.ptr, i)) as Temporal | null;
	}

	/** MEOS: teq_tint_int */
	private _teq_tint_int(i: number): Temporal {
		return wrapTemporal(F.teq_tint_int(this.ptr, i)) as Temporal;
	}

	/** MEOS: tge_tint_int */
	private _tge_tint_int(i: number): Temporal {
		return wrapTemporal(F.tge_tint_int(this.ptr, i)) as Temporal;
	}

	/** MEOS: tgt_tint_int */
	private _tgt_tint_int(i: number): Temporal {
		return wrapTemporal(F.tgt_tint_int(this.ptr, i)) as Temporal;
	}

	/** MEOS: tle_tint_int */
	private _tle_tint_int(i: number): Temporal {
		return wrapTemporal(F.tle_tint_int(this.ptr, i)) as Temporal;
	}

	/** MEOS: tlt_tint_int */
	private _tlt_tint_int(i: number): Temporal {
		return wrapTemporal(F.tlt_tint_int(this.ptr, i)) as Temporal;
	}

	/** MEOS: tne_tint_int */
	private _tne_tint_int(i: number): Temporal {
		return wrapTemporal(F.tne_tint_int(this.ptr, i)) as Temporal;
	}

	/** MEOS: add_tint_int, chosen by the arguments' types */
	override add(i: number | TNumber): Temporal | null {
		if (typeof i === 'number') return this._add_tint_int(i as number);
		return super.add(i as TNumber);
	}

	/** MEOS: always_eq_tint_int, chosen by the arguments' types */
	override alwaysEq(i: number | Temporal): number {
		if (typeof i === 'number') return this._always_eq_tint_int(i as number);
		return super.alwaysEq(i as Temporal);
	}

	/** MEOS: always_ge_tint_int, chosen by the arguments' types */
	override alwaysGe(i: number | Temporal): number {
		if (typeof i === 'number') return this._always_ge_tint_int(i as number);
		return super.alwaysGe(i as Temporal);
	}

	/** MEOS: always_gt_tint_int, chosen by the arguments' types */
	override alwaysGt(i: number | Temporal): number {
		if (typeof i === 'number') return this._always_gt_tint_int(i as number);
		return super.alwaysGt(i as Temporal);
	}

	/** MEOS: always_le_tint_int, chosen by the arguments' types */
	override alwaysLe(i: number | Temporal): number {
		if (typeof i === 'number') return this._always_le_tint_int(i as number);
		return super.alwaysLe(i as Temporal);
	}

	/** MEOS: always_lt_tint_int, chosen by the arguments' types */
	override alwaysLt(i: number | Temporal): number {
		if (typeof i === 'number') return this._always_lt_tint_int(i as number);
		return super.alwaysLt(i as Temporal);
	}

	/** MEOS: always_ne_tint_int, chosen by the arguments' types */
	override alwaysNe(i: number | Temporal): number {
		if (typeof i === 'number') return this._always_ne_tint_int(i as number);
		return super.alwaysNe(i as Temporal);
	}

	/** MEOS: tint_out */
	asText(): string {
		return this.out();
	}

	/** MEOS: tint_at_value */
	atValue(i: number): Temporal | null {
		return wrapTemporalOrNull(F.tint_at_value(this.ptr, i)) as Temporal | null;
	}

	/** MEOS: div_tint_int, chosen by the arguments' types */
	override div(i: number | TNumber): Temporal | null {
		if (typeof i === 'number') return this._div_tint_int(i as number);
		return super.div(i as TNumber);
	}

	/** MEOS: tint_end_value */
	endValue(): number {
		return F.tint_end_value(this.ptr);
	}

	/** MEOS: ever_eq_tint_int, chosen by the arguments' types */
	override everEq(i: number | Temporal): number {
		if (typeof i === 'number') return this._ever_eq_tint_int(i as number);
		return super.everEq(i as Temporal);
	}

	/** MEOS: ever_ge_tint_int, chosen by the arguments' types */
	override everGe(i: number | Temporal): number {
		if (typeof i === 'number') return this._ever_ge_tint_int(i as number);
		return super.everGe(i as Temporal);
	}

	/** MEOS: ever_gt_tint_int, chosen by the arguments' types */
	override everGt(i: number | Temporal): number {
		if (typeof i === 'number') return this._ever_gt_tint_int(i as number);
		return super.everGt(i as Temporal);
	}

	/** MEOS: ever_le_tint_int, chosen by the arguments' types */
	override everLe(i: number | Temporal): number {
		if (typeof i === 'number') return this._ever_le_tint_int(i as number);
		return super.everLe(i as Temporal);
	}

	/** MEOS: ever_lt_tint_int, chosen by the arguments' types */
	override everLt(i: number | Temporal): number {
		if (typeof i === 'number') return this._ever_lt_tint_int(i as number);
		return super.everLt(i as Temporal);
	}

	/** MEOS: ever_ne_tint_int, chosen by the arguments' types */
	override everNe(i: number | Temporal): number {
		if (typeof i === 'number') return this._ever_ne_tint_int(i as number);
		return super.everNe(i as Temporal);
	}

	/** MEOS: tint_max_value */
	maxValue(): number {
		return F.tint_max_value(this.ptr);
	}

	/** MEOS: tint_minus_value */
	minusValue(i: number): Temporal | null {
		return wrapTemporalOrNull(F.tint_minus_value(this.ptr, i)) as Temporal | null;
	}

	/** MEOS: tint_min_value */
	minValue(): number {
		return F.tint_min_value(this.ptr);
	}

	/** MEOS: mul_tint_int, chosen by the arguments' types */
	override mul(i: number | TNumber): Temporal | null {
		if (typeof i === 'number') return this._mul_tint_int(i as number);
		return super.mul(i as TNumber);
	}

	/** MEOS: nad_tint_int, nad_tint_intspan, nad_tint_tbox, nad_tint_tint, chosen by the arguments' types */
	nad(i: number | IntSpan | TBox | TInt): number {
		if (i instanceof IntSpan) return this._nad_tint_intspan(i as IntSpan);
		if (i instanceof TInt) return this._nad_tint_tint(i as TInt);
		if (i instanceof TBox) return this._nad_tint_tbox(i as TBox);
		if (typeof i === 'number') return this._nad_tint_int(i as number);
		throw new TypeError(`TInt.nad: no overload takes these arguments`);
	}

	/** MEOS: tint_out */
	out(): string {
		return F.tint_out(this.ptr);
	}

	/** MEOS: add_int_tint */
	radd(i: number): Temporal {
		return wrapTemporal(F.add_int_tint(i, this.ptr)) as Temporal;
	}

	/** MEOS: always_eq_int_tint */
	ralwaysEq(i: number): number {
		return F.always_eq_int_tint(i, this.ptr);
	}

	/** MEOS: always_ge_int_tint */
	ralwaysGe(i: number): number {
		return F.always_ge_int_tint(i, this.ptr);
	}

	/** MEOS: always_gt_int_tint */
	ralwaysGt(i: number): number {
		return F.always_gt_int_tint(i, this.ptr);
	}

	/** MEOS: always_le_int_tint */
	ralwaysLe(i: number): number {
		return F.always_le_int_tint(i, this.ptr);
	}

	/** MEOS: always_lt_int_tint */
	ralwaysLt(i: number): number {
		return F.always_lt_int_tint(i, this.ptr);
	}

	/** MEOS: always_ne_int_tint */
	ralwaysNe(i: number): number {
		return F.always_ne_int_tint(i, this.ptr);
	}

	/** MEOS: div_int_tint */
	rdiv(i: number): Temporal {
		return wrapTemporal(F.div_int_tint(i, this.ptr)) as Temporal;
	}

	/** MEOS: ever_eq_int_tint */
	reverEq(i: number): number {
		return F.ever_eq_int_tint(i, this.ptr);
	}

	/** MEOS: ever_ge_int_tint */
	reverGe(i: number): number {
		return F.ever_ge_int_tint(i, this.ptr);
	}

	/** MEOS: ever_gt_int_tint */
	reverGt(i: number): number {
		return F.ever_gt_int_tint(i, this.ptr);
	}

	/** MEOS: ever_le_int_tint */
	reverLe(i: number): number {
		return F.ever_le_int_tint(i, this.ptr);
	}

	/** MEOS: ever_lt_int_tint */
	reverLt(i: number): number {
		return F.ever_lt_int_tint(i, this.ptr);
	}

	/** MEOS: ever_ne_int_tint */
	reverNe(i: number): number {
		return F.ever_ne_int_tint(i, this.ptr);
	}

	/** MEOS: mul_int_tint */
	rmul(i: number): Temporal {
		return wrapTemporal(F.mul_int_tint(i, this.ptr)) as Temporal;
	}

	/** MEOS: sub_int_tint */
	rsub(i: number): Temporal {
		return wrapTemporal(F.sub_int_tint(i, this.ptr)) as Temporal;
	}

	/** MEOS: teq_int_tint */
	rteq(i: number): Temporal {
		return wrapTemporal(F.teq_int_tint(i, this.ptr)) as Temporal;
	}

	/** MEOS: tge_int_tint */
	rtge(i: number): Temporal {
		return wrapTemporal(F.tge_int_tint(i, this.ptr)) as Temporal;
	}

	/** MEOS: tgt_int_tint */
	rtgt(i: number): Temporal {
		return wrapTemporal(F.tgt_int_tint(i, this.ptr)) as Temporal;
	}

	/** MEOS: tle_int_tint */
	rtle(i: number): Temporal {
		return wrapTemporal(F.tle_int_tint(i, this.ptr)) as Temporal;
	}

	/** MEOS: tlt_int_tint */
	rtlt(i: number): Temporal {
		return wrapTemporal(F.tlt_int_tint(i, this.ptr)) as Temporal;
	}

	/** MEOS: tne_int_tint */
	rtne(i: number): Temporal {
		return wrapTemporal(F.tne_int_tint(i, this.ptr)) as Temporal;
	}

	/** MEOS: tint_scale_value */
	scaleValue(width: number): Temporal {
		return wrapTemporal(F.tint_scale_value(this.ptr, width)) as Temporal;
	}

	/** MEOS: tint_shift_scale_value */
	shiftScaleValue(shift: number, width: number): Temporal {
		return wrapTemporal(F.tint_shift_scale_value(this.ptr, shift, width)) as Temporal;
	}

	/** MEOS: tint_shift_value */
	shiftValue(shift: number): Temporal {
		return wrapTemporal(F.tint_shift_value(this.ptr, shift)) as Temporal;
	}

	/** MEOS: tint_start_value */
	startValue(): number {
		return F.tint_start_value(this.ptr);
	}

	/** MEOS: sub_tint_int, chosen by the arguments' types */
	override sub(i: number | TNumber): Temporal | null {
		if (typeof i === 'number') return this._sub_tint_int(i as number);
		return super.sub(i as TNumber);
	}

	/** MEOS: tdistance_tint_int, chosen by the arguments' types */
	override tdistance(i: number | TNumber): Temporal | null {
		if (typeof i === 'number') return this._tdistance_tint_int(i as number);
		return super.tdistance(i as TNumber);
	}

	/** MEOS: teq_tint_int, chosen by the arguments' types */
	override teq(i: number | Temporal): Temporal | null {
		if (typeof i === 'number') return this._teq_tint_int(i as number);
		return super.teq(i as Temporal);
	}

	/** MEOS: tge_tint_int, chosen by the arguments' types */
	override tge(i: number | Temporal): Temporal | null {
		if (typeof i === 'number') return this._tge_tint_int(i as number);
		return super.tge(i as Temporal);
	}

	/** MEOS: tgt_tint_int, chosen by the arguments' types */
	override tgt(i: number | Temporal): Temporal | null {
		if (typeof i === 'number') return this._tgt_tint_int(i as number);
		return super.tgt(i as Temporal);
	}

	/** MEOS: tint_time_boxes */
	timeBoxes(duration: Interval, torigin: TimestampTz, border_inc: boolean): TBox[] {
		const _duration = _putInterval(duration);
		const _count = _alloc(4);
		try {
			const _arr = F.tint_time_boxes(this.ptr, _duration, torigin, border_inc, _count);
			if (!_arr) return [];
			try {
				const _n = _view(_count, 4).getInt32(0, true);
				const _v = _view(_arr, _n * 56);
				const _out: TBox[] = [];
				for (let _i = 0; _i < _n; _i++) _out.push(wrapTBox(_copy(_arr + _i * 56, 56)) as TBox);
				return _out;
			} finally {
				_free(_arr);
			}
		} finally {
			_free(_duration);
			_free(_count);
		}
	}

	/** MEOS: tle_tint_int, chosen by the arguments' types */
	override tle(i: number | Temporal): Temporal | null {
		if (typeof i === 'number') return this._tle_tint_int(i as number);
		return super.tle(i as Temporal);
	}

	/** MEOS: tlt_tint_int, chosen by the arguments' types */
	override tlt(i: number | Temporal): Temporal | null {
		if (typeof i === 'number') return this._tlt_tint_int(i as number);
		return super.tlt(i as Temporal);
	}

	/** MEOS: tne_tint_int, chosen by the arguments' types */
	override tne(i: number | Temporal): Temporal | null {
		if (typeof i === 'number') return this._tne_tint_int(i as number);
		return super.tne(i as Temporal);
	}

	/** MEOS: tint_to_tbigint */
	toTbigint(): Temporal {
		return wrapTemporal(F.tint_to_tbigint(this.ptr)) as Temporal;
	}

	/** MEOS: tint_to_tfloat */
	toTfloat(): Temporal {
		return wrapTemporal(F.tint_to_tfloat(this.ptr)) as Temporal;
	}

	/** MEOS: tint_value */
	value(): number {
		return F.tint_value(this.ptr);
	}

	/** MEOS: tint_value_at_timestamptz */
	valueAtTimestamptz(t: TimestampTz, strict: boolean): number | null {
		const _value = _alloc(4);
		try {
			if (!F.tint_value_at_timestamptz(this.ptr, t, strict, _value)) return null;
			return ((_v: DataView) => _v.getInt32(0, true))(_view(_value, 4));
		} finally {
			_free(_value);
		}
	}

	/** MEOS: tint_value_bins */
	valueBins(vsize: number, vorigin: number, border_inc: boolean): Span[] {
		const _count = _alloc(4);
		try {
			const _arr = F.tint_value_bins(this.ptr, vsize, vorigin, border_inc, _count);
			if (!_arr) return [];
			try {
				const _n = _view(_count, 4).getInt32(0, true);
				const _v = _view(_arr, _n * 24);
				const _out: Span[] = [];
				for (let _i = 0; _i < _n; _i++) _out.push(wrapSpan(_copy(_arr + _i * 24, 24)) as Span);
				return _out;
			} finally {
				_free(_arr);
			}
		} finally {
			_free(_count);
		}
	}

	/** MEOS: tint_value_boxes */
	valueBoxes(vsize: number, vorigin: number, border_inc: boolean): TBox[] {
		const _count = _alloc(4);
		try {
			const _arr = F.tint_value_boxes(this.ptr, vsize, vorigin, border_inc, _count);
			if (!_arr) return [];
			try {
				const _n = _view(_count, 4).getInt32(0, true);
				const _v = _view(_arr, _n * 56);
				const _out: TBox[] = [];
				for (let _i = 0; _i < _n; _i++) _out.push(wrapTBox(_copy(_arr + _i * 56, 56)) as TBox);
				return _out;
			} finally {
				_free(_arr);
			}
		} finally {
			_free(_count);
		}
	}

	/** MEOS: tint_value_n */
	valueN(n: number): number {
		return F.tint_value_n(this.ptr, n);
	}

	/** MEOS: tint_values */
	values(): number[] {
		const _count = _alloc(4);
		try {
			const _arr = F.tint_values(this.ptr, _count);
			if (!_arr) return [];
			try {
				const _n = _view(_count, 4).getInt32(0, true);
				const _v = _view(_arr, _n * 4);
				const _out: number[] = [];
				for (let _i = 0; _i < _n; _i++) _out.push(_v.getInt32(_i * 4, true));
				return _out;
			} finally {
				_free(_arr);
			}
		} finally {
			_free(_count);
		}
	}

	/** MEOS: tint_value_time_boxes */
	valueTimeBoxes(vsize: number, duration: Interval, vorigin: number, torigin: TimestampTz, border_inc: boolean): TBox[] {
		const _duration = _putInterval(duration);
		const _count = _alloc(4);
		try {
			const _arr = F.tint_value_time_boxes(this.ptr, vsize, _duration, vorigin, torigin, border_inc, _count);
			if (!_arr) return [];
			try {
				const _n = _view(_count, 4).getInt32(0, true);
				const _v = _view(_arr, _n * 56);
				const _out: TBox[] = [];
				for (let _i = 0; _i < _n; _i++) _out.push(wrapTBox(_copy(_arr + _i * 56, 56)) as TBox);
				return _out;
			} finally {
				_free(_arr);
			}
		} finally {
			_free(_duration);
			_free(_count);
		}
	}

	/** MEOS: tint_from_base_temp */
	static fromBaseTemp(i: number, temp: Temporal): TInt {
		return wrapTemporal(F.tint_from_base_temp(i, temp.ptr)) as TInt;
	}

	/** MEOS: tint_from_mfjson */
	static fromMFJSON(str: string): TInt {
		return wrapTemporal(F.tint_from_mfjson(str)) as TInt;
	}

	/** MEOS: tint_in */
	static fromText(str: string): TInt {
		return TInt.in(str);
	}

	/** MEOS: tint_in */
	static in(str: string): TInt {
		return wrapTemporal(F.tint_in(str)) as TInt;
	}
}

/**
 * A TInt of subtype TInstant.
 */
export class TIntInst extends TInt {

	/** MEOS: tintinst_make */
	static make(i: number, t: TimestampTz): TIntInst {
		return wrapTemporal(F.tintinst_make(i, t)) as TIntInst;
	}
}

/**
 * A TInt of subtype TSequence.
 */
export class TIntSeq extends TInt {

	/** MEOS: tintseq_from_base_tstzset */
	static fromBaseTstzset(i: number, s: Set): TIntSeq {
		return wrapTemporal(F.tintseq_from_base_tstzset(i, s.ptr)) as TIntSeq;
	}

	/** MEOS: tintseq_from_base_tstzspan */
	static fromBaseTstzspan(i: number, s: Span): TIntSeq {
		return wrapTemporal(F.tintseq_from_base_tstzspan(i, s.ptr)) as TIntSeq;
	}
}

/**
 * A TInt of subtype TSequenceSet.
 */
export class TIntSeqSet extends TInt {

	/** MEOS: tintseqset_from_base_tstzspanset */
	static fromBaseTstzspanset(i: number, ss: SpanSet): TIntSeqSet {
		return wrapTemporal(F.tintseqset_from_base_tstzspanset(i, ss.ptr)) as TIntSeqSet;
	}
}

/**
 * The TJsonb class of the MEOS object model.
 */
export class TJsonb extends TAlpha {

	/** The text MEOS writes this value as (MEOS: tjsonb_out). */
	override toString(): string {
		return this.out();
	}

	/** MEOS: always_eq_tjsonb_jsonb */
	private _always_eq_tjsonb_jsonb(jb: Jsonb): number {
		return F.always_eq_tjsonb_jsonb(this.ptr, jb.ptr);
	}

	/** MEOS: always_eq_tjsonb_tjsonb */
	private _always_eq_tjsonb_tjsonb(temp2: TJsonb): number {
		return F.always_eq_tjsonb_tjsonb(this.ptr, temp2.ptr);
	}

	/** MEOS: always_ne_tjsonb_jsonb */
	private _always_ne_tjsonb_jsonb(jb: Jsonb): number {
		return F.always_ne_tjsonb_jsonb(this.ptr, jb.ptr);
	}

	/** MEOS: always_ne_tjsonb_tjsonb */
	private _always_ne_tjsonb_tjsonb(temp2: TJsonb): number {
		return F.always_ne_tjsonb_tjsonb(this.ptr, temp2.ptr);
	}

	/** MEOS: concat_tjsonb_jsonb */
	private _concat_tjsonb_jsonb(jb: Jsonb, invert: boolean): Temporal {
		return wrapTemporal(F.concat_tjsonb_jsonb(this.ptr, jb.ptr, invert)) as Temporal;
	}

	/** MEOS: concat_tjsonb_tjsonb */
	private _concat_tjsonb_tjsonb(temp2: TJsonb): Temporal | null {
		return wrapTemporalOrNull(F.concat_tjsonb_tjsonb(this.ptr, temp2.ptr)) as Temporal | null;
	}

	/** MEOS: ever_eq_tjsonb_jsonb */
	private _ever_eq_tjsonb_jsonb(jb: Jsonb): number {
		return F.ever_eq_tjsonb_jsonb(this.ptr, jb.ptr);
	}

	/** MEOS: ever_eq_tjsonb_tjsonb */
	private _ever_eq_tjsonb_tjsonb(temp2: TJsonb): number {
		return F.ever_eq_tjsonb_tjsonb(this.ptr, temp2.ptr);
	}

	/** MEOS: ever_ne_tjsonb_jsonb */
	private _ever_ne_tjsonb_jsonb(jb: Jsonb): number {
		return F.ever_ne_tjsonb_jsonb(this.ptr, jb.ptr);
	}

	/** MEOS: ever_ne_tjsonb_tjsonb */
	private _ever_ne_tjsonb_tjsonb(temp2: TJsonb): number {
		return F.ever_ne_tjsonb_tjsonb(this.ptr, temp2.ptr);
	}

	/** MEOS: teq_tjsonb_jsonb */
	private _teq_tjsonb_jsonb(jb: Jsonb): Temporal | null {
		return wrapTemporalOrNull(F.teq_tjsonb_jsonb(this.ptr, jb.ptr)) as Temporal | null;
	}

	/** MEOS: tne_tjsonb_jsonb */
	private _tne_tjsonb_jsonb(jb: Jsonb): Temporal | null {
		return wrapTemporalOrNull(F.tne_tjsonb_jsonb(this.ptr, jb.ptr)) as Temporal | null;
	}

	/** MEOS: always_eq_tjsonb_jsonb, always_eq_tjsonb_tjsonb, chosen by the arguments' types */
	override alwaysEq(jb: Jsonb | TJsonb | Temporal): number {
		if (jb instanceof TJsonb) return this._always_eq_tjsonb_tjsonb(jb as TJsonb);
		if (jb instanceof Jsonb) return this._always_eq_tjsonb_jsonb(jb as Jsonb);
		return super.alwaysEq(jb as Temporal);
	}

	/** MEOS: always_ne_tjsonb_jsonb, always_ne_tjsonb_tjsonb, chosen by the arguments' types */
	override alwaysNe(jb: Jsonb | TJsonb | Temporal): number {
		if (jb instanceof TJsonb) return this._always_ne_tjsonb_tjsonb(jb as TJsonb);
		if (jb instanceof Jsonb) return this._always_ne_tjsonb_jsonb(jb as Jsonb);
		return super.alwaysNe(jb as Temporal);
	}

	/** MEOS: tjsonb_array_element */
	arrayElement(idx: number, null_handle: number): Temporal | null {
		return wrapTemporalOrNull(F.tjsonb_array_element(this.ptr, idx, null_handle)) as Temporal | null;
	}

	/** MEOS: tjsonb_array_element_text */
	arrayElementText(idx: number, null_handle: number): Temporal | null {
		return wrapTemporalOrNull(F.tjsonb_array_element_text(this.ptr, idx, null_handle)) as Temporal | null;
	}

	/** MEOS: tjsonb_array_length */
	arrayLength(): Temporal | null {
		return wrapTemporalOrNull(F.tjsonb_array_length(this.ptr)) as Temporal | null;
	}

	/** MEOS: tjsonb_out */
	asText(): string {
		return this.out();
	}

	/** MEOS: tjsonb_at_value */
	atValue(jsb: Jsonb): Temporal | null {
		return wrapTemporalOrNull(F.tjsonb_at_value(this.ptr, jsb.ptr)) as Temporal | null;
	}

	/** MEOS: concat_tjsonb_jsonb, concat_tjsonb_tjsonb, chosen by the arguments' types */
	concat(jb: Jsonb | TJsonb, invert?: boolean): Temporal | null {
		if (jb instanceof TJsonb && invert === undefined) return this._concat_tjsonb_tjsonb(jb as TJsonb);
		if (jb instanceof Jsonb && typeof invert === 'boolean') return this._concat_tjsonb_jsonb(jb as Jsonb, invert as boolean);
		throw new TypeError(`TJsonb.concat: no overload takes these arguments`);
	}

	/** MEOS: tjsonb_delete */
	delete(key: string): Temporal | null {
		return wrapTemporalOrNull(F.tjsonb_delete(this.ptr, key)) as Temporal | null;
	}

	/** MEOS: tjsonb_delete_array */
	deleteArray(keys: Text[]): Temporal | null {
		const _keys = _ptrArray(keys.map(x => x.ptr));
		try {
			return wrapTemporalOrNull(F.tjsonb_delete_array(this.ptr, _keys, keys.length)) as Temporal | null;
		} finally {
			_free(_keys);
		}
	}

	/** MEOS: tjsonb_delete_index */
	deleteIndex(idx: number): Temporal | null {
		return wrapTemporalOrNull(F.tjsonb_delete_index(this.ptr, idx)) as Temporal | null;
	}

	/** MEOS: tjsonb_delete_path */
	deletePath(path_elems: Text[]): Temporal | null {
		const _path_elems = _ptrArray(path_elems.map(x => x.ptr));
		try {
			return wrapTemporalOrNull(F.tjsonb_delete_path(this.ptr, _path_elems, path_elems.length)) as Temporal | null;
		} finally {
			_free(_path_elems);
		}
	}

	/** MEOS: tjsonb_end_value */
	endValue(): Jsonb {
		return wrapJsonb(F.tjsonb_end_value(this.ptr)) as Jsonb;
	}

	/** MEOS: ever_eq_tjsonb_jsonb, ever_eq_tjsonb_tjsonb, chosen by the arguments' types */
	override everEq(jb: Jsonb | TJsonb | Temporal): number {
		if (jb instanceof TJsonb) return this._ever_eq_tjsonb_tjsonb(jb as TJsonb);
		if (jb instanceof Jsonb) return this._ever_eq_tjsonb_jsonb(jb as Jsonb);
		return super.everEq(jb as Temporal);
	}

	/** MEOS: ever_ne_tjsonb_jsonb, ever_ne_tjsonb_tjsonb, chosen by the arguments' types */
	override everNe(jb: Jsonb | TJsonb | Temporal): number {
		if (jb instanceof TJsonb) return this._ever_ne_tjsonb_tjsonb(jb as TJsonb);
		if (jb instanceof Jsonb) return this._ever_ne_tjsonb_jsonb(jb as Jsonb);
		return super.everNe(jb as Temporal);
	}

	/** MEOS: tjsonb_exists */
	exists(key: string): Temporal {
		return wrapTemporal(F.tjsonb_exists(this.ptr, key)) as Temporal;
	}

	/** MEOS: tjsonb_exists_all */
	existsAll(keys: Text[]): Temporal | null {
		const _keys = _ptrArray(keys.map(x => x.ptr));
		try {
			return wrapTemporalOrNull(F.tjsonb_exists_all(this.ptr, _keys, keys.length)) as Temporal | null;
		} finally {
			_free(_keys);
		}
	}

	/** MEOS: tjsonb_exists_any */
	existsAny(keys: Text[]): Temporal | null {
		const _keys = _ptrArray(keys.map(x => x.ptr));
		try {
			return wrapTemporalOrNull(F.tjsonb_exists_any(this.ptr, _keys, keys.length)) as Temporal | null;
		} finally {
			_free(_keys);
		}
	}

	/** MEOS: tjsonb_exists_array */
	existsArray(keys: Text[], any: boolean): Temporal | null {
		const _keys = _ptrArray(keys.map(x => x.ptr));
		try {
			return wrapTemporalOrNull(F.tjsonb_exists_array(this.ptr, _keys, keys.length, any)) as Temporal | null;
		} finally {
			_free(_keys);
		}
	}

	/** MEOS: tjsonb_extract_path */
	extractPath(path_elems: Text[], null_handle: number): Temporal | null {
		const _path_elems = _ptrArray(path_elems.map(x => x.ptr));
		try {
			return wrapTemporalOrNull(F.tjsonb_extract_path(this.ptr, _path_elems, path_elems.length, null_handle)) as Temporal | null;
		} finally {
			_free(_path_elems);
		}
	}

	/** MEOS: tjsonb_extract_path_text */
	extractPathText(path_elems: Text[], null_handle: number): Temporal | null {
		const _path_elems = _ptrArray(path_elems.map(x => x.ptr));
		try {
			return wrapTemporalOrNull(F.tjsonb_extract_path_text(this.ptr, _path_elems, path_elems.length, null_handle)) as Temporal | null;
		} finally {
			_free(_path_elems);
		}
	}

	/** MEOS: tjsonb_minus_value */
	minusValue(jsb: Jsonb): Temporal | null {
		return wrapTemporalOrNull(F.tjsonb_minus_value(this.ptr, jsb.ptr)) as Temporal | null;
	}

	/** MEOS: tjsonb_object_field */
	objectField(key: string, null_handle: number): Temporal | null {
		return wrapTemporalOrNull(F.tjsonb_object_field(this.ptr, key, null_handle)) as Temporal | null;
	}

	/** MEOS: tjsonb_object_field_text */
	objectFieldText(key: string, null_handle: number): Temporal | null {
		return wrapTemporalOrNull(F.tjsonb_object_field_text(this.ptr, key, null_handle)) as Temporal | null;
	}

	/** MEOS: tjsonb_out */
	out(): string {
		return F.tjsonb_out(this.ptr);
	}

	/** MEOS: tjsonb_path_exists */
	pathExists(jp: JsonPath, vars: Jsonb, silent: boolean, tz: boolean): Temporal | null {
		return wrapTemporalOrNull(F.tjsonb_path_exists(this.ptr, jp.ptr, vars.ptr, silent, tz)) as Temporal | null;
	}

	/** MEOS: tjsonb_path_match */
	pathMatch(jp: JsonPath, vars: Jsonb, silent: boolean, tz: boolean): Temporal | null {
		return wrapTemporalOrNull(F.tjsonb_path_match(this.ptr, jp.ptr, vars.ptr, silent, tz)) as Temporal | null;
	}

	/** MEOS: tjsonb_path_query_array */
	pathQueryArray(jp: JsonPath, vars: Jsonb, silent: boolean, tz: boolean): Temporal | null {
		return wrapTemporalOrNull(F.tjsonb_path_query_array(this.ptr, jp.ptr, vars.ptr, silent, tz)) as Temporal | null;
	}

	/** MEOS: tjsonb_path_query_first */
	pathQueryFirst(jp: JsonPath, vars: Jsonb, silent: boolean, tz: boolean): Temporal | null {
		return wrapTemporalOrNull(F.tjsonb_path_query_first(this.ptr, jp.ptr, vars.ptr, silent, tz)) as Temporal | null;
	}

	/** MEOS: tjsonb_pretty */
	pretty(): Temporal {
		return wrapTemporal(F.tjsonb_pretty(this.ptr)) as Temporal;
	}

	/** MEOS: tjsonb_set */
	set(keys: Text[], newjb: Jsonb, create: boolean): Temporal | null {
		const _keys = _ptrArray(keys.map(x => x.ptr));
		try {
			return wrapTemporalOrNull(F.tjsonb_set(this.ptr, _keys, keys.length, newjb.ptr, create)) as Temporal | null;
		} finally {
			_free(_keys);
		}
	}

	/** MEOS: tjsonb_set_lax */
	setLax(keys: Text[], newjb: Jsonb, create: boolean, null_handle: string): Temporal | null {
		const _keys = _ptrArray(keys.map(x => x.ptr));
		try {
			return wrapTemporalOrNull(F.tjsonb_set_lax(this.ptr, _keys, keys.length, newjb.ptr, create, null_handle)) as Temporal | null;
		} finally {
			_free(_keys);
		}
	}

	/** MEOS: tjsonb_start_value */
	startValue(): Jsonb {
		return wrapJsonb(F.tjsonb_start_value(this.ptr)) as Jsonb;
	}

	/** MEOS: tjsonb_strip_nulls */
	stripNulls(strip_in_arrays: boolean): Temporal {
		return wrapTemporal(F.tjsonb_strip_nulls(this.ptr, strip_in_arrays)) as Temporal;
	}

	/** MEOS: teq_tjsonb_jsonb, chosen by the arguments' types */
	override teq(jb: Jsonb | Temporal): Temporal | null {
		if (jb instanceof Jsonb) return this._teq_tjsonb_jsonb(jb as Jsonb);
		return super.teq(jb as Temporal);
	}

	/** MEOS: tne_tjsonb_jsonb, chosen by the arguments' types */
	override tne(jb: Jsonb | Temporal): Temporal | null {
		if (jb instanceof Jsonb) return this._tne_tjsonb_jsonb(jb as Jsonb);
		return super.tne(jb as Temporal);
	}

	/** MEOS: tjsonb_to_tbigint */
	toTbigint(key: string, null_handle: number): Temporal | null {
		return wrapTemporalOrNull(F.tjsonb_to_tbigint(this.ptr, key, null_handle)) as Temporal | null;
	}

	/** MEOS: tjsonb_to_tbool */
	toTbool(key: string, null_handle: number): Temporal | null {
		return wrapTemporalOrNull(F.tjsonb_to_tbool(this.ptr, key, null_handle)) as Temporal | null;
	}

	/** MEOS: tjsonb_to_tfloat */
	toTfloat(key: string, interp: number, null_handle: number): Temporal | null {
		return wrapTemporalOrNull(F.tjsonb_to_tfloat(this.ptr, key, interp, null_handle)) as Temporal | null;
	}

	/** MEOS: tjsonb_to_tgeogpoint */
	toTgeogpoint(key: string, interp: number, null_handle: number): Temporal | null {
		return wrapTemporalOrNull(F.tjsonb_to_tgeogpoint(this.ptr, key, interp, null_handle)) as Temporal | null;
	}

	/** MEOS: tjsonb_to_tgeography */
	toTgeography(key: string, null_handle: number): Temporal | null {
		return wrapTemporalOrNull(F.tjsonb_to_tgeography(this.ptr, key, null_handle)) as Temporal | null;
	}

	/** MEOS: tjsonb_to_tgeometry */
	toTgeometry(key: string, null_handle: number): Temporal | null {
		return wrapTemporalOrNull(F.tjsonb_to_tgeometry(this.ptr, key, null_handle)) as Temporal | null;
	}

	/** MEOS: tjsonb_to_tgeompoint */
	toTgeompoint(key: string, interp: number, null_handle: number): Temporal | null {
		return wrapTemporalOrNull(F.tjsonb_to_tgeompoint(this.ptr, key, interp, null_handle)) as Temporal | null;
	}

	/** MEOS: tjsonb_to_tint */
	toTint(key: string, null_handle: number): Temporal | null {
		return wrapTemporalOrNull(F.tjsonb_to_tint(this.ptr, key, null_handle)) as Temporal | null;
	}

	/** MEOS: tjsonb_to_ttext */
	toTtext(): Temporal {
		return wrapTemporal(F.tjsonb_to_ttext(this.ptr)) as Temporal;
	}

	/** MEOS: tjsonb_to_ttext_key */
	toTtextKey(key: string, null_handle: number): Temporal | null {
		return wrapTemporalOrNull(F.tjsonb_to_ttext_key(this.ptr, key, null_handle)) as Temporal | null;
	}

	/** MEOS: tjsonb_value */
	value(): Jsonb {
		return wrapJsonb(F.tjsonb_value(this.ptr)) as Jsonb;
	}

	/** MEOS: tjsonb_value_n */
	valueN(n: number): Jsonb | null {
		return wrapJsonbOrNull(F.tjsonb_value_n(this.ptr, n)) as Jsonb | null;
	}

	/** MEOS: tjsonb_values */
	values(): Jsonb[] {
		const _count = _alloc(4);
		try {
			const _arr = F.tjsonb_values(this.ptr, _count);
			if (!_arr) return [];
			try {
				const _n = _view(_count, 4).getInt32(0, true);
				const _v = _view(_arr, _n * 8);
				const _out: Jsonb[] = [];
				for (let _i = 0; _i < _n; _i++) _out.push(wrapJsonb(Number(_v.getBigUint64(_i * 8, true))) as Jsonb);
				return _out;
			} finally {
				_free(_arr);
			}
		} finally {
			_free(_count);
		}
	}

	/** MEOS: tjsonb_from_base_temp */
	static fromBaseTemp(jsonb: Jsonb, temp: Temporal): TJsonb {
		return wrapTemporal(F.tjsonb_from_base_temp(jsonb.ptr, temp.ptr)) as TJsonb;
	}

	/** MEOS: tjsonb_from_mfjson */
	static fromMFJSON(str: string): TJsonb {
		return wrapTemporal(F.tjsonb_from_mfjson(str)) as TJsonb;
	}

	/** MEOS: tjsonb_in */
	static fromText(str: string): TJsonb {
		return TJsonb.in(str);
	}

	/** MEOS: tjsonb_in */
	static in(str: string): TJsonb {
		return wrapTemporal(F.tjsonb_in(str)) as TJsonb;
	}
}

/**
 * A TJsonb of subtype TInstant.
 */
export class TJsonbInst extends TJsonb {

	/** MEOS: tjsonbinst_make */
	static make(jsonb: Jsonb, t: TimestampTz): TJsonbInst {
		return wrapTemporal(F.tjsonbinst_make(jsonb.ptr, t)) as TJsonbInst;
	}
}

/**
 * A TJsonb of subtype TSequence.
 */
export class TJsonbSeq extends TJsonb {

	/** MEOS: tjsonbseq_from_base_tstzset */
	static fromBaseTstzset(jsonb: Jsonb, s: Set): TJsonbSeq {
		return wrapTemporal(F.tjsonbseq_from_base_tstzset(jsonb.ptr, s.ptr)) as TJsonbSeq;
	}

	/** MEOS: tjsonbseq_from_base_tstzspan */
	static fromBaseTstzspan(jsonb: Jsonb, sp: Span): TJsonbSeq {
		return wrapTemporal(F.tjsonbseq_from_base_tstzspan(jsonb.ptr, sp.ptr)) as TJsonbSeq;
	}
}

/**
 * A TJsonb of subtype TSequenceSet.
 */
export class TJsonbSeqSet extends TJsonb {

	/** MEOS: tjsonbseqset_from_base_tstzspanset */
	static fromBaseTstzspanset(jsonb: Jsonb, ss: SpanSet): TJsonbSeqSet {
		return wrapTemporal(F.tjsonbseqset_from_base_tstzspanset(jsonb.ptr, ss.ptr)) as TJsonbSeqSet;
	}
}

/**
 * The TNpoint class of the MEOS object model.
 */
export class TNpoint extends TSpatial {

	/** The text MEOS writes this value as (MEOS: tspatial_as_text). */
	override toString(): string {
		return this.asText(15);
	}

	/** MEOS: always_eq_tnpoint_npoint */
	private _always_eq_tnpoint_npoint(np: Npoint): number {
		return F.always_eq_tnpoint_npoint(this.ptr, np.ptr);
	}

	/** MEOS: always_eq_tnpoint_tnpoint */
	private _always_eq_tnpoint_tnpoint(temp2: TNpoint): number {
		return F.always_eq_tnpoint_tnpoint(this.ptr, temp2.ptr);
	}

	/** MEOS: always_ne_tnpoint_npoint */
	private _always_ne_tnpoint_npoint(np: Npoint): number {
		return F.always_ne_tnpoint_npoint(this.ptr, np.ptr);
	}

	/** MEOS: always_ne_tnpoint_tnpoint */
	private _always_ne_tnpoint_tnpoint(temp2: TNpoint): number {
		return F.always_ne_tnpoint_tnpoint(this.ptr, temp2.ptr);
	}

	/** MEOS: contained_rid_tnpoint_bigintset */
	private _contained_rid_tnpoint_bigintset(s: BigIntSet): boolean {
		return F.contained_rid_tnpoint_bigintset(this.ptr, s.ptr);
	}

	/** MEOS: contained_rid_tnpoint_tnpoint */
	private _contained_rid_tnpoint_tnpoint(temp2: TNpoint): boolean {
		return F.contained_rid_tnpoint_tnpoint(this.ptr, temp2.ptr);
	}

	/** MEOS: contains_rid_tnpoint_bigint */
	private _contains_rid_tnpoint_bigint(rid: number): boolean {
		return F.contains_rid_tnpoint_bigint(this.ptr, rid);
	}

	/** MEOS: contains_rid_tnpoint_bigintset */
	private _contains_rid_tnpoint_bigintset(s: BigIntSet): boolean {
		return F.contains_rid_tnpoint_bigintset(this.ptr, s.ptr);
	}

	/** MEOS: contains_rid_tnpoint_npoint */
	private _contains_rid_tnpoint_npoint(np: Npoint): boolean {
		return F.contains_rid_tnpoint_npoint(this.ptr, np.ptr);
	}

	/** MEOS: contains_rid_tnpoint_tnpoint */
	private _contains_rid_tnpoint_tnpoint(temp2: TNpoint): boolean {
		return F.contains_rid_tnpoint_tnpoint(this.ptr, temp2.ptr);
	}

	/** MEOS: ever_eq_tnpoint_npoint */
	private _ever_eq_tnpoint_npoint(np: Npoint): number {
		return F.ever_eq_tnpoint_npoint(this.ptr, np.ptr);
	}

	/** MEOS: ever_eq_tnpoint_tnpoint */
	private _ever_eq_tnpoint_tnpoint(temp2: TNpoint): number {
		return F.ever_eq_tnpoint_tnpoint(this.ptr, temp2.ptr);
	}

	/** MEOS: ever_ne_tnpoint_npoint */
	private _ever_ne_tnpoint_npoint(np: Npoint): number {
		return F.ever_ne_tnpoint_npoint(this.ptr, np.ptr);
	}

	/** MEOS: ever_ne_tnpoint_tnpoint */
	private _ever_ne_tnpoint_tnpoint(temp2: TNpoint): number {
		return F.ever_ne_tnpoint_tnpoint(this.ptr, temp2.ptr);
	}

	/** MEOS: nad_tnpoint_geo */
	private _nad_tnpoint_geo(gs: Geometry): number {
		return F.nad_tnpoint_geo(this.ptr, gs.ptr);
	}

	/** MEOS: nad_tnpoint_npoint */
	private _nad_tnpoint_npoint(np: Npoint): number {
		return F.nad_tnpoint_npoint(this.ptr, np.ptr);
	}

	/** MEOS: nad_tnpoint_stbox */
	private _nad_tnpoint_stbox(box: STBox): number {
		return F.nad_tnpoint_stbox(this.ptr, box.ptr);
	}

	/** MEOS: nad_tnpoint_tnpoint */
	private _nad_tnpoint_tnpoint(temp2: TNpoint): number {
		return F.nad_tnpoint_tnpoint(this.ptr, temp2.ptr);
	}

	/** MEOS: nai_tnpoint_geo */
	private _nai_tnpoint_geo(gs: Geometry): Temporal | null {
		return wrapTemporalOrNull(F.nai_tnpoint_geo(this.ptr, gs.ptr)) as Temporal | null;
	}

	/** MEOS: nai_tnpoint_npoint */
	private _nai_tnpoint_npoint(np: Npoint): Temporal | null {
		return wrapTemporalOrNull(F.nai_tnpoint_npoint(this.ptr, np.ptr)) as Temporal | null;
	}

	/** MEOS: nai_tnpoint_tnpoint */
	private _nai_tnpoint_tnpoint(temp2: TNpoint): Temporal | null {
		return wrapTemporalOrNull(F.nai_tnpoint_tnpoint(this.ptr, temp2.ptr)) as Temporal | null;
	}

	/** MEOS: overlaps_rid_tnpoint_bigintset */
	private _overlaps_rid_tnpoint_bigintset(s: BigIntSet): boolean {
		return F.overlaps_rid_tnpoint_bigintset(this.ptr, s.ptr);
	}

	/** MEOS: overlaps_rid_tnpoint_tnpoint */
	private _overlaps_rid_tnpoint_tnpoint(temp2: TNpoint): boolean {
		return F.overlaps_rid_tnpoint_tnpoint(this.ptr, temp2.ptr);
	}

	/** MEOS: same_rid_tnpoint_bigint */
	private _same_rid_tnpoint_bigint(rid: number): boolean {
		return F.same_rid_tnpoint_bigint(this.ptr, rid);
	}

	/** MEOS: same_rid_tnpoint_bigintset */
	private _same_rid_tnpoint_bigintset(s: BigIntSet): boolean {
		return F.same_rid_tnpoint_bigintset(this.ptr, s.ptr);
	}

	/** MEOS: same_rid_tnpoint_npoint */
	private _same_rid_tnpoint_npoint(np: Npoint): boolean {
		return F.same_rid_tnpoint_npoint(this.ptr, np.ptr);
	}

	/** MEOS: same_rid_tnpoint_tnpoint */
	private _same_rid_tnpoint_tnpoint(temp2: TNpoint): boolean {
		return F.same_rid_tnpoint_tnpoint(this.ptr, temp2.ptr);
	}

	/** MEOS: shortestline_tnpoint_geo */
	private _shortestline_tnpoint_geo(gs: Geometry): Geo | null {
		return wrapGeoOrNull(F.shortestline_tnpoint_geo(this.ptr, gs.ptr)) as Geo | null;
	}

	/** MEOS: shortestline_tnpoint_npoint */
	private _shortestline_tnpoint_npoint(np: Npoint): Geo | null {
		return wrapGeoOrNull(F.shortestline_tnpoint_npoint(this.ptr, np.ptr)) as Geo | null;
	}

	/** MEOS: shortestline_tnpoint_tnpoint */
	private _shortestline_tnpoint_tnpoint(temp2: TNpoint): Geo | null {
		return wrapGeoOrNull(F.shortestline_tnpoint_tnpoint(this.ptr, temp2.ptr)) as Geo | null;
	}

	/** MEOS: tdistance_tnpoint_geo */
	private _tdistance_tnpoint_geo(gs: Geometry): Temporal | null {
		return wrapTemporalOrNull(F.tdistance_tnpoint_geo(this.ptr, gs.ptr)) as Temporal | null;
	}

	/** MEOS: tdistance_tnpoint_npoint */
	private _tdistance_tnpoint_npoint(np: Npoint): Temporal | null {
		return wrapTemporalOrNull(F.tdistance_tnpoint_npoint(this.ptr, np.ptr)) as Temporal | null;
	}

	/** MEOS: tdistance_tnpoint_tnpoint */
	private _tdistance_tnpoint_tnpoint(temp2: TNpoint): Temporal | null {
		return wrapTemporalOrNull(F.tdistance_tnpoint_tnpoint(this.ptr, temp2.ptr)) as Temporal | null;
	}

	/** MEOS: teq_tnpoint_npoint */
	private _teq_tnpoint_npoint(np: Npoint): Temporal | null {
		return wrapTemporalOrNull(F.teq_tnpoint_npoint(this.ptr, np.ptr)) as Temporal | null;
	}

	/** MEOS: tne_tnpoint_npoint */
	private _tne_tnpoint_npoint(np: Npoint): Temporal | null {
		return wrapTemporalOrNull(F.tne_tnpoint_npoint(this.ptr, np.ptr)) as Temporal | null;
	}

	/** MEOS: always_eq_tnpoint_npoint, always_eq_tnpoint_tnpoint, chosen by the arguments' types */
	override alwaysEq(np: Npoint | TNpoint | Temporal): number {
		if (np instanceof TNpoint) return this._always_eq_tnpoint_tnpoint(np as TNpoint);
		if (np instanceof Npoint) return this._always_eq_tnpoint_npoint(np as Npoint);
		return super.alwaysEq(np as Temporal);
	}

	/** MEOS: always_ne_tnpoint_npoint, always_ne_tnpoint_tnpoint, chosen by the arguments' types */
	override alwaysNe(np: Npoint | TNpoint | Temporal): number {
		if (np instanceof TNpoint) return this._always_ne_tnpoint_tnpoint(np as TNpoint);
		if (np instanceof Npoint) return this._always_ne_tnpoint_npoint(np as Npoint);
		return super.alwaysNe(np as Temporal);
	}

	/** MEOS: tnpoint_at_geom */
	atGeom(gs: Geo): Temporal | null {
		return wrapTemporalOrNull(F.tnpoint_at_geom(this.ptr, gs.ptr)) as Temporal | null;
	}

	/** MEOS: tnpoint_at_npoint */
	atNpoint(np: Npoint): Temporal | null {
		return wrapTemporalOrNull(F.tnpoint_at_npoint(this.ptr, np.ptr)) as Temporal | null;
	}

	/** MEOS: tnpoint_at_npointset */
	atNpointset(s: Set): Temporal | null {
		return wrapTemporalOrNull(F.tnpoint_at_npointset(this.ptr, s.ptr)) as Temporal | null;
	}

	/** MEOS: tnpoint_at_stbox */
	atStbox(box: STBox, border_inc: boolean): Temporal | null {
		return wrapTemporalOrNull(F.tnpoint_at_stbox(this.ptr, box.ptr, border_inc)) as Temporal | null;
	}

	/** MEOS: contained_rid_tnpoint_bigintset, contained_rid_tnpoint_tnpoint, chosen by the arguments' types */
	containedRid(s: BigIntSet | TNpoint): boolean {
		if (s instanceof BigIntSet) return this._contained_rid_tnpoint_bigintset(s as BigIntSet);
		if (s instanceof TNpoint) return this._contained_rid_tnpoint_tnpoint(s as TNpoint);
		throw new TypeError(`TNpoint.containedRid: no overload takes these arguments`);
	}

	/** MEOS: contains_rid_tnpoint_bigint, contains_rid_tnpoint_bigintset, contains_rid_tnpoint_npoint, contains_rid_tnpoint_tnpoint, chosen by the arguments' types */
	containsRid(rid: number | BigIntSet | Npoint | TNpoint): boolean {
		if (rid instanceof BigIntSet) return this._contains_rid_tnpoint_bigintset(rid as BigIntSet);
		if (rid instanceof TNpoint) return this._contains_rid_tnpoint_tnpoint(rid as TNpoint);
		if (rid instanceof Npoint) return this._contains_rid_tnpoint_npoint(rid as Npoint);
		if (typeof rid === 'number') return this._contains_rid_tnpoint_bigint(rid as number);
		throw new TypeError(`TNpoint.containsRid: no overload takes these arguments`);
	}

	/** MEOS: tnpoint_cumulative_length */
	cumulativeLength(): Temporal {
		return wrapTemporal(F.tnpoint_cumulative_length(this.ptr)) as Temporal;
	}

	/** MEOS: tnpoint_end_value */
	endValue(): Npoint {
		return wrapNpoint(F.tnpoint_end_value(this.ptr)) as Npoint;
	}

	/** MEOS: ever_eq_tnpoint_npoint, ever_eq_tnpoint_tnpoint, chosen by the arguments' types */
	override everEq(np: Npoint | TNpoint | Temporal): number {
		if (np instanceof TNpoint) return this._ever_eq_tnpoint_tnpoint(np as TNpoint);
		if (np instanceof Npoint) return this._ever_eq_tnpoint_npoint(np as Npoint);
		return super.everEq(np as Temporal);
	}

	/** MEOS: ever_ne_tnpoint_npoint, ever_ne_tnpoint_tnpoint, chosen by the arguments' types */
	override everNe(np: Npoint | TNpoint | Temporal): number {
		if (np instanceof TNpoint) return this._ever_ne_tnpoint_tnpoint(np as TNpoint);
		if (np instanceof Npoint) return this._ever_ne_tnpoint_npoint(np as Npoint);
		return super.everNe(np as Temporal);
	}

	/** MEOS: tnpoint_length */
	length(): number {
		return F.tnpoint_length(this.ptr);
	}

	/** MEOS: tnpoint_minus_geom */
	minusGeom(gs: Geo): Temporal | null {
		return wrapTemporalOrNull(F.tnpoint_minus_geom(this.ptr, gs.ptr)) as Temporal | null;
	}

	/** MEOS: tnpoint_minus_npoint */
	minusNpoint(np: Npoint): Temporal | null {
		return wrapTemporalOrNull(F.tnpoint_minus_npoint(this.ptr, np.ptr)) as Temporal | null;
	}

	/** MEOS: tnpoint_minus_npointset */
	minusNpointset(s: Set): Temporal | null {
		return wrapTemporalOrNull(F.tnpoint_minus_npointset(this.ptr, s.ptr)) as Temporal | null;
	}

	/** MEOS: tnpoint_minus_stbox */
	minusStbox(box: STBox, border_inc: boolean): Temporal | null {
		return wrapTemporalOrNull(F.tnpoint_minus_stbox(this.ptr, box.ptr, border_inc)) as Temporal | null;
	}

	/** MEOS: nad_tnpoint_geo, nad_tnpoint_npoint, nad_tnpoint_stbox, nad_tnpoint_tnpoint, chosen by the arguments' types */
	nad(gs: Geometry | Npoint | STBox | TNpoint): number {
		if (gs instanceof Geometry) return this._nad_tnpoint_geo(gs as Geometry);
		if (gs instanceof TNpoint) return this._nad_tnpoint_tnpoint(gs as TNpoint);
		if (gs instanceof Npoint) return this._nad_tnpoint_npoint(gs as Npoint);
		if (gs instanceof STBox) return this._nad_tnpoint_stbox(gs as STBox);
		throw new TypeError(`TNpoint.nad: no overload takes these arguments`);
	}

	/** MEOS: nai_tnpoint_geo, nai_tnpoint_npoint, nai_tnpoint_tnpoint, chosen by the arguments' types */
	nai(gs: Geometry | Npoint | TNpoint): Temporal | null {
		if (gs instanceof Geometry) return this._nai_tnpoint_geo(gs as Geometry);
		if (gs instanceof TNpoint) return this._nai_tnpoint_tnpoint(gs as TNpoint);
		if (gs instanceof Npoint) return this._nai_tnpoint_npoint(gs as Npoint);
		throw new TypeError(`TNpoint.nai: no overload takes these arguments`);
	}

	/** MEOS: tnpoint_out */
	override out(maxdd: number): string {
		return F.tnpoint_out(this.ptr, maxdd);
	}

	/** MEOS: overlaps_rid_tnpoint_bigintset, overlaps_rid_tnpoint_tnpoint, chosen by the arguments' types */
	overlapsRid(s: BigIntSet | TNpoint): boolean {
		if (s instanceof BigIntSet) return this._overlaps_rid_tnpoint_bigintset(s as BigIntSet);
		if (s instanceof TNpoint) return this._overlaps_rid_tnpoint_tnpoint(s as TNpoint);
		throw new TypeError(`TNpoint.overlapsRid: no overload takes these arguments`);
	}

	/** MEOS: tnpoint_positions */
	positions(): Nsegment[] {
		const _count = _alloc(4);
		try {
			const _arr = F.tnpoint_positions(this.ptr, _count);
			if (!_arr) return [];
			try {
				const _n = _view(_count, 4).getInt32(0, true);
				const _v = _view(_arr, _n * 8);
				const _out: Nsegment[] = [];
				for (let _i = 0; _i < _n; _i++) _out.push(wrapNsegment(Number(_v.getBigUint64(_i * 8, true))) as Nsegment);
				return _out;
			} finally {
				_free(_arr);
			}
		} finally {
			_free(_count);
		}
	}

	/** MEOS: contained_rid_bigint_tnpoint */
	rcontainedRid(rid: number): boolean {
		return F.contained_rid_bigint_tnpoint(rid, this.ptr);
	}

	/** MEOS: tnpoint_route */
	route(): number {
		return F.tnpoint_route(this.ptr);
	}

	/** MEOS: tnpoint_routes */
	routes(): Set {
		return wrapSet(F.tnpoint_routes(this.ptr)) as Set;
	}

	/** MEOS: same_rid_bigint_tnpoint */
	rsameRid(rid: number): boolean {
		return F.same_rid_bigint_tnpoint(rid, this.ptr);
	}

	/** MEOS: same_rid_tnpoint_bigint, same_rid_tnpoint_bigintset, same_rid_tnpoint_npoint, same_rid_tnpoint_tnpoint, chosen by the arguments' types */
	sameRid(rid: number | BigIntSet | Npoint | TNpoint): boolean {
		if (rid instanceof BigIntSet) return this._same_rid_tnpoint_bigintset(rid as BigIntSet);
		if (rid instanceof TNpoint) return this._same_rid_tnpoint_tnpoint(rid as TNpoint);
		if (rid instanceof Npoint) return this._same_rid_tnpoint_npoint(rid as Npoint);
		if (typeof rid === 'number') return this._same_rid_tnpoint_bigint(rid as number);
		throw new TypeError(`TNpoint.sameRid: no overload takes these arguments`);
	}

	/** MEOS: shortestline_tnpoint_geo, shortestline_tnpoint_npoint, shortestline_tnpoint_tnpoint, chosen by the arguments' types */
	shortestline(gs: Geometry | Npoint | TNpoint): Geo | null {
		if (gs instanceof Geometry) return this._shortestline_tnpoint_geo(gs as Geometry);
		if (gs instanceof TNpoint) return this._shortestline_tnpoint_tnpoint(gs as TNpoint);
		if (gs instanceof Npoint) return this._shortestline_tnpoint_npoint(gs as Npoint);
		throw new TypeError(`TNpoint.shortestline: no overload takes these arguments`);
	}

	/** MEOS: tnpoint_speed */
	speed(): Temporal | null {
		return wrapTemporalOrNull(F.tnpoint_speed(this.ptr)) as Temporal | null;
	}

	/** MEOS: tnpoint_start_value */
	startValue(): Npoint {
		return wrapNpoint(F.tnpoint_start_value(this.ptr)) as Npoint;
	}

	/** MEOS: tdistance_tnpoint_npoint, tdistance_tnpoint_geo, tdistance_tnpoint_tnpoint, chosen by the arguments' types */
	tdistance(np: Npoint | Geometry | TNpoint): Temporal | null {
		if (np instanceof Geometry) return this._tdistance_tnpoint_geo(np as Geometry);
		if (np instanceof TNpoint) return this._tdistance_tnpoint_tnpoint(np as TNpoint);
		if (np instanceof Npoint) return this._tdistance_tnpoint_npoint(np as Npoint);
		throw new TypeError(`TNpoint.tdistance: no overload takes these arguments`);
	}

	/** MEOS: teq_tnpoint_npoint, chosen by the arguments' types */
	override teq(np: Npoint | Temporal): Temporal | null {
		if (np instanceof Npoint) return this._teq_tnpoint_npoint(np as Npoint);
		return super.teq(np as Temporal);
	}

	/** MEOS: tne_tnpoint_npoint, chosen by the arguments' types */
	override tne(np: Npoint | Temporal): Temporal | null {
		if (np instanceof Npoint) return this._tne_tnpoint_npoint(np as Npoint);
		return super.tne(np as Temporal);
	}

	/** MEOS: tnpoint_to_tgeompoint */
	toTgeompoint(): Temporal {
		return wrapTemporal(F.tnpoint_to_tgeompoint(this.ptr)) as Temporal;
	}

	/** MEOS: tnpoint_trajectory */
	trajectory(): Geo {
		return wrapGeo(F.tnpoint_trajectory(this.ptr)) as Geo;
	}

	/** MEOS: tnpoint_twcentroid */
	twcentroid(): Geo {
		return wrapGeo(F.tnpoint_twcentroid(this.ptr)) as Geo;
	}

	/** MEOS: tnpoint_value */
	value(): Npoint {
		return wrapNpoint(F.tnpoint_value(this.ptr)) as Npoint;
	}

	/** MEOS: tnpoint_value_n */
	valueN(n: number): Npoint | null {
		return wrapNpointOrNull(F.tnpoint_value_n(this.ptr, n)) as Npoint | null;
	}

	/** MEOS: tnpoint_values */
	values(): Npoint[] {
		const _count = _alloc(4);
		try {
			const _arr = F.tnpoint_values(this.ptr, _count);
			if (!_arr) return [];
			try {
				const _n = _view(_count, 4).getInt32(0, true);
				const _v = _view(_arr, _n * 8);
				const _out: Npoint[] = [];
				for (let _i = 0; _i < _n; _i++) _out.push(wrapNpoint(Number(_v.getBigUint64(_i * 8, true))) as Npoint);
				return _out;
			} finally {
				_free(_arr);
			}
		} finally {
			_free(_count);
		}
	}

	/** MEOS: tnpoint_from_base_temp */
	static fromBaseTemp(np: Npoint, temp: Temporal): TNpoint {
		return wrapTemporal(F.tnpoint_from_base_temp(np.ptr, temp.ptr)) as TNpoint;
	}

	/** MEOS: temporal_from_wkb */
	static fromEWKB(wkb: Uint8Array): Temporal {
		return Temporal.fromWKB(wkb);
	}

	/** MEOS: tnpoint_in */
	static fromEWKT(str: string): TNpoint {
		return TNpoint.in(str);
	}

	/** MEOS: temporal_from_hexwkb */
	static fromHexEWKB(hexwkb: string): Temporal {
		return Temporal.fromHexWKB(hexwkb);
	}

	/** MEOS: tnpoint_from_mfjson */
	static fromMFJSON(mfjson: string): TNpoint {
		return wrapTemporal(F.tnpoint_from_mfjson(mfjson)) as TNpoint;
	}

	/** MEOS: tnpoint_in */
	static fromText(str: string): TNpoint {
		return TNpoint.in(str);
	}

	/** MEOS: tnpoint_in */
	static in(str: string): TNpoint {
		return wrapTemporal(F.tnpoint_in(str)) as TNpoint;
	}
}

/**
 * A TNpoint of subtype TInstant.
 */
export class TNpointInst extends TNpoint {

	/** MEOS: tnpointinst_make */
	static make(np: Npoint, t: TimestampTz): TNpointInst {
		return wrapTemporal(F.tnpointinst_make(np.ptr, t)) as TNpointInst;
	}
}

/**
 * A TNpoint of subtype TSequence.
 */
export class TNpointSeq extends TNpoint {

	/** MEOS: tnpointseq_from_base_tstzset */
	static fromBaseTstzset(np: Npoint, s: Set): TNpointSeq {
		return wrapTemporal(F.tnpointseq_from_base_tstzset(np.ptr, s.ptr)) as TNpointSeq;
	}

	/** MEOS: tnpointseq_from_base_tstzspan */
	static fromBaseTstzspan(np: Npoint, s: Span, interp: number): TNpointSeq {
		return wrapTemporal(F.tnpointseq_from_base_tstzspan(np.ptr, s.ptr, interp)) as TNpointSeq;
	}
}

/**
 * A TNpoint of subtype TSequenceSet.
 */
export class TNpointSeqSet extends TNpoint {

	/** MEOS: tnpointseqset_from_base_tstzspanset */
	static fromBaseTstzspanset(np: Npoint, ss: SpanSet, interp: number): TNpointSeqSet {
		return wrapTemporal(F.tnpointseqset_from_base_tstzspanset(np.ptr, ss.ptr, interp)) as TNpointSeqSet;
	}
}

/**
 * Point-cloud x time box (bbox of TPcpoint and TPcpatch).
 */
export class TPCBox extends Box {

	/** The text MEOS writes this value as (MEOS: tpcbox_out). */
	override toString(): string {
		return this.out(15);
	}

	/** MEOS: above_tpcbox_tpcbox */
	private _above_tpcbox_tpcbox(box2: TPCBox): boolean {
		return F.above_tpcbox_tpcbox(this.ptr, box2.ptr);
	}

	/** MEOS: above_tpcbox_tpointcloud */
	private _above_tpcbox_tpointcloud(temp: TSpatial): boolean {
		return F.above_tpcbox_tpointcloud(this.ptr, temp.ptr);
	}

	/** MEOS: adjacent_tpcbox_tpcbox */
	private _adjacent_tpcbox_tpcbox(box2: TPCBox): boolean {
		return F.adjacent_tpcbox_tpcbox(this.ptr, box2.ptr);
	}

	/** MEOS: adjacent_tpcbox_tpointcloud */
	private _adjacent_tpcbox_tpointcloud(temp: TSpatial): boolean {
		return F.adjacent_tpcbox_tpointcloud(this.ptr, temp.ptr);
	}

	/** MEOS: after_tpcbox_tpcbox */
	private _after_tpcbox_tpcbox(box2: TPCBox): boolean {
		return F.after_tpcbox_tpcbox(this.ptr, box2.ptr);
	}

	/** MEOS: after_tpcbox_tpointcloud */
	private _after_tpcbox_tpointcloud(temp: TSpatial): boolean {
		return F.after_tpcbox_tpointcloud(this.ptr, temp.ptr);
	}

	/** MEOS: back_tpcbox_tpcbox */
	private _back_tpcbox_tpcbox(box2: TPCBox): boolean {
		return F.back_tpcbox_tpcbox(this.ptr, box2.ptr);
	}

	/** MEOS: back_tpcbox_tpointcloud */
	private _back_tpcbox_tpointcloud(temp: TSpatial): boolean {
		return F.back_tpcbox_tpointcloud(this.ptr, temp.ptr);
	}

	/** MEOS: before_tpcbox_tpcbox */
	private _before_tpcbox_tpcbox(box2: TPCBox): boolean {
		return F.before_tpcbox_tpcbox(this.ptr, box2.ptr);
	}

	/** MEOS: before_tpcbox_tpointcloud */
	private _before_tpcbox_tpointcloud(temp: TSpatial): boolean {
		return F.before_tpcbox_tpointcloud(this.ptr, temp.ptr);
	}

	/** MEOS: below_tpcbox_tpcbox */
	private _below_tpcbox_tpcbox(box2: TPCBox): boolean {
		return F.below_tpcbox_tpcbox(this.ptr, box2.ptr);
	}

	/** MEOS: below_tpcbox_tpointcloud */
	private _below_tpcbox_tpointcloud(temp: TSpatial): boolean {
		return F.below_tpcbox_tpointcloud(this.ptr, temp.ptr);
	}

	/** MEOS: contained_tpcbox_tpcbox */
	private _contained_tpcbox_tpcbox(box2: TPCBox): boolean {
		return F.contained_tpcbox_tpcbox(this.ptr, box2.ptr);
	}

	/** MEOS: contained_tpcbox_tpointcloud */
	private _contained_tpcbox_tpointcloud(temp: TSpatial): boolean {
		return F.contained_tpcbox_tpointcloud(this.ptr, temp.ptr);
	}

	/** MEOS: contains_tpcbox_tpcbox */
	private _contains_tpcbox_tpcbox(box2: TPCBox): boolean {
		return F.contains_tpcbox_tpcbox(this.ptr, box2.ptr);
	}

	/** MEOS: contains_tpcbox_tpointcloud */
	private _contains_tpcbox_tpointcloud(temp: TSpatial): boolean {
		return F.contains_tpcbox_tpointcloud(this.ptr, temp.ptr);
	}

	/** MEOS: front_tpcbox_tpcbox */
	private _front_tpcbox_tpcbox(box2: TPCBox): boolean {
		return F.front_tpcbox_tpcbox(this.ptr, box2.ptr);
	}

	/** MEOS: front_tpcbox_tpointcloud */
	private _front_tpcbox_tpointcloud(temp: TSpatial): boolean {
		return F.front_tpcbox_tpointcloud(this.ptr, temp.ptr);
	}

	/** MEOS: left_tpcbox_tpcbox */
	private _left_tpcbox_tpcbox(box2: TPCBox): boolean {
		return F.left_tpcbox_tpcbox(this.ptr, box2.ptr);
	}

	/** MEOS: left_tpcbox_tpointcloud */
	private _left_tpcbox_tpointcloud(temp: TSpatial): boolean {
		return F.left_tpcbox_tpointcloud(this.ptr, temp.ptr);
	}

	/** MEOS: overabove_tpcbox_tpcbox */
	private _overabove_tpcbox_tpcbox(box2: TPCBox): boolean {
		return F.overabove_tpcbox_tpcbox(this.ptr, box2.ptr);
	}

	/** MEOS: overabove_tpcbox_tpointcloud */
	private _overabove_tpcbox_tpointcloud(temp: TSpatial): boolean {
		return F.overabove_tpcbox_tpointcloud(this.ptr, temp.ptr);
	}

	/** MEOS: overafter_tpcbox_tpcbox */
	private _overafter_tpcbox_tpcbox(box2: TPCBox): boolean {
		return F.overafter_tpcbox_tpcbox(this.ptr, box2.ptr);
	}

	/** MEOS: overafter_tpcbox_tpointcloud */
	private _overafter_tpcbox_tpointcloud(temp: TSpatial): boolean {
		return F.overafter_tpcbox_tpointcloud(this.ptr, temp.ptr);
	}

	/** MEOS: overback_tpcbox_tpcbox */
	private _overback_tpcbox_tpcbox(box2: TPCBox): boolean {
		return F.overback_tpcbox_tpcbox(this.ptr, box2.ptr);
	}

	/** MEOS: overback_tpcbox_tpointcloud */
	private _overback_tpcbox_tpointcloud(temp: TSpatial): boolean {
		return F.overback_tpcbox_tpointcloud(this.ptr, temp.ptr);
	}

	/** MEOS: overbefore_tpcbox_tpcbox */
	private _overbefore_tpcbox_tpcbox(box2: TPCBox): boolean {
		return F.overbefore_tpcbox_tpcbox(this.ptr, box2.ptr);
	}

	/** MEOS: overbefore_tpcbox_tpointcloud */
	private _overbefore_tpcbox_tpointcloud(temp: TSpatial): boolean {
		return F.overbefore_tpcbox_tpointcloud(this.ptr, temp.ptr);
	}

	/** MEOS: overbelow_tpcbox_tpcbox */
	private _overbelow_tpcbox_tpcbox(box2: TPCBox): boolean {
		return F.overbelow_tpcbox_tpcbox(this.ptr, box2.ptr);
	}

	/** MEOS: overbelow_tpcbox_tpointcloud */
	private _overbelow_tpcbox_tpointcloud(temp: TSpatial): boolean {
		return F.overbelow_tpcbox_tpointcloud(this.ptr, temp.ptr);
	}

	/** MEOS: overfront_tpcbox_tpcbox */
	private _overfront_tpcbox_tpcbox(box2: TPCBox): boolean {
		return F.overfront_tpcbox_tpcbox(this.ptr, box2.ptr);
	}

	/** MEOS: overfront_tpcbox_tpointcloud */
	private _overfront_tpcbox_tpointcloud(temp: TSpatial): boolean {
		return F.overfront_tpcbox_tpointcloud(this.ptr, temp.ptr);
	}

	/** MEOS: overlaps_tpcbox_tpcbox */
	private _overlaps_tpcbox_tpcbox(box2: TPCBox): boolean {
		return F.overlaps_tpcbox_tpcbox(this.ptr, box2.ptr);
	}

	/** MEOS: overlaps_tpcbox_tpointcloud */
	private _overlaps_tpcbox_tpointcloud(temp: TSpatial): boolean {
		return F.overlaps_tpcbox_tpointcloud(this.ptr, temp.ptr);
	}

	/** MEOS: overleft_tpcbox_tpcbox */
	private _overleft_tpcbox_tpcbox(box2: TPCBox): boolean {
		return F.overleft_tpcbox_tpcbox(this.ptr, box2.ptr);
	}

	/** MEOS: overleft_tpcbox_tpointcloud */
	private _overleft_tpcbox_tpointcloud(temp: TSpatial): boolean {
		return F.overleft_tpcbox_tpointcloud(this.ptr, temp.ptr);
	}

	/** MEOS: overright_tpcbox_tpcbox */
	private _overright_tpcbox_tpcbox(box2: TPCBox): boolean {
		return F.overright_tpcbox_tpcbox(this.ptr, box2.ptr);
	}

	/** MEOS: overright_tpcbox_tpointcloud */
	private _overright_tpcbox_tpointcloud(temp: TSpatial): boolean {
		return F.overright_tpcbox_tpointcloud(this.ptr, temp.ptr);
	}

	/** MEOS: right_tpcbox_tpcbox */
	private _right_tpcbox_tpcbox(box2: TPCBox): boolean {
		return F.right_tpcbox_tpcbox(this.ptr, box2.ptr);
	}

	/** MEOS: right_tpcbox_tpointcloud */
	private _right_tpcbox_tpointcloud(temp: TSpatial): boolean {
		return F.right_tpcbox_tpointcloud(this.ptr, temp.ptr);
	}

	/** MEOS: same_tpcbox_tpcbox */
	private _same_tpcbox_tpcbox(box2: TPCBox): boolean {
		return F.same_tpcbox_tpcbox(this.ptr, box2.ptr);
	}

	/** MEOS: same_tpcbox_tpointcloud */
	private _same_tpcbox_tpointcloud(temp: TSpatial): boolean {
		return F.same_tpcbox_tpointcloud(this.ptr, temp.ptr);
	}

	/** MEOS: above_tpcbox_tpcbox, above_tpcbox_tpointcloud, chosen by the arguments' types */
	above(box2: TPCBox | TSpatial): boolean {
		if (box2 instanceof TPCBox) return this._above_tpcbox_tpcbox(box2 as TPCBox);
		if (box2 instanceof TSpatial) return this._above_tpcbox_tpointcloud(box2 as TSpatial);
		throw new TypeError(`TPCBox.above: no overload takes these arguments`);
	}

	/** MEOS: adjacent_tpcbox_tpcbox, adjacent_tpcbox_tpointcloud, chosen by the arguments' types */
	adjacent(box2: TPCBox | TSpatial): boolean {
		if (box2 instanceof TPCBox) return this._adjacent_tpcbox_tpcbox(box2 as TPCBox);
		if (box2 instanceof TSpatial) return this._adjacent_tpcbox_tpointcloud(box2 as TSpatial);
		throw new TypeError(`TPCBox.adjacent: no overload takes these arguments`);
	}

	/** MEOS: after_tpcbox_tpcbox, after_tpcbox_tpointcloud, chosen by the arguments' types */
	after(box2: TPCBox | TSpatial): boolean {
		if (box2 instanceof TPCBox) return this._after_tpcbox_tpcbox(box2 as TPCBox);
		if (box2 instanceof TSpatial) return this._after_tpcbox_tpointcloud(box2 as TSpatial);
		throw new TypeError(`TPCBox.after: no overload takes these arguments`);
	}

	/** MEOS: tpcbox_as_ewkb */
	asEWKB(variant: number): Uint8Array {
		return readWkb(_sizeOut => F.tpcbox_as_ewkb(this.ptr, variant, _sizeOut));
	}

	/** MEOS: tpcbox_as_hexewkb */
	asHexEWKB(variant: number): string {
		return F.tpcbox_as_hexewkb(this.ptr, variant);
	}

	/** MEOS: tpcbox_as_hexwkb */
	asHexWKB(variant: number): string {
		return F.tpcbox_as_hexwkb(this.ptr, variant);
	}

	/** MEOS: tpcbox_out */
	asText(maxdd: number): string {
		return this.out(maxdd);
	}

	/** MEOS: tpcbox_as_wkb */
	asWKB(variant: number): Uint8Array {
		return readWkb(_sizeOut => F.tpcbox_as_wkb(this.ptr, variant, _sizeOut));
	}

	/** MEOS: back_tpcbox_tpcbox, back_tpcbox_tpointcloud, chosen by the arguments' types */
	back(box2: TPCBox | TSpatial): boolean {
		if (box2 instanceof TPCBox) return this._back_tpcbox_tpcbox(box2 as TPCBox);
		if (box2 instanceof TSpatial) return this._back_tpcbox_tpointcloud(box2 as TSpatial);
		throw new TypeError(`TPCBox.back: no overload takes these arguments`);
	}

	/** MEOS: before_tpcbox_tpcbox, before_tpcbox_tpointcloud, chosen by the arguments' types */
	before(box2: TPCBox | TSpatial): boolean {
		if (box2 instanceof TPCBox) return this._before_tpcbox_tpcbox(box2 as TPCBox);
		if (box2 instanceof TSpatial) return this._before_tpcbox_tpointcloud(box2 as TSpatial);
		throw new TypeError(`TPCBox.before: no overload takes these arguments`);
	}

	/** MEOS: below_tpcbox_tpcbox, below_tpcbox_tpointcloud, chosen by the arguments' types */
	below(box2: TPCBox | TSpatial): boolean {
		if (box2 instanceof TPCBox) return this._below_tpcbox_tpcbox(box2 as TPCBox);
		if (box2 instanceof TSpatial) return this._below_tpcbox_tpointcloud(box2 as TSpatial);
		throw new TypeError(`TPCBox.below: no overload takes these arguments`);
	}

	/** MEOS: tpcbox_cmp */
	cmp(box2: TPCBox): number {
		return F.tpcbox_cmp(this.ptr, box2.ptr);
	}

	/** MEOS: contained_tpcbox_tpcbox, contained_tpcbox_tpointcloud, chosen by the arguments' types */
	contained(box2: TPCBox | TSpatial): boolean {
		if (box2 instanceof TPCBox) return this._contained_tpcbox_tpcbox(box2 as TPCBox);
		if (box2 instanceof TSpatial) return this._contained_tpcbox_tpointcloud(box2 as TSpatial);
		throw new TypeError(`TPCBox.contained: no overload takes these arguments`);
	}

	/** MEOS: contains_tpcbox_tpcbox, contains_tpcbox_tpointcloud, chosen by the arguments' types */
	contains(box2: TPCBox | TSpatial): boolean {
		if (box2 instanceof TPCBox) return this._contains_tpcbox_tpcbox(box2 as TPCBox);
		if (box2 instanceof TSpatial) return this._contains_tpcbox_tpointcloud(box2 as TSpatial);
		throw new TypeError(`TPCBox.contains: no overload takes these arguments`);
	}

	/** MEOS: tpcbox_copy */
	copy(): TPCBox {
		return wrapTPCBox(F.tpcbox_copy(this.ptr)) as TPCBox;
	}

	/** MEOS: tpcbox_eq */
	eq(box2: TPCBox): boolean {
		return F.tpcbox_eq(this.ptr, box2.ptr);
	}

	/** MEOS: front_tpcbox_tpcbox, front_tpcbox_tpointcloud, chosen by the arguments' types */
	front(box2: TPCBox | TSpatial): boolean {
		if (box2 instanceof TPCBox) return this._front_tpcbox_tpcbox(box2 as TPCBox);
		if (box2 instanceof TSpatial) return this._front_tpcbox_tpointcloud(box2 as TSpatial);
		throw new TypeError(`TPCBox.front: no overload takes these arguments`);
	}

	/** MEOS: tpcbox_ge */
	ge(box2: TPCBox): boolean {
		return F.tpcbox_ge(this.ptr, box2.ptr);
	}

	/** MEOS: tpcbox_geodetic */
	geodetic(): boolean {
		return F.tpcbox_geodetic(this.ptr);
	}

	/** MEOS: tpcbox_gt */
	gt(box2: TPCBox): boolean {
		return F.tpcbox_gt(this.ptr, box2.ptr);
	}

	/** MEOS: tpcbox_hast */
	hast(): boolean {
		return F.tpcbox_hast(this.ptr);
	}

	/** MEOS: tpcbox_hasx */
	hasx(): boolean {
		return F.tpcbox_hasx(this.ptr);
	}

	/** MEOS: tpcbox_hasz */
	hasz(): boolean {
		return F.tpcbox_hasz(this.ptr);
	}

	/** MEOS: intersection_tpcbox_tpcbox */
	intersection(box2: TPCBox): TPCBox | null {
		return wrapTPCBoxOrNull(F.intersection_tpcbox_tpcbox(this.ptr, box2.ptr)) as TPCBox | null;
	}

	/** MEOS: tpcbox_le */
	le(box2: TPCBox): boolean {
		return F.tpcbox_le(this.ptr, box2.ptr);
	}

	/** MEOS: left_tpcbox_tpcbox, left_tpcbox_tpointcloud, chosen by the arguments' types */
	left(box2: TPCBox | TSpatial): boolean {
		if (box2 instanceof TPCBox) return this._left_tpcbox_tpcbox(box2 as TPCBox);
		if (box2 instanceof TSpatial) return this._left_tpcbox_tpointcloud(box2 as TSpatial);
		throw new TypeError(`TPCBox.left: no overload takes these arguments`);
	}

	/** MEOS: tpcbox_lt */
	lt(box2: TPCBox): boolean {
		return F.tpcbox_lt(this.ptr, box2.ptr);
	}

	/** MEOS: nad_tpcbox_tpcbox */
	nad(box2: TPCBox): number {
		return F.nad_tpcbox_tpcbox(this.ptr, box2.ptr);
	}

	/** MEOS: tpcbox_ne */
	ne(box2: TPCBox): boolean {
		return F.tpcbox_ne(this.ptr, box2.ptr);
	}

	/** MEOS: tpcbox_out */
	out(maxdd: number): string {
		return F.tpcbox_out(this.ptr, maxdd);
	}

	/** MEOS: overabove_tpcbox_tpcbox, overabove_tpcbox_tpointcloud, chosen by the arguments' types */
	overabove(box2: TPCBox | TSpatial): boolean {
		if (box2 instanceof TPCBox) return this._overabove_tpcbox_tpcbox(box2 as TPCBox);
		if (box2 instanceof TSpatial) return this._overabove_tpcbox_tpointcloud(box2 as TSpatial);
		throw new TypeError(`TPCBox.overabove: no overload takes these arguments`);
	}

	/** MEOS: overafter_tpcbox_tpcbox, overafter_tpcbox_tpointcloud, chosen by the arguments' types */
	overafter(box2: TPCBox | TSpatial): boolean {
		if (box2 instanceof TPCBox) return this._overafter_tpcbox_tpcbox(box2 as TPCBox);
		if (box2 instanceof TSpatial) return this._overafter_tpcbox_tpointcloud(box2 as TSpatial);
		throw new TypeError(`TPCBox.overafter: no overload takes these arguments`);
	}

	/** MEOS: overback_tpcbox_tpcbox, overback_tpcbox_tpointcloud, chosen by the arguments' types */
	overback(box2: TPCBox | TSpatial): boolean {
		if (box2 instanceof TPCBox) return this._overback_tpcbox_tpcbox(box2 as TPCBox);
		if (box2 instanceof TSpatial) return this._overback_tpcbox_tpointcloud(box2 as TSpatial);
		throw new TypeError(`TPCBox.overback: no overload takes these arguments`);
	}

	/** MEOS: overbefore_tpcbox_tpcbox, overbefore_tpcbox_tpointcloud, chosen by the arguments' types */
	overbefore(box2: TPCBox | TSpatial): boolean {
		if (box2 instanceof TPCBox) return this._overbefore_tpcbox_tpcbox(box2 as TPCBox);
		if (box2 instanceof TSpatial) return this._overbefore_tpcbox_tpointcloud(box2 as TSpatial);
		throw new TypeError(`TPCBox.overbefore: no overload takes these arguments`);
	}

	/** MEOS: overbelow_tpcbox_tpcbox, overbelow_tpcbox_tpointcloud, chosen by the arguments' types */
	overbelow(box2: TPCBox | TSpatial): boolean {
		if (box2 instanceof TPCBox) return this._overbelow_tpcbox_tpcbox(box2 as TPCBox);
		if (box2 instanceof TSpatial) return this._overbelow_tpcbox_tpointcloud(box2 as TSpatial);
		throw new TypeError(`TPCBox.overbelow: no overload takes these arguments`);
	}

	/** MEOS: overfront_tpcbox_tpcbox, overfront_tpcbox_tpointcloud, chosen by the arguments' types */
	overfront(box2: TPCBox | TSpatial): boolean {
		if (box2 instanceof TPCBox) return this._overfront_tpcbox_tpcbox(box2 as TPCBox);
		if (box2 instanceof TSpatial) return this._overfront_tpcbox_tpointcloud(box2 as TSpatial);
		throw new TypeError(`TPCBox.overfront: no overload takes these arguments`);
	}

	/** MEOS: overlaps_tpcbox_tpcbox, overlaps_tpcbox_tpointcloud, chosen by the arguments' types */
	overlaps(box2: TPCBox | TSpatial): boolean {
		if (box2 instanceof TPCBox) return this._overlaps_tpcbox_tpcbox(box2 as TPCBox);
		if (box2 instanceof TSpatial) return this._overlaps_tpcbox_tpointcloud(box2 as TSpatial);
		throw new TypeError(`TPCBox.overlaps: no overload takes these arguments`);
	}

	/** MEOS: overleft_tpcbox_tpcbox, overleft_tpcbox_tpointcloud, chosen by the arguments' types */
	overleft(box2: TPCBox | TSpatial): boolean {
		if (box2 instanceof TPCBox) return this._overleft_tpcbox_tpcbox(box2 as TPCBox);
		if (box2 instanceof TSpatial) return this._overleft_tpcbox_tpointcloud(box2 as TSpatial);
		throw new TypeError(`TPCBox.overleft: no overload takes these arguments`);
	}

	/** MEOS: overright_tpcbox_tpcbox, overright_tpcbox_tpointcloud, chosen by the arguments' types */
	overright(box2: TPCBox | TSpatial): boolean {
		if (box2 instanceof TPCBox) return this._overright_tpcbox_tpcbox(box2 as TPCBox);
		if (box2 instanceof TSpatial) return this._overright_tpcbox_tpointcloud(box2 as TSpatial);
		throw new TypeError(`TPCBox.overright: no overload takes these arguments`);
	}

	/** MEOS: tpcbox_pcid */
	pcid(): number {
		return F.tpcbox_pcid(this.ptr);
	}

	/** MEOS: right_tpcbox_tpcbox, right_tpcbox_tpointcloud, chosen by the arguments' types */
	right(box2: TPCBox | TSpatial): boolean {
		if (box2 instanceof TPCBox) return this._right_tpcbox_tpcbox(box2 as TPCBox);
		if (box2 instanceof TSpatial) return this._right_tpcbox_tpointcloud(box2 as TSpatial);
		throw new TypeError(`TPCBox.right: no overload takes these arguments`);
	}

	/** MEOS: tpcbox_round */
	round(maxdd: number): TPCBox | null {
		return wrapTPCBoxOrNull(F.tpcbox_round(this.ptr, maxdd)) as TPCBox | null;
	}

	/** MEOS: same_tpcbox_tpcbox, same_tpcbox_tpointcloud, chosen by the arguments' types */
	same(box2: TPCBox | TSpatial): boolean {
		if (box2 instanceof TPCBox) return this._same_tpcbox_tpcbox(box2 as TPCBox);
		if (box2 instanceof TSpatial) return this._same_tpcbox_tpointcloud(box2 as TSpatial);
		throw new TypeError(`TPCBox.same: no overload takes these arguments`);
	}

	/** MEOS: tpcbox_set_srid */
	setSRID(srid: number): TPCBox | null {
		return wrapTPCBoxOrNull(F.tpcbox_set_srid(this.ptr, srid)) as TPCBox | null;
	}

	/** MEOS: tpcbox_sortkey */
	sortkey(): Uint8Array {
		return readWkb(_sizeOut => F.tpcbox_sortkey(this.ptr, _sizeOut));
	}

	/** MEOS: tpcbox_srid */
	SRID(): number {
		return F.tpcbox_srid(this.ptr);
	}

	/** MEOS: tpcbox_tmax */
	tmax(): TimestampTz {
		return F.tpcbox_tmax(this.ptr);
	}

	/** MEOS: tpcbox_tmax_inc */
	tmaxInc(): boolean {
		return F.tpcbox_tmax_inc(this.ptr);
	}

	/** MEOS: tpcbox_tmin */
	tmin(): TimestampTz {
		return F.tpcbox_tmin(this.ptr);
	}

	/** MEOS: tpcbox_tmin_inc */
	tminInc(): boolean {
		return F.tpcbox_tmin_inc(this.ptr);
	}

	/** MEOS: tpcbox_to_stbox */
	toStbox(): STBox {
		return wrapSTBox(F.tpcbox_to_stbox(this.ptr)) as STBox;
	}

	/** MEOS: union_tpcbox_tpcbox */
	union(box2: TPCBox, strict: boolean): TPCBox | null {
		return wrapTPCBoxOrNull(F.union_tpcbox_tpcbox(this.ptr, box2.ptr, strict)) as TPCBox | null;
	}

	/** MEOS: tpcbox_xmax */
	xmax(): number {
		return F.tpcbox_xmax(this.ptr);
	}

	/** MEOS: tpcbox_xmin */
	xmin(): number {
		return F.tpcbox_xmin(this.ptr);
	}

	/** MEOS: tpcbox_ymax */
	ymax(): number {
		return F.tpcbox_ymax(this.ptr);
	}

	/** MEOS: tpcbox_ymin */
	ymin(): number {
		return F.tpcbox_ymin(this.ptr);
	}

	/** MEOS: tpcbox_zmax */
	zmax(): number {
		return F.tpcbox_zmax(this.ptr);
	}

	/** MEOS: tpcbox_zmin */
	zmin(): number {
		return F.tpcbox_zmin(this.ptr);
	}

	/** MEOS: tpcbox_from_wkb */
	static fromEWKB(wkb: Uint8Array): TPCBox {
		return TPCBox.fromWKB(wkb);
	}

	/** MEOS: tpcbox_from_hexwkb */
	static fromHexEWKB(hexwkb: string): TPCBox {
		return TPCBox.fromHexWKB(hexwkb);
	}

	/** MEOS: tpcbox_from_hexwkb */
	static fromHexWKB(hexwkb: string): TPCBox {
		return wrapTPCBox(F.tpcbox_from_hexwkb(hexwkb)) as TPCBox;
	}

	/** MEOS: tpcbox_in */
	static fromText(str: string): TPCBox {
		return TPCBox.in(str);
	}

	/** MEOS: tpcbox_from_wkb */
	static fromWKB(wkb: Uint8Array): TPCBox {
		const _wkb = _bytes(wkb);
		try {
			return wrapTPCBox(F.tpcbox_from_wkb(_wkb, wkb.length)) as TPCBox;
		} finally {
			_free(_wkb);
		}
	}

	/** MEOS: tpcbox_in */
	static in(str: string): TPCBox {
		return wrapTPCBox(F.tpcbox_in(str)) as TPCBox;
	}

	/** MEOS: tpcbox_make */
	static make(hasx: boolean, hasz: boolean, geodetic: boolean, pcid: number, xmin: number, xmax: number, ymin: number, ymax: number, zmin: number, zmax: number, period: Span): TPCBox {
		return wrapTPCBox(F.tpcbox_make(hasx, hasz, geodetic, pcid, xmin, xmax, ymin, ymax, zmin, zmax, period.ptr)) as TPCBox;
	}
}

/**
 * The TPcpatch class of the MEOS object model.
 */
export class TPcpatch extends TSpatial {

	/** The text MEOS writes this value as (MEOS: tpcpatch_out). */
	override toString(): string {
		return this.out();
	}

	/** MEOS: always_eq_tpcpatch_pcpatch */
	private _always_eq_tpcpatch_pcpatch(pa: Pcpatch): number {
		return F.always_eq_tpcpatch_pcpatch(this.ptr, pa.ptr);
	}

	/** MEOS: always_eq_tpcpatch_tpcpatch */
	private _always_eq_tpcpatch_tpcpatch(temp2: TPcpatch): number {
		return F.always_eq_tpcpatch_tpcpatch(this.ptr, temp2.ptr);
	}

	/** MEOS: always_ne_tpcpatch_pcpatch */
	private _always_ne_tpcpatch_pcpatch(pa: Pcpatch): number {
		return F.always_ne_tpcpatch_pcpatch(this.ptr, pa.ptr);
	}

	/** MEOS: always_ne_tpcpatch_tpcpatch */
	private _always_ne_tpcpatch_tpcpatch(temp2: TPcpatch): number {
		return F.always_ne_tpcpatch_tpcpatch(this.ptr, temp2.ptr);
	}

	/** MEOS: ever_eq_tpcpatch_pcpatch */
	private _ever_eq_tpcpatch_pcpatch(pa: Pcpatch): number {
		return F.ever_eq_tpcpatch_pcpatch(this.ptr, pa.ptr);
	}

	/** MEOS: ever_eq_tpcpatch_tpcpatch */
	private _ever_eq_tpcpatch_tpcpatch(temp2: TPcpatch): number {
		return F.ever_eq_tpcpatch_tpcpatch(this.ptr, temp2.ptr);
	}

	/** MEOS: ever_ne_tpcpatch_pcpatch */
	private _ever_ne_tpcpatch_pcpatch(pa: Pcpatch): number {
		return F.ever_ne_tpcpatch_pcpatch(this.ptr, pa.ptr);
	}

	/** MEOS: ever_ne_tpcpatch_tpcpatch */
	private _ever_ne_tpcpatch_tpcpatch(temp2: TPcpatch): number {
		return F.ever_ne_tpcpatch_tpcpatch(this.ptr, temp2.ptr);
	}

	/** MEOS: teq_tpcpatch_pcpatch */
	private _teq_tpcpatch_pcpatch(pa: Pcpatch): Temporal | null {
		return wrapTemporalOrNull(F.teq_tpcpatch_pcpatch(this.ptr, pa.ptr)) as Temporal | null;
	}

	/** MEOS: tne_tpcpatch_pcpatch */
	private _tne_tpcpatch_pcpatch(pa: Pcpatch): Temporal | null {
		return wrapTemporalOrNull(F.tne_tpcpatch_pcpatch(this.ptr, pa.ptr)) as Temporal | null;
	}

	/** MEOS: always_eq_tpcpatch_pcpatch, always_eq_tpcpatch_tpcpatch, chosen by the arguments' types */
	override alwaysEq(pa: Pcpatch | TPcpatch | Temporal): number {
		if (pa instanceof TPcpatch) return this._always_eq_tpcpatch_tpcpatch(pa as TPcpatch);
		if (pa instanceof Pcpatch) return this._always_eq_tpcpatch_pcpatch(pa as Pcpatch);
		return super.alwaysEq(pa as Temporal);
	}

	/** MEOS: always_ne_tpcpatch_pcpatch, always_ne_tpcpatch_tpcpatch, chosen by the arguments' types */
	override alwaysNe(pa: Pcpatch | TPcpatch | Temporal): number {
		if (pa instanceof TPcpatch) return this._always_ne_tpcpatch_tpcpatch(pa as TPcpatch);
		if (pa instanceof Pcpatch) return this._always_ne_tpcpatch_pcpatch(pa as Pcpatch);
		return super.alwaysNe(pa as Temporal);
	}

	/** MEOS: tpcpatch_at_value */
	atValue(pa: Pcpatch): Temporal | null {
		return wrapTemporalOrNull(F.tpcpatch_at_value(this.ptr, pa.ptr)) as Temporal | null;
	}

	/** MEOS: tpcpatch_end_npoints */
	endNpoints(): number {
		return F.tpcpatch_end_npoints(this.ptr);
	}

	/** MEOS: tpcpatch_end_value */
	endValue(): Pcpatch {
		return wrapPcpatch(F.tpcpatch_end_value(this.ptr)) as Pcpatch;
	}

	/** MEOS: ever_eq_tpcpatch_pcpatch, ever_eq_tpcpatch_tpcpatch, chosen by the arguments' types */
	override everEq(pa: Pcpatch | TPcpatch | Temporal): number {
		if (pa instanceof TPcpatch) return this._ever_eq_tpcpatch_tpcpatch(pa as TPcpatch);
		if (pa instanceof Pcpatch) return this._ever_eq_tpcpatch_pcpatch(pa as Pcpatch);
		return super.everEq(pa as Temporal);
	}

	/** MEOS: ever_ne_tpcpatch_pcpatch, ever_ne_tpcpatch_tpcpatch, chosen by the arguments' types */
	override everNe(pa: Pcpatch | TPcpatch | Temporal): number {
		if (pa instanceof TPcpatch) return this._ever_ne_tpcpatch_tpcpatch(pa as TPcpatch);
		if (pa instanceof Pcpatch) return this._ever_ne_tpcpatch_pcpatch(pa as Pcpatch);
		return super.everNe(pa as Temporal);
	}

	/** MEOS: tpcpatch_minus_value */
	minusValue(pa: Pcpatch): Temporal | null {
		return wrapTemporalOrNull(F.tpcpatch_minus_value(this.ptr, pa.ptr)) as Temporal | null;
	}

	/** MEOS: tpcpatch_npoints */
	npoints(): number {
		return F.tpcpatch_npoints(this.ptr);
	}

	/** MEOS: tpcpatch_out */
	override out(): string {
		return F.tpcpatch_out(this.ptr);
	}

	/** MEOS: tpcpatch_pcid */
	pcid(): number {
		return F.tpcpatch_pcid(this.ptr);
	}

	/** MEOS: tpcpatch_start_npoints */
	startNpoints(): number {
		return F.tpcpatch_start_npoints(this.ptr);
	}

	/** MEOS: tpcpatch_start_value */
	startValue(): Pcpatch {
		return wrapPcpatch(F.tpcpatch_start_value(this.ptr)) as Pcpatch;
	}

	/** MEOS: tpcpatch_swath */
	swath(maxt: Interval): Geo | null {
		const _maxt = _putInterval(maxt);
		try {
			return wrapGeoOrNull(F.tpcpatch_swath(this.ptr, _maxt)) as Geo | null;
		} finally {
			_free(_maxt);
		}
	}

	/** MEOS: teq_tpcpatch_pcpatch, chosen by the arguments' types */
	override teq(pa: Pcpatch | Temporal): Temporal | null {
		if (pa instanceof Pcpatch) return this._teq_tpcpatch_pcpatch(pa as Pcpatch);
		return super.teq(pa as Temporal);
	}

	/** MEOS: tne_tpcpatch_pcpatch, chosen by the arguments' types */
	override tne(pa: Pcpatch | Temporal): Temporal | null {
		if (pa instanceof Pcpatch) return this._tne_tpcpatch_pcpatch(pa as Pcpatch);
		return super.tne(pa as Temporal);
	}

	/** MEOS: tpcpatch_to_tgeometry */
	toTgeometry(): Temporal | null {
		return wrapTemporalOrNull(F.tpcpatch_to_tgeometry(this.ptr)) as Temporal | null;
	}

	/** MEOS: tpcpatch_value */
	value(): Pcpatch {
		return wrapPcpatch(F.tpcpatch_value(this.ptr)) as Pcpatch;
	}

	/** MEOS: tpcpatch_value_n */
	valueN(n: number): Pcpatch | null {
		return wrapPcpatchOrNull(F.tpcpatch_value_n(this.ptr, n)) as Pcpatch | null;
	}

	/** MEOS: tpcpatch_values */
	values(): Pcpatch[] {
		const _count = _alloc(4);
		try {
			const _arr = F.tpcpatch_values(this.ptr, _count);
			if (!_arr) return [];
			try {
				const _n = _view(_count, 4).getInt32(0, true);
				const _v = _view(_arr, _n * 8);
				const _out: Pcpatch[] = [];
				for (let _i = 0; _i < _n; _i++) _out.push(wrapPcpatch(Number(_v.getBigUint64(_i * 8, true))) as Pcpatch);
				return _out;
			} finally {
				_free(_arr);
			}
		} finally {
			_free(_count);
		}
	}

	/** MEOS: tpcpatch_from_base_temp */
	static fromBaseTemp(pa: Pcpatch, temp: Temporal): TPcpatch {
		return wrapTemporal(F.tpcpatch_from_base_temp(pa.ptr, temp.ptr)) as TPcpatch;
	}

	/** MEOS: temporal_from_wkb */
	static fromEWKB(wkb: Uint8Array): Temporal {
		return Temporal.fromWKB(wkb);
	}

	/** MEOS: tpcpatch_in */
	static fromEWKT(str: string): TPcpatch {
		return TPcpatch.in(str);
	}

	/** MEOS: temporal_from_hexwkb */
	static fromHexEWKB(hexwkb: string): Temporal {
		return Temporal.fromHexWKB(hexwkb);
	}

	/** MEOS: tpcpatch_from_mfjson */
	static fromMFJSON(mfjson: string): TPcpatch {
		return wrapTemporal(F.tpcpatch_from_mfjson(mfjson)) as TPcpatch;
	}

	/** MEOS: tpcpatch_in */
	static fromText(str: string): TPcpatch {
		return TPcpatch.in(str);
	}

	/** MEOS: tpcpatch_in */
	static in(str: string): TPcpatch {
		return wrapTemporal(F.tpcpatch_in(str)) as TPcpatch;
	}
}

/**
 * A TPcpatch of subtype TInstant.
 */
export class TPcpatchInst extends TPcpatch {

	/** MEOS: tpcpatchinst_make */
	static make(pa: Pcpatch, t: TimestampTz): TPcpatchInst {
		return wrapTemporal(F.tpcpatchinst_make(pa.ptr, t)) as TPcpatchInst;
	}
}

/**
 * A TPcpatch of subtype TSequence.
 */
export class TPcpatchSeq extends TPcpatch {

	/** MEOS: tpcpatchseq_from_base_tstzset */
	static fromBaseTstzset(pa: Pcpatch, s: Set): TPcpatchSeq {
		return wrapTemporal(F.tpcpatchseq_from_base_tstzset(pa.ptr, s.ptr)) as TPcpatchSeq;
	}

	/** MEOS: tpcpatchseq_from_base_tstzspan */
	static fromBaseTstzspan(pa: Pcpatch, sp: Span): TPcpatchSeq {
		return wrapTemporal(F.tpcpatchseq_from_base_tstzspan(pa.ptr, sp.ptr)) as TPcpatchSeq;
	}
}

/**
 * A TPcpatch of subtype TSequenceSet.
 */
export class TPcpatchSeqSet extends TPcpatch {

	/** MEOS: tpcpatchseqset_from_base_tstzspanset */
	static fromBaseTstzspanset(pa: Pcpatch, ss: SpanSet): TPcpatchSeqSet {
		return wrapTemporal(F.tpcpatchseqset_from_base_tstzspanset(pa.ptr, ss.ptr)) as TPcpatchSeqSet;
	}
}

/**
 * The TPcpoint class of the MEOS object model.
 */
export class TPcpoint extends TSpatial {

	/** The text MEOS writes this value as (MEOS: tpcpoint_out). */
	override toString(): string {
		return this.out();
	}

	/** MEOS: always_eq_tpcpoint_pcpoint */
	private _always_eq_tpcpoint_pcpoint(pt: Pcpoint): number {
		return F.always_eq_tpcpoint_pcpoint(this.ptr, pt.ptr);
	}

	/** MEOS: always_eq_tpcpoint_tpcpoint */
	private _always_eq_tpcpoint_tpcpoint(temp2: TPcpoint): number {
		return F.always_eq_tpcpoint_tpcpoint(this.ptr, temp2.ptr);
	}

	/** MEOS: always_ne_tpcpoint_pcpoint */
	private _always_ne_tpcpoint_pcpoint(pt: Pcpoint): number {
		return F.always_ne_tpcpoint_pcpoint(this.ptr, pt.ptr);
	}

	/** MEOS: always_ne_tpcpoint_tpcpoint */
	private _always_ne_tpcpoint_tpcpoint(temp2: TPcpoint): number {
		return F.always_ne_tpcpoint_tpcpoint(this.ptr, temp2.ptr);
	}

	/** MEOS: ever_eq_tpcpoint_pcpoint */
	private _ever_eq_tpcpoint_pcpoint(pt: Pcpoint): number {
		return F.ever_eq_tpcpoint_pcpoint(this.ptr, pt.ptr);
	}

	/** MEOS: ever_eq_tpcpoint_tpcpoint */
	private _ever_eq_tpcpoint_tpcpoint(temp2: TPcpoint): number {
		return F.ever_eq_tpcpoint_tpcpoint(this.ptr, temp2.ptr);
	}

	/** MEOS: ever_ne_tpcpoint_pcpoint */
	private _ever_ne_tpcpoint_pcpoint(pt: Pcpoint): number {
		return F.ever_ne_tpcpoint_pcpoint(this.ptr, pt.ptr);
	}

	/** MEOS: ever_ne_tpcpoint_tpcpoint */
	private _ever_ne_tpcpoint_tpcpoint(temp2: TPcpoint): number {
		return F.ever_ne_tpcpoint_tpcpoint(this.ptr, temp2.ptr);
	}

	/** MEOS: teq_tpcpoint_pcpoint */
	private _teq_tpcpoint_pcpoint(pt: Pcpoint): Temporal | null {
		return wrapTemporalOrNull(F.teq_tpcpoint_pcpoint(this.ptr, pt.ptr)) as Temporal | null;
	}

	/** MEOS: tne_tpcpoint_pcpoint */
	private _tne_tpcpoint_pcpoint(pt: Pcpoint): Temporal | null {
		return wrapTemporalOrNull(F.tne_tpcpoint_pcpoint(this.ptr, pt.ptr)) as Temporal | null;
	}

	/** MEOS: always_eq_tpcpoint_pcpoint, always_eq_tpcpoint_tpcpoint, chosen by the arguments' types */
	override alwaysEq(pt: Pcpoint | TPcpoint | Temporal): number {
		if (pt instanceof TPcpoint) return this._always_eq_tpcpoint_tpcpoint(pt as TPcpoint);
		if (pt instanceof Pcpoint) return this._always_eq_tpcpoint_pcpoint(pt as Pcpoint);
		return super.alwaysEq(pt as Temporal);
	}

	/** MEOS: always_ne_tpcpoint_pcpoint, always_ne_tpcpoint_tpcpoint, chosen by the arguments' types */
	override alwaysNe(pt: Pcpoint | TPcpoint | Temporal): number {
		if (pt instanceof TPcpoint) return this._always_ne_tpcpoint_tpcpoint(pt as TPcpoint);
		if (pt instanceof Pcpoint) return this._always_ne_tpcpoint_pcpoint(pt as Pcpoint);
		return super.alwaysNe(pt as Temporal);
	}

	/** MEOS: tpcpoint_at_value */
	atValue(pt: Pcpoint): Temporal | null {
		return wrapTemporalOrNull(F.tpcpoint_at_value(this.ptr, pt.ptr)) as Temporal | null;
	}

	/** MEOS: eintersects_tpcpoint_geo */
	eintersects(gs: Geo): boolean {
		return F.eintersects_tpcpoint_geo(this.ptr, gs.ptr);
	}

	/** MEOS: tpcpoint_end_value */
	endValue(): Pcpoint {
		return wrapPcpoint(F.tpcpoint_end_value(this.ptr)) as Pcpoint;
	}

	/** MEOS: ever_eq_tpcpoint_pcpoint, ever_eq_tpcpoint_tpcpoint, chosen by the arguments' types */
	override everEq(pt: Pcpoint | TPcpoint | Temporal): number {
		if (pt instanceof TPcpoint) return this._ever_eq_tpcpoint_tpcpoint(pt as TPcpoint);
		if (pt instanceof Pcpoint) return this._ever_eq_tpcpoint_pcpoint(pt as Pcpoint);
		return super.everEq(pt as Temporal);
	}

	/** MEOS: ever_ne_tpcpoint_pcpoint, ever_ne_tpcpoint_tpcpoint, chosen by the arguments' types */
	override everNe(pt: Pcpoint | TPcpoint | Temporal): number {
		if (pt instanceof TPcpoint) return this._ever_ne_tpcpoint_tpcpoint(pt as TPcpoint);
		if (pt instanceof Pcpoint) return this._ever_ne_tpcpoint_pcpoint(pt as Pcpoint);
		return super.everNe(pt as Temporal);
	}

	/** MEOS: tpcpoint_minus_value */
	minusValue(pt: Pcpoint): Temporal | null {
		return wrapTemporalOrNull(F.tpcpoint_minus_value(this.ptr, pt.ptr)) as Temporal | null;
	}

	/** MEOS: nad_tpcpoint_geo */
	nad(gs: Geo): number {
		return F.nad_tpcpoint_geo(this.ptr, gs.ptr);
	}

	/** MEOS: tpcpoint_out */
	override out(): string {
		return F.tpcpoint_out(this.ptr);
	}

	/** MEOS: tpcpoint_pcid */
	pcid(): number {
		return F.tpcpoint_pcid(this.ptr);
	}

	/** MEOS: tpcpoint_start_value */
	startValue(): Pcpoint {
		return wrapPcpoint(F.tpcpoint_start_value(this.ptr)) as Pcpoint;
	}

	/** MEOS: teq_tpcpoint_pcpoint, chosen by the arguments' types */
	override teq(pt: Pcpoint | Temporal): Temporal | null {
		if (pt instanceof Pcpoint) return this._teq_tpcpoint_pcpoint(pt as Pcpoint);
		return super.teq(pt as Temporal);
	}

	/** MEOS: tne_tpcpoint_pcpoint, chosen by the arguments' types */
	override tne(pt: Pcpoint | Temporal): Temporal | null {
		if (pt instanceof Pcpoint) return this._tne_tpcpoint_pcpoint(pt as Pcpoint);
		return super.tne(pt as Temporal);
	}

	/** MEOS: tpcpoint_to_tgeompoint */
	toTgeompoint(): Temporal | null {
		return wrapTemporalOrNull(F.tpcpoint_to_tgeompoint(this.ptr)) as Temporal | null;
	}

	/** MEOS: tpcpoint_value */
	value(): Pcpoint {
		return wrapPcpoint(F.tpcpoint_value(this.ptr)) as Pcpoint;
	}

	/** MEOS: tpcpoint_value_n */
	valueN(n: number): Pcpoint | null {
		return wrapPcpointOrNull(F.tpcpoint_value_n(this.ptr, n)) as Pcpoint | null;
	}

	/** MEOS: tpcpoint_values */
	values(): Pcpoint[] {
		const _count = _alloc(4);
		try {
			const _arr = F.tpcpoint_values(this.ptr, _count);
			if (!_arr) return [];
			try {
				const _n = _view(_count, 4).getInt32(0, true);
				const _v = _view(_arr, _n * 8);
				const _out: Pcpoint[] = [];
				for (let _i = 0; _i < _n; _i++) _out.push(wrapPcpoint(Number(_v.getBigUint64(_i * 8, true))) as Pcpoint);
				return _out;
			} finally {
				_free(_arr);
			}
		} finally {
			_free(_count);
		}
	}

	/** MEOS: tpcpoint_from_base_temp */
	static fromBaseTemp(pt: Pcpoint, temp: Temporal): TPcpoint {
		return wrapTemporal(F.tpcpoint_from_base_temp(pt.ptr, temp.ptr)) as TPcpoint;
	}

	/** MEOS: temporal_from_wkb */
	static fromEWKB(wkb: Uint8Array): Temporal {
		return Temporal.fromWKB(wkb);
	}

	/** MEOS: tpcpoint_in */
	static fromEWKT(str: string): TPcpoint {
		return TPcpoint.in(str);
	}

	/** MEOS: temporal_from_hexwkb */
	static fromHexEWKB(hexwkb: string): Temporal {
		return Temporal.fromHexWKB(hexwkb);
	}

	/** MEOS: tpcpoint_from_mfjson */
	static fromMFJSON(mfjson: string): TPcpoint {
		return wrapTemporal(F.tpcpoint_from_mfjson(mfjson)) as TPcpoint;
	}

	/** MEOS: tpcpoint_in */
	static fromText(str: string): TPcpoint {
		return TPcpoint.in(str);
	}

	/** MEOS: tpcpoint_in */
	static in(str: string): TPcpoint {
		return wrapTemporal(F.tpcpoint_in(str)) as TPcpoint;
	}
}

/**
 * A TPcpoint of subtype TInstant.
 */
export class TPcpointInst extends TPcpoint {

	/** MEOS: tpcpointinst_make */
	static make(pt: Pcpoint, t: TimestampTz): TPcpointInst {
		return wrapTemporal(F.tpcpointinst_make(pt.ptr, t)) as TPcpointInst;
	}
}

/**
 * A TPcpoint of subtype TSequence.
 */
export class TPcpointSeq extends TPcpoint {

	/** MEOS: tpcpointseq_from_base_tstzset */
	static fromBaseTstzset(pt: Pcpoint, s: Set): TPcpointSeq {
		return wrapTemporal(F.tpcpointseq_from_base_tstzset(pt.ptr, s.ptr)) as TPcpointSeq;
	}

	/** MEOS: tpcpointseq_from_base_tstzspan */
	static fromBaseTstzspan(pt: Pcpoint, sp: Span): TPcpointSeq {
		return wrapTemporal(F.tpcpointseq_from_base_tstzspan(pt.ptr, sp.ptr)) as TPcpointSeq;
	}
}

/**
 * A TPcpoint of subtype TSequenceSet.
 */
export class TPcpointSeqSet extends TPcpoint {

	/** MEOS: tpcpointseqset_from_base_tstzspanset */
	static fromBaseTstzspanset(pt: Pcpoint, ss: SpanSet): TPcpointSeqSet {
		return wrapTemporal(F.tpcpointseqset_from_base_tstzspanset(pt.ptr, ss.ptr)) as TPcpointSeqSet;
	}
}

/**
 * The TPose class of the MEOS object model.
 */
export class TPose extends TSpatial {

	/** The text MEOS writes this value as (MEOS: tspatial_as_text). */
	override toString(): string {
		return this.asText(15);
	}

	/** MEOS: always_eq_tpose_pose */
	private _always_eq_tpose_pose(pose: Pose): number {
		return F.always_eq_tpose_pose(this.ptr, pose.ptr);
	}

	/** MEOS: always_eq_tpose_tpose */
	private _always_eq_tpose_tpose(temp2: TPose): number {
		return F.always_eq_tpose_tpose(this.ptr, temp2.ptr);
	}

	/** MEOS: always_ne_tpose_pose */
	private _always_ne_tpose_pose(pose: Pose): number {
		return F.always_ne_tpose_pose(this.ptr, pose.ptr);
	}

	/** MEOS: always_ne_tpose_tpose */
	private _always_ne_tpose_tpose(temp2: TPose): number {
		return F.always_ne_tpose_tpose(this.ptr, temp2.ptr);
	}

	/** MEOS: ever_eq_tpose_pose */
	private _ever_eq_tpose_pose(pose: Pose): number {
		return F.ever_eq_tpose_pose(this.ptr, pose.ptr);
	}

	/** MEOS: ever_eq_tpose_tpose */
	private _ever_eq_tpose_tpose(temp2: TPose): number {
		return F.ever_eq_tpose_tpose(this.ptr, temp2.ptr);
	}

	/** MEOS: ever_ne_tpose_pose */
	private _ever_ne_tpose_pose(pose: Pose): number {
		return F.ever_ne_tpose_pose(this.ptr, pose.ptr);
	}

	/** MEOS: ever_ne_tpose_tpose */
	private _ever_ne_tpose_tpose(temp2: TPose): number {
		return F.ever_ne_tpose_tpose(this.ptr, temp2.ptr);
	}

	/** MEOS: nad_tpose_geo */
	private _nad_tpose_geo(gs: Geo): number {
		return F.nad_tpose_geo(this.ptr, gs.ptr);
	}

	/** MEOS: nad_tpose_pose */
	private _nad_tpose_pose(pose: Pose): number {
		return F.nad_tpose_pose(this.ptr, pose.ptr);
	}

	/** MEOS: nad_tpose_stbox */
	private _nad_tpose_stbox(box: STBox): number {
		return F.nad_tpose_stbox(this.ptr, box.ptr);
	}

	/** MEOS: nad_tpose_tpose */
	private _nad_tpose_tpose(temp2: TPose): number {
		return F.nad_tpose_tpose(this.ptr, temp2.ptr);
	}

	/** MEOS: nai_tpose_geo */
	private _nai_tpose_geo(gs: Geo): Temporal | null {
		return wrapTemporalOrNull(F.nai_tpose_geo(this.ptr, gs.ptr)) as Temporal | null;
	}

	/** MEOS: nai_tpose_pose */
	private _nai_tpose_pose(pose: Pose): Temporal | null {
		return wrapTemporalOrNull(F.nai_tpose_pose(this.ptr, pose.ptr)) as Temporal | null;
	}

	/** MEOS: nai_tpose_tpose */
	private _nai_tpose_tpose(temp2: TPose): Temporal | null {
		return wrapTemporalOrNull(F.nai_tpose_tpose(this.ptr, temp2.ptr)) as Temporal | null;
	}

	/** MEOS: shortestline_tpose_geo */
	private _shortestline_tpose_geo(gs: Geo): Geo | null {
		return wrapGeoOrNull(F.shortestline_tpose_geo(this.ptr, gs.ptr)) as Geo | null;
	}

	/** MEOS: shortestline_tpose_pose */
	private _shortestline_tpose_pose(pose: Pose): Geo | null {
		return wrapGeoOrNull(F.shortestline_tpose_pose(this.ptr, pose.ptr)) as Geo | null;
	}

	/** MEOS: shortestline_tpose_tpose */
	private _shortestline_tpose_tpose(temp2: TPose): Geo | null {
		return wrapGeoOrNull(F.shortestline_tpose_tpose(this.ptr, temp2.ptr)) as Geo | null;
	}

	/** MEOS: tdistance_tpose_geo */
	private _tdistance_tpose_geo(gs: Geo): Temporal | null {
		return wrapTemporalOrNull(F.tdistance_tpose_geo(this.ptr, gs.ptr)) as Temporal | null;
	}

	/** MEOS: tdistance_tpose_pose */
	private _tdistance_tpose_pose(pose: Pose): Temporal | null {
		return wrapTemporalOrNull(F.tdistance_tpose_pose(this.ptr, pose.ptr)) as Temporal | null;
	}

	/** MEOS: tdistance_tpose_tpose */
	private _tdistance_tpose_tpose(temp2: TPose): Temporal | null {
		return wrapTemporalOrNull(F.tdistance_tpose_tpose(this.ptr, temp2.ptr)) as Temporal | null;
	}

	/** MEOS: teq_tpose_pose */
	private _teq_tpose_pose(pose: Pose): Temporal | null {
		return wrapTemporalOrNull(F.teq_tpose_pose(this.ptr, pose.ptr)) as Temporal | null;
	}

	/** MEOS: tne_tpose_pose */
	private _tne_tpose_pose(pose: Pose): Temporal | null {
		return wrapTemporalOrNull(F.tne_tpose_pose(this.ptr, pose.ptr)) as Temporal | null;
	}

	/** MEOS: always_eq_tpose_pose, always_eq_tpose_tpose, chosen by the arguments' types */
	override alwaysEq(pose: Pose | TPose | Temporal): number {
		if (pose instanceof TPose) return this._always_eq_tpose_tpose(pose as TPose);
		if (pose instanceof Pose) return this._always_eq_tpose_pose(pose as Pose);
		return super.alwaysEq(pose as Temporal);
	}

	/** MEOS: always_ne_tpose_pose, always_ne_tpose_tpose, chosen by the arguments' types */
	override alwaysNe(pose: Pose | TPose | Temporal): number {
		if (pose instanceof TPose) return this._always_ne_tpose_tpose(pose as TPose);
		if (pose instanceof Pose) return this._always_ne_tpose_pose(pose as Pose);
		return super.alwaysNe(pose as Temporal);
	}

	/** MEOS: tpose_angular_speed */
	angularSpeed(): Temporal | null {
		return wrapTemporalOrNull(F.tpose_angular_speed(this.ptr)) as Temporal | null;
	}

	/** MEOS: tpose_apply_geo */
	applyGeo(body: Geo): Temporal | null {
		return wrapTemporalOrNull(F.tpose_apply_geo(this.ptr, body.ptr)) as Temporal | null;
	}

	/** MEOS: tpose_as_geopose */
	asGeopose(conformance: number, precision: number): string {
		return F.tpose_as_geopose(this.ptr, conformance, precision);
	}

	/** MEOS: tpose_as_geopose_stream */
	asGeoposeStream(precision: number): string {
		return F.tpose_as_geopose_stream(this.ptr, precision);
	}

	/** MEOS: tpose_as_geopose_stream_element */
	asGeoposeStreamElement(inst: Temporal, precision: number): string {
		return F.tpose_as_geopose_stream_element(this.ptr, inst.ptr, precision);
	}

	/** MEOS: tpose_as_geopose_stream_header */
	asGeoposeStreamHeader(precision: number): string {
		return F.tpose_as_geopose_stream_header(this.ptr, precision);
	}

	/** MEOS: tpose_at_elevation */
	atElevation(s: Span): Temporal | null {
		return wrapTemporalOrNull(F.tpose_at_elevation(this.ptr, s.ptr)) as Temporal | null;
	}

	/** MEOS: tpose_at_geom */
	atGeom(gs: Geo): Temporal | null {
		return wrapTemporalOrNull(F.tpose_at_geom(this.ptr, gs.ptr)) as Temporal | null;
	}

	/** MEOS: tpose_at_pose */
	atPose(pose: Pose): Temporal | null {
		return wrapTemporalOrNull(F.tpose_at_pose(this.ptr, pose.ptr)) as Temporal | null;
	}

	/** MEOS: tpose_at_stbox */
	atStbox(box: STBox, border_inc: boolean): Temporal | null {
		return wrapTemporalOrNull(F.tpose_at_stbox(this.ptr, box.ptr, border_inc)) as Temporal | null;
	}

	/** MEOS: tpose_compose_pose */
	composePose(frame: Pose): Temporal | null {
		return wrapTemporalOrNull(F.tpose_compose_pose(this.ptr, frame.ptr)) as Temporal | null;
	}

	/** MEOS: tpose_compose_tpose */
	composeTpose(frame: Temporal): Temporal | null {
		return wrapTemporalOrNull(F.tpose_compose_tpose(this.ptr, frame.ptr)) as Temporal | null;
	}

	/** MEOS: tpose_end_value */
	endValue(): Pose {
		return wrapPose(F.tpose_end_value(this.ptr)) as Pose;
	}

	/** MEOS: ever_eq_tpose_pose, ever_eq_tpose_tpose, chosen by the arguments' types */
	override everEq(pose: Pose | TPose | Temporal): number {
		if (pose instanceof TPose) return this._ever_eq_tpose_tpose(pose as TPose);
		if (pose instanceof Pose) return this._ever_eq_tpose_pose(pose as Pose);
		return super.everEq(pose as Temporal);
	}

	/** MEOS: ever_ne_tpose_pose, ever_ne_tpose_tpose, chosen by the arguments' types */
	override everNe(pose: Pose | TPose | Temporal): number {
		if (pose instanceof TPose) return this._ever_ne_tpose_tpose(pose as TPose);
		if (pose instanceof Pose) return this._ever_ne_tpose_pose(pose as Pose);
		return super.everNe(pose as Temporal);
	}

	/** MEOS: tpose_force2d */
	force2d(): Temporal {
		return wrapTemporal(F.tpose_force2d(this.ptr)) as Temporal;
	}

	/** MEOS: tpose_inverse */
	inverse(): Temporal | null {
		return wrapTemporalOrNull(F.tpose_inverse(this.ptr)) as Temporal | null;
	}

	/** MEOS: tpose_make */
	make(ttheta: Temporal): TPose | null {
		return wrapTemporalOrNull(F.tpose_make(this.ptr, ttheta.ptr)) as TPose | null;
	}

	/** MEOS: tpose_minus_elevation */
	minusElevation(s: Span): Temporal | null {
		return wrapTemporalOrNull(F.tpose_minus_elevation(this.ptr, s.ptr)) as Temporal | null;
	}

	/** MEOS: tpose_minus_geom */
	minusGeom(gs: Geo): Temporal | null {
		return wrapTemporalOrNull(F.tpose_minus_geom(this.ptr, gs.ptr)) as Temporal | null;
	}

	/** MEOS: tpose_minus_pose */
	minusPose(pose: Pose): Temporal | null {
		return wrapTemporalOrNull(F.tpose_minus_pose(this.ptr, pose.ptr)) as Temporal | null;
	}

	/** MEOS: tpose_minus_stbox */
	minusStbox(box: STBox, border_inc: boolean): Temporal | null {
		return wrapTemporalOrNull(F.tpose_minus_stbox(this.ptr, box.ptr, border_inc)) as Temporal | null;
	}

	/** MEOS: nad_tpose_geo, nad_tpose_pose, nad_tpose_stbox, nad_tpose_tpose, chosen by the arguments' types */
	nad(gs: Geo | Pose | STBox | TPose): number {
		if (gs instanceof TPose) return this._nad_tpose_tpose(gs as TPose);
		if (gs instanceof Geo) return this._nad_tpose_geo(gs as Geo);
		if (gs instanceof Pose) return this._nad_tpose_pose(gs as Pose);
		if (gs instanceof STBox) return this._nad_tpose_stbox(gs as STBox);
		throw new TypeError(`TPose.nad: no overload takes these arguments`);
	}

	/** MEOS: nai_tpose_geo, nai_tpose_pose, nai_tpose_tpose, chosen by the arguments' types */
	nai(gs: Geo | Pose | TPose): Temporal | null {
		if (gs instanceof TPose) return this._nai_tpose_tpose(gs as TPose);
		if (gs instanceof Geo) return this._nai_tpose_geo(gs as Geo);
		if (gs instanceof Pose) return this._nai_tpose_pose(gs as Pose);
		throw new TypeError(`TPose.nai: no overload takes these arguments`);
	}

	/** MEOS: tpose_pitch */
	pitch(): Temporal | null {
		return wrapTemporalOrNull(F.tpose_pitch(this.ptr)) as Temporal | null;
	}

	/** MEOS: tpose_points */
	points(): Set {
		return wrapSet(F.tpose_points(this.ptr)) as Set;
	}

	/** MEOS: tpose_roll */
	roll(): Temporal | null {
		return wrapTemporalOrNull(F.tpose_roll(this.ptr)) as Temporal | null;
	}

	/** MEOS: tpose_rotate */
	rotate(angle: number, x0: number, y0: number): Temporal {
		return wrapTemporal(F.tpose_rotate(this.ptr, angle, x0, y0)) as Temporal;
	}

	/** MEOS: tpose_rotate_x */
	rotateX(angle: number): Temporal {
		return wrapTemporal(F.tpose_rotate_x(this.ptr, angle)) as Temporal;
	}

	/** MEOS: tpose_rotate_y */
	rotateY(angle: number): Temporal {
		return wrapTemporal(F.tpose_rotate_y(this.ptr, angle)) as Temporal;
	}

	/** MEOS: tpose_rotate_z */
	rotateZ(angle: number): Temporal {
		return wrapTemporal(F.tpose_rotate_z(this.ptr, angle)) as Temporal;
	}

	/** MEOS: shortestline_tpose_geo, shortestline_tpose_pose, shortestline_tpose_tpose, chosen by the arguments' types */
	shortestline(gs: Geo | Pose | TPose): Geo | null {
		if (gs instanceof TPose) return this._shortestline_tpose_tpose(gs as TPose);
		if (gs instanceof Geo) return this._shortestline_tpose_geo(gs as Geo);
		if (gs instanceof Pose) return this._shortestline_tpose_pose(gs as Pose);
		throw new TypeError(`TPose.shortestline: no overload takes these arguments`);
	}

	/** MEOS: tpose_speed */
	speed(): Temporal | null {
		return wrapTemporalOrNull(F.tpose_speed(this.ptr)) as Temporal | null;
	}

	/** MEOS: tpose_start_value */
	startValue(): Pose {
		return wrapPose(F.tpose_start_value(this.ptr)) as Pose;
	}

	/** MEOS: tdistance_tpose_pose, tdistance_tpose_geo, tdistance_tpose_tpose, chosen by the arguments' types */
	tdistance(pose: Pose | Geo | TPose): Temporal | null {
		if (pose instanceof TPose) return this._tdistance_tpose_tpose(pose as TPose);
		if (pose instanceof Pose) return this._tdistance_tpose_pose(pose as Pose);
		if (pose instanceof Geo) return this._tdistance_tpose_geo(pose as Geo);
		throw new TypeError(`TPose.tdistance: no overload takes these arguments`);
	}

	/** MEOS: teq_tpose_pose, chosen by the arguments' types */
	override teq(pose: Pose | Temporal): Temporal | null {
		if (pose instanceof Pose) return this._teq_tpose_pose(pose as Pose);
		return super.teq(pose as Temporal);
	}

	/** MEOS: tne_tpose_pose, chosen by the arguments' types */
	override tne(pose: Pose | Temporal): Temporal | null {
		if (pose instanceof Pose) return this._tne_tpose_pose(pose as Pose);
		return super.tne(pose as Temporal);
	}

	/** MEOS: tpose_to_tpoint */
	toTpoint(): Temporal | null {
		return wrapTemporalOrNull(F.tpose_to_tpoint(this.ptr)) as Temporal | null;
	}

	/** MEOS: tpose_trajectory */
	trajectory(): Geo | null {
		return wrapGeoOrNull(F.tpose_trajectory(this.ptr)) as Geo | null;
	}

	/** MEOS: tpose_translate */
	translate(deltax: number, deltay: number, deltaz: number): Temporal {
		return wrapTemporal(F.tpose_translate(this.ptr, deltax, deltay, deltaz)) as Temporal;
	}

	/** MEOS: tpose_value */
	value(): Pose {
		return wrapPose(F.tpose_value(this.ptr)) as Pose;
	}

	/** MEOS: tpose_value_at_timestamptz */
	valueAtTimestamptz(t: TimestampTz, strict: boolean): Pose | null {
		return wrapPoseOrNull(F.tpose_value_at_timestamptz(this.ptr, t, strict)) as Pose | null;
	}

	/** MEOS: tpose_value_n */
	valueN(n: number): Pose | null {
		return wrapPoseOrNull(F.tpose_value_n(this.ptr, n)) as Pose | null;
	}

	/** MEOS: tpose_values */
	values(): Pose[] {
		const _count = _alloc(4);
		try {
			const _arr = F.tpose_values(this.ptr, _count);
			if (!_arr) return [];
			try {
				const _n = _view(_count, 4).getInt32(0, true);
				const _v = _view(_arr, _n * 8);
				const _out: Pose[] = [];
				for (let _i = 0; _i < _n; _i++) _out.push(wrapPose(Number(_v.getBigUint64(_i * 8, true))) as Pose);
				return _out;
			} finally {
				_free(_arr);
			}
		} finally {
			_free(_count);
		}
	}

	/** MEOS: tpose_yaw */
	yaw(): Temporal | null {
		return wrapTemporalOrNull(F.tpose_yaw(this.ptr)) as Temporal | null;
	}

	/** MEOS: tpose_from_base_temp */
	static fromBaseTemp(pose: Pose, temp: Temporal): TPose {
		return wrapTemporal(F.tpose_from_base_temp(pose.ptr, temp.ptr)) as TPose;
	}

	/** MEOS: temporal_from_wkb */
	static fromEWKB(wkb: Uint8Array): Temporal {
		return Temporal.fromWKB(wkb);
	}

	/** MEOS: tpose_in */
	static fromEWKT(str: string): TPose {
		return TPose.in(str);
	}

	/** MEOS: tpose_from_geopose */
	static fromGeopose(json: string): Temporal | null {
		return wrapTemporalOrNull(F.tpose_from_geopose(json)) as Temporal | null;
	}

	/** MEOS: temporal_from_hexwkb */
	static fromHexEWKB(hexwkb: string): Temporal {
		return Temporal.fromHexWKB(hexwkb);
	}

	/** MEOS: tpose_from_mfjson */
	static fromMFJSON(str: string): TPose {
		return wrapTemporal(F.tpose_from_mfjson(str)) as TPose;
	}

	/** MEOS: tpose_in */
	static fromText(str: string): TPose {
		return TPose.in(str);
	}

	/** MEOS: tpose_in */
	static in(str: string): TPose {
		return wrapTemporal(F.tpose_in(str)) as TPose;
	}
}

/**
 * The TPoseChain class of the MEOS object model.
 */
export class TPoseChain extends TSpatial {

	/** The text MEOS writes this value as (MEOS: tspatial_as_text). */
	override toString(): string {
		return this.asText(15);
	}

	/** MEOS: always_eq_tposechain_posechain */
	private _always_eq_tposechain_posechain(posechain: PoseChain): number {
		return F.always_eq_tposechain_posechain(this.ptr, posechain.ptr);
	}

	/** MEOS: always_eq_tposechain_tposechain */
	private _always_eq_tposechain_tposechain(temp2: TPoseChain): number {
		return F.always_eq_tposechain_tposechain(this.ptr, temp2.ptr);
	}

	/** MEOS: always_ne_tposechain_posechain */
	private _always_ne_tposechain_posechain(posechain: PoseChain): number {
		return F.always_ne_tposechain_posechain(this.ptr, posechain.ptr);
	}

	/** MEOS: always_ne_tposechain_tposechain */
	private _always_ne_tposechain_tposechain(temp2: TPoseChain): number {
		return F.always_ne_tposechain_tposechain(this.ptr, temp2.ptr);
	}

	/** MEOS: ever_eq_tposechain_posechain */
	private _ever_eq_tposechain_posechain(posechain: PoseChain): number {
		return F.ever_eq_tposechain_posechain(this.ptr, posechain.ptr);
	}

	/** MEOS: ever_eq_tposechain_tposechain */
	private _ever_eq_tposechain_tposechain(temp2: TPoseChain): number {
		return F.ever_eq_tposechain_tposechain(this.ptr, temp2.ptr);
	}

	/** MEOS: ever_ne_tposechain_posechain */
	private _ever_ne_tposechain_posechain(posechain: PoseChain): number {
		return F.ever_ne_tposechain_posechain(this.ptr, posechain.ptr);
	}

	/** MEOS: ever_ne_tposechain_tposechain */
	private _ever_ne_tposechain_tposechain(temp2: TPoseChain): number {
		return F.ever_ne_tposechain_tposechain(this.ptr, temp2.ptr);
	}

	/** MEOS: nad_tposechain_geo */
	private _nad_tposechain_geo(gs: Geo): number {
		return F.nad_tposechain_geo(this.ptr, gs.ptr);
	}

	/** MEOS: nad_tposechain_posechain */
	private _nad_tposechain_posechain(pc: PoseChain): number {
		return F.nad_tposechain_posechain(this.ptr, pc.ptr);
	}

	/** MEOS: nad_tposechain_stbox */
	private _nad_tposechain_stbox(box: STBox): number {
		return F.nad_tposechain_stbox(this.ptr, box.ptr);
	}

	/** MEOS: nad_tposechain_tposechain */
	private _nad_tposechain_tposechain(temp2: TPoseChain): number {
		return F.nad_tposechain_tposechain(this.ptr, temp2.ptr);
	}

	/** MEOS: nai_tposechain_geo */
	private _nai_tposechain_geo(gs: Geo): Temporal | null {
		return wrapTemporalOrNull(F.nai_tposechain_geo(this.ptr, gs.ptr)) as Temporal | null;
	}

	/** MEOS: nai_tposechain_posechain */
	private _nai_tposechain_posechain(pc: PoseChain): Temporal | null {
		return wrapTemporalOrNull(F.nai_tposechain_posechain(this.ptr, pc.ptr)) as Temporal | null;
	}

	/** MEOS: nai_tposechain_tposechain */
	private _nai_tposechain_tposechain(temp2: TPoseChain): Temporal | null {
		return wrapTemporalOrNull(F.nai_tposechain_tposechain(this.ptr, temp2.ptr)) as Temporal | null;
	}

	/** MEOS: shortestline_tposechain_geo */
	private _shortestline_tposechain_geo(gs: Geo): Geo | null {
		return wrapGeoOrNull(F.shortestline_tposechain_geo(this.ptr, gs.ptr)) as Geo | null;
	}

	/** MEOS: shortestline_tposechain_posechain */
	private _shortestline_tposechain_posechain(pc: PoseChain): Geo | null {
		return wrapGeoOrNull(F.shortestline_tposechain_posechain(this.ptr, pc.ptr)) as Geo | null;
	}

	/** MEOS: shortestline_tposechain_tposechain */
	private _shortestline_tposechain_tposechain(temp2: TPoseChain): Geo | null {
		return wrapGeoOrNull(F.shortestline_tposechain_tposechain(this.ptr, temp2.ptr)) as Geo | null;
	}

	/** MEOS: tdistance_tposechain_geo */
	private _tdistance_tposechain_geo(gs: Geo): Temporal | null {
		return wrapTemporalOrNull(F.tdistance_tposechain_geo(this.ptr, gs.ptr)) as Temporal | null;
	}

	/** MEOS: tdistance_tposechain_posechain */
	private _tdistance_tposechain_posechain(pc: PoseChain): Temporal | null {
		return wrapTemporalOrNull(F.tdistance_tposechain_posechain(this.ptr, pc.ptr)) as Temporal | null;
	}

	/** MEOS: tdistance_tposechain_tposechain */
	private _tdistance_tposechain_tposechain(temp2: TPoseChain): Temporal | null {
		return wrapTemporalOrNull(F.tdistance_tposechain_tposechain(this.ptr, temp2.ptr)) as Temporal | null;
	}

	/** MEOS: teq_tposechain_posechain */
	private _teq_tposechain_posechain(posechain: PoseChain): Temporal | null {
		return wrapTemporalOrNull(F.teq_tposechain_posechain(this.ptr, posechain.ptr)) as Temporal | null;
	}

	/** MEOS: tne_tposechain_posechain */
	private _tne_tposechain_posechain(posechain: PoseChain): Temporal | null {
		return wrapTemporalOrNull(F.tne_tposechain_posechain(this.ptr, posechain.ptr)) as Temporal | null;
	}

	/** MEOS: always_eq_tposechain_posechain, always_eq_tposechain_tposechain, chosen by the arguments' types */
	override alwaysEq(posechain: PoseChain | TPoseChain | Temporal): number {
		if (posechain instanceof TPoseChain) return this._always_eq_tposechain_tposechain(posechain as TPoseChain);
		if (posechain instanceof PoseChain) return this._always_eq_tposechain_posechain(posechain as PoseChain);
		return super.alwaysEq(posechain as Temporal);
	}

	/** MEOS: always_ne_tposechain_posechain, always_ne_tposechain_tposechain, chosen by the arguments' types */
	override alwaysNe(posechain: PoseChain | TPoseChain | Temporal): number {
		if (posechain instanceof TPoseChain) return this._always_ne_tposechain_tposechain(posechain as TPoseChain);
		if (posechain instanceof PoseChain) return this._always_ne_tposechain_posechain(posechain as PoseChain);
		return super.alwaysNe(posechain as Temporal);
	}

	/** MEOS: tposechain_as_geopose */
	asGeopose(precision: number): string {
		return F.tposechain_as_geopose(this.ptr, precision);
	}

	/** MEOS: tposechain_at_value */
	atValue(pc: PoseChain): Temporal | null {
		return wrapTemporalOrNull(F.tposechain_at_value(this.ptr, pc.ptr)) as Temporal | null;
	}

	/** MEOS: tposechain_end_value */
	endValue(): PoseChain {
		return wrapPoseChain(F.tposechain_end_value(this.ptr)) as PoseChain;
	}

	/** MEOS: ever_eq_tposechain_posechain, ever_eq_tposechain_tposechain, chosen by the arguments' types */
	override everEq(posechain: PoseChain | TPoseChain | Temporal): number {
		if (posechain instanceof TPoseChain) return this._ever_eq_tposechain_tposechain(posechain as TPoseChain);
		if (posechain instanceof PoseChain) return this._ever_eq_tposechain_posechain(posechain as PoseChain);
		return super.everEq(posechain as Temporal);
	}

	/** MEOS: ever_ne_tposechain_posechain, ever_ne_tposechain_tposechain, chosen by the arguments' types */
	override everNe(posechain: PoseChain | TPoseChain | Temporal): number {
		if (posechain instanceof TPoseChain) return this._ever_ne_tposechain_tposechain(posechain as TPoseChain);
		if (posechain instanceof PoseChain) return this._ever_ne_tposechain_posechain(posechain as PoseChain);
		return super.everNe(posechain as Temporal);
	}

	/** MEOS: tposechain_minus_value */
	minusValue(pc: PoseChain): Temporal | null {
		return wrapTemporalOrNull(F.tposechain_minus_value(this.ptr, pc.ptr)) as Temporal | null;
	}

	/** MEOS: nad_tposechain_geo, nad_tposechain_posechain, nad_tposechain_stbox, nad_tposechain_tposechain, chosen by the arguments' types */
	nad(gs: Geo | PoseChain | STBox | TPoseChain): number {
		if (gs instanceof TPoseChain) return this._nad_tposechain_tposechain(gs as TPoseChain);
		if (gs instanceof Geo) return this._nad_tposechain_geo(gs as Geo);
		if (gs instanceof PoseChain) return this._nad_tposechain_posechain(gs as PoseChain);
		if (gs instanceof STBox) return this._nad_tposechain_stbox(gs as STBox);
		throw new TypeError(`TPoseChain.nad: no overload takes these arguments`);
	}

	/** MEOS: nai_tposechain_geo, nai_tposechain_posechain, nai_tposechain_tposechain, chosen by the arguments' types */
	nai(gs: Geo | PoseChain | TPoseChain): Temporal | null {
		if (gs instanceof TPoseChain) return this._nai_tposechain_tposechain(gs as TPoseChain);
		if (gs instanceof Geo) return this._nai_tposechain_geo(gs as Geo);
		if (gs instanceof PoseChain) return this._nai_tposechain_posechain(gs as PoseChain);
		throw new TypeError(`TPoseChain.nai: no overload takes these arguments`);
	}

	/** MEOS: tposechain_num_poses */
	numPoses(): number {
		return F.tposechain_num_poses(this.ptr);
	}

	/** MEOS: tposechain_rotate */
	rotate(angle: number, x0: number, y0: number): Temporal {
		return wrapTemporal(F.tposechain_rotate(this.ptr, angle, x0, y0)) as Temporal;
	}

	/** MEOS: tposechain_rotate_x */
	rotateX(angle: number): Temporal {
		return wrapTemporal(F.tposechain_rotate_x(this.ptr, angle)) as Temporal;
	}

	/** MEOS: tposechain_rotate_y */
	rotateY(angle: number): Temporal {
		return wrapTemporal(F.tposechain_rotate_y(this.ptr, angle)) as Temporal;
	}

	/** MEOS: tposechain_rotate_z */
	rotateZ(angle: number): Temporal {
		return wrapTemporal(F.tposechain_rotate_z(this.ptr, angle)) as Temporal;
	}

	/** MEOS: shortestline_tposechain_geo, shortestline_tposechain_posechain, shortestline_tposechain_tposechain, chosen by the arguments' types */
	shortestline(gs: Geo | PoseChain | TPoseChain): Geo | null {
		if (gs instanceof TPoseChain) return this._shortestline_tposechain_tposechain(gs as TPoseChain);
		if (gs instanceof Geo) return this._shortestline_tposechain_geo(gs as Geo);
		if (gs instanceof PoseChain) return this._shortestline_tposechain_posechain(gs as PoseChain);
		throw new TypeError(`TPoseChain.shortestline: no overload takes these arguments`);
	}

	/** MEOS: tposechain_start_value */
	startValue(): PoseChain {
		return wrapPoseChain(F.tposechain_start_value(this.ptr)) as PoseChain;
	}

	/** MEOS: tdistance_tposechain_geo, tdistance_tposechain_posechain, tdistance_tposechain_tposechain, chosen by the arguments' types */
	tdistance(gs: Geo | PoseChain | TPoseChain): Temporal | null {
		if (gs instanceof TPoseChain) return this._tdistance_tposechain_tposechain(gs as TPoseChain);
		if (gs instanceof Geo) return this._tdistance_tposechain_geo(gs as Geo);
		if (gs instanceof PoseChain) return this._tdistance_tposechain_posechain(gs as PoseChain);
		throw new TypeError(`TPoseChain.tdistance: no overload takes these arguments`);
	}

	/** MEOS: teq_tposechain_posechain, chosen by the arguments' types */
	override teq(posechain: PoseChain | Temporal): Temporal | null {
		if (posechain instanceof PoseChain) return this._teq_tposechain_posechain(posechain as PoseChain);
		return super.teq(posechain as Temporal);
	}

	/** MEOS: tne_tposechain_posechain, chosen by the arguments' types */
	override tne(posechain: PoseChain | Temporal): Temporal | null {
		if (posechain instanceof PoseChain) return this._tne_tposechain_posechain(posechain as PoseChain);
		return super.tne(posechain as Temporal);
	}

	/** MEOS: tposechain_to_tpose */
	toTpose(): Temporal | null {
		return wrapTemporalOrNull(F.tposechain_to_tpose(this.ptr)) as Temporal | null;
	}

	/** MEOS: tposechain_translate */
	translate(deltax: number, deltay: number, deltaz: number): Temporal {
		return wrapTemporal(F.tposechain_translate(this.ptr, deltax, deltay, deltaz)) as Temporal;
	}

	/** MEOS: tposechain_value */
	value(): PoseChain {
		return wrapPoseChain(F.tposechain_value(this.ptr)) as PoseChain;
	}

	/** MEOS: tposechain_value_at_timestamptz */
	valueAtTimestamptz(t: TimestampTz, strict: boolean): PoseChain | null {
		return wrapPoseChainOrNull(F.tposechain_value_at_timestamptz(this.ptr, t, strict)) as PoseChain | null;
	}

	/** MEOS: tposechain_value_n */
	valueN(n: number): PoseChain | null {
		return wrapPoseChainOrNull(F.tposechain_value_n(this.ptr, n)) as PoseChain | null;
	}

	/** MEOS: tposechain_values */
	values(): PoseChain[] {
		const _count = _alloc(4);
		try {
			const _arr = F.tposechain_values(this.ptr, _count);
			if (!_arr) return [];
			try {
				const _n = _view(_count, 4).getInt32(0, true);
				const _v = _view(_arr, _n * 8);
				const _out: PoseChain[] = [];
				for (let _i = 0; _i < _n; _i++) _out.push(wrapPoseChain(Number(_v.getBigUint64(_i * 8, true))) as PoseChain);
				return _out;
			} finally {
				_free(_arr);
			}
		} finally {
			_free(_count);
		}
	}

	/** MEOS: tposechain_from_base_temp */
	static fromBaseTemp(pc: PoseChain, temp: Temporal): TPoseChain {
		return wrapTemporal(F.tposechain_from_base_temp(pc.ptr, temp.ptr)) as TPoseChain;
	}

	/** MEOS: temporal_from_wkb */
	static fromEWKB(wkb: Uint8Array): Temporal {
		return Temporal.fromWKB(wkb);
	}

	/** MEOS: tposechain_in */
	static fromEWKT(str: string): TPoseChain {
		return TPoseChain.in(str);
	}

	/** MEOS: tposechain_from_geopose */
	static fromGeopose(json: string): Temporal | null {
		return wrapTemporalOrNull(F.tposechain_from_geopose(json)) as Temporal | null;
	}

	/** MEOS: temporal_from_hexwkb */
	static fromHexEWKB(hexwkb: string): Temporal {
		return Temporal.fromHexWKB(hexwkb);
	}

	/** MEOS: tposechain_from_mfjson */
	static fromMFJSON(mfjson: string): TPoseChain {
		return wrapTemporal(F.tposechain_from_mfjson(mfjson)) as TPoseChain;
	}

	/** MEOS: tposechain_in */
	static fromText(str: string): TPoseChain {
		return TPoseChain.in(str);
	}

	/** MEOS: tposechain_in */
	static in(str: string): TPoseChain {
		return wrapTemporal(F.tposechain_in(str)) as TPoseChain;
	}
}

/**
 * A TPoseChain of subtype TInstant.
 */
export class TPoseChainInst extends TPoseChain {

	/** MEOS: tposechaininst_make */
	static make(pc: PoseChain, t: TimestampTz): TPoseChainInst {
		return wrapTemporal(F.tposechaininst_make(pc.ptr, t)) as TPoseChainInst;
	}
}

/**
 * A TPoseChain of subtype TSequence.
 */
export class TPoseChainSeq extends TPoseChain {

	/** MEOS: tposechainseq_from_base_tstzset */
	static fromBaseTstzset(pc: PoseChain, s: Set): TPoseChainSeq {
		return wrapTemporal(F.tposechainseq_from_base_tstzset(pc.ptr, s.ptr)) as TPoseChainSeq;
	}

	/** MEOS: tposechainseq_from_base_tstzspan */
	static fromBaseTstzspan(pc: PoseChain, s: Span, interp: number): TPoseChainSeq {
		return wrapTemporal(F.tposechainseq_from_base_tstzspan(pc.ptr, s.ptr, interp)) as TPoseChainSeq;
	}
}

/**
 * A TPoseChain of subtype TSequenceSet.
 */
export class TPoseChainSeqSet extends TPoseChain {

	/** MEOS: tposechainseqset_from_base_tstzspanset */
	static fromBaseTstzspanset(pc: PoseChain, ss: SpanSet, interp: number): TPoseChainSeqSet {
		return wrapTemporal(F.tposechainseqset_from_base_tstzspanset(pc.ptr, ss.ptr, interp)) as TPoseChainSeqSet;
	}
}

/**
 * A TPose of subtype TInstant.
 */
export class TPoseInst extends TPose {

	/** MEOS: tposeinst_make */
	static make(pose: Pose, t: TimestampTz): TPoseInst {
		return wrapTemporal(F.tposeinst_make(pose.ptr, t)) as TPoseInst;
	}
}

/**
 * A TPose of subtype TSequence.
 */
export class TPoseSeq extends TPose {

	/** MEOS: tposeseq_from_base_tstzset */
	static fromBaseTstzset(pose: Pose, s: Set): TPoseSeq {
		return wrapTemporal(F.tposeseq_from_base_tstzset(pose.ptr, s.ptr)) as TPoseSeq;
	}

	/** MEOS: tposeseq_from_base_tstzspan */
	static fromBaseTstzspan(pose: Pose, s: Span, interp: number): TPoseSeq {
		return wrapTemporal(F.tposeseq_from_base_tstzspan(pose.ptr, s.ptr, interp)) as TPoseSeq;
	}
}

/**
 * A TPose of subtype TSequenceSet.
 */
export class TPoseSeqSet extends TPose {

	/** MEOS: tposeseqset_from_base_tstzspanset */
	static fromBaseTstzspanset(pose: Pose, ss: SpanSet, interp: number): TPoseSeqSet {
		return wrapTemporal(F.tposeseqset_from_base_tstzspanset(pose.ptr, ss.ptr, interp)) as TPoseSeqSet;
	}
}

/**
 * The TQuadbin class of the MEOS object model.
 */
export class TQuadbin extends TCellIndex {

	/** The text MEOS writes this value as (MEOS: tquadbin_out). */
	override toString(): string {
		return this.out();
	}

	/** MEOS: always_eq_tquadbin_quadbin */
	private _always_eq_tquadbin_quadbin(cell: Quadbin): number {
		return F.always_eq_tquadbin_quadbin(this.ptr, cell);
	}

	/** MEOS: always_eq_tquadbin_tquadbin */
	private _always_eq_tquadbin_tquadbin(temp2: TQuadbin): number {
		return F.always_eq_tquadbin_tquadbin(this.ptr, temp2.ptr);
	}

	/** MEOS: always_ne_tquadbin_quadbin */
	private _always_ne_tquadbin_quadbin(cell: Quadbin): number {
		return F.always_ne_tquadbin_quadbin(this.ptr, cell);
	}

	/** MEOS: always_ne_tquadbin_tquadbin */
	private _always_ne_tquadbin_tquadbin(temp2: TQuadbin): number {
		return F.always_ne_tquadbin_tquadbin(this.ptr, temp2.ptr);
	}

	/** MEOS: ever_eq_tquadbin_quadbin */
	private _ever_eq_tquadbin_quadbin(cell: Quadbin): number {
		return F.ever_eq_tquadbin_quadbin(this.ptr, cell);
	}

	/** MEOS: ever_eq_tquadbin_quadbinset */
	private _ever_eq_tquadbin_quadbinset(cells: QuadbinSet): number {
		return F.ever_eq_tquadbin_quadbinset(this.ptr, cells.ptr);
	}

	/** MEOS: ever_eq_tquadbin_tquadbin */
	private _ever_eq_tquadbin_tquadbin(temp2: TQuadbin): number {
		return F.ever_eq_tquadbin_tquadbin(this.ptr, temp2.ptr);
	}

	/** MEOS: ever_ne_tquadbin_quadbin */
	private _ever_ne_tquadbin_quadbin(cell: Quadbin): number {
		return F.ever_ne_tquadbin_quadbin(this.ptr, cell);
	}

	/** MEOS: ever_ne_tquadbin_tquadbin */
	private _ever_ne_tquadbin_tquadbin(temp2: TQuadbin): number {
		return F.ever_ne_tquadbin_tquadbin(this.ptr, temp2.ptr);
	}

	/** MEOS: teq_tquadbin_quadbin */
	private _teq_tquadbin_quadbin(cell: Quadbin): Temporal {
		return wrapTemporal(F.teq_tquadbin_quadbin(this.ptr, cell)) as Temporal;
	}

	/** MEOS: teq_tquadbin_tquadbin */
	private _teq_tquadbin_tquadbin(temp2: Temporal): Temporal {
		return wrapTemporal(F.teq_tquadbin_tquadbin(this.ptr, temp2.ptr)) as Temporal;
	}

	/** MEOS: tne_tquadbin_quadbin */
	private _tne_tquadbin_quadbin(cell: Quadbin): Temporal {
		return wrapTemporal(F.tne_tquadbin_quadbin(this.ptr, cell)) as Temporal;
	}

	/** MEOS: tne_tquadbin_tquadbin */
	private _tne_tquadbin_tquadbin(temp2: Temporal): Temporal {
		return wrapTemporal(F.tne_tquadbin_tquadbin(this.ptr, temp2.ptr)) as Temporal;
	}

	/** MEOS: always_eq_tquadbin_quadbin, always_eq_tquadbin_tquadbin, chosen by the arguments' types */
	override alwaysEq(cell: Quadbin | TQuadbin | Temporal): number {
		if (cell instanceof TQuadbin) return this._always_eq_tquadbin_tquadbin(cell as TQuadbin);
		if (typeof cell === 'bigint') return this._always_eq_tquadbin_quadbin(cell as Quadbin);
		return super.alwaysEq(cell as Temporal);
	}

	/** MEOS: always_ne_tquadbin_quadbin, always_ne_tquadbin_tquadbin, chosen by the arguments' types */
	override alwaysNe(cell: Quadbin | TQuadbin | Temporal): number {
		if (cell instanceof TQuadbin) return this._always_ne_tquadbin_tquadbin(cell as TQuadbin);
		if (typeof cell === 'bigint') return this._always_ne_tquadbin_quadbin(cell as Quadbin);
		return super.alwaysNe(cell as Temporal);
	}

	/** MEOS: tquadbin_at_value */
	atValue(cell: Quadbin): Temporal | null {
		return wrapTemporalOrNull(F.tquadbin_at_value(this.ptr, cell)) as Temporal | null;
	}

	/** MEOS: tquadbin_cell_to_quadkey */
	cellToQuadkey(): Temporal {
		return wrapTemporal(F.tquadbin_cell_to_quadkey(this.ptr)) as Temporal;
	}

	/** MEOS: tquadbin_end_value */
	endValue(): Quadbin {
		return F.tquadbin_end_value(this.ptr);
	}

	/** MEOS: ever_eq_tquadbin_quadbinset, ever_eq_tquadbin_quadbin, ever_eq_tquadbin_tquadbin, chosen by the arguments' types */
	override everEq(cells: QuadbinSet | Quadbin | TQuadbin | Temporal): number {
		if (cells instanceof QuadbinSet) return this._ever_eq_tquadbin_quadbinset(cells as QuadbinSet);
		if (cells instanceof TQuadbin) return this._ever_eq_tquadbin_tquadbin(cells as TQuadbin);
		if (typeof cells === 'bigint') return this._ever_eq_tquadbin_quadbin(cells as Quadbin);
		return super.everEq(cells as Temporal);
	}

	/** MEOS: ever_ne_tquadbin_quadbin, ever_ne_tquadbin_tquadbin, chosen by the arguments' types */
	override everNe(cell: Quadbin | TQuadbin | Temporal): number {
		if (cell instanceof TQuadbin) return this._ever_ne_tquadbin_tquadbin(cell as TQuadbin);
		if (typeof cell === 'bigint') return this._ever_ne_tquadbin_quadbin(cell as Quadbin);
		return super.everNe(cell as Temporal);
	}

	/** MEOS: tquadbin_grid_distance */
	gridDistance(dest: Temporal): Temporal {
		return wrapTemporal(F.tquadbin_grid_distance(this.ptr, dest.ptr)) as Temporal;
	}

	/** MEOS: tquadbin_minus_value */
	minusValue(cell: Quadbin): Temporal | null {
		return wrapTemporalOrNull(F.tquadbin_minus_value(this.ptr, cell)) as Temporal | null;
	}

	/** MEOS: tquadbin_out */
	override out(): string {
		return F.tquadbin_out(this.ptr);
	}

	/** MEOS: always_eq_quadbin_tquadbin */
	ralwaysEq(cell: Quadbin): number {
		return F.always_eq_quadbin_tquadbin(cell, this.ptr);
	}

	/** MEOS: always_ne_quadbin_tquadbin */
	ralwaysNe(cell: Quadbin): number {
		return F.always_ne_quadbin_tquadbin(cell, this.ptr);
	}

	/** MEOS: ever_eq_quadbin_tquadbin */
	reverEq(cell: Quadbin): number {
		return F.ever_eq_quadbin_tquadbin(cell, this.ptr);
	}

	/** MEOS: ever_ne_quadbin_tquadbin */
	reverNe(cell: Quadbin): number {
		return F.ever_ne_quadbin_tquadbin(cell, this.ptr);
	}

	/** MEOS: teq_quadbin_tquadbin */
	rteq(cell: Quadbin): Temporal {
		return wrapTemporal(F.teq_quadbin_tquadbin(cell, this.ptr)) as Temporal;
	}

	/** MEOS: tne_quadbin_tquadbin */
	rtne(cell: Quadbin): Temporal {
		return wrapTemporal(F.tne_quadbin_tquadbin(cell, this.ptr)) as Temporal;
	}

	/** MEOS: tquadbin_start_value */
	startValue(): Quadbin {
		return F.tquadbin_start_value(this.ptr);
	}

	/** MEOS: teq_tquadbin_quadbin, teq_tquadbin_tquadbin, chosen by the arguments' types */
	override teq(cell: Quadbin | Temporal): Temporal | null {
		if (cell instanceof Temporal) return this._teq_tquadbin_tquadbin(cell as Temporal);
		if (typeof cell === 'bigint') return this._teq_tquadbin_quadbin(cell as Quadbin);
		return super.teq(cell as Temporal);
	}

	/** MEOS: tne_tquadbin_quadbin, tne_tquadbin_tquadbin, chosen by the arguments' types */
	override tne(cell: Quadbin | Temporal): Temporal | null {
		if (cell instanceof Temporal) return this._tne_tquadbin_tquadbin(cell as Temporal);
		if (typeof cell === 'bigint') return this._tne_tquadbin_quadbin(cell as Quadbin);
		return super.tne(cell as Temporal);
	}

	/** MEOS: tquadbin_to_tbigint */
	toTbigint(): Temporal {
		return wrapTemporal(F.tquadbin_to_tbigint(this.ptr)) as Temporal;
	}

	/** MEOS: tquadbin_value */
	value(): Quadbin {
		return F.tquadbin_value(this.ptr);
	}

	/** MEOS: tquadbin_value_at_timestamptz */
	valueAtTimestamptz(t: TimestampTz, strict: boolean): Quadbin {
		return F.tquadbin_value_at_timestamptz(this.ptr, t, strict);
	}

	/** MEOS: tquadbin_value_n */
	valueN(n: number): Quadbin {
		return F.tquadbin_value_n(this.ptr, n);
	}

	/** MEOS: tquadbin_values */
	values(): bigint[] {
		const _count = _alloc(4);
		try {
			const _arr = F.tquadbin_values(this.ptr, _count);
			if (!_arr) return [];
			try {
				const _n = _view(_count, 4).getInt32(0, true);
				const _v = _view(_arr, _n * 8);
				const _out: bigint[] = [];
				for (let _i = 0; _i < _n; _i++) _out.push(_v.getBigUint64(_i * 8, true));
				return _out;
			} finally {
				_free(_arr);
			}
		} finally {
			_free(_count);
		}
	}

	/** MEOS: tquadbin_from_base_temp */
	static fromBaseTemp(value: Quadbin, temp: Temporal): TQuadbin {
		return wrapTemporal(F.tquadbin_from_base_temp(value, temp.ptr)) as TQuadbin;
	}

	/** MEOS: temporal_from_wkb */
	static fromEWKB(wkb: Uint8Array): Temporal {
		return Temporal.fromWKB(wkb);
	}

	/** MEOS: tquadbin_in */
	static fromEWKT(str: string): TQuadbin {
		return TQuadbin.in(str);
	}

	/** MEOS: temporal_from_hexwkb */
	static fromHexEWKB(hexwkb: string): Temporal {
		return Temporal.fromHexWKB(hexwkb);
	}

	/** MEOS: tquadbin_from_mfjson */
	static fromMFJSON(mfjson: string): TQuadbin {
		return wrapTemporal(F.tquadbin_from_mfjson(mfjson)) as TQuadbin;
	}

	/** MEOS: tquadbin_in */
	static fromText(str: string): TQuadbin {
		return TQuadbin.in(str);
	}

	/** MEOS: tquadbin_in */
	static in(str: string): TQuadbin {
		return wrapTemporal(F.tquadbin_in(str)) as TQuadbin;
	}

	/** MEOS: tquadbin_make */
	static make(value: Quadbin, t: TimestampTz): TQuadbin {
		return wrapTemporal(F.tquadbin_make(value, t)) as TQuadbin;
	}
}

/**
 * A TQuadbin of subtype TInstant.
 */
export class TQuadbinInst extends TQuadbin {

	/** MEOS: tquadbininst_make */
	static make(value: Quadbin, t: TimestampTz): TQuadbinInst {
		return wrapTemporal(F.tquadbininst_make(value, t)) as TQuadbinInst;
	}
}

/**
 * A TQuadbin of subtype TSequence.
 */
export class TQuadbinSeq extends TQuadbin {

	/** MEOS: tquadbinseq_from_base_tstzset */
	static fromBaseTstzset(value: Quadbin, s: Set): TQuadbinSeq {
		return wrapTemporal(F.tquadbinseq_from_base_tstzset(value, s.ptr)) as TQuadbinSeq;
	}

	/** MEOS: tquadbinseq_from_base_tstzspan */
	static fromBaseTstzspan(value: Quadbin, s: Span): TQuadbinSeq {
		return wrapTemporal(F.tquadbinseq_from_base_tstzspan(value, s.ptr)) as TQuadbinSeq;
	}
}

/**
 * A TQuadbin of subtype TSequenceSet.
 */
export class TQuadbinSeqSet extends TQuadbin {

	/** MEOS: tquadbinseqset_from_base_tstzspanset */
	static fromBaseTstzspanset(value: Quadbin, ss: SpanSet): TQuadbinSeqSet {
		return wrapTemporal(F.tquadbinseqset_from_base_tstzspanset(value, ss.ptr)) as TQuadbinSeqSet;
	}
}

/**
 * The TRGeometry class of the MEOS object model.
 */
export class TRGeometry extends TSpatial {

	/** The text MEOS writes this value as (MEOS: trgeometry_as_text). */
	override toString(): string {
		return this.asText(15);
	}

	/** MEOS: adisjoint_trgeometry_geo */
	private _adisjoint_trgeometry_geo(gs: Geometry): number {
		return F.adisjoint_trgeometry_geo(this.ptr, gs.ptr);
	}

	/** MEOS: adisjoint_trgeometry_trgeometry */
	private _adisjoint_trgeometry_trgeometry(temp2: TRGeometry): number {
		return F.adisjoint_trgeometry_trgeometry(this.ptr, temp2.ptr);
	}

	/** MEOS: adwithin_trgeometry_geo */
	private _adwithin_trgeometry_geo(gs: Geometry, dist: number): number {
		return F.adwithin_trgeometry_geo(this.ptr, gs.ptr, dist);
	}

	/** MEOS: adwithin_trgeometry_trgeometry */
	private _adwithin_trgeometry_trgeometry(temp2: TRGeometry, dist: number): number {
		return F.adwithin_trgeometry_trgeometry(this.ptr, temp2.ptr, dist);
	}

	/** MEOS: aintersects_trgeometry_geo */
	private _aintersects_trgeometry_geo(gs: Geometry): number {
		return F.aintersects_trgeometry_geo(this.ptr, gs.ptr);
	}

	/** MEOS: aintersects_trgeometry_trgeometry */
	private _aintersects_trgeometry_trgeometry(temp2: TRGeometry): number {
		return F.aintersects_trgeometry_trgeometry(this.ptr, temp2.ptr);
	}

	/** MEOS: always_eq_trgeometry_geo */
	private _always_eq_trgeometry_geo(gs: Geometry): number {
		return F.always_eq_trgeometry_geo(this.ptr, gs.ptr);
	}

	/** MEOS: always_eq_trgeometry_trgeometry */
	private _always_eq_trgeometry_trgeometry(temp2: TRGeometry): number {
		return F.always_eq_trgeometry_trgeometry(this.ptr, temp2.ptr);
	}

	/** MEOS: always_ne_trgeometry_geo */
	private _always_ne_trgeometry_geo(gs: Geometry): number {
		return F.always_ne_trgeometry_geo(this.ptr, gs.ptr);
	}

	/** MEOS: always_ne_trgeometry_trgeometry */
	private _always_ne_trgeometry_trgeometry(temp2: TRGeometry): number {
		return F.always_ne_trgeometry_trgeometry(this.ptr, temp2.ptr);
	}

	/** MEOS: edisjoint_trgeometry_geo */
	private _edisjoint_trgeometry_geo(gs: Geometry): number {
		return F.edisjoint_trgeometry_geo(this.ptr, gs.ptr);
	}

	/** MEOS: edisjoint_trgeometry_trgeometry */
	private _edisjoint_trgeometry_trgeometry(temp2: TRGeometry): number {
		return F.edisjoint_trgeometry_trgeometry(this.ptr, temp2.ptr);
	}

	/** MEOS: edwithin_trgeometry_geo */
	private _edwithin_trgeometry_geo(gs: Geometry, dist: number): number {
		return F.edwithin_trgeometry_geo(this.ptr, gs.ptr, dist);
	}

	/** MEOS: edwithin_trgeometry_trgeometry */
	private _edwithin_trgeometry_trgeometry(temp2: TRGeometry, dist: number): number {
		return F.edwithin_trgeometry_trgeometry(this.ptr, temp2.ptr, dist);
	}

	/** MEOS: eintersects_trgeometry_geo */
	private _eintersects_trgeometry_geo(gs: Geometry): number {
		return F.eintersects_trgeometry_geo(this.ptr, gs.ptr);
	}

	/** MEOS: eintersects_trgeometry_trgeometry */
	private _eintersects_trgeometry_trgeometry(temp2: TRGeometry): number {
		return F.eintersects_trgeometry_trgeometry(this.ptr, temp2.ptr);
	}

	/** MEOS: ever_eq_trgeometry_geo */
	private _ever_eq_trgeometry_geo(gs: Geometry): number {
		return F.ever_eq_trgeometry_geo(this.ptr, gs.ptr);
	}

	/** MEOS: ever_eq_trgeometry_trgeometry */
	private _ever_eq_trgeometry_trgeometry(temp2: TRGeometry): number {
		return F.ever_eq_trgeometry_trgeometry(this.ptr, temp2.ptr);
	}

	/** MEOS: ever_ne_trgeometry_geo */
	private _ever_ne_trgeometry_geo(gs: Geometry): number {
		return F.ever_ne_trgeometry_geo(this.ptr, gs.ptr);
	}

	/** MEOS: ever_ne_trgeometry_trgeometry */
	private _ever_ne_trgeometry_trgeometry(temp2: TRGeometry): number {
		return F.ever_ne_trgeometry_trgeometry(this.ptr, temp2.ptr);
	}

	/** MEOS: nad_trgeometry_geo */
	private _nad_trgeometry_geo(gs: Geometry): number {
		return F.nad_trgeometry_geo(this.ptr, gs.ptr);
	}

	/** MEOS: nad_trgeometry_stbox */
	private _nad_trgeometry_stbox(box: STBox): number {
		return F.nad_trgeometry_stbox(this.ptr, box.ptr);
	}

	/** MEOS: nad_trgeometry_tpoint */
	private _nad_trgeometry_tpoint(temp2: TGeomPoint): number {
		return F.nad_trgeometry_tpoint(this.ptr, temp2.ptr);
	}

	/** MEOS: nad_trgeometry_trgeometry */
	private _nad_trgeometry_trgeometry(temp2: TRGeometry): number {
		return F.nad_trgeometry_trgeometry(this.ptr, temp2.ptr);
	}

	/** MEOS: nai_trgeometry_geo */
	private _nai_trgeometry_geo(gs: Geometry): Temporal | null {
		return wrapTemporalOrNull(F.nai_trgeometry_geo(this.ptr, gs.ptr)) as Temporal | null;
	}

	/** MEOS: nai_trgeometry_tpoint */
	private _nai_trgeometry_tpoint(temp2: TGeomPoint): Temporal | null {
		return wrapTemporalOrNull(F.nai_trgeometry_tpoint(this.ptr, temp2.ptr)) as Temporal | null;
	}

	/** MEOS: nai_trgeometry_trgeometry */
	private _nai_trgeometry_trgeometry(temp2: TRGeometry): Temporal | null {
		return wrapTemporalOrNull(F.nai_trgeometry_trgeometry(this.ptr, temp2.ptr)) as Temporal | null;
	}

	/** MEOS: shortestline_trgeometry_geo */
	private _shortestline_trgeometry_geo(gs: Geometry): Geo | null {
		return wrapGeoOrNull(F.shortestline_trgeometry_geo(this.ptr, gs.ptr)) as Geo | null;
	}

	/** MEOS: shortestline_trgeometry_tpoint */
	private _shortestline_trgeometry_tpoint(temp2: TGeomPoint): Geo | null {
		return wrapGeoOrNull(F.shortestline_trgeometry_tpoint(this.ptr, temp2.ptr)) as Geo | null;
	}

	/** MEOS: shortestline_trgeometry_trgeometry */
	private _shortestline_trgeometry_trgeometry(temp2: TRGeometry): Geo | null {
		return wrapGeoOrNull(F.shortestline_trgeometry_trgeometry(this.ptr, temp2.ptr)) as Geo | null;
	}

	/** MEOS: tdistance_trgeometry_geo */
	private _tdistance_trgeometry_geo(gs: Geometry): Temporal | null {
		return wrapTemporalOrNull(F.tdistance_trgeometry_geo(this.ptr, gs.ptr)) as Temporal | null;
	}

	/** MEOS: tdistance_trgeometry_tpoint */
	private _tdistance_trgeometry_tpoint(temp2: TGeomPoint): Temporal | null {
		return wrapTemporalOrNull(F.tdistance_trgeometry_tpoint(this.ptr, temp2.ptr)) as Temporal | null;
	}

	/** MEOS: tdistance_trgeometry_trgeometry */
	private _tdistance_trgeometry_trgeometry(temp2: TRGeometry): Temporal | null {
		return wrapTemporalOrNull(F.tdistance_trgeometry_trgeometry(this.ptr, temp2.ptr)) as Temporal | null;
	}

	/** MEOS: tdwithin_trgeometry_geo */
	private _tdwithin_trgeometry_geo(gs: Geometry, dist: number): Temporal | null {
		return wrapTemporalOrNull(F.tdwithin_trgeometry_geo(this.ptr, gs.ptr, dist)) as Temporal | null;
	}

	/** MEOS: tdwithin_trgeometry_trgeometry */
	private _tdwithin_trgeometry_trgeometry(temp2: TRGeometry, dist: number): Temporal | null {
		return wrapTemporalOrNull(F.tdwithin_trgeometry_trgeometry(this.ptr, temp2.ptr, dist)) as Temporal | null;
	}

	/** MEOS: teq_trgeometry_geo */
	private _teq_trgeometry_geo(gs: Geometry): Temporal | null {
		return wrapTemporalOrNull(F.teq_trgeometry_geo(this.ptr, gs.ptr)) as Temporal | null;
	}

	/** MEOS: tne_trgeometry_geo */
	private _tne_trgeometry_geo(gs: Geometry): Temporal | null {
		return wrapTemporalOrNull(F.tne_trgeometry_geo(this.ptr, gs.ptr)) as Temporal | null;
	}

	/** MEOS: acovers_trgeometry_geo */
	acovers(gs: Geometry): number {
		return F.acovers_trgeometry_geo(this.ptr, gs.ptr);
	}

	/** MEOS: adisjoint_trgeometry_geo, adisjoint_trgeometry_trgeometry, chosen by the arguments' types */
	adisjoint(gs: Geometry | TRGeometry): number {
		if (gs instanceof Geometry) return this._adisjoint_trgeometry_geo(gs as Geometry);
		if (gs instanceof TRGeometry) return this._adisjoint_trgeometry_trgeometry(gs as TRGeometry);
		throw new TypeError(`TRGeometry.adisjoint: no overload takes these arguments`);
	}

	/** MEOS: adwithin_trgeometry_geo, adwithin_trgeometry_trgeometry, chosen by the arguments' types */
	adwithin(gs: Geometry | TRGeometry, dist: number): number {
		if (gs instanceof Geometry && typeof dist === 'number') return this._adwithin_trgeometry_geo(gs as Geometry, dist as number);
		if (gs instanceof TRGeometry && typeof dist === 'number') return this._adwithin_trgeometry_trgeometry(gs as TRGeometry, dist as number);
		throw new TypeError(`TRGeometry.adwithin: no overload takes these arguments`);
	}

	/** MEOS: trgeometry_after_timestamptz */
	override afterTimestamptz(t: TimestampTz, strict: boolean): Temporal | null {
		return wrapTemporalOrNull(F.trgeometry_after_timestamptz(this.ptr, t, strict)) as Temporal | null;
	}

	/** MEOS: aintersects_trgeometry_geo, aintersects_trgeometry_trgeometry, chosen by the arguments' types */
	aintersects(gs: Geometry | TRGeometry): number {
		if (gs instanceof Geometry) return this._aintersects_trgeometry_geo(gs as Geometry);
		if (gs instanceof TRGeometry) return this._aintersects_trgeometry_trgeometry(gs as TRGeometry);
		throw new TypeError(`TRGeometry.aintersects: no overload takes these arguments`);
	}

	/** MEOS: always_eq_trgeometry_geo, always_eq_trgeometry_trgeometry, chosen by the arguments' types */
	override alwaysEq(gs: Geometry | TRGeometry | Temporal): number {
		if (gs instanceof Geometry) return this._always_eq_trgeometry_geo(gs as Geometry);
		if (gs instanceof TRGeometry) return this._always_eq_trgeometry_trgeometry(gs as TRGeometry);
		return super.alwaysEq(gs as Temporal);
	}

	/** MEOS: always_ne_trgeometry_geo, always_ne_trgeometry_trgeometry, chosen by the arguments' types */
	override alwaysNe(gs: Geometry | TRGeometry | Temporal): number {
		if (gs instanceof Geometry) return this._always_ne_trgeometry_geo(gs as Geometry);
		if (gs instanceof TRGeometry) return this._always_ne_trgeometry_trgeometry(gs as TRGeometry);
		return super.alwaysNe(gs as Temporal);
	}

	/** MEOS: trgeometry_angular_speed */
	angularSpeed(): Temporal | null {
		return wrapTemporalOrNull(F.trgeometry_angular_speed(this.ptr)) as Temporal | null;
	}

	/** MEOS: trgeometry_append_tinstant */
	override appendTinstant(inst: Temporal, interp: number, maxdist: number, maxt: Interval, expand: boolean): Temporal {
		const _maxt = _putInterval(maxt);
		try {
			return wrapTemporal(F.trgeometry_append_tinstant(this.ptr, inst.ptr, interp, maxdist, _maxt, expand)) as Temporal;
		} finally {
			_free(_maxt);
		}
	}

	/** MEOS: trgeometry_append_tsequence */
	override appendTsequence(seq: Temporal, expand: boolean): Temporal {
		return wrapTemporal(F.trgeometry_append_tsequence(this.ptr, seq.ptr, expand)) as Temporal;
	}

	/** MEOS: trgeometry_as_ewkt */
	override asEWKT(maxdd: number): string {
		return F.trgeometry_as_ewkt(this.ptr, maxdd);
	}

	/** MEOS: trgeometry_as_text */
	override asText(maxdd: number): string {
		return F.trgeometry_as_text(this.ptr, maxdd);
	}

	/** MEOS: trgeometry_as_tinstant */
	override asTinstant(): Temporal {
		return wrapTemporal(F.trgeometry_as_tinstant(this.ptr)) as Temporal;
	}

	/** MEOS: trgeometry_at_geom */
	atGeom(gs: Geo): Temporal | null {
		return wrapTemporalOrNull(F.trgeometry_at_geom(this.ptr, gs.ptr)) as Temporal | null;
	}

	/** MEOS: atouches_trgeometry_geo */
	atouches(gs: Geometry): number {
		return F.atouches_trgeometry_geo(this.ptr, gs.ptr);
	}

	/** MEOS: trgeometry_at_stbox */
	atStbox(box: STBox, border_inc: boolean): Temporal | null {
		return wrapTemporalOrNull(F.trgeometry_at_stbox(this.ptr, box.ptr, border_inc)) as Temporal | null;
	}

	/** MEOS: trgeometry_at_timestamptz */
	override atTimestamptz(t: TimestampTz): Temporal | null {
		return wrapTemporalOrNull(F.trgeometry_at_timestamptz(this.ptr, t)) as Temporal | null;
	}

	/** MEOS: trgeometry_at_tstzset */
	override atTstzset(s: Set): Temporal | null {
		return wrapTemporalOrNull(F.trgeometry_at_tstzset(this.ptr, s.ptr)) as Temporal | null;
	}

	/** MEOS: trgeometry_at_tstzspan */
	override atTstzspan(s: Span): Temporal | null {
		return wrapTemporalOrNull(F.trgeometry_at_tstzspan(this.ptr, s.ptr)) as Temporal | null;
	}

	/** MEOS: trgeometry_at_tstzspanset */
	override atTstzspanset(ss: SpanSet): Temporal | null {
		return wrapTemporalOrNull(F.trgeometry_at_tstzspanset(this.ptr, ss.ptr)) as Temporal | null;
	}

	/** MEOS: trgeometry_at_value */
	atValue(pose: Pose): Temporal | null {
		return wrapTemporalOrNull(F.trgeometry_at_value(this.ptr, pose.ptr)) as Temporal | null;
	}

	/** MEOS: trgeometry_at_values */
	override atValues(s: Set): Temporal | null {
		return wrapTemporalOrNull(F.trgeometry_at_values(this.ptr, s.ptr)) as Temporal | null;
	}

	/** MEOS: trgeometry_before_timestamptz */
	override beforeTimestamptz(t: TimestampTz, strict: boolean): Temporal | null {
		return wrapTemporalOrNull(F.trgeometry_before_timestamptz(this.ptr, t, strict)) as Temporal | null;
	}

	/** MEOS: trgeometry_body_point_trajectory */
	bodyPointTrajectory(gs: Geo): Temporal | null {
		return wrapTemporalOrNull(F.trgeometry_body_point_trajectory(this.ptr, gs.ptr)) as Temporal | null;
	}

	/** MEOS: trgeometry_centroid */
	centroid(): Temporal | null {
		return wrapTemporalOrNull(F.trgeometry_centroid(this.ptr)) as Temporal | null;
	}

	/** MEOS: trgeometry_convex_hull */
	convexHull(): Geo | null {
		return wrapGeoOrNull(F.trgeometry_convex_hull(this.ptr)) as Geo | null;
	}

	/** MEOS: trgeometry_cumulative_length */
	cumulativeLength(): Temporal {
		return wrapTemporal(F.trgeometry_cumulative_length(this.ptr)) as Temporal;
	}

	/** MEOS: trgeometry_delete_timestamptz */
	override deleteTimestamptz(t: TimestampTz, connect: boolean): Temporal | null {
		return wrapTemporalOrNull(F.trgeometry_delete_timestamptz(this.ptr, t, connect)) as Temporal | null;
	}

	/** MEOS: trgeometry_delete_tstzset */
	override deleteTstzset(s: Set, connect: boolean): Temporal | null {
		return wrapTemporalOrNull(F.trgeometry_delete_tstzset(this.ptr, s.ptr, connect)) as Temporal | null;
	}

	/** MEOS: trgeometry_delete_tstzspan */
	override deleteTstzspan(s: Span, connect: boolean): Temporal | null {
		return wrapTemporalOrNull(F.trgeometry_delete_tstzspan(this.ptr, s.ptr, connect)) as Temporal | null;
	}

	/** MEOS: trgeometry_delete_tstzspanset */
	override deleteTstzspanset(ss: SpanSet, connect: boolean): Temporal | null {
		return wrapTemporalOrNull(F.trgeometry_delete_tstzspanset(this.ptr, ss.ptr, connect)) as Temporal | null;
	}

	/** MEOS: ecovers_trgeometry_geo */
	ecovers(gs: Geometry): number {
		return F.ecovers_trgeometry_geo(this.ptr, gs.ptr);
	}

	/** MEOS: edisjoint_trgeometry_geo, edisjoint_trgeometry_trgeometry, chosen by the arguments' types */
	edisjoint(gs: Geometry | TRGeometry): number {
		if (gs instanceof Geometry) return this._edisjoint_trgeometry_geo(gs as Geometry);
		if (gs instanceof TRGeometry) return this._edisjoint_trgeometry_trgeometry(gs as TRGeometry);
		throw new TypeError(`TRGeometry.edisjoint: no overload takes these arguments`);
	}

	/** MEOS: edwithin_trgeometry_geo, edwithin_trgeometry_trgeometry, chosen by the arguments' types */
	edwithin(gs: Geometry | TRGeometry, dist: number): number {
		if (gs instanceof Geometry && typeof dist === 'number') return this._edwithin_trgeometry_geo(gs as Geometry, dist as number);
		if (gs instanceof TRGeometry && typeof dist === 'number') return this._edwithin_trgeometry_trgeometry(gs as TRGeometry, dist as number);
		throw new TypeError(`TRGeometry.edwithin: no overload takes these arguments`);
	}

	/** MEOS: eintersects_trgeometry_geo, eintersects_trgeometry_trgeometry, chosen by the arguments' types */
	eintersects(gs: Geometry | TRGeometry): number {
		if (gs instanceof Geometry) return this._eintersects_trgeometry_geo(gs as Geometry);
		if (gs instanceof TRGeometry) return this._eintersects_trgeometry_trgeometry(gs as TRGeometry);
		throw new TypeError(`TRGeometry.eintersects: no overload takes these arguments`);
	}

	/** MEOS: trgeometry_end_instant */
	override endInstant(): Temporal {
		return wrapTemporal(F.trgeometry_end_instant(this.ptr)) as Temporal;
	}

	/** MEOS: trgeometry_end_sequence */
	override endSequence(): Temporal {
		return wrapTemporal(F.trgeometry_end_sequence(this.ptr)) as Temporal;
	}

	/** MEOS: trgeometry_end_value */
	endValue(): Geo {
		return wrapGeo(F.trgeometry_end_value(this.ptr)) as Geo;
	}

	/** MEOS: etouches_trgeometry_geo */
	etouches(gs: Geometry): number {
		return F.etouches_trgeometry_geo(this.ptr, gs.ptr);
	}

	/** MEOS: ever_eq_trgeometry_geo, ever_eq_trgeometry_trgeometry, chosen by the arguments' types */
	override everEq(gs: Geometry | TRGeometry | Temporal): number {
		if (gs instanceof Geometry) return this._ever_eq_trgeometry_geo(gs as Geometry);
		if (gs instanceof TRGeometry) return this._ever_eq_trgeometry_trgeometry(gs as TRGeometry);
		return super.everEq(gs as Temporal);
	}

	/** MEOS: ever_ne_trgeometry_geo, ever_ne_trgeometry_trgeometry, chosen by the arguments' types */
	override everNe(gs: Geometry | TRGeometry | Temporal): number {
		if (gs instanceof Geometry) return this._ever_ne_trgeometry_geo(gs as Geometry);
		if (gs instanceof TRGeometry) return this._ever_ne_trgeometry_trgeometry(gs as TRGeometry);
		return super.everNe(gs as Temporal);
	}

	/** MEOS: trgeometry_force2d */
	force2d(): Temporal {
		return wrapTemporal(F.trgeometry_force2d(this.ptr)) as Temporal;
	}

	/** MEOS: trgeometry_geom */
	geom(): Geo {
		return wrapGeo(F.trgeometry_geom(this.ptr)) as Geo;
	}

	/** MEOS: trgeometry_instant_n */
	instantN(n: number): Temporal | null {
		return wrapTemporalOrNull(F.trgeometry_instant_n(this.ptr, n)) as Temporal | null;
	}

	/** MEOS: trgeometry_instants */
	override instants(): Temporal[] {
		const _count = _alloc(4);
		try {
			const _arr = F.trgeometry_instants(this.ptr, _count);
			if (!_arr) return [];
			try {
				const _n = _view(_count, 4).getInt32(0, true);
				const _v = _view(_arr, _n * 8);
				const _out: Temporal[] = [];
				for (let _i = 0; _i < _n; _i++) _out.push(wrapTemporal(Number(_v.getBigUint64(_i * 8, true))) as Temporal);
				return _out;
			} finally {
				_free(_arr);
			}
		} finally {
			_free(_count);
		}
	}

	/** MEOS: trgeometry_length */
	length(): number {
		return F.trgeometry_length(this.ptr);
	}

	/** MEOS: trgeometry_merge */
	override merge(temp2: Temporal): Temporal | null {
		return wrapTemporalOrNull(F.trgeometry_merge(this.ptr, temp2.ptr)) as Temporal | null;
	}

	/** MEOS: trgeometry_minus_geom */
	minusGeom(gs: Geo): Temporal | null {
		return wrapTemporalOrNull(F.trgeometry_minus_geom(this.ptr, gs.ptr)) as Temporal | null;
	}

	/** MEOS: trgeometry_minus_stbox */
	minusStbox(box: STBox, border_inc: boolean): Temporal | null {
		return wrapTemporalOrNull(F.trgeometry_minus_stbox(this.ptr, box.ptr, border_inc)) as Temporal | null;
	}

	/** MEOS: trgeometry_minus_timestamptz */
	override minusTimestamptz(t: TimestampTz): Temporal | null {
		return wrapTemporalOrNull(F.trgeometry_minus_timestamptz(this.ptr, t)) as Temporal | null;
	}

	/** MEOS: trgeometry_minus_tstzset */
	override minusTstzset(s: Set): Temporal | null {
		return wrapTemporalOrNull(F.trgeometry_minus_tstzset(this.ptr, s.ptr)) as Temporal | null;
	}

	/** MEOS: trgeometry_minus_tstzspan */
	override minusTstzspan(s: Span): Temporal | null {
		return wrapTemporalOrNull(F.trgeometry_minus_tstzspan(this.ptr, s.ptr)) as Temporal | null;
	}

	/** MEOS: trgeometry_minus_tstzspanset */
	override minusTstzspanset(ss: SpanSet): Temporal | null {
		return wrapTemporalOrNull(F.trgeometry_minus_tstzspanset(this.ptr, ss.ptr)) as Temporal | null;
	}

	/** MEOS: trgeometry_minus_value */
	minusValue(pose: Pose): Temporal | null {
		return wrapTemporalOrNull(F.trgeometry_minus_value(this.ptr, pose.ptr)) as Temporal | null;
	}

	/** MEOS: trgeometry_minus_values */
	override minusValues(s: Set): Temporal | null {
		return wrapTemporalOrNull(F.trgeometry_minus_values(this.ptr, s.ptr)) as Temporal | null;
	}

	/** MEOS: nad_trgeometry_geo, nad_trgeometry_stbox, nad_trgeometry_tpoint, nad_trgeometry_trgeometry, chosen by the arguments' types */
	nad(gs: Geometry | STBox | TGeomPoint | TRGeometry): number {
		if (gs instanceof TGeomPoint) return this._nad_trgeometry_tpoint(gs as TGeomPoint);
		if (gs instanceof Geometry) return this._nad_trgeometry_geo(gs as Geometry);
		if (gs instanceof TRGeometry) return this._nad_trgeometry_trgeometry(gs as TRGeometry);
		if (gs instanceof STBox) return this._nad_trgeometry_stbox(gs as STBox);
		throw new TypeError(`TRGeometry.nad: no overload takes these arguments`);
	}

	/** MEOS: nai_trgeometry_geo, nai_trgeometry_tpoint, nai_trgeometry_trgeometry, chosen by the arguments' types */
	nai(gs: Geometry | TGeomPoint | TRGeometry): Temporal | null {
		if (gs instanceof TGeomPoint) return this._nai_trgeometry_tpoint(gs as TGeomPoint);
		if (gs instanceof Geometry) return this._nai_trgeometry_geo(gs as Geometry);
		if (gs instanceof TRGeometry) return this._nai_trgeometry_trgeometry(gs as TRGeometry);
		throw new TypeError(`TRGeometry.nai: no overload takes these arguments`);
	}

	/** MEOS: trgeometry_out */
	override out(): string {
		return F.trgeometry_out(this.ptr);
	}

	/** MEOS: trgeometry_pitch */
	pitch(): Temporal | null {
		return wrapTemporalOrNull(F.trgeometry_pitch(this.ptr)) as Temporal | null;
	}

	/** MEOS: trgeometry_points */
	points(): Set {
		return wrapSet(F.trgeometry_points(this.ptr)) as Set;
	}

	/** MEOS: trgeometry_roll */
	roll(): Temporal | null {
		return wrapTemporalOrNull(F.trgeometry_roll(this.ptr)) as Temporal | null;
	}

	/** MEOS: trgeometry_rotate */
	rotate(angle: number, x0: number, y0: number): Temporal {
		return wrapTemporal(F.trgeometry_rotate(this.ptr, angle, x0, y0)) as Temporal;
	}

	/** MEOS: trgeometry_rotate_x */
	rotateX(angle: number): Temporal {
		return wrapTemporal(F.trgeometry_rotate_x(this.ptr, angle)) as Temporal;
	}

	/** MEOS: trgeometry_rotate_y */
	rotateY(angle: number): Temporal {
		return wrapTemporal(F.trgeometry_rotate_y(this.ptr, angle)) as Temporal;
	}

	/** MEOS: trgeometry_rotate_z */
	rotateZ(angle: number): Temporal {
		return wrapTemporal(F.trgeometry_rotate_z(this.ptr, angle)) as Temporal;
	}

	/** MEOS: trgeometry_round */
	override round(maxdd: number): Temporal {
		return wrapTemporal(F.trgeometry_round(this.ptr, maxdd)) as Temporal;
	}

	/** MEOS: trgeometry_segments */
	override segments(): Temporal[] {
		const _count = _alloc(4);
		try {
			const _arr = F.trgeometry_segments(this.ptr, _count);
			if (!_arr) return [];
			try {
				const _n = _view(_count, 4).getInt32(0, true);
				const _v = _view(_arr, _n * 8);
				const _out: Temporal[] = [];
				for (let _i = 0; _i < _n; _i++) _out.push(wrapTemporal(Number(_v.getBigUint64(_i * 8, true))) as Temporal);
				return _out;
			} finally {
				_free(_arr);
			}
		} finally {
			_free(_count);
		}
	}

	/** MEOS: trgeometry_sequence_n */
	override sequenceN(i: number): Temporal | null {
		return wrapTemporalOrNull(F.trgeometry_sequence_n(this.ptr, i)) as Temporal | null;
	}

	/** MEOS: trgeometry_sequences */
	override sequences(): Temporal[] {
		const _count = _alloc(4);
		try {
			const _arr = F.trgeometry_sequences(this.ptr, _count);
			if (!_arr) return [];
			try {
				const _n = _view(_count, 4).getInt32(0, true);
				const _v = _view(_arr, _n * 8);
				const _out: Temporal[] = [];
				for (let _i = 0; _i < _n; _i++) _out.push(wrapTemporal(Number(_v.getBigUint64(_i * 8, true))) as Temporal);
				return _out;
			} finally {
				_free(_arr);
			}
		} finally {
			_free(_count);
		}
	}

	/** MEOS: trgeometry_set_interp */
	override setInterp(interp: number): Temporal {
		return wrapTemporal(F.trgeometry_set_interp(this.ptr, interp)) as Temporal;
	}

	/** MEOS: shortestline_trgeometry_geo, shortestline_trgeometry_tpoint, shortestline_trgeometry_trgeometry, chosen by the arguments' types */
	shortestline(gs: Geometry | TGeomPoint | TRGeometry): Geo | null {
		if (gs instanceof TGeomPoint) return this._shortestline_trgeometry_tpoint(gs as TGeomPoint);
		if (gs instanceof Geometry) return this._shortestline_trgeometry_geo(gs as Geometry);
		if (gs instanceof TRGeometry) return this._shortestline_trgeometry_trgeometry(gs as TRGeometry);
		throw new TypeError(`TRGeometry.shortestline: no overload takes these arguments`);
	}

	/** MEOS: trgeometry_space_boxes */
	spaceBoxes(xsize: number, ysize: number, zsize: number, sorigin: Geo, bitmatrix: boolean, border_inc: boolean): STBox[] {
		const _count = _alloc(4);
		try {
			const _arr = F.trgeometry_space_boxes(this.ptr, xsize, ysize, zsize, sorigin.ptr, bitmatrix, border_inc, _count);
			if (!_arr) return [];
			try {
				const _n = _view(_count, 4).getInt32(0, true);
				const _v = _view(_arr, _n * 80);
				const _out: STBox[] = [];
				for (let _i = 0; _i < _n; _i++) _out.push(wrapSTBox(_copy(_arr + _i * 80, 80)) as STBox);
				return _out;
			} finally {
				_free(_arr);
			}
		} finally {
			_free(_count);
		}
	}

	/** MEOS: trgeometry_space_time_boxes */
	spaceTimeBoxes(xsize: number, ysize: number, zsize: number, duration: Interval, sorigin: Geo, torigin: TimestampTz, bitmatrix: boolean, border_inc: boolean): STBox[] {
		const _duration = _putInterval(duration);
		const _count = _alloc(4);
		try {
			const _arr = F.trgeometry_space_time_boxes(this.ptr, xsize, ysize, zsize, _duration, sorigin.ptr, torigin, bitmatrix, border_inc, _count);
			if (!_arr) return [];
			try {
				const _n = _view(_count, 4).getInt32(0, true);
				const _v = _view(_arr, _n * 80);
				const _out: STBox[] = [];
				for (let _i = 0; _i < _n; _i++) _out.push(wrapSTBox(_copy(_arr + _i * 80, 80)) as STBox);
				return _out;
			} finally {
				_free(_arr);
			}
		} finally {
			_free(_duration);
			_free(_count);
		}
	}

	/** MEOS: trgeometry_speed */
	speed(): Temporal | null {
		return wrapTemporalOrNull(F.trgeometry_speed(this.ptr)) as Temporal | null;
	}

	/** MEOS: trgeometry_split_each_n_stboxes */
	splitEachNStboxes(elem_count: number): STBox[] {
		const _count = _alloc(4);
		try {
			const _arr = F.trgeometry_split_each_n_stboxes(this.ptr, elem_count, _count);
			if (!_arr) return [];
			try {
				const _n = _view(_count, 4).getInt32(0, true);
				const _v = _view(_arr, _n * 80);
				const _out: STBox[] = [];
				for (let _i = 0; _i < _n; _i++) _out.push(wrapSTBox(_copy(_arr + _i * 80, 80)) as STBox);
				return _out;
			} finally {
				_free(_arr);
			}
		} finally {
			_free(_count);
		}
	}

	/** MEOS: trgeometry_split_n_stboxes */
	splitNStboxes(box_count: number): STBox[] {
		const _count = _alloc(4);
		try {
			const _arr = F.trgeometry_split_n_stboxes(this.ptr, box_count, _count);
			if (!_arr) return [];
			try {
				const _n = _view(_count, 4).getInt32(0, true);
				const _v = _view(_arr, _n * 80);
				const _out: STBox[] = [];
				for (let _i = 0; _i < _n; _i++) _out.push(wrapSTBox(_copy(_arr + _i * 80, 80)) as STBox);
				return _out;
			} finally {
				_free(_arr);
			}
		} finally {
			_free(_count);
		}
	}

	/** MEOS: trgeometry_start_instant */
	override startInstant(): Temporal {
		return wrapTemporal(F.trgeometry_start_instant(this.ptr)) as Temporal;
	}

	/** MEOS: trgeometry_start_sequence */
	override startSequence(): Temporal {
		return wrapTemporal(F.trgeometry_start_sequence(this.ptr)) as Temporal;
	}

	/** MEOS: trgeometry_start_value */
	startValue(): Geo {
		return wrapGeo(F.trgeometry_start_value(this.ptr)) as Geo;
	}

	/** MEOS: trgeometry_stboxes */
	stboxes(): STBox[] {
		const _count = _alloc(4);
		try {
			const _arr = F.trgeometry_stboxes(this.ptr, _count);
			if (!_arr) return [];
			try {
				const _n = _view(_count, 4).getInt32(0, true);
				const _v = _view(_arr, _n * 80);
				const _out: STBox[] = [];
				for (let _i = 0; _i < _n; _i++) _out.push(wrapSTBox(_copy(_arr + _i * 80, 80)) as STBox);
				return _out;
			} finally {
				_free(_arr);
			}
		} finally {
			_free(_count);
		}
	}

	/** MEOS: tdistance_trgeometry_geo, tdistance_trgeometry_tpoint, tdistance_trgeometry_trgeometry, chosen by the arguments' types */
	tdistance(gs: Geometry | TGeomPoint | TRGeometry): Temporal | null {
		if (gs instanceof TGeomPoint) return this._tdistance_trgeometry_tpoint(gs as TGeomPoint);
		if (gs instanceof Geometry) return this._tdistance_trgeometry_geo(gs as Geometry);
		if (gs instanceof TRGeometry) return this._tdistance_trgeometry_trgeometry(gs as TRGeometry);
		throw new TypeError(`TRGeometry.tdistance: no overload takes these arguments`);
	}

	/** MEOS: tdwithin_trgeometry_geo, tdwithin_trgeometry_trgeometry, chosen by the arguments' types */
	tdwithin(gs: Geometry | TRGeometry, dist: number): Temporal | null {
		if (gs instanceof Geometry && typeof dist === 'number') return this._tdwithin_trgeometry_geo(gs as Geometry, dist as number);
		if (gs instanceof TRGeometry && typeof dist === 'number') return this._tdwithin_trgeometry_trgeometry(gs as TRGeometry, dist as number);
		throw new TypeError(`TRGeometry.tdwithin: no overload takes these arguments`);
	}

	/** MEOS: teq_trgeometry_geo, chosen by the arguments' types */
	override teq(gs: Geometry | Temporal): Temporal | null {
		if (gs instanceof Geometry) return this._teq_trgeometry_geo(gs as Geometry);
		return super.teq(gs as Temporal);
	}

	/** MEOS: trgeometry_time_boxes */
	timeBoxes(duration: Interval, torigin: TimestampTz, bitmatrix: boolean, border_inc: boolean): STBox[] {
		const _duration = _putInterval(duration);
		const _count = _alloc(4);
		try {
			const _arr = F.trgeometry_time_boxes(this.ptr, _duration, torigin, bitmatrix, border_inc, _count);
			if (!_arr) return [];
			try {
				const _n = _view(_count, 4).getInt32(0, true);
				const _v = _view(_arr, _n * 80);
				const _out: STBox[] = [];
				for (let _i = 0; _i < _n; _i++) _out.push(wrapSTBox(_copy(_arr + _i * 80, 80)) as STBox);
				return _out;
			} finally {
				_free(_arr);
			}
		} finally {
			_free(_duration);
			_free(_count);
		}
	}

	/** MEOS: tne_trgeometry_geo, chosen by the arguments' types */
	override tne(gs: Geometry | Temporal): Temporal | null {
		if (gs instanceof Geometry) return this._tne_trgeometry_geo(gs as Geometry);
		return super.tne(gs as Temporal);
	}

	/** MEOS: trgeometry_to_tgeometry */
	toTgeometry(): Temporal {
		return wrapTemporal(F.trgeometry_to_tgeometry(this.ptr)) as Temporal;
	}

	/** MEOS: trgeometry_to_tgeompoint */
	toTgeompoint(): Temporal {
		return wrapTemporal(F.trgeometry_to_tgeompoint(this.ptr)) as Temporal;
	}

	/** MEOS: trgeometry_to_tpose */
	toTpose(): Temporal {
		return wrapTemporal(F.trgeometry_to_tpose(this.ptr)) as Temporal;
	}

	/** MEOS: trgeometry_translate */
	translate(deltax: number, deltay: number, deltaz: number): Temporal {
		return wrapTemporal(F.trgeometry_translate(this.ptr, deltax, deltay, deltaz)) as Temporal;
	}

	/** MEOS: trgeometry_traversed_area */
	traversedArea(unary_union: boolean): Geo | null {
		return wrapGeoOrNull(F.trgeometry_traversed_area(this.ptr, unary_union)) as Geo | null;
	}

	/** MEOS: trgeometry_twcentroid */
	twcentroid(): Geo {
		return wrapGeo(F.trgeometry_twcentroid(this.ptr)) as Geo;
	}

	/** MEOS: trgeometry_value */
	value(): Pose {
		return wrapPose(F.trgeometry_value(this.ptr)) as Pose;
	}

	/** MEOS: trgeometry_value_at_timestamptz */
	valueAtTimestamptz(t: TimestampTz, strict: boolean): Geo | null {
		return wrapGeoOrNull(F.trgeometry_value_at_timestamptz(this.ptr, t, strict)) as Geo | null;
	}

	/** MEOS: trgeometry_value_n */
	valueN(n: number): Geo | null {
		return wrapGeoOrNull(F.trgeometry_value_n(this.ptr, n)) as Geo | null;
	}

	/** MEOS: trgeometry_values */
	values(): Pose[] {
		const _count = _alloc(4);
		try {
			const _arr = F.trgeometry_values(this.ptr, _count);
			if (!_arr) return [];
			try {
				const _n = _view(_count, 4).getInt32(0, true);
				const _v = _view(_arr, _n * 8);
				const _out: Pose[] = [];
				for (let _i = 0; _i < _n; _i++) _out.push(wrapPose(Number(_v.getBigUint64(_i * 8, true))) as Pose);
				return _out;
			} finally {
				_free(_arr);
			}
		} finally {
			_free(_count);
		}
	}

	/** MEOS: trgeometry_yaw */
	yaw(): Temporal | null {
		return wrapTemporalOrNull(F.trgeometry_yaw(this.ptr)) as Temporal | null;
	}

	/** MEOS: temporal_from_wkb */
	static fromEWKB(wkb: Uint8Array): Temporal {
		return Temporal.fromWKB(wkb);
	}

	/** MEOS: trgeometry_in */
	static fromEWKT(str: string): TRGeometry {
		return TRGeometry.in(str);
	}

	/** MEOS: temporal_from_hexwkb */
	static fromHexEWKB(hexwkb: string): Temporal {
		return Temporal.fromHexWKB(hexwkb);
	}

	/** MEOS: trgeometry_from_mfjson */
	static fromMFJSON(mfjson: string): TRGeometry {
		return wrapTemporal(F.trgeometry_from_mfjson(mfjson)) as TRGeometry;
	}

	/** MEOS: trgeometry_in */
	static fromText(str: string): TRGeometry {
		return TRGeometry.in(str);
	}

	/** MEOS: trgeometry_in */
	static in(str: string): TRGeometry {
		return wrapTemporal(F.trgeometry_in(str)) as TRGeometry;
	}

	/** MEOS: trgeometry_merge_array */
	static mergeArray(temparr: Temporal[]): Temporal {
		const _temparr = _ptrArray(temparr.map(x => x.ptr));
		try {
			return wrapTemporal(F.trgeometry_merge_array(_temparr, temparr.length)) as Temporal;
		} finally {
			_free(_temparr);
		}
	}
}

/**
 * A TRGeometry of subtype TInstant.
 */
export class TRGeometryInst extends TRGeometry {

	/** MEOS: trgeometryinst_make */
	static make(geom: Geo, pose: Pose, t: TimestampTz): TRGeometryInst {
		return wrapTemporal(F.trgeometryinst_make(geom.ptr, pose.ptr, t)) as TRGeometryInst;
	}
}

/**
 * A TRGeometry of subtype TSequence.
 */
export class TRGeometrySeq extends TRGeometry {

	/** MEOS: trgeometryseq_make */
	static make(geom: Geo, instants: Temporal[], lower_inc: boolean, upper_inc: boolean, interp: number, normalize: boolean): TRGeometrySeq {
		const _instants = _ptrArray(instants.map(x => x.ptr));
		try {
			return wrapTemporal(F.trgeometryseq_make(geom.ptr, _instants, instants.length, lower_inc, upper_inc, interp, normalize)) as TRGeometrySeq;
		} finally {
			_free(_instants);
		}
	}
}

/**
 * A TRGeometry of subtype TSequenceSet.
 */
export class TRGeometrySeqSet extends TRGeometry {

	/** MEOS: trgeometryseqset_make */
	static make(geom: Geo, sequences: Temporal[], normalize: boolean): TRGeometrySeqSet {
		const _sequences = _ptrArray(sequences.map(x => x.ptr));
		try {
			return wrapTemporal(F.trgeometryseqset_make(geom.ptr, _sequences, sequences.length, normalize)) as TRGeometrySeqSet;
		} finally {
			_free(_sequences);
		}
	}

	/** MEOS: trgeometryseqset_make_gaps */
	static makeGaps(geom: Geo, instants: Temporal[], interp: number, maxt: Interval, maxdist: number): Temporal {
		const _instants = _ptrArray(instants.map(x => x.ptr));
		const _maxt = _putInterval(maxt);
		try {
			return wrapTemporal(F.trgeometryseqset_make_gaps(geom.ptr, _instants, instants.length, interp, _maxt, maxdist)) as Temporal;
		} finally {
			_free(_instants);
			_free(_maxt);
		}
	}
}

/**
 * The TS2Cell class of the MEOS object model.
 */
export class TS2Cell extends TCellIndex {

	/** The text MEOS writes this value as (MEOS: ts2cell_out). */
	override toString(): string {
		return this.out();
	}

	/** MEOS: always_eq_ts2cell_s2cell */
	private _always_eq_ts2cell_s2cell(cell: S2CellId): number {
		return F.always_eq_ts2cell_s2cell(this.ptr, cell);
	}

	/** MEOS: always_eq_ts2cell_ts2cell */
	private _always_eq_ts2cell_ts2cell(temp2: TS2Cell): number {
		return F.always_eq_ts2cell_ts2cell(this.ptr, temp2.ptr);
	}

	/** MEOS: always_ne_ts2cell_s2cell */
	private _always_ne_ts2cell_s2cell(cell: S2CellId): number {
		return F.always_ne_ts2cell_s2cell(this.ptr, cell);
	}

	/** MEOS: always_ne_ts2cell_ts2cell */
	private _always_ne_ts2cell_ts2cell(temp2: TS2Cell): number {
		return F.always_ne_ts2cell_ts2cell(this.ptr, temp2.ptr);
	}

	/** MEOS: ever_eq_ts2cell_s2cell */
	private _ever_eq_ts2cell_s2cell(cell: S2CellId): number {
		return F.ever_eq_ts2cell_s2cell(this.ptr, cell);
	}

	/** MEOS: ever_eq_ts2cell_s2cellset */
	private _ever_eq_ts2cell_s2cellset(cells: S2CellSet): number {
		return F.ever_eq_ts2cell_s2cellset(this.ptr, cells.ptr);
	}

	/** MEOS: ever_eq_ts2cell_ts2cell */
	private _ever_eq_ts2cell_ts2cell(temp2: TS2Cell): number {
		return F.ever_eq_ts2cell_ts2cell(this.ptr, temp2.ptr);
	}

	/** MEOS: ever_ne_ts2cell_s2cell */
	private _ever_ne_ts2cell_s2cell(cell: S2CellId): number {
		return F.ever_ne_ts2cell_s2cell(this.ptr, cell);
	}

	/** MEOS: ever_ne_ts2cell_ts2cell */
	private _ever_ne_ts2cell_ts2cell(temp2: TS2Cell): number {
		return F.ever_ne_ts2cell_ts2cell(this.ptr, temp2.ptr);
	}

	/** MEOS: teq_ts2cell_s2cell */
	private _teq_ts2cell_s2cell(cell: S2CellId): Temporal {
		return wrapTemporal(F.teq_ts2cell_s2cell(this.ptr, cell)) as Temporal;
	}

	/** MEOS: teq_ts2cell_ts2cell */
	private _teq_ts2cell_ts2cell(temp2: Temporal): Temporal {
		return wrapTemporal(F.teq_ts2cell_ts2cell(this.ptr, temp2.ptr)) as Temporal;
	}

	/** MEOS: tne_ts2cell_s2cell */
	private _tne_ts2cell_s2cell(cell: S2CellId): Temporal {
		return wrapTemporal(F.tne_ts2cell_s2cell(this.ptr, cell)) as Temporal;
	}

	/** MEOS: tne_ts2cell_ts2cell */
	private _tne_ts2cell_ts2cell(temp2: Temporal): Temporal {
		return wrapTemporal(F.tne_ts2cell_ts2cell(this.ptr, temp2.ptr)) as Temporal;
	}

	/** MEOS: always_eq_ts2cell_s2cell, always_eq_ts2cell_ts2cell, chosen by the arguments' types */
	override alwaysEq(cell: S2CellId | TS2Cell | Temporal): number {
		if (cell instanceof TS2Cell) return this._always_eq_ts2cell_ts2cell(cell as TS2Cell);
		if (typeof cell === 'bigint') return this._always_eq_ts2cell_s2cell(cell as S2CellId);
		return super.alwaysEq(cell as Temporal);
	}

	/** MEOS: always_ne_ts2cell_s2cell, always_ne_ts2cell_ts2cell, chosen by the arguments' types */
	override alwaysNe(cell: S2CellId | TS2Cell | Temporal): number {
		if (cell instanceof TS2Cell) return this._always_ne_ts2cell_ts2cell(cell as TS2Cell);
		if (typeof cell === 'bigint') return this._always_ne_ts2cell_s2cell(cell as S2CellId);
		return super.alwaysNe(cell as Temporal);
	}

	/** MEOS: ts2cell_at_value */
	atValue(cell: S2CellId): Temporal | null {
		return wrapTemporalOrNull(F.ts2cell_at_value(this.ptr, cell)) as Temporal | null;
	}

	/** MEOS: ts2cell_cell_to_token */
	cellToToken(): Temporal {
		return wrapTemporal(F.ts2cell_cell_to_token(this.ptr)) as Temporal;
	}

	/** MEOS: ts2cell_end_value */
	endValue(): S2CellId {
		return F.ts2cell_end_value(this.ptr);
	}

	/** MEOS: ever_eq_ts2cell_s2cellset, ever_eq_ts2cell_s2cell, ever_eq_ts2cell_ts2cell, chosen by the arguments' types */
	override everEq(cells: S2CellSet | S2CellId | TS2Cell | Temporal): number {
		if (cells instanceof S2CellSet) return this._ever_eq_ts2cell_s2cellset(cells as S2CellSet);
		if (cells instanceof TS2Cell) return this._ever_eq_ts2cell_ts2cell(cells as TS2Cell);
		if (typeof cells === 'bigint') return this._ever_eq_ts2cell_s2cell(cells as S2CellId);
		return super.everEq(cells as Temporal);
	}

	/** MEOS: ever_ne_ts2cell_s2cell, ever_ne_ts2cell_ts2cell, chosen by the arguments' types */
	override everNe(cell: S2CellId | TS2Cell | Temporal): number {
		if (cell instanceof TS2Cell) return this._ever_ne_ts2cell_ts2cell(cell as TS2Cell);
		if (typeof cell === 'bigint') return this._ever_ne_ts2cell_s2cell(cell as S2CellId);
		return super.everNe(cell as Temporal);
	}

	/** MEOS: ts2cell_grid_distance */
	gridDistance(dest: Temporal): Temporal {
		return wrapTemporal(F.ts2cell_grid_distance(this.ptr, dest.ptr)) as Temporal;
	}

	/** MEOS: ts2cell_minus_value */
	minusValue(cell: S2CellId): Temporal | null {
		return wrapTemporalOrNull(F.ts2cell_minus_value(this.ptr, cell)) as Temporal | null;
	}

	/** MEOS: ts2cell_out */
	override out(): string {
		return F.ts2cell_out(this.ptr);
	}

	/** MEOS: always_eq_s2cell_ts2cell */
	ralwaysEq(cell: S2CellId): number {
		return F.always_eq_s2cell_ts2cell(cell, this.ptr);
	}

	/** MEOS: always_ne_s2cell_ts2cell */
	ralwaysNe(cell: S2CellId): number {
		return F.always_ne_s2cell_ts2cell(cell, this.ptr);
	}

	/** MEOS: ever_eq_s2cell_ts2cell */
	reverEq(cell: S2CellId): number {
		return F.ever_eq_s2cell_ts2cell(cell, this.ptr);
	}

	/** MEOS: ever_ne_s2cell_ts2cell */
	reverNe(cell: S2CellId): number {
		return F.ever_ne_s2cell_ts2cell(cell, this.ptr);
	}

	/** MEOS: teq_s2cell_ts2cell */
	rteq(cell: S2CellId): Temporal {
		return wrapTemporal(F.teq_s2cell_ts2cell(cell, this.ptr)) as Temporal;
	}

	/** MEOS: tne_s2cell_ts2cell */
	rtne(cell: S2CellId): Temporal {
		return wrapTemporal(F.tne_s2cell_ts2cell(cell, this.ptr)) as Temporal;
	}

	/** MEOS: ts2cell_start_value */
	startValue(): S2CellId {
		return F.ts2cell_start_value(this.ptr);
	}

	/** MEOS: teq_ts2cell_s2cell, teq_ts2cell_ts2cell, chosen by the arguments' types */
	override teq(cell: S2CellId | Temporal): Temporal | null {
		if (cell instanceof Temporal) return this._teq_ts2cell_ts2cell(cell as Temporal);
		if (typeof cell === 'bigint') return this._teq_ts2cell_s2cell(cell as S2CellId);
		return super.teq(cell as Temporal);
	}

	/** MEOS: tne_ts2cell_s2cell, tne_ts2cell_ts2cell, chosen by the arguments' types */
	override tne(cell: S2CellId | Temporal): Temporal | null {
		if (cell instanceof Temporal) return this._tne_ts2cell_ts2cell(cell as Temporal);
		if (typeof cell === 'bigint') return this._tne_ts2cell_s2cell(cell as S2CellId);
		return super.tne(cell as Temporal);
	}

	/** MEOS: ts2cell_to_tbigint */
	toTbigint(): Temporal {
		return wrapTemporal(F.ts2cell_to_tbigint(this.ptr)) as Temporal;
	}

	/** MEOS: ts2cell_value */
	value(): S2CellId {
		return F.ts2cell_value(this.ptr);
	}

	/** MEOS: ts2cell_value_at_timestamptz */
	valueAtTimestamptz(t: TimestampTz, strict: boolean): S2CellId {
		return F.ts2cell_value_at_timestamptz(this.ptr, t, strict);
	}

	/** MEOS: ts2cell_value_n */
	valueN(n: number): S2CellId {
		return F.ts2cell_value_n(this.ptr, n);
	}

	/** MEOS: ts2cell_values */
	values(): bigint[] {
		const _count = _alloc(4);
		try {
			const _arr = F.ts2cell_values(this.ptr, _count);
			if (!_arr) return [];
			try {
				const _n = _view(_count, 4).getInt32(0, true);
				const _v = _view(_arr, _n * 8);
				const _out: bigint[] = [];
				for (let _i = 0; _i < _n; _i++) _out.push(_v.getBigUint64(_i * 8, true));
				return _out;
			} finally {
				_free(_arr);
			}
		} finally {
			_free(_count);
		}
	}

	/** MEOS: ts2cell_from_base_temp */
	static fromBaseTemp(value: S2CellId, temp: Temporal): TS2Cell {
		return wrapTemporal(F.ts2cell_from_base_temp(value, temp.ptr)) as TS2Cell;
	}

	/** MEOS: temporal_from_wkb */
	static fromEWKB(wkb: Uint8Array): Temporal {
		return Temporal.fromWKB(wkb);
	}

	/** MEOS: ts2cell_in */
	static fromEWKT(str: string): TS2Cell {
		return TS2Cell.in(str);
	}

	/** MEOS: temporal_from_hexwkb */
	static fromHexEWKB(hexwkb: string): Temporal {
		return Temporal.fromHexWKB(hexwkb);
	}

	/** MEOS: ts2cell_from_mfjson */
	static fromMFJSON(mfjson: string): TS2Cell {
		return wrapTemporal(F.ts2cell_from_mfjson(mfjson)) as TS2Cell;
	}

	/** MEOS: ts2cell_in */
	static fromText(str: string): TS2Cell {
		return TS2Cell.in(str);
	}

	/** MEOS: ts2cell_in */
	static in(str: string): TS2Cell {
		return wrapTemporal(F.ts2cell_in(str)) as TS2Cell;
	}

	/** MEOS: ts2cell_make */
	static make(value: S2CellId, t: TimestampTz): TS2Cell {
		return wrapTemporal(F.ts2cell_make(value, t)) as TS2Cell;
	}
}

/**
 * A TS2Cell of subtype TInstant.
 */
export class TS2CellInst extends TS2Cell {

	/** MEOS: ts2cellinst_make */
	static make(value: S2CellId, t: TimestampTz): TS2CellInst {
		return wrapTemporal(F.ts2cellinst_make(value, t)) as TS2CellInst;
	}
}

/**
 * A TS2Cell of subtype TSequence.
 */
export class TS2CellSeq extends TS2Cell {

	/** MEOS: ts2cellseq_from_base_tstzset */
	static fromBaseTstzset(value: S2CellId, s: Set): TS2CellSeq {
		return wrapTemporal(F.ts2cellseq_from_base_tstzset(value, s.ptr)) as TS2CellSeq;
	}

	/** MEOS: ts2cellseq_from_base_tstzspan */
	static fromBaseTstzspan(value: S2CellId, s: Span): TS2CellSeq {
		return wrapTemporal(F.ts2cellseq_from_base_tstzspan(value, s.ptr)) as TS2CellSeq;
	}
}

/**
 * A TS2Cell of subtype TSequenceSet.
 */
export class TS2CellSeqSet extends TS2Cell {

	/** MEOS: ts2cellseqset_from_base_tstzspanset */
	static fromBaseTstzspanset(value: S2CellId, ss: SpanSet): TS2CellSeqSet {
		return wrapTemporal(F.ts2cellseqset_from_base_tstzspanset(value, ss.ptr)) as TS2CellSeqSet;
	}
}

/**
 * The TSequence class of the MEOS object model.
 */
export class TSequence extends Temporal {

	/** MEOS: tsequence_make */
	static make(instants: Temporal[], lower_inc: boolean, upper_inc: boolean, interp: number, normalize: boolean): Temporal {
		const _instants = _ptrArray(instants.map(x => x.ptr));
		try {
			return wrapTemporal(F.tsequence_make(_instants, instants.length, lower_inc, upper_inc, interp, normalize)) as Temporal;
		} finally {
			_free(_instants);
		}
	}
}

/**
 * The TSequenceSet class of the MEOS object model.
 */
export class TSequenceSet extends Temporal {

	/** MEOS: tsequenceset_make */
	static make(sequences: Temporal[], normalize: boolean): Temporal {
		const _sequences = _ptrArray(sequences.map(x => x.ptr));
		try {
			return wrapTemporal(F.tsequenceset_make(_sequences, sequences.length, normalize)) as Temporal;
		} finally {
			_free(_sequences);
		}
	}

	/** MEOS: tsequenceset_make_gaps */
	static makeGaps(instants: Temporal[], interp: number, maxt: Interval, maxdist: number): Temporal {
		const _instants = _ptrArray(instants.map(x => x.ptr));
		const _maxt = _putInterval(maxt);
		try {
			return wrapTemporal(F.tsequenceset_make_gaps(_instants, instants.length, interp, _maxt, maxdist)) as Temporal;
		} finally {
			_free(_instants);
			_free(_maxt);
		}
	}
}

/**
 * The TText class of the MEOS object model.
 */
export class TText extends TAlpha {

	/** The text MEOS writes this value as (MEOS: ttext_out). */
	override toString(): string {
		return this.out();
	}

	/** MEOS: always_eq_ttext_text */
	private _always_eq_ttext_text(txt: string): number {
		return F.always_eq_ttext_text(this.ptr, txt);
	}

	/** MEOS: always_ge_ttext_text */
	private _always_ge_ttext_text(txt: string): number {
		return F.always_ge_ttext_text(this.ptr, txt);
	}

	/** MEOS: always_gt_ttext_text */
	private _always_gt_ttext_text(txt: string): number {
		return F.always_gt_ttext_text(this.ptr, txt);
	}

	/** MEOS: always_le_ttext_text */
	private _always_le_ttext_text(txt: string): number {
		return F.always_le_ttext_text(this.ptr, txt);
	}

	/** MEOS: always_lt_ttext_text */
	private _always_lt_ttext_text(txt: string): number {
		return F.always_lt_ttext_text(this.ptr, txt);
	}

	/** MEOS: always_ne_ttext_text */
	private _always_ne_ttext_text(txt: string): number {
		return F.always_ne_ttext_text(this.ptr, txt);
	}

	/** MEOS: ever_eq_ttext_text */
	private _ever_eq_ttext_text(txt: string): number {
		return F.ever_eq_ttext_text(this.ptr, txt);
	}

	/** MEOS: ever_ge_ttext_text */
	private _ever_ge_ttext_text(txt: string): number {
		return F.ever_ge_ttext_text(this.ptr, txt);
	}

	/** MEOS: ever_gt_ttext_text */
	private _ever_gt_ttext_text(txt: string): number {
		return F.ever_gt_ttext_text(this.ptr, txt);
	}

	/** MEOS: ever_le_ttext_text */
	private _ever_le_ttext_text(txt: string): number {
		return F.ever_le_ttext_text(this.ptr, txt);
	}

	/** MEOS: ever_lt_ttext_text */
	private _ever_lt_ttext_text(txt: string): number {
		return F.ever_lt_ttext_text(this.ptr, txt);
	}

	/** MEOS: ever_ne_ttext_text */
	private _ever_ne_ttext_text(txt: string): number {
		return F.ever_ne_ttext_text(this.ptr, txt);
	}

	/** MEOS: teq_ttext_text */
	private _teq_ttext_text(txt: string): Temporal {
		return wrapTemporal(F.teq_ttext_text(this.ptr, txt)) as Temporal;
	}

	/** MEOS: textcat_ttext_text */
	private _textcat_ttext_text(txt: string): Temporal {
		return wrapTemporal(F.textcat_ttext_text(this.ptr, txt)) as Temporal;
	}

	/** MEOS: textcat_ttext_ttext */
	private _textcat_ttext_ttext(temp2: TText): Temporal | null {
		return wrapTemporalOrNull(F.textcat_ttext_ttext(this.ptr, temp2.ptr)) as Temporal | null;
	}

	/** MEOS: tge_ttext_text */
	private _tge_ttext_text(txt: string): Temporal {
		return wrapTemporal(F.tge_ttext_text(this.ptr, txt)) as Temporal;
	}

	/** MEOS: tgt_ttext_text */
	private _tgt_ttext_text(txt: string): Temporal {
		return wrapTemporal(F.tgt_ttext_text(this.ptr, txt)) as Temporal;
	}

	/** MEOS: tle_ttext_text */
	private _tle_ttext_text(txt: string): Temporal {
		return wrapTemporal(F.tle_ttext_text(this.ptr, txt)) as Temporal;
	}

	/** MEOS: tlt_ttext_text */
	private _tlt_ttext_text(txt: string): Temporal {
		return wrapTemporal(F.tlt_ttext_text(this.ptr, txt)) as Temporal;
	}

	/** MEOS: tne_ttext_text */
	private _tne_ttext_text(txt: string): Temporal {
		return wrapTemporal(F.tne_ttext_text(this.ptr, txt)) as Temporal;
	}

	/** MEOS: always_eq_ttext_text, chosen by the arguments' types */
	override alwaysEq(txt: string | Temporal): number {
		if (typeof txt === 'string') return this._always_eq_ttext_text(txt as string);
		return super.alwaysEq(txt as Temporal);
	}

	/** MEOS: always_ge_ttext_text, chosen by the arguments' types */
	override alwaysGe(txt: string | Temporal): number {
		if (typeof txt === 'string') return this._always_ge_ttext_text(txt as string);
		return super.alwaysGe(txt as Temporal);
	}

	/** MEOS: always_gt_ttext_text, chosen by the arguments' types */
	override alwaysGt(txt: string | Temporal): number {
		if (typeof txt === 'string') return this._always_gt_ttext_text(txt as string);
		return super.alwaysGt(txt as Temporal);
	}

	/** MEOS: always_le_ttext_text, chosen by the arguments' types */
	override alwaysLe(txt: string | Temporal): number {
		if (typeof txt === 'string') return this._always_le_ttext_text(txt as string);
		return super.alwaysLe(txt as Temporal);
	}

	/** MEOS: always_lt_ttext_text, chosen by the arguments' types */
	override alwaysLt(txt: string | Temporal): number {
		if (typeof txt === 'string') return this._always_lt_ttext_text(txt as string);
		return super.alwaysLt(txt as Temporal);
	}

	/** MEOS: always_ne_ttext_text, chosen by the arguments' types */
	override alwaysNe(txt: string | Temporal): number {
		if (typeof txt === 'string') return this._always_ne_ttext_text(txt as string);
		return super.alwaysNe(txt as Temporal);
	}

	/** MEOS: ttext_out */
	asText(): string {
		return this.out();
	}

	/** MEOS: ttext_at_value */
	atValue(txt: string): Temporal | null {
		return wrapTemporalOrNull(F.ttext_at_value(this.ptr, txt)) as Temporal | null;
	}

	/** MEOS: ttext_end_value */
	endValue(): string {
		return F.ttext_end_value(this.ptr);
	}

	/** MEOS: ever_eq_ttext_text, chosen by the arguments' types */
	override everEq(txt: string | Temporal): number {
		if (typeof txt === 'string') return this._ever_eq_ttext_text(txt as string);
		return super.everEq(txt as Temporal);
	}

	/** MEOS: ever_ge_ttext_text, chosen by the arguments' types */
	override everGe(txt: string | Temporal): number {
		if (typeof txt === 'string') return this._ever_ge_ttext_text(txt as string);
		return super.everGe(txt as Temporal);
	}

	/** MEOS: ever_gt_ttext_text, chosen by the arguments' types */
	override everGt(txt: string | Temporal): number {
		if (typeof txt === 'string') return this._ever_gt_ttext_text(txt as string);
		return super.everGt(txt as Temporal);
	}

	/** MEOS: ever_le_ttext_text, chosen by the arguments' types */
	override everLe(txt: string | Temporal): number {
		if (typeof txt === 'string') return this._ever_le_ttext_text(txt as string);
		return super.everLe(txt as Temporal);
	}

	/** MEOS: ever_lt_ttext_text, chosen by the arguments' types */
	override everLt(txt: string | Temporal): number {
		if (typeof txt === 'string') return this._ever_lt_ttext_text(txt as string);
		return super.everLt(txt as Temporal);
	}

	/** MEOS: ever_ne_ttext_text, chosen by the arguments' types */
	override everNe(txt: string | Temporal): number {
		if (typeof txt === 'string') return this._ever_ne_ttext_text(txt as string);
		return super.everNe(txt as Temporal);
	}

	/** MEOS: ttext_initcap */
	initcap(): Temporal {
		return wrapTemporal(F.ttext_initcap(this.ptr)) as Temporal;
	}

	/** MEOS: ttext_lower */
	lower(): Temporal {
		return wrapTemporal(F.ttext_lower(this.ptr)) as Temporal;
	}

	/** MEOS: ttext_max_value */
	maxValue(): string {
		return F.ttext_max_value(this.ptr);
	}

	/** MEOS: ttext_minus_value */
	minusValue(txt: string): Temporal | null {
		return wrapTemporalOrNull(F.ttext_minus_value(this.ptr, txt)) as Temporal | null;
	}

	/** MEOS: ttext_min_value */
	minValue(): string {
		return F.ttext_min_value(this.ptr);
	}

	/** MEOS: ttext_out */
	out(): string {
		return F.ttext_out(this.ptr);
	}

	/** MEOS: ttext_start_value */
	startValue(): string {
		return F.ttext_start_value(this.ptr);
	}

	/** MEOS: teq_ttext_text, chosen by the arguments' types */
	override teq(txt: string | Temporal): Temporal | null {
		if (typeof txt === 'string') return this._teq_ttext_text(txt as string);
		return super.teq(txt as Temporal);
	}

	/** MEOS: textcat_ttext_text, textcat_ttext_ttext, chosen by the arguments' types */
	textcat(txt: string | TText): Temporal | null {
		if (txt instanceof TText) return this._textcat_ttext_ttext(txt as TText);
		if (typeof txt === 'string') return this._textcat_ttext_text(txt as string);
		throw new TypeError(`TText.textcat: no overload takes these arguments`);
	}

	/** MEOS: tge_ttext_text, chosen by the arguments' types */
	override tge(txt: string | Temporal): Temporal | null {
		if (typeof txt === 'string') return this._tge_ttext_text(txt as string);
		return super.tge(txt as Temporal);
	}

	/** MEOS: tgt_ttext_text, chosen by the arguments' types */
	override tgt(txt: string | Temporal): Temporal | null {
		if (typeof txt === 'string') return this._tgt_ttext_text(txt as string);
		return super.tgt(txt as Temporal);
	}

	/** MEOS: tle_ttext_text, chosen by the arguments' types */
	override tle(txt: string | Temporal): Temporal | null {
		if (typeof txt === 'string') return this._tle_ttext_text(txt as string);
		return super.tle(txt as Temporal);
	}

	/** MEOS: tlt_ttext_text, chosen by the arguments' types */
	override tlt(txt: string | Temporal): Temporal | null {
		if (typeof txt === 'string') return this._tlt_ttext_text(txt as string);
		return super.tlt(txt as Temporal);
	}

	/** MEOS: tne_ttext_text, chosen by the arguments' types */
	override tne(txt: string | Temporal): Temporal | null {
		if (typeof txt === 'string') return this._tne_ttext_text(txt as string);
		return super.tne(txt as Temporal);
	}

	/** MEOS: ttext_to_tjsonb */
	toTjsonb(): Temporal | null {
		return wrapTemporalOrNull(F.ttext_to_tjsonb(this.ptr)) as Temporal | null;
	}

	/** MEOS: ttext_upper */
	upper(): Temporal {
		return wrapTemporal(F.ttext_upper(this.ptr)) as Temporal;
	}

	/** MEOS: ttext_value */
	value(): string {
		return F.ttext_value(this.ptr);
	}

	/** MEOS: ttext_values */
	values(): Text[] {
		const _count = _alloc(4);
		try {
			const _arr = F.ttext_values(this.ptr, _count);
			if (!_arr) return [];
			try {
				const _n = _view(_count, 4).getInt32(0, true);
				const _v = _view(_arr, _n * 8);
				const _out: Text[] = [];
				for (let _i = 0; _i < _n; _i++) _out.push(wrapText(Number(_v.getBigUint64(_i * 8, true))) as Text);
				return _out;
			} finally {
				_free(_arr);
			}
		} finally {
			_free(_count);
		}
	}

	/** MEOS: ttext_from_base_temp */
	static fromBaseTemp(txt: string, temp: Temporal): TText {
		return wrapTemporal(F.ttext_from_base_temp(txt, temp.ptr)) as TText;
	}

	/** MEOS: ttext_from_mfjson */
	static fromMFJSON(str: string): TText {
		return wrapTemporal(F.ttext_from_mfjson(str)) as TText;
	}

	/** MEOS: ttext_in */
	static fromText(str: string): TText {
		return TText.in(str);
	}

	/** MEOS: ttext_in */
	static in(str: string): TText {
		return wrapTemporal(F.ttext_in(str)) as TText;
	}
}

/**
 * A TText of subtype TInstant.
 */
export class TTextInst extends TText {

	/** MEOS: ttextinst_make */
	static make(txt: string, t: TimestampTz): TTextInst {
		return wrapTemporal(F.ttextinst_make(txt, t)) as TTextInst;
	}
}

/**
 * A TText of subtype TSequence.
 */
export class TTextSeq extends TText {

	/** MEOS: ttextseq_from_base_tstzset */
	static fromBaseTstzset(txt: string, s: Set): TTextSeq {
		return wrapTemporal(F.ttextseq_from_base_tstzset(txt, s.ptr)) as TTextSeq;
	}

	/** MEOS: ttextseq_from_base_tstzspan */
	static fromBaseTstzspan(txt: string, s: Span): TTextSeq {
		return wrapTemporal(F.ttextseq_from_base_tstzspan(txt, s.ptr)) as TTextSeq;
	}
}

/**
 * A TText of subtype TSequenceSet.
 */
export class TTextSeqSet extends TText {

	/** MEOS: ttextseqset_from_base_tstzspanset */
	static fromBaseTstzspanset(txt: string, ss: SpanSet): TTextSeqSet {
		return wrapTemporal(F.ttextseqset_from_base_tstzspanset(txt, ss.ptr)) as TTextSeqSet;
	}
}

/**
 * PostgreSQL text, the base type of TText and TextSet.
 */
export class Text extends Value {

	/** MEOS: text_hash */
	static hash(txt: string, collid: number): number {
		return F.text_hash(txt, collid);
	}

	/** MEOS: text_hash_extended */
	static hashExtended(txt: string, seed: number, collid: number): number {
		return F.text_hash_extended(txt, seed, collid);
	}

	/** MEOS: text_in */
	static in(str: string): string {
		return F.text_in(str);
	}

	/** MEOS: text_initcap */
	static initcap(txt: string): string {
		return F.text_initcap(txt);
	}

	/** MEOS: text_lower */
	static lower(txt: string): string {
		return F.text_lower(txt);
	}

	/** MEOS: text_out */
	static out(txt: string): string {
		return F.text_out(txt);
	}

	/** MEOS: text_to_set */
	static toSet(txt: string): Set {
		return wrapSet(F.text_to_set(txt)) as Set;
	}

	/** MEOS: text_upper */
	static upper(txt: string): string {
		return F.text_upper(txt);
	}
}

/**
 * The TextSet class of the MEOS object model.
 */
export class TextSet extends Set {

	/** The text MEOS writes this value as (MEOS: textset_out). */
	override toString(): string {
		return this.out();
	}

	/** MEOS: contains_set_text */
	private _contains_set_text(t: string): boolean {
		return F.contains_set_text(this.ptr, t);
	}

	/** MEOS: intersection_set_text */
	private _intersection_set_text(txt: string): Set | null {
		return wrapSetOrNull(F.intersection_set_text(this.ptr, txt)) as Set | null;
	}

	/** MEOS: left_set_text */
	private _left_set_text(txt: string): boolean {
		return F.left_set_text(this.ptr, txt);
	}

	/** MEOS: minus_set_text */
	private _minus_set_text(txt: string): Set | null {
		return wrapSetOrNull(F.minus_set_text(this.ptr, txt)) as Set | null;
	}

	/** MEOS: overleft_set_text */
	private _overleft_set_text(txt: string): boolean {
		return F.overleft_set_text(this.ptr, txt);
	}

	/** MEOS: overright_set_text */
	private _overright_set_text(txt: string): boolean {
		return F.overright_set_text(this.ptr, txt);
	}

	/** MEOS: right_set_text */
	private _right_set_text(txt: string): boolean {
		return F.right_set_text(this.ptr, txt);
	}

	/** MEOS: union_set_text */
	private _union_set_text(txt: string): Set | null {
		return wrapSetOrNull(F.union_set_text(this.ptr, txt)) as Set | null;
	}

	/** MEOS: textset_out */
	asText(): string {
		return this.out();
	}

	/** MEOS: contains_set_text, chosen by the arguments' types */
	override contains(t: string | Set): boolean {
		if (typeof t === 'string') return this._contains_set_text(t as string);
		return super.contains(t as Set);
	}

	/** MEOS: textset_end_value */
	endValue(): string {
		return F.textset_end_value(this.ptr);
	}

	/** MEOS: textset_initcap */
	initcap(): Set {
		return wrapSet(F.textset_initcap(this.ptr)) as Set;
	}

	/** MEOS: intersection_set_text, chosen by the arguments' types */
	override intersection(txt: string | Set): Set | null {
		if (typeof txt === 'string') return this._intersection_set_text(txt as string);
		return super.intersection(txt as Set);
	}

	/** MEOS: left_set_text, chosen by the arguments' types */
	override left(txt: string | Set): boolean {
		if (typeof txt === 'string') return this._left_set_text(txt as string);
		return super.left(txt as Set);
	}

	/** MEOS: textset_lower */
	lower(): Set {
		return wrapSet(F.textset_lower(this.ptr)) as Set;
	}

	/** MEOS: minus_set_text, chosen by the arguments' types */
	override minus(txt: string | Set): Set | null {
		if (typeof txt === 'string') return this._minus_set_text(txt as string);
		return super.minus(txt as Set);
	}

	/** MEOS: textset_out */
	out(): string {
		return F.textset_out(this.ptr);
	}

	/** MEOS: overleft_set_text, chosen by the arguments' types */
	override overleft(txt: string | Set): boolean {
		if (typeof txt === 'string') return this._overleft_set_text(txt as string);
		return super.overleft(txt as Set);
	}

	/** MEOS: overright_set_text, chosen by the arguments' types */
	override overright(txt: string | Set): boolean {
		if (typeof txt === 'string') return this._overright_set_text(txt as string);
		return super.overright(txt as Set);
	}

	/** MEOS: right_set_text, chosen by the arguments' types */
	override right(txt: string | Set): boolean {
		if (typeof txt === 'string') return this._right_set_text(txt as string);
		return super.right(txt as Set);
	}

	/** MEOS: textset_start_value */
	startValue(): string {
		return F.textset_start_value(this.ptr);
	}

	/** MEOS: textcat_textset_text */
	textcat(txt: string): Set {
		return wrapSet(F.textcat_textset_text(this.ptr, txt)) as Set;
	}

	/** MEOS: textset_to_jsonbset */
	toJsonbset(): Set | null {
		return wrapSetOrNull(F.textset_to_jsonbset(this.ptr)) as Set | null;
	}

	/** MEOS: union_set_text, chosen by the arguments' types */
	override union(txt: string | Set): Set | null {
		if (typeof txt === 'string') return this._union_set_text(txt as string);
		return super.union(txt as Set);
	}

	/** MEOS: textset_upper */
	upper(): Set {
		return wrapSet(F.textset_upper(this.ptr)) as Set;
	}

	/** MEOS: textset_values */
	values(): Text[] {
		const _count = _alloc(4);
		try {
			const _arr = F.textset_values(this.ptr, _count);
			if (!_arr) return [];
			try {
				const _n = _view(_count, 4).getInt32(0, true);
				const _v = _view(_arr, _n * 8);
				const _out: Text[] = [];
				for (let _i = 0; _i < _n; _i++) _out.push(wrapText(Number(_v.getBigUint64(_i * 8, true))) as Text);
				return _out;
			} finally {
				_free(_arr);
			}
		} finally {
			_free(_count);
		}
	}

	/** MEOS: textset_in */
	static fromText(str: string): TextSet {
		return TextSet.in(str);
	}

	/** MEOS: textset_in */
	static in(str: string): TextSet {
		return wrapSet(F.textset_in(str)) as TextSet;
	}

	/** MEOS: textset_make */
	static make(values: Text[]): TextSet {
		const _values = _ptrArray(values.map(x => x.ptr));
		try {
			return wrapSet(F.textset_make(_values, values.length)) as TextSet;
		} finally {
			_free(_values);
		}
	}
}

/**
 * The TsTzSet class of the MEOS object model.
 */
export class TsTzSet extends Set {

	/** The text MEOS writes this value as (MEOS: tstzset_out). */
	override toString(): string {
		return this.out();
	}

	/** MEOS: contains_set_timestamptz */
	private _contains_set_timestamptz(t: TimestampTz): boolean {
		return F.contains_set_timestamptz(this.ptr, t);
	}

	/** MEOS: distance_set_timestamptz */
	private _distance_set_timestamptz(t: TimestampTz): Interval {
		return _takeInterval(F.distance_set_timestamptz(this.ptr, t))!;
	}

	/** MEOS: distance_tstzset_tstzset */
	private _distance_tstzset_tstzset(s2: TsTzSet): Interval {
		return _takeInterval(F.distance_tstzset_tstzset(this.ptr, s2.ptr))!;
	}

	/** MEOS: intersection_set_timestamptz */
	private _intersection_set_timestamptz(t: TimestampTz): Set | null {
		return wrapSetOrNull(F.intersection_set_timestamptz(this.ptr, t)) as Set | null;
	}

	/** MEOS: minus_set_timestamptz */
	private _minus_set_timestamptz(t: TimestampTz): Set | null {
		return wrapSetOrNull(F.minus_set_timestamptz(this.ptr, t)) as Set | null;
	}

	/** MEOS: union_set_timestamptz */
	private _union_set_timestamptz(t: TimestampTz): Set | null {
		return wrapSetOrNull(F.union_set_timestamptz(this.ptr, t)) as Set | null;
	}

	/** MEOS: after_set_timestamptz */
	after(t: TimestampTz): boolean {
		return F.after_set_timestamptz(this.ptr, t);
	}

	/** MEOS: tstzset_out */
	asText(): string {
		return this.out();
	}

	/** MEOS: before_set_timestamptz */
	before(t: TimestampTz): boolean {
		return F.before_set_timestamptz(this.ptr, t);
	}

	/** MEOS: contains_set_timestamptz, chosen by the arguments' types */
	override contains(t: TimestampTz | Set): boolean {
		if (typeof t === 'number') return this._contains_set_timestamptz(t as TimestampTz);
		return super.contains(t as Set);
	}

	/** MEOS: distance_set_timestamptz, distance_tstzset_tstzset, chosen by the arguments' types */
	distance(t: TimestampTz | TsTzSet): Interval {
		if (t instanceof TsTzSet) return this._distance_tstzset_tstzset(t as TsTzSet);
		if (typeof t === 'number') return this._distance_set_timestamptz(t as TimestampTz);
		throw new TypeError(`TsTzSet.distance: no overload takes these arguments`);
	}

	/** MEOS: intersection_set_timestamptz, chosen by the arguments' types */
	override intersection(t: TimestampTz | Set): Set | null {
		if (typeof t === 'number') return this._intersection_set_timestamptz(t as TimestampTz);
		return super.intersection(t as Set);
	}

	/** MEOS: minus_set_timestamptz, chosen by the arguments' types */
	override minus(t: TimestampTz | Set): Set | null {
		if (typeof t === 'number') return this._minus_set_timestamptz(t as TimestampTz);
		return super.minus(t as Set);
	}

	/** MEOS: tstzset_out */
	out(): string {
		return F.tstzset_out(this.ptr);
	}

	/** MEOS: overafter_set_timestamptz */
	overafter(t: TimestampTz): boolean {
		return F.overafter_set_timestamptz(this.ptr, t);
	}

	/** MEOS: overbefore_set_timestamptz */
	overbefore(t: TimestampTz): boolean {
		return F.overbefore_set_timestamptz(this.ptr, t);
	}

	/** MEOS: after_timestamptz_set */
	rafter(t: TimestampTz): boolean {
		return F.after_timestamptz_set(t, this.ptr);
	}

	/** MEOS: before_timestamptz_set */
	rbefore(t: TimestampTz): boolean {
		return F.before_timestamptz_set(t, this.ptr);
	}

	/** MEOS: contained_timestamptz_set */
	rcontained(t: TimestampTz): boolean {
		return F.contained_timestamptz_set(t, this.ptr);
	}

	/** MEOS: intersection_timestamptz_set */
	rintersection(t: TimestampTz): Set | null {
		return wrapSetOrNull(F.intersection_timestamptz_set(t, this.ptr)) as Set | null;
	}

	/** MEOS: minus_timestamptz_set */
	rminus(t: TimestampTz): Set | null {
		return wrapSetOrNull(F.minus_timestamptz_set(t, this.ptr)) as Set | null;
	}

	/** MEOS: overafter_timestamptz_set */
	roverafter(t: TimestampTz): boolean {
		return F.overafter_timestamptz_set(t, this.ptr);
	}

	/** MEOS: overbefore_timestamptz_set */
	roverbefore(t: TimestampTz): boolean {
		return F.overbefore_timestamptz_set(t, this.ptr);
	}

	/** MEOS: union_timestamptz_set */
	runion(t: TimestampTz): Set | null {
		return wrapSetOrNull(F.union_timestamptz_set(t, this.ptr)) as Set | null;
	}

	/** MEOS: tstzset_scale */
	scale(duration: Interval): Set {
		const _duration = _putInterval(duration);
		try {
			return wrapSet(F.tstzset_scale(this.ptr, _duration)) as Set;
		} finally {
			_free(_duration);
		}
	}

	/** MEOS: tstzset_shift */
	shift(shift: Interval): Set {
		const _shift = _putInterval(shift);
		try {
			return wrapSet(F.tstzset_shift(this.ptr, _shift)) as Set;
		} finally {
			_free(_shift);
		}
	}

	/** MEOS: tstzset_shift_scale */
	shiftScale(shift: Interval, duration: Interval): Set {
		const _shift = _putInterval(shift);
		const _duration = _putInterval(duration);
		try {
			return wrapSet(F.tstzset_shift_scale(this.ptr, _shift, _duration)) as Set;
		} finally {
			_free(_shift);
			_free(_duration);
		}
	}

	/** MEOS: tstzset_to_dateset */
	toDateset(): Set {
		return wrapSet(F.tstzset_to_dateset(this.ptr)) as Set;
	}

	/** MEOS: tstzset_to_stbox */
	toStbox(): STBox {
		return wrapSTBox(F.tstzset_to_stbox(this.ptr)) as STBox;
	}

	/** MEOS: tstzset_tprecision */
	tprecision(duration: Interval, torigin: TimestampTz): Set {
		const _duration = _putInterval(duration);
		try {
			return wrapSet(F.tstzset_tprecision(this.ptr, _duration, torigin)) as Set;
		} finally {
			_free(_duration);
		}
	}

	/** MEOS: union_set_timestamptz, chosen by the arguments' types */
	override union(t: TimestampTz | Set): Set | null {
		if (typeof t === 'number') return this._union_set_timestamptz(t as TimestampTz);
		return super.union(t as Set);
	}

	/** MEOS: tstzset_values */
	values(): TimestampTz[] {
		const _count = _alloc(4);
		try {
			const _arr = F.tstzset_values(this.ptr, _count);
			if (!_arr) return [];
			try {
				const _n = _view(_count, 4).getInt32(0, true);
				const _v = _view(_arr, _n * 8);
				const _out: TimestampTz[] = [];
				for (let _i = 0; _i < _n; _i++) _out.push(Number(_v.getBigInt64(_i * 8, true)));
				return _out;
			} finally {
				_free(_arr);
			}
		} finally {
			_free(_count);
		}
	}

	/** MEOS: tstzset_in */
	static fromText(str: string): TsTzSet {
		return TsTzSet.in(str);
	}

	/** MEOS: tstzset_in */
	static in(str: string): TsTzSet {
		return wrapSet(F.tstzset_in(str)) as TsTzSet;
	}

	/** MEOS: tstzset_make */
	static make(values: number[]): TsTzSet {
		const _values = _alloc(Math.max(values.length, 1) * 8);
		{ const _v = _view(_values, Math.max(values.length, 1) * 8); values.forEach((_x, _i) => _v.setBigInt64(_i * 8, BigInt(_x), true)); }
		try {
			return wrapSet(F.tstzset_make(_values, values.length)) as TsTzSet;
		} finally {
			_free(_values);
		}
	}
}

/**
 * The TsTzSpan class of the MEOS object model.
 */
export class TsTzSpan extends Span {

	/** The text MEOS writes this value as (MEOS: tstzspan_out). */
	override toString(): string {
		return this.out();
	}

	/** MEOS: adjacent_span_timestamptz */
	private _adjacent_span_timestamptz(t: TimestampTz): boolean {
		return F.adjacent_span_timestamptz(this.ptr, t);
	}

	/** MEOS: adjacent_tstzspan_tbox */
	private _adjacent_tstzspan_tbox(box: TBox): boolean {
		return F.adjacent_tstzspan_tbox(this.ptr, box.ptr);
	}

	/** MEOS: adjacent_tstzspan_temporal */
	private _adjacent_tstzspan_temporal(temp: Temporal): boolean {
		return F.adjacent_tstzspan_temporal(this.ptr, temp.ptr);
	}

	/** MEOS: after_span_timestamptz */
	private _after_span_timestamptz(t: TimestampTz): boolean {
		return F.after_span_timestamptz(this.ptr, t);
	}

	/** MEOS: after_tstzspan_tbox */
	private _after_tstzspan_tbox(box: TBox): boolean {
		return F.after_tstzspan_tbox(this.ptr, box.ptr);
	}

	/** MEOS: after_tstzspan_temporal */
	private _after_tstzspan_temporal(temp: Temporal): boolean {
		return F.after_tstzspan_temporal(this.ptr, temp.ptr);
	}

	/** MEOS: before_span_timestamptz */
	private _before_span_timestamptz(t: TimestampTz): boolean {
		return F.before_span_timestamptz(this.ptr, t);
	}

	/** MEOS: before_tstzspan_tbox */
	private _before_tstzspan_tbox(box: TBox): boolean {
		return F.before_tstzspan_tbox(this.ptr, box.ptr);
	}

	/** MEOS: before_tstzspan_temporal */
	private _before_tstzspan_temporal(temp: Temporal): boolean {
		return F.before_tstzspan_temporal(this.ptr, temp.ptr);
	}

	/** MEOS: contained_tstzspan_tbox */
	private _contained_tstzspan_tbox(box: TBox): boolean {
		return F.contained_tstzspan_tbox(this.ptr, box.ptr);
	}

	/** MEOS: contained_tstzspan_temporal */
	private _contained_tstzspan_temporal(temp: Temporal): boolean {
		return F.contained_tstzspan_temporal(this.ptr, temp.ptr);
	}

	/** MEOS: contains_span_timestamptz */
	private _contains_span_timestamptz(t: TimestampTz): boolean {
		return F.contains_span_timestamptz(this.ptr, t);
	}

	/** MEOS: contains_tstzspan_tbox */
	private _contains_tstzspan_tbox(box: TBox): boolean {
		return F.contains_tstzspan_tbox(this.ptr, box.ptr);
	}

	/** MEOS: contains_tstzspan_temporal */
	private _contains_tstzspan_temporal(temp: Temporal): boolean {
		return F.contains_tstzspan_temporal(this.ptr, temp.ptr);
	}

	/** MEOS: distance_span_timestamptz */
	private _distance_span_timestamptz(t: TimestampTz): Interval {
		return _takeInterval(F.distance_span_timestamptz(this.ptr, t))!;
	}

	/** MEOS: distance_tstzspan_tstzspan */
	private _distance_tstzspan_tstzspan(s2: TsTzSpan): Interval {
		return _takeInterval(F.distance_tstzspan_tstzspan(this.ptr, s2.ptr))!;
	}

	/** MEOS: intersection_span_timestamptz */
	private _intersection_span_timestamptz(t: TimestampTz): Span | null {
		return wrapSpanOrNull(F.intersection_span_timestamptz(this.ptr, t)) as Span | null;
	}

	/** MEOS: minus_span_timestamptz */
	private _minus_span_timestamptz(t: TimestampTz): SpanSet | null {
		return wrapSpanSetOrNull(F.minus_span_timestamptz(this.ptr, t)) as SpanSet | null;
	}

	/** MEOS: overafter_span_timestamptz */
	private _overafter_span_timestamptz(t: TimestampTz): boolean {
		return F.overafter_span_timestamptz(this.ptr, t);
	}

	/** MEOS: overafter_tstzspan_tbox */
	private _overafter_tstzspan_tbox(box: TBox): boolean {
		return F.overafter_tstzspan_tbox(this.ptr, box.ptr);
	}

	/** MEOS: overafter_tstzspan_temporal */
	private _overafter_tstzspan_temporal(temp: Temporal): boolean {
		return F.overafter_tstzspan_temporal(this.ptr, temp.ptr);
	}

	/** MEOS: overbefore_span_timestamptz */
	private _overbefore_span_timestamptz(t: TimestampTz): boolean {
		return F.overbefore_span_timestamptz(this.ptr, t);
	}

	/** MEOS: overbefore_tstzspan_tbox */
	private _overbefore_tstzspan_tbox(box: TBox): boolean {
		return F.overbefore_tstzspan_tbox(this.ptr, box.ptr);
	}

	/** MEOS: overbefore_tstzspan_temporal */
	private _overbefore_tstzspan_temporal(temp: Temporal): boolean {
		return F.overbefore_tstzspan_temporal(this.ptr, temp.ptr);
	}

	/** MEOS: overlaps_tstzspan_tbox */
	private _overlaps_tstzspan_tbox(box: TBox): boolean {
		return F.overlaps_tstzspan_tbox(this.ptr, box.ptr);
	}

	/** MEOS: overlaps_tstzspan_temporal */
	private _overlaps_tstzspan_temporal(temp: Temporal): boolean {
		return F.overlaps_tstzspan_temporal(this.ptr, temp.ptr);
	}

	/** MEOS: same_tstzspan_tbox */
	private _same_tstzspan_tbox(box: TBox): boolean {
		return F.same_tstzspan_tbox(this.ptr, box.ptr);
	}

	/** MEOS: same_tstzspan_temporal */
	private _same_tstzspan_temporal(temp: Temporal): boolean {
		return F.same_tstzspan_temporal(this.ptr, temp.ptr);
	}

	/** MEOS: union_span_timestamptz */
	private _union_span_timestamptz(t: TimestampTz): SpanSet {
		return wrapSpanSet(F.union_span_timestamptz(this.ptr, t)) as SpanSet;
	}

	/** MEOS: adjacent_span_timestamptz, adjacent_tstzspan_tbox, adjacent_tstzspan_temporal, chosen by the arguments' types */
	override adjacent(t: TimestampTz | TBox | Temporal | SpanSet): boolean {
		if (t instanceof TBox) return this._adjacent_tstzspan_tbox(t as TBox);
		if (t instanceof Temporal) return this._adjacent_tstzspan_temporal(t as Temporal);
		if (typeof t === 'number') return this._adjacent_span_timestamptz(t as TimestampTz);
		return super.adjacent(t as SpanSet);
	}

	/** MEOS: after_span_timestamptz, after_tstzspan_tbox, after_tstzspan_temporal, chosen by the arguments' types */
	after(t: TimestampTz | TBox | Temporal): boolean {
		if (t instanceof TBox) return this._after_tstzspan_tbox(t as TBox);
		if (t instanceof Temporal) return this._after_tstzspan_temporal(t as Temporal);
		if (typeof t === 'number') return this._after_span_timestamptz(t as TimestampTz);
		throw new TypeError(`TsTzSpan.after: no overload takes these arguments`);
	}

	/** MEOS: tstzspan_out */
	asText(): string {
		return this.out();
	}

	/** MEOS: before_span_timestamptz, before_tstzspan_tbox, before_tstzspan_temporal, chosen by the arguments' types */
	before(t: TimestampTz | TBox | Temporal): boolean {
		if (t instanceof TBox) return this._before_tstzspan_tbox(t as TBox);
		if (t instanceof Temporal) return this._before_tstzspan_temporal(t as Temporal);
		if (typeof t === 'number') return this._before_span_timestamptz(t as TimestampTz);
		throw new TypeError(`TsTzSpan.before: no overload takes these arguments`);
	}

	/** MEOS: tstzspan_bins */
	bins(duration: Interval, torigin: TimestampTz, border_inc: boolean): Span[] {
		const _duration = _putInterval(duration);
		const _count = _alloc(4);
		try {
			const _arr = F.tstzspan_bins(this.ptr, _duration, torigin, border_inc, _count);
			if (!_arr) return [];
			try {
				const _n = _view(_count, 4).getInt32(0, true);
				const _v = _view(_arr, _n * 24);
				const _out: Span[] = [];
				for (let _i = 0; _i < _n; _i++) _out.push(wrapSpan(_copy(_arr + _i * 24, 24)) as Span);
				return _out;
			} finally {
				_free(_arr);
			}
		} finally {
			_free(_duration);
			_free(_count);
		}
	}

	/** MEOS: contained_tstzspan_tbox, contained_tstzspan_temporal, chosen by the arguments' types */
	override contained(box: TBox | Temporal | Span | SpanSet): boolean {
		if (box instanceof TBox) return this._contained_tstzspan_tbox(box as TBox);
		if (box instanceof Temporal) return this._contained_tstzspan_temporal(box as Temporal);
		return super.contained(box as Span | SpanSet);
	}

	/** MEOS: contains_span_timestamptz, contains_tstzspan_tbox, contains_tstzspan_temporal, chosen by the arguments' types */
	override contains(t: TimestampTz | TBox | Temporal | Span | SpanSet): boolean {
		if (t instanceof TBox) return this._contains_tstzspan_tbox(t as TBox);
		if (t instanceof Temporal) return this._contains_tstzspan_temporal(t as Temporal);
		if (typeof t === 'number') return this._contains_span_timestamptz(t as TimestampTz);
		return super.contains(t as Span | SpanSet);
	}

	/** MEOS: distance_span_timestamptz, distance_tstzspan_tstzspan, chosen by the arguments' types */
	distance(t: TimestampTz | TsTzSpan): Interval {
		if (t instanceof TsTzSpan) return this._distance_tstzspan_tstzspan(t as TsTzSpan);
		if (typeof t === 'number') return this._distance_span_timestamptz(t as TimestampTz);
		throw new TypeError(`TsTzSpan.distance: no overload takes these arguments`);
	}

	/** MEOS: tstzspan_duration */
	duration(): Interval {
		return _takeInterval(F.tstzspan_duration(this.ptr))!;
	}

	/** MEOS: tstzspan_expand */
	expand(interv: Interval): Span | null {
		const _interv = _putInterval(interv);
		try {
			return wrapSpanOrNull(F.tstzspan_expand(this.ptr, _interv)) as Span | null;
		} finally {
			_free(_interv);
		}
	}

	/** MEOS: intersection_span_timestamptz, chosen by the arguments' types */
	override intersection(t: TimestampTz | Span | SpanSet): Span | null | SpanSet {
		if (typeof t === 'number') return this._intersection_span_timestamptz(t as TimestampTz);
		return super.intersection(t as Span | SpanSet);
	}

	/** MEOS: minus_span_timestamptz, chosen by the arguments' types */
	override minus(t: TimestampTz | Span | SpanSet): SpanSet | null {
		if (typeof t === 'number') return this._minus_span_timestamptz(t as TimestampTz);
		return super.minus(t as Span | SpanSet);
	}

	/** MEOS: numspan_tstzspan_to_tbox */
	numspan(p: TsTzSpan): TBox {
		return wrapTBox(F.numspan_tstzspan_to_tbox(this.ptr, p.ptr)) as TBox;
	}

	/** MEOS: tstzspan_out */
	out(): string {
		return F.tstzspan_out(this.ptr);
	}

	/** MEOS: overafter_span_timestamptz, overafter_tstzspan_tbox, overafter_tstzspan_temporal, chosen by the arguments' types */
	overafter(t: TimestampTz | TBox | Temporal): boolean {
		if (t instanceof TBox) return this._overafter_tstzspan_tbox(t as TBox);
		if (t instanceof Temporal) return this._overafter_tstzspan_temporal(t as Temporal);
		if (typeof t === 'number') return this._overafter_span_timestamptz(t as TimestampTz);
		throw new TypeError(`TsTzSpan.overafter: no overload takes these arguments`);
	}

	/** MEOS: overbefore_span_timestamptz, overbefore_tstzspan_tbox, overbefore_tstzspan_temporal, chosen by the arguments' types */
	overbefore(t: TimestampTz | TBox | Temporal): boolean {
		if (t instanceof TBox) return this._overbefore_tstzspan_tbox(t as TBox);
		if (t instanceof Temporal) return this._overbefore_tstzspan_temporal(t as Temporal);
		if (typeof t === 'number') return this._overbefore_span_timestamptz(t as TimestampTz);
		throw new TypeError(`TsTzSpan.overbefore: no overload takes these arguments`);
	}

	/** MEOS: overlaps_tstzspan_tbox, overlaps_tstzspan_temporal, chosen by the arguments' types */
	override overlaps(box: TBox | Temporal | Span | SpanSet): boolean {
		if (box instanceof TBox) return this._overlaps_tstzspan_tbox(box as TBox);
		if (box instanceof Temporal) return this._overlaps_tstzspan_temporal(box as Temporal);
		return super.overlaps(box as Span | SpanSet);
	}

	/** MEOS: adjacent_timestamptz_span */
	radjacent(t: TimestampTz): boolean {
		return F.adjacent_timestamptz_span(t, this.ptr);
	}

	/** MEOS: after_timestamptz_span */
	rafter(t: TimestampTz): boolean {
		return F.after_timestamptz_span(t, this.ptr);
	}

	/** MEOS: before_timestamptz_span */
	rbefore(t: TimestampTz): boolean {
		return F.before_timestamptz_span(t, this.ptr);
	}

	/** MEOS: contained_timestamptz_span */
	rcontained(t: TimestampTz): boolean {
		return F.contained_timestamptz_span(t, this.ptr);
	}

	/** MEOS: intersection_timestamptz_span */
	rintersection(t: TimestampTz): Span | null {
		return wrapSpanOrNull(F.intersection_timestamptz_span(t, this.ptr)) as Span | null;
	}

	/** MEOS: minus_timestamptz_span */
	rminus(t: TimestampTz): SpanSet | null {
		return wrapSpanSetOrNull(F.minus_timestamptz_span(t, this.ptr)) as SpanSet | null;
	}

	/** MEOS: overafter_timestamptz_span */
	roverafter(t: TimestampTz): boolean {
		return F.overafter_timestamptz_span(t, this.ptr);
	}

	/** MEOS: overbefore_timestamptz_span */
	roverbefore(t: TimestampTz): boolean {
		return F.overbefore_timestamptz_span(t, this.ptr);
	}

	/** MEOS: union_timestamptz_span */
	runion(t: TimestampTz): SpanSet {
		return wrapSpanSet(F.union_timestamptz_span(t, this.ptr)) as SpanSet;
	}

	/** MEOS: same_tstzspan_tbox, same_tstzspan_temporal, chosen by the arguments' types */
	override same(box: TBox | Temporal | Span): boolean {
		if (box instanceof TBox) return this._same_tstzspan_tbox(box as TBox);
		if (box instanceof Temporal) return this._same_tstzspan_temporal(box as Temporal);
		return super.same(box as Span);
	}

	/** MEOS: tstzspan_scale */
	scale(duration: Interval): Span {
		const _duration = _putInterval(duration);
		try {
			return wrapSpan(F.tstzspan_scale(this.ptr, _duration)) as Span;
		} finally {
			_free(_duration);
		}
	}

	/** MEOS: tstzspan_shift */
	shift(shift: Interval): Span {
		const _shift = _putInterval(shift);
		try {
			return wrapSpan(F.tstzspan_shift(this.ptr, _shift)) as Span;
		} finally {
			_free(_shift);
		}
	}

	/** MEOS: tstzspan_shift_scale */
	shiftScale(shift: Interval, duration: Interval): Span {
		const _shift = _putInterval(shift);
		const _duration = _putInterval(duration);
		try {
			return wrapSpan(F.tstzspan_shift_scale(this.ptr, _shift, _duration)) as Span;
		} finally {
			_free(_shift);
			_free(_duration);
		}
	}

	/** MEOS: tstzspan_to_datespan */
	toDatespan(): Span {
		return wrapSpan(F.tstzspan_to_datespan(this.ptr)) as Span;
	}

	/** MEOS: tstzspan_to_stbox */
	toStbox(): STBox {
		return wrapSTBox(F.tstzspan_to_stbox(this.ptr)) as STBox;
	}

	/** MEOS: tstzspan_tprecision */
	tprecision(duration: Interval, torigin: TimestampTz): Span {
		const _duration = _putInterval(duration);
		try {
			return wrapSpan(F.tstzspan_tprecision(this.ptr, _duration, torigin)) as Span;
		} finally {
			_free(_duration);
		}
	}

	/** MEOS: union_span_timestamptz, chosen by the arguments' types */
	override union(t: TimestampTz | Span | SpanSet): SpanSet | null {
		if (typeof t === 'number') return this._union_span_timestamptz(t as TimestampTz);
		return super.union(t as Span | SpanSet);
	}

	/** MEOS: tstzspan_in */
	static fromText(str: string): TsTzSpan {
		return TsTzSpan.in(str);
	}

	/** MEOS: tstzspan_get_bin */
	static getBin(t: TimestampTz, duration: Interval, torigin: TimestampTz): Span {
		const _duration = _putInterval(duration);
		try {
			return wrapSpan(F.tstzspan_get_bin(t, _duration, torigin)) as Span;
		} finally {
			_free(_duration);
		}
	}

	/** MEOS: tstzspan_in */
	static in(str: string): TsTzSpan {
		return wrapSpan(F.tstzspan_in(str)) as TsTzSpan;
	}

	/** MEOS: tstzspan_make */
	static make(lower: TimestampTz, upper: TimestampTz, lower_inc: boolean, upper_inc: boolean): TsTzSpan {
		return wrapSpan(F.tstzspan_make(lower, upper, lower_inc, upper_inc)) as TsTzSpan;
	}
}

/**
 * The TsTzSpanSet class of the MEOS object model.
 */
export class TsTzSpanSet extends SpanSet {

	/** The text MEOS writes this value as (MEOS: tstzspanset_out). */
	override toString(): string {
		return this.out();
	}

	/** MEOS: adjacent_spanset_timestamptz */
	private _adjacent_spanset_timestamptz(t: TimestampTz): boolean {
		return F.adjacent_spanset_timestamptz(this.ptr, t);
	}

	/** MEOS: contains_spanset_timestamptz */
	private _contains_spanset_timestamptz(t: TimestampTz): boolean {
		return F.contains_spanset_timestamptz(this.ptr, t);
	}

	/** MEOS: distance_spanset_timestamptz */
	private _distance_spanset_timestamptz(t: TimestampTz): Interval {
		return _takeInterval(F.distance_spanset_timestamptz(this.ptr, t))!;
	}

	/** MEOS: distance_tstzspanset_tstzspan */
	private _distance_tstzspanset_tstzspan(s: TsTzSpan): Interval {
		return _takeInterval(F.distance_tstzspanset_tstzspan(this.ptr, s.ptr))!;
	}

	/** MEOS: distance_tstzspanset_tstzspanset */
	private _distance_tstzspanset_tstzspanset(ss2: TsTzSpanSet): Interval {
		return _takeInterval(F.distance_tstzspanset_tstzspanset(this.ptr, ss2.ptr))!;
	}

	/** MEOS: intersection_spanset_timestamptz */
	private _intersection_spanset_timestamptz(t: TimestampTz): SpanSet | null {
		return wrapSpanSetOrNull(F.intersection_spanset_timestamptz(this.ptr, t)) as SpanSet | null;
	}

	/** MEOS: minus_spanset_timestamptz */
	private _minus_spanset_timestamptz(t: TimestampTz): SpanSet | null {
		return wrapSpanSetOrNull(F.minus_spanset_timestamptz(this.ptr, t)) as SpanSet | null;
	}

	/** MEOS: union_spanset_timestamptz */
	private _union_spanset_timestamptz(t: TimestampTz): SpanSet | null {
		return wrapSpanSetOrNull(F.union_spanset_timestamptz(this.ptr, t)) as SpanSet | null;
	}

	/** MEOS: adjacent_spanset_timestamptz, chosen by the arguments' types */
	override adjacent(t: TimestampTz | Span | SpanSet): boolean {
		if (typeof t === 'number') return this._adjacent_spanset_timestamptz(t as TimestampTz);
		return super.adjacent(t as Span | SpanSet);
	}

	/** MEOS: after_spanset_timestamptz */
	after(t: TimestampTz): boolean {
		return F.after_spanset_timestamptz(this.ptr, t);
	}

	/** MEOS: tstzspanset_out */
	asText(): string {
		return this.out();
	}

	/** MEOS: before_spanset_timestamptz */
	before(t: TimestampTz): boolean {
		return F.before_spanset_timestamptz(this.ptr, t);
	}

	/** MEOS: tstzspanset_bins */
	bins(duration: Interval, torigin: TimestampTz, border_inc: boolean): Span[] {
		const _duration = _putInterval(duration);
		const _count = _alloc(4);
		try {
			const _arr = F.tstzspanset_bins(this.ptr, _duration, torigin, border_inc, _count);
			if (!_arr) return [];
			try {
				const _n = _view(_count, 4).getInt32(0, true);
				const _v = _view(_arr, _n * 24);
				const _out: Span[] = [];
				for (let _i = 0; _i < _n; _i++) _out.push(wrapSpan(_copy(_arr + _i * 24, 24)) as Span);
				return _out;
			} finally {
				_free(_arr);
			}
		} finally {
			_free(_duration);
			_free(_count);
		}
	}

	/** MEOS: contains_spanset_timestamptz, chosen by the arguments' types */
	override contains(t: TimestampTz | Span | SpanSet): boolean {
		if (typeof t === 'number') return this._contains_spanset_timestamptz(t as TimestampTz);
		return super.contains(t as Span | SpanSet);
	}

	/** MEOS: distance_spanset_timestamptz, distance_tstzspanset_tstzspan, distance_tstzspanset_tstzspanset, chosen by the arguments' types */
	distance(t: TimestampTz | TsTzSpan | TsTzSpanSet): Interval {
		if (t instanceof TsTzSpan) return this._distance_tstzspanset_tstzspan(t as TsTzSpan);
		if (t instanceof TsTzSpanSet) return this._distance_tstzspanset_tstzspanset(t as TsTzSpanSet);
		if (typeof t === 'number') return this._distance_spanset_timestamptz(t as TimestampTz);
		throw new TypeError(`TsTzSpanSet.distance: no overload takes these arguments`);
	}

	/** MEOS: intersection_spanset_timestamptz, chosen by the arguments' types */
	override intersection(t: TimestampTz | Span | SpanSet): SpanSet | null {
		if (typeof t === 'number') return this._intersection_spanset_timestamptz(t as TimestampTz);
		return super.intersection(t as Span | SpanSet);
	}

	/** MEOS: minus_spanset_timestamptz, chosen by the arguments' types */
	override minus(t: TimestampTz | Span | SpanSet): SpanSet | null {
		if (typeof t === 'number') return this._minus_spanset_timestamptz(t as TimestampTz);
		return super.minus(t as Span | SpanSet);
	}

	/** MEOS: tstzspanset_num_timestamps */
	numTimestamps(): number {
		return F.tstzspanset_num_timestamps(this.ptr);
	}

	/** MEOS: tstzspanset_out */
	out(): string {
		return F.tstzspanset_out(this.ptr);
	}

	/** MEOS: overafter_spanset_timestamptz */
	overafter(t: TimestampTz): boolean {
		return F.overafter_spanset_timestamptz(this.ptr, t);
	}

	/** MEOS: overbefore_spanset_timestamptz */
	overbefore(t: TimestampTz): boolean {
		return F.overbefore_spanset_timestamptz(this.ptr, t);
	}

	/** MEOS: adjacent_timestamptz_spanset */
	radjacent(t: TimestampTz): boolean {
		return F.adjacent_timestamptz_spanset(t, this.ptr);
	}

	/** MEOS: after_timestamptz_spanset */
	rafter(t: TimestampTz): boolean {
		return F.after_timestamptz_spanset(t, this.ptr);
	}

	/** MEOS: before_timestamptz_spanset */
	rbefore(t: TimestampTz): boolean {
		return F.before_timestamptz_spanset(t, this.ptr);
	}

	/** MEOS: contained_timestamptz_spanset */
	rcontained(t: TimestampTz): boolean {
		return F.contained_timestamptz_spanset(t, this.ptr);
	}

	/** MEOS: intersection_timestamptz_spanset */
	rintersection(t: TimestampTz): SpanSet | null {
		return wrapSpanSetOrNull(F.intersection_timestamptz_spanset(t, this.ptr)) as SpanSet | null;
	}

	/** MEOS: minus_timestamptz_spanset */
	rminus(t: TimestampTz): SpanSet | null {
		return wrapSpanSetOrNull(F.minus_timestamptz_spanset(t, this.ptr)) as SpanSet | null;
	}

	/** MEOS: overafter_timestamptz_spanset */
	roverafter(t: TimestampTz): boolean {
		return F.overafter_timestamptz_spanset(t, this.ptr);
	}

	/** MEOS: overbefore_timestamptz_spanset */
	roverbefore(t: TimestampTz): boolean {
		return F.overbefore_timestamptz_spanset(t, this.ptr);
	}

	/** MEOS: union_timestamptz_spanset */
	runion(t: TimestampTz): SpanSet | null {
		return wrapSpanSetOrNull(F.union_timestamptz_spanset(t, this.ptr)) as SpanSet | null;
	}

	/** MEOS: tstzspanset_scale */
	scale(duration: Interval): SpanSet {
		const _duration = _putInterval(duration);
		try {
			return wrapSpanSet(F.tstzspanset_scale(this.ptr, _duration)) as SpanSet;
		} finally {
			_free(_duration);
		}
	}

	/** MEOS: tstzspanset_shift */
	shift(shift: Interval): SpanSet {
		const _shift = _putInterval(shift);
		try {
			return wrapSpanSet(F.tstzspanset_shift(this.ptr, _shift)) as SpanSet;
		} finally {
			_free(_shift);
		}
	}

	/** MEOS: tstzspanset_shift_scale */
	shiftScale(shift: Interval, duration: Interval): SpanSet {
		const _shift = _putInterval(shift);
		const _duration = _putInterval(duration);
		try {
			return wrapSpanSet(F.tstzspanset_shift_scale(this.ptr, _shift, _duration)) as SpanSet;
		} finally {
			_free(_shift);
			_free(_duration);
		}
	}

	/** MEOS: tstzspanset_timestamps */
	timestamps(): Set {
		return wrapSet(F.tstzspanset_timestamps(this.ptr)) as Set;
	}

	/** MEOS: tstzspanset_to_datespanset */
	toDatespanset(): SpanSet {
		return wrapSpanSet(F.tstzspanset_to_datespanset(this.ptr)) as SpanSet;
	}

	/** MEOS: tstzspanset_to_stbox */
	toStbox(): STBox {
		return wrapSTBox(F.tstzspanset_to_stbox(this.ptr)) as STBox;
	}

	/** MEOS: tstzspanset_tprecision */
	tprecision(duration: Interval, torigin: TimestampTz): SpanSet {
		const _duration = _putInterval(duration);
		try {
			return wrapSpanSet(F.tstzspanset_tprecision(this.ptr, _duration, torigin)) as SpanSet;
		} finally {
			_free(_duration);
		}
	}

	/** MEOS: union_spanset_timestamptz, chosen by the arguments' types */
	override union(t: TimestampTz | Span | SpanSet): SpanSet | null {
		if (typeof t === 'number') return this._union_spanset_timestamptz(t as TimestampTz);
		return super.union(t as Span | SpanSet);
	}

	/** MEOS: tstzspanset_in */
	static fromText(str: string): TsTzSpanSet {
		return TsTzSpanSet.in(str);
	}

	/** MEOS: tstzspanset_in */
	static in(str: string): TsTzSpanSet {
		return wrapSpanSet(F.tstzspanset_in(str)) as TsTzSpanSet;
	}
}

/** The value at `ptr` as the Cbuffer class its runtime type names. */
export function wrapCbuffer(ptr: Ptr): Cbuffer {
	return new Cbuffer(ptr);
}

/** As wrapCbuffer, answering null for a null pointer. */
export function wrapCbufferOrNull(ptr: Ptr): Cbuffer | null {
	return ptr ? wrapCbuffer(ptr) : null;
}

/** The value at `ptr` as the Geo class its runtime type names. */
export function wrapGeo(ptr: Ptr): Geo {
	return new Geo(ptr);
}

/** As wrapGeo, answering null for a null pointer. */
export function wrapGeoOrNull(ptr: Ptr): Geo | null {
	return ptr ? wrapGeo(ptr) : null;
}

/** The value at `ptr` as the JsonPath class its runtime type names. */
export function wrapJsonPath(ptr: Ptr): JsonPath {
	return new JsonPath(ptr);
}

/** As wrapJsonPath, answering null for a null pointer. */
export function wrapJsonPathOrNull(ptr: Ptr): JsonPath | null {
	return ptr ? wrapJsonPath(ptr) : null;
}

/** The value at `ptr` as the Jsonb class its runtime type names. */
export function wrapJsonb(ptr: Ptr): Jsonb {
	return new Jsonb(ptr);
}

/** As wrapJsonb, answering null for a null pointer. */
export function wrapJsonbOrNull(ptr: Ptr): Jsonb | null {
	return ptr ? wrapJsonb(ptr) : null;
}

/** The value at `ptr` as the MeosArray class its runtime type names. */
export function wrapMeosArray(ptr: Ptr): MeosArray {
	return new MeosArray(ptr);
}

/** As wrapMeosArray, answering null for a null pointer. */
export function wrapMeosArrayOrNull(ptr: Ptr): MeosArray | null {
	return ptr ? wrapMeosArray(ptr) : null;
}

/** The value at `ptr` as the Npoint class its runtime type names. */
export function wrapNpoint(ptr: Ptr): Npoint {
	return new Npoint(ptr);
}

/** As wrapNpoint, answering null for a null pointer. */
export function wrapNpointOrNull(ptr: Ptr): Npoint | null {
	return ptr ? wrapNpoint(ptr) : null;
}

/** The value at `ptr` as the Nsegment class its runtime type names. */
export function wrapNsegment(ptr: Ptr): Nsegment {
	return new Nsegment(ptr);
}

/** As wrapNsegment, answering null for a null pointer. */
export function wrapNsegmentOrNull(ptr: Ptr): Nsegment | null {
	return ptr ? wrapNsegment(ptr) : null;
}

/** The value at `ptr` as the Pcpatch class its runtime type names. */
export function wrapPcpatch(ptr: Ptr): Pcpatch {
	return new Pcpatch(ptr);
}

/** As wrapPcpatch, answering null for a null pointer. */
export function wrapPcpatchOrNull(ptr: Ptr): Pcpatch | null {
	return ptr ? wrapPcpatch(ptr) : null;
}

/** The value at `ptr` as the Pcpoint class its runtime type names. */
export function wrapPcpoint(ptr: Ptr): Pcpoint {
	return new Pcpoint(ptr);
}

/** As wrapPcpoint, answering null for a null pointer. */
export function wrapPcpointOrNull(ptr: Ptr): Pcpoint | null {
	return ptr ? wrapPcpoint(ptr) : null;
}

/** The value at `ptr` as the Pcschema class its runtime type names. */
export function wrapPcschema(ptr: Ptr): Pcschema {
	return new Pcschema(ptr);
}

/** As wrapPcschema, answering null for a null pointer. */
export function wrapPcschemaOrNull(ptr: Ptr): Pcschema | null {
	return ptr ? wrapPcschema(ptr) : null;
}

/** The value at `ptr` as the Pose class its runtime type names. */
export function wrapPose(ptr: Ptr): Pose {
	return new Pose(ptr);
}

/** As wrapPose, answering null for a null pointer. */
export function wrapPoseOrNull(ptr: Ptr): Pose | null {
	return ptr ? wrapPose(ptr) : null;
}

/** The value at `ptr` as the PoseChain class its runtime type names. */
export function wrapPoseChain(ptr: Ptr): PoseChain {
	return new PoseChain(ptr);
}

/** As wrapPoseChain, answering null for a null pointer. */
export function wrapPoseChainOrNull(ptr: Ptr): PoseChain | null {
	return ptr ? wrapPoseChain(ptr) : null;
}

/** The value at `ptr` as the RTree class its runtime type names. */
export function wrapRTree(ptr: Ptr): RTree {
	return new RTree(ptr);
}

/** As wrapRTree, answering null for a null pointer. */
export function wrapRTreeOrNull(ptr: Ptr): RTree | null {
	return ptr ? wrapRTree(ptr) : null;
}

/** The value at `ptr` as the RTreeNNCursor class its runtime type names. */
export function wrapRTreeNNCursor(ptr: Ptr): RTreeNNCursor {
	return new RTreeNNCursor(ptr);
}

/** As wrapRTreeNNCursor, answering null for a null pointer. */
export function wrapRTreeNNCursorOrNull(ptr: Ptr): RTreeNNCursor | null {
	return ptr ? wrapRTreeNNCursor(ptr) : null;
}

/** The value at `ptr` as the Raquet class its runtime type names. */
export function wrapRaquet(ptr: Ptr): Raquet {
	return new Raquet(ptr);
}

/** As wrapRaquet, answering null for a null pointer. */
export function wrapRaquetOrNull(ptr: Ptr): Raquet | null {
	return ptr ? wrapRaquet(ptr) : null;
}

/** The value at `ptr` as the Raster class its runtime type names. */
export function wrapRaster(ptr: Ptr): Raster {
	return new Raster(ptr);
}

/** As wrapRaster, answering null for a null pointer. */
export function wrapRasterOrNull(ptr: Ptr): Raster | null {
	return ptr ? wrapRaster(ptr) : null;
}

/** The value at `ptr` as the SPNNCursor class its runtime type names. */
export function wrapSPNNCursor(ptr: Ptr): SPNNCursor {
	return new SPNNCursor(ptr);
}

/** As wrapSPNNCursor, answering null for a null pointer. */
export function wrapSPNNCursorOrNull(ptr: Ptr): SPNNCursor | null {
	return ptr ? wrapSPNNCursor(ptr) : null;
}

/** The value at `ptr` as the SPTree class its runtime type names. */
export function wrapSPTree(ptr: Ptr): SPTree {
	return new SPTree(ptr);
}

/** As wrapSPTree, answering null for a null pointer. */
export function wrapSPTreeOrNull(ptr: Ptr): SPTree | null {
	return ptr ? wrapSPTree(ptr) : null;
}

/** The value at `ptr` as the STBox class its runtime type names. */
export function wrapSTBox(ptr: Ptr): STBox {
	return new STBox(ptr);
}

/** As wrapSTBox, answering null for a null pointer. */
export function wrapSTBoxOrNull(ptr: Ptr): STBox | null {
	return ptr ? wrapSTBox(ptr) : null;
}

/** The value at `ptr` as the Set class its runtime type names. */
export function wrapSet(ptr: Ptr): Set {
	// Set.settype, at byte 4
	switch (_byte(ptr, 4)) {
		case 5: return new DateSet(ptr); // T_DATESET
		case 12: return new FloatSet(ptr); // T_FLOATSET
		case 18: return new IntSet(ptr); // T_INTSET
		case 22: return new BigIntSet(ptr); // T_BIGINTSET
		case 32: return new TextSet(ptr); // T_TEXTSET
		case 38: return new TsTzSet(ptr); // T_TSTZSET
		case 43: return new GeomSet(ptr); // T_GEOMSET
		case 45: return new GeogSet(ptr); // T_GEOGSET
		case 49: return new NpointSet(ptr); // T_NPOINTSET
		case 55: return new PoseSet(ptr); // T_POSESET
		case 58: return new CbufferSet(ptr); // T_CBUFFERSET
		case 65: return new JsonbSet(ptr); // T_JSONBSET
		case 69: return new H3IndexSet(ptr); // T_H3INDEXSET
		case 72: return new QuadbinSet(ptr); // T_QUADBINSET
		case 75: return new PcpointSet(ptr); // T_PCPOINTSET
		case 78: return new PcpatchSet(ptr); // T_PCPATCHSET
		case 83: return new PoseChainSet(ptr); // T_POSECHAINSET
		case 86: return new S2CellSet(ptr); // T_S2CELLSET
		default: return new Set(ptr);
	}
}

/** As wrapSet, answering null for a null pointer. */
export function wrapSetOrNull(ptr: Ptr): Set | null {
	return ptr ? wrapSet(ptr) : null;
}

/** The value at `ptr` as the Span class its runtime type names. */
export function wrapSpan(ptr: Ptr): Span {
	// Span.spantype, at byte 0
	switch (_byte(ptr, 0)) {
		case 6: return new DateSpan(ptr); // T_DATESPAN
		case 13: return new FloatSpan(ptr); // T_FLOATSPAN
		case 19: return new IntSpan(ptr); // T_INTSPAN
		case 23: return new BigIntSpan(ptr); // T_BIGINTSPAN
		case 39: return new TsTzSpan(ptr); // T_TSTZSPAN
		default: return new Span(ptr);
	}
}

/** As wrapSpan, answering null for a null pointer. */
export function wrapSpanOrNull(ptr: Ptr): Span | null {
	return ptr ? wrapSpan(ptr) : null;
}

/** The value at `ptr` as the SpanSet class its runtime type names. */
export function wrapSpanSet(ptr: Ptr): SpanSet {
	// SpanSet.spansettype, at byte 4
	switch (_byte(ptr, 4)) {
		case 7: return new DateSpanSet(ptr); // T_DATESPANSET
		case 14: return new FloatSpanSet(ptr); // T_FLOATSPANSET
		case 20: return new IntSpanSet(ptr); // T_INTSPANSET
		case 24: return new BigIntSpanSet(ptr); // T_BIGINTSPANSET
		case 40: return new TsTzSpanSet(ptr); // T_TSTZSPANSET
		default: return new SpanSet(ptr);
	}
}

/** As wrapSpanSet, answering null for a null pointer. */
export function wrapSpanSetOrNull(ptr: Ptr): SpanSet | null {
	return ptr ? wrapSpanSet(ptr) : null;
}

/** The value at `ptr` as the TBox class its runtime type names. */
export function wrapTBox(ptr: Ptr): TBox {
	return new TBox(ptr);
}

/** As wrapTBox, answering null for a null pointer. */
export function wrapTBoxOrNull(ptr: Ptr): TBox | null {
	return ptr ? wrapTBox(ptr) : null;
}

/** The value at `ptr` as the TPCBox class its runtime type names. */
export function wrapTPCBox(ptr: Ptr): TPCBox {
	return new TPCBox(ptr);
}

/** As wrapTPCBox, answering null for a null pointer. */
export function wrapTPCBoxOrNull(ptr: Ptr): TPCBox | null {
	return ptr ? wrapTPCBox(ptr) : null;
}

/** The value at `ptr` as the Temporal class its runtime type names. */
export function wrapTemporal(ptr: Ptr): Temporal {
	// Temporal.temptype, at byte 4
	switch (_byte(ptr, 4)) {
		case 26: return wrapTBoolSubtype(ptr); // T_TBOOL
		case 33: return wrapTFloatSubtype(ptr); // T_TFLOAT
		case 35: return wrapTIntSubtype(ptr); // T_TINT
		case 41: return wrapTTextSubtype(ptr); // T_TTEXT
		case 46: return wrapTGeomPointSubtype(ptr); // T_TGEOMPOINT
		case 47: return wrapTGeogPointSubtype(ptr); // T_TGEOGPOINT
		case 51: return wrapTNpointSubtype(ptr); // T_TNPOINT
		case 56: return wrapTPoseSubtype(ptr); // T_TPOSE
		case 59: return wrapTCbufferSubtype(ptr); // T_TCBUFFER
		case 60: return wrapTGeometrySubtype(ptr); // T_TGEOMETRY
		case 61: return wrapTGeographySubtype(ptr); // T_TGEOGRAPHY
		case 62: return wrapTRGeometrySubtype(ptr); // T_TRGEOMETRY
		case 66: return wrapTJsonbSubtype(ptr); // T_TJSONB
		case 67: return wrapTBigintSubtype(ptr); // T_TBIGINT
		case 70: return wrapTH3IndexSubtype(ptr); // T_TH3INDEX
		case 73: return wrapTQuadbinSubtype(ptr); // T_TQUADBIN
		case 76: return wrapTPcpointSubtype(ptr); // T_TPCPOINT
		case 79: return wrapTPcpatchSubtype(ptr); // T_TPCPATCH
		case 84: return wrapTPoseChainSubtype(ptr); // T_TPOSECHAIN
		case 87: return wrapTS2CellSubtype(ptr); // T_TS2CELL
		default: return new Temporal(ptr);
	}
}

/** As wrapTemporal, answering null for a null pointer. */
export function wrapTemporalOrNull(ptr: Ptr): Temporal | null {
	return ptr ? wrapTemporal(ptr) : null;
}

/** The value at `ptr` as the Text class its runtime type names. */
export function wrapText(ptr: Ptr): Text {
	return new Text(ptr);
}

/** As wrapText, answering null for a null pointer. */
export function wrapTextOrNull(ptr: Ptr): Text | null {
	return ptr ? wrapText(ptr) : null;
}

function wrapTBigintSubtype(ptr: Ptr): TBigint {
	switch (_byte(ptr, 5)) {
		case 1: return new TBigintInst(ptr);
		case 2: return new TBigintSeq(ptr);
		case 3: return new TBigintSeqSet(ptr);
		default: return new TBigint(ptr);
	}
}

function wrapTBoolSubtype(ptr: Ptr): TBool {
	switch (_byte(ptr, 5)) {
		case 1: return new TBoolInst(ptr);
		case 2: return new TBoolSeq(ptr);
		case 3: return new TBoolSeqSet(ptr);
		default: return new TBool(ptr);
	}
}

function wrapTCbufferSubtype(ptr: Ptr): TCbuffer {
	switch (_byte(ptr, 5)) {
		case 1: return new TCbufferInst(ptr);
		case 2: return new TCbufferSeq(ptr);
		case 3: return new TCbufferSeqSet(ptr);
		default: return new TCbuffer(ptr);
	}
}

function wrapTFloatSubtype(ptr: Ptr): TFloat {
	switch (_byte(ptr, 5)) {
		case 1: return new TFloatInst(ptr);
		case 2: return new TFloatSeq(ptr);
		case 3: return new TFloatSeqSet(ptr);
		default: return new TFloat(ptr);
	}
}

function wrapTGeogPointSubtype(ptr: Ptr): TGeogPoint {
	switch (_byte(ptr, 5)) {
		case 1: return new TGeogPointInst(ptr);
		case 2: return new TGeogPointSeq(ptr);
		case 3: return new TGeogPointSeqSet(ptr);
		default: return new TGeogPoint(ptr);
	}
}

function wrapTGeographySubtype(ptr: Ptr): TGeography {
	switch (_byte(ptr, 5)) {
		case 1: return new TGeographyInst(ptr);
		case 2: return new TGeographySeq(ptr);
		case 3: return new TGeographySeqSet(ptr);
		default: return new TGeography(ptr);
	}
}

function wrapTGeomPointSubtype(ptr: Ptr): TGeomPoint {
	switch (_byte(ptr, 5)) {
		case 1: return new TGeomPointInst(ptr);
		case 2: return new TGeomPointSeq(ptr);
		case 3: return new TGeomPointSeqSet(ptr);
		default: return new TGeomPoint(ptr);
	}
}

function wrapTGeometrySubtype(ptr: Ptr): TGeometry {
	switch (_byte(ptr, 5)) {
		case 1: return new TGeometryInst(ptr);
		case 2: return new TGeometrySeq(ptr);
		case 3: return new TGeometrySeqSet(ptr);
		default: return new TGeometry(ptr);
	}
}

function wrapTH3IndexSubtype(ptr: Ptr): TH3Index {
	switch (_byte(ptr, 5)) {
		case 1: return new TH3IndexInst(ptr);
		case 2: return new TH3IndexSeq(ptr);
		case 3: return new TH3IndexSeqSet(ptr);
		default: return new TH3Index(ptr);
	}
}

function wrapTIntSubtype(ptr: Ptr): TInt {
	switch (_byte(ptr, 5)) {
		case 1: return new TIntInst(ptr);
		case 2: return new TIntSeq(ptr);
		case 3: return new TIntSeqSet(ptr);
		default: return new TInt(ptr);
	}
}

function wrapTJsonbSubtype(ptr: Ptr): TJsonb {
	switch (_byte(ptr, 5)) {
		case 1: return new TJsonbInst(ptr);
		case 2: return new TJsonbSeq(ptr);
		case 3: return new TJsonbSeqSet(ptr);
		default: return new TJsonb(ptr);
	}
}

function wrapTNpointSubtype(ptr: Ptr): TNpoint {
	switch (_byte(ptr, 5)) {
		case 1: return new TNpointInst(ptr);
		case 2: return new TNpointSeq(ptr);
		case 3: return new TNpointSeqSet(ptr);
		default: return new TNpoint(ptr);
	}
}

function wrapTPcpatchSubtype(ptr: Ptr): TPcpatch {
	switch (_byte(ptr, 5)) {
		case 1: return new TPcpatchInst(ptr);
		case 2: return new TPcpatchSeq(ptr);
		case 3: return new TPcpatchSeqSet(ptr);
		default: return new TPcpatch(ptr);
	}
}

function wrapTPcpointSubtype(ptr: Ptr): TPcpoint {
	switch (_byte(ptr, 5)) {
		case 1: return new TPcpointInst(ptr);
		case 2: return new TPcpointSeq(ptr);
		case 3: return new TPcpointSeqSet(ptr);
		default: return new TPcpoint(ptr);
	}
}

function wrapTPoseSubtype(ptr: Ptr): TPose {
	switch (_byte(ptr, 5)) {
		case 1: return new TPoseInst(ptr);
		case 2: return new TPoseSeq(ptr);
		case 3: return new TPoseSeqSet(ptr);
		default: return new TPose(ptr);
	}
}

function wrapTPoseChainSubtype(ptr: Ptr): TPoseChain {
	switch (_byte(ptr, 5)) {
		case 1: return new TPoseChainInst(ptr);
		case 2: return new TPoseChainSeq(ptr);
		case 3: return new TPoseChainSeqSet(ptr);
		default: return new TPoseChain(ptr);
	}
}

function wrapTQuadbinSubtype(ptr: Ptr): TQuadbin {
	switch (_byte(ptr, 5)) {
		case 1: return new TQuadbinInst(ptr);
		case 2: return new TQuadbinSeq(ptr);
		case 3: return new TQuadbinSeqSet(ptr);
		default: return new TQuadbin(ptr);
	}
}

function wrapTRGeometrySubtype(ptr: Ptr): TRGeometry {
	switch (_byte(ptr, 5)) {
		case 1: return new TRGeometryInst(ptr);
		case 2: return new TRGeometrySeq(ptr);
		case 3: return new TRGeometrySeqSet(ptr);
		default: return new TRGeometry(ptr);
	}
}

function wrapTS2CellSubtype(ptr: Ptr): TS2Cell {
	switch (_byte(ptr, 5)) {
		case 1: return new TS2CellInst(ptr);
		case 2: return new TS2CellSeq(ptr);
		case 3: return new TS2CellSeqSet(ptr);
		default: return new TS2Cell(ptr);
	}
}

function wrapTTextSubtype(ptr: Ptr): TText {
	switch (_byte(ptr, 5)) {
		case 1: return new TTextInst(ptr);
		case 2: return new TTextSeq(ptr);
		case 3: return new TTextSeqSet(ptr);
		default: return new TText(ptr);
	}
}
