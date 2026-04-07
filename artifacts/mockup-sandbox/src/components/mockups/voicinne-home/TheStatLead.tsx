import React from "react";
import { Globe, ChevronRight, Users, ShieldAlert } from "lucide-react";

export function TheStatLead() {
  return (
    <div className="flex flex-col w-full h-full max-w-[390px] mx-auto bg-black text-white overflow-hidden relative font-sans min-h-[800px]">
      {/* Background ambient effect */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-red-600/15 blur-[100px] rounded-full pointer-events-none" />

      {/* Header / Nav */}
      <div className="flex justify-between items-center p-6 z-10 relative">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-xs font-bold tracking-widest uppercase text-zinc-400">
            Threat Intel
          </span>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-300 hover:bg-zinc-800 transition-colors">
          <Globe className="w-3.5 h-3.5" />
          <span>EN</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center px-6 z-10 relative mt-[-8vh]">
        <div className="flex flex-col items-center text-center">
          <div className="flex items-baseline justify-center">
            <span className="text-[150px] font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-red-500 to-red-900 leading-[0.85]">
              15
            </span>
            <span className="text-5xl font-black text-red-600 ml-1 tracking-tighter">s</span>
          </div>

          <p className="text-2xl font-bold mt-8 mb-4 tracking-tight">
            That's all AI needs to clone your voice.
          </p>

          <p className="text-zinc-400 text-base max-w-[300px] mx-auto leading-relaxed">
            Scammers are using 15-second audio clips from social media to fake
            kidnappings and extort families.
          </p>
        </div>
      </div>

      {/* Bottom Action Area */}
      <div className="px-6 pb-10 z-10 relative flex flex-col gap-4">
        {/* Social Proof */}
        <div className="bg-zinc-900/60 backdrop-blur-md border border-zinc-800 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-zinc-400 text-[10px] uppercase tracking-wider font-bold mb-1 flex items-center gap-1.5">
              <Users className="w-3 h-3" /> Families Educated
            </span>
            <span className="text-xl font-black tracking-tight text-zinc-100">12,847</span>
          </div>
          <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20">
            <ShieldAlert className="w-6 h-6 text-green-500" />
          </div>
        </div>

        {/* Primary CTA */}
        <button className="w-full bg-white text-black rounded-full py-4 px-6 font-bold text-lg flex items-center justify-between group hover:bg-zinc-200 transition-colors active:scale-[0.98]">
          <span>Start the Simulation</span>
          <div className="bg-black text-white rounded-full p-1.5 group-hover:translate-x-1 transition-transform">
            <ChevronRight className="w-5 h-5" />
          </div>
        </button>

        {/* Disclaimer */}
        <div className="text-center mt-3">
          <p className="text-[10px] text-zinc-500 leading-relaxed font-medium">
            By proceeding, you consent to record a temporary 60s voice sample.
            <br />
            Audio is never saved, shared, or uploaded to external servers.
          </p>
        </div>
      </div>
    </div>
  );
}
