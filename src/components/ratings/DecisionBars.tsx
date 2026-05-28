import { useMemo } from "preact/hooks";
import type { EChartsCoreOption } from "echarts/core";
import EChart from "./EChart";
import { readChartTokens } from "./echartsSetup";

export interface BarSeries {
  name: string;
  /** Scores aligned to `labels`, each -10..+10. */
  scores: number[];
  color?: string;
}

interface Props {
  labels: string[];
  series: BarSeries[];
  /** Color each bar by its score's sentiment (single-country detail view). */
  colorBySentiment?: boolean;
  height?: number;
}

export default function DecisionBars({ labels, series, colorBySentiment, height = 300 }: Props) {
  const option = useMemo<EChartsCoreOption>(() => {
    const t = readChartTokens();
    const multi = series.length > 1;
    const sentimentColor = (v: number) => (v >= 3 ? t.pos : v <= -3 ? t.neg : t.mixed);

    return {
      textStyle: { fontFamily: t.fontMono },
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
        valueFormatter: (v: unknown) => (typeof v === "number" ? v.toFixed(2) : String(v)),
      },
      legend: multi
        ? { top: 0, textStyle: { color: t.fgMuted, fontFamily: t.fontMono, fontSize: 11 }, data: series.map((s) => s.name) }
        : undefined,
      grid: { left: 4, right: 12, top: multi ? 32 : 8, bottom: 4, containLabel: true },
      xAxis: {
        type: "category",
        data: labels,
        axisLine: { lineStyle: { color: t.border } },
        axisTick: { show: false },
        axisLabel: { color: t.fgMuted, fontFamily: t.fontMono, fontSize: 12 },
      },
      yAxis: {
        type: "value",
        min: -10,
        max: 10,
        interval: 5,
        axisLabel: { color: t.fgFaint, fontFamily: t.fontMono, fontSize: 11 },
        splitLine: { lineStyle: { color: t.border } },
      },
      series: series.map((s, i) => ({
        type: "bar",
        name: s.name,
        barMaxWidth: 40,
        data: s.scores.map((v) => ({
          value: v,
          itemStyle: colorBySentiment ? { color: sentimentColor(v) } : undefined,
        })),
        itemStyle: !colorBySentiment && s.color ? { color: s.color } : undefined,
        markLine:
          i === 0
            ? {
                silent: true,
                symbol: "none",
                label: { show: false },
                lineStyle: { color: t.borderStrong, type: "solid", width: 1 },
                data: [{ yAxis: 0 }],
              }
            : undefined,
      })),
    };
  }, [labels, series, colorBySentiment]);

  return <EChart option={option} height={height} ariaLabel="Decision score bar chart" />;
}
