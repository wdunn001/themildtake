# Multi-stage build for The Mild Take (Astro -> static -> nginx + brotli).
# Mirrors the codec-website pattern; serves behind jwilder/nginx-proxy on .198.

# ---- build the static site ----
FROM node:22-alpine AS build
WORKDIR /src
COPY package.json package-lock.json* ./
RUN npm ci --no-audit --no-fund
# `prebuild` (npm run data) syncs assessments/ -> public/data/ and packs them to
# MessagePack (+ precompressed .msgpack.gz / .msgpack.br) for runtime fetch.
COPY . .
ARG PUBLIC_SITE_URL=
ENV PUBLIC_SITE_URL=$PUBLIC_SITE_URL
RUN npm run build

# ---- build ngx_brotli as dynamic modules against the matching nginx version ----
# Official nginx is compiled --with-compat, so modules built with --with-compat
# load cleanly. This avoids trusting a third-party brotli image.
FROM nginx:1.27-alpine AS brotli
RUN set -eux; \
    apk add --no-cache --virtual .build git build-base cmake pcre-dev zlib-dev openssl-dev linux-headers; \
    NGINX_VERSION="$(nginx -v 2>&1 | sed -e 's#^nginx version: nginx/##' -e 's# .*$##')"; \
    cd /tmp; \
    wget -q "https://nginx.org/download/nginx-${NGINX_VERSION}.tar.gz"; \
    tar xf "nginx-${NGINX_VERSION}.tar.gz"; \
    git clone --depth=1 --recurse-submodules https://github.com/google/ngx_brotli.git; \
    cd "nginx-${NGINX_VERSION}"; \
    ./configure --with-compat --add-dynamic-module=../ngx_brotli; \
    make -j"$(nproc)" modules; \
    mkdir -p /modules; \
    cp objs/ngx_http_brotli_filter_module.so objs/ngx_http_brotli_static_module.so /modules/

# ---- serve ----
FROM nginx:1.27-alpine
COPY --from=brotli /modules/ngx_http_brotli_filter_module.so /modules/ngx_http_brotli_static_module.so /etc/nginx/modules/
COPY deploy/nginx.main.conf /etc/nginx/nginx.conf
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /src/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
