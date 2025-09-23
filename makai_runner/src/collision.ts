import { Rectangle } from './types.js';

export class CollisionManager {
    static checkCollision(rect1: Rectangle, rect2: Rectangle): boolean {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }

    static getOverlap(rect1: Rectangle, rect2: Rectangle): Rectangle | null {
        if (!this.checkCollision(rect1, rect2)) {
            return null;
        }

        const left = Math.max(rect1.x, rect2.x);
        const right = Math.min(rect1.x + rect1.width, rect2.x + rect2.width);
        const top = Math.max(rect1.y, rect2.y);
        const bottom = Math.min(rect1.y + rect1.height, rect2.y + rect2.height);

        return {
            x: left,
            y: top,
            width: right - left,
            height: bottom - top
        };
    }
}