import { Template } from "@/lib/types";
import consultationTemplate from "@/templates/coach.json";

export const TEMPLATES: Template[] = [
  consultationTemplate as unknown as Template,
];

export function getTemplateById(id: string): Template | undefined {
  return TEMPLATES.find((t) => t.id === id);
}
