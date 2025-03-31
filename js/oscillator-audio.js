/**
 * Vibe Pong - Oscillator Audio System
 * Uses Web Audio API oscillators for maximum compatibility
 */

class OscillatorAudioManager {
    constructor() {
        // Audio state
        this.enabled = true;
        this.initialized = false;
        
        // Bind methods
        this.init = this.init.bind(this);
        this.playSound = this.playSound.bind(this);
        this.toggle = this.toggle.bind(this);
    }
    
    /**
     * Initialize audio system
     * @returns {Promise<boolean>} Success state
     */
    async init() {
        try {
            // Lazy create AudioContext when needed to avoid autoplay restrictions
            this.ctx = null;
            this.initialized = true;
            console.log('Oscillator audio system ready');
            return true;
        } catch (error) {
            console.error('Error initializing audio system:', error);
            return false;
        }
    }
    
    /**
     * Get or create AudioContext
     * @returns {AudioContext} The audio context
     */
    getContext() {
        if (!this.ctx) {
            // Create on first use
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
            
            // iOS specific: resume context on user interaction if suspended
            if (this.ctx.state === 'suspended') {
                const resumeAudio = () => {
                    this.ctx.resume().then(() => {
                        console.log('AudioContext resumed successfully');
                        
                        // Remove event listeners after first successful resume
                        document.removeEventListener('touchstart', resumeAudio);
                        document.removeEventListener('click', resumeAudio);
                    });
                };
                
                document.addEventListener('touchstart', resumeAudio, { once: true });
                document.addEventListener('click', resumeAudio, { once: true });
            }
        }
        return this.ctx;
    }
    
    /**
     * Play a sound by type
     * @param {string} soundType - Type of sound to play (bounce, wall, score)
     * @returns {boolean} Success state
     */
    playSound(soundType) {
        if (!this.enabled || !this.initialized) {
            console.warn(`Cannot play ${soundType} sound: audio ${!this.enabled ? 'disabled' : 'not initialized'}`);
            return false;
        }
        
        try {
            const ctx = this.getContext();
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();
            
            // Different sound characteristics for each type
            switch(soundType) {
                case 'bounce':
                    // Paddle hit - short bright ping
                    oscillator.type = 'square';
                    oscillator.frequency.value = 440; // A4
                    gainNode.gain.value = 0.3;
                    
                    // Short ping duration
                    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
                    
                    // Schedule stop
                    setTimeout(() => oscillator.stop(), 100);
                    break;
                    
                case 'wall':
                    // Wall hit - deeper thud
                    oscillator.type = 'sine';
                    oscillator.frequency.value = 330; // E4
                    gainNode.gain.value = 0.4;
                    
                    // Lower frequency sound
                    gainNode.gain.setValueAtTime(0.4, ctx.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
                    
                    // Schedule stop
                    setTimeout(() => oscillator.stop(), 200);
                    break;
                    
                case 'score':
                    // Score sound - rising celebratory tone
                    oscillator.type = 'sawtooth';
                    oscillator.frequency.value = 587.33; // D5
                    gainNode.gain.value = 0.2;
                    
                    // Rising celebratory sound
                    oscillator.frequency.setValueAtTime(440, ctx.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3);
                    gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
                    
                    // Schedule stop
                    setTimeout(() => oscillator.stop(), 500);
                    break;
                    
                default:
                    console.warn(`Unknown sound type: ${soundType}`);
                    return false;
            }
            
            // Connect and play
            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);
            oscillator.start();
            
            console.log(`Playing ${soundType} sound with oscillator`);
            return true;
        } catch (error) {
            console.error(`Error playing ${soundType} sound:`, error);
            return false;
        }
    }
    
    /**
     * Toggle audio on/off
     * @param {boolean} [state] Optional explicit state, otherwise toggles
     * @returns {boolean} New state
     */
    toggle(state) {
        if (typeof state === 'boolean') {
            this.enabled = state;
        } else {
            this.enabled = !this.enabled;
        }
        
        console.log(`Audio ${this.enabled ? 'enabled' : 'disabled'}`);
        return this.enabled;
    }
}

// Export a singleton instance
export const audioManager = new OscillatorAudioManager(); 