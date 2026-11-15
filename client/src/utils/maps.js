// Helpers for shop locations. No map account or API key is needed:
// the map picture comes from OpenStreetMap and "Directions" opens Google Maps in a new tab.

export const hasLocation = (shop) => shop.latitude != null && shop.longitude != null;

// A small map with a pin, to put inside an <iframe>
export function osmEmbedUrl(lat, lng, delta = 0.004) {
  const bbox = [lng - delta, lat - delta, lng + delta, lat + delta].join(',');
  return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${encodeURIComponent(`${lat},${lng}`)}`;
}

// The same place on the full OpenStreetMap page
export const osmPageUrl = (lat, lng) => `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=17/${lat}/${lng}`;

export const fullAddress = (shop) =>
  [shop.address, shop.city, [shop.state, shop.pincode].filter(Boolean).join(' ')].filter(Boolean).join(', ');

// Opens turn-by-turn directions. Uses the exact position when we have it, otherwise the address.
export function directionsUrl(shop) {
  const destination = hasLocation(shop) ? `${shop.latitude},${shop.longitude}` : fullAddress(shop);
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
}

// "0120 456-7890" -> "tel:01204567890" so tapping the number starts a call on a phone
export const telHref = (phone) => `tel:${String(phone).replace(/[^\d+]/g, '')}`;

export const formatDistance = (km) => (km < 0.1 ? 'Less than 0.1 km away' : `${km} km away`);