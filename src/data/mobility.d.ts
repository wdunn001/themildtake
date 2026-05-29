export const BLOCS: Record<string, string[]>;
export const PASSPORT_TIER: Record<string, string>;
export const PASSPORT_TIER_DEFAULT: string;
export function sharesFreeMovement(originIso3: string, destIso3: string): boolean;
export function sharesResidencyPath(originIso3: string, destIso3: string): boolean;
export function passportTier(originIso3: string): string;
