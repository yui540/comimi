# comimi

![comimi banner image](assets/banner.png)

comimi is a TypeScript/JavaScript library that allows you to embed a manga viewer into your website.

It does not depend on any UI libraries like React, so it works standalone.

https://github.com/user-attachments/assets/3e37b9fb-6381-4f43-9b27-7ae8056a1905

[yui540.com/comimi](https://yui540.com/comimi)

## Installation

```sh
npm install @yui540/comimi
```

## Quick Start

```ts
import { createMangaViewer } from "@yui540/comimi";

createMangaViewer(document.querySelector("#viewer")!, {
  manga: {
    id: "sample",
    title: "Sample Manga",
    author: "yui540",
    pages: [
      { id: "p0", type: "image", src: "/pages/0.webp" },
      { id: "p1", type: "image", src: "/pages/1.webp" },
      { id: "p2", type: "image", src: "/pages/2.webp" },
    ],
  },
});
```

This is the minimum configuration. The viewer will be mounted to `#viewer` and will manage the DOM automatically. You can also navigate pages, configure settings, and handle events through the returned instance.

## Documentation

For details on the API, options, settings, keyboard shortcuts, persistence, and i18n, please refer to [`docs/USAGE.md`](./docs/USAGE.md).

## License

MIT
