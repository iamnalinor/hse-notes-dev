import { Link } from "react-router";

import type { CourseInfo } from "#web/domain/courses.ts";
import type { LectureEntry } from "#web/domain/schemas.ts";
import type { LabelStats } from "#web/domain/stats.ts";

import { type LectureStatus, lectureStatus } from "#web/domain/lectures.ts";
import { paths } from "#web/domain/paths.ts";

type Props = {
  readonly course: CourseInfo;
  readonly current: LectureEntry | undefined;
  readonly lectures: readonly LectureEntry[];
  readonly stats: LabelStats;
  readonly today: string;
};

const SEGMENT: Readonly<Record<LectureStatus, string>> = {
  draft: "bg-[repeating-linear-gradient(135deg,var(--org)_0_3px,var(--org-soft)_3px_6px)]",
  read: "bg-ex",
  upcoming: "bg-rule",
};

const BUTTON =
  "inline-flex items-center gap-2 rounded-lg border border-ink/40 px-3.5 py-2.5 text-sm font-semibold text-ink no-underline";

export const CourseHero = ({ course, current, lectures, stats, today }: Props) => {
  const statuses = lectures.map((lecture) => lectureStatus(lecture, today));
  const read = statuses.filter((status) => status === "read").length;
  const drafts = statuses.filter((status) => status === "draft").length;
  return (
    <section className="grid items-end gap-8 border-b border-rule py-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-14 lg:pt-14 lg:pb-10">
      <div>
        <div className="text-[13px] font-semibold tracking-[0.14em] text-def uppercase">
          Курс · 1 модуль
        </div>
        <h1 className="mt-2.5 mb-3.5 text-[40px] leading-none font-bold tracking-tight sm:text-[56px]">
          {course.name}
        </h1>
        <p className="max-w-160 font-serif text-xl/relaxed text-ink/80">{course.summary}</p>
        <div className="mt-5.5 flex flex-wrap gap-x-6.5 gap-y-1 text-sm text-muted">
          <span>
            Лектор <b className="font-semibold text-ink">{course.lecturer}</b>
          </span>
          <span>
            Лекции по <b className="font-semibold text-ink">{course.weekdayDative}</b>
          </span>
          <span>
            <b className="font-semibold text-ink">{stats.definitions}</b> определений ·{" "}
            <b className="font-semibold text-ink">{stats.theorems}</b> теорем
          </span>
        </div>
        <div className="mt-4 flex flex-wrap gap-2.5">
          {current !== undefined && (
            <Link
              className={`${BUTTON} border-ink bg-ink text-paper`}
              to={paths.lecture(course.id, current.weekId)}
            >
              Читать лекцию {current.lecture} →
            </Link>
          )}
          <Link className={BUTTON} to={paths.registry(course.id)}>
            Реестр теории
          </Link>
          <Link className={BUTTON} to={paths.glossary(course.id)}>
            Глоссарий
          </Link>
        </div>
      </div>
      <div className="rounded-xl border border-rule bg-card p-5">
        <div className="flex items-baseline justify-between text-sm text-muted">
          <span>Готово конспектов</span>
          <span>из {lectures.length}</span>
        </div>
        <div className="text-[40px] font-bold tracking-tight">{read}</div>
        <div
          aria-label={`${String(read)} по лекции, ${String(drafts)} черновика`}
          className="my-3.5 flex gap-0.75"
          role="img"
        >
          {statuses.map((status, index) => (
            <span
              className={`h-2 flex-1 rounded-xs ${SEGMENT[status]}`}
              key={lectures[index]?.weekId}
            />
          ))}
        </div>
        <div className="flex gap-4 text-[12.5px] text-muted">
          <span>
            <i className="mr-1.5 inline-block h-2 w-2.5 rounded-xs bg-ex align-baseline" />
            по лекции · {read}
          </span>
          <span>
            <i className="mr-1.5 inline-block h-2 w-2.5 rounded-xs bg-org align-baseline" />
            черновик · {drafts}
          </span>
        </div>
      </div>
    </section>
  );
};
