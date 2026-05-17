'use client';

import { useEffect, useRef } from 'react';
import PageWrapper from '@/utils/ui/PageWrapper';
import TransitionLink from '@/utils/ui/TransitionLink';
import { gsap } from '@/lib/brochureGsap';
import styles from './contactus.module.css';

const CONTACT = {
  org: '한국환경보전원 ENVEX 사무국',
  phone: '02-2286-0000',
  phoneHref: 'tel:0222860000',
  email: 'envex@keco.or.kr',
  hours: '평일 09:00 – 18:00',
  hoursNote: '점심 12:00 – 13:00 · 주말·공휴일 휴무',
  address: '서울특별시 성동구 광나루로 320',
};

export default function ContactUsPage() {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    gsap.fromTo(
      card,
      { opacity: 0, y: 36, scale: 0.96 },
      { opacity: 1, y: 0, scale: 1, duration: 0.65, ease: 'power3.out', delay: 0.35 },
    );
  }, []);

  return (
    <PageWrapper type="blindsReverse">
      <div className={styles.page}>
        <span className={styles.bgOrb1} aria-hidden />
        <span className={styles.bgOrb2} aria-hidden />

        <div ref={cardRef} className={styles.card}>
          <div className={styles.badgeRow}>
            <span className={styles.badge}>
              <span className={styles.badgeDot} aria-hidden />
              Contact · Sample
            </span>
          </div>

          <h1 className={styles.title}>문의 안내</h1>

          <p className={styles.lead}>
            전시·참가·관람 관련 문의는{' '}
            <strong>{CONTACT.org}</strong>
            으로 연락해 주세요. 빠른 안내를 위해 문의 유형을 함께 적어 주시면
            감사합니다.
          </p>

          <p className={styles.notice}>
            아래 연락처는 화면 구성을 위한 <strong>샘플</strong>입니다. 실제
            문의는 환경보전원 공식 채널을 이용해 주세요.
          </p>

          <ul className={styles.contactList}>
            <li className={styles.contactItem}>
              <span className={styles.contactIcon} aria-hidden>
                📞
              </span>
              <div className={styles.contactBody}>
                <span className={styles.contactLabel}>전화 문의</span>
                <a href={CONTACT.phoneHref} className={styles.contactValue}>
                  {CONTACT.phone}
                </a>
                <span className={styles.contactHint}>ARS 1번 · 참가·관람</span>
              </div>
            </li>

            <li className={styles.contactItem}>
              <span className={styles.contactIcon} aria-hidden>
                ✉️
              </span>
              <div className={styles.contactBody}>
                <span className={styles.contactLabel}>이메일</span>
                <a
                  href={`mailto:${CONTACT.email}`}
                  className={styles.contactValue}
                >
                  {CONTACT.email}
                </a>
                <span className={styles.contactHint}>
                  1–2영업일 내 회신 (샘플)
                </span>
              </div>
            </li>

            <li className={styles.contactItem}>
              <span className={styles.contactIcon} aria-hidden>
                🕐
              </span>
              <div className={styles.contactBody}>
                <span className={styles.contactLabel}>운영 시간</span>
                <span className={styles.contactValue}>{CONTACT.hours}</span>
                <span className={styles.contactHint}>{CONTACT.hoursNote}</span>
              </div>
            </li>

            <li className={styles.contactItem}>
              <span className={styles.contactIcon} aria-hidden>
                📍
              </span>
              <div className={styles.contactBody}>
                <span className={styles.contactLabel}>주소</span>
                <span className={styles.contactValue}>{CONTACT.address}</span>
                <span className={styles.contactHint}>ENVEX 사무국 (샘플)</span>
              </div>
            </li>
          </ul>

          <div className={styles.actions}>
            <a href={CONTACT.phoneHref} className={styles.primaryBtn}>
              전화 문의하기
            </a>
            <TransitionLink href="/" className={styles.secondaryBtn} type="blinds">
              홈으로 돌아가기
            </TransitionLink>
          </div>

          <p className={styles.footerNote}>
            ENVEX World · Contact Us 샘플 페이지
          </p>
        </div>
      </div>
    </PageWrapper>
  );
}
