#!/usr/bin/env bash
# Ставит тулчейн сборки: TinyTeX (закреплённая версия) + нужные пакеты TeX Live,
# Python-зависимости (в т.ч. pandoc из pypandoc_binary). Идемпотентен.
# Используется локально, агентами и в CI.
set -euo pipefail

TINYTEX_VERSION="${TINYTEX_VERSION:-v2026.10}"
TINYTEX_DIR="${TINYTEX_DIR:-$HOME/.TinyTeX}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

PACKAGES=(
  # кириллица и шрифты
  collection-langcyrillic babel-russian hyphen-russian cm-unicode fontspec
  # вёрстка
  tcolorbox tikzfill pdfcol environ etoolbox pgf pgfplots tikz-cd fancyhdr geometry hyperref xcolor
  enumitem booktabs caption float titlesec amsmath amsfonts tools mathtools
  bookmark zref needspace setspace parskip microtype
  # сборка
  latexmk dvisvgm standalone luatex85 xetex
)

if [[ ! -x "$TINYTEX_DIR/bin/x86_64-linux/xelatex" ]]; then
  echo ">> Скачиваю TinyTeX $TINYTEX_VERSION"
  tmp="$(mktemp -d)"
  curl -fsSL -o "$tmp/tinytex.tar.xz" \
    "https://github.com/rstudio/tinytex-releases/releases/download/${TINYTEX_VERSION}/TinyTeX-1-linux-x86_64-${TINYTEX_VERSION}.tar.xz"
  tar -xJf "$tmp/tinytex.tar.xz" -C "$tmp"
  rm -rf "$TINYTEX_DIR"
  mv "$tmp/.TinyTeX" "$TINYTEX_DIR"
  rm -rf "$tmp"
fi

export PATH="$TINYTEX_DIR/bin/x86_64-linux:$PATH"

missing=()
for p in "${PACKAGES[@]}"; do
  tlmgr info --only-installed "$p" 2>/dev/null | grep -q '^installed: *Yes' || missing+=("$p")
done
if (( ${#missing[@]} )); then
  tlmgr update --self
  echo ">> tlmgr install ${missing[*]}"
  tlmgr install "${missing[@]}"
fi

if command -v uv >/dev/null; then
  (cd "$ROOT" && uv sync --locked)
fi

echo ">> Готово. Добавь в PATH: $TINYTEX_DIR/bin/x86_64-linux"
