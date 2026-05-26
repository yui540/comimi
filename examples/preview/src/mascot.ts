import { createMangaViewer, type MangaPage } from "../../../src";

const sampleImages = import.meta.glob("../sample-comic/*.webp", {
  eager: true,
  query: "?url",
  import: "default"
}) as Record<string, string>;

const imagePages: MangaPage[] = Object.entries(sampleImages)
  .map(([path, url]) => {
    const match = path.match(/\/(\d+)\.webp$/);
    if (!match) {
      return null;
    }
    return { index: Number(match[1]), url };
  })
  .filter((entry): entry is { index: number; url: string } => entry !== null)
  .sort((a, b) => a.index - b.index)
  .map(({ index, url }) => ({
    id: `p${index}`,
    type: "image",
    src: url,
    alt: `Page ${index + 1}`
  }));

const CAT_SVG = `
<svg viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
  <mask id="comimi-mascot-cat-mask" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="50" height="50">
    <rect width="50" height="50" fill="#D9D9D9"/>
  </mask>
  <g mask="url(#comimi-mascot-cat-mask)">
    <ellipse cx="25" cy="42.7339" rx="25" ry="20.8467" fill="#CCCCCC"/>
    <path d="M19.8776 23.9935C19.8776 23.9935 14.7258 18.7493 12.2153 19.2606C9.70475 19.772 10.8414 28.3106 10.8414 28.3106L19.8776 23.9935Z" fill="#CCCCCC"/>
    <path d="M30.0469 24.2334C30.0469 24.2334 35.5352 18.5754 37.7343 19.0255C39.9335 19.4756 40.4303 28.7444 40.4303 28.7444L30.0517 24.2383L30.0469 24.2334Z" fill="#CCCCCC"/>
    <path d="M29.6515 33.5473C29.3853 33.4916 29.1192 33.6586 29.0547 33.929C29.0305 34.0324 28.7805 34.9309 27.3368 34.9309C25.8932 34.9309 25.7157 34.0721 25.6915 33.9687C25.6593 33.754 25.4899 33.603 25.2802 33.5632C25.2721 33.5632 25.2641 33.5553 25.256 33.5553C24.9899 33.4996 24.7237 33.6666 24.6592 33.9369C24.635 34.0403 24.385 34.9388 22.9413 34.9388C21.4977 34.9388 21.3203 34.0801 21.3041 33.9767C21.2638 33.7063 21.0057 33.5234 20.7315 33.5632C20.4573 33.603 20.2637 33.8574 20.3121 34.1278C20.4089 34.748 21.0864 35.9328 22.9494 35.9328C24.0543 35.9328 24.7479 35.5114 25.1592 35.0422C25.5544 35.5114 26.24 35.9248 27.3368 35.9248C29.1837 35.9248 29.9096 34.748 30.0386 34.1278C30.0951 33.8654 29.9176 33.603 29.6515 33.5473Z" fill="white"/>
    <rect x="16.5" y="28.8335" width="4.16667" height="1.33333" rx="0.666667" fill="white"/>
    <rect x="29.3359" y="28.8335" width="4.16667" height="1.33333" rx="0.666667" fill="white"/>
  </g>
</svg>
`.trim();

const container = document.querySelector<HTMLElement>("#viewer");
if (!container) {
  throw new Error("Viewer container not found");
}

createMangaViewer(container, {
  manga: {
    id: "sample-comic-mascot",
    title: "モノクロ世界にようこそ (Custom mascot)",
    author: "yui540",
    pages: imagePages
  },
  locale: "ja",
  settings: {
    layoutMode: "inline",
    hasCover: true,
    readingDirection: "rtl"
  },
  mascot: {
    render: () => {
      const wrap = document.createElement("div");
      wrap.innerHTML = CAT_SVG;
      return wrap.firstElementChild as HTMLElement;
    }
  }
});
