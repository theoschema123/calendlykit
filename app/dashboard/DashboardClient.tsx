"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { TemplateCard } from "@/components/TemplateCard";
import { CalendlyStatusBanner } from "@/components/CalendlyStatusBanner";
import { InstallResultModal } from "@/components/InstallResultModal";
import { Navbar } from "@/components/Navbar";
import { Template } from "@/lib/types";

interface CalendlyStatus {
  connected: boolean;
  userUri: string | null;
}

interface InstallResult {
  name: string;
  success: boolean;
  scheduling_url?: string;
  error?: string;
}

interface InstallResponse {
  success: boolean;
  status: "success" | "partial" | "failed";
  template: string;
  results: InstallResult[];
  summary: { total: number; created: number; failed: number };
}

async function createCalendlyEvent(
  token: string,
  ownerUri: string,
  event: { name: string; duration: number; description?: string }
): Promise<InstallResult> {
  try {
    const res = await fetch("https://api.calendly.com/event_types", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: event.name,
        host: ownerUri,
        duration: event.duration,
        description_html: event.description ? `<p>${event.description}</p>` : undefined,
        kind: "solo",
        type: "StandardEventType",
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { name: event.name, success: false, error: data.message ?? data.title ?? "Erreur API" };
    }
    return {
      name: event.name,
      success: true,
      scheduling_url: data.resource?.scheduling_url,
    };
  } catch (err) {
    return { name: event.name, success: false, error: String(err) };
  }
}

export default function DashboardClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [userEmail, setUserEmail] = useState<string | undefined>();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [calendlyStatus, setCalendlyStatus] = useState<CalendlyStatus>({ connected: false, userUri: null });
  const [installingId, setInstallingId] = useState<string | null>(null);
  const [installResult, setInstallResult] = useState<InstallResponse | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const showToast = useCallback((type: "success" | "error" | "info", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const refreshCalendlyStatus = useCallback(async () => {
    const statusRes = await fetch("/api/user/calendly-status");
    const statusData = await statusRes.json();
    setCalendlyStatus({ connected: statusData.connected, userUri: statusData.userUri });
  }, []);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setUserEmail(user.email);
      const templatesRes = await fetch("/api/templates");
      const templatesData = await templatesRes.json();
      setTemplates(templatesData.templates ?? []);
      await refreshCalendlyStatus();
      setLoading(false);
    };
    init();
  }, [router, refreshCalendlyStatus]);

  useEffect(() => {
    const error = searchParams.get("error");
    if (error) showToast("error", "Une erreur est survenue. Reessayez.");
  }, [searchParams, showToast]);

  const handleInstall = async (templateId: string) => {
    if (!calendlyStatus.connected) {
      showToast("error", "Connectez d'abord votre compte Calendly.");
      return;
    }
    setInstallingId(templateId);
    try {
      const res = await fetch("/api/install-template", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast("error", data.error ?? "Erreur.");
        return;
      }

      const { token, ownerUri, events, templateName } = data;
      const results: InstallResult[] = [];
      for (const event of events) {
        const result = await createCalendlyEvent(token, ownerUri, event);
        results.push(result);
        await new Promise(r => setTimeout(r, 300));
      }

      const created = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;
      const status = failed === 0 ? "success" : created > 0 ? "partial" : "failed";

      setInstallResult({
        success: true,
        status,
        template: templateName,
        results,
        summary: { total: results.length, created, failed },
      });
    } catch {
      showToast("error", "Erreur reseau.");
    } finally {
      setInstallingId(null);
    }
  };

  const handleConnected = useCallback(async () => {
    await refreshCalendlyStatus();
    showToast("success", "Calendly connecte avec succes !");
  }, [refreshCalendlyStatus, showToast]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar userEmail={userEmail} />
      <main className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-100 mb-1">Installer votre template</h1>
          <p className="text-gray-400 text-sm">Connectez Calendly puis installez votre evenement en 1 clic.</p>
        </div>

        <div className="flex items-center gap-2 mb-6">
          {[
            { num: 1, label: "Connexion compte", done: !!userEmail },
            { num: 2, label: "Connecter Calendly", done: calendlyStatus.connected },
            { num: 3, label: "Installer", done: false },
          ].map((step, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${
                step.done ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20" : "bg-white/[0.04] text-gray-500 border border-white/[0.06]"
              }`}>
                <span>{step.done ? "v" : step.num}</span>
                <span className="hidden sm:inline">{step.label}</span>
              </div>
              {i < 2 && <div className="w-4 h-px bg-white/[0.08]" />}
            </div>
          ))}
        </div>

        <div className="mb-8">
          <CalendlyStatusBanner
            isConnected={calendlyStatus.connected}
            userUri={calendlyStatus.userUri}
            onConnected={handleConnected}
          />
        </div>

        <div className="grid grid-cols-1 gap-4">
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              isCalendlyConnected={calendlyStatus.connected}
              onInstall={handleInstall}
              isInstalling={installingId === template.id}
            />
          ))}
        </div>
      </main>

      {installResult && (
        <InstallResultModal
          isOpen={true}
          onClose={() => setInstallResult(null)}
          templateName={installResult.template}
          results={installResult.results}
          summary={installResult.summary}
          status={installResult.status}
        />
      )}

      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 max-w-sm px-4 py-3 rounded-xl shadow-xl border text-sm font-medium ${
          toast.type === "success" ? "bg-emerald-900/90 border-emerald-500/30 text-emerald-300"
          : toast.type === "error" ? "bg-red-900/90 border-red-500/30 text-red-300"
          : "bg-gray-800/90 border-white/10 text-gray-300"
        }`}>
          {toast.message}
        </div>
      )}
    </>
  );
}
