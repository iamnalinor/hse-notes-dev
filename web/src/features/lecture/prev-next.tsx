import { Link } from "react-router";

import type { LectureEntry } from "#web/domain/schemas.ts";

import { shortDate } from "#web/domain/dates.ts";
import { paths } from "#web/domain/paths.ts";

type Props = {
  readonly course: string;
  readonly next: LectureEntry | undefined;
  readonly prev: LectureEntry | undefined;
};

const CARD = "block rounded-lg border border-rule bg-card px-4.5 py-4 text-ink no-underline";

export const PrevNext = ({ course, next, prev }: Props) => (
  <nav
    aria-label="Соседние лекции"
    className="mt-14 mb-20 grid gap-4 border-t border-rule pt-7 font-sans sm:grid-cols-2"
  >
    {prev === undefined ? (
      <span />
    ) : (
      <Link className={CARD} to={paths.lecture(course, prev.weekId)}>
        <small className="mb-1 block text-[12.5px] text-muted">
          ← Лекция {prev.lecture} · {shortDate(prev.date)}
        </small>
        <span className="text-[15.5px] leading-snug font-semibold">{prev.title}</span>
      </Link>
    )}
    {next !== undefined && (
      <Link className={`${CARD} sm:text-right`} to={paths.lecture(course, next.weekId)}>
        <small className="mb-1 block text-[12.5px] text-muted">
          Лекция {next.lecture} · {shortDate(next.date)} →
        </small>
        <span className="text-[15.5px] leading-snug font-semibold">{next.title}</span>
      </Link>
    )}
  </nav>
);
