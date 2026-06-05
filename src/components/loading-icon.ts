import { I18n } from "../i18n/i18n";
import type { MascotOption } from "../types";
import { buildMascotNode } from "./mascot";

const LOADING_SVG = `
<svg viewBox="0 0 112.19 99.01" class="comimi-loading-svg" xmlns="http://www.w3.org/2000/svg">
  <g>
    <path class="comimi-loading-stroke" d="M17.43,53.54c-7.74,7.51-12.43,17.29-12.43,27.99,0,4.34.78,8.53,2.21,12.48" />
    <path class="comimi-loading-stroke" d="M104.98,94.01c1.43-3.95,2.21-8.14,2.21-12.48,0-10.91-4.87-20.85-12.87-28.42" />
    <path class="comimi-loading-stroke comimi-loading-mimi comimi-loading-mimi-left" d="M55.79,43.81v-24.02c3.43-9.18,9.81-15.08,20.52-14.52,16.12.84,20.31,15.9,19.35,34.15-.25,4.75-.69,9.25-1.51,13.3" />
    <path class="comimi-loading-stroke comimi-loading-mimi comimi-loading-mimi-right" d="M55.79,43.62v-24.02c-3.25-9.2-9.34-15.11-19.78-14.56-16.53.87-21.21,15.95-20.25,34.2.26,4.91.67,9.56,1.51,13.72" />
    <path fill="#fff" d="M80.44,49.41H31.46c-12.97,6.71-21.6,18.57-21.6,32.1,0,5.8,1.59,11.3,4.43,16.21h83.34c2.83-4.92,4.43-10.41,4.43-16.21,0-13.53-8.63-25.4-21.6-32.1Z" />
    <g class="comimi-loading-eyes">
      <circle class="comimi-loading-eye" cx="40.17" cy="78.21" r="6" />
      <circle class="comimi-loading-eye" cx="71.58" cy="78.21" r="6" />
    </g>
  </g>
</svg>
`;

const LOOP_INTERVAL_MS = 3000;

export function renderLoadingIcon(
  i18n: I18n,
  mascot?: MascotOption
): HTMLElement {
  const wrap = document.createElement("div");
  wrap.className = "comimi-loading-icon";

  const svgWrap = document.createElement("div");
  svgWrap.className = "comimi-loading-icon-svg";

  // カスタム指定があればアイコンだけ差し替える（下のテキストはそのまま残す）。
  const customNode = mascot ? buildMascotNode(mascot) : null;
  if (customNode) {
    svgWrap.append(customNode);
  } else {
    svgWrap.innerHTML = LOADING_SVG;
  }

  const text = document.createElement("div");
  text.className = "comimi-loading-icon-text";
  text.append(document.createTextNode(i18n.t("loading")));
  for (let index = 0; index < 3; index += 1) {
    const dot = document.createElement("span");
    dot.textContent = ".";
    text.append(dot);
  }

  wrap.append(svgWrap, text);

  // デフォルトSVGのときだけ、ループ間隔ごとに再描画してアニメーションを再生する。
  if (!customNode) {
    const timer = window.setInterval(() => {
      if (!wrap.isConnected) {
        window.clearInterval(timer);
        return;
      }
      svgWrap.innerHTML = LOADING_SVG;
    }, LOOP_INTERVAL_MS);
  }

  return wrap;
}
