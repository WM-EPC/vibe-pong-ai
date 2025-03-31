/**
 * Vibe Pong - Production Audio System
 * Simple, reliable audio using Web Audio API oscillators
 */

// Create an audio manager that will work reliably on all platforms
class AudioSystem {
    constructor() {
        this.enabled = true;
        this.initialized = false;
        this.context = null;
        
        // Bind methods
        this.init = this.init.bind(this);
        this.playSound = this.playSound.bind(this);
        this.toggle = this.toggle.bind(this);
    }
    
    // Initialize audio system
    init() {
        if (this.initialized) return true;
        
        try {
            // Create context on demand to avoid autoplay restrictions
            this.initialized = true;
            console.log('Audio system initialized');
            return true;
        } catch (error) {
            console.error('Error initializing audio:', error);
            return false;
        }
    }
    
    // Get or create audio context
    getContext() {
        if (!this.context) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) {
                console.error('Web Audio API not supported');
                return null;
            }
            
            this.context = new AudioContext();
            
            // iOS/Safari requires user interaction to start audio
            if (this.context.state === 'suspended') {
                const resumeAudio = () => {
                    if (this.context.state === 'suspended') {
                        this.context.resume().then(() => {
                            console.log('AudioContext resumed');
                        }).catch(err => {
                            console.error('Failed to resume audio context:', err);
                        });
                    }
                };
                
                // Add event listeners for user interaction
                document.addEventListener('touchstart', resumeAudio, {once: true});
                document.addEventListener('mousedown', resumeAudio, {once: true});
                document.addEventListener('keydown', resumeAudio, {once: true});
            }
        }
        
        return this.context;
    }
    
    // Play a sound effect
    playSound(type) {
        if (!this.enabled || !this.initialized) {
            return false;
        }
        
        const ctx = this.getContext();
        if (!ctx) return false;
        
        try {
            // Create audio nodes
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();
            
            // Configure sound based on type
            switch (type) {
                case 'bounce':
                    // Paddle hit - higher pitched ping
                    oscillator.type = 'square';
                    oscillator.frequency.value = 440; // A4
                    gainNode.gain.value = 0.2;
                    
                    // Short duration with fade-out
                    gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
                    
                    // Schedule stop
                    setTimeout(() => oscillator.stop(), 100);
                    break;
                    
                case 'wall':
                    // Wall hit - lower thud
                    oscillator.type = 'sine';
                    oscillator.frequency.value = 330; // E4
                    gainNode.gain.value = 0.3;
                    
                    // Slightly longer duration
                    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
                    
                    // Schedule stop
                    setTimeout(() => oscillator.stop(), 200);
                    break;
                    
                case 'score':
                    // Score - celebratory rising tone
                    oscillator.type = 'sawtooth';
                    oscillator.frequency.value = 440; // A4
                    gainNode.gain.value = 0.15;
                    
                    // Rising pitch effect
                    oscillator.frequency.setValueAtTime(440, ctx.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3);
                    
                    // Fade out
                    gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
                    
                    // Schedule stop
                    setTimeout(() => oscillator.stop(), 500);
                    break;
                    
                default:
                    console.warn('Unknown sound type:', type);
                    return false;
            }
            
            // Connect and play
            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);
            oscillator.start();
            
            return true;
        } catch (error) {
            console.error('Error playing sound:', error);
            return false;
        }
    }
    
    // Toggle audio on/off
    toggle(state) {
        if (typeof state === 'boolean') {
            this.enabled = state;
        } else {
            this.enabled = !this.enabled;
        }
        
        return this.enabled;
    }
}

// Export a single instance
export const audioSystem = new AudioSystem(); 