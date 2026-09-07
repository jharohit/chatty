import { ipcRenderer } from 'electron';

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
