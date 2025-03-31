/**
 * Vibe Pong - Game Configuration
 * Centralizes all game constants and configuration parameters
 */

import * as THREE from 'three';

// Game field dimensions and boundaries
export const FIELD = {
    WIDTH: 20,
    HEIGHT: 12,
    DEPTH: 1
};

// Paddle configuration
export const PADDLE = {
    WIDTH: 0.3,
    HEIGHT: 2,
    DEPTH: 0.3,
    SPEED: 0.15
};

// Ball configuration
export const BALL = {
    RADIUS: 0.5,
    INITIAL_SPEED: 0.12,
    MAX_TRAIL_LENGTH: 15,
    TRAIL_OPACITY_STEP: 0.07
};

// Game colors
export const COLORS = {
    NEON_PINK: new THREE.Color(1, 0.08, 0.58),
    NEON_BLUE: new THREE.Color(0, 0.76, 1),
    NEON_YELLOW: new THREE.Color(1, 0.92, 0),
    BACKGROUND: new THREE.Color(0.01, 0.01, 0.03),
    GRID: new THREE.Color(0.2, 0.2, 0.6)
};

// View modes
export const VIEW_MODES = {
    THIRD_PERSON: 'THIRD_PERSON',
    FIRST_PERSON: 'FIRST_PERSON'
};

// Audio configuration
export const AUDIO = {
    ENABLED_BY_DEFAULT: true,
    // Simple, reliable sound effects
    SOUND_DATA: {
        // Ping sound for paddle bounce
        BOUNCE: "data:audio/wav;base64,UklGRmQDAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YUADAAAAAP//AQABAP///v/+//7//v/+//7//v/9//3//f/9//3//f/9//z//P/8//z//P/8//v/+//7//v/+//7//r/+v/6//r/+v/5//n/+f/5//n/+P/4//j/+P/4//f/9//3//f/9//2//b/9v/2//b/9f/1//X/9f/1//T/9P/0//T/9P/z//P/8//z//P/8v/y//L/8v/y//H/8f/x//H/8f/w//D/8P/w//D/7//v/+//7//v/+7/7v/u/+7/7v/t/+3/7f/t/+3/7P/s/+z/7P/s/+v/6//r/+v/6//r/+r/6v/q/+r/6v/p/+n/6f/p/+n/6P/o/+j/6P/o/+f/5//n/+f/5//m/+b/5v/m/+b/5v/l/+X/5f/l/+X/5P/k/+T/5P/k/+P/4//j/+P/4//i/+L/4v/i/+L/4f/h/+H/4f/h/+D/4P/g/+D/4P/f/9//3//f/9//3v/e/97/3v/e/93/3f/d/93/3f/c/9z/3P/c/9z/3P/b/9v/2//b/9r/2v/a/9r/2v/Z/9n/2f/Z/9n/2P/Y/9j/2P/Y/9f/1//X/9f/1//W/9b/1v/W/9b/1f/V/9X/1f/V/9T/1P/U/9T/1P/T/9P/0//T/9P/0v/S/9L/0v/S/9H/0f/R/9H/0f/Q/9D/0P/Q/9D/z//P/8//z//P/87/zv/O/87/zv/N/83/zf/N/83/zP/M/8z/zP/M/8v/y//L/8v/y//L/8r/yv/K/8r/yf/J/8n/yf/J/8j/yP/I/8j/yP/H/8f/x//H/8f/xv/G/8b/xv/G/8X/xf/F/8X/xf/E/8T/xP/E/8T/w//D/8P/w//D/8L/wv/C/8L/wv/B/8H/wf/B/8H/wP/A/8D/wP/A/7//v/+//7//v/++/77/vv++/77/vf+9/73/vf+9/7z/vP+8/7z/vP+8/7v/u/+7/7v/u/+6/7r/uv+6/7r/uf+5/7n/uf+5/7j/uP+4/7j/uP+3/7f/t/+3/7f/tv+2/7b/tv+2/7X/tf+1/7X/tf+0/7T/tP+0/7T/tP+z/7P/s/+z/7L/sv+y/7L/sv+x/7H/sf+x/7H/sP+w/7D/sP+w/6//r/+v/6//r/+u/67/rv+u/67/rf+t/63/rf+t/6z/rP+s/6z/rP+r/6v/q/+r/6v/qv+q/6r/qv+q/6n/qf+p/6n/qf+o/6j/qP+o/6j/p/+n/6f/p/+n/6b/pv+m/6b/pv+l/6X/pf+l/6X/pP+k/6T/pP+k/6P/o/+j/6P/o/+j/6L/ov+i/6L/of+h/6H/of+h/6D/oP+g/6D/oP+f/5//n/+f/5//nv+e/57/nv+e/53/nf+d/53/nf+c/5z/nP+c/5z/m/+b/5v/m/+b/5r/mv+a/5r/mv+Z/5n/mf+Z/5n/mP+Y/5j/mP+Y/5f/l/+X/5f/l/+W/5b/lv+W/5b/lf+V/5X/lf+V/5T/lP+U/5T/lP+T/5P/k/+T/5P/kv+S/5L/kv+S/5H/kf+R/5H/kf+Q/5D/kP+Q/5D/j/+P/4//j/+P/47/jv+O/47/jv+N/43/jf+N/43/jP+M/4z/jP+M/4v/i/+L/4v/i/+K/4r/iv+K/4r/if+J/4n/if+J/4j/iP+I/4j/iP+H/4f/h/+H/4f/",
        // Reverberant wall hit sound - more percussive
        WALL: "data:audio/wav;base64,UklGRuQCAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YcACAAAAAAAAK0BOWGpyfoaPlp2irK2vtLW2u7q7v77AwMLBw8LCwsHAvr27ubezr6uooZyWj4iBemtcUEdAODAvLiwnIRsVDwoGAwD//fz8/P39/v8BBQoOEhcdJCouMzc8QURITFBVWl5kaGxwdHh8f4OHio2QlJibnZ+jpKaprK6ws7S2uLq7vL2/wMLDxMbHycnLy8zNzc7Ozs/Pz8/Pzs7Ozc3My8rIx8XEwsC+vLq3trOysa+trKupqKalpaOio6Kho6SlpqmrrK6xtLe6vcDDx8rO0dTY3N7i5urw9vj6/P8BBQgLDhETFxocICMmKSstMDI0Njg5Ozw9PT4+Pj49PTw7Ojk4NjUzMjAvLiwrKSchHx0bGRYUEhEPDQsKCAcFBAIBAP/+/fz7+vn5+Pf39vb19fX19fb29/j5+vz9/wEDBQgKDA4RExYYGhweICIlJyksLjEzNTc5Oz0/QUJDREVGR0hISUlJSUlISEhHRkVEQ0JBQD8+PTw6OTg2NTQzMjEwLi0sKyopKCcmJSUkIyMjIiIiIiIiIiMjJCQlJicoKSorLC0uLzEyMzQ2Nzg6Ozw9Pj9AQUJDREVGR0hJSUpLS0xMTU1OTk5OTk9PT09PTk5OTk1NTUxMS0tKSklISEdHRkVFRENDQkJBQUBAPz8/Pj4+PT09PDw8PDw7Ozs7Ozs7Ozs7Ozs8PDw8PT09Pj4/Pz9AQEBBQUJCQ0NDREREREVFRUVFRUVFRUVFRUVFRUVFRURERERDQkJCQUFAQD8/Pj49PT08PDw7Ozs6Ojo5OTk5OTk5OTk5OTk5Ojo6Ojs7Ozw8PT0+Pj8/QEBBQUJCQ0NEREVFRkZHR0dISElJSUlKSkpKSkpKSkpKSklJSUlISEdHR0ZGRUVERENCQkFBQD8/Pj49PT08PDw7Ozs7Ojo6Ojo6Ojo6Ozs7Ozw8PD09Pj4/P0BAQUFCQkNE",
        // Victory fanfare score sound (cleaner, more celebratory)
        SCORE: "data:audio/wav;base64,UklGRqQDAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YYADAAAAAAABAQID/v4CAwQF/v38+/r5/Pz9/v8A/f37+vn4+Pf3+Pn6/P7///7++/n39vT08/P09fb4+fz9/v/+/fv5+Pb19PT09fb3+fr8/f7//v38+/r5+Pj4+Pn6+/z9/v8AAQIEBQcJCgsMDQ4PEBESEhMUFBUVFRYWFhcXFhYWFRQUExIREQ8ODQsKCQcFBAIBAP7+/fv6+fj39vb19fX19fb3+Pn6+/z9/v8AAQIDBAUGBwgJCgsLDA0NDg4PDw8QEBAQEBAQDw8PDg4NDQsLCgkIBwYFBAMCAQD///79/Pv7+vn5+Pj4+Pj4+fn6+vv8/f3+/wABAgMEBQYHCAkKCwwNDg8QERITFBUVFhcYGRkbHB0eHyAhIiMkJSYnKCkqKywsLS0uLi4uLi4uLS0sLCsqKSgnJiUkIyIhIB8eHRwbGhkYFxYVFBMSERAODQwLCggHBgQDAQD+/fv6+ff29PPy8fDv7+7u7u7v7/Dx8vP19vf5+vz9/wECBAYHCQsNDxARExUWGBocHR8hIiQmJyosLS8xMjQ2Nzk6PD0/QEJDRUZHSE1RVVleYWRmaWxucXN1d3l6fH5/gIGCg4SFhIWEg4OCgYB/fXx6eHd1c3FubGpoZWNhXltYVVJPTElHRUNCQD89Ozo4NjQyMS8tKyooJiQiIR8dHBkYFhQTEQ8NDAoIBwUDAQD+/Pr5+Pb18/Lx8O/u7u3t7e7u7/Dx8vP19vf5+vz9/wECBAYICgwOEBIUFRcZGx0fISMlJyksLjAyNDY4Oz0/QUJFR0lLTU9RU1VXWVtdXmBiZGVnaWtsbm9xcnR1dnd4eXp7fH19fn9/gICAgICAgH9/fn19fHt6eXh3dnVzcnBvbWxqaGdlY2JgXl1bWVdVU1FPTUtJR0VDQkA+PDo4NjQyMC4sKiglIyEfHRsZFxUTEQ8NDAoIBgQCAP79+/n39vTz8fDv7u3s7Ozs7O3u7/Dy8/T2+Pn7/P4AAgQGCAoMDxETFRcZGx0fISQmKCosLzE0Njg7PT9CREZJSk1PUVRWWFpcXmBiZGZoaWtsbm9xcnR1dnd4eXp7e3x9fX5+fn5+fn59fX18e3p5eHd2dXRycW9ubGppZ2VkYmBfXVtZV1VTUVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
    }
};

// Game state configuration
export const GAME_STATES = {
    MENU: 'MENU',
    PLAYING: 'PLAYING',
    PAUSED: 'PAUSED',
    GAME_OVER: 'GAME_OVER'
};

// Scoring configuration
export const SCORING = {
    POINTS_TO_WIN: 11,
    MINIMUM_SCORE_FOR_PORTAL: 50
};

// Version information
export const VERSION = {
    CURRENT: 'v0.1.6ai',
    DESCRIPTION: 'AI-assisted improvement version'
};

// Debug configuration
export const DEBUG = {
    ENABLED: false,
    SHOW_FPS: false
}; 