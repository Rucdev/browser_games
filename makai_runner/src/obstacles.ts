import { Vector2, Rectangle } from './types.js';

export enum ObstacleType {
    HOLE = 'hole',
    SPIKE = 'spike'
}

export abstract class Obstacle {
    public position: Vector2;
    public size: Vector2;
    public type: ObstacleType;

    constructor(x: number, y: number, width: number, height: number, type: ObstacleType) {
        this.position = { x, y };
        this.size = { x: width, y: height };
        this.type = type;
    }

    abstract draw(ctx: CanvasRenderingContext2D, cameraX: number): void;

    getBounds(): Rectangle {
        return {
            x: this.position.x,
            y: this.position.y,
            width: this.size.x,
            height: this.size.y
        };
    }

    isOffScreen(cameraX: number, canvasWidth: number): boolean {
        return this.position.x + this.size.x < cameraX - 100;
    }
}

export class Hole extends Obstacle {
    constructor(x: number, groundY: number, width: number = 80) {
        super(x, groundY, width, 100, ObstacleType.HOLE);
    }

    draw(ctx: CanvasRenderingContext2D, cameraX: number): void {
        const screenX = this.position.x - cameraX;

        ctx.fillStyle = '#000';
        ctx.fillRect(screenX, this.position.y, this.size.x, this.size.y);

        ctx.fillStyle = '#333';
        for (let i = 0; i < 3; i++) {
            ctx.fillRect(screenX + 10 + i * 20, this.position.y + 10 + i * 5, 10, 3);
        }
    }
}

export class Spike extends Obstacle {
    constructor(x: number, groundY: number, width: number = 40) {
        super(x, groundY - 20, width, 20, ObstacleType.SPIKE);
    }

    draw(ctx: CanvasRenderingContext2D, cameraX: number): void {
        const screenX = this.position.x - cameraX;

        ctx.fillStyle = '#666';
        ctx.fillRect(screenX, this.position.y + 15, this.size.x, 5);

        ctx.fillStyle = '#999';
        const spikeCount = Math.floor(this.size.x / 10);
        for (let i = 0; i < spikeCount; i++) {
            const spikeX = screenX + i * 10 + 5;
            ctx.beginPath();
            ctx.moveTo(spikeX, this.position.y + 15);
            ctx.lineTo(spikeX - 5, this.position.y + 15);
            ctx.lineTo(spikeX - 2.5, this.position.y);
            ctx.closePath();
            ctx.fill();
        }
    }
}