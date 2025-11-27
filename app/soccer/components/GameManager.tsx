'use client';

import React from 'react';

export default function GameManager({ onReset }: { onReset: () => void }) {
    return (
        <div style={{ position: 'absolute', top: 20, right: 20, color: 'white', pointerEvents: 'none' }}>
            <h2>Score: 0</h2>
            <button onClick={onReset} style={{ pointerEvents: 'auto', padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}>
                Reset Ball
            </button>
        </div>
    );
}
