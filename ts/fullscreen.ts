import {
  BODY_FULLSCREEN_CLASS,
  FULLSCREEN_CLASS,
  NAV_FULLSCREEN_CLASS,
  VIEWER_NAV_ID,
  VERTICAL_ENABLED_CLASS
} from "./constants";
import { getArticle } from "./article";
import { StateStore } from "./state";

let fullscreenKeyHandler: ((event: KeyboardEvent) => void) | null = null;
let fullscreenButtonRef: HTMLButtonElement | null = null;

const applyFullscreenState = (enabled: boolean) => {
  if (fullscreenButtonRef) {
    fullscreenButtonRef.setAttribute("aria-pressed", String(enabled));
    fullscreenButtonRef.setAttribute("aria-label", enabled ? "全画面を終了" : "全画面で表示");
  }

  document.body.classList.toggle(BODY_FULLSCREEN_CLASS, enabled);

  const article = getArticle();
  if (article) {
    article.classList.toggle(FULLSCREEN_CLASS, enabled);

    const nav = document.getElementById(VIEWER_NAV_ID);
    if (nav) nav.classList.toggle(NAV_FULLSCREEN_CLASS, enabled);
  }

  if (enabled && !fullscreenKeyHandler) {
    fullscreenKeyHandler = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setFullscreenState(false);
      }
    };
    document.addEventListener("keydown", fullscreenKeyHandler);
  } else if (!enabled && fullscreenKeyHandler) {
    document.removeEventListener("keydown", fullscreenKeyHandler);
    fullscreenKeyHandler = null;
  }
};

export const setFullscreenState = (enabled: boolean, persist = true) => {
  const article = getArticle();
  const canEnableFullscreen = !!article && article.classList.contains(VERTICAL_ENABLED_CLASS);

  if (enabled && !canEnableFullscreen) {
    enabled = false;
  }

  if (persist) StateStore.saveFullscreen(enabled);
  applyFullscreenState(enabled);
};

export const attachFullscreenButton = (button: HTMLButtonElement) => {
  fullscreenButtonRef = button;
};

export const setFullscreenButtonAvailability = (enabled: boolean) => {
  if (fullscreenButtonRef) {
    fullscreenButtonRef.disabled = !enabled;
  }
};
