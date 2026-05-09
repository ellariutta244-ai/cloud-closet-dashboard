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

      // Implicit/magic-link flow: #access_token=xxx in hash
      // The browser Supabase client auto-parses hash tokens on getSession()
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.replace('/dashboard');
        return;
      }

      // Watch for the client to process the hash and fire SIGNED_IN
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session) {
          router.replace('/dashboard');
        }
      });

      // Timeout fallback
      const t = setTimeout(() => {
        setMsg('Sign-in failed. Redirecting…');
        setTimeout(() => router.replace('/auth'), 1500);
      }, 6000);

      return () => {
        subscription.unsubscribe();
        clearTimeout(t);
      };
    }

    handle();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50">
      <p className="text-sm text-stone-500">{msg}</p>
    </div>
  );
}
