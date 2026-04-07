import React, { useState, useEffect } from "react";
import { ShieldAlert, Fingerprint, Globe, ChevronRight, Lock, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ClassifiedIntel() {
  const [typingText, setTypingText] = useState("");
  const fullText = "INITIALIZING SECURE CONNECTION...\nUPLINK ESTABLISHED.\nDECRYPTING FILE: DEEPFAKE_THREAT_ANALYSIS.DAT";

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setTypingText(fullText.slice(0, index));
      index++;
      if (index > fullText.length) {
        clearInterval(interval);
      }
    }, 30);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-[390px] h-[844px] bg-zinc-950 text-zinc-300 font-mono flex flex-col relative overflow-hidden selection:bg-red-900 selection:text-red-100 shadow-2xl">
      {/* Scanline overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_bottom,rgba(255,255,255,0),rgba(255,255,255,0.03)_50%,rgba(255,255,255,0))] bg-[length:100%_4px]" />
      
      {/* Background grid */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px]" />

      {/* Top Header */}
      <header className="flex justify-between items-center p-4 border-b border-zinc-800 relative z-10">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-red-500" />
          <span className="text-xs tracking-widest text-zinc-400">CYBER_DIV_09</span>
        </div>
        <button className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
          <Globe className="w-4 h-4" />
          <span>EN</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col p-6 relative z-10 overflow-y-auto hide-scrollbar">
        {/* Classification Header */}
        <div className="flex flex-col items-center mb-8 border-y border-zinc-800 py-4 relative">
          <div className="absolute inset-0 bg-red-500/5 blur-xl"></div>
          <h1 className="text-2xl font-bold tracking-[0.2em] text-zinc-100 mb-2">CLASSIFIED</h1>
          <div className="flex items-center gap-2 text-red-500 bg-red-500/10 px-3 py-1 border border-red-500/20">
            <Lock className="w-4 h-4" />
            <span className="text-xs font-bold tracking-widest">THREAT LEVEL: CRITICAL</span>
          </div>
        </div>

        {/* Terminal Effect */}
        <div className="mb-8 text-xs text-red-400/80 min-h-[60px] whitespace-pre-wrap">
          {typingText}
          <span className="animate-pulse">_</span>
        </div>

        {/* Briefing Content */}
        <div className="space-y-6 text-sm leading-relaxed mb-12">
          <p>
            SUBJECT: <span className="text-zinc-100">TARGETED AUDIO CLONING</span>
            <br />
            STATUS: <span className="text-red-500">ACTIVE EXPLOIT IN THE WILD</span>
          </p>
          
          <p>
            Intelligence indicates hostile actors require only <span className="text-amber-500 font-bold">60 SECONDS</span> of audio to synthesize an indistinguishable vocal clone of a target.
          </p>

          <p>
            Once acquired, the synthetic voice is deployed against the target's <span className="bg-zinc-800 text-zinc-800 select-none px-1">immediate family</span> to extract financial assets or sensitive intelligence.
          </p>
          
          <div className="p-4 border border-zinc-800 bg-zinc-900/50">
            <div className="flex items-start gap-3">
              <Terminal className="w-5 h-5 text-zinc-500 shrink-0 mt-0.5" />
              <p className="text-xs text-zinc-400">
                "The most effective countermeasure is experiential exposure. You must hear the weaponized payload to build cognitive immunity."
              </p>
            </div>
          </div>
        </div>

        <div className="mt-auto pt-4 flex flex-col gap-4">
          <div className="flex justify-center mb-2">
            <Fingerprint className="w-12 h-12 text-zinc-700 opacity-50" />
          </div>
          
          <Button 
            className="w-full bg-red-600 hover:bg-red-700 text-white rounded-none h-14 font-mono text-sm tracking-widest uppercase border border-red-500 transition-all active:scale-[0.98]"
          >
            BEGIN CLASSIFIED EXPERIMENT
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>

          <p className="text-[10px] text-zinc-600 text-center uppercase tracking-wider leading-relaxed">
            By proceeding, you authorize a temporary audio capture for threat simulation purposes only. Data will be purged post-simulation.
          </p>
        </div>
      </main>
    </div>
  );
}
