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

  // .json block with whitelist
  if (url.pathname.endsWith('.json')) {
    const ALLOWED_JSON_ORIGINS = [
      'sportlink10-ajp.pages.dev',
      'sayan-starsport.pages.dev',
      'sayan-jtv.pages.dev',
    ];

    const referer = request.headers.get('Referer') || '';
    const origin  = request.headers.get('Origin')  || '';

    const isAllowed = ALLOWED_JSON_ORIGINS.some(domain => {
      const pattern = 'https://' + domain;
      return (
        origin  === pattern ||
        referer === pattern ||
        referer.startsWith(pattern + '/')
      );
    });

    if (!isAllowed) {
      return new Response('403 - Forbidden', { status: 403 });
    }
  }

  return context.next();
}
