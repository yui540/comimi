export const scrollFadeStyles = `
.comimi-scrollfade {
  position: relative;
  overscroll-behavior: contain;
}

.comimi-scrollfade::before,
.comimi-scrollfade::after {
  content: "";
  position: sticky;
  display: block;
  left: 0;
  width: 100%;
  height: 32px;
  z-index: 2;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.16s linear;
}

.comimi-scrollfade::before {
  top: 0;
  background: linear-gradient(to bottom, var(--comimi-bg), transparent);
}

.comimi-scrollfade::after {
  bottom: 0;
  background: linear-gradient(to top, var(--comimi-bg), transparent);
}

.comimi-scrollfade[data-scroll-up="true"]::before {
  opacity: 1;
}

.comimi-scrollfade[data-scroll-down="true"]::after {
  opacity: 1;
}
`;
