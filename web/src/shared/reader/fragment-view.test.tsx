import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { renderWithApp } from "#web/test/render.tsx";

import { FragmentView } from "./fragment-view.tsx";

const view = (html: string, extra: Partial<Parameters<typeof FragmentView>[0]> = {}) =>
  renderWithApp(<FragmentView course="algebra" docId="04_x" html={html} lecture={4} {...extra} />);

const THEOREM = `
<div id="thm:lec04:laplace" class="nb nb-theorem nb-style-theorem" data-type="theorem" data-number="4.3">
  <div class="nb-head"><span class="nb-name">Теорема 4.3 (разложение Лапласа)</span></div>
  <div class="nb-body"><p>Определитель равен сумме.</p></div>
</div>`;

describe("FragmentView blocks", () => {
  it("draws the label and the title of a theorem", () => {
    view(THEOREM);
    expect(screen.getByText("Теорема 4.3")).toBeInTheDocument();
    expect(screen.getByText("разложение Лапласа")).toBeInTheDocument();
    expect(screen.getByText("Определитель равен сумме.")).toBeInTheDocument();
    expect(document.querySelector(String.raw`#thm\:lec04\:laplace`)).not.toBeNull();
  });

  it("shows a remark tag as a pill instead of a title", () => {
    view(`<div class="nb nb-remark nb-style-remark" data-type="remark" data-tag="pitfall" data-number="4.2">
      <div class="nb-head"><span class="nb-name">Замечание 4.2 (подводный камень)</span></div>
      <div class="nb-body"><p>Осторожно.</p></div></div>`);
    expect(screen.getAllByText("подводный камень")).toHaveLength(1);
    expect(screen.getByTestId("tag-pill")).toHaveTextContent("подводный камень");
  });

  it("hides remarks the reader filtered out", () => {
    const html = `<div class="nb nb-remark" data-type="remark" data-tag="pitfall" data-number="1.1">
      <div class="nb-head"><span class="nb-name">Замечание 1.1 (подводный камень)</span></div>
      <div class="nb-body"><p>Первое.</p></div></div>
      <div class="nb nb-remark" data-type="remark" data-tag="reminder" data-number="1.2">
      <div class="nb-head"><span class="nb-name">Замечание 1.2 (напоминание)</span></div>
      <div class="nb-body"><p>Второе.</p></div></div>`;
    view(html, { remarkFilter: new Set(["reminder"]) });
    expect(screen.queryByText("Первое.")).not.toBeInTheDocument();
    expect(screen.getByText("Второе.")).toBeInTheDocument();
  });
});

describe("FragmentView references and math", () => {
  it("links a reference to the lecture of its target", () => {
    view(
      '<p>см. <a href="../x/#y" class="ref" data-ref="def:lec02:transpose">2.9 (лекция 2)</a></p>',
    );
    expect(screen.getByRole("link", { name: "2.9 (лекция 2)" })).toHaveAttribute(
      "href",
      "/algebra/02_sep09_gauss_method#def:lec02:transpose",
    );
  });

  it("renders TeX with KaTeX using the course macros", () => {
    view(String.raw`<p><span class="math inline">x \in \R</span></p>`);
    expect(document.querySelector(".katex")).not.toBeNull();
    expect(document.querySelector(".katex-error")).toBeNull();
  });
});

describe("FragmentView proofs and problems", () => {
  it("collapses long proofs and keeps short ones open", () => {
    const long = `<div class="nb-proof"><p>${"слово ".repeat(200)}</p></div>`;
    view(`${long}<div class="nb-proof"><p>Коротко.</p></div>`);
    const [first, second] = [...document.querySelectorAll("details")];
    expect(first?.open).toBe(false);
    expect(second?.open).toBe(true);
  });

  it("keeps the solution behind a button while the answer is open", async () => {
    view(`<div class="nb nb-problem" data-type="problem" data-number="4.26">
      <div class="nb-head"><span class="nb-name">Задача 4.26</span></div>
      <div class="nb-body"><p>Вычислите.</p></div></div>
      <div class="nb-answer"><p>Ответ: 10.</p></div>
      <div class="nb-solution"><p>Решение: долго.</p></div>`);
    expect(screen.getByText("Ответ: 10.")).toBeVisible();
    expect(screen.getByText("Решение: долго.")).not.toBeVisible();

    await userEvent.click(screen.getByRole("button", { name: /Показать решение/ }));
    expect(screen.getByText("Решение: долго.")).toBeVisible();
  });
});
