import React from "react";
import { Globe } from "lucide-react";

export function CinematicMinimal() {
  const bars = Array.from({ length: 40 }, (_, i) => {
    const center = 20;
    const distance = Math.abs(i - center);
    const baseHeight = Math.max(10, 100 - distance * 4);
    const height = baseHeight + Math.random() * 30;
    
    return {
      id: i,
      height: `${height}%`,
      delay: `${Math.random() * 2}s`,
      duration: `${1 + Math.random()}s`,
    };
  });

  return (
    <div className="w-full max-w-[390px] h-[844px] bg-black text-white relative flex flex-col items-center justify-between overflow-hidden font-sans border border-zinc-800 shadow-2xl mx-auto rounded-[3rem]">
      <style>{`
        @keyframes pulse-wave {
          0%, 100% { opacity: 0.3; transform: scaleY(0.8); }
          50% { opacity: 1; transform: scaleY(1.1); }
        }
        .animate-pulse-wave {
          animation: pulse-wave var(--duration, 1.5s) ease-in-out infinite alternate;
          animation-delay: var(--delay, 0s);
        }
      `}</style>

      {/* Top Section */}
      <div className="w-full flex flex-col items-center pt-24 px-6 z-10">
        <div className="w-full flex justify-end mb-12">
          <button className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors">
            <Globe className="w-4 h-4" />
            <span className="text-xs uppercase tracking-widest font-medium">EN</span>
          </button>
        </div>
        
        <p className="text-[10px] tracking-[0.3em] text-zinc-400 uppercase font-medium mb-4 text-center">
          Could you tell the difference?
        </p>
        <h1 className="text-4xl tracking-[0.2em] font-light text-white mb-2 text-center">
          VOICINNE
        </h1>
      </div>

      {/* Center Waveform */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <div className="absolute w-[250px] h-[250px] bg-cyan-900/20 rounded-full blur-[80px]" />
        
        <div className="w-full h-48 flex items-center justify-center gap-1 px-8">
          {bars.map((bar) => (
            <div
              key={bar.id}
              className="w-1 bg-cyan-400/80 rounded-full animate-pulse-wave origin-center"
              style={{
                height: bar.height,
                // @ts-ignore
                '--delay': bar.delay,
                // @ts-ignore
                '--duration': bar.duration,
                boxShadow: '0 0 10px rgba(34, 211, 238, 0.4)'
              }}
            />
          ))}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="w-full flex flex-col items-center px-6 pb-12 z-10">
        <button className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-sm tracking-widest uppercase py-6 rounded-sm transition-colors shadow-[0_0_30px_rgba(34,211,238,0.3)] hover:shadow-[0_0_40px_rgba(34,211,238,0.5)]">
          Start the Simulation
        </button>
        <p className="mt-6 text-[10px] text-zinc-600 tracking-wider text-center">
          BY CONTINUING, YOU AGREE TO THE USE OF YOUR VOICE DATA.
        </p>
      </div>
    </div>
  );
}
