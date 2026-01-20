export class Fireball {
    constructor(scene, x, y, facing, speed, owner) {
        this.scene = scene;
        this.owner = owner;
        this.sprite = scene.fireballs.create(x, y, 'fireball');
        this.sprite.owner = owner; // Store on sprite for collision checks
        this.sprite.body.setAllowGravity(false);
        this.sprite.body.setVelocityX(facing * speed);

        // Auto-destroy after 2 seconds
        scene.time.delayedCall(2000, () => {
            if (this.sprite.active) {
                this.sprite.destroy();
            }
        });
    }

    static createTexture(scene) {
        if (scene.textures.exists('fireball')) return;
        const g = scene.make.graphics({ x: 0, y: 0, add: false });
        g.fillStyle(0xff4400, 1); g.fillCircle(15, 15, 15);
        g.fillStyle(0xffff00, 1); g.fillCircle(15, 15, 8);
        g.generateTexture('fireball', 30, 30);
        g.destroy();
    }
}
