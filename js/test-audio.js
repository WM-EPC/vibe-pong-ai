/**
 * Vibe Pong - Audio Manager Test
 * Simple test script to verify AudioManager functionality
 */

import { AudioManager } from './AudioManager.js';
import { AUDIO } from './config.js';

console.log("===== AUDIO TEST SCRIPT LOADED =====");
console.log("Audio config loaded with", Object.keys(AUDIO.SOUND_DATA).length, "sounds:", Object.keys(AUDIO.SOUND_DATA).join(", "));

// Create test UI
function createTestUI() {
    const container = document.createElement('div');
    container.id = 'audio-test-container';
    container.style.position = 'absolute';
    container.style.top = '50%';
    container.style.left = '50%';
    container.style.transform = 'translate(-50%, -50%)';
    container.style.padding = '30px';
    container.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    container.style.borderRadius = '10px';
    container.style.boxShadow = '0 0 20px rgba(0, 195, 255, 0.7)';
    container.style.color = 'white';
    container.style.fontFamily = 'Orbitron, sans-serif';
    container.style.textAlign = 'center';
    container.style.zIndex = '1000';
    container.style.minWidth = '320px';
    container.style.backdropFilter = 'blur(5px)';
    container.style.border = '1px solid rgba(0, 195, 255, 0.3)';
    
    // Title
    const title = document.createElement('h2');
    title.textContent = 'AUDIO SYSTEM TEST';
    title.style.color = '#00c3ff';
    title.style.textShadow = '0 0 10px rgba(0, 195, 255, 0.5)';
    title.style.marginTop = '0';
    container.appendChild(title);
    
    // Status
    const status = document.createElement('div');
    status.id = 'audio-test-status';
    status.textContent = 'Initializing...';
    status.style.margin = '20px 0';
    status.style.padding = '15px';
    status.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    status.style.borderRadius = '5px';
    status.style.border = '1px solid rgba(0, 195, 255, 0.3)';
    status.style.fontSize = '16px';
    container.appendChild(status);
    
    // Buttons container
    const buttons = document.createElement('div');
    buttons.style.display = 'flex';
    buttons.style.flexDirection = 'column';
    buttons.style.gap = '15px';
    buttons.style.marginTop = '25px';
    container.appendChild(buttons);
    
    // Create toggle button
    const toggleButton = document.createElement('button');
    toggleButton.id = 'toggle-audio';
    toggleButton.textContent = 'TOGGLE AUDIO';
    toggleButton.style.padding = '12px 20px';
    toggleButton.style.backgroundColor = 'transparent';
    toggleButton.style.color = 'white';
    toggleButton.style.border = `2px solid #00ff88`;
    toggleButton.style.borderRadius = '5px';
    toggleButton.style.cursor = 'pointer';
    toggleButton.style.transition = 'all 0.3s';
    toggleButton.style.fontFamily = 'Orbitron, sans-serif';
    toggleButton.style.boxShadow = '0 0 15px rgba(0, 255, 136, 0.5)';
    buttons.appendChild(toggleButton);
    
    // Sound buttons
    const soundTypes = ['bounce', 'wall', 'score'];
    const colors = ['#ff3366', '#00c3ff', '#00ff88'];
    
    soundTypes.forEach((soundType, index) => {
        const button = document.createElement('button');
        button.textContent = `PLAY ${soundType.toUpperCase()} SOUND`;
        button.setAttribute('data-sound-type', soundType);
        button.style.padding = '12px 20px';
        button.style.backgroundColor = 'transparent';
        button.style.color = 'white';
        button.style.border = `2px solid ${colors[index]}`;
        button.style.borderRadius = '5px';
        button.style.cursor = 'pointer';
        button.style.transition = 'all 0.3s';
        button.style.fontFamily = 'Orbitron, sans-serif';
        button.style.boxShadow = `0 0 15px ${colors[index]}50`;
        button.style.borderColor = colors[index];
        buttons.appendChild(button);
    });
    
    // Play all button
    const playAllButton = document.createElement('button');
    playAllButton.id = 'play-all';
    playAllButton.textContent = 'PLAY ALL SOUNDS';
    playAllButton.style.padding = '12px 20px';
    playAllButton.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
    playAllButton.style.color = 'white';
    playAllButton.style.border = '2px solid white';
    playAllButton.style.borderRadius = '5px';
    playAllButton.style.cursor = 'pointer';
    playAllButton.style.transition = 'all 0.3s';
    playAllButton.style.fontFamily = 'Orbitron, sans-serif';
    playAllButton.style.marginTop = '15px';
    buttons.appendChild(playAllButton);
    
    document.body.appendChild(container);
    return container;
}

// Update status
function updateStatus(message, isError = false) {
    console.log(isError ? `ERROR: ${message}` : message);
    const status = document.getElementById('audio-test-status');
    if (status) {
        status.textContent = message;
        status.style.color = isError ? '#ff3366' : 'white';
    }
}

// Check WAV file format
function checkWavFormat(soundType) {
    try {
        const soundKey = soundType.toUpperCase();
        const base64Data = AUDIO.SOUND_DATA[soundKey];
        
        if (!base64Data || !base64Data.startsWith('data:audio/wav;base64,')) {
            console.error(`Invalid sound format for ${soundType}`);
            return false;
        }
        
        const base64 = base64Data.split(',')[1];
        if (!base64 || base64.length < 10) {
            console.error(`Sound data too short for ${soundType}`);
            return false;
        }
        
        return true;
    } catch (error) {
        console.error(`Error checking WAV format for ${soundType}:`, error);
        return false;
    }
}

// Manual decode and play (backup method)
function playManualAudio(soundType) {
    try {
        const soundKey = soundType.toUpperCase();
        const base64Data = AUDIO.SOUND_DATA[soundKey];
        
        if (!base64Data) {
            console.error(`No sound data found for ${soundType}`);
            return false;
        }
        
        // Create audio element
        const audio = new Audio(base64Data);
        
        // Log when playback starts
        audio.onplay = () => console.log(`Manual playback started for ${soundType}`);
        
        // Log errors
        audio.onerror = (e) => console.error(`Manual playback error for ${soundType}:`, e);
        
        // Play the sound
        audio.play();
        return true;
    } catch (error) {
        console.error(`Error in manual playback for ${soundType}:`, error);
        return false;
    }
}

// Run the test
async function runTest() {
    try {
        // Create test UI
        const container = createTestUI();
        
        // Verify sound formats
        console.log("Checking sound data formats...");
        checkWavFormat('bounce') && console.log("Bounce sound format OK");
        checkWavFormat('wall') && console.log("Wall sound format OK");
        checkWavFormat('score') && console.log("Score sound format OK");
        
        // Initialize AudioManager
        const audioManager = new AudioManager();
        updateStatus('AudioManager created. Click anywhere to initialize.');
        
        // Setup buttons
        const toggleButton = document.getElementById('toggle-audio');
        toggleButton.onclick = () => {
            const state = audioManager.toggle();
            
            // Update button appearance based on state
            if (state) {
                toggleButton.style.border = '2px solid #00ff88';
                toggleButton.style.boxShadow = '0 0 10px #00ff88';
                updateStatus('Audio enabled');
            } else {
                toggleButton.style.border = '2px solid #ff3366';
                toggleButton.style.boxShadow = '0 0 10px #ff3366';
                updateStatus('Audio disabled');
            }
        };
        
        // Setup play all button
        const playAllButton = document.getElementById('play-all');
        playAllButton.onclick = () => {
            if (!audioManager.audioInitialized) {
                updateStatus('Please initialize audio first by clicking anywhere', true);
                return;
            }
            
            updateStatus('Playing all sounds in sequence...');
            
            // Play each sound with a delay between them
            const soundTypes = ['bounce', 'wall', 'score'];
            soundTypes.forEach((soundType, index) => {
                setTimeout(() => {
                    const played = audioManager.playSound(soundType);
                    if (!played) {
                        // Try manual playback as fallback
                        if (playManualAudio(soundType)) {
                            updateStatus(`Playing ${soundType} sound (manual fallback)...`);
                        } else {
                            updateStatus(`Failed to play ${soundType} sound. Is audio enabled?`, true);
                        }
                    }
                }, index * 700); // 700ms between each sound
            });
        };
        
        // Setup sound buttons
        document.querySelectorAll('[data-sound-type]').forEach(button => {
            button.onclick = () => {
                const soundType = button.dataset.soundType;
                console.log(`Attempting to play ${soundType} sound`);
                
                if (!audioManager.audioInitialized) {
                    updateStatus('Please initialize audio first by clicking anywhere', true);
                    return;
                }
                
                // Flash button when attempting to play
                const originalColor = button.style.borderColor;
                button.style.backgroundColor = `${originalColor}50`;
                
                setTimeout(() => {
                    button.style.backgroundColor = 'transparent';
                }, 300);
                
                // Try to play the sound
                const played = audioManager.playSound(soundType);
                
                if (played) {
                    updateStatus(`Playing ${soundType} sound... Success!`);
                } else {
                    // Try manual playback as fallback
                    if (playManualAudio(soundType)) {
                        updateStatus(`Playing ${soundType} sound (manual fallback)...`);
                    } else {
                        updateStatus(`Failed to play ${soundType} sound. Is audio enabled?`, true);
                    }
                }
            };
        });
        
        // Initialize audio system when user interacts with UI
        const initAudio = async () => {
            updateStatus('Initializing audio system...');
            console.log('Starting audio initialization...');
            
            try {
                // Create silent audio context to unlock audio
                const tempAudio = new Audio();
                tempAudio.play().catch(() => console.log('Temporary audio play needed user interaction'));
                
                const success = await audioManager.initialize();
                
                if (success) {
                    console.log('Audio initialization successful!');
                    updateStatus('Audio system initialized successfully! Try the sounds below.');
                    
                    // Play a test sound after initialization
                    setTimeout(() => {
                        console.log('Playing initial test sound (bounce)...');
                        const played = audioManager.playSound('bounce');
                        console.log('Initial sound playback result:', played);
                        
                        if (!played) {
                            // Try manual playback instead
                            playManualAudio('bounce');
                        }
                    }, 500);
                } else {
                    console.error('Audio initialization failed');
                    updateStatus('Audio initialization failed. Try fallback or click again.', true);
                }
            } catch (err) {
                console.error('Error during audio initialization:', err);
                updateStatus('Audio initialization error. Try again.', true);
            }
            
            // Remove this event listener once initialization is attempted
            container.removeEventListener('click', initAudio, true);
        };
        
        // Start initialization on first click
        container.addEventListener('click', initAudio, true);
        
    } catch (error) {
        console.error('Error during test setup:', error);
        updateStatus(`Error during test: ${error.message}`, true);
    }
}

// Start the test
runTest(); 