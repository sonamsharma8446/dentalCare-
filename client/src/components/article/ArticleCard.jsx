import { Link } from 'react-router-dom';
import { formatDate } from '../../utils/date';

export const kindLabel = { article: 'Article', instruction: 'Instructions' };

export default function ArticleCard({ article }) {
  return (
    <Link
      to={`/articles/${article.slug}`}
      className="group flex flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-teal-300 hover:shadow"
    >
      <p className="text-xs font-medium uppercase tracking-wide text-teal-700">{kindLabel[article.kind]}</p>
      <h3 className="mt-1 font-semibold text-slate-900 group-hover:text-teal-700">{article.title}</h3>
      {article.summary && <p className="mt-2 text-sm text-slate-600">{article.summary}</p>}
      <p className="mt-auto pt-4 text-xs text-slate-500">{formatDate(article.createdAt)}</p>
    </Link>
  );
}