import { AdminProductForm } from '@/components/admin/AdminProductForm';

export default async function AdminProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AdminProductForm productId={id === 'new' ? null : id} />;
}
