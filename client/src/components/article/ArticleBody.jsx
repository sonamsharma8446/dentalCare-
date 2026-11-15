// Shows plain text as paragraphs. A blank line starts a new paragraph; single line breaks are kept
// (handy for numbered steps). React escapes everything, so pasted HTML is shown as text, never run.
export default function ArticleBody({ text }) {
  const paragraphs = text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

  return (
    <div className="space-y-4">
      {paragraphs.map((paragraph, index) => (
        <p key={index} className="whitespace-pre-line text-slate-700">
          {paragraph}
        </p>
      ))}
    </div>
  );
}