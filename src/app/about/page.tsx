import type { Metadata } from "next";
import Link from "next/link";
import { IconCalendarMonth, IconFileUpload, IconPencil, IconSchool } from "@tabler/icons-react";

export const metadata: Metadata = {
  title: "About StudyFlow",
  description: "See how StudyFlow brings Canvas deadlines, files and personal events into one planner.",
};

export default function AboutPage() {
  return (
    <main className="container-xl study-start">
      <header className="study-start-intro">
        <h1>What StudyFlow can do</h1>
        <p>See what’s due and what’s coming up in one planner.</p>
      </header>

      <section className="card mt-3" aria-labelledby="about-difference">
        <div className="card-body p-4">
          <div className="d-flex align-items-center gap-2 mb-2">
            <IconFileUpload className="icon text-blue" aria-hidden="true" />
            <h2 className="h2 mb-0" id="about-difference">Turn files into schedules</h2>
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

      <section className="study-start-options" aria-label="What you can do in StudyFlow">
        <article className="study-start-card">
          <span className="study-stat-icon bg-blue-lt text-blue" aria-hidden="true"><IconFileUpload className="icon" /></span>
          <h2>Upload files</h2>
          <p>Pick a PDF or image. StudyFlow adds clear dates and lets you review anything uncertain.</p>
          <Link className="btn btn-primary study-start-action" href="/import">Upload files</Link>
        </article>
        <article className="study-start-card">
          <span className="study-stat-icon bg-teal-lt text-teal" aria-hidden="true"><IconPencil className="icon" /></span>
          <h2>Add a date yourself</h2>
          <p>Type a name and pick a date for an appointment, assignment, or event.</p>
          <Link className="btn btn-outline-primary study-start-action" href="/tasks">Open My Tasks</Link>
        </article>
        <article className="study-start-card">
          <span className="study-stat-icon bg-purple-lt text-purple" aria-hidden="true"><IconSchool className="icon" /></span>
          <h2>Sync Canvas</h2>
          <p>Connect your CityU Canvas account if you want to bring in your course assignments and deadlines.</p>
          <Link className="btn btn-outline-primary study-start-action" href="/connect">Connect Canvas</Link>
        </article>
      </section>

      <nav className="study-start-planner" aria-label="Explore StudyFlow">
        <Link className="btn btn-outline-secondary" href="/">Back to Start</Link>
        <Link className="btn btn-outline-secondary" href="/calendar">
          <IconCalendarMonth className="icon" aria-hidden="true" /> Open Calendar
        </Link>
      </nav>
    </main>
  );
}
