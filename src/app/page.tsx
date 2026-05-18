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
import {SceneLoadingProvider, useBdtecSceneLoadingActions} from "@/utils/three/SceneLoadingContext";
import EnvexEntryOverlay from "@/components/envex/EnvexEntryOverlay";
import EnvexFooterNav from "@/components/envex/EnvexFooterNav";
import {WorldModel} from "@/resources/model/progist/WorldModel";
import NavBar from "@/utils/ui/NavBar";
import InfoPanel from "@/utils/ui/InfoPanel";
import { getCompaniesByPanelId } from "@/data/map/envexCompanies";
import infoPanelStyles from "@/utils/ui/InfoPanel.module.css";
import BdtecSceneHeroCopy from "@/components/bdtec/BdtecSceneHeroCopy";
import styles from "./page.module.css";
import {CHAirModel} from "@/resources/model/progist/CHAirModel";
import {CHEarthModel} from "@/resources/model/progist/CHEarthModel";
import {CHLeafModel} from "@/resources/model/progist/CHLeafModel";
import {CHMicroscopeModel} from "@/resources/model/progist/CHMicroscopeModel";
import {CHWaterModel} from "@/resources/model/progist/CHWaterModel";
import {AirShip} from "@/resources/model/progist/AirShip";
import {Cloud} from "@/resources/model/progist/Cloud";
import AirshipYoutubeOverlay from '@/components/envex/AirshipYoutubeOverlay';
import EnvexSeminarModal from '@/components/envex/EnvexSeminarModal';
import {usePageTransition} from '@/utils/ui/usePageTransition';


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
            desktop: { c: [268.9, 557.8, 524.3], t: [-78.2, 15.1, 9.5], z: 3.85 },
            tablet: { c: [173.4, 651.7, 788.4], t: [-4.0, 49.2, -29.0], z: 2.82 },
            mobile: { c: [806.1, 881.4, 901.9], t: [15.2, 95.0, 14.7], z: 1.97 }
        },
        //수질
        1: {
            desktop: { c: [457.9, 448.0, 436.5], t: [-139.6, 39.5, 41.3], z: 8.59 },
            tablet: { c: [184.9, 272.7, 202.1], t: [-41.8, 117.9, 64.6], z: 5.34 },
            mobile: { c: [-255.9, 738.5, 1265.3], t: [-121.8, 55.2, 21.9], z: 4.14 },
        },
        2: {
            desktop: { c: [60.0, 616.4, 572.5], t: [-96.6, 73.8, -28.3], z: 9.09 },
            tablet: { c: [-81.4, 224.1, 267.8], t: [-58.1, 87.9, -6.4], z: 8.27 },

            mobile: { c: [-260.4, 967.5, 1098.5], t: [-62.2, 108.4, -21.2], z: 4.56 }
        },
        3: {
            desktop: { c: [256.3, 522.7, 566.5], t: [78.4, -32.8, -16.5], z: 12.90 },
            tablet: { c: [-19.3, 382.4, 482.6], t: [73.0, 156.3, 180.7], z: 8.08 },
            mobile: { c: [-437.9, 793.5, 1140.7], t: [108.3, 60.3, 47.4], z: 4.59 }
        },
        4: {
            desktop: { c: [234.0, 510.8, 593.0], t: [-91.5, -31.9, 64.3], z: 7.77 },
            tablet: { c: [210.3, 325.4, 480.1], t: [50.3, 117.0, 194.2], z: 6.60 },

            mobile: { c: [665.8, 786.9, 969.8], t: [-65.1, -7.7, 39.5], z: 4.11 },
        },
        5: {
            desktop: { c: [-447.8, 355.2, 535.1], t: [46.1, 43.8, -47.2], z: 11.84 },
            tablet: { c: [-226.2, 258.3, 281.4], t: [25.6, 90.8, 1.1], z: 8.13 },
            mobile: { c: [-120.4, 964.2, 1066.1], t: [91.5, 89.8, -39.2], z: 4.15 }
        },
        6: {
            desktop: { c: [-203.5, 556.6, 588.8], t: [-36.5, 83.6, -65.7], z: 12.01 },
            tablet: { c: [210.2, 273.8, 302.1], t: [51.5, 92.4, -32.4], z: 9.62 },
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
        desc: '하·폐수 처리부터 수질 정화까지 물 관리의 전 과정을 아우르는 구역입니다.\n' +
            '고효율 펌프·멤브레인 등 첨단 수처리 설비와 스마트 수자원 관리 기술을 만나보실 수 있습니다.\n' +
            '우리의 맑은 물을 지키는 혁신적인 환경 솔루션을 직접 체험해 보세요.\n' ,
        extra: '',
    },
    2: {
        title: '대기 Zone',
        desc: '미세먼지, 유해가스 등 공기 중의 오염물질을 정화하는 핵심 구역입니다.\n' +
            '배출가스를 완벽하게 제어하는 최첨단 집진기와 고효율 필터 설비들을 만나보실 수 있습니다.\n' +
            '대기 상태를 실시간 모니터링하는 스마트 측정 시스템을 직접 확인해 보세요.\n' ,
        extra: '',
    },
    3: {
        title: '측정·분석 Zone',
        desc: '다양한 환경 데이터를 정밀하게 진단하고 분석하는 구역입니다.\n' +
            '수질·대기 연속자동측정기(TMS), 초정밀 가스 분석기 등 첨단 계측 장비들을 만나보실 수 있습니다.\n' +
            '오염물질을 정확히 시각화하는 실시간 스마트 모니터링 솔루션을 직접 확인해 보세요.\n',
        extra: '',
    },
    4: {
        title: '탈탄소 Zone',
        desc: '기후 위기 대응과 온실가스 감축을 이끄는 탄소중립 핵심 구역입니다.\n' +
            '탄소 포집·활용·저장(CCUS) 기술 및 친환경 고효율 에너지 설비들을 만나보실 수 있습니다.\n' +
            '지속 가능한 미래를 앞당기는 저탄소 전환 솔루션을 직접 확인해 보세요.\n' ,
        extra: '',
    },
    5: {
        title: '외국관 Pavilion',
        desc: '전 세계 우수 환경 기업들의 첨단 기술을 교류하는 글로벌 핵심 구역입니다.\n' +
            '해외 각국의 혁신적인 친환경 설비와 선진 환경 솔루션을 만나보실 수 있습니다.\n' +
            '글로벌 환경 산업의 최신 트렌드와 새로운 비즈니스 협력 기회를 직접 확인해 보세요.\n' ,
        extra: '',
    },
    6: {
        title: '기관 및 단체',
        desc: '환경 분야의 핵심 정책과 연구 지원 사업을 안내하는 구역입니다.\n' +
            '국내외 주요 환경 기관과 단체들의 혁신적인 R&D 성과 및 지원 제도를 만나보실 수 있습니다.\n' +
            '미래 환경 산업을 이끌어갈 다양한 협력 프로그램과 비전을 직접 확인해 보세요.\n' ,
    },
};

function HomeContent() {
    const [intro, setIntro] = useState(false);
    const [airshipYoutubeOpen, setAirshipYoutubeOpen] = useState(false);
    const [activePanelId, setActivePanelId] = useState<number>(0);
    const [deviceType, setDeviceType] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
    const [autoTour, setAutoTour] = useState(false);
    const [seminarOpen, setSeminarOpen] = useState(false);
    const viewportRef = useRef<HTMLDivElement>(null);
    const seminarBtnRef = useRef<HTMLButtonElement>(null);
    const { setModuleReady } = useBdtecSceneLoadingActions();

    const AUTO_TOUR_INTERVAL_MS = 5000;

    const navMenus = useMemo(
        () => [
            { title: '수질', onClick: () => setActivePanelId(1) },
            { title: '대기', onClick: () => setActivePanelId(2) },
            { title: '측정분석', onClick: () => setActivePanelId(3) },
            { title: '탈탄소', onClick: () => setActivePanelId(4) },
            { title: '외국관', onClick: () => setActivePanelId(5) },
            { title: '기관 및 단체', onClick: () => setActivePanelId(6) },
        ],
        [],
    );

    const handleVariableChange = (newValue: number) => {
        setActivePanelId(newValue);
    };

    const navigate = usePageTransition();

    const currentPanelData = panelContents[activePanelId] ?? { title: '', desc: '', extra: '' };

    const zoneCompanies = useMemo(
        () =>
            activePanelId >= 1 && activePanelId <= PANEL_COUNT
                ? getCompaniesByPanelId(activePanelId)
                : [],
        [activePanelId],
    );

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
        if (!autoTour || !intro) return;

        const tick = () => {
            setActivePanelId((prev) => {
                if (prev < 1 || prev >= PANEL_COUNT) return 1;
                return prev + 1;
            });
        };

        const intervalId = window.setInterval(tick, AUTO_TOUR_INTERVAL_MS);
        return () => window.clearInterval(intervalId);
    }, [autoTour, intro]);

    useEffect(() => {
        setModuleReady(true);
        return () => setModuleReady(false);
    }, [setModuleReady]);

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
            <main className={styles.homeMain}>
                <div ref={viewportRef} className={styles.stickyViewport}>
                    <BdtecSceneHeroCopy
                        visible={intro && activePanelId === 0}
                        title="ENVEX EXHIBITION"
                        subtitle="3D 브로슈어 샘플"
                        body={[
                            '전시장 6개 구역을 3D 맵에서 둘러볼 수 있는 데모 화면입니다.',
                            '하단 아이콘을 누르면 해당 존으로 카메라가 이동하고 설명 패널이 열립니다.',
                        ]}
                    />

                    <div className={styles.canvasLayer}>
                        <ManciniCanvas quality="default" backgroundColor="#b8dff5">
                            <CameraController activePanelId={activePanelId} deviceType={deviceType} />

                            <Suspense fallback={null}>
                                <SceneEnvironment colorTop="#7ec8ef" colorBottom="#e8f6ff" />
                                <Light_Environment />
                                <WorldModel />
                                <CHAirModel position={[-50,40,-90]}/>
                                <CHEarthModel position={[98,12,-70]}/>
                                <CHLeafModel position={[-46,8,112]}/>
                                <CHMicroscopeModel position={[122,8,40]}/>
                                <AirShip
                                    position={[122, 270, 40]}
                                    scale={[1.5, 1.5, 1.5]}
                                    rotation={[0, Math.PI / 5, 0]}
                                    onScreenClick={
                                        intro ? () => setAirshipYoutubeOpen(true) : undefined
                                    }
                                />
                                <CHWaterModel position={[-132,15,35]} rotation={[0,Math.PI/4,0]}/>
                                <Cloud scale={[7,7,7]} position={[0,120,0]} rotation={[0,Math.PI/4,0]} />
                                {/*<SplineSmokeParticles*/}
                                {/*    spawnPosition={[-260, 1200,900]} // 카메라가 보고 있는 메인 모델 근처 좌표로 설정*/}
                                {/*    count={20}    // 기본 크기의 20배로 뻥튀기 (눈에 보일 때까지 올려보세요)*/}
                                {/*/>*/}
                                <SceneReadyGate />
                            </Suspense>
                        </ManciniCanvas>
                    </div>

                    {intro && (
                        <div className={styles.homeUi}>
                            <NavBar
                                logoSrc="/logo.svg"
                                menus={navMenus}
                                compact
                                hideBottomNav
                                contactLink="/brochure/bdtec/contactus"
                                activeIndex={
                                    activePanelId >= 1 && activePanelId <= PANEL_COUNT
                                        ? activePanelId - 1
                                        : null
                                }
                                autoTour={autoTour}
                                onAutoTourToggle={handleAutoTourToggle}
                                onLogoClick={() => handleVariableChange(0)}
                                showAiAsk
                                aiCompanyId="envex"
                            />
                            <EnvexFooterNav
                                activeIndex={
                                    activePanelId >= 1 && activePanelId <= PANEL_COUNT
                                        ? activePanelId - 1
                                        : null
                                }
                                onSelect={handleVariableChange}
                            />
                        </div>
                    )}

                    {intro && (
                        <div className={styles.panelActionStack}>
                            <button
                                type="button"
                                className={styles.panelNextBtn}
                                onClick={() => navigate('/map', 'blinds')}
                                aria-label="부스 찾기 — 전시장 지도로 이동"
                            >
                                부스 찾기
                            </button>
                            <button
                                ref={seminarBtnRef}
                                type="button"
                                className={`${styles.panelNextBtn} ${styles.panelSeminarBtn} ${seminarOpen ? styles.panelBtnHidden : ''}`}
                                onClick={() => setSeminarOpen(true)}
                                aria-label="세미나 일정 보기"
                                aria-expanded={seminarOpen}
                            >
                                세미나 일정
                            </button>
                        </div>
                    )}

                    <EnvexSeminarModal
                        open={seminarOpen}
                        onClose={() => setSeminarOpen(false)}
                        triggerRef={seminarBtnRef}
                    />

                    <InfoPanel
                        isOpen={intro && activePanelId >= 1 && activePanelId <= PANEL_COUNT}
                        title={currentPanelData.title}
                        desc={currentPanelData.desc}
                        extra={currentPanelData.extra}
                        onClose={() => handleVariableChange(0)}
                        teaserClassName={infoPanelStyles.teaserAboveBottomNav}
                        detailButtonLabel="기업리스트 보기"
                        companies={zoneCompanies}
                    />

                </div>
                    <AirshipYoutubeOverlay
                        open={airshipYoutubeOpen}
                        onClose={() => setAirshipYoutubeOpen(false)}
                    />

                    <EnvexEntryOverlay
                        viewportRef={viewportRef}
                        onReveal={() => setIntro(true)}
                    />
            </main>
    );
}

export default function Home() {
    return (
        <SceneLoadingProvider>
            <HomeContent />
        </SceneLoadingProvider>
    );
}