export const viewModeSwitcherStyles = `
.comimi-view-switcher {
  position: relative;
  display: grid;
  grid-template-columns: repeat(3, 42px);
  width: 126px;
  border-radius: 12px;
  background: var(--comimi-surface-2);
}

.comimi-view-switcher-indicator {
  position: absolute;
  top: 0;
  left: 0;
  width: 42px;
  height: 100%;
  border-radius: 12px;
  background: var(--comimi-muted);
  transition: transform 0.36s var(--comimi-spring);
}

.comimi-view-switcher-button {
  position: relative;
  display: grid;
  justify-items: center;
  align-content: center;
  height: 36px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--comimi-muted);
  cursor: pointer;
  transition: color 0.2s linear;
}

.comimi-view-switcher-button[data-selected="true"] {
  color: var(--comimi-white);
}

.comimi-view-switcher-icon-wrap {
  width: 18px;
  height: 18px;
  transform-origin: center bottom;
}

.comimi-view-switcher-icon {
  display: block;
  width: 100%;
  height: 100%;
  color: currentColor;
}

.comimi-view-switcher-icon-wrap.comimi-pop-animate {
  animation: comimi-pop 0.5s ease-in-out 0.1s both;
}
`;
