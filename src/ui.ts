import {
  BUTTON_ID,
  CONTROL_PANEL_ID,
  FONT_BUTTON_ID,
  FONT_SIZE_MINUS_BUTTON_ID,
  FONT_SIZE_PLUS_BUTTON_ID,
  FONT_SIZES,
} from "./constants";
import { applyState } from "./article";
import { applyFontSizeState, applyFontState } from "./font";
import {
  loadFontSizeState,
  loadFontState,
  loadState,
  saveFontSizeState,
  saveFontState,
  saveState,
} from "./storage";

/** 縦書き ON/OFF を切り替えるトグルボタンを生成する。 */
const createToggleButton = (initialState: boolean): HTMLButtonElement => {
  const button = document.createElement("button");
  button.id = BUTTON_ID;
  button.type = "button";
  button.className = "nv-control-button";
  button.textContent = "";
  button.setAttribute("aria-label", initialState ? "縦書き ON" : "縦書き OFF");
  button.setAttribute("aria-pressed", String(initialState));
  button.addEventListener("click", () => {
    const newState = button.getAttribute("aria-pressed") !== "true";
    button.setAttribute("aria-pressed", String(newState));
    button.setAttribute("aria-label", newState ? "縦書き ON" : "縦書き OFF");
    saveState(newState);
    applyState(newState);
  });
  return button;
};

/** 明朝/ゴシックを切り替えるトグルボタンを生成する。 */
const createFontButton = (initialIsSerif: boolean): HTMLButtonElement => {
  const button = document.createElement("button");
  button.id = FONT_BUTTON_ID;
  button.type = "button";
  button.className = "nv-control-button";
  button.textContent = "";
  button.setAttribute("aria-label", initialIsSerif ? "明朝体" : "ゴシック体");
  button.setAttribute("aria-pressed", String(initialIsSerif));
  button.addEventListener("click", () => {
    const newIsSerif = button.getAttribute("aria-pressed") !== "true";
    button.setAttribute("aria-pressed", String(newIsSerif));
    button.setAttribute("aria-label", newIsSerif ? "明朝体" : "ゴシック体");
    saveFontState(newIsSerif);
    applyFontState(newIsSerif);
  });
  return button;
};

/** フォントサイズを増減させる 2 つのボタンを生成する。 */
const createFontSizeButtons = (
  initialSizeIndex: number,
): [HTMLButtonElement, HTMLButtonElement] => {
  let currentIndex = initialSizeIndex;

  const minusButton = document.createElement("button");
  minusButton.id = FONT_SIZE_MINUS_BUTTON_ID;
  minusButton.type = "button";
  minusButton.className = "nv-control-button";
  minusButton.textContent = "A-";
  minusButton.title = "フォントサイズを小さく";

  const plusButton = document.createElement("button");
  plusButton.id = FONT_SIZE_PLUS_BUTTON_ID;
  plusButton.type = "button";
  plusButton.className = "nv-control-button";
  plusButton.textContent = "A+";
  plusButton.title = "フォントサイズを大きく";

  const updateButtons = () => {
    minusButton.disabled = currentIndex <= 0;
    plusButton.disabled = currentIndex >= FONT_SIZES.length - 1;
  };

  minusButton.addEventListener("click", () => {
    if (currentIndex > 0) {
      currentIndex--;
      saveFontSizeState(currentIndex);
      applyFontSizeState(currentIndex);
      updateButtons();
    }
  });

  plusButton.addEventListener("click", () => {
    if (currentIndex < FONT_SIZES.length - 1) {
      currentIndex++;
      saveFontSizeState(currentIndex);
      applyFontSizeState(currentIndex);
      updateButtons();
    }
  });

  updateButtons();
  return [minusButton, plusButton];
};

/** 制御パネルで使うラベル要素を作成する。 */
const createControlLabel = (text: string): HTMLSpanElement => {
  const label = document.createElement("span");
  label.className = "nv-control-label";
  label.textContent = text;
  return label;
};

/** ページに制御パネルを挿入し、保存済み設定を即座に反映させる。 */
export const injectUI = (): void => {
  if (document.getElementById(CONTROL_PANEL_ID)) return;

  const initialState = loadState();
  const initialFontState = loadFontState();
  const initialFontSizeIndex = loadFontSizeState();

  const panel = document.createElement("div");
  panel.id = CONTROL_PANEL_ID;

  const toggleButton = createToggleButton(initialState);
  const fontButton = createFontButton(initialFontState);
  const [fontSizeMinusButton, fontSizePlusButton] = createFontSizeButtons(initialFontSizeIndex);

  panel.appendChild(createControlLabel("縦書き"));
  panel.appendChild(toggleButton);
  panel.appendChild(createControlLabel("明朝体"));
  panel.appendChild(fontButton);
  panel.appendChild(fontSizeMinusButton);
  panel.appendChild(fontSizePlusButton);
  document.body.appendChild(panel);

  applyState(initialState);
  applyFontState(initialFontState);
  applyFontSizeState(initialFontSizeIndex);
};
