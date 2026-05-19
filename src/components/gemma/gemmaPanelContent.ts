export type GemmaPanelContent = {
    title: string;
    desc: string;
    extra?: string;
};

export const GEMMA_PANEL_CONTENT: Record<number, GemmaPanelContent> = {
    1: {
        title: '수질모니터링',
        desc: 'pH·DO·탁도·수온 등 핵심 수질 항목을 현장 조건에 맞게 실시간으로 측정·기록합니다.',
        extra: '알람·이력 조회로 이상 징후를 빠르게 파악할 수 있습니다.',
    },
    2: {
        title: '하폐수처리',
        desc: '하·폐수 처리 공정의 운전 상태를 연속 모니터링하여 공정 안정성을 높입니다.',
        extra: '처리 효율과 배출 기준 대응을 위한 데이터 기반 운영을 지원합니다.',
    },
    3: {
        title: '현장 솔루션',
        desc: '설치 환경·공정 규모에 맞춘 센서·수집·표시 구성을 현장 맞춤으로 설계합니다.',
        extra: '옥외·공정 현장을 고려한 내구 설계와 설치·교육을 제공합니다.',
    },
    4: {
        title: '원격관제',
        desc: '유·무선망을 통해 원격으로 수질·환경 데이터를 수집·전송합니다.',
        extra: '관리자는 PC·모바일에서 현황을 확인하고 운영 의사결정에 활용할 수 있습니다.',
    },
    5: {
        title: 'A/S 지원',
        desc: '설치 이후 점검·교정·유지보수까지 전 과정 기술 지원을 제공합니다.',
        extra: '현장 대응과 부품·소모품 관리로 장기 안정 운영을 돕습니다.',
    },
};
