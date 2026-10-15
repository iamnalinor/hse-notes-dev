import { describe, expect, it } from "vitest";

import type { GlossaryEntry } from "./schemas.ts";

import { groupGlossary, isGlossaryMatch } from "./glossary.ts";

const entry = (term: string, defHtml = ""): GlossaryEntry => ({
  defHtml,
  lecture: 1,
  term,
  termHtml: term,
  weekId: "01",
});

describe("groupGlossary", () => {
  it("groups by first letter, alphabetically, symbols first", () => {
    const groups = groupGlossary([
      entry("Матрица"),
      entry(String.raw`\det A`),
      entry("Алгоритм"),
      entry("Минор"),
    ]);
    expect(groups.map((group) => group.letter)).toEqual(["Обозначения", "А", "М"]);
    expect(groups[2]?.entries.map((item) => item.term)).toEqual(["Матрица", "Минор"]);
  });
});

describe("isGlossaryMatch", () => {
  it("matches the term or the text of the definition, ignoring markup", () => {
    const item = entry("Ранг", '<span class="math">rk</span> — число строк');
    expect(isGlossaryMatch(item, "ранг")).toBe(true);
    expect(isGlossaryMatch(item, "число строк")).toBe(true);
    expect(isGlossaryMatch(item, "math")).toBe(false);
    expect(isGlossaryMatch(item, "  ")).toBe(true);
  });
});
