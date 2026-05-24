export const settingsPanelStyles = `
.comimi-settings-panel {
  position: absolute;
  top: 0;
  right: -16px;
  width: 250px;
  height: 0;
  border-radius: 20px;
  overflow: hidden;
  background: var(--comimi-glass-strong);
  box-shadow: var(--comimi-shadow);
  backdrop-filter: blur(5px);
  opacity: 0;
  transform: translateY(calc(-100% - 8px));
  transition:
    height 0.38s cubic-bezier(0.12, 1.06, 0.56, 1.02),
    opacity 0.38s cubic-bezier(0.12, 1.06, 0.56, 1.02);
  z-index: 10;
}

.comimi-settings-panel[data-open="true"] {
  opacity: 1;
  height: var(--comimi-settings-height, 460px);
}

.comimi-settings-panel-body {
  position: relative;
  width: 100%;
}

.comimi-settings-panel-inner {
  box-sizing: border-box;
  position: relative;
  padding: 16px 20px 22px;
}

.comimi-settings-panel-title {
  color: #333;
  font-size: 14px;
  font-weight: 700;
  text-align: center;
}

.comimi-settings-section {
  display: grid;
  row-gap: 8px;
  margin-top: 18px;
}

.comimi-settings-label {
  color: #333;
  font-size: 12px;
  font-weight: 400;
}

@media (max-width: 767px) {
  .comimi-settings-panel-body {
    max-height: calc(var(--view-height, 100vh) - 62px - 56px);
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }
}
`;
