import {
  BLOCK_CONTAINER_SELECTOR,
  FONT_SANS_CLASS,
  FONT_SERIF_CLASS,
  FONT_SIZES,
  MEDIA_BLOCK_SELECTOR,
  MEDIA_PAGE_CLASS,
  PAGE_BREAK_CLASS,
  NAV_VISIBLE_CLASS,
  QUOTE_BLOCK_SELECTOR,
  QUOTE_PAGE_CLASS,
  VERTICAL_ENABLED_CLASS
} from "./constants";
import { ensureViewerNav } from "./navigation";
import { getArticle } from "./article";
import { setFullscreenButtonAvailability, setFullscreenState } from "./fullscreen";

const togglePageBreaks = (block: HTMLElement, enabled: boolean) => {
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
    if (sibling && sibling.classList.contains(PAGE_BREAK_CLASS) && sibling.getAttribute("data-nv-break") === "true") {
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

const updateMediaBlocks = (article: HTMLElement, enabled: boolean) => {
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
    const hasQuote = block.querySelector(QUOTE_BLOCK_SELECTOR) !== null || block.matches(QUOTE_BLOCK_SELECTOR);
    const isMediaPage = enabled && hasVisual;
    const isQuotePage = enabled && hasQuote && !hasVisual;

    block.classList.toggle(MEDIA_PAGE_CLASS, isMediaPage);
    block.classList.toggle(QUOTE_PAGE_CLASS, isQuotePage);
    // togglePageBreaks(block, isMediaPage || isQuotePage);  // デフォルトで無効化
  });
};

const setViewerState = (article: HTMLElement, enabled: boolean) => {
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

export const ViewerLayout = {
  applyVertical(enabled: boolean) {
    const article = getArticle();
    if (!article) {
      console.warn("[note vertical] 本文要素が見つかりません。");
      return;
    }
    article.classList.toggle(VERTICAL_ENABLED_CLASS, enabled);
    updateMediaBlocks(article, enabled);
    setViewerState(article, enabled);

    if (!enabled) {
      setFullscreenState(false);
    }

    setFullscreenButtonAvailability(enabled);
  },
  applyFont(isSerif: boolean) {
    const article = getArticle();
    if (!article) return;
    article.classList.toggle(FONT_SERIF_CLASS, isSerif);
    article.classList.toggle(FONT_SANS_CLASS, !isSerif);
  },
  applyFontSize(sizeIndex: number) {
    const article = getArticle();
    if (!article) return;
    const size = FONT_SIZES[sizeIndex];
    article.style.fontSize = `${size}px`;
  }
};
