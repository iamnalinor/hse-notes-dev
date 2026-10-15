import { describe, expect, it } from "vitest";

import type { Label } from "./schemas.ts";

import { isRemarkTag, tagFromLabel } from "./remarks.ts";
import { sectionNumbers } from "./sections.ts";
import { labelStats } from "./stats.ts";

const label = (type: Label["type"], tag?: string): Label => ({
  id: `${type}:${tag ?? ""}`,
  lecture: 1,
  name: type,
  number: "1.1",
  title: "",
  type,
  weekId: "01",
  ...(tag !== undefined && { tag }),
});

describe("remark tags", () => {
  it("maps the Russian label of index.json to the key", () => {
    expect(tagFromLabel("частое заблуждение")).toBe("misconception");
    expect(tagFromLabel("что-то другое")).toBeUndefined();
  });

  it("recognises keys", () => {
    expect(isRemarkTag("pitfall")).toBe(true);
    expect(isRemarkTag("toString")).toBe(false);
    expect(isRemarkTag(undefined)).toBe(false);
  });
});

describe("labelStats", () => {
  it("counts definitions, theorems and remarks by tag", () => {
    const stats = labelStats([
      label("definition"),
      label("axiom"),
      label("lemma"),
      label("corollary"),
      label("theorem"),
      label("remark", "подводный камень"),
      label("remark", "подводный камень"),
      label("remark", "корнер-кейс"),
      label("remark"),
      label("example"),
    ]);
    expect(stats.definitions).toBe(2);
    expect(stats.theorems).toBe(3);
    expect(stats.remarks.pitfall).toBe(2);
    expect(stats.remarks["corner-case"]).toBe(1);
    expect(stats.remarks.misconception).toBe(0);
  });
});

describe("sectionNumbers", () => {
  it("numbers only level-2 sections, per lecture", () => {
    const numbers = sectionNumbers(
      [
        { id: "a", level: 1, text: "Теория" },
        { id: "b", level: 2, text: "Первый" },
        { id: "c", level: 2, text: "Второй" },
        { id: "d", level: 3, text: "Глубже" },
      ],
      4,
    );
    expect([...numbers]).toEqual([
      ["b", "4.1"],
      ["c", "4.2"],
    ]);
  });
});
