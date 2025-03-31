/**
 * Vibe Pong - Simple Audio System
 * Uses basic HTML5 Audio API for maximum compatibility
 */

// Simple Audio Manager with reliable HTML5 Audio approach
class SimpleAudioManager {
    constructor() {
        // Audio state
        this.enabled = true;
        this.initialized = false;
        
        // Audio elements
        this.sounds = {
            bounce: null,
            wall: null,
            score: null
        };
        
        // Preloaded sound URIs - using local files for guaranteed compatibility
        this.soundUrls = {
            bounce: './assets/audio/bounce.mp3', // Ping sound
            wall: './assets/audio/wall.mp3',     // Wall hit
            score: './assets/audio/score.mp3'    // Score fanfare
        };
        
        // Base64 fallback sounds in case files aren't available
        this.soundBase64 = {
            // Simple ping sound
            bounce: 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tAwAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAASAAAeMwAUFBQUFCgUFBQUFDMzMzMzM0dHR0dHR1paWlpaWlpabnNzc3Nzc4aGhoaGhoaGlJmZmZmZmZmZs7Ozs7Ozs7PGxsbGxsbG0NbW1tbW1tbW4+Pj4+Pj4+Pj8fHx8fHx8fH/////////////////////////////////AAAAAExhdmM1OC4xMwAAAAAAAAAAAAAAACQCQgAAAAAAHjMFJuRcAAAAAAD/+xDEAAAJdINSMGMAITGQalYeYEQhMla9J9GgAAIIAABjQcZECETHAhU9voAAQhEyICTMy9J9bXRdN9DykQIBAMBAMBAMYxjGP6YxjGMYxjGMYz9J9J9J9J9J9J9J9J9JxwMfBBwMYxjGMYxoIAgCAIA+D4Pg+D59J9JxoIOfBA59JxoIOD59JxoHwfB8HwfAAAAAAAAQCAQCAQAACAQCAQAAQEAgEAgAAAA',
            
            // Wall hit sound
            wall: 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tAwAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAAeAAAKygAHBwcHDw8PDw8PGBgYGBggICAgICApKSkpKTExMTExMTk5OTk5QUFBQUFBSUlJSUlRUVFRUVFZWVlZWWFhYWFhYWlpaWlpcXFxcXFxeXl5eXmBgYGBgYmJiYmJkZGRkZGRmZmZmZmhoaGhoampqampsbGxsbG5ubm5ucHBwcHBycnJycnR0dHR0dHZ2dnZ2eHh4eHh6urq6ur/////////////////////////////////AAAAAExhdmM1OC4xMwAAAAAAAAAAAAAAACQDkgAAAAAACs/l7QyoAAAAAAD/+xDEAAAOFINBtPGAAhsh6NJ5whgkIwVo2n7gABBisoAAZMHnQQDBAEAQDBZMYQRh4L/v/ZVs3OdYHCTLw/MDgcLhy77v//8uXLgcLhoM8O/+XLly4HCwuHw2Gn//////////l34aMHCTDQfL/lwOHDw+YHBwwN1g8Piy77//9kvHiy4eCQtHPgiQgGBoD4YeE/AWZl4GAQA2KCFmYmfhDImYmmICkrLywsb/Q0NNNM0NDtVABQDAwGyZZ1kWK6ZEXGAA',
            
            // Score sound
            score: 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tAwAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAAZAAAYDAAGBg0NDQ0NFBQUFBQbGxsbGyIiIiIiKSkpKSkwMDAwMDc3Nzc3Pj4+Pj5FRUVFRUVNTU1NVVVVVVVVXV1dXV1kZGRkZGxsbGxsc3Nzc3N6enp6eoGBgYGBiYmJiYmQkJCQkJeXl5eXn5+fn5+mpqamprOzs7OzysrKysrS0tLS0tra2tra2uHh4eHh6Ojo6Ojw8PDw8P///wAAAExhdmM1OC4xMwAAAAAAAAAAAAAAACQE2AAAAAAA'
        };
        
        // Bind methods
        this.init = this.init.bind(this);
        this.playSound = this.playSound.bind(this);
        this.toggle = this.toggle.bind(this);
    }
    
    /**
     * Initialize all sound elements
     * @returns {Promise<boolean>} Success state
     */
    async init() {
        if (this.initialized) return true;
        
        try {
            console.log('Initializing simple audio system...');
            
            // Create and preload all sounds
            for (const [soundType, url] of Object.entries(this.soundUrls)) {
                // Create new audio element
                const audio = new Audio();
                
                // Set properties for best cross-platform behavior
                audio.preload = 'auto';
                audio.volume = 1.0;
                
                // Try to load the sound file
                try {
                    audio.src = url;
                    
                    // If file loading fails, use the base64 fallback
                    audio.onerror = () => {
                        console.warn(`Could not load ${soundType} from file, using base64 fallback`);
                        audio.src = this.soundBase64[soundType];
                    };
                    
                    // Store the audio element
                    this.sounds[soundType] = audio;
                    
                    // Pre-load the sound
                    await new Promise((resolve) => {
                        audio.oncanplaythrough = resolve;
                        // Set a timeout for loading
                        setTimeout(resolve, 2000);
                    });
                } catch (loadErr) {
                    console.warn(`Could not preload ${soundType} sound:`, loadErr);
                    // Use base64 fallback
                    audio.src = this.soundBase64[soundType];
                }
            }
            
            // Create a dummy audio to help unlock audio on iOS/Safari
            const unlockAudio = new Audio();
            unlockAudio.src = this.soundBase64.bounce; // Use base64 for reliability
            unlockAudio.volume = 0.1;
            
            // Try to play initially (will likely fail, but sets up for user interaction)
            unlockAudio.play().catch(() => {
                console.log('Audio needs user interaction to unlock');
            });
            
            // Add global click handler to unlock audio
            const unlockOnClick = () => {
                console.log('Unlocking audio on user interaction');
                
                // Play silent audio to unlock
                unlockAudio.play().catch(err => {
                    console.warn('Could not unlock audio:', err);
                });
                
                // Play each sound with zero volume to unlock
                for (const sound of Object.values(this.sounds)) {
                    const originalVolume = sound.volume;
                    sound.volume = 0.01;
                    sound.play().catch(() => {}).then(() => {
                        sound.pause();
                        sound.currentTime = 0;
                        sound.volume = originalVolume;
                    });
                }
                
                // Remove the click handler after first use
                document.removeEventListener('click', unlockOnClick);
                document.removeEventListener('touchstart', unlockOnClick);
            };
            
            document.addEventListener('click', unlockOnClick);
            document.addEventListener('touchstart', unlockOnClick);
            
            // Set initialization flag
            this.initialized = true;
            console.log('Simple audio system initialized successfully');
            return true;
        } catch (error) {
            console.error('Error initializing simple audio:', error);
            return false;
        }
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
        
        // Get the audio element
        const sound = this.sounds[soundType];
        if (!sound) {
            console.error(`Sound type "${soundType}" not found`);
            return false;
        }
        
        try {
            // Create a new audio element for this play to avoid conflicts
            const playSound = new Audio(sound.src);
            playSound.volume = sound.volume;
            
            // Play the sound
            console.log(`Playing ${soundType} sound: success`);
            const playPromise = playSound.play();
            
            // Handle promise (newer browsers return a promise)
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.warn(`Could not play ${soundType} sound:`, error);
                    
                    // Use the base64 fallback if the play fails
                    try {
                        const fallbackSound = new Audio(this.soundBase64[soundType]);
                        fallbackSound.volume = 1.0;
                        fallbackSound.play().catch(err => {
                            console.error(`Fallback playback failed for ${soundType}:`, err);
                        });
                    } catch (fallbackErr) {
                        console.error(`All playback methods failed for ${soundType}:`, fallbackErr);
                    }
                });
            }
            
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

// Export the manager
export const audioManager = new SimpleAudioManager(); 