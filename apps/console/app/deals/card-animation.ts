import type { AutoAnimationPlugin } from "@formkit/auto-animate";

// While dnd-kit has a drag in flight (including a short settle window after
// drop), auto-animate must not animate the board: its enter/exit animations
// fight dnd-kit's drop animation, and any animation canceled mid-flight
// strands its exit ghost in the DOM forever. Disabling via enable()/disable()
// races the MutationObserver, so instead this plugin returns zero-duration
// animations during a drag — they still finish, so auto-animate's cleanup
// (ghost removal, coordinate bookkeeping) always runs.
let dndInFlight = false;

export function setDndInFlight(value: boolean): void {
  dndInFlight = value;
}

const instant = (el: Element) => new KeyframeEffect(el, [], { duration: 0 });

// Mirrors auto-animate's default add/remove/remain animations (250ms base).
export const dndAwareCardAnimation: AutoAnimationPlugin = (el, action, coordsA, coordsB) => {
  if (dndInFlight) return instant(el);

  if (action === "add") {
    return new KeyframeEffect(
      el,
      [
        { transform: "scale(.98)", opacity: 0 },
        { transform: "scale(.98)", opacity: 0, offset: 0.5 },
        { transform: "scale(1)", opacity: 1 },
      ],
      { duration: 375, easing: "ease-in" },
    );
  }

  if (action === "remove") {
    return new KeyframeEffect(
      el,
      [
        { transform: "scale(1)", opacity: 1 },
        { transform: "scale(.98)", opacity: 0 },
      ],
      { duration: 250, easing: "ease-out" },
    );
  }

  // remain: auto-animate passes (el, "remain", oldCoords, newCoords).
  if (!coordsA || !coordsB) return instant(el);
  const deltaX = coordsA.left - coordsB.left;
  const deltaY = coordsA.top - coordsB.top;
  return new KeyframeEffect(
    el,
    [{ transform: `translate(${deltaX}px, ${deltaY}px)` }, { transform: "translate(0, 0)" }],
    { duration: 250, easing: "ease-in-out" },
  );
};
