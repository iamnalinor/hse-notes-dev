import { useParams } from "react-router";

import { useDocMeta, useFragment } from "#web/api/queries.ts";
import { useCourse } from "#web/api/use-course.ts";
import { stripTags } from "#web/domain/text.ts";
import { FragmentView } from "#web/shared/reader/fragment-view.tsx";
import { useScrollToHash } from "#web/shared/reader/use-scroll-to-hash.ts";
import { DocPage } from "#web/shared/ui/doc-page.tsx";
import { useDocumentTitle } from "#web/shared/ui/document-title.ts";

const CHARS_PER_MINUTE = 900;

export const Component = () => {
  const { info } = useCourse(useParams()["course"]);
  const meta = useDocMeta(info.id, "registry");
  const html = useFragment(info.id, "registry");
  useDocumentTitle(`${info.name}: реестр теории`);
  useScrollToHash();

  return (
    <DocPage
      course={info.id}
      courseName={info.name}
      meta={meta}
      pageName="Реестр теории"
      pdfDoc="registry"
      toc={{
        caption: "Реестр",
        minutes: Math.ceil(stripTags(html).length / CHARS_PER_MINUTE),
      }}
    >
      <FragmentView
        course={info.id}
        docId="registry"
        html={html}
        lecture={undefined}
        variant="registry"
      />
    </DocPage>
  );
};
