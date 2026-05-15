import React from 'react';
import PageWrapper from "@/utils/PageWrapper";

export default function ContactUsPage() {
    return (
        <PageWrapper type="blinds">
            <div
                style={{
                    minHeight: '100vh',     /* 최소 높이를 화면 전체(100vh)로 설정 */
                    width: '100%',          /* 너비를 화면 전체로 설정 */
                    backgroundColor: "blue",
                    color: "white",         /* 파란 배경에서 글씨가 잘 보이도록 흰색으로 변경 */
                    padding: '50px',
                    boxSizing: 'border-box',/* 패딩 50px을 너비/높이에 포함시켜 스크롤바 방지 */

                    /* (선택) 글씨를 화면 정중앙에 배치하고 싶다면 아래 3줄 유지, 아니면 지워도 됩니다 */
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <h1>Contact Us</h1>
                <p>이제 파란색 배경이 화면을 꽉 채웁니다! 🌊</p>
            </div>
        </PageWrapper>
    );
}