"use strict";

// electron/webview-preload.ts
var import_electron = require("electron");
function parseTitleForUnread(title) {
  if (!title) return 0;
  const matchParen = title.match(/\((\d+)\)/);
  if (matchParen && matchParen[1]) {
    return parseInt(matchParen[1], 10);
  }
  const matchBracket = title.match(/\[(\d+)\]/);
  if (matchBracket && matchBracket[1]) {
    return parseInt(matchBracket[1], 10);
  }
  if (title.includes("\u2022") || title.includes("*")) {
    return 1;
  }
  return 0;
}
var lastUnreadCount = -1;
function checkUnread() {
  const count = parseTitleForUnread(document.title);
  if (count !== lastUnreadCount) {
    lastUnreadCount = count;
    try {
      import_electron.ipcRenderer.sendToHost("unread-count", count);
    } catch {
    }
  }
}
window.addEventListener("DOMContentLoaded", () => {
  checkUnread();
  const titleEl = document.querySelector("title");
  if (titleEl) {
    const observer = new MutationObserver(() => checkUnread());
    observer.observe(titleEl, { childList: true, subtree: true, characterData: true });
  }
  setInterval(checkUnread, 3e3);
});
//# sourceMappingURL=webview-preload.cjs.map
