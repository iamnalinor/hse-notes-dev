import type { LectureEntry } from "#web/domain/schemas.ts";

import { type CourseInfo, findCourse } from "#web/domain/courses.ts";

import { useCatalog } from "./queries.ts";

export type CourseData = {
  readonly info: CourseInfo;
  readonly lectures: readonly LectureEntry[];
};

/** A route param → the course; an unknown course is a 404 for the router's error boundary. */
export const useCourse = (id: string | undefined): CourseData => {
  const catalog = useCatalog();
  const info = findCourse(id);
  const lectures = info === undefined ? undefined : catalog.lectures[info.id];
  if (info === undefined || lectures === undefined) {
    // eslint-disable-next-line @typescript-eslint/only-throw-error -- React Router's contract for a 404
    throw new Response("Not Found", { status: 404 });
  }
  return { info, lectures };
};
