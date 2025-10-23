import { Vector2, Rectangle, InputState } from './types';
import { PlayerState, playerSpriteSheet, SpriteRenderer } from './sprites';

export class Player {
    public position: Vector2;
    public velocity: Vector2;
    public size: Vector2;
    public hp: number;
    private maxHp: number;
    public isGrounded: boolean = false;
    private isAttacking: boolean = false;
    private isDodging: boolean = false;
    private attackTimer: number = 0;
    private dodgeTimer: number = 0;
    private invulnerableTimer: number = 0;
    private currentState: PlayerState = PlayerState.IDLE; // 現在の状態
    private spriteLoaded: boolean = false;                // スプライト読み込み完了フラグ

    private readonly MOVE_SPEED = 150;
    private readonly JUMP_FORCE = -400;
    private readonly GRAVITY = 1200;
    private readonly ATTACK_DURATION = 300;
    private readonly DODGE_DURATION = 200;
    private readonly DODGE_DISTANCE = 100;
    private readonly INVULNERABLE_DURATION = 500;

    constructor(x: number, y: number, hp: number) {
        this.position = { x, y };
        this.velocity = { x: 0, y: 0 };
        this.size = { x: 32, y: 48 };
        this.hp = hp;
        this.maxHp = hp;
        this.loadSprite(); // スプライト読み込み開始
    }

    // プレイヤースプライトを非同期で読み込み
    private async loadSprite(): Promise<void> {
        try {
            await SpriteRenderer.loadImage(playerSpriteSheet.imagePath);
            this.spriteLoaded = true;
        } catch (error) {
            console.error('Failed to load player sprite:', error);
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

    update(deltaTime: number, input: InputState): void {
        const dt = deltaTime / 1000;

        this.updateTimers(deltaTime);
        this.handleInput(input);
        this.updatePhysics(dt);
        this.updatePosition(dt);
        this.updateState(); // 状態更新
    }

    // プレイヤーの状態を更新
    private updateState(): void {
        if (this.invulnerableTimer > 0 && this.invulnerableTimer > this.INVULNERABLE_DURATION - 200) {
            this.currentState = PlayerState.HURT;      // ダメージ状態
        } else if (this.isDodging) {
            this.currentState = PlayerState.DODGING;   // 回避状態
        } else if (this.isAttacking) {
            this.currentState = PlayerState.ATTACKING; // 攻撃状態
        } else if (!this.isGrounded) {
            this.currentState = PlayerState.JUMPING;   // ジャンプ状態
        } else if (this.isGrounded && Math.abs(this.velocity.x) > 50) {
            this.currentState = PlayerState.RUNNING;   // 走行状態
        } else {
            this.currentState = PlayerState.IDLE;      // 待機状態
        }
    }

    private updateTimers(deltaTime: number): void {
        if (this.attackTimer > 0) {
            this.attackTimer -= deltaTime;
            if (this.attackTimer <= 0) {
                this.isAttacking = false;
            }
        }

        if (this.dodgeTimer > 0) {
            this.dodgeTimer -= deltaTime;
            if (this.dodgeTimer <= 0) {
                this.isDodging = false;
            }
        }

        if (this.invulnerableTimer > 0) {
            this.invulnerableTimer -= deltaTime;
        }
    }

    private handleInput(input: InputState): void {
        if (input.jump && this.isGrounded && !this.isDodging) {
            this.velocity.y = this.JUMP_FORCE;
            this.isGrounded = false;
        }

        if (input.attack && !this.isAttacking && !this.isDodging) {
            this.isAttacking = true;
            this.attackTimer = this.ATTACK_DURATION;
        }

        if (input.dodge && !this.isDodging && !this.isAttacking) {
            this.isDodging = true;
            this.dodgeTimer = this.DODGE_DURATION;
            this.invulnerableTimer = this.DODGE_DURATION;
            this.position.x += this.DODGE_DISTANCE;
        }
    }

    private updatePhysics(dt: number): void {
        if (!this.isDodging) {
            this.velocity.x = this.MOVE_SPEED;
        } else {
            this.velocity.x = this.MOVE_SPEED * 2;
        }

        this.velocity.y += this.GRAVITY * dt;
    }

    private updatePosition(dt: number): void {
        this.position.x += this.velocity.x * dt;
        this.position.y += this.velocity.y * dt;
    }

    getBounds(): Rectangle {
        return {
            x: this.position.x,
            y: this.position.y,
            width: this.size.x,
            height: this.size.y
        };
    }

    getAttackBounds(): Rectangle | null {
        if (!this.isAttacking) return null;

        return {
            x: this.position.x + this.size.x,
            y: this.position.y,
            width: 40,
            height: this.size.y
        };
    }

    takeDamage(amount: number): boolean {
        if (this.invulnerableTimer > 0) return false;

        this.hp -= amount;
        this.invulnerableTimer = this.INVULNERABLE_DURATION;
        return true;
    }

    isInvulnerable(): boolean {
        return this.invulnerableTimer > 0 || this.isDodging;
    }

    isDead(): boolean {
        return this.hp <= 0;
    }

    draw(ctx: CanvasRenderingContext2D, cameraX: number): void {
        const screenX = this.position.x - cameraX;

        ctx.save();

        if (this.invulnerableTimer > 0 && Math.floor(this.invulnerableTimer / 100) % 2) {
            ctx.globalAlpha = 0.5;
        }

        // スプライトが読み込まれていればスプライトを描画、なければ色付き四角形で代用
        if (this.spriteLoaded) {
            SpriteRenderer.drawSprite(
                ctx,
                playerSpriteSheet,
                this.currentState,
                screenX,
                this.position.y,
                false
            );
        } else {
            // フォールバック描画（スプライト未読み込み時）
            ctx.fillStyle = '#4CAF50';
            ctx.fillRect(screenX, this.position.y, this.size.x, this.size.y);
        }


        if (this.isAttacking) {
            ctx.fillStyle = '#FFC107';
            const attackBounds = this.getAttackBounds();
            if (attackBounds) {
                ctx.fillRect(attackBounds.x - cameraX, attackBounds.y, attackBounds.width, attackBounds.height);
            }
        }

        if (this.isDodging) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.fillRect(screenX - 20, this.position.y, this.size.x, this.size.y);
        }

        ctx.restore();
    }
}