/**
 * ============================================================
 * Lightbox — Types
 * ============================================================
 */

import type { HTMLAttributes, ButtonHTMLAttributes } from "react";

export interface UseLightboxOptions {
  totalItems: number;
  index: number | null;
  onIndexChange: (next: number | null) => void;
  enableKeyboard?: boolean;
  closeOnEscape?: boolean;
}

export type OverlayProps = HTMLAttributes<HTMLElement>;
export type ContentProps = HTMLAttributes<HTMLElement>;
export type LightboxButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;
export type NavButtonProps = LightboxButtonProps & { disabled: boolean };

export interface UseLightboxReturn {
  isOpen: boolean;
  currentIndex: number | null;
  next: () => void;
  prev: () => void;
  close: () => void;
  open: (index: number) => void;
  hasNext: boolean;
  hasPrev: boolean;

  getOverlayProps: (userProps?: OverlayProps) => OverlayProps;
  getContentProps: (userProps?: ContentProps) => ContentProps;
  getCloseButtonProps: (userProps?: LightboxButtonProps) => LightboxButtonProps;
  getNextButtonProps: (userProps?: LightboxButtonProps) => NavButtonProps;
  getPrevButtonProps: (userProps?: LightboxButtonProps) => NavButtonProps;
}
