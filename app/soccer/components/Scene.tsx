'use client';

import React from 'react';
import { Sky } from '@react-three/drei';

export default function Scene() {
    return (
        <>
            <Sky sunPosition={[100, 20, 100]} />
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} castShadow />
        </>
    );
}
