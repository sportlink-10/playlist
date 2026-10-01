export async function onRequest(context) {
  const request = context.request;
  const ua = request.headers.get('User-Agent') || '';
  const referer = request.headers.get('Referer') || '';

  // Bot block — no Mozilla = bot/script
  if (!ua.includes('Mozilla')) {
    return new Response('Access Denied', { status: 403 });
  }

  // Allowed domains only
  const allowed = [
    'sportlink10-ajp.pages.dev',
    'sayan-starsport.pages.dev',
    'sayan-jtv.pages.dev',
  ];

  const isAllowed = allowed.some(d => referer.includes(d));

  // Empty referer = direct browser open = allow
  // Referer set hai but not in allowed list = block
  if (referer && !isAllowed) {
    return new Response('403 Forbidden - Hotlink Blocked', {
      status: 403,
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  return context.next();
}
