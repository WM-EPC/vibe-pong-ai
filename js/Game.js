import { PADDLE_SENSITIVITY, BALL_SPEED, PADDLE_SPEED, SCORE_LIMIT, COURT_SCALE } from './config.js';
import { audioSystem } from './audio.js';

export default class Game {
    constructor() {
        // Initialize audio
        audioSystem.init();
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
            audioSystem.playSound('score');
            this.resetBall(1);
            this.updateScoreDisplay();
            this.checkGameOver();
        }
        
        // Ball went past player 2's paddle (right side)
        if (ballX > courtWidth / 2 + this.ball.radius) {
            this.player1Score++;
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
        audioSystem.toggle();
    }
} 