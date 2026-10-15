import { describe, expect, it } from "vitest";

import { CatalogSchema, DocMetaSchema, GlossarySchema } from "./schemas.ts";

describe("build data schemas", () => {
  it("turns snake_case lecture entries into camelCase", () => {
    const catalog = CatalogSchema.parse({
      lectures: {
        algebra: [
          {
            basis: "lecture",
            date: "2026-09-03",
            lecture: 1,
            title: "Т",
            week_id: "01_x",
            file: "n.md",
          },
        ],
      },
    });
    expect(catalog.lectures["algebra"]?.[0]?.weekId).toBe("01_x");
  });

  it("rejects an unknown basis", () => {
    expect(
      CatalogSchema.safeParse({
        lectures: { a: [{ basis: "?", date: "", lecture: 1, title: "", week_id: "" }] },
      }).success,
    ).toBe(false);
  });

  it("reads document meta and ignores the rest", () => {
    const meta = DocMetaSchema.parse({
      based_on: "лекция 23.09 (запись)",
      basis: "lecture",
      date_ru: "23 сентября 2026",
      figures: {},
      kind: "notes",
      lecture: 4,
      title: "Т",
      toc: [{ id: "a", level: 1, text: "Контекст" }],
    });
    expect(meta.dateRu).toBe("23 сентября 2026");
    expect(meta.basedOn).toBe("лекция 23.09 (запись)");
  });

  it("reads glossary entries", () => {
    const [entry] = GlossarySchema.parse([
      { def_html: "d", lecture: 2, term: "t", term_html: "T", week_id: "02" },
    ]);
    expect(entry).toEqual({ defHtml: "d", lecture: 2, term: "t", termHtml: "T", weekId: "02" });
  });
});
