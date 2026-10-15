import type { Label } from "./schemas.ts";

import { REMARK_TAG_ORDER, type RemarkTag, tagFromLabel } from "./remarks.ts";

export type LabelStats = {
  readonly definitions: number;
  readonly remarks: Readonly<Record<RemarkTag, number>>;
  /** Theorems, lemmas, propositions and corollaries. */
  readonly theorems: number;
};

const DEFINITION_TYPES = new Set(["axiom", "definition"]);
const THEOREM_TYPES = new Set(["corollary", "lemma", "proposition", "theorem"]);

export const labelStats = (labels: readonly Label[]): LabelStats => ({
  definitions: labels.filter((label) => DEFINITION_TYPES.has(label.type)).length,
  remarks: Object.fromEntries(
    REMARK_TAG_ORDER.map((tag) => [
      tag,
      labels.filter((label) => label.type === "remark" && tagFromLabel(label.tag) === tag).length,
    ]),
  ) as Record<RemarkTag, number>,
  theorems: labels.filter((label) => THEOREM_TYPES.has(label.type)).length,
});
