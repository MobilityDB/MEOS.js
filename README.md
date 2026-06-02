# MEOS.js

TypeScript/JavaScript bindings for [MEOS](https://libmeos.org/), the C library that powers [MobilityDB](https://mobilitydb.com/) spatiotemporal types.

MEOS is compiled to WebAssembly (wasm64/MEMORY64) via [Emscripten](https://emscripten.org/). MEOS.js wraps the resulting `.wasm` module in a typed TypeScript API so you can work with temporal values, spans, sets, and bounding boxes in Node.js or the browser.

**Documentation:** https://mobilitydb.github.io/MEOS.js/

## Table of contents
- [Requirements](#requirements)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Using from JavaScript](#using-from-javascript)
- [Code Generation](#code-generation)
- [Tests](#tests)
- [Doc](#doc)
- [Memory management](#memory-management)
- [Implemented types](#implemented-types)
- [Use Case Examples](#use-case-examples)

## Requirements

- **Docker**: only needed to build the WASM module from source. Not needed if you use the prebuilt files.
- **A JS engine with WebAssembly MEMORY64 support**: needed to *run* MEOS.js, because `meos.wasm` is compiled with `-sMEMORY64=1`. In practice:
    - server-side: **Node.js 22+**
    - browser-side: recent Chromium-based browsers or Firefox with the MEMORY64 proposal enabled

  `initMeos()` probes for MEMORY64 at startup and throws a clear error if the engine doesn't support it.

> **Node.js 22+** is additionally required to run the tests, the code generator, the TypeScript build and the docs. Not needed for the WASM build itself.

## Project Structure

```
MEOS.js/
├── codegen/                         ← Code generator
│   ├── res/
│   │   ├── meos-idl.json            ← MEOS API description
│   │   ├── meos.h, meos_geo.h       ← Cached upstream headers
│   │   ├── bindings_c_header.c.template
│   │   └── functions_ts_header.ts.template
│   └── FunctionsGenerator.ts        ← Eemits the C glue + TS bindings
├── core/
│   ├── c-src/
│   │   └── bindings.c               ← Generated C glue
│   ├── functions/
│   │   ├── functions.generated.ts   ← Generated TS bindings
│   │   ├── errors.ts                ← MEOS error code handling
│   │   └── ptr_array.ts             ← Pointer-array marshalling helpers
│   ├── runtime/
│   │   └── meos.ts                  ← WASM module loader
│   ├── types/                       ← High-level typed wrappers
│   │   ├── basic/                   ← TBool, TInt, TFloat, TText...
│   │   ├── boxes/                   ← TBox, STBox
│   │   ├── collections/             ← Span, SpanSet, MeoSet...
│   │   └── temporal/                ← Temporal base class + factory
│   └── index.ts                     ← Public exports
├── wasm/                            ← Build output (meos.js, meos.wasm)
├── test/                            ← Unit tests (node:test + tsx)
├── docs/                            ← TypeDoc + VitePress sources & HTML
├── Dockerfile                       ← Multi-stage build: MEOS → WASM
└── package.json
```

The two-layer architecture consists of:
- **`codegen/`**: reads `codegen/res/meos-idl.json` and generates `core/c-src/bindings.c` and `core/functions/functions.generated.ts`.
- **`core/`**: implements the high-level typed wrappers on top of the generated bindings, plus the runtime that loads the WASM module.

## Installation

### 1. Get the WASM module

**Option A build from source (Docker only)**

```bash
docker build --output type=local,dest=./wasm --target wasm .
```

This produces `wasm/meos.js` and `wasm/meos.wasm`. The first build may take a while as it compiles GEOS, PROJ, SQLite, GSL, JSON-C, and MobilityDB from source.

**Option B use the prebuilt files**

*todo*

### 2. Install dependencies

```bash
npm install
```

### 3. Run the tests

```bash
npm test
```

> **Coming soon**: MEOS.js is supposed to be published on npm so you can just `npm install meos.js` and skip the WASM build and source checkout entirely.

## Using from JavaScript

MEOS.js is written in TypeScript for maintainability but ships as **plain JavaScript** (ES2022 / ESM) with bundled type declarations. You can use it from any JavaScript project without TypeScript in your toolchain.

`npm run build:ts` emits `dist/core/*.js` (the runtime) plus `dist/core/*.d.ts` (the types). From a plain JS file:

```js
import { initMeos, TsTzSpan } from 'meos.js';

await initMeos();
const span = TsTzSpan.fromString('[2020-01-01, 2021-01-01)');
console.log(span.toString());
span.free();
```

Everything works identically: every class (`TBool`, `TInt`, `TFloat`, `TGeomPoint`, ...), the factory functions, the `using` / `[Symbol.dispose]` lifecycle (ES2023, not TS-specific). The bundled `.d.ts` files also give you IDE autocompletion and hover-docs in `.js` files — VS Code picks them up automatically. Add `// @ts-check` at the top of a `.js` file to opt into type checking via JSDoc as well.

The only thing TypeScript users get extra is **compile-time type checking at write-time**; the runtime surface is the same.

## Code Generation

The `codegen/` directory contains the generator that produces `core/c-src/bindings.c` and `core/functions/functions.generated.ts` from the MEOS API description file (`codegen/res/meos-idl.json`).

**When to regenerate**: whenever `meos-idl.json` is updated (e.g. after a MEOS version upgrade) or whenever `FunctionsGenerator.ts` / the templates change.

### Run the generator

```bash
npm run generate
```

This reads `codegen/res/meos-idl.json`, applies the templates in `codegen/res/`, and overwrites both generated files.

> **Do not edit `bindings.c` or `functions.generated.ts` manually**: any change will be lost the next time the generator runs. Manual overrides live in the templates (`codegen/res/*_header.*.template`).

### Update the input file

The canonical `meos-idl.json` is produced by [MEOS-API](https://github.com/MobilityDB/MEOS-API). To refresh against a newer MEOS surface:

```bash
# in a MEOS-API checkout
python setup.py
python run.py
cp output/meos-idl.json /path/to/MEOS.js/codegen/res/meos-idl.json
# back in MEOS.js
npm run generate
```

Bump the `MOBILITYDB_COMMIT` pin in the `Dockerfile` together with the IDL refresh so the WASM build stays in sync with the bindings.

## Tests

Unit tests live in `test/` and use Node's built-in test runner with `tsx` for on-the-fly TypeScript transpilation.

### Run all tests

```bash
npm test
```

### Run a specific test file

```bash
node --import tsx/esm --test test/types/boxes/test_TBox.ts
```

### Run a specific test by name

```bash
node --import tsx/esm --test --test-name-pattern="fromString" test/types/boxes/test_TBox.ts
```

## Doc

The API reference is generated by [TypeDoc](https://typedoc.org/) and served by [VitePress](https://vitepress.dev/). The published site lives at **https://mobilitydb.github.io/MEOS.js/** and is rebuilt by `.github/workflows/docs.yml` on every push to `main`.

### Build the API reference only

```bash
npm run docs:api
```

This invokes TypeDoc with the config in `typedoc.json` and writes Markdown pages to `docs/api/`.

### Run the docs site locally (with hot reload)

```bash
npm run docs:dev
```

### Build the static docs site

```bash
npm run docs:build
```

The output is placed under `docs/.vitepress/dist/`, which is what the GitHub Pages workflow deploys.

### Preview the built site

```bash
npm run docs:preview
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

**Abstract bases**: [`Span`][Span] · [`SpanSet`][SpanSet]

**Number spans & sets**: [`IntSpan`][IntSpan] · [`IntSpanSet`][IntSpanSet] · [`IntSet`][IntSet] · [`FloatSpan`][FloatSpan] · [`FloatSpanSet`][FloatSpanSet] · [`FloatSet`][FloatSet] · [`BigIntSpan`][BigIntSpan] · [`BigIntSpanSet`][BigIntSpanSet] · [`BigIntSet`][BigIntSet]

**Text**: [`TextSet`][TextSet]

**Time**: [`TsTzSpan`][TsTzSpan] · [`TsTzSpanSet`][TsTzSpanSet] · [`TsTzSet`][TsTzSet] · [`DateSpan`][DateSpan] · [`DateSpanSet`][DateSpanSet] · [`DateSet`][DateSet]

**Bounding boxes**: [`TBox`][TBox] · [`STBox`][STBox]

**Temporal booleans**: [`TBool`][TBool] · [`TBoolInst`][TBoolInst] · [`TBoolSeq`][TBoolSeq] · [`TBoolSeqSet`][TBoolSeqSet]

**Temporal integers**: [`TInt`][TInt] · [`TIntInst`][TIntInst] · [`TIntSeq`][TIntSeq] · [`TIntSeqSet`][TIntSeqSet]

**Temporal floats**: [`TFloat`][TFloat] · [`TFloatInst`][TFloatInst] · [`TFloatSeq`][TFloatSeq] · [`TFloatSeqSet`][TFloatSeqSet]

**Temporal text**: [`TText`][TText] · [`TTextInst`][TTextInst] · [`TTextSeq`][TTextSeq] · [`TTextSeqSet`][TTextSeqSet]

**Temporal geometry point** (planar, 2D/3D): [`TGeomPoint`][TGeomPoint] · [`TGeomPointInst`][TGeomPointInst] · [`TGeomPointSeq`][TGeomPointSeq] · [`TGeomPointSeqSet`][TGeomPointSeqSet]

**Temporal geography point** (geodetic, 2D/3D): [`TGeogPoint`][TGeogPoint] · [`TGeogPointInst`][TGeogPointInst] · [`TGeogPointSeq`][TGeogPointSeq] · [`TGeogPointSeqSet`][TGeogPointSeqSet]

Factory functions `createTBool`, `createTInt`, `createTFloat`, `createTText`, `createTGeomPoint`, `createTGeogPoint` dispatch to the right subtype based on the MEOS internal type flag.

## Use Case Examples

*Coming soon: a dedicated examples repository / section will walk through end-to-end workflows: ingesting GPS trajectories, computing temporal aggregates, and integrating with visualization tools such as deck.gl.*

[Span]: https://mobilitydb.github.io/MEOS.js/api/classes/Span
[SpanSet]: https://mobilitydb.github.io/MEOS.js/api/classes/SpanSet
[IntSpan]: https://mobilitydb.github.io/MEOS.js/api/classes/IntSpan
[IntSpanSet]: https://mobilitydb.github.io/MEOS.js/api/classes/IntSpanSet
[IntSet]: https://mobilitydb.github.io/MEOS.js/api/classes/IntSet
[FloatSpan]: https://mobilitydb.github.io/MEOS.js/api/classes/FloatSpan
[FloatSpanSet]: https://mobilitydb.github.io/MEOS.js/api/classes/FloatSpanSet
[FloatSet]: https://mobilitydb.github.io/MEOS.js/api/classes/FloatSet
[BigIntSpan]: https://mobilitydb.github.io/MEOS.js/api/classes/BigIntSpan
[BigIntSpanSet]: https://mobilitydb.github.io/MEOS.js/api/classes/BigIntSpanSet
[BigIntSet]: https://mobilitydb.github.io/MEOS.js/api/classes/BigIntSet
[TextSet]: https://mobilitydb.github.io/MEOS.js/api/classes/TextSet
[TsTzSpan]: https://mobilitydb.github.io/MEOS.js/api/classes/TsTzSpan
[TsTzSpanSet]: https://mobilitydb.github.io/MEOS.js/api/classes/TsTzSpanSet
[TsTzSet]: https://mobilitydb.github.io/MEOS.js/api/classes/TsTzSet
[DateSpan]: https://mobilitydb.github.io/MEOS.js/api/classes/DateSpan
[DateSpanSet]: https://mobilitydb.github.io/MEOS.js/api/classes/DateSpanSet
[DateSet]: https://mobilitydb.github.io/MEOS.js/api/classes/DateSet
[TBox]: https://mobilitydb.github.io/MEOS.js/api/classes/TBox
[STBox]: https://mobilitydb.github.io/MEOS.js/api/classes/STBox
[TBool]: https://mobilitydb.github.io/MEOS.js/api/classes/TBool
[TBoolInst]: https://mobilitydb.github.io/MEOS.js/api/classes/TBoolInst
[TBoolSeq]: https://mobilitydb.github.io/MEOS.js/api/classes/TBoolSeq
[TBoolSeqSet]: https://mobilitydb.github.io/MEOS.js/api/classes/TBoolSeqSet
[TInt]: https://mobilitydb.github.io/MEOS.js/api/classes/TInt
[TIntInst]: https://mobilitydb.github.io/MEOS.js/api/classes/TIntInst
[TIntSeq]: https://mobilitydb.github.io/MEOS.js/api/classes/TIntSeq
[TIntSeqSet]: https://mobilitydb.github.io/MEOS.js/api/classes/TIntSeqSet
[TFloat]: https://mobilitydb.github.io/MEOS.js/api/classes/TFloat
[TFloatInst]: https://mobilitydb.github.io/MEOS.js/api/classes/TFloatInst
[TFloatSeq]: https://mobilitydb.github.io/MEOS.js/api/classes/TFloatSeq
[TFloatSeqSet]: https://mobilitydb.github.io/MEOS.js/api/classes/TFloatSeqSet
[TText]: https://mobilitydb.github.io/MEOS.js/api/classes/TText
[TTextInst]: https://mobilitydb.github.io/MEOS.js/api/classes/TTextInst
[TTextSeq]: https://mobilitydb.github.io/MEOS.js/api/classes/TTextSeq
[TTextSeqSet]: https://mobilitydb.github.io/MEOS.js/api/classes/TTextSeqSet
[TGeomPoint]: https://mobilitydb.github.io/MEOS.js/api/classes/TGeomPoint
[TGeomPointInst]: https://mobilitydb.github.io/MEOS.js/api/classes/TGeomPointInst
[TGeomPointSeq]: https://mobilitydb.github.io/MEOS.js/api/classes/TGeomPointSeq
[TGeomPointSeqSet]: https://mobilitydb.github.io/MEOS.js/api/classes/TGeomPointSeqSet
[TGeogPoint]: https://mobilitydb.github.io/MEOS.js/api/classes/TGeogPoint
[TGeogPointInst]: https://mobilitydb.github.io/MEOS.js/api/classes/TGeogPointInst
[TGeogPointSeq]: https://mobilitydb.github.io/MEOS.js/api/classes/TGeogPointSeq
[TGeogPointSeqSet]: https://mobilitydb.github.io/MEOS.js/api/classes/TGeogPointSeqSet
