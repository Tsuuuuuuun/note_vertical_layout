export const ARTICLE_CANDIDATES = [
  ".note-common-styles__textnote-body",
  ".p-article__body",
  "article.p-article",
  "article.o-article",
  "section[data-article-id]",
  "div[data-article-body]"
];

export const CONTROL_PANEL_ID = "nv-control-panel";
export const BUTTON_ID = "nv-toggle-button";
export const FONT_BUTTON_ID = "nv-font-button";
export const FONT_SIZE_MINUS_BUTTON_ID = "nv-font-size-minus";
export const FONT_SIZE_PLUS_BUTTON_ID = "nv-font-size-plus";
export const FULLSCREEN_BUTTON_ID = "nv-fullscreen-button";
export const VIEWER_NAV_ID = "nv-viewer-nav";

export const NAV_VISIBLE_CLASS = "nv-viewer-nav--visible";
export const NAV_FULLSCREEN_CLASS = "nv-viewer-nav--fullscreen";
export const MEDIA_PAGE_CLASS = "nv-page-block";
export const QUOTE_PAGE_CLASS = "nv-quote-block";
export const MEDIA_BLOCK_SELECTOR = "figure";
export const QUOTE_BLOCK_SELECTOR = "blockquote";
export const BLOCK_CONTAINER_SELECTOR = `${MEDIA_BLOCK_SELECTOR}, ${QUOTE_BLOCK_SELECTOR}`;
export const PAGE_BREAK_CLASS = "nv-page-break";
export const FULLSCREEN_CLASS = "nv-fullscreen";
export const BODY_FULLSCREEN_CLASS = "nv-body-fullscreen";
export const VERTICAL_ENABLED_CLASS = "nv-vertical-enabled";
export const FONT_SERIF_CLASS = "nv-font-serif";
export const FONT_SANS_CLASS = "nv-font-sans";

export const FONT_SIZES = [8, 10, 12, 14, 15, 16, 18, 20];
export const DEFAULT_FONT_SIZE_INDEX = 4;

export type PageDirection = "prev" | "next";
