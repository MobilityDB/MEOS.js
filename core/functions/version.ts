// The version of MEOS.js, under its own name.
//
// Each binding answers its own version under its own name, and the version of
// the MEOS library it links under MEOS's name: #meos_version and
// #meos_full_version, generated in functions.generated.ts from the catalog.
// These two stand beside #meos_full_version, which the full version calls, as
// PyMEOS-CFFI's pymeos_cffi_version and pymeos_cffi_full_version stand beside
// its own. The package version is stated here, as PyMEOS-CFFI states its
// __version__, because a module of core/ cannot read package.json in a browser;
// test/functions/test_version.ts holds it to the version package.json states.

import { meos_full_version } from './functions.generated.js';

/** The version of the meos.js package, the one package.json states */
export const MEOSJS_VERSION = '1.0.1';

/** The version of MEOS.js, its name first, as #meos_version answers MEOS's */
export function meosjs_version(): string {
	return `MEOS.js ${MEOSJS_VERSION}`;
}

/**
 * The version of MEOS.js followed by the string of #meos_full_version: the MEOS
 * library it links and MEOS's dependencies
 */
export function meosjs_full_version(): string {
	return `${meosjs_version()}, ${meos_full_version()}`;
}
