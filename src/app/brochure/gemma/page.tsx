import Spline from '@splinetool/react-spline/next';
import Overlay1 from "@/components/bdtec/overlay/OverLay1";
import ScrollIndicator from "@/utils/ScrollIndicator";
import React from "react";

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
