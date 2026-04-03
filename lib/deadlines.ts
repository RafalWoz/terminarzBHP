import { differenceInDays, isAfter } from "date-fns";

export type DeadlineStatus = "ok" | "warning" | "critical" | "expired";

export function getDeadlineStatus(expiresAt: Date): DeadlineStatus {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiresAt);
  expiry.setHours(0, 0, 0, 0);

  if (!isAfter(expiry, today)) {
    return "expired";
  }

  const daysLeft = differenceInDays(expiry, today);

  if (daysLeft <= 7) return "critical";
  if (daysLeft <= 30) return "warning";
  return "ok";
}

export function getDaysLeft(expiresAt: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiresAt);
  expiry.setHours(0, 0, 0, 0);
  return differenceInDays(expiry, today);
}

export const STATUS_COLORS: Record<DeadlineStatus, string> = {
  ok: "bg-green-100 text-green-800",
  warning: "bg-yellow-100 text-yellow-800",
  critical: "bg-red-100 text-red-800",
  expired: "bg-red-200 text-red-900",
};

export const STATUS_DOT: Record<DeadlineStatus, string> = {
  ok: "bg-green-500",
  warning: "bg-yellow-500",
  critical: "bg-red-500",
  expired: "bg-red-700",
};

export const DEFAULT_CATEGORIES = [
  { value: "medical", label: "Badanie lekarskie" },
  { value: "bhp_general", label: "Szkolenie BHP ogolne" },
  { value: "bhp_position", label: "Szkolenie BHP stanowiskowe" },
  { value: "udt", label: "Uprawnienia UDT" },
  { value: "sep", label: "Uprawnienia SEP" },
  { value: "drivers_license", label: "Prawo jazdy" },
  { value: "drivers_card", label: "Karta kierowcy" },
  { value: "custom", label: "Inny certyfikat" },
];

export const PLAN_LIMITS: Record<string, number> = {
  FREE: 3,
  STARTER: 10,
  STANDARD: 30,
  PRO: Infinity,
};
