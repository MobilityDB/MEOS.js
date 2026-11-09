import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import { getModule, initMeos } from '../../core/runtime/meos.js';
import {
	intset_in,
	meos_version,
	set_as_hexwkb,
	temporal_out,
	ttext_in,
} from '../../core/functions/functions.generated.js';

// A string MEOS answers comes with its size, written through a size_t *, so its
// wrapper takes no such argument, reads the string for that size and frees it.

describe('a string read for the size MEOS writes', () => {
	before(async () => {
		await initMeos();
	});

	it('reads back a value holding two-byte characters whole', () => {
		const text = '{"Zürich"@2001-01-01 00:00:00+00, "Liège"@2001-01-02 00:00:00+00}';
		assert.equal(temporal_out(ttext_in(text), 0), text);
	});

	it('reads back a long string whole', () => {
		const text = `"${'x'.repeat(200000)}"@2001-01-01 00:00:00+00`;
		assert.equal(temporal_out(ttext_in(text), 0), text);
	});

	it('takes no argument for a function whose only parameter is the size', () => {
		assert.match(meos_version(), /^MobilityDB/);
	});

	it('writes the size of a hex WKB where the size_t it writes fits', () => {
		const set = intset_in('{1, 2, 3}');
		assert.equal(set_as_hexwkb(set, 0), set_as_hexwkb(set, 0));
		assert.match(set_as_hexwkb(set, 0), /^[0-9A-F]+$/);
	});

	it('frees the string it reads, so the heap does not grow', () => {
		const temp = ttext_in(`"${'x'.repeat(1000000)}"@2001-01-01`);
		temporal_out(temp, 0);
		const before = getModule().HEAPU8.length;
		for (let i = 0; i < 200; i++) temporal_out(temp, 0);
		assert.equal(getModule().HEAPU8.length, before);
	});
});
