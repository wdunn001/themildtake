// Tree-shaken ECharts registration. Only the chart types + components the
// ratings app uses are pulled in, with the SVG renderer (crisp, light, matches
// the static dark aesthetic). Import `echarts` from here, never from "echarts".
import * as echarts from "echarts/core";
import { BarChart, RadarChart, LineChart } from "echarts/charts";
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  RadarComponent,
  MarkLineComponent,
} from "echarts/components";
import { SVGRenderer } from "echarts/renderers";

echarts.use([
  BarChart,
  RadarChart,
  LineChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  RadarComponent,
  MarkLineComponent,
  SVGRenderer,
]);

export { echarts };

export interface ChartTokens {
  fg: string;
  fgMuted: string;
  fgFaint: string;
  border: string;
  borderStrong: string;
  bgElev: string;
  data: string;
  pos: string;
  neg: string;
  mixed: string;
  fontMono: string;
}

/** Read the live CSS custom properties so charts match the theme tokens. */
export function readChartTokens(): ChartTokens {
  const fallback: ChartTokens = {
    fg: "#F3F4F6",
    fgMuted: "#9CA3AF",
    fgFaint: "#6B7280",
    border: "#1F1F26",
    borderStrong: "#2A2A33",
    bgElev: "#111114",
    data: "#3B82F6",
    pos: "#10B981",
    neg: "#EF4444",
    mixed: "#F59E0B",
    fontMono: "ui-monospace, Menlo, monospace",
  };
  if (typeof document === "undefined") return fallback;
  const s = getComputedStyle(document.documentElement);
  const get = (name: string, fb: string) => s.getPropertyValue(name).trim() || fb;
  return {
    fg: get("--fg", fallback.fg),
    fgMuted: get("--fg-muted", fallback.fgMuted),
    fgFaint: get("--fg-faint", fallback.fgFaint),
    border: get("--border", fallback.border),
    borderStrong: get("--border-strong", fallback.borderStrong),
    bgElev: get("--bg-elev", fallback.bgElev),
    data: get("--data", fallback.data),
    pos: get("--pos", fallback.pos),
    neg: get("--neg", fallback.neg),
    mixed: get("--mixed", fallback.mixed),
    fontMono: get("--font-mono", fallback.fontMono),
  };
}
