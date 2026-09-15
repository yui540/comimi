import { I18n } from "../i18n/i18n";
import type { MangaPage, MascotOption, ViewerState } from "../types";
import type { RendererCallbacks } from "../renderer/renderer-callbacks";
import {
  COMIMI_REPOSITORY_URL,
  COMIMI_SITE_URL,
  COMIMI_VERSION
} from "../version";
import { renderComimiLogo } from "./comimi-logo";
import { icon } from "./icons";
import { Checkbox } from "./inputs";
import { renderRabbitMascot } from "./rabbit-mascot";
import { bindScrollFade } from "./scroll-fade";

type MenuView =
  | "menu"
  | "shortcut"
  | "pageList"
  | "favorites"
  | "share"
  | "about";

const MENU_PANELS: ReadonlySet<ViewerState["panel"]> = new Set([
  "menu",
  "pages",
  "favorites",
  "shortcuts",
  "share",
  "about"
]);

/** メニューパネル（トップメニューとその配下ビュー）が開いている panel かどうか。 */
export function isMenuPanel(panel: ViewerState["panel"]): boolean {
  return MENU_PANELS.has(panel);
}

const MENU_VIEWS: Partial<Record<ViewerState["panel"], MenuView>> = {
  pages: "pageList",
  favorites: "favorites",
  shortcuts: "shortcut",
  share: "share",
  about: "about"
};

const VIEW_TITLE_KEYS: Record<Exclude<MenuView, "menu">, string> = {
  pageList: "menu.openPages",
  favorites: "menu.openFavorites",
  shortcut: "menu.openShortcuts",
  share: "menu.openShare",
  about: "menu.openAbout"
};

interface PageListHead {
  root: HTMLDivElement;
  thumb: HTMLSpanElement;
  title: HTMLSpanElement;
  author: HTMLSpanElement;
  count: HTMLSpanElement;
}

export class MenuPanel {
  private root: HTMLDivElement;
  private titleEl: HTMLSpanElement;
  private authorEl: HTMLSpanElement;
  private detailTitleEl: HTMLSpanElement;
  private bottomEl: HTMLDivElement;
  private viewMenu: HTMLDivElement;
  private viewShortcut: HTMLDivElement;
  private viewPageList: HTMLDivElement;
  private viewFavorites: HTMLDivElement;
  private favoritesGrid: HTMLDivElement;
  private favoritesEmpty: HTMLDivElement;
  private favoritesCacheKey?: string;
  private pageListItems = new Map<number, HTMLButtonElement>();
  private viewShare: HTMLDivElement;
  private viewAbout: HTMLDivElement;
  private aboutLogoWrap: HTMLDivElement;
  private shareUrlInput: HTMLInputElement;
  private sharePageCheckbox?: Checkbox;
  private pageListInner: HTMLDivElement;
  private pageListHead: PageListHead;
  private pageListCacheKey?: string;
  private coverCacheKey?: string;
  private currentState?: ViewerState;
  private currentView: MenuView = "menu";
  private i18nTexts: Array<{ key: string; apply: (text: string) => void }> =
    [];

  constructor(
    private callbacks: RendererCallbacks,
    private i18n: I18n,
    private options: {
      lockLayoutMode?: boolean;
      mascot?: MascotOption;
      pageQueryParam?: string;
    } = {}
  ) {
    this.root = document.createElement("div");
    this.root.className = "comimi-menu-panel";
    this.root.setAttribute("role", "dialog");
    this.root.dataset.open = "false";
    this.root.dataset.view = "menu";
    this.root.dataset.overlay = "false";

    const background = document.createElement("div");
    background.className = "comimi-menu-bg";

    const top = this.buildTop();
    [this.titleEl, this.authorEl, this.detailTitleEl] = this.findTitleNodes(top);

    this.bottomEl = document.createElement("div");
    this.bottomEl.className = "comimi-menu-bottom";
    this.bottomEl.style.height = "0px";

    const border = document.createElement("div");
    border.className = "comimi-menu-border";

    this.viewMenu = this.buildMenuView();
    this.viewShortcut = this.buildShortcutView();
    [this.viewPageList, this.pageListInner, this.pageListHead] =
      this.buildPageListView();
    [this.viewFavorites, this.favoritesGrid, this.favoritesEmpty] =
      this.buildFavoritesView();
    [this.viewShare, this.shareUrlInput] = this.buildShareView();
    [this.viewAbout, this.aboutLogoWrap] = this.buildAboutView();

    this.bottomEl.append(
      border,
      this.viewMenu,
      this.viewShortcut,
      this.viewPageList,
      this.viewFavorites,
      this.viewShare,
      this.viewAbout
    );
    const mascot = renderRabbitMascot(this.options.mascot);
    const children: Node[] = [background];
    if (mascot) children.push(mascot);
    children.push(top, this.bottomEl);
    this.root.append(...children);
  }

  getElement(): HTMLElement {
    return this.root;
  }

  private bindI18nText(el: HTMLElement, key: string): void {
    this.bindI18n(key, (text) => {
      el.textContent = text;
    });
  }

  private bindI18n(key: string, apply: (text: string) => void): void {
    apply(this.i18n.t(key));
    this.i18nTexts.push({ key, apply });
  }

  private refreshI18nTexts(): void {
    for (const { key, apply } of this.i18nTexts) {
      apply(this.i18n.t(key));
    }
  }

  update(state: ViewerState): void {
    const isOpen = isMenuPanel(state.panel);
    const view: MenuView = MENU_VIEWS[state.panel] ?? "menu";

    this.root.dataset.open = String(isOpen);
    this.root.dataset.view = view;
    this.root.dataset.overlay = String(state.overlayVisible);

    this.titleEl.textContent = state.manga.title;
    if (state.manga.author) {
      this.authorEl.textContent = `@${state.manga.author}`;
      this.authorEl.style.display = "";
    } else {
      this.authorEl.textContent = "";
      this.authorEl.style.display = "none";
    }

    this.refreshI18nTexts();
    this.refreshDetailTitle(view);
    this.refreshPageListHead(state);
    this.refreshPageList(state);
    this.refreshFavorites(state);
    this.refreshShareUrl(state);
    if (view === "about" && this.currentView !== "about") {
      this.replayAboutLogo();
    }
    this.applyHeight(isOpen, view);

    this.currentState = state;
    this.currentView = view;
  }

  // 詳細ビューの見出しはテロップのように作品タイトルと入れ替わる。
  // メニューへ戻るスライド中も直前の見出しを残すため、menu では書き換えない。
  private refreshDetailTitle(view: MenuView): void {
    if (view === "menu") {
      return;
    }
    this.detailTitleEl.textContent = this.i18n.t(VIEW_TITLE_KEYS[view]);
  }

  private applyHeight(isOpen: boolean, view: MenuView): void {
    if (!isOpen) {
      this.bottomEl.style.height = "0px";
      return;
    }

    const target = {
      menu: this.viewMenu,
      shortcut: this.viewShortcut,
      pageList: this.viewPageList,
      favorites: this.viewFavorites,
      share: this.viewShare,
      about: this.viewAbout
    }[view];
    const height = target.offsetHeight;
    this.bottomEl.style.height = `${height}px`;
  }

  // ロゴのモーションは「comimiについて」を開くたびに最初から再生する。
  private replayAboutLogo(): void {
    this.aboutLogoWrap.replaceChildren(renderComimiLogo());
  }

  private refreshPageListHead(state: ViewerState): void {
    const { manga } = state;
    const head = this.pageListHead;
    head.title.textContent = manga.title;
    head.author.textContent = manga.author ? `@${manga.author}` : "";
    head.author.style.display = manga.author ? "" : "none";
    head.count.textContent = this.i18n.t("pageList.count", {
      count: manga.pages.length
    });

    const cover = manga.pages[0];
    const key = `${manga.id}:${cover?.id ?? ""}:${cover?.type ?? ""}`;
    if (this.coverCacheKey === key) {
      return;
    }
    this.coverCacheKey = key;
    head.thumb.replaceChildren();
    if (cover?.type === "image") {
      const image = document.createElement("img");
      image.alt = "";
      image.draggable = false;
      image.src = cover.thumbnailSrc ?? cover.src;
      head.thumb.append(image);
    }
  }

  private refreshPageList(state: ViewerState): void {
    const key = `${state.settings.locale}:${state.manga.id}:${state.manga.pages.length}`;
    if (this.pageListCacheKey === key) {
      return;
    }
    this.pageListCacheKey = key;

    this.pageListInner.replaceChildren();
    this.pageListItems.clear();
    state.manga.pages.forEach((page, index) => {
      const item = this.buildPageListItem(page, index);
      this.pageListItems.set(index, item);
      this.pageListInner.append(item);
    });
  }

  private buildPageListItem(page: MangaPage, index: number): HTMLButtonElement {
    const item = document.createElement("button");
    item.type = "button";
    item.className = "comimi-page-list-item";
    item.addEventListener("click", (event) => {
      event.stopPropagation();
      this.callbacks.goToPage(index);
      this.callbacks.setPanel("none");
    });

    const thumb = document.createElement("span");
    thumb.className = "comimi-page-list-thumb";

    const badge = document.createElement("span");
    badge.className = "comimi-page-list-badge";
    badge.textContent = String(index + 1);
    thumb.append(badge);

    const heart = document.createElement("span");
    heart.className = "comimi-page-list-heart";
    heart.append(icon("heart"));
    thumb.append(heart);

    if (page.type === "image") {
      const image = document.createElement("img");
      image.alt =
        page.alt ??
        page.label ??
        this.i18n.t("seek.previewAlt", { page: index + 1 });
      image.draggable = false;
      image.src = page.thumbnailSrc ?? page.src;
      thumb.append(image);
    } else if (page.type === "html") {
      const placeholder = document.createElement("span");
      placeholder.className = "comimi-page-list-thumb-html";
      placeholder.textContent = this.i18n.t("pageList.htmlContent");
      thumb.append(placeholder);
    }

    item.append(thumb);
    if (page.label) {
      const text = document.createElement("span");
      text.className = "comimi-page-list-text";
      text.textContent = page.label;
      item.append(text);
    }
    return item;
  }

  // 「ここすき！」一覧は登録順に並べる。ページ一覧側にはハートのバッジを出す。
  private refreshFavorites(state: ViewerState): void {
    const favoriteIds = new Set(state.favoritePageIds);
    for (const [index, item] of this.pageListItems) {
      const page = state.manga.pages[index];
      item.dataset.favorite = String(!!page && favoriteIds.has(page.id));
    }

    const key = `${state.settings.locale}:${state.manga.id}:${state.favoritePageIds.join(",")}`;
    if (this.favoritesCacheKey === key) {
      return;
    }
    this.favoritesCacheKey = key;

    const indexById = new Map(
      state.manga.pages.map((page, index) => [page.id, index] as const)
    );
    this.favoritesGrid.replaceChildren();
    for (const pageId of state.favoritePageIds) {
      const index = indexById.get(pageId);
      const page = index === undefined ? undefined : state.manga.pages[index];
      if (index === undefined || !page) {
        continue;
      }
      const cell = document.createElement("div");
      cell.className = "comimi-favorite-item";

      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "comimi-favorite-remove";
      remove.setAttribute("aria-label", this.i18n.t("favorites.remove"));
      remove.addEventListener("click", (event) => {
        event.stopPropagation();
        this.callbacks.removeFavorite(index);
      });

      cell.append(this.buildPageListItem(page, index), remove);

      if (this.options.pageQueryParam) {
        const open = document.createElement("a");
        open.className = "comimi-favorite-open";
        open.target = "_blank";
        open.rel = "noopener noreferrer";
        const openBg = document.createElement("span");
        openBg.className = "comimi-favorite-open-bg";
        const openText = document.createElement("span");
        openText.className = "comimi-favorite-open-text";
        openText.textContent = this.i18n.t("favorites.openInNewTab");
        open.append(openBg, openText);
        open.href = this.buildPageUrl(index);
        // 表示中に URL が変わっていても最新の URL で開けるよう、クリック時に張り替える
        open.addEventListener("click", (event) => {
          event.stopPropagation();
          open.href = this.buildPageUrl(index);
        });
        cell.append(open);
      }

      this.favoritesGrid.append(cell);
    }
    const isEmpty = this.favoritesGrid.childElementCount === 0;
    this.favoritesGrid.hidden = isEmpty;
    this.favoritesEmpty.hidden = !isEmpty;
  }

  private buildTop(): HTMLButtonElement {
    const top = document.createElement("button");
    top.type = "button";
    top.className = "comimi-menu-top";
    top.addEventListener("click", (event) => {
      event.stopPropagation();
      const isOpen = isMenuPanel(this.currentState?.panel ?? "none");
      this.callbacks.setPanel(isOpen ? "none" : "menu");
    });

    const buttonFrame = document.createElement("span");
    buttonFrame.className = "comimi-menu-button";

    const buttonInner = document.createElement("span");
    buttonInner.className = "comimi-menu-button-inner";
    buttonInner.append(icon("menu"), icon("close"));

    buttonFrame.append(buttonInner);

    const titleWrap = document.createElement("span");
    titleWrap.className = "comimi-menu-title-wrap";

    const titleInner = document.createElement("span");
    titleInner.className = "comimi-menu-title-inner";

    const main = document.createElement("span");
    main.className = "comimi-menu-title-main";

    const title = document.createElement("span");
    title.className = "comimi-menu-title";

    const author = document.createElement("span");
    author.className = "comimi-menu-author";

    main.append(title, author);

    const detail = document.createElement("span");
    detail.className = "comimi-menu-title-detail";

    titleInner.append(main, detail);
    titleWrap.append(titleInner);
    top.append(buttonFrame, titleWrap);
    return top;
  }

  private findTitleNodes(
    top: HTMLButtonElement
  ): [HTMLSpanElement, HTMLSpanElement, HTMLSpanElement] {
    const title = top.querySelector<HTMLSpanElement>(".comimi-menu-title");
    const author = top.querySelector<HTMLSpanElement>(".comimi-menu-author");
    const detail = top.querySelector<HTMLSpanElement>(
      ".comimi-menu-title-detail"
    );
    if (!title || !author || !detail) {
      throw new Error("MenuPanel title nodes missing");
    }
    return [title, author, detail];
  }

  private buildMenuView(): HTMLDivElement {
    const view = document.createElement("div");
    view.className = "comimi-menu-view comimi-menu-view-menu";

    const list = document.createElement("div");
    list.className = "comimi-menu-list";
    list.append(
      this.renderMenuLink("menu.openPages", () =>
        this.callbacks.setPanel("pages")
      ),
      this.renderMenuLink("menu.openFavorites", () =>
        this.callbacks.setPanel("favorites")
      ),
      this.renderMenuLink(
        "menu.openShortcuts",
        () => this.callbacks.setPanel("shortcuts"),
        "comimi-menu-link-shortcuts"
      ),
      this.renderMenuLink("menu.openShare", () =>
        this.callbacks.setPanel("share")
      ),
      this.renderMenuLink("menu.openAbout", () =>
        this.callbacks.setPanel("about")
      )
    );

    view.append(list);
    return view;
  }

  private renderMenuLink(
    labelKey: string,
    onClick: () => void,
    className = ""
  ): HTMLButtonElement {
    const link = document.createElement("button");
    link.type = "button";
    link.className = `comimi-menu-link ${className}`.trim();
    link.addEventListener("click", (event) => {
      event.stopPropagation();
      onClick();
    });

    const text = document.createElement("span");
    text.className = "comimi-menu-link-text";
    this.bindI18nText(text, labelKey);

    const arrow = document.createElement("span");
    arrow.className = "comimi-menu-link-arrow";
    arrow.append(icon("arrow"));

    link.append(text, arrow);
    return link;
  }

  private buildShortcutView(): HTMLDivElement {
    const view = document.createElement("div");
    view.className = "comimi-menu-view comimi-menu-view-shortcut";

    const inner = document.createElement("div");
    inner.className = "comimi-shortcut-inner";

    const grid = document.createElement("div");
    grid.className = "comimi-shortcut-grid";
    inner.append(grid);

    bindScrollFade(inner);

    grid.append(
      this.shortcutSection("shortcut.section.page", [
        [["←", "Space"], "shortcut.moveLeft"],
        [["→", "Space + Shift"], "shortcut.moveRight"],
        [["A"], "shortcut.autoPageTurnLabel"]
      ])
    );

    if (!this.options.lockLayoutMode) {
      grid.append(
        this.shortcutSection(
          "shortcut.section.viewMode",
          [
            [["N", "Esc"], "layout.inline"],
            [["W"], "layout.wide"],
            [["F"], "layout.browserFullscreen"]
          ],
          true
        )
      );
    }

    grid.append(
      this.shortcutSection(
        "shortcut.section.general",
        [
          [["O"], "shortcut.overlayToggle"],
          [["M"], "overlay.menu"],
          [["P"], "shortcut.pageModeToggle"],
          [["C"], "shortcut.coverToggle"],
          [["S"], "overlay.settings"]
        ],
        true
      )
    );

    view.append(inner, this.renderBackButton());
    return view;
  }

  private buildPageListView(): [HTMLDivElement, HTMLDivElement, PageListHead] {
    const view = document.createElement("div");
    view.className = "comimi-menu-view comimi-menu-view-page-list";

    const head = this.buildPageListHead();

    const inner = document.createElement("div");
    inner.className = "comimi-page-list-inner";

    const grid = document.createElement("div");
    grid.className = "comimi-page-list-grid";
    inner.append(head.root, grid);

    bindScrollFade(inner);

    view.append(inner, this.renderBackButton());
    return [view, grid, head];
  }

  private buildFavoritesView(): [HTMLDivElement, HTMLDivElement, HTMLDivElement] {
    const view = document.createElement("div");
    view.className = "comimi-menu-view comimi-menu-view-favorites";

    const inner = document.createElement("div");
    inner.className = "comimi-favorites-inner";

    const description = document.createElement("p");
    description.className = "comimi-favorites-description";
    this.bindI18nText(description, "favorites.description");

    const grid = document.createElement("div");
    grid.className = "comimi-page-list-grid";

    const empty = document.createElement("div");
    empty.className = "comimi-favorites-empty";
    empty.append(icon("heart"));
    const emptyText = document.createElement("span");
    this.bindI18nText(emptyText, "favorites.empty");
    empty.append(emptyText);

    inner.append(description, grid, empty);
    bindScrollFade(inner);

    view.append(inner, this.renderBackButton());
    return [view, grid, empty];
  }

  private buildPageListHead(): PageListHead {
    const root = document.createElement("div");
    root.className = "comimi-page-list-head";

    const thumb = document.createElement("span");
    thumb.className = "comimi-page-list-cover";

    const body = document.createElement("span");
    body.className = "comimi-page-list-head-body";

    const title = document.createElement("span");
    title.className = "comimi-page-list-head-title";

    const author = document.createElement("span");
    author.className = "comimi-page-list-head-author";

    const count = document.createElement("span");
    count.className = "comimi-page-list-head-count";

    body.append(title, author, count);
    root.append(thumb, body);
    return { root, thumb, title, author, count };
  }

  private buildAboutView(): [HTMLDivElement, HTMLDivElement] {
    const view = document.createElement("div");
    view.className = "comimi-menu-view comimi-menu-view-about";

    const inner = document.createElement("div");
    inner.className = "comimi-about-inner";

    const hero = document.createElement("div");
    hero.className = "comimi-about-hero";
    const logoWrap = document.createElement("div");
    logoWrap.className = "comimi-about-logo";
    hero.append(logoWrap);

    const version = document.createElement("div");
    version.className = "comimi-about-version";
    const versionLabel = document.createElement("span");
    versionLabel.className = "comimi-about-version-label";
    this.bindI18nText(versionLabel, "about.version");
    const versionValue = document.createElement("span");
    versionValue.className = "comimi-about-version-value";
    versionValue.textContent = `v${COMIMI_VERSION}`;
    version.append(versionLabel, versionValue);

    const links = document.createElement("div");
    links.className = "comimi-about-links";
    links.append(
      this.renderAboutLink("about.repository", COMIMI_REPOSITORY_URL),
      this.renderAboutLink("about.site", COMIMI_SITE_URL)
    );

    inner.append(hero, version, links);
    view.append(inner, this.renderBackButton());
    return [view, logoWrap];
  }

  private renderAboutLink(labelKey: string, href: string): HTMLAnchorElement {
    const link = document.createElement("a");
    link.className = "comimi-about-link";
    link.href = href;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.addEventListener("click", (event) => event.stopPropagation());

    const text = document.createElement("span");
    text.className = "comimi-about-link-text";

    const label = document.createElement("span");
    label.className = "comimi-about-link-label";
    this.bindI18nText(label, labelKey);

    const url = document.createElement("span");
    url.className = "comimi-about-link-url";
    url.textContent = href.replace(/^https?:\/\//, "");

    text.append(label, url);

    const arrow = document.createElement("span");
    arrow.className = "comimi-about-link-arrow";
    arrow.append(icon("arrow"));

    link.append(text, arrow);
    return link;
  }

  private buildShareView(): [HTMLDivElement, HTMLInputElement] {
    const view = document.createElement("div");
    view.className = "comimi-menu-view comimi-menu-view-share";

    const inner = document.createElement("div");
    inner.className = "comimi-share-inner";

    const field = document.createElement("div");
    field.className = "comimi-share-field";

    const input = document.createElement("input");
    input.type = "text";
    input.className = "comimi-share-url";
    input.readOnly = true;
    input.spellcheck = false;
    this.bindI18n("share.url", (text) => input.setAttribute("aria-label", text));
    input.addEventListener("focus", () => input.select());
    input.addEventListener("click", (event) => {
      event.stopPropagation();
      input.select();
    });

    const copy = document.createElement("button");
    copy.type = "button";
    copy.className = "comimi-share-copy";
    const copyBg = document.createElement("span");
    copyBg.className = "comimi-share-copy-bg";
    const copyText = document.createElement("span");
    copyText.className = "comimi-share-copy-text";
    this.bindI18nText(copyText, "share.copy");
    copy.append(copyBg, copyText);
    copy.addEventListener("click", (event) => {
      event.stopPropagation();
      void this.copyShareUrl();
    });

    field.append(input, copy);
    inner.append(field);

    if (this.options.pageQueryParam) {
      const checkbox = new Checkbox(() => {
        if (this.currentState) {
          this.refreshShareUrl(this.currentState);
        }
      });
      this.bindI18n("share.includePage", (text) => checkbox.setLabel(text));
      this.sharePageCheckbox = checkbox;
      inner.append(checkbox.getElement());
    }

    view.append(inner, this.renderBackButton());
    return [view, input];
  }

  /** 指定ページを開くクエリパラメータ付きの現在 URL を組み立てる。 */
  private buildPageUrl(pageIndex: number): string {
    if (typeof window === "undefined" || !this.options.pageQueryParam) {
      return "";
    }
    const url = new URL(window.location.href);
    url.searchParams.set(this.options.pageQueryParam, String(pageIndex + 1));
    return url.toString();
  }

  private buildShareUrl(state: ViewerState): string {
    if (typeof window === "undefined") {
      return "";
    }
    const url = new URL(window.location.href);
    const key = this.options.pageQueryParam;
    if (key) {
      url.searchParams.delete(key);
      if (this.sharePageCheckbox?.isChecked()) {
        url.searchParams.set(key, String(state.currentPageIndex + 1));
      }
    }
    return url.toString();
  }

  private refreshShareUrl(state: ViewerState): void {
    const next = this.buildShareUrl(state);
    if (this.shareUrlInput.value !== next) {
      this.shareUrlInput.value = next;
    }
  }

  private async copyShareUrl(): Promise<void> {
    const text = this.shareUrlInput.value;
    let copied = false;
    try {
      await navigator.clipboard.writeText(text);
      copied = true;
    } catch {
      this.shareUrlInput.select();
      copied = document.execCommand("copy");
    }
    if (copied) {
      this.callbacks.notify(this.i18n.t("share.copied"), "success");
    }
  }

  private shortcutSection(
    titleKey: string,
    items: Array<[string[], string]>,
    column = false
  ): HTMLDivElement {
    const section = document.createElement("div");
    section.className = "comimi-shortcut-section";

    const heading = document.createElement("div");
    heading.className = "comimi-shortcut-heading";
    this.bindI18nText(heading, titleKey);

    const list = document.createElement("div");
    list.className = column ? "comimi-shortcut-column" : "comimi-shortcut-list";

    for (const [keys, labelKey] of items) {
      list.append(this.shortcutItem(keys, labelKey));
    }

    section.append(heading, list);
    return section;
  }

  private shortcutItem(keys: string[], labelKey: string): HTMLDivElement {
    const wrapper = document.createElement("div");
    wrapper.className = "comimi-shortcut-item";

    const badge = document.createElement("span");
    badge.className = "comimi-shortcut-badge";
    keys.forEach((key, index) => {
      if (index > 0) {
        const or = document.createElement("span");
        or.className = "comimi-shortcut-or";
        badge.append(or);
      }
      const keyEl = document.createElement("span");
      keyEl.className = "comimi-shortcut-key";
      keyEl.textContent = key;
      badge.append(keyEl);
    });

    const labelEl = document.createElement("span");
    labelEl.className = "comimi-shortcut-label";
    this.bindI18nText(labelEl, labelKey);

    wrapper.append(badge, labelEl);
    return wrapper;
  }

  private renderBackButton(): HTMLButtonElement {
    const back = document.createElement("button");
    back.type = "button";
    back.className = "comimi-back-button";
    back.addEventListener("click", (event) => {
      event.stopPropagation();
      this.callbacks.setPanel("menu");
    });

    const inner = document.createElement("span");
    inner.className = "comimi-back-inner";

    const bg = document.createElement("span");
    bg.className = "comimi-back-bg";

    const text = document.createElement("span");
    text.className = "comimi-back-text";
    this.bindI18nText(text, "menu.back");

    const arrow = document.createElement("span");
    arrow.className = "comimi-back-arrow";
    arrow.append(icon("arrow"));

    inner.append(bg, text, arrow);
    back.append(inner);
    return back;
  }
}
