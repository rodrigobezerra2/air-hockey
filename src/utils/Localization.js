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
        'STAGE_8_NAME': 'BOSS!', 'STAGE_8_DESC': 'Time to defeat the boss!',
        'STAGE_9_NAME': 'CANNONS!', 'STAGE_9_DESC': 'Blast off!',
        'STAGE_10_NAME': 'GOALIE!', 'STAGE_10_DESC': 'Protect your goal!',
        'STAGE_11_NAME': 'BOSS WALL!', 'STAGE_11_DESC': 'Defeat the wall boss to score goals!',
        'STAGE_12_NAME': 'HOT POTATO', 'STAGE_12_DESC': 'Make sure the hot potato is not on your side when the timer runs out!',
        'STAGE_13_NAME': 'LASER DISCO', 'STAGE_13_DESC': 'Fire lasers to create more pucks!',
        'STAGE_14_NAME': 'ULTRA LASER DISCO', 'STAGE_14_DESC': '10x pucks! 10x lasers! 1000 goals!',
        'STAGE_15_NAME': 'TUG-OF-WAR',
        'STAGE_15_DESC': 'Mash buttons to push the giant puck!',
        'STAGE_15_INSTRUCTIONS': 'MASH ANY KEY TO PUSH!',
        'MADNESS_MODE_ENABLED': 'FREEDOM MODE',
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
        'WIN_BONUS': 'Win Bonus',
        'P1_WINS': 'PLAYER 1 WINS!',
        'P2_WINS': 'PLAYER 2 WINS!',
        'CPU_WINS': 'CPU WINS!'
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
        'STAGE_8_NAME': 'BÔS!', 'STAGE_8_DESC': 'Amser i drechu\'r bôs!',
        'STAGE_9_NAME': 'CANONAU!', 'STAGE_9_DESC': 'Ffwrdd â chi!',
        'STAGE_10_NAME': 'GÔL-GEIDWAD!', 'STAGE_10_DESC': 'Amddiffynwch eich gôl!',
        'STAGE_11_NAME': 'WAL Y BÔS!', 'STAGE_11_DESC': 'Trechwch y bôs wal i sgorio goliau!',
        'STAGE_12_NAME': 'TATWS POETH', 'STAGE_12_DESC': 'Gwnewch yn siŵr nad yw\'r tatws poeth ar eich ochr chi pan fydd yr amserydd yn dod i ben!',
        'STAGE_13_NAME': 'DISCO LASER', 'STAGE_13_DESC': 'Saethu laserau i greu mwy o bygiau!',
        'STAGE_14_NAME': 'DISCO ULTRA LASER', 'STAGE_14_DESC': '10x bygiau! 10x laserau! 1000 nod!',
        'STAGE_15_NAME': 'TYNNU RHAFF',
        'STAGE_15_DESC': 'Gwasgwch S i wthio\'r puck anferth!',
        'STAGE_15_INSTRUCTIONS': 'GWASGWCH S I WTHIO!',
        'MADNESS_MODE_ENABLED': 'MODD RHYDDID',
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
        'WIN_BONUS': 'Bonws Ennill',
        'P1_WINS': 'CHWARAEWR 1 YN ENNILL!',
        'P2_WINS': 'CHWARAEWR 2 YN ENNILL!',
        'CPU_WINS': 'CPU YN ENNILL!'
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
        'STAGE_8_NAME': 'CHEFE!', 'STAGE_8_DESC': 'Hora de derrotar o chefe!',
        'STAGE_9_NAME': 'CANHÕES!', 'STAGE_9_DESC': 'Lançar!',
        'STAGE_10_NAME': 'GOLEIRO!', 'STAGE_10_DESC': 'Proteja seu gol!',
        'STAGE_11_NAME': 'PAREDE CHEFE!', 'STAGE_11_DESC': 'Derrote a parede chefe para marcar gols!',
        'STAGE_12_NAME': 'BATATA QUENTE', 'STAGE_12_DESC': 'Certifique-se de que a batata quente não esteja do seu lado quando o tempo acabar!',
        'STAGE_13_NAME': 'DISCO LASER', 'STAGE_13_DESC': 'Atire lasers para criar mais discos!',
        'STAGE_14_NAME': 'ULTRA DISCO LASER', 'STAGE_14_DESC': '10x discos! 10x lasers! 1000 gols!',
        'STAGE_15_NAME': 'CABO DE GUERRA',
        'STAGE_15_DESC': 'Aperte S para empurrar o disco gigante!',
        'STAGE_15_INSTRUCTIONS': 'APERTE S!',
        'MADNESS_MODE_ENABLED': 'MODO LIBERDADE',
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
        'WIN_BONUS': 'Bônus de Vitória',
        'P1_WINS': 'JOGADOR 1 VENCEU!',
        'P2_WINS': 'JOGADOR 2 VENCEU!',
        'CPU_WINS': 'CPU VENCEU!'
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
