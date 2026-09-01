"use client";

import { PipetteIcon } from "lucide-react";
import { ColorPicker } from "react-beautiful-color";

import { Popover, PopoverPopup, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

/**
 * A color swatch that opens a react-beautiful-color picker in a popover.
 * Controlled by a hex string, mirroring the native `<input type="color">`
 * contract it replaces.
 */
export function ColorSwatchPicker({
  value,
  onChange,
  className,
  "aria-label": ariaLabel,
}: {
  value: string;
  onChange: (hex: string) => void;
  className?: string;
  "aria-label"?: string;
}) {
  return (
    <Popover>
      <PopoverTrigger
        aria-label={ariaLabel ?? "Pick a color"}
        className={cn(
          "h-6.5 w-8.5 shrink-0 cursor-pointer rounded-md border bg-background p-0.5 shadow-xs/5 outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background",
          className,
        )}
      >
        <span
          aria-hidden
          className="block size-full rounded-[calc(var(--radius-md)-2px)] border border-black/8"
          style={{ backgroundColor: value }}
        />
      </PopoverTrigger>
      <PopoverPopup className="w-60 p-2">
        <ColorPicker
          color={{ type: "hex", value }}
          onChange={(color) => onChange(color.getHex())}
          className="flex h-auto w-full flex-col rounded-none bg-transparent shadow-none"
        >
          <ColorPicker.Saturation className="mb-2.5 h-36 w-full rounded-lg" />
          <div className="flex items-center gap-2.5">
            <ColorPicker.EyeDropper className="rounded-md text-foreground hover:bg-accent">
              <PipetteIcon className="size-4" />
            </ColorPicker.EyeDropper>
            <ColorPicker.Hue className="h-3.5 flex-1" />
          </div>
        </ColorPicker>
      </PopoverPopup>
    </Popover>
  );
}
