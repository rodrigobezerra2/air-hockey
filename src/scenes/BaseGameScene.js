import { Localization } from '../utils/Localization.js';
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

    hitPaddle(puck, paddle) {
        // ... existing physics logic is handled by collider, but we can add bounce boost if needed
        if (paddle === this.paddle2.sprite) console.log('CPU TOUCHED PUCK');
        // Override in subclasses
        const angle = Phaser.Math.Angle.Between(paddle.x, paddle.y, puck.x, puck.y);
        const speed = Phaser.Math.Distance.Between(0, 0, puck.body.velocity.x, puck.body.velocity.y);
        if (speed < 200 * this.scaleFactor) {
            this.physics.velocityFromRotation(angle, 350 * this.scaleFactor, puck.body.velocity);
        }
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
        this.crazyModeText = this.add.text(this.baseW / 2, 120, Localization.get('MADNESS_MODE_ENABLED'), {
            fontSize: '40px', fill: '#ffff00', fontStyle: 'bold'
        }).setOrigin(0.5).setVisible(!this.restrictField).setScrollFactor(0);

        // Settings Cog (Top Right)
        // Fixed to Screen (using this.scale.width, not world width)
        this.add.text(this.scale.width - 50, 50, '⚙️', { fontSize: '40px' })
            .setOrigin(0.5).setInteractive().setScrollFactor(0)
            .on('pointerdown', () => this.openSettings());

        // Mobile Controls (If touch detected)
        // Check touch or just add them for testing if requested. 
        // Mobile Controls (If touch detected AND not on desktop)
        // Ensure strictly mobile/tablet experience
        if (!this.sys.game.device.os.desktop && this.sys.game.device.input.touch) {
            this.createVirtualControls();
        }
    }

    openSettings() {
        if (this.isPaused) return;
        this.isPaused = true;
        this.physics.world.pause();

        // Create Modal Container
        this.settingsModal = this.add.container(0, 0).setScrollFactor(0).setDepth(100);

        // Background (dim)
        // Panel Border
        const panelW = 500;
        const panelH = 600;
        const panel = this.add.graphics();
        panel.lineStyle(4, 0x00ff00);
        panel.fillStyle(0x000000, 0.9);
        const panelRect = new Phaser.Geom.Rectangle(this.baseW / 2 - panelW / 2, this.baseH / 2 - panelH / 2, panelW, panelH);
        panel.strokeRectShape(panelRect);
        panel.fillRectShape(panelRect);
        this.settingsModal.add(panel);

        // Background (dim) - Click to Resume
        const bg = this.add.rectangle(this.baseW / 2, this.baseH / 2, this.baseW, this.baseH, 0x000000, 0.8)
            .setInteractive()
            .on('pointerdown', (pointer) => {
                // Check if click is outside panel
                if (!panelRect.contains(pointer.x, pointer.y)) {
                    this.closeSettings();
                }
            });
        this.settingsModal.add(bg);

        // Ensure background is BEHIND panel (panel was added first, so send bg to back)
        this.settingsModal.sendToBack(bg);

        // Standard Button Style
        const createBtn = (y, label, callback, color = '#ffffff') => {
            const btnText = this.add.text(this.baseW / 2, y, label, {
                fontSize: '40px', fill: color, fontStyle: 'bold'
            }).setOrigin(0.5).setInteractive();

            btnText.on('pointerdown', callback);
            btnText.on('pointerover', () => btnText.setScale(1.1));
            btnText.on('pointerout', () => btnText.setScale(1.0));
            this.settingsModal.add(btnText);
            return btnText;
        };

        // Resume
        createBtn(this.baseH * 0.25, Localization.get('RESUME'), () => this.closeSettings());

        // Language Flags (Row)
        const langs = Localization.getAllLanguages();
        const langY = this.baseH * 0.51;
        const langGap = 100;
        const langStartX = this.baseW / 2 - ((langs.length - 1) * langGap) / 2;

        langs.forEach((lang, index) => {
            const x = langStartX + index * langGap;
            const flagKey = Localization.getFlag(lang); // Returns texture key 'flag_en', etc.
            const isSelected = (Localization.getCurrentLanguage() === lang);

            // Background for selection
            if (isSelected) {
                const bg = this.add.rectangle(x, langY, 70, 54, 0x444444).setOrigin(0.5);
                this.settingsModal.add(bg);
            }

            // Using this.add.image instead of text
            const flagBtn = this.add.image(x, langY, flagKey).setOrigin(0.5).setInteractive();
            flagBtn.setDisplaySize(60, 40);

            flagBtn.on('pointerdown', () => {
                Localization.setLanguage(lang);
                // Restart Settings to refresh text
                this.settingsModal.destroy();
                this.isPaused = false;
                this.openSettings();
            });

            flagBtn.on('pointerover', () => flagBtn.setDisplaySize(66, 44));
            flagBtn.on('pointerout', () => flagBtn.setDisplaySize(60, 40));

            this.settingsModal.add(flagBtn);
        });

        // Stage Select
        createBtn(this.baseH * 0.64, Localization.get('STAGE_SELECT'), () => {
            this.closeSettings(); // Clean up
            this.scene.start('StageSelectScene');
        });

        // Main Menu
        createBtn(this.baseH * 0.77, Localization.get('MAIN_MENU'), () => {
            this.closeSettings();
            this.scene.start('MenuScene');
        });
    }

    closeSettings() {
        this.isPaused = false;
        this.physics.world.resume();
        if (this.settingsModal) {
            this.settingsModal.destroy();
            this.settingsModal = null;
        }
    }

    createVirtualControls() {
        this.virtualInput = {
            p1: { up: false, down: false, left: false, right: false },
            p2: { up: false, down: false, left: false, right: false }
        };

        const createDPad = (x, y, playerKey, isArrows) => {
            const size = 60;
            const alpha = 0.3;
            const color = 0x888888;

            // Helper to make button
            const makeBtn = (bx, by, keyDir, label) => {
                const btn = this.add.circle(bx, by, size, color).setAlpha(alpha).setScrollFactor(0).setInteractive();
                const text = this.add.text(bx, by, label, { fontSize: '32px', fontStyle: 'bold' }).setOrigin(0.5).setScrollFactor(0);

                btn.on('pointerdown', () => this.virtualInput[playerKey][keyDir] = true);
                btn.on('pointerup', () => this.virtualInput[playerKey][keyDir] = false);
                btn.on('pointerout', () => this.virtualInput[playerKey][keyDir] = false);
            };

            makeBtn(x, y - size * 1.5, 'up', isArrows ? '↑' : 'W');
            makeBtn(x, y + size * 1.5, 'down', isArrows ? '↓' : 'S');
            makeBtn(x - size * 1.5, y, 'left', isArrows ? '←' : 'A');
            makeBtn(x + size * 1.5, y, 'right', isArrows ? '→' : 'D');
        };

        // P1 D-Pad (Left Bottom)
        createDPad(150, this.baseH - 150, 'p1', false);

        // P2 D-Pad (Right Bottom)
        createDPad(this.baseW - 150, this.baseH - 150, 'p2', true);
    }

    update(time, delta) {
        if (this.matchEnded || this.isPaused) return;

        // --- Player 1 Input ---
        let p1Vx = 0, p1Vy = 0;
        const isGravityStage = this.isGravityStage;

        // Combine Keyboard & Virtual
        const k1 = this.keysWASD;
        const v1 = this.virtualInput ? this.virtualInput.p1 : { up: false, down: false, left: false, right: false };

        const up = k1.up.isDown || v1.up;
        const down = k1.down.isDown || v1.down;
        const left = k1.left.isDown || v1.left;
        const right = k1.right.isDown || v1.right;

        // P1 Movement logic
        if (isGravityStage) {
            // Gravity Logic...
            if (left) p1Vx = -600;
            else if (right) p1Vx = 600;

            if (up && this.paddle1.sprite.body.blocked.down) {
                this.paddle1.setVelocityY(-600);
            } else if (down) {
                this.paddle1.setVelocityY(600);
            }
        } else {
            // Classic Logic
            if (up) p1Vy = -600;
            else if (down) p1Vy = 600;

            if (left) p1Vx = -600;
            else if (right) p1Vx = 600;
        }

        // Direct Touch Logic (Only if NOT using virtual buttons to avoid conflict?)
        // Actually, user might use D-Pad OR Touch.
        // Touch mainly for 1P or "Air Hockey" feel mechanics.
        if (this.input.activePointer.isDown) {
            const ptr = this.input.activePointer;
            // Only process direct touch if NOT clicking a UI element (interactive check)
            // But simple check: Is it in the game area?
            // Actually, if using D-Pad, activePointer is busy on the button. 
            // So we primarily check if NO keys are pressed.

            /* 
               Improved Touch Follow: Proportional Speed
            */
            const isTouchingUI = (ptr.y > this.baseH - 250 && (ptr.x < 300 || ptr.x > this.baseW - 300)) && (this.virtualInput);

            if (!isTouchingUI) {
                const canMove = (this.gameMode === '1p') || (!this.restrictField) || (ptr.x < this.baseW / 2);

                if (canMove) {
                    if (ptr.x < this.paddle1.x) this.paddle1.facing = -1; else this.paddle1.facing = 1;

                    if (isGravityStage) {
                        // Touch Gravity Logic...
                        if (ptr.x < this.paddle1.x - 10) p1Vx = -600;
                        else if (ptr.x > this.paddle1.x + 10) p1Vx = 600;
                        if (ptr.y < this.paddle1.y - 50 && this.paddle1.sprite.body.blocked.down) {
                            this.paddle1.setVelocityY(-600);
                        }
                    } else {
                        // Standard Mode: Proportional Catchup
                        const dist = Phaser.Math.Distance.Between(this.paddle1.x, this.paddle1.y, ptr.x, ptr.y);
                        if (dist > 15) {
                            const angle = Phaser.Math.Angle.Between(this.paddle1.x, this.paddle1.y, ptr.x, ptr.y);

                            // NEW: Speed scales with distance. 
                            // Min 600, Max 2000? 
                            // avg move: dist 100 -> speed 1000?
                            const speed = Math.max(600, Math.min(dist * 15, 1800));

                            const vec = this.physics.velocityFromRotation(angle, speed);
                            p1Vx = vec.x; p1Vy = vec.y;
                        } else {
                            // Close enough, stop jitter
                            // p1Vx/Vy already 0
                        }
                    }
                }
            }
        }

        // Apply P1
        if (isGravityStage) {
            if (!this.paddle1.stunned) this.paddle1.setVelocityX(p1Vx);
        } else {
            if (!this.paddle1.stunned) this.paddle1.setVelocity(p1Vx, p1Vy);
        }

        // --- Player 2 Input ---
        if (this.gameMode === '2p') {
            let p2Vx = 0, p2Vy = 0;
            const k2 = this.cursors;
            const v2 = this.virtualInput ? this.virtualInput.p2 : { up: false, down: false, left: false, right: false };

            const up2 = k2.up.isDown || v2.up;
            const down2 = k2.down.isDown || v2.down;
            const left2 = k2.left.isDown || v2.left;
            const right2 = k2.right.isDown || v2.right;

            // P2 Logic
            if (left2) p2Vx = -600;
            else if (right2) p2Vx = 600;

            if (isGravityStage) {
                if (up2 && this.paddle2.sprite.body.blocked.down) this.paddle2.setVelocityY(-600);
                else if (down2) this.paddle2.setVelocityY(600);
                this.paddle2.setVelocityX(p2Vx);
            } else {
                if (up2) p2Vy = -600;
                else if (down2) p2Vy = 600;
                this.paddle2.setVelocity(p2Vx, p2Vy);
            }
        }
        if (this.restrictField) {
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

        this.handleAI();
        this.checkGoals();
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
                // Retreat logic - Back off to 85% width (safer from wall)
                const retreatX = this.baseW * 0.85;
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
                    // Prevent AI from repeatedly ramming wall in Madness Mode
                    // If target is beyond safe bounds, clamp it or stop?
                    // Actually, if simply chasing puck, let it crash (it's "Madness").
                    // BUT for "Stuck" logic above, we fixed retreatX.
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
        const goalY = (this.isGravityStage) ? (this.fieldY + this.fieldH - this.GOAL_SIZE / 2) : (centerY);

        // Increase threshold to 50 (radius 20 + 30 buffer) to catch fast bounces
        if (this.puck.x < 50 && Math.abs(this.puck.y - goalY) < this.GOAL_SIZE / 2 + 20) this.onGoal('p2');
        if (this.puck.x > this.baseW - 50 && Math.abs(this.puck.y - goalY) < this.GOAL_SIZE / 2 + 20) this.onGoal('p1');
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
        // this.playFartSound(); // Removed/Replaced
        this.totalGoals++;
        if (this.totalGoals >= 3) {
            this.matchEnded = true;
            this.scene.start('ResultScene', { mode: this.gameMode, stage: this.stageNum, score1: this.score1, score2: this.score2 });
        } else {
            this.resetRound(scorer === 'p1' ? 'right' : 'left');
        }
    }

    showFartCloud(side) {
        // Animation disabled
    }

    resetRound(loserSide) {
        this.puck.reset(this.baseW / 2, this.fieldY + this.fieldH / 2);
        const serveSpeed = 300 * this.scaleFactor;
        const randomY = Phaser.Math.Between(-200, 200);
        this.puck.body.setVelocity(loserSide === 'left' ? -serveSpeed : serveSpeed, randomY);
    }
}
