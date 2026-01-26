import { Localization } from '../utils/Localization.js';
import { Persistence } from '../persistence.js';
import { Paddle } from '../entities/Paddle.js';
import { Puck } from '../entities/Puck.js';
import { VanityManager } from '../utils/VanityManager.js';

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
        this.isWaitingForStart = false;

        // Stage 10 / Goalie Mode support
        this.isGoalieMode = false;
        this.aiControlP1 = false;
        this.goal1Y = 0; // Relative to field
        this.goal2Y = 0; // Relative to field
        this.fieldGraphics = null;
        this.goalGraphics = null;
        this.isSplitMode = false;
        this.paddle1B = null;
    }

    create() {
        this.score1 = 0; this.score2 = 0; this.totalGoals = 0; this.matchEnded = false;
        this.restrictField = true;
        VanityManager.generateTextures(this);

        this.configureField(); // Override-able
        this.setupGoalPositions(); // Centrally handle defaults if not set

        // Common Graphics
        this.drawField();

        // Setup Inputs
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keysWASD = this.input.keyboard.addKeys({ up: Phaser.Input.Keyboard.KeyCodes.W, down: Phaser.Input.Keyboard.KeyCodes.S, left: Phaser.Input.Keyboard.KeyCodes.A, right: Phaser.Input.Keyboard.KeyCodes.D });
        this.keyY = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Y);
        this.input.addPointer(2);

        this.setupEntities();

        this.setupUI();

        // Match Start Sequence
        this.startReadyGoSequence();
    }

    configureField() {
        // Stages override this
    }

    setupGoalPositions() {
        // If goals are still at 0, apply defaults
        const centerY = this.fieldY + this.fieldH / 2;
        const defaultY = (this.isGravityStage) ? (this.fieldY + this.fieldH - this.GOAL_SIZE) : (centerY - this.GOAL_SIZE / 2);

        if (this.goal1Y === 0) this.goal1Y = defaultY;
        if (this.goal2Y === 0) this.goal2Y = defaultY;
    }

    drawField() {
        this.cameras.main.centerOn(this.baseW / 2, this.baseH / 2);
        this.physics.world.setBounds(0, this.fieldY, this.baseW, this.fieldH);

        const bgId = Persistence.getEquipped('world', 'background');

        // Use persistent graphics objects
        if (!this.fieldGraphics) this.fieldGraphics = this.add.graphics();
        if (!this.goalGraphics) this.goalGraphics = this.add.graphics();

        const g = this.fieldGraphics;
        g.clear();

        // 1. Theme-Specific Background (Static)
        this.drawWorldBackground(g, bgId);

        // 2. Field Lines (Static)
        g.lineStyle(4, 0xffffff, 0.2);
        g.strokeRect(0, this.fieldY, this.baseW, this.fieldH);
        const centerX = this.baseW / 2, centerY = this.fieldY + this.fieldH / 2;
        g.beginPath(); g.moveTo(centerX, this.fieldY); g.lineTo(centerX, this.fieldY + this.fieldH); g.strokePath();
        g.strokeCircle(centerX, centerY, 100 * this.scaleFactor);

        // 3. Goals (Initial draw)
        this.drawGoals();
    }

    drawGoals() {
        if (!this.goalGraphics) return;
        const g = this.goalGraphics;
        g.clear();
        g.fillStyle(0xaa0000, 0.5); g.fillRect(0, this.goal1Y, 10 * this.scaleFactor, this.GOAL_SIZE);
        g.fillStyle(0x0000aa, 0.5); g.fillRect(this.baseW - 10 * this.scaleFactor, this.goal2Y, 10 * this.scaleFactor, this.GOAL_SIZE);
    }

    drawWorldBackground(g, id) {
        const { baseW, baseH, fieldY, fieldH } = this;
        const centerY = fieldY + fieldH / 2;

        if (!id) {
            g.fillStyle(0x000000);
            g.fillRect(0, fieldY, baseW, fieldH);
            return;
        }

        switch (id) {
            case 'world_lava':
                g.fillStyle(0x1a0500); g.fillRect(0, fieldY, baseW, fieldH);
                // Volcanoes
                for (let i = 0; i < 3; i++) {
                    const vx = 200 + i * 400, vy = fieldY + 150;
                    g.fillStyle(0x331100);
                    g.beginPath(); g.moveTo(vx - 150, fieldY + fieldH); g.lineTo(vx, vy); g.lineTo(vx + 150, fieldY + fieldH); g.fillPath();
                    g.fillStyle(0xff4400); // Lava top
                    g.beginPath(); g.moveTo(vx - 30, vy); g.lineTo(vx + 30, vy); g.lineTo(vx + 50, vy + 40); g.lineTo(vx - 50, vy + 40); g.fillPath();
                }
                g.fillStyle(0xff6600, 0.2); // Heat ripples
                for (let i = 0; i < 30; i++) g.fillCircle(Math.random() * baseW, fieldY + Math.random() * fieldH, 20 + Math.random() * 40);
                break;

            case 'world_snow':
                g.fillStyle(0xccf2ff); g.fillRect(0, fieldY, baseW, fieldH);
                // Icebergs
                g.fillStyle(0xffffff, 0.8);
                for (let i = 0; i < 5; i++) {
                    const ix = 100 + i * 250, iy = fieldY + 200 + Math.random() * 200;
                    g.beginPath(); g.moveTo(ix - 80, fieldY + fieldH); g.lineTo(ix, iy); g.lineTo(ix + 80, fieldY + fieldH); g.fillPath();
                }
                g.fillStyle(0x00ccff, 0.3); // Frost patterns
                for (let i = 0; i < 20; i++) g.fillRect(Math.random() * baseW, fieldY + Math.random() * fieldH, 100, 2);
                break;

            case 'world_forest':
                g.fillStyle(0x0a2200); g.fillRect(0, fieldY, baseW, fieldH);
                // Trees
                for (let i = 0; i < 15; i++) {
                    const tx = Math.random() * baseW, ty = fieldY + 100 + Math.random() * 500;
                    g.fillStyle(0x331a00); g.fillRect(tx - 5, ty, 10, 40); // Trunk
                    g.fillStyle(0x004400); g.beginPath(); g.moveTo(tx - 30, ty); g.lineTo(tx, ty - 60); g.lineTo(tx + 30, ty); g.fillPath(); // Leaves
                }
                // Waterfall (stylized)
                g.fillStyle(0x44aaff, 0.6); g.fillRect(baseW / 2 - 40, fieldY, 80, fieldH);
                g.fillStyle(0xffffff, 0.4);
                for (let i = 0; i < 20; i++) g.fillRect(baseW / 2 - 40 + Math.random() * 80, fieldY + Math.random() * fieldH, 2, 20);
                break;

            case 'world_moon':
                g.fillStyle(0x111111); g.fillRect(0, fieldY, baseW, fieldH);
                g.fillStyle(0x333333); // Craters
                for (let i = 0; i < 15; i++) g.fillCircle(Math.random() * baseW, fieldY + Math.random() * fieldH, 20 + Math.random() * 50);
                // Alien
                const ax = 150, ay = fieldY + 150;
                g.fillStyle(0x00ff00); g.fillEllipse(ax, ay, 30, 40); // Head
                g.fillStyle(0x000000); g.fillCircle(ax - 10, ay - 5, 5); g.fillCircle(ax + 10, ay - 5, 5); // Eyes
                // Spaceship
                const sx = baseW - 200, sy = fieldY + 200;
                g.fillStyle(0x888888); g.fillEllipse(sx, sy, 80, 30); // Saucer
                g.fillStyle(0x44aaff); g.fillCircle(sx, sy - 10, 15); // Dome
                break;

            case 'world_sky':
                g.fillStyle(0x00ccff); g.fillRect(0, fieldY, baseW, fieldH);
                g.fillStyle(0xffffff, 0.8);
                for (let i = 0; i < 12; i++) {
                    const cx = Math.random() * baseW, cy = fieldY + Math.random() * fieldH;
                    g.fillCircle(cx, cy, 40); g.fillCircle(cx + 30, cy + 10, 30); g.fillCircle(cx - 30, cy + 10, 30);
                }
                break;

            case 'world_underwater':
                g.fillStyle(0x001133); g.fillRect(0, fieldY, baseW, fieldH);
                // Whale
                g.fillStyle(0x334466); g.fillEllipse(300, centerY - 100, 150, 60);
                g.beginPath(); g.moveTo(150, centerY - 100); g.lineTo(100, centerY - 130); g.lineTo(100, centerY - 70); g.fillPath(); // Tail
                // Shark
                g.fillStyle(0x667788); g.fillEllipse(baseW - 300, centerY + 100, 80, 30);
                g.beginPath(); g.moveTo(baseW - 300, centerY + 85); g.lineTo(baseW - 315, centerY + 70); g.lineTo(baseW - 285, centerY + 85); g.fillPath(); // Fin
                // Octopus
                const ox = 150, oy = centerY + 150;
                g.fillStyle(0xaa4466); g.fillCircle(ox, oy, 25);
                for (let i = 0; i < 8; i++) {
                    const ang = (i * Math.PI * 2) / 8;
                    g.lineStyle(6, 0xaa4466);
                    g.lineBetween(ox, oy, ox + Math.cos(ang) * 40, oy + Math.sin(ang) * 40);
                }
                break;

            case 'world_city':
                g.fillStyle(0x050510); g.fillRect(0, fieldY, baseW, fieldH);
                // Skyscrapers
                for (let i = 0; i < 20; i++) {
                    const sw = 40 + Math.random() * 60;
                    const sh = 100 + Math.random() * 400;
                    const sx = i * 70;
                    g.fillStyle(0x1a1a2e); g.fillRect(sx, fieldY + fieldH - sh, sw, sh);
                    g.fillStyle(0xffff00, 0.4); // Windows
                    for (let j = 0; j < 5; j++) g.fillRect(sx + 10, fieldY + fieldH - sh + 20 + j * 40, 10, 10);
                }
                // Stadium
                g.fillStyle(0x444444); g.fillEllipse(baseW / 2, fieldY + fieldH - 50, 300, 100);
                g.lineStyle(4, 0x00ff00); g.strokeEllipse(baseW / 2, fieldY + fieldH - 50, 280, 80);
                break;
        }
    }

    setupEntities() {
        const centerY = this.fieldY + this.fieldH / 2;
        this.p1SpawnX = 100 * this.scaleFactor;
        this.p1SpawnY = centerY;
        this.p2SpawnX = this.baseW - 100 * this.scaleFactor;
        this.p2SpawnY = centerY;

        this.paddle1 = new Paddle(this, this.p1SpawnX, this.p1SpawnY, this.PADDLE_RADIUS, 0xff0000, 0xffaaaa, 'p1');
        this.paddle2 = new Paddle(this, this.p2SpawnX, this.p2SpawnY, this.PADDLE_RADIUS, 0x0000ff, 0xaaaaff, 'p2');

        // Puck (Override-able for stages without puck)
        this.createPuck();
    }

    createPuck() {
        const centerY = this.fieldY + this.fieldH / 2;
        let radius = 20 * this.scaleFactor;
        this.puck = new Puck(this, this.baseW / 2, centerY, radius);
        if (this.paddle1) this.physics.add.collider(this.puck.sprite, this.paddle1.sprite, (p, pad) => this.hitPaddle(p, pad));
        if (this.paddle2) this.physics.add.collider(this.puck.sprite, this.paddle2.sprite, (p, pad) => this.hitPaddle(p, pad));
    }

    hitPaddle(puck, paddle) {
        if (Persistence.isModifierActive('knockback')) {
            let padObj = null;
            if (paddle === this.paddle1.sprite) padObj = this.paddle1;
            else if (this.paddle1B && paddle === this.paddle1B.sprite) padObj = this.paddle1B;
            else if (paddle === this.paddle2.sprite) padObj = this.paddle2;

            if (padObj) {
                const angle = Phaser.Math.Angle.Between(puck.x, puck.y, paddle.x, paddle.y);
                const force = 400;
                padObj.setVelocity(Math.cos(angle) * force, Math.sin(angle) * force);
            }
        }

        const angle = Phaser.Math.Angle.Between(paddle.x, paddle.y, puck.x, puck.y);
        const speed = Phaser.Math.Distance.Between(0, 0, puck.body.velocity.x, puck.body.velocity.y);
        const minSpeed = 350 * this.scaleFactor * (Persistence.isModifierActive('halfSpeed') ? 0.5 : 1);

        if (speed < minSpeed) {
            this.physics.velocityFromRotation(angle, minSpeed, puck.body.velocity);
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

        this.crazyModeText = this.add.text(this.baseW / 2, 120, Localization.get('MADNESS_MODE_ENABLED'), {
            fontSize: '40px', fill: '#ffff00', fontStyle: 'bold'
        }).setOrigin(0.5).setVisible(!this.restrictField).setScrollFactor(0);

        this.add.text(this.scale.width - 50, 50, '⚙️', { fontSize: '40px' })
            .setOrigin(0.5).setInteractive().setScrollFactor(0)
            .on('pointerdown', () => this.openSettings());

        if (!this.sys.game.device.os.desktop && this.sys.game.device.input.touch) {
            this.createVirtualControls();
        }
    }

    openSettings() {
        if (this.isPaused) return;
        this.isPaused = true;
        this.physics.world.pause();

        this.settingsModal = this.add.container(0, 0).setScrollFactor(0).setDepth(100);

        const panelW = 500;
        const panelH = 600;
        const panel = this.add.graphics();
        panel.lineStyle(4, 0x00ff00);
        panel.fillStyle(0x000000, 0.9);
        const panelRect = new Phaser.Geom.Rectangle(this.baseW / 2 - panelW / 2, this.baseH / 2 - panelH / 2, panelW, panelH);
        panel.strokeRectShape(panelRect);
        panel.fillRectShape(panelRect);
        this.settingsModal.add(panel);

        const bg = this.add.rectangle(this.baseW / 2, this.baseH / 2, this.baseW, this.baseH, 0x000000, 0.8)
            .setInteractive()
            .on('pointerdown', (pointer) => {
                if (!panelRect.contains(pointer.x, pointer.y)) {
                    this.closeSettings();
                }
            });
        this.settingsModal.add(bg);
        this.settingsModal.sendToBack(bg);

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

        createBtn(this.baseH * 0.25, Localization.get('RESUME'), () => this.closeSettings());

        const langs = Localization.getAllLanguages();
        const langY = this.baseH * 0.51;
        const langGap = 100;
        const langStartX = this.baseW / 2 - ((langs.length - 1) * langGap) / 2;

        langs.forEach((lang, index) => {
            const x = langStartX + index * langGap;
            const flagKey = Localization.getFlag(lang);
            const isSelected = (Localization.getCurrentLanguage() === lang);

            if (isSelected) {
                const bg = this.add.rectangle(x, langY, 70, 54, 0x444444).setOrigin(0.5);
                this.settingsModal.add(bg);
            }

            const flagBtn = this.add.image(x, langY, flagKey).setOrigin(0.5).setInteractive();
            flagBtn.setDisplaySize(60, 40);

            flagBtn.on('pointerdown', () => {
                Localization.setLanguage(lang);
                this.settingsModal.destroy();
                this.isPaused = false;
                this.openSettings();
            });

            flagBtn.on('pointerover', () => flagBtn.setDisplaySize(66, 44));
            flagBtn.on('pointerout', () => flagBtn.setDisplaySize(60, 40));

            this.settingsModal.add(flagBtn);
        });

        createBtn(this.baseH * 0.64, Localization.get('STAGE_SELECT'), () => {
            this.closeSettings();
            this.scene.start('StageSelectScene');
        });

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

        createDPad(150, this.baseH - 150, 'p1', false);
        createDPad(this.baseW - 150, this.baseH - 150, 'p2', true);
    }

    update(time, delta) {
        if (this.matchEnded || this.isPaused || this.isWaitingForStart) return;

        if (Phaser.Input.Keyboard.JustDown(this.keyY) && this.gameMode === '1p' && Persistence.isModifierActive('yingYang')) {
            this.toggleSplitMode();
        }

        let speedMult = 1;
        if (Persistence.isModifierActive('halfSpeed')) speedMult = 0.5;
        if (Persistence.isModifierActive('twiceSpeed')) speedMult = 2;

        const isGravityStage = this.isGravityStage;
        const baseSpeed = 600 * speedMult;

        let p1Vx = 0, p1Vy = 0;

        const k1 = this.keysWASD;
        const v1 = this.virtualInput ? this.virtualInput.p1 : { up: false, down: false, left: false, right: false };

        const up = k1.up.isDown || v1.up;
        const down = k1.down.isDown || v1.down;
        const left = k1.left.isDown || v1.left;
        const right = k1.right.isDown || v1.right;

        if (isGravityStage) {
            if (left) p1Vx = -baseSpeed;
            else if (right) p1Vx = baseSpeed;

            if (up && this.paddle1.sprite.body.blocked.down) {
                this.paddle1.setVelocityY(-baseSpeed);
            } else if (down) {
                this.paddle1.setVelocityY(baseSpeed);
            }
        } else {
            if (up) p1Vy = -baseSpeed;
            else if (down) p1Vy = baseSpeed;

            if (left) p1Vx = -baseSpeed;
            else if (right) p1Vx = baseSpeed;
        }

        if (this.input.activePointer.isDown) {
            const ptr = this.input.activePointer;
            const isTouchingUI = (ptr.y > this.baseH - 250 && (ptr.x < 300 || ptr.x > this.baseW - 300)) && (this.virtualInput);

            if (!isTouchingUI) {
                const canMove = (this.gameMode === '1p') || (!this.restrictField) || (ptr.x < this.baseW / 2);

                if (canMove) {
                    if (ptr.x < this.paddle1.x) this.paddle1.facing = -1; else this.paddle1.facing = 1;

                    if (isGravityStage) {
                        if (ptr.x < this.paddle1.x - 10) p1Vx = -baseSpeed;
                        else if (ptr.x > this.paddle1.x + 10) p1Vx = baseSpeed;
                        if (ptr.y < this.paddle1.y - 50 && this.paddle1.sprite.body.blocked.down) {
                            this.paddle1.setVelocityY(-baseSpeed);
                        }
                    } else {
                        const dist = Phaser.Math.Distance.Between(this.paddle1.x, this.paddle1.y, ptr.x, ptr.y);
                        if (dist > 15) {
                            const angle = Phaser.Math.Angle.Between(this.paddle1.x, this.paddle1.y, ptr.x, ptr.y);
                            const speed = Math.max(baseSpeed, Math.min(dist * 15 * speedMult, 1800 * speedMult));
                            const vec = this.physics.velocityFromRotation(angle, speed);
                            p1Vx = vec.x; p1Vy = vec.y;
                        }
                    }
                }
            }
        }

        if (isGravityStage) {
            if (!this.paddle1.stunned) this.paddle1.setVelocityX(p1Vx);
        } else {
            if (!this.paddle1.stunned) this.paddle1.setVelocity(p1Vx, p1Vy);
        }

        if (this.isSplitMode && this.paddle1B) {
            let p1bVx = 0, p1bVy = 0;
            const kSplit = this.cursors;
            const vSplit = this.virtualInput ? this.virtualInput.p2 : { up: false, down: false, left: false, right: false };

            const upB = kSplit.up.isDown || vSplit.up;
            const downB = kSplit.down.isDown || vSplit.down;
            const leftB = kSplit.left.isDown || vSplit.left;
            const rightB = kSplit.right.isDown || vSplit.right;

            if (isGravityStage) {
                if (leftB) p1bVx = -baseSpeed;
                else if (rightB) p1bVx = baseSpeed;
                if (upB && this.paddle1B.sprite.body.blocked.down) this.paddle1B.setVelocityY(-baseSpeed);
                else if (downB) this.paddle1B.setVelocityY(baseSpeed);
                this.paddle1B.setVelocityX(p1bVx);
            } else {
                if (upB) p1bVy = -baseSpeed;
                else if (downB) p1bVy = baseSpeed;
                if (leftB) p1bVx = -baseSpeed;
                else if (rightB) p1bVx = baseSpeed;
                this.paddle1B.setVelocity(p1bVx, p1bVy);
            }

            if (this.restrictField && this.paddle1B.x > this.baseW / 2 - this.paddle1B.radius) {
                this.paddle1B.x = this.baseW / 2 - this.paddle1B.radius;
                if (this.paddle1B.body.velocity.x > 0) this.paddle1B.setVelocityX(0);
            }
        }

        if (this.gameMode === '2p' && this.paddle2) {
            let p2Vx = 0, p2Vy = 0;
            const k2 = this.cursors;
            const v2 = this.virtualInput ? this.virtualInput.p2 : { up: false, down: false, left: false, right: false };

            const up2 = k2.up.isDown || v2.up;
            const down2 = k2.down.isDown || v2.down;
            const left2 = k2.left.isDown || v2.left;
            const right2 = k2.right.isDown || v2.right;

            if (left2) p2Vx = -baseSpeed;
            else if (right2) p2Vx = baseSpeed;

            if (isGravityStage) {
                if (up2 && this.paddle2.sprite.body.blocked.down) this.paddle2.setVelocityY(-baseSpeed);
                else if (down2) this.paddle2.setVelocityY(baseSpeed);
                this.paddle2.setVelocityX(p2Vx);
            } else {
                if (up2) p2Vy = -baseSpeed;
                else if (down2) p2Vy = baseSpeed;
                this.paddle2.setVelocity(p2Vx, p2Vy);
            }
        }

        if (this.restrictField) {
            if (this.paddle1.x > this.baseW / 2 - this.PADDLE_RADIUS) {
                this.paddle1.x = this.baseW / 2 - this.PADDLE_RADIUS;
                if (this.paddle1.body.velocity.x > 0) this.paddle1.setVelocityX(0);
            }
            if (this.paddle2 && this.paddle2.x < this.baseW / 2 + this.PADDLE_RADIUS) {
                this.paddle2.x = this.baseW / 2 + this.PADDLE_RADIUS;
                if (this.paddle2.body.velocity.x < 0) this.paddle2.setVelocityX(0);
            }
        }

        this.handleAI();
        this.checkGoals();

        if (this.isGoalieMode) {
            const goalieSpeed = 800;
            const k1 = this.keysWASD;
            const v1 = this.virtualInput ? this.virtualInput.p1 : { up: false, down: false };
            const upG = k1.up.isDown || v1.up;
            const downG = k1.down.isDown || v1.down;

            if (upG) this.goal1Y -= goalieSpeed * (delta / 1000);
            if (downG) this.goal1Y += goalieSpeed * (delta / 1000);

            this.goal1Y = Phaser.Math.Clamp(this.goal1Y, this.fieldY, this.fieldY + this.fieldH - this.GOAL_SIZE);
            this.drawGoals();
        }
    }



    handleAI() {
        if (!this.puck) return;
        if (this.gameMode === '1p' || this.aiControlP1 || this.aiControlP2) {
            const aiSpeed = 400 * this.scaleFactor * (Persistence.isModifierActive('hardMode') ? 2 : 1);
            if ((this.gameMode === '1p' || this.aiControlP2) && this.paddle2) this.updatePaddleAI(this.paddle2, aiSpeed);
            if (this.aiControlP1 && this.paddle1) this.updatePaddleAI(this.paddle1, aiSpeed);
        }
    }

    updatePaddleAI(paddle, aiSpeed) {
        const isGravityStage = this.isGravityStage;
        const dist = Phaser.Math.Distance.Between(paddle.x, paddle.y, this.puck.x, this.puck.y);
        let isStuck = false;

        if (dist < paddle.radius * 1.5) {
            if (paddle.side === 'p2' && this.puck.x > paddle.x) isStuck = true;
            if (paddle.side === 'p1' && this.puck.x < paddle.x) isStuck = true;
        }

        if (isStuck) {
            const retreatX = (paddle.side === 'p1') ? (this.baseW * 0.15) : (this.baseW * 0.85);
            const retreatY = this.fieldY + this.fieldH / 2;
            if (isGravityStage) {
                const dir = (retreatX > paddle.x) ? 1 : -1;
                paddle.setVelocityX(dir * aiSpeed);
            } else {
                this.physics.moveTo(paddle.sprite, retreatX, retreatY, aiSpeed * 0.7);
            }
        } else {
            if (isGravityStage) {
                const dx = this.puck.x - paddle.x;
                const dy = this.puck.y - paddle.y;
                if (Math.abs(dx) > 10) {
                    paddle.setVelocityX(dx > 0 ? aiSpeed : -aiSpeed);
                } else {
                    paddle.setVelocityX(0);
                }
                if (dy < -80 && paddle.sprite.body.blocked.down) {
                    paddle.setVelocityY(-550);
                }
            } else {
                const phase = (paddle.side === 'p1') ? 0 : Math.PI;
                const jitter = Math.sin((this.time.now / 200) + phase) * 45;
                const targetY = Phaser.Math.Clamp(this.puck.y + jitter, this.fieldY + paddle.radius, this.fieldY + this.fieldH - paddle.radius);
                this.physics.moveTo(paddle.sprite, this.puck.x, targetY, aiSpeed);
            }
        }
    }

    toggleSplitMode() {
        if (this.gameMode !== '1p') return;
        this.isSplitMode = !this.isSplitMode;

        if (this.isSplitMode) {
            this.paddle1.radius = this.PADDLE_RADIUS / 1.5;
            this.paddle1.refreshVanity();
            this.paddle1.body.setCircle(this.paddle1.radius, -this.paddle1.radius, -this.paddle1.radius);

            this.paddle1B = new Paddle(this, this.paddle1.x, this.paddle1.y + 60, this.paddle1.radius, 0xff0000, 0xffaaaa, 'p1');
            this.physics.add.collider(this.puck.sprite, this.paddle1B.sprite, (p, pad) => this.hitPaddle(p, pad));
            this.showFartCloud('left');
        } else {
            if (this.paddle1B) {
                this.paddle1B.destroy();
                this.paddle1B = null;
            }
            this.paddle1.radius = this.PADDLE_RADIUS;
            this.paddle1.refreshVanity();
            this.paddle1.body.setCircle(this.paddle1.radius, -this.paddle1.radius, -this.paddle1.radius);
            this.showFartCloud('left');
        }
    }

    checkGoals() {
        if (!this.puck) return;
        const threshold = this.puck.radius + 30;

        if (this.puck.x < threshold) {
            const goalCenterY = this.goal1Y + this.GOAL_SIZE / 2;
            if (Math.abs(this.puck.y - goalCenterY) < this.GOAL_SIZE / 2 + 20) {
                this.onGoal('p2');
            }
        }

        if (this.puck.x > this.baseW - threshold) {
            const goalCenterY = this.goal2Y + this.GOAL_SIZE / 2;
            if (Math.abs(this.puck.y - goalCenterY) < this.GOAL_SIZE / 2 + 20) {
                this.onGoal('p1');
            }
        }
    }

    onGoal(scorer) {
        if (this.matchEnded || this.isWaitingForStart) return;
        this.isWaitingForStart = true;

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

        this.totalGoals++;
        const goalX = (scorer === 'p1') ? this.baseW : 0;
        const goalY = this.fieldY + this.fieldH / 2;
        this.createFireworks(goalX, goalY);

        if (this.totalGoals >= 3) {
            this.matchEnded = true;
            if (this.puck) this.puck.body.setVelocity(0, 0);
            if (this.paddle1) this.paddle1.setVelocity(0, 0);
            if (this.paddle2) this.paddle2.setVelocity(0, 0);

            this.showScoreText(scorer);
            this.time.delayedCall(1000, () => {
                this.scene.start('ResultScene', { mode: this.gameMode, stage: this.stageNum, score1: this.score1, score2: this.score2 });
            });
        } else {
            this.resetEntities();
            this.startReadyGoSequence(scorer);
        }
    }

    showScoreText(scorer) {
        if (!scorer) return;
        const scoreSideX = (scorer === 'p1') ? this.baseW * 0.25 : this.baseW * 0.75;
        const scoreTxt = this.add.text(scoreSideX, this.fieldH / 2, 'SCORE', {
            fontSize: '80px', fill: '#ffffff', fontStyle: 'bold', stroke: '#000000', strokeThickness: 8
        }).setOrigin(0.5);

        this.tweens.add({
            targets: scoreTxt,
            alpha: 0,
            duration: 200,
            ease: 'Linear',
            yoyo: true,
            repeat: 5,
            onComplete: () => scoreTxt.destroy()
        });
    }

    createFireworks(x, y) {
        for (let i = 0; i < 20; i++) {
            const circle = this.add.circle(x, y, 5, 0xffffff);
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * 200 + 100;
            const color = Phaser.Display.Color.RandomRGB();
            circle.setFillStyle(color.color);

            this.tweens.add({
                targets: circle,
                x: x + Math.cos(angle) * dist,
                y: y + Math.sin(angle) * dist,
                alpha: 0,
                scale: 2,
                duration: 1000,
                ease: 'Power2',
                onComplete: () => circle.destroy()
            });
        }
    }

    startReadyGoSequence(scorer = null) {
        this.isWaitingForStart = true;
        this.resetEntities();
        if (scorer) this.showScoreText(scorer);
        if (this.readyText) this.readyText.destroy();

        this.readyText = this.add.text(this.baseW / 2, 150, 'READY...', {
            fontSize: '100px', fill: '#ffff00', fontStyle: 'bold', stroke: '#000000', strokeThickness: 10
        }).setOrigin(0.5);

        this.time.delayedCall(1000, () => {
            if (this.readyText) {
                this.readyText.setText('GO!');
                this.readyText.setFill('#00ff00');
            }
            this.isWaitingForStart = false;
            this.time.delayedCall(1000, () => {
                if (this.readyText) this.readyText.destroy();
                this.readyText = null;
            });
        });
    }

    showFartCloud(side) { }

    resetEntities() {
        const centerY = this.fieldY + this.fieldH / 2;
        if (this.paddle1) this.paddle1.reset(this.p1SpawnX, this.p1SpawnY);
        if (this.paddle2) this.paddle2.reset(this.p2SpawnX, this.p2SpawnY);
        if (this.isSplitMode && this.paddle1B) this.paddle1B.reset(this.p1SpawnX, this.p1SpawnY + 60);
        if (this.puck) this.puck.reset(this.baseW / 2, centerY);
    }

    resetRound(loserSide) {
        const centerY = this.fieldY + this.fieldH / 2;
        if (this.puck) this.puck.reset(this.baseW / 2, centerY);
        const serveSpeed = 300 * this.scaleFactor;
        const randomY = Phaser.Math.Between(-200, 200);
        this.puck.body.setVelocity(loserSide === 'left' ? -serveSpeed : serveSpeed, randomY);
    }
}
