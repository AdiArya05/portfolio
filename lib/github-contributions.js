// GitHub's public calendar is the source of truth, not its limited events feed.
function parseContributions(html) {
  const heading = html.match(/id="js-contribution-activity-description"[^>]*>([\s\S]*?)<\/h2>/);
  const total = Number(heading?.[1].match(/[\d,]+/)?.[0].replaceAll(',', ''));
  const days = [];
  for (const match of html.matchAll(/<td\b([^>]*data-date="[^"]+"[^>]*)><\/td>\s*<tool-tip\b[^>]*>([^<]*)<\/tool-tip>/g)) {
    const date = match[1].match(/data-date="(\d{4}-\d{2}-\d{2})"/)?.[1];
    const level = Number(match[1].match(/data-level="([0-4])"/)?.[1]);
    const count = match[2].startsWith('No contributions') ? 0 : Number(match[2].match(/^[\d,]+/)?.[0].replaceAll(',', ''));
    if (!date || !Number.isInteger(level) || !Number.isInteger(count)) throw new Error('Invalid calendar day');
    days.push({ date, level, count });
  }
  days.sort((a, b) => a.date.localeCompare(b.date));
  if (!Number.isInteger(total) || days.length < 350 || new Set(days.map(day => day.date)).size !== days.length) {
    throw new Error('Incomplete GitHub calendar');
  }
  return { username: 'AdiArya05', total, days, updatedAt: new Date().toISOString() };
}

module.exports = { parseContributions };
