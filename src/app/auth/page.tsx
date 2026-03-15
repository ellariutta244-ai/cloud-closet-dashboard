"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';

const TAGLINE = "Your closet. Your archive. Your cloud.";

export default function AuthPage() {
  const [supabase] = useState(() => createClient());
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tagline, setTagline] = useState('');
  const [typingDone, setTypingDone] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) router.push('/dashboard');
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.push('/dashboard');
    });

    let i = 0;
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        i++;
        setTagline(TAGLINE.slice(0, i));
        if (i >= TAGLINE.length) {
          clearInterval(interval);
          setTypingDone(true);
        }
      }, 42);
      return () => clearInterval(interval);
    }, 900);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, [supabase, router]);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setLoading(true);
    setError('');
    const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (err) setError(err.message);
  }

  return (
    <>
      {/* Jost — closest free match to Maxeville's geometric proportions */}
      <link
        rel="preconnect"
        href="https://fonts.googleapis.com"
      />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Jost:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&display=swap"
        rel="stylesheet"
      />

      <style>{`
        .cc-root * { font-family: 'Jost', 'Arial', sans-serif; }

        @keyframes gradientDrift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }

        .cc-bg {
          background: linear-gradient(
            -45deg,
            #f0e4d8, #e8d0c4, #dfc8bc,
            #eeddd4, #f5e8e0, #e5cfc8,
            #d8bdb4, #ece0d8, #f0e4d8
          );
          background-size: 500% 500%;
          animation: gradientDrift 18s ease infinite;
          min-height: 100vh;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px 16px;
        }

        .cc-overlay {
          position: absolute;
          inset: 0;
          background: rgba(28, 16, 10, 0.16);
        }

        .cc-card {
          position: relative;
          width: 100%;
          max-width: 360px;
          background: rgba(255, 252, 249, 0.88);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 248, 243, 0.95);
          border-radius: 22px;
          padding: 44px 38px 40px;
          box-shadow:
            0 12px 56px rgba(80, 45, 28, 0.13),
            0 2px 14px rgba(80, 45, 28, 0.07);
          animation: fadeSlideUp 0.75s cubic-bezier(0.22, 1, 0.36, 1) 0.1s both;
        }

        .cc-logo-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 18px;
          animation: fadeIn 0.6s ease 0.2s both;
        }

        .cc-logo-img {
          width: 72px;
          height: auto;
          margin-bottom: 14px;
          /* Tint the black logo to match brand color */
          filter: invert(30%) sepia(20%) saturate(600%) hue-rotate(340deg) brightness(70%);
          opacity: 0.88;
        }

        .cc-brand-label {
          font-size: 11px;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: #9a7260;
          font-weight: 500;
        }

        .cc-tagline-wrap {
          min-height: 22px;
          margin-bottom: 28px;
          text-align: center;
          animation: fadeIn 0.4s ease 0.5s both;
        }

        .cc-tagline {
          font-size: 13px;
          color: #987060;
          font-style: italic;
          font-weight: 300;
          letter-spacing: 0.04em;
        }

        .cc-cursor {
          display: inline-block;
          width: 1.5px;
          height: 12px;
          background: #c4a080;
          margin-left: 2px;
          vertical-align: middle;
          border-radius: 1px;
          animation: blink 0.85s step-end infinite;
        }

        .cc-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
          animation: fadeSlideUp 0.65s cubic-bezier(0.22, 1, 0.36, 1) 0.38s both;
        }

        .cc-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .cc-label {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #a07862;
        }

        .cc-input {
          padding: 11px 15px;
          border-radius: 11px;
          font-size: 16px;
          font-family: 'Jost', 'Arial', sans-serif;
          font-weight: 400;
          border: 1.5px solid #ead8cc;
          background: rgba(255, 251, 248, 0.75);
          color: #3a2418;
          width: 100%;
          box-sizing: border-box;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .cc-input::placeholder { color: #c4ada0; }
        .cc-input:focus {
          outline: none;
          border-color: #c09878;
          box-shadow: 0 0 0 3px rgba(192, 152, 120, 0.18);
        }

        .cc-error {
          font-size: 12px;
          color: #b04a3a;
          background: #fff0ed;
          border: 1px solid #f0cfc8;
          border-radius: 9px;
          padding: 9px 13px;
          letter-spacing: 0.01em;
        }

        .cc-btn {
          margin-top: 6px;
          padding: 13px;
          border-radius: 12px;
          font-family: 'Jost', 'Arial', sans-serif;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          background: #7a5244;
          color: #fff;
          border: none;
          width: 100%;
          cursor: pointer;
          transition: background 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease;
          box-shadow: 0 3px 14px rgba(122, 82, 68, 0.28);
        }
        .cc-btn:hover:not(:disabled) {
          background: #63402f;
          transform: translateY(-1.5px);
          box-shadow: 0 6px 22px rgba(99, 64, 47, 0.36);
        }
        .cc-btn:active:not(:disabled) {
          transform: translateY(0);
          box-shadow: 0 2px 8px rgba(99, 64, 47, 0.22);
        }
        .cc-btn:disabled {
          background: #c4a090;
          cursor: not-allowed;
          box-shadow: none;
        }
      `}</style>

      <div className="cc-root cc-bg">
        <div className="cc-overlay" />

        <div className="cc-card">
          {/* Logo */}
          <div className="cc-logo-wrap">
            <Image
              src="/cc-logo.png"
              alt="Cloud Closet"
              width={72}
              height={72}
              className="cc-logo-img"
              style={{ objectFit: 'contain' }}
              priority
            />
            <span className="cc-brand-label">Cloud Closet</span>
          </div>

          {/* Typing tagline */}
          <div className="cc-tagline-wrap">
            <span className="cc-tagline">
              {tagline}
              {!typingDone && <span className="cc-cursor" />}
            </span>
          </div>

          {/* Sign in form */}
          <form className="cc-form" onSubmit={handleSignIn}>
            <div className="cc-field">
              <label className="cc-label">Email</label>
              <input
                type="email"
                className="cc-input"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>

            <div className="cc-field">
              <label className="cc-label">Password</label>
              <input
                type="password"
                className="cc-input"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </div>

            {error && <p className="cc-error">{error}</p>}

            <button type="submit" className="cc-btn" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
