export const pageStageStyles = `
.comimi-stage {
  position: absolute;
  inset: 0;
  will-change: transform;
  transition: transform .18s ease;
}

.comimi-stage[data-dragging="true"] {
  transition: none;
}

.comimi-page-group {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  box-sizing: border-box;
}

.comimi-page {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  max-width: 100%;
  max-height: 100%;
  min-width: 0;
  min-height: 0;
  background: transparent;
  overflow: hidden;
  flex: 0 0 auto;
}

.comimi-page[data-spread="true"] {
  width: 50%;
  height: 100%;
}

.comimi-page[data-spread="false"] {
  width: 100%;
  height: 100%;
}

.comimi-page[data-position="left"] {
  justify-content: flex-end;
}

.comimi-page[data-position="right"] {
  justify-content: flex-start;
}

.comimi-page img,
.comimi-html-page {
  display: block;
  max-width: 100%;
  max-height: 100%;
  width: 100%;
  height: 100%;
  object-fit: contain;
  transform-origin: center center;
  user-select: none;
  -webkit-user-select: none;
  -webkit-user-drag: none;
  -webkit-touch-callout: none;
}

.comimi-page img {
  pointer-events: none;
}

.comimi-page[data-spread="true"] img,
.comimi-page[data-spread="true"] .comimi-html-page {
  width: 100%;
  height: 100%;
}

.comimi-page[data-position="left"] img,
.comimi-page[data-position="left"] .comimi-html-page {
  object-position: right center;
}

.comimi-page[data-position="right"] img,
.comimi-page[data-position="right"] .comimi-html-page {
  object-position: left center;
}

.comimi-html-page {
  position: relative;
  width: min(100%, 960px);
  height: min(100%, 680px);
  background: #fff;
  color: #111;
  overflow: auto;
}

/* オーバーレイ表示中は漫画ページ（リンク等）を操作不可にする */
.comimi-stage[data-overlay="true"] .comimi-html-page {
  pointer-events: none;
}

`;
