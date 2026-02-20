import { create } from "zustand";
import { Track } from "../types/track";
import { loadQueue, saveQueue } from "../services/storage";

type QueueState = {
  queue: Track[];
  hydrated: boolean;

  hydrate: () => Promise<void>;
  ensureInQueue: (track: Track) => Promise<void>;
  addToQueue: (track: Track) => Promise<void>;
  removeFromQueue: (trackId: string) => Promise<void>;
  moveUp: (index: number) => Promise<void>;
  moveDown: (index: number) => Promise<void>;
  clearQueue: () => Promise<void>;
};

export const useQueueStore = create<QueueState>((set, get) => ({
  queue: [],
  hydrated: false,

  hydrate: async () => {
    const saved = await loadQueue<Track[]>();
    set({ queue: saved ?? [], hydrated: true });
  },

  ensureInQueue: async (track) => {
    const q = get().queue;
    const exists = q.some((t) => t.id === track.id);
    if (exists) return;

    const next = [...q, track];
    set({ queue: next });
    await saveQueue(next);
  },

  addToQueue: async (track) => {
    const next = [...get().queue, track];
    set({ queue: next });
    await saveQueue(next);
  },

  removeFromQueue: async (trackId) => {
    const next = get().queue.filter((t) => t.id !== trackId);
    set({ queue: next });
    await saveQueue(next);
  },

  moveUp: async (index) => {
    if (index <= 0) return;
    const q = [...get().queue];
    [q[index - 1], q[index]] = [q[index], q[index - 1]];
    set({ queue: q });
    await saveQueue(q);
  },

  moveDown: async (index) => {
    const q = [...get().queue];
    if (index < 0 || index >= q.length - 1) return;
    [q[index], q[index + 1]] = [q[index + 1], q[index]];
    set({ queue: q });
    await saveQueue(q);
  },

  clearQueue: async () => {
    set({ queue: [] });
    await saveQueue([]);
  },
}));