import { BaseGameScene } from '../BaseGameScene.js';
import { Paddle } from '../../entities/Paddle.js';

export class Stage8 extends BaseGameScene {
    constructor() { super('Stage8'); }

    configureField() {
        this.fieldH = 800;
        this.PADDLE_RADIUS = 30; // Radius for Player 1
        this.bossRadius = 200; // 10x puck radius (20 * 10)
    }

    setupEntities() {
        const centerY = this.fieldY + this.fieldH / 2;
        this.p1SpawnX = 100 * this.scaleFactor;
        this.p1SpawnY = centerY;
        this.p2SpawnX = this.baseW - 200 * this.scaleFactor;
        this.p2SpawnY = centerY;

        // P1 is normal
        this.paddle1 = new Paddle(this, this.p1SpawnX, this.p1SpawnY, this.PADDLE_RADIUS, 0xff0000, 0xffaaaa);

        // P2 is the BOSS: 5 times bigger
        this.paddle2 = new Paddle(this, this.p2SpawnX, this.p2SpawnY, this.bossRadius, 0x0000ff, 0xaaaaff);

        this.createPuck();
    }

    handleAI() {
        if (this.gameMode === '1p' && this.puck) {
            const dist = Phaser.Math.Distance.Between(this.paddle2.x, this.paddle2.y, this.puck.x, this.puck.y);

            // Adjust "stuck" distance for boss size
            let isStuck = false;
            if (dist < this.bossRadius * 1.5) {
                if (this.puck.x > this.paddle2.x) isStuck = true;
            }

            if (isStuck) {
                const retreatX = this.baseW * 0.85;
                const retreatY = this.fieldY + this.fieldH / 2;
                // 2.5 times slower retreat (200 / 2.5 = 80)
                this.physics.moveTo(this.paddle2.sprite, retreatX, retreatY, 80);
            } else {
                // 2.5 times slower chase speed (300 / 2.5 = 120)
                this.physics.moveTo(this.paddle2.sprite, this.puck.x, this.puck.y, 120 * this.scaleFactor);
            }
        }
    }

    update(time, delta) {
        super.update(time, delta);

        // Custom bounds for the boss to keep it on its half correctly
        if (this.restrictField && this.paddle2) {
            if (this.paddle2.x < this.baseW / 2 + this.bossRadius) {
                this.paddle2.x = this.baseW / 2 + this.bossRadius;
                if (this.paddle2.body.velocity.x < 0) this.paddle2.setVelocityX(0);
            }
        }
    }
}
