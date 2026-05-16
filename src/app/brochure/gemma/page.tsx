'use client'

import Overlay1 from "@/components/bdtec/overlay/OverLay1";
import ScrollIndicator from "@/utils/ui/ScrollIndicator";
import React from "react";
import dynamic from 'next/dynamic';

const Spline = dynamic(() => import('@splinetool/react-spline'), {
    ssr: false,
    loading: () => <div style={{ height: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>3D 로딩 중...</div>
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
