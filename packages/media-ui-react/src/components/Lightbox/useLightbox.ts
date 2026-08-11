/**
 * ============================================================
 * useLightbox — Headless modal viewer with keyboard nav
 * ============================================================
 */

import { useCallback, type MouseEvent } from "react";
import { useKeyDown, useLockBodyScroll } from "../../hooks";
import { callAll } from "../../utils";
import type {
  UseLightboxOptions,
  UseLightboxReturn,
  OverlayProps,
  ContentProps,
  LightboxButtonProps,
  NavButtonProps,
} from "./types";

export function useLightbox(options: UseLightboxOptions): UseLightboxReturn {
  const {
    totalItems,
    index,
    onIndexChange,
    enableKeyboard = true,
    closeOnEscape = true,
  } = options;

  const isOpen = index !== null;
  const hasNext = isOpen && (index as number) < totalItems - 1;
  const hasPrev = isOpen && (index as number) > 0;

  const close = useCallback(() => onIndexChange(null), [onIndexChange]);

  const next = useCallback(() => {
    if (index === null) return;
    if (index < totalItems - 1) onIndexChange(index + 1);
  }, [index, totalItems, onIndexChange]);

  const prev = useCallback(() => {
    if (index === null) return;
    if (index > 0) onIndexChange(index - 1);
  }, [index, onIndexChange]);

  const open = useCallback(
    (i: number) => {
      if (i >= 0 && i < totalItems) onIndexChange(i);
    },
    [totalItems, onIndexChange]
  );

  useKeyDown((e) => {
    if (!isOpen) return;
    if (e.key === "ArrowRight") {
      e.preventDefault();
      next();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      prev();
    } else if (e.key === "Escape" && closeOnEscape) {
      e.preventDefault();
      close();
    }
  }, enableKeyboard && isOpen);

  useLockBodyScroll(isOpen);

  // ─── Prop getters ─────────────────────────────────────────

  const overlayClick = (e: MouseEvent<HTMLElement>) => {
    if (e.target === e.currentTarget) close();
  };

  const getOverlayProps = (userProps?: OverlayProps): OverlayProps => ({
    role: "dialog",
    "aria-modal": true,
    "aria-label": "Media viewer",
    ...userProps,
    onClick: callAll(userProps?.onClick, overlayClick),
  });

  const getContentProps = (userProps?: ContentProps): ContentProps => ({
    role: "document",
    tabIndex: -1,
    ...userProps,
  });

  const getCloseButtonProps = (
    userProps?: LightboxButtonProps
  ): LightboxButtonProps => ({
    ...userProps,
    type: "button",
    "aria-label": "Close",
    onClick: callAll(userProps?.onClick, close),
  });

  const getNextButtonProps = (
    userProps?: LightboxButtonProps
  ): NavButtonProps => ({
    ...userProps,
    type: "button",
    "aria-label": "Next",
    disabled: !hasNext,
    onClick: callAll(userProps?.onClick, next),
  });

  const getPrevButtonProps = (
    userProps?: LightboxButtonProps
  ): NavButtonProps => ({
    ...userProps,
    type: "button",
    "aria-label": "Previous",
    disabled: !hasPrev,
    onClick: callAll(userProps?.onClick, prev),
  });

  return {
    isOpen,
    currentIndex: index,
    next,
    prev,
    close,
    open,
    hasNext,
    hasPrev,
    getOverlayProps,
    getContentProps,
    getCloseButtonProps,
    getNextButtonProps,
    getPrevButtonProps,
  };
}
