# Spans

A **span** is a contiguous, ordered range between a lower bound and an upper bound.
Each bound is either *inclusive* (`[` / `]`) or *exclusive* (`(` / `)`).

MEOS.js provides four span types:

| Class | Element type | Unit |
|---|---|---|
| `IntSpan` | Integer | — |
| `FloatSpan` | Float (IEEE 754 double) | — |
| `DateSpan` | Calendar date | Days since 2000-01-01 (`DateADT`) |
| `TsTzSpan` | Timestamp with time zone | Microseconds since 2000-01-01 UTC (`TimestampTz`) |

## Creating a span

### From a WKT string

```ts
import { initMeos, IntSpan, FloatSpan, DateSpan, TsTzSpan } from 'meos.js';
await initMeos();

const a = IntSpan.fromString('[1, 10)');          // [1, 10)
const b = FloatSpan.fromString('[1.5, 10.5)');    // [1.5, 10.5)
const c = DateSpan.fromString('[2020-01-01, 2020-12-31]');
const d = TsTzSpan.fromString('[2020-01-01, 2020-12-31]');
```

### From explicit bounds

```ts
const s = IntSpan.fromBounds(1, 10);          // [1, 10)  — default: lowerInc=true, upperInc=false
const t = IntSpan.fromBounds(1, 10, true, true);  // stored internally as [1, 11)
```

> **Note for integer spans:** MEOS normalises all integer spans to half-open form.
> `fromBounds(1, 10, true, true)` is stored as `[1, 11)` — `lower()` returns `1`, `upper()` returns `11`.

### From hex WKB

```ts
const hexwkb = s.asHexWKB();
const copy = IntSpan.fromHexWKB(hexwkb);
```

## Reading bounds

```ts
const s = IntSpan.fromBounds(1, 10); // [1, 10)
s.lower();    // 1
s.upper();    // 10
s.lowerInc(); // true
s.upperInc(); // false
s.width();    // 9  (upper - lower)
s.free();
```

## Topological predicates

```ts
const a = IntSpan.fromString('[1, 5)');
const b = IntSpan.fromString('[5, 10)');
const c = IntSpan.fromString('[3, 8)');

a.isAdjacent(b);       // true  — [1,5) touches [5,10) at 5
a.overlaps(c);         // true  — share [3,5)
a.isContainedIn(c);    // false — [1,5) ⊄ [3,8)
c.contains(a);         // false
```

## Position predicates

```ts
const a = IntSpan.fromString('[1, 5)');
const b = IntSpan.fromString('[7, 12)');

a.isBefore(b);        // true  — max(a) < min(b)
a.isOverOrBefore(b);  // true
b.isAfter(a);         // true
```

## Distance

```ts
const a = IntSpan.fromString('[1, 5)');
const b = IntSpan.fromString('[8, 12)');

a.distance(b); // 3  (gap between 5 and 8)
```

## Set operations

```ts
const a = IntSpan.fromString('[1, 8)');
const b = IntSpan.fromString('[5, 12)');

const u = a.union(b);           // [1, 12)
const i = a.intersection(b);   // [5, 8)  — null if disjoint
const m = a.minus(b);          // [1, 5)  — null if result is empty

u.free(); i?.free(); m?.free();
```

## Float-specific operations

`FloatSpan` supports additional mathematical operations:

```ts
const f = FloatSpan.fromBounds(1.5, 10.5);

f.expand(0.5);     // [1.0, 11.0)
f.ceil();          // [2.0, 11.0)  — bounds rounded up
f.floor();         // [1.0, 10.0)  — bounds rounded down
f.round(1);        // [1.5, 10.5)  — rounded to 1 decimal place
f.degrees();       // bounds converted from radians to degrees
f.radians();       // bounds converted from degrees to radians
```

## Conversions

```ts
const i = IntSpan.fromBounds(1, 10);
const f = new FloatSpan(i.toFloatSpan());  // converts to FloatSpan
i.free(); f.free();
```
