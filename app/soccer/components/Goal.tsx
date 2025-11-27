'use client';

import React from 'react';
import { useBox } from '@react-three/cannon';

function GoalPost({ position, args }: { position: [number, number, number], args: [number, number, number] }) {
    const [ref] = useBox(() => ({ type: 'Static', position, args }));
    return (
        <mesh ref={ref as any} castShadow receiveShadow>
            <boxGeometry args={args} />
            <meshStandardMaterial color="white" />
        </mesh>
    );
}

export default function Goal({ position }: { position: [number, number, number] }) {
    const width = 7.32;
    const height = 2.44;
    const depth = 2;
    const thickness = 0.1;

    return (
        <group position={position}>
            {/* Top Bar */}
            <GoalPost position={[0, height, 0]} args={[width + thickness * 2, thickness, thickness]} />
            {/* Left Post */}
            <GoalPost position={[-width / 2, height / 2, 0]} args={[thickness, height, thickness]} />
            {/* Right Post */}
            <GoalPost position={[width / 2, height / 2, 0]} args={[thickness, height, thickness]} />

            {/* Net (Visual only for now, or simple planes) */}
            <mesh position={[0, height / 2, -depth / 2]}>
                <boxGeometry args={[width, height, depth]} />
                <meshStandardMaterial color="white" wireframe opacity={0.2} transparent />
            </mesh>
        </group>
    );
}
