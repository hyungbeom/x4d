const CHAT_API_BASE = process.env.CHAT_API_BASE ?? 'http://localhost:8080';

/** AI 채팅 SSE — Spring(8080) 등 백엔드로 스트림 프록시 (브라우저는 동일 출처만 호출) */
export async function GET(
    request: Request,
    context: { params: Promise<{ companyId: string }> },
) {
    const { companyId } = await context.params;
    const { searchParams } = new URL(request.url);
    const message = searchParams.get('message') ?? '';
    const chatId = searchParams.get('chatId') ?? '';

    const upstream = new URL(`${CHAT_API_BASE}/api/chat/${encodeURIComponent(companyId)}`);
    upstream.searchParams.set('message', message);
    upstream.searchParams.set('chatId', chatId);

    let upstreamRes: Response;
    try {
        upstreamRes = await fetch(upstream, {
            headers: { Accept: 'text/event-stream' },
            cache: 'no-store',
        });
    } catch {
        return new Response('upstream unreachable', { status: 502 });
    }

    if (!upstreamRes.ok || !upstreamRes.body) {
        return new Response(upstreamRes.statusText || 'upstream error', {
            status: upstreamRes.status,
        });
    }

    return new Response(upstreamRes.body, {
        status: 200,
        headers: {
            'Content-Type': 'text/event-stream; charset=utf-8',
            'Cache-Control': 'no-cache, no-transform',
            Connection: 'keep-alive',
        },
    });
}
