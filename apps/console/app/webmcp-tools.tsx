"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWebMCPExperience, useWebMCPTool } from "@webmcp-sdk/experience";

import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogPopup,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

import {
  CONTACT_STATUSES,
  DEAL_STAGES,
  formatCurrency,
  type Contact,
  type ContactStatus,
  type DealStage,
} from "./crm-data";
import { useCrm } from "./crm-store";

const EMPTY_SCHEMA = {
  type: "object",
  properties: {},
  additionalProperties: false,
} as const;

const wait = (duration: number) => new Promise((resolve) => setTimeout(resolve, duration));

export function CrmWebMCPTools() {
  const experience = useWebMCPExperience();
  const router = useRouter();
  const crm = useCrm();
  const [duplicateContact, setDuplicateContact] = useState<Contact | null>(null);

  const goTo = async (path: string, selector: string, message: string) => {
    router.push(path);
    await wait(350);
    experience.focus(selector, message);
  };

  useWebMCPTool({
    name: "search_contacts",
    example: "Find everyone at Halcyon Health",
    log: "Searched contacts for “%%query%%”",
    logIcon: "🔍",
    description:
      "Search CRM contacts by name, company, or email. Opens the contacts page filtered to the matches.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Name, company, or email fragment to search for." },
      },
      required: ["query"],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true },
    async execute({ query }: { query: string }) {
      experience.startWork(`Searching contacts for “${query}”…`);

      const needle = query.trim().toLowerCase();
      const matches = crm.contacts.filter((contact) =>
        [contact.name, contact.company, contact.email].some((field) =>
          field.toLowerCase().includes(needle),
        ),
      );
      crm.setContactFilter(needle.length > 0 ? query.trim() : null);
      await goTo("/contacts", "#contacts", "Filtering the contact list…");
      await wait(400);

      experience.endWork(
        matches.length === 1 ? "Found 1 matching contact" : `Found ${matches.length} matching contacts`,
      );

      if (matches.length === 0) {
        return { content: [{ type: "text", text: `No contacts match “${query}”.` }] };
      }
      const lines = matches.map(
        (contact) =>
          `${contact.name} — ${contact.company} (${contact.email}), status: ${contact.status}, last activity ${contact.lastActivity}`,
      );
      return { content: [{ type: "text", text: lines.join("\n") }] };
    },
  });

  useWebMCPTool({
    name: "create_contact",
    example: "Add Bob from Initech as a contact",
    description:
      "Create a new CRM contact. The new contact appears at the top of the contacts page. Duplicates are checked automatically (same email, or same name and company) — if the contact already exists nothing is created, so there is no need to search for duplicates first.",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Full name of the contact." },
        company: { type: "string", description: "Company the contact works for." },
        email: { type: "string", description: "Email address of the contact." },
        status: {
          type: "string",
          enum: CONTACT_STATUSES,
          description: "Optional status; defaults to Lead.",
        },
      },
      required: ["name", "company", "email"],
      additionalProperties: false,
    },
    async execute({
      name,
      company,
      email,
      status,
    }: {
      name: string;
      company: string;
      email: string;
      status?: ContactStatus;
    }) {
      const existing = crm.contacts.find(
        (candidate) =>
          candidate.email.trim().toLowerCase() === email.trim().toLowerCase() ||
          (candidate.name.trim().toLowerCase() === name.trim().toLowerCase() &&
            candidate.company.trim().toLowerCase() === company.trim().toLowerCase()),
      );
      if (existing) {
        setDuplicateContact(existing);
        experience.failWork(`${existing.name} is already a contact`);
        return {
          content: [
            {
              type: "text",
              text: `${existing.name} at ${existing.company} (${existing.email}) is already a contact with status ${existing.status}. Nothing was created.`,
            },
          ],
          isError: true,
        };
      }

      experience.startWork(`Creating a contact for ${name}…`, undefined, { overlay: true });
      await goTo("/contacts", "#contacts", "Adding the contact to the list…");
      // Artificial delay so the glow overlay is easy to see while testing.
      await wait(3000);

      const contact = crm.addContact({ name, company, email, status });

      // Logged manually (not via a `log` template) because the duplicate
      // branch above returns without creating anything.
      experience.logTask("Added %%name%% as a contact", { name: contact.name }, {
        icon: "👤",
        toolName: "create_contact",
      });
      experience.endWork(`${contact.name} added as a ${contact.status.toLowerCase()}`);
      return {
        content: [
          {
            type: "text",
            text: `Created contact ${contact.name} at ${contact.company} (${contact.email}) with status ${contact.status}.`,
          },
        ],
      };
    },
  });

  useWebMCPTool({
    name: "remove_contact",
    example: "Remove Grace Whitfield",
    description:
      "Remove a CRM contact. Match the contact by name, company, or email. The person is asked to approve the removal before it happens.",
    inputSchema: {
      type: "object",
      properties: {
        contact: { type: "string", description: "Name, company, or email of the contact to remove." },
      },
      required: ["contact"],
      additionalProperties: false,
    },
    annotations: { destructiveHint: true },
    async execute({ contact }: { contact: string }) {
      const needle = contact.trim().toLowerCase();
      const match = crm.contacts.find((candidate) =>
        [candidate.name, candidate.company, candidate.email].some((field) =>
          field.toLowerCase().includes(needle),
        ),
      );

      if (!match) {
        experience.failWork(`No contact matches “${contact}”`);
        return {
          content: [{ type: "text", text: `No contact matches “${contact}”. Nothing was removed.` }],
          isError: true,
        };
      }

      const approved = await experience.confirm({
        title: `Remove ${match.name}?`,
        description: `The agent wants to remove ${match.name} (${match.company}, ${match.email}) from your contacts.`,
        tone: "destructive",
        confirmLabel: "Remove",
        autoContinueMs: 5000,
      });
      if (!approved) {
        experience.failWork(`Removing ${match.name} was cancelled`);
        return {
          content: [
            { type: "text", text: `The user cancelled removing ${match.name}. Nothing was removed.` },
          ],
        };
      }

      experience.startWork(`Removing ${match.name}…`);
      await goTo("/contacts", "#contacts", `Removing ${match.name}…`);
      await wait(400);
      crm.removeContact(match.id);

      // Logged manually (not via a `log` template) because the no-match
      // branch above returns without removing anything.
      experience.logTask("Removed %%name%% from contacts", { name: match.name }, {
        icon: "🗑️",
        toolName: "remove_contact",
      });
      experience.endWork(`${match.name} removed`);
      return {
        content: [{ type: "text", text: `Removed ${match.name} (${match.company}, ${match.email}).` }],
      };
    },
  });

  useWebMCPTool({
    name: "create_deal",
    example: "Create a $20k deal with Initech",
    log: "Created the %%name%% deal with %%company%%",
    logIcon: "💼",
    description: "Create a new deal in the pipeline.",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Short name for the deal, e.g. “Annual renewal”." },
        company: { type: "string", description: "Company the deal is with." },
        value: { type: "number", description: "Deal value in US dollars." },
        stage: {
          type: "string",
          enum: DEAL_STAGES,
          description: "Optional pipeline stage; defaults to Qualified.",
        },
      },
      required: ["name", "company", "value"],
      additionalProperties: false,
    },
    async execute({
      name,
      company,
      value,
      stage,
    }: {
      name: string;
      company: string;
      value: number;
      stage?: DealStage;
    }) {
      experience.startWork(`Creating the ${name} deal…`);
      await goTo("/deals", "#deals", "Adding the deal to the pipeline…");
      await wait(400);

      const deal = crm.addDeal({ name, company, value, stage });

      experience.endWork(`${deal.name} added to ${deal.stage}`);
      return {
        content: [
          {
            type: "text",
            text: `Created deal “${deal.name}” with ${deal.company} for ${formatCurrency(deal.value)} in ${deal.stage}.`,
          },
        ],
      };
    },
  });

  useWebMCPTool({
    name: "remove_deal",
    example: "Remove the Juniper deal",
    description:
      "Remove a deal from the pipeline. Match the deal by its name or company. The person is asked to approve the removal before it happens.",
    inputSchema: {
      type: "object",
      properties: {
        deal: { type: "string", description: "Deal name or company to match." },
      },
      required: ["deal"],
      additionalProperties: false,
    },
    annotations: { destructiveHint: true },
    async execute({ deal }: { deal: string }) {
      const needle = deal.trim().toLowerCase();
      const match = crm.deals.find((candidate) =>
        [candidate.name, candidate.company].some((field) => field.toLowerCase().includes(needle)),
      );

      if (!match) {
        experience.failWork(`No deal matches “${deal}”`);
        return {
          content: [{ type: "text", text: `No deal matches “${deal}”. Nothing was removed.` }],
          isError: true,
        };
      }

      const approved = await experience.confirm({
        title: `Remove the ${match.name} deal?`,
        description: `The agent wants to remove “${match.name}” (${match.company}, ${formatCurrency(match.value)}) from the pipeline.`,
        tone: "destructive",
        confirmLabel: "Remove",
        autoContinueMs: 5000,
      });
      if (!approved) {
        experience.failWork(`Removing ${match.name} was cancelled`);
        return {
          content: [
            { type: "text", text: `The user cancelled removing the ${match.name} deal. Nothing was removed.` },
          ],
        };
      }

      experience.startWork(`Removing the ${match.name} deal…`);
      await goTo("/deals", "#deals", `Removing ${match.name}…`);
      await wait(400);
      crm.removeDeal(match.id);

      experience.endWork(`${match.name} removed`);
      return {
        content: [
          {
            type: "text",
            text: `Removed “${match.name}” (${match.company}, ${formatCurrency(match.value)}).`,
          },
        ],
      };
    },
  });

  useWebMCPTool({
    name: "update_deal_stage",
    example: "Move the Brightline deal to Won",
    description:
      "Move a deal to a new pipeline stage. Match the deal by its name or company. Stages: Qualified, Proposal, Negotiation, Won. The person is asked to approve the change before it happens.",
    inputSchema: {
      type: "object",
      properties: {
        deal: { type: "string", description: "Deal name or company to match." },
        stage: {
          type: "string",
          enum: DEAL_STAGES,
          description: "The pipeline stage to move the deal to.",
        },
      },
      required: ["deal", "stage"],
      additionalProperties: false,
    },
    async execute({ deal, stage }: { deal: string; stage: DealStage }) {
      const needle = deal.trim().toLowerCase();
      const match = crm.deals.find((candidate) =>
        [candidate.name, candidate.company].some((field) => field.toLowerCase().includes(needle)),
      );

      if (!match) {
        experience.failWork(`No deal matches “${deal}”`);
        return {
          content: [{ type: "text", text: `No deal matches “${deal}”. Nothing was changed.` }],
          isError: true,
        };
      }
      if (!DEAL_STAGES.includes(stage)) {
        experience.failWork(`“${stage}” is not a pipeline stage`);
        return {
          content: [
            { type: "text", text: `“${stage}” is not a valid stage. Use one of: ${DEAL_STAGES.join(", ")}.` },
          ],
          isError: true,
        };
      }

      const approved = await experience.confirm({
        title: `Move ${match.name} to ${stage}?`,
        description: `The agent wants to move “${match.name}” (${match.company}, ${formatCurrency(match.value)}) from ${match.stage} to ${stage}.`,
        tone: "positive",
        confirmLabel: "Update",
        autoContinueMs: 5000,
      });
      if (!approved) {
        experience.failWork(`Moving ${match.name} was cancelled`);
        return {
          content: [
            { type: "text", text: `The user cancelled moving the ${match.name} deal. Nothing was changed.` },
          ],
        };
      }

      experience.startWork(`Updating the ${match.name} deal…`);
      await goTo("/deals", "#deals", `Moving ${match.name} to ${stage}…`);
      await wait(400);
      crm.updateDealStage(match.id, stage);

      experience.logTask("Moved the %%deal%% deal to %%stage%%", { deal: match.name, stage }, {
        icon: "📈",
        toolName: "update_deal_stage",
      });
      experience.endWork(`${match.name} moved to ${stage}`);
      return {
        content: [
          {
            type: "text",
            text: `Moved “${match.name}” (${match.company}, ${formatCurrency(match.value)}) to ${stage}.`,
          },
        ],
      };
    },
  });

  useWebMCPTool({
    name: "summarize_pipeline",
    example: "How is my pipeline looking?",
    description: "Summarize the current deal pipeline: open value, deal counts per stage, and win rate.",
    inputSchema: EMPTY_SCHEMA,
    annotations: { readOnlyHint: true },
    async execute() {
      experience.startWork("Reading the pipeline…");
      await goTo("/deals", "#deals", "Totaling deals per stage…");
      await wait(400);

      const deals = crm.deals;
      const openDeals = deals.filter((candidate) => candidate.stage !== "Won");
      const openValue = openDeals.reduce((sum, candidate) => sum + candidate.value, 0);
      const perStage = DEAL_STAGES.map(
        (stage) => `${stage}: ${deals.filter((candidate) => candidate.stage === stage).length}`,
      ).join(", ");
      const winRate =
        deals.length === 0
          ? 0
          : Math.round((deals.filter((candidate) => candidate.stage === "Won").length / deals.length) * 100);

      experience.endWork("Pipeline summary ready");
      return {
        content: [
          {
            type: "text",
            text: `Open pipeline is ${formatCurrency(openValue)} across ${openDeals.length} deals (${perStage}). Win rate: ${winRate}%.`,
          },
        ],
      };
    },
  });

  useWebMCPTool({
    name: "update_crm_settings",
    example: "Rename the CRM to Pipeline Pro",
    description:
      "Update workspace settings: rename the CRM or the workspace shown in the sidebar.",
    inputSchema: {
      type: "object",
      properties: {
        crmName: { type: "string", description: "New name for the CRM product, e.g. “Relay CRM”." },
        workspaceName: { type: "string", description: "New name for the workspace, e.g. “Acme Inc.”." },
      },
      additionalProperties: false,
    },
    async execute({ crmName, workspaceName }: { crmName?: string; workspaceName?: string }) {
      const changes: string[] = [];
      if (crmName?.trim()) changes.push(`CRM name to “${crmName.trim()}”`);
      if (workspaceName?.trim()) changes.push(`workspace name to “${workspaceName.trim()}”`);

      if (changes.length === 0) {
        experience.failWork("No settings were provided");
        return {
          content: [{ type: "text", text: "Provide crmName and/or workspaceName to update settings." }],
          isError: true,
        };
      }

      experience.startWork("Updating workspace settings…");
      await goTo("/settings", "#crm-settings", "Applying the new names…");
      await wait(400);

      crm.updateSettings({
        ...(crmName?.trim() ? { crmName: crmName.trim() } : {}),
        ...(workspaceName?.trim() ? { workspaceName: workspaceName.trim() } : {}),
      });

      experience.endWork("Settings updated");
      return { content: [{ type: "text", text: `Updated ${changes.join(" and ")}.` }] };
    },
  });

  return (
    <AlertDialog
      open={duplicateContact !== null}
      onOpenChange={(open) => {
        if (!open) setDuplicateContact(null);
      }}
    >
      {duplicateContact ? (
        <AlertDialogPopup className="max-w-100">
          <AlertDialogHeader>
            <AlertDialogTitle>Already a contact</AlertDialogTitle>
            <AlertDialogDescription>
              {duplicateContact.name} at {duplicateContact.company} ({duplicateContact.email}) is
              already in your contacts with status {duplicateContact.status}, so nothing was added.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogClose render={<Button />}>OK</AlertDialogClose>
          </AlertDialogFooter>
        </AlertDialogPopup>
      ) : null}
    </AlertDialog>
  );
}
