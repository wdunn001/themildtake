// Site-wide constants. The public origin comes from astro.config `site`
// (Astro.site); these are the human/brand fields used across SEO + JSON-LD.

export const SITE_NAME = "The Mild Take";
export const SITE_TAGLINE =
  "Confidence-weighted country risk assessments for individual decisions.";
export const SITE_DESCRIPTION =
  "The Mild Take publishes source-disciplined country risk assessments - directional scores and explicit confidence for living, asset, and currency decisions - plus analysis articles.";
export const ORG_NAME = "The Mild Take";
export const ORG_LOGO_PATH = "/logo.svg";
// PNG, not SVG: social platforms (Facebook, LinkedIn, X, Slack) do not render
// SVG link-preview images. 1200x630 is the standard Open Graph size.
export const DEFAULT_OG_IMAGE = "/og-default.png";
export const LOCALE = "en-US";

/** Absolute URL helper bound to the configured site origin. */
export function absoluteUrl(pathOrUrl: string, siteOrigin: URL | undefined): string {
  if (/^https?:\/\//.test(pathOrUrl)) return pathOrUrl;
  const origin = siteOrigin?.origin ?? "";
  return `${origin}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;
}
