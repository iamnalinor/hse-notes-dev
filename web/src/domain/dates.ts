const ISO_DATE = /^\d{4}-(\d{2})-(\d{2})/;

/** `2026-10-14` → `14.10` */
export const shortDate = (iso: string): string => {
  const match = ISO_DATE.exec(iso);
  return match === null ? iso : `${match[2] ?? ""}.${match[1] ?? ""}`;
};

export const todayIso = (now: Date): string => now.toISOString().slice(0, 10);
