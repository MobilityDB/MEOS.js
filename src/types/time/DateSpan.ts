import type { Ptr, DateADT } from '../../core/functions';
import {
	datespan_in,
	datespan_out,
	datespan_make,
	datespan_lower,
	datespan_upper,
	span_from_hexwkb,
	distance_datespan_datespan,
	datespan_to_tstzspan,
} from '../../core/functions';
import { Span } from '../base/Span';

/**
 * A contiguous range of calendar dates.
 *
 * Dates are represented as `DateADT` integers (days since 2000-01-01).
 *
 * @example
 * ```ts
 * const s = DateSpan.fromString('[2020-01-01, 2020-12-31]');
 * console.log(s.lower()); // days since 2000-01-01
 * console.log(s.durationDays()); // 365
 * s.free();
 * ```
 */
export class DateSpan extends Span {
	protected _make(ptr: Ptr): this {
		return new DateSpan(ptr) as this;
	}

	// -------------------------------------------------------------------------
	// CONSTRUCTORS
	// -------------------------------------------------------------------------

	/**
	 * Parses a `DateSpan` from its WKT string representation.
	 * @param str WKT string, e.g. `"[2020-01-01, 2020-12-31]"`.
	 */
	static fromString(str: string): DateSpan {
		return new DateSpan(datespan_in(str));
	}

	/**
	 * Creates a `DateSpan` from explicit date bounds.
	 * @param lower Lower bound as days since 2000-01-01.
	 * @param upper Upper bound as days since 2000-01-01.
	 * @param lowerInc `true` for inclusive lower bound `[` (default).
	 * @param upperInc `true` for inclusive upper bound `]` (default `false`).
	 */
	static fromBounds(
		lower: DateADT,
		upper: DateADT,
		lowerInc = true,
		upperInc = false
	): DateSpan {
		return new DateSpan(datespan_make(lower, upper, lowerInc, upperInc));
	}

	/**
	 * Deserialises a `DateSpan` from a hex-encoded WKB string produced by {@link asHexWKB}.
	 * @param hexwkb Hex-encoded WKB string.
	 */
	static fromHexWKB(hexwkb: string): DateSpan {
		return new DateSpan(span_from_hexwkb(hexwkb));
	}

	// -------------------------------------------------------------------------
	// ACCESSORS
	// -------------------------------------------------------------------------

	/** Returns the WKT string representation (e.g. `[2020-01-01, 2020-12-31]`). */
	toString(): string {
		return datespan_out(this._inner);
	}

	/** Returns the lower bound as days since 2000-01-01. */
	lower(): DateADT {
		return datespan_lower(this._inner);
	}

	/** Returns the upper bound as days since 2000-01-01. */
	upper(): DateADT {
		return datespan_upper(this._inner);
	}

	/** Returns the number of days between the lower and upper bounds (`upper - lower`). */
	durationDays(): number {
		return this.upper() - this.lower();
	}

	// -------------------------------------------------------------------------
	// TOPOLOGICAL PREDICATES
	// -------------------------------------------------------------------------

	/**
	 * `true` if `this` and `other` touch at exactly one boundary date without overlapping.
	 * For example, `[2020-01-01, 2020-06-01)` is adjacent to `[2020-06-01, 2020-12-31]`.
	 */
	isAdjacent(other: this): boolean {
		return (
			(this.upper() === other.lower() && this.upperInc() !== other.lowerInc()) ||
			(other.upper() === this.lower() && other.upperInc() !== this.lowerInc())
		);
	}

	// -------------------------------------------------------------------------
	// DISTANCE
	// -------------------------------------------------------------------------

	/**
	 * Returns the distance (gap) between `this` and `other` in days.
	 * Returns `0` if they overlap or are adjacent.
	 */
	distance(other: this): number {
		return distance_datespan_datespan(this._inner, other.inner);
	}

	// -------------------------------------------------------------------------
	// CONVERSIONS
	// -------------------------------------------------------------------------

	/**
	 * Converts this span to a {@link TsTzSpan} (date bounds become midnight UTC) and returns the raw WASM pointer.
	 * Use `new TsTzSpan(ptr)` to obtain a typed object.
	 */
	toTsTzSpan(): Ptr {
		return datespan_to_tstzspan(this._inner);
	}
}
