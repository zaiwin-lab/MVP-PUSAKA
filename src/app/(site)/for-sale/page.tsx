import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = { title: 'Properties for Sale' };

export default function ForSalePage() {
  redirect('/properties?intent=sale');
}
