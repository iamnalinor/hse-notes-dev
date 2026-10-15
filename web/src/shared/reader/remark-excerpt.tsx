import { useQuery } from "@tanstack/react-query";

import type { Label } from "#web/domain/schemas.ts";

import { fragmentQuery } from "#web/api/queries.ts";

import { extractPreview } from "./extract-preview.ts";
import { FragmentView } from "./fragment-view.tsx";

type Props = { readonly course: string; readonly label: Label };

/** The body of one remark, pulled out of its lecture's fragment (fetched on demand). */
export const RemarkExcerpt = ({ course, label }: Props) => {
  const { data } = useQuery({
    ...fragmentQuery(course, label.weekId),
    select: (fragment) => extractPreview(fragment, label.id),
  });
  return data === undefined ? (
    <p className="text-sm text-muted">Загрузка…</p>
  ) : (
    <FragmentView course={course} docId={label.weekId} html={data} lecture={label.lecture} nested />
  );
};
