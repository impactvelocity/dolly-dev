import type { Metadata } from "next";
import { VideoScenes } from "./scenes";

/*
 * Hidden shoot page for the submission video — not linked from the nav.
 * Each scene is a full-viewport, scroll-snapped frame matching a beat of
 * the video script, ready to screen-record and stitch with voiceover.
 */

export const metadata: Metadata = {
  title: "Dolly — video scenes",
  robots: { index: false, follow: false },
};

export default function VideoPage() {
  return <VideoScenes />;
}
