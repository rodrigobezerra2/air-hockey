import { Stage13 } from './Stage13.js';
import { Puck } from '../../entities/Puck.js';
import { Persistence } from '../../persistence.js';

export class Stage14 extends Stage13 {
    constructor() {
        super();
        this.sys.settings.key = 'Stage14';
    }

    create() {
        super.create();

        // Update UI Text for Stage 14
        const text = 'FIRST TO 1000 GOALS! ULTRA DISCO CHAOS!';
        if (this.instructionsText) {
            this.instructionsText.setText(text);
        } else {
            this.add.text(this.baseW / 2, this.baseH - 50, text, {
                fontSize: '24px', fill: '#ff00ff'
            }).setOrigin(0.5);
        }
    }

    handleLaserHit(laser, puckSprite) {
        // Find the puck object
        const puck = this.pucks.find(p => p.sprite === puckSprite);
        if (!puck) return;

        laser.destroy();

        // High limit for Stage 14 chaos
        const MAX_PUCKS = 150;

        if (this.pucks.length >= MAX_PUCKS) {
            // Visual feedback even if at limit
            const puff = this.add.circle(puck.x, puck.y, 20, 0x555555, 0.5);
            this.tweens.add({
                targets: puff,
                scale: 2,
                alpha: 0,
                duration: 150,
                onComplete: () => puff.destroy()
            });
            return;
        }

        // Split Puck into 10!
        const splitCount = 10;
        const angle = puck.body.velocity.angle();
        const speed = Math.max(puck.body.velocity.length(), 200);

        for (let i = 0; i < splitCount; i++) {
            if (this.pucks.length >= MAX_PUCKS) break;

            const newPuck = new Puck(this, puck.x, puck.y, puck.radius);
            this.addExistingPuck(newPuck);

            // Spread the velocity in a cone
            const offset = (i - (splitCount / 2)) * 0.2;
            newPuck.body.setVelocity(
                Math.cos(angle + offset) * speed,
                Math.sin(angle + offset) * speed
            );
        }

        // Original puck also gets a slight nudge
        puck.body.setVelocity(
            Math.cos(angle + 0.1) * speed,
            Math.sin(angle + 0.1) * speed
        );

        // Visual Hit Effect
        const flash = this.add.circle(puck.x, puck.y, 60, 0xff00ff, 0.8);
        this.tweens.add({
            targets: flash,
            scale: 2.5,
            alpha: 0,
            duration: 300,
            onComplete: () => flash.destroy()
        });
    }

    onGoal(scorer) {
        if (this.matchEnded) return;

        if (scorer === 'p1') {
            this.score1++;
            this.scoreText1.setText(this.score1);
            Persistence.addCoins(1); // 1 coin per goal in this high-goal mode
        } else {
            this.score2++;
            this.scoreText2.setText(this.score2);
        }

        this.createFireworks(scorer === 'p1' ? this.baseW : 0, this.fieldY + this.fieldH / 2);

        if (this.score1 >= 1000 || this.score2 >= 1000) {
            this.matchEnded = true;
            this.showScoreText(scorer);
            this.time.delayedCall(2000, () => {
                this.scene.start('ResultScene', {
                    mode: this.gameMode,
                    stage: this.stageNum || 14,
                    score1: this.score1,
                    score2: this.score2
                });
            });
        }
    }
}
