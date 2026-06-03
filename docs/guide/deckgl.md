# DeckGL Integration

MEOS.js ships an optional adapter for rendering temporal points with
[deck.gl](https://deck.gl/)'s [`TripsLayer`](https://deck.gl/docs/api-reference/geo-layers/trips-layer).
It turns a `TGeomPoint` / `TGeogPoint` into the `{ path, timestamps }` structure
the layer expects, and lets you run MobilityDB temporal logic **in the browser**
rather than on a server.

The integration is split into two sub-exports so the core library never depends
on deck.gl or React:

| Import | Depends on | Contents |
|---|---|---|
| `meos.js/deckgl` | nothing (only MEOS.js) | the adapter and the temporal helpers |
| `meos.js/deckgl/layer` | `@deck.gl/*` (peer) | the ready-to-use `TripsLayer` factory |

`@deck.gl/core` and `@deck.gl/geo-layers` are **optional peer dependencies**:
installing `meos.js` does not pull them in. Install them yourself when you use
`meos.js/deckgl/layer`:

```bash
npm install @deck.gl/core @deck.gl/geo-layers
```

## The adapter

### `tgeompointsToTrips`

Converts a list of temporal points into trips on a single shared animation
clock, the right entry point for an animated layer:

```ts
import { initMeos, TGeomPoint } from 'meos.js';
import { tgeompointsToTrips } from 'meos.js/deckgl';

await initMeos();

const trajectories = [
    TGeomPoint.fromString('SRID=4326;[POINT(4.35 50.85)@2024-01-15 09:00:00+00, POINT(4.37 50.86)@2024-01-15 09:10:00+00]'),
    // …
];

const { trips, timeOrigin, timeRange } = tgeompointsToTrips(trajectories);
```

| Field | Type | Meaning |
|---|---|---|
| `trips` | `{ path: [number, number][]; timestamps: number[] }[]` | one entry per trip segment |
| `timeOrigin` | `number` | epoch ms corresponding to `t = 0` |
| `timeRange` | `[number, number]` | `[0, max]` extent of the timestamps |

The shared `timeOrigin` is the earliest instant across **all** inputs, so the
trips stay synchronized. Use `timeRange` to drive a time slider / animation loop.

### `tgeompointToTrips`

Converts a single temporal point and returns an **array** of trips: a sequence
set (a trajectory with temporal gaps) maps to one trip per sub-sequence:

```ts
import { tgeompointToTrips } from 'meos.js/deckgl';

const trips = tgeompointToTrips(t); // Trip[]
```

### Options

Both functions accept the same options:

```ts
tgeompointsToTrips(trajectories, {
    timeOrigin: Date.parse('2024-01-15T09:00:00Z'), // pin t = 0 (default: earliest instant)
    timeUnit: 'seconds',                            // 'seconds' (default) | 'milliseconds'
    precision: 6,                                   // coordinate decimals (default: 6)
});
```

Pinning `timeOrigin` to a fixed value keeps the clock stable when you re-run the
conversion on a filtered subset.

## Browser-side temporal logic

These helpers run MobilityDB operations on the wasm module and return trips
ready to render. They manage the lifecycle of every intermediate value they
create; you only free the temporal points you allocate yourself.

### Restrict to a zone: `atGeometry`

Wraps `tpoint_at_geom`. The WKT is interpreted in the trajectory's own SRID, so
plain lon/lat polygons work against 4326 data. An empty intersection yields `[]`.

```ts
import { atGeometry } from 'meos.js/deckgl';

const trips = atGeometry(t, 'POLYGON((4.34 50.84, 4.37 50.84, 4.37 50.87, 4.34 50.87, 4.34 50.84))');
```

### Restrict to a period: `atTime`

Wraps `temporal_at_tstzspan`. `period` may be a `TsTzSpan` or its textual form; a
string is created and freed internally.

```ts
import { atTime } from 'meos.js/deckgl';

const trips = atTime(t, '[2024-01-15 09:01:00+00, 2024-01-15 09:06:00+00]');
```

### Speed: `speedSeries` and `tripsWithSpeed`

`speedSeries` wraps `tpoint_speed` and returns a per-segment scalar series
aligned with the trips' vertices (the raw `TFloat` pointer is freed for you):

```ts
import { speedSeries } from 'meos.js/deckgl';

const series = speedSeries(t); // { values: number[]; timestamps: number[] }[]
```

`tripsWithSpeed` zips that speed channel onto each trip, ready for colour
mapping:

```ts
import { tripsWithSpeed } from 'meos.js/deckgl';

const trips = tripsWithSpeed(t); // (Trip & { speeds: number[] })[]
```

## The ready-to-use layer

`meos.js/deckgl/layer` builds a configured `TripsLayer` for you. It is a
*factory*, not a subclass, robust across deck.gl versions.

### `tripsLayer`

Builds a layer from already-converted trips (or a `TripCollection`). `getPath`
and `getTimestamps` default to the `Trip` shape but can be overridden; `data`
always comes from the source.

```ts
import { tgeompointsToTrips } from 'meos.js/deckgl';
import { tripsLayer } from 'meos.js/deckgl/layer';

const collection = tgeompointsToTrips(trajectories);

const layer = tripsLayer(collection, {
    currentTime,
    trailLength: 180,
    widthMinPixels: 4,
    fadeTrail: true,
    getColor: [253, 128, 93],
});
```

### `tripsLayerFromTGeompoints`

One-call convenience that converts and builds at once:

```ts
import { tripsLayerFromTGeompoints } from 'meos.js/deckgl/layer';

const layer = tripsLayerFromTGeompoints(trajectories, { currentTime, widthMinPixels: 4 });
```

If you need the shared `timeRange` / `timeOrigin` to drive the animation clock,
call `tgeompointsToTrips` then `tripsLayer` directly; this convenience discards
that metadata.

## Interleaving over a MapLibre basemap

deck.gl can render *interleaved* over a MapLibre map, so the trips draw on top of
an existing basemap:

```ts
import maplibregl from 'maplibre-gl';
import { MapboxOverlay } from '@deck.gl/mapbox';

const map = new maplibregl.Map({ container: 'map', style /* … */ });
const overlay = new MapboxOverlay({ interleaved: true, layers: [] });
map.addControl(overlay);

// On every animation frame:
overlay.setProps({ layers: [tripsLayer(collection, { currentTime })] });
```

::: tip Updating colours
deck.gl caches accessor outputs. When you change an accessor such as `getColor`
(for example, toggling speed-based colouring), pass `updateTriggers` so the layer
recomputes: `tripsLayer(collection, { getColor, updateTriggers: { getColor: mode } })`.
:::

## Browser requirement

Like all of MEOS.js, the wasm module requires **WebAssembly Memory64** support to
run in a browser (recent Chromium-based browsers or Firefox). See
[Getting Started](./getting-started).

## Full example

A complete animated demo (MEOS.js → adapter → `TripsLayer` interleaved over
MapLibre, with in-browser zone / time / speed controls) lives in the
[MEOS.js-examples](https://github.com/MobilityDB/MEOS.js-examples) repository.
