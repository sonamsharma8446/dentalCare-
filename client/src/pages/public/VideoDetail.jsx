import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getVideo, getRelatedVideos } from '../../api/contentApi';
import VideoEmbed from '../../components/video/VideoEmbed';
import VideoCard from '../../components/video/VideoCard';
import WarningBox from '../../components/product/WarningBox';
import Loader from '../../components/common/Loader';
import { watchUrl } from '../../utils/youtube';

export default function VideoDetail() {
  const { slug } = useParams();
  const [video, setVideo] = useState(null);
  const [related, setRelated] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | ready | notFound | error
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    setRelated([]);
    window.scrollTo({ top: 0 });

    getVideo(slug)
      .then((data) => {
        if (cancelled) return;
        setVideo(data);
        setStatus('ready');
        // Related videos are a bonus: if they fail to load the page still works
        getRelatedVideos(slug)
          .then((items) => !cancelled && setRelated(items))
          .catch(() => {});
      })
      .catch((err) => {
        if (cancelled) return;
        if (err.response?.status === 404) setStatus('notFound');
        else {
          setErrorMessage(err.message);
          setStatus('error');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (status === 'loading') return <Loader label="Loading video..." />;

  if (status !== 'ready') {
    return (
      <section className="mx-auto max-w-6xl px-4 py-20 text-center">
        <h1 className="text-2xl font-semibold text-slate-800">{status === 'notFound' ? 'Video not found' : 'Could not load this video'}</h1>
        <p className="mt-2 text-slate-500">{status === 'notFound' ? 'It may have been removed or the link is incorrect.' : errorMessage}</p>
        <Link to="/videos" className="mt-6 inline-block rounded-md bg-teal-600 px-5 py-2 font-medium text-white hover:bg-teal-700">
          Back to Videos
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <nav aria-label="Breadcrumb" className="text-sm text-slate-500">
        <Link to="/videos" className="hover:text-teal-700 hover:underline">
          Videos
        </Link>
        {video.category && (
          <>
            {' / '}
            <Link to={`/videos?category=${video.category.slug}`} className="hover:text-teal-700 hover:underline">
              {video.category.name}
            </Link>
          </>
        )}
      </nav>

      <div className="mx-auto mt-6 max-w-3xl">
        <VideoEmbed youtubeId={video.youtubeId} title={video.title} />

        <h1 className="mt-6 text-3xl font-bold text-slate-900">{video.title}</h1>
        <p className="mt-2 text-sm text-slate-500">
          {video.credit && <span>Video by {video.credit} · </span>}
          <a href={watchUrl(video.youtubeId)} target="_blank" rel="noopener noreferrer" className="font-medium text-teal-700 hover:underline">
            Watch on YouTube
          </a>
        </p>

        {video.description && <p className="mt-6 whitespace-pre-line text-slate-700">{video.description}</p>}

        <div className="mt-6">
          <WarningBox title="Please note">
            <p>
              This video is for general education and is not a substitute for professional dental advice. Consult a
              dentist if you have any concerns about your teeth or gums.
            </p>
          </WarningBox>
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-14">
          <h2 className="text-xl font-semibold text-slate-900">More in {video.category?.name || 'this category'}</h2>
          <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item) => (
              <VideoCard key={item._id} video={item} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}