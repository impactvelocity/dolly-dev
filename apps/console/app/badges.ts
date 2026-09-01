import type { BadgeProps } from "@/components/ui/badge";

import type { ContactStatus, DealStage } from "./crm-data";

export const STAGE_BADGE_VARIANT: Record<DealStage, BadgeProps["variant"]> = {
  Qualified: "secondary",
  Proposal: "info",
  Negotiation: "warning",
  Won: "success",
};

export const STATUS_BADGE_VARIANT: Record<ContactStatus, BadgeProps["variant"]> = {
  Lead: "info",
  Customer: "success",
  Churned: "secondary",
};
