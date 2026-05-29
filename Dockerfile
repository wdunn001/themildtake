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

# ---- serve ----
# Stock nginx, no custom module build. gzip_static (a standard, built-in nginx
# module) serves the precompressed .msgpack.gz with Content-Encoding: gzip, and
# on-the-fly gzip covers HTML/CSS/JS. Brotli is intentionally not used: it would
# require compiling ngx_brotli, and for these small payloads the gain over gzip is
# negligible. The precompressed .msgpack.br files are harmless if present (unused).
FROM nginx:1.27-alpine
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /src/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
