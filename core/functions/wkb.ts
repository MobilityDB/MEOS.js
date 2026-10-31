/*****************************************************************************
 *
 * This MobilityDB code is provided under The PostgreSQL License.
 * Copyright (c) 2016-2026, Université libre de Bruxelles and MobilityDB
 * contributors
 *
 * MobilityDB includes portions of PostGIS version 3 source code released
 * under the GNU General Public License (GPLv2 or later).
 * Copyright (c) 2001-2026, PostGIS contributors
 *
 * Permission to use, copy, modify, and distribute this software and its
 * documentation for any purpose, without fee, and without a written
 * agreement is hereby granted, provided that the above copyright notice and
 * this paragraph and the following two paragraphs appear in all copies.
 *
 * IN NO EVENT SHALL UNIVERSITE LIBRE DE BRUXELLES BE LIABLE TO ANY PARTY FOR
 * DIRECT, INDIRECT, SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES, INCLUDING
 * LOST PROFITS, ARISING OUT OF THE USE OF THIS SOFTWARE AND ITS DOCUMENTATION,
 * EVEN IF UNIVERSITE LIBRE DE BRUXELLES HAS BEEN ADVISED OF THE POSSIBILITY
 * OF SUCH DAMAGE.
 *
 * UNIVERSITE LIBRE DE BRUXELLES SPECIFICALLY DISCLAIMS ANY WARRANTIES,
 * INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY
 * AND FITNESS FOR A PARTICULAR PURPOSE. THE SOFTWARE PROVIDED HEREUNDER IS ON
 * AN "AS IS" BASIS, AND UNIVERSITE LIBRE DE BRUXELLES HAS NO OBLIGATIONS TO
 * PROVIDE MAINTENANCE, SUPPORT, UPDATES, ENHANCEMENTS, OR MODIFICATIONS.
 *
 *****************************************************************************/

import type { Ptr } from './functions.generated.js';
import { getModule } from '../runtime/meos.js';

/**
 * Calls a MEOS `*_as_wkb` or `*_as_ewkb` writer and returns its bytes.
 *
 * `write(sizeOut)` receives the address of a `size_t` the writer fills with the
 * length of the buffer it returns. The bytes are copied out of the WASM heap
 * into a `Uint8Array` the caller owns, and both the size slot and the MEOS
 * buffer are freed with `_meos_free`, the allocator `allocate()` and MEOS share.
 */
export function readWkb(write: (sizeOut: Ptr) => Ptr): Uint8Array {
	const mod = getModule();
	// size_t is 8 bytes in wasm64
	const sizeOut: Ptr = mod.allocate(new Uint8Array(8), mod.ALLOC_NORMAL) as Ptr;
	let wkb: Ptr = 0;
	try {
		wkb = write(sizeOut);
		// Read the heap after the call: a growth during it replaces the view
		const heap = mod.HEAPU8;
		const size = Number(
			new DataView(heap.buffer, heap.byteOffset + sizeOut, 8).getBigUint64(0, /* littleEndian */ true)
		);
		return heap.slice(wkb, wkb + size);
	} finally {
		if (wkb) (mod._meos_free as (p: bigint) => void)(BigInt(wkb));
		(mod._meos_free as (p: bigint) => void)(BigInt(sizeOut));
	}
}

/**
 * Copies `wkb` into the WASM heap, calls `read(ptr, size)` on it, then frees
 * the copy. `read` is a MEOS `*_from_wkb` reader, which copies what it reads.
 */
export function withWkb<T>(wkb: Uint8Array, read: (ptr: Ptr, size: number) => T): T {
	const mod = getModule();
	const ptr: Ptr = mod.allocate(wkb, mod.ALLOC_NORMAL) as Ptr;
	try {
		return read(ptr, wkb.length);
	} finally {
		(mod._meos_free as (p: bigint) => void)(BigInt(ptr));
	}
}

/**
 * Calls a MEOS `*_as_hexwkb` or `*_as_hexewkb` writer that reports its length
 * through a `size_t *`, giving it a size slot that is freed afterwards.
 */
export function withSizeOut<T>(write: (sizeOut: Ptr) => T): T {
	const mod = getModule();
	const sizeOut: Ptr = mod.allocate(new Uint8Array(8), mod.ALLOC_NORMAL) as Ptr;
	try {
		return write(sizeOut);
	} finally {
		(mod._meos_free as (p: bigint) => void)(BigInt(sizeOut));
	}
}
