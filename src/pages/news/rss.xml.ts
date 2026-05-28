import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import type { APIContext } from "astro";
import { SITE_NAME, SITE_DESCRIPTION } from "../../lib/site";

export async function GET(context: APIContext) {
  const entries = (await getCollection("news"))
    .filter((e) => !e.data.draft)
    .sort((a, b) => b.data.datePublished.localeCompare(a.data.datePublished));

  return rss({
    title: `${SITE_NAME} — Analysis`,
    description: SITE_DESCRIPTION,
    site: context.site ?? "https://themildtake.example",
    items: entries.map((entry) => ({
      title: entry.data.title,
      link: `/news/${entry.id}/`,
      pubDate: new Date(`${entry.data.datePublished}T12:00:00Z`),
      description: entry.data.description,
      categories: [entry.data.section, ...entry.data.tags],
    })),
    customData: `<language>en-us</language>`,
  });
}
