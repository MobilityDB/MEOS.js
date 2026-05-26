# Temporal Types

A **temporal type** tracks how a scalar value changes over time. Every temporal value is a
sequence of `(value, timestamp)` pairs with a defined interpolation between them.

MEOS.js provides four scalar temporal types:

| Class | Value type | Interpolation |
|---|---|---|
| `TBool` | `boolean` | Stepwise |
| `TInt` | `number` (integer) | Stepwise |
| `TFloat` | `number` (IEEE 754) | Linear or stepwise |
| `TText` | `string` | Stepwise |

## Subtypes

Every temporal type has three **subtypes** depending on how many instants it holds:

| Subtype | Shape | Example WKT |
|---|---|---|
| **Instant** | Single `(value, timestamp)` pair | `true@2024-01-01` |
| **Sequence** | Ordered list of instants with inclusive/exclusive bounds | `[1@2024-01-01, 5@2024-01-03]` |
| **SequenceSet** | Ordered set of non-overlapping sequences | `{[1@2024-01-01, 5@2024-01-03],[8@2024-02-01]}` |

The base class (`TBool`, `TInt`, …) accepts all three subtypes.  
Concrete subtype classes (`TBoolInst`, `TBoolSeq`, `TBoolSeqSet`, …) offer subtype-specific constructors.

## Creating temporal values

### From a WKT string

```ts
import { initMeos, TBool, TInt, TFloat, TText } from 'meos.js';
await initMeos();

const b = TBool.fromString('true@2024-01-01');
const i = TInt.fromString('[1@2024-01-01, 5@2024-01-03, 5@2024-01-07]');
const f = TFloat.fromString('[0.0@2024-01-01, 1.0@2024-01-31]');
const t = TText.fromString('{[hello@2024-01-01, hello@2024-01-15],[world@2024-02-01]}');
```

### From a constant value (instant)

```ts
// TBool.fromInstant(value, timestampMicros)
// Timestamp is microseconds since 2000-01-01 UTC
const b = TBool.fromInstant(true, 0n);   // true@2000-01-01
const i = TInt.fromInstant(42, 0n);
```

### From subtype constructors

```ts
import { TBoolInst, TBoolSeq, TBoolSeqSet } from 'meos.js';

const inst = TBoolInst.fromValue(true, 0n);

const seq = TBoolSeq.fromInstants([
    TBoolInst.fromValue(true,  0n),
    TBoolInst.fromValue(false, 86_400_000_000n), // + 1 day in µs
]);

const ss = TBoolSeqSet.fromSequences([seq1, seq2]);
```

### Factory function

`createTBool` (and `createTInt`, `createTFloat`, `createTText`) returns the most specific
subtype when you hold a raw WASM pointer:

```ts
import { createTBool } from 'meos.js';

const typed = createTBool(ptr); // TBoolInst | TBoolSeq | TBoolSeqSet
```

## Reading values

```ts
const f = TFloat.fromString('[0.0@2024-01-01, 1.0@2024-01-31]');

f.startValue();    // 0
f.endValue();      // 1
f.numInstants();   // 2
f.valueN(0);       // 0  (0-based index)
f.valueN(1);       // 1
f.interpolation(); // TInterpolation.Linear

f.free();
```

## Interpolation

Temporal floats can be **linear** (value changes continuously) or **stepwise** (value
stays constant until the next instant). The default for `TFloat` sequences is linear.

```ts
import { TInterpolation } from 'meos.js';

const step = TFloat.fromString('Interp=Step;[0.0@2024-01-01, 1.0@2024-01-15]');
step.interpolation(); // TInterpolation.Step

const lin = TFloat.fromString('[0.0@2024-01-01, 1.0@2024-01-15]');
lin.interpolation(); // TInterpolation.Linear
```

## Logical operations (TBool)

```ts
const a = TBool.fromString('[true@2024-01-01, true@2024-01-15]');
const b = TBool.fromString('[false@2024-01-01, true@2024-01-31]');

const n = a.not();          // temporal negation
const c = a.and(b);         // temporal AND
const d = a.or(b);          // temporal OR
const e = a.and(true);      // AND with constant

n.free(); c.free(); d.free(); e.free();
```

### When-true / when-false

```ts
import { TsTzSpanSet } from 'meos.js';

const t = TBool.fromString('[true@2024-01-01, true@2024-01-15, false@2024-02-01]');

const whenTrue: TsTzSpanSet  = t.whenTrue();
const whenFalse: TsTzSpanSet = t.whenFalse();

whenTrue.free(); whenFalse.free();
```

## Arithmetic operations (TInt / TFloat)

```ts
const a = TFloat.fromString('[1.0@2024-01-01, 5.0@2024-01-05]');
const b = TFloat.fromString('[2.0@2024-01-01, 2.0@2024-01-05]');

const sum  = a.add(b);       // temporal addition
const diff = a.sub(b);       // temporal subtraction
const prod = a.mul(2.0);     // multiply by constant
const quot = a.div(2.0);     // divide by constant

sum.free(); diff.free(); prod.free(); quot.free();
```

### Aggregates

```ts
const f = TFloat.fromString('[0.0@2024-01-01, 10.0@2024-01-11]');

f.integral();          // area under the curve (value × time in seconds)
f.twAvg();             // time-weighted average
f.minValue();          // 0
f.maxValue();          // 10
```

## Restrictions

Restrict a temporal value to instants where the value satisfies a condition:

```ts
const i = TInt.fromString('[1@2024-01-01, 5@2024-01-05, 3@2024-01-10]');

const at3    = i.atValue(3);          // only instants where value = 3
const not3   = i.minusValue(3);       // all instants where value ≠ 3
const atVals = i.atValues([1, 3]);    // instants with value in {1, 3}

at3?.free(); not3?.free(); atVals?.free();
```

## Ever / always comparisons

```ts
const b = TBool.fromString('{true@2024-01-01, false@2024-01-02}');

b.everEq(true);    // true  (value is true at some point)
b.alwaysEq(true);  // false (value is not always true)
b.neverEq(true);   // false
```

## Temporal comparisons

```ts
const i = TInt.fromString('[1@2024-01-01, 5@2024-01-05]');

// Returns a TBool that is true at each instant where the condition holds
const gt3: TBool = i.temporalGt(3);
const eq5: TBool = i.temporalEq(5);

gt3.free(); eq5.free();
```

## Output formats

```ts
const f = TFloat.fromString('[0.0@2024-01-01, 1.0@2024-01-31]');

f.toString();    // WKT: "[0@2024-01-01 00:00:00+00, 1@2024-01-31 00:00:00+00]"
f.toMFJSON();    // MF-JSON string
f.toHexWKB();    // binary hex-encoded WKB
```

## Conversions

```ts
import { TBool, TInt } from 'meos.js';

const b = TBool.fromString('true@2024-01-01');

// TBool → TInt (true = 1, false = 0)
import { TInt } from 'meos.js';
const ptr = b.toTInt();
const asInt = new TInt(ptr);
asInt.free();
b.free();
```
