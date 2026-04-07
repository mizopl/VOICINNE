import React from "react";
import { Globe } from "lucide-react";

export function StatWaveform() {
  return (
    <div className="w-full max-w-[390px] h-[844px] bg-black text-white relative flex flex-col overflow-hidden font-sans border border-zinc-800 shadow-2xl mx-auto rounded-[3rem]">
      <style>{`
        @keyframes ecg-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .ecg-track {
          animation: ecg-scroll 3.2s linear infinite;
          will-change: transform;
        }
        @keyframes glow-pulse {
          0%, 100% { opacity: 0.18; }
          50%       { opacity: 0.38; }
        }
        .red-glow {
          animation: glow-pulse 2.8s ease-in-out infinite;
        }
      `}</style>

      {/* Ambient red glow behind stat */}
      <div
        className="red-glow absolute left-1/2 -translate-x-1/2 w-[280px] h-[280px] rounded-full pointer-events-none"
        style={{ top: "38%", background: "radial-gradient(circle, rgba(239,68,68,0.55) 0%, transparent 70%)", filter: "blur(60px)" }}
      />

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 pt-12 pb-0 z-10">
        <h1 className="text-[28px] tracking-[0.28em] font-light text-white leading-none">
          VOICINNE
        </h1>
        <button className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 transition-colors">
          <Globe className="w-4 h-4" />
          <span className="text-[10px] uppercase tracking-widest font-medium">EN</span>
        </button>
      </div>

      {/* ── ECG Lifeline ────────────────────────────────────── */}
      <div className="w-full overflow-hidden z-10 mt-8" style={{ height: "70px" }}>
        {/*
          The SVG is 800px wide (2 repeats of a 400px heartbeat).
          We scroll it left by 50% (400px) on a loop, creating
          a seamless infinite lifeline effect.
        */}
        <svg
          className="ecg-track"
          width="800"
          height="70"
          viewBox="0 0 800 70"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ display: "block" }}
        >
          <path
            d={[
              /* beat 1 */
              "M0,35",
              "L55,35",
              "L65,35",
              "L72,12",
              "L80,62",
              "L86,8",
              "L93,35",
              "L105,35",
              "L150,35",
              /* beat 2 */
              "L205,35",
              "L215,35",
              "L222,12",
              "L230,62",
              "L236,8",
              "L243,35",
              "L255,35",
              "L300,35",
              /* beat 3 */
              "L355,35",
              "L365,35",
              "L372,12",
              "L380,62",
              "L386,8",
              "L393,35",
              "L405,35",
              "L450,35",
              /* beat 4 (second half — for seamless loop) */
              "L505,35",
              "L515,35",
              "L522,12",
              "L530,62",
              "L536,8",
              "L543,35",
              "L555,35",
              "L600,35",
              /* beat 5 */
              "L655,35",
              "L665,35",
              "L672,12",
              "L680,62",
              "L686,8",
              "L693,35",
              "L705,35",
              "L750,35",
              /* beat 6 */
              "L800,35",
            ].join(" ")}
            stroke="#ef4444"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ filter: "drop-shadow(0 0 6px rgba(239,68,68,0.7))" }}
          />
        </svg>
      </div>

      {/* ── Stat + Slogan ───────────────────────────────────── */}
      <div className="flex flex-col items-center px-6 mt-6 z-10">
        {/* Big red 15s */}
        <div className="flex items-baseline leading-none">
          <span
            className="font-black text-red-500 leading-none"
            style={{ fontSize: "130px", letterSpacing: "-0.04em", lineHeight: 1, textShadow: "0 0 40px rgba(239,68,68,0.5)" }}
          >
            15
          </span>
          <span
            className="font-black text-red-500 ml-1"
            style={{ fontSize: "60px", letterSpacing: "-0.02em", lineHeight: 1 }}
          >
            s
          </span>
        </div>

        {/* Slogan */}
        <p className="text-zinc-200 text-[16px] font-semibold text-center mt-3 leading-snug tracking-tight">
          That's all AI needs to clone your voice.
        </p>
      </div>

      {/* ── Explanation ─────────────────────────────────────── */}
      <div className="px-7 mt-5 z-10">
        <p className="text-zinc-400 text-[13px] leading-relaxed text-center">
          We'll clone your voice from a 60-second recording, then use it to call
          one of your closest ones — so they can hear, firsthand, how convincingly
          AI can impersonate someone they trust.
        </p>
      </div>

      {/* ── CTA ─────────────────────────────────────────────── */}
      <div className="px-6 mt-auto pb-10 z-10 flex flex-col items-center gap-3">
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
