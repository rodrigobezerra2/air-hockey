import { BaseGameScene } from '../BaseGameScene.js';

export class Stage2 extends BaseGameScene {
    constructor() { super('Stage2'); }

    configureField() {
        // Long Field (Horizontal)
        // Normal is 1200x800. Let's make it 2000x800?
        this.baseW = 2000;
        this.baseH = 800;
        this.fieldY = 0;
        this.fieldH = 800;

        // Adjust Start Positions? BaseGameScene uses baseW/2 mostly.
    }

    drawField() {
        super.drawField();
        // Zoom out to fit 2000 width into 1200 screen
        // 1200 / 2000 = 0.6
        this.cameras.main.setZoom(0.6);
    }
}
