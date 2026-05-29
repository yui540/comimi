export const arrowButtonsStyles = `
.comimi-arrows {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 30;
}

.comimi-arrow-button {
  position: absolute;
  top: 50%;
  width: 46px;
  height: 46px;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  pointer-events: auto;
  transform: translateY(-50%);
}

.comimi-arrow-next {
  right: 24px;
}

.comimi-arrow-prev {
  left: 24px;
}

.comimi-arrow-inner {
  position: absolute;
  inset: 0;
  transition:
    transform 0.6s var(--comimi-spring),
    opacity 0.3s linear;
}

.comimi-arrows[data-overlay="false"] .comimi-arrow-next .comimi-arrow-inner,
.comimi-arrows[data-autoplay="true"] .comimi-arrow-next .comimi-arrow-inner {
  transform: translateX(35px);
  opacity: 0;
  transition:
    transform 0.3s var(--comimi-spring),
    opacity 0.15s linear;
}

.comimi-arrows[data-overlay="false"] .comimi-arrow-prev .comimi-arrow-inner,
.comimi-arrows[data-autoplay="true"] .comimi-arrow-prev .comimi-arrow-inner {
  transform: translateX(-35px);
  opacity: 0;
  transition:
    transform 0.3s var(--comimi-spring),
    opacity 0.15s linear;
}

.comimi-arrows[data-overlay="false"],
.comimi-arrows[data-autoplay="true"] {
  pointer-events: none;
}

.comimi-arrow-button[data-disabled="true"] {
  pointer-events: none;
}

.comimi-arrow-next[data-disabled="true"] .comimi-arrow-inner {
  transform: translateX(35px);
  opacity: 0;
  transition:
    transform 0.3s var(--comimi-spring),
    opacity 0.15s linear;
}

.comimi-arrow-prev[data-disabled="true"] .comimi-arrow-inner {
  transform: translateX(-35px);
  opacity: 0;
  transition:
    transform 0.3s var(--comimi-spring),
    opacity 0.15s linear;
}

.comimi-arrow-bg {
  position: absolute;
  inset: 0;
  border-radius: 16px;
  background: var(--comimi-glass);
  box-shadow: var(--comimi-shadow);
  backdrop-filter: blur(5px);
  transition: inset 0.36s var(--comimi-spring), border-radius 0.36s var(--comimi-spring);
}

.comimi-arrow-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 20px;
  height: 20px;
  color: #666;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.comimi-arrow-prev .comimi-arrow-icon {
  transform: translate(-50%, -50%) scaleX(-1);
}

@keyframes comimi-arrow-bounce {
  from, to {
    transform: translate(-50%, -50%);
  }
  40% {
    transform: translate(calc(-50% + 3px), -50%);
  }
  70% {
    transform: translate(calc(-50% - 1.5px), -50%);
  }
}

@keyframes comimi-arrow-bounce-prev {
  from, to {
    transform: translate(-50%, -50%) scaleX(-1);
  }
  40% {
    transform: translate(calc(-50% - 3px), -50%) scaleX(-1);
  }
  70% {
    transform: translate(calc(-50% + 1.5px), -50%) scaleX(-1);
  }
}

@media (hover: hover) {
  .comimi-arrow-button:hover .comimi-arrow-bg {
    inset: -3px;
    border-radius: 20px;
  }

  .comimi-arrow-next:hover .comimi-arrow-icon {
    animation: comimi-arrow-bounce 0.5s ease-in-out 0.1s both;
  }

  .comimi-arrow-prev:hover .comimi-arrow-icon {
    animation: comimi-arrow-bounce-prev 0.5s ease-in-out 0.1s both;
  }
}

@media (max-width: 767px) {
  .comimi-arrow-button {
    width: 36px;
    height: 50px;
  }

  .comimi-arrow-next {
    right: 0;
  }

  .comimi-arrow-prev {
    left: 0;
  }

  .comimi-arrow-next .comimi-arrow-bg {
    border-radius: 16px 0 0 16px;
  }

  .comimi-arrow-prev .comimi-arrow-bg {
    border-radius: 0 16px 16px 0;
  }
}
`;
