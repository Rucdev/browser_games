import { Game } from './game';

export function initGame(canvas: HTMLCanvasElement) {
    const game = new Game(canvas);
    game.start();
}