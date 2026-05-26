export const splashScreenStyles = `
.comimi-splash {
  position: absolute;
  inset: 0;
  z-index: 100;
  background-color: #e0e0e0;
  overflow: hidden;
  animation: comimi-splash-clip 1s cubic-bezier(0.82, 0.01, 0.48, 1.02) 1s both;
  pointer-events: none;
}

.comimi-splash-logo-wrap {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -60%);
  width: 260px;
  aspect-ratio: 290 / 99;
}

.comimi-splash-logo {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0.72);
  width: 360px;
  aspect-ratio: 360 / 99;
}

.comimi-splash-symbol {
  position: absolute;
  top: 0;
  left: 0;
  width: 113px;
  display: block;
  transform-origin: center bottom;
}

.comimi-splash-logo-wrap-custom {
  width: 120px;
  aspect-ratio: 1 / 1;
}

.comimi-splash-logo-wrap-custom .comimi-splash-text {
  transform: translate(-50%, calc(100% + 16px));
}

.comimi-splash-custom-logo {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 120px;
  aspect-ratio: 1 / 1;
}

.comimi-splash-custom-logo > * {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.comimi-splash-typo-wrap {
  position: absolute;
  right: 7px;
  bottom: 11px;
  width: 229.5px;
}

.comimi-splash-typo {
  display: block;
  width: 100%;
  overflow: visible;
}

.comimi-splash-stroke {
  fill: none;
  stroke: #fff;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 10px;
}

.comimi-splash-mimi {
  transform-origin: 56px 43px;
}

.comimi-splash-mimi-left {
  animation: comimi-splash-mimi-left 0.4s ease-in-out 0.3s 2 forwards;
}

.comimi-splash-mimi-right {
  animation: comimi-splash-mimi-right 0.4s ease-in-out 0.3s 2 forwards;
}

.comimi-splash-eyes {
  transform: translateX(-7px);
}

.comimi-splash-eye {
  transform-origin: center;
  transform-box: fill-box;
  animation: comimi-splash-eye 0.4s ease-in-out 0.2s forwards;
}

.comimi-splash-heart {
  --size: 14px;
  position: absolute;
  top: -20px;
  width: var(--size);
  height: var(--size);
}

.comimi-splash-heart::before,
.comimi-splash-heart::after {
  content: "";
  display: block;
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 150%;
  border-radius: 999px;
  transform-origin: center bottom;
}

.comimi-splash-heart::before {
  transform: translateX(-32%) rotate(45deg);
  background-color: #eee;
}

.comimi-splash-heart::after {
  transform: translateX(32%) rotate(-45deg);
  background-color: #fff;
}

.comimi-splash-heart-1 {
  right: -2px;
}

.comimi-splash-heart-2 {
  right: 76px;
}

.comimi-splash-text {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translate(-50%, 120%);
  color: #fff;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.45;
  text-align: center;
  white-space: nowrap;
}

.comimi-splash-text span {
  display: inline-block;
  animation: comimi-splash-dot 0.8s ease-in-out 0s infinite both;
}

.comimi-splash-text span:nth-child(1) {
  animation-delay: 0s;
}

.comimi-splash-text span:nth-child(2) {
  animation-delay: 0.15s;
}

.comimi-splash-text span:nth-child(3) {
  animation-delay: 0.3s;
}

@keyframes comimi-splash-clip {
  from {
    clip-path: circle(70%);
  }
  to {
    clip-path: circle(0%);
  }
}

@keyframes comimi-splash-mimi-left {
  from, to {
    transform: rotate(0deg);
  }
  50% {
    transform: rotate(20deg);
  }
}

@keyframes comimi-splash-mimi-right {
  from, to {
    transform: rotate(0deg);
  }
  50% {
    transform: rotate(-20deg);
  }
}

@keyframes comimi-splash-eye {
  from, to {
    transform: scaleY(1);
  }
  50% {
    transform: scaleY(0.2);
  }
}

@keyframes comimi-splash-dot {
  from, 50%, to {
    opacity: 1;
  }
  25% {
    opacity: 0;
  }
}
`;
