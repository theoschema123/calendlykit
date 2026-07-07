"use client";

import { useState } from "react";
import { Template } from "@/lib/types";

interface TemplateCardProps {
  template: Template;
  isCalendlyConnected: boolean;
  onInstall: (templateId: string) => Promise<void>;
  isInstalling: boolean;
}

export function TemplateCard({
  template,
  isCalendlyConnected,
  onInstall,
  isInstalling,
}: TemplateCardProps) {
  const [expanded, setExpanded] = useState(false);

  const badgeColor =
    template.badge === "Populaire"
      ? "bg-amber-500/15 text-amber-400 border border-amber-500/20"
      : template.badge === "Nouveau"
      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
      : "";

  return (
    <div className="glass-card flex flex-col h-full transition-all duration-200 hover:border-white/[0.14]">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
            style={{ backgroundColor: template.color + "22" }}
          >
            {template.icon}
          </div>
          {template.badge && (
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeColor}`}
            >
              {template.badge}
            </span>
          )}
        </div>

        <h3 className="text-lg font-semibold text-gray-100 mb-1">
          {template.name}
        </h3>
        <p className="text-sm text-gray-400 leading-relaxed mb-4">
          {template.description}
        </p>

        {/* Event count pill */}
        <div className="flex items-center gap-2">
          <div
            className="h-1.5 rounded-full flex-1 bg-white/[0.06]"
            style={{ maxWidth: "100px" }}
          >
            <div
              className="h-1.5 rounded-full transition-all duration-500"
              style={{
                width: `${(template.events.length / 4) * 100}%`,
                backgroundColor: template.color,
              }}
            />
          </div>
          <span className="text-xs text-gray-500">
            {template.events.length} événement
            {template.events.length > 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Events list (expandable) */}
      <div className="px-6 pb-4 flex-1">
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-gray-500 hover:text-gray-300 flex items-center gap-1.5 transition-colors mb-3"
        >
          <svg
            className={`w-3 h-3 transition-transform duration-200 ${expanded ? "rotate-90" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
          {expanded ? "Masquer" : "Voir les événements"}
        </button>

        {expanded && (
          <ul className="space-y-2 animate-[fadeIn_0.2s_ease-out]">
            {template.events.map((event, i) => (
              <li
                key={i}
                className="flex items-start gap-3 py-2.5 px-3 rounded-lg bg-white/[0.03] border border-white/[0.06]"
              >
                <div
                  className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                  style={{ backgroundColor: template.color }}
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-200">
                    {event.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {event.duration} min · {event.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 pb-6">
        <button
          onClick={() => onInstall(template.id)}
          disabled={!isCalendlyConnected || isInstalling}
          className="w-full py-2.5 rounded-xl text-sm font-medium transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            backgroundColor: isCalendlyConnected
              ? template.color + "22"
              : undefined,
            color: isCalendlyConnected ? template.color : "#6b7280",
            border: `1px solid ${isCalendlyConnected ? template.color + "44" : "rgba(255,255,255,0.06)"}`,
          }}
        >
          {isInstalling ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Installation...
            </span>
          ) : !isCalendlyConnected ? (
            "Connectez Calendly d'abord"
          ) : (
            "Installer ce template →"
          )}
        </button>
      </div>
    </div>
  );
}
