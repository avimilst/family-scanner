# Family Scanner

Family content scanner app - "We Scan. You Decide."

A mobile app that helps parents analyze TV shows, movies, and books for family content concerns using AI-powered web search.

## Project Structure

```
family-scanner/
├── worker/                 # Cloudflare Worker API
│   ├── src/
│   │   └── index.js       # Worker code with Claude API integration
│   ├── wrangler.toml      # Cloudflare configuration
│   └── package.json
└── mobile/                 # Expo React Native app
    ├── src/
    │   ├── screens/
    │   │   ├── PaywallScreen.js
    │   │   ├── MainScreen.js
    │   │   └── ResultsScreen.js
    │   ├── config/
    │   │   └── api.js
    │   └── data/
    │       └── titles.js   # 100+ hardcoded titles
    ├── App.js
    ├── app.json
    └── package.json
```

## Features

- **Paywall Screen**: Subscription screen with bypass button for testing
- **Search Screen**: Search bar with autocomplete for 100+ popular kids' titles
- **Results Screen**: Color-coded findings by category

### Content Categories Analyzed

| Category | Color |
|----------|-------|
| Violence | Red |
| Sexual content | Pink |
| LGBTQ+ characters/themes | Purple |
| Scary content | Indigo |
| Religious themes | Blue |

---

## Cloudflare Worker Setup

### 1. Install Dependencies

```bash
cd worker
npm install
```

### 2. Configure API Key

Add your Anthropic API key via Cloudflare Dashboard or CLI:

**Option A: Cloudflare Dashboard**
1. Go to Workers & Pages → family-scanner → Settings → Variables
2. Add `ANTHROPIC_API_KEY` as an encrypted variable

**Option B: Wrangler CLI**
```bash
npx wrangler secret put ANTHROPIC_API_KEY
# Enter your API key when prompted
```

### 3. Deploy Worker

```bash
# Development (local)
npm run dev

# Production
npm run deploy
```

The worker will be available at: `https://family-scanner.avimilst.workers.dev`

### 4. Test the API

```bash
curl -X POST https://family-scanner.avimilst.workers.dev \
  -H "Content-Type: application/json" \
  -d '{"title": "Stranger Things", "content_type": "tv_show"}'
```

---

## Mobile App Setup (Expo)

### Prerequisites

- Node.js 18+ installed
- Expo Go app on your phone ([iOS](https://apps.apple.com/app/expo-go/id982107779) | [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))

### 1. Install Dependencies

```bash
cd mobile
npm install
```

### 2. Start Development Server

```bash
npm start
# or
npx expo start
```

### 3. Test with Expo Go

1. The terminal will display a QR code
2. **iOS**: Open Camera app and scan the QR code
3. **Android**: Open Expo Go app and scan the QR code
4. The app will load on your device

### 4. Using the App

1. **Paywall Screen**: Tap "Skip for Testing" to bypass
2. **Search Screen**:
   - Type a title (suggestions appear after 2 characters)
   - Select content type (TV Show, Movie, Book)
   - Tap "Scan Content"
3. **Results Screen**: View findings with colored category indicators

---

## Testing Tips

### Test Without Worker (Mock Data)

To test the mobile app without the worker deployed, temporarily modify `mobile/src/config/api.js`:

```javascript
export async function scanContent(title, contentType) {
  // Mock response for testing
  return {
    title: title,
    content_type: contentType,
    findings: [
      { category: 'Violence', description: 'Contains some action sequences.' },
      { category: 'Scary content', description: 'Has suspenseful scenes.' },
    ],
  };
}
```

### Test Titles

Try these titles for varied results:
- **Bluey** - Generally clean content
- **Stranger Things** - Multiple content concerns
- **Harry Potter series** - Religious/scary themes
- **The Hunger Games** - Violence themes

---

## API Reference

### POST /

Analyze content for family concerns.

**Request Body:**
```json
{
  "title": "Stranger Things",
  "content_type": "tv_show"  // tv_show | movie | book
}
```

**Response:**
```json
{
  "title": "Stranger Things",
  "content_type": "tv_show",
  "findings": [
    {
      "category": "Violence",
      "description": "Contains scenes of monster attacks and physical confrontations."
    },
    {
      "category": "Scary content",
      "description": "Features horror elements including supernatural creatures."
    }
  ]
}
```

---

## Troubleshooting

### Worker Issues

- **"API key not configured"**: Ensure `ANTHROPIC_API_KEY` is set in Cloudflare
- **CORS errors**: The worker includes CORS headers, check browser console for details

### Mobile App Issues

- **"Network request failed"**:
  - Check your phone is connected to internet
  - Verify the worker is deployed and accessible
- **Blank screen**: Try `npx expo start -c` to clear cache
- **Dependencies error**: Delete `node_modules` and run `npm install` again

### Expo Go Issues

- **QR code not scanning**: Ensure Expo Go is up to date
- **"Something went wrong"**: Check terminal for error details

---

## License

MIT
