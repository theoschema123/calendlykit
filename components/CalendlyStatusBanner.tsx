"use client";

interface CalendlyStatusBannerProps {
  isConnected: boolean;
  userUri?: string | null;
}

export function CalendlyStatusBanner({ isConnected, userUri }: CalendlyStatusBannerProps) {
  if (isConnected) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <div>
          <p className="text-sm font-medium text-emerald-300">Cal.com connecté ✅</p>
          {userUri && (
            <p className="text-xs text-emerald-500/80 mt-0.5 font-mono truncate max-w-[300px]">{userUri}</p>
          )}
        </div>
        <div className="ml-auto">
          <a href="/api/auth/calendly" className="text-xs text-emerald-500 hover:text-emerald-300 transition-colors">
            Reconnecter
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.10]">
      <div className="w-2 h-2 rounded-full bg-gray-500" />
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-300">Cal.com non connecté</p>
        <p className="text-xs text-gray-500 mt-0.5">Connectez votre compte pour installer des templates</p>
      </div>
      
        href="/api/auth/calendly"
        className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
      >
        Connecter Cal.com
      </a>
    </div>
  );
}
