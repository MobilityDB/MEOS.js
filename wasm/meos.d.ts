export interface MeosModule {
	ccall(
		ident: string,
		returnType: 'number' | 'string' | 'boolean' | null,
		argTypes: ('number' | 'string' | 'boolean' | 'bigint')[],
		args: unknown[]
	): unknown;

	cwrap(
		ident: string,
		returnType: 'number' | 'string' | 'boolean' | null,
		argTypes: ('number' | 'string' | 'boolean' | 'bigint')[]
	): (...args: unknown[]) => unknown;

	/** Allocates `slab.length` bytes in the WASM heap and copies slab in. Returns a Number pointer. */
	allocate(slab: Uint8Array, allocator: number): number;

	/** allocate() mode: uses libc malloc (freeable with _meos_free). */
	ALLOC_NORMAL: 0;

	/** Raw wasm64 export of meos_free (calls libc free). Takes a BigInt address. */
	_meos_free(ptr: bigint): void;
}

declare function createMeosModule(moduleArg?: object): Promise<MeosModule>;

export default createMeosModule;
