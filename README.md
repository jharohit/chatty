<div align="center">

# 🌸 Chatty

### A Designer-Grade, High-Performance, Privacy-First Pastel Multi-Chat macOS App
**Run WhatsApp, WhatsApp Business, Telegram, Signal, Google Chat, Slack, Discord & AI side-by-side with zero cloud components.**

[![macOS](https://img.shields.io/badge/Platform-macOS%20%7C%20Apple%20Silicon-blueviolet?style=flat-square&logo=apple)](https://apple.com)
[![Privacy](https://img.shields.io/badge/Privacy-100%25%20Local%20Only-emerald?style=flat-square&logo=shield)](https://github.com)
[![RAM Efficient](https://img.shields.io/badge/RAM-Hyper%20Efficient-amber?style=flat-square&logo=speedtest)](https://github.com)
[![License](https://img.shields.io/badge/License-MIT-purple?style=flat-square)](LICENSE)

</div>

---

## ✨ Features at a Glance

- 🔒 **Unlimited Multi-Account Partitioning**: Add multiple WhatsApp accounts (*Personal*, *Work*, *Client A*, *Business*). Every instance receives a unique, cryptographically isolated Chromium session partition (`persist:service_<uuid>`). Independent QR pairing with zero cookie collision!
- 🛡️ **100% Strict Local-Only Trust Architecture**:
  - **Zero cloud servers, zero telemetry, zero analytics, zero middleman proxying**.
  - Direct connections only between your Mac and official messaging endpoints.
  - All configurations, cookies, and caches reside strictly in `~/Library/Application Support/Chatty/`.
- ⚡ **Hyper-Efficient Memory & RAM Saver**:
  - **Lazy Loading**: Tabs are not initialized into RAM until clicked.
  - **Smart Background Tab Hibernation**: Suspends background DOM timers and rendering pipelines for inactive chats, saving hundreds of megabytes of RAM.
  - **Live RAM Inspector Widget**: Real-time memory consumption display with a 1-click "Hibernate Inactive Services" button.
- 🎨 **World-Class Pastel Aesthetics**:
  - 🌸 **Blush Sakura**: Soft cherry blossom pinks, blush rose, and warm cream.
  - 🪻 **Lavender Mist**: Ethereal lilac, periwinkle, and frosted glass.
  - 🍵 **Matcha & Sage**: Japanese tea gardens, eucalyptus, and clean clarity.
  - 🌊 **Nordic Breeze**: Scandinavian sky blue, crisp arctic glacier slate.
  - 🍯 **Buttercup Vanilla**: Golden hour honey, lemon curd, whipped vanilla.
  - 🌌 **Pastel Noir**: Deep velvet night with iridescent pastel luminescent glow.
- 🎧 **Tactile Organic Sound Synthesizer**: Zero external audio dependencies. Uses the Web Audio API to synthesize Apple-grade UI clicks, crystalline chimes, and soft wooden pops.
- 🪟 **Dual Split-Screen Mode (`⌘S`)**: Multitask side-by-side (e.g. WhatsApp on the left, Slack on the right) with a smooth draggable divider.
- ⚡ **Command Palette (`⌘K`)**: Raycast-style instant switcher with fuzzy search across chats, accounts, and actions.
- 🛡️ **Frosted Glass Privacy Shield (`⌘L`)**: Blur screen with Apple-style digital clock and optional PIN protection when stepping away from your Mac.
- 📱 **iOS-Ready Architecture**: Platform Bridge abstraction designed for seamless porting to native iOS via Capacitor or SwiftUI + `WKWebsiteDataStore` (see [iOS Porting Guide](docs/IOS_PORTING_GUIDE.md)).

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (tested on Node v22)
- macOS (Intel or Apple Silicon)

### Installation
```bash
# Clone or navigate to the repository
cd /Users/rohit/dev/Personal/chatty

# Install dependencies
npm install

# Start in Development Mode (Live reload Vite + Electron)
npm run app:dev
```

### Production Build
```bash
# Compile renderer and electron main process
npm run build

# Launch the production app
npm start
```

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| <kbd>⌘</kbd> <kbd>1</kbd> .. <kbd>9</kbd> | Jump directly to chat account |
| <kbd>⌘</kbd> <kbd>K</kbd> | Quick Switcher & Command Palette |
| <kbd>⌘</kbd> <kbd>S</kbd> | Toggle Side-by-Side Split View |
| <kbd>⌘</kbd> <kbd>L</kbd> | Lock Frosted Privacy Shield |
| <kbd>⌘</kbd> <kbd>D</kbd> | Toggle Focus / Do Not Disturb Mode |
| <kbd>⌘</kbd> <kbd>N</kbd> | Add New Chat or WhatsApp Account |
| <kbd>⌘</kbd> <kbd>R</kbd> | Reload Active Chat Session |
| <kbd>⌘</kbd> <kbd>,</kbd> | Open Preferences & Pastel Themes |

---

## 📄 License
MIT License. Crafted with care and delight.
