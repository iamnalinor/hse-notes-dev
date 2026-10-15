import type { ReactNode } from "react";

type Props = { readonly children: ReactNode; readonly collapsed: boolean };

export const Proof = ({ children, collapsed }: Props) => (
  <details className="group -mt-1.5 mb-7" open={!collapsed}>
    <summary className="flex cursor-pointer list-none items-baseline gap-2.5 [&::-webkit-details-marker]:hidden">
      <span className="italic">Доказательство.</span>
      <span className="ml-auto rounded-full border border-rule px-2.5 py-0.5 font-sans text-xs whitespace-nowrap text-muted">
        <span className="group-open:hidden">развернуть</span>
        <span className="hidden group-open:inline">свернуть</span>
      </span>
    </summary>
    <div className="pt-2">
      {children}
      <div className="float-right mt-[-1.6em]">∎</div>
      <div className="clear-both" />
    </div>
  </details>
);
