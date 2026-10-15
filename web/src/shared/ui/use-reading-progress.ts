import { useSyncExternalStore } from "react";

const subscribe = (listener: () => void): (() => void) => {
  window.addEventListener("scroll", listener, { passive: true });
  window.addEventListener("resize", listener);
  return () => {
    window.removeEventListener("scroll", listener);
    window.removeEventListener("resize", listener);
  };
};

/** Whole percent scrolled; an integer snapshot keeps re-renders rare. */
const snapshot = (): number => {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  return scrollable <= 0
    ? 0
    : Math.round(Math.min(1, Math.max(0, window.scrollY / scrollable)) * 100);
};

/** Scroll position of the page as a 0…1 fraction. */
export const useReadingProgress = (): number => useSyncExternalStore(subscribe, snapshot) / 100;
