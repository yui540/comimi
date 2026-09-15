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

.comimi-rabbit-body {
  fill: var(--comimi-mascot);
  transition: fill 0.2s linear;
}

.comimi-rabbit-shade {
  fill: var(--comimi-mascot-shade);
  transition: fill 0.2s linear;
}

.comimi-menu-panel > .comimi-rabbit {
  top: 12px;
  right: 20px;
}

.comimi-mascot-html {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}
`;
