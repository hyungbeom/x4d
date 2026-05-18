'use client';

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import NavBar from "@/utils/ui/NavBar";
import InfoPanel from "@/utils/ui/InfoPanel";
import PageWrapper from "@/utils/ui/PageWrapper";
import styles from "./page.module.css";
import BdtecEntryOverlay from "@/components/bdtec/BdtecEntryOverlay";
import BdtecSceneHeroCopy from "@/components/bdtec/BdtecSceneHeroCopy";
import BdtecSpecModal from "@/components/bdtec/BdtecSpecModal";
import { SceneLoadingProvider } from "@/utils/three/SceneLoadingContext";
import dynamic from "next/dynamic";

const BdtecScene = dynamic(() => import('@/app/brochure/bdtec/mobile/Mobile'), {
    ssr: false,
});

const panelContents: Record<number, { title: string; desc: string; extra?: string }> = {
    1: { title: "BDI-100", desc: "24시간 지속적인 모니터링으로 집진상태 판단과 측정 시스템을 제공합니다.", extra: "온도/차압/전류 등 환경 데이터를 안전하게 전송합니다." },
    2: { title: "배출시설", desc: "산업 현장에서 발생하는 오염물질 배출 현황을 실시간으로 감시합니다.", extra: "배출량 초과 여부를 즉각적으로 알림 처리합니다." },
    3: { title: "방지시설", desc: "오염 방지 시설의 가동 여부를 24시간 실시간으로 모니터링합니다.", extra: "모터, 펌프 등의 동작 상태를 정밀하게 추적합니다." },
    4: { title: "통신교류", desc: "환경관리공단 서버(www.greenlink.or.kr)와 보안된 네트워크로 데이터를 주고받습니다.", extra: "데이터 위변조 방지 및 암호화 전송 지원." },
    5: { title: "IoT Gateway", desc: "현장의 모든 센서 데이터를 수집하여 클라우드로 전송하는 핵심 허브입니다.", extra: "LTE/5G망을 통한 무중단 통신 환경 구축." }
};

export default function Home() {
    const [intro, setIntro] = useState(false);
    const [activePanelId, setActivePanelId] = useState<number>(0);
    const [quality, setQuality] = useState("default");

    // 🚀 1. 기기 타입을 3가지로 세분화하여 관리합니다.
    const [deviceType, setDeviceType] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
    const [autoTour, setAutoTour] = useState(false);
    const AUTO_TOUR_INTERVAL_MS = 5000;

    const mainContainerRef = useRef(null);
    const blurContainerRef = useRef<HTMLDivElement>(null);
    const canvasHostRef = useRef<HTMLDivElement>(null);
    const brochureUiRef = useRef<HTMLDivElement>(null);

    const navMenus = [
        { title: 'BDI-100', onClick: () => handleVariableChange(1) },
        { title: '배출시설', onClick: () => handleVariableChange(2) },
        { title: '방지시설', onClick: () => handleVariableChange(3) },
        { title: '통신교류', onClick: () => handleVariableChange(4) },
        { title: 'Iot Gateway', onClick: () => handleVariableChange(5) }
    ];

    useEffect(() => {
        gsap.registerPlugin(ScrollTrigger);

        // 🚀 2. 창 크기에 따라 기기 판별 (기준은 필요에 따라 수정하세요)
        const handleResize = () => {
            const width = window.innerWidth;
            const next =
                width <= 768 ? 'mobile' : width <= 1024 ? 'tablet' : 'desktop';
            setDeviceType(next);
        };

        handleResize(); // 초기 1회 실행
        window.addEventListener('resize', handleResize);

        return () => {
            ScrollTrigger.getAll().forEach(trigger => trigger.kill());
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const handleVariableChange = (newValue: number) => {
        setActivePanelId(newValue);
    };

    const handleLogoClick = () => {
        setAutoTour(false);
        handleVariableChange(0);
    };

    const handleAutoTourToggle = () => {
        setAutoTour((prev) => {
            const next = !prev;
            if (next) {
                setActivePanelId((panelId) => (panelId < 1 ? 1 : panelId));
            }
            return next;
        });
    };

    useEffect(() => {
        if (!autoTour || !intro) return;

        const tick = () => {
            setActivePanelId((prev) => {
                if (prev < 1 || prev >= 5) return 1;
                return prev + 1;
            });
        };

        const intervalId = window.setInterval(tick, AUTO_TOUR_INTERVAL_MS);
        return () => window.clearInterval(intervalId);
    }, [autoTour, intro]);

    const currentPanelData = panelContents[activePanelId] || { title: "", desc: "", extra: "" };

    return (
        <SceneLoadingProvider>

            <main ref={mainContainerRef} className={styles.scrollMain}>
                <div className={styles.stickyViewport}>

                    <div ref={brochureUiRef} className={styles.brochureUi} aria-hidden={!intro}>
                        <NavBar
                            logoSrc="/model/bdtec/logo.svg"
                            menus={navMenus}
                            contactLink="/brochure/bdtec/contactus"
                            activeIndex={
                                activePanelId >= 1 && activePanelId <= 5 ? activePanelId - 1 : null
                            }
                            autoTour={autoTour}
                            onAutoTourToggle={handleAutoTourToggle}
                            onLogoClick={handleLogoClick}
                        />
                        <BdtecSpecModal visible={intro} />
                    </div>
                    {/*{process.env.NODE_ENV === 'development' && <DomStats />}*/}

                    <BdtecSceneHeroCopy
                        visible={intro && activePanelId === 0}
                    />

                    <InfoPanel
                        isOpen={activePanelId >= 1 && activePanelId <= 5}
                        title={currentPanelData.title}
                        desc={currentPanelData.desc}
                        extra={currentPanelData.extra}
                        onClose={() => handleVariableChange(0)}
                    />

                    <div
                        ref={blurContainerRef}
                        className={`${styles.blurContainer} ${deviceType !== 'desktop' ? styles.blurContainer3dTouch : ''} ${styles.blurContainerVisible}`}
                    >
                        <div
                            ref={canvasHostRef}
                            data-bdtec-canvas-host
                            className={`${styles.canvasHost} ${!intro ? styles.canvasHostDuringIntro : ''}`}
                        >
                            <BdtecScene
                                quality={quality}
                                activePanelId={activePanelId}
                                deviceType={deviceType}
                            />
                        </div>
                        <BdtecEntryOverlay
                            blurContainerRef={blurContainerRef}
                            canvasHostRef={canvasHostRef}
                            brochureUiRef={brochureUiRef}
                            onReveal={() => setIntro(true)}
                        />
                    </div>
                </div>
            </main>
        </SceneLoadingProvider>
    );
}