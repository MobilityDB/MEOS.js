import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import { initMeos } from '../../core/runtime/meos.js';
import {
	FloatSpan,
	IntSet,
	TBox,
	TextSet,
	TsTzSpan,
	IntSpan,
	IntSpanSet,
	Temporal,
	TFloat,
	TFloatInst,
	TFloatSeq,
	TFloatSeqSet,
	TSequence,
	TNumber,
} from '../../core/objects/objects.generated.js';

// The object layer is generated from the catalog's objectModel
// (codegen/ObjectGenerator.ts); these cases exercise each marshalling rule it
// applies on the live module, not a method list of their own.

const T0 = '2000-01-01 00:00:00+00';
const T1 = '2000-01-01 00:01:00+00';
const T2 = '2000-01-01 00:02:00+00';

before(async () => {
	await initMeos();
});

describe('generated object layer: the factory', () => {
	it('wraps a value in the concrete class its header names', () => {
		const inst = TFloat.in(`1.5@${T0}`);
		const seq = TFloat.in(`[1@${T0}, 3@${T2}]`);
		const ss = TFloat.in(`{[1@${T0}, 3@${T1}], [5@${T2}]}`);
		assert.ok(inst instanceof TFloatInst);
		assert.ok(seq instanceof TFloatSeq);
		assert.ok(ss instanceof TFloatSeqSet);
		// The model's lattice is the class chain.
		assert.ok(seq instanceof TFloat && seq instanceof TNumber && seq instanceof Temporal);
		inst.free();
		seq.free();
		ss.free();
	});

	it('writes itself with the text writer the catalog names', () => {
		using t = TFloat.in(`[1.5@${T0}, 2.5@${T1}]`);
		assert.equal(t.toString(), `[1.5@${T0}, 2.5@${T1}]`);
	});
});

describe('generated object layer: arrays', () => {
	it('answers an array of values MEOS counts through an out-parameter', () => {
		using t = TFloat.in(`[1@${T0}, 3@${T2}]`);
		assert.deepEqual(t.values(), [1, 3]);
		assert.equal(t.timestamps().length, 2);
	});

	it('answers an array of MEOS values, each wrapped in its class', () => {
		using t = TFloat.in(`[1@${T0}, 3@${T2}]`);
		const instants = t.instants();
		assert.equal(instants.length, t.numInstants());
		for (const i of instants) assert.ok(i instanceof TFloatInst);
		assert.equal(instants[1].toString(), `3@${T2}`);
		instants.forEach(i => i.free());
	});

	it('takes an array of MEOS values for a counted array argument', () => {
		const a = TFloat.in(`1@${T0}`);
		const b = TFloat.in(`3@${T2}`);
		// interp 3 is LINEAR in interpType; normalize as the SQL constructor does
		const seq = TSequence.make([a, b], true, true, 3, true);
		assert.ok(seq instanceof TFloatSeq);
		assert.equal(seq.toString(), `[1@${T0}, 3@${T2}]`);
		const merged = Temporal.mergeArray([a, b]);
		assert.equal(merged.numInstants(), 2);
		[a, b, seq, merged].forEach(x => x.free());
	});

	it('copies each inline struct out of an answered array', () => {
		using ss = IntSpanSet.in('{[1, 3), [5, 7)}');
		const spans = ss.spans();
		assert.deepEqual(spans.map(s => s.toString()), ['[1, 3)', '[5, 7)']);
		for (const s of spans) assert.ok(s instanceof IntSpan);
		spans.forEach(s => s.free());
	});
});

describe('generated object layer: values and buffers', () => {
	it('carries a scalar-only struct as a value', () => {
		using t = TFloat.in(`1@${T0}`);
		using shifted = t.shiftTime({ time: 60_000_000, day: 0, month: 0 });
		assert.equal(shifted.toString(), `1@${T1}`);
	});

	it('answers a byte buffer for the size MEOS writes', () => {
		using t = TFloat.in(`1@${T0}`);
		const wkb = t.asWKB(0);
		assert.ok(wkb instanceof Uint8Array && wkb.length > 0);
	});

	it('narrows a constructor to the class the model assigns it', () => {
		using s = IntSpan.make(1, 5, true, false);
		assert.ok(s instanceof IntSpan);
		assert.equal(s.toString(), '[1, 5)');
		assert.equal(s.lower(), 1);
		assert.equal(s.upper(), 5);
	});
});

describe('generated object layer: operators', () => {
	// The operators the catalog assigns each class (`classes.<C>.operators`),
	// one method per name that chooses the overload by its arguments.
	it('chooses the overload a scalar argument fits', () => {
		using t = TFloat.in(`[1@${T0}, 3@${T2}]`);
		using plus = t.add(1);
		assert.equal(plus!.toString(), `[2@${T0}, 4@${T2}]`);
		assert.equal(t.nad(5), 2);
	});

	it('passes an argument no overload of the class takes to the inherited operator', () => {
		using t = TFloat.in(`[1@${T0}, 3@${T2}]`);
		using u = TFloat.in(`[10@${T0}, 10@${T2}]`);
		using sum = t.add(u);
		assert.equal(sum!.toString(), `[11@${T0}, 13@${T2}]`);
	});

	it('names a reflected operator apart from its mirror', () => {
		using t = TFloat.in(`[1@${T0}, 3@${T2}]`);
		using diff = t.rsub(10);
		assert.equal(diff.toString(), `[9@${T0}, 7@${T2}]`);
	});

	it('answers the ever comparison MEOS answers', () => {
		using t = TFloat.in(`[1@${T0}, 3@${T2}]`);
		assert.equal(t.everEq(3), 1);
		assert.equal(t.everEq(5), 0);
	});

	it('is a member of the instantiation its SQL signatures name', () => {
		using s = IntSet.in('{1, 2, 3}');
		using sub = IntSet.in('{1, 2}');
		assert.equal(s.contains(2), true);
		assert.equal(s.contains(sub), true);
		using a = IntSpan.make(1, 5, true, false);
		using b = IntSpan.make(7, 9, true, false);
		assert.equal(a.contains(3), true);
		using u = a.union(b);
		assert.equal(u!.toString(), '{[1, 5), [7, 9)}');
	});

	it('refuses an argument no overload takes', () => {
		using t = TFloat.in(`1@${T0}`);
		assert.throws(() => (t as unknown as { nad(x: unknown): number }).nad('x'), TypeError);
	});
});

describe('generated object layer: byte arrays, scalar arrays and out-parameters', () => {
	it('reads a value back from the WKB it writes', () => {
		using t = TFloat.in(`[1@${T0}, 3@${T2}]`);
		using back = Temporal.fromWKB(t.asWKB(0));
		assert.ok(back instanceof TFloatSeq);
		assert.equal(back.toString(), t.toString());
		using s = IntSpan.make(1, 5, true, false);
		using sback = IntSpan.fromWKB(s.asWKB(0));
		assert.equal(sback.toString(), '[1, 5)');
	});

	it('answers a value MEOS writes through a pointer, or null where it finds none', () => {
		using t = TFloat.in(`[1@${T0}, 3@${T2}]`);
		const start = t.startTimestamptz();
		assert.equal(t.valueAtTimestamptz(start, true), 1);
		using later = TFloat.in(`5@${T2}`);
		assert.equal(t.valueAtTimestamptz(later.startTimestamptz() + 60_000_000, true), null);
	});

	it('takes an array of scalars for a counted array argument', () => {
		using s = IntSet.make([3, 1, 2]);
		assert.equal(s.toString(), '{1, 2, 3}');
	});
});

describe('generated object layer: constructors from base values', () => {
	// `<base>_to_<type>` is `<Type>.from<Base>` in the model (MEOS-API #249).
	it('builds a box from a number', () => {
		using b = TBox.fromFloat(1.5);
		assert.equal(b.toString(), 'TBOXFLOAT X([1.5, 1.5])');
	});

	it('builds the instantiation the SQL return type names', () => {
		using s = IntSet.fromInt(3);
		assert.ok(s instanceof IntSet);
		assert.equal(s.toString(), '{3}');
		using f = FloatSpan.fromFloat(2.5);
		assert.equal(f.toString(), '[2.5, 2.5]');
	});
});

describe('generated object layer: the wrappers the flat surface no longer writes by hand', () => {
	it('reads the bounds of a timestamptz span', () => {
		using s = TsTzSpan.in(`[${T0}, ${T2})`);
		using t = TFloat.in(`1@${T0}`);
		assert.equal(s.lower(), t.startTimestamptz());
		assert.ok(s.upper() > s.lower());
	});

	it('compares and tells the adjacency of spans by their bounds', () => {
		using a = TsTzSpan.in(`[${T0}, ${T1})`);
		using b = TsTzSpan.in(`[${T0}, ${T1})`);
		using c = TsTzSpan.in(`[${T1}, ${T2})`);
		assert.equal(a.eq(b), true);
		assert.equal(a.adjacent(c), true);
	});

	it('answers the n-th text of a set, or null past its end', () => {
		using s = TextSet.in('{"a", "b"}');
		assert.equal(s.valueN(1), 'a');
		assert.equal(s.valueN(3), null);
	});

	it('writes hex WKB and MF-JSON, with no SRS for a null one', () => {
		using t = TFloat.in(`[1@${T0}, 3@${T2}]`);
		using back = Temporal.fromHexWKB(t.asHexWKB(0));
		assert.equal(back.toString(), t.toString());
		assert.ok(t.asMFJSON(0, 3, 6, null).includes('"MovingFloat"'));
	});

	it('answers the n-th instant at the index MEOS counts from 1', () => {
		using t = TFloat.in(`[1@${T0}, 3@${T2}]`);
		using second = t.instantN(2);
		assert.equal(second!.toString(), `3@${T2}`);
	});
});
