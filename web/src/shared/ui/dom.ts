/** `getElementById` that works for any root and ids with colons (`thm:lec04:laplace`). */
export const findById = (root: ParentNode, id: string): Element | null =>
  root.querySelector(`[id="${CSS.escape(id)}"]`);
