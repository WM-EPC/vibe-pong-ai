import { PADDLE_SENSITIVITY, BALL_SPEED, PADDLE_SPEED, SCORE_LIMIT, COURT_SCALE } from './config.js';
import { audioSystem } from './audio.js';

export default class Game {
    constructor() {
        console.log('Game class constructor called');
        
        // Initialize audio with better error handling
        try {
            audioSystem.init();
            console.log('Audio system initialized successfully');
        } catch (e) {
            console.error('Failed to initialize audio system:', e);
        }
        
        // Bind methods to this context
        this.startGame = this.startGame.bind(this);
        this.resetGame = this.resetGame.bind(this);
        this.toggleAudio = this.toggleAudio.bind(this);
    }
    
    // Method to start the game
    startGame() {
        console.log('Game.startGame called');
        
        try {
            // Game start logic here
            
            // Play a sound to confirm everything is working
            setTimeout(() => {
                audioSystem.playSound('bounce');
            }, 100);
            
            return true;
        } catch (e) {
            console.error('Error in Game.startGame:', e);
            return false;
        }
    }
    
    // Method to reset the game
    resetGame() {
        console.log('Game.resetGame called');
        
        try {
            // Reset game logic here
            
            return true;
        } catch (e) {
            console.error('Error in Game.resetGame:', e);
            return false;
        }
    }

    checkCollisions() {
        // Check if the ball hits the paddle
        if (ballX - this.ball.radius <= this.player1.x + this.player1.width / 2 &&
            ballX + this.ball.radius >= this.player1.x - this.player1.width / 2 &&
            ballY >= this.player1.y - this.player1.height / 2 &&
            ballY <= this.player1.y + this.player1.height / 2 &&
            this.ball.velocityX < 0) {
            
            // Ball has hit player 1's paddle
            this.ball.velocityX = -this.ball.velocityX;
            this.ball.velocityX *= 1.05; // Speed up slightly
            
            // Play bounce sound
            audioSystem.playSound('bounce');
        }
        
        if (ballX + this.ball.radius >= this.player2.x - this.player2.width / 2 &&
            ballX - this.ball.radius <= this.player2.x + this.player2.width / 2 &&
            ballY >= this.player2.y - this.player2.height / 2 &&
            ballY <= this.player2.y + this.player2.height / 2 &&
            this.ball.velocityX > 0) {
            
            // Ball has hit player 2's paddle
            this.ball.velocityX = -this.ball.velocityX;
            this.ball.velocityX *= 1.05; // Speed up slightly
            
            // Play bounce sound
            audioSystem.playSound('bounce');
        }
        
        // Check if the ball hits the top or bottom wall
        if (ballY + this.ball.radius >= this.courtHeight / 2 || 
            ballY - this.ball.radius <= -this.courtHeight / 2) {
            this.ball.velocityY = -this.ball.velocityY;
            
            // Play wall sound
            audioSystem.playSound('wall');
        }
    }

    checkScore() {
        const ballX = this.ball.position.x;
        const courtWidth = this.courtWidth;
        
        // Ball went past player 1's paddle (left side)
        if (ballX < -courtWidth / 2 - this.ball.radius) {
            this.player2Score++;
            
            // Play score sound directly using audioSystem when AI scores
            // This ensures iOS compatibility by using our reliable audio system
            audioSystem.playSound('score');
            
            this.resetBall(1);
            this.updateScoreDisplay();
            this.checkGameOver();
        }
        
        // Ball went past player 2's paddle (right side)
        if (ballX > courtWidth / 2 + this.ball.radius) {
            this.player1Score++;
            
            // Play victory sound when player scores
            // Use audioSystem directly for better iOS compatibility
            audioSystem.playSound('score');
            
            this.resetBall(-1);
            this.updateScoreDisplay();
            this.checkGameOver();
        }
    }

    enableAudio() {
        audioSystem.toggle(true);
    }

    disableAudio() {
        audioSystem.toggle(false);
    }

    toggleAudio() {
        return audioSystem.toggle();
    }
} 