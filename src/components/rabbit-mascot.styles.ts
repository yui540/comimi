export const rabbitMascotStyles = `
.comimi-rabbit {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  aspect-ratio: 1 / 1;
  z-index: 0;
  pointer-events: none;
}

.comimi-rabbit > * {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.comimi-controls-dock > .comimi-rabbit {
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
}

.comimi-menu-panel > .comimi-rabbit {
  right: 20px;
  bottom: 0;
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
