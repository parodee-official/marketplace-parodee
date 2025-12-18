import { redirect } from 'next/navigation';

export default function Home() {
  // Langsung arahkan ke /collect
  redirect('/collect');
}