"use client";

import { useState } from "react";

interface CalendlyStatusBannerProps {
  isConnected: boolean;
  userUri?: string | null;
  onConnected: () => void;
}

export function CalendlyStatusBanner({ isConnected, userUri, onConnected }: CalendlyStatusBannerProps) {
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleConnect = async () => {
    if (!apiKey.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/calendly", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: apiKey.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erreur de connexion");
        return;
      }
      setApiKey("");
      setShowForm(false);
      onConnected();
    } catch {
      setError("Erreur reseau");
    } finally {
      setLoading(false);
    }
  };

  if (isConnected && !showForm) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <div className="flex-1">
          <p className="text-sm font-medium text-emerald-300">Cal.com connecte</p>
          {userUri && <p className="text-xs text-emerald-500/80 mt-0.5 font-mono truncate max-w-xs">{userUri}</p>}
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="text-xs text-emerald-500 hover:text-emerald-300 transition-colors underline"
        >
          Changer de cle
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 rounded-xl bg-white/[0.04] border border-white/[0.10]">
      <p className="text-sm font-medium text-gray-300 mb-1">Connectez votre Cal.com</p>
      <p className="text-xs text-gray-500 mb-3">
        Allez sur{" "}
        <a href="https://app.cal.com/settings/developer/api-keys" target="_blank" rel="noopener noreferrer" className="text-indigo-400 underline">
          app.cal.com - Parametres - Cles API
        </a>
        {" "}pour generer votre cle, puis collez-la ici.
      </p>
      <div className="flex gap-2">
        <input
          type="text"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="cal_live_xxxxxxxxxxxx"
          className="flex-1 px-3 py-2 bg-white/[0.06] border border-white/[0.12] rounded-lg text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-mono"
        />
        <button
          onClick={handleConnect}
          disabled={loading || !apiKey.trim()}
          className="px-4 py-2 bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
        >
          {loading ? "Verification..." : "Connecter"}
        </button>
      </div>
      {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
      {isConnected && (
        <button onClick={() => setShowForm(false)} className="text-xs text-gray-500 hover:text-gray-300 mt-2 transition-colors">
          Annuler
        </button>
      )}
    </div>
  );
}
