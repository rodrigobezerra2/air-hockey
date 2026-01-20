import { Persistence } from '../persistence.js';
import { Paddle } from '../entities/Paddle.js';
import { Puck } from '../entities/Puck.js';

export class BaseGameScene extends Phaser.Scene {
    constructor(key) { super({ key: key }); }

    init(data) {
        this.gameMode = data.mode || '2p';
        this.stageNum = data.stage || 1;
        this.isFreePlay = data.isFreePlay;
        this.baseW = 1200; this.baseH = 800;
        this.scaleFactor = 1;
        this.fieldY = 0;
        this.fieldH = 800;
        this.GOAL_SIZE = 200;
        this.PADDLE_RADIUS = 30;
    }

    create() {
        this.score1 = 0; this.score2 = 0; this.totalGoals = 0; this.matchEnded = false;
        this.restrictField = true;

        this.configureField(); // Override-able

        // Common Graphics
        this.drawField();

        // Setup Inputs
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keysWASD = this.input.keyboard.addKeys({ up: Phaser.Input.Keyboard.KeyCodes.W, down: Phaser.Input.Keyboard.KeyCodes.S, left: Phaser.Input.Keyboard.KeyCodes.A, right: Phaser.Input.Keyboard.KeyCodes.D });
        this.input.addPointer(2);

        this.setupEntities();
        this.setupUI();
    }

    configureField() {
        // Default config
    }

    drawField() {
        this.cameras.main.centerOn(this.baseW / 2, this.baseH / 2);
        this.physics.world.setBounds(0, this.fieldY, this.baseW, this.fieldH);

        const g = this.add.graphics();
        g.lineStyle(4, 0x444444);
        g.strokeRect(0, this.fieldY, this.baseW, this.fieldH);
        const centerX = this.baseW / 2, centerY = this.fieldY + this.fieldH / 2;
        g.beginPath(); g.moveTo(centerX, this.fieldY); g.lineTo(centerX, this.fieldY + this.fieldH); g.strokePath();
        g.strokeCircle(centerX, centerY, 100 * this.scaleFactor);

        // Goals
        const goalY = (this.isGravityStage) ? (this.fieldY + this.fieldH - this.GOAL_SIZE) : (centerY - this.GOAL_SIZE / 2);
        g.fillStyle(0xaa0000, 0.5); g.fillRect(0, goalY, 10 * this.scaleFactor, this.GOAL_SIZE);
        g.fillStyle(0x0000aa, 0.5); g.fillRect(this.baseW - 10 * this.scaleFactor, goalY, 10 * this.scaleFactor, this.GOAL_SIZE);
    }

    setupEntities() {
        const centerY = this.fieldY + this.fieldH / 2;
        this.paddle1 = new Paddle(this, 100 * this.scaleFactor, centerY, this.PADDLE_RADIUS, 0xff0000, 0xffaaaa);
        this.paddle2 = new Paddle(this, this.baseW - 100 * this.scaleFactor, centerY, this.PADDLE_RADIUS, 0x0000ff, 0xaaaaff);

        // Puck (Override-able for stages without puck)
        this.createPuck();
    }

    createPuck() {
        const centerY = this.fieldY + this.fieldH / 2;
        this.puck = new Puck(this, this.baseW / 2, centerY, 20 * this.scaleFactor);
        this.physics.add.collider(this.puck.sprite, this.paddle1.sprite, (p, pad) => this.hitPaddle(p, pad));
        this.physics.add.collider(this.puck.sprite, this.paddle2.sprite, (p, pad) => this.hitPaddle(p, pad));
    }

    setupUI() {
        this.scoreText1 = this.add.text(this.baseW * 0.25, 50, '0', { fontSize: '64px', fill: '#ff0000' }).setScrollFactor(0);
        this.scoreText2 = this.add.text(this.baseW * 0.75, 50, '0', { fontSize: '64px', fill: '#0000ff' }).setScrollFactor(0);

        const bg = this.add.container(0, 0).setScrollFactor(0);
        const icon = this.add.circle(50, 50, 20, 0xffff00);
        const txt = this.add.text(80, 50, 'x ' + Persistence.getData().coins, { fontSize: '32px', fill: '#ffff00' }).setOrigin(0, 0.5);
        bg.add([icon, this.add.text(50, 50, 'C', { fontSize: '24px', fill: '#000000', fontStyle: 'bold' }).setOrigin(0.5), txt]);
        this.coinText = txt;

        this.input.keyboard.on('keydown-R', () => {
            this.restrictField = !this.restrictField;
            if (this.crazyModeText) this.crazyModeText.setVisible(!this.restrictField);
        });

        // Madness Mode Text
        this.crazyModeText = this.add.text(this.baseW / 2, 120, 'MADNESS MODE ENABLED', {
            fontSize: '40px', fill: '#ffff00', fontStyle: 'bold'
        }).setOrigin(0.5).setVisible(!this.restrictField).setScrollFactor(0);

        this.add.text(this.baseW / 2, this.baseH - 50, 'QUIT', { fontSize: '24px', fill: '#ffffff' })
            .setOrigin(0.5).setInteractive().on('pointerdown', () => this.scene.start('MenuScene'));
    }

    hitPaddle(puckSprite, paddleSprite) {
        if (paddleSprite === this.paddle2.sprite) console.log('CPU TOUCHED PUCK');
        const angle = Phaser.Math.Angle.Between(paddleSprite.x, paddleSprite.y, puckSprite.x, puckSprite.y);
        const speed = Phaser.Math.Distance.Between(0, 0, puckSprite.body.velocity.x, puckSprite.body.velocity.y);
        if (speed < 200 * this.scaleFactor) {
            this.physics.velocityFromRotation(angle, 350 * this.scaleFactor, puckSprite.body.velocity);
        }
    }

    update(time, delta) {
        if (this.matchEnded) return;
        this.handleInput(delta);
        this.handleAI();
        this.enforceBoundaries();
        this.checkGoals();
    }

    handleInput(delta) {
        // P1 Input
        let p1Vx = 0, p1Vy = 0;
        const isGravityStage = this.isGravityStage;

        // Keyboard
        const left = this.keysWASD.left.isDown || (this.gameMode === '1p' && this.cursors.left.isDown);
        const right = this.keysWASD.right.isDown || (this.gameMode === '1p' && this.cursors.right.isDown);
        const up = this.keysWASD.up.isDown || (this.gameMode === '1p' && this.cursors.up.isDown);
        const down = this.keysWASD.down.isDown || (this.gameMode === '1p' && this.cursors.down.isDown);

        if (left) { p1Vx = -600; this.paddle1.facing = -1; }
        else if (right) { p1Vx = 600; this.paddle1.facing = 1; }

        // Y-Axis Logic
        if (isGravityStage) {
            // Gravity Mode: Up = Jump, Down = Fast Fall
            const hasBody = this.paddle1 && this.paddle1.sprite && this.paddle1.sprite.body;
            if (hasBody) {
                if (up && this.paddle1.sprite.body.blocked.down) {
                    this.paddle1.setVelocityY(-600);
                } else if (down) {
                    this.paddle1.setVelocityY(600);
                }
            }
        } else {
            // Classic Mode: Direct Velocity Control
            if (up) p1Vy = -600;
            else if (down) p1Vy = 600;
        }

        // Mouse/Touch (Override keyboard if active)
        if (this.input.activePointer.isDown) {
            const ptr = this.input.activePointer;
            const canMove = (this.gameMode === '1p') || (!this.restrictField) || (ptr.x < this.baseW / 2);

            if (canMove) {
                if (ptr.x < this.paddle1.x) this.paddle1.facing = -1; else this.paddle1.facing = 1;

                if (isGravityStage) {
                    // Touch Gravity: Follow X, Tap/Hold high to jump?
                    if (ptr.x < this.paddle1.x - 10) p1Vx = -600;
                    else if (ptr.x > this.paddle1.x + 10) p1Vx = 600;

                    if (ptr.y < this.paddle1.y - 50 && this.paddle1.sprite.body.blocked.down) {
                        this.paddle1.setVelocityY(-600);
                    }
                } else {
                    const dist = Phaser.Math.Distance.Between(this.paddle1.x, this.paddle1.y, ptr.x, ptr.y);
                    if (dist > 15) {
                        const angle = Phaser.Math.Angle.Between(this.paddle1.x, this.paddle1.y, ptr.x, ptr.y);
                        const vec = this.physics.velocityFromRotation(angle, 600);
                        p1Vx = vec.x; p1Vy = vec.y;
                    } else {
                        p1Vx = 0; p1Vy = 0;
                    }
                }
            }
        }

        // Apply Final Velocity
        if (isGravityStage) {
            if (!this.paddle1.stunned) this.paddle1.setVelocityX(p1Vx);
            // Vy is handled by physics or explicit jump commands above
        } else {
            if (!this.paddle1.stunned) this.paddle1.setVelocity(p1Vx, p1Vy);
        }

        // P2 (if 2P)
        if (this.gameMode === '2p') {
            let p2Vx = 0, p2Vy = 0;
            if (this.cursors.left.isDown) p2Vx = -600;
            else if (this.cursors.right.isDown) p2Vx = 600;

            if (isGravityStage) {
                if (this.cursors.up.isDown && this.paddle2.sprite.body.blocked.down) this.paddle2.setVelocityY(-600);
                else if (this.cursors.down.isDown) this.paddle2.setVelocityY(600);
                this.paddle2.setVelocityX(p2Vx);
            } else {
                if (this.cursors.up.isDown) p2Vy = -600;
                else if (this.cursors.down.isDown) p2Vy = 600;
                this.paddle2.setVelocity(p2Vx, p2Vy);
            }
        }
    }

    enforceBoundaries() {
        if (!this.restrictField) return;

        // P1 Bounds (Left Half)
        // Right limit for P1: baseW/2 - radius
        if (this.paddle1.x > this.baseW / 2 - this.PADDLE_RADIUS) {
            this.paddle1.x = this.baseW / 2 - this.PADDLE_RADIUS;
            if (this.paddle1.body.velocity.x > 0) this.paddle1.setVelocityX(0);
        }

        // P2 Bounds (Right Half)
        // Left limit for P2: baseW/2 + radius
        if (this.paddle2.x < this.baseW / 2 + this.PADDLE_RADIUS) {
            this.paddle2.x = this.baseW / 2 + this.PADDLE_RADIUS;
            if (this.paddle2.body.velocity.x < 0) this.paddle2.setVelocityX(0);
        }
    }

    handleAI() {
        // Base AI (Follow Puck)
        if (this.gameMode === '1p' && this.puck) {
            const isGravityStage = this.isGravityStage;
            const dist = Phaser.Math.Distance.Between(this.paddle2.x, this.paddle2.y, this.puck.x, this.puck.y);

            // Stuck/Pinning Prevention (Reduced)
            // Only back off if the puck is BEHIND us (to our right), forcing us to reposition.
            let isStuck = false;

            // If we are excessively close (overlapping)
            if (dist < this.PADDLE_RADIUS * 1.5) {
                // If Puck is to our RIGHT (towards our goal/behind us), we need to get behind it. Back off.
                if (this.puck.x > this.paddle2.x) isStuck = true;
            }

            if (isStuck) {
                // Retreat logic
                const retreatX = this.baseW * 0.9;
                const retreatY = this.fieldY + this.fieldH / 2;

                if (isGravityStage) {
                    // Gravity Retreat: Move Right
                    const dir = (retreatX > this.paddle2.x) ? 1 : -1;
                    this.paddle2.setVelocityX(dir * 300);
                    // Allow gravity fall
                } else {
                    this.physics.moveTo(this.paddle2.sprite, retreatX, retreatY, 200);
                }
            } else {
                // Normal Chase / Attack
                if (isGravityStage) {
                    // Platformer AI
                    const dx = this.puck.x - this.paddle2.x;
                    const dy = this.puck.y - this.paddle2.y;

                    // Horizontal Movement
                    if (Math.abs(dx) > 10) {
                        this.paddle2.setVelocityX(dx > 0 ? 300 : -300);
                    } else {
                        this.paddle2.setVelocityX(0);
                    }

                    // Vertical: Jump if puck is high
                    if (dy < -80 && this.paddle2.sprite.body.blocked.down) {
                        this.paddle2.setVelocityY(-550);
                    }
                } else {
                    // Top-Down AI
                    this.physics.moveTo(this.paddle2.sprite, this.puck.x, this.puck.y, 300 * this.scaleFactor);
                }
            }
        }
    }

    checkGoals() {
        if (!this.puck) return;
        const centerX = this.baseW / 2;
        const centerY = this.fieldY + this.fieldH / 2;

        // Determine Goal Y Position
        // Stage 4+: Goals are at the BOTTOM corners (implied by gravity/platformer style?)
        // Wait, drawField says: (this.fieldY + this.fieldH - this.GOAL_SIZE)
        // Check previously viewed drawField logic (Line 54)
        const goalY = (this.isGravityStage) ? (this.fieldY + this.fieldH - this.GOAL_SIZE / 2) : (centerY);
        // Note: drawField draws rect at 'y'. Rect origin is top-left.
        // If drawField: y = fieldH - GOAL_SIZE. Center of that rect is fieldH - GOAL_SIZE/2.

        if (this.puck.x < 25 && Math.abs(this.puck.y - goalY) < this.GOAL_SIZE / 2 + 20) this.onGoal('p2');
        if (this.puck.x > this.baseW - 25 && Math.abs(this.puck.y - goalY) < this.GOAL_SIZE / 2 + 20) this.onGoal('p1');
    }

    onGoal(scorer) {
        if (scorer === 'p1') {
            const newTotal = Persistence.addCoins(50);
            this.coinText.setText('x ' + newTotal);
            this.score1++;
            this.scoreText1.setText(this.score1);
            this.showFartCloud('right');
        } else {
            this.score2++;
            this.scoreText2.setText(this.score2);
            this.showFartCloud('left');
        }
        this.playFartSound(); // Restore Sound
        this.totalGoals++;
        if (this.totalGoals >= 3) {
            this.matchEnded = true;
            this.scene.start('ResultScene', { mode: this.gameMode, stage: this.stageNum, score1: this.score1, score2: this.score2 });
        } else {
            this.resetRound(scorer === 'p1' ? 'right' : 'left');
        }
    }

    playFartSound() {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return; const ctx = new AC(); const osc = ctx.createOscillator(); const gain = ctx.createGain();
        osc.type = 'sawtooth'; osc.frequency.setValueAtTime(150, ctx.currentTime); osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.5);
        gain.gain.setValueAtTime(1, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        osc.connect(gain); gain.connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime + 0.5);
    }

    showFartCloud(side) {
        if (!this.textures.exists('cloud')) { const g = this.make.graphics({ x: 0, y: 0, add: false }); g.fillStyle(0x00ff00, 1); g.fillCircle(20, 20, 20); g.generateTexture('cloud', 40, 40); }
        const particles = this.add.particles(0, 0, 'cloud', { speed: { min: -50, max: 50 }, angle: { min: 0, max: 360 }, scale: { start: 2 * this.scaleFactor, end: 4 * this.scaleFactor }, alpha: { start: 0.3, end: 0 }, lifespan: 5000, frequency: -1, quantity: 20 });
        const centerY = this.fieldY + this.fieldH / 2;
        const xPos = side === 'left' ? this.baseW * 0.2 : this.baseW * 0.8;
        particles.explode(20, xPos, centerY);
        this.time.delayedCall(6000, () => { if (particles) particles.destroy(); });
        const fog = this.add.graphics(); fog.fillStyle(0x00aa00, 0.2);
        if (side === 'left') fog.fillRect(0, this.fieldY, this.baseW / 2, this.fieldH);
        else fog.fillRect(this.baseW / 2, this.fieldY, this.baseW / 2, this.fieldH);
        this.tweens.add({ targets: fog, alpha: 0, duration: 1000, delay: 4000, onComplete: () => fog.destroy() });
    }

    resetRound(loserSide) {
        this.puck.reset(this.baseW / 2, this.fieldY + this.fieldH / 2);
        const serveSpeed = 300 * this.scaleFactor;
        const randomY = Phaser.Math.Between(-200, 200);
        this.puck.body.setVelocity(loserSide === 'left' ? -serveSpeed : serveSpeed, randomY);
    }
}
