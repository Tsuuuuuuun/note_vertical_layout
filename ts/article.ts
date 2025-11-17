import { ARTICLE_CANDIDATES } from "./constants";

export const getArticle = (): HTMLElement | null => {
  for (const selector of ARTICLE_CANDIDATES) {
    const match = document.querySelector<HTMLElement>(selector);
    if (match) return match;
  }
  return null;
};

export const getPageViewportWidth = (article: HTMLElement): number => {
  const rectWidth = article.getBoundingClientRect().width;
  const style = getComputedStyle(article);
  const paddingLeft = parseFloat(style.paddingLeft) || 0;
  const paddingRight = parseFloat(style.paddingRight) || 0;
  const visibleWidth = rectWidth - paddingLeft - paddingRight;
  return visibleWidth > 0 ? visibleWidth : article.clientWidth;
};
