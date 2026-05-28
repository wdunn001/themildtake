import { useMemo } from "preact/hooks";
import type { EChartsCoreOption } from "echarts/core";
import { useAsync } from "./useAsync";
import EChart from "./EChart";
import { readChartTokens } from "./echartsSetup";
import {
  aggregate,
  byParty,
  distribution,
  verdictFor,
  type CongressData,
  type Member,
} from "../../lib/congress";

function meterColor(score: number, t: { representative: number; captured: number }): string {
  if (score >= t.representative) return "var(--pos)";
  if (score <= t.captured) return "var(--neg)";
  return "var(--mixed)";
}

function Meter({ value, max, color }: { value: number; max: number; color: string }) {
  return (
    <span class="meter">
      <span class="meter__track">
        <span class="meter__fill" style={{ width: `${(value / max) * 100}%`, background: color }} />
      </span>
      <span class="meter__val">{value.toFixed(1)}</span>
      <style>{`
        .meter { display: flex; align-items: center; gap: 0.6rem; }
        .meter__track { position: relative; flex: 1; height: 8px; border-radius: 4px; background: var(--confidence-track); overflow: hidden; min-width: 80px; }
        .meter__fill { position: absolute; left: 0; top: 0; bottom: 0; border-radius: 4px; }
        .meter__val { font-family: var(--font-mono); font-weight: 700; color: var(--fg); min-width: 2.75rem; text-align: right; }
      `}</style>
    </span>
  );
}

export default function CongressIntegrity() {
  const { data, error, loading } = useAsync<CongressData>(
    () => fetch("/data/congress-integrity.json").then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`)))),
    [],
  );

  const computed = useMemo(() => {
    if (!data) return null;
    const all = aggregate(data.members);
    const house = aggregate(data.members.filter((m) => m.chamber === "house"));
    const senate = aggregate(data.members.filter((m) => m.chamber === "senate"));
    const verdict = verdictFor(all.mean, data.thresholds);
    const dist = distribution(data.members, data.scale.bands);
    const parties = byParty(data.members);
    const capturedShare = data.members.filter((m: Member) => m.score < data.thresholds.captured).length / Math.max(1, data.members.length);
    return { all, house, senate, verdict, dist, parties, capturedShare };
  }, [data]);

  const distOption = useMemo<EChartsCoreOption>(() => {
    const t = readChartTokens();
    const dist = computed?.dist ?? [];
    const colorForGrade = (g: string) => (g === "A" || g === "B" ? t.pos : g === "C" ? t.mixed : t.neg);
    return {
      textStyle: { fontFamily: t.fontMono },
      tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
      grid: { left: 4, right: 12, top: 12, bottom: 4, containLabel: true },
      xAxis: {
        type: "category",
        data: dist.map((d) => d.grade),
        axisLine: { lineStyle: { color: t.border } },
        axisTick: { show: false },
        axisLabel: { color: t.fgMuted, fontFamily: t.fontMono },
      },
      yAxis: {
        type: "value",
        minInterval: 1,
        axisLabel: { color: t.fgFaint, fontFamily: t.fontMono },
        splitLine: { lineStyle: { color: t.border } },
      },
      series: [
        {
          type: "bar",
          barMaxWidth: 48,
          data: dist.map((d) => ({ value: d.count, itemStyle: { color: colorForGrade(d.grade) } })),
        },
      ],
    };
  }, [computed]);

  if (loading) return <p class="ci__status">Loading congressional integrity data…</p>;
  if (error || !data || !computed) return <p class="ci__status ci__status--err">Couldn’t load the dataset. {error}</p>;

  const { all, house, senate, verdict, parties, capturedShare } = computed;

  return (
    <div class="ci">
      {data.is_sample && (
        <div class="ci__sample">
          <strong>Sample data.</strong> {data.source_note}
        </div>
      )}

      <div class={`ci__verdict ci__verdict--${verdict.key}`}>
        <span class="ci__verdict-label">{verdict.label}</span>
        <span class="ci__verdict-score">{all.mean.toFixed(1)}<span class="ci__verdict-max">/{data.scale.max}</span></span>
        <p class="ci__verdict-blurb">{verdict.blurb}</p>
        <p class="ci__verdict-meta">
          {all.count} members · {Math.round(capturedShare * 100)}% below the capture line ({data.thresholds.captured}) ·
          representative ≥ {data.thresholds.representative}
        </p>
      </div>

      <div class="ci__chambers">
        <div class="ci__cham">
          <span class="ci__cham-name">House</span>
          <Meter value={house.mean} max={data.scale.max} color={meterColor(house.mean, data.thresholds)} />
          <span class="ci__cham-meta">{house.count} members · median {house.median.toFixed(0)}</span>
        </div>
        <div class="ci__cham">
          <span class="ci__cham-name">Senate</span>
          <Meter value={senate.mean} max={data.scale.max} color={meterColor(senate.mean, data.thresholds)} />
          <span class="ci__cham-meta">{senate.count} members · median {senate.median.toFixed(0)}</span>
        </div>
      </div>

      <div class="ci__cols">
        <figure class="ci__chart">
          <figcaption>Grade distribution</figcaption>
          <EChart option={distOption} height={260} ariaLabel="Integrity grade distribution" />
        </figure>

        <div class="ci__parties">
          <h3 class="ci__h">By party</h3>
          {parties.map((p) => (
            <div class="ci__party">
              <span class="ci__party-name">{p.party}</span>
              <Meter value={p.agg.mean} max={data.scale.max} color={meterColor(p.agg.mean, data.thresholds)} />
              <span class="ci__party-meta">{p.agg.count}</span>
            </div>
          ))}
        </div>
      </div>

      <p class="ci__source">
        Source: <a href="https://integrityindex.us/" rel="noopener" target="_blank">{data.source}</a>.
        Higher = fewer conflict-of-interest signals. {data.scale.note}
      </p>

      <style>{`
        .ci__status { font-family: var(--font-mono); color: var(--fg-muted); }
        .ci__status--err { color: var(--neg); }
        .ci__sample {
          border-left: 3px solid var(--mixed); background: var(--mixed-soft); color: var(--fg-muted);
          border-radius: 0 8px 8px 0; padding: 0.875rem 1rem; margin-bottom: 1.5rem; font-size: 0.875rem;
        }
        .ci__sample strong { color: var(--fg); }

        .ci__verdict { border: 1px solid var(--border); border-top-width: 4px; border-radius: 12px; background: var(--bg-elev); padding: 1.5rem; margin-bottom: 1.5rem; }
        .ci__verdict--representative { border-top-color: var(--pos); }
        .ci__verdict--mixed { border-top-color: var(--mixed); }
        .ci__verdict--captured { border-top-color: var(--neg); }
        .ci__verdict-label { font-family: var(--font-mono); font-size: 1.25rem; font-weight: 700; color: var(--fg); }
        .ci__verdict-score { float: right; font-family: var(--font-mono); font-size: 2rem; font-weight: 700; color: var(--fg); line-height: 1; }
        .ci__verdict-max { color: var(--fg-faint); font-size: 1rem; }
        .ci__verdict-blurb { color: var(--fg-muted); margin: 0.75rem 0 0; max-width: 70ch; }
        .ci__verdict-meta { font-family: var(--font-mono); font-size: 0.75rem; color: var(--fg-faint); margin: 0.75rem 0 0; }

        .ci__chambers { display: grid; gap: 1rem; grid-template-columns: 1fr; margin-bottom: 2rem; }
        @media (min-width: 560px) { .ci__chambers { grid-template-columns: 1fr 1fr; } }
        .ci__cham { border: 1px solid var(--border); border-radius: 10px; background: var(--bg-elev); padding: 1rem; }
        .ci__cham-name { font-family: var(--font-mono); font-weight: 600; color: var(--fg); display: block; margin-bottom: 0.6rem; }
        .ci__cham-meta { display: block; font-family: var(--font-mono); font-size: 0.6875rem; color: var(--fg-faint); margin-top: 0.5rem; }

        .ci__cols { display: grid; gap: 1.5rem; grid-template-columns: 1fr; margin-bottom: 1.5rem; }
        @media (min-width: 760px) { .ci__cols { grid-template-columns: 1.2fr 0.8fr; } }
        .ci__chart { margin: 0; border: 1px solid var(--border); border-radius: 10px; background: var(--bg-elev); padding: 1rem; }
        .ci__chart figcaption { font-family: var(--font-mono); font-size: 0.6875rem; text-transform: uppercase; letter-spacing: 0.06em; color: var(--fg-faint); margin-bottom: 0.5rem; }
        .ci__parties { border: 1px solid var(--border); border-radius: 10px; background: var(--bg-elev); padding: 1rem; }
        .ci__h { font-family: var(--font-mono); font-size: 0.6875rem; text-transform: uppercase; letter-spacing: 0.06em; color: var(--fg-faint); margin: 0 0 0.75rem; }
        .ci__party { display: grid; grid-template-columns: 2rem 1fr 1.5rem; align-items: center; gap: 0.6rem; padding: 0.4rem 0; }
        .ci__party-name { font-family: var(--font-mono); font-weight: 600; color: var(--fg); }
        .ci__party-meta { font-family: var(--font-mono); font-size: 0.6875rem; color: var(--fg-faint); text-align: right; }

        .ci__source { font-size: 0.8125rem; color: var(--fg-faint); max-width: none; }
        .ci__source a { color: var(--fg-muted); }
        .ci__source a:hover { color: var(--data); }
      `}</style>
    </div>
  );
}
