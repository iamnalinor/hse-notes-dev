import { autoUpdate, flip, offset, shift, useFloating } from "@floating-ui/react-dom";
import { type FocusEvent, type MouseEvent, type PointerEvent, useEffect, useState } from "react";

const OPEN_DELAY_MS = 180;
const CLOSE_DELAY_MS = 140;

/** Closes the card on an outside press or Escape while it is open. */
const useDismiss = (
  isOpen: boolean,
  inside: readonly (Element | null)[],
  close: () => void,
): void => {
  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const onPress = (event: Event) => {
      if (inside.every((element) => element?.contains(event.target as Node) !== true)) {
        close();
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
      }
    };
    document.addEventListener("pointerdown", onPress);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPress);
      document.removeEventListener("keydown", onKey);
    };
  }, [close, inside, isOpen]);
};

type Intent = { readonly delay: number; readonly open: boolean };

/**
Hover card behaviour: mouse hover and keyboard focus open it, a first tap on a touch
screen opens it instead of following the link (the second tap follows).
*/
export const useRefPreview = () => {
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [card, setCard] = useState<HTMLElement | null>(null);
  const [intent, setIntent] = useState<Intent | undefined>(undefined);
  const [touch, setTouch] = useState(false);

  const { floatingStyles } = useFloating({
    elements: { floating: card, reference: anchor },
    middleware: [offset(8), flip(), shift({ padding: 12 })],
    open,
    placement: "bottom-start",
    strategy: "fixed",
    whileElementsMounted: autoUpdate,
  });

  // The latest intent wins: a new one replaces the pending timer (open/close with a delay).
  useEffect(() => {
    if (intent === undefined) {
      return;
    }
    const id = globalThis.setTimeout(() => {
      setOpen(intent.open);
    }, intent.delay);
    return () => {
      globalThis.clearTimeout(id);
    };
  }, [intent]);
  useDismiss(open, [anchor, card], () => {
    setOpen(false);
  });

  const schedule = (shouldOpen: boolean, delay: number) => {
    setIntent({ delay, open: shouldOpen });
  };

  const anchorProps = {
    onBlur: () => {
      schedule(false, 0);
    },
    onClick: (event: MouseEvent) => {
      if (open || !touch) {
        return;
      }

      event.preventDefault();
      setOpen(true);
    },
    onFocus: (event: FocusEvent) => {
      if (event.currentTarget.matches(":focus-visible")) {
        schedule(true, 0);
      }
    },
    onPointerDown: (event: PointerEvent) => {
      setTouch(event.pointerType === "touch");
    },
    onPointerEnter: (event: PointerEvent) => {
      if (event.pointerType === "mouse") {
        schedule(true, OPEN_DELAY_MS);
      }
    },
    onPointerLeave: (event: PointerEvent) => {
      if (event.pointerType === "mouse") {
        schedule(false, CLOSE_DELAY_MS);
      }
    },
  };

  const cardProps = {
    onPointerEnter: () => {
      schedule(true, 0);
    },
    onPointerLeave: () => {
      schedule(false, CLOSE_DELAY_MS);
    },
  };

  return { anchor, anchorProps, cardProps, floatingStyles, isOpen: open, setAnchor, setCard };
};
