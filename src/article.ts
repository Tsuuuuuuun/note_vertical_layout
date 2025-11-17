import {
  ARTICLE_CANDIDATES,
  BLOCK_CONTAINER_SELECTOR,
  MEDIA_BLOCK_SELECTOR,
  MEDIA_PAGE_CLASS,
  NAV_VISIBLE_CLASS,
  PAGE_BREAK_CLASS,
  QUOTE_BLOCK_SELECTOR,
  QUOTE_PAGE_CLASS,
  VIEWER_NAV_ID,
} from "./constants";
import type { PageDirection } from "./constants";

/** note の DOM から本文に該当する要素を探し、最初に一致したものを返す。 */
export const getArticle = (): HTMLElement | null => {
  for (const selector of ARTICLE_CANDIDATES) {
    const match = document.querySelector<HTMLElement>(selector);
    if (match) return match;
  }
  return null;
};

/** ビューアーの左右ナビゲーションをスクロールする。 */
const scrollViewerPage = (direction: PageDirection): void => {
  const article = getArticle();
  if (!article) return;
  const maxScrollable = article.scrollWidth - article.clientWidth;
  if (maxScrollable <= 0) return;
  const delta = article.clientWidth;
  const offset = direction === "next" ? -delta : delta;
  if (typeof article.scrollBy === "function") {
    article.scrollBy({ left: offset, behavior: "smooth" });
  } else {
    article.scrollLeft += offset;
  }
};

/** ナビゲーション UI が未生成なら作成し、参照を返す。 */
const ensureViewerNav = (article: HTMLElement): HTMLDivElement | null => {
  let nav = document.getElementById(VIEWER_NAV_ID) as HTMLDivElement | null;
  if (nav) return nav;
  nav = document.createElement("div");
  nav.id = VIEWER_NAV_ID;
  nav.className = "nv-viewer-nav";

  const createNavButton = (label: string, direction: PageDirection) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "nv-viewer-button";
    button.textContent = label;
    button.addEventListener("click", () => scrollViewerPage(direction));
    return button;
  };

  const next = createNavButton("次のページ", "next");
  const prev = createNavButton("前のページ", "prev");
  nav.append(next, prev);

  const parent = article.parentElement ?? document.body;
  parent.insertBefore(nav, article.nextSibling);
  return nav;
};

/** メディアや引用ブロックの前後にページブレイクを挿入/削除する。 */
const togglePageBreaks = (block: HTMLElement, enabled: boolean): void => {
  const parent = block.parentElement;
  if (!parent) return;

  const ensureSpacer = (isBefore: boolean) => {
    const sibling = isBefore ? block.previousElementSibling : block.nextElementSibling;
    if (sibling && sibling.classList.contains(PAGE_BREAK_CLASS)) return;
    const spacer = document.createElement("span");
    spacer.className = PAGE_BREAK_CLASS;
    spacer.setAttribute("data-nv-break", "true");
    parent.insertBefore(spacer, isBefore ? block : block.nextSibling);
  };

  const removeSpacer = (isBefore: boolean) => {
    const sibling = isBefore ? block.previousElementSibling : block.nextElementSibling;
    if (
      sibling &&
      sibling.classList.contains(PAGE_BREAK_CLASS) &&
      sibling.getAttribute("data-nv-break") === "true"
    ) {
      sibling.remove();
    }
  };

  if (enabled) {
    ensureSpacer(true);
    ensureSpacer(false);
  } else {
    removeSpacer(true);
    removeSpacer(false);
  }
};

/** 画像や引用ブロックにページ種別クラスを付与し、縦書きのレイアウト崩れを防ぐ。 */
const updateMediaBlocks = (article: HTMLElement, enabled: boolean): void => {
  const containers = new Set<HTMLElement>();
  article.querySelectorAll<HTMLElement>(BLOCK_CONTAINER_SELECTOR).forEach((node) => {
    const container =
      node.matches(MEDIA_BLOCK_SELECTOR) || node.tagName === "FIGURE"
        ? node.closest("figure") ?? node
        : (node.closest("figure") as HTMLElement) ?? node;
    if (container) containers.add(container);
  });

  containers.forEach((block) => {
    const hasVisual = block.querySelector("img, video, iframe, picture") !== null;
    const hasQuote =
      block.querySelector(QUOTE_BLOCK_SELECTOR) !== null || block.matches(QUOTE_BLOCK_SELECTOR);
    const isMediaPage = enabled && hasVisual;
    const isQuotePage = enabled && hasQuote && !hasVisual;

    block.classList.toggle(MEDIA_PAGE_CLASS, isMediaPage);
    block.classList.toggle(QUOTE_PAGE_CLASS, isQuotePage);
    // togglePageBreaks(block, isMediaPage || isQuotePage);
  });
};

/** 縦書きビューアーのナビゲーション表示やスクロール位置を切り替える。 */
const setViewerState = (article: HTMLElement, enabled: boolean): void => {
  const nav = ensureViewerNav(article);
  if (nav) {
    nav.classList.toggle(NAV_VISIBLE_CLASS, enabled);
    nav.setAttribute("aria-hidden", String(!enabled));
  }
  const startPosition = Math.max(0, article.scrollWidth - article.clientWidth);
  requestAnimationFrame(() => {
    article.scrollLeft = enabled ? startPosition : 0;
  });
};

/**
 * 縦書き設定が切り替わった際に、本文へ必要なクラスや状態を反映する。
 */
export const applyState = (enabled: boolean): void => {
  const article = getArticle();
  if (!article) {
    console.warn("[note vertical] 本文要素が見つかりません。");
    return;
  }
  article.classList.toggle("nv-vertical-enabled", enabled);
  updateMediaBlocks(article, enabled);
  setViewerState(article, enabled);
};
