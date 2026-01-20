import { BaseGameScene } from '../BaseGameScene.js';

export class Stage1 extends BaseGameScene {
    constructor() { super('Stage1'); }

    configureField() {
        // Standard Field
        this.scaleFactor = 1;
        this.fieldY = 0;
        this.fieldH = 800;
        this.GOAL_SIZE = 200;
        this.PADDLE_RADIUS = 30;
    }
}
// Note: Stages 2, 3, 4 would follow similar patterns with different configuration
