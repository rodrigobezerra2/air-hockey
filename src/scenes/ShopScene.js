import { VanityManager } from '../utils/VanityManager.js';
import { Persistence } from '../persistence.js';
import { Localization } from '../utils/Localization.js';

export class ShopScene extends Phaser.Scene {
    constructor() {
        super('ShopScene');
    }

    init(data) {
        this.savedScrollY = data.scrollY || 140;
        this.currentTab = data.tab || 'gear';
    }

    create() {
        const { width, height } = this.scale;

        // Background
        this.add.rectangle(width / 2, height / 2, width, height, 0x111111);
        VanityManager.generateTextures(this);

        // Title & Header (Fixed)
        const header = this.add.container(0, 0).setDepth(10);
        header.add(this.add.rectangle(width / 2, 50, width, 100, 0x111111));
        header.add(this.add.text(width / 2, 35, 'SHOP', { fontSize: '42px', fill: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5));

        this.coinsText = this.add.text(width - 50, 40, 'Coins: ' + Persistence.getData().coins, {
            fontSize: '24px',
            fill: '#ffff00'
        }).setOrigin(1, 0.5);
        header.add(this.coinsText);

        // Tabs
        const tabY = 85;
        this.createTabButton(header, width / 2 - 150, tabY, 'GEAR', 'gear');
        this.createTabButton(header, width / 2, tabY, 'BACKGROUNDS', 'background');
        this.createTabButton(header, width / 2 + 150, tabY, 'EXTRAS', 'extras');

        // Back Button
        header.add(this.add.text(50, 40, '< Back', { fontSize: '24px', fill: '#ffffff' })
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.scene.start('MenuScene')));

        // Reset Button (Bottom Fixed)
        const footer = this.add.container(0, height - 60).setDepth(10);
        footer.add(this.add.rectangle(width / 2, 30, width, 60, 0x111111));
        const resetBtn = this.createButton(width / 2, 30, 'Reset to Default', () => {
            Persistence.resetToDefaultShop();
            this.scene.restart({ scrollY: 140, tab: this.currentTab });
        }, 0xff4444);
        footer.add(resetBtn);

        // Scrollable Grid Container
        this.gridContainer = this.add.container(0, this.savedScrollY);
        this.createGrid();

        // Scroll Input
        this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
            this.gridContainer.y -= deltaY;
            this.keepInBounds();
        });

        // Simple Drag Support
        let isDragging = false;
        this.input.on('pointerdown', () => isDragging = true);
        this.input.on('pointerup', () => isDragging = false);
        this.input.on('pointermove', (pointer) => {
            if (isDragging) {
                this.gridContainer.y += (pointer.y - pointer.prevPosition.y);
                this.keepInBounds();
            }
        });
    }

    createTabButton(container, x, y, label, id) {
        const isActive = this.currentTab === id;
        const btn = this.add.text(x, y, label, {
            fontSize: '24px',
            fill: isActive ? '#00ff00' : '#888888',
            fontStyle: isActive ? 'bold' : 'normal'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        if (isActive) {
            container.add(this.add.rectangle(x, y + 20, 150, 4, 0x00ff00));
        }

        btn.on('pointerdown', () => {
            if (!isActive) this.scene.restart({ tab: id, scrollY: 140 });
        });
        container.add(btn);
    }

    refreshUI() {
        this.scene.restart({ scrollY: this.gridContainer.y, tab: this.currentTab });
    }

    keepInBounds() {
        const { height } = this.scale;
        const viewableHeight = height - 120 - 60;
        const minY = 140 - Math.max(0, this.maxGridHeight - viewableHeight + 50);

        if (this.gridContainer.y > 140) this.gridContainer.y = 140;
        if (this.gridContainer.y < minY) this.gridContainer.y = minY;
    }

    createGrid() {
        const { width, height } = this.scale;
        this.maxGridHeight = 0;

        if (this.currentTab === 'gear') {
            const sections = [
                { label: 'Player 1', target: 'p1', x: width * 0.15 },
                { label: 'Player 2', target: 'p2', x: width * 0.5 },
                { label: 'Puck', target: 'puck', x: width * 0.85 }
            ];
            const categories = ['eyes', 'hat', 'mouth', 'moustache'];

            sections.forEach(section => {
                let currentY = 0;
                const title = this.add.text(section.x, currentY, section.label, {
                    fontSize: '32px', fill: '#ffffff', fontStyle: 'bold'
                }).setOrigin(0.5);
                this.gridContainer.add(title);
                currentY += 50;

                if (section.target === 'puck') {
                    VanityManager.items.filter(i => i.type === 'puck').forEach(item => {
                        this.createItemUI(section.x, currentY, section.target, item);
                        currentY += 105;
                    });
                } else {
                    categories.forEach(cat => {
                        const catLabel = this.add.text(section.x, currentY, cat.toUpperCase(), {
                            fontSize: '18px', fill: '#00ccff', fontStyle: 'bold'
                        }).setOrigin(0.5);
                        this.gridContainer.add(catLabel);
                        currentY += 30;
                        VanityManager.items.filter(i => i.category === cat && i.type === 'paddle').forEach(item => {
                            this.createItemUI(section.x, currentY, section.target, item);
                            currentY += 100;
                        });
                        currentY += 15;
                    });
                }
                if (currentY > this.maxGridHeight) this.maxGridHeight = currentY;
            });
        } else if (this.currentTab === 'background') {
            // Backgrounds Tab
            let currentY = 0;
            const title = this.add.text(width / 2, currentY, 'World Themes', {
                fontSize: '32px', fill: '#ffffff', fontStyle: 'bold'
            }).setOrigin(0.5);
            this.gridContainer.add(title);
            currentY += 80;

            const items = VanityManager.items.filter(i => i.type === 'world');
            const cols = 2; // Made 2 cols for better spacing with wider cards
            const colW = 400;
            const rowH = 150;

            items.forEach((item, index) => {
                const col = index % cols;
                const row = Math.floor(index / cols);
                const x = width / 2 + (col === 0 ? -colW / 2 : colW / 2);
                const y = currentY + row * rowH;

                this.createItemUI(x, y, 'world', item, true);
                const totalH = currentY + (row + 1) * rowH;
                if (totalH > this.maxGridHeight) this.maxGridHeight = totalH;
            });
        } else if (this.currentTab === 'extras') {
            // Extras / Modifiers Tab
            let currentY = 0;
            const title = this.add.text(width / 2, currentY, 'Gameplay Modifiers', {
                fontSize: '32px', fill: '#ffffff', fontStyle: 'bold'
            }).setOrigin(0.5);
            this.gridContainer.add(title);
            currentY += 80;

            const items = VanityManager.items.filter(i => i.type === 'modifier');
            const cols = 2;
            const colW = 400;
            const rowH = 150;

            items.forEach((item, index) => {
                const col = index % cols;
                const row = Math.floor(index / cols);
                const x = width / 2 + (col === 0 ? -colW / 2 : colW / 2);
                const y = currentY + row * rowH;

                this.createItemUI(x, y, 'modifier', item, true);
                const totalH = currentY + (row + 1) * rowH;
                if (totalH > this.maxGridHeight) this.maxGridHeight = totalH;
            });
        }
    }

    createItemUI(x, y, target, item, isWide = false) {
        const cardW = isWide ? 300 : 220;
        const bg = this.add.rectangle(x, y, cardW, 85, 0x222222).setStrokeStyle(1, 0x444444);
        this.gridContainer.add(bg);

        // Icon
        if (this.textures.exists(item.id)) {
            const icon = this.add.sprite(x - (cardW / 2 - 40), y, item.id);
            if (!isWide) icon.setScale(1.1);
            this.gridContainer.add(icon);
        }

        // Name
        const nameText = this.add.text(x - (isWide ? 50 : 25), y - 20, item.name, { fontSize: '13px', fill: '#ffffff', wordWrap: { width: 120 } });
        this.gridContainer.add(nameText);

        const isOwned = Persistence.isItemOwned(item.id);
        const btnX = x + (cardW / 2 - 60);

        if (this.currentTab === 'extras') {
            // Toggle Logic for Modifiers
            if (isOwned) {
                const isActive = Persistence.isModifierActive(item.modId);
                const btn = this.createButton(btnX, y, isActive ? 'ON' : 'OFF', () => {
                    Persistence.toggleModifier(item.modId);
                    this.refreshUI();
                }, isActive ? 0x00ff00 : 0x666666, 85);
                this.gridContainer.add(btn);
            } else {
                const btn = this.createButton(btnX, y, 'BUY ' + item.cost, () => {
                    if (Persistence.buyItem(item.id, item.cost)) {
                        this.refreshUI();
                    } else {
                        this.flashCoins();
                    }
                }, 0xffaa00, 85);
                this.gridContainer.add(btn);
            }
            return;
        }

        const equippedId = Persistence.getEquipped(target, item.category);
        const isEquipped = equippedId === item.id;

        if (isEquipped) {
            const eqText = this.add.text(btnX, y, 'EQUIPPED', { fontSize: '11px', fill: '#00ff00', fontStyle: 'bold' }).setOrigin(0.5);
            this.gridContainer.add(eqText);
        } else if (isOwned) {
            const btn = this.createButton(btnX, y, 'EQUIP', () => {
                Persistence.equipItem(target, item.category, item.id);
                this.refreshUI();
            }, 0x4444ff, 85);
            this.gridContainer.add(btn);
        } else {
            const btn = this.createButton(btnX, y, 'BUY ' + item.cost, () => {
                if (Persistence.buyItem(item.id, item.cost)) {
                    this.refreshUI();
                } else {
                    this.flashCoins();
                }
            }, 0xffaa00, 85);
            this.gridContainer.add(btn);
        }
    }

    createButton(x, y, label, callback, color = 0x444444, btnWidth = 150) {
        const btn = this.add.container(x, y);
        const bg = this.add.rectangle(0, 0, btnWidth, 35, color).setInteractive({ useHandCursor: true });
        const txt = this.add.text(0, 0, label, { fontSize: '14px', fill: '#ffffff' }).setOrigin(0.5);

        btn.add([bg, txt]);
        bg.on('pointerdown', callback);
        bg.on('pointerover', () => bg.setFillStyle(Phaser.Display.Color.GetColor(200, 200, 200)));
        bg.on('pointerout', () => bg.setFillStyle(color));

        return btn;
    }

    flashCoins() {
        this.tweens.add({
            targets: this.coinsText,
            scale: 1.5,
            duration: 100,
            yoyo: true,
            repeat: 3,
            tint: 0xff0000
        });
    }
}
