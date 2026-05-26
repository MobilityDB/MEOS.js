# Span Sets

A **span set** is an ordered collection of disjoint (non-overlapping, non-adjacent) spans of the same type.
It is the natural result of subtracting or taking the union of multiple ranges that do not merge into one.

MEOS.js provides four span-set types, each paired with its companion span type:

| Class | Companion span | 
|---|---|
| `IntSpanSet` | `IntSpan` |
| `FloatSpanSet` | `FloatSpan` |
| `DateSpanSet` | `DateSpan` |
| `TsTzSpanSet` | `TsTzSpan` |

## Creating a span set

### From a WKT string

```ts
import { initMeos, IntSpanSet } from 'meos.js';
await initMeos();

const ss = IntSpanSet.fromString('{[1, 5), [8, 12)}');
```

### From a single span

```ts
import { IntSpan, IntSpanSet } from 'meos.js';

const span = IntSpan.fromBounds(1, 10);
const ss   = IntSpanSet.fromSpan(span);  // wraps the span in a one-element set
```

### From hex WKB

```ts
const hexwkb = ss.asHexWKB();
const copy   = IntSpanSet.fromHexWKB(hexwkb);
```

## Navigating the spans

```ts
const ss = IntSpanSet.fromString('{[1, 5), [8, 12)}');

ss.numSpans();    // 2
ss.lower();       // 1   (lower bound of first span)
ss.upper();       // 12  (upper bound of last span)
ss.lowerInc();    // true
ss.upperInc();    // false

const first = ss.startSpan();    // IntSpan [1, 5)
const last  = ss.endSpan();      // IntSpan [8, 12)
const n     = ss.spanN(0);       // IntSpan [1, 5)  (0-based index)
const bbox  = ss.boundingSpan(); // IntSpan [1, 12) (bounding span)

first.free(); last.free(); n.free(); bbox.free();
ss.free();
```

## Width

```ts
const ss = IntSpanSet.fromString('{[1, 5), [8, 12)}');

ss.width();          // 8   (sum of span widths: (5-1) + (12-8))
ss.width(true);      // 11  (bounding span width: 12 - 1)
```

## Topological predicates

All predicates accept either a companion span or another span set:

```ts
const a = IntSpanSet.fromString('{[1, 5), [8, 12)}');
const b = IntSpanSet.fromString('{[5, 8)}');
const s = IntSpan.fromString('[3, 6)');

a.isAdjacent(b);         // true  ({[1,5),[8,12)} adjacent to {[5,8)})
a.overlaps(s);           // true  ([3,6) overlaps [1,5))
a.isContainedIn(s);      // false
a.contains(s);           // false ([3,6) not fully inside a)
```

## Set operations

```ts
const a = IntSpanSet.fromString('{[1, 5), [8, 12)}');
const b = IntSpan.fromString('[3, 9)');

const u = a.union(b);          // {[1, 12)}  (merged)
const i = a.intersection(b);  // {[3, 5), [8, 9)}
const m = a.minus(b);         // {[1, 3), [9, 12)}

u.free(); i?.free(); m?.free();
a.free(); b.free();
```

## Distance

```ts
const a = IntSpanSet.fromString('{[1, 5)}');
const b = IntSpan.fromString('[8, 12)');

a.distance(b); // 3  (gap between 5 and 8)
```

## Shifting and scaling

```ts
const ss = IntSpanSet.fromString('{[1, 5), [8, 12)}');

const shifted = ss.shiftScale(10, 0, true, false);  // shift +10, keep width
// {[11, 15), [18, 22)}

const scaled = ss.shiftScale(0, 20, false, true);   // no shift, rescale to width 20
shifted.free(); scaled.free(); ss.free();
```

## Float-specific operations

`FloatSpanSet` supports the same math operations as `FloatSpan`:

```ts
const fs = FloatSpanSet.fromString('{[1.5, 5.5), [8.0, 12.0)}');

fs.ceil();         // rounds all bounds up
fs.floor();        // rounds all bounds down
fs.round(2);       // rounds all bounds to 2 decimal places
fs.degrees();      // converts all bounds from radians to degrees
fs.radians();      // converts all bounds from degrees to radians
```
