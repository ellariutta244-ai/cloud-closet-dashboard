'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const SORAA_CREATORS = [
  { email: 'ankishabhargava1989@gmail.com', name: 'Ankisha Bhargava', tiktok: '@ankisha_bhargava', ig: null as string | null, fee: 25, deliverables: ['1x TikTok', 'Connect with founder'] },
  { email: 'melissarod31@yahoo.com', name: 'Melissa Rodriguez', tiktok: '@melissardiaz___', ig: '@melissardiaz', fee: 25, deliverables: ['1x TikTok', 'Connect with founder'] },
  { email: 'gabrielleboyerbaker@gmail.com', name: 'Gabrielle Boyer-Baker', tiktok: '@officiallygabrielle', ig: '@officiallygabrielle', fee: 60, deliverables: ['1x TikTok', '1x IG Story', 'Connect with founder'] },
  { email: 'haileymarieinfluences@gmail.com', name: 'Hailey Malinczak', tiktok: '@haileyymalinczak', ig: '@haileyymalinczak', fee: 25, deliverables: ['1x TikTok'] },
  { email: 'nehadias.fit@gmail.com', name: 'Neha Urbaetis', tiktok: '@nehas_wrld', ig: '@nehas_wrld', fee: 60, deliverables: ['1x IG Reel/TikTok', '1x IG Story'] },
  { email: 'nataliahouse0@gmail.com', name: 'Natalia Alexis', tiktok: '@nataliaalexis__', ig: '@nataliaalexiss', fee: 30, deliverables: ['1x TikTok'] },
] as const;

const SORAA_PASSWORD = 'CloudCloset!';

export default function SoraaLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const normalizedEmail = email.toLowerCase().trim();
    const creator = SORAA_CREATORS.find((c) => c.email === normalizedEmail);

    if (!creator || password !== SORAA_PASSWORD) {
      setError('Invalid email or password. Please try again or contact your campaign manager.');
      setLoading(false);
      return;
    }

    const session = {
      email: creator.email,
      name: creator.name,
      tiktok: creator.tiktok,
      ig: creator.ig,
      fee: creator.fee,
      deliverables: [...creator.deliverables],
    };

    localStorage.setItem('soraa_session', JSON.stringify(session));
    router.push('/soraa/dashboard');
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: '#FAFAF8', color: '#1C1917' }}
    >
      <div className="w-full max-w-md">
        {/* Brand header */}
        <div className="text-center mb-10">
          <h1
            className="text-4xl font-semibold tracking-tight mb-2"
            style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: '#1C1917' }}
          >
            Soraa
          </h1>
          <p className="text-sm font-medium tracking-widest uppercase text-stone-400">
            Cloud Closet Campaign Portal
          </p>
        </div>

        {/* Login card */}
        <div className="bg-white border border-stone-200 rounded-2xl p-8 shadow-sm">
          <p className="text-sm text-stone-500 mb-6 text-center">
            Sign in with your campaign credentials
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-stone-500 uppercase tracking-widest mb-2"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                autoComplete="email"
                className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-stone-500 uppercase tracking-widest mb-2"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••"
                required
                autoComplete="current-password"
                className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-stone-800 text-white py-3 px-4 rounded-xl text-sm font-medium hover:bg-stone-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-stone-400 mt-6">
          Need access? Contact your Cloud Closet campaign manager.
        </p>
      </div>
    </div>
  );
}
