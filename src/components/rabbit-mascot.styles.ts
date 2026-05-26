export const rabbitMascotStyles = `
.comimi-rabbit {
  position: absolute;
  width: 50px;
  z-index: 0;
  pointer-events: none;
}

.comimi-rabbit-svg {
  display: block;
  width: 100%;
  height: auto;
}

.comimi-controls-dock > .comimi-rabbit {
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
}

.comimi-menu-panel > .comimi-rabbit {
  top: 20px;
  right: 20px;
}

@media (max-width: 767px) {
  .comimi-controls-dock > .comimi-rabbit {
    display: none;
  }
}

@media (min-width: 768px) {
  .comimi-menu-panel > .comimi-rabbit {
    display: none;
  }
}
`;
