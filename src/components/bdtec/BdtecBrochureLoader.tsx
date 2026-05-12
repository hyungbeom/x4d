"use client";

import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {useProgress} from "@react-three/drei";
import { gsap, ScrollTrigger } from "@/lib/brochureGsap";

const AFTER_READY_MS = 3000;
const FORCE_DONE_MS = 14_000;

function resourceLabel(item: string) {
    if (!item) return "초기화";
    const l = item.toLowerCase();
    if (l.includes(".hdr") || l.includes("cube") || l.includes("env") || l.includes("preset"))
        return "씬 · IBL 환경";
    if (l.endsWith(".glb") || l.endsWith(".gltf")) return "3D 오브젝트";
    if (l.includes(".jpg") || l.includes(".jpeg") || l.includes(".png") || l.includes("texture"))
        return "텍스처";
    if (l.includes("draco") || l.includes("wasm")) return "디코더";
    return "리소스";
}

type Phase = "loading" | "exit" | "gone";

export default function BdtecBrochureLoader() {
    const {active, progress, item, total} = useProgress();
    const shellRef = useRef<HTMLDivElement>(null);
    const barFillRef = useRef<HTMLDivElement>(null);
    const mountAt = useRef(Date.now());
    const [phase, setPhase] = useState<Phase>("loading");
    const doneRef = useRef(false);
    const sawLoadingRef = useRef(false);
    const snapRef = useRef({active: false, pct: 0, total: 0});

    const pct = useMemo(() => {
        const p = Number.isFinite(progress) ? progress : 0;
        return Math.min(100, Math.max(0, Math.round(p)));
    }, [progress]);
    const label = useMemo(() => resourceLabel(item), [item]);

    snapRef.current = {active, pct, total};

    const runExit = useCallback(() => {
        if (doneRef.current) return;
        doneRef.current = true;
        const shell = shellRef.current;
        if (!shell) {
            setPhase("gone");
            return;
        }
        setPhase("exit");
        gsap.to(shell, {
            opacity: 0,
            y: -28,
            filter: "blur(12px)",
            duration: 0.75,
            ease: "power3.inOut",
            onComplete: () => {
                shell.style.pointerEvents = "none";
                shell.style.visibility = "hidden";
                setPhase("gone");
            },
        });
    }, []);

    useEffect(() => {
        const bar = barFillRef.current;
        if (!bar) return;
        gsap.to(bar, { width: `${pct}%`, duration: 0.22, ease: "power2.out" });
        return () => {
            gsap.killTweensOf(bar);
        };
    }, [pct]);

    useEffect(() => {
        return () => {
            document.body.style.overflow = "";
        };
    }, []);

    useEffect(() => {
        if (active) sawLoadingRef.current = true;
    }, [active]);

    useEffect(() => {
        if (phase !== "loading" || doneRef.current) return;
        const assetsDone = !active && pct >= 100;
        if (!assetsDone) return;
        const t = window.setTimeout(() => runExit(), AFTER_READY_MS);
        return () => window.clearTimeout(t);
    }, [active, pct, phase, runExit]);

    useEffect(() => {
        if (phase !== "loading" || doneRef.current) return;
        let afterReady: number | undefined;
        const t = window.setTimeout(() => {
            if (doneRef.current) return;
            const {active: a, total: tot} = snapRef.current;
            if (!a && !sawLoadingRef.current && tot === 0) {
                afterReady = window.setTimeout(() => runExit(), AFTER_READY_MS);
            }
        }, 2200);
        return () => {
            window.clearTimeout(t);
            if (afterReady !== undefined) window.clearTimeout(afterReady);
        };
    }, [phase, runExit]);

    useEffect(() => {
        if (phase !== "loading" || doneRef.current) return;
        const t = window.setTimeout(() => {
            if (!doneRef.current) runExit();
        }, FORCE_DONE_MS);
        return () => window.clearTimeout(t);
    }, [phase, runExit]);

    useEffect(() => {
        if (phase === "gone") {
            document.body.style.overflow = "";
            requestAnimationFrame(() => ScrollTrigger.refresh());
            return;
        }
        document.body.style.overflow = "hidden";
    }, [phase]);

    if (phase === "gone") return null;

    return (
        <div
            ref={shellRef}
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 99999,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                background: "linear-gradient(165deg, #0a0a0c 0%, #12121a 45%, #0d1118 100%)",
                color: "#f0f0f5",
                fontFamily: "Inter, system-ui, sans-serif",
            }}
        >
            <p
                style={{
                    fontSize: "clamp(11px, 1.1vw, 13px)",
                    letterSpacing: "0.35em",
                    textTransform: "uppercase",
                    color: "#0ae448",
                    fontWeight: 700,
                    marginBottom: "12px",
                }}
            >
                BDTEC
            </p>
            <h1
                style={{
                    fontSize: "clamp(22px, 3.2vw, 34px)",
                    fontWeight: 800,
                    margin: "0 0 8px",
                    letterSpacing: "-0.02em",
                }}
            >
                3D 씬을 준비하고 있습니다
            </h1>
            <p style={{margin: "0 0 28px", color: "#8b919c", fontSize: "clamp(13px, 1.4vw, 15px)"}}>
                {active ? (
                    <>
                        <span style={{color: "#c5cad3"}}>{label}</span>
                        <span style={{opacity: 0.65}}> · 로딩 중</span>
                    </>
                ) : pct >= 100 ? (
                    <span style={{color: "#9aa3b0"}}>로드 완료 — 잠시 후 화면을 표시합니다</span>
                ) : (
                    <span style={{color: "#9aa3b0"}}>리소스 대기 중…</span>
                )}
            </p>

            <div
                style={{
                    width: "min(420px, 86vw)",
                    height: "4px",
                    borderRadius: "999px",
                    background: "rgba(255,255,255,0.08)",
                    overflow: "hidden",
                }}
            >
                <div
                    ref={barFillRef}
                    style={{
                        height: "100%",
                        width: "0%",
                        borderRadius: "999px",
                        background: "linear-gradient(90deg, #0ae448, #3ddb7c)",
                        boxShadow: "0 0 24px rgba(10, 228, 72, 0.35)",
                    }}
                />
            </div>
            <p style={{marginTop: "14px", fontVariantNumeric: "tabular-nums", color: "#6d7380", fontSize: "13px"}}>
                {pct}%
            </p>
        </div>
    );
}
