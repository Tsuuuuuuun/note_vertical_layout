import { injectUI } from "./src/ui";

/** DOMContentLoaded 後に制御パネルを挿入する初期化処理。 */
const boot = () => {
  if (document.readyState === "complete" || document.readyState === "interactive") {
    injectUI();
  } else {
    document.addEventListener("DOMContentLoaded", injectUI);
  }
};

boot();
