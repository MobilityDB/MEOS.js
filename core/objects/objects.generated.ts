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

	/** MEOS: set_le */
	le(s2: Set): boolean {
		return F.set_le(this.ptr, s2.ptr);
	}

	/** MEOS: set_lt */
	lt(s2: Set): boolean {
		return F.set_lt(this.ptr, s2.ptr);
	}

	/** MEOS: set_mem_size */
	memSize(): number {
		return F.set_mem_size(this.ptr);
	}

	/** MEOS: set_ne */
	ne(s2: Set): boolean {
		return F.set_ne(this.ptr, s2.ptr);
	}

	/** MEOS: set_num_values */
	numValues(): number {
		return F.set_num_values(this.ptr);
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

	/** MEOS: set_from_hexwkb */
	static fromHexWKB(hexwkb: string): Set {
		return wrapSet(F.set_from_hexwkb(hexwkb)) as Set;
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

	/** MEOS: bigintset_out */
	asText(): string {
		return this.out();
	}

	/** MEOS: bigintset_end_value */
	endValue(): number {
		return F.bigintset_end_value(this.ptr);
	}

	/** MEOS: bigintset_out */
	out(): string {
		return F.bigintset_out(this.ptr);
	}

	/** MEOS: bigintset_shift_scale */
	shiftScale(shift: number, width: number, hasshift: boolean, haswidth: boolean): Set {
		return wrapSet(F.bigintset_shift_scale(this.ptr, shift, width, hasshift, haswidth)) as Set;
	}

	/** MEOS: bigintset_start_value */
	startValue(): number {
		return F.bigintset_start_value(this.ptr);
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
}

/**
 * Contiguous range over an ordered base type.
 */
export class Span extends Collection {

	/** MEOS: span_as_wkb */
	asWKB(variant: number): Uint8Array {
		return readWkb(_sizeOut => F.span_as_wkb(this.ptr, variant, _sizeOut));
	}

	/** MEOS: span_cmp */
	cmp(s2: Span): number {
		return F.span_cmp(this.ptr, s2.ptr);
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

	/** MEOS: span_le */
	le(s2: Span): boolean {
		return F.span_le(this.ptr, s2.ptr);
	}

	/** MEOS: span_lower_inc */
	lowerInc(): boolean {
		return F.span_lower_inc(this.ptr);
	}

	/** MEOS: span_lt */
	lt(s2: Span): boolean {
		return F.span_lt(this.ptr, s2.ptr);
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

	/** MEOS: span_upper_inc */
	upperInc(): boolean {
		return F.span_upper_inc(this.ptr);
	}

	/** MEOS: span_from_hexwkb */
	static fromHexWKB(hexwkb: string): Span {
		return wrapSpan(F.span_from_hexwkb(hexwkb)) as Span;
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

	/** MEOS: bigintspan_expand */
	expand(value: number): Span | null {
		return wrapSpanOrNull(F.bigintspan_expand(this.ptr, value)) as Span | null;
	}

	/** MEOS: bigintspan_lower */
	lower(): number {
		return F.bigintspan_lower(this.ptr);
	}

	/** MEOS: bigintspan_out */
	out(): string {
		return F.bigintspan_out(this.ptr);
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

	/** MEOS: spanset_as_wkb */
	asWKB(variant: number): Uint8Array {
		return readWkb(_sizeOut => F.spanset_as_wkb(this.ptr, variant, _sizeOut));
	}

	/** MEOS: spanset_cmp */
	cmp(ss2: SpanSet): number {
		return F.spanset_cmp(this.ptr, ss2.ptr);
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

	/** MEOS: spanset_le */
	le(ss2: SpanSet): boolean {
		return F.spanset_le(this.ptr, ss2.ptr);
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

	/** MEOS: spanset_ne */
	ne(ss2: SpanSet): boolean {
		return F.spanset_ne(this.ptr, ss2.ptr);
	}

	/** MEOS: spanset_num_spans */
	numSpans(): number {
		return F.spanset_num_spans(this.ptr);
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

	/** MEOS: spanset_upper_inc */
	upperInc(): boolean {
		return F.spanset_upper_inc(this.ptr);
	}

	/** MEOS: spanset_from_hexwkb */
	static fromHexWKB(hexwkb: string): SpanSet {
		return wrapSpanSet(F.spanset_from_hexwkb(hexwkb)) as SpanSet;
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

	/** MEOS: bigintspanset_lower */
	lower(): number {
		return F.bigintspanset_lower(this.ptr);
	}

	/** MEOS: bigintspanset_out */
	out(): string {
		return F.bigintspanset_out(this.ptr);
	}

	/** MEOS: bigintspanset_shift_scale */
	shiftScale(shift: number, width: number, hasshift: boolean, haswidth: boolean): SpanSet {
		return wrapSpanSet(F.bigintspanset_shift_scale(this.ptr, shift, width, hasshift, haswidth)) as SpanSet;
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

	/** MEOS: cbuffer_cmp */
	cmp(cb2: Cbuffer): number {
		return F.cbuffer_cmp(this.ptr, cb2.ptr);
	}

	/** MEOS: cbuffer_copy */
	copy(): Cbuffer {
		return wrapCbuffer(F.cbuffer_copy(this.ptr)) as Cbuffer;
	}

	/** MEOS: cbuffer_eq */
	eq(cb2: Cbuffer): boolean {
		return F.cbuffer_eq(this.ptr, cb2.ptr);
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

	/** MEOS: cbuffer_timestamptz_to_stbox */
	timestamptzToStbox(t: TimestampTz): STBox {
		return wrapSTBox(F.cbuffer_timestamptz_to_stbox(this.ptr, t)) as STBox;
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

	/** MEOS: cbufferset_end_value */
	endValue(): Cbuffer {
		return wrapCbuffer(F.cbufferset_end_value(this.ptr)) as Cbuffer;
	}

	/** MEOS: cbufferset_out */
	override out(maxdd: number): string {
		return F.cbufferset_out(this.ptr, maxdd);
	}

	/** MEOS: cbufferset_start_value */
	startValue(): Cbuffer {
		return wrapCbuffer(F.cbufferset_start_value(this.ptr)) as Cbuffer;
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

	/** MEOS: dateset_out */
	asText(): string {
		return this.out();
	}

	/** MEOS: dateset_end_value */
	endValue(): DateADT {
		return F.dateset_end_value(this.ptr);
	}

	/** MEOS: dateset_out */
	out(): string {
		return F.dateset_out(this.ptr);
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
}

/**
 * The DateSpan class of the MEOS object model.
 */
export class DateSpan extends Span {

	/** The text MEOS writes this value as (MEOS: datespan_out). */
	override toString(): string {
		return this.out();
	}

	/** MEOS: datespan_out */
	asText(): string {
		return this.out();
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

	/** MEOS: datespan_duration */
	duration(): Interval {
		return _takeInterval(F.datespan_duration(this.ptr))!;
	}

	/** MEOS: datespan_lower */
	lower(): DateADT {
		return F.datespan_lower(this.ptr);
	}

	/** MEOS: datespan_out */
	out(): string {
		return F.datespan_out(this.ptr);
	}

	/** MEOS: datespan_shift_scale */
	shiftScale(shift: number, width: number, hasshift: boolean, haswidth: boolean): Span {
		return wrapSpan(F.datespan_shift_scale(this.ptr, shift, width, hasshift, haswidth)) as Span;
	}

	/** MEOS: datespan_to_tstzspan */
	toTstzspan(): Span {
		return wrapSpan(F.datespan_to_tstzspan(this.ptr)) as Span;
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

	/** MEOS: datespanset_out */
	asText(): string {
		return this.out();
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

	/** MEOS: datespanset_date_n */
	dateN(n: number): DateADT {
		return F.datespanset_date_n(this.ptr, n);
	}

	/** MEOS: datespanset_dates */
	dates(): Set {
		return wrapSet(F.datespanset_dates(this.ptr)) as Set;
	}

	/** MEOS: datespanset_duration */
	duration(boundspan: boolean): Interval {
		return _takeInterval(F.datespanset_duration(this.ptr, boundspan))!;
	}

	/** MEOS: datespanset_end_date */
	endDate(): DateADT {
		return F.datespanset_end_date(this.ptr);
	}

	/** MEOS: datespanset_lower */
	lower(): DateADT {
		return F.datespanset_lower(this.ptr);
	}

	/** MEOS: datespanset_num_dates */
	numDates(): number {
		return F.datespanset_num_dates(this.ptr);
	}

	/** MEOS: datespanset_out */
	out(): string {
		return F.datespanset_out(this.ptr);
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

	/** MEOS: floatset_out */
	asText(maxdd: number): string {
		return this.out(maxdd);
	}

	/** MEOS: floatset_ceil */
	ceil(): Set {
		return wrapSet(F.floatset_ceil(this.ptr)) as Set;
	}

	/** MEOS: floatset_degrees */
	degrees(normalize: boolean): Set {
		return wrapSet(F.floatset_degrees(this.ptr, normalize)) as Set;
	}

	/** MEOS: floatset_end_value */
	endValue(): number {
		return F.floatset_end_value(this.ptr);
	}

	/** MEOS: floatset_floor */
	floor(): Set {
		return wrapSet(F.floatset_floor(this.ptr)) as Set;
	}

	/** MEOS: floatset_out */
	out(maxdd: number): string {
		return F.floatset_out(this.ptr, maxdd);
	}

	/** MEOS: floatset_radians */
	radians(): Set {
		return wrapSet(F.floatset_radians(this.ptr)) as Set;
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
}

/**
 * The FloatSpan class of the MEOS object model.
 */
export class FloatSpan extends Span {

	/** The text MEOS writes this value as (MEOS: floatspan_out). */
	override toString(): string {
		return this.out(15);
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

	/** MEOS: floatspan_degrees */
	degrees(normalize: boolean): Span {
		return wrapSpan(F.floatspan_degrees(this.ptr, normalize)) as Span;
	}

	/** MEOS: floatspan_expand */
	expand(value: number): Span | null {
		return wrapSpanOrNull(F.floatspan_expand(this.ptr, value)) as Span | null;
	}

	/** MEOS: floatspan_floor */
	floor(): Span {
		return wrapSpan(F.floatspan_floor(this.ptr)) as Span;
	}

	/** MEOS: floatspan_lower */
	lower(): number {
		return F.floatspan_lower(this.ptr);
	}

	/** MEOS: floatspan_out */
	out(maxdd: number): string {
		return F.floatspan_out(this.ptr, maxdd);
	}

	/** MEOS: floatspan_radians */
	radians(): Span {
		return wrapSpan(F.floatspan_radians(this.ptr)) as Span;
	}

	/** MEOS: floatspan_round */
	round(maxdd: number): Span {
		return wrapSpan(F.floatspan_round(this.ptr, maxdd)) as Span;
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

	/** MEOS: floatspanset_degrees */
	degrees(normalize: boolean): SpanSet {
		return wrapSpanSet(F.floatspanset_degrees(this.ptr, normalize)) as SpanSet;
	}

	/** MEOS: floatspanset_floor */
	floor(): SpanSet {
		return wrapSpanSet(F.floatspanset_floor(this.ptr)) as SpanSet;
	}

	/** MEOS: floatspanset_lower */
	lower(): number {
		return F.floatspanset_lower(this.ptr);
	}

	/** MEOS: floatspanset_out */
	out(maxdd: number): string {
		return F.floatspanset_out(this.ptr, maxdd);
	}

	/** MEOS: floatspanset_radians */
	radians(): SpanSet {
		return wrapSpanSet(F.floatspanset_radians(this.ptr)) as SpanSet;
	}

	/** MEOS: floatspanset_round */
	round(maxdd: number): SpanSet {
		return wrapSpanSet(F.floatspanset_round(this.ptr, maxdd)) as SpanSet;
	}

	/** MEOS: floatspanset_shift_scale */
	shiftScale(shift: number, width: number, hasshift: boolean, haswidth: boolean): SpanSet {
		return wrapSpanSet(F.floatspanset_shift_scale(this.ptr, shift, width, hasshift, haswidth)) as SpanSet;
	}

	/** MEOS: floatspanset_to_intspanset */
	toIntspanset(): SpanSet {
		return wrapSpanSet(F.floatspanset_to_intspanset(this.ptr)) as SpanSet;
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

	/** MEOS: geo_affine */
	affine(a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, xoff: number, yoff: number, zoff: number): Geo {
		return wrapGeo(F.geo_affine(this.ptr, a, b, c, d, e, f, g, h, i, xoff, yoff, zoff)) as Geo;
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

	/** MEOS: geo_copy */
	copy(): Geo {
		return wrapGeo(F.geo_copy(this.ptr)) as Geo;
	}

	/** MEOS: geo_distance */
	distance(gs2: Geo, spheroid: boolean): number {
		return F.geo_distance(this.ptr, gs2.ptr, spheroid);
	}

	/** MEOS: geo_equals */
	equals(gs2: Geo): number {
		return F.geo_equals(this.ptr, gs2.ptr);
	}

	/** MEOS: geo_geo_n */
	geoN(n: number): Geo | null {
		return wrapGeoOrNull(F.geo_geo_n(this.ptr, n)) as Geo | null;
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

	/** MEOS: geo_timestamptz_to_stbox */
	timestamptzToStbox(t: TimestampTz): STBox | null {
		return wrapSTBoxOrNull(F.geo_timestamptz_to_stbox(this.ptr, t)) as STBox | null;
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

	/** MEOS: geoset_end_value */
	endValue(): Geo {
		return wrapGeo(F.geoset_end_value(this.ptr)) as Geo;
	}

	/** MEOS: geoset_start_value */
	startValue(): Geo {
		return wrapGeo(F.geoset_start_value(this.ptr)) as Geo;
	}

	/** MEOS: geoset_to_geo */
	toGeo(): Geo {
		return wrapGeo(F.geoset_to_geo(this.ptr)) as Geo;
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

	/** MEOS: geom_area */
	override area(): number {
		return F.geom_area(this.ptr);
	}

	/** MEOS: geo_as_geojson */
	asMFJSON(option: number, precision: number, srs: string): string {
		return this.asGeoJSON(option, precision, srs);
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

	/** MEOS: h3indexset_cover_cells */
	coverCells(resolution: number): Set | null {
		return wrapSetOrNull(F.h3indexset_cover_cells(this.ptr, resolution)) as Set | null;
	}

	/** MEOS: h3indexset_end_value */
	endValue(): H3Index {
		return F.h3indexset_end_value(this.ptr);
	}

	/** MEOS: h3indexset_grid_disk */
	gridDisk(k: number): Set | null {
		return wrapSetOrNull(F.h3indexset_grid_disk(this.ptr, k)) as Set | null;
	}

	/** MEOS: h3indexset_out */
	override out(): string {
		return F.h3indexset_out(this.ptr);
	}

	/** MEOS: h3indexset_start_value */
	startValue(): H3Index {
		return F.h3indexset_start_value(this.ptr);
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
}

/**
 * The IntSet class of the MEOS object model.
 */
export class IntSet extends Set {

	/** The text MEOS writes this value as (MEOS: intset_out). */
	override toString(): string {
		return this.out();
	}

	/** MEOS: intset_out */
	asText(): string {
		return this.out();
	}

	/** MEOS: intset_end_value */
	endValue(): number {
		return F.intset_end_value(this.ptr);
	}

	/** MEOS: intset_out */
	out(): string {
		return F.intset_out(this.ptr);
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
}

/**
 * The IntSpan class of the MEOS object model.
 */
export class IntSpan extends Span {

	/** The text MEOS writes this value as (MEOS: intspan_out). */
	override toString(): string {
		return this.out();
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

	/** MEOS: intspan_expand */
	expand(value: number): Span | null {
		return wrapSpanOrNull(F.intspan_expand(this.ptr, value)) as Span | null;
	}

	/** MEOS: intspan_lower */
	lower(): number {
		return F.intspan_lower(this.ptr);
	}

	/** MEOS: intspan_out */
	out(): string {
		return F.intspan_out(this.ptr);
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

	/** MEOS: intspanset_lower */
	lower(): number {
		return F.intspanset_lower(this.ptr);
	}

	/** MEOS: intspanset_out */
	out(): string {
		return F.intspanset_out(this.ptr);
	}

	/** MEOS: intspanset_shift_scale */
	shiftScale(shift: number, width: number, hasshift: boolean, haswidth: boolean): SpanSet {
		return wrapSpanSet(F.intspanset_shift_scale(this.ptr, shift, width, hasshift, haswidth)) as SpanSet;
	}

	/** MEOS: intspanset_to_floatspanset */
	toFloatspanset(): SpanSet {
		return wrapSpanSet(F.intspanset_to_floatspanset(this.ptr)) as SpanSet;
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

	/** MEOS: npoint_copy */
	copy(): Npoint {
		return wrapNpoint(F.npoint_copy(this.ptr)) as Npoint;
	}

	/** MEOS: npoint_eq */
	eq(np2: Npoint): boolean {
		return F.npoint_eq(this.ptr, np2.ptr);
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

	/** MEOS: npoint_le */
	le(np2: Npoint): boolean {
		return F.npoint_le(this.ptr, np2.ptr);
	}

	/** MEOS: npoint_lt */
	lt(np2: Npoint): boolean {
		return F.npoint_lt(this.ptr, np2.ptr);
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

	/** MEOS: npointset_end_value */
	endValue(): Npoint {
		return wrapNpoint(F.npointset_end_value(this.ptr)) as Npoint;
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

	/** MEOS: pcpatch_copy */
	copy(): Pcpatch {
		return wrapPcpatch(F.pcpatch_copy(this.ptr)) as Pcpatch;
	}

	/** MEOS: pcpatch_eq */
	eq(pa2: Pcpatch): boolean {
		return F.pcpatch_eq(this.ptr, pa2.ptr);
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
}

/**
 * The PcpatchSet class of the MEOS object model.
 */
export class PcpatchSet extends SpatialSet {

	/** The text MEOS writes this value as (MEOS: spatialset_as_text). */
	override toString(): string {
		return this.asText(15);
	}

	/** MEOS: pcpatchset_end_value */
	endValue(): Pcpatch {
		return wrapPcpatch(F.pcpatchset_end_value(this.ptr)) as Pcpatch;
	}

	/** MEOS: pcpatchset_out */
	override out(maxdd: number): string {
		return F.pcpatchset_out(this.ptr, maxdd);
	}

	/** MEOS: pcpatchset_start_value */
	startValue(): Pcpatch {
		return wrapPcpatch(F.pcpatchset_start_value(this.ptr)) as Pcpatch;
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

	/** MEOS: pcpoint_copy */
	copy(): Pcpoint {
		return wrapPcpoint(F.pcpoint_copy(this.ptr)) as Pcpoint;
	}

	/** MEOS: pcpoint_eq */
	eq(pt2: Pcpoint): boolean {
		return F.pcpoint_eq(this.ptr, pt2.ptr);
	}

	/** MEOS: pcpoint_ge */
	ge(pt2: Pcpoint): boolean {
		return F.pcpoint_ge(this.ptr, pt2.ptr);
	}

	/** MEOS: pcpoint_get_pcid */
	getPcid(): number {
		return F.pcpoint_get_pcid(this.ptr);
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

	/** MEOS: pcpoint_ne */
	ne(pt2: Pcpoint): boolean {
		return F.pcpoint_ne(this.ptr, pt2.ptr);
	}

	/** MEOS: pcpoint_to_set */
	toSet(): Set {
		return wrapSet(F.pcpoint_to_set(this.ptr)) as Set;
	}

	/** MEOS: pcpoint_to_tpcbox */
	toTpcbox(): TPCBox | null {
		return wrapTPCBoxOrNull(F.pcpoint_to_tpcbox(this.ptr)) as TPCBox | null;
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
}

/**
 * The PcpointSet class of the MEOS object model.
 */
export class PcpointSet extends SpatialSet {

	/** The text MEOS writes this value as (MEOS: spatialset_as_text). */
	override toString(): string {
		return this.asText(15);
	}

	/** MEOS: pcpointset_end_value */
	endValue(): Pcpoint {
		return wrapPcpoint(F.pcpointset_end_value(this.ptr)) as Pcpoint;
	}

	/** MEOS: pcpointset_out */
	override out(maxdd: number): string {
		return F.pcpointset_out(this.ptr, maxdd);
	}

	/** MEOS: pcpointset_start_value */
	startValue(): Pcpoint {
		return wrapPcpoint(F.pcpointset_start_value(this.ptr)) as Pcpoint;
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

	/** MEOS: pose_copy */
	copy(): Pose {
		return wrapPose(F.pose_copy(this.ptr)) as Pose;
	}

	/** MEOS: pose_eq */
	eq(pose2: Pose): boolean {
		return F.pose_eq(this.ptr, pose2.ptr);
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

	/** MEOS: pose_timestamptz_to_stbox */
	timestamptzToStbox(t: TimestampTz): STBox {
		return wrapSTBox(F.pose_timestamptz_to_stbox(this.ptr, t)) as STBox;
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

	/** MEOS: posechain_copy */
	copy(): PoseChain {
		return wrapPoseChain(F.posechain_copy(this.ptr)) as PoseChain;
	}

	/** MEOS: posechain_end_pose */
	endPose(): Pose {
		return wrapPose(F.posechain_end_pose(this.ptr)) as Pose;
	}

	/** MEOS: posechain_eq */
	eq(pc2: PoseChain): boolean {
		return F.posechain_eq(this.ptr, pc2.ptr);
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

	/** MEOS: posechain_timestamptz_to_stbox */
	timestamptzToStbox(t: TimestampTz): STBox {
		return wrapSTBox(F.posechain_timestamptz_to_stbox(this.ptr, t)) as STBox;
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

	/** MEOS: posechainset_end_value */
	endValue(): PoseChain {
		return wrapPoseChain(F.posechainset_end_value(this.ptr)) as PoseChain;
	}

	/** MEOS: posechainset_out */
	override out(maxdd: number): string {
		return F.posechainset_out(this.ptr, maxdd);
	}

	/** MEOS: posechainset_start_value */
	startValue(): PoseChain {
		return wrapPoseChain(F.posechainset_start_value(this.ptr)) as PoseChain;
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

	/** MEOS: poseset_end_value */
	endValue(): Pose {
		return wrapPose(F.poseset_end_value(this.ptr)) as Pose;
	}

	/** MEOS: poseset_out */
	override out(maxdd: number): string {
		return F.poseset_out(this.ptr, maxdd);
	}

	/** MEOS: poseset_start_value */
	startValue(): Pose {
		return wrapPose(F.poseset_start_value(this.ptr)) as Pose;
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

	/** MEOS: quadbinset_compact_cells */
	compactCells(): Set | null {
		return wrapSetOrNull(F.quadbinset_compact_cells(this.ptr)) as Set | null;
	}

	/** MEOS: quadbinset_cover_cells */
	coverCells(resolution: number): Set | null {
		return wrapSetOrNull(F.quadbinset_cover_cells(this.ptr, resolution)) as Set | null;
	}

	/** MEOS: quadbinset_end_value */
	endValue(): Quadbin {
		return F.quadbinset_end_value(this.ptr);
	}

	/** MEOS: quadbinset_grid_disk */
	gridDisk(k: number): Set | null {
		return wrapSetOrNull(F.quadbinset_grid_disk(this.ptr, k)) as Set | null;
	}

	/** MEOS: quadbinset_out */
	override out(): string {
		return F.quadbinset_out(this.ptr);
	}

	/** MEOS: quadbinset_start_value */
	startValue(): Quadbin {
		return F.quadbinset_start_value(this.ptr);
	}

	/** MEOS: quadbinset_uncompact_cells */
	uncompactCells(resolution: number): Set | null {
		return wrapSetOrNull(F.quadbinset_uncompact_cells(this.ptr, resolution)) as Set | null;
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

	/** MEOS: raquet_in */
	static in(str: string): Raquet {
		return wrapRaquet(F.raquet_in(str)) as Raquet;
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
}

/**
 * A georeferenced raster of one or more bands, the value every raster accessor, clip, warp and polygonization takes. MEOS registers it in no enum, so it names no temptype.
 */
export class Raster extends Value {

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

	/** MEOS: raster_copy */
	copy(): Raster {
		return wrapRaster(F.raster_copy(this.ptr)) as Raster;
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

	/** MEOS: raster_not_same_alignment_reason */
	notSameAlignmentReason(rast2: Raster): string {
		return F.raster_not_same_alignment_reason(this.ptr, rast2.ptr);
	}

	/** MEOS: raster_num_bands */
	numBands(): number {
		return F.raster_num_bands(this.ptr);
	}

	/** MEOS: raster_reclass */
	reclass(band: number, expr: string, pixeltype: string, has_nodata: boolean, nodataval: number): Raster | null {
		return wrapRasterOrNull(F.raster_reclass(this.ptr, band, expr, pixeltype, has_nodata, nodataval)) as Raster | null;
	}

	/** MEOS: raster_rescale */
	rescale(scale_x: number, scale_y: number, algorithm: string, max_err: number): Raster | null {
		return wrapRasterOrNull(F.raster_rescale(this.ptr, scale_x, scale_y, algorithm, max_err)) as Raster | null;
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

	/** MEOS: s2cellset_compact_cells */
	compactCells(): Set | null {
		return wrapSetOrNull(F.s2cellset_compact_cells(this.ptr)) as Set | null;
	}

	/** MEOS: s2cellset_cover_cells */
	coverCells(resolution: number): Set | null {
		return wrapSetOrNull(F.s2cellset_cover_cells(this.ptr, resolution)) as Set | null;
	}

	/** MEOS: s2cellset_end_value */
	endValue(): S2CellId {
		return F.s2cellset_end_value(this.ptr);
	}

	/** MEOS: s2cellset_out */
	override out(): string {
		return F.s2cellset_out(this.ptr);
	}

	/** MEOS: s2cellset_start_value */
	startValue(): S2CellId {
		return F.s2cellset_start_value(this.ptr);
	}

	/** MEOS: s2cellset_uncompact_cells */
	uncompactCells(resolution: number): Set | null {
		return wrapSetOrNull(F.s2cellset_uncompact_cells(this.ptr, resolution)) as Set | null;
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

	/** MEOS: stbox_cmp */
	cmp(box2: STBox): number {
		return F.stbox_cmp(this.ptr, box2.ptr);
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

	/** MEOS: stbox_isgeodetic */
	isgeodetic(): boolean {
		return F.stbox_isgeodetic(this.ptr);
	}

	/** MEOS: stbox_le */
	le(box2: STBox): boolean {
		return F.stbox_le(this.ptr, box2.ptr);
	}

	/** MEOS: stbox_lt */
	lt(box2: STBox): boolean {
		return F.stbox_lt(this.ptr, box2.ptr);
	}

	/** MEOS: stbox_ne */
	ne(box2: STBox): boolean {
		return F.stbox_ne(this.ptr, box2.ptr);
	}

	/** MEOS: stbox_out */
	out(maxdd: number): string {
		return F.stbox_out(this.ptr, maxdd);
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

	/** MEOS: stbox_round */
	round(maxdd: number): STBox {
		return wrapSTBox(F.stbox_round(this.ptr, maxdd)) as STBox;
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

	/** MEOS: temporal_after_timestamptz */
	afterTimestamptz(t: TimestampTz, strict: boolean): Temporal | null {
		return wrapTemporalOrNull(F.temporal_after_timestamptz(this.ptr, t, strict)) as Temporal | null;
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

	/** MEOS: temporal_before_timestamptz */
	beforeTimestamptz(t: TimestampTz, strict: boolean): Temporal | null {
		return wrapTemporalOrNull(F.temporal_before_timestamptz(this.ptr, t, strict)) as Temporal | null;
	}

	/** MEOS: temporal_cmp */
	cmp(temp2: Temporal): number {
		return F.temporal_cmp(this.ptr, temp2.ptr);
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

	/** MEOS: temporal_round */
	round(maxdd: number): Temporal {
		return wrapTemporal(F.temporal_round(this.ptr, maxdd)) as Temporal;
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
}

/**
 * Temporal numbers; supports linear interpolation.
 */
export class TNumber extends Temporal {

	/** MEOS: tnumber_abs */
	abs(): Temporal {
		return wrapTemporal(F.tnumber_abs(this.ptr)) as Temporal;
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

	/** MEOS: tnumber_delta_value */
	deltaValue(): Temporal | null {
		return wrapTemporalOrNull(F.tnumber_delta_value(this.ptr)) as Temporal | null;
	}

	/** MEOS: tnumber_integral */
	integral(): number {
		return F.tnumber_integral(this.ptr);
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

	/** MEOS: tbigint_out */
	asText(): string {
		return this.out();
	}

	/** MEOS: tbigint_at_value */
	atValue(i: number): Temporal | null {
		return wrapTemporalOrNull(F.tbigint_at_value(this.ptr, i)) as Temporal | null;
	}

	/** MEOS: tbigint_end_value */
	endValue(): number {
		return F.tbigint_end_value(this.ptr);
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

	/** MEOS: tbigint_out */
	out(): string {
		return F.tbigint_out(this.ptr);
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

	/** MEOS: tbool_minus_value */
	minusValue(b: boolean): Temporal | null {
		return wrapTemporalOrNull(F.tbool_minus_value(this.ptr, b)) as Temporal | null;
	}

	/** MEOS: tbool_out */
	out(): string {
		return F.tbool_out(this.ptr);
	}

	/** MEOS: tbool_start_value */
	startValue(): boolean {
		return F.tbool_start_value(this.ptr);
	}

	/** MEOS: tbool_to_tint */
	toTint(): Temporal {
		return wrapTemporal(F.tbool_to_tint(this.ptr)) as Temporal;
	}

	/** MEOS: tbool_value */
	value(): boolean {
		return F.tbool_value(this.ptr);
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

	/** MEOS: tbox_cmp */
	cmp(box2: TBox): number {
		return F.tbox_cmp(this.ptr, box2.ptr);
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

	/** MEOS: tbox_le */
	le(box2: TBox): boolean {
		return F.tbox_le(this.ptr, box2.ptr);
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

	/** MEOS: tbox_round */
	round(maxdd: number): TBox {
		return wrapTBox(F.tbox_round(this.ptr, maxdd)) as TBox;
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

	/** MEOS: tspatial_out */
	out(maxdd: number): string {
		return F.tspatial_out(this.ptr, maxdd);
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

	/** MEOS: tcbuffer_at_cbuffer */
	atCbuffer(cb: Cbuffer): Temporal | null {
		return wrapTemporalOrNull(F.tcbuffer_at_cbuffer(this.ptr, cb.ptr)) as Temporal | null;
	}

	/** MEOS: tcbuffer_at_geom */
	atGeom(gs: Geo): Temporal | null {
		return wrapTemporalOrNull(F.tcbuffer_at_geom(this.ptr, gs.ptr)) as Temporal | null;
	}

	/** MEOS: tcbuffer_at_stbox */
	atStbox(box: STBox, border_inc: boolean): Temporal | null {
		return wrapTemporalOrNull(F.tcbuffer_at_stbox(this.ptr, box.ptr, border_inc)) as Temporal | null;
	}

	/** MEOS: tcbuffer_convex_hull */
	convexHull(): Geo {
		return wrapGeo(F.tcbuffer_convex_hull(this.ptr)) as Geo;
	}

	/** MEOS: tcbuffer_end_value */
	endValue(): Cbuffer {
		return wrapCbuffer(F.tcbuffer_end_value(this.ptr)) as Cbuffer;
	}

	/** MEOS: tcbuffer_expand */
	expand(dist: number): Temporal {
		return wrapTemporal(F.tcbuffer_expand(this.ptr, dist)) as Temporal;
	}

	/** MEOS: tcbuffer_make */
	make(tfloat: Temporal): TCbuffer | null {
		return wrapTemporalOrNull(F.tcbuffer_make(this.ptr, tfloat.ptr)) as TCbuffer | null;
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

	/** MEOS: tcbuffer_start_value */
	startValue(): Cbuffer {
		return wrapCbuffer(F.tcbuffer_start_value(this.ptr)) as Cbuffer;
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

	/** MEOS: tfloat_end_value */
	endValue(): number {
		return F.tfloat_end_value(this.ptr);
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

	/** MEOS: tfloat_out */
	out(maxdd: number): string {
		return F.tfloat_out(this.ptr, maxdd);
	}

	/** MEOS: tfloat_radians */
	radians(): Temporal {
		return wrapTemporal(F.tfloat_radians(this.ptr)) as Temporal;
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

	/** MEOS: tfloat_tan */
	tan(): Temporal {
		return wrapTemporal(F.tfloat_tan(this.ptr)) as Temporal;
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

	/** MEOS: tgeo_affine */
	affine(a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, xoff: number, yoff: number, zoff: number): Temporal {
		return wrapTemporal(F.tgeo_affine(this.ptr, a, b, c, d, e, f, g, h, i, xoff, yoff, zoff)) as Temporal;
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

	/** MEOS: tgeo_end_value */
	endValue(): Geo {
		return wrapGeo(F.tgeo_end_value(this.ptr)) as Geo;
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

	/** MEOS: th3index_start_value */
	startValue(): H3Index {
		return F.th3index_start_value(this.ptr);
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

	/** MEOS: tint_out */
	asText(): string {
		return this.out();
	}

	/** MEOS: tint_at_value */
	atValue(i: number): Temporal | null {
		return wrapTemporalOrNull(F.tint_at_value(this.ptr, i)) as Temporal | null;
	}

	/** MEOS: tint_end_value */
	endValue(): number {
		return F.tint_end_value(this.ptr);
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

	/** MEOS: tint_out */
	out(): string {
		return F.tint_out(this.ptr);
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

	/** MEOS: tnpoint_cumulative_length */
	cumulativeLength(): Temporal {
		return wrapTemporal(F.tnpoint_cumulative_length(this.ptr)) as Temporal;
	}

	/** MEOS: tnpoint_end_value */
	endValue(): Npoint {
		return wrapNpoint(F.tnpoint_end_value(this.ptr)) as Npoint;
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

	/** MEOS: tnpoint_out */
	override out(maxdd: number): string {
		return F.tnpoint_out(this.ptr, maxdd);
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

	/** MEOS: tnpoint_route */
	route(): number {
		return F.tnpoint_route(this.ptr);
	}

	/** MEOS: tnpoint_routes */
	routes(): Set {
		return wrapSet(F.tnpoint_routes(this.ptr)) as Set;
	}

	/** MEOS: tnpoint_speed */
	speed(): Temporal | null {
		return wrapTemporalOrNull(F.tnpoint_speed(this.ptr)) as Temporal | null;
	}

	/** MEOS: tnpoint_start_value */
	startValue(): Npoint {
		return wrapNpoint(F.tnpoint_start_value(this.ptr)) as Npoint;
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

	/** MEOS: tpcbox_cmp */
	cmp(box2: TPCBox): number {
		return F.tpcbox_cmp(this.ptr, box2.ptr);
	}

	/** MEOS: tpcbox_copy */
	copy(): TPCBox {
		return wrapTPCBox(F.tpcbox_copy(this.ptr)) as TPCBox;
	}

	/** MEOS: tpcbox_eq */
	eq(box2: TPCBox): boolean {
		return F.tpcbox_eq(this.ptr, box2.ptr);
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

	/** MEOS: tpcbox_le */
	le(box2: TPCBox): boolean {
		return F.tpcbox_le(this.ptr, box2.ptr);
	}

	/** MEOS: tpcbox_lt */
	lt(box2: TPCBox): boolean {
		return F.tpcbox_lt(this.ptr, box2.ptr);
	}

	/** MEOS: tpcbox_ne */
	ne(box2: TPCBox): boolean {
		return F.tpcbox_ne(this.ptr, box2.ptr);
	}

	/** MEOS: tpcbox_out */
	out(maxdd: number): string {
		return F.tpcbox_out(this.ptr, maxdd);
	}

	/** MEOS: tpcbox_pcid */
	pcid(): number {
		return F.tpcbox_pcid(this.ptr);
	}

	/** MEOS: tpcbox_round */
	round(maxdd: number): TPCBox | null {
		return wrapTPCBoxOrNull(F.tpcbox_round(this.ptr, maxdd)) as TPCBox | null;
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

	/** MEOS: tpcpoint_at_value */
	atValue(pt: Pcpoint): Temporal | null {
		return wrapTemporalOrNull(F.tpcpoint_at_value(this.ptr, pt.ptr)) as Temporal | null;
	}

	/** MEOS: tpcpoint_end_value */
	endValue(): Pcpoint {
		return wrapPcpoint(F.tpcpoint_end_value(this.ptr)) as Pcpoint;
	}

	/** MEOS: tpcpoint_minus_value */
	minusValue(pt: Pcpoint): Temporal | null {
		return wrapTemporalOrNull(F.tpcpoint_minus_value(this.ptr, pt.ptr)) as Temporal | null;
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

	/** MEOS: tpose_speed */
	speed(): Temporal | null {
		return wrapTemporalOrNull(F.tpose_speed(this.ptr)) as Temporal | null;
	}

	/** MEOS: tpose_start_value */
	startValue(): Pose {
		return wrapPose(F.tpose_start_value(this.ptr)) as Pose;
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

	/** MEOS: tposechain_minus_value */
	minusValue(pc: PoseChain): Temporal | null {
		return wrapTemporalOrNull(F.tposechain_minus_value(this.ptr, pc.ptr)) as Temporal | null;
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

	/** MEOS: tposechain_start_value */
	startValue(): PoseChain {
		return wrapPoseChain(F.tposechain_start_value(this.ptr)) as PoseChain;
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

	/** MEOS: tquadbin_start_value */
	startValue(): Quadbin {
		return F.tquadbin_start_value(this.ptr);
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

	/** MEOS: trgeometry_after_timestamptz */
	override afterTimestamptz(t: TimestampTz, strict: boolean): Temporal | null {
		return wrapTemporalOrNull(F.trgeometry_after_timestamptz(this.ptr, t, strict)) as Temporal | null;
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

	/** MEOS: ts2cell_start_value */
	startValue(): S2CellId {
		return F.ts2cell_start_value(this.ptr);
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

	/** MEOS: textset_out */
	asText(): string {
		return this.out();
	}

	/** MEOS: textset_end_value */
	endValue(): string {
		return F.textset_end_value(this.ptr);
	}

	/** MEOS: textset_initcap */
	initcap(): Set {
		return wrapSet(F.textset_initcap(this.ptr)) as Set;
	}

	/** MEOS: textset_lower */
	lower(): Set {
		return wrapSet(F.textset_lower(this.ptr)) as Set;
	}

	/** MEOS: textset_out */
	out(): string {
		return F.textset_out(this.ptr);
	}

	/** MEOS: textset_start_value */
	startValue(): string {
		return F.textset_start_value(this.ptr);
	}

	/** MEOS: textset_to_jsonbset */
	toJsonbset(): Set | null {
		return wrapSetOrNull(F.textset_to_jsonbset(this.ptr)) as Set | null;
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

	/** MEOS: tstzset_out */
	asText(): string {
		return this.out();
	}

	/** MEOS: tstzset_out */
	out(): string {
		return F.tstzset_out(this.ptr);
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
}

/**
 * The TsTzSpan class of the MEOS object model.
 */
export class TsTzSpan extends Span {

	/** The text MEOS writes this value as (MEOS: tstzspan_out). */
	override toString(): string {
		return this.out();
	}

	/** MEOS: tstzspan_out */
	asText(): string {
		return this.out();
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

	/** MEOS: tstzspan_out */
	out(): string {
		return F.tstzspan_out(this.ptr);
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

	/** MEOS: tstzspanset_out */
	asText(): string {
		return this.out();
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

	/** MEOS: tstzspanset_num_timestamps */
	numTimestamps(): number {
		return F.tstzspanset_num_timestamps(this.ptr);
	}

	/** MEOS: tstzspanset_out */
	out(): string {
		return F.tstzspanset_out(this.ptr);
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
