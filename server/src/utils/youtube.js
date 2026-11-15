// Turns whatever the admin pastes into a plain YouTube video id (11 characters), or null if it is not a YouTube video.
// Only the id is ever stored. The embed address is always built by us, so a pasted link can never put
// an arbitrary website into the page.
//
// Accepted:
//   https://www.youtube.com/watch?v=dQw4w9WgXcQ   (also m.youtube.com and youtube.com, extra parameters are fine)
//   https://youtu.be/dQw4w9WgXcQ
//   https://www.youtube.com/embed/dQw4w9WgXcQ     (also youtube-nocookie.com, /shorts/, /live/, /v/)
//   dQw4w9WgXcQ                                   (just the id)
const ID = /^[A-Za-z0-9_-]{11}$/;

const WATCH_HOSTS = new Set(['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtube-nocookie.com', 'www.youtube-nocookie.com']);
const PATH_PREFIXES = ['embed', 'shorts', 'live', 'v'];

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