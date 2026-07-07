"use client";

interface InstallResult {
  name: string;
  success: boolean;
  scheduling_url?: string;
  error?: string;
}

interface InstallSummary {
  total: number;
  created: number;
  failed: number;
}

interface InstallResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  templateName: string;
  results: InstallResult[];
  summary: InstallSummary;
  status: "success" | "partial" | "failed";
}

export function InstallResultModal({
  isOpen,
  onClose,
  templateName,
  results,
  summary,
  status,
}: InstallResultModalProps) {
  if (!isOpen) return null;

  const statusConfig = {
    success: {
      icon: "✅",
      title: "Votre Calendly est prêt !",
      subtitle: `${summary.created} événement${summary.created > 1 ? "s ont" : " a"} été créé${summary.created > 1 ? "s" : ""} avec succès.`,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20",
    },
    partial: {
      icon: "⚠️",
      title: "Installation partielle",
      subtitle: `${summary.created}/${summary.total} événements créés. Certains ont échoué.`,
      color: "text-amber-400",
      bg: "bg-amber-500/10 border-amber-500/20",
    },
    failed: {
      icon: "❌",
      title: "Échec de l'installation",
      subtitle: "Aucun événement n'a pu être créé.",
      color: "text-red-400",
      bg: "bg-red-500/10 border-red-500/20",
    },
  };

  const cfg = statusConfig[status];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md glass-card p-6 animate-[slideUp_0.25s_ease-out]">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-gray-500 hover:text-gray-300 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Status header */}
        <div className={`px-4 py-3 rounded-xl border mb-6 ${cfg.bg}`}>
          <p className={`text-lg font-semibold ${cfg.color}`}>
            {cfg.icon} {cfg.title}
          </p>
          <p className="text-sm text-gray-400 mt-1">{cfg.subtitle}</p>
        </div>

        <p className="text-sm text-gray-500 mb-3">
          Template installé :{" "}
          <span className="text-gray-300 font-medium">{templateName}</span>
        </p>

        {/* Results list */}
        <ul className="space-y-2 mb-6">
          {results.map((result, i) => (
            <li
              key={i}
              className="flex items-center gap-3 py-2.5 px-3 rounded-lg bg-white/[0.03] border border-white/[0.06]"
            >
              <span className={result.success ? "text-emerald-400" : "text-red-400"}>
                {result.success ? "✓" : "✗"}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-200">{result.name}</p>
                {result.error && (
                  <p className="text-xs text-red-400 mt-0.5 truncate">{result.error}</p>
                )}
              </div>
              {result.scheduling_url && (
                <a
                  href={result.scheduling_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors whitespace-nowrap"
                >
                  Voir →
                </a>
              )}
            </li>
          ))}
        </ul>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white font-medium rounded-xl text-sm transition-colors"
        >
          Parfait !
        </button>
      </div>
    </div>
  );
}
