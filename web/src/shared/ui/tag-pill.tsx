import { REMARK_TAGS, type RemarkTag, type TagTone } from "#web/domain/remarks.ts";

const TONES: Readonly<Record<TagTone, string>> = {
  blue: "bg-def-chip text-def-deep",
  neutral: "bg-wash text-muted",
  orange: "bg-org-soft text-org-deep",
  red: "bg-red-soft text-red-deep",
};

export const TAG_DOT: Readonly<Record<TagTone, string>> = {
  blue: "bg-def",
  neutral: "bg-muted",
  orange: "bg-org",
  red: "bg-red",
};

export const TagPill = ({ tag }: { readonly tag: RemarkTag }) => {
  const { label, tone } = REMARK_TAGS[tag];
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 font-sans text-xs font-semibold ${TONES[tone]}`}
      data-testid="tag-pill"
    >
      {label}
    </span>
  );
};
