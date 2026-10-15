import type { CSSProperties } from "react";

import { useQuery } from "@tanstack/react-query";
import { createPortal } from "react-dom";

import type { Label } from "#web/domain/schemas.ts";

import { fragmentQuery } from "#web/api/queries.ts";
import { blockStyle } from "#web/domain/blocks.ts";

import { extractPreview } from "./extract-preview.ts";
import { useReaderContext } from "./reader-context.ts";

const HEADER_TONE = {
  definition: "bg-def-soft text-def",
  example: "bg-ex-soft text-ex",
  problem: "bg-prob-soft text-prob",
  remark: "bg-wash text-muted",
  theorem: "bg-thm-soft text-thm",
} as const;

type Props = {
  readonly cardProps: object;
  readonly onGo: () => void;
  readonly refCallback: (element: HTMLElement | null) => void;
  readonly style: CSSProperties;
  readonly target: Label;
};

export const RefPreviewCard = ({ cardProps, onGo, refCallback, style, target }: Props) => {
  const { course, renderPreview } = useReaderContext();
  const { data: html } = useQuery({
    ...fragmentQuery(course, target.weekId),
    select: (fragment) => extractPreview(fragment, target.id),
  });
  const style0 = blockStyle(target.type);
  const tone = style0 === undefined ? "bg-wash text-ink" : HEADER_TONE[style0];
  const heading = [target.name, target.number].filter((part) => part !== "").join(" ");

  return createPortal(
    <div
      className="z-50 w-[min(430px,calc(100vw-24px))] cursor-pointer overflow-hidden rounded-lg border border-rule bg-card shadow-[0_18px_40px_-12px_rgba(40,30,10,0.28)]"
      onClick={onGo}
      onKeyDown={undefined}
      ref={refCallback}
      role="tooltip"
      style={style}
      {...cardProps}
    >
      <div className={`flex gap-2 border-b border-rule px-4 py-2.5 font-sans text-sm ${tone}`}>
        <b>{heading}</b>
        {target.title !== "" && <span className="text-ink">{target.title}</span>}
      </div>
      <div className="prose-notes max-h-60 overflow-hidden px-4 pt-3 pb-1 text-[17px] leading-normal">
        {html === undefined ? (
          <p className="text-muted">Загрузка…</p>
        ) : (
          renderPreview(html, target.weekId)
        )}
      </div>
      <div className="flex justify-between border-t border-rule px-4 py-2 font-sans text-xs text-muted">
        <span>Лекция {target.lecture}</span>
        <span className="font-semibold text-def">Перейти →</span>
      </div>
    </div>,
    document.body,
  );
};
