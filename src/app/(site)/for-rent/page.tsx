import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = { title: 'Properties for Rent' };

export default function ForRentPage() {
  redirect('/properties?intent=rent');
}
