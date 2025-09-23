import { InputState } from './types.js';

export class InputManager {
    private keys: Set<string> = new Set();
    private pressedThisFrame: Set<string> = new Set();
    private currentInput: InputState = {
        jump: false,
        attack: false,
        dodge: false
    };

    constructor() {
        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        document.addEventListener('keydown', (e) => {
            console.log(`Key down: ${e.code}`);
            if (!this.keys.has(e.code)) {
                this.pressedThisFrame.add(e.code);
            }
            this.keys.add(e.code);
        });

        document.addEventListener('keyup', (e) => {
            this.keys.delete(e.code);
        });
    }

    update(): void {
        this.currentInput.jump = this.pressedThisFrame.has('Space');
        this.currentInput.attack = this.pressedThisFrame.has('KeyJ');
        this.currentInput.dodge = this.pressedThisFrame.has('KeyK');

        this.pressedThisFrame.clear();
    }

    getInput(): InputState {
        return { ...this.currentInput };
    }

    isKeyPressed(key: string): boolean {
        return this.keys.has(key);
    }
}