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
    container.style.padding = '20px';
    container.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    container.style.borderRadius = '10px';
    container.style.boxShadow = '0 0 10px rgba(0, 195, 255, 0.5)';
    container.style.color = 'white';
    container.style.fontFamily = 'Arial, sans-serif';
    container.style.textAlign = 'center';
    container.style.zIndex = '1000';
    
    // Title
    const title = document.createElement('h2');
    title.textContent = 'Audio System Test';
    title.style.color = '#00c3ff';
    container.appendChild(title);
    
    // Status
    const status = document.createElement('div');
    status.id = 'audio-test-status';
    status.textContent = 'Initializing...';
    status.style.margin = '15px 0';
    status.style.padding = '10px';
    status.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    status.style.borderRadius = '5px';
    container.appendChild(status);
    
    // Buttons container
    const buttons = document.createElement('div');
    buttons.style.display = 'flex';
    buttons.style.flexDirection = 'column';
    buttons.style.gap = '10px';
    buttons.style.marginTop = '20px';
    container.appendChild(buttons);
    
    // Toggle button
    const toggleButton = document.createElement('button');
    toggleButton.id = 'toggle-audio';
    toggleButton.textContent = 'Toggle Audio';
    styleButton(toggleButton);
    buttons.appendChild(toggleButton);
    
    // Test sounds
    const soundTypes = ['bounce', 'wall', 'score'];
    soundTypes.forEach(type => {
        const button = document.createElement('button');
        button.id = `play-${type}`;
        button.textContent = `Play ${type.charAt(0).toUpperCase() + type.slice(1)} Sound`;
        styleButton(button);
        button.dataset.soundType = type;
        buttons.appendChild(button);
    });
    
    // Close button
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close Test';
    styleButton(closeButton);
    closeButton.style.marginTop = '20px';
    closeButton.style.backgroundColor = '#ff3366';
    closeButton.onclick = () => {
        container.remove();
        // Remove the test script
        const script = document.getElementById('audio-test-script');
        if (script) script.remove();
    };
    container.appendChild(closeButton);
    
    document.body.appendChild(container);
    return container;
}

// Style button helper
function styleButton(button) {
    button.style.padding = '12px 20px';
    button.style.backgroundColor = '#00c3ff';
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.borderRadius = '5px';
    button.style.cursor = 'pointer';
    button.style.fontWeight = 'bold';
    button.style.transition = 'all 0.2s';
    
    button.onmouseover = () => {
        button.style.backgroundColor = '#00a0ff';
        button.style.transform = 'scale(1.05)';
    };
    
    button.onmouseout = () => {
        button.style.backgroundColor = '#00c3ff';
        button.style.transform = 'scale(1)';
    };
}

// Update status display
function updateStatus(message, isError = false) {
    const status = document.getElementById('audio-test-status');
    if (status) {
        status.textContent = message;
        status.style.backgroundColor = isError ? 'rgba(255, 50, 50, 0.3)' : 'rgba(0, 195, 255, 0.3)';
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
        updateStatus('AudioManager created. Initializing...');
        
        // Setup buttons
        const toggleButton = document.getElementById('toggle-audio');
        toggleButton.onclick = () => {
            const state = audioManager.toggle();
            updateStatus(`Audio ${state ? 'enabled' : 'disabled'}`);
        };
        
        // Setup sound buttons
        document.querySelectorAll('[data-sound-type]').forEach(button => {
            button.onclick = () => {
                const soundType = button.dataset.soundType;
                const played = audioManager.playSound(soundType);
                updateStatus(`Playing ${soundType} sound... ${played ? 'Success' : 'Failed'}`);
            };
        });
        
        // Initialize audio system when user interacts with UI
        const initAudio = async () => {
            updateStatus('Initializing audio system...');
            const success = await audioManager.initialize();
            updateStatus(success 
                ? 'Audio system initialized successfully. You can now test sounds.' 
                : 'Audio initialization failed. This may be expected on iOS until you interact with a button.', 
                !success);
            
            // Remove this event listener once initialization is attempted
            container.removeEventListener('click', initAudio, true);
        };
        
        // Start initialization on first click
        container.addEventListener('click', initAudio, true);
        
        updateStatus('Test ready. Click anywhere to initialize audio.');
    } catch (error) {
        updateStatus(`Error during test: ${error.message}`, true);
        console.error(error);
    }
}

// Start the test
runTest(); 