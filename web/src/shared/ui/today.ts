import { useMemo } from "react";

import { todayIso } from "#web/domain/dates.ts";

/** Today's date (ISO) for the lifetime of the page. */
export const useToday = (): string => useMemo(() => todayIso(new Date()), []);
