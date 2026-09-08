import type { Metadata } from 'next';
import { Phone, Mail, MapPin, MessageCircle } from 'lucide-react';
import { Card } from '@/components/ui';
import { STORE } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'تواصل معانا',
  description: 'خدمة عملاء سِمة — اتصل بينا أو ابعتلنا رسالة على واتساب.',
  alternates: { canonical: '/contact' },
};

export default function ContactPage() {
  const items = [
    {
      icon: <Phone size={20} />,
      title: 'اتصل بينا',
      value: STORE.phone,
      href: `tel:${STORE.phone}`,
    },
    {
      icon: <MessageCircle size={20} />,
      title: 'واتساب',
      value: STORE.phone,
      href: `https://wa.me/${STORE.whatsapp}`,
    },
    {
      icon: <Mail size={20} />,
      title: 'البريد الإلكتروني',
      value: STORE.email,
      href: `mailto:${STORE.email}`,
    },
    {
      icon: <MapPin size={20} />,
      title: 'العنوان',
      value: STORE.address,
      href: null,
    },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <h1 className="text-3xl font-extrabold">تواصل معانا</h1>
      <p className="mt-3 text-muted leading-8">
        خدمة العملاء متاحة من السبت للخميس، من ١٠ صباحاً لـ ٨ مساءً.
      </p>

      <div className="mt-8 grid sm:grid-cols-2 gap-4">
        {items.map((item) => {
          const inner = (
            <Card className="p-6 h-full hover:border-copper transition-colors">
              <span className="inline-grid place-items-center w-11 h-11 rounded-xl bg-sand/60 text-wine">
                {item.icon}
              </span>
              <h2 className="mt-3 font-bold">{item.title}</h2>
              <p className="mt-1 text-sm text-muted" dir="auto">
                {item.value}
              </p>
            </Card>
          );
          return item.href ? (
            <a
              key={item.title}
              href={item.href}
              target={item.href.startsWith('http') ? '_blank' : undefined}
              rel="noopener noreferrer"
            >
              {inner}
            </a>
          ) : (
            <div key={item.title}>{inner}</div>
          );
        })}
      </div>
    </div>
  );
}
