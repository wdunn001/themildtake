import { defineConfig } from "astro/config";
import preact from "@astrojs/preact";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

// Public origin. Override per environment via PUBLIC_SITE_URL (the same value
// belongs in PROXY_THEMILDTAKE_HOSTS on the .198 deploy host). Placeholder
// until the real domain is confirmed.
const site = process.env.PUBLIC_SITE_URL ?? "https://themildtake.example";

export default defineConfig({
  site,
  integrations: [preact(), mdx(), sitemap()],
  // Disable SmartyPants so markdown renders literally: no "--"/"---" turning into
  // en/em dashes and no curly-quote substitution. Em dashes are banned site-wide.
  markdown: {
    smartypants: false,
  },
  build: {
    inlineStylesheets: "auto",
  },
  compressHTML: true,
});
