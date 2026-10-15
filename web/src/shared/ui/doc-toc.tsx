import { Link } from "react-router";

import type { TocItem } from "#web/domain/schemas.ts";

import { useActiveSection } from "./use-active-section.ts";
import { useReadingProgress } from "./use-reading-progress.ts";

type Props = {
  /** Small caption above the list: «Лекция 4», «Реестр». */
  readonly caption: string;
  /** Rough reading time of the whole lecture. */
  readonly minutes: number;
  readonly toc: readonly TocItem[];
};

const MAX_LEVEL = 2;

export const DocToc = ({ caption, minutes, toc }: Props) => {
  const items = toc.filter((item) => item.level <= MAX_LEVEL);
  const active = useActiveSection(items.map((item) => item.id));
  const progress = useReadingProgress();
  const percent = Math.round(progress * 100);

  return (
    <nav aria-label="Оглавление" className="font-sans">
      <div className="mb-3 text-[11.5px] font-semibold tracking-[0.12em] text-muted uppercase">
        {caption}
      </div>
      <ol className="m-0 list-none p-0 text-sm/snug">
        {items.map((item) => (
          <li key={item.id}>
            <Link
              aria-current={item.id === active ? "location" : undefined}
              className={`block border-l-2 border-rule py-1.5 text-muted no-underline aria-[current=location]:border-def aria-[current=location]:font-semibold aria-[current=location]:text-ink ${item.level === 1 ? "pl-3" : "pl-6 text-[13px]"}`}
              to={{ hash: `#${item.id}` }}
            >
              {item.text}
            </Link>
          </li>
        ))}
      </ol>
      <div className="my-4.5 h-px bg-rule" />
      <div className="text-[12.5px] text-muted">
        Прочитано {percent}% · ~{Math.max(1, Math.ceil(minutes * (1 - progress)))} мин осталось
        <div className="mt-2 h-0.75 overflow-hidden rounded-xs bg-rule">
          <div className="h-full bg-def" style={{ width: `${String(percent)}%` }} />
        </div>
      </div>
    </nav>
  );
};
