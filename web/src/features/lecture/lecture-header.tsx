import { Link } from "react-router";

import type { DocMeta } from "#web/domain/schemas.ts";

import { paths } from "#web/domain/paths.ts";
import { PdfLink } from "#web/shared/ui/pdf-link.tsx";

type Props = {
  readonly blocks: number;
  readonly course: string;
  readonly courseName: string;
  readonly meta: DocMeta;
  readonly weekId: string;
};

export const LectureHeader = ({ blocks, course, courseName, meta, weekId }: Props) => (
  <header className="font-sans">
    <nav
      aria-label="Навигация"
      className="flex items-center gap-2 pt-8 text-[13.5px] text-muted lg:pt-12"
    >
      <Link className="text-muted no-underline" to={paths.course(course)}>
        {courseName}
      </Link>
      <span>/</span>
      <span className="text-ink">Лекция {meta.lecture}</span>
    </nav>
    <div className="mt-5.5 text-[13px] font-semibold tracking-[0.14em] text-def uppercase">
      Лекция {meta.lecture} · {meta.dateRu}
    </div>
    <h1 className="mt-3.5 mb-4.5 text-[32px] leading-[1.12] font-bold tracking-tight sm:text-[40px]">
      {meta.title}
    </h1>
    <div className="flex flex-wrap items-center gap-x-5.5 gap-y-2.5 border-b border-rule pb-6.5 text-sm text-muted">
      {meta.basis === "lecture" ? (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-ex-soft px-2.5 py-1 text-[12.5px] font-semibold text-ex-deep">
          <i className="block size-1.75 rounded-full bg-ex" />
          По лекции
        </span>
      ) : (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-org/50 bg-org-soft px-2.5 py-1 text-[12.5px] font-semibold text-org-deep">
          <i className="block size-1.75 rounded-full bg-org" />
          Черновик по программе
        </span>
      )}
      <span>Основано на: {meta.basedOn}</span>
      <span>{blocks} блоков</span>
      <span className="sm:ml-auto">
        <PdfLink course={course} docId={weekId} variant="button" />
      </span>
    </div>
  </header>
);
