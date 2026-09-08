import { ipcRenderer } from 'electron';

const isGoogleDomain =
  window.location.hostname.includes('google.com') ||
  window.location.hostname.includes('google.co');

// Intercept Web Notification API only for chat services (WhatsApp, Slack, Telegram)
// Do NOT override on Google Accounts as Botguard checks Notification.requestPermission.toString()
if (!isGoogleDomain) {
  class ChattyNotification extends EventTarget {
    static get permission() {
      return 'granted';
    }

    static requestPermission(callback?: (permission: string) => void) {
      if (callback) callback('granted');
      return Promise.resolve('granted');
    }

    title: string;
    options?: NotificationOptions;

    constructor(title: string, options?: NotificationOptions) {
      super();
      this.title = title;
      this.options = options;

      try {
        ipcRenderer.sendToHost('chatty-notification', {
          title,
          body: options?.body || '',
          icon: options?.icon,
          tag: options?.tag,
        });
      } catch {}
    }

    close() {}
  }

  try {
    (window as any).Notification = ChattyNotification;
  } catch {}
}

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

// Presenter Shield / Screen-Share PII Blur Support
function setPresenterShield(enabled: boolean) {
  let styleEl = document.getElementById('chatty-presenter-shield-style');
  if (enabled) {
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'chatty-presenter-shield-style';
      styleEl.textContent = `
        /* Chatty Presenter Shield: Smart PII & Message Blurring */
        .chatty-shield-active img,
        .chatty-shield-active video,
        .chatty-shield-active [role="row"],
        .chatty-shield-active [data-testid="cell-frame-container"],
        .chatty-shield-active .message,
        .chatty-shield-active [class*="message"],
        .chatty-shield-active [class*="Message"],
        .chatty-shield-active [class*="bubble"],
        .chatty-shield-active [class*="thread"],
        .chatty-shield-active .p-channel_sidebar__channel,
        .chatty-shield-active .peer-title,
        .chatty-shield-active .chat-title {
          filter: blur(8px) !important;
          transition: filter 0.16s ease-in-out !important;
        }
        .chatty-shield-active img:hover,
        .chatty-shield-active video:hover,
        .chatty-shield-active [role="row"]:hover,
        .chatty-shield-active [data-testid="cell-frame-container"]:hover,
        .chatty-shield-active .message:hover,
        .chatty-shield-active [class*="message"]:hover,
        .chatty-shield-active [class*="Message"]:hover,
        .chatty-shield-active [class*="bubble"]:hover,
        .chatty-shield-active [class*="thread"]:hover,
        .chatty-shield-active .p-channel_sidebar__channel:hover,
        .chatty-shield-active .peer-title:hover,
        .chatty-shield-active .chat-title:hover {
          filter: none !important;
        }
      `;
      (document.head || document.documentElement).appendChild(styleEl);
    }
    document.body?.classList.add('chatty-shield-active');
    document.documentElement?.classList.add('chatty-shield-active');
  } else {
    document.body?.classList.remove('chatty-shield-active');
    document.documentElement?.classList.remove('chatty-shield-active');
    if (styleEl) {
      styleEl.remove();
    }
  }
}

ipcRenderer.on('chatty-set-presenter-mode', (_event, enabled: boolean) => {
  setPresenterShield(Boolean(enabled));
});

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

  // Hide browser deprecation warning banners on Slack
  if (window.location.hostname.includes('slack.com')) {
    const slackStyle = document.createElement('style');
    slackStyle.textContent = `
      .c-banner--deprecation,
      .p-client_container__deprecation_banner,
      [data-qa="deprecation-banner"] {
        display: none !important;
      }
    `;
    (document.head || document.documentElement)?.appendChild(slackStyle);

    // If Slack shows "You're already signed in to... [Open]" picker, automatically click Open
    const autoOpenWorkspace = () => {
      const buttons = Array.from(document.querySelectorAll('button, a'));
      const openBtn = buttons.find((b) => {
        const text = b.textContent?.trim();
        const href = (b as HTMLAnchorElement).href || '';
        return text === 'Open' || href.includes('ssb/redirect') || href.includes('workspace_signin');
      });
      if (openBtn) {
        (openBtn as HTMLElement).click();
        return true;
      }
      return false;
    };

    if (!autoOpenWorkspace()) {
      const observer = new MutationObserver(() => {
        if (autoOpenWorkspace()) observer.disconnect();
      });
      if (document.body) {
        observer.observe(document.body, { childList: true, subtree: true });
      }
    }
  }
});
