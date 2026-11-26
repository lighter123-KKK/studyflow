"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { IconArrowRight, IconCalendarMonth, IconChecklist, IconFileUpload, IconPencil, IconSchool } from "@tabler/icons-react";
import { useAcademic } from "@/context/academic-context";
import { IMPORT_FORMATS_LABEL, MAX_IMPORT_BYTES, MAX_IMPORT_FILES, MAX_PRESENTATION_IMPORT_BYTES } from "@/lib/task-import";

export function StartPage() {
  const { openTask, presentation } = useAcademic();
  const router = useRouter();
  const megabytesPerFile = (presentation ? MAX_PRESENTATION_IMPORT_BYTES : MAX_IMPORT_BYTES) / (1024 * 1024);

  return (
    <main className="container-xl study-start">
      <header className="study-start-intro">
        <h1>All your dates in one place</h1>
        <p>Choose how to add an assignment, deadline or event to your planner.</p>
      </header>

      <section className="study-start-options" aria-label="Ways to add a schedule">
        <article className="study-start-card">
          <span className="study-stat-icon bg-blue-lt text-blue" aria-hidden="true"><IconFileUpload className="icon" /></span>
          <h2>Upload a file</h2>
          <p>Find dates in a screenshot, photo or document without typing them in.</p>
          <p className="study-start-formats">
            <strong>{IMPORT_FORMATS_LABEL}</strong>
            <span>Up to {MAX_IMPORT_FILES} files at once, {megabytesPerFile} MB per file and {megabytesPerFile * MAX_IMPORT_FILES} MB total.</span>
          </p>
          <Link className="btn btn-primary study-start-action" href="/import">
            Upload files <IconArrowRight className="icon" aria-hidden="true" />
          </Link>
        </article>

        <article className="study-start-card">
          <span className="study-stat-icon bg-teal-lt text-teal" aria-hidden="true"><IconPencil className="icon" /></span>
          <h2>Add a schedule manually</h2>
          <p>Enter a name and date for an assignment, appointment or event.</p>
          <button className="btn btn-outline-primary study-start-action" type="button"
            onClick={() => openTask(undefined, () => router.push("/tasks"))}>
            Add schedule <IconArrowRight className="icon" aria-hidden="true" />
          </button>
        </article>

        <article className="study-start-card">
          <span className="study-stat-icon bg-purple-lt text-purple" aria-hidden="true"><IconSchool className="icon" /></span>
          <h2>Connect CityU Canvas</h2>
          <p>Use your own Canvas access token to pull in your latest course assignments and deadlines.</p>
          <Link className="btn btn-outline-primary study-start-action" href="/connect">
            {presentation?.connected ? "Manage Canvas sync" : "Connect Canvas"} <IconArrowRight className="icon" aria-hidden="true" />
          </Link>
        </article>
      </section>

      <nav className="study-start-planner" aria-label="Open your planner">
        <p>{presentation ? "Just looking? Try two editable examples in My Tasks." : "Open your planner to see what’s coming up."}</p>
        <div className="d-flex flex-wrap gap-2">
          <Link className="btn btn-outline-secondary" href="/tasks"><IconChecklist className="icon" aria-hidden="true" /> My Tasks</Link>
          <Link className="btn btn-outline-secondary" href="/calendar"><IconCalendarMonth className="icon" aria-hidden="true" /> Calendar</Link>
        </div>
      </nav>
    </main>
  );
}
