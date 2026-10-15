const { parseContributions } = require('../lib/github-contributions');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const response = await fetch('https://github.com/users/AdiArya05/contributions', {
      headers: { Accept: 'text/html', 'User-Agent': 'AdiArya-Portfolio' },
      signal: AbortSignal.timeout(8000)
    });
    if (!response.ok) throw new Error(`GitHub returned ${response.status}`);
    const calendar = parseContributions(await response.text());
    res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400');
    return res.status(200).json(calendar);
  } catch (error) {
    console.error('GitHub calendar fetch failed:', error.message);
    res.setHeader('Cache-Control', 'no-store');
    return res.status(502).json({ error: 'GitHub calendar temporarily unavailable' });
  }
};
