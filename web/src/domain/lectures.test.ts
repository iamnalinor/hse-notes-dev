import { describe, expect, it } from "vitest";

import type { LectureEntry } from "./schemas.ts";

import { countByBasis, latestLecture, latestRead, lectureStatus, neighbours } from "./lectures.ts";

const lecture = (n: number, date: string, basis: LectureEntry["basis"]): LectureEntry => ({
  basis,
  date,
  lecture: n,
  title: `Лекция ${String(n)}`,
  weekId: `0${String(n)}`,
});

const FIRST = lecture(1, "2026-10-01", "lecture");
const SECOND = lecture(2, "2026-10-08", "lecture");
const THIRD = lecture(3, "2026-10-14", "forecast");
const FOURTH = lecture(4, "2026-10-21", "forecast");
const ALL = [FIRST, SECOND, THIRD, FOURTH];

describe("lectureStatus", () => {
  it("is read when written from a recording", () => {
    expect(lectureStatus(FIRST, "2026-10-15")).toBe("read");
  });

  it("is a draft once the lecture date has passed", () => {
    expect(lectureStatus(THIRD, "2026-10-15")).toBe("draft");
  });

  it("is upcoming before the lecture date", () => {
    expect(lectureStatus(FOURTH, "2026-10-15")).toBe("upcoming");
  });
});

describe("lecture lists", () => {
  it("counts by basis", () => {
    expect(countByBasis(ALL)).toEqual({ forecast: 2, lecture: 2 });
  });

  it("finds the newest lecture that already happened", () => {
    expect(latestLecture(ALL, "2026-10-15")?.lecture).toBe(3);
  });

  it("falls back to the first lecture before the term starts", () => {
    expect(latestLecture(ALL, "2026-09-01")?.lecture).toBe(1);
  });

  it("finds the newest lecture written from a recording", () => {
    expect(latestRead(ALL)?.lecture).toBe(2);
  });

  it("gives neighbours at both ends", () => {
    expect(neighbours(ALL, "01")).toEqual({ next: SECOND, prev: undefined });
    expect(neighbours(ALL, "04")).toEqual({ next: undefined, prev: THIRD });
    expect(neighbours(ALL, "nope")).toEqual({ next: undefined, prev: undefined });
  });
});
