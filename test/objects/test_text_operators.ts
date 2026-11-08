import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import { initMeos } from '../../core/runtime/meos.js';
import { Text, TextSet, TText } from '../../core/objects/objects.generated.js';

// An operator whose first operand is a text (`ever_eq_text_ttext`,
// `union_text_set`, `textcat_text_*`): the flat surface takes a text as a
// JavaScript string, so the object layer (codegen/ObjectGenerator.ts) emits it as
// a static of Text taking the text first, as the class's other members on a text
// are, and a name with several overloads chooses among them by the second
// operand's type.

before(async () => {
	await initMeos();
});

describe('generated object layer: operators on a text', () => {
	it('compares a text with every value of a temporal text', () => {
		using t = TText.in('["a"@2000-01-01, "b"@2000-01-02]');
		assert.equal(Text.everEq('a', t), 1);
		assert.equal(Text.everEq('c', t), 0);
		assert.equal(Text.alwaysEq('a', t), 0);
	});

	it('answers the union of a text and a set of texts', () => {
		using s = TextSet.in('{"b", "c"}');
		using u = Text.union('a', s)!;
		assert.equal(u.toString(), '{"a", "b", "c"}');
	});

	it('concatenates a text with a text, a set of texts or a temporal text', () => {
		assert.equal(Text.textcat('ab', 'cd'), 'abcd');
		using s = TextSet.in('{"x", "y"}');
		using cs = Text.textcat('a', s) as TextSet;
		assert.equal(cs.toString(), '{"ax", "ay"}');
		using t = TText.in('["x"@2000-01-01, "y"@2000-01-02]');
		using ct = Text.textcat('a', t) as TText;
		assert.equal(ct.toString(), '["ax"@2000-01-01 00:00:00+00, "ay"@2000-01-02 00:00:00+00]');
	});
});
