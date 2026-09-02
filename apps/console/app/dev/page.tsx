"use client";

import { useRef, type ReactNode } from "react";
import {
  BriefcaseIcon,
  SearchIcon,
  TrendingUpIcon,
  UserPlusIcon,
} from "lucide-react";
import { useRig } from "@dolly/rig";

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
  key: keyof Pick<DevConfig, "showHeader" | "showHistory" | "generalLoading">;
  label: string;
  detail: string;
}> = [
  { key: "showHeader", label: "Header", detail: "Full-width status bar at the top." },
  { key: "showHistory", label: "Show history", detail: "Activity affordance + drawer in the header." },
  {
    key: "generalLoading",
    label: "General loading",
    detail: "Glow overlay on every work step, not just opted-in ones.",
  },
];

function DevConfigPanel() {
  const { config, update, reset } = useDevConfig();

  return (
    <>
      <Card className="mb-3.5">
        <CardHeader className="border-b p-4.5">
          <CardTitle className="text-[15px] font-normal">Toggles</CardTitle>
          <CardDescription className="text-[13px]">
            Turn each rig surface on or off. Saved to localStorage.
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
                <strong className="text-xs font-medium">{toggle.label}</strong>
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
            Colors and mode for every rig surface.
          </CardDescription>
        </CardHeader>
        <CardPanel className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-x-5 gap-y-3.5 p-4.5">
          <div className="flex flex-col gap-2">
            <strong className="text-xs font-medium">Mode</strong>
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
            <strong className="text-xs font-medium">Brand color</strong>
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
            <strong className="text-xs font-medium">Working overlay gradient</strong>
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
            <strong className="text-xs font-medium">Highlight focused</strong>
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
            <strong className="text-xs font-medium">Highlight overlay color</strong>
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
            <strong className="text-xs font-medium">Highlight overlay opacity</strong>
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
  const rig = useRig();
  const progressIndex = useRef(0);
  const runningRef = useRef(false);

  const progressEndTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const nextProgress = () => {
    const message = PROGRESS_MESSAGES[progressIndex.current % PROGRESS_MESSAGES.length]!;
    progressIndex.current += 1;
    // progress() is a no-op unless work is running, so kick work off first.
    if (rig.snapshot.phase !== "working") {
      rig.startWork(message);
    } else {
      rig.progress(message);
    }
    // Settle 2s after the last click; clicking again keeps the run alive.
    if (progressEndTimer.current) clearTimeout(progressEndTimer.current);
    progressEndTimer.current = setTimeout(() => rig.endWork("All done"), 2000);
  };

  const highlightSequence = async () => {
    if (runningRef.current) return;
    runningRef.current = true;
    try {
      rig.startWork("Reviewing each account…");
      for (const target of TARGETS) {
        rig.focus(`#${target.id}`, `Reviewing ${target.name}…`);
        await wait(900);
      }
      rig.endWork("Reviewed 4 accounts");
    } finally {
      runningRef.current = false;
    }
  };

  const SAMPLE_TASKS: Array<[string, Record<string, unknown>, ReactNode]> = [
    ["Added %%name%% as a contact", { name: "Bob Porter" }, <UserPlusIcon key="contact" size={13} strokeWidth={1.8} />],
    ["Created the %%name%% deal with %%company%%", { name: "Renewal", company: "Initech" }, <BriefcaseIcon key="deal" size={13} strokeWidth={1.8} />],
    ["Moved the %%deal%% deal to %%stage%%", { deal: "Brightline", stage: "Won" }, <TrendingUpIcon key="stage" size={13} strokeWidth={1.8} />],
    ["Searched contacts for “%%query%%”", { query: "Halcyon" }, <SearchIcon key="search" size={13} strokeWidth={1.8} />],
  ];
  const sampleIndex = useRef(0);

  const logSampleTask = () => {
    const [message, values, icon] = SAMPLE_TASKS[sampleIndex.current % SAMPLE_TASKS.length]!;
    sampleIndex.current += 1;
    rig.logTask(message, values, { icon });
  };

  return (
    <div className="mx-auto w-full max-w-[1220px] px-7 pt-8 pb-12 max-sm:px-4 max-sm:pt-6">
      <div className="mb-6">
        <h1 className="font-heading text-[28px]">Dev playground</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Trigger the rig states directly — no agent or MCP bridge required.
        </p>
      </div>

      <DevConfigPanel />

      <Card className="mb-3.5">
        <CardHeader className="border-b p-4.5">
          <CardTitle className="text-[15px] font-normal">Demo actions</CardTitle>
          <CardDescription className="text-[13px]">
            Drive the header, badge, and toast by hand.
          </CardDescription>
        </CardHeader>
        <CardPanel className="flex flex-wrap gap-2.5 p-4.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              rig.startWork("Working on something…");
              setTimeout(() => rig.endWork("All done"), 2000);
            }}
          >
            Start work
          </Button>
          {/* Start work + glow hidden for now — the glow is covered by the
              General loading toggle.
          <Button
            variant="outline"
            size="sm"
            onClick={() => rig.startWork("Doing something big…", undefined, { overlay: true })}
          >
            Start work + glow
          </Button> */}
          <Button variant="outline" size="sm" onClick={highlightSequence}>
            Highlight each target
          </Button>
          <Button variant="outline" size="sm" onClick={nextProgress}>
            Cycle progress text
          </Button>
          <Button variant="outline" size="sm" onClick={() => rig.endWork("All done")}>
            Succeed
          </Button>
          {/* Fail button hidden for now — failWork has no visible effect yet.
          <Button
            variant="outline"
            size="sm"
            onClick={() => rig.failWork("Something went wrong")}
          >
            Fail
          </Button> */}
          <Button variant="outline" size="sm" onClick={() => rig.openOnboarding()}>
            Open onboarding
          </Button>
          <Button variant="outline" size="sm" onClick={logSampleTask}>
            Log a sample task
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              rig.logTask("Could not add %%name%% — duplicate email", { name: "Bob Porter" }, {
                status: "error",
              })
            }
          >
            Log a failed task
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
                <strong className="text-xs font-medium">{target.name}</strong>
                <small className="text-[11px] text-muted-foreground">{target.detail}</small>
              </CardPanel>
            </Card>
          ))}
        </CardPanel>
      </Card>
    </div>
  );
}
