import { Persistence } from '../persistence.js';

export class Paddle extends Phaser.GameObjects.Container {
    constructor(scene, x, y, radius, color, splitColor, playerId) {
        super(scene, x, y);
        this.scene = scene;
        this.radius = radius;
        this.color = color;
        this.splitColor = splitColor;
        this.playerId = playerId; // 'p1' or 'p2'
        this.baseSpeed = 600;

        // Base Circle Visual
        this.baseCircle = scene.add.circle(0, 0, radius, color).setStrokeStyle(2, splitColor);
        this.add(this.baseCircle);

        // Add to scene and physics
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.sprite = this; // Compat with existing code that uses .sprite.body
        this.body.setCircle(radius, -radius, -radius);
        this.body.setCollideWorldBounds(true);
        this.body.setImmovable(true);

        // State properties
        this.facing = (playerId === 'p1') ? 1 : -1;
        this.active = true;
        this.stunned = false;

        // Vanity Layers
        this.vanityEyes = null;
        this.vanityMouth = null;
        this.vanityHat = null;
        this.vanityMoustache = null;

        this.refreshVanity();
    }

    refreshVanity() {
        const pId = this.playerId;
        const scaleFactor = this.radius / 30;

        // Helper to update/create vanity sprite
        const updateLayer = (category, currentSprite, offset = { x: 0, y: 0 }) => {
            const itemId = Persistence.getEquipped(pId, category);
            if (currentSprite) {
                this.remove(currentSprite);
                currentSprite.destroy();
            }
            if (itemId && this.scene.textures.exists(itemId)) {
                const s = this.scene.add.sprite(offset.x, offset.y, itemId);
                s.setScale(scaleFactor);
                this.add(s);
                return s;
            }
            return null;
        };

        this.vanityEyes = updateLayer('eyes', this.vanityEyes, { x: 0, y: -5 * scaleFactor });

        // Specialized Eyes
        const eyeId = Persistence.getEquipped(pId, 'eyes');

        // Cleanup specialized layers
        [this.targetingBase, this.pupilL, this.pupilR, this.eyePatch].forEach(l => {
            if (l) { this.remove(l); l.destroy(); }
        });
        this.targetingBase = null; this.pupilL = null; this.pupilR = null; this.eyePatch = null;

        if (this.vanityEyes) { // If it's a specialized one, we might want to hide the standard sprite
            if (['eyes_targeting', 'eyes_pirate', 'eyes_moving'].includes(eyeId)) {
                this.remove(this.vanityEyes); this.vanityEyes.destroy();
                this.vanityEyes = null;
            }
        }

        if (eyeId === 'eyes_targeting') {
            this.targetingBase = this.scene.add.sprite(0, -5 * scaleFactor, 'eyes_targeting_base').setScale(scaleFactor);
            this.pupilL = this.scene.add.sprite(-10 * scaleFactor, -5 * scaleFactor, 'eyes_targeting_pupil').setScale(scaleFactor);
            this.pupilR = this.scene.add.sprite(10 * scaleFactor, -5 * scaleFactor, 'eyes_targeting_pupil').setScale(scaleFactor);
            this.add([this.targetingBase, this.pupilL, this.pupilR]);
            this.vanityEyes = this.targetingBase;
        } else if (eyeId === 'eyes_pirate') {
            this.targetingBase = this.scene.add.sprite(-10 * scaleFactor, -5 * scaleFactor, 'eyes_targeting_base').setScale(0.5 * scaleFactor, 1 * scaleFactor);
            this.pupilL = this.scene.add.sprite(-10 * scaleFactor, -5 * scaleFactor, 'eyes_targeting_pupil').setScale(scaleFactor);
            this.eyePatch = this.scene.add.sprite(0, -5 * scaleFactor, 'eyes_pirate_patch').setScale(scaleFactor);
            this.add([this.targetingBase, this.pupilL, this.eyePatch]);
            this.vanityEyes = this.eyePatch;
        } else if (eyeId === 'eyes_moving') {
            this.targetingBase = this.scene.add.sprite(0, -5 * scaleFactor, 'eyes_targeting_base').setScale(scaleFactor);
            this.pupilL = this.scene.add.sprite(-10 * scaleFactor, -5 * scaleFactor, 'eyes_moving_pupil').setScale(scaleFactor);
            this.pupilR = this.scene.add.sprite(10 * scaleFactor, -5 * scaleFactor, 'eyes_moving_pupil').setScale(scaleFactor);
            this.add([this.targetingBase, this.pupilL, this.pupilR]);
            this.vanityEyes = this.targetingBase;
        }

        this.vanityMouth = updateLayer('mouth', this.vanityMouth, { x: 0, y: 10 * scaleFactor });
        this.vanityHat = updateLayer('hat', this.vanityHat, { x: 0, y: -this.radius - (12 * scaleFactor) });
        this.vanityMoustache = updateLayer('moustache', this.vanityMoustache, { x: 0, y: 5 * scaleFactor });

        // Ensure hat is always on top
        if (this.vanityHat) this.bringToTop(this.vanityHat);
    }

    reset(x, y) {
        this.x = x;
        this.y = y;
        if (this.body) this.body.setVelocity(0, 0);
    }

    setVelocity(vx, vy) {
        if (this.stunned) return;
        if (this.body) this.body.setVelocity(vx, vy);
    }

    setVelocityX(vx) {
        if (this.stunned) return;
        if (this.body) this.body.setVelocityX(vx);
    }

    setVelocityY(vy) {
        if (this.stunned) return;
        if (this.body) this.body.setVelocityY(vy);
    }

    preUpdate(time, delta) {
        const eyeId = Persistence.getEquipped(this.playerId, 'eyes');
        const puck = this.scene.puck;

        if (eyeId === 'eyes_targeting' && puck) {
            const updatePupil = (pupil, centerX, centerY) => {
                const angle = Phaser.Math.Angle.Between(this.x + centerX, this.y + centerY, puck.x, puck.y);
                const dist = 3;
                pupil.x = centerX + Math.cos(angle) * dist;
                pupil.y = centerY + Math.sin(angle) * dist;
            };
            updatePupil(this.pupilL, -10, -5);
            updatePupil(this.pupilR, 10, -5);
        } else if (eyeId === 'eyes_pirate' && puck) {
            const angle = Phaser.Math.Angle.Between(this.x - 10, this.y - 5, puck.x, puck.y);
            this.pupilL.x = -10 + Math.cos(angle) * 3;
            this.pupilL.y = -5 + Math.sin(angle) * 3;
        } else if (eyeId === 'eyes_moving') {
            // One CW, one CCW
            const speed = time / 200;
            this.pupilL.x = -10 + Math.cos(speed) * 3;
            this.pupilL.y = -5 + Math.sin(speed) * 3;
            this.pupilR.x = 10 + Math.cos(-speed) * 3;
            this.pupilR.y = -5 + Math.sin(-speed) * 3;
        }
    }
}
