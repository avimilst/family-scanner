# Family Scanner

**"We Scan. You Decide."**

A mobile app that helps parents make informed decisions about movies, TV shows, and books for their children. Powered by Claude AI with web search capabilities.

## Architecture

- **Mobile App**: React Native + Expo (cloud-built via EAS)
- **Backend**: Cloudflare Workers (serverless)
- **Caching**: Cloudflare KV
- **AI**: Claude API with web search

No local servers, no Xcode, no Android Studio required.

---

## Quick Start

### 1. Deploy the Cloudflare Worker

Your Worker is already set up at `https://falling-moon-82d1.avimilst.workers.dev`. To update it:

```bash
cd cloudflare-worker

# Install Wrangler CLI (if not already installed)
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Create the KV namespace for caching
wrangler kv:namespace create "SCAN_CACHE"
# Copy the id from the output and update wrangler.toml

# Set your Claude API key as a secret
wrangler secret put ANTHROPIC_API_KEY
# Paste your API key when prompted

# Deploy the worker
wrangler deploy
```

#### Updating wrangler.toml with KV

After running `wrangler kv:namespace create "SCAN_CACHE"`, you'll get output like:
```
Add the following to your configuration file in your kv_namespaces array:
{ binding = "SCAN_CACHE", id = "abc123..." }
```

Update `cloudflare-worker/wrangler.toml`:
```toml
[[kv_namespaces]]
binding = "SCAN_CACHE"
id = "your-actual-id-here"
```

---

### 2. Set Up Expo & EAS Build

#### Step 1: Create a Free Expo Account

1. Go to [https://expo.dev/signup](https://expo.dev/signup)
2. Sign up with GitHub, Google, or email
3. Verify your email if required

#### Step 2: Install EAS CLI

In your terminal (GitHub Codespaces works great):

```bash
npm install -g eas-cli
```

#### Step 3: Login to Expo

```bash
eas login
```

Enter your Expo username and password.

#### Step 4: Configure the Project

```bash
# Initialize EAS for this project
eas build:configure
```

This will:
- Create/update `eas.json` (already provided)
- Add your project ID to `app.json`
- Link the project to your Expo account

#### Step 5: Register Your Devices (iOS Only)

For iOS internal distribution, you need to register your device:

```bash
eas device:create
```

This gives you a URL. Open it on your iPhone to install a provisioning profile.

---

### 3. Build the App

#### Android APK (Easiest - No Registration Needed)

```bash
eas build --profile preview --platform android
```

This builds an APK you can install directly on any Android device.

#### iOS (Requires Apple Developer Account for Device Install)

For iOS simulator build (free, for testing on Mac):
```bash
eas build --profile preview --platform ios
```

For iOS device build (requires $99/year Apple Developer account):
```bash
eas build --profile preview --platform ios
```

#### Both Platforms

```bash
eas build --profile preview --platform all
```

---

### 4. Install on Your Phone

After the build completes (~10-15 minutes), you'll get:

**For Android:**
- A direct download link to the APK
- QR code to scan with your phone's camera
- Install by opening the APK (enable "Install from unknown sources" if needed)

**For iOS:**
- A link to install via Expo's servers
- QR code to scan
- Requires the device to be registered (see Step 5 above) or an Apple Developer account

---

## Project Structure

```
family-scanner/
├── App.tsx                    # Main app entry
├── app.json                   # Expo configuration
├── eas.json                   # EAS Build configuration
├── package.json               # Dependencies
├── src/
│   ├── components/
│   │   ├── SearchInput.tsx    # Autocomplete search
│   │   ├── ContentTypePicker.tsx
│   │   └── ScanResultCard.tsx # Display scan results
│   ├── screens/
│   │   └── HomeScreen.tsx     # Main screen
│   ├── services/
│   │   └── api.ts             # Cloudflare Worker API calls
│   ├── data/
│   │   └── popularTitles.ts   # 200 hardcoded kids' titles
│   └── types/
│       └── index.ts           # TypeScript types
├── assets/                    # App icons and splash
└── cloudflare-worker/
    ├── worker.js              # Cloudflare Worker code
    └── wrangler.toml          # Worker configuration
```

---

## API Endpoints

Your Cloudflare Worker exposes:

### `POST /scan`

Scan content for family-friendliness.

**Request:**
```json
{
  "title": "Bluey",
  "content_type": "tv_show"
}
```

**Response:**
```json
{
  "success": true,
  "cached": false,
  "data": {
    "title": "Bluey",
    "content_type": "tv_show",
    "overall_rating": "Excellent family show...",
    "summary": "...",
    "content_warnings": [...],
    "age_recommendation": {...},
    "positive_elements": [...],
    "discussion_topics": [...],
    "similar_alternatives": [...],
    "scanned_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### `GET /health`

Health check endpoint.

---

## Cloudflare KV Caching

Results are cached in Cloudflare KV for 30 days:
- Cache key: normalized title + content type
- If KV write fails, results still return to user
- Subsequent requests for same content are instant

---

## Troubleshooting

### "eas: command not found"
```bash
npm install -g eas-cli
```

### "Not logged in"
```bash
eas login
```

### Build fails with missing dependencies
```bash
npm install
```

### iOS build requires Apple Developer account
For free testing, use:
- The iOS Simulator build
- Android APK (works on any Android device)
- Expo Go app for development

### Worker returns 500 error
Check that:
1. `ANTHROPIC_API_KEY` secret is set correctly
2. KV namespace is properly configured
3. Check logs: `wrangler tail`

---

## Development

For local development with Expo Go:

```bash
npm install
npx expo start
```

Scan the QR code with Expo Go app (Android) or Camera app (iOS).

---

## Cost Considerations

- **Expo EAS**: Free tier includes 30 builds/month
- **Cloudflare Workers**: Free tier includes 100k requests/day
- **Cloudflare KV**: Free tier includes 100k reads/day, 1k writes/day
- **Claude API**: Pay per use (web search may incur additional costs)

---

## License

MIT
