import { BaseGameScene } from '../BaseGameScene.js';
import { Puck } from '../../entities/Puck.js';
import { Persistence } from '../../persistence.js';

export class Stage13 extends BaseGameScene {
    constructor() {
        super('Stage13');
        this.lastFireP1 = 0;
        this.lastFireP2 = 0;
        this.fireCooldown = 500;
        this.pucks = [];
    }

    create() {
        // Initialize groups BEFORE super.create() because super.create() calls resetEntities()
        this.pucksGroup = this.physics.add.group();
        this.lasers = this.add.group();
        this.pucks = [];

        super.create();

        this.addExistingPuck(this.puck);

        // Dynamic overlap check
        this.physics.add.overlap(this.lasers, this.pucksGroup, (laser, puckSprite) => {
            this.handleLaserHit(laser, puckSprite);
        });

        // Disco Ball
        this.discoBall = this.add.container(this.baseW / 2, 60);
        const globe = this.add.circle(0, 0, 50, 0xaaaaaa).setStrokeStyle(3, 0xffffff);
        this.discoBall.add(globe);

        // Shiny bits
        for (let i = 0; i < 20; i++) {
            const r = 35;
            const ang = (i / 20) * Math.PI * 2;
            const bit = this.add.rectangle(Math.cos(ang) * r, Math.sin(ang) * r, 10, 10, 0xffffff);
            this.discoBall.add(bit);
        }

        // UI
        this.instructionsText = this.add.text(this.baseW / 2, this.baseH - 50, 'FIRST TO 50 GOALS! LASERS AUTO-FIRE!', {
            fontSize: '24px', fill: '#00ffff'
        }).setOrigin(0.5);
    }

    updatePaddleAI(paddle, aiSpeed) {
        if (this.pucks.length === 0) return;

        // Find nearest puck
        let nearestPuck = null;
        let minDist = Infinity;
        this.pucks.forEach(p => {
            const d = Phaser.Math.Distance.Between(paddle.x, paddle.y, p.x, p.y);
            if (d < minDist) {
                minDist = d;
                nearestPuck = p;
            }
        });

        if (!nearestPuck) return;

        // Standard AI logic but targeting the nearest puck
        const dist = Phaser.Math.Distance.Between(paddle.x, paddle.y, nearestPuck.x, nearestPuck.y);
        let isStuck = false;

        if (dist < paddle.radius * 1.5) {
            if (paddle.side === 'p2' && nearestPuck.x > paddle.x) isStuck = true;
            if (paddle.side === 'p1' && nearestPuck.x < paddle.x) isStuck = true;
        }

        if (isStuck) {
            const retreatX = (paddle.side === 'p1') ? (this.baseW * 0.15) : (this.baseW * 0.85);
            const retreatY = this.fieldY + this.fieldH / 2;
            this.physics.moveTo(paddle.sprite, retreatX, retreatY, aiSpeed * 0.7);
        } else {
            // Predict slightly ahead
            const targetX = nearestPuck.x;
            const targetY = nearestPuck.y;
            this.physics.moveTo(paddle.sprite, targetX, targetY, aiSpeed);
        }
    }

    addExistingPuck(puckObj) {
        this.pucks.push(puckObj);
        this.pucksGroup.add(puckObj.sprite);
        puckObj.sprite.body.setCollideWorldBounds(true);
        puckObj.sprite.body.setBounce(0.95, 0.95); // Slightly higher bounce for disco chaos

        // Ensure standard puck collision with paddles
        this.physics.add.collider(puckObj.sprite, this.paddle1.sprite, (p, pad) => this.hitPaddle(p, pad));
        this.physics.add.collider(puckObj.sprite, this.paddle2.sprite, (p, pad) => this.hitPaddle(p, pad));
    }

    update(time, delta) {
        if (this.matchEnded || this.isPaused || this.isWaitingForStart) return;
        super.update(time, delta);

        // Sanity Check: Keep pucks in field if they somehow escape world bounds
        this.pucks.forEach(p => {
            if (p.y < this.fieldY) { p.y = this.fieldY + 5; p.body.setVelocityY(Math.abs(p.body.velocity.y)); }
            if (p.y > this.fieldY + this.fieldH) { p.y = this.fieldY + this.fieldH - 5; p.body.setVelocityY(-Math.abs(p.body.velocity.y)); }
        });

        // Disco Rotation
        this.discoBall.angle += 2;
        this.discoBall.list.forEach((obj, i) => {
            if (i > 0) obj.setAlpha(0.5 + Math.sin(time / 100 + i) * 0.5);
        });

        // Auto-Firing Logic
        if (time > this.lastFireP1 + this.fireCooldown) {
            this.fireLaser('p1');
            this.lastFireP1 = time;
        }
        if (time > this.lastFireP2 + this.fireCooldown) {
            this.fireLaser('p2');
            this.lastFireP2 = time;
        }

        // Cleanup lasers
        this.lasers.getChildren().forEach(laser => {
            if (laser.x < 0 || laser.x > this.baseW) laser.destroy();
        });

        // Respawn if zero pucks
        if (this.pucks.length === 0 && !this.matchEnded) {
            const newP = new Puck(this, this.baseW / 2, this.fieldY + this.fieldH / 2, 20);
            this.addExistingPuck(newP);
            newP.body.setVelocity(Phaser.Math.Between(-300, 300), Phaser.Math.Between(-300, 300));
        }
    }

    fireLaser(playerId) {
        const paddle = (playerId === 'p1') ? this.paddle1 : this.paddle2;
        const color = (playerId === 'p1') ? 0xff0000 : 0x0000ff;
        const dir = (playerId === 'p1') ? 1 : -1;

        const laser = this.add.rectangle(paddle.x + (dir * 40), paddle.y, 15, 3, color);
        this.physics.add.existing(laser);
        laser.body.setVelocityX(dir * 1200);
        laser.owner = playerId;
        this.lasers.add(laser);

        this.tweens.add({
            targets: laser,
            scaleX: 3,
            duration: 100
        });
    }

    handleLaserHit(laser, puckSprite) {
        // Find the puck object
        const puck = this.pucks.find(p => p.sprite === puckSprite);
        if (!puck) return;

        laser.destroy();

        if (this.pucks.length >= 20) return; // Allow more chaos!

        // Split Puck
        const newPuck = new Puck(this, puck.x, puck.y, puck.radius);
        this.addExistingPuck(newPuck);

        // Random velocity variation
        const angle = puck.body.velocity.angle();
        const speed = Math.max(puck.body.velocity.length(), 200);
        const offset = 0.3;

        puck.body.setVelocity(
            Math.cos(angle + offset) * speed,
            Math.sin(angle + offset) * speed
        );
        newPuck.body.setVelocity(
            Math.cos(angle - offset) * speed,
            Math.sin(angle - offset) * speed
        );

        // Visual Hit Effect
        const flash = this.add.circle(puck.x, puck.y, 40, 0xffffff, 0.8);
        this.tweens.add({
            targets: flash,
            scale: 2,
            alpha: 0,
            duration: 200,
            onComplete: () => flash.destroy()
        });
    }

    onGoal(scorer) {
        if (this.matchEnded) return;

        if (scorer === 'p1') {
            this.score1++;
            this.scoreText1.setText(this.score1);
            Persistence.addCoins(5);
        } else {
            this.score2++;
            this.scoreText2.setText(this.score2);
        }

        // Fireworks at the goal
        this.createFireworks(scorer === 'p1' ? this.baseW : 0, this.fieldY + this.fieldH / 2);

        if (this.score1 >= 50 || this.score2 >= 50) {
            this.matchEnded = true;
            this.showScoreText(scorer);
            this.time.delayedCall(2000, () => {
                this.scene.start('ResultScene', {
                    mode: this.gameMode,
                    stage: this.stageNum,
                    score1: this.score1,
                    score2: this.score2
                });
            });
        }
        // No pause, no reset. Continuous play.
    }

    checkGoals() {
        // Multi-puck goal check
        for (let i = this.pucks.length - 1; i >= 0; i--) {
            const p = this.pucks[i];
            const threshold = p.radius + 15;

            if (p.x < threshold) {
                const goalCenterY = this.goal1Y + this.GOAL_SIZE / 2;
                if (Math.abs(p.y - goalCenterY) < this.GOAL_SIZE / 2 + 10) {
                    this.onGoal('p2');
                    // Bounce back instead of destroy (Stage 13 only)
                    p.sprite.x = threshold + 10;
                    p.body.setVelocityX(Math.abs(p.body.velocity.x) * 1.5 + 100);
                }
            } else if (p.x > this.baseW - threshold) {
                const goalCenterY = this.goal2Y + this.GOAL_SIZE / 2;
                if (Math.abs(p.y - goalCenterY) < this.GOAL_SIZE / 2 + 10) {
                    this.onGoal('p1');
                    // Bounce back instead of destroy (Stage 13 only)
                    p.sprite.x = this.baseW - threshold - 10;
                    p.body.setVelocityX(-(Math.abs(p.body.velocity.x) * 1.5 + 100));
                }
            }
        }
    }

    resetEntities() {
        super.resetEntities();
        if (this.pucks) {
            this.pucks.forEach(p => { if (p !== this.puck) p.sprite.destroy(); });
            this.pucks = [this.puck];
            if (this.pucksGroup) {
                this.pucksGroup.clear();
                this.pucksGroup.add(this.puck.sprite);
            }
        }
        if (this.lasers) this.lasers.clear(true, true);
    }
}
