export const menuPanelStyles = `
.comimi-menu-panel {
  position: absolute;
  top: 24px;
  left: 24px;
  width: 500px;
  z-index: 5;
  pointer-events: auto;
  transition:
    transform 0.6s var(--comimi-spring),
    opacity 0.3s linear;
}

.comimi-menu-panel[data-overlay="false"] {
  transform: translateY(-35px);
  opacity: 0;
  pointer-events: none;
  transition:
    transform 0.3s var(--comimi-spring),
    opacity 0.15s linear;
}

.comimi-menu-bg {
  position: absolute;
  inset: 0;
  border-radius: 16px;
  background: var(--comimi-glass);
  box-shadow: var(--comimi-shadow);
  backdrop-filter: blur(5px);
  transition: inset 0.36s var(--comimi-spring);
}

@media (hover: hover) {
  .comimi-menu-panel:hover > .comimi-menu-bg {
    inset: -5px;
  }
}

.comimi-menu-top {
  position: relative;
  display: grid;
  grid-template-columns: auto 1fr;
  column-gap: 13px;
  align-items: center;
  box-sizing: border-box;
  width: 100%;
  height: 62px;
  padding: 0 13px;
  border: 0;
  background: transparent;
  color: inherit;
  text-align: left;
  cursor: pointer;
}

/* マスコット（右上 20px + 幅 50px）にタイトルが重ならないよう右側を空ける */
.comimi-menu-panel[data-mascot="true"] .comimi-menu-top {
  padding-right: 78px;
}

.comimi-menu-button {
  position: relative;
  width: 34px;
  height: 34px;
  overflow: hidden;
}

.comimi-menu-button-inner {
  display: block;
  position: absolute;
  inset: 0;
  transition: transform 0.4s var(--comimi-spring);
}

.comimi-menu-panel[data-open="true"] .comimi-menu-button-inner {
  transform: translateY(100%);
}

.comimi-menu-button-inner > * {
  position: absolute;
  inset: 0;
}

.comimi-menu-button-inner > *:nth-child(2) {
  transform: translateY(-100%);
}

.comimi-menu-title-wrap {
  position: relative;
  display: block;
  min-width: 0;
  overflow: hidden;
}

.comimi-menu-title-inner {
  position: relative;
  display: block;
  transition: transform 0.4s var(--comimi-spring);
}

.comimi-menu-panel:not([data-view="menu"]) .comimi-menu-title-inner {
  transform: translateY(-100%);
}

.comimi-menu-title-main {
  display: block;
  min-width: 0;
}

.comimi-menu-title-detail {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  transform: translateY(100%);
  color: var(--comimi-fg);
  font-size: 15px;
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.comimi-menu-title {
  display: block;
  width: 100%;
  color: var(--comimi-fg);
  font-size: 15px;
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.comimi-menu-author {
  display: block;
  width: 100%;
  color: var(--comimi-muted);
  font-size: 12px;
  font-weight: 400;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.comimi-menu-bottom {
  position: relative;
  width: 100%;
  overflow: hidden;
  transition: height 0.24s ease-in-out;
}

.comimi-menu-border {
  width: 100%;
  height: 1px;
  background: var(--comimi-line);
}

.comimi-menu-view {
  position: absolute;
  top: 1px;
  left: 0;
  width: 100%;
  transition: all 0.28s ease-in-out;
  opacity: 0;
  visibility: hidden;
  transform: scale(0.92);
  filter: blur(5px);
}

.comimi-menu-view-menu {
  position: relative;
}

.comimi-menu-panel[data-view="menu"] .comimi-menu-view-menu,
.comimi-menu-panel[data-view="shortcut"] .comimi-menu-view-shortcut,
.comimi-menu-panel[data-view="pageList"] .comimi-menu-view-page-list,
.comimi-menu-panel[data-view="favorites"] .comimi-menu-view-favorites,
.comimi-menu-panel[data-view="share"] .comimi-menu-view-share,
.comimi-menu-panel[data-view="about"] .comimi-menu-view-about {
  opacity: 1;
  visibility: visible;
  transform: scale(1);
  filter: blur(0);
}

.comimi-menu-list {
  position: relative;
  width: 100%;
  padding: 10px 0;
}

.comimi-menu-link {
  box-sizing: border-box;
  display: grid;
  grid-template-columns: 1fr auto;
  column-gap: 8px;
  align-items: center;
  width: 100%;
  padding: 10px 16px 10px 22px;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: var(--comimi-muted);
  cursor: pointer;
  transition: background-color 0.24s linear;
}

.comimi-menu-link:hover {
  background: var(--comimi-surface-3);
}

.comimi-menu-link-text {
  color: var(--comimi-muted);
  font-size: 14px;
  font-weight: 700;
  line-height: 1.45;
  text-align: left;
}

.comimi-menu-link-arrow {
  display: block;
  width: 20px;
  height: 20px;
  color: var(--comimi-faint);
}

.comimi-menu-link-arrow > svg {
  display: block;
  width: 100%;
  height: 100%;
}

.comimi-page-list-head {
  display: grid;
  grid-template-columns: auto 1fr;
  column-gap: 14px;
  align-items: center;
  padding: 0 0 16px;
}

.comimi-page-list-cover {
  position: relative;
  display: block;
  width: 50px;
  height: 70px;
  border-radius: 6px;
  background: var(--comimi-panel);
  outline: 3px solid var(--comimi-line);
  box-shadow: var(--comimi-shadow);
  overflow: hidden;
}

.comimi-page-list-cover img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  user-select: none;
  -webkit-user-drag: none;
}

.comimi-page-list-head-body {
  display: grid;
  row-gap: 2px;
  min-width: 0;
}

.comimi-page-list-head-title {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  color: var(--comimi-fg);
  font-size: 15px;
  font-weight: 700;
  line-height: 1.35;
  overflow-wrap: anywhere;
}

.comimi-page-list-head-author {
  color: var(--comimi-muted);
  font-size: 12px;
  font-weight: 400;
  line-height: 1.45;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.comimi-page-list-head-count {
  color: var(--comimi-faint);
  font-size: 11px;
  font-weight: 700;
  line-height: 1.45;
}

.comimi-page-list-inner {
  box-sizing: border-box;
  padding: 0 16px;
  max-height: 315px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.comimi-page-list-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.comimi-page-list-item {
  display: grid;
  row-gap: 4px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--comimi-muted);
  cursor: pointer;
  text-align: center;
}

.comimi-page-list-thumb {
  position: relative;
  display: block;
  width: 100%;
  aspect-ratio: 100 / 141;
  background: var(--comimi-panel);
  border-radius: 6px;
  outline: 3px solid var(--comimi-line);
}

.comimi-page-list-badge {
  position: absolute;
  top: 4px;
  left: 4px;
  z-index: 1;
  box-sizing: border-box;
  min-width: 20px;
  padding: 2px 6px;
  border-radius: 999px;
  background: var(--comimi-glass);
  box-shadow: var(--comimi-shadow);
  backdrop-filter: blur(5px);
  color: var(--comimi-muted);
  font-size: 10px;
  font-weight: 700;
  line-height: 1.4;
  text-align: center;
  pointer-events: none;
}

.comimi-page-list-heart {
  position: absolute;
  top: -6px;
  right: -6px;
  z-index: 1;
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--comimi-muted);
  box-shadow: var(--comimi-shadow);
  color: var(--comimi-white);
  opacity: 0;
  transform: scale(0.4);
  transition:
    opacity 0.2s linear,
    transform 0.36s var(--comimi-spring);
  pointer-events: none;
}

.comimi-page-list-heart > svg {
  width: 14px;
  height: 14px;
  transform: translateY(1px);
}

.comimi-page-list-item[data-favorite="true"] .comimi-page-list-heart {
  opacity: 1;
  transform: scale(1);
}

.comimi-favorite-item {
  position: relative;
}

.comimi-favorite-remove {
  position: absolute;
  top: -6px;
  right: -6px;
  z-index: 2;
  width: 22px;
  height: 22px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: var(--comimi-muted);
  box-shadow: var(--comimi-shadow);
  cursor: pointer;
  transition: transform 0.36s var(--comimi-spring);
}

@media (hover: hover) {
  .comimi-favorite-remove:hover {
    transform: scale(1.15);
  }
}

.comimi-favorite-remove::before,
.comimi-favorite-remove::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 10px;
  height: 2px;
  border-radius: 999px;
  background: var(--comimi-white);
}

.comimi-favorite-remove::before {
  transform: translate(-50%, -50%) rotate(45deg);
}

.comimi-favorite-remove::after {
  transform: translate(-50%, -50%) rotate(-45deg);
}

.comimi-favorite-open {
  position: relative;
  display: block;
  margin-top: 6px;
  padding: 5px 4px;
  color: var(--comimi-muted);
  font-size: 10px;
  font-weight: 700;
  line-height: 1.2;
  text-align: center;
  text-decoration: none;
}

.comimi-favorite-open-bg {
  position: absolute;
  inset: 0;
  border-radius: 999px;
  background: var(--comimi-surface-2);
  transition: inset 0.36s var(--comimi-spring);
}

@media (hover: hover) {
  .comimi-favorite-open:hover .comimi-favorite-open-bg {
    inset: -3px;
  }
}

.comimi-favorite-open-text {
  position: relative;
}

.comimi-favorites-inner {
  box-sizing: border-box;
  padding: 0 16px;
  max-height: 315px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.comimi-favorites-description {
  margin: 0;
  padding: 0 6px 14px;
  color: var(--comimi-muted);
  font-size: 12px;
  font-weight: 400;
  line-height: 1.6;
}

.comimi-favorites-empty {
  display: grid;
  justify-items: center;
  row-gap: 8px;
  padding: 12px 0 24px;
  color: var(--comimi-faint);
  font-size: 12px;
  font-weight: 700;
  line-height: 1.45;
  text-align: center;
}

.comimi-favorites-empty > svg {
  width: 28px;
  height: 28px;
  color: var(--comimi-placeholder);
}

.comimi-favorites-empty[hidden],
.comimi-favorites-inner .comimi-page-list-grid[hidden] {
  display: none;
}

.comimi-page-list-thumb-html {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  padding: 8px;
  text-align: center;
  color: var(--comimi-faint);
  font-size: 13px;
  font-weight: 700;
  line-height: 1.4;
}

.comimi-page-list-thumb img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 4px;
  user-select: none;
  -webkit-user-drag: none;
}

.comimi-page-list-text {
  color: var(--comimi-muted);
  font-size: 14px;
  font-weight: 700;
}

.comimi-shortcut-inner {
  box-sizing: border-box;
  padding: 0 22px;
  max-height: 315px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.comimi-shortcut-grid {
  display: grid;
  row-gap: 22px;
}

.comimi-shortcut-section {
  display: grid;
  row-gap: 8px;
}

.comimi-shortcut-heading {
  color: var(--comimi-muted);
  font-size: 12px;
  font-weight: 700;
  line-height: 1.45;
}

.comimi-shortcut-list {
  display: grid;
  row-gap: 8px;
  justify-items: start;
}

.comimi-shortcut-column {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
  align-items: center;
}

.comimi-shortcut-item {
  display: grid;
  grid-template-columns: repeat(2, auto);
  column-gap: 8px;
  align-items: center;
  width: fit-content;
}

.comimi-shortcut-badge {
  display: grid;
  grid-auto-flow: column;
  column-gap: 6px;
  align-items: center;
  padding: 4px 8px;
  border-radius: 7px;
  background: var(--comimi-surface-2);
}

.comimi-shortcut-key {
  color: var(--comimi-muted);
  font-size: 13px;
  font-weight: 700;
  line-height: 1.45;
}

.comimi-shortcut-or::before {
  content: "or";
  display: block;
  color: var(--comimi-muted);
  font-size: 11px;
  font-weight: 400;
  line-height: 1.45;
}

.comimi-shortcut-label {
  color: var(--comimi-muted);
  font-size: 13px;
  font-weight: 400;
  line-height: 1.45;
}

.comimi-share-inner {
  display: grid;
  row-gap: 12px;
  box-sizing: border-box;
  padding: 16px 22px 8px;
}

.comimi-share-field {
  display: grid;
  grid-template-columns: 1fr auto;
  column-gap: 8px;
  align-items: center;
}

.comimi-share-url {
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  margin: 0;
  padding: 8px 12px;
  border: 0;
  border-radius: 8px;
  background: var(--comimi-surface-2);
  color: var(--comimi-fg);
  font: inherit;
  font-size: 12px;
  line-height: 1.45;
  outline: none;
  text-overflow: ellipsis;
  user-select: text;
  -webkit-user-select: text;
}

.comimi-share-url::selection {
  background: var(--comimi-muted);
  color: var(--comimi-white);
}

.comimi-share-copy {
  position: relative;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
}

.comimi-share-copy-bg {
  position: absolute;
  inset: 0;
  border-radius: 8px;
  background: var(--comimi-muted);
  transition: inset 0.36s var(--comimi-spring), border-radius 0.36s var(--comimi-spring);
}

@media (hover: hover) {
  .comimi-share-copy:hover .comimi-share-copy-bg {
    inset: -3px;
    border-radius: 10px;
  }
}

.comimi-share-copy-text {
  position: relative;
  display: block;
  padding: 8px 14px;
  color: var(--comimi-white);
  font-size: 12px;
  font-weight: 700;
  line-height: 1.45;
  white-space: nowrap;
}

.comimi-about-inner {
  display: grid;
  row-gap: 12px;
  box-sizing: border-box;
  padding: 16px 22px 4px;
}

.comimi-about-hero {
  --comimi-about-hero-bg: var(--comimi-surface-2);
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  padding: 26px 0 22px;
  border-radius: 12px;
  background: var(--comimi-about-hero-bg);
}

.comimi-about-logo {
  --comimi-about-logo-scale: 0.62;
  width: calc(360px * var(--comimi-about-logo-scale));
  height: calc(99px * var(--comimi-about-logo-scale));
}

.comimi-about-logo > .comimi-logo {
  --comimi-logo-ink: var(--comimi-ink);
  --comimi-logo-body: var(--comimi-about-hero-bg);
  transform: scale(var(--comimi-about-logo-scale));
  transform-origin: top left;
}

.comimi-root[data-theme="dark"] .comimi-about-logo > .comimi-logo {
  --comimi-logo-ink: var(--comimi-white);
}

.comimi-about-logo .comimi-logo-mimi-left {
  animation: comimi-about-mimi-left 4s ease-in-out 0.3s infinite;
}

.comimi-about-logo .comimi-logo-mimi-right {
  animation: comimi-about-mimi-right 4s ease-in-out 0.3s infinite;
}

.comimi-about-logo .comimi-logo-eye {
  animation: comimi-about-eye 4s ease-in-out 0.2s infinite;
}

.comimi-about-version {
  display: flex;
  align-items: center;
  justify-content: space-between;
  column-gap: 12px;
  padding: 0 6px;
}

.comimi-about-version-label {
  color: var(--comimi-muted);
  font-size: 13px;
  font-weight: 700;
  line-height: 1.45;
}

.comimi-about-version-value {
  color: var(--comimi-fg);
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 12px;
  font-weight: 700;
  line-height: 1.45;
}

.comimi-about-links {
  display: grid;
  row-gap: 2px;
  margin: 0 -8px;
}

.comimi-about-link {
  display: grid;
  grid-template-columns: 1fr auto;
  column-gap: 8px;
  align-items: center;
  padding: 8px 10px 8px 14px;
  border-radius: 10px;
  color: inherit;
  text-decoration: none;
  transition: background-color 0.24s linear;
}

.comimi-about-link:hover {
  background: var(--comimi-surface-3);
}

.comimi-about-link-text {
  display: grid;
  row-gap: 1px;
  min-width: 0;
}

.comimi-about-link-label {
  color: var(--comimi-fg);
  font-size: 14px;
  font-weight: 700;
  line-height: 1.45;
}

.comimi-about-link-url {
  color: var(--comimi-soft);
  font-size: 11px;
  font-weight: 400;
  line-height: 1.45;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.comimi-about-link-arrow {
  display: block;
  width: 20px;
  height: 20px;
  color: var(--comimi-faint);
}

.comimi-about-link-arrow > svg {
  display: block;
  width: 100%;
  height: 100%;
}

@keyframes comimi-about-mimi-left {
  0%, 20%, 100% {
    transform: rotate(0deg);
  }
  5%, 15% {
    transform: rotate(20deg);
  }
  10% {
    transform: rotate(0deg);
  }
}

@keyframes comimi-about-mimi-right {
  0%, 20%, 100% {
    transform: rotate(0deg);
  }
  5%, 15% {
    transform: rotate(-20deg);
  }
  10% {
    transform: rotate(0deg);
  }
}

@keyframes comimi-about-eye {
  0%, 10%, 100% {
    transform: scaleY(1);
  }
  5% {
    transform: scaleY(0.2);
  }
}

.comimi-back-button {
  position: relative;
  width: 100%;
  height: 56px;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
}

.comimi-back-inner {
  position: absolute;
  inset: 8px;
}

.comimi-back-bg {
  position: absolute;
  inset: 0;
  border-radius: 8px;
  background: var(--comimi-surface-2);
  transition: inset 0.36s var(--comimi-spring), border-radius 0.36s var(--comimi-spring);
}

.comimi-back-button:hover .comimi-back-bg {
  inset: -4px;
  border-radius: 10px;
}

.comimi-back-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: var(--comimi-muted);
  font-size: 14px;
  font-weight: 700;
  line-height: 1.45;
  pointer-events: none;
}

.comimi-back-arrow {
  position: absolute;
  top: 50%;
  left: 8px;
  width: 22px;
  height: 22px;
  color: var(--comimi-faint);
  transform: translateY(-50%) scaleX(-1);
  pointer-events: none;
}

.comimi-back-arrow > svg {
  display: block;
  width: 100%;
  height: 100%;
}

@media (max-width: 767px) {
  .comimi-menu-panel {
    top: 0;
    left: 0;
    width: 100%;
  }

  .comimi-menu-bg {
    border-radius: 0 0 16px 16px;
  }

  .comimi-menu-top {
    width: 100%;
  }

  .comimi-page-list-inner,
  .comimi-favorites-inner,
  .comimi-shortcut-inner {
    max-height: calc(var(--view-height, 100vh) - 62px - 56px);
  }

  .comimi-menu-link-shortcuts {
    display: none;
  }
}
`;
