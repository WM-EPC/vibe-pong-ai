// Simple oscillator-based wall hit sound
function createWallSound() {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  // Keep sine wave but use different frequency range from paddle sound
  oscillator.type = 'sine';
  // Start higher and sweep lower - complementary to paddle sound
  oscillator.frequency.setValueAtTime(500, audioContext.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(300, audioContext.currentTime + 0.07);
  
  // Slightly lower volume and faster decay
  gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.12);
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.start();
  // Shorter duration to match the paddle sound style
  oscillator.stop(audioContext.currentTime + 0.12);
  
  return audioContext;
}

// Export the function to be used by the game
window.createWallSound = createWallSound; 