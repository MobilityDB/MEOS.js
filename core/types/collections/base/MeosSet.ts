import type { Ptr } from '../../../functions/functions.generated';
import {
	set_copy,
	set_from_hexwkb,
	set_as_hexwkb,
	set_num_values,
	set_hash,
	set_to_span,
	set_to_spanset,
	contained_set_set,
	contains_set_set,
	overlaps_set_set,
	left_set_set,
	overleft_set_set,
	right_set_set,
	overright_set_set,
	intersection_set_set,
	minus_set_set,
	union_set_set,
	set_eq,
	set_ne,
	set_lt,
	set_le,
	set_gt,
	set_ge,
	meos_free,
} from '../../../functions/functions.generated';

/**
 * Abstract base class for all MEOS set types (ordered sets of discrete values).
 *
 * A set holds a finite, sorted collection of distinct values of the same type.
 *
 * Concrete subclasses: {@link IntSet}, {@link FloatSet}, {@link DateSet},
 * {@link TsTzSet}.
 *
 * @typeParam T - The element type (e.g. `number` for `IntSet`, `DateADT` for `DateSet`).
 *
 * @remarks
 * Every set object wraps a WASM heap pointer and **must** be released with
 * {@link free} (or a `using` declaration) when no longer needed.
 */
export abstract class MeosSet<T> {
	protected readonly _inner: Ptr;

	constructor(inner: Ptr) {
		this._inner = inner;
	}

	/** @internal Subclass must return a new instance of itself wrapping the given pointer. */
	protected abstract _make(ptr: Ptr): this;

	// -------------------------------------------------------------------------
	// LIFECYCLE
	// -------------------------------------------------------------------------

	/** Raw WASM heap pointer. Do not free this value directly; use {@link free}. */
	get inner(): Ptr {
		return this._inner;
	}

	/** Releases the WASM-allocated memory. Must be called when the object is no longer needed. */
	free(): void {
		meos_free(this._inner);
	}

	/** Implements the `using` resource-management protocol — calls {@link free} automatically. */
	[Symbol.dispose](): void {
		this.free();
	}

	/**
	 * Returns a deep copy of this set.
	 * The caller is responsible for calling {@link free} on the returned copy.
	 */
	copy(): this {
		return this._make(set_copy(this._inner));
	}

	// -------------------------------------------------------------------------
	// OUTPUT
	// -------------------------------------------------------------------------

	/** Returns the WKT string representation (e.g. `{1, 3, 7}`). */
	abstract toString(): string;

	/**
	 * Serialises this set to a hex-encoded WKB string.
	 * @param variant WKB encoding variant (default `4` = Extended WKB).
	 */
	asHexWKB(variant = 4): string {
		return set_as_hexwkb(this._inner, variant);
	}

	// -------------------------------------------------------------------------
	// ACCESSORS
	// -------------------------------------------------------------------------

	/** Number of elements in this set. */
	numValues(): number {
		return set_num_values(this._inner);
	}

	/** 32-bit integer hash of this set. */
	hash(): number {
		return set_hash(this._inner);
	}

	/**
	 * Returns the bounding span of this set as a raw WASM pointer.
	 * Use the appropriate `Span` constructor to obtain a typed object.
	 */
	toSpan(): Ptr {
		return set_to_span(this._inner);
	}

	/**
	 * Returns this set converted to a {@link SpanSet} as a raw WASM pointer.
	 * Use the appropriate `SpanSet` constructor to obtain a typed object.
	 */
	toSpanSet(): Ptr {
		return set_to_spanset(this._inner);
	}

	/** Returns the smallest (first) value in the set. */
	abstract startValue(): T;

	/** Returns the largest (last) value in the set. */
	abstract endValue(): T;

	/**
	 * Returns the n-th value (0-based index).
	 * @param n 0-based index (MEOS internally uses 1-based indexing).
	 */
	abstract valueN(n: number): T | null;

	// -------------------------------------------------------------------------
	// TOPOLOGICAL PREDICATES
	// -------------------------------------------------------------------------

	/** `true` if `this` is entirely contained within `other` (every element of `this` is in `other`). */
	isContainedIn(other: this): boolean {
		return contained_set_set(this._inner, other.inner);
	}

	/** `true` if `this` contains every element of `other`. */
	contains(other: this): boolean {
		return contains_set_set(this._inner, other.inner);
	}

	/** `true` if `this` and `other` share at least one element. */
	overlaps(other: this): boolean {
		return overlaps_set_set(this._inner, other.inner);
	}

	// -------------------------------------------------------------------------
	// POSITION PREDICATES
	// -------------------------------------------------------------------------

	/** `true` if every element of `this` is strictly less than every element of `other`. */
	isBefore(other: this): boolean {
		return left_set_set(this._inner, other.inner);
	}

	/**
	 * `true` if `this` does not extend to the right of `other`
	 * (i.e. `max(this) ≤ max(other)`).
	 */
	isOverOrBefore(other: this): boolean {
		return overleft_set_set(this._inner, other.inner);
	}

	/** `true` if every element of `this` is strictly greater than every element of `other`. */
	isAfter(other: this): boolean {
		return right_set_set(this._inner, other.inner);
	}

	/**
	 * `true` if `this` does not extend to the left of `other`
	 * (i.e. `min(this) ≥ min(other)`).
	 */
	isOverOrAfter(other: this): boolean {
		return overright_set_set(this._inner, other.inner);
	}

	// -------------------------------------------------------------------------
	// DISTANCE
	// -------------------------------------------------------------------------

	/**
	 * Returns the distance between `this` and `other`.
	 * Returns `0` if they share at least one element.
	 * The unit depends on the concrete type.
	 */
	abstract distance(other: this): number;

	// -------------------------------------------------------------------------
	// SET OPERATIONS
	// -------------------------------------------------------------------------

	/**
	 * Returns the intersection of `this` and `other`, or `null` if they are disjoint.
	 * The caller is responsible for calling {@link free} on the result.
	 */
	intersection(other: this): this | null {
		const ptr = intersection_set_set(this._inner, other.inner);
		return ptr === 0 ? null : this._make(ptr);
	}

	/**
	 * Returns the part of `this` not in `other`, or `null` if the result is empty.
	 * The caller is responsible for calling {@link free} on the result.
	 */
	minus(other: this): this | null {
		const ptr = minus_set_set(this._inner, other.inner);
		return ptr === 0 ? null : this._make(ptr);
	}

	/**
	 * Returns the union of `this` and `other`.
	 * The caller is responsible for calling {@link free} on the result.
	 */
	union(other: this): this {
		return this._make(union_set_set(this._inner, other.inner));
	}

	// -------------------------------------------------------------------------
	// COMPARISONS
	// -------------------------------------------------------------------------

	/** `true` if `this` and `other` contain the same elements. */
	eq(other: this): boolean {
		return set_eq(this._inner, other.inner);
	}

	/** `true` if `this` and `other` differ in at least one element. */
	ne(other: this): boolean {
		return set_ne(this._inner, other.inner);
	}

	/** `true` if `this` is strictly less than `other` in MEOS total ordering. */
	lt(other: this): boolean {
		return set_lt(this._inner, other.inner);
	}

	/** `true` if `this` is less than or equal to `other` in MEOS total ordering. */
	le(other: this): boolean {
		return set_le(this._inner, other.inner);
	}

	/** `true` if `this` is strictly greater than `other` in MEOS total ordering. */
	gt(other: this): boolean {
		return set_gt(this._inner, other.inner);
	}

	/** `true` if `this` is greater than or equal to `other` in MEOS total ordering. */
	ge(other: this): boolean {
		return set_ge(this._inner, other.inner);
	}
}
