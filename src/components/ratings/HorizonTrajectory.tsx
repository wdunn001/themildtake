import { useMemo } from "preact/hooks";
import type { EChartsCoreOption } from "echarts/core";
import EChart from "./EChart";
import { readChartTokens } from "./echartsSetup";

export interface TrajectoryLine {
  name: string;
  /** [near, mid, long] composites for this decision's weighting. */
  points: [number, number, number];
  /** Index (0 near / 1 mid / 2 long) of the horizon this decision reports. */
  nativeIndex: number;
  color: string;
}

interface Props {
  lines: TrajectoryLine[];
  height?: number;
}

const X = ["Near · 1–3y", "Mid · 3–7y", "Long · 5–10y"];

/** Line chart of each decision's score projected across the three horizons. The
 *  enlarged point on each line is the horizon that decision actually reports. */
export default function HorizonTrajectory({ lines, height = 300 }: Props) {
  const option = useMemo<EChartsCoreOption>(() => {
    const t = readChartTokens();
    return {
      textStyle: { fontFamily: t.fontMono },
      tooltip: {
        trigger: "axis",
        valueFormatter: (v: unknown) => (typeof v === "number" ? v.toFixed(2) : String(v)),
      },
      legend: {
        top: 0,
        textStyle: { color: t.fgMuted, fontFamily: t.fontMono, fontSize: 11 },
        data: lines.map((l) => l.name),
      },
      grid: { left: 4, right: 14, top: 32, bottom: 4, containLabel: true },
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
        lineStyle: { color: l.color, width: 2 },
        itemStyle: { color: l.color },
        // Enlarge the reported horizon's point so it reads as "the score we use".
        data: l.points.map((v, idx) => ({
          value: v,
          symbolSize: idx === l.nativeIndex ? 13 : 6,
          itemStyle: idx === l.nativeIndex ? { borderColor: t.bgElev, borderWidth: 2 } : undefined,
        })),
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

  return <EChart option={option} height={height} ariaLabel="Score trajectory across time horizons" />;
}
