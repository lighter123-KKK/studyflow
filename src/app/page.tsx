import type { Metadata } from "next";
import { StartPage } from "@/features/start/start-page";

export const metadata: Metadata = { title: "Start" };

export default function HomePage() {
  return <StartPage />;
}
