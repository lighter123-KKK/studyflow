import { CanvasRequestError, loadCanvasWorkspace } from "@/lib/canvas-server";
import { isDemoPost, isLocalPost } from "@/lib/local-request";

function json(body: unknown, status = 200) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  let token: string | undefined;
  if (process.env.STUDYFLOW_DEMO_ORIGIN) {
    if (!isDemoPost(request)) return json({ message: "Check the presentation access code and website address." }, 403);
    const supplied = (await request.json().catch(() => null))?.token;
    if (typeof supplied !== "string" || !/^[!-~]{1,512}$/.test(supplied)) {
      return json({ message: "Enter your Canvas access token." }, 400);
    }
    token = supplied;
  } else {
    if (!isLocalPost(request)) return json({ message: "Open the local StudyFlow address to sync Canvas." }, 403);
    token = process.env.CANVAS_ACCESS_TOKEN?.trim();
    if (!token) return json({ message: "Set CANVAS_ACCESS_TOKEN in .env.local and restart StudyFlow." }, 503);
  }

  try {
    return json({ state: await loadCanvasWorkspace(token), syncedAt: new Date().toISOString() });
  } catch (error) {
    if (error instanceof CanvasRequestError && error.status === 401) {
      return json({ message: "Canvas rejected the token. Check whether it expired or was revoked." }, 401);
    }
    const message = error instanceof CanvasRequestError
      ? `Canvas returned HTTP ${error.status}. Your last successful sync is still displayed.`
      : "Canvas sync could not finish. Check your connection and try again.";
    return json({ message }, 502);
  }
}
