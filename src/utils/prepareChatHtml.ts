/** SSE 조각 이스케이프 복원 */
function decodeChatEntities(text: string): string {
    return text
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>')
        .replace(/&quot;/gi, '"')
        .replace(/&#39;/g, "'")
        .replace(/&amp;/gi, '&');
}

/** concat된 전체 응답 — 부스 [[M02]] 하이라이트 (카드/본문 분리 없음) */
export function prepareChatHtml(raw: string, streaming = false): string {
    let text = decodeChatEntities(raw);
    if (streaming) {
        text = text.replace(/\[\[[A-Z0-9-]*$/i, '');
    }
    return text.replace(/\[\[([A-Z0-9-]+)\]\]/g, '<span class="envex-booth-highlight">$1</span>');
}

/** SSE `data:` 라인 파싱 */
export function parseSseBuffer(buffer: string, onPayload: (chunk: string) => void): string {
    const lines = buffer.split('\n');
    const rest = lines.pop() ?? '';

    for (const line of lines) {
        const trimmed = line.replace(/\r$/, '');
        if (!trimmed.startsWith('data:')) continue;
        const payload = trimmed.slice(5).replace(/^\s/, '');
        if (!payload || payload === '[DONE]') continue;
        onPayload(payload);
    }

    return rest;
}

export function flushSseRemainder(buffer: string, onPayload: (chunk: string) => void): void {
    if (!buffer.trim()) return;
    parseSseBuffer(`${buffer}\n`, onPayload);
}
