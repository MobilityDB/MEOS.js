import type { Ptr } from './functions.generated';
import { getModule } from '../runtime/meos';

/**
 * Builds a temporary wasm64 pointer array, calls `fn(arrPtr, count)`,
 * then frees the array.
 *
 * Uses Module.allocate() (which calls _malloc and copies bytes via HEAPU8),
 * writing each Ptr as a 64-bit little-endian value. The buffer is freed with
 * _meos_free (which calls libc free, same allocator as _malloc).
 *
 * This approach requires no extra C helpers in the WASM binary — only the
 * `allocate` / `ALLOC_NORMAL` / `_meos_free` exports that the module already
 * provides.
 */
export function withPtrArray<T>(ptrs: Ptr[], fn: (arr: Ptr, count: number) => T): T {
	const mod = getModule();

	// Encode pointer values as 64-bit little-endian bytes (wasm64 native order)
	const bytes = new Uint8Array(ptrs.length * 8);
	const view = new DataView(bytes.buffer);
	for (let i = 0; i < ptrs.length; i++) {
		view.setBigUint64(i * 8, BigInt(ptrs[i]), /* littleEndian */ true);
	}

	// allocate() copies bytes into WASM heap via HEAPU8 and returns a Number pointer
	const arrPtr: Ptr = mod.allocate(bytes, mod.ALLOC_NORMAL) as Ptr;
	try {
		return fn(arrPtr, ptrs.length);
	} finally {
		// _meos_free is the raw wasm64 export — pass bigint
		(mod._meos_free as (p: bigint) => void)(BigInt(arrPtr));
	}
}
