/* AUTO-GENERATED - DO NOT EDIT. Run: npm run generate */
import { getModule } from '../runtime/meos';

// WASM linear memory address, held as a JS number (safe up to 2^53).
export type Ptr = number;

// PostgreSQL TimestampTz - microseconds since 2000-01-01 UTC
export type TimestampTz = number;

// PostgreSQL DateADT - days since 2000-01-01
export type DateADT = number;

function call<T>(
	name: string,
	ret: 'number' | 'bigint' | 'string' | 'boolean' | null,
	argTypes: ('number' | 'string' | 'boolean' | 'bigint')[],
	args: unknown[]
): T {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	return getModule().ccall(name, ret as any, argTypes as any, args) as T;
}

// --- wasm64 pointer support ---
//
// MEOS.js targets wasm64 (MEMORY64=1) exclusively. Emscripten represents
// pointer arguments and return values as JS BigInt with ccall. The helpers
// below centralise that conversion so every generated wrapper stays uniform.

/** ccall arg-type tag for a Ptr parameter (always 'bigint' in wasm64). */
export function ptrArgType(): 'bigint' { return 'bigint'; }

/** Converts a Ptr to the BigInt value ccall expects in wasm64. */
export function ptrArgVal(p: Ptr): bigint { return BigInt(p); }

/** Calls a MEOS function that returns a Ptr (BigInt from ccall → number). */
export function callPtr(
	name: string,
	argTypes: ('number' | 'string' | 'boolean' | 'bigint')[],
	args: unknown[]
): Ptr {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	return Number(getModule().ccall(name, 'bigint' as any, argTypes as any, args) as bigint);
}

// --- Error handling ---
//
// errlevel mirrors PostgreSQL severity constants: NOTICE=18, WARNING=19, ERROR=21.
// After every generated wrapper call, checkMeosError() reads the C globals written
// by _meos_error_handler (registered in meos_init_lib) and throws if errcode != 0.
//
// Typed exceptions (MeosInternalError, MeosInvalidArgError, …) are defined in
// src/errors.ts and dispatched via makeMeosException().

import { makeMeosException, MEOS_NOTICE, MEOS_WARNING, MeosException } from './errors';
export * from './errors';

// MeosError kept as alias for backward compatibility.
export { MeosException as MeosError };

export function checkMeosError(): void {
	const code  = call<number>('meos_err_code',  'number', [], []);
	const level = call<number>('meos_err_level', 'number', [], []);
	if (code === 0 && level === 0) return;
	const msg = call<string>('meos_err_msg', 'string', [], []);
	call<void>('meos_err_clear', null, [], []);
	if (level === MEOS_NOTICE) {
		console.info(`MEOS notice [${code}]: ${msg}`);
	} else if (level === MEOS_WARNING) {
		console.warn(`MEOS warning [${code}]: ${msg}`);
	} else {
		throw makeMeosException(code, level, msg);
	}
}

// --- Hand-written wrappers (special logic) ---

/** Free a MEOS-allocated pointer. */
export function meos_free(ptr: Ptr): void {
	call<void>('meos_free', null, [ptrArgType()], [ptrArgVal(ptr)]);
}

/** Extended hex-WKB; discards variant + size_out. */
export function temporal_as_hexwkb(temp: Ptr): string {
	const _r = call<string>('temporal_as_hexwkb_w', 'string', [ptrArgType()], [ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

/** Pass empty string for srs to use NULL. */
export function temporal_as_mfjson(
	temp: Ptr, withBbox: boolean, flags: number, precision: number, srs: string
): string {
	const _r = call<string>(
		'temporal_as_mfjson_w', 'string',
		[ptrArgType(), 'number', 'number', 'number', 'string'],
		[ptrArgVal(temp), withBbox ? 1 : 0, flags, precision, srs]
	);
	checkMeosError();
	return _r;
}

/** 0-based index (MEOS is 1-based internally). */
export function temporal_instant_n(temp: Ptr, n: number): Ptr {
	const _r = callPtr('temporal_instant_n_w', [ptrArgType(), 'number'], [ptrArgVal(temp), n]);
	checkMeosError();
	return _r;
}

/** Duration as total microseconds (month ≈ 30 days). */
export function temporal_duration_us(temp: Ptr, ignoreGaps: boolean): number {
	const _r = call<number>(
		'temporal_duration_us_w', 'number',
		[ptrArgType(), 'number'],
		[ptrArgVal(temp), ignoreGaps ? 1 : 0]
	);
	checkMeosError();
	return _r;
}

/** Serialise a Span to hex-encoded WKB; discards size_out. */
export function span_as_hexwkb(s: Ptr, variant: number): string {
	const _r = call<string>('span_as_hexwkb_w', 'string', [ptrArgType(), 'number'], [ptrArgVal(s), variant]);
	checkMeosError();
	return _r;
}

/*
 * tstzspan_lower / tstzspan_upper - Datum workaround.
 * The C wrappers dereference the Int64GetDatum pointer and return the
 * actual microsecond timestamp as long long (i64).
 * ccall returns i64 as BigInt; we convert to JS number (safe for dates
 * within ~285 years of the 2000-01-01 epoch).
 */
export function tstzspan_lower(s: Ptr): TimestampTz {
	return Number(call<bigint>('tstzspan_lower_w', 'bigint', [ptrArgType()], [ptrArgVal(s)]));
}

export function tstzspan_upper(s: Ptr): TimestampTz {
	return Number(call<bigint>('tstzspan_upper_w', 'bigint', [ptrArgType()], [ptrArgVal(s)]));
}

/*
 * span_eq / span_ne - Datum workaround.
 * The C wrappers use span_cmp() which correctly dereferences Datum.
 */
export function span_eq(s1: Ptr, s2: Ptr): boolean {
	return call<number>('span_eq_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(s1), ptrArgVal(s2)]) !== 0;
}

export function span_ne(s1: Ptr, s2: Ptr): boolean {
	return call<number>('span_ne_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(s1), ptrArgVal(s2)]) !== 0;
}

/*
 * adjacent_span_span - Datum workaround.
 * The C wrapper uses dereferenced timestamp values instead of datum_eq().
 */
export function adjacent_span_span(s1: Ptr, s2: Ptr): boolean {
	return call<number>('adjacent_span_span_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(s1), ptrArgVal(s2)]) !== 0;
}

/*
 * tstzspanset_lower / tstzspanset_upper - Datum workaround (same as tstzspan).
 * ss->elems[i].lower/upper are Datums storing pointers to int64 timestamps.
 * We dereference directly via DatumGetTimestampTz.
 */
export function tstzspanset_lower(ss: Ptr): TimestampTz {
	return Number(call<bigint>('tstzspanset_lower_w', 'bigint', [ptrArgType()], [ptrArgVal(ss)]));
}

export function tstzspanset_upper(ss: Ptr): TimestampTz {
	return Number(call<bigint>('tstzspanset_upper_w', 'bigint', [ptrArgType()], [ptrArgVal(ss)]));
}

/** Serialise a SpanSet to hex-encoded WKB; discards size_out. */
export function spanset_as_hexwkb(ss: Ptr, variant: number): string {
	const _r = call<string>('spanset_as_hexwkb_w', 'string', [ptrArgType(), 'number'], [ptrArgVal(ss), variant]);
	checkMeosError();
	return _r;
}

/** Duration of a TsTzSpanSet as total microseconds (month ≈ 30 days). */
export function tstzspanset_duration_us(ss: Ptr, boundSpan: boolean): number {
	const _r = call<number>(
		'tstzspanset_duration_us_w', 'number',
		[ptrArgType(), 'number'],
		[ptrArgVal(ss), boundSpan ? 1 : 0]
	);
	checkMeosError();
	return _r;
}

/*
 * tstzspanset_timestamptz_n - bool+result with int64.
 * Returns 0 if n is out of range; JS callers must bounds-check.
 * n is 1-based (MEOS convention); the TypeScript class converts from 0-based.
 */
export function tstzspanset_timestamptz_n(ss: Ptr, n: number): TimestampTz {
	return Number(call<bigint>('tstzspanset_timestamptz_n_w', 'bigint', [ptrArgType(), 'number'], [ptrArgVal(ss), n]));
}

/** Serialise a Set to hex-encoded WKB; discards size_out. */
export function set_as_hexwkb(s: Ptr, variant: number): string {
	const _r = call<string>('set_as_hexwkb_w', 'string', [ptrArgType(), 'number'], [ptrArgVal(s), variant]);
	checkMeosError();
	return _r;
}

export function tstzset_start_value(s: Ptr): TimestampTz {
	return Number(call<bigint>('tstzset_start_value_w', 'bigint', [ptrArgType()], [ptrArgVal(s)]));
}

export function tstzset_end_value(s: Ptr): TimestampTz {
	return Number(call<bigint>('tstzset_end_value_w', 'bigint', [ptrArgType()], [ptrArgVal(s)]));
}

/*
 * tstzset_value_n — bool+result with TimestampTz (int64).
 * n is 1-based (MEOS convention); the TypeScript class converts from 0-based.
 * Returns 0 if n is out of range; callers must bounds-check.
 */
export function tstzset_value_n(s: Ptr, n: number): TimestampTz {
	return Number(call<bigint>('tstzset_value_n_w', 'bigint', [ptrArgType(), 'number'], [ptrArgVal(s), n]));
}

/*
 * textset_value_n — bool+result with text* (varlena).
 * The C wrapper converts text* to cstring, so JS receives a plain string.
 * Returns null if n is out of range. n is 1-based (MEOS convention).
 */
export function textset_value_n(s: Ptr, n: number): string | null {
	const _r = call<string>('textset_value_n_w', 'string', [ptrArgType(), 'number'], [ptrArgVal(s), n]);
	checkMeosError();
	return _r ?? null;
}

/*
 * ttext_value_n — bool+result with text* (varlena).
 * The C wrapper converts text* to cstring, so JS receives a plain string.
 * Returns null if n is out of range. n is 1-based (MEOS convention).
 */
export function ttext_value_n(temp: Ptr, n: number): string | null {
	const _r = call<string>('ttext_value_n_w', 'string', [ptrArgType(), 'number'], [ptrArgVal(temp), n]);
	checkMeosError();
	return _r ?? null;
}

// --- Generated wrappers ---

// === meos.h ===

export function rtree_create_intspan(): Ptr {
	const _r = callPtr('rtree_create_intspan_w', [], []);
	checkMeosError();
	return _r;
}

export function rtree_create_bigintspan(): Ptr {
	const _r = callPtr('rtree_create_bigintspan_w', [], []);
	checkMeosError();
	return _r;
}

export function rtree_create_floatspan(): Ptr {
	const _r = callPtr('rtree_create_floatspan_w', [], []);
	checkMeosError();
	return _r;
}

export function rtree_create_datespan(): Ptr {
	const _r = callPtr('rtree_create_datespan_w', [], []);
	checkMeosError();
	return _r;
}

export function rtree_create_tstzspan(): Ptr {
	const _r = callPtr('rtree_create_tstzspan_w', [], []);
	checkMeosError();
	return _r;
}

export function rtree_create_tbox(): Ptr {
	const _r = callPtr('rtree_create_tbox_w', [], []);
	checkMeosError();
	return _r;
}

export function rtree_create_stbox(): Ptr {
	const _r = callPtr('rtree_create_stbox_w', [], []);
	checkMeosError();
	return _r;
}

export function rtree_free(rtree: Ptr): void {
	call<void>('rtree_free_w', null, [ptrArgType()], [ptrArgVal(rtree)]);
	checkMeosError();
}

export function rtree_insert(rtree: Ptr, box: Ptr, id: number): void {
	call<void>('rtree_insert_w', null, [ptrArgType(), ptrArgType(), 'number'], [ptrArgVal(rtree), ptrArgVal(box), id]);
	checkMeosError();
}

export function rtree_insert_temporal(rtree: Ptr, temp: Ptr, id: number): void {
	call<void>('rtree_insert_temporal_w', null, [ptrArgType(), ptrArgType(), 'number'], [ptrArgVal(rtree), ptrArgVal(temp), id]);
	checkMeosError();
}

export function rtree_search(rtree: Ptr, op: number, query: Ptr, count: Ptr): Ptr {
	const _r = callPtr('rtree_search_w', [ptrArgType(), 'number', ptrArgType(), ptrArgType()], [ptrArgVal(rtree), op, ptrArgVal(query), ptrArgVal(count)]);
	checkMeosError();
	return _r;
}

export function rtree_search_temporal(rtree: Ptr, op: number, temp: Ptr, count: Ptr): Ptr {
	const _r = callPtr('rtree_search_temporal_w', [ptrArgType(), 'number', ptrArgType(), ptrArgType()], [ptrArgVal(rtree), op, ptrArgVal(temp), ptrArgVal(count)]);
	checkMeosError();
	return _r;
}

export function meos_errno(): number {
	const _r = call<number>('meos_errno_w', 'number', [], []);
	checkMeosError();
	return _r;
}

export function meos_errno_set(err: number): number {
	const _r = call<number>('meos_errno_set_w', 'number', ['number'], [err]);
	checkMeosError();
	return _r;
}

export function meos_errno_restore(err: number): number {
	const _r = call<number>('meos_errno_restore_w', 'number', ['number'], [err]);
	checkMeosError();
	return _r;
}

export function meos_errno_reset(): number {
	const _r = call<number>('meos_errno_reset_w', 'number', [], []);
	checkMeosError();
	return _r;
}

export function meos_set_datestyle(newval: string, extra: Ptr): boolean {
	const _r = call<number>('meos_set_datestyle_w', 'number', ['string', ptrArgType()], [newval, ptrArgVal(extra)]) !== 0;
	checkMeosError();
	return _r;
}

export function meos_set_intervalstyle(newval: string, extra: number): boolean {
	const _r = call<number>('meos_set_intervalstyle_w', 'number', ['string', 'number'], [newval, extra]) !== 0;
	checkMeosError();
	return _r;
}

export function meos_get_datestyle(): string {
	const _r = call<string>('meos_get_datestyle_w', 'string', [], []);
	checkMeosError();
	return _r;
}

export function meos_get_intervalstyle(): string {
	const _r = call<string>('meos_get_intervalstyle_w', 'string', [], []);
	checkMeosError();
	return _r;
}

export function meos_set_spatial_ref_sys_csv(path: string): void {
	call<void>('meos_set_spatial_ref_sys_csv_w', null, ['string'], [path]);
	checkMeosError();
}

export function add_date_int(d: DateADT, days: number): DateADT {
	const _r = call<DateADT>('add_date_int_w', 'number', ['number', 'number'], [d, days]);
	checkMeosError();
	return _r;
}

export function add_interval_interval(interv1: Ptr, interv2: Ptr): Ptr {
	const _r = callPtr('add_interval_interval_w', [ptrArgType(), ptrArgType()], [ptrArgVal(interv1), ptrArgVal(interv2)]);
	checkMeosError();
	return _r;
}

export function add_timestamptz_interval(t: TimestampTz, interv: Ptr): TimestampTz {
	const _r = call<TimestampTz>('add_timestamptz_interval_w', 'number', ['bigint', ptrArgType()], [BigInt(t), ptrArgVal(interv)]);
	checkMeosError();
	return _r;
}

export function bool_in(str: string): boolean {
	const _r = call<number>('bool_in_w', 'number', ['string'], [str]) !== 0;
	checkMeosError();
	return _r;
}

export function bool_out(b: boolean): string {
	const _r = call<string>('bool_out_w', 'string', ['number'], [b ? 1 : 0]);
	checkMeosError();
	return _r;
}

export function date_to_timestamp(dateVal: DateADT): number {
	const _r = call<number>('date_to_timestamp_w', 'number', ['number'], [dateVal]);
	checkMeosError();
	return _r;
}

export function date_to_timestamptz(d: DateADT): TimestampTz {
	const _r = call<TimestampTz>('date_to_timestamptz_w', 'number', ['number'], [d]);
	checkMeosError();
	return _r;
}

export function float_exp(d: number): number {
	const _r = call<number>('float_exp_w', 'number', ['number'], [d]);
	checkMeosError();
	return _r;
}

export function float_ln(d: number): number {
	const _r = call<number>('float_ln_w', 'number', ['number'], [d]);
	checkMeosError();
	return _r;
}

export function float_log10(d: number): number {
	const _r = call<number>('float_log10_w', 'number', ['number'], [d]);
	checkMeosError();
	return _r;
}

export function float8_out(d: number, maxdd: number): string {
	const _r = call<string>('float8_out_w', 'string', ['number', 'number'], [d, maxdd]);
	checkMeosError();
	return _r;
}

export function float_round(d: number, maxdd: number): number {
	const _r = call<number>('float_round_w', 'number', ['number', 'number'], [d, maxdd]);
	checkMeosError();
	return _r;
}

export function int32_cmp(l: number, r: number): number {
	const _r = call<number>('int32_cmp_w', 'number', ['number', 'number'], [l, r]);
	checkMeosError();
	return _r;
}

export function int64_cmp(l: number, r: number): number {
	const _r = call<number>('int64_cmp_w', 'number', ['bigint', 'bigint'], [BigInt(l), BigInt(r)]);
	checkMeosError();
	return _r;
}

export function interval_make(years: number, months: number, weeks: number, days: number, hours: number, mins: number, secs: number): Ptr {
	const _r = callPtr('interval_make_w', ['number', 'number', 'number', 'number', 'number', 'number', 'number'], [years, months, weeks, days, hours, mins, secs]);
	checkMeosError();
	return _r;
}

export function minus_date_date(d1: DateADT, d2: DateADT): number {
	const _r = call<number>('minus_date_date_w', 'number', ['number', 'number'], [d1, d2]);
	checkMeosError();
	return _r;
}

export function minus_date_int(d: DateADT, days: number): DateADT {
	const _r = call<DateADT>('minus_date_int_w', 'number', ['number', 'number'], [d, days]);
	checkMeosError();
	return _r;
}

export function minus_timestamptz_interval(t: TimestampTz, interv: Ptr): TimestampTz {
	const _r = call<TimestampTz>('minus_timestamptz_interval_w', 'number', ['bigint', ptrArgType()], [BigInt(t), ptrArgVal(interv)]);
	checkMeosError();
	return _r;
}

export function minus_timestamptz_timestamptz(t1: TimestampTz, t2: TimestampTz): Ptr {
	const _r = callPtr('minus_timestamptz_timestamptz_w', ['bigint', 'bigint'], [BigInt(t1), BigInt(t2)]);
	checkMeosError();
	return _r;
}

export function mul_interval_double(interv: Ptr, factor: number): Ptr {
	const _r = callPtr('mul_interval_double_w', [ptrArgType(), 'number'], [ptrArgVal(interv), factor]);
	checkMeosError();
	return _r;
}

export function pg_date_in(str: string): DateADT {
	const _r = call<DateADT>('pg_date_in_w', 'number', ['string'], [str]);
	checkMeosError();
	return _r;
}

export function pg_date_out(d: DateADT): string {
	const _r = call<string>('pg_date_out_w', 'string', ['number'], [d]);
	checkMeosError();
	return _r;
}

export function pg_interval_cmp(interv1: Ptr, interv2: Ptr): number {
	const _r = call<number>('pg_interval_cmp_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(interv1), ptrArgVal(interv2)]);
	checkMeosError();
	return _r;
}

export function pg_interval_in(str: string, typmod: number): Ptr {
	const _r = callPtr('pg_interval_in_w', ['string', 'number'], [str, typmod]);
	checkMeosError();
	return _r;
}

export function pg_interval_out(interv: Ptr): string {
	const _r = call<string>('pg_interval_out_w', 'string', [ptrArgType()], [ptrArgVal(interv)]);
	checkMeosError();
	return _r;
}

export function pg_timestamp_in(str: string, typmod: number): number {
	const _r = call<number>('pg_timestamp_in_w', 'number', ['string', 'number'], [str, typmod]);
	checkMeosError();
	return _r;
}

export function pg_timestamp_out(t: number): string {
	const _r = call<string>('pg_timestamp_out_w', 'string', ['bigint'], [BigInt(t)]);
	checkMeosError();
	return _r;
}

export function pg_timestamptz_in(str: string, typmod: number): TimestampTz {
	const _r = call<TimestampTz>('pg_timestamptz_in_w', 'number', ['string', 'number'], [str, typmod]);
	checkMeosError();
	return _r;
}

export function pg_timestamptz_out(t: TimestampTz): string {
	const _r = call<string>('pg_timestamptz_out_w', 'string', ['bigint'], [BigInt(t)]);
	checkMeosError();
	return _r;
}

export function text_cmp(txt1: string, txt2: string): number {
	const _r = call<number>('text_cmp_w', 'number', ['string', 'string'], [txt1, txt2]);
	checkMeosError();
	return _r;
}

export function text_copy(txt: string): string {
	const _r = call<string>('text_copy_w', 'string', ['string'], [txt]);
	checkMeosError();
	return _r;
}

export function text_in(str: string): string {
	const _r = call<string>('text_in_w', 'string', ['string'], [str]);
	checkMeosError();
	return _r;
}

export function text_initcap(txt: string): string {
	const _r = call<string>('text_initcap_w', 'string', ['string'], [txt]);
	checkMeosError();
	return _r;
}

export function text_lower(txt: string): string {
	const _r = call<string>('text_lower_w', 'string', ['string'], [txt]);
	checkMeosError();
	return _r;
}

export function text_out(txt: string): string {
	const _r = call<string>('text_out_w', 'string', ['string'], [txt]);
	checkMeosError();
	return _r;
}

export function text_upper(txt: string): string {
	const _r = call<string>('text_upper_w', 'string', ['string'], [txt]);
	checkMeosError();
	return _r;
}

export function textcat_text_text(txt1: string, txt2: string): string {
	const _r = call<string>('textcat_text_text_w', 'string', ['string', 'string'], [txt1, txt2]);
	checkMeosError();
	return _r;
}

export function timestamptz_shift(t: TimestampTz, interv: Ptr): TimestampTz {
	const _r = call<TimestampTz>('timestamptz_shift_w', 'number', ['bigint', ptrArgType()], [BigInt(t), ptrArgVal(interv)]);
	checkMeosError();
	return _r;
}

export function timestamp_to_date(t: number): DateADT {
	const _r = call<DateADT>('timestamp_to_date_w', 'number', ['bigint'], [BigInt(t)]);
	checkMeosError();
	return _r;
}

export function timestamptz_to_date(t: TimestampTz): DateADT {
	const _r = call<DateADT>('timestamptz_to_date_w', 'number', ['bigint'], [BigInt(t)]);
	checkMeosError();
	return _r;
}

export function bigintset_in(str: string): Ptr {
	const _r = callPtr('bigintset_in_w', ['string'], [str]);
	checkMeosError();
	return _r;
}

export function bigintset_out(set: Ptr): string {
	const _r = call<string>('bigintset_out_w', 'string', [ptrArgType()], [ptrArgVal(set)]);
	checkMeosError();
	return _r;
}

export function bigintspan_expand(s: Ptr, value: number): Ptr {
	const _r = callPtr('bigintspan_expand_w', [ptrArgType(), 'bigint'], [ptrArgVal(s), BigInt(value)]);
	checkMeosError();
	return _r;
}

export function bigintspan_in(str: string): Ptr {
	const _r = callPtr('bigintspan_in_w', ['string'], [str]);
	checkMeosError();
	return _r;
}

export function bigintspan_out(s: Ptr): string {
	const _r = call<string>('bigintspan_out_w', 'string', [ptrArgType()], [ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function bigintspanset_in(str: string): Ptr {
	const _r = callPtr('bigintspanset_in_w', ['string'], [str]);
	checkMeosError();
	return _r;
}

export function bigintspanset_out(ss: Ptr): string {
	const _r = call<string>('bigintspanset_out_w', 'string', [ptrArgType()], [ptrArgVal(ss)]);
	checkMeosError();
	return _r;
}

export function dateset_in(str: string): Ptr {
	const _r = callPtr('dateset_in_w', ['string'], [str]);
	checkMeosError();
	return _r;
}

export function dateset_out(s: Ptr): string {
	const _r = call<string>('dateset_out_w', 'string', [ptrArgType()], [ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function datespan_in(str: string): Ptr {
	const _r = callPtr('datespan_in_w', ['string'], [str]);
	checkMeosError();
	return _r;
}

export function datespan_out(s: Ptr): string {
	const _r = call<string>('datespan_out_w', 'string', [ptrArgType()], [ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function datespanset_in(str: string): Ptr {
	const _r = callPtr('datespanset_in_w', ['string'], [str]);
	checkMeosError();
	return _r;
}

export function datespanset_out(ss: Ptr): string {
	const _r = call<string>('datespanset_out_w', 'string', [ptrArgType()], [ptrArgVal(ss)]);
	checkMeosError();
	return _r;
}

export function floatset_in(str: string): Ptr {
	const _r = callPtr('floatset_in_w', ['string'], [str]);
	checkMeosError();
	return _r;
}

export function floatset_out(set: Ptr, maxdd: number): string {
	const _r = call<string>('floatset_out_w', 'string', [ptrArgType(), 'number'], [ptrArgVal(set), maxdd]);
	checkMeosError();
	return _r;
}

export function floatspan_expand(s: Ptr, value: number): Ptr {
	const _r = callPtr('floatspan_expand_w', [ptrArgType(), 'number'], [ptrArgVal(s), value]);
	checkMeosError();
	return _r;
}

export function floatspan_in(str: string): Ptr {
	const _r = callPtr('floatspan_in_w', ['string'], [str]);
	checkMeosError();
	return _r;
}

export function floatspan_out(s: Ptr, maxdd: number): string {
	const _r = call<string>('floatspan_out_w', 'string', [ptrArgType(), 'number'], [ptrArgVal(s), maxdd]);
	checkMeosError();
	return _r;
}

export function floatspanset_in(str: string): Ptr {
	const _r = callPtr('floatspanset_in_w', ['string'], [str]);
	checkMeosError();
	return _r;
}

export function floatspanset_out(ss: Ptr, maxdd: number): string {
	const _r = call<string>('floatspanset_out_w', 'string', [ptrArgType(), 'number'], [ptrArgVal(ss), maxdd]);
	checkMeosError();
	return _r;
}

export function intset_in(str: string): Ptr {
	const _r = callPtr('intset_in_w', ['string'], [str]);
	checkMeosError();
	return _r;
}

export function intset_out(set: Ptr): string {
	const _r = call<string>('intset_out_w', 'string', [ptrArgType()], [ptrArgVal(set)]);
	checkMeosError();
	return _r;
}

export function intspan_expand(s: Ptr, value: number): Ptr {
	const _r = callPtr('intspan_expand_w', [ptrArgType(), 'number'], [ptrArgVal(s), value]);
	checkMeosError();
	return _r;
}

export function intspan_in(str: string): Ptr {
	const _r = callPtr('intspan_in_w', ['string'], [str]);
	checkMeosError();
	return _r;
}

export function intspan_out(s: Ptr): string {
	const _r = call<string>('intspan_out_w', 'string', [ptrArgType()], [ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function intspanset_in(str: string): Ptr {
	const _r = callPtr('intspanset_in_w', ['string'], [str]);
	checkMeosError();
	return _r;
}

export function intspanset_out(ss: Ptr): string {
	const _r = call<string>('intspanset_out_w', 'string', [ptrArgType()], [ptrArgVal(ss)]);
	checkMeosError();
	return _r;
}

export function set_as_wkb(s: Ptr, variant: number, size_out: Ptr): Ptr {
	const _r = callPtr('set_as_wkb_w', [ptrArgType(), 'number', ptrArgType()], [ptrArgVal(s), variant, ptrArgVal(size_out)]);
	checkMeosError();
	return _r;
}

export function set_from_hexwkb(hexwkb: string): Ptr {
	const _r = callPtr('set_from_hexwkb_w', ['string'], [hexwkb]);
	checkMeosError();
	return _r;
}

export function set_from_wkb(wkb: Ptr, size: number): Ptr {
	const _r = callPtr('set_from_wkb_w', [ptrArgType(), 'number'], [ptrArgVal(wkb), size]);
	checkMeosError();
	return _r;
}

export function span_as_wkb(s: Ptr, variant: number, size_out: Ptr): Ptr {
	const _r = callPtr('span_as_wkb_w', [ptrArgType(), 'number', ptrArgType()], [ptrArgVal(s), variant, ptrArgVal(size_out)]);
	checkMeosError();
	return _r;
}

export function span_from_hexwkb(hexwkb: string): Ptr {
	const _r = callPtr('span_from_hexwkb_w', ['string'], [hexwkb]);
	checkMeosError();
	return _r;
}

export function span_from_wkb(wkb: Ptr, size: number): Ptr {
	const _r = callPtr('span_from_wkb_w', [ptrArgType(), 'number'], [ptrArgVal(wkb), size]);
	checkMeosError();
	return _r;
}

export function spanset_as_wkb(ss: Ptr, variant: number, size_out: Ptr): Ptr {
	const _r = callPtr('spanset_as_wkb_w', [ptrArgType(), 'number', ptrArgType()], [ptrArgVal(ss), variant, ptrArgVal(size_out)]);
	checkMeosError();
	return _r;
}

export function spanset_from_hexwkb(hexwkb: string): Ptr {
	const _r = callPtr('spanset_from_hexwkb_w', ['string'], [hexwkb]);
	checkMeosError();
	return _r;
}

export function spanset_from_wkb(wkb: Ptr, size: number): Ptr {
	const _r = callPtr('spanset_from_wkb_w', [ptrArgType(), 'number'], [ptrArgVal(wkb), size]);
	checkMeosError();
	return _r;
}

export function textset_in(str: string): Ptr {
	const _r = callPtr('textset_in_w', ['string'], [str]);
	checkMeosError();
	return _r;
}

export function textset_out(set: Ptr): string {
	const _r = call<string>('textset_out_w', 'string', [ptrArgType()], [ptrArgVal(set)]);
	checkMeosError();
	return _r;
}

export function tstzset_in(str: string): Ptr {
	const _r = callPtr('tstzset_in_w', ['string'], [str]);
	checkMeosError();
	return _r;
}

export function tstzset_out(set: Ptr): string {
	const _r = call<string>('tstzset_out_w', 'string', [ptrArgType()], [ptrArgVal(set)]);
	checkMeosError();
	return _r;
}

export function tstzspan_in(str: string): Ptr {
	const _r = callPtr('tstzspan_in_w', ['string'], [str]);
	checkMeosError();
	return _r;
}

export function tstzspan_out(s: Ptr): string {
	const _r = call<string>('tstzspan_out_w', 'string', [ptrArgType()], [ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function tstzspanset_in(str: string): Ptr {
	const _r = callPtr('tstzspanset_in_w', ['string'], [str]);
	checkMeosError();
	return _r;
}

export function tstzspanset_out(ss: Ptr): string {
	const _r = call<string>('tstzspanset_out_w', 'string', [ptrArgType()], [ptrArgVal(ss)]);
	checkMeosError();
	return _r;
}

export function bigintset_make(values: Ptr, count: number): Ptr {
	const _r = callPtr('bigintset_make_w', [ptrArgType(), 'number'], [ptrArgVal(values), count]);
	checkMeosError();
	return _r;
}

export function bigintspan_make(lower: number, upper: number, lower_inc: boolean, upper_inc: boolean): Ptr {
	const _r = callPtr('bigintspan_make_w', ['bigint', 'bigint', 'number', 'number'], [BigInt(lower), BigInt(upper), lower_inc ? 1 : 0, upper_inc ? 1 : 0]);
	checkMeosError();
	return _r;
}

export function dateset_make(values: Ptr, count: number): Ptr {
	const _r = callPtr('dateset_make_w', [ptrArgType(), 'number'], [ptrArgVal(values), count]);
	checkMeosError();
	return _r;
}

export function datespan_make(lower: DateADT, upper: DateADT, lower_inc: boolean, upper_inc: boolean): Ptr {
	const _r = callPtr('datespan_make_w', ['number', 'number', 'number', 'number'], [lower, upper, lower_inc ? 1 : 0, upper_inc ? 1 : 0]);
	checkMeosError();
	return _r;
}

export function floatset_make(values: Ptr, count: number): Ptr {
	const _r = callPtr('floatset_make_w', [ptrArgType(), 'number'], [ptrArgVal(values), count]);
	checkMeosError();
	return _r;
}

export function floatspan_make(lower: number, upper: number, lower_inc: boolean, upper_inc: boolean): Ptr {
	const _r = callPtr('floatspan_make_w', ['number', 'number', 'number', 'number'], [lower, upper, lower_inc ? 1 : 0, upper_inc ? 1 : 0]);
	checkMeosError();
	return _r;
}

export function intset_make(values: Ptr, count: number): Ptr {
	const _r = callPtr('intset_make_w', [ptrArgType(), 'number'], [ptrArgVal(values), count]);
	checkMeosError();
	return _r;
}

export function intspan_make(lower: number, upper: number, lower_inc: boolean, upper_inc: boolean): Ptr {
	const _r = callPtr('intspan_make_w', ['number', 'number', 'number', 'number'], [lower, upper, lower_inc ? 1 : 0, upper_inc ? 1 : 0]);
	checkMeosError();
	return _r;
}

export function set_copy(s: Ptr): Ptr {
	const _r = callPtr('set_copy_w', [ptrArgType()], [ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function span_copy(s: Ptr): Ptr {
	const _r = callPtr('span_copy_w', [ptrArgType()], [ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function spanset_copy(ss: Ptr): Ptr {
	const _r = callPtr('spanset_copy_w', [ptrArgType()], [ptrArgVal(ss)]);
	checkMeosError();
	return _r;
}

export function spanset_make(spans: Ptr, count: number): Ptr {
	const _r = callPtr('spanset_make_w', [ptrArgType(), 'number'], [ptrArgVal(spans), count]);
	checkMeosError();
	return _r;
}

export function textset_make(values: Ptr, count: number): Ptr {
	const _r = callPtr('textset_make_w', [ptrArgType(), 'number'], [ptrArgVal(values), count]);
	checkMeosError();
	return _r;
}

export function tstzset_make(values: Ptr, count: number): Ptr {
	const _r = callPtr('tstzset_make_w', [ptrArgType(), 'number'], [ptrArgVal(values), count]);
	checkMeosError();
	return _r;
}

export function tstzspan_make(lower: TimestampTz, upper: TimestampTz, lower_inc: boolean, upper_inc: boolean): Ptr {
	const _r = callPtr('tstzspan_make_w', ['bigint', 'bigint', 'number', 'number'], [BigInt(lower), BigInt(upper), lower_inc ? 1 : 0, upper_inc ? 1 : 0]);
	checkMeosError();
	return _r;
}

export function bigint_to_set(i: number): Ptr {
	const _r = callPtr('bigint_to_set_w', ['bigint'], [BigInt(i)]);
	checkMeosError();
	return _r;
}

export function bigint_to_span(i: number): Ptr {
	const _r = callPtr('bigint_to_span_w', ['number'], [i]);
	checkMeosError();
	return _r;
}

export function bigint_to_spanset(i: number): Ptr {
	const _r = callPtr('bigint_to_spanset_w', ['number'], [i]);
	checkMeosError();
	return _r;
}

export function date_to_set(d: DateADT): Ptr {
	const _r = callPtr('date_to_set_w', ['number'], [d]);
	checkMeosError();
	return _r;
}

export function date_to_span(d: DateADT): Ptr {
	const _r = callPtr('date_to_span_w', ['number'], [d]);
	checkMeosError();
	return _r;
}

export function date_to_spanset(d: DateADT): Ptr {
	const _r = callPtr('date_to_spanset_w', ['number'], [d]);
	checkMeosError();
	return _r;
}

export function dateset_to_tstzset(s: Ptr): Ptr {
	const _r = callPtr('dateset_to_tstzset_w', [ptrArgType()], [ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function datespan_to_tstzspan(s: Ptr): Ptr {
	const _r = callPtr('datespan_to_tstzspan_w', [ptrArgType()], [ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function datespanset_to_tstzspanset(ss: Ptr): Ptr {
	const _r = callPtr('datespanset_to_tstzspanset_w', [ptrArgType()], [ptrArgVal(ss)]);
	checkMeosError();
	return _r;
}

export function float_to_set(d: number): Ptr {
	const _r = callPtr('float_to_set_w', ['number'], [d]);
	checkMeosError();
	return _r;
}

export function float_to_span(d: number): Ptr {
	const _r = callPtr('float_to_span_w', ['number'], [d]);
	checkMeosError();
	return _r;
}

export function float_to_spanset(d: number): Ptr {
	const _r = callPtr('float_to_spanset_w', ['number'], [d]);
	checkMeosError();
	return _r;
}

export function floatset_to_intset(s: Ptr): Ptr {
	const _r = callPtr('floatset_to_intset_w', [ptrArgType()], [ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function floatspan_to_intspan(s: Ptr): Ptr {
	const _r = callPtr('floatspan_to_intspan_w', [ptrArgType()], [ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function floatspanset_to_intspanset(ss: Ptr): Ptr {
	const _r = callPtr('floatspanset_to_intspanset_w', [ptrArgType()], [ptrArgVal(ss)]);
	checkMeosError();
	return _r;
}

export function int_to_set(i: number): Ptr {
	const _r = callPtr('int_to_set_w', ['number'], [i]);
	checkMeosError();
	return _r;
}

export function int_to_span(i: number): Ptr {
	const _r = callPtr('int_to_span_w', ['number'], [i]);
	checkMeosError();
	return _r;
}

export function int_to_spanset(i: number): Ptr {
	const _r = callPtr('int_to_spanset_w', ['number'], [i]);
	checkMeosError();
	return _r;
}

export function intset_to_floatset(s: Ptr): Ptr {
	const _r = callPtr('intset_to_floatset_w', [ptrArgType()], [ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function intspan_to_floatspan(s: Ptr): Ptr {
	const _r = callPtr('intspan_to_floatspan_w', [ptrArgType()], [ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function intspanset_to_floatspanset(ss: Ptr): Ptr {
	const _r = callPtr('intspanset_to_floatspanset_w', [ptrArgType()], [ptrArgVal(ss)]);
	checkMeosError();
	return _r;
}

export function set_to_span(s: Ptr): Ptr {
	const _r = callPtr('set_to_span_w', [ptrArgType()], [ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function set_to_spanset(s: Ptr): Ptr {
	const _r = callPtr('set_to_spanset_w', [ptrArgType()], [ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function span_to_spanset(s: Ptr): Ptr {
	const _r = callPtr('span_to_spanset_w', [ptrArgType()], [ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function text_to_set(txt: string): Ptr {
	const _r = callPtr('text_to_set_w', ['string'], [txt]);
	checkMeosError();
	return _r;
}

export function timestamptz_to_set(t: TimestampTz): Ptr {
	const _r = callPtr('timestamptz_to_set_w', ['bigint'], [BigInt(t)]);
	checkMeosError();
	return _r;
}

export function timestamptz_to_span(t: TimestampTz): Ptr {
	const _r = callPtr('timestamptz_to_span_w', ['bigint'], [BigInt(t)]);
	checkMeosError();
	return _r;
}

export function timestamptz_to_spanset(t: TimestampTz): Ptr {
	const _r = callPtr('timestamptz_to_spanset_w', ['bigint'], [BigInt(t)]);
	checkMeosError();
	return _r;
}

export function tstzset_to_dateset(s: Ptr): Ptr {
	const _r = callPtr('tstzset_to_dateset_w', [ptrArgType()], [ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function tstzspan_to_datespan(s: Ptr): Ptr {
	const _r = callPtr('tstzspan_to_datespan_w', [ptrArgType()], [ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function tstzspanset_to_datespanset(ss: Ptr): Ptr {
	const _r = callPtr('tstzspanset_to_datespanset_w', [ptrArgType()], [ptrArgVal(ss)]);
	checkMeosError();
	return _r;
}

export function bigintset_end_value(s: Ptr): number {
	const _r = Number(call<bigint>('bigintset_end_value_w', 'bigint', [ptrArgType()], [ptrArgVal(s)]));
	checkMeosError();
	return _r;
}

export function bigintset_start_value(s: Ptr): number {
	const _r = Number(call<bigint>('bigintset_start_value_w', 'bigint', [ptrArgType()], [ptrArgVal(s)]));
	checkMeosError();
	return _r;
}

export function bigintset_value_n(s: Ptr, n: number): number {
	const _r = Number(call<bigint>('bigintset_value_n_w', 'bigint', [ptrArgType(), 'number'], [ptrArgVal(s), n]));
	checkMeosError();
	return _r;
}

export function bigintset_values(s: Ptr): Ptr {
	const _r = callPtr('bigintset_values_w', [ptrArgType()], [ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function bigintspan_lower(s: Ptr): number {
	const _r = Number(call<bigint>('bigintspan_lower_w', 'bigint', [ptrArgType()], [ptrArgVal(s)]));
	checkMeosError();
	return _r;
}

export function bigintspan_upper(s: Ptr): number {
	const _r = Number(call<bigint>('bigintspan_upper_w', 'bigint', [ptrArgType()], [ptrArgVal(s)]));
	checkMeosError();
	return _r;
}

export function bigintspan_width(s: Ptr): number {
	const _r = Number(call<bigint>('bigintspan_width_w', 'bigint', [ptrArgType()], [ptrArgVal(s)]));
	checkMeosError();
	return _r;
}

export function bigintspanset_lower(ss: Ptr): number {
	const _r = Number(call<bigint>('bigintspanset_lower_w', 'bigint', [ptrArgType()], [ptrArgVal(ss)]));
	checkMeosError();
	return _r;
}

export function bigintspanset_upper(ss: Ptr): number {
	const _r = Number(call<bigint>('bigintspanset_upper_w', 'bigint', [ptrArgType()], [ptrArgVal(ss)]));
	checkMeosError();
	return _r;
}

export function bigintspanset_width(ss: Ptr, boundspan: boolean): number {
	const _r = Number(call<bigint>('bigintspanset_width_w', 'bigint', [ptrArgType(), 'number'], [ptrArgVal(ss), boundspan ? 1 : 0]));
	checkMeosError();
	return _r;
}

export function dateset_end_value(s: Ptr): DateADT {
	const _r = call<DateADT>('dateset_end_value_w', 'number', [ptrArgType()], [ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function dateset_start_value(s: Ptr): DateADT {
	const _r = call<DateADT>('dateset_start_value_w', 'number', [ptrArgType()], [ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function dateset_value_n(s: Ptr, n: number): DateADT {
	const _r = call<DateADT>('dateset_value_n_w', 'number', [ptrArgType(), 'number'], [ptrArgVal(s), n]);
	checkMeosError();
	return _r;
}

export function dateset_values(s: Ptr): Ptr {
	const _r = callPtr('dateset_values_w', [ptrArgType()], [ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function datespan_duration(s: Ptr): Ptr {
	const _r = callPtr('datespan_duration_w', [ptrArgType()], [ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function datespan_lower(s: Ptr): DateADT {
	const _r = call<DateADT>('datespan_lower_w', 'number', [ptrArgType()], [ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function datespan_upper(s: Ptr): DateADT {
	const _r = call<DateADT>('datespan_upper_w', 'number', [ptrArgType()], [ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function datespanset_date_n(ss: Ptr, n: number): DateADT {
	const _r = call<DateADT>('datespanset_date_n_w', 'number', [ptrArgType(), 'number'], [ptrArgVal(ss), n]);
	checkMeosError();
	return _r;
}

export function datespanset_dates(ss: Ptr): Ptr {
	const _r = callPtr('datespanset_dates_w', [ptrArgType()], [ptrArgVal(ss)]);
	checkMeosError();
	return _r;
}

export function datespanset_duration(ss: Ptr, boundspan: boolean): Ptr {
	const _r = callPtr('datespanset_duration_w', [ptrArgType(), 'number'], [ptrArgVal(ss), boundspan ? 1 : 0]);
	checkMeosError();
	return _r;
}

export function datespanset_end_date(ss: Ptr): DateADT {
	const _r = call<DateADT>('datespanset_end_date_w', 'number', [ptrArgType()], [ptrArgVal(ss)]);
	checkMeosError();
	return _r;
}

export function datespanset_num_dates(ss: Ptr): number {
	const _r = call<number>('datespanset_num_dates_w', 'number', [ptrArgType()], [ptrArgVal(ss)]);
	checkMeosError();
	return _r;
}

export function datespanset_start_date(ss: Ptr): DateADT {
	const _r = call<DateADT>('datespanset_start_date_w', 'number', [ptrArgType()], [ptrArgVal(ss)]);
	checkMeosError();
	return _r;
}

export function floatset_end_value(s: Ptr): number {
	const _r = call<number>('floatset_end_value_w', 'number', [ptrArgType()], [ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function floatset_start_value(s: Ptr): number {
	const _r = call<number>('floatset_start_value_w', 'number', [ptrArgType()], [ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function floatset_value_n(s: Ptr, n: number): number {
	const _r = call<number>('floatset_value_n_w', 'number', [ptrArgType(), 'number'], [ptrArgVal(s), n]);
	checkMeosError();
	return _r;
}

export function floatset_values(s: Ptr): Ptr {
	const _r = callPtr('floatset_values_w', [ptrArgType()], [ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function floatspan_lower(s: Ptr): number {
	const _r = call<number>('floatspan_lower_w', 'number', [ptrArgType()], [ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function floatspan_upper(s: Ptr): number {
	const _r = call<number>('floatspan_upper_w', 'number', [ptrArgType()], [ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function floatspan_width(s: Ptr): number {
	const _r = call<number>('floatspan_width_w', 'number', [ptrArgType()], [ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function floatspanset_lower(ss: Ptr): number {
	const _r = call<number>('floatspanset_lower_w', 'number', [ptrArgType()], [ptrArgVal(ss)]);
	checkMeosError();
	return _r;
}

export function floatspanset_upper(ss: Ptr): number {
	const _r = call<number>('floatspanset_upper_w', 'number', [ptrArgType()], [ptrArgVal(ss)]);
	checkMeosError();
	return _r;
}

export function floatspanset_width(ss: Ptr, boundspan: boolean): number {
	const _r = call<number>('floatspanset_width_w', 'number', [ptrArgType(), 'number'], [ptrArgVal(ss), boundspan ? 1 : 0]);
	checkMeosError();
	return _r;
}

export function intset_end_value(s: Ptr): number {
	const _r = call<number>('intset_end_value_w', 'number', [ptrArgType()], [ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function intset_start_value(s: Ptr): number {
	const _r = call<number>('intset_start_value_w', 'number', [ptrArgType()], [ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function intset_value_n(s: Ptr, n: number): number {
	const _r = call<number>('intset_value_n_w', 'number', [ptrArgType(), 'number'], [ptrArgVal(s), n]);
	checkMeosError();
	return _r;
}

export function intset_values(s: Ptr): Ptr {
	const _r = callPtr('intset_values_w', [ptrArgType()], [ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function intspan_lower(s: Ptr): number {
	const _r = call<number>('intspan_lower_w', 'number', [ptrArgType()], [ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function intspan_upper(s: Ptr): number {
	const _r = call<number>('intspan_upper_w', 'number', [ptrArgType()], [ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function intspan_width(s: Ptr): number {
	const _r = call<number>('intspan_width_w', 'number', [ptrArgType()], [ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function intspanset_lower(ss: Ptr): number {
	const _r = call<number>('intspanset_lower_w', 'number', [ptrArgType()], [ptrArgVal(ss)]);
	checkMeosError();
	return _r;
}

export function intspanset_upper(ss: Ptr): number {
	const _r = call<number>('intspanset_upper_w', 'number', [ptrArgType()], [ptrArgVal(ss)]);
	checkMeosError();
	return _r;
}

export function intspanset_width(ss: Ptr, boundspan: boolean): number {
	const _r = call<number>('intspanset_width_w', 'number', [ptrArgType(), 'number'], [ptrArgVal(ss), boundspan ? 1 : 0]);
	checkMeosError();
	return _r;
}

export function set_hash(s: Ptr): number {
	const _r = call<number>('set_hash_w', 'number', [ptrArgType()], [ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function set_hash_extended(s: Ptr, seed: number): number {
	const _r = Number(call<bigint>('set_hash_extended_w', 'bigint', [ptrArgType(), 'bigint'], [ptrArgVal(s), BigInt(seed)]));
	checkMeosError();
	return _r;
}

export function set_num_values(s: Ptr): number {
	const _r = call<number>('set_num_values_w', 'number', [ptrArgType()], [ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function span_hash(s: Ptr): number {
	const _r = call<number>('span_hash_w', 'number', [ptrArgType()], [ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function span_hash_extended(s: Ptr, seed: number): number {
	const _r = Number(call<bigint>('span_hash_extended_w', 'bigint', [ptrArgType(), 'bigint'], [ptrArgVal(s), BigInt(seed)]));
	checkMeosError();
	return _r;
}

export function span_lower_inc(s: Ptr): boolean {
	const _r = call<number>('span_lower_inc_w', 'number', [ptrArgType()], [ptrArgVal(s)]) !== 0;
	checkMeosError();
	return _r;
}

export function span_upper_inc(s: Ptr): boolean {
	const _r = call<number>('span_upper_inc_w', 'number', [ptrArgType()], [ptrArgVal(s)]) !== 0;
	checkMeosError();
	return _r;
}

export function spanset_end_span(ss: Ptr): Ptr {
	const _r = callPtr('spanset_end_span_w', [ptrArgType()], [ptrArgVal(ss)]);
	checkMeosError();
	return _r;
}

export function spanset_hash(ss: Ptr): number {
	const _r = call<number>('spanset_hash_w', 'number', [ptrArgType()], [ptrArgVal(ss)]);
	checkMeosError();
	return _r;
}

export function spanset_hash_extended(ss: Ptr, seed: number): number {
	const _r = Number(call<bigint>('spanset_hash_extended_w', 'bigint', [ptrArgType(), 'bigint'], [ptrArgVal(ss), BigInt(seed)]));
	checkMeosError();
	return _r;
}

export function spanset_lower_inc(ss: Ptr): boolean {
	const _r = call<number>('spanset_lower_inc_w', 'number', [ptrArgType()], [ptrArgVal(ss)]) !== 0;
	checkMeosError();
	return _r;
}

export function spanset_num_spans(ss: Ptr): number {
	const _r = call<number>('spanset_num_spans_w', 'number', [ptrArgType()], [ptrArgVal(ss)]);
	checkMeosError();
	return _r;
}

export function spanset_span(ss: Ptr): Ptr {
	const _r = callPtr('spanset_span_w', [ptrArgType()], [ptrArgVal(ss)]);
	checkMeosError();
	return _r;
}

export function spanset_span_n(ss: Ptr, i: number): Ptr {
	const _r = callPtr('spanset_span_n_w', [ptrArgType(), 'number'], [ptrArgVal(ss), i]);
	checkMeosError();
	return _r;
}

export function spanset_spanarr(ss: Ptr): Ptr {
	const _r = callPtr('spanset_spanarr_w', [ptrArgType()], [ptrArgVal(ss)]);
	checkMeosError();
	return _r;
}

export function spanset_start_span(ss: Ptr): Ptr {
	const _r = callPtr('spanset_start_span_w', [ptrArgType()], [ptrArgVal(ss)]);
	checkMeosError();
	return _r;
}

export function spanset_upper_inc(ss: Ptr): boolean {
	const _r = call<number>('spanset_upper_inc_w', 'number', [ptrArgType()], [ptrArgVal(ss)]) !== 0;
	checkMeosError();
	return _r;
}

export function textset_end_value(s: Ptr): string {
	const _r = call<string>('textset_end_value_w', 'string', [ptrArgType()], [ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function textset_start_value(s: Ptr): string {
	const _r = call<string>('textset_start_value_w', 'string', [ptrArgType()], [ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function textset_values(s: Ptr): Ptr {
	const _r = callPtr('textset_values_w', [ptrArgType()], [ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function tstzset_values(s: Ptr): Ptr {
	const _r = callPtr('tstzset_values_w', [ptrArgType()], [ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function tstzspan_duration(s: Ptr): Ptr {
	const _r = callPtr('tstzspan_duration_w', [ptrArgType()], [ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function tstzspanset_num_timestamps(ss: Ptr): number {
	const _r = call<number>('tstzspanset_num_timestamps_w', 'number', [ptrArgType()], [ptrArgVal(ss)]);
	checkMeosError();
	return _r;
}

export function tstzspanset_timestamps(ss: Ptr): Ptr {
	const _r = callPtr('tstzspanset_timestamps_w', [ptrArgType()], [ptrArgVal(ss)]);
	checkMeosError();
	return _r;
}

export function bigintset_shift_scale(s: Ptr, shift: number, width: number, hasshift: boolean, haswidth: boolean): Ptr {
	const _r = callPtr('bigintset_shift_scale_w', [ptrArgType(), 'bigint', 'bigint', 'number', 'number'], [ptrArgVal(s), BigInt(shift), BigInt(width), hasshift ? 1 : 0, haswidth ? 1 : 0]);
	checkMeosError();
	return _r;
}

export function bigintspan_shift_scale(s: Ptr, shift: number, width: number, hasshift: boolean, haswidth: boolean): Ptr {
	const _r = callPtr('bigintspan_shift_scale_w', [ptrArgType(), 'bigint', 'bigint', 'number', 'number'], [ptrArgVal(s), BigInt(shift), BigInt(width), hasshift ? 1 : 0, haswidth ? 1 : 0]);
	checkMeosError();
	return _r;
}

export function bigintspanset_shift_scale(ss: Ptr, shift: number, width: number, hasshift: boolean, haswidth: boolean): Ptr {
	const _r = callPtr('bigintspanset_shift_scale_w', [ptrArgType(), 'bigint', 'bigint', 'number', 'number'], [ptrArgVal(ss), BigInt(shift), BigInt(width), hasshift ? 1 : 0, haswidth ? 1 : 0]);
	checkMeosError();
	return _r;
}

export function dateset_shift_scale(s: Ptr, shift: number, width: number, hasshift: boolean, haswidth: boolean): Ptr {
	const _r = callPtr('dateset_shift_scale_w', [ptrArgType(), 'number', 'number', 'number', 'number'], [ptrArgVal(s), shift, width, hasshift ? 1 : 0, haswidth ? 1 : 0]);
	checkMeosError();
	return _r;
}

export function datespan_shift_scale(s: Ptr, shift: number, width: number, hasshift: boolean, haswidth: boolean): Ptr {
	const _r = callPtr('datespan_shift_scale_w', [ptrArgType(), 'number', 'number', 'number', 'number'], [ptrArgVal(s), shift, width, hasshift ? 1 : 0, haswidth ? 1 : 0]);
	checkMeosError();
	return _r;
}

export function datespanset_shift_scale(ss: Ptr, shift: number, width: number, hasshift: boolean, haswidth: boolean): Ptr {
	const _r = callPtr('datespanset_shift_scale_w', [ptrArgType(), 'number', 'number', 'number', 'number'], [ptrArgVal(ss), shift, width, hasshift ? 1 : 0, haswidth ? 1 : 0]);
	checkMeosError();
	return _r;
}

export function floatset_ceil(s: Ptr): Ptr {
	const _r = callPtr('floatset_ceil_w', [ptrArgType()], [ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function floatset_degrees(s: Ptr, normalize: boolean): Ptr {
	const _r = callPtr('floatset_degrees_w', [ptrArgType(), 'number'], [ptrArgVal(s), normalize ? 1 : 0]);
	checkMeosError();
	return _r;
}

export function floatset_floor(s: Ptr): Ptr {
	const _r = callPtr('floatset_floor_w', [ptrArgType()], [ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function floatset_radians(s: Ptr): Ptr {
	const _r = callPtr('floatset_radians_w', [ptrArgType()], [ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function floatset_shift_scale(s: Ptr, shift: number, width: number, hasshift: boolean, haswidth: boolean): Ptr {
	const _r = callPtr('floatset_shift_scale_w', [ptrArgType(), 'number', 'number', 'number', 'number'], [ptrArgVal(s), shift, width, hasshift ? 1 : 0, haswidth ? 1 : 0]);
	checkMeosError();
	return _r;
}

export function floatspan_ceil(s: Ptr): Ptr {
	const _r = callPtr('floatspan_ceil_w', [ptrArgType()], [ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function floatspan_degrees(s: Ptr, normalize: boolean): Ptr {
	const _r = callPtr('floatspan_degrees_w', [ptrArgType(), 'number'], [ptrArgVal(s), normalize ? 1 : 0]);
	checkMeosError();
	return _r;
}

export function floatspan_floor(s: Ptr): Ptr {
	const _r = callPtr('floatspan_floor_w', [ptrArgType()], [ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function floatspan_radians(s: Ptr): Ptr {
	const _r = callPtr('floatspan_radians_w', [ptrArgType()], [ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function floatspan_round(s: Ptr, maxdd: number): Ptr {
	const _r = callPtr('floatspan_round_w', [ptrArgType(), 'number'], [ptrArgVal(s), maxdd]);
	checkMeosError();
	return _r;
}

export function floatspan_shift_scale(s: Ptr, shift: number, width: number, hasshift: boolean, haswidth: boolean): Ptr {
	const _r = callPtr('floatspan_shift_scale_w', [ptrArgType(), 'number', 'number', 'number', 'number'], [ptrArgVal(s), shift, width, hasshift ? 1 : 0, haswidth ? 1 : 0]);
	checkMeosError();
	return _r;
}

export function floatspanset_ceil(ss: Ptr): Ptr {
	const _r = callPtr('floatspanset_ceil_w', [ptrArgType()], [ptrArgVal(ss)]);
	checkMeosError();
	return _r;
}

export function floatspanset_floor(ss: Ptr): Ptr {
	const _r = callPtr('floatspanset_floor_w', [ptrArgType()], [ptrArgVal(ss)]);
	checkMeosError();
	return _r;
}

export function floatspanset_degrees(ss: Ptr, normalize: boolean): Ptr {
	const _r = callPtr('floatspanset_degrees_w', [ptrArgType(), 'number'], [ptrArgVal(ss), normalize ? 1 : 0]);
	checkMeosError();
	return _r;
}

export function floatspanset_radians(ss: Ptr): Ptr {
	const _r = callPtr('floatspanset_radians_w', [ptrArgType()], [ptrArgVal(ss)]);
	checkMeosError();
	return _r;
}

export function floatspanset_round(ss: Ptr, maxdd: number): Ptr {
	const _r = callPtr('floatspanset_round_w', [ptrArgType(), 'number'], [ptrArgVal(ss), maxdd]);
	checkMeosError();
	return _r;
}

export function floatspanset_shift_scale(ss: Ptr, shift: number, width: number, hasshift: boolean, haswidth: boolean): Ptr {
	const _r = callPtr('floatspanset_shift_scale_w', [ptrArgType(), 'number', 'number', 'number', 'number'], [ptrArgVal(ss), shift, width, hasshift ? 1 : 0, haswidth ? 1 : 0]);
	checkMeosError();
	return _r;
}

export function intset_shift_scale(s: Ptr, shift: number, width: number, hasshift: boolean, haswidth: boolean): Ptr {
	const _r = callPtr('intset_shift_scale_w', [ptrArgType(), 'number', 'number', 'number', 'number'], [ptrArgVal(s), shift, width, hasshift ? 1 : 0, haswidth ? 1 : 0]);
	checkMeosError();
	return _r;
}

export function intspan_shift_scale(s: Ptr, shift: number, width: number, hasshift: boolean, haswidth: boolean): Ptr {
	const _r = callPtr('intspan_shift_scale_w', [ptrArgType(), 'number', 'number', 'number', 'number'], [ptrArgVal(s), shift, width, hasshift ? 1 : 0, haswidth ? 1 : 0]);
	checkMeosError();
	return _r;
}

export function intspanset_shift_scale(ss: Ptr, shift: number, width: number, hasshift: boolean, haswidth: boolean): Ptr {
	const _r = callPtr('intspanset_shift_scale_w', [ptrArgType(), 'number', 'number', 'number', 'number'], [ptrArgVal(ss), shift, width, hasshift ? 1 : 0, haswidth ? 1 : 0]);
	checkMeosError();
	return _r;
}

export function tstzspan_expand(s: Ptr, interv: Ptr): Ptr {
	const _r = callPtr('tstzspan_expand_w', [ptrArgType(), ptrArgType()], [ptrArgVal(s), ptrArgVal(interv)]);
	checkMeosError();
	return _r;
}

export function set_round(s: Ptr, maxdd: number): Ptr {
	const _r = callPtr('set_round_w', [ptrArgType(), 'number'], [ptrArgVal(s), maxdd]);
	checkMeosError();
	return _r;
}

export function textcat_text_textset(txt: string, s: Ptr): Ptr {
	const _r = callPtr('textcat_text_textset_w', ['string', ptrArgType()], [txt, ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function textcat_textset_text(s: Ptr, txt: string): Ptr {
	const _r = callPtr('textcat_textset_text_w', [ptrArgType(), 'string'], [ptrArgVal(s), txt]);
	checkMeosError();
	return _r;
}

export function textset_initcap(s: Ptr): Ptr {
	const _r = callPtr('textset_initcap_w', [ptrArgType()], [ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function textset_lower(s: Ptr): Ptr {
	const _r = callPtr('textset_lower_w', [ptrArgType()], [ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function textset_upper(s: Ptr): Ptr {
	const _r = callPtr('textset_upper_w', [ptrArgType()], [ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function timestamptz_tprecision(t: TimestampTz, duration: Ptr, torigin: TimestampTz): TimestampTz {
	const _r = call<TimestampTz>('timestamptz_tprecision_w', 'number', ['bigint', ptrArgType(), 'bigint'], [BigInt(t), ptrArgVal(duration), BigInt(torigin)]);
	checkMeosError();
	return _r;
}

export function tstzset_shift_scale(s: Ptr, shift: Ptr, duration: Ptr): Ptr {
	const _r = callPtr('tstzset_shift_scale_w', [ptrArgType(), ptrArgType(), ptrArgType()], [ptrArgVal(s), ptrArgVal(shift), ptrArgVal(duration)]);
	checkMeosError();
	return _r;
}

export function tstzset_tprecision(s: Ptr, duration: Ptr, torigin: TimestampTz): Ptr {
	const _r = callPtr('tstzset_tprecision_w', [ptrArgType(), ptrArgType(), 'bigint'], [ptrArgVal(s), ptrArgVal(duration), BigInt(torigin)]);
	checkMeosError();
	return _r;
}

export function tstzspan_shift_scale(s: Ptr, shift: Ptr, duration: Ptr): Ptr {
	const _r = callPtr('tstzspan_shift_scale_w', [ptrArgType(), ptrArgType(), ptrArgType()], [ptrArgVal(s), ptrArgVal(shift), ptrArgVal(duration)]);
	checkMeosError();
	return _r;
}

export function tstzspan_tprecision(s: Ptr, duration: Ptr, torigin: TimestampTz): Ptr {
	const _r = callPtr('tstzspan_tprecision_w', [ptrArgType(), ptrArgType(), 'bigint'], [ptrArgVal(s), ptrArgVal(duration), BigInt(torigin)]);
	checkMeosError();
	return _r;
}

export function tstzspanset_shift_scale(ss: Ptr, shift: Ptr, duration: Ptr): Ptr {
	const _r = callPtr('tstzspanset_shift_scale_w', [ptrArgType(), ptrArgType(), ptrArgType()], [ptrArgVal(ss), ptrArgVal(shift), ptrArgVal(duration)]);
	checkMeosError();
	return _r;
}

export function tstzspanset_tprecision(ss: Ptr, duration: Ptr, torigin: TimestampTz): Ptr {
	const _r = callPtr('tstzspanset_tprecision_w', [ptrArgType(), ptrArgType(), 'bigint'], [ptrArgVal(ss), ptrArgVal(duration), BigInt(torigin)]);
	checkMeosError();
	return _r;
}

export function set_cmp(s1: Ptr, s2: Ptr): number {
	const _r = call<number>('set_cmp_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(s1), ptrArgVal(s2)]);
	checkMeosError();
	return _r;
}

export function set_eq(s1: Ptr, s2: Ptr): boolean {
	const _r = call<number>('set_eq_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(s1), ptrArgVal(s2)]) !== 0;
	checkMeosError();
	return _r;
}

export function set_ge(s1: Ptr, s2: Ptr): boolean {
	const _r = call<number>('set_ge_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(s1), ptrArgVal(s2)]) !== 0;
	checkMeosError();
	return _r;
}

export function set_gt(s1: Ptr, s2: Ptr): boolean {
	const _r = call<number>('set_gt_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(s1), ptrArgVal(s2)]) !== 0;
	checkMeosError();
	return _r;
}

export function set_le(s1: Ptr, s2: Ptr): boolean {
	const _r = call<number>('set_le_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(s1), ptrArgVal(s2)]) !== 0;
	checkMeosError();
	return _r;
}

export function set_lt(s1: Ptr, s2: Ptr): boolean {
	const _r = call<number>('set_lt_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(s1), ptrArgVal(s2)]) !== 0;
	checkMeosError();
	return _r;
}

export function set_ne(s1: Ptr, s2: Ptr): boolean {
	const _r = call<number>('set_ne_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(s1), ptrArgVal(s2)]) !== 0;
	checkMeosError();
	return _r;
}

export function span_cmp(s1: Ptr, s2: Ptr): number {
	const _r = call<number>('span_cmp_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(s1), ptrArgVal(s2)]);
	checkMeosError();
	return _r;
}

export function span_ge(s1: Ptr, s2: Ptr): boolean {
	const _r = call<number>('span_ge_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(s1), ptrArgVal(s2)]) !== 0;
	checkMeosError();
	return _r;
}

export function span_gt(s1: Ptr, s2: Ptr): boolean {
	const _r = call<number>('span_gt_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(s1), ptrArgVal(s2)]) !== 0;
	checkMeosError();
	return _r;
}

export function span_le(s1: Ptr, s2: Ptr): boolean {
	const _r = call<number>('span_le_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(s1), ptrArgVal(s2)]) !== 0;
	checkMeosError();
	return _r;
}

export function span_lt(s1: Ptr, s2: Ptr): boolean {
	const _r = call<number>('span_lt_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(s1), ptrArgVal(s2)]) !== 0;
	checkMeosError();
	return _r;
}

export function spanset_cmp(ss1: Ptr, ss2: Ptr): number {
	const _r = call<number>('spanset_cmp_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(ss1), ptrArgVal(ss2)]);
	checkMeosError();
	return _r;
}

export function spanset_eq(ss1: Ptr, ss2: Ptr): boolean {
	const _r = call<number>('spanset_eq_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(ss1), ptrArgVal(ss2)]) !== 0;
	checkMeosError();
	return _r;
}

export function spanset_ge(ss1: Ptr, ss2: Ptr): boolean {
	const _r = call<number>('spanset_ge_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(ss1), ptrArgVal(ss2)]) !== 0;
	checkMeosError();
	return _r;
}

export function spanset_gt(ss1: Ptr, ss2: Ptr): boolean {
	const _r = call<number>('spanset_gt_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(ss1), ptrArgVal(ss2)]) !== 0;
	checkMeosError();
	return _r;
}

export function spanset_le(ss1: Ptr, ss2: Ptr): boolean {
	const _r = call<number>('spanset_le_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(ss1), ptrArgVal(ss2)]) !== 0;
	checkMeosError();
	return _r;
}

export function spanset_lt(ss1: Ptr, ss2: Ptr): boolean {
	const _r = call<number>('spanset_lt_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(ss1), ptrArgVal(ss2)]) !== 0;
	checkMeosError();
	return _r;
}

export function spanset_ne(ss1: Ptr, ss2: Ptr): boolean {
	const _r = call<number>('spanset_ne_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(ss1), ptrArgVal(ss2)]) !== 0;
	checkMeosError();
	return _r;
}

export function set_spans(s: Ptr): Ptr {
	const _r = callPtr('set_spans_w', [ptrArgType()], [ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function set_split_each_n_spans(s: Ptr, elems_per_span: number, count: Ptr): Ptr {
	const _r = callPtr('set_split_each_n_spans_w', [ptrArgType(), 'number', ptrArgType()], [ptrArgVal(s), elems_per_span, ptrArgVal(count)]);
	checkMeosError();
	return _r;
}

export function set_split_n_spans(s: Ptr, span_count: number, count: Ptr): Ptr {
	const _r = callPtr('set_split_n_spans_w', [ptrArgType(), 'number', ptrArgType()], [ptrArgVal(s), span_count, ptrArgVal(count)]);
	checkMeosError();
	return _r;
}

export function spanset_spans(ss: Ptr): Ptr {
	const _r = callPtr('spanset_spans_w', [ptrArgType()], [ptrArgVal(ss)]);
	checkMeosError();
	return _r;
}

export function spanset_split_each_n_spans(ss: Ptr, elems_per_span: number, count: Ptr): Ptr {
	const _r = callPtr('spanset_split_each_n_spans_w', [ptrArgType(), 'number', ptrArgType()], [ptrArgVal(ss), elems_per_span, ptrArgVal(count)]);
	checkMeosError();
	return _r;
}

export function spanset_split_n_spans(ss: Ptr, span_count: number, count: Ptr): Ptr {
	const _r = callPtr('spanset_split_n_spans_w', [ptrArgType(), 'number', ptrArgType()], [ptrArgVal(ss), span_count, ptrArgVal(count)]);
	checkMeosError();
	return _r;
}

export function adjacent_span_bigint(s: Ptr, i: number): boolean {
	const _r = call<number>('adjacent_span_bigint_w', 'number', [ptrArgType(), 'bigint'], [ptrArgVal(s), BigInt(i)]) !== 0;
	checkMeosError();
	return _r;
}

export function adjacent_span_date(s: Ptr, d: DateADT): boolean {
	const _r = call<number>('adjacent_span_date_w', 'number', [ptrArgType(), 'number'], [ptrArgVal(s), d]) !== 0;
	checkMeosError();
	return _r;
}

export function adjacent_span_float(s: Ptr, d: number): boolean {
	const _r = call<number>('adjacent_span_float_w', 'number', [ptrArgType(), 'number'], [ptrArgVal(s), d]) !== 0;
	checkMeosError();
	return _r;
}

export function adjacent_span_int(s: Ptr, i: number): boolean {
	const _r = call<number>('adjacent_span_int_w', 'number', [ptrArgType(), 'number'], [ptrArgVal(s), i]) !== 0;
	checkMeosError();
	return _r;
}

export function adjacent_span_spanset(s: Ptr, ss: Ptr): boolean {
	const _r = call<number>('adjacent_span_spanset_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(s), ptrArgVal(ss)]) !== 0;
	checkMeosError();
	return _r;
}

export function adjacent_span_timestamptz(s: Ptr, t: TimestampTz): boolean {
	const _r = call<number>('adjacent_span_timestamptz_w', 'number', [ptrArgType(), 'bigint'], [ptrArgVal(s), BigInt(t)]) !== 0;
	checkMeosError();
	return _r;
}

export function adjacent_spanset_bigint(ss: Ptr, i: number): boolean {
	const _r = call<number>('adjacent_spanset_bigint_w', 'number', [ptrArgType(), 'bigint'], [ptrArgVal(ss), BigInt(i)]) !== 0;
	checkMeosError();
	return _r;
}

export function adjacent_spanset_date(ss: Ptr, d: DateADT): boolean {
	const _r = call<number>('adjacent_spanset_date_w', 'number', [ptrArgType(), 'number'], [ptrArgVal(ss), d]) !== 0;
	checkMeosError();
	return _r;
}

export function adjacent_spanset_float(ss: Ptr, d: number): boolean {
	const _r = call<number>('adjacent_spanset_float_w', 'number', [ptrArgType(), 'number'], [ptrArgVal(ss), d]) !== 0;
	checkMeosError();
	return _r;
}

export function adjacent_spanset_int(ss: Ptr, i: number): boolean {
	const _r = call<number>('adjacent_spanset_int_w', 'number', [ptrArgType(), 'number'], [ptrArgVal(ss), i]) !== 0;
	checkMeosError();
	return _r;
}

export function adjacent_spanset_timestamptz(ss: Ptr, t: TimestampTz): boolean {
	const _r = call<number>('adjacent_spanset_timestamptz_w', 'number', [ptrArgType(), 'bigint'], [ptrArgVal(ss), BigInt(t)]) !== 0;
	checkMeosError();
	return _r;
}

export function adjacent_spanset_span(ss: Ptr, s: Ptr): boolean {
	const _r = call<number>('adjacent_spanset_span_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(ss), ptrArgVal(s)]) !== 0;
	checkMeosError();
	return _r;
}

export function adjacent_spanset_spanset(ss1: Ptr, ss2: Ptr): boolean {
	const _r = call<number>('adjacent_spanset_spanset_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(ss1), ptrArgVal(ss2)]) !== 0;
	checkMeosError();
	return _r;
}

export function contained_bigint_set(i: number, s: Ptr): boolean {
	const _r = call<number>('contained_bigint_set_w', 'number', ['bigint', ptrArgType()], [BigInt(i), ptrArgVal(s)]) !== 0;
	checkMeosError();
	return _r;
}

export function contained_bigint_span(i: number, s: Ptr): boolean {
	const _r = call<number>('contained_bigint_span_w', 'number', ['bigint', ptrArgType()], [BigInt(i), ptrArgVal(s)]) !== 0;
	checkMeosError();
	return _r;
}

export function contained_bigint_spanset(i: number, ss: Ptr): boolean {
	const _r = call<number>('contained_bigint_spanset_w', 'number', ['bigint', ptrArgType()], [BigInt(i), ptrArgVal(ss)]) !== 0;
	checkMeosError();
	return _r;
}

export function contained_date_set(d: DateADT, s: Ptr): boolean {
	const _r = call<number>('contained_date_set_w', 'number', ['number', ptrArgType()], [d, ptrArgVal(s)]) !== 0;
	checkMeosError();
	return _r;
}

export function contained_date_span(d: DateADT, s: Ptr): boolean {
	const _r = call<number>('contained_date_span_w', 'number', ['number', ptrArgType()], [d, ptrArgVal(s)]) !== 0;
	checkMeosError();
	return _r;
}

export function contained_date_spanset(d: DateADT, ss: Ptr): boolean {
	const _r = call<number>('contained_date_spanset_w', 'number', ['number', ptrArgType()], [d, ptrArgVal(ss)]) !== 0;
	checkMeosError();
	return _r;
}

export function contained_float_set(d: number, s: Ptr): boolean {
	const _r = call<number>('contained_float_set_w', 'number', ['number', ptrArgType()], [d, ptrArgVal(s)]) !== 0;
	checkMeosError();
	return _r;
}

export function contained_float_span(d: number, s: Ptr): boolean {
	const _r = call<number>('contained_float_span_w', 'number', ['number', ptrArgType()], [d, ptrArgVal(s)]) !== 0;
	checkMeosError();
	return _r;
}

export function contained_float_spanset(d: number, ss: Ptr): boolean {
	const _r = call<number>('contained_float_spanset_w', 'number', ['number', ptrArgType()], [d, ptrArgVal(ss)]) !== 0;
	checkMeosError();
	return _r;
}

export function contained_int_set(i: number, s: Ptr): boolean {
	const _r = call<number>('contained_int_set_w', 'number', ['number', ptrArgType()], [i, ptrArgVal(s)]) !== 0;
	checkMeosError();
	return _r;
}

export function contained_int_span(i: number, s: Ptr): boolean {
	const _r = call<number>('contained_int_span_w', 'number', ['number', ptrArgType()], [i, ptrArgVal(s)]) !== 0;
	checkMeosError();
	return _r;
}

export function contained_int_spanset(i: number, ss: Ptr): boolean {
	const _r = call<number>('contained_int_spanset_w', 'number', ['number', ptrArgType()], [i, ptrArgVal(ss)]) !== 0;
	checkMeosError();
	return _r;
}

export function contained_set_set(s1: Ptr, s2: Ptr): boolean {
	const _r = call<number>('contained_set_set_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(s1), ptrArgVal(s2)]) !== 0;
	checkMeosError();
	return _r;
}

export function contained_span_span(s1: Ptr, s2: Ptr): boolean {
	const _r = call<number>('contained_span_span_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(s1), ptrArgVal(s2)]) !== 0;
	checkMeosError();
	return _r;
}

export function contained_span_spanset(s: Ptr, ss: Ptr): boolean {
	const _r = call<number>('contained_span_spanset_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(s), ptrArgVal(ss)]) !== 0;
	checkMeosError();
	return _r;
}

export function contained_spanset_span(ss: Ptr, s: Ptr): boolean {
	const _r = call<number>('contained_spanset_span_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(ss), ptrArgVal(s)]) !== 0;
	checkMeosError();
	return _r;
}

export function contained_spanset_spanset(ss1: Ptr, ss2: Ptr): boolean {
	const _r = call<number>('contained_spanset_spanset_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(ss1), ptrArgVal(ss2)]) !== 0;
	checkMeosError();
	return _r;
}

export function contained_text_set(txt: string, s: Ptr): boolean {
	const _r = call<number>('contained_text_set_w', 'number', ['string', ptrArgType()], [txt, ptrArgVal(s)]) !== 0;
	checkMeosError();
	return _r;
}

export function contained_timestamptz_set(t: TimestampTz, s: Ptr): boolean {
	const _r = call<number>('contained_timestamptz_set_w', 'number', ['bigint', ptrArgType()], [BigInt(t), ptrArgVal(s)]) !== 0;
	checkMeosError();
	return _r;
}

export function contained_timestamptz_span(t: TimestampTz, s: Ptr): boolean {
	const _r = call<number>('contained_timestamptz_span_w', 'number', ['bigint', ptrArgType()], [BigInt(t), ptrArgVal(s)]) !== 0;
	checkMeosError();
	return _r;
}

export function contained_timestamptz_spanset(t: TimestampTz, ss: Ptr): boolean {
	const _r = call<number>('contained_timestamptz_spanset_w', 'number', ['bigint', ptrArgType()], [BigInt(t), ptrArgVal(ss)]) !== 0;
	checkMeosError();
	return _r;
}

export function contains_set_bigint(s: Ptr, i: number): boolean {
	const _r = call<number>('contains_set_bigint_w', 'number', [ptrArgType(), 'bigint'], [ptrArgVal(s), BigInt(i)]) !== 0;
	checkMeosError();
	return _r;
}

export function contains_set_date(s: Ptr, d: DateADT): boolean {
	const _r = call<number>('contains_set_date_w', 'number', [ptrArgType(), 'number'], [ptrArgVal(s), d]) !== 0;
	checkMeosError();
	return _r;
}

export function contains_set_float(s: Ptr, d: number): boolean {
	const _r = call<number>('contains_set_float_w', 'number', [ptrArgType(), 'number'], [ptrArgVal(s), d]) !== 0;
	checkMeosError();
	return _r;
}

export function contains_set_int(s: Ptr, i: number): boolean {
	const _r = call<number>('contains_set_int_w', 'number', [ptrArgType(), 'number'], [ptrArgVal(s), i]) !== 0;
	checkMeosError();
	return _r;
}

export function contains_set_set(s1: Ptr, s2: Ptr): boolean {
	const _r = call<number>('contains_set_set_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(s1), ptrArgVal(s2)]) !== 0;
	checkMeosError();
	return _r;
}

export function contains_set_text(s: Ptr, t: string): boolean {
	const _r = call<number>('contains_set_text_w', 'number', [ptrArgType(), 'string'], [ptrArgVal(s), t]) !== 0;
	checkMeosError();
	return _r;
}

export function contains_set_timestamptz(s: Ptr, t: TimestampTz): boolean {
	const _r = call<number>('contains_set_timestamptz_w', 'number', [ptrArgType(), 'bigint'], [ptrArgVal(s), BigInt(t)]) !== 0;
	checkMeosError();
	return _r;
}

export function contains_span_bigint(s: Ptr, i: number): boolean {
	const _r = call<number>('contains_span_bigint_w', 'number', [ptrArgType(), 'bigint'], [ptrArgVal(s), BigInt(i)]) !== 0;
	checkMeosError();
	return _r;
}

export function contains_span_date(s: Ptr, d: DateADT): boolean {
	const _r = call<number>('contains_span_date_w', 'number', [ptrArgType(), 'number'], [ptrArgVal(s), d]) !== 0;
	checkMeosError();
	return _r;
}

export function contains_span_float(s: Ptr, d: number): boolean {
	const _r = call<number>('contains_span_float_w', 'number', [ptrArgType(), 'number'], [ptrArgVal(s), d]) !== 0;
	checkMeosError();
	return _r;
}

export function contains_span_int(s: Ptr, i: number): boolean {
	const _r = call<number>('contains_span_int_w', 'number', [ptrArgType(), 'number'], [ptrArgVal(s), i]) !== 0;
	checkMeosError();
	return _r;
}

export function contains_span_span(s1: Ptr, s2: Ptr): boolean {
	const _r = call<number>('contains_span_span_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(s1), ptrArgVal(s2)]) !== 0;
	checkMeosError();
	return _r;
}

export function contains_span_spanset(s: Ptr, ss: Ptr): boolean {
	const _r = call<number>('contains_span_spanset_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(s), ptrArgVal(ss)]) !== 0;
	checkMeosError();
	return _r;
}

export function contains_span_timestamptz(s: Ptr, t: TimestampTz): boolean {
	const _r = call<number>('contains_span_timestamptz_w', 'number', [ptrArgType(), 'bigint'], [ptrArgVal(s), BigInt(t)]) !== 0;
	checkMeosError();
	return _r;
}

export function contains_spanset_bigint(ss: Ptr, i: number): boolean {
	const _r = call<number>('contains_spanset_bigint_w', 'number', [ptrArgType(), 'bigint'], [ptrArgVal(ss), BigInt(i)]) !== 0;
	checkMeosError();
	return _r;
}

export function contains_spanset_date(ss: Ptr, d: DateADT): boolean {
	const _r = call<number>('contains_spanset_date_w', 'number', [ptrArgType(), 'number'], [ptrArgVal(ss), d]) !== 0;
	checkMeosError();
	return _r;
}

export function contains_spanset_float(ss: Ptr, d: number): boolean {
	const _r = call<number>('contains_spanset_float_w', 'number', [ptrArgType(), 'number'], [ptrArgVal(ss), d]) !== 0;
	checkMeosError();
	return _r;
}

export function contains_spanset_int(ss: Ptr, i: number): boolean {
	const _r = call<number>('contains_spanset_int_w', 'number', [ptrArgType(), 'number'], [ptrArgVal(ss), i]) !== 0;
	checkMeosError();
	return _r;
}

export function contains_spanset_span(ss: Ptr, s: Ptr): boolean {
	const _r = call<number>('contains_spanset_span_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(ss), ptrArgVal(s)]) !== 0;
	checkMeosError();
	return _r;
}

export function contains_spanset_spanset(ss1: Ptr, ss2: Ptr): boolean {
	const _r = call<number>('contains_spanset_spanset_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(ss1), ptrArgVal(ss2)]) !== 0;
	checkMeosError();
	return _r;
}

export function contains_spanset_timestamptz(ss: Ptr, t: TimestampTz): boolean {
	const _r = call<number>('contains_spanset_timestamptz_w', 'number', [ptrArgType(), 'bigint'], [ptrArgVal(ss), BigInt(t)]) !== 0;
	checkMeosError();
	return _r;
}

export function overlaps_set_set(s1: Ptr, s2: Ptr): boolean {
	const _r = call<number>('overlaps_set_set_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(s1), ptrArgVal(s2)]) !== 0;
	checkMeosError();
	return _r;
}

export function overlaps_span_span(s1: Ptr, s2: Ptr): boolean {
	const _r = call<number>('overlaps_span_span_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(s1), ptrArgVal(s2)]) !== 0;
	checkMeosError();
	return _r;
}

export function overlaps_span_spanset(s: Ptr, ss: Ptr): boolean {
	const _r = call<number>('overlaps_span_spanset_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(s), ptrArgVal(ss)]) !== 0;
	checkMeosError();
	return _r;
}

export function overlaps_spanset_span(ss: Ptr, s: Ptr): boolean {
	const _r = call<number>('overlaps_spanset_span_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(ss), ptrArgVal(s)]) !== 0;
	checkMeosError();
	return _r;
}

export function overlaps_spanset_spanset(ss1: Ptr, ss2: Ptr): boolean {
	const _r = call<number>('overlaps_spanset_spanset_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(ss1), ptrArgVal(ss2)]) !== 0;
	checkMeosError();
	return _r;
}

export function after_date_set(d: DateADT, s: Ptr): boolean {
	const _r = call<number>('after_date_set_w', 'number', ['number', ptrArgType()], [d, ptrArgVal(s)]) !== 0;
	checkMeosError();
	return _r;
}

export function after_date_span(d: DateADT, s: Ptr): boolean {
	const _r = call<number>('after_date_span_w', 'number', ['number', ptrArgType()], [d, ptrArgVal(s)]) !== 0;
	checkMeosError();
	return _r;
}

export function after_date_spanset(d: DateADT, ss: Ptr): boolean {
	const _r = call<number>('after_date_spanset_w', 'number', ['number', ptrArgType()], [d, ptrArgVal(ss)]) !== 0;
	checkMeosError();
	return _r;
}

export function after_set_date(s: Ptr, d: DateADT): boolean {
	const _r = call<number>('after_set_date_w', 'number', [ptrArgType(), 'number'], [ptrArgVal(s), d]) !== 0;
	checkMeosError();
	return _r;
}

export function after_set_timestamptz(s: Ptr, t: TimestampTz): boolean {
	const _r = call<number>('after_set_timestamptz_w', 'number', [ptrArgType(), 'bigint'], [ptrArgVal(s), BigInt(t)]) !== 0;
	checkMeosError();
	return _r;
}

export function after_span_date(s: Ptr, d: DateADT): boolean {
	const _r = call<number>('after_span_date_w', 'number', [ptrArgType(), 'number'], [ptrArgVal(s), d]) !== 0;
	checkMeosError();
	return _r;
}

export function after_span_timestamptz(s: Ptr, t: TimestampTz): boolean {
	const _r = call<number>('after_span_timestamptz_w', 'number', [ptrArgType(), 'bigint'], [ptrArgVal(s), BigInt(t)]) !== 0;
	checkMeosError();
	return _r;
}

export function after_spanset_date(ss: Ptr, d: DateADT): boolean {
	const _r = call<number>('after_spanset_date_w', 'number', [ptrArgType(), 'number'], [ptrArgVal(ss), d]) !== 0;
	checkMeosError();
	return _r;
}

export function after_spanset_timestamptz(ss: Ptr, t: TimestampTz): boolean {
	const _r = call<number>('after_spanset_timestamptz_w', 'number', [ptrArgType(), 'bigint'], [ptrArgVal(ss), BigInt(t)]) !== 0;
	checkMeosError();
	return _r;
}

export function after_timestamptz_set(t: TimestampTz, s: Ptr): boolean {
	const _r = call<number>('after_timestamptz_set_w', 'number', ['bigint', ptrArgType()], [BigInt(t), ptrArgVal(s)]) !== 0;
	checkMeosError();
	return _r;
}

export function after_timestamptz_span(t: TimestampTz, s: Ptr): boolean {
	const _r = call<number>('after_timestamptz_span_w', 'number', ['bigint', ptrArgType()], [BigInt(t), ptrArgVal(s)]) !== 0;
	checkMeosError();
	return _r;
}

export function after_timestamptz_spanset(t: TimestampTz, ss: Ptr): boolean {
	const _r = call<number>('after_timestamptz_spanset_w', 'number', ['bigint', ptrArgType()], [BigInt(t), ptrArgVal(ss)]) !== 0;
	checkMeosError();
	return _r;
}

export function before_date_set(d: DateADT, s: Ptr): boolean {
	const _r = call<number>('before_date_set_w', 'number', ['number', ptrArgType()], [d, ptrArgVal(s)]) !== 0;
	checkMeosError();
	return _r;
}

export function before_date_span(d: DateADT, s: Ptr): boolean {
	const _r = call<number>('before_date_span_w', 'number', ['number', ptrArgType()], [d, ptrArgVal(s)]) !== 0;
	checkMeosError();
	return _r;
}

export function before_date_spanset(d: DateADT, ss: Ptr): boolean {
	const _r = call<number>('before_date_spanset_w', 'number', ['number', ptrArgType()], [d, ptrArgVal(ss)]) !== 0;
	checkMeosError();
	return _r;
}

export function before_set_date(s: Ptr, d: DateADT): boolean {
	const _r = call<number>('before_set_date_w', 'number', [ptrArgType(), 'number'], [ptrArgVal(s), d]) !== 0;
	checkMeosError();
	return _r;
}

export function before_set_timestamptz(s: Ptr, t: TimestampTz): boolean {
	const _r = call<number>('before_set_timestamptz_w', 'number', [ptrArgType(), 'bigint'], [ptrArgVal(s), BigInt(t)]) !== 0;
	checkMeosError();
	return _r;
}

export function before_span_date(s: Ptr, d: DateADT): boolean {
	const _r = call<number>('before_span_date_w', 'number', [ptrArgType(), 'number'], [ptrArgVal(s), d]) !== 0;
	checkMeosError();
	return _r;
}

export function before_span_timestamptz(s: Ptr, t: TimestampTz): boolean {
	const _r = call<number>('before_span_timestamptz_w', 'number', [ptrArgType(), 'bigint'], [ptrArgVal(s), BigInt(t)]) !== 0;
	checkMeosError();
	return _r;
}

export function before_spanset_date(ss: Ptr, d: DateADT): boolean {
	const _r = call<number>('before_spanset_date_w', 'number', [ptrArgType(), 'number'], [ptrArgVal(ss), d]) !== 0;
	checkMeosError();
	return _r;
}

export function before_spanset_timestamptz(ss: Ptr, t: TimestampTz): boolean {
	const _r = call<number>('before_spanset_timestamptz_w', 'number', [ptrArgType(), 'bigint'], [ptrArgVal(ss), BigInt(t)]) !== 0;
	checkMeosError();
	return _r;
}

export function before_timestamptz_set(t: TimestampTz, s: Ptr): boolean {
	const _r = call<number>('before_timestamptz_set_w', 'number', ['bigint', ptrArgType()], [BigInt(t), ptrArgVal(s)]) !== 0;
	checkMeosError();
	return _r;
}

export function before_timestamptz_span(t: TimestampTz, s: Ptr): boolean {
	const _r = call<number>('before_timestamptz_span_w', 'number', ['bigint', ptrArgType()], [BigInt(t), ptrArgVal(s)]) !== 0;
	checkMeosError();
	return _r;
}

export function before_timestamptz_spanset(t: TimestampTz, ss: Ptr): boolean {
	const _r = call<number>('before_timestamptz_spanset_w', 'number', ['bigint', ptrArgType()], [BigInt(t), ptrArgVal(ss)]) !== 0;
	checkMeosError();
	return _r;
}

export function left_bigint_set(i: number, s: Ptr): boolean {
	const _r = call<number>('left_bigint_set_w', 'number', ['bigint', ptrArgType()], [BigInt(i), ptrArgVal(s)]) !== 0;
	checkMeosError();
	return _r;
}

export function left_bigint_span(i: number, s: Ptr): boolean {
	const _r = call<number>('left_bigint_span_w', 'number', ['bigint', ptrArgType()], [BigInt(i), ptrArgVal(s)]) !== 0;
	checkMeosError();
	return _r;
}

export function left_bigint_spanset(i: number, ss: Ptr): boolean {
	const _r = call<number>('left_bigint_spanset_w', 'number', ['bigint', ptrArgType()], [BigInt(i), ptrArgVal(ss)]) !== 0;
	checkMeosError();
	return _r;
}

export function left_float_set(d: number, s: Ptr): boolean {
	const _r = call<number>('left_float_set_w', 'number', ['number', ptrArgType()], [d, ptrArgVal(s)]) !== 0;
	checkMeosError();
	return _r;
}

export function left_float_span(d: number, s: Ptr): boolean {
	const _r = call<number>('left_float_span_w', 'number', ['number', ptrArgType()], [d, ptrArgVal(s)]) !== 0;
	checkMeosError();
	return _r;
}

export function left_float_spanset(d: number, ss: Ptr): boolean {
	const _r = call<number>('left_float_spanset_w', 'number', ['number', ptrArgType()], [d, ptrArgVal(ss)]) !== 0;
	checkMeosError();
	return _r;
}

export function left_int_set(i: number, s: Ptr): boolean {
	const _r = call<number>('left_int_set_w', 'number', ['number', ptrArgType()], [i, ptrArgVal(s)]) !== 0;
	checkMeosError();
	return _r;
}

export function left_int_span(i: number, s: Ptr): boolean {
	const _r = call<number>('left_int_span_w', 'number', ['number', ptrArgType()], [i, ptrArgVal(s)]) !== 0;
	checkMeosError();
	return _r;
}

export function left_int_spanset(i: number, ss: Ptr): boolean {
	const _r = call<number>('left_int_spanset_w', 'number', ['number', ptrArgType()], [i, ptrArgVal(ss)]) !== 0;
	checkMeosError();
	return _r;
}

export function left_set_bigint(s: Ptr, i: number): boolean {
	const _r = call<number>('left_set_bigint_w', 'number', [ptrArgType(), 'bigint'], [ptrArgVal(s), BigInt(i)]) !== 0;
	checkMeosError();
	return _r;
}

export function left_set_float(s: Ptr, d: number): boolean {
	const _r = call<number>('left_set_float_w', 'number', [ptrArgType(), 'number'], [ptrArgVal(s), d]) !== 0;
	checkMeosError();
	return _r;
}

export function left_set_int(s: Ptr, i: number): boolean {
	const _r = call<number>('left_set_int_w', 'number', [ptrArgType(), 'number'], [ptrArgVal(s), i]) !== 0;
	checkMeosError();
	return _r;
}

export function left_set_set(s1: Ptr, s2: Ptr): boolean {
	const _r = call<number>('left_set_set_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(s1), ptrArgVal(s2)]) !== 0;
	checkMeosError();
	return _r;
}

export function left_set_text(s: Ptr, txt: string): boolean {
	const _r = call<number>('left_set_text_w', 'number', [ptrArgType(), 'string'], [ptrArgVal(s), txt]) !== 0;
	checkMeosError();
	return _r;
}

export function left_span_bigint(s: Ptr, i: number): boolean {
	const _r = call<number>('left_span_bigint_w', 'number', [ptrArgType(), 'bigint'], [ptrArgVal(s), BigInt(i)]) !== 0;
	checkMeosError();
	return _r;
}

export function left_span_float(s: Ptr, d: number): boolean {
	const _r = call<number>('left_span_float_w', 'number', [ptrArgType(), 'number'], [ptrArgVal(s), d]) !== 0;
	checkMeosError();
	return _r;
}

export function left_span_int(s: Ptr, i: number): boolean {
	const _r = call<number>('left_span_int_w', 'number', [ptrArgType(), 'number'], [ptrArgVal(s), i]) !== 0;
	checkMeosError();
	return _r;
}

export function left_span_span(s1: Ptr, s2: Ptr): boolean {
	const _r = call<number>('left_span_span_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(s1), ptrArgVal(s2)]) !== 0;
	checkMeosError();
	return _r;
}

export function left_span_spanset(s: Ptr, ss: Ptr): boolean {
	const _r = call<number>('left_span_spanset_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(s), ptrArgVal(ss)]) !== 0;
	checkMeosError();
	return _r;
}

export function left_spanset_bigint(ss: Ptr, i: number): boolean {
	const _r = call<number>('left_spanset_bigint_w', 'number', [ptrArgType(), 'bigint'], [ptrArgVal(ss), BigInt(i)]) !== 0;
	checkMeosError();
	return _r;
}

export function left_spanset_float(ss: Ptr, d: number): boolean {
	const _r = call<number>('left_spanset_float_w', 'number', [ptrArgType(), 'number'], [ptrArgVal(ss), d]) !== 0;
	checkMeosError();
	return _r;
}

export function left_spanset_int(ss: Ptr, i: number): boolean {
	const _r = call<number>('left_spanset_int_w', 'number', [ptrArgType(), 'number'], [ptrArgVal(ss), i]) !== 0;
	checkMeosError();
	return _r;
}

export function left_spanset_span(ss: Ptr, s: Ptr): boolean {
	const _r = call<number>('left_spanset_span_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(ss), ptrArgVal(s)]) !== 0;
	checkMeosError();
	return _r;
}

export function left_spanset_spanset(ss1: Ptr, ss2: Ptr): boolean {
	const _r = call<number>('left_spanset_spanset_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(ss1), ptrArgVal(ss2)]) !== 0;
	checkMeosError();
	return _r;
}

export function left_text_set(txt: string, s: Ptr): boolean {
	const _r = call<number>('left_text_set_w', 'number', ['string', ptrArgType()], [txt, ptrArgVal(s)]) !== 0;
	checkMeosError();
	return _r;
}

export function overafter_date_set(d: DateADT, s: Ptr): boolean {
	const _r = call<number>('overafter_date_set_w', 'number', ['number', ptrArgType()], [d, ptrArgVal(s)]) !== 0;
	checkMeosError();
	return _r;
}

export function overafter_date_span(d: DateADT, s: Ptr): boolean {
	const _r = call<number>('overafter_date_span_w', 'number', ['number', ptrArgType()], [d, ptrArgVal(s)]) !== 0;
	checkMeosError();
	return _r;
}

export function overafter_date_spanset(d: DateADT, ss: Ptr): boolean {
	const _r = call<number>('overafter_date_spanset_w', 'number', ['number', ptrArgType()], [d, ptrArgVal(ss)]) !== 0;
	checkMeosError();
	return _r;
}

export function overafter_set_date(s: Ptr, d: DateADT): boolean {
	const _r = call<number>('overafter_set_date_w', 'number', [ptrArgType(), 'number'], [ptrArgVal(s), d]) !== 0;
	checkMeosError();
	return _r;
}

export function overafter_set_timestamptz(s: Ptr, t: TimestampTz): boolean {
	const _r = call<number>('overafter_set_timestamptz_w', 'number', [ptrArgType(), 'bigint'], [ptrArgVal(s), BigInt(t)]) !== 0;
	checkMeosError();
	return _r;
}

export function overafter_span_date(s: Ptr, d: DateADT): boolean {
	const _r = call<number>('overafter_span_date_w', 'number', [ptrArgType(), 'number'], [ptrArgVal(s), d]) !== 0;
	checkMeosError();
	return _r;
}

export function overafter_span_timestamptz(s: Ptr, t: TimestampTz): boolean {
	const _r = call<number>('overafter_span_timestamptz_w', 'number', [ptrArgType(), 'bigint'], [ptrArgVal(s), BigInt(t)]) !== 0;
	checkMeosError();
	return _r;
}

export function overafter_spanset_date(ss: Ptr, d: DateADT): boolean {
	const _r = call<number>('overafter_spanset_date_w', 'number', [ptrArgType(), 'number'], [ptrArgVal(ss), d]) !== 0;
	checkMeosError();
	return _r;
}

export function overafter_spanset_timestamptz(ss: Ptr, t: TimestampTz): boolean {
	const _r = call<number>('overafter_spanset_timestamptz_w', 'number', [ptrArgType(), 'bigint'], [ptrArgVal(ss), BigInt(t)]) !== 0;
	checkMeosError();
	return _r;
}

export function overafter_timestamptz_set(t: TimestampTz, s: Ptr): boolean {
	const _r = call<number>('overafter_timestamptz_set_w', 'number', ['bigint', ptrArgType()], [BigInt(t), ptrArgVal(s)]) !== 0;
	checkMeosError();
	return _r;
}

export function overafter_timestamptz_span(t: TimestampTz, s: Ptr): boolean {
	const _r = call<number>('overafter_timestamptz_span_w', 'number', ['bigint', ptrArgType()], [BigInt(t), ptrArgVal(s)]) !== 0;
	checkMeosError();
	return _r;
}

export function overafter_timestamptz_spanset(t: TimestampTz, ss: Ptr): boolean {
	const _r = call<number>('overafter_timestamptz_spanset_w', 'number', ['bigint', ptrArgType()], [BigInt(t), ptrArgVal(ss)]) !== 0;
	checkMeosError();
	return _r;
}

export function overbefore_date_set(d: DateADT, s: Ptr): boolean {
	const _r = call<number>('overbefore_date_set_w', 'number', ['number', ptrArgType()], [d, ptrArgVal(s)]) !== 0;
	checkMeosError();
	return _r;
}

export function overbefore_date_span(d: DateADT, s: Ptr): boolean {
	const _r = call<number>('overbefore_date_span_w', 'number', ['number', ptrArgType()], [d, ptrArgVal(s)]) !== 0;
	checkMeosError();
	return _r;
}

export function overbefore_date_spanset(d: DateADT, ss: Ptr): boolean {
	const _r = call<number>('overbefore_date_spanset_w', 'number', ['number', ptrArgType()], [d, ptrArgVal(ss)]) !== 0;
	checkMeosError();
	return _r;
}

export function overbefore_set_date(s: Ptr, d: DateADT): boolean {
	const _r = call<number>('overbefore_set_date_w', 'number', [ptrArgType(), 'number'], [ptrArgVal(s), d]) !== 0;
	checkMeosError();
	return _r;
}

export function overbefore_set_timestamptz(s: Ptr, t: TimestampTz): boolean {
	const _r = call<number>('overbefore_set_timestamptz_w', 'number', [ptrArgType(), 'bigint'], [ptrArgVal(s), BigInt(t)]) !== 0;
	checkMeosError();
	return _r;
}

export function overbefore_span_date(s: Ptr, d: DateADT): boolean {
	const _r = call<number>('overbefore_span_date_w', 'number', [ptrArgType(), 'number'], [ptrArgVal(s), d]) !== 0;
	checkMeosError();
	return _r;
}

export function overbefore_span_timestamptz(s: Ptr, t: TimestampTz): boolean {
	const _r = call<number>('overbefore_span_timestamptz_w', 'number', [ptrArgType(), 'bigint'], [ptrArgVal(s), BigInt(t)]) !== 0;
	checkMeosError();
	return _r;
}

export function overbefore_spanset_date(ss: Ptr, d: DateADT): boolean {
	const _r = call<number>('overbefore_spanset_date_w', 'number', [ptrArgType(), 'number'], [ptrArgVal(ss), d]) !== 0;
	checkMeosError();
	return _r;
}

export function overbefore_spanset_timestamptz(ss: Ptr, t: TimestampTz): boolean {
	const _r = call<number>('overbefore_spanset_timestamptz_w', 'number', [ptrArgType(), 'bigint'], [ptrArgVal(ss), BigInt(t)]) !== 0;
	checkMeosError();
	return _r;
}

export function overbefore_timestamptz_set(t: TimestampTz, s: Ptr): boolean {
	const _r = call<number>('overbefore_timestamptz_set_w', 'number', ['bigint', ptrArgType()], [BigInt(t), ptrArgVal(s)]) !== 0;
	checkMeosError();
	return _r;
}

export function overbefore_timestamptz_span(t: TimestampTz, s: Ptr): boolean {
	const _r = call<number>('overbefore_timestamptz_span_w', 'number', ['bigint', ptrArgType()], [BigInt(t), ptrArgVal(s)]) !== 0;
	checkMeosError();
	return _r;
}

export function overbefore_timestamptz_spanset(t: TimestampTz, ss: Ptr): boolean {
	const _r = call<number>('overbefore_timestamptz_spanset_w', 'number', ['bigint', ptrArgType()], [BigInt(t), ptrArgVal(ss)]) !== 0;
	checkMeosError();
	return _r;
}

export function overleft_bigint_set(i: number, s: Ptr): boolean {
	const _r = call<number>('overleft_bigint_set_w', 'number', ['bigint', ptrArgType()], [BigInt(i), ptrArgVal(s)]) !== 0;
	checkMeosError();
	return _r;
}

export function overleft_bigint_span(i: number, s: Ptr): boolean {
	const _r = call<number>('overleft_bigint_span_w', 'number', ['bigint', ptrArgType()], [BigInt(i), ptrArgVal(s)]) !== 0;
	checkMeosError();
	return _r;
}

export function overleft_bigint_spanset(i: number, ss: Ptr): boolean {
	const _r = call<number>('overleft_bigint_spanset_w', 'number', ['bigint', ptrArgType()], [BigInt(i), ptrArgVal(ss)]) !== 0;
	checkMeosError();
	return _r;
}

export function overleft_float_set(d: number, s: Ptr): boolean {
	const _r = call<number>('overleft_float_set_w', 'number', ['number', ptrArgType()], [d, ptrArgVal(s)]) !== 0;
	checkMeosError();
	return _r;
}

export function overleft_float_span(d: number, s: Ptr): boolean {
	const _r = call<number>('overleft_float_span_w', 'number', ['number', ptrArgType()], [d, ptrArgVal(s)]) !== 0;
	checkMeosError();
	return _r;
}

export function overleft_float_spanset(d: number, ss: Ptr): boolean {
	const _r = call<number>('overleft_float_spanset_w', 'number', ['number', ptrArgType()], [d, ptrArgVal(ss)]) !== 0;
	checkMeosError();
	return _r;
}

export function overleft_int_set(i: number, s: Ptr): boolean {
	const _r = call<number>('overleft_int_set_w', 'number', ['number', ptrArgType()], [i, ptrArgVal(s)]) !== 0;
	checkMeosError();
	return _r;
}

export function overleft_int_span(i: number, s: Ptr): boolean {
	const _r = call<number>('overleft_int_span_w', 'number', ['number', ptrArgType()], [i, ptrArgVal(s)]) !== 0;
	checkMeosError();
	return _r;
}

export function overleft_int_spanset(i: number, ss: Ptr): boolean {
	const _r = call<number>('overleft_int_spanset_w', 'number', ['number', ptrArgType()], [i, ptrArgVal(ss)]) !== 0;
	checkMeosError();
	return _r;
}

export function overleft_set_bigint(s: Ptr, i: number): boolean {
	const _r = call<number>('overleft_set_bigint_w', 'number', [ptrArgType(), 'bigint'], [ptrArgVal(s), BigInt(i)]) !== 0;
	checkMeosError();
	return _r;
}

export function overleft_set_float(s: Ptr, d: number): boolean {
	const _r = call<number>('overleft_set_float_w', 'number', [ptrArgType(), 'number'], [ptrArgVal(s), d]) !== 0;
	checkMeosError();
	return _r;
}

export function overleft_set_int(s: Ptr, i: number): boolean {
	const _r = call<number>('overleft_set_int_w', 'number', [ptrArgType(), 'number'], [ptrArgVal(s), i]) !== 0;
	checkMeosError();
	return _r;
}

export function overleft_set_set(s1: Ptr, s2: Ptr): boolean {
	const _r = call<number>('overleft_set_set_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(s1), ptrArgVal(s2)]) !== 0;
	checkMeosError();
	return _r;
}

export function overleft_set_text(s: Ptr, txt: string): boolean {
	const _r = call<number>('overleft_set_text_w', 'number', [ptrArgType(), 'string'], [ptrArgVal(s), txt]) !== 0;
	checkMeosError();
	return _r;
}

export function overleft_span_bigint(s: Ptr, i: number): boolean {
	const _r = call<number>('overleft_span_bigint_w', 'number', [ptrArgType(), 'bigint'], [ptrArgVal(s), BigInt(i)]) !== 0;
	checkMeosError();
	return _r;
}

export function overleft_span_float(s: Ptr, d: number): boolean {
	const _r = call<number>('overleft_span_float_w', 'number', [ptrArgType(), 'number'], [ptrArgVal(s), d]) !== 0;
	checkMeosError();
	return _r;
}

export function overleft_span_int(s: Ptr, i: number): boolean {
	const _r = call<number>('overleft_span_int_w', 'number', [ptrArgType(), 'number'], [ptrArgVal(s), i]) !== 0;
	checkMeosError();
	return _r;
}

export function overleft_span_span(s1: Ptr, s2: Ptr): boolean {
	const _r = call<number>('overleft_span_span_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(s1), ptrArgVal(s2)]) !== 0;
	checkMeosError();
	return _r;
}

export function overleft_span_spanset(s: Ptr, ss: Ptr): boolean {
	const _r = call<number>('overleft_span_spanset_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(s), ptrArgVal(ss)]) !== 0;
	checkMeosError();
	return _r;
}

export function overleft_spanset_bigint(ss: Ptr, i: number): boolean {
	const _r = call<number>('overleft_spanset_bigint_w', 'number', [ptrArgType(), 'bigint'], [ptrArgVal(ss), BigInt(i)]) !== 0;
	checkMeosError();
	return _r;
}

export function overleft_spanset_float(ss: Ptr, d: number): boolean {
	const _r = call<number>('overleft_spanset_float_w', 'number', [ptrArgType(), 'number'], [ptrArgVal(ss), d]) !== 0;
	checkMeosError();
	return _r;
}

export function overleft_spanset_int(ss: Ptr, i: number): boolean {
	const _r = call<number>('overleft_spanset_int_w', 'number', [ptrArgType(), 'number'], [ptrArgVal(ss), i]) !== 0;
	checkMeosError();
	return _r;
}

export function overleft_spanset_span(ss: Ptr, s: Ptr): boolean {
	const _r = call<number>('overleft_spanset_span_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(ss), ptrArgVal(s)]) !== 0;
	checkMeosError();
	return _r;
}

export function overleft_spanset_spanset(ss1: Ptr, ss2: Ptr): boolean {
	const _r = call<number>('overleft_spanset_spanset_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(ss1), ptrArgVal(ss2)]) !== 0;
	checkMeosError();
	return _r;
}

export function overleft_text_set(txt: string, s: Ptr): boolean {
	const _r = call<number>('overleft_text_set_w', 'number', ['string', ptrArgType()], [txt, ptrArgVal(s)]) !== 0;
	checkMeosError();
	return _r;
}

export function overright_bigint_set(i: number, s: Ptr): boolean {
	const _r = call<number>('overright_bigint_set_w', 'number', ['bigint', ptrArgType()], [BigInt(i), ptrArgVal(s)]) !== 0;
	checkMeosError();
	return _r;
}

export function overright_bigint_span(i: number, s: Ptr): boolean {
	const _r = call<number>('overright_bigint_span_w', 'number', ['bigint', ptrArgType()], [BigInt(i), ptrArgVal(s)]) !== 0;
	checkMeosError();
	return _r;
}

export function overright_bigint_spanset(i: number, ss: Ptr): boolean {
	const _r = call<number>('overright_bigint_spanset_w', 'number', ['bigint', ptrArgType()], [BigInt(i), ptrArgVal(ss)]) !== 0;
	checkMeosError();
	return _r;
}

export function overright_float_set(d: number, s: Ptr): boolean {
	const _r = call<number>('overright_float_set_w', 'number', ['number', ptrArgType()], [d, ptrArgVal(s)]) !== 0;
	checkMeosError();
	return _r;
}

export function overright_float_span(d: number, s: Ptr): boolean {
	const _r = call<number>('overright_float_span_w', 'number', ['number', ptrArgType()], [d, ptrArgVal(s)]) !== 0;
	checkMeosError();
	return _r;
}

export function overright_float_spanset(d: number, ss: Ptr): boolean {
	const _r = call<number>('overright_float_spanset_w', 'number', ['number', ptrArgType()], [d, ptrArgVal(ss)]) !== 0;
	checkMeosError();
	return _r;
}

export function overright_int_set(i: number, s: Ptr): boolean {
	const _r = call<number>('overright_int_set_w', 'number', ['number', ptrArgType()], [i, ptrArgVal(s)]) !== 0;
	checkMeosError();
	return _r;
}

export function overright_int_span(i: number, s: Ptr): boolean {
	const _r = call<number>('overright_int_span_w', 'number', ['number', ptrArgType()], [i, ptrArgVal(s)]) !== 0;
	checkMeosError();
	return _r;
}

export function overright_int_spanset(i: number, ss: Ptr): boolean {
	const _r = call<number>('overright_int_spanset_w', 'number', ['number', ptrArgType()], [i, ptrArgVal(ss)]) !== 0;
	checkMeosError();
	return _r;
}

export function overright_set_bigint(s: Ptr, i: number): boolean {
	const _r = call<number>('overright_set_bigint_w', 'number', [ptrArgType(), 'bigint'], [ptrArgVal(s), BigInt(i)]) !== 0;
	checkMeosError();
	return _r;
}

export function overright_set_float(s: Ptr, d: number): boolean {
	const _r = call<number>('overright_set_float_w', 'number', [ptrArgType(), 'number'], [ptrArgVal(s), d]) !== 0;
	checkMeosError();
	return _r;
}

export function overright_set_int(s: Ptr, i: number): boolean {
	const _r = call<number>('overright_set_int_w', 'number', [ptrArgType(), 'number'], [ptrArgVal(s), i]) !== 0;
	checkMeosError();
	return _r;
}

export function overright_set_set(s1: Ptr, s2: Ptr): boolean {
	const _r = call<number>('overright_set_set_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(s1), ptrArgVal(s2)]) !== 0;
	checkMeosError();
	return _r;
}

export function overright_set_text(s: Ptr, txt: string): boolean {
	const _r = call<number>('overright_set_text_w', 'number', [ptrArgType(), 'string'], [ptrArgVal(s), txt]) !== 0;
	checkMeosError();
	return _r;
}

export function overright_span_bigint(s: Ptr, i: number): boolean {
	const _r = call<number>('overright_span_bigint_w', 'number', [ptrArgType(), 'bigint'], [ptrArgVal(s), BigInt(i)]) !== 0;
	checkMeosError();
	return _r;
}

export function overright_span_float(s: Ptr, d: number): boolean {
	const _r = call<number>('overright_span_float_w', 'number', [ptrArgType(), 'number'], [ptrArgVal(s), d]) !== 0;
	checkMeosError();
	return _r;
}

export function overright_span_int(s: Ptr, i: number): boolean {
	const _r = call<number>('overright_span_int_w', 'number', [ptrArgType(), 'number'], [ptrArgVal(s), i]) !== 0;
	checkMeosError();
	return _r;
}

export function overright_span_span(s1: Ptr, s2: Ptr): boolean {
	const _r = call<number>('overright_span_span_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(s1), ptrArgVal(s2)]) !== 0;
	checkMeosError();
	return _r;
}

export function overright_span_spanset(s: Ptr, ss: Ptr): boolean {
	const _r = call<number>('overright_span_spanset_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(s), ptrArgVal(ss)]) !== 0;
	checkMeosError();
	return _r;
}

export function overright_spanset_bigint(ss: Ptr, i: number): boolean {
	const _r = call<number>('overright_spanset_bigint_w', 'number', [ptrArgType(), 'bigint'], [ptrArgVal(ss), BigInt(i)]) !== 0;
	checkMeosError();
	return _r;
}

export function overright_spanset_float(ss: Ptr, d: number): boolean {
	const _r = call<number>('overright_spanset_float_w', 'number', [ptrArgType(), 'number'], [ptrArgVal(ss), d]) !== 0;
	checkMeosError();
	return _r;
}

export function overright_spanset_int(ss: Ptr, i: number): boolean {
	const _r = call<number>('overright_spanset_int_w', 'number', [ptrArgType(), 'number'], [ptrArgVal(ss), i]) !== 0;
	checkMeosError();
	return _r;
}

export function overright_spanset_span(ss: Ptr, s: Ptr): boolean {
	const _r = call<number>('overright_spanset_span_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(ss), ptrArgVal(s)]) !== 0;
	checkMeosError();
	return _r;
}

export function overright_spanset_spanset(ss1: Ptr, ss2: Ptr): boolean {
	const _r = call<number>('overright_spanset_spanset_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(ss1), ptrArgVal(ss2)]) !== 0;
	checkMeosError();
	return _r;
}

export function overright_text_set(txt: string, s: Ptr): boolean {
	const _r = call<number>('overright_text_set_w', 'number', ['string', ptrArgType()], [txt, ptrArgVal(s)]) !== 0;
	checkMeosError();
	return _r;
}

export function right_bigint_set(i: number, s: Ptr): boolean {
	const _r = call<number>('right_bigint_set_w', 'number', ['bigint', ptrArgType()], [BigInt(i), ptrArgVal(s)]) !== 0;
	checkMeosError();
	return _r;
}

export function right_bigint_span(i: number, s: Ptr): boolean {
	const _r = call<number>('right_bigint_span_w', 'number', ['bigint', ptrArgType()], [BigInt(i), ptrArgVal(s)]) !== 0;
	checkMeosError();
	return _r;
}

export function right_bigint_spanset(i: number, ss: Ptr): boolean {
	const _r = call<number>('right_bigint_spanset_w', 'number', ['bigint', ptrArgType()], [BigInt(i), ptrArgVal(ss)]) !== 0;
	checkMeosError();
	return _r;
}

export function right_float_set(d: number, s: Ptr): boolean {
	const _r = call<number>('right_float_set_w', 'number', ['number', ptrArgType()], [d, ptrArgVal(s)]) !== 0;
	checkMeosError();
	return _r;
}

export function right_float_span(d: number, s: Ptr): boolean {
	const _r = call<number>('right_float_span_w', 'number', ['number', ptrArgType()], [d, ptrArgVal(s)]) !== 0;
	checkMeosError();
	return _r;
}

export function right_float_spanset(d: number, ss: Ptr): boolean {
	const _r = call<number>('right_float_spanset_w', 'number', ['number', ptrArgType()], [d, ptrArgVal(ss)]) !== 0;
	checkMeosError();
	return _r;
}

export function right_int_set(i: number, s: Ptr): boolean {
	const _r = call<number>('right_int_set_w', 'number', ['number', ptrArgType()], [i, ptrArgVal(s)]) !== 0;
	checkMeosError();
	return _r;
}

export function right_int_span(i: number, s: Ptr): boolean {
	const _r = call<number>('right_int_span_w', 'number', ['number', ptrArgType()], [i, ptrArgVal(s)]) !== 0;
	checkMeosError();
	return _r;
}

export function right_int_spanset(i: number, ss: Ptr): boolean {
	const _r = call<number>('right_int_spanset_w', 'number', ['number', ptrArgType()], [i, ptrArgVal(ss)]) !== 0;
	checkMeosError();
	return _r;
}

export function right_set_bigint(s: Ptr, i: number): boolean {
	const _r = call<number>('right_set_bigint_w', 'number', [ptrArgType(), 'bigint'], [ptrArgVal(s), BigInt(i)]) !== 0;
	checkMeosError();
	return _r;
}

export function right_set_float(s: Ptr, d: number): boolean {
	const _r = call<number>('right_set_float_w', 'number', [ptrArgType(), 'number'], [ptrArgVal(s), d]) !== 0;
	checkMeosError();
	return _r;
}

export function right_set_int(s: Ptr, i: number): boolean {
	const _r = call<number>('right_set_int_w', 'number', [ptrArgType(), 'number'], [ptrArgVal(s), i]) !== 0;
	checkMeosError();
	return _r;
}

export function right_set_set(s1: Ptr, s2: Ptr): boolean {
	const _r = call<number>('right_set_set_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(s1), ptrArgVal(s2)]) !== 0;
	checkMeosError();
	return _r;
}

export function right_set_text(s: Ptr, txt: string): boolean {
	const _r = call<number>('right_set_text_w', 'number', [ptrArgType(), 'string'], [ptrArgVal(s), txt]) !== 0;
	checkMeosError();
	return _r;
}

export function right_span_bigint(s: Ptr, i: number): boolean {
	const _r = call<number>('right_span_bigint_w', 'number', [ptrArgType(), 'bigint'], [ptrArgVal(s), BigInt(i)]) !== 0;
	checkMeosError();
	return _r;
}

export function right_span_float(s: Ptr, d: number): boolean {
	const _r = call<number>('right_span_float_w', 'number', [ptrArgType(), 'number'], [ptrArgVal(s), d]) !== 0;
	checkMeosError();
	return _r;
}

export function right_span_int(s: Ptr, i: number): boolean {
	const _r = call<number>('right_span_int_w', 'number', [ptrArgType(), 'number'], [ptrArgVal(s), i]) !== 0;
	checkMeosError();
	return _r;
}

export function right_span_span(s1: Ptr, s2: Ptr): boolean {
	const _r = call<number>('right_span_span_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(s1), ptrArgVal(s2)]) !== 0;
	checkMeosError();
	return _r;
}

export function right_span_spanset(s: Ptr, ss: Ptr): boolean {
	const _r = call<number>('right_span_spanset_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(s), ptrArgVal(ss)]) !== 0;
	checkMeosError();
	return _r;
}

export function right_spanset_bigint(ss: Ptr, i: number): boolean {
	const _r = call<number>('right_spanset_bigint_w', 'number', [ptrArgType(), 'bigint'], [ptrArgVal(ss), BigInt(i)]) !== 0;
	checkMeosError();
	return _r;
}

export function right_spanset_float(ss: Ptr, d: number): boolean {
	const _r = call<number>('right_spanset_float_w', 'number', [ptrArgType(), 'number'], [ptrArgVal(ss), d]) !== 0;
	checkMeosError();
	return _r;
}

export function right_spanset_int(ss: Ptr, i: number): boolean {
	const _r = call<number>('right_spanset_int_w', 'number', [ptrArgType(), 'number'], [ptrArgVal(ss), i]) !== 0;
	checkMeosError();
	return _r;
}

export function right_spanset_span(ss: Ptr, s: Ptr): boolean {
	const _r = call<number>('right_spanset_span_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(ss), ptrArgVal(s)]) !== 0;
	checkMeosError();
	return _r;
}

export function right_spanset_spanset(ss1: Ptr, ss2: Ptr): boolean {
	const _r = call<number>('right_spanset_spanset_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(ss1), ptrArgVal(ss2)]) !== 0;
	checkMeosError();
	return _r;
}

export function right_text_set(txt: string, s: Ptr): boolean {
	const _r = call<number>('right_text_set_w', 'number', ['string', ptrArgType()], [txt, ptrArgVal(s)]) !== 0;
	checkMeosError();
	return _r;
}

export function intersection_bigint_set(i: number, s: Ptr): Ptr {
	const _r = callPtr('intersection_bigint_set_w', ['bigint', ptrArgType()], [BigInt(i), ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function intersection_date_set(d: DateADT, s: Ptr): Ptr {
	const _r = callPtr('intersection_date_set_w', ['number', ptrArgType()], [d, ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function intersection_float_set(d: number, s: Ptr): Ptr {
	const _r = callPtr('intersection_float_set_w', ['number', ptrArgType()], [d, ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function intersection_int_set(i: number, s: Ptr): Ptr {
	const _r = callPtr('intersection_int_set_w', ['number', ptrArgType()], [i, ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function intersection_set_bigint(s: Ptr, i: number): Ptr {
	const _r = callPtr('intersection_set_bigint_w', [ptrArgType(), 'bigint'], [ptrArgVal(s), BigInt(i)]);
	checkMeosError();
	return _r;
}

export function intersection_set_date(s: Ptr, d: DateADT): Ptr {
	const _r = callPtr('intersection_set_date_w', [ptrArgType(), 'number'], [ptrArgVal(s), d]);
	checkMeosError();
	return _r;
}

export function intersection_set_float(s: Ptr, d: number): Ptr {
	const _r = callPtr('intersection_set_float_w', [ptrArgType(), 'number'], [ptrArgVal(s), d]);
	checkMeosError();
	return _r;
}

export function intersection_set_int(s: Ptr, i: number): Ptr {
	const _r = callPtr('intersection_set_int_w', [ptrArgType(), 'number'], [ptrArgVal(s), i]);
	checkMeosError();
	return _r;
}

export function intersection_set_set(s1: Ptr, s2: Ptr): Ptr {
	const _r = callPtr('intersection_set_set_w', [ptrArgType(), ptrArgType()], [ptrArgVal(s1), ptrArgVal(s2)]);
	checkMeosError();
	return _r;
}

export function intersection_set_text(s: Ptr, txt: string): Ptr {
	const _r = callPtr('intersection_set_text_w', [ptrArgType(), 'string'], [ptrArgVal(s), txt]);
	checkMeosError();
	return _r;
}

export function intersection_set_timestamptz(s: Ptr, t: TimestampTz): Ptr {
	const _r = callPtr('intersection_set_timestamptz_w', [ptrArgType(), 'bigint'], [ptrArgVal(s), BigInt(t)]);
	checkMeosError();
	return _r;
}

export function intersection_span_bigint(s: Ptr, i: number): Ptr {
	const _r = callPtr('intersection_span_bigint_w', [ptrArgType(), 'bigint'], [ptrArgVal(s), BigInt(i)]);
	checkMeosError();
	return _r;
}

export function intersection_span_date(s: Ptr, d: DateADT): Ptr {
	const _r = callPtr('intersection_span_date_w', [ptrArgType(), 'number'], [ptrArgVal(s), d]);
	checkMeosError();
	return _r;
}

export function intersection_span_float(s: Ptr, d: number): Ptr {
	const _r = callPtr('intersection_span_float_w', [ptrArgType(), 'number'], [ptrArgVal(s), d]);
	checkMeosError();
	return _r;
}

export function intersection_span_int(s: Ptr, i: number): Ptr {
	const _r = callPtr('intersection_span_int_w', [ptrArgType(), 'number'], [ptrArgVal(s), i]);
	checkMeosError();
	return _r;
}

export function intersection_span_span(s1: Ptr, s2: Ptr): Ptr {
	const _r = callPtr('intersection_span_span_w', [ptrArgType(), ptrArgType()], [ptrArgVal(s1), ptrArgVal(s2)]);
	checkMeosError();
	return _r;
}

export function intersection_span_spanset(s: Ptr, ss: Ptr): Ptr {
	const _r = callPtr('intersection_span_spanset_w', [ptrArgType(), ptrArgType()], [ptrArgVal(s), ptrArgVal(ss)]);
	checkMeosError();
	return _r;
}

export function intersection_span_timestamptz(s: Ptr, t: TimestampTz): Ptr {
	const _r = callPtr('intersection_span_timestamptz_w', [ptrArgType(), 'bigint'], [ptrArgVal(s), BigInt(t)]);
	checkMeosError();
	return _r;
}

export function intersection_spanset_bigint(ss: Ptr, i: number): Ptr {
	const _r = callPtr('intersection_spanset_bigint_w', [ptrArgType(), 'bigint'], [ptrArgVal(ss), BigInt(i)]);
	checkMeosError();
	return _r;
}

export function intersection_spanset_date(ss: Ptr, d: DateADT): Ptr {
	const _r = callPtr('intersection_spanset_date_w', [ptrArgType(), 'number'], [ptrArgVal(ss), d]);
	checkMeosError();
	return _r;
}

export function intersection_spanset_float(ss: Ptr, d: number): Ptr {
	const _r = callPtr('intersection_spanset_float_w', [ptrArgType(), 'number'], [ptrArgVal(ss), d]);
	checkMeosError();
	return _r;
}

export function intersection_spanset_int(ss: Ptr, i: number): Ptr {
	const _r = callPtr('intersection_spanset_int_w', [ptrArgType(), 'number'], [ptrArgVal(ss), i]);
	checkMeosError();
	return _r;
}

export function intersection_spanset_span(ss: Ptr, s: Ptr): Ptr {
	const _r = callPtr('intersection_spanset_span_w', [ptrArgType(), ptrArgType()], [ptrArgVal(ss), ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function intersection_spanset_spanset(ss1: Ptr, ss2: Ptr): Ptr {
	const _r = callPtr('intersection_spanset_spanset_w', [ptrArgType(), ptrArgType()], [ptrArgVal(ss1), ptrArgVal(ss2)]);
	checkMeosError();
	return _r;
}

export function intersection_spanset_timestamptz(ss: Ptr, t: TimestampTz): Ptr {
	const _r = callPtr('intersection_spanset_timestamptz_w', [ptrArgType(), 'bigint'], [ptrArgVal(ss), BigInt(t)]);
	checkMeosError();
	return _r;
}

export function intersection_text_set(txt: string, s: Ptr): Ptr {
	const _r = callPtr('intersection_text_set_w', ['string', ptrArgType()], [txt, ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function intersection_timestamptz_set(t: TimestampTz, s: Ptr): Ptr {
	const _r = callPtr('intersection_timestamptz_set_w', ['bigint', ptrArgType()], [BigInt(t), ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function minus_bigint_set(i: number, s: Ptr): Ptr {
	const _r = callPtr('minus_bigint_set_w', ['bigint', ptrArgType()], [BigInt(i), ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function minus_bigint_span(i: number, s: Ptr): Ptr {
	const _r = callPtr('minus_bigint_span_w', ['bigint', ptrArgType()], [BigInt(i), ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function minus_bigint_spanset(i: number, ss: Ptr): Ptr {
	const _r = callPtr('minus_bigint_spanset_w', ['bigint', ptrArgType()], [BigInt(i), ptrArgVal(ss)]);
	checkMeosError();
	return _r;
}

export function minus_date_set(d: DateADT, s: Ptr): Ptr {
	const _r = callPtr('minus_date_set_w', ['number', ptrArgType()], [d, ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function minus_date_span(d: DateADT, s: Ptr): Ptr {
	const _r = callPtr('minus_date_span_w', ['number', ptrArgType()], [d, ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function minus_date_spanset(d: DateADT, ss: Ptr): Ptr {
	const _r = callPtr('minus_date_spanset_w', ['number', ptrArgType()], [d, ptrArgVal(ss)]);
	checkMeosError();
	return _r;
}

export function minus_float_set(d: number, s: Ptr): Ptr {
	const _r = callPtr('minus_float_set_w', ['number', ptrArgType()], [d, ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function minus_float_span(d: number, s: Ptr): Ptr {
	const _r = callPtr('minus_float_span_w', ['number', ptrArgType()], [d, ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function minus_float_spanset(d: number, ss: Ptr): Ptr {
	const _r = callPtr('minus_float_spanset_w', ['number', ptrArgType()], [d, ptrArgVal(ss)]);
	checkMeosError();
	return _r;
}

export function minus_int_set(i: number, s: Ptr): Ptr {
	const _r = callPtr('minus_int_set_w', ['number', ptrArgType()], [i, ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function minus_int_span(i: number, s: Ptr): Ptr {
	const _r = callPtr('minus_int_span_w', ['number', ptrArgType()], [i, ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function minus_int_spanset(i: number, ss: Ptr): Ptr {
	const _r = callPtr('minus_int_spanset_w', ['number', ptrArgType()], [i, ptrArgVal(ss)]);
	checkMeosError();
	return _r;
}

export function minus_set_bigint(s: Ptr, i: number): Ptr {
	const _r = callPtr('minus_set_bigint_w', [ptrArgType(), 'bigint'], [ptrArgVal(s), BigInt(i)]);
	checkMeosError();
	return _r;
}

export function minus_set_date(s: Ptr, d: DateADT): Ptr {
	const _r = callPtr('minus_set_date_w', [ptrArgType(), 'number'], [ptrArgVal(s), d]);
	checkMeosError();
	return _r;
}

export function minus_set_float(s: Ptr, d: number): Ptr {
	const _r = callPtr('minus_set_float_w', [ptrArgType(), 'number'], [ptrArgVal(s), d]);
	checkMeosError();
	return _r;
}

export function minus_set_int(s: Ptr, i: number): Ptr {
	const _r = callPtr('minus_set_int_w', [ptrArgType(), 'number'], [ptrArgVal(s), i]);
	checkMeosError();
	return _r;
}

export function minus_set_set(s1: Ptr, s2: Ptr): Ptr {
	const _r = callPtr('minus_set_set_w', [ptrArgType(), ptrArgType()], [ptrArgVal(s1), ptrArgVal(s2)]);
	checkMeosError();
	return _r;
}

export function minus_set_text(s: Ptr, txt: string): Ptr {
	const _r = callPtr('minus_set_text_w', [ptrArgType(), 'string'], [ptrArgVal(s), txt]);
	checkMeosError();
	return _r;
}

export function minus_set_timestamptz(s: Ptr, t: TimestampTz): Ptr {
	const _r = callPtr('minus_set_timestamptz_w', [ptrArgType(), 'bigint'], [ptrArgVal(s), BigInt(t)]);
	checkMeosError();
	return _r;
}

export function minus_span_bigint(s: Ptr, i: number): Ptr {
	const _r = callPtr('minus_span_bigint_w', [ptrArgType(), 'bigint'], [ptrArgVal(s), BigInt(i)]);
	checkMeosError();
	return _r;
}

export function minus_span_date(s: Ptr, d: DateADT): Ptr {
	const _r = callPtr('minus_span_date_w', [ptrArgType(), 'number'], [ptrArgVal(s), d]);
	checkMeosError();
	return _r;
}

export function minus_span_float(s: Ptr, d: number): Ptr {
	const _r = callPtr('minus_span_float_w', [ptrArgType(), 'number'], [ptrArgVal(s), d]);
	checkMeosError();
	return _r;
}

export function minus_span_int(s: Ptr, i: number): Ptr {
	const _r = callPtr('minus_span_int_w', [ptrArgType(), 'number'], [ptrArgVal(s), i]);
	checkMeosError();
	return _r;
}

export function minus_span_span(s1: Ptr, s2: Ptr): Ptr {
	const _r = callPtr('minus_span_span_w', [ptrArgType(), ptrArgType()], [ptrArgVal(s1), ptrArgVal(s2)]);
	checkMeosError();
	return _r;
}

export function minus_span_spanset(s: Ptr, ss: Ptr): Ptr {
	const _r = callPtr('minus_span_spanset_w', [ptrArgType(), ptrArgType()], [ptrArgVal(s), ptrArgVal(ss)]);
	checkMeosError();
	return _r;
}

export function minus_span_timestamptz(s: Ptr, t: TimestampTz): Ptr {
	const _r = callPtr('minus_span_timestamptz_w', [ptrArgType(), 'bigint'], [ptrArgVal(s), BigInt(t)]);
	checkMeosError();
	return _r;
}

export function minus_spanset_bigint(ss: Ptr, i: number): Ptr {
	const _r = callPtr('minus_spanset_bigint_w', [ptrArgType(), 'bigint'], [ptrArgVal(ss), BigInt(i)]);
	checkMeosError();
	return _r;
}

export function minus_spanset_date(ss: Ptr, d: DateADT): Ptr {
	const _r = callPtr('minus_spanset_date_w', [ptrArgType(), 'number'], [ptrArgVal(ss), d]);
	checkMeosError();
	return _r;
}

export function minus_spanset_float(ss: Ptr, d: number): Ptr {
	const _r = callPtr('minus_spanset_float_w', [ptrArgType(), 'number'], [ptrArgVal(ss), d]);
	checkMeosError();
	return _r;
}

export function minus_spanset_int(ss: Ptr, i: number): Ptr {
	const _r = callPtr('minus_spanset_int_w', [ptrArgType(), 'number'], [ptrArgVal(ss), i]);
	checkMeosError();
	return _r;
}

export function minus_spanset_span(ss: Ptr, s: Ptr): Ptr {
	const _r = callPtr('minus_spanset_span_w', [ptrArgType(), ptrArgType()], [ptrArgVal(ss), ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function minus_spanset_spanset(ss1: Ptr, ss2: Ptr): Ptr {
	const _r = callPtr('minus_spanset_spanset_w', [ptrArgType(), ptrArgType()], [ptrArgVal(ss1), ptrArgVal(ss2)]);
	checkMeosError();
	return _r;
}

export function minus_spanset_timestamptz(ss: Ptr, t: TimestampTz): Ptr {
	const _r = callPtr('minus_spanset_timestamptz_w', [ptrArgType(), 'bigint'], [ptrArgVal(ss), BigInt(t)]);
	checkMeosError();
	return _r;
}

export function minus_text_set(txt: string, s: Ptr): Ptr {
	const _r = callPtr('minus_text_set_w', ['string', ptrArgType()], [txt, ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function minus_timestamptz_set(t: TimestampTz, s: Ptr): Ptr {
	const _r = callPtr('minus_timestamptz_set_w', ['bigint', ptrArgType()], [BigInt(t), ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function minus_timestamptz_span(t: TimestampTz, s: Ptr): Ptr {
	const _r = callPtr('minus_timestamptz_span_w', ['bigint', ptrArgType()], [BigInt(t), ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function minus_timestamptz_spanset(t: TimestampTz, ss: Ptr): Ptr {
	const _r = callPtr('minus_timestamptz_spanset_w', ['bigint', ptrArgType()], [BigInt(t), ptrArgVal(ss)]);
	checkMeosError();
	return _r;
}

export function union_bigint_set(i: number, s: Ptr): Ptr {
	const _r = callPtr('union_bigint_set_w', ['bigint', ptrArgType()], [BigInt(i), ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function union_bigint_span(s: Ptr, i: number): Ptr {
	const _r = callPtr('union_bigint_span_w', [ptrArgType(), 'bigint'], [ptrArgVal(s), BigInt(i)]);
	checkMeosError();
	return _r;
}

export function union_bigint_spanset(i: number, ss: Ptr): Ptr {
	const _r = callPtr('union_bigint_spanset_w', ['bigint', ptrArgType()], [BigInt(i), ptrArgVal(ss)]);
	checkMeosError();
	return _r;
}

export function union_date_set(d: DateADT, s: Ptr): Ptr {
	const _r = callPtr('union_date_set_w', ['number', ptrArgType()], [d, ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function union_date_span(s: Ptr, d: DateADT): Ptr {
	const _r = callPtr('union_date_span_w', [ptrArgType(), 'number'], [ptrArgVal(s), d]);
	checkMeosError();
	return _r;
}

export function union_date_spanset(d: DateADT, ss: Ptr): Ptr {
	const _r = callPtr('union_date_spanset_w', ['number', ptrArgType()], [d, ptrArgVal(ss)]);
	checkMeosError();
	return _r;
}

export function union_float_set(d: number, s: Ptr): Ptr {
	const _r = callPtr('union_float_set_w', ['number', ptrArgType()], [d, ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function union_float_span(s: Ptr, d: number): Ptr {
	const _r = callPtr('union_float_span_w', [ptrArgType(), 'number'], [ptrArgVal(s), d]);
	checkMeosError();
	return _r;
}

export function union_float_spanset(d: number, ss: Ptr): Ptr {
	const _r = callPtr('union_float_spanset_w', ['number', ptrArgType()], [d, ptrArgVal(ss)]);
	checkMeosError();
	return _r;
}

export function union_int_set(i: number, s: Ptr): Ptr {
	const _r = callPtr('union_int_set_w', ['number', ptrArgType()], [i, ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function union_int_span(i: number, s: Ptr): Ptr {
	const _r = callPtr('union_int_span_w', ['number', ptrArgType()], [i, ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function union_int_spanset(i: number, ss: Ptr): Ptr {
	const _r = callPtr('union_int_spanset_w', ['number', ptrArgType()], [i, ptrArgVal(ss)]);
	checkMeosError();
	return _r;
}

export function union_set_bigint(s: Ptr, i: number): Ptr {
	const _r = callPtr('union_set_bigint_w', [ptrArgType(), 'bigint'], [ptrArgVal(s), BigInt(i)]);
	checkMeosError();
	return _r;
}

export function union_set_date(s: Ptr, d: DateADT): Ptr {
	const _r = callPtr('union_set_date_w', [ptrArgType(), 'number'], [ptrArgVal(s), d]);
	checkMeosError();
	return _r;
}

export function union_set_float(s: Ptr, d: number): Ptr {
	const _r = callPtr('union_set_float_w', [ptrArgType(), 'number'], [ptrArgVal(s), d]);
	checkMeosError();
	return _r;
}

export function union_set_int(s: Ptr, i: number): Ptr {
	const _r = callPtr('union_set_int_w', [ptrArgType(), 'number'], [ptrArgVal(s), i]);
	checkMeosError();
	return _r;
}

export function union_set_set(s1: Ptr, s2: Ptr): Ptr {
	const _r = callPtr('union_set_set_w', [ptrArgType(), ptrArgType()], [ptrArgVal(s1), ptrArgVal(s2)]);
	checkMeosError();
	return _r;
}

export function union_set_text(s: Ptr, txt: string): Ptr {
	const _r = callPtr('union_set_text_w', [ptrArgType(), 'string'], [ptrArgVal(s), txt]);
	checkMeosError();
	return _r;
}

export function union_set_timestamptz(s: Ptr, t: TimestampTz): Ptr {
	const _r = callPtr('union_set_timestamptz_w', [ptrArgType(), 'bigint'], [ptrArgVal(s), BigInt(t)]);
	checkMeosError();
	return _r;
}

export function union_span_bigint(s: Ptr, i: number): Ptr {
	const _r = callPtr('union_span_bigint_w', [ptrArgType(), 'bigint'], [ptrArgVal(s), BigInt(i)]);
	checkMeosError();
	return _r;
}

export function union_span_date(s: Ptr, d: DateADT): Ptr {
	const _r = callPtr('union_span_date_w', [ptrArgType(), 'number'], [ptrArgVal(s), d]);
	checkMeosError();
	return _r;
}

export function union_span_float(s: Ptr, d: number): Ptr {
	const _r = callPtr('union_span_float_w', [ptrArgType(), 'number'], [ptrArgVal(s), d]);
	checkMeosError();
	return _r;
}

export function union_span_int(s: Ptr, i: number): Ptr {
	const _r = callPtr('union_span_int_w', [ptrArgType(), 'number'], [ptrArgVal(s), i]);
	checkMeosError();
	return _r;
}

export function union_span_span(s1: Ptr, s2: Ptr): Ptr {
	const _r = callPtr('union_span_span_w', [ptrArgType(), ptrArgType()], [ptrArgVal(s1), ptrArgVal(s2)]);
	checkMeosError();
	return _r;
}

export function union_span_spanset(s: Ptr, ss: Ptr): Ptr {
	const _r = callPtr('union_span_spanset_w', [ptrArgType(), ptrArgType()], [ptrArgVal(s), ptrArgVal(ss)]);
	checkMeosError();
	return _r;
}

export function union_span_timestamptz(s: Ptr, t: TimestampTz): Ptr {
	const _r = callPtr('union_span_timestamptz_w', [ptrArgType(), 'bigint'], [ptrArgVal(s), BigInt(t)]);
	checkMeosError();
	return _r;
}

export function union_spanset_bigint(ss: Ptr, i: number): Ptr {
	const _r = callPtr('union_spanset_bigint_w', [ptrArgType(), 'bigint'], [ptrArgVal(ss), BigInt(i)]);
	checkMeosError();
	return _r;
}

export function union_spanset_date(ss: Ptr, d: DateADT): Ptr {
	const _r = callPtr('union_spanset_date_w', [ptrArgType(), 'number'], [ptrArgVal(ss), d]);
	checkMeosError();
	return _r;
}

export function union_spanset_float(ss: Ptr, d: number): Ptr {
	const _r = callPtr('union_spanset_float_w', [ptrArgType(), 'number'], [ptrArgVal(ss), d]);
	checkMeosError();
	return _r;
}

export function union_spanset_int(ss: Ptr, i: number): Ptr {
	const _r = callPtr('union_spanset_int_w', [ptrArgType(), 'number'], [ptrArgVal(ss), i]);
	checkMeosError();
	return _r;
}

export function union_spanset_span(ss: Ptr, s: Ptr): Ptr {
	const _r = callPtr('union_spanset_span_w', [ptrArgType(), ptrArgType()], [ptrArgVal(ss), ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function union_spanset_spanset(ss1: Ptr, ss2: Ptr): Ptr {
	const _r = callPtr('union_spanset_spanset_w', [ptrArgType(), ptrArgType()], [ptrArgVal(ss1), ptrArgVal(ss2)]);
	checkMeosError();
	return _r;
}

export function union_spanset_timestamptz(ss: Ptr, t: TimestampTz): Ptr {
	const _r = callPtr('union_spanset_timestamptz_w', [ptrArgType(), 'bigint'], [ptrArgVal(ss), BigInt(t)]);
	checkMeosError();
	return _r;
}

export function union_text_set(txt: string, s: Ptr): Ptr {
	const _r = callPtr('union_text_set_w', ['string', ptrArgType()], [txt, ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function union_timestamptz_set(t: TimestampTz, s: Ptr): Ptr {
	const _r = callPtr('union_timestamptz_set_w', ['bigint', ptrArgType()], [BigInt(t), ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function union_timestamptz_span(t: TimestampTz, s: Ptr): Ptr {
	const _r = callPtr('union_timestamptz_span_w', ['bigint', ptrArgType()], [BigInt(t), ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function union_timestamptz_spanset(t: TimestampTz, ss: Ptr): Ptr {
	const _r = callPtr('union_timestamptz_spanset_w', ['bigint', ptrArgType()], [BigInt(t), ptrArgVal(ss)]);
	checkMeosError();
	return _r;
}

export function distance_bigintset_bigintset(s1: Ptr, s2: Ptr): number {
	const _r = Number(call<bigint>('distance_bigintset_bigintset_w', 'bigint', [ptrArgType(), ptrArgType()], [ptrArgVal(s1), ptrArgVal(s2)]));
	checkMeosError();
	return _r;
}

export function distance_bigintspan_bigintspan(s1: Ptr, s2: Ptr): number {
	const _r = Number(call<bigint>('distance_bigintspan_bigintspan_w', 'bigint', [ptrArgType(), ptrArgType()], [ptrArgVal(s1), ptrArgVal(s2)]));
	checkMeosError();
	return _r;
}

export function distance_bigintspanset_bigintspan(ss: Ptr, s: Ptr): number {
	const _r = Number(call<bigint>('distance_bigintspanset_bigintspan_w', 'bigint', [ptrArgType(), ptrArgType()], [ptrArgVal(ss), ptrArgVal(s)]));
	checkMeosError();
	return _r;
}

export function distance_bigintspanset_bigintspanset(ss1: Ptr, ss2: Ptr): number {
	const _r = Number(call<bigint>('distance_bigintspanset_bigintspanset_w', 'bigint', [ptrArgType(), ptrArgType()], [ptrArgVal(ss1), ptrArgVal(ss2)]));
	checkMeosError();
	return _r;
}

export function distance_dateset_dateset(s1: Ptr, s2: Ptr): number {
	const _r = call<number>('distance_dateset_dateset_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(s1), ptrArgVal(s2)]);
	checkMeosError();
	return _r;
}

export function distance_datespan_datespan(s1: Ptr, s2: Ptr): number {
	const _r = call<number>('distance_datespan_datespan_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(s1), ptrArgVal(s2)]);
	checkMeosError();
	return _r;
}

export function distance_datespanset_datespan(ss: Ptr, s: Ptr): number {
	const _r = call<number>('distance_datespanset_datespan_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(ss), ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function distance_datespanset_datespanset(ss1: Ptr, ss2: Ptr): number {
	const _r = call<number>('distance_datespanset_datespanset_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(ss1), ptrArgVal(ss2)]);
	checkMeosError();
	return _r;
}

export function distance_floatset_floatset(s1: Ptr, s2: Ptr): number {
	const _r = call<number>('distance_floatset_floatset_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(s1), ptrArgVal(s2)]);
	checkMeosError();
	return _r;
}

export function distance_floatspan_floatspan(s1: Ptr, s2: Ptr): number {
	const _r = call<number>('distance_floatspan_floatspan_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(s1), ptrArgVal(s2)]);
	checkMeosError();
	return _r;
}

export function distance_floatspanset_floatspan(ss: Ptr, s: Ptr): number {
	const _r = call<number>('distance_floatspanset_floatspan_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(ss), ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function distance_floatspanset_floatspanset(ss1: Ptr, ss2: Ptr): number {
	const _r = call<number>('distance_floatspanset_floatspanset_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(ss1), ptrArgVal(ss2)]);
	checkMeosError();
	return _r;
}

export function distance_intset_intset(s1: Ptr, s2: Ptr): number {
	const _r = call<number>('distance_intset_intset_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(s1), ptrArgVal(s2)]);
	checkMeosError();
	return _r;
}

export function distance_intspan_intspan(s1: Ptr, s2: Ptr): number {
	const _r = call<number>('distance_intspan_intspan_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(s1), ptrArgVal(s2)]);
	checkMeosError();
	return _r;
}

export function distance_intspanset_intspan(ss: Ptr, s: Ptr): number {
	const _r = call<number>('distance_intspanset_intspan_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(ss), ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function distance_intspanset_intspanset(ss1: Ptr, ss2: Ptr): number {
	const _r = call<number>('distance_intspanset_intspanset_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(ss1), ptrArgVal(ss2)]);
	checkMeosError();
	return _r;
}

export function distance_set_bigint(s: Ptr, i: number): number {
	const _r = Number(call<bigint>('distance_set_bigint_w', 'bigint', [ptrArgType(), 'bigint'], [ptrArgVal(s), BigInt(i)]));
	checkMeosError();
	return _r;
}

export function distance_set_date(s: Ptr, d: DateADT): number {
	const _r = call<number>('distance_set_date_w', 'number', [ptrArgType(), 'number'], [ptrArgVal(s), d]);
	checkMeosError();
	return _r;
}

export function distance_set_float(s: Ptr, d: number): number {
	const _r = call<number>('distance_set_float_w', 'number', [ptrArgType(), 'number'], [ptrArgVal(s), d]);
	checkMeosError();
	return _r;
}

export function distance_set_int(s: Ptr, i: number): number {
	const _r = call<number>('distance_set_int_w', 'number', [ptrArgType(), 'number'], [ptrArgVal(s), i]);
	checkMeosError();
	return _r;
}

export function distance_set_timestamptz(s: Ptr, t: TimestampTz): number {
	const _r = call<number>('distance_set_timestamptz_w', 'number', [ptrArgType(), 'bigint'], [ptrArgVal(s), BigInt(t)]);
	checkMeosError();
	return _r;
}

export function distance_span_bigint(s: Ptr, i: number): number {
	const _r = Number(call<bigint>('distance_span_bigint_w', 'bigint', [ptrArgType(), 'bigint'], [ptrArgVal(s), BigInt(i)]));
	checkMeosError();
	return _r;
}

export function distance_span_date(s: Ptr, d: DateADT): number {
	const _r = call<number>('distance_span_date_w', 'number', [ptrArgType(), 'number'], [ptrArgVal(s), d]);
	checkMeosError();
	return _r;
}

export function distance_span_float(s: Ptr, d: number): number {
	const _r = call<number>('distance_span_float_w', 'number', [ptrArgType(), 'number'], [ptrArgVal(s), d]);
	checkMeosError();
	return _r;
}

export function distance_span_int(s: Ptr, i: number): number {
	const _r = call<number>('distance_span_int_w', 'number', [ptrArgType(), 'number'], [ptrArgVal(s), i]);
	checkMeosError();
	return _r;
}

export function distance_span_timestamptz(s: Ptr, t: TimestampTz): number {
	const _r = call<number>('distance_span_timestamptz_w', 'number', [ptrArgType(), 'bigint'], [ptrArgVal(s), BigInt(t)]);
	checkMeosError();
	return _r;
}

export function distance_spanset_bigint(ss: Ptr, i: number): number {
	const _r = Number(call<bigint>('distance_spanset_bigint_w', 'bigint', [ptrArgType(), 'bigint'], [ptrArgVal(ss), BigInt(i)]));
	checkMeosError();
	return _r;
}

export function distance_spanset_date(ss: Ptr, d: DateADT): number {
	const _r = call<number>('distance_spanset_date_w', 'number', [ptrArgType(), 'number'], [ptrArgVal(ss), d]);
	checkMeosError();
	return _r;
}

export function distance_spanset_float(ss: Ptr, d: number): number {
	const _r = call<number>('distance_spanset_float_w', 'number', [ptrArgType(), 'number'], [ptrArgVal(ss), d]);
	checkMeosError();
	return _r;
}

export function distance_spanset_int(ss: Ptr, i: number): number {
	const _r = call<number>('distance_spanset_int_w', 'number', [ptrArgType(), 'number'], [ptrArgVal(ss), i]);
	checkMeosError();
	return _r;
}

export function distance_spanset_timestamptz(ss: Ptr, t: TimestampTz): number {
	const _r = call<number>('distance_spanset_timestamptz_w', 'number', [ptrArgType(), 'bigint'], [ptrArgVal(ss), BigInt(t)]);
	checkMeosError();
	return _r;
}

export function distance_tstzset_tstzset(s1: Ptr, s2: Ptr): number {
	const _r = call<number>('distance_tstzset_tstzset_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(s1), ptrArgVal(s2)]);
	checkMeosError();
	return _r;
}

export function distance_tstzspan_tstzspan(s1: Ptr, s2: Ptr): number {
	const _r = call<number>('distance_tstzspan_tstzspan_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(s1), ptrArgVal(s2)]);
	checkMeosError();
	return _r;
}

export function distance_tstzspanset_tstzspan(ss: Ptr, s: Ptr): number {
	const _r = call<number>('distance_tstzspanset_tstzspan_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(ss), ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function distance_tstzspanset_tstzspanset(ss1: Ptr, ss2: Ptr): number {
	const _r = call<number>('distance_tstzspanset_tstzspanset_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(ss1), ptrArgVal(ss2)]);
	checkMeosError();
	return _r;
}

export function bigint_extent_transfn(state: Ptr, i: number): Ptr {
	const _r = callPtr('bigint_extent_transfn_w', [ptrArgType(), 'bigint'], [ptrArgVal(state), BigInt(i)]);
	checkMeosError();
	return _r;
}

export function bigint_union_transfn(state: Ptr, i: number): Ptr {
	const _r = callPtr('bigint_union_transfn_w', [ptrArgType(), 'bigint'], [ptrArgVal(state), BigInt(i)]);
	checkMeosError();
	return _r;
}

export function date_extent_transfn(state: Ptr, d: DateADT): Ptr {
	const _r = callPtr('date_extent_transfn_w', [ptrArgType(), 'number'], [ptrArgVal(state), d]);
	checkMeosError();
	return _r;
}

export function date_union_transfn(state: Ptr, d: DateADT): Ptr {
	const _r = callPtr('date_union_transfn_w', [ptrArgType(), 'number'], [ptrArgVal(state), d]);
	checkMeosError();
	return _r;
}

export function float_extent_transfn(state: Ptr, d: number): Ptr {
	const _r = callPtr('float_extent_transfn_w', [ptrArgType(), 'number'], [ptrArgVal(state), d]);
	checkMeosError();
	return _r;
}

export function float_union_transfn(state: Ptr, d: number): Ptr {
	const _r = callPtr('float_union_transfn_w', [ptrArgType(), 'number'], [ptrArgVal(state), d]);
	checkMeosError();
	return _r;
}

export function int_extent_transfn(state: Ptr, i: number): Ptr {
	const _r = callPtr('int_extent_transfn_w', [ptrArgType(), 'number'], [ptrArgVal(state), i]);
	checkMeosError();
	return _r;
}

export function int_union_transfn(state: Ptr, i: number): Ptr {
	const _r = callPtr('int_union_transfn_w', [ptrArgType(), 'number'], [ptrArgVal(state), i]);
	checkMeosError();
	return _r;
}

export function set_extent_transfn(state: Ptr, s: Ptr): Ptr {
	const _r = callPtr('set_extent_transfn_w', [ptrArgType(), ptrArgType()], [ptrArgVal(state), ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function set_union_finalfn(state: Ptr): Ptr {
	const _r = callPtr('set_union_finalfn_w', [ptrArgType()], [ptrArgVal(state)]);
	checkMeosError();
	return _r;
}

export function set_union_transfn(state: Ptr, s: Ptr): Ptr {
	const _r = callPtr('set_union_transfn_w', [ptrArgType(), ptrArgType()], [ptrArgVal(state), ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function span_extent_transfn(state: Ptr, s: Ptr): Ptr {
	const _r = callPtr('span_extent_transfn_w', [ptrArgType(), ptrArgType()], [ptrArgVal(state), ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function span_union_transfn(state: Ptr, s: Ptr): Ptr {
	const _r = callPtr('span_union_transfn_w', [ptrArgType(), ptrArgType()], [ptrArgVal(state), ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function spanset_extent_transfn(state: Ptr, ss: Ptr): Ptr {
	const _r = callPtr('spanset_extent_transfn_w', [ptrArgType(), ptrArgType()], [ptrArgVal(state), ptrArgVal(ss)]);
	checkMeosError();
	return _r;
}

export function spanset_union_finalfn(state: Ptr): Ptr {
	const _r = callPtr('spanset_union_finalfn_w', [ptrArgType()], [ptrArgVal(state)]);
	checkMeosError();
	return _r;
}

export function spanset_union_transfn(state: Ptr, ss: Ptr): Ptr {
	const _r = callPtr('spanset_union_transfn_w', [ptrArgType(), ptrArgType()], [ptrArgVal(state), ptrArgVal(ss)]);
	checkMeosError();
	return _r;
}

export function text_union_transfn(state: Ptr, txt: string): Ptr {
	const _r = callPtr('text_union_transfn_w', [ptrArgType(), 'string'], [ptrArgVal(state), txt]);
	checkMeosError();
	return _r;
}

export function timestamptz_extent_transfn(state: Ptr, t: TimestampTz): Ptr {
	const _r = callPtr('timestamptz_extent_transfn_w', [ptrArgType(), 'bigint'], [ptrArgVal(state), BigInt(t)]);
	checkMeosError();
	return _r;
}

export function timestamptz_union_transfn(state: Ptr, t: TimestampTz): Ptr {
	const _r = callPtr('timestamptz_union_transfn_w', [ptrArgType(), 'bigint'], [ptrArgVal(state), BigInt(t)]);
	checkMeosError();
	return _r;
}

export function bigint_get_bin(value: number, vsize: number, vorigin: number): number {
	const _r = Number(call<bigint>('bigint_get_bin_w', 'bigint', ['bigint', 'bigint', 'bigint'], [BigInt(value), BigInt(vsize), BigInt(vorigin)]));
	checkMeosError();
	return _r;
}

export function bigintspan_bins(s: Ptr, vsize: number, vorigin: number, count: Ptr): Ptr {
	const _r = callPtr('bigintspan_bins_w', [ptrArgType(), 'bigint', 'bigint', ptrArgType()], [ptrArgVal(s), BigInt(vsize), BigInt(vorigin), ptrArgVal(count)]);
	checkMeosError();
	return _r;
}

export function bigintspanset_bins(ss: Ptr, vsize: number, vorigin: number, count: Ptr): Ptr {
	const _r = callPtr('bigintspanset_bins_w', [ptrArgType(), 'bigint', 'bigint', ptrArgType()], [ptrArgVal(ss), BigInt(vsize), BigInt(vorigin), ptrArgVal(count)]);
	checkMeosError();
	return _r;
}

export function date_get_bin(d: DateADT, duration: Ptr, torigin: DateADT): DateADT {
	const _r = call<DateADT>('date_get_bin_w', 'number', ['number', ptrArgType(), 'number'], [d, ptrArgVal(duration), torigin]);
	checkMeosError();
	return _r;
}

export function datespan_bins(s: Ptr, duration: Ptr, torigin: DateADT, count: Ptr): Ptr {
	const _r = callPtr('datespan_bins_w', [ptrArgType(), ptrArgType(), 'number', ptrArgType()], [ptrArgVal(s), ptrArgVal(duration), torigin, ptrArgVal(count)]);
	checkMeosError();
	return _r;
}

export function datespanset_bins(ss: Ptr, duration: Ptr, torigin: DateADT, count: Ptr): Ptr {
	const _r = callPtr('datespanset_bins_w', [ptrArgType(), ptrArgType(), 'number', ptrArgType()], [ptrArgVal(ss), ptrArgVal(duration), torigin, ptrArgVal(count)]);
	checkMeosError();
	return _r;
}

export function float_get_bin(value: number, vsize: number, vorigin: number): number {
	const _r = call<number>('float_get_bin_w', 'number', ['number', 'number', 'number'], [value, vsize, vorigin]);
	checkMeosError();
	return _r;
}

export function floatspan_bins(s: Ptr, vsize: number, vorigin: number, count: Ptr): Ptr {
	const _r = callPtr('floatspan_bins_w', [ptrArgType(), 'number', 'number', ptrArgType()], [ptrArgVal(s), vsize, vorigin, ptrArgVal(count)]);
	checkMeosError();
	return _r;
}

export function floatspanset_bins(ss: Ptr, vsize: number, vorigin: number, count: Ptr): Ptr {
	const _r = callPtr('floatspanset_bins_w', [ptrArgType(), 'number', 'number', ptrArgType()], [ptrArgVal(ss), vsize, vorigin, ptrArgVal(count)]);
	checkMeosError();
	return _r;
}

export function int_get_bin(value: number, vsize: number, vorigin: number): number {
	const _r = call<number>('int_get_bin_w', 'number', ['number', 'number', 'number'], [value, vsize, vorigin]);
	checkMeosError();
	return _r;
}

export function intspan_bins(s: Ptr, vsize: number, vorigin: number, count: Ptr): Ptr {
	const _r = callPtr('intspan_bins_w', [ptrArgType(), 'number', 'number', ptrArgType()], [ptrArgVal(s), vsize, vorigin, ptrArgVal(count)]);
	checkMeosError();
	return _r;
}

export function intspanset_bins(ss: Ptr, vsize: number, vorigin: number, count: Ptr): Ptr {
	const _r = callPtr('intspanset_bins_w', [ptrArgType(), 'number', 'number', ptrArgType()], [ptrArgVal(ss), vsize, vorigin, ptrArgVal(count)]);
	checkMeosError();
	return _r;
}

export function timestamptz_get_bin(t: TimestampTz, duration: Ptr, torigin: TimestampTz): TimestampTz {
	const _r = call<TimestampTz>('timestamptz_get_bin_w', 'number', ['bigint', ptrArgType(), 'bigint'], [BigInt(t), ptrArgVal(duration), BigInt(torigin)]);
	checkMeosError();
	return _r;
}

export function tstzspan_bins(s: Ptr, duration: Ptr, origin: TimestampTz, count: Ptr): Ptr {
	const _r = callPtr('tstzspan_bins_w', [ptrArgType(), ptrArgType(), 'bigint', ptrArgType()], [ptrArgVal(s), ptrArgVal(duration), BigInt(origin), ptrArgVal(count)]);
	checkMeosError();
	return _r;
}

export function tstzspanset_bins(ss: Ptr, duration: Ptr, torigin: TimestampTz, count: Ptr): Ptr {
	const _r = callPtr('tstzspanset_bins_w', [ptrArgType(), ptrArgType(), 'bigint', ptrArgType()], [ptrArgVal(ss), ptrArgVal(duration), BigInt(torigin), ptrArgVal(count)]);
	checkMeosError();
	return _r;
}

export function tbox_as_hexwkb(box: Ptr, variant: number, size: Ptr): string {
	const _r = call<string>('tbox_as_hexwkb_w', 'string', [ptrArgType(), 'number', ptrArgType()], [ptrArgVal(box), variant, ptrArgVal(size)]);
	checkMeosError();
	return _r;
}

export function tbox_as_wkb(box: Ptr, variant: number, size_out: Ptr): Ptr {
	const _r = callPtr('tbox_as_wkb_w', [ptrArgType(), 'number', ptrArgType()], [ptrArgVal(box), variant, ptrArgVal(size_out)]);
	checkMeosError();
	return _r;
}

export function tbox_from_hexwkb(hexwkb: string): Ptr {
	const _r = callPtr('tbox_from_hexwkb_w', ['string'], [hexwkb]);
	checkMeosError();
	return _r;
}

export function tbox_from_wkb(wkb: Ptr, size: number): Ptr {
	const _r = callPtr('tbox_from_wkb_w', [ptrArgType(), 'number'], [ptrArgVal(wkb), size]);
	checkMeosError();
	return _r;
}

export function tbox_in(str: string): Ptr {
	const _r = callPtr('tbox_in_w', ['string'], [str]);
	checkMeosError();
	return _r;
}

export function tbox_out(box: Ptr, maxdd: number): string {
	const _r = call<string>('tbox_out_w', 'string', [ptrArgType(), 'number'], [ptrArgVal(box), maxdd]);
	checkMeosError();
	return _r;
}

export function float_timestamptz_to_tbox(d: number, t: TimestampTz): Ptr {
	const _r = callPtr('float_timestamptz_to_tbox_w', ['number', 'bigint'], [d, BigInt(t)]);
	checkMeosError();
	return _r;
}

export function float_tstzspan_to_tbox(d: number, s: Ptr): Ptr {
	const _r = callPtr('float_tstzspan_to_tbox_w', ['number', ptrArgType()], [d, ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function int_timestamptz_to_tbox(i: number, t: TimestampTz): Ptr {
	const _r = callPtr('int_timestamptz_to_tbox_w', ['number', 'bigint'], [i, BigInt(t)]);
	checkMeosError();
	return _r;
}

export function int_tstzspan_to_tbox(i: number, s: Ptr): Ptr {
	const _r = callPtr('int_tstzspan_to_tbox_w', ['number', ptrArgType()], [i, ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function numspan_tstzspan_to_tbox(span: Ptr, s: Ptr): Ptr {
	const _r = callPtr('numspan_tstzspan_to_tbox_w', [ptrArgType(), ptrArgType()], [ptrArgVal(span), ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function numspan_timestamptz_to_tbox(span: Ptr, t: TimestampTz): Ptr {
	const _r = callPtr('numspan_timestamptz_to_tbox_w', [ptrArgType(), 'bigint'], [ptrArgVal(span), BigInt(t)]);
	checkMeosError();
	return _r;
}

export function tbox_copy(box: Ptr): Ptr {
	const _r = callPtr('tbox_copy_w', [ptrArgType()], [ptrArgVal(box)]);
	checkMeosError();
	return _r;
}

export function tbox_make(s: Ptr, p: Ptr): Ptr {
	const _r = callPtr('tbox_make_w', [ptrArgType(), ptrArgType()], [ptrArgVal(s), ptrArgVal(p)]);
	checkMeosError();
	return _r;
}

export function float_to_tbox(d: number): Ptr {
	const _r = callPtr('float_to_tbox_w', ['number'], [d]);
	checkMeosError();
	return _r;
}

export function int_to_tbox(i: number): Ptr {
	const _r = callPtr('int_to_tbox_w', ['number'], [i]);
	checkMeosError();
	return _r;
}

export function set_to_tbox(s: Ptr): Ptr {
	const _r = callPtr('set_to_tbox_w', [ptrArgType()], [ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function span_to_tbox(s: Ptr): Ptr {
	const _r = callPtr('span_to_tbox_w', [ptrArgType()], [ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function spanset_to_tbox(ss: Ptr): Ptr {
	const _r = callPtr('spanset_to_tbox_w', [ptrArgType()], [ptrArgVal(ss)]);
	checkMeosError();
	return _r;
}

export function tbox_to_intspan(box: Ptr): Ptr {
	const _r = callPtr('tbox_to_intspan_w', [ptrArgType()], [ptrArgVal(box)]);
	checkMeosError();
	return _r;
}

export function tbox_to_floatspan(box: Ptr): Ptr {
	const _r = callPtr('tbox_to_floatspan_w', [ptrArgType()], [ptrArgVal(box)]);
	checkMeosError();
	return _r;
}

export function tbox_to_tstzspan(box: Ptr): Ptr {
	const _r = callPtr('tbox_to_tstzspan_w', [ptrArgType()], [ptrArgVal(box)]);
	checkMeosError();
	return _r;
}

export function timestamptz_to_tbox(t: TimestampTz): Ptr {
	const _r = callPtr('timestamptz_to_tbox_w', ['bigint'], [BigInt(t)]);
	checkMeosError();
	return _r;
}

export function tbox_hash(box: Ptr): number {
	const _r = call<number>('tbox_hash_w', 'number', [ptrArgType()], [ptrArgVal(box)]);
	checkMeosError();
	return _r;
}

export function tbox_hash_extended(box: Ptr, seed: number): number {
	const _r = Number(call<bigint>('tbox_hash_extended_w', 'bigint', [ptrArgType(), 'bigint'], [ptrArgVal(box), BigInt(seed)]));
	checkMeosError();
	return _r;
}

export function tbox_hast(box: Ptr): boolean {
	const _r = call<number>('tbox_hast_w', 'number', [ptrArgType()], [ptrArgVal(box)]) !== 0;
	checkMeosError();
	return _r;
}

export function tbox_hasx(box: Ptr): boolean {
	const _r = call<number>('tbox_hasx_w', 'number', [ptrArgType()], [ptrArgVal(box)]) !== 0;
	checkMeosError();
	return _r;
}

export function tbox_tmax(box: Ptr): TimestampTz {
	const _r = call<TimestampTz>('tbox_tmax_w', 'number', [ptrArgType()], [ptrArgVal(box)]);
	checkMeosError();
	return _r;
}

export function tbox_tmax_inc(box: Ptr): boolean {
	const _r = call<number>('tbox_tmax_inc_w', 'number', [ptrArgType()], [ptrArgVal(box)]) !== 0;
	checkMeosError();
	return _r;
}

export function tbox_tmin(box: Ptr): TimestampTz {
	const _r = call<TimestampTz>('tbox_tmin_w', 'number', [ptrArgType()], [ptrArgVal(box)]);
	checkMeosError();
	return _r;
}

export function tbox_tmin_inc(box: Ptr): boolean {
	const _r = call<number>('tbox_tmin_inc_w', 'number', [ptrArgType()], [ptrArgVal(box)]) !== 0;
	checkMeosError();
	return _r;
}

export function tbox_xmax(box: Ptr): number {
	const _r = call<number>('tbox_xmax_w', 'number', [ptrArgType()], [ptrArgVal(box)]);
	checkMeosError();
	return _r;
}

export function tbox_xmax_inc(box: Ptr): boolean {
	const _r = call<number>('tbox_xmax_inc_w', 'number', [ptrArgType()], [ptrArgVal(box)]) !== 0;
	checkMeosError();
	return _r;
}

export function tbox_xmin(box: Ptr): number {
	const _r = call<number>('tbox_xmin_w', 'number', [ptrArgType()], [ptrArgVal(box)]);
	checkMeosError();
	return _r;
}

export function tbox_xmin_inc(box: Ptr): boolean {
	const _r = call<number>('tbox_xmin_inc_w', 'number', [ptrArgType()], [ptrArgVal(box)]) !== 0;
	checkMeosError();
	return _r;
}

export function tboxfloat_xmax(box: Ptr): number {
	const _r = call<number>('tboxfloat_xmax_w', 'number', [ptrArgType()], [ptrArgVal(box)]);
	checkMeosError();
	return _r;
}

export function tboxfloat_xmin(box: Ptr): number {
	const _r = call<number>('tboxfloat_xmin_w', 'number', [ptrArgType()], [ptrArgVal(box)]);
	checkMeosError();
	return _r;
}

export function tboxint_xmax(box: Ptr): number {
	const _r = call<number>('tboxint_xmax_w', 'number', [ptrArgType()], [ptrArgVal(box)]);
	checkMeosError();
	return _r;
}

export function tboxint_xmin(box: Ptr): number {
	const _r = call<number>('tboxint_xmin_w', 'number', [ptrArgType()], [ptrArgVal(box)]);
	checkMeosError();
	return _r;
}

export function tbox_expand_time(box: Ptr, interv: Ptr): Ptr {
	const _r = callPtr('tbox_expand_time_w', [ptrArgType(), ptrArgType()], [ptrArgVal(box), ptrArgVal(interv)]);
	checkMeosError();
	return _r;
}

export function tbox_round(box: Ptr, maxdd: number): Ptr {
	const _r = callPtr('tbox_round_w', [ptrArgType(), 'number'], [ptrArgVal(box), maxdd]);
	checkMeosError();
	return _r;
}

export function tbox_shift_scale_time(box: Ptr, shift: Ptr, duration: Ptr): Ptr {
	const _r = callPtr('tbox_shift_scale_time_w', [ptrArgType(), ptrArgType(), ptrArgType()], [ptrArgVal(box), ptrArgVal(shift), ptrArgVal(duration)]);
	checkMeosError();
	return _r;
}

export function tfloatbox_expand(box: Ptr, d: number): Ptr {
	const _r = callPtr('tfloatbox_expand_w', [ptrArgType(), 'number'], [ptrArgVal(box), d]);
	checkMeosError();
	return _r;
}

export function tfloatbox_shift_scale(box: Ptr, shift: number, width: number, hasshift: boolean, haswidth: boolean): Ptr {
	const _r = callPtr('tfloatbox_shift_scale_w', [ptrArgType(), 'number', 'number', 'number', 'number'], [ptrArgVal(box), shift, width, hasshift ? 1 : 0, haswidth ? 1 : 0]);
	checkMeosError();
	return _r;
}

export function tintbox_expand(box: Ptr, i: number): Ptr {
	const _r = callPtr('tintbox_expand_w', [ptrArgType(), 'number'], [ptrArgVal(box), i]);
	checkMeosError();
	return _r;
}

export function tintbox_shift_scale(box: Ptr, shift: number, width: number, hasshift: boolean, haswidth: boolean): Ptr {
	const _r = callPtr('tintbox_shift_scale_w', [ptrArgType(), 'number', 'number', 'number', 'number'], [ptrArgVal(box), shift, width, hasshift ? 1 : 0, haswidth ? 1 : 0]);
	checkMeosError();
	return _r;
}

export function union_tbox_tbox(box1: Ptr, box2: Ptr, strict: boolean): Ptr {
	const _r = callPtr('union_tbox_tbox_w', [ptrArgType(), ptrArgType(), 'number'], [ptrArgVal(box1), ptrArgVal(box2), strict ? 1 : 0]);
	checkMeosError();
	return _r;
}

export function intersection_tbox_tbox(box1: Ptr, box2: Ptr): Ptr {
	const _r = callPtr('intersection_tbox_tbox_w', [ptrArgType(), ptrArgType()], [ptrArgVal(box1), ptrArgVal(box2)]);
	checkMeosError();
	return _r;
}

export function adjacent_tbox_tbox(box1: Ptr, box2: Ptr): boolean {
	const _r = call<number>('adjacent_tbox_tbox_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(box1), ptrArgVal(box2)]) !== 0;
	checkMeosError();
	return _r;
}

export function contained_tbox_tbox(box1: Ptr, box2: Ptr): boolean {
	const _r = call<number>('contained_tbox_tbox_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(box1), ptrArgVal(box2)]) !== 0;
	checkMeosError();
	return _r;
}

export function contains_tbox_tbox(box1: Ptr, box2: Ptr): boolean {
	const _r = call<number>('contains_tbox_tbox_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(box1), ptrArgVal(box2)]) !== 0;
	checkMeosError();
	return _r;
}

export function overlaps_tbox_tbox(box1: Ptr, box2: Ptr): boolean {
	const _r = call<number>('overlaps_tbox_tbox_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(box1), ptrArgVal(box2)]) !== 0;
	checkMeosError();
	return _r;
}

export function same_tbox_tbox(box1: Ptr, box2: Ptr): boolean {
	const _r = call<number>('same_tbox_tbox_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(box1), ptrArgVal(box2)]) !== 0;
	checkMeosError();
	return _r;
}

export function after_tbox_tbox(box1: Ptr, box2: Ptr): boolean {
	const _r = call<number>('after_tbox_tbox_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(box1), ptrArgVal(box2)]) !== 0;
	checkMeosError();
	return _r;
}

export function before_tbox_tbox(box1: Ptr, box2: Ptr): boolean {
	const _r = call<number>('before_tbox_tbox_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(box1), ptrArgVal(box2)]) !== 0;
	checkMeosError();
	return _r;
}

export function left_tbox_tbox(box1: Ptr, box2: Ptr): boolean {
	const _r = call<number>('left_tbox_tbox_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(box1), ptrArgVal(box2)]) !== 0;
	checkMeosError();
	return _r;
}

export function overafter_tbox_tbox(box1: Ptr, box2: Ptr): boolean {
	const _r = call<number>('overafter_tbox_tbox_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(box1), ptrArgVal(box2)]) !== 0;
	checkMeosError();
	return _r;
}

export function overbefore_tbox_tbox(box1: Ptr, box2: Ptr): boolean {
	const _r = call<number>('overbefore_tbox_tbox_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(box1), ptrArgVal(box2)]) !== 0;
	checkMeosError();
	return _r;
}

export function overleft_tbox_tbox(box1: Ptr, box2: Ptr): boolean {
	const _r = call<number>('overleft_tbox_tbox_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(box1), ptrArgVal(box2)]) !== 0;
	checkMeosError();
	return _r;
}

export function overright_tbox_tbox(box1: Ptr, box2: Ptr): boolean {
	const _r = call<number>('overright_tbox_tbox_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(box1), ptrArgVal(box2)]) !== 0;
	checkMeosError();
	return _r;
}

export function right_tbox_tbox(box1: Ptr, box2: Ptr): boolean {
	const _r = call<number>('right_tbox_tbox_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(box1), ptrArgVal(box2)]) !== 0;
	checkMeosError();
	return _r;
}

export function tbox_cmp(box1: Ptr, box2: Ptr): number {
	const _r = call<number>('tbox_cmp_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(box1), ptrArgVal(box2)]);
	checkMeosError();
	return _r;
}

export function tbox_eq(box1: Ptr, box2: Ptr): boolean {
	const _r = call<number>('tbox_eq_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(box1), ptrArgVal(box2)]) !== 0;
	checkMeosError();
	return _r;
}

export function tbox_ge(box1: Ptr, box2: Ptr): boolean {
	const _r = call<number>('tbox_ge_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(box1), ptrArgVal(box2)]) !== 0;
	checkMeosError();
	return _r;
}

export function tbox_gt(box1: Ptr, box2: Ptr): boolean {
	const _r = call<number>('tbox_gt_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(box1), ptrArgVal(box2)]) !== 0;
	checkMeosError();
	return _r;
}

export function tbox_le(box1: Ptr, box2: Ptr): boolean {
	const _r = call<number>('tbox_le_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(box1), ptrArgVal(box2)]) !== 0;
	checkMeosError();
	return _r;
}

export function tbox_lt(box1: Ptr, box2: Ptr): boolean {
	const _r = call<number>('tbox_lt_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(box1), ptrArgVal(box2)]) !== 0;
	checkMeosError();
	return _r;
}

export function tbox_ne(box1: Ptr, box2: Ptr): boolean {
	const _r = call<number>('tbox_ne_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(box1), ptrArgVal(box2)]) !== 0;
	checkMeosError();
	return _r;
}

export function tbool_from_mfjson(str: string): Ptr {
	const _r = callPtr('tbool_from_mfjson_w', ['string'], [str]);
	checkMeosError();
	return _r;
}

export function tbool_in(str: string): Ptr {
	const _r = callPtr('tbool_in_w', ['string'], [str]);
	checkMeosError();
	return _r;
}

export function tbool_out(temp: Ptr): string {
	const _r = call<string>('tbool_out_w', 'string', [ptrArgType()], [ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function temporal_as_wkb(temp: Ptr, variant: number, size_out: Ptr): Ptr {
	const _r = callPtr('temporal_as_wkb_w', [ptrArgType(), 'number', ptrArgType()], [ptrArgVal(temp), variant, ptrArgVal(size_out)]);
	checkMeosError();
	return _r;
}

export function temporal_from_hexwkb(hexwkb: string): Ptr {
	const _r = callPtr('temporal_from_hexwkb_w', ['string'], [hexwkb]);
	checkMeosError();
	return _r;
}

export function temporal_from_wkb(wkb: Ptr, size: number): Ptr {
	const _r = callPtr('temporal_from_wkb_w', [ptrArgType(), 'number'], [ptrArgVal(wkb), size]);
	checkMeosError();
	return _r;
}

export function tfloat_from_mfjson(str: string): Ptr {
	const _r = callPtr('tfloat_from_mfjson_w', ['string'], [str]);
	checkMeosError();
	return _r;
}

export function tfloat_in(str: string): Ptr {
	const _r = callPtr('tfloat_in_w', ['string'], [str]);
	checkMeosError();
	return _r;
}

export function tfloat_out(temp: Ptr, maxdd: number): string {
	const _r = call<string>('tfloat_out_w', 'string', [ptrArgType(), 'number'], [ptrArgVal(temp), maxdd]);
	checkMeosError();
	return _r;
}

export function tint_from_mfjson(str: string): Ptr {
	const _r = callPtr('tint_from_mfjson_w', ['string'], [str]);
	checkMeosError();
	return _r;
}

export function tint_in(str: string): Ptr {
	const _r = callPtr('tint_in_w', ['string'], [str]);
	checkMeosError();
	return _r;
}

export function tint_out(temp: Ptr): string {
	const _r = call<string>('tint_out_w', 'string', [ptrArgType()], [ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function ttext_from_mfjson(str: string): Ptr {
	const _r = callPtr('ttext_from_mfjson_w', ['string'], [str]);
	checkMeosError();
	return _r;
}

export function ttext_in(str: string): Ptr {
	const _r = callPtr('ttext_in_w', ['string'], [str]);
	checkMeosError();
	return _r;
}

export function ttext_out(temp: Ptr): string {
	const _r = call<string>('ttext_out_w', 'string', [ptrArgType()], [ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function tbool_from_base_temp(b: boolean, temp: Ptr): Ptr {
	const _r = callPtr('tbool_from_base_temp_w', ['number', ptrArgType()], [b ? 1 : 0, ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function tboolinst_make(b: boolean, t: TimestampTz): Ptr {
	const _r = callPtr('tboolinst_make_w', ['number', 'bigint'], [b ? 1 : 0, BigInt(t)]);
	checkMeosError();
	return _r;
}

export function tboolseq_from_base_tstzset(b: boolean, s: Ptr): Ptr {
	const _r = callPtr('tboolseq_from_base_tstzset_w', ['number', ptrArgType()], [b ? 1 : 0, ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function tboolseq_from_base_tstzspan(b: boolean, s: Ptr): Ptr {
	const _r = callPtr('tboolseq_from_base_tstzspan_w', ['number', ptrArgType()], [b ? 1 : 0, ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function tboolseqset_from_base_tstzspanset(b: boolean, ss: Ptr): Ptr {
	const _r = callPtr('tboolseqset_from_base_tstzspanset_w', ['number', ptrArgType()], [b ? 1 : 0, ptrArgVal(ss)]);
	checkMeosError();
	return _r;
}

export function temporal_copy(temp: Ptr): Ptr {
	const _r = callPtr('temporal_copy_w', [ptrArgType()], [ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function tfloat_from_base_temp(d: number, temp: Ptr): Ptr {
	const _r = callPtr('tfloat_from_base_temp_w', ['number', ptrArgType()], [d, ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function tfloatinst_make(d: number, t: TimestampTz): Ptr {
	const _r = callPtr('tfloatinst_make_w', ['number', 'bigint'], [d, BigInt(t)]);
	checkMeosError();
	return _r;
}

export function tfloatseq_from_base_tstzset(d: number, s: Ptr): Ptr {
	const _r = callPtr('tfloatseq_from_base_tstzset_w', ['number', ptrArgType()], [d, ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function tfloatseq_from_base_tstzspan(d: number, s: Ptr, interp: number): Ptr {
	const _r = callPtr('tfloatseq_from_base_tstzspan_w', ['number', ptrArgType(), 'number'], [d, ptrArgVal(s), interp]);
	checkMeosError();
	return _r;
}

export function tfloatseqset_from_base_tstzspanset(d: number, ss: Ptr, interp: number): Ptr {
	const _r = callPtr('tfloatseqset_from_base_tstzspanset_w', ['number', ptrArgType(), 'number'], [d, ptrArgVal(ss), interp]);
	checkMeosError();
	return _r;
}

export function tint_from_base_temp(i: number, temp: Ptr): Ptr {
	const _r = callPtr('tint_from_base_temp_w', ['number', ptrArgType()], [i, ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function tintinst_make(i: number, t: TimestampTz): Ptr {
	const _r = callPtr('tintinst_make_w', ['number', 'bigint'], [i, BigInt(t)]);
	checkMeosError();
	return _r;
}

export function tintseq_from_base_tstzset(i: number, s: Ptr): Ptr {
	const _r = callPtr('tintseq_from_base_tstzset_w', ['number', ptrArgType()], [i, ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function tintseq_from_base_tstzspan(i: number, s: Ptr): Ptr {
	const _r = callPtr('tintseq_from_base_tstzspan_w', ['number', ptrArgType()], [i, ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function tintseqset_from_base_tstzspanset(i: number, ss: Ptr): Ptr {
	const _r = callPtr('tintseqset_from_base_tstzspanset_w', ['number', ptrArgType()], [i, ptrArgVal(ss)]);
	checkMeosError();
	return _r;
}

export function tsequence_make(instants: Ptr, count: number, lower_inc: boolean, upper_inc: boolean, interp: number, normalize: boolean): Ptr {
	const _r = callPtr('tsequence_make_w', [ptrArgType(), 'number', 'number', 'number', 'number', 'number'], [ptrArgVal(instants), count, lower_inc ? 1 : 0, upper_inc ? 1 : 0, interp, normalize ? 1 : 0]);
	checkMeosError();
	return _r;
}

export function tsequenceset_make(sequences: Ptr, count: number, normalize: boolean): Ptr {
	const _r = callPtr('tsequenceset_make_w', [ptrArgType(), 'number', 'number'], [ptrArgVal(sequences), count, normalize ? 1 : 0]);
	checkMeosError();
	return _r;
}

export function tsequenceset_make_gaps(instants: Ptr, count: number, interp: number, maxt: Ptr, maxdist: number): Ptr {
	const _r = callPtr('tsequenceset_make_gaps_w', [ptrArgType(), 'number', 'number', ptrArgType(), 'number'], [ptrArgVal(instants), count, interp, ptrArgVal(maxt), maxdist]);
	checkMeosError();
	return _r;
}

export function ttext_from_base_temp(txt: string, temp: Ptr): Ptr {
	const _r = callPtr('ttext_from_base_temp_w', ['string', ptrArgType()], [txt, ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function ttextinst_make(txt: string, t: TimestampTz): Ptr {
	const _r = callPtr('ttextinst_make_w', ['string', 'bigint'], [txt, BigInt(t)]);
	checkMeosError();
	return _r;
}

export function ttextseq_from_base_tstzset(txt: string, s: Ptr): Ptr {
	const _r = callPtr('ttextseq_from_base_tstzset_w', ['string', ptrArgType()], [txt, ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function ttextseq_from_base_tstzspan(txt: string, s: Ptr): Ptr {
	const _r = callPtr('ttextseq_from_base_tstzspan_w', ['string', ptrArgType()], [txt, ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function ttextseqset_from_base_tstzspanset(txt: string, ss: Ptr): Ptr {
	const _r = callPtr('ttextseqset_from_base_tstzspanset_w', ['string', ptrArgType()], [txt, ptrArgVal(ss)]);
	checkMeosError();
	return _r;
}

export function tbool_to_tint(temp: Ptr): Ptr {
	const _r = callPtr('tbool_to_tint_w', [ptrArgType()], [ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function temporal_to_tstzspan(temp: Ptr): Ptr {
	const _r = callPtr('temporal_to_tstzspan_w', [ptrArgType()], [ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function tfloat_to_tint(temp: Ptr): Ptr {
	const _r = callPtr('tfloat_to_tint_w', [ptrArgType()], [ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function tint_to_tfloat(temp: Ptr): Ptr {
	const _r = callPtr('tint_to_tfloat_w', [ptrArgType()], [ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function tnumber_to_span(temp: Ptr): Ptr {
	const _r = callPtr('tnumber_to_span_w', [ptrArgType()], [ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function tnumber_to_tbox(temp: Ptr): Ptr {
	const _r = callPtr('tnumber_to_tbox_w', [ptrArgType()], [ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function tbool_end_value(temp: Ptr): boolean {
	const _r = call<number>('tbool_end_value_w', 'number', [ptrArgType()], [ptrArgVal(temp)]) !== 0;
	checkMeosError();
	return _r;
}

export function tbool_start_value(temp: Ptr): boolean {
	const _r = call<number>('tbool_start_value_w', 'number', [ptrArgType()], [ptrArgVal(temp)]) !== 0;
	checkMeosError();
	return _r;
}

export function tbool_value_at_timestamptz(temp: Ptr, t: TimestampTz, strict: boolean, value: Ptr): boolean {
	const _r = call<number>('tbool_value_at_timestamptz_w', 'number', [ptrArgType(), 'bigint', 'number', ptrArgType()], [ptrArgVal(temp), BigInt(t), strict ? 1 : 0, ptrArgVal(value)]) !== 0;
	checkMeosError();
	return _r;
}

export function tbool_value_n(temp: Ptr, n: number): boolean {
	const _r = call<number>('tbool_value_n_w', 'number', [ptrArgType(), 'number'], [ptrArgVal(temp), n]) !== 0;
	checkMeosError();
	return _r;
}

export function tbool_values(temp: Ptr, count: Ptr): Ptr {
	const _r = callPtr('tbool_values_w', [ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(count)]);
	checkMeosError();
	return _r;
}

export function temporal_end_instant(temp: Ptr): Ptr {
	const _r = callPtr('temporal_end_instant_w', [ptrArgType()], [ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function temporal_end_sequence(temp: Ptr): Ptr {
	const _r = callPtr('temporal_end_sequence_w', [ptrArgType()], [ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function temporal_end_timestamptz(temp: Ptr): TimestampTz {
	const _r = call<TimestampTz>('temporal_end_timestamptz_w', 'number', [ptrArgType()], [ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function temporal_hash(temp: Ptr): number {
	const _r = call<number>('temporal_hash_w', 'number', [ptrArgType()], [ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function temporal_instants(temp: Ptr, count: Ptr): Ptr {
	const _r = callPtr('temporal_instants_w', [ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(count)]);
	checkMeosError();
	return _r;
}

export function temporal_interp(temp: Ptr): string {
	const _r = call<string>('temporal_interp_w', 'string', [ptrArgType()], [ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function temporal_lower_inc(temp: Ptr): boolean {
	const _r = call<number>('temporal_lower_inc_w', 'number', [ptrArgType()], [ptrArgVal(temp)]) !== 0;
	checkMeosError();
	return _r;
}

export function temporal_max_instant(temp: Ptr): Ptr {
	const _r = callPtr('temporal_max_instant_w', [ptrArgType()], [ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function temporal_min_instant(temp: Ptr): Ptr {
	const _r = callPtr('temporal_min_instant_w', [ptrArgType()], [ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function temporal_num_instants(temp: Ptr): number {
	const _r = call<number>('temporal_num_instants_w', 'number', [ptrArgType()], [ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function temporal_num_sequences(temp: Ptr): number {
	const _r = call<number>('temporal_num_sequences_w', 'number', [ptrArgType()], [ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function temporal_num_timestamps(temp: Ptr): number {
	const _r = call<number>('temporal_num_timestamps_w', 'number', [ptrArgType()], [ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function temporal_segm_duration(temp: Ptr, duration: Ptr, atleast: boolean, strict: boolean): Ptr {
	const _r = callPtr('temporal_segm_duration_w', [ptrArgType(), ptrArgType(), 'number', 'number'], [ptrArgVal(temp), ptrArgVal(duration), atleast ? 1 : 0, strict ? 1 : 0]);
	checkMeosError();
	return _r;
}

export function temporal_segments(temp: Ptr, count: Ptr): Ptr {
	const _r = callPtr('temporal_segments_w', [ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(count)]);
	checkMeosError();
	return _r;
}

export function temporal_sequence_n(temp: Ptr, i: number): Ptr {
	const _r = callPtr('temporal_sequence_n_w', [ptrArgType(), 'number'], [ptrArgVal(temp), i]);
	checkMeosError();
	return _r;
}

export function temporal_sequences(temp: Ptr, count: Ptr): Ptr {
	const _r = callPtr('temporal_sequences_w', [ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(count)]);
	checkMeosError();
	return _r;
}

export function temporal_start_instant(temp: Ptr): Ptr {
	const _r = callPtr('temporal_start_instant_w', [ptrArgType()], [ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function temporal_start_sequence(temp: Ptr): Ptr {
	const _r = callPtr('temporal_start_sequence_w', [ptrArgType()], [ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function temporal_start_timestamptz(temp: Ptr): TimestampTz {
	const _r = call<TimestampTz>('temporal_start_timestamptz_w', 'number', [ptrArgType()], [ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function temporal_stops(temp: Ptr, maxdist: number, minduration: Ptr): Ptr {
	const _r = callPtr('temporal_stops_w', [ptrArgType(), 'number', ptrArgType()], [ptrArgVal(temp), maxdist, ptrArgVal(minduration)]);
	checkMeosError();
	return _r;
}

export function temporal_subtype(temp: Ptr): string {
	const _r = call<string>('temporal_subtype_w', 'string', [ptrArgType()], [ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function temporal_time(temp: Ptr): Ptr {
	const _r = callPtr('temporal_time_w', [ptrArgType()], [ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function temporal_timestamps(temp: Ptr, count: Ptr): Ptr {
	const _r = callPtr('temporal_timestamps_w', [ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(count)]);
	checkMeosError();
	return _r;
}

export function temporal_timestamptz_n(temp: Ptr, n: number): TimestampTz {
	const _r = call<TimestampTz>('temporal_timestamptz_n_w', 'number', [ptrArgType(), 'number'], [ptrArgVal(temp), n]);
	checkMeosError();
	return _r;
}

export function temporal_upper_inc(temp: Ptr): boolean {
	const _r = call<number>('temporal_upper_inc_w', 'number', [ptrArgType()], [ptrArgVal(temp)]) !== 0;
	checkMeosError();
	return _r;
}

export function tfloat_end_value(temp: Ptr): number {
	const _r = call<number>('tfloat_end_value_w', 'number', [ptrArgType()], [ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function tfloat_min_value(temp: Ptr): number {
	const _r = call<number>('tfloat_min_value_w', 'number', [ptrArgType()], [ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function tfloat_max_value(temp: Ptr): number {
	const _r = call<number>('tfloat_max_value_w', 'number', [ptrArgType()], [ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function tfloat_start_value(temp: Ptr): number {
	const _r = call<number>('tfloat_start_value_w', 'number', [ptrArgType()], [ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function tfloat_value_at_timestamptz(temp: Ptr, t: TimestampTz, strict: boolean, value: Ptr): boolean {
	const _r = call<number>('tfloat_value_at_timestamptz_w', 'number', [ptrArgType(), 'bigint', 'number', ptrArgType()], [ptrArgVal(temp), BigInt(t), strict ? 1 : 0, ptrArgVal(value)]) !== 0;
	checkMeosError();
	return _r;
}

export function tfloat_value_n(temp: Ptr, n: number): number {
	const _r = call<number>('tfloat_value_n_w', 'number', [ptrArgType(), 'number'], [ptrArgVal(temp), n]);
	checkMeosError();
	return _r;
}

export function tfloat_values(temp: Ptr, count: Ptr): Ptr {
	const _r = callPtr('tfloat_values_w', [ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(count)]);
	checkMeosError();
	return _r;
}

export function tint_end_value(temp: Ptr): number {
	const _r = call<number>('tint_end_value_w', 'number', [ptrArgType()], [ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function tint_max_value(temp: Ptr): number {
	const _r = call<number>('tint_max_value_w', 'number', [ptrArgType()], [ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function tint_min_value(temp: Ptr): number {
	const _r = call<number>('tint_min_value_w', 'number', [ptrArgType()], [ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function tint_start_value(temp: Ptr): number {
	const _r = call<number>('tint_start_value_w', 'number', [ptrArgType()], [ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function tint_value_at_timestamptz(temp: Ptr, t: TimestampTz, strict: boolean, value: Ptr): boolean {
	const _r = call<number>('tint_value_at_timestamptz_w', 'number', [ptrArgType(), 'bigint', 'number', ptrArgType()], [ptrArgVal(temp), BigInt(t), strict ? 1 : 0, ptrArgVal(value)]) !== 0;
	checkMeosError();
	return _r;
}

export function tint_value_n(temp: Ptr, n: number): number {
	const _r = call<number>('tint_value_n_w', 'number', [ptrArgType(), 'number'], [ptrArgVal(temp), n]);
	checkMeosError();
	return _r;
}

export function tint_values(temp: Ptr, count: Ptr): Ptr {
	const _r = callPtr('tint_values_w', [ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(count)]);
	checkMeosError();
	return _r;
}

export function tnumber_avg_value(temp: Ptr): number {
	const _r = call<number>('tnumber_avg_value_w', 'number', [ptrArgType()], [ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function tnumber_integral(temp: Ptr): number {
	const _r = call<number>('tnumber_integral_w', 'number', [ptrArgType()], [ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function tnumber_twavg(temp: Ptr): number {
	const _r = call<number>('tnumber_twavg_w', 'number', [ptrArgType()], [ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function tnumber_valuespans(temp: Ptr): Ptr {
	const _r = callPtr('tnumber_valuespans_w', [ptrArgType()], [ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function ttext_end_value(temp: Ptr): string {
	const _r = call<string>('ttext_end_value_w', 'string', [ptrArgType()], [ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function ttext_max_value(temp: Ptr): string {
	const _r = call<string>('ttext_max_value_w', 'string', [ptrArgType()], [ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function ttext_min_value(temp: Ptr): string {
	const _r = call<string>('ttext_min_value_w', 'string', [ptrArgType()], [ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function ttext_start_value(temp: Ptr): string {
	const _r = call<string>('ttext_start_value_w', 'string', [ptrArgType()], [ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function ttext_value_at_timestamptz(temp: Ptr, t: TimestampTz, strict: boolean, value: Ptr): boolean {
	const _r = call<number>('ttext_value_at_timestamptz_w', 'number', [ptrArgType(), 'bigint', 'number', ptrArgType()], [ptrArgVal(temp), BigInt(t), strict ? 1 : 0, ptrArgVal(value)]) !== 0;
	checkMeosError();
	return _r;
}

export function ttext_values(temp: Ptr, count: Ptr): Ptr {
	const _r = callPtr('ttext_values_w', [ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(count)]);
	checkMeosError();
	return _r;
}

export function float_degrees(value: number, normalize: boolean): number {
	const _r = call<number>('float_degrees_w', 'number', ['number', 'number'], [value, normalize ? 1 : 0]);
	checkMeosError();
	return _r;
}

export function temparr_round(temp: Ptr, count: number, maxdd: number): Ptr {
	const _r = callPtr('temparr_round_w', [ptrArgType(), 'number', 'number'], [ptrArgVal(temp), count, maxdd]);
	checkMeosError();
	return _r;
}

export function temporal_round(temp: Ptr, maxdd: number): Ptr {
	const _r = callPtr('temporal_round_w', [ptrArgType(), 'number'], [ptrArgVal(temp), maxdd]);
	checkMeosError();
	return _r;
}

export function temporal_scale_time(temp: Ptr, duration: Ptr): Ptr {
	const _r = callPtr('temporal_scale_time_w', [ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(duration)]);
	checkMeosError();
	return _r;
}

export function temporal_set_interp(temp: Ptr, interp: number): Ptr {
	const _r = callPtr('temporal_set_interp_w', [ptrArgType(), 'number'], [ptrArgVal(temp), interp]);
	checkMeosError();
	return _r;
}

export function temporal_shift_scale_time(temp: Ptr, shift: Ptr, duration: Ptr): Ptr {
	const _r = callPtr('temporal_shift_scale_time_w', [ptrArgType(), ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(shift), ptrArgVal(duration)]);
	checkMeosError();
	return _r;
}

export function temporal_shift_time(temp: Ptr, shift: Ptr): Ptr {
	const _r = callPtr('temporal_shift_time_w', [ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(shift)]);
	checkMeosError();
	return _r;
}

export function temporal_to_tinstant(temp: Ptr): Ptr {
	const _r = callPtr('temporal_to_tinstant_w', [ptrArgType()], [ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function temporal_to_tsequence(temp: Ptr, interp: number): Ptr {
	const _r = callPtr('temporal_to_tsequence_w', [ptrArgType(), 'number'], [ptrArgVal(temp), interp]);
	checkMeosError();
	return _r;
}

export function temporal_to_tsequenceset(temp: Ptr, interp: number): Ptr {
	const _r = callPtr('temporal_to_tsequenceset_w', [ptrArgType(), 'number'], [ptrArgVal(temp), interp]);
	checkMeosError();
	return _r;
}

export function tfloat_ceil(temp: Ptr): Ptr {
	const _r = callPtr('tfloat_ceil_w', [ptrArgType()], [ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function tfloat_degrees(temp: Ptr, normalize: boolean): Ptr {
	const _r = callPtr('tfloat_degrees_w', [ptrArgType(), 'number'], [ptrArgVal(temp), normalize ? 1 : 0]);
	checkMeosError();
	return _r;
}

export function tfloat_floor(temp: Ptr): Ptr {
	const _r = callPtr('tfloat_floor_w', [ptrArgType()], [ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function tfloat_radians(temp: Ptr): Ptr {
	const _r = callPtr('tfloat_radians_w', [ptrArgType()], [ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function tfloat_scale_value(temp: Ptr, width: number): Ptr {
	const _r = callPtr('tfloat_scale_value_w', [ptrArgType(), 'number'], [ptrArgVal(temp), width]);
	checkMeosError();
	return _r;
}

export function tfloat_shift_scale_value(temp: Ptr, shift: number, width: number): Ptr {
	const _r = callPtr('tfloat_shift_scale_value_w', [ptrArgType(), 'number', 'number'], [ptrArgVal(temp), shift, width]);
	checkMeosError();
	return _r;
}

export function tfloat_shift_value(temp: Ptr, shift: number): Ptr {
	const _r = callPtr('tfloat_shift_value_w', [ptrArgType(), 'number'], [ptrArgVal(temp), shift]);
	checkMeosError();
	return _r;
}

export function tint_scale_value(temp: Ptr, width: number): Ptr {
	const _r = callPtr('tint_scale_value_w', [ptrArgType(), 'number'], [ptrArgVal(temp), width]);
	checkMeosError();
	return _r;
}

export function tint_shift_scale_value(temp: Ptr, shift: number, width: number): Ptr {
	const _r = callPtr('tint_shift_scale_value_w', [ptrArgType(), 'number', 'number'], [ptrArgVal(temp), shift, width]);
	checkMeosError();
	return _r;
}

export function tint_shift_value(temp: Ptr, shift: number): Ptr {
	const _r = callPtr('tint_shift_value_w', [ptrArgType(), 'number'], [ptrArgVal(temp), shift]);
	checkMeosError();
	return _r;
}

export function temporal_append_tinstant(temp: Ptr, inst: Ptr, interp: number, maxdist: number, maxt: Ptr, expand: boolean): Ptr {
	const _r = callPtr('temporal_append_tinstant_w', [ptrArgType(), ptrArgType(), 'number', 'number', ptrArgType(), 'number'], [ptrArgVal(temp), ptrArgVal(inst), interp, maxdist, ptrArgVal(maxt), expand ? 1 : 0]);
	checkMeosError();
	return _r;
}

export function temporal_append_tsequence(temp: Ptr, seq: Ptr, expand: boolean): Ptr {
	const _r = callPtr('temporal_append_tsequence_w', [ptrArgType(), ptrArgType(), 'number'], [ptrArgVal(temp), ptrArgVal(seq), expand ? 1 : 0]);
	checkMeosError();
	return _r;
}

export function temporal_delete_timestamptz(temp: Ptr, t: TimestampTz, connect: boolean): Ptr {
	const _r = callPtr('temporal_delete_timestamptz_w', [ptrArgType(), 'bigint', 'number'], [ptrArgVal(temp), BigInt(t), connect ? 1 : 0]);
	checkMeosError();
	return _r;
}

export function temporal_delete_tstzset(temp: Ptr, s: Ptr, connect: boolean): Ptr {
	const _r = callPtr('temporal_delete_tstzset_w', [ptrArgType(), ptrArgType(), 'number'], [ptrArgVal(temp), ptrArgVal(s), connect ? 1 : 0]);
	checkMeosError();
	return _r;
}

export function temporal_delete_tstzspan(temp: Ptr, s: Ptr, connect: boolean): Ptr {
	const _r = callPtr('temporal_delete_tstzspan_w', [ptrArgType(), ptrArgType(), 'number'], [ptrArgVal(temp), ptrArgVal(s), connect ? 1 : 0]);
	checkMeosError();
	return _r;
}

export function temporal_delete_tstzspanset(temp: Ptr, ss: Ptr, connect: boolean): Ptr {
	const _r = callPtr('temporal_delete_tstzspanset_w', [ptrArgType(), ptrArgType(), 'number'], [ptrArgVal(temp), ptrArgVal(ss), connect ? 1 : 0]);
	checkMeosError();
	return _r;
}

export function temporal_insert(temp1: Ptr, temp2: Ptr, connect: boolean): Ptr {
	const _r = callPtr('temporal_insert_w', [ptrArgType(), ptrArgType(), 'number'], [ptrArgVal(temp1), ptrArgVal(temp2), connect ? 1 : 0]);
	checkMeosError();
	return _r;
}

export function temporal_merge(temp1: Ptr, temp2: Ptr): Ptr {
	const _r = callPtr('temporal_merge_w', [ptrArgType(), ptrArgType()], [ptrArgVal(temp1), ptrArgVal(temp2)]);
	checkMeosError();
	return _r;
}

export function temporal_merge_array(temparr: Ptr, count: number): Ptr {
	const _r = callPtr('temporal_merge_array_w', [ptrArgType(), 'number'], [ptrArgVal(temparr), count]);
	checkMeosError();
	return _r;
}

export function temporal_update(temp1: Ptr, temp2: Ptr, connect: boolean): Ptr {
	const _r = callPtr('temporal_update_w', [ptrArgType(), ptrArgType(), 'number'], [ptrArgVal(temp1), ptrArgVal(temp2), connect ? 1 : 0]);
	checkMeosError();
	return _r;
}

export function tbool_at_value(temp: Ptr, b: boolean): Ptr {
	const _r = callPtr('tbool_at_value_w', [ptrArgType(), 'number'], [ptrArgVal(temp), b ? 1 : 0]);
	checkMeosError();
	return _r;
}

export function tbool_minus_value(temp: Ptr, b: boolean): Ptr {
	const _r = callPtr('tbool_minus_value_w', [ptrArgType(), 'number'], [ptrArgVal(temp), b ? 1 : 0]);
	checkMeosError();
	return _r;
}

export function temporal_after_timestamptz(temp: Ptr, t: TimestampTz, strict: boolean): Ptr {
	const _r = callPtr('temporal_after_timestamptz_w', [ptrArgType(), 'bigint', 'number'], [ptrArgVal(temp), BigInt(t), strict ? 1 : 0]);
	checkMeosError();
	return _r;
}

export function temporal_at_max(temp: Ptr): Ptr {
	const _r = callPtr('temporal_at_max_w', [ptrArgType()], [ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function temporal_at_min(temp: Ptr): Ptr {
	const _r = callPtr('temporal_at_min_w', [ptrArgType()], [ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function temporal_at_timestamptz(temp: Ptr, t: TimestampTz): Ptr {
	const _r = callPtr('temporal_at_timestamptz_w', [ptrArgType(), 'bigint'], [ptrArgVal(temp), BigInt(t)]);
	checkMeosError();
	return _r;
}

export function temporal_at_tstzset(temp: Ptr, s: Ptr): Ptr {
	const _r = callPtr('temporal_at_tstzset_w', [ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function temporal_at_tstzspan(temp: Ptr, s: Ptr): Ptr {
	const _r = callPtr('temporal_at_tstzspan_w', [ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function temporal_at_tstzspanset(temp: Ptr, ss: Ptr): Ptr {
	const _r = callPtr('temporal_at_tstzspanset_w', [ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(ss)]);
	checkMeosError();
	return _r;
}

export function temporal_at_values(temp: Ptr, set: Ptr): Ptr {
	const _r = callPtr('temporal_at_values_w', [ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(set)]);
	checkMeosError();
	return _r;
}

export function temporal_before_timestamptz(temp: Ptr, t: TimestampTz, strict: boolean): Ptr {
	const _r = callPtr('temporal_before_timestamptz_w', [ptrArgType(), 'bigint', 'number'], [ptrArgVal(temp), BigInt(t), strict ? 1 : 0]);
	checkMeosError();
	return _r;
}

export function temporal_minus_max(temp: Ptr): Ptr {
	const _r = callPtr('temporal_minus_max_w', [ptrArgType()], [ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function temporal_minus_min(temp: Ptr): Ptr {
	const _r = callPtr('temporal_minus_min_w', [ptrArgType()], [ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function temporal_minus_timestamptz(temp: Ptr, t: TimestampTz): Ptr {
	const _r = callPtr('temporal_minus_timestamptz_w', [ptrArgType(), 'bigint'], [ptrArgVal(temp), BigInt(t)]);
	checkMeosError();
	return _r;
}

export function temporal_minus_tstzset(temp: Ptr, s: Ptr): Ptr {
	const _r = callPtr('temporal_minus_tstzset_w', [ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function temporal_minus_tstzspan(temp: Ptr, s: Ptr): Ptr {
	const _r = callPtr('temporal_minus_tstzspan_w', [ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function temporal_minus_tstzspanset(temp: Ptr, ss: Ptr): Ptr {
	const _r = callPtr('temporal_minus_tstzspanset_w', [ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(ss)]);
	checkMeosError();
	return _r;
}

export function temporal_minus_values(temp: Ptr, set: Ptr): Ptr {
	const _r = callPtr('temporal_minus_values_w', [ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(set)]);
	checkMeosError();
	return _r;
}

export function tfloat_at_value(temp: Ptr, d: number): Ptr {
	const _r = callPtr('tfloat_at_value_w', [ptrArgType(), 'number'], [ptrArgVal(temp), d]);
	checkMeosError();
	return _r;
}

export function tfloat_minus_value(temp: Ptr, d: number): Ptr {
	const _r = callPtr('tfloat_minus_value_w', [ptrArgType(), 'number'], [ptrArgVal(temp), d]);
	checkMeosError();
	return _r;
}

export function tint_at_value(temp: Ptr, i: number): Ptr {
	const _r = callPtr('tint_at_value_w', [ptrArgType(), 'number'], [ptrArgVal(temp), i]);
	checkMeosError();
	return _r;
}

export function tint_minus_value(temp: Ptr, i: number): Ptr {
	const _r = callPtr('tint_minus_value_w', [ptrArgType(), 'number'], [ptrArgVal(temp), i]);
	checkMeosError();
	return _r;
}

export function tnumber_at_span(temp: Ptr, span: Ptr): Ptr {
	const _r = callPtr('tnumber_at_span_w', [ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(span)]);
	checkMeosError();
	return _r;
}

export function tnumber_at_spanset(temp: Ptr, ss: Ptr): Ptr {
	const _r = callPtr('tnumber_at_spanset_w', [ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(ss)]);
	checkMeosError();
	return _r;
}

export function tnumber_at_tbox(temp: Ptr, box: Ptr): Ptr {
	const _r = callPtr('tnumber_at_tbox_w', [ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(box)]);
	checkMeosError();
	return _r;
}

export function tnumber_minus_span(temp: Ptr, span: Ptr): Ptr {
	const _r = callPtr('tnumber_minus_span_w', [ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(span)]);
	checkMeosError();
	return _r;
}

export function tnumber_minus_spanset(temp: Ptr, ss: Ptr): Ptr {
	const _r = callPtr('tnumber_minus_spanset_w', [ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(ss)]);
	checkMeosError();
	return _r;
}

export function tnumber_minus_tbox(temp: Ptr, box: Ptr): Ptr {
	const _r = callPtr('tnumber_minus_tbox_w', [ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(box)]);
	checkMeosError();
	return _r;
}

export function ttext_at_value(temp: Ptr, txt: string): Ptr {
	const _r = callPtr('ttext_at_value_w', [ptrArgType(), 'string'], [ptrArgVal(temp), txt]);
	checkMeosError();
	return _r;
}

export function ttext_minus_value(temp: Ptr, txt: string): Ptr {
	const _r = callPtr('ttext_minus_value_w', [ptrArgType(), 'string'], [ptrArgVal(temp), txt]);
	checkMeosError();
	return _r;
}

export function temporal_cmp(temp1: Ptr, temp2: Ptr): number {
	const _r = call<number>('temporal_cmp_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp1), ptrArgVal(temp2)]);
	checkMeosError();
	return _r;
}

export function temporal_eq(temp1: Ptr, temp2: Ptr): boolean {
	const _r = call<number>('temporal_eq_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp1), ptrArgVal(temp2)]) !== 0;
	checkMeosError();
	return _r;
}

export function temporal_ge(temp1: Ptr, temp2: Ptr): boolean {
	const _r = call<number>('temporal_ge_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp1), ptrArgVal(temp2)]) !== 0;
	checkMeosError();
	return _r;
}

export function temporal_gt(temp1: Ptr, temp2: Ptr): boolean {
	const _r = call<number>('temporal_gt_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp1), ptrArgVal(temp2)]) !== 0;
	checkMeosError();
	return _r;
}

export function temporal_le(temp1: Ptr, temp2: Ptr): boolean {
	const _r = call<number>('temporal_le_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp1), ptrArgVal(temp2)]) !== 0;
	checkMeosError();
	return _r;
}

export function temporal_lt(temp1: Ptr, temp2: Ptr): boolean {
	const _r = call<number>('temporal_lt_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp1), ptrArgVal(temp2)]) !== 0;
	checkMeosError();
	return _r;
}

export function temporal_ne(temp1: Ptr, temp2: Ptr): boolean {
	const _r = call<number>('temporal_ne_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp1), ptrArgVal(temp2)]) !== 0;
	checkMeosError();
	return _r;
}

export function always_eq_bool_tbool(b: boolean, temp: Ptr): number {
	const _r = call<number>('always_eq_bool_tbool_w', 'number', ['number', ptrArgType()], [b ? 1 : 0, ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function always_eq_float_tfloat(d: number, temp: Ptr): number {
	const _r = call<number>('always_eq_float_tfloat_w', 'number', ['number', ptrArgType()], [d, ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function always_eq_int_tint(i: number, temp: Ptr): number {
	const _r = call<number>('always_eq_int_tint_w', 'number', ['number', ptrArgType()], [i, ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function always_eq_tbool_bool(temp: Ptr, b: boolean): number {
	const _r = call<number>('always_eq_tbool_bool_w', 'number', [ptrArgType(), 'number'], [ptrArgVal(temp), b ? 1 : 0]);
	checkMeosError();
	return _r;
}

export function always_eq_temporal_temporal(temp1: Ptr, temp2: Ptr): number {
	const _r = call<number>('always_eq_temporal_temporal_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp1), ptrArgVal(temp2)]);
	checkMeosError();
	return _r;
}

export function always_eq_text_ttext(txt: string, temp: Ptr): number {
	const _r = call<number>('always_eq_text_ttext_w', 'number', ['string', ptrArgType()], [txt, ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function always_eq_tfloat_float(temp: Ptr, d: number): number {
	const _r = call<number>('always_eq_tfloat_float_w', 'number', [ptrArgType(), 'number'], [ptrArgVal(temp), d]);
	checkMeosError();
	return _r;
}

export function always_eq_tint_int(temp: Ptr, i: number): number {
	const _r = call<number>('always_eq_tint_int_w', 'number', [ptrArgType(), 'number'], [ptrArgVal(temp), i]);
	checkMeosError();
	return _r;
}

export function always_eq_ttext_text(temp: Ptr, txt: string): number {
	const _r = call<number>('always_eq_ttext_text_w', 'number', [ptrArgType(), 'string'], [ptrArgVal(temp), txt]);
	checkMeosError();
	return _r;
}

export function always_ge_float_tfloat(d: number, temp: Ptr): number {
	const _r = call<number>('always_ge_float_tfloat_w', 'number', ['number', ptrArgType()], [d, ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function always_ge_int_tint(i: number, temp: Ptr): number {
	const _r = call<number>('always_ge_int_tint_w', 'number', ['number', ptrArgType()], [i, ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function always_ge_temporal_temporal(temp1: Ptr, temp2: Ptr): number {
	const _r = call<number>('always_ge_temporal_temporal_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp1), ptrArgVal(temp2)]);
	checkMeosError();
	return _r;
}

export function always_ge_text_ttext(txt: string, temp: Ptr): number {
	const _r = call<number>('always_ge_text_ttext_w', 'number', ['string', ptrArgType()], [txt, ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function always_ge_tfloat_float(temp: Ptr, d: number): number {
	const _r = call<number>('always_ge_tfloat_float_w', 'number', [ptrArgType(), 'number'], [ptrArgVal(temp), d]);
	checkMeosError();
	return _r;
}

export function always_ge_tint_int(temp: Ptr, i: number): number {
	const _r = call<number>('always_ge_tint_int_w', 'number', [ptrArgType(), 'number'], [ptrArgVal(temp), i]);
	checkMeosError();
	return _r;
}

export function always_ge_ttext_text(temp: Ptr, txt: string): number {
	const _r = call<number>('always_ge_ttext_text_w', 'number', [ptrArgType(), 'string'], [ptrArgVal(temp), txt]);
	checkMeosError();
	return _r;
}

export function always_gt_float_tfloat(d: number, temp: Ptr): number {
	const _r = call<number>('always_gt_float_tfloat_w', 'number', ['number', ptrArgType()], [d, ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function always_gt_int_tint(i: number, temp: Ptr): number {
	const _r = call<number>('always_gt_int_tint_w', 'number', ['number', ptrArgType()], [i, ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function always_gt_temporal_temporal(temp1: Ptr, temp2: Ptr): number {
	const _r = call<number>('always_gt_temporal_temporal_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp1), ptrArgVal(temp2)]);
	checkMeosError();
	return _r;
}

export function always_gt_text_ttext(txt: string, temp: Ptr): number {
	const _r = call<number>('always_gt_text_ttext_w', 'number', ['string', ptrArgType()], [txt, ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function always_gt_tfloat_float(temp: Ptr, d: number): number {
	const _r = call<number>('always_gt_tfloat_float_w', 'number', [ptrArgType(), 'number'], [ptrArgVal(temp), d]);
	checkMeosError();
	return _r;
}

export function always_gt_tint_int(temp: Ptr, i: number): number {
	const _r = call<number>('always_gt_tint_int_w', 'number', [ptrArgType(), 'number'], [ptrArgVal(temp), i]);
	checkMeosError();
	return _r;
}

export function always_gt_ttext_text(temp: Ptr, txt: string): number {
	const _r = call<number>('always_gt_ttext_text_w', 'number', [ptrArgType(), 'string'], [ptrArgVal(temp), txt]);
	checkMeosError();
	return _r;
}

export function always_le_float_tfloat(d: number, temp: Ptr): number {
	const _r = call<number>('always_le_float_tfloat_w', 'number', ['number', ptrArgType()], [d, ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function always_le_int_tint(i: number, temp: Ptr): number {
	const _r = call<number>('always_le_int_tint_w', 'number', ['number', ptrArgType()], [i, ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function always_le_temporal_temporal(temp1: Ptr, temp2: Ptr): number {
	const _r = call<number>('always_le_temporal_temporal_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp1), ptrArgVal(temp2)]);
	checkMeosError();
	return _r;
}

export function always_le_text_ttext(txt: string, temp: Ptr): number {
	const _r = call<number>('always_le_text_ttext_w', 'number', ['string', ptrArgType()], [txt, ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function always_le_tfloat_float(temp: Ptr, d: number): number {
	const _r = call<number>('always_le_tfloat_float_w', 'number', [ptrArgType(), 'number'], [ptrArgVal(temp), d]);
	checkMeosError();
	return _r;
}

export function always_le_tint_int(temp: Ptr, i: number): number {
	const _r = call<number>('always_le_tint_int_w', 'number', [ptrArgType(), 'number'], [ptrArgVal(temp), i]);
	checkMeosError();
	return _r;
}

export function always_le_ttext_text(temp: Ptr, txt: string): number {
	const _r = call<number>('always_le_ttext_text_w', 'number', [ptrArgType(), 'string'], [ptrArgVal(temp), txt]);
	checkMeosError();
	return _r;
}

export function always_lt_float_tfloat(d: number, temp: Ptr): number {
	const _r = call<number>('always_lt_float_tfloat_w', 'number', ['number', ptrArgType()], [d, ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function always_lt_int_tint(i: number, temp: Ptr): number {
	const _r = call<number>('always_lt_int_tint_w', 'number', ['number', ptrArgType()], [i, ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function always_lt_temporal_temporal(temp1: Ptr, temp2: Ptr): number {
	const _r = call<number>('always_lt_temporal_temporal_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp1), ptrArgVal(temp2)]);
	checkMeosError();
	return _r;
}

export function always_lt_text_ttext(txt: string, temp: Ptr): number {
	const _r = call<number>('always_lt_text_ttext_w', 'number', ['string', ptrArgType()], [txt, ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function always_lt_tfloat_float(temp: Ptr, d: number): number {
	const _r = call<number>('always_lt_tfloat_float_w', 'number', [ptrArgType(), 'number'], [ptrArgVal(temp), d]);
	checkMeosError();
	return _r;
}

export function always_lt_tint_int(temp: Ptr, i: number): number {
	const _r = call<number>('always_lt_tint_int_w', 'number', [ptrArgType(), 'number'], [ptrArgVal(temp), i]);
	checkMeosError();
	return _r;
}

export function always_lt_ttext_text(temp: Ptr, txt: string): number {
	const _r = call<number>('always_lt_ttext_text_w', 'number', [ptrArgType(), 'string'], [ptrArgVal(temp), txt]);
	checkMeosError();
	return _r;
}

export function always_ne_bool_tbool(b: boolean, temp: Ptr): number {
	const _r = call<number>('always_ne_bool_tbool_w', 'number', ['number', ptrArgType()], [b ? 1 : 0, ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function always_ne_float_tfloat(d: number, temp: Ptr): number {
	const _r = call<number>('always_ne_float_tfloat_w', 'number', ['number', ptrArgType()], [d, ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function always_ne_int_tint(i: number, temp: Ptr): number {
	const _r = call<number>('always_ne_int_tint_w', 'number', ['number', ptrArgType()], [i, ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function always_ne_tbool_bool(temp: Ptr, b: boolean): number {
	const _r = call<number>('always_ne_tbool_bool_w', 'number', [ptrArgType(), 'number'], [ptrArgVal(temp), b ? 1 : 0]);
	checkMeosError();
	return _r;
}

export function always_ne_temporal_temporal(temp1: Ptr, temp2: Ptr): number {
	const _r = call<number>('always_ne_temporal_temporal_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp1), ptrArgVal(temp2)]);
	checkMeosError();
	return _r;
}

export function always_ne_text_ttext(txt: string, temp: Ptr): number {
	const _r = call<number>('always_ne_text_ttext_w', 'number', ['string', ptrArgType()], [txt, ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function always_ne_tfloat_float(temp: Ptr, d: number): number {
	const _r = call<number>('always_ne_tfloat_float_w', 'number', [ptrArgType(), 'number'], [ptrArgVal(temp), d]);
	checkMeosError();
	return _r;
}

export function always_ne_tint_int(temp: Ptr, i: number): number {
	const _r = call<number>('always_ne_tint_int_w', 'number', [ptrArgType(), 'number'], [ptrArgVal(temp), i]);
	checkMeosError();
	return _r;
}

export function always_ne_ttext_text(temp: Ptr, txt: string): number {
	const _r = call<number>('always_ne_ttext_text_w', 'number', [ptrArgType(), 'string'], [ptrArgVal(temp), txt]);
	checkMeosError();
	return _r;
}

export function ever_eq_bool_tbool(b: boolean, temp: Ptr): number {
	const _r = call<number>('ever_eq_bool_tbool_w', 'number', ['number', ptrArgType()], [b ? 1 : 0, ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function ever_eq_float_tfloat(d: number, temp: Ptr): number {
	const _r = call<number>('ever_eq_float_tfloat_w', 'number', ['number', ptrArgType()], [d, ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function ever_eq_int_tint(i: number, temp: Ptr): number {
	const _r = call<number>('ever_eq_int_tint_w', 'number', ['number', ptrArgType()], [i, ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function ever_eq_tbool_bool(temp: Ptr, b: boolean): number {
	const _r = call<number>('ever_eq_tbool_bool_w', 'number', [ptrArgType(), 'number'], [ptrArgVal(temp), b ? 1 : 0]);
	checkMeosError();
	return _r;
}

export function ever_eq_temporal_temporal(temp1: Ptr, temp2: Ptr): number {
	const _r = call<number>('ever_eq_temporal_temporal_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp1), ptrArgVal(temp2)]);
	checkMeosError();
	return _r;
}

export function ever_eq_text_ttext(txt: string, temp: Ptr): number {
	const _r = call<number>('ever_eq_text_ttext_w', 'number', ['string', ptrArgType()], [txt, ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function ever_eq_tfloat_float(temp: Ptr, d: number): number {
	const _r = call<number>('ever_eq_tfloat_float_w', 'number', [ptrArgType(), 'number'], [ptrArgVal(temp), d]);
	checkMeosError();
	return _r;
}

export function ever_eq_tint_int(temp: Ptr, i: number): number {
	const _r = call<number>('ever_eq_tint_int_w', 'number', [ptrArgType(), 'number'], [ptrArgVal(temp), i]);
	checkMeosError();
	return _r;
}

export function ever_eq_ttext_text(temp: Ptr, txt: string): number {
	const _r = call<number>('ever_eq_ttext_text_w', 'number', [ptrArgType(), 'string'], [ptrArgVal(temp), txt]);
	checkMeosError();
	return _r;
}

export function ever_ge_float_tfloat(d: number, temp: Ptr): number {
	const _r = call<number>('ever_ge_float_tfloat_w', 'number', ['number', ptrArgType()], [d, ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function ever_ge_int_tint(i: number, temp: Ptr): number {
	const _r = call<number>('ever_ge_int_tint_w', 'number', ['number', ptrArgType()], [i, ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function ever_ge_temporal_temporal(temp1: Ptr, temp2: Ptr): number {
	const _r = call<number>('ever_ge_temporal_temporal_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp1), ptrArgVal(temp2)]);
	checkMeosError();
	return _r;
}

export function ever_ge_text_ttext(txt: string, temp: Ptr): number {
	const _r = call<number>('ever_ge_text_ttext_w', 'number', ['string', ptrArgType()], [txt, ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function ever_ge_tfloat_float(temp: Ptr, d: number): number {
	const _r = call<number>('ever_ge_tfloat_float_w', 'number', [ptrArgType(), 'number'], [ptrArgVal(temp), d]);
	checkMeosError();
	return _r;
}

export function ever_ge_tint_int(temp: Ptr, i: number): number {
	const _r = call<number>('ever_ge_tint_int_w', 'number', [ptrArgType(), 'number'], [ptrArgVal(temp), i]);
	checkMeosError();
	return _r;
}

export function ever_ge_ttext_text(temp: Ptr, txt: string): number {
	const _r = call<number>('ever_ge_ttext_text_w', 'number', [ptrArgType(), 'string'], [ptrArgVal(temp), txt]);
	checkMeosError();
	return _r;
}

export function ever_gt_float_tfloat(d: number, temp: Ptr): number {
	const _r = call<number>('ever_gt_float_tfloat_w', 'number', ['number', ptrArgType()], [d, ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function ever_gt_int_tint(i: number, temp: Ptr): number {
	const _r = call<number>('ever_gt_int_tint_w', 'number', ['number', ptrArgType()], [i, ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function ever_gt_temporal_temporal(temp1: Ptr, temp2: Ptr): number {
	const _r = call<number>('ever_gt_temporal_temporal_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp1), ptrArgVal(temp2)]);
	checkMeosError();
	return _r;
}

export function ever_gt_text_ttext(txt: string, temp: Ptr): number {
	const _r = call<number>('ever_gt_text_ttext_w', 'number', ['string', ptrArgType()], [txt, ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function ever_gt_tfloat_float(temp: Ptr, d: number): number {
	const _r = call<number>('ever_gt_tfloat_float_w', 'number', [ptrArgType(), 'number'], [ptrArgVal(temp), d]);
	checkMeosError();
	return _r;
}

export function ever_gt_tint_int(temp: Ptr, i: number): number {
	const _r = call<number>('ever_gt_tint_int_w', 'number', [ptrArgType(), 'number'], [ptrArgVal(temp), i]);
	checkMeosError();
	return _r;
}

export function ever_gt_ttext_text(temp: Ptr, txt: string): number {
	const _r = call<number>('ever_gt_ttext_text_w', 'number', [ptrArgType(), 'string'], [ptrArgVal(temp), txt]);
	checkMeosError();
	return _r;
}

export function ever_le_float_tfloat(d: number, temp: Ptr): number {
	const _r = call<number>('ever_le_float_tfloat_w', 'number', ['number', ptrArgType()], [d, ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function ever_le_int_tint(i: number, temp: Ptr): number {
	const _r = call<number>('ever_le_int_tint_w', 'number', ['number', ptrArgType()], [i, ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function ever_le_temporal_temporal(temp1: Ptr, temp2: Ptr): number {
	const _r = call<number>('ever_le_temporal_temporal_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp1), ptrArgVal(temp2)]);
	checkMeosError();
	return _r;
}

export function ever_le_text_ttext(txt: string, temp: Ptr): number {
	const _r = call<number>('ever_le_text_ttext_w', 'number', ['string', ptrArgType()], [txt, ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function ever_le_tfloat_float(temp: Ptr, d: number): number {
	const _r = call<number>('ever_le_tfloat_float_w', 'number', [ptrArgType(), 'number'], [ptrArgVal(temp), d]);
	checkMeosError();
	return _r;
}

export function ever_le_tint_int(temp: Ptr, i: number): number {
	const _r = call<number>('ever_le_tint_int_w', 'number', [ptrArgType(), 'number'], [ptrArgVal(temp), i]);
	checkMeosError();
	return _r;
}

export function ever_le_ttext_text(temp: Ptr, txt: string): number {
	const _r = call<number>('ever_le_ttext_text_w', 'number', [ptrArgType(), 'string'], [ptrArgVal(temp), txt]);
	checkMeosError();
	return _r;
}

export function ever_lt_float_tfloat(d: number, temp: Ptr): number {
	const _r = call<number>('ever_lt_float_tfloat_w', 'number', ['number', ptrArgType()], [d, ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function ever_lt_int_tint(i: number, temp: Ptr): number {
	const _r = call<number>('ever_lt_int_tint_w', 'number', ['number', ptrArgType()], [i, ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function ever_lt_temporal_temporal(temp1: Ptr, temp2: Ptr): number {
	const _r = call<number>('ever_lt_temporal_temporal_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp1), ptrArgVal(temp2)]);
	checkMeosError();
	return _r;
}

export function ever_lt_text_ttext(txt: string, temp: Ptr): number {
	const _r = call<number>('ever_lt_text_ttext_w', 'number', ['string', ptrArgType()], [txt, ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function ever_lt_tfloat_float(temp: Ptr, d: number): number {
	const _r = call<number>('ever_lt_tfloat_float_w', 'number', [ptrArgType(), 'number'], [ptrArgVal(temp), d]);
	checkMeosError();
	return _r;
}

export function ever_lt_tint_int(temp: Ptr, i: number): number {
	const _r = call<number>('ever_lt_tint_int_w', 'number', [ptrArgType(), 'number'], [ptrArgVal(temp), i]);
	checkMeosError();
	return _r;
}

export function ever_lt_ttext_text(temp: Ptr, txt: string): number {
	const _r = call<number>('ever_lt_ttext_text_w', 'number', [ptrArgType(), 'string'], [ptrArgVal(temp), txt]);
	checkMeosError();
	return _r;
}

export function ever_ne_bool_tbool(b: boolean, temp: Ptr): number {
	const _r = call<number>('ever_ne_bool_tbool_w', 'number', ['number', ptrArgType()], [b ? 1 : 0, ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function ever_ne_float_tfloat(d: number, temp: Ptr): number {
	const _r = call<number>('ever_ne_float_tfloat_w', 'number', ['number', ptrArgType()], [d, ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function ever_ne_int_tint(i: number, temp: Ptr): number {
	const _r = call<number>('ever_ne_int_tint_w', 'number', ['number', ptrArgType()], [i, ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function ever_ne_tbool_bool(temp: Ptr, b: boolean): number {
	const _r = call<number>('ever_ne_tbool_bool_w', 'number', [ptrArgType(), 'number'], [ptrArgVal(temp), b ? 1 : 0]);
	checkMeosError();
	return _r;
}

export function ever_ne_temporal_temporal(temp1: Ptr, temp2: Ptr): number {
	const _r = call<number>('ever_ne_temporal_temporal_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp1), ptrArgVal(temp2)]);
	checkMeosError();
	return _r;
}

export function ever_ne_text_ttext(txt: string, temp: Ptr): number {
	const _r = call<number>('ever_ne_text_ttext_w', 'number', ['string', ptrArgType()], [txt, ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function ever_ne_tfloat_float(temp: Ptr, d: number): number {
	const _r = call<number>('ever_ne_tfloat_float_w', 'number', [ptrArgType(), 'number'], [ptrArgVal(temp), d]);
	checkMeosError();
	return _r;
}

export function ever_ne_tint_int(temp: Ptr, i: number): number {
	const _r = call<number>('ever_ne_tint_int_w', 'number', [ptrArgType(), 'number'], [ptrArgVal(temp), i]);
	checkMeosError();
	return _r;
}

export function ever_ne_ttext_text(temp: Ptr, txt: string): number {
	const _r = call<number>('ever_ne_ttext_text_w', 'number', [ptrArgType(), 'string'], [ptrArgVal(temp), txt]);
	checkMeosError();
	return _r;
}

export function teq_bool_tbool(b: boolean, temp: Ptr): Ptr {
	const _r = callPtr('teq_bool_tbool_w', ['number', ptrArgType()], [b ? 1 : 0, ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function teq_float_tfloat(d: number, temp: Ptr): Ptr {
	const _r = callPtr('teq_float_tfloat_w', ['number', ptrArgType()], [d, ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function teq_int_tint(i: number, temp: Ptr): Ptr {
	const _r = callPtr('teq_int_tint_w', ['number', ptrArgType()], [i, ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function teq_tbool_bool(temp: Ptr, b: boolean): Ptr {
	const _r = callPtr('teq_tbool_bool_w', [ptrArgType(), 'number'], [ptrArgVal(temp), b ? 1 : 0]);
	checkMeosError();
	return _r;
}

export function teq_temporal_temporal(temp1: Ptr, temp2: Ptr): Ptr {
	const _r = callPtr('teq_temporal_temporal_w', [ptrArgType(), ptrArgType()], [ptrArgVal(temp1), ptrArgVal(temp2)]);
	checkMeosError();
	return _r;
}

export function teq_text_ttext(txt: string, temp: Ptr): Ptr {
	const _r = callPtr('teq_text_ttext_w', ['string', ptrArgType()], [txt, ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function teq_tfloat_float(temp: Ptr, d: number): Ptr {
	const _r = callPtr('teq_tfloat_float_w', [ptrArgType(), 'number'], [ptrArgVal(temp), d]);
	checkMeosError();
	return _r;
}

export function teq_tint_int(temp: Ptr, i: number): Ptr {
	const _r = callPtr('teq_tint_int_w', [ptrArgType(), 'number'], [ptrArgVal(temp), i]);
	checkMeosError();
	return _r;
}

export function teq_ttext_text(temp: Ptr, txt: string): Ptr {
	const _r = callPtr('teq_ttext_text_w', [ptrArgType(), 'string'], [ptrArgVal(temp), txt]);
	checkMeosError();
	return _r;
}

export function tge_float_tfloat(d: number, temp: Ptr): Ptr {
	const _r = callPtr('tge_float_tfloat_w', ['number', ptrArgType()], [d, ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function tge_int_tint(i: number, temp: Ptr): Ptr {
	const _r = callPtr('tge_int_tint_w', ['number', ptrArgType()], [i, ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function tge_temporal_temporal(temp1: Ptr, temp2: Ptr): Ptr {
	const _r = callPtr('tge_temporal_temporal_w', [ptrArgType(), ptrArgType()], [ptrArgVal(temp1), ptrArgVal(temp2)]);
	checkMeosError();
	return _r;
}

export function tge_text_ttext(txt: string, temp: Ptr): Ptr {
	const _r = callPtr('tge_text_ttext_w', ['string', ptrArgType()], [txt, ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function tge_tfloat_float(temp: Ptr, d: number): Ptr {
	const _r = callPtr('tge_tfloat_float_w', [ptrArgType(), 'number'], [ptrArgVal(temp), d]);
	checkMeosError();
	return _r;
}

export function tge_tint_int(temp: Ptr, i: number): Ptr {
	const _r = callPtr('tge_tint_int_w', [ptrArgType(), 'number'], [ptrArgVal(temp), i]);
	checkMeosError();
	return _r;
}

export function tge_ttext_text(temp: Ptr, txt: string): Ptr {
	const _r = callPtr('tge_ttext_text_w', [ptrArgType(), 'string'], [ptrArgVal(temp), txt]);
	checkMeosError();
	return _r;
}

export function tgt_float_tfloat(d: number, temp: Ptr): Ptr {
	const _r = callPtr('tgt_float_tfloat_w', ['number', ptrArgType()], [d, ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function tgt_int_tint(i: number, temp: Ptr): Ptr {
	const _r = callPtr('tgt_int_tint_w', ['number', ptrArgType()], [i, ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function tgt_temporal_temporal(temp1: Ptr, temp2: Ptr): Ptr {
	const _r = callPtr('tgt_temporal_temporal_w', [ptrArgType(), ptrArgType()], [ptrArgVal(temp1), ptrArgVal(temp2)]);
	checkMeosError();
	return _r;
}

export function tgt_text_ttext(txt: string, temp: Ptr): Ptr {
	const _r = callPtr('tgt_text_ttext_w', ['string', ptrArgType()], [txt, ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function tgt_tfloat_float(temp: Ptr, d: number): Ptr {
	const _r = callPtr('tgt_tfloat_float_w', [ptrArgType(), 'number'], [ptrArgVal(temp), d]);
	checkMeosError();
	return _r;
}

export function tgt_tint_int(temp: Ptr, i: number): Ptr {
	const _r = callPtr('tgt_tint_int_w', [ptrArgType(), 'number'], [ptrArgVal(temp), i]);
	checkMeosError();
	return _r;
}

export function tgt_ttext_text(temp: Ptr, txt: string): Ptr {
	const _r = callPtr('tgt_ttext_text_w', [ptrArgType(), 'string'], [ptrArgVal(temp), txt]);
	checkMeosError();
	return _r;
}

export function tle_float_tfloat(d: number, temp: Ptr): Ptr {
	const _r = callPtr('tle_float_tfloat_w', ['number', ptrArgType()], [d, ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function tle_int_tint(i: number, temp: Ptr): Ptr {
	const _r = callPtr('tle_int_tint_w', ['number', ptrArgType()], [i, ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function tle_temporal_temporal(temp1: Ptr, temp2: Ptr): Ptr {
	const _r = callPtr('tle_temporal_temporal_w', [ptrArgType(), ptrArgType()], [ptrArgVal(temp1), ptrArgVal(temp2)]);
	checkMeosError();
	return _r;
}

export function tle_text_ttext(txt: string, temp: Ptr): Ptr {
	const _r = callPtr('tle_text_ttext_w', ['string', ptrArgType()], [txt, ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function tle_tfloat_float(temp: Ptr, d: number): Ptr {
	const _r = callPtr('tle_tfloat_float_w', [ptrArgType(), 'number'], [ptrArgVal(temp), d]);
	checkMeosError();
	return _r;
}

export function tle_tint_int(temp: Ptr, i: number): Ptr {
	const _r = callPtr('tle_tint_int_w', [ptrArgType(), 'number'], [ptrArgVal(temp), i]);
	checkMeosError();
	return _r;
}

export function tle_ttext_text(temp: Ptr, txt: string): Ptr {
	const _r = callPtr('tle_ttext_text_w', [ptrArgType(), 'string'], [ptrArgVal(temp), txt]);
	checkMeosError();
	return _r;
}

export function tlt_float_tfloat(d: number, temp: Ptr): Ptr {
	const _r = callPtr('tlt_float_tfloat_w', ['number', ptrArgType()], [d, ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function tlt_int_tint(i: number, temp: Ptr): Ptr {
	const _r = callPtr('tlt_int_tint_w', ['number', ptrArgType()], [i, ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function tlt_temporal_temporal(temp1: Ptr, temp2: Ptr): Ptr {
	const _r = callPtr('tlt_temporal_temporal_w', [ptrArgType(), ptrArgType()], [ptrArgVal(temp1), ptrArgVal(temp2)]);
	checkMeosError();
	return _r;
}

export function tlt_text_ttext(txt: string, temp: Ptr): Ptr {
	const _r = callPtr('tlt_text_ttext_w', ['string', ptrArgType()], [txt, ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function tlt_tfloat_float(temp: Ptr, d: number): Ptr {
	const _r = callPtr('tlt_tfloat_float_w', [ptrArgType(), 'number'], [ptrArgVal(temp), d]);
	checkMeosError();
	return _r;
}

export function tlt_tint_int(temp: Ptr, i: number): Ptr {
	const _r = callPtr('tlt_tint_int_w', [ptrArgType(), 'number'], [ptrArgVal(temp), i]);
	checkMeosError();
	return _r;
}

export function tlt_ttext_text(temp: Ptr, txt: string): Ptr {
	const _r = callPtr('tlt_ttext_text_w', [ptrArgType(), 'string'], [ptrArgVal(temp), txt]);
	checkMeosError();
	return _r;
}

export function tne_bool_tbool(b: boolean, temp: Ptr): Ptr {
	const _r = callPtr('tne_bool_tbool_w', ['number', ptrArgType()], [b ? 1 : 0, ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function tne_float_tfloat(d: number, temp: Ptr): Ptr {
	const _r = callPtr('tne_float_tfloat_w', ['number', ptrArgType()], [d, ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function tne_int_tint(i: number, temp: Ptr): Ptr {
	const _r = callPtr('tne_int_tint_w', ['number', ptrArgType()], [i, ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function tne_tbool_bool(temp: Ptr, b: boolean): Ptr {
	const _r = callPtr('tne_tbool_bool_w', [ptrArgType(), 'number'], [ptrArgVal(temp), b ? 1 : 0]);
	checkMeosError();
	return _r;
}

export function tne_temporal_temporal(temp1: Ptr, temp2: Ptr): Ptr {
	const _r = callPtr('tne_temporal_temporal_w', [ptrArgType(), ptrArgType()], [ptrArgVal(temp1), ptrArgVal(temp2)]);
	checkMeosError();
	return _r;
}

export function tne_text_ttext(txt: string, temp: Ptr): Ptr {
	const _r = callPtr('tne_text_ttext_w', ['string', ptrArgType()], [txt, ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function tne_tfloat_float(temp: Ptr, d: number): Ptr {
	const _r = callPtr('tne_tfloat_float_w', [ptrArgType(), 'number'], [ptrArgVal(temp), d]);
	checkMeosError();
	return _r;
}

export function tne_tint_int(temp: Ptr, i: number): Ptr {
	const _r = callPtr('tne_tint_int_w', [ptrArgType(), 'number'], [ptrArgVal(temp), i]);
	checkMeosError();
	return _r;
}

export function tne_ttext_text(temp: Ptr, txt: string): Ptr {
	const _r = callPtr('tne_ttext_text_w', [ptrArgType(), 'string'], [ptrArgVal(temp), txt]);
	checkMeosError();
	return _r;
}

export function temporal_spans(temp: Ptr, count: Ptr): Ptr {
	const _r = callPtr('temporal_spans_w', [ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(count)]);
	checkMeosError();
	return _r;
}

export function temporal_split_each_n_spans(temp: Ptr, elem_count: number, count: Ptr): Ptr {
	const _r = callPtr('temporal_split_each_n_spans_w', [ptrArgType(), 'number', ptrArgType()], [ptrArgVal(temp), elem_count, ptrArgVal(count)]);
	checkMeosError();
	return _r;
}

export function temporal_split_n_spans(temp: Ptr, span_count: number, count: Ptr): Ptr {
	const _r = callPtr('temporal_split_n_spans_w', [ptrArgType(), 'number', ptrArgType()], [ptrArgVal(temp), span_count, ptrArgVal(count)]);
	checkMeosError();
	return _r;
}

export function tnumber_split_each_n_tboxes(temp: Ptr, elem_count: number, count: Ptr): Ptr {
	const _r = callPtr('tnumber_split_each_n_tboxes_w', [ptrArgType(), 'number', ptrArgType()], [ptrArgVal(temp), elem_count, ptrArgVal(count)]);
	checkMeosError();
	return _r;
}

export function tnumber_split_n_tboxes(temp: Ptr, box_count: number, count: Ptr): Ptr {
	const _r = callPtr('tnumber_split_n_tboxes_w', [ptrArgType(), 'number', ptrArgType()], [ptrArgVal(temp), box_count, ptrArgVal(count)]);
	checkMeosError();
	return _r;
}

export function tnumber_tboxes(temp: Ptr, count: Ptr): Ptr {
	const _r = callPtr('tnumber_tboxes_w', [ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(count)]);
	checkMeosError();
	return _r;
}

export function adjacent_numspan_tnumber(s: Ptr, temp: Ptr): boolean {
	const _r = call<number>('adjacent_numspan_tnumber_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(s), ptrArgVal(temp)]) !== 0;
	checkMeosError();
	return _r;
}

export function adjacent_tbox_tnumber(box: Ptr, temp: Ptr): boolean {
	const _r = call<number>('adjacent_tbox_tnumber_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(box), ptrArgVal(temp)]) !== 0;
	checkMeosError();
	return _r;
}

export function adjacent_temporal_temporal(temp1: Ptr, temp2: Ptr): boolean {
	const _r = call<number>('adjacent_temporal_temporal_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp1), ptrArgVal(temp2)]) !== 0;
	checkMeosError();
	return _r;
}

export function adjacent_temporal_tstzspan(temp: Ptr, s: Ptr): boolean {
	const _r = call<number>('adjacent_temporal_tstzspan_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(s)]) !== 0;
	checkMeosError();
	return _r;
}

export function adjacent_tnumber_numspan(temp: Ptr, s: Ptr): boolean {
	const _r = call<number>('adjacent_tnumber_numspan_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(s)]) !== 0;
	checkMeosError();
	return _r;
}

export function adjacent_tnumber_tbox(temp: Ptr, box: Ptr): boolean {
	const _r = call<number>('adjacent_tnumber_tbox_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(box)]) !== 0;
	checkMeosError();
	return _r;
}

export function adjacent_tnumber_tnumber(temp1: Ptr, temp2: Ptr): boolean {
	const _r = call<number>('adjacent_tnumber_tnumber_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp1), ptrArgVal(temp2)]) !== 0;
	checkMeosError();
	return _r;
}

export function adjacent_tstzspan_temporal(s: Ptr, temp: Ptr): boolean {
	const _r = call<number>('adjacent_tstzspan_temporal_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(s), ptrArgVal(temp)]) !== 0;
	checkMeosError();
	return _r;
}

export function contained_numspan_tnumber(s: Ptr, temp: Ptr): boolean {
	const _r = call<number>('contained_numspan_tnumber_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(s), ptrArgVal(temp)]) !== 0;
	checkMeosError();
	return _r;
}

export function contained_tbox_tnumber(box: Ptr, temp: Ptr): boolean {
	const _r = call<number>('contained_tbox_tnumber_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(box), ptrArgVal(temp)]) !== 0;
	checkMeosError();
	return _r;
}

export function contained_temporal_temporal(temp1: Ptr, temp2: Ptr): boolean {
	const _r = call<number>('contained_temporal_temporal_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp1), ptrArgVal(temp2)]) !== 0;
	checkMeosError();
	return _r;
}

export function contained_temporal_tstzspan(temp: Ptr, s: Ptr): boolean {
	const _r = call<number>('contained_temporal_tstzspan_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(s)]) !== 0;
	checkMeosError();
	return _r;
}

export function contained_tnumber_numspan(temp: Ptr, s: Ptr): boolean {
	const _r = call<number>('contained_tnumber_numspan_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(s)]) !== 0;
	checkMeosError();
	return _r;
}

export function contained_tnumber_tbox(temp: Ptr, box: Ptr): boolean {
	const _r = call<number>('contained_tnumber_tbox_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(box)]) !== 0;
	checkMeosError();
	return _r;
}

export function contained_tnumber_tnumber(temp1: Ptr, temp2: Ptr): boolean {
	const _r = call<number>('contained_tnumber_tnumber_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp1), ptrArgVal(temp2)]) !== 0;
	checkMeosError();
	return _r;
}

export function contained_tstzspan_temporal(s: Ptr, temp: Ptr): boolean {
	const _r = call<number>('contained_tstzspan_temporal_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(s), ptrArgVal(temp)]) !== 0;
	checkMeosError();
	return _r;
}

export function contains_numspan_tnumber(s: Ptr, temp: Ptr): boolean {
	const _r = call<number>('contains_numspan_tnumber_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(s), ptrArgVal(temp)]) !== 0;
	checkMeosError();
	return _r;
}

export function contains_tbox_tnumber(box: Ptr, temp: Ptr): boolean {
	const _r = call<number>('contains_tbox_tnumber_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(box), ptrArgVal(temp)]) !== 0;
	checkMeosError();
	return _r;
}

export function contains_temporal_tstzspan(temp: Ptr, s: Ptr): boolean {
	const _r = call<number>('contains_temporal_tstzspan_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(s)]) !== 0;
	checkMeosError();
	return _r;
}

export function contains_temporal_temporal(temp1: Ptr, temp2: Ptr): boolean {
	const _r = call<number>('contains_temporal_temporal_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp1), ptrArgVal(temp2)]) !== 0;
	checkMeosError();
	return _r;
}

export function contains_tnumber_numspan(temp: Ptr, s: Ptr): boolean {
	const _r = call<number>('contains_tnumber_numspan_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(s)]) !== 0;
	checkMeosError();
	return _r;
}

export function contains_tnumber_tbox(temp: Ptr, box: Ptr): boolean {
	const _r = call<number>('contains_tnumber_tbox_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(box)]) !== 0;
	checkMeosError();
	return _r;
}

export function contains_tnumber_tnumber(temp1: Ptr, temp2: Ptr): boolean {
	const _r = call<number>('contains_tnumber_tnumber_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp1), ptrArgVal(temp2)]) !== 0;
	checkMeosError();
	return _r;
}

export function contains_tstzspan_temporal(s: Ptr, temp: Ptr): boolean {
	const _r = call<number>('contains_tstzspan_temporal_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(s), ptrArgVal(temp)]) !== 0;
	checkMeosError();
	return _r;
}

export function overlaps_numspan_tnumber(s: Ptr, temp: Ptr): boolean {
	const _r = call<number>('overlaps_numspan_tnumber_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(s), ptrArgVal(temp)]) !== 0;
	checkMeosError();
	return _r;
}

export function overlaps_tbox_tnumber(box: Ptr, temp: Ptr): boolean {
	const _r = call<number>('overlaps_tbox_tnumber_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(box), ptrArgVal(temp)]) !== 0;
	checkMeosError();
	return _r;
}

export function overlaps_temporal_temporal(temp1: Ptr, temp2: Ptr): boolean {
	const _r = call<number>('overlaps_temporal_temporal_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp1), ptrArgVal(temp2)]) !== 0;
	checkMeosError();
	return _r;
}

export function overlaps_temporal_tstzspan(temp: Ptr, s: Ptr): boolean {
	const _r = call<number>('overlaps_temporal_tstzspan_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(s)]) !== 0;
	checkMeosError();
	return _r;
}

export function overlaps_tnumber_numspan(temp: Ptr, s: Ptr): boolean {
	const _r = call<number>('overlaps_tnumber_numspan_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(s)]) !== 0;
	checkMeosError();
	return _r;
}

export function overlaps_tnumber_tbox(temp: Ptr, box: Ptr): boolean {
	const _r = call<number>('overlaps_tnumber_tbox_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(box)]) !== 0;
	checkMeosError();
	return _r;
}

export function overlaps_tnumber_tnumber(temp1: Ptr, temp2: Ptr): boolean {
	const _r = call<number>('overlaps_tnumber_tnumber_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp1), ptrArgVal(temp2)]) !== 0;
	checkMeosError();
	return _r;
}

export function overlaps_tstzspan_temporal(s: Ptr, temp: Ptr): boolean {
	const _r = call<number>('overlaps_tstzspan_temporal_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(s), ptrArgVal(temp)]) !== 0;
	checkMeosError();
	return _r;
}

export function same_numspan_tnumber(s: Ptr, temp: Ptr): boolean {
	const _r = call<number>('same_numspan_tnumber_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(s), ptrArgVal(temp)]) !== 0;
	checkMeosError();
	return _r;
}

export function same_tbox_tnumber(box: Ptr, temp: Ptr): boolean {
	const _r = call<number>('same_tbox_tnumber_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(box), ptrArgVal(temp)]) !== 0;
	checkMeosError();
	return _r;
}

export function same_temporal_temporal(temp1: Ptr, temp2: Ptr): boolean {
	const _r = call<number>('same_temporal_temporal_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp1), ptrArgVal(temp2)]) !== 0;
	checkMeosError();
	return _r;
}

export function same_temporal_tstzspan(temp: Ptr, s: Ptr): boolean {
	const _r = call<number>('same_temporal_tstzspan_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(s)]) !== 0;
	checkMeosError();
	return _r;
}

export function same_tnumber_numspan(temp: Ptr, s: Ptr): boolean {
	const _r = call<number>('same_tnumber_numspan_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(s)]) !== 0;
	checkMeosError();
	return _r;
}

export function same_tnumber_tbox(temp: Ptr, box: Ptr): boolean {
	const _r = call<number>('same_tnumber_tbox_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(box)]) !== 0;
	checkMeosError();
	return _r;
}

export function same_tnumber_tnumber(temp1: Ptr, temp2: Ptr): boolean {
	const _r = call<number>('same_tnumber_tnumber_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp1), ptrArgVal(temp2)]) !== 0;
	checkMeosError();
	return _r;
}

export function same_tstzspan_temporal(s: Ptr, temp: Ptr): boolean {
	const _r = call<number>('same_tstzspan_temporal_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(s), ptrArgVal(temp)]) !== 0;
	checkMeosError();
	return _r;
}

export function after_tbox_tnumber(box: Ptr, temp: Ptr): boolean {
	const _r = call<number>('after_tbox_tnumber_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(box), ptrArgVal(temp)]) !== 0;
	checkMeosError();
	return _r;
}

export function after_temporal_tstzspan(temp: Ptr, s: Ptr): boolean {
	const _r = call<number>('after_temporal_tstzspan_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(s)]) !== 0;
	checkMeosError();
	return _r;
}

export function after_temporal_temporal(temp1: Ptr, temp2: Ptr): boolean {
	const _r = call<number>('after_temporal_temporal_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp1), ptrArgVal(temp2)]) !== 0;
	checkMeosError();
	return _r;
}

export function after_tnumber_tbox(temp: Ptr, box: Ptr): boolean {
	const _r = call<number>('after_tnumber_tbox_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(box)]) !== 0;
	checkMeosError();
	return _r;
}

export function after_tnumber_tnumber(temp1: Ptr, temp2: Ptr): boolean {
	const _r = call<number>('after_tnumber_tnumber_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp1), ptrArgVal(temp2)]) !== 0;
	checkMeosError();
	return _r;
}

export function after_tstzspan_temporal(s: Ptr, temp: Ptr): boolean {
	const _r = call<number>('after_tstzspan_temporal_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(s), ptrArgVal(temp)]) !== 0;
	checkMeosError();
	return _r;
}

export function before_tbox_tnumber(box: Ptr, temp: Ptr): boolean {
	const _r = call<number>('before_tbox_tnumber_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(box), ptrArgVal(temp)]) !== 0;
	checkMeosError();
	return _r;
}

export function before_temporal_tstzspan(temp: Ptr, s: Ptr): boolean {
	const _r = call<number>('before_temporal_tstzspan_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(s)]) !== 0;
	checkMeosError();
	return _r;
}

export function before_temporal_temporal(temp1: Ptr, temp2: Ptr): boolean {
	const _r = call<number>('before_temporal_temporal_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp1), ptrArgVal(temp2)]) !== 0;
	checkMeosError();
	return _r;
}

export function before_tnumber_tbox(temp: Ptr, box: Ptr): boolean {
	const _r = call<number>('before_tnumber_tbox_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(box)]) !== 0;
	checkMeosError();
	return _r;
}

export function before_tnumber_tnumber(temp1: Ptr, temp2: Ptr): boolean {
	const _r = call<number>('before_tnumber_tnumber_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp1), ptrArgVal(temp2)]) !== 0;
	checkMeosError();
	return _r;
}

export function before_tstzspan_temporal(s: Ptr, temp: Ptr): boolean {
	const _r = call<number>('before_tstzspan_temporal_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(s), ptrArgVal(temp)]) !== 0;
	checkMeosError();
	return _r;
}

export function left_tbox_tnumber(box: Ptr, temp: Ptr): boolean {
	const _r = call<number>('left_tbox_tnumber_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(box), ptrArgVal(temp)]) !== 0;
	checkMeosError();
	return _r;
}

export function left_numspan_tnumber(s: Ptr, temp: Ptr): boolean {
	const _r = call<number>('left_numspan_tnumber_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(s), ptrArgVal(temp)]) !== 0;
	checkMeosError();
	return _r;
}

export function left_tnumber_numspan(temp: Ptr, s: Ptr): boolean {
	const _r = call<number>('left_tnumber_numspan_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(s)]) !== 0;
	checkMeosError();
	return _r;
}

export function left_tnumber_tbox(temp: Ptr, box: Ptr): boolean {
	const _r = call<number>('left_tnumber_tbox_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(box)]) !== 0;
	checkMeosError();
	return _r;
}

export function left_tnumber_tnumber(temp1: Ptr, temp2: Ptr): boolean {
	const _r = call<number>('left_tnumber_tnumber_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp1), ptrArgVal(temp2)]) !== 0;
	checkMeosError();
	return _r;
}

export function overafter_tbox_tnumber(box: Ptr, temp: Ptr): boolean {
	const _r = call<number>('overafter_tbox_tnumber_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(box), ptrArgVal(temp)]) !== 0;
	checkMeosError();
	return _r;
}

export function overafter_temporal_tstzspan(temp: Ptr, s: Ptr): boolean {
	const _r = call<number>('overafter_temporal_tstzspan_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(s)]) !== 0;
	checkMeosError();
	return _r;
}

export function overafter_temporal_temporal(temp1: Ptr, temp2: Ptr): boolean {
	const _r = call<number>('overafter_temporal_temporal_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp1), ptrArgVal(temp2)]) !== 0;
	checkMeosError();
	return _r;
}

export function overafter_tnumber_tbox(temp: Ptr, box: Ptr): boolean {
	const _r = call<number>('overafter_tnumber_tbox_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(box)]) !== 0;
	checkMeosError();
	return _r;
}

export function overafter_tnumber_tnumber(temp1: Ptr, temp2: Ptr): boolean {
	const _r = call<number>('overafter_tnumber_tnumber_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp1), ptrArgVal(temp2)]) !== 0;
	checkMeosError();
	return _r;
}

export function overafter_tstzspan_temporal(s: Ptr, temp: Ptr): boolean {
	const _r = call<number>('overafter_tstzspan_temporal_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(s), ptrArgVal(temp)]) !== 0;
	checkMeosError();
	return _r;
}

export function overbefore_tbox_tnumber(box: Ptr, temp: Ptr): boolean {
	const _r = call<number>('overbefore_tbox_tnumber_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(box), ptrArgVal(temp)]) !== 0;
	checkMeosError();
	return _r;
}

export function overbefore_temporal_tstzspan(temp: Ptr, s: Ptr): boolean {
	const _r = call<number>('overbefore_temporal_tstzspan_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(s)]) !== 0;
	checkMeosError();
	return _r;
}

export function overbefore_temporal_temporal(temp1: Ptr, temp2: Ptr): boolean {
	const _r = call<number>('overbefore_temporal_temporal_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp1), ptrArgVal(temp2)]) !== 0;
	checkMeosError();
	return _r;
}

export function overbefore_tnumber_tbox(temp: Ptr, box: Ptr): boolean {
	const _r = call<number>('overbefore_tnumber_tbox_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(box)]) !== 0;
	checkMeosError();
	return _r;
}

export function overbefore_tnumber_tnumber(temp1: Ptr, temp2: Ptr): boolean {
	const _r = call<number>('overbefore_tnumber_tnumber_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp1), ptrArgVal(temp2)]) !== 0;
	checkMeosError();
	return _r;
}

export function overbefore_tstzspan_temporal(s: Ptr, temp: Ptr): boolean {
	const _r = call<number>('overbefore_tstzspan_temporal_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(s), ptrArgVal(temp)]) !== 0;
	checkMeosError();
	return _r;
}

export function overleft_numspan_tnumber(s: Ptr, temp: Ptr): boolean {
	const _r = call<number>('overleft_numspan_tnumber_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(s), ptrArgVal(temp)]) !== 0;
	checkMeosError();
	return _r;
}

export function overleft_tbox_tnumber(box: Ptr, temp: Ptr): boolean {
	const _r = call<number>('overleft_tbox_tnumber_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(box), ptrArgVal(temp)]) !== 0;
	checkMeosError();
	return _r;
}

export function overleft_tnumber_numspan(temp: Ptr, s: Ptr): boolean {
	const _r = call<number>('overleft_tnumber_numspan_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(s)]) !== 0;
	checkMeosError();
	return _r;
}

export function overleft_tnumber_tbox(temp: Ptr, box: Ptr): boolean {
	const _r = call<number>('overleft_tnumber_tbox_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(box)]) !== 0;
	checkMeosError();
	return _r;
}

export function overleft_tnumber_tnumber(temp1: Ptr, temp2: Ptr): boolean {
	const _r = call<number>('overleft_tnumber_tnumber_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp1), ptrArgVal(temp2)]) !== 0;
	checkMeosError();
	return _r;
}

export function overright_numspan_tnumber(s: Ptr, temp: Ptr): boolean {
	const _r = call<number>('overright_numspan_tnumber_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(s), ptrArgVal(temp)]) !== 0;
	checkMeosError();
	return _r;
}

export function overright_tbox_tnumber(box: Ptr, temp: Ptr): boolean {
	const _r = call<number>('overright_tbox_tnumber_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(box), ptrArgVal(temp)]) !== 0;
	checkMeosError();
	return _r;
}

export function overright_tnumber_numspan(temp: Ptr, s: Ptr): boolean {
	const _r = call<number>('overright_tnumber_numspan_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(s)]) !== 0;
	checkMeosError();
	return _r;
}

export function overright_tnumber_tbox(temp: Ptr, box: Ptr): boolean {
	const _r = call<number>('overright_tnumber_tbox_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(box)]) !== 0;
	checkMeosError();
	return _r;
}

export function overright_tnumber_tnumber(temp1: Ptr, temp2: Ptr): boolean {
	const _r = call<number>('overright_tnumber_tnumber_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp1), ptrArgVal(temp2)]) !== 0;
	checkMeosError();
	return _r;
}

export function right_numspan_tnumber(s: Ptr, temp: Ptr): boolean {
	const _r = call<number>('right_numspan_tnumber_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(s), ptrArgVal(temp)]) !== 0;
	checkMeosError();
	return _r;
}

export function right_tbox_tnumber(box: Ptr, temp: Ptr): boolean {
	const _r = call<number>('right_tbox_tnumber_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(box), ptrArgVal(temp)]) !== 0;
	checkMeosError();
	return _r;
}

export function right_tnumber_numspan(temp: Ptr, s: Ptr): boolean {
	const _r = call<number>('right_tnumber_numspan_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(s)]) !== 0;
	checkMeosError();
	return _r;
}

export function right_tnumber_tbox(temp: Ptr, box: Ptr): boolean {
	const _r = call<number>('right_tnumber_tbox_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(box)]) !== 0;
	checkMeosError();
	return _r;
}

export function right_tnumber_tnumber(temp1: Ptr, temp2: Ptr): boolean {
	const _r = call<number>('right_tnumber_tnumber_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp1), ptrArgVal(temp2)]) !== 0;
	checkMeosError();
	return _r;
}

export function tand_bool_tbool(b: boolean, temp: Ptr): Ptr {
	const _r = callPtr('tand_bool_tbool_w', ['number', ptrArgType()], [b ? 1 : 0, ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function tand_tbool_bool(temp: Ptr, b: boolean): Ptr {
	const _r = callPtr('tand_tbool_bool_w', [ptrArgType(), 'number'], [ptrArgVal(temp), b ? 1 : 0]);
	checkMeosError();
	return _r;
}

export function tand_tbool_tbool(temp1: Ptr, temp2: Ptr): Ptr {
	const _r = callPtr('tand_tbool_tbool_w', [ptrArgType(), ptrArgType()], [ptrArgVal(temp1), ptrArgVal(temp2)]);
	checkMeosError();
	return _r;
}

export function tbool_when_true(temp: Ptr): Ptr {
	const _r = callPtr('tbool_when_true_w', [ptrArgType()], [ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function tnot_tbool(temp: Ptr): Ptr {
	const _r = callPtr('tnot_tbool_w', [ptrArgType()], [ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function tor_bool_tbool(b: boolean, temp: Ptr): Ptr {
	const _r = callPtr('tor_bool_tbool_w', ['number', ptrArgType()], [b ? 1 : 0, ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function tor_tbool_bool(temp: Ptr, b: boolean): Ptr {
	const _r = callPtr('tor_tbool_bool_w', [ptrArgType(), 'number'], [ptrArgVal(temp), b ? 1 : 0]);
	checkMeosError();
	return _r;
}

export function tor_tbool_tbool(temp1: Ptr, temp2: Ptr): Ptr {
	const _r = callPtr('tor_tbool_tbool_w', [ptrArgType(), ptrArgType()], [ptrArgVal(temp1), ptrArgVal(temp2)]);
	checkMeosError();
	return _r;
}

export function add_float_tfloat(d: number, tnumber: Ptr): Ptr {
	const _r = callPtr('add_float_tfloat_w', ['number', ptrArgType()], [d, ptrArgVal(tnumber)]);
	checkMeosError();
	return _r;
}

export function add_int_tint(i: number, tnumber: Ptr): Ptr {
	const _r = callPtr('add_int_tint_w', ['number', ptrArgType()], [i, ptrArgVal(tnumber)]);
	checkMeosError();
	return _r;
}

export function add_tfloat_float(tnumber: Ptr, d: number): Ptr {
	const _r = callPtr('add_tfloat_float_w', [ptrArgType(), 'number'], [ptrArgVal(tnumber), d]);
	checkMeosError();
	return _r;
}

export function add_tint_int(tnumber: Ptr, i: number): Ptr {
	const _r = callPtr('add_tint_int_w', [ptrArgType(), 'number'], [ptrArgVal(tnumber), i]);
	checkMeosError();
	return _r;
}

export function add_tnumber_tnumber(tnumber1: Ptr, tnumber2: Ptr): Ptr {
	const _r = callPtr('add_tnumber_tnumber_w', [ptrArgType(), ptrArgType()], [ptrArgVal(tnumber1), ptrArgVal(tnumber2)]);
	checkMeosError();
	return _r;
}

export function div_float_tfloat(d: number, tnumber: Ptr): Ptr {
	const _r = callPtr('div_float_tfloat_w', ['number', ptrArgType()], [d, ptrArgVal(tnumber)]);
	checkMeosError();
	return _r;
}

export function div_int_tint(i: number, tnumber: Ptr): Ptr {
	const _r = callPtr('div_int_tint_w', ['number', ptrArgType()], [i, ptrArgVal(tnumber)]);
	checkMeosError();
	return _r;
}

export function div_tfloat_float(tnumber: Ptr, d: number): Ptr {
	const _r = callPtr('div_tfloat_float_w', [ptrArgType(), 'number'], [ptrArgVal(tnumber), d]);
	checkMeosError();
	return _r;
}

export function div_tint_int(tnumber: Ptr, i: number): Ptr {
	const _r = callPtr('div_tint_int_w', [ptrArgType(), 'number'], [ptrArgVal(tnumber), i]);
	checkMeosError();
	return _r;
}

export function div_tnumber_tnumber(tnumber1: Ptr, tnumber2: Ptr): Ptr {
	const _r = callPtr('div_tnumber_tnumber_w', [ptrArgType(), ptrArgType()], [ptrArgVal(tnumber1), ptrArgVal(tnumber2)]);
	checkMeosError();
	return _r;
}

export function mult_float_tfloat(d: number, tnumber: Ptr): Ptr {
	const _r = callPtr('mult_float_tfloat_w', ['number', ptrArgType()], [d, ptrArgVal(tnumber)]);
	checkMeosError();
	return _r;
}

export function mult_int_tint(i: number, tnumber: Ptr): Ptr {
	const _r = callPtr('mult_int_tint_w', ['number', ptrArgType()], [i, ptrArgVal(tnumber)]);
	checkMeosError();
	return _r;
}

export function mult_tfloat_float(tnumber: Ptr, d: number): Ptr {
	const _r = callPtr('mult_tfloat_float_w', [ptrArgType(), 'number'], [ptrArgVal(tnumber), d]);
	checkMeosError();
	return _r;
}

export function mult_tint_int(tnumber: Ptr, i: number): Ptr {
	const _r = callPtr('mult_tint_int_w', [ptrArgType(), 'number'], [ptrArgVal(tnumber), i]);
	checkMeosError();
	return _r;
}

export function mult_tnumber_tnumber(tnumber1: Ptr, tnumber2: Ptr): Ptr {
	const _r = callPtr('mult_tnumber_tnumber_w', [ptrArgType(), ptrArgType()], [ptrArgVal(tnumber1), ptrArgVal(tnumber2)]);
	checkMeosError();
	return _r;
}

export function sub_float_tfloat(d: number, tnumber: Ptr): Ptr {
	const _r = callPtr('sub_float_tfloat_w', ['number', ptrArgType()], [d, ptrArgVal(tnumber)]);
	checkMeosError();
	return _r;
}

export function sub_int_tint(i: number, tnumber: Ptr): Ptr {
	const _r = callPtr('sub_int_tint_w', ['number', ptrArgType()], [i, ptrArgVal(tnumber)]);
	checkMeosError();
	return _r;
}

export function sub_tfloat_float(tnumber: Ptr, d: number): Ptr {
	const _r = callPtr('sub_tfloat_float_w', [ptrArgType(), 'number'], [ptrArgVal(tnumber), d]);
	checkMeosError();
	return _r;
}

export function sub_tint_int(tnumber: Ptr, i: number): Ptr {
	const _r = callPtr('sub_tint_int_w', [ptrArgType(), 'number'], [ptrArgVal(tnumber), i]);
	checkMeosError();
	return _r;
}

export function sub_tnumber_tnumber(tnumber1: Ptr, tnumber2: Ptr): Ptr {
	const _r = callPtr('sub_tnumber_tnumber_w', [ptrArgType(), ptrArgType()], [ptrArgVal(tnumber1), ptrArgVal(tnumber2)]);
	checkMeosError();
	return _r;
}

export function temporal_derivative(temp: Ptr): Ptr {
	const _r = callPtr('temporal_derivative_w', [ptrArgType()], [ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function tfloat_exp(temp: Ptr): Ptr {
	const _r = callPtr('tfloat_exp_w', [ptrArgType()], [ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function tfloat_ln(temp: Ptr): Ptr {
	const _r = callPtr('tfloat_ln_w', [ptrArgType()], [ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function tfloat_log10(temp: Ptr): Ptr {
	const _r = callPtr('tfloat_log10_w', [ptrArgType()], [ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function tnumber_abs(temp: Ptr): Ptr {
	const _r = callPtr('tnumber_abs_w', [ptrArgType()], [ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function tnumber_trend(temp: Ptr): Ptr {
	const _r = callPtr('tnumber_trend_w', [ptrArgType()], [ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function float_angular_difference(degrees1: number, degrees2: number): number {
	const _r = call<number>('float_angular_difference_w', 'number', ['number', 'number'], [degrees1, degrees2]);
	checkMeosError();
	return _r;
}

export function tnumber_angular_difference(temp: Ptr): Ptr {
	const _r = callPtr('tnumber_angular_difference_w', [ptrArgType()], [ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function tnumber_delta_value(temp: Ptr): Ptr {
	const _r = callPtr('tnumber_delta_value_w', [ptrArgType()], [ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function textcat_text_ttext(txt: string, temp: Ptr): Ptr {
	const _r = callPtr('textcat_text_ttext_w', ['string', ptrArgType()], [txt, ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function textcat_ttext_text(temp: Ptr, txt: string): Ptr {
	const _r = callPtr('textcat_ttext_text_w', [ptrArgType(), 'string'], [ptrArgVal(temp), txt]);
	checkMeosError();
	return _r;
}

export function textcat_ttext_ttext(temp1: Ptr, temp2: Ptr): Ptr {
	const _r = callPtr('textcat_ttext_ttext_w', [ptrArgType(), ptrArgType()], [ptrArgVal(temp1), ptrArgVal(temp2)]);
	checkMeosError();
	return _r;
}

export function ttext_initcap(temp: Ptr): Ptr {
	const _r = callPtr('ttext_initcap_w', [ptrArgType()], [ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function ttext_upper(temp: Ptr): Ptr {
	const _r = callPtr('ttext_upper_w', [ptrArgType()], [ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function ttext_lower(temp: Ptr): Ptr {
	const _r = callPtr('ttext_lower_w', [ptrArgType()], [ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function tdistance_tfloat_float(temp: Ptr, d: number): Ptr {
	const _r = callPtr('tdistance_tfloat_float_w', [ptrArgType(), 'number'], [ptrArgVal(temp), d]);
	checkMeosError();
	return _r;
}

export function tdistance_tint_int(temp: Ptr, i: number): Ptr {
	const _r = callPtr('tdistance_tint_int_w', [ptrArgType(), 'number'], [ptrArgVal(temp), i]);
	checkMeosError();
	return _r;
}

export function tdistance_tnumber_tnumber(temp1: Ptr, temp2: Ptr): Ptr {
	const _r = callPtr('tdistance_tnumber_tnumber_w', [ptrArgType(), ptrArgType()], [ptrArgVal(temp1), ptrArgVal(temp2)]);
	checkMeosError();
	return _r;
}

export function nad_tboxfloat_tboxfloat(box1: Ptr, box2: Ptr): number {
	const _r = call<number>('nad_tboxfloat_tboxfloat_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(box1), ptrArgVal(box2)]);
	checkMeosError();
	return _r;
}

export function nad_tboxint_tboxint(box1: Ptr, box2: Ptr): number {
	const _r = call<number>('nad_tboxint_tboxint_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(box1), ptrArgVal(box2)]);
	checkMeosError();
	return _r;
}

export function nad_tfloat_float(temp: Ptr, d: number): number {
	const _r = call<number>('nad_tfloat_float_w', 'number', [ptrArgType(), 'number'], [ptrArgVal(temp), d]);
	checkMeosError();
	return _r;
}

export function nad_tfloat_tfloat(temp1: Ptr, temp2: Ptr): number {
	const _r = call<number>('nad_tfloat_tfloat_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp1), ptrArgVal(temp2)]);
	checkMeosError();
	return _r;
}

export function nad_tfloat_tbox(temp: Ptr, box: Ptr): number {
	const _r = call<number>('nad_tfloat_tbox_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(box)]);
	checkMeosError();
	return _r;
}

export function nad_tint_int(temp: Ptr, i: number): number {
	const _r = call<number>('nad_tint_int_w', 'number', [ptrArgType(), 'number'], [ptrArgVal(temp), i]);
	checkMeosError();
	return _r;
}

export function nad_tint_tbox(temp: Ptr, box: Ptr): number {
	const _r = call<number>('nad_tint_tbox_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(box)]);
	checkMeosError();
	return _r;
}

export function nad_tint_tint(temp1: Ptr, temp2: Ptr): number {
	const _r = call<number>('nad_tint_tint_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp1), ptrArgVal(temp2)]);
	checkMeosError();
	return _r;
}

export function tbool_tand_transfn(state: Ptr, temp: Ptr): Ptr {
	const _r = callPtr('tbool_tand_transfn_w', [ptrArgType(), ptrArgType()], [ptrArgVal(state), ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function tbool_tor_transfn(state: Ptr, temp: Ptr): Ptr {
	const _r = callPtr('tbool_tor_transfn_w', [ptrArgType(), ptrArgType()], [ptrArgVal(state), ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function temporal_extent_transfn(s: Ptr, temp: Ptr): Ptr {
	const _r = callPtr('temporal_extent_transfn_w', [ptrArgType(), ptrArgType()], [ptrArgVal(s), ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function temporal_tagg_finalfn(state: Ptr): Ptr {
	const _r = callPtr('temporal_tagg_finalfn_w', [ptrArgType()], [ptrArgVal(state)]);
	checkMeosError();
	return _r;
}

export function temporal_tcount_transfn(state: Ptr, temp: Ptr): Ptr {
	const _r = callPtr('temporal_tcount_transfn_w', [ptrArgType(), ptrArgType()], [ptrArgVal(state), ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function tfloat_tmax_transfn(state: Ptr, temp: Ptr): Ptr {
	const _r = callPtr('tfloat_tmax_transfn_w', [ptrArgType(), ptrArgType()], [ptrArgVal(state), ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function tfloat_tmin_transfn(state: Ptr, temp: Ptr): Ptr {
	const _r = callPtr('tfloat_tmin_transfn_w', [ptrArgType(), ptrArgType()], [ptrArgVal(state), ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function tfloat_tsum_transfn(state: Ptr, temp: Ptr): Ptr {
	const _r = callPtr('tfloat_tsum_transfn_w', [ptrArgType(), ptrArgType()], [ptrArgVal(state), ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function tfloat_wmax_transfn(state: Ptr, temp: Ptr, interv: Ptr): Ptr {
	const _r = callPtr('tfloat_wmax_transfn_w', [ptrArgType(), ptrArgType(), ptrArgType()], [ptrArgVal(state), ptrArgVal(temp), ptrArgVal(interv)]);
	checkMeosError();
	return _r;
}

export function tfloat_wmin_transfn(state: Ptr, temp: Ptr, interv: Ptr): Ptr {
	const _r = callPtr('tfloat_wmin_transfn_w', [ptrArgType(), ptrArgType(), ptrArgType()], [ptrArgVal(state), ptrArgVal(temp), ptrArgVal(interv)]);
	checkMeosError();
	return _r;
}

export function tfloat_wsum_transfn(state: Ptr, temp: Ptr, interv: Ptr): Ptr {
	const _r = callPtr('tfloat_wsum_transfn_w', [ptrArgType(), ptrArgType(), ptrArgType()], [ptrArgVal(state), ptrArgVal(temp), ptrArgVal(interv)]);
	checkMeosError();
	return _r;
}

export function timestamptz_tcount_transfn(state: Ptr, t: TimestampTz): Ptr {
	const _r = callPtr('timestamptz_tcount_transfn_w', [ptrArgType(), 'bigint'], [ptrArgVal(state), BigInt(t)]);
	checkMeosError();
	return _r;
}

export function tint_tmax_transfn(state: Ptr, temp: Ptr): Ptr {
	const _r = callPtr('tint_tmax_transfn_w', [ptrArgType(), ptrArgType()], [ptrArgVal(state), ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function tint_tmin_transfn(state: Ptr, temp: Ptr): Ptr {
	const _r = callPtr('tint_tmin_transfn_w', [ptrArgType(), ptrArgType()], [ptrArgVal(state), ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function tint_tsum_transfn(state: Ptr, temp: Ptr): Ptr {
	const _r = callPtr('tint_tsum_transfn_w', [ptrArgType(), ptrArgType()], [ptrArgVal(state), ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function tint_wmax_transfn(state: Ptr, temp: Ptr, interv: Ptr): Ptr {
	const _r = callPtr('tint_wmax_transfn_w', [ptrArgType(), ptrArgType(), ptrArgType()], [ptrArgVal(state), ptrArgVal(temp), ptrArgVal(interv)]);
	checkMeosError();
	return _r;
}

export function tint_wmin_transfn(state: Ptr, temp: Ptr, interv: Ptr): Ptr {
	const _r = callPtr('tint_wmin_transfn_w', [ptrArgType(), ptrArgType(), ptrArgType()], [ptrArgVal(state), ptrArgVal(temp), ptrArgVal(interv)]);
	checkMeosError();
	return _r;
}

export function tint_wsum_transfn(state: Ptr, temp: Ptr, interv: Ptr): Ptr {
	const _r = callPtr('tint_wsum_transfn_w', [ptrArgType(), ptrArgType(), ptrArgType()], [ptrArgVal(state), ptrArgVal(temp), ptrArgVal(interv)]);
	checkMeosError();
	return _r;
}

export function tnumber_extent_transfn(box: Ptr, temp: Ptr): Ptr {
	const _r = callPtr('tnumber_extent_transfn_w', [ptrArgType(), ptrArgType()], [ptrArgVal(box), ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function tnumber_tavg_finalfn(state: Ptr): Ptr {
	const _r = callPtr('tnumber_tavg_finalfn_w', [ptrArgType()], [ptrArgVal(state)]);
	checkMeosError();
	return _r;
}

export function tnumber_tavg_transfn(state: Ptr, temp: Ptr): Ptr {
	const _r = callPtr('tnumber_tavg_transfn_w', [ptrArgType(), ptrArgType()], [ptrArgVal(state), ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function tnumber_wavg_transfn(state: Ptr, temp: Ptr, interv: Ptr): Ptr {
	const _r = callPtr('tnumber_wavg_transfn_w', [ptrArgType(), ptrArgType(), ptrArgType()], [ptrArgVal(state), ptrArgVal(temp), ptrArgVal(interv)]);
	checkMeosError();
	return _r;
}

export function tstzset_tcount_transfn(state: Ptr, s: Ptr): Ptr {
	const _r = callPtr('tstzset_tcount_transfn_w', [ptrArgType(), ptrArgType()], [ptrArgVal(state), ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function tstzspan_tcount_transfn(state: Ptr, s: Ptr): Ptr {
	const _r = callPtr('tstzspan_tcount_transfn_w', [ptrArgType(), ptrArgType()], [ptrArgVal(state), ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function tstzspanset_tcount_transfn(state: Ptr, ss: Ptr): Ptr {
	const _r = callPtr('tstzspanset_tcount_transfn_w', [ptrArgType(), ptrArgType()], [ptrArgVal(state), ptrArgVal(ss)]);
	checkMeosError();
	return _r;
}

export function ttext_tmax_transfn(state: Ptr, temp: Ptr): Ptr {
	const _r = callPtr('ttext_tmax_transfn_w', [ptrArgType(), ptrArgType()], [ptrArgVal(state), ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function ttext_tmin_transfn(state: Ptr, temp: Ptr): Ptr {
	const _r = callPtr('ttext_tmin_transfn_w', [ptrArgType(), ptrArgType()], [ptrArgVal(state), ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function temporal_simplify_dp(temp: Ptr, eps_dist: number, synchronized: boolean): Ptr {
	const _r = callPtr('temporal_simplify_dp_w', [ptrArgType(), 'number', 'number'], [ptrArgVal(temp), eps_dist, synchronized ? 1 : 0]);
	checkMeosError();
	return _r;
}

export function temporal_simplify_max_dist(temp: Ptr, eps_dist: number, synchronized: boolean): Ptr {
	const _r = callPtr('temporal_simplify_max_dist_w', [ptrArgType(), 'number', 'number'], [ptrArgVal(temp), eps_dist, synchronized ? 1 : 0]);
	checkMeosError();
	return _r;
}

export function temporal_simplify_min_dist(temp: Ptr, dist: number): Ptr {
	const _r = callPtr('temporal_simplify_min_dist_w', [ptrArgType(), 'number'], [ptrArgVal(temp), dist]);
	checkMeosError();
	return _r;
}

export function temporal_simplify_min_tdelta(temp: Ptr, mint: Ptr): Ptr {
	const _r = callPtr('temporal_simplify_min_tdelta_w', [ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(mint)]);
	checkMeosError();
	return _r;
}

export function temporal_tprecision(temp: Ptr, duration: Ptr, origin: TimestampTz): Ptr {
	const _r = callPtr('temporal_tprecision_w', [ptrArgType(), ptrArgType(), 'bigint'], [ptrArgVal(temp), ptrArgVal(duration), BigInt(origin)]);
	checkMeosError();
	return _r;
}

export function temporal_tsample(temp: Ptr, duration: Ptr, origin: TimestampTz, interp: number): Ptr {
	const _r = callPtr('temporal_tsample_w', [ptrArgType(), ptrArgType(), 'bigint', 'number'], [ptrArgVal(temp), ptrArgVal(duration), BigInt(origin), interp]);
	checkMeosError();
	return _r;
}

export function temporal_dyntimewarp_distance(temp1: Ptr, temp2: Ptr): number {
	const _r = call<number>('temporal_dyntimewarp_distance_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp1), ptrArgVal(temp2)]);
	checkMeosError();
	return _r;
}

export function temporal_dyntimewarp_path(temp1: Ptr, temp2: Ptr, count: Ptr): Ptr {
	const _r = callPtr('temporal_dyntimewarp_path_w', [ptrArgType(), ptrArgType(), ptrArgType()], [ptrArgVal(temp1), ptrArgVal(temp2), ptrArgVal(count)]);
	checkMeosError();
	return _r;
}

export function temporal_frechet_distance(temp1: Ptr, temp2: Ptr): number {
	const _r = call<number>('temporal_frechet_distance_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp1), ptrArgVal(temp2)]);
	checkMeosError();
	return _r;
}

export function temporal_frechet_path(temp1: Ptr, temp2: Ptr, count: Ptr): Ptr {
	const _r = callPtr('temporal_frechet_path_w', [ptrArgType(), ptrArgType(), ptrArgType()], [ptrArgVal(temp1), ptrArgVal(temp2), ptrArgVal(count)]);
	checkMeosError();
	return _r;
}

export function temporal_hausdorff_distance(temp1: Ptr, temp2: Ptr): number {
	const _r = call<number>('temporal_hausdorff_distance_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp1), ptrArgVal(temp2)]);
	checkMeosError();
	return _r;
}

export function temporal_time_bins(temp: Ptr, duration: Ptr, origin: TimestampTz, count: Ptr): Ptr {
	const _r = callPtr('temporal_time_bins_w', [ptrArgType(), ptrArgType(), 'bigint', ptrArgType()], [ptrArgVal(temp), ptrArgVal(duration), BigInt(origin), ptrArgVal(count)]);
	checkMeosError();
	return _r;
}

export function temporal_time_split(temp: Ptr, duration: Ptr, torigin: TimestampTz, time_bins: Ptr, count: Ptr): Ptr {
	const _r = callPtr('temporal_time_split_w', [ptrArgType(), ptrArgType(), 'bigint', ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(duration), BigInt(torigin), ptrArgVal(time_bins), ptrArgVal(count)]);
	checkMeosError();
	return _r;
}

export function tfloat_time_boxes(temp: Ptr, duration: Ptr, torigin: TimestampTz, count: Ptr): Ptr {
	const _r = callPtr('tfloat_time_boxes_w', [ptrArgType(), ptrArgType(), 'bigint', ptrArgType()], [ptrArgVal(temp), ptrArgVal(duration), BigInt(torigin), ptrArgVal(count)]);
	checkMeosError();
	return _r;
}

export function tfloat_value_bins(temp: Ptr, vsize: number, vorigin: number, count: Ptr): Ptr {
	const _r = callPtr('tfloat_value_bins_w', [ptrArgType(), 'number', 'number', ptrArgType()], [ptrArgVal(temp), vsize, vorigin, ptrArgVal(count)]);
	checkMeosError();
	return _r;
}

export function tfloat_value_boxes(temp: Ptr, vsize: number, vorigin: number, count: Ptr): Ptr {
	const _r = callPtr('tfloat_value_boxes_w', [ptrArgType(), 'number', 'number', ptrArgType()], [ptrArgVal(temp), vsize, vorigin, ptrArgVal(count)]);
	checkMeosError();
	return _r;
}

export function tfloat_value_split(temp: Ptr, size: number, origin: number, bins: Ptr, count: Ptr): Ptr {
	const _r = callPtr('tfloat_value_split_w', [ptrArgType(), 'number', 'number', ptrArgType(), ptrArgType()], [ptrArgVal(temp), size, origin, ptrArgVal(bins), ptrArgVal(count)]);
	checkMeosError();
	return _r;
}

export function tfloat_value_time_boxes(temp: Ptr, vsize: number, duration: Ptr, vorigin: number, torigin: TimestampTz, count: Ptr): Ptr {
	const _r = callPtr('tfloat_value_time_boxes_w', [ptrArgType(), 'number', ptrArgType(), 'number', 'bigint', ptrArgType()], [ptrArgVal(temp), vsize, ptrArgVal(duration), vorigin, BigInt(torigin), ptrArgVal(count)]);
	checkMeosError();
	return _r;
}

export function tfloat_value_time_split(temp: Ptr, vsize: number, duration: Ptr, vorigin: number, torigin: TimestampTz, value_bins: Ptr, time_bins: Ptr, count: Ptr): Ptr {
	const _r = callPtr('tfloat_value_time_split_w', [ptrArgType(), 'number', ptrArgType(), 'number', 'bigint', ptrArgType(), ptrArgType(), ptrArgType()], [ptrArgVal(temp), vsize, ptrArgVal(duration), vorigin, BigInt(torigin), ptrArgVal(value_bins), ptrArgVal(time_bins), ptrArgVal(count)]);
	checkMeosError();
	return _r;
}

export function tfloatbox_time_tiles(box: Ptr, duration: Ptr, torigin: TimestampTz, count: Ptr): Ptr {
	const _r = callPtr('tfloatbox_time_tiles_w', [ptrArgType(), ptrArgType(), 'bigint', ptrArgType()], [ptrArgVal(box), ptrArgVal(duration), BigInt(torigin), ptrArgVal(count)]);
	checkMeosError();
	return _r;
}

export function tfloatbox_value_tiles(box: Ptr, vsize: number, vorigin: number, count: Ptr): Ptr {
	const _r = callPtr('tfloatbox_value_tiles_w', [ptrArgType(), 'number', 'number', ptrArgType()], [ptrArgVal(box), vsize, vorigin, ptrArgVal(count)]);
	checkMeosError();
	return _r;
}

export function tfloatbox_value_time_tiles(box: Ptr, vsize: number, duration: Ptr, vorigin: number, torigin: TimestampTz, count: Ptr): Ptr {
	const _r = callPtr('tfloatbox_value_time_tiles_w', [ptrArgType(), 'number', ptrArgType(), 'number', 'bigint', ptrArgType()], [ptrArgVal(box), vsize, ptrArgVal(duration), vorigin, BigInt(torigin), ptrArgVal(count)]);
	checkMeosError();
	return _r;
}

export function tint_time_boxes(temp: Ptr, duration: Ptr, torigin: TimestampTz, count: Ptr): Ptr {
	const _r = callPtr('tint_time_boxes_w', [ptrArgType(), ptrArgType(), 'bigint', ptrArgType()], [ptrArgVal(temp), ptrArgVal(duration), BigInt(torigin), ptrArgVal(count)]);
	checkMeosError();
	return _r;
}

export function tint_value_bins(temp: Ptr, vsize: number, vorigin: number, count: Ptr): Ptr {
	const _r = callPtr('tint_value_bins_w', [ptrArgType(), 'number', 'number', ptrArgType()], [ptrArgVal(temp), vsize, vorigin, ptrArgVal(count)]);
	checkMeosError();
	return _r;
}

export function tint_value_boxes(temp: Ptr, vsize: number, vorigin: number, count: Ptr): Ptr {
	const _r = callPtr('tint_value_boxes_w', [ptrArgType(), 'number', 'number', ptrArgType()], [ptrArgVal(temp), vsize, vorigin, ptrArgVal(count)]);
	checkMeosError();
	return _r;
}

export function tint_value_split(temp: Ptr, vsize: number, vorigin: number, bins: Ptr, count: Ptr): Ptr {
	const _r = callPtr('tint_value_split_w', [ptrArgType(), 'number', 'number', ptrArgType(), ptrArgType()], [ptrArgVal(temp), vsize, vorigin, ptrArgVal(bins), ptrArgVal(count)]);
	checkMeosError();
	return _r;
}

export function tint_value_time_boxes(temp: Ptr, vsize: number, duration: Ptr, vorigin: number, torigin: TimestampTz, count: Ptr): Ptr {
	const _r = callPtr('tint_value_time_boxes_w', [ptrArgType(), 'number', ptrArgType(), 'number', 'bigint', ptrArgType()], [ptrArgVal(temp), vsize, ptrArgVal(duration), vorigin, BigInt(torigin), ptrArgVal(count)]);
	checkMeosError();
	return _r;
}

export function tint_value_time_split(temp: Ptr, size: number, duration: Ptr, vorigin: number, torigin: TimestampTz, value_bins: Ptr, time_bins: Ptr, count: Ptr): Ptr {
	const _r = callPtr('tint_value_time_split_w', [ptrArgType(), 'number', ptrArgType(), 'number', 'bigint', ptrArgType(), ptrArgType(), ptrArgType()], [ptrArgVal(temp), size, ptrArgVal(duration), vorigin, BigInt(torigin), ptrArgVal(value_bins), ptrArgVal(time_bins), ptrArgVal(count)]);
	checkMeosError();
	return _r;
}

export function tintbox_time_tiles(box: Ptr, duration: Ptr, torigin: TimestampTz, count: Ptr): Ptr {
	const _r = callPtr('tintbox_time_tiles_w', [ptrArgType(), ptrArgType(), 'bigint', ptrArgType()], [ptrArgVal(box), ptrArgVal(duration), BigInt(torigin), ptrArgVal(count)]);
	checkMeosError();
	return _r;
}

export function tintbox_value_tiles(box: Ptr, xsize: number, xorigin: number, count: Ptr): Ptr {
	const _r = callPtr('tintbox_value_tiles_w', [ptrArgType(), 'number', 'number', ptrArgType()], [ptrArgVal(box), xsize, xorigin, ptrArgVal(count)]);
	checkMeosError();
	return _r;
}

export function tintbox_value_time_tiles(box: Ptr, xsize: number, duration: Ptr, xorigin: number, torigin: TimestampTz, count: Ptr): Ptr {
	const _r = callPtr('tintbox_value_time_tiles_w', [ptrArgType(), 'number', ptrArgType(), 'number', 'bigint', ptrArgType()], [ptrArgVal(box), xsize, ptrArgVal(duration), xorigin, BigInt(torigin), ptrArgVal(count)]);
	checkMeosError();
	return _r;
}


// === meos_geo.h ===

export function geo_as_ewkb(gs: Ptr, endian: string, size: Ptr): Ptr {
	const _r = callPtr('geo_as_ewkb_w', [ptrArgType(), 'string', ptrArgType()], [ptrArgVal(gs), endian, ptrArgVal(size)]);
	checkMeosError();
	return _r;
}

export function geo_as_ewkt(gs: Ptr, precision: number): string {
	const _r = call<string>('geo_as_ewkt_w', 'string', [ptrArgType(), 'number'], [ptrArgVal(gs), precision]);
	checkMeosError();
	return _r;
}

export function geo_as_geojson(gs: Ptr, option: number, precision: number, srs: string): string {
	const _r = call<string>('geo_as_geojson_w', 'string', [ptrArgType(), 'number', 'number', 'string'], [ptrArgVal(gs), option, precision, srs]);
	checkMeosError();
	return _r;
}

export function geo_as_hexewkb(gs: Ptr, endian: string): string {
	const _r = call<string>('geo_as_hexewkb_w', 'string', [ptrArgType(), 'string'], [ptrArgVal(gs), endian]);
	checkMeosError();
	return _r;
}

export function geo_as_text(gs: Ptr, precision: number): string {
	const _r = call<string>('geo_as_text_w', 'string', [ptrArgType(), 'number'], [ptrArgVal(gs), precision]);
	checkMeosError();
	return _r;
}

export function geo_from_ewkb(wkb: Ptr, wkb_size: number, srid: number): Ptr {
	const _r = callPtr('geo_from_ewkb_w', [ptrArgType(), 'number', 'number'], [ptrArgVal(wkb), wkb_size, srid]);
	checkMeosError();
	return _r;
}

export function geo_from_geojson(geojson: string): Ptr {
	const _r = callPtr('geo_from_geojson_w', ['string'], [geojson]);
	checkMeosError();
	return _r;
}

export function geo_from_text(wkt: string, srid: number): Ptr {
	const _r = callPtr('geo_from_text_w', ['string', 'number'], [wkt, srid]);
	checkMeosError();
	return _r;
}

export function geo_out(gs: Ptr): string {
	const _r = call<string>('geo_out_w', 'string', [ptrArgType()], [ptrArgVal(gs)]);
	checkMeosError();
	return _r;
}

export function geog_from_hexewkb(wkt: string): Ptr {
	const _r = callPtr('geog_from_hexewkb_w', ['string'], [wkt]);
	checkMeosError();
	return _r;
}

export function geog_in(str: string, typmod: number): Ptr {
	const _r = callPtr('geog_in_w', ['string', 'number'], [str, typmod]);
	checkMeosError();
	return _r;
}

export function geom_from_hexewkb(wkt: string): Ptr {
	const _r = callPtr('geom_from_hexewkb_w', ['string'], [wkt]);
	checkMeosError();
	return _r;
}

export function geom_in(str: string, typmod: number): Ptr {
	const _r = callPtr('geom_in_w', ['string', 'number'], [str, typmod]);
	checkMeosError();
	return _r;
}

export function box3d_make(xmin: number, xmax: number, ymin: number, ymax: number, zmin: number, zmax: number, srid: number): Ptr {
	const _r = callPtr('box3d_make_w', ['number', 'number', 'number', 'number', 'number', 'number', 'number'], [xmin, xmax, ymin, ymax, zmin, zmax, srid]);
	checkMeosError();
	return _r;
}

export function box3d_out(box: Ptr, maxdd: number): string {
	const _r = call<string>('box3d_out_w', 'string', [ptrArgType(), 'number'], [ptrArgVal(box), maxdd]);
	checkMeosError();
	return _r;
}

export function gbox_make(hasz: boolean, xmin: number, xmax: number, ymin: number, ymax: number, zmin: number, zmax: number): Ptr {
	const _r = callPtr('gbox_make_w', ['number', 'number', 'number', 'number', 'number', 'number', 'number'], [hasz ? 1 : 0, xmin, xmax, ymin, ymax, zmin, zmax]);
	checkMeosError();
	return _r;
}

export function gbox_out(box: Ptr, maxdd: number): string {
	const _r = call<string>('gbox_out_w', 'string', [ptrArgType(), 'number'], [ptrArgVal(box), maxdd]);
	checkMeosError();
	return _r;
}

export function geo_copy(g: Ptr): Ptr {
	const _r = callPtr('geo_copy_w', [ptrArgType()], [ptrArgVal(g)]);
	checkMeosError();
	return _r;
}

export function geogpoint_make2d(srid: number, x: number, y: number): Ptr {
	const _r = callPtr('geogpoint_make2d_w', ['number', 'number', 'number'], [srid, x, y]);
	checkMeosError();
	return _r;
}

export function geogpoint_make3dz(srid: number, x: number, y: number, z: number): Ptr {
	const _r = callPtr('geogpoint_make3dz_w', ['number', 'number', 'number', 'number'], [srid, x, y, z]);
	checkMeosError();
	return _r;
}

export function geompoint_make2d(srid: number, x: number, y: number): Ptr {
	const _r = callPtr('geompoint_make2d_w', ['number', 'number', 'number'], [srid, x, y]);
	checkMeosError();
	return _r;
}

export function geompoint_make3dz(srid: number, x: number, y: number, z: number): Ptr {
	const _r = callPtr('geompoint_make3dz_w', ['number', 'number', 'number', 'number'], [srid, x, y, z]);
	checkMeosError();
	return _r;
}

export function geom_to_geog(geom: Ptr): Ptr {
	const _r = callPtr('geom_to_geog_w', [ptrArgType()], [ptrArgVal(geom)]);
	checkMeosError();
	return _r;
}

export function geog_to_geom(geog: Ptr): Ptr {
	const _r = callPtr('geog_to_geom_w', [ptrArgType()], [ptrArgVal(geog)]);
	checkMeosError();
	return _r;
}

export function geo_is_empty(g: Ptr): boolean {
	const _r = call<number>('geo_is_empty_w', 'number', [ptrArgType()], [ptrArgVal(g)]) !== 0;
	checkMeosError();
	return _r;
}

export function geo_is_unitary(gs: Ptr): boolean {
	const _r = call<number>('geo_is_unitary_w', 'number', [ptrArgType()], [ptrArgVal(gs)]) !== 0;
	checkMeosError();
	return _r;
}

export function geo_typename(type_: number): string {
	const _r = call<string>('geo_typename_w', 'string', ['number'], [type_]);
	checkMeosError();
	return _r;
}

export function geog_area(g: Ptr, use_spheroid: boolean): number {
	const _r = call<number>('geog_area_w', 'number', [ptrArgType(), 'number'], [ptrArgVal(g), use_spheroid ? 1 : 0]);
	checkMeosError();
	return _r;
}

export function geog_centroid(g: Ptr, use_spheroid: boolean): Ptr {
	const _r = callPtr('geog_centroid_w', [ptrArgType(), 'number'], [ptrArgVal(g), use_spheroid ? 1 : 0]);
	checkMeosError();
	return _r;
}

export function geog_length(g: Ptr, use_spheroid: boolean): number {
	const _r = call<number>('geog_length_w', 'number', [ptrArgType(), 'number'], [ptrArgVal(g), use_spheroid ? 1 : 0]);
	checkMeosError();
	return _r;
}

export function geog_perimeter(g: Ptr, use_spheroid: boolean): number {
	const _r = call<number>('geog_perimeter_w', 'number', [ptrArgType(), 'number'], [ptrArgVal(g), use_spheroid ? 1 : 0]);
	checkMeosError();
	return _r;
}

export function geom_azimuth(gs1: Ptr, gs2: Ptr): number {
	const _r = call<number>('geom_azimuth_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(gs1), ptrArgVal(gs2)]);
	checkMeosError();
	return _r;
}

export function geom_length(gs: Ptr): number {
	const _r = call<number>('geom_length_w', 'number', [ptrArgType()], [ptrArgVal(gs)]);
	checkMeosError();
	return _r;
}

export function geom_perimeter(gs: Ptr): number {
	const _r = call<number>('geom_perimeter_w', 'number', [ptrArgType()], [ptrArgVal(gs)]);
	checkMeosError();
	return _r;
}

export function line_numpoints(gs: Ptr): number {
	const _r = call<number>('line_numpoints_w', 'number', [ptrArgType()], [ptrArgVal(gs)]);
	checkMeosError();
	return _r;
}

export function line_point_n(geom: Ptr, n: number): Ptr {
	const _r = callPtr('line_point_n_w', [ptrArgType(), 'number'], [ptrArgVal(geom), n]);
	checkMeosError();
	return _r;
}

export function geo_reverse(gs: Ptr): Ptr {
	const _r = callPtr('geo_reverse_w', [ptrArgType()], [ptrArgVal(gs)]);
	checkMeosError();
	return _r;
}

export function geo_round(gs: Ptr, maxdd: number): Ptr {
	const _r = callPtr('geo_round_w', [ptrArgType(), 'number'], [ptrArgVal(gs), maxdd]);
	checkMeosError();
	return _r;
}

export function geo_set_srid(gs: Ptr, srid: number): Ptr {
	const _r = callPtr('geo_set_srid_w', [ptrArgType(), 'number'], [ptrArgVal(gs), srid]);
	checkMeosError();
	return _r;
}

export function geo_srid(gs: Ptr): number {
	const _r = call<number>('geo_srid_w', 'number', [ptrArgType()], [ptrArgVal(gs)]);
	checkMeosError();
	return _r;
}

export function geo_transform(geom: Ptr, srid_to: number): Ptr {
	const _r = callPtr('geo_transform_w', [ptrArgType(), 'number'], [ptrArgVal(geom), srid_to]);
	checkMeosError();
	return _r;
}

export function geo_transform_pipeline(gs: Ptr, pipeline: string, srid_to: number, is_forward: boolean): Ptr {
	const _r = callPtr('geo_transform_pipeline_w', [ptrArgType(), 'string', 'number', 'number'], [ptrArgVal(gs), pipeline, srid_to, is_forward ? 1 : 0]);
	checkMeosError();
	return _r;
}

export function geo_collect_garray(gsarr: Ptr, count: number): Ptr {
	const _r = callPtr('geo_collect_garray_w', [ptrArgType(), 'number'], [ptrArgVal(gsarr), count]);
	checkMeosError();
	return _r;
}

export function geo_makeline_garray(gsarr: Ptr, count: number): Ptr {
	const _r = callPtr('geo_makeline_garray_w', [ptrArgType(), 'number'], [ptrArgVal(gsarr), count]);
	checkMeosError();
	return _r;
}

export function geo_num_points(gs: Ptr): number {
	const _r = call<number>('geo_num_points_w', 'number', [ptrArgType()], [ptrArgVal(gs)]);
	checkMeosError();
	return _r;
}

export function geo_num_geos(gs: Ptr): number {
	const _r = call<number>('geo_num_geos_w', 'number', [ptrArgType()], [ptrArgVal(gs)]);
	checkMeosError();
	return _r;
}

export function geo_geo_n(geom: Ptr, n: number): Ptr {
	const _r = callPtr('geo_geo_n_w', [ptrArgType(), 'number'], [ptrArgVal(geom), n]);
	checkMeosError();
	return _r;
}

export function geo_pointarr(gs: Ptr, count: Ptr): Ptr {
	const _r = callPtr('geo_pointarr_w', [ptrArgType(), ptrArgType()], [ptrArgVal(gs), ptrArgVal(count)]);
	checkMeosError();
	return _r;
}

export function geo_points(gs: Ptr): Ptr {
	const _r = callPtr('geo_points_w', [ptrArgType()], [ptrArgVal(gs)]);
	checkMeosError();
	return _r;
}

export function geom_array_union(gsarr: Ptr, count: number): Ptr {
	const _r = callPtr('geom_array_union_w', [ptrArgType(), 'number'], [ptrArgVal(gsarr), count]);
	checkMeosError();
	return _r;
}

export function geom_boundary(gs: Ptr): Ptr {
	const _r = callPtr('geom_boundary_w', [ptrArgType()], [ptrArgVal(gs)]);
	checkMeosError();
	return _r;
}

export function geom_buffer(gs: Ptr, size: number, params: string): Ptr {
	const _r = callPtr('geom_buffer_w', [ptrArgType(), 'number', 'string'], [ptrArgVal(gs), size, params]);
	checkMeosError();
	return _r;
}

export function geom_centroid(gs: Ptr): Ptr {
	const _r = callPtr('geom_centroid_w', [ptrArgType()], [ptrArgVal(gs)]);
	checkMeosError();
	return _r;
}

export function geom_convex_hull(gs: Ptr): Ptr {
	const _r = callPtr('geom_convex_hull_w', [ptrArgType()], [ptrArgVal(gs)]);
	checkMeosError();
	return _r;
}

export function geom_difference2d(gs1: Ptr, gs2: Ptr): Ptr {
	const _r = callPtr('geom_difference2d_w', [ptrArgType(), ptrArgType()], [ptrArgVal(gs1), ptrArgVal(gs2)]);
	checkMeosError();
	return _r;
}

export function geom_intersection2d(gs1: Ptr, gs2: Ptr): Ptr {
	const _r = callPtr('geom_intersection2d_w', [ptrArgType(), ptrArgType()], [ptrArgVal(gs1), ptrArgVal(gs2)]);
	checkMeosError();
	return _r;
}

export function geom_intersection2d_coll(gs1: Ptr, gs2: Ptr): Ptr {
	const _r = callPtr('geom_intersection2d_coll_w', [ptrArgType(), ptrArgType()], [ptrArgVal(gs1), ptrArgVal(gs2)]);
	checkMeosError();
	return _r;
}

export function geom_min_bounding_radius(geom: Ptr, radius: Ptr): Ptr {
	const _r = callPtr('geom_min_bounding_radius_w', [ptrArgType(), ptrArgType()], [ptrArgVal(geom), ptrArgVal(radius)]);
	checkMeosError();
	return _r;
}

export function geom_shortestline2d(gs1: Ptr, s2: Ptr): Ptr {
	const _r = callPtr('geom_shortestline2d_w', [ptrArgType(), ptrArgType()], [ptrArgVal(gs1), ptrArgVal(s2)]);
	checkMeosError();
	return _r;
}

export function geom_shortestline3d(gs1: Ptr, s2: Ptr): Ptr {
	const _r = callPtr('geom_shortestline3d_w', [ptrArgType(), ptrArgType()], [ptrArgVal(gs1), ptrArgVal(s2)]);
	checkMeosError();
	return _r;
}

export function geom_unary_union(gs: Ptr, prec: number): Ptr {
	const _r = callPtr('geom_unary_union_w', [ptrArgType(), 'number'], [ptrArgVal(gs), prec]);
	checkMeosError();
	return _r;
}

export function line_interpolate_point(gs: Ptr, distance_fraction: number, repeat: boolean): Ptr {
	const _r = callPtr('line_interpolate_point_w', [ptrArgType(), 'number', 'number'], [ptrArgVal(gs), distance_fraction, repeat ? 1 : 0]);
	checkMeosError();
	return _r;
}

export function line_locate_point(gs1: Ptr, gs2: Ptr): number {
	const _r = call<number>('line_locate_point_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(gs1), ptrArgVal(gs2)]);
	checkMeosError();
	return _r;
}

export function line_substring(gs: Ptr, from: number, to: number): Ptr {
	const _r = callPtr('line_substring_w', [ptrArgType(), 'number', 'number'], [ptrArgVal(gs), from, to]);
	checkMeosError();
	return _r;
}

export function geog_dwithin(g1: Ptr, g2: Ptr, tolerance: number, use_spheroid: boolean): boolean {
	const _r = call<number>('geog_dwithin_w', 'number', [ptrArgType(), ptrArgType(), 'number', 'number'], [ptrArgVal(g1), ptrArgVal(g2), tolerance, use_spheroid ? 1 : 0]) !== 0;
	checkMeosError();
	return _r;
}

export function geog_intersects(gs1: Ptr, gs2: Ptr, use_spheroid: boolean): boolean {
	const _r = call<number>('geog_intersects_w', 'number', [ptrArgType(), ptrArgType(), 'number'], [ptrArgVal(gs1), ptrArgVal(gs2), use_spheroid ? 1 : 0]) !== 0;
	checkMeosError();
	return _r;
}

export function geom_contains(gs1: Ptr, gs2: Ptr): boolean {
	const _r = call<number>('geom_contains_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(gs1), ptrArgVal(gs2)]) !== 0;
	checkMeosError();
	return _r;
}

export function geom_covers(gs1: Ptr, gs2: Ptr): boolean {
	const _r = call<number>('geom_covers_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(gs1), ptrArgVal(gs2)]) !== 0;
	checkMeosError();
	return _r;
}

export function geom_disjoint2d(gs1: Ptr, gs2: Ptr): boolean {
	const _r = call<number>('geom_disjoint2d_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(gs1), ptrArgVal(gs2)]) !== 0;
	checkMeosError();
	return _r;
}

export function geom_dwithin2d(gs1: Ptr, gs2: Ptr, tolerance: number): boolean {
	const _r = call<number>('geom_dwithin2d_w', 'number', [ptrArgType(), ptrArgType(), 'number'], [ptrArgVal(gs1), ptrArgVal(gs2), tolerance]) !== 0;
	checkMeosError();
	return _r;
}

export function geom_dwithin3d(gs1: Ptr, gs2: Ptr, tolerance: number): boolean {
	const _r = call<number>('geom_dwithin3d_w', 'number', [ptrArgType(), ptrArgType(), 'number'], [ptrArgVal(gs1), ptrArgVal(gs2), tolerance]) !== 0;
	checkMeosError();
	return _r;
}

export function geom_intersects2d(gs1: Ptr, gs2: Ptr): boolean {
	const _r = call<number>('geom_intersects2d_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(gs1), ptrArgVal(gs2)]) !== 0;
	checkMeosError();
	return _r;
}

export function geom_intersects3d(gs1: Ptr, gs2: Ptr): boolean {
	const _r = call<number>('geom_intersects3d_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(gs1), ptrArgVal(gs2)]) !== 0;
	checkMeosError();
	return _r;
}

export function geom_relate_pattern(gs1: Ptr, gs2: Ptr, patt: string): boolean {
	const _r = call<number>('geom_relate_pattern_w', 'number', [ptrArgType(), ptrArgType(), 'string'], [ptrArgVal(gs1), ptrArgVal(gs2), patt]) !== 0;
	checkMeosError();
	return _r;
}

export function geom_touches(gs1: Ptr, gs2: Ptr): boolean {
	const _r = call<number>('geom_touches_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(gs1), ptrArgVal(gs2)]) !== 0;
	checkMeosError();
	return _r;
}

export function geo_stboxes(gs: Ptr, count: Ptr): Ptr {
	const _r = callPtr('geo_stboxes_w', [ptrArgType(), ptrArgType()], [ptrArgVal(gs), ptrArgVal(count)]);
	checkMeosError();
	return _r;
}

export function geo_split_each_n_stboxes(gs: Ptr, elem_count: number, count: Ptr): Ptr {
	const _r = callPtr('geo_split_each_n_stboxes_w', [ptrArgType(), 'number', ptrArgType()], [ptrArgVal(gs), elem_count, ptrArgVal(count)]);
	checkMeosError();
	return _r;
}

export function geo_split_n_stboxes(gs: Ptr, box_count: number, count: Ptr): Ptr {
	const _r = callPtr('geo_split_n_stboxes_w', [ptrArgType(), 'number', ptrArgType()], [ptrArgVal(gs), box_count, ptrArgVal(count)]);
	checkMeosError();
	return _r;
}

export function geog_distance(g1: Ptr, g2: Ptr): number {
	const _r = call<number>('geog_distance_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(g1), ptrArgVal(g2)]);
	checkMeosError();
	return _r;
}

export function geom_distance2d(gs1: Ptr, gs2: Ptr): number {
	const _r = call<number>('geom_distance2d_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(gs1), ptrArgVal(gs2)]);
	checkMeosError();
	return _r;
}

export function geom_distance3d(gs1: Ptr, gs2: Ptr): number {
	const _r = call<number>('geom_distance3d_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(gs1), ptrArgVal(gs2)]);
	checkMeosError();
	return _r;
}

export function geo_equals(gs1: Ptr, gs2: Ptr): number {
	const _r = call<number>('geo_equals_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(gs1), ptrArgVal(gs2)]);
	checkMeosError();
	return _r;
}

export function geo_same(gs1: Ptr, gs2: Ptr): boolean {
	const _r = call<number>('geo_same_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(gs1), ptrArgVal(gs2)]) !== 0;
	checkMeosError();
	return _r;
}

export function geogset_in(str: string): Ptr {
	const _r = callPtr('geogset_in_w', ['string'], [str]);
	checkMeosError();
	return _r;
}

export function geomset_in(str: string): Ptr {
	const _r = callPtr('geomset_in_w', ['string'], [str]);
	checkMeosError();
	return _r;
}

export function spatialset_as_text(set: Ptr, maxdd: number): string {
	const _r = call<string>('spatialset_as_text_w', 'string', [ptrArgType(), 'number'], [ptrArgVal(set), maxdd]);
	checkMeosError();
	return _r;
}

export function spatialset_as_ewkt(set: Ptr, maxdd: number): string {
	const _r = call<string>('spatialset_as_ewkt_w', 'string', [ptrArgType(), 'number'], [ptrArgVal(set), maxdd]);
	checkMeosError();
	return _r;
}

export function geoset_make(values: Ptr, count: number): Ptr {
	const _r = callPtr('geoset_make_w', [ptrArgType(), 'number'], [ptrArgVal(values), count]);
	checkMeosError();
	return _r;
}

export function geo_to_set(gs: Ptr): Ptr {
	const _r = callPtr('geo_to_set_w', [ptrArgType()], [ptrArgVal(gs)]);
	checkMeosError();
	return _r;
}

export function geoset_end_value(s: Ptr): Ptr {
	const _r = callPtr('geoset_end_value_w', [ptrArgType()], [ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function geoset_start_value(s: Ptr): Ptr {
	const _r = callPtr('geoset_start_value_w', [ptrArgType()], [ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function geoset_value_n(s: Ptr, n: number): Ptr {
	const _r = callPtr('geoset_value_n_w', [ptrArgType(), 'number'], [ptrArgVal(s), n]);
	checkMeosError();
	return _r;
}

export function geoset_values(s: Ptr): Ptr {
	const _r = callPtr('geoset_values_w', [ptrArgType()], [ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function contained_geo_set(gs: Ptr, s: Ptr): boolean {
	const _r = call<number>('contained_geo_set_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(gs), ptrArgVal(s)]) !== 0;
	checkMeosError();
	return _r;
}

export function contains_set_geo(s: Ptr, gs: Ptr): boolean {
	const _r = call<number>('contains_set_geo_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(s), ptrArgVal(gs)]) !== 0;
	checkMeosError();
	return _r;
}

export function geo_union_transfn(state: Ptr, gs: Ptr): Ptr {
	const _r = callPtr('geo_union_transfn_w', [ptrArgType(), ptrArgType()], [ptrArgVal(state), ptrArgVal(gs)]);
	checkMeosError();
	return _r;
}

export function intersection_geo_set(gs: Ptr, s: Ptr): Ptr {
	const _r = callPtr('intersection_geo_set_w', [ptrArgType(), ptrArgType()], [ptrArgVal(gs), ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function intersection_set_geo(s: Ptr, gs: Ptr): Ptr {
	const _r = callPtr('intersection_set_geo_w', [ptrArgType(), ptrArgType()], [ptrArgVal(s), ptrArgVal(gs)]);
	checkMeosError();
	return _r;
}

export function minus_geo_set(gs: Ptr, s: Ptr): Ptr {
	const _r = callPtr('minus_geo_set_w', [ptrArgType(), ptrArgType()], [ptrArgVal(gs), ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function minus_set_geo(s: Ptr, gs: Ptr): Ptr {
	const _r = callPtr('minus_set_geo_w', [ptrArgType(), ptrArgType()], [ptrArgVal(s), ptrArgVal(gs)]);
	checkMeosError();
	return _r;
}

export function union_geo_set(gs: Ptr, s: Ptr): Ptr {
	const _r = callPtr('union_geo_set_w', [ptrArgType(), ptrArgType()], [ptrArgVal(gs), ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function union_set_geo(s: Ptr, gs: Ptr): Ptr {
	const _r = callPtr('union_set_geo_w', [ptrArgType(), ptrArgType()], [ptrArgVal(s), ptrArgVal(gs)]);
	checkMeosError();
	return _r;
}

export function spatialset_set_srid(s: Ptr, srid: number): Ptr {
	const _r = callPtr('spatialset_set_srid_w', [ptrArgType(), 'number'], [ptrArgVal(s), srid]);
	checkMeosError();
	return _r;
}

export function spatialset_srid(s: Ptr): number {
	const _r = call<number>('spatialset_srid_w', 'number', [ptrArgType()], [ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function spatialset_transform(s: Ptr, srid: number): Ptr {
	const _r = callPtr('spatialset_transform_w', [ptrArgType(), 'number'], [ptrArgVal(s), srid]);
	checkMeosError();
	return _r;
}

export function spatialset_transform_pipeline(s: Ptr, pipelinestr: string, srid: number, is_forward: boolean): Ptr {
	const _r = callPtr('spatialset_transform_pipeline_w', [ptrArgType(), 'string', 'number', 'number'], [ptrArgVal(s), pipelinestr, srid, is_forward ? 1 : 0]);
	checkMeosError();
	return _r;
}

export function stbox_as_hexwkb(box: Ptr, variant: number, size: Ptr): string {
	const _r = call<string>('stbox_as_hexwkb_w', 'string', [ptrArgType(), 'number', ptrArgType()], [ptrArgVal(box), variant, ptrArgVal(size)]);
	checkMeosError();
	return _r;
}

export function stbox_as_wkb(box: Ptr, variant: number, size_out: Ptr): Ptr {
	const _r = callPtr('stbox_as_wkb_w', [ptrArgType(), 'number', ptrArgType()], [ptrArgVal(box), variant, ptrArgVal(size_out)]);
	checkMeosError();
	return _r;
}

export function stbox_from_hexwkb(hexwkb: string): Ptr {
	const _r = callPtr('stbox_from_hexwkb_w', ['string'], [hexwkb]);
	checkMeosError();
	return _r;
}

export function stbox_from_wkb(wkb: Ptr, size: number): Ptr {
	const _r = callPtr('stbox_from_wkb_w', [ptrArgType(), 'number'], [ptrArgVal(wkb), size]);
	checkMeosError();
	return _r;
}

export function stbox_in(str: string): Ptr {
	const _r = callPtr('stbox_in_w', ['string'], [str]);
	checkMeosError();
	return _r;
}

export function stbox_out(box: Ptr, maxdd: number): string {
	const _r = call<string>('stbox_out_w', 'string', [ptrArgType(), 'number'], [ptrArgVal(box), maxdd]);
	checkMeosError();
	return _r;
}

export function geo_timestamptz_to_stbox(gs: Ptr, t: TimestampTz): Ptr {
	const _r = callPtr('geo_timestamptz_to_stbox_w', [ptrArgType(), 'bigint'], [ptrArgVal(gs), BigInt(t)]);
	checkMeosError();
	return _r;
}

export function geo_tstzspan_to_stbox(gs: Ptr, s: Ptr): Ptr {
	const _r = callPtr('geo_tstzspan_to_stbox_w', [ptrArgType(), ptrArgType()], [ptrArgVal(gs), ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function stbox_copy(box: Ptr): Ptr {
	const _r = callPtr('stbox_copy_w', [ptrArgType()], [ptrArgVal(box)]);
	checkMeosError();
	return _r;
}

export function stbox_make(hasx: boolean, hasz: boolean, geodetic: boolean, srid: number, xmin: number, xmax: number, ymin: number, ymax: number, zmin: number, zmax: number, s: Ptr): Ptr {
	const _r = callPtr('stbox_make_w', ['number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', ptrArgType()], [hasx ? 1 : 0, hasz ? 1 : 0, geodetic ? 1 : 0, srid, xmin, xmax, ymin, ymax, zmin, zmax, ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function geo_to_stbox(gs: Ptr): Ptr {
	const _r = callPtr('geo_to_stbox_w', [ptrArgType()], [ptrArgVal(gs)]);
	checkMeosError();
	return _r;
}

export function spatialset_to_stbox(s: Ptr): Ptr {
	const _r = callPtr('spatialset_to_stbox_w', [ptrArgType()], [ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function stbox_to_box3d(box: Ptr): Ptr {
	const _r = callPtr('stbox_to_box3d_w', [ptrArgType()], [ptrArgVal(box)]);
	checkMeosError();
	return _r;
}

export function stbox_to_gbox(box: Ptr): Ptr {
	const _r = callPtr('stbox_to_gbox_w', [ptrArgType()], [ptrArgVal(box)]);
	checkMeosError();
	return _r;
}

export function stbox_to_geo(box: Ptr): Ptr {
	const _r = callPtr('stbox_to_geo_w', [ptrArgType()], [ptrArgVal(box)]);
	checkMeosError();
	return _r;
}

export function stbox_to_tstzspan(box: Ptr): Ptr {
	const _r = callPtr('stbox_to_tstzspan_w', [ptrArgType()], [ptrArgVal(box)]);
	checkMeosError();
	return _r;
}

export function timestamptz_to_stbox(t: TimestampTz): Ptr {
	const _r = callPtr('timestamptz_to_stbox_w', ['bigint'], [BigInt(t)]);
	checkMeosError();
	return _r;
}

export function tstzset_to_stbox(s: Ptr): Ptr {
	const _r = callPtr('tstzset_to_stbox_w', [ptrArgType()], [ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function tstzspan_to_stbox(s: Ptr): Ptr {
	const _r = callPtr('tstzspan_to_stbox_w', [ptrArgType()], [ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function tstzspanset_to_stbox(ss: Ptr): Ptr {
	const _r = callPtr('tstzspanset_to_stbox_w', [ptrArgType()], [ptrArgVal(ss)]);
	checkMeosError();
	return _r;
}

export function stbox_area(box: Ptr, spheroid: boolean): number {
	const _r = call<number>('stbox_area_w', 'number', [ptrArgType(), 'number'], [ptrArgVal(box), spheroid ? 1 : 0]);
	checkMeosError();
	return _r;
}

export function stbox_hash(box: Ptr): number {
	const _r = call<number>('stbox_hash_w', 'number', [ptrArgType()], [ptrArgVal(box)]);
	checkMeosError();
	return _r;
}

export function stbox_hash_extended(box: Ptr, seed: number): number {
	const _r = Number(call<bigint>('stbox_hash_extended_w', 'bigint', [ptrArgType(), 'bigint'], [ptrArgVal(box), BigInt(seed)]));
	checkMeosError();
	return _r;
}

export function stbox_hast(box: Ptr): boolean {
	const _r = call<number>('stbox_hast_w', 'number', [ptrArgType()], [ptrArgVal(box)]) !== 0;
	checkMeosError();
	return _r;
}

export function stbox_hasx(box: Ptr): boolean {
	const _r = call<number>('stbox_hasx_w', 'number', [ptrArgType()], [ptrArgVal(box)]) !== 0;
	checkMeosError();
	return _r;
}

export function stbox_hasz(box: Ptr): boolean {
	const _r = call<number>('stbox_hasz_w', 'number', [ptrArgType()], [ptrArgVal(box)]) !== 0;
	checkMeosError();
	return _r;
}

export function stbox_isgeodetic(box: Ptr): boolean {
	const _r = call<number>('stbox_isgeodetic_w', 'number', [ptrArgType()], [ptrArgVal(box)]) !== 0;
	checkMeosError();
	return _r;
}

export function stbox_perimeter(box: Ptr, spheroid: boolean): number {
	const _r = call<number>('stbox_perimeter_w', 'number', [ptrArgType(), 'number'], [ptrArgVal(box), spheroid ? 1 : 0]);
	checkMeosError();
	return _r;
}

export function stbox_tmax(box: Ptr): TimestampTz {
	const _r = call<TimestampTz>('stbox_tmax_w', 'number', [ptrArgType()], [ptrArgVal(box)]);
	checkMeosError();
	return _r;
}

export function stbox_tmax_inc(box: Ptr): boolean {
	const _r = call<number>('stbox_tmax_inc_w', 'number', [ptrArgType()], [ptrArgVal(box)]) !== 0;
	checkMeosError();
	return _r;
}

export function stbox_tmin(box: Ptr): TimestampTz {
	const _r = call<TimestampTz>('stbox_tmin_w', 'number', [ptrArgType()], [ptrArgVal(box)]);
	checkMeosError();
	return _r;
}

export function stbox_tmin_inc(box: Ptr): boolean {
	const _r = call<number>('stbox_tmin_inc_w', 'number', [ptrArgType()], [ptrArgVal(box)]) !== 0;
	checkMeosError();
	return _r;
}

export function stbox_volume(box: Ptr): number {
	const _r = call<number>('stbox_volume_w', 'number', [ptrArgType()], [ptrArgVal(box)]);
	checkMeosError();
	return _r;
}

export function stbox_xmax(box: Ptr): number {
	const _r = call<number>('stbox_xmax_w', 'number', [ptrArgType()], [ptrArgVal(box)]);
	checkMeosError();
	return _r;
}

export function stbox_xmin(box: Ptr): number {
	const _r = call<number>('stbox_xmin_w', 'number', [ptrArgType()], [ptrArgVal(box)]);
	checkMeosError();
	return _r;
}

export function stbox_ymax(box: Ptr): number {
	const _r = call<number>('stbox_ymax_w', 'number', [ptrArgType()], [ptrArgVal(box)]);
	checkMeosError();
	return _r;
}

export function stbox_ymin(box: Ptr): number {
	const _r = call<number>('stbox_ymin_w', 'number', [ptrArgType()], [ptrArgVal(box)]);
	checkMeosError();
	return _r;
}

export function stbox_zmax(box: Ptr): number {
	const _r = call<number>('stbox_zmax_w', 'number', [ptrArgType()], [ptrArgVal(box)]);
	checkMeosError();
	return _r;
}

export function stbox_zmin(box: Ptr): number {
	const _r = call<number>('stbox_zmin_w', 'number', [ptrArgType()], [ptrArgVal(box)]);
	checkMeosError();
	return _r;
}

export function stbox_expand_space(box: Ptr, d: number): Ptr {
	const _r = callPtr('stbox_expand_space_w', [ptrArgType(), 'number'], [ptrArgVal(box), d]);
	checkMeosError();
	return _r;
}

export function stbox_expand_time(box: Ptr, interv: Ptr): Ptr {
	const _r = callPtr('stbox_expand_time_w', [ptrArgType(), ptrArgType()], [ptrArgVal(box), ptrArgVal(interv)]);
	checkMeosError();
	return _r;
}

export function stbox_get_space(box: Ptr): Ptr {
	const _r = callPtr('stbox_get_space_w', [ptrArgType()], [ptrArgVal(box)]);
	checkMeosError();
	return _r;
}

export function stbox_quad_split(box: Ptr, count: Ptr): Ptr {
	const _r = callPtr('stbox_quad_split_w', [ptrArgType(), ptrArgType()], [ptrArgVal(box), ptrArgVal(count)]);
	checkMeosError();
	return _r;
}

export function stbox_round(box: Ptr, maxdd: number): Ptr {
	const _r = callPtr('stbox_round_w', [ptrArgType(), 'number'], [ptrArgVal(box), maxdd]);
	checkMeosError();
	return _r;
}

export function stbox_shift_scale_time(box: Ptr, shift: Ptr, duration: Ptr): Ptr {
	const _r = callPtr('stbox_shift_scale_time_w', [ptrArgType(), ptrArgType(), ptrArgType()], [ptrArgVal(box), ptrArgVal(shift), ptrArgVal(duration)]);
	checkMeosError();
	return _r;
}

export function stboxarr_round(boxarr: Ptr, count: number, maxdd: number): Ptr {
	const _r = callPtr('stboxarr_round_w', [ptrArgType(), 'number', 'number'], [ptrArgVal(boxarr), count, maxdd]);
	checkMeosError();
	return _r;
}

export function stbox_set_srid(box: Ptr, srid: number): Ptr {
	const _r = callPtr('stbox_set_srid_w', [ptrArgType(), 'number'], [ptrArgVal(box), srid]);
	checkMeosError();
	return _r;
}

export function stbox_srid(box: Ptr): number {
	const _r = call<number>('stbox_srid_w', 'number', [ptrArgType()], [ptrArgVal(box)]);
	checkMeosError();
	return _r;
}

export function stbox_transform(box: Ptr, srid: number): Ptr {
	const _r = callPtr('stbox_transform_w', [ptrArgType(), 'number'], [ptrArgVal(box), srid]);
	checkMeosError();
	return _r;
}

export function stbox_transform_pipeline(box: Ptr, pipelinestr: string, srid: number, is_forward: boolean): Ptr {
	const _r = callPtr('stbox_transform_pipeline_w', [ptrArgType(), 'string', 'number', 'number'], [ptrArgVal(box), pipelinestr, srid, is_forward ? 1 : 0]);
	checkMeosError();
	return _r;
}

export function adjacent_stbox_stbox(box1: Ptr, box2: Ptr): boolean {
	const _r = call<number>('adjacent_stbox_stbox_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(box1), ptrArgVal(box2)]) !== 0;
	checkMeosError();
	return _r;
}

export function contained_stbox_stbox(box1: Ptr, box2: Ptr): boolean {
	const _r = call<number>('contained_stbox_stbox_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(box1), ptrArgVal(box2)]) !== 0;
	checkMeosError();
	return _r;
}

export function contains_stbox_stbox(box1: Ptr, box2: Ptr): boolean {
	const _r = call<number>('contains_stbox_stbox_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(box1), ptrArgVal(box2)]) !== 0;
	checkMeosError();
	return _r;
}

export function overlaps_stbox_stbox(box1: Ptr, box2: Ptr): boolean {
	const _r = call<number>('overlaps_stbox_stbox_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(box1), ptrArgVal(box2)]) !== 0;
	checkMeosError();
	return _r;
}

export function same_stbox_stbox(box1: Ptr, box2: Ptr): boolean {
	const _r = call<number>('same_stbox_stbox_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(box1), ptrArgVal(box2)]) !== 0;
	checkMeosError();
	return _r;
}

export function above_stbox_stbox(box1: Ptr, box2: Ptr): boolean {
	const _r = call<number>('above_stbox_stbox_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(box1), ptrArgVal(box2)]) !== 0;
	checkMeosError();
	return _r;
}

export function after_stbox_stbox(box1: Ptr, box2: Ptr): boolean {
	const _r = call<number>('after_stbox_stbox_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(box1), ptrArgVal(box2)]) !== 0;
	checkMeosError();
	return _r;
}

export function back_stbox_stbox(box1: Ptr, box2: Ptr): boolean {
	const _r = call<number>('back_stbox_stbox_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(box1), ptrArgVal(box2)]) !== 0;
	checkMeosError();
	return _r;
}

export function before_stbox_stbox(box1: Ptr, box2: Ptr): boolean {
	const _r = call<number>('before_stbox_stbox_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(box1), ptrArgVal(box2)]) !== 0;
	checkMeosError();
	return _r;
}

export function below_stbox_stbox(box1: Ptr, box2: Ptr): boolean {
	const _r = call<number>('below_stbox_stbox_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(box1), ptrArgVal(box2)]) !== 0;
	checkMeosError();
	return _r;
}

export function front_stbox_stbox(box1: Ptr, box2: Ptr): boolean {
	const _r = call<number>('front_stbox_stbox_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(box1), ptrArgVal(box2)]) !== 0;
	checkMeosError();
	return _r;
}

export function left_stbox_stbox(box1: Ptr, box2: Ptr): boolean {
	const _r = call<number>('left_stbox_stbox_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(box1), ptrArgVal(box2)]) !== 0;
	checkMeosError();
	return _r;
}

export function overabove_stbox_stbox(box1: Ptr, box2: Ptr): boolean {
	const _r = call<number>('overabove_stbox_stbox_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(box1), ptrArgVal(box2)]) !== 0;
	checkMeosError();
	return _r;
}

export function overafter_stbox_stbox(box1: Ptr, box2: Ptr): boolean {
	const _r = call<number>('overafter_stbox_stbox_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(box1), ptrArgVal(box2)]) !== 0;
	checkMeosError();
	return _r;
}

export function overback_stbox_stbox(box1: Ptr, box2: Ptr): boolean {
	const _r = call<number>('overback_stbox_stbox_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(box1), ptrArgVal(box2)]) !== 0;
	checkMeosError();
	return _r;
}

export function overbefore_stbox_stbox(box1: Ptr, box2: Ptr): boolean {
	const _r = call<number>('overbefore_stbox_stbox_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(box1), ptrArgVal(box2)]) !== 0;
	checkMeosError();
	return _r;
}

export function overbelow_stbox_stbox(box1: Ptr, box2: Ptr): boolean {
	const _r = call<number>('overbelow_stbox_stbox_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(box1), ptrArgVal(box2)]) !== 0;
	checkMeosError();
	return _r;
}

export function overfront_stbox_stbox(box1: Ptr, box2: Ptr): boolean {
	const _r = call<number>('overfront_stbox_stbox_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(box1), ptrArgVal(box2)]) !== 0;
	checkMeosError();
	return _r;
}

export function overleft_stbox_stbox(box1: Ptr, box2: Ptr): boolean {
	const _r = call<number>('overleft_stbox_stbox_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(box1), ptrArgVal(box2)]) !== 0;
	checkMeosError();
	return _r;
}

export function overright_stbox_stbox(box1: Ptr, box2: Ptr): boolean {
	const _r = call<number>('overright_stbox_stbox_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(box1), ptrArgVal(box2)]) !== 0;
	checkMeosError();
	return _r;
}

export function right_stbox_stbox(box1: Ptr, box2: Ptr): boolean {
	const _r = call<number>('right_stbox_stbox_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(box1), ptrArgVal(box2)]) !== 0;
	checkMeosError();
	return _r;
}

export function union_stbox_stbox(box1: Ptr, box2: Ptr, strict: boolean): Ptr {
	const _r = callPtr('union_stbox_stbox_w', [ptrArgType(), ptrArgType(), 'number'], [ptrArgVal(box1), ptrArgVal(box2), strict ? 1 : 0]);
	checkMeosError();
	return _r;
}

export function intersection_stbox_stbox(box1: Ptr, box2: Ptr): Ptr {
	const _r = callPtr('intersection_stbox_stbox_w', [ptrArgType(), ptrArgType()], [ptrArgVal(box1), ptrArgVal(box2)]);
	checkMeosError();
	return _r;
}

export function stbox_cmp(box1: Ptr, box2: Ptr): number {
	const _r = call<number>('stbox_cmp_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(box1), ptrArgVal(box2)]);
	checkMeosError();
	return _r;
}

export function stbox_eq(box1: Ptr, box2: Ptr): boolean {
	const _r = call<number>('stbox_eq_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(box1), ptrArgVal(box2)]) !== 0;
	checkMeosError();
	return _r;
}

export function stbox_ge(box1: Ptr, box2: Ptr): boolean {
	const _r = call<number>('stbox_ge_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(box1), ptrArgVal(box2)]) !== 0;
	checkMeosError();
	return _r;
}

export function stbox_gt(box1: Ptr, box2: Ptr): boolean {
	const _r = call<number>('stbox_gt_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(box1), ptrArgVal(box2)]) !== 0;
	checkMeosError();
	return _r;
}

export function stbox_le(box1: Ptr, box2: Ptr): boolean {
	const _r = call<number>('stbox_le_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(box1), ptrArgVal(box2)]) !== 0;
	checkMeosError();
	return _r;
}

export function stbox_lt(box1: Ptr, box2: Ptr): boolean {
	const _r = call<number>('stbox_lt_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(box1), ptrArgVal(box2)]) !== 0;
	checkMeosError();
	return _r;
}

export function stbox_ne(box1: Ptr, box2: Ptr): boolean {
	const _r = call<number>('stbox_ne_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(box1), ptrArgVal(box2)]) !== 0;
	checkMeosError();
	return _r;
}

export function tgeogpoint_from_mfjson(str: string): Ptr {
	const _r = callPtr('tgeogpoint_from_mfjson_w', ['string'], [str]);
	checkMeosError();
	return _r;
}

export function tgeogpoint_in(str: string): Ptr {
	const _r = callPtr('tgeogpoint_in_w', ['string'], [str]);
	checkMeosError();
	return _r;
}

export function tgeography_from_mfjson(mfjson: string): Ptr {
	const _r = callPtr('tgeography_from_mfjson_w', ['string'], [mfjson]);
	checkMeosError();
	return _r;
}

export function tgeography_in(str: string): Ptr {
	const _r = callPtr('tgeography_in_w', ['string'], [str]);
	checkMeosError();
	return _r;
}

export function tgeometry_from_mfjson(str: string): Ptr {
	const _r = callPtr('tgeometry_from_mfjson_w', ['string'], [str]);
	checkMeosError();
	return _r;
}

export function tgeometry_in(str: string): Ptr {
	const _r = callPtr('tgeometry_in_w', ['string'], [str]);
	checkMeosError();
	return _r;
}

export function tgeompoint_from_mfjson(str: string): Ptr {
	const _r = callPtr('tgeompoint_from_mfjson_w', ['string'], [str]);
	checkMeosError();
	return _r;
}

export function tgeompoint_in(str: string): Ptr {
	const _r = callPtr('tgeompoint_in_w', ['string'], [str]);
	checkMeosError();
	return _r;
}

export function tspatial_as_ewkt(temp: Ptr, maxdd: number): string {
	const _r = call<string>('tspatial_as_ewkt_w', 'string', [ptrArgType(), 'number'], [ptrArgVal(temp), maxdd]);
	checkMeosError();
	return _r;
}

export function tspatial_as_text(temp: Ptr, maxdd: number): string {
	const _r = call<string>('tspatial_as_text_w', 'string', [ptrArgType(), 'number'], [ptrArgVal(temp), maxdd]);
	checkMeosError();
	return _r;
}

export function tspatial_out(temp: Ptr, maxdd: number): string {
	const _r = call<string>('tspatial_out_w', 'string', [ptrArgType(), 'number'], [ptrArgVal(temp), maxdd]);
	checkMeosError();
	return _r;
}

export function tgeo_from_base_temp(gs: Ptr, temp: Ptr): Ptr {
	const _r = callPtr('tgeo_from_base_temp_w', [ptrArgType(), ptrArgType()], [ptrArgVal(gs), ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function tgeoinst_make(gs: Ptr, t: TimestampTz): Ptr {
	const _r = callPtr('tgeoinst_make_w', [ptrArgType(), 'bigint'], [ptrArgVal(gs), BigInt(t)]);
	checkMeosError();
	return _r;
}

export function tgeoseq_from_base_tstzset(gs: Ptr, s: Ptr): Ptr {
	const _r = callPtr('tgeoseq_from_base_tstzset_w', [ptrArgType(), ptrArgType()], [ptrArgVal(gs), ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function tgeoseq_from_base_tstzspan(gs: Ptr, s: Ptr, interp: number): Ptr {
	const _r = callPtr('tgeoseq_from_base_tstzspan_w', [ptrArgType(), ptrArgType(), 'number'], [ptrArgVal(gs), ptrArgVal(s), interp]);
	checkMeosError();
	return _r;
}

export function tgeoseqset_from_base_tstzspanset(gs: Ptr, ss: Ptr, interp: number): Ptr {
	const _r = callPtr('tgeoseqset_from_base_tstzspanset_w', [ptrArgType(), ptrArgType(), 'number'], [ptrArgVal(gs), ptrArgVal(ss), interp]);
	checkMeosError();
	return _r;
}

export function tpoint_from_base_temp(gs: Ptr, temp: Ptr): Ptr {
	const _r = callPtr('tpoint_from_base_temp_w', [ptrArgType(), ptrArgType()], [ptrArgVal(gs), ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function tpointinst_make(gs: Ptr, t: TimestampTz): Ptr {
	const _r = callPtr('tpointinst_make_w', [ptrArgType(), 'bigint'], [ptrArgVal(gs), BigInt(t)]);
	checkMeosError();
	return _r;
}

export function tpointseq_from_base_tstzset(gs: Ptr, s: Ptr): Ptr {
	const _r = callPtr('tpointseq_from_base_tstzset_w', [ptrArgType(), ptrArgType()], [ptrArgVal(gs), ptrArgVal(s)]);
	checkMeosError();
	return _r;
}

export function tpointseq_from_base_tstzspan(gs: Ptr, s: Ptr, interp: number): Ptr {
	const _r = callPtr('tpointseq_from_base_tstzspan_w', [ptrArgType(), ptrArgType(), 'number'], [ptrArgVal(gs), ptrArgVal(s), interp]);
	checkMeosError();
	return _r;
}

export function tpointseq_make_coords(xcoords: Ptr, ycoords: Ptr, zcoords: Ptr, times: Ptr, count: number, srid: number, geodetic: boolean, lower_inc: boolean, upper_inc: boolean, interp: number, normalize: boolean): Ptr {
	const _r = callPtr('tpointseq_make_coords_w', [ptrArgType(), ptrArgType(), ptrArgType(), ptrArgType(), 'number', 'number', 'number', 'number', 'number', 'number', 'number'], [ptrArgVal(xcoords), ptrArgVal(ycoords), ptrArgVal(zcoords), ptrArgVal(times), count, srid, geodetic ? 1 : 0, lower_inc ? 1 : 0, upper_inc ? 1 : 0, interp, normalize ? 1 : 0]);
	checkMeosError();
	return _r;
}

export function tpointseqset_from_base_tstzspanset(gs: Ptr, ss: Ptr, interp: number): Ptr {
	const _r = callPtr('tpointseqset_from_base_tstzspanset_w', [ptrArgType(), ptrArgType(), 'number'], [ptrArgVal(gs), ptrArgVal(ss), interp]);
	checkMeosError();
	return _r;
}

export function box3d_to_stbox(box: Ptr): Ptr {
	const _r = callPtr('box3d_to_stbox_w', [ptrArgType()], [ptrArgVal(box)]);
	checkMeosError();
	return _r;
}

export function gbox_to_stbox(box: Ptr): Ptr {
	const _r = callPtr('gbox_to_stbox_w', [ptrArgType()], [ptrArgVal(box)]);
	checkMeosError();
	return _r;
}

export function geomeas_to_tpoint(gs: Ptr): Ptr {
	const _r = callPtr('geomeas_to_tpoint_w', [ptrArgType()], [ptrArgVal(gs)]);
	checkMeosError();
	return _r;
}

export function tgeogpoint_to_tgeography(temp: Ptr): Ptr {
	const _r = callPtr('tgeogpoint_to_tgeography_w', [ptrArgType()], [ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function tgeography_to_tgeogpoint(temp: Ptr): Ptr {
	const _r = callPtr('tgeography_to_tgeogpoint_w', [ptrArgType()], [ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function tgeography_to_tgeometry(temp: Ptr): Ptr {
	const _r = callPtr('tgeography_to_tgeometry_w', [ptrArgType()], [ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function tgeometry_to_tgeography(temp: Ptr): Ptr {
	const _r = callPtr('tgeometry_to_tgeography_w', [ptrArgType()], [ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function tgeometry_to_tgeompoint(temp: Ptr): Ptr {
	const _r = callPtr('tgeometry_to_tgeompoint_w', [ptrArgType()], [ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function tgeompoint_to_tgeometry(temp: Ptr): Ptr {
	const _r = callPtr('tgeompoint_to_tgeometry_w', [ptrArgType()], [ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function tpoint_as_mvtgeom(temp: Ptr, bounds: Ptr, extent: number, buffer: number, clip_geom: boolean, gsarr: Ptr, timesarr: Ptr, count: Ptr): boolean {
	const _r = call<number>('tpoint_as_mvtgeom_w', 'number', [ptrArgType(), ptrArgType(), 'number', 'number', 'number', ptrArgType(), ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(bounds), extent, buffer, clip_geom ? 1 : 0, ptrArgVal(gsarr), ptrArgVal(timesarr), ptrArgVal(count)]) !== 0;
	checkMeosError();
	return _r;
}

export function tpoint_tfloat_to_geomeas(tpoint: Ptr, measure: Ptr, segmentize: boolean): Ptr {
	const _r = callPtr('tpoint_tfloat_to_geomeas_w', [ptrArgType(), ptrArgType(), 'number'], [ptrArgVal(tpoint), ptrArgVal(measure), segmentize ? 1 : 0]);
	checkMeosError();
	return _r;
}

export function tspatial_to_stbox(temp: Ptr): Ptr {
	const _r = callPtr('tspatial_to_stbox_w', [ptrArgType()], [ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function bearing_point_point(gs1: Ptr, gs2: Ptr): number {
	const _r = call<number>('bearing_point_point_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(gs1), ptrArgVal(gs2)]);
	checkMeosError();
	return _r;
}

export function bearing_tpoint_point(temp: Ptr, gs: Ptr, invert: boolean): Ptr {
	const _r = callPtr('bearing_tpoint_point_w', [ptrArgType(), ptrArgType(), 'number'], [ptrArgVal(temp), ptrArgVal(gs), invert ? 1 : 0]);
	checkMeosError();
	return _r;
}

export function bearing_tpoint_tpoint(temp1: Ptr, temp2: Ptr): Ptr {
	const _r = callPtr('bearing_tpoint_tpoint_w', [ptrArgType(), ptrArgType()], [ptrArgVal(temp1), ptrArgVal(temp2)]);
	checkMeosError();
	return _r;
}

export function tgeo_centroid(temp: Ptr): Ptr {
	const _r = callPtr('tgeo_centroid_w', [ptrArgType()], [ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function tgeo_convex_hull(temp: Ptr): Ptr {
	const _r = callPtr('tgeo_convex_hull_w', [ptrArgType()], [ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function tgeo_end_value(temp: Ptr): Ptr {
	const _r = callPtr('tgeo_end_value_w', [ptrArgType()], [ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function tgeo_start_value(temp: Ptr): Ptr {
	const _r = callPtr('tgeo_start_value_w', [ptrArgType()], [ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function tgeo_traversed_area(temp: Ptr, unary_union: boolean): Ptr {
	const _r = callPtr('tgeo_traversed_area_w', [ptrArgType(), 'number'], [ptrArgVal(temp), unary_union ? 1 : 0]);
	checkMeosError();
	return _r;
}

export function tgeo_value_at_timestamptz(temp: Ptr, t: TimestampTz, strict: boolean, value: Ptr): boolean {
	const _r = call<number>('tgeo_value_at_timestamptz_w', 'number', [ptrArgType(), 'bigint', 'number', ptrArgType()], [ptrArgVal(temp), BigInt(t), strict ? 1 : 0, ptrArgVal(value)]) !== 0;
	checkMeosError();
	return _r;
}

export function tgeo_value_n(temp: Ptr, n: number): Ptr {
	const _r = callPtr('tgeo_value_n_w', [ptrArgType(), 'number'], [ptrArgVal(temp), n]);
	checkMeosError();
	return _r;
}

export function tgeo_values(temp: Ptr, count: Ptr): Ptr {
	const _r = callPtr('tgeo_values_w', [ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(count)]);
	checkMeosError();
	return _r;
}

export function tpoint_angular_difference(temp: Ptr): Ptr {
	const _r = callPtr('tpoint_angular_difference_w', [ptrArgType()], [ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function tpoint_azimuth(temp: Ptr): Ptr {
	const _r = callPtr('tpoint_azimuth_w', [ptrArgType()], [ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function tpoint_cumulative_length(temp: Ptr): Ptr {
	const _r = callPtr('tpoint_cumulative_length_w', [ptrArgType()], [ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function tpoint_direction(temp: Ptr): number {
	const _r = call<number>('tpoint_direction_w', 'number', [ptrArgType()], [ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function tpoint_get_x(temp: Ptr): Ptr {
	const _r = callPtr('tpoint_get_x_w', [ptrArgType()], [ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function tpoint_get_y(temp: Ptr): Ptr {
	const _r = callPtr('tpoint_get_y_w', [ptrArgType()], [ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function tpoint_get_z(temp: Ptr): Ptr {
	const _r = callPtr('tpoint_get_z_w', [ptrArgType()], [ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function tpoint_is_simple(temp: Ptr): boolean {
	const _r = call<number>('tpoint_is_simple_w', 'number', [ptrArgType()], [ptrArgVal(temp)]) !== 0;
	checkMeosError();
	return _r;
}

export function tpoint_length(temp: Ptr): number {
	const _r = call<number>('tpoint_length_w', 'number', [ptrArgType()], [ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function tpoint_speed(temp: Ptr): Ptr {
	const _r = callPtr('tpoint_speed_w', [ptrArgType()], [ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function tpoint_trajectory(temp: Ptr, unary_union: boolean): Ptr {
	const _r = callPtr('tpoint_trajectory_w', [ptrArgType(), 'number'], [ptrArgVal(temp), unary_union ? 1 : 0]);
	checkMeosError();
	return _r;
}

export function tpoint_twcentroid(temp: Ptr): Ptr {
	const _r = callPtr('tpoint_twcentroid_w', [ptrArgType()], [ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function tgeo_affine(temp: Ptr, a: Ptr): Ptr {
	const _r = callPtr('tgeo_affine_w', [ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(a)]);
	checkMeosError();
	return _r;
}

export function tgeo_scale(temp: Ptr, scale: Ptr, sorigin: Ptr): Ptr {
	const _r = callPtr('tgeo_scale_w', [ptrArgType(), ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(scale), ptrArgVal(sorigin)]);
	checkMeosError();
	return _r;
}

export function tpoint_make_simple(temp: Ptr, count: Ptr): Ptr {
	const _r = callPtr('tpoint_make_simple_w', [ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(count)]);
	checkMeosError();
	return _r;
}

export function tspatial_srid(temp: Ptr): number {
	const _r = call<number>('tspatial_srid_w', 'number', [ptrArgType()], [ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function tspatial_set_srid(temp: Ptr, srid: number): Ptr {
	const _r = callPtr('tspatial_set_srid_w', [ptrArgType(), 'number'], [ptrArgVal(temp), srid]);
	checkMeosError();
	return _r;
}

export function tspatial_transform(temp: Ptr, srid: number): Ptr {
	const _r = callPtr('tspatial_transform_w', [ptrArgType(), 'number'], [ptrArgVal(temp), srid]);
	checkMeosError();
	return _r;
}

export function tspatial_transform_pipeline(temp: Ptr, pipelinestr: string, srid: number, is_forward: boolean): Ptr {
	const _r = callPtr('tspatial_transform_pipeline_w', [ptrArgType(), 'string', 'number', 'number'], [ptrArgVal(temp), pipelinestr, srid, is_forward ? 1 : 0]);
	checkMeosError();
	return _r;
}

export function tgeo_at_geom(temp: Ptr, gs: Ptr): Ptr {
	const _r = callPtr('tgeo_at_geom_w', [ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(gs)]);
	checkMeosError();
	return _r;
}

export function tgeo_at_stbox(temp: Ptr, box: Ptr, border_inc: boolean): Ptr {
	const _r = callPtr('tgeo_at_stbox_w', [ptrArgType(), ptrArgType(), 'number'], [ptrArgVal(temp), ptrArgVal(box), border_inc ? 1 : 0]);
	checkMeosError();
	return _r;
}

export function tgeo_at_value(temp: Ptr, gs: Ptr): Ptr {
	const _r = callPtr('tgeo_at_value_w', [ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(gs)]);
	checkMeosError();
	return _r;
}

export function tgeo_minus_geom(temp: Ptr, gs: Ptr): Ptr {
	const _r = callPtr('tgeo_minus_geom_w', [ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(gs)]);
	checkMeosError();
	return _r;
}

export function tgeo_minus_stbox(temp: Ptr, box: Ptr, border_inc: boolean): Ptr {
	const _r = callPtr('tgeo_minus_stbox_w', [ptrArgType(), ptrArgType(), 'number'], [ptrArgVal(temp), ptrArgVal(box), border_inc ? 1 : 0]);
	checkMeosError();
	return _r;
}

export function tgeo_minus_value(temp: Ptr, gs: Ptr): Ptr {
	const _r = callPtr('tgeo_minus_value_w', [ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(gs)]);
	checkMeosError();
	return _r;
}

export function tpoint_at_geom(temp: Ptr, gs: Ptr): Ptr {
	const _r = callPtr('tpoint_at_geom_w', [ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(gs)]);
	checkMeosError();
	return _r;
}

export function tpoint_at_value(temp: Ptr, gs: Ptr): Ptr {
	const _r = callPtr('tpoint_at_value_w', [ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(gs)]);
	checkMeosError();
	return _r;
}

export function tpoint_minus_geom(temp: Ptr, gs: Ptr): Ptr {
	const _r = callPtr('tpoint_minus_geom_w', [ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(gs)]);
	checkMeosError();
	return _r;
}

export function tpoint_minus_value(temp: Ptr, gs: Ptr): Ptr {
	const _r = callPtr('tpoint_minus_value_w', [ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(gs)]);
	checkMeosError();
	return _r;
}

export function always_eq_geo_tgeo(gs: Ptr, temp: Ptr): number {
	const _r = call<number>('always_eq_geo_tgeo_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(gs), ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function always_eq_tgeo_geo(temp: Ptr, gs: Ptr): number {
	const _r = call<number>('always_eq_tgeo_geo_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(gs)]);
	checkMeosError();
	return _r;
}

export function always_eq_tgeo_tgeo(temp1: Ptr, temp2: Ptr): number {
	const _r = call<number>('always_eq_tgeo_tgeo_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp1), ptrArgVal(temp2)]);
	checkMeosError();
	return _r;
}

export function always_ne_geo_tgeo(gs: Ptr, temp: Ptr): number {
	const _r = call<number>('always_ne_geo_tgeo_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(gs), ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function always_ne_tgeo_geo(temp: Ptr, gs: Ptr): number {
	const _r = call<number>('always_ne_tgeo_geo_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(gs)]);
	checkMeosError();
	return _r;
}

export function always_ne_tgeo_tgeo(temp1: Ptr, temp2: Ptr): number {
	const _r = call<number>('always_ne_tgeo_tgeo_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp1), ptrArgVal(temp2)]);
	checkMeosError();
	return _r;
}

export function ever_eq_geo_tgeo(gs: Ptr, temp: Ptr): number {
	const _r = call<number>('ever_eq_geo_tgeo_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(gs), ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function ever_eq_tgeo_geo(temp: Ptr, gs: Ptr): number {
	const _r = call<number>('ever_eq_tgeo_geo_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(gs)]);
	checkMeosError();
	return _r;
}

export function ever_eq_tgeo_tgeo(temp1: Ptr, temp2: Ptr): number {
	const _r = call<number>('ever_eq_tgeo_tgeo_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp1), ptrArgVal(temp2)]);
	checkMeosError();
	return _r;
}

export function ever_ne_geo_tgeo(gs: Ptr, temp: Ptr): number {
	const _r = call<number>('ever_ne_geo_tgeo_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(gs), ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function ever_ne_tgeo_geo(temp: Ptr, gs: Ptr): number {
	const _r = call<number>('ever_ne_tgeo_geo_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(gs)]);
	checkMeosError();
	return _r;
}

export function ever_ne_tgeo_tgeo(temp1: Ptr, temp2: Ptr): number {
	const _r = call<number>('ever_ne_tgeo_tgeo_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp1), ptrArgVal(temp2)]);
	checkMeosError();
	return _r;
}

export function teq_geo_tgeo(gs: Ptr, temp: Ptr): Ptr {
	const _r = callPtr('teq_geo_tgeo_w', [ptrArgType(), ptrArgType()], [ptrArgVal(gs), ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function teq_tgeo_geo(temp: Ptr, gs: Ptr): Ptr {
	const _r = callPtr('teq_tgeo_geo_w', [ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(gs)]);
	checkMeosError();
	return _r;
}

export function tne_geo_tgeo(gs: Ptr, temp: Ptr): Ptr {
	const _r = callPtr('tne_geo_tgeo_w', [ptrArgType(), ptrArgType()], [ptrArgVal(gs), ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function tne_tgeo_geo(temp: Ptr, gs: Ptr): Ptr {
	const _r = callPtr('tne_tgeo_geo_w', [ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(gs)]);
	checkMeosError();
	return _r;
}

export function tgeo_stboxes(temp: Ptr, count: Ptr): Ptr {
	const _r = callPtr('tgeo_stboxes_w', [ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(count)]);
	checkMeosError();
	return _r;
}

export function tgeo_space_boxes(temp: Ptr, xsize: number, ysize: number, zsize: number, sorigin: Ptr, bitmatrix: boolean, border_inc: boolean, count: Ptr): Ptr {
	const _r = callPtr('tgeo_space_boxes_w', [ptrArgType(), 'number', 'number', 'number', ptrArgType(), 'number', 'number', ptrArgType()], [ptrArgVal(temp), xsize, ysize, zsize, ptrArgVal(sorigin), bitmatrix ? 1 : 0, border_inc ? 1 : 0, ptrArgVal(count)]);
	checkMeosError();
	return _r;
}

export function tgeo_space_time_boxes(temp: Ptr, xsize: number, ysize: number, zsize: number, duration: Ptr, sorigin: Ptr, torigin: TimestampTz, bitmatrix: boolean, border_inc: boolean, count: Ptr): Ptr {
	const _r = callPtr('tgeo_space_time_boxes_w', [ptrArgType(), 'number', 'number', 'number', ptrArgType(), ptrArgType(), 'bigint', 'number', 'number', ptrArgType()], [ptrArgVal(temp), xsize, ysize, zsize, ptrArgVal(duration), ptrArgVal(sorigin), BigInt(torigin), bitmatrix ? 1 : 0, border_inc ? 1 : 0, ptrArgVal(count)]);
	checkMeosError();
	return _r;
}

export function tgeo_split_each_n_stboxes(temp: Ptr, elem_count: number, count: Ptr): Ptr {
	const _r = callPtr('tgeo_split_each_n_stboxes_w', [ptrArgType(), 'number', ptrArgType()], [ptrArgVal(temp), elem_count, ptrArgVal(count)]);
	checkMeosError();
	return _r;
}

export function tgeo_split_n_stboxes(temp: Ptr, box_count: number, count: Ptr): Ptr {
	const _r = callPtr('tgeo_split_n_stboxes_w', [ptrArgType(), 'number', ptrArgType()], [ptrArgVal(temp), box_count, ptrArgVal(count)]);
	checkMeosError();
	return _r;
}

export function adjacent_stbox_tspatial(box: Ptr, temp: Ptr): boolean {
	const _r = call<number>('adjacent_stbox_tspatial_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(box), ptrArgVal(temp)]) !== 0;
	checkMeosError();
	return _r;
}

export function adjacent_tspatial_stbox(temp: Ptr, box: Ptr): boolean {
	const _r = call<number>('adjacent_tspatial_stbox_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(box)]) !== 0;
	checkMeosError();
	return _r;
}

export function adjacent_tspatial_tspatial(temp1: Ptr, temp2: Ptr): boolean {
	const _r = call<number>('adjacent_tspatial_tspatial_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp1), ptrArgVal(temp2)]) !== 0;
	checkMeosError();
	return _r;
}

export function contained_stbox_tspatial(box: Ptr, temp: Ptr): boolean {
	const _r = call<number>('contained_stbox_tspatial_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(box), ptrArgVal(temp)]) !== 0;
	checkMeosError();
	return _r;
}

export function contained_tspatial_stbox(temp: Ptr, box: Ptr): boolean {
	const _r = call<number>('contained_tspatial_stbox_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(box)]) !== 0;
	checkMeosError();
	return _r;
}

export function contained_tspatial_tspatial(temp1: Ptr, temp2: Ptr): boolean {
	const _r = call<number>('contained_tspatial_tspatial_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp1), ptrArgVal(temp2)]) !== 0;
	checkMeosError();
	return _r;
}

export function contains_stbox_tspatial(box: Ptr, temp: Ptr): boolean {
	const _r = call<number>('contains_stbox_tspatial_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(box), ptrArgVal(temp)]) !== 0;
	checkMeosError();
	return _r;
}

export function contains_tspatial_stbox(temp: Ptr, box: Ptr): boolean {
	const _r = call<number>('contains_tspatial_stbox_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(box)]) !== 0;
	checkMeosError();
	return _r;
}

export function contains_tspatial_tspatial(temp1: Ptr, temp2: Ptr): boolean {
	const _r = call<number>('contains_tspatial_tspatial_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp1), ptrArgVal(temp2)]) !== 0;
	checkMeosError();
	return _r;
}

export function overlaps_stbox_tspatial(box: Ptr, temp: Ptr): boolean {
	const _r = call<number>('overlaps_stbox_tspatial_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(box), ptrArgVal(temp)]) !== 0;
	checkMeosError();
	return _r;
}

export function overlaps_tspatial_stbox(temp: Ptr, box: Ptr): boolean {
	const _r = call<number>('overlaps_tspatial_stbox_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(box)]) !== 0;
	checkMeosError();
	return _r;
}

export function overlaps_tspatial_tspatial(temp1: Ptr, temp2: Ptr): boolean {
	const _r = call<number>('overlaps_tspatial_tspatial_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp1), ptrArgVal(temp2)]) !== 0;
	checkMeosError();
	return _r;
}

export function same_stbox_tspatial(box: Ptr, temp: Ptr): boolean {
	const _r = call<number>('same_stbox_tspatial_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(box), ptrArgVal(temp)]) !== 0;
	checkMeosError();
	return _r;
}

export function same_tspatial_stbox(temp: Ptr, box: Ptr): boolean {
	const _r = call<number>('same_tspatial_stbox_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(box)]) !== 0;
	checkMeosError();
	return _r;
}

export function same_tspatial_tspatial(temp1: Ptr, temp2: Ptr): boolean {
	const _r = call<number>('same_tspatial_tspatial_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp1), ptrArgVal(temp2)]) !== 0;
	checkMeosError();
	return _r;
}

export function above_stbox_tspatial(box: Ptr, temp: Ptr): boolean {
	const _r = call<number>('above_stbox_tspatial_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(box), ptrArgVal(temp)]) !== 0;
	checkMeosError();
	return _r;
}

export function above_tspatial_stbox(temp: Ptr, box: Ptr): boolean {
	const _r = call<number>('above_tspatial_stbox_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(box)]) !== 0;
	checkMeosError();
	return _r;
}

export function above_tspatial_tspatial(temp1: Ptr, temp2: Ptr): boolean {
	const _r = call<number>('above_tspatial_tspatial_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp1), ptrArgVal(temp2)]) !== 0;
	checkMeosError();
	return _r;
}

export function after_stbox_tspatial(box: Ptr, temp: Ptr): boolean {
	const _r = call<number>('after_stbox_tspatial_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(box), ptrArgVal(temp)]) !== 0;
	checkMeosError();
	return _r;
}

export function after_tspatial_stbox(temp: Ptr, box: Ptr): boolean {
	const _r = call<number>('after_tspatial_stbox_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(box)]) !== 0;
	checkMeosError();
	return _r;
}

export function after_tspatial_tspatial(temp1: Ptr, temp2: Ptr): boolean {
	const _r = call<number>('after_tspatial_tspatial_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp1), ptrArgVal(temp2)]) !== 0;
	checkMeosError();
	return _r;
}

export function back_stbox_tspatial(box: Ptr, temp: Ptr): boolean {
	const _r = call<number>('back_stbox_tspatial_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(box), ptrArgVal(temp)]) !== 0;
	checkMeosError();
	return _r;
}

export function back_tspatial_stbox(temp: Ptr, box: Ptr): boolean {
	const _r = call<number>('back_tspatial_stbox_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(box)]) !== 0;
	checkMeosError();
	return _r;
}

export function back_tspatial_tspatial(temp1: Ptr, temp2: Ptr): boolean {
	const _r = call<number>('back_tspatial_tspatial_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp1), ptrArgVal(temp2)]) !== 0;
	checkMeosError();
	return _r;
}

export function before_stbox_tspatial(box: Ptr, temp: Ptr): boolean {
	const _r = call<number>('before_stbox_tspatial_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(box), ptrArgVal(temp)]) !== 0;
	checkMeosError();
	return _r;
}

export function before_tspatial_stbox(temp: Ptr, box: Ptr): boolean {
	const _r = call<number>('before_tspatial_stbox_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(box)]) !== 0;
	checkMeosError();
	return _r;
}

export function before_tspatial_tspatial(temp1: Ptr, temp2: Ptr): boolean {
	const _r = call<number>('before_tspatial_tspatial_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp1), ptrArgVal(temp2)]) !== 0;
	checkMeosError();
	return _r;
}

export function below_stbox_tspatial(box: Ptr, temp: Ptr): boolean {
	const _r = call<number>('below_stbox_tspatial_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(box), ptrArgVal(temp)]) !== 0;
	checkMeosError();
	return _r;
}

export function below_tspatial_stbox(temp: Ptr, box: Ptr): boolean {
	const _r = call<number>('below_tspatial_stbox_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(box)]) !== 0;
	checkMeosError();
	return _r;
}

export function below_tspatial_tspatial(temp1: Ptr, temp2: Ptr): boolean {
	const _r = call<number>('below_tspatial_tspatial_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp1), ptrArgVal(temp2)]) !== 0;
	checkMeosError();
	return _r;
}

export function front_stbox_tspatial(box: Ptr, temp: Ptr): boolean {
	const _r = call<number>('front_stbox_tspatial_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(box), ptrArgVal(temp)]) !== 0;
	checkMeosError();
	return _r;
}

export function front_tspatial_stbox(temp: Ptr, box: Ptr): boolean {
	const _r = call<number>('front_tspatial_stbox_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(box)]) !== 0;
	checkMeosError();
	return _r;
}

export function front_tspatial_tspatial(temp1: Ptr, temp2: Ptr): boolean {
	const _r = call<number>('front_tspatial_tspatial_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp1), ptrArgVal(temp2)]) !== 0;
	checkMeosError();
	return _r;
}

export function left_stbox_tspatial(box: Ptr, temp: Ptr): boolean {
	const _r = call<number>('left_stbox_tspatial_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(box), ptrArgVal(temp)]) !== 0;
	checkMeosError();
	return _r;
}

export function left_tspatial_stbox(temp: Ptr, box: Ptr): boolean {
	const _r = call<number>('left_tspatial_stbox_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(box)]) !== 0;
	checkMeosError();
	return _r;
}

export function left_tspatial_tspatial(temp1: Ptr, temp2: Ptr): boolean {
	const _r = call<number>('left_tspatial_tspatial_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp1), ptrArgVal(temp2)]) !== 0;
	checkMeosError();
	return _r;
}

export function overabove_stbox_tspatial(box: Ptr, temp: Ptr): boolean {
	const _r = call<number>('overabove_stbox_tspatial_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(box), ptrArgVal(temp)]) !== 0;
	checkMeosError();
	return _r;
}

export function overabove_tspatial_stbox(temp: Ptr, box: Ptr): boolean {
	const _r = call<number>('overabove_tspatial_stbox_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(box)]) !== 0;
	checkMeosError();
	return _r;
}

export function overabove_tspatial_tspatial(temp1: Ptr, temp2: Ptr): boolean {
	const _r = call<number>('overabove_tspatial_tspatial_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp1), ptrArgVal(temp2)]) !== 0;
	checkMeosError();
	return _r;
}

export function overafter_stbox_tspatial(box: Ptr, temp: Ptr): boolean {
	const _r = call<number>('overafter_stbox_tspatial_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(box), ptrArgVal(temp)]) !== 0;
	checkMeosError();
	return _r;
}

export function overafter_tspatial_stbox(temp: Ptr, box: Ptr): boolean {
	const _r = call<number>('overafter_tspatial_stbox_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(box)]) !== 0;
	checkMeosError();
	return _r;
}

export function overafter_tspatial_tspatial(temp1: Ptr, temp2: Ptr): boolean {
	const _r = call<number>('overafter_tspatial_tspatial_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp1), ptrArgVal(temp2)]) !== 0;
	checkMeosError();
	return _r;
}

export function overback_stbox_tspatial(box: Ptr, temp: Ptr): boolean {
	const _r = call<number>('overback_stbox_tspatial_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(box), ptrArgVal(temp)]) !== 0;
	checkMeosError();
	return _r;
}

export function overback_tspatial_stbox(temp: Ptr, box: Ptr): boolean {
	const _r = call<number>('overback_tspatial_stbox_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(box)]) !== 0;
	checkMeosError();
	return _r;
}

export function overback_tspatial_tspatial(temp1: Ptr, temp2: Ptr): boolean {
	const _r = call<number>('overback_tspatial_tspatial_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp1), ptrArgVal(temp2)]) !== 0;
	checkMeosError();
	return _r;
}

export function overbefore_stbox_tspatial(box: Ptr, temp: Ptr): boolean {
	const _r = call<number>('overbefore_stbox_tspatial_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(box), ptrArgVal(temp)]) !== 0;
	checkMeosError();
	return _r;
}

export function overbefore_tspatial_stbox(temp: Ptr, box: Ptr): boolean {
	const _r = call<number>('overbefore_tspatial_stbox_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(box)]) !== 0;
	checkMeosError();
	return _r;
}

export function overbefore_tspatial_tspatial(temp1: Ptr, temp2: Ptr): boolean {
	const _r = call<number>('overbefore_tspatial_tspatial_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp1), ptrArgVal(temp2)]) !== 0;
	checkMeosError();
	return _r;
}

export function overbelow_stbox_tspatial(box: Ptr, temp: Ptr): boolean {
	const _r = call<number>('overbelow_stbox_tspatial_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(box), ptrArgVal(temp)]) !== 0;
	checkMeosError();
	return _r;
}

export function overbelow_tspatial_stbox(temp: Ptr, box: Ptr): boolean {
	const _r = call<number>('overbelow_tspatial_stbox_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(box)]) !== 0;
	checkMeosError();
	return _r;
}

export function overbelow_tspatial_tspatial(temp1: Ptr, temp2: Ptr): boolean {
	const _r = call<number>('overbelow_tspatial_tspatial_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp1), ptrArgVal(temp2)]) !== 0;
	checkMeosError();
	return _r;
}

export function overfront_stbox_tspatial(box: Ptr, temp: Ptr): boolean {
	const _r = call<number>('overfront_stbox_tspatial_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(box), ptrArgVal(temp)]) !== 0;
	checkMeosError();
	return _r;
}

export function overfront_tspatial_stbox(temp: Ptr, box: Ptr): boolean {
	const _r = call<number>('overfront_tspatial_stbox_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(box)]) !== 0;
	checkMeosError();
	return _r;
}

export function overfront_tspatial_tspatial(temp1: Ptr, temp2: Ptr): boolean {
	const _r = call<number>('overfront_tspatial_tspatial_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp1), ptrArgVal(temp2)]) !== 0;
	checkMeosError();
	return _r;
}

export function overleft_stbox_tspatial(box: Ptr, temp: Ptr): boolean {
	const _r = call<number>('overleft_stbox_tspatial_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(box), ptrArgVal(temp)]) !== 0;
	checkMeosError();
	return _r;
}

export function overleft_tspatial_stbox(temp: Ptr, box: Ptr): boolean {
	const _r = call<number>('overleft_tspatial_stbox_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(box)]) !== 0;
	checkMeosError();
	return _r;
}

export function overleft_tspatial_tspatial(temp1: Ptr, temp2: Ptr): boolean {
	const _r = call<number>('overleft_tspatial_tspatial_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp1), ptrArgVal(temp2)]) !== 0;
	checkMeosError();
	return _r;
}

export function overright_stbox_tspatial(box: Ptr, temp: Ptr): boolean {
	const _r = call<number>('overright_stbox_tspatial_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(box), ptrArgVal(temp)]) !== 0;
	checkMeosError();
	return _r;
}

export function overright_tspatial_stbox(temp: Ptr, box: Ptr): boolean {
	const _r = call<number>('overright_tspatial_stbox_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(box)]) !== 0;
	checkMeosError();
	return _r;
}

export function overright_tspatial_tspatial(temp1: Ptr, temp2: Ptr): boolean {
	const _r = call<number>('overright_tspatial_tspatial_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp1), ptrArgVal(temp2)]) !== 0;
	checkMeosError();
	return _r;
}

export function right_stbox_tspatial(box: Ptr, temp: Ptr): boolean {
	const _r = call<number>('right_stbox_tspatial_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(box), ptrArgVal(temp)]) !== 0;
	checkMeosError();
	return _r;
}

export function right_tspatial_stbox(temp: Ptr, box: Ptr): boolean {
	const _r = call<number>('right_tspatial_stbox_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(box)]) !== 0;
	checkMeosError();
	return _r;
}

export function right_tspatial_tspatial(temp1: Ptr, temp2: Ptr): boolean {
	const _r = call<number>('right_tspatial_tspatial_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp1), ptrArgVal(temp2)]) !== 0;
	checkMeosError();
	return _r;
}

export function acontains_geo_tgeo(gs: Ptr, temp: Ptr): number {
	const _r = call<number>('acontains_geo_tgeo_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(gs), ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function acontains_tgeo_geo(temp: Ptr, gs: Ptr): number {
	const _r = call<number>('acontains_tgeo_geo_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(gs)]);
	checkMeosError();
	return _r;
}

export function acontains_tgeo_tgeo(temp1: Ptr, temp2: Ptr): number {
	const _r = call<number>('acontains_tgeo_tgeo_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp1), ptrArgVal(temp2)]);
	checkMeosError();
	return _r;
}

export function adisjoint_tgeo_geo(temp: Ptr, gs: Ptr): number {
	const _r = call<number>('adisjoint_tgeo_geo_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(gs)]);
	checkMeosError();
	return _r;
}

export function adisjoint_tgeo_tgeo(temp1: Ptr, temp2: Ptr): number {
	const _r = call<number>('adisjoint_tgeo_tgeo_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp1), ptrArgVal(temp2)]);
	checkMeosError();
	return _r;
}

export function adwithin_tgeo_geo(temp: Ptr, gs: Ptr, dist: number): number {
	const _r = call<number>('adwithin_tgeo_geo_w', 'number', [ptrArgType(), ptrArgType(), 'number'], [ptrArgVal(temp), ptrArgVal(gs), dist]);
	checkMeosError();
	return _r;
}

export function adwithin_tgeo_tgeo(temp1: Ptr, temp2: Ptr, dist: number): number {
	const _r = call<number>('adwithin_tgeo_tgeo_w', 'number', [ptrArgType(), ptrArgType(), 'number'], [ptrArgVal(temp1), ptrArgVal(temp2), dist]);
	checkMeosError();
	return _r;
}

export function aintersects_tgeo_geo(temp: Ptr, gs: Ptr): number {
	const _r = call<number>('aintersects_tgeo_geo_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(gs)]);
	checkMeosError();
	return _r;
}

export function aintersects_tgeo_tgeo(temp1: Ptr, temp2: Ptr): number {
	const _r = call<number>('aintersects_tgeo_tgeo_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp1), ptrArgVal(temp2)]);
	checkMeosError();
	return _r;
}

export function atouches_tgeo_geo(temp: Ptr, gs: Ptr): number {
	const _r = call<number>('atouches_tgeo_geo_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(gs)]);
	checkMeosError();
	return _r;
}

export function atouches_tgeo_tgeo(temp1: Ptr, temp2: Ptr): number {
	const _r = call<number>('atouches_tgeo_tgeo_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp1), ptrArgVal(temp2)]);
	checkMeosError();
	return _r;
}

export function atouches_tpoint_geo(temp: Ptr, gs: Ptr): number {
	const _r = call<number>('atouches_tpoint_geo_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(gs)]);
	checkMeosError();
	return _r;
}

export function econtains_geo_tgeo(gs: Ptr, temp: Ptr): number {
	const _r = call<number>('econtains_geo_tgeo_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(gs), ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function econtains_tgeo_geo(temp: Ptr, gs: Ptr): number {
	const _r = call<number>('econtains_tgeo_geo_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(gs)]);
	checkMeosError();
	return _r;
}

export function econtains_tgeo_tgeo(temp1: Ptr, temp2: Ptr): number {
	const _r = call<number>('econtains_tgeo_tgeo_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp1), ptrArgVal(temp2)]);
	checkMeosError();
	return _r;
}

export function ecovers_geo_tgeo(gs: Ptr, temp: Ptr): number {
	const _r = call<number>('ecovers_geo_tgeo_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(gs), ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function ecovers_tgeo_geo(temp: Ptr, gs: Ptr): number {
	const _r = call<number>('ecovers_tgeo_geo_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(gs)]);
	checkMeosError();
	return _r;
}

export function ecovers_tgeo_tgeo(temp1: Ptr, temp2: Ptr): number {
	const _r = call<number>('ecovers_tgeo_tgeo_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp1), ptrArgVal(temp2)]);
	checkMeosError();
	return _r;
}

export function edisjoint_tgeo_geo(temp: Ptr, gs: Ptr): number {
	const _r = call<number>('edisjoint_tgeo_geo_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(gs)]);
	checkMeosError();
	return _r;
}

export function edisjoint_tgeo_tgeo(temp1: Ptr, temp2: Ptr): number {
	const _r = call<number>('edisjoint_tgeo_tgeo_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp1), ptrArgVal(temp2)]);
	checkMeosError();
	return _r;
}

export function edwithin_tgeo_geo(temp: Ptr, gs: Ptr, dist: number): number {
	const _r = call<number>('edwithin_tgeo_geo_w', 'number', [ptrArgType(), ptrArgType(), 'number'], [ptrArgVal(temp), ptrArgVal(gs), dist]);
	checkMeosError();
	return _r;
}

export function edwithin_tgeo_tgeo(temp1: Ptr, temp2: Ptr, dist: number): number {
	const _r = call<number>('edwithin_tgeo_tgeo_w', 'number', [ptrArgType(), ptrArgType(), 'number'], [ptrArgVal(temp1), ptrArgVal(temp2), dist]);
	checkMeosError();
	return _r;
}

export function eintersects_tgeo_geo(temp: Ptr, gs: Ptr): number {
	const _r = call<number>('eintersects_tgeo_geo_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(gs)]);
	checkMeosError();
	return _r;
}

export function eintersects_tgeo_tgeo(temp1: Ptr, temp2: Ptr): number {
	const _r = call<number>('eintersects_tgeo_tgeo_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp1), ptrArgVal(temp2)]);
	checkMeosError();
	return _r;
}

export function etouches_tgeo_geo(temp: Ptr, gs: Ptr): number {
	const _r = call<number>('etouches_tgeo_geo_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(gs)]);
	checkMeosError();
	return _r;
}

export function etouches_tgeo_tgeo(temp1: Ptr, temp2: Ptr): number {
	const _r = call<number>('etouches_tgeo_tgeo_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp1), ptrArgVal(temp2)]);
	checkMeosError();
	return _r;
}

export function etouches_tpoint_geo(temp: Ptr, gs: Ptr): number {
	const _r = call<number>('etouches_tpoint_geo_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(gs)]);
	checkMeosError();
	return _r;
}

export function tcontains_geo_tgeo(gs: Ptr, temp: Ptr): Ptr {
	const _r = callPtr('tcontains_geo_tgeo_w', [ptrArgType(), ptrArgType()], [ptrArgVal(gs), ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function tcontains_tgeo_geo(temp: Ptr, gs: Ptr): Ptr {
	const _r = callPtr('tcontains_tgeo_geo_w', [ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(gs)]);
	checkMeosError();
	return _r;
}

export function tcontains_tgeo_tgeo(temp1: Ptr, temp2: Ptr): Ptr {
	const _r = callPtr('tcontains_tgeo_tgeo_w', [ptrArgType(), ptrArgType()], [ptrArgVal(temp1), ptrArgVal(temp2)]);
	checkMeosError();
	return _r;
}

export function tcovers_geo_tgeo(gs: Ptr, temp: Ptr): Ptr {
	const _r = callPtr('tcovers_geo_tgeo_w', [ptrArgType(), ptrArgType()], [ptrArgVal(gs), ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function tcovers_tgeo_geo(temp: Ptr, gs: Ptr): Ptr {
	const _r = callPtr('tcovers_tgeo_geo_w', [ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(gs)]);
	checkMeosError();
	return _r;
}

export function tcovers_tgeo_tgeo(temp1: Ptr, temp2: Ptr): Ptr {
	const _r = callPtr('tcovers_tgeo_tgeo_w', [ptrArgType(), ptrArgType()], [ptrArgVal(temp1), ptrArgVal(temp2)]);
	checkMeosError();
	return _r;
}

export function tdisjoint_geo_tgeo(gs: Ptr, temp: Ptr): Ptr {
	const _r = callPtr('tdisjoint_geo_tgeo_w', [ptrArgType(), ptrArgType()], [ptrArgVal(gs), ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function tdisjoint_tgeo_geo(temp: Ptr, gs: Ptr): Ptr {
	const _r = callPtr('tdisjoint_tgeo_geo_w', [ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(gs)]);
	checkMeosError();
	return _r;
}

export function tdisjoint_tgeo_tgeo(temp1: Ptr, temp2: Ptr): Ptr {
	const _r = callPtr('tdisjoint_tgeo_tgeo_w', [ptrArgType(), ptrArgType()], [ptrArgVal(temp1), ptrArgVal(temp2)]);
	checkMeosError();
	return _r;
}

export function tdwithin_geo_tgeo(gs: Ptr, temp: Ptr, dist: number): Ptr {
	const _r = callPtr('tdwithin_geo_tgeo_w', [ptrArgType(), ptrArgType(), 'number'], [ptrArgVal(gs), ptrArgVal(temp), dist]);
	checkMeosError();
	return _r;
}

export function tdwithin_tgeo_geo(temp: Ptr, gs: Ptr, dist: number): Ptr {
	const _r = callPtr('tdwithin_tgeo_geo_w', [ptrArgType(), ptrArgType(), 'number'], [ptrArgVal(temp), ptrArgVal(gs), dist]);
	checkMeosError();
	return _r;
}

export function tdwithin_tgeo_tgeo(temp1: Ptr, temp2: Ptr, dist: number): Ptr {
	const _r = callPtr('tdwithin_tgeo_tgeo_w', [ptrArgType(), ptrArgType(), 'number'], [ptrArgVal(temp1), ptrArgVal(temp2), dist]);
	checkMeosError();
	return _r;
}

export function tintersects_geo_tgeo(gs: Ptr, temp: Ptr): Ptr {
	const _r = callPtr('tintersects_geo_tgeo_w', [ptrArgType(), ptrArgType()], [ptrArgVal(gs), ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function tintersects_tgeo_geo(temp: Ptr, gs: Ptr): Ptr {
	const _r = callPtr('tintersects_tgeo_geo_w', [ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(gs)]);
	checkMeosError();
	return _r;
}

export function tintersects_tgeo_tgeo(temp1: Ptr, temp2: Ptr): Ptr {
	const _r = callPtr('tintersects_tgeo_tgeo_w', [ptrArgType(), ptrArgType()], [ptrArgVal(temp1), ptrArgVal(temp2)]);
	checkMeosError();
	return _r;
}

export function ttouches_geo_tgeo(gs: Ptr, temp: Ptr): Ptr {
	const _r = callPtr('ttouches_geo_tgeo_w', [ptrArgType(), ptrArgType()], [ptrArgVal(gs), ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function ttouches_tgeo_geo(temp: Ptr, gs: Ptr): Ptr {
	const _r = callPtr('ttouches_tgeo_geo_w', [ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(gs)]);
	checkMeosError();
	return _r;
}

export function ttouches_tgeo_tgeo(temp1: Ptr, temp2: Ptr): Ptr {
	const _r = callPtr('ttouches_tgeo_tgeo_w', [ptrArgType(), ptrArgType()], [ptrArgVal(temp1), ptrArgVal(temp2)]);
	checkMeosError();
	return _r;
}

export function tdistance_tgeo_geo(temp: Ptr, gs: Ptr): Ptr {
	const _r = callPtr('tdistance_tgeo_geo_w', [ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(gs)]);
	checkMeosError();
	return _r;
}

export function tdistance_tgeo_tgeo(temp1: Ptr, temp2: Ptr): Ptr {
	const _r = callPtr('tdistance_tgeo_tgeo_w', [ptrArgType(), ptrArgType()], [ptrArgVal(temp1), ptrArgVal(temp2)]);
	checkMeosError();
	return _r;
}

export function nad_stbox_geo(box: Ptr, gs: Ptr): number {
	const _r = call<number>('nad_stbox_geo_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(box), ptrArgVal(gs)]);
	checkMeosError();
	return _r;
}

export function nad_stbox_stbox(box1: Ptr, box2: Ptr): number {
	const _r = call<number>('nad_stbox_stbox_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(box1), ptrArgVal(box2)]);
	checkMeosError();
	return _r;
}

export function nad_tgeo_geo(temp: Ptr, gs: Ptr): number {
	const _r = call<number>('nad_tgeo_geo_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(gs)]);
	checkMeosError();
	return _r;
}

export function nad_tgeo_stbox(temp: Ptr, box: Ptr): number {
	const _r = call<number>('nad_tgeo_stbox_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(box)]);
	checkMeosError();
	return _r;
}

export function nad_tgeo_tgeo(temp1: Ptr, temp2: Ptr): number {
	const _r = call<number>('nad_tgeo_tgeo_w', 'number', [ptrArgType(), ptrArgType()], [ptrArgVal(temp1), ptrArgVal(temp2)]);
	checkMeosError();
	return _r;
}

export function nai_tgeo_geo(temp: Ptr, gs: Ptr): Ptr {
	const _r = callPtr('nai_tgeo_geo_w', [ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(gs)]);
	checkMeosError();
	return _r;
}

export function nai_tgeo_tgeo(temp1: Ptr, temp2: Ptr): Ptr {
	const _r = callPtr('nai_tgeo_tgeo_w', [ptrArgType(), ptrArgType()], [ptrArgVal(temp1), ptrArgVal(temp2)]);
	checkMeosError();
	return _r;
}

export function shortestline_tgeo_geo(temp: Ptr, gs: Ptr): Ptr {
	const _r = callPtr('shortestline_tgeo_geo_w', [ptrArgType(), ptrArgType()], [ptrArgVal(temp), ptrArgVal(gs)]);
	checkMeosError();
	return _r;
}

export function shortestline_tgeo_tgeo(temp1: Ptr, temp2: Ptr): Ptr {
	const _r = callPtr('shortestline_tgeo_tgeo_w', [ptrArgType(), ptrArgType()], [ptrArgVal(temp1), ptrArgVal(temp2)]);
	checkMeosError();
	return _r;
}

export function tpoint_tcentroid_finalfn(state: Ptr): Ptr {
	const _r = callPtr('tpoint_tcentroid_finalfn_w', [ptrArgType()], [ptrArgVal(state)]);
	checkMeosError();
	return _r;
}

export function tpoint_tcentroid_transfn(state: Ptr, temp: Ptr): Ptr {
	const _r = callPtr('tpoint_tcentroid_transfn_w', [ptrArgType(), ptrArgType()], [ptrArgVal(state), ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function tspatial_extent_transfn(box: Ptr, temp: Ptr): Ptr {
	const _r = callPtr('tspatial_extent_transfn_w', [ptrArgType(), ptrArgType()], [ptrArgVal(box), ptrArgVal(temp)]);
	checkMeosError();
	return _r;
}

export function stbox_get_space_tile(point: Ptr, xsize: number, ysize: number, zsize: number, sorigin: Ptr): Ptr {
	const _r = callPtr('stbox_get_space_tile_w', [ptrArgType(), 'number', 'number', 'number', ptrArgType()], [ptrArgVal(point), xsize, ysize, zsize, ptrArgVal(sorigin)]);
	checkMeosError();
	return _r;
}

export function stbox_get_space_time_tile(point: Ptr, t: TimestampTz, xsize: number, ysize: number, zsize: number, duration: Ptr, sorigin: Ptr, torigin: TimestampTz): Ptr {
	const _r = callPtr('stbox_get_space_time_tile_w', [ptrArgType(), 'bigint', 'number', 'number', 'number', ptrArgType(), ptrArgType(), 'bigint'], [ptrArgVal(point), BigInt(t), xsize, ysize, zsize, ptrArgVal(duration), ptrArgVal(sorigin), BigInt(torigin)]);
	checkMeosError();
	return _r;
}

export function stbox_get_time_tile(t: TimestampTz, duration: Ptr, torigin: TimestampTz): Ptr {
	const _r = callPtr('stbox_get_time_tile_w', ['bigint', ptrArgType(), 'bigint'], [BigInt(t), ptrArgVal(duration), BigInt(torigin)]);
	checkMeosError();
	return _r;
}

export function stbox_space_tiles(bounds: Ptr, xsize: number, ysize: number, zsize: number, sorigin: Ptr, border_inc: boolean, count: Ptr): Ptr {
	const _r = callPtr('stbox_space_tiles_w', [ptrArgType(), 'number', 'number', 'number', ptrArgType(), 'number', ptrArgType()], [ptrArgVal(bounds), xsize, ysize, zsize, ptrArgVal(sorigin), border_inc ? 1 : 0, ptrArgVal(count)]);
	checkMeosError();
	return _r;
}

export function stbox_space_time_tiles(bounds: Ptr, xsize: number, ysize: number, zsize: number, duration: Ptr, sorigin: Ptr, torigin: TimestampTz, border_inc: boolean, count: Ptr): Ptr {
	const _r = callPtr('stbox_space_time_tiles_w', [ptrArgType(), 'number', 'number', 'number', ptrArgType(), ptrArgType(), 'bigint', 'number', ptrArgType()], [ptrArgVal(bounds), xsize, ysize, zsize, ptrArgVal(duration), ptrArgVal(sorigin), BigInt(torigin), border_inc ? 1 : 0, ptrArgVal(count)]);
	checkMeosError();
	return _r;
}

export function stbox_time_tiles(bounds: Ptr, duration: Ptr, torigin: TimestampTz, border_inc: boolean, count: Ptr): Ptr {
	const _r = callPtr('stbox_time_tiles_w', [ptrArgType(), ptrArgType(), 'bigint', 'number', ptrArgType()], [ptrArgVal(bounds), ptrArgVal(duration), BigInt(torigin), border_inc ? 1 : 0, ptrArgVal(count)]);
	checkMeosError();
	return _r;
}

export function tgeo_space_split(temp: Ptr, xsize: number, ysize: number, zsize: number, sorigin: Ptr, bitmatrix: boolean, border_inc: boolean, space_bins: Ptr, count: Ptr): Ptr {
	const _r = callPtr('tgeo_space_split_w', [ptrArgType(), 'number', 'number', 'number', ptrArgType(), 'number', 'number', ptrArgType(), ptrArgType()], [ptrArgVal(temp), xsize, ysize, zsize, ptrArgVal(sorigin), bitmatrix ? 1 : 0, border_inc ? 1 : 0, ptrArgVal(space_bins), ptrArgVal(count)]);
	checkMeosError();
	return _r;
}

export function tgeo_space_time_split(temp: Ptr, xsize: number, ysize: number, zsize: number, duration: Ptr, sorigin: Ptr, torigin: TimestampTz, bitmatrix: boolean, border_inc: boolean, space_bins: Ptr, time_bins: Ptr, count: Ptr): Ptr {
	const _r = callPtr('tgeo_space_time_split_w', [ptrArgType(), 'number', 'number', 'number', ptrArgType(), ptrArgType(), 'bigint', 'number', 'number', ptrArgType(), ptrArgType(), ptrArgType()], [ptrArgVal(temp), xsize, ysize, zsize, ptrArgVal(duration), ptrArgVal(sorigin), BigInt(torigin), bitmatrix ? 1 : 0, border_inc ? 1 : 0, ptrArgVal(space_bins), ptrArgVal(time_bins), ptrArgVal(count)]);
	checkMeosError();
	return _r;
}

export function geo_cluster_kmeans(geoms: Ptr, ngeoms: number, k: number): Ptr {
	const _r = callPtr('geo_cluster_kmeans_w', [ptrArgType(), 'number', 'number'], [ptrArgVal(geoms), ngeoms, k]);
	checkMeosError();
	return _r;
}

export function geo_cluster_dbscan(geoms: Ptr, ngeoms: number, tolerance: number, minpoints: number, count: Ptr): Ptr {
	const _r = callPtr('geo_cluster_dbscan_w', [ptrArgType(), 'number', 'number', 'number', ptrArgType()], [ptrArgVal(geoms), ngeoms, tolerance, minpoints, ptrArgVal(count)]);
	checkMeosError();
	return _r;
}

export function geo_cluster_intersecting(geoms: Ptr, ngeoms: number, count: Ptr): Ptr {
	const _r = callPtr('geo_cluster_intersecting_w', [ptrArgType(), 'number', ptrArgType()], [ptrArgVal(geoms), ngeoms, ptrArgVal(count)]);
	checkMeosError();
	return _r;
}

export function geo_cluster_within(geoms: Ptr, ngeoms: number, tolerance: number, count: Ptr): Ptr {
	const _r = callPtr('geo_cluster_within_w', [ptrArgType(), 'number', 'number', ptrArgType()], [ptrArgVal(geoms), ngeoms, tolerance, ptrArgVal(count)]);
	checkMeosError();
	return _r;
}

