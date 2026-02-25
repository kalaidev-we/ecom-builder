export interface TemplateDefinition {
  id: string;
  name: string;
  description: string;
}

export const templates: TemplateDefinition[] = [
  {
    id: "minimal",
    name: "Minimal",
    description: "Simple clean store",
  },
  {
    id: "modern",
    name: "Modern",
    description: "Modern ecommerce UI",
  },
  {
    id: "fashion",
    name: "Fashion",
    description: "Fashion focused layout",
  },
];

export const isTemplateId = (value: string) => templates.some((template) => template.id === value);
