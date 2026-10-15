import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";

import {
  CatalogSchema,
  DocMetaSchema,
  GlossarySchema,
  LabelIndexSchema,
  MacrosSchema,
} from "#web/domain/schemas.ts";

import { fetchJson, fetchText } from "./data-client.ts";

// The data only changes with a deploy: never refetch within a visit.
const STATIC = { gcTime: Infinity, staleTime: Infinity } as const;

export const catalogQuery = queryOptions({
  ...STATIC,
  queryFn: async () => await fetchJson("courses.json", CatalogSchema),
  queryKey: ["catalog"],
});

export const labelIndexQuery = queryOptions({
  ...STATIC,
  queryFn: async () => await fetchJson("index.json", LabelIndexSchema),
  queryKey: ["labels"],
});

export const macrosQuery = queryOptions({
  ...STATIC,
  queryFn: async () => await fetchJson("katex-macros.json", MacrosSchema),
  queryKey: ["macros"],
});

export const glossaryQuery = (course: string) =>
  queryOptions({
    ...STATIC,
    queryFn: async () => await fetchJson(`${course}/glossary.json`, GlossarySchema),
    queryKey: ["glossary", course],
  });

export const docMetaQuery = (course: string, docId: string) =>
  queryOptions({
    ...STATIC,
    queryFn: async () => await fetchJson(`${course}/${docId}/meta.json`, DocMetaSchema),
    queryKey: ["meta", course, docId],
  });

export const fragmentQuery = (course: string, docId: string) =>
  queryOptions({
    ...STATIC,
    queryFn: async () => await fetchText(`${course}/${docId}/fragment.html`),
    queryKey: ["fragment", course, docId],
  });

export const useCatalog = () => useSuspenseQuery(catalogQuery).data;
export const useLabelIndex = () => useSuspenseQuery(labelIndexQuery).data;
export const useMacros = () => useSuspenseQuery(macrosQuery).data;
export const useGlossary = (course: string) => useSuspenseQuery(glossaryQuery(course)).data;
export const useDocMeta = (course: string, docId: string) =>
  useSuspenseQuery(docMetaQuery(course, docId)).data;
export const useFragment = (course: string, docId: string) =>
  useSuspenseQuery(fragmentQuery(course, docId)).data;
