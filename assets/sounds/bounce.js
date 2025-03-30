// Simple oscillator-based bounce sound
function createBounceSound() {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  // Changed waveform from sine to triangle for a cleaner sound
  oscillator.type = 'triangle';
  
  // Higher frequency range for a ping sound (700-900Hz)
  oscillator.frequency.setValueAtTime(700, audioContext.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(900, audioContext.currentTime + 0.05);
  
  // Shorter, cleaner sound with faster decay
  gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.start();
  // Shorter duration
  oscillator.stop(audioContext.currentTime + 0.1);
  
  return audioContext;
}

// Export the function to be used by the game
window.createBounceSound = createBounceSound; 