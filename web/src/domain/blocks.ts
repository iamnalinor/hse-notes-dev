export type BlockStyle = "definition" | "example" | "problem" | "remark" | "theorem";

const STYLES: Readonly<Record<string, BlockStyle>> = {
  axiom: "definition",
  corollary: "theorem",
  definition: "definition",
  example: "example",
  lemma: "theorem",
  problem: "problem",
  proposition: "theorem",
  remark: "remark",
  theorem: "theorem",
};

export const blockStyle = (type: string | undefined): BlockStyle | undefined =>
  type === undefined ? undefined : STYLES[type];
