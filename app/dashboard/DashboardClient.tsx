"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { TemplateCard } from "@/components/TemplateCard";
import { CalendlyStatusBanner } from "@/components/CalendlyStatusBanner";
import { Navbar } from "@/components/Navbar";
import { Template } from "@/lib/types";

interface CalendlyStatus {
  connected: boolean;
  userUri: string | null;
}

export default function DashboardClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [userEmail, setUserEmail] = useState<string | undefined>();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [calendlyStatus, setCalendlyStatus] = useState<CalendlyStatus>({ connected: false, userUri: null });
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const showToast = useCallback((type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const refreshCalendlyStatus = useCallback(async () => {
    const r = await fetch("/api/user/calendly-status");
    const d = await r.json();
    setCalendlyStatus({ connected: d.connected, userUri: d.userUri });
  }, []);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setUserEmail(user.email);
      const tr = await fetch("/api/templates");
      const td = await tr.json();
      setTemplates(td.templates ?? []);
      await refreshCalendlyStatus();
      setLoading(false);
    };
    init();
  }, [router, refreshCalendlyStatus]);

  useEffect(() => {
    if (searchParams.get("error")) showToast("error", "Une erreur est survenue.");
  }, [searchParams, showToast]);

  const handleInstall = async (templateId: string): Promise<void> => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;
    template.events.forEach((event, i) => {
      setTimeout(() => {
        const p = new URLSearchParams({ name: event.name, duration: String(event.duration), description: event.description ?? "" });
        window.open(`https://calendly.com/event_types/new?${p.toString()}`, "_blank");
      }, i * 600);
    });
    showToast("success", "Calendly s'ouvre — cliquez Save pour chaque evenement !");
  };

  const handleConnected = useCallback(async () => {
    await refreshCalendlyStatus();
    showToast("success", "Calendly connecte !");
  }, [refreshCalendlyStatus, showToast]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <>
      <Navbar userEmail={userEmail} />
      <main className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-100 mb-1">Installer votre template</h1>
          <p className="text-gray-400 text-sm">Connectez Calendly puis cliquez Installer — la page Calendly s&apos;ouvre pre-configuree, cliquez juste Save.</p>
        </div>
        <div className="flex items-center gap-2 mb-6">
          {[
            { num: 1, label: "Compte", done: !!userEmail },
            { num: 2, label: "Calendly", done: calendlyStatus.connected },
            { num: 3, label: "Installer", done: false },
          ].map((step, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${step.done ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20" : "bg-white/[0.04] text-gray-500 border border-white/[0.06]"}`}>
                <span>{step.done ? "v" : step.num}</span>
                <span className="hidden sm:inline">{step.label}</span>
              </div>
              {i < 2 && <div className="w-4 h-px bg-white/[0.08]" />}
            </div>
          ))}
        </div>
        <div className="mb-8">
          <CalendlyStatusBanner isConnected={calendlyStatus.connected} userUri={calendlyStatus.userUri} onConnected={handleConnected} />
        </div>
        <div className="grid grid-cols-1 gap-4">
          {templates.map(template => (
            <TemplateCard key={template.id} template={template} isCalendlyConnected={calendlyStatus.connected} onInstall={handleInstall} isInstalling={false} />
          ))}
        </div>
        <div className="mt-6 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <p className="text-xs text-amber-400">Une fenetre Calendly va s&apos;ouvrir pre-configuree. Cliquez &quot;Save&quot; pour creer l&apos;evenement.</p>
        </div>
      </main>
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 max-w-sm px-4 py-3 rounded-xl shadow-xl border text-sm font-medium ${toast.type === "success" ? "bg-emerald-900/90 border-emerald-500/30 text-emerald-300" : "bg-red-900/90 border-red-500/30 text-red-300"}`}>
          {toast.message}
        </div>
      )}
    </>
  );
}
