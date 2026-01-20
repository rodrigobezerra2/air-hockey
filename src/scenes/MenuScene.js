import { Persistence } from '../persistence.js';

export class MenuScene extends Phaser.Scene {
    constructor() { super({ key: 'MenuScene' }); }
    create() {
        const coins = Persistence.getData().coins;
        this.add.text(600, 150, 'AIR HOCKEY', { fontSize: '80px', fill: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
        this.add.circle(50, 50, 20, 0xffff00);
        this.add.text(50, 50, 'C', { fontSize: '24px', fill: '#000000', fontStyle: 'bold' }).setOrigin(0.5);
        this.add.text(80, 50, 'x ' + coins, { fontSize: '32px', fill: '#ffff00' }).setOrigin(0, 0.5);

        this.createButton(600, 350, '1 PLAYER (Stages)', '#00ff00', () => this.scene.start('StageSelectScene', { mode: '1p' }));
        this.createButton(600, 450, '2 PLAYERS (PVP)', '#0000ff', () => this.scene.start('StageSelectScene', { mode: '2p', isFreePlay: true }));
        // 2P now goes through Stage Select
        this.createButton(600, 650, 'RESET SAVE DATA', '#ff0000', () => { Persistence.resetProgress(); this.scene.restart(); });
    }
    createButton(x, y, text, color, callback) {
        const btn = this.add.text(x, y, text, { fontSize: '40px', fill: color })
            .setOrigin(0.5).setInteractive().on('pointerdown', callback)
            .on('pointerover', () => btn.setStyle({ fill: '#ffff00' })).on('pointerout', () => btn.setStyle({ fill: color }));
        return btn;
    }
}
