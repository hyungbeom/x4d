import React from 'react';
import PageWrapper from "@/utils/ui/PageWrapper";

export default function ContactUsPage() {
    return (

    <PageWrapper type="blindsReverse">
        <div
            style={{
                minHeight: '100dvh',
                width: '100%',
                backgroundColor: "blue",
                color: "white",
                padding: '50px',
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
            <h1>Contact Us</h1>
            <p>이제 블라인드가 위에서 아래로, 우측에서 좌측으로 차르륵 열립니다! 🌊</p>
        </div>
    </PageWrapper>
);
}