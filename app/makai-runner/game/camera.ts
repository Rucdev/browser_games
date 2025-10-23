import { Vector2 } from './types';
import { Player } from './player';

export class Camera {
    public position: Vector2;
    private target: Player;
    private canvasWidth: number;
    private stageWidth: number;

    constructor(target: Player, canvasWidth: number, stageWidth: number) {
        this.target = target;
        this.canvasWidth = canvasWidth;
        this.stageWidth = stageWidth;
        this.position = { x: 0, y: 0 };
    }

    update(): void {
        const targetX = this.target.position.x - this.canvasWidth / 3;

        this.position.x = Math.max(0, Math.min(targetX, this.stageWidth - this.canvasWidth));
    }

    getX(): number {
        return this.position.x;
    }
}