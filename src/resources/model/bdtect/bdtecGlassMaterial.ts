import * as THREE from 'three';

/** BDTEC 시스템 유리관(Cube002/003) 공통 재질 */
export const BDTEC_GLASS_CASE = {
    color: '#9ed4f5',
    transmission: 0.72,
    transparent: true,
    opacity: 0.55,
    roughness: 0.03,
    metalness: 0.08,
    ior: 1.48,
    thickness: 3.5,
    clearcoat: 1,
    clearcoatRoughness: 0.04,
    envMapIntensity: 0.45,
    attenuationColor: '#4ab8e8',
    attenuationDistance: 2.5,
    specularIntensity: 1.4,
    specularColor: '#e0f4ff',
    side: THREE.DoubleSide,
    depthWrite: false,
} as const;

export const BDTEC_GLASS_EDGE_COLOR = '#6ec8f0';
