import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import { initMeos } from '../../core/runtime/meos.js';
import {
	date_in,
	date_adt_to_date,
	date_to_date_adt,
	date_to_unix_days,
	datetime_to_timestamp,
	datetime_to_timestamptz,
	interval_in,
	interval_out,
	interval_to_timedelta,
	meos_free,
	time_adt_to_time,
	time_in,
	time_out,
	time_to_time_adt,
	timedelta_to_interval,
	timestamp_to_datetime,
	timestamptz_in,
	timestamptz_to_datetime,
	timestamptz_to_unix_us,
	timetz_adt_to_timetz,
	timetz_in,
	timetz_out,
	timetz_to_timetz_adt,
} from '../../core/functions/functions.generated.js';

before(async () => {
	await initMeos();
});

// The casts between the time types of JavaScript and those of MEOS convert
// through the generated wrappers of the MEOS conversions, as the casts of the
// other bindings do and as test_type_mapping.ts crosses the 64-bit slots they
// read. The counts are those of the MEOS bindings specification,
// doc/specs/meos-bindings-algebra.md of MobilityDB.

describe('a timestamptz casts to and from a Date', () => {
	it('a Date is the count of microseconds from the Unix epoch', () => {
		const ts = datetime_to_timestamptz(new Date('2001-01-01T00:00:00Z'));
		assert.equal(timestamptz_to_unix_us(ts), 978307200000000n);
		assert.equal(timestamptz_to_datetime(ts).toISOString(), '2001-01-01T00:00:00.000Z');
	});

	it('the microseconds below a millisecond drop toward the past', () => {
		const later = timestamptz_in('2025-03-01 08:00:00.123456+00', -1);
		assert.equal(timestamptz_to_datetime(later).toISOString(), '2025-03-01T08:00:00.123Z');
		const before1970 = timestamptz_in('1969-12-31 23:59:59.999999+00', -1);
		assert.equal(timestamptz_to_datetime(before1970).toISOString(), '1969-12-31T23:59:59.999Z');
	});

	it('a timestamp is the UTC clock of a Date', () => {
		const ts = datetime_to_timestamp(new Date('2025-03-01T08:00:00.123Z'));
		assert.equal(timestamp_to_datetime(ts).toISOString(), '2025-03-01T08:00:00.123Z');
	});
});

describe('a date casts to and from a Date at midnight UTC', () => {
	it('a date is the count of days from the Unix epoch', () => {
		const d = date_in('2025-03-01');
		assert.equal(date_to_unix_days(d), 20148);
		assert.equal(date_adt_to_date(d).toISOString(), '2025-03-01T00:00:00.000Z');
	});

	it('the UTC date of a Date is its date', () => {
		assert.equal(date_to_date_adt(new Date('2025-03-01T23:59:59Z')), date_in('2025-03-01'));
	});
});

describe('an interval, a time and a time with time zone cast to their parts', () => {
	it('an interval is its months, days and microseconds', () => {
		const interv = interval_in('1 mon 2 days 03:00:00.5', -1);
		const parts = interval_to_timedelta(interv);
		meos_free(interv);
		assert.deepEqual(parts, { months: 1, days: 2, microseconds: 10800500000n });
		const back = timedelta_to_interval(parts);
		assert.equal(interval_out(back), '1 mon 2 days 03:00:00.5');
		meos_free(back);
	});

	it('a time is its microseconds from midnight, 24:00:00 among them', () => {
		assert.equal(time_adt_to_time(time_in('12:34:56.789012', -1)), 45296789012n);
		assert.equal(time_adt_to_time(time_in('24:00:00', -1)), 86400000000n);
		assert.equal(time_out(time_to_time_adt(45296789012n)), '12:34:56.789012');
	});

	it('a time with time zone is its microseconds and its offset east of UTC', () => {
		const timetz = timetz_in('12:00:00-05', -1);
		const parts = timetz_adt_to_timetz(timetz);
		meos_free(timetz);
		assert.deepEqual(parts, { microseconds: 43200000000n, offsetSeconds: -18000 });
		const back = timetz_to_timetz_adt(parts);
		assert.equal(timetz_out(back), '12:00:00-05');
		meos_free(back);
	});
});
