# Multi-stage build for The Mild Take (Astro -> static -> nginx).
# Mirrors the codec-website pattern; serves behind jwilder/nginx-proxy on .198.

# ---- build ----
FROM node:22-alpine AS build
WORKDIR /src

# Install deps with cache-friendly layering.
COPY package.json package-lock.json* ./
RUN npm ci --no-audit --no-fund

# Build the static site. `prebuild` (npm run sync-data) copies the canonical
# assessments/ + _comparison-index.json + schema.json into public/data/.
COPY . .
ARG PUBLIC_SITE_URL=
ENV PUBLIC_SITE_URL=$PUBLIC_SITE_URL
RUN npm run build

# ---- serve ----
FROM nginx:1.27-alpine
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /src/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
