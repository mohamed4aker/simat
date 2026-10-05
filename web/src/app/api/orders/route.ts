import type { NextRequest } from 'next/server';
import { processOrder } from '@/lib/orders';

/**
 * تسجيل طلب من الأبلكيشن. نفس قواعد الموقع بالظبط: الأسعار بتتحسب
 * في قاعدة البيانات، وبعد الطلب بتتبعت رسالة الواتساب.
 *
 *   POST /api/orders   (JSON بنفس حقول CheckoutPayload)
 */
export async function POST(request: NextRequest) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ ok: false, error: 'Invalid JSON' }, { status: 400 });
  }
  if (!payload || typeof payload !== 'object') {
    return Response.json({ ok: false, error: 'Invalid body' }, { status: 400 });
  }
  const result = await processOrder(payload as Record<string, never>, 'app');
  return Response.json(result, { status: result.ok ? 200 : 422 });
}
