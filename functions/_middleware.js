export async function onRequest(context) {
  const request = context.request;
  const url = new URL(request.url);
  const ua = request.headers.get('User-Agent') || '';
  const country = request.cf?.country;
  const ip = request.headers.get('CF-Connecting-IP');
  const city = request.cf?.city;

  console.log(JSON.stringify({
    ip, country, city, ua,
    path: url.pathname,
    referer: request.headers.get('Referer') || '',
    time: new Date().toISOString()
  }));

  // Bot block
  if (!ua.includes('Mozilla')) {
    return new Response('Access Denied', { status: 403 });
  }

  // Country block
  if (country && country !== 'IN') {
    return new Response('Access Denied - Region Blocked', { status: 403 });
  }

  // .json — sirf allowed domains se fetch ho
  if (url.pathname.endsWith('.json')) {
    const referer = request.headers.get('Referer') || '';
    const allowed = [
      'sportlink10-ajp.pages.dev',
      'sayan-starsport.pages.dev',
      'sayan-jtv.pages.dev',
    ];
    const isAllowed = allowed.some(d => referer.includes(d));

    // Referer empty = page itself se request (same site fetch) = allow
    // Referer set but not in allowed = block
    if (referer && !isAllowed) {
      return new Response('403 - Forbidden', { status: 403 });
    }
  }

  return context.next();
}
