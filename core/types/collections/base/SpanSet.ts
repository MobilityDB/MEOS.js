import type { Ptr } from '../../../functions/functions.generated';
import {
	spanset_copy,
	spanset_as_hexwkb,
	spanset_hash,
	spanset_lower_inc,
	spanset_upper_inc,
	spanset_num_spans,
	spanset_span,
	spanset_span_n,
	spanset_start_span,
	spanset_end_span,
	adjacent_spanset_span,
	adjacent_spanset_spanset,
	contained_spanset_span,
	contained_spanset_spanset,
	contains_spanset_span,
	contains_spanset_spanset,
	overlaps_spanset_span,
	overlaps_spanset_spanset,
	left_spanset_span,
	left_spanset_spanset,
	overleft_spanset_span,
	overleft_spanset_spanset,
	right_spanset_span,
	right_spanset_spanset,
	overright_spanset_span,
	overright_spanset_spanset,
	intersection_span_spanset,
	intersection_spanset_spanset,
	minus_spanset_span,
	minus_spanset_spanset,
	union_spanset_span,
	union_spanset_spanset,
	spanset_eq,
	spanset_ne,
	spanset_lt,
	spanset_le,
	spanset_gt,
	spanset_ge,
	meos_free,
} from '../../../functions/functions.generated';
import { Span } from './Span';

/**
 * Abstract base class for all MEOS span-set types (ordered sets of disjoint spans).
 *
 * A span set holds one or more non-overlapping, non-adjacent spans of the same
 * type, ordered by their lower bound.
 *
 * Concrete subclasses: {@link IntSpanSet}, {@link FloatSpanSet},
 * {@link DateSpanSet}, {@link TsTzSpanSet}.
 *
 * @typeParam S - The companion {@link Span} subclass (e.g. `IntSpan`).
 *
 * @remarks
 * Every span-set object wraps a WASM heap pointer and **must** be released with
 * {@link free} (or a `using` declaration) when no longer needed.
 */
export abstract class SpanSet<S extends Span> {
	protected readonly _inner: Ptr;

	constructor(inner: Ptr) {
		this._inner = inner;
	}

	/** @internal Subclass must return a new SpanSet instance wrapping the given pointer. */
	protected abstract _makeSpanSet(ptr: Ptr): this;
	/** @internal Subclass must return a new companion Span instance wrapping the given pointer. */
	protected abstract _makeSpan(ptr: Ptr): S;

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
	 * Returns a deep copy of this span set.
	 * The caller is responsible for calling {@link free} on the returned copy.
	 */
	copy(): this {
		return this._makeSpanSet(spanset_copy(this._inner));
	}

	// -------------------------------------------------------------------------
	// OUTPUT
	// -------------------------------------------------------------------------

	/** Returns the WKT string representation (e.g. `{[1, 5), [8, 12)}`). */
	abstract toString(): string;

	/**
	 * Serialises this span set to a hex-encoded WKB string.
	 * @param variant WKB encoding variant (default `4` = Extended WKB).
	 */
	asHexWKB(variant = 4): string {
		return spanset_as_hexwkb(this._inner, variant);
	}

	// -------------------------------------------------------------------------
	// ACCESSORS
	// -------------------------------------------------------------------------

	/**
	 * Returns the lower bound of the first (leftmost) span.
	 * The concrete type determines the unit.
	 */
	abstract lower(): number;

	/**
	 * Returns the upper bound of the last (rightmost) span.
	 * The concrete type determines the unit.
	 */
	abstract upper(): number;

	/** `true` if the lower bound of the first span is inclusive (`[`). */
	lowerInc(): boolean {
		return spanset_lower_inc(this._inner);
	}

	/** `true` if the upper bound of the last span is inclusive (`]`). */
	upperInc(): boolean {
		return spanset_upper_inc(this._inner);
	}

	/** Number of spans in this set. */
	numSpans(): number {
		return spanset_num_spans(this._inner);
	}

	/** 32-bit integer hash of this span set. */
	hash(): number {
		return spanset_hash(this._inner);
	}

	/**
	 * Returns the smallest span that covers all spans in this set (the bounding span).
	 * The caller is responsible for calling {@link Span.free} on the result.
	 */
	boundingSpan(): S {
		return this._makeSpan(spanset_span(this._inner));
	}

	/**
	 * Returns the first (leftmost) span in this set.
	 * The caller is responsible for calling {@link Span.free} on the result.
	 */
	startSpan(): S {
		return this._makeSpan(spanset_start_span(this._inner));
	}

	/**
	 * Returns the last (rightmost) span in this set.
	 * The caller is responsible for calling {@link Span.free} on the result.
	 */
	endSpan(): S {
		return this._makeSpan(spanset_end_span(this._inner));
	}

	/**
	 * Returns the n-th span (0-based index).
	 * The caller is responsible for calling {@link Span.free} on the result.
	 * @param n 0-based index (MEOS internally uses 1-based indexing).
	 */
	spanN(n: number): S {
		return this._makeSpan(spanset_span_n(this._inner, n + 1));
	}

	// -------------------------------------------------------------------------
	// TOPOLOGICAL PREDICATES
	// -------------------------------------------------------------------------

	/**
	 * `true` if `this` and `other` share exactly one boundary point without overlapping.
	 * Accepts either a companion span or another span set of the same type.
	 */
	isAdjacent(other: S | this): boolean {
		if (other instanceof Span) return adjacent_spanset_span(this._inner, other.inner);
		return adjacent_spanset_spanset(this._inner, other.inner);
	}

	/**
	 * `true` if `this` is entirely contained within `other`.
	 * Accepts either a companion span or another span set of the same type.
	 */
	isContainedIn(other: S | this): boolean {
		if (other instanceof Span) return contained_spanset_span(this._inner, other.inner);
		return contained_spanset_spanset(this._inner, other.inner);
	}

	/**
	 * `true` if `this` entirely contains `other`.
	 * Accepts either a companion span or another span set of the same type.
	 */
	contains(other: S | this): boolean {
		if (other instanceof Span) return contains_spanset_span(this._inner, other.inner);
		return contains_spanset_spanset(this._inner, other.inner);
	}

	/**
	 * `true` if `this` and `other` share at least one point.
	 * Accepts either a companion span or another span set of the same type.
	 */
	overlaps(other: S | this): boolean {
		if (other instanceof Span) return overlaps_spanset_span(this._inner, other.inner);
		return overlaps_spanset_spanset(this._inner, other.inner);
	}

	// -------------------------------------------------------------------------
	// POSITION PREDICATES
	// -------------------------------------------------------------------------

	/**
	 * `true` if every point in `this` is strictly less than every point in `other`.
	 * Accepts either a companion span or another span set of the same type.
	 */
	isBefore(other: S | this): boolean {
		if (other instanceof Span) return left_spanset_span(this._inner, other.inner);
		return left_spanset_spanset(this._inner, other.inner);
	}

	/**
	 * `true` if `this` does not extend to the right of `other`
	 * (i.e. `max(this) ≤ max(other)`).
	 * Accepts either a companion span or another span set of the same type.
	 */
	isOverOrBefore(other: S | this): boolean {
		if (other instanceof Span) return overleft_spanset_span(this._inner, other.inner);
		return overleft_spanset_spanset(this._inner, other.inner);
	}

	/**
	 * `true` if every point in `this` is strictly greater than every point in `other`.
	 * Accepts either a companion span or another span set of the same type.
	 */
	isAfter(other: S | this): boolean {
		if (other instanceof Span) return right_spanset_span(this._inner, other.inner);
		return right_spanset_spanset(this._inner, other.inner);
	}

	/**
	 * `true` if `this` does not extend to the left of `other`
	 * (i.e. `min(this) ≥ min(other)`).
	 * Accepts either a companion span or another span set of the same type.
	 */
	isOverOrAfter(other: S | this): boolean {
		if (other instanceof Span) return overright_spanset_span(this._inner, other.inner);
		return overright_spanset_spanset(this._inner, other.inner);
	}

	// -------------------------------------------------------------------------
	// DISTANCE
	// -------------------------------------------------------------------------

	/**
	 * Returns the distance between `this` and `other`.
	 * Returns `0` if they overlap. Accepts either a companion span or another span set.
	 * The unit depends on the concrete type.
	 */
	abstract distance(other: S | this): number;

	// -------------------------------------------------------------------------
	// SET OPERATIONS
	// -------------------------------------------------------------------------

	/**
	 * Returns the intersection of `this` and `other`, or `null` if they are disjoint.
	 * Accepts either a companion span or another span set of the same type.
	 * The caller is responsible for calling {@link free} on the result.
	 */
	intersection(other: S | this): this | null {
		const ptr =
			other instanceof Span
				? intersection_span_spanset(other.inner, this._inner)
				: intersection_spanset_spanset(this._inner, other.inner);
		return ptr === 0 ? null : this._makeSpanSet(ptr);
	}

	/**
	 * Returns the part of `this` that is not in `other`, or `null` if the result is empty.
	 * Accepts either a companion span or another span set of the same type.
	 * The caller is responsible for calling {@link free} on the result.
	 */
	minus(other: S | this): this | null {
		const ptr =
			other instanceof Span
				? minus_spanset_span(this._inner, other.inner)
				: minus_spanset_spanset(this._inner, other.inner);
		return ptr === 0 ? null : this._makeSpanSet(ptr);
	}

	/**
	 * Returns the union of `this` and `other`.
	 * Accepts either a companion span or another span set of the same type.
	 * The caller is responsible for calling {@link free} on the result.
	 */
	union(other: S | this): this {
		const ptr =
			other instanceof Span
				? union_spanset_span(this._inner, other.inner)
				: union_spanset_spanset(this._inner, other.inner);
		return this._makeSpanSet(ptr);
	}

	// -------------------------------------------------------------------------
	// COMPARISONS
	// -------------------------------------------------------------------------

	/** `true` if `this` and `other` are identical (same spans, bounds, and inclusivity). */
	eq(other: this): boolean {
		return spanset_eq(this._inner, other.inner);
	}

	/** `true` if `this` and `other` differ in at least one span. */
	ne(other: this): boolean {
		return spanset_ne(this._inner, other.inner);
	}

	/** `true` if `this` is strictly less than `other` in MEOS total ordering. */
	lt(other: this): boolean {
		return spanset_lt(this._inner, other.inner);
	}

	/** `true` if `this` is less than or equal to `other` in MEOS total ordering. */
	le(other: this): boolean {
		return spanset_le(this._inner, other.inner);
	}

	/** `true` if `this` is strictly greater than `other` in MEOS total ordering. */
	gt(other: this): boolean {
		return spanset_gt(this._inner, other.inner);
	}

	/** `true` if `this` is greater than or equal to `other` in MEOS total ordering. */
	ge(other: this): boolean {
		return spanset_ge(this._inner, other.inner);
	}
}
