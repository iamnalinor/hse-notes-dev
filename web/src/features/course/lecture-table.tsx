import { Link } from "react-router";

import type { LectureEntry } from "#web/domain/schemas.ts";

import { shortDate } from "#web/domain/dates.ts";
import { type LectureStatus, lectureStatus } from "#web/domain/lectures.ts";
import { paths } from "#web/domain/paths.ts";
import { PdfLink } from "#web/shared/ui/pdf-link.tsx";
import { StatusBadge } from "#web/shared/ui/status-badge.tsx";

type Props = {
  readonly course: string;
  /** Week id of the newest lecture written from a recording. */
  readonly current: string | undefined;
  readonly lectures: readonly LectureEntry[];
  readonly today: string;
};

const NOTE: Readonly<Record<LectureStatus, string | undefined>> = {
  draft: "Написано по программе — сверим с записью лекции",
  read: undefined,
  upcoming: "Лекция ещё впереди",
};

const CELL = "border-b border-rule px-3 py-3.5 align-top text-[15px]";

export const LectureTable = ({ course, current, lectures, today }: Props) => (
  <div className="overflow-x-auto">
    <table className="w-full min-w-160 border-collapse">
      <thead>
        <tr>
          {["№", "Дата", "Тема", "PDF", "Статус"].map((title) => (
            <th
              className="border-b border-ink/40 px-3 py-2.5 text-left text-[12.5px] font-semibold whitespace-nowrap text-muted"
              key={title}
              scope="col"
            >
              {title}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {lectures.map((lecture) => {
          const status = lectureStatus(lecture, today);
          const note = lecture.weekId === current ? "Последняя прочитанная лекция" : NOTE[status];
          return (
            <tr className={status === "upcoming" ? "opacity-60" : undefined} key={lecture.weekId}>
              <td
                className={`${CELL} w-11 text-[22px] font-bold tabular-nums ${lecture.weekId === current ? "text-def" : "text-faint"}`}
              >
                {lecture.lecture}
              </td>
              <td className={`${CELL} w-17.5 whitespace-nowrap text-muted tabular-nums`}>
                {shortDate(lecture.date)}
              </td>
              <td className={CELL}>
                <Link
                  className="font-serif text-lg/snug text-ink no-underline"
                  to={paths.lecture(course, lecture.weekId)}
                >
                  {lecture.title}
                </Link>
                {note !== undefined && (
                  <small className="mt-1 block text-[12.5px] text-muted">{note}</small>
                )}
              </td>
              <td className={CELL}>
                <PdfLink course={course} docId={lecture.weekId} variant="chip" />
              </td>
              <td className={CELL}>
                <StatusBadge status={status} />
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);
