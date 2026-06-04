import { arrowButtonsStyles } from "../components/arrow-buttons.styles";
import { centerMessageStyles } from "../components/center-message.styles";
import { controlsDockStyles } from "../components/controls-dock.styles";
import { errorIconStyles } from "../components/error-icon.styles";
import { iconStyles } from "../components/icons.styles";
import { inputsStyles } from "../components/inputs.styles";
import { loadingIconStyles } from "../components/loading-icon.styles";
import { menuPanelStyles } from "../components/menu-panel.styles";
import { moveDirectionGuideStyles } from "../components/move-direction-guide.styles";
import { notificationsStyles } from "../components/notifications.styles";
import { pageStageStyles } from "../components/page-stage.styles";
import { rabbitMascotStyles } from "../components/rabbit-mascot.styles";
import { scrollFadeStyles } from "../components/scroll-fade.styles";
import { settingsPanelStyles } from "../components/settings-panel.styles";
import { splashScreenStyles } from "../components/splash-screen.styles";
import { tooltipStyles } from "../components/tooltip.styles";
import { viewerRootStyles } from "../components/viewer-root.styles";
import { viewModeSwitcherStyles } from "../components/view-mode-switcher.styles";

let inserted = false;

const viewerStyles = [
  viewerRootStyles,
  iconStyles,
  tooltipStyles,
  pageStageStyles,
  loadingIconStyles,
  errorIconStyles,
  arrowButtonsStyles,
  centerMessageStyles,
  moveDirectionGuideStyles,
  viewModeSwitcherStyles,
  controlsDockStyles,
  inputsStyles,
  settingsPanelStyles,
  menuPanelStyles,
  notificationsStyles,
  rabbitMascotStyles,
  splashScreenStyles,
  scrollFadeStyles
].join("\n");

export function ensureViewerStyles(): void {
  if (inserted || typeof document === "undefined") {
    return;
  }

  const style = document.createElement("style");
  style.dataset.comimiViewer = "true";
  style.textContent = viewerStyles;
  document.head.append(style);
  inserted = true;
}
