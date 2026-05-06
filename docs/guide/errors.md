# Error Handling

When MEOS encounters a problem — malformed input, an out-of-range index, an unsupported
operation — it sets internal C globals that MEOS.js reads after every wrapper call.
`checkMeosError()` translates those globals into a typed JavaScript exception and throws it.

## Exception hierarchy

All MEOS exceptions extend `MeosException`, which itself extends the standard `Error`:

```
Error
└── MeosException          base class — carries .code and .level
    ├── MeosInternalError              code 1  — unspecified internal error
    ├── MeosInternalTypeError          code 2  — internal type mismatch
    ├── MeosValueOutOfRangeError       code 3  — numeric value out of range
    ├── MeosDivisionByZeroError        code 4  — division by zero
    ├── MeosMemoryAllocError           code 5  — heap allocation failure
    ├── MeosAggregationError           code 6  — temporal aggregation error
    ├── MeosDirectoryError             code 7  — filesystem directory error
    ├── MeosFileError                  code 8  — filesystem file error
    ├── MeosArgumentError              abstract base for argument errors
    │   ├── MeosInvalidArgError        code 10 — invalid argument
    │   ├── MeosInvalidArgTypeError    code 11 — wrong argument type
    │   └── MeosInvalidArgValueError   code 12 — argument value not accepted
    ├── MeosFeatureNotSupported        code 13 — feature not implemented
    └── MeosIoError                    abstract base for I/O errors
        ├── MeosMfJsonInputError       code 20 — MF-JSON parse error
        ├── MeosMfJsonOutputError      code 21 — MF-JSON serialisation error
        ├── MeosTextInputError         code 22 — WKT parse error
        ├── MeosTextOutputError        code 23 — WKT serialisation error
        ├── MeosWkbInputError          code 24 — WKB parse error
        ├── MeosWkbOutputError         code 25 — WKB serialisation error
        ├── MeosGeoJsonInputError      code 26 — GeoJSON parse error
        └── MeosGeoJsonOutputError     code 27 — GeoJSON serialisation error
```

## Catching errors

Because every class extends `MeosException`, you can catch at any level of the hierarchy:

```ts
import {
    MeosException,
    MeosTextInputError,
    MeosIoError,
    IntSet,
} from 'meos.js';

// Catch a specific error type
try {
    const s = IntSet.fromString('not-a-set');
} catch (err) {
    if (err instanceof MeosTextInputError) {
        console.error('Invalid WKT input:', err.message);
    }
}

// Catch any I/O error (text, WKB, MF-JSON, GeoJSON)
try {
    const s = IntSet.fromHexWKB('DEADBEEF');
} catch (err) {
    if (err instanceof MeosIoError) {
        console.error(`I/O error [code ${err.code}]:`, err.message);
    }
}

// Catch any MEOS error
try {
    const s = IntSet.fromString('bad');
} catch (err) {
    if (err instanceof MeosException) {
        console.error(err.toString());
        // prints: MeosTextInputError (22): Could not parse ...
    }
}
```

## Exception properties

Every `MeosException` exposes:

| Property | Type | Description |
|---|---|---|
| `message` | `string` | Human-readable error message from MEOS |
| `code` | `number` | MEOS error code (mirrors `meos.h`) |
| `level` | `number` | PostgreSQL severity (21 for errors) |
| `name` | `string` | Class name, e.g. `"MeosTextInputError"` |

```ts
try {
    IntSet.fromString('bad');
} catch (err) {
    if (err instanceof MeosException) {
        console.log(err.name);    // "MeosTextInputError"
        console.log(err.code);    // 22
        console.log(err.level);   // 21
        console.log(err.message); // "Could not parse ..."
    }
}
```

## Notices and warnings

Not every MEOS message is a fatal error. MEOS uses PostgreSQL severity levels:

| Level | Value | MEOS.js behaviour |
|---|---|---|
| NOTICE | 18 | `console.info(...)` — execution continues |
| WARNING | 19 | `console.warn(...)` — execution continues |
| ERROR | 21 | throws a `MeosException` subclass |

Notices and warnings are logged automatically; you do not need to handle them.

## Error codes reference

| Code | Constant | Class |
|---|---|---|
| 1 | `MEOS_ERR_INTERNAL_ERROR` | `MeosInternalError` |
| 2 | `MEOS_ERR_INTERNAL_TYPE_ERROR` | `MeosInternalTypeError` |
| 3 | `MEOS_ERR_VALUE_OUT_OF_RANGE` | `MeosValueOutOfRangeError` |
| 4 | `MEOS_ERR_DIVISION_BY_ZERO` | `MeosDivisionByZeroError` |
| 5 | `MEOS_ERR_MEMORY_ALLOC_ERROR` | `MeosMemoryAllocError` |
| 6 | `MEOS_ERR_AGGREGATION_ERROR` | `MeosAggregationError` |
| 7 | `MEOS_ERR_DIRECTORY_ERROR` | `MeosDirectoryError` |
| 8 | `MEOS_ERR_FILE_ERROR` | `MeosFileError` |
| 10 | `MEOS_ERR_INVALID_ARG` | `MeosInvalidArgError` |
| 11 | `MEOS_ERR_INVALID_ARG_TYPE` | `MeosInvalidArgTypeError` |
| 12 | `MEOS_ERR_INVALID_ARG_VALUE` | `MeosInvalidArgValueError` |
| 13 | `MEOS_ERR_FEATURE_NOT_SUPPORTED` | `MeosFeatureNotSupported` |
| 20 | `MEOS_ERR_MFJSON_INPUT` | `MeosMfJsonInputError` |
| 21 | `MEOS_ERR_MFJSON_OUTPUT` | `MeosMfJsonOutputError` |
| 22 | `MEOS_ERR_TEXT_INPUT` | `MeosTextInputError` |
| 23 | `MEOS_ERR_TEXT_OUTPUT` | `MeosTextOutputError` |
| 24 | `MEOS_ERR_WKB_INPUT` | `MeosWkbInputError` |
| 25 | `MEOS_ERR_WKB_OUTPUT` | `MeosWkbOutputError` |
| 26 | `MEOS_ERR_GEOJSON_INPUT` | `MeosGeoJsonInputError` |
| 27 | `MEOS_ERR_GEOJSON_OUTPUT` | `MeosGeoJsonOutputError` |

All constants and classes are exported from the top-level `meos.js` package.
