import React, { useRef, useState, useMemo } from 'react'
import { useGLTF, useTexture, Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'

// 유튜브 ID 추출 및 썸네일 URL 생성 (프록시 사용)
function getYoutubeThumbnailUrl(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    const videoId = (match && match[2].length === 11) ? match[2] : null;
    if (videoId) {
        return `https://images.weserv.nl/?url=${encodeURIComponent(`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`)}`;
    }
    return '/thumbnail.jpg';
}

// 유튜브 주소를 iframe용 embed 주소로 변환하는 함수
function getYoutubeEmbedUrl(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    const videoId = (match && match[2].length === 11) ? match[2] : null;
    console.log(videoId,'videoId')
    // 클릭하자마자 바로 재생되도록 ?autoplay=1 추가
    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : '';
}

const YOUTUBE_URL = "https://www.youtube.com/watch?v=alV3wILz3Os"

// 수정된 코드
function ThumbnailMaterial({ youtubeUrl }) {
    const thumbnailUrl = useMemo(() => getYoutubeThumbnailUrl(youtubeUrl), [youtubeUrl]);
    const texture = useTexture(thumbnailUrl);

    return (
        <meshBasicMaterial
            map={texture}
            toneMapped={false}
            // color="#2a3f52" <--- 이 부분을 지우거나 color="white"로 바꿉니다.
            color="white"
        />
    )
}

export function AirShip({ onScreenClick, ...props }) {
    const { nodes, materials } = useGLTF('/model/progist/Airship.glb')
    const shipRef = useRef()

    // 💡 유튜브 전체화면 팝업을 띄울지 말지 결정하는 상태
    const [showYoutubePopup, setShowYoutubePopup] = useState(false)

    const initialY = props.position ? props.position[1] : 300

    useFrame((state) => {
        const time = state.clock.getElapsedTime()
        const yOffset = ((Math.sin(time * 1) + 1) / 2) * 20
        shipRef.current.position.y = initialY + yOffset
    })

    return (
        <group ref={shipRef} {...props} dispose={null}>
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.Airship_Body.geometry}
                material={materials.All_Texture}
                position={[0, -25.622, 0]}
            >
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Airship_Screen.geometry}
                    position={[1.736, 9.672, 0.231]}
                    onClick={(e) => {
                        e.stopPropagation()
                        // 💡 클릭 시 팝업 띄우기!
                        setShowYoutubePopup(true)
                        onScreenClick?.()
                    }}
                    onPointerOver={(e) => {
                        e.stopPropagation()
                        document.body.style.cursor = 'pointer'
                    }}
                    onPointerOut={() => {
                        document.body.style.cursor = ''
                    }}
                >
                    {/* 3D 화면에는 항상 썸네일만 띄워둡니다 */}
                    <ThumbnailMaterial youtubeUrl={YOUTUBE_URL} />
                </mesh>
            </mesh>

            {/* 💡 팝업 상태가 true일 때 화면 전체를 덮는 유튜브 팝업 렌더링 */}
            {showYoutubePopup && (
                <Html center fullscreen zIndexRange={[100, 0]}>
                    <div
                        style={{
                            position: 'fixed',
                            top: 0, left: 0, width: '100vw', height: '100vh',
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            display: 'flex', flexDirection: 'column',
                            justifyContent: 'center', alignItems: 'center',
                            zIndex: 9999
                        }}
                        // 검은 배경 클릭 시 팝업 닫기
                        onClick={() => setShowYoutubePopup(false)}
                    >
                        {/* 닫기 버튼 */}
                        <div style={{ width: '80%', maxWidth: '800px', textAlign: 'right', marginBottom: '10px' }}>
                            <button
                                style={{ padding: '8px 16px', cursor: 'pointer', background: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}
                                onClick={() => setShowYoutubePopup(false)}
                            >
                                닫기 ✕
                            </button>
                        </div>

                        {/* 유튜브 iframe */}
                        <iframe
                            width="80%"
                            style={{ maxWidth: '800px', aspectRatio: '16/9' }}
                            src={getYoutubeEmbedUrl(YOUTUBE_URL)}
                            title="YouTube video player"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    </div>
                </Html>
            )}
        </group>
    )
}

useGLTF.preload('/model/progist/Airship.glb')