import { z } from "zod";

/** The build (`scripts/build.py`) writes snake_case JSON; the schemas expose camelCase. */

export const BasisSchema = z.enum(["lecture", "forecast"]);
export type Basis = z.infer<typeof BasisSchema>;

const LectureEntrySchema = z
  .object({
    basis: BasisSchema,
    date: z.string(),
    lecture: z.number(),
    title: z.string(),
    week_id: z.string(),
  })
  .transform(({ week_id: weekId, ...rest }) => ({ ...rest, weekId }));
export type LectureEntry = z.infer<typeof LectureEntrySchema>;

export const CatalogSchema = z.object({
  lectures: z.record(z.string(), z.array(LectureEntrySchema)),
});

export const LabelTypeSchema = z.enum([
  "axiom",
  "corollary",
  "definition",
  "equation",
  "example",
  "figure",
  "lemma",
  "problem",
  "proposition",
  "remark",
  "section",
  "theorem",
]);

const LabelSchema = z
  .object({
    id: z.string(),
    lecture: z.number(),
    name: z.string(),
    number: z.string(),
    tag: z.string().optional(),
    title: z.string(),
    type: LabelTypeSchema,
    week_id: z.string(),
  })
  .transform(({ week_id: weekId, ...rest }) => ({ ...rest, weekId }));
export type Label = z.infer<typeof LabelSchema>;

/** course → label id → label */
export const LabelIndexSchema = z.record(z.string(), z.record(z.string(), LabelSchema));
export type LabelIndex = z.infer<typeof LabelIndexSchema>;

const TocItemSchema = z.object({ id: z.string(), level: z.number(), text: z.string() });
export type TocItem = z.infer<typeof TocItemSchema>;

export const DocMetaSchema = z
  .object({
    based_on: z.string(),
    basis: BasisSchema,
    date: z.string().optional(),
    date_ru: z.string(),
    kind: z.enum(["notes", "registry"]),
    lecture: z.number(),
    title: z.string(),
    toc: z.array(TocItemSchema),
  })
  .transform(({ based_on: basedOn, date_ru: dateRu, ...rest }) => ({ ...rest, basedOn, dateRu }));
export type DocMeta = z.infer<typeof DocMetaSchema>;

const GlossaryEntrySchema = z
  .object({
    def_html: z.string(),
    lecture: z.number(),
    term: z.string(),
    term_html: z.string(),
    week_id: z.string(),
  })
  .transform(({ def_html: defHtml, term_html: termHtml, week_id: weekId, ...rest }) => ({
    ...rest,
    defHtml,
    termHtml,
    weekId,
  }));
export type GlossaryEntry = z.infer<typeof GlossaryEntrySchema>;
export const GlossarySchema = z.array(GlossaryEntrySchema);

export const MacrosSchema = z.record(z.string(), z.string());
