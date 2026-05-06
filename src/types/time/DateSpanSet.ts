import type { Ptr, DateADT } from '../../core/functions';
import {
	datespanset_in,
	datespanset_out,
	spanset_from_hexwkb,
	span_to_spanset,
	datespanset_start_date,
	datespanset_end_date,
	datespanset_num_dates,
	datespanset_date_n,
	distance_datespanset_datespan,
	distance_datespanset_datespanset,
	datespanset_to_tstzspanset,
	datespanset_shift_scale,
} from '../../core/functions';
import { SpanSet } from '../base/SpanSet';
import { DateSpan } from './DateSpan';

/**
 * An ordered set of disjoint {@link DateSpan} values.
 *
 * Dates are represented as `DateADT` integers (days since 2000-01-01).
 *
 * @example
 * ```ts
 * const ss = DateSpanSet.fromString('{[2020-01-01, 2020-06-01), [2020-09-01, 2020-12-31]}');
 * console.log(ss.numSpans());  // 2
 * console.log(ss.numDates());  // total distinct dates across all spans
 * ss.free();
 * ```
 */
export class DateSpanSet extends SpanSet<DateSpan> {
	protected _makeSpanSet(ptr: Ptr): this {
		return new DateSpanSet(ptr) as this;
	}

	protected _makeSpan(ptr: Ptr): DateSpan {
		return new DateSpan(ptr);
	}

	// -------------------------------------------------------------------------
	// CONSTRUCTORS
	// -------------------------------------------------------------------------

	/**
	 * Parses a `DateSpanSet` from its WKT string representation.
	 * @param str WKT string, e.g. `"{[2020-01-01, 2020-06-01), [2020-09-01, 2020-12-31]}"`.
	 */
	static fromString(str: string): DateSpanSet {
		return new DateSpanSet(datespanset_in(str));
	}

	/**
	 * Deserialises a `DateSpanSet` from a hex-encoded WKB string produced by {@link asHexWKB}.
	 * @param hexwkb Hex-encoded WKB string.
	 */
	static fromHexWKB(hexwkb: string): DateSpanSet {
		return new DateSpanSet(spanset_from_hexwkb(hexwkb));
	}

	/**
	 * Wraps a single {@link DateSpan} into a one-element `DateSpanSet`.
	 * @param span The span to wrap.
	 */
	static fromSpan(span: DateSpan): DateSpanSet {
		return new DateSpanSet(span_to_spanset(span.inner));
	}

	// -------------------------------------------------------------------------
	// OUTPUT
	// -------------------------------------------------------------------------

	/** Returns the WKT string representation. */
	toString(): string {
		return datespanset_out(this._inner);
	}

	// -------------------------------------------------------------------------
	// ACCESSORS
	// -------------------------------------------------------------------------

	/** Returns the lower bound of the first span as days since 2000-01-01. */
	lower(): DateADT {
		return datespanset_start_date(this._inner);
	}

	/** Returns the upper bound of the last span as days since 2000-01-01. */
	upper(): DateADT {
		return datespanset_end_date(this._inner);
	}

	/** Returns the total number of distinct dates across all spans. */
	numDates(): number {
		return datespanset_num_dates(this._inner);
	}

	/** Returns the start date of the first span as days since 2000-01-01. */
	startDate(): DateADT {
		return datespanset_start_date(this._inner);
	}

	/** Returns the end date of the last span as days since 2000-01-01. */
	endDate(): DateADT {
		return datespanset_end_date(this._inner);
	}

	/**
	 * Returns the n-th date (0-based index) as days since 2000-01-01.
	 * @param n 0-based index (MEOS internally uses 1-based indexing).
	 */
	dateN(n: number): DateADT {
		return datespanset_date_n(this._inner, n + 1);
	}

	// -------------------------------------------------------------------------
	// DISTANCE
	// -------------------------------------------------------------------------

	/**
	 * Returns the distance (gap) between `this` and `other` in days.
	 * Returns `0` if they overlap. Accepts either a {@link DateSpan} or a `DateSpanSet`.
	 */
	distance(other: DateSpan | DateSpanSet): number {
		if (other instanceof DateSpan)
			return distance_datespanset_datespan(this._inner, other.inner);
		return distance_datespanset_datespanset(this._inner, other.inner);
	}

	// -------------------------------------------------------------------------
	// CONVERSIONS & MATH
	// -------------------------------------------------------------------------

	/**
	 * Converts this set to a {@link TsTzSpanSet} (date bounds become midnight UTC) and returns the raw WASM pointer.
	 * Use `new TsTzSpanSet(ptr)` to obtain a typed object.
	 */
	toTsTzSpanSet(): Ptr {
		return datespanset_to_tstzspanset(this._inner);
	}

	/**
	 * Returns a new span set shifted and/or scaled along the date axis.
	 * @param shift Number of days to shift (ignored when `hasShift` is `false`).
	 * @param width New total width in days (ignored when `hasWidth` is `false`).
	 * @param hasShift Set to `false` to skip shifting (default `true`).
	 * @param hasWidth Set to `false` to skip scaling (default `true`).
	 */
	shiftScale(
		shift: number,
		width: number,
		hasShift = true,
		hasWidth = true
	): DateSpanSet {
		return new DateSpanSet(
			datespanset_shift_scale(this._inner, shift, width, hasShift, hasWidth)
		);
	}
}
