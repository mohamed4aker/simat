import { notFound } from 'next/navigation';

/** أي مسار مش معروف جوه اللغة بيعرض صفحة 404 بتصميم الموقع. */
export default function CatchAll() {
  notFound();
}
