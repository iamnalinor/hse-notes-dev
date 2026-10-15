/** Markup removed, for plain-text search. */
export const stripTags = (html: string): string =>
  html
    .split("<")
    .map((part, index) => (index === 0 ? part : part.slice(part.indexOf(">") + 1)))
    .join(" ");
