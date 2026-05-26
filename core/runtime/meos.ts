/**
 * WASM module lifecycle management.
 *
 * Provides the two low-level primitives used by the rest of the library:
 *
 *   initMeos()  - checks that the runtime supports WebAssembly MEMORY64,
 *                 loads the compiled MEOS WASM binary, runs Emscripten's
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

// WebAssembly is a runtime global in both Node.js and browsers but is not
// included in the TypeScript ES libs without "DOM". Declare only what we need.
declare const WebAssembly: { validate(bytes: Uint8Array): boolean };

let Module: MeosModule | null = null;

/**
 * Detects WebAssembly MEMORY64 support by attempting to validate a hand-crafted
 * minimal wasm64 binary before loading the full MEOS module. This produces a
 * clear, actionable error instead of a cryptic Emscripten crash at instantiation.
 *
 * The probe is the smallest valid wasm64 module: `(module (memory i64 0))`.
 * It is 13 bytes structured as follows:
 *
 *   Header (8 bytes)
 *     00 61 73 6d  -> magic "\0asm", present in every .wasm file
 *     01 00 00 00  -> version 1 (little-endian)
 *
 *   Memory section (5 bytes)
 *     05           -> section id 5 (Memory)
 *     03           -> section body is 3 bytes long
 *     01           -> 1 memory entry follows
 *     04           -> memory flags byte: bit 2 = memory64, no max, not shared
 *     00           -> minimum size: 0 pages
 *
 * The flags byte is a bitfield: bit 0 = has_max, bit 1 = shared, bit 2 = memory64.
 * Setting only bit 2 (0x04) declares a 64-bit address space memory with no upper
 * bound and no SharedArrayBuffer sharing.
 *
 * WebAssembly.validate() returns false (instead of throwing) when the engine does
 * not recognise the memory64 flag, making it safe to use as a feature probe.
 */
function assertWasm64Supported(): void {
	const probe = new Uint8Array([
		0x00,
		0x61,
		0x73,
		0x6d, // magic: \0asm
		0x01,
		0x00,
		0x00,
		0x00, // version: 1
		0x05,
		0x03, // memory section (id=5), body is 3 bytes
		0x01, // 1 memory entry
		0x04, // flags: memory64 (bit 2 set), no max, not shared
		0x00, // minimum pages: 0
	]);
	if (!WebAssembly.validate(probe)) {
		throw new Error(
			'MEOS.js requires WebAssembly MEMORY64 support. ' +
				'Use Node.js 20+ or a browser supporting WebAssembly MEMORY64.'
		);
	}
}

/**
 * Initialises the MEOS WASM module.
 *
 * Must be awaited before calling any MEOS function. Safe to call multiple
 * times. Subsequent calls are no-ops once the module is loaded.
 *
 * Throws if the runtime does not support WebAssembly MEMORY64.
 */
export async function initMeos(): Promise<void> {
	if (Module) return;
	assertWasm64Supported();
	Module = await createMeosModule();
	Module.ccall('meos_init_lib', null, [], []);
}

/**
 * Returns the initialised MeosModule.
 *
 * Throws if `initMeos()` has not been called yet. All generated wrappers in
 * core/functions.ts call this via the `call<T>()` helper.
 */
export function getModule(): MeosModule {
	if (!Module)
		throw new Error(
			"MEOS module is not initialized. Call 'initMeos()' before using any MEOS function."
		);
	return Module;
}
