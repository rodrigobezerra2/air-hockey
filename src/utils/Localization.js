import { Persistence } from '../persistence.js';

const FLAGS = {
    en: 'flag_en',
    cy: 'flag_cy',
    pt: 'flag_pt'
};

const NATIVE_NAMES = {
    en: 'English',
    cy: 'Cymraeg',
    pt: 'Português'
};

const STRINGS = {
    en: {
        'MENU_TITLE': 'AIR HOCKEY',
        'BTN_1P': '1 PLAYER (Stages)',
        'BTN_2P': '2 PLAYERS (PVP)',
        'BTN_RESET': 'RESET SAVE DATA',
        'BACK': 'BACK',
        'SELECT_STAGE': 'SELECT STAGE',
        'STAGE_1_NAME': 'CLASSIC', 'STAGE_1_DESC': 'The original experience.',
        'STAGE_2_NAME': 'LONG FIELD', 'STAGE_2_DESC': 'Can you score from further away?',
        'STAGE_3_NAME': 'FIELD FLIPPED?', 'STAGE_3_DESC': 'Careful on this one!',
        'STAGE_4_NAME': 'FOOTBALL', 'STAGE_4_DESC': 'Time to score some goals!',
        'STAGE_5_NAME': 'BOXING', 'STAGE_5_DESC': 'Press down to bump your opponent!',
        'STAGE_6_NAME': 'DOUBLE BALLS', 'STAGE_6_DESC': 'Two is better than one.',
        'STAGE_7_NAME': 'OBSTACLES', 'STAGE_7_DESC': 'Can you hit the goal?',
        'STAGE_7_NAME': 'OBSTACLES', 'STAGE_7_DESC': 'Can you hit the goal?',
        'MADNESS_MODE_ENABLED': 'FREEDOM MODE',
        'QUIT': 'QUIT',
        'QUIT': 'QUIT',
        'RESUME': 'RESUME',
        'SOUND_ON': 'SOUND: ON',
        'SOUND_OFF': 'SOUND: OFF',
        'STAGE_SELECT': 'STAGE SELECT',
        'MAIN_MENU': 'MAIN MENU',
        'STAGE_COMPLETED': 'STAGE COMPLETED!',
        'STAGE_FAILED': 'STAGE FAILED',
        'VICTORY': 'VICTORY!',
        'DRAW': 'DRAW',
        'CONTINUE': 'CONTINUE',
        'GOALS_P1': 'Goals (P1)',
        'COINS': 'coins',
        'WIN_BONUS': 'Win Bonus'
    },
    cy: {
        'MENU_TITLE': 'HOCI AWYR',
        'BTN_1P': '1 CHWARAEWR (Camau)',
        'BTN_2P': '2 CHWARAEWR (PVP)',
        'BTN_RESET': 'AILOSOD DATA ARBED',
        'BACK': 'YN ÔL',
        'SELECT_STAGE': 'DEWISWCH GAM',
        'STAGE_1_NAME': 'CLASUROL', 'STAGE_1_DESC': 'Y profiad gwreiddiol.',
        'STAGE_2_NAME': 'CAE HIR', 'STAGE_2_DESC': 'Allwch chi sgorio o bell?',
        'STAGE_3_NAME': 'CAE WEDI TROI?', 'STAGE_3_DESC': 'Byddwch yn ofalus gyda hwn!',
        'STAGE_4_NAME': 'PÊL-DROED', 'STAGE_4_DESC': 'Amser i sgorio goliau!',
        'STAGE_5_NAME': 'BOCSIO', 'STAGE_5_DESC': 'Pwyswch i lawr i daro eich gwrthwynebydd!',
        'STAGE_6_NAME': 'DWY BÊL', 'STAGE_6_DESC': 'Mae dwy yn gwell nag un.',
        'STAGE_7_NAME': 'RHWYSTRAU', 'STAGE_7_DESC': 'Allwch chi daro\'r gôl?',
        'STAGE_7_NAME': 'RHWYSTRAU', 'STAGE_7_DESC': 'Allwch chi daro\'r gôl?',
        'MADNESS_MODE_ENABLED': 'MODD RHYDDID',
        'QUIT': 'GADAEL',
        'QUIT': 'GADAEL',
        'RESUME': 'AILDDECHRAU',
        'SOUND_ON': 'SAIN: YMLAEN',
        'SOUND_OFF': 'SAIN: WEDI DIFFODD',
        'STAGE_SELECT': 'DEWIS GAM',
        'MAIN_MENU': 'PRIF DDEWISLEN',
        'STAGE_COMPLETED': 'CAM WEDI\'I GWBLHAU!',
        'STAGE_FAILED': 'CAM WEDI METHU',
        'VICTORY': 'BUDDIGOLIAETH!',
        'DRAW': 'CYFARTAL',
        'CONTINUE': 'PARHAU',
        'GOALS_P1': 'Goliau (P1)',
        'COINS': 'ceiniogau',
        'WIN_BONUS': 'Bonws Ennill'
    },
    pt: {
        'MENU_TITLE': 'HÓQUEI DE MESA',
        'BTN_1P': '1 JOGADOR (Fases)',
        'BTN_2P': '2 JOGADORES (PVP)',
        'BTN_RESET': 'RESETAR DADOS',
        'BACK': 'VOLTAR',
        'SELECT_STAGE': 'SELECIONAR FASE',
        'STAGE_1_NAME': 'CLÁSSICO', 'STAGE_1_DESC': 'A experiência original.',
        'STAGE_2_NAME': 'CAMPO LONGO', 'STAGE_2_DESC': 'Consegue marcar de longe?',
        'STAGE_3_NAME': 'CAMPO INVERTIDO?', 'STAGE_3_DESC': 'Cuidado com este!',
        'STAGE_4_NAME': 'FUTEBOL', 'STAGE_4_DESC': 'Hora de marcar alguns gols!',
        'STAGE_5_NAME': 'BOXE', 'STAGE_5_DESC': 'Pressione para baixo para empurrar seu oponente!',
        'STAGE_6_NAME': 'DUAS BOLAS', 'STAGE_6_DESC': 'Duas é melhor que uma.',
        'STAGE_7_NAME': 'OBSTÁCULOS', 'STAGE_7_DESC': 'Consegue acertar o gol?',
        'STAGE_7_NAME': 'OBSTÁCULOS', 'STAGE_7_DESC': 'Consegue acertar o gol?',
        'MADNESS_MODE_ENABLED': 'MODO LIBERDADE',
        'QUIT': 'SAIR',
        'QUIT': 'SAIR',
        'RESUME': 'CONTINUAR',
        'SOUND_ON': 'SOM: LIGADO',
        'SOUND_OFF': 'SOM: DESLIGADO',
        'STAGE_SELECT': 'SELEÇÃO DE FASES',
        'MAIN_MENU': 'MENU PRINCIPAL',
        'STAGE_COMPLETED': 'FASE COMPLETADA!',
        'STAGE_FAILED': 'FASE FALHOU',
        'VICTORY': 'VITÓRIA!',
        'DRAW': 'EMPATE',
        'CONTINUE': 'CONTINUAR',
        'GOALS_P1': 'Gols (P1)',
        'COINS': 'moedas',
        'WIN_BONUS': 'Bônus de Vitória'
    }
};

export const Localization = {
    currentLang: 'en',

    init() {
        const data = Persistence.getData();
        this.currentLang = data.language || 'en';
    },

    get(key) {
        if (STRINGS[this.currentLang] && STRINGS[this.currentLang][key]) {
            return STRINGS[this.currentLang][key];
        }
        return STRINGS['en'][key] || key; // Fallback
    },

    setLanguage(lang) {
        if (STRINGS[lang]) {
            this.currentLang = lang;
            Persistence.setLanguage(lang);
        }
    },

    getCurrentLanguage() {
        return this.currentLang;
    },

    getNextLanguage() {
        const langs = Object.keys(STRINGS);
        const idx = langs.indexOf(this.currentLang);
        const nextIdx = (idx + 1) % langs.length;
        return langs[nextIdx];
    },

    getFlag(lang) { return FLAGS[lang || this.currentLang]; },
    getName(lang) { return NATIVE_NAMES[lang || this.currentLang]; },
    getAllLanguages() { return Object.keys(STRINGS); }
};
