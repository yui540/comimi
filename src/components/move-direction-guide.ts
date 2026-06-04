import { I18n } from "../i18n/i18n";
import type { ReadingDirection } from "../types";

export function renderMoveDirectionGuide(
  readingDirection: ReadingDirection,
  visible: boolean,
  i18n: I18n
): HTMLElement {
  const wrap = document.createElement("div");
  wrap.className = "comimi-move-guide";
  wrap.dataset.visible = String(visible);

  const arrowWrap = document.createElement("div");
  arrowWrap.className = "comimi-move-guide-arrow-wrap";

  const arrow = document.createElement("div");
  arrow.className = "comimi-move-guide-arrow";
  // 進行方向: rtl は左へ進む（左向き矢印）、ltr は右へ進む（右向き矢印）。
  arrow.dataset.direction = readingDirection === "rtl" ? "left" : "right";

  const icon = document.createElement("div");
  icon.className = "comimi-move-guide-arrow-icon";
  arrow.append(icon);
  arrowWrap.append(arrow);

  const text = document.createElement("div");
  text.className = "comimi-move-guide-text";
  text.textContent = i18n.t("overlay.moveDirection");

  wrap.append(arrowWrap, text);
  return wrap;
}
