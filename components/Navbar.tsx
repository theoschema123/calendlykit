"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

interface NavbarProps {
  userEmail?: string;
}

export function Navbar({ userEmail }: NavbarProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <nav className="border-b border-white/[0.06] bg-gray-950/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-gray-100">CalendlyKit</span>
          <span className="text-xs px-1.5 py-0.5 bg-indigo-500/20 text-indigo-400 rounded font-mono">beta</span>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {userEmail && (
            <span className="text-xs text-gray-500 hidden sm:block">{userEmail}</span>
          )}
          <button
            onClick={handleSignOut}
            className="text-sm text-gray-400 hover:text-gray-200 transition-colors"
          >
            Déconnexion
          </button>
        </div>
      </div>
    </nav>
  );
}
