import { MoonIcon, SunIcon } from "#web/shared/ui/icons.tsx";

import { setTheme, useTheme } from "./theme.ts";

export const ThemeToggle = () => {
  const theme = useTheme();
  const isDark = theme === "dark";
  return (
    <button
      aria-label={isDark ? "Светлая тема" : "Тёмная тема"}
      className="flex size-10 cursor-pointer items-center justify-center rounded-lg border border-rule bg-card text-ink"
      onClick={() => {
        setTheme(isDark ? "light" : "dark");
      }}
      type="button"
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
};
