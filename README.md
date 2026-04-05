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

```bash
python3 -m http.server 8000
```
