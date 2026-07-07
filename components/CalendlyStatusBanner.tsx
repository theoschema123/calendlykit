"use client";

interface CalendlyStatusBannerProps {
  isConnected: boolean;
  userUri?: string | null;
}

export function CalendlyStatusBanner({
  isConnected,
  userUri,
}: CalendlyStatusBannerProps) {
  if (isConnected) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <div>
          <p className="text-sm font-medium text-emerald-300">
            Calendly connecté
          </p>
          {userUri && (
            <p className="text-xs text-emerald-500/80 mt-0.5 font-mono truncate max-w-[300px]">
              {userUri.replace("https://api.calendly.com/users/", "user/")}
            </p>
          )}
        </div>
        <div className="ml-auto">
          <a
            href="/api/auth/calendly"
            className="text-xs text-emerald-500 hover:text-emerald-300 transition-colors"
          >
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
        <p className="text-sm font-medium text-gray-300">
          Calendly non connecté
        </p>
        <p className="text-xs text-gray-500 mt-0.5">
          Connectez votre compte pour installer des templates
        </p>
      </div>
      <a
        href="/api/auth/calendly"
        className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
        Connecter Calendly
      </a>
    </div>
  );
}
