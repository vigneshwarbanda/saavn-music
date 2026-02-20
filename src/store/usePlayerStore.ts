import { create } from "zustand";
import { Track } from "../types/track";
import { audioService } from "../services/audioService";
import { useQueueStore } from "./useQueueStore";

type PlayerState = {
  currentTrack: Track | null;
  isPlaying: boolean;
  position: number;
  duration: number;

  playTrack: (track: Track) => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  seek: (positionMillis: number) => Promise<void>;

  skipForward: () => Promise<void>;
  skipBackward: () => Promise<void>;

  playNext: () => Promise<void>;
  playPrev: () => Promise<void>;
};

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentTrack: null,
  isPlaying: false,
  position: 0,
  duration: 0,

  playTrack: async (track) => {
    if (!track?.url) return;

    const { currentTrack, isPlaying } = get();

    // same track -> toggle play/pause
    if (currentTrack?.id === track.id) {
      if (isPlaying) {
        await audioService.pause();
        set({ isPlaying: false });
      } else {
        await audioService.resume();
        set({ isPlaying: true });
      }
      return;
    }

    // ✅ ensure the played track is in queue (core sync guarantee)
    await useQueueStore.getState().ensureInQueue(track);

    await audioService.loadAndPlay(track.url, (status: any) => {
      if (!status?.isLoaded) return;

      if (status.didJustFinish) {
        set({ isPlaying: false, position: 0 });
        setTimeout(() => {
          get().playNext().catch(() => {});
        }, 0);
        return;
      }

      set({
        position: status.positionMillis ?? 0,
        duration: status.durationMillis ?? track.durationMs ?? 0,
        isPlaying: !!status.isPlaying,
      });
    });

    set({
      currentTrack: track,
      isPlaying: true,
      position: 0,
      duration: track.durationMs ?? 0,
    });
  },

  pause: async () => {
    await audioService.pause();
    set({ isPlaying: false });
  },

  resume: async () => {
    await audioService.resume();
    set({ isPlaying: true });
  },

  seek: async (positionMillis) => {
    await audioService.seek(positionMillis);
    set({ position: positionMillis });
  },

  skipForward: async () => {
    const { position, duration } = get();
    const next = Math.min(position + 10_000, duration || 0);
    await audioService.seek(next);
    set({ position: next });
  },

  skipBackward: async () => {
    const { position } = get();
    const prev = Math.max(position - 10_000, 0);
    await audioService.seek(prev);
    set({ position: prev });
  },

  playNext: async () => {
    const track = get().currentTrack;
    if (!track) return;

    const q = useQueueStore.getState().queue;
    if (!q.length) return;

    let idx = q.findIndex((t) => t.id === track.id);

    // ✅ if somehow not found, fallback: play first item
    if (idx === -1) {
      await get().playTrack(q[0]);
      return;
    }

    const next = q[idx + 1];
    if (!next) return;

    await get().playTrack(next);
  },

  playPrev: async () => {
    const track = get().currentTrack;
    if (!track) return;

    const q = useQueueStore.getState().queue;
    if (!q.length) return;

    let idx = q.findIndex((t) => t.id === track.id);

    // ✅ if somehow not found, do nothing (or play first)
    if (idx === -1) return;

    const prev = q[idx - 1];
    if (!prev) return;

    await get().playTrack(prev);
  },
}));