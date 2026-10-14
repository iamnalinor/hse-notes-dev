# sources/

Сюда агенты скачивают материалы для генерации конспектов. Содержимое не коммитится:
это чужие материалы, у которых нет лицензии на публикацию.

Как достать каждый источник, описано в `context/sources.md`. Публичные репозитории
клонирует `scripts/fetch_sources.sh`. Файлы с Google Drive агент скачивает сам через
Drive-коннектор.

Раскладка: `sources/<course>/<что-то понятное>/…`, например
`sources/algebra/vasyukov1/`, `sources/discrete/LN.pdf`, `sources/calculus/seminars/Семинар_1.pdf`.
