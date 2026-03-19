/**
 * SYSTEMA | Audio Synthesis Engine
 * Generates 8-bit "System" sounds using Web Audio API.
 */

const AudioEngine = {
    ctx: null,
    isInitialized: false,

    /**
     * Initialize the Audio Context (must be triggered by user interaction)
     */
    init() {
        if (this.isInitialized) return;
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.isInitialized = true;
        console.log("AUDIO SYSTEM: [Online]");
    },

    /**
     * Internal helper to create an oscillator
     */
    playTone(freq, type, duration, volume) {
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type; // 'square', 'sawtooth', 'triangle', 'sine'
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        gain.gain.setValueAtTime(volume, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    },

    /**
     * SOUND: System Notification / Quest Pop
     */
    playNotif() {
        this.playTone(523.25, 'square', 0.2, 0.1); // C5
        setTimeout(() => this.playTone(659.25, 'square', 0.3, 0.1), 100); // E5
    },

    /**
     * SOUND: Level Up / Rank Increase
     */
    playLevelUp() {
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C-E-G-C Arpeggio
        notes.forEach((freq, i) => {
            setTimeout(() => this.playTone(freq, 'sawtooth', 0.4, 0.05), i * 150);
        });
    },

    /**
     * SOUND: Error / Stamina Low
     */
    playError() {
        this.playTone(150, 'sawtooth', 0.3, 0.1);
        setTimeout(() => this.playTone(110, 'sawtooth', 0.5, 0.1), 100);
    },

    /**
     * SOUND: Footstep (Subtle)
     */
    playStep() {
        this.playTone(80, 'triangle', 0.05, 0.02);
    }
};