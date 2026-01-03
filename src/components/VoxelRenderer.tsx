// src/components/VoxelRenderer.tsx
'use client';

import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage } from '@react-three/drei';
import * as THREE from 'three';

interface PrimitiveData {
    type: 'box' | 'sphere' | 'cylinder' | 'cone' | 'torus' | 'capsule';
    position: [number, number, number];
    rotation: [number, number, number];
    scale: [number, number, number];
    color: string;
    radius?: number;
    tube?: number;
}

interface Props {
    data: PrimitiveData[];
}

function Geometry({ item }: { item: PrimitiveData }) {
    const { type, position, rotation, scale, color, radius, tube } = item;

    // Convert standard arrays to THREE vectors/eulers if needed, 
    // but R3F accepts arrays [x,y,z] naturally for pos/rot/scale props.

    return (
        <mesh position={position} rotation={rotation} scale={scale}>
            {type === 'box' && <boxGeometry />}
            {type === 'sphere' && <sphereGeometry />}
            {type === 'cylinder' && <cylinderGeometry />}
            {type === 'cone' && <coneGeometry args={[0.5, 1, 16]} />}
            {type === 'capsule' && <capsuleGeometry args={[0.5, 1, 8, 16]} />}
            {type === 'torus' && <torusGeometry args={[radius || 0.5, tube || 0.1, 16, 32]} />}
            <meshStandardMaterial color={color} roughness={0.3} metalness={0.1} />
        </mesh>
    );
}

export default function VoxelRenderer({ data }: Props) {
    if (!data || data.length === 0) {
        return <div className="w-full h-full flex items-center justify-center text-white/50">No Voxel Data</div>;
    }
    return (
        <div className="w-full h-full min-h-[400px]">
            <Canvas shadows dpr={[1, 2]} camera={{ position: [5, 5, 5], fov: 50 }}>
                <OrbitControls autoRotate autoRotateSpeed={4} />
                <Stage intensity={0.5} environment="city" adjustCamera>
                    <group>
                        {data.map((item, idx) => (
                            <Geometry key={idx} item={item} />
                        ))}
                    </group>
                </Stage>
            </Canvas>
        </div>
    );
}
