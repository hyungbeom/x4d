// app/page.tsx (또는 Home.tsx)
"use client";

import React, {Suspense, useCallback, useEffect, useMemo, useRef, useState} from 'react'; // Suspense 추가
import {CameraControls} from '@react-three/drei'
import * as THREE from 'three';
import {ManciniCanvas} from "@/app/brochure/bdtec/mobile/ManciniCanvas";
import {SceneEnvironment} from "@/utils/three/SceneEnvironment";
import {Light_Environment} from "@/utils/three/Light_Environment";
import {SplineSmokeParticles} from "@/utils/three/SplineParticles";
import {SceneReadyGate} from "@/utils/three/SceneReadyGate";
import type CameraControlsImpl from "camera-controls";
import CameraHelper from "@/utils/three/CamHelper";
import gsap from "gsap";
import {ScrollTrigger} from "gsap/ScrollTrigger";
import {SceneLoadingProvider} from "@/utils/three/SceneLoadingContext";
import {WorldModel} from "@/resources/model/progist/WorldModel";
import NavBar from "@/utils/ui/NavBar";
import InfoPanel from "@/utils/ui/InfoPanel";
import { SAMPLE_COMPANIES } from "@/data/progist/sampleCompanies";
import infoPanelStyles from "@/utils/ui/InfoPanel.module.css";
import BdtecSceneHeroCopy from "@/components/bdtec/BdtecSceneHeroCopy";
import {
    AirIcon,
    AnalysisIcon,
    CarbonIcon,
    InstitutionIcon,
    PavilionIcon,
    WaterIcon,
} from "@/components/progist/ProgistNavIcons";
import PageWrapper from "@/utils/ui/PageWrapper";
import styles from "./page.module.css";


type CameraSnapshot = { c: [number, number, number]; t: [number, number, number]; z: number };
type DeviceType = 'desktop' | 'tablet' | 'mobile';

/** BDI-100 (AirProduct) — cameraConfig[1].t는 항상 이 좌표와 맞출 것 */
const BDI_100_TARGET: [number, number, number] = [-40, 215, 45];

const CAMERA_TRANSITION_SMOOTH_TIME = 0.55;

/** 즉시 스냅 (초기 마운트·리사이즈 deviceType 전환 등) */
function applyCameraSnapshot(controls: CameraControlsImpl, {c, t, z}: CameraSnapshot) {
    controls.setLookAt(c[0], c[1], c[2], t[0], t[1], t[2], false);
    controls.zoomTo(z, false);
    const cam = controls.camera;
    if (cam instanceof THREE.OrthographicCamera) {
        cam.zoom = z;
        cam.updateProjectionMatrix();
    }
    controls.update(0);
}

/** 패널 전환 시 부드럽게 이동 */
function transitionCameraSnapshot(controls: CameraControlsImpl, {c, t, z}: CameraSnapshot) {
    void Promise.all([
        controls.setLookAt(c[0], c[1], c[2], t[0], t[1], t[2], true),
        controls.zoomTo(z, true),
    ]);
}

// 🚀 1. 카메라를 통제하는 핵심 컴포넌트
function CameraController({activePanelId, deviceType}: { activePanelId: number; deviceType: DeviceType }) {
    const cameraControlsRef = useRef<CameraControlsImpl | null>(null);
    const hasInitializedRef = useRef(false);
    const prevDeviceTypeRef = useRef<DeviceType>(deviceType);

    // 🎯 설정 객체: c(카메라 위치), t(타겟 위치), z(줌) — 헬퍼는 deviceType·panelId에 맞는 슬롯에 붙여넣기
    const cameraConfig = useMemo(() => ({
        0: {
            desktop: {c: [0, 200, 800], t: [0, 0, 0], z: 1},
            tablet: {c: [0, 250, 1000], t: [0, 0, 0], z: 1},
            mobile: { c: [806.1, 881.4, 901.9], t: [15.2, 95.0, 14.7], z: 1.97 }
        },
        1: {
            desktop: {c: [-40, 260, 280], t: BDI_100_TARGET, z: 1.3},
            tablet: {c: [-40, 300, 340], t: BDI_100_TARGET, z: 1.2},
            mobile: { c: [-255.9, 738.5, 1265.3], t: [-121.8, 55.2, 21.9], z: 4.14 },
        },
        2: {
            desktop: {c: [-420, 50, 200], t: [-420, 0, -20], z: 1.2},
            tablet: {c: [-420, 80, 250], t: [-420, 0, -20], z: 1.1},

            mobile: { c: [-260.4, 967.5, 1098.5], t: [-62.2, 108.4, -21.2], z: 4.56 }
        },
        3: {
            desktop: {c: [0, 50, 650], t: [0, 0, 370], z: 1},
            tablet: {c: [0, 80, 750], t: [0, 0, 370], z: 1},
            mobile: { c: [-437.9, 793.5, 1140.7], t: [108.3, 60.3, 47.4], z: 4.59 }
        },
        4: {
            desktop: {c: [300, 50, 350], t: [300, 0, 88], z: 1},
            tablet: {c: [300, 80, 450], t: [300, 0, 88], z: 1},

            mobile: { c: [665.8, 786.9, 969.8], t: [-65.1, -7.7, 39.5], z: 4.11 },
        },
        5: {
            desktop: {c: [0, 150, 300], t: [0, 100, 0], z: 1},
            tablet: {c: [0, 200, 400], t: [0, 100, 0], z: 1},
            mobile: { c: [-120.4, 964.2, 1066.1], t: [91.5, 89.8, -39.2], z: 4.15 }
        },
        6: {
            desktop: {c: [0, 150, 300], t: [0, 100, 0], z: 1},
            tablet: {c: [0, 200, 400], t: [0, 100, 0], z: 1},
            mobile: { c: [470.6, 1053.6, 804.7], t: [20.9, 67.8, -121.0], z: 4.82 }
        },
    } satisfies Record<number, Record<DeviceType, CameraSnapshot>>), []);

    const applyConfig = useCallback(() => {
        const controls = cameraControlsRef.current;
        if (!controls) return;

        const targetConfig = cameraConfig[activePanelId as keyof typeof cameraConfig] ?? cameraConfig[0];
        const snapshot = targetConfig[deviceType];
        const deviceTypeChanged = prevDeviceTypeRef.current !== deviceType;
        prevDeviceTypeRef.current = deviceType;

        const mode = !hasInitializedRef.current || deviceTypeChanged ? 'snap' : 'transition';

        if (mode === 'snap') {
            applyCameraSnapshot(controls, snapshot);
            hasInitializedRef.current = true;
        } else {
            transitionCameraSnapshot(controls, snapshot);
        }
    }, [activePanelId, deviceType, cameraConfig]);

    useEffect(() => {
        applyConfig();
    }, [applyConfig]);

    return (
        <>
            <CameraControls
                ref={cameraControlsRef}
                makeDefault
                smoothTime={CAMERA_TRANSITION_SMOOTH_TIME}
                draggingSmoothTime={0.12}
            />
            {/*<CameraHelper*/}
            {/*    controlsRef={cameraControlsRef}*/}
            {/*    activePanelId={activePanelId}*/}
            {/*    deviceType={deviceType}*/}
            {/*/>*/}
        </>
    );
}


const PANEL_COUNT = 6;

/** 임시 샘플 카피 — 확정 문구로 교체 예정 */
const panelContents: Record<number, { title: string; desc: string; extra?: string }> = {
    1: {
        title: '수질 Zone',
        desc: '샘플: 하천·정수장·정화 장비 데모가 모여 있는 구역입니다. 터치하면 수질 지표 UI가 뜹니다.',
        extra: 'pH · DO · 탁도 등 가상 센서 값이 3초마다 갱신되는 연출(샘플)입니다.',
    },
    2: {
        title: '대기 Zone',
        desc: '샘플: 미세먼지·VOC·배출 시설 모니터링을 소개하는 공간입니다.',
        extra: '집진기·탈황 설비와 연동된 대시보드 목업이 배치되어 있습니다.',
    },
    3: {
        title: '측정·분석 Zone',
        desc: '샘플: 현장 계측기부터 분석 리포트까지 한 줄로 보여 주는 구역입니다.',
        extra: '랩 장비·휴대용 측정기·데이터 시각화 화면이 나란히 전시됩니다.',
    },
    4: {
        title: '탈탄소 Zone',
        desc: '샘플: RE100 · ESS · 탄소배출권 관련 스토리보드가 들어갈 자리입니다.',
        extra: '신재생·저탄소 공정 사례 카드 6장 분량(가안)으로 구성 예정.',
    },
    5: {
        title: '외국관 Pavilion',
        desc: '샘플: 해외 기업·기관 부스가 배치되는 글로벌 존입니다.',
        extra: '국가별 플래그·파트너 로고 월 — 실제 목록은 추후 반영.',
    },
    6: {
        title: '기관 및 단체',
        desc: '샘플: 정부·공공·협회 부스 안내 데스크 구역입니다.',
        extra: '지원 사업·인증·규제 Q&A 링크 모음(플레이스홀더).',
    },
};

export default function Home() {
    const [activePanelId, setActivePanelId] = useState<number>(0);
    const [deviceType, setDeviceType] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
    const [autoTour, setAutoTour] = useState(false);

    const AUTO_TOUR_INTERVAL_MS = 5000;

    const navMenus = useMemo(
        () => [
            { title: '수질', icon: <WaterIcon />, onClick: () => setActivePanelId(1) },
            { title: '대기', icon: <AirIcon />, onClick: () => setActivePanelId(2) },
            { title: '측정분석', icon: <AnalysisIcon />, onClick: () => setActivePanelId(3) },
            { title: '탈탄소', icon: <CarbonIcon />, onClick: () => setActivePanelId(4) },
            { title: '외국관', icon: <PavilionIcon />, onClick: () => setActivePanelId(5) },
            { title: '기관 및 단체', icon: <InstitutionIcon />, onClick: () => setActivePanelId(6) },
        ],
        [],
    );

    const handleVariableChange = (newValue: number) => {
        setActivePanelId(newValue);
    };

    const handleNextPanel = () => {
        setActivePanelId((prev) => {
            if (prev < 1 || prev >= PANEL_COUNT) return 1;
            return prev + 1;
        });
    };

    const currentPanelData = panelContents[activePanelId] ?? { title: '', desc: '', extra: '' };

    const handleAutoTourToggle = () => {
        setAutoTour((prev) => {
            const next = !prev;
            if (next) {
                setActivePanelId((id) => (id < 1 ? 1 : id));
            }
            return next;
        });
    };

    useEffect(() => {
        if (!autoTour) return;

        const tick = () => {
            setActivePanelId((prev) => {
                if (prev < 1 || prev >= PANEL_COUNT) return 1;
                return prev + 1;
            });
        };

        const intervalId = window.setInterval(tick, AUTO_TOUR_INTERVAL_MS);
        return () => window.clearInterval(intervalId);
    }, [autoTour]);

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

    return (
        <SceneLoadingProvider>
            <PageWrapper type="blindsReverse">
            <main className={styles.homeMain}>
                <div className={styles.stickyViewport}>
                    <BdtecSceneHeroCopy
                        visible={activePanelId === 0}
                        title="ENVEX World"
                        subtitle="3D 브로슈어 샘플"
                        body={[
                            '전시장 6개 구역을 3D 맵에서 둘러볼 수 있는 데모 화면입니다.',
                            '하단 아이콘을 누르면 해당 존으로 카메라가 이동하고 설명 패널이 열립니다.',
                            'AUTO를 켜면 구역이 5초 간격으로 순환합니다.',
                        ]}
                    />

                    <div className={styles.canvasLayer}>
                        <ManciniCanvas quality="default" backgroundColor="#b8dff5">
                            <CameraController activePanelId={activePanelId} deviceType={deviceType} />

                            <Suspense fallback={null}>
                                <SceneEnvironment colorTop="#7ec8ef" colorBottom="#e8f6ff" />
                                <Light_Environment />
                                <WorldModel />
                                {/*<SplineSmokeParticles*/}
                                {/*    spawnPosition={[-260, 1200,900]} // 카메라가 보고 있는 메인 모델 근처 좌표로 설정*/}
                                {/*    count={20}    // 기본 크기의 20배로 뻥튀기 (눈에 보일 때까지 올려보세요)*/}
                                {/*/>*/}
                                <SceneReadyGate />
                            </Suspense>
                        </ManciniCanvas>
                    </div>

                    <NavBar
                        logoSrc="/model/bdtec/logo.svg"
                        menus={navMenus}
                        iconMode
                        compact
                        contactLink="/brochure/bdtec/contactus"
                        activeIndex={
                            activePanelId >= 1 && activePanelId <= PANEL_COUNT
                                ? activePanelId - 1
                                : null
                        }
                        autoTour={autoTour}
                        onAutoTourToggle={handleAutoTourToggle}
                        showAiAsk
                        aiCompanyId="envex"
                        onLogoClick={() => handleVariableChange(0)}
                    />

                    {activePanelId >= 1 && activePanelId <= PANEL_COUNT && (
                        <button
                            type="button"
                            className={styles.panelNextBtn}
                            onClick={handleNextPanel}
                            aria-label="다음 구역으로 이동"
                        >
                            Next
                        </button>
                    )}

                    <InfoPanel
                        isOpen={activePanelId >= 1 && activePanelId <= PANEL_COUNT}
                        title={currentPanelData.title}
                        desc={currentPanelData.desc}
                        extra={currentPanelData.extra}
                        onClose={() => handleVariableChange(0)}
                        teaserClassName={infoPanelStyles.teaserAboveBottomNav}
                        detailButtonLabel="기업리스트 보기"
                        companies={SAMPLE_COMPANIES}
                    />
                </div>
            </main>
            </PageWrapper>
        </SceneLoadingProvider>
    );
}