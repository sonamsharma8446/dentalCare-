import { osmEmbedUrl } from '../../utils/maps';

// A small map with a pin. Only used when the shop has a position.
export default function ShopMap({ latitude, longitude, title }) {
  return (
    <div className="aspect-[4/3] w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-100 sm:aspect-video">
      <iframe
        src={osmEmbedUrl(Number(latitude), Number(longitude))}
        title={title}
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
        className="h-full w-full"
      />
    </div>
  );
}