# Getting Started

## Installation

```bash
npm install meos.js
```

## Initialising the WASM module

Every MEOS.js program must call `initMeos()` once before using any type.
The function loads and compiles the WebAssembly binary and is asynchronous.

```ts
import { initMeos, IntSpan } from 'meos.js';

await initMeos();

const s = IntSpan.fromBounds(1, 10);
console.log(s.lower()); // 1
console.log(s.upper()); // 10
s.free();
```

`initMeos()` is safe to call multiple times — subsequent calls return the cached module.

## Memory management

MEOS.js objects wrap pointers to C-allocated memory on the WASM heap.
You are responsible for releasing that memory when you are done.

**Manual release**: call `.free()`:

```ts
const span = IntSpan.fromBounds(1, 10);
// ... use span ...
span.free();
```

**Automatic release**: use the `using` declaration (TypeScript 5.2+, ES2022 target):

```ts
using span = IntSpan.fromBounds(1, 10);
// span.free() is called automatically at the end of the block
```

Operations that create new objects (e.g. `copy()`, `union()`, `intersection()`) also
allocate new WASM memory, free those results too.

## What is MEOS?

[MEOS](https://libmeos.org/) (Mobility Engine Open Source) is the C library at the core of
[MobilityDB](https://mobilitydb.com/). It provides temporal types — types that track how a
value changes over time — together with the span, span-set, and set primitives needed to
represent ranges of numbers, dates, and timestamps.

MEOS.js compiles MEOS to WebAssembly and exposes its types as idiomatic TypeScript classes.
