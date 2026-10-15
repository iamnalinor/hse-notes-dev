import { createBrowserRouter, type RouteObject } from "react-router";

import { AppShell } from "./app-shell.tsx";
import { RouteError } from "./route-error.tsx";

type Page = () => Promise<{ readonly Component: React.ComponentType }>;

const page = (path: string, load: Page): RouteObject => ({ lazy: async () => await load(), path });

export const routes: RouteObject[] = [
  {
    children: [
      { index: true, lazy: async () => await import("#web/features/home/home-page.tsx") },
      page(":course", async () => await import("#web/features/course/course-page.tsx")),
      page(
        ":course/registry",
        async () => await import("#web/features/registry/registry-page.tsx"),
      ),
      page(
        ":course/glossary",
        async () => await import("#web/features/glossary/glossary-page.tsx"),
      ),
      page(":course/remarks", async () => await import("#web/features/remarks/remarks-page.tsx")),
      page(":course/:weekId", async () => await import("#web/features/lecture/lecture-page.tsx")),
    ],
    Component: AppShell,
    ErrorBoundary: RouteError,
  },
];

export const createAppRouter = () =>
  createBrowserRouter(routes, { basename: import.meta.env.BASE_URL });
