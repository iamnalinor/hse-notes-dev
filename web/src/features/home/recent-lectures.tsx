import { Link } from "react-router";

import type { CourseInfo } from "#web/domain/courses.ts";
import type { LectureEntry } from "#web/domain/schemas.ts";

import { shortDate } from "#web/domain/dates.ts";
import { lectureStatus } from "#web/domain/lectures.ts";
import { paths } from "#web/domain/paths.ts";
import { StatusBadge } from "#web/shared/ui/status-badge.tsx";

export type RecentItem = { readonly course: CourseInfo; readonly lecture: LectureEntry };

const MAX_ROWS = 6;

/** The newest lectures that already took place, across all courses. */
export const recentItems = (all: readonly RecentItem[], today: string): readonly RecentItem[] =>
  all
    .filter((item) => item.lecture.date <= today)
    .toSorted((a, b) => b.lecture.date.localeCompare(a.lecture.date))
    .slice(0, MAX_ROWS);

export const RecentLectures = ({
  items,
  today,
}: {
  readonly items: readonly RecentItem[];
  readonly today: string;
}) => (
  <div className="overflow-x-auto rounded-xl border border-rule bg-card">
    <table className="w-full min-w-160 border-collapse">
      <thead>
        <tr>
          {["Курс", "Дата", "Тема", "Статус"].map((title) => (
            <th
              className="border-b border-rule px-4.5 py-3 text-left text-[12.5px] font-semibold text-muted"
              key={title}
              scope="col"
            >
              {title}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {items.map(({ course, lecture }) => (
          <tr className="border-b border-rule last:border-0" key={`${course.id}/${lecture.weekId}`}>
            <td className="px-4.5 py-3.5 text-[14.5px] whitespace-nowrap text-muted">
              {course.short} · {lecture.lecture}
            </td>
            <td className="px-4.5 py-3.5 text-[14.5px] text-muted">{shortDate(lecture.date)}</td>
            <td className="px-4.5 py-3.5">
              <Link
                className="font-serif text-[17px] text-ink no-underline"
                to={paths.lecture(course.id, lecture.weekId)}
              >
                {lecture.title}
              </Link>
            </td>
            <td className="px-4.5 py-3.5">
              <StatusBadge status={lectureStatus(lecture, today)} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
