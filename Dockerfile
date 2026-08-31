# Multi-stage Dockerfile to build meos.js + meos.wasm from source (wasm64-only).
#
# Usage:
#   docker build --output type=local,dest=./wasm --target wasm .
#
# Versions:
#   emsdk 5.0.6       |  MobilityDB master
#   GEOS 3.14.1       |  PROJ 9.8.1         |  SQLite 3.46.1
#   JSON-C 0.18       |  GSL 2.8            |  H3 4.2.1

# Track upstream MobilityDB master. The committed codegen/res/meos-idl.json is a
# snapshot of the MEOS-API catalog for that surface; refresh it (see README) when
# the MEOS surface changes.
ARG MOBILITYDB_REPO=https://github.com/MobilityDB/MobilityDB.git
ARG MOBILITYDB_BRANCH=master

# EMSCRIPTEN & EVERY NEEDED TOOL
FROM emscripten/emsdk:5.0.6 AS base

RUN apt-get update && apt-get install -y --no-install-recommends \
        cmake ninja-build pkg-config git curl unzip ca-certificates tzdata \
        sqlite3 automake \
    && rm -rf /var/lib/apt/lists/*

# COMPILING SQLite WITH EMSCRIPTEN (needed to compile PROJ)
FROM base AS sqlite

RUN curl -fL "https://www.sqlite.org/2024/sqlite-amalgamation-3460100.zip" -o /tmp/sqlite.zip \
    && unzip /tmp/sqlite.zip -d /tmp \
    && mkdir -p /root/sqlite3

WORKDIR /tmp/sqlite-amalgamation-3460100
RUN emcc -sMEMORY64=1 -O2 -c sqlite3.c -o sqlite3.o \
    && emar rcs /root/sqlite3/libsqlite3.a sqlite3.o \
    && cp sqlite3.h /root/sqlite3/

# COMPILING GEOS WITH EMSCRIPTEN
FROM base AS geos

RUN curl -fL "https://download.osgeo.org/geos/geos-3.14.1.tar.bz2" | tar xj -C /root \
    && mv /root/geos-3.14.1 /root/geos

WORKDIR /root/geos
RUN mkdir -p build && cd build \
    && emcmake cmake .. \
        -DCMAKE_BUILD_TYPE=Release \
        -DBUILD_SHARED_LIBS=OFF \
        -DGEOS_BUILD_DEVELOPER=OFF \
        -DBUILD_TESTING=OFF \
        -DBUILD_GEOSOP=OFF \
        -DCMAKE_C_FLAGS=-sMEMORY64=1 \
        -DCMAKE_CXX_FLAGS=-sMEMORY64=1 \
    && emmake make -j"$(nproc)" geos geos_c

# COMPILING PROJ WITH EMSCRIPTEN
FROM base AS proj

COPY --from=sqlite /root/sqlite3 /root/sqlite3

RUN curl -fL "https://download.osgeo.org/proj/proj-9.8.1.tar.gz" \
        | tar xz -C /root \
    && mv /root/proj-9.8.1 /root/PROJ

WORKDIR /root/PROJ
RUN mkdir -p build && cd build \
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
        -DCMAKE_C_FLAGS=-sMEMORY64=1 \
        -DCMAKE_CXX_FLAGS=-sMEMORY64=1 \
    && emmake make -j"$(nproc)"

# COMPILING JSON-C WITH EMSCRIPTEN
FROM base AS jsonc

RUN curl -fL "https://github.com/json-c/json-c/archive/refs/tags/json-c-0.18-20240915.tar.gz" \
        | tar xz -C /root \
    && mv /root/json-c-json-c-0.18-20240915 /root/json-c

WORKDIR /root/json-c
RUN mkdir -p build && cd build \
    && emcmake cmake .. \
        -DCMAKE_BUILD_TYPE=Release \
        -DBUILD_SHARED_LIBS=OFF \
        -DBUILD_TESTING=OFF \
        -DCMAKE_C_FLAGS=-sMEMORY64=1 \
    && emmake make -j"$(nproc)" json-c \
    && mkdir -p /root/json-c-install/include/json-c /root/json-c-install/lib \
    && cp /root/json-c/*.h       /root/json-c-install/include/json-c/ \
    && cp /root/json-c/build/*.h /root/json-c-install/include/json-c/ \
    && cp /root/json-c/build/libjson-c.a /root/json-c-install/lib/

# COMPILING GSL WITH EMSCRIPTEN
FROM base AS gsl

RUN curl -fL "https://ftpmirror.gnu.org/gsl/gsl-2.8.tar.gz" | tar xz -C /root

WORKDIR /root/gsl-2.8
RUN cp /usr/share/automake-*/config.sub config.sub \
    && cp /usr/share/automake-*/config.guess config.guess \
    && emconfigure ./configure \
        --prefix=/root/gsl-wasm \
        --host=wasm32-unknown-emscripten \
        --disable-shared \
        --enable-static \
        CFLAGS="-O2 -sMEMORY64=1" \
    && emmake make -j"$(nproc)" \
    && emmake make install

# COMPILING H3 WITH EMSCRIPTEN (Uber libh3, required by the temporal H3 index family)
# BUILD_GENERATORS=OFF: the lib's generated coordinate tables are committed in the
# release tarball; only the standalone generator TOOLS would need native execution,
# so skipping them keeps the whole build cross-compilable. h3api.h is the single
# self-contained public header (produced from h3api.h.in by configure_file, so it
# exists regardless of the generators); copy it and libh3.a into a clean prefix.
FROM base AS h3

RUN curl -fL "https://github.com/uber/h3/archive/refs/tags/v4.2.1.tar.gz" \
        | tar xz -C /root \
    && mv /root/h3-4.2.1 /root/h3

WORKDIR /root/h3
RUN mkdir -p build && cd build \
    && emcmake cmake .. \
        -DCMAKE_BUILD_TYPE=Release \
        -DBUILD_SHARED_LIBS=OFF \
        -DBUILD_TESTING=OFF \
        -DBUILD_BENCHMARKS=OFF \
        -DBUILD_FILTERS=OFF \
        -DBUILD_GENERATORS=OFF \
        -DENABLE_COVERAGE=OFF \
        -DENABLE_DOCS=OFF \
        -DENABLE_FORMAT=OFF \
        -DENABLE_LINTING=OFF \
        -DCMAKE_C_FLAGS=-sMEMORY64=1 \
    && emmake make -j"$(nproc)" h3 \
    && mkdir -p /root/h3-install/lib /root/h3-install/include \
    && cp /root/h3/build/lib/libh3.a /root/h3-install/lib/ \
    && cp /root/h3/build/src/h3lib/include/h3api.h /root/h3-install/include/

# MOBILITYDB SOURCE (separate stage so /app/ changes don't invalidate the clone)
FROM base AS mobilitydb_src
ARG MOBILITYDB_REPO
ARG MOBILITYDB_BRANCH

RUN git clone --depth 1 --branch ${MOBILITYDB_BRANCH} ${MOBILITYDB_REPO} /root/MobilityDB

# BUILDING WASM
FROM base AS builder

COPY --from=sqlite         /root/sqlite3         /root/sqlite3
COPY --from=geos           /root/geos            /root/geos
COPY --from=proj           /root/PROJ            /root/PROJ
COPY --from=jsonc          /root/json-c-install  /root/json-c-install
COPY --from=gsl            /root/gsl-wasm        /root/gsl-wasm
COPY --from=h3             /root/h3-install      /root/h3-install
COPY --from=mobilitydb_src /root/MobilityDB      /root/MobilityDB

WORKDIR /app

# Install node deps first (cached unless package.json or lock change)
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

# Now copy the rest and generate bindings
COPY . .
RUN npm run generate

# CMAKE: configure MobilityDB
RUN INCLUDES="-I/root/geos/include -I/root/geos/build/capi -I/root/json-c-install/include -I/root/json-c-install/include/json-c" \
    && emcmake cmake -S /root/MobilityDB -B /root/MobilityDB/build \
        -DMEOS=ON \
        -DCBUFFER=ON \
        -DNPOINT=ON \
        -DPOSE=ON \
        -DRGEO=ON \
        -DH3=ON \
        -DJSON=ON \
        -DQUADBIN=ON \
        -DH3_LIBRARY=/root/h3-install/lib/libh3.a \
        -DH3_INCLUDE_DIR=/root/h3-install/include \
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
        "-DCMAKE_C_FLAGS=-sMEMORY64=1 $INCLUDES" \
        "-DCMAKE_CXX_FLAGS=-sMEMORY64=1 $INCLUDES"

# PATCHING: fix pg_config.h type sizes for wasm64
#   SIZEOF_LONG is always 4 in Emscripten (ILP32 model, even in wasm64)
#   SIZEOF_VOID_P / SIZEOF_SIZE_T: 8 for wasm64
#   HAVE_LONG_LONG_INT_64: needed (long=32 bit -> int64 must use long long)
RUN PG_CONFIG_H=/root/MobilityDB/build/pgtypes/pg_config.h \
    && sed -i \
        -e 's/^#define SIZEOF_LONG [0-9]\+/#define SIZEOF_LONG 4/' \
        -e 's/^#define SIZEOF_VOID_P [0-9]\+/#define SIZEOF_VOID_P 8/' \
        -e 's/^#define SIZEOF_SIZE_T [0-9]\+/#define SIZEOF_SIZE_T 8/' \
        "$PG_CONFIG_H" \
    && grep -q SIZEOF_LONG_LONG "$PG_CONFIG_H" || \
        sed -i 's/^#define SIZEOF_LONG 4$/#define SIZEOF_LONG 4\n#define SIZEOF_LONG_LONG 8/' "$PG_CONFIG_H" \
    && sed -i \
        -e 's/^#define HAVE_LONG_INT_64 1/\/* #undef HAVE_LONG_INT_64 *\//' \
        -e 's/^\/\* #undef HAVE_LONG_LONG_INT_64 \*\//#define HAVE_LONG_LONG_INT_64 1/' \
        "$PG_CONFIG_H"

# COMPILING: libmeos.a
# The install step produces both the header and the archive this module is built
# against, so the prefix is the only thing the link line names and the build-tree
# layout is MEOS's business alone.
#
# MEOS assembles the installed <meos.h> rather than shipping the source one: it
# splices the PostgreSQL-compat definitions and the de-prefixed base I/O into it,
# so interval_in, date_in and their siblings are declared only there.
#
# The installed archive is self-contained: MEOS folds pgtypes, liblwgeom and ryu
# (and libpc, with POINTCLOUD on) into it precisely so a consumer that embeds MEOS
# in one relocatable module links one library. The sidecar libpgtypes.a and
# libpostgis.a it used to need are build-tree intermediates that `install` does not
# publish, and naming them again would duplicate what the archive already carries.
RUN cmake --build /root/MobilityDB/build --target meos --parallel "$(nproc)" \
    && cmake --install /root/MobilityDB/build --prefix /root/meos-install

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
#
#   -sSTACK_SIZE=8MB
#     The Emscripten default stack is only 64 KB. MEOS walks temporals
#     instant-by-instant through indirect calls (datum_func2, interpolation,
#     aggregation), and EMULATE_FUNCTION_POINTER_CASTS wraps every one of
#     those calls in a trampoline that pushes extra args onto the stack.
#     Deep call chains over a few thousand instants overflow 64 KB; because
#     stack-overflow checking is off in release builds the overflow corrupts
#     adjacent linear memory and surfaces as "memory access out of bounds".
#     8 MB is reserved address space, not committed RAM, so it is cheap and
#     pushes the practical limit from ~2500 to hundreds of thousands of
#     instants.
RUN mkdir -p /app/wasm \
    && emcc -sMEMORY64=1 -sEMULATE_FUNCTION_POINTER_CASTS=1 -O1 \
        /app/core/c-src/bindings.c \
        /root/meos-install/lib/libmeos.a \
        /root/geos/build/lib/libgeos.a \
        /root/geos/build/lib/libgeos_c.a \
        /root/PROJ/build/lib/libproj.a \
        /root/sqlite3/libsqlite3.a \
        /root/gsl-wasm/lib/libgsl.a \
        /root/gsl-wasm/lib/libgslcblas.a \
        /root/json-c-install/lib/libjson-c.a \
        /root/h3-install/lib/libh3.a \
        -I/root/meos-install/include \
        -I/root/geos/include \
        -I/root/geos/build/capi \
        -I/root/PROJ/src \
        -I/root/json-c-install/include \
        -I/root/gsl-wasm/include \
        -I/root/h3-install/include \
        --embed-file /usr/share/zoneinfo@/usr/share/zoneinfo \
        --embed-file /root/meos-install/share/spatial_ref_sys.csv@/usr/local/share/spatial_ref_sys.csv \
        --embed-file /root/PROJ/build/data/proj.db@/usr/local/share/proj/proj.db \
        -o /app/wasm/meos.js \
        -s MODULARIZE=1 \
        -s EXPORT_NAME="createMeosModule" \
        -s EXPORTED_RUNTIME_METHODS='["ccall","cwrap","UTF8ToString","allocate","ALLOC_NORMAL"]' \
        -s ALLOW_MEMORY_GROWTH=1 \
        -s STACK_SIZE=8MB \
        -s ENVIRONMENT='web,node' \
        -s EXPORT_ES6=1 \
        -Wno-incompatible-pointer-types \
        -Wno-int-conversion

FROM scratch AS wasm

COPY --from=builder /app/wasm/meos.js   meos.js
COPY --from=builder /app/wasm/meos.wasm meos.wasm
