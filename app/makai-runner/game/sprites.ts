// スプライトシートの1フレームの情報
export interface SpriteFrame {
    x: number;      // スプライトシート内のX座標
    y: number;      // スプライトシート内のY座標
    width: number;  // フレームの幅
    height: number; // フレームの高さ
}

// アニメーションフレームの情報
export interface AnimationFrame {
    frame: SpriteFrame;   // フレーム情報
    duration: number;     // フレーム表示時間（ミリ秒）
}

// アニメーションの設定
export interface Animation {
    name: string;                // アニメーション名
    frames: AnimationFrame[];    // フレームのリスト
    loop: boolean;               // ループするかどうか
    defaultFrameDuration?: number; // デフォルトフレーム時間
}

// スプライトシートの設定
export interface SpriteSheet {
    imagePath: string;  // 画像ファイルのパス
    frameWidth: number; // 基本フレーム幅
    frameHeight: number;// 基本フレーム高さ
    frames: { [key: string]: SpriteFrame }; // 状態ごとのフレーム情報
    animations?: { [key: string]: Animation }; // アニメーション定義
}

// プレイヤーの状態
export enum PlayerState {
    IDLE = 'idle',          // 待機
    RUNNING = 'running',    // 走行
    JUMPING = 'jumping',    // ジャンプ
    ATTACKING = 'attacking',// 攻撃
    DODGING = 'dodging',    // 回避
    HURT = 'hurt'           // ダメージ
}

// 敵のアニメーション状態
export enum EnemyAnimationState {
    IDLE = 'idle',              // 待機
    MOVING = 'moving',          // 移動
    ATTACKING = 'attacking',    // 攻撃
    UNDERGROUND = 'underground',// 地中（掘る敵専用）
    EMERGING = 'emerging',      // 出現（掘る敵専用）
    DYING = 'dying'             // 死亡
}

// プレイヤーのスプライトシート設定
export const playerSpriteSheet: SpriteSheet = {
    imagePath: '/makai-runner/assets/sprites/player.png',
    frameWidth: 32,
    frameHeight: 48,
    frames: {
        [PlayerState.IDLE]: { x: 0, y: 0, width: 32, height: 48 },      // 待機状態
        [PlayerState.RUNNING]: { x: 32, y: 0, width: 32, height: 48 },  // 走行状態
        [PlayerState.JUMPING]: { x: 64, y: 0, width: 32, height: 48 },  // ジャンプ状態
        [PlayerState.ATTACKING]: { x: 96, y: 0, width: 32, height: 48 },// 攻撃状態
        [PlayerState.DODGING]: { x: 128, y: 0, width: 32, height: 48 }, // 回避状態
        [PlayerState.HURT]: { x: 160, y: 0, width: 32, height: 48 }     // ダメージ状態
    },
    animations: {
        // 走行アニメーション（2フレーム）
        'running': {
            name: 'running',
            loop: true,
            defaultFrameDuration: 200,
            frames: [
                { frame: { x: 0, y: 48, width: 32, height: 48 }, duration: 200 },
                { frame: { x: 32, y: 48, width: 32, height: 48 }, duration: 200 }
            ]
        },
        // 攻撃アニメーション（3フレーム）
        'attacking': {
            name: 'attacking',
            loop: false,
            defaultFrameDuration: 100,
            frames: [
                { frame: { x: 0, y: 96, width: 32, height: 48 }, duration: 100 },
                { frame: { x: 32, y: 96, width: 32, height: 48 }, duration: 150 },
            ]
        }
    }
};

// 敵のスプライトシート設定
// 歩行型敵
export const walkerEnemySpriteSheet: SpriteSheet = {
    imagePath: '/makai-runner/assets/sprites/walker_enemy.png',
    frameWidth: 24,
    frameHeight: 24,
    frames: {
        [EnemyAnimationState.IDLE]: { x: 0, y: 0, width: 24, height: 24 },     // 待機
        [EnemyAnimationState.MOVING]: { x: 24, y: 0, width: 24, height: 24 },  // 移動
        [EnemyAnimationState.ATTACKING]: { x: 48, y: 0, width: 24, height: 24 },// 攻撃
        [EnemyAnimationState.DYING]: { x: 72, y: 0, width: 24, height: 24 }    // 死亡
    }
};

// 飛行型敵
export const flyerEnemySpriteSheet: SpriteSheet = {
    imagePath: '/makai-runner/assets/sprites/flyer_enemy.png',
    frameWidth: 24,
    frameHeight: 24,
    frames: {
        [EnemyAnimationState.IDLE]: { x: 0, y: 0, width: 24, height: 24 },     // 待機
        [EnemyAnimationState.MOVING]: { x: 24, y: 0, width: 24, height: 24 },  // 移動
        [EnemyAnimationState.ATTACKING]: { x: 48, y: 0, width: 24, height: 24 },// 攻撃
        [EnemyAnimationState.DYING]: { x: 72, y: 0, width: 24, height: 24 }    // 死亡
    }
};

// 穴掘り型敵
export const diggerEnemySpriteSheet: SpriteSheet = {
    imagePath: '/makai-runner/assets/sprites/digger_enemy.png',
    frameWidth: 24,
    frameHeight: 24,
    frames: {
        [EnemyAnimationState.IDLE]: { x: 0, y: 0, width: 24, height: 24 },        // 待機
        [EnemyAnimationState.MOVING]: { x: 24, y: 0, width: 24, height: 24 },     // 移動
        [EnemyAnimationState.UNDERGROUND]: { x: 48, y: 0, width: 24, height: 24 },// 地中
        [EnemyAnimationState.EMERGING]: { x: 72, y: 0, width: 24, height: 24 },   // 出現
        [EnemyAnimationState.ATTACKING]: { x: 96, y: 0, width: 24, height: 24 },  // 攻撃
        [EnemyAnimationState.DYING]: { x: 120, y: 0, width: 24, height: 24 }      // 死亡
    }
};

// スプライト描画クラス
export class SpriteRenderer {
    // 読み込み済み画像のキャッシュ
    private static loadedImages: Map<string, HTMLImageElement> = new Map();

    // 画像を非同期で読み込み
    static async loadImage(imagePath: string): Promise<HTMLImageElement> {
        // キャッシュに存在すれば返却
        if (this.loadedImages.has(imagePath)) {
            return this.loadedImages.get(imagePath)!;
        }

        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                // 読み込み成功時はキャッシュに保存
                this.loadedImages.set(imagePath, img);
                resolve(img);
            };
            img.onerror = reject; // エラー時
            img.src = imagePath;
        });
    }

    // スプライトを描画
    static drawSprite(
        ctx: CanvasRenderingContext2D, // Canvas描画コンテキスト
        spriteSheet: SpriteSheet,      // スプライトシート設定
        state: string,                 // 表示する状態
        x: number,                     // 描画X座標
        y: number,                     // 描画Y座標
        flipX: boolean = false         // X軸反転フラグ
    ): void {
        const image = this.loadedImages.get(spriteSheet.imagePath);
        if (!image) return; // 画像が読み込まれていなければ何もしない

        const frame = spriteSheet.frames[state];
        if (!frame) return; // 指定状態のフレームが存在しなければ何もしない

        ctx.save();

        // X軸反転処理
        if (flipX) {
            ctx.scale(-1, 1);
            ctx.translate(-x - frame.width, 0);
        }

        // スプライトを描画
        ctx.drawImage(
            image,
            frame.x,      // 切り出し開始X座標
            frame.y,      // 切り出し開始Y座標
            frame.width,  // 切り出し幅
            frame.height, // 切り出し高さ
            flipX ? 0 : x,// 描画X座標
            y,            // 描画Y座標
            frame.width,  // 描画幅
            frame.height  // 描画高さ
        );

        ctx.restore();
    }
}