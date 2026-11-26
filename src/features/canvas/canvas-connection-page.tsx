"use client";

import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { useAcademic } from "@/context/academic-context";

export function CanvasConnectionPage() {
  const { presentation, canvasSync, syncCanvas } = useAcademic();
  const needsToken = presentation && !presentation.connected;

  return (
    <main className="page-body">
      <div className="container-xl">
        <PageHeader title="Connect CityU Canvas" description="Bring your latest Canvas assignments into My Tasks and Calendar." eyebrow="Optional" />
        <section className="card study-connect-card" aria-label="Canvas sync">
          <div className="card-body">
            {canvasSync.message ? <div className="alert alert-warning" role="alert">{canvasSync.message}</div> : null}
            {needsToken ? (
              <>
                <details className="mb-3">
                  <summary className="fw-semibold">Where do I get a Canvas access token?</summary>
                  <ol className="mt-2 mb-0 ps-4">
                    <li>Open <a href="https://canvas.cityu.edu.hk/" target="_blank" rel="noreferrer">CityU Canvas</a> and sign in.</li>
                    <li>Go to <strong>Account → Settings</strong>. Under <strong>Approved Integrations</strong>, select <strong>New Access Token</strong>.</li>
                    <li>Copy the token Canvas shows you and paste it into the field below.</li>
                  </ol>
                </details>
                <form autoComplete="off" onSubmit={(event) => {
                  event.preventDefault();
                  const token = String(new FormData(event.currentTarget).get("token") ?? "").trim();
                  if (token) void presentation.connect(token);
                }}>
                  <label className="form-label" htmlFor="canvas-token">Canvas access token</label>
                  <input className="form-control mb-3" id="canvas-token" name="token" type="password"
                    autoComplete="off" maxLength={512} required spellCheck={false} />
                  <button type="submit" className="btn btn-primary" disabled={canvasSync.busy}>
                    {canvasSync.busy ? "Syncing Canvas…" : "Connect and sync"}
                  </button>
                </form>
              </>
            ) : (
              <>
                {canvasSync.syncedAt ? (
                  <p role="status">Your Canvas assignments are now in your planner.</p>
                ) : (
                  <p className="text-secondary">Sync Canvas with the token set up for this local copy.</p>
                )}
                <div className="d-flex flex-wrap gap-2">
                  <Link className="btn btn-primary" href="/tasks">View My Tasks</Link>
                  <button type="button" className="btn btn-outline-primary" disabled={canvasSync.busy}
                    onClick={() => { void syncCanvas(); }}>
                    {canvasSync.busy ? "Syncing Canvas…" : "Sync Canvas again"}
                  </button>
                </div>
              </>
            )}
          </div>
        </section>
        <Link className="btn btn-ghost-secondary mt-3" href="/">Back to Start</Link>
      </div>
    </main>
  );
}
