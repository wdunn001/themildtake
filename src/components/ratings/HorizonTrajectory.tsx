import { useMemo } from "preact/hooks";
import type { EChartsCoreOption } from "echarts/core";
import EChart from "./EChart";
import { readChartTokens } from "./echartsSetup";

export interface TrajectoryLine {
  name: string;
  /** [currency (near), assets (mid), living (long)] decision scores. */
  points: [number, number, number];
  color: string;
}

interface Props {
  lines: TrajectoryLine[];
  height?: number;
}

// Each x-position is the decision that natively reads that horizon, so the line
// traces a country's risk from the near term (currency) to the long term (living).
const X = ["Currency · 1-3y", "Assets · 3-7y", "Living · 5-10y"];

export default function HorizonTrajectory({ lines, height = 300 }: Props) {
  const option = useMemo<EChartsCoreOption>(() => {
    const t = readChartTokens();
    const multi = lines.length > 1;
    return {
      textStyle: { fontFamily: t.fontMono },
      tooltip: {
        trigger: "axis",
        valueFormatter: (v: unknown) => (typeof v === "number" ? v.toFixed(2) : String(v)),
      },
      legend: multi
        ? { top: 0, textStyle: { color: t.fgMuted, fontFamily: t.fontMono, fontSize: 11 }, data: lines.map((l) => l.name) }
        : undefined,
      grid: { left: 4, right: 14, top: multi ? 32 : 12, bottom: 4, containLabel: true },
      xAxis: {
        type: "category",
        data: X,
        boundaryGap: false,
        axisLine: { lineStyle: { color: t.border } },
        axisTick: { show: false },
        axisLabel: { color: t.fgMuted, fontFamily: t.fontMono, fontSize: 11 },
      },
      yAxis: {
        type: "value",
        min: -10,
        max: 10,
        interval: 5,
        axisLabel: { color: t.fgFaint, fontFamily: t.fontMono, fontSize: 11 },
        splitLine: { lineStyle: { color: t.border } },
      },
      series: lines.map((l, i) => ({
        type: "line",
        name: l.name,
        smooth: false,
        symbolSize: 8,
        lineStyle: { color: l.color, width: 2.5 },
        itemStyle: { color: l.color },
        label: {
          show: true,
          position: "top",
          color: t.fgMuted,
          fontFamily: t.fontMono,
          fontSize: 10,
          formatter: (p: { value: number }) => (typeof p.value === "number" ? p.value.toFixed(1) : ""),
        },
        data: l.points,
        markLine:
          i === 0
            ? {
                silent: true,
                symbol: "none",
                label: { show: false },
                lineStyle: { color: t.borderStrong, width: 1 },
                data: [{ yAxis: 0 }],
              }
            : undefined,
      })),
    };
  }, [lines]);

  return <EChart option={option} height={height} ariaLabel="Risk trajectory from near to long horizon" />;
}
