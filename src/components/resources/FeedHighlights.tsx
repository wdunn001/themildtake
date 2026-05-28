import { useAsync } from "../ratings/useAsync";

interface FeedItem {
  title: string;
  link?: string;
  date?: string | null;
}
interface FeedSource {
  ok: boolean;
  skipped?: boolean;
  label: string;
  url: string;
  items: FeedItem[];
  error?: string;
}
interface FeedsDoc {
  fetchedAt: string;
  sources: Record<string, FeedSource>;
}

interface Props {
  /** id -> display name, from the shared resources config. */
  names: Record<string, string>;
}

function fmtDate(d?: string | null): string {
  if (!d) return "";
  const t = new Date(d);
  if (Number.isNaN(t.getTime())) return "";
  return t.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export default function FeedHighlights({ names }: Props) {
  const { data, error, loading } = useAsync<FeedsDoc>(
    () => fetch("/data/feeds.json").then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`)))),
    [],
  );

  if (loading) return <p class="fh__status">Loading recent activity…</p>;
  if (error || !data) return <p class="fh__status">Recent activity unavailable.</p>;

  const entries = Object.entries(data.sources);
  const checked = fmtDate(data.fetchedAt);

  return (
    <div class="fh">
      <p class="fh__checked">Last checked {checked || data.fetchedAt}</p>
      <div class="fh__grid">
        {entries.map(([id, src]) => (
          <section class="fh__card">
            <header class="fh__head">
              <span class="fh__name">{names[id] ?? id}</span>
              <span class="fh__label">{src.label}</span>
            </header>
            {src.ok && src.items.length > 0 ? (
              <ul class="fh__items">
                {src.items.map((it) => (
                  <li>
                    {it.link ? (
                      <a href={it.link} rel="noopener" target="_blank">{it.title || it.link}</a>
                    ) : (
                      <span>{it.title}</span>
                    )}
                    {fmtDate(it.date) && <time class="fh__date"> · {fmtDate(it.date)}</time>}
                  </li>
                ))}
              </ul>
            ) : (
              <p class="fh__empty">{src.skipped ? "Feed check skipped." : "Feed unreachable at last check."}</p>
            )}
          </section>
        ))}
      </div>

      <style>{`
        .fh__status { font-family: var(--font-mono); color: var(--fg-faint); }
        .fh__checked { font-family: var(--font-mono); font-size: 0.75rem; color: var(--fg-faint); margin: 0 0 1rem; }
        .fh__grid { display: grid; gap: 1rem; grid-template-columns: 1fr; }
        @media (min-width: 720px) { .fh__grid { grid-template-columns: 1fr 1fr; } }
        .fh__card { border: 1px solid var(--border); border-radius: 10px; background: var(--bg-elev); padding: 1rem; }
        .fh__head { display: flex; align-items: baseline; justify-content: space-between; gap: 0.5rem; margin-bottom: 0.6rem; }
        .fh__name { font-family: var(--font-mono); font-weight: 600; color: var(--fg); }
        .fh__label { font-family: var(--font-mono); font-size: 0.6875rem; color: var(--fg-faint); text-transform: uppercase; letter-spacing: 0.05em; }
        .fh__items { list-style: none; margin: 0; padding: 0; }
        .fh__items li { padding: 0.35rem 0; border-top: 1px solid var(--border); font-size: 0.875rem; }
        .fh__items li:first-child { border-top: 0; }
        .fh__items a { color: var(--fg-muted); }
        .fh__items a:hover { color: var(--data); }
        .fh__date { color: var(--fg-faint); font-family: var(--font-mono); font-size: 0.6875rem; }
        .fh__empty { color: var(--fg-faint); font-size: 0.8125rem; margin: 0; }
      `}</style>
    </div>
  );
}
