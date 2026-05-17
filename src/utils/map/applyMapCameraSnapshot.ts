import type CameraControlsImpl from 'camera-controls';
import * as THREE from 'three';
import type { MapCameraSnapshot } from './mapCameraPoints';

export function applyMapCameraSnapshot(
    controls: CameraControlsImpl,
    { c, t, z }: MapCameraSnapshot,
    smooth = false,
) {
    void Promise.all([
        controls.setLookAt(c[0], c[1], c[2], t[0], t[1], t[2], smooth),
        controls.zoomTo(z, smooth),
    ]);

    const cam = controls.camera;
    if (cam instanceof THREE.OrthographicCamera) {
        cam.zoom = z;
        cam.updateProjectionMatrix();
    }
    controls.update(0);
}
