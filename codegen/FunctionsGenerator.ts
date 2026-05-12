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
 * The IDL (meos-idl.json) is produced by a separate C-header extraction script
 * and contains a "functions" array where each entry carries:
 *   name        -> C function name
 *   file        -> originating header (meos.h / meos_geo.h)
 *   returnType  -> { c: string, canonical: string }
 *   params      -> [{ name, cType, canonical }]
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
}
interface Param {
	name: string;
	cType: string;
	canonical: string;
}
interface IdlFunction {
	name: string;
	file: string;
	returnType: ReturnType;
	params: Param[];
}
interface IdlEnum {
	name: string;
}
interface Idl {
	functions: IdlFunction[];
	enums?: IdlEnum[];
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
 *       temporal_as_hexwkb  collapses the WKB variant enum + hides size_out
 *       temporal_as_mfjson  converts an empty srs string to a C NULL pointer
 *       temporal_instant_n  adjusts from 0-based JS indexing to 1-based MEOS
 *       temporal_duration   returns Interval* — re-exposed as
 *                           temporal_duration_us (total microseconds) instead
 *
 *   - PostgreSQL text utilities: cstring2text / text2cstring are used
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
	'cstring2text',
	'text2cstring',
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
	// textset_value_n returns text* (PostgreSQL varlena); custom wrapper converts to cstring.
	'textset_value_n',
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
// TYPE PREDICATES
// -------------------------------------------------------------------------

/**
 * Strips "const" qualifiers and normalises whitespace so that all predicates
 * below work on a canonical form of the C type string.
 */
const clean = (t: string) 		=> t.replace(/\bconst\b/g, '').replace(/\s+/g, ' ').trim();

const isBool = (t: string) 		=> clean(t) === 'bool';
const isTsTz = (t: string)		=> clean(t) === 'TimestampTz';
const isTs = (t: string) 		=> clean(t) === 'Timestamp';
const isDateADT = (t: string) 	=> clean(t) === 'DateADT';
const isVoid = (t: string) 		=> clean(t) === 'void';
const isInt64 = (t: string) => {
	const c = clean(t);
	return c === 'int64' || c === 'int64_t' || c === 'uint64' || c === 'uint64_t';
};

const isString = (t: string) => {
	const c = clean(t);
	return c === 'char *' || c === 'char*';
};
const isDouble = (t: string) => {
	const c = clean(t);
	return c === 'double' || c === 'float8';
};
const isFloat = (t: string) => {
	const c = clean(t);
	return c === 'float' || c === 'float4';
};

/** Detects C function-pointer params such as "void (*callback)(void *)". */
const isFuncPtr = (t: string) => t.includes('(*)');

/** True for any type containing "**" (pointer-to-pointer or array-of-pointers). */
const isDblPtr = (t: string) => clean(t).includes('**');

/** True for raw WKB byte-buffer returns (uint8_t * / uint8 *). */
const isRawBytes = (t: string) => {
	const c = clean(t);
	return c === 'uint8_t *' || c === 'uint8 *';
};

/**
 * True only for the PostgreSQL Interval struct passed by value.
 * "Interval *" (pointer) is NOT matched here, it is treated as an opaque
 * Ptr like any other single pointer, so functions that take or return
 * Interval* are generated normally.
 */
const isInterval = (t: string) => clean(t) === 'Interval';

/**
 * True for the PostgreSQL text type passed as a single pointer (text *).
 * These require cstring2text / text2cstring conversion in the C wrapper
 * so that the JS side always works with plain char* strings.
 */
const isTextSingle = (t: string) => {
	const c = clean(t);
	return c === 'text *' || c === 'text*';
};

/**
 * True for text** (array of PostgreSQL text pointers).
 * These are passed through as opaque Ptr without string conversion.
 */
const isTextDouble = (t: string) => {
	const c = clean(t);
	return c === 'text **' || c === 'text**';
};

/** True for any single-pointer type that is not a double pointer. */
const isPtr = (t: string) => clean(t).endsWith('*') && !isDblPtr(t);

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
	/** Dereferenced base C type written into *result (e.g. "int64", "double", "Set *"). */
	resultBaseType: string;
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
	if (!isBool(fn.returnType.c)) return null;

	// A "result" param must be either a single or double pointer.
	const rp = fn.params.find(
		p => p.name === 'result' && (isPtr(p.cType) || isDblPtr(p.cType))
	);
	if (!rp) return null;

	// Double-pointer case: bool fn(..., T **result) -> wrapper returns T*
	if (isDblPtr(rp.cType)) {
		const ptrType = clean(rp.cType).replace(/\*$/, '').trim();
		return {
			resultParam: rp,
			resultBaseType: ptrType,
			cWrapRet: ptrType,
			tsWrapRet: 'Ptr',
		};
	}

	// Single-pointer case: bool fn(..., T *result) -> wrapper returns T
	const base = clean(rp.cType).replace(/\*$/, '').trim();

	// Map the dereferenced C base type to its C wrapper return type.
	let cRet: string;
	if (base === 'int64' || base === 'int64_t') 
		cRet = 'long long';

	else if (base === 'TimestampTz' || base === 'Timestamp') 
		cRet = 'long long';

	else if (base === 'double' || base === 'float8') 
		cRet = 'double';

	else if (base === 'bool') 
		cRet = 'int';

	else cRet = base;

	// Map the dereferenced C base type to its TypeScript return type.
	let tsRet: string;
	if (base === 'TimestampTz')
		tsRet = 'TimestampTz';

	else if (base === 'DateADT')
		tsRet = 'DateADT';

	else if (base === 'double' || base === 'float8' || base === 'float')
		tsRet = 'number';

	else if (base === 'bool')
		tsRet = 'boolean';

	else tsRet = 'number';

	return {
		resultParam: rp,
		resultBaseType: base,
		cWrapRet: cRet,
		tsWrapRet: tsRet,
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
 * every unresolvable pointer type to java.Pointer.
 *
 * The only cases that remain un-generatable are:
 *
 *   - Function-pointer params: Emscripten cannot marshal C function pointers
 *     automatically.  These require hand-written wrappers using
 *     Module.addFunction() and are listed in MANUAL_FUNCTIONS if needed.
 *
 *   - Interval by value (struct, no pointer): passing a C struct by value
 *     through Emscripten ccall is not supported.  Interval* (pointer) is
 *     handled normally as Ptr.
 */
function shouldSkip(fn: IdlFunction): string | null {
	for (const p of fn.params) {
		if (isFuncPtr(p.cType)) return `function-pointer param '${p.name}'`;
		if (isInterval(p.cType)) return `Interval by-value param '${p.name}'`;
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
 *   text *     -> const char *  (converted via cstring2text in the body)
 *   everything else passes through unchanged
 */
function cWrapParamType(cType: string): string {
	if (isBool(cType)) return 'int';
	if (isTsTz(cType) || isTs(cType)) return 'long long';
	if (isTextSingle(cType)) return 'const char *';
	return cType;
}

/**
 * Returns the C return type used in the _w function signature.
 *
 * Mirrors cWrapParamType for return types:
 *   bool   -> int
 *   TimestampTz/Timestamp → long long
 *   text * -> char *   (converted via text2cstring in the body)
 */
function cWrapRetType(cType: string): string {
	if (isBool(cType)) return 'int';
	if (isTsTz(cType) || isTs(cType)) return 'long long';
	if (isTextSingle(cType)) return 'char *';
	return cType;
}

/**
 * Builds the expression used to forward a _w param to the inner MEOS call.
 *
 * For most types the param name is passed as-is.  Special cases:
 *   bool        -> (bool) name         re-cast from int
 *   TimestampTz -> (TimestampTz) name  re-cast from long long
 *   Timestamp   -> (Timestamp) name
 *   text *      -> cstring2text(name)  convert C string to PG text*
 */
function cCastExpr(name: string, cType: string): string {
	if (isBool(cType)) return `(bool) ${name}`;
	if (isTsTz(cType)) return `(TimestampTz) ${name}`;
	if (isTs(cType)) return `(Timestamp) ${name}`;
	if (isTextSingle(cType)) return `cstring2text(${name})`;
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
 *    - text *  -> call text2cstring on the returned PG text pointer
 *    - all other types → return value directly
 *
 *    Example: text * return (text_lower):
 *      EMSCRIPTEN_KEEPALIVE
 *      char *text_lower_w(const char *txt) {
 *        text *_t = text_lower(cstring2text(txt));
 *        if (!_t) return NULL;
 *        return text2cstring(_t);
 *      }
 */
function generateCWrapper(fn: IdlFunction): string {
	const boolResult = detectBoolResult(fn);
	if (boolResult) {
		const { resultParam, resultBaseType, cWrapRet } = boolResult;
		const visible = fn.params.filter(
			p => p !== resultParam && !OUTPUT_SIZE_PARAMS.has(p.name)
		);
		const hasSzOut = fn.params.some(p => OUTPUT_SIZE_PARAMS.has(p.name));
		const sig = visible.map(p => `${cWrapParamType(p.cType)} ${p.name}`).join(', ');
		const args = fn.params
			.map(p => {
				if (p === resultParam) return '&r';
				if (OUTPUT_SIZE_PARAMS.has(p.name)) return '&sz';
				return cCastExpr(p.name, p.cType);
			})
			.join(', ');
		const zeroVal = cWrapRet === 'double' ? '0.0' : cWrapRet.endsWith('*') ? 'NULL' : '0';
		let castRet = 'r';
		if (
			resultBaseType === 'int64' ||
			resultBaseType === 'int64_t' ||
			resultBaseType === 'TimestampTz' ||
			resultBaseType === 'Timestamp'
		)
			castRet = '(long long) r';
		else if (resultBaseType === 'bool') castRet = '(int) r';
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

	const ret = fn.returnType.c;
	const wrapRet = cWrapRetType(ret);
	const visible = fn.params.filter(p => !OUTPUT_SIZE_PARAMS.has(p.name));
	const hasSzOut = fn.params.some(p => OUTPUT_SIZE_PARAMS.has(p.name));

	const sig = visible.map(p => `${cWrapParamType(p.cType)} ${p.name}`).join(', ');
	const args = fn.params
		.map(p => (OUTPUT_SIZE_PARAMS.has(p.name) ? '&sz' : cCastExpr(p.name, p.cType)))
		.join(', ');

	const lines: string[] = ['EMSCRIPTEN_KEEPALIVE', `${wrapRet} ${fn.name}_w(${sig}) {`];
	if (hasSzOut) lines.push('  size_t sz;');
	const callExpr = `${fn.name}(${args})`;
	if (isVoid(ret)) {
		lines.push(`  ${callExpr};`);
	} else if (isBool(ret)) {
		lines.push(`  return (int) ${callExpr};`);
	} else if (isTextSingle(ret)) {
		lines.push(`  text *_t = ${callExpr};`);
		lines.push(`  if (!_t) return NULL;`);
		lines.push(`  return text2cstring(_t);`);
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
 * Emscripten ccall argument type tag for a given C type.
 *
 * ccall accepts four runtime type tags: 'number', 'string', 'boolean', 'bigint'.
 * TimestampTz / Timestamp are int64 and must be passed as BigInt.
 * char* / text* are marshalled as JavaScript strings.
 * void params return null (no arg type).
 * Everything else (int, pointer, enum…) maps to 'number'.
 */
type EmType = 'number' | 'string' | 'bigint' | null;

function emArgType(cType: string): EmType {
	if (isString(cType) || isTextSingle(cType)) return 'string';
	if (isTsTz(cType) || isTs(cType) || isInt64(cType)) return 'bigint';
	if (isVoid(cType)) return null;
	return 'number';
}

/**
 * Emscripten ccall return type tag for a given C return type.
 *
 * All numeric types (bool-as-int, int, double, long long, pointer) are
 * represented as 'number' at the ccall boundary.  Strings come back as
 * 'string'.  Void returns null.
 */
function emRetType(cType: string): EmType {
	if (isVoid(cType)) return null;
	if (isString(cType) || isTextSingle(cType)) return 'string';
	if (isInt64(cType)) return 'bigint';
	return 'number';
}

/**
 * C integer types that map to TypeScript "number" (not Ptr).
 * Used in tsParamType to distinguish plain integers from opaque pointers.
 */
const INT_C_TYPES = new Set([
	'int',
	'int32',
	'int32_t',
	'uint32',
	'uint32_t',
	'int16',
	'int16_t',
	'uint16',
	'uint16_t',
	'int64',
	'int64_t',
	'uint64',
	'uint64_t',
	'int8',
	'int8_t',
	'uint8',
	'uint8_t',
	'size_t',
	'uintptr_t',
	'short',
	'long',
]);

/**
 * Maps a C param type to its TypeScript equivalent for the generated wrapper.
 *
 * Key mappings:
 *   bool           -> boolean
 *   TimestampTz    -> TimestampTz  (type alias for number, microseconds since 2000-01-01 UTC)
 *   Timestamp      -> number
 *   DateADT        -> DateADT      (type alias for number, days since 2000-01-01)
 *   double/float   -> number
 *   char* / text*  -> string
 *   T* / T**       -> Ptr          (opaque WASM linear memory address)
 *   integer types  -> number
 *   enums / other  -> number
 */
function tsParamType(cType: string): string {
	if (isBool(cType)) return 'boolean';
	if (isTsTz(cType)) return 'TimestampTz';
	if (isTs(cType)) return 'number';
	if (isDateADT(cType)) return 'DateADT';
	if (isDouble(cType) || isFloat(cType)) return 'number';
	if (isString(cType) || isTextSingle(cType)) return 'string';
	if (isPtr(cType) || isDblPtr(cType)) return 'Ptr';
	if (INT_C_TYPES.has(clean(cType))) return 'number';
	return 'number';
}

/** Maps a C return type to its TypeScript equivalent (delegates to tsParamType for non-void). */
function tsRetType(cType: string): string {
	if (isVoid(cType)) return 'void';
	return tsParamType(cType);
}

/**
 * Builds the JavaScript expression used to forward a TS wrapper param to ccall.
 *
 * ccall expects:
 *   bool        				-> 1 / 0      (not true/false)
 *   TimestampTz / Timestamp 	-> BigInt(n)  (ccall bigint arg)
 *   everything else 			-> pass through unchanged
 */
function toCallArg(name: string, cType: string): string {
	if (isBool(cType)) return `${name} ? 1 : 0`;
	if (isTsTz(cType) || isTs(cType) || isInt64(cType)) return `BigInt(${name})`;
	return name;
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
 *    - text*   		-> same as char* (the C wrapper already called text2cstring)
 *    - all other types -> ccall returns 'number' (int, double, Ptr…)
 *
 *    Example: tbool_in (string input):
 *      export function tbool_in(input: string): Ptr {
 *        return call<Ptr>('tbool_in_w', 'number', ['string'], [input]);
 *      }
 */
function generateTsWrapper(fn: IdlFunction): string {
	const boolResult = detectBoolResult(fn);
	if (boolResult) {
		const { resultParam, tsWrapRet } = boolResult;
		const visible = fn.params.filter(
			p => p !== resultParam && !OUTPUT_SIZE_PARAMS.has(p.name)
		);
		const params = visible
			.map(p => `${safeName(p.name)}: ${tsParamType(p.cType)}`)
			.join(', ');
		const argTypes = `[${visible
			.map(p => {
				if (tsParamType(p.cType) === 'Ptr') return 'ptrArgType()';
				const t = emArgType(p.cType);
				return t === null ? 'null' : `'${t}'`;
			})
			.join(', ')}]`;
		const argVals = `[${visible.map(p => {
			if (tsParamType(p.cType) === 'Ptr') return `ptrArgVal(${safeName(p.name)})`;
			return toCallArg(safeName(p.name), p.cType);
		}).join(', ')}]`;
		const { resultBaseType } = boolResult;
		const lines = [`export function ${fn.name}(${params}): ${tsWrapRet} {`];
		if (tsWrapRet === 'Ptr') {
			lines.push(`\tconst _r = callPtr('${fn.name}_w', ${argTypes}, ${argVals});`);
		} else if (tsWrapRet === 'boolean') {
			lines.push(
				`\tconst _r = call<number>('${fn.name}_w', 'number', ${argTypes}, ${argVals}) !== 0;`
			);
		} else if (isInt64(resultBaseType)) {
			lines.push(
				`\tconst _r = Number(call<bigint>('${fn.name}_w', 'bigint', ${argTypes}, ${argVals}));`
			);
		} else {
			lines.push(
				`\tconst _r = call<${tsWrapRet}>('${fn.name}_w', 'number', ${argTypes}, ${argVals});`
			);
		}
		lines.push(`\tcheckMeosError();`);
		lines.push(`\treturn _r;`);
		lines.push('}');
		return lines.join('\n');
	}

	const ret = fn.returnType.c;
	const visible = fn.params.filter(p => !OUTPUT_SIZE_PARAMS.has(p.name));

	const params = visible
		.map(p => `${safeName(p.name)}: ${tsParamType(p.cType)}`)
		.join(', ');
	const retTs = tsRetType(ret);
	const emRet = emRetType(ret);
	const emRetStr = emRet === null ? 'null' : `'${emRet}'`;
	const argTypes = `[${visible
		.map(p => {
			if (tsParamType(p.cType) === 'Ptr') return 'ptrArgType()';
			const t = emArgType(p.cType);
			return t === null ? 'null' : `'${t}'`;
		})
		.join(', ')}]`;
	const argVals = `[${visible.map(p => {
		if (tsParamType(p.cType) === 'Ptr') return `ptrArgVal(${safeName(p.name)})`;
		return toCallArg(safeName(p.name), p.cType);
	}).join(', ')}]`;

	const lines: string[] = [`export function ${fn.name}(${params}): ${retTs} {`];
	if (isVoid(ret)) {
		lines.push(`\tcall<void>('${fn.name}_w', null, ${argTypes}, ${argVals});`);
		lines.push(`\tcheckMeosError();`);
	} else if (isBool(ret)) {
		lines.push(
			`\tconst _r = call<number>('${fn.name}_w', 'number', ${argTypes}, ${argVals}) !== 0;`
		);
		lines.push(`\tcheckMeosError();`);
		lines.push(`\treturn _r;`);
	} else if (isString(ret) || isTextSingle(ret)) {
		lines.push(
			`\tconst _r = call<string>('${fn.name}_w', 'string', ${argTypes}, ${argVals});`
		);
		lines.push(`\tcheckMeosError();`);
		lines.push(`\treturn _r;`);
	} else if (retTs === 'Ptr') {
		lines.push(`\tconst _r = callPtr('${fn.name}_w', ${argTypes}, ${argVals});`);
		lines.push(`\tcheckMeosError();`);
		lines.push(`\treturn _r;`);
	} else if (isInt64(ret)) {
		lines.push(
			`\tconst _r = Number(call<bigint>('${fn.name}_w', 'bigint', ${argTypes}, ${argVals}));`
		);
		lines.push(`\tcheckMeosError();`);
		lines.push(`\treturn _r;`);
	} else {
		lines.push(
			`\tconst _r = call<${retTs}>('${fn.name}_w', ${emRetStr}, ${argTypes}, ${argVals});`
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

function main(): void {
	const idlPath = path.resolve(__dirname, 'res/meos-idl.json');
	const bindingsPath = path.resolve(__dirname, '../core/c-src/bindings.c');
	const functionsPath = path.resolve(__dirname, '../core/functions/functions.generated.ts');

	console.log('Reading IDL:', idlPath);
	const idl: Idl = JSON.parse(fs.readFileSync(idlPath, 'utf-8'));
	const fns: IdlFunction[] = idl.functions ?? [];

	let cOut = fs.readFileSync(
		path.resolve(__dirname, 'res/bindings_c_header.c.template'),
		'utf-8'
	);
	let tsOut = fs.readFileSync(
		path.resolve(__dirname, 'res/functions_ts_header.ts.template'),
		'utf-8'
	);

	const stats = { generated: 0, skipped: 0, manual: 0, duplicates: 0 };
	const seen = new Set<string>();
	let lastFile = '';

	for (const fn of fns) {
		if (MANUAL_FUNCTIONS.has(fn.name)) {
			stats.manual++;
			continue;
		}

		const key = `${fn.name}#${fn.params.length}`;
		if (!seen.add(key)) {
			stats.duplicates++;
			continue;
		}

		const reason = shouldSkip(fn);
		if (reason) {
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

	fs.writeFileSync(bindingsPath, cOut);
	fs.writeFileSync(functionsPath, tsOut);

	console.log(
		`Done.  Generated: ${stats.generated}  Skipped: ${stats.skipped}  Manual: ${stats.manual}  Duplicates: ${stats.duplicates}`
	);
	console.log('  ->', bindingsPath);
	console.log('  ->', functionsPath);
}

main();
