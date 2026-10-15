export type RemarkTag = "convention" | "corner-case" | "misconception" | "pitfall" | "reminder";

export type TagTone = "blue" | "neutral" | "orange" | "red";

type TagInfo = { readonly label: string; readonly tone: TagTone };

export const REMARK_TAGS: Readonly<Record<RemarkTag, TagInfo>> = {
  pitfall: { label: "подводный камень", tone: "red" },
  misconception: { label: "частое заблуждение", tone: "red" },
  "corner-case": { label: "корнер-кейс", tone: "orange" },
  convention: { label: "соглашение курса", tone: "blue" },
  reminder: { label: "напоминание", tone: "neutral" },
};

export const REMARK_TAG_ORDER: readonly RemarkTag[] = [
  "pitfall",
  "misconception",
  "corner-case",
  "convention",
  "reminder",
];

export const isRemarkTag = (value: string | undefined): value is RemarkTag =>
  value !== undefined && Object.hasOwn(REMARK_TAGS, value);

/** `index.json` stores the Russian label, the HTML fragments store the English key. */
export const tagFromLabel = (label: string | undefined): RemarkTag | undefined =>
  REMARK_TAG_ORDER.find((tag) => REMARK_TAGS[tag].label === label);

/** Plural form for the course page: «Все 13 частых заблуждений». */
export const REMARK_TAG_PLURAL: Readonly<Record<RemarkTag, string>> = {
  pitfall: "подводных камней",
  misconception: "частых заблуждений",
  "corner-case": "корнер-кейсов",
  convention: "соглашений курса",
  reminder: "напоминаний",
};
