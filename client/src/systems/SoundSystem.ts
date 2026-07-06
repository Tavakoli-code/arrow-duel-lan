export class SoundSystem {
  private audioContext?: AudioContext;

  private getAudioContext() {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }

    return this.audioContext;
  }

  private playTone(
    frequency: number,
    duration: number,
    type: OscillatorType,
    volume = 0.08,
  ) {
    const audioContext = this.getAudioContext();

    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);

    gain.gain.setValueAtTime(volume, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      audioContext.currentTime + duration,
    );

    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration);
  }

  playShoot() {
    this.playTone(520, 0.08, "triangle", 0.06);
    setTimeout(() => {
      this.playTone(340, 0.08, "triangle", 0.04);
    }, 45);
  }

  playHit() {
    this.playTone(180, 0.12, "square", 0.08);
    setTimeout(() => {
      this.playTone(120, 0.1, "sawtooth", 0.05);
    }, 55);
  }

  playObstacle() {
    this.playTone(90, 0.14, "square", 0.09);
  }

  playMiss() {
    this.playTone(240, 0.08, "sine", 0.035);
  }

  playVictory() {
    this.playTone(440, 0.12, "triangle", 0.07);

    setTimeout(() => {
      this.playTone(660, 0.12, "triangle", 0.07);
    }, 120);

    setTimeout(() => {
      this.playTone(880, 0.18, "triangle", 0.08);
    }, 240);
  }
}
