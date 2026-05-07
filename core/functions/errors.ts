// --- Error level constants (mirror PostgreSQL severity) ---

export const MEOS_NOTICE  = 18;
export const MEOS_WARNING = 19;
export const MEOS_ERROR   = 21;

// --- Error code constants (from meos.h) ---

export const MEOS_ERR_INTERNAL_ERROR        = 1;
export const MEOS_ERR_INTERNAL_TYPE_ERROR   = 2;
export const MEOS_ERR_VALUE_OUT_OF_RANGE    = 3;
export const MEOS_ERR_DIVISION_BY_ZERO      = 4;
export const MEOS_ERR_MEMORY_ALLOC_ERROR    = 5;
export const MEOS_ERR_AGGREGATION_ERROR     = 6;
export const MEOS_ERR_DIRECTORY_ERROR       = 7;
export const MEOS_ERR_FILE_ERROR            = 8;
export const MEOS_ERR_INVALID_ARG           = 10;
export const MEOS_ERR_INVALID_ARG_TYPE      = 11;
export const MEOS_ERR_INVALID_ARG_VALUE     = 12;
export const MEOS_ERR_FEATURE_NOT_SUPPORTED = 13;
export const MEOS_ERR_MFJSON_INPUT          = 20;
export const MEOS_ERR_MFJSON_OUTPUT         = 21;
export const MEOS_ERR_TEXT_INPUT            = 22;
export const MEOS_ERR_TEXT_OUTPUT           = 23;
export const MEOS_ERR_WKB_INPUT             = 24;
export const MEOS_ERR_WKB_OUTPUT            = 25;
export const MEOS_ERR_GEOJSON_INPUT         = 26;
export const MEOS_ERR_GEOJSON_OUTPUT        = 27;

// --- Exception hierarchy ---

/**
 * Base class for all MEOS runtime errors.
 * Carries the raw error `code` (from `meos.h`) and `level` (PostgreSQL severity).
 */
export class MeosException extends Error {
	constructor(
		message: string,
		public readonly code: number,
		public readonly level: number,
	) {
		super(message);
		this.name = this.constructor.name;
	}

	override toString(): string {
		return `${this.name} (${this.code}): ${this.message}`;
	}
}

// ---- Internal errors -------------------------------------------------------

/** Unspecified internal MEOS error (code 1). */
export class MeosInternalError extends MeosException {}

/** Internal type mismatch in MEOS (code 2). */
export class MeosInternalTypeError extends MeosException {}

/** A numeric value is outside its valid range (code 3). */
export class MeosValueOutOfRangeError extends MeosException {}

/** Division by zero (code 4). */
export class MeosDivisionByZeroError extends MeosException {}

/** WASM/C heap allocation failure (code 5). */
export class MeosMemoryAllocError extends MeosException {}

/** Error during a temporal aggregation (code 6). */
export class MeosAggregationError extends MeosException {}

/** Filesystem directory error (code 7). */
export class MeosDirectoryError extends MeosException {}

/** Filesystem file error (code 8). */
export class MeosFileError extends MeosException {}

// ---- Argument errors -------------------------------------------------------

/** Abstract base for all invalid-argument errors. */
export class MeosArgumentError extends MeosException {}

/** Invalid argument (code 10). */
export class MeosInvalidArgError extends MeosArgumentError {}

/** Argument has the wrong type (code 11). */
export class MeosInvalidArgTypeError extends MeosArgumentError {}

/** Argument value is not accepted (code 12). */
export class MeosInvalidArgValueError extends MeosArgumentError {}

// ---- Feature ---------------------------------------------------------------

/** The requested feature is not supported (code 13). */
export class MeosFeatureNotSupported extends MeosException {}

// ---- I/O errors ------------------------------------------------------------

/** Abstract base for all serialisation/deserialisation errors. */
export class MeosIoError extends MeosException {}

/** MF-JSON input parsing error (code 20). */
export class MeosMfJsonInputError extends MeosIoError {}

/** MF-JSON output serialisation error (code 21). */
export class MeosMfJsonOutputError extends MeosIoError {}

/** WKT/text input parsing error (code 22). */
export class MeosTextInputError extends MeosIoError {}

/** WKT/text output serialisation error (code 23). */
export class MeosTextOutputError extends MeosIoError {}

/** WKB input parsing error (code 24). */
export class MeosWkbInputError extends MeosIoError {}

/** WKB output serialisation error (code 25). */
export class MeosWkbOutputError extends MeosIoError {}

/** GeoJSON input parsing error (code 26). */
export class MeosGeoJsonInputError extends MeosIoError {}

/** GeoJSON output serialisation error (code 27). */
export class MeosGeoJsonOutputError extends MeosIoError {}

// --- Dispatch ---------------------------------------------------------------

type ExceptionCtor = new (message: string, code: number, level: number) => MeosException;

const EXCEPTION_MAP = new Map<number, ExceptionCtor>([
	[MEOS_ERR_INTERNAL_ERROR,        MeosInternalError],
	[MEOS_ERR_INTERNAL_TYPE_ERROR,   MeosInternalTypeError],
	[MEOS_ERR_VALUE_OUT_OF_RANGE,    MeosValueOutOfRangeError],
	[MEOS_ERR_DIVISION_BY_ZERO,      MeosDivisionByZeroError],
	[MEOS_ERR_MEMORY_ALLOC_ERROR,    MeosMemoryAllocError],
	[MEOS_ERR_AGGREGATION_ERROR,     MeosAggregationError],
	[MEOS_ERR_DIRECTORY_ERROR,       MeosDirectoryError],
	[MEOS_ERR_FILE_ERROR,            MeosFileError],
	[MEOS_ERR_INVALID_ARG,           MeosInvalidArgError],
	[MEOS_ERR_INVALID_ARG_TYPE,      MeosInvalidArgTypeError],
	[MEOS_ERR_INVALID_ARG_VALUE,     MeosInvalidArgValueError],
	[MEOS_ERR_FEATURE_NOT_SUPPORTED, MeosFeatureNotSupported],
	[MEOS_ERR_MFJSON_INPUT,          MeosMfJsonInputError],
	[MEOS_ERR_MFJSON_OUTPUT,         MeosMfJsonOutputError],
	[MEOS_ERR_TEXT_INPUT,            MeosTextInputError],
	[MEOS_ERR_TEXT_OUTPUT,           MeosTextOutputError],
	[MEOS_ERR_WKB_INPUT,             MeosWkbInputError],
	[MEOS_ERR_WKB_OUTPUT,            MeosWkbOutputError],
	[MEOS_ERR_GEOJSON_INPUT,         MeosGeoJsonInputError],
	[MEOS_ERR_GEOJSON_OUTPUT,        MeosGeoJsonOutputError],
]);

/**
 * Constructs the most specific `MeosException` subclass for the given error code.
 * Falls back to the base `MeosException` for unknown codes.
 */
export function makeMeosException(code: number, level: number, message: string): MeosException {
	const Ctor = EXCEPTION_MAP.get(code) ?? MeosException;
	return new Ctor(message, code, level);
}
