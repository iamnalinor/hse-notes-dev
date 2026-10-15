# hse-notes

Конспекты лекций 1 курса ПИ ФКН ВШЭ, 2026/27: алгебра, математический анализ, дискретная математика (введение в программирование — позже).

- Конспекты: `notes/<course>/<NN>_<mmmDD>_<slug>.md` — Pandoc Markdown с блоками определений, теорем, примеров и замечаний.
- Реестры теории для подготовки к КР и коллоквиумам: `registry/<course>.md`.
- PDF собирает CI: artifact `pdf` у каждого запуска и релиз [`latest`](../../releases/tag/latest) для `main`.
- Правила для авторов и агентов: [`context/`](context/README.md).

## Сборка локально

```bash
./scripts/setup.sh                                   # TinyTeX + пакеты TeX Live + Python-зависимости
export PATH="$HOME/.TinyTeX/bin/x86_64-linux:$PATH"
uv run scripts/lint.py                               # проверка конспектов
uv run scripts/build.py                              # build/pdf/… и build/site-data/…
```
