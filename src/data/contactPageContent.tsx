import type { ContactUsScreenProps } from '@/components/contact/ContactUsScreen';

export const ENVEX_CONTACT_PAGE: ContactUsScreenProps = {
    backHref: '/',
    backAriaLabel: '홈으로 돌아가기',
    phoneHref: 'tel:0222860000',
    lead: (
        <>
            전시·참가·관람 관련 문의는 <strong>한국환경보전원 ENVEX 사무국</strong>
            으로 연락해 주세요. 빠른 안내를 위해 문의 유형을 함께 적어 주시면 감사합니다.
        </>
    ),
    rows: [
        {
            key: 'phone',
            icon: 'phone',
            primary: '02-2286-0000',
            href: 'tel:0222860000',
            secondary: 'ARS 1번 · 참가·관람',
        },
        {
            key: 'email',
            icon: 'mail',
            primary: 'envex@keco.or.kr',
            href: 'mailto:envex@keco.or.kr',
            secondary: '1–2영업일 내 회신',
        },
        {
            key: 'hours',
            icon: 'clock',
            primary: '운영시간 평일 09:00 – 18:00',
            secondary: '점심 12:00 – 13:00 · 주말·공휴일 휴무',
        },
        {
            key: 'address',
            icon: 'pin',
            primary: '서울특별시 성동구 광나루로 320',
            secondary: 'ENVEX 사무국',
        },
    ],
};

export const BDTEC_CONTACT_PAGE: ContactUsScreenProps = {
    backHref: '/brochure/bdtec',
    backAriaLabel: '비디텍 브로슈어로 돌아가기',
    phoneHref: 'tel:0314245548',
    lead: (
        <>
            환경 IoT · BDI-100 제품 및 기술 문의는 <strong>주식회사 비디텍</strong>
            으로 연락해 주세요. 빠른 안내를 위해 문의 유형을 함께 적어 주시면 감사합니다.
        </>
    ),
    rows: [
        {
            key: 'phone',
            icon: 'phone',
            primary: '031-424-5548',
            href: 'tel:0314245548',
            secondary: '본사 · 제품·기술 문의',
        },
        {
            key: 'email',
            icon: 'mail',
            primary: 'info@bdtec.co.kr',
            href: 'mailto:info@bdtec.co.kr',
            secondary: '1–2영업일 내 회신',
        },
        {
            key: 'hours',
            icon: 'clock',
            primary: '운영시간 평일 09:00 – 18:00',
            secondary: '점심 12:00 – 13:00 · 주말·공휴일 휴무',
        },
        {
            key: 'address',
            icon: 'pin',
            primary: '경기도 안양시 동안구 학의로 268, 안양메가밸리 625호',
            secondary: '비디텍 본사',
        },
    ],
};
