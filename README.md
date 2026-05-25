# comimi

![comimi バナー画像](assets/banner.png)

[English](./README_en.md) | [한국어](./README_ko.md)

comimiは、Webサイトに漫画ビューワーを組み込むことができるTypeScript/JavaScriptライブラリです。

ReactなどのUIライブラリに依存していないため、単体で動作します。

https://github.com/user-attachments/assets/3e37b9fb-6381-4f43-9b27-7ae8056a1905

[yui540.com/comimi](https://yui540.com/comimi)

## インストール

```sh
npm install @yui540/comimi
```

## クイックスタート

```ts
import { createMangaViewer } from "@yui540/comimi";

createMangaViewer(document.querySelector("#viewer")!, {
  manga: {
    id: "sample",
    title: "サンプル漫画",
    author: "yui540",
    pages: [
      { id: "p0", type: "image", src: "/pages/0.webp" },
      { id: "p1", type: "image", src: "/pages/1.webp" },
      { id: "p2", type: "image", src: "/pages/2.webp" },
    ],
  },
});
```

これが最小構成です。ビューワーは `#viewer` にマウントされ、DOMを自動的に管理します。戻り値のインスタンスを通じて、ページ送りや設定・イベント操作も行えます。

## ドキュメント

APIの詳細、オプション、設定、キーボードショートカット、永続化、i18n については [`docs/USAGE.md`](./docs/USAGE.md) に記載しています。

## ライセンス

MIT
