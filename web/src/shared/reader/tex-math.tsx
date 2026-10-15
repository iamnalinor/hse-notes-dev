import { render } from "katex";
import { useLayoutEffect, useRef } from "react";

import { useMacros } from "#web/api/queries.ts";

type Props = { readonly display: boolean; readonly tex: string };

/** KaTeX renders straight into the span: React never owns its children. */
export const TexMath = ({ display, tex }: Props) => {
  const macros = useMacros();
  const ref = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    if (ref.current !== null) {
      render(tex, ref.current, {
        displayMode: display,
        // KaTeX mutates the macro table (\gdef), so every call gets its own copy.
        macros: { ...macros },
        strict: "ignore",
        throwOnError: false,
      });
    }
  }, [display, macros, tex]);

  return <span className={display ? "math-display" : "math-inline"} ref={ref} />;
};
