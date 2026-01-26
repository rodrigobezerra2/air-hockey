import { BaseGameScene } from '../BaseGameScene.js';
import { Paddle } from '../../entities/Paddle.js';
import { Puck } from '../../entities/Puck.js';

export class Stage12 extends BaseGameScene {
    constructor() {
        super('Stage12');
        this.timer = 10;
        this.timerActive = false;
        this.isTransit = false;
        this.puckOwner = 'p1'; // P1 starts
        this.p1Hot = 0;
        this.p2Hot = 0;
    }

    create() {
        super.create();
        this.timer = 10;
        this.timerActive = false;
        this.isTransit = false;
        this.puckOwner = 'p1';
        this.p1Hot = 0;
        this.p2Hot = 0;

        // Timer UI
        this.timerText = this.add.text(this.baseW / 2, 80, '10.000', {
            fontSize: '80px',
            fill: '#ff0000',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 8
        }).setOrigin(0.5);

        // Position Puck in front of P1
        this.puck.body.setVelocity(0, 0);
        this.puck.x = this.paddle1.x + 80;
        this.puck.y = this.paddle1.y;

        // Overlay instructions
        this.instructions = this.add.text(this.baseW / 2, this.baseH - 100, 'PRESS DOWN / S TO SEND!', {
            fontSize: '32px', fill: '#ffffff'
        }).setOrigin(0.5);

        // Graphics for Hot Bars
        this.hotGraphics = this.add.graphics();

        // Labels
        this.add.text(this.paddle1.x, this.paddle1.y - 80, 'HOT!', { fontSize: '24px', fill: '#ffaa00', fontStyle: 'bold' }).setOrigin(0.5);
        this.add.text(this.paddle2.x, this.paddle2.y - 80, 'HOT!', { fontSize: '24px', fill: '#ffaa00', fontStyle: 'bold' }).setOrigin(0.5);

        // Start timer when GO! happens
        // Overriding startReadyGoSequence slightly is hard, so we just check in update
    }

    update(time, delta) {
        if (this.matchEnded || this.isPaused) return;

        // Check for GO! to start timer
        if (!this.isWaitingForStart && !this.timerActive && this.timer > 0) {
            this.timerActive = true;
        }

        if (this.timerActive) {
            this.timer -= delta / 1000;
            if (this.timer <= 0) {
                this.timer = 0;
                this.timerText.setText("0.000"); // Ensure final display
                this.timerActive = false;
                this.explode();
                return; // FREEZE updates
            }
            this.timerText.setText(this.timer.toFixed(3));

            // Hot Bar Logic
            // 2s to fill (+1/2s), 4s to empty (-1/4s)
            if (!this.isTransit) {
                if (this.puckOwner === 'p1') {
                    this.p1Hot += delta / 2000;
                    this.p2Hot -= delta / 4000;
                } else {
                    this.p2Hot += delta / 2000;
                    this.p1Hot -= delta / 4000;
                }
            } else {
                this.p1Hot -= delta / 4000;
                this.p2Hot -= delta / 4000;
            }

            this.p1Hot = Phaser.Math.Clamp(this.p1Hot, 0, 1);
            this.p2Hot = Phaser.Math.Clamp(this.p2Hot, 0, 1);

            // Auto-send
            if (this.p1Hot >= 1 && this.puckOwner === 'p1' && !this.isTransit) {
                this.sendPuck('p2');
            } else if (this.p2Hot >= 1 && this.puckOwner === 'p2' && !this.isTransit) {
                this.sendPuck('p1');
            }

            this.drawHotBars();
        }

        // Handle Input (S or Down)
        const k1 = this.keysWASD;
        const v1 = this.virtualInput ? this.virtualInput.p1 : { down: false };
        const k2 = this.cursors;
        const v2 = this.virtualInput ? this.virtualInput.p2 : { down: false };

        const downP1 = Phaser.Input.Keyboard.JustDown(k1.down) || v1.down;
        const downP2 = Phaser.Input.Keyboard.JustDown(k2.down) || v2.down;

        if (downP1 && this.puckOwner === 'p1' && !this.isTransit) {
            this.sendPuck('p2');
        } else if (downP2 && this.puckOwner === 'p2' && !this.isTransit && this.gameMode === '2p') {
            this.sendPuck('p1');
        }

        // CPU Logic
        if (this.gameMode === '1p' && this.puckOwner === 'p2' && !this.isTransit && !this.matchEnded) {
            if (!this.cpuReactTimer) {
                this.cpuReactTimer = this.time.delayedCall(Phaser.Math.Between(200, 500), () => {
                    this.sendPuck('p1');
                    this.cpuReactTimer = null;
                });
            }
        }

        // Prevent movement
        if (this.paddle1) this.paddle1.setVelocity(0, 0);
        if (this.paddle2) this.paddle2.setVelocity(0, 0);
    }

    drawHotBars() {
        this.hotGraphics.clear();

        const barW = 120;
        const barH = 15;

        const drawBar = (x, y, value) => {
            // Bg
            this.hotGraphics.fillStyle(0x333333);
            this.hotGraphics.fillRect(x - barW / 2, y, barW, barH);
            // Fill
            this.hotGraphics.fillStyle(0xffaa00);
            this.hotGraphics.fillRect(x - barW / 2, y, barW * value, barH);
            // Border
            this.hotGraphics.lineStyle(2, 0xffffff);
            this.hotGraphics.strokeRect(x - barW / 2, y, barW, barH);
        };

        drawBar(this.paddle1.x, this.paddle1.y - 60, this.p1Hot);
        drawBar(this.paddle2.x, this.paddle2.y - 60, this.p2Hot);
    }

    sendPuck(target) {
        this.isTransit = true;
        const targetX = (target === 'p2') ? (this.paddle2.x - 80) : (this.paddle1.x + 80);
        const targetY = (target === 'p2') ? this.paddle2.y : this.paddle1.y;

        this.tweens.add({
            targets: this.puck,
            x: targetX,
            y: targetY,
            duration: 500,
            ease: 'Linear',
            onComplete: () => {
                this.isTransit = false;
                this.puckOwner = target;
            }
        });
    }

    explode() {
        this.matchEnded = true;

        // Stop transit and CPU reaction
        this.tweens.killTweensOf(this.puck);
        if (this.cpuReactTimer) {
            this.cpuReactTimer.remove();
            this.cpuReactTimer = null;
        }

        // Visual Explosion
        if (this.puck.sprite.setTint) {
            this.puck.sprite.setTint(0xffaa00);
        } else if (this.puck.sprite.setFillStyle) {
            this.puck.sprite.setFillStyle(0xffaa00);
        }
        this.puck.sprite.setScale(3);
        this.createFireworks(this.puck.x, this.puck.y);

        // Determine Winner
        const isP1Side = this.puck.x < this.baseW / 2;
        const winner = isP1Side ? 'p2' : 'p1';

        if (winner === 'p1') {
            this.score1 = 3; this.score2 = 0;
        } else {
            this.score1 = 0; this.score2 = 3;
        }

        // Custom Win Text
        let winTextStr = "";
        if (winner === 'p1') {
            winTextStr = "PLAYER 1 WINS!";
        } else {
            winTextStr = (this.gameMode === '1p') ? "CPU WINS!" : "PLAYER 2 WINS!";
        }

        const winTxt = this.add.text(this.baseW / 2, this.baseH / 2, winTextStr, {
            fontSize: '80px',
            fill: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 8
        }).setOrigin(0.5).setDepth(1001);

        // Blink effect
        this.tweens.add({
            targets: winTxt,
            alpha: 0,
            duration: 200,
            yoyo: true,
            repeat: -1
        });

        // Freeze world
        this.physics.world.pause();

        this.time.delayedCall(2500, () => {
            this.scene.start('ResultScene', {
                mode: this.gameMode,
                stage: this.stageNum,
                score1: this.score1,
                score2: this.score2
            });
        });
    }

    // Block normal goals
    checkGoals() { }
}
