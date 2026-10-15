import { type ReactNode, useId, useState } from "react";

type Props = {
  readonly children: ReactNode;
  readonly closedLabel: string;
  readonly defaultOpen?: boolean;
  readonly openLabel: string;
};

/** A spoiler: the student tries first, then opens the answer or the solution. */
export const Reveal = ({ children, closedLabel, defaultOpen = false, openLabel }: Props) => {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();
  return (
    <>
      <button
        aria-controls={panelId}
        aria-expanded={open}
        className="min-h-6 cursor-pointer rounded-md border border-prob/40 bg-paper px-3.5 py-2 font-sans text-sm font-semibold text-prob aria-expanded:bg-prob-soft"
        onClick={() => {
          setOpen((value) => !value);
        }}
        type="button"
      >
        {open ? `${openLabel} ▴` : `${closedLabel} ▾`}
      </button>
      <div className="order-last basis-full pt-1 text-lg empty:hidden" hidden={!open} id={panelId}>
        {children}
      </div>
    </>
  );
};
