import { REMARK_TAG_ORDER, REMARK_TAGS, type RemarkTag } from "#web/domain/remarks.ts";
import { TAG_DOT } from "#web/shared/ui/tag-pill.tsx";

type Props = {
  readonly counts: Readonly<Record<RemarkTag, number>>;
  readonly onToggle: (tag: RemarkTag) => void;
  readonly selected: ReadonlySet<RemarkTag>;
};

const LEGEND = [
  ["border-def bg-def-soft", "Определение, аксиома"],
  ["border-thm bg-thm-soft", "Теорема, лемма, утв."],
  ["border-ex border-0 border-l-[3px]", "Пример"],
  ["border-prob", "Задача"],
] as const;

export const RemarkFilter = ({ counts, onToggle, selected }: Props) => (
  <div className="rounded-lg border border-rule bg-card p-4 font-sans">
    <h4 className="mb-1 text-sm font-bold">Замечания на странице</h4>
    <div className="mb-3 text-[12.5px] text-muted">Отметь, какие показывать</div>
    <div className="flex flex-col gap-1.5">
      {REMARK_TAG_ORDER.map((tag) => (
        <label
          className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-[13.5px] has-checked:bg-red-soft"
          key={tag}
        >
          <input
            checked={selected.has(tag)}
            className="m-0 size-4 accent-red"
            onChange={() => {
              onToggle(tag);
            }}
            type="checkbox"
          />
          <span className={`size-2.25 rounded-full ${TAG_DOT[REMARK_TAGS[tag].tone]}`} />
          {REMARK_TAGS[tag].label[0]?.toUpperCase()}
          {REMARK_TAGS[tag].label.slice(1)}
          <span className="ml-auto text-muted tabular-nums">{counts[tag]}</span>
        </label>
      ))}
    </div>
    <div className="mt-3.5 grid grid-cols-[auto_1fr] items-center gap-x-2.5 gap-y-1.5 text-[12.5px] text-muted">
      {LEGEND.map(([swatch, label]) => (
        <div className="contents" key={label}>
          <span className={`h-2.5 w-3.5 rounded-xs border-[1.25px] ${swatch}`} />
          {label}
        </div>
      ))}
    </div>
  </div>
);
