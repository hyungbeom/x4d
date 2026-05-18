import * as THREE from 'three';

const TEXTURE_KEYS = [
    'map',
    'normalMap',
    'roughnessMap',
    'metalnessMap',
    'aoMap',
    'emissiveMap',
    'alphaMap',
    'lightMap',
    'bumpMap',
    'displacementMap',
] as const;

export function toWebGpuSafeMaterial(mat: THREE.Material): THREE.Material {
    if (mat instanceof THREE.MeshPhysicalMaterial) {
        const transparent =
            mat.transparent || mat.transmission > 0.01 || mat.opacity < 1;
        return new THREE.MeshStandardMaterial({
            color: mat.color.clone(),
            map: mat.map,
            normalMap: mat.normalMap,
            roughnessMap: mat.roughnessMap,
            metalnessMap: mat.metalnessMap,
            aoMap: mat.aoMap,
            roughness: mat.roughness,
            metalness: mat.metalness,
            transparent,
            opacity: transparent
                ? Math.min(0.75, Math.max(0.2, mat.opacity))
                : mat.opacity,
            side: mat.side,
            depthWrite: transparent ? false : mat.depthWrite,
        });
    }

    if (mat instanceof THREE.MeshStandardMaterial && mat.alphaMap) {
        const clone = mat.clone();
        clone.alphaMap = null;
        return clone;
    }

    return mat;
}

export function patchObjectMaterialsForWebGPU(root: THREE.Object3D) {
    root.traverse((obj) => {
        if (!(obj instanceof THREE.Mesh)) return;

        if (Array.isArray(obj.material)) {
            obj.material = obj.material.map(toWebGpuSafeMaterial);
        } else {
            obj.material = toWebGpuSafeMaterial(obj.material);
        }
    });
}

function texturesFromMaterial(mat: THREE.Material, out: Set<THREE.Texture>) {
    for (const key of TEXTURE_KEYS) {
        const tex = mat[key as keyof THREE.Material];
        if (tex instanceof THREE.Texture) out.add(tex);
    }
}

export function collectSceneTextures(root: THREE.Object3D): THREE.Texture[] {
    const set = new Set<THREE.Texture>();
    root.traverse((obj) => {
        if (!(obj instanceof THREE.Mesh)) return;
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        for (const mat of mats) {
            if (mat) texturesFromMaterial(mat, set);
        }
    });
    return [...set];
}

export function areSceneTexturesReady(textures: THREE.Texture[]): boolean {
    return textures.every((tex) => {
        const image = tex.image as
            | HTMLImageElement
            | HTMLCanvasElement
            | ImageBitmap
            | undefined;
        if (!image) return true;
        if (image instanceof HTMLImageElement) {
            return image.complete && image.naturalWidth > 0;
        }
        return true;
    });
}

export function markSceneTexturesForUpload(textures: THREE.Texture[]) {
    for (const tex of textures) {
        tex.needsUpdate = true;
    }
}
