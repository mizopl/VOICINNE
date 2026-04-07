import React from "react";
import { Globe } from "lucide-react";

const bars = Array.from({ length: 42 }, (_, i) => {
  const center = 21;
  const distance = Math.abs(i - center);
  const baseHeight = Math.max(8, 95 - distance * 4.2);
  const jitter = [12, 28, 5, 19, 34, 7, 23, 16, 9, 31, 14, 26, 3, 18, 29, 11, 22, 8, 35, 17, 13, 25, 6, 21, 30, 10, 27, 4, 20, 15, 32, 2, 24, 33, 7, 19, 28, 12, 22, 5, 16, 9];
  const height = baseHeight + (jitter[i % jitter.length] % 25);
  const delay = (i * 0.05 + Math.sin(i * 0.7) * 0.3).toFixed(2);
  const duration = (1.2 + Math.sin(i * 0.4) * 0.4).toFixed(2);
  return { id: i, height: `${height}%`, delay: `${delay}s`, duration: `${duration}s` };
});

export function StatWaveform() {
  return (
    <div className="w-full max-w-[390px] h-[844px] bg-black text-white relative flex flex-col overflow-hidden font-sans border border-zinc-800 shadow-2xl mx-auto rounded-[3rem]">
      <style>{`
        @keyframes wave-pulse {
          0%, 100% { opacity: 0.25; transform: scaleY(0.75); }
          50% { opacity: 0.9; transform: scaleY(1.05); }
        }
        .bar-animate {
          animation: wave-pulse var(--dur, 1.5s) ease-in-out infinite alternate;
          animation-delay: var(--del, 0s);
        }
        @keyframes ghost-breathe {
          0%, 100% { opacity: 0.06; }
          50% { opacity: 0.11; }
        }
        .ghost-stat {
          animation: ghost-breathe 4s ease-in-out infinite;
        }
        @keyframes tag-fade {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.7; }
        }
        .tag-animate {
          animation: tag-fade 3s ease-in-out infinite;
        }
      `}</style>

      {/* Ambient glow behind waveform */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[320px] bg-cyan-900/20 rounded-full blur-[90px] pointer-events-none" />

      {/* Top — language selector */}
      <div className="flex justify-end px-6 pt-14 z-10">
        <button className="flex items-center gap-2 text-zinc-500 hover:text-zinc-300 transition-colors">
          <Globe className="w-4 h-4" />
          <span className="text-[10px] uppercase tracking-widest font-medium">EN</span>
        </button>
      </div>

      {/* Question + title */}
      <div className="flex flex-col items-center pt-6 pb-0 px-6 z-10">
        <p className="text-[9px] tracking-[0.35em] text-zinc-400 uppercase font-medium text-center mb-3 tag-animate">
          Could you tell the difference?
        </p>
        <h1 className="text-[38px] tracking-[0.22em] font-light text-white text-center leading-none">
          VOICINNE
        </h1>
      </div>

      {/* Waveform + ghost stat layer */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 px-4">
        {/* Ghost "15s" behind bars */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span
            className="ghost-stat font-black text-white select-none"
            style={{ fontSize: "210px", lineHeight: 1, letterSpacing: "-0.04em", marginTop: "8px" }}
          >
            15<span style={{ fontSize: "110px" }}>s</span>
          </span>
        </div>

        {/* Waveform bars */}
        <div className="w-full flex items-center justify-center gap-[2px] h-44 relative">
          {bars.map((bar) => (
            <div
              key={bar.id}
              className="bar-animate rounded-full origin-center"
              style={{
                width: "4px",
                height: bar.height,
                backgroundColor: "rgba(34, 211, 238, 0.85)",
                boxShadow: "0 0 8px rgba(34, 211, 238, 0.5)",
                // @ts-ignore
                "--dur": bar.duration,
                "--del": bar.delay,
              }}
            />
          ))}
        </div>

        {/* Stat caption below waveform */}
        <p className="text-[11px] tracking-[0.18em] text-zinc-500 uppercase font-medium text-center mt-7 max-w-[240px] leading-relaxed">
          That's all AI needs to clone your voice.
        </p>
      </div>

      {/* Bottom CTA */}
      <div className="px-6 pb-12 z-10 flex flex-col items-center gap-4">
        <button className="w-full bg-cyan-500 text-black font-semibold text-[11px] tracking-widest uppercase py-5 rounded-sm transition-all shadow-[0_0_32px_rgba(34,211,238,0.28)] hover:shadow-[0_0_48px_rgba(34,211,238,0.45)] hover:bg-cyan-400 active:scale-[0.98]">
          Start the Simulation
        </button>
        <p className="text-[9px] text-zinc-600 tracking-wider text-center leading-relaxed">
          BY CONTINUING YOU AGREE TO THE TEMPORARY USE OF YOUR VOICE.
        </p>
      </div>
    </div>
  );
}
