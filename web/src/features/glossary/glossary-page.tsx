import { useState } from "react";
import { Link, useParams } from "react-router";

import { useGlossary } from "#web/api/queries.ts";
import { useCourse } from "#web/api/use-course.ts";
import { groupGlossary, isGlossaryMatch } from "#web/domain/glossary.ts";
import { paths } from "#web/domain/paths.ts";
import { FragmentView } from "#web/shared/reader/fragment-view.tsx";
import { DocPage } from "#web/shared/ui/doc-page.tsx";
import { useDocumentTitle } from "#web/shared/ui/document-title.ts";

export const Component = () => {
  const { info, lectures } = useCourse(useParams()["course"]);
  const entries = useGlossary(info.id);
  const [query, setQuery] = useState("");
  useDocumentTitle(`${info.name}: глоссарий`);

  const groups = groupGlossary(entries.filter((entry) => isGlossaryMatch(entry, query)));
  const weekIds = new Map(lectures.map((lecture) => [lecture.lecture, lecture.weekId]));

  return (
    <DocPage
      course={info.id}
      courseName={info.name}
      meta={{
        basedOn: `${String(entries.length)} терминов из конспектов лекций`,
        title: `Глоссарий: ${info.name.toLowerCase()}`,
        toc: [],
      }}
      pageName="Глоссарий"
    >
      <input
        aria-label="Найти термин"
        className="mt-6 w-full rounded-lg border border-rule bg-card px-3.5 py-2.5 font-sans text-[15px] text-ink placeholder:text-faint"
        onChange={(event) => {
          setQuery(event.target.value);
        }}
        placeholder="Найти термин…"
        type="search"
        value={query}
      />
      {groups.length === 0 && <p className="mt-8 font-sans text-muted">Ничего не нашлось.</p>}
      {groups.map((group) => (
        <section key={group.letter}>
          <h2 className="mt-9 mb-1 flex items-center gap-3.5 font-sans text-[13px] font-semibold tracking-[0.16em] text-muted uppercase after:h-px after:flex-1 after:bg-rule after:content-['']">
            {group.letter}
          </h2>
          {group.entries.map((entry) => (
            <div className="mt-3.5" key={`${entry.weekId}:${entry.term}`}>
              <div className="font-sans text-[15px] font-semibold [&_.prose-notes]:text-[15px]">
                <FragmentView
                  course={info.id}
                  docId={entry.weekId}
                  html={entry.termHtml}
                  lecture={entry.lecture}
                />
              </div>
              <FragmentView
                course={info.id}
                docId={entry.weekId}
                html={entry.defHtml}
                lecture={entry.lecture}
              />
              <Link
                className="font-sans text-[12.5px] text-muted"
                to={paths.lecture(info.id, weekIds.get(entry.lecture) ?? entry.weekId)}
              >
                Лекция {entry.lecture}
              </Link>
            </div>
          ))}
        </section>
      ))}
    </DocPage>
  );
};
