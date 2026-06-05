import { I18n } from "../i18n/i18n";
import type { MascotOption } from "../types";
import { buildMascotNode } from "./mascot";

const ERROR_SVG = `
<svg viewBox="0 0 112.19 99.01" class="comimi-error-svg" xmlns="http://www.w3.org/2000/svg">
  <g>
    <path class="comimi-error-stroke" d="M17.43,53.54c-7.74,7.51-12.43,17.29-12.43,27.99,0,4.34.78,8.53,2.21,12.48" />
    <path class="comimi-error-stroke" d="M104.98,94.01c1.43-3.95,2.21-8.14,2.21-12.48,0-10.91-4.87-20.85-12.87-28.42" />
    <path class="comimi-error-stroke comimi-error-mimi comimi-error-mimi-left" d="M55.79,43.81v-24.02c3.43-9.18,9.81-15.08,20.52-14.52,16.12.84,20.31,15.9,19.35,34.15-.25,4.75-.69,9.25-1.51,13.3" />
    <path class="comimi-error-stroke comimi-error-mimi comimi-error-mimi-right" d="M55.79,43.62v-24.02c-3.25-9.2-9.34-15.11-19.78-14.56-16.53.87-21.21,15.95-20.25,34.2.26,4.91.67,9.56,1.51,13.72" />
    <path fill="#fff" d="M80.44,49.41H31.46c-12.97,6.71-21.6,18.57-21.6,32.1,0,5.8,1.59,11.3,4.43,16.21h83.34c2.83-4.92,4.43-10.41,4.43-16.21,0-13.53-8.63-25.4-21.6-32.1Z" />
    <g class="comimi-error-eyes">
      <path class="comimi-error-eye" d="M45.85,75.85c1.92,1.92,1.92,5.05,0,6.97s-5.05,1.92-6.97,0l-1.74-1.74-1.74,1.74c-1.92,1.92-5.05,1.92-6.97,0-1.92-1.92-1.92-5.05,0-6.97l1.74-1.74-1.74-1.74c-1.92-1.92-1.92-5.05,0-6.97s5.05-1.92,6.97,0l1.74,1.74,1.74-1.74c1.92-1.92,5.05-1.92,6.97,0,1.93,1.92,1.93,5.05,0,6.97l-1.74,1.74,1.74,1.74Z" />
      <path class="comimi-error-eye" d="M77.89,75.85c1.92,1.92,1.92,5.05,0,6.97-1.92,1.92-5.05,1.92-6.97,0l-1.74-1.74-1.74,1.74c-1.92,1.92-5.05,1.92-6.97,0-1.92-1.92-1.92-5.05,0-6.97l1.74-1.74-1.74-1.74c-1.92-1.92-1.92-5.05,0-6.97,1.92-1.92,5.05-1.92,6.97,0l1.74,1.74,1.74-1.74c1.92-1.92,5.05-1.92,6.97,0,1.92,1.92,1.92,5.05,0,6.97l-1.74,1.74,1.74,1.74Z" />
    </g>
  </g>
</svg>
`;

export function renderErrorIcon(
  i18n: I18n,
  pageNumber: number,
  mascot?: MascotOption
): HTMLElement {
  const wrap = document.createElement("div");
  wrap.className = "comimi-error-icon";

  const svgWrap = document.createElement("div");
  svgWrap.className = "comimi-error-icon-svg";

  // カスタム指定があればアイコンだけ差し替える（下のテキストはそのまま残す）。
  const customNode = mascot ? buildMascotNode(mascot) : null;
  if (customNode) {
    svgWrap.append(customNode);
  } else {
    svgWrap.innerHTML = ERROR_SVG;
  }

  const text = document.createElement("div");
  text.className = "comimi-error-icon-text";
  text.textContent = i18n.t("error.pageRequestFailed", { page: pageNumber });

  wrap.append(svgWrap, text);
  return wrap;
}
