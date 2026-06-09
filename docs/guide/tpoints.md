# Temporal Points

A **temporal point** tracks how a geographic or geometric position changes over time.
MEOS.js provides two classes:

| Class | Coordinate system | SRID | Distance unit |
|---|---|---|---|
| `TGeomPoint` | Planar (Euclidean) | User-defined (default 0) | Map units |
| `TGeogPoint` | Geodetic (sphere/ellipsoid) | 4326 (WGS 84) | Metres |

Use `TGeomPoint` for projected CRS (UTM, local grids) and `TGeogPoint` for lat/lon on the
globe where you need accurate geodetic distances.

## Creating temporal points

### From a WKT string

```ts
import { initMeos, TGeomPoint, TGeogPoint } from 'meos.js';
await initMeos();

// Instant
const inst = TGeomPoint.fromString('POINT(1 1)@2024-01-01');

// Sequence (linear interpolation by default)
const seq = TGeomPoint.fromString('[POINT(0 0)@2024-01-01, POINT(10 10)@2024-01-11]');

// Sequence set
const ss = TGeomPoint.fromString(
    '{[POINT(0 0)@2024-01-01, POINT(5 5)@2024-01-06],' +
    '[POINT(10 10)@2024-01-10, POINT(15 15)@2024-01-15]}'
);

// Geography (lat/lon)
const geog = TGeogPoint.fromString('[POINT(2.35 48.85)@2024-01-01, POINT(13.40 52.52)@2024-01-10]');
```

### From a WKT value and timestamp

```ts
import { TGeomPointInst, TGeogPointInst } from 'meos.js';

// timestamp = microseconds since 2000-01-01 UTC
const p = TGeomPointInst.fromValue('POINT(5 5)', 0n);
const g = TGeogPointInst.fromValue('POINT(2.35 48.85)', 0n);

p.free(); g.free();
```

### From instants

```ts
import { TGeomPointInst, TGeomPointSeq } from 'meos.js';

const i1 = TGeomPointInst.fromValue('POINT(0 0)', 0n);
const i2 = TGeomPointInst.fromValue('POINT(10 10)', 86_400_000_000n); // +1 day

const seq = TGeomPointSeq.fromInstants([i1, i2]);

i1.free(); i2.free(); seq.free();
```

### From sequences (sequence set)

```ts
import { TGeomPoint, TGeomPointSeqSet } from 'meos.js';

const s1 = TGeomPoint.fromString('[POINT(0 0)@2024-01-01, POINT(5 5)@2024-01-06]');
const s2 = TGeomPoint.fromString('[POINT(10 10)@2024-01-10, POINT(15 15)@2024-01-15]');

const ss = TGeomPointSeqSet.fromSequences([s1, s2]);

s1.free(); s2.free(); ss.free();
```

## Reading values

```ts
const seq = TGeomPoint.fromString('[POINT(0 0)@2024-01-01, POINT(10 10)@2024-01-11]');

seq.startValue();   // "POINT(0 0)"  - WKT string
seq.endValue();     // "POINT(10 10)"
seq.numInstants();  // 2
seq.valueN(0);      // "POINT(0 0)"
seq.valueN(99);     // null (out of range)

seq.free();
```

## Output

```ts
const t = TGeomPoint.fromString('POINT(1 1)@2024-01-01');

t.toString();    // "POINT(1 1)@2024-01-01 00:00:00+00"
t.asText();      // WKT string (alias)
t.asHexWKB();    // binary hex-encoded WKB
t.asMFJSON();    // MF-JSON string  (TGeomPoint only)

t.free();
```

## Trajectory and movement

```ts
const seq = TGeomPoint.fromString('[POINT(0 0)@2024-01-01, POINT(3 4)@2024-01-06]');

seq.trajectory();      // "LINESTRING(0 0,3 4)"
seq.length();          // 5.0  (Euclidean distance for TGeomPoint)
seq.direction();       // bearing angle in radians (TGeomPoint only)
seq.isSimple();        // true  (no self-intersection)
```

### Speed, cumulative length, angular difference

These return a raw WASM pointer to a `TFloat` sequence:

```ts
import { TFloat, meos_free } from 'meos.js';

const seq = TGeomPoint.fromString(
    '[POINT(0 0)@2024-01-01, POINT(3 4)@2024-01-06, POINT(0 0)@2024-01-11]'
);

const speedPtr = seq.speed();
const speed    = new TFloat(speedPtr); // m/s for TGeogPoint, map units/µs for TGeomPoint

const clPtr = seq.cumulativeLength();
const cl    = new TFloat(clPtr);

const adPtr = seq.angularDifference();
const ad    = new TFloat(adPtr);

speed.free(); cl.free(); ad.free();
seq.free();
```

### X / Y component sequences

```ts
import { TFloat, meos_free } from 'meos.js';

const seq = TGeomPoint.fromString('[POINT(0 0)@2024-01-01, POINT(3 4)@2024-01-06]');

const xPtr = seq.getX(); // raw TFloat Ptr
const yPtr = seq.getY();
const zPtr = seq.getZ(); // only valid when hasZ() is true - throws otherwise

seq.hasZ(); // false for 2D, true for 3D

meos_free(xPtr); meos_free(yPtr);
seq.free();
```

## Rounding coordinates

```ts
const t = TGeomPoint.fromString('[POINT(1.23456 4.56789)@2024-01-01, POINT(2.34567 5.67891)@2024-01-11]');

const r = t.round(2);        // coordinates rounded to 2 decimal places
r.toString();                // includes "1.23" and "4.57"

t.free(); r.free();
```

## Spatial reference (TGeomPoint)

```ts
const t = TGeomPoint.fromString('POINT(1 1)@2024-01-01');

t.srid();           // 0 (unset)

const t2 = t.setSrid(4326);
t2.srid();          // 4326

t.free(); t2.free();
```

## Spatial restrictions

```ts
const seq = TGeomPoint.fromString('[POINT(0 0)@2024-01-01, POINT(10 10)@2024-01-11]');

// Restrict to instants inside the polygon
const r = seq.atGeom('POLYGON((-1 -1, 6 -1, 6 6, -1 6, -1 -1))');
// r is null if no instants fall inside

r?.free(); seq.free();
```

## Distance

```ts
const seq = TGeomPoint.fromString('[POINT(0 0)@2024-01-01, POINT(10 10)@2024-01-11]');

// Nearest approach distance to a static point
const d = seq.nad('POINT(5 0)'); // scalar distance

// Temporal distance - returns a TFloat Ptr
import { TFloat, meos_free } from 'meos.js';
const tdPtr = seq.temporalDistance('POINT(5 0)');
const td    = new TFloat(tdPtr);

seq.free(); td.free();
```

### Geodetic distance (TGeogPoint)

`TGeogPoint` uses the WGS 84 ellipsoid. All distance results are in **metres**:

```ts
const paris  = TGeogPoint.fromString('POINT(2.35 48.85)@2024-01-01');
const berlin = 'POINT(13.40 52.52)';

paris.nad(berlin);  // ≈ 878_000  (metres from Paris to Berlin)
paris.free();
```

## Ever / always comparisons

```ts
const t = TGeomPoint.fromString('POINT(1 1)@2024-01-01');

t.everEq('POINT(1 1)');       // true
t.everEq('POINT(9 9)');       // false
t.everIntersects('POINT(1 1)'); // true

t.free();
```

## Bounding box

```ts
import { meos_free } from 'meos.js';

const seq = TGeomPoint.fromString('[POINT(0 0)@2024-01-01, POINT(10 10)@2024-01-11]');

const boxPtr = seq.toSTBox(); // raw STBox Ptr
// use STBox constructor if you need to inspect it
meos_free(boxPtr);

seq.free();
```
