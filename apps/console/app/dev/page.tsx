"use client";

import { useRef } from "react";
import { useWebMCPExperience } from "@webmcp-sdk/experience";

import { ColorSwatchPicker } from "@/components/color-swatch-picker";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

import { useDevConfig, type DevConfig } from "../dev-config";

const PROGRESS_MESSAGES = [
  "Reading the request…",
  "Looking up records…",
  "Applying changes…",
  "Almost done…",
];

const TARGETS = [
  { id: "dev-target-1", name: "Brightline Labs", detail: "Customer · $86,000" },
  { id: "dev-target-2", name: "Foxglove Systems", detail: "Lead · $12,500" },
  { id: "dev-target-3", name: "Halcyon Health", detail: "Customer · $54,000" },
  { id: "dev-target-4", name: "Nordwind Freight", detail: "Lead · $31,000" },
];

const wait = (duration: number) => new Promise((resolve) => setTimeout(resolve, duration));

const TOGGLES: Array<{
  key: keyof Pick<
    DevConfig,
    | "showBadge"
    | "showHeader"
    | "headerProgressText"
    | "showHistory"
    | "generalLoading"
    | "endingToast"
    | "highlightFocus"
  >;
  label: string;
  detail: string;
}> = [
  { key: "showBadge", label: "Badge", detail: "Floating status badge in the corner." },
  { key: "showHeader", label: "Header", detail: "Full-width status bar at the top." },
  {
    key: "headerProgressText",
    label: "Header progress text",
    detail: "Live activity in the header — off keeps the static connected label.",
  },
  { key: "showHistory", label: "Show history", detail: "Activity affordance + drawer in the header." },
  {
    key: "generalLoading",
    label: "General loading",
    detail: "Glow overlay on every work step, not just opted-in ones.",
  },
  { key: "endingToast", label: "Ending toast", detail: "Toast announcing what happened on settle." },
  { key: "highlightFocus", label: "Highlight focus areas", detail: "Dim the page around focused elements." },
];

function DevConfigPanel() {
  const { config, update, reset } = useDevConfig();

  return (
    <>
      <Card className="mb-3.5">
        <CardHeader className="border-b p-4.5">
          <CardTitle className="text-[15px] font-normal">Toggles</CardTitle>
          <CardDescription className="text-[13px]">
            Turn each experience surface on or off. Saved to localStorage.
          </CardDescription>
          <CardAction>
            <Button variant="outline" size="sm" onClick={reset}>
              Reset to defaults
            </Button>
          </CardAction>
        </CardHeader>
        <CardPanel className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-x-5 gap-y-3.5 p-4.5">
          {TOGGLES.map((toggle) => (
            <Label
              key={toggle.key}
              className="flex cursor-pointer items-start gap-2.5 font-normal"
            >
              <Switch
                checked={config[toggle.key]}
                onCheckedChange={(checked) => update({ [toggle.key]: checked })}
                className="mt-0.5"
              />
              <span className="flex flex-col gap-0.5">
                <strong className="text-xs font-semibold">{toggle.label}</strong>
                <small className="text-[11px] text-muted-foreground">{toggle.detail}</small>
              </span>
            </Label>
          ))}
        </CardPanel>
      </Card>

      <Card className="mb-3.5">
        <CardHeader className="border-b p-4.5">
          <CardTitle className="text-[15px] font-normal">Branding / theme</CardTitle>
          <CardDescription className="text-[13px]">
            Colors and mode for every experience surface.
          </CardDescription>
        </CardHeader>
        <CardPanel className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-x-5 gap-y-3.5 p-4.5">
          <div className="flex flex-col gap-2">
            <strong className="text-xs font-semibold">Mode</strong>
            <ToggleGroup
              aria-label="Color scheme"
              variant="outline"
              value={[config.mode]}
              onValueChange={(groupValue: unknown[]) => {
                const mode = groupValue[0];
                if (mode === "light" || mode === "dark") update({ mode });
              }}
            >
              <ToggleGroupItem value="light" size="sm">
                Light
              </ToggleGroupItem>
              <ToggleGroupItem value="dark" size="sm">
                Dark
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
          <div className="flex flex-col gap-2">
            <strong className="text-xs font-semibold">Brand color</strong>
            <span className="flex items-center gap-2">
              <ColorSwatchPicker
                aria-label="Brand color"
                value={config.brandColor}
                onChange={(brandColor) => update({ brandColor })}
              />
              <code className="text-[11px] text-muted-foreground">{config.brandColor}</code>
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <strong className="text-xs font-semibold">Working overlay gradient</strong>
            <span className="flex items-center gap-2">
              {config.glowColors.map((color, index) => (
                <ColorSwatchPicker
                  key={index}
                  value={color}
                  aria-label={`Gradient stop ${index + 1}`}
                  onChange={(nextColor) => {
                    const glowColors = [...config.glowColors];
                    glowColors[index] = nextColor;
                    update({ glowColors });
                  }}
                />
              ))}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <strong className="text-xs font-semibold">Highlight focused</strong>
            <span className="flex items-center gap-2">
              <ColorSwatchPicker
                aria-label="Highlight focused color"
                value={config.highlightColor}
                onChange={(highlightColor) => update({ highlightColor })}
              />
              <code className="text-[11px] text-muted-foreground">{config.highlightColor}</code>
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <strong className="text-xs font-semibold">Highlight overlay color</strong>
            <span className="flex items-center gap-2">
              <ColorSwatchPicker
                aria-label="Highlight overlay color"
                value={config.highlightOverlayColor}
                onChange={(highlightOverlayColor) => update({ highlightOverlayColor })}
              />
              <code className="text-[11px] text-muted-foreground">
                {config.highlightOverlayColor}
              </code>
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <strong className="text-xs font-semibold">Highlight overlay opacity</strong>
            <span className="flex h-6.5 items-center gap-3">
              <Slider
                aria-label="Highlight overlay opacity"
                className="max-w-44"
                min={0}
                max={1}
                step={0.05}
                value={config.highlightOverlayOpacity}
                onValueChange={(value) =>
                  update({
                    highlightOverlayOpacity: Array.isArray(value) ? (value[0] ?? 0) : value,
                  })
                }
              />
              <code className="text-[11px] text-muted-foreground">
                {config.highlightOverlayOpacity.toFixed(2)}
              </code>
            </span>
          </div>
        </CardPanel>
      </Card>
    </>
  );
}

export default function DevPage() {
  const experience = useWebMCPExperience();
  const progressIndex = useRef(0);
  const runningRef = useRef(false);

  const nextProgress = () => {
    const message = PROGRESS_MESSAGES[progressIndex.current % PROGRESS_MESSAGES.length]!;
    progressIndex.current += 1;
    experience.progress(message);
  };

  const highlightSequence = async () => {
    if (runningRef.current) return;
    runningRef.current = true;
    try {
      experience.startWork("Reviewing each account…");
      for (const target of TARGETS) {
        experience.focus(`#${target.id}`, `Reviewing ${target.name}…`);
        await wait(900);
      }
      experience.endWork("Reviewed 4 accounts");
    } finally {
      runningRef.current = false;
    }
  };

  const runScenario = async () => {
    if (runningRef.current) return;
    runningRef.current = true;
    try {
      experience.startWork("Creating a contact for Jane Doe…", undefined, { overlay: true });
      await wait(1200);
      experience.progress("Checking for duplicates…");
      await wait(1200);
      experience.focus("#dev-target-2", "Attaching to Foxglove Systems…");
      await wait(1400);
      experience.logTask("Added %%name%% as a %%status%%", { name: "Jane Doe", status: "lead" }, {
        icon: "👤",
      });
      experience.endWork("Jane Doe added as a lead");
    } finally {
      runningRef.current = false;
    }
  };

  const SAMPLE_TASKS: Array<[string, Record<string, unknown>, string]> = [
    ["Added %%name%% as a contact", { name: "Bob Porter" }, "👤"],
    ["Created the %%name%% deal with %%company%%", { name: "Renewal", company: "Initech" }, "💼"],
    ["Moved the %%deal%% deal to %%stage%%", { deal: "Brightline", stage: "Won" }, "📈"],
    ["Searched contacts for “%%query%%”", { query: "Halcyon" }, "🔍"],
  ];
  const sampleIndex = useRef(0);

  const logSampleTask = () => {
    const [message, values, icon] = SAMPLE_TASKS[sampleIndex.current % SAMPLE_TASKS.length]!;
    sampleIndex.current += 1;
    experience.logTask(message, values, { icon });
  };

  return (
    <div className="mx-auto w-full max-w-[1220px] px-7 pt-8 pb-12 max-sm:px-4 max-sm:pt-6">
      <div className="mb-6">
        <h1 className="font-heading text-2xl">Dev playground</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Trigger the experience states directly — no agent or MCP bridge required.
        </p>
      </div>

      <DevConfigPanel />

      <Card className="mb-3.5">
        <CardHeader className="border-b p-4.5">
          <CardTitle className="text-[15px] font-normal">Work lifecycle</CardTitle>
          <CardDescription className="text-[13px]">
            Drive the header, badge, and toast by hand.
          </CardDescription>
        </CardHeader>
        <CardPanel className="flex flex-wrap gap-2.5 p-4.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => experience.startWork("Working on something…")}
          >
            Start work
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => experience.startWork("Doing something big…", undefined, { overlay: true })}
          >
            Start work + glow
          </Button>
          <Button variant="outline" size="sm" onClick={nextProgress}>
            Cycle progress text
          </Button>
          <Button variant="outline" size="sm" onClick={() => experience.endWork("All done")}>
            Succeed
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => experience.failWork("Something went wrong")}
          >
            Fail
          </Button>
          <Button variant="outline" size="sm" onClick={() => experience.openOnboarding()}>
            Open onboarding
          </Button>
          <Button variant="outline" size="sm" onClick={logSampleTask}>
            Log a sample task
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              experience.logTask("Could not add %%name%% — duplicate email", { name: "Bob Porter" }, {
                status: "error",
              })
            }
          >
            Log a failed task
          </Button>
        </CardPanel>
      </Card>

      <Card className="mb-3.5">
        <CardHeader className="border-b p-4.5">
          <CardTitle className="text-[15px] font-normal">Scenarios</CardTitle>
          <CardDescription className="text-[13px]">
            Scripted sequences, like a tool call would produce.
          </CardDescription>
        </CardHeader>
        <CardPanel className="flex flex-wrap gap-2.5 p-4.5">
          <Button onClick={runScenario}>Run create-contact demo</Button>
          <Button variant="outline" onClick={highlightSequence}>
            Highlight each target
          </Button>
        </CardPanel>
      </Card>

      <Card>
        <CardHeader className="border-b p-4.5">
          <CardTitle className="text-[15px] font-normal">Focus targets</CardTitle>
          <CardDescription className="text-[13px]">
            Elements the sequences highlight via focus().
          </CardDescription>
        </CardHeader>
        <CardPanel className="grid grid-cols-4 gap-3 p-4.5 max-md:grid-cols-2">
          {TARGETS.map((target) => (
            <Card render={<article />} id={target.id} key={target.id} className="rounded-xl before:rounded-[calc(var(--radius-xl)-1px)]">
              <CardPanel className="flex flex-col gap-1 p-3.5">
                <strong className="text-xs font-semibold">{target.name}</strong>
                <small className="text-[11px] text-muted-foreground">{target.detail}</small>
              </CardPanel>
            </Card>
          ))}
        </CardPanel>
      </Card>
    </div>
  );
}
