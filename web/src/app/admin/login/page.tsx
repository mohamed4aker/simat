import type { Metadata } from 'next';
import { AdminLogin } from '@/components/admin/AdminLogin';

export const metadata: Metadata = {
  title: 'دخول المسؤولين',
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return <AdminLogin />;
}
