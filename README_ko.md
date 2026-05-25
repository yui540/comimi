# comimi

![comimi 배너 이미지](assets/banner.png)

comimi는 웹사이트에 만화 뷰어를 통합할 수 있는 TypeScript/JavaScript 라이브러리입니다.

React 등의 UI 라이브러리에 의존하지 않으므로 단독으로 작동합니다.

https://github.com/user-attachments/assets/3e37b9fb-6381-4f43-9b27-7ae8056a1905

[yui540.com/comimi](https://yui540.com/comimi)

## 설치

```sh
npm install @yui540/comimi
```

## 빠른 시작

```ts
import { createMangaViewer } from "@yui540/comimi";

createMangaViewer(document.querySelector("#viewer")!, {
  manga: {
    id: "sample",
    title: "샘플 만화",
    author: "yui540",
    pages: [
      { id: "p0", type: "image", src: "/pages/0.webp" },
      { id: "p1", type: "image", src: "/pages/1.webp" },
      { id: "p2", type: "image", src: "/pages/2.webp" },
    ],
  },
});
```

이것이 최소 구성입니다. 뷰어는 `#viewer`에 마운트되고 DOM을 자동으로 관리합니다. 반환된 인스턴스를 통해 페이지 넘김, 설정 및 이벤트 조작도 수행할 수 있습니다.

## 문서

API의 세부 사항, 옵션, 설정, 키보드 단축키, 영속성, 다국어 지원에 대해서는 [`docs/USAGE.md`](./docs/USAGE.md)에 설명되어 있습니다.

## 라이선스

MIT
