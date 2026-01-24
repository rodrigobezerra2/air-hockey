
const SAVE_KEY = 'airhockey_data_v1';

export const Persistence = {
    getData() {
        const defaultData = {
            coins: 0,
            unlockedStages: 1,
            language: 'en',
            ownedItems: [],
            equipped: {
                p1: { eyes: null, hat: null, moustache: null, mouth: null },
                p2: { eyes: null, hat: null, moustache: null, mouth: null },
                puck: { skin: null },
                world: { background: null },
                modifiers: {
                    hardMode: false,
                    halfSpeed: false,
                    twiceSpeed: false,
                    knockback: false
                }
            }
        };

        const storedData = localStorage.getItem(SAVE_KEY);
        if (storedData) {
            const parsed = JSON.parse(storedData);
            // Merge defaults for missing keys (schema evolution)
            const merged = { ...defaultData, ...parsed };
            merged.equipped = { ...defaultData.equipped, ...parsed.equipped };
            // Ensure sub-objects also exist
            merged.equipped.p1 = { ...defaultData.equipped.p1, ...parsed.equipped?.p1 };
            merged.equipped.p2 = { ...defaultData.equipped.p2, ...parsed.equipped?.p2 };
            merged.equipped.puck = { ...defaultData.equipped.puck, ...parsed.equipped?.puck };
            merged.equipped.world = { ...defaultData.equipped.world, ...parsed.equipped?.world };
            merged.equipped.modifiers = { ...defaultData.equipped.modifiers, ...parsed.equipped?.modifiers };

            // Migration: Remove deprecated Giant Puck
            merged.ownedItems = merged.ownedItems.filter(id => id !== 'moustache_robotnik' && id !== 'mod_giant');
            if (merged.equipped.modifiers.giantPuck !== undefined) delete merged.equipped.modifiers.giantPuck;

            return merged;
        }
        return defaultData;
    },

    setLanguage(lang) {
        const data = this.getData();
        data.language = lang;
        this.saveData(data);
    },

    saveData(data) {
        localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    },

    addCoins(amount) {
        const data = this.getData();
        data.coins += amount;
        this.saveData(data);
        return data.coins;
    },

    buyItem(id, cost) {
        const data = this.getData();
        if (data.coins >= cost && !data.ownedItems.includes(id)) {
            data.coins -= cost;
            data.ownedItems.push(id);
            this.saveData(data);
            return true;
        }
        return false;
    },

    isItemOwned(id) {
        return this.getData().ownedItems.includes(id);
    },

    equipItem(target, category, id) {
        const data = this.getData();
        if (target === 'p1' || target === 'p2') {
            data.equipped[target][category] = id;
        } else if (target === 'puck') {
            data.equipped.puck.skin = id;
        } else if (target === 'world') {
            data.equipped.world.background = id;
        }
        this.saveData(data);
    },

    getEquipped(target, category) {
        const data = this.getData();
        if (target === 'p1' || target === 'p2') {
            return data.equipped[target][category];
        } else if (target === 'puck') {
            return data.equipped.puck.skin;
        } else if (target === 'world') {
            return data.equipped.world.background;
        }
        return null;
    },

    toggleModifier(id) {
        const data = this.getData();
        if (data.equipped.modifiers[id] !== undefined) {
            data.equipped.modifiers[id] = !data.equipped.modifiers[id];

            // Mutual exclusivity for speed
            if (id === 'halfSpeed' && data.equipped.modifiers.halfSpeed) data.equipped.modifiers.twiceSpeed = false;
            if (id === 'twiceSpeed' && data.equipped.modifiers.twiceSpeed) data.equipped.modifiers.halfSpeed = false;

            this.saveData(data);
        }
    },

    isModifierActive(id) {
        return this.getData().equipped.modifiers[id] || false;
    },

    unlockStage(stageNum) {
        const data = this.getData();
        if (stageNum > data.unlockedStages) {
            data.unlockedStages = stageNum;
            this.saveData(data);
        }
    },

    resetToDefaultShop() {
        const data = this.getData();
        data.equipped = {
            p1: { eyes: null, hat: null, moustache: null, mouth: null },
            p2: { eyes: null, hat: null, moustache: null, mouth: null },
            puck: { skin: null }
        };
        this.saveData(data);
    },

    resetProgress() {
        localStorage.removeItem(SAVE_KEY);
    }
};
