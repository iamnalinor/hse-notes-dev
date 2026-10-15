import { useEffect, useState } from "react";

import { findById } from "./dom.ts";

/** The id of the section currently under the top of the viewport. */
export const useActiveSection = (ids: readonly string[]): string | undefined => {
  const [active, setActive] = useState<string | undefined>(undefined);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible !== undefined) {
          setActive(visible.target.id);
        }
      },
      { rootMargin: "-10% 0px -80% 0px" },
    );
    for (const id of ids) {
      const element = findById(document, id);
      if (element !== null) {
        observer.observe(element);
      }
    }
    return () => {
      observer.disconnect();
    };
  }, [ids]);

  return active;
};
