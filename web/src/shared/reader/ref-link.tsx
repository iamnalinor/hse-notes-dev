import type { MouseEvent, ReactNode } from "react";

import { useHref, useNavigate } from "react-router";

import { useLabelIndex } from "#web/api/queries.ts";
import { backLabel } from "#web/domain/navigation.ts";
import { paths } from "#web/domain/paths.ts";

import { useReaderContext } from "./reader-context.ts";
import { RefPreviewCard } from "./ref-preview-card.tsx";
import { useRefPreview } from "./use-ref-preview.ts";

type Props = { readonly children: ReactNode; readonly refId: string };

const sectionOf = (element: Element | null): string | undefined => {
  const section = element?.closest("[data-section-number]");
  return section instanceof HTMLElement ? section.dataset["sectionNumber"] : undefined;
};

const isPlainClick = (event: MouseEvent): boolean =>
  event.button === 0 && !(event.metaKey || event.ctrlKey || event.shiftKey || event.altKey);

/** A cross-reference by number: a link to the anchor, with a hover card showing the statement. */
export const RefLink = ({ children, refId }: Props) => {
  const { course, lecture, nested } = useReaderContext();
  const target = useLabelIndex()[course]?.[refId];
  const { anchor, anchorProps, cardProps, floatingStyles, isOpen, setAnchor, setCard } =
    useRefPreview();
  const navigate = useNavigate();
  const to = paths.lecture(course, target?.weekId ?? "", refId);
  const href = useHref(to);

  if (target === undefined) {
    return <span className="ref">{children}</span>;
  }

  const go = (from: Element | null) => {
    const fromLecture = lecture === target.lecture ? undefined : lecture;
    void navigate(to, { state: { backLabel: backLabel(sectionOf(from), fromLecture) } });
  };

  return (
    <>
      <a
        className="ref"
        href={href}
        {...(nested ? {} : anchorProps)}
        onClick={(event) => {
          if (!nested) {
            anchorProps.onClick(event);
          }
          if (event.defaultPrevented || !isPlainClick(event)) {
            return;
          }

          event.preventDefault();
          go(event.currentTarget);
        }}
        ref={setAnchor}
      >
        {children}
      </a>
      {isOpen && !nested && (
        <RefPreviewCard
          cardProps={cardProps}
          onGo={() => {
            go(anchor);
          }}
          refCallback={setCard}
          style={floatingStyles}
          target={target}
        />
      )}
    </>
  );
};
