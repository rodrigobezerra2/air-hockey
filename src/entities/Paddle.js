export class Paddle {
    constructor(scene, x, y, radius, color, splitColor) {
        this.scene = scene;
        this.radius = radius;
        this.baseSpeed = 600;

        // Create Visuals
        this.sprite = scene.add.circle(x, y, radius, color).setStrokeStyle(2, splitColor);
        scene.physics.add.existing(this.sprite);
        this.sprite.body.setCircle(radius);
        this.sprite.body.setCollideWorldBounds(true);
        this.sprite.body.setImmovable(true);

        // State properties
        this.facing = 1; // 1 = Right, -1 = Left
        this.active = true;
        this.stunned = false;
    }

    get x() { return this.sprite.x; }
    get y() { return this.sprite.y; }
    get body() { return this.sprite.body; }

    set x(val) { this.sprite.x = val; }
    set y(val) { this.sprite.y = val; }

    reset(x, y) {
        this.sprite.x = x;
        this.sprite.y = y;
        if (this.sprite.body) this.sprite.body.setVelocity(0, 0);
    }

    setVelocity(x, y) {
        if (this.stunned) return;
        if (this.sprite && this.sprite.body) this.sprite.body.setVelocity(x, y);
    }

    setVelocityX(x) {
        if (this.stunned) return;
        if (this.sprite && this.sprite.body) this.sprite.body.setVelocityX(x);
    }

    setVelocityY(y) {
        if (this.stunned) return;
        if (this.sprite && this.sprite.body) this.sprite.body.setVelocityY(y);
    }
}
