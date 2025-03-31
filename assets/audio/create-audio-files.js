/**
 * Vibe Pong - Audio File Generator
 * Creates actual MP3 files from base64 data strings
 */

const fs = require('fs');
const path = require('path');

// Base64 sound data for our game sounds
const soundBase64 = {
    // Simple ping sound
    bounce: 'SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tAwAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAASAAAeMwAUFBQUFCgUFBQUFDMzMzMzM0dHR0dHR1paWlpaWlpabnNzc3Nzc4aGhoaGhoaGlJmZmZmZmZmZs7Ozs7Ozs7PGxsbGxsbG0NbW1tbW1tbW4+Pj4+Pj4+Pj8fHx8fHx8fH/////////////////////////////////AAAAAExhdmM1OC4xMwAAAAAAAAAAAAAAACQCQgAAAAAAHjMFJuRcAAAAAAD/+xDEAAAJdINSMGMAITGQalYeYEQhMla9J9GgAAIIAABjQcZECETHAhU9voAAQhEyICTMy9J9bXRdN9DykQIBAMBAMBAMYxjGP6YxjGMYxjGMYz9J9J9J9J9J9J9J9J9JxwMfBBwMYxjGMYxoIAgCAIA+D4Pg+D59J9JxoIOfBA59JxoIOD59JxoHwfB8HwfAAAAAAAAQCAQCAQAACAQCAQAAQEAgEAgAAAA',
    
    // Wall hit sound
    wall: 'SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tAwAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAAeAAAKygAHBwcHDw8PDw8PGBgYGBggICAgICApKSkpKTExMTExMTk5OTk5QUFBQUFBSUlJSUlRUVFRUVFZWVlZWWFhYWFhYWlpaWlpcXFxcXFxeXl5eXmBgYGBgYmJiYmJkZGRkZGRmZmZmZmhoaGhoampqampsbGxsbG5ubm5ucHBwcHBycnJycnR0dHR0dHZ2dnZ2eHh4eHh6urq6ur/////////////////////////////////AAAAAExhdmM1OC4xMwAAAAAAAAAAAAAAACQDkgAAAAAACs/l7QyoAAAAAAD/+xDEAAAOFINBtPGAAhsh6NJ5whgkIwVo2n7gABBisoAAZMHnQQDBAEAQDBZMYQRh4L/v/ZVs3OdYHCTLw/MDgcLhy77v//8uXLgcLhoM8O/+XLly4HCwuHw2Gn//////////l34aMHCTDQfL/lwOHDw+YHBwwN1g8Piy77//9kvHiy4eCQtHPgiQgGBoD4YeE/AWZl4GAQA2KCFmYmfhDImYmmICkrLywsb/Q0NNNM0NDtVABQDAwGyZZ1kWK6ZEXGAA',
    
    // Score sound
    score: 'SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tAwAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAAZAAAYDAAGBg0NDQ0NFBQUFBQbGxsbGyIiIiIiKSkpKSkwMDAwMDc3Nzc3Pj4+Pj5FRUVFRUVNTU1NVVVVVVVVXV1dXV1kZGRkZGxsbGxsc3Nzc3N6enp6eoGBgYGBiYmJiYmQkJCQkJeXl5eXn5+fn5+mpqamprOzs7OzysrKysrS0tLS0tra2tra2uHh4eHh6Ojo6Ojw8PDw8P///wAAAExhdmM1OC4xMwAAAAAAAAAAAAAAACQE2AAAAAAA'
};

// Create audio directory if it doesn't exist
const audioDir = path.join(__dirname);

// Create each sound file
for (const [soundName, base64Data] of Object.entries(soundBase64)) {
    const filePath = path.join(audioDir, `${soundName}.mp3`);
    
    // Convert base64 to buffer
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Write the file
    fs.writeFileSync(filePath, buffer);
    console.log(`Created ${filePath}`);
}

console.log('All audio files created successfully!'); 