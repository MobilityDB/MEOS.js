import type { Ptr } from '../../../functions/functions.generated';
import {
	span_lower_inc,
	span_upper_inc,
	span_copy,
	span_hash,
	span_to_spanset,
	span_as_hexwkb,
	contained_span_span,
	contains_span_span,
	overlaps_span_span,
	left_span_span,
	overleft_span_span,
	right_span_span,
	overright_span_span,
	intersection_span_span,
	minus_span_span,
	union_span_span,
	span_eq,
	span_ne,
	span_lt,
	span_le,
	span_gt,
	span_ge,
	meos_free,
} from '../../../functions/functions.generated';

/**
 * Abstract base class for all MEOS span types (contiguous ranges).
 *
 * A span represents a contiguous set of values between a lower and an upper
 * bound, each of which can be inclusive (`[`, `]`) or exclusive (`(`, `)`).
 *
 * Concrete subclasses: {@link IntSpan}, {@link FloatSpan}, {@link DateSpan},
 * {@link TsTzSpan}.
 *
 * @remarks
 * Every span object wraps a WASM heap pointer and **must** be released with
 * {@link free} (or a `using` declaration) when no longer needed to avoid
 * memory leaks.
 */
export abstract class Span {
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
	 * Returns a deep copy of this span.
	 * The caller is responsible for calling {@link free} on the returned copy.
	 */
	copy(): this {
		return this._make(span_copy(this._inner));
	}

	// -------------------------------------------------------------------------
	// OUTPUT
	// -------------------------------------------------------------------------

	/** Returns the WKT string representation of this span (e.g. `[1, 10)`). */
	abstract toString(): string;

	/**
	 * Serialises this span to a hex-encoded WKB string.
	 * @param variant WKB encoding variant (default `4` = Extended WKB).
	 */
	asHexWKB(variant = 4): string {
		return span_as_hexwkb(this._inner, variant);
	}

	// -------------------------------------------------------------------------
	// ACCESSORS
	// -------------------------------------------------------------------------

	/**
	 * Returns the lower bound value.
	 * The concrete type determines the unit (integer, float, DateADT, TimestampTz).
	 */
	abstract lower(): number;

	/**
	 * Returns the upper bound value.
	 * The concrete type determines the unit (integer, float, DateADT, TimestampTz).
	 */
	abstract upper(): number;

	/** `true` if the lower bound is inclusive (`[`). */
	lowerInc(): boolean {
		return span_lower_inc(this._inner);
	}

	/** `true` if the upper bound is inclusive (`]`). */
	upperInc(): boolean {
		return span_upper_inc(this._inner);
	}

	/** 32-bit integer hash of this span. */
	hash(): number {
		return span_hash(this._inner);
	}

	/**
	 * Wraps this span in a one-element {@link SpanSet} and returns the raw WASM pointer.
	 * Use the appropriate `SpanSet` constructor (e.g. `new IntSpanSet(ptr)`) to obtain a typed object.
	 */
	toSpanSet(): Ptr {
		return span_to_spanset(this._inner);
	}

	// -------------------------------------------------------------------------
	// TOPOLOGICAL PREDICATES
	// -------------------------------------------------------------------------

	/**
	 * `true` if `this` and `other` share exactly one boundary point without overlapping.
	 * For example, `[1, 5)` is adjacent to `[5, 10]`.
	 */
	abstract isAdjacent(other: this): boolean;

	/** `true` if `this` is entirely contained within `other`. */
	isContainedIn(other: this): boolean {
		return contained_span_span(this._inner, other.inner);
	}

	/** `true` if `this` entirely contains `other`. */
	contains(other: this): boolean {
		return contains_span_span(this._inner, other.inner);
	}

	/** `true` if `this` and `other` share at least one point. */
	overlaps(other: this): boolean {
		return overlaps_span_span(this._inner, other.inner);
	}

	// -------------------------------------------------------------------------
	// POSITION PREDICATES
	// -------------------------------------------------------------------------

	/** `true` if every point in `this` is strictly less than every point in `other` (no overlap). */
	isBefore(other: this): boolean {
		return left_span_span(this._inner, other.inner);
	}

	/**
	 * `true` if `this` does not extend to the right of `other`
	 * (i.e. `max(this) ≤ max(other)`).
	 */
	isOverOrBefore(other: this): boolean {
		return overleft_span_span(this._inner, other.inner);
	}

	/** `true` if every point in `this` is strictly greater than every point in `other` (no overlap). */
	isAfter(other: this): boolean {
		return right_span_span(this._inner, other.inner);
	}

	/**
	 * `true` if `this` does not extend to the left of `other`
	 * (i.e. `min(this) ≥ min(other)`).
	 */
	isOverOrAfter(other: this): boolean {
		return overright_span_span(this._inner, other.inner);
	}

	// -------------------------------------------------------------------------
	// DISTANCE
	// -------------------------------------------------------------------------

	/**
	 * Returns the distance between `this` and `other`.
	 * Returns `0` if they overlap. The unit depends on the concrete type
	 * (integers for {@link IntSpan}, days for {@link DateSpan}, microseconds for {@link TsTzSpan}).
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
		const ptr = intersection_span_span(this._inner, other.inner);
		return ptr === 0 ? null : this._make(ptr);
	}

	/**
	 * Returns the part of `this` that is not in `other` as a raw WASM pointer.
	 * The result may represent a `SpanSet` when the subtraction splits this span into two parts.
	 */
	minus(other: this): Ptr {
		return minus_span_span(this._inner, other.inner);
	}

	/**
	 * Returns the union of `this` and `other` as a raw WASM pointer.
	 * The spans do not need to be adjacent or overlapping.
	 */
	union(other: this): Ptr {
		return union_span_span(this._inner, other.inner);
	}

	// -------------------------------------------------------------------------
	// COMPARISONS
	// -------------------------------------------------------------------------

	/** `true` if `this` and `other` have identical bounds and inclusivity. */
	eq(other: this): boolean {
		return span_eq(this._inner, other.inner);
	}

	/** `true` if `this` and `other` differ in at least one bound or inclusivity. */
	ne(other: this): boolean {
		return span_ne(this._inner, other.inner);
	}

	/** `true` if `this` is strictly less than `other` in MEOS total ordering. */
	lt(other: this): boolean {
		return span_lt(this._inner, other.inner);
	}

	/** `true` if `this` is less than or equal to `other` in MEOS total ordering. */
	le(other: this): boolean {
		return span_le(this._inner, other.inner);
	}

	/** `true` if `this` is strictly greater than `other` in MEOS total ordering. */
	gt(other: this): boolean {
		return span_gt(this._inner, other.inner);
	}

	/** `true` if `this` is greater than or equal to `other` in MEOS total ordering. */
	ge(other: this): boolean {
		return span_ge(this._inner, other.inner);
	}
}
