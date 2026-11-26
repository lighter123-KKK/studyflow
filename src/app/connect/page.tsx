import type { Metadata } from "next";
import { CanvasConnectionPage } from "@/features/canvas/canvas-connection-page";

export const metadata: Metadata = { title: "Connect Canvas" };

export default function ConnectRoute() {
  return <CanvasConnectionPage />;
}
