// src/utils/sound.ts
let audioCtx: AudioContext | null = null;

const initAudio = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
};

export const playSound = (type: 'paddle' | 'wall' | 'gameover' | 'brick' | 'victory') => {
  initAudio();
  if (!audioCtx) return;

  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  const now = audioCtx.currentTime;

  if (type === 'paddle') {
    // 패들에 맞았을 때: 통통 튀는 높은 소리
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(600, now);
    oscillator.frequency.exponentialRampToValueAtTime(1000, now + 0.1);
    gainNode.gain.setValueAtTime(0.5, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
    oscillator.start(now);
    oscillator.stop(now + 0.1);
  } else if (type === 'wall') {
    // 벽에 맞았을 때: 짧은 클릭음
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(400, now);
    gainNode.gain.setValueAtTime(0.3, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
    oscillator.start(now);
    oscillator.stop(now + 0.05);
  } else if (type === 'brick') {
    // 벽돌 깨질 때: 경쾌한 파괴음
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(800, now);
    oscillator.frequency.exponentialRampToValueAtTime(100, now + 0.1);
    gainNode.gain.setValueAtTime(0.2, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
    oscillator.start(now);
    oscillator.stop(now + 0.1);
  } else if (type === 'gameover') {
    // 게임 오버: 내려가는 낮은 소리
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(300, now);
    oscillator.frequency.exponentialRampToValueAtTime(50, now + 0.5);
    gainNode.gain.setValueAtTime(0.5, now);
    gainNode.gain.linearRampToValueAtTime(0.01, now + 0.5);
    oscillator.start(now);
    oscillator.stop(now + 0.5);
  } else if (type === 'victory') {
    // 승리: 띠로링~ 하는 긍정적인 멜로디
    const freqs = [523.25, 659.25, 783.99, 1046.50]; // C E G C
    freqs.forEach((freq, i) => {
        const osc = audioCtx!.createOscillator();
        const gn = audioCtx!.createGain();
        osc.connect(gn);
        gn.connect(audioCtx!.destination);
        
        osc.type = 'sine';
        osc.frequency.value = freq;
        
        const startTime = now + i * 0.1;
        gn.gain.setValueAtTime(0.2, startTime);
        gn.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);
        
        osc.start(startTime);
        osc.stop(startTime + 0.3);
    });
    return;
  }
};