(() => {
    const ARTICLE_CANDIDATES = [
      ".note-common-styles__textnote-body",
      ".p-article__body",
      "article.p-article",
      "article.o-article",
      "section[data-article-id]",
      "div[data-article-body]"
    ];
  
    const STATE_KEY = "noteVerticalEnabled";
    const FONT_STATE_KEY = "noteVerticalFontSerif";
    const FONT_SIZE_STATE_KEY = "noteVerticalFontSize";
    const FULLSCREEN_STATE_KEY = "noteVerticalFullscreen";
    const CONTROL_PANEL_ID = "nv-control-panel";
    const BUTTON_ID = "nv-toggle-button";
    const FONT_BUTTON_ID = "nv-font-button";
    const FONT_SIZE_MINUS_BUTTON_ID = "nv-font-size-minus";
    const FONT_SIZE_PLUS_BUTTON_ID = "nv-font-size-plus";
    const FULLSCREEN_BUTTON_ID = "nv-fullscreen-button";
    const VIEWER_NAV_ID = "nv-viewer-nav";
    const NAV_VISIBLE_CLASS = "nv-viewer-nav--visible";
    const NAV_FULLSCREEN_CLASS = "nv-viewer-nav--fullscreen";
    const MEDIA_PAGE_CLASS = "nv-page-block";
    const QUOTE_PAGE_CLASS = "nv-quote-block";
    const MEDIA_BLOCK_SELECTOR = "figure";
    const QUOTE_BLOCK_SELECTOR = "blockquote";
    const PAGE_BREAK_CLASS = "nv-page-break";
    const FULLSCREEN_CLASS = "nv-fullscreen";
    const BODY_FULLSCREEN_CLASS = "nv-body-fullscreen";
    const FONT_SIZES = [8, 10, 12, 14, 15, 16, 18, 20];
    const DEFAULT_FONT_SIZE_INDEX = 4;
  
    const getArticle = (): HTMLElement | null => {
      for (const selector of ARTICLE_CANDIDATES) {
        const match = document.querySelector<HTMLElement>(selector);
        if (match) return match;
      }
      return null;
    };
  
    const loadState = (): boolean =>
      sessionStorage.getItem(STATE_KEY) === "true";

    const saveState = (enabled: boolean) =>
      sessionStorage.setItem(STATE_KEY, String(enabled));

    const loadFontState = (): boolean => {
      const stored = sessionStorage.getItem(FONT_STATE_KEY);
      return stored === null ? false : stored === "true"; // デフォルトはゴシック体(false)
    };

    const saveFontState = (isSerif: boolean) =>
      sessionStorage.setItem(FONT_STATE_KEY, String(isSerif));

    const loadFontSizeState = (): number => {
      const stored = sessionStorage.getItem(FONT_SIZE_STATE_KEY);
      if (stored === null) return DEFAULT_FONT_SIZE_INDEX;
      const index = parseInt(stored, 10);
      return index >= 0 && index < FONT_SIZES.length ? index : DEFAULT_FONT_SIZE_INDEX;
    };

    const saveFontSizeState = (sizeIndex: number) =>
      sessionStorage.setItem(FONT_SIZE_STATE_KEY, String(sizeIndex));

    const loadFullscreenState = (): boolean =>
      sessionStorage.getItem(FULLSCREEN_STATE_KEY) === "true";

    const saveFullscreenState = (enabled: boolean) =>
      sessionStorage.setItem(FULLSCREEN_STATE_KEY, String(enabled));
  
    type PageDirection = "prev" | "next";

    let fullscreenKeyHandler: ((event: KeyboardEvent) => void) | null = null;
    let fullscreenButtonRef: HTMLButtonElement | null = null;
  
    const scrollViewerPage = (direction: PageDirection) => {
      const article = getArticle();
      if (!article) return;
      const maxScrollable = article.scrollWidth - article.clientWidth;
      if (maxScrollable <= 0) return;
      // ビューアの幅をスクロール量として使用
      const delta = article.clientWidth;
      const offset = direction === "next" ? -delta : delta;
      if (typeof article.scrollBy === "function") {
        article.scrollBy({ left: offset, behavior: "smooth" });
      } else {
        article.scrollLeft += offset;
      }
    };
  
    const ensureViewerNav = (article: HTMLElement): HTMLDivElement | null => {
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
  
    const togglePageBreaks = (block: HTMLElement, enabled: boolean) => {
      const parent = block.parentElement;
      if (!parent) return;

      const ensureSpacer = (isBefore: boolean) => {
        const sibling = isBefore ? block.previousElementSibling : block.nextElementSibling;
        if (sibling && sibling.classList.contains(PAGE_BREAK_CLASS)) return;
        const spacer = document.createElement("span");
        spacer.className = PAGE_BREAK_CLASS;
        spacer.setAttribute("data-nv-break", "true");
        parent.insertBefore(spacer, isBefore ? block : block.nextSibling);
      };

      const removeSpacer = (isBefore: boolean) => {
        const sibling = isBefore ? block.previousElementSibling : block.nextElementSibling;
        if (
          sibling &&
          sibling.classList.contains(PAGE_BREAK_CLASS) &&
          sibling.getAttribute("data-nv-break") === "true"
        ) {
          sibling.remove();
        }
      };

      if (enabled) {
        ensureSpacer(true);
        ensureSpacer(false);
      } else {
        removeSpacer(true);
        removeSpacer(false);
      }
    };
  
    const BLOCK_CONTAINER_SELECTOR = `${MEDIA_BLOCK_SELECTOR}, ${QUOTE_BLOCK_SELECTOR}`;
  
    const updateMediaBlocks = (article: HTMLElement, enabled: boolean) => {
      const containers = new Set<HTMLElement>();
      article
        .querySelectorAll<HTMLElement>(BLOCK_CONTAINER_SELECTOR)
        .forEach((node) => {
          const container =
            node.matches(MEDIA_BLOCK_SELECTOR) || node.tagName === "FIGURE"
              ? node.closest("figure") ?? node
              : (node.closest("figure") as HTMLElement) ?? node;
          if (container) containers.add(container);
        });
  
      containers.forEach((block) => {
        const hasVisual =
          block.querySelector("img, video, iframe, picture") !== null;
        const hasQuote =
          block.querySelector(QUOTE_BLOCK_SELECTOR) !== null ||
          block.matches(QUOTE_BLOCK_SELECTOR);
        const isMediaPage = enabled && hasVisual;
        const isQuotePage = enabled && hasQuote && !hasVisual;

        block.classList.toggle(MEDIA_PAGE_CLASS, isMediaPage);
        block.classList.toggle(QUOTE_PAGE_CLASS, isQuotePage);
        // togglePageBreaks(block, isMediaPage || isQuotePage);  // デフォルトで無効化
      });
    };
  
    const setViewerState = (article: HTMLElement, enabled: boolean) => {
      const nav = ensureViewerNav(article);
      if (nav) {
        nav.classList.toggle(NAV_VISIBLE_CLASS, enabled);
        nav.setAttribute("aria-hidden", String(!enabled));
      }
      const startPosition = Math.max(0, article.scrollWidth - article.clientWidth);
      requestAnimationFrame(() => {
        article.scrollLeft = enabled ? startPosition : 0;
      });
    };

    const applyFullscreenState = (enabled: boolean) => {
      if (fullscreenButtonRef) {
        fullscreenButtonRef.setAttribute("aria-pressed", String(enabled));
        fullscreenButtonRef.setAttribute(
          "aria-label",
          enabled ? "全画面を終了" : "全画面で表示"
        );
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

    const setFullscreenState = (enabled: boolean, persist = true) => {
      const article = getArticle();
      const canEnableFullscreen =
        !!article && article.classList.contains("nv-vertical-enabled");

      if (enabled && !canEnableFullscreen) {
        enabled = false;
      }

      if (persist) saveFullscreenState(enabled);
      applyFullscreenState(enabled);
    };
  
    const applyFontState = (isSerif: boolean) => {
      const article = getArticle();
      if (!article) return;
      article.classList.toggle("nv-font-serif", isSerif);
      article.classList.toggle("nv-font-sans", !isSerif);
    };

    const applyFontSizeState = (sizeIndex: number) => {
      const article = getArticle();
      if (!article) return;
      const size = FONT_SIZES[sizeIndex];
      article.style.fontSize = `${size}px`;
    };

    const applyState = (enabled: boolean) => {
      const article = getArticle();
      if (!article) {
        console.warn("[note vertical] 本文要素が見つかりません。");
        return;
      }
      article.classList.toggle("nv-vertical-enabled", enabled);
      updateMediaBlocks(article, enabled);
      setViewerState(article, enabled);

      if (!enabled) {
        setFullscreenState(false);
      }

      if (fullscreenButtonRef) {
        fullscreenButtonRef.disabled = !enabled;
      }
    };
  
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

    const createFontSizeButtons = (initialSizeIndex: number): [HTMLButtonElement, HTMLButtonElement] => {
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
  
    const injectUI = () => {
      if (document.getElementById(CONTROL_PANEL_ID)) return; // 多重挿入防止

      const initialState = loadState();
      const initialFontState = loadFontState();
      const initialFontSizeIndex = loadFontSizeState();
      const initialFullscreenState = loadFullscreenState();

      const panel = document.createElement("div");
      panel.id = CONTROL_PANEL_ID;

      const toggleButton = createToggleButton(initialState);
      const fontButton = createFontButton(initialFontState);
      const [fontSizeMinusButton, fontSizePlusButton] = createFontSizeButtons(initialFontSizeIndex);
      const fullscreenButton = createFullscreenButton(initialFullscreenState);
      fullscreenButtonRef = fullscreenButton;

      // ラベルを作成
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

      applyState(initialState);
      applyFontState(initialFontState);
      applyFontSizeState(initialFontSizeIndex);
      setFullscreenState(initialFullscreenState, false);
    };
  
    if (document.readyState === "complete" || document.readyState === "interactive") {
      injectUI();
    } else {
      document.addEventListener("DOMContentLoaded", injectUI);
    }
  })();
  
