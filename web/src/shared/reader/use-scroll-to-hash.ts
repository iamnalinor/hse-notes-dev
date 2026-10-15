import { useEffect } from "react";
import { useLocation } from "react-router";

import { findById } from "#web/shared/ui/dom.ts";

const flash = (target: Element): void => {
  // A section is too big to light up: flash its heading instead.
  const element = target.tagName === "SECTION" ? (target.firstElementChild ?? target) : target;
  element.classList.remove("flash");
  element.getBoundingClientRect(); // restart the animation when the same anchor is hit twice
  element.classList.add("flash");
  element.addEventListener(
    "animationend",
    () => {
      element.classList.remove("flash");
    },
    { once: true },
  );
};

/** After navigation to `#anchor`: open folded proofs around it, scroll to it, highlight it. */
export const useScrollToHash = (): void => {
  const { hash, key } = useLocation();
  useEffect(() => {
    const target = hash === "" ? null : findById(document, decodeURIComponent(hash.slice(1)));
    if (target === null) {
      return;
    }
    for (
      let node = target.closest("details");
      node !== null;
      node = node.parentElement?.closest("details") ?? null
    ) {
      node.open = true;
    }
    target.scrollIntoView({ block: "start" });
    flash(target);
  }, [hash, key]);
};
