"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type ContractState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; id: string; intern_name: string | null; content: string }
  | { status: "submitting" };

export default function SignContractPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();

  const [state, setState] = useState<ContractState>({ status: "loading" });
  const [hasDrawn, setHasDrawn] = useState(false);
  const [headshotPreview, setHeadshotPreview] = useState<string | null>(null);
  const [headshotData, setHeadshotData] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const padRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Fetch contract ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!token) return;
    fetch(`/api/contracts/${token}`)
      .then(async (r) => {
        const json = await r.json();
        if (!r.ok) {
          setState({ status: "error", message: json.error || "Something went wrong." });
        } else {
          setState({ status: "ready", id: json.id, intern_name: json.intern_name, content: json.content });
        }
      })
      .catch(() => setState({ status: "error", message: "Network error. Please try again." }));
  }, [token]);

  // ── Init signature_pad after canvas mounts ─────────────────────────────────
  useEffect(() => {
    if (state.status !== "ready") return;

    let pad: any;
    let cleanup = () => {};

    import("signature_pad").then(({ default: SignaturePad }) => {
      if (!canvasRef.current) return;

      const canvas = canvasRef.current;
      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      canvas.width = canvas.offsetWidth * ratio;
      canvas.height = canvas.offsetHeight * ratio;
      canvas.getContext("2d")!.scale(ratio, ratio);

      pad = new SignaturePad(canvas, {
        minWidth: 1,
        maxWidth: 2.5,
        penColor: "#1c1917",
        backgroundColor: "rgba(0,0,0,0)",
      });

      pad.addEventListener("endStroke", () => setHasDrawn(!pad.isEmpty()));
      padRef.current = pad;

      const handleResize = () => {
        if (!canvasRef.current || !padRef.current) return;
        const data = padRef.current.toData();
        const r = Math.max(window.devicePixelRatio || 1, 1);
        canvasRef.current.width = canvasRef.current.offsetWidth * r;
        canvasRef.current.height = canvasRef.current.offsetHeight * r;
        canvasRef.current.getContext("2d")!.scale(r, r);
        padRef.current.fromData(data);
      };
      window.addEventListener("resize", handleResize);
      cleanup = () => window.removeEventListener("resize", handleResize);
    });

    return () => {
      cleanup();
      padRef.current?.off();
    };
  }, [state.status]);

  function clearSignature() {
    padRef.current?.clear();
    setHasDrawn(false);
  }

  function handleHeadshotChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setHeadshotPreview(dataUrl);
      setHeadshotData(dataUrl);
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmit() {
    if (!padRef.current || padRef.current.isEmpty()) return;
    if (!headshotData) return;

    const signatureData = padRef.current.toDataURL("image/png");
    setState({ status: "submitting" });

    const res = await fetch(`/api/contracts/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ signature_data: signatureData, headshot_data: headshotData }),
    });

    const json = await res.json();
    if (res.ok) {
      // Log auth status to console for debugging
      console.log('[contract sign] auth_status:', json.auth_status, json.auth_error || '');
      router.push(`/sign/${token}/confirm`);
    } else {
      setState({
        status: "error",
        message: json.error || "Signing failed. Please try again.",
      });
    }
  }

  // ── Render states ─────────────────────────────────────────────────────────
  if (state.status === "loading") {
    return (
      <Shell>
        <div className="flex flex-col items-center gap-3 py-20 text-stone-400">
          <Spinner />
          <p className="text-sm">Loading your contract…</p>
        </div>
      </Shell>
    );
  }

  if (state.status === "submitting") {
    return (
      <Shell>
        <div className="flex flex-col items-center gap-3 py-20 text-stone-400">
          <Spinner />
          <p className="text-sm font-medium text-stone-600">Signing contract and sending your dashboard invite…</p>
          <p className="text-xs text-stone-400">This may take a few seconds.</p>
        </div>
      </Shell>
    );
  }

  if (state.status === "error") {
    return (
      <Shell>
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-400 text-2xl">✕</div>
          <div>
            <p className="text-base font-semibold text-stone-800 mb-1">Unable to load contract</p>
            <p className="text-sm text-stone-500 max-w-xs">{state.message}</p>
          </div>
        </div>
      </Shell>
    );
  }

  const { intern_name, content } = state;
  const canSubmit = hasDrawn && !!headshotData;

  return (
    <Shell>
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-stone-800 mb-4">
          <span className="text-white text-sm font-bold">CC</span>
        </div>
        <h1 className="text-xl font-semibold text-stone-800">Internship Agreement</h1>
        {intern_name && (
          <p className="text-sm text-stone-400 mt-1">For {intern_name}</p>
        )}
      </div>

      {/* Contract content */}
      <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 mb-6 max-h-[35vh] overflow-y-auto">
        <pre className="text-sm text-stone-700 font-sans whitespace-pre-wrap leading-relaxed">{content}</pre>
      </div>

      {/* Headshot upload */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <label className="text-xs font-semibold text-stone-500 uppercase tracking-widest">
            Profile Photo
          </label>
          <span className="text-xs text-red-400 font-medium">Required</span>
        </div>
        <p className="text-xs text-stone-400 mb-3">
          Upload a clear headshot or photo of your face — this becomes your profile picture on the dashboard.
        </p>

        {headshotPreview ? (
          <div className="flex items-center gap-4">
            <img
              src={headshotPreview}
              alt="Your headshot"
              className="w-20 h-20 rounded-2xl object-cover border-2 border-stone-200"
            />
            <button
              onClick={() => { setHeadshotPreview(null); setHeadshotData(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
              className="text-xs text-stone-400 hover:text-stone-600 underline"
            >
              Remove &amp; re-upload
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full border-2 border-dashed border-stone-200 rounded-2xl py-8 flex flex-col items-center gap-2 text-stone-400 hover:border-stone-300 hover:text-stone-500 transition-colors cursor-pointer"
          >
            <span className="text-2xl">🖼️</span>
            <span className="text-sm">Choose a photo from your library</span>
            <span className="text-xs">JPG, PNG, HEIC accepted</span>
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleHeadshotChange}
        />
      </div>

      {/* Signature section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-stone-500 uppercase tracking-widest">
            Your Signature
          </label>
          <button
            onClick={clearSignature}
            className="text-xs text-stone-400 hover:text-stone-600 underline"
          >
            Clear
          </button>
        </div>
        <div className="relative border-2 border-dashed border-stone-200 rounded-2xl bg-white overflow-hidden"
          style={{ height: 140 }}>
          <canvas
            ref={canvasRef}
            style={{ width: "100%", height: "100%", touchAction: "none", display: "block" }}
          />
          {!hasDrawn && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <p className="text-sm text-stone-300 select-none">Sign here with your finger or mouse</p>
            </div>
          )}
        </div>
        <p className="text-xs text-stone-400 mt-2 text-center">
          By signing, you agree to all terms in this internship agreement.
        </p>
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!canSubmit}
        className="w-full py-4 rounded-2xl text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        style={{
          background: canSubmit ? "#1c1917" : "#d6d3d1",
          color: "#fff",
        }}
      >
        {!headshotData ? "Upload a photo to continue" : !hasDrawn ? "Sign above to continue" : "I agree and sign"}
      </button>

      <p className="text-xs text-stone-400 text-center mt-4">
        Cloud Closet · Secure digital signing
      </p>
    </Shell>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────
function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-stone-50 flex items-start justify-center py-8 px-4">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-sm border border-stone-100 p-6 sm:p-8">
        {children}
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <div
      style={{
        width: 28,
        height: 28,
        borderRadius: "50%",
        border: "2.5px solid #e7e5e4",
        borderTopColor: "#57534e",
        animation: "spin 0.7s linear infinite",
      }}
    />
  );
}
