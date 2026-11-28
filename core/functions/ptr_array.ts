import { heapCopy, type Ptr } from './functions.generated.js';
import { getModule } from '../runtime/meos.js';

/**
 * Builds a temporary wasm64 pointer array, calls `fn(arrPtr, count)`,
 * then frees the array.
 *
 * The array is copied into the heap by heapCopy (_malloc, then a copy through
 * HEAPU8), each Ptr a 64-bit little-endian value, and freed with _meos_free
 * (libc free, the allocator of _malloc). It needs no C helper in the WASM
 * binary, only the `_malloc` and `_meos_free` exports.
 */
export function withPtrArray<T>(ptrs: Ptr[], fn: (arr: Ptr, count: number) => T): T {
	const mod = getModule();

	// Encode pointer values as 64-bit little-endian bytes (wasm64 native order)
	const bytes = new Uint8Array(ptrs.length * 8);
	const view = new DataView(bytes.buffer);
	for (let i = 0; i < ptrs.length; i++) {
		view.setBigUint64(i * 8, BigInt(ptrs[i]), /* littleEndian */ true);
	}

	const arrPtr: Ptr = heapCopy(bytes);
	try {
		return fn(arrPtr, ptrs.length);
	} finally {
		// _meos_free is the raw wasm64 export — pass bigint
		(mod._meos_free as (p: bigint) => void)(BigInt(arrPtr));
	}
}
