'use client';

import { useGLTF } from '@react-three/drei';
import { BDTEC_GLB_URLS } from '@/utils/three/bdtecAssetUrls';

function BdtecGltfPreload({ url }: { url: (typeof BDTEC_GLB_URLS)[number] }) {
    useGLTF(url);
    return null;
}

/**
 * Suspense 경계 최상단: 모든 BDTEC GLB를 한 번에 suspend.
 * 하위 모델 컴포넌트는 drei 캐시로 즉시 반환됩니다.
 */
export function BdtecAssetRegistry() {
    return (
        <>
            {BDTEC_GLB_URLS.map((url) => (
                <BdtecGltfPreload key={url} url={url} />
            ))}
        </>
    );
}

for (const url of BDTEC_GLB_URLS) {
    useGLTF.preload(url);
}
