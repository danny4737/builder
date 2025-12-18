class AudioService {
  private ctx: AudioContext | null = null;

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  private playTone(freq: number, type: OscillatorType, duration: number, volume: number) {
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    
    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  playPick() {
    this.playTone(440, 'sine', 0.1, 0.1);
  }

  playPlace() {
    this.playTone(220, 'sine', 0.15, 0.2);
  }

  playClear() {
    this.playTone(523.25, 'triangle', 0.2, 0.3);
    setTimeout(() => this.playTone(659.25, 'triangle', 0.2, 0.3), 50);
    setTimeout(() => this.playTone(783.99, 'triangle', 0.3, 0.3), 100);
  }
}

export const audio = new AudioService();