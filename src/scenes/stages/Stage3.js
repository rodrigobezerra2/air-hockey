import { BaseGameScene } from '../BaseGameScene.js';

export class Stage3 extends BaseGameScene {
    constructor() { super('Stage3'); }
    configureField() {
        // Vertical Long Field
        this.baseW = 800;
        this.baseH = 1200;
        this.fieldH = 1200;
        this.GOAL_SIZE = 200;
        this.PADDLE_RADIUS = 30;
    }

    drawField() {
        super.drawField();
        this.cameras.main.setZoom(0.66); // Zoom out to fit
    }
}
