import { createMangaViewer, type MangaPage } from "../../../src";
import { loadSampleImagePages } from "./shell/sample-pages";
import { mountPreviewShell } from "./shell/shell";

const imagePages: MangaPage[] = loadSampleImagePages();

const outroPage: MangaPage = {
  id: "outro",
  type: "html",
  html: `
    <div style="
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 24px;
      width: 100%;
      height: 100%;
      background: #fff;
      color: #333;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      text-align: center;
      padding: 32px;
    ">
      <div style="font-size: 18px; font-weight: 700;">
        最後までご覧いただきありがとうございます
      </div>
      <a
        href="https://yui540.com"
        target="_blank"
        rel="noopener noreferrer"
        style="
          display: inline-block;
          padding: 14px 28px;
          background: #333;
          color: #fff;
          border-radius: 999px;
          font-size: 15px;
          font-weight: 700;
          text-decoration: none;
          letter-spacing: 0.02em;
        "
      >
        yui540.com →
      </a>
    </div>
  `
};

const linkPage: MangaPage = {
  id: "link",
  type: "html",
  html: `
    <a
      href="https://yui540.com"
      target="_blank"
      rel="noopener noreferrer"
      style="
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 16px;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        color: #fff;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        text-align: center;
        text-decoration: none;
        padding: 32px;
      "
    >
      <div style="font-size: 22px; font-weight: 700;">
        ページ全体がリンクです
      </div>
      <div style="font-size: 14px; opacity: 0.7;">
        どこをタップしても yui540.com へ移動します →
      </div>
    </a>
  `
};

const pages: MangaPage[] = [...imagePages, linkPage, outroPage];

const container = mountPreviewShell("index");

const viewer = createMangaViewer(container, {
  manga: {
    id: "sample-comic",
    title: "モノクロ世界にようこそ",
    author: "yui540",
    pages
  },
  locale: "ja",
  initialPageQueryParam: "p",
  settings: {
    layoutMode: "inline",
    hasCover: true,
    readingDirection: "rtl"
  },
  events: {
    pageChange: ({ pageIndex }) => {
      console.log("[comimi] pageChange", pageIndex + 1);
    }
  },
  resolvePageSrc: async ({ page, pageIndex, isSpread }) => {
    console.log("[comimi] resolvePageSrc:start", {
      pageIndex,
      pageId: page.id,
      src: page.src,
      isSpread
    });
    const start = performance.now();
    // ここで実際は復号や認証付き fetch を行う想定。
    // デバッグ用に擬似的な遅延だけ入れて元の src を返す。
    await new Promise((resolve) => setTimeout(resolve, 200));
    const elapsed = Math.round(performance.now() - start);
    console.log("[comimi] resolvePageSrc:done", {
      pageIndex,
      pageId: page.id,
      elapsedMs: elapsed,
      isSpread
    });
    return page.src;
  }
});

Object.assign(window, { comimiViewer: viewer });
