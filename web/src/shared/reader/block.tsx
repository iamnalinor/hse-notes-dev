import type { ReactNode } from "react";

import { useLocation, useNavigate } from "react-router";

import type { BlockStyle } from "#web/domain/blocks.ts";
import type { RemarkTag } from "#web/domain/remarks.ts";

import { BackStateSchema } from "#web/domain/navigation.ts";
import { TagPill } from "#web/shared/ui/tag-pill.tsx";

import { useRemarkFilter } from "./reader-context.ts";

const THEME: Readonly<Record<BlockStyle, string>> = {
  definition: "[--c:var(--def)] [--t:var(--def-soft)]",
  example: "[--c:var(--ex)]",
  problem: "[--c:var(--prob)] [--t:var(--prob-soft)]",
  remark: "[--c:var(--rem)]",
  theorem: "[--c:var(--thm)] [--t:var(--thm-soft)]",
};

const BOXED = new Set<BlockStyle>(["definition", "problem", "theorem"]);

export type BlockHeading = {
  readonly label: string;
  /** Rendered parenthesised title. */
  readonly title: ReactNode;
};

type Props = {
  readonly children: ReactNode;
  readonly footer?: ReactNode;
  readonly id: string | undefined;
  readonly kind: BlockStyle;
  readonly name: BlockHeading;
  readonly number: string | undefined;
  readonly tag: RemarkTag | undefined;
};

const BackChip = ({ id }: { readonly id: string }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = BackStateSchema.safeParse(location.state);
  if (decodeURIComponent(location.hash) !== `#${id}` || !state.success) {
    return null;
  }
  return (
    <button
      className="absolute -top-4 right-3.5 z-10 flex cursor-pointer items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 font-sans text-xs text-paper"
      onClick={() => {
        void navigate(-1);
      }}
      type="button"
    >
      ↩ {state.data.backLabel}
    </button>
  );
};

const Header = ({ id, name, number, tag }: Pick<Props, "id" | "name" | "number" | "tag">) => (
  <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1 font-sans text-sm text-(--c)">
    <b className="font-bold">{name.label}</b>
    {name.title !== null && <span className="font-normal text-ink">{name.title}</span>}
    {tag !== undefined && <TagPill tag={tag} />}
    {id !== undefined && number !== undefined && (
      <a className="ml-auto text-xs text-(--c) no-underline opacity-70" href={`#${id}`}>
        #{number}
      </a>
    )}
  </div>
);

export const Block = ({ children, footer, id, kind, name, number, tag }: Props) => {
  const filter = useRemarkFilter();
  const header = <Header id={id} name={name} number={number} tag={tag} />;
  const theme = `relative my-7 scroll-mt-6 ${THEME[kind]}`;
  if (kind === "remark" && filter !== undefined && (tag === undefined || !filter.has(tag))) {
    return null;
  }
  const chip = id === undefined ? null : <BackChip id={id} />;

  if (BOXED.has(kind)) {
    return (
      <div className={`${theme} rounded-sm border-[1.25px] border-(--c) bg-(--t)`} id={id}>
        {chip}
        <div className="border-b border-[color-mix(in_srgb,var(--c)_22%,transparent)] px-4.5 pt-2.5 pb-2">
          {header}
        </div>
        <div className="px-4.5 pt-3.5 pb-1.5">{children}</div>
        {footer}
      </div>
    );
  }

  return (
    <div className={`${theme} border-l-[3px] border-(--c) py-0.5 pl-5`} id={id}>
      {chip}
      <div className="mb-1.5">{header}</div>
      {children}
    </div>
  );
};
