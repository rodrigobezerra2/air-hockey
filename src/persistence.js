
const SAVE_KEY = 'airhockey_data_v1';

export const Persistence = {
    getData() {
        const data = localStorage.getItem(SAVE_KEY);
        if (data) {
            return JSON.parse(data);
        }
        return {
            coins: 0,
            unlockedStages: 1
        };
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

    unlockStage(stageNum) {
        const data = this.getData();
        if (stageNum > data.unlockedStages) {
            data.unlockedStages = stageNum;
            this.saveData(data);
        }
    },

    resetProgress() {
        localStorage.removeItem(SAVE_KEY);
    }
};
