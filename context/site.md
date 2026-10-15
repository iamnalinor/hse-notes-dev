# Сайт: требования и готовые данные

Сайт сделан в `web/` (React + Vite, макет — `design.html`, деплой на GitHub Pages; см. `web/README.md`). Здесь — требования ТЗ (§8) и описание данных, которые отдаёт сборка.

## Требования (из ТЗ)

- **Структура:** главная → курс → лекция.
- **Страница курса:** таблица «№ · дата · тема · PDF · статус (лекция / черновик-прогноз)».
- **Страница лекции:** шапка (в html — хлебные крошки «Алгебра / Лекция 4» и кнопка «PDF»), оглавление по разделам, текст, в конце — ссылки на предыдущую и следующую лекцию.
- **Отдельно:** реестр теории по курсу и глоссарий по всему курсу (склейка глоссариев всех лекций со ссылками на лекцию-источник).
- **Ссылки на определения и теоремы по номеру** кликабельны и ведут на якорь, в том числе в другой лекции. Желательно превью блока при наведении: данные для этого есть в `index.json`.
- **Фильтр замечаний по пометке** (например, все «частые заблуждения» курса): у блоков есть `data-tag`.
- Сайт должен быть красивым. Окружения выглядят так же, как в PDF; формулы — KaTeX.
- **Публикация:** GitHub Pages или Cloudflare Pages, на PR — превью-деплой.
- **Генератор:** Astro, Hugo или свой скрипт — на выбор.
- **Расширения на потом:** «что спрашивают на коллоквиуме», режим «карточки» (формулировка скрыта до клика), задачи КР прошлых лет с привязкой к теоремам.

## Что отдаёт сборка (`uv run scripts/build.py` → `build/site-data/`)

| Файл | Содержимое |
| --- | --- |
| `courses.json` | конфиг курсов (`templates/courses.json`) + список лекций каждого курса: номер, `week_id`, тема, дата, `basis`, путь к исходнику |
| `index.json` | все метки по курсам: `course → id → {type, name, number, title, tag, lecture, week_id, basis}`. Это источник для превью ссылок и для поиска |
| `katex-macros.json` | общие макросы для KaTeX (из `templates/macros.tex`) |
| `<course>/glossary.json` | склеенный глоссарий курса: `term`, `term_html`, `def_html`, `lecture`, `week_id` |
| `<course>/<week_id>/fragment.html` | тело конспекта (без шапки), см. разметку ниже |
| `<course>/<week_id>/meta.json` | метаданные: заголовок, дата, `date_ru`, `basis`, `based_on`, `header_line`, `toc` (уровень, id, текст), метки, глоссарий, рисунки |
| `<course>/<week_id>/fig/<sha1>.svg` | рисунки TikZ, скомпилированные в SVG (текст переведён в кривые, шрифты не нужны) |
| `<course>/<week_id>/index.html` | предпросмотр для ревью (`templates/preview.html`) — **не** сайт, но хорошая отправная точка для стилей |
| `<course>/registry/…` | то же для реестра теории |

PDF лежат в `build/pdf/<course>/<week_id>.pdf`. В CI они загружаются как artifact `pdf` и в релиз `latest` под именами `<course>-<week_id>.pdf`.

## Разметка HTML-фрагмента

```html
<div id="thm:lec04:laplace" class="nb nb-theorem nb-style-theorem" data-type="theorem" data-number="4.3">
  <div class="nb-head"><span class="nb-name">Теорема 4.3 (разложение Лапласа)</span></div>
  <div class="nb-body">…</div>
</div>
<div class="nb nb-remark nb-style-remark nb-tag-pitfall" data-tag="pitfall" data-number="4.4">…</div>
<div class="nb-proof"><p><em>Доказательство.</em> …</p></div>
<div class="nb-answer"><p><strong>Ответ:</strong> …</p></div>
<details class="nb-answers"><summary>Ответы</summary>…</details>
<figure class="nb-figure" id="fig:lec04:x" data-number="4.1"><img src="fig/<sha1>.svg"><figcaption>…</figcaption></figure>
<span id="eq:lec04:x" class="nb-eq" data-number="4.1"><span class="math display">\[ … \tag{4.1} \]</span></span>
<a href="#thm:lec04:laplace" class="ref" data-ref="thm:lec04:laplace">4.3</a>
<a href="../02_sep09_gauss/#thm:lec02:gauss" class="ref" data-ref="thm:lec02:gauss">2.7 (лекция 2)</a>
```

- Стили блоков: `nb-style-{definition,theorem,example,remark,problem}`.
- Пометки замечаний: `data-tag` = `corner-case` | `pitfall` | `misconception` | `convention` | `reminder`.
- Формулы: `<span class="math inline|display">` с TeX внутри. Их нужно отрендерить KaTeX с `katex-macros.json`, на клиенте или при сборке.
- Ссылки между лекциями относительные (`../<week_id>/#id`). Они рассчитаны на URL вида `/<course>/<week_id>/`, реестр — `/<course>/registry/`.
- Заголовки разделов получают id от pandoc; `--section-divs` оборачивает разделы в `<section>`.
