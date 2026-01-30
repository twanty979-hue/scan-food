export const PLAN_LIMITS = {
  free: { maxFreeThemes: 3, maxOrders: 30 },
  basic: { maxFreeThemes: 10, maxOrders: Infinity },
  pro: { maxFreeThemes: 30, maxOrders: Infinity },
  ultimate: { maxFreeThemes: Infinity, maxOrders: Infinity }
};

export type PlanType = keyof typeof PLAN_LIMITS;
// lib/planConfig.ts

export const PLAN_LEVELS: Record<string, number> = {
  free: 0,
  basic: 1,
  pro: 2,
  ultimate: 99
};

export function canAccessTheme(userPlan: string, themeMinPlan: string) {
  const userLevel = PLAN_LEVELS[userPlan?.toLowerCase()] || 0;
  const themeLevel = PLAN_LEVELS[themeMinPlan?.toLowerCase()] || 0;
  return userLevel >= themeLevel;
}