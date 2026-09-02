export type ContactStatus = "Lead" | "Customer" | "Churned";

export interface Contact {
  id: string;
  name: string;
  company: string;
  email: string;
  status: ContactStatus;
  owner: string;
  lastActivity: string;
}

export type DealStage = "Qualified" | "Proposal" | "Negotiation" | "Won";

export interface Deal {
  id: string;
  name: string;
  company: string;
  value: number;
  stage: DealStage;
}

export interface CrmSettings {
  crmName: string;
  workspaceName: string;
}

export const DEAL_STAGES: DealStage[] = ["Qualified", "Proposal", "Negotiation", "Won"];
export const CONTACT_STATUSES: ContactStatus[] = ["Lead", "Customer", "Churned"];

export const defaultSettings: CrmSettings = {
  crmName: "Dolly CRM",
  workspaceName: "Acme Inc.",
};

export const initialContacts: Contact[] = [
  {
    id: "ct_01",
    name: "Maya Okafor",
    company: "Brightline Labs",
    email: "maya@brightline.dev",
    status: "Customer",
    owner: "You",
    lastActivity: "2h ago",
  },
  {
    id: "ct_02",
    name: "Daniel Reyes",
    company: "Foxglove Systems",
    email: "daniel@foxglove.io",
    status: "Lead",
    owner: "You",
    lastActivity: "1d ago",
  },
  {
    id: "ct_03",
    name: "Priya Natarajan",
    company: "Halcyon Health",
    email: "priya@halcyon.health",
    status: "Customer",
    owner: "Sam",
    lastActivity: "2d ago",
  },
  {
    id: "ct_04",
    name: "Tomas Lindqvist",
    company: "Nordwind Freight",
    email: "tomas@nordwind.se",
    status: "Lead",
    owner: "Sam",
    lastActivity: "4d ago",
  },
  {
    id: "ct_05",
    name: "Grace Whitfield",
    company: "Juniper & Co",
    email: "grace@juniperco.com",
    status: "Churned",
    owner: "You",
    lastActivity: "3w ago",
  },
];

export const initialDeals: Deal[] = [
  { id: "dl_01", name: "Platform rollout", company: "Brightline Labs", value: 86000, stage: "Negotiation" },
  { id: "dl_02", name: "Starter plan", company: "Foxglove Systems", value: 12500, stage: "Qualified" },
  { id: "dl_03", name: "Annual renewal", company: "Halcyon Health", value: 54000, stage: "Proposal" },
  { id: "dl_04", name: "Fleet expansion", company: "Nordwind Freight", value: 31000, stage: "Qualified" },
  { id: "dl_05", name: "Support upgrade", company: "Juniper & Co", value: 9800, stage: "Won" },
];

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}
