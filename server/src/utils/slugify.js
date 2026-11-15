// "Colgate Total 75g!" -> "colgate-total-75g"
// Used to build clean, readable URLs like /products/colgate-total-75g
export function slugify(text) {
  return String(text)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/[^a-z0-9]+/g, '-') // anything else becomes a dash
    .replace(/^-+|-+$/g, '') // no dashes at the start or end
    .slice(0, 80);
}

// Returns a slug that is not used yet. If "colgate" exists it tries "colgate-2", "colgate-3"...
export async function uniqueSlug(Model, text, excludeId) {
  const base = slugify(text) || 'item';
  let slug = base;
  let counter = 2;

  while (await Model.exists({ slug, ...(excludeId && { _id: { $ne: excludeId } }) })) {
    slug = `${base}-${counter++}`;
  }
  return slug;
}