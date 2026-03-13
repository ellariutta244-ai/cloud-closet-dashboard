import { redirect } from 'next/navigation';

export default function RootPage() {
  // Acts as the Auth gate redirecting to /dashboard
  redirect('/dashboard');
}