import type { ReactElement } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router";

import type { LabelIndex } from "#web/domain/schemas.ts";

import { labelIndexQuery, macrosQuery } from "#web/api/queries.ts";

export const LABELS: LabelIndex = {
  algebra: {
    "def:lec02:transpose": {
      id: "def:lec02:transpose",
      lecture: 2,
      name: "Определение",
      number: "2.9",
      title: "транспонирование",
      type: "definition",
      weekId: "02_sep09_gauss_method",
    },
    "thm:lec04:laplace": {
      id: "thm:lec04:laplace",
      lecture: 4,
      name: "Теорема",
      number: "4.3",
      title: "разложение Лапласа",
      type: "theorem",
      weekId: "04_sep23_determinant_properties",
    },
  },
};

/** App providers with the shared data already in the cache: no network in unit tests. */
export const renderWithApp = (
  ui: ReactElement,
  route = "/algebra/04_sep23_determinant_properties",
) => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  client.setQueryData(macrosQuery.queryKey, { "\\R": String.raw`\mathbb{R}` });
  client.setQueryData(labelIndexQuery.queryKey, LABELS);
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
    </QueryClientProvider>,
  );
};
