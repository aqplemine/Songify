# Songify

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
