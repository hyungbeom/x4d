'use client';

import specStyles from '@/components/bdtec/BdtecSpecModal.module.css';
import styles from './BdtecTankGridCopy.module.css';

type BdtecTankGridCopyProps = {
    visible: boolean;
    onNext?: () => void;
};

/** NEXT 흰 화면 — 상단 스펙 타이틀 (카드 없음, 검은 굵은 텍스트) */
export default function BdtecTankGridCopy({ visible, onNext }: BdtecTankGridCopyProps) {
    return (
        <div
            className={`${styles.root} ${visible ? styles.visible : styles.hidden}`}
            aria-hidden={!visible}
        >
            <h1 className={styles.mainTitle}>BDI-100 Gateway</h1>
            <p className={styles.subTitle}>기본 스펙 및 확장 스펙</p>
            <p className={styles.desc}>
                복수굴뚝에 적용이 가능하면 최대 96ch까지
                <br />
                지원이 가능합니다
            </p>
            {onNext ? (
                <div className={styles.ctaWrap}>
                    <button
                        type="button"
                        className={`${specStyles.trigger} ${specStyles.triggerNext}`}
                        onClick={onNext}
                        aria-label="IoT Gateway 구성도 보기"
                    >
                        <span className={specStyles.triggerNextTitle}>IoT Gateway</span>
                        <span className={specStyles.triggerNextSub}>구성도 보기</span>
                    </button>
                </div>
            ) : null}
        </div>
    );
}
