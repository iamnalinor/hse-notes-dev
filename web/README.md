# web — сайт конспектов

React 19 + Vite + TypeScript, Tailwind v4, React Router, TanStack Query, KaTeX. Менеджер пакетов и рантайм скриптов — только Bun (`.bun-version`).
Макет — `design.html` в корне (три страницы, светлая и тёмная темы); сайт читает данные из `build/site-data` (см. `context/site.md`).

```bash
cd web
bun install
bun data:pull        # site-data и PDF из последнего успешного «Build notes» на main → public/ (нужен gh)
bun dev              # http://localhost:5173
bun lint             # format → eslint → tsc → knip → jscpd → dependency-cruiser; единственная точка входа, чинит сам
bun test             # vitest + testing-library
bun run build        # dist/ (+ 404.html для SPA на GitHub Pages)
```

## Устройство

```
src/domain    чистая логика и zod-схемы данных сборки (без React, fetch, DOM)
src/api       загрузка JSON/HTML, запросы TanStack Query
src/shared    UI-кит, ридер конспекта (HTML-фрагмент → React: блоки, ссылки с превью, KaTeX, спойлеры)
src/features  страницы: home, course, lecture, registry, glossary, remarks (друг друга не импортируют)
src/app       роутер, оболочка
```

Границы слоёв проверяет dependency-cruiser. Правила линтера — `eslint.config.ts` (строгий набор из iamnalinor/pace-dev: typed strict, sonarjs, unicorn, perfectionist, лимиты размера функций, kebab-case файлов, без default export и `index.ts`); отключённое отключено с причиной.

Фрагмент конспекта разбирает `html-react-parser`: `div.nb` → `Block`, `a.ref` → `RefLink` (якорь по номеру + превью блока при наведении, по тапу на телефоне), `span.math` → KaTeX, `nb-proof` → сворачиваемое доказательство, `nb-answer`/`nb-solution` → спойлеры внутри карточки задачи.

## Деплой

`.github/workflows/pages.yml`: после успешного «Build notes» на `main` берёт его артефакты `site-data` и `pdf`, собирает сайт с `BASE_PATH=/<repo>/` и публикует на GitHub Pages. Проверки фронта — `.github/workflows/web.yml`.
