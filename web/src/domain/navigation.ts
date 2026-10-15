import { z } from "zod";

/** Router state attached to a cross-reference jump, so the target can offer a way back. */
export const BackStateSchema = z.object({ backLabel: z.string() });

export const backLabel = (section: string | undefined, fromLecture: number | undefined): string => {
  const place = section === undefined ? "ссылке" : `ссылке в § ${section}`;
  return fromLecture === undefined
    ? `Назад к ${place}`
    : `Назад к ${place} (лекция ${String(fromLecture)})`;
};
