import type { Ptr, TimestampTz } from '../../../functions/functions.generated';
import {
	tstzset_in,
	tstzset_out,
	set_from_hexwkb,
	tstzset_start_value,
	tstzset_end_value,
	tstzset_value_n,
	distance_tstzset_tstzset,
	tstzset_to_dateset,
	tstzset_shift_scale,
	tstzset_tprecision,
} from '../../../functions/functions.generated';
import { MeosSet } from '../base/MeosSet';

/**
 * An ordered set of distinct timestamps with timezone.
 *
 * Timestamps are represented as `TimestampTz` integers (microseconds since 2000-01-01 UTC).
 *
 * @example
 * ```ts
 * const s = TsTzSet.fromString('{2020-01-01, 2020-06-15, 2020-12-31}');
 * console.log(s.numValues());  // 3
 * console.log(s.startValue()); // microseconds since 2000-01-01 UTC
 * s.free();
 * ```
 */
export class TsTzSet extends MeosSet<TimestampTz> {
	protected _make(ptr: Ptr): this {
		return new TsTzSet(ptr) as this;
	}

	// -------------------------------------------------------------------------
	// CONSTRUCTORS
	// -------------------------------------------------------------------------

	/**
	 * Parses a `TsTzSet` from its WKT string representation.
	 * @param str WKT string, e.g. `"{2020-01-01, 2020-06-15, 2020-12-31}"`.
	 */
	static fromString(str: string): TsTzSet {
		return new TsTzSet(tstzset_in(str));
	}

	/**
	 * Deserialises a `TsTzSet` from a hex-encoded WKB string produced by {@link asHexWKB}.
	 * @param hexwkb Hex-encoded WKB string.
	 */
	static fromHexWKB(hexwkb: string): TsTzSet {
		return new TsTzSet(set_from_hexwkb(hexwkb));
	}

	// -------------------------------------------------------------------------
	// OUTPUT
	// -------------------------------------------------------------------------

	/** Returns the WKT string representation (e.g. `{2020-01-01 00:00:00+00, ...}`). */
	toString(): string {
		return tstzset_out(this._inner);
	}

	// -------------------------------------------------------------------------
	// ACCESSORS
	// -------------------------------------------------------------------------

	/** Returns the earliest timestamp in this set as microseconds since 2000-01-01 UTC. */
	startValue(): TimestampTz {
		return tstzset_start_value(this._inner);
	}

	/** Returns the latest timestamp in this set as microseconds since 2000-01-01 UTC. */
	endValue(): TimestampTz {
		return tstzset_end_value(this._inner);
	}

	/**
	 * Returns the n-th timestamp (0-based index) as microseconds since 2000-01-01 UTC.
	 * @param n 0-based index (MEOS internally uses 1-based indexing).
	 */
	valueN(n: number): TimestampTz {
		return tstzset_value_n(this._inner, n + 1);
	}

	// -------------------------------------------------------------------------
	// DISTANCE
	// -------------------------------------------------------------------------

	/**
	 * Returns the distance (gap) between `this` and `other` in microseconds.
	 * Returns `0` if they share at least one timestamp.
	 */
	distance(other: TsTzSet): number {
		return distance_tstzset_tstzset(this._inner, other.inner);
	}

	// -------------------------------------------------------------------------
	// CONVERSIONS
	// -------------------------------------------------------------------------

	/**
	 * Truncates each timestamp to midnight UTC and returns the raw WASM pointer.
	 * Use `new DateSet(ptr)` to obtain a typed object.
	 */
	toDateSet(): Ptr {
		return tstzset_to_dateset(this._inner);
	}

	// -------------------------------------------------------------------------
	// TRANSFORMATIONS
	// -------------------------------------------------------------------------

	/**
	 * Returns a new set shifted and/or scaled along the time axis.
	 * @param shift    Raw WASM pointer to a MEOS interval for the shift amount (`0` to skip).
	 * @param duration Raw WASM pointer to a MEOS interval for the new duration (`0` to skip).
	 */
	shiftScale(shift: Ptr, duration: Ptr): TsTzSet {
		return new TsTzSet(tstzset_shift_scale(this._inner, shift, duration));
	}

	/**
	 * Returns a new set with each timestamp snapped to the nearest multiple of `duration` from `origin`.
	 * @param duration Raw WASM pointer to a MEOS interval defining the bucket size.
	 * @param origin  Reference timestamp in microseconds since 2000-01-01 UTC.
	 */
	tprecision(duration: Ptr, origin: TimestampTz): TsTzSet {
		return new TsTzSet(tstzset_tprecision(this._inner, duration, origin));
	}
}
