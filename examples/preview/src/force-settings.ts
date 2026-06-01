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

const container = document.querySelector<HTMLElement>("#viewer");
if (!container) {
  throw new Error("Viewer container not found");
}

createMangaViewer(container, {
  manga: {
    id: "sample-comic-force-settings",
    title: "設定の強制適用",
    author: "yui540",
    pages: imagePages
  },
  locale: "ja",
  settings: {
    layoutMode: "inline",
    hasCover: true,
    readingDirection: "ltr", // 強制したい値
    backgroundColor: "white" // シード（保存値があればそちらが勝つ）
  },
  // readingDirection だけ保存値より初期値を優先する。
  forceSettings: ["readingDirection"]
});
