import { I18n } from "../i18n/i18n";

export function renderCenterMessage(
  visible: boolean,
  i18n: I18n
): HTMLElement {
  const wrap = document.createElement("div");
  wrap.className = "comimi-center-message";
  wrap.dataset.overlay = String(visible);

  const desktop = document.createElement("div");
  desktop.className = "comimi-center-message-text comimi-center-message-desktop";
  desktop.textContent = i18n.t("overlay.centerHint.desktop");

  const mobile = document.createElement("div");
  mobile.className = "comimi-center-message-text comimi-center-message-mobile";
  mobile.textContent = i18n.t("overlay.centerHint.mobile");

  wrap.append(desktop, mobile);
  return wrap;
}
