import { Localization } from '../utils/Localization.js';
import { Persistence } from '../persistence.js';

const STAGES = [
    {
        id: 1, name: "CLASSIC",
        desc: "The original experience.",
        render: (g, w, h) => {
            g.lineStyle(2, 0x444444); g.strokeRect(0, 0, w, h);
            g.beginPath(); g.moveTo(w / 2, 0); g.lineTo(w / 2, h); g.strokePath();
            g.strokeCircle(w / 2, h / 2, 20);
        }
    },
    {
        id: 2, name: "LONG FIELD",
        desc: "Can you score from further away?",
        render: (g, w, h) => {
            g.lineStyle(2, 0x444444);
            // Wide field preview (scaled down heavily Y, or full H with wider aspect?)
            // Box is 160x160.
            // Long field (1800x800) -> 2.25:1
            // Draw a wide rect
            const mw = w * 0.9;
            const mh = h * 0.6;
            g.strokeRect((w - mw) / 2, (h - mh) / 2, mw, mh);
            g.beginPath(); g.moveTo(w / 2, (h - mh) / 2); g.lineTo(w / 2, (h + mh) / 2); g.strokePath();
        }
    },
    {
        id: 3, name: "FIELD FLIPPED?",
        desc: "Careful on this one!",
        render: (g, w, h) => {
            g.lineStyle(2, 0x444444);
            const mw = w * 0.4;
            g.strokeRect((w - mw) / 2, 10, mw, h - 20);
            g.beginPath(); g.moveTo(w / 2, 10); g.lineTo(w / 2, h - 10); g.strokePath();
        }
    },
    {
        id: 4, name: "FOOTBALL",
        desc: "Time to score some goals!",
        render: (g, w, h) => {
            g.lineStyle(2, 0x444444); g.strokeRect(0, 0, w, h);
            g.fillStyle(0x555555);
            g.beginPath(); g.moveTo(0, h); g.lineTo(30, h); g.lineTo(0, h - 30); g.fillPath();
            g.beginPath(); g.moveTo(w, h); g.lineTo(w - 30, h); g.lineTo(w, h - 30); g.fillPath();
        }
    },
    {
        id: 5, name: "BOXING MODE",
        desc: "Press the spacebar to send your opponent flying!",
        render: (g, w, h) => {
            g.lineStyle(2, 0x444444); g.strokeRect(0, 0, w, h);
            g.fillStyle(0xff0000); g.fillCircle(w / 2, h / 2, 15); // Glove
        }
    },
    {
        id: 6, name: "TWO BALLS???",
        desc: "Which one are you kicking first?",
        render: (g, w, h) => {
            g.lineStyle(2, 0x444444); g.strokeRect(0, 0, w, h);
            g.fillStyle(0xffff00);
            g.fillCircle(w / 2, h / 3, 10);
            g.fillCircle(w / 2, 2 * h / 3, 10);
        }
    },
    {
        id: 7, name: "OBSTACLES!",
        desc: "Can you still score with these?",
        render: (g, w, h) => {
            g.lineStyle(2, 0x444444); g.strokeRect(0, 0, w, h);
            g.fillStyle(0x00ff00);
            g.fillCircle(w / 4, h / 2, 8); g.fillCircle(3 * w / 4, h / 2, 8);
        }
    },
    {
        id: 8, name: "BOSS!",
        desc: "Time to defeat the boss!",
        render: (g, w, h) => {
            g.lineStyle(2, 0x444444); g.strokeRect(0, 0, w, h);
            g.fillStyle(0xff0000); g.fillCircle(w / 4, h / 2, 6);
            g.fillStyle(0x0000ff); g.fillCircle(3 * w / 4, h / 2, 40);
        }
    },
    {
        id: 9, name: "CANNONS!",
        desc: "Blast off!",
        render: (g, w, h) => {
            g.lineStyle(2, 0x444444); g.strokeRect(0, 0, w, h);
            g.fillStyle(0x555555);
            g.fillRect(10, h - 30, 30, 20); // P1 Cannon
            g.fillRect(w - 40, h - 30, 30, 20); // P2 Cannon
            g.fillStyle(0xff0000); g.fillCircle(15, h - 25, 5); // P1 Ball
            g.fillStyle(0x0000ff); g.fillCircle(w - 15, h - 25, 5); // P2 Ball
        }
    },
    {
        id: 10, name: "GOALIE!",
        desc: "Protect your goal!",
        render: (g, w, h) => {
            g.lineStyle(2, 0x444444); g.strokeRect(0, 0, w, h);
            g.fillStyle(0xaa0000); g.fillRect(0, h / 3, 5, h / 3);
            g.fillStyle(0x0000ff); g.fillRect(w - 5, h / 4, 5, h / 2);
        }
    },
    {
        id: 11, name: "BOSS WALL!",
        desc: "Defeat the wall boss to score goals!",
        render: (g, w, h) => {
            g.lineStyle(2, 0x444444); g.strokeRect(0, 0, w, h);
            g.fillStyle(0x555555); g.fillRect(w * 0.7, 0, w * 0.15, h);
            g.lineStyle(1, 0x000000); g.strokeRect(w * 0.7, 0, w * 0.15, h);
        }
    },
    {
        id: 12, name: "HOT POTATO",
        desc: "Make sure the hot potato is not on your side when the timer runs out!",
        render: (g, w, h) => {
            g.lineStyle(2, 0x444444); g.strokeRect(0, 0, w, h);
            g.fillStyle(0xff0000); g.fillCircle(w / 2, h / 2, 15); // Potato
            g.lineStyle(2, 0xffffff); g.beginPath(); g.moveTo(w / 2 - 20, 20); g.lineTo(w / 2 + 20, 20); g.strokePath(); // Timer line
        }
    },
    {
        id: 13, name: "LASER DISCO",
        desc: "Fire lasers to create more pucks!",
        render: (g, w, h) => {
            g.lineStyle(2, 0x444444); g.strokeRect(0, 0, w, h);
            g.fillStyle(0x00ffff); g.fillCircle(w / 2, 15, 10); // Globe
            g.lineStyle(1, 0xff0000); g.lineBetween(w / 2, 15, w * 0.2, h); // Beam
            g.lineStyle(1, 0x0000ff); g.lineBetween(w / 2, 15, w * 0.8, h); // Beam
        }
    },
    {
        id: 14, name: "ULTRA LASER DISCO",
        desc: "10x pucks! 10x lasers! 1000 goals!",
        render: (g, w, h) => {
            g.lineStyle(2, 0x444444); g.strokeRect(0, 0, w, h);
            g.fillStyle(0xff00ff); g.fillCircle(w / 2, 15, 12); // Globe (Pink)
            // Multiple beams
            for (let i = 0; i < 5; i++) {
                g.lineStyle(1, Phaser.Display.Color.RandomRGB().color);
                g.lineBetween(w / 2, 15, (w / 4) * i, h);
            }
        }
    },
    {
        id: 15, name: "GIANT PUCK",
        desc: "Can you push it to the goal?",
        render: (g, w, h) => {
            g.lineStyle(2, 0x444444); g.strokeRect(0, 0, w, h);
            g.fillStyle(0xffff00); g.fillCircle(w / 2, h / 2, 40); // Giant yellow puck
        }
    }
];

export class StageSelectScene extends Phaser.Scene {
    constructor() { super({ key: 'StageSelectScene' }); }

    init(data) {
        this.gameMode = data.mode || '1p';
        this.isFreePlay = data.isFreePlay || false;
    }

    create() {
        const data = Persistence.getData();

        // Header
        this.add.text(600, 40, Localization.get('SELECT_STAGE'), { fontSize: '50px', fill: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);

        // Shop Button (Top Right)
        const shopBtn = this.add.text(1150, 40, '🛒 SHOP', { fontSize: '32px', fill: '#00ff00', fontStyle: 'bold' })
            .setOrigin(1, 0.5).setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.scene.start('ShopScene'))
            .on('pointerover', () => shopBtn.setScale(1.1))
            .on('pointerout', () => shopBtn.setScale(1.0));

        // Create a container for scrollable content
        this.scrollContainer = this.add.container(0, 0);

        // Grid Layout (2 Columns with Scrolling)
        const startX = 300;
        const startY = 150;
        const colW = 550;
        const rowH = 180;

        STAGES.forEach((stage, index) => {
            const col = index % 2;
            const row = Math.floor(index / 2);
            const x = startX + col * colW;
            const y = startY + row * rowH;

            this.createStageCard(stage, x, y, true);
        });

        // Scrolling logic
        this.scrollY = 0;
        const totalRows = Math.ceil(STAGES.length / 2);
        const contentHeight = totalRows * rowH;
        const visibleHeight = 550; // Visible area for cards
        const maxScroll = Math.max(0, contentHeight - visibleHeight);

        // Scrollbar Visuals
        const barX = 1150;
        const barY = 150;
        const barH = visibleHeight;
        const barW = 8;

        this.scrollTrack = this.add.rectangle(barX, barY + barH / 2, barW, barH, 0x333333).setOrigin(0.5).setAlpha(0.5).setScrollFactor(0);
        this.scrollThumb = this.add.rectangle(barX, barY, barW, 50, 0x00ff00).setOrigin(0.5, 0).setScrollFactor(0);

        this.updateScrollbar = () => {
            if (maxScroll <= 0) {
                this.scrollTrack.setVisible(false);
                this.scrollThumb.setVisible(false);
                return;
            }
            const ratio = visibleHeight / contentHeight;
            const thumbH = Math.max(30, barH * ratio);
            this.scrollThumb.height = thumbH;

            const scrollPercent = Math.abs(this.scrollY) / maxScroll;
            const thumbY = barY + (barH - thumbH) * scrollPercent;
            this.scrollThumb.y = thumbY;
        };

        this.updateScrollbar();

        // Scroll Arrows
        const arrowStyle = { fontSize: '32px', fill: '#00ff00', fontStyle: 'bold' };
        const upArrow = this.add.text(barX, barY - 30, '▲', arrowStyle)
            .setOrigin(0.5).setInteractive({ useHandCursor: true }).setScrollFactor(0)
            .on('pointerdown', () => {
                this.scrollY = Phaser.Math.Clamp(this.scrollY + 100, -maxScroll, 0);
                this.scrollContainer.y = this.scrollY;
                this.updateScrollbar();
            });

        const downArrow = this.add.text(barX, barY + barH + 30, '▼', arrowStyle)
            .setOrigin(0.5).setInteractive({ useHandCursor: true }).setScrollFactor(0)
            .on('pointerdown', () => {
                this.scrollY = Phaser.Math.Clamp(this.scrollY - 100, -maxScroll, 0);
                this.scrollContainer.y = this.scrollY;
                this.updateScrollbar();
            });

        this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
            this.scrollY -= deltaY;
            this.scrollY = Phaser.Math.Clamp(this.scrollY, -maxScroll, 0);
            this.scrollContainer.y = this.scrollY;
            this.updateScrollbar();
        });

        // Back Button (Outside scroll container)
        const backBtn = this.add.container(600, 760).setScrollFactor(0);
        const backBg = this.add.rectangle(0, 0, 200, 50, 0x333333).setStrokeStyle(2, 0xffffff);
        const backTxt = this.add.text(0, 0, Localization.get('BACK'), { fontSize: '24px', fill: '#ffffff' }).setOrigin(0.5);
        backBtn.add([backBg, backTxt]);

        backBtn.setSize(200, 50).setInteractive()
            .on('pointerdown', () => this.scene.start('MenuScene'))
            .on('pointerover', () => backBg.setFillStyle(0x555555))
            .on('pointerout', () => backBg.setFillStyle(0x333333));
    }

    createStageCard(stage, x, y, unlocked) {
        const w = 500;
        const h = 150;

        const card = this.add.container(x, y);
        this.scrollContainer.add(card);

        // Background
        const bg = this.add.rectangle(0, 0, w, h, unlocked ? 0x222222 : 0x111111)
            .setStrokeStyle(2, unlocked ? 0x666666 : 0x333333);

        // Preview Area (Left)
        const prevSize = 110;
        const previewBg = this.add.rectangle(-w / 2 + 75, 0, prevSize, prevSize, 0x000000).setStrokeStyle(1, 0x444444);
        const previewG = this.add.graphics();
        previewG.x = -w / 2 + 75 - prevSize / 2;
        previewG.y = -prevSize / 2;
        stage.render(previewG, prevSize, prevSize);

        if (!unlocked) previewG.alpha = 0.2;

        const previewContainer = this.add.container(0, 0, [previewBg, previewG]);

        // Text Info (Right)
        const titleX = -w / 2 + 150;
        const titleColor = unlocked ? '#ffffff' : '#666666';

        // Localized Fields
        const locName = Localization.get('STAGE_' + stage.id + '_NAME');
        const locDesc = Localization.get('STAGE_' + stage.id + '_DESC');

        const title = this.add.text(titleX, -45, locName, {
            fontSize: '30px',
            fill: titleColor,
            fontStyle: 'bold'
        });

        const descColor = unlocked ? '#aaaaaa' : '#444444';
        const desc = this.add.text(titleX, 0, locDesc, {
            fontSize: '20px',
            fill: descColor,
            wordWrap: { width: 330 }
        });

        card.add([bg, previewContainer, title, desc]);

        // Lock Icon if locked
        if (!unlocked) {
            const lock = this.add.text(0, 0, '🔒', { fontSize: '40px' }).setOrigin(0.5);
            card.add(lock);
        }

        // Interaction
        if (unlocked) {
            card.setSize(w, h).setInteractive()
                .on('pointerdown', () => {
                    this.scene.start('Stage' + stage.id, { mode: this.gameMode, stage: stage.id, isFreePlay: this.isFreePlay });
                })
                .on('pointerover', () => {
                    bg.setFillStyle(0x333333);
                    bg.setStrokeStyle(2, 0xffffff);
                    this.tweens.add({ targets: card, scale: 1.02, duration: 100 });
                })
                .on('pointerout', () => {
                    bg.setFillStyle(0x222222);
                    bg.setStrokeStyle(2, 0x666666);
                    this.tweens.add({ targets: card, scale: 1, duration: 100 });
                });
        }
    }
}
