import { Persistence } from '../persistence.js';

export class ResultScene extends Phaser.Scene {
    constructor() { super({ key: 'ResultScene' }); }
    init(data) { this.mode = data.mode; this.stage = data.stage; this.s1 = data.score1; this.s2 = data.score2; }
    create() {
        const graphics = this.add.graphics();
        graphics.fillStyle(0x000000, 0.8); graphics.fillRect(0, 0, 1200, 800);
        const p1Won = this.s1 > this.s2;
        const msg = p1Won ? 'STAGE COMPLETED!' : 'STAGE FAILED';
        const msgColor = p1Won ? '#00ff00' : '#ff0000';
        this.add.text(600, 200, msg, { fontSize: '80px', fill: msgColor, fontStyle: 'bold' }).setOrigin(0.5);
        this.add.text(600, 300, `${this.s1} - ${this.s2}`, { fontSize: '60px', fill: '#ffffff' }).setOrigin(0.5);
        let breakdown = [`Goals (P1): ${this.s1} x 50 = ${this.s1 * 50} coins`];
        if (p1Won) {
            const bonus = 100 * this.stage;
            breakdown.push(`Stage ${this.stage} Win Bonus: ${bonus} coins`);
            Persistence.addCoins(bonus);
            Persistence.unlockStage(this.stage + 1);
        }
        this.add.text(600, 450, breakdown, { fontSize: '30px', fill: '#ffff00', align: 'center' }).setOrigin(0.5);
        const continueBtn = this.add.text(600, 600, 'CONTINUE', { fontSize: '40px', fill: '#ffffff' }).setOrigin(0.5).setInteractive().on('pointerdown', () => this.scene.start('StageSelectScene'));
        this.input.keyboard.on('keydown-SPACE', () => this.scene.start('StageSelectScene'));
    }
}
