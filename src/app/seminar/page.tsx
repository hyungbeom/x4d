'use client';

import {useEffect, useRef, useState} from 'react';
import {usePageTransition} from '@/utils/ui/usePageTransition';
import EnvexSeminarModal from '@/components/envex/EnvexSeminarModal';
import styles from './page.module.css';

export default function SeminarPage() {
    const navigate = usePageTransition();
    const triggerRef = useRef<HTMLButtonElement>(null);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const id = window.requestAnimationFrame(() => setOpen(true));
        return () => window.cancelAnimationFrame(id);
    }, []);

    return (
        <main className={styles.main}>
            <header className={styles.topBar}>
                <button
                    type="button"
                    className={styles.backBtn}
                    onClick={() => navigate('/', 'blinds')}
                >
                    ← 브로슈어로
                </button>
            </header>

            <button
                ref={triggerRef}
                type="button"
                className={styles.openBtn}
                onClick={() => setOpen(true)}
                aria-expanded={open}
            >
                세미나 일정
            </button>

            <EnvexSeminarModal
                open={open}
                onClose={() => navigate('/', 'blinds')}
                triggerRef={triggerRef}
            />
        </main>
    );
}
