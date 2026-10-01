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

  // .json block
  if (url.pathname.endsWith('.json')) {
    return new Response('403 - Forbidden', { status: 403 });
  }

  return context.next();
}
