const { getAccessToken, invalidateAccessToken } = require('../lib/spotify-auth');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).end();
  }
  const { SPOTIFY_CLIENT_ID: id, SPOTIFY_CLIENT_SECRET: secret, SPOTIFY_REFRESH_TOKEN: refreshToken } = process.env;
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=2');
  if (!id || !secret || !refreshToken) {
    console.warn('Spotify production credentials are incomplete');
    return res.status(200).json({ track: null });
  }

  try {
    const token = await getAccessToken(id, secret, refreshToken);
    const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
      headers: { Authorization: 'Bearer ' + token },
      signal: AbortSignal.timeout(5000)
    });
    if (response.status === 204) return res.status(200).json({ track: null });
    if (response.status === 401) invalidateAccessToken();
    if (!response.ok) throw new Error('Spotify playback unavailable (' + response.status + ')');
    const { is_playing, item, device, progress_ms } = await response.json();
    const url = item?.external_urls?.spotify;
    if (is_playing !== true || device?.is_private_session || item?.type !== 'track' ||
        !item.name || !/^https:\/\/open\.spotify\.com\/track\/[a-zA-Z0-9]+$/.test(url)) {
      return res.status(200).json({ track: null });
    }
    const artist = (item.artists || []).map(entry => entry.name).filter(Boolean).join(', ');
    const artwork = item.album?.images?.find(image => image.width >= 120)?.url;
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({ track: {
      name: item.name, artist, url,
      artwork: /^https:\/\/i\.scdn\.co\/image\/[a-zA-Z0-9]+$/.test(artwork) ? artwork : null,
      isPlaying: true,
      progressMs: progress_ms,
      durationMs: item.duration_ms,
      observedAt: Date.now()
    } });
  } catch (error) {
    console.warn('Now Playing request failed', error.message);
    res.setHeader('Cache-Control', 'no-store');
    return res.status(503).json({ track: null });
  }
};
