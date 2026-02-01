# Family Scanner

**We Scan. You Decide.**

Family Scanner helps parents make informed decisions about the content their children consume. Simply enter a TV show, movie, or book title, and we'll scan it for content including violence, scary themes, sexual content, LGBTQ+ themes, and religious content. We provide objective information - you decide what's right for your family.

## Project Structure

```
family-scanner/
├── backend/                 # Node.js/Express API server
│   ├── src/
│   │   ├── config/         # Database configuration
│   │   ├── controllers/    # Request handlers
│   │   ├── db/             # Migrations and seeds
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic (Claude API)
│   │   └── index.js        # Server entry point
│   ├── .env.example        # Environment template
│   └── package.json
│
└── mobile/                  # React Native/Expo app
    ├── src/
    │   ├── components/     # Reusable UI components
    │   ├── constants/      # Colors, API config
    │   ├── context/        # React context providers
    │   ├── screens/        # App screens
    │   └── services/       # API and storage services
    ├── assets/             # App icons and images
    ├── App.js              # App entry point
    ├── app.json            # Expo configuration
    └── package.json
```

## Features

- **Content Scanning**: Analyze TV shows, movies, and books using Claude AI with web search
- **Content Categories**:
  - Violence (physical violence, fighting, weapons, death)
  - Sexual Content (romance, kissing, innuendo, nudity)
  - LGBTQ+ Themes (LGBTQ+ characters, same-sex relationships)
  - Scary Content (horror, monsters, ghosts, dark themes)
  - Religious Themes (religious content, practices, holidays)
- **Autocomplete Search**: Pre-populated database with 500+ popular titles
- **Result Caching**: Scan results are cached for faster subsequent lookups
- **Recent Scans**: Quick access to last 5 scanned titles
- **Subscription System**: Infrastructure for native in-app purchases

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Anthropic API key (for Claude AI)
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app on your mobile device (for testing)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env
   ```

4. Configure your `.env` file:
   ```
   PORT=3000
   NODE_ENV=development
   DATABASE_URL=postgresql://user:password@localhost:5432/family_scanner
   ANTHROPIC_API_KEY=your_anthropic_api_key_here
   ```

5. Set up the database:
   ```bash
   npm run db:setup
   ```
   This runs migrations and seeds the autocomplete database with 500+ titles.

6. Start the server:
   ```bash
   npm run dev
   ```

### Mobile App Setup

1. Navigate to the mobile directory:
   ```bash
   cd mobile
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Update API URL (for physical device testing):

   Edit `app.json` and update the `extra.apiUrl` to your computer's local IP:
   ```json
   "extra": {
     "apiUrl": "http://YOUR_LOCAL_IP:3000/api"
   }
   ```

   Find your local IP:
   - Mac/Linux: `ifconfig | grep "inet "`
   - Windows: `ipconfig`

4. Start Expo:
   ```bash
   npm start
   ```

5. Scan the QR code with Expo Go app on your device

### Testing Without Subscription

During development with Expo Go, use the **"[DEV] Skip Paywall for Testing"** button on the paywall screen to bypass the subscription requirement.

## API Endpoints

### Content

- `POST /api/content/scan` - Scan a title for content
  ```json
  {
    "title": "Frozen",
    "content_type": "movie"
  }
  ```

- `GET /api/content/recent?limit=5` - Get recent scans

- `GET /api/content/cached?title=Frozen&content_type=movie` - Get cached result

### Autocomplete

- `GET /api/autocomplete/search?q=fro&limit=10` - Search titles

- `GET /api/autocomplete/popular?limit=20` - Get popular titles

### Health

- `GET /api/health` - API health check

## Content Types

- `tv_show` - Television series
- `movie` - Films
- `book` - Books

## Database Schema

### content
Caches scan results for faster lookups.

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| title | VARCHAR(500) | Content title |
| content_type | VARCHAR(50) | tv_show, movie, or book |
| results_json | JSONB | Scan results |
| scanned_at | TIMESTAMP | When scanned |

### autocomplete_titles
Pre-populated titles for search suggestions.

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| title | VARCHAR(500) | Content title |
| content_type | VARCHAR(50) | tv_show, movie, or book |
| popularity_rank | INTEGER | Sorting priority |

## In-App Purchases (Future)

The app is structured to support native in-app subscriptions when building for production:

- **iOS**: StoreKit / In-App Purchase
- **Android**: Google Play Billing Library

The `SubscriptionContext` provides the infrastructure for subscription state management. In production, you'll need to:

1. Create a development build (not Expo Go)
2. Configure products in App Store Connect / Google Play Console
3. Integrate a library like `react-native-iap` or `expo-in-app-purchases`
4. Implement server-side receipt validation

## Design Guidelines

### Colors

- **Primary**: #1e3a5f (Deep blue - trust, safety)
- **Accent**: #f5a623 (Warm orange - family-friendly)
- **Background**: #f5f8fa (Soft off-white)

### Category Colors

- Violence: Red (#e53e3e)
- Sexual Content: Orange (#ed8936)
- LGBTQ+ Themes: Purple (#9f7aea)
- Scary Content: Dark Gray (#4a5568)
- Religious Themes: Blue (#3182ce)

## App Store Listing

**App Name**: Family Scanner

**Subtitle**: We Scan. You Decide.

**Category**: Parenting (primary), Entertainment (secondary)

**Age Rating**: 4+

**Keywords**: parental guidance, family, content scanner, kids, movies, TV shows, books, screen time, parenting

## License

Proprietary - All rights reserved.

## Support

Email: support@familyscanner.app
