import { BaseGameScene } from '../BaseGameScene.js';
import { Paddle } from '../../entities/Paddle.js';

export class Stage9 extends BaseGameScene {
    constructor() { super('Stage9'); }

    configureField() {
        this.isGravityStage = true;
        this.fieldH = 800;
        this.PADDLE_RADIUS = 25;
        this.SHOOT_FORCE = 1200;
        this.RELOAD_TIME = 5000;
    }

    create() {
        super.create();
        this.p1Angle = -45;
        this.p2Angle = -135;
        this.p1Status = 'reloading'; // 'ready', 'fired', 'reloading'
        this.p2Status = 'reloading';

        // Gravities
        this.paddle1.sprite.body.setGravityY(800);
        this.paddle2.sprite.body.setGravityY(800);
        // Disable immovability so they bounce
        this.paddle1.sprite.body.setImmovable(false);
        this.paddle2.sprite.body.setImmovable(false);
        this.paddle1.sprite.body.setBounce(0.8);
        this.paddle2.sprite.body.setBounce(0.8);

        // Collision between cannon balls
        this.physics.add.collider(this.paddle1.sprite, this.paddle2.sprite);

        // No puck in this stage, players are the pucks
        if (this.puck) {
            this.puck.sprite.destroy();
            this.puck = null;
        }

        // Cannon Graphics
        this.cannons = this.add.graphics();

        // Initial Reload
        this.time.delayedCall(1000, () => this.reloadPlayer(1));
        this.time.delayedCall(1000, () => this.reloadPlayer(2));

        this.createTargets();
    }

    createTargets() {
        this.p1Targets = this.physics.add.staticGroup();
        this.p2Targets = this.physics.add.staticGroup();

        const x1 = 50;
        const x2 = this.baseW - 50;
        const yCoords = [200, 400, 600];

        yCoords.forEach(y => {
            // Targets on the left (P1's side) - to be hit by P2
            this.createTarget(x1, y, this.p1Targets, 0x0000ff);
            // Targets on the right (P2's side) - to be hit by P1
            this.createTarget(x2, y, this.p2Targets, 0xff0000);
        });
    }

    createTarget(x, y, group, color) {
        const target = this.add.container(x, y);
        const radius = 40;

        // Layer 1: Red outer
        const c1 = this.add.circle(0, 0, radius, 0xff0000);
        // Layer 2: White
        const c2 = this.add.circle(0, 0, radius * 0.75, 0xffffff);
        // Layer 3: Red
        const c3 = this.add.circle(0, 0, radius * 0.5, 0xff0000);
        // Layer 4: White center
        const c4 = this.add.circle(0, 0, radius * 0.25, 0xffffff);

        target.add([c1, c2, c3, c4]);

        // Add physics sprite as a proxy for the container (Arcade doesn't support container bodies well)
        const proxy = this.add.circle(x, y, radius, 0x000000, 0); // Invisible
        this.physics.add.existing(proxy, true); // Static
        proxy.targetContainer = target;
        group.add(proxy);
    }

    reloadPlayer(pNum) {
        const x = (pNum === 1) ? 50 : this.baseW - 50;
        const pad = (pNum === 1) ? this.paddle1 : this.paddle2;
        pad.reset(x, -200);
        pad.setVelocity(0, 500);
        this['p' + pNum + 'Status'] = 'reloading';
    }

    update(time, delta) {
        if (this.matchEnded || this.isPaused) return;

        // --- Controls ---
        const k1 = this.keysWASD;
        const v1 = this.virtualInput ? this.virtualInput.p1 : { up: false, down: false, left: false, right: false };
        const k2 = this.cursors;
        const v2 = this.virtualInput ? this.virtualInput.p2 : { up: false, down: false, left: false, right: false };

        const left1 = k1.left.isDown || v1.left;
        const right1 = k1.right.isDown || v1.right;
        const left2 = k2.left.isDown || v2.left;
        const right2 = k2.right.isDown || v2.right;

        // Aiming P1 (Left Side)
        if (left1) this.p1Angle -= 2;
        if (right1) this.p1Angle += 2;
        this.p1Angle = Phaser.Math.Clamp(this.p1Angle, -90, 0);

        // Aiming P2 (Right Side)
        if (left2) this.p2Angle -= 2;
        if (right2) this.p2Angle += 2;
        this.p2Angle = Phaser.Math.Clamp(this.p2Angle, -180, -90);

        // Locking Logic
        const p1Base = { x: 50, y: this.fieldH - 50 };
        const p2Base = { x: this.baseW - 50, y: this.fieldH - 50 };

        if (this.p1Status === 'reloading') {
            if (Phaser.Math.Distance.Between(this.paddle1.x, this.paddle1.y, p1Base.x, p1Base.y) < 40) {
                this.p1Status = 'ready';
            }
        }
        if (this.p2Status === 'reloading') {
            if (Phaser.Math.Distance.Between(this.paddle2.x, this.paddle2.y, p2Base.x, p2Base.y) < 40) {
                this.p2Status = 'ready';
            }
        }

        if (this.p1Status === 'ready') {
            this.paddle1.reset(p1Base.x, p1Base.y);
            if (k1.down.isDown || v1.down) this.fire(1);
        }
        if (this.p2Status === 'ready') {
            this.paddle2.reset(p2Base.x, p2Base.y);
            if (k2.down.isDown || v2.down) this.fire(2);
        }

        this.drawCannons();
        this.handleTargetCollisions();
    }

    handleTargetCollisions() {
        // P1 hits P2's targets (Right side)
        this.physics.overlap(this.paddle1.sprite, this.p2Targets, (pad, target) => {
            this.destroyTarget(target, 1);
        });

        // P2 hits P1's targets (Left side)
        this.physics.overlap(this.paddle2.sprite, this.p1Targets, (pad, target) => {
            this.destroyTarget(target, 2);
        });
    }

    destroyTarget(target, pNum) {
        if (!target.active) return;
        target.setActive(false).setVisible(false);
        if (target.targetContainer) target.targetContainer.destroy();
        target.destroy();

        if (pNum === 1) {
            this.score1++;
            this.scoreText1.setText(this.score1);
        } else {
            this.score2++;
            this.scoreText2.setText(this.score2);
        }

        // Immediate reload on hit
        if (this['p' + pNum + 'ReloadTimer']) {
            this['p' + pNum + 'ReloadTimer'].remove();
        }
        this.reloadPlayer(pNum);

        if (this.score1 >= 3 || this.score2 >= 3) {
            this.matchEnded = true;
            this.time.delayedCall(500, () => this.scene.start('ResultScene', { score1: this.score1, score2: this.score2, stage: 9 }));
        }
    }

    fire(pNum) {
        const pad = (pNum === 1) ? this.paddle1 : this.paddle2;
        const angle = (pNum === 1) ? this.p1Angle : this.p2Angle;
        const rad = Phaser.Math.DegToRad(angle);

        pad.setVelocity(Math.cos(rad) * this.SHOOT_FORCE, Math.sin(rad) * this.SHOOT_FORCE);
        this['p' + pNum + 'Status'] = 'fired';

        // Store timer to allow cancellation if target is hit early
        this['p' + pNum + 'ReloadTimer'] = this.time.delayedCall(this.RELOAD_TIME, () => this.reloadPlayer(pNum));
    }

    drawCannons() {
        this.cannons.clear();
        this.cannons.lineStyle(4, 0x888888);
        this.cannons.fillStyle(0x333333, 1);

        // P1 Cannon
        const p1X = 50, p1Y = this.fieldH - 50;
        this.drawCannonBarrel(p1X, p1Y, this.p1Angle);

        // P2 Cannon
        const p2X = this.baseW - 50, p2Y = this.fieldH - 50;
        this.drawCannonBarrel(p2X, p2Y, this.p2Angle);
    }

    drawCannonBarrel(x, y, angle) {
        const rad = Phaser.Math.DegToRad(angle);
        const length = 80;
        const endX = x + Math.cos(rad) * length;
        const endY = y + Math.sin(rad) * length;

        this.cannons.lineStyle(20, 0x555555);
        this.cannons.lineBetween(x, y, endX, endY);
        this.cannons.fillStyle(0x333333);
        this.cannons.fillCircle(x, y, 40);
    }

}
