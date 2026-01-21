import { BaseGameScene } from '../BaseGameScene.js';
import { Puck } from '../../entities/Puck.js';
import { Persistence } from '../../persistence.js';

export class Stage6 extends BaseGameScene {
    constructor() { super('Stage6'); }

    configureField() {
        // Standard Field (Clone of Stage 1)
        this.scaleFactor = 1;
        this.fieldY = 0;
        this.fieldH = 800;
        this.GOAL_SIZE = 200;
        this.PADDLE_RADIUS = 30;
    }

    create() {
        super.create();
    }

    createPuck() {
        // Create group for goal checking interaction
        this.pucks = this.physics.add.group();

        // 1. Puck 1 (Top 1/3)
        // Y = Top + 1/3 Height
        const y1 = this.fieldY + (this.fieldH / 3);
        this.puck1 = new Puck(this, this.baseW / 2, y1, 20 * this.scaleFactor);
        this.pucks.add(this.puck1.sprite);
        this.puck1.sprite.body.setBounce(0.9);
        this.puck1.sprite.body.setCollideWorldBounds(true);

        // 2. Puck 2 (Bottom 2/3)
        // Y = Top + 2/3 Height
        const y2 = this.fieldY + (this.fieldH * 2 / 3);
        this.puck2 = new Puck(this, this.baseW / 2, y2, 20 * this.scaleFactor);
        this.pucks.add(this.puck2.sprite);
        this.puck2.sprite.body.setBounce(0.9);
        this.puck2.sprite.body.setCollideWorldBounds(true);

        // Setup individual stable colliders (Sprite vs Sprite) matching Stage 1
        // Puck 1
        this.physics.add.collider(this.puck1.sprite, this.paddle1.sprite, (p, pad) => this.hitPaddle(p, pad));
        this.physics.add.collider(this.puck1.sprite, this.paddle2.sprite, (p, pad) => this.hitPaddle(p, pad));

        // Puck 2
        this.physics.add.collider(this.puck2.sprite, this.paddle1.sprite, (p, pad) => this.hitPaddle(p, pad));
        this.physics.add.collider(this.puck2.sprite, this.paddle2.sprite, (p, pad) => this.hitPaddle(p, pad));

        // Puck vs Puck
        this.physics.add.collider(this.puck1.sprite, this.puck2.sprite);
    }

    // Override goal checks to handle multiple pucks
    checkGoals() {
        if (!this.pucks) return;

        const goalY = this.fieldY + this.fieldH / 2;
        const goalH = this.GOAL_SIZE;

        this.pucks.children.iterate((puckSprite) => {
            if (!puckSprite || !puckSprite.active) return;

            // Standard Goal Logic
            // Check P2 Goal (Left side) x < 50
            if (puckSprite.x < 50 && Math.abs(puckSprite.y - goalY) < goalH / 2 + 20) {
                this.onGoal('p2');
            }
            // Check P1 Goal (Right side)
            else if (puckSprite.x > this.baseW - 50 && Math.abs(puckSprite.y - goalY) < goalH / 2 + 20) {
                this.onGoal('p1');
            }
        });
    }

    // Override resetRound to REUSE pucks instead of destroying them
    resetRound(loserSide) {
        // Reset Player Position (Standard)
        const centerY = this.fieldY + this.fieldH / 2;
        this.paddle1.reset(100 * this.scaleFactor, centerY);
        this.paddle2.reset(this.baseW - 100 * this.scaleFactor, centerY);

        // REUSE Pucks to equidistant positions
        // Puck 1 -> Top 1/3
        this.puck1.reset(this.baseW / 2, this.fieldY + (this.fieldH / 3));

        // Puck 2 -> Bottom 2/3
        this.puck2.reset(this.baseW / 2, this.fieldY + (this.fieldH * 2 / 3));

        this.matchEnded = false;
    }

    // Force kick for fast bounce (Solving "Glued" issue)
    hitPaddle(puckSprite, paddleSprite) {
        if (!puckSprite.body.collideWorldBounds) puckSprite.body.setCollideWorldBounds(true);

        const angle = Phaser.Math.Angle.Between(paddleSprite.x, paddleSprite.y, puckSprite.x, puckSprite.y);
        // Force a kick regardless of current speed. 
        // 800 is faster than paddle (600) but controllable.
        this.physics.velocityFromRotation(angle, 800 * this.scaleFactor, puckSprite.body.velocity);
    }

    // AI Logic (Target closest)
    handleAI() {
        if (this.gameMode !== '1p') return;

        // Find closest puck
        let closestPuck = null;
        let minDist = Infinity;

        // Check Puck 1
        const d1 = Phaser.Math.Distance.Between(this.paddle2.x, this.paddle2.y, this.puck1.x, this.puck1.y);
        minDist = d1;
        closestPuck = this.puck1;

        // Check Puck 2
        const d2 = Phaser.Math.Distance.Between(this.paddle2.x, this.paddle2.y, this.puck2.x, this.puck2.y);
        if (d2 < minDist) {
            minDist = d2;
            closestPuck = this.puck2;
        }

        if (closestPuck) {
            // Target Safe Movement (Don't hump wall)
            const safeX = Math.min(closestPuck.x, this.baseW * 0.85);
            this.physics.moveTo(this.paddle2.sprite, safeX, closestPuck.y, 300 * this.scaleFactor);
        } else {
            // Return to idle
            this.physics.moveTo(this.paddle2.sprite, this.baseW * 0.85, this.fieldH / 2, 200 * this.scaleFactor);
        }
    }
}
