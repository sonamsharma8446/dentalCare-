import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getArticle } from '../../api/contentApi';
import ArticleBody from '../../components/article/ArticleBody';
import { kindLabel } from '../../components/article/ArticleCard';
import WarningBox from '../../components/product/WarningBox';
import Loader from '../../components/common/Loader';
import { formatDate } from '../../utils/date';

export default function ArticleDetail() {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [status, setStatus] = useState('loading'); // loading | ready | notFound | error
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    window.scrollTo({ top: 0 });

    getArticle(slug)
      .then((data) => {
        if (cancelled) return;
        setArticle(data);
        setStatus('ready');
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

  if (status === 'loading') return <Loader label="Loading..." />;

  if (status !== 'ready') {
    return (
      <section className="mx-auto max-w-6xl px-4 py-20 text-center">
        <h1 className="text-2xl font-semibold text-slate-800">{status === 'notFound' ? 'Article not found' : 'Could not load this page'}</h1>
        <p className="mt-2 text-slate-500">{status === 'notFound' ? 'It may have been removed or the link is incorrect.' : errorMessage}</p>
        <Link to="/articles" className="mt-6 inline-block rounded-md bg-teal-600 px-5 py-2 font-medium text-white hover:bg-teal-700">
          Back to Articles
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <nav aria-label="Breadcrumb" className="text-sm text-slate-500">
        <Link to="/articles" className="hover:text-teal-700 hover:underline">
          Articles and Instructions
        </Link>
      </nav>

      <article className="mx-auto mt-6 max-w-3xl">
        <p className="text-sm font-medium uppercase tracking-wide text-teal-700">{kindLabel[article.kind]}</p>
        <h1 className="mt-1 text-3xl font-bold text-slate-900">{article.title}</h1>
        <p className="mt-2 text-sm text-slate-500">Added {formatDate(article.createdAt)}</p>
        {article.summary && <p className="mt-4 text-lg text-slate-600">{article.summary}</p>}

        {article.body && (
          <div className="mt-8">
            <ArticleBody text={article.body} />
          </div>
        )}

        <div className="mt-8">
          <WarningBox title="Please note">
            <p>
              The information on this page is for general education and is not a substitute for professional dental
              advice. Consult a dentist if you have any concerns about your teeth or gums.
            </p>
          </WarningBox>
        </div>

        {article.sourceNote && <p className="mt-4 text-xs text-slate-500">Information source: {article.sourceNote}</p>}
      </article>
    </section>
  );
}