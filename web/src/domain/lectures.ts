import type { Basis, LectureEntry } from "./schemas.ts";

export type LectureStatus = "draft" | "read" | "upcoming";

/** ISO dates compare lexicographically. */
export const lectureStatus = (lecture: LectureEntry, today: string): LectureStatus => {
  if (lecture.basis === "lecture") {
    return "read";
  }
  return lecture.date > today ? "upcoming" : "draft";
};

export const countByBasis = (lectures: readonly LectureEntry[]): Record<Basis, number> => ({
  forecast: lectures.filter((lecture) => lecture.basis === "forecast").length,
  lecture: lectures.filter((lecture) => lecture.basis === "lecture").length,
});

/** The newest lecture that has already taken place; falls back to the first one. */
export const latestLecture = (
  lectures: readonly LectureEntry[],
  today: string,
): LectureEntry | undefined => {
  const happened = lectures.filter((lecture) => lecture.date <= today);
  return happened.at(-1) ?? lectures[0];
};

/** The newest lecture written from a lecture recording. */
export const latestRead = (lectures: readonly LectureEntry[]): LectureEntry | undefined =>
  lectures.findLast((lecture) => lecture.basis === "lecture");

export const neighbours = (
  lectures: readonly LectureEntry[],
  weekId: string,
): { readonly next: LectureEntry | undefined; readonly prev: LectureEntry | undefined } => {
  const index = lectures.findIndex((lecture) => lecture.weekId === weekId);
  return index === -1
    ? { next: undefined, prev: undefined }
    : { next: lectures[index + 1], prev: lectures[index - 1] };
};
