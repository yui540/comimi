export const inputsStyles = `
.comimi-selectbox {
  position: relative;
  display: inline-block;
  width: 100%;
}

.comimi-selectbox-bg {
  position: absolute;
  inset: 0;
  border-radius: 8px;
  background: #eeeeee;
  transition: inset 0.36s var(--comimi-spring);
}

@media (hover: hover) {
  .comimi-selectbox:hover .comimi-selectbox-bg {
    inset: -3px;
  }
}

.comimi-selectbox-select {
  position: absolute;
  inset: 0;
  z-index: 2;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  appearance: none;
  -webkit-appearance: none;
  color: transparent;
  font: inherit;
  cursor: pointer;
  opacity: 0;
}

.comimi-selectbox-select:disabled {
  cursor: not-allowed;
}

.comimi-selectbox-label {
  position: relative;
  display: block;
  box-sizing: border-box;
  width: 100%;
  padding: 8px 32px 8px 12px;
  color: #333;
  font-size: 12px;
  font-weight: 400;
  line-height: 1.45;
  cursor: pointer;
  pointer-events: none;
}

.comimi-selectbox-arrow {
  position: absolute;
  top: 50%;
  right: 12px;
  z-index: 1;
  width: 16px;
  height: 16px;
  color: #aaa;
  transform: translateY(-50%) rotate(90deg);
  pointer-events: none;
}

@media (hover: hover) {
  .comimi-selectbox:hover .comimi-selectbox-arrow {
    animation: comimi-selectbox-arrow 0.5s ease-in-out 0s both;
  }
}

@keyframes comimi-selectbox-arrow {
  from, to {
    transform: translateY(-50%) rotate(90deg);
  }
  40% {
    transform: translateY(calc(-50% + 3px)) rotate(90deg);
  }
  70% {
    transform: translateY(calc(-50% - 1.5px)) rotate(90deg);
  }
}

.comimi-toggle-switch {
  display: grid;
  grid-template-columns: repeat(2, auto);
  column-gap: 6px;
  justify-content: start;
  align-items: center;
  width: 100%;
  padding: 2px;
  border: 0;
  background: transparent;
  cursor: pointer;
}

.comimi-toggle-track {
  position: relative;
  width: 32px;
  height: 18px;
  border-radius: 999px;
  background: #eeeeee;
  transition: background-color 0.2s linear;
}

.comimi-toggle-switch[data-checked="true"] .comimi-toggle-track {
  background: #666;
}

.comimi-toggle-knob {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #666;
  transition:
    transform 0.36s var(--comimi-spring),
    background-color 0.2s linear;
}

.comimi-toggle-switch[data-checked="true"] .comimi-toggle-knob {
  background: #fff;
  transform: translateX(100%);
}

.comimi-toggle-label-wrap {
  position: relative;
  width: 22px;
  height: 12px;
  overflow: hidden;
}

.comimi-toggle-label-inner {
  position: absolute;
  inset: 0;
  transition: transform 0.36s var(--comimi-spring);
}

.comimi-toggle-switch[data-checked="false"] .comimi-toggle-label-inner {
  transform: translateX(-100%);
}

.comimi-toggle-label {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  font-size: 11px;
  font-weight: 400;
  line-height: 12px;
  text-align: center;
}

.comimi-toggle-label-on {
  color: #333;
}

.comimi-toggle-label-off {
  color: #aaa;
  transform: translateX(100%);
}

.comimi-range-slider {
  display: grid;
  grid-template-columns: 1fr auto;
  column-gap: 8px;
  align-items: center;
  width: 100%;
}

.comimi-range-slider[data-disabled="true"] {
  opacity: 0.6;
}

.comimi-range-slider-wrap {
  position: relative;
  display: grid;
  align-items: center;
  min-width: 0;
  height: 18px;
}

.comimi-range-slider-track {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 6px;
  border-radius: 999px;
  background: #eeeeee;
  overflow: hidden;
  transform: translateY(-50%);
  transition: height 0.36s var(--comimi-spring);
}

@media (hover: hover) {
  .comimi-range-slider-wrap:hover .comimi-range-slider-track {
    height: 10px;
  }
}

.comimi-range-slider-fill {
  display: block;
  height: 100%;
  background: #666;
  border-radius: inherit;
}

.comimi-range-slider-input {
  position: relative;
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

.comimi-range-slider-input::-webkit-slider-runnable-track {
  height: 6px;
  background: transparent;
  border: 0;
}

.comimi-range-slider-input::-webkit-slider-thumb {
  appearance: none;
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  margin-top: -6px;
  border: 0;
  border-radius: 50%;
  background: #666;
  box-shadow: none;
  transition:
    transform 0.36s var(--comimi-spring),
    background-color 0.2s ease-in-out;
}

.comimi-range-slider-input:hover:not(:disabled)::-webkit-slider-thumb {
  transform: scale(1.15);
}

.comimi-range-slider-input::-moz-range-track {
  height: 6px;
  background: transparent;
  border: 0;
}

.comimi-range-slider-input::-moz-range-thumb {
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

.comimi-range-slider-input:hover:not(:disabled)::-moz-range-thumb {
  transform: scale(1.15);
}

.comimi-range-slider-input:focus-visible {
  outline: none;
}

.comimi-range-slider-input:focus-visible::-webkit-slider-thumb {
  box-shadow: none;
}

.comimi-range-slider-input:focus-visible::-moz-range-thumb {
  box-shadow: none;
}

.comimi-range-slider-value {
  width: 36px;
  color: #666;
  font-size: 11px;
  font-weight: 400;
  line-height: 1;
  text-align: right;
  white-space: nowrap;
}
`;
