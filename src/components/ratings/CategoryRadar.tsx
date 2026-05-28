import { useMemo } from "preact/hooks";
import type { EChartsCoreOption } from "echarts/core";
import EChart from "./EChart";
import { readChartTokens } from "./echartsSetup";

export interface RadarSeries {
  name: string;
  /** Scores aligned to `indicatorNames`, each -10..+10. */
  values: number[];
  color: string;
}

interface Props {
  indicatorNames: string[];
  series: RadarSeries[];
  height?: number;
}

export default function CategoryRadar({ indicatorNames, series, height = 360 }: Props) {
  const option = useMemo<EChartsCoreOption>(() => {
    const t = readChartTokens();
    const multi = series.length > 1;
    return {
      textStyle: { fontFamily: t.fontMono },
      tooltip: { trigger: "item" },
      legend: multi
        ? {
            bottom: 0,
            textStyle: { color: t.fgMuted, fontFamily: t.fontMono, fontSize: 11 },
            data: series.map((s) => s.name),
          }
        : undefined,
      radar: {
        center: ["50%", multi ? "46%" : "52%"],
        radius: "66%",
        indicator: indicatorNames.map((name) => ({ name, max: 10, min: -10 })),
        axisName: { color: t.fgMuted, fontFamily: t.fontMono, fontSize: 11 },
        splitNumber: 4,
        splitLine: { lineStyle: { color: t.border } },
        splitArea: { areaStyle: { color: ["transparent", "rgba(255,255,255,0.02)"] } },
        axisLine: { lineStyle: { color: t.border } },
      },
      series: [
        {
          type: "radar",
          data: series.map((s) => ({
            value: s.values,
            name: s.name,
            symbolSize: 4,
            lineStyle: { color: s.color, width: 2 },
            itemStyle: { color: s.color },
            areaStyle: { color: s.color, opacity: 0.12 },
          })),
        },
      ],
    };
  }, [indicatorNames, series]);

  return <EChart option={option} height={height} ariaLabel="Category score radar chart" />;
}
