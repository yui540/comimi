export const controlsDockStyles = `
/* --- Controls dock (bottom) ------------------------------------------- */

.comimi-controls-dock {
  box-sizing: border-box;
  position: absolute;
  bottom: 24px;
  left: 24px;
  width: calc(100% - 48px);
  padding: 20px 24px;
  z-index: 40;
  pointer-events: auto;
  transition:
    transform 0.6s var(--comimi-spring),
    opacity 0.3s linear;
}

.comimi-controls-dock[data-overlay="false"] {
  transform: translateY(35px);
  opacity: 0;
  pointer-events: none;
  transition:
    transform 0.3s var(--comimi-spring),
    opacity 0.15s linear;
}

.comimi-controls-bg {
  position: absolute;
  inset: 0;
  border-radius: 20px;
  background: var(--comimi-glass);
  box-shadow: var(--comimi-shadow);
  backdrop-filter: blur(5px);
  transition: inset 0.36s var(--comimi-spring), border-radius 0.36s var(--comimi-spring);
}

@media (hover: hover) {
  .comimi-controls-dock:hover > .comimi-controls-bg {
    inset: -4px -4px 0 -4px;
    border-radius: 20px;
  }
}

.comimi-controls-row {
  position: relative;
  display: grid;
  grid-template-columns: auto auto;
  justify-content: space-between;
  align-items: center;
}

.comimi-controls-side {
  display: grid;
  grid-auto-flow: column;
  column-gap: 16px;
  justify-content: end;
  align-items: center;
  transition:
    opacity 0.2s ease-in-out,
    visibility 0.2s ease-in-out;
}

.comimi-controls-dock[data-autoplay="true"] .comimi-controls-side {
  opacity: 0;
  visibility: hidden;
}

/* --- Seek bar --------------------------------------------------------- */

.comimi-seek {
  position: relative;
  display: grid;
  grid-template-columns: auto 1fr;
  column-gap: 10px;
  align-items: center;
  margin-bottom: 10px;
}

.comimi-seek-text {
  display: grid;
  grid-template-columns: repeat(2, auto);
  justify-content: start;
  align-items: end;
  line-height: 14px;
}

.comimi-seek-current {
  color: #333;
  font-size: 12px;
  font-weight: 700;
}

.comimi-seek-total {
  color: #999;
  font-size: 12px;
  font-weight: 400;
  margin-left: 0.4em;
}

.comimi-seek-bar {
  position: relative;
  width: 100%;
  height: 18px;
}

.comimi-seek-track {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 8px;
  border-radius: 999px;
  background: #e0e0e0;
  overflow: hidden;
  transform: translateY(-50%);
  transition: height 0.36s var(--comimi-spring);
}

@media (hover: hover) {
  .comimi-seek-bar:hover .comimi-seek-track {
    height: 12px;
  }
}

.comimi-seek-fill {
  position: absolute;
  top: 0;
  height: 100%;
  border-radius: 999px;
  background: #666;
}

.comimi-seek-bar[data-direction="rtl"] .comimi-seek-fill {
  right: 0;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}

.comimi-seek-bar[data-direction="ltr"] .comimi-seek-fill {
  left: 0;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}

.comimi-seek-input {
  position: absolute;
  inset: 0;
  z-index: 1;
  width: 100%;
  height: 18px;
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  appearance: none;
  -webkit-appearance: none;
  cursor: pointer;
}

.comimi-seek-input::-webkit-slider-runnable-track {
  height: 8px;
  background: transparent;
  border: 0;
}

.comimi-seek-input::-webkit-slider-thumb {
  appearance: none;
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  margin-top: -5px;
  border: 0;
  border-radius: 50%;
  background: #666;
  box-shadow: none;
  transition:
    transform 0.36s var(--comimi-spring),
    background-color 0.2s ease-in-out;
}

.comimi-seek-input:hover::-webkit-slider-thumb {
  transform: scale(1.15);
}

.comimi-seek-input::-moz-range-track {
  height: 8px;
  background: transparent;
  border: 0;
}

.comimi-seek-input::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border: 0;
  border-radius: 50%;
  background: #666;
  box-shadow: none;
  transition:
    transform 0.36s var(--comimi-spring),
    background-color 0.2s ease-in-out;
}

.comimi-seek-input:hover::-moz-range-thumb {
  transform: scale(1.15);
}

.comimi-seek-input:focus-visible {
  outline: none;
}

.comimi-seek-input:focus-visible::-webkit-slider-thumb {
  box-shadow: none;
}

.comimi-seek-input:focus-visible::-moz-range-thumb {
  box-shadow: none;
}

.comimi-seek-input[data-direction="rtl"] {
  direction: rtl;
}

/* --- Auto Play -------------------------------------------------------- */

.comimi-autoplay {
  position: relative;
  display: grid;
  grid-template-columns: auto auto;
  column-gap: 12px;
  justify-content: start;
  align-items: center;
}

.comimi-autoplay-button {
  position: relative;
  width: 24px;
  height: 24px;
  padding: 0;
  border: 0;
  background: transparent;
  color: #666;
  cursor: pointer;
}

.comimi-autoplay-window {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 20px;
  height: 20px;
  overflow: hidden;
  transform: translate(-50%, -50%);
}

.comimi-autoplay-slider {
  position: absolute;
  top: 0;
  right: 0;
  width: 200%;
  height: 100%;
  transition: transform 0.36s var(--comimi-spring);
}

.comimi-autoplay-slider[data-active="true"] {
  transform: translateX(50%);
}

.comimi-autoplay-icon {
  position: absolute;
  top: 0;
  width: 50%;
  height: 100%;
  display: block;
}

.comimi-autoplay-icon-play {
  right: 0;
}

.comimi-autoplay-icon-pause {
  left: 0;
}

.comimi-autoplay-progress {
  position: relative;
  width: 140px;
  height: 6px;
  border-radius: 999px;
  background: #e0e0e0;
  overflow: hidden;
}

.comimi-autoplay-progress-bar {
  display: block;
  position: absolute;
  inset: 0;
  border-radius: 999px;
  background: #666;
  animation: comimi-autoplay-progress 3s linear 0s infinite;
}

/* --- Page Mode Toggle (single / spread) ------------------------------ */

.comimi-page-mode {
  position: relative;
  width: 80px;
  height: 30px;
}

.comimi-page-mode-wrapper {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 80px;
  height: 30px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: #eeeeee;
  border-radius: 8px;
  transform: translate(-50%, -50%);
  transition: width 0.36s var(--comimi-spring);
}

@media (hover: hover) {
  .comimi-page-mode-wrapper:hover {
    width: 95px;
  }
}

.comimi-page-mode-button {
  position: relative;
  display: grid;
  place-content: center;
  width: 100%;
  height: 100%;
  padding: 0;
  border: 0;
  background: transparent;
  color: #666;
  cursor: pointer;
}

.comimi-page-mode-icon {
  display: block;
  width: 20px;
  opacity: 0.3;
  transform-origin: center bottom;
  transition: opacity 0.2s ease-in-out;
}

.comimi-page-mode-button[data-selected="true"] .comimi-page-mode-icon {
  opacity: 1;
}

.comimi-page-mode-icon.comimi-pop-animate {
  animation: comimi-pop 0.5s ease-in-out 0s both;
}

/* --- Settings (button + popover panel) ------------------------------- */

.comimi-settings {
  position: relative;
  width: 24px;
  height: 24px;
}

.comimi-settings-button {
  position: absolute;
  inset: 0;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
}

.comimi-settings-icon {
  display: block;
  width: 100%;
  height: 100%;
  color: #666;
  transition: transform 0.36s var(--comimi-spring);
}

.comimi-settings[data-open="true"] .comimi-settings-icon {
  transform: rotate(30deg);
}

@keyframes comimi-pop {
  from, to {
    transform: scale(1, 1);
  }
  50% {
    transform: scale(0.95, 1.15);
  }
  75% {
    transform: scale(1.15, 0.95);
  }
}

@keyframes comimi-autoplay-progress {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
}

@media (max-width: 767px) {
  .comimi-controls-dock {
    bottom: 0;
    left: 0;
    width: 100%;
    padding: 20px 16px calc(20px + env(safe-area-inset-bottom, 0px));
  }

  .comimi-controls-bg {
    border-radius: 20px 20px 0 0;
  }
}
`;
