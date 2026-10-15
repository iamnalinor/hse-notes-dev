import { findById } from "#web/shared/ui/dom.ts";

const MAX_BLOCKS = 3;

/** The statement of a block (or caption / formula) as HTML for a hover card. */
export const extractPreview = (fragment: string, id: string): string | undefined => {
  const element = findById(new DOMParser().parseFromString(fragment, "text/html"), id);
  if (element === null) {
    return undefined;
  }
  const body = element.querySelector(".nb-body") ?? element.querySelector("figcaption") ?? element;
  const blocks = [...body.children].filter((child) => !/^H[1-6]$/.test(child.tagName));
  return blocks
    .slice(0, MAX_BLOCKS)
    .map((child) => child.outerHTML)
    .join("");
};
