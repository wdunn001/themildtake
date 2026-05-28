import { useEffect, useRef } from "preact/hooks";
import type { EChartsCoreOption } from "echarts/core";
import { echarts } from "./echartsSetup";

interface Props {
  option: EChartsCoreOption;
  height?: number;
  ariaLabel?: string;
  class?: string;
}

/**
 * Generic ECharts wrapper for Preact: inits an SVG chart on mount, updates the
 * option when it changes, observes container resizes, and disposes on unmount.
 */
export default function EChart({ option, height = 320, ariaLabel, class: className }: Props) {
  const elRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ReturnType<typeof echarts.init> | null>(null);

  useEffect(() => {
    if (!elRef.current) return;
    const chart = echarts.init(elRef.current, null, { renderer: "svg" });
    chartRef.current = chart;
    const ro = new ResizeObserver(() => chart.resize());
    ro.observe(elRef.current);
    return () => {
      ro.disconnect();
      chart.dispose();
      chartRef.current = null;
    };
  }, []);

  useEffect(() => {
    chartRef.current?.setOption(option, true);
  }, [option]);

  return (
    <div
      ref={elRef}
      class={className}
      style={{ width: "100%", height: `${height}px` }}
      role="img"
      aria-label={ariaLabel}
    />
  );
}
