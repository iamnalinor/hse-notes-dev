const REPO = "https://github.com/iamnalinor/hse-notes-dev";

export const SiteFooter = () => (
  <footer className="mt-6 border-t border-rule font-sans text-[13.5px] text-muted">
    <div className="mx-auto flex max-w-[1240px] flex-wrap justify-between gap-6 px-8 pt-7 pb-12">
      <span>Конспекты ПИ ФКН ВШЭ, 2026/27. Неофициальный студенческий проект.</span>
      <span>
        <a className="text-muted" href={REPO}>
          Исходники на GitHub
        </a>{" "}
        ·{" "}
        <a className="text-muted" href={`${REPO}/issues/new`}>
          Нашёл ошибку?
        </a>
      </span>
    </div>
  </footer>
);
