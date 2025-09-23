export interface Vector2 {
    x: number;
    y: number;
}

export interface Rectangle {
    x: number;
    y: number;
    width: number;
    height: number;
}

export enum GameState {
    MENU = 'menu',
    DIFFICULTY_SELECT = 'difficulty_select',
    STAGE_SELECT = 'stage_select',
    PLAYING = 'playing',
    GAME_OVER = 'game_over',
    RESULT = 'result'
}

export enum Difficulty {
    EASY = 'easy',
    NORMAL = 'normal',
    HARD = 'hard'
}

export interface GameConfig {
    difficulty: Difficulty;
    stage: number;
    hp: number;
}

export interface InputState {
    jump: boolean;
    attack: boolean;
    dodge: boolean;
}