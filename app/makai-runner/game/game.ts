import { Player } from './player';
import { InputManager } from './input';
import { Camera } from './camera';
import { Enemy, WalkingEnemy, FlyingEnemy, DiggingEnemy } from './enemy';
import { Obstacle, Hole, Spike } from './obstacles';
import { CollisionManager } from './collision';
import { GameState, Difficulty, GameConfig, Rectangle } from './types';

export class Game {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private player: Player;
    private inputManager: InputManager;
    private camera: Camera;
    private enemies: Enemy[] = [];
    private obstacles: Obstacle[] = [];
    private platforms: Rectangle[] = [];

    private gameState: GameState = GameState.PLAYING;
    private config: GameConfig;
    private score: number = 0;
    private lastTime: number = 0;
    private isReady: boolean = false;

    private readonly CANVAS_WIDTH = 800;
    private readonly CANVAS_HEIGHT = 500;
    private readonly STAGE_WIDTH = 4000;
    private readonly GROUND_Y = 450;

    constructor(canvas?: HTMLCanvasElement) {
        this.canvas = canvas || document.getElementById('gameCanvas') as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d')!;

        this.config = {
            difficulty: Difficulty.NORMAL,
            stage: 1,
            hp: 3
        };

        this.player = new Player(50, this.GROUND_Y - 48, this.config.hp);
        this.inputManager = new InputManager();
        this.camera = new Camera(this.player, this.CANVAS_WIDTH, this.STAGE_WIDTH);

        this.initializeGame();
    }

    private async initializeGame(): Promise<void> {
        // スプライトの読み込み完了を待つ
        await this.waitForSpritesLoad();

        this.spawnEnemies();
        this.spawnObstacles();
        this.setupUI();
        this.isReady = true;
    }

    private async waitForSpritesLoad(): Promise<void> {
        // プレイヤーのスプライト読み込み完了を待機
        await this.player.waitForSpriteLoad();

        // 敵のスプライトを事前読み込み
        await this.preloadEnemySprites();
    }

    private async preloadEnemySprites(): Promise<void> {
        // 各種敵のスプライトを事前に読み込み
        const walkerEnemy = new WalkingEnemy(0, 0);
        const flyerEnemy = new FlyingEnemy(0, 0);
        const diggerEnemy = new DiggingEnemy(0, 0, 0);

        await Promise.all([
            walkerEnemy.waitForSpriteLoad(),
            flyerEnemy.waitForSpriteLoad(),
            diggerEnemy.waitForSpriteLoad()
        ]);
    }

    private spawnEnemies(): void {
        this.enemies = [];

        for (let x = 300; x < this.STAGE_WIDTH; x += 200 + Math.random() * 300) {
            const enemyType = Math.floor(Math.random() * 3);

            switch (enemyType) {
                case 0:
                    this.enemies.push(new WalkingEnemy(x, this.GROUND_Y - 24));
                    break;
                case 1:
                    this.enemies.push(new FlyingEnemy(x, this.GROUND_Y - 150));
                    break;
                case 2:
                    this.enemies.push(new DiggingEnemy(x, this.GROUND_Y - 24, this.GROUND_Y));
                    break;
            }
        }
    }

    private spawnObstacles(): void {
        this.obstacles = [];
        this.platforms = [];

        for (let x = 500; x < this.STAGE_WIDTH - 200; x += 150 + Math.random() * 400) {
            const obstacleType = Math.random() < 0.6 ? 0 : 1;

            switch (obstacleType) {
                case 0:
                    this.obstacles.push(new Hole(x, this.GROUND_Y));
                    break;
                case 1:
                    this.obstacles.push(new Spike(x, this.GROUND_Y));
                    break;
            }
        }

        this.obstacles.sort((a, b) => a.position.x - b.position.x);

        let lastX = 0;
        const holes = this.obstacles.filter(obs => obs.type === 'hole') as Hole[];

        for (const hole of holes) {
            this.platforms.push({ x: lastX, y: this.GROUND_Y, width: hole.position.x - lastX, height: 10 });
            lastX = hole.position.x + hole.size.x;
        }

        this.platforms.push({ x: lastX, y: this.GROUND_Y, width: this.STAGE_WIDTH - lastX, height: 10 });
    }

    private setupUI(): void {
        this.updateUI();
    }

    private updateUI(): void {
        const hpElement = document.getElementById('hp');
        const scoreElement = document.getElementById('score');

        if (hpElement) hpElement.textContent = this.player.hp.toString();
        if (scoreElement) scoreElement.textContent = this.score.toString();
    }

    start(): void {
        this.gameLoop(0);
    }

    private gameLoop(currentTime: number): void {
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        this.update(deltaTime);
        this.render();

        requestAnimationFrame((time) => this.gameLoop(time));
    }

    private update(deltaTime: number): void {
        if (!this.isReady || this.gameState !== GameState.PLAYING) return;

        this.inputManager.update();
        const input = this.inputManager.getInput();

        this.player.update(deltaTime, input);
        this.handlePlatformCollisions();

        this.updateEnemies(deltaTime);
        this.updateObstacles();
        this.checkCollisions();
        this.camera.update();

        this.checkGameOver();
        this.checkStageComplete();
        this.updateUI();
    }

    private handlePlatformCollisions(): void {
        this.player.isGrounded = false;
        const playerBounds = this.player.getBounds();

        for (const platform of this.platforms) {
            const playerBottom = playerBounds.y + playerBounds.height;
            const playerCenter = playerBounds.x + playerBounds.width / 2;

            if (playerCenter > platform.x && playerCenter < platform.x + platform.width &&
                playerBottom >= platform.y && playerBottom <= platform.y + platform.height + Math.abs(this.player.velocity.y * 0.016)) {

                if (this.player.velocity.y >= 0) {
                    this.player.isGrounded = true;
                    this.player.position.y = platform.y - playerBounds.height;
                    this.player.velocity.y = 0;
                    break;
                }
            }
        }
    }

    private updateEnemies(deltaTime: number): void {
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];

            if (!enemy.isAlive || enemy.isOffScreen(this.camera.getX(), this.CANVAS_WIDTH)) {
                if (!enemy.isAlive) {
                    this.score += 100;
                }
                this.enemies.splice(i, 1);
                continue;
            }

            enemy.update(deltaTime, this.player.position, this.GROUND_Y);
        }
    }

    private updateObstacles(): void {
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obstacle = this.obstacles[i];

            if (obstacle.isOffScreen(this.camera.getX(), this.CANVAS_WIDTH)) {
                this.obstacles.splice(i, 1);
            }
        }
    }

    private checkCollisions(): void {
        const playerBounds = this.player.getBounds();
        const attackBounds = this.player.getAttackBounds();

        for (const enemy of this.enemies) {
            if (!enemy.isAlive) continue;

            const enemyBounds = enemy.getBounds();

            if (attackBounds && CollisionManager.checkCollision(attackBounds, enemyBounds)) {
                enemy.takeDamage();
                continue;
            }

            if (!this.player.isInvulnerable() && CollisionManager.checkCollision(playerBounds, enemyBounds)) {
                this.player.takeDamage(1);
            }
        }

        for (const obstacle of this.obstacles) {
            if (obstacle.type === 'spike') {
                const obstacleBounds = obstacle.getBounds();
                if (!this.player.isInvulnerable() && CollisionManager.checkCollision(playerBounds, obstacleBounds)) {
                    this.player.takeDamage(1);
                }
            }
        }
    }

    private checkGameOver(): void {
        if (this.player.isDead() || this.player.position.y > this.CANVAS_HEIGHT) {
            this.gameState = GameState.GAME_OVER;
        }
    }

    private checkStageComplete(): void {
        if (this.player.position.x >= this.STAGE_WIDTH - 100) {
            this.score += this.player.hp * 200;
            this.gameState = GameState.RESULT;
        }
    }

    private render(): void {
        this.ctx.clearRect(0, 0, this.CANVAS_WIDTH, this.CANVAS_HEIGHT);

        if (!this.isReady) {
            this.drawLoadingScreen();
            return;
        }

        this.drawBackground();
        this.drawStage();
        this.drawObstacles();
        this.drawEnemies();
        this.player.draw(this.ctx, this.camera.getX());
        this.drawUI();

        if (this.gameState === GameState.GAME_OVER) {
            this.drawGameOver();
        } else if (this.gameState === GameState.RESULT) {
            this.drawResult();
        }
    }

    private drawBackground(): void {
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.CANVAS_HEIGHT);
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(1, '#16213e');

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.CANVAS_WIDTH, this.CANVAS_HEIGHT);
    }

    private drawStage(): void {
        this.ctx.fillStyle = '#8B4513';
        this.platforms.forEach(platform => {
            const screenX = platform.x - this.camera.getX();
            this.ctx.fillRect(screenX, platform.y, platform.width, this.CANVAS_HEIGHT - platform.y);
        });

        this.ctx.fillStyle = '#228B22';
        this.platforms.forEach(platform => {
            const screenX = platform.x - this.camera.getX();
            this.ctx.fillRect(screenX, platform.y - 5, platform.width, 5);
        });
    }

    private drawObstacles(): void {
        for (const obstacle of this.obstacles) {
            obstacle.draw(this.ctx, this.camera.getX());
        }
    }

    private drawEnemies(): void {
        for (const enemy of this.enemies) {
            if (enemy.isAlive) {
                enemy.draw(this.ctx, this.camera.getX());
            }
        }
    }

    private drawUI(): void {
        this.ctx.fillStyle = 'white';
        this.ctx.font = '16px Arial';
        this.ctx.fillText(`HP: ${this.player.hp}`, 10, 25);
        this.ctx.fillText(`Score: ${this.score}`, 10, 45);
        this.ctx.fillText(`Distance: ${Math.floor(this.player.position.x)}/${this.STAGE_WIDTH}`, 10, 65);
    }

    private drawGameOver(): void {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.CANVAS_WIDTH, this.CANVAS_HEIGHT);

        this.ctx.fillStyle = 'white';
        this.ctx.font = '48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('GAME OVER', this.CANVAS_WIDTH / 2, this.CANVAS_HEIGHT / 2);

        this.ctx.font = '24px Arial';
        this.ctx.fillText('Press R to restart', this.CANVAS_WIDTH / 2, this.CANVAS_HEIGHT / 2 + 50);
        this.ctx.textAlign = 'start';

        if (this.inputManager.isKeyPressed('KeyR')) {
            this.restart();
        }
    }

    private drawResult(): void {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.CANVAS_WIDTH, this.CANVAS_HEIGHT);

        this.ctx.fillStyle = 'white';
        this.ctx.font = '48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('STAGE CLEAR!', this.CANVAS_WIDTH / 2, this.CANVAS_HEIGHT / 2 - 50);

        this.ctx.font = '24px Arial';
        this.ctx.fillText(`Final Score: ${this.score}`, this.CANVAS_WIDTH / 2, this.CANVAS_HEIGHT / 2);
        this.ctx.fillText('Press R to restart', this.CANVAS_WIDTH / 2, this.CANVAS_HEIGHT / 2 + 50);
        this.ctx.textAlign = 'start';

        if (this.inputManager.isKeyPressed('KeyR')) {
            this.restart();
        }
    }

    private drawLoadingScreen(): void {
        this.drawBackground();

        this.ctx.fillStyle = 'white';
        this.ctx.font = '36px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('魔界ランナー', this.CANVAS_WIDTH / 2, this.CANVAS_HEIGHT / 2 - 50);

        this.ctx.font = '24px Arial';
        this.ctx.fillText('スプライト読み込み中...', this.CANVAS_WIDTH / 2, this.CANVAS_HEIGHT / 2 + 20);

        // 簡単なローディングアニメーション
        const dots = '.'.repeat((Math.floor(Date.now() / 500) % 3) + 1);
        this.ctx.fillText(dots, this.CANVAS_WIDTH / 2, this.CANVAS_HEIGHT / 2 + 60);

        this.ctx.textAlign = 'start';
    }

    private restart(): void {
        this.isReady = false;
        this.player = new Player(50, this.GROUND_Y - 48, this.config.hp);
        this.camera = new Camera(this.player, this.CANVAS_WIDTH, this.STAGE_WIDTH);
        this.score = 0;
        this.gameState = GameState.PLAYING;

        this.initializeGame();
    }
}