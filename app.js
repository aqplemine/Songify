const REDIRECT_URI = window.location.origin + window.location.pathname;
const SCOPES = ['playlist-modify-private', 'playlist-modify-public'];

const loginBtn = document.getElementById('loginBtn');
const authStatus = document.getElementById('authStatus');
const clientIdInput = document.getElementById('clientIdInput');
const saveClientBtn = document.getElementById('saveClientBtn');
const redirectUriText = document.getElementById('redirectUriText');
const trackSearchInput = document.getElementById('trackSearchInput');
const searchBtn = document.getElementById('searchBtn');
const searchResults = document.getElementById('searchResults');
const seedList = document.getElementById('seedList');
const recommendBtn = document.getElementById('recommendBtn');
const recommendations = document.getElementById('recommendations');
const createPlaylistBtn = document.getElementById('createPlaylistBtn');
const playlistNameInput = document.getElementById('playlistNameInput');
const playlistStatus = document.getElementById('playlistStatus');

let clientId = localStorage.getItem('spotify_client_id') || '';
let accessToken = null;
let currentUser = null;
let seedTracks = [];
let recommendedTracks = [];

const setStatus = (node, message, isError = false) => {
  node.textContent = message;
  node.classList.toggle('error', isError);
};

const generateRandomString = (length) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return [...crypto.getRandomValues(new Uint8Array(length))]
    .map((x) => chars[x % chars.length])
    .join('');
};

const sha256 = async (plain) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return new Uint8Array(digest);
};

const toBase64Url = (bytes) =>
  btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

const getClientId = () => clientId.trim();

const saveClientId = () => {
  const incoming = clientIdInput.value.trim();
  if (!incoming) {
    setStatus(authStatus, 'Please paste your Spotify Client ID.', true);
    return;
  }
  clientId = incoming;
  localStorage.setItem('spotify_client_id', clientId);
  setStatus(authStatus, 'Client ID saved. You can now connect Spotify.');
};

const startSpotifyLogin = async () => {
  const cid = getClientId();
  if (!cid) {
    setStatus(authStatus, 'Save your Spotify Client ID first.', true);
    return;
  }

  const verifier = generateRandomString(128);
  const challenge = toBase64Url(await sha256(verifier));
  localStorage.setItem('spotify_pkce_verifier', verifier);

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: cid,
    scope: SCOPES.join(' '),
    code_challenge_method: 'S256',
    code_challenge: challenge,
    redirect_uri: REDIRECT_URI,
  });

  window.location.href = `https://accounts.spotify.com/authorize?${params}`;
};

const exchangeCodeForToken = async (code) => {
  const cid = getClientId();
  if (!cid) throw new Error('No Spotify Client ID saved.');

  const verifier = localStorage.getItem('spotify_pkce_verifier');
  if (!verifier) throw new Error('Missing PKCE verifier in localStorage.');

  const body = new URLSearchParams({
    client_id: cid,
    grant_type: 'authorization_code',
    code,
    redirect_uri: REDIRECT_URI,
    code_verifier: verifier,
  });

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error_description || 'Could not fetch token.');

  accessToken = data.access_token;
  sessionStorage.setItem('spotify_access_token', accessToken);
};

const spotifyFetch = async (url, options = {}) => {
  if (!accessToken) throw new Error('Not authenticated with Spotify yet.');
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`Spotify API error (${res.status}): ${msg}`);
  }

  return res.status === 204 ? null : res.json();
};

const fetchCurrentUser = async () => {
  currentUser = await spotifyFetch('https://api.spotify.com/v1/me');
  setStatus(authStatus, `Connected as ${currentUser.display_name || currentUser.id}.`);
};

const renderTrackList = (node, tracks, actionLabel, onAction, withCheckbox = false) => {
  node.innerHTML = '';
  if (!tracks.length) {
    const li = document.createElement('li');
    li.textContent = 'No tracks yet.';
    node.append(li);
    return;
  }

  tracks.forEach((track, idx) => {
    const li = document.createElement('li');
    const meta = document.createElement('div');
    meta.className = 'track-meta';

    const title = document.createElement('strong');
    title.textContent = track.name;
    const subtitle = document.createElement('span');
    subtitle.textContent = `${track.artists.map((a) => a.name).join(', ')} • ${track.album.name}`;

    meta.append(title, subtitle);
    li.append(meta);

    if (withCheckbox) {
      const check = document.createElement('input');
      check.type = 'checkbox';
      check.checked = true;
      check.dataset.uri = track.uri;
      check.setAttribute('aria-label', `Include ${track.name} in playlist`);
      li.append(check);
    } else {
      const btn = document.createElement('button');
      btn.textContent = actionLabel;
      btn.addEventListener('click', () => onAction(track, idx));
      li.append(btn);
    }

    node.append(li);
  });
};

const renderSeeds = () => {
  renderTrackList(seedList, seedTracks, 'Remove', (_track, idx) => {
    seedTracks.splice(idx, 1);
    renderSeeds();
  });
};

const searchTracks = async () => {
  const q = trackSearchInput.value.trim();
  if (!q) return;

  try {
    setStatus(playlistStatus, '');
    const data = await spotifyFetch(
      `https://api.spotify.com/v1/search?${new URLSearchParams({ q, type: 'track', limit: '10' })}`
    );
    renderTrackList(searchResults, data.tracks.items, 'Add seed', (track) => {
      if (seedTracks.length >= 5) {
        setStatus(playlistStatus, 'Spotify recommendations supports up to 5 seeds.', true);
        return;
      }
      if (seedTracks.some((t) => t.id === track.id)) return;
      seedTracks.push(track);
      renderSeeds();
    });
  } catch (err) {
    setStatus(playlistStatus, err.message, true);
  }
};

const getRecommendations = async () => {
  if (!seedTracks.length) {
    setStatus(playlistStatus, 'Add at least 1 seed track first.', true);
    return;
  }

  try {
    const params = new URLSearchParams({
      limit: '20',
      seed_tracks: seedTracks.map((t) => t.id).join(','),
    });
    const data = await spotifyFetch(`https://api.spotify.com/v1/recommendations?${params}`);
    recommendedTracks = data.tracks;
    renderTrackList(recommendations, recommendedTracks, '', () => {}, true);
    setStatus(playlistStatus, `Loaded ${recommendedTracks.length} recommendations.`);
  } catch (err) {
    setStatus(playlistStatus, err.message, true);
  }
};

const createPlaylist = async () => {
  if (!currentUser) {
    setStatus(playlistStatus, 'Connect Spotify first.', true);
    return;
  }

  const checked = [...recommendations.querySelectorAll('input[type="checkbox"]:checked')];
  const uris = checked.map((el) => el.dataset.uri);
  if (!uris.length) {
    setStatus(playlistStatus, 'No recommended songs selected.', true);
    return;
  }

  try {
    const playlistName = playlistNameInput.value.trim() || 'My Songify Mix';
    const created = await spotifyFetch(`https://api.spotify.com/v1/users/${currentUser.id}/playlists`, {
      method: 'POST',
      body: JSON.stringify({
        name: playlistName,
        description: 'Playlist created with Songify',
        public: false,
      }),
    });

    await spotifyFetch(`https://api.spotify.com/v1/playlists/${created.id}/tracks`, {
      method: 'POST',
      body: JSON.stringify({ uris }),
    });

    setStatus(playlistStatus, `Done! Playlist created: ${created.name}.`);
  } catch (err) {
    setStatus(playlistStatus, err.message, true);
  }
};

const completeOAuthIfNeeded = async () => {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  const error = params.get('error');

  if (error) {
    setStatus(authStatus, `Spotify auth failed: ${error}`, true);
    return;
  }

  if (code) {
    try {
      await exchangeCodeForToken(code);
      window.history.replaceState({}, document.title, REDIRECT_URI);
    } catch (err) {
      setStatus(authStatus, err.message, true);
      return;
    }
  } else {
    accessToken = sessionStorage.getItem('spotify_access_token');
  }

  if (accessToken) {
    await fetchCurrentUser();
  }
};

const bootstrap = () => {
  clientIdInput.value = clientId;
  redirectUriText.textContent = REDIRECT_URI;
};

loginBtn.addEventListener('click', startSpotifyLogin);
saveClientBtn.addEventListener('click', saveClientId);
searchBtn.addEventListener('click', searchTracks);
recommendBtn.addEventListener('click', getRecommendations);
createPlaylistBtn.addEventListener('click', createPlaylist);
trackSearchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    searchTracks();
  }
});

bootstrap();
completeOAuthIfNeeded().catch((err) => setStatus(authStatus, err.message, true));
