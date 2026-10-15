import { isRouteErrorResponse, Link, useRouteError } from "react-router";

import { paths } from "#web/domain/paths.ts";
import { SiteFooter } from "#web/shared/layout/site-footer.tsx";
import { TopBar } from "#web/shared/layout/top-bar.tsx";

const describe = (error: unknown): string => {
  if (isRouteErrorResponse(error)) {
    return error.status === 404 ? "Такой страницы нет." : error.statusText;
  }
  return error instanceof Error ? error.message : "Что-то пошло не так.";
};

export const RouteError = () => (
  <div className="flex min-h-screen flex-col bg-paper text-ink">
    <TopBar />
    <main className="mx-auto w-full max-w-[720px] flex-1 px-8 py-24">
      <h1 className="font-sans text-4xl font-bold">Не получилось открыть страницу</h1>
      <p className="mt-4 font-serif text-xl text-muted">{describe(useRouteError())}</p>
      <Link className="mt-8 inline-block font-sans font-semibold" to={paths.home()}>
        На главную →
      </Link>
    </main>
    <SiteFooter />
  </div>
);
