"""Линтер конспектов и реестров (§8 ТЗ + разметка из context/markup.md).

    uv run scripts/lint.py                 # все файлы
    uv run scripts/lint.py notes/algebra/04_sep23_determinant_properties.md
    uv run scripts/lint.py --strict        # предупреждения тоже валят проверку

Ошибки (ERROR) — нарушения схемы, которые ломают сборку, сайт или ТЗ.
Предупреждения (WARN) — то, что ревьюер должен посмотреть глазами.
"""

from __future__ import annotations

import argparse
import datetime as dt
import json
import re
import sys
from dataclasses import dataclass, field
from pathlib import Path

import pypandoc

try:
    from fontTools.ttLib import TTFont
except ImportError:  # pragma: no cover
    TTFont = None

sys.path.insert(0, str(Path(__file__).resolve().parent))
import build  # noqa: E402

MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"]
FILE_RE = re.compile(r"^(\d{2})_([a-z]{3})(\d{2})_([a-z0-9]+(?:_[a-z0-9]+){0,2})$")
PREFIX = {
    "definition": "def",
    "axiom": "ax",
    "theorem": "thm",
    "lemma": "lem",
    "proposition": "prop",
    "corollary": "cor",
    "example": "ex",
    "remark": "rem",
    "problem": "prob",
}
AUX_DIVS = {"proof", "solution", "answer", "answers", "course-glossary"}
TAGS = {"корнер-кейс", "подводный камень", "частое заблуждение", "соглашение курса", "напоминание"}
LABEL_RE = re.compile(r"^(def|ax|thm|lem|prop|cor|ex|rem|prob|fig|eq|sec):lec(\d{2}):[a-z0-9][a-z0-9-]*$")
REQUIRED_META = ["course", "lecture", "date", "title", "basis", "based_on"]

PIPELINE_WORDS = re.compile(
    r"(рекомендаци|ревью|ревьюер|чек-?лист|промпт|прошлогодн|режим[а-я]* генерац|"
    r"\bР\d{1,2}\b|сгенерирован|нейросет|\bLLM\b|прогнозн[а-я]* конспект|инстанци)",
    re.I,
)
SOFT_WORDS = re.compile(r"(очевидно|несложно|нетрудно|как известно|легко видеть|легко показать)", re.I)
FORBIDDEN_MATH = [
    (re.compile(r"\\boxed"), r"\boxed не рендерится в html-версии"),
    (re.compile(r"\\xrightarrow"), r"\xrightarrow запрещён (html, мобильные)"),
    (
        re.compile(r"\\begin\{array\}\{[^}]*\|"),
        "array с чертой запрещён: расширенная матрица — pmatrix с | отдельным столбцом",
    ),
    (re.compile(r"\\left\s*\(\s*\\begin\{array\}"), r"\left( вокруг array запрещено: используй pmatrix"),
    (
        re.compile(r"\\(?:re)?newcommand|\\def\b"),
        "макросы в тексте запрещены: общие макросы — templates/macros.tex",
    ),
]
TEXT_CMDS = re.compile(
    r"\\(?:text|textbf|textit|mbox|textrm|textsf|texttt|operatorname)\s*\{(?:[^{}]|\{[^{}]*\})*\}"
)


FONT_DIR = Path.home() / ".TinyTeX" / "texmf-dist" / "fonts" / "opentype" / "public" / "cm-unicode"


def text_glyphs() -> set[int] | None:
    """Символы, которые есть во всех начертаниях основного шрифта (CMU Serif); None — шрифт не найден."""
    if TTFont is None or not (FONT_DIR / "cmunrm.otf").exists():
        return None
    common: set[int] | None = None
    for name in ("cmunrm", "cmunti", "cmunbx"):
        cmap = set(TTFont(FONT_DIR / f"{name}.otf").getBestCmap())
        common = cmap if common is None else common & cmap
    return common


GLYPHS = text_glyphs()


@dataclass
class Report:
    errors: list[str] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)

    def err(self, path: str, msg: str) -> None:
        self.errors.append(f"{path}: ERROR: {msg}")

    def warn(self, path: str, msg: str) -> None:
        self.warnings.append(f"{path}: WARN: {msg}")


def stringify(inlines) -> str:
    out = []

    def go(x):
        if isinstance(x, list):
            for y in x:
                go(y)
        elif isinstance(x, dict):
            t = x.get("t")
            c = x.get("c")
            if t == "Str":
                out.append(c)
            elif t in ("Space", "SoftBreak", "LineBreak"):
                out.append(" ")
            elif t == "Math":
                out.append("$" + c[1] + "$")
            elif t == "Code":
                out.append(c[1])
            elif t == "Cite":
                go(c[1])
            elif c is not None:
                go(c)

    go(inlines)
    return "".join(out)


def walk(node, fn):
    """Обходит AST pandoc-json, вызывая fn(node) для каждого элемента с полем t."""
    if isinstance(node, list):
        for x in node:
            walk(x, fn)
    elif isinstance(node, dict):
        if "t" in node:
            fn(node)
        for v in node.values():
            if isinstance(v, (list, dict)):
                walk(v, fn)


def iter_nodes(node) -> list[dict]:
    found: list[dict] = []
    walk(node, found.append)
    return found


def ast_of(path: Path) -> dict:
    return json.loads(pypandoc.convert_file(str(path), "json", format=build.MARKDOWN, extra_args=["--quiet"]))


def split_sections(blocks: list) -> list[tuple[str, list]]:
    sections: list[tuple[str, list]] = []
    current: tuple[str, list] | None = None
    for b in blocks:
        if b["t"] == "Header" and b["c"][0] == 1:
            current = (stringify(b["c"][2]).strip(), [])
            sections.append(current)
        elif current is not None:
            current[1].append(b)
    return sections


def text_of_block(b) -> str:
    parts = []

    def fn(n):
        if n["t"] in ("Para", "Plain", "Header"):
            inl = n["c"][2] if n["t"] == "Header" else n["c"]
            parts.append(stringify(inl))

    walk(b, fn)
    return "\n".join(parts)


def check_math(rep: Report, rel: str, tex: str) -> None:
    for rx, msg in FORBIDDEN_MATH:
        if rx.search(tex):
            rep.err(rel, f"{msg}: ${tex[:60]}$")
    if re.search(r"\[-?@[a-z]+:lec", tex) or re.search(r"(?<![\\\w])@[a-z]+:lec\d", tex):
        rep.err(rel, f"ссылка @метка внутри формулы не разрешается — вынеси её за $…$: ${tex[:60]}$")
    stripped = TEXT_CMDS.sub("", tex)
    bad = sorted({ch for ch in stripped if ord(ch) > 127})
    if bad:
        rep.err(
            rel,
            f"не-ASCII символы в формуле ({''.join(bad)}): кириллица — только в \\text{{}}, "
            f"греческие буквы и знаки — командами (\\varepsilon, \\le): ${tex[:60]}$",
        )


def lint_notes(path: Path, rel: str, cfg: dict, labels: dict, rep: Report) -> None:
    meta = build.read_front_matter(path)
    course = path.parent.name
    for k in REQUIRED_META:
        if meta.get(k) in (None, ""):
            rep.err(rel, f"в front matter нет поля {k}")
    if meta.get("course") != course:
        rep.err(rel, f"course={meta.get('course')!r}, а файл лежит в notes/{course}/")
    if course not in cfg["courses"]:
        rep.err(rel, f"неизвестный курс {course}")
        return
    if meta.get("basis") not in ("lecture", "forecast"):
        rep.err(rel, "basis должен быть lecture или forecast")

    m = FILE_RE.match(path.stem)
    date = meta.get("date")
    if isinstance(date, str):
        try:
            date = dt.date.fromisoformat(date)
        except ValueError:
            rep.err(rel, f"date={date!r} не в формате YYYY-MM-DD")
            date = None
    lecture = meta.get("lecture")
    if not m:
        rep.err(rel, "имя файла не по схеме {NN}_{mmmDD}_{slug}.md (slug — 1–3 английских слова через _)")
    else:
        nn, mon, day, _ = m.groups()
        if lecture is not None and int(nn) != int(lecture):
            rep.err(rel, f"номер в имени файла {nn} ≠ lecture: {lecture}")
        if isinstance(date, dt.date):
            if MONTHS[date.month - 1] != mon or date.day != int(day):
                rep.err(rel, f"mmmDD в имени ({mon}{day}) не совпадает с date: {date}")
    if isinstance(date, dt.date):
        exc = cfg.get("date_exceptions", {}).get(course, {})
        if date.weekday() != cfg["courses"][course]["weekday"] and date.isoformat() not in exc:
            rep.err(
                rel,
                f"{date} — не день лекции курса (weekday={date.weekday()}); "
                "перенос оформи в templates/courses.json → date_exceptions",
            )

    lec_nn = f"{int(lecture):02d}" if isinstance(lecture, int) else None
    doc = ast_of(path)
    blocks = doc["blocks"]

    # обязательные разделы
    required = ["Контекст", "После прочтения ты сможешь", "Теория"]
    if cfg["courses"][course]["has_practice"]:
        required.append("Практика")
    required += ["Итоги", "Глоссарий", "Самопроверка"]
    sections = split_sections(blocks)
    names = [s[0] for s in sections]
    for r in required:
        if r not in names:
            rep.err(rel, f"нет раздела «# {r}»")
    order = [n for n in names if n in required]
    if order != [r for r in required if r in names]:
        rep.err(rel, f"разделы не в порядке ТЗ: {order}")
    sec = dict(sections)

    if "Итоги" in sec:
        lists = [b for b in sec["Итоги"] if b["t"] == "BulletList"]
        n = len(lists[0]["c"]) if lists else 0
        if not 3 <= n <= 8:
            rep.warn(rel, f"в итогах {n} пунктов, нужно 3–8")
    if "Глоссарий" in sec:
        dls = [b for b in sec["Глоссарий"] if b["t"] == "DefinitionList"]
        if not dls:
            rep.err(rel, "глоссарий должен быть definition list (Термин\\n:   определение)")
        for dl in dls:
            for term, defs in dl["c"]:
                cites = [n for n in iter_nodes(defs) if n["t"] == "Cite"]
                if not cites:
                    rep.warn(rel, f"в глоссарии у «{stringify(term)}» нет ссылки на номер определения")
    skills = 0
    if "После прочтения ты сможешь" in sec:
        lists = [b for b in sec["После прочтения ты сможешь"] if b["t"] in ("BulletList", "OrderedList")]
        skills = len(lists[0]["c"] if lists[0]["t"] == "BulletList" else lists[0]["c"][1]) if lists else 0
        if skills == 0:
            rep.err(rel, "«После прочтения ты сможешь» — нужен список навыков")
    if "Самопроверка" in sec:
        body = sec["Самопроверка"]
        olists = [b for b in body if b["t"] == "OrderedList"]
        answers = [b for b in body if b["t"] == "Div" and "answers" in b["c"][0][1]]
        if not olists:
            rep.err(rel, "в самопроверке нет нумерованного списка задач")
        if not answers:
            rep.err(rel, "в самопроверке нет блока ::: answers")
        if olists and answers:
            n_q = len(olists[0]["c"][1])
            alists = [b for b in answers[0]["c"][1] if b["t"] == "OrderedList"]
            n_a = len(alists[0]["c"][1]) if alists else 0
            if n_q != n_a:
                rep.err(rel, f"задач в самопроверке {n_q}, ответов {n_a}")
            if n_q < skills:
                rep.warn(rel, f"навыков {skills}, а задач самопроверки {n_q}: на каждый навык нужна задача")

    # блоки, метки, ссылки, формулы
    def on_node(n):
        t = n["t"]
        if t == "Div":
            (ident, classes, kv), content = n["c"]
            attrs = dict(kv)
            kinds = [c for c in classes if c in PREFIX]
            unknown = [c for c in classes if c not in PREFIX and c not in AUX_DIVS and c != "unnumbered"]
            if unknown:
                rep.err(rel, f"неизвестный тип блока ::: {{.{unknown[0]}}} (см. context/markup.md)")
            if kinds and ident:
                lm = LABEL_RE.match(ident)
                if not lm:
                    rep.err(rel, f"метка {ident} не по схеме тип:lecNN:slug")
                else:
                    if lm.group(1) != PREFIX[kinds[0]]:
                        rep.err(rel, f"метка {ident}: для {kinds[0]} префикс {PREFIX[kinds[0]]}:")
                    if lec_nn and lm.group(2) != lec_nn:
                        rep.err(rel, f"метка {ident}: номер лекции lec{lm.group(2)}, а это лекция {lec_nn}")
            tag = attrs.get("tag")
            if tag is not None and (not kinds or kinds[0] != "remark"):
                rep.err(rel, "tag= бывает только у remark")
            if tag is not None and tag not in TAGS:
                rep.err(rel, f"неизвестная пометка замечания: {tag!r}; допустимо: {', '.join(sorted(TAGS))}")
        elif t == "CodeBlock":
            (ident, classes, kv), code = n["c"]
            if "tikz" in classes:
                attrs = dict(kv)
                if not attrs.get("caption"):
                    rep.err(rel, "у рисунка нет caption=")
                if not ident:
                    rep.warn(rel, "у рисунка нет метки #fig:lecNN:…: на него нельзя сослаться по номеру")
                elif not LABEL_RE.match(ident) or not ident.startswith("fig:"):
                    rep.err(rel, f"метка рисунка {ident} не по схеме fig:lecNN:slug")
                if "\\begin{tikzpicture}" not in code:
                    rep.err(rel, "блок tikz должен содержать \\begin{tikzpicture}…\\end{tikzpicture}")
        elif t == "Header":
            ident = n["c"][1][0]
            if ident.startswith("sec:") and not LABEL_RE.match(ident):
                rep.err(rel, f"метка раздела {ident} не по схеме sec:lecNN:slug")
        elif t == "Math":
            check_math(rep, rel, n["c"][1])
        elif t == "Cite":
            for c in n["c"][0]:
                cid = c["citationId"]
                if cid not in labels.get(course, {}):
                    rep.err(rel, f"ссылка @{cid} никуда не ведёт")
        elif t == "Str" and "$" in n["c"] and not n["c"].startswith("{#eq:"):
            rep.err(rel, f"знак $ в тексте — формула не распознана (пробел у $ внутри или непарный $): «{n['c']}»")
        elif t == "Str" and re.fullmatch(r"\{#eq:[^}]*\}", n["c"]):
            if not LABEL_RE.match(n["c"][2:-1]):
                rep.err(rel, f"метка формулы {n['c']} не по схеме eq:lecNN:slug")
        elif t == "Image":
            rep.err(rel, "картинки-файлы в конспекте запрещены: рисунки — только ```tikz (§7 ТЗ)")

    walk(blocks, on_node)

    # тексты: служебные слова пайплайна и «очевидно»
    for b in blocks:
        text = text_of_block(b)
        no_math = re.sub(r"\$[^$]*\$", "", text)
        for mm in PIPELINE_WORDS.finditer(no_math):
            rep.err(rel, f"служебное слово «{mm.group(0)}» в тексте: конспект не знает о пайплайне")
        for mm in SOFT_WORDS.finditer(no_math):
            rep.warn(rel, f"«{mm.group(0)}» — нужна хотя бы фраза, почему")
        if GLYPHS is not None:
            missing = sorted(
                {ch for ch in no_math if ord(ch) > 127 and ord(ch) not in GLYPHS and ch != "\u00a0"}
            )
            if missing:
                rep.err(
                    rel,
                    f"символов {''.join(missing)} нет в шрифте PDF (будут квадраты): пиши их в формуле, например $\\Rightarrow$",
                )
        if "!" in no_math:
            rep.warn(
                rel,
                f"восклицательный знак вне формулы: «{no_math[max(0, no_math.find('!') - 40) : no_math.find('!') + 1]}»",
            )

    # практика: problem → answer → solution
    if "Практика" in sec:
        body = sec["Практика"]
        flat = []

        def collect(n):
            if n["t"] == "Div":
                flat.append(n)

        walk(body, collect)
        for i, d in enumerate(flat):
            if "problem" in d["c"][0][1]:
                nxt = [x["c"][0][1] for x in flat[i + 1 : i + 3]]
                if len(nxt) < 2 or "answer" not in nxt[0] or "solution" not in nxt[1]:
                    rep.err(
                        rel,
                        f"после задачи {d['c'][0][0] or '(без метки)'} должны идти ::: answer и ::: solution",
                    )


def lint_registry(path: Path, rel: str, labels: dict, rep: Report) -> None:
    meta = build.read_front_matter(path)
    course = path.stem
    if meta.get("course") != course:
        rep.err(rel, f"course={meta.get('course')!r}, а файл registry/{course}.md")
    doc = ast_of(path)

    def on_node(n):
        if n["t"] == "Div":
            attrs = dict(n["c"][0][2])
            ref = attrs.get("ref")
            if ref and ref not in labels.get(course, {}):
                rep.err(rel, f"ref={ref} не найден в конспектах курса")
        elif n["t"] == "Cite":
            for c in n["c"][0]:
                if c["citationId"] not in labels.get(course, {}):
                    rep.err(rel, f"ссылка @{c['citationId']} никуда не ведёт")
        elif n["t"] == "Math":
            check_math(rep, rel, n["c"][1])

    walk(doc["blocks"], on_node)


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("files", nargs="*", type=Path)
    ap.add_argument("--strict", action="store_true")
    ap.add_argument("--src", type=Path, default=build.ROOT)
    args = ap.parse_args()
    build.set_dirs(args.src, args.src / "build")

    cfg = json.loads(build.CONFIG.read_text(encoding="utf-8"))
    rep = Report()
    try:
        docs = build.discover()
        index = build.build_index(docs, 8)
    except build.BuildError as e:
        print(f"ERROR: {e}")
        return 1
    labels = index["labels"]
    wanted = {p.resolve() for p in args.files}
    for d in docs:
        if wanted and d.path.resolve() not in wanted:
            continue
        if d.kind == "notes":
            lint_notes(d.path, d.rel, cfg, labels, rep)
        else:
            lint_registry(d.path, d.rel, labels, rep)

    for line in rep.errors + rep.warnings:
        print(line)
    print(f"\n{len(rep.errors)} ошибок, {len(rep.warnings)} предупреждений")
    if rep.errors or (args.strict and rep.warnings):
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
