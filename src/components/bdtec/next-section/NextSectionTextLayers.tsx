"use client";

type Props = {
    textWrapperRef: React.RefObject<HTMLDivElement | null>;
    textIntroRef: React.RefObject<HTMLDivElement | null>;
    textFactoryRef: React.RefObject<HTMLDivElement | null>;
    textTankRef: React.RefObject<HTMLDivElement | null>;
    textWifiRef: React.RefObject<HTMLDivElement | null>;
    textBoxRef: React.RefObject<HTMLDivElement | null>;
};

export default function NextSectionTextLayers({
    textWrapperRef,
    textIntroRef,
    textFactoryRef,
    textTankRef,
    textWifiRef,
    textBoxRef,
}: Props) {
    return (
        <div
            ref={textWrapperRef}
            style={{
                position: "absolute",
                top: "5%",
                left: "10%",
                zIndex: 20,
                width: "80%",
                pointerEvents: "none",
            }}
        >
            <div ref={textIntroRef} style={{ position: "absolute", top: 0, left: 0 }}>
                <h1 style={{ fontSize: "7vw", color: "#111", fontWeight: 900, marginBottom: "10px" }}>
                    IoT Real-time
                    <br /> Monitoring System
                    <br /> Architecture Diagram
                </h1>
                <p style={{ fontSize: "3vw", color: "#555", fontWeight: 500 }}>비디텍의 차원이 다른 관리를 경험하세요</p>
            </div>
            <div ref={textFactoryRef} style={{ position: "absolute", top: 0, left: 0, opacity: 0, transform: "translateY(20px)" }}>
                <h1 style={{ fontSize: "7vw", color: "white", fontWeight: 900, marginBottom: "10px" }}>IoT Sensors for Emission Facilities</h1>
                <p style={{ fontSize: "3vw", color: "white", fontWeight: 500 }}>
                    Sensors are attached to emission facilities (equipment and machinery) to transmit operation data of both the emission and
                    prevention facilities to the IoT Gateway via a wired connection.
                </p>
            </div>
            <div ref={textTankRef} style={{ position: "absolute", top: 0, left: 0, opacity: 0, transform: "translateY(20px)" }}>
                <h1 style={{ fontSize: "7vw", color: "#111", fontWeight: 900, marginBottom: "10px" }}>
                    IoT Gateway
                </h1>
                <p style={{ fontSize: "3vw", color: "#555", fontWeight: 500 }}>
                    Collects data measured by the sensors and transmits the securely processed data to the Korea Environment Corporation server
                    through wired and wireless networks.
                </p>
            </div>
            <div ref={textWifiRef} style={{ position: "absolute", top: 0, left: 0, opacity: 0, transform: "translateY(20px)" }}>
                <h1 style={{ fontSize: "7vw", color: "#111", fontWeight: 900, marginBottom: "10px" }}>
                    IoT Sensors for Prevention Facilities
                </h1>
                <p style={{ fontSize: "3vw", color: "#555", fontWeight: 500 }}>
                    Utilizes various types of measuring instruments to collect relevant data (current, differential pressure, pH, temperature,
                    etc.) to monitor the operational status and detailed metrics of the prevention facilities.
                </p>
            </div>
            <div ref={textBoxRef} style={{ position: "absolute", top: 0, left: 0, opacity: 0, transform: "translateY(20px)" }}>
                <h1 style={{ fontSize: "7vw", color: "#111", fontWeight: 900, marginBottom: "10px" }}>
                    04. Edge Device
                </h1>
                <p style={{ fontSize: "3vw", color: "#555", fontWeight: 500 }}>현장 센서 데이터 수집 및 클라우드 동기화</p>
            </div>
        </div>
    );
}
