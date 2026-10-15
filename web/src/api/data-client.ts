import type { z } from "zod";

const DATA_ROOT = `${import.meta.env.BASE_URL}data/`;

export const dataUrl = (path: string): string => `${DATA_ROOT}${path}`;

const get = async (path: string): Promise<Response> => {
  const response = await fetch(dataUrl(path));
  if (!response.ok) {
    throw new Error(`Не удалось загрузить ${path}: ${String(response.status)}`);
  }
  return response;
};

export const fetchJson = async <T>(path: string, schema: z.ZodType<T>): Promise<T> => {
  const response = await get(path);
  return schema.parse(await response.json());
};

export const fetchText = async (path: string): Promise<string> => {
  const response = await get(path);
  return await response.text();
};
