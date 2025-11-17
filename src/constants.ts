/** 候補となる本文セレクターの一覧。先にマッチしたものを採用する。 */
export const ARTICLE_CANDIDATES = [
  ".note-common-styles__textnote-body",
  ".p-article__body",
  "article.p-article",
  "article.o-article",
  "section[data-article-id]",
  "div[data-article-body]",
];

/** sessionStorage に縦書き設定を保存する際のキー。 */
export const STATE_KEY = "noteVerticalEnabled";
/** sessionStorage にフォント種別を保存する際のキー。 */
export const FONT_STATE_KEY = "noteVerticalFontSerif";
/** sessionStorage にフォントサイズを保存する際のキー。 */
export const FONT_SIZE_STATE_KEY = "noteVerticalFontSize";

/** UI コンポーネントやクラス名の識別子をまとめて定義。 */
export const CONTROL_PANEL_ID = "nv-control-panel";
export const BUTTON_ID = "nv-toggle-button";
export const FONT_BUTTON_ID = "nv-font-button";
export const FONT_SIZE_MINUS_BUTTON_ID = "nv-font-size-minus";
export const FONT_SIZE_PLUS_BUTTON_ID = "nv-font-size-plus";
export const VIEWER_NAV_ID = "nv-viewer-nav";
export const NAV_VISIBLE_CLASS = "nv-viewer-nav--visible";
export const MEDIA_PAGE_CLASS = "nv-page-block";
export const QUOTE_PAGE_CLASS = "nv-quote-block";
export const MEDIA_BLOCK_SELECTOR = "figure";
export const QUOTE_BLOCK_SELECTOR = "blockquote";
export const BLOCK_CONTAINER_SELECTOR = `${MEDIA_BLOCK_SELECTOR}, ${QUOTE_BLOCK_SELECTOR}`;
export const PAGE_BREAK_CLASS = "nv-page-break";

/** UI から選択できるフォントサイズとデフォルト位置。 */
export const FONT_SIZES = [8, 10, 12, 14, 15, 16, 18, 20];
export const DEFAULT_FONT_SIZE_INDEX = 4;

export type PageDirection = "prev" | "next";
