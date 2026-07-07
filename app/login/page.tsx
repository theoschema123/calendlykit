import { AuthForm } from "@/components/AuthForm";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-indigo-500/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-500 mb-4 shadow-lg shadow-indigo-500/25">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-100 mb-1">CalendlyKit</h1>
          <p className="text-sm text-gray-500">Configurez Calendly en moins de 60 secondes</p>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-8">
          {[
            { icon: "🔌", label: "OAuth sécurisé" },
            { icon: "⚡", label: "1-click install" },
            { icon: "🎯", label: "4 templates" },
          ].map((f) => (
            <div key={f.label} className="glass-card p-3 text-center">
              <p className="text-lg mb-1">{f.icon}</p>
              <p className="text-xs text-gray-400">{f.label}</p>
            </div>
          ))}
        </div>

        <AuthForm />
      </div>
    </div>
  );
}
