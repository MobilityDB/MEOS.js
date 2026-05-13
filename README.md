# MEOS.js

TypeScript/JavaScript bindings for [MEOS](https://libmeos.org/), the C library that powers [MobilityDB](https://mobilitydb.com/) spatiotemporal types.

MEOS is compiled to WebAssembly (wasm64/MEMORY64) via [Emscripten](https://emscripten.org/). MEOS.js wraps the resulting `.wasm` module in a typed TypeScript API so you can work with temporal values, spans, sets, and bounding boxes in Node.js or the browser.

**Documentation:** https://nyuke235.github.io/MEOS.js/

## Table of contents
- [Requirements](#requirements)
- [Installation](#installation)
- [Quick start](#quick-start)
- [Memory management](#memory-management)
- [Implemented types](#implemented-types)
- [Not yet implemented](#not-yet-implemented)

## Requirements

- **Node.js** 22+ (wasm64/MEMORY64 requires a recent V8)
- **Docker**: required only to build the WASM module from source; not needed if you use the prebuilt files

## Installation

### 1. Install Node dependencies

```bash
npm install
```

### 2. Get the WASM module

**Option A build from source (Docker)**

```bash
docker build --output type=local,dest=./wasm --target wasm .
```

This produces `wasm/meos.js` and `wasm/meos.wasm`. The first build may take a while as it compiles GEOS, PROJ, SQLite, GSL, JSON-C, and MobilityDB from source.

**Option B use the prebuilt files**

*todo*

### 3. Run the tests

```bash
npm test
```

## Quick start

```ts
import { initMeos, TsTzSpan, IntSpan, TBox, STBox } from './core/index';

await initMeos();

// Timestamp span
const period = TsTzSpan.fromString('[2020-01-01, 2021-01-01)');
console.log(period.toString()); // [2020-01-01 00:00:00+00, 2021-01-01 00:00:00+00)
period.free();

// Integer span
const range = IntSpan.fromBounds(1, 100);
console.log(range.width()); // 99
range.free();

// Spatiotemporal bounding box
const box = STBox.fromString('STBOX XT(((0,0),(10,10)),[2020-01-01,2020-12-31])');
console.log(box.hasX()); // true
console.log(box.hasT()); // true
box.free();
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

### Base classes

| Class | Description |
|---|---|
| `MeosSet<T>` | Abstract generic base for all set types |
| `Span` | Abstract base for all span types |
| `SpanSet<S>` | Abstract generic base for all span-set types |

### Number collections (`core/types/collections/number/`)

| Class | Description | Tests |
|---|---|---|
| `IntSpan` | Span of integers | ✅ |
| `IntSpanSet` | Set of integer spans | ✅ |
| `IntSet` | Set of integers | ✅ |
| `FloatSpan` | Span of floats | ✅ |
| `FloatSpanSet` | Set of float spans | ✅ |
| `FloatSet` | Set of floats | ✅ |
| `BigIntSpan` | Span of 64-bit integers | ✅ |
| `BigIntSpanSet` | Set of 64-bit integer spans | ✅ |
| `BigIntSet` | Set of 64-bit integers | ✅ |

### Text collections (`core/types/collections/text/`)

| Class | Description | Tests |
|---|---|---|
| `TextSet` | Ordered set of distinct text strings | ✅ |

### Time collections (`core/types/collections/time/`)

| Class | Description | Tests |
|---|---|---|
| `TsTzSpan` | Timestamptz span | ✅ |
| `TsTzSpanSet` | Set of timestamptz spans | ✅ |
| `TsTzSet` | Set of timestamptz values | ✅ |
| `DateSpan` | Date span | ✅ |
| `DateSpanSet` | Set of date spans | ✅ |
| `DateSet` | Set of dates | ✅ |

### Bounding boxes (`core/types/boxes/`)

| Class | Description | Tests |
|---|---|---|
| `TBox` | Numeric × temporal bounding box | ✅ |
| `STBox` | Spatiotemporal bounding box (XYZ + T) | ✅ |

### Temporal types (`core/types/basic/`)

| Class | Subtypes | Description | Tests |
|---|---|---|---|
| `TBool` | `TBoolInst`, `TBoolSeq`, `TBoolSeqSet` | Temporal boolean | ✅ |
| `TInt` | `TIntInst`, `TIntSeq`, `TIntSeqSet` | Temporal integer | ✅ |
| `TFloat` | `TFloatInst`, `TFloatSeq`, `TFloatSeqSet` | Temporal float | ✅ |
| `TText` | `TTextInst`, `TTextSeq`, `TTextSeqSet` | Temporal text | ✅ |

Factory functions `createTBool`, `createTInt`, `createTFloat`, `createTText` dispatch to the right subtype automatically.

## Not yet implemented

| Class | Description |
|---|---|
| `TGeomPoint` | Temporal geometry point (2D/3D) |
| `TGeogPoint` | Temporal geography point (geodesic) |
