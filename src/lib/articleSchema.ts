import { ORG_NAME, LOCALE } from "./site";

export interface ArticleGraphInput {
  origin: string;
  canonical: string;
  headline: string;
  description: string;
  datePublished: string; // ISO date (YYYY-MM-DD)
  dateModified?: string;
  authorName: string;
  authorUrl?: string;
  section: string;
  tags: string[];
  /** Absolute image URLs. */
  images: string[];
}

/**
 * Builds the article-specific schema.org nodes (NewsArticle + BreadcrumbList).
 * These are merged into the single site `@graph` (Organization + WebSite are
 * emitted by Seo.astro), referencing the shared org/website @id anchors so the
 * structured data stays consistent and de-duplicated.
 */
export function buildArticleGraph(input: ArticleGraphInput): Record<string, unknown>[] {
  const orgId = `${input.origin}/#organization`;
  const websiteId = `${input.origin}/#website`;
  const articleId = `${input.canonical}#article`;

  // Date-only frontmatter -> noon UTC to avoid timezone drift.
  const published = `${input.datePublished}T12:00:00Z`;
  const modified = `${input.dateModified ?? input.datePublished}T12:00:00Z`;

  const author = input.authorUrl
    ? { "@type": "Person", name: input.authorName, url: input.authorUrl }
    : input.authorName === ORG_NAME
      ? { "@type": "Organization", name: input.authorName }
      : { "@type": "Person", name: input.authorName };

  const article: Record<string, unknown> = {
    "@type": "NewsArticle",
    "@id": articleId,
    headline: input.headline.slice(0, 110),
    description: input.description,
    datePublished: published,
    dateModified: modified,
    author,
    publisher: { "@id": orgId },
    mainEntityOfPage: { "@type": "WebPage", "@id": input.canonical },
    isPartOf: { "@id": websiteId },
    url: input.canonical,
    articleSection: input.section,
    inLanguage: LOCALE,
  };
  if (input.images.length > 0) article.image = input.images;
  if (input.tags.length > 0) article.keywords = input.tags.join(", ");

  const breadcrumb = {
    "@type": "BreadcrumbList",
    "@id": `${input.canonical}#breadcrumb`,
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${input.origin}/` },
      { "@type": "ListItem", position: 2, name: "Analysis", item: `${input.origin}/news/` },
      { "@type": "ListItem", position: 3, name: input.headline, item: input.canonical },
    ],
  };

  return [article, breadcrumb];
}
