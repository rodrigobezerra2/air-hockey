import { BaseGameScene } from '../BaseGameScene.js';
import { Paddle } from '../../entities/Paddle.js';

export class Stage5 extends BaseGameScene {
    constructor() { super('Stage5'); }

    configureField() {
        this.scaleFactor = 1;
        this.fieldY = 0;
        this.fieldH = 800;
        this.restrictField = false; // Madness Mode default
    }

    init(data) {
        super.init(data);
        this.isGravityStage = true;
        this.stageNum = 5;
    }

    create() {
        super.create();
        this.generateGloveTexture();
        this.p1CanPunch = true;
        this.p2CanPunch = true;
        this.p1CanPunch = true;
        this.p2CanPunch = true;
        this.activeGloves = [];
        this.physics.world.gravity.y = 1500; // Strong Gravity for boxing
    }

    setupEntities() {
        const startY = this.fieldY + this.fieldH - 50; // Start at bottom

        // Simpler: Call super, then move them.
        super.setupEntities();
        this.paddle1.reset(100 * this.scaleFactor, startY);
        this.paddle2.reset(this.baseW - 100 * this.scaleFactor, startY);

        // Re-enable gravity just in case reset cleared it (it shouldn't, but checks are good)
        if (this.paddle1.sprite.body) this.paddle1.sprite.body.setImmovable(false);
        if (this.paddle2.sprite.body) this.paddle2.sprite.body.setImmovable(false);
    }

    // Override: No Puck
    createPuck() {
        // Do nothing
    }

    update(time, delta) {
        if (this.matchEnded) return;

        // Update Gloves
        this.activeGloves = this.activeGloves.filter(g => g.glove.active);
        this.activeGloves.forEach(g => {
            if (g.owner.active) {
                g.glove.x = g.owner.x + g.offsetX;
                g.glove.y = g.owner.y + g.offsetY;
            }
        });

        // super.handleInput(delta); // We are overriding completely for Stage 5 to map DOWN to Punch
        this.handleInputOverride(delta);
        this.handleAI();
        this.checkGoals();
    }

    handleInputOverride(delta) {
        // Copied & Modified from BaseGameScene
        // P1 Input
        let p1Vx = 0;

        // Keyboard (WASD)
        const left = this.keysWASD.left.isDown;
        const right = this.keysWASD.right.isDown;
        const up = this.keysWASD.up.isDown;
        const down = this.keysWASD.down.isDown;

        if (left) { p1Vx = -600; this.paddle1.facing = -1; }
        else if (right) { p1Vx = 600; this.paddle1.facing = 1; }

        // Jump (Up)
        if (up && this.paddle1.sprite.body.blocked.down) {
            this.paddle1.setVelocityY(-600);
        }

        // Punch (P1) - 'S' key (down)
        // trigger once per press or continuous? User said "pressing down". P1 Punch has cooldown, so continuous check is okay if logic prevents spam
        // We use JustDown for trigger usually, but if user holds it?
        // Let's use JustDown equivalent or check state with cooldown.
        // this.keysWASD.down is Key object
        if (Phaser.Input.Keyboard.JustDown(this.keysWASD.down)) {
            this.tryPunch('p1');
        }

        // Apply Final Velocity P1
        if (!this.paddle1.stunned) this.paddle1.setVelocityX(p1Vx);

        // P2 Input (Arrows)
        if (this.gameMode === '2p') {
            let p2Vx = 0;
            if (this.cursors.left.isDown) p2Vx = -600;
            else if (this.cursors.right.isDown) p2Vx = 600;

            if (this.cursors.up.isDown && this.paddle2.sprite.body.blocked.down) {
                this.paddle2.setVelocityY(-600);
            }

            // Punch (P2) - Arrow Down
            if (Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
                this.tryPunch('p2');
            }

            if (!this.paddle2.stunned) this.paddle2.setVelocityX(p2Vx);
        }
    }


    handleAI() {
        // Boxing AI
        if (this.gameMode !== '1p') return;

        const dist = Phaser.Math.Distance.Between(this.paddle2.x, this.paddle2.y, this.paddle1.x, this.paddle1.y);
        if (this.paddle2.x < this.paddle1.x - 60) { this.paddle2.setVelocity(200, 0); }
        else if (this.paddle2.x > this.paddle1.x + 60) { this.paddle2.setVelocity(-200, 0); }
        else {
            this.paddle2.setVelocity(0, 0);
            if (this.p2CanPunch) this.tryPunch('p2');
        }
    }

    checkGoals() {
        // Check if PLAYERS are in goal (Stage 4+ goals are at BOTTOM)
        const goalY = this.fieldY + this.fieldH - 100; // Bottom Center
        if (this.paddle1.x < 50 && Math.abs(this.paddle1.y - goalY) < 120) this.onGoal('p2');
        if (this.paddle2.x > this.baseW - 50 && Math.abs(this.paddle2.y - goalY) < 120) this.onGoal('p1');
    }

    tryPunch(playerKey) {
        if (playerKey === 'p1' && this.p1CanPunch) {
            this.p1CanPunch = false;
            this.executePunch(this.paddle1, this.paddle1.facing, this.paddle2.sprite);
            this.time.delayedCall(1000, () => this.p1CanPunch = true);
        } else if (playerKey === 'p2' && this.p2CanPunch) {
            this.p2CanPunch = false;
            this.executePunch(this.paddle2, -1, this.paddle1.sprite); // AI always faces Left (-1) roughly
            this.time.delayedCall(1000, () => this.p2CanPunch = true);
        }
    }

    executePunch(attacker, facing, victimSprite) {
        const offX = facing * 70;
        const glove = this.physics.add.image(attacker.x + offX, attacker.y, 'glove');
        glove.body.setAllowGravity(false);
        if (facing === -1) glove.setFlipX(true);

        this.activeGloves.push({ glove, owner: attacker, offsetX: offX, offsetY: 0 });

        let hit = false;
        this.physics.add.overlap(glove, victimSprite, () => {
            if (!hit) {
                hit = true;
                const victimPaddle = (victimSprite === this.paddle1.sprite) ? this.paddle1 : this.paddle2;

                // Knockback
                // Apply Velocity FIRST, then Stun (otherwise Paddle class ignores setVelocity)
                // Reduced by 40% (1200 -> 720, -600 -> -360)
                victimPaddle.setVelocity(facing * 720, -360);
                victimPaddle.stunned = true;

                this.time.delayedCall(500, () => victimPaddle.stunned = false);
            }
        });
        this.time.delayedCall(500, () => glove.destroy());
    }

    // Override resetRound to avoid Puck crash and reset players
    resetRound(loserSide) {
        // Reset Players to starting positions
        const startY = this.fieldY + this.fieldH - 50;
        this.paddle1.reset(100 * this.scaleFactor, startY);
        this.paddle2.reset(this.baseW - 100 * this.scaleFactor, startY);

        // Ensure gravity is still valid
        if (this.paddle1.sprite.body) this.paddle1.sprite.body.setImmovable(false);
        if (this.paddle2.sprite.body) this.paddle2.sprite.body.setImmovable(false);
    }

    generateGloveTexture() {
        if (this.textures.exists('glove')) return;
        const g = this.make.graphics({ add: false });
        g.fillStyle(0xff0000); g.fillCircle(30, 25, 20);
        g.generateTexture('glove', 60, 50);
        g.destroy();
    }
}
