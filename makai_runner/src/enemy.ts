import { Vector2, Rectangle } from './types.js';

export enum EnemyType {
    WALKER = 'walker',
    FLYER = 'flyer',
    DIGGER = 'digger'
}

export enum EnemyState {
    MOVING = 'moving',
    UNDERGROUND = 'underground',
    EMERGING = 'emerging'
}

export abstract class Enemy {
    public position: Vector2;
    public velocity: Vector2;
    public size: Vector2;
    public type: EnemyType;
    public isAlive: boolean = true;
    protected speed: number;

    constructor(x: number, y: number, type: EnemyType, speed: number = 50) {
        this.position = { x, y };
        this.velocity = { x: -speed, y: 0 };
        this.size = { x: 24, y: 24 };
        this.type = type;
        this.speed = speed;
    }

    abstract update(deltaTime: number, playerPosition: Vector2, groundY: number): void;
    abstract draw(ctx: CanvasRenderingContext2D, cameraX: number): void;

    getBounds(): Rectangle {
        return {
            x: this.position.x,
            y: this.position.y,
            width: this.size.x,
            height: this.size.y
        };
    }

    takeDamage(): void {
        this.isAlive = false;
    }

    isOffScreen(cameraX: number, canvasWidth: number): boolean {
        return this.position.x + this.size.x < cameraX - 100;
    }
}

export class WalkingEnemy extends Enemy {
    constructor(x: number, y: number) {
        super(x, y, EnemyType.WALKER, 30);
    }

    update(deltaTime: number, playerPosition: Vector2, groundY: number): void {
        const dt = deltaTime / 1000;

        this.position.x += this.velocity.x * dt;
        this.position.y = groundY - this.size.y;
    }

    draw(ctx: CanvasRenderingContext2D, cameraX: number): void {
        const screenX = this.position.x - cameraX;

        ctx.fillStyle = '#FF5722';
        ctx.fillRect(screenX, this.position.y, this.size.x, this.size.y);

        ctx.fillStyle = '#FFF';
        ctx.fillRect(screenX + 6, this.position.y + 6, 4, 4);
        ctx.fillRect(screenX + 14, this.position.y + 6, 4, 4);
    }
}

export class FlyingEnemy extends Enemy {
    private baseY: number;
    private oscillationTimer: number = 0;

    constructor(x: number, y: number) {
        super(x, y, EnemyType.FLYER, 40);
        this.baseY = y;
    }

    update(deltaTime: number, playerPosition: Vector2, groundY: number): void {
        const dt = deltaTime / 1000;

        this.position.x += this.velocity.x * dt;

        this.oscillationTimer += deltaTime / 1000;
        this.position.y = this.baseY + Math.sin(this.oscillationTimer * 3) * 20;
    }

    draw(ctx: CanvasRenderingContext2D, cameraX: number): void {
        const screenX = this.position.x - cameraX;

        ctx.fillStyle = '#2196F3';
        ctx.fillRect(screenX, this.position.y, this.size.x, this.size.y);

        ctx.fillStyle = '#FFF';
        ctx.fillRect(screenX + 6, this.position.y + 6, 4, 4);
        ctx.fillRect(screenX + 14, this.position.y + 6, 4, 4);

        ctx.fillStyle = '#90CAF9';
        ctx.fillRect(screenX - 8, this.position.y + 8, 8, 8);
        ctx.fillRect(screenX + this.size.x, this.position.y + 8, 8, 8);
    }
}

export class DiggingEnemy extends Enemy {
    private state: EnemyState = EnemyState.MOVING;
    private detectionRange: number = 200;
    private emergeRange: number = 80;
    private stateTimer: number = 0;
    private groundY: number;

    constructor(x: number, y: number, groundY: number) {
        super(x, y, EnemyType.DIGGER, 25);
        this.groundY = groundY;
        this.position.y = groundY - this.size.y;
    }

    update(deltaTime: number, playerPosition: Vector2, groundY: number): void {
        const dt = deltaTime / 1000;
        const distanceToPlayer = Math.abs(this.position.x - playerPosition.x);

        this.stateTimer += deltaTime;

        switch (this.state) {
            case EnemyState.MOVING:
                this.position.x += this.velocity.x * dt;

                if (distanceToPlayer < this.detectionRange && playerPosition.x > this.position.x) {
                    this.state = EnemyState.UNDERGROUND;
                    this.stateTimer = 0;
                }
                break;

            case EnemyState.UNDERGROUND:
                if (distanceToPlayer < this.emergeRange) {
                    this.state = EnemyState.EMERGING;
                    this.stateTimer = 0;
                }
                break;

            case EnemyState.EMERGING:
                this.position.x += this.velocity.x * dt;
                if (this.stateTimer > 500) {
                    this.state = EnemyState.MOVING;
                }
                break;
        }
    }

    draw(ctx: CanvasRenderingContext2D, cameraX: number): void {
        const screenX = this.position.x - cameraX;

        if (this.state === EnemyState.UNDERGROUND) {
            ctx.fillStyle = '#795548';
            ctx.fillRect(screenX, this.position.y + this.size.y - 8, this.size.x, 8);
            return;
        }

        ctx.fillStyle = '#FF9800';
        ctx.fillRect(screenX, this.position.y, this.size.x, this.size.y);

        ctx.fillStyle = '#FFF';
        ctx.fillRect(screenX + 6, this.position.y + 6, 4, 4);
        ctx.fillRect(screenX + 14, this.position.y + 6, 4, 4);

        if (this.state === EnemyState.EMERGING) {
            ctx.fillStyle = 'rgba(255, 152, 0, 0.5)';
            ctx.fillRect(screenX - 4, this.position.y - 4, this.size.x + 8, this.size.y + 8);
        }
    }

    getBounds(): Rectangle {
        if (this.state === EnemyState.UNDERGROUND) {
            return {
                x: this.position.x,
                y: this.position.y + this.size.y,
                width: 0,
                height: 0
            };
        }
        return super.getBounds();
    }
}