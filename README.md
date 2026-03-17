# HealthGuard Monorepo (Web + Mobile)

A full-stack monorepo for a health AI platform with web and mobile apps sharing UI components.

**Tech Stack:**
- **Web:** Next.js 14 + Tailwind CSS ✅ **Running**
- **Mobile:** Expo 49 + React Native 0.72 + NativeWind (⚠️ Metro bundler requires native build tools on Windows)
- **Shared UI:** React Native-compatible components (`packages/ui`)
- **Package Manager:** pnpm (monorepo workspaces)

## Project Structure

```
.
├── apps/
│   ├── web/              # Next.js web app (Tailwind CSS) ✅
│   └── mobile/           # Expo mobile app (NativeWind)
├── packages/
│   └── ui/               # Shared React Native UI components
├── package.json          # Root workspace config
└── pnpm-workspace.yaml   # pnpm workspace definition
```

## Quick Start

### Prerequisites

- Node.js 18+ (comes with npm)
- pnpm (will be enabled via Corepack)

### Installation

```bash
# Enable pnpm via Corepack (one-time setup)
corepack enable
corepack prepare pnpm@latest --activate

# Install workspace dependencies
pnpm install
```

### Running the Web App (✅ Tested & Working)

```bash
pnpm dev:web
```

Open http://localhost:3000 in your browser to see the Next.js app with the Button component from `apps/web/components/Button.js`.

### Running the Mobile App

```bash
pnpm dev:mobile
```

**Note:** The Expo/Metro bundler requires additional native build tools on Windows (xcode-select, Xcode, or Android SDK). For local development on Windows without these tools, consider:
- Using Expo Go app on a physical device (scan QR code)
- Using WSL2 with Linux build tools
- Using macOS/Linux for native development

## Project Status

✅ **Monorepo initialized** with pnpm workspaces  
✅ **Web app** (Next.js + Tailwind CSS) running successfully on port 3000  
✅ **Web app components** (Button, Card) working and styled  
⏳ **Mobile app** (Expo + NativeWind) ready but requires native build environment  
✅ **Shared UI package** (`@hg/ui`) created and available  
✅ **Babel config** set up for NativeWind transpilation  

## Development

### Adding Dependencies

To add a dependency to a specific app:

```bash
# Add to web app
pnpm --filter @hg/web add <package>

# Add to mobile app
pnpm --filter @hg/mobile add <package>

# Add to shared UI package
pnpm --filter @hg/ui add <package>
```

### Web App Components

Edit components in `apps/web/components/`:
- `Button.js` — Styled button component
- Add more components here

### Shared UI Components

The shared package at `packages/ui/` contains:
- `Button.js` — React Native Button (for mobile)
- `Card.js` — React Native Card (for mobile)
- `index.js` — Exports

**Note:** Web app currently uses local `apps/web/components/Button.js` for simpler development. To integrate the shared UI package, ensure pnpm workspaces are properly linked.

## Troubleshooting

**pnpm command not found?**
```bash
corepack enable
corepack prepare pnpm@latest --activate
```

**Port 3000 in use?**  
Next.js will automatically try port 3001.

**Web app not loading?**  
Clear Next.js cache and restart:
```bash
rm -r apps/web/.next
pnpm dev:web
```

**Expo not starting on Windows?**  
- Ensure Node.js is properly installed
- Try `npx expo start` from `apps/mobile/` directly
- Consider using WSL2 or macOS for native development tools

**Dependency issues?**  
Reinstall:
```bash
pnpm install
```

## Next Steps

- ✅ Web app is live and functional
- 🔧 Set up mobile app with Expo Go for device testing
- 📱 Integrate shared `@hg/ui` components across apps
- 🎨 Add more pages and features to both web and mobile
- 🚀 Set up CI/CD pipelines for deployment


