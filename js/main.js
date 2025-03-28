import * as THREE from 'three';

// Game is using regular script imports now, not ES modules

// Constants
const GAME_CONFIG = {
    FIELD: {
        WIDTH: 20,
        HEIGHT: 12,
        DEPTH: 1
    },
    PADDLE: {
        WIDTH: 0.3,
        HEIGHT: 2,
        DEPTH: 0.3,
        SPEED: 0.15
    },
    BALL: {
        RADIUS: 0.5,
        INITIAL_SPEED: 0.12,
        MAX_TRAIL_LENGTH: 15,  // Increased from 10 for longer trail
        TRAIL_OPACITY_STEP: 0.07  // How much to reduce opacity per trail segment
    },
    COLORS: {
        NEON_PINK: new THREE.Color(1, 0.08, 0.58),
        NEON_BLUE: new THREE.Color(0, 0.76, 1),
        NEON_YELLOW: new THREE.Color(1, 0.92, 0),
        BACKGROUND: new THREE.Color(0.01, 0.01, 0.03),
        GRID: new THREE.Color(0.2, 0.2, 0.6)
    }
};

// Game Class
class PongGame {
    constructor() {
        // Audio
        this.sounds = {
            bounce: null,
            score: null,
            wall: null
        };
        this.soundEnabled = true;
        
        // DOM elements
        this.elements = {
            info: null,
            startScreen: null,
            debug: null
        };
        
        // Game state
        this.gameStarted = false;
        this.score = {
            player: 0,
            ai: 0
        };
        this.ballVelocity = new THREE.Vector3(0, 0, 0);
        this.keysPressed = {};
        
        // Three.js setup
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.objects = {
            playerPaddle: null,
            aiPaddle: null,
            ball: null,
            fieldBoundary: null
        };
        this.ballTrail = [];
        
        // Bind methods to maintain 'this' context
        this.init = this.init.bind(this);
        this.animate = this.animate.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        this.onWindowResize = this.onWindowResize.bind(this);
    }
    
    // Initialize the game
    init() {
        try {
            // Get DOM elements
            this.elements.info = document.getElementById('info');
            this.elements.startScreen = document.getElementById('startScreen');
            this.elements.debug = document.getElementById('debug');
            
            this.debug("Initializing game...");
            
            // Add event listener to start button
            const startButton = document.getElementById('startButton');
            if (startButton) {
                startButton.addEventListener('click', () => {
                    this.debug("Play button clicked");
                    this.startGame();
                });
            }
            
            // Add event listener to sound toggle
            const soundToggle = document.getElementById('soundToggle');
            if (soundToggle) {
                soundToggle.addEventListener('change', () => {
                    this.soundEnabled = soundToggle.checked;
                    this.debug("Sound " + (this.soundEnabled ? "enabled" : "disabled"));
                });
                // Initialize sound state from checkbox
                this.soundEnabled = soundToggle.checked;
            }
            
            // Setup touch controls
            this.setupTouchControls();
    
            // Scene setup
            this.scene = new THREE.Scene();
            this.scene.background = GAME_CONFIG.COLORS.BACKGROUND;
            
            // Camera setup
            this.camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 1000);
            this.camera.position.set(0, 8, 20);
            this.camera.lookAt(0, 0, 0);
    
            // Renderer setup
            this.renderer = new THREE.WebGLRenderer({ antialias: true });
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            document.body.appendChild(this.renderer.domElement);

            // Basic setup 
            this.setupBasicScene();
            
            // Load sounds
            this.setupSounds();
            
            // Event listeners
            window.addEventListener('resize', this.onWindowResize);
            window.addEventListener('keydown', this.handleKeyDown);
            window.addEventListener('keyup', this.handleKeyUp);
    
            // Initialize score display
            this.updateScoreDisplay();
    
            // Start animation loop
            this.animate();
            
            this.debug("Scene setup complete");
        } catch (error) {
            this.debug("ERROR in init: " + error.message);
            console.error(error);
        }
    }
    
    // Helper function for debugging
    debug(message) {
        console.log(message);
        if (this.elements.debug) {
            let currentText = this.elements.debug.textContent;
            if (currentText.split('\n').length > 5) {
                currentText = currentText.split('\n').slice(1).join('\n');
            }
            this.elements.debug.textContent = currentText + '\n' + message;
        }
    }

    // Setup audio with a simple audio pool for better performance
    setupSounds() {
        try {
            // Check if the window functions exist from our sound scripts
            if (window.createBounceSound && window.createWallSound && window.createScoreSound) {
                this.debug("Web Audio API sound functions detected");
            } else {
                this.debug("WARNING: Sound functions not found. Sound may not work.");
            }
            
            // Initialize audio context to bypass autoplay restrictions
            try {
                // Just create and start an audio context to enable audio
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                
                // Create a silent oscillator to "warm up" the audio context
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                gainNode.gain.value = 0; // Silent
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                oscillator.start();
                oscillator.stop(audioContext.currentTime + 0.001);
                
                this.audioContext = audioContext;
                this.debug("Audio context initialized");
            } catch (e) {
                this.debug("Audio context initialization failed: " + e.message);
            }
            
        } catch (error) {
            this.debug("WARNING: Could not initialize sounds: " + error.message);
        }
    }
    
    // Play sound with Web Audio API
    playSound(soundType) {
        if (!this.soundEnabled) return;
        
        try {
            // Use the appropriate sound creation function
            switch(soundType) {
                case 'bounce':
                    if (window.createBounceSound) window.createBounceSound();
                    break;
                case 'wall':
                    if (window.createWallSound) window.createWallSound();
                    break;
                case 'score':
                    if (window.createScoreSound) window.createScoreSound();
                    break;
                default:
                    return;
            }
        } catch (error) {
            // Log sound errors
            console.error("Sound error:", error);
            this.debug("Sound error: " + error);
        }
    }

    // Setup touch controls for mobile devices
    setupTouchControls() {
        // Early return if touch is not supported
        if (!('ontouchstart' in window)) return;
        
        this.debug("Setting up touch controls for mobile");
        
        // Track touch position
        let touchY = 0;
        const gameArea = document.body;
        
        // Touch event handlers
        gameArea.addEventListener('touchstart', (event) => {
            event.preventDefault();
            touchY = event.touches[0].clientY;
            
            // Start game on touch if not started
            if (!this.gameStarted) {
                this.startGame();
            }
        });
        
        gameArea.addEventListener('touchmove', (event) => {
            event.preventDefault();
            
            // Get the current touch position
            const currentTouchY = event.touches[0].clientY;
            
            // Determine direction (up or down)
            if (currentTouchY < touchY) {
                // Moving up
                this.keysPressed['touchUp'] = true;
                this.keysPressed['touchDown'] = false;
            } else if (currentTouchY > touchY) {
                // Moving down
                this.keysPressed['touchUp'] = false;
                this.keysPressed['touchDown'] = true;
            }
            
            // Update touch position
            touchY = currentTouchY;
        });
        
        gameArea.addEventListener('touchend', (event) => {
            event.preventDefault();
            // Reset touch controls
            this.keysPressed['touchUp'] = false;
            this.keysPressed['touchDown'] = false;
        });
    }
    
    // Setup the scene with all components
    setupBasicScene() {
        try {
            // Lights
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
            this.scene.add(ambientLight);

            const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
            directionalLight.position.set(10, 10, 10);
            this.scene.add(directionalLight);
            
            // Create game objects
            this.createField();
            this.createPaddles();
            this.createBall();
            
            this.debug("Basic scene set up successfully");
        } catch (error) {
            this.debug("ERROR in setupBasicScene: " + error.message);
            console.error(error);
        }
    }
    
    // Create a mesh with standard configuration
    createMesh(geometry, materialOptions, position, rotation = null) {
        const material = new THREE.MeshStandardMaterial(materialOptions);
        const mesh = new THREE.Mesh(geometry, material);
        
        if (position) {
            mesh.position.copy(position);
        }
        
        if (rotation) {
            mesh.rotation.copy(rotation);
        }
        
        return mesh;
    }
    
    // Create field and boundaries
    createField() {
        try {
            const {WIDTH, HEIGHT} = GAME_CONFIG.FIELD;
            
            // Grid helper for the floor
            const gridHelper = new THREE.GridHelper(WIDTH * 1.5, 20, GAME_CONFIG.COLORS.GRID, GAME_CONFIG.COLORS.GRID);
            gridHelper.position.y = -HEIGHT / 2 - 0.01;
            // Add fog to grid
            const gridMaterial = gridHelper.material;
            gridMaterial.transparent = true;
            gridMaterial.opacity = 0.3;
            this.scene.add(gridHelper);

            // Create floor with darker color and more metallic look
            const floor = this.createMesh(
                new THREE.PlaneGeometry(WIDTH, WIDTH),
                {
                    color: 0x000010,
                    metalness: 0.9,
                    roughness: 0.2,
                    emissive: 0x000010,
                    emissiveIntensity: 0.1
                },
                new THREE.Vector3(0, -HEIGHT / 2, 0),
                new THREE.Euler(-Math.PI / 2, 0, 0)
            );
            this.scene.add(floor);

            // Center line with enhanced glow
            const centerLine = this.createMesh(
                new THREE.BoxGeometry(0.1, HEIGHT, 0.1),
                { 
                    color: GAME_CONFIG.COLORS.NEON_BLUE,
                    transparent: true,
                    opacity: 0.9,
                    emissive: GAME_CONFIG.COLORS.NEON_BLUE,
                    emissiveIntensity: 1.5
                },
                new THREE.Vector3(0, 0, 0)
            );
            // Add glow effect to center line
            const centerGlow = new THREE.Mesh(
                new THREE.BoxGeometry(0.2, HEIGHT, 0.2),
                new THREE.MeshBasicMaterial({
                    color: GAME_CONFIG.COLORS.NEON_BLUE,
                    transparent: true,
                    opacity: 0.4
                })
            );
            centerLine.add(centerGlow);
            this.scene.add(centerLine);

            // Create enhanced border material
            const borderMaterial = new THREE.MeshStandardMaterial({ 
                color: GAME_CONFIG.COLORS.NEON_BLUE,
                transparent: true,
                opacity: 0.9,
                emissive: GAME_CONFIG.COLORS.NEON_BLUE,
                emissiveIntensity: 1.5
            });
            
            // Bottom border with glow
            const bottomBorder = new THREE.Mesh(
                new THREE.BoxGeometry(WIDTH, 0.1, 0.1),
                borderMaterial
            );
            bottomBorder.position.y = -HEIGHT / 2;
            const bottomGlow = new THREE.Mesh(
                new THREE.BoxGeometry(WIDTH, 0.2, 0.2),
                new THREE.MeshBasicMaterial({
                    color: GAME_CONFIG.COLORS.NEON_BLUE,
                    transparent: true,
                    opacity: 0.4
                })
            );
            bottomBorder.add(bottomGlow);
            this.scene.add(bottomBorder);
            
            // Top border with glow
            const topBorder = new THREE.Mesh(
                new THREE.BoxGeometry(WIDTH, 0.1, 0.1),
                borderMaterial
            );
            topBorder.position.y = HEIGHT / 2;
            const topGlow = new THREE.Mesh(
                new THREE.BoxGeometry(WIDTH, 0.2, 0.2),
                new THREE.MeshBasicMaterial({
                    color: GAME_CONFIG.COLORS.NEON_BLUE,
                    transparent: true,
                    opacity: 0.4
                })
            );
            topBorder.add(topGlow);
            this.scene.add(topBorder);
            
            // Enhanced field outline with stronger glow
            const points = [
                new THREE.Vector3(-WIDTH / 2, -HEIGHT / 2, 0),
                new THREE.Vector3(-WIDTH / 2, HEIGHT / 2, 0),
                new THREE.Vector3(WIDTH / 2, HEIGHT / 2, 0),
                new THREE.Vector3(WIDTH / 2, -HEIGHT / 2, 0),
                new THREE.Vector3(-WIDTH / 2, -HEIGHT / 2, 0)
            ];
            
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            this.objects.fieldBoundary = new THREE.Line(
                geometry, 
                new THREE.LineBasicMaterial({ 
                    color: GAME_CONFIG.COLORS.NEON_BLUE, 
                    linewidth: 3,
                    opacity: 0.9,
                    transparent: true
                })
            );
            this.scene.add(this.objects.fieldBoundary);
            
            this.debug("Field created with enhanced visuals");
        } catch (error) {
            this.debug("ERROR in createField: " + error.message);
            console.error(error);
        }
    }
    
    // Create the paddles
    createPaddles() {
        try {
            const {WIDTH, HEIGHT, DEPTH} = GAME_CONFIG.PADDLE;
            const {WIDTH: FIELD_WIDTH, HEIGHT: FIELD_HEIGHT} = GAME_CONFIG.FIELD;
            
            // Player paddle (left side)
            this.objects.playerPaddle = this.createPaddleMesh(
                GAME_CONFIG.COLORS.NEON_BLUE,
                new THREE.Vector3(-FIELD_WIDTH / 2 + 1, 0, 0)
            );
            this.scene.add(this.objects.playerPaddle);
            this.debug("Player paddle created");
            
            // AI paddle (right side)
            this.objects.aiPaddle = this.createPaddleMesh(
                GAME_CONFIG.COLORS.NEON_PINK,
                new THREE.Vector3(FIELD_WIDTH / 2 - 1, 0, 0)
            );
            this.scene.add(this.objects.aiPaddle);
            this.debug("AI paddle created");
        } catch (error) {
            this.debug("ERROR in createPaddles: " + error.message);
            console.error(error);
        }
    }
    
    // Helper method to create paddle with glow effect
    createPaddleMesh(color, position) {
        const {WIDTH, HEIGHT, DEPTH} = GAME_CONFIG.PADDLE;
        
        const paddleGeometry = new THREE.BoxGeometry(WIDTH, HEIGHT, DEPTH);
        const paddleMaterial = new THREE.MeshStandardMaterial({ 
            color: color,
            emissive: color,
            emissiveIntensity: 1.5,
            metalness: 0.5,
            roughness: 0.2
        });
        
        const paddle = new THREE.Mesh(paddleGeometry, paddleMaterial);
        paddle.position.copy(position);
        paddle.rotation.set(0, 0, 0);
        
        // Create a glow object as a child of the paddle
        const paddleGlow = new THREE.Mesh(
            new THREE.BoxGeometry(WIDTH + 0.1, HEIGHT + 0.1, DEPTH + 0.1),
            new THREE.MeshBasicMaterial({
                color: color,
                transparent: true,
                opacity: 0.5
            })
        );
        
        // Add glow as a child of the paddle so it moves with it
        paddle.add(paddleGlow);
        
        return paddle;
    }
    
    // Create the ball
    createBall() {
        try {
            const {RADIUS} = GAME_CONFIG.BALL;
            
            // Ball
            const ballGeometry = new THREE.SphereGeometry(RADIUS, 16, 16);
            const ballMaterial = new THREE.MeshStandardMaterial({ 
                color: GAME_CONFIG.COLORS.NEON_YELLOW,
                emissive: GAME_CONFIG.COLORS.NEON_YELLOW,
                emissiveIntensity: 1.5,
                metalness: 0.8,
                roughness: 0.2
            });
            
            this.objects.ball = new THREE.Mesh(ballGeometry, ballMaterial);
            this.objects.ball.position.set(0, 0, 0);
            
            // Add a glow to the ball as a child object
            const ballGlow = new THREE.Mesh(
                new THREE.SphereGeometry(RADIUS * 1.5, 16, 16),
                new THREE.MeshBasicMaterial({
                    color: GAME_CONFIG.COLORS.NEON_YELLOW,
                    transparent: true,
                    opacity: 0.4
                })
            );
            
            // Create trail group
            this.trailGroup = new THREE.Group();
            this.scene.add(this.trailGroup);
            
            // Store reference and add as child so it moves with the ball
            this.objects.ball.userData.glow = ballGlow;
            this.objects.ball.add(ballGlow);
            
            this.scene.add(this.objects.ball);
            this.debug("Ball created with glow effect and trail");
        } catch (error) {
            this.debug("ERROR in createBall: " + error.message);
            console.error(error);
        }
    }
    
    // Reset the ball to center position
    resetBall() {
        this.debug("Resetting ball");
        
        const {INITIAL_SPEED} = GAME_CONFIG.BALL;
        
        // Clear trail
        this.ballTrail = [];
        while(this.trailGroup && this.trailGroup.children.length > 0) {
            const mesh = this.trailGroup.children[0];
            mesh.geometry.dispose();
            mesh.material.dispose();
            this.trailGroup.remove(mesh);
        }
        
        // Ensure ball is at center position
        if (this.objects.ball) {
            this.objects.ball.position.set(0, 0, 0);
            
            // Random initial direction, but ensure some horizontal movement
            const randomAngle = (Math.random() * Math.PI / 2) - (Math.PI / 4); // -45 to 45 degrees
            const direction = Math.random() > 0.5 ? 1 : -1; // Left or right
            
            this.ballVelocity.x = Math.cos(randomAngle) * INITIAL_SPEED * direction;
            this.ballVelocity.y = Math.sin(randomAngle) * INITIAL_SPEED;
            
            // Make sure ball has significant horizontal movement
            if (Math.abs(this.ballVelocity.x) < 0.05) {
                this.ballVelocity.x = direction * 0.05;
            }
        } else {
            this.debug("ERROR: Ball reference is missing when trying to reset");
            // Create a new ball if it doesn't exist
            this.createBall();
        }
    }
    
    // Handle keyboard events
    handleKeyDown(event) {
        this.keysPressed[event.key] = true;
        
        // Space bar starts the game
        if (event.key === ' ' && !this.gameStarted) {
            this.debug("Space bar pressed - starting game");
            this.startGame();
        }
        
        // Handle accessibility shortcuts
        // 'P' key for pause/play
        if (event.key === 'p' || event.key === 'P') {
            this.togglePause();
        }
    }
    
    handleKeyUp(event) {
        this.keysPressed[event.key] = false;
    }
    
    // Toggle game pause state
    togglePause() {
        if (this.gameStarted) {
            this.gamePaused = !this.gamePaused;
            this.debug("Game " + (this.gamePaused ? "paused" : "resumed"));
            
            // Show pause indicator
            if (this.gamePaused) {
                // Create or show pause overlay
                if (!this.pauseOverlay) {
                    this.createPauseOverlay();
                } else {
                    this.pauseOverlay.style.display = 'flex';
                }
            } else {
                // Hide pause overlay
                if (this.pauseOverlay) {
                    this.pauseOverlay.style.display = 'none';
                }
            }
        }
    }
    
    // Create pause overlay
    createPauseOverlay() {
        this.pauseOverlay = document.createElement('div');
        this.pauseOverlay.style.position = 'absolute';
        this.pauseOverlay.style.top = '0';
        this.pauseOverlay.style.left = '0';
        this.pauseOverlay.style.width = '100%';
        this.pauseOverlay.style.height = '100%';
        this.pauseOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        this.pauseOverlay.style.color = 'white';
        this.pauseOverlay.style.fontSize = '32px';
        this.pauseOverlay.style.display = 'flex';
        this.pauseOverlay.style.alignItems = 'center';
        this.pauseOverlay.style.justifyContent = 'center';
        this.pauseOverlay.style.zIndex = '40';
        this.pauseOverlay.style.fontFamily = 'Orbitron, sans-serif';
        this.pauseOverlay.textContent = 'PAUSED';
        
        document.body.appendChild(this.pauseOverlay);
    }
    
    // Start the game
    startGame() {
        this.debug("Starting game");
        
        // Check if all required objects exist
        if (!this.scene || !this.camera || !this.renderer) {
            this.debug("ERROR: Core Three.js objects missing, reinitializing");
            this.init();
            return;
        }
        
        if (!this.objects.ball) {
            this.debug("Ball missing, creating a new one");
            this.createBall();
        }
        
        if (!this.objects.playerPaddle || !this.objects.aiPaddle) {
            this.debug("Paddles missing, creating new ones");
            this.createPaddles();
        }
        
        this.gameStarted = true;
        this.gamePaused = false;
        this.resetBall();
        this.score.player = 0;
        this.score.ai = 0;
        this.updateScoreDisplay();
        
        // Hide start screen
        if (this.elements.startScreen) {
            this.elements.startScreen.style.display = 'none';
        }
        
        // Create in-game sound toggle
        this.createInGameSoundToggle();
        
        // Play a test sound to enable audio context
        this.playInitialSound();
    }
    
    // Handle window resize
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    // Update paddle positions
    movePaddles() {
        if (!this.objects.playerPaddle || !this.objects.aiPaddle) return;
        
        const {HEIGHT: FIELD_HEIGHT} = GAME_CONFIG.FIELD;
        const {HEIGHT: PADDLE_HEIGHT, SPEED: PADDLE_SPEED} = GAME_CONFIG.PADDLE;
        
        // Player paddle movement
        if ((this.keysPressed['w'] || this.keysPressed['W'] || 
             this.keysPressed['ArrowUp'] || this.keysPressed['touchUp']) && 
            this.objects.playerPaddle.position.y < FIELD_HEIGHT/2 - PADDLE_HEIGHT/2) {
            this.objects.playerPaddle.position.y += PADDLE_SPEED;
        }
        
        if ((this.keysPressed['s'] || this.keysPressed['S'] || 
             this.keysPressed['ArrowDown'] || this.keysPressed['touchDown']) && 
            this.objects.playerPaddle.position.y > -FIELD_HEIGHT/2 + PADDLE_HEIGHT/2) {
            this.objects.playerPaddle.position.y -= PADDLE_SPEED;
        }
        
        // AI paddle movement (simple AI with slight delay/imperfection)
        if (this.gameStarted && this.objects.ball) {
            // Calculate target position with some randomness
            const targetY = this.objects.ball.position.y;
            
            // Move toward ball but with limited speed and some delay
            const aiSpeed = PADDLE_SPEED * 0.7; // Make AI slightly slower than player
            
            // Smooth movement with lerp and a dead zone
            const distanceToTarget = targetY - this.objects.aiPaddle.position.y;
            const deadZone = 0.2; // Don't move if ball is very close to paddle's y position
            
            if (Math.abs(distanceToTarget) > deadZone) {
                // Move paddle smoothly toward target with a speed proportional to distance
                const direction = distanceToTarget > 0 ? 1 : -1;
                const moveAmount = Math.min(aiSpeed, Math.abs(distanceToTarget) * 0.1);
                
                // Check boundaries
                const newY = this.objects.aiPaddle.position.y + (moveAmount * direction);
                if (newY > -FIELD_HEIGHT/2 + PADDLE_HEIGHT/2 && 
                    newY < FIELD_HEIGHT/2 - PADDLE_HEIGHT/2) {
                    this.objects.aiPaddle.position.y = newY;
                }
            }
        }
    }
    
    // Update ball position
    moveBall() {
        if (!this.gameStarted || !this.objects.ball || this.gamePaused) return;
        
        const {MAX_TRAIL_LENGTH, RADIUS, TRAIL_OPACITY_STEP} = GAME_CONFIG.BALL;
        
        // Clear old trail meshes
        while(this.trailGroup.children.length > 0) {
            const mesh = this.trailGroup.children[0];
            mesh.geometry.dispose();
            mesh.material.dispose();
            this.trailGroup.remove(mesh);
        }
        
        // Add current position to trail
        if (this.ballTrail.length >= MAX_TRAIL_LENGTH) {
            this.ballTrail.shift();
        }
        
        // Add current position
        this.ballTrail.push(this.objects.ball.position.clone());
        
        // Create trail segments
        for (let i = 0; i < this.ballTrail.length - 1; i++) {
            const start = this.ballTrail[i];
            const end = this.ballTrail[i + 1];
            
            // Calculate opacity based on position in trail
            const opacity = (i / this.ballTrail.length) * 0.5;
            
            // Create trail segment
            const trailMaterial = new THREE.MeshBasicMaterial({
                color: GAME_CONFIG.COLORS.NEON_YELLOW,
                transparent: true,
                opacity: opacity
            });
            
            // Create a sphere at each trail position with decreasing size
            const scaleFactor = 0.8 + (i / this.ballTrail.length) * 0.2;
            const trailGeometry = new THREE.SphereGeometry(RADIUS * scaleFactor, 8, 8);
            const trailMesh = new THREE.Mesh(trailGeometry, trailMaterial);
            trailMesh.position.copy(start);
            
            this.trailGroup.add(trailMesh);
        }
        
        // Update ball position
        this.objects.ball.position.add(this.ballVelocity);
        
        // Update ball glow (pulse effect)
        if (this.objects.ball.userData.glow) {
            const pulse = Math.sin(Date.now() * 0.005) * 0.3 + 0.7;
            this.objects.ball.userData.glow.scale.set(pulse, pulse, pulse);
        }
        
        // Check for collisions
        this.checkCollisions();
        
        // Check for scoring
        this.checkScoring();
    }
    
    // Check for ball collisions
    checkCollisions() {
        if (!this.objects.ball) return;
        
        const {RADIUS} = GAME_CONFIG.BALL;
        const {HEIGHT: FIELD_HEIGHT} = GAME_CONFIG.FIELD;
        const {WIDTH: PADDLE_WIDTH, HEIGHT: PADDLE_HEIGHT} = GAME_CONFIG.PADDLE;
        
        // Store previous position for improved collision detection
        const prevX = this.objects.ball.position.x - this.ballVelocity.x;
        
        // Top and bottom walls
        if (this.objects.ball.position.y + RADIUS > FIELD_HEIGHT/2 || 
            this.objects.ball.position.y - RADIUS < -FIELD_HEIGHT/2) {
            
            this.ballVelocity.y *= -1;
            
            // Keep ball within bounds
            if (this.objects.ball.position.y + RADIUS > FIELD_HEIGHT/2) {
                this.objects.ball.position.y = FIELD_HEIGHT/2 - RADIUS;
            } else {
                this.objects.ball.position.y = -FIELD_HEIGHT/2 + RADIUS;
            }
            
            // Play wall hit sound
            this.playSound('wall');
        }
        
        if (!this.objects.playerPaddle || !this.objects.aiPaddle) return;
        
        // Paddle collisions with improved detection
        this.checkPaddleCollision(
            this.objects.playerPaddle, 
            prevX, 
            1  // Direction modifier for player paddle (right side of paddle)
        );
        
        this.checkPaddleCollision(
            this.objects.aiPaddle, 
            prevX, 
            -1  // Direction modifier for AI paddle (left side of paddle)
        );
    }
    
    // Helper method to check paddle collision
    checkPaddleCollision(paddle, prevX, directionModifier) {
        const {RADIUS} = GAME_CONFIG.BALL;
        const {WIDTH: PADDLE_WIDTH, HEIGHT: PADDLE_HEIGHT} = GAME_CONFIG.PADDLE;
        
        const ball = this.objects.ball;
        const halfPaddleWidth = PADDLE_WIDTH / 2;
        const halfPaddleHeight = PADDLE_HEIGHT / 2;
        
        // Determine collision side based on direction modifier
        const ballSide = directionModifier > 0 ? -1 : 1; // -1 for left side of ball, 1 for right side
        const paddleSide = directionModifier; // 1 for right side of paddle, -1 for left side
        
        // Check if ball collides with paddle
        if ((ballSide === -1 && ball.position.x - RADIUS <= paddle.position.x + halfPaddleWidth && 
             prevX - RADIUS > paddle.position.x + halfPaddleWidth) || 
            (ballSide === 1 && ball.position.x + RADIUS >= paddle.position.x - halfPaddleWidth && 
             prevX + RADIUS < paddle.position.x - halfPaddleWidth)) {
            
            // Check vertical collision
            if (ball.position.y + RADIUS >= paddle.position.y - halfPaddleHeight && 
                ball.position.y - RADIUS <= paddle.position.y + halfPaddleHeight) {
                
                // Calculate bounce angle based on where ball hits the paddle
                const relativeIntersectY = (paddle.position.y - ball.position.y) / halfPaddleHeight;
                const bounceAngle = relativeIntersectY * (Math.PI/4); // Max angle: 45 degrees
                
                // Increase ball speed slightly on each hit
                const speed = Math.sqrt(
                    this.ballVelocity.x * this.ballVelocity.x + 
                    this.ballVelocity.y * this.ballVelocity.y
                ) + 0.01;
                
                // Set new velocity based on direction
                this.ballVelocity.x = paddleSide * Math.abs(Math.cos(bounceAngle) * speed);
                this.ballVelocity.y = Math.sin(bounceAngle) * speed * -1;
                
                // Place ball just after/before the paddle to prevent sticking
                ball.position.x = paddle.position.x + (paddleSide * (halfPaddleWidth + RADIUS + 0.01));
                
                // Play bounce sound
                this.playSound('bounce');
            }
        }
    }
    
    // Check if a player scored
    checkScoring() {
        if (!this.objects.ball) return;
        
        const {WIDTH: FIELD_WIDTH} = GAME_CONFIG.FIELD;
        
        // Ball past player paddle (AI scores)
        if (this.objects.ball.position.x < -FIELD_WIDTH/2 - 1) {
            this.score.ai++;
            this.debug(`AI scores! Score: ${this.score.player}-${this.score.ai}`);
            this.updateScoreDisplay();
            this.playSound('score');
            this.resetBall();
        }
        
        // Ball past AI paddle (player scores)
        if (this.objects.ball.position.x > FIELD_WIDTH/2 + 1) {
            this.score.player++;
            this.debug(`Player scores! Score: ${this.score.player}-${this.score.ai}`);
            this.updateScoreDisplay();
            this.playSound('score');
            this.resetBall();
        }
    }
    
    // Update the score display
    updateScoreDisplay() {
        if (this.elements.info) {
            this.elements.info.textContent = `${this.score.player} : ${this.score.ai}`;
        }
    }
    
    // Animation loop
    animate() {
        requestAnimationFrame(this.animate);
        
        try {
            // Debug indicator in console sparingly
            if (this.gameStarted && this.objects.ball && Math.random() < 0.005) {
                this.debug(`Ball: (${this.objects.ball.position.x.toFixed(1)}, ${this.objects.ball.position.y.toFixed(1)})`);
            }
            
            // Update game objects
            this.movePaddles();
            this.moveBall();
            
            // Add a subtle pulse to the field boundary for visibility
            if (this.objects.fieldBoundary && this.gameStarted) {
                const pulse = Math.sin(Date.now() * 0.002) * 0.3 + 0.7; // Reduced pulse range for subtler effect
                this.objects.fieldBoundary.material.opacity = 0.7 + pulse * 0.3;
            }
            
            // Gentle camera sway only if game has started
            if (this.gameStarted && !this.gamePaused) {
                const swayAmount = 0.4; // Reduced sway
                this.camera.position.x = Math.sin(Date.now() * 0.0002) * swayAmount;
                this.camera.lookAt(0, 0, 0);
            }
            
            // Render scene
            this.renderer.render(this.scene, this.camera);
        } catch (error) {
            this.debug("ERROR in animate: " + error.message);
            console.error(error);
        }
    }
    
    // Create sound toggle for the main game panel
    createInGameSoundToggle() {
        // Check if it already exists
        if (document.getElementById('inGameSoundToggle')) return;
        
        // Create container
        const soundToggleContainer = document.createElement('div');
        soundToggleContainer.id = 'inGameSoundToggleContainer';
        soundToggleContainer.style.position = 'absolute';
        soundToggleContainer.style.top = '10px';
        soundToggleContainer.style.left = '10px';
        soundToggleContainer.style.zIndex = '25';
        soundToggleContainer.style.display = 'flex';
        soundToggleContainer.style.alignItems = 'center';
        soundToggleContainer.style.background = 'rgba(0, 0, 0, 0.5)';
        soundToggleContainer.style.padding = '5px 10px';
        soundToggleContainer.style.borderRadius = '5px';
        
        // Create label
        const soundLabel = document.createElement('label');
        soundLabel.style.display = 'flex';
        soundLabel.style.alignItems = 'center';
        soundLabel.style.cursor = 'pointer';
        soundLabel.style.color = 'white';
        soundLabel.style.fontFamily = 'Orbitron, sans-serif';
        soundLabel.style.fontSize = '14px';
        
        // Create text
        const soundText = document.createElement('span');
        soundText.textContent = 'Sound';
        soundText.style.marginRight = '8px';
        
        // Create checkbox
        const soundCheckbox = document.createElement('input');
        soundCheckbox.type = 'checkbox';
        soundCheckbox.id = 'inGameSoundToggle';
        soundCheckbox.checked = this.soundEnabled;
        soundCheckbox.style.cursor = 'pointer';
        
        // Add event listener
        soundCheckbox.addEventListener('change', () => {
            this.soundEnabled = soundCheckbox.checked;
            
            // Update the start screen toggle too
            const startScreenToggle = document.getElementById('soundToggle');
            if (startScreenToggle) {
                startScreenToggle.checked = this.soundEnabled;
            }
            
            // Play a test sound if enabled
            if (this.soundEnabled) {
                this.playInitialSound();
            }
            
            this.debug("Sound " + (this.soundEnabled ? "enabled" : "disabled"));
        });
        
        // Assemble the elements
        soundLabel.appendChild(soundText);
        soundLabel.appendChild(soundCheckbox);
        soundToggleContainer.appendChild(soundLabel);
        
        // Add to document
        document.body.appendChild(soundToggleContainer);
    }
    
    // Play an initial sound to enable audio context in browsers
    playInitialSound() {
        if (!this.soundEnabled) return;
        
        try {
            // Try to resume/activate the audio context if we have one
            if (this.audioContext && this.audioContext.state === 'suspended') {
                this.audioContext.resume().then(() => {
                    this.debug("Audio context resumed");
                    // Play a test sound
                    this.playSound('bounce');
                }).catch(err => {
                    this.debug("Audio context resume failed: " + err);
                });
            } else {
                // Create a new audio context if we don't have one
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                this.audioContext = audioContext;
                
                // Play a test sound
                this.playSound('bounce');
            }
        } catch (error) {
            this.debug("Audio context initialization error: " + error);
            console.warn("Audio context error:", error);
        }
    }
}

// Wait for document to be fully loaded before initializing
window.onload = function() {
    const game = new PongGame();
    game.init();
};