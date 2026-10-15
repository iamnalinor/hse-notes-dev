import { Link } from "react-router";

import type { CourseInfo } from "#web/domain/courses.ts";
import type { LectureEntry } from "#web/domain/schemas.ts";

import { shortDate } from "#web/domain/dates.ts";
import { countByBasis, latestLecture, lectureStatus } from "#web/domain/lectures.ts";
import { paths } from "#web/domain/paths.ts";
import { TexMath } from "#web/shared/reader/tex-math.tsx";

type Props = {
  readonly course: CourseInfo;
  readonly lectures: readonly LectureEntry[];
  readonly today: string;
};

const DRAFT_STRIPES =
  "bg-[repeating-linear-gradient(135deg,var(--org)_0_3px,var(--org-soft)_3px_6px)]";
const SEGMENT = { draft: DRAFT_STRIPES, read: "bg-ex", upcoming: DRAFT_STRIPES } as const;

const BOTTOM_LINK =
  "flex-1 border-rule px-1.5 py-3 text-center text-[13.5px] font-semibold text-ink no-underline [&+&]:border-l";

export const CourseCard = ({ course, lectures, today }: Props) => {
  const counts = countByBasis(lectures);
  const last = latestLecture(lectures, today);
  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-rule bg-card">
      <div className="relative flex min-h-32.5 flex-col border-b border-rule px-5.5 pt-5.5 pb-4.5">
        <span aria-hidden="true" className="absolute top-4.5 right-5 text-[26px] text-faint">
          <TexMath display={false} tex={course.symbol} />
        </span>
        <span className="text-[12.5px] tracking-wider text-muted uppercase">{course.weekday}</span>
        <h3 className="mt-2.5 mb-1.5 max-w-55 text-[25px] leading-tight font-bold">
          {course.name}
        </h3>
        <span className="mt-auto text-[13.5px] text-muted">{course.lecturer}</span>
      </div>
      <div className="flex flex-col gap-2.5 px-5.5 py-4">
        <div
          aria-label={`${String(counts.lecture)} по лекции, ${String(counts.forecast)} черновиков`}
          className="flex gap-0.75"
          role="img"
        >
          {lectures.map((lecture) => (
            <i
              className={`block h-2 flex-1 rounded-xs ${SEGMENT[lectureStatus(lecture, today)]}`}
              key={lecture.weekId}
            />
          ))}
        </div>
        <div className="flex justify-between text-[13px] text-muted">
          <span>
            <b className="font-semibold text-ink">{counts.lecture}</b> по лекции
          </span>
          <span>
            <b className="font-semibold text-ink">{counts.forecast}</b> черновиков
          </span>
        </div>
        {last !== undefined && (
          <Link
            className="block rounded-lg bg-wash px-3 py-2.5 text-ink no-underline"
            to={paths.lecture(course.id, last.weekId)}
          >
            <small className="mb-0.5 block text-xs text-muted">
              Лекция {last.lecture} · {shortDate(last.date)}
            </small>
            <span className="font-serif text-[16.5px] leading-snug">{last.title}</span>
          </Link>
        )}
      </div>
      <div className="mt-auto flex border-t border-rule">
        <Link className={BOTTOM_LINK} to={paths.course(course.id)}>
          Лекции
        </Link>
        <Link className={BOTTOM_LINK} to={paths.registry(course.id)}>
          Реестр
        </Link>
        <Link className={BOTTOM_LINK} to={paths.glossary(course.id)}>
          Глоссарий
        </Link>
      </div>
    </article>
  );
};
