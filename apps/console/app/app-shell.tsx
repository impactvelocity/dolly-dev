"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AgentStatusHeader,
  AgentToolsDrawer,
  OpenInButton,
} from "@dolly/rig";
import { useEffect, useState, type ReactNode } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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
  useSidebar,
} from "@/components/ui/sidebar";

import { initials } from "./crm-data";
import { useCrm } from "./crm-store";
import { useDevConfig } from "./dev-config";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard" },
  { href: "/contacts", label: "Contacts" },
  { href: "/deals", label: "Deals" },
  { href: "/settings", label: "Settings" },
];

const NAV_BUTTON_CLASSES =
  "h-auto rounded-[10px] px-3.5 py-2 text-[15px] font-medium text-sidebar-accent-foreground hover:bg-sidebar-accent/64 data-[active=true]:bg-card data-[active=true]:shadow-pill";

function AppSidebar() {
  const pathname = usePathname();
  const { settings } = useCrm();
  const { isMobile, setOpenMobile } = useSidebar();

  // On mobile the sidebar is a sheet — navigating should dismiss it.
  const closeMobile = () => {
    if (isMobile) setOpenMobile(false);
  };

  // Belt and braces: also close when the route actually changes, in case a
  // navigation happens without going through a menu button.
  useEffect(() => {
    setOpenMobile(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only the route change should close the sheet.
  }, [pathname]);

  return (
    <Sidebar variant="floating">
        <SidebarHeader className="px-5 pt-5 pb-2">
          <span className="flex items-center gap-2.5 truncate font-heading text-xl text-sidebar-accent-foreground">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="" className="h-[22px] w-[22px]" />
            Dolly CRM
          </span>
        </SidebarHeader>

        <SidebarContent className="gap-0">
          <SidebarGroup className="px-3">
            <SidebarGroupContent>
              <SidebarMenu aria-label="Primary navigation" className="gap-1">
                {NAV_ITEMS.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={pathname === item.href}
                      render={<Link href={item.href} />}
                      className={NAV_BUTTON_CLASSES}
                      onClick={closeMobile}
                    >
                      {item.label}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarSeparator className="mx-5 mt-4" />
          <SidebarGroup className="mt-4 px-3">
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={pathname === "/dev"}
                    render={<Link href="/dev" />}
                    className={NAV_BUTTON_CLASSES}
                    onClick={closeMobile}
                  >
                    Dev
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="gap-3 px-4 pb-4">
          <OpenInButton
            agent="openai"
            url="https://dolly-crm.vercel.app/"
            className={cn(
              buttonVariants({ variant: "default", size: "lg" }),
              "w-full justify-between font-bold",
            )}
          />
          <div className="flex items-center gap-2.5 px-1 py-1">
            <Avatar className="border">
              <AvatarFallback className="text-[9px] font-medium">
                {initials(settings.workspaceName)}
              </AvatarFallback>
            </Avatar>
            <span className="min-w-0">
              <strong className="block truncate text-[13px] font-medium text-sidebar-accent-foreground">
                {settings.workspaceName}
              </strong>
              <small className="block truncate text-xs text-muted-foreground">
                Sales team
              </small>
            </span>
          </div>
        </SidebarFooter>
    </Sidebar>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { config } = useDevConfig();
  const [toolsOpen, setToolsOpen] = useState(false);

  return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset className="min-w-0">
        <header className="sticky top-0 z-10 flex h-13 items-center gap-1.5 bg-background/92 px-3 backdrop-blur-md md:hidden">
          <SidebarTrigger variant="ghost" />
          <span className="flex items-center gap-2 font-heading text-[15px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="" className="h-[18px] w-[18px]" />
            Dolly CRM
          </span>
        </header>
        {config.showHeader ? (
          <div className="px-6 pt-6 rounded-lg mx-auto w-full max-w-[1220px] max-md:px-3 max-md:pt-1">
          <AgentStatusHeader
            className="z-40 rounded-lg max-sm:gap-2 max-sm:px-2.5"
            showIndicator
            showProgress
            showActivity={config.headerProgressText}
            showHistory={config.showHistory}
            historyDrawer={{ title: "Agent Activity Log" }}
            onInfoClick={() => setToolsOpen(true)}
            />
          </div>
        ) : null}
        <AgentToolsDrawer
          open={toolsOpen}
          onClose={() => setToolsOpen(false)}
          title="What you can do with your Agent"
          description="These tools are available to agents on this page. Ask in plain language — the CRM updates live while the agent works."
        />
        {children}
        <footer className="mx-auto mt-auto w-full max-w-[1220px] px-7 pb-6 max-sm:px-4">
          <a
            href="https://dolly.dev"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Built with Dolly.dev
          </a>
        </footer>
      </SidebarInset>
    </SidebarProvider>
  );
}
