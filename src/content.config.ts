import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

// News / analysis articles. One markdown (or .mdx) file per article. The
// frontmatter here is the source for both the page chrome and the schema.org
// NewsArticle JSON-LD (see src/lib/articleSchema.ts).
const news = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/news" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      /** ISO date (YYYY-MM-DD). Sort + datePublished key. */
      datePublished: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "datePublished must be ISO YYYY-MM-DD"),
      /** ISO date of last meaningful edit; defaults to datePublished. */
      dateModified: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "dateModified must be ISO YYYY-MM-DD")
        .optional(),
      author: z
        .object({ name: z.string(), url: z.string().url().optional() })
        .default({ name: "The Mild Take" }),
      /** Optional hero/social image processed by Astro's asset pipeline. */
      image: image().optional(),
      section: z.string().default("Analysis"),
      tags: z.array(z.string()).default([]),
      draft: z.boolean().default(false),
    }),
});

export const collections = { news };
