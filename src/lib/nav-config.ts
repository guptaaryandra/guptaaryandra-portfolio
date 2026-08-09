// Single source of truth for site navigation.
// Section order here drives DOM order, nav labels, numbering, and active state.
export type NavItem = {
  id: string;
  label: string;
  desktop?: boolean; // include in desktop navbar
};

export const NAV_ITEMS: NavItem[] = [
  { id: "about", label: "README", desktop: true },
  { id: "work", label: "EXPERIENCE", desktop: true },
  { id: "experience", label: "LOGBOOK", desktop: true },

  { id: "projects", label: "DEPLOYMENTS", desktop: true },
  { id: "learning", label: "LAB", desktop: true },
  { id: "stack", label: "ECOSYSTEM", desktop: true },
  { id: "roadmap", label: "TRAJECTORY", desktop: true },
  { id: "contact", label: "CONNECT", desktop: true },
];

export const navNumber = (i: number) => String(i + 1).padStart(2, "0");
