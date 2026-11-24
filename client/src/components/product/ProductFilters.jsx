import { useState } from 'react';
import SelectField from '../common/SelectField';
import FormField from '../common/FormField';

// Search, category, price, stock and sort controls.
// `values` come from the page address, so filtered results can be bookmarked or shared.
// Dropdowns and the checkbox apply straight away. Text boxes apply when the form is submitted.
export default function ProductFilters({ values, categories, onChange, onClear }) {
  const [draft, setDraft] = useState({
    search: values.search,
  });

  const handleDraft = (e) => setDraft({ ...draft, [e.target.name]: e.target.value });

  // Always send the typed text along, so choosing a category does not throw it away
  const apply = (extra = {}) => onChange({ ...draft, ...extra });

  const handleSubmit = (e) => {
    e.preventDefault();
    apply();
  };

  const hasFilters = Boolean(
    values.search || values.category ||  values.inStock
  );

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <FormField
          label="Search"
          name="search"
          type="search"
          placeholder="Product name or brand"
          value={draft.search}
          onChange={handleDraft}
          className="sm:col-span-2 lg:col-span-1"
        />
        <SelectField label="Category" name="category" value={values.category} onChange={(e) => apply({ category: e.target.value })}>
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c.slug}>
              {c.name} ({c.productCount})
            </option>
          ))}
        </SelectField>
        <SelectField label="Sort by" name="sort" value={values.sort} onChange={(e) => apply({ sort: e.target.value })}>
          <option value="newest">Newest first</option>
          <option value="name_asc">Name: A to Z</option>
        </SelectField>
        
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={values.inStock}
            onChange={(e) => apply({ inStock: e.target.checked ? 'true' : '' })}
            className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
          />
          In stock only
        </label>

        <div className="flex gap-2">
          {hasFilters && (
            <button
              type="button"
              onClick={onClear}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Clear filters
            </button>
          )}
          <button type="submit" className="rounded-md bg-teal-600 px-5 py-2 text-sm font-medium text-white hover:bg-teal-700">
            Apply
          </button>
        </div>
      </div>
    </form>
  );
}