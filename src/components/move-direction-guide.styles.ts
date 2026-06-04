export const moveDirectionGuideStyles = `
.comimi-move-guide {
  --comimi-move-guide-size: 90px;
  position: absolute;
  top: 50%;
  left: 50%;
  width: var(--comimi-move-guide-size);
  height: var(--comimi-move-guide-size);
  transform: translate(-50%, -50%);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.7);
  box-shadow: 0 0 8px 0 rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(5px);
  pointer-events: none;
  z-index: 1;
  opacity: 1;
  transition: opacity 0.3s linear;
}

.comimi-move-guide[data-visible="false"] {
  opacity: 0;
  transition: opacity 0.15s linear;
}

.comimi-move-guide-arrow-wrap {
  position: absolute;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 30px;
  height: 6px;
}

.comimi-move-guide-arrow {
  position: relative;
  width: 30px;
  height: 6px;
}

.comimi-move-guide-arrow[data-direction="left"] {
  transform: scaleX(1);
}

.comimi-move-guide-arrow[data-direction="right"] {
  transform: scaleX(-1);
}

.comimi-move-guide-arrow-icon {
  position: absolute;
  top: 0;
  right: 0;
  width: 30px;
  height: 6px;
  border-radius: 999px;
  background-color: #666;
  animation: comimi-move-guide-arrow 0.6s ease-in-out 0.8s both;
}

.comimi-move-guide-arrow-icon::before,
.comimi-move-guide-arrow-icon::after {
  content: "";
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  width: 16px;
  height: 6px;
  border-radius: 999px;
  background-color: #666;
  transform-origin: 3px center;
}

.comimi-move-guide-arrow-icon::before {
  transform: rotate(-45deg);
}

.comimi-move-guide-arrow-icon::after {
  transform: rotate(45deg);
}

.comimi-move-guide-text {
  position: absolute;
  bottom: 14px;
  left: 50%;
  transform: translate(-50%, 0);
  font-size: 11px;
  font-weight: 400;
  text-align: center;
  line-height: 1.45;
  color: #666;
}

@keyframes comimi-move-guide-arrow {
  from,
  to {
    width: 30px;
  }
  50% {
    width: 37px;
  }
  75% {
    width: 27px;
  }
}
`;
