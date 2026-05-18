import companyListJson from './companyList.json';

/** ENVEX 참가기업 로고 베이스 URL */
export const ENVEX_LOGO_BASE_URL = 'https://envex.or.kr/board/upload_file/ENVEX_form2/';

export type EnvexCompanyRecord = {
    Com_Code: number;
    Com_Name_H: string;
    Com_Name_E: string;
    boot: string;
    ON_CATE_KOR: string;
    Logo: string;
    Com_Homepage?: string;
    Com_IsEntry?: string;
};

export type CompanyListItem = {
    id: string;
    nameEn: string;
    nameKo: string;
    booth: string;
    homepage?: string;
    logoUrl?: string;
    /** 로고 없을 때 폴백 */
    logoInitials?: string;
    logoColor?: string;
};

/** Com_Homepage → 새 탭에서 열 수 있는 URL */
export function resolveCompanyHomepageUrl(homepage: string | undefined): string | null {
    const raw = normalizeField(homepage);
    if (!raw) return null;
    if (/^https?:\/\//i.test(raw)) return raw;
    return `https://${raw}`;
}

export function openCompanyHomepage(homepage: string | undefined) {
    const url = resolveCompanyHomepageUrl(homepage);
    if (!url) return;
    window.open(url, '_blank', 'noopener,noreferrer');
}

/** 홈 3D 구역(activePanelId) → companyList.json ON_CATE_KOR */
export const PANEL_ID_TO_ON_CATE_KOR: Record<number, string> = {
    1: '수질',
    2: '대기',
    3: '측정분석',
    4: '탄소중립',
    5: '외국관',
    6: '기관 및 단체/홍보',
};

const records = companyListJson as EnvexCompanyRecord[];

function normalizeField(value: unknown): string {
    const text = String(value ?? '').trim();
    if (!text || text.toUpperCase() === 'NULL') return '';
    return text;
}

export function buildEnvexLogoUrl(logoFile: string): string | undefined {
    const file = normalizeField(logoFile);
    if (!file) return undefined;
    if (/^https?:\/\//i.test(file)) return file;
    const encoded = file.split('/').map((segment) => encodeURIComponent(segment)).join('/');
    return `${ENVEX_LOGO_BASE_URL}${encoded}`;
}

function toInitials(nameEn: string, nameKo: string): string {
    const source = nameEn || nameKo;
    const parts = source.replace(/[^a-zA-Z0-9가-힣\s]/g, ' ').split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
}

function recordToListItem(record: EnvexCompanyRecord): CompanyListItem | null {
    const booth = normalizeField(record.boot);
    if (!booth) return null;

    const nameEn = normalizeField(record.Com_Name_E);
    const nameKo = normalizeField(record.Com_Name_H);
    if (!nameEn && !nameKo) return null;

    const logoUrl = buildEnvexLogoUrl(record.Logo);

    const homepage = normalizeField(record.Com_Homepage);

    return {
        id: String(record.Com_Code),
        nameEn: nameEn || nameKo,
        nameKo: nameKo || nameEn,
        booth,
        homepage: homepage || undefined,
        logoUrl,
        logoInitials: toInitials(nameEn, nameKo),
        logoColor: '#d9d9d9',
    };
}

/** ON_CATE_KOR 구역명으로 참가기업 목록 (부스 번호 있는 업체만) */
export function getCompaniesByOnCateKor(onCateKor: string): CompanyListItem[] {
    const category = normalizeField(onCateKor);
    if (!category) return [];

    return records
        .filter((record) => normalizeField(record.ON_CATE_KOR) === category)
        .map(recordToListItem)
        .filter((item): item is CompanyListItem => item !== null)
        .sort((a, b) => a.booth.localeCompare(b.booth, 'en', { numeric: true }));
}

/** 홈 구역 패널 ID → 해당 구역 참가기업 */
export function getCompaniesByPanelId(panelId: number): CompanyListItem[] {
    const category = PANEL_ID_TO_ON_CATE_KOR[panelId];
    if (!category) return [];
    return getCompaniesByOnCateKor(category);
}
