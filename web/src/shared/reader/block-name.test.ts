import { Text } from "html-react-parser";
import { describe, expect, it } from "vitest";

import { splitBlockName } from "./block-name.ts";

describe("splitBlockName", () => {
  it("splits the label from the parenthesised title", () => {
    const name = splitBlockName([new Text("Теорема 4.3 (разложение\nЛапласа)")]);
    expect(name.label).toBe("Теорема 4.3");
    expect(name.titleText).toBe("разложение Лапласа");
  });

  it("keeps a bare label", () => {
    const name = splitBlockName([new Text("Пример 4.1")]);
    expect(name).toEqual({ label: "Пример 4.1", title: [], titleText: "" });
  });
});
