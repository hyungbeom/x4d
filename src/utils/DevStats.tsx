'use client';

import { useEffect } from 'react';
import StatsImpl from 'stats.js';

/** Spline 등 Canvas 밖 페이지용 — requestAnimationFrame 기준 FPS */
export function DomStats() {
    useEffect(() => {
        const stats = new StatsImpl();
        stats.showPanel(0);
        stats.dom.style.cssText =
            'position:fixed;top:0;left:0;z-index:99999;pointer-events:none;';
        document.body.appendChild(stats.dom);

        let frame = 0;
        const loop = () => {
            stats.begin();
            stats.end();
            frame = requestAnimationFrame(loop);
        };
        frame = requestAnimationFrame(loop);

        return () => {
            cancelAnimationFrame(frame);
            stats.dom.remove();
        };
    }, []);

    return null;
}
