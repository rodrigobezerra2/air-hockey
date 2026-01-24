import { BaseGameScene } from '../BaseGameScene.js';

export class Stage10 extends BaseGameScene {
    constructor() {
        super('Stage10');
    }

    configureField() {
        super.configureField();
        this.isGoalieMode = true;
        this.aiControlP1 = true; // Both paddles AI controlled
        this.gameMode = '1p'; // Force 1p logic for AI

        // Starting positions
        this.goal1Y = this.fieldY + this.fieldH / 2 - this.GOAL_SIZE / 2;
        this.goal2Y = this.fieldY + this.fieldH / 2 - this.GOAL_SIZE / 2;
    }

    create() {
        super.create();

        // Add specific instructions for this stage
        const helpText = this.add.text(this.baseW / 2, this.fieldY + 50, 'MOVE GOAL TO BLOCK!', {
            fontSize: '32px',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5).setAlpha(0);

        this.tweens.add({
            targets: helpText,
            alpha: 1,
            duration: 500,
            yoyo: true,
            hold: 2000,
            onComplete: () => helpText.destroy()
        });
    }
}
