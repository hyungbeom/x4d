
import Overlay1 from "@/components/bdtec/overlay/OverLay1";
import ScrollIndicator from "@/utils/ScrollIndicator";
import React from "react";
import dynamic from 'next/dynamic';
const Spline = dynamic(() => import('@splinetool/react-spline'), {
    ssr: false,
    // 로딩 중일 때 보여줄 UI도 여기서 바로 설정할 수 있어요! (기존 Suspense 역할 대체)
    loading: () => <div style={{ height: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>3D 로딩 중...</div>
});


export default function Home() {
    return (
        <>
            <Overlay1/>
            <ScrollIndicator color={'white'}/>

            <main>
                <Spline
                    scene="https://prod.spline.design/Lq50G9LvPmfDWegT/scene.splinecode"
                />
            </main>

        </>
    );
}
