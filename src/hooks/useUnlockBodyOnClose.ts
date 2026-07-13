import { useEffect } from "react";

/**
 * Radix Dialog/Sheet/AlertDialog sets `pointer-events: none` on <body> while
 * open. If the component unmounts (or its `open` state flips) at the same
 * moment as a nested Radix portal (Select, Popover, DropdownMenu) is
 * closing, the cleanup that restores body pointer-events can be skipped,
 * leaving the whole app unresponsive until a manual reload.
 *
 * This clears the leftover style shortly after our own dialog closes, but
 * only if no other Radix dialog/overlay is still legitimately open.
 */
export function useUnlockBodyOnClose(open: boolean | undefined) {
  useEffect(() => {
    if (open) return;

    const timer = setTimeout(() => {
      const stillOpen = document.querySelector(
        '[role="dialog"][data-state="open"], [role="alertdialog"][data-state="open"]',
      );
      if (!stillOpen && document.body.style.pointerEvents === "none") {
        document.body.style.pointerEvents = "";
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [open]);
}
