import parse from "html-react-parser";
import { useMemo } from "react";

import type { RemarkTag } from "#web/domain/remarks.ts";

import { dataUrl } from "#web/api/data-client.ts";

import { ReaderContext, type ReaderContextValue } from "./reader-context.ts";
import { createReplacer, type TransformOptions } from "./transform.tsx";

type Props = {
  readonly course: string;
  /** Directory of the document inside the data root: `<course>/<week_id>` or `<course>/registry`. */
  readonly docId: string;
  readonly html: string;
  readonly lecture: number | undefined;
  readonly nested?: boolean;
  readonly remarkFilter?: ReadonlySet<RemarkTag> | undefined;
  readonly sectionNumbers?: ReadonlyMap<string, string>;
  readonly variant?: TransformOptions["variant"];
};

const NO_NUMBERS: ReadonlyMap<string, string> = new Map();

/** Turns a build fragment (pandoc HTML) into React: blocks, references, KaTeX, spoilers. */
export const FragmentView = ({
  course,
  docId,
  html,
  lecture,
  nested = false,
  remarkFilter,
  sectionNumbers = NO_NUMBERS,
  variant = "notes",
}: Props) => {
  const content = useMemo(
    () =>
      parse(html, {
        replace: createReplacer({
          assetBase: dataUrl(`${course}/${docId}/`),
          sectionNumbers,
          variant,
        }),
      }),
    [course, docId, html, sectionNumbers, variant],
  );

  const context = useMemo<ReaderContextValue>(
    () => ({
      course,
      lecture,
      nested,
      remarkFilter,
      renderPreview: (preview, previewDocId) => (
        <FragmentView
          course={course}
          docId={previewDocId}
          html={preview}
          lecture={lecture}
          nested
        />
      ),
    }),
    [course, lecture, nested, remarkFilter],
  );

  return (
    <ReaderContext value={context}>
      <div className="prose-notes">{content}</div>
    </ReaderContext>
  );
};
