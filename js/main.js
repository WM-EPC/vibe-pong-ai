import * as THREE from 'three';

// Using ES modules import through the importmap in the HTML
// This allows us to use the latest Three.js version without bundling

// Global audio unlocking mechanism for iOS and other platforms
let audioCtx;
let audioUnlocked = false;

// Add an interval reference for continuous audio checking
let audioContextCheckInterval = null;

// Store decoded audio buffers for reuse
let decodedBuffers = {
    bounce: null,
    wall: null,
    score: null
};

// Base64-encoded audio data for sounds - replace with actual sounds
const soundData = {
    // Short ping sound for bounce - cleaner version
    bounce: "data:audio/wav;base64,UklGRsgBAABXQVZFZm10IBAAAAABAAEARKwAAESsAAABAAgAZGF0YaQBAACAgICAgICAgICAgIB4eIB/f3+AgYGBgYGBgICAgICAgHZ2gICAgH9/f39+foCAgICAgICAgICAgICAfX2AgICAgH9/f39/f4CAgICAgICAd3eAgH9/f39/f4CAgICAgICAgICAgICAeXl/f4GBf39/f4CAgICAgICAgHx8f39/f39/f4GBgICAgICA//+AgH19gICAgH9/f39/f4CAgICAgICAgICAgICAeHiAf39/gIGBgYGBgYCAgICAgHZ2gICAgH9/f39+foCAgICAgICAgICAgICAeHiAgICAgH9/f39/f4CAgICAgICAeHiAgH9/f39/f4CAgICAgICAgICAgICAenp/f4CAf39/f4CAgICAgICAgHt7f39/f39/f4CAgICAgICAeHj//4CAfX2AgICAgICAgICAgICAgICAgICAgICAgICAfn6AgICAgICAf39/f39/f3+AgICAgIB/f4CAf39/f4CAgICAgICAgIB9fYCAgIB/f39/f3+AgICAgICAAABAQJE5NCoAAAATSURBVFNwEEFQA0YySEsADwxBBAkiG0ZwZQ==",
    // Complementary mid-range sound for wall hit
    wall: "data:audio/wav;base64,UklGRqgBAABXQVZFZm10IBAAAAABAAEARKwAAESsAAABAAgAZGF0YYQBAACBgYGBgYGBgYGAf3t9fYCAgICAgICAgYGBgYCAfX19fYCAgICAgICAgYGBgX9+fn5+gICAgICAgICAgICAfn5+foCAgICAgICAgICAf39/f3+AgICAgICAgICAf4CAgICAgICAgH99fX19gICAgICAgICBgYGBgIB9fX19gICAgICAgICBgYGBf35+fn6AgICAgICAgICAgIB+fn5+gICAgICAgICAgIB/f39/f4CAgICAgICAgICAgICAgICAgIB/fX19fYCAgICAgICAgYGBgYCAe35+gICAgICAgICAgYGBgX9+fn5+gICAgICAgICAgICAf39/f3+AgICAgICAgICAgH9/f39/gICAgICAgICAgIB/f39/f4CAgICAgICAgICAf35/gICAAABAQEE5NCoAAAATSURBVAsCAxgABggHEAgBBwkFCQYAYk79",
    // Distinctive victory sound for scoring
    score: "data:audio/wav;base64,UklGRiwDAABXQVZFZm10IBAAAAABAAEARKwAAESsAAABAAgAZGF0YQgDAACBgYGBgYGCgoKCgoKCgoKCg4ODgoKCgYGBgYGBgYGBgYCBgYCAgICAgICAgICAgICAgICBgYGBgYGBgYGBgYGBgYGBgYGBgoKCgoKDg4ODgoKCgoKCgYGBgICAgICAgH9/gICAf39/f39/f39/f39/f3+AgICAgICAgICAgICAgICAgICAgIGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYCAgICAgICAgICAgICAfn5+fn5+fn5+fn5+fn5+fn5+f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f3+AgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGBgYGBgYGBgYGBgYGBgYGBgYCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgIGBgICAf39/f39/f39/f39/f39/f4CAgICAgICAgICAgICAgICAgIGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYCAgICAgICAgICAgIGBgYGBgYGBgYGBgIGBgICAgICAgICAgICAf39/f39/f39/f39/f39/f39/f39/f39/f4CAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGAAAC/4QzH6SIAAAAASUVORK5CYII="
};

// Function to play a sound from a decoded buffer using Web Audio API
function playSoundFromBuffer(soundType) {
    if (!audioCtx || !audioUnlocked) return false;
    
    try {
        // Create a new audio source for this play
        const source = audioCtx.createBufferSource();
        
        // If we have a decoded buffer, use it
        if (decodedBuffers[soundType]) {
            source.buffer = decodedBuffers[soundType];
            source.connect(audioCtx.destination);
            source.start(0);
            console.log(`Playing ${soundType} sound from buffer`);
            return true;
        }
        
        // If we don't have the buffer yet, try to decode it
        if (soundData[soundType]) {
            // Extract the base64 data from the data URL
            let base64String = soundData[soundType].split(',')[1];
            if (!base64String) {
                console.error("Invalid sound data format for", soundType);
                return false;
            }
            
            try {
                // Convert base64 to array buffer
                const binaryString = window.atob(base64String);
                const len = binaryString.length;
                const bytes = new Uint8Array(len);
                for (let i = 0; i < len; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }
                
                // Decode the audio data
                audioCtx.decodeAudioData(
                    bytes.buffer,
                    (decodedBuffer) => {
                        // Store the decoded buffer for future use
                        decodedBuffers[soundType] = decodedBuffer;
                        console.log(`Decoded buffer for ${soundType}`);
                        
                        // Create and play the source
                        const newSource = audioCtx.createBufferSource();
                        newSource.buffer = decodedBuffer;
                        newSource.connect(audioCtx.destination);
                        newSource.start(0);
                        console.log(`Playing ${soundType} sound after decoding`);
                    },
                    (error) => {
                        console.error("Error decoding audio data for", soundType, error);
                        // Fall back to script-based sound if available
                        if (window[`create${soundType.charAt(0).toUpperCase() + soundType.slice(1)}Sound`]) {
                            window[`create${soundType.charAt(0).toUpperCase() + soundType.slice(1)}Sound`]();
                        }
                    }
                );
                
                return true;
            } catch (e) {
                console.error("Error processing audio data:", e);
                // Fall back to script-based sound
                if (window[`create${soundType.charAt(0).toUpperCase() + soundType.slice(1)}Sound`]) {
                    window[`create${soundType.charAt(0).toUpperCase() + soundType.slice(1)}Sound`]();
                    return true;
                }
                return false;
            }
        }
        
        return false;
    } catch (e) {
        console.error("Error playing sound buffer:", e);
        return false;
    }
}

// Improved function to unlock audio on user interaction
function unlockAudio() {
    if (audioUnlocked) return;
    
    try {
        console.log("Attempting audio unlock");
        
        // Create audio context
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        
        // iOS requires audio to start from a user interaction
        // Create and play a silent buffer
        const buffer = audioCtx.createBuffer(1, 1, 22050);
        const source = audioCtx.createBufferSource();
        source.buffer = buffer;
        source.connect(audioCtx.destination);
        
        // Play the empty buffer (required for iOS)
        source.start(0);
        
        // Pre-decode all sound buffers
        for (const soundType in soundData) {
            // We'll decode these in the background to have them ready
            try {
                // Extract the base64 data
                let base64String = soundData[soundType].split(',')[1];
                if (!base64String) continue;
                
                // Convert base64 to array buffer
                const binaryString = window.atob(base64String);
                const len = binaryString.length;
                const bytes = new Uint8Array(len);
                for (let i = 0; i < len; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }
                
                // Decode asynchronously
                audioCtx.decodeAudioData(
                    bytes.buffer,
                    (decodedBuffer) => {
                        decodedBuffers[soundType] = decodedBuffer;
                        console.log(`Decoded buffer for ${soundType}`);
                    },
                    (error) => {
                        console.error(`Error decoding ${soundType} buffer:`, error);
                    }
                );
            } catch (e) {
                console.error(`Error pre-decoding ${soundType}:`, e);
            }
        }
        
        // Set audio as unlocked
        audioUnlocked = true;
        console.log("Audio context and buffers initialized - unlock attempt complete");
        
        // Start the interval to periodically check audio context state
        startAudioContextCheck();
    } catch (e) {
        console.error("Error unlocking audio:", e);
    }
}

// Function to continuously check and resume AudioContext
function startAudioContextCheck() {
    // Clear any existing interval
    if (audioContextCheckInterval) {
        clearInterval(audioContextCheckInterval);
    }
    
    // Detect iOS for more aggressive checking
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    
    // Create a new interval that checks and resumes the audio context
    audioContextCheckInterval = setInterval(() => {
        if (audioCtx) {
            // Check if context is suspended and try to resume it
            if (audioCtx.state === 'suspended') {
                console.log("AudioContext suspended, attempting to resume");
                audioCtx.resume().then(() => {
                    console.log("AudioContext resumed successfully");
                    
                    // On iOS, play a silent buffer to keep things active
                    if (isIOS) {
                        try {
                            const silentBuffer = audioCtx.createBuffer(1, 1, 22050);
                            const silentSource = audioCtx.createBufferSource();
                            silentSource.buffer = silentBuffer;
                            silentSource.connect(audioCtx.destination);
                            silentSource.start(0);
                        } catch (e) {
                            // Ignore errors here
                        }
                    }
                }).catch(err => {
                    console.warn("Failed to resume AudioContext:", err);
                });
            }
            
            // Even when in running state, iOS might need periodic stimulation
            if (isIOS && audioCtx.state === 'running' && Math.random() < 0.3) {
                // Randomly (30% chance) play a silent buffer even when running
                // This helps maintain iOS audio system activity
                try {
                    const silentBuffer = audioCtx.createBuffer(1, 1, 22050);
                    const silentSource = audioCtx.createBufferSource();
                    silentSource.buffer = silentBuffer;
                    silentSource.connect(audioCtx.destination);
                    silentSource.start(0);
                } catch (e) {
                    // Ignore errors here
                }
            }
        } else if (!audioUnlocked) {
            // If we don't have a context yet, try to create one
            console.log("No AudioContext exists, attempting to create one");
            unlockAudio();
        }
    }, isIOS ? 500 : 1000); // Check more frequently on iOS
}

// Enhanced shutdown and cleanup for the interval
function cleanupAudioSystem() {
    if (audioContextCheckInterval) {
        clearInterval(audioContextCheckInterval);
        audioContextCheckInterval = null;
    }
    
    // Clean up audio context if it exists
    if (audioCtx && typeof audioCtx.close === 'function') {
        try {
            audioCtx.close().then(() => {
                console.log("AudioContext closed successfully");
            }).catch(err => {
                console.warn("Error closing AudioContext:", err);
            });
        } catch (e) {
            console.warn("Error during AudioContext cleanup:", e);
        }
    }
    
    // Clear any decoded buffers
    for (const key in decodedBuffers) {
        decodedBuffers[key] = null;
    }
    
    // Reset the unlocked state
    audioUnlocked = false;
    audioCtx = null;
}

// Add this to the window unload event
window.addEventListener('beforeunload', cleanupAudioSystem);

// Add a comprehensive set of event listeners to unlock audio
function setupAudioUnlocking() {
    // Common user interaction events that can unlock audio
    const unlockEvents = [
        'touchstart', 'touchend', 'mousedown', 'keydown',
        'click', 'pointerdown', 'pointerup'
    ];
    
    // Helper to clean up listeners once unlocked
    const handleUnlock = () => {
        unlockAudio();
        
        // Remove all listeners once unlocked to avoid duplicate calls
        if (audioUnlocked) {
            unlockEvents.forEach(eventType => {
                document.removeEventListener(eventType, handleUnlock, true);
                document.body.removeEventListener(eventType, handleUnlock, true);
            });
            console.log("Audio unlock successful - event listeners removed");
        }
    };
    
    // Add all listeners with capture to ensure they fire
    unlockEvents.forEach(eventType => {
        document.addEventListener(eventType, handleUnlock, true);
        document.body.addEventListener(eventType, handleUnlock, true);
    });
}

// Set up listeners immediately
setupAudioUnlocking();

// Constants
const GAME_CONFIG = {
    FIELD: {
        WIDTH: 20,
        HEIGHT: 12,
        DEPTH: 1
    },
    PADDLE: {
        WIDTH: 0.3,
        HEIGHT: 2,
        DEPTH: 0.3,
        SPEED: 0.15
    },
    BALL: {
        RADIUS: 0.5,
        INITIAL_SPEED: 0.12,
        MAX_TRAIL_LENGTH: 15,  // Increased from 10 for longer trail
        TRAIL_OPACITY_STEP: 0.07  // How much to reduce opacity per trail segment
    },
    COLORS: {
        NEON_PINK: new THREE.Color(1, 0.08, 0.58),
        NEON_BLUE: new THREE.Color(0, 0.76, 1),
        NEON_YELLOW: new THREE.Color(1, 0.92, 0),
        BACKGROUND: new THREE.Color(0.01, 0.01, 0.03),
        GRID: new THREE.Color(0.2, 0.2, 0.6)
    },
    VIEW_MODES: {
        THIRD_PERSON: 'THIRD_PERSON',
        FIRST_PERSON: 'FIRST_PERSON'
    }
};

// Game Class
class PongGame {
    constructor() {
        // Audio
        this.sounds = {
            bounce: null,
            score: null,
            wall: null
        };
        this.soundEnabled = true;
        
        // DOM elements
        this.elements = {
            info: null,
            startScreen: null,
            debug: null
        };
        
        // Game state
        this.gameStarted = false;
        this.score = {
            player: 0,
            ai: 0
        };
        this.ballVelocity = new THREE.Vector3(0, 0, 0);
        this.keysPressed = {};
        this.scoringCooldown = false;
        
        // Mobile touch controls
        this.touchMoveStrength = undefined;
        
        // Three.js setup
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.objects = {
            playerPaddle: null,
            aiPaddle: null,
            ball: null,
            fieldBoundary: null
        };
        this.ballTrail = [];
        
        // View mode state
        this.currentViewMode = GAME_CONFIG.VIEW_MODES.THIRD_PERSON;
        
        // Bind methods to maintain 'this' context
        this.init = this.init.bind(this);
        this.animate = this.animate.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        this.onWindowResize = this.onWindowResize.bind(this);
        this.destroy = this.destroy.bind(this);
        
        // Expose game instance globally for sound toggle
        window.game = this;
        
        // Listen for page visibility changes to handle audio resumption
        document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    }
    
    // Initialize the game
    init() {
        try {
            // Get DOM elements
            this.elements.info = document.getElementById('info');
            this.elements.startScreen = document.getElementById('startScreen');
            this.elements.debug = document.getElementById('debug');
            
            this.debug("Initializing game...");
            
            // Add event listener to start button
            const startButton = document.getElementById('startButton');
            if (startButton) {
                startButton.addEventListener('click', () => {
                    this.debug("Play button clicked");
                    this.startGame();
                });
            }
            
            // Initialize sound state (using the new approach)
            // The sound state is now controlled by the external toggle
            this.soundEnabled = true;
            
            // Setup touch controls
            this.setupTouchControls();
    
            // Scene setup
            this.scene = new THREE.Scene();
            this.scene.background = GAME_CONFIG.COLORS.BACKGROUND;
            
            // Camera setup
            this.camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 1000);
            this.camera.position.set(0, 8, 20);
            this.camera.lookAt(0, 0, 0);
    
            // Renderer setup
            this.renderer = new THREE.WebGLRenderer({ antialias: true });
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            document.body.appendChild(this.renderer.domElement);

            // Basic setup 
            this.setupBasicScene();
            
            // Load sounds
            this.setupSounds();
            
            // Event listeners
            window.addEventListener('resize', this.onWindowResize);
            window.addEventListener('keydown', this.handleKeyDown);
            window.addEventListener('keyup', this.handleKeyUp);
    
            // Initialize score display
            this.updateScoreDisplay();
    
            // Start animation loop
            this.animate();
            
            this.debug("Scene setup complete");
        } catch (error) {
            this.debug("ERROR in init: " + error.message);
            console.error(error);
        }
    }
    
    // Helper function for debugging
    debug(message) {
        console.log(message);
        if (this.elements.debug) {
            let currentText = this.elements.debug.textContent;
            if (currentText.split('\n').length > 5) {
                currentText = currentText.split('\n').slice(1).join('\n');
            }
            this.elements.debug.textContent = currentText + '\n' + message;
        }
    }

    // Setup audio with a simple audio pool for better performance
    setupSounds() {
        try {
            // Create an audio system that works better across devices including iOS
            this.soundEnabled = true;
            
            // Check if running on iOS
            this.isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
            this.debug("Device detection - iOS: " + this.isIOS);
            
            // Ensure audio is unlocked right away if possible
            if (!audioUnlocked) {
                unlockAudio();
            }
            
            // Define sound playback functions that use our enhanced buffer-based system first,
            // but fall back to script-based sounds if available
            this.playSoundFunction = {
                bounce: () => {
                    this.ensureAudioContext();
                    
                    // Try to play using buffer first (most reliable)
                    if (playSoundFromBuffer('bounce')) {
                        return true;
                    }
                    
                    // Fall back to script-based sound if available
                    if (window.createBounceSound) {
                        try {
                            window.createBounceSound();
                            return true;
                        } catch (e) {
                            console.error("Bounce sound error:", e);
                            return false;
                        }
                    }
                    
                    return false;
                },
                wall: () => {
                    this.ensureAudioContext();
                    
                    // Try to play using buffer first (most reliable)
                    if (playSoundFromBuffer('wall')) {
                        return true;
                    }
                    
                    // Fall back to script-based sound if available
                    if (window.createWallSound) {
                        try {
                            window.createWallSound();
                            return true;
                        } catch (e) {
                            console.error("Wall sound error:", e);
                            return false;
                        }
                    }
                    
                    return false;
                },
                score: () => {
                    this.ensureAudioContext();
                    
                    // Try to play using buffer first (most reliable)
                    if (playSoundFromBuffer('score')) {
                        return true;
                    }
                    
                    // Fall back to script-based sound if available
                    if (window.createScoreSound) {
                        try {
                            window.createScoreSound();
                            return true;
                        } catch (e) {
                            console.error("Score sound error:", e);
                            return false;
                        }
                    }
                    
                    return false;
                }
            };
            
            // Check if sounds will be available
            this.audioReady = audioUnlocked;
            
            // Set up periodic check to keep audio system alive
            this.setupPeriodicAudioCheck();
        } catch (error) {
            this.debug("WARNING: Could not initialize sounds: " + error.message);
        }
    }
    
    // Legacy method kept for compatibility - now uses our buffer-based system
    playFallbackSound(type) {
        if (playSoundFromBuffer(type)) {
            return true;
        }
        return false;
    }
    
    // Ensure the audio context is active before playing sounds
    ensureAudioContext() {
        // If we don't have a context or it's suspended, retry unlocking
        if (!audioCtx || audioCtx.state === 'suspended') {
            unlockAudio();
            return false;
        } else if (audioCtx.state === 'running') {
            // All good, context is running
            return true;
        }
        
        return false;
    }
    
    // Set up a periodic check specific to this game instance
    setupPeriodicAudioCheck() {
        // Set up an interval to periodically check if sounds work
        this.audioCheckInterval = setInterval(() => {
            if (this.soundEnabled) {
                // Ensure audio context is active
                this.ensureAudioContext();
                
                // On iOS, we'll create a silent buffer sound every 20 seconds
                // to keep the audio system alive
                if (this.isIOS && audioCtx && audioCtx.state === 'running') {
                    // Create a silent buffer and play it
                    const silentBuffer = audioCtx.createBuffer(1, 1, 22050);
                    const silentSource = audioCtx.createBufferSource();
                    silentSource.buffer = silentBuffer;
                    silentSource.connect(audioCtx.destination);
                    
                    try {
                        silentSource.start(0);
                    } catch(e) {
                        console.warn("Silent sound failed:", e);
                    }
                }
            }
        }, 20000); // Check every 20 seconds
    }
    
    // Clean up method to be called when game is destroyed
    cleanup() {
        // Clear our audio check interval
        if (this.audioCheckInterval) {
            clearInterval(this.audioCheckInterval);
            this.audioCheckInterval = null;
        }
    }

    // Play sound
    playSound(soundType) {
        // Don't try to play sounds if they're disabled
        if (!this.soundEnabled) return;
        
        // Always ensure audio context is ready
        this.ensureAudioContext();
        
        // First, try to play directly from buffer (most reliable, especially on iOS)
        if (playSoundFromBuffer(soundType)) {
            return;
        }
        
        // If buffer playback failed, try the sound function
        try {
            const soundFunc = this.playSoundFunction[soundType];
            if (soundFunc) {
                soundFunc();
            }
        } catch (error) {
            console.error("Sound playback error:", error);
        }
    }

    // Play a test sound for initialization
    playInitialSound() {
        this.debug("Playing initial sound");
        
        // Make sure audio system is initialized
        this.ensureAudioContext();
        
        // Just try the bounce sound
        if (this.soundEnabled) {
            // For iOS, we need to use a timeout to allow the audio context to stabilize
            if (this.isIOS) {
                setTimeout(() => {
                    // Try buffer-based playback first (most reliable on iOS)
                    if (!playSoundFromBuffer('bounce')) {
                        // Fall back to regular playSound if buffer playback fails
                        this.playSound('bounce');
                    }
                }, 100);
            } else {
                // On desktop, just play the sound directly
                this.playSound('bounce');
            }
        }
    }

    // Setup touch controls for mobile devices
    setupTouchControls() {
        // Early return if touch is not supported
        if (!('ontouchstart' in window)) return;
        
        this.debug("Setting up touch controls for mobile");
        
        // Track touch position and movement
        let touchY = 0;
        let lastTouchY = 0;
        let touchMoving = false;
        let touchMoveTimeout = null;
        
        const gameArea = document.body;
        
        // Touch event handlers
        gameArea.addEventListener('touchstart', (event) => {
            event.preventDefault();
            touchY = event.touches[0].clientY;
            lastTouchY = touchY;
            touchMoving = false;
            
            // Start game on touch if not started
            if (!this.gameStarted) {
                this.startGame();
            }
        });
        
        gameArea.addEventListener('touchmove', (event) => {
            event.preventDefault();
            
            // Get the current touch position
            const currentTouchY = event.touches[0].clientY;
            
            // Reset any existing timeout
            if (touchMoveTimeout) {
                clearTimeout(touchMoveTimeout);
            }
            
            // Calculate movement delta from the last frame
            const deltaY = currentTouchY - lastTouchY;
            touchMoving = true;
            
            // Determine direction based on delta
            if (deltaY < 0) {
                // Moving up - simplified response
                this.keysPressed['touchUp'] = true;
                this.keysPressed['touchDown'] = false;
                
                // Set strength proportional to speed of movement
                const speed = Math.min(1.5, Math.abs(deltaY) / 5);
                this.touchMoveStrength = speed;
            } else if (deltaY > 0) {
                // Moving down - simplified response
                this.keysPressed['touchUp'] = false;
                this.keysPressed['touchDown'] = true;
                
                // Set strength proportional to speed of movement
                const speed = Math.min(1.5, Math.abs(deltaY) / 5);
                this.touchMoveStrength = speed;
            }
            
            // Set a small timeout to detect when movement stops
            touchMoveTimeout = setTimeout(() => {
                if (touchMoving) {
                    // If no new touchmove events have fired, finger has stopped
                    this.keysPressed['touchUp'] = false;
                    this.keysPressed['touchDown'] = false;
                    touchMoving = false;
                }
            }, 16); // About one frame
            
            // Update last touch position
            lastTouchY = currentTouchY;
        });
        
        gameArea.addEventListener('touchend', (event) => {
            event.preventDefault();
            // Reset touch controls
            this.keysPressed['touchUp'] = false;
            this.keysPressed['touchDown'] = false;
            touchMoving = false;
            
            if (touchMoveTimeout) {
                clearTimeout(touchMoveTimeout);
                touchMoveTimeout = null;
            }
        });
    }
    
    // Setup the scene with all components
    setupBasicScene() {
        try {
            // Lights
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
            this.scene.add(ambientLight);

            const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
            directionalLight.position.set(10, 10, 10);
            this.scene.add(directionalLight);
            
            // Create game objects
            this.createField();
            this.createPaddles();
            this.createBall();
            
            this.debug("Basic scene set up successfully");
        } catch (error) {
            this.debug("ERROR in setupBasicScene: " + error.message);
            console.error(error);
        }
    }
    
    // Create a mesh with standard configuration
    createMesh(geometry, materialOptions, position, rotation = null) {
        const material = new THREE.MeshStandardMaterial(materialOptions);
        const mesh = new THREE.Mesh(geometry, material);
        
        if (position) {
            mesh.position.copy(position);
        }
        
        if (rotation) {
            mesh.rotation.copy(rotation);
        }
        
        return mesh;
    }
    
    // Create field and boundaries
    createField() {
        try {
            const {WIDTH, HEIGHT} = GAME_CONFIG.FIELD;
            
            // Enhanced Grid helper for the floor with more visibility - KEEP FOR OUTER AREA
            const gridHelper = new THREE.GridHelper(WIDTH * 2, 30, GAME_CONFIG.COLORS.GRID, GAME_CONFIG.COLORS.GRID);
            gridHelper.position.y = -HEIGHT / 2 - 0.01;
            // Add fog to grid with increased opacity
            const gridMaterial = gridHelper.material;
            gridMaterial.transparent = true;
            gridMaterial.opacity = 0.6; 
            this.scene.add(gridHelper);
            
            // Create floor with darker color and more metallic look
            const floor = this.createMesh(
                new THREE.PlaneGeometry(WIDTH, WIDTH),
                {
                    color: 0x000010,
                    metalness: 0.9,
                    roughness: 0.2,
                    emissive: 0x000010,
                    emissiveIntensity: 0.1
                },
                new THREE.Vector3(0, -HEIGHT / 2, 0),
                new THREE.Euler(-Math.PI / 2, 0, 0)
            );
            this.scene.add(floor);
            
            // Create animated DOTS for the central playing field instead of lines
            this.waveGridGroup = new THREE.Group();
            
            // Create a grid of points
            const gridSize = 15; // Number of points in each direction
            const positions = new Float32Array(gridSize * gridSize * 3);
            const dotSpacingX = WIDTH / gridSize;
            const dotSpacingZ = WIDTH / gridSize;
            
            // Fill the positions array with grid points
            let index = 0;
            for (let i = 0; i < gridSize; i++) {
                for (let j = 0; j < gridSize; j++) {
                    positions[index++] = -WIDTH/2 + j * dotSpacingX + dotSpacingX/2; // x
                    positions[index++] = 0;                                          // y
                    positions[index++] = -WIDTH/2 + i * dotSpacingZ + dotSpacingZ/2; // z
                }
            }
            
            // Create the dots geometry
            const dotsGeometry = new THREE.BufferGeometry();
            dotsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            
            // Create dots material with brighter blue
            const dotsMaterial = new THREE.PointsMaterial({
                color: new THREE.Color(0, 0.7, 0.9),
                size: 0.15,  // Smaller dots for more subtle effect
                transparent: true,
                opacity: 0.7,
                sizeAttenuation: true // Make dots size affected by distance
            });
            
            // Create the points mesh
            this.waveDots = new THREE.Points(dotsGeometry, dotsMaterial);
            this.waveDots.position.y = -HEIGHT / 2 + 0.02; // Just above the floor
            this.scene.add(this.waveDots);

            // Center line with enhanced glow
            const centerLine = this.createMesh(
                new THREE.BoxGeometry(0.1, HEIGHT, 0.1),
                { 
                    color: GAME_CONFIG.COLORS.NEON_BLUE,
                    transparent: true,
                    opacity: 0.9,
                    emissive: GAME_CONFIG.COLORS.NEON_BLUE,
                    emissiveIntensity: 1.5
                },
                new THREE.Vector3(0, 0, 0)
            );
            // Add glow effect to center line
            const centerGlow = new THREE.Mesh(
                new THREE.BoxGeometry(0.2, HEIGHT, 0.2),
                new THREE.MeshBasicMaterial({
                    color: GAME_CONFIG.COLORS.NEON_BLUE,
                    transparent: true,
                    opacity: 0.4
                })
            );
            centerLine.add(centerGlow);
            this.scene.add(centerLine);

            // Create enhanced border material
            const borderMaterial = new THREE.MeshStandardMaterial({ 
                color: GAME_CONFIG.COLORS.NEON_BLUE,
                transparent: true,
                opacity: 0.9,
                emissive: GAME_CONFIG.COLORS.NEON_BLUE,
                emissiveIntensity: 1.5
            });
            
            // Bottom border with glow
            const bottomBorder = new THREE.Mesh(
                new THREE.BoxGeometry(WIDTH, 0.1, 0.1),
                borderMaterial
            );
            bottomBorder.position.y = -HEIGHT / 2;
            const bottomGlow = new THREE.Mesh(
                new THREE.BoxGeometry(WIDTH, 0.2, 0.2),
                new THREE.MeshBasicMaterial({
                    color: GAME_CONFIG.COLORS.NEON_BLUE,
                    transparent: true,
                    opacity: 0.4
                })
            );
            bottomBorder.add(bottomGlow);
            this.scene.add(bottomBorder);
            
            // Top border with glow
            const topBorder = new THREE.Mesh(
                new THREE.BoxGeometry(WIDTH, 0.1, 0.1),
                borderMaterial
            );
            topBorder.position.y = HEIGHT / 2;
            const topGlow = new THREE.Mesh(
                new THREE.BoxGeometry(WIDTH, 0.2, 0.2),
                new THREE.MeshBasicMaterial({
                    color: GAME_CONFIG.COLORS.NEON_BLUE,
                    transparent: true,
                    opacity: 0.4
                })
            );
            topBorder.add(topGlow);
            this.scene.add(topBorder);
            
            // Enhanced field outline with stronger glow
            const points = [
                new THREE.Vector3(-WIDTH / 2, -HEIGHT / 2, 0),
                new THREE.Vector3(-WIDTH / 2, HEIGHT / 2, 0),
                new THREE.Vector3(WIDTH / 2, HEIGHT / 2, 0),
                new THREE.Vector3(WIDTH / 2, -HEIGHT / 2, 0),
                new THREE.Vector3(-WIDTH / 2, -HEIGHT / 2, 0)
            ];
            
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            this.objects.fieldBoundary = new THREE.Line(
                geometry, 
                new THREE.LineBasicMaterial({ 
                    color: GAME_CONFIG.COLORS.NEON_BLUE, 
                    linewidth: 3,
                    opacity: 0.9,
                    transparent: true
                })
            );
            this.scene.add(this.objects.fieldBoundary);
            
            this.debug("Field created with enhanced visuals");
        } catch (error) {
            this.debug("ERROR in createField: " + error.message);
            console.error(error);
        }
    }
    
    // Create the paddles
    createPaddles() {
        try {
            const {WIDTH, HEIGHT, DEPTH} = GAME_CONFIG.PADDLE;
            const {WIDTH: FIELD_WIDTH, HEIGHT: FIELD_HEIGHT} = GAME_CONFIG.FIELD;
            
            // Player paddle (left side)
            this.objects.playerPaddle = this.createPaddleMesh(
                GAME_CONFIG.COLORS.NEON_BLUE,
                new THREE.Vector3(-FIELD_WIDTH / 2 + 1, 0, 0)
            );
            this.scene.add(this.objects.playerPaddle);
            this.debug("Player paddle created");
            
            // AI paddle (right side)
            this.objects.aiPaddle = this.createPaddleMesh(
                GAME_CONFIG.COLORS.NEON_PINK,
                new THREE.Vector3(FIELD_WIDTH / 2 - 1, 0, 0)
            );
            this.scene.add(this.objects.aiPaddle);
            this.debug("AI paddle created");
        } catch (error) {
            this.debug("ERROR in createPaddles: " + error.message);
            console.error(error);
        }
    }
    
    // Helper method to create paddle with glow effect
    createPaddleMesh(color, position) {
        const {WIDTH, HEIGHT, DEPTH} = GAME_CONFIG.PADDLE;
        
        const paddleGeometry = new THREE.BoxGeometry(WIDTH, HEIGHT, DEPTH);
        const paddleMaterial = new THREE.MeshStandardMaterial({ 
            color: color,
            emissive: color,
            emissiveIntensity: 1.5,
            metalness: 0.5,
            roughness: 0.2
        });
        
        const paddle = new THREE.Mesh(paddleGeometry, paddleMaterial);
        paddle.position.copy(position);
        paddle.rotation.set(0, 0, 0);
        
        // Create a glow object as a child of the paddle
        const paddleGlow = new THREE.Mesh(
            new THREE.BoxGeometry(WIDTH + 0.1, HEIGHT + 0.1, DEPTH + 0.1),
            new THREE.MeshBasicMaterial({
                color: color,
                transparent: true,
                opacity: 0.5
            })
        );
        
        // Add glow as a child of the paddle so it moves with it
        paddle.add(paddleGlow);
        
        return paddle;
    }
    
    // Create the ball
    createBall() {
        try {
            const {RADIUS} = GAME_CONFIG.BALL;
            
            // Ball
            const ballGeometry = new THREE.SphereGeometry(RADIUS, 16, 16);
            const ballMaterial = new THREE.MeshStandardMaterial({ 
                color: GAME_CONFIG.COLORS.NEON_YELLOW,
                emissive: GAME_CONFIG.COLORS.NEON_YELLOW,
                emissiveIntensity: 1.5,
                metalness: 0.8,
                roughness: 0.2
            });
            
            this.objects.ball = new THREE.Mesh(ballGeometry, ballMaterial);
            this.objects.ball.position.set(0, 0, 0);
            
            // Add a glow to the ball as a child object
            const ballGlow = new THREE.Mesh(
                new THREE.SphereGeometry(RADIUS * 1.5, 16, 16),
                new THREE.MeshBasicMaterial({
                    color: GAME_CONFIG.COLORS.NEON_YELLOW,
                    transparent: true,
                    opacity: 0.4
                })
            );
            
            // Create trail group
            this.trailGroup = new THREE.Group();
            this.scene.add(this.trailGroup);
            
            // Store reference and add as child so it moves with the ball
            this.objects.ball.userData.glow = ballGlow;
            this.objects.ball.add(ballGlow);
            
            this.scene.add(this.objects.ball);
            this.debug("Ball created with glow effect and trail");
        } catch (error) {
            this.debug("ERROR in createBall: " + error.message);
            console.error(error);
        }
    }
    
    // Reset the ball to center position
    resetBall() {
        this.debug("Resetting ball");
        
        const {INITIAL_SPEED} = GAME_CONFIG.BALL;
        
        // Clear trail
        this.ballTrail = [];
        while(this.trailGroup && this.trailGroup.children.length > 0) {
            const mesh = this.trailGroup.children[0];
            mesh.geometry.dispose();
            mesh.material.dispose();
            this.trailGroup.remove(mesh);
        }
        
        // Ensure ball is at center position
        if (this.objects.ball) {
            this.objects.ball.position.set(0, 0, 0);
            
            // Random initial direction, but ensure some horizontal movement
            const randomAngle = (Math.random() * Math.PI / 2) - (Math.PI / 4); // -45 to 45 degrees
            const direction = Math.random() > 0.5 ? 1 : -1; // Left or right
            
            this.ballVelocity.x = Math.cos(randomAngle) * INITIAL_SPEED * direction;
            this.ballVelocity.y = Math.sin(randomAngle) * INITIAL_SPEED;
            
            // Make sure ball has significant horizontal movement
            if (Math.abs(this.ballVelocity.x) < 0.05) {
                this.ballVelocity.x = direction * 0.05;
            }
        } else {
            this.debug("ERROR: Ball reference is missing when trying to reset");
            // Create a new ball if it doesn't exist
            this.createBall();
        }
    }
    
    // Handle keyboard events
    handleKeyDown(event) {
        this.keysPressed[event.key] = true;
        
        // Game control keys
        switch (event.key) {
            case ' ':  // Spacebar
                if (!this.gameStarted) {
                    this.startGame();
                }
                break;
            case 'p':
            case 'P':
                this.togglePause();
                break;
            case 'v':
            case 'V':
                this.toggleViewMode();
                break;
            case '`':  // Backtick key to toggle debug panel
                if (this.elements.debug) {
                    this.elements.debug.classList.toggle('visible');
                }
                break;
        }
    }
    
    handleKeyUp(event) {
        this.keysPressed[event.key] = false;
    }
    
    // Toggle game pause state
    togglePause() {
        if (this.gameStarted) {
            this.gamePaused = !this.gamePaused;
            this.debug("Game " + (this.gamePaused ? "paused" : "resumed"));
            
            // Show pause indicator
            if (this.gamePaused) {
                // Create or show pause overlay
                if (!this.pauseOverlay) {
                    this.createPauseOverlay();
                } else {
                    this.pauseOverlay.style.display = 'flex';
                }
            } else {
                // Hide pause overlay
                if (this.pauseOverlay) {
                    this.pauseOverlay.style.display = 'none';
                }
            }
        }
    }
    
    // Create pause overlay
    createPauseOverlay() {
        this.pauseOverlay = document.createElement('div');
        this.pauseOverlay.style.position = 'absolute';
        this.pauseOverlay.style.top = '0';
        this.pauseOverlay.style.left = '0';
        this.pauseOverlay.style.width = '100%';
        this.pauseOverlay.style.height = '100%';
        this.pauseOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        this.pauseOverlay.style.color = 'white';
        this.pauseOverlay.style.fontSize = '32px';
        this.pauseOverlay.style.display = 'flex';
        this.pauseOverlay.style.alignItems = 'center';
        this.pauseOverlay.style.justifyContent = 'center';
        this.pauseOverlay.style.zIndex = '40';
        this.pauseOverlay.style.fontFamily = 'Orbitron, sans-serif';
        this.pauseOverlay.textContent = 'PAUSED';
        
        document.body.appendChild(this.pauseOverlay);
    }
    
    // Start the game
    startGame() {
        this.debug("Starting game");
        
        // Check if all required objects exist
        if (!this.scene || !this.camera || !this.renderer) {
            this.debug("ERROR: Core Three.js objects missing, reinitializing");
            this.init();
            return;
        }
        
        if (!this.objects.ball) {
            this.debug("Ball missing, creating a new one");
            this.createBall();
        }
        
        if (!this.objects.playerPaddle || !this.objects.aiPaddle) {
            this.debug("Paddles missing, creating new ones");
            this.createPaddles();
        }
        
        this.gameStarted = true;
        this.gamePaused = false;
        this.resetBall();
        this.score.player = 0;
        this.score.ai = 0;
        this.updateScoreDisplay();
        
        // Hide start screen
        if (this.elements.startScreen) {
            this.elements.startScreen.style.display = 'none';
        }

        // Create in-game sound toggle
        this.createInGameSoundToggle();

        // Initialize game sounds
        if (this.soundEnabled) {
            // On iOS, unlock audio if needed when enabling sound
            if (this.isIOS && !audioUnlocked) {
                this.debug("Attempting to unlock iOS audio from in-game toggle");
                unlockAudio();
            }
            
            this.playInitialSound();
        }
    }
    
    // Handle window resize
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    // Update paddle positions
    movePaddles() {
        if (!this.objects.playerPaddle || !this.objects.aiPaddle) return;
        
        const {HEIGHT: FIELD_HEIGHT} = GAME_CONFIG.FIELD;
        const {HEIGHT: PADDLE_HEIGHT, SPEED: PADDLE_SPEED} = GAME_CONFIG.PADDLE;
        
        // Default paddle speed
        let playerSpeed = PADDLE_SPEED;
        
        // Apply touch movement strength if available (for mobile)
        if (this.touchMoveStrength !== undefined && (this.keysPressed['touchUp'] || this.keysPressed['touchDown'])) {
            // Increase the base multiplier from 0.5 to 1.0 and max to 2.5 for faster movement
            playerSpeed = PADDLE_SPEED * (1.0 + this.touchMoveStrength);
        }
        
        // Player paddle movement
        if ((this.keysPressed['w'] || this.keysPressed['W'] || 
             this.keysPressed['ArrowUp'] || this.keysPressed['touchUp']) && 
            this.objects.playerPaddle.position.y < FIELD_HEIGHT/2 - PADDLE_HEIGHT/2) {
            this.objects.playerPaddle.position.y += playerSpeed;
        }
        
        if ((this.keysPressed['s'] || this.keysPressed['S'] || 
             this.keysPressed['ArrowDown'] || this.keysPressed['touchDown']) && 
            this.objects.playerPaddle.position.y > -FIELD_HEIGHT/2 + PADDLE_HEIGHT/2) {
            this.objects.playerPaddle.position.y -= playerSpeed;
        }
        
        // Reset touch movement strength for next frame
        if (this.touchMoveStrength !== undefined) {
            this.touchMoveStrength = undefined;
        }
        
        // AI paddle movement (simple AI with slight delay/imperfection)
        if (this.gameStarted && this.objects.ball) {
            // Calculate target position with some randomness
            const targetY = this.objects.ball.position.y;
            
            // Move toward ball but with limited speed and some delay
            const aiSpeed = PADDLE_SPEED * 0.7; // Make AI slightly slower than player
            
            // Smooth movement with lerp and a dead zone
            const distanceToTarget = targetY - this.objects.aiPaddle.position.y;
            const deadZone = 0.2; // Don't move if ball is very close to paddle's y position
            
            if (Math.abs(distanceToTarget) > deadZone) {
                // Move paddle smoothly toward target with a speed proportional to distance
                const direction = distanceToTarget > 0 ? 1 : -1;
                const moveAmount = Math.min(aiSpeed, Math.abs(distanceToTarget) * 0.1);
                
                // Check boundaries
                const newY = this.objects.aiPaddle.position.y + (moveAmount * direction);
                if (newY > -FIELD_HEIGHT/2 + PADDLE_HEIGHT/2 && 
                    newY < FIELD_HEIGHT/2 - PADDLE_HEIGHT/2) {
                    this.objects.aiPaddle.position.y = newY;
                }
            }
        }
    }
    
    // Update ball position
    moveBall() {
        if (!this.gameStarted || !this.objects.ball || this.gamePaused) return;
        
        const {MAX_TRAIL_LENGTH, RADIUS, TRAIL_OPACITY_STEP} = GAME_CONFIG.BALL;
        
        // Clear old trail meshes
        while(this.trailGroup.children.length > 0) {
            const mesh = this.trailGroup.children[0];
            mesh.geometry.dispose();
            mesh.material.dispose();
            this.trailGroup.remove(mesh);
        }
        
        // Add current position to trail
        if (this.ballTrail.length >= MAX_TRAIL_LENGTH) {
            this.ballTrail.shift();
        }
        
        // Add current position
        this.ballTrail.push(this.objects.ball.position.clone());
        
        // Create trail segments
        for (let i = 0; i < this.ballTrail.length - 1; i++) {
            const start = this.ballTrail[i];
            
            // Calculate opacity and scale based on position in trail
            const progress = i / this.ballTrail.length;
            const opacity = progress * 0.5;
            
            // Create trail segment with more aggressive tapering
            const trailMaterial = new THREE.MeshBasicMaterial({
                color: GAME_CONFIG.COLORS.NEON_YELLOW,
                transparent: true,
                opacity: opacity
            });
            
            // Create a sphere at each trail position with more aggressive size reduction
            // Use a quadratic scale reduction for more pronounced tapering
            const scaleFactor = Math.pow(progress, 0.5) * 0.8;
            const trailGeometry = new THREE.SphereGeometry(RADIUS * scaleFactor, 8, 8);
            const trailMesh = new THREE.Mesh(trailGeometry, trailMaterial);
            trailMesh.position.copy(start);
            
            this.trailGroup.add(trailMesh);
        }
        
        // Update ball position
        this.objects.ball.position.add(this.ballVelocity);
        
        // Update ball glow (pulse effect)
        if (this.objects.ball.userData.glow) {
            const pulse = Math.sin(Date.now() * 0.005) * 0.3 + 0.7;
            this.objects.ball.userData.glow.scale.set(pulse, pulse, pulse);
        }
        
        // Check for collisions
        this.checkCollisions();
        
        // Check for scoring
        this.checkScoring();
    }
    
    // Check for ball collisions
    checkCollisions() {
        if (!this.objects.ball) return;
        
        const {RADIUS} = GAME_CONFIG.BALL;
        const {HEIGHT: FIELD_HEIGHT} = GAME_CONFIG.FIELD;
        const {WIDTH: PADDLE_WIDTH, HEIGHT: PADDLE_HEIGHT} = GAME_CONFIG.PADDLE;
        
        // Store previous position for improved collision detection
        const prevX = this.objects.ball.position.x - this.ballVelocity.x;
        
        // Top and bottom walls
        if (this.objects.ball.position.y + RADIUS > FIELD_HEIGHT/2 || 
            this.objects.ball.position.y - RADIUS < -FIELD_HEIGHT/2) {
            
            this.ballVelocity.y *= -1;
            
            // Keep ball within bounds
            if (this.objects.ball.position.y + RADIUS > FIELD_HEIGHT/2) {
                this.objects.ball.position.y = FIELD_HEIGHT/2 - RADIUS;
            } else {
                this.objects.ball.position.y = -FIELD_HEIGHT/2 + RADIUS;
            }
            
            // Play wall hit sound
            this.playSound('wall');
        }
        
        if (!this.objects.playerPaddle || !this.objects.aiPaddle) return;
        
        // Paddle collisions with improved detection
        this.checkPaddleCollision(
            this.objects.playerPaddle, 
            prevX, 
            1  // Direction modifier for player paddle (right side of paddle)
        );
        
        this.checkPaddleCollision(
            this.objects.aiPaddle, 
            prevX, 
            -1  // Direction modifier for AI paddle (left side of paddle)
        );
    }
    
    // Helper method to check paddle collision
    checkPaddleCollision(paddle, prevX, directionModifier) {
        const {RADIUS} = GAME_CONFIG.BALL;
        const {WIDTH: PADDLE_WIDTH, HEIGHT: PADDLE_HEIGHT} = GAME_CONFIG.PADDLE;
        
        const ball = this.objects.ball;
        const halfPaddleWidth = PADDLE_WIDTH / 2;
        const halfPaddleHeight = PADDLE_HEIGHT / 2;
        
        // Determine collision side based on direction modifier
        const ballSide = directionModifier > 0 ? -1 : 1; // -1 for left side of ball, 1 for right side
        const paddleSide = directionModifier; // 1 for right side of paddle, -1 for left side
        
        // Check if ball collides with paddle
        if ((ballSide === -1 && ball.position.x - RADIUS <= paddle.position.x + halfPaddleWidth && 
             prevX - RADIUS > paddle.position.x + halfPaddleWidth) || 
            (ballSide === 1 && ball.position.x + RADIUS >= paddle.position.x - halfPaddleWidth && 
             prevX + RADIUS < paddle.position.x - halfPaddleWidth)) {
            
            // Check vertical collision
            if (ball.position.y + RADIUS >= paddle.position.y - halfPaddleHeight && 
                ball.position.y - RADIUS <= paddle.position.y + halfPaddleHeight) {
                
                // Calculate bounce angle based on where ball hits the paddle
                const relativeIntersectY = (paddle.position.y - ball.position.y) / halfPaddleHeight;
                const bounceAngle = relativeIntersectY * (Math.PI/4); // Max angle: 45 degrees
                
                // Increase ball speed slightly on each hit
                const speed = Math.sqrt(
                    this.ballVelocity.x * this.ballVelocity.x + 
                    this.ballVelocity.y * this.ballVelocity.y
                ) + 0.01;
                
                // Set new velocity based on direction
                this.ballVelocity.x = paddleSide * Math.abs(Math.cos(bounceAngle) * speed);
                this.ballVelocity.y = Math.sin(bounceAngle) * speed * -1;
                
                // Place ball just after/before the paddle to prevent sticking
                ball.position.x = paddle.position.x + (paddleSide * (halfPaddleWidth + RADIUS + 0.01));
                
                // Play bounce sound
                this.playSound('bounce');
            }
        }
    }
    
    // Check if a player scored
    checkScoring() {
        if (!this.objects.ball || this.scoringCooldown) return;
        
        const {WIDTH: FIELD_WIDTH} = GAME_CONFIG.FIELD;
        
        // Ball past player paddle (AI scores)
        if (this.objects.ball.position.x < -FIELD_WIDTH/2 - 1) {
            // Set cooldown to prevent multiple calls
            this.scoringCooldown = true;
            
            // Increment score once
            this.score.ai++;
            this.debug(`AI scores! Score: ${this.score.player}-${this.score.ai}`);
            this.updateScoreDisplay();
            
            // Play failure sound when AI scores (player fails)
            if (window.createFailureSound) {
                window.createFailureSound();
            } else {
                // Fall back to regular score sound if failure sound isn't available
                this.playSound('score');
            }
            
            // Hide the ball immediately
            this.objects.ball.visible = false;
            
            // Reset ball after delay
            setTimeout(() => {
                this.objects.ball.visible = true;
                this.resetBall();
                
                // Play serve sound
                setTimeout(() => {
                    this.playSound('bounce');
                    // Reset cooldown after serve
                    this.scoringCooldown = false;
                }, 100);
            }, 800);
        }
        
        // Ball past AI paddle (player scores)
        if (this.objects.ball.position.x > FIELD_WIDTH/2 + 1) {
            // Set cooldown to prevent multiple calls
            this.scoringCooldown = true;
            
            // Increment score once
            this.score.player++;
            this.debug(`Player scores! Score: ${this.score.player}-${this.score.ai}`);
            this.updateScoreDisplay();
            
            // Play victory sound when player scores
            this.playSound('score');
            
            // Hide the ball immediately
            this.objects.ball.visible = false;
            
            // Reset ball after delay
            setTimeout(() => {
                this.objects.ball.visible = true;
                this.resetBall();
                
                // Play serve sound
                setTimeout(() => {
                    this.playSound('bounce');
                    // Reset cooldown after serve
                    this.scoringCooldown = false;
                }, 100);
            }, 800);
        }
    }
    
    // Update the score display
    updateScoreDisplay() {
        if (this.elements.info) {
            this.elements.info.textContent = `${this.score.player} : ${this.score.ai}`;
        }
    }
    
    // Animation loop
    animate() {
        requestAnimationFrame(this.animate);
        
        try {
            // Debug indicator in console sparingly
            if (this.gameStarted && this.objects.ball && Math.random() < 0.005) {
                this.debug(`Ball: (${this.objects.ball.position.x.toFixed(1)}, ${this.objects.ball.position.y.toFixed(1)})`);
            }
            
            // Update game objects
            this.movePaddles();
            this.moveBall();
            
            // Animate the dots in the playing field with wave effect
            if (this.waveDots && this.waveDots.geometry) {
                const positions = this.waveDots.geometry.attributes.position.array;
                const time = Date.now() * 0.0008; // Slower time factor for more subtle movement
                
                for (let i = 0; i < positions.length; i += 3) {
                    const x = positions[i];
                    const z = positions[i + 2];
                    
                    // Create a gentle wave pattern based on position and time
                    positions[i + 1] = Math.sin(x * 0.3 + time) * 0.08 + 
                                      Math.cos(z * 0.3 + time * 0.7) * 0.08;
                }
                
                this.waveDots.geometry.attributes.position.needsUpdate = true;
                
                // Vary the opacity slightly over time
                const baseOpacity = 0.4;
                this.waveDots.material.opacity = baseOpacity + Math.sin(time) * 0.2;
            }
            
            // Add a subtle pulse to the field boundary for visibility
            if (this.objects.fieldBoundary && this.gameStarted) {
                const pulse = Math.sin(Date.now() * 0.002) * 0.3 + 0.7; // Reduced pulse range for subtler effect
                this.objects.fieldBoundary.material.opacity = 0.7 + pulse * 0.3;
            }
            
            // Gentle camera sway only if game has started
            if (this.gameStarted && !this.gamePaused) {
                const swayAmount = 0.4; // Reduced sway
                this.camera.position.x = Math.sin(Date.now() * 0.0002) * swayAmount;
                this.camera.lookAt(0, 0, 0);
            }
            
            // Render scene
            this.renderer.render(this.scene, this.camera);
        } catch (error) {
            this.debug("ERROR in animate: " + error.message);
            console.error(error);
        }
    }
    
    // Create in-game sound toggle
    createInGameSoundToggle() {
        // Check if it already exists
        if (document.getElementById('inGameSoundToggleContainer')) return;
        
        // Create container
        const soundToggleContainer = document.createElement('div');
        soundToggleContainer.id = 'inGameSoundToggleContainer';
        soundToggleContainer.style.position = 'absolute';
        soundToggleContainer.style.top = '10px';
        soundToggleContainer.style.left = '10px';
        soundToggleContainer.style.zIndex = '25';
        soundToggleContainer.style.background = 'rgba(0, 0, 0, 0.6)';
        soundToggleContainer.style.padding = '8px 15px';
        soundToggleContainer.style.borderRadius = '8px';
        soundToggleContainer.style.border = '1px solid #00c3ff';
        
        // Create button for more reliable control (especially on iOS)
        const soundToggleButton = document.createElement('button');
        soundToggleButton.id = 'inGameSoundToggleButton';
        soundToggleButton.style.display = 'flex';
        soundToggleButton.style.alignItems = 'center';
        soundToggleButton.style.background = 'none';
        soundToggleButton.style.border = 'none';
        soundToggleButton.style.padding = '0';
        soundToggleButton.style.color = 'white';
        soundToggleButton.style.fontFamily = 'Orbitron, sans-serif';
        soundToggleButton.style.fontSize = '14px';
        soundToggleButton.style.fontWeight = 'bold';
        soundToggleButton.style.cursor = 'pointer';
        soundToggleButton.style.outline = 'none';
        
        // Label text
        const soundText = document.createElement('span');
        soundText.textContent = 'Sound';
        soundText.style.marginRight = '8px';
        
        // Visual indicator
        const soundIndicator = document.createElement('span');
        soundIndicator.id = 'inGameSoundIndicator';
        soundIndicator.style.display = 'inline-block';
        soundIndicator.style.width = '14px';
        soundIndicator.style.height = '14px';
        soundIndicator.style.borderRadius = '50%';
        soundIndicator.style.backgroundColor = this.soundEnabled ? '#00c3ff' : '#666';
        soundIndicator.style.boxShadow = this.soundEnabled ? '0 0 5px #00c3ff' : 'none';
        
        // Update the indicator to match current state
        const updateIndicator = () => {
            if (this.soundEnabled) {
                soundIndicator.style.backgroundColor = '#00c3ff';
                soundIndicator.style.boxShadow = '0 0 5px #00c3ff';
            } else {
                soundIndicator.style.backgroundColor = '#666';
                soundIndicator.style.boxShadow = 'none';
            }
        };
        
        // Add click handler to toggle sound
        soundToggleButton.addEventListener('click', (e) => {
            e.preventDefault();
            this.soundEnabled = !this.soundEnabled;
            this.debug("Sound toggled to: " + (this.soundEnabled ? "on" : "off"));
            
            // Update visual state
            updateIndicator();
            
            // Update start screen toggle if it exists
            if (window.toggleSound) {
                window.toggleSound(this.soundEnabled);
            }
            
            // If sound enabled, try to play a sound and unlock audio if needed
            if (this.soundEnabled) {
                // Force audio unlock (iOS)
                unlockAudio();
                
                // Try to play after a slight delay
                setTimeout(() => {
                    this.playInitialSound();
                }, 100);
            }
        });
        
        // Also add touch handler specifically for iOS
        soundToggleButton.addEventListener('touchend', (e) => {
            e.preventDefault();
            soundToggleButton.click(); // Trigger the click handler
        }, false);
        
        // Assemble the elements
        soundToggleButton.appendChild(soundText);
        soundToggleButton.appendChild(soundIndicator);
        soundToggleContainer.appendChild(soundToggleButton);
        
        // Add to document
        document.body.appendChild(soundToggleContainer);
    }
    
    // Handle page visibility changes (important for iOS audio)
    handleVisibilityChange() {
        if (document.visibilityState === 'visible') {
            // Page became visible again, ensure audio works
            this.debug("Page visible, resuming audio");
            
            // For iOS, we need special handling when the tab becomes visible again
            if (this.isIOS) {
                // Give iOS a moment to stabilize
                setTimeout(() => {
                    // First ensure the audio context is running
                    this.ensureAudioContext();
                    
                    // Force audio unlock again
                    if (audioCtx && audioCtx.state === 'suspended') {
                        audioCtx.resume().then(() => {
                            this.debug("Audio context resumed after visibility change");
                            
                            // Play a silent buffer to reactivate audio
                            try {
                                const silentBuffer = audioCtx.createBuffer(1, 1, 22050);
                                const silentSource = audioCtx.createBufferSource();
                                silentSource.buffer = silentBuffer;
                                silentSource.connect(audioCtx.destination);
                                silentSource.start(0);
                                
                                // After this, try playing a test sound
                                setTimeout(() => {
                                    if (this.soundEnabled) {
                                        // Try buffer-based playback first
                                        playSoundFromBuffer('bounce');
                                    }
                                }, 100);
                            } catch (e) {
                                this.debug("Error playing silent buffer after visibility change: " + e);
                            }
                        }).catch(e => {
                            this.debug("Error resuming AudioContext after visibility change: " + e);
                        });
                    } else {
                        // Context is already running, just try to play a silent buffer
                        try {
                            if (audioCtx) {
                                const silentBuffer = audioCtx.createBuffer(1, 1, 22050);
                                const silentSource = audioCtx.createBufferSource();
                                silentSource.buffer = silentBuffer;
                                silentSource.connect(audioCtx.destination);
                                silentSource.start(0);
                            }
                        } catch (e) {
                            this.debug("Error playing silent buffer: " + e);
                        }
                    }
                }, 300);
            } else {
                // Non-iOS just needs a context check
                this.ensureAudioContext();
                
                // Maybe play a test sound if enabled
                if (this.soundEnabled && Math.random() < 0.2) {
                    this.playInitialSound(); // 20% chance to play sound on visibility change
                }
            }
        } else {
            // Page hidden, log for debugging
            this.debug("Page hidden");
        }
    }
    
    // Properly clean up all resources
    destroy() {
        this.debug("Destroying game instance");
        
        // Remove event listeners
        window.removeEventListener('resize', this.onWindowResize);
        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('keyup', this.handleKeyUp);
        document.removeEventListener('visibilitychange', this.handleVisibilityChange);
        
        // Clear any intervals
        if (this.audioCheckInterval) {
            clearInterval(this.audioCheckInterval);
            this.audioCheckInterval = null;
        }
        
        // Clean up audio-related resources
        this.soundEnabled = false;
        this.audioReady = false;

        // Remove DOM elements we created
        const elementsToRemove = [
            document.getElementById('inGameSoundToggleContainer'),
            this.pauseOverlay
        ];
        
        elementsToRemove.forEach(el => {
            if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            }
        });
        
        // Clean up renderer and scene
        if (this.renderer) {
            this.renderer.dispose();
            document.body.removeChild(this.renderer.domElement);
        }
        
        if (this.scene) {
            this.disposeScene(this.scene);
        }
        
        // Remove global reference
        window.game = null;
    }
    
    // Helper to dispose of all scene elements
    disposeScene(scene) {
        scene.traverse(object => {
            if (object.geometry) {
                object.geometry.dispose();
            }
            
            if (object.material) {
                if (Array.isArray(object.material)) {
                    object.material.forEach(material => this.disposeMaterial(material));
                } else {
                    this.disposeMaterial(object.material);
                }
            }
        });
    }
    
    // Helper to dispose of a material and its textures
    disposeMaterial(material) {
        // Dispose textures
        for (const prop in material) {
            if (material[prop] && material[prop].isTexture) {
                material[prop].dispose();
            }
        }
        
        material.dispose();
    }
}

// Wait for document to be fully loaded before initializing
window.onload = function() {
    const game = new PongGame();
    game.init();
    
    // Set up unload handler to clean up resources
    window.addEventListener('beforeunload', () => {
        game.destroy();
        cleanupAudioSystem();
    });
};