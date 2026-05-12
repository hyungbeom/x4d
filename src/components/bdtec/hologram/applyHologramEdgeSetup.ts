import * as THREE from "three";

type MeshChild = THREE.Mesh & { isMesh: true };

function isMesh(child: THREE.Object3D): child is MeshChild {
    return (child as MeshChild).isMesh === true;
}

/**
 * 홀로그램용 엣지 라인·재질 클론을 한 번 적용합니다. (원본 GLB 재질 공유는 건드리지 않음)
 */
export function applyHologramEdgeSetup(root: THREE.Object3D): {
    edgeMaterials: THREE.LineBasicMaterial[];
    originalMaterials: THREE.Material[];
} {
    const edgeMaterials: THREE.LineBasicMaterial[] = [];
    const originalMaterials: THREE.Material[] = [];

    root.traverse((child) => {
        if (!isMesh(child)) return;
        if (child.material === undefined) return;

        let thresholdAngle = 15;
        const mat = child.material as THREE.Material | THREE.Material[] | undefined;
        if (child.name === "Case" || (mat && !Array.isArray(mat) && mat.name === "Cab")) {
            thresholdAngle = 8;
        }

        const edgesGeom = new THREE.EdgesGeometry(child.geometry, thresholdAngle);
        const edgesMat = new THREE.LineBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0 });
        const line = new THREE.LineSegments(edgesGeom, edgesMat);
        child.add(line);
        edgeMaterials.push(edgesMat);

        const materials = Array.isArray(child.material) ? child.material : [child.material];
        const wasArray = Array.isArray(child.material);

        const clonedMaterials = materials.map((m: THREE.Material) => {
            const newMat = m.clone();
            if (newMat.userData.originalTransparent === undefined) {
                newMat.userData.originalTransparent = newMat.transparent || false;
            }
            newMat.transparent = true;
            newMat.needsUpdate = true;
            if (!originalMaterials.includes(newMat)) {
                originalMaterials.push(newMat);
            }
            return newMat;
        });

        child.material = wasArray ? clonedMaterials : clonedMaterials[0];
    });

    return { edgeMaterials, originalMaterials };
}
