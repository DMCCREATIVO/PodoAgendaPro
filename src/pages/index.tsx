import { SEO } from "@/components/SEO";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white relative overflow-hidden selection:bg-primary/30">
      {/* Fondos y brillos futuristas */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.03)_0%,transparent_60%)] pointer-events-none" />

      <SEO title="PodoAgenda Pro | Next Gen" />

      <div className="z-10 flex flex-col items-center text-center space-y-8 p-12 bg-white/[0.02] border border-white/[0.05] rounded-[2.5rem] backdrop-blur-xl shadow-2xl max-w-2xl mx-4">
        {/* Logo / Icono */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
          <div className="relative w-24 h-24 mx-auto bg-[#0a0a0a] border border-white/10 rounded-2xl flex items-center justify-center shadow-2xl">
            <span className="text-4xl filter drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">🦶</span>
          </div>
        </div>
        
        {/* Textos */}
        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50 tracking-tighter">
            PodoAgenda <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Pro</span>
          </h1>
          <p className="text-lg md:text-xl text-white/40 max-w-lg mx-auto font-light tracking-wide">
            Sistema completamente purgado. Iniciando arquitectura de nueva generación.
          </p>
        </div>

        {/* Loading Bar Futurista */}
        <div className="pt-8 w-full max-w-xs mx-auto">
          <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden relative">
            <div className="absolute top-0 left-0 h-full w-1/3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-[pulse_2s_ease-in-out_infinite] shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
          </div>
          <p className="text-xs text-white/30 mt-4 uppercase tracking-[0.2em] font-semibold">
            Sistema Base Listo
          </p>
        </div>
      </div>
    </div>
  );
}