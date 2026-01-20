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
        this.add.text(600, 60, 'SELECT STAGE', { fontSize: '50px', fill: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);

        // Grid Layout
        const startX = 250;
        const startY = 180;
        const colW = 600; // Distance between columns
        const rowH = 180; // Distance between rows (increased)

        STAGES.forEach((stage, index) => {
            const col = index % 2;
            const row = Math.floor(index / 2);
            const x = startX + col * colW + (col === 0 ? 50 : -50); // Shift towards center slightly
            const y = startY + row * rowH;

            this.createStageCard(stage, x, y, data.unlockedStages >= stage.id);
        });

        // Back Button
        const backBtn = this.add.container(600, 750);
        const backBg = this.add.rectangle(0, 0, 200, 60, 0x333333).setStrokeStyle(2, 0xffffff);
        const backTxt = this.add.text(0, 0, 'BACK', { fontSize: '24px', fill: '#ffffff' }).setOrigin(0.5);
        backBtn.add([backBg, backTxt]);

        backBtn.setSize(200, 60).setInteractive()
            .on('pointerdown', () => this.scene.start('MenuScene'))
            .on('pointerover', () => backBg.setFillStyle(0x555555))
            .on('pointerout', () => backBg.setFillStyle(0x333333));
    }

    createStageCard(stage, x, y, unlocked) {
        const w = 520;
        const h = 150;

        const card = this.add.container(x, y);

        // Background
        const bg = this.add.rectangle(0, 0, w, h, unlocked ? 0x222222 : 0x111111)
            .setStrokeStyle(2, unlocked ? 0x666666 : 0x333333);

        // Preview Area (Left)
        const previewBg = this.add.rectangle(-w / 2 + 85, 0, 130, 130, 0x000000).setStrokeStyle(1, 0x444444);
        const previewG = this.add.graphics();
        previewG.x = -w / 2 + 20; // Internal offset for drawing
        previewG.y = -65;
        stage.render(previewG, 130, 130);

        if (!unlocked) previewG.alpha = 0.2;

        // Visual Mask for Preview (simple crop via container placement mostly)
        // Grouping preview elements
        const previewContainer = this.add.container(0, 0, [previewBg, previewG]);

        // Text Info (Right)
        const titleColor = unlocked ? '#ffffff' : '#666666';
        const title = this.add.text(-w / 2 + 170, -40, stage.name, {
            fontSize: '28px',
            fill: titleColor,
            fontStyle: 'bold'
        });

        const descColor = unlocked ? '#aaaaaa' : '#444444';
        const desc = this.add.text(-w / 2 + 170, 0, stage.desc, {
            fontSize: '18px',
            fill: descColor,
            wordWrap: { width: 320 }
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
