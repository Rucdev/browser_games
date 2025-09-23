import { Vector2, Rectangle, InputState } from './types.js';

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
    }

    update(deltaTime: number, input: InputState): void {
        const dt = deltaTime / 1000;

        this.updateTimers(deltaTime);
        this.handleInput(input);
        this.updatePhysics(dt);
        this.updatePosition(dt);
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

        ctx.fillStyle = '#4CAF50';
        ctx.fillRect(screenX, this.position.y, this.size.x, this.size.y);

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