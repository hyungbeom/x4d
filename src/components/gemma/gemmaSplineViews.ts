import type { Application } from '@splinetool/runtime';
import * as THREE from 'three';

/** bdtec Mobile.tsx 와 동일한 카메라 스냅샷 형식 */
export type CameraSnapshot = {
    c: [number, number, number];
    t: [number, number, number];
    z: number;
};

export type DeviceType = 'desktop' | 'tablet' | 'mobile';

/** 제품 자세히 보기 카메라 (scroll 0.0% 스냅샷) */
const GEMMA_DETAIL_SNAPSHOT: CameraSnapshot = {
    c: [652.6, 1181.3, -322.9],
    t: [407.1, 887.0, -644.0],
    z: 1.0,
};

export const GEMMA_PRODUCT_DETAIL_CAMERA: Record<DeviceType, CameraSnapshot> = {
    desktop: GEMMA_DETAIL_SNAPSHOT,
    tablet: GEMMA_DETAIL_SNAPSHOT,
    mobile: GEMMA_DETAIL_SNAPSHOT,
};

type SplineControls = {
    setLookAt: (
        ax: number,
        ay: number,
        az: number,
        tx: number,
        ty: number,
        tz: number,
        transition: boolean,
    ) => Promise<unknown>;
    zoomTo: (zoom: number, transition: boolean) => Promise<unknown>;
    update: (delta: number) => void;
    camera?: THREE.Camera;
};

function transitionSplineCameraSnapshot(controls: SplineControls, { c, t, z }: CameraSnapshot) {
    void Promise.all([
        controls.setLookAt(c[0], c[1], c[2], t[0], t[1], t[2], true),
        controls.zoomTo(z, true),
    ]);
    const cam = controls.camera;
    if (cam instanceof THREE.OrthographicCamera) {
        cam.zoom = z;
        cam.updateProjectionMatrix();
    }
    controls.update(0);
}

/** bdtec transitionCameraSnapshot 과 동일 패턴 */
export function animateGemmaProductDetailView(
    app: Application,
    deviceType: DeviceType = 'desktop',
): void {
    const snapshot = GEMMA_PRODUCT_DETAIL_CAMERA[deviceType];
    const controls = app.controls as SplineControls | undefined;

    if (controls?.setLookAt && controls?.zoomTo) {
        transitionSplineCameraSnapshot(controls, snapshot);
        return;
    }

    try {
        app.setZoom(snapshot.z);
    } catch {
        // ignore
    }

    const cameraObj = app.findObjectByName('Camera') as
        | { position: { x: number; y: number; z: number } }
        | undefined;
    if (cameraObj) {
        cameraObj.position.x = snapshot.c[0];
        cameraObj.position.y = snapshot.c[1];
        cameraObj.position.z = snapshot.c[2];
    }
}
