import { type DOMNode, Text } from "html-react-parser";

export type BlockName = {
  /** «Теорема 4.3» */
  readonly label: string;
  /** The parenthesised title as DOM nodes (it may contain math). */
  readonly title: readonly DOMNode[];
  /** The title as plain text (math dropped), for comparisons. */
  readonly titleText: string;
};

const squash = (text: string): string => text.replaceAll(/\s+/g, " ");

const CLOSING = /\)\s*$/;

/**
pandoc writes the block header as one span: `Теорема 4.3 (название, возможно с <math>)`.
Splits it into the bold label and the title so they can be styled apart.
*/
export const splitBlockName = (nodes: readonly DOMNode[]): BlockName => {
  const [first, ...rest] = nodes;
  if (!(first instanceof Text)) {
    return { label: "", title: nodes, titleText: "" };
  }

  const text = squash(first.data);
  const open = text.indexOf("(");
  if (open === -1) {
    return { label: text.trim(), title: [], titleText: "" };
  }

  const parts: readonly DOMNode[] = [new Text(text.slice(open + 1)), ...rest];
  const title = parts
    .map((part, index) => {
      const plain = part instanceof Text ? squash(part.data) : undefined;
      if (plain === undefined) {
        return part;
      }
      return new Text(index === parts.length - 1 ? plain.replace(CLOSING, "") : plain);
    })
    .filter((part) => !(part instanceof Text && part.data === ""));

  return {
    label: text.slice(0, open).trim(),
    title,
    titleText: title
      .map((part) => (part instanceof Text ? part.data : ""))
      .join("")
      .trim(),
  };
};
