import { Persistence } from '../persistence.js';

export class Puck {
    constructor(scene, x, y, radius) {
        this.scene = scene;
        this.radius = radius;

        // Base Visual
        this.sprite = scene.add.circle(x, y, radius, 0xffffff).setStrokeStyle(2, 0xffffff);
        scene.physics.add.existing(this.sprite);
        this.sprite.body.setCircle(radius);
        this.sprite.body.setCollideWorldBounds(true);
        this.sprite.body.setBounce(0.9, 0.9);
        this.sprite.body.setDrag(50);

        this.refreshVanity();
    }

    get x() { return this.sprite.x; }
    get y() { return this.sprite.y; }
    get body() { return this.sprite.body; }

    set x(val) { this.sprite.x = val; }
    set y(val) { this.sprite.y = val; }

    refreshVanity() {
        const skinId = Persistence.getEquipped('puck', 'skin');
        if (skinId && this.scene.textures.exists(skinId)) {
            // If it's a circle, we might need to replace it with a sprite
            if (this.sprite.type === 'ArcadeSprite' || this.sprite.type === 'Sprite') {
                this.sprite.setTexture(skinId);
                this.sprite.setDisplaySize(this.radius * 2, this.radius * 2);
            } else {
                // It's a Circle object, replace with Sprite
                const oldBody = this.sprite.body;
                const vx = oldBody.velocity.x;
                const vy = oldBody.velocity.y;
                const oldX = this.sprite.x;
                const oldY = this.sprite.y;
                const oldMass = oldBody.mass;
                const oldBounceX = oldBody.bounce.x;
                const oldBounceY = oldBody.bounce.y;
                const oldDrag = oldBody.drag.x;

                this.sprite.destroy();
                this.sprite = this.scene.physics.add.sprite(oldX, oldY, skinId);
                this.sprite.setDisplaySize(this.radius * 2, this.radius * 2);
                this.sprite.body.setCircle(this.radius);
                this.sprite.body.setCollideWorldBounds(true);
                this.sprite.body.setBounce(oldBounceX, oldBounceY);
                this.sprite.body.setDrag(oldDrag);
                this.sprite.body.setMass(oldMass);
                this.sprite.body.setVelocity(vx, vy);
            }
        }
    }

    setMaxVelocity(val) {
        this.sprite.body.setMaxVelocity(val);
    }

    setGravityY(val) {
        this.sprite.body.setGravityY(val);
    }

    reset(x, y) {
        this.sprite.x = x;
        this.sprite.y = y;
        this.sprite.body.setVelocity(0, 0);
    }
}
