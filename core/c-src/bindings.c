/* AUTO-GENERATED - DO NOT EDIT. Run: npm run generate */

#include <stdlib.h>
#include <postgres.h>
#include <utils/timestamp.h>
#include <meos.h>
#include <meos_geo.h>
#include <emscripten.h>

/*
 * Implementations of Int64GetDatum and Float8GetDatum required when
 * USE_FLOAT8_BYVAL is disabled (by-reference mode for 64-bit types).
 */
#ifndef USE_FLOAT8_BYVAL
Datum Int64GetDatum(int64 X) {
    int64 *ptr = (int64 *) malloc(sizeof(int64));
    *ptr = X;
    return PointerGetDatum(ptr);
}

Datum Float8GetDatum(float8 X) {
    float8 *ptr = (float8 *) malloc(sizeof(float8));
    *ptr = X;
    return PointerGetDatum(ptr);
}
#endif

/* --- Error handler --- */
/*
 * A static C error handler stores the last errlevel/errcode/errmsg produced
 * by any MEOS call.  JS reads these globals via meos_err_* accessors after
 * every generated wrapper call and throws a MeosError if errcode != 0.
 * This mirrors the MeosErrorHandler.checkError() pattern in JMEOS.
 */
static int  _meos_last_errcode  = 0;
static int  _meos_last_errlevel = 0;
static char _meos_last_errmsg[512] = {0};

static void _meos_error_handler(int errlevel, int errcode, const char *errmsg) {
    _meos_last_errcode  = errcode;
    _meos_last_errlevel = errlevel;
    if (errmsg)
        strncpy(_meos_last_errmsg, errmsg, sizeof(_meos_last_errmsg) - 1);
    else
        _meos_last_errmsg[0] = '\0';
}

EMSCRIPTEN_KEEPALIVE int         meos_err_code()  { return _meos_last_errcode; }
EMSCRIPTEN_KEEPALIVE int         meos_err_level() { return _meos_last_errlevel; }
EMSCRIPTEN_KEEPALIVE const char *meos_err_msg()   { return _meos_last_errmsg; }
EMSCRIPTEN_KEEPALIVE void        meos_err_clear() {
    _meos_last_errcode  = 0;
    _meos_last_errlevel = 0;
    _meos_last_errmsg[0] = '\0';
}

/* --- Init --- */
EMSCRIPTEN_KEEPALIVE
void meos_init_lib() {
    meos_initialize();
    meos_initialize_timezone("UTC");
    meos_initialize_error_handler(_meos_error_handler);
}

EMSCRIPTEN_KEEPALIVE
const char *meos_ping() { return "pong"; }

/* --- Memory helpers --- */
EMSCRIPTEN_KEEPALIVE
void meos_free(void *ptr) { free(ptr); }

/* --- Hand-written wrappers (special logic) --- */

/*
 * temporal_as_hexwkb: collapses variant + size_out.
 * variant -1 (0xFF) = WKB_EXTENDED, native endian.
 */
EMSCRIPTEN_KEEPALIVE
char *temporal_as_hexwkb_w(Temporal *temp) {
    size_t sz;
    return temporal_as_hexwkb(temp, (uint8) -1, &sz);
}

/* temporal_as_mfjson: srs "" is treated as NULL. */
EMSCRIPTEN_KEEPALIVE
char *temporal_as_mfjson_w(Temporal *temp, int with_bbox, int flags,
                            int precision, const char *srs) {
  return temporal_as_mfjson(temp, (bool) with_bbox, flags, precision,
                             (srs && srs[0]) ? srs : NULL);
}

/* n is 0-based from JS; MEOS expects 1-based. */
EMSCRIPTEN_KEEPALIVE
Temporal *temporal_instant_n_w(Temporal *temp, int n) {
  return (Temporal *) temporal_instant_n(temp, n + 1);
}

/*
 * temporal_duration returns a PostgreSQL Interval*.
 * Converted to total microseconds so JS receives a plain number.
 * Month approximated as 30 days (same as JMEOS).
 */
EMSCRIPTEN_KEEPALIVE
double temporal_duration_us_w(Temporal *temp, int ignore_gaps) {
  Interval *iv = temporal_duration(temp, (bool) ignore_gaps);
  if (!iv) return 0.0;
  double us = (double) iv->time
            + (double) iv->day   * 86400000000.0
            + (double) iv->month * 30.0 * 86400000000.0;
  free(iv);
  return us;
}

/* span_as_hexwkb: allocates size_out on the stack (caller does not need it). */
EMSCRIPTEN_KEEPALIVE
char * span_as_hexwkb_w(const Span * s, uint8_t variant) {
  size_t sz;
  return span_as_hexwkb(s, variant, &sz);
}

/*
 * tstzspan_lower / tstzspan_upper - WASM32 Datum workaround.
 *
 * In WASM32 builds without USE_FLOAT8_BYVAL, TimestampTz (int64) is stored
 * in Datum as a malloc'd pointer (Datum = uintptr_t = 32 bits, too small
 * for int64).  The public tstzspan_lower() calls TimestampTzGetDatum(s->lower)
 * which in turn calls Int64GetDatum on an already-Datum value, producing a
 * double-wrapped pointer.
 *
 * We bypass the public API and directly dereference s->lower (the Datum
 * storing the pointer to the int64 timestamp) using DatumGetTimestampTz.
 * The Span struct fields lower/upper are declared in the public meos.h.
 */
EMSCRIPTEN_KEEPALIVE
long long tstzspan_lower_w(const Span * s) {
  return (long long) DatumGetTimestampTz(s->lower);
}

EMSCRIPTEN_KEEPALIVE
long long tstzspan_upper_w(const Span * s) {
  return (long long) DatumGetTimestampTz(s->upper);
}

/*
 * span_eq / span_ne - WASM32 Datum workaround.
 *
 * span_eq() compares s1->lower != s2->lower directly (Datum equality).
 * In WASM32 this is a pointer comparison; two spans with identical timestamps
 * but separately allocated will always be unequal.  span_cmp() correctly
 * dereferences the Datum via datum_cmp(), so we delegate to it.
 */
EMSCRIPTEN_KEEPALIVE
int span_eq_w(const Span * s1, const Span * s2) {
  return (span_cmp(s1, s2) == 0) ? 1 : 0;
}

EMSCRIPTEN_KEEPALIVE
int span_ne_w(const Span * s1, const Span * s2) {
  return (span_cmp(s1, s2) != 0) ? 1 : 0;
}

/*
 * adjacent_span_span - WASM32 Datum workaround.
 *
 * The MEOS implementation uses datum_eq() which for T_TIMESTAMPTZ does
 * `l == r` (Datum pointer equality).  In WASM32 that is always false for
 * separately created spans even if the timestamps are identical.
 *
 * We replicate the adjacency logic by directly dereferencing the Datum
 * fields of the Span structs (accessible via the public meos.h declaration).
 */
EMSCRIPTEN_KEEPALIVE
int adjacent_span_span_w(const Span * s1, const Span * s2) {
  long long s1_upper = (long long) DatumGetTimestampTz(s1->upper);
  long long s2_lower = (long long) DatumGetTimestampTz(s2->lower);
  long long s2_upper = (long long) DatumGetTimestampTz(s2->upper);
  long long s1_lower = (long long) DatumGetTimestampTz(s1->lower);

  return (
    (s1_upper == s2_lower && s1->upper_inc != s2->lower_inc) ||
    (s2_upper == s1_lower && s2->upper_inc != s1->lower_inc)
  ) ? 1 : 0;
}

EMSCRIPTEN_KEEPALIVE
int meos_pointer_size() { return (int) sizeof(void *); }

/*
 * tstzspanset_lower / tstzspanset_upper — Datum workaround (same as tstzspan).
 * ss->elems[i].lower/upper are Datums storing pointers to int64 timestamps.
 * We dereference directly via DatumGetTimestampTz to get the actual int64.
 */
EMSCRIPTEN_KEEPALIVE
long long tstzspanset_lower_w(const SpanSet *ss) {
    return (long long) DatumGetTimestampTz(ss->elems[0].lower);
}

EMSCRIPTEN_KEEPALIVE
long long tstzspanset_upper_w(const SpanSet *ss) {
    return (long long) DatumGetTimestampTz(ss->elems[ss->count - 1].upper);
}

/* spanset_as_hexwkb: collapses size_out. */
EMSCRIPTEN_KEEPALIVE
char *spanset_as_hexwkb_w(const SpanSet *ss, uint8_t variant) {
    size_t sz;
    return spanset_as_hexwkb(ss, variant, &sz);
}

/*
 * tstzspanset_duration_us: converts the Interval* returned by
 * tstzspanset_duration to total microseconds (same formula as temporal_duration_us_w).
 * boundSpan=false -> sum of span durations (gaps ignored).
 * boundSpan=true  -> duration of the bounding span (gaps included).
 */
EMSCRIPTEN_KEEPALIVE
double tstzspanset_duration_us_w(const SpanSet *ss, int bound_span) {
    Interval *iv = tstzspanset_duration(ss, (bool) bound_span);
    if (!iv) return 0.0;
    double us = (double) iv->time
              + (double) iv->day   * 86400000000.0
              + (double) iv->month * 30.0 * 86400000000.0;
    free(iv);
    return us;
}

/*
 * tstzspanset_timestamptz_n — bool+result with int64.
 * The auto-generator would use 'number' for the ccall return type, truncating
 * the 64-bit timestamp. We return long long and expose it as 'bigint' in JS.
 * n is 1-based (MEOS convention); the TypeScript class converts from 0-based.
 */
EMSCRIPTEN_KEEPALIVE
long long tstzspanset_timestamptz_n_w(const SpanSet *ss, int n) {
    TimestampTz r;
    if (!tstzspanset_timestamptz_n(ss, n, &r)) return 0;
    return (long long) r;
}

/* set_as_hexwkb_w: collapses size_out (int * in set_as_hexwkb signature). */
EMSCRIPTEN_KEEPALIVE
char *set_as_hexwkb_w(const Set *s, uint8_t variant) {
    int sz;
    return set_as_hexwkb(s, variant, &sz);
}

/*
 * tstzset_start_value / tstzset_end_value — return TimestampTz (int64).
 * The auto-generator would use 'number' (truncates 64-bit). We use long long
 * so the JS side can use 'bigint'.
 */
EMSCRIPTEN_KEEPALIVE
long long tstzset_start_value_w(const Set *s) {
    return (long long) tstzset_start_value(s);
}

EMSCRIPTEN_KEEPALIVE
long long tstzset_end_value_w(const Set *s) {
    return (long long) tstzset_end_value(s);
}

/*
 * tstzset_value_n — bool+result with TimestampTz*.
 * Returns 0 if n is out of range; JS callers must bounds-check.
 * n is 1-based (MEOS convention); the TypeScript class converts from 0-based.
 */
EMSCRIPTEN_KEEPALIVE
long long tstzset_value_n_w(const Set *s, int n) {
    TimestampTz r;
    if (!tstzset_value_n(s, n, &r)) return 0;
    return (long long) r;
}

/* --- Generated wrappers --- */
/* === meos.h === */

EMSCRIPTEN_KEEPALIVE
RTree * rtree_create_intspan_w() {
  return rtree_create_intspan();
}

EMSCRIPTEN_KEEPALIVE
RTree * rtree_create_bigintspan_w() {
  return rtree_create_bigintspan();
}

EMSCRIPTEN_KEEPALIVE
RTree * rtree_create_floatspan_w() {
  return rtree_create_floatspan();
}

EMSCRIPTEN_KEEPALIVE
RTree * rtree_create_datespan_w() {
  return rtree_create_datespan();
}

EMSCRIPTEN_KEEPALIVE
RTree * rtree_create_tstzspan_w() {
  return rtree_create_tstzspan();
}

EMSCRIPTEN_KEEPALIVE
RTree * rtree_create_tbox_w() {
  return rtree_create_tbox();
}

EMSCRIPTEN_KEEPALIVE
RTree * rtree_create_stbox_w() {
  return rtree_create_stbox();
}

EMSCRIPTEN_KEEPALIVE
void rtree_free_w(RTree * rtree) {
  rtree_free(rtree);
}

EMSCRIPTEN_KEEPALIVE
void rtree_insert_w(RTree * rtree, void * box, int id) {
  rtree_insert(rtree, box, id);
}

EMSCRIPTEN_KEEPALIVE
void rtree_insert_temporal_w(RTree * rtree, const Temporal * temp, int id) {
  rtree_insert_temporal(rtree, temp, id);
}

EMSCRIPTEN_KEEPALIVE
int * rtree_search_w(const RTree * rtree, RTreeSearchOp op, const void * query, int * count) {
  return rtree_search(rtree, op, query, count);
}

EMSCRIPTEN_KEEPALIVE
int * rtree_search_temporal_w(const RTree * rtree, RTreeSearchOp op, const Temporal * temp, int * count) {
  return rtree_search_temporal(rtree, op, temp, count);
}

EMSCRIPTEN_KEEPALIVE
int meos_errno_w() {
  return meos_errno();
}

EMSCRIPTEN_KEEPALIVE
int meos_errno_set_w(int err) {
  return meos_errno_set(err);
}

EMSCRIPTEN_KEEPALIVE
int meos_errno_restore_w(int err) {
  return meos_errno_restore(err);
}

EMSCRIPTEN_KEEPALIVE
int meos_errno_reset_w() {
  return meos_errno_reset();
}

EMSCRIPTEN_KEEPALIVE
int meos_set_datestyle_w(const char * newval, void * extra) {
  return (int) meos_set_datestyle(newval, extra);
}

EMSCRIPTEN_KEEPALIVE
int meos_set_intervalstyle_w(const char * newval, int extra) {
  return (int) meos_set_intervalstyle(newval, extra);
}

EMSCRIPTEN_KEEPALIVE
char * meos_get_datestyle_w() {
  return meos_get_datestyle();
}

EMSCRIPTEN_KEEPALIVE
char * meos_get_intervalstyle_w() {
  return meos_get_intervalstyle();
}

EMSCRIPTEN_KEEPALIVE
void meos_set_spatial_ref_sys_csv_w(const char * path) {
  meos_set_spatial_ref_sys_csv(path);
}

EMSCRIPTEN_KEEPALIVE
DateADT add_date_int_w(DateADT d, int32 days) {
  return add_date_int(d, days);
}

EMSCRIPTEN_KEEPALIVE
Interval * add_interval_interval_w(const Interval * interv1, const Interval * interv2) {
  return add_interval_interval(interv1, interv2);
}

EMSCRIPTEN_KEEPALIVE
long long add_timestamptz_interval_w(long long t, const Interval * interv) {
  return add_timestamptz_interval((TimestampTz) t, interv);
}

EMSCRIPTEN_KEEPALIVE
int bool_in_w(const char * str) {
  return (int) bool_in(str);
}

EMSCRIPTEN_KEEPALIVE
char * bool_out_w(int b) {
  return bool_out((bool) b);
}

EMSCRIPTEN_KEEPALIVE
long long date_to_timestamp_w(DateADT dateVal) {
  return date_to_timestamp(dateVal);
}

EMSCRIPTEN_KEEPALIVE
long long date_to_timestamptz_w(DateADT d) {
  return date_to_timestamptz(d);
}

EMSCRIPTEN_KEEPALIVE
double float_exp_w(double d) {
  return float_exp(d);
}

EMSCRIPTEN_KEEPALIVE
double float_ln_w(double d) {
  return float_ln(d);
}

EMSCRIPTEN_KEEPALIVE
double float_log10_w(double d) {
  return float_log10(d);
}

EMSCRIPTEN_KEEPALIVE
char * float8_out_w(double d, int maxdd) {
  return float8_out(d, maxdd);
}

EMSCRIPTEN_KEEPALIVE
double float_round_w(double d, int maxdd) {
  return float_round(d, maxdd);
}

EMSCRIPTEN_KEEPALIVE
int int32_cmp_w(int32 l, int32 r) {
  return int32_cmp(l, r);
}

EMSCRIPTEN_KEEPALIVE
int int64_cmp_w(int64 l, int64 r) {
  return int64_cmp(l, r);
}

EMSCRIPTEN_KEEPALIVE
Interval * interval_make_w(int32 years, int32 months, int32 weeks, int32 days, int32 hours, int32 mins, double secs) {
  return interval_make(years, months, weeks, days, hours, mins, secs);
}

EMSCRIPTEN_KEEPALIVE
int minus_date_date_w(DateADT d1, DateADT d2) {
  return minus_date_date(d1, d2);
}

EMSCRIPTEN_KEEPALIVE
DateADT minus_date_int_w(DateADT d, int32 days) {
  return minus_date_int(d, days);
}

EMSCRIPTEN_KEEPALIVE
long long minus_timestamptz_interval_w(long long t, const Interval * interv) {
  return minus_timestamptz_interval((TimestampTz) t, interv);
}

EMSCRIPTEN_KEEPALIVE
Interval * minus_timestamptz_timestamptz_w(long long t1, long long t2) {
  return minus_timestamptz_timestamptz((TimestampTz) t1, (TimestampTz) t2);
}

EMSCRIPTEN_KEEPALIVE
Interval * mul_interval_double_w(const Interval * interv, double factor) {
  return mul_interval_double(interv, factor);
}

EMSCRIPTEN_KEEPALIVE
DateADT pg_date_in_w(const char * str) {
  return pg_date_in(str);
}

EMSCRIPTEN_KEEPALIVE
char * pg_date_out_w(DateADT d) {
  return pg_date_out(d);
}

EMSCRIPTEN_KEEPALIVE
int pg_interval_cmp_w(const Interval * interv1, const Interval * interv2) {
  return pg_interval_cmp(interv1, interv2);
}

EMSCRIPTEN_KEEPALIVE
Interval * pg_interval_in_w(const char * str, int32 typmod) {
  return pg_interval_in(str, typmod);
}

EMSCRIPTEN_KEEPALIVE
char * pg_interval_out_w(const Interval * interv) {
  return pg_interval_out(interv);
}

EMSCRIPTEN_KEEPALIVE
long long pg_timestamp_in_w(const char * str, int32 typmod) {
  return pg_timestamp_in(str, typmod);
}

EMSCRIPTEN_KEEPALIVE
char * pg_timestamp_out_w(long long t) {
  return pg_timestamp_out((Timestamp) t);
}

EMSCRIPTEN_KEEPALIVE
long long pg_timestamptz_in_w(const char * str, int32 typmod) {
  return pg_timestamptz_in(str, typmod);
}

EMSCRIPTEN_KEEPALIVE
char * pg_timestamptz_out_w(long long t) {
  return pg_timestamptz_out((TimestampTz) t);
}

EMSCRIPTEN_KEEPALIVE
int text_cmp_w(const char * txt1, const char * txt2) {
  return text_cmp(cstring2text(txt1), cstring2text(txt2));
}

EMSCRIPTEN_KEEPALIVE
char * text_copy_w(const char * txt) {
  text *_t = text_copy(cstring2text(txt));
  if (!_t) return NULL;
  return text2cstring(_t);
}

EMSCRIPTEN_KEEPALIVE
char * text_in_w(const char * str) {
  text *_t = text_in(str);
  if (!_t) return NULL;
  return text2cstring(_t);
}

EMSCRIPTEN_KEEPALIVE
char * text_initcap_w(const char * txt) {
  text *_t = text_initcap(cstring2text(txt));
  if (!_t) return NULL;
  return text2cstring(_t);
}

EMSCRIPTEN_KEEPALIVE
char * text_lower_w(const char * txt) {
  text *_t = text_lower(cstring2text(txt));
  if (!_t) return NULL;
  return text2cstring(_t);
}

EMSCRIPTEN_KEEPALIVE
char * text_out_w(const char * txt) {
  return text_out(cstring2text(txt));
}

EMSCRIPTEN_KEEPALIVE
char * text_upper_w(const char * txt) {
  text *_t = text_upper(cstring2text(txt));
  if (!_t) return NULL;
  return text2cstring(_t);
}

EMSCRIPTEN_KEEPALIVE
char * textcat_text_text_w(const char * txt1, const char * txt2) {
  text *_t = textcat_text_text(cstring2text(txt1), cstring2text(txt2));
  if (!_t) return NULL;
  return text2cstring(_t);
}

EMSCRIPTEN_KEEPALIVE
long long timestamptz_shift_w(long long t, const Interval * interv) {
  return timestamptz_shift((TimestampTz) t, interv);
}

EMSCRIPTEN_KEEPALIVE
DateADT timestamp_to_date_w(long long t) {
  return timestamp_to_date((Timestamp) t);
}

EMSCRIPTEN_KEEPALIVE
DateADT timestamptz_to_date_w(long long t) {
  return timestamptz_to_date((TimestampTz) t);
}

EMSCRIPTEN_KEEPALIVE
Set * bigintset_in_w(const char * str) {
  return bigintset_in(str);
}

EMSCRIPTEN_KEEPALIVE
char * bigintset_out_w(const Set * set) {
  return bigintset_out(set);
}

EMSCRIPTEN_KEEPALIVE
Span * bigintspan_expand_w(const Span * s, int64 value) {
  return bigintspan_expand(s, value);
}

EMSCRIPTEN_KEEPALIVE
Span * bigintspan_in_w(const char * str) {
  return bigintspan_in(str);
}

EMSCRIPTEN_KEEPALIVE
char * bigintspan_out_w(const Span * s) {
  return bigintspan_out(s);
}

EMSCRIPTEN_KEEPALIVE
SpanSet * bigintspanset_in_w(const char * str) {
  return bigintspanset_in(str);
}

EMSCRIPTEN_KEEPALIVE
char * bigintspanset_out_w(const SpanSet * ss) {
  return bigintspanset_out(ss);
}

EMSCRIPTEN_KEEPALIVE
Set * dateset_in_w(const char * str) {
  return dateset_in(str);
}

EMSCRIPTEN_KEEPALIVE
char * dateset_out_w(const Set * s) {
  return dateset_out(s);
}

EMSCRIPTEN_KEEPALIVE
Span * datespan_in_w(const char * str) {
  return datespan_in(str);
}

EMSCRIPTEN_KEEPALIVE
char * datespan_out_w(const Span * s) {
  return datespan_out(s);
}

EMSCRIPTEN_KEEPALIVE
SpanSet * datespanset_in_w(const char * str) {
  return datespanset_in(str);
}

EMSCRIPTEN_KEEPALIVE
char * datespanset_out_w(const SpanSet * ss) {
  return datespanset_out(ss);
}

EMSCRIPTEN_KEEPALIVE
Set * floatset_in_w(const char * str) {
  return floatset_in(str);
}

EMSCRIPTEN_KEEPALIVE
char * floatset_out_w(const Set * set, int maxdd) {
  return floatset_out(set, maxdd);
}

EMSCRIPTEN_KEEPALIVE
Span * floatspan_expand_w(const Span * s, double value) {
  return floatspan_expand(s, value);
}

EMSCRIPTEN_KEEPALIVE
Span * floatspan_in_w(const char * str) {
  return floatspan_in(str);
}

EMSCRIPTEN_KEEPALIVE
char * floatspan_out_w(const Span * s, int maxdd) {
  return floatspan_out(s, maxdd);
}

EMSCRIPTEN_KEEPALIVE
SpanSet * floatspanset_in_w(const char * str) {
  return floatspanset_in(str);
}

EMSCRIPTEN_KEEPALIVE
char * floatspanset_out_w(const SpanSet * ss, int maxdd) {
  return floatspanset_out(ss, maxdd);
}

EMSCRIPTEN_KEEPALIVE
Set * intset_in_w(const char * str) {
  return intset_in(str);
}

EMSCRIPTEN_KEEPALIVE
char * intset_out_w(const Set * set) {
  return intset_out(set);
}

EMSCRIPTEN_KEEPALIVE
Span * intspan_expand_w(const Span * s, int32 value) {
  return intspan_expand(s, value);
}

EMSCRIPTEN_KEEPALIVE
Span * intspan_in_w(const char * str) {
  return intspan_in(str);
}

EMSCRIPTEN_KEEPALIVE
char * intspan_out_w(const Span * s) {
  return intspan_out(s);
}

EMSCRIPTEN_KEEPALIVE
SpanSet * intspanset_in_w(const char * str) {
  return intspanset_in(str);
}

EMSCRIPTEN_KEEPALIVE
char * intspanset_out_w(const SpanSet * ss) {
  return intspanset_out(ss);
}

EMSCRIPTEN_KEEPALIVE
uint8_t * set_as_wkb_w(const Set * s, uint8_t variant, int * size_out) {
  return set_as_wkb(s, variant, size_out);
}

EMSCRIPTEN_KEEPALIVE
Set * set_from_hexwkb_w(const char * hexwkb) {
  return set_from_hexwkb(hexwkb);
}

EMSCRIPTEN_KEEPALIVE
Set * set_from_wkb_w(const uint8_t * wkb, int size) {
  return set_from_wkb(wkb, size);
}

EMSCRIPTEN_KEEPALIVE
uint8_t * span_as_wkb_w(const Span * s, uint8_t variant, int * size_out) {
  return span_as_wkb(s, variant, size_out);
}

EMSCRIPTEN_KEEPALIVE
Span * span_from_hexwkb_w(const char * hexwkb) {
  return span_from_hexwkb(hexwkb);
}

EMSCRIPTEN_KEEPALIVE
Span * span_from_wkb_w(const uint8_t * wkb, int size) {
  return span_from_wkb(wkb, size);
}

EMSCRIPTEN_KEEPALIVE
uint8_t * spanset_as_wkb_w(const SpanSet * ss, uint8_t variant, int * size_out) {
  return spanset_as_wkb(ss, variant, size_out);
}

EMSCRIPTEN_KEEPALIVE
SpanSet * spanset_from_hexwkb_w(const char * hexwkb) {
  return spanset_from_hexwkb(hexwkb);
}

EMSCRIPTEN_KEEPALIVE
SpanSet * spanset_from_wkb_w(const uint8_t * wkb, int size) {
  return spanset_from_wkb(wkb, size);
}

EMSCRIPTEN_KEEPALIVE
Set * textset_in_w(const char * str) {
  return textset_in(str);
}

EMSCRIPTEN_KEEPALIVE
char * textset_out_w(const Set * set) {
  return textset_out(set);
}

EMSCRIPTEN_KEEPALIVE
Set * tstzset_in_w(const char * str) {
  return tstzset_in(str);
}

EMSCRIPTEN_KEEPALIVE
char * tstzset_out_w(const Set * set) {
  return tstzset_out(set);
}

EMSCRIPTEN_KEEPALIVE
Span * tstzspan_in_w(const char * str) {
  return tstzspan_in(str);
}

EMSCRIPTEN_KEEPALIVE
char * tstzspan_out_w(const Span * s) {
  return tstzspan_out(s);
}

EMSCRIPTEN_KEEPALIVE
SpanSet * tstzspanset_in_w(const char * str) {
  return tstzspanset_in(str);
}

EMSCRIPTEN_KEEPALIVE
char * tstzspanset_out_w(const SpanSet * ss) {
  return tstzspanset_out(ss);
}

EMSCRIPTEN_KEEPALIVE
Set * bigintset_make_w(const int64 * values, int count) {
  return bigintset_make(values, count);
}

EMSCRIPTEN_KEEPALIVE
Span * bigintspan_make_w(int64 lower, int64 upper, int lower_inc, int upper_inc) {
  return bigintspan_make(lower, upper, (bool) lower_inc, (bool) upper_inc);
}

EMSCRIPTEN_KEEPALIVE
Set * dateset_make_w(const DateADT * values, int count) {
  return dateset_make(values, count);
}

EMSCRIPTEN_KEEPALIVE
Span * datespan_make_w(DateADT lower, DateADT upper, int lower_inc, int upper_inc) {
  return datespan_make(lower, upper, (bool) lower_inc, (bool) upper_inc);
}

EMSCRIPTEN_KEEPALIVE
Set * floatset_make_w(const double * values, int count) {
  return floatset_make(values, count);
}

EMSCRIPTEN_KEEPALIVE
Span * floatspan_make_w(double lower, double upper, int lower_inc, int upper_inc) {
  return floatspan_make(lower, upper, (bool) lower_inc, (bool) upper_inc);
}

EMSCRIPTEN_KEEPALIVE
Set * intset_make_w(const int * values, int count) {
  return intset_make(values, count);
}

EMSCRIPTEN_KEEPALIVE
Span * intspan_make_w(int lower, int upper, int lower_inc, int upper_inc) {
  return intspan_make(lower, upper, (bool) lower_inc, (bool) upper_inc);
}

EMSCRIPTEN_KEEPALIVE
Set * set_copy_w(const Set * s) {
  return set_copy(s);
}

EMSCRIPTEN_KEEPALIVE
Span * span_copy_w(const Span * s) {
  return span_copy(s);
}

EMSCRIPTEN_KEEPALIVE
SpanSet * spanset_copy_w(const SpanSet * ss) {
  return spanset_copy(ss);
}

EMSCRIPTEN_KEEPALIVE
SpanSet * spanset_make_w(Span * spans, int count) {
  return spanset_make(spans, count);
}

EMSCRIPTEN_KEEPALIVE
Set * textset_make_w(text ** values, int count) {
  return textset_make(values, count);
}

EMSCRIPTEN_KEEPALIVE
Set * tstzset_make_w(const TimestampTz * values, int count) {
  return tstzset_make(values, count);
}

EMSCRIPTEN_KEEPALIVE
Span * tstzspan_make_w(long long lower, long long upper, int lower_inc, int upper_inc) {
  return tstzspan_make((TimestampTz) lower, (TimestampTz) upper, (bool) lower_inc, (bool) upper_inc);
}

EMSCRIPTEN_KEEPALIVE
Set * bigint_to_set_w(int64 i) {
  return bigint_to_set(i);
}

EMSCRIPTEN_KEEPALIVE
Span * bigint_to_span_w(int i) {
  return bigint_to_span(i);
}

EMSCRIPTEN_KEEPALIVE
SpanSet * bigint_to_spanset_w(int i) {
  return bigint_to_spanset(i);
}

EMSCRIPTEN_KEEPALIVE
Set * date_to_set_w(DateADT d) {
  return date_to_set(d);
}

EMSCRIPTEN_KEEPALIVE
Span * date_to_span_w(DateADT d) {
  return date_to_span(d);
}

EMSCRIPTEN_KEEPALIVE
SpanSet * date_to_spanset_w(DateADT d) {
  return date_to_spanset(d);
}

EMSCRIPTEN_KEEPALIVE
Set * dateset_to_tstzset_w(const Set * s) {
  return dateset_to_tstzset(s);
}

EMSCRIPTEN_KEEPALIVE
Span * datespan_to_tstzspan_w(const Span * s) {
  return datespan_to_tstzspan(s);
}

EMSCRIPTEN_KEEPALIVE
SpanSet * datespanset_to_tstzspanset_w(const SpanSet * ss) {
  return datespanset_to_tstzspanset(ss);
}

EMSCRIPTEN_KEEPALIVE
Set * float_to_set_w(double d) {
  return float_to_set(d);
}

EMSCRIPTEN_KEEPALIVE
Span * float_to_span_w(double d) {
  return float_to_span(d);
}

EMSCRIPTEN_KEEPALIVE
SpanSet * float_to_spanset_w(double d) {
  return float_to_spanset(d);
}

EMSCRIPTEN_KEEPALIVE
Set * floatset_to_intset_w(const Set * s) {
  return floatset_to_intset(s);
}

EMSCRIPTEN_KEEPALIVE
Span * floatspan_to_intspan_w(const Span * s) {
  return floatspan_to_intspan(s);
}

EMSCRIPTEN_KEEPALIVE
SpanSet * floatspanset_to_intspanset_w(const SpanSet * ss) {
  return floatspanset_to_intspanset(ss);
}

EMSCRIPTEN_KEEPALIVE
Set * int_to_set_w(int i) {
  return int_to_set(i);
}

EMSCRIPTEN_KEEPALIVE
Span * int_to_span_w(int i) {
  return int_to_span(i);
}

EMSCRIPTEN_KEEPALIVE
SpanSet * int_to_spanset_w(int i) {
  return int_to_spanset(i);
}

EMSCRIPTEN_KEEPALIVE
Set * intset_to_floatset_w(const Set * s) {
  return intset_to_floatset(s);
}

EMSCRIPTEN_KEEPALIVE
Span * intspan_to_floatspan_w(const Span * s) {
  return intspan_to_floatspan(s);
}

EMSCRIPTEN_KEEPALIVE
SpanSet * intspanset_to_floatspanset_w(const SpanSet * ss) {
  return intspanset_to_floatspanset(ss);
}

EMSCRIPTEN_KEEPALIVE
Span * set_to_span_w(const Set * s) {
  return set_to_span(s);
}

EMSCRIPTEN_KEEPALIVE
SpanSet * set_to_spanset_w(const Set * s) {
  return set_to_spanset(s);
}

EMSCRIPTEN_KEEPALIVE
SpanSet * span_to_spanset_w(const Span * s) {
  return span_to_spanset(s);
}

EMSCRIPTEN_KEEPALIVE
Set * text_to_set_w(const char * txt) {
  return text_to_set(cstring2text(txt));
}

EMSCRIPTEN_KEEPALIVE
Set * timestamptz_to_set_w(long long t) {
  return timestamptz_to_set((TimestampTz) t);
}

EMSCRIPTEN_KEEPALIVE
Span * timestamptz_to_span_w(long long t) {
  return timestamptz_to_span((TimestampTz) t);
}

EMSCRIPTEN_KEEPALIVE
SpanSet * timestamptz_to_spanset_w(long long t) {
  return timestamptz_to_spanset((TimestampTz) t);
}

EMSCRIPTEN_KEEPALIVE
Set * tstzset_to_dateset_w(const Set * s) {
  return tstzset_to_dateset(s);
}

EMSCRIPTEN_KEEPALIVE
Span * tstzspan_to_datespan_w(const Span * s) {
  return tstzspan_to_datespan(s);
}

EMSCRIPTEN_KEEPALIVE
SpanSet * tstzspanset_to_datespanset_w(const SpanSet * ss) {
  return tstzspanset_to_datespanset(ss);
}

EMSCRIPTEN_KEEPALIVE
int64 bigintset_end_value_w(const Set * s) {
  return bigintset_end_value(s);
}

EMSCRIPTEN_KEEPALIVE
int64 bigintset_start_value_w(const Set * s) {
  return bigintset_start_value(s);
}

EMSCRIPTEN_KEEPALIVE
long long bigintset_value_n_w(const Set * s, int n) {
  int64 r;
  if (!bigintset_value_n(s, n, &r)) return 0;
  return (long long) r;
}

EMSCRIPTEN_KEEPALIVE
int64 * bigintset_values_w(const Set * s) {
  return bigintset_values(s);
}

EMSCRIPTEN_KEEPALIVE
int64 bigintspan_lower_w(const Span * s) {
  return bigintspan_lower(s);
}

EMSCRIPTEN_KEEPALIVE
int64 bigintspan_upper_w(const Span * s) {
  return bigintspan_upper(s);
}

EMSCRIPTEN_KEEPALIVE
int64 bigintspan_width_w(const Span * s) {
  return bigintspan_width(s);
}

EMSCRIPTEN_KEEPALIVE
int64 bigintspanset_lower_w(const SpanSet * ss) {
  return bigintspanset_lower(ss);
}

EMSCRIPTEN_KEEPALIVE
int64 bigintspanset_upper_w(const SpanSet * ss) {
  return bigintspanset_upper(ss);
}

EMSCRIPTEN_KEEPALIVE
int64 bigintspanset_width_w(const SpanSet * ss, int boundspan) {
  return bigintspanset_width(ss, (bool) boundspan);
}

EMSCRIPTEN_KEEPALIVE
DateADT dateset_end_value_w(const Set * s) {
  return dateset_end_value(s);
}

EMSCRIPTEN_KEEPALIVE
DateADT dateset_start_value_w(const Set * s) {
  return dateset_start_value(s);
}

EMSCRIPTEN_KEEPALIVE
DateADT dateset_value_n_w(const Set * s, int n) {
  DateADT r;
  if (!dateset_value_n(s, n, &r)) return 0;
  return r;
}

EMSCRIPTEN_KEEPALIVE
DateADT * dateset_values_w(const Set * s) {
  return dateset_values(s);
}

EMSCRIPTEN_KEEPALIVE
Interval * datespan_duration_w(const Span * s) {
  return datespan_duration(s);
}

EMSCRIPTEN_KEEPALIVE
DateADT datespan_lower_w(const Span * s) {
  return datespan_lower(s);
}

EMSCRIPTEN_KEEPALIVE
DateADT datespan_upper_w(const Span * s) {
  return datespan_upper(s);
}

EMSCRIPTEN_KEEPALIVE
DateADT datespanset_date_n_w(const SpanSet * ss, int n) {
  DateADT r;
  if (!datespanset_date_n(ss, n, &r)) return 0;
  return r;
}

EMSCRIPTEN_KEEPALIVE
Set * datespanset_dates_w(const SpanSet * ss) {
  return datespanset_dates(ss);
}

EMSCRIPTEN_KEEPALIVE
Interval * datespanset_duration_w(const SpanSet * ss, int boundspan) {
  return datespanset_duration(ss, (bool) boundspan);
}

EMSCRIPTEN_KEEPALIVE
DateADT datespanset_end_date_w(const SpanSet * ss) {
  return datespanset_end_date(ss);
}

EMSCRIPTEN_KEEPALIVE
int datespanset_num_dates_w(const SpanSet * ss) {
  return datespanset_num_dates(ss);
}

EMSCRIPTEN_KEEPALIVE
DateADT datespanset_start_date_w(const SpanSet * ss) {
  return datespanset_start_date(ss);
}

EMSCRIPTEN_KEEPALIVE
double floatset_end_value_w(const Set * s) {
  return floatset_end_value(s);
}

EMSCRIPTEN_KEEPALIVE
double floatset_start_value_w(const Set * s) {
  return floatset_start_value(s);
}

EMSCRIPTEN_KEEPALIVE
double floatset_value_n_w(const Set * s, int n) {
  double r;
  if (!floatset_value_n(s, n, &r)) return 0.0;
  return r;
}

EMSCRIPTEN_KEEPALIVE
double * floatset_values_w(const Set * s) {
  return floatset_values(s);
}

EMSCRIPTEN_KEEPALIVE
double floatspan_lower_w(const Span * s) {
  return floatspan_lower(s);
}

EMSCRIPTEN_KEEPALIVE
double floatspan_upper_w(const Span * s) {
  return floatspan_upper(s);
}

EMSCRIPTEN_KEEPALIVE
double floatspan_width_w(const Span * s) {
  return floatspan_width(s);
}

EMSCRIPTEN_KEEPALIVE
double floatspanset_lower_w(const SpanSet * ss) {
  return floatspanset_lower(ss);
}

EMSCRIPTEN_KEEPALIVE
double floatspanset_upper_w(const SpanSet * ss) {
  return floatspanset_upper(ss);
}

EMSCRIPTEN_KEEPALIVE
double floatspanset_width_w(const SpanSet * ss, int boundspan) {
  return floatspanset_width(ss, (bool) boundspan);
}

EMSCRIPTEN_KEEPALIVE
int intset_end_value_w(const Set * s) {
  return intset_end_value(s);
}

EMSCRIPTEN_KEEPALIVE
int intset_start_value_w(const Set * s) {
  return intset_start_value(s);
}

EMSCRIPTEN_KEEPALIVE
int intset_value_n_w(const Set * s, int n) {
  int r;
  if (!intset_value_n(s, n, &r)) return 0;
  return r;
}

EMSCRIPTEN_KEEPALIVE
int * intset_values_w(const Set * s) {
  return intset_values(s);
}

EMSCRIPTEN_KEEPALIVE
int intspan_lower_w(const Span * s) {
  return intspan_lower(s);
}

EMSCRIPTEN_KEEPALIVE
int intspan_upper_w(const Span * s) {
  return intspan_upper(s);
}

EMSCRIPTEN_KEEPALIVE
int intspan_width_w(const Span * s) {
  return intspan_width(s);
}

EMSCRIPTEN_KEEPALIVE
int intspanset_lower_w(const SpanSet * ss) {
  return intspanset_lower(ss);
}

EMSCRIPTEN_KEEPALIVE
int intspanset_upper_w(const SpanSet * ss) {
  return intspanset_upper(ss);
}

EMSCRIPTEN_KEEPALIVE
int intspanset_width_w(const SpanSet * ss, int boundspan) {
  return intspanset_width(ss, (bool) boundspan);
}

EMSCRIPTEN_KEEPALIVE
uint32 set_hash_w(const Set * s) {
  return set_hash(s);
}

EMSCRIPTEN_KEEPALIVE
uint64 set_hash_extended_w(const Set * s, uint64 seed) {
  return set_hash_extended(s, seed);
}

EMSCRIPTEN_KEEPALIVE
int set_num_values_w(const Set * s) {
  return set_num_values(s);
}

EMSCRIPTEN_KEEPALIVE
uint32 span_hash_w(const Span * s) {
  return span_hash(s);
}

EMSCRIPTEN_KEEPALIVE
uint64 span_hash_extended_w(const Span * s, uint64 seed) {
  return span_hash_extended(s, seed);
}

EMSCRIPTEN_KEEPALIVE
int span_lower_inc_w(const Span * s) {
  return (int) span_lower_inc(s);
}

EMSCRIPTEN_KEEPALIVE
int span_upper_inc_w(const Span * s) {
  return (int) span_upper_inc(s);
}

EMSCRIPTEN_KEEPALIVE
Span * spanset_end_span_w(const SpanSet * ss) {
  return spanset_end_span(ss);
}

EMSCRIPTEN_KEEPALIVE
uint32 spanset_hash_w(const SpanSet * ss) {
  return spanset_hash(ss);
}

EMSCRIPTEN_KEEPALIVE
uint64 spanset_hash_extended_w(const SpanSet * ss, uint64 seed) {
  return spanset_hash_extended(ss, seed);
}

EMSCRIPTEN_KEEPALIVE
int spanset_lower_inc_w(const SpanSet * ss) {
  return (int) spanset_lower_inc(ss);
}

EMSCRIPTEN_KEEPALIVE
int spanset_num_spans_w(const SpanSet * ss) {
  return spanset_num_spans(ss);
}

EMSCRIPTEN_KEEPALIVE
Span * spanset_span_w(const SpanSet * ss) {
  return spanset_span(ss);
}

EMSCRIPTEN_KEEPALIVE
Span * spanset_span_n_w(const SpanSet * ss, int i) {
  return spanset_span_n(ss, i);
}

EMSCRIPTEN_KEEPALIVE
Span ** spanset_spanarr_w(const SpanSet * ss) {
  return spanset_spanarr(ss);
}

EMSCRIPTEN_KEEPALIVE
Span * spanset_start_span_w(const SpanSet * ss) {
  return spanset_start_span(ss);
}

EMSCRIPTEN_KEEPALIVE
int spanset_upper_inc_w(const SpanSet * ss) {
  return (int) spanset_upper_inc(ss);
}

EMSCRIPTEN_KEEPALIVE
char * textset_end_value_w(const Set * s) {
  text *_t = textset_end_value(s);
  if (!_t) return NULL;
  return text2cstring(_t);
}

EMSCRIPTEN_KEEPALIVE
char * textset_start_value_w(const Set * s) {
  text *_t = textset_start_value(s);
  if (!_t) return NULL;
  return text2cstring(_t);
}

EMSCRIPTEN_KEEPALIVE
text * textset_value_n_w(const Set * s, int n) {
  text * r;
  if (!textset_value_n(s, n, &r)) return NULL;
  return r;
}

EMSCRIPTEN_KEEPALIVE
text ** textset_values_w(const Set * s) {
  return textset_values(s);
}

EMSCRIPTEN_KEEPALIVE
TimestampTz * tstzset_values_w(const Set * s) {
  return tstzset_values(s);
}

EMSCRIPTEN_KEEPALIVE
Interval * tstzspan_duration_w(const Span * s) {
  return tstzspan_duration(s);
}

EMSCRIPTEN_KEEPALIVE
int tstzspanset_num_timestamps_w(const SpanSet * ss) {
  return tstzspanset_num_timestamps(ss);
}

EMSCRIPTEN_KEEPALIVE
Set * tstzspanset_timestamps_w(const SpanSet * ss) {
  return tstzspanset_timestamps(ss);
}

EMSCRIPTEN_KEEPALIVE
Set * bigintset_shift_scale_w(const Set * s, int64 shift, int64 width, int hasshift, int haswidth) {
  return bigintset_shift_scale(s, shift, width, (bool) hasshift, (bool) haswidth);
}

EMSCRIPTEN_KEEPALIVE
Span * bigintspan_shift_scale_w(const Span * s, int64 shift, int64 width, int hasshift, int haswidth) {
  return bigintspan_shift_scale(s, shift, width, (bool) hasshift, (bool) haswidth);
}

EMSCRIPTEN_KEEPALIVE
SpanSet * bigintspanset_shift_scale_w(const SpanSet * ss, int64 shift, int64 width, int hasshift, int haswidth) {
  return bigintspanset_shift_scale(ss, shift, width, (bool) hasshift, (bool) haswidth);
}

EMSCRIPTEN_KEEPALIVE
Set * dateset_shift_scale_w(const Set * s, int shift, int width, int hasshift, int haswidth) {
  return dateset_shift_scale(s, shift, width, (bool) hasshift, (bool) haswidth);
}

EMSCRIPTEN_KEEPALIVE
Span * datespan_shift_scale_w(const Span * s, int shift, int width, int hasshift, int haswidth) {
  return datespan_shift_scale(s, shift, width, (bool) hasshift, (bool) haswidth);
}

EMSCRIPTEN_KEEPALIVE
SpanSet * datespanset_shift_scale_w(const SpanSet * ss, int shift, int width, int hasshift, int haswidth) {
  return datespanset_shift_scale(ss, shift, width, (bool) hasshift, (bool) haswidth);
}

EMSCRIPTEN_KEEPALIVE
Set * floatset_ceil_w(const Set * s) {
  return floatset_ceil(s);
}

EMSCRIPTEN_KEEPALIVE
Set * floatset_degrees_w(const Set * s, int normalize) {
  return floatset_degrees(s, (bool) normalize);
}

EMSCRIPTEN_KEEPALIVE
Set * floatset_floor_w(const Set * s) {
  return floatset_floor(s);
}

EMSCRIPTEN_KEEPALIVE
Set * floatset_radians_w(const Set * s) {
  return floatset_radians(s);
}

EMSCRIPTEN_KEEPALIVE
Set * floatset_shift_scale_w(const Set * s, double shift, double width, int hasshift, int haswidth) {
  return floatset_shift_scale(s, shift, width, (bool) hasshift, (bool) haswidth);
}

EMSCRIPTEN_KEEPALIVE
Span * floatspan_ceil_w(const Span * s) {
  return floatspan_ceil(s);
}

EMSCRIPTEN_KEEPALIVE
Span * floatspan_degrees_w(const Span * s, int normalize) {
  return floatspan_degrees(s, (bool) normalize);
}

EMSCRIPTEN_KEEPALIVE
Span * floatspan_floor_w(const Span * s) {
  return floatspan_floor(s);
}

EMSCRIPTEN_KEEPALIVE
Span * floatspan_radians_w(const Span * s) {
  return floatspan_radians(s);
}

EMSCRIPTEN_KEEPALIVE
Span * floatspan_round_w(const Span * s, int maxdd) {
  return floatspan_round(s, maxdd);
}

EMSCRIPTEN_KEEPALIVE
Span * floatspan_shift_scale_w(const Span * s, double shift, double width, int hasshift, int haswidth) {
  return floatspan_shift_scale(s, shift, width, (bool) hasshift, (bool) haswidth);
}

EMSCRIPTEN_KEEPALIVE
SpanSet * floatspanset_ceil_w(const SpanSet * ss) {
  return floatspanset_ceil(ss);
}

EMSCRIPTEN_KEEPALIVE
SpanSet * floatspanset_floor_w(const SpanSet * ss) {
  return floatspanset_floor(ss);
}

EMSCRIPTEN_KEEPALIVE
SpanSet * floatspanset_degrees_w(const SpanSet * ss, int normalize) {
  return floatspanset_degrees(ss, (bool) normalize);
}

EMSCRIPTEN_KEEPALIVE
SpanSet * floatspanset_radians_w(const SpanSet * ss) {
  return floatspanset_radians(ss);
}

EMSCRIPTEN_KEEPALIVE
SpanSet * floatspanset_round_w(const SpanSet * ss, int maxdd) {
  return floatspanset_round(ss, maxdd);
}

EMSCRIPTEN_KEEPALIVE
SpanSet * floatspanset_shift_scale_w(const SpanSet * ss, double shift, double width, int hasshift, int haswidth) {
  return floatspanset_shift_scale(ss, shift, width, (bool) hasshift, (bool) haswidth);
}

EMSCRIPTEN_KEEPALIVE
Set * intset_shift_scale_w(const Set * s, int shift, int width, int hasshift, int haswidth) {
  return intset_shift_scale(s, shift, width, (bool) hasshift, (bool) haswidth);
}

EMSCRIPTEN_KEEPALIVE
Span * intspan_shift_scale_w(const Span * s, int shift, int width, int hasshift, int haswidth) {
  return intspan_shift_scale(s, shift, width, (bool) hasshift, (bool) haswidth);
}

EMSCRIPTEN_KEEPALIVE
SpanSet * intspanset_shift_scale_w(const SpanSet * ss, int shift, int width, int hasshift, int haswidth) {
  return intspanset_shift_scale(ss, shift, width, (bool) hasshift, (bool) haswidth);
}

EMSCRIPTEN_KEEPALIVE
Span * tstzspan_expand_w(const Span * s, const Interval * interv) {
  return tstzspan_expand(s, interv);
}

EMSCRIPTEN_KEEPALIVE
Set * set_round_w(const Set * s, int maxdd) {
  return set_round(s, maxdd);
}

EMSCRIPTEN_KEEPALIVE
Set * textcat_text_textset_w(const char * txt, const Set * s) {
  return textcat_text_textset(cstring2text(txt), s);
}

EMSCRIPTEN_KEEPALIVE
Set * textcat_textset_text_w(const Set * s, const char * txt) {
  return textcat_textset_text(s, cstring2text(txt));
}

EMSCRIPTEN_KEEPALIVE
Set * textset_initcap_w(const Set * s) {
  return textset_initcap(s);
}

EMSCRIPTEN_KEEPALIVE
Set * textset_lower_w(const Set * s) {
  return textset_lower(s);
}

EMSCRIPTEN_KEEPALIVE
Set * textset_upper_w(const Set * s) {
  return textset_upper(s);
}

EMSCRIPTEN_KEEPALIVE
long long timestamptz_tprecision_w(long long t, const Interval * duration, long long torigin) {
  return timestamptz_tprecision((TimestampTz) t, duration, (TimestampTz) torigin);
}

EMSCRIPTEN_KEEPALIVE
Set * tstzset_shift_scale_w(const Set * s, const Interval * shift, const Interval * duration) {
  return tstzset_shift_scale(s, shift, duration);
}

EMSCRIPTEN_KEEPALIVE
Set * tstzset_tprecision_w(const Set * s, const Interval * duration, long long torigin) {
  return tstzset_tprecision(s, duration, (TimestampTz) torigin);
}

EMSCRIPTEN_KEEPALIVE
Span * tstzspan_shift_scale_w(const Span * s, const Interval * shift, const Interval * duration) {
  return tstzspan_shift_scale(s, shift, duration);
}

EMSCRIPTEN_KEEPALIVE
Span * tstzspan_tprecision_w(const Span * s, const Interval * duration, long long torigin) {
  return tstzspan_tprecision(s, duration, (TimestampTz) torigin);
}

EMSCRIPTEN_KEEPALIVE
SpanSet * tstzspanset_shift_scale_w(const SpanSet * ss, const Interval * shift, const Interval * duration) {
  return tstzspanset_shift_scale(ss, shift, duration);
}

EMSCRIPTEN_KEEPALIVE
SpanSet * tstzspanset_tprecision_w(const SpanSet * ss, const Interval * duration, long long torigin) {
  return tstzspanset_tprecision(ss, duration, (TimestampTz) torigin);
}

EMSCRIPTEN_KEEPALIVE
int set_cmp_w(const Set * s1, const Set * s2) {
  return set_cmp(s1, s2);
}

EMSCRIPTEN_KEEPALIVE
int set_eq_w(const Set * s1, const Set * s2) {
  return (int) set_eq(s1, s2);
}

EMSCRIPTEN_KEEPALIVE
int set_ge_w(const Set * s1, const Set * s2) {
  return (int) set_ge(s1, s2);
}

EMSCRIPTEN_KEEPALIVE
int set_gt_w(const Set * s1, const Set * s2) {
  return (int) set_gt(s1, s2);
}

EMSCRIPTEN_KEEPALIVE
int set_le_w(const Set * s1, const Set * s2) {
  return (int) set_le(s1, s2);
}

EMSCRIPTEN_KEEPALIVE
int set_lt_w(const Set * s1, const Set * s2) {
  return (int) set_lt(s1, s2);
}

EMSCRIPTEN_KEEPALIVE
int set_ne_w(const Set * s1, const Set * s2) {
  return (int) set_ne(s1, s2);
}

EMSCRIPTEN_KEEPALIVE
int span_cmp_w(const Span * s1, const Span * s2) {
  return span_cmp(s1, s2);
}

EMSCRIPTEN_KEEPALIVE
int span_ge_w(const Span * s1, const Span * s2) {
  return (int) span_ge(s1, s2);
}

EMSCRIPTEN_KEEPALIVE
int span_gt_w(const Span * s1, const Span * s2) {
  return (int) span_gt(s1, s2);
}

EMSCRIPTEN_KEEPALIVE
int span_le_w(const Span * s1, const Span * s2) {
  return (int) span_le(s1, s2);
}

EMSCRIPTEN_KEEPALIVE
int span_lt_w(const Span * s1, const Span * s2) {
  return (int) span_lt(s1, s2);
}

EMSCRIPTEN_KEEPALIVE
int spanset_cmp_w(const SpanSet * ss1, const SpanSet * ss2) {
  return spanset_cmp(ss1, ss2);
}

EMSCRIPTEN_KEEPALIVE
int spanset_eq_w(const SpanSet * ss1, const SpanSet * ss2) {
  return (int) spanset_eq(ss1, ss2);
}

EMSCRIPTEN_KEEPALIVE
int spanset_ge_w(const SpanSet * ss1, const SpanSet * ss2) {
  return (int) spanset_ge(ss1, ss2);
}

EMSCRIPTEN_KEEPALIVE
int spanset_gt_w(const SpanSet * ss1, const SpanSet * ss2) {
  return (int) spanset_gt(ss1, ss2);
}

EMSCRIPTEN_KEEPALIVE
int spanset_le_w(const SpanSet * ss1, const SpanSet * ss2) {
  return (int) spanset_le(ss1, ss2);
}

EMSCRIPTEN_KEEPALIVE
int spanset_lt_w(const SpanSet * ss1, const SpanSet * ss2) {
  return (int) spanset_lt(ss1, ss2);
}

EMSCRIPTEN_KEEPALIVE
int spanset_ne_w(const SpanSet * ss1, const SpanSet * ss2) {
  return (int) spanset_ne(ss1, ss2);
}

EMSCRIPTEN_KEEPALIVE
Span * set_spans_w(const Set * s) {
  return set_spans(s);
}

EMSCRIPTEN_KEEPALIVE
Span * set_split_each_n_spans_w(const Set * s, int elems_per_span, int * count) {
  return set_split_each_n_spans(s, elems_per_span, count);
}

EMSCRIPTEN_KEEPALIVE
Span * set_split_n_spans_w(const Set * s, int span_count, int * count) {
  return set_split_n_spans(s, span_count, count);
}

EMSCRIPTEN_KEEPALIVE
Span * spanset_spans_w(const SpanSet * ss) {
  return spanset_spans(ss);
}

EMSCRIPTEN_KEEPALIVE
Span * spanset_split_each_n_spans_w(const SpanSet * ss, int elems_per_span, int * count) {
  return spanset_split_each_n_spans(ss, elems_per_span, count);
}

EMSCRIPTEN_KEEPALIVE
Span * spanset_split_n_spans_w(const SpanSet * ss, int span_count, int * count) {
  return spanset_split_n_spans(ss, span_count, count);
}

EMSCRIPTEN_KEEPALIVE
int adjacent_span_bigint_w(const Span * s, int64 i) {
  return (int) adjacent_span_bigint(s, i);
}

EMSCRIPTEN_KEEPALIVE
int adjacent_span_date_w(const Span * s, DateADT d) {
  return (int) adjacent_span_date(s, d);
}

EMSCRIPTEN_KEEPALIVE
int adjacent_span_float_w(const Span * s, double d) {
  return (int) adjacent_span_float(s, d);
}

EMSCRIPTEN_KEEPALIVE
int adjacent_span_int_w(const Span * s, int i) {
  return (int) adjacent_span_int(s, i);
}

EMSCRIPTEN_KEEPALIVE
int adjacent_span_spanset_w(const Span * s, const SpanSet * ss) {
  return (int) adjacent_span_spanset(s, ss);
}

EMSCRIPTEN_KEEPALIVE
int adjacent_span_timestamptz_w(const Span * s, long long t) {
  return (int) adjacent_span_timestamptz(s, (TimestampTz) t);
}

EMSCRIPTEN_KEEPALIVE
int adjacent_spanset_bigint_w(const SpanSet * ss, int64 i) {
  return (int) adjacent_spanset_bigint(ss, i);
}

EMSCRIPTEN_KEEPALIVE
int adjacent_spanset_date_w(const SpanSet * ss, DateADT d) {
  return (int) adjacent_spanset_date(ss, d);
}

EMSCRIPTEN_KEEPALIVE
int adjacent_spanset_float_w(const SpanSet * ss, double d) {
  return (int) adjacent_spanset_float(ss, d);
}

EMSCRIPTEN_KEEPALIVE
int adjacent_spanset_int_w(const SpanSet * ss, int i) {
  return (int) adjacent_spanset_int(ss, i);
}

EMSCRIPTEN_KEEPALIVE
int adjacent_spanset_timestamptz_w(const SpanSet * ss, long long t) {
  return (int) adjacent_spanset_timestamptz(ss, (TimestampTz) t);
}

EMSCRIPTEN_KEEPALIVE
int adjacent_spanset_span_w(const SpanSet * ss, const Span * s) {
  return (int) adjacent_spanset_span(ss, s);
}

EMSCRIPTEN_KEEPALIVE
int adjacent_spanset_spanset_w(const SpanSet * ss1, const SpanSet * ss2) {
  return (int) adjacent_spanset_spanset(ss1, ss2);
}

EMSCRIPTEN_KEEPALIVE
int contained_bigint_set_w(int64 i, const Set * s) {
  return (int) contained_bigint_set(i, s);
}

EMSCRIPTEN_KEEPALIVE
int contained_bigint_span_w(int64 i, const Span * s) {
  return (int) contained_bigint_span(i, s);
}

EMSCRIPTEN_KEEPALIVE
int contained_bigint_spanset_w(int64 i, const SpanSet * ss) {
  return (int) contained_bigint_spanset(i, ss);
}

EMSCRIPTEN_KEEPALIVE
int contained_date_set_w(DateADT d, const Set * s) {
  return (int) contained_date_set(d, s);
}

EMSCRIPTEN_KEEPALIVE
int contained_date_span_w(DateADT d, const Span * s) {
  return (int) contained_date_span(d, s);
}

EMSCRIPTEN_KEEPALIVE
int contained_date_spanset_w(DateADT d, const SpanSet * ss) {
  return (int) contained_date_spanset(d, ss);
}

EMSCRIPTEN_KEEPALIVE
int contained_float_set_w(double d, const Set * s) {
  return (int) contained_float_set(d, s);
}

EMSCRIPTEN_KEEPALIVE
int contained_float_span_w(double d, const Span * s) {
  return (int) contained_float_span(d, s);
}

EMSCRIPTEN_KEEPALIVE
int contained_float_spanset_w(double d, const SpanSet * ss) {
  return (int) contained_float_spanset(d, ss);
}

EMSCRIPTEN_KEEPALIVE
int contained_int_set_w(int i, const Set * s) {
  return (int) contained_int_set(i, s);
}

EMSCRIPTEN_KEEPALIVE
int contained_int_span_w(int i, const Span * s) {
  return (int) contained_int_span(i, s);
}

EMSCRIPTEN_KEEPALIVE
int contained_int_spanset_w(int i, const SpanSet * ss) {
  return (int) contained_int_spanset(i, ss);
}

EMSCRIPTEN_KEEPALIVE
int contained_set_set_w(const Set * s1, const Set * s2) {
  return (int) contained_set_set(s1, s2);
}

EMSCRIPTEN_KEEPALIVE
int contained_span_span_w(const Span * s1, const Span * s2) {
  return (int) contained_span_span(s1, s2);
}

EMSCRIPTEN_KEEPALIVE
int contained_span_spanset_w(const Span * s, const SpanSet * ss) {
  return (int) contained_span_spanset(s, ss);
}

EMSCRIPTEN_KEEPALIVE
int contained_spanset_span_w(const SpanSet * ss, const Span * s) {
  return (int) contained_spanset_span(ss, s);
}

EMSCRIPTEN_KEEPALIVE
int contained_spanset_spanset_w(const SpanSet * ss1, const SpanSet * ss2) {
  return (int) contained_spanset_spanset(ss1, ss2);
}

EMSCRIPTEN_KEEPALIVE
int contained_text_set_w(const char * txt, const Set * s) {
  return (int) contained_text_set(cstring2text(txt), s);
}

EMSCRIPTEN_KEEPALIVE
int contained_timestamptz_set_w(long long t, const Set * s) {
  return (int) contained_timestamptz_set((TimestampTz) t, s);
}

EMSCRIPTEN_KEEPALIVE
int contained_timestamptz_span_w(long long t, const Span * s) {
  return (int) contained_timestamptz_span((TimestampTz) t, s);
}

EMSCRIPTEN_KEEPALIVE
int contained_timestamptz_spanset_w(long long t, const SpanSet * ss) {
  return (int) contained_timestamptz_spanset((TimestampTz) t, ss);
}

EMSCRIPTEN_KEEPALIVE
int contains_set_bigint_w(const Set * s, int64 i) {
  return (int) contains_set_bigint(s, i);
}

EMSCRIPTEN_KEEPALIVE
int contains_set_date_w(const Set * s, DateADT d) {
  return (int) contains_set_date(s, d);
}

EMSCRIPTEN_KEEPALIVE
int contains_set_float_w(const Set * s, double d) {
  return (int) contains_set_float(s, d);
}

EMSCRIPTEN_KEEPALIVE
int contains_set_int_w(const Set * s, int i) {
  return (int) contains_set_int(s, i);
}

EMSCRIPTEN_KEEPALIVE
int contains_set_set_w(const Set * s1, const Set * s2) {
  return (int) contains_set_set(s1, s2);
}

EMSCRIPTEN_KEEPALIVE
int contains_set_text_w(const Set * s, const char * t) {
  return (int) contains_set_text(s, cstring2text(t));
}

EMSCRIPTEN_KEEPALIVE
int contains_set_timestamptz_w(const Set * s, long long t) {
  return (int) contains_set_timestamptz(s, (TimestampTz) t);
}

EMSCRIPTEN_KEEPALIVE
int contains_span_bigint_w(const Span * s, int64 i) {
  return (int) contains_span_bigint(s, i);
}

EMSCRIPTEN_KEEPALIVE
int contains_span_date_w(const Span * s, DateADT d) {
  return (int) contains_span_date(s, d);
}

EMSCRIPTEN_KEEPALIVE
int contains_span_float_w(const Span * s, double d) {
  return (int) contains_span_float(s, d);
}

EMSCRIPTEN_KEEPALIVE
int contains_span_int_w(const Span * s, int i) {
  return (int) contains_span_int(s, i);
}

EMSCRIPTEN_KEEPALIVE
int contains_span_span_w(const Span * s1, const Span * s2) {
  return (int) contains_span_span(s1, s2);
}

EMSCRIPTEN_KEEPALIVE
int contains_span_spanset_w(const Span * s, const SpanSet * ss) {
  return (int) contains_span_spanset(s, ss);
}

EMSCRIPTEN_KEEPALIVE
int contains_span_timestamptz_w(const Span * s, long long t) {
  return (int) contains_span_timestamptz(s, (TimestampTz) t);
}

EMSCRIPTEN_KEEPALIVE
int contains_spanset_bigint_w(const SpanSet * ss, int64 i) {
  return (int) contains_spanset_bigint(ss, i);
}

EMSCRIPTEN_KEEPALIVE
int contains_spanset_date_w(const SpanSet * ss, DateADT d) {
  return (int) contains_spanset_date(ss, d);
}

EMSCRIPTEN_KEEPALIVE
int contains_spanset_float_w(const SpanSet * ss, double d) {
  return (int) contains_spanset_float(ss, d);
}

EMSCRIPTEN_KEEPALIVE
int contains_spanset_int_w(const SpanSet * ss, int i) {
  return (int) contains_spanset_int(ss, i);
}

EMSCRIPTEN_KEEPALIVE
int contains_spanset_span_w(const SpanSet * ss, const Span * s) {
  return (int) contains_spanset_span(ss, s);
}

EMSCRIPTEN_KEEPALIVE
int contains_spanset_spanset_w(const SpanSet * ss1, const SpanSet * ss2) {
  return (int) contains_spanset_spanset(ss1, ss2);
}

EMSCRIPTEN_KEEPALIVE
int contains_spanset_timestamptz_w(const SpanSet * ss, long long t) {
  return (int) contains_spanset_timestamptz(ss, (TimestampTz) t);
}

EMSCRIPTEN_KEEPALIVE
int overlaps_set_set_w(const Set * s1, const Set * s2) {
  return (int) overlaps_set_set(s1, s2);
}

EMSCRIPTEN_KEEPALIVE
int overlaps_span_span_w(const Span * s1, const Span * s2) {
  return (int) overlaps_span_span(s1, s2);
}

EMSCRIPTEN_KEEPALIVE
int overlaps_span_spanset_w(const Span * s, const SpanSet * ss) {
  return (int) overlaps_span_spanset(s, ss);
}

EMSCRIPTEN_KEEPALIVE
int overlaps_spanset_span_w(const SpanSet * ss, const Span * s) {
  return (int) overlaps_spanset_span(ss, s);
}

EMSCRIPTEN_KEEPALIVE
int overlaps_spanset_spanset_w(const SpanSet * ss1, const SpanSet * ss2) {
  return (int) overlaps_spanset_spanset(ss1, ss2);
}

EMSCRIPTEN_KEEPALIVE
int after_date_set_w(DateADT d, const Set * s) {
  return (int) after_date_set(d, s);
}

EMSCRIPTEN_KEEPALIVE
int after_date_span_w(DateADT d, const Span * s) {
  return (int) after_date_span(d, s);
}

EMSCRIPTEN_KEEPALIVE
int after_date_spanset_w(DateADT d, const SpanSet * ss) {
  return (int) after_date_spanset(d, ss);
}

EMSCRIPTEN_KEEPALIVE
int after_set_date_w(const Set * s, DateADT d) {
  return (int) after_set_date(s, d);
}

EMSCRIPTEN_KEEPALIVE
int after_set_timestamptz_w(const Set * s, long long t) {
  return (int) after_set_timestamptz(s, (TimestampTz) t);
}

EMSCRIPTEN_KEEPALIVE
int after_span_date_w(const Span * s, DateADT d) {
  return (int) after_span_date(s, d);
}

EMSCRIPTEN_KEEPALIVE
int after_span_timestamptz_w(const Span * s, long long t) {
  return (int) after_span_timestamptz(s, (TimestampTz) t);
}

EMSCRIPTEN_KEEPALIVE
int after_spanset_date_w(const SpanSet * ss, DateADT d) {
  return (int) after_spanset_date(ss, d);
}

EMSCRIPTEN_KEEPALIVE
int after_spanset_timestamptz_w(const SpanSet * ss, long long t) {
  return (int) after_spanset_timestamptz(ss, (TimestampTz) t);
}

EMSCRIPTEN_KEEPALIVE
int after_timestamptz_set_w(long long t, const Set * s) {
  return (int) after_timestamptz_set((TimestampTz) t, s);
}

EMSCRIPTEN_KEEPALIVE
int after_timestamptz_span_w(long long t, const Span * s) {
  return (int) after_timestamptz_span((TimestampTz) t, s);
}

EMSCRIPTEN_KEEPALIVE
int after_timestamptz_spanset_w(long long t, const SpanSet * ss) {
  return (int) after_timestamptz_spanset((TimestampTz) t, ss);
}

EMSCRIPTEN_KEEPALIVE
int before_date_set_w(DateADT d, const Set * s) {
  return (int) before_date_set(d, s);
}

EMSCRIPTEN_KEEPALIVE
int before_date_span_w(DateADT d, const Span * s) {
  return (int) before_date_span(d, s);
}

EMSCRIPTEN_KEEPALIVE
int before_date_spanset_w(DateADT d, const SpanSet * ss) {
  return (int) before_date_spanset(d, ss);
}

EMSCRIPTEN_KEEPALIVE
int before_set_date_w(const Set * s, DateADT d) {
  return (int) before_set_date(s, d);
}

EMSCRIPTEN_KEEPALIVE
int before_set_timestamptz_w(const Set * s, long long t) {
  return (int) before_set_timestamptz(s, (TimestampTz) t);
}

EMSCRIPTEN_KEEPALIVE
int before_span_date_w(const Span * s, DateADT d) {
  return (int) before_span_date(s, d);
}

EMSCRIPTEN_KEEPALIVE
int before_span_timestamptz_w(const Span * s, long long t) {
  return (int) before_span_timestamptz(s, (TimestampTz) t);
}

EMSCRIPTEN_KEEPALIVE
int before_spanset_date_w(const SpanSet * ss, DateADT d) {
  return (int) before_spanset_date(ss, d);
}

EMSCRIPTEN_KEEPALIVE
int before_spanset_timestamptz_w(const SpanSet * ss, long long t) {
  return (int) before_spanset_timestamptz(ss, (TimestampTz) t);
}

EMSCRIPTEN_KEEPALIVE
int before_timestamptz_set_w(long long t, const Set * s) {
  return (int) before_timestamptz_set((TimestampTz) t, s);
}

EMSCRIPTEN_KEEPALIVE
int before_timestamptz_span_w(long long t, const Span * s) {
  return (int) before_timestamptz_span((TimestampTz) t, s);
}

EMSCRIPTEN_KEEPALIVE
int before_timestamptz_spanset_w(long long t, const SpanSet * ss) {
  return (int) before_timestamptz_spanset((TimestampTz) t, ss);
}

EMSCRIPTEN_KEEPALIVE
int left_bigint_set_w(int64 i, const Set * s) {
  return (int) left_bigint_set(i, s);
}

EMSCRIPTEN_KEEPALIVE
int left_bigint_span_w(int64 i, const Span * s) {
  return (int) left_bigint_span(i, s);
}

EMSCRIPTEN_KEEPALIVE
int left_bigint_spanset_w(int64 i, const SpanSet * ss) {
  return (int) left_bigint_spanset(i, ss);
}

EMSCRIPTEN_KEEPALIVE
int left_float_set_w(double d, const Set * s) {
  return (int) left_float_set(d, s);
}

EMSCRIPTEN_KEEPALIVE
int left_float_span_w(double d, const Span * s) {
  return (int) left_float_span(d, s);
}

EMSCRIPTEN_KEEPALIVE
int left_float_spanset_w(double d, const SpanSet * ss) {
  return (int) left_float_spanset(d, ss);
}

EMSCRIPTEN_KEEPALIVE
int left_int_set_w(int i, const Set * s) {
  return (int) left_int_set(i, s);
}

EMSCRIPTEN_KEEPALIVE
int left_int_span_w(int i, const Span * s) {
  return (int) left_int_span(i, s);
}

EMSCRIPTEN_KEEPALIVE
int left_int_spanset_w(int i, const SpanSet * ss) {
  return (int) left_int_spanset(i, ss);
}

EMSCRIPTEN_KEEPALIVE
int left_set_bigint_w(const Set * s, int64 i) {
  return (int) left_set_bigint(s, i);
}

EMSCRIPTEN_KEEPALIVE
int left_set_float_w(const Set * s, double d) {
  return (int) left_set_float(s, d);
}

EMSCRIPTEN_KEEPALIVE
int left_set_int_w(const Set * s, int i) {
  return (int) left_set_int(s, i);
}

EMSCRIPTEN_KEEPALIVE
int left_set_set_w(const Set * s1, const Set * s2) {
  return (int) left_set_set(s1, s2);
}

EMSCRIPTEN_KEEPALIVE
int left_set_text_w(const Set * s, const char * txt) {
  return (int) left_set_text(s, cstring2text(txt));
}

EMSCRIPTEN_KEEPALIVE
int left_span_bigint_w(const Span * s, int64 i) {
  return (int) left_span_bigint(s, i);
}

EMSCRIPTEN_KEEPALIVE
int left_span_float_w(const Span * s, double d) {
  return (int) left_span_float(s, d);
}

EMSCRIPTEN_KEEPALIVE
int left_span_int_w(const Span * s, int i) {
  return (int) left_span_int(s, i);
}

EMSCRIPTEN_KEEPALIVE
int left_span_span_w(const Span * s1, const Span * s2) {
  return (int) left_span_span(s1, s2);
}

EMSCRIPTEN_KEEPALIVE
int left_span_spanset_w(const Span * s, const SpanSet * ss) {
  return (int) left_span_spanset(s, ss);
}

EMSCRIPTEN_KEEPALIVE
int left_spanset_bigint_w(const SpanSet * ss, int64 i) {
  return (int) left_spanset_bigint(ss, i);
}

EMSCRIPTEN_KEEPALIVE
int left_spanset_float_w(const SpanSet * ss, double d) {
  return (int) left_spanset_float(ss, d);
}

EMSCRIPTEN_KEEPALIVE
int left_spanset_int_w(const SpanSet * ss, int i) {
  return (int) left_spanset_int(ss, i);
}

EMSCRIPTEN_KEEPALIVE
int left_spanset_span_w(const SpanSet * ss, const Span * s) {
  return (int) left_spanset_span(ss, s);
}

EMSCRIPTEN_KEEPALIVE
int left_spanset_spanset_w(const SpanSet * ss1, const SpanSet * ss2) {
  return (int) left_spanset_spanset(ss1, ss2);
}

EMSCRIPTEN_KEEPALIVE
int left_text_set_w(const char * txt, const Set * s) {
  return (int) left_text_set(cstring2text(txt), s);
}

EMSCRIPTEN_KEEPALIVE
int overafter_date_set_w(DateADT d, const Set * s) {
  return (int) overafter_date_set(d, s);
}

EMSCRIPTEN_KEEPALIVE
int overafter_date_span_w(DateADT d, const Span * s) {
  return (int) overafter_date_span(d, s);
}

EMSCRIPTEN_KEEPALIVE
int overafter_date_spanset_w(DateADT d, const SpanSet * ss) {
  return (int) overafter_date_spanset(d, ss);
}

EMSCRIPTEN_KEEPALIVE
int overafter_set_date_w(const Set * s, DateADT d) {
  return (int) overafter_set_date(s, d);
}

EMSCRIPTEN_KEEPALIVE
int overafter_set_timestamptz_w(const Set * s, long long t) {
  return (int) overafter_set_timestamptz(s, (TimestampTz) t);
}

EMSCRIPTEN_KEEPALIVE
int overafter_span_date_w(const Span * s, DateADT d) {
  return (int) overafter_span_date(s, d);
}

EMSCRIPTEN_KEEPALIVE
int overafter_span_timestamptz_w(const Span * s, long long t) {
  return (int) overafter_span_timestamptz(s, (TimestampTz) t);
}

EMSCRIPTEN_KEEPALIVE
int overafter_spanset_date_w(const SpanSet * ss, DateADT d) {
  return (int) overafter_spanset_date(ss, d);
}

EMSCRIPTEN_KEEPALIVE
int overafter_spanset_timestamptz_w(const SpanSet * ss, long long t) {
  return (int) overafter_spanset_timestamptz(ss, (TimestampTz) t);
}

EMSCRIPTEN_KEEPALIVE
int overafter_timestamptz_set_w(long long t, const Set * s) {
  return (int) overafter_timestamptz_set((TimestampTz) t, s);
}

EMSCRIPTEN_KEEPALIVE
int overafter_timestamptz_span_w(long long t, const Span * s) {
  return (int) overafter_timestamptz_span((TimestampTz) t, s);
}

EMSCRIPTEN_KEEPALIVE
int overafter_timestamptz_spanset_w(long long t, const SpanSet * ss) {
  return (int) overafter_timestamptz_spanset((TimestampTz) t, ss);
}

EMSCRIPTEN_KEEPALIVE
int overbefore_date_set_w(DateADT d, const Set * s) {
  return (int) overbefore_date_set(d, s);
}

EMSCRIPTEN_KEEPALIVE
int overbefore_date_span_w(DateADT d, const Span * s) {
  return (int) overbefore_date_span(d, s);
}

EMSCRIPTEN_KEEPALIVE
int overbefore_date_spanset_w(DateADT d, const SpanSet * ss) {
  return (int) overbefore_date_spanset(d, ss);
}

EMSCRIPTEN_KEEPALIVE
int overbefore_set_date_w(const Set * s, DateADT d) {
  return (int) overbefore_set_date(s, d);
}

EMSCRIPTEN_KEEPALIVE
int overbefore_set_timestamptz_w(const Set * s, long long t) {
  return (int) overbefore_set_timestamptz(s, (TimestampTz) t);
}

EMSCRIPTEN_KEEPALIVE
int overbefore_span_date_w(const Span * s, DateADT d) {
  return (int) overbefore_span_date(s, d);
}

EMSCRIPTEN_KEEPALIVE
int overbefore_span_timestamptz_w(const Span * s, long long t) {
  return (int) overbefore_span_timestamptz(s, (TimestampTz) t);
}

EMSCRIPTEN_KEEPALIVE
int overbefore_spanset_date_w(const SpanSet * ss, DateADT d) {
  return (int) overbefore_spanset_date(ss, d);
}

EMSCRIPTEN_KEEPALIVE
int overbefore_spanset_timestamptz_w(const SpanSet * ss, long long t) {
  return (int) overbefore_spanset_timestamptz(ss, (TimestampTz) t);
}

EMSCRIPTEN_KEEPALIVE
int overbefore_timestamptz_set_w(long long t, const Set * s) {
  return (int) overbefore_timestamptz_set((TimestampTz) t, s);
}

EMSCRIPTEN_KEEPALIVE
int overbefore_timestamptz_span_w(long long t, const Span * s) {
  return (int) overbefore_timestamptz_span((TimestampTz) t, s);
}

EMSCRIPTEN_KEEPALIVE
int overbefore_timestamptz_spanset_w(long long t, const SpanSet * ss) {
  return (int) overbefore_timestamptz_spanset((TimestampTz) t, ss);
}

EMSCRIPTEN_KEEPALIVE
int overleft_bigint_set_w(int64 i, const Set * s) {
  return (int) overleft_bigint_set(i, s);
}

EMSCRIPTEN_KEEPALIVE
int overleft_bigint_span_w(int64 i, const Span * s) {
  return (int) overleft_bigint_span(i, s);
}

EMSCRIPTEN_KEEPALIVE
int overleft_bigint_spanset_w(int64 i, const SpanSet * ss) {
  return (int) overleft_bigint_spanset(i, ss);
}

EMSCRIPTEN_KEEPALIVE
int overleft_float_set_w(double d, const Set * s) {
  return (int) overleft_float_set(d, s);
}

EMSCRIPTEN_KEEPALIVE
int overleft_float_span_w(double d, const Span * s) {
  return (int) overleft_float_span(d, s);
}

EMSCRIPTEN_KEEPALIVE
int overleft_float_spanset_w(double d, const SpanSet * ss) {
  return (int) overleft_float_spanset(d, ss);
}

EMSCRIPTEN_KEEPALIVE
int overleft_int_set_w(int i, const Set * s) {
  return (int) overleft_int_set(i, s);
}

EMSCRIPTEN_KEEPALIVE
int overleft_int_span_w(int i, const Span * s) {
  return (int) overleft_int_span(i, s);
}

EMSCRIPTEN_KEEPALIVE
int overleft_int_spanset_w(int i, const SpanSet * ss) {
  return (int) overleft_int_spanset(i, ss);
}

EMSCRIPTEN_KEEPALIVE
int overleft_set_bigint_w(const Set * s, int64 i) {
  return (int) overleft_set_bigint(s, i);
}

EMSCRIPTEN_KEEPALIVE
int overleft_set_float_w(const Set * s, double d) {
  return (int) overleft_set_float(s, d);
}

EMSCRIPTEN_KEEPALIVE
int overleft_set_int_w(const Set * s, int i) {
  return (int) overleft_set_int(s, i);
}

EMSCRIPTEN_KEEPALIVE
int overleft_set_set_w(const Set * s1, const Set * s2) {
  return (int) overleft_set_set(s1, s2);
}

EMSCRIPTEN_KEEPALIVE
int overleft_set_text_w(const Set * s, const char * txt) {
  return (int) overleft_set_text(s, cstring2text(txt));
}

EMSCRIPTEN_KEEPALIVE
int overleft_span_bigint_w(const Span * s, int64 i) {
  return (int) overleft_span_bigint(s, i);
}

EMSCRIPTEN_KEEPALIVE
int overleft_span_float_w(const Span * s, double d) {
  return (int) overleft_span_float(s, d);
}

EMSCRIPTEN_KEEPALIVE
int overleft_span_int_w(const Span * s, int i) {
  return (int) overleft_span_int(s, i);
}

EMSCRIPTEN_KEEPALIVE
int overleft_span_span_w(const Span * s1, const Span * s2) {
  return (int) overleft_span_span(s1, s2);
}

EMSCRIPTEN_KEEPALIVE
int overleft_span_spanset_w(const Span * s, const SpanSet * ss) {
  return (int) overleft_span_spanset(s, ss);
}

EMSCRIPTEN_KEEPALIVE
int overleft_spanset_bigint_w(const SpanSet * ss, int64 i) {
  return (int) overleft_spanset_bigint(ss, i);
}

EMSCRIPTEN_KEEPALIVE
int overleft_spanset_float_w(const SpanSet * ss, double d) {
  return (int) overleft_spanset_float(ss, d);
}

EMSCRIPTEN_KEEPALIVE
int overleft_spanset_int_w(const SpanSet * ss, int i) {
  return (int) overleft_spanset_int(ss, i);
}

EMSCRIPTEN_KEEPALIVE
int overleft_spanset_span_w(const SpanSet * ss, const Span * s) {
  return (int) overleft_spanset_span(ss, s);
}

EMSCRIPTEN_KEEPALIVE
int overleft_spanset_spanset_w(const SpanSet * ss1, const SpanSet * ss2) {
  return (int) overleft_spanset_spanset(ss1, ss2);
}

EMSCRIPTEN_KEEPALIVE
int overleft_text_set_w(const char * txt, const Set * s) {
  return (int) overleft_text_set(cstring2text(txt), s);
}

EMSCRIPTEN_KEEPALIVE
int overright_bigint_set_w(int64 i, const Set * s) {
  return (int) overright_bigint_set(i, s);
}

EMSCRIPTEN_KEEPALIVE
int overright_bigint_span_w(int64 i, const Span * s) {
  return (int) overright_bigint_span(i, s);
}

EMSCRIPTEN_KEEPALIVE
int overright_bigint_spanset_w(int64 i, const SpanSet * ss) {
  return (int) overright_bigint_spanset(i, ss);
}

EMSCRIPTEN_KEEPALIVE
int overright_float_set_w(double d, const Set * s) {
  return (int) overright_float_set(d, s);
}

EMSCRIPTEN_KEEPALIVE
int overright_float_span_w(double d, const Span * s) {
  return (int) overright_float_span(d, s);
}

EMSCRIPTEN_KEEPALIVE
int overright_float_spanset_w(double d, const SpanSet * ss) {
  return (int) overright_float_spanset(d, ss);
}

EMSCRIPTEN_KEEPALIVE
int overright_int_set_w(int i, const Set * s) {
  return (int) overright_int_set(i, s);
}

EMSCRIPTEN_KEEPALIVE
int overright_int_span_w(int i, const Span * s) {
  return (int) overright_int_span(i, s);
}

EMSCRIPTEN_KEEPALIVE
int overright_int_spanset_w(int i, const SpanSet * ss) {
  return (int) overright_int_spanset(i, ss);
}

EMSCRIPTEN_KEEPALIVE
int overright_set_bigint_w(const Set * s, int64 i) {
  return (int) overright_set_bigint(s, i);
}

EMSCRIPTEN_KEEPALIVE
int overright_set_float_w(const Set * s, double d) {
  return (int) overright_set_float(s, d);
}

EMSCRIPTEN_KEEPALIVE
int overright_set_int_w(const Set * s, int i) {
  return (int) overright_set_int(s, i);
}

EMSCRIPTEN_KEEPALIVE
int overright_set_set_w(const Set * s1, const Set * s2) {
  return (int) overright_set_set(s1, s2);
}

EMSCRIPTEN_KEEPALIVE
int overright_set_text_w(const Set * s, const char * txt) {
  return (int) overright_set_text(s, cstring2text(txt));
}

EMSCRIPTEN_KEEPALIVE
int overright_span_bigint_w(const Span * s, int64 i) {
  return (int) overright_span_bigint(s, i);
}

EMSCRIPTEN_KEEPALIVE
int overright_span_float_w(const Span * s, double d) {
  return (int) overright_span_float(s, d);
}

EMSCRIPTEN_KEEPALIVE
int overright_span_int_w(const Span * s, int i) {
  return (int) overright_span_int(s, i);
}

EMSCRIPTEN_KEEPALIVE
int overright_span_span_w(const Span * s1, const Span * s2) {
  return (int) overright_span_span(s1, s2);
}

EMSCRIPTEN_KEEPALIVE
int overright_span_spanset_w(const Span * s, const SpanSet * ss) {
  return (int) overright_span_spanset(s, ss);
}

EMSCRIPTEN_KEEPALIVE
int overright_spanset_bigint_w(const SpanSet * ss, int64 i) {
  return (int) overright_spanset_bigint(ss, i);
}

EMSCRIPTEN_KEEPALIVE
int overright_spanset_float_w(const SpanSet * ss, double d) {
  return (int) overright_spanset_float(ss, d);
}

EMSCRIPTEN_KEEPALIVE
int overright_spanset_int_w(const SpanSet * ss, int i) {
  return (int) overright_spanset_int(ss, i);
}

EMSCRIPTEN_KEEPALIVE
int overright_spanset_span_w(const SpanSet * ss, const Span * s) {
  return (int) overright_spanset_span(ss, s);
}

EMSCRIPTEN_KEEPALIVE
int overright_spanset_spanset_w(const SpanSet * ss1, const SpanSet * ss2) {
  return (int) overright_spanset_spanset(ss1, ss2);
}

EMSCRIPTEN_KEEPALIVE
int overright_text_set_w(const char * txt, const Set * s) {
  return (int) overright_text_set(cstring2text(txt), s);
}

EMSCRIPTEN_KEEPALIVE
int right_bigint_set_w(int64 i, const Set * s) {
  return (int) right_bigint_set(i, s);
}

EMSCRIPTEN_KEEPALIVE
int right_bigint_span_w(int64 i, const Span * s) {
  return (int) right_bigint_span(i, s);
}

EMSCRIPTEN_KEEPALIVE
int right_bigint_spanset_w(int64 i, const SpanSet * ss) {
  return (int) right_bigint_spanset(i, ss);
}

EMSCRIPTEN_KEEPALIVE
int right_float_set_w(double d, const Set * s) {
  return (int) right_float_set(d, s);
}

EMSCRIPTEN_KEEPALIVE
int right_float_span_w(double d, const Span * s) {
  return (int) right_float_span(d, s);
}

EMSCRIPTEN_KEEPALIVE
int right_float_spanset_w(double d, const SpanSet * ss) {
  return (int) right_float_spanset(d, ss);
}

EMSCRIPTEN_KEEPALIVE
int right_int_set_w(int i, const Set * s) {
  return (int) right_int_set(i, s);
}

EMSCRIPTEN_KEEPALIVE
int right_int_span_w(int i, const Span * s) {
  return (int) right_int_span(i, s);
}

EMSCRIPTEN_KEEPALIVE
int right_int_spanset_w(int i, const SpanSet * ss) {
  return (int) right_int_spanset(i, ss);
}

EMSCRIPTEN_KEEPALIVE
int right_set_bigint_w(const Set * s, int64 i) {
  return (int) right_set_bigint(s, i);
}

EMSCRIPTEN_KEEPALIVE
int right_set_float_w(const Set * s, double d) {
  return (int) right_set_float(s, d);
}

EMSCRIPTEN_KEEPALIVE
int right_set_int_w(const Set * s, int i) {
  return (int) right_set_int(s, i);
}

EMSCRIPTEN_KEEPALIVE
int right_set_set_w(const Set * s1, const Set * s2) {
  return (int) right_set_set(s1, s2);
}

EMSCRIPTEN_KEEPALIVE
int right_set_text_w(const Set * s, const char * txt) {
  return (int) right_set_text(s, cstring2text(txt));
}

EMSCRIPTEN_KEEPALIVE
int right_span_bigint_w(const Span * s, int64 i) {
  return (int) right_span_bigint(s, i);
}

EMSCRIPTEN_KEEPALIVE
int right_span_float_w(const Span * s, double d) {
  return (int) right_span_float(s, d);
}

EMSCRIPTEN_KEEPALIVE
int right_span_int_w(const Span * s, int i) {
  return (int) right_span_int(s, i);
}

EMSCRIPTEN_KEEPALIVE
int right_span_span_w(const Span * s1, const Span * s2) {
  return (int) right_span_span(s1, s2);
}

EMSCRIPTEN_KEEPALIVE
int right_span_spanset_w(const Span * s, const SpanSet * ss) {
  return (int) right_span_spanset(s, ss);
}

EMSCRIPTEN_KEEPALIVE
int right_spanset_bigint_w(const SpanSet * ss, int64 i) {
  return (int) right_spanset_bigint(ss, i);
}

EMSCRIPTEN_KEEPALIVE
int right_spanset_float_w(const SpanSet * ss, double d) {
  return (int) right_spanset_float(ss, d);
}

EMSCRIPTEN_KEEPALIVE
int right_spanset_int_w(const SpanSet * ss, int i) {
  return (int) right_spanset_int(ss, i);
}

EMSCRIPTEN_KEEPALIVE
int right_spanset_span_w(const SpanSet * ss, const Span * s) {
  return (int) right_spanset_span(ss, s);
}

EMSCRIPTEN_KEEPALIVE
int right_spanset_spanset_w(const SpanSet * ss1, const SpanSet * ss2) {
  return (int) right_spanset_spanset(ss1, ss2);
}

EMSCRIPTEN_KEEPALIVE
int right_text_set_w(const char * txt, const Set * s) {
  return (int) right_text_set(cstring2text(txt), s);
}

EMSCRIPTEN_KEEPALIVE
Set * intersection_bigint_set_w(int64 i, const Set * s) {
  return intersection_bigint_set(i, s);
}

EMSCRIPTEN_KEEPALIVE
Set * intersection_date_set_w(DateADT d, const Set * s) {
  return intersection_date_set(d, s);
}

EMSCRIPTEN_KEEPALIVE
Set * intersection_float_set_w(double d, const Set * s) {
  return intersection_float_set(d, s);
}

EMSCRIPTEN_KEEPALIVE
Set * intersection_int_set_w(int i, const Set * s) {
  return intersection_int_set(i, s);
}

EMSCRIPTEN_KEEPALIVE
Set * intersection_set_bigint_w(const Set * s, int64 i) {
  return intersection_set_bigint(s, i);
}

EMSCRIPTEN_KEEPALIVE
Set * intersection_set_date_w(const Set * s, DateADT d) {
  return intersection_set_date(s, d);
}

EMSCRIPTEN_KEEPALIVE
Set * intersection_set_float_w(const Set * s, double d) {
  return intersection_set_float(s, d);
}

EMSCRIPTEN_KEEPALIVE
Set * intersection_set_int_w(const Set * s, int i) {
  return intersection_set_int(s, i);
}

EMSCRIPTEN_KEEPALIVE
Set * intersection_set_set_w(const Set * s1, const Set * s2) {
  return intersection_set_set(s1, s2);
}

EMSCRIPTEN_KEEPALIVE
Set * intersection_set_text_w(const Set * s, const char * txt) {
  return intersection_set_text(s, cstring2text(txt));
}

EMSCRIPTEN_KEEPALIVE
Set * intersection_set_timestamptz_w(const Set * s, long long t) {
  return intersection_set_timestamptz(s, (TimestampTz) t);
}

EMSCRIPTEN_KEEPALIVE
Span * intersection_span_bigint_w(const Span * s, int64 i) {
  return intersection_span_bigint(s, i);
}

EMSCRIPTEN_KEEPALIVE
Span * intersection_span_date_w(const Span * s, DateADT d) {
  return intersection_span_date(s, d);
}

EMSCRIPTEN_KEEPALIVE
Span * intersection_span_float_w(const Span * s, double d) {
  return intersection_span_float(s, d);
}

EMSCRIPTEN_KEEPALIVE
Span * intersection_span_int_w(const Span * s, int i) {
  return intersection_span_int(s, i);
}

EMSCRIPTEN_KEEPALIVE
Span * intersection_span_span_w(const Span * s1, const Span * s2) {
  return intersection_span_span(s1, s2);
}

EMSCRIPTEN_KEEPALIVE
SpanSet * intersection_span_spanset_w(const Span * s, const SpanSet * ss) {
  return intersection_span_spanset(s, ss);
}

EMSCRIPTEN_KEEPALIVE
Span * intersection_span_timestamptz_w(const Span * s, long long t) {
  return intersection_span_timestamptz(s, (TimestampTz) t);
}

EMSCRIPTEN_KEEPALIVE
SpanSet * intersection_spanset_bigint_w(const SpanSet * ss, int64 i) {
  return intersection_spanset_bigint(ss, i);
}

EMSCRIPTEN_KEEPALIVE
SpanSet * intersection_spanset_date_w(const SpanSet * ss, DateADT d) {
  return intersection_spanset_date(ss, d);
}

EMSCRIPTEN_KEEPALIVE
SpanSet * intersection_spanset_float_w(const SpanSet * ss, double d) {
  return intersection_spanset_float(ss, d);
}

EMSCRIPTEN_KEEPALIVE
SpanSet * intersection_spanset_int_w(const SpanSet * ss, int i) {
  return intersection_spanset_int(ss, i);
}

EMSCRIPTEN_KEEPALIVE
SpanSet * intersection_spanset_span_w(const SpanSet * ss, const Span * s) {
  return intersection_spanset_span(ss, s);
}

EMSCRIPTEN_KEEPALIVE
SpanSet * intersection_spanset_spanset_w(const SpanSet * ss1, const SpanSet * ss2) {
  return intersection_spanset_spanset(ss1, ss2);
}

EMSCRIPTEN_KEEPALIVE
SpanSet * intersection_spanset_timestamptz_w(const SpanSet * ss, long long t) {
  return intersection_spanset_timestamptz(ss, (TimestampTz) t);
}

EMSCRIPTEN_KEEPALIVE
Set * intersection_text_set_w(const char * txt, const Set * s) {
  return intersection_text_set(cstring2text(txt), s);
}

EMSCRIPTEN_KEEPALIVE
Set * intersection_timestamptz_set_w(long long t, const Set * s) {
  return intersection_timestamptz_set((TimestampTz) t, s);
}

EMSCRIPTEN_KEEPALIVE
Set * minus_bigint_set_w(int64 i, const Set * s) {
  return minus_bigint_set(i, s);
}

EMSCRIPTEN_KEEPALIVE
SpanSet * minus_bigint_span_w(int64 i, const Span * s) {
  return minus_bigint_span(i, s);
}

EMSCRIPTEN_KEEPALIVE
SpanSet * minus_bigint_spanset_w(int64 i, const SpanSet * ss) {
  return minus_bigint_spanset(i, ss);
}

EMSCRIPTEN_KEEPALIVE
Set * minus_date_set_w(DateADT d, const Set * s) {
  return minus_date_set(d, s);
}

EMSCRIPTEN_KEEPALIVE
SpanSet * minus_date_span_w(DateADT d, const Span * s) {
  return minus_date_span(d, s);
}

EMSCRIPTEN_KEEPALIVE
SpanSet * minus_date_spanset_w(DateADT d, const SpanSet * ss) {
  return minus_date_spanset(d, ss);
}

EMSCRIPTEN_KEEPALIVE
Set * minus_float_set_w(double d, const Set * s) {
  return minus_float_set(d, s);
}

EMSCRIPTEN_KEEPALIVE
SpanSet * minus_float_span_w(double d, const Span * s) {
  return minus_float_span(d, s);
}

EMSCRIPTEN_KEEPALIVE
SpanSet * minus_float_spanset_w(double d, const SpanSet * ss) {
  return minus_float_spanset(d, ss);
}

EMSCRIPTEN_KEEPALIVE
Set * minus_int_set_w(int i, const Set * s) {
  return minus_int_set(i, s);
}

EMSCRIPTEN_KEEPALIVE
SpanSet * minus_int_span_w(int i, const Span * s) {
  return minus_int_span(i, s);
}

EMSCRIPTEN_KEEPALIVE
SpanSet * minus_int_spanset_w(int i, const SpanSet * ss) {
  return minus_int_spanset(i, ss);
}

EMSCRIPTEN_KEEPALIVE
Set * minus_set_bigint_w(const Set * s, int64 i) {
  return minus_set_bigint(s, i);
}

EMSCRIPTEN_KEEPALIVE
Set * minus_set_date_w(const Set * s, DateADT d) {
  return minus_set_date(s, d);
}

EMSCRIPTEN_KEEPALIVE
Set * minus_set_float_w(const Set * s, double d) {
  return minus_set_float(s, d);
}

EMSCRIPTEN_KEEPALIVE
Set * minus_set_int_w(const Set * s, int i) {
  return minus_set_int(s, i);
}

EMSCRIPTEN_KEEPALIVE
Set * minus_set_set_w(const Set * s1, const Set * s2) {
  return minus_set_set(s1, s2);
}

EMSCRIPTEN_KEEPALIVE
Set * minus_set_text_w(const Set * s, const char * txt) {
  return minus_set_text(s, cstring2text(txt));
}

EMSCRIPTEN_KEEPALIVE
Set * minus_set_timestamptz_w(const Set * s, long long t) {
  return minus_set_timestamptz(s, (TimestampTz) t);
}

EMSCRIPTEN_KEEPALIVE
SpanSet * minus_span_bigint_w(const Span * s, int64 i) {
  return minus_span_bigint(s, i);
}

EMSCRIPTEN_KEEPALIVE
SpanSet * minus_span_date_w(const Span * s, DateADT d) {
  return minus_span_date(s, d);
}

EMSCRIPTEN_KEEPALIVE
SpanSet * minus_span_float_w(const Span * s, double d) {
  return minus_span_float(s, d);
}

EMSCRIPTEN_KEEPALIVE
SpanSet * minus_span_int_w(const Span * s, int i) {
  return minus_span_int(s, i);
}

EMSCRIPTEN_KEEPALIVE
SpanSet * minus_span_span_w(const Span * s1, const Span * s2) {
  return minus_span_span(s1, s2);
}

EMSCRIPTEN_KEEPALIVE
SpanSet * minus_span_spanset_w(const Span * s, const SpanSet * ss) {
  return minus_span_spanset(s, ss);
}

EMSCRIPTEN_KEEPALIVE
SpanSet * minus_span_timestamptz_w(const Span * s, long long t) {
  return minus_span_timestamptz(s, (TimestampTz) t);
}

EMSCRIPTEN_KEEPALIVE
SpanSet * minus_spanset_bigint_w(const SpanSet * ss, int64 i) {
  return minus_spanset_bigint(ss, i);
}

EMSCRIPTEN_KEEPALIVE
SpanSet * minus_spanset_date_w(const SpanSet * ss, DateADT d) {
  return minus_spanset_date(ss, d);
}

EMSCRIPTEN_KEEPALIVE
SpanSet * minus_spanset_float_w(const SpanSet * ss, double d) {
  return minus_spanset_float(ss, d);
}

EMSCRIPTEN_KEEPALIVE
SpanSet * minus_spanset_int_w(const SpanSet * ss, int i) {
  return minus_spanset_int(ss, i);
}

EMSCRIPTEN_KEEPALIVE
SpanSet * minus_spanset_span_w(const SpanSet * ss, const Span * s) {
  return minus_spanset_span(ss, s);
}

EMSCRIPTEN_KEEPALIVE
SpanSet * minus_spanset_spanset_w(const SpanSet * ss1, const SpanSet * ss2) {
  return minus_spanset_spanset(ss1, ss2);
}

EMSCRIPTEN_KEEPALIVE
SpanSet * minus_spanset_timestamptz_w(const SpanSet * ss, long long t) {
  return minus_spanset_timestamptz(ss, (TimestampTz) t);
}

EMSCRIPTEN_KEEPALIVE
Set * minus_text_set_w(const char * txt, const Set * s) {
  return minus_text_set(cstring2text(txt), s);
}

EMSCRIPTEN_KEEPALIVE
Set * minus_timestamptz_set_w(long long t, const Set * s) {
  return minus_timestamptz_set((TimestampTz) t, s);
}

EMSCRIPTEN_KEEPALIVE
SpanSet * minus_timestamptz_span_w(long long t, const Span * s) {
  return minus_timestamptz_span((TimestampTz) t, s);
}

EMSCRIPTEN_KEEPALIVE
SpanSet * minus_timestamptz_spanset_w(long long t, const SpanSet * ss) {
  return minus_timestamptz_spanset((TimestampTz) t, ss);
}

EMSCRIPTEN_KEEPALIVE
Set * union_bigint_set_w(int64 i, const Set * s) {
  return union_bigint_set(i, s);
}

EMSCRIPTEN_KEEPALIVE
SpanSet * union_bigint_span_w(const Span * s, int64 i) {
  return union_bigint_span(s, i);
}

EMSCRIPTEN_KEEPALIVE
SpanSet * union_bigint_spanset_w(int64 i, SpanSet * ss) {
  return union_bigint_spanset(i, ss);
}

EMSCRIPTEN_KEEPALIVE
Set * union_date_set_w(DateADT d, const Set * s) {
  return union_date_set(d, s);
}

EMSCRIPTEN_KEEPALIVE
SpanSet * union_date_span_w(const Span * s, DateADT d) {
  return union_date_span(s, d);
}

EMSCRIPTEN_KEEPALIVE
SpanSet * union_date_spanset_w(DateADT d, SpanSet * ss) {
  return union_date_spanset(d, ss);
}

EMSCRIPTEN_KEEPALIVE
Set * union_float_set_w(double d, const Set * s) {
  return union_float_set(d, s);
}

EMSCRIPTEN_KEEPALIVE
SpanSet * union_float_span_w(const Span * s, double d) {
  return union_float_span(s, d);
}

EMSCRIPTEN_KEEPALIVE
SpanSet * union_float_spanset_w(double d, SpanSet * ss) {
  return union_float_spanset(d, ss);
}

EMSCRIPTEN_KEEPALIVE
Set * union_int_set_w(int i, const Set * s) {
  return union_int_set(i, s);
}

EMSCRIPTEN_KEEPALIVE
SpanSet * union_int_span_w(int i, const Span * s) {
  return union_int_span(i, s);
}

EMSCRIPTEN_KEEPALIVE
SpanSet * union_int_spanset_w(int i, SpanSet * ss) {
  return union_int_spanset(i, ss);
}

EMSCRIPTEN_KEEPALIVE
Set * union_set_bigint_w(const Set * s, int64 i) {
  return union_set_bigint(s, i);
}

EMSCRIPTEN_KEEPALIVE
Set * union_set_date_w(const Set * s, DateADT d) {
  return union_set_date(s, d);
}

EMSCRIPTEN_KEEPALIVE
Set * union_set_float_w(const Set * s, double d) {
  return union_set_float(s, d);
}

EMSCRIPTEN_KEEPALIVE
Set * union_set_int_w(const Set * s, int i) {
  return union_set_int(s, i);
}

EMSCRIPTEN_KEEPALIVE
Set * union_set_set_w(const Set * s1, const Set * s2) {
  return union_set_set(s1, s2);
}

EMSCRIPTEN_KEEPALIVE
Set * union_set_text_w(const Set * s, const char * txt) {
  return union_set_text(s, cstring2text(txt));
}

EMSCRIPTEN_KEEPALIVE
Set * union_set_timestamptz_w(const Set * s, long long t) {
  return union_set_timestamptz(s, (TimestampTz) t);
}

EMSCRIPTEN_KEEPALIVE
SpanSet * union_span_bigint_w(const Span * s, int64 i) {
  return union_span_bigint(s, i);
}

EMSCRIPTEN_KEEPALIVE
SpanSet * union_span_date_w(const Span * s, DateADT d) {
  return union_span_date(s, d);
}

EMSCRIPTEN_KEEPALIVE
SpanSet * union_span_float_w(const Span * s, double d) {
  return union_span_float(s, d);
}

EMSCRIPTEN_KEEPALIVE
SpanSet * union_span_int_w(const Span * s, int i) {
  return union_span_int(s, i);
}

EMSCRIPTEN_KEEPALIVE
SpanSet * union_span_span_w(const Span * s1, const Span * s2) {
  return union_span_span(s1, s2);
}

EMSCRIPTEN_KEEPALIVE
SpanSet * union_span_spanset_w(const Span * s, const SpanSet * ss) {
  return union_span_spanset(s, ss);
}

EMSCRIPTEN_KEEPALIVE
SpanSet * union_span_timestamptz_w(const Span * s, long long t) {
  return union_span_timestamptz(s, (TimestampTz) t);
}

EMSCRIPTEN_KEEPALIVE
SpanSet * union_spanset_bigint_w(const SpanSet * ss, int64 i) {
  return union_spanset_bigint(ss, i);
}

EMSCRIPTEN_KEEPALIVE
SpanSet * union_spanset_date_w(const SpanSet * ss, DateADT d) {
  return union_spanset_date(ss, d);
}

EMSCRIPTEN_KEEPALIVE
SpanSet * union_spanset_float_w(const SpanSet * ss, double d) {
  return union_spanset_float(ss, d);
}

EMSCRIPTEN_KEEPALIVE
SpanSet * union_spanset_int_w(const SpanSet * ss, int i) {
  return union_spanset_int(ss, i);
}

EMSCRIPTEN_KEEPALIVE
SpanSet * union_spanset_span_w(const SpanSet * ss, const Span * s) {
  return union_spanset_span(ss, s);
}

EMSCRIPTEN_KEEPALIVE
SpanSet * union_spanset_spanset_w(const SpanSet * ss1, const SpanSet * ss2) {
  return union_spanset_spanset(ss1, ss2);
}

EMSCRIPTEN_KEEPALIVE
SpanSet * union_spanset_timestamptz_w(const SpanSet * ss, long long t) {
  return union_spanset_timestamptz(ss, (TimestampTz) t);
}

EMSCRIPTEN_KEEPALIVE
Set * union_text_set_w(const char * txt, const Set * s) {
  return union_text_set(cstring2text(txt), s);
}

EMSCRIPTEN_KEEPALIVE
Set * union_timestamptz_set_w(long long t, const Set * s) {
  return union_timestamptz_set((TimestampTz) t, s);
}

EMSCRIPTEN_KEEPALIVE
SpanSet * union_timestamptz_span_w(long long t, const Span * s) {
  return union_timestamptz_span((TimestampTz) t, s);
}

EMSCRIPTEN_KEEPALIVE
SpanSet * union_timestamptz_spanset_w(long long t, SpanSet * ss) {
  return union_timestamptz_spanset((TimestampTz) t, ss);
}

EMSCRIPTEN_KEEPALIVE
int64 distance_bigintset_bigintset_w(const Set * s1, const Set * s2) {
  return distance_bigintset_bigintset(s1, s2);
}

EMSCRIPTEN_KEEPALIVE
int64 distance_bigintspan_bigintspan_w(const Span * s1, const Span * s2) {
  return distance_bigintspan_bigintspan(s1, s2);
}

EMSCRIPTEN_KEEPALIVE
int64 distance_bigintspanset_bigintspan_w(const SpanSet * ss, const Span * s) {
  return distance_bigintspanset_bigintspan(ss, s);
}

EMSCRIPTEN_KEEPALIVE
int64 distance_bigintspanset_bigintspanset_w(const SpanSet * ss1, const SpanSet * ss2) {
  return distance_bigintspanset_bigintspanset(ss1, ss2);
}

EMSCRIPTEN_KEEPALIVE
int distance_dateset_dateset_w(const Set * s1, const Set * s2) {
  return distance_dateset_dateset(s1, s2);
}

EMSCRIPTEN_KEEPALIVE
int distance_datespan_datespan_w(const Span * s1, const Span * s2) {
  return distance_datespan_datespan(s1, s2);
}

EMSCRIPTEN_KEEPALIVE
int distance_datespanset_datespan_w(const SpanSet * ss, const Span * s) {
  return distance_datespanset_datespan(ss, s);
}

EMSCRIPTEN_KEEPALIVE
int distance_datespanset_datespanset_w(const SpanSet * ss1, const SpanSet * ss2) {
  return distance_datespanset_datespanset(ss1, ss2);
}

EMSCRIPTEN_KEEPALIVE
double distance_floatset_floatset_w(const Set * s1, const Set * s2) {
  return distance_floatset_floatset(s1, s2);
}

EMSCRIPTEN_KEEPALIVE
double distance_floatspan_floatspan_w(const Span * s1, const Span * s2) {
  return distance_floatspan_floatspan(s1, s2);
}

EMSCRIPTEN_KEEPALIVE
double distance_floatspanset_floatspan_w(const SpanSet * ss, const Span * s) {
  return distance_floatspanset_floatspan(ss, s);
}

EMSCRIPTEN_KEEPALIVE
double distance_floatspanset_floatspanset_w(const SpanSet * ss1, const SpanSet * ss2) {
  return distance_floatspanset_floatspanset(ss1, ss2);
}

EMSCRIPTEN_KEEPALIVE
int distance_intset_intset_w(const Set * s1, const Set * s2) {
  return distance_intset_intset(s1, s2);
}

EMSCRIPTEN_KEEPALIVE
int distance_intspan_intspan_w(const Span * s1, const Span * s2) {
  return distance_intspan_intspan(s1, s2);
}

EMSCRIPTEN_KEEPALIVE
int distance_intspanset_intspan_w(const SpanSet * ss, const Span * s) {
  return distance_intspanset_intspan(ss, s);
}

EMSCRIPTEN_KEEPALIVE
int distance_intspanset_intspanset_w(const SpanSet * ss1, const SpanSet * ss2) {
  return distance_intspanset_intspanset(ss1, ss2);
}

EMSCRIPTEN_KEEPALIVE
int64 distance_set_bigint_w(const Set * s, int64 i) {
  return distance_set_bigint(s, i);
}

EMSCRIPTEN_KEEPALIVE
int distance_set_date_w(const Set * s, DateADT d) {
  return distance_set_date(s, d);
}

EMSCRIPTEN_KEEPALIVE
double distance_set_float_w(const Set * s, double d) {
  return distance_set_float(s, d);
}

EMSCRIPTEN_KEEPALIVE
int distance_set_int_w(const Set * s, int i) {
  return distance_set_int(s, i);
}

EMSCRIPTEN_KEEPALIVE
double distance_set_timestamptz_w(const Set * s, long long t) {
  return distance_set_timestamptz(s, (TimestampTz) t);
}

EMSCRIPTEN_KEEPALIVE
int64 distance_span_bigint_w(const Span * s, int64 i) {
  return distance_span_bigint(s, i);
}

EMSCRIPTEN_KEEPALIVE
int distance_span_date_w(const Span * s, DateADT d) {
  return distance_span_date(s, d);
}

EMSCRIPTEN_KEEPALIVE
double distance_span_float_w(const Span * s, double d) {
  return distance_span_float(s, d);
}

EMSCRIPTEN_KEEPALIVE
int distance_span_int_w(const Span * s, int i) {
  return distance_span_int(s, i);
}

EMSCRIPTEN_KEEPALIVE
double distance_span_timestamptz_w(const Span * s, long long t) {
  return distance_span_timestamptz(s, (TimestampTz) t);
}

EMSCRIPTEN_KEEPALIVE
int64 distance_spanset_bigint_w(const SpanSet * ss, int64 i) {
  return distance_spanset_bigint(ss, i);
}

EMSCRIPTEN_KEEPALIVE
int distance_spanset_date_w(const SpanSet * ss, DateADT d) {
  return distance_spanset_date(ss, d);
}

EMSCRIPTEN_KEEPALIVE
double distance_spanset_float_w(const SpanSet * ss, double d) {
  return distance_spanset_float(ss, d);
}

EMSCRIPTEN_KEEPALIVE
int distance_spanset_int_w(const SpanSet * ss, int i) {
  return distance_spanset_int(ss, i);
}

EMSCRIPTEN_KEEPALIVE
double distance_spanset_timestamptz_w(const SpanSet * ss, long long t) {
  return distance_spanset_timestamptz(ss, (TimestampTz) t);
}

EMSCRIPTEN_KEEPALIVE
double distance_tstzset_tstzset_w(const Set * s1, const Set * s2) {
  return distance_tstzset_tstzset(s1, s2);
}

EMSCRIPTEN_KEEPALIVE
double distance_tstzspan_tstzspan_w(const Span * s1, const Span * s2) {
  return distance_tstzspan_tstzspan(s1, s2);
}

EMSCRIPTEN_KEEPALIVE
double distance_tstzspanset_tstzspan_w(const SpanSet * ss, const Span * s) {
  return distance_tstzspanset_tstzspan(ss, s);
}

EMSCRIPTEN_KEEPALIVE
double distance_tstzspanset_tstzspanset_w(const SpanSet * ss1, const SpanSet * ss2) {
  return distance_tstzspanset_tstzspanset(ss1, ss2);
}

EMSCRIPTEN_KEEPALIVE
Span * bigint_extent_transfn_w(Span * state, int64 i) {
  return bigint_extent_transfn(state, i);
}

EMSCRIPTEN_KEEPALIVE
Set * bigint_union_transfn_w(Set * state, int64 i) {
  return bigint_union_transfn(state, i);
}

EMSCRIPTEN_KEEPALIVE
Span * date_extent_transfn_w(Span * state, DateADT d) {
  return date_extent_transfn(state, d);
}

EMSCRIPTEN_KEEPALIVE
Set * date_union_transfn_w(Set * state, DateADT d) {
  return date_union_transfn(state, d);
}

EMSCRIPTEN_KEEPALIVE
Span * float_extent_transfn_w(Span * state, double d) {
  return float_extent_transfn(state, d);
}

EMSCRIPTEN_KEEPALIVE
Set * float_union_transfn_w(Set * state, double d) {
  return float_union_transfn(state, d);
}

EMSCRIPTEN_KEEPALIVE
Span * int_extent_transfn_w(Span * state, int i) {
  return int_extent_transfn(state, i);
}

EMSCRIPTEN_KEEPALIVE
Set * int_union_transfn_w(Set * state, int32 i) {
  return int_union_transfn(state, i);
}

EMSCRIPTEN_KEEPALIVE
Span * set_extent_transfn_w(Span * state, const Set * s) {
  return set_extent_transfn(state, s);
}

EMSCRIPTEN_KEEPALIVE
Set * set_union_finalfn_w(Set * state) {
  return set_union_finalfn(state);
}

EMSCRIPTEN_KEEPALIVE
Set * set_union_transfn_w(Set * state, Set * s) {
  return set_union_transfn(state, s);
}

EMSCRIPTEN_KEEPALIVE
Span * span_extent_transfn_w(Span * state, const Span * s) {
  return span_extent_transfn(state, s);
}

EMSCRIPTEN_KEEPALIVE
SpanSet * span_union_transfn_w(SpanSet * state, const Span * s) {
  return span_union_transfn(state, s);
}

EMSCRIPTEN_KEEPALIVE
Span * spanset_extent_transfn_w(Span * state, const SpanSet * ss) {
  return spanset_extent_transfn(state, ss);
}

EMSCRIPTEN_KEEPALIVE
SpanSet * spanset_union_finalfn_w(SpanSet * state) {
  return spanset_union_finalfn(state);
}

EMSCRIPTEN_KEEPALIVE
SpanSet * spanset_union_transfn_w(SpanSet * state, const SpanSet * ss) {
  return spanset_union_transfn(state, ss);
}

EMSCRIPTEN_KEEPALIVE
Set * text_union_transfn_w(Set * state, const char * txt) {
  return text_union_transfn(state, cstring2text(txt));
}

EMSCRIPTEN_KEEPALIVE
Span * timestamptz_extent_transfn_w(Span * state, long long t) {
  return timestamptz_extent_transfn(state, (TimestampTz) t);
}

EMSCRIPTEN_KEEPALIVE
Set * timestamptz_union_transfn_w(Set * state, long long t) {
  return timestamptz_union_transfn(state, (TimestampTz) t);
}

EMSCRIPTEN_KEEPALIVE
int64 bigint_get_bin_w(int64 value, int64 vsize, int64 vorigin) {
  return bigint_get_bin(value, vsize, vorigin);
}

EMSCRIPTEN_KEEPALIVE
Span * bigintspan_bins_w(const Span * s, int64 vsize, int64 vorigin, int * count) {
  return bigintspan_bins(s, vsize, vorigin, count);
}

EMSCRIPTEN_KEEPALIVE
Span * bigintspanset_bins_w(const SpanSet * ss, int64 vsize, int64 vorigin, int * count) {
  return bigintspanset_bins(ss, vsize, vorigin, count);
}

EMSCRIPTEN_KEEPALIVE
DateADT date_get_bin_w(DateADT d, const Interval * duration, DateADT torigin) {
  return date_get_bin(d, duration, torigin);
}

EMSCRIPTEN_KEEPALIVE
Span * datespan_bins_w(const Span * s, const Interval * duration, DateADT torigin, int * count) {
  return datespan_bins(s, duration, torigin, count);
}

EMSCRIPTEN_KEEPALIVE
Span * datespanset_bins_w(const SpanSet * ss, const Interval * duration, DateADT torigin, int * count) {
  return datespanset_bins(ss, duration, torigin, count);
}

EMSCRIPTEN_KEEPALIVE
double float_get_bin_w(double value, double vsize, double vorigin) {
  return float_get_bin(value, vsize, vorigin);
}

EMSCRIPTEN_KEEPALIVE
Span * floatspan_bins_w(const Span * s, double vsize, double vorigin, int * count) {
  return floatspan_bins(s, vsize, vorigin, count);
}

EMSCRIPTEN_KEEPALIVE
Span * floatspanset_bins_w(const SpanSet * ss, double vsize, double vorigin, int * count) {
  return floatspanset_bins(ss, vsize, vorigin, count);
}

EMSCRIPTEN_KEEPALIVE
int int_get_bin_w(int value, int vsize, int vorigin) {
  return int_get_bin(value, vsize, vorigin);
}

EMSCRIPTEN_KEEPALIVE
Span * intspan_bins_w(const Span * s, int vsize, int vorigin, int * count) {
  return intspan_bins(s, vsize, vorigin, count);
}

EMSCRIPTEN_KEEPALIVE
Span * intspanset_bins_w(const SpanSet * ss, int vsize, int vorigin, int * count) {
  return intspanset_bins(ss, vsize, vorigin, count);
}

EMSCRIPTEN_KEEPALIVE
long long timestamptz_get_bin_w(long long t, const Interval * duration, long long torigin) {
  return timestamptz_get_bin((TimestampTz) t, duration, (TimestampTz) torigin);
}

EMSCRIPTEN_KEEPALIVE
Span * tstzspan_bins_w(const Span * s, const Interval * duration, long long origin, int * count) {
  return tstzspan_bins(s, duration, (TimestampTz) origin, count);
}

EMSCRIPTEN_KEEPALIVE
Span * tstzspanset_bins_w(const SpanSet * ss, const Interval * duration, long long torigin, int * count) {
  return tstzspanset_bins(ss, duration, (TimestampTz) torigin, count);
}

EMSCRIPTEN_KEEPALIVE
char * tbox_as_hexwkb_w(const TBox * box, uint8_t variant, int * size) {
  return tbox_as_hexwkb(box, variant, size);
}

EMSCRIPTEN_KEEPALIVE
uint8_t * tbox_as_wkb_w(const TBox * box, uint8_t variant, int * size_out) {
  return tbox_as_wkb(box, variant, size_out);
}

EMSCRIPTEN_KEEPALIVE
TBox * tbox_from_hexwkb_w(const char * hexwkb) {
  return tbox_from_hexwkb(hexwkb);
}

EMSCRIPTEN_KEEPALIVE
TBox * tbox_from_wkb_w(const uint8_t * wkb, int size) {
  return tbox_from_wkb(wkb, size);
}

EMSCRIPTEN_KEEPALIVE
TBox * tbox_in_w(const char * str) {
  return tbox_in(str);
}

EMSCRIPTEN_KEEPALIVE
char * tbox_out_w(const TBox * box, int maxdd) {
  return tbox_out(box, maxdd);
}

EMSCRIPTEN_KEEPALIVE
TBox * float_timestamptz_to_tbox_w(double d, long long t) {
  return float_timestamptz_to_tbox(d, (TimestampTz) t);
}

EMSCRIPTEN_KEEPALIVE
TBox * float_tstzspan_to_tbox_w(double d, const Span * s) {
  return float_tstzspan_to_tbox(d, s);
}

EMSCRIPTEN_KEEPALIVE
TBox * int_timestamptz_to_tbox_w(int i, long long t) {
  return int_timestamptz_to_tbox(i, (TimestampTz) t);
}

EMSCRIPTEN_KEEPALIVE
TBox * int_tstzspan_to_tbox_w(int i, const Span * s) {
  return int_tstzspan_to_tbox(i, s);
}

EMSCRIPTEN_KEEPALIVE
TBox * numspan_tstzspan_to_tbox_w(const Span * span, const Span * s) {
  return numspan_tstzspan_to_tbox(span, s);
}

EMSCRIPTEN_KEEPALIVE
TBox * numspan_timestamptz_to_tbox_w(const Span * span, long long t) {
  return numspan_timestamptz_to_tbox(span, (TimestampTz) t);
}

EMSCRIPTEN_KEEPALIVE
TBox * tbox_copy_w(const TBox * box) {
  return tbox_copy(box);
}

EMSCRIPTEN_KEEPALIVE
TBox * tbox_make_w(const Span * s, const Span * p) {
  return tbox_make(s, p);
}

EMSCRIPTEN_KEEPALIVE
TBox * float_to_tbox_w(double d) {
  return float_to_tbox(d);
}

EMSCRIPTEN_KEEPALIVE
TBox * int_to_tbox_w(int i) {
  return int_to_tbox(i);
}

EMSCRIPTEN_KEEPALIVE
TBox * set_to_tbox_w(const Set * s) {
  return set_to_tbox(s);
}

EMSCRIPTEN_KEEPALIVE
TBox * span_to_tbox_w(const Span * s) {
  return span_to_tbox(s);
}

EMSCRIPTEN_KEEPALIVE
TBox * spanset_to_tbox_w(const SpanSet * ss) {
  return spanset_to_tbox(ss);
}

EMSCRIPTEN_KEEPALIVE
Span * tbox_to_intspan_w(const TBox * box) {
  return tbox_to_intspan(box);
}

EMSCRIPTEN_KEEPALIVE
Span * tbox_to_floatspan_w(const TBox * box) {
  return tbox_to_floatspan(box);
}

EMSCRIPTEN_KEEPALIVE
Span * tbox_to_tstzspan_w(const TBox * box) {
  return tbox_to_tstzspan(box);
}

EMSCRIPTEN_KEEPALIVE
TBox * timestamptz_to_tbox_w(long long t) {
  return timestamptz_to_tbox((TimestampTz) t);
}

EMSCRIPTEN_KEEPALIVE
uint32 tbox_hash_w(const TBox * box) {
  return tbox_hash(box);
}

EMSCRIPTEN_KEEPALIVE
uint64 tbox_hash_extended_w(const TBox * box, uint64 seed) {
  return tbox_hash_extended(box, seed);
}

EMSCRIPTEN_KEEPALIVE
int tbox_hast_w(const TBox * box) {
  return (int) tbox_hast(box);
}

EMSCRIPTEN_KEEPALIVE
int tbox_hasx_w(const TBox * box) {
  return (int) tbox_hasx(box);
}

EMSCRIPTEN_KEEPALIVE
long long tbox_tmax_w(const TBox * box) {
  TimestampTz r;
  if (!tbox_tmax(box, &r)) return 0;
  return (long long) r;
}

EMSCRIPTEN_KEEPALIVE
int tbox_tmax_inc_w(const TBox * box) {
  bool r;
  if (!tbox_tmax_inc(box, &r)) return 0;
  return (int) r;
}

EMSCRIPTEN_KEEPALIVE
long long tbox_tmin_w(const TBox * box) {
  TimestampTz r;
  if (!tbox_tmin(box, &r)) return 0;
  return (long long) r;
}

EMSCRIPTEN_KEEPALIVE
int tbox_tmin_inc_w(const TBox * box) {
  bool r;
  if (!tbox_tmin_inc(box, &r)) return 0;
  return (int) r;
}

EMSCRIPTEN_KEEPALIVE
double tbox_xmax_w(const TBox * box) {
  double r;
  if (!tbox_xmax(box, &r)) return 0.0;
  return r;
}

EMSCRIPTEN_KEEPALIVE
int tbox_xmax_inc_w(const TBox * box) {
  bool r;
  if (!tbox_xmax_inc(box, &r)) return 0;
  return (int) r;
}

EMSCRIPTEN_KEEPALIVE
double tbox_xmin_w(const TBox * box) {
  double r;
  if (!tbox_xmin(box, &r)) return 0.0;
  return r;
}

EMSCRIPTEN_KEEPALIVE
int tbox_xmin_inc_w(const TBox * box) {
  bool r;
  if (!tbox_xmin_inc(box, &r)) return 0;
  return (int) r;
}

EMSCRIPTEN_KEEPALIVE
double tboxfloat_xmax_w(const TBox * box) {
  double r;
  if (!tboxfloat_xmax(box, &r)) return 0.0;
  return r;
}

EMSCRIPTEN_KEEPALIVE
double tboxfloat_xmin_w(const TBox * box) {
  double r;
  if (!tboxfloat_xmin(box, &r)) return 0.0;
  return r;
}

EMSCRIPTEN_KEEPALIVE
int tboxint_xmax_w(const TBox * box) {
  int r;
  if (!tboxint_xmax(box, &r)) return 0;
  return r;
}

EMSCRIPTEN_KEEPALIVE
int tboxint_xmin_w(const TBox * box) {
  int r;
  if (!tboxint_xmin(box, &r)) return 0;
  return r;
}

EMSCRIPTEN_KEEPALIVE
TBox * tbox_expand_time_w(const TBox * box, const Interval * interv) {
  return tbox_expand_time(box, interv);
}

EMSCRIPTEN_KEEPALIVE
TBox * tbox_round_w(const TBox * box, int maxdd) {
  return tbox_round(box, maxdd);
}

EMSCRIPTEN_KEEPALIVE
TBox * tbox_shift_scale_time_w(const TBox * box, const Interval * shift, const Interval * duration) {
  return tbox_shift_scale_time(box, shift, duration);
}

EMSCRIPTEN_KEEPALIVE
TBox * tfloatbox_expand_w(const TBox * box, double d) {
  return tfloatbox_expand(box, d);
}

EMSCRIPTEN_KEEPALIVE
TBox * tfloatbox_shift_scale_w(const TBox * box, double shift, double width, int hasshift, int haswidth) {
  return tfloatbox_shift_scale(box, shift, width, (bool) hasshift, (bool) haswidth);
}

EMSCRIPTEN_KEEPALIVE
TBox * tintbox_expand_w(const TBox * box, int i) {
  return tintbox_expand(box, i);
}

EMSCRIPTEN_KEEPALIVE
TBox * tintbox_shift_scale_w(const TBox * box, int shift, int width, int hasshift, int haswidth) {
  return tintbox_shift_scale(box, shift, width, (bool) hasshift, (bool) haswidth);
}

EMSCRIPTEN_KEEPALIVE
TBox * union_tbox_tbox_w(const TBox * box1, const TBox * box2, int strict) {
  return union_tbox_tbox(box1, box2, (bool) strict);
}

EMSCRIPTEN_KEEPALIVE
TBox * intersection_tbox_tbox_w(const TBox * box1, const TBox * box2) {
  return intersection_tbox_tbox(box1, box2);
}

EMSCRIPTEN_KEEPALIVE
int adjacent_tbox_tbox_w(const TBox * box1, const TBox * box2) {
  return (int) adjacent_tbox_tbox(box1, box2);
}

EMSCRIPTEN_KEEPALIVE
int contained_tbox_tbox_w(const TBox * box1, const TBox * box2) {
  return (int) contained_tbox_tbox(box1, box2);
}

EMSCRIPTEN_KEEPALIVE
int contains_tbox_tbox_w(const TBox * box1, const TBox * box2) {
  return (int) contains_tbox_tbox(box1, box2);
}

EMSCRIPTEN_KEEPALIVE
int overlaps_tbox_tbox_w(const TBox * box1, const TBox * box2) {
  return (int) overlaps_tbox_tbox(box1, box2);
}

EMSCRIPTEN_KEEPALIVE
int same_tbox_tbox_w(const TBox * box1, const TBox * box2) {
  return (int) same_tbox_tbox(box1, box2);
}

EMSCRIPTEN_KEEPALIVE
int after_tbox_tbox_w(const TBox * box1, const TBox * box2) {
  return (int) after_tbox_tbox(box1, box2);
}

EMSCRIPTEN_KEEPALIVE
int before_tbox_tbox_w(const TBox * box1, const TBox * box2) {
  return (int) before_tbox_tbox(box1, box2);
}

EMSCRIPTEN_KEEPALIVE
int left_tbox_tbox_w(const TBox * box1, const TBox * box2) {
  return (int) left_tbox_tbox(box1, box2);
}

EMSCRIPTEN_KEEPALIVE
int overafter_tbox_tbox_w(const TBox * box1, const TBox * box2) {
  return (int) overafter_tbox_tbox(box1, box2);
}

EMSCRIPTEN_KEEPALIVE
int overbefore_tbox_tbox_w(const TBox * box1, const TBox * box2) {
  return (int) overbefore_tbox_tbox(box1, box2);
}

EMSCRIPTEN_KEEPALIVE
int overleft_tbox_tbox_w(const TBox * box1, const TBox * box2) {
  return (int) overleft_tbox_tbox(box1, box2);
}

EMSCRIPTEN_KEEPALIVE
int overright_tbox_tbox_w(const TBox * box1, const TBox * box2) {
  return (int) overright_tbox_tbox(box1, box2);
}

EMSCRIPTEN_KEEPALIVE
int right_tbox_tbox_w(const TBox * box1, const TBox * box2) {
  return (int) right_tbox_tbox(box1, box2);
}

EMSCRIPTEN_KEEPALIVE
int tbox_cmp_w(const TBox * box1, const TBox * box2) {
  return tbox_cmp(box1, box2);
}

EMSCRIPTEN_KEEPALIVE
int tbox_eq_w(const TBox * box1, const TBox * box2) {
  return (int) tbox_eq(box1, box2);
}

EMSCRIPTEN_KEEPALIVE
int tbox_ge_w(const TBox * box1, const TBox * box2) {
  return (int) tbox_ge(box1, box2);
}

EMSCRIPTEN_KEEPALIVE
int tbox_gt_w(const TBox * box1, const TBox * box2) {
  return (int) tbox_gt(box1, box2);
}

EMSCRIPTEN_KEEPALIVE
int tbox_le_w(const TBox * box1, const TBox * box2) {
  return (int) tbox_le(box1, box2);
}

EMSCRIPTEN_KEEPALIVE
int tbox_lt_w(const TBox * box1, const TBox * box2) {
  return (int) tbox_lt(box1, box2);
}

EMSCRIPTEN_KEEPALIVE
int tbox_ne_w(const TBox * box1, const TBox * box2) {
  return (int) tbox_ne(box1, box2);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tbool_from_mfjson_w(const char * str) {
  return tbool_from_mfjson(str);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tbool_in_w(const char * str) {
  return tbool_in(str);
}

EMSCRIPTEN_KEEPALIVE
char * tbool_out_w(const Temporal * temp) {
  return tbool_out(temp);
}

EMSCRIPTEN_KEEPALIVE
uint8_t * temporal_as_wkb_w(const Temporal * temp, uint8_t variant, int * size_out) {
  return temporal_as_wkb(temp, variant, size_out);
}

EMSCRIPTEN_KEEPALIVE
Temporal * temporal_from_hexwkb_w(const char * hexwkb) {
  return temporal_from_hexwkb(hexwkb);
}

EMSCRIPTEN_KEEPALIVE
Temporal * temporal_from_wkb_w(const uint8_t * wkb, int size) {
  return temporal_from_wkb(wkb, size);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tfloat_from_mfjson_w(const char * str) {
  return tfloat_from_mfjson(str);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tfloat_in_w(const char * str) {
  return tfloat_in(str);
}

EMSCRIPTEN_KEEPALIVE
char * tfloat_out_w(const Temporal * temp, int maxdd) {
  return tfloat_out(temp, maxdd);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tint_from_mfjson_w(const char * str) {
  return tint_from_mfjson(str);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tint_in_w(const char * str) {
  return tint_in(str);
}

EMSCRIPTEN_KEEPALIVE
char * tint_out_w(const Temporal * temp) {
  return tint_out(temp);
}

EMSCRIPTEN_KEEPALIVE
Temporal * ttext_from_mfjson_w(const char * str) {
  return ttext_from_mfjson(str);
}

EMSCRIPTEN_KEEPALIVE
Temporal * ttext_in_w(const char * str) {
  return ttext_in(str);
}

EMSCRIPTEN_KEEPALIVE
char * ttext_out_w(const Temporal * temp) {
  return ttext_out(temp);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tbool_from_base_temp_w(int b, const Temporal * temp) {
  return tbool_from_base_temp((bool) b, temp);
}

EMSCRIPTEN_KEEPALIVE
TInstant * tboolinst_make_w(int b, long long t) {
  return tboolinst_make((bool) b, (TimestampTz) t);
}

EMSCRIPTEN_KEEPALIVE
TSequence * tboolseq_from_base_tstzset_w(int b, const Set * s) {
  return tboolseq_from_base_tstzset((bool) b, s);
}

EMSCRIPTEN_KEEPALIVE
TSequence * tboolseq_from_base_tstzspan_w(int b, const Span * s) {
  return tboolseq_from_base_tstzspan((bool) b, s);
}

EMSCRIPTEN_KEEPALIVE
TSequenceSet * tboolseqset_from_base_tstzspanset_w(int b, const SpanSet * ss) {
  return tboolseqset_from_base_tstzspanset((bool) b, ss);
}

EMSCRIPTEN_KEEPALIVE
Temporal * temporal_copy_w(const Temporal * temp) {
  return temporal_copy(temp);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tfloat_from_base_temp_w(double d, const Temporal * temp) {
  return tfloat_from_base_temp(d, temp);
}

EMSCRIPTEN_KEEPALIVE
TInstant * tfloatinst_make_w(double d, long long t) {
  return tfloatinst_make(d, (TimestampTz) t);
}

EMSCRIPTEN_KEEPALIVE
TSequence * tfloatseq_from_base_tstzset_w(double d, const Set * s) {
  return tfloatseq_from_base_tstzset(d, s);
}

EMSCRIPTEN_KEEPALIVE
TSequence * tfloatseq_from_base_tstzspan_w(double d, const Span * s, interpType interp) {
  return tfloatseq_from_base_tstzspan(d, s, interp);
}

EMSCRIPTEN_KEEPALIVE
TSequenceSet * tfloatseqset_from_base_tstzspanset_w(double d, const SpanSet * ss, interpType interp) {
  return tfloatseqset_from_base_tstzspanset(d, ss, interp);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tint_from_base_temp_w(int i, const Temporal * temp) {
  return tint_from_base_temp(i, temp);
}

EMSCRIPTEN_KEEPALIVE
TInstant * tintinst_make_w(int i, long long t) {
  return tintinst_make(i, (TimestampTz) t);
}

EMSCRIPTEN_KEEPALIVE
TSequence * tintseq_from_base_tstzset_w(int i, const Set * s) {
  return tintseq_from_base_tstzset(i, s);
}

EMSCRIPTEN_KEEPALIVE
TSequence * tintseq_from_base_tstzspan_w(int i, const Span * s) {
  return tintseq_from_base_tstzspan(i, s);
}

EMSCRIPTEN_KEEPALIVE
TSequenceSet * tintseqset_from_base_tstzspanset_w(int i, const SpanSet * ss) {
  return tintseqset_from_base_tstzspanset(i, ss);
}

EMSCRIPTEN_KEEPALIVE
TSequence * tsequence_make_w(TInstant ** instants, int count, int lower_inc, int upper_inc, interpType interp, int normalize) {
  return tsequence_make(instants, count, (bool) lower_inc, (bool) upper_inc, interp, (bool) normalize);
}

EMSCRIPTEN_KEEPALIVE
TSequenceSet * tsequenceset_make_w(TSequence ** sequences, int count, int normalize) {
  return tsequenceset_make(sequences, count, (bool) normalize);
}

EMSCRIPTEN_KEEPALIVE
TSequenceSet * tsequenceset_make_gaps_w(TInstant ** instants, int count, interpType interp, const Interval * maxt, double maxdist) {
  return tsequenceset_make_gaps(instants, count, interp, maxt, maxdist);
}

EMSCRIPTEN_KEEPALIVE
Temporal * ttext_from_base_temp_w(const char * txt, const Temporal * temp) {
  return ttext_from_base_temp(cstring2text(txt), temp);
}

EMSCRIPTEN_KEEPALIVE
TInstant * ttextinst_make_w(const char * txt, long long t) {
  return ttextinst_make(cstring2text(txt), (TimestampTz) t);
}

EMSCRIPTEN_KEEPALIVE
TSequence * ttextseq_from_base_tstzset_w(const char * txt, const Set * s) {
  return ttextseq_from_base_tstzset(cstring2text(txt), s);
}

EMSCRIPTEN_KEEPALIVE
TSequence * ttextseq_from_base_tstzspan_w(const char * txt, const Span * s) {
  return ttextseq_from_base_tstzspan(cstring2text(txt), s);
}

EMSCRIPTEN_KEEPALIVE
TSequenceSet * ttextseqset_from_base_tstzspanset_w(const char * txt, const SpanSet * ss) {
  return ttextseqset_from_base_tstzspanset(cstring2text(txt), ss);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tbool_to_tint_w(const Temporal * temp) {
  return tbool_to_tint(temp);
}

EMSCRIPTEN_KEEPALIVE
Span * temporal_to_tstzspan_w(const Temporal * temp) {
  return temporal_to_tstzspan(temp);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tfloat_to_tint_w(const Temporal * temp) {
  return tfloat_to_tint(temp);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tint_to_tfloat_w(const Temporal * temp) {
  return tint_to_tfloat(temp);
}

EMSCRIPTEN_KEEPALIVE
Span * tnumber_to_span_w(const Temporal * temp) {
  return tnumber_to_span(temp);
}

EMSCRIPTEN_KEEPALIVE
TBox * tnumber_to_tbox_w(const Temporal * temp) {
  return tnumber_to_tbox(temp);
}

EMSCRIPTEN_KEEPALIVE
int tbool_end_value_w(const Temporal * temp) {
  return (int) tbool_end_value(temp);
}

EMSCRIPTEN_KEEPALIVE
int tbool_start_value_w(const Temporal * temp) {
  return (int) tbool_start_value(temp);
}

EMSCRIPTEN_KEEPALIVE
int tbool_value_at_timestamptz_w(const Temporal * temp, long long t, int strict, bool * value) {
  return (int) tbool_value_at_timestamptz(temp, (TimestampTz) t, (bool) strict, value);
}

EMSCRIPTEN_KEEPALIVE
int tbool_value_n_w(const Temporal * temp, int n) {
  bool r;
  if (!tbool_value_n(temp, n, &r)) return 0;
  return (int) r;
}

EMSCRIPTEN_KEEPALIVE
bool * tbool_values_w(const Temporal * temp, int * count) {
  return tbool_values(temp, count);
}

EMSCRIPTEN_KEEPALIVE
TInstant * temporal_end_instant_w(const Temporal * temp) {
  return temporal_end_instant(temp);
}

EMSCRIPTEN_KEEPALIVE
TSequence * temporal_end_sequence_w(const Temporal * temp) {
  return temporal_end_sequence(temp);
}

EMSCRIPTEN_KEEPALIVE
long long temporal_end_timestamptz_w(const Temporal * temp) {
  return temporal_end_timestamptz(temp);
}

EMSCRIPTEN_KEEPALIVE
uint32 temporal_hash_w(const Temporal * temp) {
  return temporal_hash(temp);
}

EMSCRIPTEN_KEEPALIVE
TInstant ** temporal_instants_w(const Temporal * temp, int * count) {
  return temporal_instants(temp, count);
}

EMSCRIPTEN_KEEPALIVE
const char * temporal_interp_w(const Temporal * temp) {
  return temporal_interp(temp);
}

EMSCRIPTEN_KEEPALIVE
int temporal_lower_inc_w(const Temporal * temp) {
  return (int) temporal_lower_inc(temp);
}

EMSCRIPTEN_KEEPALIVE
TInstant * temporal_max_instant_w(const Temporal * temp) {
  return temporal_max_instant(temp);
}

EMSCRIPTEN_KEEPALIVE
TInstant * temporal_min_instant_w(const Temporal * temp) {
  return temporal_min_instant(temp);
}

EMSCRIPTEN_KEEPALIVE
int temporal_num_instants_w(const Temporal * temp) {
  return temporal_num_instants(temp);
}

EMSCRIPTEN_KEEPALIVE
int temporal_num_sequences_w(const Temporal * temp) {
  return temporal_num_sequences(temp);
}

EMSCRIPTEN_KEEPALIVE
int temporal_num_timestamps_w(const Temporal * temp) {
  return temporal_num_timestamps(temp);
}

EMSCRIPTEN_KEEPALIVE
TSequenceSet * temporal_segm_duration_w(const Temporal * temp, const Interval * duration, int atleast, int strict) {
  return temporal_segm_duration(temp, duration, (bool) atleast, (bool) strict);
}

EMSCRIPTEN_KEEPALIVE
TSequence ** temporal_segments_w(const Temporal * temp, int * count) {
  return temporal_segments(temp, count);
}

EMSCRIPTEN_KEEPALIVE
TSequence * temporal_sequence_n_w(const Temporal * temp, int i) {
  return temporal_sequence_n(temp, i);
}

EMSCRIPTEN_KEEPALIVE
TSequence ** temporal_sequences_w(const Temporal * temp, int * count) {
  return temporal_sequences(temp, count);
}

EMSCRIPTEN_KEEPALIVE
TInstant * temporal_start_instant_w(const Temporal * temp) {
  return temporal_start_instant(temp);
}

EMSCRIPTEN_KEEPALIVE
TSequence * temporal_start_sequence_w(const Temporal * temp) {
  return temporal_start_sequence(temp);
}

EMSCRIPTEN_KEEPALIVE
long long temporal_start_timestamptz_w(const Temporal * temp) {
  return temporal_start_timestamptz(temp);
}

EMSCRIPTEN_KEEPALIVE
TSequenceSet * temporal_stops_w(const Temporal * temp, double maxdist, const Interval * minduration) {
  return temporal_stops(temp, maxdist, minduration);
}

EMSCRIPTEN_KEEPALIVE
const char * temporal_subtype_w(const Temporal * temp) {
  return temporal_subtype(temp);
}

EMSCRIPTEN_KEEPALIVE
SpanSet * temporal_time_w(const Temporal * temp) {
  return temporal_time(temp);
}

EMSCRIPTEN_KEEPALIVE
TimestampTz * temporal_timestamps_w(const Temporal * temp, int * count) {
  return temporal_timestamps(temp, count);
}

EMSCRIPTEN_KEEPALIVE
long long temporal_timestamptz_n_w(const Temporal * temp, int n) {
  TimestampTz r;
  if (!temporal_timestamptz_n(temp, n, &r)) return 0;
  return (long long) r;
}

EMSCRIPTEN_KEEPALIVE
int temporal_upper_inc_w(const Temporal * temp) {
  return (int) temporal_upper_inc(temp);
}

EMSCRIPTEN_KEEPALIVE
double tfloat_end_value_w(const Temporal * temp) {
  return tfloat_end_value(temp);
}

EMSCRIPTEN_KEEPALIVE
double tfloat_min_value_w(const Temporal * temp) {
  return tfloat_min_value(temp);
}

EMSCRIPTEN_KEEPALIVE
double tfloat_max_value_w(const Temporal * temp) {
  return tfloat_max_value(temp);
}

EMSCRIPTEN_KEEPALIVE
double tfloat_start_value_w(const Temporal * temp) {
  return tfloat_start_value(temp);
}

EMSCRIPTEN_KEEPALIVE
int tfloat_value_at_timestamptz_w(const Temporal * temp, long long t, int strict, double * value) {
  return (int) tfloat_value_at_timestamptz(temp, (TimestampTz) t, (bool) strict, value);
}

EMSCRIPTEN_KEEPALIVE
double tfloat_value_n_w(const Temporal * temp, int n) {
  double r;
  if (!tfloat_value_n(temp, n, &r)) return 0.0;
  return r;
}

EMSCRIPTEN_KEEPALIVE
double * tfloat_values_w(const Temporal * temp, int * count) {
  return tfloat_values(temp, count);
}

EMSCRIPTEN_KEEPALIVE
int tint_end_value_w(const Temporal * temp) {
  return tint_end_value(temp);
}

EMSCRIPTEN_KEEPALIVE
int tint_max_value_w(const Temporal * temp) {
  return tint_max_value(temp);
}

EMSCRIPTEN_KEEPALIVE
int tint_min_value_w(const Temporal * temp) {
  return tint_min_value(temp);
}

EMSCRIPTEN_KEEPALIVE
int tint_start_value_w(const Temporal * temp) {
  return tint_start_value(temp);
}

EMSCRIPTEN_KEEPALIVE
int tint_value_at_timestamptz_w(const Temporal * temp, long long t, int strict, int * value) {
  return (int) tint_value_at_timestamptz(temp, (TimestampTz) t, (bool) strict, value);
}

EMSCRIPTEN_KEEPALIVE
int tint_value_n_w(const Temporal * temp, int n) {
  int r;
  if (!tint_value_n(temp, n, &r)) return 0;
  return r;
}

EMSCRIPTEN_KEEPALIVE
int * tint_values_w(const Temporal * temp, int * count) {
  return tint_values(temp, count);
}

EMSCRIPTEN_KEEPALIVE
double tnumber_avg_value_w(const Temporal * temp) {
  return tnumber_avg_value(temp);
}

EMSCRIPTEN_KEEPALIVE
double tnumber_integral_w(const Temporal * temp) {
  return tnumber_integral(temp);
}

EMSCRIPTEN_KEEPALIVE
double tnumber_twavg_w(const Temporal * temp) {
  return tnumber_twavg(temp);
}

EMSCRIPTEN_KEEPALIVE
SpanSet * tnumber_valuespans_w(const Temporal * temp) {
  return tnumber_valuespans(temp);
}

EMSCRIPTEN_KEEPALIVE
char * ttext_end_value_w(const Temporal * temp) {
  text *_t = ttext_end_value(temp);
  if (!_t) return NULL;
  return text2cstring(_t);
}

EMSCRIPTEN_KEEPALIVE
char * ttext_max_value_w(const Temporal * temp) {
  text *_t = ttext_max_value(temp);
  if (!_t) return NULL;
  return text2cstring(_t);
}

EMSCRIPTEN_KEEPALIVE
char * ttext_min_value_w(const Temporal * temp) {
  text *_t = ttext_min_value(temp);
  if (!_t) return NULL;
  return text2cstring(_t);
}

EMSCRIPTEN_KEEPALIVE
char * ttext_start_value_w(const Temporal * temp) {
  text *_t = ttext_start_value(temp);
  if (!_t) return NULL;
  return text2cstring(_t);
}

EMSCRIPTEN_KEEPALIVE
int ttext_value_at_timestamptz_w(const Temporal * temp, long long t, int strict, text ** value) {
  return (int) ttext_value_at_timestamptz(temp, (TimestampTz) t, (bool) strict, value);
}

EMSCRIPTEN_KEEPALIVE
text * ttext_value_n_w(const Temporal * temp, int n) {
  text * r;
  if (!ttext_value_n(temp, n, &r)) return NULL;
  return r;
}

EMSCRIPTEN_KEEPALIVE
text ** ttext_values_w(const Temporal * temp, int * count) {
  return ttext_values(temp, count);
}

EMSCRIPTEN_KEEPALIVE
double float_degrees_w(double value, int normalize) {
  return float_degrees(value, (bool) normalize);
}

EMSCRIPTEN_KEEPALIVE
Temporal ** temparr_round_w(Temporal ** temp, int count, int maxdd) {
  return temparr_round(temp, count, maxdd);
}

EMSCRIPTEN_KEEPALIVE
Temporal * temporal_round_w(const Temporal * temp, int maxdd) {
  return temporal_round(temp, maxdd);
}

EMSCRIPTEN_KEEPALIVE
Temporal * temporal_scale_time_w(const Temporal * temp, const Interval * duration) {
  return temporal_scale_time(temp, duration);
}

EMSCRIPTEN_KEEPALIVE
Temporal * temporal_set_interp_w(const Temporal * temp, interpType interp) {
  return temporal_set_interp(temp, interp);
}

EMSCRIPTEN_KEEPALIVE
Temporal * temporal_shift_scale_time_w(const Temporal * temp, const Interval * shift, const Interval * duration) {
  return temporal_shift_scale_time(temp, shift, duration);
}

EMSCRIPTEN_KEEPALIVE
Temporal * temporal_shift_time_w(const Temporal * temp, const Interval * shift) {
  return temporal_shift_time(temp, shift);
}

EMSCRIPTEN_KEEPALIVE
TInstant * temporal_to_tinstant_w(const Temporal * temp) {
  return temporal_to_tinstant(temp);
}

EMSCRIPTEN_KEEPALIVE
TSequence * temporal_to_tsequence_w(const Temporal * temp, interpType interp) {
  return temporal_to_tsequence(temp, interp);
}

EMSCRIPTEN_KEEPALIVE
TSequenceSet * temporal_to_tsequenceset_w(const Temporal * temp, interpType interp) {
  return temporal_to_tsequenceset(temp, interp);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tfloat_ceil_w(const Temporal * temp) {
  return tfloat_ceil(temp);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tfloat_degrees_w(const Temporal * temp, int normalize) {
  return tfloat_degrees(temp, (bool) normalize);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tfloat_floor_w(const Temporal * temp) {
  return tfloat_floor(temp);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tfloat_radians_w(const Temporal * temp) {
  return tfloat_radians(temp);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tfloat_scale_value_w(const Temporal * temp, double width) {
  return tfloat_scale_value(temp, width);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tfloat_shift_scale_value_w(const Temporal * temp, double shift, double width) {
  return tfloat_shift_scale_value(temp, shift, width);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tfloat_shift_value_w(const Temporal * temp, double shift) {
  return tfloat_shift_value(temp, shift);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tint_scale_value_w(const Temporal * temp, int width) {
  return tint_scale_value(temp, width);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tint_shift_scale_value_w(const Temporal * temp, int shift, int width) {
  return tint_shift_scale_value(temp, shift, width);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tint_shift_value_w(const Temporal * temp, int shift) {
  return tint_shift_value(temp, shift);
}

EMSCRIPTEN_KEEPALIVE
Temporal * temporal_append_tinstant_w(Temporal * temp, const TInstant * inst, interpType interp, double maxdist, const Interval * maxt, int expand) {
  return temporal_append_tinstant(temp, inst, interp, maxdist, maxt, (bool) expand);
}

EMSCRIPTEN_KEEPALIVE
Temporal * temporal_append_tsequence_w(Temporal * temp, const TSequence * seq, int expand) {
  return temporal_append_tsequence(temp, seq, (bool) expand);
}

EMSCRIPTEN_KEEPALIVE
Temporal * temporal_delete_timestamptz_w(const Temporal * temp, long long t, int connect) {
  return temporal_delete_timestamptz(temp, (TimestampTz) t, (bool) connect);
}

EMSCRIPTEN_KEEPALIVE
Temporal * temporal_delete_tstzset_w(const Temporal * temp, const Set * s, int connect) {
  return temporal_delete_tstzset(temp, s, (bool) connect);
}

EMSCRIPTEN_KEEPALIVE
Temporal * temporal_delete_tstzspan_w(const Temporal * temp, const Span * s, int connect) {
  return temporal_delete_tstzspan(temp, s, (bool) connect);
}

EMSCRIPTEN_KEEPALIVE
Temporal * temporal_delete_tstzspanset_w(const Temporal * temp, const SpanSet * ss, int connect) {
  return temporal_delete_tstzspanset(temp, ss, (bool) connect);
}

EMSCRIPTEN_KEEPALIVE
Temporal * temporal_insert_w(const Temporal * temp1, const Temporal * temp2, int connect) {
  return temporal_insert(temp1, temp2, (bool) connect);
}

EMSCRIPTEN_KEEPALIVE
Temporal * temporal_merge_w(const Temporal * temp1, const Temporal * temp2) {
  return temporal_merge(temp1, temp2);
}

EMSCRIPTEN_KEEPALIVE
Temporal * temporal_merge_array_w(Temporal ** temparr, int count) {
  return temporal_merge_array(temparr, count);
}

EMSCRIPTEN_KEEPALIVE
Temporal * temporal_update_w(const Temporal * temp1, const Temporal * temp2, int connect) {
  return temporal_update(temp1, temp2, (bool) connect);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tbool_at_value_w(const Temporal * temp, int b) {
  return tbool_at_value(temp, (bool) b);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tbool_minus_value_w(const Temporal * temp, int b) {
  return tbool_minus_value(temp, (bool) b);
}

EMSCRIPTEN_KEEPALIVE
Temporal * temporal_after_timestamptz_w(const Temporal * temp, long long t, int strict) {
  return temporal_after_timestamptz(temp, (TimestampTz) t, (bool) strict);
}

EMSCRIPTEN_KEEPALIVE
Temporal * temporal_at_max_w(const Temporal * temp) {
  return temporal_at_max(temp);
}

EMSCRIPTEN_KEEPALIVE
Temporal * temporal_at_min_w(const Temporal * temp) {
  return temporal_at_min(temp);
}

EMSCRIPTEN_KEEPALIVE
Temporal * temporal_at_timestamptz_w(const Temporal * temp, long long t) {
  return temporal_at_timestamptz(temp, (TimestampTz) t);
}

EMSCRIPTEN_KEEPALIVE
Temporal * temporal_at_tstzset_w(const Temporal * temp, const Set * s) {
  return temporal_at_tstzset(temp, s);
}

EMSCRIPTEN_KEEPALIVE
Temporal * temporal_at_tstzspan_w(const Temporal * temp, const Span * s) {
  return temporal_at_tstzspan(temp, s);
}

EMSCRIPTEN_KEEPALIVE
Temporal * temporal_at_tstzspanset_w(const Temporal * temp, const SpanSet * ss) {
  return temporal_at_tstzspanset(temp, ss);
}

EMSCRIPTEN_KEEPALIVE
Temporal * temporal_at_values_w(const Temporal * temp, const Set * set) {
  return temporal_at_values(temp, set);
}

EMSCRIPTEN_KEEPALIVE
Temporal * temporal_before_timestamptz_w(const Temporal * temp, long long t, int strict) {
  return temporal_before_timestamptz(temp, (TimestampTz) t, (bool) strict);
}

EMSCRIPTEN_KEEPALIVE
Temporal * temporal_minus_max_w(const Temporal * temp) {
  return temporal_minus_max(temp);
}

EMSCRIPTEN_KEEPALIVE
Temporal * temporal_minus_min_w(const Temporal * temp) {
  return temporal_minus_min(temp);
}

EMSCRIPTEN_KEEPALIVE
Temporal * temporal_minus_timestamptz_w(const Temporal * temp, long long t) {
  return temporal_minus_timestamptz(temp, (TimestampTz) t);
}

EMSCRIPTEN_KEEPALIVE
Temporal * temporal_minus_tstzset_w(const Temporal * temp, const Set * s) {
  return temporal_minus_tstzset(temp, s);
}

EMSCRIPTEN_KEEPALIVE
Temporal * temporal_minus_tstzspan_w(const Temporal * temp, const Span * s) {
  return temporal_minus_tstzspan(temp, s);
}

EMSCRIPTEN_KEEPALIVE
Temporal * temporal_minus_tstzspanset_w(const Temporal * temp, const SpanSet * ss) {
  return temporal_minus_tstzspanset(temp, ss);
}

EMSCRIPTEN_KEEPALIVE
Temporal * temporal_minus_values_w(const Temporal * temp, const Set * set) {
  return temporal_minus_values(temp, set);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tfloat_at_value_w(const Temporal * temp, double d) {
  return tfloat_at_value(temp, d);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tfloat_minus_value_w(const Temporal * temp, double d) {
  return tfloat_minus_value(temp, d);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tint_at_value_w(const Temporal * temp, int i) {
  return tint_at_value(temp, i);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tint_minus_value_w(const Temporal * temp, int i) {
  return tint_minus_value(temp, i);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tnumber_at_span_w(const Temporal * temp, const Span * span) {
  return tnumber_at_span(temp, span);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tnumber_at_spanset_w(const Temporal * temp, const SpanSet * ss) {
  return tnumber_at_spanset(temp, ss);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tnumber_at_tbox_w(const Temporal * temp, const TBox * box) {
  return tnumber_at_tbox(temp, box);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tnumber_minus_span_w(const Temporal * temp, const Span * span) {
  return tnumber_minus_span(temp, span);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tnumber_minus_spanset_w(const Temporal * temp, const SpanSet * ss) {
  return tnumber_minus_spanset(temp, ss);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tnumber_minus_tbox_w(const Temporal * temp, const TBox * box) {
  return tnumber_minus_tbox(temp, box);
}

EMSCRIPTEN_KEEPALIVE
Temporal * ttext_at_value_w(const Temporal * temp, const char * txt) {
  return ttext_at_value(temp, cstring2text(txt));
}

EMSCRIPTEN_KEEPALIVE
Temporal * ttext_minus_value_w(const Temporal * temp, const char * txt) {
  return ttext_minus_value(temp, cstring2text(txt));
}

EMSCRIPTEN_KEEPALIVE
int temporal_cmp_w(const Temporal * temp1, const Temporal * temp2) {
  return temporal_cmp(temp1, temp2);
}

EMSCRIPTEN_KEEPALIVE
int temporal_eq_w(const Temporal * temp1, const Temporal * temp2) {
  return (int) temporal_eq(temp1, temp2);
}

EMSCRIPTEN_KEEPALIVE
int temporal_ge_w(const Temporal * temp1, const Temporal * temp2) {
  return (int) temporal_ge(temp1, temp2);
}

EMSCRIPTEN_KEEPALIVE
int temporal_gt_w(const Temporal * temp1, const Temporal * temp2) {
  return (int) temporal_gt(temp1, temp2);
}

EMSCRIPTEN_KEEPALIVE
int temporal_le_w(const Temporal * temp1, const Temporal * temp2) {
  return (int) temporal_le(temp1, temp2);
}

EMSCRIPTEN_KEEPALIVE
int temporal_lt_w(const Temporal * temp1, const Temporal * temp2) {
  return (int) temporal_lt(temp1, temp2);
}

EMSCRIPTEN_KEEPALIVE
int temporal_ne_w(const Temporal * temp1, const Temporal * temp2) {
  return (int) temporal_ne(temp1, temp2);
}

EMSCRIPTEN_KEEPALIVE
int always_eq_bool_tbool_w(int b, const Temporal * temp) {
  return always_eq_bool_tbool((bool) b, temp);
}

EMSCRIPTEN_KEEPALIVE
int always_eq_float_tfloat_w(double d, const Temporal * temp) {
  return always_eq_float_tfloat(d, temp);
}

EMSCRIPTEN_KEEPALIVE
int always_eq_int_tint_w(int i, const Temporal * temp) {
  return always_eq_int_tint(i, temp);
}

EMSCRIPTEN_KEEPALIVE
int always_eq_tbool_bool_w(const Temporal * temp, int b) {
  return always_eq_tbool_bool(temp, (bool) b);
}

EMSCRIPTEN_KEEPALIVE
int always_eq_temporal_temporal_w(const Temporal * temp1, const Temporal * temp2) {
  return always_eq_temporal_temporal(temp1, temp2);
}

EMSCRIPTEN_KEEPALIVE
int always_eq_text_ttext_w(const char * txt, const Temporal * temp) {
  return always_eq_text_ttext(cstring2text(txt), temp);
}

EMSCRIPTEN_KEEPALIVE
int always_eq_tfloat_float_w(const Temporal * temp, double d) {
  return always_eq_tfloat_float(temp, d);
}

EMSCRIPTEN_KEEPALIVE
int always_eq_tint_int_w(const Temporal * temp, int i) {
  return always_eq_tint_int(temp, i);
}

EMSCRIPTEN_KEEPALIVE
int always_eq_ttext_text_w(const Temporal * temp, const char * txt) {
  return always_eq_ttext_text(temp, cstring2text(txt));
}

EMSCRIPTEN_KEEPALIVE
int always_ge_float_tfloat_w(double d, const Temporal * temp) {
  return always_ge_float_tfloat(d, temp);
}

EMSCRIPTEN_KEEPALIVE
int always_ge_int_tint_w(int i, const Temporal * temp) {
  return always_ge_int_tint(i, temp);
}

EMSCRIPTEN_KEEPALIVE
int always_ge_temporal_temporal_w(const Temporal * temp1, const Temporal * temp2) {
  return always_ge_temporal_temporal(temp1, temp2);
}

EMSCRIPTEN_KEEPALIVE
int always_ge_text_ttext_w(const char * txt, const Temporal * temp) {
  return always_ge_text_ttext(cstring2text(txt), temp);
}

EMSCRIPTEN_KEEPALIVE
int always_ge_tfloat_float_w(const Temporal * temp, double d) {
  return always_ge_tfloat_float(temp, d);
}

EMSCRIPTEN_KEEPALIVE
int always_ge_tint_int_w(const Temporal * temp, int i) {
  return always_ge_tint_int(temp, i);
}

EMSCRIPTEN_KEEPALIVE
int always_ge_ttext_text_w(const Temporal * temp, const char * txt) {
  return always_ge_ttext_text(temp, cstring2text(txt));
}

EMSCRIPTEN_KEEPALIVE
int always_gt_float_tfloat_w(double d, const Temporal * temp) {
  return always_gt_float_tfloat(d, temp);
}

EMSCRIPTEN_KEEPALIVE
int always_gt_int_tint_w(int i, const Temporal * temp) {
  return always_gt_int_tint(i, temp);
}

EMSCRIPTEN_KEEPALIVE
int always_gt_temporal_temporal_w(const Temporal * temp1, const Temporal * temp2) {
  return always_gt_temporal_temporal(temp1, temp2);
}

EMSCRIPTEN_KEEPALIVE
int always_gt_text_ttext_w(const char * txt, const Temporal * temp) {
  return always_gt_text_ttext(cstring2text(txt), temp);
}

EMSCRIPTEN_KEEPALIVE
int always_gt_tfloat_float_w(const Temporal * temp, double d) {
  return always_gt_tfloat_float(temp, d);
}

EMSCRIPTEN_KEEPALIVE
int always_gt_tint_int_w(const Temporal * temp, int i) {
  return always_gt_tint_int(temp, i);
}

EMSCRIPTEN_KEEPALIVE
int always_gt_ttext_text_w(const Temporal * temp, const char * txt) {
  return always_gt_ttext_text(temp, cstring2text(txt));
}

EMSCRIPTEN_KEEPALIVE
int always_le_float_tfloat_w(double d, const Temporal * temp) {
  return always_le_float_tfloat(d, temp);
}

EMSCRIPTEN_KEEPALIVE
int always_le_int_tint_w(int i, const Temporal * temp) {
  return always_le_int_tint(i, temp);
}

EMSCRIPTEN_KEEPALIVE
int always_le_temporal_temporal_w(const Temporal * temp1, const Temporal * temp2) {
  return always_le_temporal_temporal(temp1, temp2);
}

EMSCRIPTEN_KEEPALIVE
int always_le_text_ttext_w(const char * txt, const Temporal * temp) {
  return always_le_text_ttext(cstring2text(txt), temp);
}

EMSCRIPTEN_KEEPALIVE
int always_le_tfloat_float_w(const Temporal * temp, double d) {
  return always_le_tfloat_float(temp, d);
}

EMSCRIPTEN_KEEPALIVE
int always_le_tint_int_w(const Temporal * temp, int i) {
  return always_le_tint_int(temp, i);
}

EMSCRIPTEN_KEEPALIVE
int always_le_ttext_text_w(const Temporal * temp, const char * txt) {
  return always_le_ttext_text(temp, cstring2text(txt));
}

EMSCRIPTEN_KEEPALIVE
int always_lt_float_tfloat_w(double d, const Temporal * temp) {
  return always_lt_float_tfloat(d, temp);
}

EMSCRIPTEN_KEEPALIVE
int always_lt_int_tint_w(int i, const Temporal * temp) {
  return always_lt_int_tint(i, temp);
}

EMSCRIPTEN_KEEPALIVE
int always_lt_temporal_temporal_w(const Temporal * temp1, const Temporal * temp2) {
  return always_lt_temporal_temporal(temp1, temp2);
}

EMSCRIPTEN_KEEPALIVE
int always_lt_text_ttext_w(const char * txt, const Temporal * temp) {
  return always_lt_text_ttext(cstring2text(txt), temp);
}

EMSCRIPTEN_KEEPALIVE
int always_lt_tfloat_float_w(const Temporal * temp, double d) {
  return always_lt_tfloat_float(temp, d);
}

EMSCRIPTEN_KEEPALIVE
int always_lt_tint_int_w(const Temporal * temp, int i) {
  return always_lt_tint_int(temp, i);
}

EMSCRIPTEN_KEEPALIVE
int always_lt_ttext_text_w(const Temporal * temp, const char * txt) {
  return always_lt_ttext_text(temp, cstring2text(txt));
}

EMSCRIPTEN_KEEPALIVE
int always_ne_bool_tbool_w(int b, const Temporal * temp) {
  return always_ne_bool_tbool((bool) b, temp);
}

EMSCRIPTEN_KEEPALIVE
int always_ne_float_tfloat_w(double d, const Temporal * temp) {
  return always_ne_float_tfloat(d, temp);
}

EMSCRIPTEN_KEEPALIVE
int always_ne_int_tint_w(int i, const Temporal * temp) {
  return always_ne_int_tint(i, temp);
}

EMSCRIPTEN_KEEPALIVE
int always_ne_tbool_bool_w(const Temporal * temp, int b) {
  return always_ne_tbool_bool(temp, (bool) b);
}

EMSCRIPTEN_KEEPALIVE
int always_ne_temporal_temporal_w(const Temporal * temp1, const Temporal * temp2) {
  return always_ne_temporal_temporal(temp1, temp2);
}

EMSCRIPTEN_KEEPALIVE
int always_ne_text_ttext_w(const char * txt, const Temporal * temp) {
  return always_ne_text_ttext(cstring2text(txt), temp);
}

EMSCRIPTEN_KEEPALIVE
int always_ne_tfloat_float_w(const Temporal * temp, double d) {
  return always_ne_tfloat_float(temp, d);
}

EMSCRIPTEN_KEEPALIVE
int always_ne_tint_int_w(const Temporal * temp, int i) {
  return always_ne_tint_int(temp, i);
}

EMSCRIPTEN_KEEPALIVE
int always_ne_ttext_text_w(const Temporal * temp, const char * txt) {
  return always_ne_ttext_text(temp, cstring2text(txt));
}

EMSCRIPTEN_KEEPALIVE
int ever_eq_bool_tbool_w(int b, const Temporal * temp) {
  return ever_eq_bool_tbool((bool) b, temp);
}

EMSCRIPTEN_KEEPALIVE
int ever_eq_float_tfloat_w(double d, const Temporal * temp) {
  return ever_eq_float_tfloat(d, temp);
}

EMSCRIPTEN_KEEPALIVE
int ever_eq_int_tint_w(int i, const Temporal * temp) {
  return ever_eq_int_tint(i, temp);
}

EMSCRIPTEN_KEEPALIVE
int ever_eq_tbool_bool_w(const Temporal * temp, int b) {
  return ever_eq_tbool_bool(temp, (bool) b);
}

EMSCRIPTEN_KEEPALIVE
int ever_eq_temporal_temporal_w(const Temporal * temp1, const Temporal * temp2) {
  return ever_eq_temporal_temporal(temp1, temp2);
}

EMSCRIPTEN_KEEPALIVE
int ever_eq_text_ttext_w(const char * txt, const Temporal * temp) {
  return ever_eq_text_ttext(cstring2text(txt), temp);
}

EMSCRIPTEN_KEEPALIVE
int ever_eq_tfloat_float_w(const Temporal * temp, double d) {
  return ever_eq_tfloat_float(temp, d);
}

EMSCRIPTEN_KEEPALIVE
int ever_eq_tint_int_w(const Temporal * temp, int i) {
  return ever_eq_tint_int(temp, i);
}

EMSCRIPTEN_KEEPALIVE
int ever_eq_ttext_text_w(const Temporal * temp, const char * txt) {
  return ever_eq_ttext_text(temp, cstring2text(txt));
}

EMSCRIPTEN_KEEPALIVE
int ever_ge_float_tfloat_w(double d, const Temporal * temp) {
  return ever_ge_float_tfloat(d, temp);
}

EMSCRIPTEN_KEEPALIVE
int ever_ge_int_tint_w(int i, const Temporal * temp) {
  return ever_ge_int_tint(i, temp);
}

EMSCRIPTEN_KEEPALIVE
int ever_ge_temporal_temporal_w(const Temporal * temp1, const Temporal * temp2) {
  return ever_ge_temporal_temporal(temp1, temp2);
}

EMSCRIPTEN_KEEPALIVE
int ever_ge_text_ttext_w(const char * txt, const Temporal * temp) {
  return ever_ge_text_ttext(cstring2text(txt), temp);
}

EMSCRIPTEN_KEEPALIVE
int ever_ge_tfloat_float_w(const Temporal * temp, double d) {
  return ever_ge_tfloat_float(temp, d);
}

EMSCRIPTEN_KEEPALIVE
int ever_ge_tint_int_w(const Temporal * temp, int i) {
  return ever_ge_tint_int(temp, i);
}

EMSCRIPTEN_KEEPALIVE
int ever_ge_ttext_text_w(const Temporal * temp, const char * txt) {
  return ever_ge_ttext_text(temp, cstring2text(txt));
}

EMSCRIPTEN_KEEPALIVE
int ever_gt_float_tfloat_w(double d, const Temporal * temp) {
  return ever_gt_float_tfloat(d, temp);
}

EMSCRIPTEN_KEEPALIVE
int ever_gt_int_tint_w(int i, const Temporal * temp) {
  return ever_gt_int_tint(i, temp);
}

EMSCRIPTEN_KEEPALIVE
int ever_gt_temporal_temporal_w(const Temporal * temp1, const Temporal * temp2) {
  return ever_gt_temporal_temporal(temp1, temp2);
}

EMSCRIPTEN_KEEPALIVE
int ever_gt_text_ttext_w(const char * txt, const Temporal * temp) {
  return ever_gt_text_ttext(cstring2text(txt), temp);
}

EMSCRIPTEN_KEEPALIVE
int ever_gt_tfloat_float_w(const Temporal * temp, double d) {
  return ever_gt_tfloat_float(temp, d);
}

EMSCRIPTEN_KEEPALIVE
int ever_gt_tint_int_w(const Temporal * temp, int i) {
  return ever_gt_tint_int(temp, i);
}

EMSCRIPTEN_KEEPALIVE
int ever_gt_ttext_text_w(const Temporal * temp, const char * txt) {
  return ever_gt_ttext_text(temp, cstring2text(txt));
}

EMSCRIPTEN_KEEPALIVE
int ever_le_float_tfloat_w(double d, const Temporal * temp) {
  return ever_le_float_tfloat(d, temp);
}

EMSCRIPTEN_KEEPALIVE
int ever_le_int_tint_w(int i, const Temporal * temp) {
  return ever_le_int_tint(i, temp);
}

EMSCRIPTEN_KEEPALIVE
int ever_le_temporal_temporal_w(const Temporal * temp1, const Temporal * temp2) {
  return ever_le_temporal_temporal(temp1, temp2);
}

EMSCRIPTEN_KEEPALIVE
int ever_le_text_ttext_w(const char * txt, const Temporal * temp) {
  return ever_le_text_ttext(cstring2text(txt), temp);
}

EMSCRIPTEN_KEEPALIVE
int ever_le_tfloat_float_w(const Temporal * temp, double d) {
  return ever_le_tfloat_float(temp, d);
}

EMSCRIPTEN_KEEPALIVE
int ever_le_tint_int_w(const Temporal * temp, int i) {
  return ever_le_tint_int(temp, i);
}

EMSCRIPTEN_KEEPALIVE
int ever_le_ttext_text_w(const Temporal * temp, const char * txt) {
  return ever_le_ttext_text(temp, cstring2text(txt));
}

EMSCRIPTEN_KEEPALIVE
int ever_lt_float_tfloat_w(double d, const Temporal * temp) {
  return ever_lt_float_tfloat(d, temp);
}

EMSCRIPTEN_KEEPALIVE
int ever_lt_int_tint_w(int i, const Temporal * temp) {
  return ever_lt_int_tint(i, temp);
}

EMSCRIPTEN_KEEPALIVE
int ever_lt_temporal_temporal_w(const Temporal * temp1, const Temporal * temp2) {
  return ever_lt_temporal_temporal(temp1, temp2);
}

EMSCRIPTEN_KEEPALIVE
int ever_lt_text_ttext_w(const char * txt, const Temporal * temp) {
  return ever_lt_text_ttext(cstring2text(txt), temp);
}

EMSCRIPTEN_KEEPALIVE
int ever_lt_tfloat_float_w(const Temporal * temp, double d) {
  return ever_lt_tfloat_float(temp, d);
}

EMSCRIPTEN_KEEPALIVE
int ever_lt_tint_int_w(const Temporal * temp, int i) {
  return ever_lt_tint_int(temp, i);
}

EMSCRIPTEN_KEEPALIVE
int ever_lt_ttext_text_w(const Temporal * temp, const char * txt) {
  return ever_lt_ttext_text(temp, cstring2text(txt));
}

EMSCRIPTEN_KEEPALIVE
int ever_ne_bool_tbool_w(int b, const Temporal * temp) {
  return ever_ne_bool_tbool((bool) b, temp);
}

EMSCRIPTEN_KEEPALIVE
int ever_ne_float_tfloat_w(double d, const Temporal * temp) {
  return ever_ne_float_tfloat(d, temp);
}

EMSCRIPTEN_KEEPALIVE
int ever_ne_int_tint_w(int i, const Temporal * temp) {
  return ever_ne_int_tint(i, temp);
}

EMSCRIPTEN_KEEPALIVE
int ever_ne_tbool_bool_w(const Temporal * temp, int b) {
  return ever_ne_tbool_bool(temp, (bool) b);
}

EMSCRIPTEN_KEEPALIVE
int ever_ne_temporal_temporal_w(const Temporal * temp1, const Temporal * temp2) {
  return ever_ne_temporal_temporal(temp1, temp2);
}

EMSCRIPTEN_KEEPALIVE
int ever_ne_text_ttext_w(const char * txt, const Temporal * temp) {
  return ever_ne_text_ttext(cstring2text(txt), temp);
}

EMSCRIPTEN_KEEPALIVE
int ever_ne_tfloat_float_w(const Temporal * temp, double d) {
  return ever_ne_tfloat_float(temp, d);
}

EMSCRIPTEN_KEEPALIVE
int ever_ne_tint_int_w(const Temporal * temp, int i) {
  return ever_ne_tint_int(temp, i);
}

EMSCRIPTEN_KEEPALIVE
int ever_ne_ttext_text_w(const Temporal * temp, const char * txt) {
  return ever_ne_ttext_text(temp, cstring2text(txt));
}

EMSCRIPTEN_KEEPALIVE
Temporal * teq_bool_tbool_w(int b, const Temporal * temp) {
  return teq_bool_tbool((bool) b, temp);
}

EMSCRIPTEN_KEEPALIVE
Temporal * teq_float_tfloat_w(double d, const Temporal * temp) {
  return teq_float_tfloat(d, temp);
}

EMSCRIPTEN_KEEPALIVE
Temporal * teq_int_tint_w(int i, const Temporal * temp) {
  return teq_int_tint(i, temp);
}

EMSCRIPTEN_KEEPALIVE
Temporal * teq_tbool_bool_w(const Temporal * temp, int b) {
  return teq_tbool_bool(temp, (bool) b);
}

EMSCRIPTEN_KEEPALIVE
Temporal * teq_temporal_temporal_w(const Temporal * temp1, const Temporal * temp2) {
  return teq_temporal_temporal(temp1, temp2);
}

EMSCRIPTEN_KEEPALIVE
Temporal * teq_text_ttext_w(const char * txt, const Temporal * temp) {
  return teq_text_ttext(cstring2text(txt), temp);
}

EMSCRIPTEN_KEEPALIVE
Temporal * teq_tfloat_float_w(const Temporal * temp, double d) {
  return teq_tfloat_float(temp, d);
}

EMSCRIPTEN_KEEPALIVE
Temporal * teq_tint_int_w(const Temporal * temp, int i) {
  return teq_tint_int(temp, i);
}

EMSCRIPTEN_KEEPALIVE
Temporal * teq_ttext_text_w(const Temporal * temp, const char * txt) {
  return teq_ttext_text(temp, cstring2text(txt));
}

EMSCRIPTEN_KEEPALIVE
Temporal * tge_float_tfloat_w(double d, const Temporal * temp) {
  return tge_float_tfloat(d, temp);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tge_int_tint_w(int i, const Temporal * temp) {
  return tge_int_tint(i, temp);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tge_temporal_temporal_w(const Temporal * temp1, const Temporal * temp2) {
  return tge_temporal_temporal(temp1, temp2);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tge_text_ttext_w(const char * txt, const Temporal * temp) {
  return tge_text_ttext(cstring2text(txt), temp);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tge_tfloat_float_w(const Temporal * temp, double d) {
  return tge_tfloat_float(temp, d);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tge_tint_int_w(const Temporal * temp, int i) {
  return tge_tint_int(temp, i);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tge_ttext_text_w(const Temporal * temp, const char * txt) {
  return tge_ttext_text(temp, cstring2text(txt));
}

EMSCRIPTEN_KEEPALIVE
Temporal * tgt_float_tfloat_w(double d, const Temporal * temp) {
  return tgt_float_tfloat(d, temp);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tgt_int_tint_w(int i, const Temporal * temp) {
  return tgt_int_tint(i, temp);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tgt_temporal_temporal_w(const Temporal * temp1, const Temporal * temp2) {
  return tgt_temporal_temporal(temp1, temp2);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tgt_text_ttext_w(const char * txt, const Temporal * temp) {
  return tgt_text_ttext(cstring2text(txt), temp);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tgt_tfloat_float_w(const Temporal * temp, double d) {
  return tgt_tfloat_float(temp, d);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tgt_tint_int_w(const Temporal * temp, int i) {
  return tgt_tint_int(temp, i);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tgt_ttext_text_w(const Temporal * temp, const char * txt) {
  return tgt_ttext_text(temp, cstring2text(txt));
}

EMSCRIPTEN_KEEPALIVE
Temporal * tle_float_tfloat_w(double d, const Temporal * temp) {
  return tle_float_tfloat(d, temp);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tle_int_tint_w(int i, const Temporal * temp) {
  return tle_int_tint(i, temp);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tle_temporal_temporal_w(const Temporal * temp1, const Temporal * temp2) {
  return tle_temporal_temporal(temp1, temp2);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tle_text_ttext_w(const char * txt, const Temporal * temp) {
  return tle_text_ttext(cstring2text(txt), temp);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tle_tfloat_float_w(const Temporal * temp, double d) {
  return tle_tfloat_float(temp, d);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tle_tint_int_w(const Temporal * temp, int i) {
  return tle_tint_int(temp, i);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tle_ttext_text_w(const Temporal * temp, const char * txt) {
  return tle_ttext_text(temp, cstring2text(txt));
}

EMSCRIPTEN_KEEPALIVE
Temporal * tlt_float_tfloat_w(double d, const Temporal * temp) {
  return tlt_float_tfloat(d, temp);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tlt_int_tint_w(int i, const Temporal * temp) {
  return tlt_int_tint(i, temp);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tlt_temporal_temporal_w(const Temporal * temp1, const Temporal * temp2) {
  return tlt_temporal_temporal(temp1, temp2);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tlt_text_ttext_w(const char * txt, const Temporal * temp) {
  return tlt_text_ttext(cstring2text(txt), temp);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tlt_tfloat_float_w(const Temporal * temp, double d) {
  return tlt_tfloat_float(temp, d);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tlt_tint_int_w(const Temporal * temp, int i) {
  return tlt_tint_int(temp, i);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tlt_ttext_text_w(const Temporal * temp, const char * txt) {
  return tlt_ttext_text(temp, cstring2text(txt));
}

EMSCRIPTEN_KEEPALIVE
Temporal * tne_bool_tbool_w(int b, const Temporal * temp) {
  return tne_bool_tbool((bool) b, temp);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tne_float_tfloat_w(double d, const Temporal * temp) {
  return tne_float_tfloat(d, temp);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tne_int_tint_w(int i, const Temporal * temp) {
  return tne_int_tint(i, temp);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tne_tbool_bool_w(const Temporal * temp, int b) {
  return tne_tbool_bool(temp, (bool) b);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tne_temporal_temporal_w(const Temporal * temp1, const Temporal * temp2) {
  return tne_temporal_temporal(temp1, temp2);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tne_text_ttext_w(const char * txt, const Temporal * temp) {
  return tne_text_ttext(cstring2text(txt), temp);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tne_tfloat_float_w(const Temporal * temp, double d) {
  return tne_tfloat_float(temp, d);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tne_tint_int_w(const Temporal * temp, int i) {
  return tne_tint_int(temp, i);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tne_ttext_text_w(const Temporal * temp, const char * txt) {
  return tne_ttext_text(temp, cstring2text(txt));
}

EMSCRIPTEN_KEEPALIVE
Span * temporal_spans_w(const Temporal * temp, int * count) {
  return temporal_spans(temp, count);
}

EMSCRIPTEN_KEEPALIVE
Span * temporal_split_each_n_spans_w(const Temporal * temp, int elem_count, int * count) {
  return temporal_split_each_n_spans(temp, elem_count, count);
}

EMSCRIPTEN_KEEPALIVE
Span * temporal_split_n_spans_w(const Temporal * temp, int span_count, int * count) {
  return temporal_split_n_spans(temp, span_count, count);
}

EMSCRIPTEN_KEEPALIVE
TBox * tnumber_split_each_n_tboxes_w(const Temporal * temp, int elem_count, int * count) {
  return tnumber_split_each_n_tboxes(temp, elem_count, count);
}

EMSCRIPTEN_KEEPALIVE
TBox * tnumber_split_n_tboxes_w(const Temporal * temp, int box_count, int * count) {
  return tnumber_split_n_tboxes(temp, box_count, count);
}

EMSCRIPTEN_KEEPALIVE
TBox * tnumber_tboxes_w(const Temporal * temp, int * count) {
  return tnumber_tboxes(temp, count);
}

EMSCRIPTEN_KEEPALIVE
int adjacent_numspan_tnumber_w(const Span * s, const Temporal * temp) {
  return (int) adjacent_numspan_tnumber(s, temp);
}

EMSCRIPTEN_KEEPALIVE
int adjacent_tbox_tnumber_w(const TBox * box, const Temporal * temp) {
  return (int) adjacent_tbox_tnumber(box, temp);
}

EMSCRIPTEN_KEEPALIVE
int adjacent_temporal_temporal_w(const Temporal * temp1, const Temporal * temp2) {
  return (int) adjacent_temporal_temporal(temp1, temp2);
}

EMSCRIPTEN_KEEPALIVE
int adjacent_temporal_tstzspan_w(const Temporal * temp, const Span * s) {
  return (int) adjacent_temporal_tstzspan(temp, s);
}

EMSCRIPTEN_KEEPALIVE
int adjacent_tnumber_numspan_w(const Temporal * temp, const Span * s) {
  return (int) adjacent_tnumber_numspan(temp, s);
}

EMSCRIPTEN_KEEPALIVE
int adjacent_tnumber_tbox_w(const Temporal * temp, const TBox * box) {
  return (int) adjacent_tnumber_tbox(temp, box);
}

EMSCRIPTEN_KEEPALIVE
int adjacent_tnumber_tnumber_w(const Temporal * temp1, const Temporal * temp2) {
  return (int) adjacent_tnumber_tnumber(temp1, temp2);
}

EMSCRIPTEN_KEEPALIVE
int adjacent_tstzspan_temporal_w(const Span * s, const Temporal * temp) {
  return (int) adjacent_tstzspan_temporal(s, temp);
}

EMSCRIPTEN_KEEPALIVE
int contained_numspan_tnumber_w(const Span * s, const Temporal * temp) {
  return (int) contained_numspan_tnumber(s, temp);
}

EMSCRIPTEN_KEEPALIVE
int contained_tbox_tnumber_w(const TBox * box, const Temporal * temp) {
  return (int) contained_tbox_tnumber(box, temp);
}

EMSCRIPTEN_KEEPALIVE
int contained_temporal_temporal_w(const Temporal * temp1, const Temporal * temp2) {
  return (int) contained_temporal_temporal(temp1, temp2);
}

EMSCRIPTEN_KEEPALIVE
int contained_temporal_tstzspan_w(const Temporal * temp, const Span * s) {
  return (int) contained_temporal_tstzspan(temp, s);
}

EMSCRIPTEN_KEEPALIVE
int contained_tnumber_numspan_w(const Temporal * temp, const Span * s) {
  return (int) contained_tnumber_numspan(temp, s);
}

EMSCRIPTEN_KEEPALIVE
int contained_tnumber_tbox_w(const Temporal * temp, const TBox * box) {
  return (int) contained_tnumber_tbox(temp, box);
}

EMSCRIPTEN_KEEPALIVE
int contained_tnumber_tnumber_w(const Temporal * temp1, const Temporal * temp2) {
  return (int) contained_tnumber_tnumber(temp1, temp2);
}

EMSCRIPTEN_KEEPALIVE
int contained_tstzspan_temporal_w(const Span * s, const Temporal * temp) {
  return (int) contained_tstzspan_temporal(s, temp);
}

EMSCRIPTEN_KEEPALIVE
int contains_numspan_tnumber_w(const Span * s, const Temporal * temp) {
  return (int) contains_numspan_tnumber(s, temp);
}

EMSCRIPTEN_KEEPALIVE
int contains_tbox_tnumber_w(const TBox * box, const Temporal * temp) {
  return (int) contains_tbox_tnumber(box, temp);
}

EMSCRIPTEN_KEEPALIVE
int contains_temporal_tstzspan_w(const Temporal * temp, const Span * s) {
  return (int) contains_temporal_tstzspan(temp, s);
}

EMSCRIPTEN_KEEPALIVE
int contains_temporal_temporal_w(const Temporal * temp1, const Temporal * temp2) {
  return (int) contains_temporal_temporal(temp1, temp2);
}

EMSCRIPTEN_KEEPALIVE
int contains_tnumber_numspan_w(const Temporal * temp, const Span * s) {
  return (int) contains_tnumber_numspan(temp, s);
}

EMSCRIPTEN_KEEPALIVE
int contains_tnumber_tbox_w(const Temporal * temp, const TBox * box) {
  return (int) contains_tnumber_tbox(temp, box);
}

EMSCRIPTEN_KEEPALIVE
int contains_tnumber_tnumber_w(const Temporal * temp1, const Temporal * temp2) {
  return (int) contains_tnumber_tnumber(temp1, temp2);
}

EMSCRIPTEN_KEEPALIVE
int contains_tstzspan_temporal_w(const Span * s, const Temporal * temp) {
  return (int) contains_tstzspan_temporal(s, temp);
}

EMSCRIPTEN_KEEPALIVE
int overlaps_numspan_tnumber_w(const Span * s, const Temporal * temp) {
  return (int) overlaps_numspan_tnumber(s, temp);
}

EMSCRIPTEN_KEEPALIVE
int overlaps_tbox_tnumber_w(const TBox * box, const Temporal * temp) {
  return (int) overlaps_tbox_tnumber(box, temp);
}

EMSCRIPTEN_KEEPALIVE
int overlaps_temporal_temporal_w(const Temporal * temp1, const Temporal * temp2) {
  return (int) overlaps_temporal_temporal(temp1, temp2);
}

EMSCRIPTEN_KEEPALIVE
int overlaps_temporal_tstzspan_w(const Temporal * temp, const Span * s) {
  return (int) overlaps_temporal_tstzspan(temp, s);
}

EMSCRIPTEN_KEEPALIVE
int overlaps_tnumber_numspan_w(const Temporal * temp, const Span * s) {
  return (int) overlaps_tnumber_numspan(temp, s);
}

EMSCRIPTEN_KEEPALIVE
int overlaps_tnumber_tbox_w(const Temporal * temp, const TBox * box) {
  return (int) overlaps_tnumber_tbox(temp, box);
}

EMSCRIPTEN_KEEPALIVE
int overlaps_tnumber_tnumber_w(const Temporal * temp1, const Temporal * temp2) {
  return (int) overlaps_tnumber_tnumber(temp1, temp2);
}

EMSCRIPTEN_KEEPALIVE
int overlaps_tstzspan_temporal_w(const Span * s, const Temporal * temp) {
  return (int) overlaps_tstzspan_temporal(s, temp);
}

EMSCRIPTEN_KEEPALIVE
int same_numspan_tnumber_w(const Span * s, const Temporal * temp) {
  return (int) same_numspan_tnumber(s, temp);
}

EMSCRIPTEN_KEEPALIVE
int same_tbox_tnumber_w(const TBox * box, const Temporal * temp) {
  return (int) same_tbox_tnumber(box, temp);
}

EMSCRIPTEN_KEEPALIVE
int same_temporal_temporal_w(const Temporal * temp1, const Temporal * temp2) {
  return (int) same_temporal_temporal(temp1, temp2);
}

EMSCRIPTEN_KEEPALIVE
int same_temporal_tstzspan_w(const Temporal * temp, const Span * s) {
  return (int) same_temporal_tstzspan(temp, s);
}

EMSCRIPTEN_KEEPALIVE
int same_tnumber_numspan_w(const Temporal * temp, const Span * s) {
  return (int) same_tnumber_numspan(temp, s);
}

EMSCRIPTEN_KEEPALIVE
int same_tnumber_tbox_w(const Temporal * temp, const TBox * box) {
  return (int) same_tnumber_tbox(temp, box);
}

EMSCRIPTEN_KEEPALIVE
int same_tnumber_tnumber_w(const Temporal * temp1, const Temporal * temp2) {
  return (int) same_tnumber_tnumber(temp1, temp2);
}

EMSCRIPTEN_KEEPALIVE
int same_tstzspan_temporal_w(const Span * s, const Temporal * temp) {
  return (int) same_tstzspan_temporal(s, temp);
}

EMSCRIPTEN_KEEPALIVE
int after_tbox_tnumber_w(const TBox * box, const Temporal * temp) {
  return (int) after_tbox_tnumber(box, temp);
}

EMSCRIPTEN_KEEPALIVE
int after_temporal_tstzspan_w(const Temporal * temp, const Span * s) {
  return (int) after_temporal_tstzspan(temp, s);
}

EMSCRIPTEN_KEEPALIVE
int after_temporal_temporal_w(const Temporal * temp1, const Temporal * temp2) {
  return (int) after_temporal_temporal(temp1, temp2);
}

EMSCRIPTEN_KEEPALIVE
int after_tnumber_tbox_w(const Temporal * temp, const TBox * box) {
  return (int) after_tnumber_tbox(temp, box);
}

EMSCRIPTEN_KEEPALIVE
int after_tnumber_tnumber_w(const Temporal * temp1, const Temporal * temp2) {
  return (int) after_tnumber_tnumber(temp1, temp2);
}

EMSCRIPTEN_KEEPALIVE
int after_tstzspan_temporal_w(const Span * s, const Temporal * temp) {
  return (int) after_tstzspan_temporal(s, temp);
}

EMSCRIPTEN_KEEPALIVE
int before_tbox_tnumber_w(const TBox * box, const Temporal * temp) {
  return (int) before_tbox_tnumber(box, temp);
}

EMSCRIPTEN_KEEPALIVE
int before_temporal_tstzspan_w(const Temporal * temp, const Span * s) {
  return (int) before_temporal_tstzspan(temp, s);
}

EMSCRIPTEN_KEEPALIVE
int before_temporal_temporal_w(const Temporal * temp1, const Temporal * temp2) {
  return (int) before_temporal_temporal(temp1, temp2);
}

EMSCRIPTEN_KEEPALIVE
int before_tnumber_tbox_w(const Temporal * temp, const TBox * box) {
  return (int) before_tnumber_tbox(temp, box);
}

EMSCRIPTEN_KEEPALIVE
int before_tnumber_tnumber_w(const Temporal * temp1, const Temporal * temp2) {
  return (int) before_tnumber_tnumber(temp1, temp2);
}

EMSCRIPTEN_KEEPALIVE
int before_tstzspan_temporal_w(const Span * s, const Temporal * temp) {
  return (int) before_tstzspan_temporal(s, temp);
}

EMSCRIPTEN_KEEPALIVE
int left_tbox_tnumber_w(const TBox * box, const Temporal * temp) {
  return (int) left_tbox_tnumber(box, temp);
}

EMSCRIPTEN_KEEPALIVE
int left_numspan_tnumber_w(const Span * s, const Temporal * temp) {
  return (int) left_numspan_tnumber(s, temp);
}

EMSCRIPTEN_KEEPALIVE
int left_tnumber_numspan_w(const Temporal * temp, const Span * s) {
  return (int) left_tnumber_numspan(temp, s);
}

EMSCRIPTEN_KEEPALIVE
int left_tnumber_tbox_w(const Temporal * temp, const TBox * box) {
  return (int) left_tnumber_tbox(temp, box);
}

EMSCRIPTEN_KEEPALIVE
int left_tnumber_tnumber_w(const Temporal * temp1, const Temporal * temp2) {
  return (int) left_tnumber_tnumber(temp1, temp2);
}

EMSCRIPTEN_KEEPALIVE
int overafter_tbox_tnumber_w(const TBox * box, const Temporal * temp) {
  return (int) overafter_tbox_tnumber(box, temp);
}

EMSCRIPTEN_KEEPALIVE
int overafter_temporal_tstzspan_w(const Temporal * temp, const Span * s) {
  return (int) overafter_temporal_tstzspan(temp, s);
}

EMSCRIPTEN_KEEPALIVE
int overafter_temporal_temporal_w(const Temporal * temp1, const Temporal * temp2) {
  return (int) overafter_temporal_temporal(temp1, temp2);
}

EMSCRIPTEN_KEEPALIVE
int overafter_tnumber_tbox_w(const Temporal * temp, const TBox * box) {
  return (int) overafter_tnumber_tbox(temp, box);
}

EMSCRIPTEN_KEEPALIVE
int overafter_tnumber_tnumber_w(const Temporal * temp1, const Temporal * temp2) {
  return (int) overafter_tnumber_tnumber(temp1, temp2);
}

EMSCRIPTEN_KEEPALIVE
int overafter_tstzspan_temporal_w(const Span * s, const Temporal * temp) {
  return (int) overafter_tstzspan_temporal(s, temp);
}

EMSCRIPTEN_KEEPALIVE
int overbefore_tbox_tnumber_w(const TBox * box, const Temporal * temp) {
  return (int) overbefore_tbox_tnumber(box, temp);
}

EMSCRIPTEN_KEEPALIVE
int overbefore_temporal_tstzspan_w(const Temporal * temp, const Span * s) {
  return (int) overbefore_temporal_tstzspan(temp, s);
}

EMSCRIPTEN_KEEPALIVE
int overbefore_temporal_temporal_w(const Temporal * temp1, const Temporal * temp2) {
  return (int) overbefore_temporal_temporal(temp1, temp2);
}

EMSCRIPTEN_KEEPALIVE
int overbefore_tnumber_tbox_w(const Temporal * temp, const TBox * box) {
  return (int) overbefore_tnumber_tbox(temp, box);
}

EMSCRIPTEN_KEEPALIVE
int overbefore_tnumber_tnumber_w(const Temporal * temp1, const Temporal * temp2) {
  return (int) overbefore_tnumber_tnumber(temp1, temp2);
}

EMSCRIPTEN_KEEPALIVE
int overbefore_tstzspan_temporal_w(const Span * s, const Temporal * temp) {
  return (int) overbefore_tstzspan_temporal(s, temp);
}

EMSCRIPTEN_KEEPALIVE
int overleft_numspan_tnumber_w(const Span * s, const Temporal * temp) {
  return (int) overleft_numspan_tnumber(s, temp);
}

EMSCRIPTEN_KEEPALIVE
int overleft_tbox_tnumber_w(const TBox * box, const Temporal * temp) {
  return (int) overleft_tbox_tnumber(box, temp);
}

EMSCRIPTEN_KEEPALIVE
int overleft_tnumber_numspan_w(const Temporal * temp, const Span * s) {
  return (int) overleft_tnumber_numspan(temp, s);
}

EMSCRIPTEN_KEEPALIVE
int overleft_tnumber_tbox_w(const Temporal * temp, const TBox * box) {
  return (int) overleft_tnumber_tbox(temp, box);
}

EMSCRIPTEN_KEEPALIVE
int overleft_tnumber_tnumber_w(const Temporal * temp1, const Temporal * temp2) {
  return (int) overleft_tnumber_tnumber(temp1, temp2);
}

EMSCRIPTEN_KEEPALIVE
int overright_numspan_tnumber_w(const Span * s, const Temporal * temp) {
  return (int) overright_numspan_tnumber(s, temp);
}

EMSCRIPTEN_KEEPALIVE
int overright_tbox_tnumber_w(const TBox * box, const Temporal * temp) {
  return (int) overright_tbox_tnumber(box, temp);
}

EMSCRIPTEN_KEEPALIVE
int overright_tnumber_numspan_w(const Temporal * temp, const Span * s) {
  return (int) overright_tnumber_numspan(temp, s);
}

EMSCRIPTEN_KEEPALIVE
int overright_tnumber_tbox_w(const Temporal * temp, const TBox * box) {
  return (int) overright_tnumber_tbox(temp, box);
}

EMSCRIPTEN_KEEPALIVE
int overright_tnumber_tnumber_w(const Temporal * temp1, const Temporal * temp2) {
  return (int) overright_tnumber_tnumber(temp1, temp2);
}

EMSCRIPTEN_KEEPALIVE
int right_numspan_tnumber_w(const Span * s, const Temporal * temp) {
  return (int) right_numspan_tnumber(s, temp);
}

EMSCRIPTEN_KEEPALIVE
int right_tbox_tnumber_w(const TBox * box, const Temporal * temp) {
  return (int) right_tbox_tnumber(box, temp);
}

EMSCRIPTEN_KEEPALIVE
int right_tnumber_numspan_w(const Temporal * temp, const Span * s) {
  return (int) right_tnumber_numspan(temp, s);
}

EMSCRIPTEN_KEEPALIVE
int right_tnumber_tbox_w(const Temporal * temp, const TBox * box) {
  return (int) right_tnumber_tbox(temp, box);
}

EMSCRIPTEN_KEEPALIVE
int right_tnumber_tnumber_w(const Temporal * temp1, const Temporal * temp2) {
  return (int) right_tnumber_tnumber(temp1, temp2);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tand_bool_tbool_w(int b, const Temporal * temp) {
  return tand_bool_tbool((bool) b, temp);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tand_tbool_bool_w(const Temporal * temp, int b) {
  return tand_tbool_bool(temp, (bool) b);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tand_tbool_tbool_w(const Temporal * temp1, const Temporal * temp2) {
  return tand_tbool_tbool(temp1, temp2);
}

EMSCRIPTEN_KEEPALIVE
SpanSet * tbool_when_true_w(const Temporal * temp) {
  return tbool_when_true(temp);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tnot_tbool_w(const Temporal * temp) {
  return tnot_tbool(temp);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tor_bool_tbool_w(int b, const Temporal * temp) {
  return tor_bool_tbool((bool) b, temp);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tor_tbool_bool_w(const Temporal * temp, int b) {
  return tor_tbool_bool(temp, (bool) b);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tor_tbool_tbool_w(const Temporal * temp1, const Temporal * temp2) {
  return tor_tbool_tbool(temp1, temp2);
}

EMSCRIPTEN_KEEPALIVE
Temporal * add_float_tfloat_w(double d, const Temporal * tnumber) {
  return add_float_tfloat(d, tnumber);
}

EMSCRIPTEN_KEEPALIVE
Temporal * add_int_tint_w(int i, const Temporal * tnumber) {
  return add_int_tint(i, tnumber);
}

EMSCRIPTEN_KEEPALIVE
Temporal * add_tfloat_float_w(const Temporal * tnumber, double d) {
  return add_tfloat_float(tnumber, d);
}

EMSCRIPTEN_KEEPALIVE
Temporal * add_tint_int_w(const Temporal * tnumber, int i) {
  return add_tint_int(tnumber, i);
}

EMSCRIPTEN_KEEPALIVE
Temporal * add_tnumber_tnumber_w(const Temporal * tnumber1, const Temporal * tnumber2) {
  return add_tnumber_tnumber(tnumber1, tnumber2);
}

EMSCRIPTEN_KEEPALIVE
Temporal * div_float_tfloat_w(double d, const Temporal * tnumber) {
  return div_float_tfloat(d, tnumber);
}

EMSCRIPTEN_KEEPALIVE
Temporal * div_int_tint_w(int i, const Temporal * tnumber) {
  return div_int_tint(i, tnumber);
}

EMSCRIPTEN_KEEPALIVE
Temporal * div_tfloat_float_w(const Temporal * tnumber, double d) {
  return div_tfloat_float(tnumber, d);
}

EMSCRIPTEN_KEEPALIVE
Temporal * div_tint_int_w(const Temporal * tnumber, int i) {
  return div_tint_int(tnumber, i);
}

EMSCRIPTEN_KEEPALIVE
Temporal * div_tnumber_tnumber_w(const Temporal * tnumber1, const Temporal * tnumber2) {
  return div_tnumber_tnumber(tnumber1, tnumber2);
}

EMSCRIPTEN_KEEPALIVE
Temporal * mult_float_tfloat_w(double d, const Temporal * tnumber) {
  return mult_float_tfloat(d, tnumber);
}

EMSCRIPTEN_KEEPALIVE
Temporal * mult_int_tint_w(int i, const Temporal * tnumber) {
  return mult_int_tint(i, tnumber);
}

EMSCRIPTEN_KEEPALIVE
Temporal * mult_tfloat_float_w(const Temporal * tnumber, double d) {
  return mult_tfloat_float(tnumber, d);
}

EMSCRIPTEN_KEEPALIVE
Temporal * mult_tint_int_w(const Temporal * tnumber, int i) {
  return mult_tint_int(tnumber, i);
}

EMSCRIPTEN_KEEPALIVE
Temporal * mult_tnumber_tnumber_w(const Temporal * tnumber1, const Temporal * tnumber2) {
  return mult_tnumber_tnumber(tnumber1, tnumber2);
}

EMSCRIPTEN_KEEPALIVE
Temporal * sub_float_tfloat_w(double d, const Temporal * tnumber) {
  return sub_float_tfloat(d, tnumber);
}

EMSCRIPTEN_KEEPALIVE
Temporal * sub_int_tint_w(int i, const Temporal * tnumber) {
  return sub_int_tint(i, tnumber);
}

EMSCRIPTEN_KEEPALIVE
Temporal * sub_tfloat_float_w(const Temporal * tnumber, double d) {
  return sub_tfloat_float(tnumber, d);
}

EMSCRIPTEN_KEEPALIVE
Temporal * sub_tint_int_w(const Temporal * tnumber, int i) {
  return sub_tint_int(tnumber, i);
}

EMSCRIPTEN_KEEPALIVE
Temporal * sub_tnumber_tnumber_w(const Temporal * tnumber1, const Temporal * tnumber2) {
  return sub_tnumber_tnumber(tnumber1, tnumber2);
}

EMSCRIPTEN_KEEPALIVE
Temporal * temporal_derivative_w(const Temporal * temp) {
  return temporal_derivative(temp);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tfloat_exp_w(const Temporal * temp) {
  return tfloat_exp(temp);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tfloat_ln_w(const Temporal * temp) {
  return tfloat_ln(temp);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tfloat_log10_w(const Temporal * temp) {
  return tfloat_log10(temp);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tnumber_abs_w(const Temporal * temp) {
  return tnumber_abs(temp);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tnumber_trend_w(const Temporal * temp) {
  return tnumber_trend(temp);
}

EMSCRIPTEN_KEEPALIVE
double float_angular_difference_w(double degrees1, double degrees2) {
  return float_angular_difference(degrees1, degrees2);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tnumber_angular_difference_w(const Temporal * temp) {
  return tnumber_angular_difference(temp);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tnumber_delta_value_w(const Temporal * temp) {
  return tnumber_delta_value(temp);
}

EMSCRIPTEN_KEEPALIVE
Temporal * textcat_text_ttext_w(const char * txt, const Temporal * temp) {
  return textcat_text_ttext(cstring2text(txt), temp);
}

EMSCRIPTEN_KEEPALIVE
Temporal * textcat_ttext_text_w(const Temporal * temp, const char * txt) {
  return textcat_ttext_text(temp, cstring2text(txt));
}

EMSCRIPTEN_KEEPALIVE
Temporal * textcat_ttext_ttext_w(const Temporal * temp1, const Temporal * temp2) {
  return textcat_ttext_ttext(temp1, temp2);
}

EMSCRIPTEN_KEEPALIVE
Temporal * ttext_initcap_w(const Temporal * temp) {
  return ttext_initcap(temp);
}

EMSCRIPTEN_KEEPALIVE
Temporal * ttext_upper_w(const Temporal * temp) {
  return ttext_upper(temp);
}

EMSCRIPTEN_KEEPALIVE
Temporal * ttext_lower_w(const Temporal * temp) {
  return ttext_lower(temp);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tdistance_tfloat_float_w(const Temporal * temp, double d) {
  return tdistance_tfloat_float(temp, d);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tdistance_tint_int_w(const Temporal * temp, int i) {
  return tdistance_tint_int(temp, i);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tdistance_tnumber_tnumber_w(const Temporal * temp1, const Temporal * temp2) {
  return tdistance_tnumber_tnumber(temp1, temp2);
}

EMSCRIPTEN_KEEPALIVE
double nad_tboxfloat_tboxfloat_w(const TBox * box1, const TBox * box2) {
  return nad_tboxfloat_tboxfloat(box1, box2);
}

EMSCRIPTEN_KEEPALIVE
int nad_tboxint_tboxint_w(const TBox * box1, const TBox * box2) {
  return nad_tboxint_tboxint(box1, box2);
}

EMSCRIPTEN_KEEPALIVE
double nad_tfloat_float_w(const Temporal * temp, double d) {
  return nad_tfloat_float(temp, d);
}

EMSCRIPTEN_KEEPALIVE
double nad_tfloat_tfloat_w(const Temporal * temp1, const Temporal * temp2) {
  return nad_tfloat_tfloat(temp1, temp2);
}

EMSCRIPTEN_KEEPALIVE
double nad_tfloat_tbox_w(const Temporal * temp, const TBox * box) {
  return nad_tfloat_tbox(temp, box);
}

EMSCRIPTEN_KEEPALIVE
int nad_tint_int_w(const Temporal * temp, int i) {
  return nad_tint_int(temp, i);
}

EMSCRIPTEN_KEEPALIVE
int nad_tint_tbox_w(const Temporal * temp, const TBox * box) {
  return nad_tint_tbox(temp, box);
}

EMSCRIPTEN_KEEPALIVE
int nad_tint_tint_w(const Temporal * temp1, const Temporal * temp2) {
  return nad_tint_tint(temp1, temp2);
}

EMSCRIPTEN_KEEPALIVE
SkipList * tbool_tand_transfn_w(SkipList * state, const Temporal * temp) {
  return tbool_tand_transfn(state, temp);
}

EMSCRIPTEN_KEEPALIVE
SkipList * tbool_tor_transfn_w(SkipList * state, const Temporal * temp) {
  return tbool_tor_transfn(state, temp);
}

EMSCRIPTEN_KEEPALIVE
Span * temporal_extent_transfn_w(Span * s, const Temporal * temp) {
  return temporal_extent_transfn(s, temp);
}

EMSCRIPTEN_KEEPALIVE
Temporal * temporal_tagg_finalfn_w(SkipList * state) {
  return temporal_tagg_finalfn(state);
}

EMSCRIPTEN_KEEPALIVE
SkipList * temporal_tcount_transfn_w(SkipList * state, const Temporal * temp) {
  return temporal_tcount_transfn(state, temp);
}

EMSCRIPTEN_KEEPALIVE
SkipList * tfloat_tmax_transfn_w(SkipList * state, const Temporal * temp) {
  return tfloat_tmax_transfn(state, temp);
}

EMSCRIPTEN_KEEPALIVE
SkipList * tfloat_tmin_transfn_w(SkipList * state, const Temporal * temp) {
  return tfloat_tmin_transfn(state, temp);
}

EMSCRIPTEN_KEEPALIVE
SkipList * tfloat_tsum_transfn_w(SkipList * state, const Temporal * temp) {
  return tfloat_tsum_transfn(state, temp);
}

EMSCRIPTEN_KEEPALIVE
SkipList * tfloat_wmax_transfn_w(SkipList * state, const Temporal * temp, const Interval * interv) {
  return tfloat_wmax_transfn(state, temp, interv);
}

EMSCRIPTEN_KEEPALIVE
SkipList * tfloat_wmin_transfn_w(SkipList * state, const Temporal * temp, const Interval * interv) {
  return tfloat_wmin_transfn(state, temp, interv);
}

EMSCRIPTEN_KEEPALIVE
SkipList * tfloat_wsum_transfn_w(SkipList * state, const Temporal * temp, const Interval * interv) {
  return tfloat_wsum_transfn(state, temp, interv);
}

EMSCRIPTEN_KEEPALIVE
SkipList * timestamptz_tcount_transfn_w(SkipList * state, long long t) {
  return timestamptz_tcount_transfn(state, (TimestampTz) t);
}

EMSCRIPTEN_KEEPALIVE
SkipList * tint_tmax_transfn_w(SkipList * state, const Temporal * temp) {
  return tint_tmax_transfn(state, temp);
}

EMSCRIPTEN_KEEPALIVE
SkipList * tint_tmin_transfn_w(SkipList * state, const Temporal * temp) {
  return tint_tmin_transfn(state, temp);
}

EMSCRIPTEN_KEEPALIVE
SkipList * tint_tsum_transfn_w(SkipList * state, const Temporal * temp) {
  return tint_tsum_transfn(state, temp);
}

EMSCRIPTEN_KEEPALIVE
SkipList * tint_wmax_transfn_w(SkipList * state, const Temporal * temp, const Interval * interv) {
  return tint_wmax_transfn(state, temp, interv);
}

EMSCRIPTEN_KEEPALIVE
SkipList * tint_wmin_transfn_w(SkipList * state, const Temporal * temp, const Interval * interv) {
  return tint_wmin_transfn(state, temp, interv);
}

EMSCRIPTEN_KEEPALIVE
SkipList * tint_wsum_transfn_w(SkipList * state, const Temporal * temp, const Interval * interv) {
  return tint_wsum_transfn(state, temp, interv);
}

EMSCRIPTEN_KEEPALIVE
TBox * tnumber_extent_transfn_w(TBox * box, const Temporal * temp) {
  return tnumber_extent_transfn(box, temp);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tnumber_tavg_finalfn_w(SkipList * state) {
  return tnumber_tavg_finalfn(state);
}

EMSCRIPTEN_KEEPALIVE
SkipList * tnumber_tavg_transfn_w(SkipList * state, const Temporal * temp) {
  return tnumber_tavg_transfn(state, temp);
}

EMSCRIPTEN_KEEPALIVE
SkipList * tnumber_wavg_transfn_w(SkipList * state, const Temporal * temp, const Interval * interv) {
  return tnumber_wavg_transfn(state, temp, interv);
}

EMSCRIPTEN_KEEPALIVE
SkipList * tstzset_tcount_transfn_w(SkipList * state, const Set * s) {
  return tstzset_tcount_transfn(state, s);
}

EMSCRIPTEN_KEEPALIVE
SkipList * tstzspan_tcount_transfn_w(SkipList * state, const Span * s) {
  return tstzspan_tcount_transfn(state, s);
}

EMSCRIPTEN_KEEPALIVE
SkipList * tstzspanset_tcount_transfn_w(SkipList * state, const SpanSet * ss) {
  return tstzspanset_tcount_transfn(state, ss);
}

EMSCRIPTEN_KEEPALIVE
SkipList * ttext_tmax_transfn_w(SkipList * state, const Temporal * temp) {
  return ttext_tmax_transfn(state, temp);
}

EMSCRIPTEN_KEEPALIVE
SkipList * ttext_tmin_transfn_w(SkipList * state, const Temporal * temp) {
  return ttext_tmin_transfn(state, temp);
}

EMSCRIPTEN_KEEPALIVE
Temporal * temporal_simplify_dp_w(const Temporal * temp, double eps_dist, int synchronized) {
  return temporal_simplify_dp(temp, eps_dist, (bool) synchronized);
}

EMSCRIPTEN_KEEPALIVE
Temporal * temporal_simplify_max_dist_w(const Temporal * temp, double eps_dist, int synchronized) {
  return temporal_simplify_max_dist(temp, eps_dist, (bool) synchronized);
}

EMSCRIPTEN_KEEPALIVE
Temporal * temporal_simplify_min_dist_w(const Temporal * temp, double dist) {
  return temporal_simplify_min_dist(temp, dist);
}

EMSCRIPTEN_KEEPALIVE
Temporal * temporal_simplify_min_tdelta_w(const Temporal * temp, const Interval * mint) {
  return temporal_simplify_min_tdelta(temp, mint);
}

EMSCRIPTEN_KEEPALIVE
Temporal * temporal_tprecision_w(const Temporal * temp, const Interval * duration, long long origin) {
  return temporal_tprecision(temp, duration, (TimestampTz) origin);
}

EMSCRIPTEN_KEEPALIVE
Temporal * temporal_tsample_w(const Temporal * temp, const Interval * duration, long long origin, interpType interp) {
  return temporal_tsample(temp, duration, (TimestampTz) origin, interp);
}

EMSCRIPTEN_KEEPALIVE
double temporal_dyntimewarp_distance_w(const Temporal * temp1, const Temporal * temp2) {
  return temporal_dyntimewarp_distance(temp1, temp2);
}

EMSCRIPTEN_KEEPALIVE
Match * temporal_dyntimewarp_path_w(const Temporal * temp1, const Temporal * temp2, int * count) {
  return temporal_dyntimewarp_path(temp1, temp2, count);
}

EMSCRIPTEN_KEEPALIVE
double temporal_frechet_distance_w(const Temporal * temp1, const Temporal * temp2) {
  return temporal_frechet_distance(temp1, temp2);
}

EMSCRIPTEN_KEEPALIVE
Match * temporal_frechet_path_w(const Temporal * temp1, const Temporal * temp2, int * count) {
  return temporal_frechet_path(temp1, temp2, count);
}

EMSCRIPTEN_KEEPALIVE
double temporal_hausdorff_distance_w(const Temporal * temp1, const Temporal * temp2) {
  return temporal_hausdorff_distance(temp1, temp2);
}

EMSCRIPTEN_KEEPALIVE
Span * temporal_time_bins_w(const Temporal * temp, const Interval * duration, long long origin, int * count) {
  return temporal_time_bins(temp, duration, (TimestampTz) origin, count);
}

EMSCRIPTEN_KEEPALIVE
Temporal ** temporal_time_split_w(const Temporal * temp, const Interval * duration, long long torigin, TimestampTz ** time_bins, int * count) {
  return temporal_time_split(temp, duration, (TimestampTz) torigin, time_bins, count);
}

EMSCRIPTEN_KEEPALIVE
TBox * tfloat_time_boxes_w(const Temporal * temp, const Interval * duration, long long torigin, int * count) {
  return tfloat_time_boxes(temp, duration, (TimestampTz) torigin, count);
}

EMSCRIPTEN_KEEPALIVE
Span * tfloat_value_bins_w(const Temporal * temp, double vsize, double vorigin, int * count) {
  return tfloat_value_bins(temp, vsize, vorigin, count);
}

EMSCRIPTEN_KEEPALIVE
TBox * tfloat_value_boxes_w(const Temporal * temp, double vsize, double vorigin, int * count) {
  return tfloat_value_boxes(temp, vsize, vorigin, count);
}

EMSCRIPTEN_KEEPALIVE
Temporal ** tfloat_value_split_w(const Temporal * temp, double size, double origin, double ** bins, int * count) {
  return tfloat_value_split(temp, size, origin, bins, count);
}

EMSCRIPTEN_KEEPALIVE
TBox * tfloat_value_time_boxes_w(const Temporal * temp, double vsize, const Interval * duration, double vorigin, long long torigin, int * count) {
  return tfloat_value_time_boxes(temp, vsize, duration, vorigin, (TimestampTz) torigin, count);
}

EMSCRIPTEN_KEEPALIVE
Temporal ** tfloat_value_time_split_w(const Temporal * temp, double vsize, const Interval * duration, double vorigin, long long torigin, double ** value_bins, TimestampTz ** time_bins, int * count) {
  return tfloat_value_time_split(temp, vsize, duration, vorigin, (TimestampTz) torigin, value_bins, time_bins, count);
}

EMSCRIPTEN_KEEPALIVE
TBox * tfloatbox_time_tiles_w(const TBox * box, const Interval * duration, long long torigin, int * count) {
  return tfloatbox_time_tiles(box, duration, (TimestampTz) torigin, count);
}

EMSCRIPTEN_KEEPALIVE
TBox * tfloatbox_value_tiles_w(const TBox * box, double vsize, double vorigin, int * count) {
  return tfloatbox_value_tiles(box, vsize, vorigin, count);
}

EMSCRIPTEN_KEEPALIVE
TBox * tfloatbox_value_time_tiles_w(const TBox * box, double vsize, const Interval * duration, double vorigin, long long torigin, int * count) {
  return tfloatbox_value_time_tiles(box, vsize, duration, vorigin, (TimestampTz) torigin, count);
}

EMSCRIPTEN_KEEPALIVE
TBox * tint_time_boxes_w(const Temporal * temp, const Interval * duration, long long torigin, int * count) {
  return tint_time_boxes(temp, duration, (TimestampTz) torigin, count);
}

EMSCRIPTEN_KEEPALIVE
Span * tint_value_bins_w(const Temporal * temp, int vsize, int vorigin, int * count) {
  return tint_value_bins(temp, vsize, vorigin, count);
}

EMSCRIPTEN_KEEPALIVE
TBox * tint_value_boxes_w(const Temporal * temp, int vsize, int vorigin, int * count) {
  return tint_value_boxes(temp, vsize, vorigin, count);
}

EMSCRIPTEN_KEEPALIVE
Temporal ** tint_value_split_w(const Temporal * temp, int vsize, int vorigin, int ** bins, int * count) {
  return tint_value_split(temp, vsize, vorigin, bins, count);
}

EMSCRIPTEN_KEEPALIVE
TBox * tint_value_time_boxes_w(const Temporal * temp, int vsize, const Interval * duration, int vorigin, long long torigin, int * count) {
  return tint_value_time_boxes(temp, vsize, duration, vorigin, (TimestampTz) torigin, count);
}

EMSCRIPTEN_KEEPALIVE
Temporal ** tint_value_time_split_w(const Temporal * temp, int size, const Interval * duration, int vorigin, long long torigin, int ** value_bins, TimestampTz ** time_bins, int * count) {
  return tint_value_time_split(temp, size, duration, vorigin, (TimestampTz) torigin, value_bins, time_bins, count);
}

EMSCRIPTEN_KEEPALIVE
TBox * tintbox_time_tiles_w(const TBox * box, const Interval * duration, long long torigin, int * count) {
  return tintbox_time_tiles(box, duration, (TimestampTz) torigin, count);
}

EMSCRIPTEN_KEEPALIVE
TBox * tintbox_value_tiles_w(const TBox * box, int xsize, int xorigin, int * count) {
  return tintbox_value_tiles(box, xsize, xorigin, count);
}

EMSCRIPTEN_KEEPALIVE
TBox * tintbox_value_time_tiles_w(const TBox * box, int xsize, const Interval * duration, int xorigin, long long torigin, int * count) {
  return tintbox_value_time_tiles(box, xsize, duration, xorigin, (TimestampTz) torigin, count);
}


/* === meos_geo.h === */

EMSCRIPTEN_KEEPALIVE
uint8_t * geo_as_ewkb_w(const int * gs, const char * endian, int * size) {
  return geo_as_ewkb(gs, endian, size);
}

EMSCRIPTEN_KEEPALIVE
char * geo_as_ewkt_w(const int * gs, int precision) {
  return geo_as_ewkt(gs, precision);
}

EMSCRIPTEN_KEEPALIVE
char * geo_as_geojson_w(const int * gs, int option, int precision, const char * srs) {
  return geo_as_geojson(gs, option, precision, srs);
}

EMSCRIPTEN_KEEPALIVE
char * geo_as_hexewkb_w(const int * gs, const char * endian) {
  return geo_as_hexewkb(gs, endian);
}

EMSCRIPTEN_KEEPALIVE
char * geo_as_text_w(const int * gs, int precision) {
  return geo_as_text(gs, precision);
}

EMSCRIPTEN_KEEPALIVE
int * geo_from_ewkb_w(const uint8_t * wkb, int wkb_size, int32 srid) {
  return geo_from_ewkb(wkb, wkb_size, srid);
}

EMSCRIPTEN_KEEPALIVE
int * geo_from_geojson_w(const char * geojson) {
  return geo_from_geojson(geojson);
}

EMSCRIPTEN_KEEPALIVE
int * geo_from_text_w(const char * wkt, int32_t srid) {
  return geo_from_text(wkt, srid);
}

EMSCRIPTEN_KEEPALIVE
char * geo_out_w(const int * gs) {
  return geo_out(gs);
}

EMSCRIPTEN_KEEPALIVE
int * geog_from_hexewkb_w(const char * wkt) {
  return geog_from_hexewkb(wkt);
}

EMSCRIPTEN_KEEPALIVE
int * geog_in_w(const char * str, int32 typmod) {
  return geog_in(str, typmod);
}

EMSCRIPTEN_KEEPALIVE
int * geom_from_hexewkb_w(const char * wkt) {
  return geom_from_hexewkb(wkt);
}

EMSCRIPTEN_KEEPALIVE
int * geom_in_w(const char * str, int32 typmod) {
  return geom_in(str, typmod);
}

EMSCRIPTEN_KEEPALIVE
int * box3d_make_w(double xmin, double xmax, double ymin, double ymax, double zmin, double zmax, int32_t srid) {
  return box3d_make(xmin, xmax, ymin, ymax, zmin, zmax, srid);
}

EMSCRIPTEN_KEEPALIVE
char * box3d_out_w(const int * box, int maxdd) {
  return box3d_out(box, maxdd);
}

EMSCRIPTEN_KEEPALIVE
int * gbox_make_w(int hasz, double xmin, double xmax, double ymin, double ymax, double zmin, double zmax) {
  return gbox_make((bool) hasz, xmin, xmax, ymin, ymax, zmin, zmax);
}

EMSCRIPTEN_KEEPALIVE
char * gbox_out_w(const int * box, int maxdd) {
  return gbox_out(box, maxdd);
}

EMSCRIPTEN_KEEPALIVE
int * geo_copy_w(const int * g) {
  return geo_copy(g);
}

EMSCRIPTEN_KEEPALIVE
int * geogpoint_make2d_w(int32_t srid, double x, double y) {
  return geogpoint_make2d(srid, x, y);
}

EMSCRIPTEN_KEEPALIVE
int * geogpoint_make3dz_w(int32_t srid, double x, double y, double z) {
  return geogpoint_make3dz(srid, x, y, z);
}

EMSCRIPTEN_KEEPALIVE
int * geompoint_make2d_w(int32_t srid, double x, double y) {
  return geompoint_make2d(srid, x, y);
}

EMSCRIPTEN_KEEPALIVE
int * geompoint_make3dz_w(int32_t srid, double x, double y, double z) {
  return geompoint_make3dz(srid, x, y, z);
}

EMSCRIPTEN_KEEPALIVE
int * geom_to_geog_w(const int * geom) {
  return geom_to_geog(geom);
}

EMSCRIPTEN_KEEPALIVE
int * geog_to_geom_w(const int * geog) {
  return geog_to_geom(geog);
}

EMSCRIPTEN_KEEPALIVE
int geo_is_empty_w(const int * g) {
  return (int) geo_is_empty(g);
}

EMSCRIPTEN_KEEPALIVE
int geo_is_unitary_w(const int * gs) {
  return (int) geo_is_unitary(gs);
}

EMSCRIPTEN_KEEPALIVE
const char * geo_typename_w(int type) {
  return geo_typename(type);
}

EMSCRIPTEN_KEEPALIVE
double geog_area_w(const int * g, int use_spheroid) {
  return geog_area(g, (bool) use_spheroid);
}

EMSCRIPTEN_KEEPALIVE
int * geog_centroid_w(const int * g, int use_spheroid) {
  return geog_centroid(g, (bool) use_spheroid);
}

EMSCRIPTEN_KEEPALIVE
double geog_length_w(const int * g, int use_spheroid) {
  return geog_length(g, (bool) use_spheroid);
}

EMSCRIPTEN_KEEPALIVE
double geog_perimeter_w(const int * g, int use_spheroid) {
  return geog_perimeter(g, (bool) use_spheroid);
}

EMSCRIPTEN_KEEPALIVE
double geom_azimuth_w(const int * gs1, const int * gs2) {
  double r;
  if (!geom_azimuth(gs1, gs2, &r)) return 0.0;
  return r;
}

EMSCRIPTEN_KEEPALIVE
double geom_length_w(const int * gs) {
  return geom_length(gs);
}

EMSCRIPTEN_KEEPALIVE
double geom_perimeter_w(const int * gs) {
  return geom_perimeter(gs);
}

EMSCRIPTEN_KEEPALIVE
int line_numpoints_w(const int * gs) {
  return line_numpoints(gs);
}

EMSCRIPTEN_KEEPALIVE
int * line_point_n_w(const int * geom, int n) {
  return line_point_n(geom, n);
}

EMSCRIPTEN_KEEPALIVE
int * geo_reverse_w(const int * gs) {
  return geo_reverse(gs);
}

EMSCRIPTEN_KEEPALIVE
int * geo_round_w(const int * gs, int maxdd) {
  return geo_round(gs, maxdd);
}

EMSCRIPTEN_KEEPALIVE
int * geo_set_srid_w(const int * gs, int32_t srid) {
  return geo_set_srid(gs, srid);
}

EMSCRIPTEN_KEEPALIVE
int32_t geo_srid_w(const int * gs) {
  return geo_srid(gs);
}

EMSCRIPTEN_KEEPALIVE
int * geo_transform_w(const int * geom, int32_t srid_to) {
  return geo_transform(geom, srid_to);
}

EMSCRIPTEN_KEEPALIVE
int * geo_transform_pipeline_w(const int * gs, char * pipeline, int32_t srid_to, int is_forward) {
  return geo_transform_pipeline(gs, pipeline, srid_to, (bool) is_forward);
}

EMSCRIPTEN_KEEPALIVE
int * geo_collect_garray_w(int ** gsarr, int count) {
  return geo_collect_garray(gsarr, count);
}

EMSCRIPTEN_KEEPALIVE
int * geo_makeline_garray_w(int ** gsarr, int count) {
  return geo_makeline_garray(gsarr, count);
}

EMSCRIPTEN_KEEPALIVE
int geo_num_points_w(const int * gs) {
  return geo_num_points(gs);
}

EMSCRIPTEN_KEEPALIVE
int geo_num_geos_w(const int * gs) {
  return geo_num_geos(gs);
}

EMSCRIPTEN_KEEPALIVE
int * geo_geo_n_w(const int * geom, int n) {
  return geo_geo_n(geom, n);
}

EMSCRIPTEN_KEEPALIVE
int ** geo_pointarr_w(const int * gs, int * count) {
  return geo_pointarr(gs, count);
}

EMSCRIPTEN_KEEPALIVE
int * geo_points_w(const int * gs) {
  return geo_points(gs);
}

EMSCRIPTEN_KEEPALIVE
int * geom_array_union_w(int ** gsarr, int count) {
  return geom_array_union(gsarr, count);
}

EMSCRIPTEN_KEEPALIVE
int * geom_boundary_w(const int * gs) {
  return geom_boundary(gs);
}

EMSCRIPTEN_KEEPALIVE
int * geom_buffer_w(const int * gs, double size, const char * params) {
  return geom_buffer(gs, size, params);
}

EMSCRIPTEN_KEEPALIVE
int * geom_centroid_w(const int * gs) {
  return geom_centroid(gs);
}

EMSCRIPTEN_KEEPALIVE
int * geom_convex_hull_w(const int * gs) {
  return geom_convex_hull(gs);
}

EMSCRIPTEN_KEEPALIVE
int * geom_difference2d_w(const int * gs1, const int * gs2) {
  return geom_difference2d(gs1, gs2);
}

EMSCRIPTEN_KEEPALIVE
int * geom_intersection2d_w(const int * gs1, const int * gs2) {
  return geom_intersection2d(gs1, gs2);
}

EMSCRIPTEN_KEEPALIVE
int * geom_intersection2d_coll_w(const int * gs1, const int * gs2) {
  return geom_intersection2d_coll(gs1, gs2);
}

EMSCRIPTEN_KEEPALIVE
int * geom_min_bounding_radius_w(const int * geom, double * radius) {
  return geom_min_bounding_radius(geom, radius);
}

EMSCRIPTEN_KEEPALIVE
int * geom_shortestline2d_w(const int * gs1, const int * s2) {
  return geom_shortestline2d(gs1, s2);
}

EMSCRIPTEN_KEEPALIVE
int * geom_shortestline3d_w(const int * gs1, const int * s2) {
  return geom_shortestline3d(gs1, s2);
}

EMSCRIPTEN_KEEPALIVE
int * geom_unary_union_w(const int * gs, double prec) {
  return geom_unary_union(gs, prec);
}

EMSCRIPTEN_KEEPALIVE
int * line_interpolate_point_w(const int * gs, double distance_fraction, int repeat) {
  return line_interpolate_point(gs, distance_fraction, (bool) repeat);
}

EMSCRIPTEN_KEEPALIVE
double line_locate_point_w(const int * gs1, const int * gs2) {
  return line_locate_point(gs1, gs2);
}

EMSCRIPTEN_KEEPALIVE
int * line_substring_w(const int * gs, double from, double to) {
  return line_substring(gs, from, to);
}

EMSCRIPTEN_KEEPALIVE
int geog_dwithin_w(const int * g1, const int * g2, double tolerance, int use_spheroid) {
  return (int) geog_dwithin(g1, g2, tolerance, (bool) use_spheroid);
}

EMSCRIPTEN_KEEPALIVE
int geog_intersects_w(const int * gs1, const int * gs2, int use_spheroid) {
  return (int) geog_intersects(gs1, gs2, (bool) use_spheroid);
}

EMSCRIPTEN_KEEPALIVE
int geom_contains_w(const int * gs1, const int * gs2) {
  return (int) geom_contains(gs1, gs2);
}

EMSCRIPTEN_KEEPALIVE
int geom_covers_w(const int * gs1, const int * gs2) {
  return (int) geom_covers(gs1, gs2);
}

EMSCRIPTEN_KEEPALIVE
int geom_disjoint2d_w(const int * gs1, const int * gs2) {
  return (int) geom_disjoint2d(gs1, gs2);
}

EMSCRIPTEN_KEEPALIVE
int geom_dwithin2d_w(const int * gs1, const int * gs2, double tolerance) {
  return (int) geom_dwithin2d(gs1, gs2, tolerance);
}

EMSCRIPTEN_KEEPALIVE
int geom_dwithin3d_w(const int * gs1, const int * gs2, double tolerance) {
  return (int) geom_dwithin3d(gs1, gs2, tolerance);
}

EMSCRIPTEN_KEEPALIVE
int geom_intersects2d_w(const int * gs1, const int * gs2) {
  return (int) geom_intersects2d(gs1, gs2);
}

EMSCRIPTEN_KEEPALIVE
int geom_intersects3d_w(const int * gs1, const int * gs2) {
  return (int) geom_intersects3d(gs1, gs2);
}

EMSCRIPTEN_KEEPALIVE
int geom_relate_pattern_w(const int * gs1, const int * gs2, char * patt) {
  return (int) geom_relate_pattern(gs1, gs2, patt);
}

EMSCRIPTEN_KEEPALIVE
int geom_touches_w(const int * gs1, const int * gs2) {
  return (int) geom_touches(gs1, gs2);
}

EMSCRIPTEN_KEEPALIVE
STBox * geo_stboxes_w(const int * gs, int * count) {
  return geo_stboxes(gs, count);
}

EMSCRIPTEN_KEEPALIVE
STBox * geo_split_each_n_stboxes_w(const int * gs, int elem_count, int * count) {
  return geo_split_each_n_stboxes(gs, elem_count, count);
}

EMSCRIPTEN_KEEPALIVE
STBox * geo_split_n_stboxes_w(const int * gs, int box_count, int * count) {
  return geo_split_n_stboxes(gs, box_count, count);
}

EMSCRIPTEN_KEEPALIVE
double geog_distance_w(const int * g1, const int * g2) {
  return geog_distance(g1, g2);
}

EMSCRIPTEN_KEEPALIVE
double geom_distance2d_w(const int * gs1, const int * gs2) {
  return geom_distance2d(gs1, gs2);
}

EMSCRIPTEN_KEEPALIVE
double geom_distance3d_w(const int * gs1, const int * gs2) {
  return geom_distance3d(gs1, gs2);
}

EMSCRIPTEN_KEEPALIVE
int geo_equals_w(const int * gs1, const int * gs2) {
  return geo_equals(gs1, gs2);
}

EMSCRIPTEN_KEEPALIVE
int geo_same_w(const int * gs1, const int * gs2) {
  return (int) geo_same(gs1, gs2);
}

EMSCRIPTEN_KEEPALIVE
Set * geogset_in_w(const char * str) {
  return geogset_in(str);
}

EMSCRIPTEN_KEEPALIVE
Set * geomset_in_w(const char * str) {
  return geomset_in(str);
}

EMSCRIPTEN_KEEPALIVE
char * spatialset_as_text_w(const Set * set, int maxdd) {
  return spatialset_as_text(set, maxdd);
}

EMSCRIPTEN_KEEPALIVE
char * spatialset_as_ewkt_w(const Set * set, int maxdd) {
  return spatialset_as_ewkt(set, maxdd);
}

EMSCRIPTEN_KEEPALIVE
Set * geoset_make_w(int ** values, int count) {
  return geoset_make(values, count);
}

EMSCRIPTEN_KEEPALIVE
Set * geo_to_set_w(const int * gs) {
  return geo_to_set(gs);
}

EMSCRIPTEN_KEEPALIVE
int * geoset_end_value_w(const Set * s) {
  return geoset_end_value(s);
}

EMSCRIPTEN_KEEPALIVE
int * geoset_start_value_w(const Set * s) {
  return geoset_start_value(s);
}

EMSCRIPTEN_KEEPALIVE
int * geoset_value_n_w(const Set * s, int n) {
  int * r;
  if (!geoset_value_n(s, n, &r)) return NULL;
  return r;
}

EMSCRIPTEN_KEEPALIVE
int ** geoset_values_w(const Set * s) {
  return geoset_values(s);
}

EMSCRIPTEN_KEEPALIVE
int contained_geo_set_w(const int * gs, const Set * s) {
  return (int) contained_geo_set(gs, s);
}

EMSCRIPTEN_KEEPALIVE
int contains_set_geo_w(const Set * s, int * gs) {
  return (int) contains_set_geo(s, gs);
}

EMSCRIPTEN_KEEPALIVE
Set * geo_union_transfn_w(Set * state, const int * gs) {
  return geo_union_transfn(state, gs);
}

EMSCRIPTEN_KEEPALIVE
Set * intersection_geo_set_w(const int * gs, const Set * s) {
  return intersection_geo_set(gs, s);
}

EMSCRIPTEN_KEEPALIVE
Set * intersection_set_geo_w(const Set * s, const int * gs) {
  return intersection_set_geo(s, gs);
}

EMSCRIPTEN_KEEPALIVE
Set * minus_geo_set_w(const int * gs, const Set * s) {
  return minus_geo_set(gs, s);
}

EMSCRIPTEN_KEEPALIVE
Set * minus_set_geo_w(const Set * s, const int * gs) {
  return minus_set_geo(s, gs);
}

EMSCRIPTEN_KEEPALIVE
Set * union_geo_set_w(const int * gs, const Set * s) {
  return union_geo_set(gs, s);
}

EMSCRIPTEN_KEEPALIVE
Set * union_set_geo_w(const Set * s, const int * gs) {
  return union_set_geo(s, gs);
}

EMSCRIPTEN_KEEPALIVE
Set * spatialset_set_srid_w(const Set * s, int32_t srid) {
  return spatialset_set_srid(s, srid);
}

EMSCRIPTEN_KEEPALIVE
int32_t spatialset_srid_w(const Set * s) {
  return spatialset_srid(s);
}

EMSCRIPTEN_KEEPALIVE
Set * spatialset_transform_w(const Set * s, int32_t srid) {
  return spatialset_transform(s, srid);
}

EMSCRIPTEN_KEEPALIVE
Set * spatialset_transform_pipeline_w(const Set * s, const char * pipelinestr, int32_t srid, int is_forward) {
  return spatialset_transform_pipeline(s, pipelinestr, srid, (bool) is_forward);
}

EMSCRIPTEN_KEEPALIVE
char * stbox_as_hexwkb_w(const STBox * box, uint8_t variant, int * size) {
  return stbox_as_hexwkb(box, variant, size);
}

EMSCRIPTEN_KEEPALIVE
uint8_t * stbox_as_wkb_w(const STBox * box, uint8_t variant, int * size_out) {
  return stbox_as_wkb(box, variant, size_out);
}

EMSCRIPTEN_KEEPALIVE
STBox * stbox_from_hexwkb_w(const char * hexwkb) {
  return stbox_from_hexwkb(hexwkb);
}

EMSCRIPTEN_KEEPALIVE
STBox * stbox_from_wkb_w(const uint8_t * wkb, int size) {
  return stbox_from_wkb(wkb, size);
}

EMSCRIPTEN_KEEPALIVE
STBox * stbox_in_w(const char * str) {
  return stbox_in(str);
}

EMSCRIPTEN_KEEPALIVE
char * stbox_out_w(const STBox * box, int maxdd) {
  return stbox_out(box, maxdd);
}

EMSCRIPTEN_KEEPALIVE
STBox * geo_timestamptz_to_stbox_w(const int * gs, long long t) {
  return geo_timestamptz_to_stbox(gs, (TimestampTz) t);
}

EMSCRIPTEN_KEEPALIVE
STBox * geo_tstzspan_to_stbox_w(const int * gs, const Span * s) {
  return geo_tstzspan_to_stbox(gs, s);
}

EMSCRIPTEN_KEEPALIVE
STBox * stbox_copy_w(const STBox * box) {
  return stbox_copy(box);
}

EMSCRIPTEN_KEEPALIVE
STBox * stbox_make_w(int hasx, int hasz, int geodetic, int32 srid, double xmin, double xmax, double ymin, double ymax, double zmin, double zmax, const Span * s) {
  return stbox_make((bool) hasx, (bool) hasz, (bool) geodetic, srid, xmin, xmax, ymin, ymax, zmin, zmax, s);
}

EMSCRIPTEN_KEEPALIVE
STBox * geo_to_stbox_w(const int * gs) {
  return geo_to_stbox(gs);
}

EMSCRIPTEN_KEEPALIVE
STBox * spatialset_to_stbox_w(const Set * s) {
  return spatialset_to_stbox(s);
}

EMSCRIPTEN_KEEPALIVE
int * stbox_to_box3d_w(const STBox * box) {
  return stbox_to_box3d(box);
}

EMSCRIPTEN_KEEPALIVE
int * stbox_to_gbox_w(const STBox * box) {
  return stbox_to_gbox(box);
}

EMSCRIPTEN_KEEPALIVE
int * stbox_to_geo_w(const STBox * box) {
  return stbox_to_geo(box);
}

EMSCRIPTEN_KEEPALIVE
Span * stbox_to_tstzspan_w(const STBox * box) {
  return stbox_to_tstzspan(box);
}

EMSCRIPTEN_KEEPALIVE
STBox * timestamptz_to_stbox_w(long long t) {
  return timestamptz_to_stbox((TimestampTz) t);
}

EMSCRIPTEN_KEEPALIVE
STBox * tstzset_to_stbox_w(const Set * s) {
  return tstzset_to_stbox(s);
}

EMSCRIPTEN_KEEPALIVE
STBox * tstzspan_to_stbox_w(const Span * s) {
  return tstzspan_to_stbox(s);
}

EMSCRIPTEN_KEEPALIVE
STBox * tstzspanset_to_stbox_w(const SpanSet * ss) {
  return tstzspanset_to_stbox(ss);
}

EMSCRIPTEN_KEEPALIVE
double stbox_area_w(const STBox * box, int spheroid) {
  return stbox_area(box, (bool) spheroid);
}

EMSCRIPTEN_KEEPALIVE
uint32 stbox_hash_w(const STBox * box) {
  return stbox_hash(box);
}

EMSCRIPTEN_KEEPALIVE
uint64 stbox_hash_extended_w(const STBox * box, uint64 seed) {
  return stbox_hash_extended(box, seed);
}

EMSCRIPTEN_KEEPALIVE
int stbox_hast_w(const STBox * box) {
  return (int) stbox_hast(box);
}

EMSCRIPTEN_KEEPALIVE
int stbox_hasx_w(const STBox * box) {
  return (int) stbox_hasx(box);
}

EMSCRIPTEN_KEEPALIVE
int stbox_hasz_w(const STBox * box) {
  return (int) stbox_hasz(box);
}

EMSCRIPTEN_KEEPALIVE
int stbox_isgeodetic_w(const STBox * box) {
  return (int) stbox_isgeodetic(box);
}

EMSCRIPTEN_KEEPALIVE
double stbox_perimeter_w(const STBox * box, int spheroid) {
  return stbox_perimeter(box, (bool) spheroid);
}

EMSCRIPTEN_KEEPALIVE
long long stbox_tmax_w(const STBox * box) {
  TimestampTz r;
  if (!stbox_tmax(box, &r)) return 0;
  return (long long) r;
}

EMSCRIPTEN_KEEPALIVE
int stbox_tmax_inc_w(const STBox * box) {
  bool r;
  if (!stbox_tmax_inc(box, &r)) return 0;
  return (int) r;
}

EMSCRIPTEN_KEEPALIVE
long long stbox_tmin_w(const STBox * box) {
  TimestampTz r;
  if (!stbox_tmin(box, &r)) return 0;
  return (long long) r;
}

EMSCRIPTEN_KEEPALIVE
int stbox_tmin_inc_w(const STBox * box) {
  bool r;
  if (!stbox_tmin_inc(box, &r)) return 0;
  return (int) r;
}

EMSCRIPTEN_KEEPALIVE
double stbox_volume_w(const STBox * box) {
  return stbox_volume(box);
}

EMSCRIPTEN_KEEPALIVE
double stbox_xmax_w(const STBox * box) {
  double r;
  if (!stbox_xmax(box, &r)) return 0.0;
  return r;
}

EMSCRIPTEN_KEEPALIVE
double stbox_xmin_w(const STBox * box) {
  double r;
  if (!stbox_xmin(box, &r)) return 0.0;
  return r;
}

EMSCRIPTEN_KEEPALIVE
double stbox_ymax_w(const STBox * box) {
  double r;
  if (!stbox_ymax(box, &r)) return 0.0;
  return r;
}

EMSCRIPTEN_KEEPALIVE
double stbox_ymin_w(const STBox * box) {
  double r;
  if (!stbox_ymin(box, &r)) return 0.0;
  return r;
}

EMSCRIPTEN_KEEPALIVE
double stbox_zmax_w(const STBox * box) {
  double r;
  if (!stbox_zmax(box, &r)) return 0.0;
  return r;
}

EMSCRIPTEN_KEEPALIVE
double stbox_zmin_w(const STBox * box) {
  double r;
  if (!stbox_zmin(box, &r)) return 0.0;
  return r;
}

EMSCRIPTEN_KEEPALIVE
STBox * stbox_expand_space_w(const STBox * box, double d) {
  return stbox_expand_space(box, d);
}

EMSCRIPTEN_KEEPALIVE
STBox * stbox_expand_time_w(const STBox * box, const Interval * interv) {
  return stbox_expand_time(box, interv);
}

EMSCRIPTEN_KEEPALIVE
STBox * stbox_get_space_w(const STBox * box) {
  return stbox_get_space(box);
}

EMSCRIPTEN_KEEPALIVE
STBox * stbox_quad_split_w(const STBox * box, int * count) {
  return stbox_quad_split(box, count);
}

EMSCRIPTEN_KEEPALIVE
STBox * stbox_round_w(const STBox * box, int maxdd) {
  return stbox_round(box, maxdd);
}

EMSCRIPTEN_KEEPALIVE
STBox * stbox_shift_scale_time_w(const STBox * box, const Interval * shift, const Interval * duration) {
  return stbox_shift_scale_time(box, shift, duration);
}

EMSCRIPTEN_KEEPALIVE
STBox * stboxarr_round_w(const STBox * boxarr, int count, int maxdd) {
  return stboxarr_round(boxarr, count, maxdd);
}

EMSCRIPTEN_KEEPALIVE
STBox * stbox_set_srid_w(const STBox * box, int32_t srid) {
  return stbox_set_srid(box, srid);
}

EMSCRIPTEN_KEEPALIVE
int32_t stbox_srid_w(const STBox * box) {
  return stbox_srid(box);
}

EMSCRIPTEN_KEEPALIVE
STBox * stbox_transform_w(const STBox * box, int32_t srid) {
  return stbox_transform(box, srid);
}

EMSCRIPTEN_KEEPALIVE
STBox * stbox_transform_pipeline_w(const STBox * box, const char * pipelinestr, int32_t srid, int is_forward) {
  return stbox_transform_pipeline(box, pipelinestr, srid, (bool) is_forward);
}

EMSCRIPTEN_KEEPALIVE
int adjacent_stbox_stbox_w(const STBox * box1, const STBox * box2) {
  return (int) adjacent_stbox_stbox(box1, box2);
}

EMSCRIPTEN_KEEPALIVE
int contained_stbox_stbox_w(const STBox * box1, const STBox * box2) {
  return (int) contained_stbox_stbox(box1, box2);
}

EMSCRIPTEN_KEEPALIVE
int contains_stbox_stbox_w(const STBox * box1, const STBox * box2) {
  return (int) contains_stbox_stbox(box1, box2);
}

EMSCRIPTEN_KEEPALIVE
int overlaps_stbox_stbox_w(const STBox * box1, const STBox * box2) {
  return (int) overlaps_stbox_stbox(box1, box2);
}

EMSCRIPTEN_KEEPALIVE
int same_stbox_stbox_w(const STBox * box1, const STBox * box2) {
  return (int) same_stbox_stbox(box1, box2);
}

EMSCRIPTEN_KEEPALIVE
int above_stbox_stbox_w(const STBox * box1, const STBox * box2) {
  return (int) above_stbox_stbox(box1, box2);
}

EMSCRIPTEN_KEEPALIVE
int after_stbox_stbox_w(const STBox * box1, const STBox * box2) {
  return (int) after_stbox_stbox(box1, box2);
}

EMSCRIPTEN_KEEPALIVE
int back_stbox_stbox_w(const STBox * box1, const STBox * box2) {
  return (int) back_stbox_stbox(box1, box2);
}

EMSCRIPTEN_KEEPALIVE
int before_stbox_stbox_w(const STBox * box1, const STBox * box2) {
  return (int) before_stbox_stbox(box1, box2);
}

EMSCRIPTEN_KEEPALIVE
int below_stbox_stbox_w(const STBox * box1, const STBox * box2) {
  return (int) below_stbox_stbox(box1, box2);
}

EMSCRIPTEN_KEEPALIVE
int front_stbox_stbox_w(const STBox * box1, const STBox * box2) {
  return (int) front_stbox_stbox(box1, box2);
}

EMSCRIPTEN_KEEPALIVE
int left_stbox_stbox_w(const STBox * box1, const STBox * box2) {
  return (int) left_stbox_stbox(box1, box2);
}

EMSCRIPTEN_KEEPALIVE
int overabove_stbox_stbox_w(const STBox * box1, const STBox * box2) {
  return (int) overabove_stbox_stbox(box1, box2);
}

EMSCRIPTEN_KEEPALIVE
int overafter_stbox_stbox_w(const STBox * box1, const STBox * box2) {
  return (int) overafter_stbox_stbox(box1, box2);
}

EMSCRIPTEN_KEEPALIVE
int overback_stbox_stbox_w(const STBox * box1, const STBox * box2) {
  return (int) overback_stbox_stbox(box1, box2);
}

EMSCRIPTEN_KEEPALIVE
int overbefore_stbox_stbox_w(const STBox * box1, const STBox * box2) {
  return (int) overbefore_stbox_stbox(box1, box2);
}

EMSCRIPTEN_KEEPALIVE
int overbelow_stbox_stbox_w(const STBox * box1, const STBox * box2) {
  return (int) overbelow_stbox_stbox(box1, box2);
}

EMSCRIPTEN_KEEPALIVE
int overfront_stbox_stbox_w(const STBox * box1, const STBox * box2) {
  return (int) overfront_stbox_stbox(box1, box2);
}

EMSCRIPTEN_KEEPALIVE
int overleft_stbox_stbox_w(const STBox * box1, const STBox * box2) {
  return (int) overleft_stbox_stbox(box1, box2);
}

EMSCRIPTEN_KEEPALIVE
int overright_stbox_stbox_w(const STBox * box1, const STBox * box2) {
  return (int) overright_stbox_stbox(box1, box2);
}

EMSCRIPTEN_KEEPALIVE
int right_stbox_stbox_w(const STBox * box1, const STBox * box2) {
  return (int) right_stbox_stbox(box1, box2);
}

EMSCRIPTEN_KEEPALIVE
STBox * union_stbox_stbox_w(const STBox * box1, const STBox * box2, int strict) {
  return union_stbox_stbox(box1, box2, (bool) strict);
}

EMSCRIPTEN_KEEPALIVE
STBox * intersection_stbox_stbox_w(const STBox * box1, const STBox * box2) {
  return intersection_stbox_stbox(box1, box2);
}

EMSCRIPTEN_KEEPALIVE
int stbox_cmp_w(const STBox * box1, const STBox * box2) {
  return stbox_cmp(box1, box2);
}

EMSCRIPTEN_KEEPALIVE
int stbox_eq_w(const STBox * box1, const STBox * box2) {
  return (int) stbox_eq(box1, box2);
}

EMSCRIPTEN_KEEPALIVE
int stbox_ge_w(const STBox * box1, const STBox * box2) {
  return (int) stbox_ge(box1, box2);
}

EMSCRIPTEN_KEEPALIVE
int stbox_gt_w(const STBox * box1, const STBox * box2) {
  return (int) stbox_gt(box1, box2);
}

EMSCRIPTEN_KEEPALIVE
int stbox_le_w(const STBox * box1, const STBox * box2) {
  return (int) stbox_le(box1, box2);
}

EMSCRIPTEN_KEEPALIVE
int stbox_lt_w(const STBox * box1, const STBox * box2) {
  return (int) stbox_lt(box1, box2);
}

EMSCRIPTEN_KEEPALIVE
int stbox_ne_w(const STBox * box1, const STBox * box2) {
  return (int) stbox_ne(box1, box2);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tgeogpoint_from_mfjson_w(const char * str) {
  return tgeogpoint_from_mfjson(str);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tgeogpoint_in_w(const char * str) {
  return tgeogpoint_in(str);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tgeography_from_mfjson_w(const char * mfjson) {
  return tgeography_from_mfjson(mfjson);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tgeography_in_w(const char * str) {
  return tgeography_in(str);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tgeometry_from_mfjson_w(const char * str) {
  return tgeometry_from_mfjson(str);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tgeometry_in_w(const char * str) {
  return tgeometry_in(str);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tgeompoint_from_mfjson_w(const char * str) {
  return tgeompoint_from_mfjson(str);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tgeompoint_in_w(const char * str) {
  return tgeompoint_in(str);
}

EMSCRIPTEN_KEEPALIVE
char * tspatial_as_ewkt_w(const Temporal * temp, int maxdd) {
  return tspatial_as_ewkt(temp, maxdd);
}

EMSCRIPTEN_KEEPALIVE
char * tspatial_as_text_w(const Temporal * temp, int maxdd) {
  return tspatial_as_text(temp, maxdd);
}

EMSCRIPTEN_KEEPALIVE
char * tspatial_out_w(const Temporal * temp, int maxdd) {
  return tspatial_out(temp, maxdd);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tgeo_from_base_temp_w(const int * gs, const Temporal * temp) {
  return tgeo_from_base_temp(gs, temp);
}

EMSCRIPTEN_KEEPALIVE
TInstant * tgeoinst_make_w(const int * gs, long long t) {
  return tgeoinst_make(gs, (TimestampTz) t);
}

EMSCRIPTEN_KEEPALIVE
TSequence * tgeoseq_from_base_tstzset_w(const int * gs, const Set * s) {
  return tgeoseq_from_base_tstzset(gs, s);
}

EMSCRIPTEN_KEEPALIVE
TSequence * tgeoseq_from_base_tstzspan_w(const int * gs, const Span * s, interpType interp) {
  return tgeoseq_from_base_tstzspan(gs, s, interp);
}

EMSCRIPTEN_KEEPALIVE
TSequenceSet * tgeoseqset_from_base_tstzspanset_w(const int * gs, const SpanSet * ss, interpType interp) {
  return tgeoseqset_from_base_tstzspanset(gs, ss, interp);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tpoint_from_base_temp_w(const int * gs, const Temporal * temp) {
  return tpoint_from_base_temp(gs, temp);
}

EMSCRIPTEN_KEEPALIVE
TInstant * tpointinst_make_w(const int * gs, long long t) {
  return tpointinst_make(gs, (TimestampTz) t);
}

EMSCRIPTEN_KEEPALIVE
TSequence * tpointseq_from_base_tstzset_w(const int * gs, const Set * s) {
  return tpointseq_from_base_tstzset(gs, s);
}

EMSCRIPTEN_KEEPALIVE
TSequence * tpointseq_from_base_tstzspan_w(const int * gs, const Span * s, interpType interp) {
  return tpointseq_from_base_tstzspan(gs, s, interp);
}

EMSCRIPTEN_KEEPALIVE
TSequence * tpointseq_make_coords_w(const double * xcoords, const double * ycoords, const double * zcoords, const TimestampTz * times, int count, int32 srid, int geodetic, int lower_inc, int upper_inc, interpType interp, int normalize) {
  return tpointseq_make_coords(xcoords, ycoords, zcoords, times, count, srid, (bool) geodetic, (bool) lower_inc, (bool) upper_inc, interp, (bool) normalize);
}

EMSCRIPTEN_KEEPALIVE
TSequenceSet * tpointseqset_from_base_tstzspanset_w(const int * gs, const SpanSet * ss, interpType interp) {
  return tpointseqset_from_base_tstzspanset(gs, ss, interp);
}

EMSCRIPTEN_KEEPALIVE
STBox * box3d_to_stbox_w(const int * box) {
  return box3d_to_stbox(box);
}

EMSCRIPTEN_KEEPALIVE
STBox * gbox_to_stbox_w(const int * box) {
  return gbox_to_stbox(box);
}

EMSCRIPTEN_KEEPALIVE
Temporal * geomeas_to_tpoint_w(const int * gs) {
  return geomeas_to_tpoint(gs);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tgeogpoint_to_tgeography_w(const Temporal * temp) {
  return tgeogpoint_to_tgeography(temp);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tgeography_to_tgeogpoint_w(const Temporal * temp) {
  return tgeography_to_tgeogpoint(temp);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tgeography_to_tgeometry_w(const Temporal * temp) {
  return tgeography_to_tgeometry(temp);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tgeometry_to_tgeography_w(const Temporal * temp) {
  return tgeometry_to_tgeography(temp);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tgeometry_to_tgeompoint_w(const Temporal * temp) {
  return tgeometry_to_tgeompoint(temp);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tgeompoint_to_tgeometry_w(const Temporal * temp) {
  return tgeompoint_to_tgeometry(temp);
}

EMSCRIPTEN_KEEPALIVE
int tpoint_as_mvtgeom_w(const Temporal * temp, const STBox * bounds, int32_t extent, int32_t buffer, int clip_geom, int ** gsarr, int64 ** timesarr, int * count) {
  return (int) tpoint_as_mvtgeom(temp, bounds, extent, buffer, (bool) clip_geom, gsarr, timesarr, count);
}

EMSCRIPTEN_KEEPALIVE
int * tpoint_tfloat_to_geomeas_w(const Temporal * tpoint, const Temporal * measure, int segmentize) {
  int * r;
  if (!tpoint_tfloat_to_geomeas(tpoint, measure, (bool) segmentize, &r)) return NULL;
  return r;
}

EMSCRIPTEN_KEEPALIVE
STBox * tspatial_to_stbox_w(const Temporal * temp) {
  return tspatial_to_stbox(temp);
}

EMSCRIPTEN_KEEPALIVE
double bearing_point_point_w(const int * gs1, const int * gs2) {
  double r;
  if (!bearing_point_point(gs1, gs2, &r)) return 0.0;
  return r;
}

EMSCRIPTEN_KEEPALIVE
Temporal * bearing_tpoint_point_w(const Temporal * temp, const int * gs, int invert) {
  return bearing_tpoint_point(temp, gs, (bool) invert);
}

EMSCRIPTEN_KEEPALIVE
Temporal * bearing_tpoint_tpoint_w(const Temporal * temp1, const Temporal * temp2) {
  return bearing_tpoint_tpoint(temp1, temp2);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tgeo_centroid_w(const Temporal * temp) {
  return tgeo_centroid(temp);
}

EMSCRIPTEN_KEEPALIVE
int * tgeo_convex_hull_w(const Temporal * temp) {
  return tgeo_convex_hull(temp);
}

EMSCRIPTEN_KEEPALIVE
int * tgeo_end_value_w(const Temporal * temp) {
  return tgeo_end_value(temp);
}

EMSCRIPTEN_KEEPALIVE
int * tgeo_start_value_w(const Temporal * temp) {
  return tgeo_start_value(temp);
}

EMSCRIPTEN_KEEPALIVE
int * tgeo_traversed_area_w(const Temporal * temp, int unary_union) {
  return tgeo_traversed_area(temp, (bool) unary_union);
}

EMSCRIPTEN_KEEPALIVE
int tgeo_value_at_timestamptz_w(const Temporal * temp, long long t, int strict, int ** value) {
  return (int) tgeo_value_at_timestamptz(temp, (TimestampTz) t, (bool) strict, value);
}

EMSCRIPTEN_KEEPALIVE
int * tgeo_value_n_w(const Temporal * temp, int n) {
  int * r;
  if (!tgeo_value_n(temp, n, &r)) return NULL;
  return r;
}

EMSCRIPTEN_KEEPALIVE
int ** tgeo_values_w(const Temporal * temp, int * count) {
  return tgeo_values(temp, count);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tpoint_angular_difference_w(const Temporal * temp) {
  return tpoint_angular_difference(temp);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tpoint_azimuth_w(const Temporal * temp) {
  return tpoint_azimuth(temp);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tpoint_cumulative_length_w(const Temporal * temp) {
  return tpoint_cumulative_length(temp);
}

EMSCRIPTEN_KEEPALIVE
double tpoint_direction_w(const Temporal * temp) {
  double r;
  if (!tpoint_direction(temp, &r)) return 0.0;
  return r;
}

EMSCRIPTEN_KEEPALIVE
Temporal * tpoint_get_x_w(const Temporal * temp) {
  return tpoint_get_x(temp);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tpoint_get_y_w(const Temporal * temp) {
  return tpoint_get_y(temp);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tpoint_get_z_w(const Temporal * temp) {
  return tpoint_get_z(temp);
}

EMSCRIPTEN_KEEPALIVE
int tpoint_is_simple_w(const Temporal * temp) {
  return (int) tpoint_is_simple(temp);
}

EMSCRIPTEN_KEEPALIVE
double tpoint_length_w(const Temporal * temp) {
  return tpoint_length(temp);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tpoint_speed_w(const Temporal * temp) {
  return tpoint_speed(temp);
}

EMSCRIPTEN_KEEPALIVE
int * tpoint_trajectory_w(const Temporal * temp, int unary_union) {
  return tpoint_trajectory(temp, (bool) unary_union);
}

EMSCRIPTEN_KEEPALIVE
int * tpoint_twcentroid_w(const Temporal * temp) {
  return tpoint_twcentroid(temp);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tgeo_affine_w(const Temporal * temp, const int * a) {
  return tgeo_affine(temp, a);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tgeo_scale_w(const Temporal * temp, const int * scale, const int * sorigin) {
  return tgeo_scale(temp, scale, sorigin);
}

EMSCRIPTEN_KEEPALIVE
Temporal ** tpoint_make_simple_w(const Temporal * temp, int * count) {
  return tpoint_make_simple(temp, count);
}

EMSCRIPTEN_KEEPALIVE
int32_t tspatial_srid_w(const Temporal * temp) {
  return tspatial_srid(temp);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tspatial_set_srid_w(const Temporal * temp, int32_t srid) {
  return tspatial_set_srid(temp, srid);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tspatial_transform_w(const Temporal * temp, int32_t srid) {
  return tspatial_transform(temp, srid);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tspatial_transform_pipeline_w(const Temporal * temp, const char * pipelinestr, int32_t srid, int is_forward) {
  return tspatial_transform_pipeline(temp, pipelinestr, srid, (bool) is_forward);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tgeo_at_geom_w(const Temporal * temp, const int * gs) {
  return tgeo_at_geom(temp, gs);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tgeo_at_stbox_w(const Temporal * temp, const STBox * box, int border_inc) {
  return tgeo_at_stbox(temp, box, (bool) border_inc);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tgeo_at_value_w(const Temporal * temp, int * gs) {
  return tgeo_at_value(temp, gs);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tgeo_minus_geom_w(const Temporal * temp, const int * gs) {
  return tgeo_minus_geom(temp, gs);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tgeo_minus_stbox_w(const Temporal * temp, const STBox * box, int border_inc) {
  return tgeo_minus_stbox(temp, box, (bool) border_inc);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tgeo_minus_value_w(const Temporal * temp, int * gs) {
  return tgeo_minus_value(temp, gs);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tpoint_at_geom_w(const Temporal * temp, const int * gs, const Span * zspan) {
  return tpoint_at_geom(temp, gs, zspan);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tpoint_at_value_w(const Temporal * temp, int * gs) {
  return tpoint_at_value(temp, gs);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tpoint_minus_geom_w(const Temporal * temp, const int * gs, const Span * zspan) {
  return tpoint_minus_geom(temp, gs, zspan);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tpoint_minus_value_w(const Temporal * temp, int * gs) {
  return tpoint_minus_value(temp, gs);
}

EMSCRIPTEN_KEEPALIVE
int always_eq_geo_tgeo_w(const int * gs, const Temporal * temp) {
  return always_eq_geo_tgeo(gs, temp);
}

EMSCRIPTEN_KEEPALIVE
int always_eq_tgeo_geo_w(const Temporal * temp, const int * gs) {
  return always_eq_tgeo_geo(temp, gs);
}

EMSCRIPTEN_KEEPALIVE
int always_eq_tgeo_tgeo_w(const Temporal * temp1, const Temporal * temp2) {
  return always_eq_tgeo_tgeo(temp1, temp2);
}

EMSCRIPTEN_KEEPALIVE
int always_ne_geo_tgeo_w(const int * gs, const Temporal * temp) {
  return always_ne_geo_tgeo(gs, temp);
}

EMSCRIPTEN_KEEPALIVE
int always_ne_tgeo_geo_w(const Temporal * temp, const int * gs) {
  return always_ne_tgeo_geo(temp, gs);
}

EMSCRIPTEN_KEEPALIVE
int always_ne_tgeo_tgeo_w(const Temporal * temp1, const Temporal * temp2) {
  return always_ne_tgeo_tgeo(temp1, temp2);
}

EMSCRIPTEN_KEEPALIVE
int ever_eq_geo_tgeo_w(const int * gs, const Temporal * temp) {
  return ever_eq_geo_tgeo(gs, temp);
}

EMSCRIPTEN_KEEPALIVE
int ever_eq_tgeo_geo_w(const Temporal * temp, const int * gs) {
  return ever_eq_tgeo_geo(temp, gs);
}

EMSCRIPTEN_KEEPALIVE
int ever_eq_tgeo_tgeo_w(const Temporal * temp1, const Temporal * temp2) {
  return ever_eq_tgeo_tgeo(temp1, temp2);
}

EMSCRIPTEN_KEEPALIVE
int ever_ne_geo_tgeo_w(const int * gs, const Temporal * temp) {
  return ever_ne_geo_tgeo(gs, temp);
}

EMSCRIPTEN_KEEPALIVE
int ever_ne_tgeo_geo_w(const Temporal * temp, const int * gs) {
  return ever_ne_tgeo_geo(temp, gs);
}

EMSCRIPTEN_KEEPALIVE
int ever_ne_tgeo_tgeo_w(const Temporal * temp1, const Temporal * temp2) {
  return ever_ne_tgeo_tgeo(temp1, temp2);
}

EMSCRIPTEN_KEEPALIVE
Temporal * teq_geo_tgeo_w(const int * gs, const Temporal * temp) {
  return teq_geo_tgeo(gs, temp);
}

EMSCRIPTEN_KEEPALIVE
Temporal * teq_tgeo_geo_w(const Temporal * temp, const int * gs) {
  return teq_tgeo_geo(temp, gs);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tne_geo_tgeo_w(const int * gs, const Temporal * temp) {
  return tne_geo_tgeo(gs, temp);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tne_tgeo_geo_w(const Temporal * temp, const int * gs) {
  return tne_tgeo_geo(temp, gs);
}

EMSCRIPTEN_KEEPALIVE
STBox * tgeo_stboxes_w(const Temporal * temp, int * count) {
  return tgeo_stboxes(temp, count);
}

EMSCRIPTEN_KEEPALIVE
STBox * tgeo_space_boxes_w(const Temporal * temp, double xsize, double ysize, double zsize, const int * sorigin, int bitmatrix, int border_inc, int * count) {
  return tgeo_space_boxes(temp, xsize, ysize, zsize, sorigin, (bool) bitmatrix, (bool) border_inc, count);
}

EMSCRIPTEN_KEEPALIVE
STBox * tgeo_space_time_boxes_w(const Temporal * temp, double xsize, double ysize, double zsize, const Interval * duration, const int * sorigin, long long torigin, int bitmatrix, int border_inc, int * count) {
  return tgeo_space_time_boxes(temp, xsize, ysize, zsize, duration, sorigin, (TimestampTz) torigin, (bool) bitmatrix, (bool) border_inc, count);
}

EMSCRIPTEN_KEEPALIVE
STBox * tgeo_split_each_n_stboxes_w(const Temporal * temp, int elem_count, int * count) {
  return tgeo_split_each_n_stboxes(temp, elem_count, count);
}

EMSCRIPTEN_KEEPALIVE
STBox * tgeo_split_n_stboxes_w(const Temporal * temp, int box_count, int * count) {
  return tgeo_split_n_stboxes(temp, box_count, count);
}

EMSCRIPTEN_KEEPALIVE
int adjacent_stbox_tspatial_w(const STBox * box, const Temporal * temp) {
  return (int) adjacent_stbox_tspatial(box, temp);
}

EMSCRIPTEN_KEEPALIVE
int adjacent_tspatial_stbox_w(const Temporal * temp, const STBox * box) {
  return (int) adjacent_tspatial_stbox(temp, box);
}

EMSCRIPTEN_KEEPALIVE
int adjacent_tspatial_tspatial_w(const Temporal * temp1, const Temporal * temp2) {
  return (int) adjacent_tspatial_tspatial(temp1, temp2);
}

EMSCRIPTEN_KEEPALIVE
int contained_stbox_tspatial_w(const STBox * box, const Temporal * temp) {
  return (int) contained_stbox_tspatial(box, temp);
}

EMSCRIPTEN_KEEPALIVE
int contained_tspatial_stbox_w(const Temporal * temp, const STBox * box) {
  return (int) contained_tspatial_stbox(temp, box);
}

EMSCRIPTEN_KEEPALIVE
int contained_tspatial_tspatial_w(const Temporal * temp1, const Temporal * temp2) {
  return (int) contained_tspatial_tspatial(temp1, temp2);
}

EMSCRIPTEN_KEEPALIVE
int contains_stbox_tspatial_w(const STBox * box, const Temporal * temp) {
  return (int) contains_stbox_tspatial(box, temp);
}

EMSCRIPTEN_KEEPALIVE
int contains_tspatial_stbox_w(const Temporal * temp, const STBox * box) {
  return (int) contains_tspatial_stbox(temp, box);
}

EMSCRIPTEN_KEEPALIVE
int contains_tspatial_tspatial_w(const Temporal * temp1, const Temporal * temp2) {
  return (int) contains_tspatial_tspatial(temp1, temp2);
}

EMSCRIPTEN_KEEPALIVE
int overlaps_stbox_tspatial_w(const STBox * box, const Temporal * temp) {
  return (int) overlaps_stbox_tspatial(box, temp);
}

EMSCRIPTEN_KEEPALIVE
int overlaps_tspatial_stbox_w(const Temporal * temp, const STBox * box) {
  return (int) overlaps_tspatial_stbox(temp, box);
}

EMSCRIPTEN_KEEPALIVE
int overlaps_tspatial_tspatial_w(const Temporal * temp1, const Temporal * temp2) {
  return (int) overlaps_tspatial_tspatial(temp1, temp2);
}

EMSCRIPTEN_KEEPALIVE
int same_stbox_tspatial_w(const STBox * box, const Temporal * temp) {
  return (int) same_stbox_tspatial(box, temp);
}

EMSCRIPTEN_KEEPALIVE
int same_tspatial_stbox_w(const Temporal * temp, const STBox * box) {
  return (int) same_tspatial_stbox(temp, box);
}

EMSCRIPTEN_KEEPALIVE
int same_tspatial_tspatial_w(const Temporal * temp1, const Temporal * temp2) {
  return (int) same_tspatial_tspatial(temp1, temp2);
}

EMSCRIPTEN_KEEPALIVE
int above_stbox_tspatial_w(const STBox * box, const Temporal * temp) {
  return (int) above_stbox_tspatial(box, temp);
}

EMSCRIPTEN_KEEPALIVE
int above_tspatial_stbox_w(const Temporal * temp, const STBox * box) {
  return (int) above_tspatial_stbox(temp, box);
}

EMSCRIPTEN_KEEPALIVE
int above_tspatial_tspatial_w(const Temporal * temp1, const Temporal * temp2) {
  return (int) above_tspatial_tspatial(temp1, temp2);
}

EMSCRIPTEN_KEEPALIVE
int after_stbox_tspatial_w(const STBox * box, const Temporal * temp) {
  return (int) after_stbox_tspatial(box, temp);
}

EMSCRIPTEN_KEEPALIVE
int after_tspatial_stbox_w(const Temporal * temp, const STBox * box) {
  return (int) after_tspatial_stbox(temp, box);
}

EMSCRIPTEN_KEEPALIVE
int after_tspatial_tspatial_w(const Temporal * temp1, const Temporal * temp2) {
  return (int) after_tspatial_tspatial(temp1, temp2);
}

EMSCRIPTEN_KEEPALIVE
int back_stbox_tspatial_w(const STBox * box, const Temporal * temp) {
  return (int) back_stbox_tspatial(box, temp);
}

EMSCRIPTEN_KEEPALIVE
int back_tspatial_stbox_w(const Temporal * temp, const STBox * box) {
  return (int) back_tspatial_stbox(temp, box);
}

EMSCRIPTEN_KEEPALIVE
int back_tspatial_tspatial_w(const Temporal * temp1, const Temporal * temp2) {
  return (int) back_tspatial_tspatial(temp1, temp2);
}

EMSCRIPTEN_KEEPALIVE
int before_stbox_tspatial_w(const STBox * box, const Temporal * temp) {
  return (int) before_stbox_tspatial(box, temp);
}

EMSCRIPTEN_KEEPALIVE
int before_tspatial_stbox_w(const Temporal * temp, const STBox * box) {
  return (int) before_tspatial_stbox(temp, box);
}

EMSCRIPTEN_KEEPALIVE
int before_tspatial_tspatial_w(const Temporal * temp1, const Temporal * temp2) {
  return (int) before_tspatial_tspatial(temp1, temp2);
}

EMSCRIPTEN_KEEPALIVE
int below_stbox_tspatial_w(const STBox * box, const Temporal * temp) {
  return (int) below_stbox_tspatial(box, temp);
}

EMSCRIPTEN_KEEPALIVE
int below_tspatial_stbox_w(const Temporal * temp, const STBox * box) {
  return (int) below_tspatial_stbox(temp, box);
}

EMSCRIPTEN_KEEPALIVE
int below_tspatial_tspatial_w(const Temporal * temp1, const Temporal * temp2) {
  return (int) below_tspatial_tspatial(temp1, temp2);
}

EMSCRIPTEN_KEEPALIVE
int front_stbox_tspatial_w(const STBox * box, const Temporal * temp) {
  return (int) front_stbox_tspatial(box, temp);
}

EMSCRIPTEN_KEEPALIVE
int front_tspatial_stbox_w(const Temporal * temp, const STBox * box) {
  return (int) front_tspatial_stbox(temp, box);
}

EMSCRIPTEN_KEEPALIVE
int front_tspatial_tspatial_w(const Temporal * temp1, const Temporal * temp2) {
  return (int) front_tspatial_tspatial(temp1, temp2);
}

EMSCRIPTEN_KEEPALIVE
int left_stbox_tspatial_w(const STBox * box, const Temporal * temp) {
  return (int) left_stbox_tspatial(box, temp);
}

EMSCRIPTEN_KEEPALIVE
int left_tspatial_stbox_w(const Temporal * temp, const STBox * box) {
  return (int) left_tspatial_stbox(temp, box);
}

EMSCRIPTEN_KEEPALIVE
int left_tspatial_tspatial_w(const Temporal * temp1, const Temporal * temp2) {
  return (int) left_tspatial_tspatial(temp1, temp2);
}

EMSCRIPTEN_KEEPALIVE
int overabove_stbox_tspatial_w(const STBox * box, const Temporal * temp) {
  return (int) overabove_stbox_tspatial(box, temp);
}

EMSCRIPTEN_KEEPALIVE
int overabove_tspatial_stbox_w(const Temporal * temp, const STBox * box) {
  return (int) overabove_tspatial_stbox(temp, box);
}

EMSCRIPTEN_KEEPALIVE
int overabove_tspatial_tspatial_w(const Temporal * temp1, const Temporal * temp2) {
  return (int) overabove_tspatial_tspatial(temp1, temp2);
}

EMSCRIPTEN_KEEPALIVE
int overafter_stbox_tspatial_w(const STBox * box, const Temporal * temp) {
  return (int) overafter_stbox_tspatial(box, temp);
}

EMSCRIPTEN_KEEPALIVE
int overafter_tspatial_stbox_w(const Temporal * temp, const STBox * box) {
  return (int) overafter_tspatial_stbox(temp, box);
}

EMSCRIPTEN_KEEPALIVE
int overafter_tspatial_tspatial_w(const Temporal * temp1, const Temporal * temp2) {
  return (int) overafter_tspatial_tspatial(temp1, temp2);
}

EMSCRIPTEN_KEEPALIVE
int overback_stbox_tspatial_w(const STBox * box, const Temporal * temp) {
  return (int) overback_stbox_tspatial(box, temp);
}

EMSCRIPTEN_KEEPALIVE
int overback_tspatial_stbox_w(const Temporal * temp, const STBox * box) {
  return (int) overback_tspatial_stbox(temp, box);
}

EMSCRIPTEN_KEEPALIVE
int overback_tspatial_tspatial_w(const Temporal * temp1, const Temporal * temp2) {
  return (int) overback_tspatial_tspatial(temp1, temp2);
}

EMSCRIPTEN_KEEPALIVE
int overbefore_stbox_tspatial_w(const STBox * box, const Temporal * temp) {
  return (int) overbefore_stbox_tspatial(box, temp);
}

EMSCRIPTEN_KEEPALIVE
int overbefore_tspatial_stbox_w(const Temporal * temp, const STBox * box) {
  return (int) overbefore_tspatial_stbox(temp, box);
}

EMSCRIPTEN_KEEPALIVE
int overbefore_tspatial_tspatial_w(const Temporal * temp1, const Temporal * temp2) {
  return (int) overbefore_tspatial_tspatial(temp1, temp2);
}

EMSCRIPTEN_KEEPALIVE
int overbelow_stbox_tspatial_w(const STBox * box, const Temporal * temp) {
  return (int) overbelow_stbox_tspatial(box, temp);
}

EMSCRIPTEN_KEEPALIVE
int overbelow_tspatial_stbox_w(const Temporal * temp, const STBox * box) {
  return (int) overbelow_tspatial_stbox(temp, box);
}

EMSCRIPTEN_KEEPALIVE
int overbelow_tspatial_tspatial_w(const Temporal * temp1, const Temporal * temp2) {
  return (int) overbelow_tspatial_tspatial(temp1, temp2);
}

EMSCRIPTEN_KEEPALIVE
int overfront_stbox_tspatial_w(const STBox * box, const Temporal * temp) {
  return (int) overfront_stbox_tspatial(box, temp);
}

EMSCRIPTEN_KEEPALIVE
int overfront_tspatial_stbox_w(const Temporal * temp, const STBox * box) {
  return (int) overfront_tspatial_stbox(temp, box);
}

EMSCRIPTEN_KEEPALIVE
int overfront_tspatial_tspatial_w(const Temporal * temp1, const Temporal * temp2) {
  return (int) overfront_tspatial_tspatial(temp1, temp2);
}

EMSCRIPTEN_KEEPALIVE
int overleft_stbox_tspatial_w(const STBox * box, const Temporal * temp) {
  return (int) overleft_stbox_tspatial(box, temp);
}

EMSCRIPTEN_KEEPALIVE
int overleft_tspatial_stbox_w(const Temporal * temp, const STBox * box) {
  return (int) overleft_tspatial_stbox(temp, box);
}

EMSCRIPTEN_KEEPALIVE
int overleft_tspatial_tspatial_w(const Temporal * temp1, const Temporal * temp2) {
  return (int) overleft_tspatial_tspatial(temp1, temp2);
}

EMSCRIPTEN_KEEPALIVE
int overright_stbox_tspatial_w(const STBox * box, const Temporal * temp) {
  return (int) overright_stbox_tspatial(box, temp);
}

EMSCRIPTEN_KEEPALIVE
int overright_tspatial_stbox_w(const Temporal * temp, const STBox * box) {
  return (int) overright_tspatial_stbox(temp, box);
}

EMSCRIPTEN_KEEPALIVE
int overright_tspatial_tspatial_w(const Temporal * temp1, const Temporal * temp2) {
  return (int) overright_tspatial_tspatial(temp1, temp2);
}

EMSCRIPTEN_KEEPALIVE
int right_stbox_tspatial_w(const STBox * box, const Temporal * temp) {
  return (int) right_stbox_tspatial(box, temp);
}

EMSCRIPTEN_KEEPALIVE
int right_tspatial_stbox_w(const Temporal * temp, const STBox * box) {
  return (int) right_tspatial_stbox(temp, box);
}

EMSCRIPTEN_KEEPALIVE
int right_tspatial_tspatial_w(const Temporal * temp1, const Temporal * temp2) {
  return (int) right_tspatial_tspatial(temp1, temp2);
}

EMSCRIPTEN_KEEPALIVE
int acontains_geo_tgeo_w(const int * gs, const Temporal * temp) {
  return acontains_geo_tgeo(gs, temp);
}

EMSCRIPTEN_KEEPALIVE
int acontains_tgeo_geo_w(const Temporal * temp, const int * gs) {
  return acontains_tgeo_geo(temp, gs);
}

EMSCRIPTEN_KEEPALIVE
int acontains_tgeo_tgeo_w(const Temporal * temp1, const Temporal * temp2) {
  return acontains_tgeo_tgeo(temp1, temp2);
}

EMSCRIPTEN_KEEPALIVE
int adisjoint_tgeo_geo_w(const Temporal * temp, const int * gs) {
  return adisjoint_tgeo_geo(temp, gs);
}

EMSCRIPTEN_KEEPALIVE
int adisjoint_tgeo_tgeo_w(const Temporal * temp1, const Temporal * temp2) {
  return adisjoint_tgeo_tgeo(temp1, temp2);
}

EMSCRIPTEN_KEEPALIVE
int adwithin_tgeo_geo_w(const Temporal * temp, const int * gs, double dist) {
  return adwithin_tgeo_geo(temp, gs, dist);
}

EMSCRIPTEN_KEEPALIVE
int adwithin_tgeo_tgeo_w(const Temporal * temp1, const Temporal * temp2, double dist) {
  return adwithin_tgeo_tgeo(temp1, temp2, dist);
}

EMSCRIPTEN_KEEPALIVE
int aintersects_tgeo_geo_w(const Temporal * temp, const int * gs) {
  return aintersects_tgeo_geo(temp, gs);
}

EMSCRIPTEN_KEEPALIVE
int aintersects_tgeo_tgeo_w(const Temporal * temp1, const Temporal * temp2) {
  return aintersects_tgeo_tgeo(temp1, temp2);
}

EMSCRIPTEN_KEEPALIVE
int atouches_tgeo_geo_w(const Temporal * temp, const int * gs) {
  return atouches_tgeo_geo(temp, gs);
}

EMSCRIPTEN_KEEPALIVE
int atouches_tgeo_tgeo_w(const Temporal * temp1, const Temporal * temp2) {
  return atouches_tgeo_tgeo(temp1, temp2);
}

EMSCRIPTEN_KEEPALIVE
int atouches_tpoint_geo_w(const Temporal * temp, const int * gs) {
  return atouches_tpoint_geo(temp, gs);
}

EMSCRIPTEN_KEEPALIVE
int econtains_geo_tgeo_w(const int * gs, const Temporal * temp) {
  return econtains_geo_tgeo(gs, temp);
}

EMSCRIPTEN_KEEPALIVE
int econtains_tgeo_geo_w(const Temporal * temp, const int * gs) {
  return econtains_tgeo_geo(temp, gs);
}

EMSCRIPTEN_KEEPALIVE
int econtains_tgeo_tgeo_w(const Temporal * temp1, const Temporal * temp2) {
  return econtains_tgeo_tgeo(temp1, temp2);
}

EMSCRIPTEN_KEEPALIVE
int ecovers_geo_tgeo_w(const int * gs, const Temporal * temp) {
  return ecovers_geo_tgeo(gs, temp);
}

EMSCRIPTEN_KEEPALIVE
int ecovers_tgeo_geo_w(const Temporal * temp, const int * gs) {
  return ecovers_tgeo_geo(temp, gs);
}

EMSCRIPTEN_KEEPALIVE
int ecovers_tgeo_tgeo_w(const Temporal * temp1, const Temporal * temp2) {
  return ecovers_tgeo_tgeo(temp1, temp2);
}

EMSCRIPTEN_KEEPALIVE
int edisjoint_tgeo_geo_w(const Temporal * temp, const int * gs) {
  return edisjoint_tgeo_geo(temp, gs);
}

EMSCRIPTEN_KEEPALIVE
int edisjoint_tgeo_tgeo_w(const Temporal * temp1, const Temporal * temp2) {
  return edisjoint_tgeo_tgeo(temp1, temp2);
}

EMSCRIPTEN_KEEPALIVE
int edwithin_tgeo_geo_w(const Temporal * temp, const int * gs, double dist) {
  return edwithin_tgeo_geo(temp, gs, dist);
}

EMSCRIPTEN_KEEPALIVE
int edwithin_tgeo_tgeo_w(const Temporal * temp1, const Temporal * temp2, double dist) {
  return edwithin_tgeo_tgeo(temp1, temp2, dist);
}

EMSCRIPTEN_KEEPALIVE
int eintersects_tgeo_geo_w(const Temporal * temp, const int * gs) {
  return eintersects_tgeo_geo(temp, gs);
}

EMSCRIPTEN_KEEPALIVE
int eintersects_tgeo_tgeo_w(const Temporal * temp1, const Temporal * temp2) {
  return eintersects_tgeo_tgeo(temp1, temp2);
}

EMSCRIPTEN_KEEPALIVE
int etouches_tgeo_geo_w(const Temporal * temp, const int * gs) {
  return etouches_tgeo_geo(temp, gs);
}

EMSCRIPTEN_KEEPALIVE
int etouches_tgeo_tgeo_w(const Temporal * temp1, const Temporal * temp2) {
  return etouches_tgeo_tgeo(temp1, temp2);
}

EMSCRIPTEN_KEEPALIVE
int etouches_tpoint_geo_w(const Temporal * temp, const int * gs) {
  return etouches_tpoint_geo(temp, gs);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tcontains_geo_tgeo_w(const int * gs, const Temporal * temp, int restr, int atvalue) {
  return tcontains_geo_tgeo(gs, temp, (bool) restr, (bool) atvalue);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tcontains_tgeo_geo_w(const Temporal * temp, const int * gs, int restr, int atvalue) {
  return tcontains_tgeo_geo(temp, gs, (bool) restr, (bool) atvalue);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tcontains_tgeo_tgeo_w(const Temporal * temp1, const Temporal * temp2, int restr, int atvalue) {
  return tcontains_tgeo_tgeo(temp1, temp2, (bool) restr, (bool) atvalue);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tcovers_geo_tgeo_w(const int * gs, const Temporal * temp, int restr, int atvalue) {
  return tcovers_geo_tgeo(gs, temp, (bool) restr, (bool) atvalue);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tcovers_tgeo_geo_w(const Temporal * temp, const int * gs, int restr, int atvalue) {
  return tcovers_tgeo_geo(temp, gs, (bool) restr, (bool) atvalue);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tcovers_tgeo_tgeo_w(const Temporal * temp1, const Temporal * temp2, int restr, int atvalue) {
  return tcovers_tgeo_tgeo(temp1, temp2, (bool) restr, (bool) atvalue);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tdisjoint_geo_tgeo_w(const int * gs, const Temporal * temp, int restr, int atvalue) {
  return tdisjoint_geo_tgeo(gs, temp, (bool) restr, (bool) atvalue);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tdisjoint_tgeo_geo_w(const Temporal * temp, const int * gs, int restr, int atvalue) {
  return tdisjoint_tgeo_geo(temp, gs, (bool) restr, (bool) atvalue);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tdisjoint_tgeo_tgeo_w(const Temporal * temp1, const Temporal * temp2, int restr, int atvalue) {
  return tdisjoint_tgeo_tgeo(temp1, temp2, (bool) restr, (bool) atvalue);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tdwithin_geo_tgeo_w(const int * gs, const Temporal * temp, double dist, int restr, int atvalue) {
  return tdwithin_geo_tgeo(gs, temp, dist, (bool) restr, (bool) atvalue);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tdwithin_tgeo_geo_w(const Temporal * temp, const int * gs, double dist, int restr, int atvalue) {
  return tdwithin_tgeo_geo(temp, gs, dist, (bool) restr, (bool) atvalue);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tdwithin_tgeo_tgeo_w(const Temporal * temp1, const Temporal * temp2, double dist, int restr, int atvalue) {
  return tdwithin_tgeo_tgeo(temp1, temp2, dist, (bool) restr, (bool) atvalue);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tintersects_geo_tgeo_w(const int * gs, const Temporal * temp, int restr, int atvalue) {
  return tintersects_geo_tgeo(gs, temp, (bool) restr, (bool) atvalue);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tintersects_tgeo_geo_w(const Temporal * temp, const int * gs, int restr, int atvalue) {
  return tintersects_tgeo_geo(temp, gs, (bool) restr, (bool) atvalue);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tintersects_tgeo_tgeo_w(const Temporal * temp1, const Temporal * temp2, int restr, int atvalue) {
  return tintersects_tgeo_tgeo(temp1, temp2, (bool) restr, (bool) atvalue);
}

EMSCRIPTEN_KEEPALIVE
Temporal * ttouches_geo_tgeo_w(const int * gs, const Temporal * temp, int restr, int atvalue) {
  return ttouches_geo_tgeo(gs, temp, (bool) restr, (bool) atvalue);
}

EMSCRIPTEN_KEEPALIVE
Temporal * ttouches_tgeo_geo_w(const Temporal * temp, const int * gs, int restr, int atvalue) {
  return ttouches_tgeo_geo(temp, gs, (bool) restr, (bool) atvalue);
}

EMSCRIPTEN_KEEPALIVE
Temporal * ttouches_tgeo_tgeo_w(const Temporal * temp1, const Temporal * temp2, int restr, int atvalue) {
  return ttouches_tgeo_tgeo(temp1, temp2, (bool) restr, (bool) atvalue);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tdistance_tgeo_geo_w(const Temporal * temp, const int * gs) {
  return tdistance_tgeo_geo(temp, gs);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tdistance_tgeo_tgeo_w(const Temporal * temp1, const Temporal * temp2) {
  return tdistance_tgeo_tgeo(temp1, temp2);
}

EMSCRIPTEN_KEEPALIVE
double nad_stbox_geo_w(const STBox * box, const int * gs) {
  return nad_stbox_geo(box, gs);
}

EMSCRIPTEN_KEEPALIVE
double nad_stbox_stbox_w(const STBox * box1, const STBox * box2) {
  return nad_stbox_stbox(box1, box2);
}

EMSCRIPTEN_KEEPALIVE
double nad_tgeo_geo_w(const Temporal * temp, const int * gs) {
  return nad_tgeo_geo(temp, gs);
}

EMSCRIPTEN_KEEPALIVE
double nad_tgeo_stbox_w(const Temporal * temp, const STBox * box) {
  return nad_tgeo_stbox(temp, box);
}

EMSCRIPTEN_KEEPALIVE
double nad_tgeo_tgeo_w(const Temporal * temp1, const Temporal * temp2) {
  return nad_tgeo_tgeo(temp1, temp2);
}

EMSCRIPTEN_KEEPALIVE
TInstant * nai_tgeo_geo_w(const Temporal * temp, const int * gs) {
  return nai_tgeo_geo(temp, gs);
}

EMSCRIPTEN_KEEPALIVE
TInstant * nai_tgeo_tgeo_w(const Temporal * temp1, const Temporal * temp2) {
  return nai_tgeo_tgeo(temp1, temp2);
}

EMSCRIPTEN_KEEPALIVE
int * shortestline_tgeo_geo_w(const Temporal * temp, const int * gs) {
  return shortestline_tgeo_geo(temp, gs);
}

EMSCRIPTEN_KEEPALIVE
int * shortestline_tgeo_tgeo_w(const Temporal * temp1, const Temporal * temp2) {
  return shortestline_tgeo_tgeo(temp1, temp2);
}

EMSCRIPTEN_KEEPALIVE
Temporal * tpoint_tcentroid_finalfn_w(SkipList * state) {
  return tpoint_tcentroid_finalfn(state);
}

EMSCRIPTEN_KEEPALIVE
SkipList * tpoint_tcentroid_transfn_w(SkipList * state, Temporal * temp) {
  return tpoint_tcentroid_transfn(state, temp);
}

EMSCRIPTEN_KEEPALIVE
STBox * tspatial_extent_transfn_w(STBox * box, const Temporal * temp) {
  return tspatial_extent_transfn(box, temp);
}

EMSCRIPTEN_KEEPALIVE
STBox * stbox_get_space_tile_w(const int * point, double xsize, double ysize, double zsize, const int * sorigin) {
  return stbox_get_space_tile(point, xsize, ysize, zsize, sorigin);
}

EMSCRIPTEN_KEEPALIVE
STBox * stbox_get_space_time_tile_w(const int * point, long long t, double xsize, double ysize, double zsize, const Interval * duration, const int * sorigin, long long torigin) {
  return stbox_get_space_time_tile(point, (TimestampTz) t, xsize, ysize, zsize, duration, sorigin, (TimestampTz) torigin);
}

EMSCRIPTEN_KEEPALIVE
STBox * stbox_get_time_tile_w(long long t, const Interval * duration, long long torigin) {
  return stbox_get_time_tile((TimestampTz) t, duration, (TimestampTz) torigin);
}

EMSCRIPTEN_KEEPALIVE
STBox * stbox_space_tiles_w(const STBox * bounds, double xsize, double ysize, double zsize, const int * sorigin, int border_inc, int * count) {
  return stbox_space_tiles(bounds, xsize, ysize, zsize, sorigin, (bool) border_inc, count);
}

EMSCRIPTEN_KEEPALIVE
STBox * stbox_space_time_tiles_w(const STBox * bounds, double xsize, double ysize, double zsize, const Interval * duration, const int * sorigin, long long torigin, int border_inc, int * count) {
  return stbox_space_time_tiles(bounds, xsize, ysize, zsize, duration, sorigin, (TimestampTz) torigin, (bool) border_inc, count);
}

EMSCRIPTEN_KEEPALIVE
STBox * stbox_time_tiles_w(const STBox * bounds, const Interval * duration, long long torigin, int border_inc, int * count) {
  return stbox_time_tiles(bounds, duration, (TimestampTz) torigin, (bool) border_inc, count);
}

EMSCRIPTEN_KEEPALIVE
Temporal ** tgeo_space_split_w(const Temporal * temp, double xsize, double ysize, double zsize, const int * sorigin, int bitmatrix, int border_inc, int *** space_bins, int * count) {
  return tgeo_space_split(temp, xsize, ysize, zsize, sorigin, (bool) bitmatrix, (bool) border_inc, space_bins, count);
}

EMSCRIPTEN_KEEPALIVE
Temporal ** tgeo_space_time_split_w(const Temporal * temp, double xsize, double ysize, double zsize, const Interval * duration, const int * sorigin, long long torigin, int bitmatrix, int border_inc, int *** space_bins, TimestampTz ** time_bins, int * count) {
  return tgeo_space_time_split(temp, xsize, ysize, zsize, duration, sorigin, (TimestampTz) torigin, (bool) bitmatrix, (bool) border_inc, space_bins, time_bins, count);
}

EMSCRIPTEN_KEEPALIVE
int * geo_cluster_kmeans_w(const int ** geoms, uint32_t ngeoms, uint32_t k) {
  return geo_cluster_kmeans(geoms, ngeoms, k);
}

EMSCRIPTEN_KEEPALIVE
uint32_t * geo_cluster_dbscan_w(const int ** geoms, uint32_t ngeoms, double tolerance, int minpoints, int * count) {
  return geo_cluster_dbscan(geoms, ngeoms, tolerance, minpoints, count);
}

EMSCRIPTEN_KEEPALIVE
int ** geo_cluster_intersecting_w(const int ** geoms, uint32_t ngeoms, int * count) {
  return geo_cluster_intersecting(geoms, ngeoms, count);
}

EMSCRIPTEN_KEEPALIVE
int ** geo_cluster_within_w(const int ** geoms, uint32_t ngeoms, double tolerance, int * count) {
  return geo_cluster_within(geoms, ngeoms, tolerance, count);
}

