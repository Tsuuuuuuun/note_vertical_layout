import { DEFAULT_FONT_SIZE_INDEX, FONT_SIZES } from "./constants";

const STATE_KEY = "noteVerticalEnabled";
const FONT_STATE_KEY = "noteVerticalFontSerif";
const FONT_SIZE_STATE_KEY = "noteVerticalFontSize";
const FULLSCREEN_STATE_KEY = "noteVerticalFullscreen";

export const StateStore = {
  loadVertical(): boolean {
    return sessionStorage.getItem(STATE_KEY) === "true";
  },
  saveVertical(enabled: boolean) {
    sessionStorage.setItem(STATE_KEY, String(enabled));
  },
  loadFont(): boolean {
    const stored = sessionStorage.getItem(FONT_STATE_KEY);
    return stored === null ? false : stored === "true"; // デフォルトはゴシック体(false)
  },
  saveFont(isSerif: boolean) {
    sessionStorage.setItem(FONT_STATE_KEY, String(isSerif));
  },
  loadFontSize(): number {
    const stored = sessionStorage.getItem(FONT_SIZE_STATE_KEY);
    if (stored === null) return DEFAULT_FONT_SIZE_INDEX;
    const index = parseInt(stored, 10);
    return index >= 0 && index < FONT_SIZES.length ? index : DEFAULT_FONT_SIZE_INDEX;
  },
  saveFontSize(sizeIndex: number) {
    sessionStorage.setItem(FONT_SIZE_STATE_KEY, String(sizeIndex));
  },
  loadFullscreen(): boolean {
    return sessionStorage.getItem(FULLSCREEN_STATE_KEY) === "true";
  },
  saveFullscreen(enabled: boolean) {
    sessionStorage.setItem(FULLSCREEN_STATE_KEY, String(enabled));
  }
};
