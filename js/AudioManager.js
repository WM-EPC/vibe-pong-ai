/**
 * Vibe Pong - Audio Manager
 * Handles sound initialization, playback, and cross-platform compatibility
 */

import { AUDIO } from './config.js';

export class AudioManager {
    constructor() {
        // Audio system state
        this.enabled = AUDIO.ENABLED_BY_DEFAULT;
        this.audioContext = null;
        this.audioInitialized = false;
        this.audioContextRunning = false;
        
        // Platform detection
        this.isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        this.isAndroid = /Android/.test(navigator.userAgent);
        
        // Decoded audio buffers for better performance
        this.buffers = {
            bounce: null,
            wall: null,
            score: null
        };
        
        // Audio maintenance interval
        this.maintenanceInterval = null;
        
        // Bind methods
        this.initialize = this.initialize.bind(this);
        this.playSound = this.playSound.bind(this);
        this.toggle = this.toggle.bind(this);
        this.unlockAudio = this.unlockAudio.bind(this);
        this._startMaintenanceInterval = this._startMaintenanceInterval.bind(this);
        this._stopMaintenanceInterval = this._stopMaintenanceInterval.bind(this);
        this._resumeAudioContext = this._resumeAudioContext.bind(this);
        
        // Monitor visibility changes for consistent playback
        document.addEventListener('visibilitychange', this._handleVisibilityChange.bind(this));
    }
    
    /**
     * Initialize the audio system and decode sound buffers
     * @returns {Promise<boolean>} Success state of initialization
     */
    async initialize() {
        if (this.audioInitialized) return true;
        
        try {
            // Create audio context using standard or webkit prefix
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Attempt to unlock audio on mobile
            await this.unlockAudio();
            
            // Pre-decode audio buffers if context is available
            if (this.audioContext) {
                // Process each sound in parallel
                const soundTypes = Object.keys(AUDIO.SOUND_DATA);
                const decodePromises = soundTypes.map(type => this._decodeAudioData(type));
                
                // Wait for all decoding to complete
                await Promise.allSettled(decodePromises);
                
                // Start maintenance interval for mobile audio
                this._startMaintenanceInterval();
                
                this.audioInitialized = true;
                console.log("Audio system initialized successfully");
                return true;
            }
        } catch (error) {
            console.error("Error initializing audio system:", error);
        }
        
        return false;
    }
    
    /**
     * Toggle audio on/off
     * @param {boolean} [state] Optional explicit state, otherwise toggles current state
     * @returns {boolean} New state (true = enabled, false = disabled)
     */
    toggle(state) {
        if (typeof state === 'boolean') {
            this.enabled = state;
        } else {
            this.enabled = !this.enabled;
        }
        
        // If enabling sound, ensure audio is initialized and unlocked
        if (this.enabled && !this.audioInitialized) {
            this.initialize();
        }
        
        console.log(`Sound ${this.enabled ? 'enabled' : 'disabled'}`);
        
        // Return new state for UI updates
        return this.enabled;
    }
    
    /**
     * Play a sound effect if audio is enabled
     * @param {string} soundType - Type of sound (bounce, wall, score)
     * @returns {boolean} Whether sound was attempted to play
     */
    playSound(soundType) {
        // Don't try to play sounds if they're disabled
        if (!this.enabled || !this.audioInitialized) return false;
        
        // Ensure sound exists in our configuration
        const soundKey = soundType.toUpperCase();
        if (!AUDIO.SOUND_DATA[soundKey]) {
            console.warn(`Sound type "${soundType}" not found`);
            return false;
        }
        
        // Resume audio context if it's suspended
        if (this.audioContext.state === 'suspended') {
            this._resumeAudioContext();
            
            // On iOS, we need to queue the sound play after context resumes
            if (this.isIOS) {
                setTimeout(() => this._playFromBuffer(soundType), 100);
                return true;
            }
        }
        
        return this._playFromBuffer(soundType);
    }
    
    /**
     * Unlock audio playback on mobile devices (especially iOS)
     * Must be called from a user interaction event
     * @returns {Promise<boolean>} Success state of unlocking
     */
    async unlockAudio() {
        if (!this.audioContext) return false;
        
        try {
            console.log("Attempting audio unlock");
            
            // iOS and some other mobile browsers require audio to start from a user interaction
            // Create and play a silent buffer
            const buffer = this.audioContext.createBuffer(1, 1, 22050);
            const source = this.audioContext.createBufferSource();
            source.buffer = buffer;
            source.connect(this.audioContext.destination);
            
            // Play the empty buffer to unlock audio
            source.start(0);
            
            // Try to resume the audio context
            await this._resumeAudioContext();
            
            return true;
        } catch (error) {
            console.error("Error unlocking audio:", error);
            return false;
        }
    }
    
    /**
     * Cleanup audio resources when no longer needed
     */
    cleanup() {
        this._stopMaintenanceInterval();
        
        // Close audio context if it exists
        if (this.audioContext && typeof this.audioContext.close === 'function') {
            try {
                this.audioContext.close();
            } catch (error) {
                console.warn("Error closing audio context:", error);
            }
        }
        
        // Clear decoded buffers
        for (const key in this.buffers) {
            this.buffers[key] = null;
        }
        
        this.audioContext = null;
        this.audioInitialized = false;
        this.audioContextRunning = false;
        
        console.log("Audio system cleaned up");
    }
    
    /* PRIVATE METHODS */
    
    /**
     * Play a sound from a decoded buffer
     * @private
     * @param {string} soundType - Type of sound to play
     * @returns {boolean} Whether the sound was played successfully
     */
    _playFromBuffer(soundType) {
        if (!this.audioContext) return false;
        
        try {
            const bufferKey = soundType.toLowerCase();
            
            // If we have a decoded buffer, use it
            if (this.buffers[bufferKey]) {
                const source = this.audioContext.createBufferSource();
                source.buffer = this.buffers[bufferKey];
                source.connect(this.audioContext.destination);
                source.start(0);
                return true;
            }
            
            // If we don't have the buffer yet, try to decode it on demand
            const soundKey = soundType.toUpperCase();
            if (AUDIO.SOUND_DATA[soundKey]) {
                this._decodeAudioData(soundKey).then(success => {
                    if (success && this.buffers[bufferKey]) {
                        const newSource = this.audioContext.createBufferSource();
                        newSource.buffer = this.buffers[bufferKey];
                        newSource.connect(this.audioContext.destination);
                        newSource.start(0);
                    }
                });
                
                return true;
            }
            
            return false;
        } catch (error) {
            console.error("Error playing sound:", error);
            return false;
        }
    }
    
    /**
     * Decode audio data from base64 string
     * @private
     * @param {string} soundKey - Key of the sound in AUDIO.SOUND_DATA
     * @returns {Promise<boolean>} Success state of decoding
     */
    async _decodeAudioData(soundKey) {
        if (!this.audioContext || !AUDIO.SOUND_DATA[soundKey]) return false;
        
        try {
            // Extract the base64 data from the data URL
            const base64String = AUDIO.SOUND_DATA[soundKey].split(',')[1];
            if (!base64String) {
                console.error("Invalid sound data format for", soundKey);
                return false;
            }
            
            // Convert base64 to array buffer
            const binaryString = window.atob(base64String);
            const len = binaryString.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            
            // Decode the audio data
            const bufferKey = soundKey.toLowerCase();
            const decodedBuffer = await this.audioContext.decodeAudioData(bytes.buffer);
            
            // Store the decoded buffer for future use
            this.buffers[bufferKey] = decodedBuffer;
            console.log(`Decoded buffer for ${soundKey}`);
            
            return true;
        } catch (error) {
            console.error(`Error decoding audio data for ${soundKey}:`, error);
            return false;
        }
    }
    
    /**
     * Resume the audio context if it's suspended
     * @private
     * @returns {Promise<boolean>} Success state of resuming
     */
    async _resumeAudioContext() {
        if (!this.audioContext) return false;
        
        // Only try to resume if the context is suspended
        if (this.audioContext.state === 'suspended') {
            try {
                await this.audioContext.resume();
                this.audioContextRunning = this.audioContext.state === 'running';
                console.log("AudioContext resumed successfully");
                return this.audioContextRunning;
            } catch (error) {
                console.warn("Failed to resume AudioContext:", error);
                return false;
            }
        }
        
        // If already running, return true
        this.audioContextRunning = this.audioContext.state === 'running';
        return this.audioContextRunning;
    }
    
    /**
     * Start the interval that periodically checks audio context state
     * @private
     */
    _startMaintenanceInterval() {
        // Clear any existing interval
        this._stopMaintenanceInterval();
        
        // Check interval duration - more frequent for iOS
        const interval = this.isIOS ? 2000 : 5000;
        
        // Create a new interval that checks and resumes the audio context
        this.maintenanceInterval = setInterval(() => {
            if (this.enabled && this.audioContext) {
                // Check if context is suspended and try to resume it
                if (this.audioContext.state === 'suspended') {
                    this._resumeAudioContext();
                }
                
                // On iOS, we occasionally play a silent buffer to keep things active
                if (this.isIOS && this.audioContext.state === 'running') {
                    try {
                        const silentBuffer = this.audioContext.createBuffer(1, 1, 22050);
                        const silentSource = this.audioContext.createBufferSource();
                        silentSource.buffer = silentBuffer;
                        silentSource.connect(this.audioContext.destination);
                        silentSource.start(0);
                    } catch (e) {
                        // Ignore errors here
                    }
                }
            }
        }, interval);
        
        console.log(`Audio maintenance interval started (${interval}ms)`);
    }
    
    /**
     * Stop the audio maintenance interval
     * @private
     */
    _stopMaintenanceInterval() {
        if (this.maintenanceInterval) {
            clearInterval(this.maintenanceInterval);
            this.maintenanceInterval = null;
        }
    }
    
    /**
     * Handle visibility changes to ensure audio continues to work
     * @private
     */
    _handleVisibilityChange() {
        if (document.visibilityState === 'visible') {
            console.log("Page visible, ensuring audio works");
            
            // Resume audio context if it's suspended
            if (this.enabled && this.audioContext) {
                this._resumeAudioContext();
                
                // For iOS, we may need to re-unlock audio
                if (this.isIOS) {
                    setTimeout(() => {
                        // Play a silent buffer to reactivate audio
                        try {
                            const silentBuffer = this.audioContext.createBuffer(1, 1, 22050);
                            const silentSource = this.audioContext.createBufferSource();
                            silentSource.buffer = silentBuffer;
                            silentSource.connect(this.audioContext.destination);
                            silentSource.start(0);
                        } catch (e) {
                            console.warn("Error playing silent buffer:", e);
                        }
                    }, 300);
                }
            }
        }
    }
} 