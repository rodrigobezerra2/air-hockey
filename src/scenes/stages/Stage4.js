import { BaseGameScene } from '../BaseGameScene.js';

export class Stage4 extends BaseGameScene {
    constructor() { super('Stage4'); }
    configureField() {
        // Gravity Mode
        this.isGravityStage = true;
        this.fieldH = 800; // Normal Size
    }

    create() {
        super.create();
        // Enable Gravity for entities
        this.paddle1.sprite.body.setGravityY(500);
        this.paddle2.sprite.body.setGravityY(500);
        this.puck.sprite.body.setGravityY(500);

        // Remove Immovable so they fall (but collide with bounds)
        this.paddle1.sprite.body.setImmovable(false);
        // this.paddle1.sprite.body.setMass(100); 

        this.createRamps();
    }

    createRamps() {
        // Create triangular ramps at bottom corners
        const rampSize = 100;
        const groundY = this.fieldY + this.fieldH;

        // Left Ramp (Slope up to right)
        // Graphics for visuals
        const g = this.add.graphics();
        g.fillStyle(0x555555, 1);

        // Left Triangle
        g.beginPath();
        g.moveTo(0, groundY);
        g.lineTo(rampSize, groundY);
        g.lineTo(0, groundY - rampSize);
        g.fillPath();

        // Right Triangle
        g.beginPath();
        g.moveTo(this.baseW, groundY);
        g.lineTo(this.baseW - rampSize, groundY);
        g.lineTo(this.baseW, groundY - rampSize);
        g.fillPath();

        // Physics Bodies (Static)
        // Note: Phaser Arcade Physics supports rectangles and circles mostly. 
        // Triangles are hard. We can approximate with a rotated rectangle or just a blocking rect.
        // Or user `setBody` with custom shape? Complex.
        // Simplest approximation: A 45 degree rotated rectangle? 
        // Or just let it be visual and assume puck bounces? 
        // User explicitly asked for "ramp... allows players to hit the puck".
        // Let's use a static physics body that is invisible but provides the slope? 
        // Arcade physics doesn't do slopes well. 
        // Maybe just a small kicker?
        // Actually, let's skip complex slopes for now and focus on functionality if they just meant "visual" or "funnel".
        // But "ramp" implies physics.
        // Let's try to add a static body rotated 45 degrees.

        // Left Ramp
        // Arcade Physics DOES NOT support rotated bodies. 
        // We use steps instead. 
        // We might have to approximate with steps.
        // Steps: 3 small rects?
        for (let i = 0; i < 3; i++) {
            const h = (i + 1) * 30;
            const w = 30;
            const step = this.add.rectangle(i * 30 + 15, groundY - h / 2, w, h, 0x555555);
            this.physics.add.existing(step, true);
            this.physics.add.collider(this.puck.sprite, step);
            this.physics.add.collider(this.paddle1.sprite, step);
            this.physics.add.collider(this.paddle2.sprite, step);
        }

        // Right Ramp Steps
        for (let i = 0; i < 3; i++) {
            const h = (i + 1) * 30;
            const w = 30;
            const step = this.add.rectangle(this.baseW - (i * 30) - 15, groundY - h / 2, w, h, 0x555555);
            this.physics.add.existing(step, true);
            this.physics.add.collider(this.puck.sprite, step);
            this.physics.add.collider(this.paddle1.sprite, step);
            this.physics.add.collider(this.paddle2.sprite, step);
        }
    }

    // Override Input to allow jumping maybe? Or standard input handles Velocity Y override?
    // BaseGameScene input handles Y velocity directly, which overrides gravity.
    // We might need to adjust BaseGameScene to respect gravity if no input.
    // For now, let's stick to previous logic: Input sets velocity.
}
