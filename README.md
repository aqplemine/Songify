# Songify

A polished, frontend-only Spotify playlist app that can run on your deployed domain (GitHub Pages, Netlify, etc.) without localhost.

## What users can do

- Connect Spotify via OAuth PKCE
- Search tracks + pick up to 5 seed songs
- Generate recommendations
- Create playlist in their Spotify account

## Why you saw `401 No token provided`

This usually means one of these happened:

1. You clicked search/recommend/create before connecting Spotify.
2. The access token expired and needs reconnect.
3. Redirect URI mismatch prevented valid token exchange.

The UI now disables app actions until authenticated and shows a reconnect message if token is missing/expired.

## Spotify Dashboard settings (what to enable)

For your current dashboard fields:

- **App name/description**: fine as-is.
- **Website**: `https://aqplemine.github.io/Songify/` ✅
- **Redirect URI**: `https://aqplemine.github.io/Songify/` ✅ (must match exactly)
- **APIs used**: seeing `(none)` is okay before runtime calls. For this app, Spotify Web API endpoints are used automatically once requests are made.

## Required scopes

- `playlist-modify-private`
- `playlist-modify-public`

## Security rule

- Use Spotify **Client ID** in frontend.
- Do **not** expose Spotify client secret/private key in browser JS.
- If you need secret-based flow, add a backend server.

## Deployment quick start (GitHub Pages)

1. Deploy this repo to `https://aqplemine.github.io/Songify/`.
2. Open the site.
3. In **Setup + Connect**, paste Client ID and click **Save**.
4. Click **Connect / Reconnect Spotify**.
5. After returning from Spotify, use the menu sections to search, recommend, and create playlist.

## Local dev (optional)
A small starter web app that connects to Spotify, lets a user choose up to 5 seed songs, fetches Spotify recommendations, and creates a playlist in the user's account.

## What this project includes

- Spotify OAuth 2.0 Authorization Code with PKCE in the browser
- Song search (`/v1/search`)
- Recommendations (`/v1/recommendations`)
- Playlist creation + track insertion (`/v1/users/{id}/playlists`, `/v1/playlists/{id}/tracks`)

## Spotify app setup (required)

1. Open the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard).
2. Create an app.
3. In your app settings:
   - Copy your **Client ID**.
   - Add a **Redirect URI** that matches where you will run this app, for example:
     - `http://127.0.0.1:5500/`
     - `http://localhost:8000/`
4. Open `app.js` and replace:

   ```js
   const CLIENT_ID = 'REPLACE_WITH_YOUR_SPOTIFY_CLIENT_ID';
   ```

5. Save and run a local web server.

## Spotify OAuth scopes/permissions you should request

This app currently requests:

- `playlist-modify-private` (create/edit private playlists)
- `playlist-modify-public` (create/edit public playlists, if you change `public: true`)

These are enough for the current features. You do **not** need a client secret for PKCE in this frontend-only setup.

## Run locally

From this repo:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000` and click **Connect with Spotify**.

## Notes

- Access tokens are stored in `sessionStorage` and reset when the browser tab/session closes.
- For production, host behind HTTPS and keep redirect URIs exact in Spotify app settings.
