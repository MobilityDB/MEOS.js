# Multi-stage Dockerfile to build meos.js + meos.wasm from source.
#
# Usage (default build is wasm64):
#   docker build --output type=local,dest=./wasm --target wasm .
# To build wasm32:
#   docker build --build-arg TARGET=wasm32 --output type=local,dest=./wasm --target wasm .
#
# Versions:
#   emscripten 5.0.6  |  MobilityDB master  |  GEOS 3.14.1
#   PROJ 9.8.1        |  SQLite 3.46.1      |  JSON-C 0.18  |  GSL 2.8

ARG TARGET=wasm64

# EMSCRIPTEN & EVERY NEEDED TOOL
FROM emscripten/emsdk:5.0.6 AS base

RUN apt-get update && apt-get install -y --no-install-recommends \
        cmake ninja-build pkg-config git curl unzip ca-certificates tzdata sqlite3 \
    && rm -rf /var/lib/apt/lists/*

# COMPILING SQLite WITH EMSCRIPTEN (needed to compile PROJ)
FROM base AS sqlite
ARG TARGET

RUN curl -fL "https://www.sqlite.org/2024/sqlite-amalgamation-3460100.zip" -o /tmp/sqlite.zip \
    && unzip /tmp/sqlite.zip -d /tmp \
    && mkdir -p /root/sqlite3

WORKDIR /tmp/sqlite-amalgamation-3460100
RUN case "$TARGET" in wasm64) EM_FLAGS="-sMEMORY64=1" ;; *) EM_FLAGS="" ;; esac \
    && emcc $EM_FLAGS -O2 -c sqlite3.c -o sqlite3.o \
    && emar rcs /root/sqlite3/libsqlite3.a sqlite3.o \
    && cp sqlite3.h /root/sqlite3/

# COMPILING GEOS WITH EMSCRIPTEN
FROM base AS geos
ARG TARGET

RUN curl -fL "https://download.osgeo.org/geos/geos-3.14.1.tar.bz2" | tar xj -C /root \
    && mv /root/geos-3.14.1 /root/geos

WORKDIR /root/geos
RUN case "$TARGET" in wasm64) EM_FLAGS="-sMEMORY64=1" ;; *) EM_FLAGS="" ;; esac \
    && mkdir -p build && cd build \
    && emcmake cmake .. \
        -DCMAKE_BUILD_TYPE=Release \
        -DBUILD_SHARED_LIBS=OFF \
        -DGEOS_BUILD_DEVELOPER=OFF \
        -DBUILD_TESTING=OFF \
        -DBUILD_GEOSOP=OFF \
        "-DCMAKE_C_FLAGS=$EM_FLAGS" \
        "-DCMAKE_CXX_FLAGS=$EM_FLAGS" \
    && emmake make -j"$(nproc)" geos geos_c

# COMPILING PROJ WITH EMSCRIPTEN
FROM base AS proj
ARG TARGET

COPY --from=sqlite /root/sqlite3 /root/sqlite3

RUN curl -fL "https://download.osgeo.org/proj/proj-9.8.1.tar.gz" \
        | tar xz -C /root \
    && mv /root/proj-9.8.1 /root/PROJ

WORKDIR /root/PROJ
RUN case "$TARGET" in wasm64) EM_FLAGS="-sMEMORY64=1" ;; *) EM_FLAGS="" ;; esac \
    && mkdir -p build && cd build \
    && emcmake cmake .. \
        -DCMAKE_BUILD_TYPE=Release \
        -DBUILD_SHARED_LIBS=OFF \
        -DBUILD_APPS=OFF \
        -DBUILD_TESTING=OFF \
        -DBUILD_PROJSYNC=OFF \
        -DENABLE_TIFF=OFF \
        -DENABLE_CURL=OFF \
        -DFETCHCONTENT_FULLY_DISCONNECTED=ON \
        -DEMBED_RESOURCE_FILES=OFF \
        -DSQLITE3_INCLUDE_DIR=/root/sqlite3 \
        -DSQLITE3_LIBRARY=/root/sqlite3/libsqlite3.a \
        "-DCMAKE_C_FLAGS=$EM_FLAGS" \
        "-DCMAKE_CXX_FLAGS=$EM_FLAGS" \
    && emmake make -j"$(nproc)"

# COMPILING JSON-C WITH EMSCRIPTEN
FROM base AS jsonc
ARG TARGET

RUN curl -fL "https://github.com/json-c/json-c/archive/refs/tags/json-c-0.18-20240915.tar.gz" \
        | tar xz -C /root \
    && mv /root/json-c-json-c-0.18-20240915 /root/json-c

WORKDIR /root/json-c
RUN case "$TARGET" in wasm64) EM_FLAGS="-sMEMORY64=1" ;; *) EM_FLAGS="" ;; esac \
    && mkdir -p build && cd build \
    && emcmake cmake .. \
        -DCMAKE_BUILD_TYPE=Release \
        -DBUILD_SHARED_LIBS=OFF \
        -DBUILD_TESTING=OFF \
        "-DCMAKE_C_FLAGS=$EM_FLAGS" \
    && emmake make -j"$(nproc)" json-c \
    && mkdir -p /root/json-c-install/include/json-c /root/json-c-install/lib \
    && cp /root/json-c/*.h       /root/json-c-install/include/json-c/ \
    && cp /root/json-c/build/*.h /root/json-c-install/include/json-c/ \
    && cp /root/json-c/build/libjson-c.a /root/json-c-install/lib/

# COMPILING GSL WITH EMSCRIPTEN
FROM base AS gsl
ARG TARGET

RUN curl -fL "https://ftp.gnu.org/gnu/gsl/gsl-2.8.tar.gz" | tar xz -C /root

WORKDIR /root/gsl-2.8
RUN case "$TARGET" in wasm64) EM_FLAGS="-sMEMORY64=1" ;; *) EM_FLAGS="" ;; esac \
    && curl -fL "https://git.savannah.gnu.org/cgit/config.git/plain/config.sub" -o config.sub \
    && curl -fL "https://git.savannah.gnu.org/cgit/config.git/plain/config.guess" -o config.guess \
    && emconfigure ./configure \
        --prefix=/root/gsl-wasm \
        --host=wasm32-unknown-emscripten \
        --disable-shared \
        --enable-static \
        CFLAGS="-O2 $EM_FLAGS" \
    && emmake make -j"$(nproc)" \
    && emmake make install

# BUILDING WASM
FROM base AS builder
ARG TARGET

COPY --from=sqlite /root/sqlite3         /root/sqlite3
COPY --from=geos   /root/geos            /root/geos
COPY --from=proj   /root/PROJ            /root/PROJ
COPY --from=jsonc  /root/json-c-install  /root/json-c-install
COPY --from=gsl    /root/gsl-wasm        /root/gsl-wasm

RUN git clone --depth=1 --branch master https://github.com/MobilityDB/MobilityDB.git /root/MobilityDB

WORKDIR /app
COPY . .

# Generate core/c-src/bindings.c and src/core/functions.ts from meos-idl.json
RUN npm install && npm run generate

# CMAKE: configure MobilityDB
RUN case "$TARGET" in wasm64) EM_FLAGS="-sMEMORY64=1" ;; *) EM_FLAGS="" ;; esac \
    && emcmake cmake -S /root/MobilityDB -B /root/MobilityDB/build_${TARGET} \
        -DMEOS=ON \
        -DBUILD_SHARED_LIBS=OFF \
        -DCMAKE_BUILD_TYPE=Release \
        -DGEOS_INCLUDE_DIR=/root/geos/build/capi \
        -DGEOS_LIBRARY=/root/geos/build/lib/libgeos.a \
        -DPROJ_INCLUDE_DIRS=/root/PROJ/src \
        -DPROJ_LIBRARIES=/root/PROJ/build/lib/libproj.a \
        "-DJSON-C_INCLUDE_DIRS=/root/json-c-install/include" \
        "-DJSON-C_LIBRARIES=/root/json-c-install/lib/libjson-c.a" \
        -DGSL_INCLUDE_DIR=/root/gsl-wasm/include \
        -DGSL_LIBRARY=/root/gsl-wasm/lib/libgsl.a \
        -DGSL_CBLAS_LIBRARY=/root/gsl-wasm/lib/libgslcblas.a \
        "-DCMAKE_C_FLAGS=$EM_FLAGS -I/root/geos/include -I/root/geos/build/capi -I/root/json-c-install/include -I/root/json-c-install/include/json-c" \
        "-DCMAKE_CXX_FLAGS=$EM_FLAGS -I/root/geos/include -I/root/geos/build/capi -I/root/json-c-install/include -I/root/json-c-install/include/json-c"

# PATCHING: fix pg_config.h type sizes for the target ABI
#   SIZEOF_LONG is always 4 in Emscripten (ILP32 model, even in wasm64)
#   SIZEOF_VOID_P / SIZEOF_SIZE_T: 4 for wasm32, 8 for wasm64
#   HAVE_LONG_LONG_INT_64: always needed (long=32 bit -> int64 must use long long)
RUN case "$TARGET" in \
      wasm64) SIZEOF_VOID_P=8 SIZEOF_SIZE_T=8 ;; \
      *)      SIZEOF_VOID_P=4 SIZEOF_SIZE_T=4 ;; \
    esac \
    && PG_CONFIG_H=/root/MobilityDB/build_${TARGET}/postgres/pg_config.h \
    && sed -i \
        -e "s/^#define SIZEOF_LONG [0-9]\+/#define SIZEOF_LONG 4/" \
        -e "s/^#define SIZEOF_VOID_P [0-9]\+/#define SIZEOF_VOID_P $SIZEOF_VOID_P/" \
        -e "s/^#define SIZEOF_SIZE_T [0-9]\+/#define SIZEOF_SIZE_T $SIZEOF_SIZE_T/" \
        "$PG_CONFIG_H" \
    && grep -q SIZEOF_LONG_LONG "$PG_CONFIG_H" || \
        sed -i 's/^#define SIZEOF_LONG 4$/#define SIZEOF_LONG 4\n#define SIZEOF_LONG_LONG 8/' "$PG_CONFIG_H" \
    && sed -i \
        -e 's/^#define HAVE_LONG_INT_64 1/\/* #undef HAVE_LONG_INT_64 *\//' \
        -e 's/^\/\* #undef HAVE_LONG_LONG_INT_64 \*\//#define HAVE_LONG_LONG_INT_64 1/' \
        "$PG_CONFIG_H"

# COMPILING: libmeos.a
RUN cmake --build /root/MobilityDB/build_${TARGET} --target meos --parallel "$(nproc)"

# EMCC: link everything into meos.js + meos.wasm
#
# wasm64-specific flags:
#   -sEMULATE_FUNCTION_POINTER_CASTS=1
#     MEOS uses datum_func2 (Datum(*)(Datum,Datum)) as a generic callback type,
#     passing concrete functions (datum_eq, int4pl, …) through it. In wasm64
#     the Datum type widens to i64, which changes the indirect-call signature
#     seen by the WASM engine. Without emulation the engine traps with
#     "null function or function signature mismatch" for every arithmetic /
#     ever-always / temporal-comparison path. The emulation shim wraps each
#     indirect call so the engine always sees the exact expected type.
#
#   -O1 (instead of -O2)
#     Avoid LLVM optimisations that can merge or devirtualise indirect-call
#     sites before the emulation shims are inserted; -O1 keeps the shims
#     effective while still producing reasonably compact code.
RUN case "$TARGET" in \
      wasm64) \
        EM_FLAGS="-sMEMORY64=1" ; \
        EXTRA_FLAGS="-sEMULATE_FUNCTION_POINTER_CASTS=1 -O1" ;; \
      *) \
        EM_FLAGS="" ; \
        EXTRA_FLAGS="-O2" ;; \
    esac \
    && mkdir -p /app/wasm \
    && emcc $EM_FLAGS $EXTRA_FLAGS \
        /app/core/c-src/bindings.c \
        /root/MobilityDB/build_${TARGET}/meos/libmeos.a \
        /root/geos/build/lib/libgeos.a \
        /root/geos/build/lib/libgeos_c.a \
        /root/PROJ/build/lib/libproj.a \
        /root/sqlite3/libsqlite3.a \
        /root/gsl-wasm/lib/libgsl.a \
        /root/gsl-wasm/lib/libgslcblas.a \
        /root/json-c-install/lib/libjson-c.a \
        -I/root/MobilityDB/meos/include \
        -I/root/MobilityDB/postgres \
        -I/root/MobilityDB/build_${TARGET}/postgres \
        -I/root/MobilityDB/build_${TARGET}/postgis/liblwgeom \
        -I/root/MobilityDB/build_${TARGET}/postgis \
        -I/root/MobilityDB/postgis \
        -I/root/MobilityDB/postgis/liblwgeom \
        -I/root/PROJ/src \
        --embed-file /usr/share/zoneinfo@/usr/share/zoneinfo \
        -o /app/wasm/meos.js \
        -s MODULARIZE=1 \
        -s EXPORT_NAME="createMeosModule" \
        -s EXPORTED_RUNTIME_METHODS='["ccall","cwrap","UTF8ToString","allocate","ALLOC_NORMAL"]' \
        -s ALLOW_MEMORY_GROWTH=1 \
        -s ENVIRONMENT='web,node' \
        -s EXPORT_ES6=1 \
        -Wno-incompatible-pointer-types \
        -Wno-int-conversion

FROM scratch AS wasm

COPY --from=builder /app/wasm/meos.js   meos.js
COPY --from=builder /app/wasm/meos.wasm meos.wasm
