import { Element, Text } from "html-react-parser";

export const hasClass = (node: Element, name: string): boolean =>
  (node.attribs["class"] ?? "").split(/\s+/).includes(name);

export const textOf = (node: unknown): string => {
  if (node instanceof Text) {
    return node.data;
  }
  return node instanceof Element ? node.children.map((child) => textOf(child)).join("") : "";
};

export const childWithClass = (node: Element, name: string): Element | undefined =>
  node.children.find(
    (child): child is Element => child instanceof Element && hasClass(child, name),
  );

/** The neighbouring element, skipping whitespace between tags. */
export const adjacentElement = (node: Element, direction: "next" | "prev"): Element | undefined => {
  let current = node[direction];
  while (current instanceof Text && current.data.trim() === "") {
    current = current[direction];
  }
  return current instanceof Element ? current : undefined;
};
