'use client';

import React, { useEffect, useRef } from 'react';
import { useBox } from '@react-three/cannon';
import { useFrame } from '@react-three/fiber';

export default function Goalkeeper({ position }: { position: [number, number, number] }) {
    const [ref, api] = useBox(() => ({
        mass: 10,
        position,
        args: [1, 2, 1],
        fixedRotation: true,
        linearDamping: 0.9
    }));

    useFrame(({ clock }) => {
        // Simple movement: move left and right using sine wave
        const t = clock.getElapsedTime();
        const x = Math.sin(t * 2) * 2; // Move between -2 and 2
        api.position.set(x, position[1], position[2]);
        api.velocity.set(0, 0, 0); // Reset velocity to prevent drifting
    });

    return (
        <mesh ref={ref as any} castShadow receiveShadow>
            <boxGeometry args={[1, 2, 1]} />
            <meshStandardMaterial color="red" />
        </mesh>
    );
}
