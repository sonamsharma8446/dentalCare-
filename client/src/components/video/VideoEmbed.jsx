import { embedUrl } from '../../utils/youtube';

// Shows a YouTube video inside the page. The address is always built from the 11-character id,
// never from text typed by a visitor or admin, so it can only ever point at YouTube.
export default function VideoEmbed({ youtubeId, title }) {
  return (
    <div className="aspect-video w-full overflow-hidden rounded-lg border border-slate-200 bg-black">
      <iframe
        src={embedUrl(youtubeId)}
        title={title}
        loading="lazy"
        allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
        className="h-full w-full"
      />
    </div>
  );
}