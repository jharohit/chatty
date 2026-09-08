import Cocoa

// Helper to draw Apple-style glowing callout badge and arrow
func drawCallout(
    startPoint: CGPoint, // Target anchor point on the UI element (top-left origin 0..width, 0..height)
    badgeRect: CGRect,   // Where the label badge box sits (top-left origin)
    number: String,
    title: String,
    subtitle: String,
    imgHeight: CGFloat,
    arrowFromLeft: Bool = false
) {
    guard let context = NSGraphicsContext.current?.cgContext else { return }
    context.saveGState()

    // Flip Y for CoreGraphics since origin is bottom-left
    let target = CGPoint(x: startPoint.x, y: imgHeight - startPoint.y)
    let bRect = CGRect(x: badgeRect.origin.x, y: imgHeight - badgeRect.origin.y - badgeRect.height, width: badgeRect.width, height: badgeRect.height)

    // 1. Draw glowing bezier pointer line
    let linePath = CGMutablePath()
    let anchorOnBadge = arrowFromLeft
        ? CGPoint(x: bRect.maxX, y: bRect.midY)
        : CGPoint(x: bRect.minX, y: bRect.midY)

    linePath.move(to: anchorOnBadge)
    let controlPoint1 = CGPoint(x: (anchorOnBadge.x + target.x) / 2, y: anchorOnBadge.y)
    let controlPoint2 = CGPoint(x: (anchorOnBadge.x + target.x) / 2, y: target.y)
    linePath.addCurve(to: target, control1: controlPoint1, control2: controlPoint2)

    context.setShadow(offset: CGSize(width: 0, height: 2), blur: 6, color: CGColor(srgbRed: 0.65, green: 0.35, blue: 0.95, alpha: 0.7))
    context.setStrokeColor(CGColor(srgbRed: 0.75, green: 0.45, blue: 1.0, alpha: 0.95))
    context.setLineWidth(2.5)
    context.addPath(linePath)
    context.strokePath()

    // 2. Draw target anchor dot
    context.setFillColor(CGColor(srgbRed: 0.75, green: 0.45, blue: 1.0, alpha: 1.0))
    context.fillEllipse(in: CGRect(x: target.x - 5, y: target.y - 5, width: 10, height: 10))
    context.setStrokeColor(CGColor(srgbRed: 1, green: 1, blue: 1, alpha: 1.0))
    context.setLineWidth(2.0)
    context.strokeEllipse(in: CGRect(x: target.x - 5, y: target.y - 5, width: 10, height: 10))

    // 3. Draw callout badge background pill (frosted obsidian)
    let badgePath = CGPath(roundedRect: bRect, cornerWidth: 12, cornerHeight: 12, transform: nil)
    context.setShadow(offset: CGSize(width: 0, height: 6), blur: 16, color: CGColor(srgbRed: 0, green: 0, blue: 0, alpha: 0.75))
    context.setFillColor(CGColor(srgbRed: 0.07, green: 0.08, blue: 0.13, alpha: 0.97))
    context.addPath(badgePath)
    context.fillPath()

    // Border stroke on pill
    context.setStrokeColor(CGColor(srgbRed: 0.65, green: 0.4, blue: 0.95, alpha: 0.8))
    context.setLineWidth(1.5)
    context.addPath(badgePath)
    context.strokePath()

    // 4. Number Circle Pill
    let numCircleRect = CGRect(x: bRect.minX + 10, y: bRect.minY + (bRect.height - 22) / 2, width: 22, height: 22)
    context.setFillColor(CGColor(srgbRed: 0.65, green: 0.35, blue: 0.95, alpha: 1.0))
    context.fillEllipse(in: numCircleRect)

    // Text rendering: NSAttributedString uses cocoa coordinate space
    let numStr = NSAttributedString(
        string: number,
        attributes: [
            .font: NSFont.boldSystemFont(ofSize: 12),
            .foregroundColor: NSColor.white
        ]
    )
    let numSize = numStr.size()
    numStr.draw(at: CGPoint(x: numCircleRect.midX - numSize.width / 2, y: numCircleRect.midY - numSize.height / 2))

    let titleStr = NSAttributedString(
        string: title,
        attributes: [
            .font: NSFont.boldSystemFont(ofSize: 12.5),
            .foregroundColor: NSColor.white
        ]
    )
    titleStr.draw(at: CGPoint(x: bRect.minX + 38, y: bRect.maxY - 20))

    let subStr = NSAttributedString(
        string: subtitle,
        attributes: [
            .font: NSFont.systemFont(ofSize: 10.5),
            .foregroundColor: NSColor(calibratedRed: 0.82, green: 0.84, blue: 0.92, alpha: 1.0)
        ]
    )
    subStr.draw(at: CGPoint(x: bRect.minX + 38, y: bRect.maxY - 35))

    context.restoreGState()
}

func annotateImage(
    srcPath: String,
    destPath: String,
    callouts: [(start: CGPoint, badge: CGRect, num: String, title: String, sub: String, arrowFromLeft: Bool)]
) {
    guard let srcImage = NSImage(contentsOfFile: srcPath) else {
        print("Could not load \(srcPath)")
        return
    }

    let size = srcImage.size
    let rep = NSBitmapImageRep(
        bitmapDataPlanes: nil,
        pixelsWide: Int(size.width * 2), // Keep Retina 2x resolution
        pixelsHigh: Int(size.height * 2),
        bitsPerSample: 8,
        samplesPerPixel: 4,
        hasAlpha: true,
        isPlanar: false,
        colorSpaceName: .deviceRGB,
        bytesPerRow: 0,
        bitsPerPixel: 0
    )!
    rep.size = size

    NSGraphicsContext.saveGraphicsState()
    let context = NSGraphicsContext(bitmapImageRep: rep)!
    NSGraphicsContext.current = context

    // Draw source image
    srcImage.draw(in: NSRect(origin: .zero, size: size))

    // Draw each callout annotation
    for c in callouts {
        drawCallout(
            startPoint: c.start,
            badgeRect: c.badge,
            number: c.num,
            title: c.title,
            subtitle: c.sub,
            imgHeight: size.height,
            arrowFromLeft: c.arrowFromLeft
        )
    }

    context.flushGraphics()
    NSGraphicsContext.restoreGraphicsState()

    if let pngData = rep.representation(using: .png, properties: [:]) {
        try? pngData.write(to: URL(fileURLWithPath: destPath))
        print("✅ Successfully annotated: \(destPath)")
    }
}

// ----------------------------------------------------------------------------
// 1. Annotate Screenshot 1: Main Workspace & Gemini
// ----------------------------------------------------------------------------
annotateImage(
    srcPath: "docs/screenshots/01-workspace.png",
    destPath: "docs/screenshots/01-workspace-annotated.png",
    callouts: [
        // 1. Workspaces Switcher
        (
            start: CGPoint(x: 275, y: 70),
            badge: CGRect(x: 210, y: 110, width: 275, height: 42),
            num: "1",
            title: "Contextual Workspaces",
            sub: "✨ All, 🏡 Personal, 💼 Work, 🪄 AI with unread dots",
            arrowFromLeft: true
        ),
        // 2. Quick Switcher Omnibox
        (
            start: CGPoint(x: 630, y: 70),
            badge: CGRect(x: 520, y: 110, width: 250, height: 42),
            num: "2",
            title: "Command Palette (⌘K)",
            sub: "Instant fuzzy jump to any account or tool",
            arrowFromLeft: false
        ),
        // 3. Presenter Mode & Utilities
        (
            start: CGPoint(x: 1180, y: 70),
            badge: CGRect(x: 930, y: 110, width: 270, height: 42),
            num: "3",
            title: "Presenter Shield (⌘P)",
            sub: "Smart-blur messages during Zoom/Meet sharing",
            arrowFromLeft: true
        ),
        // 4. Large App Avatars in Sidebar
        (
            start: CGPoint(x: 95, y: 250),
            badge: CGRect(x: 140, y: 235, width: 280, height: 42),
            num: "4",
            title: "Isolated Account Partitions",
            sub: "WhatsApp, Slack, Telegram, Gemini with 0 cookie bleed",
            arrowFromLeft: false
        ),
        // 5. Active AI Assistant
        (
            start: CGPoint(x: 95, y: 375),
            badge: CGRect(x: 140, y: 360, width: 270, height: 42),
            num: "5",
            title: "Active AI Suite (Gemini)",
            sub: "Glowing active indicator & native Google Auth",
            arrowFromLeft: false
        ),
        // 6. Live RAM Optimizer & Dock
        (
            start: CGPoint(x: 95, y: 790),
            badge: CGRect(x: 140, y: 765, width: 285, height: 42),
            num: "6",
            title: "Performance & Privacy Dock",
            sub: "Live RAM monitor (180M), Focus mode & Screen Lock",
            arrowFromLeft: false
        )
    ]
)

// ----------------------------------------------------------------------------
// 2. Annotate Screenshot 2: System Settings
// ----------------------------------------------------------------------------
annotateImage(
    srcPath: "docs/screenshots/02-settings.png",
    destPath: "docs/screenshots/02-settings-annotated.png",
    callouts: [
        // 1. Preference Tabs
        (
            start: CGPoint(x: 550, y: 145),
            badge: CGRect(x: 230, y: 125, width: 280, height: 42),
            num: "1",
            title: "Modular Preference Sections",
            sub: "Appearance, RAM Saver, Privacy & Global Shortcuts",
            arrowFromLeft: true
        ),
        // 2. Font Scaling
        (
            start: CGPoint(x: 640, y: 265),
            badge: CGRect(x: 770, y: 245, width: 265, height: 42),
            num: "2",
            title: "Global Web Font Scaling",
            sub: "Adjust zoom from 90% to 140% across all chats",
            arrowFromLeft: false
        ),
        // 3. App Catalog Launcher
        (
            start: CGPoint(x: 680, y: 395),
            badge: CGRect(x: 770, y: 375, width: 275, height: 42),
            num: "3",
            title: "AI & App Catalog Launcher",
            sub: "Quickly browse and add Claude, Perplexity, Grok",
            arrowFromLeft: false
        ),
        // 4. Pastel Themes
        (
            start: CGPoint(x: 670, y: 690),
            badge: CGRect(x: 770, y: 670, width: 280, height: 42),
            num: "4",
            title: "6 Signature Pastel Themes",
            sub: "Blush Sakura, Matcha, Lavender to Pastel Noir",
            arrowFromLeft: false
        )
    ]
)

// ----------------------------------------------------------------------------
// 3. Annotate Screenshot 3: Add Service Modal
// ----------------------------------------------------------------------------
annotateImage(
    srcPath: "docs/screenshots/03-add-modal.png",
    destPath: "docs/screenshots/03-add-modal-annotated.png",
    callouts: [
        // 1. Catalog Navigation Tabs
        (
            start: CGPoint(x: 350, y: 210),
            badge: CGRect(x: 70, y: 145, width: 280, height: 42),
            num: "1",
            title: "3 App Management Modes",
            sub: "Curated Presets, Custom URLs & Manage Active Apps",
            arrowFromLeft: true
        ),
        // 2. Cryptographic Partitioning Banner
        (
            start: CGPoint(x: 500, y: 300),
            badge: CGRect(x: 750, y: 280, width: 285, height: 42),
            num: "2",
            title: "Isolated Session Guarantee",
            sub: "Every account gets a separate cookie partition",
            arrowFromLeft: false
        ),
        // 3. Multi-Account Grid
        (
            start: CGPoint(x: 460, y: 560),
            badge: CGRect(x: 750, y: 540, width: 280, height: 42),
            num: "3",
            title: "Built-in Messengers & AI Suite",
            sub: "1-click add for WhatsApp, Slack, ChatGPT, Claude",
            arrowFromLeft: false
        ),
        // 4. Active Instance Badges
        (
            start: CGPoint(x: 280, y: 410),
            badge: CGRect(x: 70, y: 390, width: 235, height: 42),
            num: "4",
            title: "Live Instance Counters",
            sub: "Track multi-account deployments",
            arrowFromLeft: true
        )
    ]
)
