import { Localization } from '../utils/Localization.js';
import { Persistence } from '../persistence.js';

export class MenuScene extends Phaser.Scene {
    constructor() { super({ key: 'MenuScene' }); }
    preload() {
        this.load.image('flag_en', 'assets/flags/flag_en.png');
        this.load.image('flag_cy', 'assets/flags/flag_cy.png');
        this.load.image('flag_pt', 'assets/flags/flag_pt.png');
    }
    create() {
        Localization.init();
        const coins = Persistence.getData().coins;
        this.add.text(600, 150, Localization.get('MENU_TITLE'), { fontSize: '80px', fill: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
        this.add.circle(50, 50, 20, 0xffff00);
        this.add.text(50, 50, 'C', { fontSize: '24px', fill: '#000000', fontStyle: 'bold' }).setOrigin(0.5);
        this.add.text(80, 50, 'x ' + coins, { fontSize: '32px', fill: '#ffff00' }).setOrigin(0, 0.5);

        this.createButton(600, 350, Localization.get('BTN_1P'), '#00ff00', () => this.scene.start('StageSelectScene', { mode: '1p' }));
        this.createButton(600, 450, Localization.get('BTN_2P'), '#0000ff', () => this.scene.start('StageSelectScene', { mode: '2p', isFreePlay: true }));
        // 2P now goes through Stage Select
        this.createButton(600, 650, Localization.get('BTN_RESET'), '#ff0000', () => { Persistence.resetProgress(); this.scene.restart(); });

        this.createLanguageButton();
    }
    createButton(x, y, text, color, callback) {
        const btn = this.add.text(x, y, text, { fontSize: '40px', fill: color })
            .setOrigin(0.5).setInteractive().on('pointerdown', callback)
            .on('pointerover', () => btn.setStyle({ fill: '#ffff00' })).on('pointerout', () => btn.setStyle({ fill: color }));
        return btn;
    }
    createLanguageButton() {
        const langs = Localization.getAllLanguages();
        const startX = this.scale.width / 2 - 300; // Increased width for images
        const gap = 300;

        langs.forEach((lang, index) => {
            const x = startX + index * gap;
            const flagKey = Localization.getFlag(lang); // 'flag_en' etc
            const name = Localization.getName(lang);

            const flag = this.add.image(x - 60, 750, flagKey).setOrigin(0.5).setInteractive();
            flag.setDisplaySize(80, 50); // Resize large generated image to icon size

            const label = this.add.text(x + 10, 750, name, {
                fontSize: '28px',
                fill: (Localization.getCurrentLanguage() === lang) ? '#ffff00' : '#ffffff'
            }).setOrigin(0, 0.5).setInteractive();

            const onSelect = () => {
                Localization.setLanguage(lang);
                this.scene.restart();
            };

            flag.on('pointerdown', onSelect);
            label.on('pointerdown', onSelect);

            const onOver = () => {
                flag.setDisplaySize(88, 55);
                label.setScale(1.1);
            };
            const onOut = () => {
                flag.setDisplaySize(80, 50);
                label.setScale(1.0);
            };

            flag.on('pointerover', onOver).on('pointerout', onOut);
            label.on('pointerover', onOver).on('pointerout', onOut);
        });
    }
}
