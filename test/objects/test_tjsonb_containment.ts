import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import { initMeos } from '../../core/runtime/meos.js';
import { Jsonb, TJsonb } from '../../core/objects/objects.generated.js';

// A temporal JSONB value has two containments, as SQL names them: the
// containment of its JSONB values, `@>` (tjsonbContains), which answers a
// temporal boolean, and the containment of its time, `#@>` (spanContains), which
// every temporal class inherits as `contains` and which answers a boolean. The
// object model names the first after its SQL function, since its operation name
// is the other one's (MEOS-API parser/object_model.py, #_sql_named_operators).

before(async () => {
	await initMeos();
});

describe('generated object layer: the two containments of a temporal JSONB value', () => {
	it('answers whether each JSONB value contains another as a temporal boolean', () => {
		using t = TJsonb.in('["{\\"a\\": 1, \\"b\\": 2}"@2001-01-01 00:00:00+00, "{\\"a\\": 2}"@2001-01-02 00:00:00+00]');
		using jb = Jsonb.in('{"a": 1}');
		using answer = t.tjsonbContains(jb);
		assert.equal(answer.toString(),
			'[t@2001-01-01 00:00:00+00, f@2001-01-02 00:00:00+00]');
		using other = TJsonb.in('"{\\"a\\": 1}"@2001-01-01 00:00:00+00');
		using both = t.tjsonbContains(other);
		assert.equal(both.toString(), 't@2001-01-01 00:00:00+00');
	});

	it('answers whether each JSONB value is contained in another as a temporal boolean', () => {
		using t = TJsonb.in('["{\\"a\\": 1}"@2001-01-01 00:00:00+00, "{\\"c\\": 3}"@2001-01-02 00:00:00+00]');
		using jb = Jsonb.in('{"a": 1, "b": 2}');
		using answer = t.tjsonbContained(jb);
		assert.equal(answer.toString(),
			'[t@2001-01-01 00:00:00+00, f@2001-01-02 00:00:00+00]');
	});

	it('states the JSONB value first as a member of the JSONB value', () => {
		using t = TJsonb.in('["{\\"a\\": 1}"@2001-01-01 00:00:00+00, "{\\"c\\": 3}"@2001-01-02 00:00:00+00]');
		using jb = Jsonb.in('{"a": 1, "b": 2}');
		using contains = jb.tjsonbContains(t);
		assert.equal(contains.toString(),
			'[t@2001-01-01 00:00:00+00, f@2001-01-02 00:00:00+00]');
		using contained = jb.tjsonbContained(t);
		assert.equal(contained.toString(),
			'[f@2001-01-01 00:00:00+00, f@2001-01-02 00:00:00+00]');
		using concat = jb.tConcat(t);
		assert.equal(concat.toString(),
			'["{\\"a\\": 1, \\"b\\": 2}"@2001-01-01 00:00:00+00, "{\\"a\\": 1, \\"b\\": 2, \\"c\\": 3}"@2001-01-02 00:00:00+00]');
	});

	it('keeps the inherited contains as the containment of time', () => {
		using t = TJsonb.in('["{\\"a\\": 1}"@2001-01-01 00:00:00+00, "{\\"a\\": 2}"@2001-01-03 00:00:00+00]');
		using inside = TJsonb.in('"{\\"z\\": 0}"@2001-01-02 00:00:00+00');
		assert.equal(t.contains(inside), true);
	});
});
