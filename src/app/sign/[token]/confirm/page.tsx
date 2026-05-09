export default function ContractConfirmPage() {
  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-sm border border-stone-100 p-8 text-center">
        {/* CC logo */}
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-stone-800 mb-6">
          <span className="text-white text-sm font-bold">CC</span>
        </div>

        {/* Check icon */}
        <div className="mx-auto mb-5 w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <h1 className="text-xl font-semibold text-stone-800 mb-2">
          You&rsquo;re all set!
        </h1>
        <p className="text-sm text-stone-500 leading-relaxed mb-6">
          Your contract is signed and saved. You&rsquo;ll receive a link to log in to the
          Cloud Closet intern dashboard shortly.
        </p>

        <div className="bg-stone-50 rounded-2xl p-4 text-left space-y-2">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 text-stone-400 flex-shrink-0">📩</span>
            <p className="text-xs text-stone-500">
              <strong className="text-stone-700">Keep an eye on your inbox</strong> — your team lead will send you a link to access the dashboard.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="mt-0.5 text-stone-400 flex-shrink-0">📋</span>
            <p className="text-xs text-stone-500">
              <strong className="text-stone-700">A PDF copy</strong> of your signed contract will be available in your dashboard once you log in.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="mt-0.5 text-stone-400 flex-shrink-0">❓</span>
            <p className="text-xs text-stone-500">
              Questions? Reach out to your team lead directly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
