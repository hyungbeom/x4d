'use client';

import React, {useEffect, useMemo, useRef, useState} from 'react';
import Overlay1 from "@/components/bdtec/overlay/OverLay1";
import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import dynamic from 'next/dynamic';
import NavBar from "@/utils/ui/NavBar";
import InfoPanel from "@/utils/ui/InfoPanel";
import PageWrapper from "@/utils/ui/PageWrapper";
import styles from "./page.module.css";
import {DomStats} from "@/utils/DevStats";
import {ManciniCanvas} from "@/app/brochure/bdtec/mobile/ManciniCanvas";
import {Light_Environment} from "@/utils/three/Light_Environment";
import LineObj from "@/utils/three/LineObj";
import {BdtecWebGpuBackdropGrid} from "@/utils/three/BdtecWebGpuBackdropGrid";
import {Environment} from "@react-three/drei";
import * as THREE from 'three';
import { Tank } from "@/resources/model/bdtect/Tank";
import {useFrame} from "@react-three/fiber";
import { SystemModel } from "@/resources/model/bdtect/SystemModel";
import {AirProduct} from "@/resources/model/Air_Product";
import { Factory } from "@/resources/model/bdtect/Factory";
import {Wifi} from "@/resources/model/bdtect/Wifi";

const Spline = dynamic(() => import('@splinetool/react-spline'), {
    ssr: false,
    loading: () => <div className={styles.splineLoading}>3D 로딩 중...</div>
});


const panelContents: Record<number, { title: string; desc: string; extra?: string }> = {
    1: {title: "BDI-100", desc: "24시간 지속적인 모니터링으로 집진상태 판단과 측정 시스템을 제공합니다.", extra: "온도/차압/전류 등 환경 데이터를 안전하게 전송합니다."},
    2: {title: "배출시설", desc: "산업 현장에서 발생하는 오염물질 배출 현황을 실시간으로 감시합니다.", extra: "배출량 초과 여부를 즉각적으로 알림 처리합니다."},
    3: {title: "방지시설", desc: "오염 방지 시설의 가동 여부를 24시간 실시간으로 모니터링합니다.", extra: "모터, 펌프 등의 동작 상태를 정밀하게 추적합니다."},
    4: {
        title: "통신교류",
        desc: "환경관리공단 서버(www.greenlink.or.kr)와 보안된 네트워크로 데이터를 주고받습니다.",
        extra: "데이터 위변조 방지 및 암호화 전송 지원."
    },
    5: {title: "IoT Gateway", desc: "현장의 모든 센서 데이터를 수집하여 클라우드로 전송하는 핵심 허브입니다.", extra: "LTE/5G망을 통한 무중단 통신 환경 구축."}
};

export default function Home() {
    const [intro, setIntro] = useState(true);
    const [activePanelId, setActivePanelId] = useState<number>(0);

    const [currentScene, setCurrentScene] = useState("vader");
    const [quality, setQuality] = useState("default");
    const [isPostProcessingEnabled, setIsPostProcessingEnabled] = useState(true);

    // 🚀 3. 태블릿 및 모바일 기기 여부를 판정할 상태값 추가 (기준: 1024px)
    const [isMobileOrTablet, setIsMobileOrTablet] = useState<boolean>(false);

    const splineApp = useRef(null);
    const mainContainerRef = useRef(null);
    const prevState = useRef<number | null>(null);

    const introWrapperRef = useRef<HTMLDivElement>(null);
    const blurContainerRef = useRef<HTMLDivElement>(null);

    const navMenus = [
        {
            title: 'BDI-100', onClick: () => {
                handleVariableChange(1)
            }
        },
        {
            title: '배출시설', onClick: () => {
                handleVariableChange(2)
            }
        },
        {
            title: '방지시설', onClick: () => {
                handleVariableChange(3)
            }
        },
        {
            title: '통신교류', onClick: () => {
                handleVariableChange(4)
            }
        },
        {
            title: 'Iot Gateway', onClick: () => {
                handleVariableChange(5)
            }
        }
    ];

    useEffect(() => {
        gsap.registerPlugin(ScrollTrigger);

        // 🚀 4. 컴포넌트 마운트 시 및 창 크기 변경 시 태블릿/모바일 판정 로직 실행
        const handleResize = () => {
            // 1024px 이하를 태블릿+모바일 범위로 지정
            setIsMobileOrTablet(window.innerWidth <= 1024);
        };

        handleResize(); // 초기 실행
        window.addEventListener('resize', handleResize);

        return () => {
            ScrollTrigger.getAll().forEach(trigger => trigger.kill());
            gsap.ticker.remove(trackSplineVariable);
            window.removeEventListener('resize', handleResize);
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

    // 🚀 5. 데스크탑과 R3F 양쪽 모두에서 상호작용이 가능하도록 상태 변경 로직 고도화
    const handleVariableChange = (newValue: number) => {
        // UI 패널 상태 직접 업데이트 (R3F 및 공통 UI 반응용)
        setActivePanelId(newValue);

        // 데스크탑 모드에서 Spline 앱이 켜져있을 경우 변수 동기화
        const app: any = splineApp.current;
        if (app) {
            app.setVariable('Product_State', newValue);
        }
    };

    const onLoad = (app: any) => {
        splineApp.current = app;
        gsap.ticker.add(trackSplineVariable);
    };

    function getStart() {
        if (introWrapperRef.current) {
            gsap.to(introWrapperRef.current, {
                opacity: 0,
                duration: 1,
                ease: "power2.inOut",
                onComplete: () => {
                    setIntro(true);
                }
            });
        } else {
            setIntro(true);
        }

        if (blurContainerRef.current) {
            gsap.to(blurContainerRef.current, {
                filter: "blur(0px)",
                duration: 1,
                ease: "power2.inOut"
            });
        }
    }

    const currentPanelData = panelContents[activePanelId] || {title: "", desc: "", extra: ""};



    return (
        <>
            <PageWrapper>
                <main ref={mainContainerRef} className={styles.scrollMain}>
                    <div className={styles.stickyViewport}>

                        {!intro && (
                            <div ref={introWrapperRef} className={styles.introWrapper}>
                                <div className={styles.overlaySafeZone}>
                                    <Overlay1/>
                                </div>
                                <div className={styles.startBtnContainer}>
                                    <button type="button" className={styles.startBtn} onClick={getStart}>
                                        비디텍 브로슈어 시작하기
                                    </button>
                                </div>
                            </div>
                        )}

                        {intro && (
                            <NavBar
                                logoSrc="/model/bdtec/logo.svg"
                                menus={navMenus}
                                contactLink="/brochure/bdtec/contactus"
                            />
                        )}
                        {process.env.NODE_ENV === 'development' && <DomStats/>}
                        <InfoPanel
                            isOpen={activePanelId >= 1 && activePanelId <= 5}
                            title={currentPanelData.title}
                            desc={currentPanelData.desc}
                            extra={currentPanelData.extra}
                            onClose={() => handleVariableChange(0)}
                        />

                        <div
                            ref={blurContainerRef}
                            className={`${styles.blurContainer} ${intro ? styles.blurContainerReady : styles.blurContainerIntro} ${isMobileOrTablet ? styles.blurContainer3dTouch : ''}`}
                        >
                            {/* 🚀 6. 기기 조건에 따른 3D 뷰포트 분기 처리 */}
                            {isMobileOrTablet ? (
                                // 📱 태블릿 / 모바일 환경: 사용자가 커스텀한 R3F WebGPU Canvas 적용
                                <ManciniCanvas quality={quality}>
                                    <Environment preset="city" blur={0}/>


                                    <Light_Environment/>
                                    <BdtecWebGpuBackdropGrid/>


                                    <FloatingTankLine/>

                                    <Tank scale={[70,70,70]} position={[0, 0, 370]} rotation={[0,-Math.PI/2,0]}/>
                                    <AirProduct scale={[20,20,20]} position={[-40,215,45]}/>
                                    <Factory scale={[20,20,20]} position={[-340,0,45]}/>
                                    <Wifi scale={[150,150,150]} position={[340,0,45]}/>
                                    <SystemModel scale={[100,100,100]} position={[0,130,0]} rotation={[0,0,0]}/>

                                    {/*<Tank scale={[70,70,70]}/>*/}
                                </ManciniCanvas>


                            ) : (
                                // 🖥️ 데스크탑 환경: 기존 화려한 오리지널 Spline 적용
                                <Spline
                                    scene="https://prod.spline.design/TYUnZBzHQ8Pfrt24/scene.splinecode"
                                    onLoad={onLoad}
                                />
                            )}
                        </div>
                    </div>
                </main>
            </PageWrapper>
        </>
    );
}




function FloatingTankLine() {
    // 그룹을 제어하기 위한 이름표(ref)를 만듭니다.
    const groupRef = useRef<THREE.Group>(null);

    const tankSurroundPoints = useMemo(() => [
        new THREE.Vector3(-200, 40, -70),
        new THREE.Vector3(-200, 40, 200),
        new THREE.Vector3(0, 40, 200),
        new THREE.Vector3(0, 40, -70),
        new THREE.Vector3(-200, 40, -70),
    ], []);

    // 🚀 매 프레임마다 실행되는 애니메이션 로직
    useFrame((state) => {
        if (groupRef.current) {
            // state.clock.elapsedTime은 흘러간 시간입니다.
            // Math.sin(시간 * 속도) * 높이

            const speed = 3;       // 1. 위아래로 움직이는 속도 (숫자가 클수록 빠름)
            const amplitude = 10;   // 2. 위아래로 움직이는 폭 (숫자가 클수록 높이 올라감)

            // Y축(위아래) 위치를 사인 곡선을 따라 부드럽게 변경합니다.
            groupRef.current.position.y = Math.sin(state.clock.elapsedTime * speed) * amplitude;
        }
    });

    return (
        // 🚀 애니메이션을 적용할 그룹에 ref를 달아줍니다.
        <group ref={groupRef}>
            <LineObj
                type="type1"
                points={tankSurroundPoints}
                tubeRadius={3}
                lightRadius={1}
            />
        </group>
    );
}