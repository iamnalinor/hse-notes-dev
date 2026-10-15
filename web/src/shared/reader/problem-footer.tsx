import type { ReactNode } from "react";

import { Reveal } from "./reveal.tsx";

type Props = { readonly answer: ReactNode; readonly solution: ReactNode };

/** The problem card's tail: the answer is open, the solution waits for a click. */
export const ProblemFooter = ({ answer, solution }: Props) => {
  if (answer === undefined && solution === undefined) {
    return null;
  }
  return (
    <div className="flex flex-wrap items-center gap-2.5 border-t border-dashed border-prob/35 px-4.5 py-2.5 font-sans">
      {answer !== undefined && (
        <Reveal closedLabel="Показать ответ" defaultOpen openLabel="Ответ">
          <div className="font-serif">{answer}</div>
        </Reveal>
      )}
      {solution !== undefined && (
        <Reveal closedLabel="Показать решение" openLabel="Решение">
          <div className="font-serif">{solution}</div>
        </Reveal>
      )}
      {solution !== undefined && <span className="text-xs text-faint">Сначала попробуй сам</span>}
    </div>
  );
};
