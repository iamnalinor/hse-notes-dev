import type { TocItem } from "./schemas.ts";

/** Level-2 sections are numbered `lecture.k` (4.1, 4.2, …) the way the design shows them. */
export const sectionNumbers = (
  toc: readonly TocItem[],
  lecture: number,
): ReadonlyMap<string, string> =>
  new Map(
    toc
      .filter((item) => item.level === 2)
      .map((item, index) => [item.id, `${lecture}.${index + 1}`] as const),
  );
