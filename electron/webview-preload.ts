import { ipcRenderer } from 'electron';

// Spoof navigator properties to ensure Slack, WhatsApp, and Google Chat treat webviews as vanilla Chrome
try {
  const CHROME_UA =
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.7977.76 Safari/537.36';

  Object.defineProperty(navigator, 'userAgent', {
    get: () => CHROME_UA,
    configurable: false,
  });

  Object.defineProperty(navigator, 'appVersion', {
    get: () => '5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.7977.76 Safari/537.36',
    configurable: false,
  });

  if ((navigator as any).userAgentData) {
    const brands = [
      { brand: 'Google Chrome', version: '152' },
      { brand: 'Chromium', version: '152' },
      { brand: 'Not_A Brand', version: '24' },
    ];
    Object.defineProperty((navigator as any).userAgentData, 'brands', {
      get: () => brands,
      configurable: false,
    });
  }
} catch {}

// Extracts unread count from document title
function parseTitleForUnread(title: string): number {
  if (!title) return 0;
  // Match patterns like "(3) WhatsApp", "[5] Slack", "• Telegram"
  const matchParen = title.match(/\((\d+)\)/);
  if (matchParen && matchParen[1]) {
    return parseInt(matchParen[1], 10);
  }
  const matchBracket = title.match(/\[(\d+)\]/);
  if (matchBracket && matchBracket[1]) {
    return parseInt(matchBracket[1], 10);
  }
  if (title.includes('•') || title.includes('*')) {
    return 1;
  }
  return 0;
}

let lastUnreadCount = -1;

function checkUnread() {
  const count = parseTitleForUnread(document.title);
  if (count !== lastUnreadCount) {
    lastUnreadCount = count;
    try {
      ipcRenderer.sendToHost('unread-count', count);
    } catch {
      // ignore
    }
  }
}

// Observe Title Changes
window.addEventListener('DOMContentLoaded', () => {
  checkUnread();

  const titleEl = document.querySelector('title');
  if (titleEl) {
    const observer = new MutationObserver(() => checkUnread());
    observer.observe(titleEl, { childList: true, subtree: true, characterData: true });
  }

  // Periodic fallback check (every 3 seconds) with low CPU footprint
  setInterval(checkUnread, 3000);
});
