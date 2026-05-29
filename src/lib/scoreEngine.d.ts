// Types for the shared scoring engine (src/lib/scoreEngine.mjs), so TS islands
// importing it stay type-safe.
import type { Assessment, Category, SubFactor } from "./types";

export type Horizon = "near" | "mid" | "long";
export interface Composite {
  score: number;
  confidence: number;
}
export interface TierInfo {
  tier: "observable" | "mixed" | "opaque" | "unknown";
  trend: "declining" | "stable";
  cap: number;
}

export function round(n: number, d: number): number;
export function subHorizon(sf: SubFactor, h: Horizon): number | null;
export function categoryComposite(cat: Category, h: Horizon, confCap?: number): Composite;
export const TIER_CAP: Record<string, number>;
export function transparencyTier(doc: Pick<Assessment, "categories">): TierInfo;
export function readingFor(score: number, confidence: number): string;
export const HORIZON_BY_DECISION: Record<string, Horizon>;
export function decisionComposite(
  categories: Record<string, Category>,
  weights: Record<string, number>,
  h: Horizon,
  confCap?: number,
): Composite;
export function recompute<T extends Assessment>(doc: T): T;
