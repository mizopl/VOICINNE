import React, { useEffect, useRef, useState, useCallback } from "react";
import { Globe, Mic } from "lucide-react";

const SCAMS = [
  { label: "Fake Kidnapping", desc: "Scammers clone a child's voice to call parents demanding ransom — all from a 15-second clip." },
  { label: "CEO Fraud", desc: "AI mimics your boss's voice on a call, authorising an urgent six-figure wire transfer." },
  { label: "Voice ID Bypass", desc: "Synthetic voices defeat bank voice-authentication systems, draining accounts silently." },
  { label: "Grandparent Scam", desc: "Elderly relatives receive a call — your voice, your words — begging for emergency cash." },
  { label: "Romance Manipulation", desc: "Cloned voices sustain fake relationships across months, extracting money and secrets." },
  { label: "Information Extraction", desc: "AI impersonates family members to trick you into sharing passwords or personal data." },
];

export function StatWaveform() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const idlePhaseRef = useRef(0);

  const [micActive, setMicActive] = useState(false);
  const [micDenied, setMicDenied] = useState(false);
  const [scamIdx, setScamIdx] = useState(0);
  const [scamVisible, setScamVisible] = useState(true);

  /* ── Ticker ──────────────────────────────────────────────── */
  useEffect(() => {
    const id = setInterval(() => {
      setScamVisible(false);
      setTimeout(() => {
        setScamIdx(i => (i + 1) % SCAMS.length);
        setScamVisible(true);
      }, 500);
    }, 4000);
    return () => clearInterval(id);
  }, []);

  /* ── Canvas draw loop ────────────────────────────────────── */
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const mid = H / 2;
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#ef4444";
    ctx.shadowColor = "rgba(239,68,68,0.7)";
    ctx.shadowBlur = 8;
    ctx.beginPath();

    if (analyserRef.current && dataArrayRef.current) {
      /* Live mic path */
      const bufLen = analyserRef.current.frequencyBinCount;
      analyserRef.current.getByteTimeDomainData(dataArrayRef.current);
      const sliceW = W / bufLen;
      for (let i = 0; i < bufLen; i++) {
        const v = dataArrayRef.current[i] / 128.0;
        const y = v * mid;
        if (i === 0) ctx.moveTo(0, y);
        else ctx.lineTo(i * sliceW, y);
      }
    } else {
      /* Idle voice-like animation — overlapping sine waves */
      idlePhaseRef.current += 0.03;
      const ph = idlePhaseRef.current;
      for (let x = 0; x <= W; x++) {
        const t = (x / W) * Math.PI * 8;
        const y =
          mid +
          Math.sin(t + ph) * 10 +
          Math.sin(t * 1.7 + ph * 0.9) * 6 +
          Math.sin(t * 3.1 + ph * 1.4) * 3;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
    }

    ctx.stroke();
    rafRef.current = requestAnimationFrame(draw);
  }, []);

  /* ── Start animation on mount ────────────────────────────── */
  useEffect(() => {
    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [draw]);

  /* ── Mic toggle ──────────────────────────────────────────── */
  const toggleMic = useCallback(async () => {
    if (micActive) {
      /* Stop mic */
      streamRef.current?.getTracks().forEach(t => t.stop());
      audioCtxRef.current?.close();
      analyserRef.current = null;
      dataArrayRef.current = null;
      streamRef.current = null;
      audioCtxRef.current = null;
      setMicActive(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ctx = new AudioContext();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      source.connect(analyser);
      dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);
      analyserRef.current = analyser;
      audioCtxRef.current = ctx;
      streamRef.current = stream;
      setMicActive(true);
      setMicDenied(false);
    } catch {
      setMicDenied(true);
    }
  }, [micActive]);

  /* ── Cleanup on unmount ──────────────────────────────────── */
  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach(t => t.stop());
      audioCtxRef.current?.close();
    };
  }, []);

  const scam = SCAMS[scamIdx];

  return (
    <div className="w-full max-w-[390px] h-[844px] bg-black text-white relative flex flex-col overflow-hidden font-sans border border-zinc-800 shadow-2xl mx-auto rounded-[3rem]">
      <style>{`
        @keyframes red-breathe {
          0%, 100% { opacity: 0.15; }
          50%       { opacity: 0.32; }
        }
        .red-glow { animation: red-breathe 3s ease-in-out infinite; }
        .ticker-enter { opacity: 1; transform: translateY(0); transition: opacity 0.5s, transform 0.5s; }
        .ticker-exit  { opacity: 0; transform: translateY(6px); transition: opacity 0.4s, transform 0.4s; }
        @keyframes mic-ring {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.5); }
          50%       { box-shadow: 0 0 0 8px rgba(239,68,68,0); }
        }
        .mic-active { animation: mic-ring 1s ease-out infinite; }
      `}</style>

      {/* Ambient red glow */}
      <div
        className="red-glow absolute left-1/2 -translate-x-1/2 w-[260px] h-[260px] rounded-full pointer-events-none"
        style={{ top: "30%", background: "radial-gradient(circle, rgba(239,68,68,0.5) 0%, transparent 70%)", filter: "blur(55px)" }}
      />

      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 pt-11 z-10">
        <h1 className="text-[26px] tracking-[0.26em] font-light text-white leading-none">
          VOICINNE
        </h1>
        <button className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 transition-colors">
          <Globe className="w-4 h-4" />
          <span className="text-[10px] uppercase tracking-widest font-medium">EN</span>
        </button>
      </div>

      {/* ── Voice Waveform Canvas ─────────────────────────── */}
      <div className="relative w-full mt-6 z-10" style={{ height: "72px" }}>
        <canvas
          ref={canvasRef}
          width={390}
          height={72}
          className="w-full h-full"
        />
        {/* Mic toggle button — bottom-right of waveform */}
        <button
          onClick={toggleMic}
          className={`absolute bottom-1 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
            micActive
              ? "bg-red-600 mic-active"
              : "bg-zinc-800 hover:bg-zinc-700"
          }`}
          title={micActive ? "Mute mic" : "Activate mic"}
        >
          <Mic className={`w-4 h-4 ${micActive ? "text-white" : "text-zinc-400"}`} />
        </button>
        {micDenied && (
          <p className="absolute bottom-1 left-4 text-[9px] text-red-500 tracking-wide">
            Mic access denied
          </p>
        )}
      </div>

      {/* ── Stat ─────────────────────────────────────────── */}
      <div className="flex flex-col items-center px-6 mt-4 z-10">
        <div className="flex items-baseline leading-none">
          <span
            className="font-black text-red-500 leading-none"
            style={{ fontSize: "118px", letterSpacing: "-0.04em", lineHeight: 1, textShadow: "0 0 40px rgba(239,68,68,0.5)" }}
          >
            15
          </span>
          <span className="font-black text-red-500 ml-1" style={{ fontSize: "52px", lineHeight: 1 }}>
            s
          </span>
        </div>
        <p className="text-zinc-200 text-[15px] font-semibold text-center mt-2 leading-snug tracking-tight">
          That's all AI needs to clone your voice.
        </p>
      </div>

      {/* ── Explanation ──────────────────────────────────── */}
      <div className="px-7 mt-4 z-10">
        <p className="text-zinc-400 text-[12.5px] leading-relaxed text-center">
          We'll clone your voice from a 60-second recording, then use it to call
          one of your closest ones — so they hear, firsthand, how convincingly
          AI can impersonate someone they trust.
        </p>
      </div>

      {/* ── Scam Ticker ──────────────────────────────────── */}
      <div className="mx-6 mt-5 rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-3 z-10 min-h-[74px] flex flex-col justify-center">
        <div
          className={scamVisible ? "ticker-enter" : "ticker-exit"}
          style={{ willChange: "opacity, transform" }}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
            <span className="text-[10px] font-bold tracking-widest text-red-400 uppercase">
              {scam.label}
            </span>
          </div>
          <p className="text-[11.5px] text-zinc-400 leading-relaxed pl-3.5">
            {scam.desc}
          </p>
        </div>
      </div>

      {/* Ticker dots */}
      <div className="flex items-center justify-center gap-1.5 mt-2 z-10">
        {SCAMS.map((_, i) => (
          <button
            key={i}
            onClick={() => { setScamIdx(i); setScamVisible(true); }}
            className={`rounded-full transition-all ${i === scamIdx ? "w-4 h-1.5 bg-red-500" : "w-1.5 h-1.5 bg-zinc-700"}`}
          />
        ))}
      </div>

      {/* ── CTA ──────────────────────────────────────────── */}
      <div className="px-6 mt-auto pb-9 z-10 flex flex-col items-center gap-3">
        <button
          className="w-full bg-red-600 hover:bg-red-500 active:scale-[0.98] text-white font-bold text-[13px] tracking-widest uppercase py-5 rounded-xl transition-all"
          style={{ boxShadow: "0 0 28px rgba(239,68,68,0.35)" }}
        >
          Start the Simulation
        </button>
        <p className="text-[10px] text-zinc-600 tracking-wide text-center leading-relaxed">
          By continuing you consent to record a 60s voice sample.
          <br />Audio is never stored or shared beyond this session.
        </p>
      </div>
    </div>
  );
}
