#!/usr/bin/env bash
# Клонирует публичные репозитории-источники в sources/ (папка в .gitignore).
# Файлы с Google Drive сюда не входят: их агент скачивает через Drive (см. context/sources.md).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
clone() {  # clone <url> <dir>
  local url="$1" dir="$ROOT/sources/$2"
  if [[ -d "$dir/.git" ]]; then git -C "$dir" pull --ff-only -q || true; return; fi
  mkdir -p "$(dirname "$dir")"
  GIT_LFS_SKIP_SMUDGE=1 git clone --depth 1 -q "$url" "$dir"
}
clone https://github.com/vasyukov1/HSE-FCS-SE-1-year common/vasyukov1        # ПИ 2023/24: алгебра, матан, дискра
clone https://github.com/i80287/Calculus-HSE-SE calculus/i80287-2023            # матан 2023/24 (Эрлих), TeX + коллоквиумы
echo "Готово: $(ls "$ROOT/sources")"
