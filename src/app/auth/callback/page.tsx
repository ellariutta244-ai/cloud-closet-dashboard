'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [msg, setMsg] = useState('Signing you in…');

  useEffect(() => {
    const supabase = createClient();

    async function handle() {
      // PKCE flow: ?code=xxx
      const code = new URLSearchParams(window.location.search).get('code');
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          setMsg('Sign-in failed. Redirecting…');
          setTimeout(() => router.replace('/auth'), 1500);
        } else {
          router.replace('/dashboard');
        }
        return;
      }

      // Implicit/magic-link flow: tokens are in the URL hash
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');

      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
        if (error) {
          setMsg('Sign-in failed. Redirecting…');
          setTimeout(() => router.replace('/auth'), 1500);
        } else {
          router.replace('/dashboard');
        }
        return;
      }

      // No code or hash tokens — nothing to work with
      setMsg('Sign-in failed. Redirecting…');
      setTimeout(() => router.replace('/auth'), 1500);
    }

    handle();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50">
      <p className="text-sm text-stone-500">{msg}</p>
    </div>
  );
}
