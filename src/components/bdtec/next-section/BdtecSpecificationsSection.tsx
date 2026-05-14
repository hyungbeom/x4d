"use client";

import { BDI_GATEWAY_SPECS } from "@/components/bdtec/next-section/gatewaySpecs";

type Props = {
    rootRef: React.RefObject<HTMLDivElement | null>;
};

export default function BdtecSpecificationsSection({ rootRef }: Props) {
    return (
        <div
            ref={rootRef}
            style={{
                position: "relative",
                zIndex: 30,
                width: "100%",
                minHeight: "100vh",
                backgroundColor: "#111111",
                borderTopLeftRadius: "40px",
                borderTopRightRadius: "40px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "8vh 5%",
                boxShadow: "0 -20px 50px rgba(0,0,0,0.15)",
                color: "#ffffff",
            }}
        >
            <div data-bdtec-final-text style={{ textAlign: "center", marginBottom: "40px" }}>
                <p
                    style={{
                        fontSize: "clamp(10px, 1.5vw, 14px)",
                        color: "#0ae448",
                        fontWeight: 700,
                        letterSpacing: "2px",
                        marginBottom: "10px",
                    }}
                >
                    SPECIFICATIONS
                </p>
                <h1 style={{ fontSize: "clamp(24px, 5vw, 40px)", fontWeight: 900, marginBottom: "16px", wordBreak: "keep-all" }}>
                    IoT Gateway 제품 사양
                </h1>
                <p style={{ fontSize: "clamp(12px, 2vw, 16px)", color: "#aaaaaa", fontWeight: 500, wordBreak: "keep-all" }}>
                    주식회사 비디텍의 강력한 BDI-100 시리즈 스펙을 확인하세요.
                </p>
            </div>

            <div
                data-bdtec-final-text
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                    gap: "10px",
                    width: "100%",
                    maxWidth: "1200px",
                }}
            >
                {BDI_GATEWAY_SPECS.map((spec, index) => (
                    <div
                        key={spec.label}
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "12px 16px",
                            backgroundColor: "rgba(255, 255, 255, 0.05)",
                            borderRadius: "12px",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                            gap: "12px",
                        }}
                    >
                        <span
                            style={{
                                color: "#888888",
                                fontSize: "clamp(12px, 1vw, 15px)",
                                fontWeight: 600,
                                flexShrink: 0,
                                wordBreak: "keep-all",
                            }}
                        >
                            {spec.label}
                        </span>
                        <span
                            style={{
                                color: "#ffffff",
                                fontSize: "clamp(12px, 1.1vw, 15px)",
                                fontWeight: 500,
                                textAlign: "right",
                                wordBreak: "keep-all",
                            }}
                        >
                            {spec.value}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
