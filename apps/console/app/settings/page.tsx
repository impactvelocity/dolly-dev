"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import { useCrm } from "../crm-store";

export default function SettingsPage() {
  const { settings, updateSettings, resetData } = useCrm();
  const [workspaceName, setWorkspaceName] = useState(settings.workspaceName);
  const [saved, setSaved] = useState(false);

  // Keep the form in sync when settings change elsewhere (e.g. an agent tool).
  const [prevSettings, setPrevSettings] = useState(settings);
  if (prevSettings !== settings) {
    setPrevSettings(settings);
    setWorkspaceName(settings.workspaceName);
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    updateSettings({
      workspaceName: workspaceName.trim() || settings.workspaceName,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="mx-auto w-full max-w-[1220px] px-7 pt-8 pb-12 max-sm:px-4 max-sm:pt-6">
      <div className="mb-6">
        <h1 className="font-heading text-[28px]">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Workspace preferences for this demo. Everything is stored in your browser.
        </p>
      </div>

      <Card id="crm-settings" className="mb-3.5">
        <CardHeader className="border-b p-4.5">
          <CardTitle className="text-[15px] font-normal">Workspace</CardTitle>
          <CardDescription className="text-[13px]">Name shown across the app.</CardDescription>
        </CardHeader>
        <CardPanel className="p-4.5">
          <form className="flex max-w-105 flex-col gap-4" onSubmit={handleSubmit}>
            <Field>
              <FieldLabel>Workspace name</FieldLabel>
              <Input
                type="text"
                value={workspaceName}
                onChange={(event) => setWorkspaceName(event.target.value)}
                placeholder="Acme Inc."
              />
            </Field>
            <div className="flex items-center gap-3">
              <Button type="submit">Save changes</Button>
              {saved ? (
                <span className="text-xs font-medium text-success-foreground">Saved</span>
              ) : null}
            </div>
          </form>
        </CardPanel>
      </Card>

      <Card>
        <CardHeader className="p-4.5">
          <CardTitle className="text-[15px] font-normal">Demo data</CardTitle>
          <CardDescription className="text-[13px]">
            Restore the seeded contacts and deals.
          </CardDescription>
          <CardAction>
            <Button variant="outline" size="sm" onClick={resetData}>
              Reset demo data
            </Button>
          </CardAction>
        </CardHeader>
      </Card>
    </div>
  );
}
