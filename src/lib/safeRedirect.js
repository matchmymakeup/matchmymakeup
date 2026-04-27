// Open-redirect guard for ?redirect= params. Same-origin in-app paths only;
// rejects null/undefined/external URLs and protocol-relative (//evil.com).
export function safeRedirect(target, fallback = '/Home') {
  if (!target || !target.startsWith('/') || target.startsWith('//')) return fallback
  return target
}
