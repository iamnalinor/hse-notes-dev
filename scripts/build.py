"""Сборка конспектов и реестров: Markdown → PDF (xelatex) и HTML-фрагменты для сайта.

Запуск:
    uv run scripts/build.py                       # всё
    uv run scripts/build.py --only notes/algebra/04_*.md
    uv run scripts/build.py --no-html --strict

Результат в build/:
    build/index.json                    глобальный индекс меток и глоссариев
    build/pdf/<course>/<week_id>.pdf    PDF конспектов, build/pdf/<course>/registry.pdf
    build/site-data/                    данные для будущего сайта + preview-страницы
        index.json, courses.json, katex-macros.json
        <course>/glossary.json
        <course>/<week_id>/fragment.html, meta.json, fig/*.svg, index.html (preview)
        <course>/registry/...
"""

from __future__ import annotations

import argparse
import concurrent.futures as cf
import fnmatch
import hashlib
import html
import json
import os
import re
import shutil
import subprocess
import sys
from dataclasses import dataclass
from pathlib import Path

import pypandoc
import yaml

ROOT = Path(__file__).resolve().parent.parent
TEMPLATES = ROOT / "templates"
FILTER = ROOT / "filters" / "notes.lua"
CONFIG = TEMPLATES / "courses.json"
SRC = ROOT  # где лежат notes/ и registry/ (в тестах — временная папка)
BUILD = ROOT / "build"
CACHE = ROOT / ".cache"
SITE = BUILD / "site-data"
PDF_DIR = BUILD / "pdf"
TEX_DIR = BUILD / "tex"


def set_dirs(src: Path, build: Path) -> None:
    global SRC, BUILD, SITE, PDF_DIR, TEX_DIR
    SRC, BUILD = src.resolve(), build.resolve()
    SITE, PDF_DIR, TEX_DIR = BUILD / "site-data", BUILD / "pdf", BUILD / "tex"


PANDOC = pypandoc.get_pandoc_path()
TINYTEX_BIN = Path.home() / ".TinyTeX" / "bin" / "x86_64-linux"

MARKDOWN = "markdown+tex_math_dollars+fenced_divs+citations-implicit_figures"


def tex_env() -> dict[str, str]:
    env = dict(os.environ)
    if TINYTEX_BIN.is_dir():
        env["PATH"] = f"{TINYTEX_BIN}{os.pathsep}{env['PATH']}"
    env["TEXINPUTS"] = f"{TEMPLATES}//{os.pathsep}"
    return env


@dataclass
class Doc:
    path: Path
    kind: str  # notes | registry
    course: str
    week_id: str
    meta: dict

    @property
    def rel(self) -> str:
        return self.path.relative_to(SRC).as_posix()

    @property
    def out_name(self) -> str:
        return "registry" if self.kind == "registry" else self.week_id


class BuildError(Exception):
    pass


def read_front_matter(path: Path) -> dict:
    text = path.read_text(encoding="utf-8")
    m = re.match(r"^---\n(.*?)\n(---|\.\.\.)\n", text, re.S)
    if not m:
        raise BuildError(f"{path}: нет YAML front matter")
    return yaml.safe_load(m.group(1)) or {}


def discover() -> list[Doc]:
    docs = []
    for p in sorted((SRC / "notes").glob("*/*.md")):
        meta = read_front_matter(p)
        docs.append(Doc(p, "notes", p.parent.name, p.stem, meta))
    for p in sorted((SRC / "registry").glob("*.md")):
        meta = read_front_matter(p)
        docs.append(Doc(p, "registry", p.stem, "registry", meta))
    return docs


def run_pandoc(doc: Doc, to: str, out: Path, extra: list[str]) -> None:
    out.parent.mkdir(parents=True, exist_ok=True)
    cmd = [
        PANDOC,
        str(doc.path),
        "-f",
        MARKDOWN,
        "-t",
        to,
        "-o",
        str(out),
        "--lua-filter",
        str(FILTER),
        "-M",
        f"week_id={doc.week_id}",
        "-M",
        f"kind={doc.kind}",
        "-M",
        f"course={doc.course}",
        "-M",
        f"notes_config={CONFIG}",
        *extra,
    ]
    res = subprocess.run(cmd, capture_output=True, text=True, cwd=ROOT)
    if res.stderr.strip():
        sys.stderr.write(f"--- pandoc {doc.rel} ({to}) ---\n{res.stderr}")
    if res.returncode != 0:
        raise BuildError(f"pandoc упал на {doc.rel} ({to})")


# ----------------------------------------------------------------------------- индекс


def build_index(docs: list[Doc], jobs: int) -> dict:
    idx_dir = BUILD / "idx"
    if idx_dir.exists():
        shutil.rmtree(idx_dir)

    def one(doc: Doc) -> Path:
        out = idx_dir / doc.course / f"{doc.out_name}.json"
        run_pandoc(doc, "native", Path(os.devnull), ["-M", "notes_mode=index", "-M", f"notes_out={out}"])
        out.parent.mkdir(parents=True, exist_ok=True)
        return out

    for d in docs:
        (idx_dir / d.course).mkdir(parents=True, exist_ok=True)
    with cf.ThreadPoolExecutor(jobs) as ex:
        paths = list(ex.map(one, docs))

    labels: dict[str, dict] = {}
    glossary: dict[str, list] = {}
    lectures: dict[str, list] = {}
    errors = []
    for doc, p in zip(docs, paths, strict=True):
        data = json.loads(p.read_text(encoding="utf-8"))
        if doc.kind != "notes":
            continue
        course_labels = labels.setdefault(doc.course, {})
        for lid in data.get("label_order") or []:
            e = data["labels"][lid]
            if lid in course_labels:
                errors.append(f"метка {lid} определена и в {course_labels[lid]['file']}, и в {doc.rel}")
                continue
            e.update(
                course=doc.course,
                lecture=data["lecture"],
                week_id=doc.week_id,
                basis=data.get("basis") or "lecture",
                file=doc.rel,
            )
            course_labels[lid] = e
        for g in data.get("glossary") or []:
            g.update(lecture=data["lecture"], week_id=doc.week_id)
            glossary.setdefault(doc.course, []).append(g)
        lectures.setdefault(doc.course, []).append(
            {
                "lecture": data["lecture"],
                "week_id": doc.week_id,
                "title": data.get("title"),
                "date": data.get("date"),
                "basis": data.get("basis") or "lecture",
                "file": doc.rel,
            }
        )
    if errors:
        raise BuildError("\n".join(errors))
    for v in lectures.values():
        v.sort(key=lambda x: x["lecture"])
    index = {"labels": labels, "glossary": glossary, "lectures": lectures}
    BUILD.mkdir(exist_ok=True)
    (BUILD / "index.json").write_text(json.dumps(index, ensure_ascii=False, indent=1), encoding="utf-8")
    return index


# ----------------------------------------------------------------------------- PDF

OVERFULL_RE = re.compile(r"Overfull \\[hv]box \(([\d.]+)pt too (?:wide|high)\)[^\n]*lines? (\d+)")


def build_pdf(doc: Doc, strict: bool) -> list[str]:
    warnings = []
    tex_dir = TEX_DIR / doc.course
    tex = tex_dir / f"{doc.out_name}.tex"
    tmp = tex.with_suffix(".tex.new")
    run_pandoc(
        doc,
        "latex",
        tmp,
        [
            "--template",
            str(TEMPLATES / "notes.latex"),
            "-M",
            "notes_mode=render",
            "-M",
            f"notes_index={BUILD / 'index.json'}",
        ],
    )
    pdf_out = PDF_DIR / doc.course / f"{doc.out_name}.pdf"
    stamp = tex.with_suffix(".hash")
    deps = "".join(
        hashlib.sha1(p.read_bytes()).hexdigest() for p in sorted(TEMPLATES.glob("*")) if p.is_file()
    )
    digest = hashlib.sha1(tmp.read_bytes() + deps.encode()).hexdigest()
    if pdf_out.exists() and stamp.exists() and stamp.read_text() == digest:
        tmp.unlink()
        return warnings
    tmp.replace(tex)
    res = subprocess.run(
        [
            "latexmk",
            "-xelatex",
            "-interaction=nonstopmode",
            "-halt-on-error",
            "-file-line-error",
            f"-outdir={tex_dir}",
            str(tex),
        ],
        capture_output=True,
        text=True,
        env=tex_env(),
        cwd=tex_dir,
    )
    log = tex.with_suffix(".log")
    log_text = log.read_text(encoding="utf-8", errors="replace") if log.exists() else ""
    if res.returncode != 0:
        errs = [ln for ln in log_text.splitlines() if ln.startswith("!") or ".tex:" in ln]
        tail = "\n".join(errs[:30]) or res.stdout[-3000:]
        raise BuildError(f"xelatex упал на {doc.rel}:\n{tail}\n(полный лог: {log})")
    for m in OVERFULL_RE.finditer(log_text):
        pt = float(m.group(1))
        if pt > 1.0:
            warnings.append(f"{doc.rel}: overfull box {pt}pt (строка {m.group(2)} в {tex.name})")
    pdf_out.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(tex.with_suffix(".pdf"), pdf_out)
    stamp.write_text(digest)
    return warnings


# ----------------------------------------------------------------------------- HTML


def preamble_hash() -> str:
    h = hashlib.sha1()
    for name in ("tikz-standalone.tex", "tikz-preamble.tex", "macros.tex", "fonts.tex"):
        h.update((TEMPLATES / name).read_bytes())
    return h.hexdigest()[:12]


def compile_tikz(code: str, digest: str) -> Path:
    cache_dir = CACHE / "tikz" / preamble_hash()
    svg = cache_dir / f"{digest}.svg"
    if svg.exists():
        return svg
    work = cache_dir / digest
    work.mkdir(parents=True, exist_ok=True)
    src = (TEMPLATES / "tikz-standalone.tex").read_text(encoding="utf-8")
    src = src.replace("\\input{figure-body.tex}", code)
    (work / "fig.tex").write_text(src, encoding="utf-8")
    env = tex_env()
    res = subprocess.run(
        ["xelatex", "-no-pdf", "-interaction=nonstopmode", "-halt-on-error", "fig.tex"],
        cwd=work,
        capture_output=True,
        text=True,
        env=env,
    )
    if res.returncode != 0:
        errs = [ln for ln in res.stdout.splitlines() if ln.startswith("!")]
        raise BuildError(f"TikZ → SVG: xelatex упал ({digest}): {' '.join(errs[:5])}")
    res = subprocess.run(
        ["dvisvgm", "--no-fonts", "--exact-bbox", "-o", str(svg), "fig.xdv"],
        cwd=work,
        capture_output=True,
        text=True,
        env=env,
    )
    if res.returncode != 0 or not svg.exists():
        raise BuildError(f"TikZ → SVG: dvisvgm упал ({digest}): {res.stderr[-500:]}")
    shutil.rmtree(work, ignore_errors=True)
    return svg


def build_html(doc: Doc) -> dict:
    page_dir = SITE / doc.course / doc.out_name
    if page_dir.exists():
        shutil.rmtree(page_dir)
    page_dir.mkdir(parents=True)
    sidecar = page_dir / "meta.json"
    run_pandoc(
        doc,
        "html5",
        page_dir / "fragment.html",
        [
            "--katex",
            "--section-divs",
            "-M",
            "notes_mode=render",
            "-M",
            f"notes_index={BUILD / 'index.json'}",
            "-M",
            f"notes_out={sidecar}",
        ],
    )
    meta = json.loads(sidecar.read_text(encoding="utf-8"))
    figures = meta.get("figures") or []
    if figures:
        (page_dir / "fig").mkdir()
        for fig in figures:
            svg = compile_tikz(fig["code"], fig["hash"])
            shutil.copy2(svg, page_dir / "fig" / f"{fig['hash']}.svg")
        for fig in figures:
            fig.pop("code", None)
        sidecar.write_text(json.dumps(meta, ensure_ascii=False, indent=1), encoding="utf-8")
    write_preview(page_dir, meta)
    return meta


def katex_macros() -> dict[str, str]:
    macros = {}
    for line in (TEMPLATES / "macros.tex").read_text(encoding="utf-8").splitlines():
        m = re.match(r"\\(?:re)?newcommand\{(\\[A-Za-z]+)\}(?:\[\d\])?\{(.*)\}\s*$", line)
        if m:
            macros[m.group(1)] = m.group(2)
    return macros


def write_preview(page_dir: Path, meta: dict) -> None:
    tpl = (TEMPLATES / "preview.html").read_text(encoding="utf-8")
    fragment = (page_dir / "fragment.html").read_text(encoding="utf-8")
    based = meta.get("based_on") or ""
    draft = meta.get("basis") == "forecast"
    page = (
        tpl.replace("{{title}}", html.escape(meta.get("title") or ""))
        .replace("{{header_line}}", html.escape(meta.get("header_line") or ""))
        .replace("{{based_on}}", html.escape(based))
        .replace("{{draft}}", '<span class="nb-draft">черновик</span>' if draft else "")
        .replace("{{macros}}", json.dumps(katex_macros()))
        .replace("{{content}}", fragment)
    )
    (page_dir / "index.html").write_text(page, encoding="utf-8")


def write_site_data(index: dict, metas: list[dict]) -> None:
    SITE.mkdir(parents=True, exist_ok=True)
    (SITE / "index.json").write_text(
        json.dumps(index["labels"], ensure_ascii=False, indent=1), encoding="utf-8"
    )
    (SITE / "courses.json").write_text(
        json.dumps(
            {
                "config": json.loads(CONFIG.read_text(encoding="utf-8")),
                "lectures": index["lectures"],
            },
            ensure_ascii=False,
            indent=1,
        ),
        encoding="utf-8",
    )
    (SITE / "katex-macros.json").write_text(
        json.dumps(katex_macros(), ensure_ascii=False, indent=1), encoding="utf-8"
    )
    by_course: dict[str, list] = {}
    for m in metas:
        if m.get("kind") != "notes":
            continue
        for g in m.get("glossary") or []:
            by_course.setdefault(m["course"], []).append(
                {**g, "lecture": m["lecture"], "week_id": m["week_id"]}
            )
    for course, items in by_course.items():
        items.sort(key=lambda g: g["term"].lower())
        (SITE / course).mkdir(parents=True, exist_ok=True)
        (SITE / course / "glossary.json").write_text(
            json.dumps(items, ensure_ascii=False, indent=1), encoding="utf-8"
        )
    # список страниц для ревью html-версии
    links = []
    for course, lst in sorted(index["lectures"].items()):
        links.append(f"<h2>{html.escape(course)}</h2><ul>")
        for lec in lst:
            links.append(
                f'<li><a href="{course}/{lec["week_id"]}/">{lec["lecture"]}. '
                f"{html.escape(lec['title'] or '')}</a></li>"
            )
        if (SITE / course / "registry").exists():
            links.append(f'<li><a href="{course}/registry/">Реестр теории</a></li>')
        links.append("</ul>")
    (SITE / "index.html").write_text(
        "<!doctype html><meta charset='utf-8'><title>Конспекты — превью</title>"
        "<body style='font-family:sans-serif;max-width:40em;margin:2em auto'>"
        "<h1>Превью html-версии</h1>" + "".join(links),
        encoding="utf-8",
    )


# ----------------------------------------------------------------------------- main


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--only", nargs="*", help="glob-и путей (относительно корня), которые собирать")
    ap.add_argument("--no-pdf", action="store_true")
    ap.add_argument("--no-html", action="store_true")
    ap.add_argument("--strict", action="store_true", help="предупреждения — ошибки")
    ap.add_argument("-j", "--jobs", type=int, default=os.cpu_count() or 2)
    ap.add_argument("--src", type=Path, default=ROOT, help="папка с notes/ и registry/")
    ap.add_argument("--out", type=Path, default=None, help="папка сборки (по умолчанию <src>/build)")
    args = ap.parse_args()
    set_dirs(args.src, args.out or args.src / "build")

    try:
        docs = discover()
        index = build_index(docs, args.jobs)
        targets = docs
        if args.only:
            targets = [
                d for d in docs if any(fnmatch.fnmatch(d.rel, pat) or d.rel == pat for pat in args.only)
            ]
            if not targets:
                raise BuildError(f"--only {args.only}: ни одного файла")
        warnings: list[str] = []
        failures: list[str] = []
        metas: list[dict] = []

        def pdf_job(d: Doc):
            return build_pdf(d, args.strict)

        if not args.no_pdf:
            with cf.ThreadPoolExecutor(args.jobs) as ex:
                futs = {ex.submit(pdf_job, d): d for d in targets}
                for f in cf.as_completed(futs):
                    try:
                        warnings += f.result()
                        print(f"PDF  ok  {futs[f].rel}")
                    except BuildError as e:
                        failures.append(str(e))
                        print(f"PDF FAIL {futs[f].rel}")
        if not args.no_html:
            with cf.ThreadPoolExecutor(args.jobs) as ex:
                futs = {ex.submit(build_html, d): d for d in targets}
                for f in cf.as_completed(futs):
                    try:
                        metas.append(f.result())
                        print(f"HTML ok  {futs[f].rel}")
                    except BuildError as e:
                        failures.append(str(e))
                        print(f"HTML FAIL {futs[f].rel}")
            if not args.only:
                write_site_data(index, metas)
    except BuildError as e:
        print(f"\nОШИБКА: {e}", file=sys.stderr)
        return 1

    for w in warnings:
        print(f"WARNING: {w}", file=sys.stderr)
    for e in failures:
        print(f"\nОШИБКА: {e}", file=sys.stderr)
    if failures or (args.strict and warnings):
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
