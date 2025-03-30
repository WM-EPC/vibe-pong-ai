// Success sound for scoring a point
function createScoreSound() {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  
  // Create a more complex sound with multiple oscillators
  const oscillator1 = audioContext.createOscillator();
  const oscillator2 = audioContext.createOscillator();
  const masterGain = audioContext.createGain();
  
  // First oscillator - ascending tone
  oscillator1.type = 'sine';
  oscillator1.frequency.setValueAtTime(400, audioContext.currentTime);
  oscillator1.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.2);
  
  // Second oscillator - higher pitch for brightness
  oscillator2.type = 'triangle';
  oscillator2.frequency.setValueAtTime(600, audioContext.currentTime);
  oscillator2.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.15);
  
  // Individual gain nodes for balancing the oscillators
  const gain1 = audioContext.createGain();
  const gain2 = audioContext.createGain();
  
  gain1.gain.setValueAtTime(0.3, audioContext.currentTime);
  gain1.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
  
  gain2.gain.setValueAtTime(0.2, audioContext.currentTime);
  gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.25);
  
  // Connect everything
  oscillator1.connect(gain1);
  oscillator2.connect(gain2);
  
  gain1.connect(masterGain);
  gain2.connect(masterGain);
  
  masterGain.connect(audioContext.destination);
  
  // Start and stop the oscillators
  oscillator1.start();
  oscillator2.start();
  
  oscillator1.stop(audioContext.currentTime + 0.3);
  oscillator2.stop(audioContext.currentTime + 0.3);
  
  return audioContext;
}

// Export the function to be used by the game
window.createScoreSound = createScoreSound; 