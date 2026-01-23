import { MenuScene } from './scenes/MenuScene.js';
import { StageSelectScene } from './scenes/StageSelectScene.js';
import { ResultScene } from './scenes/ResultScene.js';
import { Stage1 } from './scenes/stages/Stage1.js';
import { Stage2 } from './scenes/stages/Stage2.js';
import { Stage3 } from './scenes/stages/Stage3.js';
import { Stage4 } from './scenes/stages/Stage4.js';
import { Stage5 } from './scenes/stages/Stage5.js';


import { Stage6 } from './scenes/stages/Stage6.js';
import { Stage7 } from './scenes/stages/Stage7.js';
import { Stage8 } from './scenes/stages/Stage8.js';
import { Stage9 } from './scenes/stages/Stage9.js';

const config = {
    type: Phaser.AUTO,
    width: 1200,
    height: 800,
    backgroundColor: '#1a1a1a',
    parent: 'game-container',
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    physics: { default: 'arcade', arcade: { gravity: { y: 0 }, debug: false } },
    scene: [
        MenuScene,
        StageSelectScene,
        ResultScene,
        Stage1,
        Stage2,
        Stage3,
        Stage4,
        Stage5,
        Stage6,
        Stage7,
        Stage8,
        Stage9
    ]
};

const game = new Phaser.Game(config);
