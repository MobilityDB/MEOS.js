# Sets

A **set** is an ordered collection of distinct values of a single type.
Unlike a span set (which holds ranges), a set holds individual discrete values.

MEOS.js provides four set types:

| Class | Value type | Unit |
|---|---|---|
| `IntSet` | Integer | - |
| `FloatSet` | Float (IEEE 754 double) | - |
| `DateSet` | Calendar date | Days since 2000-01-01 |
| `TsTzSet` | Timestamp with time zone | Microseconds since 2000-01-01 UTC |

## Creating a set

### From a WKT string

```ts
import { initMeos, IntSet, FloatSet, DateSet, TsTzSet } from 'meos.js';
await initMeos();

const a = IntSet.fromString('{1, 3, 7, 15}');
const b = FloatSet.fromString('{1.5, 3.0, 7.25}');
const c = DateSet.fromString('{2020-01-01, 2020-06-15, 2020-12-31}');
const d = TsTzSet.fromString('{2020-01-01, 2020-06-15, 2020-12-31}');
```

### From hex WKB

```ts
const hexwkb = a.asHexWKB();
const copy   = IntSet.fromHexWKB(hexwkb);
```

## Navigating values

```ts
const s = IntSet.fromString('{1, 3, 7, 15}');

s.numValues();    // 4
s.startValue();   // 1   (smallest)
s.endValue();     // 15  (largest)
s.valueN(0);      // 1   (0-based index)
s.valueN(2);      // 7
```

## Topological predicates

```ts
const a = IntSet.fromString('{1, 3, 7}');
const b = IntSet.fromString('{3, 7, 20}');

a.overlaps(b);        // true  (share {3, 7})
a.isContainedIn(b);   // false (1 not in b)
b.contains(a);        // false
a.eq(b);              // false
```

## Position predicates

```ts
const a = IntSet.fromString('{1, 3}');
const b = IntSet.fromString('{7, 15}');

a.isBefore(b);        // true  (max(a)=3 < min(b)=7)
a.isOverOrBefore(b);  // true
b.isAfter(a);         // true
b.isOverOrAfter(a);   // true
```

## Distance

```ts
const a = IntSet.fromString('{1, 3}');
const b = IntSet.fromString('{7, 15}');

a.distance(b); // 4  (gap between 3 and 7)
```

## Set operations

```ts
const a = IntSet.fromString('{1, 3, 7}');
const b = IntSet.fromString('{3, 7, 20}');

const u = a.union(b);          // {1, 3, 7, 20}
const i = a.intersection(b);  // {3, 7}  (null if disjoint)
const m = a.minus(b);         // {1}     (null if empty)

u.free(); i?.free(); m?.free();
```

## Shifting and scaling

```ts
const s = IntSet.fromString('{1, 3, 7}');

const shifted = s.shiftScale(10, 0, true, false);  // {11, 13, 17}
shifted.free(); s.free();
```

## Conversions

```ts
const i = IntSet.fromString('{1, 3, 7}');
const f = new FloatSet(i.toFloatSet()); // {1.0, 3.0, 7.0}
i.free(); f.free();

const d = DateSet.fromString('{2020-01-01, 2020-06-15}');
const t = new TsTzSet(d.toTsTzSet()); // timestamps at midnight UTC
d.free(); t.free();
```

## Bounding span and span set

Every set can be projected to its bounding span or a span set of unit spans:

```ts
const s = IntSet.fromString('{1, 3, 7}');

const span    = s.toSpan();    // raw Ptr: bounding IntSpan [1, 7]
const spanset = s.toSpanSet(); // raw Ptr: IntSpanSet {[1,1],[3,3],[7,7]}
```
