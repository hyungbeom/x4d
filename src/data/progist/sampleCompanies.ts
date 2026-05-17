export type CompanyListItem = {
    id: string;
    nameEn: string;
    nameKo: string;
    booth: string;
    logoInitials: string;
    logoColor: string;
};

/** 구역별 기업 리스트 샘플 (20개) */
export const SAMPLE_COMPANIES: CompanyListItem[] = [
    { id: '1', nameEn: 'SEIL MEASUREMENT TECHNOLOGY', nameKo: '세일분석기술 주식회사', booth: 'G04', logoInitials: 'SM', logoColor: '#1e5a8a' },
    { id: '2', nameEn: 'Ecosystech', nameKo: '에코시스텍(주)', booth: 'G14', logoInitials: 'EC', logoColor: '#2d8a6e' },
    { id: '3', nameEn: 'ABB', nameKo: '에이비비 코리아', booth: 'B05', logoInitials: 'AB', logoColor: '#c41230' },
    { id: '4', nameEn: 'ROYAL PRECISION IND. CO., LTD.', nameKo: '(주)로얄정공', booth: 'C04', logoInitials: 'RP', logoColor: '#4a5568' },
    { id: '5', nameEn: 'Hanwha Solutions', nameKo: '한화솔루션(주)', booth: 'A12', logoInitials: 'HS', logoColor: '#f97316' },
    { id: '6', nameEn: 'K-water Tech', nameKo: '케이워터테크', booth: 'W03', logoInitials: 'KW', logoColor: '#0ea5e9' },
    { id: '7', nameEn: 'GreenSensor Lab', nameKo: '(주)그린센서랩', booth: 'D18', logoInitials: 'GS', logoColor: '#16a34a' },
    { id: '8', nameEn: 'AirGuard Systems', nameKo: '에어가드시스템즈', booth: 'B22', logoInitials: 'AG', logoColor: '#6366f1' },
    { id: '9', nameEn: 'CarbonZero Partners', nameKo: '탄소제로파트너스', booth: 'E09', logoInitials: 'CZ', logoColor: '#059669' },
    { id: '10', nameEn: 'Metro Analytics', nameKo: '메트로애널리틱스', booth: 'F11', logoInitials: 'MA', logoColor: '#7c3aed' },
    { id: '11', nameEn: 'Pacific Enviro', nameKo: '퍼시픽엔비로', booth: 'G08', logoInitials: 'PE', logoColor: '#0284c7' },
    { id: '12', nameEn: 'CleanFlow Korea', nameKo: '(주)클린플로우코리아', booth: 'H02', logoInitials: 'CF', logoColor: '#14b8a6' },
    { id: '13', nameEn: 'Institute of Eco Policy', nameKo: '생태정책연구원', booth: 'I15', logoInitials: 'IE', logoColor: '#475569' },
    { id: '14', nameEn: 'Nexus Measurement', nameKo: '넥서스측정', booth: 'C19', logoInitials: 'NM', logoColor: '#dc2626' },
    { id: '15', nameEn: 'BlueRiver Instruments', nameKo: '블루리버인스트루먼트', booth: 'W07', logoInitials: 'BR', logoColor: '#2563eb' },
    { id: '16', nameEn: 'SolarGrid Asia', nameKo: '솔라그리드아시아', booth: 'E21', logoInitials: 'SG', logoColor: '#eab308' },
    { id: '17', nameEn: 'EnviroLink Global', nameKo: '엔바이로링크글로벌', booth: 'P06', logoInitials: 'EL', logoColor: '#0891b2' },
    { id: '18', nameEn: 'Daehan Filter Tech', nameKo: '대한필터텍', booth: 'B14', logoInitials: 'DF', logoColor: '#64748b' },
    { id: '19', nameEn: 'SmartPavilion EU', nameKo: '스마트파빌리온 EU', booth: 'P12', logoInitials: 'SP', logoColor: '#4f46e5' },
    { id: '20', nameEn: 'Urban Climate Lab', nameKo: '도시기후연구소', booth: 'A08', logoInitials: 'UC', logoColor: '#0d9488' },
    {
        id: '21',
        nameEn: 'Korea Green Resources Co., Ltd.',
        nameKo: '한국그린자원(주)',
        booth: 'A01',
        logoInitials: 'KG',
        logoColor: '#15803d',
    },
    {
        id: '22',
        nameEn: 'SI Membrane Co., Ltd.',
        nameKo: '(주)에스아이멤브레인',
        booth: 'A02',
        logoInitials: 'SI',
        logoColor: '#0369a1',
    },
];
