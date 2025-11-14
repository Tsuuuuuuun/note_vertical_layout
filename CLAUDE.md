# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Chrome/Edge browser extension that adds vertical text (縦書き) reading functionality to note.com articles. The extension injects a toggle button into note.com article pages, allowing users to switch between horizontal and vertical text layouts with a single click.

## Architecture

### Core Components

**Source Files:**
- `content_script.ts` - TypeScript source file with full type annotations
- `content_script.js` - Compiled JavaScript loaded by the browser
- `styles.css` - Visual styling for vertical layout, toggle button, and navigation
- `manifest.json` - Chrome Extension Manifest V3 configuration

**Key Architecture Patterns:**

1. **Article Detection**: Uses a fallback selector strategy (`ARTICLE_CANDIDATES` array) to locate the main article content across different note.com page structures. Iterates through selectors until a match is found.

2. **State Management**: Uses `sessionStorage` to persist vertical mode state within the current tab session. State is keyed by `STATE_KEY = "noteVerticalEnabled"`.

3. **Media Block Handling**: Special rendering for `figure`, `blockquote`, and other media elements. In vertical mode:
   - Media blocks (images/videos/iframes) are rendered horizontally in dedicated page blocks (`.nv-page-block`)
   - Quote blocks are rendered vertically with special styling (`.nv-quote-block`)
   - Page breaks (`.nv-page-break`) are dynamically inserted before/after these blocks for proper pagination

4. **Navigation**: When vertical mode is enabled, a navigation UI (`#nv-viewer-nav`) is injected with "次のページ" (next) and "前のページ" (previous) buttons for horizontal scrolling through vertical content.

5. **CSS Writing Mode**: Vertical text is achieved using `writing-mode: vertical-rl` and `text-orientation: upright`. The viewer uses horizontal scrolling (`overflow-x: auto`) to paginate vertical columns.

## Development Workflow

### Building/Compiling

This project uses TypeScript but the build process is manual:

```bash
# Compile TypeScript to JavaScript
tsc content_script.ts --outFile content_script.js --target ES2017 --module ESNext
```

The extension loads `content_script.js`, so after editing `content_script.ts`, you must recompile.

### Testing Locally

1. Open Chrome/Edge browser
2. Navigate to `chrome://extensions/` (or `edge://extensions/`)
3. Enable "Developer mode" toggle
4. Click "Load unpacked"
5. Select the `/Users/tsumac/Projects/note_vertical_layout` directory
6. Visit any note.com article (e.g., `https://note.com/*/n/*`)
7. Click the "縦書き OFF/ON" button in the bottom-right corner

### Debugging

- Open DevTools on note.com article pages
- Check Console for warnings like `[note vertical] 本文要素が見つかりません。`
- Use Elements inspector to verify CSS classes:
  - `.nv-vertical-enabled` on article container
  - `.nv-page-block` on media blocks
  - `.nv-quote-block` on quote blocks
  - `.nv-viewer-nav--visible` on navigation

## Key Implementation Details

### Selector Strategy

The extension tries multiple selectors to find article content (`getArticle()` function). If note.com changes their HTML structure, add new selectors to `ARTICLE_CANDIDATES` array at the top.

### Media Block Detection

The `updateMediaBlocks()` function:
- Searches for all `figure` and `blockquote` elements
- Determines parent containers (closest `figure` element)
- Classifies blocks as media pages (has img/video/iframe) or quote pages (has blockquote)
- Calls `togglePageBreaks()` to insert/remove spacer elements for pagination

### Scroll Behavior

- `scrollViewerPage()`: Scrolls left/right by ~90% of viewport width
- `setViewerState()`: Sets initial scroll position to far-right when enabling vertical mode (since vertical-rl starts from right)

### Important CSS Variables

```css
--nv-viewer-height: min(80vh, 640px);  /* Viewer height */
--nv-viewer-width: min(90vw, 660px);   /* Viewer width */
```

These control the vertical viewer dimensions and are used throughout the CSS.

## File Structure

```
/
├── manifest.json          # Extension configuration
├── content_script.ts      # Source TypeScript
├── content_script.js      # Compiled output (DO NOT EDIT DIRECTLY)
├── styles.css            # All visual styling
├── sample.html           # Testing/demo HTML file
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

## Manifest Configuration

- **Manifest Version**: 3 (latest Chrome standard)
- **Host Permissions**: `https://note.com/*`
- **Content Script Matches**: `https://note.com/*/n/*` (article pages only)
- **Run At**: `document_idle` (waits for DOM to be interactive/complete)

## Common Tasks

### Adding New Article Selectors

Edit `ARTICLE_CANDIDATES` array in `content_script.ts`:

```typescript
const ARTICLE_CANDIDATES = [
  ".note-common-styles__textnote-body",
  ".p-article__body",
  // Add new selector here
];
```

Then recompile.

### Modifying Vertical Layout Styles

Edit `styles.css` under `.nv-vertical-enabled` class. Key properties:
- `writing-mode: vertical-rl` - Right-to-left vertical writing
- `text-orientation: upright` - Keep characters upright
- `scroll-snap-type: x proximity` - Enable page snapping

### Changing Button Position/Appearance

Edit `#nv-toggle-button` styles in `styles.css`. Current position is `fixed` at `right: 16px; bottom: 16px`.

## Browser Compatibility

Designed for Chrome/Edge with Manifest V3 support. Uses modern JavaScript features:
- `?.` optional chaining
- `??` nullish coalescing
- `scrollBy()` with smooth behavior
- CSS `scroll-snap-type`
