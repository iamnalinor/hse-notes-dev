"""Тесты фильтра, сборки и линтера на демо-конспектах tests/fixtures/demo."""

from __future__ import annotations

import json
import shutil
import subprocess
import sys
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parent.parent
DEMO = ROOT / "tests" / "fixtures" / "demo"
HAS_TEX = (
    shutil.which("xelatex") is not None
    or (Path.home() / ".TinyTeX" / "bin" / "x86_64-linux" / "xelatex").exists()
)


def run(script: str, *args: str) -> subprocess.CompletedProcess:
    return subprocess.run(
        [sys.executable, str(ROOT / "scripts" / script), *args],
        capture_output=True,
        text=True,
        cwd=ROOT,
    )


@pytest.fixture()
def demo(tmp_path: Path) -> Path:
    dst = tmp_path / "demo"
    shutil.copytree(DEMO, dst)
    return dst


def build(src: Path, *extra: str) -> subprocess.CompletedProcess:
    return run("build.py", "--src", str(src), "--out", str(src / "build"), *extra)


def lint(src: Path, *extra: str) -> subprocess.CompletedProcess:
    return run("lint.py", "--src", str(src), *extra)


# ----------------------------------------------------------------------------- нумерация и индекс


def test_index_single_counter(demo: Path):
    res = build(demo, "--no-pdf", "--no-html")
    assert res.returncode == 0, res.stderr
    idx = json.loads((demo / "build" / "index.json").read_text(encoding="utf-8"))
    labels = idx["labels"]["algebra"]
    # один сквозной счётчик на все типы блоков
    assert labels["def:lec01:matrix"]["number"] == "1.1"
    assert labels["ex:lec01:matrix"]["number"] == "1.2"
    assert labels["thm:lec01:assoc"]["number"] == "1.3"
    assert labels["rem:lec01:noncomm"]["number"] == "1.4"
    assert labels["prob:lec01:product"]["number"] == "1.5"
    # у рисунков и формул свои счётчики
    assert labels["eq:lec01:assoc"]["number"] == "1.1"
    assert labels["fig:lec01:mult"]["number"] == "1.1"
    assert labels["def:lec02:elem"]["number"] == "2.1"
    assert labels["def:lec02:elem"]["basis"] == "forecast"
    assert {g["term"] for g in idx["glossary"]["algebra"]} == {"Матрица", "Элементарное преобразование"}


@pytest.mark.skipif(not HAS_TEX, reason="нужен TeX для TikZ → SVG")
def test_html_blocks_and_refs(demo: Path):
    res = build(demo, "--no-pdf")
    assert res.returncode == 0, res.stderr
    site = demo / "build" / "site-data"
    frag = (site / "algebra" / "01_sep03_matrices" / "fragment.html").read_text(encoding="utf-8")
    assert 'id="thm:lec01:assoc"' in frag and 'data-number="1.3"' in frag
    assert 'data-tag="misconception"' in frag
    assert "Замечание 1.4" in frag
    assert 'href="#eq:lec01:assoc"' in frag and "(1.1)" in frag
    assert "\\tag{1.1}" in frag
    assert '<details class="nb-answers">' in frag
    meta = json.loads((site / "algebra" / "01_sep03_matrices" / "meta.json").read_text(encoding="utf-8"))
    assert meta["lecture"] == 1 and meta["basis"] == "lecture"
    assert meta["header_line"] == "ПИ ФКН ВШЭ 2026/27 · Алгебра · Лекция 1 · 3 сентября 2026"
    fig = meta["figures"][0]
    assert (site / "algebra" / "01_sep03_matrices" / "fig" / f"{fig['hash']}.svg").exists()
    # ссылка на другую лекцию: относительный путь + номер лекции
    frag2 = (site / "algebra" / "02_sep09_gauss" / "fragment.html").read_text(encoding="utf-8")
    assert 'href="../01_sep03_matrices/#thm:lec01:assoc"' in frag2
    assert "1.3 (лекция 1)" in frag2
    # реестр берёт номера из конспектов
    reg = (site / "algebra" / "registry" / "fragment.html").read_text(encoding="utf-8")
    assert 'data-number="1.3"' in reg and "черновик" in reg
    gl = json.loads((site / "algebra" / "glossary.json").read_text(encoding="utf-8"))
    assert [g["term"] for g in gl] == ["Матрица", "Элементарное преобразование"]


def test_latex_blocks(demo: Path, tmp_path: Path):
    res = build(demo, "--no-pdf", "--no-html")
    assert res.returncode == 0, res.stderr
    import pypandoc

    out = pypandoc.convert_file(
        str(demo / "notes" / "algebra" / "02_sep09_gauss.md"),
        "latex",
        format="markdown",
        extra_args=[
            "--lua-filter",
            str(ROOT / "filters" / "notes.lua"),
            "-M",
            "notes_mode=render",
            "-M",
            f"notes_index={demo / 'build' / 'index.json'}",
            "-M",
            "week_id=02_sep09_gauss",
            "-M",
            f"notes_config={ROOT / 'templates' / 'courses.json'}",
        ],
    )
    assert "\\begin{nbblock}{definition}{}{def:lec02:elem}" in out
    assert "\\nbhead{Определение~2.1}" in out
    assert "\\begin{nbblock}{remark}{corner-case}{}" in out
    assert "(корнер-кейс)" in out


# ----------------------------------------------------------------------------- ошибки сборки


def test_unresolved_ref_fails(demo: Path):
    p = demo / "notes" / "algebra" / "02_sep09_gauss.md"
    p.write_text(
        p.read_text(encoding="utf-8").replace("@def:lec01:matrix", "@def:lec01:nope"), encoding="utf-8"
    )
    res = build(demo, "--no-pdf")
    assert res.returncode != 0
    assert "неизвестная ссылка @def:lec01:nope" in res.stderr


def test_duplicate_label_fails(demo: Path):
    p = demo / "notes" / "algebra" / "02_sep09_gauss.md"
    p.write_text(
        p.read_text(encoding="utf-8").replace("#def:lec02:elem", "#def:lec01:matrix"), encoding="utf-8"
    )
    res = build(demo, "--no-pdf", "--no-html")
    assert res.returncode != 0
    assert "def:lec01:matrix" in res.stderr


@pytest.mark.skipif(not HAS_TEX, reason="нужен TeX")
def test_pdf_builds(demo: Path):
    res = build(demo, "--no-html", "--strict")
    assert res.returncode == 0, res.stderr + res.stdout
    for name in ("01_sep03_matrices", "02_sep09_gauss", "registry"):
        assert (demo / "build" / "pdf" / "algebra" / f"{name}.pdf").stat().st_size > 10_000


# ----------------------------------------------------------------------------- линтер


def test_lint_demo_clean(demo: Path):
    res = lint(demo, "--strict")
    assert res.returncode == 0, res.stdout


@pytest.mark.parametrize(
    "old,new,expected",
    [
        ('tag="частое заблуждение"', 'tag="ловушка"', "неизвестная пометка"),
        ("$A = (a_{ij})$", "$A = (a_{ij}) ∈ ℝ$", "не-ASCII символы в формуле"),
        ("$A = (a_{ij})$", "$A \\boxed{x}$", "boxed"),
        ("Первая лекция курса", "По рекомендации Р4 первая лекция курса", "служебное слово"),
        ("#def:lec01:matrix", "#def:lec02:matrix", "номер лекции lec02"),
        ("#ex:lec01:matrix", "#thm:lec01:matrixex", "префикс ex:"),
        ("::: answers\n1. Нет", "::: answer\n1. Нет", "нет блока ::: answers"),
        ("date: 2026-09-03", "date: 2026-09-04", "mmmDD в имени"),
        ("# Итоги", "# Выводы", "нет раздела «# Итоги»"),
        ("::: {.definition #def:lec01:matrix", "::: {.defenition #def:lec01:matrix", "неизвестный тип блока"),
    ],
)
def test_lint_catches(demo: Path, old: str, new: str, expected: str):
    p = demo / "notes" / "algebra" / "01_sep03_matrices.md"
    text = p.read_text(encoding="utf-8")
    assert old in text
    p.write_text(text.replace(old, new, 1), encoding="utf-8")
    res = lint(demo)
    assert res.returncode != 0
    assert expected in res.stdout, res.stdout


def test_lint_weekday(demo: Path):
    src = demo / "notes" / "algebra" / "02_sep09_gauss.md"
    dst = src.with_name("02_sep10_gauss.md")
    dst.write_text(src.read_text(encoding="utf-8").replace("2026-09-09", "2026-09-10"), encoding="utf-8")
    src.unlink()
    res = lint(demo)
    assert "не день лекции курса" in res.stdout
