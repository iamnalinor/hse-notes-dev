import type { LectureStatus } from "#web/domain/lectures.ts";

const LOOK: Readonly<Record<LectureStatus, { readonly label: string; readonly style: string }>> = {
  draft: {
    label: "черновик",
    style: "border border-dashed border-org/50 bg-org-soft text-org-deep",
  },
  read: { label: "по лекции", style: "bg-ex-soft text-ex-deep" },
  upcoming: {
    label: "черновик",
    style: "border border-dashed border-org/50 bg-org-soft text-org-deep",
  },
};

const DOT: Readonly<Record<LectureStatus, string>> = {
  draft: "bg-org",
  read: "bg-ex",
  upcoming: "bg-org",
};

export const StatusBadge = ({ status }: { readonly status: LectureStatus }) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-sans text-[12.5px] font-semibold whitespace-nowrap ${LOOK[status].style}`}
  >
    <i className={`block size-1.75 rounded-full ${DOT[status]}`} />
    {LOOK[status].label}
  </span>
);
