import { BaseGameScene } from '../BaseGameScene.js';

export class Stage7 extends BaseGameScene {
    constructor() { super('Stage7'); }

    create() {
        super.create();
        this.createObstacleTexture();

        this.obstacles = this.physics.add.group({ immovable: true, allowGravity: false });

        const w = this.baseW;
        const h = this.fieldH; // Use fieldH for vertical calc
        const cx1 = w * 0.25;
        const cx2 = w * 0.75;

        // P1 Diamond
        this.createDiamond(cx1, h);

        // P2 Diamond
        this.createDiamond(cx2, h);

        // Collisions
        // Puck vs Obstacles
        this.physics.add.collider(this.puck.sprite, this.obstacles);

        // Players vs Obstacles (Manual Separation for Immovable vs Immovable)
        this.physics.add.collider(this.paddle1.sprite, this.obstacles, null, (pad, obs) => this.resolvePaddleCollision(pad, obs));
        this.physics.add.collider(this.paddle2.sprite, this.obstacles, null, (pad, obs) => this.resolvePaddleCollision(pad, obs));
    }

    resolvePaddleCollision(paddle, obstacle) {
        const pBody = paddle.body;
        const oBody = obstacle.body;

        const dist = Phaser.Math.Distance.Between(oBody.center.x, oBody.center.y, pBody.center.x, pBody.center.y);
        const minDist = pBody.radius + oBody.radius;

        if (dist < minDist) {
            // Calculate overlap
            const overlap = minDist - dist;

            // Vector from Obstacle to Paddle (Direction to push out)
            const angle = Phaser.Math.Angle.Between(oBody.center.x, oBody.center.y, pBody.center.x, pBody.center.y);

            // Push paddle out freely (direct position manipulation)
            const vec = this.physics.velocityFromRotation(angle, overlap);
            paddle.x += vec.x;
            paddle.y += vec.y;

            // OPTIONAL: Kill velocity component towards obstacle to prevent "jitter" 
            // but usually position correction is enough for a "slide" feel.
            return false; // Return false to generic collide (we handled it)
        }
        return false;
    }

    createDiamond(cx, h) {
        const addObstacle = (x, y) => {
            const obs = this.obstacles.create(x, y, 'obstacle');
            obs.body.setCircle(30); // Match graphics radius
            obs.refreshBody(); // Important for static bodies
        };

        // North (H/3)
        addObstacle(cx, h / 3);
        // South (2H/3)
        addObstacle(cx, (h / 3) * 2);
        // Left (Aligned with Goal H/2)
        addObstacle(cx - 150, h / 2);
        // Right
        addObstacle(cx + 150, h / 2);
    }

    createObstacleTexture() {
        if (this.textures.exists('obstacle')) return;
        const g = this.make.graphics({ add: false });
        g.fillStyle(0x00ff00); // Green
        g.fillCircle(30, 30, 30); // Radius 30 (+50%)
        g.generateTexture('obstacle', 60, 60);
        g.destroy();
    }
}
