import { Audio } from "expo-av";

type StatusCb = (status: any) => void;

class AudioService {
  private sound: Audio.Sound | null = null;

  async loadAndPlay(url: string, onStatusUpdate: StatusCb) {
    if (this.sound) {
      try {
        this.sound.setOnPlaybackStatusUpdate(null);
        await this.sound.unloadAsync();
      } catch {}
      this.sound = null;
    }

    const { sound } = await Audio.Sound.createAsync(
      { uri: url },
      { shouldPlay: true },
      onStatusUpdate
    );

    this.sound = sound;
  }

  async pause() {
    if (this.sound) await this.sound.pauseAsync();
  }

  async resume() {
    if (this.sound) await this.sound.playAsync();
  }

  async seek(positionMillis: number) {
    if (this.sound) await this.sound.setPositionAsync(positionMillis);
  }
}

export const audioService = new AudioService();