export interface TemplateEvent {
  name: string;
  duration: number;
  description: string;
  slug?: string;
}

export interface Template {
  id: string;
  name: string;
  tagline: string;
  description: string;
  icon: string;
  color: string;
  badge?: string | null;
  events: TemplateEvent[];
}
