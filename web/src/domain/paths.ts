const withHash = (path: string, hash: string | undefined): string =>
  hash === undefined ? path : `${path}#${hash}`;

const withTag = (path: string, tag: string | undefined): string =>
  tag === undefined ? path : `${path}?tag=${tag}`;

export const paths = {
  course: (course: string): string => `/${course}`,
  glossary: (course: string): string => `/${course}/glossary`,
  home: (): string => "/",
  lecture: (course: string, weekId: string, hash?: string): string =>
    withHash(`/${course}/${weekId}`, hash),
  registry: (course: string): string => `/${course}/registry`,
  remarks: (course: string, tag?: string): string => withTag(`/${course}/remarks`, tag),
} as const;
