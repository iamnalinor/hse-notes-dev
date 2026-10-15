"""Рендер страниц PDF в PNG, чтобы агент мог посмотреть вёрстку глазами.

    uv run scripts/render_pages.py build/pdf/algebra/04_sep23_determinant_properties.pdf
    uv run scripts/render_pages.py <pdf> --pages 1-3 --dpi 110 --out /tmp/pages

Печатает пути к PNG; их можно открыть инструментом чтения изображений.
"""

from __future__ import annotations

import argparse
from pathlib import Path

import pymupdf


def parse_pages(spec: str | None, n: int) -> list[int]:
    if not spec:
        return list(range(n))
    pages: list[int] = []
    for part in spec.split(","):
        if "-" in part:
            a, b = part.split("-")
            pages += list(range(int(a) - 1, min(int(b), n)))
        else:
            pages.append(int(part) - 1)
    return [p for p in pages if 0 <= p < n]


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("pdf", type=Path)
    ap.add_argument("--pages", help="например 1-3,5 (по умолчанию все)")
    ap.add_argument("--dpi", type=int, default=100)
    ap.add_argument("--out", type=Path, help="папка для PNG (по умолчанию рядом с PDF)")
    args = ap.parse_args()

    doc = pymupdf.open(args.pdf)
    out = args.out or args.pdf.parent / f"{args.pdf.stem}-pages"
    out.mkdir(parents=True, exist_ok=True)
    print(f"{args.pdf}: {doc.page_count} стр.")
    for i in parse_pages(args.pages, doc.page_count):
        png = out / f"page-{i + 1:02d}.png"
        doc[i].get_pixmap(dpi=args.dpi).save(png)
        print(png)


if __name__ == "__main__":
    main()
