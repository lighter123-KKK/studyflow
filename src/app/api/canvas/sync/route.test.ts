// @vitest-environment node

import { afterEach, expect, it, vi } from "vitest";
import { loadCanvasWorkspace } from "@/lib/canvas-server";
import { POST } from "./route";

vi.mock("@/lib/canvas-server", () => ({ loadCanvasWorkspace: vi.fn() }));

afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllEnvs();
});

it("uses only the visitor's token on an HTTPS request from the presentation site", async () => {
  const origin = "https://studyflow-presentation.example";
  vi.stubEnv("STUDYFLOW_DEMO_ORIGIN", origin);
  vi.stubEnv("STUDYFLOW_DEMO_CODE", "test-code");
  vi.stubEnv("CANVAS_ACCESS_TOKEN", "other-token");
  vi.mocked(loadCanvasWorkspace).mockResolvedValue({
    version: 1, currentMemberId: "", courses: [], members: [], projects: [], tasks: [],
  });
  const submit = (address: string, token?: string) => POST(new Request(`${origin}/api/canvas/sync`, {
    method: "POST",
    headers: { Origin: address, "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  }));
  expect((await submit("https://elsewhere.example", "presenter-token")).status).toBe(403);
  expect((await submit(origin)).status).toBe(400);
  expect(loadCanvasWorkspace).not.toHaveBeenCalled();
  const result = await submit(origin, "presenter-token");
  expect(result.status).toBe(200);
  expect(result.headers.get("Cache-Control")).toBe("no-store");
  expect(await result.text()).not.toContain("presenter-token");
  expect(loadCanvasWorkspace).toHaveBeenCalledExactlyOnceWith("presenter-token");
});
