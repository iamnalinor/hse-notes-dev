import type { ReactNode } from "react";

export const SectionTitle = ({
  children,
  eyebrow,
}: {
  readonly children: ReactNode;
  readonly eyebrow: string;
}) => (
  <div>
    <div className="mb-2 text-[12.5px] font-semibold tracking-[0.16em] text-muted uppercase">
      {eyebrow}
    </div>
    <h2 className="text-[34px] font-bold tracking-tight">{children}</h2>
  </div>
);
