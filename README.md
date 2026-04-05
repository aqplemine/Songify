# Songify

A polished, frontend-only Spotify playlist app you can deploy to a real domain (no localhost required once deployed).

## What users can do

- Connect their Spotify account via OAuth PKCE
- Search songs and pick up to 5 seed tracks
- Generate Spotify recommendations
- Create a playlist directly in their Spotify account

## Important auth/security notes

- For this frontend deployment, use **Spotify Client ID only**.
- Do **not** put your Spotify client secret/private key in this repo or in browser JavaScript.
- PKCE is used specifically so a browser app can authenticate safely without exposing the secret.

If you want to use your private Spotify secret, build a backend server and perform the token exchange there.

## Spotify dashboard setup (production-ready)

1. Go to <https://developer.spotify.com/dashboard> and create/open your app.
2. In app settings, add your deployed site callback URL as a Redirect URI.
   - Example: `https://yourdomain.com/`
3. Save your Spotify **Client ID**.

## Required Spotify OAuth scopes

This app requests:

- `playlist-modify-private`
- `playlist-modify-public`

Those are enough for playlist creation/editing.

## Deploy so it works without localhost

You can host this static site on:

- Cloudflare Pages
- Netlify
- Vercel (static mode)
- GitHub Pages

After deploy:

1. Open the live site.
2. In the **App Setup** card, paste your Spotify Client ID and click **Save**.
3. Copy the Redirect URI shown on the page and ensure it exactly matches what you configured in Spotify Dashboard.
4. Click **Add Songify to Spotify**.

## Local dev (optional)

If you still want local testing:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.
