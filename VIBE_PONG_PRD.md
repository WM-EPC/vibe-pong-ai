# Vibe Pong - Product Requirements Document

## Overview
Vibe Pong is a retro-futuristic, synthwave-inspired 3D Pong game built with Three.js, designed as an entry for Levels.io's Twitter contest. The game features classic Pong gameplay with modern 3D visuals and effects.

## Contest Requirements
- Web app playable on laptops and mobile browsers
- Built primarily with Three.js
- At least 80% AI-coded
- Free to play with no login requirements
- Near-instant loading (no loading screens or heavy downloads)
- Required attribution link for contest entry

## Target Audience
- Vibe coding enthusiasts and contest participants
- Players arriving via the portal system
- Casual gamers including children

## Core Features (Priority Order)

### 1. Cross-Platform Gameplay
- Fully functional on both desktop browsers and mobile devices
- Responsive design that adapts to different screen sizes
- Touch controls for mobile with Nipple.js (recommended)
- Keyboard controls for desktop

### 2. User Identification
- Simple username entry at game start
- No account creation or authentication required

### 3. Scoring System
- Matches end when either player reaches 11 points
- Players can play multiple matches in a single session
- Composite leaderboard score based on:
  - Points scored by player
  - Point differential (player points minus AI points)
  - Consecutive wins bonus
- AI difficulty increases after wins, with higher difficulties offering score multipliers

### 4. Leaderboard
- Global leaderboard showing top 10 players
- Simple backend storage with Firebase
- No authentication required - just username submission
- Local storage fallback if backend is unavailable

### 5. Progressive AI Difficulty
- AI difficulty increases as players win matches
- Higher difficulties affect AI paddle speed and prediction accuracy
- Balanced challenge that allows skilled players to win while maintaining engagement

### 6. Portal Functionality
- Portal access unlocked after achieving a minimum score of 50
- Portal links to http://portal.pieter.com with required parameters:
  - username: Player's username
  - color: Color representation of player/game
  - speed: Player's movement speed
  - ref: URL of Vibe Pong
- Support for incoming portal users with continuity
- Visual indicator for portal access availability

### 7. Consistent Audio Experience
- Sounds that work reliably on both desktop and mobile (especially iOS)
- Sound effects for:
  - Ball bounces (paddle and wall)
  - Scoring
  - Game start/end
- Sound toggle button that works on all platforms

## Technical Requirements

### Performance
- Near-instant loading experience
- Smooth gameplay at 60fps on modern devices
- Optimized assets and code for mobile performance

### Browser Compatibility
- Support for modern browsers (Chrome, Safari, Firefox, Edge)
- Mobile browser support (iOS Safari, Chrome for Android)

### Code Structure
- Modular, maintainable code architecture
- Separation of concerns (game logic, rendering, audio, input)
- Effective memory management to prevent leaks

## Visual Style
- Maintain current neon/synthwave aesthetic
- Enhance visual polish if time permits after core functionality

## Constraints
- No login or sign-up requirements
- No loading screens
- No heavy downloads
- Must include attribution link for the contest
- Development deadline: Immediate (same day submission)

## Success Metrics
- Successful contest submission
- Playable experience on both desktop and mobile
- Functional leaderboard system
- Working portal integration
- Consistent audio across platforms 