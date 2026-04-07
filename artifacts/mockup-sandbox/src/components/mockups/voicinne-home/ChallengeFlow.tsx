import React, { useState } from "react";
import { Phone, PhoneOff, AlertTriangle, Shield, Globe } from "lucide-react";

export function ChallengeFlow() {
  const [step, setStep] = useState<"call" | "reveal">("call");
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleChoice = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setStep("reveal");
      setIsTransitioning(false);
    }, 400); // Wait for transition
  };

  return (
    <div className="flex flex-col h-[100dvh] w-full max-w-[390px] mx-auto bg-black text-slate-50 font-sans overflow-hidden relative">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
      {step === "reveal" && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-red-500/10 rounded-full blur-[120px] pointer-events-none" />
      )}

      {/* Header */}
      <header className="flex justify-between items-center p-6 z-10">
        <div className="font-bold tracking-tight text-lg text-white">Voicinne</div>
        <button className="flex items-center gap-1.5 text-xs font-medium text-slate-400 bg-white/5 px-2.5 py-1.5 rounded-full hover:bg-white/10 transition-colors">
          <Globe className="w-3.5 h-3.5" />
          EN
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col justify-center px-6 relative z-10 pb-20">
        {/* Step 1: The Call */}
        <div
          className={`transition-all duration-500 ease-out flex flex-col items-center w-full ${
            step === "call" && !isTransitioning
              ? "opacity-100 translate-y-0"
              : "opacity-0 -translate-y-8 pointer-events-none absolute"
          }`}
        >
          {/* Call Card */}
          <div className="w-full bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl shadow-black/50 mb-10 ring-1 ring-white/5 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-50" />
            <div className="relative flex flex-col items-center">
              <div className="w-20 h-20 rounded-full overflow-hidden mb-4 ring-2 ring-slate-800 shadow-lg relative">
                 <img src="/__mockup/images/caller-mom.png" alt="Mom" className="w-full h-full object-cover" />
                 <div className="absolute inset-0 ring-1 ring-inset ring-black/20 rounded-full" />
              </div>
              <h2 className="text-2xl font-medium text-white tracking-tight mb-1">Mom</h2>
              <p className="text-slate-400 text-sm mb-8">Incoming call...</p>

              <div className="flex justify-between w-full px-4">
                <div className="flex flex-col items-center gap-2">
                  <button className="w-14 h-14 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center hover:bg-red-500/30 transition-colors">
                    <PhoneOff className="w-6 h-6" />
                  </button>
                  <span className="text-[11px] text-slate-400 font-medium">Decline</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <button className="w-14 h-14 rounded-full bg-green-500 text-white flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.4)] animate-pulse hover:bg-green-400 transition-colors">
                    <Phone className="w-6 h-6 fill-current" />
                  </button>
                  <span className="text-[11px] text-slate-400 font-medium">Answer</span>
                </div>
              </div>
            </div>
          </div>

          <h3 className="text-2xl font-semibold mb-6 text-center text-white text-balance">
            Would you answer this call?
          </h3>
          
          <div className="flex gap-4 w-full">
            <button 
              onClick={handleChoice}
              className="flex-1 bg-white text-black font-semibold py-4 rounded-2xl hover:bg-slate-200 active:scale-[0.98] transition-all"
            >
              Yes
            </button>
            <button 
              onClick={handleChoice}
              className="flex-1 bg-white/10 text-white font-semibold py-4 rounded-2xl border border-white/10 hover:bg-white/20 active:scale-[0.98] transition-all"
            >
              Maybe
            </button>
          </div>
        </div>

        {/* Step 2: The Reveal */}
        <div
          className={`transition-all duration-700 ease-out flex flex-col w-full delay-100 ${
            step === "reveal" && !isTransitioning
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8 pointer-events-none absolute"
          }`}
        >
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5 mb-8 flex items-start gap-4">
            <div className="p-2 bg-red-500/20 rounded-full text-red-500 shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-red-400 font-semibold mb-1">That wasn't her.</h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                This call was AI-generated. The voice was cloned in exactly 15 seconds from a public video.
              </p>
            </div>
          </div>

          <h2 className="text-3xl font-bold tracking-tight mb-4 text-white text-balance">
            Would your family notice the difference?
          </h2>
          
          <p className="text-slate-400 text-base mb-10 leading-relaxed">
            Scammers are using voice cloning to fake emergencies. The best defense is experiencing the technology yourself.
          </p>

          <button className="w-full bg-cyan-500 text-black font-bold py-4 rounded-2xl shadow-[0_0_30px_rgba(6,182,212,0.3)] hover:bg-cyan-400 hover:shadow-[0_0_40px_rgba(6,182,212,0.4)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group">
            <Shield className="w-5 h-5 transition-transform group-hover:scale-110" />
            Protect them. Run the simulation.
          </button>
          
          <button 
            onClick={() => setStep("call")}
            className="mt-6 text-sm text-slate-500 font-medium hover:text-slate-300 transition-colors"
          >
            Restart challenge
          </button>
        </div>
      </main>

      {/* Footer Disclaimer */}
      <footer className="p-6 text-center z-10 pb-8">
        <p className="text-[11px] text-slate-600 leading-tight px-4">
          By continuing, you agree to our Terms of Service. Your voice data is processed locally and never permanently stored.
        </p>
      </footer>
    </div>
  );
}
