const BASE_URL = "https://saavn.sumit.co";

const cache = new Map<string, any>();

export async function searchSongs(query: string, page: number) {
  const cacheKey = `${query}_${page}`;

  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  const url = `${BASE_URL}/api/search/songs?query=${encodeURIComponent(
    query
  )}&page=${page}`;

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Search failed: ${res.status}`);
  }

  const json = await res.json();

  const results = json?.data?.results ?? [];
  const total = json?.data?.total ?? results.length;

  const payload = { results, total };

  cache.set(cacheKey, payload);

  return payload;
}