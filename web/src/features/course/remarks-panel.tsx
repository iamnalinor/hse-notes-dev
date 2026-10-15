import { useState } from "react";
import { Link } from "react-router";

import { useLabelIndex } from "#web/api/queries.ts";
import { paths } from "#web/domain/paths.ts";
import {
  REMARK_TAG_ORDER,
  REMARK_TAG_PLURAL,
  REMARK_TAGS,
  type RemarkTag,
  tagFromLabel,
} from "#web/domain/remarks.ts";
import { labelStats } from "#web/domain/stats.ts";
import { RemarkExcerpt } from "#web/shared/reader/remark-excerpt.tsx";

const SHOWN = 3;

export const RemarksPanel = ({ course }: { readonly course: string }) => {
  const labels = Object.values(useLabelIndex()[course] ?? {});
  const stats = labelStats(labels);
  const [tag, setTag] = useState<RemarkTag>("misconception");
  const found = labels.filter(
    (label) => label.type === "remark" && tagFromLabel(label.tag) === tag,
  );

  return (
    <div className="rounded-xl border border-rule bg-card p-4.5">
      <h3 className="mb-1 text-base font-bold">Замечания курса</h3>
      <p className="mb-3.5 text-[13px] text-muted">
        Собрать все замечания с пометкой со всех лекций
      </p>
      <div className="flex flex-wrap gap-2">
        {REMARK_TAG_ORDER.map((key) => (
          <button
            aria-pressed={key === tag}
            className="inline-flex min-h-5 cursor-pointer items-center gap-1.5 rounded-full border border-rule px-3 py-1.75 text-[13px] font-semibold text-ink aria-pressed:border-red/55 aria-pressed:bg-red-soft aria-pressed:text-red-deep"
            key={key}
            onClick={() => {
              setTag(key);
            }}
            type="button"
          >
            {REMARK_TAGS[key].label[0]?.toUpperCase()}
            {REMARK_TAGS[key].label.slice(1)}
            <em className="font-normal text-muted not-italic">{stats.remarks[key]}</em>
          </button>
        ))}
      </div>
      <div className="mt-4 flex flex-col gap-2.5">
        {found.slice(0, SHOWN).map((label) => (
          <div className="border-l-[3px] border-red py-1 pl-3" key={label.id}>
            <div className="flex gap-2 text-[12.5px] text-muted">
              <Link
                className="font-semibold text-red no-underline"
                to={paths.lecture(course, label.weekId, label.id)}
              >
                Замечание {label.number}
              </Link>
              <span>Лекция {label.lecture}</span>
            </div>
            <div className="text-[15px]">
              <RemarkExcerpt course={course} label={label} />
            </div>
          </div>
        ))}
      </div>
      <Link
        className="mt-3 inline-block text-[13px] font-semibold no-underline"
        to={paths.remarks(course, tag)}
      >
        Все {found.length} {REMARK_TAG_PLURAL[tag]} →
      </Link>
    </div>
  );
};
