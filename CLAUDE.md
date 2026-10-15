# hse-notes

Конспекты лекций ПИ ФКН ВШЭ 2026/27 (алгебра, матанализ, дискретная математика, введение в программирование): Pandoc Markdown → PDF (xelatex) и HTML-данные для сайта.

**Перед любой работой с конспектами прочитай `context/README.md`.** Там сказано, что читать для твоей задачи. Правила — в `context/`, конспекты — `notes/<course>/<week_id>.md`, реестры теории — `registry/<course>.md`.

```bash
./scripts/setup.sh && export PATH="$HOME/.TinyTeX/bin/x86_64-linux:$PATH"
uv run scripts/lint.py          # схема конспектов
uv run scripts/build.py         # PDF и site-data в build/
uv run pytest -q                # тесты фильтра, сборки, линтера
```

Код пайплайна: `filters/notes.lua` (нумерация, блоки, ссылки), `templates/` (LaTeX-стиль, шаблоны, макросы), `scripts/` (сборка, линт). CI — `.github/workflows/build.yml`. `build/`, `.cache/`, `sources/` не коммитятся.

## Сайт (`web/`)

Фронтенд — React + Vite + Bun, макет в `design.html`. Читай `web/README.md`. После любой правки в `web/` запускай `bun run lint` (из `web/`): это единственная точка входа, она сама чинит формат и сортировку. Правила линтера не ослаблять — чинить код; отключать правило можно только с причиной. Тесты — `bun run test`. Деплой — `.github/workflows/pages.yml` на каждый push в `main` (после «Build notes»); статус смотреть через `gh run list --workflow Pages`.
