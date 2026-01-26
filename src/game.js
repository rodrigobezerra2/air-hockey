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
import { Stage10 } from './scenes/stages/Stage10.js';
import { Stage11 } from './scenes/stages/Stage11.js';
import { Stage12 } from './scenes/stages/Stage12.js';
import { Stage13 } from './scenes/stages/Stage13.js';
import { Stage14 } from './scenes/stages/Stage14.js';
import { Stage15 } from './scenes/stages/Stage15.js';
import { ShopScene } from './scenes/ShopScene.js';

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
        Stage9,
        Stage10,
        Stage11,
        Stage12,
        Stage13,
        Stage14,
        Stage15,
        ShopScene
    ]
};

const game = new Phaser.Game(config);
