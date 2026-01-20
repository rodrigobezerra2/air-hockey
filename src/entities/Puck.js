export class Puck {
    constructor(scene, x, y, radius) {
        this.scene = scene;
        this.radius = radius;

        this.sprite = scene.add.circle(x, y, radius, 0xffffff).setStrokeStyle(2, 0xffffff);
        scene.physics.add.existing(this.sprite);
        this.sprite.body.setCircle(radius);
        this.sprite.body.setCollideWorldBounds(true);
        this.sprite.body.setBounce(0.9, 0.9);
        this.sprite.body.setDrag(50);
    }

    get x() { return this.sprite.x; }
    get y() { return this.sprite.y; }
    get body() { return this.sprite.body; }

    set x(val) { this.sprite.x = val; }
    set y(val) { this.sprite.y = val; }

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
