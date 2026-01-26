import { BaseGameScene } from '../BaseGameScene.js';
import { Paddle } from '../../entities/Paddle.js';
import { Puck } from '../../entities/Puck.js';

export class Stage11 extends BaseGameScene {
    constructor() {
        super('Stage11');
        this.bossHP = 20;
        this.maxHP = 20;
        this.hearts = [];
    }

    create() {
        this.bossHP = 20;
        this.hearts = [];
        super.create();

        // Boss Wall: 1/4th width of opponent side
        // Opponent side is baseW/2 to baseW
        // 1/4th of that is (baseW/2) / 4 = baseW/8
        // Let's place it at the goal line area or slightly in front
        const wallW = this.baseW / 8;
        const wallH = this.fieldH;
        const wallX = this.baseW - wallW / 2 - 50; // 50px offset from right wall
        const wallY = this.fieldY + wallH / 2;

        this.bossWall = this.add.container(wallX, wallY);

        // Visual base
        this.bossRect = this.add.rectangle(0, 0, wallW, wallH, 0x555555).setStrokeStyle(4, 0x000000);
        this.bossWall.add(this.bossRect);

        // Cracks (initially invisible)
        this.cracks = this.add.graphics();
        this.bossWall.add(this.cracks);

        // Physics
        this.physics.add.existing(this.bossWall);
        this.bossWall.body.setImmovable(true);
        this.bossWall.body.setSize(wallW, wallH);
        this.bossWall.body.setOffset(-wallW / 2, -wallH / 2); // Center body on container

        // Collision with Puck
        this.physics.add.collider(this.puck.sprite, this.bossWall, (puck, wall) => this.hitBoss(puck, wall));

        this.setupHeartUI();
    }

    setupEntities() {
        const centerY = this.fieldY + this.fieldH / 2;
        this.p1SpawnX = 100 * this.scaleFactor;
        this.p1SpawnY = centerY;
        // No P2 spawn needed

        this.paddle1 = new Paddle(this, this.p1SpawnX, this.p1SpawnY, this.PADDLE_RADIUS, 0xff0000, 0xffaaaa, 'p1');
        this.paddle2 = null; // Ensure P2 is gone

        this.createPuck();
    }

    setupHeartUI() {
        // SNES Zelda Style: 2 rows of 10
        const startX = this.baseW - 250;
        const startY = 80;
        const spacingX = 22;
        const spacingY = 22;

        // Generate Heart Texture if not exists
        if (!this.textures.exists('heart_pixel')) {
            const g = this.make.graphics({ add: false });
            g.fillStyle(0xff0000);
            // Simple pixel heart
            g.fillRect(2, 0, 2, 2); g.fillRect(6, 0, 2, 2);
            g.fillRect(0, 2, 10, 4);
            g.fillRect(2, 6, 6, 2);
            g.fillRect(4, 8, 2, 2);
            g.generateTexture('heart_pixel', 10, 10);

            // Empty heart
            g.clear();
            g.lineStyle(1, 0xffffff);
            g.strokeRect(0, 0, 10, 10);
            g.generateTexture('heart_empty', 10, 10);
            g.destroy();
        }

        for (let i = 0; i < this.maxHP; i++) {
            const row = Math.floor(i / 10);
            const col = i % 10;
            const x = startX + col * spacingX;
            const y = startY + row * spacingY;

            const heart = this.add.sprite(x, y, 'heart_pixel').setScale(1.5).setScrollFactor(0);
            this.hearts.push(heart);
        }
    }

    hitBoss(puck, wall) {
        if (this.bossHP <= 0) return;

        this.bossHP--;
        this.updateHearts();
        this.drawCracks();

        // Flash boss
        this.tweens.add({
            targets: this.bossRect,
            fillAlpha: 0.5,
            duration: 50,
            yoyo: true
        });

        if (this.bossHP <= 0) {
            this.defeatBoss();
        }
    }

    updateHearts() {
        for (let i = 0; i < this.hearts.length; i++) {
            if (i >= this.bossHP) {
                this.hearts[i].setTexture('heart_empty');
                this.hearts[i].setAlpha(0.3);
            }
        }
    }

    drawCracks() {
        this.cracks.clear();
        const hpPercent = this.bossHP / this.maxHP;
        if (hpPercent > 0.75) return;

        this.cracks.lineStyle(2, 0x000000, 0.5);

        const wallW = this.baseW / 8;
        const wallH = this.fieldH;

        if (hpPercent <= 0.75) {
            // Light cracks
            this.cracks.lineBetween(-wallW / 2, -wallH / 4, wallW / 4, -wallH / 3);
            this.cracks.lineBetween(wallW / 4, wallH / 3, -wallW / 4, wallH / 2);
        }
        if (hpPercent <= 0.5) {
            // Medium cracks
            this.cracks.lineBetween(0, -wallH / 2, wallW / 2, 0);
            this.cracks.lineBetween(-wallW / 2, 0, 0, wallH / 2);
        }
        if (hpPercent <= 0.25) {
            // Heavy cracks
            this.cracks.lineBetween(-wallW / 2, -wallH / 2, wallW / 2, wallH / 2);
            this.cracks.lineBetween(wallW / 2, -wallH / 2, -wallW / 2, wallH / 2);
        }
    }

    defeatBoss() {
        this.matchEnded = true;
        this.score1 = 3; // Immediate win score

        // Destroy wall effect
        this.tweens.add({
            targets: this.bossWall,
            scale: 2,
            alpha: 0,
            duration: 800,
            ease: 'Power2',
            onComplete: () => {
                this.bossWall.destroy();
                this.bossHP = 0;
            }
        });

        // Effect
        this.createFireworks(this.bossWall.x, this.bossWall.y);

        // Victory transition
        this.showScoreText('p1');
        this.time.delayedCall(1500, () => {
            this.scene.start('ResultScene', {
                mode: this.gameMode,
                stage: this.stageNum,
                score1: this.score1,
                score2: this.score2
            });
        });
    }

    checkGoals() {
        // Block scoring until boss is dead
        if (this.bossHP > 0) {
            // Only P1 can have a goal against them? No, let's just block P2 goal
            const threshold = this.puck.radius + 30;
            if (this.puck.x > this.baseW - threshold) {
                // Return puck? Or just collide?
                // The wall itself handles collision. 
                // But if the wall is destroyed, we allow normal checkGoals
                return;
            }
        }
        super.checkGoals();
    }
}
