# Temporal Bounding Box (TBox)

A `TBox` is a two-dimensional bounding box with an optional **numeric (X)** axis and an
optional **temporal (T)** axis. It is used internally by MobilityDB to index and query
temporal number sequences, and is useful as a lightweight summary type.

## Dimensions

A `TBox` can have:
- **X only**: a numeric range (integer or float span).
- **T only**: a timestamp range (`TsTzSpan`).
- **XT**: both a numeric and a temporal range.

MEOS outputs different WKT prefixes depending on the X type:
- Integer X: `TBOX X(...)` or `TBOX XT(...)`
- Float X: `TBOXFLOAT X(...)` or `TBOXFLOAT XT(...)`
- T only: `TBOX T(...)`

## Creating a TBox

### From a WKT string

```ts
import { initMeos, TBox } from 'meos.js';
await initMeos();

const floatXT = TBox.fromString('TBOXFLOAT XT([1.5, 10.5],[2020-01-01, 2020-12-31])');
const intX    = TBox.fromString('TBOX X([1, 10])');
const tOnly   = TBox.fromString('TBOX T([2020-01-01, 2020-12-31])');
```

### From scalar values

```ts
const fromInt   = TBox.fromInt(5);            // X-only, point span [5, 5]
const fromFloat = TBox.fromFloat(3.14);       // X-only, point span [3.14, 3.14]
```

### From a span or span set

```ts
import { IntSpan, FloatSpan } from 'meos.js';

const span = IntSpan.fromBounds(1, 10);
const box  = TBox.fromSpan(span.inner);       // X-only TBox from IntSpan
```

### XT boxes from a numeric span and a temporal span

```ts
import { TsTzSpan } from 'meos.js';

const numSpan  = FloatSpan.fromBounds(1.5, 10.5);
const timeSpan = TsTzSpan.fromString('[2020-01-01, 2020-12-31]');

const box = TBox.fromNumSpanTsTzSpan(numSpan.inner, timeSpan.inner);
```

### Using `TBox.make`

The most flexible constructor: pass `0` for either dimension to omit it.

```ts
import { IntSpan } from 'meos.js';

const numSpan = IntSpan.fromBounds(1, 10);

const xOnly = TBox.make(numSpan.inner, 0);  // no T dimension
const tOnly = TBox.make(0, timeSpan.inner); // no X dimension
```

## Reading dimensions

```ts
const b = TBox.fromString('TBOXFLOAT XT([1.5, 10.5],[2020-01-01, 2020-12-31])');

b.hasX();     // true
b.hasT();     // true

b.xmin();     // 1.5
b.xmax();     // 10.5
b.xminInc();  // true
b.xmaxInc();  // true
```

### TimestampTz returns BigInt

`tmin()` and `tmax()` return `BigInt` at runtime, even though the TypeScript type is `number`.
This is a quirk of the WASM binding: compare with `0n`, not `0`:

```ts
b.tmin() === 0n  // correct comparison for epoch 2000-01-01
```

## Topological predicates

```ts
const a = TBox.fromString('TBOX X([1, 5])');
const b = TBox.fromString('TBOX X([3, 10])');

a.overlaps(b);         // true
a.isContainedIn(b);    // false
a.contains(b);         // false
a.isSame(b);           // false
a.isAdjacent(TBox.fromString('TBOX X([5, 10])')); // depends on bound inclusivity
```

## Position predicates

Position is split across the two axes:

```ts
// On the X axis
a.isLeft(b);           // true if max(a.x) < min(b.x)
a.isOverOrLeft(b);     // true if max(a.x) <= max(b.x)
a.isRight(b);          // true if min(a.x) > max(b.x)
a.isOverOrRight(b);    // true if min(a.x) >= min(b.x)

// On the T axis
a.isBefore(b);         // true if max(a.t) < min(b.t)
a.isOverOrBefore(b);
a.isAfter(b);
a.isOverOrAfter(b);
```

## Set operations

```ts
const a = TBox.fromString('TBOXFLOAT X([1.0, 5.0])');
const b = TBox.fromString('TBOXFLOAT X([3.0, 10.0])');

const i = a.intersection(b);   // TBOXFLOAT X([3.0, 5.0])  (null if disjoint)
const u = a.union(b);          // TBOXFLOAT X([1.0, 10.0]) (strict=false allows non-touching)
```

## Math operations

### Expanding

```ts
// Float box: expand by 0.5 on each side
const fb = TBox.fromString('TBOXFLOAT X([2.0, 8.0])');
const expanded = fb.expandFloat(0.5);  // TBOXFLOAT X([1.5, 8.5])

// Integer box: expand by 2 on each side
const ib = TBox.make(IntSpan.fromBounds(2, 8).inner, 0);
const expanded2 = ib.expandInt(2);  // TBOX X([0, 10])
```

> `expandInt` and `shiftScaleInt` require an **integer-typed** TBox.
> Using them on a float TBox (prefixed `TBOXFLOAT`) will throw a MEOS error.

### Shifting and scaling

```ts
const ib = TBox.make(IntSpan.fromBounds(1, 5).inner, 0);
const shifted = ib.shiftScaleInt(2, 0, true, false);  // shift +2, keep width -> [3, 7]
const scaled  = ib.shiftScaleInt(0, 10, false, true); // no shift, rescale width to 10

const fb = TBox.fromString('TBOXFLOAT X([1.0, 5.0])');
const fs  = fb.shiftScaleFloat(0.5, 0, true, false);  // shift +0.5
```

### Rounding

```ts
const b = TBox.fromString('TBOXFLOAT X([1.567, 9.123])');
b.round(2); // TBOXFLOAT X([1.57, 9.12])
```

## Conversions

```ts
import { IntSpan, FloatSpan, TsTzSpan } from 'meos.js';

const b = TBox.fromString('TBOXFLOAT XT([1.5, 10.5],[2020-01-01, 2020-12-31])');

const xInt   = new IntSpan(b.toIntSpan());     // X as IntSpan
const xFloat = new FloatSpan(b.toFloatSpan()); // X as FloatSpan
const t      = new TsTzSpan(b.toTsTzSpan());   // T as TsTzSpan
```
