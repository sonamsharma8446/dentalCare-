// Same rules as the server (server/src/utils/youtube.js). Used for the admin preview and to build safe embed links.
// The server always re-checks the link, so this file is only a convenience.
const ID = /^[A-Za-z0-9_-]{11}$/;
const WATCH_HOSTS = new Set(['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtube-nocookie.com', 'www.youtube-nocookie.com']);
const PATH_PREFIXES = ['embed', 'shorts', 'live', 'v'];

// Returns the 11-character video id, or null when the text is not a YouTube video link
export function extractYouTubeId(input) {
  if (typeof input !== 'string') return null;
  const text = input.trim();
  if (!text) return null;
  if (ID.test(text)) return text;

  let url;
  try {
    url = new URL(/^https?:\/\//i.test(text) ? text : `https://${text}`);
  } catch {
    return null;
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;

  const host = url.hostname.toLowerCase();
  let candidate = null;
  if (host === 'youtu.be') {
    candidate = url.pathname.split('/')[1];
  } else if (WATCH_HOSTS.has(host)) {
    const parts = url.pathname.split('/').filter(Boolean);
    if (parts[0] === 'watch') candidate = url.searchParams.get('v');
    else if (PATH_PREFIXES.includes(parts[0])) candidate = parts[1];
  }
  return candidate && ID.test(candidate) ? candidate : null;
}

// The privacy-friendly embed address (no tracking cookies until the video is played)
export const embedUrl = (id) => `https://www.youtube-nocookie.com/embed/${id}`;

// The normal YouTube page of the video, for a "Watch on YouTube" link
export const watchUrl = (id) => `https://www.youtube.com/watch?v=${id}`;

// YouTube's own preview picture for a video
export const thumbnailUrl = (id) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;