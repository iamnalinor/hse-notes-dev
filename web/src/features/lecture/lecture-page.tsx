import { useState } from "react";
import { useParams } from "react-router";

import type { RemarkTag } from "#web/domain/remarks.ts";

import { useDocMeta, useFragment, useLabelIndex } from "#web/api/queries.ts";
import { useCourse } from "#web/api/use-course.ts";
import { neighbours } from "#web/domain/lectures.ts";
import { sectionNumbers } from "#web/domain/sections.ts";
import { labelStats } from "#web/domain/stats.ts";
import { stripTags } from "#web/domain/text.ts";
import { FragmentView } from "#web/shared/reader/fragment-view.tsx";
import { useScrollToHash } from "#web/shared/reader/use-scroll-to-hash.ts";
import { DocToc } from "#web/shared/ui/doc-toc.tsx";
import { useDocumentTitle } from "#web/shared/ui/document-title.ts";
import { MenuIcon } from "#web/shared/ui/icons.tsx";

import { LectureHeader } from "./lecture-header.tsx";
import { PrevNext } from "./prev-next.tsx";
import { RemarkFilter } from "./remark-filter.tsx";

const CHARS_PER_MINUTE = 900;
const NOT_BLOCKS = new Set(["equation", "figure", "section"]);

const toggled = (set: ReadonlySet<RemarkTag>, tag: RemarkTag): ReadonlySet<RemarkTag> =>
  new Set(set.has(tag) ? [...set].filter((item) => item !== tag) : [...set, tag]);

const DraftNotice = () => (
  <p className="mt-5 rounded-lg border border-dashed border-org/50 bg-org-soft px-4 py-3 font-sans text-sm text-org-deep">
    Это черновик, написанный по программе до лекции. После лекции его сверят с записью и обновят —
    номера могут сдвинуться.
  </p>
);

const useLecture = () => {
  const params = useParams();
  const { info, lectures } = useCourse(params["course"]);
  const entry = lectures.find((lecture) => lecture.weekId === params["weekId"]);
  if (entry === undefined) {
    // eslint-disable-next-line @typescript-eslint/only-throw-error -- React Router's contract for a 404
    throw new Response("Not Found", { status: 404 });
  }
  const meta = useDocMeta(info.id, entry.weekId);
  const html = useFragment(info.id, entry.weekId);
  const index = useLabelIndex();
  const labels = Object.values(index[info.id] ?? {}).filter(
    (label) => label.weekId === entry.weekId,
  );
  return { entry, html, info, labels, lectures, meta };
};

export const Component = () => {
  const { entry, html, info, labels, lectures, meta } = useLecture();
  const [selected, setSelected] = useState<ReadonlySet<RemarkTag>>(() => new Set<RemarkTag>());
  const { next, prev } = neighbours(lectures, entry.weekId);

  useDocumentTitle(`${info.name}, лекция ${String(meta.lecture)}: ${meta.title}`);
  useScrollToHash();

  const filter = (
    <RemarkFilter
      counts={labelStats(labels).remarks}
      onToggle={(tag) => {
        setSelected((current) => toggled(current, tag));
      }}
      selected={selected}
    />
  );
  const toc = (
    <DocToc
      caption={`Лекция ${String(meta.lecture)}`}
      minutes={Math.ceil(stripTags(html).length / CHARS_PER_MINUTE)}
      toc={meta.toc}
    />
  );

  return (
    <div className="mx-auto grid max-w-[1360px] justify-center gap-14 px-4 min-[1100px]:grid-cols-[220px_minmax(0,700px)_250px] sm:px-8">
      <div className="sticky top-6 hidden self-start pt-14 min-[1100px]:block">{toc}</div>
      <main className="min-w-0">
        <LectureHeader
          blocks={labels.filter((label) => !NOT_BLOCKS.has(label.type)).length}
          course={info.id}
          courseName={info.name}
          meta={meta}
          weekId={entry.weekId}
        />
        <details className="group mt-5 rounded-lg border border-rule bg-card font-sans min-[1100px]:hidden">
          <summary className="flex cursor-pointer list-none items-center gap-2.5 px-4 py-3 text-sm font-semibold [&::-webkit-details-marker]:hidden">
            <MenuIcon size={16} />
            Оглавление и замечания
          </summary>
          <div className="flex flex-col gap-5 border-t border-rule p-4">
            {toc}
            {filter}
          </div>
        </details>
        {meta.basis === "forecast" && <DraftNotice />}
        <FragmentView
          course={info.id}
          docId={entry.weekId}
          html={html}
          lecture={meta.lecture}
          remarkFilter={selected.size === 0 ? undefined : selected}
          sectionNumbers={sectionNumbers(meta.toc, meta.lecture)}
        />
        <PrevNext course={info.id} next={next} prev={prev} />
      </main>
      <aside className="sticky top-6 hidden self-start pt-37.5 min-[1100px]:block">{filter}</aside>
    </div>
  );
};
