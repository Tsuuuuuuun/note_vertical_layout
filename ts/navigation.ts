import {
  NAV_FULLSCREEN_CLASS,
  NAV_VISIBLE_CLASS,
  VIEWER_NAV_ID,
  type PageDirection
} from "./constants";
import { getArticle, getPageViewportWidth } from "./article";

export const scrollViewerPage = (direction: PageDirection) => {
  const article = getArticle();
  if (!article) return;
  const maxScrollable = article.scrollWidth - article.clientWidth;
  if (maxScrollable <= 0) return;
  const delta = getPageViewportWidth(article);
  const offset = direction === "next" ? -delta : delta;
  if (typeof article.scrollBy === "function") {
    article.scrollBy({ left: offset, behavior: "smooth" });
  } else {
    article.scrollLeft += offset;
  }
};

export const ensureViewerNav = (article: HTMLElement): HTMLDivElement | null => {
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

export const toggleViewerNav = (
  nav: HTMLDivElement | null,
  enabled: boolean,
  fullscreen: boolean
) => {
  if (!nav) return;
  nav.classList.toggle(NAV_VISIBLE_CLASS, enabled);
  nav.setAttribute("aria-hidden", String(!enabled));
  nav.classList.toggle(NAV_FULLSCREEN_CLASS, fullscreen);
};
