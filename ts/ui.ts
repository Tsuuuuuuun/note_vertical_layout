import {
  BUTTON_ID,
  CONTROL_PANEL_ID,
  FONT_BUTTON_ID,
  FONT_SIZE_MINUS_BUTTON_ID,
  FONT_SIZE_PLUS_BUTTON_ID,
  FONT_SIZES,
  FULLSCREEN_BUTTON_ID
} from "./constants";
import { ViewerLayout } from "./layout";
import { StateStore } from "./state";
import {
    attachFullscreenButton,
    setFullscreenButtonAvailability,
    setFullscreenState
} from "./fullscreen";

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
    StateStore.saveVertical(newState);
    ViewerLayout.applyVertical(newState);
  });
  return button;
};

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
    StateStore.saveFont(newIsSerif);
    ViewerLayout.applyFont(newIsSerif);
  });
  return button;
};

const createFontSizeButtons = (
  initialSizeIndex: number
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
      StateStore.saveFontSize(currentIndex);
      ViewerLayout.applyFontSize(currentIndex);
      updateButtons();
    }
  });

  plusButton.addEventListener("click", () => {
    if (currentIndex < FONT_SIZES.length - 1) {
      currentIndex++;
      StateStore.saveFontSize(currentIndex);
      ViewerLayout.applyFontSize(currentIndex);
      updateButtons();
    }
  });

  updateButtons();
  return [minusButton, plusButton];
};

const createFullscreenButton = (initialState: boolean): HTMLButtonElement => {
  const button = document.createElement("button");
  button.id = FULLSCREEN_BUTTON_ID;
  button.type = "button";
  button.className = "nv-control-button";
  button.textContent = "全画面";
  button.title = "全画面で表示（Escで解除）";
  button.setAttribute("aria-label", initialState ? "全画面を終了" : "全画面で表示");
  button.setAttribute("aria-pressed", String(initialState));

  button.addEventListener("click", () => {
    const newState = button.getAttribute("aria-pressed") !== "true";
    setFullscreenState(newState);
  });

  return button;
};

export const injectUI = () => {
  if (document.getElementById(CONTROL_PANEL_ID)) return; // 多重挿入防止

  const initialState = StateStore.loadVertical();
  const initialFontState = StateStore.loadFont();
  const initialFontSizeIndex = StateStore.loadFontSize();
  const initialFullscreenState = StateStore.loadFullscreen();

  const panel = document.createElement("div");
  panel.id = CONTROL_PANEL_ID;

  const toggleButton = createToggleButton(initialState);
  const fontButton = createFontButton(initialFontState);
  const [fontSizeMinusButton, fontSizePlusButton] = createFontSizeButtons(initialFontSizeIndex);
  const fullscreenButton = createFullscreenButton(initialFullscreenState);
  attachFullscreenButton(fullscreenButton);

  const toggleLabel = document.createElement("span");
  toggleLabel.className = "nv-control-label";
  toggleLabel.textContent = "縦書き";

  const fontLabel = document.createElement("span");
  fontLabel.className = "nv-control-label";
  fontLabel.textContent = "明朝体";

  panel.appendChild(toggleLabel);
  panel.appendChild(toggleButton);
  panel.appendChild(fontLabel);
  panel.appendChild(fontButton);
  panel.appendChild(fontSizeMinusButton);
  panel.appendChild(fontSizePlusButton);
  panel.appendChild(fullscreenButton);
  document.body.appendChild(panel);

  ViewerLayout.applyVertical(initialState);
  ViewerLayout.applyFont(initialFontState);
  ViewerLayout.applyFontSize(initialFontSizeIndex);
  setFullscreenState(initialFullscreenState, false);
  setFullscreenButtonAvailability(initialState);
};
