import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { before, describe, it } from 'node:test';
import { initMeos } from '../../core/runtime/meos.js';
import { meos_full_version, meos_version } from '../../core/functions/functions.generated.js';
import { MEOSJS_VERSION, meosjs_full_version, meosjs_version } from '../../core/functions/version.js';

// MEOS.js answers its own version under its own name and that of the MEOS it links
// under MEOS's, never another binding's, as test_string_size.ts reads meos_version.
// The version it states is the one package.json states.

describe('the version of MEOS.js', () => {
	before(async () => {
		await initMeos();
	});

	it('states the version package.json states', () => {
		const pkg = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8'));
		assert.equal(MEOSJS_VERSION, pkg.version);
	});

	it('answers its version under its own name', () => {
		assert.equal(meosjs_version(), `MEOS.js ${MEOSJS_VERSION}`);
		assert.match(meos_version(), /^MEOS /);
	});

	it('answers its full version as its version followed by that of MEOS', () => {
		assert.match(meos_full_version(), /^MEOS /);
		assert.equal(meosjs_full_version(), `${meosjs_version()}, ${meos_full_version()}`);
	});
});
