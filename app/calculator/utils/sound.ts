// app/calculator/utils/sound.ts

type SoundType = 'digit' | 'operator' | 'clear' | 'equals';

class SoundManager {
    private context: AudioContext | null = null;

    private getContext(): AudioContext {
        if (!this.context) {
            this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        return this.context;
    }

    play(type: SoundType) {
        try {
            const ctx = this.getContext();
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);

            const now = ctx.currentTime;

            switch (type) {
                case 'digit':
                    // Short, high-pitched "blip"
                    oscillator.type = 'sine';
                    oscillator.frequency.setValueAtTime(800, now);
                    oscillator.frequency.exponentialRampToValueAtTime(400, now + 0.1);
                    gainNode.gain.setValueAtTime(0.1, now);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                    oscillator.start(now);
                    oscillator.stop(now + 0.1);
                    break;

                case 'operator':
                    // Slightly lower, more mechanical click
                    oscillator.type = 'triangle';
                    oscillator.frequency.setValueAtTime(600, now);
                    gainNode.gain.setValueAtTime(0.1, now);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                    oscillator.start(now);
                    oscillator.stop(now + 0.1);
                    break;

                case 'clear':
                    // Descending tone
                    oscillator.type = 'sine';
                    oscillator.frequency.setValueAtTime(600, now);
                    oscillator.frequency.linearRampToValueAtTime(200, now + 0.2);
                    gainNode.gain.setValueAtTime(0.1, now);
                    gainNode.gain.linearRampToValueAtTime(0.01, now + 0.2);
                    oscillator.start(now);
                    oscillator.stop(now + 0.2);
                    break;

                case 'equals':
                    // Ascending "success" tone
                    oscillator.type = 'sine';
                    oscillator.frequency.setValueAtTime(400, now);
                    oscillator.frequency.linearRampToValueAtTime(800, now + 0.15);
                    gainNode.gain.setValueAtTime(0.1, now);
                    gainNode.gain.linearRampToValueAtTime(0.01, now + 0.15);
                    oscillator.start(now);
                    oscillator.stop(now + 0.15);
                    break;
            }
        } catch (e) {
            console.error('Audio playback failed', e);
        }
    }
}

export const soundManager = new SoundManager();
