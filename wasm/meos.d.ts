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

	/** Raw wasm64 export of libc malloc (freeable with _meos_free). Takes and returns a BigInt. */
	_malloc(size: bigint): bigint;

	/** Raw wasm64 export of meos_free (calls libc free). Takes a BigInt address. */
	_meos_free(ptr: bigint): void;

	/** The WASM linear memory as bytes; the module replaces the view when the memory grows. */
	HEAPU8: Uint8Array;

	/** The NUL-terminated UTF-8 string at `ptr`, exported as EXPORTED_RUNTIME_METHODS lists it. */
	UTF8ToString(ptr: number): string;
}

declare function createMeosModule(moduleArg?: object): Promise<MeosModule>;

export default createMeosModule;
