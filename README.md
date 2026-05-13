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

Click any type name to open its API reference.

**Abstract bases** — [`Span`][Span] · [`SpanSet`][SpanSet]

**Number spans & sets** — [`IntSpan`][IntSpan] · [`IntSpanSet`][IntSpanSet] · [`IntSet`][IntSet] · [`FloatSpan`][FloatSpan] · [`FloatSpanSet`][FloatSpanSet] · [`FloatSet`][FloatSet] · [`BigIntSpan`][BigIntSpan] · [`BigIntSpanSet`][BigIntSpanSet] · [`BigIntSet`][BigIntSet]

**Text** — [`TextSet`][TextSet]

**Time** — [`TsTzSpan`][TsTzSpan] · [`TsTzSpanSet`][TsTzSpanSet] · [`TsTzSet`][TsTzSet] · [`DateSpan`][DateSpan] · [`DateSpanSet`][DateSpanSet] · [`DateSet`][DateSet]

**Bounding boxes** — [`TBox`][TBox] · [`STBox`][STBox]

**Temporal booleans** — [`TBool`][TBool] · [`TBoolInst`][TBoolInst] · [`TBoolSeq`][TBoolSeq] · [`TBoolSeqSet`][TBoolSeqSet]

**Temporal integers** — [`TInt`][TInt] · [`TIntInst`][TIntInst] · [`TIntSeq`][TIntSeq] · [`TIntSeqSet`][TIntSeqSet]

**Temporal floats** — [`TFloat`][TFloat] · [`TFloatInst`][TFloatInst] · [`TFloatSeq`][TFloatSeq] · [`TFloatSeqSet`][TFloatSeqSet]

**Temporal text** — [`TText`][TText] · [`TTextInst`][TTextInst] · [`TTextSeq`][TTextSeq] · [`TTextSeqSet`][TTextSeqSet]

**Temporal geometry point** (planar, 2D/3D) — [`TGeomPoint`][TGeomPoint] · [`TGeomPointInst`][TGeomPointInst] · [`TGeomPointSeq`][TGeomPointSeq] · [`TGeomPointSeqSet`][TGeomPointSeqSet]

**Temporal geography point** (geodetic, 2D/3D) — [`TGeogPoint`][TGeogPoint] · [`TGeogPointInst`][TGeogPointInst] · [`TGeogPointSeq`][TGeogPointSeq] · [`TGeogPointSeqSet`][TGeogPointSeqSet]

Factory functions `createTBool`, `createTInt`, `createTFloat`, `createTText`, `createTGeomPoint`, `createTGeogPoint` dispatch to the right subtype based on the MEOS internal type flag.

[Span]: https://nyuke235.github.io/MEOS.js/api/classes/Span
[SpanSet]: https://nyuke235.github.io/MEOS.js/api/classes/SpanSet
[IntSpan]: https://nyuke235.github.io/MEOS.js/api/classes/IntSpan
[IntSpanSet]: https://nyuke235.github.io/MEOS.js/api/classes/IntSpanSet
[IntSet]: https://nyuke235.github.io/MEOS.js/api/classes/IntSet
[FloatSpan]: https://nyuke235.github.io/MEOS.js/api/classes/FloatSpan
[FloatSpanSet]: https://nyuke235.github.io/MEOS.js/api/classes/FloatSpanSet
[FloatSet]: https://nyuke235.github.io/MEOS.js/api/classes/FloatSet
[BigIntSpan]: https://nyuke235.github.io/MEOS.js/api/classes/BigIntSpan
[BigIntSpanSet]: https://nyuke235.github.io/MEOS.js/api/classes/BigIntSpanSet
[BigIntSet]: https://nyuke235.github.io/MEOS.js/api/classes/BigIntSet
[TextSet]: https://nyuke235.github.io/MEOS.js/api/classes/TextSet
[TsTzSpan]: https://nyuke235.github.io/MEOS.js/api/classes/TsTzSpan
[TsTzSpanSet]: https://nyuke235.github.io/MEOS.js/api/classes/TsTzSpanSet
[TsTzSet]: https://nyuke235.github.io/MEOS.js/api/classes/TsTzSet
[DateSpan]: https://nyuke235.github.io/MEOS.js/api/classes/DateSpan
[DateSpanSet]: https://nyuke235.github.io/MEOS.js/api/classes/DateSpanSet
[DateSet]: https://nyuke235.github.io/MEOS.js/api/classes/DateSet
[TBox]: https://nyuke235.github.io/MEOS.js/api/classes/TBox
[STBox]: https://nyuke235.github.io/MEOS.js/api/classes/STBox
[TBool]: https://nyuke235.github.io/MEOS.js/api/classes/TBool
[TBoolInst]: https://nyuke235.github.io/MEOS.js/api/classes/TBoolInst
[TBoolSeq]: https://nyuke235.github.io/MEOS.js/api/classes/TBoolSeq
[TBoolSeqSet]: https://nyuke235.github.io/MEOS.js/api/classes/TBoolSeqSet
[TInt]: https://nyuke235.github.io/MEOS.js/api/classes/TInt
[TIntInst]: https://nyuke235.github.io/MEOS.js/api/classes/TIntInst
[TIntSeq]: https://nyuke235.github.io/MEOS.js/api/classes/TIntSeq
[TIntSeqSet]: https://nyuke235.github.io/MEOS.js/api/classes/TIntSeqSet
[TFloat]: https://nyuke235.github.io/MEOS.js/api/classes/TFloat
[TFloatInst]: https://nyuke235.github.io/MEOS.js/api/classes/TFloatInst
[TFloatSeq]: https://nyuke235.github.io/MEOS.js/api/classes/TFloatSeq
[TFloatSeqSet]: https://nyuke235.github.io/MEOS.js/api/classes/TFloatSeqSet
[TText]: https://nyuke235.github.io/MEOS.js/api/classes/TText
[TTextInst]: https://nyuke235.github.io/MEOS.js/api/classes/TTextInst
[TTextSeq]: https://nyuke235.github.io/MEOS.js/api/classes/TTextSeq
[TTextSeqSet]: https://nyuke235.github.io/MEOS.js/api/classes/TTextSeqSet
[TGeomPoint]: https://nyuke235.github.io/MEOS.js/api/classes/TGeomPoint
[TGeomPointInst]: https://nyuke235.github.io/MEOS.js/api/classes/TGeomPointInst
[TGeomPointSeq]: https://nyuke235.github.io/MEOS.js/api/classes/TGeomPointSeq
[TGeomPointSeqSet]: https://nyuke235.github.io/MEOS.js/api/classes/TGeomPointSeqSet
[TGeogPoint]: https://nyuke235.github.io/MEOS.js/api/classes/TGeogPoint
[TGeogPointInst]: https://nyuke235.github.io/MEOS.js/api/classes/TGeogPointInst
[TGeogPointSeq]: https://nyuke235.github.io/MEOS.js/api/classes/TGeogPointSeq
[TGeogPointSeqSet]: https://nyuke235.github.io/MEOS.js/api/classes/TGeogPointSeqSet
