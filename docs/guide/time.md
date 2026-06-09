# Time Types

MEOS.js has three families of time-related types.
Each family mirrors the structure of the number types: a span, a span set, and a set.

| Family | Span | Span Set | Set |
|---|---|---|---|
| Calendar dates | `DateSpan` | `DateSpanSet` | `DateSet` |
| Timestamps with tz | `TsTzSpan` | `TsTzSpanSet` | `TsTzSet` |

## Internal representation

### DateADT

Calendar dates are stored as **days since 2000-01-01** (a `number` alias called `DateADT`).
Day 0 = 2000-01-01, day 1 = 2000-01-02, day -1 = 1999-12-31.

### TimestampTz

Timestamps are stored as **microseconds since 2000-01-01 00:00:00 UTC**
(a `number` alias called `TimestampTz`).
At runtime, `tbox_tmin()` and `tbox_tmax()` return `BigInt`, see [TBox guide](./tbox.md).

## Date spans

```ts
import { initMeos, DateSpan } from 'meos.js';
await initMeos();

const s = DateSpan.fromString('[2020-01-01, 2020-12-31]');

s.lower();        // DateADT - days since 2000-01-01
s.upper();        // DateADT
s.lowerInc();     // true
s.upperInc();     // true
s.durationDays(); // upper - lower  (number of days between bounds)
s.distance(DateSpan.fromString('[2021-06-01, 2021-12-31]')); // gap in days
```

### Creating from raw DateADT values

Convert a JS `Date` to `DateADT` manually:

```ts
function toDateADT(date: Date): number {
  const epoch2000 = Date.UTC(2000, 0, 1);
  return Math.floor((date.getTime() - epoch2000) / 86_400_000);
}

const lower = toDateADT(new Date('2020-01-01'));
const upper = toDateADT(new Date('2020-12-31'));
const s = DateSpan.fromBounds(lower, upper, true, true);
```

### Converting to TsTzSpan

```ts
import { TsTzSpan } from 'meos.js';

const ds = DateSpan.fromString('[2020-01-01, 2020-12-31]');
const ts = new TsTzSpan(ds.toTsTzSpan()); // bounds become midnight UTC
```

## Date span sets

```ts
import { DateSpanSet } from 'meos.js';

const ss = DateSpanSet.fromString('{[2020-01-01, 2020-06-01), [2020-09-01, 2020-12-31]}');

ss.numSpans();  // 2
ss.lower();     // DateADT of 2020-01-01
ss.upper();     // DateADT of 2020-12-31
ss.numDates();  // total distinct dates across all spans
ss.startDate(); // DateADT of 2020-01-01
ss.endDate();   // DateADT of 2020-12-31
ss.dateN(0);    // DateADT of first date in the first span
```

Shift by days:

```ts
const shifted = ss.shiftScale(30, 0, true, false); // shift +30 days
```

## Timestamp spans

```ts
import { TsTzSpan } from 'meos.js';

const s = TsTzSpan.fromString('[2020-01-01, 2020-12-31]');

s.lower();      // TimestampTz (microseconds since 2000-01-01 UTC)
s.upper();      // TimestampTz
s.durationMs(); // (upper - lower) / 1000  - duration in milliseconds
```

`isAdjacent` on `TsTzSpan` delegates to the MEOS C implementation, which correctly
handles exclusive-bound adjacency at the microsecond level.

## Timestamp span sets

```ts
import { TsTzSpanSet } from 'meos.js';

const ss = TsTzSpanSet.fromString(
  '{[2020-01-01, 2020-06-01), [2020-09-01, 2020-12-31]}'
);

ss.numTimestamps();   // total distinct timestamps across all spans
ss.startTimestamp();  // TimestampTz of the lower bound of the first span
ss.endTimestamp();    // TimestampTz of the upper bound of the last span
ss.timestampN(0);     // TimestampTz of the first timestamp (0-based)

ss.durationMs();        // sum of individual durations in ms
ss.durationMs(true);    // bounding span duration in ms
```

## Timestamp sets

```ts
import { TsTzSet } from 'meos.js';

const s = TsTzSet.fromString('{2020-01-01, 2020-06-15, 2020-12-31}');

s.numValues();    // 3
s.startValue();   // TimestampTz of 2020-01-01
s.valueN(1);      // TimestampTz of 2020-06-15
```

Convert to a `DateSet` by truncating to midnight:

```ts
import { DateSet } from 'meos.js';

const dates = new DateSet(s.toDateSet());
```
