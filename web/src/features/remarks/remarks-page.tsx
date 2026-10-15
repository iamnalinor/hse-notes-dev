import { Link, useParams, useSearchParams } from "react-router";

import { useLabelIndex } from "#web/api/queries.ts";
import { useCourse } from "#web/api/use-course.ts";
import { paths } from "#web/domain/paths.ts";
import { isRemarkTag, REMARK_TAG_ORDER, REMARK_TAGS, tagFromLabel } from "#web/domain/remarks.ts";
import { RemarkExcerpt } from "#web/shared/reader/remark-excerpt.tsx";
import { useDocumentTitle } from "#web/shared/ui/document-title.ts";

const DEFAULT_TAG = "misconception";

export const Component = () => {
  const { info, lectures } = useCourse(useParams()["course"]);
  const [search] = useSearchParams();
  const requested = search.get("tag") ?? undefined;
  const tag = isRemarkTag(requested) ? requested : DEFAULT_TAG;
  const labels = Object.values(useLabelIndex()[info.id] ?? {}).filter(
    (label) => label.type === "remark" && tagFromLabel(label.tag) === tag,
  );
  useDocumentTitle(`${info.name}: ${REMARK_TAGS[tag].label}`);

  return (
    <div className="mx-auto max-w-[800px] px-4 pb-20 sm:px-8">
      <nav
        aria-label="Навигация"
        className="flex items-center gap-2 pt-10 font-sans text-[13.5px] text-muted"
      >
        <Link className="text-muted no-underline" to={paths.course(info.id)}>
          {info.name}
        </Link>
        <span>/</span>
        <span className="text-ink">Замечания</span>
      </nav>
      <h1 className="my-5 font-sans text-[36px] leading-tight font-bold tracking-tight">
        Замечания курса
      </h1>
      <div className="mb-8 flex flex-wrap gap-2 font-sans">
        {REMARK_TAG_ORDER.map((key) => (
          <Link
            aria-current={key === tag ? "true" : undefined}
            className="rounded-full border border-rule px-3 py-1.75 text-[13px] font-semibold text-ink no-underline aria-current:border-red/55 aria-current:bg-red-soft aria-current:text-red-deep"
            key={key}
            to={paths.remarks(info.id, key)}
          >
            {REMARK_TAGS[key].label}
          </Link>
        ))}
      </div>
      {lectures.map((lecture) => {
        const inLecture = labels.filter((label) => label.weekId === lecture.weekId);
        return inLecture.length === 0 ? null : (
          <section className="mb-9" key={lecture.weekId}>
            <h2 className="mb-3 font-sans text-sm font-semibold text-muted">
              Лекция {lecture.lecture} · {lecture.title}
            </h2>
            {inLecture.map((label) => (
              <div className="mb-4 border-l-[3px] border-red py-1 pl-4" key={label.id}>
                <Link
                  className="font-sans text-[13px] font-semibold text-red no-underline"
                  to={paths.lecture(info.id, label.weekId, label.id)}
                >
                  Замечание {label.number}
                </Link>
                <RemarkExcerpt course={info.id} label={label} />
              </div>
            ))}
          </section>
        );
      })}
      {labels.length === 0 && (
        <p className="font-sans text-muted">В этом курсе таких замечаний нет.</p>
      )}
    </div>
  );
};
