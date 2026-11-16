const { getAccessToken, invalidateAccessToken } = require('../lib/spotify-auth');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).end();
  }
  const { SPOTIFY_CLIENT_ID: id, SPOTIFY_CLIENT_SECRET: secret, SPOTIFY_REFRESH_TOKEN: refreshToken } = process.env;
  res.setHeader('Cache-Control', 'no-store');
  if (!id || !secret || !refreshToken) return res.status(503).json({ track: null });

  try {
    const token = await getAccessToken(id, secret, refreshToken);
    const response = await fetch('https://api.spotify.com/v1/me/player/recently-played?limit=1', {
      headers: { Authorization: 'Bearer ' + token },
      signal: AbortSignal.timeout(5000)
    });
    if (response.status === 403) return res.status(403).json({ track: null });
    if (response.status === 401) invalidateAccessToken();
    if (!response.ok) throw new Error('Spotify history unavailable (' + response.status + ')');
    const { items } = await response.json();
    const item = items?.[0]?.track;
    const artist = item?.artists?.map(entry => entry.name).filter(Boolean).join(', ');
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=30');
    return res.status(200).json({ track: item?.name && artist ? { name: item.name, artist } : null });
  } catch (error) {
    console.warn('Last Played request failed', error.message);
    return res.status(503).json({ track: null });
  }
};
