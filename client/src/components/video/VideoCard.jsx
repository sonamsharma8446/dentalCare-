import { Link } from 'react-router-dom';
import { thumbnailUrl } from '../../utils/youtube';

export default function VideoCard({ video }) {
  return (
    <Link
      to={`/videos/${video.slug}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:border-teal-300 hover:shadow"
    >
      <div className="relative aspect-video w-full bg-slate-100">
        <img src={thumbnailUrl(video.youtubeId)} alt="" loading="lazy" className="h-full w-full object-cover" />
        <span
          aria-hidden="true"
          className="absolute inset-0 m-auto flex h-12 w-12 items-center justify-center rounded-full bg-black/60 text-white"
        >
          <svg viewBox="0 0 24 24" className="ml-0.5 h-6 w-6 fill-current">
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        {video.category && <p className="text-xs font-medium uppercase tracking-wide text-teal-700">{video.category.name}</p>}
        <h3 className="mt-1 font-semibold text-slate-900 group-hover:text-teal-700">{video.title}</h3>
      </div>
    </Link>
  );
}