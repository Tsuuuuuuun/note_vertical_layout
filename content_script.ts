import { injectUI } from "./ts/ui";

const start = () => injectUI();

if (document.readyState === "complete" || document.readyState === "interactive") {
  start();
} else {
  document.addEventListener("DOMContentLoaded", start);
}
