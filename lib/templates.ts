import { Template } from "@/lib/types";
import coachTemplate from "@/templates/coach.json";
import agencyTemplate from "@/templates/agency.json";
import consultantTemplate from "@/templates/consultant.json";
import freelanceTemplate from "@/templates/freelance.json";

export const TEMPLATES: Template[] = [
  coachTemplate as unknown as Template,
  agencyTemplate as unknown as Template,
  consultantTemplate as unknown as Template,
  freelanceTemplate as unknown as Template,
];

export function getTemplateById(id: string): Template | undefined {
  return TEMPLATES.find((t) => t.id === id);
}
