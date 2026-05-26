# Spatiotemporal Bounding Box (STBox)

An `STBox` is a bounding box with up to four dimensions: **X**, **Y**, **Z** (spatial) and
**T** (temporal). It is the bounding type for temporal point sequences and is used internally
by MobilityDB for spatial indexing.

## Dimensions

An `STBox` can carry any combination of the spatial and temporal axes:

| Combination | Example WKT |
|---|---|
| XY only | `STBOX X((0,0),(10,10))` |
| XY + T | `STBOX XT(((0,0),(10,10)),[2024-01-01,2024-12-31])` |
| XYZ | `STBOX Z((0,0,0),(10,10,10))` |
| XYZ + T | `STBOX ZT(((0,0,0),(10,10,10)),[2024-01-01,2024-12-31])` |
| T only | `STBOX T([2024-01-01,2024-12-31])` |
| Geodetic XY + T | `SRID=4326;STBOX XT(((2,48),(14,53)),[2024-01-01,2024-12-31])` |

## Creating an STBox

### From a WKT string

```ts
import { initMeos, STBox } from 'meos.js';
await initMeos();

const xy  = STBox.fromString('STBOX X((0,0),(10,10))');
const xyt = STBox.fromString('STBOX XT(((0,0),(10,10)),[2024-01-01,2024-12-31])');
const t   = STBox.fromString('STBOX T([2024-01-01,2024-12-31])');
```

### From a WKT geometry

```ts
const box = STBox.fromGeometry('POINT(5 5)');
const boxWithSrid = STBox.fromGeometry('POINT(2.35 48.85)', 4326);
```

### From a temporal point

```ts
import { TGeomPoint } from 'meos.js';

const seq = TGeomPoint.fromString('[POINT(0 0)@2024-01-01, POINT(10 10)@2024-01-11]');
const boxPtr = seq.toSTBox();

import { STBox } from 'meos.js';
const box = new STBox(boxPtr);

seq.free(); box.free();
```

### Manual construction

```ts
// STBox.make(hasx, hasz, geodetic, srid, xmin, xmax, ymin, ymax, zmin, zmax, tstzSpanPtr)
const box = STBox.make(true, false, false, 0, 0, 10, 0, 10, 0, 0, 0);
box.free();
```

## Reading dimensions

```ts
const b = STBox.fromString('STBOX XT(((0,0),(10,10)),[2024-01-01,2024-12-31])');

b.hasX();     // true
b.hasZ();     // false
b.hasT();     // true
b.isGeodetic(); // false

b.xmin(); b.xmax(); // 0, 10
b.ymin(); b.ymax(); // 0, 10
```

### Temporal bounds

`tmin()` and `tmax()` return `BigInt` (microseconds since 2000-01-01 UTC):

```ts
const tmin: bigint = b.tmin();
const tmax: bigint = b.tmax();

b.tminInc(); // true
b.tmaxInc(); // true

b.free();
```

## Topological predicates

```ts
const a = STBox.fromString('STBOX X((0,0),(5,5))');
const b = STBox.fromString('STBOX X((3,3),(10,10))');

a.overlaps(b);          // true
a.contains(b);          // false
a.isContainedIn(b);     // false
a.isSame(b);            // false
a.isAdjacent(STBox.fromString('STBOX X((5,5),(10,10))')); // depends on bounds
```

## Position predicates

```ts
const a = STBox.fromString('STBOX X((0,0),(4,4))');
const b = STBox.fromString('STBOX X((6,6),(10,10))');

// Spatial axis
a.isLeft(b);            // true   (a is entirely left of b)
a.isOverOrLeft(b);      // true
b.isRight(a);           // true
b.isOverOrRight(a);     // true
a.isBelow(b);           // true   (a is below b)
a.isOverOrBelow(b);     // true
b.isAbove(a);           // true

// Temporal axis
a.isBefore(b);
a.isOverOrBefore(b);
b.isAfter(a);
```

## Set operations

```ts
const a = STBox.fromString('STBOX X((0,0),(6,6))');
const b = STBox.fromString('STBOX X((4,4),(10,10))');

const i = a.intersection(b);  // STBOX X((4,4),(6,6))  (null if disjoint)
const u = a.union(b);         // STBOX X((0,0),(10,10))

i?.free(); u?.free();
```

## Expanding

```ts
const b = STBox.fromString('STBOX X((2,2),(8,8))');

const expanded = b.expandSpatial(1.0);  // add 1.0 to each spatial side → ((1,1),(9,9))
const expandedT = b.expandTemporal(3600_000_000n); // expand T by 1 hour (µs)

expanded.free(); expandedT.free(); b.free();
```

## Conversions

```ts
import { TsTzSpan } from 'meos.js';

const b = STBox.fromString('STBOX XT(((0,0),(10,10)),[2024-01-01,2024-12-31])');

const tSpanPtr = b.toTsTzSpan();
const tSpan    = new TsTzSpan(tSpanPtr);

tSpan.free(); b.free();
```
