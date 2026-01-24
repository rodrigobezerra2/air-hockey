export const VanityManager = {
    items: [
        { id: 'eyes_crossed', category: 'eyes', name: 'Crossed Eyes', cost: 500, type: 'paddle' },
        { id: 'eyes_divergent', category: 'eyes', name: 'Divergent Eyes', cost: 500, type: 'paddle' },
        { id: 'eyes_targeting', category: 'eyes', name: 'Targeting Eyes', cost: 1000, type: 'paddle' },
        { id: 'eyes_pirate', category: 'eyes', name: 'Pirate Eyes', cost: 1000, type: 'paddle' },
        { id: 'eyes_moving', category: 'eyes', name: 'Spinning Eyes', cost: 500, type: 'paddle' },
        { id: 'mouth_happy', category: 'mouth', name: 'Happy Mouth', cost: 500, type: 'paddle' },
        { id: 'mouth_sad', category: 'mouth', name: 'Sad Mouth', cost: 500, type: 'paddle' },
        { id: 'mouth_bunny', category: 'mouth', name: 'Bunny Teeth', cost: 500, type: 'paddle' },
        { id: 'mouth_kiss', category: 'mouth', name: 'Kiss', cost: 500, type: 'paddle' },
        { id: 'mouth_vampire', category: 'mouth', name: 'Vampire', cost: 500, type: 'paddle' },
        { id: 'hat_chef', category: 'hat', name: 'Chef Hat', cost: 500, type: 'paddle' },
        { id: 'hat_pirate', category: 'hat', name: 'Pirate Hat', cost: 500, type: 'paddle' },
        { id: 'hat_unicorn', category: 'hat', name: 'Unicorn', cost: 500, type: 'paddle' },
        { id: 'hat_cap', category: 'hat', name: 'Cap', cost: 500, type: 'paddle' },
        { id: 'hat_winter', category: 'hat', name: 'Winter Hat', cost: 500, type: 'paddle' },
        { id: 'moustache_mario', category: 'moustache', name: 'Mario Moustache', cost: 500, type: 'paddle' },
        { id: 'moustache_pencilled', category: 'moustache', name: 'Pencilled', cost: 500, type: 'paddle' },
        { id: 'moustache_walrus', category: 'moustache', name: 'Walrus', cost: 500, type: 'paddle' },
        { id: 'moustache_horseshoe', category: 'moustache', name: 'Horseshoe', cost: 500, type: 'paddle' },
        { id: 'puck_football', category: 'skin', name: 'Football', cost: 500, type: 'puck' },
        { id: 'puck_basketball', category: 'skin', name: 'Basketball', cost: 500, type: 'puck' },
        { id: 'puck_yingyang', category: 'skin', name: 'Ying Yang', cost: 500, type: 'puck' },
        { id: 'puck_moon', category: 'skin', name: 'Moon', cost: 500, type: 'puck' },
        { id: 'world_lava', category: 'background', name: 'Lava Area', cost: 1000, type: 'world' },
        { id: 'world_snow', category: 'background', name: 'Snow Area', cost: 1000, type: 'world' },
        { id: 'world_forest', category: 'background', name: 'Forest Area', cost: 1000, type: 'world' },
        { id: 'world_moon', category: 'background', name: 'Moon', cost: 1000, type: 'world' },
        { id: 'world_sky', category: 'background', name: 'Sky', cost: 1000, type: 'world' },
        { id: 'world_underwater', category: 'background', name: 'Underwater', cost: 1000, type: 'world' },
        { id: 'world_city', category: 'background', name: 'City', cost: 1000, type: 'world' },
        { id: 'mod_hard', category: 'modifier', name: 'Hard Mode', cost: 1000, type: 'modifier', modId: 'hardMode' },
        { id: 'mod_half', category: 'modifier', name: 'Half Speed', cost: 1000, type: 'modifier', modId: 'halfSpeed' },
        { id: 'mod_twice', category: 'modifier', name: 'Twice Speed', cost: 1000, type: 'modifier', modId: 'twiceSpeed' },
        { id: 'mod_knockback', category: 'modifier', name: 'Puck Knockback', cost: 1000, type: 'modifier', modId: 'knockback' }
    ],

    generateTextures(scene) {
        this.generateCrossedEyes(scene);
        this.generateDivergentEyes(scene);
        this.generateTargetingEyes(scene);
        this.generatePirateEyes(scene);
        this.generateMovingEyes(scene);
        this.generateHappyMouth(scene);
        this.generateSadMouth(scene);
        this.generateBunnyMouth(scene);
        this.generateKissMouth(scene);
        this.generateVampireMouth(scene);
        this.generateChefHat(scene);
        this.generatePirateHat(scene);
        this.generateUnicornHat(scene);
        this.generateCapHat(scene);
        this.generateWinterHat(scene);
        this.generateMarioMoustache(scene);
        this.generatePencilledMoustache(scene);
        this.generateWalrusMoustache(scene);
        this.generateHorseshoeMoustache(scene);
        this.generateFootball(scene);
        this.generateBasketball(scene);
        this.generateYingYang(scene);
        this.generateMoon(scene);

        // Background Icons
        this.generateLavaIcon(scene);
        this.generateSnowIcon(scene);
        this.generateForestIcon(scene);
        this.generateMoonWorldIcon(scene);
        this.generateSkyIcon(scene);
        this.generateUnderwaterIcon(scene);
        this.generateCityIcon(scene);

        // Modifier Icons
        this.generateModHardIcon(scene);
        this.generateModHalfIcon(scene);
        this.generateModTwiceIcon(scene);
        this.generateModKnockbackIcon(scene);
    },

    generateCrossedEyes(scene) {
        if (scene.textures.exists('eyes_crossed')) return;
        const g = scene.make.graphics({ add: false });
        g.fillStyle(0xffffff); g.fillCircle(10, 10, 8); g.fillCircle(30, 10, 8);
        g.lineStyle(2, 0x000000); g.strokeCircle(10, 10, 8); g.strokeCircle(30, 10, 8);
        g.fillStyle(0x000000); g.fillCircle(14, 14, 3); g.fillCircle(26, 14, 3);
        g.generateTexture('eyes_crossed', 40, 20);
        g.destroy();
    },

    generateDivergentEyes(scene) {
        if (scene.textures.exists('eyes_divergent')) return;
        const g = scene.make.graphics({ add: false });
        g.fillStyle(0xffffff); g.fillCircle(10, 10, 8); g.fillCircle(30, 10, 8);
        g.lineStyle(2, 0x000000); g.strokeCircle(10, 10, 8); g.strokeCircle(30, 10, 8);
        g.fillStyle(0x000000); g.fillCircle(6, 6, 3); g.fillCircle(34, 6, 3);
        g.generateTexture('eyes_divergent', 40, 20);
        g.destroy();
    },

    generateTargetingEyes(scene) {
        if (scene.textures.exists('eyes_targeting_base')) return;
        const gBase = scene.make.graphics({ add: false });
        gBase.fillStyle(0xffffff); gBase.fillCircle(10, 10, 8); gBase.fillCircle(30, 10, 8);
        gBase.lineStyle(2, 0x000000); gBase.strokeCircle(10, 10, 8); gBase.strokeCircle(30, 10, 8);
        gBase.generateTexture('eyes_targeting_base', 40, 20);
        gBase.destroy();

        if (scene.textures.exists('eyes_targeting_pupil')) return;
        const gPupil = scene.make.graphics({ add: false });
        gPupil.fillStyle(0x000000); gPupil.fillCircle(4, 4, 4);
        gPupil.generateTexture('eyes_targeting_pupil', 8, 8);
        gPupil.destroy();

        if (!scene.textures.exists('eyes_targeting')) {
            const gIcon = scene.make.graphics({ add: false });
            gIcon.fillStyle(0xffffff); gIcon.fillCircle(10, 10, 8); gIcon.fillCircle(30, 10, 8);
            gIcon.lineStyle(2, 0x000000); gIcon.strokeCircle(10, 10, 8); gIcon.strokeCircle(30, 10, 8);
            gIcon.fillStyle(0x000000); gIcon.fillCircle(10, 10, 3); gIcon.fillCircle(30, 10, 3);
            gIcon.generateTexture('eyes_targeting', 40, 20);
            gIcon.destroy();
        }
    },

    generatePirateEyes(scene) {
        if (scene.textures.exists('eyes_pirate_patch')) return;
        const g = scene.make.graphics({ add: false });
        // Right eye patch
        g.fillStyle(0x000000);
        g.fillCircle(30, 10, 9);
        g.lineStyle(2, 0x000000);
        g.lineBetween(20, 0, 40, 20); // Strap
        g.generateTexture('eyes_pirate_patch', 40, 20);
        g.destroy();

        if (!scene.textures.exists('eyes_pirate')) {
            const gIcon = scene.make.graphics({ add: false });
            gIcon.fillStyle(0xffffff); gIcon.fillCircle(10, 10, 8);
            gIcon.fillStyle(0x000000); gIcon.fillCircle(30, 10, 9);
            gIcon.lineStyle(1, 0x000000); gIcon.strokeCircle(10, 10, 8);
            gIcon.fillCircle(10, 10, 3);
            gIcon.generateTexture('eyes_pirate', 40, 20);
            gIcon.destroy();
        }
    },

    generateMovingEyes(scene) {
        if (scene.textures.exists('eyes_moving_pupil')) return;
        const g = scene.make.graphics({ add: false });
        g.fillStyle(0x000000); g.fillCircle(4, 4, 4);
        g.generateTexture('eyes_moving_pupil', 8, 8);
        g.destroy();

        if (!scene.textures.exists('eyes_moving')) {
            const gIcon = scene.make.graphics({ add: false });
            gIcon.fillStyle(0xffffff); gIcon.fillCircle(10, 10, 8); gIcon.fillCircle(30, 10, 8);
            gIcon.lineStyle(1, 0x000000); gIcon.strokeCircle(10, 10, 8); gIcon.strokeCircle(30, 10, 8);
            gIcon.fillStyle(0x000000); gIcon.fillCircle(10, 5, 3); gIcon.fillCircle(30, 15, 3);
            gIcon.generateTexture('eyes_moving', 40, 20);
            gIcon.destroy();
        }
    },

    generateHappyMouth(scene) {
        if (scene.textures.exists('mouth_happy')) return;
        const g = scene.make.graphics({ add: false });
        g.lineStyle(2, 0x000000); g.beginPath(); g.arc(20, 10, 10, 0, Math.PI, false); g.strokePath();
        g.generateTexture('mouth_happy', 40, 20); g.destroy();
    },

    generateSadMouth(scene) {
        if (scene.textures.exists('mouth_sad')) return;
        const g = scene.make.graphics({ add: false });
        g.lineStyle(2, 0x000000); g.beginPath(); g.arc(20, 25, 10, Math.PI, 0, false); g.strokePath();
        g.generateTexture('mouth_sad', 40, 30); g.destroy();
    },

    generateBunnyMouth(scene) {
        if (scene.textures.exists('mouth_bunny')) return;
        const g = scene.make.graphics({ add: false });
        g.lineStyle(2, 0x000000); g.lineBetween(10, 10, 30, 10); // Straight-ish smile
        g.fillStyle(0xffffff); g.fillRect(15, 10, 5, 8); g.fillRect(20, 10, 5, 8); // Teeth
        g.strokeRect(15, 10, 5, 8); g.strokeRect(20, 10, 5, 8);
        g.generateTexture('mouth_bunny', 40, 20); g.destroy();
    },

    generateKissMouth(scene) {
        if (scene.textures.exists('mouth_kiss')) return;
        const g = scene.make.graphics({ add: false });
        g.fillStyle(0xff0000); g.fillEllipse(20, 10, 15, 10); // Big lips
        g.lineStyle(1, 0x000000); g.strokeEllipse(20, 10, 15, 10);
        g.lineBetween(10, 10, 30, 10); // Center line
        g.generateTexture('mouth_kiss', 40, 20); g.destroy();
    },

    generateVampireMouth(scene) {
        if (scene.textures.exists('mouth_vampire')) return;
        const g = scene.make.graphics({ add: false });
        g.lineStyle(2, 0x000000); g.lineBetween(10, 10, 30, 10);
        g.fillStyle(0xffffff);
        g.beginPath(); g.moveTo(15, 10); g.lineTo(18, 18); g.lineTo(21, 10); g.fillPath(); // Fang L
        g.beginPath(); g.moveTo(24, 10); g.lineTo(27, 18); g.lineTo(30, 10); g.fillPath(); // Fang R
        g.strokePath();
        g.generateTexture('mouth_vampire', 40, 20); g.destroy();
    },

    generateChefHat(scene) {
        if (scene.textures.exists('hat_chef')) return;
        const g = scene.make.graphics({ add: false });
        g.fillStyle(0xffffff); g.lineStyle(1, 0x000000);
        g.fillRect(10, 20, 40, 20); g.strokeRect(10, 20, 40, 20);
        g.fillCircle(20, 15, 15); g.strokeCircle(20, 15, 15);
        g.fillCircle(40, 15, 15); g.strokeCircle(40, 15, 15);
        g.fillCircle(30, 10, 15); g.strokeCircle(30, 10, 15);
        g.generateTexture('hat_chef', 60, 40); g.destroy();
    },

    generatePirateHat(scene) {
        if (scene.textures.exists('hat_pirate')) return;
        const g = scene.make.graphics({ add: false });
        g.fillStyle(0x333333); g.beginPath();
        g.moveTo(0, 40); g.lineTo(30, 0); g.lineTo(60, 40); g.closePath(); g.fillPath();
        g.fillStyle(0xffffff); g.fillCircle(30, 25, 5); // Skull
        g.generateTexture('hat_pirate', 60, 40); g.destroy();
    },

    generateUnicornHat(scene) {
        if (scene.textures.exists('hat_unicorn')) return;
        const g = scene.make.graphics({ add: false });
        g.fillStyle(0xffaabb); g.beginPath();
        g.moveTo(20, 40); g.lineTo(30, 0); g.lineTo(40, 40); g.closePath(); g.fillPath(); // Horn
        g.lineStyle(2, 0xffffff); g.lineBetween(22, 35, 38, 5); // Detail
        g.generateTexture('hat_unicorn', 60, 40); g.destroy();
    },

    generateCapHat(scene) {
        if (scene.textures.exists('hat_cap')) return;
        const g = scene.make.graphics({ add: false });
        g.fillStyle(0xff0000); g.fillRect(10, 20, 40, 20); // Top
        g.fillRect(40, 30, 20, 10); // Bill
        g.generateTexture('hat_cap', 60, 40); g.destroy();
    },

    generateWinterHat(scene) {
        if (scene.textures.exists('hat_winter')) return;
        const g = scene.make.graphics({ add: false });
        g.fillStyle(0x0000ff); g.fillCircle(30, 25, 15); // Hat
        g.fillStyle(0xffffff); g.fillCircle(30, 10, 8); // Pom-pom
        g.generateTexture('hat_winter', 60, 40); g.destroy();
    },

    generateMarioMoustache(scene) {
        if (scene.textures.exists('moustache_mario')) return;
        const g = scene.make.graphics({ add: false });
        g.fillStyle(0x4b2a1a); g.fillRect(5, 5, 40, 10);
        g.fillRect(0, 8, 10, 8); g.fillRect(40, 8, 10, 8);
        g.generateTexture('moustache_mario', 50, 20); g.destroy();
    },

    generatePencilledMoustache(scene) {
        if (scene.textures.exists('moustache_pencilled')) return;
        const g = scene.make.graphics({ add: false });
        g.fillStyle(0x1a1a1a);
        g.fillRect(10, 8, 30, 2); // Very thin line
        g.generateTexture('moustache_pencilled', 50, 20); g.destroy();
    },

    generateWalrusMoustache(scene) {
        if (scene.textures.exists('moustache_walrus')) return;
        const g = scene.make.graphics({ add: false });
        g.fillStyle(0x5a3b2a); // Bushy brown
        g.fillEllipse(25, 10, 20, 12);
        g.fillStyle(0x4a2b1a); // Shadow/depth
        g.fillRect(10, 10, 30, 8);
        g.generateTexture('moustache_walrus', 50, 25); g.destroy();
    },

    generateHorseshoeMoustache(scene) {
        if (scene.textures.exists('moustache_horseshoe')) return;
        const g = scene.make.graphics({ add: false });
        g.lineStyle(6, 0x331a00);
        g.beginPath();
        g.moveTo(5, 25);
        g.lineTo(5, 10);
        g.lineTo(45, 10);
        g.lineTo(45, 25);
        g.strokePath();
        g.generateTexture('moustache_horseshoe', 50, 30); g.destroy();
    },



    generateFootball(scene) {
        if (scene.textures.exists('puck_football')) return;
        const g = scene.make.graphics({ add: false });
        const radius = 20;
        g.fillStyle(0xffffff); g.fillCircle(radius, radius, radius);
        g.lineStyle(1, 0x000000); g.strokeCircle(radius, radius, radius);
        g.fillStyle(0x000000);
        // Better Hexagon Pattern
        const hexPoints = (cx, cy, r) => {
            g.beginPath();
            for (let i = 0; i < 6; i++) {
                const angle = (i * Math.PI) / 3;
                const x = cx + r * Math.cos(angle);
                const y = cy + r * Math.sin(angle);
                if (i === 0) g.moveTo(x, y); else g.lineTo(x, y);
            }
            g.closePath(); g.fillPath();
        };
        hexPoints(radius, radius, 8);
        hexPoints(radius, radius - 15, 5); hexPoints(radius, radius + 15, 5);
        hexPoints(radius - 15, radius - 8, 5); hexPoints(radius + 15, radius - 8, 5);
        hexPoints(radius - 15, radius + 8, 5); hexPoints(radius + 15, radius + 8, 5);
        g.generateTexture('puck_football', radius * 2, radius * 2); g.destroy();
    },

    generateBasketball(scene) {
        if (scene.textures.exists('puck_basketball')) return;
        const g = scene.make.graphics({ add: false });
        const r = 20;
        g.fillStyle(0xffa500); g.fillCircle(r, r, r);
        g.lineStyle(2, 0x000000); g.strokeCircle(r, r, r);
        g.lineBetween(0, r, r * 2, r); // Mid line
        g.lineBetween(r, 0, r, r * 2); // Vert line
        g.beginPath(); g.arc(0, r, r, -Math.PI / 4, Math.PI / 4, false); g.strokePath();
        g.beginPath(); g.arc(r * 2, r, r, Math.PI * 3 / 4, Math.PI * 5 / 4, false); g.strokePath();
        g.generateTexture('puck_basketball', r * 2, r * 2); g.destroy();
    },

    generateYingYang(scene) {
        if (scene.textures.exists('puck_yingyang')) return;
        const g = scene.make.graphics({ add: false });
        const r = 20;
        g.fillStyle(0xffffff); g.fillCircle(r, r, r); // White half
        g.fillStyle(0x000000); g.beginPath(); g.arc(r, r, r, -Math.PI / 2, Math.PI / 2, false); g.fillPath(); // Black half
        g.fillCircle(r, r / 2, r / 2); // Top middle circle black
        g.fillStyle(0xffffff); g.fillCircle(r, r * 3 / 2, r / 2); // Bottom middle circle white
        g.fillCircle(r, r / 2, r / 4); // Small white dot in black
        g.fillStyle(0x000000); g.fillCircle(r, r * 3 / 2, r / 4); // Small black dot in white
        g.lineStyle(1, 0x000000); g.strokeCircle(r, r, r);
        g.generateTexture('puck_yingyang', r * 2, r * 2); g.destroy();
    },

    generateMoon(scene) {
        if (scene.textures.exists('puck_moon')) return;
        const g = scene.make.graphics({ add: false });
        const r = 20;
        g.fillStyle(0xcccccc); g.fillCircle(r, r, r);
        g.fillStyle(0x999999); // Craters
        g.fillCircle(12, 12, 4); g.fillCircle(25, 18, 6); g.fillCircle(18, 30, 3);
        g.lineStyle(1, 0x000000); g.strokeCircle(r, r, r);
        g.generateTexture('puck_moon', r * 2, r * 2); g.destroy();
    },

    generateLavaIcon(scene) {
        if (scene.textures.exists('world_lava')) return;
        const g = scene.make.graphics({ add: false });
        g.fillStyle(0x330000); g.fillRect(0, 0, 80, 60); // Dark ground
        g.fillStyle(0xff4400); g.fillCircle(40, 30, 20); // Lava pool
        g.fillStyle(0xff8800); g.fillCircle(35, 25, 5); // Glow
        g.generateTexture('world_lava', 80, 60); g.destroy();
    },

    generateSnowIcon(scene) {
        if (scene.textures.exists('world_snow')) return;
        const g = scene.make.graphics({ add: false });
        g.fillStyle(0xddffff); g.fillRect(0, 0, 80, 60); // Snow
        g.fillStyle(0x00ccff); g.fillRect(0, 50, 80, 10); // Ice edge
        g.fillStyle(0xffffff); g.fillCircle(20, 20, 5); g.fillCircle(60, 35, 3); // Flakes
        g.generateTexture('world_snow', 80, 60); g.destroy();
    },

    generateForestIcon(scene) {
        if (scene.textures.exists('world_forest')) return;
        const g = scene.make.graphics({ add: false });
        g.fillStyle(0x002200); g.fillRect(0, 0, 80, 60); // Grass
        g.fillStyle(0x00ff00); g.fillCircle(20, 30, 10); g.fillCircle(60, 25, 12); // Bushes
        g.generateTexture('world_forest', 80, 60); g.destroy();
    },

    generateMoonWorldIcon(scene) {
        if (scene.textures.exists('world_moon')) return;
        const g = scene.make.graphics({ add: false });
        g.fillStyle(0x111111); g.fillRect(0, 0, 80, 60); // Space
        g.fillStyle(0x555555); g.fillRect(0, 40, 80, 20); // Surface
        g.fillStyle(0x333333); g.fillCircle(20, 50, 8); // Crater
        g.generateTexture('world_moon', 80, 60); g.destroy();
    },

    generateSkyIcon(scene) {
        if (scene.textures.exists('world_sky')) return;
        const g = scene.make.graphics({ add: false });
        g.fillStyle(0x0088ff); g.fillRect(0, 0, 80, 60); // Blue
        g.fillStyle(0xffffff); g.fillCircle(30, 20, 15); g.fillCircle(50, 20, 12); // Cloud
        g.generateTexture('world_sky', 80, 60); g.destroy();
    },

    generateUnderwaterIcon(scene) {
        if (scene.textures.exists('world_underwater')) return;
        const g = scene.make.graphics({ add: false });
        g.fillStyle(0x000044); g.fillRect(0, 0, 80, 60); // Deep Blue
        g.fillStyle(0x00ffff); g.fillCircle(20, 40, 5); g.fillCircle(60, 10, 3); // Bubbles
        g.generateTexture('world_underwater', 80, 60); g.destroy();
    },

    generateModHardIcon(scene) {
        if (scene.textures.exists('mod_hard')) return;
        const g = scene.make.graphics({ add: false });
        g.fillStyle(0x440000); g.fillRect(0, 0, 80, 60);
        g.fillStyle(0xff0000); g.beginPath();
        g.moveTo(40, 10); g.lineTo(15, 50); g.lineTo(65, 50); g.fillPath(); // Warning triangle
        g.fillStyle(0xffffff); g.fillRect(38, 25, 4, 15); g.fillCircle(40, 45, 3); // Exp point
        g.generateTexture('mod_hard', 80, 60); g.destroy();
    },

    generateModHalfIcon(scene) {
        if (scene.textures.exists('mod_half')) return;
        const g = scene.make.graphics({ add: false });
        g.fillStyle(0x004400); g.fillRect(0, 0, 80, 60);
        g.lineStyle(4, 0xffffff); g.strokeCircle(40, 30, 20); // Clock face
        g.lineStyle(2, 0xffffff); g.lineBetween(40, 30, 40, 15); g.lineBetween(40, 30, 55, 30); // Hands
        g.generateTexture('mod_half', 80, 60); g.destroy();
    },

    generateModTwiceIcon(scene) {
        if (scene.textures.exists('mod_twice')) return;
        const g = scene.make.graphics({ add: false });
        g.fillStyle(0x000044); g.fillRect(0, 0, 80, 60);
        g.fillStyle(0xffff00);
        g.beginPath(); g.moveTo(40, 5); g.lineTo(20, 35); g.lineTo(40, 35); g.lineTo(35, 55); g.lineTo(55, 25); g.lineTo(35, 25); g.closePath(); g.fillPath(); // Lightning
        g.generateTexture('mod_twice', 80, 60); g.destroy();
    },



    generateModKnockbackIcon(scene) {
        if (scene.textures.exists('mod_knockback')) return;
        const g = scene.make.graphics({ add: false });
        g.fillStyle(0x442200); g.fillRect(0, 0, 80, 60);
        g.fillStyle(0xffffff); g.fillCircle(20, 30, 10); // Paddle
        g.fillStyle(0x00ff00); g.fillCircle(60, 30, 8); // Puck hit
        g.lineStyle(3, 0xffffff); g.lineBetween(45, 30, 35, 20); g.lineBetween(45, 30, 35, 40); // Knockback arrow
        g.generateTexture('mod_knockback', 80, 60); g.destroy();
    },

    generateCityIcon(scene) {
        if (scene.textures.exists('world_city')) return;
        const g = scene.make.graphics({ add: false });
        g.fillStyle(0x111122); g.fillRect(0, 0, 80, 60); // Dark sky
        g.fillStyle(0x333344); g.fillRect(10, 20, 20, 40); g.fillRect(40, 10, 25, 50); // Buildings
        g.fillStyle(0xffff00); g.fillRect(15, 25, 4, 4); g.fillRect(45, 15, 4, 4); // Windows
        g.generateTexture('world_city', 80, 60); g.destroy();
    }
};
