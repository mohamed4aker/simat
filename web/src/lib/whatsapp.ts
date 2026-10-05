/**
 * رسايل واتساب للعملاء من رقم سِمة — WhatsApp Business Cloud API (Meta).
 *
 * بعد كل طلب بيوصل للعميل قالب «تأكيد الطلب» فيه تفاصيل الطلب وزرارين
 * (تأكيد / إلغاء). لما العميل يدوس على زرار، Meta بتبعت للموقع على
 * /api/whatsapp/webhook وبتتغير حالة الطلب لوحدها.
 *
 * بيشتغل بس لما متغيرات البيئة دي تتحط (غير كده بيتجاهل بهدوء):
 *   WHATSAPP_TOKEN            توكن دائم (System User) من Meta Business
 *   WHATSAPP_PHONE_NUMBER_ID  رقم تعريف رقم سِمة في WhatsApp Manager
 *   WHATSAPP_TEMPLATE         اسم القالب (الافتراضي: order_confirmation)
 *   WHATSAPP_TEMPLATE_LANG    لغة القالب (الافتراضي: ar)
 *
 * نص القالب اللي يتسجل في WhatsApp Manager موجود في
 * docs/واتساب-تأكيد-الطلبات.md
 */
const API_VERSION = process.env.WHATSAPP_API_VERSION || 'v21.0';
const API_BASE = process.env.WHATSAPP_API_BASE || 'https://graph.facebook.com';

function config() {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneId) return null;
  return {
    token,
    phoneId,
    template: process.env.WHATSAPP_TEMPLATE || 'order_confirmation',
    lang: process.env.WHATSAPP_TEMPLATE_LANG || 'ar',
  };
}

export const whatsappEnabled = () => config() !== null;

/** 01012345678 → 201012345678 */
export function toInternational(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('20')) return digits;
  if (digits.startsWith('0')) return `2${digits}`;
  return `20${digits}`;
}

/** واتساب مش بيقبل سطور جديدة أو مسافات كتير جوه متغيرات القالب. */
function clean(value: string, max = 300): string {
  const text = value.replace(/[\n\r\t]+/g, ' ').replace(/ {4,}/g, '   ').trim();
  return (text || '-').slice(0, max);
}

async function send(body: Record<string, unknown>): Promise<boolean> {
  const cfg = config();
  if (!cfg) return false;
  try {
    const res = await fetch(`${API_BASE}/${API_VERSION}/${cfg.phoneId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${cfg.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messaging_product: 'whatsapp', ...body }),
    });
    if (!res.ok) {
      console.error('[whatsapp] send failed', res.status, await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error('[whatsapp] send error', err);
    return false;
  }
}

export interface OrderMessage {
  phone: string;
  name: string;
  orderNumber: string;
  items: string;
  total: number;
  address: string;
}

/**
 * «أهلاً {{1}} — تم استلام طلبك … رقم الطلب {{2}} … المنتجات {{3}}
 *  … مبلغ التحصيل {{4}} … العنوان {{5}}» + زرار تأكيد وزرار إلغاء.
 */
export async function sendOrderConfirmation(order: OrderMessage): Promise<boolean> {
  const cfg = config();
  if (!cfg) return false;
  const firstName = order.name.trim().split(/\s+/)[0] || order.name;
  return send({
    to: toInternational(order.phone),
    type: 'template',
    template: {
      name: cfg.template,
      language: { code: cfg.lang },
      components: [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: clean(firstName, 60) },
            { type: 'text', text: clean(order.orderNumber, 40) },
            { type: 'text', text: clean(order.items, 500) },
            { type: 'text', text: clean(Math.round(order.total).toLocaleString('en-US'), 20) },
            { type: 'text', text: clean(order.address, 300) },
          ],
        },
        {
          type: 'button',
          sub_type: 'quick_reply',
          index: '0',
          parameters: [{ type: 'payload', payload: `CONFIRM:${order.orderNumber}` }],
        },
        {
          type: 'button',
          sub_type: 'quick_reply',
          index: '1',
          parameters: [{ type: 'payload', payload: `CANCEL:${order.orderNumber}` }],
        },
      ],
    },
  });
}

/** رسالة نصية عادية — مسموحة بس خلال 24 ساعة من آخر رسالة من العميل. */
export async function sendText(phone: string, text: string): Promise<boolean> {
  return send({ to: toInternational(phone), type: 'text', text: { body: text } });
}
