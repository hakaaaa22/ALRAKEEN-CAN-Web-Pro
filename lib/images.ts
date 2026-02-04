export async function getWikimediaThumb(query: string): Promise<string | null> {
  try {
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
      query
    )}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    return data?.thumbnail?.source ?? null;
  } catch {
    return null;
  }
}

export function deviceImageUrl(device?: string): string | null {
  if (!device) return null;

  const map: Record<string, string> = {
    FMC130: "https://www.teltonika-gps.com/media/catalog/product/f/m/fmc130.png",
    FMC150: "https://www.teltonika-gps.com/media/catalog/product/f/m/fmc150.png",
  };

  return map[device] ?? null;
}
