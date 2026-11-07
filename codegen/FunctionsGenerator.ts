/**
 * Generates two output files from src/builder/res/meos-idl.json:
 *
 *   c-src/bindings.c       — EMSCRIPTEN_KEEPALIVE wrapper functions compiled into
 *                            the WASM module.  Each wrapper adapts the MEOS C ABI
 *                            to the types that Emscripten's ccall can marshal.
 *
 *   src/core/functions.ts  — TypeScript functions that call their C counterpart
 *                            via Emscripten's Module.ccall().
 *
 * The IDL (meos-idl.json) is the MEOS-API catalog (produced by MEOS-API's run.py
 * from the MEOS C headers); this binding is a projection of it. Each "functions"
 * array entry carries:
 *   name        -> C function name
 *   file        -> originating header (meos.h / meos_geo.h)
 *   returnType  -> { c, canonical, typedef? }
 *   params      -> [{ name, cType, canonical, typedef? }]
 *
 * Every type decision reads `canonical`, resolving the names the catalog keeps
 * through its top-level `typedefs`, and names a type of its own from `typedef`
 * (see TypeMap). `c` / `cType` is only the spelling the C wrapper declares.
 *
 * Run: npm run generate
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// -------------------------------------------------------------------------
// IDL SCHEMA
// -------------------------------------------------------------------------

interface ReturnType {
	c: string;
	canonical: string;
	typedef?: string;
}
interface Param {
	name: string;
	cType: string;
	canonical: string;
	typedef?: string;
}
interface IdlFunction {
	name: string;
	file: string;
	api: string;
	family: string;
	returnType: ReturnType;
	params: Param[];
	shape?: { outParams?: string[] };
}
interface IdlEnum {
	name: string;
}
interface IdlNamed {
	name: string;
}
interface IdlTypedef {
	name: string;
	canonical: string;
}
interface Idl {
	functions: IdlFunction[];
	enums?: IdlEnum[];
	structs?: IdlNamed[];
	callbacks?: IdlNamed[];
	typedefs?: IdlTypedef[];
}

// -------------------------------------------------------------------------
// CONFIGURATION
// -------------------------------------------------------------------------

/**
 * Functions whose wrappers are hand-written in the static file headers
 * (res/bindings_c_header.c.template and res/functions_ts_header.ts.template).
 *
 * The generator skips these silently. No SKIP comment is emitted because
 * the hand-written versions already exist in the output files via the header
 * template. Reasons a function ends up here:
 *
 *   - Init / lifecycle: meos_initialize / meos_finalize require a custom
 *     JavaScript promise wrapper that the generator cannot produce.
 *
 *   - Variadic / function-pointer callbacks: meos_error and
 *     meos_initialize_error_handler take C function-pointer arguments that
 *     Emscripten cannot marshal automatically.
 *
 *   - Special-logic wrappers: functions whose JS-facing behaviour differs
 *     non-trivially from the raw C signature:
 *       temporal_as_hexwkb  hides size_out
 *       temporal_as_mfjson  converts an empty srs string to a C NULL pointer
 *       temporal_instant_n  adjusts from 0-based JS indexing to 1-based MEOS
 *       temporal_duration   returns Interval* — re-exposed as
 *                           temporal_duration_us (total microseconds) instead
 *
 *   - PostgreSQL text utilities: cstring_to_text / text_to_cstring are used
 *     internally by the generated C wrappers and have no meaningful JS surface.
 */
const MANUAL_FUNCTIONS = new Set([
	'meos_initialize',
	'meos_finalize',
	'meos_initialize_timezone',
	'meos_finalize_timezone',
	'meos_finalize_projsrs',
	'meos_finalize_ways',
	'meos_error',
	'meos_initialize_error_handler',
	'temporal_as_hexwkb',
	'temporal_as_mfjson',
	'temporal_instant_n',
	'temporal_duration',
	'cstring_to_text',
	'text_to_cstring',
	// WASM32 Datum workarounds: int64 is stored by-reference in WASM32
	// (no USE_FLOAT8_BYVAL), so these need custom C wrappers that
	// dereference the Datum pointer to get the actual int64 value.
	'tstzspan_lower',
	'tstzspan_upper',
	'span_eq',
	'span_ne',
	'adjacent_span_span',
	// span_as_hexwkb requires a valid size_t* — custom wrapper collapses it.
	'span_as_hexwkb',
	// SpanSet Datum workarounds: same int64-by-reference issue as tstzspan.
	'tstzspanset_lower',
	'tstzspanset_upper',
	// spanset_as_hexwkb requires a valid size_t* — custom wrapper collapses it.
	'spanset_as_hexwkb',
	// tstzspanset_duration returns Interval*; custom wrapper converts to microseconds.
	'tstzspanset_duration',
	// tstzspanset_timestamptz_n uses bool+result pattern with int64; custom wrapper.
	'tstzspanset_timestamptz_n',
	// tstzspanset_start/end_timestamptz return TimestampTz (int64); suppress to avoid
	// truncation — callers use tstzspanset_lower/upper instead.
	'tstzspanset_start_timestamptz',
	'tstzspanset_end_timestamptz',
	// set_as_hexwkb has int* size_out — the auto-generated 3-arg C wrapper is used;
	// the TS wrapper allocates size_out via _malloc and calls the 3-arg C function.
	'set_as_hexwkb',
	// tstzset start/end value return TimestampTz (int64); suppress to avoid truncation.
	'tstzset_start_value',
	'tstzset_end_value',
	// tstzset_value_n uses bool+result pattern with int64; custom wrapper.
	'tstzset_value_n',
	// textset_value_n / ttext_value_n return text* (PostgreSQL varlena); custom wrapper converts to cstring.
	'textset_value_n',
	'ttext_value_n',
	// Declared in MEOS headers but not implemented in libmeos.a.
	'tfloat_avg_value',
	'geog_from_binary',
]);

/**
 * Param names that are hidden output-only size pointers.
 *
 * In the MEOS C API some functions accept a "size_t *size_out" that the callee
 * writes to report the number of bytes it produced (e.g. *_as_wkb functions).
 * Unlike the Java generator which allocates these internally and discards the
 * value, we expose size_out to the TypeScript caller: without it, the returned
 * Ptr to raw bytes would be unusable because the caller would not know how many
 * bytes to read from WASM linear memory.
 *
 * This set is intentionally empty. It is kept in place so that a future
 * maintainer can add param names that should be hidden again if needed.
 */
const OUTPUT_SIZE_PARAMS = new Set<string>();

// -------------------------------------------------------------------------
// TYPE MAPPING
// -------------------------------------------------------------------------

/**
 * Strips "const" qualifiers and normalises whitespace.
 */
const clean = (t: string) => t.replace(/\bconst\b/g, '').replace(/\s+/g, ' ').trim();

/**
 * How a slot crosses the ccall boundary.
 *
 *   void      no value
 *   bool      int at the C boundary, boolean in TypeScript
 *   string    char *, a JavaScript string
 *   text      text *, converted to and from char * by the C wrapper
 *   int64     a signed 64-bit integer, a BigInt at the boundary
 *   uint64    an unsigned 64-bit integer, a BigInt at the boundary
 *   number    a signed integer of at most 32 bits, an enum, or a floating point
 *   uint32    an unsigned 32-bit integer
 *   ptr       any pointer, a BigInt at the boundary and a Ptr in TypeScript
 *   datum     a PostgreSQL Datum, whose meaning depends on the base type
 *   callback  a C function pointer
 *   byvalue   a structure passed by value
 */
type Kind =
	| 'void' | 'bool' | 'string' | 'text' | 'int64' | 'uint64' | 'number' | 'uint32'
	| 'ptr' | 'datum' | 'callback' | 'byvalue';

interface Mapped {
	kind: Kind;
	/** The name the slot spells its scalar with: a kept name, a typedef or a C type. */
	name: string;
	/** The TypeScript type of the slot. */
	ts: string;
}

/** C standard types, by how they cross the ccall boundary in wasm64. */
const C_WIDTHS: Record<string, Kind> = {
	'int8_t': 'number', 'int16_t': 'number', 'int32_t': 'number', 'int': 'number',
	'short': 'number', 'char': 'number', 'signed char': 'number',
	'uint8_t': 'number', 'uint16_t': 'number', 'unsigned char': 'number',
	'unsigned short': 'number',
	'uint32_t': 'uint32', 'unsigned int': 'uint32', 'unsigned': 'uint32',
	'int64_t': 'int64', 'long': 'int64', 'long long': 'int64', 'ssize_t': 'int64',
	'intptr_t': 'int64',
	'uint64_t': 'uint64', 'unsigned long': 'uint64', 'unsigned long long': 'uint64',
	'size_t': 'uint64', 'uintptr_t': 'uint64',
	'float': 'number', 'double': 'number',
};

/** TypeScript aliases the header template declares for kept PostgreSQL names. */
const TS_KEPT_ALIASES = new Set(['TimestampTz', 'DateADT']);

/**
 * Maps a slot's type from the catalog alone.
 *
 * The slot's `canonical` states its type as MEOS declares it: a C standard
 * type, a structure, an enum or a callback by its name, or a name PostgreSQL
 * declares (TimestampTz, DateADT, Datum, text, ...) that the top-level
 * `typedefs` list resolves to its C type. The slot's `typedef` names a type of
 * its own over a width (H3Index over uint64_t), which the binding exposes under
 * that name. A name none of these resolve is recorded as unresolved, and the
 * generator stops on it rather than guessing a mapping. C_WIDTHS, the C
 * standard types, is the one place a type is written by hand.
 */
class TypeMap {
	private readonly structs: Set<string>;
	private readonly enums: Set<string>;
	private readonly callbacks: Set<string>;
	private readonly typedefs: Map<string, string>;
	/** Names a slot `typedef` gives a type of its own, with the TypeScript type each aliases. */
	readonly ownTypes = new Map<string, string>();
	readonly unresolved: string[] = [];

	constructor(idl: Idl) {
		this.structs = new Set((idl.structs ?? []).map(s => s.name));
		this.enums = new Set((idl.enums ?? []).map(e => e.name));
		this.callbacks = new Set((idl.callbacks ?? []).map(c => c.name));
		this.typedefs = new Map((idl.typedefs ?? []).map(t => [t.name, t.canonical]));
	}

	/** True when the name is one a binding can map: a C type or a catalog entry. */
	private known(base: string): boolean {
		return base === 'void' || base === 'bool' || base in C_WIDTHS ||
			this.structs.has(base) || this.enums.has(base) ||
			this.callbacks.has(base) || this.typedefs.has(base);
	}

	/** The C type a kept name stands for, following `typedefs` to a C type. */
	private resolve(name: string): string {
		let t = name;
		for (let hops = 0; this.typedefs.has(t) && hops < 8; hops++)
			t = clean(this.typedefs.get(t)!);
		return t;
	}

	/** Maps one slot; `where` names the function and slot an error reports. */
	map(slot: { canonical?: string; typedef?: string }, where: string): Mapped {
		const canon = slot.canonical;
		if (canon === undefined) return this.fail('the slot states no canonical type', where);
		// A function pointer spelled out rather than named by a callback entry.
		if (/\(\s*\*\s*\)/.test(canon)) return { kind: 'callback', name: canon, ts: 'Ptr' };

		const c = clean(canon);
		const stars = (c.match(/\*/g) ?? []).length;
		const spelled = c.replace(/\*/g, '').trim();
		// A structure only `struct` names, which the catalog does not lay out.
		const tagged = /^(struct|union|enum)\s+/.test(spelled);
		const base = spelled.replace(/^(struct|union|enum)\s+/, '').trim();

		if (!tagged && !this.known(base))
			return this.fail(`type '${base}' of '${canon}' is neither a C type nor a catalog entry`, where);

		if (stars > 0) {
			if (base === 'Datum') return { kind: 'datum', name: base, ts: 'Ptr' };
			if (stars === 1 && base === 'char') return { kind: 'string', name: base, ts: 'string' };
			if (stars === 1 && base === 'text') return { kind: 'text', name: base, ts: 'string' };
			return { kind: 'ptr', name: base, ts: 'Ptr' };
		}

		if (base === 'void') return { kind: 'void', name: base, ts: 'void' };
		if (base === 'bool') return { kind: 'bool', name: base, ts: 'boolean' };
		if (base === 'Datum') return { kind: 'datum', name: base, ts: 'number' };
		if (this.callbacks.has(base)) return { kind: 'callback', name: base, ts: 'Ptr' };
		if (this.enums.has(base) || /^enum\s/.test(spelled))
			return { kind: 'number', name: base, ts: 'number' };
		if (tagged || this.structs.has(base)) return { kind: 'byvalue', name: base, ts: base };

		const width = this.resolve(base);
		const kind = C_WIDTHS[width];
		if (kind === undefined)
			return this.fail(`type '${base}' resolves to '${width}', which is not a C scalar`, where);

		if (slot.typedef !== undefined) {
			// A type of its own over a width, exposed under its name: a bigint when
			// the width is 64 bits, so no value above 2^53 is rounded.
			this.ownTypes.set(slot.typedef, is64Kind(kind) ? 'bigint' : 'number');
			return { kind, name: slot.typedef, ts: slot.typedef };
		}
		return { kind, name: base, ts: TS_KEPT_ALIASES.has(base) ? base : 'number' };
	}

	/** Maps the type a pointer slot points to, for the bool+result idiom. */
	mapPointee(slot: { canonical: string; typedef?: string }, where: string): Mapped {
		const canonical = slot.canonical.replace(/\*\s*$/, '').trim();
		return this.map({ canonical, typedef: slot.typedef }, where);
	}

	private fail(reason: string, where: string): Mapped {
		this.unresolved.push(`${where}: ${reason}`);
		return { kind: 'number', name: '?', ts: 'never' };
	}
}

const is64Kind = (k: Kind) => k === 'int64' || k === 'uint64';

/** Set once the catalog is read; every generator function maps through it. */
let types: TypeMap;

const retOf = (fn: IdlFunction): Mapped => types.map(fn.returnType, `${fn.name} result`);
const argOf = (fn: IdlFunction, p: Param): Mapped => types.map(p, `${fn.name} param '${p.name}'`);

/** True for a slot whose 64 bits ccall carries as a BigInt. */
const is64 = (m: Mapped) => is64Kind(m.kind);

/** True for the PostgreSQL timestamps the C wrapper declares as long long. */
const isTimestamp = (m: Mapped) =>
	m.kind === 'int64' && (m.name === 'TimestampTz' || m.name === 'Timestamp');

/**
 * The expression a TypeScript wrapper returns for a 64-bit value, which ccall
 * hands back as a signed BigInt: read as unsigned when the width is, kept a
 * BigInt for a type of its own over 64 bits, and a number otherwise, as every
 * other integer the binding returns is.
 */
function from64(m: Mapped, expr: string): string {
	const v = m.kind === 'uint64' ? `BigInt.asUintN(64, ${expr})` : expr;
	return types.ownTypes.get(m.ts) === 'bigint' ? v : `Number(${v})`;
}

// -------------------------------------------------------------------------
// BOOL+RESULT PATTERN DETECTION
// -------------------------------------------------------------------------

/**
 * Describes the resolved types for a function that follows the bool+result
 * C idiom (see detectBoolResult).
 */
interface BoolResultInfo {
	/** The hidden output parameter whose address is passed to the inner call. */
	resultParam: Param;
	/** Dereferenced C type written into *result, as the header spells it (e.g. "int64", "Set *"). */
	resultBaseType: string;
	/** The mapped type of *result. */
	result: Mapped;
	/** C return type for the generated _w wrapper. */
	cWrapRet: string;
	/** TypeScript return type for the generated TS wrapper. */
	tsWrapRet: string;
}

/**
 * Detects the bool+result C idiom and returns wrapper type information.
 *
 * Many MEOS functions follow the pattern:
 *   bool fn(..., T *result)   -> success flag + value written via pointer
 *   bool fn(..., T **result)  -> success flag + pointer written via pointer-to-pointer
 *
 * The generator hides the "result" parameter from the JS caller and instead:
 *   - In the C wrapper: declares a local variable, passes its address, and
 *     returns the value directly (or NULL / 0 on failure).
 *   - In the TS wrapper: removes "result" from the parameter list and adjusts
 *     the return type to the actual value type.
 *
 * Example: single-pointer case (double -> number):
 *   C:   bool stbox_xmax(STBox *box, double *result)
 *   _w:  double stbox_xmax_w(STBox *box) {
 *          double r;
 *          if (!stbox_xmax(box, &r)) return 0.0;
 *          return r;
 *        }
 *   TS:  export function stbox_xmax(box: Ptr): number { ... }
 *
 * Example: double-pointer case (T** -> Ptr):
 *   C:   bool spanset_find_value(SpanSet *ss, Datum d, int **result)
 *   _w:  int * spanset_find_value_w(SpanSet *ss, Datum d) {
 *          int *r;
 *          if (!spanset_find_value(ss, d, &r)) return NULL;
 *          return r;
 *        }
 *   TS:  export function spanset_find_value(ss: Ptr, d: Ptr): Ptr { ... }
 *
 * Returns null if the function does not match the pattern.
 */
function detectBoolResult(fn: IdlFunction): BoolResultInfo | null {
	if (retOf(fn).kind !== 'bool') return null;

	// A "result" param must be either a single or double pointer. A single
	// pointer to const is an input MEOS reads, never an answer it writes,
	// e.g. bool index_result_id(const MeosArray *result, int n, int64 *id).
	const rp = fn.params.find(p => {
		if (p.name !== 'result') return false;
		const c = clean(p.canonical ?? '');
		return c.includes('**') || (c.endsWith('*') && !/^\s*const\b/.test(p.canonical));
	});
	if (!rp) return null;
	const where = `${fn.name} param '${rp.name}'`;

	// Double-pointer case: bool fn(..., T **result) -> wrapper returns T*
	if (clean(rp.canonical).includes('**')) {
		const ptrType = clean(rp.cType).replace(/\*$/, '').trim();
		return {
			resultParam: rp,
			resultBaseType: ptrType,
			result: types.mapPointee(rp, where),
			cWrapRet: ptrType,
			tsWrapRet: 'Ptr',
		};
	}

	// Single-pointer case: bool fn(..., T *result) -> wrapper returns T
	const base = clean(rp.cType).replace(/\*$/, '').trim();
	const m = types.mapPointee(rp, where);
	if (m.kind === 'byvalue' || m.kind === 'datum' || m.kind === 'callback' || m.kind === 'void')
		types.unresolved.push(`${where}: *result of type '${m.name}' has no ccall value`);

	// The C wrapper's return type for the dereferenced value.
	let cRet: string;
	if (is64(m)) cRet = 'long long';
	else if (m.name === 'double') cRet = 'double';
	else if (m.kind === 'bool') cRet = 'int';
	else cRet = base;

	return {
		resultParam: rp,
		resultBaseType: base,
		result: m,
		cWrapRet: cRet,
		tsWrapRet: m.ts,
	};
}

// -------------------------------------------------------------------------
// SKIP LOGIC
// -------------------------------------------------------------------------

/**
 * Returns a human-readable skip reason if the function cannot be auto-generated,
 * or null if it should be generated.
 *
 * The generator aims for full API coverage: all pointer and double-pointer types
 * (including T**, uint8_t*, Interval*, text**) are mapped to the opaque Ptr
 * (number) type, matching the strategy used by the Java generator which maps
 * every unresolvable pointer type to java.Pointer.  A function pointer the
 * catalog states, spelled out or named by its callback entry, is a Ptr too:
 * the address Module.addFunction() returns for a JavaScript function, which
 * the C wrapper passes on under the callback's own C type.
 *
 * The only cases that remain un-generatable are:
 *
 *   - Datum return or param: Datum is an opaque, internal-only tagged value
 *     that cannot be marshalled to a JS scalar.  It appears only on internal
 *     functions; the user-facing API is the typed *_meos.c wrapper.
 *
 *   - A structure by value (Interval, no pointer): passing a C struct by value
 *     through Emscripten ccall is not supported.  A pointer to one is handled
 *     normally as Ptr.
 */
function shouldSkip(fn: IdlFunction): string | null {
	if (retOf(fn).kind === 'datum')
		return 'internal Datum return — use the typed *_meos.c wrapper';
	for (const p of fn.params) {
		const m = argOf(fn, p);
		if (m.kind === 'datum')
			return `internal Datum param '${p.name}' — use the typed *_meos.c wrapper`;
		if (m.kind === 'byvalue') return `${m.name} by-value param '${p.name}'`;
	}
	return null;
}

// -------------------------------------------------------------------------
// C WRAPPER GENERATION
// -------------------------------------------------------------------------

/**
 * Returns the C type used in the _w function signature for a given param type.
 *
 * Emscripten's ccall can only marshal a small set of C types directly.
 * This function maps MEOS-specific types to their ABI-compatible equivalents:
 *   bool       -> int           (no C99 bool in ccall ABI)
 *   TimestampTz/Timestamp → long long  (int64 microseconds)
 *   text *     -> const char *  (converted via cstring_to_text in the body)
 *   everything else passes through unchanged
 */
function cWrapParamType(cType: string, m: Mapped): string {
	if (m.kind === 'bool') return 'int';
	if (isTimestamp(m)) return 'long long';
	if (m.kind === 'text') return 'const char *';
	return cType;
}

/**
 * Returns the C return type used in the _w function signature.
 *
 * Mirrors cWrapParamType for return types:
 *   bool   -> int
 *   TimestampTz/Timestamp → long long
 *   text * -> char *   (converted via text_to_cstring in the body)
 */
function cWrapRetType(cType: string, m: Mapped): string {
	if (m.kind === 'bool') return 'int';
	if (isTimestamp(m)) return 'long long';
	if (m.kind === 'text') return 'char *';
	return cType;
}

/**
 * Builds the expression used to forward a _w param to the inner MEOS call.
 *
 * For most types the param name is passed as-is.  Special cases:
 *   bool        -> (bool) name         re-cast from int
 *   TimestampTz -> (TimestampTz) name  re-cast from long long
 *   Timestamp   -> (Timestamp) name
 *   text *      -> cstring_to_text(name)  convert C string to PG text*
 */
function cCastExpr(name: string, m: Mapped): string {
	if (m.kind === 'bool') return `(bool) ${name}`;
	if (isTimestamp(m)) return `(${m.name}) ${name}`;
	if (m.kind === 'text') return `cstring_to_text(${name})`;
	return name;
}

/**
 * Generates the complete EMSCRIPTEN_KEEPALIVE C wrapper for one IDL function.
 *
 * Two code paths are taken:
 *
 * 1. bool+result pattern (detected by detectBoolResult):
 *    The "result" param is replaced by a local variable; its address is passed
 *    to the inner call.  The wrapper returns the value directly (or a zero/NULL
 *    sentinel on failure).
 *
 *    Example: stbox_xmax (double result):
 *      EMSCRIPTEN_KEEPALIVE
 *      double stbox_xmax_w(STBox *box) {
 *        double r;
 *        if (!stbox_xmax(box, &r)) return 0.0;
 *        return r;
 *      }
 *
 * 2. Normal path:
 *    - void    -> call with no return
 *    - bool    -> cast return to (int)
 *    - text *  -> call text_to_cstring on the returned PG text pointer
 *    - all other types → return value directly
 *
 *    Example: text * return (text_lower):
 *      EMSCRIPTEN_KEEPALIVE
 *      char *text_lower_w(const char *txt) {
 *        text *_t = text_lower(cstring_to_text(txt));
 *        if (!_t) return NULL;
 *        return text_to_cstring(_t);
 *      }
 */
/**
 * The `size_t *` a `char *` return's shape lists in `outParams`, or undefined. It
 * states the size of the string the call answers, its terminator included, so the
 * C wrapper keeps it and the TypeScript wrapper reads the string for it
 * (#generateSizedStringWrapper).
 */
function stringSizeOut(fn: IdlFunction): string | undefined {
	if (clean(fn.returnType.c) !== 'char *' || fn.returnType.c.includes('const')) return undefined;
	const outs = fn.shape?.outParams ?? [];
	return fn.params.find(p => outs.includes(p.name) && clean(p.cType) === 'size_t *')?.name;
}

function generateCWrapper(fn: IdlFunction): string {
	const boolResult = detectBoolResult(fn);
	if (boolResult) {
		const { resultParam, resultBaseType, result, cWrapRet } = boolResult;
		const visible = fn.params.filter(
			p => p !== resultParam && !OUTPUT_SIZE_PARAMS.has(p.name)
		);
		const hasSzOut = fn.params.some(p => OUTPUT_SIZE_PARAMS.has(p.name));
		const sig = visible.map(p => `${cWrapParamType(p.cType, argOf(fn, p))} ${p.name}`).join(', ');
		const args = fn.params
			.map(p => {
				if (p === resultParam) return '&r';
				if (OUTPUT_SIZE_PARAMS.has(p.name)) return '&sz';
				return cCastExpr(p.name, argOf(fn, p));
			})
			.join(', ');
		const zeroVal = cWrapRet === 'double' ? '0.0' : cWrapRet.endsWith('*') ? 'NULL' : '0';
		let castRet = 'r';
		if (cWrapRet === 'long long') castRet = '(long long) r';
		else if (result.kind === 'bool') castRet = '(int) r';
		const lines = [
			'EMSCRIPTEN_KEEPALIVE',
			`${cWrapRet} ${fn.name}_w(${sig}) {`,
			...(hasSzOut ? ['  size_t sz;'] : []),
			`  ${resultBaseType} r;`,
			`  if (!${fn.name}(${args})) return ${zeroVal};`,
			`  return ${castRet};`,
			'}',
		];
		return lines.join('\n');
	}

	const ret = retOf(fn);
	const wrapRet = cWrapRetType(fn.returnType.c, ret);
	const visible = fn.params.filter(p => !OUTPUT_SIZE_PARAMS.has(p.name));
	const hasSzOut = fn.params.some(p => OUTPUT_SIZE_PARAMS.has(p.name));

	const sig = visible.map(p => `${cWrapParamType(p.cType, argOf(fn, p))} ${p.name}`).join(', ');
	const args = fn.params
		.map(p => (OUTPUT_SIZE_PARAMS.has(p.name) ? '&sz' : cCastExpr(p.name, argOf(fn, p))))
		.join(', ');

	const lines: string[] = ['EMSCRIPTEN_KEEPALIVE', `${wrapRet} ${fn.name}_w(${sig}) {`];
	if (hasSzOut) lines.push('  size_t sz;');
	const callExpr = `${fn.name}(${args})`;
	if (ret.kind === 'void') {
		lines.push(`  ${callExpr};`);
	} else if (ret.kind === 'bool') {
		lines.push(`  return (int) ${callExpr};`);
	} else if (ret.kind === 'text') {
		lines.push(`  text *_t = ${callExpr};`);
		lines.push(`  if (!_t) return NULL;`);
		lines.push(`  return text_to_cstring(_t);`);
	} else {
		lines.push(`  return ${callExpr};`);
	}
	lines.push('}');
	return lines.join('\n');
}

// -------------------------------------------------------------------------
// TYPESCRIPT WRAPPER GENERATION
// -------------------------------------------------------------------------

/**
 * A `char *` return read for the size MEOS writes, through the template's
 * `readString`, as wkb.ts's `readWkb` reads a byte buffer: the size leaves the
 * TypeScript signature and the string and its size slot are freed. Each other
 * slot crosses as #generateTsWrapper passes it.
 */
function generateSizedStringWrapper(fn: IdlFunction, sizeOut: string): string {
	const params = fn.params
		.filter(p => p.name !== sizeOut)
		.map(p => `${safeName(p.name)}: ${tsType(argOf(fn, p))}`)
		.join(', ');
	const argTypes = fn.params
		.map(p => {
			if (p.name === sizeOut) return 'ptrArgType()';
			const m = argOf(fn, p);
			return m.ts === 'Ptr' ? 'ptrArgType()' : `'${emArgType(m)}'`;
		})
		.join(', ');
	const argVals = fn.params
		.map(p => {
			if (p.name === sizeOut) return 'ptrArgVal(_sizeOut)';
			const m = argOf(fn, p);
			if (m.ts === 'Ptr') return `ptrArgVal(${safeName(p.name)})`;
			return toCallArg(safeName(p.name), m);
		})
		.join(', ');
	return [
		`export function ${fn.name}(${params}): string {`,
		`\treturn readString(_sizeOut => callPtr('${fn.name}_w', [${argTypes}], [${argVals}]));`,
		'}',
	].join('\n');
}

/**
 * Emscripten ccall argument type tag for a mapped slot.
 *
 * ccall accepts four runtime type tags: 'number', 'string', 'boolean', 'bigint'.
 * Every 64-bit integer (TimestampTz, TimeADT, int64_t, size_t, H3Index, ...)
 * crosses as a BigInt. char* / text* are marshalled as JavaScript strings.
 * A pointer crosses as a BigInt too, through ptrArgType().
 * void params return null (no arg type).
 * Everything else (int, enum, double…) maps to 'number'.
 */
type EmType = 'number' | 'string' | 'bigint' | null;

function emArgType(m: Mapped): EmType {
	if (m.kind === 'string' || m.kind === 'text') return 'string';
	if (is64(m)) return 'bigint';
	if (m.kind === 'void') return null;
	return 'number';
}

/**
 * Emscripten ccall return type tag for a mapped result.
 *
 * Every 64-bit integer comes back as 'bigint', strings as 'string', every other
 * scalar (bool-as-int, int, enum, double) as 'number'.  Void returns null.
 */
function emRetType(m: Mapped): EmType {
	if (m.kind === 'void') return null;
	if (m.kind === 'string' || m.kind === 'text') return 'string';
	if (is64(m)) return 'bigint';
	return 'number';
}

/**
 * The TypeScript type of a mapped slot (see TypeMap.map).
 *
 *   bool               -> boolean
 *   TimestampTz        -> TimestampTz  (alias for number, microseconds since 2000-01-01 UTC)
 *   DateADT            -> DateADT      (alias for number, days since 2000-01-01)
 *   char* / text*      -> string
 *   T* / T**           -> Ptr          (opaque WASM linear memory address)
 *   a slot `typedef`   -> that name    (alias for bigint over 64 bits, e.g. H3Index)
 *   every other scalar -> number
 */
function tsType(m: Mapped): string {
	return m.ts;
}

/**
 * Builds the JavaScript expression used to forward a TS wrapper param to ccall.
 *
 * ccall expects:
 *   bool        				-> 1 / 0      (not true/false)
 *   64-bit integer held as number 	-> BigInt(n)  (ccall bigint arg)
 *   everything else 			-> pass through unchanged
 */
function toCallArg(name: string, m: Mapped): string {
	if (m.kind === 'bool') return `${name} ? 1 : 0`;
	if (is64(m) && types.ownTypes.get(m.ts) !== 'bigint') return `BigInt(${name})`;
	return name;
}

/** The expression a wrapper returns for a scalar ccall hands back as 'number'. */
function fromNumber(m: Mapped, expr: string): string {
	// ccall reads a wasm i32 as signed, so an unsigned 32-bit value above 2^31
	// arrives negative until it is read as unsigned.
	return m.kind === 'uint32' ? `(${expr}) >>> 0` : expr;
}

/**
 * TypeScript reserved words that must be renamed when used as param names.
 * A trailing underscore is appended (e.g. "type" -> "type_").
 */
const TS_KEYWORDS = new Set([
	'break',
	'case',
	'catch',
	'class',
	'const',
	'continue',
	'debugger',
	'default',
	'delete',
	'do',
	'else',
	'enum',
	'export',
	'extends',
	'false',
	'finally',
	'for',
	'function',
	'if',
	'import',
	'in',
	'instanceof',
	'new',
	'null',
	'return',
	'super',
	'switch',
	'this',
	'throw',
	'true',
	'try',
	'typeof',
	'var',
	'void',
	'while',
	'with',
	'as',
	'implements',
	'interface',
	'let',
	'package',
	'private',
	'protected',
	'public',
	'static',
	'yield',
	'type',
	'declare',
]);

const safeName = (n: string) => (TS_KEYWORDS.has(n) ? `${n}_` : n);

/**
 * Generates the exported TypeScript function that calls the _w C wrapper via ccall.
 *
 * Two code paths mirror those in generateCWrapper:
 *
 * 1. bool+result pattern: the "result" param is removed from the TS signature
 *    and the return type is replaced with the actual value type.
 *
 *    Example: stbox_xmax:
 *      export function stbox_xmax(box: Ptr): number {
 *        return call<number>('stbox_xmax_w', 'number', ['number'], [box]);
 *      }
 *
 * 2. Normal path: return type determines the ccall tag and TS return type:
 *    - void    		-> call with no return value
 *    - bool    		-> ccall returns 'number'; compare !== 0 for boolean
 *    - char*   		-> ccall returns 'string'
 *    - text*   		-> same as char* (the C wrapper already called text_to_cstring)
 *    - all other types -> ccall returns 'number' (int, double, Ptr…)
 *
 *    Example: tbool_in (string input):
 *      export function tbool_in(input: string): Ptr {
 *        return call<Ptr>('tbool_in_w', 'number', ['string'], [input]);
 *      }
 */
function generateTsWrapper(fn: IdlFunction): string {
	const sizeOut = stringSizeOut(fn);
	if (sizeOut) return generateSizedStringWrapper(fn, sizeOut);
	const boolResult = detectBoolResult(fn);
	const resultParam = boolResult?.resultParam;
	const visible = fn.params.filter(
		p => p !== resultParam && !OUTPUT_SIZE_PARAMS.has(p.name)
	);
	const params = visible
		.map(p => `${safeName(p.name)}: ${tsType(argOf(fn, p))}`)
		.join(', ');
	const argTypes = `[${visible
		.map(p => {
			const m = argOf(fn, p);
			if (m.ts === 'Ptr') return 'ptrArgType()';
			const t = emArgType(m);
			return t === null ? 'null' : `'${t}'`;
		})
		.join(', ')}]`;
	const argVals = `[${visible.map(p => {
		const m = argOf(fn, p);
		if (m.ts === 'Ptr') return `ptrArgVal(${safeName(p.name)})`;
		return toCallArg(safeName(p.name), m);
	}).join(', ')}]`;

	if (boolResult) {
		const { result, tsWrapRet } = boolResult;
		const lines = [`export function ${fn.name}(${params}): ${tsWrapRet} {`];
		if (tsWrapRet === 'Ptr') {
			lines.push(`\tconst _r = callPtr('${fn.name}_w', ${argTypes}, ${argVals});`);
		} else if (tsWrapRet === 'boolean') {
			lines.push(
				`\tconst _r = call<number>('${fn.name}_w', 'number', ${argTypes}, ${argVals}) !== 0;`
			);
		} else if (is64(result)) {
			lines.push(
				`\tconst _r = ${from64(result, `call<bigint>('${fn.name}_w', 'bigint', ${argTypes}, ${argVals})`)};`
			);
		} else {
			lines.push(
				`\tconst _r = ${fromNumber(result, `call<${tsWrapRet}>('${fn.name}_w', 'number', ${argTypes}, ${argVals})`)};`
			);
		}
		lines.push(`\tcheckMeosError();`);
		lines.push(`\treturn _r;`);
		lines.push('}');
		return lines.join('\n');
	}

	const ret = retOf(fn);
	const retTs = tsType(ret);
	const emRet = emRetType(ret);
	const emRetStr = emRet === null ? 'null' : `'${emRet}'`;

	const lines: string[] = [`export function ${fn.name}(${params}): ${retTs} {`];
	if (ret.kind === 'void') {
		lines.push(`\tcall<void>('${fn.name}_w', null, ${argTypes}, ${argVals});`);
		lines.push(`\tcheckMeosError();`);
	} else if (ret.kind === 'bool') {
		lines.push(
			`\tconst _r = call<number>('${fn.name}_w', 'number', ${argTypes}, ${argVals}) !== 0;`
		);
		lines.push(`\tcheckMeosError();`);
		lines.push(`\treturn _r;`);
	} else if (ret.kind === 'string' || ret.kind === 'text') {
		lines.push(
			`\tconst _r = call<string>('${fn.name}_w', 'string', ${argTypes}, ${argVals});`
		);
		lines.push(`\tcheckMeosError();`);
		lines.push(`\treturn _r;`);
	} else if (retTs === 'Ptr') {
		lines.push(`\tconst _r = callPtr('${fn.name}_w', ${argTypes}, ${argVals});`);
		lines.push(`\tcheckMeosError();`);
		lines.push(`\treturn _r;`);
	} else if (is64(ret)) {
		lines.push(
			`\tconst _r = ${from64(ret, `call<bigint>('${fn.name}_w', 'bigint', ${argTypes}, ${argVals})`)};`
		);
		lines.push(`\tcheckMeosError();`);
		lines.push(`\treturn _r;`);
	} else {
		lines.push(
			`\tconst _r = ${fromNumber(ret, `call<${retTs}>('${fn.name}_w', ${emRetStr}, ${argTypes}, ${argVals})`)};`
		);
		lines.push(`\tcheckMeosError();`);
		lines.push(`\treturn _r;`);
	}
	lines.push('}');
	return lines.join('\n');
}

// -------------------------------------------------------------------------
// ENTRY POINT
// -------------------------------------------------------------------------

/**
 * What the generator does with each public function, decided in this one place
 * for both the flat surface main() writes and the signatures the object layer
 * (ObjectGenerator.ts) builds its methods on, so the two cannot disagree about
 * which functions have a wrapper.
 */
type Verdict = 'emit' | 'manual' | 'duplicate' | 'skip';

function* classify(fns: IdlFunction[]): Generator<{ fn: IdlFunction; verdict: Verdict; reason?: string }> {
	const seen = new Set<string>();
	for (const fn of fns) {
		if (MANUAL_FUNCTIONS.has(fn.name)) {
			yield { fn, verdict: 'manual' };
			continue;
		}
		const key = `${fn.name}#${fn.params.length}`;
		if (seen.has(key)) {
			yield { fn, verdict: 'duplicate' };
			continue;
		}
		seen.add(key);
		const reason = shouldSkip(fn);
		yield reason ? { fn, verdict: 'skip', reason } : { fn, verdict: 'emit' };
	}
}

/** The catalog path the generators read, staged by tools/refresh.conf. */
export const IDL_PATH = path.resolve(__dirname, 'res/meos-idl.json');

/** One parameter of an emitted TypeScript wrapper. */
export interface WrapperParam {
	/** The parameter's name in the catalog. */
	name: string;
	/** Its name in the TypeScript wrapper. */
	tsName: string;
	/** The TypeScript type the wrapper takes. */
	ts: string;
	/** The slot's type as the catalog states it. */
	canonical: string;
	/** How the slot crosses the boundary. */
	kind: Kind;
}

/** The signature of one emitted TypeScript wrapper, as main() writes it. */
export interface WrapperSignature {
	params: WrapperParam[];
	/** The TypeScript type the wrapper answers. */
	ret: string;
	/** How the answer crossed the boundary. */
	retKind: Kind;
	/**
	 * The catalog type of the value the wrapper answers: the return's, or for
	 * the bool+result idiom the type MEOS writes through `result`, which the
	 * wrapper answers in place of the flag.
	 */
	retCanonical: string;
	/** The wrapper answers the value of a bool+result call (absent as 0/null). */
	folded: boolean;
}

/**
 * The signature of every wrapper the flat surface emits, keyed by C function
 * name, computed by the same classification and type map main() uses.
 */
export function emittedSignatures(idl: Idl): Map<string, WrapperSignature> {
	types = new TypeMap(idl);
	const out = new Map<string, WrapperSignature>();
	const fns = (idl.functions ?? []).filter(f => f.api === 'public');
	for (const { fn, verdict } of classify(fns)) {
		if (verdict !== 'emit') continue;
		const sizeOut = stringSizeOut(fn);
		const boolResult = sizeOut ? null : detectBoolResult(fn);
		const visible = fn.params.filter(
			p => p !== boolResult?.resultParam && p.name !== sizeOut && !OUTPUT_SIZE_PARAMS.has(p.name)
		);
		const params = visible.map(p => {
			const m = argOf(fn, p);
			return { name: p.name, tsName: safeName(p.name), ts: m.ts, canonical: p.canonical, kind: m.kind };
		});
		if (boolResult) {
			out.set(fn.name, {
				params, ret: boolResult.tsWrapRet, retKind: boolResult.result.kind,
				retCanonical: clean(boolResult.resultParam.canonical).replace(/\*\s*$/, '').trim(),
				folded: true,
			});
		} else {
			const r = retOf(fn);
			out.set(fn.name, {
				params, ret: sizeOut ? 'string' : r.ts, retKind: sizeOut ? 'string' : r.kind,
				retCanonical: clean(fn.returnType.canonical), folded: false,
			});
		}
	}
	stopOnUnresolvedTypes();
	return out;
}

/** The types of their own the last emittedSignatures() run named, sorted. */
export function ownTypeNames(): string[] {
	return [...types.ownTypes.keys()].sort();
}

export type { Idl, IdlFunction, Kind };

function main(): void {
	const idlPath = IDL_PATH;
	const bindingsPath = path.resolve(__dirname, '../core/c-src/bindings.c');
	const functionsPath = path.resolve(__dirname, '../core/functions/functions.generated.ts');

	console.log('Reading IDL:', idlPath);
	const idl: Idl = JSON.parse(fs.readFileSync(idlPath, 'utf-8'));
	types = new TypeMap(idl);

	// The emitted surface is every function the catalog calls public. `api` is
	// derived from the @ingroup doxygen tag in MEOS's own sources, so the binding
	// asks MEOS what it publishes rather than deciding from the header a symbol
	// happens to be declared in.
	//
	// The preamble is the set of headers those functions come from, taken from the
	// catalog too. A header list written here is a copy of that set kept by hand,
	// and it goes stale in one direction only: a family MobilityDB adds is absent
	// from the copy, so its whole surface is dropped with nothing reporting it.
	// MEOS installs a family's umbrella only when the family is built, and the
	// image builds them all, so every header named here is present.
	const fns: IdlFunction[] = (idl.functions ?? []).filter(f => f.api === 'public');

	const includes = [...new Set(fns.map(f => f.file))].sort()
		.map(h => `#include <${h}>`).join('\n');
	// The marker banner is emitted here rather than stored in the source templates
	// (which are hand-edited). Its text is assembled from parts so this generator is
	// not itself flagged by tooling that scans for the marker.
	const BANNER = '/* AUTO-GENERATED - DO NOT ' + 'EDIT. Run: npm run generate */\n';
	let cOut = BANNER + fs.readFileSync(
		path.resolve(__dirname, 'res/bindings_c_header.c.template'),
		'utf-8'
	).replace('/* @GENERATED_INCLUDES@ */', includes);
	let tsOut = BANNER + fs.readFileSync(
		path.resolve(__dirname, 'res/functions_ts_header.ts.template'),
		'utf-8'
	);

	const tsHeaderEnd = tsOut.length;
	const stats = { generated: 0, skipped: 0, manual: 0, duplicates: 0 };
	let lastFile = '';

	for (const { fn, verdict, reason } of classify(fns)) {
		if (verdict === 'manual') {
			stats.manual++;
			continue;
		}
		if (verdict === 'duplicate') {
			stats.duplicates++;
			continue;
		}
		if (verdict === 'skip') {
			cOut += `/* SKIP ${fn.name}: ${reason} */\n`;
			tsOut += `// SKIP ${fn.name}: ${reason}\n`;
			stats.skipped++;
			continue;
		}

		if (fn.file !== lastFile) {
			cOut += `\n/* === ${fn.file} === */\n\n`;
			tsOut += `\n// === ${fn.file} ===\n\n`;
			lastFile = fn.file;
		}

		cOut += generateCWrapper(fn) + '\n\n';
		tsOut += generateTsWrapper(fn) + '\n\n';
		stats.generated++;
	}

	stopOnUnresolvedTypes();

	// Each type of its own a slot `typedef` names is declared once, as an alias
	// of the TypeScript type its width crosses as.
	const ownTypes = [...types.ownTypes].sort(([a], [b]) => a.localeCompare(b))
		.map(([name, ts]) => `export type ${name} = ${ts};\n`).join('');
	if (ownTypes)
		tsOut = tsOut.slice(0, tsHeaderEnd) +
			'\n// --- Types of their own the catalog names over a width ---\n\n' +
			ownTypes + tsOut.slice(tsHeaderEnd);

	assertEveryWrapperChecksForErrors(tsOut);

	fs.writeFileSync(bindingsPath, cOut);
	fs.writeFileSync(functionsPath, tsOut);

	console.log(
		`Done.  Generated: ${stats.generated}  Skipped: ${stats.skipped}  Manual: ${stats.manual}  Duplicates: ${stats.duplicates}`
	);
	console.log('  ->', bindingsPath);
	console.log('  ->', functionsPath);
}

/**
 * Fail generation if any slot of an emitted function has a type the catalog
 * does not resolve (see TypeMap): a wrapper over a type the generator guessed
 * marshals a value ccall reads differently from how MEOS writes it, which no
 * error state reports.
 */
function stopOnUnresolvedTypes(): void {
	const unresolved = [...new Set(types.unresolved)];
	if (unresolved.length === 0) return;
	console.error(
		`\nERROR: ${unresolved.length} slot(s) have a type the catalog does not resolve:\n` +
		unresolved.map((u) => `  - ${u}`).join('\n') +
		'\n\nA slot maps from its `canonical` type, a name the catalog keeps resolving through ' +
		'its top-level `typedefs`. Regenerate the catalog with a MEOS-API that states them, or ' +
		'map the C type in C_WIDTHS.\n'
	);
	process.exit(1);
}

/**
 * Fail generation if any emitted wrapper calls into MEOS without consulting the
 * error state afterwards.
 *
 * MEOS reports a failure out of band and returns a sentinel that is a valid
 * value of the wrapper's own return type -- 0 is a real TimestampTz, false is a
 * real answer -- so a caller reading only the value cannot tell a failure from a
 * result. Every generated wrapper emits the check, which leaves the hand-written
 * ones in the template as the only place the invariant can lapse; this asserts
 * over the whole emitted file so it cannot lapse silently.
 *
 * ALLOWED lists the wrappers that must not check, each for a reason: meos_free
 * runs on cleanup paths, and checkMeosError() clears the state as it reads it,
 * so checking there consumes an error the next real call is meant to raise.
 * Growing this list is a decision, which is the point of it being explicit.
 */
function assertEveryWrapperChecksForErrors(tsOut: string): void {
	const ALLOWED = new Set(['meos_free', 'checkMeosError', 'call', 'callPtr']);
	const offenders: string[] = [];

	for (const block of tsOut.split(/\n(?=export function )/)) {
		const name = /^export function (\w+)/.exec(block)?.[1];
		if (!name || ALLOWED.has(name)) continue;
		const callsMeos = /\bcall(<[^>]*>)?\(|\bcallPtr\(/.test(block);
		// readString checks once the writer it is given has returned
		const checks = block.includes('checkMeosError()') || block.includes('return readString(');
		if (callsMeos && !checks) offenders.push(name);
	}

	if (offenders.length > 0) {
		console.error(
			`\nERROR: ${offenders.length} wrapper(s) call MEOS without checkMeosError():\n` +
			offenders.map((n) => `  - ${n}`).join('\n') +
			'\n\nA MEOS sentinel is a valid value of the return type, so the error state is the ' +
			'only way a caller can tell a failure from a result. Add checkMeosError() after the ' +
			'call, or add the name to ALLOWED with the reason it must not check.\n'
		);
		process.exit(1);
	}
}

// Run only when invoked as a script, so ObjectGenerator.ts can import the
// signatures without regenerating the flat surface.
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
