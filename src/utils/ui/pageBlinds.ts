import gsap from 'gsap';

/** PageWrapper가 마운트한 블라인드 DOM만 대상으로 삼기 위한 헬퍼 */
export function getPageBlindsColumns(): HTMLElement[] | null {
    const container = document.getElementById('blinds-container');
    if (!container?.isConnected) return null;
    const columns = container.querySelectorAll<HTMLElement>('.blind-column');
    return columns.length > 0 ? Array.from(columns) : null;
}

export function showPageBlindsContainer() {
    const container = document.getElementById('blinds-container');
    if (!container?.isConnected) return false;
    gsap.set(container, { visibility: 'visible', display: 'flex' });
    return true;
}

export function hidePageBlindsContainer() {
    const container = document.getElementById('blinds-container');
    if (!container?.isConnected) return;
    gsap.set(container, { display: 'none', visibility: 'hidden' });
}
