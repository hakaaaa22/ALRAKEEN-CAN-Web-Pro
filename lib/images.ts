export async function getWikimediaThumb(query: string) {
  if (!query) return null;
  return `https://upload.wikimedia.org/wikipedia/commons/3/3f/Placeholder_view_vector.svg`;
}

export function deviceImageUrl(device: string) {
  if (!device) return null;
  return `https://www.teltonika-gps.com/products/trackers`;
}
