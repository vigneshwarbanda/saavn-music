import { Track } from "../types/track";

const pickBestImage = (images: any[]) => {
  if (!Array.isArray(images) || images.length === 0) return "";
  // prefer 500x500, else last
  const img500 = images.find((i) => i.quality === "500x500");
  return (img500?.link || img500?.url || images[images.length - 1]?.link || images[images.length - 1]?.url || "");
};

const pickBestAudioUrl = (downloadUrl: any[]) => {
  if (!Array.isArray(downloadUrl) || downloadUrl.length === 0) return "";
  // prefer 320kbps if present
  const best = downloadUrl.find((d) => d.quality === "320kbps") || downloadUrl[downloadUrl.length - 1];
  return best?.link || best?.url || "";
};

export function normalizeSongToTrack(song: any): Track {
  return {
    id: String(song.id),
    title: String(song.name ?? song.title ?? "Unknown"),
    artist: String(song.primaryArtists ?? song.primaryArtistsName ?? song.artists?.primary?.[0]?.name ?? "Unknown"),
    artwork: pickBestImage(song.image),
    url: pickBestAudioUrl(song.downloadUrl),
    durationMs: Number(song.duration ? Number(song.duration) * 1000 : 0),
  };
}