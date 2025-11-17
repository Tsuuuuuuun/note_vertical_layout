import { FONT_SIZES } from "./constants";
import { getArticle } from "./article";

/** 本文にフォント種別（明朝/ゴシック）クラスを適用する。 */
export const applyFontState = (isSerif: boolean): void => {
  const article = getArticle();
  if (!article) return;
  article.classList.toggle("nv-font-serif", isSerif);
  article.classList.toggle("nv-font-sans", !isSerif);
};

/** UI で選択されたフォントサイズを本文に反映する。 */
export const applyFontSizeState = (sizeIndex: number): void => {
  const article = getArticle();
  if (!article) return;
  const size = FONT_SIZES[sizeIndex];
  article.style.fontSize = `${size}px`;
};
