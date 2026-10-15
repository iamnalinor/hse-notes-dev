import type { ReactNode } from "react";

import { Link } from "react-router";

import type { DocMeta } from "#web/domain/schemas.ts";

import { paths } from "#web/domain/paths.ts";

import { DocToc } from "./doc-toc.tsx";
import { PdfLink } from "./pdf-link.tsx";

type Props = {
  readonly children: ReactNode;
  readonly course: string;
  readonly courseName: string;
  readonly meta: Pick<DocMeta, "basedOn" | "title" | "toc">;
  /** Last crumb: «Реестр теории». */
  readonly pageName: string;
  /** Document id of the PDF; omit when the page has none (glossary). */
  readonly pdfDoc?: string;
  readonly toc?: { readonly caption: string; readonly minutes: number };
};

/** Frame of a course-wide document page: crumbs, title, optional TOC and PDF button. */
export const DocPage = ({ children, course, courseName, meta, pageName, pdfDoc, toc }: Props) => (
  <div className="mx-auto grid max-w-[1360px] justify-center gap-14 px-4 min-[1100px]:grid-cols-[220px_minmax(0,700px)] sm:px-8">
    <div className="sticky top-6 hidden self-start pt-14 min-[1100px]:block">
      {toc !== undefined && <DocToc caption={toc.caption} minutes={toc.minutes} toc={meta.toc} />}
    </div>
    <main className="min-w-0 pb-20">
      <header className="font-sans">
        <nav
          aria-label="Навигация"
          className="flex items-center gap-2 pt-8 text-[13.5px] text-muted lg:pt-12"
        >
          <Link className="text-muted no-underline" to={paths.course(course)}>
            {courseName}
          </Link>
          <span>/</span>
          <span className="text-ink">{pageName}</span>
        </nav>
        <h1 className="mt-5.5 mb-4.5 text-[32px] leading-[1.12] font-bold tracking-tight sm:text-[40px]">
          {meta.title}
        </h1>
        <div className="flex flex-wrap items-center gap-x-5.5 gap-y-2.5 border-b border-rule pb-6 text-sm text-muted">
          <span>{meta.basedOn}</span>
          {pdfDoc !== undefined && (
            <span className="sm:ml-auto">
              <PdfLink course={course} docId={pdfDoc} variant="button" />
            </span>
          )}
        </div>
      </header>
      {children}
    </main>
  </div>
);
