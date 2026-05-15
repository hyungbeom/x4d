'use client';

import React, { useEffect, useRef, useState } from 'react';
import ScrollIndicator from "@/utils/ScrollIndicator";
import Overlay1 from "@/components/bdtec/overlay/OverLay1";
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import dynamic from 'next/dynamic';
import NavBar from "@/utils/NavBar";
import InfoPanel from "@/utils/InfoPanel";
import PageWrapper from "@/utils/PageWrapper";

const Spline = dynamic(() => import('@splinetool/react-spline'), {
    ssr: false,
    loading: () => <div style={{ height: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>3D 로딩 중...</div>
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

    const splineApp = useRef(null);
    const mainContainerRef = useRef(null);
    const prevState = useRef<number | null>(null);

    // 🚀 1. 애니메이션을 적용할 대상을 가리킬 Ref 추가
    const introWrapperRef = useRef<HTMLDivElement>(null);
    const blurContainerRef = useRef<HTMLDivElement>(null);

    const navMenus = [
        { title: 'BDI-100', onClick: () => { handleVariableChange(1) } },
        { title: '배출시설', onClick: () => { handleVariableChange(2) } },
        { title: '방지시설', onClick: () => { handleVariableChange(3) } },
        { title: '통신교류', onClick: () => { handleVariableChange(4) } },
        { title: 'Iot Gateway', onClick: () => { handleVariableChange(5) } }
    ];

    useEffect(() => {
        gsap.registerPlugin(ScrollTrigger);
        return () => {
            ScrollTrigger.getAll().forEach(trigger => trigger.kill());
            gsap.ticker.remove(trackSplineVariable);
        };
    }, []);

    const trackSplineVariable = () => {
        const app: any = splineApp.current;
        if (!app) return;

        const currentState = app.getVariable('Product_State');

        if (currentState !== prevState.current) {
            setActivePanelId(currentState);
            prevState.current = currentState;
        }
    };

    const handleVariableChange = (newValue: number) => {
        const app: any = splineApp.current;
        if (!app) return;
        app.setVariable('Product_State', newValue);
    };

    const onLoad = (app: any) => {
        splineApp.current = app;
        gsap.ticker.add(trackSplineVariable);

        // ❌ 이 부분은 Three.js 전용 코드라 Spline에서는 작동하지 않습니다. 삭제해 주세요!
        // if (window.innerWidth <= 768) {
        //     app.setPixelRatio(1);
        // }
    };

    // =========================================================
    // 🚀 2. 시작 버튼 클릭 시 부드럽게 사라지는 GSAP 로직 적용
    // =========================================================
    function getStart() {
        // 오버레이 컨테이너 서서히 투명하게 처리
        if (introWrapperRef.current) {
            gsap.to(introWrapperRef.current, {
                opacity: 0,
                duration: 1, // 1초 동안 스르륵 사라짐
                ease: "power2.inOut",
                onComplete: () => {
                    // 애니메이션이 완전히 끝난 뒤에 intro 상태를 변경하여 DOM에서 삭제!
                    setIntro(true);
                }
            });
        } else {
            setIntro(true); // 보험용 (혹시라도 ref가 없으면 바로 실행)
        }

        // 3D 배경의 블러 효과도 동시에 걷어냅니다
        if (blurContainerRef.current) {
            gsap.to(blurContainerRef.current, {
                filter: "blur(0px)",
                duration: 1,
                ease: "power2.inOut"
            });
        }
    }

    const currentPanelData = panelContents[activePanelId] || { title: "", desc: "", extra: "" };

    return (
        <>
            <PageWrapper>
            <main ref={mainContainerRef} style={{ position: 'relative', height: '300vh', width: '100vw', backgroundColor: '#e5e5e5' }}>
                <div style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden' }}>

                    {/* ========================================================= */}
                    {/* 🚀 3. 사라질 요소들을 하나로 묶어주는 래퍼(Wrapper) 적용 */}
                    {/* ========================================================= */}
                    {!intro && (
                        <div ref={introWrapperRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 12 }}>
                            <Overlay1 />

                            <div style={{ position: 'absolute', bottom: 0, right: 0, padding: 50 }}>
                                <span
                                    style={{ backgroundColor: 'blue', color: 'white', padding: '10px 20px', borderRadius: 10, cursor: 'pointer' }}
                                    onClick={getStart}
                                >
                                    비디텍 브로슈어 시작하기
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Intro가 완료되었을 때만 NavBar 등장 */}
                    {intro && (
                        <NavBar
                            logoSrc="/model/bdtec/logo.svg"
                            menus={navMenus}
                            contactLink="/brochure/bdtec/contactus"
                        />
                    )}

                    <InfoPanel
                        isOpen={activePanelId >= 1 && activePanelId <= 5}
                        title={currentPanelData.title}
                        desc={currentPanelData.desc}
                        extra={currentPanelData.extra}
                        onClose={() => handleVariableChange(0)}
                    />

                    {/* 🚀 4. 블러 컨테이너에도 Ref를 달아주어 GSAP으로 제어합니다 */}
                    <div ref={blurContainerRef} style={{ width: '100%', height: '100%', filter: intro ? 'blur(0px)' : 'blur(5px)' }}>
                        <Spline
                            scene="https://prod.spline.design/TYUnZBzHQ8Pfrt24/scene.splinecode"
                            onLoad={onLoad}
                        />
                    </div>
                </div>
            </main>
            </PageWrapper>
        </>
    );
}