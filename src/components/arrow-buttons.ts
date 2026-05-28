import { icon } from "./icons";
import type { RendererCallbacks } from "../renderer/renderer-callbacks";
import type { ReadingDirection, ViewerState } from "../types";

export interface ArrowButtonsOptions {
  state: ViewerState;
  callbacks: RendererCallbacks;
}

export function renderArrowButtons({
  state,
  callbacks
}: ArrowButtonsOptions): HTMLElement {
  const fragment = document.createElement("div");
  fragment.className = "comimi-arrows";
  fragment.dataset.overlay = String(state.overlayVisible);
  fragment.dataset.autoplay = String(state.autoPageTurnEnabled);

  fragment.append(
    renderArrowButton("prev", () => moveFromSide(state, callbacks, "left")),
    renderArrowButton("next", () => moveFromSide(state, callbacks, "right"))
  );

  return fragment;
}

function renderArrowButton(
  variant: "prev" | "next",
  onClick: () => void
): HTMLButtonElement {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `comimi-arrow-button comimi-arrow-${variant}`;
  button.setAttribute(
    "aria-label",
    variant === "next" ? "Next page" : "Previous page"
  );
  button.addEventListener("click", (event) => {
    event.stopPropagation();
    onClick();
  });

  const inner = document.createElement("span");
  inner.className = "comimi-arrow-inner";

  const bg = document.createElement("span");
  bg.className = "comimi-arrow-bg";

  const arrowIcon = icon("arrow");
  arrowIcon.classList.add("comimi-arrow-icon");

  inner.append(bg, arrowIcon);
  button.append(inner);
  return button;
}

function moveFromSide(
  state: ViewerState,
  callbacks: RendererCallbacks,
  side: "left" | "right"
): void {
  const isNext = isNextSide(side, state.settings.readingDirection);
  isNext ? callbacks.nextPage() : callbacks.previousPage();
}

function isNextSide(
  side: "left" | "right",
  direction: ReadingDirection
): boolean {
  return direction === "rtl" ? side === "left" : side === "right";
}
