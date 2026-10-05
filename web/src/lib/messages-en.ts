/**
 * رسائل الخطأ اللي راجعة من قاعدة البيانات مكتوبة عربي.
 * الملف ده بيترجمها لو الزائر فاتح الموقع بالإنجليزي.
 */
const exact: Record<string, string> = {
  'الكود ده مش موجود': 'This code does not exist',
  'الكود ده متوقّف حالياً': 'This code is currently inactive',
  'الكود ده انتهت صلاحيته': 'This code has expired',
  'الكود ده خلص عدد مرات استخدامه': 'This code has reached its usage limit',
  'اكتب كود الخصم': 'Enter a discount code',
  'مش قادرين نتحقق من الكود دلوقتي': 'We could not check the code right now',
  'الاسم مطلوب': 'Please enter your full name',
  'رقم موبايل غير صحيح': 'Invalid mobile number',
  'العربة فاضية': 'Your cart is empty',
  'الحجم المطلوب مش متاح': 'The selected size is not available',
  'منتج مش موجود أو موقوف': 'One of the products is no longer available',
  'حصلت مشكلة وإحنا بنسجّل الطلب، جرب تاني':
    'Something went wrong while placing your order. Please try again.',
  'مش قادرين نكمّل الطلب': 'We could not complete the order',
  'مش قادرين نجيب الطلب دلوقتي': 'We could not load the order right now',
  'مفيش طلب بالبيانات دي — راجع رقم الطلب والموبايل':
    'No order matches these details — check the order number and mobile',
  'تتبّع الطلبات بيشتغل بعد ربط قاعدة البيانات — راجع خطوات الإعداد.':
    'Order tracking works once the store database is connected.',
};

export function toEnglish(message: string | undefined): string | undefined {
  if (!message) return message;
  if (exact[message]) return exact[message];
  let m = message.match(/^الكود ده للطلبات من (\d+) ج\.م$/);
  if (m) return `This code is for orders of ${m[1]} EGP or more`;
  m = message.match(/^الكمية المطلوبة من «(.+)» مش متوفرة$/);
  if (m) return `The requested quantity of “${m[1]}” is not available`;
  if (/^خصم (\d+)%$/.test(message)) return message.replace(/^خصم (\d+)%$/, '$1% off');
  if (/^خصم (\d+) ج\.م$/.test(message)) {
    return message.replace(/^خصم (\d+) ج\.م$/, '$1 EGP off');
  }
  return message;
}

export function localizeMessage(message: string | undefined, lang: string) {
  return lang === 'en' ? toEnglish(message) : message;
}
