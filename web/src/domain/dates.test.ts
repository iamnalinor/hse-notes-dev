import { describe, expect, it } from "vitest";

import { shortDate, todayIso } from "./dates.ts";

describe("dates", () => {
  it("shortens an ISO date to day.month", () => {
    expect(shortDate("2026-10-14")).toBe("14.10");
  });

  it("leaves garbage as it is", () => {
    expect(shortDate("скоро")).toBe("скоро");
  });

  it("formats today as ISO", () => {
    expect(todayIso(new Date("2026-10-15T08:30:00Z"))).toBe("2026-10-15");
  });
});
