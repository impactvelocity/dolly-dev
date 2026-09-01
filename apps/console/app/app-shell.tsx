"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Handshake,
  LayoutDashboard,
  Settings,
  TerminalSquare,
  Users,
} from "lucide-react";
import {
  AgentStatusBadge,
  AgentStatusHeader,
  AgentToolsDrawer,
  OpenInButton,
} from "@webmcp-sdk/experience";
import { useState, type ReactNode } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import { initials } from "./crm-data";
import { useCrm } from "./crm-store";
import { useDevConfig } from "./dev-config";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/contacts", label: "Contacts", icon: Users },
  { href: "/deals", label: "Deals", icon: Handshake },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { settings } = useCrm();
  const { config } = useDevConfig();
  const [toolsOpen, setToolsOpen] = useState(false);

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2.5 px-2 py-1.5">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border bg-linear-to-b from-background to-muted font-semibold text-xs">
              {settings.crmName.charAt(0).toUpperCase()}
            </span>
            <span className="truncate font-heading text-base text-sidebar-accent-foreground">
              {settings.crmName}
            </span>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu aria-label="Primary navigation">
                {NAV_ITEMS.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={pathname === item.href}
                      render={<Link href={item.href} />}
                    >
                      <item.icon />
                      {item.label}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarSeparator />
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={pathname === "/dev"}
                    render={<Link href="/dev" />}
                  >
                    <TerminalSquare />
                    Dev
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <OpenInButton agent="openai" className="w-full justify-between" />
          <SidebarSeparator />
          <div className="flex items-center gap-2.5 px-2 py-1.5">
            <Avatar className="border">
              <AvatarFallback className="text-[9px] font-semibold">
                {initials(settings.workspaceName)}
              </AvatarFallback>
            </Avatar>
            <span className="min-w-0">
              <strong className="block truncate text-xs font-semibold text-sidebar-accent-foreground">
                {settings.workspaceName}
              </strong>
              <small className="block truncate text-[11px] text-muted-foreground">
                Sales team
              </small>
            </span>
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="min-w-0">
        {config.showHeader ? (
          <AgentStatusHeader
            showIndicator
            showProgress
            showActivity={config.headerProgressText}
            showHistory={config.showHistory}
            onInfoClick={() => setToolsOpen(true)}
          />
        ) : null}
        {config.showBadge ? <AgentStatusBadge corner="bottom-right" /> : null}
        <AgentToolsDrawer
          open={toolsOpen}
          onClose={() => setToolsOpen(false)}
          title={`What ChatGPT can do in ${settings.crmName}`}
          description="These tools are available to agents on this page. Ask in plain language — the CRM updates live while the agent works."
        />
        <header className="app-header sticky top-0 z-10 flex h-15 items-center justify-between gap-4 border-b bg-background/92 px-7 backdrop-blur-md max-sm:px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="md:hidden" variant="ghost" />
            <span className="font-heading text-[15px] md:hidden">{settings.crmName}</span>
            <span className="text-xs text-muted-foreground max-md:hidden">
              Workspace <b className="px-1 font-normal text-muted-foreground/64">/</b> Sales
            </span>
          </div>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
