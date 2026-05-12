import type { Ptr } from '../../../functions/functions.generated';
import {
	textset_in,
	textset_out,
	set_from_hexwkb,
	textset_start_value,
	textset_end_value,
	textset_value_n,
	textset_lower,
	textset_upper,
	textset_initcap,
} from '../../../functions/functions.generated';
import { MeosSet } from '../base/MeosSet';

/**
 * An ordered set of distinct text strings.
 *
 * @example
 * ```ts
 * const s = TextSet.fromString('{"apple", "banana", "cherry"}');
 * console.log(s.numValues()); // 3
 * console.log(s.startValue()); // 'apple'
 * console.log(s.endValue());   // 'cherry'
 * s.free();
 * ```
 */
export class TextSet extends MeosSet<string> {
	protected _make(ptr: Ptr): this {
		return new TextSet(ptr) as this;
	}

	// -------------------------------------------------------------------------
	// CONSTRUCTORS
	// -------------------------------------------------------------------------

	/**
	 * Parses a `TextSet` from its WKT string representation.
	 * @param str WKT string, e.g. `'{"apple", "banana"}'`.
	 */
	static fromString(str: string): TextSet {
		return new TextSet(textset_in(str));
	}

	/**
	 * Deserialises a `TextSet` from a hex-encoded WKB string produced by {@link asHexWKB}.
	 * @param hexwkb Hex-encoded WKB string.
	 */
	static fromHexWKB(hexwkb: string): TextSet {
		return new TextSet(set_from_hexwkb(hexwkb));
	}

	// -------------------------------------------------------------------------
	// OUTPUT
	// -------------------------------------------------------------------------

	/** Returns the WKT string representation (e.g. `{"apple", "banana"}`). */
	toString(): string {
		return textset_out(this._inner);
	}

	// -------------------------------------------------------------------------
	// ACCESSORS
	// -------------------------------------------------------------------------

	/** Returns the lexicographically smallest (first) string in this set. */
	startValue(): string {
		return textset_start_value(this._inner);
	}

	/** Returns the lexicographically largest (last) string in this set. */
	endValue(): string {
		return textset_end_value(this._inner);
	}

	/**
	 * Returns the n-th string (0-based index).
	 * @param n 0-based index (MEOS internally uses 1-based indexing).
	 */
	valueN(n: number): string | null {
		const r = textset_value_n(this._inner, n + 1);
		// ccall maps NULL char* to '' — treat empty result as out-of-range
		return r === '' ? null : r;
	}

	// -------------------------------------------------------------------------
	// TEXT OPERATIONS
	// -------------------------------------------------------------------------

	/** Returns a new `TextSet` with all strings lowercased. */
	lower(): TextSet {
		return new TextSet(textset_lower(this._inner));
	}

	/** Returns a new `TextSet` with all strings uppercased. */
	upper(): TextSet {
		return new TextSet(textset_upper(this._inner));
	}

	/** Returns a new `TextSet` with initcap applied to all strings. */
	initcap(): TextSet {
		return new TextSet(textset_initcap(this._inner));
	}
}
