# MEOS.js

TypeScript/JavaScript bindings for [MEOS](https://libmeos.org/), the C library that powers [MobilityDB](https://mobilitydb.com/) spatiotemporal types.

MEOS is compiled to WebAssembly via [Emscripten](https://emscripten.org/). MEOS.js wraps the resulting `.wasm` module in a typed TypeScript API so you can work with temporal values (spans, span sets, sets, bounding boxes) in Node.js or the browser.

**Documentation:** https://nyuke235.github.io/MEOS.js/

## Table of contents
- [Requirements](#requirements)
- [Installation](#installation)
- [Memory management](#memory-management)
- [Implemented types](#implemented-types)

## Requirements

- **Node.js** 18+
- **Docker**: required only to build the WASM module from source; not needed if you use the prebuilt files

## Installation

### 1. Install Node dependencies

```bash
npm install
```

### 2. Get the WASM module

**Option A - build from source (Docker)**

```bash
# wasm64 (default)
docker build --output type=local,dest=./wasm --target wasm .

# wasm32
docker build --build-arg TARGET=wasm32 --output type=local,dest=./wasm --target wasm .
```

This produces `wasm/meos.js` and `wasm/meos.wasm`. The first build may take a while as it compiles GEOS, PROJ, SQLite, GSL, JSON-C, and MobilityDB from source.

**Option B - use the prebuilt files**

*todo*

### 3. Run the tests

```bash
npm test
```

## Memory management

Every MEOS.js object wraps a raw pointer allocated in WASM memory. This memory is **not** managed by the JavaScript garbage collector and must be freed explicitly.

**Option 1: manual `free()`**

```ts
const span = TsTzSpan.fromString('[2020-01-01, 2021-01-01)');
// ... use span ...
span.free();
```

**Option 2: `using` (recommended)**

All types implement `[Symbol.dispose]()`, so you can use the [Explicit Resource Management](https://github.com/tc39/proposal-explicit-resource-management) syntax. The object is freed automatically when the block exits, even if an exception is thrown.

```ts
{
    using span = TsTzSpan.fromString('[2020-01-01, 2021-01-01)');
    console.log(span.toString());
} // span.free() called automatically here
```

> `using` requires TypeScript 5.2+ with `"lib": ["ES2022"]` or `"ESNext"` in `tsconfig.json`.

## Implemented types

### Base classes (`src/types/base/`)

| Class | Description |
|---|---|
| `MeoSet<T>` | Abstract generic base for all set types |
| `Span` | Abstract base for all span types |
| `SpanSet<S>` | Abstract generic base for all span-set types |

### Temporal types (`src/types/temporal/` & `src/types/base/`)

| Class | Description | Tests |
|---|---|---|
| `TBool` | Temporal boolean | ✅ `test/temporal/test_tbool.ts` |
| `TInt` | Temporal integer | ✅ `test/temporal/test_tint.ts` |
| `TFloat` | Temporal float | ✅ `test/temporal/test_tfloat.ts` |

### Number types (`src/types/number/`)

| Class | Description | Tests |
|---|---|---|
| `IntSpan` | Span of integers | ✅ `test/number/test_intspan.ts` |
| `IntSpanSet` | Set of integer spans | ✅ `test/number/test_intspanset.ts` |
| `IntSet` | Set of integers | ✅ `test/number/test_intset.ts` |
| `FloatSpan` | Span of floats | ✅ `test/number/test_floatspan.ts` |
| `FloatSpanSet` | Set of float spans | ✅ `test/number/test_floatspanset.ts` |
| `FloatSet` | Set of floats | ✅ `test/number/test_floatset.ts` |

### Time types (`src/types/time/`)

| Class | Description | Tests |
|---|---|---|
| `TsTzSpan` | Timestamptz span | ✅ `test/time/test_tstzspan.ts` |
| `TsTzSpanSet` | Set of timestamptz spans | ✅ `test/time/test_tstzspanset.ts` |
| `TsTzSet` | Set of timestamptz values | ✅ `test/time/test_tstzset.ts` |
| `DateSpan` | Date span | ✅ `test/time/test_datespan.ts` |
| `DateSpanSet` | Set of date spans | ✅ `test/time/test_datespanset.ts` |
| `DateSet` | Set of dates | ✅ `test/time/test_dateset.ts` |

### Boxes (`src/types/boxes/`)

| Class | Description | Tests |
|---|---|---|
| `TBox` | Numeric x temporal bounding box | ✅ `test/boxes/test_tbox.ts` |


## Types not yet implemented

### BigInt types (`src/types/number/`)

| Class | Description |
|---|---|
| `BigIntSpan` | Span of 64-bit integers |
| `BigIntSpanSet` | Set of `BigIntSpan` values |
| `BigIntSet` | Ordered set of distinct 64-bit integers |

### Spatiotemporal bounding box (`src/types/boxes/`)

| Class | Description |
|---|---|
| `STBox` | Spatiotemporal bounding box (X, Y, Z spatial axes + T temporal axis) |

### Temporal text (`src/types/temporal/`)

| Class | Description |
|---|---|
| `TText` | Temporal text (instant, sequence, sequence set) |

### Temporal geometry / geography (`src/types/temporal/`)

| Class | Description |
|---|---|
| `TGeomPoint` | Temporal geometry point (2D/3D) |
| `TGeogPoint` | Temporal geography point (2D/3D, geodesic) |
