/**
 * WASM module lifecycle management.
 *
 * Provides the two low-level primitives used by the rest of the library:
 *
 *   initMeos()  - loads the compiled MEOS WASM binary, runs Emscripten's
 *                 module initialisation, then calls meos_init_lib() which
 *                 sets up internal MEOS state (memory allocators, timezone
 *                 tables, …). Must be called once before any other MEOS
 *                 function.
 *
 *   getModule() - returns the initialised MeosModule instance. All
 *                 generated TypeScript wrappers in core/functions.ts call
 *                 this internally via the `call<T>()` helper.
 */

import createMeosModule, { type MeosModule } from '../../wasm/meos.js';
import { setWasm64 } from './ptr-mode';

let Module: MeosModule | null = null;

/**
 * Initialises the MEOS WASM module.
 *
 * Must be awaited before calling any MEOS function. Safe to call multiple
 * times. Subsequent calls are no-ops once the module is loaded.
 */
export async function initMeos(): Promise<void> {
	if (Module) return;
	Module = await createMeosModule();
	Module.ccall('meos_init_lib', null, [], []);
	if (
		typeof (Module as unknown as Record<string, unknown>)['_meos_pointer_size'] ===
		'function'
	) {
		const ptrSize = Module.ccall('meos_pointer_size', 'number', [], []) as number;
		setWasm64(ptrSize === 8);
	}
}

/**
 * Returns the initialised MeosModule.
 *
 * Throws if initMeos() has not been called yet. All generated wrappers in
 * core/functions.ts call this via the `call<T>()` helper.
 */
export function getModule(): MeosModule {
	if (!Module)
		throw new Error(
			"MEOS module is not initialized. Call 'initMeos()' before using any MEOS function."
		);
	return Module;
}
