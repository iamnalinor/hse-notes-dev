import { Suspense } from "react";
import { Outlet, ScrollRestoration } from "react-router";

import { SiteFooter } from "#web/shared/layout/site-footer.tsx";
import { TopBar } from "#web/shared/layout/top-bar.tsx";
import { PageSpinner } from "#web/shared/ui/page-spinner.tsx";

export const AppShell = () => (
  <div className="flex min-h-screen flex-col bg-paper text-ink">
    <TopBar />
    <div className="flex-1">
      <Suspense fallback={<PageSpinner />}>
        <Outlet />
      </Suspense>
    </div>
    <SiteFooter />
    <ScrollRestoration />
  </div>
);
