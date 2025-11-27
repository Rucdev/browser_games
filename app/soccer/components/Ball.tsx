'use client';

import React, { useState } from 'react';
import { useSphere } from '@react-three/cannon';
import { ThreeEvent } from '@react-three/fiber';

export default function Ball({ position }: { position: [number, number, number] }) {
    const [ref, api] = useSphere(() => ({
        mass: 1,
        position,
        args: [0.2],
        linearDamping: 0.5,
        angularDamping: 0.5
    }));

    const shoot = (e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        // Simple shooting logic: apply impulse towards the goal (negative Z)
        // Add some randomness and upward force
        api.applyImpulse(
            [(Math.random() - 0.5) * 5, 5 + Math.random() * 5, -15],
            [0, 0, 0]
        );
    };

    return (
        <mesh ref={ref as any} castShadow receiveShadow onClick={shoot} onPointerOver={() => document.body.style.cursor = 'pointer'} onPointerOut={() => document.body.style.cursor = 'auto'}>
            <sphereGeometry args={[0.2, 32, 32]} />
            <meshStandardMaterial color="white" />
            <meshStandardMaterial color="black" wireframe />
        </mesh>
    );
}
