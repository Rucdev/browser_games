import { Vector2, Rectangle } from './types.js';
import { EnemyAnimationState, walkerEnemySpriteSheet, flyerEnemySpriteSheet, diggerEnemySpriteSheet, SpriteRenderer } from './sprites.js';

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
    protected currentAnimationState: EnemyAnimationState = EnemyAnimationState.IDLE; // 現在のアニメーション状態
    protected spriteLoaded: boolean = false;                                        // スプライト読み込み完了フラグ

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
        this.currentAnimationState = EnemyAnimationState.DYING; // 死亡アニメーションに変更
        this.isAlive = false;
    }

    isOffScreen(cameraX: number, canvasWidth: number): boolean {
        return this.position.x + this.size.x < cameraX - 100;
    }
}

// 歩行型敵クラス
export class WalkingEnemy extends Enemy {
    constructor(x: number, y: number) {
        super(x, y, EnemyType.WALKER, 30);
        this.loadSprite(); // スプライト読み込み開始
    }

    // 歩行型敵のスプライトを非同期で読み込み
    private async loadSprite(): Promise<void> {
        try {
            await SpriteRenderer.loadImage(walkerEnemySpriteSheet.imagePath);
            this.spriteLoaded = true;
        } catch (error) {
            console.error('Failed to load walker enemy sprite:', error);
        }
    }

    public async waitForSpriteLoad(): Promise<void> {
        // 既に読み込まれている場合はすぐに完了
        if (this.spriteLoaded) {
            return Promise.resolve();
        }

        // スプライトの読み込みが完了するまで待機
        return new Promise<void>((resolve) => {
            const checkInterval = setInterval(() => {
                if (this.spriteLoaded) {
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 10); // 10msごとにチェック
        });
    }

    update(deltaTime: number, playerPosition: Vector2, groundY: number): void {
        const dt = deltaTime / 1000;

        this.position.x += this.velocity.x * dt;
        this.position.y = groundY - this.size.y;

        if (this.isAlive) {
            this.currentAnimationState = EnemyAnimationState.MOVING; // 生存中は移動状態
        }
    }

    draw(ctx: CanvasRenderingContext2D, cameraX: number): void {
        const screenX = this.position.x - cameraX;

        // スプライトが読み込まれていればスプライトを描画、なければ色付き四角形で代用
        if (this.spriteLoaded) {
            SpriteRenderer.drawSprite(
                ctx,
                walkerEnemySpriteSheet,
                this.currentAnimationState,
                screenX,
                this.position.y,
                false
            );
        } else {
            // フォールバック描画（スプライト未読み込み時）
            ctx.fillStyle = '#FF5722';
            ctx.fillRect(screenX, this.position.y, this.size.x, this.size.y);

            ctx.fillStyle = '#FFF';
            ctx.fillRect(screenX + 6, this.position.y + 6, 4, 4);
            ctx.fillRect(screenX + 14, this.position.y + 6, 4, 4);
        }
    }
}

// 飛行型敵クラス
export class FlyingEnemy extends Enemy {
    private baseY: number;                    // 基準Y座標
    private oscillationTimer: number = 0;     // 振動タイマー

    constructor(x: number, y: number) {
        super(x, y, EnemyType.FLYER, 40);
        this.baseY = y;
        this.loadSprite(); // スプライト読み込み開始
    }

    // 飛行型敵のスプライトを非同期で読み込み
    private async loadSprite(): Promise<void> {
        try {
            await SpriteRenderer.loadImage(flyerEnemySpriteSheet.imagePath);
            this.spriteLoaded = true;
        } catch (error) {
            console.error('Failed to load flyer enemy sprite:', error);
        }
    }

    public async waitForSpriteLoad(): Promise<void> {
        // 既に読み込まれている場合はすぐに完了
        if (this.spriteLoaded) {
            return Promise.resolve();
        }

        // スプライトの読み込みが完了するまで待機
        return new Promise<void>((resolve) => {
            const checkInterval = setInterval(() => {
                if (this.spriteLoaded) {
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 10); // 10msごとにチェック
        });
    }

    update(deltaTime: number, playerPosition: Vector2, groundY: number): void {
        const dt = deltaTime / 1000;

        this.position.x += this.velocity.x * dt;

        // 上下振動運動
        this.oscillationTimer += deltaTime / 1000;
        this.position.y = this.baseY + Math.sin(this.oscillationTimer * 3) * 20;

        if (this.isAlive) {
            this.currentAnimationState = EnemyAnimationState.MOVING; // 生存中は移動状態
        }
    }

    draw(ctx: CanvasRenderingContext2D, cameraX: number): void {
        const screenX = this.position.x - cameraX;

        // スプライトが読み込まれていればスプライトを描画、なければ色付き四角形で代用
        if (this.spriteLoaded) {
            SpriteRenderer.drawSprite(
                ctx,
                flyerEnemySpriteSheet,
                this.currentAnimationState,
                screenX,
                this.position.y,
                false
            );
        } else {
            // フォールバック描画（スプライト未読み込み時）
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
}

// 穴掘り型敵クラス
export class DiggingEnemy extends Enemy {
    private state: EnemyState = EnemyState.MOVING;  // 敵の行動状態
    private detectionRange: number = 400;           // プレイヤー検知範囲
    private emergeRange: number = 80;               // 出現範囲
    private stateTimer: number = 0;                 // 状態タイマー
    private groundY: number;                        // 地面Y座標

    constructor(x: number, y: number, groundY: number) {
        super(x, y, EnemyType.DIGGER, 25);
        this.groundY = groundY;
        this.position.y = groundY - this.size.y;
        this.loadSprite(); // スプライト読み込み開始
    }

    // 穴掘り型敵のスプライトを非同期で読み込み
    private async loadSprite(): Promise<void> {
        try {
            await SpriteRenderer.loadImage(diggerEnemySpriteSheet.imagePath);
            this.spriteLoaded = true;
        } catch (error) {
            console.error('Failed to load digger enemy sprite:', error);
        }
    }

    public async waitForSpriteLoad(): Promise<void> {
        // 既に読み込まれている場合はすぐに完了
        if (this.spriteLoaded) {
            return Promise.resolve();
        }

        // スプライトの読み込みが完了するまで待機
        return new Promise<void>((resolve) => {
            const checkInterval = setInterval(() => {
                if (this.spriteLoaded) {
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 10); // 10msごとにチェック
        });
    }

    update(deltaTime: number, playerPosition: Vector2, groundY: number): void {
        const dt = deltaTime / 1000;
        const distanceToPlayer = Math.abs(this.position.x - playerPosition.x);

        this.stateTimer += deltaTime;

        // 行動状態に応じた処理
        switch (this.state) {
            case EnemyState.MOVING:
                this.position.x += this.velocity.x * dt;
                this.currentAnimationState = EnemyAnimationState.MOVING;

                // プレイヤーが検知範囲内に入り、かつプレイヤーが敵より右にいる場合のみ地中に潜る
                if (distanceToPlayer < this.detectionRange && playerPosition.x > this.position.x) {
                    this.state = EnemyState.UNDERGROUND;
                    this.currentAnimationState = EnemyAnimationState.UNDERGROUND;
                    this.stateTimer = 0;
                }
                break;

            case EnemyState.UNDERGROUND:
                this.currentAnimationState = EnemyAnimationState.UNDERGROUND;
                // プレイヤーが敵より左に行った場合は通常移動に戻る
                if (playerPosition.x < this.position.x) {
                    this.state = EnemyState.MOVING;
                    this.currentAnimationState = EnemyAnimationState.MOVING;
                    this.stateTimer = 0;
                }
                // プレイヤーが近づいたら出現
                else if (distanceToPlayer < this.emergeRange) {
                    this.state = EnemyState.EMERGING;
                    this.currentAnimationState = EnemyAnimationState.EMERGING;
                    this.stateTimer = 0;
                }
                break;

            case EnemyState.EMERGING:
                this.currentAnimationState = EnemyAnimationState.EMERGING;
                this.position.x += this.velocity.x * dt;
                // 一定時間後に通常移動に戻る
                if (this.stateTimer > 500) {
                    this.state = EnemyState.MOVING;
                    this.currentAnimationState = EnemyAnimationState.MOVING;
                }
                break;
        }

        if (!this.isAlive) {
            this.currentAnimationState = EnemyAnimationState.DYING; // 死亡時は死亡アニメーション
        }
    }

    draw(ctx: CanvasRenderingContext2D, cameraX: number): void {
        const screenX = this.position.x - cameraX;

        // スプライトが読み込まれていればスプライトを描画、なければ色付き四角形で代用
        if (this.spriteLoaded) {
            SpriteRenderer.drawSprite(
                ctx,
                diggerEnemySpriteSheet,
                this.currentAnimationState,
                screenX,
                this.position.y,
                false
            );
        } else {
            // // フォールバック描画（スプライト未読み込み時）
            // if (this.state === EnemyState.UNDERGROUND) {
            //     // 地中状態では土の部分のみ表示
            //     ctx.fillStyle = '#795548';
            //     ctx.fillRect(screenX, this.position.y + this.size.y - 8, this.size.x, 8);
            //     return;
            // }

            // ctx.fillStyle = '#FF9800';
            // ctx.fillRect(screenX, this.position.y, this.size.x, this.size.y);

            // // ctx.fillStyle = '#FFF';
            // // ctx.fillRect(screenX + 6, this.position.y + 6, 4, 4);
            // // ctx.fillRect(screenX + 14, this.position.y + 6, 4, 4);

            // // 出現状態では光るエフェクト
            // if (this.state === EnemyState.EMERGING) {
            //     ctx.fillStyle = 'rgba(255, 152, 0, 0.5)';
            //     ctx.fillRect(screenX - 4, this.position.y - 4, this.size.x + 8, this.size.y + 8);
            // }
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