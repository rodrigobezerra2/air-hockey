import { BaseGameScene } from '../BaseGameScene.js';
import { Puck } from '../../entities/Puck.js';
import { Persistence } from '../../persistence.js';
import { Localization } from '../../utils/Localization.js';

export class Stage15 extends BaseGameScene {
    constructor() {
        super('Stage15');
        this.nextCPUMash = 0;
        this.mashPower = 160; // Doubled again (was 80)
        this.trackSpeed = 800; // Faster tracking to feel reactive
        this.prevP1MashVirtual = false;
        this.prevP2MashVirtual = false;
    }

    configureField() {
        // In Tug-of-War, the "goal" is the entire end line
        this.GOAL_SIZE = this.fieldH;
        const centerY = this.fieldY + this.fieldH / 2;
        this.goal1Y = centerY - this.GOAL_SIZE / 2;
        this.goal2Y = centerY - this.GOAL_SIZE / 2;
    }

    create() {
        super.create();

        // Lock Y positions to the center
        const centerY = this.fieldY + this.fieldH / 2;
        this.centerY = centerY;

        if (this.puck) {
            this.puck.sprite.setY(centerY);
            this.puck.body.setAllowGravity(false);
            this.puck.body.setDrag(2000, 0); // Very high drag for impulse-only movement
            this.puck.body.setBounce(0, 0);
        }

        if (this.paddle1) this.paddle1.sprite.setY(centerY);
        if (this.paddle2) this.paddle2.sprite.setY(centerY);

        // UI Instructions
        this.instructionsText = this.add.text(this.baseW / 2, this.baseH - 50, Localization.get('STAGE_15_INSTRUCTIONS') || 'MASH [S] / [DOWN] TO PUSH!', {
            fontSize: '32px', fill: '#ffff00', fontStyle: 'bold'
        }).setOrigin(0.5);
    }

    update(time, delta) {
        if (this.matchEnded || this.isPaused || this.isWaitingForStart) return;

        // 1. Lock Puck and Paddles to Y-center and Handle Tracking
        if (this.puck) {
            this.puck.sprite.setY(this.centerY);
            this.puck.body.setVelocityY(0);
        }

        const trackCapped = (paddle, targetX) => {
            const diff = targetX - paddle.x;
            const maxTrack = 400; // Normal speed cap
            let vel = diff * 5;
            if (Math.abs(vel) > maxTrack) vel = Math.sign(vel) * maxTrack;
            paddle.body.setVelocityX(vel);
            paddle.sprite.setY(this.centerY);
            paddle.body.setVelocityY(0);
        };

        if (this.paddle1) {
            const targetX = this.puck.x - this.puck.radius - this.paddle1.radius + 5;
            trackCapped(this.paddle1, targetX);
        }
        if (this.paddle2) {
            const targetX = this.puck.x + this.puck.radius + this.paddle2.radius - 5;
            trackCapped(this.paddle2, targetX);
        }

        // 2. Handle Mashing Input
        const k1 = this.keysWASD;
        const v1 = this.virtualInput ? (this.virtualInput.p1.up || this.virtualInput.p1.down) : false;
        const p1Mash = Phaser.Input.Keyboard.JustDown(k1.up) ||
            Phaser.Input.Keyboard.JustDown(k1.down) ||
            Phaser.Input.Keyboard.JustDown(k1.left) ||
            Phaser.Input.Keyboard.JustDown(k1.right) ||
            (v1 && !this.prevP1MashVirtual);

        this.prevP1MashVirtual = v1;

        if (p1Mash) {
            this.pushPuck(1); // Push Right
            this.showPushEffect(this.paddle1.x + this.paddle1.radius, 'right');
        }

        const k2 = this.keysArrows;
        const v2 = this.virtualInput ? (this.virtualInput.p2.up || this.virtualInput.p2.down) : false;
        const p2Mash = (this.gameMode === '2p' && (
            Phaser.Input.Keyboard.JustDown(k2.up) ||
            Phaser.Input.Keyboard.JustDown(k2.down) ||
            Phaser.Input.Keyboard.JustDown(k2.left) ||
            Phaser.Input.Keyboard.JustDown(k2.right))) ||
            (v2 && !this.prevP2MashVirtual);

        this.prevP2MashVirtual = v2;

        if (p2Mash) {
            this.pushPuck(-1); // Push Left
            this.showPushEffect(this.paddle2.x - this.paddle2.radius, 'left');
        }

        // 3. AI Mashing Logic
        if (this.gameMode === '1p' && time > this.nextCPUMash) {
            this.cpuMash(time);
        }

        // 4. Check Win Condition
        this.checkTugOfWarGoals();
    }

    handleAI() {
        // Disable standard AI movement which competes with tug-of-war tracking
    }

    createPuck() {
        // Override to add puck WITHOUT colliders to paddles
        const centerY = this.fieldY + this.fieldH / 2;
        this.puck = new Puck(this, this.baseW / 2, centerY, 100);
        this.puck.body.setMass(5);
        this.puck.body.setDrag(1500, 0);
        this.puck.body.setBounce(0, 0);
        this.puck.body.setCollideWorldBounds(true);
    }

    pushPuck(dir) {
        if (!this.puck) return;
        const currentVel = this.puck.body.velocity.x;
        // Apply impulse (Power increased to overcome drag)
        this.puck.body.setVelocityX(currentVel + (dir * this.mashPower));
    }

    showPushEffect(x, direction) {
        const ring = this.add.circle(x, this.centerY, 40).setStrokeStyle(4, 0xffffff);
        this.tweens.add({
            targets: ring,
            scale: 2,
            alpha: 0,
            duration: 200,
            onComplete: () => ring.destroy()
        });
    }

    cpuMash(time) {
        // Capped at 7.5 pushes per second (133ms delay), a 50% increase from 5/sec.
        const intensity = Persistence.isModifierActive('hardMode') ? 1.2 : 1.0;
        // Add some jitter so it's not a perfectly steady pulse
        const baseDelay = 133 / intensity;
        const jitter = Phaser.Math.Between(-20, 20);

        this.pushPuck(-1);
        this.showPushEffect(this.paddle2.x - this.paddle2.radius, 'left');
        this.nextCPUMash = time + Math.max(50, baseDelay + jitter);
    }

    checkTugOfWarGoals() {
        const p1Threshold = 80;
        const p2Threshold = this.baseW - 80;

        if (this.paddle1.x < p1Threshold) {
            this.onGoal('p2');
        } else if (this.paddle2.x > p2Threshold) {
            this.onGoal('p1');
        }
    }

    onGoal(scorer) {
        if (this.matchEnded || this.isWaitingForStart) return;
        super.onGoal(scorer);
    }

    // Override to prevent standard puck reset behavior
    resetEntities() {
        super.resetEntities();
        if (this.puck) {
            const centerY = this.fieldY + this.fieldH / 2;
            this.puck.sprite.setPosition(this.baseW / 2, centerY);
            this.puck.body.setVelocity(0, 0);
        }
    }
}
