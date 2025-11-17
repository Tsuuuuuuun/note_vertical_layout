import {
  DEFAULT_FONT_SIZE_INDEX,
  FONT_SIZE_STATE_KEY,
  FONT_SIZES,
  FONT_STATE_KEY,
  STATE_KEY,
} from "./constants";

/** sessionStorage から縦書き有効フラグを読み出す。 */
export const loadState = (): boolean => sessionStorage.getItem(STATE_KEY) === "true";

/** sessionStorage に縦書き有効フラグを保存する。 */
export const saveState = (enabled: boolean): void =>
  sessionStorage.setItem(STATE_KEY, String(enabled));

/** sessionStorage からフォント種別（明朝/ゴシック）を読み出す。 */
export const loadFontState = (): boolean => {
  const stored = sessionStorage.getItem(FONT_STATE_KEY);
  return stored === null ? false : stored === "true";
};

/** sessionStorage にフォント種別を保存する。 */
export const saveFontState = (isSerif: boolean): void =>
  sessionStorage.setItem(FONT_STATE_KEY, String(isSerif));

/** sessionStorage からフォントサイズのインデックスを読み出す。 */
export const loadFontSizeState = (): number => {
  const stored = sessionStorage.getItem(FONT_SIZE_STATE_KEY);
  if (stored === null) return DEFAULT_FONT_SIZE_INDEX;
  const index = parseInt(stored, 10);
  return index >= 0 && index < FONT_SIZES.length ? index : DEFAULT_FONT_SIZE_INDEX;
};

/** sessionStorage にフォントサイズのインデックスを保存する。 */
export const saveFontSizeState = (sizeIndex: number): void =>
  sessionStorage.setItem(FONT_SIZE_STATE_KEY, String(sizeIndex));
