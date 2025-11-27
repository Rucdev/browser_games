'use client';

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/cannon';
import { Sky, OrbitControls } from '@react-three/drei';
import Scene from './components/Scene';
import Field from './components/Field';
import Goal from './components/Goal';
import Ball from './components/Ball';
import Goalkeeper from './components/Goalkeeper';
import GameManager from './components/GameManager';

export default function SoccerPage() {
    const [ballId, setBallId] = React.useState(0);
    const reset = () => setBallId(prev => prev + 1);

    return (
        <div style={{ width: '100vw', height: '100vh' }}>
            <Canvas shadows camera={{ position: [0, 5, 10], fov: 50 }}>
                <Suspense fallback={null}>
                    <Physics gravity={[0, -9.81, 0]}>
                        <Scene />
                        <Field />
                        <Goal position={[0, 0, -10]} />
                        <Ball key={ballId} position={[0, 0.2, 5]} />
                        <Goalkeeper position={[0, 1, -9]} />
                    </Physics>

                    <OrbitControls />
                </Suspense>
            </Canvas>
            <GameManager onReset={reset} />
            <div style={{ position: 'absolute', top: 20, left: 20, color: 'white', pointerEvents: 'none' }}>
                <h1>PK Game</h1>
                <p>Drag the ball to shoot!</p>
            </div>
        </div>
    );
}
