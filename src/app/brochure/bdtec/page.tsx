"use client";

import { useEffect } from "react";
import DynamicIsland from "@/utils/DynamicIsland";
import BdtecBrochureLoader from "@/components/bdtec/BdtecBrochureLoader";
import BdtecHeroSection from "@/components/bdtec/BdtecHeroSection";
import NextSection from "@/components/bdtec/NextSection";
import { BdtecHeroScrollContainerProvider } from "@/components/bdtec/BdtecHeroScrollContainer";

import "@/lib/brochureGsap";

export default function BdtecBrochurePage() {
    useEffect(() => {
        if ("scrollRestoration" in history) {
            history.scrollRestoration = "manual";
        }
        window.scrollTo(0, 0);
    }, []);

    return (
        <>
            <BdtecBrochureLoader />
            <main style={{ backgroundColor: "white" }}>
                <BdtecHeroScrollContainerProvider>
                    <DynamicIsland />
                    <BdtecHeroSection />
                </BdtecHeroScrollContainerProvider>
                <NextSection />
            </main>
        </>
    );
}
