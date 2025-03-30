// Failure sound for when AI scores (player fails)
function createFailureSound() {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  
  // Create a "womp womp" descending trombone-like sound
  const oscillator1 = audioContext.createOscillator();
  const oscillator2 = audioContext.createOscillator();
  const masterGain = audioContext.createGain();
  
  // First oscillator - main tone that descends
  oscillator1.type = 'sawtooth'; // More brass-like timbre
  oscillator1.frequency.setValueAtTime(300, audioContext.currentTime);
  oscillator1.frequency.exponentialRampToValueAtTime(150, audioContext.currentTime + 0.6); // Slower descending pitch
  
  // Second oscillator - subtle detuned accompaniment for richer sound
  oscillator2.type = 'triangle';
  oscillator2.frequency.setValueAtTime(298, audioContext.currentTime); // Slightly detuned
  oscillator2.frequency.exponentialRampToValueAtTime(148, audioContext.currentTime + 0.6);
  
  // Individual gain nodes for different envelopes
  const gain1 = audioContext.createGain();
  const gain2 = audioContext.createGain();
  
  // First part of "womp womp" - louder attack
  gain1.gain.setValueAtTime(0.1, audioContext.currentTime);
  gain1.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.08);
  gain1.gain.linearRampToValueAtTime(0.15, audioContext.currentTime + 0.2);
  gain1.gain.linearRampToValueAtTime(0.01, audioContext.currentTime + 0.7);
  
  // Subtle background tone
  gain2.gain.setValueAtTime(0.05, audioContext.currentTime);
  gain2.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.1);
  gain2.gain.linearRampToValueAtTime(0.01, audioContext.currentTime + 0.7);
  
  // Connect everything
  oscillator1.connect(gain1);
  oscillator2.connect(gain2);
  
  gain1.connect(masterGain);
  gain2.connect(masterGain);
  
  masterGain.connect(audioContext.destination);
  
  // Start and stop the oscillators
  oscillator1.start();
  oscillator2.start();
  
  oscillator1.stop(audioContext.currentTime + 0.8);
  oscillator2.stop(audioContext.currentTime + 0.8);
  
  return audioContext;
}

// Export the function to be used by the game
window.createFailureSound = createFailureSound; 