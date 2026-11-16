let accessToken;
let expiresAt = 0;
let refreshPending;

function invalidateAccessToken() { expiresAt = 0; }

function getAccessToken(id, secret, refreshToken) {
  if (accessToken && Date.now() < expiresAt) return accessToken;
  refreshPending ??= (async () => {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + Buffer.from(id + ':' + secret).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: refreshToken }),
      signal: AbortSignal.timeout(5000)
    });
    if (!response.ok) throw new Error('Spotify authorization failed (' + response.status + ')');
    const token = await response.json();
    accessToken = token.access_token;
    expiresAt = Date.now() + (token.expires_in - 60) * 1000;
    return accessToken;
  })().finally(() => { refreshPending = undefined; });
  return refreshPending;
}

module.exports = { getAccessToken, invalidateAccessToken };
