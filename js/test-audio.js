/**
 * Vibe Pong - Audio Manager Test
 * Simple test script to verify AudioManager functionality
 */

import { AudioManager } from './AudioManager.js';

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
    
    // Toggle button
    const toggleButton = document.createElement('button');
    toggleButton.id = 'toggle-audio';
    toggleButton.textContent = 'TOGGLE AUDIO';
    styleButton(toggleButton);
    buttons.appendChild(toggleButton);
    
    // Divider
    const divider = document.createElement('div');
    divider.style.height = '1px';
    divider.style.background = 'linear-gradient(to right, transparent, rgba(0, 195, 255, 0.5), transparent)';
    divider.style.margin = '5px 0';
    buttons.appendChild(divider);
    
    // Test sounds
    const soundTypes = [
        { id: 'bounce', name: 'PADDLE HIT', color: '#ffea00' },
        { id: 'wall', name: 'WALL BOUNCE', color: '#ff3366' },
        { id: 'score', name: 'SCORE POINT', color: '#00ff88' }
    ];
    
    soundTypes.forEach(type => {
        const button = document.createElement('button');
        button.id = `play-${type.id}`;
        button.textContent = type.name;
        styleButton(button, type.color);
        button.dataset.soundType = type.id;
        buttons.appendChild(button);
    });
    
    // Close button
    const closeButton = document.createElement('button');
    closeButton.textContent = 'RETURN TO TITLE';
    styleButton(closeButton, '#ff3366');
    closeButton.style.marginTop = '30px';
    closeButton.onclick = () => {
        container.remove();
        // Reload the page to return to title screen
        window.location.reload();
    };
    container.appendChild(closeButton);
    
    document.body.appendChild(container);
    return container;
}

// Style button helper
function styleButton(button, color = '#00c3ff') {
    button.style.padding = '15px 20px';
    button.style.backgroundColor = 'transparent';
    button.style.color = 'white';
    button.style.border = `2px solid ${color}`;
    button.style.borderRadius = '5px';
    button.style.cursor = 'pointer';
    button.style.fontWeight = 'bold';
    button.style.fontFamily = 'Orbitron, sans-serif';
    button.style.fontSize = '16px';
    button.style.transition = 'all 0.3s';
    button.style.boxShadow = `0 0 10px ${color}80`;
    
    button.onmouseover = () => {
        button.style.backgroundColor = `${color}30`;
        button.style.boxShadow = `0 0 15px ${color}`;
        button.style.transform = 'scale(1.05)';
    };
    
    button.onmouseout = () => {
        button.style.backgroundColor = 'transparent';
        button.style.boxShadow = `0 0 10px ${color}80`;
        button.style.transform = 'scale(1)';
    };
    
    // Add touch effects for mobile
    button.ontouchstart = () => {
        button.style.backgroundColor = `${color}30`;
        button.style.boxShadow = `0 0 15px ${color}`;
        button.style.transform = 'scale(1.05)';
    };
    
    button.ontouchend = () => {
        button.style.backgroundColor = 'transparent';
        button.style.boxShadow = `0 0 10px ${color}80`;
        button.style.transform = 'scale(1)';
    };
}

// Update status display
function updateStatus(message, isError = false) {
    const status = document.getElementById('audio-test-status');
    if (status) {
        status.textContent = message;
        
        if (isError) {
            status.style.backgroundColor = 'rgba(255, 50, 50, 0.3)';
            status.style.border = '1px solid rgba(255, 50, 50, 0.5)';
        } else {
            status.style.backgroundColor = 'rgba(0, 195, 255, 0.2)';
            status.style.border = '1px solid rgba(0, 195, 255, 0.3)';
        }
    }
    console.log(message);
}

// Run the test
async function runTest() {
    try {
        // Create test UI
        const container = createTestUI();
        
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
        
        // Setup sound buttons
        document.querySelectorAll('[data-sound-type]').forEach(button => {
            button.onclick = () => {
                const soundType = button.dataset.soundType;
                const played = audioManager.playSound(soundType);
                
                // Flash button when sound is played
                if (played) {
                    const originalColor = button.style.borderColor;
                    button.style.backgroundColor = `${originalColor}50`;
                    
                    setTimeout(() => {
                        button.style.backgroundColor = 'transparent';
                    }, 300);
                    
                    updateStatus(`Playing ${soundType} sound... Success!`);
                } else {
                    updateStatus(`Failed to play ${soundType} sound. Is audio enabled?`, true);
                }
            };
        });
        
        // Initialize audio system when user interacts with UI
        const initAudio = async () => {
            updateStatus('Initializing audio system...');
            const success = await audioManager.initialize();
            
            if (success) {
                updateStatus('Audio system initialized successfully! Try the sounds below.');
                
                // Play a test sound after initialization
                setTimeout(() => {
                    audioManager.playSound('bounce');
                }, 500);
            } else {
                updateStatus('Audio initialization failed. Click any button to try again.', true);
            }
            
            // Remove this event listener once initialization is attempted
            container.removeEventListener('click', initAudio, true);
        };
        
        // Start initialization on first click
        container.addEventListener('click', initAudio, true);
        
    } catch (error) {
        updateStatus(`Error during test: ${error.message}`, true);
        console.error(error);
    }
}

// Start the test
runTest(); 