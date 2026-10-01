const SECRET = 'sportlink2024xyz';

export async function onRequest(context) {
  const request = context.request;
  const url = new URL(request.url);
  const ua = request.headers.get('User-Agent') || '';
  const country = request.cf?.country;

  // Bot block
  if (!ua.includes('Mozilla')) {
    return new Response('Access Denied', { status: 403 });
  }

  // Country block
  if (country && country !== 'IN') {
    return new Response('Access Denied - Region Blocked', { status: 403 });
  }

  // Token check
  if (url.pathname.endsWith('.m3u') || url.pathname.endsWith('.json')) {
    const token = url.searchParams.get('token');
    const ts = url.searchParams.get('ts');

    if (!token || !ts) {
      return new Response('403 - Missing Token', { status: 403 });
    }

    const now = Date.now();
    if (now - parseInt(ts) > 3600000) {
      return new Response('403 - Token Expired', { status: 403 });
    }

    const expected = btoa(`${SECRET}:${ts}`).replace(/=/g, '');
    if (token !== expected) {
      return new Response('403 - Invalid Token', { status: 403 });
    }
  }

  return context.next();
}
