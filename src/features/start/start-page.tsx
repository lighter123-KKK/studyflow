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
        <h1>Start</h1>
        <p>See what’s due and what’s coming up in one planner.</p>
      </header>

      <section className="card mt-3" aria-labelledby="file-to-schedule">
        <div className="card-body p-4">
          <div className="d-flex align-items-center gap-2 mb-2">
            <IconFileUpload className="icon text-blue" aria-hidden="true" />
            <h2 className="h2 mb-0" id="file-to-schedule">Turn files into schedules</h2>
          </div>
          <p className="mb-3">
            <strong>
              StudyFlow puts the dates from your classes and everyday life in one place.
              You can sync your CityU Canvas deadlines, add a date by hand, or upload a file.
              Got dates in a WhatsApp screenshot, an email attachment, or a photo of a noticeboard?
              Upload the file and StudyFlow can pick out several deadlines and events at once.
              That saves you from typing them one by one and lets you manage them all in one task list and calendar.
            </strong>
          </p>
          <p className="text-secondary mb-0">
            The standard way to add a personal event in Canvas is to fill in an event form.
            StudyFlow adds the option to read dates directly from your files.{" "}
            <a href="https://community.instructure.com/en/kb/articles/662788-how-do-i-add-an-event-to-my-personal-calendar">
              Canvas personal calendar guide
            </a>
          </p>
        </div>
      </section>

      <section className="study-start-options" aria-label="Ways to add a schedule">
        <article className="study-start-card">
          <span className="study-stat-icon bg-blue-lt text-blue" aria-hidden="true"><IconFileUpload className="icon" /></span>
          <h2>Upload files</h2>
          <p>Pick a PDF or image. StudyFlow adds clear dates and lets you review anything uncertain.</p>
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
          <h2>Add a date yourself</h2>
          <p>Type a name and pick a date for an appointment, assignment, or event.</p>
          <button className="btn btn-outline-primary study-start-action" type="button"
            onClick={() => openTask(undefined, () => router.push("/tasks"))}>
            Add schedule <IconArrowRight className="icon" aria-hidden="true" />
          </button>
        </article>

        <article className="study-start-card">
          <span className="study-stat-icon bg-purple-lt text-purple" aria-hidden="true"><IconSchool className="icon" /></span>
          <h2>Sync Canvas</h2>
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
