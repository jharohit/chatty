# Chatty: iOS Porting Architecture & Technical Blueprint

This document provides a comprehensive, step-by-step guide for porting **Chatty** from macOS to a native **iOS (iPhone & iPad)** app.

---

## 1. Architectural Overview: How Chatty is Designed for iOS

Chatty was architected from day one with a clean separation of concerns:
- **Platform Bridge Interface (`src/services/platform.ts`)**: All native APIs (dock/app icon badges, system memory inspection, external link dispatch, partition data purges, and storage) are abstracted behind `IPlatformBridge`.
- **Zero Electron Leaks in Core UI**: The UI components (`Sidebar`, `Header`, `WebViewContainer`, `CommandPalette`, `SettingsModal`, etc.) do not directly import `electron` or native Node.js modules.
- **Strictly Local State**: All user data, active sessions, and preferences live in local browser storage on the device—there are no cloud dependencies or telemetry to rewrite.

---

## 2. Option A: Porting via Capacitor (Fastest — 95% Code Reuse)

Using [Capacitor](https://capacitorjs.com/) allows you to bundle the existing React + Tailwind code into a native Xcode project for iOS.

### Step 1: Install Capacitor Dependencies
```bash
npm install @capacitor/core @capacitor/cli @capacitor/ios @capacitor/app @capacitor/badge @capacitor/haptics
npx cap init Chatty com.chatty.app --web-dir dist
npx cap add ios
```

### Step 2: Implement the iOS Platform Bridge
In `src/services/platform.ts`, connect Capacitor plugins:
```ts
import { Badge } from '@capacitor/badge';
import { App } from '@capacitor/app';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

class CapacitorBridge implements IPlatformBridge {
  isElectron = false;
  platform = 'ios' as const;

  async setBadgeCount(count: number): Promise<void> {
    await Badge.set({ count });
  }

  async openExternal(url: string): Promise<void> {
    window.open(url, '_blank');
  }

  // ...
}
```

### Step 3: Handling WhatsApp Web User-Agent on iOS WebKit
By default, WhatsApp Web checks the user agent and asks mobile devices to install the native app. In iOS `WKWebViewConfiguration`:
```swift
let userAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15"
webView.customUserAgent = userAgent
```

---

## 3. Option B: Native SwiftUI Port (Pure Apple Native Experience)

If you prefer building a 100% native SwiftUI iOS app:

### Isolated Partitions with `WKWebsiteDataStore` (iOS 17+)
Starting in iOS 17, Apple introduced multiple persistent website data stores:
```swift
import SwiftUI
import WebKit

struct ChatWebView: UIViewRepresentable {
    let serviceUrl: URL
    let serviceId: String // e.g., "wa-personal", "wa-work"
    
    func makeUIView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()
        
        // iOS 17+: Create isolated persistent data store for this account
        if #available(iOS 17.0, *) {
            let dataStore = WKWebsiteDataStore(forIdentifier: UUID(uuidString: serviceId) ?? UUID())
            config.websiteDataStore = dataStore
        }
        
        // Emulate desktop Safari to enable WhatsApp Web pairing
        config.applicationNameForUserAgent = "Version/17.0 Safari/605.1.15"
        
        let webView = WKWebView(frame: .zero, configuration: config)
        webView.customUserAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15"
        
        webView.load(URLRequest(url: serviceUrl))
        return webView
    }
    
    func updateUIView(_ uiView: WKWebView, context: Context) {}
}
```

### SwiftUI Navigation Layout
Use `NavigationSplitView` on iPad and `TabView` on iPhone:
```swift
struct ContentView: View {
    @State private var activeService: Service = .whatsAppPersonal
    
    var body: some View {
        NavigationSplitView {
            SidebarView(selection: $activeService)
                .background(.ultraThinMaterial)
        } detail: {
            ChatWebView(serviceUrl: activeService.url, serviceId: activeService.id)
        }
    }
}
```

---

## 4. Summary Checklist for iOS Release
- [ ] Set `customUserAgent` to Desktop macOS Safari for WhatsApp Web.
- [ ] Enable Camera and Microphone keys in `Info.plist` (`NSCameraUsageDescription`, `NSMicrophoneUsageDescription`) for WhatsApp & Slack calls.
- [ ] Use `WKWebsiteDataStore` per service for multiple WhatsApp accounts.
- [ ] Test tactile haptic feedback using Apple `UIImpactFeedbackGenerator`.
