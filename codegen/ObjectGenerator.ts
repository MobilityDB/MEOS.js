/**
 * Generates the MEOS.js object layer from the catalog's object model:
 *
 *   core/objects/objects.generated.ts  — one class per class of the model, each
 *                                        method delegating to the flat wrapper
 *                                        FunctionsGenerator.ts emits for its
 *                                        function, plus the factory that wraps a
 *                                        MEOS pointer in the class its runtime
 *                                        type names.
 *   GAP-LEDGER.md                      — every method the model assigns that the
 *                                        layer cannot emit, and the contract each
 *                                        one is missing.
 *
 * The catalog's `objectModel` is the ecosystem-wide statement of the class
 * hierarchy implicit in MEOS: `lattice` carries the temporal tree, `companions`
 * the Box, Collection and Value hierarchies, and `classes.<Class>.methods`
 * assigns every public MEOS function to the class it is a method of, under its
 * canonical camelCase `ooName`. This projects that model onto TypeScript as the
 * object generators of MEOS.NET and GoMEOS (`tools/objectgen.py`) project it
 * onto C# and Go: one class per model class, the model's parent edge spelled as
 * `extends`, and one method per assigned function.
 *
 * THE WRAPPER SIGNATURES COME FROM FunctionsGenerator.emittedSignatures, never
 * from the raw C parameter list, so the two generators cannot disagree about a
 * folded out-parameter or about which functions have a wrapper at all — as the
 * siblings read `codegen.SIGNATURES`.
 *
 * NOTHING HERE NAMES A FUNCTION, A CLASS OR A METHOD. A member the model assigns
 * that no rule below can marshal is deferred into the ledger with the reason,
 * never guessed and never written by hand.
 *
 * Run: npm run generate
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
	IDL_PATH,
	emittedSignatures,
	ownTypeNames,
	ownTypeAliases,
	type Idl,
	type IdlFunction,
	type WrapperParam,
	type WrapperSignature,
} from './FunctionsGenerator.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// -------------------------------------------------------------------------
// CATALOG SCHEMA (the parts this generator reads)
// -------------------------------------------------------------------------

interface MethodEntry {
	function: string;
	role: string;
	scope: string;
	ooName: string;
	ooExclude?: boolean;
	/** On an operator: the operand the method is called on. */
	receiver?: 'left' | 'right';
	/** On an operator: the type token of the other operand. */
	other?: string;
	/** On an operator: the class the other operand's SQL types instantiate. */
	otherClass?: string;
	/** Every SQL signature answers the receiver's own type (`answersReceiver`). */
	answersReceiver?: boolean;
	/** The class each receiver class gets back, where the answer is a template. */
	returnInstantiations?: { receiverClass: string; returnClass: string }[];
}
interface LatticeNode {
	kind: string;
	parent: string | null;
	temptypes?: string[];
	doc?: string;
}
interface CompanionNode {
	parent: string | null;
	temptype?: string | null;
	doc?: string;
}
interface ObjectModel {
	lattice: Record<string, LatticeNode>;
	axes: { subtype: { values: { name: string; value: number; class: string | null }[] } };
	companions: Record<string, { nodes?: Record<string, CompanionNode> } | string>;
	classes: Record<string, { cType?: string; methods: MethodEntry[]; operators?: MethodEntry[] }>;
}
interface Shape {
	outParams?: string[];
	arrayReturn?: {
		lengthFrom: { kind: string; name: string };
		element: { canonical: string };
		/** The function that releases the answered array, and what it holds with it. */
		releasedBy?: { function: string; param: string };
	};
	inputArrays?: { param: string; lengthFrom: { kind: string; name: string }; element: { canonical: string } }[];
	outputArrays?: { param: string }[];
	nullableResult?: string;
}
interface Encoding {
	encodings?: string[];
	encoders?: Record<string, string>;
	decoders?: Record<string, string>;
	writers?: Record<string, Record<string, string>>;
	readers?: Record<string, Record<string, string>>;
}
/**
 * The two functions MEOS names from an enumeration that write and read its
 * values as text (`interptype_name`, `interptype_from_string`), as the catalog
 * states them in `enums[].text`.
 */
interface EnumText {
	name: string;
	fromString: string;
}
interface FullIdl extends Idl {
	objectModel: ObjectModel;
	structs: { name: string; sizeBytes?: number; fields: { name: string; canonical?: string; offset_bits: number }[] }[];
	enums: { name: string; values?: { name: string; value: number }[]; text?: EnumText }[];
	macros?: { name: string; value: unknown }[];
	typeEncodings?: Record<string, Encoding>;
	sourceCommit?: string;
}

// -------------------------------------------------------------------------
// THE MODEL
// -------------------------------------------------------------------------

/**
 * The C structs that carry the Temporal header and are discriminated by its
 * `subtype` field. A pointer to any of them is a Temporal at the surface and the
 * factory hands back the concrete class the header names, as #class_for_ctype
 * of MEOS.NET's tools/objectgen.py resolves them.
 */
const TEMPORAL_STRUCTS = new Set(['Temporal', 'TInstant', 'TSequence', 'TSequenceSet']);

/** The suffix a concrete class takes for each template subtype, as the siblings name them. */
const SUBTYPE_SUFFIX: Record<string, string> = { TInstant: 'Inst', TSequence: 'Seq', TSequenceSet: 'SeqSet' };

/** The struct field each root's runtime type is read from, as #factory_file of MEOS.NET reads it. */
const DISCRIMINATOR: Record<string, string> = {
	Temporal: 'temptype', Set: 'settype', Span: 'spantype', SpanSet: 'spansettype',
};

const clean = (t: string) => t.replace(/\bconst\b/g, '').replace(/\bstruct\s+/g, '').replace(/\s+/g, ' ').trim();

/**
 * The class hierarchy the catalog defines, indexed for emission: the TypeScript
 * twin of #Model in MEOS.NET's tools/objectgen.py, built as its #_build builds it.
 */
class Model {
	readonly om: ObjectModel;
	readonly functions: Map<string, IdlFunction>;
	readonly parent = new Map<string, string | null>();
	readonly ctype = new Map<string, string>();
	readonly meostype = new Map<string, string>();
	readonly subtypeOf = new Map<string, string>();
	/** C struct -> the shallowest class a pointer to it is wrapped in. */
	readonly wrapRoot = new Map<string, string>();
	readonly doc = new Map<string, string>();

	/** Mirrors #_build of MEOS.NET's tools/objectgen.py, step for step. */
	constructor(readonly idl: FullIdl) {
		this.om = idl.objectModel;
		this.functions = new Map(idl.functions.map(f => [f.name, f]));

		for (const [name, node] of Object.entries(this.om.lattice)) {
			this.parent.set(name, node.parent);
			if (node.doc) this.doc.set(name, node.doc);
			const temptypes = node.temptypes ?? [];
			if (node.kind === 'leaf' && temptypes.length === 1) this.meostype.set(name, temptypes[0]);
		}
		// The template subtypes are classes of their own, under the root.
		for (const v of this.om.axes.subtype.values)
			if (v.class) this.parent.set(v.class, 'Temporal');
		// A concrete class is `<leaf><suffix>`: it inherits the leaf's family
		// surface, and its instances are pointers to the template subtype's struct.
		for (const [leaf, node] of Object.entries(this.om.lattice)) {
			if (node.kind !== 'leaf') continue;
			for (const [subtype, suffix] of Object.entries(SUBTYPE_SUFFIX)) {
				const concrete = leaf + suffix;
				if (concrete in this.om.classes) {
					this.parent.set(concrete, leaf);
					this.subtypeOf.set(concrete, subtype);
				}
			}
		}
		for (const family of this.companionFamilies()) {
			const fam = this.om.companions[family] as { nodes: Record<string, CompanionNode> };
			for (const [name, node] of Object.entries(fam.nodes)) {
				if (name.startsWith('_')) continue;
				this.parent.set(name, node.parent);
				if (node.temptype) this.meostype.set(name, node.temptype);
				if (node.doc) this.doc.set(name, node.doc);
			}
		}
		// What a class's instances point to is the catalog's to say.
		for (const [name, spec] of Object.entries(this.om.classes))
			if (spec.cType) this.ctype.set(name, spec.cType);
		for (const [name, ct] of this.ctype) {
			const best = this.wrapRoot.get(ct);
			if (best === undefined || this.depth(name) < this.depth(best)) this.wrapRoot.set(ct, name);
		}
	}

	companionFamilies(): string[] {
		return Object.keys(this.om.companions).filter(k => !k.startsWith('_'));
	}

	depth(cls: string): number {
		let d = 0;
		for (let p = this.parent.get(cls); p; p = this.parent.get(p)) d++;
		return d;
	}

	ancestors(cls: string): string[] {
		const out: string[] = [];
		for (let p = this.parent.get(cls); p; p = this.parent.get(p)) out.push(p);
		return out;
	}

	/** Every class the model defines, superclass before subclass. */
	classes(): string[] {
		const ordered: string[] = [];
		const emit = (n: string) => {
			if (ordered.includes(n)) return;
			const p = this.parent.get(n);
			if (p) emit(p);
			ordered.push(n);
		};
		[...this.parent.keys()].sort().forEach(emit);
		return ordered;
	}

	/** The class a single pointer to this C type is wrapped in (#class_for_ctype). */
	classForCtype(cType: string): string | undefined {
		const c = clean(cType);
		if (!c.endsWith('*') || c.endsWith('**')) return undefined;
		const base = c.slice(0, -1).trim();
		if (TEMPORAL_STRUCTS.has(base)) return 'Temporal';
		return this.wrapRoot.get(base);
	}

	structOffset(struct: string, field: string): number {
		const s = this.idl.structs.find(x => x.name === struct);
		const f = s?.fields.find(x => x.name === field);
		if (!f) throw new Error(`${struct}.${field} is not in the catalog`);
		return f.offset_bits / 8;
	}

	/**
	 * The text pair of the enumeration a slot's C type names, so a member takes
	 * and answers its values as the SQL functions do, as text, through MEOS's
	 * own functions, and the binding names no value on its own; the lookup
	 * #enumValue makes for one value.
	 */
	enumText(cType: string): EnumText | undefined {
		const c = clean(cType).replace(/^enum\s+/, '');
		return this.idl.enums.find(e => e.name === c)?.text;
	}

	enumValue(enumName: string, valueName: string): number | undefined {
		return this.idl.enums.find(e => e.name === enumName)?.values?.find(v => v.name === valueName)?.value;
	}
}

// -------------------------------------------------------------------------
// MARSHALLING
// -------------------------------------------------------------------------

/**
 * How an element of an array MEOS answers is read off the heap, keyed by the C
 * type the element's canonical resolves to through the catalog's typedefs: the
 * C standard types only, as C_WIDTHS of FunctionsGenerator.ts is the one place
 * the flat surface writes a type by hand. A 64-bit integer is read as the flat
 * wrapper reads a scalar of the same width.
 */
const ELEMENT_READERS: Record<string, { ts: string; width: number; read: string; write: string }> = {
	'double': { ts: 'number', width: 8, read: '_v.getFloat64({o}, true)', write: '_v.setFloat64({o}, {x}, true)' },
	'float': { ts: 'number', width: 4, read: '_v.getFloat32({o}, true)', write: '_v.setFloat32({o}, {x}, true)' },
	'int': { ts: 'number', width: 4, read: '_v.getInt32({o}, true)', write: '_v.setInt32({o}, {x}, true)' },
	'int32_t': { ts: 'number', width: 4, read: '_v.getInt32({o}, true)', write: '_v.setInt32({o}, {x}, true)' },
	'int16_t': { ts: 'number', width: 2, read: '_v.getInt16({o}, true)', write: '_v.setInt16({o}, {x}, true)' },
	'uint16_t': { ts: 'number', width: 2, read: '_v.getUint16({o}, true)', write: '_v.setUint16({o}, {x}, true)' },
	'uint32_t': { ts: 'number', width: 4, read: '_v.getUint32({o}, true)', write: '_v.setUint32({o}, {x}, true)' },
	'int64_t': { ts: 'number', width: 8, read: 'Number(_v.getBigInt64({o}, true))', write: '_v.setBigInt64({o}, BigInt({x}), true)' },
	'uint64_t': { ts: 'bigint', width: 8, read: '_v.getBigUint64({o}, true)', write: '_v.setBigUint64({o}, {x}, true)' },
	'bool': { ts: 'boolean', width: 1, read: '_v.getUint8({o}) !== 0', write: '_v.setUint8({o}, {x} ? 1 : 0)' },
	'uint8_t': { ts: 'number', width: 1, read: '_v.getUint8({o})', write: '_v.setUint8({o}, {x})' },
};

/**
 * The deferral kinds, each declared whether or not it fires, so an empty row
 * reads as a measurement — as DEFERRAL_KINDS of MEOS.NET's tools/objectgen.py.
 */
const DEFERRAL_KINDS: Record<string, string> = {
	'function absent from the catalog':
		"The model assigns a method to a function the catalog's own function list does not carry.",
	'no emitted wrapper':
		'The flat surface emits no generated wrapper for the function, so the layer has no signature to build on.',
	'return needs a class':
		'The function answers a type no class stands for and no scalar or array rule reads.',
	'argument needs a class':
		'The function takes a type no class stands for and no marshalling rule reads.',
	'out-parameter needs a reader':
		'The function answers a value through a pointer no reader in this generator reads.',
	'overloads no argument test tells apart':
		'Two operators of one name take arguments no runtime test distinguishes (an int and a float are both a number), so the call cannot choose between them.',
	'name taken by a method':
		'A method of the class or an ancestor already has the name the operator would take.',
	'name taken by an ancestor':
		'An ancestor already has a method of this name with other parameters, and TypeScript has no overloading by argument type.',
};

/** A struct carried as a value: its catalog size and each field's offset and reader. */
interface ValueStruct {
	size: number;
	fields: { name: string; offset: number; r: { ts: string; width: number; read: string; write: string } }[];
}
/** A struct read off an answered array, its MEOS values copied ({x} is the field's raw read). */
interface HeldStruct {
	size: number;
	fields: { name: string; ts: string; offset: number; read: string; value: string }[];
}
/** A struct written in place for a call; a field with no `write` is a string. */
interface WrittenStruct {
	size: number;
	fields: { name: string; ts: string; offset: number; write: string | undefined }[];
}

interface Emitted {
	fn: string;
	name: string;
	isStatic: boolean;
	params: { name: string; ts: string; optional?: boolean; default?: string }[];
	ret: string;
	body: string[];
	/** A helper the class's own dispatching method calls, never called from outside. */
	helper?: boolean;
	/** The comment above the method; the MEOS function by default. */
	doc?: string;
	/** The class each receiver class gets back (`returnInstantiations`). */
	returnPairs?: { receiverClass: string; returnClass: string }[];
}

/** The TypeScript twin of #Generator in MEOS.NET's tools/objectgen.py. */
class Generator {
	readonly deferred: { cls: string; member: string; kind: string; detail: string }[] = [];
	/** class -> method name -> its signature key, own only; ancestors are walked. */
	private readonly memberSigs = new Map<string, Map<string, string>>();
	private readonly staticSigs = new Map<string, Map<string, string>>();
	/** class -> C function -> the instance method behind it, own and inherited. */
	private readonly classFunctions = new Map<string, Map<string, Emitted>>();
	/** C function -> (class, static method), for the portable readers. */
	private readonly staticFunctions = new Map<string, { cls: string; m: Emitted }>();
	private readonly textWriter = new Map<string, string | undefined>();
	emitted = 0;

	/** Takes the model and the flat signatures, as #Generator's __init__ takes the model. */
	constructor(private readonly m: Model, private readonly sigs: Map<string, WrapperSignature>) {}

	/**
	 * The text pair of an enumeration slot whose two functions the flat surface
	 * emits, as #classForCtype names the class of a pointer slot: a pair the
	 * flat layer lacks leaves the slot a number.
	 */
	private flatText(cType: string): EnumText | undefined {
		const text = this.m.enumText(cType);
		return text && this.sigs.has(text.name) && this.sigs.has(text.fromString) ? text : undefined;
	}

	private defer(cls: string, member: string, kind: string, detail: string): undefined {
		this.deferred.push({ cls, member, kind, detail });
		return undefined;
	}

	/** One method for one model entry, or a deferral: #method_for of MEOS.NET. */
	method(cls: string, entry: MethodEntry): Emitted | undefined {
		const oo = entry.ooName;
		const fname = entry.function;
		const f = this.m.functions.get(fname);
		if (!f) return this.defer(cls, oo, 'function absent from the catalog', `no catalog function ${fname}`);
		const sig = this.sigs.get(fname);
		if (!sig) return this.defer(cls, oo, 'no emitted wrapper', `${fname} has no generated wrapper`);
		const shape = (f as IdlFunction & { shape?: Shape }).shape ?? {};

		let params = [...sig.params];
		const recv = this.m.ctype.get(cls);
		let isStatic = true;
		const args = new Map<string, string>();
		// The receiver is a pointer the wrapper takes as one: the flat surface
		// passes a `text *` as a JavaScript string, which no handle holds. An
		// operator the model reflects onto its right operand (`receiver: right`,
		// rsub) is called on its SECOND parameter.
		const at = entry.receiver === 'right' ? 1 : 0;
		const otherName = entry.role === 'operator' ? sig.params[1 - at]?.name : undefined;
		const r = params[at];
		if (r && recv && r.ts === 'Ptr' && clean(r.canonical) === `${recv} *`) {
			isStatic = false;
			args.set(r.name, 'this.ptr');
			params = params.filter((_p, i) => i !== at);
		} else if (entry.role === 'operator') {
			return this.defer(cls, oo, 'argument needs a class',
				`${fname} takes its receiver as ${r ? clean(r.canonical) : 'nothing'}, which no handle holds`);
		}

		const setup: string[] = [];
		const teardown: string[] = [];
		const outReads: { ts: string; expr: string }[] = [];
		const decl: { name: string; ts: string }[] = [];

		// An array ARGUMENT is one parameter to the caller and two to MEOS, the
		// pointer and its length; which parameters those are is the catalog's to say.
		const inputArrays = new Map((shape.inputArrays ?? []).map(a => [a.param, a]));
		const lengthOf = new Map<string, string>();
		for (const a of shape.inputArrays ?? [])
			if (a.lengthFrom.kind === 'param' && !lengthOf.has(a.lengthFrom.name)) lengthOf.set(a.lengthFrom.name, a.param);

		// An answered array's length, which MEOS writes through the parameter the
		// shape names.
		const arrayReturn = shape.arrayReturn;
		const countOut = arrayReturn?.lengthFrom.kind === 'param' ? arrayReturn.lengthFrom.name : undefined;
		// The length of a byte buffer MEOS answers, written through `size_t *`.
		const outs = new Set(shape.outParams ?? []);
		const sizeOut = params.find(p => outs.has(p.name) && clean(p.canonical) === 'size_t *'
			&& clean(sig.retCanonical) === 'uint8_t *');

		for (const p of params) {
			if (p.name === countOut && clean(p.canonical) === 'int *') {
				setup.push(`const _count = _alloc(4);`);
				teardown.push(`_free(_count);`);
				args.set(p.name, '_count');
				continue;
			}
			if (sizeOut && p.name === sizeOut.name) {
				args.set(p.name, '_sizeOut');
				continue;
			}
			if (outs.has(p.name)) {
				// A scalar MEOS writes through a single pointer, read back after the
				// call as OUT_PARAM_READERS of MEOS.NET's tools/objectgen.py reads it.
				const pointee = clean(p.canonical).replace(/\*$/, '').trim();
				const reader = clean(p.canonical).endsWith('**') ? undefined : ELEMENT_READERS[this.resolve(pointee)];
				if (!reader)
					return this.defer(cls, oo, 'out-parameter needs a reader',
						`out-parameter ${p.name} of type ${clean(p.canonical)}`);
				const tmp = temp(p.name);
				setup.push(`const ${tmp} = _alloc(${reader.width});`);
				teardown.push(`_free(${tmp});`);
				args.set(p.name, tmp);
				const kept = pointee === 'TimestampTz' || pointee === 'DateADT' ? pointee : reader.ts;
				outReads.push({ ts: kept, expr: `((_v: DataView) => ${reader.read.replace('{o}', '0')})(_view(${tmp}, ${reader.width}))` });
				continue;
			}
			if (lengthOf.has(p.name)) {
				args.set(p.name, `${safe(lengthOf.get(p.name)!)}.length`);
				continue;
			}
			const arr = inputArrays.get(p.name);
			if (arr) {
				const elem = this.m.classForCtype(arr.element.canonical);
				// An array of structs a class stands for, laid out inline: each
				// value's bytes are copied into one buffer at the struct's stride.
				const owner = this.m.wrapRoot.get(clean(arr.element.canonical));
				const stride = owner && this.inlineSize(clean(arr.element.canonical));
				if (!elem && owner && stride) {
					decl.push({ name: p.tsName, ts: `${owner}[]` });
					const tmp = temp(p.name);
					setup.push(`const ${tmp} = _structArray(${p.tsName}.map(x => x.ptr), ${stride});`);
					teardown.push(`_free(${tmp});`);
					args.set(p.name, tmp);
					continue;
				}
				// An array of scalars: WKB bytes are a Uint8Array copied in whole,
				// every other scalar is written at its width, as MEOS.NET pins the
				// caller's own array of scalars (#call_body there).
				const scalar = elem ? undefined : ELEMENT_READERS[this.resolve(clean(arr.element.canonical))];
				if (!elem && scalar) {
					const tmp = temp(p.name);
					if (scalar.width === 1 && scalar.ts === 'number') {
						decl.push({ name: p.tsName, ts: 'Uint8Array' });
						setup.push(`const ${tmp} = _bytes(${p.tsName});`);
					} else {
						decl.push({ name: p.tsName, ts: `${scalar.ts}[]` });
						const w = scalar.width;
						setup.push(`const ${tmp} = _alloc(Math.max(${p.tsName}.length, 1) * ${w});`,
							`{ const _v = _view(${tmp}, Math.max(${p.tsName}.length, 1) * ${w}); ${p.tsName}.forEach((_x, _i) => ${scalar.write.replace('{o}', `_i * ${w}`).replace('{x}', '_x')}); }`);
					}
					teardown.push(`_free(${tmp});`);
					args.set(p.name, tmp);
					continue;
				}
				// An array of structs of scalars and strings no class stands for, laid
				// out in place for the call (#written_struct of MEOS.NET); the block
				// and every string in it are freed after the call.
				const written = elem ? undefined : clean(arr.element.canonical);
				if (written && this.writtenStruct(written)) {
					this.usedWritten.add(written);
					decl.push({ name: p.tsName, ts: `${written}[]` });
					const tmp = temp(p.name);
					setup.push(`const ${tmp}Strs: Ptr[] = [];`, `const ${tmp} = _write${written}Array(${p.tsName}, ${tmp}Strs);`);
					teardown.push(`${tmp}Strs.forEach(_free);`, `_free(${tmp});`);
					args.set(p.name, tmp);
					continue;
				}
				if (!elem)
					return this.defer(cls, oo, 'argument needs a class',
						`argument ${p.name} is an array of ${clean(arr.element.canonical)}, which has no class`);
				decl.push({ name: p.tsName, ts: `${elem}[]` });
				const tmp = temp(p.name);
				setup.push(`const ${tmp} = _ptrArray(${p.tsName}.map(x => x.ptr));`);
				teardown.push(`_free(${tmp});`);
				args.set(p.name, tmp);
				continue;
			}
			const mapped = this.param(p);
			if (!mapped)
				return this.defer(cls, oo, 'argument needs a class',
					`argument ${p.name} of type ${clean(p.canonical)} needs marshalling`);
			// The other operand of an operator, typed as the class its SQL
			// signatures instantiate it to (`otherClass`, a class below the one the
			// C type names), so the method states what it takes and a dispatcher
			// can tell its overloads apart.
			let ts = mapped.ts;
			if (p.name === otherName && entry.otherClass && entry.otherClass !== ts
				&& this.m.ancestors(entry.otherClass).includes(ts))
				ts = entry.otherClass;
			decl.push({ name: p.tsName, ts });
			args.set(p.name, mapped.arg);
			if (mapped.setup) setup.push(mapped.setup);
			if (mapped.teardown) teardown.push(mapped.teardown);
		}

		const call = `F.${fname}(${sig.params.map(p => args.get(p.name)!).join(', ')})`;
		// A null answer is an answer only where the catalog says MEOS returns one
		// (`nullableResult`), or where the wrapper folds a bool+result call.
		const nullable = shape.nullableResult !== undefined || sig.folded;
		let ret: string;
		let body: string[];

		if (outReads.length) {
			// A `bool` beside the values MEOS writes says whether they exist, so
			// the method answers the value or null, as MEOS.NET's #answer does.
			if (outReads.length !== 1 || sig.ret !== 'boolean' || sig.folded || arrayReturn || sizeOut)
				return this.defer(cls, oo, 'out-parameter needs a reader',
					`${outReads.length} value(s) answered beside a ${sig.retCanonical} return`);
			ret = `${outReads[0].ts} | null`;
			body = [`if (!${call}) return null;`, `return ${outReads[0].expr};`];
		} else if (arrayReturn && countOut && args.get(countOut) === '_count'
			&& this.heldStruct(clean(arrayReturn.element.canonical))) {
			// An array of structs holding MEOS values: each element is read with
			// copies of what it holds, then the array is released, values with it,
			// by the function the catalog names (`releasedBy`), as
			// #held_struct_array of MEOS.NET's tools/objectgen.py does.
			const name = clean(arrayReturn.element.canonical);
			const s = this.heldStruct(name)!;
			const release = arrayReturn.releasedBy?.function;
			if (!release || this.sigs.get(release)?.params.length !== 2)
				return this.defer(cls, oo, 'return needs a class',
					`array of ${name} holds MEOS values and the catalog names no function releasing it`);
			this.usedHeld.add(name);
			ret = `${name}[]`;
			body = [
				`const _arr = ${call};`,
				`if (!_arr) return [];`,
				`const _n = _view(_count, 4).getInt32(0, true);`,
				`try {`,
				`\tconst _out: ${name}[] = [];`,
				`\tfor (let _i = 0; _i < _n; _i++) _out.push(_held${name}(_arr + _i * ${s.size}));`,
				`\treturn _out;`,
				`} finally {`,
				`\tF.${release}(_arr, _n);`,
				`}`,
			];
		} else if (arrayReturn && countOut && args.get(countOut) === '_count') {
			const read = this.arrayElement(arrayReturn.element.canonical);
			if (!read)
				return this.defer(cls, oo, 'return needs a class',
					`array of ${clean(arrayReturn.element.canonical)} needs a reader`);
			ret = `${read.ts}[]`;
			body = [
				`const _arr = ${call};`,
				`if (!_arr) return [];`,
				`try {`,
				`\tconst _n = _view(_count, 4).getInt32(0, true);`,
				`\tconst _v = _view(_arr, _n * ${read.width});`,
				`\tconst _out: ${read.ts}[] = [];`,
				`\tfor (let _i = 0; _i < _n; _i++) _out.push(${read.expr.replace('{o}', `_i * ${read.width}`)});`,
				`\treturn _out;`,
				`} finally {`,
				`\t_free(_arr);`,
				`}`,
			];
		} else if (arrayReturn) {
			return this.defer(cls, oo, 'return needs a class',
				`array of ${clean(arrayReturn.element.canonical)} whose length is not an int * out-parameter`);
		} else if (sizeOut) {
			ret = 'Uint8Array';
			body = [`return readWkb(_sizeOut => ${call});`];
		} else {
			const r = this.returned(sig, nullable);
			if (!r)
				return this.defer(cls, oo, 'return needs a class', `return ${sig.retCanonical} needs wrapping`);
			let { ts, wrap } = r;
			// A constructor the model assigns to this class answers this class: the
			// factory already wraps the pointer in the class its header names, so
			// only the static type narrows from the struct's root to it.
			// The template subtypes (TSequence) hold no instances of their own: a
			// sequence is the concrete <leaf>Seq the factory picks, under its leaf.
			const answered = ts.replace(/ \| null$/, '');
			const template = this.m.om.axes.subtype.values.some(v => v.class === cls);
			if (entry.role === 'constructor' && !template && answered !== cls && this.m.ancestors(cls).includes(answered)) {
				const narrowed = ts.endsWith(' | null') ? `${cls} | null` : cls;
				wrap = wrap.replace(` as ${ts}`, ` as ${narrowed}`);
				ts = narrowed;
			}
			// A member the model states answers its receiver's own type
			// (`answersReceiver`, every SQL signature answering the receiver's SQL
			// type) answers the class it is called on, where the C return names the
			// template: IntSpan.expand answers an IntSpan, not a Span.
			else if (!isStatic && entry.answersReceiver
				&& (answered === cls || this.m.ancestors(cls).includes(answered))) {
				const narrowed = ts.endsWith(' | null') ? 'this | null' : 'this';
				wrap = wrap.replace(` as ${ts}`, ` as ${narrowed}`);
				ts = narrowed;
			}
			ret = ts;
			body = [wrap === '$' ? (ret === 'void' ? `${call};` : `return ${call};`) : `return ${wrap.replace('$', call)};`];
		}

		if (teardown.length)
			body = [...setup, 'try {', ...body.map(l => `\t${l}`), '} finally {', ...teardown.map(l => `\t${l}`), '}'];
		else
			body = [...setup, ...body];
		this.applySqlDefaults(f, decl);
		return { fn: fname, name: oo, isStatic, params: decl, ret, body, returnPairs: entry.returnInstantiations };
	}

	/**
	 * The defaults the SQL signatures state for the trailing parameters
	 * (`sqlSignatures[].argDefaults`): intspan_make's lower_inc and upper_inc
	 * default to the `[)` bounds, floatspan_out's maxdd to 15. A parameter takes
	 * one only where every signature states the same default for it, read in the
	 * signature's own order where `sqlArgParams` gives one, and the literal is of
	 * the parameter's own TypeScript kind: a SQL default of another type
	 * (set_as_hexwkb's text endianness, where the C function takes a uint8_t
	 * variant) says nothing about the C argument and is not carried. Only the
	 * trailing run takes defaults, so no required parameter follows one. The
	 * sibling generators (#method_for of MEOS.NET) carry none; this projects the
	 * catalog's own.
	 *
	 * Where SQL states none, the default of a type's writer is the one
	 * `typeEncodings` states for that C argument (`encoderAux`, `writerAux`):
	 * set_as_hexwkb's variant is 0, tbox_out's maxdd 15, temporal_as_mfjson's srs
	 * null. These name the C parameter itself, so they need no reading of a SQL
	 * literal, and a parameter takes one only where every encoding naming the
	 * function as its writer states the same.
	 */
	private applySqlDefaults(f: IdlFunction, decl: { name: string; ts: string; default?: string }[]): void {
		const sigs = (f as IdlFunction & { sqlSignatures?: { args: string[]; argDefaults?: (string | null)[]; sqlArgParams?: string[] }[] }).sqlSignatures ?? [];
		const aux = this.writerDefaults(f.name);
		if (!sigs.length && !aux.size) return;
		const cNames = f.params.map(p => p.name);
		const defaultOf = (cName: string): string | undefined => {
			if (!sigs.length) return undefined;
			let found: string | undefined;
			for (const sig of sigs) {
				const order = sig.sqlArgParams ?? cNames.slice(0, sig.args.length);
				const at = order.indexOf(cName);
				const lit = at < 0 ? null : sig.argDefaults?.[at] ?? null;
				if (lit === null || (found !== undefined && found !== lit)) return undefined;
				found = lit;
			}
			return found;
		};
		const byTs = (ts: string, lit: string): string | undefined => {
			const v = lit.trim().toLowerCase();
			if (ts === 'boolean' && (v === 'true' || v === 'false')) return v;
			if (ts === 'number' && /^-?\d+(\.\d+)?$/.test(v)) return v;
			return undefined;
		};
		const tsNameToC = new Map(f.params.map(p => [safe(p.name), p.name]));
		for (let i = decl.length - 1; i >= 0; i--) {
			const cName = tsNameToC.get(decl[i].name);
			const lit = cName ? defaultOf(cName) : undefined;
			const value = (lit !== undefined ? byTs(decl[i].ts, lit) : undefined)
				?? (cName ? this.auxLiteral(aux.get(cName), decl[i].ts) : undefined);
			if (value === undefined) break;
			decl[i].default = value;
		}
	}

	/**
	 * The default every encoding naming `fn` as its writer states for each of its
	 * C arguments (`encoders` with `encoderAux`, `writers` with `writerAux`), by
	 * argument name; an argument two entries disagree on has none.
	 */
	private writerDefaults(fn: string): Map<string, unknown> {
		type Aux = { name: string; kind?: string; default?: unknown }[];
		const found = new Map<string, unknown>();
		const clash = new Set<string>();
		const take = (list: Aux | undefined) => {
			for (const a of list ?? []) {
				if (!('default' in a)) continue;
				if (found.has(a.name) && found.get(a.name) !== a.default) clash.add(a.name);
				else found.set(a.name, a.default);
			}
		};
		for (const enc of Object.values(this.m.idl.typeEncodings ?? {}) as (Encoding & { encoderAux?: Record<string, Aux>; writerAux?: Record<string, Record<string, Aux>> })[]) {
			for (const [format, writer] of Object.entries(enc.encoders ?? {}))
				if (writer === fn) take(enc.encoderAux?.[format]);
			for (const [format, bySql] of Object.entries(enc.writers ?? {}))
				for (const [sql, writer] of Object.entries(bySql))
					if (writer === fn) take(enc.writerAux?.[format]?.[sql]);
		}
		for (const c of clash) found.delete(c);
		return found;
	}

	/** An encoding's default as a TypeScript literal of the parameter's type, or undefined. */
	private auxLiteral(value: unknown, ts: string): string | undefined {
		if (value === undefined) return undefined;
		if (value === null) return /\| null$/.test(ts) ? 'null' : undefined;
		if (typeof value === 'number' && ts === 'number') return String(value);
		if (typeof value === 'boolean' && ts === 'boolean') return String(value);
		return undefined;
	}

	/**
	 * One argument: #map_param of MEOS.NET. A value struct (#value_struct) is
	 * written into a buffer of its catalog size for the call.
	 */
	private param(p: WrapperParam): { ts: string; arg: string; setup?: string; teardown?: string } | undefined {
		if (p.ts !== 'Ptr') {
			const text = this.flatText(p.canonical);
			return text ? { ts: 'string', arg: `F.${text.fromString}(${p.tsName})` } : { ts: p.ts, arg: p.tsName };
		}
		const cls = this.m.classForCtype(p.canonical);
		if (cls) return { ts: cls, arg: `${p.tsName}.ptr` };
		const vs = this.valueStruct(p.canonical);
		if (vs) {
			const tmp = temp(p.name);
			this.usedStructs.add(vs);
			return { ts: vs, arg: tmp, setup: `const ${tmp} = _put${vs}(${p.tsName});`, teardown: `_free(${tmp});` };
		}
		// An untyped pointer stays untyped: MEOS states nothing about what it
		// points at, so the caller hands over the `ptr` of the value it means.
		if (clean(p.canonical) === 'void *') return { ts: 'Ptr', arg: p.tsName };
		return undefined;
	}

	/** The return: #map_return of MEOS.NET. A value struct is read and its buffer freed. */
	private returned(sig: WrapperSignature, nullable: boolean): { ts: string; wrap: string } | undefined {
		if (sig.ret !== 'Ptr') {
			const text = this.flatText(sig.retCanonical);
			return text ? { ts: 'string', wrap: `F.${text.name}($)!` } : { ts: sig.ret, wrap: '$' };
		}
		const cls = this.m.classForCtype(sig.retCanonical);
		const root = cls && this.rootOf(cls);
		if (cls && nullable) return { ts: `${cls} | null`, wrap: `wrap${root}OrNull($) as ${cls} | null` };
		if (cls) return { ts: cls, wrap: `wrap${root}($) as ${cls}` };
		const vs = this.valueStruct(sig.retCanonical);
		if (vs) {
			this.usedStructs.add(vs);
			return nullable ? { ts: `${vs} | null`, wrap: `_take${vs}($)` } : { ts: vs, wrap: `_take${vs}($)!` };
		}
		if (clean(sig.retCanonical) === 'void *') return { ts: 'Ptr', wrap: '$' };
		return undefined;
	}

	/**
	 * The struct a single pointer to a scalar-only struct carries, as
	 * #value_struct of MEOS.NET's tools/objectgen.py reads it.
	 */
	private valueStruct(cType: string): string | undefined {
		const c = clean(cType);
		if (!c.endsWith('*') || c.endsWith('**')) return undefined;
		const base = c.slice(0, -1).trim();
		return this.valueStructs().has(base) ? base : undefined;
	}

	/** The value structs a method of the layer reads or writes, so only those are emitted. */
	readonly usedStructs = new Set<string>();
	private valueStructCache?: Map<string, ValueStruct>;

	/**
	 * Every struct the layer carries as a value, derived as #configure of
	 * MEOS.NET's tools/codegen.py derives BY_VALUE_STRUCTS: no class stands for
	 * it, and the catalog states its whole layout in scalars (#scalar_bytes there,
	 * ELEMENT_READERS here). A struct a class stands for is that class's.
	 */
	valueStructs(): Map<string, ValueStruct> {
		if (this.valueStructCache) return this.valueStructCache;
		const classed = new Set(this.m.ctype.values());
		const out = new Map<string, ValueStruct>();
		for (const s of this.m.idl.structs) {
			if (classed.has(s.name) || !s.sizeBytes || !s.fields?.length) continue;
			const fields = s.fields.map(f => ({
				name: f.name, offset: f.offset_bits / 8, r: ELEMENT_READERS[this.resolve(clean(f.canonical ?? ''))],
			}));
			if (fields.every(f => f.r && Number.isInteger(f.offset))) out.set(s.name, { size: s.sizeBytes, fields });
		}
		this.valueStructCache = out;
		return out;
	}

	/** The held and written structs a method of the layer reads or writes, so only those are emitted. */
	readonly usedHeld = new Set<string>();
	readonly usedWritten = new Set<string>();

	/**
	 * The function the model states copies a value of the class or of an
	 * ancestor (its member `copy`), taking that one value: #copy_function of
	 * MEOS.NET's tools/objectgen.py.
	 */
	private copyFunction(cls: string): string | undefined {
		for (const owner of [cls, ...this.m.ancestors(cls)])
			for (const e of this.m.om.classes[owner]?.methods ?? [])
				if (e.ooName === 'copy' && !e.ooExclude && this.sigs.get(e.function)?.params.length === 1)
					return e.function;
		return undefined;
	}

	/**
	 * A struct no class stands for whose fields are scalars or pointers to a
	 * class the model can copy, read off an answered array: #held_struct of
	 * MEOS.NET's tools/objectgen.py. Each field is read at the offset the catalog
	 * states, a scalar as its TypeScript type and a MEOS value as a copy of the
	 * one the element points at (null where it points at nothing), so what the
	 * caller holds outlives the release of the array. A struct of scalars alone
	 * is a value struct (#valueStructs) and is not one of these.
	 */
	heldStruct(name: string): HeldStruct | undefined {
		if (this.valueStructs().has(name) || new Set(this.m.ctype.values()).has(name)) return undefined;
		const s = this.m.idl.structs.find(x => x.name === name);
		if (!s?.sizeBytes || !s.fields?.length) return undefined;
		const fields: HeldStruct['fields'] = [];
		for (const f of s.fields) {
			const offset = f.offset_bits / 8;
			const canonical = clean(f.canonical ?? '');
			const cls = this.m.classForCtype(canonical);
			if (cls) {
				const copy = this.copyFunction(cls);
				if (!copy) return undefined;
				fields.push({ name: f.name, ts: `${cls} | null`, offset, read: 'Number(_v.getBigUint64({o}, true))',
					value: `{x} ? wrap${this.rootOf(cls)}(F.${copy}({x})) as ${cls} : null` });
				continue;
			}
			const r = ELEMENT_READERS[this.resolve(canonical)];
			if (!r || !Number.isInteger(offset)) return undefined;
			fields.push({ name: f.name, ts: r.ts, offset, read: r.read, value: '{x}' });
		}
		return fields.some(f => f.value !== '{x}') ? { size: s.sizeBytes, fields } : undefined;
	}

	/**
	 * A struct no class stands for whose fields are scalars or strings, which a
	 * function reads in place from an array of them: #written_struct of
	 * MEOS.NET's tools/objectgen.py. Each value is laid out at the struct's size
	 * and each field at the offset the catalog states: a string as a UTF-8 copy
	 * the call holds and frees after it (a null as NULL), any other scalar at its
	 * own width.
	 */
	writtenStruct(name: string): WrittenStruct | undefined {
		if (new Set(this.m.ctype.values()).has(name) || this.m.classForCtype(`${name} *`)) return undefined;
		const s = this.m.idl.structs.find(x => x.name === name);
		if (!s?.sizeBytes || !s.fields?.length) return undefined;
		const fields: WrittenStruct['fields'] = [];
		for (const f of s.fields) {
			const offset = f.offset_bits / 8;
			const canonical = clean(f.canonical ?? '');
			if (!Number.isInteger(offset)) return undefined;
			if (canonical === 'char *') {
				fields.push({ name: f.name, ts: 'string | null', offset, write: undefined });
				continue;
			}
			const r = ELEMENT_READERS[this.resolve(canonical)];
			if (!r) return undefined;
			fields.push({ name: f.name, ts: r.ts, offset, write: r.write });
		}
		return { size: s.sizeBytes, fields };
	}

	/**
	 * The interface and reader of every held struct, and the interface and array
	 * writer of every written struct, the layer used. A reader takes every field
	 * off the element before it copies a MEOS value, since a copy may grow the
	 * heap; a writer makes its strings before it takes the view it writes through,
	 * for the same reason.
	 */
	structCode(): string {
		const lines: string[] = [];
		for (const name of [...this.usedHeld].sort()) {
			const s = this.heldStruct(name)!;
			lines.push(`/** The MEOS ${name} struct, read with copies of the MEOS values it holds. */`, `export interface ${name} {`);
			for (const f of s.fields) lines.push(`\t${f.name}: ${f.ts};`);
			lines.push('}', '');
			lines.push(`function _held${name}(ptr: Ptr): ${name} {`, `\tconst _v = _view(ptr, ${s.size});`);
			for (const f of s.fields) lines.push(`\tconst _${f.name} = ${f.read.replace('{o}', String(f.offset))};`);
			lines.push('\treturn {');
			for (const f of s.fields) lines.push(`\t\t${f.name}: ${f.value.replaceAll('{x}', `_${f.name}`)},`);
			lines.push('\t};', '}', '');
		}
		for (const name of [...this.usedWritten].sort()) {
			const s = this.writtenStruct(name)!;
			lines.push(`/** The MEOS ${name} struct, written in place for the call that reads it. */`, `export interface ${name} {`);
			for (const f of s.fields) lines.push(`\t${f.name}: ${f.ts};`);
			lines.push('}', '');
			lines.push(`/** The values one after another at ${s.size} bytes each; the strings go to \`strs\`, freed with the block. */`,
				`function _write${name}Array(values: ${name}[], strs: Ptr[]): Ptr {`,
				`\tconst ptr = _alloc(Math.max(values.length, 1) * ${s.size});`,
				'\tvalues.forEach((value, _i) => {');
			for (const f of s.fields.filter(f => !f.write))
				lines.push(`\t\tconst _${f.name} = _cstring(value.${f.name});`, `\t\tif (_${f.name}) strs.push(_${f.name});`);
			lines.push(`\t\tconst _v = _view(ptr + _i * ${s.size}, ${s.size});`);
			for (const f of s.fields)
				lines.push(f.write
					? `\t\t${f.write.replace('{o}', String(f.offset)).replace('{x}', `value.${f.name}`)};`
					: `\t\t_v.setBigUint64(${f.offset}, BigInt(_${f.name}), true);`);
			lines.push('\t});', '\treturn ptr;', '}', '');
		}
		return lines.join('\n');
	}

	/**
	 * The size of a class's struct where it lies inline in an array, the size
	 * the catalog states for it, as #struct_stride of MEOS.NET's objectgen.py
	 * reads it. A struct of a fixed size with a varlena header lies inline at
	 * that size too: `cbufferset_make` reads `values[i]` at `sizeof(Cbuffer)`
	 * and sets the header of each copy it keeps.
	 */
	private inlineSize(struct: string): number | undefined {
		return this.m.idl.structs.find(x => x.name === struct)?.sizeBytes;
	}

	/**
	 * The interface, reader and writer of every value struct the layer used: the
	 * TypeScript form of the value structs #gen_structs of MEOS.NET's codegen.py
	 * emits, with the field offsets the catalog states.
	 */
	valueStructCode(): string {
		const lines: string[] = [];
		const used = [...this.valueStructs()].filter(([n]) => this.usedStructs.has(n)).sort(([a], [b]) => a.localeCompare(b));
		for (const [name, s] of used) {
			lines.push(`/** The MEOS ${name} struct, carried as a value. */`, `export interface ${name} {`);
			for (const f of s.fields) lines.push(`\t${f.name}: ${f.r.ts};`);
			lines.push('}', '');
			lines.push(`function _read${name}(ptr: Ptr): ${name} {`, `\tconst _v = _view(ptr, ${s.size});`, '\treturn {');
			for (const f of s.fields) lines.push(`\t\t${f.name}: ${f.r.read.replace('{o}', String(f.offset))},`);
			lines.push('\t};', '}', '');
			lines.push(`function _put${name}(value: ${name}): Ptr {`, `\tconst ptr = _alloc(${s.size});`, `\tconst _v = _view(ptr, ${s.size});`);
			for (const f of s.fields) lines.push(`\t${f.r.write.replace('{o}', String(f.offset)).replace('{x}', `value.${f.name}`)};`);
			lines.push('\treturn ptr;', '}', '');
			lines.push(`function _take${name}(ptr: Ptr): ${name} | null {`, '\tif (!ptr) return null;',
				'\ttry {', `\t\treturn _read${name}(ptr);`, '\t} finally {', '\t\t_free(ptr);', '\t}', '}', '');
		}
		return lines.join('\n');
	}

	private arrayElement(canonical: string): { ts: string; width: number; expr: string } | undefined {
		const c = clean(canonical);
		const cls = this.m.classForCtype(c);
		if (cls) return { ts: cls, width: 8, expr: `wrap${this.rootOf(cls)}(Number(_v.getBigUint64({o}, true))) as ${cls}` };
		// An array of structs laid out inline: a value struct is read off it, and
		// each struct a class stands for is copied out of the array MEOS frees.
		const vs = this.valueStructs().get(c);
		if (vs) {
			this.usedStructs.add(c);
			return { ts: c, width: vs.size, expr: `_read${c}(_arr + {o})` };
		}
		const owner = this.m.wrapRoot.get(c);
		const inline = owner && this.inlineSize(c);
		if (owner && inline)
			return { ts: owner, width: inline, expr: `wrap${this.rootOf(owner)}(_copy(_arr + {o}, ${inline})) as ${owner}` };
		const r = ELEMENT_READERS[this.resolve(c)];
		if (!r) return undefined;
		// A name the flat surface keeps as an alias (TimestampTz, DateADT) stays it.
		const kept = this.m.idl.typedefs?.some(t => t.name === c) && (c === 'TimestampTz' || c === 'DateADT');
		return { ts: kept ? c : r.ts, width: r.width, expr: r.read };
	}

	private resolve(name: string): string {
		const td = new Map((this.m.idl.typedefs ?? []).map(t => [t.name, clean(t.canonical)]));
		let t = name;
		for (let hops = 0; td.has(t) && hops < 8; hops++) t = td.get(t)!;
		return t;
	}

	/** The class a wrap function is named after: the shallowest class of the same C struct. */
	rootOf(cls: string): string {
		const ct = this.m.ctype.get(cls);
		if (ct && TEMPORAL_STRUCTS.has(ct)) return 'Temporal';
		return (ct && this.m.wrapRoot.get(ct)) ?? cls;
	}

	// -- emission -------------------------------------------------------

	private sigKey(m: Emitted): string {
		return `(${m.params.map(p => p.ts).join(',')})=>${m.ret}`;
	}

	private inheritedSig(cls: string, name: string, statics: boolean): string | undefined {
		const table = statics ? this.staticSigs : this.memberSigs;
		for (const a of this.m.ancestors(cls)) {
			const s = table.get(a)?.get(name);
			if (s !== undefined) return s;
		}
		return undefined;
	}

	/**
	 * Whether a method may stand in a subclass beside an ancestor's of the same
	 * name. TypeScript accepts it only where it is assignable to the ancestor's,
	 * which a method is when its parameters are a prefix of the ancestor's
	 * (`out()` beside an inherited `out(maxdd)`); the return is left to tsc. Any
	 * other pairing is deferred, never renamed — the siblings key the same check
	 * on the whole signature (#inherited_names of MEOS.NET).
	 */
	private compatible(cls: string, m: Emitted): boolean {
		const prior = this.inheritedSig(cls, m.name, m.isStatic);
		if (prior === undefined) return true;
		const types = (key: string) => key.slice(1, key.indexOf(')=>')).split(',').filter(Boolean);
		const inherited = types(prior);
		const own = types(this.sigKey(m));
		// An ancestor answering `this` takes an override that answers it too: a
		// concrete class is not assignable to the type `this` stands for.
		const priorRet = prior.slice(prior.indexOf(')=>') + 3);
		if (/^this( \| null)?$/.test(priorRet) && !/^this( \| null)?$/.test(m.ret)) return false;
		return own.length <= inherited.length && own.every((t, i) => t === inherited[i]);
	}

	/** One class: #emit_class of MEOS.NET. */
	emitClass(cls: string): string {
		const parent = this.m.parent.get(cls) || 'MeosObject';
		const entries = (this.m.om.classes[cls]?.methods ?? []).filter(e => !e.ooExclude);
		const own: Emitted[] = [];
		for (const e of entries) {
			const m = this.method(cls, e);
			if (!m) continue;
			if (!this.compatible(cls, m)) {
				this.defer(cls, m.name, 'name taken by an ancestor',
					`${m.fn} ${this.sigKey(m)} beside the inherited ${this.inheritedSig(cls, m.name, m.isStatic)}`);
				continue;
			}
			own.push(m);
		}

		const functions = new Map(this.classFunctions.get(parent) ?? []);
		for (const m of own) if (!m.isStatic) functions.set(m.fn, m);
		this.classFunctions.set(cls, functions);
		for (const m of own) if (m.isStatic) this.staticFunctions.set(m.fn, { cls, m });

		own.push(...this.portableMethods(cls, own, functions));
		own.push(...this.operatorMethods(cls, own));
		own.push(...this.narrowingOverrides(cls, own));
		own.sort((a, b) => (Number(a.isStatic) - Number(b.isStatic)) || a.name.localeCompare(b.name));
		this.publicMembers.set(cls, own.filter(m => !m.isStatic && !m.helper));
		const ownSigs = new Map<string, string>();
		const ownStatics = new Map<string, string>();
		for (const m of own) (m.isStatic ? ownStatics : ownSigs).set(m.name, this.sigKey(m));
		this.emitted += own.length;

		const lines: string[] = [
			'/**',
			` * ${(this.m.doc.get(cls) ?? this.defaultDoc(cls)).replace(/\*\//g, '* /')}`,
			' */',
			`export class ${cls} extends ${parent} {`,
		];
		lines.push(...this.toStringMethod(cls, functions));
		for (const m of own) {
			const overrides = !m.isStatic && this.inheritedSig(cls, m.name, false) !== undefined;
			lines.push('', `\t/** ${m.doc ?? `MEOS: ${m.fn}`} */`);
			const head = `${m.helper ? 'private ' : ''}${m.isStatic ? 'static ' : ''}${overrides ? 'override ' : ''}${m.name}`;
			lines.push(`\t${head}(${m.params.map(p => `${p.name}${p.optional ? '?' : ''}: ${p.ts}${p.default !== undefined ? ` = ${p.default}` : ''}`).join(', ')}): ${m.ret} {`);
			for (const l of m.body) lines.push(`\t\t${l}`);
			lines.push('\t}');
		}
		lines.push('}', '');
		this.memberSigs.set(cls, ownSigs);
		this.staticSigs.set(cls, ownStatics);
		return lines.join('\n');
	}

	/** #doc_for of MEOS.NET. */
	private defaultDoc(cls: string): string {
		const subtype = this.m.subtypeOf.get(cls);
		if (subtype) return `A ${this.m.parent.get(cls)} of subtype ${subtype}.`;
		return `The ${cls} class of the MEOS object model.`;
	}

	/** class -> operator name -> what its dispatching method takes and answers. */
	private readonly operatorSigs = new Map<string, Map<string, { params: string[][]; rets: string[] }>>();

	/** class -> the instance members it declares, which #narrowingOverrides reads. */
	private readonly publicMembers = new Map<string, Emitted[]>();

	/**
	 * The operators the model assigns the class (`classes.<C>.operators`, the
	 * receiver-typed rule #_classify_operator of MEOS-API's parser/object_model.py
	 * states), one method per `ooName`. A name with one overload is an ordinary
	 * method. A name with several is one method that tests its arguments and calls
	 * the overload they fit, each overload a private helper built as #method builds
	 * any method: TypeScript has no overloading by argument type, so the choice
	 * MEOS.NET's C# compiler makes (#emit_class there emits each overload) is made
	 * at run time here. An ancestor's operator of the same name stays reachable:
	 * an argument no overload of the class takes is passed to it.
	 *
	 * Overloads no runtime test can tell apart (an int and a float are both a
	 * number) are deferred together; picking one would call the wrong function for
	 * the other's values.
	 */
	private operatorMethods(cls: string, own: Emitted[]): Emitted[] {
		const groups = new Map<string, MethodEntry[]>();
		for (const e of this.m.om.classes[cls]?.operators ?? []) {
			if (e.ooExclude) continue;
			groups.set(e.ooName, [...(groups.get(e.ooName) ?? []), { ...e, role: 'operator' }]);
		}
		const taken = new Set(own.map(m => m.name));
		const out: Emitted[] = [];
		const sigs = new Map<string, { params: string[][]; rets: string[] }>();
		for (const [name, entries] of [...groups].sort(([a], [b]) => a.localeCompare(b))) {
			const byMethod = this.inheritedSig(cls, name, false) !== undefined
				&& !this.inheritedOperator(cls, name);
			if (taken.has(name) || byMethod || this.inheritedSig(cls, name, true) !== undefined) {
				for (const e of entries)
					this.defer(cls, name, 'name taken by a method', `${e.function}: a method of ${cls} or an ancestor is named ${name}`);
				continue;
			}
			const overloads = entries.map(e => this.method(cls, e)).filter((m): m is Emitted => !!m);
			const kept = this.distinguishable(cls, name, overloads);
			if (!kept.length) continue;
			const inherited = this.inheritedOperator(cls, name);
			if (kept.length === 1 && !inherited) {
				const m = kept[0];
				out.push({ ...m, name });
				sigs.set(name, { params: m.params.map(p => [p.ts]), rets: this.members(m.ret) });
				continue;
			}
			const dispatcher = this.dispatcher(cls, name, kept, inherited);
			if (!dispatcher) continue;
			out.push(...kept.map(m => ({ ...m, name: this.helperName(m.fn), helper: true })));
			out.push(dispatcher.method);
			sigs.set(name, dispatcher.sig);
		}
		this.operatorSigs.set(cls, sigs);
		return out;
	}

	private helperName(fn: string): string {
		return `_${fn}`;
	}

	/** The members of a union type, as the emitted signatures spell them. */
	private members(ts: string): string[] {
		return ts.split(' | ').map(t => t.trim());
	}

	/** The nearest ancestor's dispatching method of this name, if any. */
	private inheritedOperator(cls: string, name: string) {
		for (const a of this.m.ancestors(cls)) {
			const s = this.operatorSigs.get(a)?.get(name);
			if (s) return s;
		}
		return undefined;
	}

	/**
	 * The test an argument of a parameter type passes, and the key two types share
	 * when no test tells them apart. A class is told by `instanceof`, a value
	 * struct (#value_struct) by being a plain object, and a scalar by `typeof`.
	 */
	private argumentTest(ts: string, v: string): { key: string; test: string } {
		if (this.m.parent.has(ts) || ts === 'MeosObject') return { key: `class:${ts}`, test: `${v} instanceof ${ts}` };
		if (ts.endsWith('[]')) return { key: 'array', test: `Array.isArray(${v})` };
		if (ts === 'Uint8Array') return { key: 'bytes', test: `${v} instanceof Uint8Array` };
		if (this.valueStructs().has(ts))
			return { key: 'struct', test: `typeof ${v} === 'object' && ${v} !== null && !(${v} instanceof MeosObject) && !Array.isArray(${v})` };
		const alias = ownTypeAliases().get(ts);
		const prim = alias ?? (['string', 'boolean', 'bigint'].includes(ts) ? ts : 'number');
		return { key: prim, test: `typeof ${v} === '${prim}'` };
	}

	private testKey(m: Emitted): string {
		return m.params.map(p => this.argumentTest(p.ts, 'x').key).join(',');
	}

	/** The overloads that some argument test tells apart; the rest are deferred. */
	private distinguishable(cls: string, name: string, overloads: Emitted[]): Emitted[] {
		const byKey = new Map<string, Emitted[]>();
		for (const m of overloads) byKey.set(this.testKey(m), [...(byKey.get(this.testKey(m)) ?? []), m]);
		const kept: Emitted[] = [];
		for (const [key, ms] of byKey) {
			if (ms.length === 1) {
				kept.push(ms[0]);
				continue;
			}
			for (const m of ms)
				this.defer(cls, name, 'overloads no argument test tells apart',
					`${m.fn} takes (${key}), as ${ms.filter(o => o !== m).map(o => o.fn).join(', ')} does`);
		}
		return kept;
	}

	private depth(ts: string): number {
		return this.m.parent.has(ts) ? this.m.depth(ts) : -1;
	}

	/**
	 * The method that chooses among the overloads by its arguments. Its parameters
	 * are the overloads' positions, each the union of the types taken there and
	 * optional where an overload takes fewer; it answers the union of their
	 * answers. The deeper class is tested first, so a TFloat argument reaches the
	 * overload taking a TFloat before the one taking any Temporal.
	 */
	private dispatcher(cls: string, name: string, overloads: Emitted[],
		inherited?: { params: string[][]; rets: string[] }) {
		const arity = Math.max(...overloads.map(m => m.params.length), inherited?.params.length ?? 0);
		const longest = overloads.reduce((a, b) => (b.params.length > a.params.length ? b : a));
		const names = Array.from({ length: arity }, (_v, i) => longest.params[i]?.name ?? `arg${i}`);
		const types: string[][] = names.map((_n, i) => {
			const at = new Set<string>();
			for (const m of overloads) if (m.params[i]) at.add(m.params[i].ts);
			for (const t of inherited?.params[i] ?? []) at.add(t);
			return [...at];
		});
		const rets = [...new Set([...overloads.flatMap(m => this.members(m.ret)), ...(inherited?.rets ?? [])])];
		// What an override answers must be what its ancestor answers.
		if (inherited && !rets.every(r => inherited.rets.some(p => this.assignable(r, p)))) {
			for (const m of overloads)
				this.defer(cls, name, 'name taken by an ancestor',
					`${m.fn} answers ${m.ret}, which the inherited ${name} (${inherited.rets.join(' | ')}) does not`);
			return undefined;
		}
		// An overload may be called without the arguments its SQL signature
		// defaults (#applySqlDefaults), where no other overload takes exactly the
		// arguments before them: there an omitted argument would reach both.
		const keys = new Set(overloads.map(m => this.testKey(m)));
		const omittable = (m: Emitted, i: number): boolean => {
			const p = m.params[i];
			if (!p || (p.default === undefined && !p.optional)) return false;
			const before = m.params.slice(0, i).map(q => this.argumentTest(q.ts, 'x').key).join(',');
			return !keys.has(before);
		};
		const optional = names.map((_n, i) => overloads.some(m => m.params.length <= i || omittable(m, i))
			|| (inherited !== undefined && inherited.params.length <= i));
		const ordered = [...overloads].sort((a, b) =>
			b.params.reduce((s, p) => s + this.depth(p.ts), 0) - a.params.reduce((s, p) => s + this.depth(p.ts), 0)
			|| b.params.length - a.params.length);
		const body: string[] = [];
		for (const m of ordered) {
			const conds = names.map((n, i) => {
				if (!m.params[i]) return `${n} === undefined`;
				const test = this.argumentTest(m.params[i].ts, n).test;
				return omittable(m, i) ? `(${n} === undefined || ${test})` : test;
			});
			const args = m.params.map((p, i) => `${names[i]} as ${p.ts}`).join(', ');
			body.push(`if (${conds.join(' && ') || 'true'}) return this.${this.helperName(m.fn)}(${args});`);
		}
		body.push(inherited
			? `return super.${name}(${names.map((n, i) => `${n} as ${inherited.params[i]?.join(' | ') ?? 'never'}`).join(', ')});`
			: `throw new TypeError(\`${cls}.${name}: no overload takes these arguments\`);`);
		return {
			method: {
				fn: overloads.map(m => m.fn).join(', '), name, isStatic: false,
				params: names.map((n, i) => ({ name: n, ts: types[i].join(' | '), optional: optional[i] })),
				ret: rets.join(' | '), body,
				doc: `MEOS: ${overloads.map(m => m.fn).join(', ')}, chosen by the arguments' types`,
				returnPairs: this.agreedPairs(overloads),
			} as Emitted,
			sig: { params: types, rets },
		};
	}

	/**
	 * The pairs a dispatching method keeps from its overloads: a receiver class
	 * keeps its answer only where every overload states one for it and all state
	 * the same, so the narrowed answer is that of whichever overload is called.
	 */
	private agreedPairs(overloads: Emitted[]): { receiverClass: string; returnClass: string }[] | undefined {
		if (!overloads.every(m => m.returnPairs?.length)) return undefined;
		const answer = new Map<string, Set<string>>();
		for (const m of overloads)
			for (const p of m.returnPairs!)
				answer.set(p.receiverClass, (answer.get(p.receiverClass) ?? new Set()).add(p.returnClass));
		const kept = [...answer]
			.filter(([r, ts]) => ts.size === 1 && overloads.every(m => m.returnPairs!.some(p => p.receiverClass === r)))
			.map(([r, ts]) => ({ receiverClass: r, returnClass: [...ts][0] }));
		return kept.length ? kept : undefined;
	}

	/**
	 * The overrides narrowing what an inherited member answers in this class,
	 * from its `returnInstantiations` in the object model: SpanSet.span answers a
	 * Span, and on an IntSpanSet it answers an IntSpan, which the factory has
	 * already wrapped it in, so IntSpanSet carries `override span(): IntSpan`
	 * calling `super`. A pair narrows only where its class is below the one the
	 * member is declared to answer, and only for a member the class does not
	 * declare itself; the nearest ancestor declaring the member is the one read.
	 */
	private narrowingOverrides(cls: string, own: Emitted[]): Emitted[] {
		const taken = new Set(own.map(m => m.name));
		const out: Emitted[] = [];
		for (const anc of this.m.ancestors(cls)) {
			for (const m of this.publicMembers.get(anc) ?? []) {
				if (taken.has(m.name)) continue;
				taken.add(m.name);
				const pair = m.returnPairs?.find(p => p.receiverClass === cls);
				if (!pair) continue;
				const members = this.members(m.ret);
				const nullable = members.includes('null');
				const classes = members.filter(t => t !== 'null');
				if (classes.length !== 1 || pair.returnClass === classes[0]
					|| !this.assignable(pair.returnClass, classes[0])) continue;
				const ret = nullable ? `${pair.returnClass} | null` : pair.returnClass;
				const args = m.params.map(p => p.name).join(', ');
				out.push({
					fn: m.fn, name: m.name, isStatic: false, params: m.params, ret,
					body: [`return super.${m.name}(${args}) as ${ret};`],
					doc: `MEOS: ${m.fn}, which answers a ${pair.returnClass} for a ${cls}`,
				});
			}
		}
		return out;
	}

	/** Whether a value of type `a` is one of type `b`, by the class chain. */
	private assignable(a: string, b: string): boolean {
		return a === b || (this.m.parent.has(a) && this.m.ancestors(a).includes(b));
	}

	/**
	 * The portable reader and writer of every encoding the catalog's
	 * `typeEncodings` gives the class's type, as #portable_methods of MEOS.NET's
	 * tools/objectgen.py reads them: the function of the type's SQL name in
	 * `readers`/`writers`, else the C type's `decoders`/`encoders`. Where the
	 * class or an ancestor has no method of that name, `as<Format>` forwards to
	 * the instance method behind the writer and `from<Format>` to the static one
	 * behind the reader.
	 */
	private portableMethods(cls: string, own: Emitted[], functions: Map<string, Emitted>): Emitted[] {
		const FORMAT_SPELLING: Record<string, string> = {
			text: 'Text', ewkt: 'EWKT', wkb: 'WKB', hexwkb: 'HexWKB', ewkb: 'EWKB', hexewkb: 'HexEWKB', mfjson: 'MFJSON',
		};
		const meostype = this.m.meostype.get(cls);
		const enc = this.m.idl.typeEncodings?.[this.m.ctype.get(cls) ?? ''];
		if (!meostype || !enc) return [];
		const sqltype = meostype.slice(2).toLowerCase();
		const taken = new Set(own.map(m => m.name));
		const out: Emitted[] = [];
		for (const format of enc.encodings ?? []) {
			const spelling = FORMAT_SPELLING[format];
			if (!spelling) continue;
			for (const [verb, byType, byClass] of [['as', 'writers', 'encoders'], ['from', 'readers', 'decoders']] as const) {
				const name = verb + spelling;
				const fn = enc[byType]?.[format]?.[sqltype] ?? enc[byClass]?.[format];
				if (!fn || taken.has(name)) continue;
				if (this.inheritedSig(cls, name, verb === 'from') !== undefined) continue;
				let target: Emitted | undefined;
				let owner = 'this';
				if (verb === 'as') {
					target = functions.get(fn);
				} else {
					const s = this.staticFunctions.get(fn);
					target = s?.m;
					owner = s?.cls ?? '';
				}
				if (!target) continue;
				const call = `${owner}.${target.name}(${target.params.map(p => p.name).join(', ')})`;
				out.push({ fn, name, isStatic: verb === 'from', params: target.params, ret: target.ret, body: [`return ${call};`] });
				taken.add(name);
			}
		}
		return out;
	}

	/**
	 * `toString` over the text writer the catalog names for the class, as
	 * #to_string and #text_writer of MEOS.NET read it: the writer of its SQL type
	 * in `writers.text`, else the text encoder of its C type, with MEOS's default
	 * precision where the writer takes one. A class whose writer is the one it
	 * inherits emits none of its own.
	 */
	private toStringMethod(cls: string, functions: Map<string, Emitted>): string[] {
		const parent = this.m.parent.get(cls);
		const inherited = parent ? this.textWriter.get(parent) : undefined;
		const enc = this.m.idl.typeEncodings?.[this.m.ctype.get(cls) ?? ''];
		const meostype = this.m.meostype.get(cls);
		const own = (meostype && enc?.writers?.text?.[meostype.slice(2).toLowerCase()]) || enc?.encoders?.text;
		const writer = own ?? inherited;
		this.textWriter.set(cls, writer);
		if (!writer || writer === inherited) return [];
		const out = functions.get(writer);
		if (!out || out.ret !== 'string') return [];
		const digits = this.m.idl.macros?.find(m => m.name === 'OUT_DEFAULT_DECIMAL_DIGITS')?.value;
		let args: string;
		if (out.params.length === 0) args = '';
		else if (out.params.length === 1 && out.params[0].ts === 'number' && digits !== undefined) args = String(digits);
		else return [];
		return [
			'',
			`\t/** The text MEOS writes this value as (MEOS: ${writer}). */`,
			`\toverride toString(): string {`,
			`\t\treturn this.${out.name}(${args});`,
			'\t}',
		];
	}

	// -- the factory ----------------------------------------------------

	/**
	 * The runtime factory, #factory_file of MEOS.NET: a MEOS value carries its own
	 * type in its header, read at the offset the catalog's struct layout gives.
	 */
	factory(): string {
		const lines: string[] = [];
		const subtypeOffset = this.m.structOffset('Temporal', 'subtype');
		const subtypeValues = new Map(this.m.om.axes.subtype.values.filter(v => v.class).map(v => [v.class!, v.value]));
		const roots = [...new Set([...this.m.wrapRoot]
			.filter(([c, r]) => !TEMPORAL_STRUCTS.has(c) || r === 'Temporal').map(([, r]) => r))].sort();
		for (const root of roots) {
			const field = DISCRIMINATOR[root];
			lines.push(
				`/** The value at \`ptr\` as the ${root} class its runtime type names. */`,
				`export function wrap${root}(ptr: Ptr): ${root} {`,
			);
			if (!field) {
				lines.push(`\treturn new ${root}(ptr);`, '}', '');
			} else {
				const offset = this.m.structOffset(root, field);
				const cases: [number, string, string][] = [];
				for (const [cls, mt] of this.m.meostype) {
					const value = this.m.enumValue('MeosType', mt);
					if (value === undefined || this.m.ctype.get(cls) !== root) continue;
					const hasConcrete = [...this.m.subtypeOf.keys()].some(c => this.m.parent.get(c) === cls);
					cases.push([value, mt, root === 'Temporal' && hasConcrete ? `wrap${cls}Subtype(ptr)` : `new ${cls}(ptr)`]);
				}
				cases.sort((a, b) => a[0] - b[0]);
				lines.push(`\t// ${root}.${field}, at byte ${offset}`, `\tswitch (_byte(ptr, ${offset})) {`);
				for (const [v, mt, expr] of cases) lines.push(`\t\tcase ${v}: return ${expr}; // ${mt}`);
				lines.push(`\t\tdefault: return new ${root}(ptr);`, '\t}', '}', '');
			}
			lines.push(
				`/** As wrap${root}, answering null for a null pointer. */`,
				`export function wrap${root}OrNull(ptr: Ptr): ${root} | null {`,
				`\treturn ptr ? wrap${root}(ptr) : null;`,
				'}',
				'',
			);
		}
		for (const leaf of [...new Set([...this.m.subtypeOf.keys()].map(c => this.m.parent.get(c)!))].sort()) {
			lines.push(`function wrap${leaf}Subtype(ptr: Ptr): ${leaf} {`, `\tswitch (_byte(ptr, ${subtypeOffset})) {`);
			for (const [subtype, suffix] of Object.entries(SUBTYPE_SUFFIX)) {
				const concrete = leaf + suffix;
				if (this.m.parent.has(concrete)) lines.push(`\t\tcase ${subtypeValues.get(subtype)}: return new ${concrete}(ptr);`);
			}
			lines.push(`\t\tdefault: return new ${leaf}(ptr);`, '\t}', '}', '');
		}
		return lines.join('\n');
	}
}

/** The keywords FunctionsGenerator.ts's safeName escapes, so a length reads the parameter it names. */
const TS_KEYWORDS = new Set(['break', 'case', 'catch', 'class', 'const', 'continue', 'debugger', 'default',
	'delete', 'do', 'else', 'enum', 'export', 'extends', 'false', 'finally', 'for', 'function', 'if', 'import',
	'in', 'instanceof', 'new', 'null', 'return', 'super', 'switch', 'this', 'throw', 'true', 'try', 'typeof',
	'var', 'void', 'while', 'with', 'as', 'implements', 'interface', 'let', 'package', 'private', 'protected',
	'public', 'static', 'yield', 'type', 'declare']);
const safe = (n: string) => (TS_KEYWORDS.has(n) ? `${n}_` : n);

/**
 * The local holding the marshalled copy of parameter `n` for the call: `_n`, or
 * `_n_` where `_n` names a helper the module defines, as #safe escapes a
 * keyword. `const _bytes = _bytes(bytes)` would read the local in its own
 * initializer, and every call to the helper after it would call the local.
 */
const temp = (n: string) => (PRELUDE_HELPERS.has(`_${n}`) ? `_${n}_` : `_${n}`);

// -------------------------------------------------------------------------
// FILES
// -------------------------------------------------------------------------

/**
 * The runtime the classes stand on: the heap helpers ptr_array.ts and wkb.ts
 * already use, and the base class every handle extends — #base_file of MEOS.NET,
 * with the `free()` / `using` release the hand-written core/types classes give.
 */
const PRELUDE = `import { getModule } from '../runtime/meos.js';
import * as F from '../functions/functions.generated.js';
import type { Ptr, TimestampTz, DateADT@OWN_TYPES@ } from '../functions/functions.generated.js';
import { readWkb } from '../functions/wkb.js';

export type { Ptr, TimestampTz, DateADT@OWN_TYPES@ };

/** A view of \`size\` bytes of the WASM heap at \`ptr\`, taken after any growth. */
function _view(ptr: Ptr, size: number): DataView {
	const heap = getModule().HEAPU8;
	return new DataView(heap.buffer, heap.byteOffset + ptr, size);
}

/** The byte at \`ptr + offset\`. */
function _byte(ptr: Ptr, offset: number): number {
	return getModule().HEAPU8[ptr + offset];
}

/** \`size\` zeroed bytes of the WASM heap, freed with _free. */
function _alloc(size: number): Ptr {
	const mod = getModule();
	return mod.allocate(new Uint8Array(size), mod.ALLOC_NORMAL) as Ptr;
}

/** Frees memory MEOS or _alloc allocated. */
function _free(ptr: Ptr): void {
	F.meos_free(ptr);
}

/** A C array of the given pointers (8 bytes each in wasm64), as withPtrArray builds one; freed with _free. */
function _ptrArray(ptrs: Ptr[]): Ptr {
	const bytes = new Uint8Array(Math.max(ptrs.length, 1) * 8);
	const view = new DataView(bytes.buffer);
	ptrs.forEach((p, i) => view.setBigUint64(i * 8, BigInt(p), true));
	const mod = getModule();
	return mod.allocate(bytes, mod.ALLOC_NORMAL) as Ptr;
}

/** The caller's bytes copied into the heap, freed with _free. */
function _bytes(bytes: Uint8Array): Ptr {
	const out = _alloc(Math.max(bytes.length, 1));
	getModule().HEAPU8.set(bytes, out);
	return out;
}

/** A NUL-terminated UTF-8 copy of a string in the heap, or NULL for null; freed with _free. */
function _cstring(s: string | null): Ptr {
	return s === null ? (0 as Ptr) : _bytes(new TextEncoder().encode(s + '\\0'));
}

/** A copy of \`size\` bytes at \`ptr\` in a buffer of its own, freed with _free. */
function _copy(ptr: Ptr, size: number): Ptr {
	const out = _alloc(size);
	const heap = getModule().HEAPU8;
	heap.copyWithin(out, ptr, ptr + size);
	return out;
}

/** One buffer holding each struct of \`size\` bytes at \`ptrs\`, in order; freed with _free. */
function _structArray(ptrs: Ptr[], size: number): Ptr {
	const out = _alloc(Math.max(ptrs.length, 1) * size);
	const heap = getModule().HEAPU8;
	ptrs.forEach((p, i) => heap.copyWithin(out + i * size, p, p + size));
	return out;
}

/**
 * A handle on a value MEOS allocated. The pointer is what every generated
 * method forwards to the C API; \`free()\` (or \`using\`) releases it.
 */
export abstract class MeosObject {
	/** Holds the pointer, as MEOSObject of MEOS.NET does. */
	constructor(readonly ptr: Ptr) {}

	/** Releases the MEOS value; the object must not be used afterwards. */
	free(): void {
		F.meos_free(this.ptr);
	}

	[Symbol.dispose](): void {
		this.free();
	}
}
`;

/** The helpers PRELUDE defines, which #temp keeps the locals of a call from shadowing. */
const PRELUDE_HELPERS = new Set([...PRELUDE.matchAll(/^function (_\w+)\(/gm)].map(m => m[1]));

/** GAP-LEDGER.md, as gapledger.Ledger of MEOS.NET writes its object-layer section. */
function ledger(gen: Generator, commit: string): string {
	const lines = [
		'# Gap ledger of the object layer',
		'',
		'Generated by `codegen/ObjectGenerator.ts` from the MEOS-API catalog of MobilityDB',
		`\`${commit}\`. Every method the object model assigns that the layer does not emit is a`,
		'row here, with the contract it is missing. Do not edit; run `npm run generate`.',
		'',
	];
	for (const [kind, missing] of Object.entries(DEFERRAL_KINDS)) {
		const rows = gen.deferred.filter(d => d.kind === kind);
		lines.push(`## ${kind} (${rows.length})`, '', missing, '');
		if (rows.length) {
			lines.push('| class | member | what is missing |', '|---|---|---|');
			for (const r of [...rows].sort((a, b) => a.cls.localeCompare(b.cls) || a.member.localeCompare(b.member)))
				lines.push(`| ${r.cls} | ${r.member} | ${r.detail.replace(/\|/g, '\\|')} |`);
			lines.push('');
		}
	}
	return lines.join('\n');
}

function main(): void {
	const idl: FullIdl = JSON.parse(fs.readFileSync(IDL_PATH, 'utf-8'));
	const sigs = emittedSignatures(idl);
	const model = new Model(idl);
	const gen = new Generator(model, sigs);

	const BANNER = '/* AUTO-GENERATED - DO NOT ' + 'EDIT. Run: npm run generate */\n';
	const classes = model.classes();
	const body = classes.map(c => gen.emitClass(c)).join('\n');
	const structs = gen.valueStructCode() + '\n' + gen.structCode();
	// The types of their own the flat surface declares over a width (H3Index),
	// which the signatures name.
	const own = ownTypeNames().map(n => `, ${n}`).join('');
	const out = BANNER + PRELUDE.replaceAll('@OWN_TYPES@', own) + '\n' + structs + '\n' + body + '\n' + gen.factory();

	const outDir = path.resolve(__dirname, '../core/objects');
	fs.mkdirSync(outDir, { recursive: true });
	fs.writeFileSync(path.join(outDir, 'objects.generated.ts'), out);
	fs.writeFileSync(path.resolve(__dirname, '../GAP-LEDGER.md'), ledger(gen, idl.sourceCommit ?? 'unknown'));
	console.log(`ObjectGenerator: ${classes.length} classes, ${gen.emitted} methods emitted, ${gen.deferred.length} deferred to GAP-LEDGER.md`);
}

main();
