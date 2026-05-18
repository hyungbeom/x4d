import * as THREE from 'three';

/** BDTEC 유리관 — WebGPU 호환 (transmission 미사용) */
export const BDTEC_GLASS_CASE = {
    color: '#9ed4f5',
    transparent: true,
    opacity: 0.42,
    roughness: 0.06,
    metalness: 0.12,
    side: THREE.DoubleSide,
    depthWrite: false,
} as const;

export const BDTEC_GLASS_EDGE_COLOR = '#6ec8f0';
