import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import { initMeos } from '../src/core/meos';
import {
	MeosException,
	MeosInternalError,
	MeosInternalTypeError,
	MeosValueOutOfRangeError,
	MeosDivisionByZeroError,
	MeosMemoryAllocError,
	MeosAggregationError,
	MeosDirectoryError,
	MeosFileError,
	MeosArgumentError,
	MeosInvalidArgError,
	MeosInvalidArgTypeError,
	MeosInvalidArgValueError,
	MeosFeatureNotSupported,
	MeosIoError,
	MeosMfJsonInputError,
	MeosMfJsonOutputError,
	MeosTextInputError,
	MeosTextOutputError,
	MeosWkbInputError,
	MeosWkbOutputError,
	MeosGeoJsonInputError,
	MeosGeoJsonOutputError,
	makeMeosException,
	MEOS_ERR_INTERNAL_ERROR,
	MEOS_ERR_INTERNAL_TYPE_ERROR,
	MEOS_ERR_VALUE_OUT_OF_RANGE,
	MEOS_ERR_DIVISION_BY_ZERO,
	MEOS_ERR_MEMORY_ALLOC_ERROR,
	MEOS_ERR_AGGREGATION_ERROR,
	MEOS_ERR_DIRECTORY_ERROR,
	MEOS_ERR_FILE_ERROR,
	MEOS_ERR_INVALID_ARG,
	MEOS_ERR_INVALID_ARG_TYPE,
	MEOS_ERR_INVALID_ARG_VALUE,
	MEOS_ERR_FEATURE_NOT_SUPPORTED,
	MEOS_ERR_MFJSON_INPUT,
	MEOS_ERR_MFJSON_OUTPUT,
	MEOS_ERR_TEXT_INPUT,
	MEOS_ERR_TEXT_OUTPUT,
	MEOS_ERR_WKB_INPUT,
	MEOS_ERR_WKB_OUTPUT,
	MEOS_ERR_GEOJSON_INPUT,
	MEOS_ERR_GEOJSON_OUTPUT,
	MEOS_ERROR,
} from '../src/errors';
import { IntSet } from '../src/types/number/IntSet';
import { IntSpan } from '../src/types/number/IntSpan';
import { FloatSet } from '../src/types/number/FloatSet';
import { TsTzSpan } from '../src/types/time/TsTzSpan';

before(async () => {
	await initMeos();
});

// -------------------------------------------------------------------------
// MAKEMEOSEXCEPTION - DISPATCH UNIT TESTS
// -------------------------------------------------------------------------

describe('makeMeosException - dispatch', () => {
	const cases: [number, new (...a: never[]) => MeosException][] = [
		[MEOS_ERR_INTERNAL_ERROR, MeosInternalError],
		[MEOS_ERR_INTERNAL_TYPE_ERROR, MeosInternalTypeError],
		[MEOS_ERR_VALUE_OUT_OF_RANGE, MeosValueOutOfRangeError],
		[MEOS_ERR_DIVISION_BY_ZERO, MeosDivisionByZeroError],
		[MEOS_ERR_MEMORY_ALLOC_ERROR, MeosMemoryAllocError],
		[MEOS_ERR_AGGREGATION_ERROR, MeosAggregationError],
		[MEOS_ERR_DIRECTORY_ERROR, MeosDirectoryError],
		[MEOS_ERR_FILE_ERROR, MeosFileError],
		[MEOS_ERR_INVALID_ARG, MeosInvalidArgError],
		[MEOS_ERR_INVALID_ARG_TYPE, MeosInvalidArgTypeError],
		[MEOS_ERR_INVALID_ARG_VALUE, MeosInvalidArgValueError],
		[MEOS_ERR_FEATURE_NOT_SUPPORTED, MeosFeatureNotSupported],
		[MEOS_ERR_MFJSON_INPUT, MeosMfJsonInputError],
		[MEOS_ERR_MFJSON_OUTPUT, MeosMfJsonOutputError],
		[MEOS_ERR_TEXT_INPUT, MeosTextInputError],
		[MEOS_ERR_TEXT_OUTPUT, MeosTextOutputError],
		[MEOS_ERR_WKB_INPUT, MeosWkbInputError],
		[MEOS_ERR_WKB_OUTPUT, MeosWkbOutputError],
		[MEOS_ERR_GEOJSON_INPUT, MeosGeoJsonInputError],
		[MEOS_ERR_GEOJSON_OUTPUT, MeosGeoJsonOutputError],
	];

	for (const [code, Ctor] of cases) {
		it(`code ${code} → ${Ctor.name}`, () => {
			const err = makeMeosException(code, MEOS_ERROR, 'test');
			assert.ok(
				err instanceof Ctor,
				`expected ${Ctor.name}, got ${err.constructor.name}`
			);
			assert.ok(err instanceof MeosException);
			assert.equal(err.code, code);
			assert.equal(err.level, MEOS_ERROR);
			assert.equal(err.message, 'test');
		});
	}

	it('unknown code falls back to base MeosException', () => {
		const err = makeMeosException(9999, MEOS_ERROR, 'unknown');
		assert.ok(err instanceof MeosException);
		assert.equal(err.constructor.name, 'MeosException');
		assert.equal(err.code, 9999);
	});

	it('unknown code 0 with non-zero level still throws MeosException', () => {
		const err = makeMeosException(0, MEOS_ERROR, 'unknown zero-code error');
		assert.ok(err instanceof MeosException);
		assert.equal(err.code, 0);
	});
});

// -------------------------------------------------------------------------
// REAL MEOS ERRORS FROM INVALID INPUT
// -------------------------------------------------------------------------

describe('MEOS integration - text input errors', () => {
	it('IntSet.fromString with invalid WKT throws MeosTextInputError', () => {
		assert.throws(
			() => IntSet.fromString('not-a-set'),
			(err: unknown) => {
				assert.ok(
					err instanceof MeosTextInputError,
					`got ${(err as Error).constructor.name}`
				);
				assert.equal(err.code, MEOS_ERR_TEXT_INPUT);
				return true;
			}
		);
	});

	it('IntSpan.fromString with invalid WKT throws MeosTextInputError', () => {
		assert.throws(
			() => IntSpan.fromString('garbage'),
			(err: unknown) => {
				assert.ok(
					err instanceof MeosTextInputError,
					`got ${(err as Error).constructor.name}`
				);
				return true;
			}
		);
	});

	it('FloatSet.fromString with invalid WKT throws MeosTextInputError', () => {
		assert.throws(
			() => FloatSet.fromString('{not, a, float, set}'),
			(err: unknown) => {
				assert.ok(
					err instanceof MeosTextInputError,
					`got ${(err as Error).constructor.name}`
				);
				return true;
			}
		);
	});

	it('TsTzSpan.fromString with invalid WKT throws MeosTextInputError', () => {
		assert.throws(
			() => TsTzSpan.fromString('not-a-span'),
			(err: unknown) => {
				assert.ok(
					err instanceof MeosTextInputError,
					`got ${(err as Error).constructor.name}`
				);
				return true;
			}
		);
	});
});

describe('MEOS integration - WKB input errors', () => {
	it('IntSet.fromHexWKB with invalid hex throws MeosWkbInputError', () => {
		assert.throws(
			() => IntSet.fromHexWKB('DEADBEEF'),
			(err: unknown) => {
				assert.ok(
					err instanceof MeosWkbInputError,
					`got ${(err as Error).constructor.name}`
				);
				assert.equal(err.code, MEOS_ERR_WKB_INPUT);
				return true;
			}
		);
	});

	it('IntSpan.fromHexWKB with invalid hex throws some MeosException', () => {
		// MEOS may return MeosWkbInputError or MeosInvalidArgValueError depending on
		// how far the parser gets before rejecting the bytes.
		assert.throws(
			() => IntSpan.fromHexWKB('DEADBEEF'),
			(err: unknown) => {
				assert.ok(err instanceof MeosException, `got ${(err as Error).constructor.name}`);
				return true;
			}
		);
	});
});

describe('MEOS integration - thrown error is instanceof Error', () => {
	it('MeosTextInputError is a proper Error subclass', () => {
		let caught: unknown;
		try {
			IntSet.fromString('bad');
		} catch (e) {
			caught = e;
		}
		assert.ok(caught instanceof Error);
		assert.ok(caught instanceof MeosException);
		assert.ok(caught instanceof MeosTextInputError);
	});
});
