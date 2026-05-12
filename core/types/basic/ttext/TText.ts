import { Temporal } from '../../temporal/Temporal';
import type { Ptr, TimestampTz } from '../../../functions/functions.generated';
import {
	ttext_in,
	ttext_out,
	ttext_from_mfjson,
	ttext_from_base_temp,
	ttextseq_from_base_tstzset,
	ttextseq_from_base_tstzspan,
	ttextseqset_from_base_tstzspanset,
	ttext_start_value,
	ttext_end_value,
	ttext_min_value,
	ttext_max_value,
	ttext_value_n,
	ttext_upper,
	ttext_lower,
	ttext_initcap,
	ttext_at_value,
	ttext_minus_value,
	ever_eq_ttext_text,
	always_eq_ttext_text,
	ever_lt_ttext_text,
	always_lt_ttext_text,
	teq_ttext_text,
	tne_ttext_text,
	tlt_ttext_text,
	tle_ttext_text,
	tgt_ttext_text,
	tge_ttext_text,
	textcat_ttext_text,
	textcat_text_ttext,
	textcat_ttext_ttext,
	temporal_at_timestamptz,
	meos_free,
} from '../../../functions/functions.generated';

/**
 * Temporal text type.
 *
 * Wraps a MEOS TText pointer and exposes text-specific operations
 * on top of the generic Temporal API defined in Temporal.ts.
 *
 * Supports all three subtypes (Instant, Sequence, SequenceSet) through
 * the same class — the subtype is determined by the WKT string at parse time.
 *
 * Note: TText uses stepwise interpolation (text values cannot be interpolated).
 *
 * @example
 * ```ts
 * await initMeos();
 * const t = TText.fromString('[hello@2001-01-01, world@2001-01-02]');
 * console.log(t.startValue()); // hello
 * console.log(t.upper().startValue()); // HELLO
 * t.free();
 * ```
 */
export class TText extends Temporal<string> {
	// -------------------------------------------------------------------------
	// CONSTRUCTORS
	// -------------------------------------------------------------------------

	constructor(inner: Ptr) {
		super(inner);
	}

	/**
	 * Parse a TText from a WKT string.
	 * MEOS: ttext_in
	 */
	static fromString(wkt: string): TText {
		return new TText(ttext_in(wkt));
	}

	/**
	 * Parse a TText from a MF-JSON string.
	 * MEOS: ttext_from_mfjson
	 */
	static fromMFJSON(mfjson: string): TText {
		return new TText(ttext_from_mfjson(mfjson));
	}

	/**
	 * Create a TText with constant value `s` spanning the same domain as `domain`.
	 * MEOS: ttext_from_base_temp
	 */
	static fromBaseTemporal(s: string, domain: TText): TText {
		return new TText(ttext_from_base_temp(s, domain.inner));
	}

	/**
	 * Create a TText with constant value `s` over a time object.
	 * MEOS: ttextseq_from_base_tstzset / tstzspan / ttextseqset_from_base_tstzspanset
	 */
	static fromBaseTime(s: string, time: Ptr, type: 'tstzset' | 'tstzspan' | 'tstzspanset'): TText {
		switch (type) {
			case 'tstzset':     return new TText(ttextseq_from_base_tstzset(s, time));
			case 'tstzspan':    return new TText(ttextseq_from_base_tstzspan(s, time));
			case 'tstzspanset': return new TText(ttextseqset_from_base_tstzspanset(s, time));
		}
	}

	// -------------------------------------------------------------------------
	// ABSTRACT IMPLEMENTATION
	// -------------------------------------------------------------------------

	protected _fromInner(inner: Ptr): this {
		return new TText(inner) as this;
	}

	/** WKT string representation. MEOS: ttext_out */
	toString(): string {
		return ttext_out(this._inner);
	}

	/** Starting value. MEOS: ttext_start_value */
	startValue(): string {
		return ttext_start_value(this._inner);
	}

	/** Ending value. MEOS: ttext_end_value */
	endValue(): string {
		return ttext_end_value(this._inner);
	}

	// -------------------------------------------------------------------------
	// ACCESSORS
	// -------------------------------------------------------------------------

	/** Minimum value (lexicographic). MEOS: ttext_min_value */
	minValue(): string {
		return ttext_min_value(this._inner);
	}

	/** Maximum value (lexicographic). MEOS: ttext_max_value */
	maxValue(): string {
		return ttext_max_value(this._inner);
	}

	/**
	 * Returns the n-th distinct value (0-based index).
	 * MEOS: ttext_value_n
	 */
	valueN(n: number): string {
		return ttext_value_n(this._inner, n + 1);
	}

	/**
	 * Evaluates the temporal at a specific timestamp.
	 * Returns `null` when the timestamp is outside the temporal's domain.
	 * MEOS: temporal_at_timestamptz + ttext_start_value
	 */
	valueAtTimestamp(t: TimestampTz): string | null {
		const restricted = temporal_at_timestamptz(this._inner, t);
		if (restricted === 0) return null;
		const value = ttext_start_value(restricted);
		meos_free(restricted);
		return value;
	}

	// -------------------------------------------------------------------------
	// TEXT OPERATIONS
	// -------------------------------------------------------------------------

	/** Returns a new TText with all characters uppercased. MEOS: ttext_upper */
	upper(): TText {
		return new TText(ttext_upper(this._inner));
	}

	/** Returns a new TText with all characters lowercased. MEOS: ttext_lower */
	lower(): TText {
		return new TText(ttext_lower(this._inner));
	}

	/** Returns a new TText with initcap applied (first letter of each word uppercased). MEOS: ttext_initcap */
	initcap(): TText {
		return new TText(ttext_initcap(this._inner));
	}

	/**
	 * Concatenates `other` to this TText.
	 * MEOS: textcat_ttext_text / textcat_ttext_ttext
	 */
	concat(other: TText | string): TText {
		if (other instanceof TText)
			return new TText(textcat_ttext_ttext(this._inner, other._inner));
		return new TText(textcat_ttext_text(this._inner, other));
	}

	/**
	 * Prepends `prefix` before this TText.
	 * MEOS: textcat_text_ttext
	 */
	prepend(prefix: string): TText {
		return new TText(textcat_text_ttext(prefix, this._inner));
	}

	// -------------------------------------------------------------------------
	// RESTRICTIONS
	// -------------------------------------------------------------------------

	/**
	 * Restrict to instants where the value equals `s`.
	 * MEOS: ttext_at_value
	 */
	at(s: string): TText | null {
		const ptr = ttext_at_value(this._inner, s);
		return ptr === 0 ? null : new TText(ptr);
	}

	/**
	 * Restrict to instants where the value differs from `s`.
	 * MEOS: ttext_minus_value
	 */
	minus(s: string): TText | null {
		const ptr = ttext_minus_value(this._inner, s);
		return ptr === 0 ? null : new TText(ptr);
	}

	// -------------------------------------------------------------------------
	// EVER / ALWAYS COMPARISONS
	// -------------------------------------------------------------------------

	/** Returns true if the value is ever equal to `s`. MEOS: ever_eq_ttext_text */
	everEq(s: string): boolean { return ever_eq_ttext_text(this._inner, s) > 0; }

	/** Returns true if the value is always equal to `s`. MEOS: always_eq_ttext_text */
	alwaysEq(s: string): boolean { return always_eq_ttext_text(this._inner, s) > 0; }

	/** Returns true if the value is never equal to `s`. */
	neverEq(s: string): boolean { return !this.everEq(s); }

	/** Returns true if the value is ever less than `s`. MEOS: ever_lt_ttext_text */
	everLt(s: string): boolean { return ever_lt_ttext_text(this._inner, s) > 0; }

	/** Returns true if the value is always less than `s`. MEOS: always_lt_ttext_text */
	alwaysLt(s: string): boolean { return always_lt_ttext_text(this._inner, s) > 0; }

	// -------------------------------------------------------------------------
	// TEMPORAL COMPARISONS  (return TBool pointer — typed as Ptr to avoid circular import)
	// -------------------------------------------------------------------------

	/** Temporal equality: returns a TBool ptr that is true where this == s. MEOS: teq_ttext_text */
	temporalEq(s: string): Ptr { return teq_ttext_text(this._inner, s); }

	/** Temporal inequality. MEOS: tne_ttext_text */
	temporalNe(s: string): Ptr { return tne_ttext_text(this._inner, s); }

	/** Temporal less-than. MEOS: tlt_ttext_text */
	temporalLt(s: string): Ptr { return tlt_ttext_text(this._inner, s); }

	/** Temporal less-than-or-equal. MEOS: tle_ttext_text */
	temporalLe(s: string): Ptr { return tle_ttext_text(this._inner, s); }

	/** Temporal greater-than. MEOS: tgt_ttext_text */
	temporalGt(s: string): Ptr { return tgt_ttext_text(this._inner, s); }

	/** Temporal greater-than-or-equal. MEOS: tge_ttext_text */
	temporalGe(s: string): Ptr { return tge_ttext_text(this._inner, s); }
}
