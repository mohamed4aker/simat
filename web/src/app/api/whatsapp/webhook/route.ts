import { createHmac, timingSafeEqual } from 'node:crypto';
import type { NextRequest } from 'next/server';
import { serviceSupabase } from '@/lib/supabase-service';
import { sendText } from '@/lib/whatsapp';

/**
 * Webhook واتساب (Meta) — بيستقبل ضغطة العميل على «تأكيد» أو «إلغاء».
 *
 * الإعداد في Meta → WhatsApp → Configuration → Webhook:
 *   Callback URL:  https://<الدومين>/api/whatsapp/webhook
 *   Verify token:  نفس قيمة WHATSAPP_VERIFY_TOKEN
 *   Subscribe:     messages
 */

// التحقق الأول اللي Meta بتعمله لما تضيف الرابط.
export async function GET(request: NextRequest) {
  const p = request.nextUrl.searchParams;
  const expected = process.env.WHATSAPP_VERIFY_TOKEN;
  if (expected && p.get('hub.mode') === 'subscribe' && p.get('hub.verify_token') === expected) {
    return new Response(p.get('hub.challenge') ?? '', { status: 200 });
  }
  return new Response('Forbidden', { status: 403 });
}

/** بنتأكد إن الطلب جاي من Meta فعلاً (توقيع بالـ App Secret). */
function validSignature(raw: string, header: string | null): boolean {
  const secret = process.env.WHATSAPP_APP_SECRET;
  if (!secret || !header?.startsWith('sha256=')) return false;
  const expected = Buffer.from(
    `sha256=${createHmac('sha256', secret).update(raw).digest('hex')}`,
  );
  const given = Buffer.from(header);
  return expected.length === given.length && timingSafeEqual(expected, given);
}

interface IncomingMessage {
  from: string;
  type: string;
  button?: { payload?: string; text?: string };
  interactive?: { button_reply?: { id?: string } };
}

const REPLIES = {
  confirmed:
    'تم تأكيد طلبك ✅ شكراً لثقتك في سِمة. هنجهز الطلب ونبعتلك أول ما يتشحن.',
  cancelled:
    'تم إلغاء طلبك. لو محتاج أي مساعدة أو حابب تطلب تاني، احنا موجودين هنا.',
} as const;

export async function POST(request: NextRequest) {
  const raw = await request.text();
  if (!validSignature(raw, request.headers.get('x-hub-signature-256'))) {
    return new Response('Invalid signature', { status: 401 });
  }

  let body: { entry?: { changes?: { value?: { messages?: IncomingMessage[] } }[] }[] };
  try {
    body = JSON.parse(raw);
  } catch {
    return new Response('Bad request', { status: 400 });
  }

  const db = serviceSupabase();
  const messages = (body.entry ?? []).flatMap((e) =>
    (e.changes ?? []).flatMap((c) => c.value?.messages ?? []),
  );

  for (const msg of messages) {
    const payload = msg.button?.payload ?? msg.interactive?.button_reply?.id ?? '';
    const match = payload.match(/^(CONFIRM|CANCEL):(.+)$/);
    if (!match || !db) continue;

    const { data } = await db.rpc('whatsapp_order_reply', {
      p_number: match[2],
      p_phone: msg.from,
      p_action: match[1] === 'CONFIRM' ? 'confirm' : 'cancel',
    });
    const result = data as { ok?: boolean; changed?: boolean; status?: string } | null;
    if (result?.ok && result.changed && (result.status === 'confirmed' || result.status === 'cancelled')) {
      await sendText(msg.from, REPLIES[result.status]);
    }
  }

  // Meta لازم تاخد 200 بسرعة وإلا هتعيد الإرسال.
  return new Response('OK', { status: 200 });
}
