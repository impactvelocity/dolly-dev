"use client";

import Link from "next/link";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { DEAL_STAGES, formatCurrency, initials } from "./crm-data";
import { useCrm } from "./crm-store";
import { STAGE_BADGE_VARIANT, STATUS_BADGE_VARIANT } from "./badges";

export default function DashboardPage() {
  const { contacts, deals } = useCrm();

  const openDeals = deals.filter((deal) => deal.stage !== "Won");
  const openValue = openDeals.reduce((sum, deal) => sum + deal.value, 0);
  const winRate =
    deals.length === 0
      ? 0
      : Math.round((deals.filter((deal) => deal.stage === "Won").length / deals.length) * 100);
  const recentContacts = contacts.slice(0, 5);

  return (
    <div className="mx-auto w-full max-w-[1220px] px-7 pt-8 pb-12 max-sm:px-4 max-sm:pt-6">
      <div className="mb-6">
        <h1 className="font-heading text-2xl">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track your contacts, deals, and pipeline at a glance.
        </p>
      </div>

      <section
        id="metrics"
        className="grid grid-cols-3 gap-3.5 max-sm:grid-cols-1"
        aria-label="Key metrics"
      >
        <Card>
          <CardPanel className="p-5">
            <p className="text-xs font-medium text-muted-foreground">Open pipeline</p>
            <strong className="mt-3 block font-heading text-[28px] font-normal">
              {formatCurrency(openValue)}
            </strong>
            <small className="mt-2 block text-[11px] text-muted-foreground">
              <b className="font-semibold text-foreground">{openDeals.length} open deals</b> across{" "}
              {DEAL_STAGES.length - 1} stages
            </small>
          </CardPanel>
        </Card>
        <Card>
          <CardPanel className="p-5">
            <p className="text-xs font-medium text-muted-foreground">Contacts</p>
            <strong className="mt-3 block font-heading text-[28px] font-normal">
              {contacts.length}
            </strong>
            <small className="mt-2 block text-[11px] text-muted-foreground">
              <b className="font-semibold text-foreground">
                {contacts.filter((contact) => contact.status === "Lead").length} leads
              </b>{" "}
              awaiting follow-up
            </small>
          </CardPanel>
        </Card>
        <Card>
          <CardPanel className="p-5">
            <p className="text-xs font-medium text-muted-foreground">Win rate</p>
            <strong className="mt-3 block font-heading text-[28px] font-normal">{winRate}%</strong>
            <small className="mt-2 block text-[11px] text-muted-foreground">
              Across {deals.length} deals this quarter
            </small>
          </CardPanel>
        </Card>
      </section>

      <div className="mt-3.5 grid grid-cols-[minmax(0,1.45fr)_minmax(260px,.55fr)] items-start gap-3.5 max-md:grid-cols-1">
        <Card id="contacts">
          <CardHeader className="border-b p-4.5">
            <CardTitle className="text-[15px] font-normal">Recent contacts</CardTitle>
            <CardDescription className="text-[13px]">
              The people your team talked to last.
            </CardDescription>
            <CardAction>
              <Button variant="outline" size="sm" render={<Link href="/contacts" />}>
                View all
              </Button>
            </CardAction>
          </CardHeader>
          <Table className="min-w-[590px]">
            <TableHeader>
              <TableRow>
                <TableHead className="px-4">Name</TableHead>
                <TableHead className="px-4">Email</TableHead>
                <TableHead className="px-4">Status</TableHead>
                <TableHead className="px-4">Last activity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentContacts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-7 text-center text-muted-foreground">
                    No contacts yet.
                  </TableCell>
                </TableRow>
              ) : (
                recentContacts.map((contact) => (
                  <TableRow key={contact.id}>
                    <TableCell className="px-4 py-3">
                      <span className="flex items-center gap-2.5">
                        <Avatar className="size-7 border text-[9px] font-semibold">
                          <AvatarFallback>{initials(contact.name)}</AvatarFallback>
                        </Avatar>
                        <span className="leading-tight">
                          <strong className="block text-xs font-semibold">{contact.name}</strong>
                          <small className="mt-0.5 block text-[11px] text-muted-foreground">
                            {contact.company}
                          </small>
                        </span>
                      </span>
                    </TableCell>
                    <TableCell className="px-4 font-mono text-[11px] text-muted-foreground">
                      {contact.email}
                    </TableCell>
                    <TableCell className="px-4">
                      <Badge variant={STATUS_BADGE_VARIANT[contact.status]}>{contact.status}</Badge>
                    </TableCell>
                    <TableCell className="px-4 text-xs">{contact.lastActivity}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>

        <Card id="deals">
          <CardHeader className="border-b p-4.5">
            <CardTitle className="text-[15px] font-normal">Deals</CardTitle>
            <CardDescription className="text-[13px]">Active pipeline by stage.</CardDescription>
            <CardAction>
              <Button variant="outline" size="sm" render={<Link href="/deals" />}>
                View all
              </Button>
            </CardAction>
          </CardHeader>
          {deals.length === 0 ? (
            <p className="py-6 text-center text-xs text-muted-foreground">
              No deals in the pipeline.
            </p>
          ) : (
            <div>
              {deals.slice(0, 5).map((deal, index, shown) => (
                <div
                  key={deal.id}
                  className={`flex items-center justify-between gap-3 px-4 py-3 ${
                    index < shown.length - 1 ? "border-b" : ""
                  }`}
                >
                  <span className="min-w-0 leading-tight">
                    <strong className="block truncate text-xs font-semibold">{deal.name}</strong>
                    <small className="mt-0.5 block truncate text-[11px] text-muted-foreground">
                      {deal.company}
                    </small>
                  </span>
                  <span className="flex shrink-0 flex-col items-end gap-1">
                    <b className="font-mono text-[11px] font-semibold">
                      {formatCurrency(deal.value)}
                    </b>
                    <Badge size="sm" variant={STAGE_BADGE_VARIANT[deal.stage]}>
                      {deal.stage}
                    </Badge>
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
