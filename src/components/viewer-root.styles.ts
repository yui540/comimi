export const viewerRootStyles = `
.comimi-root {
  --comimi-bg: #fff;
  --comimi-surface: #f7f7f7;
  --comimi-surface-2: #eeeeee;
  --comimi-fg: #333;
  --comimi-muted: #666;
  --comimi-soft: #999;
  --comimi-line: #e0e0e0;
  --comimi-shadow: 0 0 8px rgba(0, 0, 0, 0.1);
  --comimi-shadow-soft: 0 0 16px 0 rgba(0, 0, 0, 0.06);
  --comimi-shadow-focus: 0 0 24px 0 rgba(0, 0, 0, 0.14);
  --comimi-shadow-pop: 0 4px 12px rgba(0, 0, 0, 0.18);
  --comimi-glass: rgba(255, 255, 255, 0.8);
  --comimi-glass-strong: rgba(255, 255, 255, 0.8);
  --comimi-glass-mute: rgba(255, 255, 255, 0.7);
  --comimi-glass-soft: rgba(255, 255, 255, 0.5);
  --comimi-overlay-weak: rgba(0, 0, 0, 0.06);
  --comimi-white: #fff;
  --comimi-panel: #fff;
  --comimi-ink: #111;
  --comimi-surface-3: #f1f1f1;
  --comimi-faint: #aaa;
  --comimi-placeholder: #ccc;
  --comimi-handle: #bbb;
  --comimi-handle-strong: #888;
  --comimi-mascot: #fff;
  --comimi-mascot-shade: #e0e0e0;
  --comimi-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  background: var(--comimi-bg);
  color: var(--comimi-fg);
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  position: relative;
  width: calc(100% - 24px * 2);
  max-width: 900px;
  aspect-ratio: 900 / 636;
  margin: 0 auto;
  border-radius: 16px;
  box-shadow: var(--comimi-shadow-soft);
  overflow: hidden;
  user-select: none;
  -webkit-user-select: none;
  -webkit-tap-highlight-color: transparent;
  touch-action: none;
  transition:
    box-shadow 0.24s ease-out,
    background-color 0.16s linear;
}

.comimi-root *:not(.comimi-html-page):not(.comimi-html-page *) {
  user-select: none;
  -webkit-user-select: none;
}

.comimi-root:focus {
  outline: none;
  box-shadow: var(--comimi-shadow-focus);
}

@media (max-width: 767px) {
  .comimi-root {
    max-width: 500px;
    aspect-ratio: 390 / 490;
  }
}

.comimi-root[data-bg="black"] {
  --comimi-bg: #000;
}

.comimi-root[data-theme="dark"] {
  --comimi-bg: #1c1c1e;
  --comimi-surface: #2c2c2e;
  --comimi-surface-2: #3a3a3c;
  --comimi-surface-3: #323234;
  --comimi-fg: #ededed;
  --comimi-muted: #9a9a9a;
  --comimi-soft: #7e7e82;
  --comimi-faint: #6a6a6e;
  --comimi-placeholder: #555558;
  --comimi-line: #3f3f43;
  --comimi-panel: #2c2c2e;
  --comimi-glass: rgba(40, 40, 43, 0.82);
  --comimi-glass-strong: rgba(30, 30, 33, 0.92);
  --comimi-glass-mute: rgba(40, 40, 43, 0.72);
  --comimi-glass-soft: rgba(45, 45, 48, 0.78);
  --comimi-overlay-weak: rgba(255, 255, 255, 0.08);
  --comimi-handle: #555558;
  --comimi-handle-strong: #76767a;
  --comimi-mascot: #4a4a4e;
  --comimi-mascot-shade: #666;
  --comimi-shadow: 0 0 8px rgba(0, 0, 0, 0.5);
  --comimi-shadow-soft: 0 0 16px 0 rgba(0, 0, 0, 0.45);
  --comimi-shadow-focus: 0 0 24px 0 rgba(0, 0, 0, 0.6);
  --comimi-shadow-pop: 0 4px 12px rgba(0, 0, 0, 0.6);
}

.comimi-root[data-bg="black"][data-theme="dark"] {
  --comimi-bg: #000;
}

.comimi-root[data-layout="wide"] {
  width: 100%;
  max-width: none;
  aspect-ratio: auto;
  min-height: 450px;
  max-height: 85vh;
  margin: 0;
  border-radius: 0;
  box-shadow: none;
}

.comimi-root[data-layout="browserFullscreen"],
.comimi-root[data-layout="nativeFullscreen"] {
  position: fixed;
  inset: 0;
  z-index: 999;
  width: 100vw;
  height: 100dvh;
  max-width: none;
  aspect-ratio: auto;
  margin: 0;
  border-radius: 0;
  box-shadow: none;
}

.comimi-resize-handle {
  position: relative;
  width: 100%;
  height: 20px;
  background: var(--comimi-panel, #fff);
  cursor: ns-resize;
  touch-action: none;
}

.comimi-resize-handle::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 3px;
  border-radius: 999px;
  background: var(--comimi-handle, #bbb);
  transition:
    width 0.36s cubic-bezier(0.34, 1.56, 0.64, 1),
    height 0.36s cubic-bezier(0.34, 1.56, 0.64, 1),
    background-color 0.2s linear;
}

@media (hover: hover) {
  .comimi-resize-handle:hover::after {
    width: 52px;
    height: 5px;
    background: var(--comimi-handle-strong, #888);
  }
}

`;
